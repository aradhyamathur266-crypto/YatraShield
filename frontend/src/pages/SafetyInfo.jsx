import { Link } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { PageHead } from "../components/ui.jsx";

const TIPS = [
  ["Keep location enabled", "Allow location access so responders can find you quickly."],
  ["Notice risk warnings", "Be cautious around high-risk or restricted areas."],
  ["Use SOS in emergencies", "Open SOS when you or someone nearby needs urgent help."],
  ["Keep your phone ready", "Keep your device charged and within reach at all times."],
  ["Stay aware", "Stay alert in unfamiliar areas and avoid isolated places."],
  ["Watch for updates", "Keep this app open for live status changes on your reports."],
];

const NUMBERS = [
  ["112", "Police, fire, all emergencies"],
  ["108", "Ambulance"],
  ["1091", "Women helpline"],
];

export default function SafetyInfo() {
  return (
    <div className="page">
      <PageHead eyebrow="Safety guide" title={<>Stay informed. <em>Stay safe.</em></>}>
        Simple guidance for safer travel and emergencies.
      </PageHead>

      <div className="numbers">
        {NUMBERS.map(([n, label]) => (
          <a key={n} href={`tel:${n}`} className="number">
            <span className="number-n">{n}</span>
            <span className="number-label">{label}</span>
            <Icon name="phone" size={16} />
          </a>
        ))}
      </div>

      <ol className="tips">
        {TIPS.map(([title, text], i) => (
          <li key={title}>
            <span className="mono tips-no">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="card card-pad cta-card">
        <div>
          <p className="eyebrow">Need urgent help?</p>
          <h2 className="card-title cta-title">Go to emergency assistance</h2>
          <p className="card-sub">If you’re in immediate danger, open SOS to get a critical responder assigned.</p>
        </div>
        <Link to="/sos" className="btn btn-signal">Open SOS <Icon name="arrowRight" size={16} /></Link>
      </section>
    </div>
  );
}
