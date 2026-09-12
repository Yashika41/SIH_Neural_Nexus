'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Analytics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full text-slate-500 font-bold">
        <span>Loading Analytics Engine...</span>
      </div>
    );
  }

  // Sample data points matching Shillong seed logistics
  const deliveryPerformanceData = [
    { name: 'On-Time', value: 78, color: '#10b981' },
    { name: 'Delayed', value: 12, color: '#f59e0b' },
    { name: 'Rerouted', value: 8, color: '#a855f7' },
    { name: 'Failed', value: 2, color: '#f43f5e' }
  ];

  const incidentCausesData = [
    { subject: 'Landslides', A: 45, B: 10 },
    { subject: 'Weather/Rain', A: 30, B: 20 },
    { subject: 'Road Closures', A: 15, B: 15 },
    { subject: 'Traffic', A: 8, B: 35 },
    { subject: 'Accessibility', A: 2, B: 20 }
  ];

  const routeComparisonData = [
    { name: 'Fastest Path', eta: 22, risk: 71, access: 58, reliability: 40 },
    { name: 'Safest Path', eta: 29, risk: 24, access: 88, reliability: 90 },
    { name: 'AI Recommended', eta: 26, risk: 31, access: 84, reliability: 85 }
  ];

  const confidenceData = [
    { name: 'Verified (Govt)', value: 40, color: '#10b981' },
    { name: 'High (OSM)', value: 30, color: '#3b82f6' },
    { name: 'Partial (Driver)', value: 15, color: '#eab308' },
    { name: 'Low (Citizen)', value: 10, color: '#f97316' },
    { name: 'Unknown', value: 5, color: '#9ca3af' }
  ];

  const timelineData = [
    { date: 'Aug 17', TraditionalAvgEta: 31, NeuralNexusAvgEta: 25, Incidents: 2 },
    { date: 'Aug 18', TraditionalAvgEta: 34, NeuralNexusAvgEta: 26, Incidents: 4 },
    { date: 'Aug 19', TraditionalAvgEta: 29, NeuralNexusAvgEta: 23, Incidents: 1 },
    { date: 'Aug 20', TraditionalAvgEta: 36, NeuralNexusAvgEta: 27, Incidents: 6 },
    { date: 'Aug 21', TraditionalAvgEta: 38, NeuralNexusAvgEta: 28, Incidents: 5 }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Comparative graphs showing the logistics efficiency and accessibility metrics of Neural Nexus
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Delivery Performance (Pie) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col h-[280px] shadow-sm">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center justify-between">
            <span>Overall Delivery Performance Ratio</span>
            <span className="text-[10px] text-emerald-600 font-bold">96% Safe Arrival</span>
          </h3>
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="w-1/2 h-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deliveryPerformanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deliveryPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-1/2 space-y-2 text-xs font-semibold text-slate-600">
              {deliveryPerformanceData.map((d, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                    <span>{d.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Traditional vs AI Multi-Objective (Bar Chart) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col h-[280px] shadow-sm">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">
            Multi-Objective Evaluation: Route Comparison
          </h3>
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                <Bar dataKey="eta" name="ETA (mins)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="risk" name="Terrain Risk" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="access" name="Accessibility Score" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Average ETA Trend over time (Line Chart) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col h-[280px] shadow-sm">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center justify-between">
            <span>Average Dispatch ETA Trend</span>
            <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
          </h3>
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="TraditionalAvgEta" name="Traditional Shortest Path" stroke="#f87171" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="NeuralNexusAvgEta" name="Neural Nexus Balanced" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Accessibility Data Confidence (Pie Chart) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col h-[280px] shadow-sm">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">
            Accessibility Data Confidence segments
          </h3>
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="w-1/2 h-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confidenceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-1/2 space-y-2 text-xs font-semibold text-slate-600">
              {confidenceData.map((d, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                    <span>{d.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
