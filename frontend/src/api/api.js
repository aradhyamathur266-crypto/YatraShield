import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, "") || API_BASE_URL;

const TOKEN_KEY = "yatrashield-token";
const USER_KEY = "yatrashield-user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request transparently.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralized 401 handling: clear stale auth and let React Router redirect via AuthContext re-render.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error, fallback = "Something went wrong. Please try again.") {
  const status = error?.response?.status;
  const data = error?.response?.data;

  // No-DB dev mode: backend is up, Mongo isn't configured yet.
  if (status === 503 && data?.code === "DB_NOT_CONNECTED") {
    return "Database not connected — MongoDB setup is needed for this feature (see backend/.env MONGO_URI). The app shell is running.";
  }
  // Backend unreachable.
  if (!error?.response) {
    return "Could not reach the YatraShield backend. Is it running on port 5000?";
  }
  return data?.message || error?.message || fallback;
}

export async function checkHealth() {
  try {
    const res = await api.get("/api/health");
    return res.data || { status: "unknown" };
  } catch {
    return null;
  }
}

// ---------- Auth endpoints ----------
export const authApi = {
  register: (payload) => api.post("/api/auth/register", payload),
  login: (payload) => api.post("/api/auth/login", payload),
};

// ---------- User endpoints ----------
export const userApi = {
  getProfile: () => api.get("/api/user/profile"),
  listResponders: () => api.get("/api/user/responders"),
};

// ---------- Incident endpoints ----------
// NOTE: backend computes `priority` server-side; frontend sends only category/description/location.
export const incidentApi = {
  create: (payload) => api.post("/api/incidents", payload),
  getMine: () => api.get("/api/incidents"),
  getAssigned: () => api.get("/api/incidents/assigned"),
  getAll: () => api.get("/api/incidents/all"),
  getById: (id) => api.get(`/api/incidents/${id}`),
  updateStatus: (id, status) => api.patch(`/api/incidents/${id}/status`, { status }),
  assign: (id, responderId) => api.patch(`/api/incidents/${id}/assign`, { responderId }),
};

export default api;
