import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ userCount: 0, itemCount: 0, reportCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === 'Abhinandan_is_the_greatest') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setAuthError('Incorrect admin password');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes] = await Promise.all([
        API.get('/admin/reports'),
        API.get('/admin/stats')
      ]);
      setReports(reportsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId, action, reportedItemId = null, reportedUserId = null) => {
    try {
      if (action === 'dismiss') {
        await API.put(`/admin/reports/${reportId}`, { status: 'dismissed' });
      } else if (action === 'deleteItem' && reportedItemId) {
        await API.delete(`/admin/items/${reportedItemId}`);
        await API.put(`/admin/reports/${reportId}`, { status: 'reviewed' });
      } else if (action === 'blockUser' && reportedUserId) {
        await API.put(`/admin/users/${reportedUserId}/block`, { blocked: true });
        await API.put(`/admin/reports/${reportId}`, { status: 'reviewed' });
      }
      fetchData();
    } catch (error) {
      console.error('Error handling report action:', error);
      alert('Action failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>Admin Authentication</h2>
        <form onSubmit={handleAuth}>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          {authError && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{authError}</p>}
          <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Verify
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Admin Dashboard...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Admin Dashboard</h1>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statBox, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
          <h2 style={styles.statNumber}>{stats.userCount}</h2>
          <p style={styles.statLabel}>Total Users</p>
        </div>
        <div style={{ ...styles.statBox, backgroundColor: '#dcfce7', color: '#166534' }}>
          <h2 style={styles.statNumber}>{stats.itemCount}</h2>
          <p style={styles.statLabel}>Total Items</p>
        </div>
        <div style={{ ...styles.statBox, backgroundColor: '#fee2e2', color: '#991b1b' }}>
          <h2 style={styles.statNumber}>{stats.reportCount}</h2>
          <p style={styles.statLabel}>Pending Reports</p>
        </div>
      </div>

      <div>
        <h2 style={styles.sectionTitle}>Abuse Reports</h2>
        {reports.length === 0 ? (
          <p style={styles.emptyText}>No reports found.</p>
        ) : (
          <div style={styles.list}>
            {reports.map(report => (
              <div key={report._id} style={{ ...styles.card, ...(report.status === 'pending' ? styles.cardPending : {}) }}>
                <div style={styles.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <p style={styles.reporterText}>Reported by: {report.reporterId?.name} ({report.reporterId?.email})</p>
                    <p style={styles.reasonText}>Reason: {report.reason}</p>
                    {report.reportedItemId && (
                      <p style={styles.detailText}>Item: {report.reportedItemId.title}</p>
                    )}
                    {report.reportedUserId && (
                      <p style={styles.detailText}>User: {report.reportedUserId.name} ({report.reportedUserId.email})</p>
                    )}
                    <p style={styles.statusText}>Status: {report.status}</p>
                  </div>
                  
                  {report.status === 'pending' && (
                    <div style={styles.actionGroup}>
                      <button onClick={() => handleReportAction(report._id, 'dismiss')} style={styles.btnDismiss}>Dismiss</button>
                      {report.reportedItemId && (
                        <button onClick={() => handleReportAction(report._id, 'deleteItem', report.reportedItemId._id)} style={styles.btnWarning}>Delete Item</button>
                      )}
                      {report.reportedUserId && (
                        <button onClick={() => handleReportAction(report._id, 'blockUser', null, report.reportedUserId._id)} style={styles.btnDanger}>Block User</button>
                      )}
                    </div>
                  )}
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  statBox: { padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  statNumber: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.2rem' },
  statLabel: { fontSize: '0.9rem', fontWeight: '500' },
  sectionTitle: { fontSize: '1.4rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#1e293b' },
  emptyText: { color: '#64748b', fontStyle: 'italic' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardPending: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  reporterText: { fontSize: '0.85rem', color: '#64748b' },
  reasonText: { fontSize: '1rem', fontWeight: '500', marginTop: '0.5rem', marginBottom: '0.5rem' },
  detailText: { fontSize: '0.9rem', color: '#334155' },
  statusText: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', textTransform: 'capitalize' },
  actionGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' },
  btnDismiss: { backgroundColor: '#64748b', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  btnWarning: { backgroundColor: '#ea580c', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDanger: { backgroundColor: '#dc2626', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }
};

export default AdminDashboard;
