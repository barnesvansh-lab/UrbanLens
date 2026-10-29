import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
  Trees,
  ShoppingBag,
  Train,
  Car,
  Plane,
  Zap,
  Leaf,
  Layers,
} from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { neighborhoods, NeighborhoodData } from '../data/syntheticData';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to dynamically re-center Leaflet map
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const NeighborhoodIntelligence: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialFocus = searchParams.get('focus') || 'mumbai-central';

  const [selectedId, setSelectedId] = useState<string>(initialFocus);

  const selectedNeighborhood: NeighborhoodData =
    neighborhoods.find((n) => n.id === selectedId) || neighborhoods[0];

  return (
    <div className="space-y-6">
      <DemoNotice />

      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Spatial Urban Neighborhood Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500">
            Geospatial infrastructure profiling, amenity densities, and micro-market indicators
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Active Node: <span className="text-indigo-600 font-bold">{selectedNeighborhood.name}</span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Neighborhood Selector & Deep Dive (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {neighborhoods.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelectedId(n.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  selectedId === n.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {n.name}
              </button>
            ))}
          </div>

          {/* Selected Neighborhood Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Micro-Market Profile
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    selectedNeighborhood.gentrificationRisk === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : selectedNeighborhood.gentrificationRisk === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {selectedNeighborhood.gentrificationRisk} Gentrification Risk
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {selectedNeighborhood.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {selectedNeighborhood.description}
              </p>
            </div>

            {/* Core Financial & Metric Benchmarks */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Avg Rate</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{selectedNeighborhood.avgPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block">per sq.ft</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Median 2BHK Rent</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{selectedNeighborhood.medianRent2BHK.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block">per month</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Rental Yield</span>
                <span className="text-base font-bold text-emerald-600">
                  {selectedNeighborhood.rentalYield}%
                </span>
                <span className="text-[10px] text-slate-400 block">Gross cap rate</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">5-Year Growth</span>
                <span className="text-base font-bold text-indigo-600">
                  +{selectedNeighborhood.priceChange5Y}%
                </span>
                <span className="text-[10px] text-slate-400 block">Cumulative CAGR</span>
              </div>
            </div>

            {/* Walk & Transit Scores */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Accessibility Scores
              </span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Walk Score</span>
                    <span className="text-slate-900 font-bold">{selectedNeighborhood.walkScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${selectedNeighborhood.walkScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Transit Score</span>
                    <span className="text-slate-900 font-bold">{selectedNeighborhood.transitScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${selectedNeighborhood.transitScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Affordability Index</span>
                    <span className="text-slate-900 font-bold">{selectedNeighborhood.affordabilityScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${selectedNeighborhood.affordabilityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Amenity Densities */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Surveyed Amenity Counts (Within 3km)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-slate-100">
                  <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-slate-600">Schools:</span>
                  <span className="font-bold text-slate-800 ml-auto">
                    {selectedNeighborhood.amenities.schools}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-slate-100">
                  <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-slate-600">Hospitals:</span>
                  <span className="font-bold text-slate-800 ml-auto">
                    {selectedNeighborhood.amenities.hospitals}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-slate-100">
                  <Trees className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-600">Parks:</span>
                  <span className="font-bold text-slate-800 ml-auto">
                    {selectedNeighborhood.amenities.parks}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-slate-100">
                  <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-600">Malls:</span>
                  <span className="font-bold text-slate-800 ml-auto">
                    {selectedNeighborhood.amenities.malls}
                  </span>
                </div>
              </div>
            </div>

            {/* Infrastructure Badges */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Infrastructure Attributes
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                    selectedNeighborhood.infrastructure.metroAccess
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                  }`}
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Metro Station &lt;500m</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                    selectedNeighborhood.infrastructure.highwayAccess
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Arterial Highway Link</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                  <Plane className="w-3.5 h-3.5 text-slate-500" />
                  <span>Airport: {selectedNeighborhood.infrastructure.airportProximityKm} km</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Green Cover: {selectedNeighborhood.infrastructure.greenCoverPct}%</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{selectedNeighborhood.infrastructure.evChargingStations} EV Plugs</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Leaflet Geospatial Map (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[520px]">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-700">
                Interactive Geospatial Map (Mumbai Metro Area)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Click pins to inspect micro-clusters
            </span>
          </div>

          <div className="flex-1 relative z-10 w-full min-h-[480px]">
            <MapContainer
              center={[19.076, 72.8777]}
              zoom={11}
              scrollWheelZoom={false}
              className="w-full h-full min-h-[480px]"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapRecenter
                center={selectedNeighborhood.coordinates}
                zoom={12}
              />

              {neighborhoods.map((n) => (
                <Marker
                  key={n.id}
                  position={n.coordinates}
                  eventHandlers={{
                    click: () => {
                      setSelectedId(n.id);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px]">
                      <h4 className="font-bold text-sm text-slate-900">{n.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Avg: <span className="font-semibold text-indigo-600">₹{n.avgPrice.toLocaleString('en-IN')}/sq.ft</span>
                      </p>
                      <div className="mt-2 text-[11px] flex justify-between">
                        <span>Affordability:</span>
                        <span className="font-semibold">{n.affordabilityScore}/100</span>
                      </div>
                      <div className="text-[11px] flex justify-between">
                        <span>Walk Score:</span>
                        <span className="font-semibold">{n.walkScore}/100</span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        {n.gentrificationRisk} Gentrification Risk
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
