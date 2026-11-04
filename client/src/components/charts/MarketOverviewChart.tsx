import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { NeighborhoodData } from '../../data/syntheticData';

interface MarketOverviewChartProps {
  data: NeighborhoodData[];
  height?: number;
}

const COLORS = ['#183D35', '#C56C4B', '#7D6355', '#9EAA9C', '#B48448'];

export const MarketOverviewChart: React.FC<MarketOverviewChartProps> = ({
  data,
  height = 320,
}) => {
  const chartData = data.map((item) => ({
    name: item.name,
    avgPrice: item.avgPrice,
    change1Y: item.priceChange1Y,
    affordabilityScore: item.affordabilityScore,
  }));

  const formatYAxis = (val: number) => `₹${Math.round(val / 1000)}k`;

  return (
    <div className="w-full bg-paper rounded-lg border border-stone/60 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sage block mb-0.5">
            Spatial Valuation
          </span>
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            Capital Value Benchmarks
          </h3>
          <p className="text-xs text-sage mt-0.5">
            Average transacted rate per sq.ft by sector
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9D5CA" strokeOpacity={0.6} vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#9EAA9C"
              fontSize={11}
              tickLine={false}
              interval={0}
              tick={{ fill: '#252B29', fontSize: 11 }}
            />
            <YAxis
              stroke="#9EAA9C"
              fontSize={11}
              domain={[0, 42000]}
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
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} / sq.ft`, 'Avg Price']}
              labelStyle={{ fontWeight: 600, color: '#183D35' }}
            />
            <Bar dataKey="avgPrice" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
