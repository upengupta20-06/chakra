import React, { useState, useEffect } from 'react';
import { 
  SatelliteFrame, 
  SatelliteChannel 
} from '../types';
import { SourceBadge } from './SourceBadge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Layers, 
  Grid, 
  Crosshair
} from 'lucide-react';

interface SatelliteViewerProps {
  frames: SatelliteFrame[];
  isLoading?: boolean;
}

export const SatelliteViewer: React.FC<SatelliteViewerProps> = ({ frames, isLoading = false }) => {
  const [selectedChannel, setSelectedChannel] = useState<'IR1' | 'WV' | 'VIS' | 'PMW'>('IR1');
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000);
  const [isGridMode, setIsGridMode] = useState<boolean>(false);

  // Auto playback
  useEffect(() => {
    if (!isPlaying || !frames.length) return;
    const timer = setInterval(() => {
      setActiveFrameIndex((prev) => (prev + 1) % frames.length);
    }, playbackSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, frames.length]);

  if (isLoading || !frames.length) {
    return (
      <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-400">Querying multi-spectral satellite matrices (IR1, WV, VIS, PMW)...</p>
      </div>
    );
  }

  const currentFrame = frames[activeFrameIndex] || frames[0];
  const channelData: SatelliteChannel | undefined = currentFrame.channels[selectedChannel];

  const channelDescriptions: Record<string, { desc: string; band: string; sensor: string }> = {
    IR1: {
      desc: '10.8 µm Clean Infrared window. Depicts cloud-top brightness temperature; coldest convective cores are highlighted in calibrated meteorological thermal curve.',
      band: 'Thermal Infrared (10.8 µm)',
      sensor: 'Geostationary Imager (GOES/HIMAWARI/METEOSAT)'
    },
    WV: {
      desc: '6.7 µm Water Vapor channel. Visualizes mid-tropospheric humidity patterns, upper-level divergence outflow, and dry air shear intrusions.',
      band: 'Tropospheric Vapor (6.7 µm)',
      sensor: 'Water Vapor Absorption Channel'
    },
    VIS: {
      desc: '0.65 µm High-resolution visible channel. Resolves solar cloud reflectance, cloud texture gradients, and low-level circulation center swirls.',
      band: 'Solar Reflectance (0.65 µm)',
      sensor: 'Visible Spectrum Radiometer'
    },
    PMW: {
      desc: '85–91 GHz Passive Microwave sounder. Penetrates cirrus obscuration to resolve underlying convective eyewall precipitation rings and curved rainbands.',
      band: 'Passive Microwave (85–91 GHz)',
      sensor: 'Microwave Imager / Sounder (SSMIS/AMSR2/GMI)'
    }
  };

  const currentInfo = channelDescriptions[selectedChannel];

  return (
    <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg overflow-hidden shadow-lg">
      {/* Console Top Bar */}
      <div className="px-4 py-2.5 border-b border-[#1b253b] flex flex-wrap items-center justify-between gap-3 bg-[#080d16]">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                MULTI-SPECTRAL SATELLITE ANALYSIS CONSOLE
              </span>
              <SourceBadge source="[TCIR ARCHIVE]" />
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsGridMode(!isGridMode)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition border ${
              isGridMode
                ? 'bg-[#15233c] text-cyan-300 border-[#274270] font-bold'
                : 'bg-[#070b13] text-slate-400 border-[#1b253b] hover:text-slate-200'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>{isGridMode ? '4-Channel Matrix' : 'Single Spectral Focus'}</span>
          </button>
        </div>
      </div>

      {/* Main Console Workstation */}
      <div className="p-4">
        {!isGridMode ? (
          <div>
            {/* Spectral Channel Selector Bar */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(['IR1', 'WV', 'VIS', 'PMW'] as const).map((ch) => {
                const isSelected = selectedChannel === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono transition border ${
                      isSelected
                        ? 'bg-[#15233c] text-cyan-300 border-[#274270] font-bold'
                        : 'bg-[#070b13] text-slate-400 border-[#1b253b] hover:text-slate-200 hover:bg-[#0f1726]'
                    }`}
                  >
                    <span>{ch}</span>
                    <span className="text-[10px] text-slate-500">
                      ({ch === 'IR1' ? '10.8µm' : ch === 'WV' ? '6.7µm' : ch === 'VIS' ? '0.65µm' : '85GHz'})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Display Viewport & Scientific Radiometry Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Satellite Frame Canvas */}
              <div className="md:col-span-7 flex flex-col items-center">
                <div className="relative w-full max-w-[340px] aspect-square rounded border border-[#1b253b] bg-black overflow-hidden shadow-inner">
                  {channelData ? (
                    <img
                      src={channelData.image_url}
                      alt={`${selectedChannel} frame ${currentFrame.timestep_label}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                      Channel Frame Offline
                    </div>
                  )}

                  {/* Optical Reticle / Crosshair */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <Crosshair className="w-12 h-12 text-white/30" />
                  </div>

                  {/* Telemetry Stamp */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 bg-black/85 border border-slate-700 rounded text-[10px] font-mono text-cyan-300 font-bold">
                      {selectedChannel}
                    </span>
                    <span className="px-1.5 py-0.5 bg-black/85 border border-slate-700 rounded text-[10px] font-mono text-amber-300 font-bold">
                      {currentFrame.timestep_label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spectral Radiometry & Channel Physics */}
              <div className="md:col-span-5 bg-[#070b13] p-3.5 rounded border border-[#1b253b] space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Spectral Channel</span>
                  <div className="text-sm font-bold text-slate-100 mt-0.5">
                    {channelData?.name || selectedChannel}
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans mt-1 leading-relaxed">
                    {currentInfo.desc}
                  </p>
                </div>

                <div className="border-t border-[#141d2e] pt-2 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Band:</span>
                    <span className="text-cyan-400">{currentInfo.band}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sensor Class:</span>
                    <span className="text-slate-300">{currentInfo.sensor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Spatial Dimension:</span>
                    <span className="text-slate-300">128 × 128 Pixels</span>
                  </div>
                  {channelData && channelData.has_data && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Radiometric Mean:</span>
                      <span className="text-amber-300">{channelData.mean.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 4-Channel Matrix Split View */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {(['IR1', 'WV', 'VIS', 'PMW'] as const).map((ch) => {
              const chData = currentFrame.channels[ch];
              return (
                <div
                  key={ch}
                  onClick={() => {
                    setSelectedChannel(ch);
                    setIsGridMode(false);
                  }}
                  className="bg-[#070b13] border border-[#1b253b] hover:border-[#274270] p-2 rounded cursor-pointer transition flex flex-col items-center"
                >
                  <div className="w-full aspect-square bg-black rounded border border-[#141d2e] overflow-hidden relative mb-1.5">
                    {chData ? (
                      <img src={chData.image_url} alt={ch} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                        N/A
                      </div>
                    )}
                    <span className="absolute top-1 left-1 px-1 py-0.2 bg-black/80 rounded font-mono text-[9px] text-cyan-400 font-bold">
                      {ch}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200">{ch}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {ch === 'IR1' ? '10.8µm Thermal' : ch === 'WV' ? '6.7µm Vapor' : ch === 'VIS' ? '0.65µm Visible' : '85GHz Microwave'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline Scrubber Bar */}
        <div className="mt-4 pt-3 border-t border-[#1b253b] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Frame Stepper Buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveFrameIndex((prev) => (prev > 0 ? prev - 1 : frames.length - 1))}
              className="p-1 bg-[#070b13] hover:bg-[#11192a] text-slate-300 rounded border border-[#1b253b] transition"
              title="Previous Frame"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-[#15233c] hover:bg-[#1c3053] text-cyan-300 border border-[#274270] rounded transition font-bold"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY LOOP'}</span>
            </button>
            <button
              onClick={() => setActiveFrameIndex((prev) => (prev + 1) % frames.length)}
              className="p-1 bg-[#070b13] hover:bg-[#11192a] text-slate-300 rounded border border-[#1b253b] transition"
              title="Next Frame"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timestep Selector Pills */}
          <div className="flex items-center space-x-1 bg-[#070b13] p-0.5 rounded border border-[#1b253b]">
            {frames.map((frame, idx) => {
              const isSelected = activeFrameIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveFrameIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`px-2.5 py-0.5 rounded text-xs transition ${
                    isSelected
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {frame.timestep_label}
                </button>
              );
            })}
          </div>

          {/* Playback Speed */}
          <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
            <span>SPEED:</span>
            {[1500, 1000, 500].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded border ${
                  playbackSpeed === s
                    ? 'bg-[#15233c] text-cyan-300 border-[#274270] font-bold'
                    : 'bg-[#070b13] text-slate-500 border-[#1b253b]'
                }`}
              >
                {s === 1500 ? '0.5x' : s === 1000 ? '1x' : '2x'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
