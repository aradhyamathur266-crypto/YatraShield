import { Link } from "react-router-dom";
import { Logo } from "./Icon.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const FLOW = ["Report", "Triage", "Assign", "Resolve"];

export default function AuthLayout({ headline, body, children }) {
  return (
    <div className="auth">
      <aside className="auth-art">
        <Link to="/" className="brand brand-on-dark">
          <Logo size={30} />
          <span className="brand-name">YatraShield</span>
        </Link>

        <div className="auth-radar" aria-hidden="true">
          <i /><i /><i /><i />
          <span className="auth-radar-sweep" />
          <span className="auth-radar-core" />
        </div>

        <div className="auth-copy">
          <h2>{headline}</h2>
          <p>{body}</p>
          <ol className="auth-flow" aria-label="How a report moves">
            {FLOW.map((step, i) => (
              <li key={step}><span className="mono">0{i + 1}</span>{step}</li>
            ))}
          </ol>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-top">
          <Link to="/" className="brand auth-brand-mobile">
            <Logo size={26} />
            <span className="brand-name">YatraShield</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
