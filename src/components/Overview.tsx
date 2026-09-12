'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import DynamicMap from './maps/DynamicMap';
import { 
  AlertTriangle, Truck, Clock, Compass, Activity, 
  Map, ShieldAlert, BadgeAlert, Layers, MapPin
} from 'lucide-react';
import { Order, Incident } from '../types';

export default function Overview() {
  const orders = useStore((state) => state.orders);
  const vehicles = useStore((state) => state.vehicles);
  const incidents = useStore((state) => state.incidents);
  const selectedOrder = useStore((state) => state.selectedOrder);
  const assignVehicleToOrder = useStore((state) => state.assignVehicleToOrder);
  
  // Custom action to select order to display on map
  const selectOrder = (order: Order) => {
    useStore.setState({ selectedOrder: order });
    // snapped vehicle assignment if any
    if (order.assignedVehicleId) {
      const v = vehicles.find((v) => v.id === order.assignedVehicleId);
      if (v) useStore.setState({ selectedVehicle: v });
    }
  };

  // KPI Calculations
  const activeDeliveries = orders.filter((o) => o.status === 'En Route' || o.status === 'Assigned' || o.status === 'Rerouting').length;
  const onlineFleet = vehicles.filter((v) => v.status !== 'Offline').length;
  const activeRoadDisruptions = incidents.filter((i) => i.status === 'Active').length;
  
  const landslideAlerts = incidents.filter((i) => i.type === 'Landslide' && i.status === 'Active').length;
  const roadClosureAlerts = incidents.filter((i) => (i.type === 'Road Closure' || i.type === 'Bridge Closure') && i.status === 'Active').length;
  const lowConfidenceCount = useStore((state) => state.zones.filter((z) => z.confidenceScore < 75).length);
  const remoteDeliveries = orders.filter((o) => (o.destination === 'NEHU' || o.destination === 'Shillong Peak') && o.status !== 'Delivered').length;

  const kpis = [
    { title: 'Active Deliveries', value: activeDeliveries, icon: Activity, color: 'text-indigo-600 border-indigo-100 bg-indigo-50/50' },
    { title: 'Fleet Online', value: `${onlineFleet}/${vehicles.length}`, icon: Truck, color: 'text-blue-600 border-blue-100 bg-blue-50/50' },
    { title: 'Active Road Disruptions', value: activeRoadDisruptions, icon: AlertTriangle, color: 'text-rose-600 border-rose-100 bg-rose-50/50' },
    { title: 'Avg ETA (Mins)', value: '24', icon: Clock, color: 'text-amber-600 border-amber-100 bg-amber-50/50' },
    { title: 'On-Time Delivery %', value: '96.2%', icon: Compass, color: 'text-emerald-600 border-emerald-100 bg-emerald-50/50' },
    { title: 'Accessibility Coverage %', value: '82.4%', icon: Layers, color: 'text-teal-600 border-teal-100 bg-teal-50/50' }
  ];

  const regionalAlerts = [
    { title: 'Landslide Warnings', value: landslideAlerts, icon: ShieldAlert, color: landslideAlerts > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200' },
    { title: 'Road Closures', value: roadClosureAlerts, icon: BadgeAlert, color: roadClosureAlerts > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-500 border-slate-200' },
    { title: 'Low Confidence Zones', value: lowConfidenceCount, icon: Map, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { title: 'Remote Deliveries', value: remoteDeliveries, icon: MapPin, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  ];

  // Feed alerts combining active incidents and system updates
  const recentFeed = incidents.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Overview Command Center</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Real-time logistics monitoring & accessibility risk status for Shillong region
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className={`border rounded-xl p-4 flex flex-col justify-between shadow-sm ${k.color}`}>
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">{k.title}</span>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xl font-extrabold text-slate-900">{k.value}</span>
            </div>
          );
        })}
      </div>

      {/* Regional Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {regionalAlerts.map((r, idx) => {
          const Icon = r.icon;
          return (
            <div key={idx} className={`border rounded-lg p-3 flex items-center gap-3 shadow-sm ${r.color}`}>
              <div className="p-2 rounded-lg bg-white/80 border shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{r.title}</span>
                <span className="text-sm font-extrabold">{r.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Side Panels */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Deliveries List */}
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-[280px]">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between border-b pb-2">
              <span>Active Shipments</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Pending').length}
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
              {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Pending').length === 0 ? (
                <div className="text-center text-xs text-slate-400 font-semibold py-8">
                  No active deliveries en route. Use Smart Routing to dispatch.
                </div>
              ) : (
                orders
                  .filter(o => o.status !== 'Delivered' && o.status !== 'Pending')
                  .map((ord) => {
                    const isSelected = selectedOrder?.id === ord.id;
                    const veh = vehicles.find((v) => v.id === ord.assignedVehicleId);
                    
                    let statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
                    if (ord.status === 'En Route') statusColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                    else if (ord.status === 'Delayed') statusColor = 'bg-red-100 text-red-800 border-red-200';
                    else if (ord.status === 'Rerouting') statusColor = 'bg-purple-100 text-purple-800 border-purple-200';

                    return (
                      <div 
                        key={ord.id}
                        onClick={() => selectOrder(ord)}
                        className={`border p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition duration-150 ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50/20' 
                            : 'border-slate-200/60 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{ord.id}</span>
                            <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${statusColor}`}>
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold mt-1">
                            {ord.pickup} &rarr; {ord.destination}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Driver: {veh?.driverName || 'Unassigned'} ({veh?.name || 'None'})
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-xs font-bold text-slate-900">ETA: {ord.eta}m</span>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Access Score</span>
                            <span className="text-xs font-extrabold text-emerald-600">
                              {ord.routeRisk > 0 ? Math.max(40, 100 - ord.routeRisk) : '92'}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Active Alerts Feed */}
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col flex-1 h-[200px]">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <span>Real-Time Alert Feed</span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {recentFeed.length === 0 ? (
                <div className="text-center text-xs text-slate-400 font-semibold py-8">
                  No active disruption alerts reported.
                </div>
              ) : (
                recentFeed.map((inc) => {
                  return (
                    <div key={inc.id} className="flex gap-2.5 p-2 rounded bg-slate-50 border border-slate-200/50">
                      <div className="mt-0.5">
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">
                            {inc.type} - {inc.severity}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(inc.reportedTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-xs text-slate-700 font-bold">
                          {inc.locationName}
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {inc.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side Map */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-full">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between border-b pb-2">
              <span>Shillong Operational GIS Map</span>
              <span className="text-[10px] text-indigo-600 font-bold">Live Grid Tracking</span>
            </h3>
            <div className="flex-1 min-h-[420px]">
              <DynamicMap viewMode="standard" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
