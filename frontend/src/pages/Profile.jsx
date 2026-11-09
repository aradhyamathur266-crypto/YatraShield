import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage, userApi } from "../api/api.js";
import { Icon } from "../components/Icon.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { Notice, PageHead, Skeleton } from "../components/ui.jsx";
import { useAuth } from "../context/useAuth.js";
import { useTheme } from "../utils/theme.js";
import { requestLogout } from "../utils/toast.js";

export default function Profile() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [state, setState] = useState({ profile: null, loading: true, error: "" });

  useEffect(() => {
    let cancelled = false;
    userApi
      .getProfile()
      .then((res) => {
        if (!cancelled) setState({ profile: res.data?.user || null, loading: false, error: "" });
      })
      .catch((err) => {
        if (!cancelled) setState({ profile: null, loading: false, error: errorMessage(err, "Failed to load profile.") });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { profile, loading, error } = state;
  const name = profile?.name || user?.name || "User";
  const email = profile?.email || user?.email || "";
  const role = profile?.role || user?.role || "tourist";

  return (
    <div className="page page-narrow">
      <PageHead eyebrow="Account" title={<>Your <em>profile.</em></>}>
        Account information loaded from the server.
      </PageHead>

      {error && <Notice tone="error">{error}</Notice>}

      <section className="card card-pad">
        <div className="profile-head">
          <span className="avatar avatar-lg" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          <div>
            <h2>{name}</h2>
            <p>{email}</p>
          </div>
          <span className="chip" data-tone="ok"><i className="chip-dot" /> Active</span>
        </div>

        {loading ? (
          <div className="facts-skeleton"><Skeleton height={52} /><Skeleton height={52} /></div>
        ) : (
          <dl className="facts facts-grid">
            <div><dt>Full name</dt><dd>{name}</dd></div>
            <div><dt>Email</dt><dd>{email || "—"}</dd></div>
            <div><dt>Role</dt><dd className="cap">{role}</dd></div>
            <div><dt>Member since</dt><dd>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString([], { dateStyle: "medium" }) : "—"}</dd></div>
          </dl>
        )}
      </section>

      <section className="card">
        <ul className="settings">
          <li>
            <Icon name="moon" size={18} />
            <div><strong>Appearance</strong><span>Currently {isDark ? "dark" : "light"}. Follows your device until you change it.</span></div>
            <ThemeToggle />
          </li>
          <li>
            <Icon name="pin" size={18} />
            <div><strong>Location sharing</strong><span>Used to attach your position to reports.</span></div>
            <span className="chip" data-tone="ok"><i className="chip-dot" /> On report</span>
          </li>
          <li>
            <Icon name="bell" size={18} />
            <div><strong>Live notifications</strong><span>Real-time status updates while the app is open.</span></div>
            <span className="chip" data-tone="ok"><i className="chip-dot" /> On</span>
          </li>
          <li>
            <Icon name="guide" size={18} />
            <div><strong>Safety guide</strong><span>Tips and emergency numbers.</span></div>
            <Link to="/safety" className="btn btn-sm btn-ghost">Open</Link>
          </li>
        </ul>
      </section>

      <div className="profile-actions">
        <button type="button" className="btn btn-ghost" onClick={requestLogout}>
          <Icon name="logout" size={16} /> Log out
        </button>
      </div>

      <p className="fine-print left">
        <Icon name="lock" size={13} /> Location and incident data are only visible to the people involved in your safety response.
      </p>
    </div>
  );
}
