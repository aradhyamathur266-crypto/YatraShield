import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CircleAlert,
  FilePlus2,
  MapPin,
  Radio,
  Shield,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function pinIcon(color = "#0b9d6f") {
  return L.divIcon({
    className: "",
    html: `<div class="custom-pin" style="background:${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const STEPS = [
  {
    icon: FilePlus2,
    title: "Report in seconds",
    text: "Pick a category, add a short description. Your location is attached automatically — no forms, no phone trees.",
  },
  {
    icon: Radio,
    title: "Auto-prioritized",
    text: "Our triage engine reads the report and assigns priority instantly, so the most urgent cases reach responders first.",
  },
  {
    icon: MapPin,
    title: "Tracked in real time",
    text: "Follow status changes live as a responder is assigned and arrives. No more 'we'll call you back'.",
  },
];

const ROLES = [
  {
    icon: UserRound,
    title: "Tourists",
    text: "Report incidents and track responses from your live location.",
    points: ["30-second incident reports", "Live status timeline", "Nearby safety alerts"],
  },
  {
    icon: Shield,
    title: "Responders",
    text: "Field teams get assigned cases with acknowledgement timers.",
    points: ["Assigned queue with priorities", "One-tap status updates", "Escalation alerts"],
  },
  {
    icon: ShieldCheck,
    title: "Authorities",
    text: "Supervisors coordinate the whole network from one queue.",
    points: ["All incidents, one view", "Assign & reassign in seconds", "Response analytics"],
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark"><Shield /></span>
          <span className="brand-name">YatraShield</span>
        </Link>
        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#roles">Roles</a>
          <Link to="/safety">Safety</Link>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/register" className="btn btn-primary">Get started <ArrowRight style={{ width: 16, height: 16 }} /></Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="eyebrow">Safety, in one place</span>
          <h1>The fastest way to get help <em>near you</em>.</h1>
          <p className="hero-sub">
            Report a safety incident in 30 seconds, get auto-triaged by urgency,
            and track your responder in real time — built for tourists, responders, and authorities.
            <span style={{ display: "block", marginTop: 8, fontSize: 13, color: "var(--ink-400)" }}>
              <CircleAlert style={{ width: 13, height: 13, display: "inline", verticalAlign: -2 }} /> Emergency? Use SOS — 112.
            </span>
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-dark btn-lg">Report an incident <ArrowRight style={{ width: 17, height: 17 }} /></Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Log in</Link>
          </div>
          <p className="hero-proof">
            <Check /> No app install &nbsp;·&nbsp; <Check /> Works on any phone &nbsp;·&nbsp; <Check /> Live responder tracking
          </p>
        </div>

        <div className="hero-visual">
          <div className="hero-map-card">
            <MapContainer center={[28.4595, 77.0266]} zoom={15} zoomControl={false} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[28.4595, 77.0266]} icon={pinIcon("#0b9d6f")} />
              <Marker position={[28.464, 77.031]} icon={pinIcon("#d64545")} />
            </MapContainer>
          </div>
          <div className="hero-float">
            <ShieldCheck />
            <div>
              <strong>Live responders within ~2 km</strong>
              <small>Average response time today: 6 min</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <span className="eyebrow">How it works</span>
        <h2>From report to resolution, without the phone tag.</h2>
        <p className="section-sub">Most incidents are resolved faster when the first report is structured. YatraShield makes it effortless.</p>
        <div className="step-grid">
          {STEPS.map((s, i) => (
            <div className="step" key={s.title}>
              <div className="step-num">0{i + 1}</div>
              <div className="step-icon"><s.icon /></div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="roles" style={{ paddingTop: 8 }}>
        <span className="eyebrow">Built for everyone on the ground</span>
        <h2>One network, three views.</h2>
        <div className="role-grid">
          {ROLES.map((r) => (
            <div className="role-card" key={r.title}>
              <div className="role-icon" style={{ background: "var(--emerald-100)", color: "var(--emerald-dark)" }}><r.icon /></div>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
              <ul>{r.points.map((p) => <li key={p}><Check />{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-band">
        <div>
          <h2>Stay safe. Stay covered.</h2>
          <p>Create a free account and report your first incident in under a minute.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/register" className="btn btn-primary btn-lg">Get started <ArrowRight style={{ width: 16, height: 16 }} /></Link>
          <Link to="/login" className="btn btn-lg" style={{ background: "rgba(255,255,255,.1)", color: "#fff", borderColor: "rgba(255,255,255,.2)" }}>Log in</Link>
        </div>
      </div>

      <footer className="landing-footer">
        <span>© 2026 YatraShield — Gurugram tourist safety network.</span>
        <span><a href="#how">How it works</a><a href="#roles">Roles</a><Link to="/safety">Safety</Link></span>
      </footer>
    </div>
  );
}
