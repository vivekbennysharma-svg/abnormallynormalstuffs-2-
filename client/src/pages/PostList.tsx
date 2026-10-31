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

const EMOJIS = ['📝', '🌿', '💡', '☕', '🔭', '🎧', '📚', '🌙'];
const emojiFor = (title: string) => EMOJIS[title.length % EMOJIS.length];

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (query = '', category = '') => {
    setLoading(true);
    try {
      const res = await api.get(
        `/posts?search=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
      );
      const list: PostSummary[] = res.data.posts;
      setPosts(list);

      // build the filter pills from the unfiltered list
      if (!category) {
        const map = new Map<string, { name: string; slug: string }>();
        list.forEach((p) => p.categories.forEach((c) => map.set(c.category.slug, c.category)));
        setCategories([...map.values()]);
      }
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
    fetchPosts(search, activeCategory);
  };

  const pickCategory = (slug: string) => {
    setActiveCategory(slug);
    fetchPosts(search, slug);
  };

  return (
    <div>
      <header className="hero-intro-header">
        <h1>Ordinary things, written down.</h1>
        <p>Browse the latest published posts.</p>
      </header>

      <form className="search-controls-wrapper" onSubmit={handleSearchSubmit}>
        <div className="search-row">
          <input
            type="text"
            placeholder="Search published posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="action-submit-btn">Search</button>
        </div>
      </form>

      {categories.length > 0 && (
        <div className="category-filter-row">
          <button
            type="button"
            className={`category-filter-pill ${activeCategory === '' ? 'active' : ''}`}
            onClick={() => pickCategory('')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`category-filter-pill ${activeCategory === c.slug ? 'active' : ''}`}
              onClick={() => pickCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="section-label">Latest posts</div>

      {loading ? (
        <p className="state-text">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="state-text">No posts found.</p>
      ) : (
        <div className="posts-grid-mesh">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.slug}`} className="card-link">
              <article className="blog-hover-card" style={{ height: '100%' }}>
                <div className="card-graphics-header">{emojiFor(post.title)}</div>

                <div className="pill-row">
                  {post.categories.map((c) => (
                    <span key={c.category.slug} className="pill-tag">{c.category.name}</span>
                  ))}
                  {post.tags.map((t) => (
                    <span key={t.tag.name} className="pill-tag">#{t.tag.name}</span>
                  ))}
                </div>

                <h3>{post.title}</h3>
                <p className="card-excerpt-text">{post.body.slice(0, 140)}...</p>

                <div className="card-meta-row">
                  <span>By {post.author.name}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};