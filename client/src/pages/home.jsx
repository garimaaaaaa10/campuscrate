import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Search, Tag, MapPin, Calendar, CheckCircle } from 'lucide-react';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get('/items');
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electronics', 'ID Cards/Docs', 'Keys', 'Clothing', 'Books', 'Other'];

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Campus Lost & Found</h1>
        <p style={styles.heroSubtitle}>Report missing belongings or help return found items to their owners.</p>

        <div style={styles.searchBar}>
          <Search size={20} color="#64748b" style={{ marginLeft: '12px' }} />
          <input
            type="text"
            placeholder="Search by keyword, location, or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.filterSection}>
        <div style={styles.typeTabs}>
          <button
            onClick={() => setFilterType('all')}
            style={filterType === 'all' ? styles.activeTab : styles.tab}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterType('lost')}
            style={filterType === 'lost' ? styles.activeTab : styles.tab}
          >
            Lost Items
          </button>
          <button
            onClick={() => setFilterType('found')}
            style={filterType === 'found' ? styles.activeTab : styles.tab}
          >
            Found Items
          </button>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.categorySelect}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={styles.centerText}>Loading listings...</div>
      ) : filteredItems.length === 0 ? (
        <div style={styles.centerText}>No items found matching your criteria.</div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map((item) => (
            <div key={item._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span
                  style={
                    item.type === 'lost' ? styles.badgeLost : styles.badgeFound
                  }
                >
                  {item.type.toUpperCase()}
                </span>
                {item.status === 'returned' && (
                  <span style={styles.badgeReturned}>
                    <CheckCircle size={14} style={{ marginRight: '4px' }} />
                    RETURNED
                  </span>
                )}
              </div>

              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} style={styles.cardImage} />
              )}

              <div style={styles.cardBody}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemDesc}>
                  {item.description.length > 90
                    ? item.description.substring(0, 90) + '...'
                    : item.description}
                </p>

                <div style={styles.itemMeta}>
                  <div style={styles.metaRow}>
                    <Tag size={15} color="#0284c7" />
                    <span>{item.category}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <MapPin size={15} color="#0284c7" />
                    <span>{item.location}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <Calendar size={15} color="#0284c7" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link to={`/item/${item._id}`} style={styles.viewBtn}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  heroTitle: {
    fontSize: '2.2rem',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    color: '#64748b',
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '30px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  searchInput: {
    width: '100%',
    padding: '0.8rem 1rem',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  typeTabs: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: '#e2e8f0',
    padding: '4px',
    borderRadius: '8px',
  },
  tab: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#475569',
  },
  activeTab: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#0284c7',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  categorySelect: {
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardHeader: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    gap: '8px',
    zIndex: 2,
  },
  badgeLost: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  badgeFound: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  badgeReturned: {
    backgroundColor: '#64748b',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  itemTitle: {
    fontSize: '1.2rem',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  itemDesc: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    flexGrow: 1,
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: '#475569',
    marginBottom: '1rem',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewBtn: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#f1f5f9',
    color: '#0284c7',
    padding: '0.6rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  centerText: {
    textAlign: 'center',
    color: '#64748b',
    padding: '3rem',
    fontSize: '1.1rem',
  },
};