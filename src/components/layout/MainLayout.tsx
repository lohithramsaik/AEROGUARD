import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar, NavItemKey } from './Sidebar';
import { DemoModeBar } from '../demo/DemoModeBar';
import { OverviewView } from '../views/OverviewView';
import { LiveMonitoringView } from '../views/LiveMonitoringView';
import { FaultDetectionView } from '../views/FaultDetectionView';
import { DigitalTwinView } from '../views/DigitalTwinView';
import { AiDiagnosticsView } from '../views/AiDiagnosticsView';
import { HealthPerformanceView } from '../views/HealthPerformanceView';
import { TrendsAnalyticsView } from '../views/TrendsAnalyticsView';
import { PredictiveMaintenanceView } from '../views/PredictiveMaintenanceView';
import { FaultHistoryView } from '../views/FaultHistoryView';
import { FlightHistoryView } from '../views/FlightHistoryView';
import { SettingsView } from '../views/SettingsView';

export const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewView />;
      case 'live-monitoring':
        return <LiveMonitoringView />;
      case 'fault-detection':
        return <FaultDetectionView />;
      case 'digital-twin':
        return <DigitalTwinView />;
      case 'ai-diagnostics':
        return <AiDiagnosticsView />;
      case 'health-performance':
        return <HealthPerformanceView />;
      case 'trends-analytics':
        return <TrendsAnalyticsView />;
      case 'predictive-maintenance':
        return <PredictiveMaintenanceView />;
      case 'fault-history':
        return <FaultHistoryView />;
      case 'flight-history':
        return <FlightHistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Workspace: Left Sidebar + Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-[#070b14] via-[#090f1d] to-[#070b14]">
          <div className="max-w-[1680px] mx-auto">
            {/* Demo Mode Control & Visual Timeline */}
            <DemoModeBar onNavigateTab={(tab) => setCurrentTab(tab)} />
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};
