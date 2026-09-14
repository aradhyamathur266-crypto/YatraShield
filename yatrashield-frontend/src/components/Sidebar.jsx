function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        🛡️ YatraShield
      </div>

      <nav>
        <a href="#">⌂ Home</a>
        <a href="#">⚠ Report Incident</a>
        <a href="#">🆘 SOS</a>
        <a href="#">▣ My Incidents</a>
        <a href="#">◉ Safety Info</a>
        <a href="#">♙ Profile</a>
      </nav>

      <div className="location-status">
        <span>●</span>
        Location sharing active
        <small>Last updated: 10:42 AM</small>
      </div>
    </aside>
  );
}

export default Sidebar;