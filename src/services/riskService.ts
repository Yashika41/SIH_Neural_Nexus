import { LatLng, Incident } from '../types';
import { calculateHaversineDistance } from './aiServices';

export interface RiskAssessment {
  disasterPenalty: number;
  isBlocked: boolean;
  blockageReason?: string;
  nearbyIncidents: Incident[];
  impactType: 'blocked' | 'delayed' | 'caution' | 'clear';
}

/**
 * Checks if a specific incident is within safety radius of any point on the route geometry.
 */
export function isIncidentNearRoute(routePath: LatLng[], inc: Incident, radiusKm = 0.5): boolean {
  if (!routePath || routePath.length === 0) return false;
  if (inc.status === 'Resolved') return false;
  const radius = inc.radius ? inc.radius : radiusKm;
  return routePath.some((p) => calculateHaversineDistance(inc.coords, p) <= radius);
}

/**
 * Finds incidents that are located within proximity of any point on the route polyline.
 */
export function getNearbyIncidents(routePath: LatLng[], incidents: Incident[], maxDistanceKm = 0.8): Incident[] {
  if (!routePath || routePath.length === 0) return [];
  return incidents.filter((inc) => isIncidentNearRoute(routePath, inc, maxDistanceKm));
}

/**
 * Evaluates whether a road segment between two points is blocked by an active incident.
 */
export function isSegmentBlocked(p1: LatLng, p2: LatLng, incidents: Incident[]): boolean {
  return incidents.some((inc) => {
    if (inc.status !== 'Active') return false;

    const isHardBlock = 
      inc.roadImpact === 'blocked' ||
      inc.type === 'Landslide' ||
      inc.type === 'Road Closure' ||
      inc.type === 'Bridge Closure';

    if (!isHardBlock) return false;

    const radius = inc.radius || 0.8;
    const d1 = calculateHaversineDistance(inc.coords, p1);
    const d2 = calculateHaversineDistance(inc.coords, p2);
    const mid: LatLng = { lat: (p1.lat + p2.lat) / 2, lng: (p1.lng + p2.lng) / 2 };
    const dMid = calculateHaversineDistance(inc.coords, mid);

    return d1 <= radius || d2 <= radius || dMid <= radius;
  });
}

/**
 * Assesses overall disaster risk and calculates numeric penalty for a route path.
 */
export function assessDisasterImpact(routePath: LatLng[], activeIncidents: Incident[]): RiskAssessment {
  const nearby = getNearbyIncidents(routePath, activeIncidents);

  let isBlocked = false;
  let blockageReason: string | undefined = undefined;
  let maxImpact: 'blocked' | 'delayed' | 'caution' | 'clear' = 'clear';
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
    } else if (inc.severity === 'High' || inc.type === 'Heavy Rain' || inc.type === 'Road Damage') {
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
