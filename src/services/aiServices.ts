import { LatLng, Vehicle, Incident, AccessibilityFeature, Rating } from '../types';

// Haversine formula to calculate distance in km between two points
export function calculateHaversineDistance(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth's radius in km
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

// Predict ETA (in minutes) based on distance, traffic, weather, and vehicle characteristics
export function etaPredictor(
  distance: number,
  trafficLevel: Rating,
  activeIncidents: Incident[],
  vehicle: Vehicle,
  hasRain: boolean,
  hasSteepSlope: boolean
): { eta: number; delayRisk: number } {
  // Base speed: 30 km/h in hilly terrain (Shillong)
  let baseSpeed = 28; // km/h

  // Adjust base speed by vehicle type
  switch (vehicle.type) {
    case 'Delivery Bike':
      baseSpeed = 26; // Slower on steep uphills
      break;
    case 'Compact Van':
    case 'Electric Van':
      baseSpeed = 28;
      break;
    case '4x4 Utility Vehicle':
      baseSpeed = 32; // More capable on hills
      break;
    case 'Mini Truck':
      baseSpeed = 24;
      break;
    case 'Medium Truck':
      baseSpeed = 18; // Very slow on narrow/steep hills
      break;
    case 'Accessible Mobility Vehicle':
      baseSpeed = 25;
      break;
  }

  let trafficMultiplier = 1.0;
  if (trafficLevel === 'Poor') trafficMultiplier = 1.8;
  else if (trafficLevel === 'Moderate') trafficMultiplier = 1.3;
  else if (trafficLevel === 'Excellent') trafficMultiplier = 0.95;

  let weatherMultiplier = 1.0;
  let rainDelayRisk = 0;
  if (hasRain) {
    weatherMultiplier = 1.4; // 40% slower due to low visibility and slippery mountain roads
    rainDelayRisk = 25;
  }

  let terrainMultiplier = 1.0;
  if (hasSteepSlope) {
    if (vehicle.type === 'Medium Truck' || vehicle.type === 'Mini Truck') {
      terrainMultiplier = 1.5; // heavy trucks climb hills very slowly
    } else if (vehicle.type === '4x4 Utility Vehicle') {
      terrainMultiplier = 1.1; // 4x4 handles steep slopes well
    } else {
      terrainMultiplier = 1.25;
    }
  }

  // Active incidents check
  let incidentMultiplier = 1.0;
  let incidentDelayRisk = 5;
  activeIncidents.forEach((inc) => {
    if (inc.status === 'Active') {
      if (inc.type === 'Traffic Congestion') {
        incidentMultiplier += 0.2;
        incidentDelayRisk += 15;
      } else if (inc.type === 'Heavy Rain') {
        incidentMultiplier += 0.15;
        incidentDelayRisk += 10;
      } else if (inc.type === 'Road Damage') {
        incidentMultiplier += 0.3;
        incidentDelayRisk += 20;
      } else if (inc.type === 'Bridge Closure' || inc.type === 'Road Closure' || inc.type === 'Landslide') {
        // These are normally blocks, but on alternative paths they represent high delay risk
        incidentDelayRisk += 45;
      }
    }
  });

  const speed = baseSpeed / (trafficMultiplier * weatherMultiplier * terrainMultiplier * incidentMultiplier);
  const rawEta = (distance / speed) * 60; // convert to minutes
  const eta = Math.round(rawEta);

  // Total delay risk capped at 95%
  const delayRisk = Math.min(
    95,
    Math.round(
      (trafficLevel === 'Poor' ? 30 : trafficLevel === 'Moderate' ? 15 : 2) +
        rainDelayRisk +
        (hasSteepSlope ? 10 : 0) +
        incidentDelayRisk
    )
  );

  return { eta, delayRisk };
}

// Calculate Terrain Risk Score (0 - 100)
export function terrainRiskScorer(
  hasLandslideAlert: boolean,
  hasRain: boolean,
  hasSteepSlope: boolean,
  hasNarrowRoad: boolean,
  roadCondition: Rating,
  hasBridgeDependency: boolean
): number {
  let score = 10; // base risk

  if (hasLandslideAlert) score += 45;
  if (hasRain) score += 15;
  if (hasSteepSlope) score += 15;
  if (hasNarrowRoad) score += 10;
  if (hasBridgeDependency) score += 5;

  if (roadCondition === 'Poor') score += 15;
  else if (roadCondition === 'Moderate') score += 5;
  else if (roadCondition === 'Excellent') score -= 5;

  return Math.max(0, Math.min(100, score));
}

// Calculate Accessibility Score (0 - 100) based on requirements and route barriers
export function accessibilityScorer(
  routeFeatures: AccessibilityFeature[],
  requirements: string[]
): number {
  let baseScore = 95; // Default highly accessible route

  if (requirements.length === 0) {
    // If no special constraints, assess general road quality and barriers
    routeFeatures.forEach((feat) => {
      if (feat.verifiedStatus !== 'Rejected') {
        if (feat.type === 'poor surface') baseScore -= 10;
        if (feat.type === 'temporary obstruction') baseScore -= 15;
        if (feat.type === 'inaccessible entry') baseScore -= 5;
      }
    });
    return Math.max(10, baseScore);
  }

  // Evaluate explicit user accessibility constraints
  requirements.forEach((req) => {
    if (req === 'Wheelchair Accessible') {
      // Wheelchair accessibility relies heavily on ramps, flat surfaces, and crossings
      const hasStairs = routeFeatures.some((f) => f.type === 'stairs' && f.verifiedStatus !== 'Rejected');
      const hasSteepSlope = routeFeatures.some((f) => f.type === 'steep slope' && f.verifiedStatus !== 'Rejected');
      const hasPoorSurface = routeFeatures.some((f) => f.type === 'poor surface' && f.verifiedStatus !== 'Rejected');
      const hasBrokenRamp = routeFeatures.some((f) => f.type === 'temporary obstruction' && f.verifiedStatus !== 'Rejected');
      
      if (hasStairs) baseScore -= 40;
      if (hasSteepSlope) baseScore -= 20;
      if (hasPoorSurface) baseScore -= 15;
      if (hasBrokenRamp) baseScore -= 25;
    }

    if (req === 'Avoid Stairs') {
      const hasStairs = routeFeatures.some((f) => f.type === 'stairs' && f.verifiedStatus !== 'Rejected');
      if (hasStairs) baseScore -= 50;
    }

    if (req === 'Avoid Very Steep Sections') {
      const hasSteepSlope = routeFeatures.some((f) => f.type === 'steep slope' && f.verifiedStatus !== 'Rejected');
      if (hasSteepSlope) baseScore -= 40;
    }

    if (req === 'Avoid Poor Surface') {
      const hasPoorSurface = routeFeatures.some((f) => f.type === 'poor surface' && f.verifiedStatus !== 'Rejected');
      if (hasPoorSurface) baseScore -= 30;
    }

    if (req === 'Avoid Narrow Route') {
      // Narrow route indicator
      const hasNarrow = routeFeatures.some((f) => f.type === 'temporary obstruction' && f.description.toLowerCase().includes('narrow') && f.verifiedStatus !== 'Rejected');
      if (hasNarrow) baseScore -= 20;
    }
  });

  return Math.max(5, baseScore);
}

// Calculate Confidence Score (0 - 100) based on sources and reports
export function confidenceScorer(routeFeatures: AccessibilityFeature[]): number {
  if (routeFeatures.length === 0) {
    return 35; // Insufficient data / sparse area
  }

  let totalConfidence = 0;
  routeFeatures.forEach((feat) => {
    let baseConf = 50;

    switch (feat.source) {
      case 'Government Dataset':
        baseConf = 95;
        break;
      case 'OpenStreetMap':
        baseConf = 85;
        break;
      case 'Driver Report':
        baseConf = 75;
        break;
      case 'User Report':
        baseConf = 60;
        break;
      case 'System Inference':
        baseConf = 45;
        break;
    }

    // Citizen reports get boosted by confirmations
    if (feat.source === 'User Report' || feat.source === 'Driver Report') {
      baseConf += Math.min(20, feat.reportsCount * 5);
    }

    // Pending verification penalizes confidence
    if (feat.verifiedStatus === 'Pending') {
      baseConf -= 15;
    } else if (feat.verifiedStatus === 'Rejected') {
      baseConf = 0;
    }

    totalConfidence += baseConf;
  });

  return Math.max(10, Math.min(100, Math.round(totalConfidence / routeFeatures.length)));
}

// Generate the text explanation for AI recommendations dynamically
export function explanationEngine(
  name: string,
  eta: number,
  distance: number,
  accessibilityScore: number,
  terrainRisk: number,
  confidence: number,
  roadReliability: Rating,
  vehicle: Vehicle,
  priority: string,
  alternatives: { name: string; eta: number; terrainRisk: number; accessibilityScore: number }[]
): string {
  const fastest = alternatives.find((a) => a.name.includes('Fastest'));
  const accessible = alternatives.find((a) => a.name.includes('Accessible') || a.name.includes('Safest'));

  if (name.includes('Fastest')) {
    let explanation = `Route Selected as the Fastest path. Total duration is ${eta} minutes covering ${distance.toFixed(1)} km. `;
    if (terrainRisk > 60) {
      explanation += `Warning: This route carries a High Terrain Risk (${terrainRisk}/100) due to steep inclines and susceptibility to landslips. It is recommended only for high-priority emergency tasks with capable vehicles like the ${vehicle.name}.`;
    } else {
      explanation += `It offers the shortest travel time, but compromises slightly on path slopes and accessibility.`;
    }
    return explanation;
  }

  if (name.includes('Safest') || name.includes('Accessible')) {
    return `Route selected for maximum Safety and Accessibility (${accessibilityScore}/100 score). It reduces the terrain risk level down to ${terrainRisk}/100 by utilizing main arteries and avoiding steep landslide-prone segments. Data confidence is high (${confidence}%) due to recent verifications.`;
  }

  // AI Recommended
  let text = `Neural Nexus recommends this balanced route. `;
  
  if (fastest) {
    const timeDiff = eta - fastest.eta;
    if (timeDiff <= 0) {
      text += `It is optimized as both the fastest and safest route. `;
    } else {
      text += `It adds only ${timeDiff} minute${timeDiff > 1 ? 's' : ''} of travel time compared to the fastest option `;
    }
  }

  if (accessible && terrainRisk <= accessible.terrainRisk + 5) {
    text += `while matching the safety profile of the specialized accessible route. `;
  } else if (accessible) {
    text += `while substantially improving the terrain safety (risk of ${terrainRisk}/100 vs the fastest route's ${fastest ? fastest.terrainRisk : 'higher'} risk) and enhancing the accessibility score to ${accessibilityScore}/100. `;
  }

  text += `It bypasses reported narrow road hazards and utilizes high-reliability roads suitable for the ${vehicle.type}.`;

  return text;
}
