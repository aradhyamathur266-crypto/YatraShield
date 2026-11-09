import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, MapPin, Siren, ShieldCheck, Users } from "lucide-react";
import { errorMessage, incidentApi } from "../api/api.js";

export default function SOS() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState("Getting your current location...");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [incidentId, setIncidentId] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => setLocStatus("GPS not supported on this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setLocStatus("Location ready"); },
      () => setLocStatus("Location permission not granted."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  async function onSend() {
    setMessage("");
    setIncidentId(null);
    if (!location) { setMessage("Location not ready. Allow access and try again."); setMessageType("error"); return; }
    try {
      setSending(true);
      const res = await incidentApi.create({
        category: "other",
        description: "EMERGENCY SOS — life-threatening situation, immediate help needed",
        location: { type: "Point", coordinates: [location.longitude, location.latitude] },
      });
      const incident = res.data?.incident;
      setIncidentId(incident?._id);
      setMessage("SOS sent. A responder will be assigned shortly — keep this page open.");
      setMessageType("success");
    } catch (err) {
      setMessage(errorMessage(err, "SOS could not be sent. If you're in danger, call 112 directly."));
      setMessageType("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="sos-shell">
      <div className="page-head" style={{ textAlign: "center" }}>
        <span className="eyebrow" style={{ justifyContent: "center" }}>Emergency assistance</span>
        <h1>Need immediate help?</h1>
        <p style={{ marginInline: "auto" }}>Only for immediate danger. This creates a critical incident with your live location.</p>
      </div>

      <div className="card card-pad" style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", display: "flex", justifyContent: "center", gap: 7, alignItems: "center" }}>
          <span className="live-dot" /> {locStatus}
          {location && <span> · {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</span>}
        </p>

        <button className="sos-ring" onClick={onSend} disabled={sending} aria-label="Press for SOS">
          {sending ? "SENDING..." : "PRESS FOR SOS"}
        </button>

        {message && (
          <div className={`alert ${messageType === "error" ? "alert-error" : "alert-success"}`} role="status" style={{ textAlign: "left" }}>
            {messageType === "error" ? <AlertCircle /> : <CheckCircle2 />}
            <span>{message}</span>
          </div>
        )}
        {incidentId && messageType === "success" && (
          <button className="btn btn-dark" onClick={() => navigate(`/incidents/${incidentId}`)}>Track this incident <Siren style={{ width: 16, height: 16 }} /></button>
        )}

        <p style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>Your location is shared only with assigned responders.</p>
      </div>

      <div className="sos-info">
        <div className="card">
          <span className="quick-icon" style={{ background: "var(--surface-3)", color: "var(--text)", width: 36, height: 36 }}><MapPin style={{ width: 17, height: 17 }} /></span>
          <h3>Location</h3><p>Your current position is attached to the emergency.</p>
        </div>
        <div className="card">
          <span className="quick-icon" style={{ background: "var(--red-100)", color: "var(--red)", width: 36, height: 36 }}><Siren style={{ width: 17, height: 17 }} /></span>
          <h3>Priority</h3><p>SOS is always critical — first in the queue.</p>
        </div>
        <div className="card">
          <span className="quick-icon" style={{ background: "var(--emerald-100)", color: "var(--emerald-dark)", width: 36, height: 36 }}><Users style={{ width: 17, height: 17 }} /></span>
          <h3>Response</h3><p>A nearby responder is assigned and notified instantly.</p>
        </div>
      </div>

      <p style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 22, fontSize: 12, color: "var(--muted)" }}>
        <ShieldCheck style={{ width: 14, height: 14 }} /> Prefer a call? Dial 112 — YatraShield doesn't replace emergency services.
      </p>
    </div>
  );
}
