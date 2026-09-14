import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// Default location used if the browser location is unavailable
const DEFAULT_LOCATION = [28.4595, 77.0266];


// Component that moves the map when the location changes
function MapUpdater({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView(location, 14);
    }
  }, [location, map]);

  return null;
}


function TouristDashboard() {

  const [location, setLocation] = useState(DEFAULT_LOCATION);

  const [locationStatus, setLocationStatus] = useState(
    "Getting your location..."
  );


  // Get tourist's current browser location
  useEffect(() => {

    if (!navigator.geolocation) {

      setLocationStatus(
        "Location services are not supported"
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation([
          latitude,
          longitude
        ]);

        setLocationStatus(
          "Location sharing active"
        );
      },


      () => {

        setLocationStatus(
          "Location permission unavailable"
        );

      }

    );

  }, []);


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
            <p>{locationStatus}</p>
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

          <div className="overview-card">

            <span className="card-label">
              Current Location
            </span>

            <h3>
              {locationStatus}
            </h3>

            <p>
              Location services are being used for safety.
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
            center={location}
            zoom={14}
            className="safety-map"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            <MapUpdater location={location} />


            <Marker position={location}>

              <Popup>
                <strong>Your current location</strong>
                <br />
                Location sharing is active.
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