'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Truck, Search, Plus, Sliders, Battery, ShieldAlert, Gauge } from 'lucide-react';
import { Vehicle, VehicleType, Rating } from '../types';

export default function Fleet() {
  const vehicles = useStore((state) => state.vehicles);
  const toggleVehicleStatus = useStore((state) => state.toggleVehicleStatus);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.name.toLowerCase().includes(search.toLowerCase()) || 
      v.driverName.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusStyle = (status: Vehicle['status']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Delivering': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delayed': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Offline': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Fleet Monitor</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Track active logistics fleet, fuel indicators, and terrain clearance capabilities across the Shillong grid
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles by name, ID, or driver..." 
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-3 bg-slate-50"
          >
            <option value="All">All Vehicle Types</option>
            <option value="Delivery Bike">Delivery Bikes</option>
            <option value="Electric Van">Electric Vans</option>
            <option value="4x4 Utility Vehicle">4x4 Utility Vehicles</option>
            <option value="Mini Truck">Mini Trucks</option>
            <option value="Medium Truck">Medium Trucks</option>
            <option value="Accessible Mobility Vehicle">Accessible Transport</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-3 bg-slate-50"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Delivering">Delivering</option>
            <option value="Delayed">Delayed</option>
            <option value="Offline">Offline</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((v) => {
          let capacityPct = Math.round((v.load / v.capacity) * 100);
          
          return (
            <div key={v.id} className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col gap-4 shadow-sm relative hover:-translate-y-0.5 transition duration-150">
              {/* Top Row - ID & Status */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-slate-900">{v.id}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({v.type})</span>
                </div>
                <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${getStatusStyle(v.status)}`}>
                  {v.status}
                </span>
              </div>

              {/* Title & Driver */}
              <div className="flex flex-col gap-0.5">
                <h4 className="font-bold text-xs text-slate-900">{v.name}</h4>
                <span className="text-[10px] text-slate-500 font-semibold">Driver: {v.driverName}</span>
              </div>

              {/* Stats - Charge & Capacity */}
              <div className="space-y-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Power / Fuel</span>
                  <div className="flex items-center gap-1">
                    <Battery className={`h-4 w-4 ${v.fuelCharge < 25 ? 'text-red-500' : 'text-emerald-500'}`} />
                    <span>{v.fuelCharge}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Capacity Load</span>
                  <span>{v.load} / {v.capacity} kg</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, capacityPct)}%` }}
                  />
                </div>
              </div>

              {/* Grid Capabilities (Critical project innovation) */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-extrabold border-t pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 uppercase tracking-wider text-[8px]">Ground Clearance</span>
                  <span className="text-slate-800">{v.groundClearance} mm</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 uppercase tracking-wider text-[8px]">Accessibility</span>
                  <span className="text-emerald-600 font-extrabold">{v.accessibilityCapability}</span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  <span className="text-slate-400 uppercase tracking-wider text-[8px]">Slope Climb</span>
                  <span className={`font-extrabold ${v.hillSuitability === 'Excellent' ? 'text-emerald-600' : v.hillSuitability === 'Good' ? 'text-indigo-600' : 'text-amber-600'}`}>
                    {v.hillSuitability}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  <span className="text-slate-400 uppercase tracking-wider text-[8px]">Narrow Lanes</span>
                  <span className={`font-extrabold ${v.narrowRoadSuitability === 'Excellent' ? 'text-emerald-600' : v.narrowRoadSuitability === 'Good' ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {v.narrowRoadSuitability}
                  </span>
                </div>
              </div>

              {/* Status Update Action */}
              <div className="border-t pt-2 mt-1 flex justify-end gap-1.5">
                <select
                  value={v.status}
                  onChange={(e) => toggleVehicleStatus(v.id, e.target.value as any)}
                  className="text-[10px] font-bold rounded border-slate-300 py-1 px-2 bg-slate-50 cursor-pointer text-slate-700"
                >
                  <option value="Available">Set Available</option>
                  <option value="Offline">Set Offline</option>
                  <option value="Maintenance">Set Maintenance</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
