import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PostList } from './pages/PostList';
import { CreatePost } from './pages/CreatePost';
import { ModerationQueue } from './pages/ModerationQueue';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/moderation" element={<ModerationQueue />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}