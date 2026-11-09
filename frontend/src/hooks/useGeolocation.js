import { useCallback, useEffect, useState } from "react";
import { distanceMeters } from "../utils/geo.js";

/**
 * status: "pending" | "ready" | "denied" | "unavailable" | "error"
 * position: [lat, lng] | null
 *
 * With `watch`, jitter below `minMoveMeters` is ignored so a stationary user
 * doesn't re-render the map and re-trigger reverse geocoding.
 */
export function useGeolocation({ watch = false, minMoveMeters = 8 } = {}) {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(() => ({
    position: null,
    accuracy: null,
    status: supported ? "pending" : "unavailable",
  }));

  useEffect(() => {
    if (!supported) return undefined;

    const onOk = (pos) => {
      const next = [pos.coords.latitude, pos.coords.longitude];
      setState((prev) => {
        if (prev.status === "ready" && prev.position && distanceMeters(prev.position, next) < minMoveMeters) {
          return prev;
        }
        return { position: next, accuracy: pos.coords.accuracy, status: "ready" };
      });
    };
    const onErr = (err) => {
      setState((prev) => ({
        ...prev,
        status: err.code === err.PERMISSION_DENIED ? "denied" : prev.position ? prev.status : "error",
      }));
    };

    if (watch) {
      const id = navigator.geolocation.watchPosition(onOk, onErr, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      });
      return () => navigator.geolocation.clearWatch(id);
    }
    navigator.geolocation.getCurrentPosition(onOk, onErr, { enableHighAccuracy: true, timeout: 12000 });
    return undefined;
  }, [supported, watch, minMoveMeters, attempt]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, status: "pending" }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}

export function locationLabel(status) {
  switch (status) {
    case "ready":
      return "Location locked";
    case "denied":
      return "Location permission denied";
    case "unavailable":
      return "GPS not supported on this device";
    case "error":
      return "Couldn’t read your location";
    default:
      return "Finding your location…";
  }
}
