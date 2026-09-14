function Header() {
  return (
    <header className="header">
      <div>
        <p className="welcome-text">Good morning</p>
        <h1>Stay safe on your journey</h1>
      </div>

      <div className="user-area">
        <div className="notification">🔔</div>
        <div className="avatar">A</div>
      </div>
    </header>
  );
}

export default Header;