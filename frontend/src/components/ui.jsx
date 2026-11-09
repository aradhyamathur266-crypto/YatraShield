import { Icon } from "./Icon.jsx";
import { priorityLabel, priorityTone, statusLabel, statusTone } from "../utils/incidents.js";

export function PriorityChip({ priority }) {
  return (
    <span className="chip" data-tone={priorityTone(priority)}>
      <i className="chip-dot" />
      {priorityLabel(priority)}
    </span>
  );
}

export function StatusChip({ status }) {
  return (
    <span className="chip" data-tone={statusTone(status)}>
      <i className="chip-dot" />
      {statusLabel(status)}
    </span>
  );
}

export function PageHead({ eyebrow, title, children, actions, align = "start" }) {
  return (
    <header className={`page-head ${align === "center" ? "is-center" : ""}`}>
      <div className="page-head-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="page-head-sub">{children}</p>}
      </div>
      {actions && <div className="page-head-actions">{actions}</div>}
    </header>
  );
}

export function Notice({ tone = "info", children, onDismiss }) {
  return (
    <div className="notice" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      <Icon name={tone === "error" ? "alert" : tone === "ok" ? "check" : "pin"} size={17} />
      <div className="notice-body">{children}</div>
      {onDismiss && (
        <button type="button" className="icon-btn is-small" onClick={onDismiss} aria-label="Dismiss">
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

export function Empty({ icon = "inbox", title, children, action }) {
  return (
    <div className="empty">
      <span className="empty-mark"><Icon name={icon} size={22} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ height = 16, width = "100%", style }) {
  return <div className="skeleton" style={{ height, width, ...style }} />;
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="list-skeleton" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={44} />
      ))}
    </div>
  );
}

/** Sliding-thumb segmented control. */
export function Segmented({ options, value, onChange, label, className = "" }) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      className={`seg ${className}`}
      role="group"
      aria-label={label}
      style={{ "--seg-n": options.length, "--seg-i": index }}
    >
      <span className="seg-thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="seg-btn"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && <span className="seg-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <span className={`select ${className}`}>
      <select {...props}>{children}</select>
      <Icon name="chevronDown" size={14} />
    </span>
  );
}
