export type PriorityLevel = 'Normal' | 'High' | 'Emergency';

export type OrderStatus = 'Pending' | 'Assigned' | 'En Route' | 'Delayed' | 'Rerouting' | 'Delivered';

export interface LatLng {
  lat: number;
  lng: number;
}

export type CargoType = 'Vaccine & Medical Supplies' | 'Heavy Construction & Gravel' | 'Perishable Agri-Produce' | 'Standard Freight';

export interface Order {
  id: string;
  customer: string;
  pickup: string;
  pickupCoords: LatLng;
  destination: string;
  destinationCoords: LatLng;
  priority: PriorityLevel;
  weight: number; // in kg
  cargoType?: CargoType;
  timeWindow: string; // "09:00 - 12:00"
  assignedVehicleId?: string;
  accessibilityRequirements: string[];
  status: OrderStatus;
  routeRisk: number; // 0 - 100
  eta: number; // in minutes
  distance?: number; // in km
  createdTime: string;
}

export type VehicleType = 'Delivery Bike' | 'Compact Van' | 'Electric Van' | 'Mini Truck' | 'Medium Truck' | '4x4 Utility Vehicle' | 'Accessible Mobility Vehicle';

export type VehicleStatus = 'Available' | 'Delivering' | 'Delayed' | 'Offline' | 'Maintenance';

export type Rating = 'Excellent' | 'Good' | 'Moderate' | 'Poor';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  capacity: number; // in kg
  load: number; // current load in kg
  groundClearance: number; // in mm
  hillSuitability: Rating;
  narrowRoadSuitability: Rating;
  fuelCharge: number; // percentage
  accessibilityCapability: 'Standard' | 'Ramp' | 'Wheelchair Lift';
  status: VehicleStatus;
  lat: number;
  lng: number;
  driverName: string;
}

export type IncidentType = 'Landslide' | 'Heavy Rain' | 'Road Closure' | 'Bridge Closure' | 'Road Damage' | 'Traffic Congestion' | 'Accessibility Barrier' | 'Vehicle Breakdown';

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type IncidentStatus = 'Active' | 'Monitoring' | 'Verified' | 'Resolved';

export interface Incident {
  id: string;
  locationName: string;
  coords: LatLng;
  type: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  reportedTime: string;
  source: string;
  confidence: number; // 0 - 100
  description: string;
  affectedRoutes?: string[]; // affected route identifiers
  radius?: number; // impact radius in km or meters
  roadImpact?: 'blocked' | 'delayed' | 'caution';
}

export type AccessibilityFeatureType = 
  | 'wheelchair accessible'
  | 'ramp'
  | 'stairs'
  | 'steep slope'
  | 'accessible crossing'
  | 'inaccessible entry'
  | 'poor surface'
  | 'temporary obstruction'
  | 'unknown accessibility';

export interface AccessibilityFeature {
  id: string;
  locationName: string;
  coords: LatLng;
  type: AccessibilityFeatureType;
  score: number; // 0 - 100
  confidence: number; // 0 - 100
  lastVerified: string;
  source: 'OpenStreetMap' | 'User Report' | 'Driver Report' | 'Government Dataset' | 'System Inference';
  reportsCount: number;
  verifiedStatus: 'Pending' | 'Verified' | 'Rejected';
  description: string;
}

export interface Zone {
  id: string;
  name: string;
  trafficLevel: Rating; // Current traffic
  terrainRisk: number; // 0-100
  accessibilityScore: number; // 0-100
  confidenceScore: number; // 0-100
  roadReliability: Rating;
  primaryChallenge: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  orderId: string;
  origin: string;
  destination: string;
  vehicleId: string;
  selectedRouteName: string;
  routesEvaluated: {
    name: string;
    eta: number;
    distance: number;
    accessibilityScore: number;
    terrainRisk: number;
    confidence: number;
    roadReliability: Rating;
    finalScore: number;
  }[];
  weights: {
    eta: number;
    cost: number;
    accessibility: number;
    terrain: number;
    reliability: number;
    confidence: number;
  };
  triggeringEvent?: string;
  explanation: string;
  humanOverride: boolean;
  overrideReason?: string;
}

export interface RouteOption {
  id: string;
  name: string; // e.g. "Fastest", "Safest / Most Reliable", "AI Recommended"
  path: LatLng[]; // list of coordinates representing route
  eta: number; // in mins
  distance: number; // in km
  accessibilityScore: number; // 0-100
  terrainRisk: number; // 0-100
  confidence: number; // 0-100
  roadReliability: Rating;
  cost: number;
  warnings: string[];
  benefits: string[];
  tradeoffs: string[];
  finalScore: number;
  explanation: string;
  directions: string[];
  majorTurns: number;
  status: 'Clear' | 'Caution' | 'Rerouting Required' | 'Blocked';
  avoidedIncident?: string;
}

export interface RegionState {
  id: string;
  name: string;
  coverage: number; // accessibility data coverage %
  reliability: number; // logistic reliability %
  disruptionsCount: number;
  lowConfidenceZonesCount: number;
  terrainChallenges: string[];
}
