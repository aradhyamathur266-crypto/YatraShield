import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function Login() {
  const { login, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    if (!formData.email.trim() || !formData.password) {
      setMessage("Please enter your email and password.");
      return;
    }
    try {
      await login(formData.email.trim(), formData.password);
      navigate("/");
    } catch (err) {
      setMessage(err.message || "Login failed. Please try again.");
    }
  }

  return (
    <div className="report-page auth-page">
      <div className="page-header">
        <p className="section-label">WELCOME BACK</p>
        <h1>Log in to YatraShield</h1>
        <p>Access your incidents, live safety map, and real-time updates.</p>
      </div>

      <form className="report-form-card auth-form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        {(message || authError) && (
          <p className="form-message error-message" role="alert">{message || authError}</p>
        )}

        <button type="submit" className="submit-report" disabled={authLoading}>
          {authLoading ? "Logging in..." : "Log in"}
        </button>

        <p className="auth-switch-note">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
