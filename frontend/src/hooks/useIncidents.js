import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage, incidentApi } from "../api/api.js";
import { subscribeToIncidentEvents } from "../api/socket.js";

const FETCHERS = {
  mine: () => incidentApi.getMine(),
  assigned: () => incidentApi.getAssigned(),
  all: () => incidentApi.getAll(),
};

export const INCIDENT_EVENTS = [
  "incident:status_updated",
  "incident:assigned",
  "incident:reassigned",
  "incident:escalated",
];

export function modeForRole(role) {
  if (role === "supervisor" || role === "admin") return "all";
  if (role === "responder") return "assigned";
  return "mine";
}

/**
 * Loads incidents for a mode and keeps them fresh from socket events.
 * Returns { incidents, setIncidents, loading, error, setError, refresh }.
 */
export function useIncidents(mode, { limit } = {}) {
  const [state, setState] = useState({ incidents: [], loading: true, error: "" });
  const [nonce, setNonce] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    FETCHERS[mode]()
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.incidents || [];
        setState({ incidents: limit ? list.slice(0, limit) : list, loading: false, error: "" });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ incidents: [], loading: false, error: errorMessage(err, "Failed to load incidents.") });
      });
    return () => {
      cancelled = true;
    };
  }, [mode, limit, nonce]);

  // Coalesce bursts of socket events into a single silent refetch.
  useEffect(() => {
    const schedule = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setNonce((n) => n + 1), 300);
    };
    const off = subscribeToIncidentEvents(Object.fromEntries(INCIDENT_EVENTS.map((e) => [e, schedule])));
    return () => {
      off();
      clearTimeout(timer.current);
    };
  }, []);

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setNonce((n) => n + 1);
  }, []);

  const setIncidents = useCallback((updater) => {
    setState((s) => ({ ...s, incidents: typeof updater === "function" ? updater(s.incidents) : updater }));
  }, []);

  const setError = useCallback((error) => setState((s) => ({ ...s, error })), []);

  return { ...state, setIncidents, setError, refresh };
}
