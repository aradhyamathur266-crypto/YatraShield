import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage, incidentApi } from "../api/api.js";

function SOS() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Getting your current location...");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => setLocationStatus("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("Location ready");
      },
      () => setLocationStatus("Location permission was not granted."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  async function handleSOS() {
    setMessage("");
    if (!location) {
      setMessage("Location not ready yet. Please allow location access and try again.");
      setMessageType("error");
      return;
    }

    try {
      setIsSending(true);
      // Category "other" + critical keywords => backend assigns "critical" priority.
      const res = await incidentApi.create({
        category: "other",
        description: "EMERGENCY SOS — life-threatening situation, immediate help needed",
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
        },
      });
      const incident = res.data?.incident;
      setMessage(
        incident
          ? `SOS sent successfully. Incident ID: ${incident._id}. Priority: ${(incident.priority || "").toUpperCase()}`
          : "SOS sent successfully. The response team has been notified."
      );
      setMessageType("success");
    } catch (err) {
      setMessage(errorMessage(err, "SOS could not be sent. Is the backend running? Call emergency services directly."));
      setMessageType("error");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="sos-page">
      <div className="sos-header">
        <p className="section-label">EMERGENCY ASSISTANCE</p>
        <h2>Need immediate help?</h2>
        <p>Use SOS only when you or someone nearby is in immediate danger.</p>
      </div>

      <div className="sos-card">
        <div className="sos-icon">🆘</div>
        <h1>Emergency SOS</h1>
        <p>Pressing the button will create a critical emergency incident and share your current location with the response team.</p>

        <p className="sos-location-status">
          <span className="location-indicator" /> {locationStatus}
          {location && <small> {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</small>}
        </p>

        <button className="sos-button" onClick={handleSOS} disabled={isSending}>
          {isSending ? "SENDING SOS..." : "PRESS FOR SOS"}
        </button>

        {message && (
          <p className={`form-message ${messageType === "error" ? "error-message" : "success-message"}`} role="status">
            {message}
            {messageType === "success" && (
              <> <button type="button" className="link-button" onClick={() => navigate("/incidents")}>View my incidents →</button></>
            )}
          </p>
        )}

        <p className="sos-note">Your location will be shared with emergency responders.</p>
      </div>

      <div className="sos-info-grid">
        <div className="sos-info-card">
          <span>📍</span>
          <div>
            <h3>Location</h3>
            <p>Your current location will be attached to the emergency request.</p>
          </div>
        </div>
        <div className="sos-info-card">
          <span>🚨</span>
          <div>
            <h3>Priority</h3>
            <p>SOS requests are treated as critical priority incidents.</p>
          </div>
        </div>
        <div className="sos-info-card">
          <span>👮</span>
          <div>
            <h3>Response</h3>
            <p>An available responder can be assigned to your emergency.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SOS;
