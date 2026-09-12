'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, Navigation, Package, Truck, Activity, 
  Accessibility, Mountain, AlertTriangle, BarChart3, 
  MessageSquare, ClipboardList, Globe, Settings, HelpCircle
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  icon: React.ElementType;
  badge: number | null;
  badgeColor?: string;
}

export default function Sidebar() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const regionSelector = useStore((state) => state.regionSelector);
  const setArchitectureModalOpen = useStore((state) => state.setArchitectureModalOpen);

  // Database counters for badge notifications
  const pendingOrders = useStore((state) => state.orders.filter(o => o.status === 'Pending').length);
  const activeIncidents = useStore((state) => state.incidents.filter(i => i.status === 'Active').length);
  const onlineVehicles = useStore((state) => state.vehicles.filter(v => v.status === 'Available' || v.status === 'Delivering').length);

  const menuItems: MenuItem[] = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'routing', name: 'Smart Routing', icon: Navigation, badge: null },
    { id: 'orders', name: 'Orders', icon: Package, badge: pendingOrders > 0 ? pendingOrders : null },
    { id: 'fleet', name: 'Fleet', icon: Truck, badge: onlineVehicles > 0 ? onlineVehicles : null },
    { id: 'liveOps', name: 'Live Operations', icon: Activity, badge: null },
    { id: 'accessMap', name: 'Accessibility Map', icon: Accessibility, badge: null },
    { id: 'riskMap', name: 'Terrain & Risk Map', icon: Mountain, badge: null },
    { id: 'incidents', name: 'Incident Center', icon: AlertTriangle, badge: activeIncidents > 0 ? activeIncidents : null, badgeColor: 'bg-rose-600 text-white' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, badge: null },
    { id: 'feedback', name: 'Feedback & Reports', icon: MessageSquare, badge: null },
    { id: 'audit', name: 'AI Decision Audit', icon: ClipboardList, badge: null },
    { id: 'regional', name: 'Regional Intelligence', icon: Globe, badge: null },
    { id: 'settings', name: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col h-screen flex-shrink-0 z-20 shadow-sm border-r border-slate-200/90">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/90 flex flex-col gap-1 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            N
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-wide">Neural Nexus</span>
        </div>
        <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider mt-1.5 bg-slate-200/70 px-2 py-0.5 rounded border border-slate-300/80 self-start">
          {regionSelector} HQ
        </span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== null && (
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200/90 bg-slate-50/50 flex flex-col gap-2.5">
        <button 
          onClick={() => setArchitectureModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-xs font-bold text-slate-800 transition duration-150"
        >
          <HelpCircle className="h-4 w-4 text-slate-600" />
          <span>System Architecture</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center flex flex-col">
          <span className="font-semibold text-slate-600">SIH 2026 Prototype</span>
          <span className="mt-0.5">Neural Nexus &copy; All Rights Reserved</span>
        </div>
      </div>
    </aside>
  );
}
