import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import BackendStatus from "./components/BackendStatus";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/useAuth.js";
import TouristDashboard from "./pages/TouristDashboard";
import ReportIncident from "./pages/ReportIncident";
import SOS from "./pages/SOS";
import MyIncidents from "./pages/MyIncidents";
import SafetyInfo from "./pages/SafetyInfo";
import Profile from "./pages/Profile";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Home() {
  const { user } = useAuth();

  if (user?.role === "supervisor" || user?.role === "admin") {
    return <AuthorityDashboard />;
  }
  if (user?.role === "responder") {
    return (
      <div>
        <MyIncidents />
      </div>
    );
  }
  return <TouristDashboard />;
}

function AppShell() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("yatrashield-theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);
    localStorage.setItem("yatrashield-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="app">
      <Header
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
      />
      <BackendStatus />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIncident />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sos"
            element={
              <ProtectedRoute>
                <SOS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <MyIncidents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/safety"
            element={
              <ProtectedRoute>
                <SafetyInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
