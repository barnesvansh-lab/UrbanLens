import React from 'react';
import { Database, AlertTriangle, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { DataSourceCard } from '../components/ui/DataSourceCard';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EditorialPageHeader } from '../components/ui/EditorialPageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MethodologyAccordion } from '../components/ui/MethodologyAccordion';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <DemoNotice />

      {/* Editorial Page Header */}
      <EditorialPageHeader
        title="Data Provenance &amp; Institutional Registry"
        subtitle="Catalog of verified public datasets, manual ingestion workflows, and pipeline validation audits."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta">
              Transparency &amp; Governance
            </span>
            <span className="text-stone">·</span>
            <DataStatusBadge status="real" size="sm" />
          </div>
        }
      />

      {/* Methodological Integrity Note */}
      <section className="p-5 rounded-lg bg-paper border border-stone/70">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-charcoal/85 leading-relaxed">
            <strong className="font-serif text-sm font-semibold text-forest block">
              Methodological Integrity &amp; Unit Isolation Principle
            </strong>
            <p>
              Official macroeconomic housing price indices (such as RBI-HPI and NHB-RESIDEX) are published as dimensionless index points relative to a base year (100.0). They reflect relative price movements rather than absolute ₹/sq.ft capital rates. The UrbanLens pipeline strictly isolates index points from transactional unit rates to prevent dimensional error.
            </p>
          </div>
        </div>
      </section>

      {/* Registered Data Sources Section */}
      <section className="space-y-4">
        <SectionHeading
          title="Registered Data Sources &amp; Connectors"
          subtitle="Official institutional repositories evaluated, verified, and mapped for UrbanLens analytics"
        />

        {sourcesLoading ? (
          <div className="bg-paper rounded-lg border border-stone/70 p-12">
            <LoadingSpinner label="Querying registered source catalogue from backend..." />
          </div>
        ) : sourcesError ? (
          <ApiErrorState onRetry={refetchSources} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sources.map((source) => (
              <DataSourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </section>

      {/* Pipeline Quality & Audit Reports */}
      {reports && reports.length > 0 && (
        <section className="bg-paper rounded-lg border border-stone/70 p-6 sm:p-8 space-y-5">
          <SectionHeading
            title="Automated Ingestion Quality Reports"
            subtitle="Integrity metrics, validation summaries, deduplication results, and date coverage audits"
          />

          {qualityLoading ? (
            <LoadingSpinner label="Loading dataset quality audits..." />
          ) : qualityError ? (
            <ApiErrorState onRetry={refetchQuality} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.dataset_name}
                  className="p-4 rounded-lg border border-stone/60 bg-ivory/60 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone/40 pb-2">
                    <span className="font-mono font-bold text-charcoal">
                      {report.dataset_name}
                    </span>
                    <DataStatusBadge status={report.data_status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 text-[11px] font-mono">
                    <div>
                      <span className="text-sage block text-[10px] uppercase font-sans">Raw Rows</span>
                      <span className="font-semibold text-charcoal">{report.raw_row_count}</span>
                    </div>
                    <div>
                      <span className="text-sage block text-[10px] uppercase font-sans">Valid Rows</span>
                      <span className="font-semibold text-forest">{report.valid_row_count}</span>
                    </div>
                    <div>
                      <span className="text-sage block text-[10px] uppercase font-sans">Duplicates</span>
                      <span className="font-semibold text-terracotta">{report.duplicate_count}</span>
                    </div>
                    <div>
                      <span className="text-sage block text-[10px] uppercase font-sans">Rejected</span>
                      <span className="font-semibold text-charcoal">{report.rejected_row_count}</span>
                    </div>
                  </div>

                  {report.warnings && report.warnings.length > 0 && (
                    <div className="pt-2 border-t border-stone/30 text-[11px] text-sage">
                      <strong>Notices:</strong> {report.warnings.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Data Dictionary Section */}
      <section className="bg-paper rounded-lg border border-stone/70 overflow-hidden">
        <div className="p-6 border-b border-stone/40">
          <h3 className="font-serif text-xl font-semibold text-charcoal">
            Normalized Data Dictionary
          </h3>
          <p className="text-xs text-sage mt-0.5">
            Key field schemas, units of measure, and pipeline normalization specifications
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory/60 text-sage uppercase font-semibold border-b border-stone/40">
              <tr>
                <th className="py-3 px-4">Field Name</th>
                <th className="py-3 px-4">Data Type &amp; Unit</th>
                <th className="py-3 px-4">Primary Source</th>
                <th className="py-3 px-4">Definition &amp; Pipeline Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/40">
              {dictionaryItems.map((item) => (
                <tr key={item.field} className="hover:bg-ivory/40 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-forest">
                    {item.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-sage">{item.type}</td>
                  <td className="py-3 px-4 text-charcoal/80">{item.source}</td>
                  <td className="py-3 px-4 text-sage leading-relaxed max-w-md">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
