import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [claimsForMyItems, setClaimsForMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [itemsRes, claimsForMeRes, myClaimsRes] = await Promise.all([
        API.get('/items/me'),
        API.get('/claims/for-my-items'),
        API.get('/claims/my-claims')
      ]);
      setMyItems(itemsRes.data.data);
      setClaimsForMyItems(claimsForMeRes.data.data);
      setMyClaims(myClaimsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimStatus = async (claimId, status) => {
    try {
      await API.patch(`/claims/${claimId}`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating claim:', error);
      alert('Failed to update claim');
    }
  };

  const handleMarkReturned = async (itemId) => {
    try {
      await API.put(`/items/${itemId}`, { status: 'returned' });
      fetchData();
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Dashboard...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>My Dashboard</h1>

      <div style={styles.grid}>
        <div style={styles.column}>
          <h2 style={styles.sectionTitle}>My Posted Items</h2>
          {myItems.length === 0 ? (
            <p style={styles.emptyText}>You haven't posted any items yet.</p>
          ) : (
            <div style={styles.list}>
              {myItems.map(item => (
                <div key={item._id} style={styles.card}>
                  <div>
                    <h3 style={styles.cardTitle}>{item.title}</h3>
                    <p style={styles.cardSubtitle}>Type: {item.type} | Status: {item.status}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {item.status !== 'returned' && (
                      <button onClick={() => handleMarkReturned(item._id)} style={styles.btnSmall}>Mark Returned</button>
                    )}
                    <Link to={`/item/${item._id}`} style={styles.link}>View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.column}>
          <h2 style={styles.sectionTitle}>Claims on My Items</h2>
          {claimsForMyItems.length === 0 ? (
            <p style={styles.emptyText}>No claims have been made on your items.</p>
          ) : (
            <div style={styles.list}>
              {claimsForMyItems.map(claim => (
                <div key={claim._id} style={styles.cardCol}>
                  <h3 style={styles.cardTitle}>Item: {claim.itemId?.title}</h3>
                  <p style={styles.cardSubtitle}>Claimant: {claim.claimantId?.name}</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Answer to claim question: <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{claim.answer}</span></p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.2rem', color: '#64748b' }}>Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{claim.status}</span></p>
                  
                  {claim.status === 'pending' && (
                    <div style={styles.buttonGroup}>
                      <button onClick={() => handleClaimStatus(claim._id, 'approved')} style={styles.btnApprove}>Approve</button>
                      <button onClick={() => handleClaimStatus(claim._id, 'rejected')} style={styles.btnReject}>Reject</button>
                    </div>
                  )}
                  {claim.status === 'approved' && (
                    <div style={{ marginTop: '1rem' }}>
                      <Link to={`/item/${claim.itemId?._id}`} style={styles.link}>Message Claimant</Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={styles.sectionTitle}>My Claims</h2>
        {myClaims.length === 0 ? (
          <p style={styles.emptyText}>You haven't made any claims.</p>
        ) : (
          <div style={styles.claimsGrid}>
            {myClaims.map(claim => (
              <div key={claim._id} style={styles.cardCol}>
                <h3 style={styles.cardTitle}>{claim.itemId?.title}</h3>
                <p style={styles.cardSubtitle}>
                  Status: <span style={{ fontWeight: 'bold', textTransform: 'capitalize', color: claim.status === 'approved' ? '#10b981' : claim.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>{claim.status}</span>
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <Link to={`/item/${claim.itemId?._id}`} style={styles.link}>View Item & Messages</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  pageTitle: { fontSize: '2rem', marginBottom: '2rem', color: '#0f172a' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  column: { display: 'flex', flexDirection: 'column' },
  sectionTitle: { fontSize: '1.4rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#1e293b' },
  emptyText: { color: '#64748b', fontStyle: 'italic' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardCol: { border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '1.1rem', marginBottom: '0.2rem', color: '#0f172a' },
  cardSubtitle: { fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' },
  link: { color: '#0284c7', textDecoration: 'none', fontWeight: '500' },
  buttonGroup: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  btnApprove: { backgroundColor: '#10b981', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', fontWeight: 'bold' },
  btnReject: { backgroundColor: '#ef4444', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', fontWeight: 'bold' },
  btnSmall: { backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' },
  claimsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' },
};

export default Dashboard;
