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

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

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
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Neighborhood Capital Value Benchmark
          </h3>
          <p className="text-xs text-slate-500">
            Current average asking & transacted rate per sq.ft across synthetic nodes
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
              tick={{ fill: '#475569' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              domain={[0, 42000]}
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
              }}
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} / sq.ft`, 'Avg Price']}
              labelStyle={{ fontWeight: 600, color: '#94a3b8' }}
            />
            <Bar dataKey="avgPrice" radius={[6, 6, 0, 0]} maxBarSize={52}>
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
