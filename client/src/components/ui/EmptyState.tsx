import React from 'react';
import { Inbox } from 'lucide-react';
import clsx from 'clsx';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  message = 'There is nothing to display at this time.',
  icon,
  className,
  action,
}) => (
  <div
    className={clsx(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      className
    )}
  >
    <div className="w-12 h-12 rounded-full bg-stone/50 flex items-center justify-center mb-4">
      {icon || <Inbox className="w-6 h-6 text-sage" />}
    </div>
    <h3 className="text-base font-semibold text-charcoal mb-1">{title}</h3>
    <p className="text-sm text-sage max-w-sm">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
