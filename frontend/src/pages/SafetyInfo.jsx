import { useNavigate } from "react-router-dom";

function SafetyInfo() {
  const navigate = useNavigate();

  const safetyTips = [
    {
      icon: "📍",
      title: "Keep location enabled",
      text: "Allow location access when using safety features.",
    },
    {
      icon: "⚠️",
      title: "Notice risk warnings",
      text: "Be cautious around areas marked high-risk or restricted.",
    },
    {
      icon: "🆘",
      title: "Use SOS in emergencies",
      text: "Open SOS when you or someone nearby needs urgent help.",
    },
    {
      icon: "📱",
      title: "Keep your phone ready",
      text: "Keep your device charged and accessible.",
    },
    {
      icon: "👥",
      title: "Stay aware",
      text: "Stay alert in unfamiliar areas and avoid isolated places.",
    },
    {
      icon: "🛡️",
      title: "Report concerns",
      text: "Report suspicious activity and unsafe locations.",
    },
  ];

  return (
    <div className="safety-page safety-page-clean">
      <div className="page-header safety-page-header">
        <p className="section-label">SAFETY INFORMATION</p>
        <h1>Stay informed. Stay safe.</h1>
        <p>Simple guidance for safer travel and emergencies.</p>
      </div>

      <section className="safety-status-card safety-status-clean">
        <div className="safety-status-icon">✓</div>

        <div className="safety-status-content">
          <p className="card-label">DEMO AREA STATUS</p>
          <h2>Low Risk</h2>
          <p>
            This is sample safety information. Check official local sources
            for current alerts.
          </p>
        </div>

        <span className="safe-badge">Demo status</span>
      </section>

      <section className="safety-section safety-section-clean">
        <div className="section-heading safety-section-heading">
          <div>
            <p className="section-label">TRAVEL GUIDELINES</p>
            <h2>Essential safety tips</h2>
          </div>
          <span className="safety-tip-count">6 tips</span>
        </div>

        <div className="safety-tips-grid safety-tips-clean">
          {safetyTips.map((tip, index) => (
            <article className="safety-tip safety-tip-clean" key={tip.title}>
              <div className="safety-tip-icon">{tip.icon}</div>

              <div className="safety-tip-content">
                <span className="safety-tip-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{tip.title}</h3>
                <p>{tip.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="emergency-guide emergency-guide-clean">
        <div className="emergency-guide-icon">!</div>

        <div className="emergency-guide-content">
          <p className="section-label">NEED URGENT HELP?</p>
          <h2>Go to emergency assistance</h2>
          <p>
            If you are in immediate danger, open the SOS page to review the
            emergency options.
          </p>
        </div>

        <button
          type="button"
          className="emergency-guide-button"
          onClick={() => navigate("/sos")}
        >
          Go to SOS <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
}

export default SafetyInfo;