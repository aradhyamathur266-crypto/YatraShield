import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


function TouristDashboard() {
  return (
    <div className="dashboard">

      {/* =========================
          QUICK ACTIONS
      ========================= */}
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


      {/* =========================
          SAFETY OVERVIEW
      ========================= */}
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


        <div className="overview-grid">

          {/* Current Location */}
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


          {/* Active Incidents */}
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


          {/* Risk Zone */}
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


      {/* =========================
          SAFETY MAP
      ========================= */}
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

          <MapContainer
            center={[28.4595, 77.0266]}
            zoom={13}
            className="safety-map"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[28.4595, 77.0266]}>

              <Popup>
                Your current location
              </Popup>

            </Marker>

          </MapContainer>

        </div>

      </div>


      {/* =========================
          RECENT INCIDENTS
      ========================= */}
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


      {/* =========================
          SAFETY TIPS
      ========================= */}
      <div className="section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              SAFETY TIPS
            </p>

            <h2>
              Stay safe during your journey
            </h2>
          </div>

        </div>


        <div className="tips-grid">

          {/* Tip 1 */}
          <div className="tip-card">

            <span>📍</span>

            <div>

              <h3>
                Keep location sharing active
              </h3>

              <p>
                Your location helps responders assist you during an emergency.
              </p>

            </div>

          </div>


          {/* Tip 2 */}
          <div className="tip-card">

            <span>🚨</span>

            <div>

              <h3>
                Use SOS for emergencies
              </h3>

              <p>
                Use the SOS button when you need immediate assistance.
              </p>

            </div>

          </div>


          {/* Tip 3 */}
          <div className="tip-card">

            <span>⚠️</span>

            <div>

              <h3>
                Watch for risk zones
              </h3>

              <p>
                Pay attention to safety warnings around your current location.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default TouristDashboard;