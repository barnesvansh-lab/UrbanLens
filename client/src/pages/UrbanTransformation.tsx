import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  TrendingUp,
  MapPin,
  Building,
  Users,
  Compass,
  ArrowRight,
  Filter,
  Activity,
  AlertCircle,
  FileCheck,
  FileX,
  Layers,
  Scale,
  Database,
  BarChart2,
  Calendar,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import {
  useTransformationOverview,
  useTransformationTrends,
  useTransformationAnomalies,
  useTransformationEvidence,
  useTransformationQuality,
  useTransformationDataSources,
  useTransformationAreas,
  useTransformationIndicators,
} from '../api/hooks';
import {
  ApiTransformationIndicator,
  ApiTrendPoint,
  ApiTransformationAnomaly,
  ApiTransformationPillar,
  ApiTransformationDataSourceItem,
  ApiNeighborhoodRegionSummary,
} from '../api/types';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ApiErrorState } from '../components/ui/ApiErrorState';

export const UrbanTransformation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'trends' | 'anomalies' | 'evidence' | 'indicators' | 'areas' | 'sources'
  >('overview');

  // Query Hooks
  const { data: overview, loading: loadingOverview, error: errorOverview, refetch: refetchOverview } =
    useTransformationOverview();
  const { data: trends, loading: loadingTrends } = useTransformationTrends();
  const { data: anomaliesData, loading: loadingAnomalies } = useTransformationAnomalies();
  const { data: evidenceData, loading: loadingEvidence } = useTransformationEvidence();
  const { data: qualityData, loading: loadingQuality } = useTransformationQuality();
  const { data: sourcesData, loading: loadingSources } = useTransformationDataSources();
  const { data: areasData, loading: loadingAreas } = useTransformationAreas();

  // Indicator filters (for indicators sub-view)
  const [indicatorCategory, setIndicatorCategory] = useState<string>('all');
  const [indicatorStatus, setIndicatorStatus] = useState<string>('all');
  const { data: indicatorsData, loading: loadingIndicators } = useTransformationIndicators({
    category: indicatorCategory === 'all' ? undefined : indicatorCategory,
    data_status: indicatorStatus === 'all' ? undefined : indicatorStatus,
  });

  const hpiSummary = overview?.hpi_summary;
  const trendPoints: ApiTrendPoint[] = trends?.points || [];
  const anomalies: ApiTransformationAnomaly[] = anomaliesData?.anomalies || [];
  const pillars: ApiTransformationPillar[] = evidenceData?.pillars || [];
  const sources: ApiTransformationDataSourceItem[] = sourcesData?.sources || [];
  const areas: ApiNeighborhoodRegionSummary[] = areasData?.areas || [];
  const indicators: ApiTransformationIndicator[] = indicatorsData?.indicators || [];

  if (loadingOverview && !overview) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner label="Loading Urban Transformation Analysis Engine..." />
      </div>
    );
  }

  if (errorOverview) {
    return (
      <ApiErrorState
        error={errorOverview}
        onRetry={refetchOverview}
        title="Failed to load urban transformation engine"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Urban Transformation & Gentrification Analysis Engine</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
              Milestone 6 Advanced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empirical multi-domain framework investigating housing market acceleration, infrastructure clustering, and data availability limits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/neighborhood"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Spatial Amenity Map</span>
          </Link>
          <Link
            to="/neighborhood/compare"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs transition"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>Area Comparison</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-1 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview & Verdict', icon: ShieldCheck },
          { id: 'trends', label: 'Housing Trends & Volatility', icon: TrendingUp },
          { id: 'anomalies', label: 'Anomaly Detection', icon: Activity, badge: anomalies.length },
          { id: 'evidence', label: 'Evidence Synthesis', icon: FileCheck },
          { id: 'indicators', label: 'Indicator Registry', icon: BarChart2, badge: indicators.length },
          { id: 'areas', label: 'Sub-Region Benchmarks', icon: Layers },
          { id: 'sources', label: 'Data Sources & Quality', icon: Database, badge: sources.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & VERDICT ────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Definitive Academic Verdict Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Transformation Assessment Verdict
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {overview?.evidence_summary.overall_verdict}
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {overview?.evidence_summary.verdict_explanation}
            </p>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 text-[11px] block">Evaluated Pillars</span>
                <strong className="text-white text-base">{overview?.evidence_summary.pillars_count} Domains</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Verified Real Indicators</span>
                <strong className="text-emerald-400 text-base">{overview?.indicators_summary.verified_real_count} Indicators</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Honest Data Gaps</span>
                <strong className="text-amber-400 text-base">{overview?.indicators_summary.data_unavailable_count} Unavailable</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Detected Growth Anomalies</span>
                <strong className="text-sky-400 text-base">{overview?.anomalies_summary.total_anomalies_detected} Historical Spikes</strong>
              </div>
            </div>
          </div>

          {/* Macroeconomic Anchor KPI Grid */}
          {hpiSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  15-Year Cumulative Change
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  +{hpiSummary.total_cumulative_change_pct}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {hpiSummary.start_value} &rarr; {hpiSummary.end_value} index points (2010–2025)
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Annualized Growth (CAGR)
                </span>
                <div className="text-2xl font-bold text-indigo-600">
                  {hpiSummary.annualized_cagr_pct}% / yr
                </div>
                <div className="text-[11px] text-slate-500">
                  5-year CAGR: <strong>{hpiSummary.five_year_cagr_pct}%</strong>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Mean Quarterly Volatility
                </span>
                <div className="text-2xl font-bold text-slate-800">
                  {hpiSummary.mean_quarterly_volatility}%
                </div>
                <div className="text-[11px] text-slate-500">
                  8-quarter rolling sample standard deviation
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Market Cycle Regime
                </span>
                <div className="text-base font-bold text-emerald-600 truncate">
                  {hpiSummary.regime_label}
                </div>
                <div className="text-[11px] text-slate-500">
                  Recent YoY growth: <strong>{hpiSummary.recent_annual_growth_pct}%</strong>
                </div>
              </div>
            </div>
          )}

          {/* Academic Integrity Mandate Box */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Anti-Fabrication & Scientific Principles Followed in UrbanLens</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <strong className="text-slate-800 block">1. No Price-to-Gentrification Fallacy</strong>
                <p>
                  Macroeconomic price appreciation in transaction registrations reflects city-wide monetary dynamics.
                  It does not prove localized tenant displacement or cultural displacement.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <strong className="text-slate-800 block">2. Geographic Level Consistency</strong>
                <p>
                  RBI HPI is published strictly at the city aggregate level. UrbanLens rejects converting city numbers
                  into fictional ward-level housing prices.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <strong className="text-slate-800 block">3. Temporal Discipline on OpenStreetMap</strong>
                <p>
                  The 232 civic amenities represent a present-day infrastructure snapshot ({overview?.generated_at.slice(0, 10)}).
                  It is not presented as historical growth.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <strong className="text-slate-800 block">4. No Synthetic Demographic Fabrication</strong>
                <p>
                  Because official Census 2021 municipal ward data is unreleased, demographic indicators are marked
                  DATA UNAVAILABLE rather than artificially simulated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: HOUSING TRENDS & VOLATILITY ─────────────────────────────────── */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  RBI House Price Index — Historical Trajectory & Quarterly Velocity (2010–2025)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  60 quarterly observations from RBI DBIE portal with calculated QoQ growth rates and 8-quarter rolling volatility
                </p>
              </div>
              <DataStatusBadge status="real" size="sm" />
            </div>

            {loadingTrends ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner label="Computing rolling temporal metrics..." />
              </div>
            ) : (
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendPoints} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(val) => val.slice(0, 7)}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      domain={['auto', 'auto']}
                      label={{ value: 'HPI Index Points', angle: -90, position: 'insideLeft', fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Growth & Volatility (%)', angle: 90, position: 'insideRight', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                      formatter={(value: any, name: string) => [
                        value !== null ? `${value}${name.includes('Rate') || name.includes('Volatility') ? '%' : ' pts'}` : 'N/A',
                        name,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={false}
                      name="HPI Index Points (Base 100)"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="qoq_change_pct"
                      fill="#06b6d4"
                      radius={[2, 2, 0, 0]}
                      name="QoQ Growth Rate (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rolling_volatility_8q"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      name="8Q Rolling Volatility (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ANOMALY DETECTION EXPLORER ─────────────────────────────────── */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>Statistical Anomaly Detection Explorer</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identifies unusual quarter-over-quarter growth spikes using rolling Z-Score (|Z| &ge; 2.0) and Interquartile Range (IQR) fence thresholds
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {anomalies.length} Historical Anomaly Events Detected
              </span>
            </div>

            {loadingAnomalies ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner label="Evaluating statistical outlier thresholds..." />
              </div>
            ) : anomalies.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No statistical anomalies detected in historical observations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition shadow-2xs bg-white space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800">{anom.date}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          anom.direction === 'surge'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {anom.direction} &bull; {anom.severity}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      {anom.description}
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600 space-y-1 font-mono">
                      <div>Method: {anom.method.replace(/_/g, ' ')} ({anom.threshold_used})</div>
                      {anom.z_score !== null && anom.z_score !== undefined && (
                        <div>Z-Score: <strong>{anom.z_score}</strong> (Baseline Mean: {anom.rolling_mean}%, Std: {anom.rolling_std}%)</div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-start gap-1.5 pt-1 border-t border-slate-100">
                      <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span>{anom.caveat}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: EVIDENCE SYNTHESIS PANEL ───────────────────────────────────── */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <span>Multi-Pillar Evidence Sufficiency Framework</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Systematic evaluation across the 5 canonical dimensions of urban transformation
              </p>
            </div>

            {loadingEvidence ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner label="Synthesizing multi-indicator evidence..." />
              </div>
            ) : (
              <div className="space-y-4">
                {pillars.map((pillar) => {
                  const isSufficient = pillar.sufficiency_status === 'SUFFICIENT_MACRO_EVIDENCE';
                  const isPartial = pillar.sufficiency_status === 'PARTIAL_STATIC_EVIDENCE';
                  return (
                    <div
                      key={pillar.pillar_id}
                      className={`p-5 rounded-xl border transition space-y-3 ${
                        isSufficient
                          ? 'border-indigo-200 bg-indigo-50/10'
                          : isPartial
                          ? 'border-sky-200 bg-sky-50/10'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {pillar.geographic_scope || 'South Mumbai'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{pillar.name}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isSufficient
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isPartial
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {pillar.sufficiency_status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            Confidence: <strong>{pillar.confidence}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Key Findings */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700">Observed Findings:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600">
                          {pillar.key_findings.map((f, fidx) => (
                            <li key={fidx}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Scientific Interpretation */}
                      {pillar.hypothesis_interpretation && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                          <strong className="text-slate-800">Analytical Interpretation: </strong>
                          {pillar.hypothesis_interpretation}
                        </div>
                      )}

                      {/* Limitations */}
                      {pillar.limitations && pillar.limitations.length > 0 && (
                        <div className="text-[11px] text-slate-400">
                          <strong>Limitations: </strong>
                          {pillar.limitations.join(' ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: INDICATORS REGISTRY ────────────────────────────────────────── */}
      {activeTab === 'indicators' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Filter Registered Indicators:
              </span>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'real', label: 'Verified Real' },
                  { id: 'unavailable', label: 'Data Unavailable' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndicatorStatus(s.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition border ${
                      indicatorStatus === s.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'housing_market', label: 'Housing Market' },
                { id: 'demographics', label: 'Demographics' },
                { id: 'infrastructure', label: 'Infrastructure' },
                { id: 'accessibility', label: 'Accessibility' },
                { id: 'land_use_construction', label: 'Land-Use & Redevelopment' },
                { id: 'affordability_displacement', label: 'Affordability & Displacement' },
                { id: 'socioeconomic', label: 'Socioeconomic' },
                { id: 'environment', label: 'Environment' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setIndicatorCategory(c.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border ${
                    indicatorCategory === c.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indicators List */}
          <div className="space-y-3">
            {loadingIndicators ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner label="Filtering transformation indicators..." />
              </div>
            ) : (
              indicators.map((ind) => {
                const isReal = ind.data_status === 'real' || (ind as any).status_label === 'VERIFIED REAL DATA';
                return (
                  <div
                    key={ind.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs space-y-2.5 ${
                      isReal ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {ind.category.replace(/_/g, ' ')} &bull; {ind.geography_level} level
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{ind.name}</h4>
                      </div>
                      <DataStatusBadge status={ind.data_status} size="sm" />
                    </div>

                    {isReal ? (
                      <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-emerald-800">Observed Metric:</span>
                          <div className="text-base font-bold text-emerald-950 mt-0.5">{ind.display_value}</div>
                        </div>
                        <div className="text-right text-[10px] text-emerald-700">
                          <div>Source: {ind.source || (ind as any).source_name}</div>
                          <div>Period: {ind.observation_period}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 space-y-1 text-xs">
                        <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Data Unavailable from Open Official Sources</span>
                        </div>
                        <p className="text-amber-900/90 leading-relaxed">{ind.unavailability_reason}</p>
                        {ind.possible_proxy && (
                          <div className="text-[11px] text-amber-800/80 pt-1 border-t border-amber-200/40">
                            <strong>Potential Proxy / Future Work:</strong> {ind.possible_proxy}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: SUB-REGION BENCHMARKS ──────────────────────────────────────── */}
      {activeTab === 'areas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>South Mumbai Sub-Region Civic Benchmarks</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified OpenStreetMap civic infrastructure features mapped to research bounding-box extents
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {areas.map((area) => (
                <div
                  key={area.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Research Sub-Region
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{area.name}</h4>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">{area.description}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amenity Density:</span>
                      <strong className="text-indigo-600">{area.amenity_density_per_km2} /km²</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Amenities:</span>
                      <strong className="text-slate-800">{area.total_amenities}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Approx. Area:</span>
                      <strong className="font-mono text-slate-700">{area.area_km2} km²</strong>
                    </div>
                  </div>

                  <Link
                    to={`/neighborhood?focus=${area.id}`}
                    className="block text-center text-xs font-semibold py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                  >
                    View on Map &rarr;
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Methodology Disclosure:</strong> Sub-regions are established as approximate research extents from landmark reference points.
                They are NOT certified administrative MCGM wards. Single point-in-time OpenStreetMap snapshot.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: DATA SOURCES & QUALITY ─────────────────────────────────────── */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <span>Data Source Audit & Availability Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive inventory of all investigated Indian datasets, licensing restrictions, and empirical status
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Dataset Name</th>
                    <th className="py-3 px-4">Publisher</th>
                    <th className="py-3 px-4">Coverage</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Limitations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sources.map((src) => (
                    <tr key={src.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {src.name}
                        <div className="text-[10px] font-normal text-slate-400 font-mono mt-0.5">{src.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{src.publishing_organization}</td>
                      <td className="py-3 px-4 text-slate-600">{src.geographic_coverage}</td>
                      <td className="py-3 px-4 text-slate-600">{src.frequency}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            src.status === 'VERIFIED REAL DATA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : src.status === 'DOCUMENTED PROXY'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : src.status === 'REQUIRES MANUAL VALIDATION'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {src.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs">
                        {src.reliability_limitations && src.reliability_limitations.length > 0
                          ? src.reliability_limitations[0]
                          : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
