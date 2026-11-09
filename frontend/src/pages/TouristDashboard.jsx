import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Crosshair, FilePlus2, History, Siren } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { incidentApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";
import { categoryLabel, formatCoordinates, isResolved, priorityLabel, shortId, statusLabel } from "../utils/incidents.js";

const DEFAULT_CENTER = [28.4595, 77.0266];

function pinIcon() {
  return L.divIcon({ className: "", html: `<div class="custom-pin"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
}

function MapWatcher({ location }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (location) map.setView(location, first.current ? 16 : map.getZoom());
    first.current = false;
  }, [location, map]);
  return null;
}

export default function TouristDashboard() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState("Waiting for location permission...");
  const [placeName, setPlaceName] = useState("");
  const [placeStatus, setPlaceStatus] = useState("");
  const [recent, setRecent] = useState([]);
  const [hasGps, setHasGps] = useState(true);

  // Live GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => {
        setLocStatus("GPS not supported — reporting still works");
        setHasGps(false);
      });
      return;
    }
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocStatus("Live location active");
        setHasGps(true);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocStatus("Location permission denied");
          setHasGps(false);
        } else {
          setLocStatus("Unable to detect location");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  // Reverse geocode
  useEffect(() => {
    if (!location) return;
    const [lat, lng] = location;
    const controller = new AbortController();
    queueMicrotask(() => setPlaceStatus("Updating place..."));
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, { signal: controller.signal });
        if (!res.ok) throw new Error("geocode failed");
        const data = await res.json();
        const a = data.address || {};
        const area = a.neighbourhood || a.suburb || a.quarter || a.residential || a.village || a.town || a.city || a.county;
        const name = [a.road, area, a.city || a.town || a.village, a.state, a.country].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(", ");
        setPlaceName(name || data.display_name || "Place unavailable");
        setPlaceStatus("Updated");
      } catch (e) {
        if (e.name !== "AbortError") setPlaceStatus("Could not resolve place name");
      }
    }, 1500);
    return () => { clearTimeout(t); controller.abort(); };
  }, [location]);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await incidentApi.getMine();
      setRecent((res.data?.incidents || []).slice(0, 4));
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await incidentApi.getMine();
        if (!cancelled) setRecent((res.data?.incidents || []).slice(0, 4));
      } catch { if (!cancelled) setRecent([]); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => subscribeToIncidentEvents({
    "incident:status_updated": () => fetchRecent(),
    "incident:assigned": () => fetchRecent(),
    "incident:reassigned": () => fetchRecent(),
  }), [fetchRecent]);

  const activeCount = recent.filter((i) => !isResolved(i.status)).length;

  return (
    <div>
      <div className="page-head page-head-row">
        <div>
          <span className="eyebrow">Tourist dashboard</span>
          <h1>Your safety, in one place.</h1>
          <p>Report, track, and get live updates — all from your current location.</p>
        </div>
        <span className="pill pill-resolved" style={{ textTransform: "capitalize" }}>
          <span className="live-dot" /> {locStatus}
        </span>
      </div>

      <div className="quick-grid">
        <button className="quick" onClick={() => navigate("/report")}>
          <span className="quick-icon" style={{ background: "var(--ink-950)", color: "#fff" }}><FilePlus2 /></span>
          <span><strong>Report incident</strong><small>30-second safety report</small></span>
          <ArrowRight className="arrow" />
        </button>
        <button className="quick" onClick={() => navigate("/sos")}>
          <span className="quick-icon" style={{ background: "var(--red)", color: "#fff" }}><Siren /></span>
          <span><strong>Emergency SOS</strong><small>Critical, immediate help</small></span>
          <ArrowRight className="arrow" />
        </button>
        <button className="quick" onClick={() => navigate("/incidents")}>
          <span className="quick-icon" style={{ background: "var(--emerald-100)", color: "var(--emerald-dark)" }}><History /></span>
          <span><strong>My incidents</strong><small>{activeCount} active · track status</small></span>
          <ArrowRight className="arrow" />
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div>
            <h3>Live safety map</h3>
            <p>Your position updates automatically as you move.</p>
          </div>
          <span className="pill pill-resolved"><span className="live-dot" /> {location ? "Live tracking" : "Locating..."}</span>
        </div>
        <div className="map-shell">
          <MapContainer center={location || DEFAULT_CENTER} zoom={16} className="tourist-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <MapWatcher location={location} />
            {location && (
              <Marker position={location} icon={pinIcon()}>
                <Popup><strong>You are here</strong><br />Live location is being tracked.</Popup>
              </Marker>
            )}
          </MapContainer>
          <div className="map-overlay-note">
            <Crosshair />
            <span><strong>{placeName || placeStatus || "Waiting for GPS..."}</strong>
              {location && <span> · {location[0].toFixed(5)}, {location[1].toFixed(5)}</span>}
            </span>
            {!hasGps && <span style={{ marginLeft: "auto" }}>Enable location in your browser for map features.</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Recent incidents</h3>
            <p>Updates appear here automatically.</p>
          </div>
          <button className="btn btn-soft btn-sm" onClick={() => navigate("/incidents")}>View all <ArrowRight style={{ width: 14, height: 14 }} /></button>
        </div>

        {recent.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><History /></div>
            <h3>No incidents yet</h3>
            <p>Your reports and their live status will appear here.</p>
            <button className="btn btn-primary" onClick={() => navigate("/report")}><FilePlus2 style={{ width: 16, height: 16 }} /> Report an incident</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Incident</th><th>Location</th><th>Priority</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((inc) => (
                  <tr key={inc._id} className="row-clickable" onClick={() => navigate(`/incidents/${inc._id}`)}>
                    <td>
                      <span className="id-mono">{shortId(inc)}</span>
                      <strong style={{ display: "block", marginTop: 3 }}>{categoryLabel(inc.category)}</strong>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{formatCoordinates(inc)}</td>
                    <td><span className={`pill pill-${(inc.priority || "medium").toLowerCase()}`}>{priorityLabel(inc.priority)}</span></td>
                    <td><span className={`pill pill-${statusLabel(inc.status).toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(inc.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
