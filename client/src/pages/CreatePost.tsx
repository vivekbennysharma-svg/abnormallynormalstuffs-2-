import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface QuoteSuggestion {
  quote: string;
  context: string;
}

export const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [error, setError] = useState('');
  
  // AI assistant state
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<QuoteSuggestion[]>([]);
  const [aiError, setAiError] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return <p style={{ padding: '2rem' }}>Please sign in to publish an article.</p>;
  }

  const handleGenerateQuotes = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.post('/ai/quotes', { topic: aiTopic });
      setSuggestions(res.data.quotes);
    } catch (err: any) {
      setAiError(err.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleInsertQuote = (quote: string) => {
    setBody((prev) => `${prev}\n\n> "${quote}"\n\n`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/posts', { title, body, status });
      navigate(`/posts/${res.data.post.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish post');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h2>Create New Post</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {/* AI Quote Generator Widget */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1e293b' }}>
          ✨ AI Quote Assistant (Experimental)
        </h3>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#64748b' }}>
          Need inspiration? Enter a theme to receive AI-assisted quote suggestions.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="e.g. perseverance in coding, digital privacy..."
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
          <button
            type="button"
            onClick={handleGenerateQuotes}
            disabled={aiLoading}
            style={{ padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {aiLoading ? 'Thinking...' : 'Generate'}
          </button>
        </div>

        {aiError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>{aiError}</p>}

        {suggestions.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Generated suggestions (Click to insert):
            </span>
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleInsertQuote(item.quote)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ fontStyle: 'italic', color: '#1e293b' }}>"{item.quote}"</div>
                <small style={{ color: '#64748b' }}>Context: {item.context}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Post Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '0.75rem', fontSize: '1.1rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
        />
        <textarea
          rows={12}
          placeholder="Write your article content here..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          style={{ padding: '0.75rem', fontSize: '1rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
        />
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>Status:</label>
          <select value={status} onChange={(e: any) => setStatus(e.target.value)} style={{ padding: '0.4rem' }}>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
          <button
            type="submit"
            style={{ padding: '0.6rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save Post
          </button>
        </div>
      </form>
    </div>
  );
};