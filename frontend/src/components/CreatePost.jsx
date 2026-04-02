import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getAvatarColor } from '../utils/avatarColor'; // NEW

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) {
      toast.error('Add some text or an image');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (imageFile) formData.append('image', imageFile);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setText('');
      removeImage();
      onCreated(data);
      toast.success('Post published!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <div 
          className="avatar-circle"
          style={{ backgroundColor: getAvatarColor(user?.username) }} /* NEW */
        >
          {initial}
        </div>
        <textarea
          className="create-post-input"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={1000}
        />
      </div>

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="preview" />
          <button className="image-preview-remove" onClick={removeImage} title="Remove">
            ✕
          </button>
        </div>
      )}

      <div className="create-post-actions">
        <div className="create-post-tools">
          <button
            className="tool-btn"
            title="Add image"
            onClick={() => fileRef.current.click()}
          >
            {/* camera icon */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImage}
          />
          {text.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
              {text.length}/1000
            </span>
          )}
        </div>

        <button className="btn-post" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            'Posting...'
          ) : (
            <>
              {/* send icon */}
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}