import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import TouristDashboard from "./pages/TouristDashboard";
import ReportIncident from "./pages/ReportIncident";
import SOS from "./pages/SOS";
import MyIncidents from "./pages/MyIncidents";
import SafetyInfo from "./pages/SafetyInfo";
import Profile from "./pages/Profile";

const initialIncidents = [
  {
    id: "YS-1042",
    type: "Medical Emergency",
    location: "Cyber Hub, Gurugram",
    priority: "Critical",
    status: "On Scene",
    responder: "R. Sharma",
    description:
      "A tourist has reported a medical emergency and requires immediate assistance.",
    time: "10:42 AM",
  },
  {
    id: "YS-1041",
    type: "Lost Tourist",
    location: "MG Road, Gurugram",
    priority: "High",
    status: "Assigned",
    responder: "A. Verma",
    description:
      "A tourist requires assistance locating their travel group.",
    time: "10:28 AM",
  },
  {
    id: "YS-1040",
    type: "Suspicious Activity",
    location: "Leisure Valley Park",
    priority: "Medium",
    status: "Under Review",
    responder: "Unassigned",
    description:
      "A visitor has reported suspicious activity near a public walking area.",
    time: "10:15 AM",
  },
  {
    id: "YS-1039",
    type: "Transport Assistance",
    location: "IFFCO Chowk",
    priority: "Low",
    status: "Resolved",
    responder: "P. Singh",
    description:
      "A tourist requested help finding local transportation.",
    time: "09:50 AM",
  },
];

const responders = [
  { name: "R. Sharma", status: "On Scene" },
  { name: "A. Verma", status: "Available" },
  { name: "P. Singh", status: "Busy" },
];

const incidentStatuses = [
  "Reported",
  "Under Review",
  "Assigned",
  "On Scene",
  "Resolved",
];

function AuthorityDashboard({ incidents, onUpdateIncident }) {
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [message, setMessage] = useState("");

  // Load saved responders from localStorage.
  const [teamResponders, setTeamResponders] = useState(() => {
    const savedResponders = localStorage.getItem("yatrashield-responders");

    return savedResponders ? JSON.parse(savedResponders) : responders;
  });

  const [newResponderName, setNewResponderName] = useState("");
  const [showAddResponder, setShowAddResponder] = useState(false);

  // Save responders whenever the team changes.
  useEffect(() => {
    localStorage.setItem(
      "yatrashield-responders",
      JSON.stringify(teamResponders)
    );
  }, [teamResponders]);

  function handleAddResponder(event) {
    event.preventDefault();

    const name = newResponderName.trim();

    if (!name) return;

    const alreadyExists = teamResponders.some(
      (responder) => responder.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      setMessage("This responder is already in the team.");
      return;
    }

    setTeamResponders((previousResponders) => [
      ...previousResponders,
      { name, status: "Available" },
    ]);

    setNewResponderName("");
    setShowAddResponder(false);
    setMessage(`${name} added to the demo responder team.`);
  }

  const filteredIncidents = incidents.filter((incident) => {
    const matchesPriority =
      priorityFilter === "All" || incident.priority === priorityFilter;

    const matchesStatus =
      statusFilter === "All" || incident.status === statusFilter;

    return matchesPriority && matchesStatus;
  });

  const activeCount = incidents.filter(
    (incident) => incident.status !== "Resolved"
  ).length;

  const criticalCount = incidents.filter(
    (incident) =>
      incident.priority === "Critical" && incident.status !== "Resolved"
  ).length;

  const unassignedCount = incidents.filter(
    (incident) =>
      incident.responder === "Unassigned" &&
      incident.status !== "Resolved"
  ).length;

  const resolvedCount = incidents.filter(
    (incident) => incident.status === "Resolved"
  ).length;

  const selectedIncident = incidents.find(
    (incident) => incident.id === selectedIncidentId
  );

  function updateIncident(id, field, value) {
    onUpdateIncident(id, field, value);

    const labels = {
      responder: "Responder assignment",
      status: "Incident status",
    };

    setMessage(`${labels[field]} updated for ${id}.`);
  }

  return (
    <div className="authority-dashboard">
      <div className="authority-heading">
        <div>
          <p className="section-label">AUTHORITY CONTROL CENTER</p>
          <h1>Incident Management</h1>
          <p className="authority-subtitle">
            Review incidents, coordinate responders, and track progress.
          </p>
        </div>

        <span className="authority-demo-label">
          <span className="demo-dot" />
          Demo mode
        </span>
      </div>

      <div className="authority-stats-grid">
        <div className="authority-stat-card">
          <div className="authority-stat-top">Active Incidents</div>
          <h2>{activeCount}</h2>
          <p>Awaiting closure</p>
        </div>

        <div className="authority-stat-card">
          <div className="authority-stat-top">Critical Incidents</div>
          <h2>{criticalCount}</h2>
          <p>Require immediate attention</p>
        </div>

        <div className="authority-stat-card">
          <div className="authority-stat-top">Unassigned</div>
          <h2>{unassignedCount}</h2>
          <p>Need a responder</p>
        </div>

        <div className="authority-stat-card">
          <div className="authority-stat-top">Resolved</div>
          <h2>{resolvedCount}</h2>
          <p>Closed demo records</p>
        </div>
      </div>

      <section className="authority-panel">
        <div className="authority-panel-heading">
          <div>
            <h2>Incident Queue</h2>
            <p>View incidents and manage their demo status.</p>
          </div>

          <div className="authority-filters">
            <select
              className="authority-filter"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              className="authority-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              {incidentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && (
          <div className="authority-feedback" role="status">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")}>
              Dismiss
            </button>
          </div>
        )}

        <div className="authority-table-wrap">
          <table className="authority-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Responder</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <strong>{incident.id}</strong>
                    <span className="table-secondary">{incident.type}</span>
                  </td>

                  <td>{incident.location}</td>

                  <td>
                    <span
                      className={`priority-badge priority-${incident.priority.toLowerCase()}`}
                    >
                      {incident.priority}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${incident.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {incident.status}
                    </span>
                  </td>

                  <td>
                    <select
                      className="table-select"
                      aria-label={`Assign responder to ${incident.id}`}
                      value={incident.responder}
                      disabled={incident.status === "Resolved"}
                      onChange={(event) =>
                        updateIncident(
                          incident.id,
                          "responder",
                          event.target.value
                        )
                      }
                    >
                      <option value="Unassigned">Unassigned</option>

                      {teamResponders.map((responder) => (
                        <option key={responder.name} value={responder.name}>
                          {responder.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <div className="authority-row-actions">
                      <button
                        type="button"
                        className="table-action-button"
                        onClick={() =>
                          setSelectedIncidentId(
                            selectedIncidentId === incident.id
                              ? null
                              : incident.id
                          )
                        }
                      >
                        {selectedIncidentId === incident.id
                          ? "Hide"
                          : "Details"}
                      </button>

                      <select
                        className="table-select status-select"
                        aria-label={`Update status for ${incident.id}`}
                        value={incident.status}
                        onChange={(event) =>
                          updateIncident(
                            incident.id,
                            "status",
                            event.target.value
                          )
                        }
                      >
                        {incidentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan="6" className="authority-no-results">
                    No incidents match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="authority-table-note">
          These are demo records. Changes are local and are not sent to the backend.
        </p>
      </section>

      {selectedIncident && (
        <section className="authority-panel incident-detail-panel">
          <div className="authority-panel-heading">
            <div>
              <p className="section-label">INCIDENT DETAILS</p>
              <h2>
                {selectedIncident.id} — {selectedIncident.type}
              </h2>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setSelectedIncidentId(null)}
            >
              Close
            </button>
          </div>

          <div className="incident-detail-grid">
            <div>
              <span>Reported time</span>
              <strong>{selectedIncident.time}</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>{selectedIncident.location}</strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>{selectedIncident.priority}</strong>
            </div>

            <div>
              <span>Current status</span>
              <strong>{selectedIncident.status}</strong>
            </div>

            <div>
              <span>Assigned responder</span>
              <strong>{selectedIncident.responder}</strong>
            </div>

            <div className="incident-description">
              <span>Description</span>
              <p>{selectedIncident.description}</p>
            </div>
          </div>
        </section>
      )}

      <section className="authority-panel">
        <div className="authority-panel-heading">
          <div>
            <h2>Responder Status</h2>
            <p>Example response team availability</p>
          </div>

          <div className="responder-heading-actions">
            <span className="responder-count">{teamResponders.length}</span>

            <button
              type="button"
              className="add-responder-button"
              onClick={() => setShowAddResponder((previous) => !previous)}
            >
              {showAddResponder ? "Cancel" : "+ Add responder"}
            </button>
          </div>
        </div>

        {showAddResponder && (
          <form className="add-responder-form" onSubmit={handleAddResponder}>
            <input
              type="text"
              value={newResponderName}
              onChange={(event) => setNewResponderName(event.target.value)}
              placeholder="Enter responder name"
              aria-label="New responder name"
              required
            />

            <button type="submit" className="add-responder-submit">
              Add to team
            </button>
          </form>
        )}

        <div className="responder-list">
          {teamResponders.map((responder) => {
            const assignedCount = incidents.filter(
              (incident) =>
                incident.responder === responder.name &&
                incident.status !== "Resolved"
            ).length;

            return (
              <div className="responder-row" key={responder.name}>
                <div className="responder-avatar">
                  {responder.name.charAt(0)}
                </div>

                <div className="responder-details">
                  <strong>{responder.name}</strong>
                  <span>Field Responder</span>
                </div>

                <div className="responder-workload">
                  <span>{assignedCount} active</span>
                  <span
                    className={`responder-${responder.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {responder.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("yatrashield-theme") === "dark"
  );

  const [dashboardType, setDashboardType] = useState(
    () => localStorage.getItem("yatrashield-dashboard") || "tourist"
  );

  const [incidents, setIncidents] = useState(initialIncidents);

  function handleSubmitIncident(newIncident) {
    const touristIncident = {
      ...newIncident,
      reportedBy: "tourist",
    };

    setIncidents((previousIncidents) => [
      touristIncident,
      ...previousIncidents,
    ]);
  }

  function handleUpdateIncident(id, field, value) {
    setIncidents((previousIncidents) =>
      previousIncidents.map((incident) =>
        incident.id === id
          ? { ...incident, [field]: value }
          : incident
      )
    );
  }

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);
    localStorage.setItem("yatrashield-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("yatrashield-dashboard", dashboardType);
  }, [dashboardType]);

  return (
    <BrowserRouter>
      <div className="app">
        <Header
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((previous) => !previous)}
          dashboardType={dashboardType}
          onDashboardChange={setDashboardType}
        />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                dashboardType === "tourist" ? (
                  <TouristDashboard />
                ) : (
                  <AuthorityDashboard
                    incidents={incidents}
                    onUpdateIncident={handleUpdateIncident}
                  />
                )
              }
            />

            <Route
              path="/report"
              element={
                <ReportIncident onSubmitIncident={handleSubmitIncident} />
              }
            />

            <Route path="/sos" element={<SOS />} />

            <Route
              path="/incidents"
              element={
                <MyIncidents
                  incidents={incidents}
                  dashboardType={dashboardType}
                />
              }
            />

            <Route path="/safety" element={<SafetyInfo />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;