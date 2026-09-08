import React, { useEffect, useRef } from 'react';
import { CycloneSummary, CycloneDetail } from '../types';
import L from 'leaflet';

interface CycloneMapProps {
  cyclones: CycloneSummary[];
  selectedCycloneDetail?: CycloneDetail | null;
  onSelectCyclone: (cycloneId: string) => void;
  activeBasin?: string;
  onSelectBasin?: (basin: string) => void;
}

export const CycloneMap: React.FC<CycloneMapProps> = ({
  cyclones,
  selectedCycloneDetail,
  onSelectCyclone,
  activeBasin = 'ALL',
  onSelectBasin
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on subtropical Pacific/Atlantic
    const map = L.map(mapContainerRef.current, {
      center: [22.0, -50.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark scientific CartoDB tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Track
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Color helper
    const getIntensityColor = (vmax: number) => {
      if (vmax < 34) return '#60a5fa'; // TD
      if (vmax < 64) return '#34d399'; // TS
      if (vmax < 83) return '#facc15'; // Cat 1
      if (vmax < 96) return '#fb923c'; // Cat 2
      if (vmax < 113) return '#f87171'; // Cat 3
      if (vmax < 137) return '#c084fc'; // Cat 4
      return '#f43f5e'; // Cat 5
    };

    // If detail is selected, draw historical track and R35 footprint
    if (selectedCycloneDetail && selectedCycloneDetail.history.length > 0) {
      const history = selectedCycloneDetail.history;
      const latlngs: [number, number][] = history.map((h) => [h.latitude, h.longitude]);

      // Historical track polyline
      const trackLine = L.polyline(latlngs, {
        color: '#06b6d4',
        weight: 3,
        opacity: 0.8,
        dashArray: '4, 6'
      }).addTo(layerGroup);

      // Add intermediate track points
      history.forEach((pt, idx) => {
        const isCurrent = idx === history.length - 1;
        if (!isCurrent && idx % 2 === 0) {
          L.circleMarker([pt.latitude, pt.longitude], {
            radius: 3.5,
            fillColor: getIntensityColor(pt.vmax),
            color: '#070b13',
            weight: 1,
            fillOpacity: 0.7
          })
            .bindTooltip(`T: ${pt.time}<br/>Vmax: ${pt.vmax} kt (${pt.intensity_class})`, {
              direction: 'top',
              className: 'font-mono text-xs'
            })
            .addTo(layerGroup);
        }
      });

      // Current Eye Marker
      const lastPoint = history[history.length - 1];
      const eyeIcon = L.divIcon({
        className: 'custom-eye-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-rose-500/40 animate-ping absolute"></div>
            <div class="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style="background-color: ${selectedCycloneDetail.intensity_color}">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([lastPoint.latitude, lastPoint.longitude], { icon: eyeIcon })
        .bindPopup(`
          <div class="p-2 font-sans space-y-1">
            <div class="font-mono font-bold text-sm text-cyan-400">Cyclone ${selectedCycloneDetail.cyclone_id}</div>
            <div class="text-xs text-slate-300">Basin: ${selectedCycloneDetail.basin}</div>
            <div class="text-xs text-slate-300 font-semibold">Intensity: ${selectedCycloneDetail.current_vmax} kt (${selectedCycloneDetail.intensity_short})</div>
            <div class="text-xs text-slate-400">Position: ${lastPoint.latitude.toFixed(1)}°N, ${lastPoint.longitude.toFixed(1)}°E</div>
            <div class="text-xs text-slate-400">MSLP: ${selectedCycloneDetail.current_mslp} hPa</div>
            <div class="text-xs text-amber-400 font-mono">R35 Footprint: ${selectedCycloneDetail.current_r35} nm</div>
          </div>
        `)
        .addTo(layerGroup);

      // R35 Hazard Footprint Circle (if R35 > 0)
      if (selectedCycloneDetail.current_r35 > 0) {
        // Convert nautical miles to meters (1 nm ~ 1852 meters)
        const radiusMeters = selectedCycloneDetail.current_r35 * 1852;
        L.circle([lastPoint.latitude, lastPoint.longitude], {
          radius: radiusMeters,
          color: '#f59e0b',
          weight: 1.5,
          fillColor: '#f59e0b',
          fillOpacity: 0.12,
          dashArray: '3, 4'
        })
          .bindTooltip(`R35-BASED HAZARD FOOTPRINT: ~${Math.round(selectedCycloneDetail.current_r35 * 1.852)} km extent`, {
            permanent: false,
            direction: 'center'
          })
          .addTo(layerGroup);
      }

      // Center map around the cyclone track
      map.fitBounds(trackLine.getBounds(), { padding: [40, 40], maxZoom: 6 });
    } else {
      // General overview: show all active / historical cyclones as markers
      cyclones.forEach((cyc) => {
        const markerColor = getIntensityColor(cyc.current_vmax);
        const marker = L.circleMarker([cyc.current_latitude, cyc.current_longitude], {
          radius: Math.max(4, Math.min(10, cyc.current_vmax / 15)),
          fillColor: markerColor,
          color: cyc.is_ri ? '#f43f5e' : '#070b13',
          weight: cyc.is_ri ? 2 : 1,
          fillOpacity: 0.85
        });

        marker.bindPopup(`
          <div class="p-2.5 font-sans space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono font-bold text-sm text-cyan-400">#${cyc.cyclone_id}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">${cyc.basin}</span>
            </div>
            <div class="text-xs text-white font-bold">${cyc.intensity_class} (${cyc.current_vmax} kt)</div>
            <div class="text-[11px] text-slate-300 font-mono">Peak: ${cyc.peak_vmax} kt | MSLP: ${cyc.current_mslp} hPa</div>
            <div class="text-[11px] text-slate-400">Coords: ${cyc.current_latitude.toFixed(1)}°N, ${cyc.current_longitude.toFixed(1)}°W</div>
            <button 
              id="select-cyc-${cyc.cyclone_id}"
              class="w-full mt-2 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-mono font-bold rounded transition text-center"
            >
              INSPECT SYSTEM
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`select-cyc-${cyc.cyclone_id}`);
          if (btn) {
            btn.onclick = () => onSelectCyclone(cyc.cyclone_id);
          }
        });

        marker.addTo(layerGroup);
      });
    }
  }, [cyclones, selectedCycloneDetail, onSelectCyclone]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-meteor-800 shadow-xl bg-meteor-950">
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />

      {/* Map Control Overlay: Basin Filter Bar */}
      {onSelectBasin && (
        <div className="absolute top-3.5 left-3.5 z-[400] flex items-center space-x-1.5 bg-meteor-900/90 backdrop-blur-md p-1 rounded-lg border border-meteor-700 shadow-lg">
          {(['ALL', 'ATLN', 'EPAC', 'WPAC'] as const).map((b) => (
            <button
              key={b}
              onClick={() => onSelectBasin(b)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition ${
                activeBasin === b
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-meteor-800'
              }`}
            >
              {b === 'ALL' ? 'GLOBAL' : b}
            </button>
          ))}
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3.5 left-3.5 z-[400] bg-meteor-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-meteor-800 text-[10px] font-mono space-y-1 hidden sm:block">
        <div className="text-slate-400 font-bold uppercase tracking-wider mb-1">Intensity Scale</div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
          <span className="text-slate-300">TD (&lt;34 kt)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] ml-1" />
          <span className="text-slate-300">TS (34-63)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#facc15] ml-1" />
          <span className="text-slate-300">Cat 1-2 (64-95)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#f87171] ml-1" />
          <span className="text-slate-300">Cat 3+ (Major)</span>
        </div>
      </div>
    </div>
  );
};
