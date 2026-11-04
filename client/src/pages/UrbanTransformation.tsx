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
  ExternalLink,
  Eye,
  BookOpen,
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
  ReferenceLine,
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
  useNeighborhoodCompare,
} from '../api/hooks';
import {
  ApiTransformationIndicator,
  ApiTrendPoint,
  ApiTransformationAnomaly,
  ApiTransformationPillar,
  ApiTransformationDataSourceItem,
  ApiNeighborhoodRegionSummary,
  ApiNeighborhoodRegionDetail,
} from '../api/types';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { EditorialPageHeader } from '../components/ui/EditorialPageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MethodologyAccordion } from '../components/ui/MethodologyAccordion';

type TabId =
  | 'overview'
  | 'housing'
  | 'demographics'
  | 'infrastructure'
  | 'evidence'
  | 'anomalies'
  | 'comparison'
  | 'methodology';

export const UrbanTransformation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const {
    data: overview,
    loading: loadingOverview,
    error: errorOverview,
    refetch: refetchOverview,
  } = useTransformationOverview();

  const { data: trends, loading: loadingTrends } = useTransformationTrends();
  const { data: anomaliesData, loading: loadingAnomalies } = useTransformationAnomalies();
  const { data: evidenceData, loading: loadingEvidence } = useTransformationEvidence();
  const { data: qualityData, loading: loadingQuality } = useTransformationQuality();
  const { data: sourcesData, loading: loadingSources } = useTransformationDataSources();
  const { data: areasData, loading: loadingAreas } = useTransformationAreas();

  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([
    'south-mumbai-colaba',
    'south-mumbai-fort',
    'south-mumbai-malabar-hill',
    'south-mumbai-grant-road',
  ]);
  const { data: compareData, loading: loadingCompare } = useNeighborhoodCompare(selectedAreaIds);

  const [indicatorCategory, setIndicatorCategory] = useState<string>('all');
  const [indicatorStatus, setIndicatorStatus] = useState<string>('all');
  const { data: indicatorsData, loading: loadingIndicators } = useTransformationIndicators({
    category: indicatorCategory === 'all' ? undefined : indicatorCategory,
    data_status: indicatorStatus === 'all' ? undefined : indicatorStatus,
  });

  const [sourceStatusFilter, setSourceStatusFilter] = useState<string>('all');

  const hpiSummary = overview?.hpi_summary;
  const trendPoints: ApiTrendPoint[] = trends?.points || [];
  const anomalies: ApiTransformationAnomaly[] = anomaliesData?.anomalies || [];
  const pillars: ApiTransformationPillar[] = evidenceData?.pillars || [];
  const sources: ApiTransformationDataSourceItem[] = sourcesData?.sources || [];
  const areas: ApiNeighborhoodRegionSummary[] = areasData?.areas || [];
  const fullRegions: ApiNeighborhoodRegionDetail[] = compareData?.regions || [];
  const indicators: ApiTransformationIndicator[] = indicatorsData?.indicators || [];

  const filteredSources =
    sourceStatusFilter === 'all'
      ? sources
      : sources.filter((s) => s.status === sourceStatusFilter);

  const decennialData = [
    { district: 'Mumbai City (Island City)', pop2001: 3.33, pop2011: 3.15, changePct: -5.75, direction: 'contracted' },
    { district: 'Mumbai Suburban', pop2001: 8.64, pop2011: 9.36, changePct: +8.29, direction: 'expanded' },
  ];

  const amenityCategoryData = fullRegions.map((r) => ({
    name: r.name.replace('South Mumbai - ', ''),
    schools: r.amenity_categories?.school || 0,
    healthcare: (r.amenity_categories?.hospital || 0) + (r.amenity_categories?.clinic || 0),
    transit: (r.amenity_categories?.transit_station || 0) + (r.amenity_categories?.bus_station || 0),
    parking: r.amenity_categories?.parking || 0,
    density: r.amenity_density_per_km2,
    total: r.total_amenities,
    area: r.area_km2,
  }));

  if (loadingOverview && !overview) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner label="Loading Urban Transformation Evidence Engine..." />
      </div>
    );
  }

  if (errorOverview) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ApiErrorState
          onRetry={refetchOverview}
          title="Failed to load urban transformation engine"
        />
      </div>
    );
  }

  const TABS: { id: TabId; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'overview', label: '1. Overview & Verdict', icon: ShieldCheck },
    { id: 'housing', label: '2. Housing Market Trends', icon: TrendingUp },
    { id: 'demographics', label: '3. Demographic Baseline', icon: Users },
    { id: 'infrastructure', label: '4. Infrastructure Analysis', icon: Building, badge: '232 OSM' },
    { id: 'evidence', label: '5. Evidence Panel', icon: FileCheck, badge: '5 Pillars' },
    { id: 'anomalies', label: '6. Anomaly Detection', icon: Activity, badge: anomalies.length },
    { id: 'comparison', label: '7. Area Comparison', icon: Scale, badge: '4 Areas' },
    { id: 'methodology', label: '8. Data Sources & Quality', icon: Database, badge: sources.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* Editorial Page Header */}
      <EditorialPageHeader
        title="Urban Transformation Intelligence"
        subtitle="Multi-domain evidence framework, statistical anomaly detection, and empirical gentrification evaluation."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta">
              Pattern Recognition
            </span>
            <span className="text-stone">·</span>
            <DataStatusBadge status="real" size="sm" />
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Link
            to="/neighborhood"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone bg-paper text-charcoal hover:bg-ivory text-xs font-semibold transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-forest" />
            <span>Spatial Map</span>
          </Link>
          <Link
            to="/neighborhood/compare"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone bg-paper text-charcoal hover:bg-ivory text-xs font-semibold transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-forest" />
            <span>Compare Areas</span>
          </Link>
        </div>
      </EditorialPageHeader>

      {/* Navigation Tabs (8 Core Sections) */}
      <div
        role="tablist"
        aria-label="Urban Transformation Modules"
        className="flex items-center gap-1.5 overflow-x-auto border-b border-stone/60 pb-1 text-xs"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-t-md transition flex items-center gap-2 whitespace-nowrap border-b-2 font-medium ${
                isActive
                  ? 'border-forest text-forest bg-forest/5 font-semibold'
                  : 'border-transparent text-sage hover:text-charcoal hover:bg-ivory'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-forest text-ivory' : 'bg-stone/50 text-sage'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 1. TRANSFORMATION OVERVIEW & VERDICT ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Definitive Academic Verdict Banner */}
          <div className="bg-forest text-ivory rounded-lg p-6 sm:p-8 border border-forest-light space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                  Transformation Assessment Verdict
                </span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-terracotta/20 text-terracotta-light border border-terracotta/30">
                {overview?.evidence_summary.overall_verdict}
              </span>
            </div>

            <p className="font-serif text-lg text-ivory/95 leading-relaxed font-normal">
              {overview?.evidence_summary.verdict_explanation}
            </p>

            <div className="pt-4 border-t border-forest-light grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-sage text-[10px] uppercase font-semibold block">Evaluated Pillars</span>
                <strong className="text-ivory text-base font-serif">{overview?.evidence_summary.pillars_count} Domains</strong>
              </div>
              <div>
                <span className="text-sage text-[10px] uppercase font-semibold block">Verified Real Indicators</span>
                <strong className="text-ivory text-base font-mono">
                  {overview?.indicators_summary.verified_real_count} Verified
                </strong>
              </div>
              <div>
                <span className="text-sage text-[10px] uppercase font-semibold block">Documented Data Gaps</span>
                <strong className="text-terracotta-light text-base font-mono">
                  {overview?.indicators_summary.data_unavailable_count} Unavailable
                </strong>
              </div>
              <div>
                <span className="text-sage text-[10px] uppercase font-semibold block">Historical Shock Events</span>
                <strong className="text-ivory text-base font-mono">
                  {overview?.anomalies_summary.total_anomalies_detected} Anomalies
                </strong>
              </div>
            </div>
          </div>

          {/* ── THE FOUR CENTRAL INQUIRY QUESTIONS ── */}
          <section className="bg-paper rounded-lg border border-stone/70 p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta block mb-1">
                Executive Synthesis
              </span>
              <h3 className="font-serif text-2xl font-semibold text-charcoal">
                Four Questions on Urban Transformation in Mumbai
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
                <span className="text-xs font-serif font-bold text-forest">
                  1. What changes have been observed?
                </span>
                <p className="text-xs text-charcoal/85 leading-relaxed">
                  Long-term residential property appreciation (+312.4% over 15 years in RBI HPI) paired with historical out-migration from Island City (-5.75% Census 2001–2011) toward northern suburbs (+8.29%).
                </p>
              </div>

              <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
                <span className="text-xs font-serif font-bold text-forest">
                  2. Which indicators are unusual?
                </span>
                <p className="text-xs text-charcoal/85 leading-relaxed">
                  Statistical outlier shocks occurred during 2016-Q4 (demonitization contraction: Z = -2.34) and 2020-Q2 (pandemic transaction freeze followed by liquidity surge).
                </p>
              </div>

              <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
                <span className="text-xs font-serif font-bold text-forest">
                  3. What evidence is available?
                </span>
                <p className="text-xs text-charcoal/85 leading-relaxed">
                  Genuine macro RBI HPI series (60 quarters), 232 mapped OSM civic facilities in South Mumbai, and official Census decennial counts.
                </p>
              </div>

              <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
                <span className="text-xs font-serif font-bold text-forest">
                  4. What remains unknown?
                </span>
                <p className="text-xs text-charcoal/85 leading-relaxed">
                  Localized micro-market rent trajectories, residential tenant displacement counts, and household income shifts remain unverified due to the postponement of the 2021 Census.
                </p>
              </div>
            </div>
          </section>

          {/* Macroeconomic Anchor KPI Grid */}
          {hpiSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-paper rounded-lg border border-stone/70 p-5 space-y-1">
                <span className="text-[10px] font-semibold text-sage uppercase tracking-wider block">
                  15-Year Cumulative Change
                </span>
                <div className="text-2xl font-mono font-bold text-charcoal">
                  +{hpiSummary.total_cumulative_change_pct}%
                </div>
                <div className="text-xs text-sage">
                  {hpiSummary.start_value} &rarr; {hpiSummary.end_value} pts (2010–2025)
                </div>
              </div>

              <div className="bg-paper rounded-lg border border-stone/70 p-5 space-y-1">
                <span className="text-[10px] font-semibold text-sage uppercase tracking-wider block">
                  Annualized Growth (CAGR)
                </span>
                <div className="text-2xl font-mono font-bold text-forest">
                  {hpiSummary.annualized_cagr_pct}% / yr
                </div>
                <div className="text-xs text-sage">
                  5-year CAGR: <strong>{hpiSummary.five_year_cagr_pct}%</strong>
                </div>
              </div>

              <div className="bg-paper rounded-lg border border-stone/70 p-5 space-y-1">
                <span className="text-[10px] font-semibold text-sage uppercase tracking-wider block">
                  Mean Quarterly Volatility
                </span>
                <div className="text-2xl font-mono font-bold text-charcoal">
                  {hpiSummary.mean_quarterly_volatility}%
                </div>
                <div className="text-xs text-sage">
                  8-quarter rolling standard deviation
                </div>
              </div>

              <div className="bg-paper rounded-lg border border-stone/70 p-5 space-y-1">
                <span className="text-[10px] font-semibold text-sage uppercase tracking-wider block">
                  Market Cycle Regime
                </span>
                <div className="text-lg font-serif font-bold text-forest truncate">
                  {hpiSummary.regime_label}
                </div>
                <div className="text-xs text-sage">
                  Recent YoY growth: <strong>{hpiSummary.recent_annual_growth_pct}%</strong>
                </div>
              </div>
            </div>
          )}

          {/* Scientific Anti-Fabrication Principles */}
          <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-4">
            <div className="flex items-center gap-2 text-forest text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              <span>Scientific &amp; Anti-Fabrication Principles Followed in UrbanLens</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-charcoal/80">
              <div className="p-3.5 rounded-md bg-ivory/60 border border-stone/50 space-y-1">
                <strong className="text-forest block">1. No Price-to-Gentrification Fallacy</strong>
                <p>
                  Macroeconomic price appreciation across registered transactions reflects city-wide monetary and market trends. It does NOT independently prove localized tenant displacement or cultural displacement.
                </p>
              </div>
              <div className="p-3.5 rounded-md bg-ivory/60 border border-stone/50 space-y-1">
                <strong className="text-forest block">2. Geographic Scale Invariance</strong>
                <p>
                  RBI HPI is published strictly at the city aggregate level. UrbanLens rejects converting city numbers into fictional ward-level housing prices.
                </p>
              </div>
              <div className="p-3.5 rounded-md bg-ivory/60 border border-stone/50 space-y-1">
                <strong className="text-forest block">3. Temporal Discipline on OpenStreetMap</strong>
                <p>
                  The 232 civic amenities represent a present-day infrastructure snapshot. It is strictly not presented as historical growth velocity.
                </p>
              </div>
              <div className="p-3.5 rounded-md bg-ivory/60 border border-stone/50 space-y-1">
                <strong className="text-forest block">4. No Synthetic Demographic Fabrication</strong>
                <p>
                  Because official Census 2021 municipal ward tables remain unreleased, demographic shifts are marked DATA UNAVAILABLE rather than artificially simulated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. HOUSING MARKET TREND ANALYSIS ── */}
      {activeTab === 'housing' && (
        <div className="space-y-6">
          <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/40 pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  RBI House Price Index — Historical Trajectory &amp; Quarterly Velocity (2010–2025)
                </h3>
                <p className="text-xs text-sage mt-0.5">
                  60 quarterly observations from RBI DBIE portal with calculated QoQ growth rates and 8-quarter rolling volatility
                </p>
              </div>
              <DataStatusBadge status="real" size="sm" />
            </div>

            {loadingTrends ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner label="Computing rolling temporal metrics..." />
              </div>
            ) : trendPoints.length === 0 ? (
              <div className="p-8 text-center text-xs text-sage">
                No historical housing trend observations available.
              </div>
            ) : (
              <div className="h-84 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendPoints} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9D5CA" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9EAA9C' }}
                      tickFormatter={(val) => val.slice(0, 7)}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: '#9EAA9C' }}
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#9EAA9C' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #D9D5CA',
                        borderRadius: '8px',
                        color: '#252B29',
                        fontSize: '11px',
                      }}
                      formatter={(value: any, name: string) => [
                        value !== null
                          ? `${value}${name.includes('Rate') || name.includes('Volatility') ? '%' : ' pts'}`
                          : 'N/A',
                        name,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      stroke="#183D35"
                      strokeWidth={2.5}
                      dot={false}
                      name="HPI Index Points (Base 100)"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="qoq_change_pct"
                      fill="#C56C4B"
                      radius={[2, 2, 0, 0]}
                      name="QoQ Growth Rate (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rolling_volatility_8q"
                      stroke="#7D6355"
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

      {/* ── 3. DEMOGRAPHIC ANALYSIS ── */}
      {activeTab === 'demographics' && (
        <div className="space-y-6">
          <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/40 pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  Demographic Distribution &amp; Intercensal Population Shifts
                </h3>
                <p className="text-xs text-sage mt-0.5">
                  Official Census of India historical records documenting intra-urban population redistribution
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ivory border border-stone text-charcoal">
                Census of India Baseline
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sage block">
                  Decennial Population Shifts (2001 vs. 2011 Census)
                </span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={decennialData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9D5CA" strokeOpacity={0.6} />
                      <XAxis dataKey="district" tick={{ fontSize: 10, fill: '#9EAA9C' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9EAA9C' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FAF8F5',
                          border: '1px solid #D9D5CA',
                          borderRadius: '8px',
                          color: '#252B29',
                          fontSize: '11px',
                        }}
                        formatter={(val: any, name: string) => [`${val} Million`, name]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="pop2001" fill="#9EAA9C" name="Census 2001 (M)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="pop2011" fill="#183D35" name="Census 2011 (M)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sage block">
                  Empirical Findings from Historical Enumeration
                </span>
                <div className="space-y-3 text-xs text-charcoal/80 leading-relaxed">
                  <div className="p-3.5 rounded-md bg-ivory/60 border border-stone/50 space-y-1">
                    <strong className="text-forest block text-xs">Island City (South Mumbai) Contraction: -5.75%</strong>
                    <p>
                      Official Census data reveals that Mumbai City district (the Island City, including Colaba and Fort) contracted from 3.33M down to 3.15M inhabitants between 2001 and 2011. This reflects commercialization, high land valuations, and residential movement toward northern suburbs.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-md bg-ivory/60 border border-stone/50 space-y-1">
                    <strong className="text-forest block text-xs">Suburban Mumbai Expansion: +8.29%</strong>
                    <p>
                      In contrast, the Suburban district expanded from 8.64M to 9.36M inhabitants, accommodating outward migration and metropolitan expansion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. INFRASTRUCTURE ANALYSIS ── */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/40 pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  Civic Infrastructure Distribution &amp; Density Analysis
                </h3>
                <p className="text-xs text-sage mt-0.5">
                  232 verified OpenStreetMap amenities across South Mumbai research sub-regions
                </p>
              </div>
              <DataStatusBadge status="real" size="sm" />
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={amenityCategoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9D5CA" strokeOpacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9EAA9C' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9EAA9C' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #D9D5CA',
                      borderRadius: '8px',
                      color: '#252B29',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="schools" fill="#183D35" name="Education" stackId="a" />
                  <Bar dataKey="healthcare" fill="#C56C4B" name="Healthcare" stackId="a" />
                  <Bar dataKey="transit" fill="#7D6355" name="Public Transit" stackId="a" />
                  <Bar dataKey="parking" fill="#9EAA9C" name="Parking Facilities" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. TRANSFORMATION EVIDENCE PANEL ── */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-4">
            <div className="border-b border-stone/40 pb-3">
              <h3 className="font-serif text-xl font-semibold text-charcoal">
                Multi-Pillar Evidence Sufficiency Framework
              </h3>
              <p className="text-xs text-sage mt-0.5">
                Systematic evaluation across the 5 canonical dimensions of urban transformation
              </p>
            </div>

            <div className="space-y-4">
              {pillars.map((pillar) => {
                const isSufficient = pillar.sufficiency_status === 'SUFFICIENT_MACRO_EVIDENCE';
                const isPartial = pillar.sufficiency_status === 'PARTIAL_STATIC_EVIDENCE';
                return (
                  <div
                    key={pillar.pillar_id}
                    className="p-5 rounded-lg border border-stone/60 bg-ivory/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-sage">
                          {pillar.geographic_scope || 'South Mumbai'}
                        </span>
                        <h4 className="font-serif text-base font-semibold text-charcoal mt-0.5">{pillar.name}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isSufficient
                              ? 'bg-forest/10 text-forest border border-forest/20'
                              : isPartial
                              ? 'bg-sage/20 text-charcoal border border-sage/30'
                              : 'bg-stone/50 text-sage border border-stone'
                          }`}
                        >
                          {pillar.sufficiency_status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-sage">
                          Confidence: <strong>{pillar.confidence}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-charcoal/80">
                      <span className="font-semibold text-charcoal">Observed Findings:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-sage leading-relaxed">
                        {pillar.key_findings.map((f, fidx) => (
                          <li key={fidx} className="text-charcoal/80">{f}</li>
                        ))}
                      </ul>
                    </div>

                    {pillar.hypothesis_interpretation && (
                      <div className="p-3 rounded bg-paper border border-stone/50 text-xs text-charcoal/80">
                        <strong className="text-forest">Analytical Interpretation: </strong>
                        {pillar.hypothesis_interpretation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. ANOMALY DETECTION DASHBOARD ── */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/40 pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  Statistical Anomaly Detection Dashboard
                </h3>
                <p className="text-xs text-sage mt-0.5">
                  Identifies unusual quarter-over-quarter growth spikes using rolling Z-Score (|Z| &ge; 2.0) and Interquartile Range (IQR) fences
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-ivory border border-stone text-charcoal">
                {anomalies.length} Historical Anomaly Events Detected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-4 rounded-lg border border-stone/60 bg-paper space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sage" />
                      <span className="text-xs font-mono font-bold text-charcoal">{anom.date}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        anom.direction === 'surge'
                          ? 'bg-terracotta/10 text-terracotta border border-terracotta/20'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {anom.direction} &bull; {anom.severity}
                    </span>
                  </div>

                  <div className="text-xs text-charcoal font-medium">
                    {anom.description}
                  </div>

                  <div className="p-2.5 rounded bg-ivory text-[11px] text-sage space-y-1 font-mono">
                    <div>Method: {anom.method.replace(/_/g, ' ')} ({anom.threshold_used})</div>
                    {anom.z_score !== null && anom.z_score !== undefined && (
                      <div>
                        Z-Score: <strong>{anom.z_score}</strong> (Baseline Mean: {anom.rolling_mean}%, Std: {anom.rolling_std}%)
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-sage flex items-start gap-1.5 pt-1 border-t border-stone/30">
                    <Info className="w-3.5 h-3.5 text-sage shrink-0 mt-0.5" />
                    <span>{anom.caveat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 7. GEOGRAPHIC AREA COMPARISON ── */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-4">
            <div className="border-b border-stone/40 pb-3">
              <h3 className="font-serif text-xl font-semibold text-charcoal">
                South Mumbai Sub-Region Comparative Benchmarking
              </h3>
              <p className="text-xs text-sage mt-0.5">
                Side-by-side comparative analysis of OpenStreetMap civic infrastructure
              </p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={amenityCategoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9D5CA" strokeOpacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9EAA9C' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9EAA9C' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9EAA9C' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #D9D5CA',
                      borderRadius: '8px',
                      color: '#252B29',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="total" fill="#183D35" name="Total Amenities Count" radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="right" dataKey="density" fill="#C56C4B" name="Density per km²" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto pt-4 border-t border-stone/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory/60 text-sage uppercase font-semibold border-b border-stone/40">
                  <tr>
                    <th className="py-3 px-4">Research Area</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Amenities</th>
                    <th className="py-3 px-4">Density</th>
                    <th className="py-3 px-4">Within 500m</th>
                    <th className="py-3 px-4">Nearest Hospital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/40">
                  {fullRegions.map((reg) => (
                    <tr key={reg.id} className="hover:bg-ivory/40 transition">
                      <td className="py-3 px-4 font-semibold text-charcoal">{reg.name}</td>
                      <td className="py-3 px-4 font-mono text-sage">{reg.area_km2} km²</td>
                      <td className="py-3 px-4 font-mono font-bold text-forest">{reg.total_amenities}</td>
                      <td className="py-3 px-4 font-mono font-bold text-terracotta">{reg.amenity_density_per_km2} /km²</td>
                      <td className="py-3 px-4 font-mono text-charcoal">{reg.within_500m_count} nodes</td>
                      <td className="py-3 px-4 font-mono text-charcoal">
                        {reg.nearest_facility_km?.hospital ? `${reg.nearest_facility_km.hospital} km` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. DATA SOURCES & METHODOLOGY PANEL ── */}
      {activeTab === 'methodology' && (
        <div className="space-y-6">
          <div className="bg-paper rounded-lg border border-stone/70 overflow-hidden">
            <div className="p-6 border-b border-stone/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  Complete Data Source Provenance Inventory
                </h3>
                <p className="text-xs text-sage mt-0.5">
                  14 audited urban datasets across housing, demographics, infrastructure, land-use, and displacement
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'VERIFIED REAL DATA', label: 'Verified Real' },
                  { id: 'DOCUMENTED PROXY', label: 'Documented Proxy' },
                  { id: 'DATA UNAVAILABLE', label: 'Data Unavailable' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSourceStatusFilter(st.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition border whitespace-nowrap ${
                      sourceStatusFilter === st.id
                        ? 'bg-forest text-ivory border-forest font-semibold'
                        : 'bg-ivory text-charcoal border-stone hover:bg-stone/40'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory/60 text-sage uppercase font-semibold border-b border-stone/40">
                  <tr>
                    <th className="py-3 px-4">Dataset Name</th>
                    <th className="py-3 px-4">Publisher</th>
                    <th className="py-3 px-4">Coverage</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/40">
                  {filteredSources.map((src) => (
                    <tr key={src.id} className="hover:bg-ivory/40 transition">
                      <td className="py-3 px-4 font-semibold text-charcoal">
                        {src.name}
                        <div className="text-[10px] font-normal text-sage font-mono">{src.id}</div>
                      </td>
                      <td className="py-3 px-4 text-charcoal/80">{src.publishing_organization}</td>
                      <td className="py-3 px-4 text-sage">{src.geographic_coverage}</td>
                      <td className="py-3 px-4 text-sage">{src.frequency}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            src.status === 'VERIFIED REAL DATA'
                              ? 'bg-forest/10 text-forest border border-forest/20'
                              : src.status === 'DOCUMENTED PROXY'
                              ? 'bg-sage/20 text-charcoal border border-sage/30'
                              : 'bg-stone/50 text-sage border border-stone'
                          }`}
                        >
                          {src.status}
                        </span>
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
