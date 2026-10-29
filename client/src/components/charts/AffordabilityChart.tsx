import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { NeighborhoodData } from '../../data/syntheticData';

interface AffordabilityChartProps {
  neighborhoods: NeighborhoodData[];
  selectedIds?: string[];
  height?: number;
}

const PALETTE: Record<string, string> = {
  'mumbai-central': '#6366f1',
  'bandra-west': '#ec4899',
  'andheri-east': '#06b6d4',
  'thane-west': '#10b981',
  'navi-mumbai': '#f59e0b',
};

export const AffordabilityChart: React.FC<AffordabilityChartProps> = ({
  neighborhoods,
  selectedIds = ['mumbai-central', 'andheri-east', 'navi-mumbai'],
  height = 360,
}) => {
  // Construct metrics array with normalized 0-100 values
  const subjects = [
    { key: 'affordabilityScore', label: 'Affordability' },
    { key: 'walkScore', label: 'Walkability' },
    { key: 'transitScore', label: 'Transit Access' },
    { key: 'rentalYieldNorm', label: 'Rental Yield' },
    { key: 'amenityNorm', label: 'Amenities' },
    { key: 'greenNorm', label: 'Green Cover' },
  ];

  const chartData = subjects.map((subj) => {
    const row: Record<string, any> = { subject: subj.label };
    neighborhoods.forEach((n) => {
      let val = 0;
      if (subj.key === 'affordabilityScore') val = n.affordabilityScore;
      else if (subj.key === 'walkScore') val = n.walkScore;
      else if (subj.key === 'transitScore') val = n.transitScore;
      else if (subj.key === 'rentalYieldNorm') val = Math.min(100, Math.round(n.rentalYield * 25));
      else if (subj.key === 'amenityNorm') {
        const totalAmenities =
          n.amenities.schools + n.amenities.hospitals + n.amenities.parks + n.amenities.malls;
        val = Math.min(100, Math.round((totalAmenities / 100) * 100));
      } else if (subj.key === 'greenNorm') {
        val = Math.min(100, Math.round(n.infrastructure.greenCoverPct * 2.5));
      }
      row[n.id] = val;
    });
    return row;
  });

  const activeNeighborhoods = neighborhoods.filter((n) => selectedIds.includes(n.id));

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Urban Livability & Affordability Radar
        </h3>
        <p className="text-xs text-slate-500">
          Multi-dimensional comparative evaluation (0–100 normalized scale)
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val: any, name: any) => {
                const target = neighborhoods.find((n) => n.id === name);
                return [`${val} / 100`, target?.name || name];
              }}
            />
            {activeNeighborhoods.map((n) => (
              <Radar
                key={n.id}
                name={n.name}
                dataKey={n.id}
                stroke={PALETTE[n.id] || '#6366f1'}
                fill={PALETTE[n.id] || '#6366f1'}
                fillOpacity={0.25}
              />
            ))}
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => {
                const target = neighborhoods.find((n) => n.id === value);
                return target ? target.name : value;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
