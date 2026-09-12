import React from 'react';
import { useStore } from '../store/useStore.js';
import { 
  BarChart3, Globe, ShieldCheck, MapPin, TrendingUp, 
  Activity, AlertTriangle, PieChart as PieIcon, LineChart as LineIcon 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

export default function AnalyticsRegional() {
  const selectedRegion = useStore((state) => state.selectedRegion);
  const setSelectedRegion = useStore((state) => state.setSelectedRegion);

  const neStates = [
    'Meghalaya', 'Assam', 'Arunachal Pradesh', 
    'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Sikkim'
  ];

  // Region-specific summary stats
  const regionalSummary = {
    'Meghalaya': { capital: 'Shillong', successRate: '94.8%', activeCorridors: 14, highRiskZones: 3, roadReliability: '88%' },
    'Assam': { capital: 'Dispur / Guwahati', successRate: '97.2%', activeCorridors: 28, highRiskZones: 2, roadReliability: '94%' },
    'Arunachal Pradesh': { capital: 'Itanagar', successRate: '89.5%', activeCorridors: 9, highRiskZones: 6, roadReliability: '76%' },
    'Nagaland': { capital: 'Kohima', successRate: '91.2%', activeCorridors: 11, highRiskZones: 4, roadReliability: '82%' },
    'Manipur': { capital: 'Imphal', successRate: '90.8%', activeCorridors: 12, highRiskZones: 5, roadReliability: '80%' },
    'Mizoram': { capital: 'Aizawl', successRate: '92.4%', activeCorridors: 10, highRiskZones: 4, roadReliability: '84%' },
    'Tripura': { capital: 'Agartala', successRate: '96.1%', activeCorridors: 15, highRiskZones: 1, roadReliability: '92%' },
    'Sikkim': { capital: 'Gangtok', successRate: '88.9%', activeCorridors: 8, highRiskZones: 5, roadReliability: '75%' }
  };

  // Region-specific Bar Chart Data (Hub Deliveries vs Incline Risk Grade)
  const hubBarData = {
    'Meghalaya': [
      { name: 'Police Bazar', deliveries: 145, inclineRisk: 15 },
      { name: 'Laitumkhrah', deliveries: 120, inclineRisk: 25 },
      { name: 'Mawlai Pass', deliveries: 98, inclineRisk: 65 },
      { name: 'NEHU Campus', deliveries: 160, inclineRisk: 20 },
      { name: 'Upper Shillong', deliveries: 85, inclineRisk: 45 }
    ],
    'Assam': [
      { name: 'Guwahati West', deliveries: 320, inclineRisk: 10 },
      { name: 'Dispur Central', deliveries: 280, inclineRisk: 8 },
      { name: 'Silchar Pass', deliveries: 140, inclineRisk: 55 },
      { name: 'Dibrugarh Port', deliveries: 190, inclineRisk: 15 },
      { name: 'Tezpur Hub', deliveries: 165, inclineRisk: 20 }
    ],
    'Arunachal Pradesh': [
      { name: 'Itanagar Main', deliveries: 95, inclineRisk: 40 },
      { name: 'Tawang Pass', deliveries: 42, inclineRisk: 85 },
      { name: 'Pasighat Hub', deliveries: 78, inclineRisk: 30 },
      { name: 'Ziro Valley', deliveries: 64, inclineRisk: 60 }
    ],
    'Nagaland': [
      { name: 'Dimapur Depot', deliveries: 180, inclineRisk: 20 },
      { name: 'Kohima Central', deliveries: 115, inclineRisk: 65 },
      { name: 'Mokokchung', deliveries: 72, inclineRisk: 50 }
    ],
    'Manipur': [
      { name: 'Imphal Valley', deliveries: 165, inclineRisk: 25 },
      { name: 'Churachandpur', deliveries: 92, inclineRisk: 45 },
      { name: 'Ukhrul Pass', deliveries: 58, inclineRisk: 70 }
    ],
    'Mizoram': [
      { name: 'Aizawl North', deliveries: 125, inclineRisk: 60 },
      { name: 'Lunglei Hub', deliveries: 84, inclineRisk: 55 },
      { name: 'Champhai Pass', deliveries: 60, inclineRisk: 65 }
    ],
    'Tripura': [
      { name: 'Agartala Main', deliveries: 210, inclineRisk: 12 },
      { name: 'Udaipur Depot', deliveries: 145, inclineRisk: 15 },
      { name: 'Dharmanagar', deliveries: 110, inclineRisk: 22 }
    ],
    'Sikkim': [
      { name: 'Gangtok Pass', deliveries: 90, inclineRisk: 75 },
      { name: 'Namchi Hub', deliveries: 76, inclineRisk: 55 },
      { name: 'Mangan Sector', deliveries: 45, inclineRisk: 80 }
    ]
  };

  // Region-specific Hourly Reliability Area Chart Data (06:00 to 20:00)
  const hourlyData = {
    'Meghalaya': [
      { time: '06:00', reliability: 95, speed: 42 },
      { time: '09:00', reliability: 88, speed: 35 },
      { time: '12:00', reliability: 92, speed: 38 },
      { time: '15:00', reliability: 84, speed: 30 },
      { time: '18:00', reliability: 90, speed: 36 },
      { time: '21:00', reliability: 96, speed: 45 }
    ],
    'Assam': [
      { time: '06:00', reliability: 98, speed: 55 },
      { time: '09:00', reliability: 92, speed: 45 },
      { time: '12:00', reliability: 94, speed: 48 },
      { time: '15:00', reliability: 90, speed: 42 },
      { time: '18:00', reliability: 93, speed: 46 },
      { time: '21:00', reliability: 97, speed: 52 }
    ],
    'Arunachal Pradesh': [
      { time: '06:00', reliability: 88, speed: 30 },
      { time: '09:00', reliability: 76, speed: 22 },
      { time: '12:00', reliability: 80, speed: 25 },
      { time: '15:00', reliability: 72, speed: 20 },
      { time: '18:00', reliability: 78, speed: 24 },
      { time: '21:00', reliability: 85, speed: 28 }
    ]
  };

  // Hazard Type Distribution Pie Chart Data
  const hazardPieData = [
    { name: 'Landslide Susceptibility', value: 40, color: '#f43f5e' },
    { name: 'Steep Incline (>10%)', value: 25, color: '#f59e0b' },
    { name: 'Monsoon Flood Risk', value: 20, color: '#3b82f6' },
    { name: 'Accessible Ramps Active', value: 15, color: '#10b981' }
  ];

  const currentStats = regionalSummary[selectedRegion] || regionalSummary['Meghalaya'];
  const currentHubData = hubBarData[selectedRegion] || hubBarData['Meghalaya'];
  const currentHourlyData = hourlyData[selectedRegion] || hourlyData['Meghalaya'];

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header & Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <span>Regional Analytics & Logistics Graphs</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Interactive Recharts visualization dynamically filtering freight, terrain incline, and reliability across North Eastern States</p>
        </div>

        {/* Region Selector Control */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-sm">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Select Region:</label>
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs font-extrabold bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {neStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regional Capital</div>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{currentStats.capital}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Success Rate</div>
          <div className="text-lg font-extrabold text-emerald-600 mt-1">{currentStats.successRate}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Freight Corridors</div>
          <div className="text-lg font-extrabold text-indigo-600 mt-1">{currentStats.activeCorridors} Routes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Road Network Reliability</div>
          <div className="text-lg font-extrabold text-amber-600 mt-1">{currentStats.roadReliability}</div>
        </div>
      </div>

      {/* GRAPH ROW 1: BAR CHART & AREA CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BAR CHART: Hub Freight Deliveries vs Incline Risk */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>{selectedRegion}: Hub Deliveries vs. Terrain Incline Risk</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Bar Graph</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentHubData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="deliveries" name="Completed Deliveries" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inclineRisk" name="Incline Risk Grade (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AREA CHART: Hourly Freight Reliability & Transit Speed */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <LineIcon className="h-4 w-4 text-emerald-600" />
              <span>Hourly Reliability & Speed Index</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Area Chart</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentHourlyData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="reliability" name="Reliability Index (%)" stroke="#10b981" fill="#d1fae5" />
                <Area type="monotone" dataKey="speed" name="Avg Speed (km/h)" stroke="#6366f1" fill="#e0e7ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* GRAPH ROW 2: PIE CHART & REGIONAL INTELLIGENCE CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PIE CHART: Regional Hazard & Barrier Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-rose-600" />
              <span>Regional Hazard & Barrier Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Donut Graph</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={hazardPieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {hazardPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REGIONAL INTELLIGENCE CARDS */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            <span>{selectedRegion} Regional Intelligence Summary</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Monsoon Risk Factor</span>
              <p className="text-slate-600">Heavy rainfall susceptibility dynamically evaluated on hill arterial passes.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Mountain Risk Corridors</span>
              <p className="text-slate-600">{currentStats.highRiskZones} active landslide & steep gradient monitoring zones.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Accessibility Hubs</span>
              <p className="text-slate-600">Verified wheelchair ramps and accessible transport hubs operational.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
