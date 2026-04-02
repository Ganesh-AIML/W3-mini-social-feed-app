import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommentModal({ post, onClose, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(post.comments || []);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: text.trim() });
      setComments((prev) => [...prev, data.comment]);
      onCommentAdded(post._id, data.commentsCount);
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to comment');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            Comments
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13, marginLeft: 6 }}>
              ({comments.length})
            </span>
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-comments">
          {comments.length === 0 ? (
            <div className="no-comments">
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              No comments yet. Be first!
            </div>
          ) : (
            comments.map((c) => (
              <div className="comment-item" key={c._id}>
                <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                  {c.username[0].toUpperCase()}
                </div>
                <div className="comment-body">
                  <div className="comment-user">{c.username}</div>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-time">{timeAgo(c.createdAt)}</div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="modal-input-row">
          <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
            {initial}
          </div>
          <input
            className="modal-input"
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            autoFocus
          />
          <button className="btn-send" onClick={handleSubmit} disabled={loading || !text.trim()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}