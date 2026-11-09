import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/useAuth.js";

export default function Login() {
  const { login, authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function set(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) return setError("Enter your email and password.");
    try {
      await login(form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Check your details and try again.");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-story">
        <Link to="/" className="brand" style={{ color: "#fff", textDecoration: "none" }}>
          <span className="brand-mark" style={{ background: "rgba(255,255,255,.12)" }}><Shield /></span>
          <span className="brand-name" style={{ color: "#fff" }}>YatraShield</span>
        </Link>
        <div>
          <h2>Safety that arrives before you have to ask twice.</h2>
          <p>One account for reporting, tracking, and real-time response — whether you're a tourist, responder, or supervisor.</p>
        </div>
        <div className="auth-quote">
          "Reported at Cyber Hub, responder on scene in 6 minutes. I could see every update live."
          <strong>— Tourist, Gurugram</strong>
        </div>
      </div>

      <div className="auth-panel">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in to YatraShield</h1>
        <p className="sub">Access your incidents, live map, and real-time updates.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input id="password" type={showPw ? "text" : "password"} autoComplete="current-password"
                placeholder="Enter your password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
              <button type="button" className="password-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && <div className="alert alert-error" role="alert"><AlertCircle />{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={authLoading}>
            {authLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-alt">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
