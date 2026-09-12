import { create } from 'zustand';
import { 
  Order, Vehicle, Incident, AccessibilityFeature, Zone, AuditLog, 
  RouteOption, RegionState, LatLng, PriorityLevel, VehicleType, Rating,
  OrderStatus, VehicleStatus, IncidentStatus
} from '../types';
import { routeOptimizer } from '../services/routeOptimizer';
import { calculateHaversineDistance } from '../services/aiServices';

interface CustomSliders {
  eta: number;
  cost: number;
  accessibility: number;
  terrain: number;
  reliability: number;
  confidence: number;
}

interface DemoStep {
  title: string;
  desc: string;
  completed: boolean;
}

interface AppState {
  // Navigation
  activeTab: string;
  regionSelector: string;

  // Database collections
  orders: Order[];
  vehicles: Vehicle[];
  incidents: Incident[];
  accessibilityFeatures: AccessibilityFeature[];
  zones: Zone[];
  auditLogs: AuditLog[];
  regions: RegionState[];

  // Routing State
  selectedOrder: Order | null;
  selectedVehicle: Vehicle | null;
  activeRouteOptions: RouteOption[];
  selectedRouteId: string | null;
  previousRouteOption: RouteOption | null;
  showRerouteAlert: boolean;
  optimizationPreference: 'Fastest' | 'Balanced' | 'Most Accessible' | 'Most Reliable' | 'Emergency' | 'Custom';
  customSliders: CustomSliders;
  regionalConstraints: string[];
  isOptimizing: boolean;
  optimizationLogs: string[];

  // Simulation State
  isSimulating: boolean;
  simulationSpeed: number;
  rainSimulationActive: boolean;

  // Demo state
  demoActive: boolean;
  demoStep: number;
  demoSteps: DemoStep[];

  // UI state
  architectureModalOpen: boolean;

  // Actions
  setActiveTab: (tab: string) => void;
  setRegionSelector: (region: string) => void;
  setOptimizationPreference: (pref: AppState['optimizationPreference']) => void;
  setCustomSliders: (sliders: Partial<CustomSliders>) => void;
  toggleRegionalConstraint: (constraint: string) => void;
  
  // CRUD Actions
  addOrder: (order: Omit<Order, 'id' | 'createdTime' | 'status' | 'eta' | 'routeRisk'>) => void;
  editOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  assignVehicleToOrder: (orderId: string, vehicleId: string) => void;

  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'status' | 'load' | 'lat' | 'lng'>) => void;
  editVehicle: (vehicle: Vehicle) => void;
  toggleVehicleStatus: (id: string, status: Vehicle['status']) => void;

  addIncident: (incident: Omit<Incident, 'id' | 'reportedTime' | 'status'>) => void;
  resolveIncident: (id: string) => void;
  simulateIncident: (type: Incident['type']) => void;
  clearIncidents: () => void;

  addAccessibilityReport: (report: Omit<AccessibilityFeature, 'id' | 'lastVerified' | 'reportsCount' | 'verifiedStatus'>) => void;
  verifyAccessibilityFeature: (id: string, status: 'Verified' | 'Rejected') => void;

  // Routing Engine Call
  runOptimization: () => void;
  selectRoute: (routeId: string) => void;
  overrideRecommendation: (reason: string) => void;

  // Simulation Engine Call
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  toggleRainSimulation: () => void;
  tickSimulation: () => void;

  // Demo Controls
  startDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  resetDemo: () => void;

  setArchitectureModalOpen: (open: boolean) => void;
}

// Coordinate references for Shillong landmarks
const LANDMARKS = {
  PB: { lat: 25.5732, lng: 91.8821, name: 'Police Bazar' },
  LK: { lat: 25.5684, lng: 91.8988, name: 'Laitumkhrah' },
  ML: { lat: 25.5991, lng: 91.8762, name: 'Mawlai' },
  NT: { lat: 25.5587, lng: 91.9080, name: 'Nongthymmai' },
  US: { lat: 25.5392, lng: 91.8493, name: 'Upper Shillong' },
  NH: { lat: 25.6125, lng: 91.8996, name: 'NEHU' },
  SP: { lat: 25.5316, lng: 91.8654, name: 'Shillong Peak' },
  PL: { lat: 25.5831, lng: 91.8879, name: 'Polo' },
  MK: { lat: 25.5612, lng: 91.8875, name: 'Malki' },
  LB: { lat: 25.5583, lng: 91.8741, name: 'Laban' },
  RJ: { lat: 25.5709, lng: 91.9213, name: 'Rynjah' },
  UP: { lat: 25.5802, lng: 91.9234, name: 'Umpling' },
  BB: { lat: 25.5721, lng: 91.8752, name: 'Bara Bazar / Iewduh' },
  CH: { lat: 25.5653, lng: 91.8795, name: 'Civil Hospital' },
  WL: { lat: 25.5714, lng: 91.8856, name: 'Ward\'s Lake' },
  GL: { lat: 25.5888, lng: 91.8967, name: 'Golf Links' },
  MP: { lat: 25.6022, lng: 91.9189, name: 'Mawpat' }
};

// Seed dataset
const SEED_ORDERS: Order[] = [
  { id: 'ORD-101', customer: 'Mawlai Medical Sub-Center', pickup: 'Civil Hospital', pickupCoords: LANDMARKS.CH, destination: 'Mawlai', destinationCoords: LANDMARKS.ML, priority: 'High', weight: 450, timeWindow: '08:00 - 11:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Poor Surface'], createdTime: '2026-08-21T08:30:00Z' },
  { id: 'ORD-102', customer: 'Polo Welfare Coop', pickup: 'Police Bazar', pickupCoords: LANDMARKS.PB, destination: 'Polo', destinationCoords: LANDMARKS.PL, priority: 'Normal', weight: 120, timeWindow: '09:00 - 13:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Wheelchair Accessible'], createdTime: '2026-08-21T09:00:00Z' },
  { id: 'ORD-103', customer: 'Nehu Student Mess', pickup: 'Bara Bazar / Iewduh', pickupCoords: LANDMARKS.BB, destination: 'NEHU', destinationCoords: LANDMARKS.NH, priority: 'High', weight: 620, timeWindow: '10:00 - 12:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Low-Floor Vehicle Required'], createdTime: '2026-08-21T09:15:00Z' },
  { id: 'ORD-104', customer: 'Upper Shillong Agri Hub', pickup: 'Laitumkhrah', pickupCoords: LANDMARKS.LK, destination: 'Upper Shillong', destinationCoords: LANDMARKS.US, priority: 'Normal', weight: 80, timeWindow: '11:00 - 15:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Very Steep Sections'], createdTime: '2026-08-21T09:40:00Z' },
  { id: 'ORD-105', customer: 'Laban Community Hall', pickup: 'Civil Hospital', pickupCoords: LANDMARKS.CH, destination: 'Laban', destinationCoords: LANDMARKS.LB, priority: 'Emergency', weight: 350, timeWindow: '10:00 - 11:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Wheelchair Accessible', 'Avoid Stairs'], createdTime: '2026-08-21T10:02:00Z' },
  { id: 'ORD-106', customer: 'Umpling Block Office', pickup: 'Rynjah', pickupCoords: LANDMARKS.RJ, destination: 'Umpling', destinationCoords: LANDMARKS.UP, priority: 'Normal', weight: 280, timeWindow: '13:00 - 17:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Poor Surface'], createdTime: '2026-08-21T10:15:00Z' },
  { id: 'ORD-107', customer: 'Laitumkhrah Retailers', pickup: 'Police Bazar', pickupCoords: LANDMARKS.PB, destination: 'Laitumkhrah', destinationCoords: LANDMARKS.LK, priority: 'Normal', weight: 15, timeWindow: '12:00 - 16:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: [], createdTime: '2026-08-21T10:30:00Z' },
  { id: 'ORD-108', customer: 'Peak View Resort', pickup: 'Upper Shillong', pickupCoords: LANDMARKS.US, destination: 'Shillong Peak', destinationCoords: LANDMARKS.SP, priority: 'Normal', weight: 510, timeWindow: '11:00 - 14:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Very Steep Sections'], createdTime: '2026-08-21T10:35:00Z' },
  { id: 'ORD-109', customer: 'Malki Health Post', pickup: 'Civil Hospital', pickupCoords: LANDMARKS.CH, destination: 'Malki', destinationCoords: LANDMARKS.MK, priority: 'High', weight: 180, timeWindow: '11:30 - 13:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Wheelchair Accessible', 'Avoid Stairs'], createdTime: '2026-08-21T10:40:00Z' },
  { id: 'ORD-110', customer: 'Mawpat School Dist', pickup: 'Golf Links', pickupCoords: LANDMARKS.GL, destination: 'Mawpat', destinationCoords: LANDMARKS.MP, priority: 'Normal', weight: 90, timeWindow: '12:00 - 16:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Low-Floor Vehicle Required'], createdTime: '2026-08-21T10:45:00Z' },
  // 15 additional order objects for a total of 25 seeds
  { id: 'ORD-111', customer: 'Bara Bazar wholesale', pickup: 'Polo', pickupCoords: LANDMARKS.PL, destination: 'Bara Bazar / Iewduh', destinationCoords: LANDMARKS.BB, priority: 'Normal', weight: 750, timeWindow: '13:00 - 17:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Narrow Route'], createdTime: '2026-08-21T10:50:00Z' },
  { id: 'ORD-112', customer: 'Nongthymmai Library', pickup: 'Laitumkhrah', pickupCoords: LANDMARKS.LK, destination: 'Nongthymmai', destinationCoords: LANDMARKS.NT, priority: 'Normal', weight: 45, timeWindow: '14:00 - 18:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Wheelchair Accessible'], createdTime: '2026-08-21T10:55:00Z' },
  { id: 'ORD-113', customer: 'Pine Hill Clinic', pickup: 'Police Bazar', pickupCoords: LANDMARKS.PB, destination: 'Upper Shillong', destinationCoords: LANDMARKS.US, priority: 'Emergency', weight: 210, timeWindow: '11:00 - 12:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Low-Floor Vehicle Required', 'Avoid Very Steep Sections'], createdTime: '2026-08-21T11:00:00Z' },
  { id: 'ORD-114', customer: 'Rynjah Stationers', pickup: 'Nongthymmai', pickupCoords: LANDMARKS.NT, destination: 'Rynjah', destinationCoords: LANDMARKS.RJ, priority: 'Normal', weight: 65, timeWindow: '15:00 - 19:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: [], createdTime: '2026-08-21T11:05:00Z' },
  { id: 'ORD-115', customer: 'NEHU Library', pickup: 'Golf Links', pickupCoords: LANDMARKS.GL, destination: 'NEHU', destinationCoords: LANDMARKS.NH, priority: 'Normal', weight: 300, timeWindow: '10:00 - 14:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Wheelchair Accessible'], createdTime: '2026-08-21T11:10:00Z' },
  { id: 'ORD-116', customer: 'Umpling Market Assoc', pickup: 'Police Bazar', pickupCoords: LANDMARKS.PB, destination: 'Umpling', destinationCoords: LANDMARKS.UP, priority: 'Normal', weight: 400, timeWindow: '12:00 - 15:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Poor Surface'], createdTime: '2026-08-21T11:15:00Z' },
  { id: 'ORD-117', customer: 'Ward\'s Lake Café', pickup: 'Police Bazar', pickupCoords: LANDMARKS.PB, destination: 'Ward\'s Lake', destinationCoords: LANDMARKS.WL, priority: 'Normal', weight: 35, timeWindow: '12:00 - 14:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Wheelchair Accessible'], createdTime: '2026-08-21T11:20:00Z' },
  { id: 'ORD-118', customer: 'Civil Hosp Pharmacy', pickup: 'Bara Bazar / Iewduh', pickupCoords: LANDMARKS.BB, destination: 'Civil Hospital', destinationCoords: LANDMARKS.CH, priority: 'High', weight: 180, timeWindow: '12:00 - 14:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Low-Floor Vehicle Required'], createdTime: '2026-08-21T11:25:00Z' },
  { id: 'ORD-119', customer: 'Mawpat Community Ctr', pickup: 'Police Bazar', pickupCoords: LANDMARKS.PB, destination: 'Mawpat', destinationCoords: LANDMARKS.MP, priority: 'Normal', weight: 85, timeWindow: '13:00 - 16:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Wheelchair Accessible'], createdTime: '2026-08-21T11:30:00Z' },
  { id: 'ORD-120', customer: 'Laban Bakery', pickup: 'Malki', pickupCoords: LANDMARKS.MK, destination: 'Laban', destinationCoords: LANDMARKS.LB, priority: 'Normal', weight: 75, timeWindow: '14:00 - 16:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: [], createdTime: '2026-08-21T11:35:00Z' },
  { id: 'ORD-121', customer: 'Rynjah Grocer', pickup: 'Polo', pickupCoords: LANDMARKS.PL, destination: 'Rynjah', destinationCoords: LANDMARKS.RJ, priority: 'Normal', weight: 220, timeWindow: '15:00 - 18:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Poor Surface'], createdTime: '2026-08-21T11:40:00Z' },
  { id: 'ORD-122', customer: 'Shillong Peak Eco Camp', pickup: 'Civil Hospital', pickupCoords: LANDMARKS.CH, destination: 'Shillong Peak', destinationCoords: LANDMARKS.SP, priority: 'High', weight: 350, timeWindow: '14:00 - 16:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Very Steep Sections'], createdTime: '2026-08-21T11:45:00Z' },
  { id: 'ORD-123', customer: 'Mawlai Handloom', pickup: 'Bara Bazar / Iewduh', pickupCoords: LANDMARKS.BB, destination: 'Mawlai', destinationCoords: LANDMARKS.ML, priority: 'Normal', weight: 140, timeWindow: '15:00 - 17:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: ['Avoid Narrow Route'], createdTime: '2026-08-21T11:50:00Z' },
  { id: 'ORD-124', customer: 'Nongthymmai Sports', pickup: 'Polo', pickupCoords: LANDMARKS.PL, destination: 'Nongthymmai', destinationCoords: LANDMARKS.NT, priority: 'Normal', weight: 95, timeWindow: '16:00 - 18:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: [], createdTime: '2026-08-21T11:55:00Z' },
  { id: 'ORD-125', customer: 'Polo Gym Supplies', pickup: 'Police Bazar', pickupCoords: LANDMARKS.PB, destination: 'Polo', destinationCoords: LANDMARKS.PL, priority: 'Normal', weight: 500, timeWindow: '16:00 - 18:00', status: 'Pending', routeRisk: 0, eta: 0, accessibilityRequirements: [], createdTime: '2026-08-21T12:00:00Z' }
];

const SEED_VEHICLES: Vehicle[] = [
  { id: 'VN-001', name: 'Pine Delivery Bike 1', type: 'Delivery Bike', capacity: 40, load: 0, groundClearance: 140, hillSuitability: 'Moderate', narrowRoadSuitability: 'Excellent', fuelCharge: 88, accessibilityCapability: 'Standard', status: 'Available', lat: 25.5732, lng: 91.8821, driverName: 'J. Kharbuli' },
  { id: 'VN-002', name: 'Shillong Eco-Van 1', type: 'Electric Van', capacity: 600, load: 0, groundClearance: 170, hillSuitability: 'Good', narrowRoadSuitability: 'Good', fuelCharge: 79, accessibilityCapability: 'Ramp', status: 'Available', lat: 25.5684, lng: 91.8988, driverName: 'D. Syiem' },
  { id: 'VN-003', name: 'Mountain 4x4 Utility 1', type: '4x4 Utility Vehicle', capacity: 1000, load: 0, groundClearance: 220, hillSuitability: 'Excellent', narrowRoadSuitability: 'Moderate', fuelCharge: 95, accessibilityCapability: 'Standard', status: 'Available', lat: 25.5653, lng: 91.8795, driverName: 'R. Lyngdoh' },
  { id: 'VN-004', name: 'Accessible Transit 1', type: 'Accessible Mobility Vehicle', capacity: 400, load: 0, groundClearance: 160, hillSuitability: 'Good', narrowRoadSuitability: 'Good', fuelCharge: 92, accessibilityCapability: 'Wheelchair Lift', status: 'Available', lat: 25.5714, lng: 91.8856, driverName: 'A. Marwein' },
  { id: 'VN-005', name: 'Cherra Mini-Truck 1', type: 'Mini Truck', capacity: 1500, load: 0, groundClearance: 190, hillSuitability: 'Good', narrowRoadSuitability: 'Moderate', fuelCharge: 60, accessibilityCapability: 'Standard', status: 'Available', lat: 25.5831, lng: 91.8879, driverName: 'L. Sohkhlet' },
  { id: 'VN-006', name: 'Himalayan Cargo 1', type: 'Medium Truck', capacity: 3500, load: 0, groundClearance: 240, hillSuitability: 'Moderate', narrowRoadSuitability: 'Poor', fuelCharge: 70, accessibilityCapability: 'Standard', status: 'Available', lat: 25.5721, lng: 91.8752, driverName: 'S. Mukhim' },
  { id: 'VN-007', name: 'Pine Delivery Bike 2', type: 'Delivery Bike', capacity: 40, load: 0, groundClearance: 145, hillSuitability: 'Moderate', narrowRoadSuitability: 'Excellent', fuelCharge: 65, accessibilityCapability: 'Standard', status: 'Available', lat: 25.5587, lng: 91.9080, driverName: 'P. Nongrum' },
  { id: 'VN-008', name: 'Shillong Eco-Van 2', type: 'Electric Van', capacity: 600, load: 0, groundClearance: 165, hillSuitability: 'Good', narrowRoadSuitability: 'Good', fuelCharge: 42, accessibilityCapability: 'Ramp', status: 'Available', lat: 25.5991, lng: 91.8762, driverName: 'B. Warjri' },
  { id: 'VN-009', name: 'Mountain 4x4 Utility 2', type: '4x4 Utility Vehicle', capacity: 1000, load: 0, groundClearance: 220, hillSuitability: 'Excellent', narrowRoadSuitability: 'Moderate', fuelCharge: 83, accessibilityCapability: 'Standard', status: 'Offline', lat: 25.5392, lng: 91.8493, driverName: 'T. Mawlong' },
  { id: 'VN-010', name: 'Accessible Transit 2', type: 'Accessible Mobility Vehicle', capacity: 400, load: 0, groundClearance: 160, hillSuitability: 'Good', narrowRoadSuitability: 'Good', fuelCharge: 88, accessibilityCapability: 'Wheelchair Lift', status: 'Offline', lat: 25.6125, lng: 91.8996, driverName: 'K. Rymbai' },
  { id: 'VN-011', name: 'Cherra Mini-Truck 2', type: 'Mini Truck', capacity: 1500, load: 0, groundClearance: 195, hillSuitability: 'Good', narrowRoadSuitability: 'Moderate', fuelCharge: 91, accessibilityCapability: 'Standard', status: 'Available', lat: 25.5709, lng: 91.9213, driverName: 'G. Laitmon' },
  { id: 'VN-012', name: 'Himalayan Cargo 2', type: 'Medium Truck', capacity: 3500, load: 0, groundClearance: 240, hillSuitability: 'Moderate', narrowRoadSuitability: 'Poor', fuelCharge: 55, accessibilityCapability: 'Standard', status: 'Maintenance', lat: 25.5802, lng: 91.9234, driverName: 'N. Swer' }
];

const SEED_ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  { id: 'ACC-201', locationName: 'Police Bazar Crossing', coords: { lat: 25.5735, lng: 91.8824 }, type: 'accessible crossing', score: 95, confidence: 95, lastVerified: '2026-08-15', source: 'Government Dataset', reportsCount: 0, verifiedStatus: 'Verified', description: 'Fully paved pedestrian crossing with auditory cues and tactile indicators.' },
  { id: 'ACC-202', locationName: 'Laitumkhrah Plaza Ramp', coords: { lat: 25.5689, lng: 91.8993 }, type: 'ramp', score: 90, confidence: 85, lastVerified: '2026-08-18', source: 'OpenStreetMap', reportsCount: 1, verifiedStatus: 'Verified', description: 'Modern steel ramp with optimal 1:12 slope and handrails.' },
  { id: 'ACC-203', locationName: 'Mawlai Bazar Entry Steps', coords: { lat: 25.5996, lng: 91.8767 }, type: 'stairs', score: 20, confidence: 88, lastVerified: '2026-08-10', source: 'OpenStreetMap', reportsCount: 0, verifiedStatus: 'Verified', description: 'Steep concrete flight of 12 steps without alternate ramp access.' },
  { id: 'ACC-204', locationName: 'Upper Shillong Forest Link', coords: { lat: 25.5412, lng: 91.8505 }, type: 'steep slope', score: 35, confidence: 75, lastVerified: '2026-08-20', source: 'Driver Report', reportsCount: 2, verifiedStatus: 'Verified', description: 'Gravel roadway with a steep incline (>12%) causing vehicle slip.' },
  { id: 'ACC-205', locationName: 'Bara Bazar Narrow Pathway', coords: { lat: 25.5724, lng: 91.8748 }, type: 'poor surface', score: 40, confidence: 60, lastVerified: '2026-08-14', source: 'User Report', reportsCount: 3, verifiedStatus: 'Verified', description: 'Uneven cobblestone surfacing with multiple open drains. Impassable for low-floor vans.' },
  { id: 'ACC-206', locationName: 'Ward\'s Lake Gate 2', coords: { lat: 25.5719, lng: 91.8860 }, type: 'wheelchair accessible', score: 95, confidence: 95, lastVerified: '2026-08-12', source: 'Government Dataset', reportsCount: 0, verifiedStatus: 'Verified', description: 'Wheelchair-friendly turnstile and low-gradient entry ramp.' },
  { id: 'ACC-207', locationName: 'Polo Junction Walkway', coords: { lat: 25.5828, lng: 91.8884 }, type: 'accessible crossing', score: 90, confidence: 85, lastVerified: '2026-08-19', source: 'OpenStreetMap', reportsCount: 1, verifiedStatus: 'Verified', description: 'Tactile paving installed on pedestrian sidewalk curves.' },
  { id: 'ACC-208', locationName: 'Malki Lane Steps', coords: { lat: 25.5608, lng: 91.8872 }, type: 'stairs', score: 15, confidence: 80, lastVerified: '2026-08-08', source: 'OpenStreetMap', reportsCount: 0, verifiedStatus: 'Verified', description: 'Narrow concrete staircase linking upper and lower residential lanes.' },
  { id: 'ACC-209', locationName: 'Laban Stream Bridge Path', coords: { lat: 25.5579, lng: 91.8737 }, type: 'poor surface', score: 45, confidence: 70, lastVerified: '2026-08-17', source: 'Driver Report', reportsCount: 1, verifiedStatus: 'Verified', description: 'Potholed approach road to local footbridge, slippery when wet.' },
  { id: 'ACC-210', locationName: 'Rynjah Post Office Entry', coords: { lat: 25.5712, lng: 91.9218 }, type: 'ramp', score: 85, confidence: 75, lastVerified: '2026-08-21', source: 'User Report', reportsCount: 2, verifiedStatus: 'Verified', description: 'Tiled brick wheelchair ramp at entry gate.' },
  // Remaining 20 features for a total of 30 features
  { id: 'ACC-211', locationName: 'Umpling Market Corner', coords: { lat: 25.5806, lng: 91.9238 }, type: 'poor surface', score: 50, confidence: 65, lastVerified: '2026-08-16', source: 'User Report', reportsCount: 2, verifiedStatus: 'Verified', description: 'Broken concrete sidewalk.' },
  { id: 'ACC-212', locationName: 'Golf Links Main Circle', coords: { lat: 25.5891, lng: 91.8971 }, type: 'wheelchair accessible', score: 95, confidence: 85, lastVerified: '2026-08-11', source: 'OpenStreetMap', reportsCount: 1, verifiedStatus: 'Verified', description: 'Wide level grass and asphalt pathway.' },
  { id: 'ACC-213', locationName: 'Mawpat Junction Ramp', coords: { lat: 25.6025, lng: 91.9192 }, type: 'ramp', score: 90, confidence: 90, lastVerified: '2026-08-14', source: 'Government Dataset', reportsCount: 0, verifiedStatus: 'Verified', description: 'Graded accessibility curb.' },
  { id: 'ACC-214', locationName: 'NEHU Admin Block Gates', coords: { lat: 25.6129, lng: 91.8999 }, type: 'wheelchair accessible', score: 95, confidence: 95, lastVerified: '2026-08-01', source: 'Government Dataset', reportsCount: 0, verifiedStatus: 'Verified', description: 'Automatic sensory glass double doors.' },
  { id: 'ACC-215', locationName: 'Shillong Peak Footpath', coords: { lat: 25.5319, lng: 91.8658 }, type: 'steep slope', score: 30, confidence: 80, lastVerified: '2026-08-19', source: 'OpenStreetMap', reportsCount: 0, verifiedStatus: 'Verified', description: 'Climbing walk path with slope exceeding 14%.' },
  { id: 'ACC-216', locationName: 'Police Bazar Plaza Stairs', coords: { lat: 25.5729, lng: 91.8818 }, type: 'stairs', score: 25, confidence: 90, lastVerified: '2026-08-02', source: 'OpenStreetMap', reportsCount: 0, verifiedStatus: 'Verified', description: 'Step series leading to lower shopping arcade.' },
  { id: 'ACC-217', locationName: 'Laitumkhrah Post Office Crossing', coords: { lat: 25.5681, lng: 91.8984 }, type: 'accessible crossing', score: 90, confidence: 80, lastVerified: '2026-08-20', source: 'Driver Report', reportsCount: 1, verifiedStatus: 'Verified', description: 'Equipped with push-button indicator cues.' },
  { id: 'ACC-218', locationName: 'Mawlai Bypass Cutoff', coords: { lat: 25.5988, lng: 91.8758 }, type: 'poor surface', score: 55, confidence: 70, lastVerified: '2026-08-15', source: 'Driver Report', reportsCount: 2, verifiedStatus: 'Verified', description: 'Eroded road margins with gravel spill.' },
  { id: 'ACC-219', locationName: 'Nongthymmai Market Steps', coords: { lat: 25.5583, lng: 91.9076 }, type: 'stairs', score: 20, confidence: 75, lastVerified: '2026-08-17', source: 'User Report', reportsCount: 3, verifiedStatus: 'Verified', description: 'Six uneven stone steps with no handrails.' },
  { id: 'ACC-220', locationName: 'Upper Shillong High Road Corner', coords: { lat: 25.5388, lng: 91.8489 }, type: 'ramp', score: 85, confidence: 85, lastVerified: '2026-08-11', source: 'OpenStreetMap', reportsCount: 1, verifiedStatus: 'Verified', description: 'Concrete ramp at bus terminal.' },
  { id: 'ACC-221', locationName: 'Malki Playground Ramp', coords: { lat: 25.5615, lng: 91.8878 }, type: 'ramp', score: 90, confidence: 90, lastVerified: '2026-08-03', source: 'Government Dataset', reportsCount: 0, verifiedStatus: 'Verified', description: 'Verified ramp access.' },
  { id: 'ACC-222', locationName: 'Laban Church Steps', coords: { lat: 25.5586, lng: 91.8744 }, type: 'stairs', score: 20, confidence: 85, lastVerified: '2026-08-10', source: 'OpenStreetMap', reportsCount: 0, verifiedStatus: 'Verified', description: 'Front stone steps leading to main entrance.' },
  { id: 'ACC-223', locationName: 'Rynjah Bazar Pedestrian Lane', coords: { lat: 25.5705, lng: 91.9209 }, type: 'wheelchair accessible', score: 80, confidence: 75, lastVerified: '2026-08-16', source: 'User Report', reportsCount: 2, verifiedStatus: 'Verified', description: 'Flat paved lane.' },
  { id: 'ACC-224', locationName: 'Umpling River Lane', coords: { lat: 25.5798, lng: 91.9230 }, type: 'steep slope', score: 40, confidence: 60, lastVerified: '2026-08-14', source: 'Driver Report', reportsCount: 1, verifiedStatus: 'Verified', description: 'Very steep descent to water line.' },
  { id: 'ACC-225', locationName: 'Bara Bazar Main Gate Ramp', coords: { lat: 25.5717, lng: 91.8756 }, type: 'ramp', score: 85, confidence: 85, lastVerified: '2026-08-09', source: 'OpenStreetMap', reportsCount: 0, verifiedStatus: 'Verified', description: 'Concrete ramp leading to retail market.' },
  { id: 'ACC-226', locationName: 'Civil Hospital Main Exit', coords: { lat: 25.5650, lng: 91.8791 }, type: 'wheelchair accessible', score: 95, confidence: 95, lastVerified: '2026-08-15', source: 'Government Dataset', reportsCount: 0, verifiedStatus: 'Verified', description: 'Touchless entry automatic gate.' },
  { id: 'ACC-227', locationName: 'Golf Links Tourist Gate', coords: { lat: 25.5885, lng: 91.8963 }, type: 'ramp', score: 90, confidence: 80, lastVerified: '2026-08-19', source: 'Driver Report', reportsCount: 1, verifiedStatus: 'Verified', description: 'Newly built ramp.' },
  { id: 'ACC-228', locationName: 'Mawpat Community Well Path', coords: { lat: 25.6018, lng: 91.9185 }, type: 'poor surface', score: 35, confidence: 55, lastVerified: '2026-08-12', source: 'User Report', reportsCount: 4, verifiedStatus: 'Verified', description: 'Unpaved mud lane.' },
  { id: 'ACC-229', locationName: 'NEHU Guest House Gate', coords: { lat: 25.6121, lng: 91.8992 }, type: 'wheelchair accessible', score: 90, confidence: 85, lastVerified: '2026-08-07', source: 'OpenStreetMap', reportsCount: 1, verifiedStatus: 'Verified', description: 'Accessible double wide gates.' },
  { id: 'ACC-230', locationName: 'Police Bazar Lower Crossing', coords: { lat: 25.5739, lng: 91.8828 }, type: 'accessible crossing', score: 80, confidence: 80, lastVerified: '2026-08-20', source: 'System Inference', reportsCount: 0, verifiedStatus: 'Verified', description: 'Inferred crossing indicators.' }
];

const SEED_INCIDENTS: Incident[] = [
  { id: 'INC-301', locationName: 'Upper Shillong Highway Section', coords: { lat: 25.5398, lng: 91.8499 }, type: 'Landslide', severity: 'Critical', status: 'Active', reportedTime: '2026-08-21T18:10:00Z', source: 'Government Feed', confidence: 95, description: 'Landslip triggered by heavy rainfall. Debris covering two lanes. Clearance team dispatched.' },
  { id: 'INC-302', locationName: 'Police Bazar Junction', coords: { lat: 25.5731, lng: 91.8820 }, type: 'Traffic Congestion', severity: 'High', status: 'Active', reportedTime: '2026-08-21T21:30:00Z', source: 'AI Detection', confidence: 85, description: 'Extremely high congestion due to tourist rush and commercial parking.' },
  { id: 'INC-303', locationName: 'Umpling Bridge approach', coords: { lat: 25.5804, lng: 91.9236 }, type: 'Road Damage', severity: 'Moderate', status: 'Active', reportedTime: '2026-08-21T20:15:00Z', source: 'Driver Report', confidence: 75, description: 'Deep structural pothole on bridge expansion joint, vehicles must slow down.' },
  { id: 'INC-304', locationName: 'Polo Market Link', coords: { lat: 25.5835, lng: 91.8885 }, type: 'Road Closure', severity: 'High', status: 'Active', reportedTime: '2026-08-21T22:00:00Z', source: 'Operator', confidence: 98, description: 'Local road resurfacing by Meghalaya PWD. Road closed to all light vehicles.' },
  { id: 'INC-305', locationName: 'Mawlai Highway Link', coords: { lat: 25.5995, lng: 91.8765 }, type: 'Heavy Rain', severity: 'High', status: 'Active', reportedTime: '2026-08-21T22:30:00Z', source: 'Demo Sensor Feed', confidence: 90, description: 'Severe local thunderstorm, pooling water, visibility reduced to less than 10 meters.' }
];

const SEED_ZONES: Zone[] = [
  { id: 'Z-1', name: 'Police Bazar / Iewduh (Commercial Core)', trafficLevel: 'Poor', terrainRisk: 15, accessibilityScore: 78, confidenceScore: 92, roadReliability: 'Good', primaryChallenge: 'Heavy pedestrian congestion, narrow shop entries, and dense traffic' },
  { id: 'Z-2', name: 'Laitumkhrah / Malki (Institutional Belt)', trafficLevel: 'Moderate', terrainRisk: 30, accessibilityScore: 82, confidenceScore: 88, roadReliability: 'Good', primaryChallenge: 'Steep topography, steps joining lanes, and parking constraints' },
  { id: 'Z-3', name: 'Mawlai (Northern Extension)', trafficLevel: 'Moderate', terrainRisk: 45, accessibilityScore: 55, confidenceScore: 70, roadReliability: 'Moderate', primaryChallenge: 'Damaged side paths, high-slope feeder alleys, and unpaved segments' },
  { id: 'Z-4', name: 'Nongthymmai / Rynjah (Eastern Suburbs)', trafficLevel: 'Good', terrainRisk: 25, accessibilityScore: 70, confidenceScore: 80, roadReliability: 'Good', primaryChallenge: 'Umpling river bridge dependency, narrow local link lanes' },
  { id: 'Z-5', name: 'Upper Shillong (High Elevation Sector)', trafficLevel: 'Good', terrainRisk: 65, accessibilityScore: 68, confidenceScore: 82, roadReliability: 'Moderate', primaryChallenge: 'Frequent landslide susceptibility, heavy cloud fog, and steep highway passes' },
  { id: 'Z-6', name: 'NEHU / Mawpat (Knowledge City)', trafficLevel: 'Excellent', terrainRisk: 20, accessibilityScore: 90, confidenceScore: 95, roadReliability: 'Excellent', primaryChallenge: 'Wide arterial roads, high accessibility layouts, low vehicle density' }
];

const SEED_REGIONS: RegionState[] = [
  { id: 'Meghalaya', name: 'Meghalaya (Shillong)', coverage: 82, reliability: 89, disruptionsCount: 5, lowConfidenceZonesCount: 2, terrainChallenges: ['Steep slopes (>12%)', 'High landslide vulnerability', 'Bridge-dependent segments'] },
  { id: 'Assam', name: 'Assam (Dispur/Guwahati)', coverage: 65, reliability: 82, disruptionsCount: 12, lowConfidenceZonesCount: 6, terrainChallenges: ['Severe seasonal flooding', 'Brahmaputra bridge bottle-necks', 'Dense urban traffic'] },
  { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh (Itanagar)', coverage: 25, reliability: 55, disruptionsCount: 8, lowConfidenceZonesCount: 15, terrainChallenges: ['Extreme alpine inclines', 'Massive landslide cuts', 'Extremely sparse network paths'] },
  { id: 'Nagaland', name: 'Nagaland (Kohima)', coverage: 38, reliability: 62, disruptionsCount: 4, lowConfidenceZonesCount: 8, terrainChallenges: ['Highly unstable clay soil', 'Damaged municipal roadways', 'Narrow mountain curves'] },
  { id: 'Manipur', name: 'Manipur (Imphal)', coverage: 42, reliability: 58, disruptionsCount: 9, lowConfidenceZonesCount: 7, terrainChallenges: ['Valley ring road constraints', 'Intermittent road blocks', 'Sparse charging stations'] },
  { id: 'Mizoram', name: 'Mizoram (Aizawl)', coverage: 30, reliability: 50, disruptionsCount: 3, lowConfidenceZonesCount: 11, terrainChallenges: ['Ridge-top road networks', 'Very steep grades (>15%)', 'Severe last-mile slopes'] },
  { id: 'Tripura', name: 'Tripura (Agartala)', coverage: 50, reliability: 70, disruptionsCount: 6, lowConfidenceZonesCount: 4, terrainChallenges: ['Monsoon mud logging', 'Border logistics checks', 'Secondary network gaps'] },
  { id: 'Sikkim', name: 'Sikkim (Gangtok)', coverage: 45, reliability: 65, disruptionsCount: 4, lowConfidenceZonesCount: 9, terrainChallenges: ['Teesta river valley landslide cuts', 'Heavy winter snow', 'Strict weight limits'] }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-801',
    timestamp: '2026-08-21T14:32:07Z',
    orderId: 'ORD-101',
    origin: 'Civil Hospital',
    destination: 'Mawlai',
    vehicleId: 'VN-002',
    selectedRouteName: 'AI Recommended Route',
    routesEvaluated: [
      { name: 'Fastest Route', eta: 14, distance: 4.8, accessibilityScore: 52, terrainRisk: 65, confidence: 68, roadReliability: 'Poor', finalScore: 61 },
      { name: 'Safest / Most Accessible', eta: 22, distance: 5.6, accessibilityScore: 88, terrainRisk: 18, confidence: 85, roadReliability: 'Excellent', finalScore: 84 },
      { name: 'AI Recommended Route', eta: 17, distance: 5.1, accessibilityScore: 82, terrainRisk: 24, confidence: 82, roadReliability: 'Good', finalScore: 87 }
    ],
    weights: { eta: 30, cost: 15, accessibility: 20, terrain: 15, reliability: 10, confidence: 10 },
    explanation: 'AI Recommended Route selected because it avoids the high-slope Mawlai bypass link that has active road works. It adds 3 minutes over the fastest path but improves the accessibility index from 52 to 82 while cutting terrain risk by 41 points.',
    humanOverride: false
  },
  {
    id: 'AUD-802',
    timestamp: '2026-08-21T15:10:45Z',
    orderId: 'ORD-103',
    origin: 'Bara Bazar / Iewduh',
    destination: 'NEHU',
    vehicleId: 'VN-006',
    selectedRouteName: 'Fastest Route',
    routesEvaluated: [
      { name: 'Fastest Route', eta: 25, distance: 8.2, accessibilityScore: 78, terrainRisk: 15, confidence: 90, roadReliability: 'Good', finalScore: 85 },
      { name: 'Safest / Most Accessible', eta: 31, distance: 10.1, accessibilityScore: 92, terrainRisk: 10, confidence: 92, roadReliability: 'Excellent', finalScore: 78 }
    ],
    weights: { eta: 60, cost: 5, accessibility: 5, terrain: 15, reliability: 10, confidence: 5 },
    explanation: 'Fastest route was chosen due to Emergency Priority flag. It maintains high speed along the main bypass highway despite adding mild congestion risk.',
    humanOverride: true,
    overrideReason: 'Driver Local Knowledge'
  }
];

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  activeTab: 'overview',
  regionSelector: 'Meghalaya',

  // Database
  orders: SEED_ORDERS,
  vehicles: SEED_VEHICLES,
  incidents: SEED_INCIDENTS,
  accessibilityFeatures: SEED_ACCESSIBILITY_FEATURES,
  zones: SEED_ZONES,
  auditLogs: SEED_AUDIT_LOGS,
  regions: SEED_REGIONS,

  // Routing state
  selectedOrder: null,
  selectedVehicle: null,
  activeRouteOptions: [],
  selectedRouteId: null,
  previousRouteOption: null,
  showRerouteAlert: false,
  optimizationPreference: 'Balanced',
  customSliders: { eta: 30, cost: 15, accessibility: 20, terrain: 15, reliability: 10, confidence: 10 },
  regionalConstraints: ['Avoid Landslide Risk', 'Prefer Main Roads'],
  isOptimizing: false,
  optimizationLogs: [],

  // Simulation
  isSimulating: false,
  simulationSpeed: 1,
  rainSimulationActive: false,

  // Demo
  demoActive: false,
  demoStep: 1,
  demoSteps: [
    { title: 'New Delivery Request', desc: 'Select a priority cargo order bound for NEHU and assign the Electric Van.', completed: false },
    { title: 'AI Route Evaluation', desc: 'Trigger route optimization. Compare details of the 3 path calculations.', completed: false },
    { title: 'Balanced Route Selection', desc: 'AI recommends Route C because it bypasses steep landslide risks.', completed: false },
    { title: 'Simulate Landslide Blockage', desc: 'Trigger a regional landslide blockage on the active segment.', completed: false },
    { title: 'Observe Automatic Rerouting', desc: 'Neural Nexus instantly intercepts, fires alarms, and selects the new path.', completed: false },
    { title: 'Submit Ground Report', desc: 'Submit citizen report of road damage to update the local GIS map.', completed: false },
    { title: 'Refine Regional Intelligence', desc: 'Verify how user feedback updates routing metrics and audit logs.', completed: false }
  ],

  // UI state
  architectureModalOpen: false,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setRegionSelector: (region) => set({ regionSelector: region }),
  setOptimizationPreference: (pref) => set({ optimizationPreference: pref }),
  setCustomSliders: (sliders) => set((state) => ({ customSliders: { ...state.customSliders, ...sliders } })),
  toggleRegionalConstraint: (constraint) => set((state) => {
    const list = state.regionalConstraints.includes(constraint)
      ? state.regionalConstraints.filter((c) => c !== constraint)
      : [...state.regionalConstraints, constraint];
    return { regionalConstraints: list };
  }),

  addOrder: (order) => set((state) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${100 + state.orders.length + 1}`,
      createdTime: new Date().toISOString(),
      status: 'Pending',
      routeRisk: 0,
      eta: 0
    };
    return { orders: [newOrder, ...state.orders] };
  }),

  editOrder: (updatedOrder) => set((state) => ({
    orders: state.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
  })),

  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id),
    selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder
  })),

  assignVehicleToOrder: (orderId, vehicleId) => set((state) => {
    const v = state.vehicles.find((veh) => veh.id === vehicleId);
    if (!v) return {};
    
    const updatedOrders = state.orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, assignedVehicleId: vehicleId, status: 'Assigned' as OrderStatus };
      }
      return o;
    });

    const updatedVehicles = state.vehicles.map((veh) => {
      if (veh.id === vehicleId) {
        return { ...veh, status: 'Delivering' as VehicleStatus };
      }
      return veh;
    });

    const o = updatedOrders.find((ord) => ord.id === orderId);

    return {
      orders: updatedOrders,
      vehicles: updatedVehicles,
      selectedOrder: state.selectedOrder?.id === orderId ? o : state.selectedOrder,
      selectedVehicle: state.selectedVehicle?.id === vehicleId ? v : state.selectedVehicle
    };
  }),

  addVehicle: (vehicle) => set((state) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `VN-${String(state.vehicles.length + 1).padStart(3, '0')}`,
      status: 'Available',
      load: 0,
      lat: LANDMARKS.PB.lat + (Math.random() - 0.5) * 0.02,
      lng: LANDMARKS.PB.lng + (Math.random() - 0.5) * 0.02
    };
    return { vehicles: [...state.vehicles, newVehicle] };
  }),

  editVehicle: (updatedVehicle) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
  })),

  toggleVehicleStatus: (id, status) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, status } : v))
  })),

  addIncident: (incident) => set((state) => {
    const newIncident: Incident = {
      ...incident,
      id: `INC-${300 + state.incidents.length + 1}`,
      reportedTime: new Date().toISOString(),
      status: 'Active'
    };
    
    // Add audit entry
    const audit: AuditLog = {
      id: `AUD-${800 + state.auditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      orderId: 'SYSTEM',
      origin: 'INCIDENT_FEED',
      destination: 'MAP_OVERLAY',
      vehicleId: 'SYSTEM',
      selectedRouteName: 'None',
      routesEvaluated: [],
      weights: { eta: 0, cost: 0, accessibility: 0, terrain: 0, reliability: 0, confidence: 0 },
      triggeringEvent: `New Incident: ${incident.type}`,
      explanation: `System registered a ${incident.severity} severity ${incident.type} at ${incident.locationName}. Active routing logs flagged.`,
      humanOverride: false
    };

    return { 
      incidents: [newIncident, ...state.incidents],
      auditLogs: [audit, ...state.auditLogs]
    };
  }),

  resolveIncident: (id) => set((state) => {
    const incident = state.incidents.find((i) => i.id === id);
    if (!incident) return {};
    
    const updatedIncidents = state.incidents.map((inc) => 
      inc.id === id ? { ...inc, status: 'Resolved' as IncidentStatus } : inc
    );

    const audit: AuditLog = {
      id: `AUD-${800 + state.auditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      orderId: 'SYSTEM',
      origin: 'INCIDENT_FEED',
      destination: 'MAP_OVERLAY',
      vehicleId: 'SYSTEM',
      selectedRouteName: 'None',
      routesEvaluated: [],
      weights: { eta: 0, cost: 0, accessibility: 0, terrain: 0, reliability: 0, confidence: 0 },
      triggeringEvent: `Resolved Incident: ${incident.type}`,
      explanation: `Incident ${incident.id} (${incident.type}) at ${incident.locationName} was marked as RESOLVED. Road segments reopened.`,
      humanOverride: false
    };

    return { 
      incidents: updatedIncidents,
      auditLogs: [audit, ...state.auditLogs]
    };
  }),

  simulateIncident: (type) => {
    const { selectedRouteId, activeRouteOptions, selectedOrder } = get();
    
    // If we have an active route, let's place it on a coordinate in the path to break it
    let targetCoords: LatLng = { lat: 25.5788, lng: 91.8833 };
    let targetName = 'Shillong Bypass Section';

    if (selectedRouteId && activeRouteOptions.length > 0) {
      const activeRoute = activeRouteOptions.find((r) => r.id === selectedRouteId);
      if (activeRoute && activeRoute.path.length > 3) {
        // Place it in the middle of the route path to force a recalculation
        const midPointIdx = Math.floor(activeRoute.path.length / 2);
        targetCoords = activeRoute.path[midPointIdx];
        targetName = `Segment near ${activeRoute.path[midPointIdx].lat.toFixed(4)}, ${activeRoute.path[midPointIdx].lng.toFixed(4)}`;
      }
    }

    const descriptions: Record<string, string> = {
      Landslide: 'Sudden rocky landslide triggered by rainfall, blocking all traffic lanes.',
      'Heavy Rain': 'Torrential monsoonal downpour causing heavy mud streams and flash pooling.',
      'Road Closure': 'Municipal barrier blocking vehicles due to emergency utility line repair.',
      'Bridge Closure': 'Local river span bridge closed to heavy trucks due to warning water levels.',
      'Road Damage': 'Deep structural collapse on the shoulder lane, making vehicle passing risky.',
      'Traffic Congestion': 'Acute traffic deadlock along the arterial pass.',
      'Accessibility Barrier': 'Damaged concrete and collapsed guardrails blocks physical wheelchair access.',
      'Vehicle Breakdown': 'Simulated courier engine breakdown stalling the dispatch queue.'
    };

    get().addIncident({
      locationName: targetName,
      coords: targetCoords,
      type,
      severity: 'Critical',
      source: 'Government Feed',
      confidence: 95,
      description: descriptions[type] || 'Disruption simulated on path segment.'
    });

    // Auto-recalculate if active order is selected
    if (selectedOrder) {
      setTimeout(() => {
        get().runOptimization();
      }, 500);
    }
  },

  clearIncidents: () => set((state) => ({
    incidents: state.incidents.map((i) => ({ ...i, status: 'Resolved' }))
  })),

  addAccessibilityReport: (report) => set((state) => {
    const newReport: AccessibilityFeature = {
      ...report,
      id: `ACC-${200 + state.accessibilityFeatures.length + 1}`,
      lastVerified: new Date().toISOString().split('T')[0],
      reportsCount: 1,
      verifiedStatus: 'Pending'
    };

    // Audit Log entry
    const audit: AuditLog = {
      id: `AUD-${800 + state.auditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      orderId: 'CITIZEN',
      origin: 'CITIZEN_REPORT',
      destination: 'ACCESSIBILITY_MAP',
      vehicleId: 'CITIZEN',
      selectedRouteName: 'None',
      routesEvaluated: [],
      weights: { eta: 0, cost: 0, accessibility: 0, terrain: 0, reliability: 0, confidence: 0 },
      triggeringEvent: 'Citizen Accessibility Report',
      explanation: `Citizen reported a '${report.type}' with ${report.score < 50 ? 'poor' : 'accessible'} rating at ${report.locationName}. Accessibility map updated as Pending Verification.`,
      humanOverride: false
    };

    return {
      accessibilityFeatures: [newReport, ...state.accessibilityFeatures],
      auditLogs: [audit, ...state.auditLogs]
    };
  }),

  verifyAccessibilityFeature: (id, status) => set((state) => {
    const updatedFeatures = state.accessibilityFeatures.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          verifiedStatus: status,
          confidence: status === 'Verified' ? 95 : f.confidence
        };
      }
      return f;
    });

    const feat = updatedFeatures.find((f) => f.id === id);
    const audit: AuditLog = {
      id: `AUD-${800 + state.auditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      orderId: 'OPERATOR',
      origin: 'VERIFICATION_PORTAL',
      destination: 'ACCESSIBILITY_MAP',
      vehicleId: 'OPERATOR',
      selectedRouteName: 'None',
      routesEvaluated: [],
      weights: { eta: 0, cost: 0, accessibility: 0, terrain: 0, reliability: 0, confidence: 0 },
      triggeringEvent: `Verification Update: ${status}`,
      explanation: `Feature ${id} (${feat?.type}) was ${status.toUpperCase()} by operator. Route score calculations refreshed.`,
      humanOverride: false
    };

    return {
      accessibilityFeatures: updatedFeatures,
      auditLogs: [audit, ...state.auditLogs]
    };
  }),

  // Multi-objective optimization run
  runOptimization: () => {
    const { 
      selectedOrder, selectedVehicle, optimizationPreference, 
      customSliders, regionalConstraints, incidents, accessibilityFeatures, rainSimulationActive 
    } = get();

    if (!selectedOrder || !selectedVehicle) {
      alert("Please select both an Order and a Vehicle first.");
      return;
    }

    set({ isOptimizing: true, optimizationLogs: ["Initializing VRP optimizer...", "Checking vehicle capacity...", "Checking time windows..."] });

    // Simulate quick loading states for presentation wow-factor
    setTimeout(() => {
      set((state) => ({ optimizationLogs: [...state.optimizationLogs, "Analyzing topography and road widths...", "Evaluating regional landslide risks..."] }));
    }, 300);

    setTimeout(() => {
      set((state) => ({ optimizationLogs: [...state.optimizationLogs, "Assessing route accessibility constraints...", "Running multi-objective Dijkstra scoring..."] }));
    }, 600);

    setTimeout(async () => {
      const routes = await routeOptimizer(
        selectedOrder.pickupCoords,
        selectedOrder.destinationCoords,
        selectedVehicle,
        selectedOrder.priority,
        selectedOrder.weight,
        selectedOrder.accessibilityRequirements,
        regionalConstraints,
        optimizationPreference,
        customSliders,
        incidents,
        accessibilityFeatures,
        rainSimulationActive
      );

      if (routes.length === 0) {
        set({
          isOptimizing: false,
          activeRouteOptions: [],
          selectedRouteId: null,
          optimizationLogs: ["Error: No route satisfies the current terrain and vehicle requirements."]
        });
        return;
      }

      const recommended = routes.find((r) => r.name.includes('AI Recommended')) || routes[0];

      // Audit Log
      const audit: AuditLog = {
        id: `AUD-${800 + get().auditLogs.length + 1}`,
        timestamp: new Date().toISOString(),
        orderId: selectedOrder.id,
        origin: selectedOrder.pickup,
        destination: selectedOrder.destination,
        vehicleId: selectedVehicle.id,
        selectedRouteName: recommended.name,
        routesEvaluated: routes.map((r) => ({
          name: r.name,
          eta: r.eta,
          distance: r.distance,
          accessibilityScore: r.accessibilityScore,
          terrainRisk: r.terrainRisk,
          confidence: r.confidence,
          roadReliability: r.roadReliability,
          finalScore: r.finalScore
        })),
        weights: optimizationPreference === 'Custom' ? customSliders : {
          eta: optimizationPreference === 'Fastest' ? 70 : optimizationPreference === 'Most Accessible' ? 10 : 30,
          cost: optimizationPreference === 'Fastest' ? 20 : optimizationPreference === 'Most Accessible' ? 5 : 15,
          accessibility: optimizationPreference === 'Fastest' ? 2 : optimizationPreference === 'Most Accessible' ? 65 : 20,
          terrain: optimizationPreference === 'Fastest' ? 2 : optimizationPreference === 'Most Accessible' ? 10 : 15,
          reliability: optimizationPreference === 'Fastest' ? 4 : optimizationPreference === 'Most Accessible' ? 5 : 10,
          confidence: optimizationPreference === 'Fastest' ? 2 : optimizationPreference === 'Most Accessible' ? 5 : 10
        },
        explanation: recommended.explanation,
        humanOverride: false
      };

      // Set state
      set((state) => {
        // Update order with optimized status
        const updatedOrders = state.orders.map((o) => {
          if (o.id === selectedOrder.id) {
            return {
              ...o,
              eta: recommended.eta,
              distance: recommended.distance,
              routeRisk: recommended.terrainRisk,
              status: recommended.status === 'Rerouting Required' ? ('Rerouting' as OrderStatus) : ('Assigned' as OrderStatus)
            };
          }
          return o;
        });

        // Determine if this is a rerouting incident
        const prevRoute = state.activeRouteOptions.find((r) => r.id === state.selectedRouteId) || null;
        const isRerouted = prevRoute !== null && recommended.status === 'Rerouting Required';

        return {
          isOptimizing: false,
          activeRouteOptions: routes,
          selectedRouteId: recommended.id,
          orders: updatedOrders,
          auditLogs: [audit, ...state.auditLogs],
          previousRouteOption: prevRoute,
          showRerouteAlert: isRerouted,
          optimizationLogs: ["Optimization completed successfully! Recommended route generated."]
        };
      });
    }, 900);
  },

  selectRoute: (routeId) => set((state) => {
    const route = state.activeRouteOptions.find((r) => r.id === routeId);
    if (!route || !state.selectedOrder) return {};

    const updatedOrders = state.orders.map((o) => {
      if (o.id === state.selectedOrder!.id) {
        return {
          ...o,
          eta: route.eta,
          distance: route.distance,
          routeRisk: route.terrainRisk
        };
      }
      return o;
    });

    return {
      selectedRouteId: routeId,
      orders: updatedOrders
    };
  }),

  overrideRecommendation: (reason) => set((state) => {
    if (state.auditLogs.length === 0) return {};
    
    // Add human override detail to latest audit log
    const updatedLogs = [...state.auditLogs];
    if (updatedLogs[0]) {
      updatedLogs[0] = {
        ...updatedLogs[0],
        humanOverride: true,
        overrideReason: reason as any
      };
    }

    return { auditLogs: updatedLogs };
  }),

  // Simulation engine triggers
  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  toggleRainSimulation: () => set((state) => {
    const active = !state.rainSimulationActive;
    if (state.selectedOrder) {
      // Recalculate routes if rain condition changes
      setTimeout(() => {
        get().runOptimization();
      }, 300);
    }
    return { rainSimulationActive: active };
  }),

  tickSimulation: () => set((state) => {
    if (!state.isSimulating) return {};

    const updatedVehicles = state.vehicles.map((veh) => {
      // Find orders assigned to this vehicle that are 'Assigned' or 'En Route' or 'Rerouting'
      const assignedOrder = state.orders.find(
        (o) => o.assignedVehicleId === veh.id && (o.status === 'Assigned' || o.status === 'En Route' || o.status === 'Rerouting')
      );

      if (!assignedOrder) return veh;

      // Calculate path. If no path options, do random walking
      const activeRoute = state.activeRouteOptions.length > 0 && state.selectedOrder?.id === assignedOrder.id
        ? state.activeRouteOptions.find((r) => r.id === state.selectedRouteId)
        : null;

      let nextLat = veh.lat;
      let nextLng = veh.lng;
      let newOrderStatus = assignedOrder.status;

      if (activeRoute && activeRoute.path.length > 0) {
        // Move towards the next point in path coordinates
        // Snapping current position
        let minDistanceIndex = 0;
        let minDistance = Infinity;

        activeRoute.path.forEach((coords, idx) => {
          const dist = calculateHaversineDistance({ lat: veh.lat, lng: veh.lng }, coords);
          if (dist < minDistance) {
            minDistance = dist;
            minDistanceIndex = idx;
          }
        });

        if (minDistanceIndex < activeRoute.path.length - 1) {
          const target = activeRoute.path[minDistanceIndex + 1];
          const distToTarget = calculateHaversineDistance({ lat: veh.lat, lng: veh.lng }, target);
          
          // Speed step depends on speed selection (approx 0.002 lat/lng units)
          const speedStep = 0.001 * state.simulationSpeed;

          if (distToTarget < 0.15) {
            // snapped to node, target the next
            nextLat = target.lat;
            nextLng = target.lng;
          } else {
            // Interpolate coordinate step
            const dLat = target.lat - veh.lat;
            const dLng = target.lng - veh.lng;
            const heading = Math.atan2(dLat, dLng);
            
            nextLat += Math.sin(heading) * speedStep;
            nextLng += Math.cos(heading) * speedStep;
          }

          if (assignedOrder.status === 'Assigned') {
            newOrderStatus = 'En Route';
          }
        } else {
          // Arrived at destination
          nextLat = assignedOrder.destinationCoords.lat;
          nextLng = assignedOrder.destinationCoords.lng;
          newOrderStatus = 'Delivered';
        }
      } else {
        // Simple random walking if no route exists
        const dest = assignedOrder.destinationCoords;
        const dLat = dest.lat - veh.lat;
        const dLng = dest.lng - veh.lng;
        const heading = Math.atan2(dLat, dLng);
        const speedStep = 0.0008 * state.simulationSpeed;

        if (calculateHaversineDistance({ lat: veh.lat, lng: veh.lng }, dest) < 0.2) {
          nextLat = dest.lat;
          nextLng = dest.lng;
          newOrderStatus = 'Delivered';
        } else {
          nextLat += Math.sin(heading) * speedStep;
          nextLng += Math.cos(heading) * speedStep;
          newOrderStatus = 'En Route';
        }
      }

      // If order is delivered, free the vehicle
      const isDelivered = newOrderStatus === 'Delivered';
      return {
        ...veh,
        lat: nextLat,
        lng: nextLng,
        status: isDelivered ? ('Available' as VehicleStatus) : ('Delivering' as VehicleStatus)
      };
    });

    const updatedOrders = state.orders.map((o) => {
      // Find matching vehicle status change
      const veh = updatedVehicles.find((v) => v.id === o.assignedVehicleId);
      if (o.assignedVehicleId && (o.status === 'Assigned' || o.status === 'En Route' || o.status === 'Rerouting')) {
        const isDelivered = veh?.status === 'Available';
        return {
          ...o,
          status: isDelivered ? ('Delivered' as OrderStatus) : ('En Route' as OrderStatus)
        };
      }
      return o;
    });

    // Sync selected vehicle coords
    const updatedSelectedVehicle = state.selectedVehicle
      ? updatedVehicles.find((v) => v.id === state.selectedVehicle!.id) || state.selectedVehicle
      : null;

    const updatedSelectedOrder = state.selectedOrder
      ? updatedOrders.find((o) => o.id === state.selectedOrder!.id) || state.selectedOrder
      : null;

    return {
      vehicles: updatedVehicles,
      orders: updatedOrders,
      selectedVehicle: updatedSelectedVehicle,
      selectedOrder: updatedSelectedOrder
    };
  }),

  // Demo step operations
  startDemo: () => set({
    demoActive: true,
    demoStep: 1,
    activeTab: 'routing',
    selectedOrder: SEED_ORDERS.find((o) => o.id === 'ORD-103') || SEED_ORDERS[0],
    selectedVehicle: SEED_VEHICLES.find((v) => v.id === 'VN-002') || SEED_VEHICLES[0],
    optimizationPreference: 'Balanced',
    customSliders: { eta: 30, cost: 15, accessibility: 20, terrain: 15, reliability: 10, confidence: 10 },
    regionalConstraints: ['Avoid Landslide Risk', 'Prefer Main Roads'],
    activeRouteOptions: [],
    selectedRouteId: null,
    previousRouteOption: null,
    showRerouteAlert: false
  }),

  nextDemoStep: () => set((state) => {
    const nextStep = state.demoStep + 1;
    if (nextStep > state.demoSteps.length) {
      return { demoActive: false, demoStep: 1 };
    }

    // Step Automations
    let updates: Partial<AppState> = { demoStep: nextStep };

    if (nextStep === 2) {
      // Run optimization automatically
      setTimeout(() => {
        get().runOptimization();
      }, 200);
    } else if (nextStep === 3) {
      // Select AI Recommended Route
      const aiRoute = state.activeRouteOptions.find((r) => r.name.includes('AI Recommended'));
      if (aiRoute) {
        updates.selectedRouteId = aiRoute.id;
      }
    } else if (nextStep === 4) {
      // Trigger a simulated landslide on the path
      setTimeout(() => {
        get().simulateIncident('Landslide');
      }, 200);
    } else if (nextStep === 5) {
      // Change views to Overview to see alerts & re-optimized routes
      updates.activeTab = 'overview';
    } else if (nextStep === 6) {
      // View feedback tab
      updates.activeTab = 'feedback';
    } else if (nextStep === 7) {
      // Open decision audit tab
      updates.activeTab = 'audit';
    }

    return updates;
  }),

  prevDemoStep: () => set((state) => ({
    demoStep: Math.max(1, state.demoStep - 1)
  })),

  resetDemo: () => set({
    demoActive: false,
    demoStep: 1,
    orders: SEED_ORDERS,
    vehicles: SEED_VEHICLES,
    incidents: SEED_INCIDENTS,
    activeRouteOptions: [],
    selectedRouteId: null,
    selectedOrder: null,
    selectedVehicle: null,
    previousRouteOption: null,
    showRerouteAlert: false
  }),

  setArchitectureModalOpen: (open) => set({ architectureModalOpen: open })
}));
