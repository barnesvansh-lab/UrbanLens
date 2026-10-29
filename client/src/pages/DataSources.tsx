import React from 'react';
import { Database, AlertTriangle, RefreshCw, Globe } from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';

export const DataSources: React.FC = () => {
  const dictionaryItems = [
    {
      field: 'avgPrice',
      type: 'Float (₹ / sq.ft)',
      source: 'Synthetic Engine (Monte Carlo + Seasonality)',
      description: 'Capital valuation rate per square foot of super built-up residential area.',
    },
    {
      field: 'transactions',
      type: 'Integer',
      source: 'Simulated Registrar Deed Logs',
      description: 'Estimated monthly unit property registrations executed within the postal boundary.',
    },
    {
      field: 'walkScore',
      type: 'Integer (0–100)',
      source: 'Simulated Isochrone POI Density',
      description: 'Pedestrian walkability rating based on proximity to 12 daily errand destinations.',
    },
    {
      field: 'transitScore',
      type: 'Integer (0–100)',
      source: 'Simulated GTFS Transit Feed',
      description: 'Frequency and multi-modal transit connectivity (suburban rail, metro, bus corridors).',
    },
    {
      field: 'affordabilityScore',
      type: 'Integer (0–100)',
      source: 'Ratio Formulation (Income vs. EMI)',
      description: 'Proportion of representative metro household income required to service median mortgage.',
    },
    {
      field: 'gentrificationRisk',
      type: 'Categorical (Low/Med/High)',
      source: 'Multivariate Vulnerability Model',
      description: 'Assessed likelihood of resident displacement due to rapid capital appreciation and luxury conversions.',
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
              Data Architecture & Provenance Directory
            </h2>
            <p className="text-xs text-slate-500">
              Complete catalog of synthetic ingestion streams and planned enterprise production connectors
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Synthetic Integrity Disclaimer</span>
            All numerical datasets currently served in Milestone 1 are computationally synthesized using seasonal Gaussian random-walk processes and parametric urban heuristics. No real customer or sensitive proprietary property records are accessed.
          </div>
        </div>
      </div>

      {/* Synthetic Dataset Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Macro Indices</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]">
              Synthetic Active
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Historical Price Dynamics
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            60 monthly intervals (2020–2024) across 5 synthetic sub-markets with seasonal fluctuations.
          </p>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Simulated Frequency: Monthly</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Spatial Layer</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]">
              Synthetic Active
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Neighborhood Points of Interest
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            Simulated schools, hospitals, green parks, and transit station proximity vectors.
          </p>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Simulated Frequency: Quarterly</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Demographic Data</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]">
              Synthetic Active
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Household Income Distributions
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            Income decile stratifications for calculating debt service capacity and affordability ratings.
          </p>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Simulated Frequency: Annual</span>
          </div>
        </div>
      </div>

      {/* Data Dictionary */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Synthetic Data Schema & Dictionary
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Field specifications, primitive datatypes, and computational generation logic
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th scope="col" className="px-4 py-3">Field Name</th>
                <th scope="col" className="px-4 py-3">Data Type</th>
                <th scope="col" className="px-4 py-3">Synthetic Engine Origin</th>
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

      {/* Production Integration Roadmap */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Planned Production Integrations (Phase 2+)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Live government registries and open spatial APIs targeted for upcoming production integration:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className="font-semibold text-slate-900 block mb-1">
              National Housing Bank (NHB) RESIDEX
            </span>
            <p className="text-slate-600 leading-relaxed">
              Official quarterly housing price indices covering 50+ major Indian metropolitan cities based on disbursed home loan valuations.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className="font-semibold text-slate-900 block mb-1">
              State RERA (Real Estate Regulatory Authority)
            </span>
            <p className="text-slate-600 leading-relaxed">
              Official project registration disclosures, sanctioned floor space indices, developer delivery track records, and encumbrance filings.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className="font-semibold text-slate-900 block mb-1">
              OpenStreetMap (OSM) Overpass API
            </span>
            <p className="text-slate-600 leading-relaxed">
              Direct vector spatial queries for transit stop coordinates, green parks, schools, medical facilities, and road network topology.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className="font-semibold text-slate-900 block mb-1">
              Ministry of Statistics (MoSPI) & Census of India
            </span>
            <p className="text-slate-600 leading-relaxed">
              Ward-level demographic censuses, household income surveys, and urban population density decennial projections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
