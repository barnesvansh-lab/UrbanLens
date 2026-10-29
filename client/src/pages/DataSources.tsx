import React from 'react';
import { Database, AlertTriangle, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { DataSourceCard } from '../components/ui/DataSourceCard';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDataSources, useDataQuality } from '../api/hooks';

export const DataSources: React.FC = () => {
  const { sources, loading: sourcesLoading, error: sourcesError, refetch: refetchSources } = useDataSources();
  const { reports, loading: qualityLoading, error: qualityError, refetch: refetchQuality } = useDataQuality();

  const dictionaryItems = [
    {
      field: 'observation_date',
      type: 'ISO Date (YYYY-MM-DD)',
      source: 'Ingestion Pipeline Normalizer',
      description: 'First calendar date of quarterly observation period (e.g. 2020-04-01 for Indian FY Q1).',
    },
    {
      field: 'hpi_assessment',
      type: 'Float (Index Points)',
      source: 'RBI DBIE / NHB RESIDEX Registry',
      description: 'Dimensionless housing price index normalized to base year (100). Never to be confused with ₹/sqft.',
    },
    {
      field: 'avgPrice',
      type: 'Float (₹ / sq.ft)',
      source: 'Synthetic Engine (Monte Carlo + Seasonality)',
      description: 'Capital valuation rate per square foot of super built-up residential area in demo mode.',
    },
    {
      field: 'amenity_type',
      type: 'Categorical String',
      source: 'OpenStreetMap Overpass Interpreter',
      description: 'Civic facility category (school, hospital, park, clinic, public_transport).',
    },
    {
      field: 'walkScore',
      type: 'Integer (0–100)',
      source: 'Simulated Isochrone POI Density',
      description: 'Pedestrian walkability rating based on proximity to 12 daily errand destinations.',
    },
    {
      field: 'affordabilityScore',
      type: 'Integer (0–100)',
      source: 'Ratio Formulation (Income vs. EMI)',
      description: 'Proportion of representative metro household income required to service median mortgage.',
    },
  ];

  return (
    <div className="space-y-6">
      <DemoNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Data Architecture &amp; Provenance Directory
            </h2>
            <p className="text-xs text-slate-500">
              Audited catalog of official public data sources, manual ingestion workflows, and pipeline validation reports
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Methodological Integrity Disclaimer</span>
            Official macroeconomic housing price indices (such as RBI-HPI and NHB-RESIDEX) are published as dimensionless index points relative to a base year (100). They reflect relative price movements rather than absolute ₹/sq.ft capital rates. The pipeline strictly isolates index points from transactional unit rates.
          </div>
        </div>
      </div>

      {/* Registered Data Sources Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Registered Data Sources &amp; Connectors
            </h3>
            <p className="text-xs text-slate-500">
              Official institutional sources evaluated, verified, and mapped for UrbanLens market analytics
            </p>
          </div>
        </div>

        {sourcesLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <LoadingSpinner label="Querying registered source catalogue from backend..." />
          </div>
        ) : sourcesError ? (
          <ApiErrorState error={sourcesError} onRetry={refetchSources} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => (
              <DataSourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </div>

      {/* Pipeline Quality & Audit Reports */}
      {reports && reports.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Automated Ingestion Quality Reports</span>
              </h3>
              <p className="text-xs text-slate-500">
                Integrity metrics, validation summaries, deduplication results, and date coverage audits
              </p>
            </div>
          </div>

          {qualityLoading ? (
            <LoadingSpinner label="Loading dataset quality audits..." />
          ) : qualityError ? (
            <ApiErrorState error={qualityError} onRetry={refetchQuality} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.dataset_name}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-slate-900">
                      {report.dataset_name}
                    </span>
                    <DataStatusBadge status={report.data_status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 my-2 border-y border-slate-200/80 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">RAW ROWS</span>
                      <span className="font-semibold text-slate-800">{report.raw_row_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">VALID ROWS</span>
                      <span className="font-semibold text-emerald-700">{report.valid_row_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">DUPLICATES</span>
                      <span className="font-semibold text-amber-700">{report.duplicate_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">REJECTED</span>
                      <span className="font-semibold text-rose-700">{report.rejected_row_count}</span>
                    </div>
                  </div>

                  {report.date_range && (
                    <div className="text-[11px] text-slate-600 mb-1.5">
                      <span className="text-slate-400">Date Span: </span>
                      <span className="font-medium text-slate-800">
                        {report.date_range.min} to {report.date_range.max}
                      </span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 mb-2">
                    <span className="text-slate-400">Geographies: </span>
                    <span className="font-medium text-slate-800">
                      {report.geographies.join(', ') || 'Metropolitan aggregate'}
                    </span>
                  </div>

                  {report.warnings && report.warnings.length > 0 && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-900 mt-2">
                      <div className="font-semibold flex items-center gap-1 mb-1 text-amber-800">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Quality Warnings:</span>
                      </div>
                      <ul className="list-disc pl-3.5 space-y-0.5">
                        {report.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Generated: {new Date(report.generated_at).toLocaleString()}</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Audit Complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data Dictionary */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Data Schema &amp; Dictionary
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Field specifications, primitive datatypes, and pipeline normalization mappings
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th scope="col" className="px-4 py-3">Field Name</th>
                <th scope="col" className="px-4 py-3">Data Type</th>
                <th scope="col" className="px-4 py-3">Source Origin</th>
                <th scope="col" className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dictionaryItems.map((item) => (
                <tr key={item.field} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">
                    {item.field}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.type}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{item.source}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
