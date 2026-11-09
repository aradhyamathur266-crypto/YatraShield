import { useEffect, useState } from "react";
import { checkHealth } from "../api/api.js";

/**
 * Shows a dismissible banner when the backend is in no-DB mode
 * (MongoDB not configured/running). App shell stays usable.
 */
export default function BackendStatus() {
  const [health, setHealth] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkHealth().then((data) => {
      if (!cancelled) setHealth(data);
    });
    const id = setInterval(() => {
      checkHealth().then((data) => {
        if (!cancelled) setHealth(data);
      });
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (dismissed) return null;
  if (health && health.status === "ok") return null;

  const offline = health === null;

  return (
    <div className="backend-status-banner" role="status">
      <span className="demo-dot" />
      <strong>{offline ? "Backend not reachable" : "Preview mode — no database"}</strong>
      <span>
        {offline
          ? "Start the backend (root: npm run dev) to use login/incidents. The UI still loads."
          : "MongoDB isn't connected, so login/incidents return 503. Set MONGO_URI in backend/.env when ready."}
      </span>
      <button type="button" className="link-button" onClick={() => setDismissed(true)}>
        Dismiss
      </button>
    </div>
  );
}
