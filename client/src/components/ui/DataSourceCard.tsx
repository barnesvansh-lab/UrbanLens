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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-forest/10 text-forest border border-forest/20">
            <ShieldCheck className="w-3 h-3 text-forest" />
            <span>Integrated &amp; Verified</span>
          </span>
        );
      case 'investigated_only':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Investigated Only</span>
          </span>
        );
      case 'unavailable':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium bg-stone/50 text-sage border border-stone">
            <span>Unavailable</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-paper rounded-lg border border-stone/70 p-5 flex flex-col justify-between hover:border-stone transition-colors">
      <div>
        {/* Header: Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3 border-b border-stone/40 pb-3">
          <div>
            <h4 className="font-serif text-base font-semibold text-charcoal flex items-center gap-1.5">
              <span>{source.name}</span>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage hover:text-terracotta transition-colors"
                  title="Visit official portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </h4>
            <span className="text-[10px] font-mono text-sage">ID: {source.id}</span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <p className="text-xs text-charcoal/80 mb-3 leading-relaxed">
          {source.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 text-sage">
          <div>
            <span className="block font-semibold text-charcoal">Coverage Scope</span>
            <span>{source.geographic_coverage.join(', ') || source.geography_level}</span>
          </div>
          <div>
            <span className="block font-semibold text-charcoal">Temporal Cadence</span>
            <span>{source.frequency} · {source.unit}</span>
          </div>
        </div>

        {/* Known Limitations */}
        {source.limitations && source.limitations.length > 0 && (
          <div className="p-2.5 rounded bg-ivory text-[11px] text-sage border border-stone/50 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-forest">
              <AlertCircle className="w-3 h-3 text-terracotta shrink-0" />
              <span>Documented Constraints</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-charcoal/80">
              {source.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-stone/30 flex items-center justify-between text-[10px] text-sage">
        <span>License: {source.license}</span>
        {source.retrieved_at && (
          <span>Verified: {source.retrieved_at.slice(0, 10)}</span>
        )}
      </div>
    </div>
  );
};
