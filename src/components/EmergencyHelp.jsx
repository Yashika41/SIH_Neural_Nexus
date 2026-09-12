import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { ShieldAlert, Phone, MapPin, Truck, AlertTriangle, CheckCircle2, LifeBuoy } from 'lucide-react';

export default function EmergencyHelp() {
  const emergencyHubs = useStore((state) => state.emergencyHubs);
  const [sosActive, setSosActive] = useState(false);
  const [sosMessage, setSosMessage] = useState('');

  const handleTriggerSOS = () => {
    setSosActive(true);
    setSosMessage('SOS Emergency Signal Broadcasted to Central Shillong PWD Recovery Unit & Nearby Transporters!');
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-rose-600" />
            <span>Partner Vehicle Emergency Help Center</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Immediate assistance for vehicle breakdown, stuck in mud/landslide, or mechanical failure</p>
        </div>
        <button
          onClick={handleTriggerSOS}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition flex items-center gap-2 animate-pulse"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>SOS: VEHICLE STUCK / NEED HELP</span>
        </button>
      </div>

      {/* SOS Alert Banner */}
      {sosActive && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-center justify-between text-xs text-rose-900 font-bold">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span>{sosMessage}</span>
          </div>
          <button 
            onClick={() => setSosActive(false)}
            className="text-[10px] bg-white px-2 py-1 rounded border border-rose-300 text-rose-700"
          >
            Dismiss SOS
          </button>
        </div>
      )}

      {/* Nearby Assistance Directory */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-indigo-600" />
          <span>Nearby Emergency Recovery Hubs & Mechanics</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyHubs.map((hub) => (
            <div key={hub.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">{hub.name}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {hub.distance}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>📍 Location: <strong className="text-slate-900">{hub.location}</strong></div>
                <div>🔧 Service: <strong className="text-slate-900">{hub.type}</strong></div>
              </div>

              <a 
                href={`tel:${hub.phone}`}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>Call {hub.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
