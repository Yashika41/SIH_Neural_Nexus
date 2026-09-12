'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

// Component imports
import Sidebar from '../components/Sidebar';
import Overview from '../components/Overview';
import SmartRouting from '../components/SmartRouting';
import Orders from '../components/Orders';
import Fleet from '../components/Fleet';
import LiveOperations from '../components/LiveOperations';
import AccessibilityMap from '../components/AccessibilityMap';
import TerrainRiskMap from '../components/TerrainRiskMap';
import IncidentCenter from '../components/IncidentCenter';
import Analytics from '../components/Analytics';
import Feedback from '../components/Feedback';
import AuditLogComponent from '../components/AuditLog';
import RegionalIntelligence from '../components/RegionalIntelligence';
import SettingsComponent from '../components/Settings';

// Overlays
import DemoPanel from '../components/DemoPanel';
import ArchitectureModal from '../components/ArchitectureModal';

import { 
  Globe, Navigation, AlertTriangle, ShieldCheck, 
  HelpCircle, Play, ChevronRight, CheckCircle2 
} from 'lucide-react';

export default function Page() {
  const [isLaunched, setIsLaunched] = useState(false);
  const activeTab = useStore((state) => state.activeTab);
  const regionSelector = useStore((state) => state.regionSelector);
  const demoActive = useStore((state) => state.demoActive);
  const startDemo = useStore((state) => state.startDemo);
  const setArchitectureModalOpen = useStore((state) => state.setArchitectureModalOpen);

  // Sync isLaunched if demo is started from landing page
  useEffect(() => {
    if (demoActive) {
      setIsLaunched(true);
    }
  }, [demoActive]);

  const handleLaunchNormal = () => {
    setIsLaunched(true);
  };

  const handleLaunchDemo = () => {
    startDemo();
    setIsLaunched(true);
  };

  // Render active tab panel
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'routing':
        return <SmartRouting />;
      case 'orders':
        return <Orders />;
      case 'fleet':
        return <Fleet />;
      case 'liveOps':
        return <LiveOperations />;
      case 'accessMap':
        return <AccessibilityMap />;
      case 'riskMap':
        return <TerrainRiskMap />;
      case 'incidents':
        return <IncidentCenter />;
      case 'analytics':
        return <Analytics />;
      case 'feedback':
        return <Feedback />;
      case 'audit':
        return <AuditLogComponent />;
      case 'regional':
        return <RegionalIntelligence />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return <Overview />;
    }
  };

  // LANDING / ENTRY PAGE
  if (!isLaunched) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-slate-800 selection:text-white">
        
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              N
            </div>
            <span className="font-extrabold tracking-wider text-slate-900 text-lg">Neural Nexus</span>
          </div>
          <button 
            onClick={() => setArchitectureModalOpen(true)}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 text-xs font-bold transition px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300/80 shadow-xs"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Architecture Diagram</span>
          </button>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center px-6 py-12 gap-8">
          <div className="flex flex-col gap-4 text-center items-center">
            <span className="text-[11px] bg-slate-200/70 text-slate-700 font-extrabold border border-slate-300 rounded-full px-3.5 py-1 uppercase tracking-widest">
              Smart India Hackathon 2026 Prototype
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 max-w-2xl leading-tight">
              North East Smart Logistics & <br/>
              <span className="text-slate-800">
                Accessibility Intelligence
              </span>
            </h1>
            <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
              AI-powered vehicle routing for resilient movement across challenging terrain. Optimizes logistics efficiency without ignoring real-world physical and infrastructure accessibility.
            </p>

            {/* Launch Actions */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mt-4">
              <button
                onClick={handleLaunchDemo}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md transition duration-150"
              >
                <span>Run Guided Demo Mode</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
              
              <button
                onClick={handleLaunchNormal}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-extrabold transition duration-150 shadow-xs"
              >
                <Play className="h-4 w-4 text-slate-600" />
                <span>Launch Command Platform</span>
              </button>
            </div>
          </div>

          {/* Feature Grid / Core Innovations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs">
              <div className="p-2 rounded bg-slate-100 border border-slate-200 w-fit text-slate-700">
                <Navigation className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Dual-Objective Routing</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Pathfinder balances transit duration (ETA) with road slope gradients, width tolerances, and citizen barrier indexes.
              </p>
            </div>

            <div className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs">
              <div className="p-2 rounded bg-rose-50 border border-rose-200 w-fit text-rose-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Terrain & Mudslide Resilient</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Simulated sensor feeds trigger live alarms when landslide cuts occur, routing fleet through alternative stable bridge corridors.
              </p>
            </div>

            <div className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs">
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200 w-fit text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Human Feedback Loop</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Drivers and citizens report ground blockages to dynamically update routing safety graphs, adjusting confidence metrics.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 text-center py-6 px-6 text-slate-500 text-xs font-semibold bg-white">
          <span>Neural Nexus &copy; Smart India Hackathon Prototype 2026. Design targeted for Northeast Indian states.</span>
        </footer>

        {/* System Architecture Modal */}
        <ArchitectureModal />
      </div>
    );
  }

  // MAIN SYSTEM OPERATIONS BOARD
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 selection:bg-slate-800 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Neural Nexus Operations Console
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-0.5 border border-slate-200 rounded-full font-bold">
              GPS Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Run Guided Demo shortcut */}
            {!demoActive && (
              <button
                onClick={startDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold transition shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Start SIH Demo</span>
              </button>
            )}

            <button 
              onClick={() => setArchitectureModalOpen(true)}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-900 text-xs font-bold transition p-2 rounded hover:bg-slate-100 border border-slate-200 bg-white"
            >
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span>How It Works</span>
            </button>
          </div>
        </header>

        {/* Sub-page Body */}
        <main className="flex-1 overflow-hidden h-full bg-slate-50">
          {renderContent()}
        </main>
      </div>

      {/* Presentation Demo mode controller overlay */}
      <DemoPanel />

      {/* How it works modal overlay */}
      <ArchitectureModal />
    </div>
  );
}
