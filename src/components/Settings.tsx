'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Settings, RefreshCw, Layers, Wrench, HardDrive } from 'lucide-react';

export default function SettingsComponent() {
  const resetDemo = useStore((state) => state.resetDemo);
  const regionSelector = useStore((state) => state.regionSelector);

  const handleReset = () => {
    resetDemo();
    alert('Simulated data reset to initial seed values successfully.');
  };

  const integrations = [
    { name: 'Unified Logistics Interface Platform (ULIP)', desc: 'Integrate National Single Window logistics databases for freight e-way bills.', status: 'Mock Adapter Active' },
    { name: 'FastAPI AI Predictor', desc: 'Plug trained XGBoost model endpoints for real-time terrain and landslide probability risk.', status: 'Prototype Fallback Active' },
    { name: 'Google OR-Tools VRP Solver', desc: 'Deploy optimization clusters solving complex multi-vehicle load distributions.', status: 'TypeScript Heuristic Active' },
    { name: 'OpenRouteService / OSRM', desc: 'Dynamic geographic routing graph inputs to trace street paths over standard OSM grids.', status: 'Graph Pathfinder Snapped' }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">Settings & Integration Hub</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          General simulator settings, memory options, and external API adapter controls
        </p>
      </div>

      {/* Simulator Resets */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-2">
          <Wrench className="h-4.5 w-4.5 text-indigo-500" />
          <span>General Operations & Reset</span>
        </h3>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-900 font-bold">Reset Demo Database</span>
            <p className="text-[10px] text-slate-400 font-semibold">Clear active simulation steps, reports, and restore original Shillong coordinates.</p>
          </div>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Database Seed</span>
          </button>
        </div>
      </div>

      {/* Data Adapters Architecture */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-2">
          <Layers className="h-4.5 w-4.5 text-indigo-500" />
          <span>Extensible API Adapters</span>
        </h3>

        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          Neural Nexus is architected to easily decouple local simulated predictors and swap them for live governmental or machine learning APIs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          {integrations.map((item, idx) => (
            <div key={idx} className="border border-slate-200 bg-slate-50 p-4 rounded-lg flex flex-col justify-between gap-2 shadow-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-900 font-bold">{item.name}</span>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{item.desc}</p>
              </div>
              <span className="text-[9px] bg-slate-900 text-indigo-400 px-2 py-0.5 rounded font-bold self-start font-mono border border-slate-800">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Persistence and storage */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3.5 text-xs font-semibold">
        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <HardDrive className="h-4.5 w-4.5 text-indigo-500" />
          <span>Local Storage Cache</span>
        </h3>
        
        <div className="flex justify-between items-center text-slate-600">
          <span>Active State Scope:</span>
          <span className="text-slate-900 font-bold">{regionSelector} Local Memory Context</span>
        </div>
        <div className="flex justify-between items-center text-slate-600 border-t pt-2">
          <span>Persistent Storage:</span>
          <span className="text-slate-900 font-bold">LocalStorage Cache</span>
        </div>
      </div>
    </div>
  );
}
