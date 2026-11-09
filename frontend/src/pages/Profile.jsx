import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LogOut, MapPin, Bell } from "lucide-react";
import { errorMessage, userApi } from "../api/api.js";
import { useAuth } from "../context/useAuth.js";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userApi.getProfile();
        if (!cancelled) setProfile(res.data?.user || null);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Failed to load profile."));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  function onLogout() {
    if (!window.confirm("Log out of YatraShield?")) return;
    logout();
    navigate("/login");
  }

  const name = profile?.name || user?.name || "User";
  const email = profile?.email || user?.email || "";
  const role = profile?.role || user?.role || "tourist";
  const initials = name.charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-head">
        <span className="eyebrow">Account</span>
        <h1>Your profile</h1>
        <p>Account information loaded from the server.</p>
      </div>

      {error && <div className="alert alert-error" role="alert"><AlertCircle />{error}</div>}

      <div className="card card-pad">
        <div className="profile-head">
          <span className="avatar-lg">{initials}</span>
          <div>
            <h2 style={{ fontSize: 20 }}>{name}</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{email}</p>
            <span className="role-chip" style={{ marginTop: 8 }}>{role}</span>
          </div>
          <span className="pill pill-resolved" style={{ marginLeft: "auto" }}><span className="live-dot" /> Active</span>
        </div>

        <div style={{ height: 1, background: "var(--line)", margin: "22px 0" }} />

        {loading ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div className="skeleton" style={{ height: 44 }} />
            <div className="skeleton" style={{ height: 44 }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="coord"><span>Full name</span><strong>{name}</strong></div>
            <div className="coord"><span>Email</span><strong style={{ fontSize: 13 }}>{email || "—"}</strong></div>
            <div className="coord"><span>Role</span><strong>{role}</strong></div>
            <div className="coord"><span>Member since</span><strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</strong></div>
          </div>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 14, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
            <MapPin style={{ width: 18, height: 18, color: "var(--emerald-dark)" }} />
            <div style={{ flex: 1 }}><strong style={{ fontSize: 13 }}>Location sharing</strong><p style={{ fontSize: 12, color: "var(--muted)" }}>Used to attach your position to reports.</p></div>
            <span className="pill pill-resolved">On</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 14, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
            <Bell style={{ width: 18, height: 18, color: "var(--emerald-dark)" }} />
            <div style={{ flex: 1 }}><strong style={{ fontSize: 13 }}>Safety notifications</strong><p style={{ fontSize: 12, color: "var(--muted)" }}>Real-time status updates for your incidents.</p></div>
            <span className="pill pill-resolved">On</span>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
          <button className="btn btn-danger" onClick={onLogout}><LogOut style={{ width: 16, height: 16 }} /> Log out</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 18, fontSize: 13, color: "var(--muted)", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 18 }}>🔒</span>
        <span><strong style={{ color: "var(--text)" }}>Your privacy matters.</strong> Location and incident data are only visible to users involved in your safety response.</span>
      </div>
    </div>
  );
}
