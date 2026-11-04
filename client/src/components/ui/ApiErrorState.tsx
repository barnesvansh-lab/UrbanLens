import React from 'react';
import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface ApiErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  title = 'Unable to load data',
  message = 'Please check your connection and try again.',
  onRetry,
  className,
}) => (
  <div
    className={clsx(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      className
    )}
    role="alert"
  >
    <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center mb-4">
      <AlertTriangle className="w-6 h-6 text-terracotta" />
    </div>
    <h3 className="text-base font-semibold text-charcoal mb-1">{title}</h3>
    <p className="text-sm text-sage max-w-sm mb-4">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium text-ivory bg-forest rounded-md hover:bg-forest-light transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);
