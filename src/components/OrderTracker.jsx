import React from 'react';
import { useStore } from '../store/useStore.js';
import MapComponent from './maps/MapComponent.jsx';
import { Package, Truck, Phone, ShieldCheck, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function OrderTracker() {
  const selectedOrder = useStore((state) => state.selectedOrder);
  const vehicles = useStore((state) => state.vehicles);

  const assignedVehicle = vehicles.find((v) => v.id === selectedOrder?.assignedVehicleId) || vehicles[0];

  if (!selectedOrder) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        No active order selected to track. Please place an order in Smart Routing.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <span>Live Order Tracking: {selectedOrder.id}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Real-time GPS tracking and assigned partner fleet telemetry</p>
        </div>
        <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
          Status: {selectedOrder.status}
        </span>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between text-xs font-extrabold text-slate-700">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>1. Order Placed</span>
        </div>
        <div className="h-0.5 w-12 bg-emerald-500" />
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>2. AI Partner Assigned</span>
        </div>
        <div className="h-0.5 w-12 bg-indigo-500" />
        <div className="flex items-center gap-2 text-indigo-600">
          <Truck className="h-4 w-4" />
          <span>3. En Route ({selectedOrder.eta} min ETA)</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-300" />
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>4. Delivered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Assigned Partner & Fleet Telemetry Card */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <Truck className="h-4 w-4 text-indigo-600" />
            <span>Assigned Partner & Fleet Telemetry</span>
          </h3>

          {/* Driver Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
              {assignedVehicle.driverName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-xs text-slate-900">{assignedVehicle.driverName}</div>
              <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-600" />
                <span>{assignedVehicle.driverPhone}</span>
              </div>
            </div>
            <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
              Verified Partner
            </span>
          </div>

          {/* Fleet Telemetry Specs */}
          <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Assigned Vehicle</span>
              <span className="font-extrabold text-slate-900">{assignedVehicle.name}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Vehicle Type</span>
              <span className="font-extrabold text-slate-900">{assignedVehicle.type}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Ground Clearance</span>
              <span className="font-extrabold text-slate-900">{assignedVehicle.groundClearance} mm</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Battery / Fuel</span>
              <span className="font-extrabold text-indigo-600">{assignedVehicle.fuelCharge}%</span>
            </div>
          </div>

          {/* Accessibility Compliance Equipment Badge */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Accessibility Capability:</span>
            </div>
            <span className="bg-white px-2 py-0.5 rounded text-emerald-700 border border-emerald-300">
              {assignedVehicle.accessibilityCapability}
            </span>
          </div>
        </div>

        {/* Right: Live GPS Map */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 uppercase">Live GPS Tracking Map</span>
            <span className="text-[10px] text-indigo-600 font-bold">Live GPS Updates Active</span>
          </div>
          <div className="h-[380px]">
            <MapComponent activeTab="trackOrder" />
          </div>
        </div>
      </div>
    </div>
  );
}
