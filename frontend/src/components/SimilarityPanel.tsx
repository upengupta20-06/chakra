import React from 'react';
import { SimilarCyclone } from '../types';
import { SourceBadge } from './SourceBadge';
import { History, Info, ExternalLink } from 'lucide-react';

interface SimilarityPanelProps {
  matches: SimilarCyclone[];
  isLoading: boolean;
  onSelectCyclone?: (cycloneId: string) => void;
}

export const SimilarityPanel: React.FC<SimilarityPanelProps> = ({
  matches,
  isLoading,
  onSelectCyclone
}) => {
  return (
    <div className="bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-meteor-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-cyan-950 border border-cyan-800 rounded-lg">
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white tracking-wide">
                MOST SIMILAR HISTORICAL PATTERNS
              </h3>
              <SourceBadge source="[EMBEDDING SIMILARITY]" />
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              32-D deep spatiotemporal latent representation matching
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-cyan-400">Searching historical cyclone vector database...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCyclone && onSelectCyclone(item.cyclone_id)}
              className="bg-meteor-950 border border-meteor-800 hover:border-cyan-700/80 p-3 rounded-lg transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition">
                    #{idx + 1} Cyclone {item.cyclone_id}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-meteor-850 text-slate-300 rounded border border-meteor-750">
                    {item.basin} · {item.year}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded">
                    Peak {item.peak_vmax} kt ({item.intensity_class})
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {item.name}
                </p>
              </div>

              {/* Similarity Score */}
              <div className="sm:text-right shrink-0">
                <div className="flex items-center space-x-2 sm:justify-end">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {item.label}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
                </div>
                <div className="w-32 h-1.5 bg-meteor-800 rounded-full overflow-hidden mt-1 sm:ml-auto">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                    style={{ width: `${item.representation_similarity_pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs font-mono text-slate-500 text-center py-4">
          No historical matches found for this state.
        </p>
      )}

      {/* Required Disclaimer */}
      <div className="p-2.5 bg-meteor-950/60 border border-meteor-800 rounded-lg flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
          Representation similarity reflects shared neural embedding distance in latent space. It does not imply that a historically similar cyclone guarantees identical future behavior or path.
        </p>
      </div>
    </div>
  );
};
