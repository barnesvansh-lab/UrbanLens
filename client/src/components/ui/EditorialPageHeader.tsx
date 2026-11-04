import React from 'react';
import clsx from 'clsx';

interface EditorialPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const EditorialPageHeader: React.FC<EditorialPageHeaderProps> = ({
  title,
  subtitle,
  badge,
  children,
  className,
}) => (
  <div className={clsx('border-b border-stone pb-6 mb-8', className)}>
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base text-sage max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  </div>
);
