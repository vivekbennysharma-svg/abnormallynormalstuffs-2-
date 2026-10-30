import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface ReportItem {
  id: string;
  reason: string;
  status: string;
  reporter: { name: string; email: string };
  post?: {
    id: string;
    title: string;
    slug: string;
    body: string;
    status: string;
    author: { name: string };
  };
}

export const ModerationQueue: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionReason, setActionReason] = useState<{ [key: string]: string }>({});

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/moderation/queue');
      setReports(res.data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'MODERATOR') {
      fetchQueue();
    }
  }, [user]);

  const handleResolve = async (reportId: string, action: string) => {
    try {
      await api.post('/moderation/resolve', {
        reportId,
        action,
        reason: actionReason[reportId] || 'Reviewed by moderator',
      });
      fetchQueue();
    } catch (err) {
      console.error('Failed to resolve action:', err);
    }
  };

  if (user?.role !== 'MODERATOR') {
    return <p style={{ padding: '2rem' }}>Access Denied: Moderator role required.</p>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h2>Moderation Review Queue</h2>
      {loading ? (
        <p>Loading queue...</p>
      ) : reports.length === 0 ? (
        <p>Queue is empty. No pending flags.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reports.map((r) => (
            <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', color: '#dc2626' }}>Reason: {r.reason}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Reported by: {r.reporter.name}</span>
              </div>

              {r.post && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', margin: '0.75rem 0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{r.post.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>{r.post.body}</p>
                  <small style={{ color: '#94a3b8' }}>Author: {r.post.author.name} | Current Status: {r.post.status}</small>
                </div>
              )}

              <input
                type="text"
                placeholder="Audit notes / reason for action"
                value={actionReason[r.id] || ''}
                onChange={(e) => setActionReason({ ...actionReason, [r.id]: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleResolve(r.id, 'HIDE_POST')}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Hide Post
                </button>
                <button
                  onClick={() => handleResolve(r.id, 'RESTORE_POST')}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Approve / Restore Post
                </button>
                <button
                  onClick={() => handleResolve(r.id, 'DISMISS_REPORT')}
                  style={{ background: '#64748b', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};