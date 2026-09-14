function SafetyInfo() {
  return (
    <div className="safety-page">

      {/* Page Header */}
      <div className="page-header">
        <p className="section-label">
          SAFETY INFORMATION
        </p>

        <h2>
          Stay informed. Stay safe.
        </h2>

        <p>
          Important safety guidance to help you travel safely
          and respond to emergencies.
        </p>
      </div>


      {/* Current Safety Status */}
      <div className="safety-status-card">

        <div className="safety-status-icon">
          ✓
        </div>

        <div>
          <p className="card-label">
            CURRENT AREA STATUS
          </p>

          <h2>
            Low Risk
          </h2>

          <p>
            No major safety warnings have been detected around
            your current location.
          </p>
        </div>

        <span className="safe-badge">
          Safe area
        </span>

      </div>


      {/* Safety Guidelines */}
      <div className="safety-section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              TRAVEL GUIDELINES
            </p>

            <h2>
              Essential safety tips
            </h2>
          </div>

        </div>


        <div className="safety-tips-grid">

          <div className="safety-tip">

            <div className="safety-tip-icon">
              📍
            </div>

            <div>
              <h3>
                Keep your location available
              </h3>

              <p>
                Allow location access when using safety features
                so responders can locate you during an incident.
              </p>
            </div>

          </div>


          <div className="safety-tip">

            <div className="safety-tip-icon">
              ⚠️
            </div>

            <div>
              <h3>
                Pay attention to risk warnings
              </h3>

              <p>
                Check the safety map and be cautious when entering
                areas marked as high-risk or restricted.
              </p>
            </div>

          </div>


          <div className="safety-tip">

            <div className="safety-tip-icon">
              🆘
            </div>

            <div>
              <h3>
                Use SOS during emergencies
              </h3>

              <p>
                Use SOS when you or someone nearby is facing
                immediate danger and needs urgent assistance.
              </p>
            </div>

          </div>


          <div className="safety-tip">

            <div className="safety-tip-icon">
              📱
            </div>

            <div>
              <h3>
                Keep your phone accessible
              </h3>

              <p>
                Keep your device charged and accessible so you can
                contact emergency services when necessary.
              </p>
            </div>

          </div>


          <div className="safety-tip">

            <div className="safety-tip-icon">
              👥
            </div>

            <div>
              <h3>
                Stay aware of your surroundings
              </h3>

              <p>
                Stay alert in unfamiliar areas and avoid isolated
                locations whenever possible.
              </p>
            </div>

          </div>


          <div className="safety-tip">

            <div className="safety-tip-icon">
              🛡️
            </div>

            <div>
              <h3>
                Report safety concerns
              </h3>

              <p>
                Report suspicious activity, unsafe areas or other
                incidents to help improve tourist safety.
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* Emergency Guide */}
      <div className="emergency-guide">

        <div>
          <p className="section-label">
            IN AN EMERGENCY
          </p>

          <h2>
            Need immediate assistance?
          </h2>

          <p>
            If you are in immediate danger, use the SOS feature.
            Your location can be attached to the emergency request
            for faster response.
          </p>
        </div>

        <button className="emergency-guide-button">
          Go to SOS
        </button>

      </div>

    </div>
  );
}

export default SafetyInfo;