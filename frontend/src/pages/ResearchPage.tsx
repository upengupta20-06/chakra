import React from 'react';
import { SourceBadge } from '../components/SourceBadge';
import { 
  BookOpen, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  Target, 
  ArrowDown,
  Sparkles
} from 'lucide-react';

export const ResearchPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto text-xs font-mono animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0b101b] border border-[#1b253b] p-5 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#131e33] border border-[#233557] rounded text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-wide">
              SYSTEM ARCHITECTURE & METEOROLOGICAL METHODOLOGY
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Technical specification for multi-spectral cyclone monitoring, spatiotemporal modeling, and objective intensity guidance
            </p>
          </div>
        </div>
        <SourceBadge source="[OPERATIONAL SPECIFICATION]" />
      </div>

      {/* Spatiotemporal Architecture Workflow */}
      <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b253b] pb-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              SPATIOTEMPORAL NEURAL NETWORK ARCHITECTURE
            </span>
          </div>
          <SourceBadge source="[CONVLSTM + TRANSFORMER]" />
        </div>

        {/* Technical Flow Diagram */}
        <div className="space-y-2.5 max-w-2xl mx-auto">
          <div className="p-3 rounded bg-[#070b13] border border-[#1b253b] flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">1. MULTI-CHANNEL SATELLITE SEQUENCE (T=4)</div>
              <div className="text-[10px] text-slate-500">Shape: (Batch, 4 timesteps, 128, 128, 4 channels: IR1, WV, VIS, PMW)</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#131e33] text-cyan-300 border border-[#233557]">INPUT</span>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>

          <div className="p-3 rounded bg-[#070b13] border border-[#1b253b] flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">2. TIMEDISTRIBUTED 2D CNN (Spatial Feature Extraction)</div>
              <div className="text-[10px] text-slate-500">Conv2D (32, 48, 64 filters) + BatchNormalization + MaxPool2D</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300">SPATIAL</span>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>

          <div className="p-3 rounded bg-[#070b13] border border-[#1b253b] flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">3. CONVLSTM2D (Spatiotemporal Evolution)</div>
              <div className="text-[10px] text-slate-500">64 filters, 3x3 kernel tracking sequential eyewall contraction & rainband rotation</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#261c10] text-amber-300 border border-[#4a361c]">TEMPORAL</span>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>

          <div className="p-3 rounded bg-[#070b13] border border-[#1b253b] flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">4. TEMPORAL TOKENS & POSITIONAL EMBEDDING</div>
              <div className="text-[10px] text-slate-500">GlobalAveragePooling2D maps spatial volumes to sequential tokens (Batch, 4, 64)</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300">TOKENIZATION</span>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>

          <div className="p-3 rounded bg-[#070b13] border border-[#1b253b] flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">5. TRANSFORMER ENCODER (Temporal Self-Attention)</div>
              <div className="text-[10px] text-slate-500">4 Attention Heads + LayerNorm + GELU FFN weighting critical rapid-change timesteps</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f172d] text-purple-300 border border-[#3e2e5c]">ATTENTION</span>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>

          <div className="p-3 rounded bg-[#070b13] border border-[#274270] flex items-center justify-between">
            <div>
              <div className="font-bold text-cyan-300">6. SHARED CYCLONE REPRESENTATION (32-D Latent Space)</div>
              <div className="text-[10px] text-slate-400">Dense(64) → Dropout(0.2) → Dense(32). Used for historical analog cosine similarity</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">LATENT</span>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>

          {/* Multi-Task Heads */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-[#070b13] border border-[#1b253b] rounded">
              <span className="text-[9px] text-slate-500 block">HEAD 1</span>
              <strong className="text-slate-200 text-xs block mt-0.5">Vmax Regression</strong>
              <span className="text-[10px] text-cyan-400">Dense(1) · Huber</span>
            </div>
            <div className="p-2.5 bg-[#070b13] border border-[#1b253b] rounded">
              <span className="text-[9px] text-slate-500 block">HEAD 2</span>
              <strong className="text-slate-200 text-xs block mt-0.5">Categorization</strong>
              <span className="text-[10px] text-emerald-400">Dense(7) · Softmax</span>
            </div>
            <div className="p-2.5 bg-[#070b13] border border-[#1b253b] rounded">
              <span className="text-[9px] text-slate-500 block">HEAD 3</span>
              <strong className="text-slate-200 text-xs block mt-0.5">MSLP Inference</strong>
              <span className="text-[10px] text-amber-300">Wind-Pressure Deficit</span>
            </div>
            <div className="p-2.5 bg-[#070b13] border border-[#1b253b] rounded">
              <span className="text-[9px] text-slate-500 block">HEAD 4</span>
              <strong className="text-slate-200 text-xs block mt-0.5">Short-Term Extrap</strong>
              <span className="text-[10px] text-rose-400">+3h / +6h Trend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meteorological Data Layers Role */}
      <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg p-5 space-y-3">
        <span className="font-bold text-slate-200 uppercase tracking-wider block border-b border-[#1b253b] pb-2">
          DATA INGESTION & SATELLITE RADIOMETRY CALIBRATION
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-[#070b13] rounded border border-[#1b253b] space-y-1">
            <div className="flex items-center space-x-2">
              <SourceBadge source="[TCIR ARCHIVE]" />
              <strong className="text-slate-200">Multi-Spectral Radiometer Data</strong>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Provides normalized 4-channel matrices (IR1, WV, VIS, PMW) at 128×128 spatial resolution across 21,076 historical timestamps. Forms the direct spatiotemporal input tensor.
            </p>
          </div>

          <div className="p-3 bg-[#070b13] rounded border border-[#1b253b] space-y-1">
            <div className="flex items-center space-x-2">
              <SourceBadge source="[NOAA ADT-HURSAT]" />
              <strong className="text-slate-200">Objective Dvorak Structural Reference</strong>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Records objective Current Intensity (CI), Raw T-numbers, Eye Temperature, and Cloud Symmetry descriptors. Serves as an independent operational meteorological reference layer.
            </p>
          </div>

          <div className="p-3 bg-[#070b13] rounded border border-[#1b253b] space-y-1">
            <div className="flex items-center space-x-2">
              <SourceBadge source="[MODEL GUIDANCE]" />
              <strong className="text-slate-200">Neural Network Spatiotemporal Inference</strong>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Processes the 4-step sequence to produce real-time Vmax estimations, 7-class categorization, calibrated uncertainty intervals, and spatial Grad-CAM attention maps.
            </p>
          </div>

          <div className="p-3 bg-[#070b13] rounded border border-[#1b253b] space-y-1">
            <div className="flex items-center space-x-2">
              <SourceBadge source="[LIVE WINDY]" />
              <strong className="text-slate-200">Synoptic Radar & Streamlines</strong>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Integrates real-time ECMWF atmospheric streamlines and radar imagery. Segregated strictly from neural network outputs to maintain operational transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Constraints & Roadmap */}
      <div className="bg-[#0b101b] border border-[#1b253b] rounded-lg p-5 space-y-3">
        <span className="font-bold text-slate-200 uppercase tracking-wider block border-b border-[#1b253b] pb-2">
          SYSTEM CONSTRAINTS & OPERATIONAL ROADMAP
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
          <div className="space-y-1.5">
            <div className="text-amber-400 font-bold flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Current System Constraints:</span>
            </div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside font-sans">
              <li>Sequence model requires 4 consecutive 3-hour frames (T-9h to T) for optimal inference.</li>
              <li>Long-range forecasting (&gt; +6h) is constrained by sequence coverage and labeled unavailable to prevent fabricated predictions.</li>
              <li>Passive microwave (PMW) passes are intermittent due to polar-orbiting satellite revisit times.</li>
              <li>CPU inference is optimized for low-latency operational execution (~150ms per forward pass).</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <div className="text-cyan-400 font-bold flex items-center space-x-1">
              <Target className="w-3.5 h-3.5" />
              <span>Operational Roadmap:</span>
            </div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside font-sans">
              <li>Direct assimilation of INSAT-3D/3DR and MTG-I multispectral channels for Indian Ocean coverage.</li>
              <li>Physics-informed neural network (PINN) loss terms enforcing hydrostatic and gradient wind balance.</li>
              <li>Automated Common Alerting Protocol (CAP) feed generation for coastal emergency management agencies.</li>
              <li>Quantized edge deployment for airborne reconnaissance and offshore marine installations.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
