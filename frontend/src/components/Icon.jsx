// Bespoke 24px glyph set: 1.6 stroke, square caps, mitred joins.
// Drawn for YatraShield so the interface doesn't read as a stock icon pack.
const PATHS = {
  overview: "M4 4h7v9H4z M13 4h7v5h-7z M13 11h7v9h-7z M4 15h7v5H4z",
  report: "M4 4h16v16H4z M12 8v8 M8 12h8",
  ledger: "M5 3h14v18H5z M9 8h6 M9 12h6 M9 16h3",
  beacon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  guide: "M12 3 4 6v6c0 4.5 3.4 7.6 8 9 4.6-1.4 8-4.5 8-9V6z M12 11v5 M12 8v.01",
  user: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7",
  logout: "M10 4H4v16h6 M15 8l4 4-4 4 M19 12H9",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9 7 7 M17 17l2.1 2.1 M4.9 19.1 7 17 M17 7l2.1-2.1",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M16 16l5 5",
  arrowRight: "M4 12h16 M14 6l6 6-6 6",
  arrowLeft: "M20 12H4 M10 6l-6 6 6 6",
  arrowUpRight: "M7 17 17 7 M8 7h9v9",
  check: "M4 12.5 9.5 18 20 6.5",
  chevronDown: "M5 9l7 7 7-7",
  x: "M5 5l14 14 M19 5 5 19",
  alert: "M12 3 2 20h20z M12 10v5 M12 17.5v.5",
  pin: "M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  crosshair: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 1v5 M12 18v5 M1 12h5 M18 12h5",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  eyeOff: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M3 3l18 18",
  phone: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2",
  inbox: "M3 13h5l1 3h6l1-3h5 M3 13 6 5h12l3 8v6H3z",
  plus: "M12 5v14 M5 12h14",
  refresh: "M20 11a8 8 0 1 0-2.3 6.3 M20 4v7h-7",
  lock: "M5 11h14v10H5z M8 11V8a4 4 0 0 1 8 0v3",
  bell: "M6 17V11a6 6 0 0 1 12 0v6l2 2H4z M10 21h4",
  users: "M9 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M2 20c0-3.6 3.1-6 7-6s7 2.4 7 6 M17 5a3.2 3.2 0 0 1 0 6 M19 14.4c1.8.8 3 2.6 3 5.6",
};

export function Icon({ name, size = 20, className = "", strokeWidth = 1.6, ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

export function Logo({ size = 28 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 2.5 5 6.7v8.3c0 6.3 4.4 11.3 11 14 6.6-2.7 11-7.7 11-14V6.7z" fill="var(--signal)" />
      <path d="M16 11.2 20.2 16 16 20.8 11.8 16z" fill="var(--on-signal)" />
    </svg>
  );
}
