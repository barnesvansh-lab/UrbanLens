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
  neighborhoods?: string[];
  height?: number;
  showReferenceLines?: boolean;
}

const LINE_CONFIG: Record<string, { name: string; color: string }> = {
  mumbaiCentral: { name: 'Mumbai Central', color: '#183D35' }, // deep forest
  bandraWest: { name: 'Bandra West', color: '#C56C4B' }, // terracotta
  andheriEast: { name: 'Andheri East', color: '#7D6355' }, // clay
  thaneWest: { name: 'Thane West', color: '#9EAA9C' }, // sage
  naviMumbai: { name: 'Navi Mumbai', color: '#B48448' }, // warm ochre
  avgPrice: { name: 'Market Average', color: '#252B29' }, // charcoal
};

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  data,
  neighborhoods = ['mumbaiCentral', 'bandraWest', 'andheriEast', 'thaneWest', 'naviMumbai'],
  height = 360,
  showReferenceLines = true,
}) => {
  const formatYAxis = (val: number) => `₹${Math.round(val / 1000)}k`;

  return (
    <div className="w-full bg-paper rounded-lg border border-stone/60 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sage block mb-0.5">
            Historical Price Dynamics
          </span>
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            Capital Value Trends (₹/sq.ft)
          </h3>
          <p className="text-xs text-sage mt-0.5">
            Monthly transacted rates across benchmark sectors
          </p>
        </div>
        <div className="text-xs font-mono font-medium text-forest bg-forest/5 border border-forest/15 px-2.5 py-1 rounded-md self-start sm:self-auto">
          Sample: 60 Months
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9D5CA" strokeOpacity={0.6} vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9EAA9C"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val: string) => {
                if (val.startsWith('Jan') || val.startsWith('Jul')) return val;
                return '';
              }}
            />
            <YAxis
              stroke="#9EAA9C"
              fontSize={11}
              domain={['auto', 'auto']}
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FAF8F5',
                borderRadius: '8px',
                border: '1px solid #D9D5CA',
                color: '#252B29',
                fontSize: '12px',
                boxShadow: '0 4px 16px rgba(24, 61, 53, 0.08)',
              }}
              formatter={(value: any, name: any) => [
                `₹${Number(value).toLocaleString('en-IN')}/sq.ft`,
                LINE_CONFIG[name]?.name || name,
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: '4px', color: '#183D35' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
              formatter={(value) => LINE_CONFIG[value]?.name || value}
            />

            {showReferenceLines && (
              <ReferenceLine
                y={20000}
                stroke="#C56C4B"
                strokeDasharray="4 4"
                label={{
                  value: '₹20k/sq.ft Median Threshold',
                  fill: '#C56C4B',
                  fontSize: 10,
                  position: 'right',
                }}
              />
            )}

            {neighborhoods.map((key) => {
              const cfg = LINE_CONFIG[key] || { name: key, color: '#9EAA9C' };
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={cfg.color}
                  strokeWidth={key === 'avgPrice' ? 2.5 : 1.8}
                  dot={false}
                  activeDot={{ r: 5, fill: cfg.color }}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
