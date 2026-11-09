import { useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { checkHealth } from "../api/api.js";

export default function BackendStatus() {
  const [health, setHealth] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkHealth().then((data) => { if (!cancelled) setHealth(data); });
    const id = setInterval(() => {
      checkHealth().then((data) => { if (!cancelled) setHealth(data); });
    }, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (dismissed || (health && health.status === "ok")) return null;
  if (!health) return null; // be quiet while we don't know; banner shows once we do

  return (
    <div className="backend-banner" role="status">
      <TriangleAlert />
      <strong>Preview mode — no database</strong>
      <span>Login &amp; incidents need MongoDB. Set `MONGO_URI` in `backend/.env` when ready.</span>
      <button className="link-btn" onClick={() => setDismissed(true)} aria-label="Dismiss">
        <X style={{ width: 14, height: 14 }} /> Dismiss
      </button>
    </div>
  );
}
