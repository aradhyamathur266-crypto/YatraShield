import { useCallback, useEffect, useMemo, useState } from "react";
import { errorMessage, incidentApi, userApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";
import {
  NEXT_STATUSES,
  STATUSES,
  categoryLabel,
  formatCoordinates,
  formatTime,
  isResolved,
  priorityLabel,
  reportedByName,
  shortId,
  statusLabel,
} from "../utils/incidents.js";

function AuthorityDashboard() {
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedBusy, setAssignedBusy] = useState(null);
  const [statusBusy, setStatusBusy] = useState(null);

  const fetchAll = useCallback(async (options = {}) => {
    if (options.spin) setLoading(true);
    try {
      const [incidentsRes, respondersRes] = await Promise.all([
        incidentApi.getAll(),
        userApi.listResponders().catch(() => ({ data: { responders: [] } })),
      ]);
      setIncidents(incidentsRes.data?.incidents || []);
      setResponders(respondersRes.data?.responders || []);
    } catch (err) {
      setMessage(errorMessage(err, "Failed to load incidents. Is the backend running?"));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load: fetch inline so state updates happen in async callbacks,
    // not synchronously in the effect body.
    let cancelled = false;
    async function loadInitial() {
      try {
        const [incidentsRes, respondersRes] = await Promise.all([
          incidentApi.getAll(),
          userApi.listResponders().catch(() => ({ data: { responders: [] } })),
        ]);
        if (cancelled) return;
        setIncidents(incidentsRes.data?.incidents || []);
        setResponders(respondersRes.data?.responders || []);
      } catch (err) {
        if (cancelled) return;
        setMessage(errorMessage(err, "Failed to load incidents. Is the backend running?"));
        setMessageType("error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToIncidentEvents({
      "incident:status_updated": () => fetchAll(),
      "incident:assigned": () => fetchAll(),
      "incident:reassigned": () => fetchAll(),
    });
    return unsubscribe;
  }, [fetchAll]);

  async function handleAssign(incident, responderId) {
    if (!responderId) return;
    setAssignedBusy(incident._id);
    setMessage("");
    try {
      const res = await incidentApi.assign(incident._id, responderId);
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? res.data.incident : i)));
      setMessage(`Assigned to ${responders.find((r) => r._id === responderId)?.name || "responder"} for ${shortId(incident)}.`);
      setMessageType("success");
    } catch (err) {
      setMessage(errorMessage(err, "Assignment failed."));
      setMessageType("error");
    } finally {
      setAssignedBusy(null);
    }
  }

  async function handleStatusChange(incident, nextStatus) {
    if (!nextStatus || nextStatus === incident.status) return;
    setStatusBusy(incident._id);
    setMessage("");
    try {
      const res = await incidentApi.updateStatus(incident._id, nextStatus);
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? res.data.incident : i)));
      setMessage(`${shortId(incident)} → ${statusLabel(nextStatus)}.`);
      setMessageType("success");
    } catch (err) {
      setMessage(errorMessage(err, "Status update failed."));
      setMessageType("error");
    } finally {
      setStatusBusy(null);
    }
  }

  const filteredIncidents = useMemo(
    () =>
      incidents.filter((incident) => {
        const matchesPriority = priorityFilter === "All" || (incident.priority || "").toLowerCase() === priorityFilter.toLowerCase();
        const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
        return matchesPriority && matchesStatus;
      }),
    [incidents, priorityFilter, statusFilter]
  );

  const activeCount = incidents.filter((i) => !isResolved(i.status)).length;
  const criticalCount = incidents.filter((i) => (i.priority || "").toLowerCase() === "critical" && !isResolved(i.status)).length;
  const unassignedCount = incidents.filter((i) => !i.assignedResponder && !isResolved(i.status)).length;
  const resolvedCount = incidents.filter((i) => isResolved(i.status)).length;

  const selectedIncident = incidents.find((i) => i._id === selectedIncidentId);

  const responderWorkload = useMemo(() => {
    return responders.map((responder) => ({
      ...responder,
      activeCount: incidents.filter((i) => {
        const id = i.assignedResponder?._id || i.assignedResponder;
        return id === responder._id && !isResolved(i.status);
      }).length,
    }));
  }, [responders, incidents]);

  return (
    <div className="authority-dashboard">
      <div className="authority-heading">
        <div>
          <p className="section-label">AUTHORITY CONTROL CENTER</p>
          <h1>Incident Management</h1>
          <p className="authority-subtitle">Review incidents, coordinate responders, and track progress.</p>
        </div>
        <span className="authority-demo-label">
          <span className="demo-dot" />
          Live backend
        </span>
      </div>

      <div className="authority-stats-grid">
        <div className="authority-stat-card">
          <div className="authority-stat-top">Active Incidents</div>
          <h2>{activeCount}</h2>
          <p>Awaiting closure</p>
        </div>
        <div className="authority-stat-card">
          <div className="authority-stat-top">Critical Incidents</div>
          <h2>{criticalCount}</h2>
          <p>Require immediate attention</p>
        </div>
        <div className="authority-stat-card">
          <div className="authority-stat-top">Unassigned</div>
          <h2>{unassignedCount}</h2>
          <p>Need a responder</p>
        </div>
        <div className="authority-stat-card">
          <div className="authority-stat-top">Resolved</div>
          <h2>{resolvedCount}</h2>
          <p>Closed records</p>
        </div>
      </div>

      <section className="authority-panel">
        <div className="authority-panel-heading">
          <div>
            <h2>Incident Queue</h2>
            <p>Assign responders and update incident status.</p>
          </div>
          <div className="authority-filters">
            <select
              className="authority-filter"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="authority-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
            <button type="button" className="secondary-button" onClick={() => fetchAll({ spin: true })}>
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <div className={`authority-feedback ${messageType === "error" ? "authority-feedback-error" : ""}`} role="status">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")}>Dismiss</button>
          </div>
        )}

        <div className="authority-table-wrap">
          {loading ? (
            <p className="authority-no-results">Loading incidents...</p>
          ) : (
            <table className="authority-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Responder</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => {
                  const currentResponderId = incident.assignedResponder?._id || incident.assignedResponder || "";
                  const nextStatuses = NEXT_STATUSES[incident.status] || [];
                  return (
                    <tr key={incident._id}>
                      <td>
                        <strong>{shortId(incident)}</strong>
                        <span className="table-secondary">{categoryLabel(incident.category)}</span>
                      </td>
                      <td>{formatCoordinates(incident)}</td>
                      <td>
                        <span className={`priority-badge priority-${(incident.priority || "medium").toLowerCase()}`}>
                          {priorityLabel(incident.priority)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${statusLabel(incident.status).toLowerCase().replaceAll(" ", "-")}`}>
                          {statusLabel(incident.status)}
                        </span>
                      </td>
                      <td>
                        <select
                          className="table-select"
                          aria-label={`Assign responder to ${shortId(incident)}`}
                          value={currentResponderId}
                          disabled={isResolved(incident.status) || assignedBusy === incident._id || !["TRIAGED", "ESCALATED", "ASSIGNED"].includes(incident.status)}
                          onChange={(event) => handleAssign(incident, event.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {responders.map((responder) => (
                            <option key={responder._id} value={responder._id}>{responder.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="authority-row-actions">
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() => setSelectedIncidentId(selectedIncidentId === incident._id ? null : incident._id)}
                          >
                            {selectedIncidentId === incident._id ? "Hide" : "Details"}
                          </button>
                          <select
                            className="table-select status-select"
                            aria-label={`Update status for ${shortId(incident)}`}
                            value={incident.status}
                            disabled={nextStatuses.length === 0 || statusBusy === incident._id}
                            onChange={(event) => handleStatusChange(incident, event.target.value)}
                          >
                            <option value={incident.status}>{statusLabel(incident.status)}</option>
                            {nextStatuses.map((status) => (
                              <option key={status} value={status}>→ {statusLabel(status)}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredIncidents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="authority-no-results">No incidents match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <p className="authority-table-note">
          Changes are saved to the backend and pushed in real time to the tourist and assigned responder.
        </p>
      </section>

      {selectedIncident && (
        <section className="authority-panel incident-detail-panel">
          <div className="authority-panel-heading">
            <div>
              <p className="section-label">INCIDENT DETAILS</p>
              <h2>{shortId(selectedIncident)} — {categoryLabel(selectedIncident.category)}</h2>
            </div>
            <button type="button" className="secondary-button" onClick={() => setSelectedIncidentId(null)}>
              Close
            </button>
          </div>
          <div className="incident-detail-grid">
            <div><span>Reported time</span><strong>{formatTime(selectedIncident)}</strong></div>
            <div><span>Location</span><strong>{formatCoordinates(selectedIncident)}</strong></div>
            <div><span>Priority</span><strong>{priorityLabel(selectedIncident.priority)}</strong></div>
            <div><span>Current status</span><strong>{statusLabel(selectedIncident.status)}</strong></div>
            <div><span>Reported by</span><strong>{reportedByName(selectedIncident)}</strong></div>
            <div><span>Assigned responder</span><strong>{selectedIncident.assignedResponder?.name || "Unassigned"}</strong></div>
            <div className="incident-description">
              <span>Description</span>
              <p>{selectedIncident.description}</p>
            </div>
          </div>
        </section>
      )}

      <section className="authority-panel">
        <div className="authority-panel-heading">
          <div>
            <h2>Responder Status</h2>
            <p>Response team availability (from backend accounts)</p>
          </div>
          <span className="responder-count">{responders.length}</span>
        </div>
        <div className="responder-list">
          {responderWorkload.length === 0 ? (
            <p className="authority-no-results">No responder accounts yet. Register one with the "Responder" role.</p>
          ) : (
            responderWorkload.map((responder) => (
              <div className="responder-row" key={responder._id}>
                <div className="responder-avatar">{responder.name.charAt(0)}</div>
                <div className="responder-details">
                  <strong>{responder.name}</strong>
                  <span>Field Responder</span>
                </div>
                <div className="responder-workload">
                  <span>{responder.activeCount} active</span>
                  <span className={responder.activeCount === 0 ? "responder-available" : "responder-busy"}>
                    {responder.activeCount === 0 ? "Available" : "Busy"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default AuthorityDashboard;
