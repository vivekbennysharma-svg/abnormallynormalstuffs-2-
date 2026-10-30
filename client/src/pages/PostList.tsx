import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

interface PostSummary {
  id: string;
  title: string;
  slug: string;
  body: string;
  createdAt: string;
  author: { name: string; avatarUrl?: string };
  categories: { category: { name: string; slug: string } }[];
  tags: { tag: { name: string } }[];
}

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?search=${encodeURIComponent(query)}`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(search);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search published posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <button type="submit" style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map((post) => (
            <article key={post.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                By {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>
                <Link to={`/posts/${post.slug}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
                  {post.title}
                </Link>
              </h2>
              <p style={{ color: '#334155', lineHeight: 1.6 }}>
                {post.body.slice(0, 160)}...
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {post.tags.map((t) => (
                  <span key={t.tag.name} style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};