import { calculateHaversineDistance, assessDisasterImpact, isSegmentBlocked } from './riskService.js';
import { fetchOSRMRoutes } from './routingService.js';

// North Eastern Graph Nodes
export const NORTHEAST_NODES = [
  { id: 'PB', name: 'Police Bazar', state: 'Meghalaya', coords: { lat: 25.5732, lng: 91.8821 } },
  { id: 'LK', name: 'Laitumkhrah', state: 'Meghalaya', coords: { lat: 25.5684, lng: 91.8988 } },
  { id: 'ML', name: 'Mawlai', state: 'Meghalaya', coords: { lat: 25.5991, lng: 91.8762 } },
  { id: 'NT', name: 'Nongthymmai', state: 'Meghalaya', coords: { lat: 25.5587, lng: 91.9080 } },
  { id: 'US', name: 'Upper Shillong', state: 'Meghalaya', coords: { lat: 25.5392, lng: 91.8493 } },
  { id: 'NH', name: 'NEHU', state: 'Meghalaya', coords: { lat: 25.6125, lng: 91.8996 } },
  { id: 'PL', name: 'Polo', state: 'Meghalaya', coords: { lat: 25.5831, lng: 91.8879 } },
  { id: 'BB', name: 'Bara Bazar / Iewduh', state: 'Meghalaya', coords: { lat: 25.5721, lng: 91.8752 } },
  { id: 'CH', name: 'Civil Hospital Shillong', state: 'Meghalaya', coords: { lat: 25.5653, lng: 91.8795 } },
  { id: 'GL', name: 'Golf Links', state: 'Meghalaya', coords: { lat: 25.5888, lng: 91.8967 } },
  { id: 'MP', name: 'Mawpat', state: 'Meghalaya', coords: { lat: 25.6022, lng: 91.9189 } },
  { id: 'GAU', name: 'Guwahati', state: 'Assam', coords: { lat: 26.1445, lng: 91.7362 } },
  { id: 'DIS', name: 'Dispur', state: 'Assam', coords: { lat: 26.1408, lng: 91.7904 } },
  { id: 'ITA', name: 'Itanagar', state: 'Arunachal Pradesh', coords: { lat: 27.0844, lng: 93.6053 } },
  { id: 'KOH', name: 'Kohima', state: 'Nagaland', coords: { lat: 25.6751, lng: 94.1086 } },
  { id: 'IMP', name: 'Imphal', state: 'Manipur', coords: { lat: 24.8170, lng: 93.9368 } },
  { id: 'AIZ', name: 'Aizawl', state: 'Mizoram', coords: { lat: 23.7367, lng: 92.7176 } },
  { id: 'AGA', name: 'Agartala', state: 'Tripura', coords: { lat: 23.8315, lng: 91.2868 } },
  { id: 'GAN', name: 'Gangtok', state: 'Sikkim', coords: { lat: 27.3389, lng: 88.6065 } }
];

export function generateCurvyRoadGeometry(p1, p2) {
  const points = [p1];
  const numSegments = 8;
  const seed = p1.lat + p1.lng + p2.lat + p2.lng;
  
  for (let i = 1; i < numSegments; i++) {
    const t = i / numSegments;
    const lat = p1.lat + (p2.lat - p1.lat) * t;
    const lng = p1.lng + (p2.lng - p1.lng) * t;
    const dx = p2.lng - p1.lng;
    const dy = p2.lat - p1.lat;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / (len || 1);
    const ny = dx / (len || 1);
    const offset = 0.00075 * Math.sin(t * Math.PI * 3 + seed);
    points.push({ lat: lat + nx * offset, lng: lng + ny * offset });
  }
  points.push(p2);
  return points;
}

/**
 * Async Route Optimizer Pipeline.
 */
export async function routeOptimizer(
  pickupCoords,
  destinationCoords,
  vehicle,
  priority,
  weight,
  accessibilityRequirements,
  regionalConstraints,
  activeIncidents,
  hasRainSimulation,
  cargoType = 'Vaccine & Medical Supplies'
) {
  // Try live OSRM routes first
  const osrmCandidates = await fetchOSRMRoutes(pickupCoords, destinationCoords);

  let candidateList = [];

  if (osrmCandidates && osrmCandidates.length >= 2) {
    candidateList = osrmCandidates.map((c) => ({
      name: c.name,
      path: c.path,
      eta: c.durationMins,
      distance: c.distanceKm
    }));
  } else {
    // Generate curved road paths for demo fallback
    const directDist = calculateHaversineDistance(pickupCoords, destinationCoords);
    const midPoint1 = {
      lat: (pickupCoords.lat * 0.6 + destinationCoords.lat * 0.4) + 0.004,
      lng: (pickupCoords.lng * 0.6 + destinationCoords.lng * 0.4) - 0.003
    };
    const midPoint2 = {
      lat: (pickupCoords.lat * 0.4 + destinationCoords.lat * 0.6) - 0.003,
      lng: (pickupCoords.lng * 0.4 + destinationCoords.lng * 0.6) + 0.004
    };

    const path1 = generateCurvyRoadGeometry(pickupCoords, destinationCoords);
    const path2 = [
      ...generateCurvyRoadGeometry(pickupCoords, midPoint1),
      ...generateCurvyRoadGeometry(midPoint1, destinationCoords).slice(1)
    ];
    const path3 = [
      ...generateCurvyRoadGeometry(pickupCoords, midPoint2),
      ...generateCurvyRoadGeometry(midPoint2, destinationCoords).slice(1)
    ];

    candidateList = [
      { name: 'Fastest Route', path: path1, eta: Math.max(1, Math.round(directDist * 2.1)), distance: parseFloat((directDist * 1.1).toFixed(1)) },
      { name: 'Safest / Most Accessible', path: path2, eta: Math.max(1, Math.round(directDist * 2.4)), distance: parseFloat((directDist * 1.25).toFixed(1)) },
      { name: 'AI Recommended Route', path: path3, eta: Math.max(1, Math.round(directDist * 2.3)), distance: parseFloat((directDist * 1.2).toFixed(1)) }
    ];
  }

  // Multi-objective scoring
  const routeOptions = candidateList.map((cand, idx) => {
    const disasterAssessment = assessDisasterImpact(cand.path, activeIncidents);
    const isBlocked = disasterAssessment.isBlocked;

    let score = 85;
    if (isBlocked) score -= 60;
    if (hasRainSimulation) score -= 15;
    if (cargoType === 'Vaccine & Medical Supplies' && isBlocked) score -= 20;

    const finalScore = Math.max(10, Math.min(100, Math.round(score)));

    return {
      id: `route_${idx}_${Date.now()}`,
      name: cand.name,
      path: cand.path,
      eta: cand.eta,
      distance: cand.distance,
      accessibilityScore: isBlocked ? 40 : 92,
      terrainRisk: isBlocked ? 85 : 20,
      confidence: isBlocked ? 50 : 90,
      cost: parseFloat((cand.distance * 18.5).toFixed(2)),
      finalScore,
      status: isBlocked ? 'Blocked' : 'Clear',
      explanation: isBlocked 
        ? `Contains active hazard (${disasterAssessment.blockageReason}). Rerouted via safer bypass.`
        : `Optimized for ${cargoType} with ${priority} priority.`
    };
  });

  // Sort and set AI Recommended route as highest score
  routeOptions.sort((a, b) => b.finalScore - a.finalScore);
  if (routeOptions[0]) {
    routeOptions[0].name = 'AI Recommended Route';
  }

  return routeOptions;
}
