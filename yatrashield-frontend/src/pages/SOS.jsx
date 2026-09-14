function SOS() {
  return (
    <div className="sos-page">

      <div className="sos-header">

        <p className="section-label">
          EMERGENCY ASSISTANCE
        </p>

        <h2>
          Need immediate help?
        </h2>

        <p>
          Use SOS only when you or someone nearby is in immediate danger.
        </p>

      </div>


      <div className="sos-card">

        <div className="sos-icon">
          🆘
        </div>

        <h1>
          Emergency SOS
        </h1>

        <p>
          Pressing the button will create a critical emergency
          incident and share your current location with the
          response team.
        </p>


        <button className="sos-button">
          PRESS FOR SOS
        </button>


        <p className="sos-note">
          Your location will be shared with emergency responders.
        </p>

      </div>


      <div className="sos-info-grid">

        <div className="sos-info-card">

          <span>📍</span>

          <div>
            <h3>
              Location
            </h3>

            <p>
              Your current location will be attached to the emergency request.
            </p>
          </div>

        </div>


        <div className="sos-info-card">

          <span>🚨</span>

          <div>
            <h3>
              Priority
            </h3>

            <p>
              SOS requests are treated as critical priority incidents.
            </p>
          </div>

        </div>


        <div className="sos-info-card">

          <span>👮</span>

          <div>
            <h3>
              Response
            </h3>

            <p>
              An available responder can be assigned to your emergency.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SOS;