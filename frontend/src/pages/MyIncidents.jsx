import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage, incidentApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";
import { useAuth } from "../context/useAuth.js";
import {
  NEXT_STATUSES,
  categoryLabel,
  formatCoordinates,
  formatTime,
  isResolved,
  priorityLabel,
  responderName,
  shortId,
  statusLabel,
} from "../utils/incidents.js";

function MyIncidents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusBusy, setStatusBusy] = useState(null);

  const isAuthority = user?.role === "supervisor" || user?.role === "admin";
  const isResponder = user?.role === "responder";
  const fetchMode = isAuthority ? "all" : isResponder ? "assigned" : "mine";

  const fetchIncidents = useCallback(async (options = {}) => {
    if (options.spin) setLoading(true);
    setError("");
    try {
      const res =
        fetchMode === "all"
          ? await incidentApi.getAll()
          : fetchMode === "assigned"
          ? await incidentApi.getAssigned()
          : await incidentApi.getMine();
      setIncidents(res.data?.incidents || []);
    } catch (err) {
      setError(errorMessage(err, "Failed to load incidents. Is the backend running?"));
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchMode]);

  useEffect(() => {
    // Initial load inline (async callbacks set state, not sync effect body).
    let cancelled = false;
    async function loadInitial() {
      try {
        const res =
          fetchMode === "all"
            ? await incidentApi.getAll()
            : fetchMode === "assigned"
            ? await incidentApi.getAssigned()
            : await incidentApi.getMine();
        if (cancelled) return;
        setIncidents(res.data?.incidents || []);
      } catch (err) {
        if (cancelled) return;
        setError(errorMessage(err, "Failed to load incidents. Is the backend running?"));
        setIncidents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [fetchMode]);

  // Real-time: refresh when our own incident status changes.
  useEffect(() => {
    const unsubscribe = subscribeToIncidentEvents({
      "incident:status_updated": () => fetchIncidents(),
      "incident:assigned": () => fetchIncidents(),
      "incident:reassigned": () => fetchIncidents(),
    });
    return unsubscribe;
  }, [fetchIncidents]);

  const visibleIncidents = incidents;

  const activeIncidents = useMemo(
    () => visibleIncidents.filter((i) => !isResolved(i.status)),
    [visibleIncidents]
  );
  const resolvedIncidents = useMemo(
    () => visibleIncidents.filter((i) => isResolved(i.status)),
    [visibleIncidents]
  );

  const filteredIncidents = useMemo(() => {
    if (filter === "Active") return activeIncidents;
    if (filter === "Resolved") return resolvedIncidents;
    return visibleIncidents;
  }, [filter, activeIncidents, resolvedIncidents, visibleIncidents]);

  async function handleStatusChange(incident, nextStatus) {
    if (!nextStatus || nextStatus === incident.status) return;
    setStatusBusy(incident._id);
    setError("");
    try {
      const res = await incidentApi.updateStatus(incident._id, nextStatus);
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? res.data.incident : i)));
    } catch (err) {
      setError(errorMessage(err, "Status update failed. You may not be authorized for this transition."));
    } finally {
      setStatusBusy(null);
    }
  }

  const getStatusClass = (status = "REPORTED") =>
    `my-status my-status-${statusLabel(status).toLowerCase().replaceAll(" ", "-")}`;

  const getPriorityClass = (priority = "medium") =>
    `my-priority my-priority-${priority.toLowerCase()}`;

  const pageTitle = fetchMode === "all" ? "All incidents" : fetchMode === "assigned" ? "Assigned to me" : "My incidents";
  const sectionTitle = fetchMode === "all" ? "Incident records" : fetchMode === "assigned" ? "Your assignments" : "Your reports";
  const description =
    fetchMode === "all"
      ? "Review reported incidents and monitor their response progress."
      : fetchMode === "assigned"
      ? "Incidents assigned to you as a responder."
      : "Track the status of safety incidents you have reported.";

  return (
    <div className="incidents-page my-incidents-page">
      <div className="page-header">
        <p className="section-label">
          {fetchMode === "all" ? "AUTHORITY INCIDENT RECORDS" : fetchMode === "assigned" ? "RESPONDER ASSIGNMENTS" : "INCIDENT HISTORY"}
        </p>
        <h2>{pageTitle}</h2>
        <p>{description}</p>
      </div>

      <div className="my-incident-summary">
        <div className="my-summary-card">
          <span>Total reports</span>
          <strong>{visibleIncidents.length}</strong>
          <small>{fetchMode === "all" ? "All incident records" : fetchMode === "assigned" ? "Assigned incidents" : "Your submitted incidents"}</small>
        </div>
        <div className="my-summary-card">
          <span>Active</span>
          <strong>{activeIncidents.length}</strong>
          <small>Awaiting resolution</small>
        </div>
        <div className="my-summary-card">
          <span>Resolved</span>
          <strong>{resolvedIncidents.length}</strong>
          <small>Completed reports</small>
        </div>
      </div>

      {error && <p className="form-message error-message" role="alert">{error}</p>}

      <section className="my-reports-section">
        <div className="my-reports-toolbar">
          <div>
            <p className="section-label">{sectionTitle.toUpperCase()}</p>
            <h2>Incident activity</h2>
          </div>
          {fetchMode !== "all" && (
            <button type="button" className="primary-small-button" onClick={() => navigate("/report")}>
              + Report incident
            </button>
          )}
        </div>

        <div className="my-incident-filters">
          {["All", "Active", "Resolved"].map((option) => (
            <button
              key={option}
              type="button"
              className={`my-filter-button ${filter === option ? "active" : ""}`}
              onClick={() => setFilter(option)}
            >
              {option}
              <span>
                {option === "All"
                  ? visibleIncidents.length
                  : option === "Active"
                  ? activeIncidents.length
                  : resolvedIncidents.length}
              </span>
            </button>
          ))}
          <button type="button" className="secondary-button refresh-button" onClick={() => fetchIncidents({ spin: true })}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="my-incidents-empty">
            <h3>Loading incidents...</h3>
            <p>Contacting YatraShield servers.</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="my-incidents-empty">
            <div className="my-empty-icon">{filter === "Resolved" ? "✓" : "＋"}</div>
            <h3>
              {filter === "All"
                ? fetchMode === "mine"
                  ? "No incidents reported"
                  : "No incidents available"
                : `No ${filter.toLowerCase()} incidents`}
            </h3>
            <p>
              {filter === "All"
                ? fetchMode === "mine"
                  ? "Your submitted safety reports will appear here."
                  : "Incident records will appear here when available."
                : `There are currently no ${filter.toLowerCase()} reports to display.`}
            </p>
            {fetchMode === "mine" && filter === "All" && (
              <button type="button" className="primary-button" onClick={() => navigate("/report")}>
                Report an incident
              </button>
            )}
          </div>
        ) : (
          <div className="my-incidents-list">
            {filteredIncidents.map((incident) => (
              <article className="my-incident-card" key={incident._id || incident.id}>
                <div className="my-card-top">
                  <div className="my-card-title">
                    <span className="my-incident-id">{shortId(incident)}</span>
                    <h3>{categoryLabel(incident.category)}</h3>
                  </div>
                  <span className={getStatusClass(incident.status)}>
                    <span className="my-status-dot" />
                    {statusLabel(incident.status)}
                  </span>
                </div>

                <div className="my-card-meta">
                  <div className="my-meta-item">
                    <span className="my-meta-label">LOCATION</span>
                    <strong>{formatCoordinates(incident)}</strong>
                  </div>
                  <div className="my-meta-item">
                    <span className="my-meta-label">REPORTED</span>
                    <strong>{formatTime(incident)}</strong>
                  </div>
                  <div className="my-meta-item">
                    <span className="my-meta-label">RESPONDER</span>
                    <strong>{responderName(incident)}</strong>
                  </div>
                  <div className="my-meta-item">
                    <span className="my-meta-label">PRIORITY</span>
                    <span className={getPriorityClass(incident.priority)}>
                      {priorityLabel(incident.priority)}
                    </span>
                  </div>
                </div>

                {incident.description && (
                  <div className="my-card-description">
                    <span className="my-meta-label">DESCRIPTION</span>
                    <p>{incident.description}</p>
                  </div>
                )}

                {(fetchMode === "assigned" || fetchMode === "all") && (NEXT_STATUSES[incident.status] || []).length > 0 && (
                  <div className="my-card-actions">
                    <span className="my-meta-label">UPDATE STATUS</span>
                    <select
                      className="table-select status-select"
                      value={incident.status}
                      disabled={statusBusy === incident._id}
                      onChange={(event) => handleStatusChange(incident, event.target.value)}
                      aria-label={`Update status for ${shortId(incident)}`}
                    >
                      <option value={incident.status}>{statusLabel(incident.status)}</option>
                      {(NEXT_STATUSES[incident.status] || []).map((status) => (
                        <option key={status} value={status}>→ {statusLabel(status)}</option>
                      ))}
                    </select>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {fetchMode === "mine" && (
        <section className="my-status-guide">
          <div className="my-guide-heading">
            <div>
              <p className="section-label">STATUS GUIDE</p>
              <h2>Response progress</h2>
            </div>
            <p>Understand what each status means.</p>
          </div>
          <div className="my-status-steps">
            <div className="my-status-step">
              <span className="my-step-number">1</span>
              <div><strong>Reported</strong><p>Your report has been submitted.</p></div>
            </div>
            <div className="my-status-step">
              <span className="my-step-number">2</span>
              <div><strong>Assigned</strong><p>A responder has been assigned.</p></div>
            </div>
            <div className="my-status-step">
              <span className="my-step-number">3</span>
              <div><strong>On Scene</strong><p>The responder has reached the location.</p></div>
            </div>
            <div className="my-status-step">
              <span className="my-step-number">4</span>
              <div><strong>Resolved</strong><p>The incident has been marked resolved.</p></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default MyIncidents;
