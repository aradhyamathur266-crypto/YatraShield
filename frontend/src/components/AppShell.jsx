import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  Bell,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Shield,
  ShieldAlert,
  Sun,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/useAuth.js";
import BackendStatus from "./BackendStatus";
import Toasts from "./Toasts";

function navItems() {
  return [
    { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/report", label: "Report", icon: FilePlus2 },
    { to: "/incidents", label: "Incidents", icon: TriangleAlert },
    { to: "/sos", label: "SOS", icon: AlertOctagon },
    { to: "/safety", label: "Safety", icon: ShieldAlert },
    { to: "/profile", label: "Profile", icon: UserRound },
  ];
}

export default function AppShell({ darkMode, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  const firstName = (user?.name || "User").split(" ")[0];
  const initials = (user?.name || "U").charAt(0).toUpperCase();
  const role = user?.role || "tourist";

  function pushToast(message, type = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }].slice(-3));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }

  // Expose toast helper to pages via window event (keeps prop-drilling out).
  useEffect(() => {
    const handler = (e) => pushToast(e.detail.message, e.detail.type || "success");
    window.addEventListener("ys-toast", handler);
    return () => window.removeEventListener("ys-toast", handler);
  }, []);

  function handleLogout() {
    if (!window.confirm("Log out of YatraShield?")) return;
    logout();
    navigate("/login");
  }

  const items = navItems();

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to="/app" className="brand">
          <span className="brand-mark"><Shield /></span>
          <span>
            <span className="brand-name">YatraShield</span>
            <br />
            <span className="brand-sub">Gurugram safety network</span>
          </span>
        </NavLink>

        <p className="sidebar-label">Main</p>
        <nav className="nav">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-cluster">
          <strong style={{ fontSize: 13 }}><span className="sidebar-cluster-dot" />Gurugram cluster</strong>
          <small>Live — 3k residents scanned within 2 km.</small>
        </div>

        <div className="sidebar-user">
          <span className="avatar">{initials}</span>
          <span style={{ minWidth: 0 }}>
            <strong>{firstName}</strong>
            <span className="role-chip">{role}</span>
          </span>
          <button className="icon-btn" style={{ width: 32, height: 32, marginLeft: "auto" }} onClick={handleLogout} title="Log out" aria-label="Log out">
            <LogOut style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header className="topbar">
          <div>
            <div className="topbar-title">{firstName}'s overview</div>
            <div className="topbar-sub">Welcome back — heres what's happening near you.</div>
          </div>
          <div className="topbar-search"><Search /> Search incidents <kbd>⌘K</kbd></div>
          <button className="icon-btn" aria-label="Notifications" title="Notifications"><Bell /></button>
          <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme" title={darkMode ? "Light theme" : "Dark theme"}>
            {darkMode ? <Sun /> : <Moon />}
          </button>
        </header>

        <BackendStatus />

        <main className="content">
          <Outlet />
        </main>

        <nav className="mobile-nav" aria-label="Mobile">
          {items.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon /> {label.replace("Incidents", "Incidents").replace("Report", "Report")}
            </NavLink>
          ))}
        </nav>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
