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
  series_validation?: {
    hpi_completeness?: {
      total_records: number;
      valid_records: number;
      missing_records: number;
      completeness_ratio: number;
      completeness_pct: number;
      is_sufficient: boolean;
      verdict: string;
    };
    hpi_continuity?: {
      is_continuous: boolean;
      total_gaps: number;
      status: string;
    };
  };
  compatibility_audit?: {
    hpi_vs_osm?: {
      verdict: string;
      is_compatible: boolean;
      incompatibilities: string[];
      caveats: string[];
      recommendation: string;
    };
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

// ── Milestone 7: Housing Affordability Intelligence Engine ────────────────────

export interface AmortizationYearPoint {
  year: number;
  opening_balance: number;
  annual_emi: number;
  principal_paid: number;
  interest_paid: number;
  closing_balance: number;
  cumulative_principal: number;
  cumulative_interest: number;
  homeowner_equity: number;
}

export interface EmiCalculationRequest {
  property_price: number;
  down_payment_pct?: number;
  down_payment_amount?: number;
  annual_interest_rate: number;
  tenure_years: number;
  extra_monthly_payment?: number;
}

export interface EmiCalculationResult {
  property_price: number;
  down_payment: number;
  loan_principal: number;
  annual_interest_rate: number;
  monthly_interest_rate: number;
  tenure_years: number;
  tenure_months: number;
  monthly_emi: number;
  total_interest: number;
  total_payment: number;
  ltv_ratio: number;
  interest_to_principal_ratio: number;
  extra_monthly_payment: number;
  effective_tenure_months: number;
  interest_saved_by_prepayment: number;
  amortization_schedule: AmortizationYearPoint[];
  disclaimers: string[];
}

export interface UpfrontCostRequest {
  property_price: number;
  down_payment_pct?: number;
  down_payment_amount?: number;
  stamp_duty_pct?: number;
  registration_fee?: number;
  loan_processing_rate_pct?: number;
  loan_processing_cap?: number;
  legal_doc_fee?: number;
  brokerage_pct?: number;
  moving_expenses?: number;
  interiors_furnishing?: number;
  other_charges?: number;
}

export interface UpfrontCostResult {
  property_price: number;
  down_payment: number;
  stamp_duty: number;
  registration_fee: number;
  loan_processing_fee: number;
  legal_doc_fee: number;
  brokerage_fee: number;
  moving_expenses: number;
  interiors_furnishing: number;
  other_charges: number;
  total_statutory_charges: number;
  total_ancillary_costs: number;
  total_upfront_cash_required: number;
  down_payment_pct_of_price: number;
  ancillary_pct_of_price: number;
  total_cash_to_price_ratio_pct: number;
  disclaimers: string[];
}

export interface OwnershipCostRequest {
  monthly_emi: number;
  society_maintenance_monthly?: number;
  property_tax_annual?: number;
  home_insurance_annual?: number;
  utilities_monthly?: number;
  repairs_reserve_monthly?: number;
  other_recurring_monthly?: number;
  monthly_gross_income?: number;
}

export interface OwnershipCostResult {
  monthly_emi: number;
  monthly_maintenance: number;
  monthly_property_tax: number;
  monthly_insurance: number;
  monthly_utilities: number;
  monthly_repairs_reserve: number;
  monthly_other: number;
  total_monthly_non_emi_expenses: number;
  total_monthly_ownership_cost: number;
  total_annual_ownership_cost: number;
  emi_share_pct: number;
  non_emi_share_pct: number;
  housing_expense_to_income_ratio_pct: number | null;
  disclaimers: string[];
}

export interface RentVsBuyYearPoint {
  year: number;
  monthly_rent: number;
  monthly_buy_outflow: number;
  annual_rent_outflow: number;
  annual_buy_outflow: number;
  property_value: number;
  remaining_loan_balance: number;
  buyer_net_equity: number;
  renter_investment_portfolio: number;
  net_buy_advantage: number;
}

export interface RentVsBuyRequest {
  property_price: number;
  down_payment_pct?: number;
  annual_interest_rate?: number;
  loan_tenure_years?: number;
  initial_monthly_rent: number;
  annual_rent_increase_pct?: number;
  property_appreciation_pct?: number;
  maintenance_monthly?: number;
  property_tax_annual?: number;
  upfront_acquisition_cost_pct?: number;
  investment_return_pct?: number;
  analysis_period_years?: number;
  rental_deposit_months?: number;
}

export interface RentVsBuyResult {
  property_price: number;
  initial_capital_deployed: number;
  initial_rental_deposit: number;
  initial_renter_portfolio: number;
  analysis_period_years: number;
  terminal_property_value: number;
  terminal_loan_balance: number;
  buyer_terminal_wealth: number;
  renter_terminal_wealth: number;
  net_buy_advantage: number;
  break_even_year: number | null;
  verdict_summary: string;
  annual_trajectory: RentVsBuyYearPoint[];
  assumptions_used: {
    property_appreciation_pct: number;
    annual_rent_increase_pct: number;
    investment_return_pct: number;
    mortgage_interest_rate_pct: number;
  };
  disclaimers: string[];
}

export interface HouseholdAffordabilityRequest {
  monthly_gross_income: number;
  additional_monthly_income?: number;
  existing_loan_emis?: number;
  essential_monthly_expenses?: number;
  available_liquid_savings?: number;
  target_property_price?: number;
  annual_interest_rate?: number;
  loan_tenure_years?: number;
  target_down_payment_pct?: number;
  foir_guideline_pct?: number;
  ancillary_cost_buffer_pct?: number;
}

export interface HouseholdAffordabilityResult {
  total_monthly_income: number;
  existing_debt_obligations: number;
  current_foir_pct: number;
  disposable_surplus: number;
  foir_threshold_used_pct: number;
  max_allowable_housing_emi: number;
  projected_post_purchase_foir_pct: number;
  max_affordable_loan_principal: number;
  cash_constrained_property_budget: number | null;
  loan_constrained_property_budget: number;
  binding_max_property_budget: number;
  target_property_price: number | null;
  affordability_gap: number | null;
  is_affordable: boolean | null;
  actionable_recommendations: string[];
  disclaimers: string[];
}

export interface FinancialScenarioConfig {
  id: string;
  name: string;
  description: string;
  property_price: number;
  down_payment_pct: number;
  annual_interest_rate: number;
  loan_tenure_years: number;
  monthly_rent: number;
  rent_increase_pct: number;
  property_appreciation_pct: number;
  investment_return_pct: number;
  monthly_income: number;
  existing_emis: number;
}

export interface FinancialScenarioResultItem {
  id: string;
  name: string;
  description: string;
  property_price: number;
  monthly_emi: number;
  total_interest: number;
  total_upfront_cash: number;
  ten_year_buyer_equity: number;
  ten_year_renter_portfolio: number;
  ten_year_buy_advantage: number;
  foir_pct: number;
  affordability_verdict: string;
}

export interface ScenarioComparisonResult {
  comparison_horizon_years: number;
  scenarios: FinancialScenarioResultItem[];
  disclaimers: string[];
}

