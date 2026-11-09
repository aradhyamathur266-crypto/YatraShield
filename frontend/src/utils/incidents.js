// Mapping between backend enums and frontend display labels.
export const CATEGORY_LABELS = {
  medical: "Medical Emergency",
  accident: "Accident",
  crime: "Crime / Theft",
  lost_person: "Lost / Missing",
  fire: "Fire",
  harassment: "Harassment",
  natural_disaster: "Natural Disaster",
  other: "Other",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);

export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS = {
  REPORTED: "Reported",
  TRIAGED: "Under Review",
  ASSIGNED: "Assigned",
  ACKNOWLEDGED: "Acknowledged",
  EN_ROUTE: "En Route",
  ON_SITE: "On Scene",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  ESCALATED: "Escalated",
};

export const STATUSES = Object.keys(STATUS_LABELS);

// Allowed next statuses mirroring backend `transitions` map.
export const NEXT_STATUSES = {
  REPORTED: ["TRIAGED", "ESCALATED"],
  TRIAGED: ["ASSIGNED", "ESCALATED"],
  ASSIGNED: ["ACKNOWLEDGED", "ESCALATED"],
  ACKNOWLEDGED: ["EN_ROUTE", "ESCALATED"],
  EN_ROUTE: ["ON_SITE", "ESCALATED"],
  ON_SITE: ["RESOLVED", "ESCALATED"],
  RESOLVED: ["CLOSED"],
  ESCALATED: ["TRIAGED", "ASSIGNED"],
  CLOSED: [],
};

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category || "Safety incident";
}

export function priorityLabel(priority) {
  return PRIORITY_LABELS[(priority || "").toLowerCase()] || priority || "Medium";
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || "Reported";
}

export function shortId(incident) {
  if (!incident) return "";
  if (incident.displayId) return incident.displayId;
  const raw = incident._id || incident.id || "";
  return raw ? `YS-${String(raw).slice(-6).toUpperCase()}` : "";
}

export function formatCoordinates(incident) {
  const coords = incident?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }
  if (incident?.location && typeof incident.location === "string") return incident.location;
  return "Location not recorded";
}

export function formatTime(incident) {
  const value = incident?.createdAt || incident?.updatedAt;
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function responderName(incident) {
  const responder = incident?.assignedResponder;
  if (!responder) return "Unassigned";
  if (typeof responder === "string") return responder;
  return responder.name || "Unassigned";
}

export function reportedByName(incident) {
  const reporter = incident?.reportedBy;
  if (!reporter) return "—";
  if (typeof reporter === "string") return reporter;
  return reporter.name || reporter.email || "—";
}

export function isResolved(status) {
  return status === "RESOLVED" || status === "CLOSED";
}

const STATUS_TONES = {
  REPORTED: "neutral",
  TRIAGED: "info",
  ASSIGNED: "info",
  ACKNOWLEDGED: "warn",
  EN_ROUTE: "warn",
  ON_SITE: "hot",
  RESOLVED: "ok",
  CLOSED: "neutral",
  ESCALATED: "critical",
};

export function statusTone(status) {
  return STATUS_TONES[status] || "neutral";
}

export function priorityTone(priority) {
  const p = (priority || "medium").toLowerCase();
  return ["critical", "high", "medium", "low"].includes(p) ? p : "medium";
}

/** "3 min ago", "2 h ago", or a short date for anything older than a week. */
export function timeAgo(incident) {
  const value = incident?.createdAt || incident?.updatedAt;
  const t = value ? new Date(value).getTime() : NaN;
  if (Number.isNaN(t)) return "Recently";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(t).toLocaleDateString([], { day: "numeric", month: "short" });
}
