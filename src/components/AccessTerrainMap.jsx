import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import MapComponent from './maps/MapComponent.jsx';
import { Accessibility, Mountain, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AccessTerrainMap() {
  const [activeLayerFilter, setActiveLayerFilter] = useState('all');

  const accessibilityFeatures = [
    { name: 'Police Bazar Ramp', type: 'Wheelchair Ramp', status: 'Verified', rating: '98%' },
    { name: 'Civil Hospital Tactile Crossing', type: 'Tactile Paving', status: 'Verified', rating: '94%' },
    { name: 'Ward\'s Lake Accessible Trail', type: 'Wheelchair Access', status: 'Verified', rating: '99%' },
    { name: 'Laban Hill Staircase Pass', type: 'Stair Barrier', status: 'Inaccessible', rating: '20%' }
  ];

  const terrainRiskData = [
    { zone: 'Mawlai Bypass Corridor', riskLevel: 'High', slope: '12% Grade', landslideRisk: 'Critical' },
    { zone: 'Shillong Peak Link', riskLevel: 'Severe', slope: '15% Grade', landslideRisk: 'High' },
    { zone: 'Upper Shillong Highway', riskLevel: 'Moderate', slope: '6% Grade', landslideRisk: 'Low' }
  ];

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-indigo-600" />
            <span>Combined Accessibility & Terrain Risk Map</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Unified GIS map tracking physical accessibility barriers and slope gradient risks</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveLayerFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeLayerFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            All Layers
          </button>
          <button 
            onClick={() => setActiveLayerFilter('access')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeLayerFilter === 'access' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Accessibility Ramps
          </button>
          <button 
            onClick={() => setActiveLayerFilter('terrain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeLayerFilter === 'terrain' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Terrain Incline Risk
          </button>
        </div>
      </div>

      {/* Main Map */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="h-[380px]">
          <MapComponent activeTab="accessMap" />
        </div>
      </div>

      {/* Bottom Grid: Dual Intelligence Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Accessibility Infrastructure Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Accessibility Features Audit</span>
          </h3>
          <div className="space-y-2">
            {accessibilityFeatures.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{item.type}</div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    item.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.status} ({item.rating})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Terrain & Landslide Slope Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <Mountain className="h-4 w-4 text-rose-600" />
            <span>Terrain Incline & Landslide Risk</span>
          </h3>
          <div className="space-y-2">
            {terrainRiskData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.zone}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{item.slope}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                    Risk: {item.riskLevel} ({item.landslideRisk})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
