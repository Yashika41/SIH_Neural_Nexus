'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import DynamicMap from './maps/DynamicMap';
import { AlertTriangle, Mountain, ShieldCheck, ShieldAlert, Compass } from 'lucide-react';

export default function TerrainRiskMap() {
  const zones = useStore((state) => state.zones);

  const highRiskZones = zones.filter((z) => z.terrainRisk >= 50);
  const moderateRiskZones = zones.filter((z) => z.terrainRisk >= 30 && z.terrainRisk < 50);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 h-full overflow-y-auto">
      {/* Side details */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        {/* Hotspots Panel */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col gap-4">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
            <Mountain className="h-4.5 w-4.5 text-indigo-500" />
            <span>Regional Terrain Hazards</span>
          </h3>

          <div className="space-y-3.5">
            {/* Critical Risks */}
            <div>
              <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Critical / High Susceptibility Zones</span>
              </h4>
              <div className="space-y-2">
                {highRiskZones.map((z) => (
                  <div key={z.id} className="border border-red-200 bg-red-50/50 p-3 rounded-lg text-xs font-semibold">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-red-950">{z.name}</span>
                      <span className="bg-red-100 text-red-800 border px-1.5 py-0.5 rounded font-extrabold text-[9px]">
                        Risk: {z.terrainRisk}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-red-800/80 leading-relaxed font-semibold">
                      Challenge: {z.primaryChallenge}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderate Risks */}
            <div>
              <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Moderate Risk Zones</span>
              </h4>
              <div className="space-y-2">
                {moderateRiskZones.map((z) => (
                  <div key={z.id} className="border border-orange-200 bg-orange-50/50 p-3 rounded-lg text-xs font-semibold">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-orange-950">{z.name}</span>
                      <span className="bg-orange-100 text-orange-800 border px-1.5 py-0.5 rounded font-extrabold text-[9px]">
                        Risk: {z.terrainRisk}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-orange-800/80 leading-relaxed font-semibold">
                      Challenge: {z.primaryChallenge}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hazard guidelines card */}
        <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-4 flex flex-col gap-2.5">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Terrain Mitigation Protocol
          </h4>
          <p className="text-xs leading-relaxed font-semibold text-slate-400">
            Shillong Peak and Upper Shillong highway links carry high landslide vulnerability during periods of rainfall &gt; 50mm.
          </p>
          <ul className="space-y-1 text-[11px] font-semibold text-slate-300">
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-bold">&#8226;</span>
              <span>Cargo &gt; 1500kg routed exclusively on wide state highways.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-bold">&#8226;</span>
              <span>4x4 utilities auto-prioritized for routes exceeding 10% slope.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-bold">&#8226;</span>
              <span>Alert warnings penalize segments in Dijkstra graph immediately.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Map visualization */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-[600px]">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center justify-between">
            <span>Terrain & Elevation Risk GIS Map Layer</span>
            <span className="text-[10px] text-slate-400 font-bold">Risk classification view</span>
          </h3>

          <div className="flex-1 min-h-[400px]">
            <DynamicMap viewMode="terrain" />
          </div>
        </div>
      </div>
    </div>
  );
}
