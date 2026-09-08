import React from 'react';
import { Sliders, ShieldAlert, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { SourceBadge } from './SourceBadge';

interface MissingSensorTesterProps {
  activeChannels: string[];
  onToggleChannel: (channel: string) => void;
  onApplyPreset: (channels: string[]) => void;
  onRunTest: () => void;
  isLoading: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  uncertaintyMargin: number;
}

export const MissingSensorTester: React.FC<MissingSensorTesterProps> = ({
  activeChannels,
  onToggleChannel,
  onApplyPreset,
  onRunTest,
  isLoading,
  confidence,
  uncertaintyMargin
}) => {
  const allChannels = [
    { code: 'IR1', name: 'Infrared (10.8 µm)' },
    { code: 'WV', name: 'Water Vapor (6.7 µm)' },
    { code: 'VIS', name: 'Visible (0.65 µm)' },
    { code: 'PMW', name: 'Passive Microwave (85–91 GHz)' }
  ];

  const presets = [
    { label: 'All 4 Channels (Full Suite)', channels: ['IR1', 'WV', 'VIS', 'PMW'] },
    { label: 'Missing PMW (No Microwave)', channels: ['IR1', 'WV', 'VIS'] },
    { label: 'Nighttime (Missing VIS & PMW)', channels: ['IR1', 'WV'] },
    { label: 'IR Only (Minimal Sensor)', channels: ['IR1'] }
  ];

  return (
    <div className="bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-meteor-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-cyan-950 border border-cyan-800 rounded-lg">
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white tracking-wide">
                MISSING-SENSOR ROBUSTNESS LAB
              </h3>
              <SourceBadge source="[AI EXPERIMENT]" />
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Simulate sensor outages & evaluate model uncertainty degradation
            </p>
          </div>
        </div>

        {/* Confidence & Uncertainty Indicator */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Confidence:</span>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              confidence === 'HIGH'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : confidence === 'MEDIUM'
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
            }`}
          >
            {confidence} (±{uncertaintyMargin} kt)
          </span>
        </div>
      </div>

      {/* Sensor Preset Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
          Preset Operational Configurations:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {presets.map((p, idx) => {
            const isMatch =
              p.channels.length === activeChannels.length &&
              p.channels.every((c) => activeChannels.includes(c));
            return (
              <button
                key={idx}
                onClick={() => onApplyPreset(p.channels)}
                className={`text-left p-2 rounded-lg border text-xs font-mono transition ${
                  isMatch
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                    : 'bg-meteor-850 text-slate-400 border-meteor-800 hover:text-slate-200 hover:bg-meteor-800'
                }`}
              >
                <div className="font-semibold">{p.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{p.channels.join(' + ')}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Channel Checkboxes */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
          Individual Channel Telemetry Status:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {allChannels.map((ch) => {
            const isAvailable = activeChannels.includes(ch.code);
            return (
              <div
                key={ch.code}
                onClick={() => onToggleChannel(ch.code)}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  isAvailable
                    ? 'bg-meteor-950 border-cyan-800/80 hover:border-cyan-600'
                    : 'bg-meteor-950/40 border-meteor-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="font-mono text-xs font-bold text-white">{ch.code}</div>
                  <div className="text-[10px] text-slate-400">{ch.name}</div>
                </div>
                {isAvailable ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onRunTest}
          disabled={isLoading || activeChannels.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-black font-mono text-xs font-bold rounded-lg shadow-lg shadow-cyan-950 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>RUN ROBUSTNESS INFERENCE ({activeChannels.length}/4 CHANNELS)</span>
        </button>
      </div>
    </div>
  );
};
