import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { MessageSquare, AlertTriangle, Send, Plus, CheckCircle2, Star, ChevronRight, User } from 'lucide-react';

export default function FeedbackIncidentCenter() {
  const feedbackReports = useStore((state) => state.feedbackReports);
  const incidents = useStore((state) => state.incidents);
  const addFeedback = useStore((state) => state.addFeedback);

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
            <span>Field Observations & Incident Command</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Crowd-sourced field feedback reports and real-time hazard monitoring</p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          {feedbackReports.length} Reports &bull; {incidents.length} Active Hazards
        </span>
      </div>

      {/* ============================================================== */}
      {/* SINGLE LINE SUBMIT FORM ON TOP                                 */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <Plus className="h-3.5 w-3.5 text-indigo-500" />
          <span>Submit New Field Observation Report</span>
        </h3>

        <form onSubmit={handleSubmitFeedback} className="flex flex-col lg:flex-row items-center gap-2.5">
          <div className="w-full lg:w-1/4">
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Police Bazar Ramp)"
              className="w-full text-xs font-semibold rounded-lg border-slate-300 bg-slate-50 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full lg:w-1/5">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border-slate-300 bg-slate-50 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Accessibility Barrier">Accessibility Barrier</option>
              <option value="Road Condition">Road Condition</option>
              <option value="Weather Hazard">Weather Hazard</option>
            </select>
          </div>

          <div className="w-full lg:w-1/6">
            <input 
              type="number" 
              min="1" max="5"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value) || 3)}
              placeholder="Rating (1-5)"
              className="w-full text-xs font-semibold rounded-lg border-slate-300 bg-slate-50 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full lg:flex-1">
            <input 
              type="text" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Observation notes & obstacle details..."
              className="w-full text-xs font-semibold rounded-lg border-slate-300 bg-slate-50 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button 
            type="submit" 
            className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-1.5 px-4 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit Report</span>
          </button>
        </form>
      </div>

      {/* ============================================================== */}
      {/* SIDE-BY-SIDE INTERACTIVE FEEDBACK CARDS BELOW                  */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          <span>Field Observation Feedback Reports</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackReports.slice(0, 4).map((fbd) => {
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
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>{fbd.location}</span>
                    </span>
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

                  {/* Expanded vs Summary Details */}
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
                  <span>Click to view full inspection details</span>
                  <ChevronRight className={`h-3.5 w-3.5 transition ${isSelected ? 'text-indigo-600 rotate-90' : 'text-slate-400'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* REGIONAL INCIDENT COMMAND LIST                                 */}
      {/* ============================================================== */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>Active Regional Hazard Incidents</span>
          </h3>
          <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
            {incidents.length} Active Hazards
          </span>
        </div>

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
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-2 border-t border-slate-100">
                <span>Source: {inc.source}</span>
                <span>Confidence: {inc.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
