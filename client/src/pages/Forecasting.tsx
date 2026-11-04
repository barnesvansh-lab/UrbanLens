import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Sparkles,
  Info,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { EditorialPageHeader } from '../components/ui/EditorialPageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MethodologyAccordion } from '../components/ui/MethodologyAccordion';
import { neighborhoods } from '../data/syntheticData';
import { useForecast } from '../api/hooks';

function formatMonthLabel(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} ${year}`;
    }
  }
  return dateStr;
}

const REAL_CITIES = [
  'All India',
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Kanpur',
  'Lucknow',
];

export const Forecasting: React.FC = () => {
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] =
    useState<string>('mumbai-central');
  const [selectedRealCity, setSelectedRealCity] = useState<string>('All India');
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [horizon] = useState<number>(12);

  const isRealMode = mode === 'real';
  const activeGeography = isRealMode ? selectedRealCity : selectedNeighborhoodId;

  const selectedNeighborhood =
    neighborhoods.find((n) => n.id === selectedNeighborhoodId) || neighborhoods[0];

  const { forecast, loading, error, refetch } = useForecast({
    geography: activeGeography,
    horizon,
    mode,
  });

  const chartData = useMemo(() => {
    if (!forecast || !forecast.observations || forecast.observations.length === 0) {
      return [];
    }

    const obs = forecast.observations.map((o) => ({
      month: formatMonthLabel(o.date),
      historical: o.point_forecast,
      predicted: null as number | null,
      lowerBound: null as number | null,
      upperBound: null as number | null,
    }));

    if (!forecast.forecast || forecast.forecast.length === 0) {
      return obs;
    }

    const lastObs = forecast.observations[forecast.observations.length - 1];
    const firstFc = forecast.forecast[0];

    const bridge = {
      month: formatMonthLabel(firstFc.date),
      historical: lastObs ? lastObs.point_forecast : null,
      predicted: firstFc.point_forecast,
      lowerBound: firstFc.lower_bound,
      upperBound: firstFc.upper_bound,
    };

    const remaining = forecast.forecast.slice(1).map((f) => ({
      month: formatMonthLabel(f.date),
      historical: null as number | null,
      predicted: f.point_forecast,
      lowerBound: f.lower_bound,
      upperBound: f.upper_bound,
    }));

    return [...obs, bridge, ...remaining];
  }, [forecast]);

  const latestHistoricalPrice = useMemo(() => {
    if (!forecast?.observations || forecast.observations.length === 0) return 0;
    return forecast.observations[forecast.observations.length - 1].point_forecast;
  }, [forecast]);

  const predicted6m = useMemo(() => {
    if (!forecast?.forecast || forecast.forecast.length === 0) return 0;
    const pt = forecast.forecast[5] || forecast.forecast[forecast.forecast.length - 1];
    return pt.point_forecast;
  }, [forecast]);

  const predicted12m = useMemo(() => {
    if (!forecast?.forecast || forecast.forecast.length === 0) return 0;
    const pt = forecast.forecast[11] || forecast.forecast[forecast.forecast.length - 1];
    return pt.point_forecast;
  }, [forecast]);

  const growth6m = useMemo(() => {
    if (latestHistoricalPrice <= 0) return '0.0';
    return (((predicted6m - latestHistoricalPrice) / latestHistoricalPrice) * 100).toFixed(1);
  }, [latestHistoricalPrice, predicted6m]);

  const projectedGrowth = useMemo(() => {
    if (latestHistoricalPrice <= 0) return '0.0';
    return (((predicted12m - latestHistoricalPrice) / latestHistoricalPrice) * 100).toFixed(1);
  }, [latestHistoricalPrice, predicted12m]);

  const ciWidthPct = useMemo(() => {
    if (!forecast?.forecast || forecast.forecast.length === 0) return '0.0';
    const first = forecast.forecast[0];
    if (first.lower_bound != null && first.upper_bound != null && first.point_forecast > 0) {
      const diff = first.upper_bound - first.lower_bound;
      return ((diff / (2 * first.point_forecast)) * 100).toFixed(1);
    }
    return '0.0';
  }, [forecast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <DemoNotice
        customMessage="Price projections are statistical simulations generated for analytical study. They do not constitute official financial appraisals or investment recommendations."
      />

      <EditorialPageHeader
        title="Price Forecasting &amp; Projections"
        subtitle="Forward econometric modeling, baseline evaluation, and statistical uncertainty intervals."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta">
              Forward Intelligence
            </span>
            <span className="text-stone">·</span>
            <DataStatusBadge
              status={
                forecast?.data_status ||
                (mode === 'real' ? 'unavailable' : 'synthetic_demo')
              }
              size="sm"
            />
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Link
            to="/market-trends"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone bg-paper text-charcoal hover:bg-ivory text-xs font-semibold transition-colors"
          >
            <span>&larr; View Historical Trends</span>
          </Link>
        </div>
      </EditorialPageHeader>

      {/* Control Bar */}
      <section className="bg-paper rounded-lg border border-stone/70 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-charcoal">Mode:</span>
          <div className="inline-flex p-1 bg-ivory rounded-md border border-stone text-xs">
            <button
              type="button"
              onClick={() => setMode('demo')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                mode === 'demo' ? 'bg-forest text-ivory font-semibold' : 'text-charcoal hover:bg-stone/40'
              }`}
            >
              Demo Sector Mode
            </button>
            <button
              type="button"
              onClick={() => setMode('real')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                mode === 'real' ? 'bg-forest text-ivory font-semibold' : 'text-charcoal hover:bg-stone/40'
              }`}
            >
              Empirical RBI Mode
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="geography-select" className="text-xs font-semibold text-charcoal">
            {isRealMode ? 'City (RBI HPI):' : 'Sector:'}
          </label>
          {isRealMode ? (
            <select
              id="geography-select"
              value={selectedRealCity}
              onChange={(e) => setSelectedRealCity(e.target.value)}
              className="text-xs font-semibold text-charcoal bg-ivory border border-stone rounded-md px-3 py-1.5 focus:border-forest"
            >
              {REAL_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c} (RBI HPI)
                </option>
              ))}
            </select>
          ) : (
            <select
              id="geography-select"
              value={selectedNeighborhoodId}
              onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
              className="text-xs font-semibold text-charcoal bg-ivory border border-stone rounded-md px-3 py-1.5 focus:border-forest"
            >
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} (₹{n.avgPrice.toLocaleString('en-IN')}/sq.ft)
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="bg-paper rounded-lg border border-stone/70 p-12">
          <LoadingSpinner size="lg" label="Computing statistical forecast and validation metrics..." />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <ApiErrorState
          onRetry={refetch}
          title="Forecasting Pipeline Communication Error"
        />
      )}

      {/* Unavailable State */}
      {!loading && !error && forecast && forecast.status !== 'ok' && (
        <div className="bg-paper rounded-lg border border-stone/70 p-8">
          <EmptyState
            icon={<AlertTriangle className="w-8 h-8 text-terracotta" />}
            title={
              mode === 'real'
                ? 'Empirical Forecast Unavailable for Selection'
                : 'Insufficient Observations for Forecasting'
            }
            message={
              forecast.reason ||
              'Real RBI series require a selected valid metropolitan center. Switch to Demo Mode to inspect synthetic forecasting algorithms.'
            }
            action={
              mode === 'real' ? (
                <button
                  type="button"
                  onClick={() => setMode('demo')}
                  className="px-4 py-2 bg-forest text-ivory rounded-md text-xs font-semibold hover:bg-forest/90"
                >
                  Switch to Demo Mode
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Main Content when status is ok */}
      {!loading && !error && forecast && forecast.status === 'ok' && (
        <>
          {/* Summary Metric Strip */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-paper rounded-lg border border-stone/70 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sage block">
                Latest Baseline Level
              </span>
              <div className="text-2xl font-serif font-bold text-charcoal mt-1">
                {isRealMode
                  ? `${latestHistoricalPrice.toFixed(1)} pts`
                  : `₹${latestHistoricalPrice.toLocaleString('en-IN')}`}
              </div>
              <span className="text-xs text-sage">
                {isRealMode ? 'RBI HPI (Base 100)' : 'Transacted average rate'}
              </span>
            </div>

            <div className="bg-paper rounded-lg border border-stone/70 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sage block">
                Projected 6 {isRealMode ? 'Quarters' : 'Months'}
              </span>
              <div className="text-2xl font-serif font-bold text-forest mt-1">
                {isRealMode
                  ? `${predicted6m.toFixed(1)} pts`
                  : `₹${predicted6m.toLocaleString('en-IN')}`}
              </div>
              <span className="text-xs text-forest font-medium">
                +{growth6m}% vs. baseline
              </span>
            </div>

            <div className="bg-paper rounded-lg border border-stone/70 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sage block">
                Projected 12 {isRealMode ? 'Quarters' : 'Months'}
              </span>
              <div className="text-2xl font-serif font-bold text-terracotta mt-1">
                {isRealMode
                  ? `${predicted12m.toFixed(1)} pts`
                  : `₹${predicted12m.toLocaleString('en-IN')}`}
              </div>
              <span className="text-xs text-terracotta font-medium">
                +{projectedGrowth}% Annualized
              </span>
            </div>

            <div className="bg-paper rounded-lg border border-stone/70 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sage block">
                Uncertainty Range
              </span>
              <div className="text-2xl font-serif font-bold text-charcoal mt-1">
                95% Level
              </div>
              <span className="text-xs text-sage">
                {ciWidthPct !== '0.0'
                  ? `Half-width ±${ciWidthPct}%`
                  : 'Empirical variance estimate'}
              </span>
            </div>
          </section>

          {/* Combined Chart */}
          <section className="bg-paper rounded-lg border border-stone/70 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone/40 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-sage block mb-0.5">
                  Forward Trajectory
                </span>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  Historical Observations vs. Projected Trajectory ({isRealMode ? selectedRealCity : selectedNeighborhood.name})
                </h3>
                <p className="text-xs text-sage mt-0.5">
                  Solid green line: Historical records | Dashed terracotta line: Projected path | Shaded: 95% Confidence range
                </p>
              </div>

              <span className="text-xs font-mono font-medium text-forest bg-forest/5 border border-forest/15 px-2.5 py-1 rounded-md self-start sm:self-auto">
                Model: {forecast.model_name.replace(/_/g, ' ').toUpperCase()} (v{forecast.model_version})
              </span>
            </div>

            <div className="h-96 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C56C4B" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#C56C4B" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9D5CA" strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="month" stroke="#9EAA9C" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#9EAA9C"
                    fontSize={11}
                    domain={['auto', 'auto']}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => isRealMode ? `${Math.round(v)}` : `₹${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      borderRadius: '8px',
                      border: '1px solid #D9D5CA',
                      color: '#252B29',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => {
                      if (val == null) return ['—', name];
                      const formatted = isRealMode
                        ? `${Number(val).toFixed(2)} pts`
                        : `₹${Number(val).toLocaleString('en-IN')}/sq.ft`;
                      return [formatted, name];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />

                  {/* 95% Confidence Interval Area */}
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="none"
                    fill="url(#ciGradient)"
                    name="95% Confidence Range"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="none"
                    fill="#FAF8F5"
                    name="Lower Bound Bound"
                    legendType="none"
                  />

                  {/* Historical observations line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    name="Historical Observations"
                    stroke="#183D35"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#183D35' }}
                  />

                  {/* Projected forecast line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="Point Projection"
                    stroke="#C56C4B"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#C56C4B' }}
                    activeDot={{ r: 6, fill: '#C56C4B' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Model Evaluation & Validation Details (Level 2 & 3 Accordions) */}
          <MethodologyAccordion title="Model Diagnostics & Out-of-Sample Evaluation Metrics" level={3}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-paper rounded border border-stone/50">
                  <span className="text-[10px] uppercase font-semibold text-sage block">Model Architecture</span>
                  <span className="font-mono text-sm font-semibold text-charcoal">{forecast.model_name}</span>
                </div>
                <div className="p-3 bg-paper rounded border border-stone/50">
                  <span className="text-[10px] uppercase font-semibold text-sage block">Training Window</span>
                  <span className="font-mono text-sm font-semibold text-charcoal">
                    {forecast.training_period?.start || '2010'} to {forecast.training_period?.end || '2024'}
                  </span>
                </div>
                <div className="p-3 bg-paper rounded border border-stone/50">
                  <span className="text-[10px] uppercase font-semibold text-sage block">Validation Window</span>
                  <span className="font-mono text-sm font-semibold text-charcoal">
                    {forecast.validation_period?.start || '2024'} to {forecast.validation_period?.end || '2025'}
                  </span>
                </div>
              </div>

              {forecast.evaluation && (
                <div className="pt-2 border-t border-stone/40">
                  <strong className="block text-forest text-xs mb-2">Out-of-Sample Error Comparison</strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-sage block">Model MAE:</span>
                      <span className="text-charcoal font-semibold">{forecast.evaluation.model?.MAE ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-sage block">Baseline MAE:</span>
                      <span className="text-charcoal font-semibold">{forecast.evaluation.baseline_naive_last?.MAE ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-sage block">Model RMSE:</span>
                      <span className="text-charcoal font-semibold">{forecast.evaluation.model?.RMSE ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-sage block">Baseline RMSE:</span>
                      <span className="text-charcoal font-semibold">{forecast.evaluation.baseline_naive_last?.RMSE ?? '—'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </MethodologyAccordion>
        </>
      )}
    </div>
  );
};
