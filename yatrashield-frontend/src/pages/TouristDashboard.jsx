function TouristDashboard() {
  return (
    <div className="dashboard">

      {/* Quick Actions */}
      <div className="action-grid">

        <button className="action-card report-card">
          <span className="action-icon">⚠️</span>

          <div>
            <h3>Report Incident</h3>
            <p>Report a safety issue or emergency</p>
          </div>
        </button>

        <button className="action-card sos-card">
          <span className="action-icon">🆘</span>

          <div>
            <h3>SOS</h3>
            <p>Request immediate assistance</p>
          </div>
        </button>

        <button className="action-card location-card">
          <span className="action-icon">📍</span>

          <div>
            <h3>Share Location</h3>
            <p>Share your current location</p>
          </div>
        </button>

      </div>


      {/* Safety Overview */}
      <div className="section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              SAFETY OVERVIEW
            </p>

            <h2>
              Your current safety status
            </h2>
          </div>

          <span className="status-badge">
            ● Low Risk
          </span>

        </div>


        {/* Overview Cards */}
        <div className="overview-grid">

          <div className="overview-card">

            <span className="card-label">
              Current Location
            </span>

            <h3>
              Location sharing active
            </h3>

            <p>
              Updated a few seconds ago
            </p>

          </div>


          <div className="overview-card">

            <span className="card-label">
              Active Incidents
            </span>

            <h3>
              0
            </h3>

            <p>
              No active incidents
            </p>

          </div>


          <div className="overview-card">

            <span className="card-label">
              Risk Zone
            </span>

            <h3>
              Safe Area
            </h3>

            <p>
              No nearby risk warnings
            </p>

          </div>

        </div>

      </div>


      {/* Safety Map */}
      <div className="section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              SAFETY MAP
            </p>

            <h2>
              Nearby safety information
            </h2>
          </div>

          <span className="map-status">
            ● Live
          </span>

        </div>


        <div className="map-card">

          <div className="map-placeholder">

            <div className="map-content">

              <span className="map-icon">
                📍
              </span>

              <h3>
                Safety Map
              </h3>

              <p>
                Your location and nearby risk zones will appear here.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Recent Incidents */}
      <div className="section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              INCIDENTS
            </p>

            <h2>
              Recent incidents
            </h2>
          </div>

          <button className="view-all">
            View all
          </button>

        </div>


        <div className="incident-card">

          <div className="empty-state">

            <span className="empty-icon">
              ✓
            </span>

            <div>
              <h3>
                No recent incidents
              </h3>

              <p>
                You don't have any reported incidents yet.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default TouristDashboard;