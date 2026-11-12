import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { Icon } from "../components/Icon.jsx";
import { Notice } from "../components/ui.jsx";
import { useAuth } from "../context/useAuth.js";

const ROLES = [
  { value: "tourist", label: "Tourist", hint: "Report & track" },
  { value: "responder", label: "Responder", hint: "Handle cases" },
  { value: "supervisor", label: "Supervisor", hint: "Manage & assign" },
  { value: "admin", label: "Admin", hint: "Full access" },
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
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords don’t match.");
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  }

  return (
    <AuthLayout
      headline={<>One account. Every safety tool you <em>need.</em></>}
      body="Pick your role to unlock the right view — tourists report, responders respond, authorities coordinate."
    >
      <p className="eyebrow">Create account</p>
      <h1>Join YatraShield</h1>
      <p className="auth-sub">Free for civilians. Set up in under a minute.</p>

      <form className="form-stack" onSubmit={onSubmit} noValidate>
        <fieldset className="field">
          <legend>Account type</legend>
          <div className="role-grid">
            {ROLES.map((r) => (
              <label key={r.value} className="role-opt">
                <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={() => set("role", r.value)} />
                <span className="role-opt-body">
                  <strong>{r.label}</strong>
                  <small>{r.hint}</small>
                </span>
              </label>
            ))}
          </div>
          <small>For this demo you can register directly as any role.</small>
        </fieldset>

        <div className="field-row">
          <label className="field" htmlFor="name">
            <span>Full name</span>
            <input id="name" autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="field" htmlFor="email">
            <span>Email</span>
            <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => set("email", e.target.value)} />
          </label>
        </div>

        <div className="field-row">
          <label className="field" htmlFor="password">
            <span>Password</span>
            <span className="input-wrap">
              <input id="password" type={showPw ? "text" : "password"} autoComplete="new-password"
                placeholder="Minimum 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} />
              <button type="button" className="icon-btn is-small" onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide passwords" : "Show passwords"} aria-pressed={showPw}>
                <Icon name={showPw ? "eyeOff" : "eye"} size={17} />
              </button>
            </span>
          </label>
          <label className="field" htmlFor="confirm">
            <span>Confirm password</span>
            <input id="confirm" type={showPw ? "text" : "password"} autoComplete="new-password"
              placeholder="Re-enter password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
          </label>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={authLoading}>
          {authLoading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-alt">Already have an account? <Link to="/login">Log in</Link></p>
    </AuthLayout>
  );
}
