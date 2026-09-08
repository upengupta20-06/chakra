import React, { useState, useEffect } from 'react';
import { CycloneSummary, CycloneDetail, Alert } from './types';
import { fetchCyclones, fetchCycloneDetail, fetchActiveAlerts } from './services/api';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CycloneDetailPage } from './pages/CycloneDetailPage';
import { LiveWindyPage } from './pages/LiveWindyPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { PerformancePage } from './pages/PerformancePage';
import { ResearchPage } from './pages/ResearchPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [cyclones, setCyclones] = useState<CycloneSummary[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedCycloneId, setSelectedCycloneId] = useState<string>('');
  const [selectedCycloneDetail, setSelectedCycloneDetail] = useState<CycloneDetail | null>(null);

  const [isLoadingRoster, setIsLoadingRoster] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Initial load: Fetch cyclones & alerts
  useEffect(() => {
    async function init() {
      setIsLoadingRoster(true);
      try {
        const [cycRes, alertRes] = await Promise.all([
          fetchCyclones({ limit: 100 }),
          fetchActiveAlerts()
        ]);
        setCyclones(cycRes.cyclones);
        setAlerts(alertRes.alerts);

        // Select the first cyclone by default
        if (cycRes.cyclones.length > 0) {
          const firstId = cycRes.cyclones[0].cyclone_id;
          setSelectedCycloneId(firstId);
        }
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      } finally {
        setIsLoadingRoster(false);
      }
    }

    init();
  }, []);

  // Fetch detail when selectedCycloneId changes
  useEffect(() => {
    if (!selectedCycloneId) return;

    let isMounted = true;
    async function loadDetail() {
      setIsLoadingDetail(true);
      try {
        const detail = await fetchCycloneDetail(selectedCycloneId);
        if (isMounted) {
          setSelectedCycloneDetail(detail);
        }
      } catch (err) {
        console.error(`Failed to load detail for ${selectedCycloneId}:`, err);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    }

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedCycloneId]);

  // Handle selecting a cyclone
  const handleSelectCyclone = (cycloneId: string) => {
    setSelectedCycloneId(cycloneId);
    setCurrentTab('detail');
  };

  return (
    <div className="min-h-screen flex flex-col bg-meteor-950 text-slate-100 font-sans">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeAlertsCount={alerts.length}
        selectedCycloneId={selectedCycloneId}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardPage
            cyclones={cyclones}
            alerts={alerts}
            isLoading={isLoadingRoster}
            onSelectCyclone={handleSelectCyclone}
          />
        )}

        {currentTab === 'detail' && (
          selectedCycloneDetail ? (
            <CycloneDetailPage
              cycloneDetail={selectedCycloneDetail}
              onBack={() => setCurrentTab('dashboard')}
              onSelectCyclone={handleSelectCyclone}
            />
          ) : (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-cyan-400">Loading cyclone intelligence package...</p>
            </div>
          )
        )}

        {currentTab === 'windy' && (
          <LiveWindyPage
            selectedLatitude={selectedCycloneDetail?.current_latitude || 22.0}
            selectedLongitude={selectedCycloneDetail?.current_longitude || -50.0}
            selectedCycloneId={selectedCycloneId}
          />
        )}

        {currentTab === 'explorer' && (
          <DataExplorerPage
            cyclones={cyclones}
            onSelectCyclone={handleSelectCyclone}
          />
        )}

        {currentTab === 'performance' && (
          <PerformancePage />
        )}

        {currentTab === 'research' && (
          <ResearchPage />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#080c14] border-t border-[#1b253b] py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <div className="flex items-center justify-center space-x-2 text-slate-400 font-semibold">
            <span>Cyclone Intelligence System</span>
            <span>·</span>
            <span className="text-cyan-400">Operational Meteorological Workstation</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Multi-Source Satellite Spatiotemporal Modeling (TCIR) · NOAA ADT-HURSAT Reference Layer · ECMWF Atmospheric Streamlines
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
