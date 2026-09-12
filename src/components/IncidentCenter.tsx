'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { AlertOctagon, Filter, CheckCircle2, ShieldAlert, BadgeAlert, AlertCircle } from 'lucide-react';
import { Incident, SeverityLevel, IncidentStatus } from '../types';

export default function IncidentCenter() {
  const incidents = useStore((state) => state.incidents);
  const resolveIncident = useStore((state) => state.resolveIncident);

  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesType = typeFilter === 'All' || inc.type === typeFilter;
    const matchesSeverity = severityFilter === 'All' || inc.severity === severityFilter;
    return matchesType && matchesSeverity;
  });

  const getSeverityStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusStyle = (status: IncidentStatus) => {
    switch (status) {
      case 'Active': return 'bg-red-50 text-red-700 border-red-100';
      case 'Monitoring': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Verified': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  const handleResolve = (id: string, type: string) => {
    resolveIncident(id);
    alert(`Incident ${id} (${type}) has been marked as RESOLVED. Road segments reopened.`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Incident Command Center</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Monitor active landslides, weather blockages, and citizen barrier alerts affecting route grids
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <AlertOctagon className="h-5 w-5 text-rose-500" />
          <span>Active Log Feed: {incidents.filter(i => i.status === 'Active').length} Active Blockages</span>
        </div>

        {/* Dropdowns */}
        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-3 bg-slate-50"
          >
            <option value="All">All Types</option>
            <option value="Landslide">Landslides</option>
            <option value="Road Closure">Road Closures</option>
            <option value="Heavy Rain">Heavy Rain Areas</option>
            <option value="Bridge Closure">Bridge Closures</option>
            <option value="Road Damage">Road Damages</option>
            <option value="Traffic Congestion">Traffic Congestion</option>
            <option value="Accessibility Barrier">Accessibility Barriers</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-3 bg-slate-50"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Incident ID</th>
                <th className="p-4">Incident Details</th>
                <th className="p-4">Location</th>
                <th className="p-4">Severity & Status</th>
                <th className="p-4">Report Time</th>
                <th className="p-4">Source & Conf.</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                    No active/logged incidents match current filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className={`hover:bg-slate-50/50 ${inc.status === 'Resolved' ? 'opacity-60 bg-slate-50/20' : ''}`}>
                    <td className="p-4 font-extrabold text-slate-900">{inc.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 max-w-72">
                        <span className="text-slate-900 font-bold">{inc.type}</span>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{inc.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-950 font-bold">{inc.locationName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Coords: {inc.coords.lat.toFixed(5)}, {inc.coords.lng.toFixed(5)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-extrabold uppercase tracking-wider ${getSeverityStyle(inc.severity)}`}>
                          {inc.severity}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-extrabold uppercase tracking-wider ${getStatusStyle(inc.status)}`}>
                          {inc.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(inc.reportedTime).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-900 font-bold">{inc.source}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Confidence: {inc.confidence}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {inc.status === 'Active' ? (
                        <button
                          onClick={() => handleResolve(inc.id, inc.type)}
                          className="flex items-center justify-center gap-1 mx-auto px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase transition shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-bold">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
