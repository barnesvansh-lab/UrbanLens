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

  const trendColor = isPositive ? '#10b981' : isNegative ? '#f43f5e' : '#64748b';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
          {description && (
            <div className="group relative cursor-pointer">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition" />
              <div className="absolute right-0 top-5 z-20 hidden w-48 p-2 text-xs font-normal text-white bg-slate-800 rounded-md shadow-lg group-hover:block pointer-events-none">
                {description}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
          {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
            isPositive && 'bg-emerald-50 text-emerald-700 border-emerald-200',
            isNegative && 'bg-rose-50 text-rose-700 border-rose-200',
            !isPositive && !isNegative && 'bg-slate-50 text-slate-600 border-slate-200'
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
                    <stop offset="0%" stopColor={trendColor} stopOpacity={0.3} />
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
