import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAvatarColor } from '../utils/avatarColor'; // NEW

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="navbar-logo-dot" />
        Social
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <div 
              className="avatar-circle" 
              title={user.username}
              style={{ backgroundColor: getAvatarColor(user.username) }} /* NEW */
            >
              {initial}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {user.username}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}