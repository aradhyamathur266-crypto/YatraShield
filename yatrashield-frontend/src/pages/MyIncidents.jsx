function MyIncidents() {
  return (
    <div className="incidents-page">

      {/* Page Header */}
      <div className="page-header">
        <p className="section-label">
          INCIDENT HISTORY
        </p>

        <h2>
          My incidents
        </h2>

        <p>
          View and track the safety incidents you have reported.
        </p>
      </div>


      {/* Incident Summary */}
      <div className="incident-summary-grid">

        <div className="summary-card">
          <span className="summary-label">
            Total incidents
          </span>

          <h3>0</h3>

          <p>
            Reported by you
          </p>
        </div>


        <div className="summary-card">
          <span className="summary-label">
            Active
          </span>

          <h3>0</h3>

          <p>
            Currently being handled
          </p>
        </div>


        <div className="summary-card">
          <span className="summary-label">
            Resolved
          </span>

          <h3>0</h3>

          <p>
            Successfully resolved
          </p>
        </div>

      </div>


      {/* Incident List */}
      <div className="incidents-section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              REPORTS
            </p>

            <h2>
              Your reported incidents
            </h2>
          </div>

          <button className="primary-small-button">
            + Report incident
          </button>

        </div>


        <div className="incidents-empty-card">

          <div className="incidents-empty-icon">
            ✓
          </div>

          <h3>
            No incidents reported
          </h3>

          <p>
            You haven't reported any safety incidents yet.
            If something happens during your journey, you can
            report it here.
          </p>

          <button className="primary-button">
            Report an incident
          </button>

        </div>

      </div>


      {/* Incident Status Guide */}
      <div className="status-guide">

        <div className="section-heading">

          <div>
            <p className="section-label">
              INCIDENT STATUS
            </p>

            <h2>
              How response works
            </h2>
          </div>

        </div>


        <div className="status-flow">

          <div className="status-step">
            <span>1</span>

            <div>
              <h3>Reported</h3>
              <p>Your incident is submitted.</p>
            </div>
          </div>


          <div className="status-line"></div>


          <div className="status-step">
            <span>2</span>

            <div>
              <h3>Assigned</h3>
              <p>A responder is assigned.</p>
            </div>
          </div>


          <div className="status-line"></div>


          <div className="status-step">
            <span>3</span>

            <div>
              <h3>Responding</h3>
              <p>The responder is handling the incident.</p>
            </div>
          </div>


          <div className="status-line"></div>


          <div className="status-step">
            <span>4</span>

            <div>
              <h3>Resolved</h3>
              <p>The incident has been resolved.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default MyIncidents;