import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { incidentApi } from "../api/api.js";
import { useAuth } from "../context/useAuth.js";
import { modeForRole } from "../hooks/useIncidents.js";
import { toggleTheme, useTheme } from "../utils/theme.js";
import { categoryLabel, shortId, statusLabel } from "../utils/incidents.js";
import { requestLogout } from "../utils/toast.js";
import Dialog from "./Dialog.jsx";
import { Icon } from "./Icon.jsx";

const PAGES = [
  { id: "p-app", label: "Overview", to: "/app", icon: "overview", kw: "home dashboard control" },
  { id: "p-report", label: "Report an incident", to: "/report", icon: "report", kw: "new create submit" },
  { id: "p-incidents", label: "Incidents", to: "/incidents", icon: "ledger", kw: "history list queue records" },
  { id: "p-sos", label: "Emergency SOS", to: "/sos", icon: "beacon", kw: "help emergency panic" },
  { id: "p-safety", label: "Safety guide", to: "/safety", icon: "guide", kw: "tips information" },
  { id: "p-profile", label: "Profile", to: "/profile", icon: "user", kw: "account settings" },
];

function matches(item, q) {
  if (!q) return true;
  const hay = `${item.label} ${item.kw || ""} ${item.sub || ""}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((part) => hay.includes(part));
}

function PaletteBody({ onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const listRef = useRef(null);
  const role = user?.role;

  useEffect(() => {
    let cancelled = false;
    const mode = modeForRole(role);
    const req = mode === "all" ? incidentApi.getAll() : mode === "assigned" ? incidentApi.getAssigned() : incidentApi.getMine();
    req
      .then((res) => {
        if (!cancelled) setIncidents((res.data?.incidents || []).slice(0, 50));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [role]);

  const groups = useMemo(() => {
    const actions = [
      { id: "a-theme", label: isDark ? "Switch to light theme" : "Switch to dark theme", icon: isDark ? "sun" : "moon", kw: "appearance mode", run: () => toggleTheme() },
      { id: "a-logout", label: "Log out", icon: "logout", kw: "sign out", run: () => requestLogout() },
    ];
    const incidentItems = incidents.map((i) => ({
      id: `i-${i._id}`,
      label: `${shortId(i)} · ${categoryLabel(i.category)}`,
      sub: `${statusLabel(i.status)} ${i.description || ""}`,
      icon: "pin",
      to: `/incidents/${i._id}`,
    }));
    return [
      { title: "Pages", items: PAGES.filter((p) => matches(p, query)) },
      { title: "Actions", items: actions.filter((a) => matches(a, query)) },
      { title: "Incidents", items: query ? incidentItems.filter((i) => matches(i, query)).slice(0, 6) : [] },
    ].filter((g) => g.items.length > 0);
  }, [incidents, query, isDark]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const current = Math.min(active, Math.max(0, flat.length - 1));

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [current, flat]);

  function run(item) {
    if (!item) return;
    onClose();
    if (item.run) item.run();
    else if (item.to) navigate(item.to);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(flat.length ? (current + 1) % flat.length : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(flat.length ? (current - 1 + flat.length) % flat.length : 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(flat[current]);
    }
  }

  let cursor = -1;
  return (
    <div className="palette" onKeyDown={onKeyDown}>
      <div className="palette-input">
        <Icon name="search" size={18} />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          placeholder="Jump to a page, or search incidents…"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-autocomplete="list"
          spellCheck={false}
        />
        <kbd>Esc</kbd>
      </div>
      <div className="palette-list" id="palette-list" role="listbox" ref={listRef}>
        {flat.length === 0 && <p className="palette-empty">Nothing matches “{query}”.</p>}
        {groups.map((g) => (
          <div key={g.title} role="group" aria-label={g.title}>
            <p className="palette-group">{g.title}</p>
            {g.items.map((item) => {
              cursor += 1;
              const index = cursor;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={index === current}
                  className="palette-item"
                  onMouseMove={() => setActive(index)}
                  onClick={() => run(item)}
                >
                  <Icon name={item.icon} size={17} />
                  <span className="palette-label">{item.label}</span>
                  {item.sub && <span className="palette-sub">{item.sub}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommandPalette({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} label="Command palette" className="dialog-palette">
      <PaletteBody onClose={onClose} />
    </Dialog>
  );
}
