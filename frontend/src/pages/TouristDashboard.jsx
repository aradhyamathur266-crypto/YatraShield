import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const DEFAULT_LOCATION = [28.4595, 77.0266];

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
  const navigate = useNavigate();

  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationStatus, setLocationStatus] = useState(
    "Getting your location..."
  );
  const [locationShared, setLocationShared] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Location services are not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);

        setLocationStatus("Location detected");
      },
      () => {
        setLocationStatus("Location permission unavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  function handleShareLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location services are not supported");
      return;
    }

    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);

        setLocationStatus("Location detected");
        setLocationShared(true);
      },
      () => {
        setLocationStatus(
          "Unable to access location. Check browser permissions."
        );
        setLocationShared(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  return (
    <main className="dashboard tourist-dashboard-clean">
      {/* DASHBOARD INTRO */}
      <section className="tourist-welcome">
        <div>
          <p className="tourist-eyebrow">TOURIST DASHBOARD</p>
          <h1>Your safety, in one place.</h1>
          <p className="tourist-welcome-text">
            Access safety tools and stay informed during your journey.
          </p>
        </div>

        <div className="tourist-location-pill">
          <span className="location-indicator" />
          <span>{locationStatus}</span>
        </div>
      </section>

      {/* QUICK ACTIONS — THREE CARDS IN ONE ROW */}
      <section className="tourist-actions" aria-label="Quick actions">
        <button
          type="button"
          className="tourist-action-card tourist-report-action"
          onClick={() => navigate("/report")}
        >
          <span className="tourist-action-icon">⚠</span>

          <span className="tourist-action-content">
            <strong>Report Incident</strong>
            <small>Report a safety concern</small>
          </span>

          <span className="tourist-action-arrow">→</span>
        </button>

        <button
          type="button"
          className="tourist-action-card tourist-sos-action"
          onClick={() => navigate("/sos")}
        >
          <span className="tourist-action-icon">SOS</span>

          <span className="tourist-action-content">
            <strong>Emergency SOS</strong>
            <small>Access emergency options</small>
          </span>

          <span className="tourist-action-arrow">→</span>
        </button>

        <button
          type="button"
          className="tourist-action-card tourist-location-action"
          onClick={handleShareLocation}
        >
          <span className="tourist-action-icon">⌖</span>

          <span className="tourist-action-content">
            <strong>Share Location</strong>
            <small>
              {locationShared
                ? "Location retrieved"
                : "Update your location"}
            </small>
          </span>

          <span className="tourist-action-arrow">→</span>
        </button>
      </section>

      {/* LOCATION MAP */}
      <section className="tourist-section">
        <div className="tourist-section-heading">
          <div>
            <p className="tourist-eyebrow">YOUR LOCATION</p>
            <h2>Safety map</h2>
            <p className="tourist-section-description">
              View your current location on the map.
            </p>
          </div>

          <span className="tourist-map-status">
            <span className="location-indicator" />
            Map available
          </span>
        </div>

        <div className="tourist-map-container">
          <MapContainer
            center={location}
            zoom={14}
            className="tourist-safety-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater location={location} />

            <Marker position={location}>
              <Popup>
                <strong>Your map location</strong>
                <br />
                This marker shows your detected browser location, or the
                default map location if permission was unavailable.
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </section>

      {/* SAFETY RESOURCES */}
      <section className="tourist-section">
        <div className="tourist-section-heading">
          <div>
            <p className="tourist-eyebrow">SAFETY RESOURCES</p>
            <h2>Quick access</h2>
          </div>
        </div>

        <div className="tourist-resource-grid">
          <button
            type="button"
            className="tourist-resource-card"
            onClick={() => navigate("/incidents")}
          >
            <span className="tourist-resource-icon">▤</span>

            <span>
              <strong>My Incidents</strong>
              <small>Track your reports and their status.</small>
            </span>

            <span className="tourist-resource-arrow">→</span>
          </button>

          <button
            type="button"
            className="tourist-resource-card"
            onClick={() => navigate("/safety")}
          >
            <span className="tourist-resource-icon">✓</span>

            <span>
              <strong>Safety Information</strong>
              <small>Read travel safety tips and guidance.</small>
            </span>

            <span className="tourist-resource-arrow">→</span>
          </button>
        </div>
      </section>

      {/* SAFETY REMINDER */}
      <section className="tourist-safety-note">
        <span className="tourist-safety-note-icon">ℹ</span>

        <div>
          <strong>Stay aware during your journey</strong>
          <p>
            Keep your location accessible when needed, follow official
            guidance, and use the SOS page for emergency options.
          </p>
        </div>
      </section>
    </main>
  );
}

export default TouristDashboard;