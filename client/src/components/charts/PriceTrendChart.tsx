import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PriceDataPoint } from '../../data/syntheticData';

interface PriceTrendChartProps {
  data: PriceDataPoint[];
  neighborhoods?: string[]; // IDs or keys to show: 'mumbaiCentral' | 'bandraWest' | etc.
  height?: number;
  showReferenceLines?: boolean;
}

const LINE_CONFIG: Record<string, { name: string; color: string }> = {
  mumbaiCentral: { name: 'Mumbai Central', color: '#6366f1' }, // indigo
  bandraWest: { name: 'Bandra West', color: '#ec4899' }, // pink
  andheriEast: { name: 'Andheri East', color: '#06b6d4' }, // cyan
  thaneWest: { name: 'Thane West', color: '#10b981' }, // emerald
  naviMumbai: { name: 'Navi Mumbai', color: '#f59e0b' }, // amber
  avgPrice: { name: 'Market Average', color: '#64748b' }, // slate
};

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  data,
  neighborhoods = ['mumbaiCentral', 'bandraWest', 'andheriEast', 'thaneWest', 'naviMumbai'],
  height = 360,
  showReferenceLines = true,
}) => {
  const formatYAxis = (val: number) => `₹${Math.round(val / 1000)}k`;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Historical Price Dynamics (₹/sq.ft)
          </h3>
          <p className="text-xs text-slate-500">
            Monthly average transacted rates per square foot (2020 – 2024 synthetic timeline)
          </p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
          Sample: 60 Months
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val: string) => {
                // Show year only every 12 months or quarterly
                if (val.startsWith('Jan') || val.startsWith('Jul')) return val;
                return '';
              }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              domain={['auto', 'auto']}
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: any, name: any) => [
                `₹${Number(value).toLocaleString('en-IN')}/sq.ft`,
                LINE_CONFIG[name]?.name || name,
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: '4px', color: '#94a3b8' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => LINE_CONFIG[value]?.name || value}
            />

            {showReferenceLines && (
              <>
                <ReferenceLine
                  x="Apr 2020"
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: 'COVID Lockdown',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
                <ReferenceLine
                  x="May 2022"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  label={{
                    value: 'RBI Rate Hike Cycle',
                    fill: '#64748b',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
              </>
            )}

            {neighborhoods.map((key) => {
              const conf = LINE_CONFIG[key] || { name: key, color: '#6366f1' };
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={conf.color}
                  strokeWidth={key === 'avgPrice' ? 2.5 : 2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  strokeDasharray={key === 'avgPrice' ? '4 4' : undefined}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
