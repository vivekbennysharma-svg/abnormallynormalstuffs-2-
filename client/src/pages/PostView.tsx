import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';

interface PostDetail {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author: { name: string };
  categories: { category: { name: string; slug: string } }[];
  tags: { tag: { name: string } }[];
}

export const PostView: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data.post))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load post'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="state-text">Loading post...</p>;
  if (error || !post) return <p className="state-text">{error || 'Post not found.'}</p>;

  // blank line = new paragraph; a line starting with "> " is a quote
  const blocks = post.body.split(/\n{2,}/).filter((b) => b.trim());

  return (
    <div className="master-article-document">
      <div className="back-navigation-row">
        <Link to="/">← Back to posts</Link>
      </div>

      <div className="pill-row">
        {post.categories.map((c) => (
          <span key={c.category.slug} className="pill-tag">{c.category.name}</span>
        ))}
        {post.tags.map((t) => (
          <span key={t.tag.name} className="pill-tag">#{t.tag.name}</span>
        ))}
      </div>

      <h1 className="rendered-article-title">{post.title}</h1>
      <div className="article-meta">
        By {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
      </div>

      <div className="rendered-article-body">
        {blocks.map((b, i) =>
          b.trim().startsWith('>') ? (
            <blockquote key={i} className="article-ai-quote">
              {b.replace(/^>\s?/gm, '').trim()}
            </blockquote>
          ) : (
            <p key={i}>{b}</p>
          )
        )}
      </div>
    </div>
  );
};