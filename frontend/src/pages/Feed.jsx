import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';

const TABS = ['All Posts', 'Most Liked', 'Most Commented'];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, hasMore: true, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('All Posts');

  const fetchPosts = useCallback(async (page = 1, replace = false) => {
    try {
      const { data } = await api.get(`/posts?page=${page}&limit=10`);
      setPosts((prev) => (replace ? data.posts : [...prev, ...data.posts]));
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load posts');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts(1, true).finally(() => setLoading(false));
  }, [fetchPosts]);

  const handleCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  // NEW: Instantly sync state from PostCard back to Feed for accurate sorting
  const handleUpdatePost = (postId, updatedFields) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updatedFields } : p))
    );
  };

  const handleLoadMore = async () => {
    if (loadingMore || !pagination.hasMore) return;
    setLoadingMore(true);
    await fetchPosts(pagination.page + 1, false);
    setLoadingMore(false);
  };

  // UPDATED: Robust client-side sort for tabs ensuring 0 fallbacks and chronological default
  const displayPosts = [...posts].sort((a, b) => {
    if (activeTab === 'Most Liked') {
      const aLikes = a.likes?.length || 0;
      const bLikes = b.likes?.length || 0;
      return bLikes - aLikes;
    }
    if (activeTab === 'Most Commented') {
      const aComments = a.commentsCount ?? a.comments?.length ?? 0;
      const bComments = b.commentsCount ?? b.comments?.length ?? 0;
      return bComments - aComments;
    }
    // All Posts = server order (newest first fallback)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <>
      <Navbar />
      <div className="feed-page">
        {/* Filter tabs */}
        <div className="filter-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Create post */}
        <CreatePost onCreated={handleCreated} />

        {/* Feed */}
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : displayPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌐</div>
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          <>
            {displayPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onDelete={handleDelete}
                onUpdate={handleUpdatePost} 
              />
            ))}

            {pagination.hasMore && activeTab === 'All Posts' && (
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : `Load more posts`}
              </button>
            )}

            {!pagination.hasMore && posts.length > 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>
                You've seen all posts 🎉
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}