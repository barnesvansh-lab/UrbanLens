import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  MapPin,
  Building,
  Users,
  Compass,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useTransformationSummary, useTransformationIndicators } from '../api/hooks';
import { ApiTransformationIndicator } from '../api/types';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ApiErrorState } from '../components/ui/ApiErrorState';

export const UrbanTransformation: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: summaryData, loading: loadingSummary, error: errorSummary, refetch: refetchSummary } =
    useTransformationSummary();

  const { data: indicatorsData, loading: loadingIndicators, error: errorIndicators, refetch: refetchIndicators } =
    useTransformationIndicators({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      data_status: selectedStatus === 'all' ? undefined : selectedStatus,
    });

  const hpiTrend = summaryData?.hpi_city_trend;
  const indicators: ApiTransformationIndicator[] = indicatorsData?.indicators || [];

  if (loadingSummary && !summaryData) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading urban transformation indicator registry..." />
      </div>
    );
  }

  if (errorSummary) {
    return (
      <ApiErrorState
        error={errorSummary}
        onRetry={refetchSummary}
        title="Failed to load urban transformation data"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Urban Transformation & Micro-Market Dynamics</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
              Exploratory Research
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Systematic audit of housing price signals, civic amenities, and real data constraints for urban change modeling
          </p>
        </div>

        <Link
          to="/neighborhood"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition"
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span>Spatial Amenity Map</span>
        </Link>
      </div>

      {/* Prominent Data Integrity Statement */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Academic & Algorithmic Integrity Mandate</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {summaryData?.data_integrity_statement ||
            "Urban transformation is a complex socio-economic process. UrbanLens does NOT label any area as 'gentrifying' based solely on housing price index or amenity count data. The indicators presented are descriptive only. All data limitations are documented transparently."}
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-slate-400 border-t border-slate-800">
          <span>
            Total Indicators Registered: <strong className="text-white">{summaryData?.summary.total_indicators}</strong>
          </span>
          <span>
            Verified Real Data: <strong className="text-emerald-400">{summaryData?.real_indicator_count}</strong>
          </span>
          <span>
            Honest Data Unavailable: <strong className="text-amber-400">{summaryData?.unavailable_indicator_count}</strong>
          </span>
        </div>
      </div>

      {/* Real City-Level Price Trend (RBI HPI) Context Card */}
      {hpiTrend && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Official Macroeconomic Anchor
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Reserve Bank of India (RBI) House Price Index — Mumbai Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quarterly assessment-based index (FY 2010–11 = 100) from {hpiTrend.start_date} to {hpiTrend.end_date} ({hpiTrend.n_observations} quarters)
              </p>
            </div>
            <DataStatusBadge status="real" size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1">
              <span className="text-[11px] font-medium text-indigo-700">15-Year Cumulative Change</span>
              <div className="text-2xl font-bold text-indigo-900">
                +{hpiTrend.total_change_pct}%
              </div>
              <div className="text-[10px] text-indigo-600/80">
                From {hpiTrend.start_value} to {hpiTrend.end_value} index points
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[11px] font-medium text-emerald-700">5-Year Medium-Term Change</span>
              <div className="text-2xl font-bold text-emerald-900">
                +{hpiTrend.five_year_change_pct}%
              </div>
              <div className="text-[10px] text-emerald-600/80">
                Last 20 quarters of market momentum
              </div>
            </div>

            <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100 space-y-1">
              <span className="text-[11px] font-medium text-sky-700">Annualised Growth (CAGR)</span>
              <div className="text-2xl font-bold text-sky-900">
                {hpiTrend.annualized_change_pct}%
              </div>
              <div className="text-[10px] text-sky-600/80">
                Compound annual assessment growth rate
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Crucial Distinction:</strong> RBI HPI measures assessment-based property values across the entire Mumbai metropolitan region.
              It <strong>cannot be treated as ward-level or neighborhood transaction prices</strong>, nor does it measure tenant displacement or demographic shifts.
            </span>
          </div>
        </div>
      )}

      {/* Indicator Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Indicator Catalog Filter:
            </span>
          </div>

          {/* Status filter toggle */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'real', label: 'Verified Real' },
              { id: 'unavailable', label: 'Data Unavailable' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStatus(s.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition border ${
                  selectedStatus === s.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'housing_price', label: 'Housing Prices' },
            { id: 'amenity_infrastructure', label: 'Civic Amenities' },
            { id: 'demographics', label: 'Demographics' },
            { id: 'socioeconomic', label: 'Socioeconomics' },
            { id: 'urban_development', label: 'Urban Development & Permits' },
            { id: 'land_use', label: 'Land Use' },
            { id: 'environment', label: 'Environment & Green Cover' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators Catalog List */}
      <div className="space-y-3">
        {loadingIndicators ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner label="Filtering indicator registry..." />
          </div>
        ) : indicators.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No indicators match the selected filters.
          </div>
        ) : (
          indicators.map((ind: ApiTransformationIndicator) => {
            const isReal = ind.data_status === 'real';
            return (
              <div
                key={ind.id}
                className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 transition ${
                  isReal ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {ind.category.replace(/_/g, ' ')} &bull; {ind.geography_level} level
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{ind.name}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <DataStatusBadge status={ind.data_status} size="sm" />
                  </div>
                </div>

                {/* Value or Unavailable Reason */}
                {isReal ? (
                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        Observed Metric Value:
                      </span>
                      <div className="text-base font-bold text-emerald-950 mt-0.5">
                        {ind.display_value}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-emerald-700">
                      <div>Source: {ind.source}</div>
                      <div>Coverage: {ind.coverage}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                      <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Data Unavailable from Free Official Sources</span>
                    </div>
                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      {ind.unavailability_reason}
                    </p>
                    {ind.possible_proxy && (
                      <div className="text-[11px] text-amber-800/80 pt-1 border-t border-amber-200/40">
                        <strong>Potential Proxy / Future Work:</strong> {ind.possible_proxy}
                      </div>
                    )}
                  </div>
                )}

                {/* Methodological Caveats */}
                {ind.limitations && ind.limitations.length > 0 && (
                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <span className="font-semibold text-slate-600 block">Limitations:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
                      {ind.limitations.map((lim: string, lidx: number) => (
                        <li key={lidx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
