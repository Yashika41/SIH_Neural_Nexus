import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import MapComponent from './maps/MapComponent.jsx';
import { routeOptimizer, NORTHEAST_NODES } from '../services/routeOptimizer.js';
import { processCopilotPrompt } from '../services/copilotService.js';
import { 
  Navigation, Bot, Send, Sparkles, AlertTriangle, 
  CheckCircle2, Clock, MapPin, Truck, ShieldAlert 
} from 'lucide-react';

export default function SmartRouting() {
  const selectedOrder = useStore((state) => state.selectedOrder);
  const selectedVehicle = useStore((state) => state.selectedVehicle);
  const vehicles = useStore((state) => state.vehicles);
  const activeRouteOptions = useStore((state) => state.activeRouteOptions);
  const selectedRouteId = useStore((state) => state.selectedRouteId);
  const setSelectedRouteId = useStore((state) => state.setSelectedRouteId);
  const setActiveRouteOptions = useStore((state) => state.setActiveRouteOptions);
  const incidents = useStore((state) => state.incidents);
  const rainSimulationActive = useStore((state) => state.rainSimulationActive);

  // Form State
  const [pickup, setPickup] = useState(selectedOrder?.pickup || 'Bara Bazar / Iewduh');
  const [destination, setDestination] = useState(selectedOrder?.destination || 'NEHU');
  const [cargoType, setCargoType] = useState(selectedOrder?.cargoType || 'Vaccine & Medical Supplies');
  const [priority, setPriority] = useState(selectedOrder?.priority || 'Emergency');
  const [weight, setWeight] = useState(selectedOrder?.weight || 150);
  const [vehicleId, setVehicleId] = useState(selectedVehicle?.id || 'VN-002');
  const [accessibilityReqs, setAccessibilityReqs] = useState(['Wheelchair Accessible', 'Avoid Very Steep Sections']);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Copilot State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLog, setCopilotLog] = useState([
    { sender: 'ai', text: '👋 Welcome! I am your AI Routing Copilot. Type your shipment goal or click a scenario preset below to automatically optimize routes.' }
  ]);

  const landmarksList = NORTHEAST_NODES.map(n => n.name);

  const getCoords = (name) => {
    const node = NORTHEAST_NODES.find(n => n.name === name);
    return node ? node.coords : { lat: 25.5788, lng: 91.8833 };
  };

  const handleRunOptimization = async (overrideCargo = cargoType, overridePriority = priority) => {
    setIsOptimizing(true);
    const pickupCoords = getCoords(pickup);
    const destinationCoords = getCoords(destination);
    const targetVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

    const mockOrder = {
      ...selectedOrder,
      pickup,
      pickupCoords,
      destination,
      destinationCoords,
      priority: overridePriority,
      weight,
      cargoType: overrideCargo,
      accessibilityRequirements: accessibilityReqs
    };

    useStore.setState({ selectedOrder: mockOrder, selectedVehicle: targetVehicle });

    const routes = await routeOptimizer(
      pickupCoords,
      destinationCoords,
      targetVehicle,
      overridePriority,
      weight,
      accessibilityReqs,
      [],
      incidents,
      rainSimulationActive,
      overrideCargo
    );

    setActiveRouteOptions(routes);
    setIsOptimizing(false);
  };

  const handleCopilotSubmit = (e) => {
    e?.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput.trim();
    const result = processCopilotPrompt(userText, selectedOrder);

    setCopilotLog(prev => [
      ...prev,
      { sender: 'user', text: userText },
      { sender: 'ai', text: result.advisoryMessage }
    ]);

    setCargoType(result.suggestedCargo);
    setPriority(result.suggestedPriority);
    setAccessibilityReqs(result.suggestedAccessibility);
    setCopilotInput('');

    handleRunOptimization(result.suggestedCargo, result.suggestedPriority);
  };

  const handlePresetClick = (presetType) => {
    let text = '';
    if (presetType === 'vaccine') text = 'Transport emergency cold-chain vaccine supplies avoiding steep hills and landslides';
    if (presetType === 'gravel') text = 'Transport heavy construction gravel cargo on wide low incline roads';
    if (presetType === 'landslide') text = 'Reroute active delivery away from Mawlai landslide hazard';

    const result = processCopilotPrompt(text, selectedOrder);
    setCopilotLog(prev => [
      ...prev,
      { sender: 'user', text },
      { sender: 'ai', text: result.advisoryMessage }
    ]);

    setCargoType(result.suggestedCargo);
    setPriority(result.suggestedPriority);
    setAccessibilityReqs(result.suggestedAccessibility);

    handleRunOptimization(result.suggestedCargo, result.suggestedPriority);
  };

  const activeRoute = activeRouteOptions.find(r => r.id === selectedRouteId) || activeRouteOptions[0];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 h-full overflow-y-auto">
      {/* Left Column: AI Copilot & Form Controls */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        {/* AI Copilot Box */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-md border border-indigo-900/50 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-sm tracking-wide">AI Routing Copilot</span>
            </div>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-bold border border-indigo-400/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live Assistant
            </span>
          </div>

          {/* Quick Scenario Presets */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handlePresetClick('vaccine')}
              className="text-[10px] font-bold bg-slate-800 hover:bg-indigo-600 border border-slate-700 px-2.5 py-1 rounded-full text-indigo-200 hover:text-white transition duration-150"
            >
              💉 Vaccine Emergency
            </button>
            <button 
              onClick={() => handlePresetClick('gravel')}
              className="text-[10px] font-bold bg-slate-800 hover:bg-indigo-600 border border-slate-700 px-2.5 py-1 rounded-full text-indigo-200 hover:text-white transition duration-150"
            >
              🏗️ Heavy Gravel Transit
            </button>
            <button 
              onClick={() => handlePresetClick('landslide')}
              className="text-[10px] font-bold bg-slate-800 hover:bg-indigo-600 border border-slate-700 px-2.5 py-1 rounded-full text-indigo-200 hover:text-white transition duration-150"
            >
              ⚠ Landslide Bypass
            </button>
          </div>

          {/* Copilot Chat Transcript */}
          <div className="bg-slate-900/80 rounded-lg p-3 max-h-36 overflow-y-auto space-y-2 border border-slate-800 text-xs">
            {copilotLog.map((m, idx) => (
              <div key={idx} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded-lg max-w-[85%] ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Copilot Input Form */}
          <form onSubmit={handleCopilotSubmit} className="flex gap-2">
            <input 
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="Ask AI Copilot (e.g. 'Transport vaccines avoiding steep hills')..."
              className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg flex items-center justify-center transition">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Route Constraints Form */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col gap-4">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-indigo-500" />
            <span>Route Constraints & Parameters</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pickup (Origin)</label>
              <select 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)}
                className="w-full text-xs font-semibold rounded border-slate-300 bg-slate-50 py-1.5 px-2"
              >
                {landmarksList.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Destination</label>
              <select 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-xs font-semibold rounded border-slate-300 bg-slate-50 py-1.5 px-2"
              >
                {landmarksList.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Multimodal Cargo</label>
              <select 
                value={cargoType} 
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full text-xs font-semibold rounded border-slate-300 bg-slate-50 py-1.5 px-2"
              >
                <option value="Vaccine & Medical Supplies">Vaccine & Medical Supplies</option>
                <option value="Heavy Construction & Gravel">Heavy Construction & Gravel</option>
                <option value="Perishable Agri-Produce">Perishable Agri-Produce</option>
                <option value="Standard Freight">Standard Freight</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Order Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs font-semibold rounded border-slate-300 bg-slate-50 py-1.5 px-2"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assigned Vehicle</label>
              <select 
                value={vehicleId} 
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full text-xs font-semibold rounded border-slate-300 bg-slate-50 py-1.5 px-2"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payload Weight (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold rounded border-slate-300 bg-slate-50 py-1.5 px-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleRunOptimization()}
              disabled={isOptimizing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-lg shadow transition duration-150 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isOptimizing ? 'Analyzing...' : 'Analyze Route'}</span>
            </button>

            <button
              onClick={() => {
                const pickupCoords = getCoords(pickup);
                const destinationCoords = getCoords(destination);
                const placeOrderAndDispatch = useStore.getState().placeOrderAndDispatch;
                placeOrderAndDispatch({
                  customer: 'Shillong Civil Hospital',
                  pickup,
                  pickupCoords,
                  destination,
                  destinationCoords,
                  priority,
                  weight,
                  cargoType,
                  accessibilityRequirements: accessibilityReqs
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-lg shadow transition duration-150 flex items-center justify-center gap-1.5"
            >
              <Truck className="h-4 w-4" />
              <span>Place & Auto-Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Google Maps Style Visualizer */}
      <div className="xl:col-span-7 flex flex-col gap-4">
        {/* Active AI Hazard Reroute Alert Banner */}
        {incidents.some(i => i.status === 'Active') && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-3 shadow-sm flex items-center justify-between text-xs font-extrabold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 animate-pulse" />
              <span>AI Hazard Alert: Landslide on Mawlai Bypass. Automated safe rerouting active.</span>
            </div>
            <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px]">Active Reroute</span>
          </div>
        )}
        {/* Evaluated Header Badge */}
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">Route Visualizer</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Showing {activeRouteOptions.length} Evaluated Options
            </span>
          </div>
          {activeRoute && (
            <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
              <span>⏱ {activeRoute.eta} min</span>
              <span>📏 {activeRoute.distance} km</span>
              <span className="text-indigo-600 font-extrabold">Score: {activeRoute.finalScore}/100</span>
            </div>
          )}
        </div>

        {/* GIS Map */}
        <div className="h-[420px]">
          <MapComponent activeTab="routing" />
        </div>

        {/* Candidate Route Cards */}
        {activeRouteOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeRouteOptions.map((ro) => {
              const isSelected = ro.id === selectedRouteId;
              return (
                <div 
                  key={ro.id}
                  onClick={() => setSelectedRouteId(ro.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900 truncate">{ro.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        ro.status === 'Blocked' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ro.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>⏱ ETA: <span className="font-bold text-slate-900">{ro.eta} mins</span></div>
                      <div>📏 Dist: <span className="font-bold text-slate-900">{ro.distance} km</span></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-extrabold">
                    <span className="text-slate-500">AI Score</span>
                    <span className="text-indigo-600">{ro.finalScore}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
