import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function Register() {
  const { register, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tourist",
  });
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!formData.name.trim()) return setMessage("Please enter your name.");
    if (!formData.email.trim()) return setMessage("Please enter your email.");
    if (formData.password.length < 6) return setMessage("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword) return setMessage("Passwords do not match.");

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      navigate("/");
    } catch (err) {
      setMessage(err.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="report-page auth-page">
      <div className="page-header">
        <p className="section-label">CREATE ACCOUNT</p>
        <h1>Join YatraShield</h1>
        <p>Create an account to report incidents and track responses in real time.</p>
      </div>

      <form className="report-form-card auth-form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </div>

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
          <label htmlFor="role">Account type</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="tourist">Tourist (report & track incidents)</option>
            <option value="responder">Responder (handle assigned incidents)</option>
            <option value="supervisor">Supervisor (manage & assign incidents)</option>
            <option value="admin">Admin (full access)</option>
          </select>
          <small>For demo purposes you may register directly as any role.</small>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
          />
        </div>

        {(message || authError) && (
          <p className="form-message error-message" role="alert">{message || authError}</p>
        )}

        <button type="submit" className="submit-report" disabled={authLoading}>
          {authLoading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-switch-note">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
