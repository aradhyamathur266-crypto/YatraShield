import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/useAuth.js";

const ROLES = [
  { value: "tourist", label: "Tourist — report & track" },
  { value: "responder", label: "Responder — handle cases" },
  { value: "supervisor", label: "Supervisor — manage & assign" },
  { value: "admin", label: "Admin — full access" },
];

export default function Register() {
  const { register, authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "tourist" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function set(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
          <h2>One account. Every safety tool you need.</h2>
          <p>Pick your role to unlock the right view — tourists report, responders respond, authorities coordinate. You can switch accounts anytime.</p>
        </div>
        <div className="auth-quote">
          "The queue shows me exactly what needs attention, and I assign in one click."
          <strong>— Supervisor, control center</strong>
        </div>
      </div>

      <div className="auth-panel">
        <span className="eyebrow">Create account</span>
        <h1>Join YatraShield</h1>
        <p className="sub">Free forever for civilians. Set up in under a minute.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="role">Account type</label>
            <select id="role" value={form.role} onChange={(e) => set("role", e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <small>For demo you may register directly as any role.</small>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input id="password" type={showPw ? "text" : "password"} autoComplete="new-password"
                placeholder="Minimum 6 characters" value={form.password} onChange={(e) => set("password", e.target.value)} required />
              <button type="button" className="password-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type={showPw ? "text" : "password"} autoComplete="new-password"
              placeholder="Re-enter your password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required />
          </div>

          {error && <div className="alert alert-error" role="alert"><AlertCircle />{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={authLoading}>
            {authLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-alt">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
