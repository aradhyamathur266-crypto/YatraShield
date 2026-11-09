import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage, incidentApi, userApi } from "../api/api.js";
import { Icon } from "../components/Icon.jsx";
import { Empty, ListSkeleton, Notice, PageHead, PriorityChip, Select, Skeleton, StatusChip } from "../components/ui.jsx";
import { useIncidents } from "../hooks/useIncidents.js";
import { incidentLatLng } from "../utils/geo.js";
import {
  NEXT_STATUSES, STATUSES, categoryLabel, formatCoordinates, isResolved, priorityTone, reportedByName, shortId,
  statusLabel, timeAgo,
} from "../utils/incidents.js";
import { toast } from "../utils/toast.js";

const MapView = lazy(() => import("../components/MapView.jsx"));

const canAssign = (status) => ["TRIAGED", "ESCALATED", "ASSIGNED"].includes(status);
const assignedId = (inc) => inc.assignedResponder?._id || inc.assignedResponder || "";

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const { incidents, setIncidents, loading, error, setError, refresh } = useIncidents("all");
  const [responders, setResponders] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [busyAssign, setBusyAssign] = useState(null);
  const [busyStatus, setBusyStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    userApi
      .listResponders()
      .then((res) => {
        if (!cancelled) setResponders(res.data?.responders || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function onAssign(incident, responderId) {
    if (!responderId) return;
    setBusyAssign(incident._id);
    try {
      const res = await incidentApi.assign(incident._id, responderId);
      setIncidents((p) => p.map((i) => (i._id === incident._id ? res.data.incident : i)));
      toast(`${shortId(incident)} assigned to ${responders.find((r) => r._id === responderId)?.name || "responder"}`);
    } catch (err) {
      setError(errorMessage(err, "Assignment failed."));
    } finally {
      setBusyAssign(null);
    }
  }

  async function onStatus(incident, next) {
    if (!next || next === incident.status) return;
    setBusyStatus(incident._id);
    try {
      const res = await incidentApi.updateStatus(incident._id, next);
      setIncidents((p) => p.map((i) => (i._id === incident._id ? res.data.incident : i)));
      toast(`${shortId(incident)} → ${statusLabel(next)}`);
    } catch (err) {
      setError(errorMessage(err, "Update failed."));
    } finally {
      setBusyStatus(null);
    }
  }

  const filtered = useMemo(
    () =>
      incidents.filter((i) => {
        const p = priorityFilter === "All" || priorityTone(i.priority) === priorityFilter.toLowerCase();
        const s = statusFilter === "All" || i.status === statusFilter;
        return p && s;
      }),
    [incidents, priorityFilter, statusFilter]
  );

  const open = useMemo(() => incidents.filter((i) => !isResolved(i.status)), [incidents]);
  const criticalCount = open.filter((i) => priorityTone(i.priority) === "critical").length;
  const unassignedCount = open.filter((i) => !i.assignedResponder).length;
  const resolvedCount = incidents.length - open.length;

  const workload = useMemo(
    () => responders.map((r) => ({ ...r, active: open.filter((i) => assignedId(i) === r._id).length })),
    [responders, open]
  );

  const markers = useMemo(
    () =>
      open.flatMap((inc) => {
        const position = incidentLatLng(inc);
        if (!position) return [];
        const tone = priorityTone(inc.priority);
        return [{
          id: inc._id,
          position,
          tone,
          kind: "incident",
          pulse: tone === "critical",
          label: `${shortId(inc)} ${categoryLabel(inc.category)}`,
        }];
      }),
    [open]
  );

  return (
    <div className="page">
      <PageHead eyebrow="Authority control room" title={<>Incident <em>management.</em></>}
        actions={<span className="status-pill" data-state="ready"><i className="live-dot" /> Live feed</span>}>
        Review the queue, assign responders and track response progress.
      </PageHead>

      <div className="metrics">
        <div className="metric"><span className="metric-label">Open</span><span className="metric-num">{open.length}</span><span className="metric-sub">Awaiting closure</span></div>
        <div className="metric" data-tone={criticalCount ? "critical" : undefined}><span className="metric-label">Critical</span><span className="metric-num">{criticalCount}</span><span className="metric-sub">Immediate attention</span></div>
        <div className="metric" data-tone={unassignedCount ? "high" : undefined}><span className="metric-label">Unassigned</span><span className="metric-num">{unassignedCount}</span><span className="metric-sub">Need a responder</span></div>
        <div className="metric"><span className="metric-label">Resolved</span><span className="metric-num">{resolvedCount}</span><span className="metric-sub">Closed records</span></div>
      </div>

      {error && <Notice tone="error" onDismiss={() => setError("")}>{error}</Notice>}

      <section className="card map-card" aria-labelledby="ops-map-h">
        <div className="card-head">
          <div>
            <h2 id="ops-map-h" className="card-title">Operations map</h2>
            <p className="card-sub">Open incidents by priority. Select a marker for details.</p>
          </div>
          <ul className="legend" aria-label="Legend">
            <li><i data-tone="critical" /> Critical</li>
            <li><i data-tone="high" /> High</li>
            <li><i data-tone="medium" /> Medium</li>
            <li><i data-tone="low" /> Low</li>
          </ul>
        </div>
        <div className="map-stage is-short">
          <Suspense fallback={<Skeleton height="100%" style={{ position: "absolute", inset: 0 }} />}>
            <MapView
              className="map-fill"
              markers={markers}
              fit
              zoom={12}
              label="Open incidents map"
              onMarkerClick={(id) => navigate(`/incidents/${id}`)}
            />
          </Suspense>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Incident queue</h2>
            <p className="card-sub">Assign responders and advance status.</p>
          </div>
          <div className="toolbar">
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority">
              <option value="All">All priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </Select>
            <button type="button" className="btn btn-sm btn-ghost" onClick={refresh}><Icon name="refresh" size={14} /> Refresh</button>
          </div>
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <Empty icon="inbox" title="No incidents match">Adjust the filters or wait for new reports.</Empty>
        ) : (
          <div className="table-scroll">
            <table className="ledger">
              <thead>
                <tr><th>Incident</th><th>Reporter</th><th>Location</th><th>Priority</th><th>Status</th><th>Responder</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((inc) => {
                  const next = NEXT_STATUSES[inc.status] || [];
                  return (
                    <tr key={inc._id}>
                      <td data-label="Incident" className="cell-main">
                        <span className="mono id">{shortId(inc)}</span>
                        <Link to={`/incidents/${inc._id}`} className="cell-title">{categoryLabel(inc.category)}</Link>
                        <span className="cell-sub">{timeAgo(inc)}</span>
                      </td>
                      <td data-label="Reporter" className="cell-muted">{reportedByName(inc)}</td>
                      <td data-label="Location" className="mono cell-muted">{formatCoordinates(inc)}</td>
                      <td data-label="Priority"><PriorityChip priority={inc.priority} /></td>
                      <td data-label="Status"><StatusChip status={inc.status} /></td>
                      <td data-label="Responder">
                        <Select
                          value={assignedId(inc)}
                          disabled={busyAssign === inc._id || !canAssign(inc.status)}
                          onChange={(e) => onAssign(inc, e.target.value)}
                          aria-label={`Assign ${shortId(inc)}`}
                        >
                          <option value="">Unassigned</option>
                          {responders.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                        </Select>
                        {!canAssign(inc.status) && <span className="cell-hint">Triage first to assign</span>}
                      </td>
                      <td data-label="Actions">
                        <Select
                          value={inc.status}
                          disabled={busyStatus === inc._id || next.length === 0}
                          onChange={(e) => onStatus(inc, e.target.value)}
                          aria-label={`Status for ${shortId(inc)}`}
                        >
                          <option value={inc.status}>{statusLabel(inc.status)}</option>
                          {next.map((s) => <option key={s} value={s}>→ {statusLabel(s)}</option>)}
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Responders</h2>
            <p className="card-sub">Current workload from live assignments.</p>
          </div>
          <span className="chip" data-tone="neutral">{responders.length} on roster</span>
        </div>
        {workload.length === 0 ? (
          <Empty icon="users" title="No responder accounts yet">Register one with the Responder role.</Empty>
        ) : (
          <ul className="roster">
            {workload.map((r) => (
              <li key={r._id}>
                <span className="avatar" aria-hidden="true">{r.name.charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.email}</span>
                </div>
                <span className="chip" data-tone={r.active === 0 ? "ok" : "warn"}>
                  <i className="chip-dot" />
                  {r.active === 0 ? "Available" : `${r.active} active`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
