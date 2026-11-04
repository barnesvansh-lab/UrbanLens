import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={clsx(
          'rounded-full border-stone border-t-terracotta animate-spin',
          sizeClasses[size]
        )}
      />
      {label && (
        <span className="text-sm text-sage font-medium">{label}</span>
      )}
    </div>
  );
};
