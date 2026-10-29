import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      role="status"
      className={clsx(
        'flex flex-col items-center justify-center gap-2 py-8 text-slate-500',
        className
      )}
    >
      <Loader2
        className={clsx(
          'animate-spin text-indigo-600',
          sizeClasses[size]
        )}
      />
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
};
