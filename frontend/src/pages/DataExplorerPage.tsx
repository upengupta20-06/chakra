import React, { useState, useMemo } from 'react';
import { CycloneSummary } from '../types';
import { SourceBadge } from '../components/SourceBadge';
import { Database, Search, Filter, ArrowUpRight, Play, Eye } from 'lucide-react';

interface DataExplorerPageProps {
  cyclones: CycloneSummary[];
  onSelectCyclone: (cycloneId: string) => void;
}

export const DataExplorerPage: React.FC<DataExplorerPageProps> = ({ cyclones, onSelectCyclone }) => {
  const [basinFilter, setBasinFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [minVmax, setMinVmax] = useState(0);
  const [intensityFilter, setIntensityFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return cyclones.filter((c) => {
      const matchBasin = basinFilter === 'ALL' || c.basin.toUpperCase() === basinFilter.toUpperCase();
      const matchSearch =
        c.cyclone_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.basin.toLowerCase().includes(searchFilter.toLowerCase());
      const matchVmax = c.peak_vmax >= minVmax;
      const matchInt = intensityFilter === 'ALL' || c.intensity_short === intensityFilter;
      return matchBasin && matchSearch && matchVmax && matchInt;
    });
  }, [cyclones, basinFilter, searchFilter, minVmax, intensityFilter]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-meteor-900/90 border border-meteor-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-white font-mono tracking-wide">
                  HISTORICAL SATELLITE DATA EXPLORER
                </h1>
                <SourceBadge source="[TCIR ARCHIVE]" />
              </div>
              <p className="text-xs font-mono text-slate-400">
                Explore 21,076 multi-source satellite observations across 485 historical tropical cyclones
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 bg-meteor-950 px-4 py-2 rounded-xl border border-meteor-800">
          <span>MATCHES: <strong className="text-cyan-400">{filtered.length}</strong></span>
          <span>·</span>
          <span>TOTAL: <strong className="text-white">{cyclones.length}</strong></span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-meteor-900/60 p-4 rounded-xl border border-meteor-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Search ID:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="e.g. 200301L, 201616W..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-meteor-950 border border-meteor-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Basin */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Basin:</label>
          <select
            value={basinFilter}
            onChange={(e) => setBasinFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-meteor-950 border border-meteor-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL BASINS</option>
            <option value="ATLN">ATLN (North Atlantic)</option>
            <option value="EPAC">EPAC (Eastern Pacific)</option>
            <option value="WPAC">WPAC (Western Pacific)</option>
            <option value="CPAC">CPAC (Central Pacific)</option>
            <option value="IO">IO (Indian Ocean)</option>
          </select>
        </div>

        {/* Intensity Category */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Category:</label>
          <select
            value={intensityFilter}
            onChange={(e) => setIntensityFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-meteor-950 border border-meteor-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="TD">TD (Depression &lt;34 kt)</option>
            <option value="TS">TS (Tropical Storm 34-63)</option>
            <option value="CAT 1">Category 1 (64-82)</option>
            <option value="CAT 2">Category 2 (83-95)</option>
            <option value="CAT 3">Category 3 (96-112)</option>
            <option value="CAT 4">Category 4 (113-136)</option>
            <option value="CAT 5">Category 5 (≥137 kt)</option>
          </select>
        </div>

        {/* Min Peak Vmax */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400 uppercase mb-1">
            <span>Min Peak Vmax:</span>
            <span className="text-cyan-400 font-bold">{minVmax} kt</span>
          </div>
          <input
            type="range"
            min="0"
            max="160"
            step="5"
            value={minVmax}
            onChange={(e) => setMinVmax(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>

      {/* Tabular Records Explorer */}
      <div className="bg-meteor-900/80 border border-meteor-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-meteor-950/80 border-b border-meteor-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Cyclone ID</th>
                <th className="p-3.5">Basin</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Peak Vmax</th>
                <th className="p-3.5">Current Vmax</th>
                <th className="p-3.5">MSLP</th>
                <th className="p-3.5">R35 Extent</th>
                <th className="p-3.5">Coordinates</th>
                <th className="p-3.5">Frames</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-meteor-800/60">
              {filtered.slice(0, 50).map((c) => (
                <tr
                  key={c.cyclone_id}
                  className="hover:bg-meteor-850/60 transition cursor-pointer group"
                  onClick={() => onSelectCyclone(c.cyclone_id)}
                >
                  <td className="p-3.5 font-bold text-white group-hover:text-cyan-400 transition">
                    #{c.cyclone_id}
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">
                      {c.basin}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className="px-2 py-0.5 rounded font-bold text-[10px] border"
                      style={{
                        backgroundColor: `${c.intensity_color}20`,
                        color: c.intensity_color,
                        borderColor: `${c.intensity_color}50`
                      }}
                    >
                      {c.intensity_short}
                    </span>
                  </td>
                  <td className="p-3.5 text-white font-bold">{c.peak_vmax} kt</td>
                  <td className="p-3.5 text-slate-200">{c.current_vmax} kt</td>
                  <td className="p-3.5 text-amber-400 font-bold">{c.current_mslp} hPa</td>
                  <td className="p-3.5 text-slate-300">{c.current_r35} nm</td>
                  <td className="p-3.5 text-slate-400">
                    {c.current_latitude.toFixed(1)}°N, {c.current_longitude.toFixed(1)}°W
                  </td>
                  <td className="p-3.5 text-cyan-400 font-semibold">{c.observations_count}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCyclone(c.cyclone_id);
                      }}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded text-[11px] font-semibold transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
