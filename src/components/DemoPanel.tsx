'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { ChevronRight, ChevronLeft, RefreshCw, X, AlertCircle } from 'lucide-react';

export default function DemoPanel() {
  const demoActive = useStore((state) => state.demoActive);
  const demoStep = useStore((state) => state.demoStep);
  const demoSteps = useStore((state) => state.demoSteps);
  const nextDemoStep = useStore((state) => state.nextDemoStep);
  const prevDemoStep = useStore((state) => state.prevDemoStep);
  const resetDemo = useStore((state) => state.resetDemo);
  const selectedOrder = useStore((state) => state.selectedOrder);
  const selectedVehicle = useStore((state) => state.selectedVehicle);
  const activeRouteOptions = useStore((state) => state.activeRouteOptions);

  if (!demoActive) return null;

  const currentStep = demoSteps[demoStep - 1];
  if (!currentStep) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white border border-slate-300 shadow-2xl rounded-xl p-4 text-slate-800 z-50 animate-slide-in pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-slate-900 animate-pulse"></span>
          <h3 className="font-extrabold text-sm tracking-wide text-slate-900">SIH JUDGES DEMO MODE</h3>
        </div>
        <button 
          onClick={resetDemo}
          className="text-slate-400 hover:text-slate-700 transition duration-150 p-1 hover:bg-slate-100 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step Progress Tracker */}
      <div className="flex items-center gap-1 mb-3">
        {demoSteps.map((_, idx) => (
          <div 
            key={idx} 
            className={`flex-1 h-1.5 rounded transition-all duration-300 ${
              idx + 1 === demoStep 
                ? 'bg-slate-900' 
                : idx + 1 < demoStep 
                  ? 'bg-slate-400' 
                  : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Step Info */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Step {demoStep} of {demoSteps.length}
        </div>
        <h4 className="font-bold text-sm text-slate-900 mb-1.5">{currentStep.title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">{currentStep.desc}</p>
      </div>

      {/* Checklist / Helpers */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-xs">
          <input 
            type="checkbox" 
            checked={demoStep >= 1 && selectedOrder?.id === 'ORD-103' && selectedVehicle?.id === 'VN-002'} 
            readOnly 
            className="mt-0.5 accent-slate-900 rounded border-slate-300 pointer-events-none"
          />
          <span className="text-slate-700 font-medium">Order: ORD-103 (Bara Bazar → NEHU) assigned to Eco-Van</span>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <input 
            type="checkbox" 
            checked={demoStep >= 2 && activeRouteOptions.length > 0} 
            readOnly 
            className="mt-0.5 accent-slate-900 rounded border-slate-300 pointer-events-none"
          />
          <span className="text-slate-700 font-medium">Three distinct routes optimized in real-time</span>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <input 
            type="checkbox" 
            checked={demoStep >= 4 && useStore.getState().incidents.some(i => i.type === 'Landslide' && i.status === 'Active')} 
            readOnly 
            className="mt-0.5 accent-slate-900 rounded border-slate-300 pointer-events-none"
          />
          <span className="text-slate-700 font-medium">Landslide incident simulation active</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevDemoStep}
          disabled={demoStep === 1}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-xs font-bold text-slate-700 transition duration-150 border border-slate-300/80"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition duration-150"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Restart</span>
          </button>
          
          <button
            onClick={nextDemoStep}
            className="flex items-center gap-1 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-bold text-white shadow-sm transition duration-150"
          >
            <span>{demoStep === demoSteps.length ? 'Finish' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
