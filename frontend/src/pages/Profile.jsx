import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage, userApi } from "../api/api.js";
import { useAuth } from "../context/useAuth.js";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await userApi.getProfile();
        setProfile(res.data?.user || null);
      } catch (err) {
        setMessage(errorMessage(err, "Failed to load profile. Is the backend running?"));
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to log out of YatraShield?");
    if (!confirmed) return;
    logout();
    navigate("/login");
  }

  const displayName = profile?.name || user?.name || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const roleLabel = profile?.role || user?.role || "tourist";

  return (
    <div className="profile-page">
      <div className="page-header">
        <p className="section-label">ACCOUNT</p>
        <h2>Your profile</h2>
        <p>Your account information, loaded from the YatraShield server.</p>
      </div>

      <div className="profile-card">
        <div className="profile-top">
          <div className="large-avatar">{avatarLetter}</div>
          <div>
            <h2>{displayName}</h2>
            <p className="role-chip">{roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)} account</p>
            <span className="account-status">● Account active</span>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <p className="section-label">PERSONAL INFORMATION</p>
            <h3>Account details</h3>
          </div>

          {loading ? (
            <p className="profile-feedback">Loading profile...</p>
          ) : (
            <div className="profile-fields">
              <div className="profile-field">
                <span>Full name</span>
                <strong>{profile?.name || user?.name || "Not provided"}</strong>
              </div>
              <div className="profile-field">
                <span>Email address</span>
                <strong>{profile?.email || user?.email || "Not provided"}</strong>
              </div>
              <div className="profile-field">
                <span>Account role</span>
                <strong>{roleLabel}</strong>
              </div>
            </div>
          )}

          {message && <p className="profile-feedback" role="status">{message}</p>}
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <p className="section-label">SAFETY PREFERENCES</p>
            <h3>Location & notifications</h3>
          </div>
          <div className="preference-row">
            <div>
              <h4>Location sharing</h4>
              <p>Allow your current location to be used for safety and emergency response.</p>
            </div>
            <span className="preference-active">Active</span>
          </div>
          <div className="preference-row">
            <div>
              <h4>Safety notifications</h4>
              <p>Receive warnings about nearby risk zones and important safety updates.</p>
            </div>
            <span className="preference-active">Enabled</span>
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="privacy-note">
        <span>🔒</span>
        <div>
          <h3>Your privacy matters</h3>
          <p>Location and incident information should only be accessible to authorized users involved in safety response.</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
