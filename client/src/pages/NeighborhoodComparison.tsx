import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  MapPin,
  ArrowLeft,
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
import { EditorialPageHeader } from '../components/ui/EditorialPageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MethodologyAccordion } from '../components/ui/MethodologyAccordion';

const REGION_PALETTE = ['#183D35', '#C56C4B', '#7D6355', '#9EAA9C', '#B48448'];

export const NeighborhoodComparison: React.FC = () => {
  const { data: listData, loading: loadingList, error: errorList, refetch: refetchList } = useNeighborhoods();
  const allRegions: ApiNeighborhoodRegionSummary[] = listData?.regions || [];

  const [selectedIds, setSelectedIds] = useState<string[]>([
    'south-mumbai-colaba',
    'south-mumbai-fort',
    'south-mumbai-malabar-hill',
  ]);

  const toggleRegion = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return;
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) return;
      setSelectedIds([...selectedIds, id]);
    }
  };

  const { data: compareData, loading: loadingCompare, error: errorCompare, refetch: refetchCompare } =
    useNeighborhoodCompare(selectedIds);

  const comparedRegions: ApiNeighborhoodRegionDetail[] = compareData?.regions || [];

  const densityChartData = comparedRegions.map((r: ApiNeighborhoodRegionDetail) => ({
    name: r.name.split('&')[0].trim(),
    fullName: r.name,
    density: r.amenity_density_per_km2,
    total: r.total_amenities,
    within500m: r.within_500m_count,
    within1km: r.within_1km_count,
    area: r.area_km2,
  }));

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
      <div className="py-24 flex justify-center">
        <LoadingSpinner label="Loading comparative spatial registry..." />
      </div>
    );
  }

  if (errorList) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ApiErrorState
          onRetry={refetchList}
          title="Failed to load regions for comparison"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <EditorialPageHeader
        title="Comparative Spatial Benchmarking"
        subtitle="Side-by-side amenity density, walkshed accessibility, and infrastructure profiling across South Mumbai sectors."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta">
              Spatial Comparison
            </span>
            <span className="text-stone">·</span>
            <DataStatusBadge status="real" size="sm" />
          </div>
        }
      >
        <Link
          to="/neighborhood"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone bg-paper text-charcoal hover:bg-ivory text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cartographic Atlas</span>
        </Link>
      </EditorialPageHeader>

      {/* Region Selector Pills */}
      <section className="bg-paper rounded-lg border border-stone/70 p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-sage">
            Select Up to 4 Areas to Benchmark:
          </span>
          <span className="text-sage font-mono">
            {selectedIds.length} of 4 selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allRegions.map((r) => {
            const isSelected = selectedIds.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRegion(r.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-forest text-ivory border-forest shadow-2xs'
                    : 'bg-ivory text-charcoal border-stone/70 hover:bg-stone/40'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5 text-terracotta" /> : <Plus className="w-3.5 h-3.5 text-sage" />}
                <span>{r.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-forest-light text-ivory' : 'bg-paper text-sage'}`}>
                  {r.total_amenities}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {loadingCompare ? (
        <div className="bg-paper rounded-lg border border-stone/70 p-12">
          <LoadingSpinner label="Evaluating spatial cross-sectional indices..." />
        </div>
      ) : errorCompare ? (
        <ApiErrorState
          onRetry={refetchCompare}
          title="Comparison Computation Error"
        />
      ) : (
        <div className="space-y-10">
          {/* Comparative Summary Table */}
          <section className="bg-paper rounded-lg border border-stone/70 overflow-hidden">
            <div className="p-6 border-b border-stone/40">
              <h3 className="font-serif text-xl font-semibold text-charcoal">
                Spatial Density &amp; Proximity Comparison
              </h3>
              <p className="text-xs text-sage mt-0.5">
                Key infrastructural dimensions measured from landmark centroids
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-charcoal">
                <thead className="bg-ivory/60 text-sage text-[10px] uppercase tracking-wider font-semibold border-b border-stone/40">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Metric Dimension</th>
                    {comparedRegions.map((r, idx) => (
                      <th key={r.id} scope="col" className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: REGION_PALETTE[idx % REGION_PALETTE.length] }}
                          />
                          <span>{r.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/40 text-xs">
                  <tr>
                    <td className="px-6 py-3 font-semibold text-charcoal">Study Area (km²)</td>
                    {comparedRegions.map((r) => (
                      <td key={r.id} className="px-4 py-3 font-mono">
                        {r.area_km2} km²
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-semibold text-charcoal">Total Mapped Amenities</td>
                    {comparedRegions.map((r) => (
                      <td key={r.id} className="px-4 py-3 font-mono font-bold text-forest">
                        {r.total_amenities}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-semibold text-charcoal">Amenity Density (per km²)</td>
                    {comparedRegions.map((r) => (
                      <td key={r.id} className="px-4 py-3 font-mono font-bold text-terracotta">
                        {r.amenity_density_per_km2}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-semibold text-charcoal">Within 500m Walkshed</td>
                    {comparedRegions.map((r) => (
                      <td key={r.id} className="px-4 py-3 font-mono">
                        {r.within_500m_count}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-semibold text-charcoal">Within 1.0 km Catchment</td>
                    {comparedRegions.map((r) => (
                      <td key={r.id} className="px-4 py-3 font-mono">
                        {r.within_1km_count}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Density Bar Chart */}
          <section className="bg-paper rounded-lg border border-stone/70 p-6 sm:p-8 space-y-4">
            <SectionHeading
              title="Amenity Density Benchmark"
              subtitle="Mapped civic amenities per square kilometer of sector area"
            />

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={densityChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9D5CA" strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="name" stroke="#9EAA9C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9EAA9C" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      borderRadius: '8px',
                      border: '1px solid #D9D5CA',
                      color: '#252B29',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} per km²`, 'Amenity Density']}
                  />
                  <Bar dataKey="density" fill="#183D35" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Grouped Category Breakdown */}
          {categoryChartData.length > 0 && (
            <section className="bg-paper rounded-lg border border-stone/70 p-6 sm:p-8 space-y-4">
              <SectionHeading
                title="Category Cross-Section"
                subtitle="Distribution across education, healthcare, transit, and parking facilities"
              />

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D9D5CA" strokeOpacity={0.6} vertical={false} />
                    <XAxis dataKey="category" stroke="#9EAA9C" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9EAA9C" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F5',
                        borderRadius: '8px',
                        border: '1px solid #D9D5CA',
                        color: '#252B29',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                    {comparedRegions.map((r, idx) => (
                      <Bar
                        key={r.id}
                        dataKey={r.name.split('&')[0].trim()}
                        fill={REGION_PALETTE[idx % REGION_PALETTE.length]}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={36}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Methodology Accordion */}
          <MethodologyAccordion title="Spatial Comparison Methodology & Computational Limitations" level={2}>
            <div className="space-y-3 text-xs leading-relaxed text-charcoal/80">
              <p>
                <strong>Comparative Metric Normalization:</strong> Amenity density is computed as total mapped features divided by the geographic area of the bounding polygon. Variations may reflect OpenStreetMap mapper contribution intensity in historical colonial cores (such as Fort and Colaba) versus peripheral areas.
              </p>
              <p>
                <strong>Walkshed Buffer Geometry:</strong> 500m and 1.0km buffers represent Euclidean radial distances from the geometric centroid of the bounding box. True street-network walking distances may be longer due to natural or institutional barriers.
              </p>
            </div>
          </MethodologyAccordion>
        </div>
      )}
    </div>
  );
};
