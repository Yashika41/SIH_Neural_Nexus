'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Globe, MapPin, Layers, AlertCircle, Info } from 'lucide-react';

export default function RegionalIntelligence() {
  const regions = useStore((state) => state.regions);
  const regionSelector = useStore((state) => state.regionSelector);
  const setRegionSelector = useStore((state) => state.setRegionSelector);

  const activeRegionObj = regions.find((r) => r.id === regionSelector) || regions[0];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Regional Logistics Intelligence</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Select and inspect logistics resilience metrics across different states in Northeast India
        </p>
      </div>

      {/* Warning banner about prototype metrics */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800 font-semibold leading-relaxed">
        <AlertCircle className="h-4.5 w-4.5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-extrabold">Prototype Demonstration Notice</span>
          <p className="text-[10px] text-amber-700 mt-0.5 leading-normal">
            All regional statistics displayed below are simulated prototype metrics generated for Neural Nexus proof-of-concept modeling and do not represent active governmental census aggregates. Deep seed data coordinates are currently centered on Shillong, Meghalaya.
          </p>
        </div>
      </div>

      {/* Grid selector layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left selector */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col gap-3">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-2">
            <Globe className="h-4.5 w-4.5 text-indigo-500" />
            <span>Select State Jurisdiction</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            {regions.map((r) => {
              const isSelected = r.id === regionSelector;
              return (
                <button
                  key={r.id}
                  onClick={() => setRegionSelector(r.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-600/10'
                      : 'hover:bg-slate-50 text-slate-600 border border-slate-200/60 bg-white'
                  }`}
                >
                  <span>{r.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-indigo-950 text-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                    Coverage: {r.coverage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                <Globe className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <h3 className="font-extrabold text-sm text-slate-900">{activeRegionObj.name} Metrics</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Territory Profile Report</span>
              </div>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 border rounded-lg font-bold">
              Resilience Class: {activeRegionObj.reliability >= 80 ? 'Class A (Robust)' : activeRegionObj.reliability >= 60 ? 'Class B (Moderate)' : 'Class C (Vulnerable)'}
            </span>
          </div>

          {/* Grid indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-slate-200/60 rounded-xl p-3.5 flex flex-col bg-slate-50">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Road Accessibility</span>
              <span className="text-xl font-extrabold text-emerald-600">{activeRegionObj.coverage}%</span>
            </div>
            
            <div className="border border-slate-200/60 rounded-xl p-3.5 flex flex-col bg-slate-50">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Logistics Reliability</span>
              <span className="text-xl font-extrabold text-indigo-600">{activeRegionObj.reliability}%</span>
            </div>

            <div className="border border-slate-200/60 rounded-xl p-3.5 flex flex-col bg-slate-50">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Disruptions</span>
              <span className="text-xl font-extrabold text-rose-600">{activeRegionObj.disruptionsCount}</span>
            </div>

            <div className="border border-slate-200/60 rounded-xl p-3.5 flex flex-col bg-slate-50">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Low Confidence Zones</span>
              <span className="text-xl font-extrabold text-amber-600">{activeRegionObj.lowConfidenceZonesCount}</span>
            </div>
          </div>

          {/* Terrain Challenges list */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State Terrain Obstacles</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
              {activeRegionObj.terrainChallenges.map((c, i) => (
                <div key={i} className="border border-slate-200/60 p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0"></span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Card (Planning Intelligence) */}
          <div className="bg-indigo-950 text-indigo-200 rounded-xl p-4 flex gap-3.5 border border-indigo-900">
            <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">AI Planning Insights</h4>
              <p className="text-xs leading-relaxed text-indigo-300 font-semibold">
                {regionSelector === 'Meghalaya' 
                  ? 'Upper Shillong sector contains the highest landslide vulnerability due to recent monsoonal alerts. Heavy vehicles (Mini/Medium Trucks) must avoid forest lanes linking Laban due to narrow single-lane sections.'
                  : `State coverage indices are currently locked in sparse data mode (${activeRegionObj.coverage}% mapped). Field citizen reporting tools can be deployed to populate accessibility entries around main city centers.`
                }
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
