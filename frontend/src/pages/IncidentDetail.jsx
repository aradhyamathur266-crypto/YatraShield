import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { errorMessage, incidentApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";
import { Icon } from "../components/Icon.jsx";
import { useAuth } from "../context/useAuth.js";
import { Empty, Notice, PriorityChip, Select, Skeleton, StatusChip } from "../components/ui.jsx";
import { INCIDENT_EVENTS } from "../hooks/useIncidents.js";
import { GURUGRAM, incidentLatLng } from "../utils/geo.js";
import {
  NEXT_STATUSES, categoryLabel, formatCoordinates, formatTime, priorityTone, reportedByName, shortId, statusLabel,
} from "../utils/incidents.js";
import { toast } from "../utils/toast.js";

const MapView = lazy(() => import("../components/MapView.jsx"));

const FLOW = ["REPORTED", "TRIAGED", "ASSIGNED", "ACKNOWLEDGED", "EN_ROUTE", "ON_SITE", "RESOLVED", "CLOSED"];

// Keyed by id so navigating between incidents never flashes stale data.
export default function IncidentDetailRoute() {
  const { id } = useParams();
  return <IncidentDetail key={id} id={id} />;
}

function IncidentDetail({ id }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({ incident: null, loading: true, error: "" });
  const [busy, setBusy] = useState(false);
  const { incident, loading, error } = state;

  const load = useCallback(async () => {
    try {
      const res = await incidentApi.getById(id);
      setState({ incident: res.data?.incident || null, loading: false, error: "" });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: errorMessage(err, "Incident not found or not accessible.") }));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let timer;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(load, 300);
    };
    const off = subscribeToIncidentEvents(Object.fromEntries(INCIDENT_EVENTS.map((e) => [e, schedule])));
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [load]);

  async function onStatus(next) {
    if (!next || next === incident.status) return;
    setBusy(true);
    try {
      const res = await incidentApi.updateStatus(id, next);
      setState({ incident: res.data.incident, loading: false, error: "" });
      toast(`${shortId(incident)} → ${statusLabel(next)}`);
    } catch (err) {
      setState((s) => ({ ...s, error: errorMessage(err, "Update failed.") }));
    } finally {
      setBusy(false);
    }
  }

  const position = incident ? incidentLatLng(incident) : null;
  const markers = useMemo(
    () =>
      incident && position
        ? [{
            id: incident._id,
            position,
            tone: priorityTone(incident.priority),
            kind: "incident",
            pulse: priorityTone(incident.priority) === "critical",
            label: `${shortId(incident)} location`,
          }]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [incident?._id, incident?.priority, position?.[0], position?.[1]]
  );

  if (loading) {
    return (
      <div className="page" aria-busy="true">
        <Skeleton height={16} width={90} />
        <Skeleton height={44} width="min(460px, 80%)" style={{ marginTop: 16 }} />
        <div className="detail-grid" style={{ marginTop: 24 }}>
          <Skeleton height={380} />
          <Skeleton height={380} />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="page">
        <Empty
          icon="clock"
          title="Incident not found"
          action={<Link to="/incidents" className="btn btn-primary">Back to incidents</Link>}
        >
          {error || "It may have been deleted, or you don’t have access."}
        </Empty>
      </div>
    );
  }

  const currentIdx = FLOW.indexOf(incident.status);
  const next = NEXT_STATUSES[incident.status] || [];
  const escalated = incident.status === "ESCALATED";

  return (
    <div className="page">
      <header className="page-head detail-head">
        <div className="page-head-copy">
          <button type="button" className="back-link" onClick={() => navigate(-1)}>
            <Icon name="arrowLeft" size={15} /> Back
          </button>
          <p className="eyebrow mono">{shortId(incident)}</p>
          <h1>{categoryLabel(incident.category)}</h1>
          <p className="page-head-sub">{formatTime(incident)}</p>
        </div>
        <div className="page-head-actions chips">
          <PriorityChip priority={incident.priority} />
          <StatusChip status={incident.status} />
        </div>
      </header>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="detail-grid">
        <div className="stack">
          <section className="card map-card" aria-label="Location">
            <div className="map-stage is-medium">
              <Suspense fallback={<Skeleton height="100%" style={{ position: "absolute", inset: 0 }} />}>
                <MapView
                  className="map-fill"
                  markers={markers}
                  initialCenter={position || GURUGRAM}
                  zoom={15}
                  fit
                  label="Incident location"
                />
              </Suspense>
              <div className="map-note">
                <Icon name="pin" size={16} />
                <div><strong>Reported location</strong><span className="mono">{formatCoordinates(incident)}</span></div>
              </div>
            </div>
          </section>

          <section className="card card-pad">
            <h2 className="card-title">Description</h2>
            <p className="prose">{incident.description}</p>
            <dl className="facts">
              <div><dt>Reported by</dt><dd>{reportedByName(incident)}</dd></div>
              <div><dt>Responder</dt><dd>{incident.assignedResponder?.name || "Unassigned"}</dd></div>
              {incident.assignedAt && <div><dt>Assigned</dt><dd>{new Date(incident.assignedAt).toLocaleString()}</dd></div>}
            </dl>
          </section>
        </div>

        <div className="stack">
          <section className="card card-pad">
            <h2 className="card-title">Progress</h2>
            <ol className="timeline">
              {FLOW.map((s, i) => {
                if (s === "CLOSED" && incident.status !== "CLOSED" && currentIdx < FLOW.indexOf("RESOLVED")) return null;
                const done = currentIdx !== -1 && i < currentIdx;
                const current = s === incident.status;
                return (
                  <li key={s} className={`tl ${done ? "is-done" : ""} ${current ? "is-current" : ""}`}>
                    <span className="tl-dot">{done ? <Icon name="check" size={11} strokeWidth={2.6} /> : null}</span>
                    <div>
                      <strong>{statusLabel(s)}</strong>
                      <small>{current ? "Current status" : done ? "Completed" : "Pending"}</small>
                    </div>
                  </li>
                );
              })}
            </ol>
            {escalated && (
              <p className="callout" data-tone="critical">
                This incident was escalated and is waiting to be re-triaged or reassigned.
              </p>
            )}

            {next.length > 0 && user?.role !== "tourist" && (
              <label className="field field-tight">
                <span>Advance status</span>
                <Select value={incident.status} disabled={busy} onChange={(e) => onStatus(e.target.value)} className="is-block">
                  <option value={incident.status}>{statusLabel(incident.status)}</option>
                  {next.map((s) => <option key={s} value={s}>→ {statusLabel(s)}</option>)}
                </Select>
              </label>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
