import React from 'react';
import { useStore } from './store/useStore.js';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Overview from './components/Overview.jsx';
import SmartRouting from './components/SmartRouting.jsx';
import OrderTracker from './components/OrderTracker.jsx';
import Fleet from './components/Fleet.jsx';
import AccessTerrainMap from './components/AccessTerrainMap.jsx';
import FeedbackIncidentCenter from './components/FeedbackIncidentCenter.jsx';
import AnalyticsRegional from './components/AnalyticsRegional.jsx';
import EmergencyHelp from './components/EmergencyHelp.jsx';
import SettingsComponent from './components/Settings.jsx';

export default function App() {
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const userRole = useStore((state) => state.userRole);
  const activeTab = useStore((state) => state.activeTab);

  if (!isLoggedIn || !userRole) {
    return <Login />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'routing':
        return <SmartRouting />;
      case 'trackOrder':
        return <OrderTracker />;
      case 'fleet':
        return <Fleet />;
      case 'accessTerrain':
        return <AccessTerrainMap />;
      case 'feedbackIncident':
        return <FeedbackIncidentCenter />;
      case 'analyticsRegional':
      case 'partnerDashboard':
        return <AnalyticsRegional />;
      case 'emergencyHelp':
        return <EmergencyHelp />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return userRole === 'partner' ? <AnalyticsRegional /> : <Overview />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {renderTabContent()}
      </main>
    </div>
  );
}
