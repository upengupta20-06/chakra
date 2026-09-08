import React, { useState, useMemo } from 'react';
import { CycloneSummary, Alert } from '../types';
import { CycloneMap } from '../maps/CycloneMap';
import { AlertBanner } from '../components/AlertBanner';
import { SourceBadge } from '../components/SourceBadge';
import { 
  Activity, 
  Wind, 
  Zap, 
  Search, 
  ArrowUpRight,
  Compass,
  MapPin,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface DashboardPageProps {
  cyclones: CycloneSummary[];
  alerts: Alert[];
  isLoading: boolean;
  onSelectCyclone: (cycloneId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cyclones,
  alerts,
  isLoading,
  onSelectCyclone
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBasin, setSelectedBasin] = useState('ALL');
  const [sortBy, setSortBy] = useState<'vmax' | 'time' | 'ri'>('vmax');

  // Filtered and sorted cyclone roster
  const filteredCyclones = useMemo(() => {
    return cyclones
      .filter((c) => {
        const matchesBasin = selectedBasin === 'ALL' || c.basin.toUpperCase() === selectedBasin.toUpperCase();
        const matchesSearch =
          c.cyclone_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.basin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.intensity_class.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBasin && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'vmax') return b.peak_vmax - a.peak_vmax;
        if (sortBy === 'ri') return (b.is_ri ? 1 : 0) - (a.is_ri ? 1 : 0);
        return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
      });
  }, [cyclones, selectedBasin, searchQuery, sortBy]);

  // Global KPIs
  const strongestCyclone = useMemo(() => {
    if (!cyclones.length) return null;
    return [...cyclones].sort((a, b) => b.peak_vmax - a.peak_vmax)[0];
  }, [cyclones]);

  const riCount = useMemo(() => {
    return cyclones.filter((c) => c.is_ri).length;
  }, [cyclones]);

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Operational Telemetry Summary Strip */}
      <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-100 font-bold uppercase tracking-wider">
              OPERATIONS DESK: GLOBAL BASIN SURVEILLANCE
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Coverage: ATLN · EPAC · WPAC</span>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <span className="text-slate-500">Tracked Records: </span>
            <span className="text-slate-200 font-bold">{cyclones.length} Systems</span>
          </div>
          <span className="text-slate-700">·</span>
          <div>
            <span className="text-slate-500">Max Intensity: </span>
            <span className="text-rose-400 font-bold">
              {strongestCyclone ? `${strongestCyclone.peak_vmax} kt` : '168 kt'}
            </span>
          </div>
          <span className="text-slate-700">·</span>
          <div>
            <span className="text-slate-500">Rapid Intensification Watch: </span>
            <span className="text-amber-400 font-bold">{riCount} Systems</span>
          </div>
        </div>
      </div>

      {/* Advisories & Alerts Banner */}
      <AlertBanner alerts={alerts} onSelectCyclone={onSelectCyclone} />

      {/* Main Meteorological Console: Split Map & Storm Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Interactive Basin Chart / Map */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-slate-200 uppercase tracking-wide">
                GLOBAL BASIN SYNOPTIC DISPLAY
              </span>
            </div>
            <SourceBadge source="[TCIR ARCHIVE + NOAA BEST TRACK]" />
          </div>

          <div className="h-[520px] rounded-lg overflow-hidden border border-[#1b253b] bg-[#070a10]">
            <CycloneMap
              cyclones={filteredCyclones}
              onSelectCyclone={onSelectCyclone}
              activeBasin={selectedBasin}
              onSelectBasin={setSelectedBasin}
            />
          </div>
        </div>

        {/* Right Column: Storm Advisory Roster */}
        <div className="lg:col-span-4 bg-[#0b101b] border border-[#1b253b] rounded-lg p-3.5 space-y-3">
          
          <div className="flex items-center justify-between border-b border-[#1b253b] pb-2.5">
            <div>
              <h3 className="font-bold text-xs font-mono text-slate-100 uppercase tracking-wider">
                STORM ADVISORIES ({filteredCyclones.length})
              </h3>
              <p className="text-[10px] font-mono text-slate-500">
                Select a system to inspect multi-spectral imagery
              </p>
            </div>
            <SourceBadge source="[BEST TRACK]" />
          </div>

          {/* Search and Basin Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Storm ID or Basin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#070b13] border border-[#1b253b] rounded text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Sort:</span>
              <div className="flex space-x-1">
                {(['vmax', 'ri', 'time'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-2 py-0.5 rounded border text-[10px] ${
                      sortBy === s
                        ? 'bg-[#15233c] text-cyan-300 border-[#274270] font-bold'
                        : 'bg-[#070b13] text-slate-500 border-[#1b253b]'
                    }`}
                  >
                    {s === 'vmax' ? 'Wind Speed' : s === 'ri' ? 'RI Active' : 'Date'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Storm Advisory Card List */}
          <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-slate-500">Loading storm records...</p>
              </div>
            ) : filteredCyclones.length > 0 ? (
              filteredCyclones.map((c) => (
                <div
                  key={c.cyclone_id}
                  onClick={() => onSelectCyclone(c.cyclone_id)}
                  className="bg-[#070b13] border border-[#182133] hover:border-[#2a3c5e] p-2.5 rounded transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition">
                        #{c.cyclone_id}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-[#121b2d] text-slate-300 rounded border border-[#1c2944]">
                        {c.basin}
                      </span>
                      {c.is_ri && (
                        <span className="text-[9px] font-mono font-bold px-1 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded">
                          RI WATCH
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${c.intensity_color}15`,
                        color: c.intensity_color,
                        borderColor: `${c.intensity_color}40`
                      }}
                    >
                      {c.intensity_short} · {c.current_vmax} kt
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium truncate mb-1.5">
                    {c.intensity_class}
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 text-[10px] font-mono text-slate-400 border-t border-[#141d2e] pt-1.5">
                    <div>
                      <span>Peak: </span>
                      <strong className="text-slate-200">{c.peak_vmax} kt</strong>
                    </div>
                    <div>
                      <span>MSLP: </span>
                      <strong className="text-slate-200">{c.current_mslp} hPa</strong>
                    </div>
                    <div>
                      <span>Coords: </span>
                      <strong className="text-slate-400">{c.current_latitude.toFixed(1)}°N, {c.current_longitude.toFixed(1)}°W</strong>
                    </div>
                    <div className="flex items-center justify-end text-cyan-400 group-hover:text-cyan-300 transition">
                      <span>OPEN ADVISORY</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-600 text-center py-8">
                No systems found matching filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
