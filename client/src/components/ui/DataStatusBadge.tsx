import React from 'react';
import clsx from 'clsx';
import type { DataStatus } from '../../api/types';

interface DataStatusBadgeProps {
  status: DataStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  real: {
    label: 'Empirical Data',
    classes: 'bg-forest/10 text-forest border-forest/20',
    dot: 'bg-forest',
  },
  synthetic_test: {
    label: 'Synthetic Test',
    classes: 'bg-sage/20 text-charcoal border-sage/30',
    dot: 'bg-sage',
  },
  synthetic_demo: {
    label: 'Demo Data',
    classes: 'bg-terracotta/10 text-terracotta border-terracotta/20',
    dot: 'bg-terracotta',
  },
  unavailable: {
    label: 'Unavailable',
    classes: 'bg-stone/50 text-sage border-stone',
    dot: 'bg-stone',
  },
};

export const DataStatusBadge: React.FC<DataStatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unavailable;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 border rounded-full font-medium',
        config.classes,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
};
