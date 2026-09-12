'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { MessageSquare, MapPin, Send, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AccessibilityFeatureType, SeverityLevel } from '../types';

export default function Feedback() {
  const reports = useStore((state) => state.accessibilityFeatures);
  const addReport = useStore((state) => state.addAccessibilityReport);
  const verifyReport = useStore((state) => state.verifyAccessibilityFeature);

  // Form State
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState<AccessibilityFeatureType>('poor surface');
  const [severity, setSeverity] = useState<SeverityLevel>('Moderate');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('Police Bazar');

  const landmarks = [
    { name: 'Police Bazar', lat: 25.5732, lng: 91.8821 },
    { name: 'Laitumkhrah', lat: 25.5684, lng: 91.8988 },
    { name: 'Mawlai', lat: 25.5991, lng: 91.8762 },
    { name: 'Nongthymmai', lat: 25.5587, lng: 91.9080 },
    { name: 'Upper Shillong', lat: 25.5392, lng: 91.8493 },
    { name: 'NEHU', lat: 25.6125, lng: 91.8996 }
  ];

  const categories = [
    { value: 'wheelchair accessible', label: 'Wheelchair Access Points' },
    { value: 'ramp', label: 'Ramp Available' },
    { value: 'stairs', label: 'Stairs Mapped' },
    { value: 'steep slope', label: 'Steep Slopes (>12%)' },
    { value: 'accessible crossing', label: 'Pedestrian Crossings' },
    { value: 'poor surface', label: 'Damaged / Poor Asphalt' },
    { value: 'temporary obstruction', label: 'Temporary Blockage / Construction' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !description.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const selectedLandmark = landmarks.find((l) => l.name === landmark) || landmarks[0];

    addReport({
      locationName,
      coords: { lat: selectedLandmark.lat + (Math.random() - 0.5) * 0.005, lng: selectedLandmark.lng + (Math.random() - 0.5) * 0.005 },
      type: category,
      score: category === 'ramp' || category === 'wheelchair accessible' || category === 'accessible crossing' ? 95 : 20,
      confidence: 60, // User reports start with low/partial confidence
      source: 'User Report',
      description
    });

    // Reset Form
    setLocationName('');
    setDescription('');
    alert('Ground Report submitted successfully! Added to the verified feedback pipeline as PENDING verification.');
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'High': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 h-full overflow-y-auto">
      {/* Left Form Column */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-1.5">
            <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
            <span>Report Ground Condition</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            {/* Location Title */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Incident / Feature Location</label>
              <input 
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Police Bazar exit lane, near post office" 
                className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
              />
            </div>

            {/* Landmark Snap */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Snap Near Landmark</label>
              <select 
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
              >
                {landmarks.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
              </select>
            </div>

            {/* Category & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Feedback Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                >
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Report Severity</label>
                <select 
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                >
                  <option value="Low">Low (No route effect)</option>
                  <option value="Moderate">Moderate (Caution delays)</option>
                  <option value="High">High (Forces reroutes)</option>
                  <option value="Critical">Critical (Impassable block)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Condition Description</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe road slopes, broken barriers, or water pooling depths..."
                className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50 min-h-20"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/15 transition duration-150"
            >
              <Send className="h-4 w-4" />
              <span>Submit Ground Report</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right List Column */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col h-[520px]">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center justify-between">
            <span>Citizen / Driver Feedback Queue</span>
            <span className="text-[10px] text-slate-400 font-bold">Awaiting Verification</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-semibold">
            {reports.filter(r => r.source === 'User Report' || r.source === 'Driver Report').length === 0 ? (
              <div className="text-center text-slate-400 font-bold py-8">
                No user feedback reports logged in this session.
              </div>
            ) : (
              reports
                .filter(r => r.source === 'User Report' || r.source === 'Driver Report')
                .map((rep) => {
                  const isPositive = rep.type === 'ramp' || rep.type === 'wheelchair accessible';
                  const isPending = rep.verifiedStatus === 'Pending';
                  
                  return (
                    <div key={rep.id} className="border border-slate-200/60 p-3.5 rounded-lg flex flex-col gap-2 bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-slate-900 leading-tight">{rep.locationName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold capitalize">
                            ID: {rep.id} | Category: {rep.type}
                          </span>
                        </div>

                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getSeverityStyle(rep.score < 50 ? 'High' : 'Low')}`}>
                          {rep.score < 50 ? 'Barrier Flagged' : 'Access Improvement'}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                        {rep.description}
                      </p>

                      <div className="border-t pt-2 mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">
                          Source: {rep.source} (Confidence: {rep.confidence}%)
                        </span>

                        {isPending ? (
                          <div className="flex gap-1.5 font-bold">
                            <button
                              onClick={() => {
                                verifyReport(rep.id, 'Rejected');
                                alert(`Report ${rep.id} rejected.`);
                              }}
                              className="px-2 py-0.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded text-[9px] transition"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                verifyReport(rep.id, 'Verified');
                                alert(`Report ${rep.id} approved and verified.`);
                              }}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] transition shadow"
                            >
                              Verify
                            </button>
                          </div>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-200 rounded font-extrabold uppercase text-[9px] flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>{rep.verifiedStatus}</span>
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
    </div>
  );
}
