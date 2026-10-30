import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      borderBottom: '1px solid #e2e8f0',
      background: '#fff'
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.25rem', textDecoration: 'none', color: '#0f172a' }}>
          abnormallynormalstuffs
        </Link>
        <Link to="/" style={{ textDecoration: 'none', color: '#475569' }}>Browse Posts</Link>
        {user && (
          <Link to="/create-post" style={{ textDecoration: 'none', color: '#2563eb' }}>
            + New Post
          </Link>
        )}
        {user?.role === 'MODERATOR' && (
          <Link to="/moderation" style={{ textDecoration: 'none', color: '#dc2626' }}>
            Moderation Queue
          </Link>
        )}
      </div>

      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{user.name} ({user.role})</span>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                loginWithGoogle(credentialResponse.credential);
              }
            }}
            onError={() => {
              console.error('Google Sign-In Failed');
            }}
          />
        )}
      </div>
    </nav>
  );
};