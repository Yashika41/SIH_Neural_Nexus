import React from 'react';
import { useStore } from '../store/useStore.js';
import { 
  LayoutDashboard, Navigation, Package, Truck, 
  Accessibility, MessageSquare, BarChart3, Settings, 
  User, ShieldAlert, LifeBuoy, LogOut, RotateCcw
} from 'lucide-react';

export default function Sidebar() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const selectedRegion = useStore((state) => state.selectedRegion);
  const userRole = useStore((state) => state.userRole);
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const setRole = useStore((state) => state.setRole);

  const userMenuItems = [
    { id: 'overview', name: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'routing', name: 'Smart Routing & Place Order', icon: Navigation },
    { id: 'trackOrder', name: 'Track My Order', icon: Package },
    { id: 'accessTerrain', name: 'Accessibility & Risk Map', icon: Accessibility },
    { id: 'feedbackIncident', name: 'Feedback & Incidents', icon: MessageSquare },
    { id: 'analyticsRegional', name: 'Regional Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const partnerMenuItems = [
    { id: 'partnerDashboard', name: 'Partner Regional Analytics', icon: BarChart3 },
    { id: 'routing', name: 'Assigned Orders & Rerouting', icon: Navigation },
    { id: 'fleet', name: 'Fleet Telemetry', icon: Truck },
    { id: 'emergencyHelp', name: 'Emergency Vehicle Help', icon: LifeBuoy },
    { id: 'feedbackIncident', name: 'Incidents & Feedback', icon: MessageSquare },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const menuItems = userRole === 'partner' ? partnerMenuItems : userMenuItems;

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col h-screen flex-shrink-0 z-20 shadow-sm border-r border-slate-200/90">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/90 flex flex-col gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            N
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-wide">Neural Nexus</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider bg-slate-200/70 px-2 py-0.5 rounded border border-slate-300/80">
            {selectedRegion} HQ
          </span>

          <button 
            onClick={() => setRole(userRole === 'user' ? 'partner' : 'user')}
            className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1 hover:bg-indigo-100"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Switch to {userRole === 'user' ? 'Partner' : 'User'}</span>
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="p-3 mx-3 mt-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
            {userRole === 'user' ? 'U' : 'P'}
          </div>
          <div className="truncate">
            <div className="font-extrabold text-slate-900 truncate">{currentUser?.name || 'User'}</div>
            <div className="text-[9px] text-emerald-600 font-bold uppercase">{userRole} Portal</div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 text-left ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Log Out */}
      <div className="p-4 border-t border-slate-200/90 bg-slate-50/50 flex flex-col gap-2">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out & Exit</span>
        </button>
      </div>
    </aside>
  );
}
