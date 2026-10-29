import React, { useState, useMemo } from 'react';
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
  BrainCircuit,
  Sparkles,
  Info,
  ShieldAlert,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { EmptyState } from '../components/ui/EmptyState';
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

export const Forecasting: React.FC = () => {
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] =
    useState<string>('mumbai-central');
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [horizon] = useState<number>(12);

  const selectedNeighborhood =
    neighborhoods.find((n) => n.id === selectedNeighborhoodId) || neighborhoods[0];

  const { forecast, loading, error, refetch } = useForecast({
    geography: selectedNeighborhoodId,
    horizon,
    mode,
  });

  // Chart data transformation: observations + bridge + forecast
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

  // Derived KPI metrics
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
    <div className="space-y-6">
      {/* Heavy Warning Notice */}
      <DemoNotice
        customMessage="⚠️ CRITICAL DISCLAIMER: Price projections shown are synthetic simulations produced by a statistical forecasting engine. Under no circumstances should this be utilized for actual capital allocation, financial underwriting, or commercial appraisal."
        dismissible={false}
      />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
              <span>Forward Price Projections & Model Evaluation</span>
            </h2>
            <DataStatusBadge
              status={
                forecast?.data_status ||
                (mode === 'real' ? 'unavailable' : 'synthetic_demo')
              }
              size="sm"
            />
          </div>
          <p className="text-xs text-slate-500">
            Automated baseline comparison, out-of-sample validation, and 95% confidence intervals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('demo')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                mode === 'demo'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo Mode
            </button>
            <button
              type="button"
              onClick={() => setMode('real')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                mode === 'real'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Real Data Mode
            </button>
          </div>

          {/* Sector Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="neighborhood-select"
              className="text-xs font-semibold text-slate-600 whitespace-nowrap"
            >
              Sector:
            </label>
            <select
              id="neighborhood-select"
              value={selectedNeighborhoodId}
              onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} (₹{n.avgPrice.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12">
          <LoadingSpinner
            size="lg"
            label="Executing forecasting engine and out-of-sample validation..."
          />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <ApiErrorState
          error={error}
          onRetry={refetch}
          title="Forecasting Pipeline Communication Error"
        />
      )}

      {/* Unavailable / Insufficient Data State */}
      {!loading && !error && forecast && forecast.status !== 'ok' && (
        <EmptyState
          icon={AlertTriangle}
          title={
            mode === 'real'
              ? 'Real-Market Forecasting Unavailable'
              : 'Data Insufficient for Forecasting'
          }
          description={
            forecast.reason ||
            'Real-world RBI/NHB quarterly series have not yet been ingested into the verified database. Switch to Demo Mode to explore the algorithmic pipeline.'
          }
          action={
            mode === 'real'
              ? {
                  label: 'Switch to Demo Mode',
                  onClick: () => setMode('demo'),
                }
              : undefined
          }
        />
      )}

      {/* Main Content when status is ok */}
      {!loading && !error && forecast && forecast.status === 'ok' && (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Latest Baseline (Dec 2024)
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₹{latestHistoricalPrice.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-slate-400">Transacted average rate</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Projected in 6 Months (Jun 2025)
              </span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                ₹{predicted6m.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-emerald-600 font-medium">
                +{growth6m}% vs. baseline
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Projected in 12 Months (Dec 2025)
              </span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                ₹{predicted12m.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-emerald-600 font-medium">
                +{projectedGrowth}% Annualized
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Confidence Interval Band
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                95% Level
              </div>
              <span className="text-xs text-slate-500">
                {ciWidthPct !== '0.0'
                  ? `Half-width ±${ciWidthPct}%`
                  : 'Gaussian residual std estimation'}
              </span>
            </div>
          </div>

          {/* Combined Historical + Forecast Chart */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Trajectory & Forecast Horizon ({selectedNeighborhood.name})
                </h3>
                <p className="text-xs text-slate-500">
                  Solid line: Historical monthly rates | Dashed line: Point forecast estimates | Shaded: 95% Confidence range
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Model: {forecast.model_name.replace(/_/g, ' ').toUpperCase()} (v{forecast.model_version})
                  </span>
                </span>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val: string) => {
                      if (val.startsWith('Jan') || val.startsWith('Jul')) return val;
                      return '';
                    }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val: number) => `₹${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => {
                      if (val === null || val === undefined) return [null, null];
                      const labels: Record<string, string> = {
                        historical: 'Historical Rate',
                        predicted: 'Forecasted Rate',
                        lowerBound: 'Lower 95% CI',
                        upperBound: 'Upper 95% CI',
                      };
                      return [
                        `₹${Number(val).toLocaleString('en-IN')}/sq.ft`,
                        labels[name] || name,
                      ];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

                  {/* Shaded Confidence Band */}
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    name="Confidence Band"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="transparent"
                    fill="#ffffff"
                    name="CI Lower Base"
                  />

                  {/* Historical Line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={false}
                    name="Historical Rate"
                  />

                  {/* Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#6366f1' }}
                    name="Point Forecast"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Evaluation & Performance Table */}
          {forecast.evaluation && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-semibold text-slate-800">
                    Model Evaluation & Out-of-Sample Benchmark
                  </h3>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Split: 80% Train ({forecast.n_training} obs) / 20% Val ({forecast.n_validation} obs)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Evaluation Metric</th>
                      <th className="py-2.5 px-4">
                        Selected Model ({forecast.model_name})
                      </th>
                      <th className="py-2.5 px-4">
                        Baseline (naive_last_value)
                      </th>
                      <th className="py-2.5 px-4">Performance vs. Baseline</th>
                      <th className="py-2.5 px-4">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        Mean Absolute Error (MAE)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-indigo-600">
                        ₹{forecast.evaluation.model.MAE.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        ₹{forecast.evaluation.baseline_naive_last.MAE.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4">
                        {forecast.evaluation.vs_baseline.MAE_reduction_pct > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            +{forecast.evaluation.vs_baseline.MAE_reduction_pct}% reduction
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {forecast.evaluation.vs_baseline.MAE_reduction_pct}%
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {forecast.evaluation.vs_baseline.MAE_reduction_pct > 0
                          ? 'Beats naive last-value persistence on hold-out data'
                          : 'Parity with last-observation persistence'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        Root Mean Squared Error (RMSE)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-indigo-600">
                        ₹{forecast.evaluation.model.RMSE.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        ₹{forecast.evaluation.baseline_naive_last.RMSE.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4">
                        {forecast.evaluation.vs_baseline.RMSE_reduction_pct > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            +{forecast.evaluation.vs_baseline.RMSE_reduction_pct}% reduction
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {forecast.evaluation.vs_baseline.RMSE_reduction_pct}%
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        Penalizes larger outliers more heavily in validation window
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Training and Validation Periods Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Training Horizon:
                  </span>
                  <span>
                    {forecast.training_period?.start} to {forecast.training_period?.end} ({forecast.n_training} monthly points)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Hold-out Validation Horizon:
                  </span>
                  <span>
                    {forecast.validation_period?.start} to {forecast.validation_period?.end} ({forecast.n_validation} monthly points)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warnings & Methodological Limitations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Architecture & Specification */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Forecasting Pipeline & Methodological Limitations</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                System assumptions and documented boundary constraints
              </p>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">
                    Model Specification:
                  </span>
                  <span>
                    Active model: <strong className="font-mono text-indigo-700">{forecast.model_name}</strong> (v{forecast.model_version}).
                    Forecast horizon: {forecast.horizon} periods forward.
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">
                    API Documented Limitations:
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {forecast.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>

                {forecast.generated_at && (
                  <div className="text-[11px] text-slate-400">
                    Generated at: {forecast.generated_at}
                  </div>
                )}
              </div>
            </div>

            {/* Active Warnings from API */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Active Pipeline Warnings & Data Integrity Flags</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Real-time governance diagnostics emitted by forecasting engine
              </p>

              <div className="space-y-3">
                {forecast.warnings.map((warn, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Notice #{idx + 1}</span>
                    </div>
                    <p className="text-xs text-amber-800">{warn}</p>
                  </div>
                ))}

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                  <span className="text-xs font-semibold block mb-1">
                    Data Source Attribution:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {forecast.source_names.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Forecasting;
