import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface MethodologyAccordionProps {
  title: string;
  level?: 2 | 3;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const MethodologyAccordion: React.FC<MethodologyAccordionProps> = ({
  title,
  level = 2,
  defaultOpen = false,
  children,
  className,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const levelLabel = level === 2 ? 'More detail' : 'Technical methodology';

  return (
    <div className={clsx('border border-stone/60 rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
          open ? 'bg-paper' : 'bg-paper/50 hover:bg-paper'
        )}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full',
              level === 2
                ? 'bg-sage/20 text-forest'
                : 'bg-forest/10 text-forest'
            )}
          >
            {levelLabel}
          </span>
          <span className="text-sm font-medium text-charcoal">{title}</span>
        </div>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-sage transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="px-4 py-4 border-t border-stone/40 bg-paper/30 text-sm text-charcoal/80 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};
