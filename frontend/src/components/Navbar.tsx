import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Satellite, 
  Wind, 
  Database, 
  BarChart2, 
  BookOpen, 
  AlertTriangle,
  Clock,
  Radio
} from 'lucide-react';

export type NavTab = 'dashboard' | 'detail' | 'windy' | 'explorer' | 'performance' | 'research';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertsCount: number;
  selectedCycloneId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertsCount,
  selectedCycloneId
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Operations Center', icon: Compass },
    { 
      id: 'detail' as NavTab, 
      label: selectedCycloneId ? `Storm Analysis (${selectedCycloneId})` : 'Storm Analysis', 
      icon: Satellite 
    },
    { id: 'windy' as NavTab, label: 'Atmospheric Radar', icon: Wind },
    { id: 'explorer' as NavTab, label: 'Archive Explorer', icon: Database },
    { id: 'performance' as NavTab, label: 'Verification & Metrics', icon: BarChart2 },
    { id: 'research' as NavTab, label: 'System Architecture', icon: BookOpen },
  ];

  return (
    <header className="bg-[#0b101b] border-b border-[#1b253b] sticky top-0 z-50 select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Platform Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer py-1"
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="w-7 h-7 rounded bg-[#131e33] border border-[#233557] flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm text-slate-100 tracking-wider">
                  CYCLONE INTELLIGENCE SYSTEM
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded">
                  OPERATIONAL
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 tracking-tight">
                Tropical Cyclone Satellite Monitoring & Objective Intensity Guidance
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-[#15233c] text-cyan-300 border border-[#274270] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#11192a]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Telemetry Status Bar */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            {/* UTC Clock */}
            <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 bg-[#070b13] px-2.5 py-1 rounded border border-[#1b253b]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-200 font-semibold">{utcTime}</span>
            </div>

            {/* Active Advisories Alert */}
            {activeAlertsCount > 0 && (
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-950/60 border border-red-800/80 text-red-300 rounded hover:bg-red-900/60 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="font-semibold">{activeAlertsCount} ADVISORIES</span>
              </button>
            )}

            {/* Telemetry Status */}
            <div className="hidden md:flex items-center space-x-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-slate-300">SATELLITE FEED: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Subbar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-1.5 border-t border-[#1b253b] space-x-1 bg-[#090d16]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded text-xs font-mono ${
              currentTab === item.id ? 'bg-[#15233c] text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
