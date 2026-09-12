import React from 'react';
import { Settings, Shield, Bell, Database } from 'lucide-react';

export default function SettingsComponent() {
  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          <span>System Settings & Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold">Manage AI optimization parameters and system defaults</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <Shield className="h-4 w-4 text-indigo-600" />
            <span>AI Routing Thresholds</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold text-slate-700">Safety Corridor Radius</span>
              <span className="font-bold text-slate-900">500 meters</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold text-slate-700">Max Incline Limit (Heavy Cargo)</span>
              <span className="font-bold text-slate-900">8.0% Grade</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <Database className="h-4 w-4 text-emerald-600" />
            <span>System Information</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold text-slate-700">Architecture</span>
              <span className="font-bold text-slate-900">Vite + React (JavaScript)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold text-slate-700">GIS Provider</span>
              <span className="font-bold text-indigo-600">OpenStreetMap / OSRM API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
