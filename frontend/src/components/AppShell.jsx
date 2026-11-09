import { Suspense, useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { subscribeToIncidentEvents } from "../api/socket.js";
import { useAuth } from "../context/useAuth.js";
import { shortId, statusLabel } from "../utils/incidents.js";
import { scrollToTop } from "../utils/smooth-scroll.js";
import { openPalette, toast } from "../utils/toast.js";
import BackendStatus from "./BackendStatus";
import CommandPalette from "./CommandPalette.jsx";
import Dialog from "./Dialog.jsx";
import { Icon, Logo } from "./Icon.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import Toasts from "./Toasts";
import { PageSkeleton } from "./PageSkeleton.jsx";

const MOD = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

const TITLES = [
  ["/app", "Overview"],
  ["/report", "Report"],
  ["/sos", "Emergency SOS"],
  ["/incidents/", "Incident"],
  ["/incidents", "Incidents"],
  ["/safety", "Safety guide"],
  ["/profile", "Profile"],
];

function titleFor(pathname) {
  const hit = TITLES.find(([p]) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p));
  return hit ? hit[1] : "YatraShield";
}

function navFor(role) {
  const staff = role === "supervisor" || role === "admin";
  return [
    { to: "/app", label: staff ? "Control room" : "Overview", short: "Home", icon: "overview", end: true },
    { to: "/report", label: "Report", short: "Report", icon: "report" },
    { to: "/sos", label: "SOS", short: "SOS", icon: "beacon", sos: true },
    {
      to: "/incidents",
      label: staff ? "All incidents" : role === "responder" ? "Assigned to me" : "My incidents",
      short: "Cases",
      icon: "ledger",
    },
    { to: "/profile", label: "Profile", short: "You", icon: "user" },
  ];
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [toasts, setToasts] = useState([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const role = user?.role || "tourist";
  const name = user?.name || "User";
  const items = navFor(role);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (message, type = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }].slice(-3));
      setTimeout(() => dismiss(id), 4600);
    },
    [dismiss]
  );

  useEffect(() => {
    const onToast = (e) => push(e.detail.message, e.detail.type || "success");
    const onLogout = () => setConfirmOpen(true);
    const onPalette = () => setPaletteOpen(true);
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("ys-toast", onToast);
    window.addEventListener("ys-logout", onLogout);
    window.addEventListener("ys-palette", onPalette);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ys-toast", onToast);
      window.removeEventListener("ys-logout", onLogout);
      window.removeEventListener("ys-palette", onPalette);
      window.removeEventListener("keydown", onKey);
    };
  }, [push]);

  // Surface real-time backend events as notifications.
  useEffect(() => {
    const statusHandler = (p) => {
      const inc = p?.incident;
      toast(inc ? `${shortId(inc)} is now ${statusLabel(inc.status)}` : p?.message || "Incident updated", "info");
    };
    const messageHandler = (p) => {
      const inc = p?.incident;
      toast(`${p?.message || "Incident update"}${inc ? ` — ${shortId(inc)}` : ""}`, "info");
    };
    const escalatedHandler = (p) => {
      const id = p?.incidentId ? ` — ${shortId({ _id: p.incidentId })}` : "";
      toast(`${p?.message || "Incident escalated"}${id}`, "error");
    };
    return subscribeToIncidentEvents({
      "incident:status_updated": statusHandler,
      "incident:assigned": messageHandler,
      "incident:reassigned": messageHandler,
      "incident:escalated": escalatedHandler,
    });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  function confirmLogout() {
    setConfirmOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <aside className="rail">
        <Link to="/app" className="brand">
          <Logo size={30} />
          <span>
            <span className="brand-name">YatraShield</span>
            <span className="brand-sub">Gurugram safety network</span>
          </span>
        </Link>

        <p className="rail-label">Navigate</p>
        <nav className="rail-nav" aria-label="Primary">
          {items.map(({ to, label, icon, end, sos }) => (
            <NavLink key={to} to={to} end={end} className={`rail-link ${sos ? "is-sos" : ""}`}>
              <Icon name={icon} size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/safety" className="rail-link">
            <Icon name="guide" size={18} />
            <span>Safety guide</span>
          </NavLink>
        </nav>

        <div className="rail-spacer" />

        <a className="rail-emergency" href="tel:112">
          <Icon name="phone" size={16} />
          <span>
            <strong>In danger? Call 112</strong>
            <small>Always reach emergency services first.</small>
          </span>
        </a>

        <div className="rail-user">
          <span className="avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          <span className="rail-user-meta">
            <strong>{name}</strong>
            <small>{role}</small>
          </span>
          <button type="button" className="icon-btn is-small" onClick={() => setConfirmOpen(true)} aria-label="Log out" title="Log out">
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>

      <div className="stage">
        <header className="topbar">
          <Link to="/app" className="topbar-brand" aria-label="YatraShield home">
            <Logo size={26} />
          </Link>
          <div className="crumbs">
            <span className="crumbs-root">YatraShield</span>
            <span className="crumbs-sep">/</span>
            <h2>{titleFor(pathname)}</h2>
          </div>
          <button type="button" className="search-trigger" onClick={openPalette}>
            <Icon name="search" size={16} />
            <span>Search or jump to…</span>
            <kbd>{MOD} K</kbd>
          </button>
          <button type="button" className="icon-btn search-icon" onClick={openPalette} aria-label="Search">
            <Icon name="search" size={18} />
          </button>
          <ThemeToggle />
        </header>

        <BackendStatus />

        <main id="main" className="content" key={pathname}>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <nav className="tabbar" aria-label="Primary mobile">
        {items.map(({ to, short, icon, end, sos }) => (
          <NavLink key={to} to={to} end={end} className={`tab ${sos ? "is-sos" : ""}`}>
            <span className="tab-ico"><Icon name={icon} size={sos ? 22 : 20} /></span>
            <span className="tab-label">{short}</span>
          </NavLink>
        ))}
      </nav>

      <Toasts toasts={toasts} onDismiss={dismiss} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} label="Confirm log out" className="dialog-confirm">
        <h3>Log out of YatraShield?</h3>
        <p>You’ll stop receiving live incident updates on this device.</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>Stay signed in</button>
          <button type="button" className="btn btn-signal" onClick={confirmLogout}>Log out</button>
        </div>
      </Dialog>
    </div>
  );
}
