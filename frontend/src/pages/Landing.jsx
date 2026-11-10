import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, Logo } from "../components/Icon.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { Segmented, Select, Skeleton } from "../components/ui.jsx";
import { useReveal } from "../hooks/useReveal.js";

const MapView = lazy(() => import("../components/MapView.jsx"));

// Mirror of backend priorityEngine.js — shown live so visitors see how triage works.
function demoPriority(category, description) {
  const text = description.toLowerCase();
  const critical = ["unconscious", "not breathing", "life-threatening", "life threatening", "severe bleeding", "trapped", "fire spreading"];
  const high = ["injured", "bleeding", "assault", "weapon", "threatened", "missing child", "stranded"];
  if (critical.some((k) => text.includes(k))) return { level: "critical", why: "Critical keyword detected" };
  if (high.some((k) => text.includes(k))) return { level: "high", why: "High-risk keyword detected" };
  const byCategory = { medical: "high", accident: "high", crime: "high", lost_person: "high", fire: "critical", natural_disaster: "critical" };
  const level = byCategory[category] || "medium";
  return { level, why: `Default for “${category.replace(/_/g, " ")}”` };
}

const LEVELS = ["low", "medium", "high", "critical"];

const SAMPLE_MARKERS = [
  { id: "s1", position: [28.4595, 77.0266], tone: "critical", pulse: true, label: "Sample critical incident" },
  { id: "s2", position: [28.4672, 77.0345], tone: "high", label: "Sample high-priority incident" },
  { id: "s3", position: [28.4521, 77.0189], tone: "medium", label: "Sample medium-priority incident" },
  { id: "s4", position: [28.4638, 77.0132], tone: "low", label: "Sample low-priority incident" },
  { id: "you", position: [28.4553, 77.0301], kind: "you", tone: "you", label: "Sample responder" },
];

const SAMPLE_QUEUE = [
  { id: "YS-9F2", t: "Medical — Cyber Hub", tone: "critical", s: "On scene" },
  { id: "YS-9F1", t: "Lost person — MG Road", tone: "high", s: "Assigned" },
  { id: "YS-9EE", t: "Harassment — Leisure Valley", tone: "medium", s: "Under review" },
];

const CATEGORY_OPTIONS = [
  ["medical", "Medical"], ["accident", "Accident"], ["crime", "Crime"], ["lost_person", "Lost person"],
  ["fire", "Fire"], ["harassment", "Harassment"], ["natural_disaster", "Natural disaster"], ["other", "Other"],
];

const ROLES = [
  {
    id: "tourist",
    label: "Tourists",
    headline: "Report it. Watch it move.",
    body: "A 30-second report with live GPS. You see triaged, assigned, en route, on scene — without calling anyone twice.",
    points: ["Status timeline on every incident", "SOS in one tap when it can’t wait", "No install — any browser works"],
    shows: ["Your reports and live status", "Where your responder is in the flow", "Real-time notifications"],
    cta: "Report as a tourist",
  },
  {
    id: "responder",
    label: "Responders",
    headline: "Critical first. Always.",
    body: "Your queue holds only the cases assigned to you, with an acknowledgement timer. Miss it and the case escalates itself.",
    points: ["Assigned queue, newest priority first", "One-tap status: acknowledged → on scene", "Socket push the second you’re assigned"],
    shows: ["Only cases assigned to you", "Acknowledgement timers", "One-tap status updates"],
    cta: "Join as a responder",
  },
  {
    id: "authority",
    label: "Authorities",
    headline: "The whole network, one queue.",
    body: "Supervisors triage, assign and reassign from a single view — with responder workload and an operations map attached.",
    points: ["All incidents, filtered by priority and status", "Assign in seconds, reassign in one", "Automatic escalation on missed acknowledgement"],
    shows: ["Every incident in the cluster", "Responder workload", "Operations map"],
    cta: "Coordinate as authority",
  },
];

const WHY = [
  ["Report in 30 seconds", "Category, one short description, live GPS. Structured enough to act on, short enough to send with one hand."],
  ["Triaged before a human reads it", "Critical keywords — unconscious, trapped, not breathing — and category defaults set priority instantly. The most urgent case is never buried."],
  ["Assigned, not shouted", "A supervisor assigns the right responder directly. They see it live, with a five-minute acknowledgement timer."],
  ["Tracked to close", "Acknowledged, en route, on scene, resolved — every transition pushes to the tourist and the team. No “we’ll call you back.”"],
];

const STATS = [
  ["9", "statuses from reported to closed"],
  ["8", "incident categories"],
  ["5 min", "acknowledgement before auto-escalation"],
  ["0", "apps to install"],
];

const FAQS = [
  ["Is YatraShield free to use?", "Tourists report for free, and it runs in any modern browser — nothing to install. Authorities run their own instance for their jurisdiction."],
  ["What if I have no internet?", "Call 112 — YatraShield never replaces emergency services. It coordinates the response around the official channels, it doesn’t substitute for them."],
  ["Who can see my location?", "Only you, the assigned responder and authorized supervisors. Location is attached to a single incident at report time — it isn’t tracked continuously."],
  ["How is priority decided?", "The server scans your description for critical keywords (unconscious, trapped, not breathing…) and high-risk keywords, then falls back to category defaults — medical, accident, crime and lost person default to high; fire and natural disaster to critical."],
];

export default function Landing() {
  const rootRef = useRef(null);
  useReveal(rootRef);
  const [openFaq, setOpenFaq] = useState(0);
  const [roleTab, setRoleTab] = useState("tourist");
  const [demoCategory, setDemoCategory] = useState("medical");
  const [demoText, setDemoText] = useState("Tourist unconscious near Cyber Hub exit, needs help now");
  const demo = useMemo(() => demoPriority(demoCategory, demoText), [demoCategory, demoText]);
  const activeRole = ROLES.find((r) => r.id === roleTab);
  const levelIndex = LEVELS.indexOf(demo.level);

  return (
    <div className="lp" ref={rootRef}>
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link to="/" className="brand">
            <Logo size={28} />
            <span className="brand-name">YatraShield</span>
          </Link>
          <nav className="lp-links" aria-label="Sections">
            <a href="#why">Why</a>
            <a href="#triage">Triage</a>
            <a href="#roles">Roles</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-nav-actions">
            <ThemeToggle />
            <Link to="/login" className="btn btn-quiet lp-login">Log in</Link>
            <Link to="/register" className="btn btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-wrap lp-hero">
        <div className="lp-hero-copy">
          <p className="eyebrow lp-in" style={{ "--d": "0ms" }}>Gurugram · Live safety network</p>
          <h1 className="lp-in" style={{ "--d": "80ms" }}>
            When someone needs help <em>now,</em> minutes matter.
          </h1>
          <p className="lp-lede lp-in" style={{ "--d": "160ms" }}>
            YatraShield turns a 30-second report into a triaged, assigned and tracked response — so a
            tourist in Cyber Hub isn’t left explaining the same emergency on three phone calls.
          </p>
          <div className="lp-cta lp-in" style={{ "--d": "240ms" }}>
            <Link to="/register" className="btn btn-primary btn-lg">Report an incident <Icon name="arrowRight" size={17} /></Link>
            <Link to="/register" className="btn btn-signal btn-lg"><Icon name="beacon" size={17} /> Emergency SOS</Link>
          </div>
          <p className="lp-note lp-in" style={{ "--d": "300ms" }}>
            In a real emergency, always dial <strong>112</strong>. YatraShield coordinates the response around it.
          </p>
        </div>

        <div className="lp-hero-media lp-in" style={{ "--d": "200ms" }}>
          <div className="lp-console">
            <div className="lp-console-bar">
              <span className="mono">yatrashield / control room</span>
              <span className="lp-sample">Sample data</span>
            </div>
            <div className="lp-console-map">
              <Suspense fallback={<Skeleton height="100%" />}>
                <MapView
                  className="map-fill"
                  markers={SAMPLE_MARKERS}
                  initialCenter={[28.4595, 77.0266]}
                  zoom={13.6}
                  interactive={false}
                  label="Illustrative map of Gurugram with sample incidents"
                />
              </Suspense>
            </div>
            <ul className="lp-queue">
              {SAMPLE_QUEUE.map((r) => (
                <li key={r.id}>
                  <span className="mono">{r.id}</span>
                  <span className="lp-queue-t">{r.t}</span>
                  <span className="chip" data-tone={r.tone}><i className="chip-dot" />{r.tone}</span>
                  <span className="lp-queue-s">{r.s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="lp-stats" data-reveal>
          {STATS.map(([n, l]) => (
            <div key={l}><dt>{n}</dt><dd>{l}</dd></div>
          ))}
        </dl>
      </section>

      {/* WHY */}
      <section className="lp-wrap lp-section lp-why" id="why">
        <div className="lp-section-head" data-reveal>
          <p className="eyebrow">Why YatraShield</p>
          <h2>The gap between “help” and “helped” is where incidents get <em>worse.</em></h2>
        </div>
        <ol className="lp-rows">
          {WHY.map(([t, d], i) => (
            <li key={t} data-reveal>
              <span className="lp-rows-no">0{i + 1}</span>
              <div><h3>{t}</h3><p>{d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      {/* TRIAGE */}
      <section className="lp-band" id="triage">
        <div className="lp-wrap lp-triage">
          <div data-reveal>
            <p className="eyebrow">Try the triage engine</p>
            <h2>See what priority your report would get.</h2>
            <p className="lp-body">This is the real ruleset from the server, running in your browser. Pick a category and describe the incident.</p>
            <div className="form-stack lp-demo-form">
              <label className="field">
                <span>Category</span>
                <Select className="is-block" value={demoCategory} onChange={(e) => setDemoCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={3} value={demoText} onChange={(e) => setDemoText(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="lp-result" data-reveal data-tone={demo.level}>
            <p className="eyebrow">Result</p>
            <p className="lp-result-level" aria-live="polite">{demo.level}</p>
            <div className="lp-meter" role="img" aria-label={`Priority ${demo.level}`}>
              {LEVELS.map((l, i) => <i key={l} data-on={i <= levelIndex} />)}
            </div>
            <p className="lp-result-why">
              {demo.why}.{" "}
              {demo.level === "critical"
                ? "This jumps to the front of every responder queue."
                : demo.level === "high"
                  ? "This is flagged for prompt assignment."
                  : "This enters the normal queue in order."}
            </p>
            <ol className="lp-flow">
              <li>Reported</li><li>Triaged</li><li>Assigned</li>
            </ol>
            <Link to="/register" className="btn btn-primary">Report for real <Icon name="arrowRight" size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="lp-wrap lp-section" id="roles">
        <div className="lp-section-head" data-reveal>
          <p className="eyebrow">Roles</p>
          <h2>Same network. <em>Three views.</em></h2>
        </div>
        <div data-reveal>
          <Segmented
            label="Choose a role"
            value={roleTab}
            onChange={setRoleTab}
            options={ROLES.map((r) => ({ value: r.id, label: r.label }))}
            className="lp-seg"
          />
          <div className="lp-rolepanel" key={activeRole.id}>
            <div>
              <h3>{activeRole.headline}</h3>
              <p>{activeRole.body}</p>
              <ul className="lp-checks">
                {activeRole.points.map((p) => <li key={p}><Icon name="check" size={15} strokeWidth={2.2} />{p}</li>)}
              </ul>
              <Link to="/register" className="inline-link">{activeRole.cta} <Icon name="arrowUpRight" size={14} /></Link>
            </div>
            <aside className="lp-aside">
              <p className="eyebrow">Your view shows</p>
              <ul>{activeRole.shows.map((s) => <li key={s}>{s}</li>)}</ul>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-wrap lp-section lp-faq-sec" id="faq">
        <div className="lp-section-head" data-reveal>
          <p className="eyebrow">FAQ</p>
          <h2>Questions, <em>answered.</em></h2>
        </div>
        <div className="lp-faq" data-reveal>
          {FAQS.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q} className="lp-faq-item" data-open={open}>
                <h3>
                  <button type="button" onClick={() => setOpenFaq(open ? -1 : i)} aria-expanded={open} aria-controls={`faq-${i}`}>
                    {q}
                    <Icon name="plus" size={18} />
                  </button>
                </h3>
                <div className="lp-faq-a" id={`faq-${i}`} inert={!open}>
                  <div><p>{a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-wrap">
        <div className="lp-cta2" data-reveal>
          <h2>Stay safe. <em>Stay covered.</em></h2>
          <p>Free account. One minute to register. Thirty seconds to your first report.</p>
          <div className="lp-cta2-actions">
            <Link to="/register" className="btn btn-signal btn-lg">Get started <Icon name="arrowRight" size={17} /></Link>
            <Link to="/login" className="btn btn-ghost-dark btn-lg">Log in</Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-grid">
          <div>
            <Link to="/" className="brand"><Logo size={26} /><span className="brand-name">YatraShield</span></Link>
            <p>Real-time incident reporting, triage and response — built for Gurugram.</p>
          </div>
          <nav className="lp-footer-nav" aria-label="Product">
            <strong>Product</strong>
            <a href="#why">Why</a><a href="#triage">Triage</a><a href="#roles">Roles</a><a href="#faq">FAQ</a>
          </nav>
          <nav className="lp-footer-nav" aria-label="Account">
            <strong>Account</strong>
            <Link to="/register">Register</Link><Link to="/login">Log in</Link>
          </nav>
          <div className="lp-footer-nav">
            <strong>Emergency</strong>
            <a href="tel:112">112 — police &amp; fire</a>
            <a href="tel:108">108 — ambulance</a>
            <a href="tel:1091">1091 — women helpline</a>
          </div>
        </div>
        <div className="lp-wrap lp-footer-base">
          <span>© 2026 YatraShield · In a real emergency, always dial 112.</span>
        </div>
      </footer>
    </div>
  );
}
