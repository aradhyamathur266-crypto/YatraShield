import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        🛡️ YatraShield
      </div>

      <nav>

        <Link to="/">
          ⌂ Home
        </Link>

        <Link to="/report">
          ⚠ Report Incident
        </Link>

        <Link to="/sos">
          🆘 SOS
        </Link>

        <Link to="/incidents">
          ▣ My Incidents
        </Link>

        <Link to="/safety">
          ◉ Safety Info
        </Link>

        <Link to="/profile">
          ♙ Profile
        </Link>

      </nav>

      <div className="location-status">

        <span>●</span>

        Location sharing active

        <small>
          Last updated: 10:42 AM
        </small>

      </div>

    </aside>
  );
}

export default Sidebar;