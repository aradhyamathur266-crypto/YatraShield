import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage, incidentApi } from "../api/api.js";
import { Icon } from "../components/Icon.jsx";
import { Empty, ListSkeleton, Notice, PageHead, PriorityChip, Segmented, Select, StatusChip } from "../components/ui.jsx";
import { useAuth } from "../context/useAuth.js";
import { modeForRole, useIncidents } from "../hooks/useIncidents.js";
import { toast } from "../utils/toast.js";
import {
  NEXT_STATUSES, categoryLabel, formatCoordinates, isResolved, responderName, shortId, statusLabel, timeAgo,
} from "../utils/incidents.js";

const COPY = {
  all: { eyebrow: "Authority records", title: "All incidents", sub: "Review reported incidents and monitor response progress." },
  assigned: { eyebrow: "Responder", title: "Assigned to me", sub: "Cases assigned to you. Update status as you respond." },
  mine: { eyebrow: "History", title: "My incidents", sub: "Track the status of incidents you reported." },
};

const STEPS = [
  ["Reported", "Your report is in the queue."],
  ["Assigned", "A responder is on the case."],
  ["On scene", "A responder has arrived."],
  ["Resolved", "The case is marked complete."],
];

export default function MyIncidents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mode = modeForRole(user?.role);
  const { incidents, setIncidents, loading, error, setError, refresh } = useIncidents(mode);
  const [filter, setFilter] = useState("All");
  const [busy, setBusy] = useState(null);

  const active = useMemo(() => incidents.filter((i) => !isResolved(i.status)), [incidents]);
  const resolved = useMemo(() => incidents.filter((i) => isResolved(i.status)), [incidents]);
  const filtered = filter === "Active" ? active : filter === "Resolved" ? resolved : incidents;
  const canUpdate = mode === "assigned" || mode === "all";
  const copy = COPY[mode];

  async function onStatus(incident, next) {
    if (!next || next === incident.status) return;
    setBusy(incident._id);
    setError("");
    try {
      const res = await incidentApi.updateStatus(incident._id, next);
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? res.data.incident : i)));
      toast(`${shortId(incident)} → ${statusLabel(next)}`);
    } catch (err) {
      setError(errorMessage(err, "Update failed — you may not be authorized for this transition."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page">
      <PageHead
        eyebrow={copy.eyebrow}
        title={copy.title}
        actions={
          mode !== "all" && (
            <Link to="/report" className="btn btn-primary"><Icon name="plus" size={16} /> Report incident</Link>
          )
        }
      >
        {copy.sub}
      </PageHead>

      <div className="metrics metrics-3">
        <div className="metric"><span className="metric-label">Total</span><span className="metric-num">{incidents.length}</span><span className="metric-sub">{mode === "all" ? "All records" : "Reports"}</span></div>
        <div className="metric"><span className="metric-label">Active</span><span className="metric-num">{active.length}</span><span className="metric-sub">Awaiting resolution</span></div>
        <div className="metric"><span className="metric-label">Resolved</span><span className="metric-num">{resolved.length}</span><span className="metric-sub">Completed</span></div>
      </div>

      {error && <Notice tone="error" onDismiss={() => setError("")}>{error}</Notice>}

      <section className="card">
        <div className="card-head">
          <Segmented
            label="Filter incidents"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "All", label: "All", count: incidents.length },
              { value: "Active", label: "Active", count: active.length },
              { value: "Resolved", label: "Resolved", count: resolved.length },
            ]}
          />
          <button type="button" className="btn btn-sm btn-ghost" onClick={refresh}>
            <Icon name="refresh" size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <Empty
            icon="ledger"
            title={`No ${filter === "All" ? "" : `${filter.toLowerCase()} `}incidents`}
            action={
              mode === "mine" && filter === "All" ? (
                <Link to="/report" className="btn btn-primary"><Icon name="plus" size={16} /> Report an incident</Link>
              ) : null
            }
          >
            {filter === "All" ? "Reports will appear here." : "Nothing in this view right now."}
          </Empty>
        ) : (
          <div className="table-scroll">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Incident</th><th>Location</th><th>Reported</th><th>Responder</th><th>Priority</th><th>Status</th>
                  {canUpdate && <th>Update</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => {
                  const next = NEXT_STATUSES[inc.status] || [];
                  return (
                    <tr key={inc._id} className="is-link" onClick={() => navigate(`/incidents/${inc._id}`)}>
                      <td data-label="Incident" className="cell-main">
                        <span className="mono id">{shortId(inc)}</span>
                        <Link to={`/incidents/${inc._id}`} className="cell-title" onClick={(e) => e.stopPropagation()}>
                          {categoryLabel(inc.category)}
                        </Link>
                        <span className="cell-sub clamp-1">{inc.description}</span>
                      </td>
                      <td data-label="Location" className="mono cell-muted">{formatCoordinates(inc)}</td>
                      <td data-label="Reported" className="cell-muted">{timeAgo(inc)}</td>
                      <td data-label="Responder">{responderName(inc)}</td>
                      <td data-label="Priority"><PriorityChip priority={inc.priority} /></td>
                      <td data-label="Status"><StatusChip status={inc.status} /></td>
                      {canUpdate && (
                        <td data-label="Update" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={inc.status}
                            disabled={busy === inc._id || next.length === 0}
                            onChange={(e) => onStatus(inc, e.target.value)}
                            aria-label={`Update status of ${shortId(inc)}`}
                          >
                            <option value={inc.status}>{statusLabel(inc.status)}</option>
                            {next.map((s) => <option key={s} value={s}>→ {statusLabel(s)}</option>)}
                          </Select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {mode === "mine" && (
        <section className="card card-pad">
          <h2 className="card-title">How a response unfolds</h2>
          <ol className="steps">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <span className="mono steps-no">0{i + 1}</span>
                <strong>{t}</strong>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
