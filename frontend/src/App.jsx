import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/useAuth.js";
import { startSmoothScroll } from "./utils/smooth-scroll.js";

// Route-level code splitting keeps the first paint small; the map bundle
// only loads on pages that actually render one.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const TouristDashboard = lazy(() => import("./pages/TouristDashboard"));
const ReportIncident = lazy(() => import("./pages/ReportIncident"));
const SOS = lazy(() => import("./pages/SOS"));
const MyIncidents = lazy(() => import("./pages/MyIncidents"));
const IncidentDetail = lazy(() => import("./pages/IncidentDetail"));
const SafetyInfo = lazy(() => import("./pages/SafetyInfo"));
const Profile = lazy(() => import("./pages/Profile"));
const AuthorityDashboard = lazy(() => import("./pages/AuthorityDashboard"));

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

function App() {
  useEffect(() => startSmoothScroll(), []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="boot" aria-busy="true" />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected — app shell */}
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
