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
} from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import {
  neighborhoods,
  priceTimeSeries,
  forecastData,
} from '../data/syntheticData';

export const Forecasting: React.FC = () => {
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] =
    useState<string>('mumbai-central');

  const selectedNeighborhood =
    neighborhoods.find((n) => n.id === selectedNeighborhoodId) || neighborhoods[0];

  // Scale forecast relative to chosen neighborhood base price
  const combinedSeries = useMemo(() => {
    const historical = priceTimeSeries.slice(-24).map((pt) => {
      let price = pt.avgPrice;
      if (selectedNeighborhoodId === 'mumbai-central') price = pt.mumbaiCentral;
      if (selectedNeighborhoodId === 'bandra-west') price = pt.bandraWest;
      if (selectedNeighborhoodId === 'andheri-east') price = pt.andheriEast;
      if (selectedNeighborhoodId === 'thane-west') price = pt.thaneWest;
      if (selectedNeighborhoodId === 'navi-mumbai') price = pt.naviMumbai;

      return {
        month: pt.month,
        historical: price,
        predicted: null,
        lowerBound: null,
        upperBound: null,
        isAnomaly: false,
      };
    });

    const lastHistorical = historical[historical.length - 1].historical;
    const baseForecast = forecastData[0].predictedPrice;
    const scaleRatio = lastHistorical / baseForecast;

    const forecasted = forecastData.map((fd, idx) => ({
      month: fd.month,
      historical: idx === 0 ? lastHistorical : null, // bridge line
      predicted: Math.round(fd.predictedPrice * scaleRatio),
      lowerBound: Math.round(fd.lowerBound * scaleRatio),
      upperBound: Math.round(fd.upperBound * scaleRatio),
      isAnomaly: fd.isAnomaly,
      anomalyReason: fd.anomalyReason,
    }));

    return [...historical, ...forecasted];
  }, [selectedNeighborhoodId]);

  const latestHistoricalPrice =
    combinedSeries.find((d) => d.historical !== null && d.predicted === null)
      ?.historical || 22000;

  const predicted6m =
    combinedSeries.find((d) => d.month === 'Jun 2025')?.predicted || 24000;
  const predicted12m =
    combinedSeries.find((d) => d.month === 'Dec 2025')?.predicted || 25500;

  const projectedGrowth = (
    ((predicted12m - latestHistoricalPrice) / latestHistoricalPrice) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Heavy Warning Notice */}
      <DemoNotice
        customMessage="⚠️ CRITICAL DISCLAIMER: Price projections shown are synthetic simulations produced by a demo SARIMA mathematical engine. Under no circumstances should this be utilized for actual capital allocation, financial underwriting, or commercial appraisal."
        dismissible={false}
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <span>Simulated Forward Price Projections (2025)</span>
          </h2>
          <p className="text-xs text-slate-500">
            SARIMA-driven conditional mean and 95% confidence interval boundaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="neighborhood-select"
            className="text-xs font-semibold text-slate-600 whitespace-nowrap"
          >
            Select Sector:
          </label>
          <select
            id="neighborhood-select"
            value={selectedNeighborhoodId}
            onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} (Avg ₹{n.avgPrice.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Latest Baseline (Dec 2024)
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ₹{latestHistoricalPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400">Actual transacted rate</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Projected in 6 Months (Jun 2025)
          </span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            ₹{predicted6m.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-emerald-600 font-medium">
            +{(((predicted6m - latestHistoricalPrice) / latestHistoricalPrice) * 100).toFixed(1)}% vs. base
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
          <span className="text-xs text-slate-500">Synthetic CI width ±6.2%</span>
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
              Solid line: Historical monthly transacted prices | Dashed line: Forecast point estimates | Shaded: 95% Confidence range
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulated SARIMA (1,1,1)×(1,1,0)₁₂</span>
            </span>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={combinedSeries}
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
                    historical: 'Historical Price',
                    predicted: 'Forecasted Price',
                    lowerBound: 'Lower 95% CI',
                    upperBound: 'Upper 95% CI',
                  };
                  return [`₹${Number(val).toLocaleString('en-IN')}/sq.ft`, labels[name] || name];
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

      {/* Model Spec & Anomaly Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Specification Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Forecasting Architecture & Specification</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            The mathematical formulation underlying the synthetic projection simulation
          </p>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">
                Model: Seasonal ARIMA (p=1, d=1, q=1) × (P=1, D=1, Q=0)₁₂
              </span>
              <span>
                Incorporates 1st order autoregression, single difference stationary transformation, 12-month annual seasonality lag, and moving average residuals.
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">
                Covariate Encodings:
              </span>
              <ul className="list-disc list-inside space-y-1">
                <li>RBI Repo rate macro sensitivity discount factor</li>
                <li>Infrastructure connectivity completion shocks</li>
                <li>Monsoon construction slowdown coefficients</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
              <span className="font-semibold block mb-0.5">Prototype Note:</span>
              In production, this module will be replaced with trained PyTorch LSTM / Prophet models executing against verified registrar deed registers.
            </div>
          </div>
        </div>

        {/* Anomaly Indicators Section */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Synthetically Injected Anomalies</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Simulated outlier deviations flagging localized structural shocks
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1">
                <span>Anomaly #1 — March 2025</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px]">
                  Positive Spike (+4.2% σ)
                </span>
              </div>
              <p className="text-xs text-amber-800">
                Trigger: Synthetic rapid capital surge corresponding to simulated announcement of express metro line clearance.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/60">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-900 mb-1">
                <span>Historical Shock — April-May 2020</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px]">
                  Structural Downturn (-6.1%)
                </span>
              </div>
              <p className="text-xs text-rose-800">
                Trigger: Severe volume drop and price stagnation during synthetic pandemic shock lockdown window.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/60">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-1">
                <span>Anomaly #2 — November 2025</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 text-[10px]">
                  Supply Squeeze (+3.8% σ)
                </span>
              </div>
              <p className="text-xs text-indigo-800">
                Trigger: Post-monsoon festive demand surge coinciding with tight ready-to-move synthetic inventory supply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
