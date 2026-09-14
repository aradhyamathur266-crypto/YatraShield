import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import TouristDashboard from "./pages/TouristDashboard";
import ReportIncident from "./pages/ReportIncident";
import SOS from "./pages/SOS";
import MyIncidents from "./pages/MyIncidents";
import SafetyInfo from "./pages/SafetyInfo";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        <Sidebar />

        <main className="main-content">

          <Header />

          <Routes>

            <Route
              path="/"
              element={<TouristDashboard />}
            />

            <Route
              path="/report"
              element={<ReportIncident />}
            />

            <Route
              path="/sos"
              element={<SOS />}
            />

            <Route
              path="/incidents"
              element={<MyIncidents />}
            />

            <Route
              path="/safety"
              element={<SafetyInfo />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  );
}

export default App;