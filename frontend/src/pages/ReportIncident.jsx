import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, CATEGORY_LABELS, shortId } from "../utils/incidents.js";
import { errorMessage, incidentApi } from "../api/api.js";

function ReportIncident() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    emergency: false,
    location: null,
  });

  const [locationStatus, setLocationStatus] = useState("Getting your current location...");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => setLocationStatus("Location services are not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
        setLocationStatus("Current location captured");
      },
      () => setLocationStatus("Location permission was not granted."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLastCreated(null);

    if (!formData.category) return setMessage("Please select an incident category."), setMessageType("error");
    if (!formData.description.trim()) return setMessage("Please describe what happened."), setMessageType("error");
    if (!formData.location) {
      setMessage("Your location could not be captured. Please allow location access and try again.");
      setMessageType("error");
      return;
    }

    const description = formData.description.trim();
    // Emergency checkbox upgrades the description with a critical keyword so the
    // backend priority engine resolves it as "critical".
    const finalDescription = formData.emergency
      ? `EMERGENCY — currently in immediate danger: ${description}`
      : description;

    const payload = {
      category: formData.category,
      description: finalDescription,
      // Backend expects GeoJSON Point: coordinates are [longitude, latitude].
      location: {
        type: "Point",
        coordinates: [formData.location.longitude, formData.location.latitude],
      },
    };

    try {
      setIsSubmitting(true);
      const res = await incidentApi.create(payload);
      const incident = res.data?.incident;
      setLastCreated(incident);
      setMessage(
        incident
          ? `Incident ${shortId(incident)} reported successfully. Priority: ${(incident.priority || "").toUpperCase()}.`
          : "Incident reported successfully."
      );
      setMessageType("success");
      setFormData({ category: "", description: "", emergency: false, location: formData.location });
    } catch (err) {
      setMessage(errorMessage(err, "The incident could not be submitted. Is the backend running?"));
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="report-page">
      <div className="page-header">
        <p className="section-label">SAFETY REPORT</p>
        <h1>Report an incident</h1>
        <p>Share the details below so the response team can review your report.</p>
      </div>

      <form className="report-form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Incident category</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select incident category</option>
            {CATEGORIES.map((key) => (
              <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what happened..."
            required
          />
          <small>Priority is calculated automatically by the server from your description.</small>
        </div>

        <label
          className={`emergency-option emergency-option-clean ${formData.emergency ? "emergency-option-active" : ""}`}
          htmlFor="emergency"
        >
          <span className="emergency-option-symbol" aria-hidden="true">!</span>
          <span className="emergency-option-content">
            <strong>Immediate danger</strong>
            <span>Select this if you or someone else is currently in danger.</span>
          </span>
          <span className="emergency-checkbox">
            <input type="checkbox" id="emergency" name="emergency" checked={formData.emergency} onChange={handleChange} />
            <span className="emergency-checkbox-visual" aria-hidden="true">✓</span>
          </span>
        </label>

        <div className="location-box">
          <span className="location-icon">📍</span>
          <div>
            <h3>Location</h3>
            <p>{locationStatus}</p>
            {formData.location && (
              <small>
                Latitude: {formData.location.latitude.toFixed(6)} {" • "} Longitude: {formData.location.longitude.toFixed(6)}
              </small>
            )}
          </div>
        </div>

        <button type="submit" className="submit-report" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Incident"}
        </button>

        {message && (
          <p className={`form-message ${messageType === "error" ? "error-message" : "success-message"}`} role="status">
            {message}
            {lastCreated && messageType === "success" && (
              <> <button type="button" className="link-button" onClick={() => navigate("/incidents")}>View my incidents →</button></>
            )}
          </p>
        )}
      </form>
    </div>
  );
}

export default ReportIncident;
