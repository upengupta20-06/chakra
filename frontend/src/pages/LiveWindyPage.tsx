import React, { useState } from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { Wind, ExternalLink, Compass, Eye, ShieldAlert, Radio } from 'lucide-react';

interface LiveWindyPageProps {
  selectedLatitude?: number;
  selectedLongitude?: number;
  selectedCycloneId?: string;
}

export const LiveWindyPage: React.FC<LiveWindyPageProps> = ({
  selectedLatitude = 20.0,
  selectedLongitude = -60.0,
  selectedCycloneId
}) => {
  const [currentLat, setCurrentLat] = useState(selectedLatitude);
  const [currentLon, setCurrentLon] = useState(selectedLongitude);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [currentOverlay, setCurrentOverlay] = useState<'wind' | 'satellite' | 'radar' | 'rain'>('wind');

  const basins = [
    { label: selectedCycloneId ? `Selected (${selectedCycloneId})` : 'Target Cyclone', lat: selectedLatitude, lon: selectedLongitude, zoom: 5 },
    { label: 'North Atlantic Basin', lat: 24.0, lon: -65.0, zoom: 4 },
    { label: 'Western Pacific (Typhoons)', lat: 18.0, lon: 130.0, zoom: 4 },
    { label: 'Eastern Pacific', lat: 16.0, lon: -115.0, zoom: 4 },
    { label: 'North Indian Ocean (Bay of Bengal)', lat: 15.0, lon: 88.0, zoom: 5 }
  ];

  // Official Windy embed URL
  const windyEmbedUrl = `https://embed.windy.com/embed2.html?lat=${currentLat}&lon=${currentLon}&detailLat=${currentLat}&detailLon=${currentLon}&width=100%25&height=650&zoom=${currentZoom}&level=surface&overlay=${currentOverlay}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=kt&metricTemp=%C2%B0C&radarRange=-1`;

  // External live URL for new tab
  const windyExternalUrl = `https://www.windy.com/?${currentLat},${currentLon},${currentZoom},m:eG4aeFw`;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-meteor-900/90 border border-meteor-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-950 border border-rose-800 rounded-lg">
              <Wind className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-white font-mono tracking-wide">
                  LIVE WEATHER / CYCLONE MONITOR
                </h1>
                <SourceBadge source="[LIVE EXTERNAL WEATHER DATA]" />
              </div>
              <p className="text-xs font-mono text-slate-400">
                Independent real-time atmospheric wind stream & satellite radar visualization via Windy.com
              </p>
            </div>
          </div>
        </div>

        {/* External Launch Button */}
        <a
          href={windyExternalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono text-xs font-extrabold rounded-xl shadow-lg shadow-rose-950 transition tracking-wider shrink-0"
        >
          <span>OPEN LIVE WINDY MAP</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>

      {/* Basin Jumper & Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-meteor-900/60 p-3.5 rounded-xl border border-meteor-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1 flex items-center">
            <Compass className="w-3.5 h-3.5 mr-1" /> FOCUS:
          </span>
          {basins.map((b, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentLat(b.lat);
                setCurrentLon(b.lon);
                setCurrentZoom(b.zoom);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition border ${
                currentLat === b.lat && currentLon === b.lon
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'bg-meteor-850 text-slate-400 border-meteor-800 hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Atmospheric Layer Switcher */}
        <div className="flex items-center space-x-1.5 bg-meteor-950 p-1 rounded-lg border border-meteor-800 text-xs font-mono">
          {(['wind', 'satellite', 'radar', 'rain'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setCurrentOverlay(layer)}
              className={`px-2.5 py-1 rounded uppercase tracking-wider ${
                currentOverlay === layer
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Live Windy Frame */}
      <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-meteor-800 bg-meteor-950 shadow-2xl">
        <iframe
          title="Live Windy Weather Map"
          src={windyEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allow="geolocation"
        />

        {/* Floating Attribution Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-meteor-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-meteor-800 shadow-xl flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
              <span>ECMWF Atmospheric Layer</span>
              <SourceBadge source="[LIVE WINDY]" size="sm" />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Center: {currentLat.toFixed(1)}°N, {currentLon.toFixed(1)}°E · Wind Metric: Knots
            </div>
          </div>
        </div>
      </div>

      {/* Strict Scientific Data Integrity Notice */}
      <div className="p-4 bg-meteor-950 border border-meteor-800 rounded-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>DATA INTEGRITY & ATTRIBUTION NOTICE</span>
        </div>
        <p className="text-xs font-mono text-slate-400 leading-relaxed">
          The visualization displayed above is streamed directly from <strong>Windy.com (ECMWF global numerical model)</strong> as an external operational comparative layer. It is <strong>NOT</strong> generated by this platform's AI neural network. AI predictions, TCIR satellite imagery, and NOAA structural descriptors remain strictly segregated and traceable across the entire application interface.
        </p>
      </div>
    </div>
  );
};
