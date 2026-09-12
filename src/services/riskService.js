/**
 * Haversine distance calculator between two geographic coordinates in kilometers.
 */
export function calculateHaversineDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if an incident is near any point on the route polyline within safety radius.
 */
export function isIncidentNearRoute(routePath, incident, radiusKm = 0.5) {
  if (!routePath || routePath.length === 0) return false;
  if (incident.status === 'Resolved') return false;
  const radius = incident.radius ? incident.radius : radiusKm;
  return routePath.some((p) => calculateHaversineDistance(incident.coords, p) <= radius);
}

/**
 * Evaluates whether a road segment is blocked by a critical landslide or closure.
 */
export function isSegmentBlocked(p1, p2, incidents) {
  return incidents.some((inc) => {
    if (inc.status !== 'Active') return false;
    const isHardBlock = 
      inc.roadImpact === 'blocked' ||
      inc.type === 'Landslide' ||
      inc.type === 'Road Closure' ||
      inc.type === 'Bridge Closure';

    if (!isHardBlock) return false;

    const radius = inc.radius || 0.6;
    const d1 = calculateHaversineDistance(inc.coords, p1);
    const d2 = calculateHaversineDistance(inc.coords, p2);
    const mid = { lat: (p1.lat + p2.lat) / 2, lng: (p1.lng + p2.lng) / 2 };
    const dMid = calculateHaversineDistance(inc.coords, mid);

    return d1 <= radius || d2 <= radius || dMid <= radius;
  });
}

/**
 * Assesses overall disaster risk and calculates numeric penalty score.
 */
export function assessDisasterImpact(routePath, activeIncidents) {
  const nearby = activeIncidents.filter((inc) => isIncidentNearRoute(routePath, inc, 0.8));

  let isBlocked = false;
  let blockageReason = '';
  let maxImpact = 'clear';
  let totalPenalty = 0;

  for (const inc of nearby) {
    const isHardBlock = 
      inc.roadImpact === 'blocked' ||
      ((inc.type === 'Landslide' || inc.type === 'Road Closure' || inc.type === 'Bridge Closure') &&
        (inc.severity === 'High' || inc.severity === 'Critical'));

    if (isHardBlock) {
      isBlocked = true;
      maxImpact = 'blocked';
      blockageReason = `${inc.type} at ${inc.locationName}`;
      totalPenalty += 100;
    } else if (inc.severity === 'High' || inc.type === 'Heavy Rain') {
      if (maxImpact !== 'blocked') maxImpact = 'delayed';
      totalPenalty += 35;
    } else {
      if (maxImpact === 'clear') maxImpact = 'caution';
      totalPenalty += 15;
    }
  }

  return {
    disasterPenalty: Math.min(100, totalPenalty),
    isBlocked,
    blockageReason,
    nearbyIncidents: nearby,
    impactType: maxImpact
  };
}
