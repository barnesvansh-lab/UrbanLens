import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import {
  MapPin,
  GraduationCap,
  HeartPulse,
  Car,
  Train,
  Layers,
  AlertTriangle,
  Info,
  Scale,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  useNeighborhoods,
  useNeighborhoodBoundaries,
  useNeighborhoodAnalytics,
  useAmenities,
} from '../api/hooks';
import { ApiNeighborhoodRegionSummary, ApiGeoJsonFeature } from '../api/types';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ApiErrorState } from '../components/ui/ApiErrorState';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to dynamically re-center Leaflet map
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
};

// Helper: category icon and color
function getCategoryMeta(type: string): { label: string; color: string; badgeBg: string; textCol: string } {
  const t = type.toLowerCase();
  if (t === 'school' || t === 'driving_school') {
    return { label: 'Education', color: '#4f46e5', badgeBg: 'bg-indigo-50 border-indigo-200', textCol: 'text-indigo-700' };
  }
  if (t === 'hospital' || t === 'clinic') {
    return { label: 'Healthcare', color: '#e11d48', badgeBg: 'bg-rose-50 border-rose-200', textCol: 'text-rose-700' };
  }
  if (t === 'stop_position') {
    return { label: 'Transit Stop', color: '#0284c7', badgeBg: 'bg-sky-50 border-sky-200', textCol: 'text-sky-700' };
  }
  if (t.includes('parking')) {
    return { label: 'Parking & Access', color: '#d97706', badgeBg: 'bg-amber-50 border-amber-200', textCol: 'text-amber-700' };
  }
  return { label: type, color: '#64748b', badgeBg: 'bg-slate-50 border-slate-200', textCol: 'text-slate-700' };
}

const REGION_COLORS: Record<string, { fill: string; stroke: string }> = {
  'south-mumbai-colaba': { fill: '#3b82f6', stroke: '#1d4ed8' },
  'south-mumbai-fort': { fill: '#8b5cf6', stroke: '#6d28d9' },
  'south-mumbai-malabar-hill': { fill: '#10b981', stroke: '#047857' },
  'south-mumbai-grant-road': { fill: '#f59e0b', stroke: '#b45309' },
};

export const NeighborhoodIntelligence: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusParam = searchParams.get('focus') || 'south-mumbai-colaba';

  const [selectedId, setSelectedId] = useState<string>(focusParam);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sync url param
  useEffect(() => {
    if (focusParam && focusParam !== selectedId) {
      setSelectedId(focusParam);
    }
  }, [focusParam]);

  const handleSelectRegion = (id: string) => {
    setSelectedId(id);
    setSearchParams({ focus: id });
  };

  // Queries
  const { data: neighborhoodsData, loading: loadingRegions, error: errorRegions, refetch: refetchRegions } = useNeighborhoods();
  const { boundaries } = useNeighborhoodBoundaries();
  const { data: analyticsData, loading: loadingAnalytics } = useNeighborhoodAnalytics(selectedId);
  const { amenities, loading: loadingAmenities } = useAmenities({ geography: 'Mumbai' });

  const regions = neighborhoodsData?.regions || [];
  const activeRegion = analyticsData?.region;

  // Filter amenities by category and region
  const filteredAmenities = useMemo(() => {
    if (!amenities) return [];
    return amenities.filter((a) => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'education') return a.amenity_type === 'school' || a.amenity_type === 'driving_school';
      if (categoryFilter === 'healthcare') return a.amenity_type === 'hospital' || a.amenity_type === 'clinic';
      if (categoryFilter === 'transit') return a.amenity_type === 'stop_position';
      if (categoryFilter === 'parking') return a.amenity_type.includes('parking');
      return a.amenity_type === categoryFilter;
    });
  }, [amenities, categoryFilter]);

  // Center coordinate
  const mapCenter: [number, number] = activeRegion
    ? [activeRegion.centroid.lat, activeRegion.centroid.lon]
    : [18.945, 72.825];

  if (loadingRegions && !neighborhoodsData) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading spatial neighborhood intelligence..." />
      </div>
    );
  }

  if (errorRegions) {
    return (
      <ApiErrorState
        error={errorRegions}
        onRetry={refetchRegions}
        title="Unable to load Neighborhood Intelligence"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Spatial Neighborhood Intelligence</span>
            </h2>
            <DataStatusBadge status="real" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real OpenStreetMap civic infrastructure profiling, density analytics, and accessibility indicators across South Mumbai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/neighborhood/compare"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>Compare Areas</span>
          </Link>
          <Link
            to="/transformation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Urban Transformation</span>
          </Link>
        </div>
      </div>

      {/* Methodology & Data Integrity Disclaimer Box */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-semibold text-amber-950">Geographic & Temporal Data Disclosure:</span>
            <p>
              The regions shown are <strong>approximate bounding boxes</strong> established from landmark references for research purposes,
              <strong> not official MCGM administrative ward boundaries</strong>. OpenStreetMap amenities are from a <strong>single point-in-time snapshot</strong> ({neighborhoodsData?.osm_snapshot_date || '2026-10-30'})
              and do not reflect historical infrastructure expansion. <strong>City-level RBI House Price Index (HPI) data cannot be disaggregated to these sub-regions.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Region Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Select Area:
        </span>
        {regions.map((r: ApiNeighborhoodRegionSummary) => {
          const isSelected = selectedId === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectRegion(r.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: REGION_COLORS[r.id]?.stroke || '#64748b' }}
              />
              <span>{r.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                {r.total_amenities}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selected Area Deep Dive & Analytics (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {loadingAnalytics || !activeRegion ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex justify-center">
              <LoadingSpinner label="Computing spatial density metrics..." />
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Geographic Profile &bull; South Mumbai
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {activeRegion.name}
                    </h3>
                  </div>
                  <DataStatusBadge status={activeRegion.data_status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeRegion.description}
                </p>

                {/* Landmarks */}
                {activeRegion.known_landmarks && activeRegion.known_landmarks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Prominent Reference Landmarks:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeRegion.known_landmarks.map((lm: string) => (
                        <span
                          key={lm}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                        >
                          {lm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Spatial Metric Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Total Amenities</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {activeRegion.total_amenities}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Real OSM Features Mapped
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Amenity Density</div>
                  <div className="text-2xl font-bold text-indigo-600 mt-1">
                    {activeRegion.amenity_density_per_km2}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Amenities per km² ({activeRegion.area_km2} km² area)
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Within 500m Walk</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    {activeRegion.within_500m_count}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Centroid Walkshed Radius
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Within 1.0 km Transit</div>
                  <div className="text-xl font-bold text-sky-600 mt-1">
                    {activeRegion.within_1km_count}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Centroid Catchment Radius
                  </div>
                </div>
              </div>

              {/* Amenity Category Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Amenity Distribution
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Source: OpenStreetMap
                  </span>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(activeRegion.amenity_categories).map(([cat, count]: [string, number]) => {
                    const meta = getCategoryMeta(cat);
                    const pct = activeRegion.total_amenities > 0
                      ? Math.round((count / activeRegion.total_amenities) * 100)
                      : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 capitalize">
                            {cat.replace(/_/g, ' ')}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nearest Facility Distance (Haversine km) */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nearest Facility Distance (from Centroid)
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Haversine (km)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(activeRegion.nearest_facility_km).map(([cat, dist]: [string, number]) => {
                    const meta = getCategoryMeta(cat);
                    return (
                      <div
                        key={cat}
                        className={`p-2.5 rounded-lg border ${meta.badgeBg} flex items-center justify-between`}
                      >
                        <span className={`font-semibold capitalize text-[11px] ${meta.textCol}`}>
                          {cat.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {dist} km
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-400 pt-1 leading-normal">
                  Calculated using great-circle Haversine formula from geographic centroid ({activeRegion.centroid.lat.toFixed(4)}, {activeRegion.centroid.lon.toFixed(4)}).
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Leaflet Geospatial Map (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[580px]">
          {/* Map Controls & Category Filter Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">Filter Amenities:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'education', label: 'Schools' },
                { id: 'healthcare', label: 'Clinics & Hospitals' },
                { id: 'transit', label: 'Transit Stops' },
                { id: 'parking', label: 'Parking' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCategoryFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition border ${
                    categoryFilter === f.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="flex-1 relative z-10 w-full min-h-[520px]">
            {loadingAmenities && (
              <div className="absolute top-3 right-3 z-500 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Loading OSM nodes...</span>
              </div>
            )}

            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full min-h-[520px]"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapRecenter center={mapCenter} zoom={13} />

              {/* Render approximate bounding box polygons */}
              {boundaries?.features.map((feature: ApiGeoJsonFeature) => {
                const fid = feature.properties.id;
                const isSelected = fid === selectedId;
                const color = REGION_COLORS[fid] || { fill: '#6366f1', stroke: '#4f46e5' };
                // coordinates are [ [ [lon, lat], [lon, lat], ... ] ]
                // Leaflet Polygon expects [lat, lon]
                const positions: [number, number][] = feature.geometry.coordinates[0].map(
                  (pt: number[]) => [pt[1], pt[0]] as [number, number]
                );

                return (
                  <Polygon
                    key={fid}
                    positions={positions}
                    pathOptions={{
                      color: isSelected ? '#1e1b4b' : color.stroke,
                      weight: isSelected ? 3 : 1.5,
                      fillColor: color.fill,
                      fillOpacity: isSelected ? 0.25 : 0.12,
                      dashArray: isSelected ? undefined : '4, 4',
                    }}
                    eventHandlers={{
                      click: () => handleSelectRegion(fid),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1">
                        <div className="font-bold text-xs text-slate-900">{feature.properties.name}</div>
                        <div className="text-[11px] text-slate-500">{feature.properties.description}</div>
                        <div className="text-[10px] text-indigo-600 font-semibold pt-1 border-t border-slate-100">
                          {feature.properties.total_amenities} amenities &bull; {feature.properties.amenity_density_per_km2}/km²
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}

              {/* Render amenity points */}
              {filteredAmenities.map((am, idx) => {
                const meta = getCategoryMeta(am.amenity_type);
                return (
                  <Marker
                    key={`${am.lat}-${am.lon}-${idx}`}
                    position={[am.lat, am.lon]}
                  >
                    <Popup>
                      <div className="p-1.5 space-y-1 min-w-[160px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${meta.badgeBg} ${meta.textCol}`}>
                            {am.amenity_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[9px] text-emerald-600 font-semibold">VERIFIED OSM</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900">
                          {am.name || `${meta.label} Facility`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {am.lat.toFixed(5)}, {am.lon.toFixed(5)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Map Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              Showing <strong className="text-slate-800">{filteredAmenities.length}</strong> of {amenities.length} real OSM amenities
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Info className="w-3 h-3 text-slate-400" />
              <span>Bounding boxes are approximate research extents, not administrative wards.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
