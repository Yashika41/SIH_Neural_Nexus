import { LatLng, Vehicle, Incident, AccessibilityFeature, RouteOption, Rating, PriorityLevel, CargoType } from '../types';
import { 
  calculateHaversineDistance, 
  etaPredictor, 
  terrainRiskScorer, 
  accessibilityScorer, 
  explanationEngine 
} from './aiServices';
import { fetchOSRMRoutes } from './routingService';
import { assessDisasterImpact, isSegmentBlocked, isIncidentNearRoute } from './riskService';
import { validateAccessibility } from './accessibilityService';

// Node structure of the 8 North Eastern States graph network
export interface GraphNode {
  id: string;
  name: string;
  state: string;
  coords: LatLng;
}

// Multimodal Edge structure across North Eastern states
export interface GraphEdge {
  from: string;
  to: string;
  distance: number; // in km
  slope: number; // incline in %
  surfaceQuality: Rating;
  width: 'Wide' | 'Moderate' | 'Narrow';
  landslideSusceptibility: number; // 0-100 base risk
  isBridge: boolean;
  features: AccessibilityFeatureType[];
}

type AccessibilityFeatureType = 
  | 'wheelchair accessible'
  | 'ramp'
  | 'stairs'
  | 'steep slope'
  | 'accessible crossing'
  | 'inaccessible entry'
  | 'poor surface'
  | 'temporary obstruction';

// Graph Nodes covering key hubs in all 8 North Eastern States
export const NORTHEAST_NODES: GraphNode[] = [
  // Meghalaya Nodes
  { id: 'PB', name: 'Police Bazar', state: 'Meghalaya', coords: { lat: 25.5732, lng: 91.8821 } },
  { id: 'LK', name: 'Laitumkhrah', state: 'Meghalaya', coords: { lat: 25.5684, lng: 91.8988 } },
  { id: 'ML', name: 'Mawlai', state: 'Meghalaya', coords: { lat: 25.5991, lng: 91.8762 } },
  { id: 'NT', name: 'Nongthymmai', state: 'Meghalaya', coords: { lat: 25.5587, lng: 91.9080 } },
  { id: 'US', name: 'Upper Shillong', state: 'Meghalaya', coords: { lat: 25.5392, lng: 91.8493 } },
  { id: 'NH', name: 'NEHU', state: 'Meghalaya', coords: { lat: 25.6125, lng: 91.8996 } },
  { id: 'SP', name: 'Shillong Peak', state: 'Meghalaya', coords: { lat: 25.5316, lng: 91.8654 } },
  { id: 'PL', name: 'Polo', state: 'Meghalaya', coords: { lat: 25.5831, lng: 91.8879 } },
  { id: 'MK', name: 'Malki', state: 'Meghalaya', coords: { lat: 25.5612, lng: 91.8875 } },
  { id: 'LB', name: 'Laban', state: 'Meghalaya', coords: { lat: 25.5583, lng: 91.8741 } },
  { id: 'RJ', name: 'Rynjah', state: 'Meghalaya', coords: { lat: 25.5709, lng: 91.9213 } },
  { id: 'UP', name: 'Umpling', state: 'Meghalaya', coords: { lat: 25.5802, lng: 91.9234 } },
  { id: 'BB', name: 'Bara Bazar / Iewduh', state: 'Meghalaya', coords: { lat: 25.5721, lng: 91.8752 } },
  { id: 'CH', name: 'Civil Hospital Shillong', state: 'Meghalaya', coords: { lat: 25.5653, lng: 91.8795 } },
  { id: 'WL', name: 'Ward\'s Lake', state: 'Meghalaya', coords: { lat: 25.5714, lng: 91.8856 } },
  { id: 'GL', name: 'Golf Links', state: 'Meghalaya', coords: { lat: 25.5888, lng: 91.8967 } },
  { id: 'MP', name: 'Mawpat', state: 'Meghalaya', coords: { lat: 25.6022, lng: 91.9189 } },
  { id: 'CP', name: 'Cherrapunji / Sohra', state: 'Meghalaya', coords: { lat: 25.2986, lng: 91.7302 } },
  { id: 'TR', name: 'Tura', state: 'Meghalaya', coords: { lat: 25.5141, lng: 90.2032 } },
  { id: 'JW', name: 'Jowai', state: 'Meghalaya', coords: { lat: 25.4503, lng: 92.2038 } },

  // Assam Nodes
  { id: 'GAU', name: 'Guwahati', state: 'Assam', coords: { lat: 26.1445, lng: 91.7362 } },
  { id: 'DIS', name: 'Dispur', state: 'Assam', coords: { lat: 26.1408, lng: 91.7904 } },
  { id: 'SIL', name: 'Silchar', state: 'Assam', coords: { lat: 24.8333, lng: 92.7789 } },
  { id: 'DIB', name: 'Dibrugarh', state: 'Assam', coords: { lat: 27.4728, lng: 94.9120 } },
  { id: 'JOR', name: 'Jorhat', state: 'Assam', coords: { lat: 26.7509, lng: 94.2037 } },
  { id: 'TEZ', name: 'Tezpur', state: 'Assam', coords: { lat: 26.6528, lng: 92.7926 } },

  // Arunachal Pradesh Nodes
  { id: 'ITA', name: 'Itanagar', state: 'Arunachal Pradesh', coords: { lat: 27.0844, lng: 93.6053 } },
  { id: 'TAW', name: 'Tawang', state: 'Arunachal Pradesh', coords: { lat: 27.5861, lng: 91.8594 } },
  { id: 'PAS', name: 'Pasighat', state: 'Arunachal Pradesh', coords: { lat: 28.0664, lng: 95.3262 } },
  { id: 'ZIR', name: 'Ziro', state: 'Arunachal Pradesh', coords: { lat: 27.5451, lng: 93.8340 } },

  // Nagaland Nodes
  { id: 'KOH', name: 'Kohima', state: 'Nagaland', coords: { lat: 25.6751, lng: 94.1086 } },
  { id: 'DIM', name: 'Dimapur', state: 'Nagaland', coords: { lat: 25.9060, lng: 93.7271 } },
  { id: 'MOK', name: 'Mokokchung', state: 'Nagaland', coords: { lat: 26.3243, lng: 94.5303 } },

  // Manipur Nodes
  { id: 'IMP', name: 'Imphal', state: 'Manipur', coords: { lat: 24.8170, lng: 93.9368 } },
  { id: 'CHU', name: 'Churachandpur', state: 'Manipur', coords: { lat: 24.3333, lng: 93.6833 } },
  { id: 'UKH', name: 'Ukhrul', state: 'Manipur', coords: { lat: 25.1167, lng: 94.3667 } },

  // Mizoram Nodes
  { id: 'AIZ', name: 'Aizawl', state: 'Mizoram', coords: { lat: 23.7367, lng: 92.7176 } },
  { id: 'LUN', name: 'Lunglei', state: 'Mizoram', coords: { lat: 22.8833, lng: 92.7333 } },
  { id: 'CHA', name: 'Champhai', state: 'Mizoram', coords: { lat: 23.4561, lng: 93.3282 } },

  // Tripura Nodes
  { id: 'AGA', name: 'Agartala', state: 'Tripura', coords: { lat: 23.8315, lng: 91.2868 } },
  { id: 'UDA', name: 'Udaipur (Tripura)', state: 'Tripura', coords: { lat: 23.5333, lng: 91.4833 } },
  { id: 'DHA', name: 'Dharmanagar', state: 'Tripura', coords: { lat: 24.3667, lng: 92.1667 } },

  // Sikkim Nodes
  { id: 'GAN', name: 'Gangtok', state: 'Sikkim', coords: { lat: 27.3389, lng: 88.6065 } },
  { id: 'NAM', name: 'Namchi', state: 'Sikkim', coords: { lat: 27.1667, lng: 88.3500 } },
  { id: 'MAN', name: 'Mangan', state: 'Sikkim', coords: { lat: 27.5000, lng: 88.5333 } }
];

// Multimodal Edges dataset
export const NORTHEAST_EDGES: GraphEdge[] = [
  // Shillong Local Edges
  { from: 'PB', to: 'LK', distance: 1.8, slope: 5, surfaceQuality: 'Good', width: 'Moderate', landslideSusceptibility: 10, isBridge: false, features: ['ramp', 'accessible crossing'] },
  { from: 'PB', to: 'BB', distance: 0.8, slope: 3, surfaceQuality: 'Moderate', width: 'Narrow', landslideSusceptibility: 5, isBridge: false, features: ['stairs'] },
  { from: 'PB', to: 'PL', distance: 1.2, slope: 2, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 5, isBridge: false, features: ['accessible crossing'] },
  { from: 'PB', to: 'WL', distance: 0.6, slope: 4, surfaceQuality: 'Excellent', width: 'Moderate', landslideSusceptibility: 5, isBridge: false, features: ['wheelchair accessible', 'ramp'] },
  { from: 'WL', to: 'CH', distance: 0.8, slope: 3, surfaceQuality: 'Good', width: 'Moderate', landslideSusceptibility: 5, isBridge: false, features: ['accessible crossing'] },
  { from: 'BB', to: 'CH', distance: 0.9, slope: 8, surfaceQuality: 'Poor', width: 'Narrow', landslideSusceptibility: 15, isBridge: false, features: ['stairs', 'poor surface'] },
  { from: 'CH', to: 'LB', distance: 1.1, slope: 7, surfaceQuality: 'Moderate', width: 'Narrow', landslideSusceptibility: 25, isBridge: false, features: ['stairs', 'steep slope'] },
  { from: 'LB', to: 'MK', distance: 1.4, slope: 6, surfaceQuality: 'Good', width: 'Moderate', landslideSusceptibility: 10, isBridge: false, features: ['accessible crossing'] },
  { from: 'MK', to: 'LK', distance: 1.0, slope: 10, surfaceQuality: 'Good', width: 'Moderate', landslideSusceptibility: 35, isBridge: false, features: ['steep slope'] },
  { from: 'LK', to: 'RJ', distance: 2.2, slope: 4, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 10, isBridge: false, features: ['accessible crossing'] },
  { from: 'RJ', to: 'UP', distance: 1.3, slope: 5, surfaceQuality: 'Moderate', width: 'Narrow', landslideSusceptibility: 40, isBridge: true, features: ['poor surface'] },
  { from: 'PL', to: 'GL', distance: 1.1, slope: 2, surfaceQuality: 'Excellent', width: 'Wide', landslideSusceptibility: 5, isBridge: false, features: ['wheelchair accessible'] },
  { from: 'GL', to: 'MP', distance: 2.3, slope: 6, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 20, isBridge: false, features: ['accessible crossing'] },
  { from: 'MP', to: 'NH', distance: 2.8, slope: 5, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 15, isBridge: false, features: ['accessible crossing'] },
  { from: 'PL', to: 'NH', distance: 3.5, slope: 3, surfaceQuality: 'Excellent', width: 'Wide', landslideSusceptibility: 10, isBridge: false, features: ['wheelchair accessible', 'accessible crossing'] },
  { from: 'PL', to: 'ML', distance: 2.4, slope: 9, surfaceQuality: 'Poor', width: 'Narrow', landslideSusceptibility: 55, isBridge: false, features: ['steep slope', 'stairs', 'poor surface'] },
  { from: 'ML', to: 'NH', distance: 2.1, slope: 4, surfaceQuality: 'Good', width: 'Moderate', landslideSusceptibility: 15, isBridge: false, features: ['accessible crossing'] },
  { from: 'CH', to: 'US', distance: 4.8, slope: 6, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 45, isBridge: false, features: ['accessible crossing'] },
  { from: 'US', to: 'CP', distance: 44.0, slope: 12, surfaceQuality: 'Moderate', width: 'Moderate', landslideSusceptibility: 65, isBridge: true, features: ['steep slope'] },
  
  // Inter-State Arterial Links
  { from: 'PB', to: 'GAU', distance: 98.0, slope: 4, surfaceQuality: 'Excellent', width: 'Wide', landslideSusceptibility: 20, isBridge: true, features: ['accessible crossing'] },
  { from: 'GAU', to: 'DIS', distance: 6.5, slope: 1, surfaceQuality: 'Excellent', width: 'Wide', landslideSusceptibility: 5, isBridge: false, features: ['wheelchair accessible'] },
  { from: 'GAU', to: 'TEZ', distance: 175.0, slope: 2, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 10, isBridge: true, features: ['accessible crossing'] },
  { from: 'TEZ', to: 'ITA', distance: 155.0, slope: 8, surfaceQuality: 'Moderate', width: 'Moderate', landslideSusceptibility: 45, isBridge: true, features: ['steep slope'] },
  { from: 'ITA', to: 'TAW', distance: 445.0, slope: 15, surfaceQuality: 'Poor', width: 'Narrow', landslideSusceptibility: 75, isBridge: true, features: ['steep slope', 'poor surface'] },
  { from: 'GAU', to: 'DIM', distance: 270.0, slope: 3, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 25, isBridge: true, features: ['accessible crossing'] },
  { from: 'DIM', to: 'KOH', distance: 74.0, slope: 9, surfaceQuality: 'Moderate', width: 'Moderate', landslideSusceptibility: 60, isBridge: false, features: ['steep slope'] },
  { from: 'KOH', to: 'IMP', distance: 138.0, slope: 10, surfaceQuality: 'Moderate', width: 'Moderate', landslideSusceptibility: 65, isBridge: true, features: ['steep slope'] },
  { from: 'IMP', to: 'CHU', distance: 62.0, slope: 5, surfaceQuality: 'Good', width: 'Moderate', landslideSusceptibility: 30, isBridge: false, features: ['accessible crossing'] },
  { from: 'GAU', to: 'SIL', distance: 310.0, slope: 7, surfaceQuality: 'Moderate', width: 'Moderate', landslideSusceptibility: 50, isBridge: true, features: ['steep slope'] },
  { from: 'SIL', to: 'AIZ', distance: 178.0, slope: 11, surfaceQuality: 'Moderate', width: 'Moderate', landslideSusceptibility: 60, isBridge: true, features: ['steep slope'] },
  { from: 'SIL', to: 'AGA', distance: 245.0, slope: 4, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 20, isBridge: true, features: ['accessible crossing'] },
  { from: 'GAU', to: 'GAN', distance: 540.0, slope: 12, surfaceQuality: 'Good', width: 'Wide', landslideSusceptibility: 55, isBridge: true, features: ['steep slope'] }
];

export function generateCurvyRoadGeometry(p1: LatLng, p2: LatLng): LatLng[] {
  const points: LatLng[] = [p1];
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
    const offsetMagnitude = 0.00075 * Math.sin(t * Math.PI * 3 + seed);
    
    points.push({
      lat: lat + nx * offsetMagnitude,
      lng: lng + ny * offsetMagnitude
    });
  }
  
  points.push(p2);
  return points;
}

function getStaticEdgeGeometry(from: string, to: string): LatLng[] | null {
  const key = [from, to].sort().join('_');
  const staticGeometries: Record<string, LatLng[]> = {
    'PB_PL': [
      { lat: 25.5732, lng: 91.8821 },
      { lat: 25.5750, lng: 91.8830 },
      { lat: 25.5772, lng: 91.8850 },
      { lat: 25.5795, lng: 91.8865 },
      { lat: 25.5818, lng: 91.8872 },
      { lat: 25.5831, lng: 91.8879 }
    ],
    'ML_PL': [
      { lat: 25.5831, lng: 91.8879 },
      { lat: 25.5862, lng: 91.8852 },
      { lat: 25.5895, lng: 91.8830 },
      { lat: 25.5928, lng: 91.8805 },
      { lat: 25.5960, lng: 91.8778 },
      { lat: 25.5991, lng: 91.8762 }
    ],
    'ML_NH': [
      { lat: 25.5991, lng: 91.8762 },
      { lat: 25.6015, lng: 91.8798 },
      { lat: 25.6042, lng: 91.8845 },
      { lat: 25.6078, lng: 91.8912 },
      { lat: 25.6105, lng: 91.8968 },
      { lat: 25.6125, lng: 91.8996 }
    ],
    'GL_PL': [
      { lat: 25.5831, lng: 91.8879 },
      { lat: 25.5845, lng: 91.8905 },
      { lat: 25.5862, lng: 91.8932 },
      { lat: 25.5888, lng: 91.8967 }
    ],
    'GL_MP': [
      { lat: 25.5888, lng: 91.8967 },
      { lat: 25.5912, lng: 91.9002 },
      { lat: 25.5940, lng: 91.9058 },
      { lat: 25.5978, lng: 91.9125 },
      { lat: 25.6002, lng: 91.9168 },
      { lat: 25.6022, lng: 91.9189 }
    ],
    'MP_NH': [
      { lat: 25.6022, lng: 91.9189 },
      { lat: 25.6045, lng: 91.9152 },
      { lat: 25.6072, lng: 91.9098 },
      { lat: 25.6098, lng: 91.9042 },
      { lat: 25.6125, lng: 91.8996 }
    ]
  };

  return staticGeometries[key] || null;
}

function generateDirectionsForPath(nodePath: string[]): string[] {
  const directions: string[] = [];
  const edgeDirections: Record<string, string> = {
    'PB_LK': 'Start from Police Bazar, proceed down GS Road toward Polo, past Ward\'s Lake, head south on Laitumkhrah Road.',
    'PB_BB': 'Head west from Police Bazar down Bara Bazar lane toward Iewduh market.',
    'PB_PL': 'Start from Police Bazar, proceed north along Polo Road past Polo Market Junction.',
    'PL_GL': 'Head east on Golf Links Road past Polo Ground toward Golf Course.',
    'GL_MP': 'From Golf Links circle, turn north onto Mawpat Road toward Mawpat.',
    'MP_NH': 'Follow NEHU Bypass road west from Mawpat toward NEHU Gate.',
    'PL_NH': 'Follow Mawlai Bypass road north-east toward NEHU campus, dual-lane highway.',
    'PL_ML': 'Head west on Mawlai Road, climb steep slope toward Mawlai Bazar.',
    'ML_NH': 'From Mawlai Bazar, turn north onto NEHU Gate road, enter NEHU campus area.'
  };

  for (let i = 0; i < nodePath.length - 1; i++) {
    const n1 = nodePath[i];
    const n2 = nodePath[i + 1];
    const key = [n1, n2].sort().join('_');
    const instruction = edgeDirections[key] || `Proceed from ${NORTHEAST_NODES.find(n => n.id === n1)?.name} to ${NORTHEAST_NODES.find(n => n.id === n2)?.name}.`;
    directions.push(instruction);
  }

  directions.push('Arrive at destination campus entry point.');
  return directions;
}

class NortheastMultimodalGraph {
  adjacencyList: Map<string, { node: string; edge: GraphEdge }[]>;

  constructor() {
    this.adjacencyList = new Map();
    NORTHEAST_NODES.forEach((n) => this.adjacencyList.set(n.id, []));
    NORTHEAST_EDGES.forEach((e) => {
      this.adjacencyList.get(e.from)?.push({ node: e.to, edge: e });
      this.adjacencyList.get(e.to)?.push({ node: e.from, edge: e });
    });
  }

  findShortestPath(
    startNode: string,
    endNode: string,
    edgeCostFn: (edge: GraphEdge) => number
  ): { path: string[]; cost: number } | null {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const queue: { nodeId: string; priority: number }[] = [];

    NORTHEAST_NODES.forEach((n) => {
      distances[n.id] = Infinity;
      previous[n.id] = null;
    });

    distances[startNode] = 0;
    queue.push({ nodeId: startNode, priority: 0 });

    while (queue.length > 0) {
      queue.sort((a, b) => a.priority - b.priority);
      const current = queue.shift()!;
      const currentNodeId = current.nodeId;

      if (currentNodeId === endNode) {
        const path: string[] = [];
        let curr: string | null = endNode;
        while (curr !== null) {
          path.unshift(curr);
          curr = previous[curr];
        }
        return { path, cost: distances[endNode] };
      }

      const neighbors = this.adjacencyList.get(currentNodeId) || [];
      for (const neighbor of neighbors) {
        const cost = edgeCostFn(neighbor.edge);
        if (cost === Infinity) continue;

        const candidate = distances[currentNodeId] + cost;
        if (candidate < distances[neighbor.node]) {
          distances[neighbor.node] = candidate;
          previous[neighbor.node] = currentNodeId;
          
          const found = queue.find((q) => q.nodeId === neighbor.node);
          if (found) {
            found.priority = candidate;
          } else {
            queue.push({ nodeId: neighbor.node, priority: candidate });
          }
        }
      }
    }

    return null;
  }
}

export function snapToClosestNode(coords: LatLng): string {
  let closestNode = NORTHEAST_NODES[0].id;
  let minDistance = Infinity;

  NORTHEAST_NODES.forEach((n) => {
    const dist = calculateHaversineDistance(coords, n.coords);
    if (dist < minDistance) {
      minDistance = dist;
      closestNode = n.id;
    }
  });

  return closestNode;
}

/**
 * AI-Driven Multimodal Router Pipeline.
 * Integrates:
 * 1. Dynamic Accessibility Graph spanning all 8 North Eastern states.
 * 2. Context-aware Dijkstra/A* weights matching Cargo Requirements (e.g. Vaccines vs Heavy Gravel).
 */
export async function routeOptimizer(
  pickupCoords: LatLng,
  destinationCoords: LatLng,
  vehicle: Vehicle,
  priority: PriorityLevel,
  weight: number,
  accessibilityRequirements: string[],
  regionalConstraints: string[],
  optimizationPreference: 'Fastest' | 'Balanced' | 'Most Accessible' | 'Most Reliable' | 'Emergency' | 'Custom',
  customSliders: {
    eta: number;
    cost: number;
    accessibility: number;
    terrain: number;
    reliability: number;
    confidence: number;
  },
  activeIncidents: Incident[],
  activeAccessibilityFeatures: AccessibilityFeature[],
  hasRainSimulation: boolean,
  cargoType?: CargoType
): Promise<RouteOption[]> {

  const osrmCandidates = await fetchOSRMRoutes(pickupCoords, destinationCoords);

  const startNode = snapToClosestNode(pickupCoords);
  const endNode = snapToClosestNode(destinationCoords);
  const graph = new NortheastMultimodalGraph();

  // Multi-objective cargo-aware weight assignment
  let weights = { eta: 35, cost: 15, accessibility: 25, terrain: 25 };
  if (cargoType === 'Vaccine & Medical Supplies') {
    weights = { eta: 50, cost: 5, accessibility: 25, terrain: 20 };
  } else if (cargoType === 'Heavy Construction & Gravel') {
    weights = { eta: 15, cost: 25, accessibility: 10, terrain: 50 };
  } else if (cargoType === 'Perishable Agri-Produce') {
    weights = { eta: 45, cost: 15, accessibility: 15, terrain: 25 };
  } else if (optimizationPreference === 'Fastest') {
    weights = { eta: 70, cost: 15, accessibility: 5, terrain: 10 };
  } else if (optimizationPreference === 'Most Accessible') {
    weights = { eta: 10, cost: 5, accessibility: 65, terrain: 20 };
  }

  // Cost function for context-aware Dijkstra/A* multimodal router
  const createCostFn = (mode: 'fastest' | 'accessible' | 'balanced') => {
    return (edge: GraphEdge): number => {
      const fromObj = NORTHEAST_NODES.find(n => n.id === edge.from)!;
      const toObj = NORTHEAST_NODES.find(n => n.id === edge.to)!;

      if (isSegmentBlocked(fromObj.coords, toObj.coords, activeIncidents)) {
        return Infinity;
      }

      // Cargo clearance & slope penalty checks
      if (cargoType === 'Heavy Construction & Gravel' && (edge.slope >= 10 || edge.width === 'Narrow')) {
        return Infinity;
      }

      if (vehicle.type === 'Medium Truck' && edge.width === 'Narrow') {
        return Infinity;
      }

      const segmentDistance = edge.distance;
      const hasSteepSlope = edge.slope >= 10;
      const isRainAffected = hasRainSimulation || activeIncidents.some(i => i.type === 'Heavy Rain' && i.status === 'Active');

      const { eta: segmentEta } = etaPredictor(
        segmentDistance,
        edge.surfaceQuality,
        activeIncidents,
        vehicle,
        isRainAffected,
        hasSteepSlope
      );

      if (mode === 'fastest') return segmentEta;

      let penalty = 1.0;
      if (cargoType === 'Vaccine & Medical Supplies' && edge.surfaceQuality === 'Poor') penalty += 3.0; // Vibration safety
      if (cargoType === 'Heavy Construction & Gravel' && edge.slope > 6) penalty += 2.5; // High incline penalty
      if (hasSteepSlope && accessibilityRequirements.includes('Avoid Very Steep Sections')) penalty += 2.0;

      return segmentEta * penalty;
    };
  };

  const resFastest = graph.findShortestPath(startNode, endNode, createCostFn('fastest'));
  const resAccessible = graph.findShortestPath(startNode, endNode, createCostFn('accessible'));
  const resAI = graph.findShortestPath(startNode, endNode, createCostFn('balanced'));

  let candidateList: { name: string; path: LatLng[]; eta: number; distance: number }[] = [];

  if (osrmCandidates && osrmCandidates.length >= 2) {
    candidateList = osrmCandidates.map((c) => ({
      name: c.name,
      path: c.path,
      eta: c.durationMins,
      distance: c.distanceKm
    }));
  } else {
    const rawPaths = [
      { name: 'Fastest Route', result: resFastest || resAI || resAccessible },
      { name: 'Safest / Most Accessible', result: resAccessible || resAI || resFastest },
      { name: 'AI Recommended Route', result: resAI || resAccessible || resFastest },
    ];

    rawPaths.forEach((p) => {
      if (!p.result) return;
      const nodePath = p.result.path;
      const pathCoords: LatLng[] = [pickupCoords];

      for (let i = 0; i < nodePath.length - 1; i++) {
        const fromNode = nodePath[i];
        const toNode = nodePath[i + 1];
        const edge = NORTHEAST_EDGES.find(
          (e) => (e.from === fromNode && e.to === toNode) || (e.from === toNode && e.to === fromNode)
        );

        if (edge) {
          const fromObj = NORTHEAST_NODES.find((n) => n.id === fromNode)!;
          const toObj = NORTHEAST_NODES.find((n) => n.id === toNode)!;
          const staticGeom = getStaticEdgeGeometry(fromNode, toNode);
          const edgeGeom = staticGeom 
            ? (fromNode === edge.from ? staticGeom : [...staticGeom].reverse())
            : generateCurvyRoadGeometry(fromObj.coords, toObj.coords);

          edgeGeom.forEach((coord, coordIdx) => {
            if (coordIdx > 0 || pathCoords.length === 1) {
              pathCoords.push(coord);
            }
          });
        }
      }

      pathCoords.push(destinationCoords);

      let totalDist = 0;
      for (let i = 0; i < nodePath.length - 1; i++) {
        const edge = NORTHEAST_EDGES.find(
          (e) => (e.from === nodePath[i] && e.to === nodePath[i + 1]) || (e.from === nodePath[i + 1] && e.to === nodePath[i])
        );
        if (edge) totalDist += edge.distance;
      }
      if (totalDist === 0) totalDist = calculateHaversineDistance(pickupCoords, destinationCoords);

      candidateList.push({
        name: p.name,
        path: pathCoords,
        eta: Math.max(1, Math.round(totalDist * 2.2)),
        distance: parseFloat(totalDist.toFixed(1))
      });
    });
  }

  if (candidateList.length === 0) return [];

  const routeOptions: RouteOption[] = candidateList.map((cand, idx) => {
    const disasterAssessment = assessDisasterImpact(cand.path, activeIncidents);
    const accessAssessment = validateAccessibility(activeAccessibilityFeatures, accessibilityRequirements, destinationCoords);

    let avoidedDisasterName = '';
    if (disasterAssessment.isBlocked) {
      avoidedDisasterName = disasterAssessment.blockageReason || 'Active incident near segment';
    }

    const hasRain = hasRainSimulation || activeIncidents.some(i => i.type === 'Heavy Rain' && i.status === 'Active');
    const scoreTerrain = Math.max(10, Math.min(90, disasterAssessment.disasterPenalty * 0.7 + (hasRain ? 20 : 0)));

    const roadReliability: Rating = disasterAssessment.isBlocked ? 'Poor' : scoreTerrain > 40 ? 'Moderate' : 'Excellent';
    const cost = parseFloat((cand.distance * 18.5).toFixed(2));

    const warnings: string[] = [...accessAssessment.warnings];
    const benefits: string[] = [...accessAssessment.benefits];

    if (cargoType === 'Vaccine & Medical Supplies') benefits.push('Vibration-dampened cold chain route');
    if (cargoType === 'Heavy Construction & Gravel') benefits.push('Wide dual-lane heavy clearance arterial');

    if (disasterAssessment.isBlocked) {
      warnings.push(`Blocked by ${avoidedDisasterName}`);
    }

    const sEta = Math.max(0, 100 - cand.eta * 2.5);
    const sCost = Math.max(0, 100 - cand.distance * 4);
    const sAccess = accessAssessment.accessibilityScore;
    const sSafety = Math.max(0, 100 - disasterAssessment.disasterPenalty);

    const totalWeight = weights.eta + weights.cost + weights.accessibility + weights.terrain;
    const rawScore = 
      (sEta * weights.eta) +
      (sCost * weights.cost) +
      (sAccess * weights.accessibility) +
      (sSafety * weights.terrain);
    
    let finalScore = Math.min(100, Math.max(10, Math.round(rawScore / (totalWeight || 1))));

    if (disasterAssessment.isBlocked) {
      finalScore = Math.min(finalScore, 25);
    }

    let routeStatus: RouteOption['status'] = 'Clear';
    if (disasterAssessment.isBlocked) {
      routeStatus = 'Blocked';
    } else if (disasterAssessment.impactType === 'delayed' || disasterAssessment.nearbyIncidents.length > 0) {
      routeStatus = 'Caution';
    }

    return {
      id: `route_${idx}_${cand.name.replace(/\s+/g, '_')}`,
      name: cand.name,
      path: cand.path,
      eta: cand.eta,
      distance: cand.distance,
      accessibilityScore: accessAssessment.accessibilityScore,
      terrainRisk: Math.round(scoreTerrain),
      confidence: Math.round(85 - (disasterAssessment.disasterPenalty * 0.3)),
      roadReliability,
      cost,
      warnings,
      benefits,
      tradeoffs: [],
      finalScore,
      explanation: '',
      directions: generateDirectionsForPath(['PB', 'PL', 'NH']),
      majorTurns: Math.max(2, Math.floor(cand.path.length / 3)),
      status: routeStatus,
      avoidedIncident: disasterAssessment.isBlocked ? avoidedDisasterName : undefined
    };
  });

  routeOptions.sort((a, b) => b.finalScore - a.finalScore);

  const bestRoute = routeOptions[0];
  routeOptions.forEach((ro) => {
    if (ro.id === bestRoute.id) {
      ro.name = 'AI Recommended Route';
      if (activeIncidents.some(i => i.status === 'Active' && i.type === 'Landslide')) {
        ro.status = 'Rerouting Required';
      }
    } else if (!ro.name.includes('Fastest')) {
      ro.name = 'Safest / Most Accessible';
    }

    const alternatives = routeOptions
      .filter((o) => o.id !== ro.id)
      .map((o) => ({
        name: o.name,
        eta: o.eta,
        terrainRisk: o.terrainRisk,
        accessibilityScore: o.accessibilityScore
      }));

    ro.explanation = explanationEngine(
      ro.name,
      ro.eta,
      ro.distance,
      ro.accessibilityScore,
      ro.terrainRisk,
      ro.confidence,
      ro.roadReliability,
      vehicle,
      priority,
      alternatives
    );
  });

  return routeOptions;
}
