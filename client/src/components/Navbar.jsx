import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          SchemeFind
        </Link>
        <nav className="nav-links">
          <NavLink to="/schemes">Browse Schemes</NavLink>
          {user && <NavLink to="/recommendations">My Matches</NavLink>}
          {user && <NavLink to="/profile">Profile</NavLink>}
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-sm btn-primary">
                Get Started
              </Link>
            </>
          ) : (
            <button type="button" className="btn btn-sm btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
