import React from 'react';
import { Alert } from '../types';
import { SourceBadge } from './SourceBadge';
import { AlertOctagon, AlertTriangle, ArrowRight } from 'lucide-react';

interface AlertBannerProps {
  alerts: Alert[];
  onSelectCyclone?: (cycloneId: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onSelectCyclone }) => {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-red-300 font-mono">
            ACTIVE TROPICAL CYCLONE ADVISORIES ({alerts.length})
          </h3>
          <SourceBadge source="[OPERATIONAL ADVISORY]" />
        </div>
        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
          Kinematic & Rapid Intensification Criteria
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {alerts.slice(0, 4).map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          return (
            <div
              key={alert.alert_id}
              className={`p-3 rounded-lg border transition flex flex-col justify-between ${
                isCritical
                  ? 'bg-[#180d12] border-[#421721]'
                  : 'bg-[#181309] border-[#382b14]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isCritical ? (
                      <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span
                      className={`font-mono text-xs font-bold ${
                        isCritical ? 'text-red-300' : 'text-amber-300'
                      }`}
                    >
                      {alert.title}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      isCritical
                        ? 'bg-red-900/60 text-red-300 border border-red-800'
                        : 'bg-amber-900/60 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {alert.reason}
                </p>

                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>System: <strong className="text-white">#{alert.cyclone_id}</strong></span>
                  <span>·</span>
                  <span>Basin: <strong className="text-white">{alert.basin}</strong></span>
                  <span>·</span>
                  <span>Intensity: <strong className="text-white">{alert.current_vmax} kt</strong></span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#24171d] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate pr-2">
                  {alert.recommendation}
                </span>
                {onSelectCyclone && (
                  <button
                    onClick={() => onSelectCyclone(alert.cyclone_id)}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition shrink-0 font-bold"
                  >
                    <span>ANALYZE</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
