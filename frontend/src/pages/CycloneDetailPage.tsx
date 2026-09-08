import React, { useState, useEffect } from 'react';
import { 
  CycloneDetail, 
  SatelliteFrame, 
  PredictionResult, 
  ForecastResult, 
  ExplainabilityResult, 
  SimilarCyclone,
  NOAAData,
  AIStructuralProfile
} from '../types';
import { 
  predictIntensity, 
  predictForecast, 
  fetchExplainability, 
  fetchSimilarCyclones,
  fetchNOAAMorphology,
  fetchCycloneSatellite
} from '../services/api';
import { SourceBadge } from '../components/SourceBadge';
import { SatelliteViewer } from '../components/SatelliteViewer';
import { ExplainabilityModal } from '../components/ExplainabilityModal';
import { MissingSensorTester } from '../components/MissingSensorTester';
import { SimilarityPanel } from '../components/SimilarityPanel';
import { CycloneMap } from '../maps/CycloneMap';
import { 
  ArrowLeft, 
  Wind, 
  Compass, 
  Radio, 
  Zap, 
  Brain, 
  Clock, 
  Activity, 
  RefreshCw,
  MapPin,
  Eye,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface CycloneDetailPageProps {
  cycloneDetail: CycloneDetail;
  onBack: () => void;
  onSelectCyclone: (cycloneId: string) => void;
}

export const CycloneDetailPage: React.FC<CycloneDetailPageProps> = ({
  cycloneDetail,
  onBack,
  onSelectCyclone
}) => {
  const [satelliteFrames, setSatelliteFrames] = useState<SatelliteFrame[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [explainability, setExplainability] = useState<ExplainabilityResult | null>(null);
  const [similarCyclones, setSimilarCyclones] = useState<SimilarCyclone[]>([]);
  const [noaaData, setNoaaData] = useState<NOAAData | null>(null);
  const [aiStructural, setAiStructural] = useState<AIStructuralProfile | null>(null);

  const [activeChannels, setActiveChannels] = useState<string[]>(['IR1', 'WV', 'VIS', 'PMW']);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [selectedBaseChannel, setSelectedBaseChannel] = useState(0);

  const [isLoadingSatellite, setIsLoadingSatellite] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isLoadingExplain, setIsLoadingExplain] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingSatellite(true);
      try {
        const satRes = await fetchCycloneSatellite(cycloneDetail.cyclone_id);
        if (isMounted) setSatelliteFrames(satRes.frames);
      } catch (err) {
        console.error('Failed to load satellite frames:', err);
      } finally {
        if (isMounted) setIsLoadingSatellite(false);
      }

      setIsPredicting(true);
      try {
        const predRes = await predictIntensity(cycloneDetail.cyclone_id, ['IR1', 'WV', 'VIS', 'PMW']);
        const fcRes = await predictForecast(cycloneDetail.cyclone_id, predRes.ai_vmax);
        if (isMounted) {
          setPrediction(predRes);
          setForecast(fcRes);
        }
      } catch (err) {
        console.error('Prediction error:', err);
      } finally {
        if (isMounted) setIsPredicting(false);
      }

      try {
        const noaaRes = await fetchNOAAMorphology(cycloneDetail.cyclone_id);
        if (isMounted) {
          setNoaaData(noaaRes.noaa_adt_hursat);
          setAiStructural(noaaRes.ai_structural_profile);
        }
      } catch (err) {
        console.error('NOAA morphology error:', err);
      }

      setIsLoadingSimilar(true);
      try {
        const simRes = await fetchSimilarCyclones(cycloneDetail.cyclone_id, cycloneDetail.current_vmax);
        if (isMounted) setSimilarCyclones(simRes.matches);
      } catch (err) {
        console.error('Similarity error:', err);
      } finally {
        if (isMounted) setIsLoadingSimilar(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [cycloneDetail.cyclone_id]);

  const handleRunRobustnessTest = async () => {
    setIsPredicting(true);
    try {
      const predRes = await predictIntensity(cycloneDetail.cyclone_id, activeChannels);
      setPrediction(predRes);
      const fcRes = await predictForecast(cycloneDetail.cyclone_id, predRes.ai_vmax);
      setForecast(fcRes);
    } catch (err) {
      console.error('Robustness test error:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleOpenExplainability = async () => {
    setIsExplainModalOpen(true);
    if (!explainability) {
      setIsLoadingExplain(true);
      try {
        const expRes = await fetchExplainability(cycloneDetail.cyclone_id, selectedBaseChannel);
        setExplainability(expRes);
      } catch (err) {
        console.error('Explainability error:', err);
      } finally {
        setIsLoadingExplain(false);
      }
    }
  };

  const handleBaseChannelChange = async (chIdx: number) => {
    setSelectedBaseChannel(chIdx);
    setIsLoadingExplain(true);
    try {
      const expRes = await fetchExplainability(cycloneDetail.cyclone_id, chIdx);
      setExplainability(expRes);
    } catch (err) {
      console.error('Explainability channel error:', err);
    } finally {
      setIsLoadingExplain(false);
    }
  };

  const chartData = cycloneDetail.history.map((h) => ({
    time: h.time.slice(5, 16),
    vmax: h.vmax,
    mslp: h.mslp,
    r35: h.r35
  }));

  const currentVmax = prediction?.ai_vmax ?? cycloneDetail.current_vmax;
  const currentIntensity = prediction?.intensity_class ?? cycloneDetail.intensity_class;
  const currentShort = prediction?.intensity_short ?? cycloneDetail.intensity_short;
  const currentColor = prediction?.intensity_color ?? cycloneDetail.intensity_color;

  return (
    <div className="space-y-4 pb-16 animate-fadeIn">
      {/* Top Advisory Bar */}
      <div className="bg-[#0b101b] border border-[#1b253b] p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#070b13] border border-[#1b253b] hover:bg-[#121b2b] text-slate-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ROSTER</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-100 text-sm">
              STORM #{cycloneDetail.cyclone_id}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#131e33] border border-[#233557] text-cyan-300 font-bold text-[10px]">
              {cycloneDetail.basin} BASIN
            </span>
            <span
              className="px-2 py-0.5 rounded font-bold text-[10px] border"
              style={{
                backgroundColor: `${currentColor}15`,
                color: currentColor,
                borderColor: `${currentColor}40`
              }}
            >
              {currentShort} · {currentVmax} KT
            </span>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenExplainability}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#131e33] hover:bg-[#1c2e4f] text-cyan-300 border border-[#274270] transition font-semibold text-[11px]"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>FEATURE ATTRIBUTION</span>
          </button>
          <button
            onClick={handleRunRobustnessTest}
            disabled={isPredicting}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#070b13] hover:bg-[#11192a] text-slate-300 border border-[#1b253b] transition text-[11px]"
          >
            <RefreshCw className={`w-3 h-3 ${isPredicting ? 'animate-spin' : ''}`} />
            <span>UPDATE GUIDANCE</span>
          </button>
        </div>
      </div>

      {/* Primary Kinematic Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
        <div className="bg-[#0b101b] border border-[#1b253b] p-3 rounded-lg">
          <div className="flex justify-between text-slate-500 text-[10px] uppercase mb-1">
            <span>SUSTAINED WIND</span>
            <SourceBadge source="[MODEL GUIDANCE]" size="sm" />
          </div>
          <div className="text-xl font-bold text-white">
            {currentVmax} <span className="text-xs text-slate-400 font-normal">kt</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Ref: {cycloneDetail.current_vmax} kt
          </div>
        </div>

        <div className="bg-[#0b101b] border border-[#1b253b] p-3 rounded-lg">
          <div className="flex justify-between text-slate-500 text-[10px] uppercase mb-1">
            <span>CLASSIFICATION</span>
            <SourceBadge source="[WMO/SAFFIR]" size="sm" />
          </div>
          <div className="text-lg font-bold truncate" style={{ color: currentColor }}>
            {currentShort}
          </div>
          <div className="text-[10px] text-slate-300 truncate mt-0.5">
            {currentIntensity}
          </div>
        </div>

        <div className="bg-[#0b101b] border border-[#1b253b] p-3 rounded-lg">
          <div className="flex justify-between text-slate-500 text-[10px] uppercase mb-1">
            <span>CENTRAL PRESSURE</span>
            <SourceBadge source="[OBSERVED]" size="sm" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {cycloneDetail.current_mslp} <span className="text-xs text-slate-400 font-normal">hPa</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Min: {cycloneDetail.min_mslp} hPa
          </div>
        </div>

        <div className="bg-[#0b101b] border border-[#1b253b] p-3 rounded-lg">
          <div className="flex justify-between text-slate-500 text-[10px] uppercase mb-1">
            <span>R35 EXTENT</span>
            <SourceBadge source="[GALE RADIUS]" size="sm" />
          </div>
          <div className="text-xl font-bold text-amber-300">
            {cycloneDetail.current_r35} <span className="text-xs text-slate-400 font-normal">nm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ~{Math.round(cycloneDetail.current_r35 * 1.852)} km radius
          </div>
        </div>

        <div className="bg-[#0b101b] border border-[#1b253b] p-3 rounded-lg">
          <div className="flex justify-between text-slate-500 text-[10px] uppercase mb-1">
            <span>SYSTEM MOVEMENT</span>
            <SourceBadge source="[TRACK FIX]" size="sm" />
          </div>
          <div className="text-base font-bold text-cyan-400 truncate">
            {cycloneDetail.movement.cardinal_direction} · {cycloneDetail.movement.speed_kmh} km/h
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Azimuth: {cycloneDetail.movement.bearing_degrees}°
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${
          cycloneDetail.is_ri 
            ? 'bg-[#1a0e14] border-[#471822]' 
            : 'bg-[#0b101b] border-[#1b253b]'
        }`}>
          <div className="flex justify-between text-slate-500 text-[10px] uppercase mb-1">
            <span>INTENSITY TREND</span>
            {cycloneDetail.is_ri && <Zap className="w-3 h-3 text-rose-400" />}
          </div>
          <div className={`text-sm font-bold truncate ${cycloneDetail.is_ri ? 'text-rose-400' : 'text-slate-200'}`}>
            {cycloneDetail.trend}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ΔVmax: {cycloneDetail.delta_vmax > 0 ? `+${cycloneDetail.delta_vmax}` : cycloneDetail.delta_vmax} kt / window
          </div>
        </div>
      </div>

      {/* Multi-Spectral Satellite Console */}
      <SatelliteViewer frames={satelliteFrames} isLoading={isLoadingSatellite} />

      {/* Short-Term Model Guidance & Extrapolation (+3h, +6h) */}
      <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1b253b] pb-2.5 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              OBJECTIVE NUMERICAL GUIDANCE & SHORT-TERM FORECAST
            </span>
          </div>
          <SourceBadge source="[SPATIOTEMPORAL MODEL]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* NOW */}
          <div className="bg-[#070b13] p-3 rounded border border-[#1b253b]">
            <div className="flex justify-between text-slate-500 mb-1 text-[10px]">
              <span>T (INITIAL FIX)</span>
              <span className="text-emerald-400 font-bold">ANALYSIS</span>
            </div>
            <div className="text-xl font-bold text-white">
              {forecast?.current.vmax ?? currentVmax} kt
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Category: {forecast?.current.intensity_class ?? currentShort}
            </div>
          </div>

          {/* +3 HOURS */}
          <div className="bg-[#070b13] p-3 rounded border border-[#1f3354]">
            <div className="flex justify-between text-slate-500 mb-1 text-[10px]">
              <span className="text-cyan-400 font-bold">T + 3 HOURS</span>
              <span className="text-cyan-300">CONF: HIGH</span>
            </div>
            <div className="text-xl font-bold text-cyan-300">
              {forecast?.plus_3h.vmax} kt
            </div>
            <div className="text-[10px] text-slate-300 mt-1 flex justify-between">
              <span>{forecast?.plus_3h.intensity_class}</span>
              <span className={(forecast?.plus_3h.delta ?? 0) >= 0 ? 'text-amber-400' : 'text-blue-400'}>
                {(forecast?.plus_3h.delta ?? 0) >= 0 ? `+${forecast?.plus_3h.delta}` : forecast?.plus_3h.delta} kt
              </span>
            </div>
          </div>

          {/* +6 HOURS */}
          <div className="bg-[#070b13] p-3 rounded border border-[#1b253b]">
            <div className="flex justify-between text-slate-500 mb-1 text-[10px]">
              <span className="text-slate-300 font-bold">T + 6 HOURS</span>
              <span className="text-slate-400">CONF: MODERATE</span>
            </div>
            <div className="text-xl font-bold text-slate-100">
              {forecast?.plus_6h.vmax} kt
            </div>
            <div className="text-[10px] text-slate-300 mt-1 flex justify-between">
              <span>{forecast?.plus_6h.intensity_class}</span>
              <span className={(forecast?.plus_6h.delta ?? 0) >= 0 ? 'text-amber-400' : 'text-blue-400'}>
                {(forecast?.plus_6h.delta ?? 0) >= 0 ? `+${forecast?.plus_6h.delta}` : forecast?.plus_6h.delta} kt
              </span>
            </div>
          </div>

          {/* Extended Horizon Guardrail */}
          <div className="bg-[#070b13]/60 p-3 rounded border border-[#141d2e] flex flex-col justify-center text-center opacity-70">
            <div className="text-[10px] text-slate-500">EXTENDED &gt; +6H HORIZON</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Sequence coverage threshold reached
            </div>
            <div className="text-[9px] text-slate-600 mt-0.5">
              Deterministic dynamical model required for long-range track
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Historical Track & Intensity Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Intensity Chart */}
        <div className="lg:col-span-7 bg-[#0b101b] border border-[#1b253b] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1b253b] pb-2 text-xs font-mono">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              HISTORICAL INTENSITY & CENTRAL PRESSURE PROFILE
            </span>
            <SourceBadge source="[TCIR OBSERVATIONS]" />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162033" />
                <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                <YAxis yAxisId="left" stroke="#06b6d4" fontSize={9} domain={[0, 'auto']} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={9} domain={[900, 1020]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070b13', borderColor: '#1b253b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="vmax"
                  name="Vmax (kt)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 1.5 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="mslp"
                  name="MSLP (hPa)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Geographical Track & R35 Hazard Footprint Map */}
        <div className="lg:col-span-5 bg-[#0b101b] border border-[#1b253b] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1b253b] pb-2 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-slate-200 uppercase tracking-wider">
                SYNOPTIC TRACK & GALE FOOTPRINT
              </span>
            </div>
            <SourceBadge source="[R35 HAZARD FOOTPRINT]" />
          </div>

          <div className="h-60 w-full rounded border border-[#1b253b] overflow-hidden">
            <CycloneMap
              cyclones={[]}
              selectedCycloneDetail={cycloneDetail}
              onSelectCyclone={onSelectCyclone}
            />
          </div>
        </div>
      </div>

      {/* Structural & Kinematic Morphology Analysis */}
      <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg p-4 space-y-3 text-xs font-mono">
        <div className="flex items-center justify-between border-b border-[#1b253b] pb-2">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              CYCLONE STRUCTURAL & MORPHOLOGY PROFILE
            </span>
          </div>
          {noaaData?.matched ? (
            <SourceBadge source="[NOAA ADT-HURSAT REFERENCE]" />
          ) : (
            <SourceBadge source="[MULTI-CHANNEL DERIVED]" />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-[#070b13] p-2.5 rounded border border-[#1b253b]">
            <span className="text-[10px] text-slate-500 uppercase block">Eye Structure:</span>
            <span className="font-bold text-slate-200 mt-0.5 block">
              {aiStructural?.eye_organization || 'Defined Eyewall Ring'}
            </span>
          </div>
          <div className="bg-[#070b13] p-2.5 rounded border border-[#1b253b]">
            <span className="text-[10px] text-slate-500 uppercase block">Cloud Symmetry:</span>
            <span className="font-bold text-cyan-400 mt-0.5 block">
              {aiStructural?.cloud_symmetry || 'High (Symmetric CDO)'}
            </span>
          </div>
          <div className="bg-[#070b13] p-2.5 rounded border border-[#1b253b]">
            <span className="text-[10px] text-slate-500 uppercase block">Convective Org:</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">
              {aiStructural?.convective_organization || 'High Eyewall Core'}
            </span>
          </div>
          <div className="bg-[#070b13] p-2.5 rounded border border-[#1b253b]">
            <span className="text-[10px] text-slate-500 uppercase block">Environmental Shear:</span>
            <span className="font-bold text-amber-400 mt-0.5 block">
              {aiStructural?.shear_influence || 'Low to Moderate'}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 pt-1">
          * Source Identification: {noaaData?.matched
            ? `Matched NOAA ADT-HURSAT satellite pass recorded for ${cycloneDetail.cyclone_id} (CI: ${noaaData.ci_number}, RawT: ${noaaData.raw_t}, Cloud Scene: ${noaaData.cloud_scene}).`
            : 'Multi-spectral satellite morphology derived objectively from IR1 cloud-top thermal gradient and PMW rainband scattering.'}
        </div>
      </div>

      {/* Sensor Availability & Outage Testing */}
      <MissingSensorTester
        activeChannels={activeChannels}
        onToggleChannel={(ch) => {
          if (activeChannels.includes(ch)) {
            if (activeChannels.length > 1) setActiveChannels(activeChannels.filter((c) => c !== ch));
          } else {
            setActiveChannels([...activeChannels, ch]);
          }
        }}
        onApplyPreset={(chs) => setActiveChannels(chs)}
        onRunTest={handleRunRobustnessTest}
        isLoading={isPredicting}
        confidence={prediction?.confidence || 'HIGH'}
        uncertaintyMargin={prediction?.uncertainty_margin || 6.2}
      />

      {/* Historical Cyclone Analog Systems */}
      <SimilarityPanel
        matches={similarCyclones}
        isLoading={isLoadingSimilar}
        onSelectCyclone={onSelectCyclone}
      />

      {/* Feature Attribution Modal */}
      <ExplainabilityModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        explainability={explainability}
        isLoading={isLoadingExplain}
        onChannelChange={handleBaseChannelChange}
        selectedBaseChannel={selectedBaseChannel}
      />
    </div>
  );
};
