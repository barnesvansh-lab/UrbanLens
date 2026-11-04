import React from 'react';
import clsx from 'clsx';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  action,
  className,
}) => (
  <div className={clsx('flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5', className)}>
    <div>
      <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-sage leading-relaxed">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
