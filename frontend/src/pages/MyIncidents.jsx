import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus2, History } from "lucide-react";
import { errorMessage, incidentApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";
import { useAuth } from "../context/useAuth.js";
import {
  NEXT_STATUSES, categoryLabel, formatCoordinates, formatTime, isResolved,
  priorityLabel, responderName, shortId, statusLabel,
} from "../utils/incidents.js";

export default function MyIncidents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const fetchMode = user?.role === "supervisor" || user?.role === "admin" ? "all"
    : user?.role === "responder" ? "assigned" : "mine";

  const fetchIncidents = useCallback(async (opts = {}) => {
    if (opts.spin) setLoading(true);
    setError("");
    try {
      const res = fetchMode === "all" ? await incidentApi.getAll()
        : fetchMode === "assigned" ? await incidentApi.getAssigned()
        : await incidentApi.getMine();
      setIncidents(res.data?.incidents || []);
    } catch (err) {
      setError(errorMessage(err, "Failed to load incidents."));
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchMode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = fetchMode === "all" ? await incidentApi.getAll()
          : fetchMode === "assigned" ? await incidentApi.getAssigned()
          : await incidentApi.getMine();
        if (!cancelled) setIncidents(res.data?.incidents || []);
      } catch (err) {
        if (!cancelled) { setError(errorMessage(err, "Failed to load incidents.")); setIncidents([]); }
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [fetchMode]);

  useEffect(() => subscribeToIncidentEvents({
    "incident:status_updated": () => fetchIncidents(),
    "incident:assigned": () => fetchIncidents(),
    "incident:reassigned": () => fetchIncidents(),
  }), [fetchIncidents]);

  const active = useMemo(() => incidents.filter((i) => !isResolved(i.status)), [incidents]);
  const resolved = useMemo(() => incidents.filter((i) => isResolved(i.status)), [incidents]);
  const filtered = filter === "Active" ? active : filter === "Resolved" ? resolved : incidents;

  async function onStatus(incident, next) {
    if (!next || next === incident.status) return;
    setBusy(incident._id);
    setError("");
    try {
      const res = await incidentApi.updateStatus(incident._id, next);
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? res.data.incident : i)));
    } catch (err) {
      setError(errorMessage(err, "Update failed — you may not be authorized for this transition."));
    } finally {
      setBusy(null);
    }
  }

  const title = fetchMode === "all" ? "All incidents" : fetchMode === "assigned" ? "Assigned to me" : "My incidents";
  const sub = fetchMode === "all" ? "Review reported incidents and monitor response progress."
    : fetchMode === "assigned" ? "Cases assigned to you. Update status as you respond."
    : "Track the status of incidents you reported.";

  return (
    <div>
      <div className="page-head page-head-row">
        <div>
          <span className="eyebrow">{fetchMode === "all" ? "Authority records" : fetchMode === "assigned" ? "Responder" : "History"}</span>
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
        {fetchMode !== "all" && (
          <button className="btn btn-primary" onClick={() => navigate("/report")}><FilePlus2 style={{ width: 16, height: 16 }} /> Report incident</button>
        )}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card stat"><div className="stat-top">Total</div><div className="stat-num">{incidents.length}</div><div className="stat-sub">{fetchMode === "all" ? "All records" : "Reports"}</div></div>
        <div className="card stat"><div className="stat-top">Active</div><div className="stat-num">{active.length}</div><div className="stat-sub">Awaiting resolution</div></div>
        <div className="card stat"><div className="stat-top">Resolved</div><div className="stat-num">{resolved.length}</div><div className="stat-sub">Completed reports</div></div>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="card">
        <div className="card-head">
          <div className="filter-row">
            {["All", "Active", "Resolved"].map((opt) => (
              <button key={opt} className={`filter-btn ${filter === opt ? "active" : ""}`} onClick={() => setFilter(opt)}>
                {opt} <span>{opt === "All" ? incidents.length : opt === "Active" ? active.length : resolved.length}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-soft btn-sm" onClick={() => fetchIncidents({ spin: true })}>Refresh</button>
        </div>

        {loading ? (
          <div style={{ padding: 22, display: "grid", gap: 12 }}>
            <div className="skeleton" style={{ height: 18, width: "70%" }} />
            <div className="skeleton" style={{ height: 18, width: "55%" }} />
            <div className="skeleton" style={{ height: 18, width: "62%" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><History /></div>
            <h3>No {filter === "All" ? "" : filter.toLowerCase() + " "}incidents</h3>
            <p>{filter === "All" ? "Reports will appear here." : "Nothing in this view right now."}</p>
            {fetchMode === "mine" && filter === "All" && (
              <button className="btn btn-primary" onClick={() => navigate("/report")}><FilePlus2 style={{ width: 16, height: 16 }} /> Report an incident</button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Incident</th><th>Location</th><th>Reported</th><th>Responder</th><th>Priority</th><th>Status</th>
                {(fetchMode === "assigned" || fetchMode === "all") && <th>Update</th>}
              </tr></thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr key={inc._id} className="row-clickable" onClick={() => navigate(`/incidents/${inc._id}`)}>
                    <td>
                      <span className="id-mono">{shortId(inc)}</span>
                      <strong style={{ display: "block", marginTop: 3 }}>{categoryLabel(inc.category)}</strong>
                      <span className="table-secondary">{inc.description}</span>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{formatCoordinates(inc)}</td>
                    <td style={{ color: "var(--muted)" }}>{formatTime(inc)}</td>
                    <td>{responderName(inc)}</td>
                    <td><span className={`pill pill-${(inc.priority || "medium").toLowerCase()}`}>{priorityLabel(inc.priority)}</span></td>
                    <td><span className={`pill pill-${statusLabel(inc.status).toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(inc.status)}</span></td>
                    {(fetchMode === "assigned" || fetchMode === "all") && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <select className="select" value={inc.status} disabled={busy === inc._id || !(NEXT_STATUSES[inc.status] || []).length}
                          onChange={(e) => onStatus(inc, e.target.value)} aria-label={`Update ${shortId(inc)}`}>
                          <option value={inc.status}>{statusLabel(inc.status)}</option>
                          {(NEXT_STATUSES[inc.status] || []).map((s) => <option key={s} value={s}>→ {statusLabel(s)}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {fetchMode === "mine" && (
        <div className="card" style={{ marginTop: 20, padding: 22 }}>
          <h3 style={{ fontSize: 15 }}>Response progress</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }} className="step-grid" >
            {[["Reported", "Your report was submitted."], ["Assigned", "A responder is on the case."], ["On scene", "Responder has arrived."], ["Resolved", "Marked complete."]].map(([t, d], i) => (
              <div key={t} style={{ padding: 14, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--emerald-dark)" }}>0{i + 1}</span>
                <strong style={{ display: "block", marginTop: 6, fontSize: 13 }}>{t}</strong>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
