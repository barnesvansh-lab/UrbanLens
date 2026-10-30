import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  MapPin,
  ArrowLeft,
  Layers,
  AlertTriangle,
  Info,
  Check,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useNeighborhoods, useNeighborhoodCompare } from '../api/hooks';
import { ApiNeighborhoodRegionDetail, ApiNeighborhoodRegionSummary } from '../api/types';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ApiErrorState } from '../components/ui/ApiErrorState';

const REGION_PALETTE = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export const NeighborhoodComparison: React.FC = () => {
  const { data: listData, loading: loadingList, error: errorList, refetch: refetchList } = useNeighborhoods();

  const allRegions: ApiNeighborhoodRegionSummary[] = listData?.regions || [];

  // Default select first 2 or 3 regions
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'south-mumbai-colaba',
    'south-mumbai-fort',
    'south-mumbai-malabar-hill',
  ]);

  const toggleRegion = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return; // Keep at least one
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) return; // Limit to 4 for clean comparison
      setSelectedIds([...selectedIds, id]);
    }
  };

  const { data: compareData, loading: loadingCompare, error: errorCompare, refetch: refetchCompare } =
    useNeighborhoodCompare(selectedIds);

  const comparedRegions: ApiNeighborhoodRegionDetail[] = compareData?.regions || [];

  // Prepare chart data for density and total amenities
  const densityChartData = comparedRegions.map((r: ApiNeighborhoodRegionDetail) => ({
    name: r.name.split('&')[0].trim(),
    fullName: r.name,
    density: r.amenity_density_per_km2,
    total: r.total_amenities,
    within500m: r.within_500m_count,
    within1km: r.within_1km_count,
    area: r.area_km2,
  }));

  // Prepare grouped category comparison data
  // categories: parking, clinic, hospital, school, stop_position
  const allCategories: string[] = Array.from(
    new Set(comparedRegions.flatMap((r: ApiNeighborhoodRegionDetail) => Object.keys(r.amenity_categories || {})))
  );

  const categoryChartData = allCategories.map((cat: string) => {
    const entry: Record<string, any> = {
      category: cat.replace(/_/g, ' '),
    };
    comparedRegions.forEach((r: ApiNeighborhoodRegionDetail) => {
      entry[r.name.split('&')[0].trim()] = r.amenity_categories[cat] || 0;
    });
    return entry;
  });

  if (loadingList && !listData) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading neighborhood comparison registry..." />
      </div>
    );
  }

  if (errorList) {
    return (
      <ApiErrorState
        error={errorList}
        onRetry={refetchList}
        title="Failed to load regions for comparison"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/neighborhood"
              className="text-slate-400 hover:text-slate-600 transition"
              title="Back to Spatial Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>Multi-Area Spatial Comparison</span>
            </h2>
            <DataStatusBadge status="real" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side benchmarking of civic infrastructure, accessibility density, and walkability catchments across South Mumbai
          </p>
        </div>

        <Link
          to="/neighborhood"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition"
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span>Interactive Map View</span>
        </Link>
      </div>

      {/* Methodology & Data Integrity Disclaimer Box */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-semibold text-amber-950">Comparative Integrity Caveat:</span>
            <p>
              Comparisons evaluate <strong>descriptive infrastructure counts</strong> from OpenStreetMap within approximate bounding-box extents.
              <strong> Higher density does not inherently indicate socioeconomic superiority or active gentrification.</strong>
              No neighborhood-level property prices are included because official Indian HPI is published only at city aggregate level.
            </p>
          </div>
        </div>
      </div>

      {/* Region Selector Pills */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Select Areas to Benchmark (Up to 4):
          </span>
          <span className="text-[11px] text-slate-400">
            Selected: <strong className="text-indigo-600">{selectedIds.length}</strong> / {allRegions.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {allRegions.map((r: ApiNeighborhoodRegionSummary) => {
            const isSelected = selectedIds.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRegion(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                <span>{r.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                  {r.total_amenities}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loadingCompare && !compareData ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner label="Computing comparative spatial analytics..." />
        </div>
      ) : errorCompare ? (
        <ApiErrorState
          error={errorCompare}
          onRetry={refetchCompare}
          title="Failed to load comparison data"
        />
      ) : (
        <div className="space-y-6">
          {/* Side-by-Side KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparedRegions.map((region: ApiNeighborhoodRegionDetail, idx: number) => {
              const color = REGION_PALETTE[idx % REGION_PALETTE.length];
              return (
                <div
                  key={region.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Area {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {region.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Amenity Density:</span>
                      <span className="font-bold text-indigo-600">
                        {region.amenity_density_per_km2} /km²
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Total Features:</span>
                      <span className="font-bold text-slate-800">
                        {region.total_amenities}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Walk Radius (&lt;500m):</span>
                      <span className="font-semibold text-emerald-600">
                        {region.within_500m_count}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Catchment (&lt;1.0km):</span>
                      <span className="font-semibold text-sky-600">
                        {region.within_1km_count}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Approx. Area:</span>
                      <span className="font-mono text-slate-700">
                        {region.area_km2} km²
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Benchmark Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Amenity Density Benchmark (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Amenity Density Comparison</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified OpenStreetMap civic amenities per square kilometre
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={densityChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} /km²`, 'Amenity Density']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="density" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Density (/km²)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Distribution Breakdown (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Amenity Categories by Area</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Breakdown across schools, healthcare, transit, and parking
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {comparedRegions.map((r: ApiNeighborhoodRegionDetail, idx: number) => (
                      <Bar
                        key={r.id}
                        dataKey={r.name.split('&')[0].trim()}
                        fill={REGION_PALETTE[idx % REGION_PALETTE.length]}
                        radius={[3, 3, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Benchmark Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Comprehensive Accessibility Distance Matrix
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Great-circle Haversine distance in kilometres from each area's geographic centroid
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Unit: km</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Amenity Type</th>
                    {comparedRegions.map((r: ApiNeighborhoodRegionDetail) => (
                      <th key={r.id} className="py-3 px-4">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allCategories.map((cat: string) => (
                    <tr key={cat} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-medium text-slate-800 capitalize">
                        {cat.replace(/_/g, ' ')}
                      </td>
                      {comparedRegions.map((r: ApiNeighborhoodRegionDetail) => {
                        const dist = r.nearest_facility_km?.[cat];
                        return (
                          <td key={r.id} className="py-2.5 px-4 font-mono text-slate-600">
                            {dist !== undefined ? `${dist} km` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 font-semibold">
                    <td className="py-2.5 px-4 text-slate-800">Centroid Coordinates</td>
                    {comparedRegions.map((r: ApiNeighborhoodRegionDetail) => (
                      <td key={r.id} className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                        {r.centroid.lat.toFixed(4)}, {r.centroid.lon.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
