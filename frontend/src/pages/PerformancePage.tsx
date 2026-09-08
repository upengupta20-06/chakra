import React, { useState, useEffect } from 'react';
import { ModelPerformanceData } from '../types';
import { fetchModelPerformance } from '../services/api';
import { SourceBadge } from '../components/SourceBadge';
import { 
  BarChart3, 
  CheckCircle, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Table
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  Line 
} from 'recharts';

export const PerformancePage: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const perf = await fetchModelPerformance();
        setData(perf);
      } catch (err) {
        console.error('Failed to load performance metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-cyan-400">Loading offline test set validation metrics...</p>
      </div>
    );
  }

  const m = data.metrics;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-meteor-900/90 border border-meteor-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-950 border border-blue-800 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-white font-mono tracking-wide">
                  MODEL PERFORMANCE & SCIENTIFIC VALIDATION
                </h1>
                <SourceBadge source="[OFFLINE TEST SET]" />
              </div>
              <p className="text-xs font-mono text-slate-400">
                Rigorous out-of-sample evaluation on {data.evaluation_samples} test cyclone sequence windows
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-meteor-950 px-4 py-2 rounded-xl border border-meteor-800 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Independent Test Split (Zero Temporal Leakage)</span>
        </div>
      </div>

      {/* Top Regression & Classification KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-meteor-900/90 border border-meteor-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            MEAN ABSOLUTE ERROR
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-400">
            {m.mae} <span className="text-xs text-slate-400">kt</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Bias: {m.bias > 0 ? `+${m.bias}` : m.bias} kt
          </div>
        </div>

        <div className="bg-meteor-900/90 border border-meteor-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            ROOT MEAN SQUARED ERROR
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
            {m.rmse} <span className="text-xs text-slate-400">kt</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Across full test domain
          </div>
        </div>

        <div className="bg-meteor-900/90 border border-meteor-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            COEFFICIENT OF DET. (R²)
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">
            {m.r2}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Pearson r: {m.pearson_corr}
          </div>
        </div>

        <div className="bg-meteor-900/90 border border-meteor-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            ACCURACY WITHIN ±10 KT
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">
            {m.within_10kt_pct}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Within ±5 kt: {m.within_5kt_pct}%
          </div>
        </div>

        <div className="bg-meteor-900/90 border border-meteor-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            ACCURACY WITHIN ±20 KT
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-teal-400">
            {m.within_20kt_pct}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Operational tolerance
          </div>
        </div>

        <div className="bg-meteor-900/90 border border-meteor-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            INTENSITY CATEGORY MATCH
          </span>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-rose-400">
            {m.within_1class_accuracy_pct}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Exact: {m.exact_class_accuracy_pct}% | Within 1 Cat
          </div>
        </div>
      </div>

      {/* Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actual vs Predicted Scatter */}
        <div className="lg:col-span-6 bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-meteor-800 pb-2.5">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-white">
              ACTUAL VS. PREDICTED INTENSITY (VMAX IN KNOTS)
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">R² = {m.r2}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="actual" name="Actual" stroke="#64748b" domain={[10, 160]} />
                <YAxis type="number" dataKey="predicted" name="Predicted" stroke="#64748b" domain={[10, 160]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Scatter name="Test Samples" data={data.scatter_data} fill="#06b6d4" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-slate-400 text-center">
            Points clustered tightly along the 45-degree diagonal confirm balanced predictions without systematic high/low bias.
          </p>
        </div>

        {/* Residual Error Distribution */}
        <div className="lg:col-span-6 bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-meteor-800 pb-2.5">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-white">
              RESIDUAL ERROR DISTRIBUTION (PRED - ACTUAL)
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">Zero-Centered</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.residual_distribution} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bin" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-slate-400 text-center">
            Gaussian bell-shaped error histogram centered at +{m.bias} kt confirms absence of major under/over-estimation drift.
          </p>
        </div>
      </div>

      {/* MAE by Intensity & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAE by Intensity Class */}
        <div className="lg:col-span-6 bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-meteor-800 pb-2.5">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-white">
              MAE BY INTENSITY CLASS
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Knots</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mae_by_intensity} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="mae" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Class Confusion Matrix */}
        <div className="lg:col-span-6 bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-meteor-800 pb-2.5">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-white">
              INTENSITY CLASSIFICATION CONFUSION MATRIX
            </h3>
            <span className="text-[11px] font-mono text-teal-400 font-bold">7 Categories</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[10px] font-mono border-collapse">
              <thead>
                <tr className="bg-meteor-950 text-slate-400">
                  <th className="p-2 text-left">Actual \ Pred</th>
                  {data.confusion_matrix.classes.map((c) => (
                    <th key={c} className="p-2">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-meteor-800">
                {data.confusion_matrix.matrix.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-meteor-850/50">
                    <td className="p-2 font-bold text-left text-slate-300">
                      {data.confusion_matrix.classes[rIdx]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiag = rIdx === cIdx;
                      const isNear = Math.abs(rIdx - cIdx) === 1;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 font-bold ${
                            isDiag
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : isNear && val > 0
                              ? 'text-slate-300'
                              : val > 0
                              ? 'text-slate-500'
                              : 'text-slate-700'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] font-mono text-slate-400 text-center">
            Diagonal cells represent exact category predictions. Off-diagonal concentration along immediate neighbor categories indicates gradual, non-erratic boundary predictions.
          </p>
        </div>
      </div>

      {/* Cross-Basin Generalization & Missing-Sensor Degradation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cross-Basin Table */}
        <div className="lg:col-span-6 bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-meteor-800 pb-2.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-white">
              CROSS-BASIN GENERALIZATION EVALUATION
            </h3>
          </div>
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-meteor-800">
                <th className="py-2">Basin</th>
                <th className="py-2">Samples</th>
                <th className="py-2">MAE</th>
                <th className="py-2">RMSE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-meteor-800/60">
              {data.performance_by_basin.map((b) => (
                <tr key={b.basin} className="hover:bg-meteor-850/40">
                  <td className="py-2.5 font-bold text-white">{b.basin_name} ({b.basin})</td>
                  <td className="py-2.5 text-slate-300">{b.samples}</td>
                  <td className="py-2.5 text-cyan-400 font-bold">{b.mae} kt</td>
                  <td className="py-2.5 text-slate-300">{b.rmse} kt</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Missing-Sensor Degradation Table */}
        <div className="lg:col-span-6 bg-meteor-900/80 border border-meteor-800 rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-meteor-800 pb-2.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-white">
              MISSING-SENSOR ROBUSTNESS BENCHMARK
            </h3>
          </div>
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-meteor-800">
                <th className="py-2">Sensor Configuration</th>
                <th className="py-2">MAE</th>
                <th className="py-2">RMSE</th>
                <th className="py-2">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-meteor-800/60">
              {data.sensor_degradation.map((s, idx) => (
                <tr key={idx} className="hover:bg-meteor-850/40">
                  <td className="py-2.5 font-bold text-white text-[11px]">{s.channels}</td>
                  <td className="py-2.5 text-amber-400 font-bold">{s.mae} kt</td>
                  <td className="py-2.5 text-slate-300">{s.rmse} kt</td>
                  <td className="py-2.5 text-teal-300 font-semibold">{s.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
