'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import DynamicMap from './maps/DynamicMap';
import { 
  Navigation, Settings, ArrowRight, ShieldCheck, 
  AlertTriangle, AlertCircle, Info, Check, RefreshCw
} from 'lucide-react';
import { Order, Vehicle, RouteOption } from '../types';

export default function SmartRouting() {
  // Store values
  const orders = useStore((state) => state.orders);
  const vehicles = useStore((state) => state.vehicles);
  const incidents = useStore((state) => state.incidents);
  const selectedOrder = useStore((state) => state.selectedOrder);
  const selectedVehicle = useStore((state) => state.selectedVehicle);
  const activeRouteOptions = useStore((state) => state.activeRouteOptions);
  const selectedRouteId = useStore((state) => state.selectedRouteId);
  const optimizationPreference = useStore((state) => state.optimizationPreference);
  const customSliders = useStore((state) => state.customSliders);
  const regionalConstraints = useStore((state) => state.regionalConstraints);
  const isOptimizing = useStore((state) => state.isOptimizing);
  const optimizationLogs = useStore((state) => state.optimizationLogs);
  const previousRouteOption = useStore((state) => state.previousRouteOption);
  const showRerouteAlert = useStore((state) => state.showRerouteAlert);
  
  // Store actions
  const setOptimizationPreference = useStore((state) => state.setOptimizationPreference);
  const setCustomSliders = useStore((state) => state.setCustomSliders);
  const toggleRegionalConstraint = useStore((state) => state.toggleRegionalConstraint);
  const runOptimization = useStore((state) => state.runOptimization);
  const selectRoute = useStore((state) => state.selectRoute);
  const overrideRecommendation = useStore((state) => state.overrideRecommendation);

  // Local form inputs
  const [pickup, setPickup] = useState('Bara Bazar / Iewduh');
  const [destination, setDestination] = useState('NEHU');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Emergency'>('High');
  const [vehicleId, setVehicleId] = useState('VN-002');
  const [weight, setWeight] = useState(120);
  const [cargoType, setCargoType] = useState<any>('Vaccine & Medical Supplies');
  const [accessibilityReqs, setAccessibilityReqs] = useState<string[]>(['Wheelchair Accessible']);
  
  // Override Modal
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Driver Local Knowledge');
  const [customReason, setCustomReason] = useState('');

  // Landmarks options across the 8 North Eastern States
  const landmarksList = [
    'Police Bazar', 'Laitumkhrah', 'Mawlai', 'Nongthymmai', 
    'Upper Shillong', 'NEHU', 'Shillong Peak', 'Polo', 
    'Malki', 'Laban', 'Rynjah', 'Umpling', 'Bara Bazar / Iewduh', 
    'Civil Hospital Shillong', 'Ward\'s Lake', 'Golf Links', 'Mawpat',
    'Cherrapunji / Sohra', 'Tura', 'Jowai',
    'Guwahati', 'Dispur', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur',
    'Itanagar', 'Tawang', 'Pasighat', 'Ziro',
    'Kohima', 'Dimapur', 'Mokokchung',
    'Imphal', 'Churachandpur', 'Ukhrul',
    'Aizawl', 'Lunglei', 'Champhai',
    'Agartala', 'Udaipur (Tripura)', 'Dharmanagar',
    'Gangtok', 'Namchi', 'Mangan'
  ];

  const accessibilityOptions = [
    'Wheelchair Accessible', 'Avoid Stairs', 'Avoid Very Steep Sections', 
    'Accessible Destination Required', 'Avoid Poor Surface', 'Avoid Narrow Route', 
    'Low-Floor Vehicle Required'
  ];

  const regionalOptions = [
    'Avoid Landslide Risk', 'Avoid Heavy Rain Affected Roads', 'Avoid Narrow Roads', 
    'Avoid Poor Road Surface', 'Avoid Steep Roads', 'Prefer Main Roads', 
    'Avoid Low-Confidence Routes', 'Avoid Bridge-Dependent Route'
  ];

  // Map landmarks to coordinates across 8 North Eastern States
  const getLandmarkCoords = (name: string) => {
    const mappings: Record<string, { lat: number; lng: number }> = {
      // Meghalaya
      'Police Bazar': { lat: 25.5732, lng: 91.8821 },
      'Laitumkhrah': { lat: 25.5684, lng: 91.8988 },
      'Mawlai': { lat: 25.5991, lng: 91.8762 },
      'Nongthymmai': { lat: 25.5587, lng: 91.9080 },
      'Upper Shillong': { lat: 25.5392, lng: 91.8493 },
      'NEHU': { lat: 25.6125, lng: 91.8996 },
      'Shillong Peak': { lat: 25.5316, lng: 91.8654 },
      'Polo': { lat: 25.5831, lng: 91.8879 },
      'Malki': { lat: 25.5612, lng: 91.8875 },
      'Laban': { lat: 25.5583, lng: 91.8741 },
      'Rynjah': { lat: 25.5709, lng: 91.9213 },
      'Umpling': { lat: 25.5802, lng: 91.9234 },
      'Bara Bazar / Iewduh': { lat: 25.5721, lng: 91.8752 },
      'Civil Hospital Shillong': { lat: 25.5653, lng: 91.8795 },
      'Ward\'s Lake': { lat: 25.5714, lng: 91.8856 },
      'Golf Links': { lat: 25.5888, lng: 91.8967 },
      'Mawpat': { lat: 25.6022, lng: 91.9189 },
      'Cherrapunji / Sohra': { lat: 25.2986, lng: 91.7302 },
      'Tura': { lat: 25.5141, lng: 90.2032 },
      'Jowai': { lat: 25.4503, lng: 92.2038 },
      // Assam
      'Guwahati': { lat: 26.1445, lng: 91.7362 },
      'Dispur': { lat: 26.1408, lng: 91.7904 },
      'Silchar': { lat: 24.8333, lng: 92.7789 },
      'Dibrugarh': { lat: 27.4728, lng: 94.9120 },
      'Jorhat': { lat: 26.7509, lng: 94.2037 },
      'Tezpur': { lat: 26.6528, lng: 92.7926 },
      // Arunachal Pradesh
      'Itanagar': { lat: 27.0844, lng: 93.6053 },
      'Tawang': { lat: 27.5861, lng: 91.8594 },
      'Pasighat': { lat: 28.0664, lng: 95.3262 },
      'Ziro': { lat: 27.5451, lng: 93.8340 },
      // Nagaland
      'Kohima': { lat: 25.6751, lng: 94.1086 },
      'Dimapur': { lat: 25.9060, lng: 93.7271 },
      'Mokokchung': { lat: 26.3243, lng: 94.5303 },
      // Manipur
      'Imphal': { lat: 24.8170, lng: 93.9368 },
      'Churachandpur': { lat: 24.3333, lng: 93.6833 },
      'Ukhrul': { lat: 25.1167, lng: 94.3667 },
      // Mizoram
      'Aizawl': { lat: 23.7367, lng: 92.7176 },
      'Lunglei': { lat: 22.8833, lng: 92.7333 },
      'Champhai': { lat: 23.4561, lng: 93.3282 },
      // Tripura
      'Agartala': { lat: 23.8315, lng: 91.2868 },
      'Udaipur (Tripura)': { lat: 23.5333, lng: 91.4833 },
      'Dharmanagar': { lat: 24.3667, lng: 92.1667 },
      // Sikkim
      'Gangtok': { lat: 27.3389, lng: 88.6065 },
      'Namchi': { lat: 27.1667, lng: 88.3500 },
      'Mangan': { lat: 27.5000, lng: 88.5333 }
    };
    return mappings[name] || { lat: 25.5788, lng: 91.8833 };
  };

  // Sync state with selected order from demo
  useEffect(() => {
    if (selectedOrder) {
      setPickup(selectedOrder.pickup);
      setDestination(selectedOrder.destination);
      setPriority(selectedOrder.priority);
      setWeight(selectedOrder.weight);
      setAccessibilityReqs(selectedOrder.accessibilityRequirements);
      if (selectedOrder.assignedVehicleId) {
        setVehicleId(selectedOrder.assignedVehicleId);
      }
    }
  }, [selectedOrder]);

  const handleOptimizeClick = () => {
    // Create or select the order representation in store
    const pickupCoords = getLandmarkCoords(pickup);
    const destinationCoords = getLandmarkCoords(destination);
    
    const mockOrder: Order = {
      id: selectedOrder?.id || 'ORD-TMP',
      customer: selectedOrder?.customer || 'Demo Client',
      pickup,
      pickupCoords,
      destination,
      destinationCoords,
      priority,
      weight,
      timeWindow: selectedOrder?.timeWindow || '10:00 - 14:00',
      accessibilityRequirements: accessibilityReqs,
      status: 'Pending',
      routeRisk: 0,
      eta: 0,
      createdTime: new Date().toISOString()
    };

    const targetVehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

    // Set selected order/vehicle in store
    useStore.setState({ 
      selectedOrder: mockOrder,
      selectedVehicle: targetVehicle
    });

    runOptimization();
  };

  const handleAccessibilityToggle = (option: string) => {
    setAccessibilityReqs((prev) => 
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleOverrideSubmit = () => {
    const reason = overrideReason === 'Other' ? customReason : overrideReason;
    overrideRecommendation(reason);
    setShowOverride(false);
    alert(`AI recommended route overridden. Override Reason saved: "${reason}"`);
  };

  const activeRoute = activeRouteOptions.find((r) => r.id === selectedRouteId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 h-full overflow-y-auto">
      {/* Left Input Configuration Column */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-1.5">
            <Navigation className="h-4.5 w-4.5 text-indigo-500" />
            <span>Route Constraints & Parameters</span>
          </h3>

          <div className="space-y-4">
            {/* Origin & Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pickup (Origin)</label>
                <select 
                  value={pickup} 
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full text-xs font-semibold rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2 bg-slate-50"
                >
                  {landmarksList.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Destination</label>
                <select 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs font-semibold rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2 bg-slate-50"
                >
                  {landmarksList.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Vehicle & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Vehicle</label>
                <select 
                  value={vehicleId} 
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full text-xs font-semibold rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2 bg-slate-50"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id} disabled={v.status === 'Offline'}>
                      {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Order Priority</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs font-semibold rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2 bg-slate-50"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            {/* Shipment Weight & Cargo Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Payload Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-semibold rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2 bg-slate-50" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Multimodal Cargo Type</label>
                <select 
                  value={cargoType} 
                  onChange={(e) => setCargoType(e.target.value as any)}
                  className="w-full text-xs font-semibold rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2 bg-slate-50"
                >
                  <option value="Vaccine & Medical Supplies">Vaccine & Medical Supplies</option>
                  <option value="Heavy Construction & Gravel">Heavy Construction & Gravel</option>
                  <option value="Perishable Agri-Produce">Perishable Agri-Produce</option>
                  <option value="Standard Freight">Standard Freight</option>
                </select>
              </div>
            </div>

            {/* Accessibility Profile checklist */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Accessibility Profile</label>
              <div className="grid grid-cols-1 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-32 overflow-y-auto">
                {accessibilityOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={accessibilityReqs.includes(opt)}
                      onChange={() => handleAccessibilityToggle(opt)}
                      className="accent-indigo-600 rounded border-slate-300"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* North East Route Constraints checkboxes */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">North East Route Constraints</label>
              <div className="grid grid-cols-1 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-32 overflow-y-auto">
                {regionalOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={regionalConstraints.includes(opt)}
                      onChange={() => toggleRegionalConstraint(opt)}
                      className="accent-indigo-600 rounded border-slate-300"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optimization preference mode */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Optimization Mode</label>
              <select 
                value={optimizationPreference} 
                onChange={(e) => setOptimizationPreference(e.target.value as any)}
                className="w-full text-xs font-semibold rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2 bg-slate-50"
              >
                <option value="Balanced">Balanced (Efficiency & Access)</option>
                <option value="Fastest">Fastest (ETA Only)</option>
                <option value="Most Accessible">Most Accessible</option>
                <option value="Most Reliable">Most Reliable</option>
                <option value="Emergency">Emergency</option>
                <option value="Custom">Custom Sliders</option>
              </select>
            </div>

            {/* Custom sliders weights if 'Custom' selected */}
            {optimizationPreference === 'Custom' && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase">Weights Config</h4>
                {Object.entries(customSliders).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 capitalize">
                      <span>{key}</span>
                      <span>{val}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={val}
                      onChange={(e) => setCustomSliders({ [key]: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600 h-1 rounded" 
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Optimize Button */}
            <button
              onClick={handleOptimizeClick}
              disabled={isOptimizing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 font-extrabold text-white text-xs shadow-md shadow-indigo-600/15 transition duration-150"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Optimizing Route...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  <span>Analyze & Optimize Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading / Execution Log panel */}
        {isOptimizing && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col font-mono text-[10px] text-emerald-400 gap-1.5 animate-pulse shadow-md">
            <h4 className="font-bold border-b border-emerald-950 pb-1 mb-1 text-slate-300 uppercase text-[9px] tracking-wider">AI Optimizer Steps</h4>
            {optimizationLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">&#10003;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Route alternatives, Map, and Why AI */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        {/* Map Centerpiece */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-[350px]">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Route Visualizer</h3>
            <span className="text-[10px] text-slate-400 font-bold">Showing {activeRouteOptions.length} Evaluated Options</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <DynamicMap viewMode="standard" />
          </div>
        </div>

        {/* Route options comparison cards */}
        {activeRouteOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeRouteOptions.map((ro) => {
              const isSelected = ro.id === selectedRouteId;
              const isAiRec = ro.name.includes('AI Recommended');
              
              let highlightBorder = 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50';
              let badgeColor = 'bg-slate-100 text-slate-700';

              if (isSelected) {
                if (isAiRec) {
                  highlightBorder = 'border-slate-800 bg-slate-100/60 ring-2 ring-slate-800/10';
                  badgeColor = 'bg-slate-900 text-white';
                } else if (ro.name.includes('Safest') || ro.name.includes('Accessible')) {
                  highlightBorder = 'border-emerald-600 bg-emerald-50/10 ring-2 ring-emerald-600/10';
                  badgeColor = 'bg-emerald-600 text-white';
                } else {
                  highlightBorder = 'border-amber-600 bg-amber-50/10 ring-2 ring-amber-600/10';
                  badgeColor = 'bg-amber-600 text-white';
                }
              }

              return (
                <div 
                  key={ro.id}
                  onClick={() => selectRoute(ro.id)}
                  className={`bg-white border rounded-xl p-4 flex flex-col gap-3 shadow-sm cursor-pointer transition duration-150 ${highlightBorder}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${badgeColor}`}>
                      {ro.name}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">Score: {ro.finalScore}/100</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-b pb-2.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Duration</span>
                      <span className="text-sm font-extrabold text-slate-800">{ro.eta} mins</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Distance</span>
                      <span className="text-sm font-extrabold text-slate-800">{ro.distance} km</span>
                    </div>
                    <div className="flex flex-col mt-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Access Score</span>
                      <span className="text-sm font-extrabold text-emerald-600">{ro.accessibilityScore}/100</span>
                    </div>
                    <div className="flex flex-col mt-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Terrain Risk</span>
                      <span className="text-sm font-extrabold text-rose-600">{ro.terrainRisk}/100</span>
                    </div>
                  </div>

                  {/* Small attributes listing */}
                  <div className="flex-1 space-y-1.5">
                    {ro.warnings.slice(0, 2).map((w, wi) => (
                      <div key={wi} className="flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold leading-relaxed">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                    {ro.benefits.slice(0, 2).map((b, bi) => (
                      <div key={bi} className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold leading-relaxed">
                        <ShieldCheck className="h-3 w-3 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[9px] font-bold text-right text-slate-400">
                    Est. Cost: Rs. {ro.cost}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reroute Alert Banner */}
        {showRerouteAlert && previousRouteOption && activeRoute && (
          <div className="bg-amber-50 border border-amber-400/50 rounded-xl p-4 flex flex-col gap-3 shadow-sm border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
              <AlertCircle className="h-5 w-5 text-amber-600 animate-bounce" />
              <span>Route Recalculated due to landslide</span>
            </div>
            
            <p className="text-xs text-amber-800/90 leading-relaxed font-semibold">
              The previous route segment has been blocked by a reported <b>Landslide</b>. Neural Nexus has automatically recalculated and bypassed the affected road.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              {/* Previous Route */}
              <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col gap-1.5 opacity-70">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Previous Route</span>
                <span className="font-extrabold text-slate-800">{previousRouteOption.name}</span>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-bold border-t pt-1.5">
                  <span>ETA: {previousRouteOption.eta} mins</span>
                  <span>Dist: {previousRouteOption.distance} km</span>
                </div>
                <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-extrabold uppercase w-fit mt-1">
                  Affected by landslide
                </span>
              </div>

              {/* New Route */}
              <div className="bg-white border border-indigo-200 p-3 rounded-lg flex flex-col gap-1.5 ring-2 ring-indigo-500/10">
                <span className="text-[9px] font-bold text-indigo-400 uppercase">New Recommended Route</span>
                <span className="font-extrabold text-indigo-950">{activeRoute.name}</span>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-bold border-t pt-1.5">
                  <span>ETA: {activeRoute.eta} mins</span>
                  <span>Dist: {activeRoute.distance} km</span>
                </div>
                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-extrabold uppercase w-fit mt-1">
                  Recommended
                </span>
              </div>
            </div>
          </div>
        )}
        {activeRoute && (
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="h-4.5 w-4.5 text-indigo-500" />
                <span>Why Neural Nexus recommends this route</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {activeRoute.explanation}
              </p>
            </div>

            {/* Benefits & Tradeoffs list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200/60 text-xs font-semibold">
              <div>
                <h4 className="font-bold text-slate-500 uppercase text-[9px] mb-2">Benefits</h4>
                <ul className="space-y-1 text-emerald-700">
                  {activeRoute.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{b}</span>
                    </li>
                  ))}
                  {activeRoute.benefits.length === 0 && <li className="text-slate-400">No special benefits flagged.</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-500 uppercase text-[9px] mb-2">Trade-offs</h4>
                <ul className="space-y-1 text-slate-600">
                  {activeRoute.tradeoffs.map((t, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>{t}</span>
                    </li>
                  ))}
                  {activeRoute.tradeoffs.length === 0 && <li className="text-slate-400">Optimal efficiency profile.</li>}
                </ul>
              </div>
            </div>

            {/* Human Override Action */}
            <div className="flex items-center justify-between border-t pt-3 mt-1">
              <span className="text-[11px] text-slate-500 font-semibold">
                Route optimization conforms to safety algorithms.
              </span>
              <button
                onClick={() => setShowOverride(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border rounded-lg text-xs font-bold transition duration-150"
              >
                Human Override Route
              </button>
            </div>
          </div>
        )}

        {/* Route Directions Log */}
        {activeRoute && (
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col gap-3">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b pb-2 flex justify-between items-center">
              <span>Driving Route Directions</span>
              <span className="text-[10px] text-slate-400 font-bold">{activeRoute.majorTurns} Major Segments</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-3 text-xs font-bold text-slate-500 border-b pb-3.5">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Total Distance</span>
                <span className="text-slate-900 text-sm font-extrabold">{activeRoute.distance} km</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Travel Time</span>
                <span className="text-slate-900 text-sm font-extrabold">{activeRoute.eta} mins</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Route Status</span>
                <span className={`text-[10px] font-extrabold uppercase ${
                  activeRoute.status === 'Clear' ? 'text-emerald-600' : activeRoute.status === 'Caution' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {activeRoute.status}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {activeRoute.directions.map((step, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs font-semibold text-slate-700 leading-normal">
                  <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-slate-100 border text-[9px] font-bold text-slate-500 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-[11px] font-medium text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Human Override Dialog Modal */}
      {showOverride && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border max-w-md w-full p-5 shadow-2xl relative">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">Operator Route Override</h3>
            <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
              Responsible AI requires documenting why recommendation calculations are being overridden. This selection will save directly to the Audit Log.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Override Reason</label>
                <select 
                  value={overrideReason} 
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                >
                  <option value="Driver Local Knowledge">Driver Local Knowledge (Terrain updates)</option>
                  <option value="Emergency Requirement">Emergency Dispatch Priority</option>
                  <option value="Road Information Incorrect">GIS Map Data Incorrect</option>
                  <option value="Customer Request">Special Customer Delivery Request</option>
                  <option value="Other">Other Write-in Reason</option>
                </select>
              </div>

              {overrideReason === 'Other' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Specify Reason</label>
                  <textarea 
                    value={customReason} 
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom override reason..." 
                    className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50 min-h-16"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold">
              <button 
                onClick={() => setShowOverride(false)}
                className="px-3.5 py-1.5 border hover:bg-slate-50 text-slate-500 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleOverrideSubmit}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
              >
                Submit & Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
