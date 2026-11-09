import { useEffect, useRef, useState } from "react";
import { AttributionControl, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "../utils/theme.js";
import { GURUGRAM } from "../utils/geo.js";
import { Icon } from "./Icon.jsx";

// MapLibre 6 can't locate its worker once bundled; hand it the Vite-built one.
setWorkerUrl(workerUrl);

// Vector basemaps: GPU-rendered, crisp at any zoom, and theme-matched.
const STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

let webglChecked = null;
function hasWebGL() {
  if (webglChecked === null) {
    try {
      const canvas = document.createElement("canvas");
      webglChecked = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglChecked = false;
    }
  }
  return webglChecked;
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const toLngLat = ([lat, lng]) => [lng, lat];

function buildPin(marker, clickable) {
  const el = document.createElement(clickable ? "button" : "div");
  if (clickable) el.type = "button";
  el.className = "pin";
  el.innerHTML = '<span class="pin-ring"></span><span class="pin-dot"></span>';
  syncPin(el, marker);
  return el;
}

function syncPin(el, marker) {
  el.dataset.tone = marker.tone || "neutral";
  el.dataset.kind = marker.kind || "incident";
  if (marker.pulse) el.dataset.pulse = "true";
  else delete el.dataset.pulse;
  if (marker.label) el.setAttribute("aria-label", marker.label);
}

/**
 * MapLibre GL map.
 * - markers: [{ id, position: [lat, lng], tone, kind, label, pulse }]
 * - center:  live position to follow (detaches as soon as the user pans)
 * - fit:     frame every marker when the marker set changes
 */
export default function MapView({
  markers = [],
  center = null,
  initialCenter = GURUGRAM,
  zoom = 15,
  interactive = true,
  cooperative = true,
  fit = false,
  onMarkerClick,
  className = "",
  label = "Map",
}) {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pinsRef = useRef(new Map());
  const clickRef = useRef(onMarkerClick);
  const styleThemeRef = useRef(theme);
  const followedRef = useRef(false);
  const detachedRef = useRef(false);
  const [detached, setDetached] = useState(false);
  const [supported] = useState(hasWebGL);
  const [init] = useState(() => ({ initialCenter, zoom, interactive, cooperative, theme }));

  useEffect(() => {
    clickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // Create / destroy the map once.
  useEffect(() => {
    if (!supported || !containerRef.current) return undefined;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLES[init.theme],
      center: toLngLat(init.initialCenter),
      zoom: init.zoom,
      minZoom: 3,
      maxZoom: 19,
      attributionControl: false,
      interactive: init.interactive,
      cooperativeGestures: init.interactive && init.cooperative,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      fadeDuration: 120,
    });
    map.touchZoomRotate.disableRotation();
    if (init.interactive) {
      map.addControl(new AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    }

    const detach = (e) => {
      // originalEvent is only present for user-driven gestures.
      if (e.originalEvent && !detachedRef.current) {
        detachedRef.current = true;
        setDetached(true);
      }
    };
    map.on("dragstart", detach);
    map.on("zoomstart", detach);

    mapRef.current = map;
    const pins = pinsRef.current;
    return () => {
      pins.forEach((m) => m.remove());
      pins.clear();
      map.remove();
      mapRef.current = null;
      followedRef.current = false;
    };
  }, [supported, init]);

  // Swap basemap when the theme changes (HTML markers survive a style swap).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || styleThemeRef.current === theme) return;
    styleThemeRef.current = theme;
    map.setStyle(STYLES[theme], { diff: false });
  }, [theme]);

  // Reconcile markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pins = pinsRef.current;
    const next = new Set(markers.map((m) => m.id));

    pins.forEach((pin, id) => {
      if (!next.has(id)) {
        pin.remove();
        pins.delete(id);
      }
    });

    markers.forEach((m) => {
      const existing = pins.get(m.id);
      if (existing) {
        existing.setLngLat(toLngLat(m.position));
        syncPin(existing.getElement(), m);
        return;
      }
      const clickable = typeof clickRef.current === "function" && m.kind !== "you";
      const el = buildPin(m, clickable);
      if (clickable) el.addEventListener("click", () => clickRef.current?.(m.id));
      const pin = new Marker({ element: el, anchor: "center" }).setLngLat(toLngLat(m.position)).addTo(map);
      pins.set(m.id, pin);
    });
  }, [markers]);

  // Frame all markers when requested.
  const fitKey = fit ? markers.map((m) => `${m.id}:${m.position[0]},${m.position[1]}`).join("|") : "";
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fit || markers.length === 0) return;
    if (markers.length === 1) {
      map.easeTo({ center: toLngLat(markers[0].position), zoom: Math.max(map.getZoom(), 14), duration: prefersReducedMotion() ? 0 : 700 });
      return;
    }
    const lngs = markers.map((m) => m.position[1]);
    const lats = markers.map((m) => m.position[0]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 64, maxZoom: 16, duration: prefersReducedMotion() ? 0 : 800 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  // Follow a live position until the user takes control.
  const lat = center?.[0];
  const lng = center?.[1];
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat == null || lng == null || detached) return;
    const target = [lng, lat];
    const reduced = prefersReducedMotion();
    if (!followedRef.current) {
      followedRef.current = true;
      map.flyTo({ center: target, zoom: Math.max(init.zoom, 15), duration: reduced ? 0 : 1400, essential: true });
    } else {
      map.easeTo({ center: target, duration: reduced ? 0 : 700, essential: true });
    }
  }, [lat, lng, detached, init.zoom]);

  function recenter() {
    detachedRef.current = false;
    setDetached(false);
  }

  if (!supported) {
    return (
      <div className={`map-fallback ${className}`} role="img" aria-label={label}>
        <Icon name="pin" size={22} />
        <p>This browser can’t render the interactive map. Coordinates are still shown alongside.</p>
      </div>
    );
  }

  return (
    <div className={`map ${className}`} role="region" aria-label={label}>
      <div ref={containerRef} className="map-canvas" />
      {!init.interactive && (
        <span className="map-attrib">
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
          {" · "}
          <a href="https://carto.com/about-carto/" target="_blank" rel="noreferrer">© CARTO</a>
        </span>
      )}
      {detached && center && (
        <button type="button" className="map-recenter" onClick={recenter}>
          <Icon name="crosshair" size={15} /> Recenter
        </button>
      )}
    </div>
  );
}
