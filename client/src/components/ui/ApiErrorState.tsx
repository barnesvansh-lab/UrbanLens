import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ApiError } from '../../api/types';

interface ApiErrorStateProps {
  error: ApiError | null;
  onRetry: () => void;
  title?: string;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  error,
  onRetry,
  title = 'Failed to load backend intelligence data',
}) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-center shadow-xs">
      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 max-w-md mx-auto mb-1">
        {error?.error || 'A network communication or server validation error occurred.'}
      </p>
      {error?.code && (
        <span className="inline-block text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded mb-4">
          Error Code: {error.code}
        </span>
      )}
      <div>
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100/60 transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};
