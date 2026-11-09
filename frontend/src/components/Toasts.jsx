import { Icon } from "./Icon.jsx";

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className="toast" data-type={t.type} role="status">
          <Icon name={t.type === "error" ? "alert" : t.type === "info" ? "bell" : "check"} size={16} />
          <span>{t.message}</span>
          <button type="button" className="icon-btn is-small" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
