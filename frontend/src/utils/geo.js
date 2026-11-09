/** Great-circle distance in metres between two [lat, lng] pairs. */
export function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const GURUGRAM = [28.4595, 77.0266];

/** Incident GeoJSON ([lng, lat]) -> [lat, lng], or null. */
export function incidentLatLng(incident) {
  const c = incident?.location?.coordinates;
  if (Array.isArray(c) && c.length === 2 && c.every((n) => Number.isFinite(Number(n)))) {
    return [Number(c[1]), Number(c[0])];
  }
  return null;
}
