import React from 'react';
import { useStore } from '../store/useStore.js';
import { Truck, ShieldCheck, BatteryCharging, AlertCircle } from 'lucide-react';

export default function Fleet() {
  const vehicles = useStore((state) => state.vehicles);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900">Fleet & Logistics Management</h2>
          <p className="text-xs text-slate-500 font-semibold">Vehicle specs, load capacities, and high-terrain capabilities</p>
        </div>
        <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          {vehicles.length} Vehicles Online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">{v.name}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">{v.type}</span>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                {v.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Capacity</span>
                <span className="font-extrabold text-slate-900">{v.capacity} kg</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Ground Clearance</span>
                <span className="font-extrabold text-slate-900">{v.groundClearance} mm</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Hill Suitability</span>
                <span className="font-extrabold text-emerald-600">{v.hillSuitability}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Fuel / Battery</span>
                <span className="font-extrabold text-indigo-600">{v.fuelCharge}%</span>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 pt-1 flex items-center justify-between border-t border-slate-100">
              <span>Driver: <strong className="text-slate-800">{v.driverName}</strong></span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{v.accessibilityCapability}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
