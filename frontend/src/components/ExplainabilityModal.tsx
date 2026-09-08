import React, { useState } from 'react';
import { ExplainabilityResult } from '../types';
import { SourceBadge } from './SourceBadge';
import { Brain, X, Info, Sparkles, Layers } from 'lucide-react';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  explainability: ExplainabilityResult | null;
  isLoading: boolean;
  onChannelChange: (channelIdx: number) => void;
  selectedBaseChannel: number;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  explainability,
  isLoading,
  onChannelChange,
  selectedBaseChannel
}) => {
  if (!isOpen) return null;

  const channels = [
    { idx: 0, code: 'IR1', name: 'Infrared (Thermal)' },
    { idx: 1, code: 'WV', name: 'Water Vapor (Moisture)' },
    { idx: 2, code: 'VIS', name: 'Visible (Reflectance)' },
    { idx: 3, code: 'PMW', name: 'Passive Microwave' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-meteor-900 border border-meteor-700 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-meteor-800 flex items-center justify-between bg-meteor-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  WHY THIS PREDICTION? — EXPLAINABLE AI
                </h3>
                <SourceBadge source="[MODEL FEATURE ATTRIBUTION]" />
              </div>
              <p className="text-xs font-mono text-slate-400">
                Grad-CAM spatial feature attribution & multi-sensor channel contribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-meteor-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-cyan-400">Computing gradient-weighted activation maps...</p>
            </div>
          ) : explainability ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Heatmap Overlay Display */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="relative w-full max-w-[300px] aspect-square rounded-xl overflow-hidden border-2 border-meteor-700 bg-black shadow-lg">
                  <img
                    src={explainability.overlay_image_url}
                    alt="Grad-CAM Overlay"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-slate-700 rounded text-[10px] font-mono text-cyan-400">
                    Grad-CAM + {channels[selectedBaseChannel].code}
                  </div>
                </div>

                {/* Base channel switcher */}
                <div className="mt-4 w-full">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
                    Overlay Background Channel:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {channels.map((ch) => (
                      <button
                        key={ch.idx}
                        onClick={() => onChannelChange(ch.idx)}
                        className={`py-1 text-[11px] font-mono rounded border transition ${
                          selectedBaseChannel === ch.idx
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                            : 'bg-meteor-850 text-slate-400 border-meteor-800 hover:text-slate-200'
                        }`}
                      >
                        {ch.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Channel Contribution Breakdown & Insights */}
              <div className="md:col-span-6 space-y-4">
                <div className="bg-meteor-950/80 p-4 rounded-xl border border-meteor-800">
                  <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                    Multi-Spectral Sensor Contribution
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(explainability.channel_contributions).map(([chan, pct]) => (
                      <div key={chan} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-200 font-semibold">{chan}</span>
                          <span className="text-cyan-400 font-bold">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-meteor-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              chan === 'IR1'
                                ? 'bg-rose-500'
                                : chan === 'WV'
                                ? 'bg-cyan-500'
                                : chan === 'VIS'
                                ? 'bg-slate-300'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spatial Focus Insight */}
                <div className="bg-meteor-950/80 p-4 rounded-xl border border-meteor-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Neural Network Attention Target</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    The model identifies the <strong className="text-white">{explainability.spatial_focus}</strong> as the primary intensity predictor, responding strongly to high thermal gradients around the inner core in the {explainability.highest_contributor} channel.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 font-mono text-xs">No explainability data available.</p>
          )}

          {/* Disclaimer Footer */}
          {explainability && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono text-amber-300/90 leading-relaxed">
                {explainability.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
