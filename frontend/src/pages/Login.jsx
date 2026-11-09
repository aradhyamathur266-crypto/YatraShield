import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { Icon } from "../components/Icon.jsx";
import { Notice } from "../components/ui.jsx";
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
    <AuthLayout
      headline={<>Help that arrives before you ask <em>twice.</em></>}
      body="One account for reporting, tracking and real-time response — whether you’re a tourist, a responder or a supervisor."
    >
      <p className="eyebrow">Welcome back</p>
      <h1>Log in</h1>
      <p className="auth-sub">Access your incidents, live map and real-time updates.</p>

      <form className="form-stack" onSubmit={onSubmit} noValidate>
        <label className="field" htmlFor="email">
          <span>Email</span>
          <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>

        <label className="field" htmlFor="password">
          <span>Password</span>
          <span className="input-wrap">
            <input id="password" type={showPw ? "text" : "password"} autoComplete="current-password"
              placeholder="Enter your password" value={form.password} onChange={(e) => set("password", e.target.value)} />
            <button type="button" className="icon-btn is-small" onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw}>
              <Icon name={showPw ? "eyeOff" : "eye"} size={17} />
            </button>
          </span>
        </label>

        {error && <Notice tone="error">{error}</Notice>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={authLoading}>
          {authLoading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="auth-alt">New here? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
