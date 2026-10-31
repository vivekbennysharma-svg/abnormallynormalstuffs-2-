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

  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<QuoteSuggestion[]>([]);
  const [aiError, setAiError] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return <p className="state-text">Please sign in to publish an article.</p>;
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
    <div>
      <header className="hero-intro-header">
        <h1>Write a post</h1>
        <p>Draft it, add a quote if you like, then publish.</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-split-grid">
        {/* LEFT: main editor */}
        <form className="editor-compose-pane" onSubmit={handleSubmit}>
          <h3>Compose</h3>
          <input
            type="text"
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Write your article content here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <div className="form-actions-row">
            <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            <button type="submit" className="action-submit-btn">Save post</button>
          </div>
        </form>

        {/* RIGHT: AI quote assistant */}
        <div className="inventory-status-pane">
          <h3>✨ AI quote assistant</h3>
          <div className="quote-field-block">
            <label>
              Theme <span className="optional-tag">(experimental)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. perseverance in coding, digital privacy..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit' }}
            />
            <div className="quote-actions-row">
              <button type="button" className="quote-ai-btn" onClick={handleGenerateQuotes} disabled={aiLoading}>
                {aiLoading ? 'Thinking...' : 'Generate quotes'}
              </button>
              <button
                type="button"
                className="quote-clear-btn"
                onClick={() => {
                  setSuggestions([]);
                  setAiTopic('');
                  setAiError('');
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {aiError && <p className="error-text-line">{aiError}</p>}

          {suggestions.length > 0 && (
            <>
              <p className="hint-text">Click a suggestion to insert it into your post.</p>
              {suggestions.map((item, idx) => (
                <div key={idx} className="quote-suggestion" onClick={() => handleInsertQuote(item.quote)}>
                  <div className="q">"{item.quote}"</div>
                  <div className="c">{item.context}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};