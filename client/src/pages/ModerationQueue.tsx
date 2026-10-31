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
    if (user?.role === 'MODERATOR') fetchQueue();
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
    return <p className="state-text">Access denied: moderator role required.</p>;
  }

  return (
    <div>
      <header className="hero-intro-header">
        <h1>Moderation queue</h1>
        <p>Review flagged posts and decide what happens next.</p>
      </header>

      <div className="section-label">Pending reports</div>

      {loading ? (
        <p className="state-text">Loading queue...</p>
      ) : reports.length === 0 ? (
        <p className="state-text">Queue is empty. No pending flags.</p>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="report-card">
            <div className="report-head">
              <span className="report-reason">Reason: {r.reason}</span>
              <span className="report-reporter">Reported by {r.reporter.name}</span>
            </div>

            {r.post && (
              <div className="report-post">
                <h4>{r.post.title}</h4>
                <p>{r.post.body}</p>
                <small>Author: {r.post.author.name} · Status: {r.post.status}</small>
              </div>
            )}

            <input
              type="text"
              placeholder="Audit notes / reason for action"
              value={actionReason[r.id] || ''}
              onChange={(e) => setActionReason({ ...actionReason, [r.id]: e.target.value })}
            />

            <div className="mod-actions">
              <button className="inventory-ctrl-btn btn-hide" onClick={() => handleResolve(r.id, 'HIDE_POST')}>
                Hide post
              </button>
              <button className="inventory-ctrl-btn btn-restore" onClick={() => handleResolve(r.id, 'RESTORE_POST')}>
                Approve / restore
              </button>
              <button className="inventory-ctrl-btn btn-dismiss" onClick={() => handleResolve(r.id, 'DISMISS_REPORT')}>
                Dismiss report
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};