'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ClipboardList, ChevronDown, ChevronUp, UserCheck, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { AuditLog } from '../types';

export default function AuditLogComponent() {
  const auditLogs = useStore((state) => state.auditLogs);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Decision Audit Log</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Audit historical route optimization decisions, multi-objective trade-offs, and driver overrides
          </p>
        </div>
        <button
          onClick={() => {
            alert('Audit report exported to CSV successfully.');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border rounded-lg text-xs font-bold text-slate-700 transition"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Task Context</th>
                <th className="p-4">Recommendation Selected</th>
                <th className="p-4">Triggering Event</th>
                <th className="p-4">Human Override</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                    No route decision logs found. Open Smart Routing to optimize.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-slate-50/50 cursor-pointer ${isExpanded ? 'bg-slate-50/30' : ''}`}
                        onClick={() => toggleExpand(log.id)}
                      >
                        <td className="p-4">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-extrabold text-slate-900">{log.orderId}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{log.origin.substring(0, 15)} &rarr; {log.destination.substring(0, 15)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-900 font-extrabold">{log.selectedRouteName}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-semibold">
                          {log.triggeringEvent || 'Manual Optimization'}
                        </td>
                        <td className="p-4">
                          {log.humanOverride ? (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 self-start w-fit">
                              <UserCheck className="h-3 w-3" />
                              <span>Override</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Calculated</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 font-medium">
                          Click to expand
                        </td>
                      </tr>

                      {/* Expanded Details Card */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50 border-t p-4 font-semibold text-xs text-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 leading-normal">
                              
                              {/* Weights Block */}
                              <div className="md:col-span-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1.5">
                                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dijkstra Parameter Weights</h4>
                                {Object.entries(log.weights).map(([wKey, wVal]) => (
                                  <div key={wKey} className="flex justify-between items-center text-[10px] font-bold text-slate-600 border-b pb-0.5 capitalize">
                                    <span>{wKey}:</span>
                                    <span>{wVal}%</span>
                                  </div>
                                ))}
                              </div>

                              {/* Reasoning Text Block */}
                              <div className="md:col-span-6 flex flex-col gap-2">
                                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">AI Score Explanation</h4>
                                <p className="text-slate-700 font-bold bg-white p-3 rounded-lg border border-slate-200 shadow-sm leading-relaxed">
                                  {log.explanation}
                                </p>
                                {log.humanOverride && (
                                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[10px] text-amber-800 font-bold flex items-center gap-1.5 mt-1">
                                    <ShieldAlert className="h-4 w-4" />
                                    <span>Override Reason: {log.overrideReason}</span>
                                  </div>
                                )}
                              </div>

                              {/* Evaluated routes summary */}
                              <div className="md:col-span-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
                                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Calculated Alternatives</h4>
                                <div className="space-y-1.5 text-[10px]">
                                  {log.routesEvaluated.map((re, ri) => (
                                    <div key={ri} className="flex justify-between items-center font-bold text-slate-600 border-b pb-1">
                                      <span className={re.name === log.selectedRouteName ? 'text-indigo-600 font-extrabold' : ''}>{re.name.substring(0, 15)}:</span>
                                      <div className="flex gap-2">
                                        <span>{re.eta}m</span>
                                        <span>{re.distance}km</span>
                                        <span className="text-emerald-600">{re.accessibilityScore}a</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
