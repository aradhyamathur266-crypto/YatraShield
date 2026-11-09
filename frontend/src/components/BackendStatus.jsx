import { useEffect, useState } from "react";
import { checkHealth } from "../api/api.js";
import { Icon } from "./Icon.jsx";

// "unknown" until the first probe returns, so we never flash a false alarm.
export default function BackendStatus() {
  const [health, setHealth] = useState("unknown");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const probe = () =>
      checkHealth().then((data) => {
        if (!cancelled) setHealth(data);
      });
    probe();
    const id = setInterval(probe, 15000);
    const onVisible = () => document.visibilityState === "visible" && probe();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (health === "unknown") return null;
  if (health && health.status === "ok") return null;
  if (dismissed) return null;

  const unreachable = health === null;

  return (
    <div className="banner" data-tone={unreachable ? "error" : "warn"} role="status">
      <Icon name="alert" size={16} />
      <p>
        <strong>{unreachable ? "Server unreachable" : "Preview mode — no database"}</strong>
        <span>
          {unreachable
            ? " The API isn’t responding. Reports and live updates are paused."
            : " Sign-in and incidents need MongoDB. Set MONGO_URI in backend/.env."}
        </span>
      </p>
      <button type="button" className="icon-btn is-small" onClick={() => setDismissed(true)} aria-label="Dismiss">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
