import { useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage, incidentApi } from "../api/api.js";
import { Icon } from "../components/Icon.jsx";
import { Notice, PageHead } from "../components/ui.jsx";
import { locationLabel, useGeolocation } from "../hooks/useGeolocation.js";

export default function SOS() {
  const geo = useGeolocation();
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [incidentId, setIncidentId] = useState(null);

  async function onSend() {
    setFeedback(null);
    setIncidentId(null);
    if (!geo.position) {
      setFeedback({ tone: "error", text: "Location isn’t ready. Allow access and try again — or call 112 now." });
      return;
    }
    try {
      setSending(true);
      const res = await incidentApi.create({
        category: "other",
        description: "EMERGENCY SOS — life-threatening situation, immediate help needed",
        location: { type: "Point", coordinates: [geo.position[1], geo.position[0]] },
      });
      setIncidentId(res.data?.incident?._id);
      setFeedback({ tone: "ok", text: "SOS sent. A responder will be assigned shortly — keep this page open." });
    } catch (err) {
      setFeedback({ tone: "error", text: errorMessage(err, "SOS could not be sent. If you’re in danger, call 112 directly.") });
    } finally {
      setSending(false);
    }
  }

  const sent = Boolean(incidentId);

  return (
    <div className="page page-narrow sos-page">
      <PageHead eyebrow="Emergency assistance" title={<>Need help <em>right now?</em></>} align="center">
        Only for immediate danger. This creates a critical incident with your live location.
      </PageHead>

      <section className="card sos-card">
        <p className="status-pill" data-state={geo.status}>
          <i className="live-dot" /> {locationLabel(geo.status)}
          {geo.position && <span className="mono"> · {geo.position[0].toFixed(4)}, {geo.position[1].toFixed(4)}</span>}
        </p>

        <div className="sos-stage" data-sent={sent}>
          <span className="sos-ripple" aria-hidden="true" />
          <span className="sos-ripple" aria-hidden="true" />
          <span className="sos-ripple" aria-hidden="true" />
          <button type="button" className="sos-button" onClick={onSend} disabled={sending || sent} aria-label="Send emergency SOS">
            <Icon name={sent ? "check" : "beacon"} size={34} strokeWidth={1.4} />
            <span>{sending ? "Sending…" : sent ? "Sent" : "Press for SOS"}</span>
          </button>
        </div>

        {feedback && <Notice tone={feedback.tone}>{feedback.text}</Notice>}
        {sent && (
          <Link to={`/incidents/${incidentId}`} className="btn btn-primary">
            Track this incident <Icon name="arrowRight" size={16} />
          </Link>
        )}
        {(geo.status === "denied" || geo.status === "error") && (
          <button type="button" className="btn btn-ghost" onClick={geo.retry}>Retry location</button>
        )}

        <a href="tel:112" className="call-112">
          <Icon name="phone" size={18} />
          <span><strong>Call 112</strong><small>Prefer a voice call? Emergency services answer directly.</small></span>
        </a>
      </section>

      <ul className="sos-facts">
        <li><span className="mono">01</span><strong>Location</strong><p>Your current position is attached to the emergency.</p></li>
        <li><span className="mono">02</span><strong>Priority</strong><p>SOS is always critical — first in every queue.</p></li>
        <li><span className="mono">03</span><strong>Response</strong><p>Responders and supervisors are notified instantly.</p></li>
      </ul>
      <p className="fine-print">Your location is shared only with assigned responders. YatraShield doesn’t replace emergency services.</p>
    </div>
  );
}
