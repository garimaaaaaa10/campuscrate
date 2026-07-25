import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Upload, HelpCircle } from 'lucide-react';

export default function PostItem() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: 'Electronics',
    location: '',
    claimQuestion: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  const categories = ['Electronics', 'ID Cards/Docs', 'Keys', 'Clothing', 'Books', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('claimQuestion', formData.claimQuestion);
    
    if (formData.tags) {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      data.append('tags', JSON.stringify(tagsArray));
    }

    if (image) {
      data.append('image', image);
    }

    try {
      const res = await API.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (res.data.matches && res.data.matches.length > 0) {
        setMatches(res.data.matches);
        setSuccessMsg('Item posted! We found some potential matches.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Report an Item</h2>
        {error && <div style={styles.error}>{error}</div>}
        {successMsg && <div style={{...styles.error, backgroundColor: '#dcfce7', color: '#166534'}}>{successMsg}</div>}

        {matches.length > 0 ? (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Potential Matches Found:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matches.map(match => (
                <div key={match._id} style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 'bold' }}>{match.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{match.description}</p>
                  <button onClick={() => navigate(`/item/${match._id}`)} style={{ ...styles.button, padding: '0.5rem', marginTop: '0.5rem' }}>View Match</button>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/')} style={{ ...styles.button, backgroundColor: '#64748b', marginTop: '1.5rem' }}>Go to Home</button>
          </div>
        ) : (

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.typeSelector}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'lost' })}
              style={formData.type === 'lost' ? styles.activeTypeLost : styles.typeBtn}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'found' })}
              style={formData.type === 'found' ? styles.activeTypeFound : styles.typeBtn}
            >
              I Found Something
            </button>
          </div>

          <label style={styles.label}>Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Blue Hydro Flask Water Bottle"
            value={formData.title}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.input}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Library 2nd Floor"
                value={formData.location}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            rows="4"
            placeholder="Provide distinguishing features, colors, marks, etc..."
            value={formData.description}
            onChange={handleChange}
            required
            style={styles.textarea}
          ></textarea>

          <label style={styles.label}>
            Verification Question (for Claimers) <HelpCircle size={14} color="#64748b" />
          </label>
          <input
            type="text"
            name="claimQuestion"
            placeholder="e.g. What sticker is on the back?"
            value={formData.claimQuestion}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.label}>Upload Photo (Optional)</label>
          <div style={styles.uploadBox}>
            <Upload size={24} color="#64748b" />
            <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
            <span style={styles.uploadText}>
              {image ? image.name : 'Click to select an image file'}
            </span>
          </div>

          <label style={styles.label}>Tags (Optional)</label>
          <input
            type="text"
            name="tags"
            placeholder="e.g. blue, metal, scratch"
            value={formData.tags || ''}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Submitting...' : 'Post Item Listing'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '1.8rem',
    color: '#0f172a',
    marginBottom: '1.5rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '0.6rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  typeSelector: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  typeBtn: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  activeTypeLost: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  activeTypeFound: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: '-0.4rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  uploadBox: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '1.5rem',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  uploadText: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  button: {
    backgroundColor: '#0284c7',
    color: '#fff',
    padding: '0.8rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
};