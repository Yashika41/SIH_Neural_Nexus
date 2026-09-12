import React from 'react';
import { useStore } from '../store/useStore.js';
import MapComponent from './maps/MapComponent.jsx';
import { Truck, AlertTriangle, ShieldCheck, Activity, CloudRain } from 'lucide-react';

export default function Overview() {
  const vehicles = useStore((state) => state.vehicles);
  const incidents = useStore((state) => state.incidents);
  const rainSimulationActive = useStore((state) => state.rainSimulationActive);
  const toggleRainSimulation = useStore((state) => state.toggleRainSimulation);

  const activeFleets = vehicles.filter(v => v.status === 'Available' || v.status === 'Delivering').length;
  const activeHazards = incidents.filter(i => i.status === 'Active').length;

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Fleets</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{activeFleets} / {vehicles.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Hazards</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{activeHazards} Incidents</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accessibility Score</div>
            <div className="text-xl font-extrabold text-indigo-600 mt-1">94.8%</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operational Efficiency</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">98.2%</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Map & Live Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Live GIS Operational Fleet & Hazard Map</h3>
          </div>
          <button 
            onClick={toggleRainSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              rainSimulationActive 
                ? 'bg-blue-600 text-white shadow' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            <CloudRain className="h-4 w-4" />
            <span>Monsoon Rain Sim: {rainSimulationActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
        <div className="h-[420px]">
          <MapComponent activeTab="overview" />
        </div>
      </div>
    </div>
  );
}
