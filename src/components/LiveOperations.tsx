'use client';

import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import DynamicMap from './maps/DynamicMap';
import { 
  Play, Pause, FastForward, CloudRain, 
  AlertOctagon, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { IncidentType } from '../types';

export default function LiveOperations() {
  const isSimulating = useStore((state) => state.isSimulating);
  const simulationSpeed = useStore((state) => state.simulationSpeed);
  const rainSimulationActive = useStore((state) => state.rainSimulationActive);
  const vehicles = useStore((state) => state.vehicles);
  const orders = useStore((state) => state.orders);
  
  const toggleSimulation = useStore((state) => state.toggleSimulation);
  const setSimulationSpeed = useStore((state) => state.setSimulationSpeed);
  const toggleRainSimulation = useStore((state) => state.toggleRainSimulation);
  const simulateIncident = useStore((state) => state.simulateIncident);
  const clearIncidents = useStore((state) => state.clearIncidents);
  const tickSimulation = useStore((state) => state.tickSimulation);

  // Trigger Tick Interval for Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isSimulating) {
      timer = setInterval(() => {
        tickSimulation();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, tickSimulation]);

  const activeVehicles = vehicles.filter((v) => v.status === 'Delivering' || v.status === 'Delayed');

  const incidentTriggers: { type: IncidentType; label: string; desc: string }[] = [
    { type: 'Landslide', label: 'Simulate Landslide', desc: 'Blocks road segment, triggers critical risk re-routing.' },
    { type: 'Heavy Rain', label: 'Torrential Rain', desc: 'Increases delay risk and reduces travel speed across all routes.' },
    { type: 'Road Closure', label: 'PWD Road Block', desc: 'Blocks road to light vehicles due to resurfacing/maintenance.' },
    { type: 'Bridge Closure', label: 'River Bridge Lock', desc: 'Closes bridge-dependent links, affecting eastern sector passes.' },
    { type: 'Road Damage', label: 'Shoulder Collapse', desc: 'Increases local risk, forces heavy vehicles to detour.' },
    { type: 'Traffic Congestion', label: 'Bazar Deadlock', desc: 'Severe traffic slowdown at central junction.' },
    { type: 'Accessibility Barrier', label: 'Accessibility Barrier', desc: 'Spill or stairs reported, penalizing wheelchair paths.' }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 h-full overflow-y-auto">
      {/* Simulation Controls Column */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        {/* Simulation Control Card */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center justify-between">
            <span>Simulator Engine</span>
            <span className={`h-2.5 w-2.5 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
          </h3>

          <div className="space-y-4">
            {/* Play/Pause */}
            <div className="flex gap-2">
              <button
                onClick={toggleSimulation}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-extrabold text-xs transition duration-150 ${
                  isSimulating 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/15' 
                    : 'bg-indigo-600 hover:bg-indigo-505 text-white shadow-md shadow-indigo-600/15'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="h-4.5 w-4.5" />
                    <span>Pause Simulation</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4.5 w-4.5" />
                    <span>Resume Simulation</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulation Speed */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Time Compression Speed</label>
              <div className="flex gap-2">
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`flex-1 py-1 px-3 border rounded-lg text-xs font-bold transition duration-150 ${
                      simulationSpeed === speed
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {speed}x Realtime
                  </button>
                ))}
              </div>
            </div>

            {/* Weather toggle */}
            <div>
              <button
                onClick={toggleRainSimulation}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-extrabold text-xs border transition duration-150 ${
                  rainSimulationActive 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-extrabold' 
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CloudRain className={`h-4.5 w-4.5 ${rainSimulationActive ? 'animate-bounce' : ''}`} />
                <span>Simulate Monsoonal Rain: {rainSimulationActive ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Incident Trigger Card (SIH Judge Highlights) */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center justify-between">
            <span>Trigger Regional Disruption</span>
            <AlertOctagon className="h-4.5 w-4.5 text-rose-500" />
          </h3>
          
          <p className="text-[10px] text-slate-500 font-semibold mb-3 leading-relaxed">
            Trigger a block along active routing lines to demonstrate how the neural network dynamically re-optimizes routes.
          </p>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {incidentTriggers.map((t) => (
              <div 
                key={t.type}
                className="border rounded-lg p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex flex-col gap-0.5 max-w-56">
                  <span className="text-xs font-bold text-slate-900">{t.label}</span>
                  <p className="text-[9px] text-slate-500 font-medium leading-normal">{t.desc}</p>
                </div>
                <button
                  onClick={() => {
                    simulateIncident(t.type);
                    alert(`Simulated Incident Triggered: ${t.type}. Recalculating active fleet paths.`);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold tracking-wider uppercase transition shadow-sm"
                >
                  Fire
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              clearIncidents();
              alert('All simulated road blockages resolved.');
            }}
            className="w-full mt-4 py-2 border rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-xs transition text-center"
          >
            Clear All Active Disruption Blocks
          </button>
        </div>
      </div>

      {/* Right Column: Fleet tracking & Map */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        {/* Map */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-[380px]">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center justify-between">
            <span>Live Grid Tracking Screen</span>
            <span className="text-[10px] text-slate-400 font-bold">Centering Shillong</span>
          </h3>
          <div className="flex-1 min-h-[250px]">
            <DynamicMap viewMode="operations" />
          </div>
        </div>

        {/* Running simulation trackers */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 border-b pb-2">
            Active Vehicles GPS Dispatch Feed
          </h3>

          <div className="space-y-2">
            {activeVehicles.length === 0 ? (
              <div className="text-center text-xs text-slate-400 font-semibold py-6">
                No active delivery vehicles en route. Assign order routes in Smart Routing.
              </div>
            ) : (
              activeVehicles.map((v) => {
                const assignedOrder = orders.find(
                  (o) => o.assignedVehicleId === v.id && o.status !== 'Delivered'
                );

                return (
                  <div key={v.id} className="border border-slate-200/60 p-3 rounded-lg flex items-center justify-between gap-4 text-xs font-semibold hover:bg-slate-50 transition">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{v.name}</span>
                        <span className="bg-purple-100 text-purple-800 text-[9px] border px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Active Route
                        </span>
                      </div>
                      <span className="text-slate-500 font-bold">
                        Driver: {v.driverName} | Current GPS: {v.lat.toFixed(5)}, {v.lng.toFixed(5)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right">
                      {assignedOrder ? (
                        <>
                          <span className="font-extrabold text-slate-900">Order: {assignedOrder.id}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Bound for: {assignedOrder.destination} (ETA: {assignedOrder.eta} mins)
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-semibold">Transit returning</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
