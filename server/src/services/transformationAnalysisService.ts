import * as fs from 'fs';
import * as path from 'path';
import {
  TransformationTrendsPayload,
  TransformationAnomaliesPayload,
  TransformationEvidencePayload,
  TransformationQualityPayload,
  TransformationOverviewPayload,
  TransformationDataSourceItem,
  NeighborhoodRegion,
  NeighborhoodAnalyticsPayload,
} from '../types/api';

const PROCESSED_DIR = path.resolve(__dirname, '../../python/data/processed');

// In-memory caches to minimize file I/O
let trendsCache: TransformationTrendsPayload | null = null;
let anomaliesCache: TransformationAnomaliesPayload | null = null;
let evidenceCache: TransformationEvidencePayload | null = null;
let qualityCache: TransformationQualityPayload | null = null;
let overviewCache: TransformationOverviewPayload | null = null;
let neighborhoodAnalyticsCache: NeighborhoodAnalyticsPayload | null = null;

function safeReadJson<T>(filename: string): T | null {
  const filePath = path.join(PROCESSED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[transformationAnalysisService] Error reading ${filename}:`, err);
    return null;
  }
}

// Security: check if area ID is safe (alphanumeric, hyphens, underscores)
function isSafeId(id: string): boolean {
  return /^[a-z0-9_-]{1,80}$/i.test(id);
}

export const transformationAnalysisService = {
  getOverview(): TransformationOverviewPayload | null {
    if (!overviewCache) {
      overviewCache = safeReadJson<TransformationOverviewPayload>('transformation_overview.json');
    }
    return overviewCache;
  },

  getTrends(): TransformationTrendsPayload | null {
    if (!trendsCache) {
      trendsCache = safeReadJson<TransformationTrendsPayload>('transformation_trends.json');
    }
    return trendsCache;
  },

  getAnomalies(): TransformationAnomaliesPayload | null {
    if (!anomaliesCache) {
      anomaliesCache = safeReadJson<TransformationAnomaliesPayload>('transformation_anomalies.json');
    }
    return anomaliesCache;
  },

  getEvidence(): TransformationEvidencePayload | null {
    if (!evidenceCache) {
      evidenceCache = safeReadJson<TransformationEvidencePayload>('transformation_evidence.json');
    }
    return evidenceCache;
  },

  getQuality(): TransformationQualityPayload | null {
    if (!qualityCache) {
      qualityCache = safeReadJson<TransformationQualityPayload>('transformation_quality.json');
    }
    return qualityCache;
  },

  getDataSources(): TransformationDataSourceItem[] {
    return [
      {
        id: 'rbi-hpi-mumbai',
        name: 'Reserve Bank of India House Price Index (Mumbai)',
        publishing_organization: 'Reserve Bank of India (RBI)',
        source_url: 'https://dbie.rbihub.in',
        geographic_coverage: 'Mumbai Metropolitan Area (City level)',
        geographic_level: 'city',
        temporal_coverage: { start: '2010-06-30', end: '2025-03-31' },
        observation_count: 60,
        frequency: 'Quarterly',
        unit: 'index_points (Base FY2010-11 = 100)',
        data_format: 'CSV (Normalized from DBIE export)',
        license: 'Government of India Open Data License (OGDL-India)',
        reuse_restrictions: 'Attribution required.',
        status: 'VERIFIED REAL DATA',
        missing_values_count: 0,
        reliability_limitations: [
          'Official transaction assessment values; not listing prices.',
          'Metropolitan city aggregate only; ward disaggregation unavailable.'
        ],
        suitable_for_historical_analysis: true,
        integrated_in_pipeline: true,
      },
      {
        id: 'osm-south-mumbai',
        name: 'OpenStreetMap Civic Infrastructure (South Mumbai)',
        publishing_organization: 'OpenStreetMap Foundation (Contributors)',
        source_url: 'https://www.openstreetmap.org',
        geographic_coverage: 'South Mumbai Peninsula Bounding Box [18.92, 72.80] to [18.98, 72.85]',
        geographic_level: 'neighborhood',
        temporal_coverage: { start: '2026-10-30', end: '2026-10-30' },
        observation_count: 232,
        frequency: 'Point-in-time Snapshot',
        unit: 'geospatial_point_nodes',
        data_format: 'CSV / GeoJSON via Overpass API',
        license: 'Open Data Commons Open Database License (ODbL)',
        reuse_restrictions: 'Attribution required; Share-Alike applies.',
        status: 'VERIFIED REAL DATA',
        missing_values_count: 0,
        reliability_limitations: [
          'Single point-in-time snapshot; CANNOT measure historical civic expansion.',
          'Crowdsourced coverage density varies by area.'
        ],
        suitable_for_historical_analysis: false,
        integrated_in_pipeline: true,
      },
      {
        id: 'south-mumbai-bounding-boxes',
        name: 'South Mumbai Research Sub-Region Extents',
        publishing_organization: 'UrbanLens Research Project',
        source_url: 'https://urbanlens.local/research/boundaries',
        geographic_coverage: 'Colaba, Fort, Malabar Hill, Grant Road',
        geographic_level: 'neighborhood',
        temporal_coverage: null,
        observation_count: 4,
        frequency: 'Static Definition',
        unit: 'geojson_polygon_extents',
        data_format: 'GeoJSON FeatureCollection',
        license: 'MIT (Project Research Definition)',
        reuse_restrictions: 'Academic and research use only.',
        status: 'DOCUMENTED PROXY',
        missing_values_count: 0,
        reliability_limitations: [
          'Approximate bounding boxes derived from landmarks; NOT official MCGM wards.'
        ],
        suitable_for_historical_analysis: false,
        integrated_in_pipeline: true,
      },
      {
        id: 'census-2021-mumbai-wards',
        name: 'Census of India 2021 — Municipal Ward Socioeconomics',
        publishing_organization: 'Office of the Registrar General & Census Commissioner, India',
        source_url: 'https://censusindia.gov.in',
        geographic_coverage: 'Greater Mumbai Municipal Wards',
        geographic_level: 'ward',
        temporal_coverage: null,
        observation_count: 0,
        frequency: 'Decennial',
        unit: 'population_households_literacy',
        data_format: 'Unreleased',
        license: 'Official Statistics',
        reuse_restrictions: 'N/A',
        status: 'DATA UNAVAILABLE',
        missing_values_count: 0,
        reliability_limitations: [
          'Census 2021 was delayed and municipal ward tables remain unreleased.',
          'Fabricating demographics would violate ethical research standards.'
        ],
        suitable_for_historical_analysis: false,
        integrated_in_pipeline: false,
      },
      {
        id: 'mcgm-building-permits',
        name: 'MCGM AutoDCR Building Permits (IOD / CC Approvals)',
        publishing_organization: 'Municipal Corporation of Greater Mumbai (MCGM)',
        source_url: 'https://autodcr.mcgm.gov.in',
        geographic_coverage: 'Mumbai Municipal Wards',
        geographic_level: 'ward',
        temporal_coverage: null,
        observation_count: 0,
        frequency: 'Continuous',
        unit: 'permit_counts_built_up_area',
        data_format: 'Proprietary Portal / PDF',
        license: 'Restricted Municipal Access',
        reuse_restrictions: 'No open programmatic API license.',
        status: 'DATA UNAVAILABLE',
        missing_values_count: 0,
        reliability_limitations: [
          'No public REST API exists; data is behind authenticated portals.'
        ],
        suitable_for_historical_analysis: false,
        integrated_in_pipeline: false,
      },
      {
        id: 'sra-redevelopment-gis',
        name: 'Slum Redevelopment Authority (SRA) GIS Project Footprints',
        publishing_organization: 'Slum Redevelopment Authority, Maharashtra',
        source_url: 'https://sra.gov.in',
        geographic_coverage: 'Mumbai Metropolitan Region',
        geographic_level: 'project_cluster',
        temporal_coverage: null,
        observation_count: 0,
        frequency: 'Irregular',
        unit: 'redevelopment_polygons',
        data_format: 'PDF / Scanned Schematics',
        license: 'Government of Maharashtra Public Notices',
        reuse_restrictions: 'Non-georeferenced documents.',
        status: 'DATA UNAVAILABLE',
        missing_values_count: 0,
        reliability_limitations: [
          'Maps are published as non-vector PDF scans without GIS coordinates.'
        ],
        suitable_for_historical_analysis: false,
        integrated_in_pipeline: false,
      },
      {
        id: 'official-rental-index',
        name: 'National / Municipal Residential Rental Price Index',
        publishing_organization: 'Ministry of Housing and Urban Affairs (MoHUA) / NHB',
        source_url: 'https://mohua.gov.in',
        geographic_coverage: 'Indian Tier-1 Cities',
        geographic_level: 'city',
        temporal_coverage: null,
        observation_count: 0,
        frequency: 'None',
        unit: 'rental_index_points',
        data_format: 'Non-existent',
        license: 'N/A',
        reuse_restrictions: 'N/A',
        status: 'DATA UNAVAILABLE',
        missing_values_count: 0,
        reliability_limitations: [
          'No official residential rental index exists in India.'
        ],
        suitable_for_historical_analysis: false,
        integrated_in_pipeline: false,
      },
      {
        id: 'satellite-ndvi-canopy',
        name: 'Satellite Multispectral Urban Canopy (Sentinel-2 / Landsat)',
        publishing_organization: 'European Space Agency (ESA) / USGS',
        source_url: 'https://sentinels.copernicus.eu',
        geographic_coverage: 'South Mumbai Peninsula',
        geographic_level: 'raster_10m',
        temporal_coverage: { start: '2018-01-01', end: '2025-01-01' },
        observation_count: 0,
        frequency: '5-day revisit (raw)',
        unit: 'ndvi_ratio (-1.0 to +1.0)',
        data_format: 'GeoTIFF',
        license: 'Copernicus Open Access / Public Domain',
        reuse_restrictions: 'Open access with attribution.',
        status: 'REQUIRES MANUAL VALIDATION',
        missing_values_count: 0,
        reliability_limitations: [
          'Heavy monsoon cloud cover causes severe data voids.',
          'Multi-gigabyte image processing exceeds local offline compute bounds.'
        ],
        suitable_for_historical_analysis: true,
        integrated_in_pipeline: false,
      },
    ];
  },

  getAreas(): NeighborhoodRegion[] {
    if (!neighborhoodAnalyticsCache) {
      neighborhoodAnalyticsCache = safeReadJson<NeighborhoodAnalyticsPayload>('neighborhood_analytics.json');
    }
    return neighborhoodAnalyticsCache?.regions || [];
  },

  getAreaById(id: string): NeighborhoodRegion | null {
    if (!isSafeId(id)) return null;
    const areas = this.getAreas();
    return areas.find((a) => a.id === id) || null;
  },

  compareAreas(ids: string[]): NeighborhoodRegion[] {
    const safeIds = ids.filter(isSafeId);
    if (safeIds.length === 0) return [];
    const areas = this.getAreas();
    return areas.filter((a) => safeIds.includes(a.id));
  },
};
