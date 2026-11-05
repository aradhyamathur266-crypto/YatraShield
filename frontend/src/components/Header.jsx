
import { Link, NavLink } from "react-router-dom";

function Header({
  darkMode,
  onToggleTheme,
  dashboardType,
  onDashboardChange,
}) {
  return (
    <header className="top-navbar">
      <Link to="/" className="brand">
        <span className="brand-icon"></span>
        <span>YatraShield</span>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/report">Report Incident</NavLink>
        <NavLink to="/incidents">My Incidents</NavLink>
        <NavLink to="/safety">Safety Info</NavLink>
      </nav>

      <div className="navbar-actions">
        <select
          className="dashboard-selector"
          value={dashboardType}
          onChange={(event) => onDashboardChange(event.target.value)}
          aria-label="Choose dashboard type"
        >
          <option value="tourist">Tourist</option>
          <option value="authority">Authority</option>
        </select>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={darkMode ? "Switch to day theme" : "Switch to night theme"}
          title={darkMode ? "Switch to day theme" : "Switch to night theme"}
        >
          {darkMode ? "☀" : "☾"}
        </button>

        <Link to="/sos" className="navbar-sos">
          SOS
        </Link>

        <Link to="/profile" className="profile-button">
          <span className="profile-avatar">A</span>
          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
