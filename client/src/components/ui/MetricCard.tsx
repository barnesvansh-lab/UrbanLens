import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import clsx from 'clsx';

export interface MetricCardProps {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
  unit?: string;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  trend,
  sparklineData,
  unit,
  description,
}) => {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  const chartData = (sparklineData || [10, 12, 11, 14, 13, 16, 18]).map((val, idx) => ({
    i: idx,
    v: val,
  }));

  const trendColor = isPositive ? '#183D35' : isNegative ? '#C56C4B' : '#9EAA9C';

  return (
    <div className="bg-paper border border-stone/60 rounded-lg p-4 hover:border-stone transition-colors relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sage">
            {label}
          </span>
          {description && (
            <div className="group relative cursor-pointer">
              <Info className="w-3.5 h-3.5 text-sage hover:text-forest transition" />
              <div className="absolute right-0 top-5 z-20 hidden w-48 p-2.5 text-xs font-normal text-ivory bg-forest rounded-lg shadow-lg group-hover:block pointer-events-none">
                {description}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold tracking-tight text-charcoal font-mono tabular-nums">{value}</span>
          {unit && <span className="text-xs font-medium text-sage">{unit}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone/40">
        <div
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
            isPositive && 'bg-forest/10 text-forest',
            isNegative && 'bg-terracotta/10 text-terracotta',
            !isPositive && !isNegative && 'bg-stone/50 text-sage'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : isNegative ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          <span>
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
        </div>

        {sparklineData && (
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={trendColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={trendColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={trendColor}
                  strokeWidth={1.8}
                  fill={`url(#grad-${label.replace(/\s+/g, '-')})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
