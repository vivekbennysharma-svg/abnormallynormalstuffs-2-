import React from 'react';
import { Link, NavLink, useNavigate, type NavLinkRenderProps } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

// Explicit `: string` return type so TypeScript can never infer `void`
const linkClass =
  (extra = '') =>
  ({ isActive }: NavLinkRenderProps): string =>
    ['nav-item', extra, isActive ? 'active' : ''].filter(Boolean).join(' ');

export const Navbar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav>
      <Link to="/" className="nav-logo">abnormallynormalstuffs</Link>

      <div className="nav-links">
        <NavLink to="/" end className={linkClass()}>Browse</NavLink>
        {user && (
          <NavLink to="/create-post" className={linkClass('nav-accent')}>+ New Post</NavLink>
        )}
        {user?.role === 'MODERATOR' && (
          <NavLink to="/moderation" className={linkClass('nav-danger')}>Moderation</NavLink>
        )}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-user">
              {user.name}
              <span className="role-badge">{user.role.toLowerCase()}</span>
            </span>
            <button
              className="nav-signout"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) loginWithGoogle(res.credential);
            }}
            onError={() => console.error('Google Sign-In Failed')}
          />
        )}
      </div>
    </nav>
  );
};