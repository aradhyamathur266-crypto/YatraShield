import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyIncidents({ incidents = [], dashboardType = "tourist" }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const isTourist = dashboardType === "tourist";

  // Tourists see only their own submitted reports.
  // Authorities see every incident, including demo records.
  const visibleIncidents = useMemo(() => {
    if (isTourist) {
      return incidents.filter(
        (incident) => incident.reportedBy === "tourist"
      );
    }

    return incidents;
  }, [incidents, isTourist]);

  const activeIncidents = visibleIncidents.filter(
    (incident) => incident.status !== "Resolved"
  );

  const resolvedIncidents = visibleIncidents.filter(
    (incident) => incident.status === "Resolved"
  );

  const filteredIncidents = useMemo(() => {
    if (filter === "Active") return activeIncidents;
    if (filter === "Resolved") return resolvedIncidents;
    return visibleIncidents;
  }, [filter, visibleIncidents]);

  const getStatusClass = (status = "Reported") =>
    `my-status my-status-${status.toLowerCase().replaceAll(" ", "-")}`;

  const getPriorityClass = (priority = "Medium") =>
    `my-priority my-priority-${priority.toLowerCase()}`;

  const pageTitle = isTourist ? "My incidents" : "All incidents";
  const sectionTitle = isTourist ? "Your reports" : "Incident records";
  const description = isTourist
    ? "Track the status of safety incidents you have reported."
    : "Review reported incidents and monitor their response progress.";

  return (
    <div className="incidents-page my-incidents-page">
      <div className="page-header">
        <p className="section-label">
          {isTourist ? "INCIDENT HISTORY" : "AUTHORITY INCIDENT RECORDS"}
        </p>
        <h2>{pageTitle}</h2>
        <p>{description}</p>
      </div>

      <div className="my-incident-summary">
        <div className="my-summary-card">
          <span>Total reports</span>
          <strong>{visibleIncidents.length}</strong>
          <small>{isTourist ? "Your submitted incidents" : "All incident records"}</small>
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

      <section className="my-reports-section">
        <div className="my-reports-toolbar">
          <div>
            <p className="section-label">{sectionTitle.toUpperCase()}</p>
            <h2>Incident activity</h2>
          </div>

          {isTourist && (
            <button
              type="button"
              className="primary-small-button"
              onClick={() => navigate("/report")}
            >
              + Report incident
            </button>
          )}
        </div>

        <div className="my-incident-filters">
          {["All", "Active", "Resolved"].map((option) => (
            <button
              key={option}
              type="button"
              className={`my-filter-button ${
                filter === option ? "active" : ""
              }`}
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
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="my-incidents-empty">
            <div className="my-empty-icon">
              {filter === "Resolved" ? "✓" : "＋"}
            </div>

            <h3>
              {filter === "All"
                ? isTourist
                  ? "No incidents reported"
                  : "No incidents available"
                : `No ${filter.toLowerCase()} incidents`}
            </h3>

            <p>
              {filter === "All"
                ? isTourist
                  ? "Your submitted safety reports will appear here."
                  : "Incident records will appear here when available."
                : `There are currently no ${filter.toLowerCase()} reports to display.`}
            </p>

            {isTourist && filter === "All" && (
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/report")}
              >
                Report an incident
              </button>
            )}
          </div>
        ) : (
          <div className="my-incidents-list">
            {filteredIncidents.map((incident) => (
              <article className="my-incident-card" key={incident.id}>
                <div className="my-card-top">
                  <div className="my-card-title">
                    <span className="my-incident-id">{incident.id}</span>
                    <h3>{incident.type || "Safety incident"}</h3>
                  </div>

                  <span className={getStatusClass(incident.status)}>
                    <span className="my-status-dot" />
                    {incident.status || "Reported"}
                  </span>
                </div>

                <div className="my-card-meta">
                  <div className="my-meta-item">
                    <span className="my-meta-label">LOCATION</span>
                    <strong>{incident.location || "Not provided"}</strong>
                  </div>

                  <div className="my-meta-item">
                    <span className="my-meta-label">REPORTED</span>
                    <strong>{incident.time || "Recently"}</strong>
                  </div>

                  <div className="my-meta-item">
                    <span className="my-meta-label">RESPONDER</span>
                    <strong>{incident.responder || "Not assigned"}</strong>
                  </div>

                  <div className="my-meta-item">
                    <span className="my-meta-label">PRIORITY</span>
                    <span className={getPriorityClass(incident.priority)}>
                      {incident.priority || "Medium"}
                    </span>
                  </div>
                </div>

                {incident.description && (
                  <div className="my-card-description">
                    <span className="my-meta-label">DESCRIPTION</span>
                    <p>{incident.description}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {isTourist && (
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
              <div>
                <strong>Reported</strong>
                <p>Your report has been submitted.</p>
              </div>
            </div>

            <div className="my-status-step">
              <span className="my-step-number">2</span>
              <div>
                <strong>Assigned</strong>
                <p>A responder has been assigned.</p>
              </div>
            </div>

            <div className="my-status-step">
              <span className="my-step-number">3</span>
              <div>
                <strong>On Scene</strong>
                <p>The responder has reached the location.</p>
              </div>
            </div>

            <div className="my-status-step">
              <span className="my-step-number">4</span>
              <div>
                <strong>Resolved</strong>
                <p>The incident has been marked resolved.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default MyIncidents;