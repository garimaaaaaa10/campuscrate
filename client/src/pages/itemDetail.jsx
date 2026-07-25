import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/authContext';
import { MapPin, Tag, Calendar, User, CheckCircle, ArrowLeft, Send, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claimStatus, setClaimStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchItem();
    if (user) fetchMessages();
  }, [id, user]);

  const fetchItem = async () => {
    try {
      const res = await API.get(`/items/${id}`);
      setItem(res.data.data);
    } catch (err) {
      console.error('Failed to load item:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${id}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const receiverId = item.user._id; 
      const res = await API.post('/messages', {
        itemId: id,
        receiverId,
        text: newMessage
      });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleReportAbuse = async () => {
    const reason = prompt('Please provide a reason for reporting this item:');
    if (reason) {
      try {
        await API.post('/admin/report', { reportedItemId: id, reason });
        alert('Report submitted successfully.');
      } catch (err) {
        alert('Failed to submit report');
      }
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setClaimStatus('submitting');
    setErrorMsg('');

    try {
      await API.post('/claims', {
        itemId: id,
        answer: claimAnswer,
      });
      setClaimStatus('success');
      setClaimAnswer('');
    } catch (err) {
      setClaimStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to submit claim');
    }
  };

  if (loading) return <div style={styles.center}>Loading item details...</div>;
  if (!item) return <div style={styles.center}>Item not found.</div>;

  const isOwner = user && item.user && (user.id === item.user._id || user._id === item.user._id);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        <ArrowLeft size={18} style={{ marginRight: '6px' }} />
        Back to Dashboard
      </button>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <span style={item.type === 'lost' ? styles.badgeLost : styles.badgeFound}>
              {item.type.toUpperCase()}
            </span>
            <h1 style={styles.title}>{item.title}</h1>
          </div>

          {item.status === 'returned' && (
            <span style={styles.badgeReturned}>
              <CheckCircle size={16} style={{ marginRight: '4px' }} />
              RETURNED
            </span>
          )}
          
          <button onClick={handleReportAbuse} style={styles.reportBtn}>
            Report Abuse
          </button>
        </div>

        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.title} style={styles.image} />
        )}

        <div style={styles.infoGrid}>
          <div style={styles.infoRow}>
            <Tag size={18} color="#0284c7" />
            <div>
              <strong style={styles.infoLabel}>Category</strong>
              <div>{item.category}</div>
            </div>
          </div>

          <div style={styles.infoRow}>
            <MapPin size={18} color="#0284c7" />
            <div>
              <strong style={styles.infoLabel}>Location</strong>
              <div>{item.location}</div>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Calendar size={18} color="#0284c7" />
            <div>
              <strong style={styles.infoLabel}>Date Reported</strong>
              <div>{new Date(item.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={styles.infoRow}>
            <User size={18} color="#0284c7" />
            <div>
              <strong style={styles.infoLabel}>Posted By</strong>
              <div>{item.user?.name || 'Anonymous Student'}</div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h3>Description</h3>
          <p style={styles.description}>{item.description}</p>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={20} color="#0f172a" /> Item QR Code
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', textAlign: 'center' }}>
            Print this code and attach it to your physical item so anyone who finds it can easily scan and report it.
          </p>
          <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <QRCode value={`${window.location.origin}/item/${item._id}`} size={150} />
          </div>
        </div>

        {item.status !== 'returned' && !isOwner && (
          <div style={styles.claimBox}>
            <h3 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>
              Claim or Identify This Item
            </h3>
            {item.claimQuestion ? (
              <p style={styles.question}>
                <strong>Verification Question from Poster:</strong> {item.claimQuestion}
              </p>
            ) : (
              <p style={styles.question}>
                Provide details proving this item belongs to you (or state where you can meet to return it).
              </p>
            )}

            {claimStatus === 'success' ? (
              <div style={styles.successBox}>
                <CheckCircle size={20} color="#10b981" />
                <span>Your claim answer has been submitted to the poster!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitClaim} style={styles.claimForm}>
                {claimStatus === 'error' && <div style={styles.errorBox}>{errorMsg}</div>}

                <input
                  type="text"
                  placeholder="Type your verification answer here..."
                  value={claimAnswer}
                  onChange={(e) => setClaimAnswer(e.target.value)}
                  required
                  style={styles.claimInput}
                />

                <button
                  type="submit"
                  disabled={claimStatus === 'submitting'}
                  style={styles.claimBtn}
                >
                  <Send size={16} style={{ marginRight: '6px' }} />
                  {claimStatus === 'submitting' ? 'Submitting...' : 'Submit Claim'}
                </button>
              </form>
            )}
          </div>
        )}

        {user && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Messages</h3>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', maxHeight: '16rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>No messages yet. Send a message to clarify details!</p>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderId?._id === user._id || msg.senderId?.id === user.id;
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{msg.senderId?.name}</span>
                      <div style={{ padding: '0.5rem 1rem', borderRadius: '8px', maxWidth: '80%', backgroundColor: isMine ? '#2563eb' : '#e5e7eb', color: isMine ? '#ffffff' : '#1f2937' }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type a message..."
                style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.5rem 1rem' }}
                required
              />
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', border: 'none' }}>Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#0284c7',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.4rem',
    color: '#0f172a',
    margin: 0,
  },
  badgeLost: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  badgeFound: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  badgeReturned: {
    backgroundColor: '#64748b',
    color: '#fff',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '1.2rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  infoLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    display: 'block',
  },
  section: {
    marginBottom: '1.5rem',
  },
  description: {
    color: '#334155',
    lineHeight: '1.6',
    fontSize: '1rem',
  },
  claimBox: {
    borderTop: '2px solid #e2e8f0',
    paddingTop: '1.5rem',
    marginTop: '1.5rem',
  },
  question: {
    color: '#475569',
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  claimForm: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
  },
  claimInput: {
    flex: 1,
    minWidth: '240px',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
  },
  claimBtn: {
    backgroundColor: '#0284c7',
    color: '#fff',
    padding: '0.75rem 1.2rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    padding: '1rem',
    borderRadius: '6px',
    fontWeight: '500',
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '0.6rem',
    borderRadius: '6px',
    marginBottom: '0.5rem',
  },
  center: {
    textAlign: 'center',
    padding: '4rem',
    color: '#64748b',
    fontSize: '1.2rem',
  },
  reportBtn: {
    marginLeft: '1rem',
    fontSize: '0.75rem',
    color: '#ef4444',
    border: '1px solid #fca5a5',
    backgroundColor: 'transparent',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};