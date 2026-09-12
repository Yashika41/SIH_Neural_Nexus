import React from 'react';
import { useStore } from '../store/useStore.js';
import { BarChart3, Globe, ShieldCheck, MapPin, TrendingUp, Activity } from 'lucide-react';

export default function AnalyticsRegional() {
  const selectedRegion = useStore((state) => state.selectedRegion);
  const setSelectedRegion = useStore((state) => state.setSelectedRegion);

  const neStates = [
    'Meghalaya', 'Assam', 'Arunachal Pradesh', 
    'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Sikkim'
  ];

  // Region-specific mock data
  const regionalData = {
    'Meghalaya': { capital: 'Shillong', successRate: '94.8%', activeCorridors: 14, highRiskZones: 3, roadReliability: '88%' },
    'Assam': { capital: 'Dispur / Guwahati', successRate: '97.2%', activeCorridors: 28, highRiskZones: 2, roadReliability: '94%' },
    'Arunachal Pradesh': { capital: 'Itanagar', successRate: '89.5%', activeCorridors: 9, highRiskZones: 6, roadReliability: '76%' },
    'Nagaland': { capital: 'Kohima', successRate: '91.2%', activeCorridors: 11, highRiskZones: 4, roadReliability: '82%' },
    'Manipur': { capital: 'Imphal', successRate: '90.8%', activeCorridors: 12, highRiskZones: 5, roadReliability: '80%' },
    'Mizoram': { capital: 'Aizawl', successRate: '92.4%', activeCorridors: 10, highRiskZones: 4, roadReliability: '84%' },
    'Tripura': { capital: 'Agartala', successRate: '96.1%', activeCorridors: 15, highRiskZones: 1, roadReliability: '92%' },
    'Sikkim': { capital: 'Gangtok', successRate: '88.9%', activeCorridors: 8, highRiskZones: 5, roadReliability: '75%' }
  };

  const currentStats = regionalData[selectedRegion] || regionalData['Meghalaya'];

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header & Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <span>Combined Analytics & Regional Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Select a North Eastern State to dynamically view region-specific analytics and logistics intelligence</p>
        </div>

        {/* Region Selector Control */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-sm">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Select Region:</label>
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs font-extrabold bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {neStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Region Capital</div>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{currentStats.capital}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Success Rate</div>
          <div className="text-lg font-extrabold text-emerald-600 mt-1">{currentStats.successRate}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Freight Corridors</div>
          <div className="text-lg font-extrabold text-indigo-600 mt-1">{currentStats.activeCorridors} Routes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Road Network Reliability</div>
          <div className="text-lg font-extrabold text-amber-600 mt-1">{currentStats.roadReliability}</div>
        </div>
      </div>

      {/* Regional Intelligence Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          <span>{selectedRegion} Regional Intelligence Summary</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Monsoon Impact Level</span>
            <p className="text-slate-600">Heavy rainfall susceptibility evaluated on hill arterial passes.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">High-Risk Mountain Corridors</span>
            <p className="text-slate-600">{currentStats.highRiskZones} active landslide/gradient monitoring zones.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Accessibility Compliance</span>
            <p className="text-slate-600">Verified wheelchair ramps and accessible transport hubs operational.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
