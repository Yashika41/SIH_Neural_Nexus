'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { X, Database, Settings, Brain, GitCommit, Play, RefreshCcw } from 'lucide-react';

export default function ArchitectureModal() {
  const open = useStore((state) => state.architectureModalOpen);
  const setOpen = useStore((state) => state.setArchitectureModalOpen);

  if (!open) return null;

  const blocks = [
    {
      title: '1. Data Core',
      icon: Database,
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      items: ['Orders & Time Windows', 'Fleet GPS & Capacities', 'OpenStreetMap Grids', 'Citizen Reports Feed', 'Active Landslide Feeds']
    },
    {
      title: '2. Dynamic Features',
      icon: Settings,
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      items: ['Path Slope (%)', 'Weather Impact Coefficients', 'Road Width Ratings', 'Data Sparsity Metrics', 'Segment Risk Ratios']
    },
    {
      title: '3. AI Models / Inference',
      icon: Brain,
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      items: ['ETA Predictor Model', 'Terrain Risk Classifier', 'Accessibility Scorer', 'Delay Risk Predictor', 'Confidence Inference']
    },
    {
      title: '4. VRP Multi-Objective Optimizer',
      icon: GitCommit,
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      items: ['Heuristic Pathfinder', 'Accessibility Constraints', 'Ground Clearance Match', 'Delay Minimization', 'Cost Optimization']
    },
    {
      title: '5. Output Layer',
      icon: Play,
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      items: ['Selected Balanced Route', 'Fastest vs Safest Choices', 'Recalculation Alerts', 'AI Text Explanations', 'Audit Log Archival']
    },
    {
      title: '6. Feedback Loop',
      icon: RefreshCcw,
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      items: ['Driver Verification', 'Citizen Confirmations', 'Operator Actions Portal', 'Dynamic Store Updates', 'Local Weight Tuning']
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in pointer-events-auto">
      <div className="bg-white border border-slate-300 shadow-2xl rounded-2xl max-w-4xl w-full p-6 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-5 border-slate-200">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Neural Nexus Architecture</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Data flow of the North East Smart Logistics & Accessibility Platform
            </p>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Flowchart Blocks */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            {blocks.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-xl p-4 flex flex-col shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${b.color}`}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 font-extrabold text-xs tracking-wide">
                    <Icon className="h-4.5 w-4.5 text-slate-700" />
                    <span>{b.title}</span>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {b.items.map((item, ii) => (
                      <li key={ii} className="text-xs font-semibold flex items-center gap-1.5 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Mathematical Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2">
              Optimization Mathematical Formulation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Traditional routing engines minimize travel duration or mileage. Neural Nexus uses a multi-objective composite objective function:
            </p>
            <div className="bg-slate-100 text-slate-900 font-serif text-center py-3 my-2.5 rounded-lg border border-slate-300 text-xs font-bold leading-relaxed">
              Cost(e) = Distance(e) &times; [ 1 + W_terrain &times; TerrainRisk(e) + W_access &times; (100 - AccessScore(e)) + W_constraints ]
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Where <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">TerrainRisk(e)</code> aggregates path gradient slopes, landslide history, and active rainfall levels; and <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">AccessScore(e)</code> checks compliance with wheelchair/mobility profiles. Missing accessibility data keeps the score low (Unknown data &ne; Accessible), prompting verified feedback updates.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 mt-5 flex justify-end">
          <button 
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition duration-150"
          >
            Got it, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
