import { useEffect, useState } from "react";

function ReportIncident({ onSubmitIncident }) {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    severity: "",
    emergency: false,
    location: null,
  });

  const [locationStatus, setLocationStatus] = useState(
    "Getting your current location..."
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Location services are not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((previousData) => ({
          ...previousData,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));

        setLocationStatus("Current location captured");
      },
      () => {
        setLocationStatus("Location permission was not granted.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!formData.category) {
      setMessage("Please select an incident category.");
      return;
    }

    if (!formData.description.trim()) {
      setMessage("Please describe what happened.");
      return;
    }

    if (!formData.severity) {
      setMessage("Please select the severity.");
      return;
    }

    if (!formData.location) {
      setMessage(
        "Your location could not be captured. Please allow location access and try again."
      );
      return;
    }

    if (typeof onSubmitIncident !== "function") {
      setMessage("Incident submission is not connected yet.");
      return;
    }

    const categoryNames = {
      medical: "Medical Emergency",
      accident: "Accident",
      theft: "Theft",
      harassment: "Harassment",
      lost: "Lost / Missing",
      unsafe: "Unsafe Area",
      other: "Other",
    };

    const priorityNames = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };

    const newIncident = {
      id: `YS-${Date.now().toString().slice(-6)}`,
      type: categoryNames[formData.category],
      category: formData.category,
      description: formData.description.trim(),
      priority: formData.emergency
        ? "Critical"
        : priorityNames[formData.severity],
      severity: formData.severity,
      emergency: formData.emergency,
      location: `${formData.location.latitude.toFixed(5)}, ${formData.location.longitude.toFixed(5)}`,
      coordinates: formData.location,
      status: "Reported",
      responder: "Unassigned",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: new Date().toISOString(),
    };

    try {
      setIsSubmitting(true);
      onSubmitIncident(newIncident);
      setMessage(
        `Incident ${newIncident.id} has been added to the demo incident list.`
      );

      setFormData({
        category: "",
        description: "",
        severity: "",
        emergency: false,
        location: formData.location,
      });
    } catch {
      setMessage("The incident could not be added. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="report-page">
      <div className="page-header">
        <p className="section-label">SAFETY REPORT</p>
        <h1>Report an incident</h1>
        <p>
          Share the details below so the response team can review your report.
        </p>
      </div>

      <form className="report-form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Incident category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select incident category</option>
            <option value="medical">Medical Emergency</option>
            <option value="accident">Accident</option>
            <option value="theft">Theft</option>
            <option value="harassment">Harassment</option>
            <option value="lost">Lost / Missing</option>
            <option value="unsafe">Unsafe Area</option>
            <option value="other">Other</option>
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
        </div>

        <div className="form-group">
          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
          >
            <option value="">Select severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <label
          className={`emergency-option emergency-option-clean ${
            formData.emergency ? "emergency-option-active" : ""
          }`}
          htmlFor="emergency"
        >
          <span className="emergency-option-symbol" aria-hidden="true">
            !
          </span>

          <span className="emergency-option-content">
            <strong>Immediate danger</strong>
            <span>
              Select this if you or someone else is currently in danger.
            </span>
          </span>

          <span className="emergency-checkbox">
            <input
              type="checkbox"
              id="emergency"
              name="emergency"
              checked={formData.emergency}
              onChange={handleChange}
            />
            <span className="emergency-checkbox-visual" aria-hidden="true">
              ✓
            </span>
          </span>
        </label>

        <div className="location-box">
          <span className="location-icon">📍</span>
          <div>
            <h3>Location</h3>
            <p>{locationStatus}</p>

            {formData.location && (
              <small>
                Latitude: {formData.location.latitude.toFixed(6)}
                {" • "}
                Longitude: {formData.location.longitude.toFixed(6)}
              </small>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="evidence">
            Evidence <span>(optional)</span>
          </label>
          <input
            type="file"
            id="evidence"
            name="evidence"
            accept="image/*,video/*"
          />
          <small>
            Evidence upload is for the interface demo; files are not uploaded
            to a server yet.
          </small>
        </div>

        <button
          type="submit"
          className="submit-report"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Incident"}
        </button>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default ReportIncident;