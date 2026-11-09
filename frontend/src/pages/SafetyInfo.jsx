import { useNavigate } from "react-router-dom";
import { ArrowRight, Bell, MapPin, Phone, Siren, TriangleAlert, Users } from "lucide-react";

const TIPS = [
  { icon: MapPin, title: "Keep location enabled", text: "Allow location access so responders can find you quickly." },
  { icon: TriangleAlert, title: "Notice risk warnings", text: "Be cautious around high-risk or restricted areas." },
  { icon: Siren, title: "Use SOS in emergencies", text: "Open SOS when you or someone nearby needs urgent help." },
  { icon: Phone, title: "Keep your phone ready", text: "Keep your device charged and within reach at all times." },
  { icon: Users, title: "Stay aware", text: "Stay alert in unfamiliar areas and avoid isolated places." },
  { icon: Bell, title: "Watch for updates", text: "Turn on notifications for nearby alerts and status changes." },
];

export default function SafetyInfo() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">Safety information</span>
        <h1>Stay informed. Stay safe.</h1>
        <p>Simple guidance for safer travel and emergencies — connected to live data when you need it.</p>
      </div>

      <div className="card" style={{ padding: 22, display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <span className="quick-icon" style={{ background: "var(--emerald-100)", color: "var(--emerald-dark)" }}><ShieldCheckIcon /></span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 14 }}>Area status: Connected</strong>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>You're connected to the YatraShield backend. For official alerts, check local authorities.</p>
        </div>
        <span className="pill pill-resolved">Live</span>
      </div>

      <div className="tip-grid">
        {TIPS.map((tip, i) => (
          <div className="card tip" key={tip.title}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-400)" }}>{String(i + 1).padStart(2, "0")}</span>
            <div className="tip-ic" style={{ marginTop: 10 }}><tip.icon /></div>
            <h3>{tip.title}</h3>
            <p>{tip.text}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20, padding: 22, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className="eyebrow">Need urgent help?</span>
          <h3 style={{ fontSize: 18, marginTop: 8 }}>Go to emergency assistance</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>If you're in immediate danger, open SOS to get a critical responder assigned.</p>
        </div>
        <button className="btn btn-danger" onClick={() => navigate("/sos")}>Go to SOS <ArrowRight style={{ width: 16, height: 16 }} /></button>
      </div>
    </div>
  );
}

function ShieldCheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21 }}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>;
}
