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
      map.setView(location, 16);
    }
  }, [location, map]);

  return null;
}

function TouristDashboard() {
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(
    "Waiting for location permission..."
  );
  const [placeName, setPlaceName] = useState("");
  const [placeStatus, setPlaceStatus] = useState(
    "Waiting for your location..."
  );

  // Track the user's live GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser");
      setPlaceStatus("Location is unavailable");
      return;
    }

    setLocationStatus("Getting your live location...");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation([latitude, longitude]);
        setLocationStatus("Live location active");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("Location permission denied");
          setPlaceStatus("Please allow location access in your browser.");
        } else {
          setLocationStatus("Unable to detect location");
          setPlaceStatus("Unable to retrieve your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Convert live coordinates into a readable place name
  useEffect(() => {
    if (!location) return;

    const [latitude, longitude] = location;
    const controller = new AbortController();

    setPlaceStatus("Updating place name...");

    // Debounce requests so GPS updates do not overload the geocoding service
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Reverse geocoding request failed");
        }

        const data = await response.json();
        const address = data.address || {};

        const area =
          address.neighbourhood ||
          address.suburb ||
          address.quarter ||
          address.residential ||
          address.village ||
          address.town ||
          address.city ||
          address.county;

        const city =
          address.city ||
          address.town ||
          address.village ||
          address.county;

        const state = address.state;
        const country = address.country;

        const readablePlace = [
          address.road,
          area,
          city,
          state,
          country,
        ]
          .filter(Boolean)
          .filter((value, index, array) => array.indexOf(value) === index)
          .join(", ");

        setPlaceName(
          readablePlace ||
            data.display_name ||
            "Place name unavailable"
        );

        setPlaceStatus("Place name updated");
      } catch (error) {
        if (error.name !== "AbortError") {
          setPlaceStatus("Could not retrieve place name");
        }
      }
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [location]);

  function handleLocateMe() {
    if (location) {
      setPlaceStatus("Your live location is being tracked.");
    } else {
      setLocationStatus("Waiting for your location...");
    }
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

      {/* QUICK ACTIONS */}
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
          onClick={handleLocateMe}
        >
          <span className="tourist-action-icon">⌖</span>

          <span className="tourist-action-content">
            <strong>My Live Location</strong>
            <small>
              {location ? "Location is being tracked" : "Waiting for GPS"}
            </small>
          </span>

          <span className="tourist-action-arrow">→</span>
        </button>
      </section>

      {/* LIVE LOCATION MAP */}
      <section className="tourist-section">
        <div className="tourist-section-heading">
          <div>
            <p className="tourist-eyebrow">YOUR LOCATION</p>
            <h2>Live safety map</h2>
            <p className="tourist-section-description">
              Your position updates automatically as you move.
            </p>
          </div>

          <span className="tourist-map-status">
            <span className="location-indicator" />
            {location ? "Live tracking" : "Locating you..."}
          </span>
        </div>

        <div className="tourist-map-container">
          <MapContainer
            center={location || DEFAULT_LOCATION}
            zoom={16}
            className="tourist-safety-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {location && (
              <>
                <MapUpdater location={location} />

                <Marker position={location}>
                  <Popup>
                    <strong>You are here</strong>
                    <br />
                    Your live location is being tracked.
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>

          {!location && (
            <div className="tourist-map-overlay">
              <span className="tourist-map-loading-icon">⌖</span>
              <strong>Finding your location</strong>
              <p>Please allow location access in your browser.</p>
            </div>
          )}
        </div>

        {/* CURRENT PLACE AND COORDINATES */}
        <div className="tourist-current-location-card">
          <div className="tourist-current-location-header">
            <div className="tourist-current-location-title">
              <span className="tourist-current-location-icon">⌖</span>
              <div>
                <p className="tourist-eyebrow">LIVE LOCATION DETAILS</p>
                <h3>Your Current Location</h3>
              </div>
            </div>

            <span className="tourist-live-badge">
              <span className="location-indicator" />
              Live
            </span>
          </div>

          <div className="tourist-place-name">
            {location ? placeName || placeStatus : "Waiting for GPS location..."}
          </div>

          <div className="tourist-coordinates">
            <div className="tourist-coordinate-item">
              <span>Latitude</span>
              <strong>
                {location ? `${location[0].toFixed(6)}°` : "—"}
              </strong>
            </div>

            <div className="tourist-coordinate-divider" />

            <div className="tourist-coordinate-item">
              <span>Longitude</span>
              <strong>
                {location ? `${location[1].toFixed(6)}°` : "—"}
              </strong>
            </div>
          </div>

          <p className="tourist-location-update-note">
            Place name and coordinates update automatically as your location changes.
          </p>
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
            Keep location access enabled when using location-based features,
            follow official guidance, and use the SOS page for emergency options.
          </p>
        </div>
      </section>
    </main>
  );
}

export default TouristDashboard;