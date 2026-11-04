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
  Train,
  Car,
  Layers,
  AlertTriangle,
  Info,
  Scale,
  Sparkles,
  ArrowRight,
  Filter,
  Compass,
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
import { EditorialPageHeader } from '../components/ui/EditorialPageHeader';
import { MethodologyAccordion } from '../components/ui/MethodologyAccordion';

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

// Category styling
function getCategoryMeta(type: string): { label: string; color: string; badgeBg: string; textCol: string } {
  const t = type.toLowerCase();
  if (t === 'school' || t === 'driving_school') {
    return { label: 'Education', color: '#183D35', badgeBg: 'bg-forest/10 border-forest/20', textCol: 'text-forest' };
  }
  if (t === 'hospital' || t === 'clinic') {
    return { label: 'Healthcare', color: '#C56C4B', badgeBg: 'bg-terracotta/10 border-terracotta/20', textCol: 'text-terracotta' };
  }
  if (t === 'stop_position') {
    return { label: 'Transit Stop', color: '#7D6355', badgeBg: 'bg-stone/60 border-stone', textCol: 'text-charcoal' };
  }
  if (t.includes('parking')) {
    return { label: 'Parking & Access', color: '#9EAA9C', badgeBg: 'bg-sage/15 border-sage/30', textCol: 'text-forest' };
  }
  return { label: type, color: '#252B29', badgeBg: 'bg-stone/50 border-stone', textCol: 'text-charcoal' };
}

const REGION_COLORS: Record<string, { fill: string; stroke: string }> = {
  'south-mumbai-colaba': { fill: '#183D35', stroke: '#183D35' },
  'south-mumbai-fort': { fill: '#C56C4B', stroke: '#C56C4B' },
  'south-mumbai-malabar-hill': { fill: '#7D6355', stroke: '#7D6355' },
  'south-mumbai-grant-road': { fill: '#9EAA9C', stroke: '#9EAA9C' },
};

export const NeighborhoodIntelligence: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusParam = searchParams.get('focus') || 'south-mumbai-colaba';

  const [selectedId, setSelectedId] = useState<string>(focusParam);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (focusParam && focusParam !== selectedId) {
      setSelectedId(focusParam);
    }
  }, [focusParam]);

  const handleSelectRegion = (id: string) => {
    setSelectedId(id);
    setSearchParams({ focus: id });
  };

  const { data: neighborhoodsData, loading: loadingRegions, error: errorRegions, refetch: refetchRegions } = useNeighborhoods();
  const { boundaries } = useNeighborhoodBoundaries();
  const { data: analyticsData, loading: loadingAnalytics } = useNeighborhoodAnalytics(selectedId);
  const { amenities, loading: loadingAmenities } = useAmenities({ geography: 'Mumbai' });

  const regions = neighborhoodsData?.regions || [];
  const activeRegion = analyticsData?.region;

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

  const mapCenter: [number, number] = activeRegion
    ? [activeRegion.centroid.lat, activeRegion.centroid.lon]
    : [18.945, 72.825];

  if (loadingRegions && !neighborhoodsData) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner label="Loading cartographic atlas and spatial boundaries..." />
      </div>
    );
  }

  if (errorRegions) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ApiErrorState
          onRetry={refetchRegions}
          title="Unable to load Neighbourhood Atlas"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Editorial Page Header */}
      <EditorialPageHeader
        title="Neighbourhood Cartographic Atlas"
        subtitle="Empirical OpenStreetMap civic infrastructure, spatial accessibility indicators, and amenity density across South Mumbai."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta">
              Spatial Intelligence
            </span>
            <span className="text-stone">·</span>
            <DataStatusBadge status="real" size="sm" />
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Link
            to="/neighborhood/compare"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-paper border border-stone text-charcoal hover:bg-ivory text-xs font-semibold transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-forest" />
            <span>Compare Areas Side-by-Side</span>
          </Link>
          <Link
            to="/transformation"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-forest text-ivory hover:bg-forest/90 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Urban Transformation &rarr;</span>
          </Link>
        </div>
      </EditorialPageHeader>

      {/* Area Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-sage shrink-0 mr-1">
          Explore Sector:
        </span>
        {regions.map((r: ApiNeighborhoodRegionSummary) => {
          const isSelected = selectedId === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectRegion(r.id)}
              className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-forest text-ivory border-forest shadow-xs'
                  : 'bg-paper text-charcoal border-stone/70 hover:bg-ivory'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: REGION_COLORS[r.id]?.stroke || '#9EAA9C' }}
              />
              <span>{r.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-forest-light text-ivory' : 'bg-ivory text-sage'
                }`}
              >
                {r.total_amenities}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── CARTOGRAPHIC MAP & INTELLIGENCE SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 Cols): Centerpiece Interactive Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-paper rounded-lg border border-stone/70 p-4 shadow-xs">
            {/* Map Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-stone/40">
              <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
                <Compass className="w-4 h-4 text-forest" />
                <span>OpenStreetMap Spatial Layers</span>
              </div>

              <div className="flex flex-wrap items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    categoryFilter === 'all'
                      ? 'bg-forest text-ivory font-semibold'
                      : 'bg-ivory text-charcoal hover:bg-stone/40'
                  }`}
                >
                  All ({amenities?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('education')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    categoryFilter === 'education'
                      ? 'bg-forest text-ivory font-semibold'
                      : 'bg-ivory text-charcoal hover:bg-stone/40'
                  }`}
                >
                  Education
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('healthcare')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    categoryFilter === 'healthcare'
                      ? 'bg-forest text-ivory font-semibold'
                      : 'bg-ivory text-charcoal hover:bg-stone/40'
                  }`}
                >
                  Healthcare
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('transit')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    categoryFilter === 'transit'
                      ? 'bg-forest text-ivory font-semibold'
                      : 'bg-ivory text-charcoal hover:bg-stone/40'
                  }`}
                >
                  Transit
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="h-[480px] w-full rounded overflow-hidden border border-stone/50 relative">
              <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <MapRecenter center={mapCenter} zoom={14} />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* GeoJSON Boundary Polygons */}
                {boundaries?.features.map((feat: ApiGeoJsonFeature) => {
                  const regId = feat.properties.id;
                  const isCur = regId === selectedId;
                  const col = REGION_COLORS[regId] || { fill: '#183D35', stroke: '#183D35' };

                  const coords = feat.geometry.coordinates[0].map((coord: number[]) => [
                    coord[1],
                    coord[0],
                  ] as [number, number]);

                  return (
                    <Polygon
                      key={regId}
                      positions={coords}
                      pathOptions={{
                        color: col.stroke,
                        fillColor: col.fill,
                        fillOpacity: isCur ? 0.25 : 0.08,
                        weight: isCur ? 2.5 : 1.2,
                        dashArray: isCur ? undefined : '4 4',
                      }}
                      eventHandlers={{
                        click: () => handleSelectRegion(regId),
                      }}
                    >
                      <Popup>
                        <div className="font-serif font-bold text-sm text-forest mb-0.5">
                          {feat.properties.name}
                        </div>
                        <div className="text-xs text-charcoal">
                          Mapped Amenities: <strong>{feat.properties.total_amenities}</strong>
                        </div>
                        <div className="text-[11px] text-sage mt-1">
                          Click to select this neighbourhood dossier.
                        </div>
                      </Popup>
                    </Polygon>
                  );
                })}

                {/* Mapped Amenity Markers */}
                {filteredAmenities.map((a, idx) => {
                  const meta = getCategoryMeta(a.amenity_type);
                  return (
                    <Marker key={`${a.name}-${idx}`} position={[a.lat, a.lon]}>
                      <Popup>
                        <div className="space-y-1">
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase ${meta.badgeBg} ${meta.textCol}`}>
                            {meta.label}
                          </span>
                          <div className="font-serif font-semibold text-xs text-charcoal">
                            {a.name || 'Unnamed Facility'}
                          </div>
                          <div className="text-[10px] text-sage">
                            OSM Type: {a.amenity_type}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-sage pt-2">
              <span>Displaying {filteredAmenities.length} mapped amenity coordinates</span>
              <span>Source: OpenStreetMap Point-in-time snapshot</span>
            </div>
          </div>
        </div>

        {/* Right (5 Cols): Selected Area Architectural Dossier */}
        <div className="lg:col-span-5 space-y-6">
          {loadingAnalytics || !activeRegion ? (
            <div className="bg-paper rounded-lg border border-stone/70 p-8 flex justify-center">
              <LoadingSpinner label="Calculating accessibility metrics..." />
            </div>
          ) : (
            <>
              {/* Dossier Header Card */}
              <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-stone/40 pb-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-forest block">
                      Neighbourhood Dossier
                    </span>
                    <h3 className="font-serif text-2xl font-semibold text-charcoal mt-0.5">
                      {activeRegion.name}
                    </h3>
                  </div>
                  <DataStatusBadge status={activeRegion.data_status} size="sm" />
                </div>

                <p className="text-xs text-charcoal/80 leading-relaxed">
                  {activeRegion.description}
                </p>

                {/* Landmarks */}
                {activeRegion.known_landmarks && activeRegion.known_landmarks.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-sage block mb-2">
                      Key Reference Landmarks:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeRegion.known_landmarks.map((lm: string) => (
                        <span
                          key={lm}
                          className="px-2.5 py-1 rounded text-xs bg-ivory border border-stone/60 text-charcoal font-medium"
                        >
                          {lm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Spatial Metric Highlights in Plain Language */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper rounded-lg border border-stone/70 p-4">
                  <span className="text-[10px] uppercase font-semibold text-sage block">Total Amenities</span>
                  <div className="text-2xl font-mono font-bold text-charcoal mt-1">
                    {activeRegion.total_amenities}
                  </div>
                  <span className="text-[10px] text-sage">Mapped civic facilities</span>
                </div>

                <div className="bg-paper rounded-lg border border-stone/70 p-4">
                  <span className="text-[10px] uppercase font-semibold text-sage block">Amenity Density</span>
                  <div className="text-2xl font-mono font-bold text-forest mt-1">
                    {activeRegion.amenity_density_per_km2}
                  </div>
                  <span className="text-[10px] text-sage">Per km² ({activeRegion.area_km2} km² area)</span>
                </div>

                <div className="bg-paper rounded-lg border border-stone/70 p-4">
                  <span className="text-[10px] uppercase font-semibold text-sage block">Within 500m Walk</span>
                  <div className="text-2xl font-mono font-bold text-forest mt-1">
                    {activeRegion.within_500m_count}
                  </div>
                  <span className="text-[10px] text-sage">5-minute walk from centroid</span>
                </div>

                <div className="bg-paper rounded-lg border border-stone/70 p-4">
                  <span className="text-[10px] uppercase font-semibold text-sage block">Within 1.0 km Catchment</span>
                  <div className="text-2xl font-mono font-bold text-terracotta mt-1">
                    {activeRegion.within_1km_count}
                  </div>
                  <span className="text-[10px] text-sage">Transit accessibility buffer</span>
                </div>
              </div>

              {/* Amenity Breakdown */}
              <div className="bg-paper rounded-lg border border-stone/70 p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-stone/40 pb-2">
                  <span className="font-serif text-sm font-semibold text-charcoal">
                    Amenity Distribution
                  </span>
                  <span className="text-[11px] text-sage">OpenStreetMap Data</span>
                </div>

                <div className="space-y-3 pt-1">
                  {Object.entries(activeRegion.amenity_categories).map(([cat, count]: [string, number]) => {
                    const meta = getCategoryMeta(cat);
                    const pct = activeRegion.total_amenities > 0
                      ? Math.round((count / activeRegion.total_amenities) * 100)
                      : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-charcoal capitalize">
                            {cat.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono font-semibold text-charcoal">
                            {count} <span className="text-sage font-normal text-[11px]">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-stone/40 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── METHODOLOGY & DEMARCATION ACCORDION ── */}
      <MethodologyAccordion title="Geographic Boundaries & Cartographic Demarcation Notes" level={2}>
        <div className="space-y-3 text-xs leading-relaxed text-charcoal/80">
          <p>
            <strong>Bounding Polygon Demarcation:</strong> The polygonal areas outlined on this map are research study bounding boxes based on landmark references in South Mumbai (Colaba, Fort, Malabar Hill, Grant Road). They do <strong>not</strong> represent official Municipal Corporation of Greater Mumbai (MCGM) administrative ward boundaries.
          </p>
          <p>
            <strong>Amenity Data Sourcing:</strong> Amenity nodes and highway networks are derived from a point-in-time OpenStreetMap export ({neighborhoodsData?.osm_snapshot_date || '2026'}). Distances to nearest facilities are computed using standard spherical surface geometry between mapped coordinates.
          </p>
        </div>
      </MethodologyAccordion>
    </div>
  );
};
