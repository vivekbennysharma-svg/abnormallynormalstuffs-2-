import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const itemClass = (extra = '')=> ({ isActive }: { isActive: boolean }) => {
    `nav-item ${extra} ${isActive ? 'active' : ''}`.trim();
  };

  return (
    <nav>
        <Link to="/" className="nav-logo">
            abnormallynormalstuffs
        </Link>

        <div className="nav-links">
            <NavLink to="/" end className={itemClass()}>Browse</NavLink>
            {user && <NavLink to="/create-post" className={itemClass('nav-accent')}>+ New Post</NavLink>}
            {user?.role === 'MODERATOR' && (
                <NavLink to="/moderation" className={itemClass('nav-danger')}>Moderation Queue</NavLink>
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
                    Sign Out
                </button>
            </>
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