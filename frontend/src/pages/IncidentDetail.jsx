import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Clock, MapPin, UserRound } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { errorMessage, incidentApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";
import { NEXT_STATUSES, categoryLabel, formatCoordinates, formatTime, priorityLabel, shortId, statusLabel, reportedByName } from "../utils/incidents.js";

const FLOW = ["REPORTED", "TRIAGED", "ASSIGNED", "ACKNOWLEDGED", "EN_ROUTE", "ON_SITE", "RESOLVED", "CLOSED"];

function pinIcon() {
  return L.divIcon({ className: "", html: `<div class="custom-pin incident"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchOne = useCallback(async () => {
    try {
      const res = await incidentApi.getById(id);
      setIncident(res.data?.incident || null);
    } catch (err) {
      setError(errorMessage(err, "Incident not found or not accessible."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await incidentApi.getById(id);
        if (!cancelled) setIncident(res.data?.incident || null);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Incident not found or not accessible."));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => subscribeToIncidentEvents({
    "incident:status_updated": () => fetchOne(),
    "incident:assigned": () => fetchOne(),
    "incident:reassigned": () => fetchOne(),
  }), [fetchOne]);

  async function onStatus(next) {
    if (!next || next === incident.status) return;
    setBusy(true);
    setError("");
    try {
      const res = await incidentApi.updateStatus(id, next);
      setIncident(res.data.incident);
    } catch (err) {
      setError(errorMessage(err, "Update failed."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 28, width: 220, marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <div className="skeleton" style={{ height: 320 }} />
          <div className="skeleton" style={{ height: 320 }} />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="empty">
        <div className="empty-icon"><Clock /></div>
        <h3>Incident not found</h3>
        <p>{error || "It may have been deleted, or you don't have access."}</p>
        <Link to="/incidents" className="btn btn-dark">Back to incidents</Link>
      </div>
    );
  }

  const coords = incident.location?.coordinates;
  const center = Array.isArray(coords) && coords.length === 2 ? [coords[1], coords[0]] : [28.4595, 77.0266];
  const currentIdx = FLOW.indexOf(incident.status);
  const next = NEXT_STATUSES[incident.status] || [];

  return (
    <div>
      <div className="page-head">
        <button className="link-btn" onClick={() => navigate(-1)}><ArrowLeft style={{ width: 15, height: 15 }} /> Back</button>
        <h1 style={{ marginTop: 12 }}>{shortId(incident)} — {categoryLabel(incident.category)}</h1>
        <p>{formatTime(incident)} · {formatCoordinates(incident)}</p>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }} className="detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <h3>Location</h3>
              <span className={`pill pill-${(incident.priority || "medium").toLowerCase()}`}>{priorityLabel(incident.priority)}</span>
            </div>
            <div className="map-shell">
              <MapContainer center={center} zoom={16}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                <Marker position={center} icon={pinIcon()} />
              </MapContainer>
              <div className="map-overlay-note"><MapPin /> {formatCoordinates(incident)}</div>
            </div>
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 15 }}>Description</h3>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{incident.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
              <div className="coord"><span>Reported by</span><strong>{reportedByName(incident)}</strong></div>
              <div className="coord"><span>Responder</span><strong>{incident.assignedResponder?.name || "Unassigned"}</strong></div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><UserRound style={{ width: 16, height: 16 }} /> Progress</h3>
            <div className="timeline" style={{ marginTop: 8 }}>
              {FLOW.map((s, i) => {
                const done = currentIdx === -1 ? false : i < currentIdx;
                const current = s === incident.status;
                if (s === "CLOSED" && incident.status !== "CLOSED" && currentIdx < FLOW.indexOf("RESOLVED")) return null;
                return (
                  <div className="timeline-step" key={s} style={{ opacity: currentIdx !== -1 && i > currentIdx ? .45 : 1 }}>
                    <span className={`timeline-dot ${done ? "done" : current ? "current" : ""}`}>
                      {done ? <Check /> : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />}
                    </span>
                    <div>
                      <strong>{statusLabel(s)}</strong>
                      <small>{current ? "Current status" : done ? "Completed" : "Pending"}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            {next.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Advance status</label>
                <select className="select" style={{ width: "100%", maxWidth: "none", marginTop: 8 }}
                  value={incident.status} disabled={busy} onChange={(e) => onStatus(e.target.value)}>
                  <option value={incident.status}>{statusLabel(incident.status)}</option>
                  {next.map((s) => <option key={s} value={s}>→ {statusLabel(s)}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 15 }}>Details</h3>
            <div style={{ marginTop: 12, display: "grid", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Status</span><span className={`pill pill-${statusLabel(incident.status).toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(incident.status)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Priority</span><span className={`pill pill-${(incident.priority || "medium").toLowerCase()}`}>{priorityLabel(incident.priority)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Reported</span><strong>{formatTime(incident)}</strong></div>
              {incident.assignedAt && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Assigned</span><strong>{new Date(incident.assignedAt).toLocaleString()}</strong></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
