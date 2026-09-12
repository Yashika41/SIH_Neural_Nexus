import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { MessageSquare, AlertTriangle, Send, Plus, CheckCircle2, Star, ChevronRight, Settings, Download, FileText } from 'lucide-react';

export default function FeedbackIncidentCenter() {
  const feedbackReports = useStore((state) => state.feedbackReports);
  const incidents = useStore((state) => state.incidents);
  const addFeedback = useStore((state) => state.addFeedback);

  // Active Main Tab State (Add Manually vs Bulk Upload & Incidents - matching Images 1 & 2)
  const [activeTabMode, setActiveTabMode] = useState('manual');

  // Form State
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Accessibility Barrier');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(4);

  // Active expanded feedback selection state (defaults to first item)
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(feedbackReports[0]?.id || null);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!location.trim() || !comment.trim()) return;

    const newReport = {
      id: `FBD-${Date.now()}`,
      userName: 'Field Logistics Agent',
      location,
      category,
      rating,
      comment,
      status: 'Under Review',
      date: new Date().toISOString().split('T')[0]
    };

    addFeedback(newReport);
    setSelectedFeedbackId(newReport.id);
    setLocation('');
    setComment('');
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <span>Field Observations & Feedback Reports</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Crowd-sourced field observation logging and regional risk tracking</p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          {feedbackReports.length} Reports Logged &bull; {incidents.length} Active Hazards
        </span>
      </div>

      {/* ============================================================== */}
      {/* 1. REPORT FILTERS & SUBMISSION FORM (MATCHING IMAGE 3 STYLE)    */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-indigo-600" />
            <span>Field Report Submission & Filters</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Standardized Report Form</span>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                LOCATION NAME <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Police Bazar Ramp Entry"
                className="w-full text-xs font-semibold rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                REPORT CATEGORY
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <option value="Accessibility Barrier">Accessibility Barrier</option>
                <option value="Road Condition">Road Condition</option>
                <option value="Weather Hazard">Weather Hazard</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                RATING (1 - 5 STAR)
              </label>
              <input 
                type="number" 
                min="1" max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value) || 3)}
                placeholder="Rating (1-5)"
                className="w-full text-xs font-semibold rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-9">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                OBSERVATION NOTES & DETAILS <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Ramp obstacle detected; temporary construction materials blocking entry pass..."
                className="w-full text-xs font-semibold rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            {/* Prominent Action Button (Matching Image 3 Button Style) */}
            <div className="md:col-span-3 flex justify-end">
              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-lg shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit Field Report</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ============================================================== */}
      {/* 2. TABBED NAVIGATION SWITCHER (MATCHING IMAGES 1 & 2 STYLE)     */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTabMode('manual')}
            className={`flex-1 py-3 text-xs font-extrabold text-center transition border-b-2 ${
              activeTabMode === 'manual'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Field Observation Feedback
          </button>
          <button
            onClick={() => setActiveTabMode('bulk')}
            className={`flex-1 py-3 text-xs font-extrabold text-center transition border-b-2 ${
              activeTabMode === 'bulk'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Hazard Incidents
          </button>
        </div>

        <div className="p-4">
          {activeTabMode === 'manual' ? (
            /* ============================================================== */
            /* SIDE-BY-SIDE INTERACTIVE FEEDBACK CARDS BELOW (IMAGES 1 & 2)  */
            /* ============================================================== */
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackReports.map((fbd) => {
                  const isSelected = selectedFeedbackId === fbd.id || (!selectedFeedbackId && feedbackReports[0]?.id === fbd.id);
                  return (
                    <div 
                      key={fbd.id}
                      onClick={() => setSelectedFeedbackId(fbd.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected 
                          ? 'bg-indigo-50/50 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{fbd.location}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            fbd.status === 'Verified' 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                              : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          }`}>
                            {fbd.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < fbd.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          ))}
                          <span className="text-[10px] text-slate-500 font-bold ml-1">({fbd.category})</span>
                        </div>

                        {/* Details Toggle */}
                        {isSelected ? (
                          <div className="bg-white p-3 rounded-lg border border-indigo-200 text-xs text-slate-700 space-y-2 animate-fadeIn">
                            <p className="font-semibold text-slate-900">{fbd.comment}</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-2">
                              <div>Reported By: <strong className="text-slate-800">{fbd.userName}</strong></div>
                              <div>Date: <strong className="text-slate-800">{fbd.date}</strong></div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 line-clamp-2">{fbd.comment}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                        <span>Click to inspect details</span>
                        <ChevronRight className={`h-3.5 w-3.5 transition ${isSelected ? 'text-indigo-600 rotate-90' : 'text-slate-400'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* HAZARD INCIDENTS (TAB 2) */
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase">Active Regional Hazard Incidents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incidents.map((inc) => (
                    <div key={inc.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">{inc.locationName}</span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                          {inc.type} ({inc.severity})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{inc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
