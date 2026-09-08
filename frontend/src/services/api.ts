import {
  CycloneSummary,
  CycloneDetail,
  SatelliteFrame,
  PredictionResult,
  ForecastResult,
  ExplainabilityResult,
  SimilarCyclone,
  ModelPerformanceData,
  Alert,
  NOAAData,
  AIStructuralProfile
} from '../types';

const API_BASE = '/api';

export async function fetchDataStatus() {
  const res = await fetch(`${API_BASE}/data-status`);
  if (!res.ok) throw new Error('Failed to fetch system data status');
  return res.json();
}

export async function fetchCyclones(params?: {
  basin?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; limit: number; offset: number; cyclones: CycloneSummary[] }> {
  const query = new URLSearchParams();
  if (params?.basin && params.basin !== 'ALL') query.set('basin', params.basin);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  const res = await fetch(`${API_BASE}/cyclones?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch cyclones roster');
  return res.json();
}

export async function fetchCycloneDetail(cycloneId: string): Promise<CycloneDetail> {
  const res = await fetch(`${API_BASE}/cyclones/${encodeURIComponent(cycloneId)}`);
  if (!res.ok) throw new Error(`Failed to fetch cyclone detail for ${cycloneId}`);
  return res.json();
}

export async function fetchCycloneSatellite(cycloneId: string, timesteps = 4): Promise<{
  cyclone_id: string;
  basin: string;
  frames_count: number;
  frames: SatelliteFrame[];
}> {
  const res = await fetch(`${API_BASE}/cyclones/${encodeURIComponent(cycloneId)}/satellite?timesteps=${timesteps}`);
  if (!res.ok) throw new Error(`Failed to fetch satellite imagery for ${cycloneId}`);
  return res.json();
}

export async function predictIntensity(
  cycloneId: string,
  activeChannels: string[] = ['IR1', 'WV', 'VIS', 'PMW']
): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict/intensity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cyclone_id: cycloneId, active_channels: activeChannels })
  });
  if (!res.ok) throw new Error(`Inference request failed for ${cycloneId}`);
  return res.json();
}

export async function predictForecast(
  cycloneId: string,
  currentVmax?: number
): Promise<ForecastResult> {
  const res = await fetch(`${API_BASE}/predict/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cyclone_id: cycloneId, current_vmax: currentVmax })
  });
  if (!res.ok) throw new Error(`Forecast request failed for ${cycloneId}`);
  return res.json();
}

export async function fetchExplainability(
  cycloneId: string,
  baseChannel = 0
): Promise<ExplainabilityResult> {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cyclone_id: cycloneId, base_channel: baseChannel })
  });
  if (!res.ok) throw new Error(`Explainability request failed for ${cycloneId}`);
  return res.json();
}

export async function fetchSimilarCyclones(
  cycloneId: string,
  currentVmax?: number,
  limit = 4
): Promise<{
  cyclone_id: string;
  current_vmax: number;
  source: string;
  matches: SimilarCyclone[];
  disclaimer: string;
}> {
  const res = await fetch(`${API_BASE}/similar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cyclone_id: cycloneId, current_vmax: currentVmax, limit })
  });
  if (!res.ok) throw new Error(`Historical similarity request failed for ${cycloneId}`);
  return res.json();
}

export async function fetchModelPerformance(): Promise<ModelPerformanceData> {
  const res = await fetch(`${API_BASE}/performance`);
  if (!res.ok) throw new Error('Failed to fetch offline model performance');
  return res.json();
}

export async function fetchActiveAlerts(): Promise<{
  source: string;
  total_active_alerts: number;
  disclaimer: string;
  alerts: Alert[];
}> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch active alerts');
  return res.json();
}

export async function fetchNOAAMorphology(
  cycloneId: string
): Promise<{
  cyclone_id: string;
  basin: string;
  timestamp: string;
  noaa_adt_hursat: NOAAData;
  ai_structural_profile: AIStructuralProfile;
}> {
  const res = await fetch(`${API_BASE}/noaa/${encodeURIComponent(cycloneId)}`);
  if (!res.ok) throw new Error(`Failed to fetch NOAA structural data for ${cycloneId}`);
  return res.json();
}
