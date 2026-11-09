import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/useAuth.js";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TouristDashboard from "./pages/TouristDashboard";
import ReportIncident from "./pages/ReportIncident";
import SOS from "./pages/SOS";
import MyIncidents from "./pages/MyIncidents";
import IncidentDetail from "./pages/IncidentDetail";
import SafetyInfo from "./pages/SafetyInfo";
import Profile from "./pages/Profile";
import AuthorityDashboard from "./pages/AuthorityDashboard";

function Home() {
  const { user } = useAuth();
  if (user?.role === "supervisor" || user?.role === "admin") return <AuthorityDashboard />;
  if (user?.role === "responder") return <MyIncidents />;
  return <TouristDashboard />;
}

function Root() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <Landing />;
}

function AppShellWithTheme() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("yatrashield-theme") === "dark");
  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);
    localStorage.setItem("yatrashield-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  return <AppShell darkMode={darkMode} onToggleTheme={() => setDarkMode((v) => !v)} />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — app shell */}
          <Route element={<ProtectedRoute><AppShellWithTheme /></ProtectedRoute>}>
            <Route path="/app" element={<Home />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/incidents" element={<MyIncidents />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/safety" element={<SafetyInfo />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
