import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { DEMO_NOTICE } from '../../data/syntheticData';

interface DemoNoticeProps {
  customMessage?: string;
  className?: string;
  dismissible?: boolean;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({
  customMessage,
  className = '',
  dismissible = true,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={`relative flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-terracotta/30 bg-terracotta/5 text-charcoal text-xs sm:text-sm font-medium ${className}`}
    >
      <div className="flex items-center gap-2.5 flex-1">
        <AlertTriangle className="w-4 h-4 text-terracotta shrink-0" aria-hidden="true" />
        <span className="leading-snug">{customMessage || DEMO_NOTICE}</span>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-terracotta hover:text-charcoal rounded p-1 hover:bg-terracotta/10 transition-colors shrink-0"
          title="Dismiss warning"
          aria-label="Dismiss warning"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
