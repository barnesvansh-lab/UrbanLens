import React from 'react';
import { ExternalLink, ShieldCheck, Clock, MapPin, AlertCircle, FileText, Download } from 'lucide-react';
import { ApiDataSource } from '../../api/types';

interface DataSourceCardProps {
  source: ApiDataSource;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({ source }) => {
  const getStatusBadge = () => {
    switch (source.status) {
      case 'integrated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Integrated &amp; Verified</span>
          </span>
        );
      case 'investigated_only':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Investigated (Manual Ingestion Ready)</span>
          </span>
        );
      case 'unavailable':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span>Unavailable</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
      <div>
        {/* Header: Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2.5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{source.name}</span>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-600 transition"
                  title="Visit official portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </h4>
            <span className="text-[11px] font-mono text-slate-400">ID: {source.id}</span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">{source.description}</p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs mb-3.5">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
              Geography &amp; Resolution
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="capitalize">{source.geography_level} Level</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
              Update Frequency
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{source.frequency}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
              Measurement Unit
            </span>
            <span className="font-mono text-indigo-700 text-[11px] font-semibold">
              {source.unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
              Temporal Horizon
            </span>
            <span className="text-slate-700 text-[11px]">
              {source.temporal_coverage
                ? `${source.temporal_coverage.start} → ${source.temporal_coverage.end}`
                : 'Current / Static'}
            </span>
          </div>
        </div>

        {/* Geographic Coverage */}
        <div className="mb-3.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Geographic Coverage
          </span>
          <div className="flex flex-wrap gap-1">
            {source.geographic_coverage.map((geo) => (
              <span
                key={geo}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
              >
                {geo}
              </span>
            ))}
          </div>
        </div>

        {/* Ingestion & Access Method */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 mb-3.5 flex items-start gap-2">
          <Download className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Access Method: </span>
            <span>{source.access_method}</span>
          </div>
        </div>

        {/* Limitations & Caveats */}
        {source.limitations && source.limitations.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Methodological Limitations &amp; Disclaimers</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-amber-900/90 leading-relaxed">
              {source.limitations.map((limit, idx) => (
                <li key={idx}>{limit}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer / License */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-slate-400" />
          <span>License: {source.license}</span>
        </span>
        {source.retrieved_at && (
          <span>Verified: {new Date(source.retrieved_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};
