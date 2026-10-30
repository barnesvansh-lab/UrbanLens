export type DataStatus = 'real' | 'synthetic_test' | 'unavailable';
export type GeographyLevel = 'city' | 'district' | 'neighborhood';
export type MetricName = 'hpi_assessment' | 'hpi_market' | 'amenity_count';

export interface DataObservation {
  observation_date: string;         // YYYY-MM-DD
  geography_name: string;
  geography_level: GeographyLevel;
  metric_name: MetricName | string;
  metric_value: number;
  unit: string;
  source_name: string;
  source_url: string;
  retrieved_at: string;
  data_status: DataStatus;
}

export interface DataSource {
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

export interface QualityReport {
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

export interface AmenityFeature {
  lat: number;
  lon: number;
  amenity_type: string;
  name: string;
  geography_name: string;
  retrieved_at: string;
  source_name: string;
  data_status: DataStatus;
}

export interface DataSummary {
  total_observations: number;
  total_datasets: number;
  geographies: string[];
  metric_types: string[];
  date_coverage: { min: string | null; max: string | null };
  data_status_breakdown: Record<DataStatus, number>;
  last_ingestion_at: string | null;
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

export interface SeriesQueryParams {
  geography?: string;
  metric?: string;
  start_date?: string;
  end_date?: string;
  limit?: string;
}

export interface AmenityQueryParams {
  geography?: string;
  amenity_type?: string;
}

export type ForecastStatus = 'ok' | 'unavailable' | 'insufficient_data';

export interface ForecastPoint {
  date: string;           // ISO YYYY-MM-DD
  point_forecast: number;
  lower_bound: number | null;
  upper_bound: number | null;
}

export interface ForecastEvaluation {
  model: { MAE: number; RMSE: number };
  baseline_naive_last: { MAE: number; RMSE: number };
  vs_baseline: { MAE_reduction_pct: number; RMSE_reduction_pct: number };
}

export interface ForecastResponse {
  status: ForecastStatus;
  geography: string;
  metric: string;
  unit: string;
  geography_level: string;
  data_status: string;           // "real" | "synthetic_test" | "synthetic_demo"
  source_names: string[];
  training_period: { start: string; end: string } | null;
  validation_period: { start: string; end: string } | null;
  n_training: number;
  n_validation: number;
  model_name: string;
  model_version: string;
  horizon: number;
  observations: ForecastPoint[];   // historical points used for training
  forecast: ForecastPoint[];       // future predictions
  evaluation: ForecastEvaluation | null;
  warnings: string[];
  limitations: string[];
  generated_at: string;
  reason?: string;   // human-readable explanation when status != "ok"
}

export interface ForecastQueryParams {
  geography?: string;
  metric?: string;
  horizon?: string;
  mode?: string;   // "demo" | "real"
}

// ── Milestone 5: Neighborhood Intelligence ────────────────────────────────────

export interface RegionBbox {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
}

export interface RegionCentroid {
  lat: number;
  lon: number;
}

export interface NeighborhoodRegion {
  id: string;
  name: string;
  description: string;
  known_landmarks: string[];
  boundary_type: string;
  boundary_note: string;
  bbox: RegionBbox;
  centroid: RegionCentroid;
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

export interface NeighborhoodAnalyticsPayload {
  generated_at: string;
  pipeline_version: string;
  source: string;
  osm_snapshot_date: string;
  geographic_scope: string;
  total_amenities_loaded: number;
  total_amenities_assigned: number;
  total_amenities_unassigned: number;
  boundary_methodology: string;
  boundary_warning: string;
  data_status: DataStatus;
  regions: NeighborhoodRegion[];
  limitations: string[];
}

export interface TransformationIndicator {
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

export interface HpiCityTrend {
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

export interface TransformationPayload {
  generated_at: string;
  pipeline_version: string;
  geographic_scope: string;
  summary: {
    total_indicators: number;
    real_indicators: number;
    unavailable_indicators: number;
    notes: string;
  };
  data_integrity_statement: string;
  hpi_city_trend: HpiCityTrend | null;
  indicators: TransformationIndicator[];
}


// ── Milestone 6: Advanced Urban Transformation Engine ─────────────────────────

export interface TrendPoint {
  date: string;
  value: number;
  qoq_change_pct: number | null;
  yoy_change_pct: number | null;
  acceleration: number | null;
  rolling_volatility_8q: number | null;
}

export interface TrendSummary {
  geography: string;
  geography_level: string;
  start_date: string;
  end_date: string;
  start_value: number;
  end_value: number;
  observation_count: number;
  total_cumulative_change_pct: number;
  annualized_cagr_pct: number;
  three_year_cagr_pct: number | null;
  five_year_cagr_pct: number | null;
  recent_annual_growth_pct: number;
  recent_market_regime: string;
  regime_label: string;
  mean_quarterly_volatility: number;
}

export interface TransformationTrendsPayload {
  status: string;
  summary: TrendSummary;
  points: TrendPoint[];
}

export interface TransformationAnomaly {
  id: string;
  date: string;
  indicator_name: string;
  observed_value: number;
  unit: string;
  hpi_level: number;
  method: string;
  z_score?: number | null;
  rolling_mean?: number;
  rolling_std?: number;
  iqr_lower?: number;
  iqr_upper?: number;
  direction: 'surge' | 'decline';
  severity: 'high' | 'moderate';
  threshold_used: string;
  description: string;
  caveat: string;
}

export interface TransformationAnomaliesPayload {
  status: string;
  summary: {
    total_anomalies_detected: number;
    surge_count: number;
    decline_count: number;
    iqr_bounds: {
      q1: number;
      median: number;
      q3: number;
      iqr: number;
      lower_bound: number;
      upper_bound: number;
    };
    methodologies_used: string[];
    interpretative_mandate: string;
  };
  anomalies: TransformationAnomaly[];
}

export interface TransformationPillar {
  pillar_id: string;
  name: string;
  sufficiency_status: 'SUFFICIENT_MACRO_EVIDENCE' | 'PARTIAL_STATIC_EVIDENCE' | 'INSUFFICIENT_EVIDENCE';
  confidence: 'High' | 'Medium' | 'Low' | 'None';
  geographic_level?: string;
  geographic_scope?: string;
  observation_period?: string | null;
  verified_indicators_count?: number;
  key_findings: string[];
  limitations: string[];
  supports_transformation_hypothesis: boolean;
  hypothesis_interpretation?: string;
}

export interface TransformationEvidencePayload {
  assessment_id: string;
  generated_at: string;
  geographic_scope: string;
  overall_verdict: string;
  verdict_badge: string;
  verdict_explanation: string;
  pillars_summary: {
    total_pillars: number;
    sufficient_macro_count: number;
    partial_static_count: number;
    insufficient_count: number;
  };
  pillars: TransformationPillar[];
  academic_mandate: string;
}

export interface TransformationQualityPayload {
  generated_at: string;
  pipeline_version: string;
  data_audit: {
    total_sources_evaluated: number;
    verified_real_sources: number;
    data_unavailable_sources: number;
    documented_proxy_sources: number;
    requires_validation_sources: number;
  };
  indicators_audit: {
    total_indicators: number;
    verified_real_count: number;
    data_unavailable_count: number;
    proxy_count: number;
  };
  data_integrity_rules: string[];
}

export interface TransformationOverviewPayload {
  generated_at: string;
  geographic_scope: string;
  hpi_summary: TrendSummary;
  indicators_summary: {
    total_indicators: number;
    verified_real_count: number;
    data_unavailable_count: number;
    proxy_count: number;
  };
  sources_summary: {
    total_sources_evaluated: number;
    verified_real_sources: number;
    data_unavailable_sources: number;
    documented_proxy_sources: number;
    requires_validation_sources: number;
  };
  evidence_summary: {
    overall_verdict: string;
    verdict_badge: string;
    verdict_explanation: string;
    pillars_count: number;
  };
  anomalies_summary: {
    total_anomalies_detected: number;
    surge_count: number;
    decline_count: number;
  };
}

export interface TransformationDataSourceItem {
  id: string;
  name: string;
  publishing_organization: string;
  source_url: string;
  geographic_coverage: string;
  geographic_level: string;
  temporal_coverage: { start: string; end: string } | null;
  observation_count: number;
  frequency: string;
  unit: string;
  data_format: string;
  license: string;
  reuse_restrictions: string;
  status: 'VERIFIED REAL DATA' | 'DOCUMENTED PROXY' | 'DATA UNAVAILABLE' | 'REQUIRES MANUAL VALIDATION';
  missing_values_count: number;
  reliability_limitations: string[];
  suitable_for_historical_analysis: boolean;
  integrated_in_pipeline: boolean;
}
