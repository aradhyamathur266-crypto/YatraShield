import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

/**
 * Wraps routes that require authentication, and optionally restricts by role.
 * @param {string[]} [allowedRoles] - e.g. ["responder"] or ["supervisor", "admin"]
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
