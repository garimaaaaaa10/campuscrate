import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { Package, LogOut, PlusCircle, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <Package size={24} style={{ marginRight: '8px' }} />
          CampusCrate
        </Link>

        <div style={styles.links}>
          <Link to="/" style={styles.link}>Browse Items</Link>
          
          {user ? (
            <>
              <Link to="/post" style={styles.postBtn}>
                <PlusCircle size={18} style={{ marginRight: '4px' }} />
                Post Item
              </Link>
              <Link to="/dashboard" style={styles.link}>My Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.link}>Admin</Link>
              )}
              <span style={styles.userInfo}>
                <User size={16} style={{ marginRight: '4px' }} />
                {user.name}
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={16} style={{ marginRight: '4px' }} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={styles.loginBtn}>Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: '0.8rem 1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  brand: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#38bdf8',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  postBtn: {
    backgroundColor: '#0284c7',
    color: '#fff',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  userInfo: {
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #64748b',
    color: '#f87171',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  loginBtn: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  }
};