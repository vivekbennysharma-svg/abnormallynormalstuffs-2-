import React from "react";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () =>{
    const { user } = useAuth();

    return (
        <footer>
            <div className="footer-grid-layout">
                <div className="footer-brand-block">
                    <span className="footer-logo">abnormallynormalstuffs</span>
                    <p>A quiet corner for ordinary thoughts, written by people and reviewed with care.</p>
                </div>

                <div className="footer-nav-block">
                    <h4>Explore</h4>
                    <ul>
                        <li><Link to="/">Browse posts</Link></li>
                        {user && <li><Link to="/create-post">Write a post</Link></li>}
                        {user?.role === 'MODERATOR' && <li><Link to="/moderation">Moderation queue</Link></li>}
                    </ul>
                </div>

                <div className="footer-copyright-bar">
                    <span>© {new Date().getFullYear()} abnormallynormalstuffs. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
};