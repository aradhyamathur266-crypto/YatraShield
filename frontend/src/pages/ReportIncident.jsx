import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, Car, CheckCircle2, Flame, HeartPulse, MapPin,
  ShieldAlert, Siren, UserMinus, UsersRound,
} from "lucide-react";
import { errorMessage, incidentApi } from "../api/api.js";
import { shortId } from "../utils/incidents.js";

const CATEGORY_OPTIONS = [
  { value: "medical", label: "Medical", icon: HeartPulse },
  { value: "accident", label: "Accident", icon: Car },
  { value: "crime", label: "Crime", icon: ShieldAlert },
  { value: "lost_person", label: "Lost / Missing", icon: UserMinus },
  { value: "fire", label: "Fire", icon: Flame },
  { value: "harassment", label: "Harassment", icon: UsersRound },
  { value: "natural_disaster", label: "Natural disaster", icon: Siren },
  { value: "other", label: "Other", icon: AlertCircle },
];

export default function ReportIncident() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState("Getting your current location...");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => setLocStatus("GPS not supported — type location as coordinates? (denied in demo)"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocStatus("Current location captured");
      },
      () => setLocStatus("Location permission not granted."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    setCreated(null);
    if (!category) { setMessage("Please pick a category."); setMessageType("error"); return; }
    if (!description.trim()) { setMessage("Describe what happened."); setMessageType("error"); return; }
    if (!location) { setMessage("Location is required. Allow location access and try again."); setMessageType("error"); return; }

    const finalDescription = emergency
      ? `EMERGENCY — currently in immediate danger: ${description.trim()}`
      : description.trim();

    try {
      setSubmitting(true);
      const res = await incidentApi.create({
        category,
        description: finalDescription,
        location: { type: "Point", coordinates: [location.longitude, location.latitude] },
      });
      const incident = res.data?.incident;
      setCreated(incident);
      setMessage(incident ? `Incident ${shortId(incident)} reported. Priority: ${(incident.priority || "").toUpperCase()}.` : "Incident reported successfully.");
      setMessageType("success");
      setCategory("");
      setDescription("");
      setEmergency(false);
    } catch (err) {
      setMessage(errorMessage(err, "Could not submit. Is the backend running?"));
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <div className="page-head">
        <span className="eyebrow">Safety report</span>
        <h1>Report an incident</h1>
        <p>Structured reports get triaged faster. Priority is calculated automatically.</p>
      </div>

      <form onSubmit={onSubmit} className="card card-pad">
        <div className="field">
          <label>Incident category</label>
          <div className="tile-picker">
            {CATEGORY_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button"
                className={`tile ${category === value ? "selected" : ""}`}
                onClick={() => { setCategory(value); setMessage(""); }}>
                <Icon /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" rows={5} placeholder="What happened, where, and how many people are involved..."
            value={description} onChange={(e) => { setDescription(e.target.value); setMessage(""); }} required />
          <small>{description.length} characters · The server checks keywords like &quot;unconscious&quot;, &quot;trapped&quot; for critical priority.</small>
        </div>

        <div className={`switch-row ${emergency ? "active" : ""}`} style={{ marginBottom: 18 }}>
          <div>
            <strong>Immediate danger</strong>
            <small>Someone is currently in danger or unable to move. This escalates priority to critical.</small>
          </div>
          <button type="button" className={`switch ${emergency ? "on" : ""}`} role="switch" aria-checked={emergency}
            aria-label="Immediate danger" onClick={() => setEmergency((s) => !s)} />
        </div>

        <div className="card" style={{ background: "var(--surface-2)", marginBottom: 18 }}>
          <div className="card-pad" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="quick-icon" style={{ background: "var(--surface)", color: "var(--emerald-dark)", width: 38, height: 38 }}>
              <MapPin style={{ width: 18, height: 18 }} />
            </span>
            <div>
              <strong style={{ fontSize: 13 }}>Location</strong>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{locStatus}</p>
              {location && <small>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</small>}
            </div>
          </div>
        </div>

        {message && (
          <div className={`alert ${messageType === "error" ? "alert-error" : "alert-success"}`} role="status">
            {messageType === "error" ? <AlertCircle /> : <CheckCircle2 />}
            <span>{message}
              {created && messageType === "success" && (
                <> <button type="button" className="link-btn" onClick={() => navigate(`/incidents/${created._id}`)}>Track it →</button></>
              )}
            </span>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit incident"}
        </button>
        <p style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
          Evidence uploads are coming soon — reports are stored securely on the server.
        </p>
      </form>
    </div>
  );
}
