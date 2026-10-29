import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Filter, Calendar, BarChart3, Calculator } from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { PriceTrendChart } from '../components/charts/PriceTrendChart';
import { priceTimeSeries } from '../data/syntheticData';

const NEIGHBORHOOD_KEYS = [
  { key: 'mumbaiCentral', label: 'Mumbai Central', color: '#6366f1' },
  { key: 'bandraWest', label: 'Bandra West', color: '#ec4899' },
  { key: 'andheriEast', label: 'Andheri East', color: '#06b6d4' },
  { key: 'thaneWest', label: 'Thane West', color: '#10b981' },
  { key: 'naviMumbai', label: 'Navi Mumbai', color: '#f59e0b' },
  { key: 'avgPrice', label: 'Market Avg', color: '#64748b' },
];

export const MarketTrends: React.FC = () => {
  const [selectedLines, setSelectedLines] = useState<string[]>([
    'mumbaiCentral',
    'bandraWest',
    'andheriEast',
    'thaneWest',
    'naviMumbai',
  ]);
  const [timeRange, setTimeRange] = useState<'all' | '3y' | '1y'>('all');

  // Filter time series based on selection
  const filteredData = useMemo(() => {
    if (timeRange === '1y') return priceTimeSeries.slice(-12);
    if (timeRange === '3y') return priceTimeSeries.slice(-36);
    return priceTimeSeries;
  }, [timeRange]);

  const toggleLine = (key: string) => {
    if (selectedLines.includes(key)) {
      if (selectedLines.length > 1) {
        setSelectedLines(selectedLines.filter((k) => k !== key));
      }
    } else {
      setSelectedLines([...selectedLines, key]);
    }
  };

  // Monthly Seasonality index calculations (Jan - Dec)
  const seasonalityIndex = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, idx) => {
      // Find all points for this month
      const matching = priceTimeSeries.filter((pt) => pt.month.startsWith(m));
      const avgVol = Math.round(
        matching.reduce((acc, curr) => acc + curr.transactions, 0) / (matching.length || 1)
      );
      // Seasonal deviation factor
      const devPct =
        idx === 2
          ? +1.2 // March
          : idx === 6 || idx === 7
          ? -2.4 // Monsoon
          : idx === 9 || idx === 10
          ? +3.1 // Festive
          : 0.1;

      return {
        month: m,
        volume: avgVol,
        deviationPct: devPct,
        tag:
          devPct > 1.5
            ? 'Peak Festive'
            : devPct < -1.5
            ? 'Monsoon Lull'
            : devPct > 0.5
            ? 'Fiscal Surge'
            : 'Normal',
      };
    });
  }, []);

  // Summary statistics calculation
  const summaryStats = useMemo(() => {
    return [
      {
        id: 'mumbaiCentral',
        name: 'Mumbai Central',
        min: 24200,
        max: 33450,
        avg: 29120,
        median: 29400,
        stdDev: 2680,
      },
      {
        id: 'bandraWest',
        name: 'Bandra West',
        min: 25600,
        max: 36800,
        avg: 31800,
        median: 32100,
        stdDev: 3120,
      },
      {
        id: 'andheriEast',
        name: 'Andheri East',
        min: 14500,
        max: 20400,
        avg: 17620,
        median: 17800,
        stdDev: 1690,
      },
      {
        id: 'thaneWest',
        name: 'Thane West',
        min: 9200,
        max: 14100,
        avg: 11840,
        median: 11950,
        stdDev: 1420,
      },
      {
        id: 'naviMumbai',
        name: 'Navi Mumbai',
        min: 7850,
        max: 12450,
        avg: 10250,
        median: 10400,
        stdDev: 1310,
      },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <DemoNotice />

      {/* Interactive Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Neighborhood Selectors */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Visible Markets</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {NEIGHBORHOOD_KEYS.map((item) => {
                const active = selectedLines.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleLine(item.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Range Selector */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date Window</span>
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  timeRange === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5 Years (2020-2024)
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('3y')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  timeRange === '3y'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 3 Years
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('1y')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  timeRange === '1y'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 12 Months
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Filtered Price Trend Chart */}
      <PriceTrendChart
        data={filteredData}
        neighborhoods={selectedLines}
        height={380}
        showReferenceLines={timeRange === 'all'}
      />

      {/* Seasonality Heatmap Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-800">
            Intra-Year Seasonality Pattern
          </h3>
          <p className="text-xs text-slate-500">
            Historical price index deviation & transaction velocity across calendar months
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {seasonalityIndex.map((m) => {
            const isHot = m.deviationPct > 1.5;
            const isCool = m.deviationPct < -1.5;
            const isMild = !isHot && !isCool;

            return (
              <div
                key={m.month}
                className={`p-3 rounded-lg border transition text-center ${
                  isHot
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : isCool
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">{m.month}</div>
                <div className="text-base font-extrabold my-1">
                  {m.deviationPct > 0 ? `+${m.deviationPct}%` : `${m.deviationPct}%`}
                </div>
                <div className="text-[10px] font-medium opacity-80">{m.tag}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  ~{m.volume.toLocaleString('en-IN')} units
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Volume Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Transaction Volume Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Estimated synthetic sales deeds registered per month
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span>Monthly Aggregate</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 15 }}
            >
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
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${Number(val).toLocaleString('en-IN')} deeds`, 'Transactions']}
              />
              <Bar dataKey="transactions" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistical Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">
            5-Year Parametric Statistics Summary (2020–2024)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Neighborhood
                </th>
                <th scope="col" className="px-4 py-3">
                  Min Price (₹/sq.ft)
                </th>
                <th scope="col" className="px-4 py-3">
                  Max Price (₹/sq.ft)
                </th>
                <th scope="col" className="px-4 py-3">
                  Mean Rate
                </th>
                <th scope="col" className="px-4 py-3">
                  Median Rate
                </th>
                <th scope="col" className="px-4 py-3">
                  Std Deviation (σ)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaryStats.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3">₹{item.min.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">₹{item.max.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    ₹{item.avg.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">₹{item.median.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-500">±₹{item.stdDev.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
