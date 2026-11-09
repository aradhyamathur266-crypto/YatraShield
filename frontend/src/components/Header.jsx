import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function Header({ darkMode, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const role = user?.role || "tourist";

  function handleLogout() {
    if (!window.confirm("Are you sure you want to log out of YatraShield?")) return;
    logout();
    navigate("/login");
  }

  return (
    <header className="top-navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">🛡️</span>
        <span>YatraShield</span>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/report">Report Incident</NavLink>
        <NavLink to="/incidents">My Incidents</NavLink>
        <NavLink to="/safety">Safety Info</NavLink>
      </nav>

      <div className="navbar-actions">
        {user && (
          <span className="role-chip" title={`Logged in as ${role}`}>{role}</span>
        )}
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={darkMode ? "Switch to day theme" : "Switch to night theme"}
          title={darkMode ? "Switch to day theme" : "Switch to night theme"}
        >
          {darkMode ? "☀" : "☾"}
        </button>

        <Link to="/sos" className="navbar-sos">SOS</Link>

        <Link to="/profile" className="profile-button">
          <span className="profile-avatar">{initials}</span>
          <span className="profile-button-name">{displayName.split(" ")[0]}</span>
        </Link>

        <button type="button" className="secondary-button logout-nav-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Header;
