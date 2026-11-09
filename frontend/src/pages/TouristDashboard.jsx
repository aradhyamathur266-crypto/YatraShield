import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { Empty, ListSkeleton, PageHead, PriorityChip, Skeleton, StatusChip } from "../components/ui.jsx";
import { useAuth } from "../context/useAuth.js";
import { locationLabel, useGeolocation } from "../hooks/useGeolocation.js";
import { useIncidents } from "../hooks/useIncidents.js";
import { distanceMeters, incidentLatLng } from "../utils/geo.js";
import { categoryLabel, formatCoordinates, isResolved, priorityTone, shortId, timeAgo } from "../utils/incidents.js";

const MapView = lazy(() => import("../components/MapView.jsx"));

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function useReverseGeocode(position) {
  const [place, setPlace] = useState({ name: "", failed: false });
  const lastLookup = useRef(null);

  useEffect(() => {
    if (!position) return undefined;
    // Nominatim asks for ≤1 request/second; only look up after a real move.
    if (lastLookup.current && distanceMeters(lastLookup.current, position) < 60) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const [lat, lng] = position;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("geocode failed");
        const data = await res.json();
        const a = data.address || {};
        const area = a.neighbourhood || a.suburb || a.quarter || a.residential || a.village || a.town || a.city || a.county;
        const name = [a.road, area, a.city || a.town || a.village]
          .filter(Boolean)
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .join(", ");
        lastLookup.current = position;
        setPlace({ name: name || data.display_name || "", failed: false });
      } catch (e) {
        if (e.name !== "AbortError") setPlace((p) => ({ ...p, failed: true }));
      }
    }, 900);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [position]);

  return place;
}

export default function TouristDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const geo = useGeolocation({ watch: true });
  const place = useReverseGeocode(geo.position);
  const { incidents, loading } = useIncidents("mine", { limit: 4 });

  const activeCount = incidents.filter((i) => !isResolved(i.status)).length;
  const firstName = (user?.name || "there").split(" ")[0];

  const markers = useMemo(() => {
    const list = [];
    incidents.forEach((inc) => {
      const position = incidentLatLng(inc);
      if (position && !isResolved(inc.status)) {
        list.push({
          id: inc._id,
          position,
          tone: priorityTone(inc.priority),
          kind: "incident",
          pulse: priorityTone(inc.priority) === "critical",
          label: `${shortId(inc)} ${categoryLabel(inc.category)}`,
        });
      }
    });
    if (geo.position) list.push({ id: "you", position: geo.position, kind: "you", tone: "you", label: "You are here" });
    return list;
  }, [incidents, geo.position]);

  return (
    <div className="page">
      <PageHead
        eyebrow="Overview"
        title={<>{greeting()}, <em>{firstName}.</em></>}
        actions={
          <span className="status-pill" data-state={geo.status}>
            <i className="live-dot" /> {locationLabel(geo.status)}
          </span>
        }
      >
        Report, track and get live updates — anchored to where you are right now.
      </PageHead>

      <div className="actions">
        <Link to="/report" className="action">
          <span className="action-no">01</span>
          <span className="action-title">Report an incident</span>
          <span className="action-desc">A structured report in about 30 seconds.</span>
          <Icon name="arrowUpRight" size={20} className="action-arrow" />
        </Link>
        <Link to="/sos" className="action is-sos">
          <span className="action-no">02</span>
          <span className="action-title">Emergency SOS</span>
          <span className="action-desc">Critical priority with your live location.</span>
          <Icon name="arrowUpRight" size={20} className="action-arrow" />
        </Link>
        <Link to="/incidents" className="action">
          <span className="action-no">03</span>
          <span className="action-title">My incidents</span>
          <span className="action-desc">{loading ? "Checking…" : `${activeCount} active right now`}</span>
          <Icon name="arrowUpRight" size={20} className="action-arrow" />
        </Link>
      </div>

      <section className="card map-card" aria-labelledby="live-map-h">
        <div className="card-head">
          <div>
            <h2 id="live-map-h" className="card-title">Live map</h2>
            <p className="card-sub">Your position and open reports. Updates as you move.</p>
          </div>
        </div>
        <div className="map-stage">
          <Suspense fallback={<Skeleton height="100%" style={{ position: "absolute", inset: 0 }} />}>
            <MapView
              className="map-fill"
              markers={markers}
              center={geo.position}
              zoom={16}
              label="Live safety map"
              onMarkerClick={(id) => id !== "you" && navigate(`/incidents/${id}`)}
            />
          </Suspense>
          <div className="map-note">
            <Icon name="crosshair" size={16} />
            <div>
              <strong>
                {place.name || (geo.status === "ready" ? (place.failed ? "Address unavailable" : "Resolving address…") : locationLabel(geo.status))}
              </strong>
              {geo.position && <span className="mono">{geo.position[0].toFixed(5)}, {geo.position[1].toFixed(5)}</span>}
            </div>
            {(geo.status === "denied" || geo.status === "error") && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={geo.retry}>Retry</button>
            )}
          </div>
        </div>
      </section>

      <section className="card" aria-labelledby="recent-h">
        <div className="card-head">
          <div>
            <h2 id="recent-h" className="card-title">Recent incidents</h2>
            <p className="card-sub">Status changes appear here the moment they happen.</p>
          </div>
          <Link to="/incidents" className="btn btn-sm btn-ghost">View all <Icon name="arrowRight" size={14} /></Link>
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : incidents.length === 0 ? (
          <Empty
            icon="ledger"
            title="Nothing reported yet"
            action={<Link to="/report" className="btn btn-primary"><Icon name="plus" size={16} /> Report an incident</Link>}
          >
            Your reports and their live status will appear here.
          </Empty>
        ) : (
          <div className="table-scroll">
            <table className="ledger">
              <thead>
                <tr><th>Incident</th><th>Location</th><th>Priority</th><th>Status</th></tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc._id} className="is-link" onClick={() => navigate(`/incidents/${inc._id}`)}>
                    <td data-label="Incident" className="cell-main">
                      <span className="mono id">{shortId(inc)}</span>
                      <Link to={`/incidents/${inc._id}`} className="cell-title" onClick={(e) => e.stopPropagation()}>
                        {categoryLabel(inc.category)}
                      </Link>
                      <span className="cell-sub">{timeAgo(inc)}</span>
                    </td>
                    <td data-label="Location" className="mono cell-muted">{formatCoordinates(inc)}</td>
                    <td data-label="Priority"><PriorityChip priority={inc.priority} /></td>
                    <td data-label="Status"><StatusChip status={inc.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
