import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CommentModal from './CommentModal';
import toast from 'react-hot-toast';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [commentsCount, setCommentsCount] = useState(
    post.comments?.length ?? post.commentsCount ?? 0
  );
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const isLiked = likes.includes(user?.username);
  const isOwner = post.author?.userId === user?.userId ||
    String(post.author?.userId) === String(user?.userId);

  const handleLike = async () => {
    if (liking) return;
    // Optimistic update
    setLikes((prev) =>
      isLiked ? prev.filter((u) => u !== user.username) : [...prev, user.username]
    );
    setLiking(true);
    try {
      const { data } = await api.put(`/posts/${post._id}/like`);
      setLikes(data.likes);
    } catch {
      // Revert on error
      setLikes((prev) =>
        isLiked ? [...prev, user.username] : prev.filter((u) => u !== user.username)
      );
      toast.error('Failed to like');
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCommentAdded = (postId, newCount) => {
    setCommentsCount(newCount);
  };

  const initial = post.author?.username?.[0]?.toUpperCase() || '?';

  return (
    <>
      <div className="post-card">
        {/* Header */}
        <div className="post-header">
          <div className="post-author">
            <div className="avatar-circle">{initial}</div>
            <div className="post-meta">
              <span className="post-username">@{post.author?.username}</span>
              <span className="post-time">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
          {!isOwner && (
            <button className="post-follow-btn">Follow</button>
          )}
        </div>

        {/* Content */}
        {post.text && <p className="post-text">{post.text}</p>}
        {post.imageUrl && (
          <img
            className="post-image"
            src={post.imageUrl}
            alt="post"
            loading="lazy"
          />
        )}

        {/* Actions */}
        <div className="post-actions">
          {/* Like */}
          <button
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {likes.length > 0 && <span>{likes.length}</span>}
            {likes.length === 0 && <span>Like</span>}
          </button>

          {/* Comment */}
          <button className="action-btn" onClick={() => setShowComments(true)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {commentsCount > 0 ? <span>{commentsCount}</span> : <span>Comment</span>}
          </button>

          {/* Share */}
          <button className="action-btn" onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast.success('Link copied!');
          }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span>Share</span>
          </button>

          {/* Delete (owner only) */}
          {isOwner && (
            <button className="action-btn delete-btn" onClick={handleDelete} style={{ marginLeft: 'auto' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {showComments && (
        <CommentModal
          post={post}
          onClose={() => setShowComments(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </>
  );
}