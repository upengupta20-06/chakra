export interface CycloneSummary {
  cyclone_id: string;
  basin: string;
  observations_count: number;
  start_time: string;
  end_time: string;
  peak_vmax: number;
  current_vmax: number;
  current_latitude: number;
  current_longitude: number;
  current_mslp: number;
  current_r35: number;
  intensity_class: string;
  intensity_short: string;
  intensity_color: string;
  trend: string;
  is_ri: boolean;
  latest_image_index: number;
}

export interface MovementInfo {
  speed_kmh: number;
  speed_knots: number;
  bearing_degrees: number;
  cardinal_direction: string;
}

export interface CycloneHistoryPoint {
  time: string;
  latitude: number;
  longitude: number;
  vmax: number;
  mslp: number;
  r35: number;
  image_index: number;
  intensity_class: string;
}

export interface CycloneDetail {
  cyclone_id: string;
  basin: string;
  observations_count: number;
  start_time: string;
  end_time: string;
  current_time: string;
  current_latitude: number;
  current_longitude: number;
  current_vmax: number;
  current_mslp: number;
  current_r35: number;
  peak_vmax: number;
  min_mslp: number;
  intensity_class: string;
  intensity_short: string;
  intensity_color: string;
  severity: string;
  lifecycle_stage: string;
  lifecycle_desc: string;
  trend: string;
  is_ri: boolean;
  trend_desc: string;
  delta_vmax: number;
  movement: MovementInfo;
  sequence_image_indices: number[];
  history: CycloneHistoryPoint[];
}

export interface SatelliteChannel {
  code: string;
  name: string;
  image_url: string;
  min: number;
  max: number;
  mean: number;
  has_data: boolean;
}

export interface SatelliteFrame {
  image_index: number;
  timestep_label: string;
  channels: Record<string, SatelliteChannel>;
}

export interface PredictionResult {
  ai_vmax: number;
  vmax_unit: string;
  uncertainty_margin: number;
  estimated_range: [number, number];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  intensity_class: string;
  intensity_short: string;
  intensity_color: string;
  channels_used: Record<string, boolean>;
  active_channels_count: number;
  reference_vmax?: number;
  error_delta?: number;
  prediction_source: string;
  reference_source: string;
  model_available: boolean;
  message?: string;
}

export interface ForecastHorizon {
  vmax?: number;
  horizon: string;
  delta?: number;
  intensity_class?: string;
  confidence?: string;
  available?: boolean;
  message?: string;
}

export interface ForecastResult {
  cyclone_id: string;
  source: string;
  current: ForecastHorizon;
  plus_3h: ForecastHorizon;
  plus_6h: ForecastHorizon;
  plus_12h: { available: boolean; message: string };
  plus_24h: { available: boolean; message: string };
  overall_trend: string;
  rate_per_3h: number;
}

export interface ExplainabilityResult {
  cyclone_id: string;
  source: string;
  channel_contributions: {
    IR1: number;
    WV: number;
    VIS: number;
    PMW: number;
  };
  highest_contributor: string;
  overlay_image_url: string;
  spatial_focus: string;
  methodology: string;
  disclaimer: string;
}

export interface SimilarCyclone {
  cyclone_id: string;
  name: string;
  basin: string;
  year: number;
  peak_vmax: number;
  intensity_class: string;
  representation_similarity_pct: number;
  label: string;
}

export interface Alert {
  alert_id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  title: string;
  cyclone_id: string;
  basin: string;
  timestamp: string;
  current_vmax: number;
  reason: string;
  recommendation: string;
  badge: string;
}

export interface NOAAData {
  layer_connected: boolean;
  matched: boolean;
  source: string;
  message?: string;
  cyclone_id?: string;
  observation_time?: string;
  ci_number?: number;
  raw_t?: number;
  final_t?: number;
  eye_scene?: string;
  cloud_scene?: string;
  eye_size_km?: number;
  cloud_sym?: string;
  cdo_size_km?: number;
  rmw_km?: number;
  shear_kt?: number;
}

export interface AIStructuralProfile {
  source: string;
  eye_organization: string;
  estimated_eye_diameter: string;
  cloud_symmetry: string;
  convective_organization: string;
  central_dense_overcast: string;
  shear_influence: string;
  radius_of_maximum_wind: string;
  methodology: string;
}

export interface ModelPerformanceData {
  source: string;
  evaluation_samples: number;
  metrics: {
    mae: number;
    rmse: number;
    bias: number;
    r2: number;
    pearson_corr: number;
    within_5kt_pct: number;
    within_10kt_pct: number;
    within_15kt_pct: number;
    within_20kt_pct: number;
    exact_class_accuracy_pct: number;
    within_1class_accuracy_pct: number;
  };
  scatter_data: Array<{
    sample: number;
    actual: number;
    predicted: number;
    error: number;
  }>;
  residual_distribution: Array<{
    bin: string;
    count: number;
    midpoint: number;
  }>;
  mae_by_intensity: Array<{
    category: string;
    mae: number;
    count: number;
  }>;
  confusion_matrix: {
    classes: string[];
    matrix: number[][];
  };
  performance_by_basin: Array<{
    basin: string;
    basin_name: string;
    samples: number;
    mae: number;
    rmse: number;
  }>;
  sensor_degradation: Array<{
    channels: string;
    mae: number;
    rmse: number;
    confidence: string;
  }>;
}
