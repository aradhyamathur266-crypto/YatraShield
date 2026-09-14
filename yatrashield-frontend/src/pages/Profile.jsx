function Profile() {
  return (
    <div className="profile-page">

      {/* Page Header */}
      <div className="page-header">
        <p className="section-label">
          ACCOUNT
        </p>

        <h2>
          Your profile
        </h2>

        <p>
          Manage your account information and safety preferences.
        </p>
      </div>


      {/* Profile Card */}
      <div className="profile-card">

        <div className="profile-top">

          <div className="large-avatar">
            A
          </div>

          <div>
            <h2>
              Aradhya
            </h2>

            <p>
              Tourist account
            </p>

            <span className="account-status">
              ● Account active
            </span>
          </div>

        </div>


        {/* Personal Information */}
        <div className="profile-section">

          <div className="profile-section-title">
            <p className="section-label">
              PERSONAL INFORMATION
            </p>

            <h3>
              Account details
            </h3>
          </div>


          <div className="profile-fields">

            <div className="profile-field">
              <span>
                Full name
              </span>

              <strong>
                Aradhya
              </strong>
            </div>


            <div className="profile-field">
              <span>
                Email address
              </span>

              <strong>
                Not connected
              </strong>
            </div>


            <div className="profile-field">
              <span>
                Phone number
              </span>

              <strong>
                Not connected
              </strong>
            </div>


            <div className="profile-field">
              <span>
                Account role
              </span>

              <strong>
                Tourist
              </strong>
            </div>

          </div>

        </div>


        {/* Safety Preferences */}
        <div className="profile-section">

          <div className="profile-section-title">

            <p className="section-label">
              SAFETY PREFERENCES
            </p>

            <h3>
              Location & notifications
            </h3>

          </div>


          <div className="preference-row">

            <div>
              <h4>
                Location sharing
              </h4>

              <p>
                Allow your current location to be used for
                safety and emergency response.
              </p>
            </div>

            <span className="preference-active">
              Active
            </span>

          </div>


          <div className="preference-row">

            <div>
              <h4>
                Safety notifications
              </h4>

              <p>
                Receive warnings about nearby risk zones and
                important safety updates.
              </p>
            </div>

            <span className="preference-active">
              Enabled
            </span>

          </div>

        </div>


        {/* Account Actions */}
        <div className="profile-actions">

          <button className="secondary-button">
            Edit profile
          </button>

          <button className="logout-button">
            Log out
          </button>

        </div>

      </div>


      {/* Privacy Note */}
      <div className="privacy-note">

        <span>
          🔒
        </span>

        <div>
          <h3>
            Your privacy matters
          </h3>

          <p>
            Location and incident information should only be
            accessible to authorized users involved in safety
            response.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Profile;