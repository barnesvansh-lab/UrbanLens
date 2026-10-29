import React from 'react';
import { ShieldCheck, FlaskConical, XCircle } from 'lucide-react';
import { DataStatus } from '../../api/types';

interface DataStatusBadgeProps {
  status: DataStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const DataStatusBadge: React.FC<DataStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';
  const iconSize = isSm ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const textSize = isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'real':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs ${textSize} ${className}`}
        >
          <ShieldCheck className={`${iconSize} text-emerald-600 shrink-0`} />
          <span>VERIFIED REAL DATA</span>
        </span>
      );

    case 'synthetic_test':
    case 'synthetic':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs ${textSize} ${className}`}
        >
          <FlaskConical className={`${iconSize} text-amber-600 shrink-0`} />
          <span>SYNTHETIC DEMO DATA</span>
        </span>
      );

    case 'unavailable':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs ${textSize} ${className}`}
        >
          <XCircle className={`${iconSize} text-slate-400 shrink-0`} />
          <span>DATA UNAVAILABLE</span>
        </span>
      );
  }
};
