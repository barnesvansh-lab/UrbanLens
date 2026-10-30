export type DataStatus = 'real' | 'synthetic_test' | 'synthetic_demo' | 'unavailable';
export type GeographyLevel = 'city' | 'district' | 'neighborhood';
export type MetricName = 'hpi_assessment' | 'hpi_market' | 'amenity_count';

export interface ApiObservation {
  observation_date: string;
  geography_name: string;
  geography_level: GeographyLevel;
  metric_name: string;
  metric_value: number;
  unit: string;
  source_name: string;
  source_url: string;
  retrieved_at: string;
  data_status: DataStatus;
}

export interface ApiDataSource {
  id: string;
  name: string;
  url: string;
  description: string;
  metric_types: string[];
  geography_level: GeographyLevel;
  geographic_coverage: string[];
  temporal_coverage: { start: string; end: string } | null;
  frequency: string;
  unit: string;
  license: string;
  access_method: string;
  status: 'integrated' | 'investigated_only' | 'unavailable';
  limitations: string[];
  retrieved_at: string | null;
}

export interface ApiQualityReport {
  dataset_name: string;
  generated_at: string;
  raw_row_count: number;
  valid_row_count: number;
  rejected_row_count: number;
  duplicate_count: number;
  missing_value_counts: Record<string, number>;
  date_range: { min: string; max: string } | null;
  geographies: string[];
  metric_names: string[];
  warnings: string[];
  data_status: DataStatus;
}

export interface ApiAmenity {
  lat: number;
  lon: number;
  amenity_type: string;
  name: string;
  geography_name: string;
  retrieved_at: string;
  source_name: string;
  data_status: DataStatus;
}

export interface ApiSummary {
  total_observations: number;
  total_datasets: number;
  geographies: string[];
  metric_types: string[];
  date_coverage: { min: string | null; max: string | null };
  data_status_breakdown: Record<DataStatus, number>;
  last_ingestion_at: string | null;
}

export interface ApiHealthResponse {
  status: string;
  service: string;
  version: string;
  mode: string;
  data_available: boolean;
  timestamp: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

export type ForecastStatus = 'ok' | 'unavailable' | 'insufficient_data';

export interface ApiForecastPoint {
  date: string;
  point_forecast: number;
  lower_bound: number | null;
  upper_bound: number | null;
}

export interface ApiForecastEvaluation {
  model: { MAE: number; RMSE: number };
  baseline_naive_last: { MAE: number; RMSE: number };
  vs_baseline: { MAE_reduction_pct: number; RMSE_reduction_pct: number };
}

export interface ApiForecastResponse {
  status: ForecastStatus;
  geography: string;
  metric: string;
  unit: string;
  geography_level: string;
  data_status: string;
  source_names: string[];
  training_period: { start: string; end: string } | null;
  validation_period: { start: string; end: string } | null;
  n_training: number;
  n_validation: number;
  model_name: string;
  model_version: string;
  horizon: number;
  observations: ApiForecastPoint[];
  forecast: ApiForecastPoint[];
  evaluation: ApiForecastEvaluation | null;
  warnings: string[];
  limitations: string[];
  generated_at: string;
  reason?: string;
}

// ── Milestone 5 Types: Neighborhood & Transformation ──────────────────────────

export interface ApiRegionBbox {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
}

export interface ApiRegionCentroid {
  lat: number;
  lon: number;
}

export interface ApiNeighborhoodRegionSummary {
  id: string;
  name: string;
  description: string;
  centroid: ApiRegionCentroid;
  area_km2: number;
  total_amenities: number;
  amenity_density_per_km2: number;
  data_status: DataStatus;
}

export interface ApiNeighborhoodsResponse {
  generated_at: string;
  pipeline_version: string;
  geographic_scope: string;
  total_amenities_loaded: number;
  total_amenities_assigned: number;
  boundary_methodology: string;
  boundary_warning: string;
  data_status: DataStatus;
  osm_snapshot_date: string;
  limitations: string[];
  regions: ApiNeighborhoodRegionSummary[];
}

export interface ApiNeighborhoodRegionDetail {
  id: string;
  name: string;
  description: string;
  known_landmarks: string[];
  boundary_type: string;
  boundary_note: string;
  bbox: ApiRegionBbox;
  centroid: ApiRegionCentroid;
  area_km2: number;
  total_amenities: number;
  amenity_density_per_km2: number;
  amenity_categories: Record<string, number>;
  nearest_facility_km: Record<string, number>;
  within_500m_count: number;
  within_1km_count: number;
  data_status: DataStatus;
  data_source: string;
  osm_snapshot_date: string;
  limitations: string[];
}

export interface ApiNeighborhoodAnalyticsResponse {
  region: ApiNeighborhoodRegionDetail;
  context: {
    osm_snapshot_date: string | null;
    boundary_type: string;
    boundary_note: string;
    data_integrity_note: string;
  };
}

export interface ApiGeoJsonFeature {
  type: 'Feature';
  id: string;
  properties: {
    id: string;
    name: string;
    description: string;
    boundary_type: string;
    boundary_note: string;
    area_km2: number;
    total_amenities: number;
    amenity_density_per_km2: number;
    data_status: DataStatus;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface ApiBoundariesResponse {
  type: 'FeatureCollection';
  features: ApiGeoJsonFeature[];
  metadata: {
    status: string;
    boundary_type: string;
    boundary_warning?: string;
    osm_snapshot_date?: string;
    generated_at?: string;
    data_status?: DataStatus;
    reason?: string;
  };
}

export interface ApiNeighborhoodCompareResponse {
  requested_ids: string[];
  found_count: number;
  regions: ApiNeighborhoodRegionDetail[];
  comparison_note: string;
}

export interface ApiTransformationIndicator {
  id: string;
  name: string;
  category: string;
  geography_level: string;
  geography_name: string;
  data_status: DataStatus | 'unavailable';
  value: number | null;
  unit: string | null;
  display_value: string;
  source: string | null;
  coverage: string | null;
  methodology: string | null;
  unavailability_reason?: string;
  possible_proxy?: string | null;
  limitations: string[];
  interpretation: string | null;
}

export interface ApiHpiCityTrend {
  start_date: string;
  end_date: string;
  start_value: number;
  end_value: number;
  total_change_pct: number;
  five_year_change_pct: number;
  annualized_change_pct: number;
  n_observations: number;
  unit: string;
}

export interface ApiTransformationSummaryResponse {
  generated_at: string;
  geographic_scope: string;
  summary: {
    total_indicators: number;
    real_indicators: number;
    unavailable_indicators: number;
    notes: string;
  };
  data_integrity_statement: string;
  hpi_city_trend: ApiHpiCityTrend | null;
  indicator_categories: string[];
  real_indicator_count: number;
  unavailable_indicator_count: number;
}

export interface ApiTransformationIndicatorsResponse {
  total: number;
  filters_applied: {
    category: string | null;
    data_status: string | null;
  };
  summary: {
    total_indicators: number;
    real_indicators: number;
    unavailable_indicators: number;
    notes: string;
  } | null;
  data_integrity_statement: string | null;
  indicators: ApiTransformationIndicator[];
}


