import { create } from 'zustand';
import { autoDispatchOrder } from '../services/dispatchEngine.js';

const initialOrders = [
  {
    id: 'ORD-101',
    customer: 'Shillong Civil Hospital',
    pickup: 'Bara Bazar / Iewduh',
    pickupCoords: { lat: 25.5721, lng: 91.8752 },
    destination: 'NEHU',
    destinationCoords: { lat: 25.6125, lng: 91.8996 },
    priority: 'Emergency',
    weight: 150,
    cargoType: 'Vaccine & Medical Supplies',
    timeWindow: '09:00 - 12:00',
    assignedVehicleId: 'VN-002',
    accessibilityRequirements: ['Wheelchair Accessible', 'Avoid Very Steep Sections'],
    status: 'Assigned',
    routeRisk: 15,
    eta: 24,
    createdTime: '2026-09-10T08:30:00Z'
  },
  {
    id: 'ORD-102',
    customer: 'Assam Medical College',
    pickup: 'Guwahati',
    pickupCoords: { lat: 26.1445, lng: 91.7362 },
    destination: 'Dibrugarh',
    destinationCoords: { lat: 27.4728, lng: 94.9120 },
    priority: 'High',
    weight: 450,
    cargoType: 'Vaccine & Medical Supplies',
    timeWindow: '10:00 - 16:00',
    assignedVehicleId: 'VN-001',
    accessibilityRequirements: ['Avoid Poor Surface'],
    status: 'En Route',
    routeRisk: 30,
    eta: 210,
    createdTime: '2026-09-10T07:15:00Z'
  }
];

const initialVehicles = [
  {
    id: 'VN-001',
    name: 'NorthEast Eco Van #1',
    type: 'Electric Van',
    capacity: 600,
    load: 120,
    groundClearance: 190,
    hillSuitability: 'Good',
    narrowRoadSuitability: 'Good',
    fuelCharge: 88,
    accessibilityCapability: 'Ramp',
    status: 'Available',
    lat: 25.5732,
    lng: 91.8821,
    driverName: 'Bah John Lyngdoh',
    driverPhone: '+91 98620 11234'
  },
  {
    id: 'VN-002',
    name: 'High-Terrain 4x4 Ambulance',
    type: '4x4 Utility Vehicle',
    capacity: 850,
    load: 150,
    groundClearance: 230,
    hillSuitability: 'Excellent',
    narrowRoadSuitability: 'Good',
    fuelCharge: 95,
    accessibilityCapability: 'Wheelchair Lift',
    status: 'Available',
    lat: 25.5721,
    lng: 91.8752,
    driverName: 'Damehi Mukhim',
    driverPhone: '+91 98561 44556'
  },
  {
    id: 'VN-003',
    name: 'Heavy Freight Hauler',
    type: 'Medium Truck',
    capacity: 3500,
    load: 1200,
    groundClearance: 250,
    hillSuitability: 'Moderate',
    narrowRoadSuitability: 'Poor',
    fuelCharge: 78,
    accessibilityCapability: 'Standard',
    status: 'Available',
    lat: 25.5831,
    lng: 91.8879,
    driverName: 'Suren Sangma',
    driverPhone: '+91 97740 99881'
  }
];

const initialIncidents = [
  {
    id: 'INC-201',
    locationName: 'Mawlai Bypass Junction',
    coords: { lat: 25.5928, lng: 91.8805 },
    type: 'Landslide',
    severity: 'High',
    status: 'Active',
    reportedTime: '2026-09-10T06:45:00Z',
    source: 'Meghalaya PWD Road Monitoring',
    confidence: 94,
    description: 'Landslide debris blocking main dual lane pass on Mawlai Bypass road.',
    radius: 0.6,
    roadImpact: 'blocked'
  },
  {
    id: 'INC-202',
    locationName: 'Umpling Bridge Link',
    coords: { lat: 25.5802, lng: 91.9234 },
    type: 'Bridge Closure',
    severity: 'Moderate',
    status: 'Active',
    reportedTime: '2026-09-10T07:20:00Z',
    source: 'Citizen Hazard Alert',
    confidence: 88,
    description: 'Structural inspection underway following flash stream swelling.',
    radius: 0.5,
    roadImpact: 'delayed'
  }
];

const emergencyHubs = [
  {
    id: 'HUB-01',
    name: 'Shillong PWD Heavy Recovery Unit',
    location: 'Polo Market Circle',
    phone: '0364-2224400',
    type: 'Towing & Heavy Clearance',
    distance: '1.2 km away'
  },
  {
    id: 'HUB-02',
    name: 'Upper Shillong Highway Mechanics Hub',
    location: 'NH-40 Bypass',
    phone: '0364-2560112',
    type: 'Tire & Battery Emergency Repair',
    distance: '3.8 km away'
  },
  {
    id: 'HUB-03',
    name: 'Meghalaya Emergency Highway SOS Response',
    location: 'Central Command Shillong',
    phone: '112 / 108',
    type: 'Medical & Disaster Response',
    distance: '0.8 km away'
  }
];

export const useStore = create((set, get) => ({
  // Authentication & Role State
  isLoggedIn: true,
  userRole: 'user', // 'user' | 'partner'
  currentUser: {
    id: 'USR-901',
    name: 'Anita Kharbangar',
    email: 'anita.kharbangar@gmail.com',
    role: 'user',
    verifiedWithGoogle: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },

  // Navigation & Region State
  activeTab: 'overview',
  selectedRegion: 'Meghalaya',

  // Core Datasets
  orders: initialOrders,
  vehicles: initialVehicles,
  incidents: initialIncidents,
  emergencyHubs: emergencyHubs,
  feedbackReports: [
    {
      id: 'FBD-301',
      userName: 'Anita Marak',
      location: 'Civil Hospital Shillong Entry',
      category: 'Accessibility Barrier',
      rating: 2,
      comment: 'Wheelchair ramp construction temporarily blocked by construction materials.',
      status: 'Under Review',
      date: '2026-09-10'
    }
  ],

  // Active Selections
  selectedOrder: initialOrders[0],
  selectedVehicle: initialVehicles[1],
  activeRouteOptions: [],
  selectedRouteId: null,
  isOptimizing: false,
  rainSimulationActive: false,

  // Copilot Messages
  copilotMessages: [
    {
      sender: 'copilot',
      text: 'Hello! I am your AI Logistics Copilot. Type your shipment goal or click a scenario preset below to automatically optimize routes.'
    }
  ],

  // Actions
  setRole: (role) => set({ userRole: role }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
  toggleRainSimulation: () => set((state) => ({ rainSimulationActive: !state.rainSimulationActive })),

  loginAsUser: (userInfo) => set({
    isLoggedIn: true,
    userRole: 'user',
    currentUser: userInfo,
    activeTab: 'overview'
  }),

  loginAsPartner: (partnerInfo) => set({
    isLoggedIn: true,
    userRole: 'partner',
    currentUser: partnerInfo,
    activeTab: 'partnerDashboard'
  }),

  logout: () => set({
    isLoggedIn: false,
    userRole: null,
    currentUser: null
  }),

  // AI Auto-Dispatch Order Creation
  placeOrderAndDispatch: (newOrderData) => {
    const { vehicles, orders } = get();
    const matchedVehicle = autoDispatchOrder(newOrderData, vehicles);

    const createdOrder = {
      ...newOrderData,
      id: `ORD-${Date.now().toString().slice(-4)}`,
      assignedVehicleId: matchedVehicle ? matchedVehicle.id : 'VN-002',
      status: 'Assigned',
      eta: 24,
      createdTime: new Date().toISOString()
    };

    set({
      orders: [createdOrder, ...orders],
      selectedOrder: createdOrder,
      selectedVehicle: matchedVehicle || vehicles[0],
      activeTab: 'trackOrder'
    });

    return createdOrder;
  },

  setActiveRouteOptions: (routes) => {
    const recommended = routes.find((r) => r.name.includes('AI Recommended')) || routes[0];
    set({
      activeRouteOptions: routes,
      selectedRouteId: recommended ? recommended.id : null
    });
  }
}));
