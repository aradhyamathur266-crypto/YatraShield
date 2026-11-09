import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert, Clock3, Inbox, ShieldCheck, TriangleAlert } from "lucide-react";
import { errorMessage, incidentApi, userApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";
import { NEXT_STATUSES, STATUSES, categoryLabel, formatCoordinates, formatTime, priorityLabel, reportedByName, shortId, statusLabel } from "../utils/incidents.js";

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyAssign, setBusyAssign] = useState(null);
  const [busyStatus, setBusyStatus] = useState(null);

  const fetchAll = useCallback(async (opts = {}) => {
    if (opts.spin) setLoading(true);
    try {
      const [incRes, resRes] = await Promise.all([
        incidentApi.getAll(),
        userApi.listResponders().catch(() => ({ data: { responders: [] } })),
      ]);
      setIncidents(incRes.data?.incidents || []);
      setResponders(resRes.data?.responders || []);
    } catch (err) {
      setMessage(errorMessage(err, "Failed to load incidents."));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [incRes, resRes] = await Promise.all([
          incidentApi.getAll(),
          userApi.listResponders().catch(() => ({ data: { responders: [] } })),
        ]);
        if (cancelled) return;
        setIncidents(incRes.data?.incidents || []);
        setResponders(resRes.data?.responders || []);
      } catch (err) {
        if (!cancelled) { setMessage(errorMessage(err, "Failed to load incidents.")); setMessageType("error"); }
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => subscribeToIncidentEvents({
    "incident:status_updated": () => fetchAll(),
    "incident:assigned": () => fetchAll(),
    "incident:reassigned": () => fetchAll(),
  }), [fetchAll]);

  async function onAssign(incident, responderId) {
    if (!responderId) return;
    setBusyAssign(incident._id); setMessage("");
    try {
      const res = await incidentApi.assign(incident._id, responderId);
      setIncidents((p) => p.map((i) => (i._id === incident._id ? res.data.incident : i)));
      setMessage(`Assigned to ${responders.find((r) => r._id === responderId)?.name || "responder"} — ${shortId(incident)}.`);
      setMessageType("success");
    } catch (err) { setMessage(errorMessage(err, "Assignment failed.")); setMessageType("error"); }
    finally { setBusyAssign(null); }
  }

  async function onStatus(incident, next) {
    if (!next || next === incident.status) return;
    setBusyStatus(incident._id); setMessage("");
    try {
      const res = await incidentApi.updateStatus(incident._id, next);
      setIncidents((p) => p.map((i) => (i._id === incident._id ? res.data.incident : i)));
      setMessage(`${shortId(incident)} → ${statusLabel(next)}.`);
      setMessageType("success");
    } catch (err) { setMessage(errorMessage(err, "Update failed.")); setMessageType("error"); }
    finally { setBusyStatus(null); }
  }

  const filtered = useMemo(() => incidents.filter((i) => {
    const p = priorityFilter === "All" || (i.priority || "").toLowerCase() === priorityFilter.toLowerCase();
    const s = statusFilter === "All" || i.status === statusFilter;
    return p && s;
  }), [incidents, priorityFilter, statusFilter]);

  const activeCount = incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const criticalCount = incidents.filter((i) => (i.priority || "").toLowerCase() === "critical" && i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const unassignedCount = incidents.filter((i) => !i.assignedResponder && i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED").length;

  const workload = useMemo(() => responders.map((r) => ({
    ...r,
    active: incidents.filter((i) => (i.assignedResponder?._id || i.assignedResponder) === r._id && i.status !== "RESOLVED" && i.status !== "CLOSED").length,
  })), [responders, incidents]);

  const canAssign = (status) => ["TRIAGED", "ESCALATED", "ASSIGNED"].includes(status);

  return (
    <div>
      <div className="page-head page-head-row">
        <div>
          <span className="eyebrow">Authority control center</span>
          <h1>Incident management</h1>
          <p>Review the queue, assign responders, and track response progress.</p>
        </div>
        <span className="pill pill-resolved"><span className="live-dot" /> Live backend</span>
      </div>

      <div className="stat-grid">
        <div className="card stat"><div className="stat-top">Active <Inbox /></div><div className="stat-num">{activeCount}</div><div className="stat-sub">Awaiting closure</div></div>
        <div className="card stat"><div className="stat-top">Critical <CircleAlert /></div><div className="stat-num">{criticalCount}</div><div className="stat-sub">Immediate attention</div></div>
        <div className="card stat"><div className="stat-top">Unassigned <TriangleAlert /></div><div className="stat-num">{unassignedCount}</div><div className="stat-sub">Need a responder</div></div>
        <div className="card stat"><div className="stat-top">Resolved <ShieldCheck /></div><div className="stat-num">{resolvedCount}</div><div className="stat-sub">Closed records</div></div>
      </div>

      {message && <div className={`alert ${messageType === "error" ? "alert-error" : "alert-success"}`} role="status">{message}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div><h3>Incident queue</h3><p>Assign responders and advance status.</p></div>
          <div className="toolbar">
            <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Priority filter">
              <option value="All">All priorities</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
            </select>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status filter">
              <option value="All">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <button className="btn btn-soft btn-sm" onClick={() => fetchAll({ spin: true })}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 22, display: "grid", gap: 12 }}>
            <div className="skeleton" style={{ height: 18, width: "70%" }} />
            <div className="skeleton" style={{ height: 18, width: "55%" }} />
            <div className="skeleton" style={{ height: 18, width: "62%" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon"><Inbox /></div><h3>No incidents match</h3><p>Adjust filters or wait for new reports.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Incident</th><th>Reporter</th><th>Location</th><th>Priority</th><th>Status</th><th>Responder</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((inc) => {
                  const responderId = inc.assignedResponder?._id || inc.assignedResponder || "";
                  const next = NEXT_STATUSES[inc.status] || [];
                  return (
                    <tr key={inc._id}>
                      <td>
                        <span className="id-mono">{shortId(inc)}</span>
                        <strong style={{ display: "block", marginTop: 3 }}>{categoryLabel(inc.category)}</strong>
                        <span className="table-secondary">{formatTime(inc)}</span>
                      </td>
                      <td style={{ color: "var(--muted)" }}>{reportedByName(inc)}</td>
                      <td style={{ color: "var(--muted)" }}>{formatCoordinates(inc)}</td>
                      <td><span className={`pill pill-${(inc.priority || "medium").toLowerCase()}`}>{priorityLabel(inc.priority)}</span></td>
                      <td><span className={`pill pill-${statusLabel(inc.status).toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(inc.status)}</span></td>
                      <td>
                        <select className="select" value={responderId} disabled={busyAssign === inc._id || !canAssign(inc.status)}
                          onChange={(e) => onAssign(inc, e.target.value)} aria-label={`Assign ${shortId(inc)}`}>
                          <option value="">Unassigned</option>
                          {responders.map((r) => <option key={r.S._id || r._id} value={r._id}>{r.name}</option>)}
                        </select>
                        {!canAssign(inc.status) && <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 5 }}>Needs TRIAGED</div>}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/incidents/${inc._id}`)}>Details</button>
                          <select className="select" value={inc.status} disabled={busyStatus === inc._id || !next.length}
                            onChange={(e) => onStatus(inc, e.target.value)} aria-label={`Status for ${shortId(inc)}`}>
                            <option value={inc.status}>{statusLabel(inc.status)}</option>
                            {next.map((s) => <option key={s} value={s}>→ {statusLabel(s)}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div><h3>Responder status</h3><p>Availability from backend accounts.</p></div><span className="role-chip">{responders.length} responders</span></div>
        {workload.length === 0 ? (
          <div className="empty"><div className="empty-icon"><Clock3 /></div><h3>No responder accounts yet</h3><p>Register one with the "Responder" role.</p></div>
        ) : (
          <div style={{ padding: 10 }}>
            {workload.map((r) => (
              <div key={r._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 12px", borderBottom: "1px solid var(--line)" }}>
                <span className="avatar">{r.name.charAt(0)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 13 }}>{r.name}</strong>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Field responder · {r.email}</div>
                </div>
                <span className={`pill ${r.active === 0 ? "pill-resolved" : "pill-medium"}`}>{r.active === 0 ? "Available" : `${r.active} active`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
