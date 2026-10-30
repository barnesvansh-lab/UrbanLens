import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Database, Sparkles } from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { MetricCard } from '../components/ui/MetricCard';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { PriceTrendChart } from '../components/charts/PriceTrendChart';
import { MarketOverviewChart } from '../components/charts/MarketOverviewChart';
import { useApiSummary } from '../api/hooks';
import {
  marketIndicators,
  neighborhoods,
  priceTimeSeries,
} from '../data/syntheticData';

export const Overview: React.FC = () => {
  // Recent 24 months for overview chart
  const recentData = priceTimeSeries.slice(-24);
  const { summary, loading: summaryLoading } = useApiSummary();

  const getRiskBadge = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const hasRealData = (summary?.data_status_breakdown.real || 0) > 0;
  const activeStatus = hasRealData ? 'real' : 'synthetic_test';

  return (
    <div className="space-y-6">
      {/* Demo Mode Notice */}
      <DemoNotice />

      {/* Top 4 Key Macro Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketIndicators.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            unit={metric.unit}
            sparklineData={metric.sparklineData}
            description={metric.description}
          />
        ))}
      </div>

      {/* Data Ingestion Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Data Pipeline &amp; Ingestion Status
                </span>
                <DataStatusBadge status={activeStatus} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hasRealData
                  ? `Genuine institutional data integrated: ${summary?.data_status_breakdown.real || 0} real quarterly observations from Reserve Bank of India DBIE (2010–2025 across 10 cities) and OpenStreetMap amenities.`
                  : 'Real-data indicators appear when an institutional dataset (e.g. RBI-HPI, NHB-RESIDEX) has been imported. Currently showing synthetic demo data.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0 self-end md:self-center">
            {summaryLoading ? (
              <span className="text-slate-400 text-[11px]">Connecting to data pipeline...</span>
            ) : summary ? (
              <>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Real Obs (RBI)
                  </span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    {summary.data_status_breakdown.real.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Total Obs
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {summary.total_observations.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Datasets Audited
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {summary.total_datasets}
                  </span>
                </div>
                {summary.date_coverage.min && summary.date_coverage.max && (
                  <div className="text-right hidden sm:block">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Date Range
                    </span>
                    <span className="text-slate-700 font-mono text-[11px]">
                      {summary.date_coverage.min.slice(0, 7)} → {summary.date_coverage.max.slice(0, 7)}
                    </span>
                  </div>
                )}
                <Link
                  to="/data-sources"
                  className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded border border-indigo-100 transition"
                >
                  View Sources &rarr;
                </Link>
              </>
            ) : (
              <span className="text-slate-400 text-[11px]">Pipeline standby (demo fixture ready)</span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceTrendChart data={recentData} height={340} />
        </div>
        <div className="lg:col-span-1">
          <MarketOverviewChart data={neighborhoods} height={340} />
        </div>
      </div>

      {/* Neighborhood Snapshot Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Neighborhood Intelligence Snapshot
            </h3>
            <p className="text-xs text-slate-500">
              Key property benchmarks and risk indices across 5 synthetic Mumbai metropolitan sectors
            </p>
          </div>
          <Link
            to="/neighborhood"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            <span>Explore Map &amp; Geospatial Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Neighborhood
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Avg Capital Rate
                </th>
                <th scope="col" className="px-4 py-3.5">
                  1-Year Growth
                </th>
                <th scope="col" className="px-4 py-3.5">
                  5-Year CAGR
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Affordability
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Walk Score
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Gentrification Risk
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {neighborhoods.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{n.name}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    ₹{n.avgPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-400">/ sq.ft</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-emerald-600">
                    +{n.priceChange1Y}%
                  </td>
                  <td className="px-4 py-3.5 font-medium text-indigo-600">
                    +{n.priceChange5Y}%
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${n.affordabilityScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {n.affordabilityScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {n.walkScore} / 100
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadge(
                        n.gentrificationRisk
                      )}`}
                    >
                      {n.gentrificationRisk}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/neighborhood?focus=${n.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Details &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
