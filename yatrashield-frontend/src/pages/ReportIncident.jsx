function ReportIncident() {
  return (
    <div className="report-page">

      <div className="page-header">
        <p className="section-label">SAFETY REPORT</p>

        <h2>Report an incident</h2>

        <p>
          Provide details about the incident so the response team can assist you.
        </p>
      </div>


      <div className="report-form-card">

        {/* Incident Category */}
        <div className="form-group">

          <label htmlFor="category">
            Incident category
          </label>

          <select id="category">

            <option value="">
              Select incident category
            </option>

            <option value="medical">
              Medical Emergency
            </option>

            <option value="accident">
              Accident
            </option>

            <option value="theft">
              Theft
            </option>

            <option value="harassment">
              Harassment
            </option>

            <option value="lost">
              Lost / Missing
            </option>

            <option value="unsafe">
              Unsafe Area
            </option>

            <option value="other">
              Other
            </option>

          </select>

        </div>


        {/* Description */}
        <div className="form-group">

          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            rows="5"
            placeholder="Describe what happened..."
          />

        </div>


        {/* Severity */}
        <div className="form-group">

          <label htmlFor="severity">
            Severity
          </label>

          <select id="severity">

            <option value="">
              Select severity
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

            <option value="critical">
              Critical
            </option>

          </select>

        </div>


        {/* Emergency */}
        <div className="emergency-option">

          <div>

            <h3>
              Immediate danger
            </h3>

            <p>
              Select this if you or someone else is currently in danger.
            </p>

          </div>

          <input
            type="checkbox"
            id="emergency"
          />

        </div>


        {/* Location */}
        <div className="location-box">

          <span className="location-icon">
            📍
          </span>

          <div>

            <h3>
              Location
            </h3>

            <p>
              Your current location will be attached to this report.
            </p>

          </div>

        </div>


        {/* Evidence */}
        <div className="form-group">

          <label htmlFor="evidence">
            Evidence <span>(optional)</span>
          </label>

          <input
            type="file"
            id="evidence"
            accept="image/*,video/*"
          />

          <small>
            You can attach photos or videos related to the incident.
          </small>

        </div>


        {/* Submit */}
        <button className="submit-report">
          Submit Incident
        </button>

      </div>

    </div>
  );
}

export default ReportIncident;