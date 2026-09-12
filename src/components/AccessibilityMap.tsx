'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import DynamicMap from './maps/DynamicMap';
import { 
  Check, X, AlertTriangle, ShieldCheck, 
  MapPin, HelpCircle, Eye, RefreshCw
} from 'lucide-react';
import { AccessibilityFeature, AccessibilityFeatureType } from '../types';

export default function AccessibilityMap() {
  const features = useStore((state) => state.accessibilityFeatures);
  const verifyFeature = useStore((state) => state.verifyAccessibilityFeature);

  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredFeatures = features.filter((f) => {
    const matchesType = typeFilter === 'All' || f.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || f.verifiedStatus === statusFilter;
    return matchesType && matchesStatus;
  });

  const getFeatureIconColor = (type: AccessibilityFeatureType) => {
    if (type === 'ramp' || type === 'wheelchair accessible' || type === 'accessible crossing') {
      return 'text-emerald-500 bg-emerald-50';
    }
    if (type === 'steep slope' || type === 'poor surface') {
      return 'text-amber-500 bg-amber-50';
    }
    return 'text-rose-500 bg-rose-50';
  };

  const handleVerify = (id: string, status: 'Verified' | 'Rejected') => {
    verifyFeature(id, status);
    alert(`Report ${id} has been marked as ${status.toUpperCase()}. Data confidence adjusted.`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 h-full overflow-y-auto">
      {/* Configuration & Point list */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        {/* Point Details Directory */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Accessibility Directory</h3>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-extrabold text-[10px]">
              {filteredFeatures.length} Points
            </span>
          </div>

          {/* Filtering row */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-2 bg-slate-50"
            >
              <option value="All">All Types</option>
              <option value="wheelchair accessible">Wheelchair Access</option>
              <option value="ramp">Ramps Available</option>
              <option value="stairs">Stairs Mapped</option>
              <option value="steep slope">Steep Slopes</option>
              <option value="accessible crossing">Accessible Crossings</option>
              <option value="poor surface">Poor Road Surfaces</option>
              <option value="temporary obstruction">Temporary Obstructions</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-2 bg-slate-50"
            >
              <option value="All">All Verification</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Point scrollable listing */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {filteredFeatures.length === 0 ? (
              <div className="text-center text-slate-400 font-semibold py-8">
                No accessibility features match current filters.
              </div>
            ) : (
              filteredFeatures.map((feat) => {
                const iconColor = getFeatureIconColor(feat.type);

                return (
                  <div key={feat.id} className="border border-slate-200/60 p-3 rounded-lg flex flex-col gap-2 bg-slate-50 hover:bg-slate-100/50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-md border ${iconColor}`}>
                          <MapPin className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-slate-900 leading-tight">{feat.locationName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold capitalize">
                            {feat.type} | Source: {feat.source}
                          </span>
                        </div>
                      </div>
                      
                      {/* Confidence badge */}
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-slate-400 uppercase font-bold">Confidence</span>
                        <span className={`font-extrabold ${feat.confidence >= 80 ? 'text-emerald-600' : feat.confidence >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {feat.confidence}%
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-600 font-semibold leading-relaxed pl-7">
                      {feat.description}
                    </p>

                    {/* Footer - Verification controls */}
                    <div className="border-t pt-2 mt-1 flex items-center justify-between pl-7">
                      <span className="text-[9px] text-slate-400 font-bold">
                        Last checked: {feat.lastVerified}
                      </span>
                      
                      {feat.verifiedStatus === 'Pending' ? (
                        <div className="flex gap-1.5 font-bold">
                          <button
                            onClick={() => handleVerify(feat.id, 'Rejected')}
                            className="flex items-center gap-0.5 px-2 py-0.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-[9px] transition"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleVerify(feat.id, 'Verified')}
                            className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] transition shadow-sm"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>{feat.verifiedStatus}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Map center column */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-[600px]">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center justify-between">
            <span>City Accessibility Heatmap Layer</span>
            <span className="text-[10px] text-slate-400 font-bold">Zoom centered on Shillong</span>
          </h3>

          <div className="flex-1 min-h-[400px]">
            <DynamicMap viewMode="accessibility" />
          </div>
        </div>
      </div>
    </div>
  );
}
