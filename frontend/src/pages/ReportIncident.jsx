import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage, incidentApi } from "../api/api.js";
import { Icon } from "../components/Icon.jsx";
import { Notice, PageHead, Skeleton } from "../components/ui.jsx";
import { locationLabel, useGeolocation } from "../hooks/useGeolocation.js";
import { shortId } from "../utils/incidents.js";

const MapView = lazy(() => import("../components/MapView.jsx"));

const CATEGORY_OPTIONS = [
  { value: "medical", label: "Medical", hint: "Injury, illness" },
  { value: "accident", label: "Accident", hint: "Road, fall, collision" },
  { value: "crime", label: "Crime", hint: "Theft, assault" },
  { value: "lost_person", label: "Lost / missing", hint: "Person or child" },
  { value: "fire", label: "Fire", hint: "Smoke, flames" },
  { value: "harassment", label: "Harassment", hint: "Threats, stalking" },
  { value: "natural_disaster", label: "Natural disaster", hint: "Flood, quake" },
  { value: "other", label: "Other", hint: "Anything else" },
];

export default function ReportIncident() {
  const geo = useGeolocation();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone, text }
  const [created, setCreated] = useState(null);

  const markers = useMemo(
    () => (geo.position ? [{ id: "you", position: geo.position, kind: "you", tone: "you", label: "Report location" }] : []),
    [geo.position]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setFeedback(null);
    setCreated(null);
    if (!category) return setFeedback({ tone: "error", text: "Pick a category first." });
    if (!description.trim()) return setFeedback({ tone: "error", text: "Describe what happened." });
    if (!geo.position) return setFeedback({ tone: "error", text: "Location is required. Allow location access and try again." });

    const finalDescription = emergency
      ? `EMERGENCY — currently in immediate danger: ${description.trim()}`
      : description.trim();

    try {
      setSubmitting(true);
      const res = await incidentApi.create({
        category,
        description: finalDescription,
        location: { type: "Point", coordinates: [geo.position[1], geo.position[0]] },
      });
      const incident = res.data?.incident;
      setCreated(incident);
      setFeedback({
        tone: "ok",
        text: incident
          ? `Incident ${shortId(incident)} reported. Priority: ${(incident.priority || "").toUpperCase()}.`
          : "Incident reported successfully.",
      });
      setCategory("");
      setDescription("");
      setEmergency(false);
    } catch (err) {
      setFeedback({ tone: "error", text: errorMessage(err, "Could not submit. Is the backend running?") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-narrow">
      <PageHead eyebrow="Safety report" title={<>Report an <em>incident.</em></>}>
        Structured reports get triaged faster. Priority is calculated automatically.
      </PageHead>

      <form onSubmit={onSubmit} className="card card-pad form-stack" noValidate>
        <fieldset className="field">
          <legend>Category</legend>
          <div className="cat-grid">
            {CATEGORY_OPTIONS.map(({ value, label, hint }, i) => (
              <button
                key={value}
                type="button"
                className="cat"
                aria-pressed={category === value}
                onClick={() => {
                  setCategory(value);
                  setFeedback(null);
                }}
              >
                <span className="mono cat-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="cat-label">{label}</span>
                <span className="cat-hint">{hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field" htmlFor="desc">
          <span>Description</span>
          <textarea
            id="desc"
            rows={5}
            maxLength={1000}
            placeholder="What happened, where exactly, and how many people are involved…"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setFeedback(null);
            }}
          />
          <small>{description.length}/1000 · Words like “unconscious” or “trapped” raise priority automatically.</small>
        </label>

        <div className="switch-row" data-on={emergency}>
          <div>
            <strong>Immediate danger</strong>
            <small>Someone is in danger or unable to move. Escalates priority to critical.</small>
          </div>
          <button
            type="button"
            className="switch"
            role="switch"
            aria-checked={emergency}
            aria-label="Immediate danger"
            onClick={() => setEmergency((s) => !s)}
          >
            <i />
          </button>
        </div>

        <div className="loc-card">
          <div className="loc-map">
            {geo.position ? (
              <Suspense fallback={<Skeleton height="100%" />}>
                <MapView
                  className="map-fill"
                  markers={markers}
                  initialCenter={geo.position}
                  zoom={16}
                  interactive={false}
                  label="Report location preview"
                />
              </Suspense>
            ) : (
              <div className="loc-placeholder"><Icon name="pin" size={22} /></div>
            )}
          </div>
          <div className="loc-meta">
            <p className="eyebrow">Location</p>
            <strong>{locationLabel(geo.status)}</strong>
            {geo.position && (
              <span className="mono">
                {geo.position[0].toFixed(5)}, {geo.position[1].toFixed(5)}
                {geo.accuracy ? ` · ±${Math.round(geo.accuracy)} m` : ""}
              </span>
            )}
            {(geo.status === "denied" || geo.status === "error") && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={geo.retry}>Try again</button>
            )}
          </div>
        </div>

        {feedback && (
          <Notice tone={feedback.tone}>
            {feedback.text}
            {created && feedback.tone === "ok" && (
              <> <Link to={`/incidents/${created._id}`} className="inline-link">Track it <Icon name="arrowRight" size={13} /></Link></>
            )}
          </Notice>
        )}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit incident"}
        </button>
        <p className="fine-print">Evidence uploads are coming soon. Reports are stored securely on the server.</p>
      </form>
    </div>
  );
}
