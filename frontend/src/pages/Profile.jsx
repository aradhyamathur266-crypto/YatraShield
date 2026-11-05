
import { useEffect, useState } from "react";

const defaultProfile = {
  name: "Aradhya",
  email: "",
  phone: "",
};

function Profile() {
  const [profile, setProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem("yatrashield-profile");
      return savedProfile ? { ...defaultProfile, ...JSON.parse(savedProfile) } : defaultProfile;
    } catch (error) {
      console.error("Error loading profile:", error);
      return defaultProfile;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("yatrashield-profile", JSON.stringify(profile));
  }, [profile]);

  function handleEdit() {
    setEditForm(profile);
    setMessage("");
    setIsEditing(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSave(event) {
    event.preventDefault();

    const updatedProfile = {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
    };

    if (!updatedProfile.name) {
      setMessage("Please enter your name.");
      return;
    }

    setProfile(updatedProfile);
    setIsEditing(false);
    setMessage("Profile updated successfully.");
  }

  function handleCancel() {
    setEditForm(profile);
    setIsEditing(false);
    setMessage("");
  }

  function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to log out of the YatraShield demo?"
    );

    if (!confirmed) return;

    // Return to the Tourist Dashboard in this frontend demo.
    localStorage.setItem("yatrashield-dashboard", "tourist");
    window.location.assign("/");
  }

  const displayName = profile.name || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <p className="section-label">ACCOUNT</p>

        <h2>Your profile</h2>

        <p>Manage your account information and safety preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-top">
          <div className="large-avatar">{avatarLetter}</div>

          <div>
            <h2>{displayName}</h2>

            <p>Tourist account</p>

            <span className="account-status">● Account active</span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
          <div className="profile-section-title">
            <p className="section-label">PERSONAL INFORMATION</p>

            <h3>Account details</h3>
          </div>

          {isEditing ? (
            <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="profile-fields">
                <label className="profile-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </label>

                <label className="profile-field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </label>

                <div className="profile-field">
                  <span>Account role</span>
                  <strong>Tourist</strong>
                </div>
              </div>

              <div className="profile-edit-actions">
                <button type="submit" className="secondary-button">
                  Save changes
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-fields">
              <div className="profile-field">
                <span>Full name</span>
                <strong>{profile.name || "Not provided"}</strong>
              </div>

              <div className="profile-field">
                <span>Email address</span>
                <strong>{profile.email || "Not connected"}</strong>
              </div>

              <div className="profile-field">
                <span>Phone number</span>
                <strong>{profile.phone || "Not connected"}</strong>
              </div>

              <div className="profile-field">
                <span>Account role</span>
                <strong>Tourist</strong>
              </div>
            </div>
          )}

          {message && (
            <p className="profile-feedback" role="status">
              {message}
            </p>
          )}
        </div>

        {/* Safety Preferences */}
        <div className="profile-section">
          <div className="profile-section-title">
            <p className="section-label">SAFETY PREFERENCES</p>

            <h3>Location & notifications</h3>
          </div>

          <div className="preference-row">
            <div>
              <h4>Location sharing</h4>

              <p>
                Allow your current location to be used for safety and emergency
                response.
              </p>
            </div>

            <span className="preference-active">Active</span>
          </div>

          <div className="preference-row">
            <div>
              <h4>Safety notifications</h4>

              <p>
                Receive warnings about nearby risk zones and important safety
                updates.
              </p>
            </div>

            <span className="preference-active">Enabled</span>
          </div>
        </div>

        {/* Account Actions */}
        {!isEditing && (
          <div className="profile-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleEdit}
            >
              Edit profile
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Privacy Note */}
      <div className="privacy-note">
        <span>🔒</span>

        <div>
          <h3>Your privacy matters</h3>

          <p>
            Location and incident information should only be accessible to
            authorized users involved in safety response.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
