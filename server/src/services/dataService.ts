import * as fs from 'fs';
import * as path from 'path';
import {
  DataObservation,
  QualityReport,
  AmenityFeature,
  DataSource,
  DataSummary,
  DataStatus,
  GeographyLevel,
} from '../types/api';

// IMPORTANT: Controlled directory access — never expose raw file paths to external callers
const PROCESSED_DIR = path.resolve(__dirname, '../../python/data/processed');
const MANIFESTS_DIR = path.resolve(__dirname, '../../python/data/manifests');

function safeReadJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`[safeReadJson] Error reading ${path.basename(filePath)}:`, err);
    return null;
  }
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'));
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length >= headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
  }
  return rows;
}

function safeReadCsv(filePath: string): Record<string, string>[] | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCsv(content);
  } catch (err) {
    console.error(`[safeReadCsv] Error reading ${path.basename(filePath)}:`, err);
    return null;
  }
}

export const dataService = {
  getObservations(filters: {
    geography?: string;
    metric?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): DataObservation[] {
    let observations: DataObservation[] = [];

    if (!fs.existsSync(PROCESSED_DIR)) {
      return [];
    }

    const files = fs.readdirSync(PROCESSED_DIR).filter((f) => f.endsWith('.csv') && f.includes('hpi'));

    for (const file of files) {
      // Prioritize the canonical processed_hpi.csv to avoid duplicate counts with source-specific files
      if (file !== 'processed_hpi.csv' && files.includes('processed_hpi.csv')) {
        continue;
      }

      const rows = safeReadCsv(path.join(PROCESSED_DIR, file));
      if (!rows) continue;

      for (const row of rows) {
        if (!row.observation_date || !row.geography_name || !row.metric_value) continue;

        const obs: DataObservation = {
          observation_date: row.observation_date,
          geography_name: row.geography_name,
          geography_level: (row.geography_level || 'city') as GeographyLevel,
          metric_name: row.metric_name || 'hpi_assessment',
          metric_value: parseFloat(row.metric_value) || 0,
          unit: row.unit || 'index_points',
          source_name: row.source_name || 'UNKNOWN',
          source_url: row.source_url || '',
          retrieved_at: row.retrieved_at || '',
          data_status: (row.data_status || 'synthetic_test') as DataStatus,
        };
        observations.push(obs);
      }
    }

    // Apply query filters
    if (filters.geography) {
      const geoLower = filters.geography.toLowerCase();
      observations = observations.filter((o) => o.geography_name.toLowerCase() === geoLower);
    }

    if (filters.metric) {
      const metricLower = filters.metric.toLowerCase();
      observations = observations.filter((o) => o.metric_name.toLowerCase() === metricLower);
    }

    if (filters.start_date) {
      observations = observations.filter((o) => o.observation_date >= filters.start_date!);
    }

    if (filters.end_date) {
      observations = observations.filter((o) => o.observation_date <= filters.end_date!);
    }

    // Sort chronologically
    observations.sort((a, b) => a.observation_date.localeCompare(b.observation_date));

    // Limit if requested
    if (filters.limit && filters.limit > 0) {
      observations = observations.slice(0, filters.limit);
    }

    return observations;
  },

  getQualityReports(): QualityReport[] {
    if (!fs.existsSync(MANIFESTS_DIR)) {
      return [];
    }

    const reports: QualityReport[] = [];
    const files = fs.readdirSync(MANIFESTS_DIR).filter((f) => f.startsWith('quality_') && f.endsWith('.json'));

    for (const file of files) {
      const rep = safeReadJson<QualityReport>(path.join(MANIFESTS_DIR, file));
      if (rep) {
        reports.push(rep);
      }
    }
    return reports;
  },

  getAmenities(filters: { geography?: string; amenity_type?: string }): AmenityFeature[] {
    let amenities: AmenityFeature[] = [];

    if (!fs.existsSync(PROCESSED_DIR)) {
      return [];
    }

    const files = fs.readdirSync(PROCESSED_DIR).filter((f) => f.endsWith('.csv') && f.includes('amenities'));

    for (const file of files) {
      if (file !== 'processed_amenities.csv' && files.includes('processed_amenities.csv')) {
        continue;
      }

      const rows = safeReadCsv(path.join(PROCESSED_DIR, file));
      if (!rows) continue;

      for (const row of rows) {
        if (!row.lat || !row.lon || !row.amenity_type) continue;

        amenities.push({
          lat: parseFloat(row.lat) || 0,
          lon: parseFloat(row.lon) || 0,
          amenity_type: row.amenity_type,
          name: row.name || 'Unnamed Facility',
          geography_name: row.geography_name || '',
          retrieved_at: row.retrieved_at || '',
          source_name: row.source_name || 'OSM',
          data_status: (row.data_status || 'synthetic_test') as DataStatus,
        });
      }
    }

    if (filters.geography) {
      const geoLower = filters.geography.toLowerCase();
      amenities = amenities.filter((a) => a.geography_name.toLowerCase() === geoLower);
    }

    if (filters.amenity_type) {
      const typeLower = filters.amenity_type.toLowerCase();
      amenities = amenities.filter((a) => a.amenity_type.toLowerCase() === typeLower);
    }

    return amenities;
  },

  getSummary(): DataSummary {
    const observations = this.getObservations({});
    const qualityReports = this.getQualityReports();

    const geographies = Array.from(new Set(observations.map((o) => o.geography_name))).sort();
    const metricTypes = Array.from(new Set(observations.map((o) => o.metric_name))).sort();

    const dates = observations.map((o) => o.observation_date).filter(Boolean).sort();
    const minDate = dates.length > 0 ? dates[0] : null;
    const maxDate = dates.length > 0 ? dates[dates.length - 1] : null;

    const breakdown: Record<DataStatus, number> = {
      real: 0,
      synthetic_test: 0,
      unavailable: 0,
    };

    for (const obs of observations) {
      if (breakdown[obs.data_status] !== undefined) {
        breakdown[obs.data_status]++;
      }
    }

    // Determine latest ingestion timestamp from quality reports
    let lastIngestion: string | null = null;
    for (const rep of qualityReports) {
      if (!lastIngestion || rep.generated_at > lastIngestion) {
        lastIngestion = rep.generated_at;
      }
    }

    return {
      total_observations: observations.length,
      total_datasets: qualityReports.length,
      geographies,
      metric_types: metricTypes,
      date_coverage: { min: minDate, max: maxDate },
      data_status_breakdown: breakdown,
      last_ingestion_at: lastIngestion,
    };
  },

  getRegisteredSources(): DataSource[] {
    const reports = this.getQualityReports();
    const hasRealHpi = reports.some((r) => r.dataset_name.includes('hpi') && r.data_status === 'real');
    const hasRealOsm = reports.some((r) => r.dataset_name.includes('amenities') && r.data_status === 'real');
    const hasTestFixtures = reports.some((r) => r.data_status === 'synthetic_test');

    const sources: DataSource[] = [
      {
        id: 'rbi-hpi',
        name: 'Reserve Bank of India House Price Index (HPI)',
        url: 'https://data.rbi.org.in',
        description:
          'Official quarterly housing price index tracking residential price movements across major Indian tier-1 urban agglomerations based on official transaction registration values.',
        metric_types: ['hpi_assessment'],
        geography_level: 'city',
        geographic_coverage: [
          'All India',
          'Mumbai',
          'Delhi',
          'Bengaluru',
          'Chennai',
          'Kolkata',
          'Ahmedabad',
          'Jaipur',
          'Kanpur',
          'Lucknow',
        ],
        temporal_coverage: { start: '2010-06-30', end: '2025-03-31' },
        frequency: 'Quarterly',
        unit: 'index_points',
        license: 'Government of India Open Data License (Attribution Required)',
        access_method: 'Manual browser-based CSV export from DBIE portal into data/raw/',
        status: hasRealHpi ? 'integrated' : 'investigated_only',
        limitations: [
          'Dimensionless index points (relative to base year), NOT ₹/sqft transaction prices',
          'Aggregate metropolitan level only; sub-district or neighborhood disaggregation unavailable',
          'Portal interactive session requirement prevents automated server-side scraping',
        ],
        retrieved_at: hasRealHpi ? new Date().toISOString() : null,
      },
      {
        id: 'nhb-residex',
        name: 'National Housing Bank (NHB) RESIDEX',
        url: 'https://residex.nhbonline.org.in',
        description:
          'Comprehensive housing index for 50+ Indian metropolitan regions measuring HPI@Assessment Prices and HPI@Market Prices for under-construction properties.',
        metric_types: ['hpi_assessment', 'hpi_market'],
        geography_level: 'city',
        geographic_coverage: ['50+ Indian Metropolitan Cities'],
        temporal_coverage: { start: '2013-01-01', end: '2024-06-30' },
        frequency: 'Quarterly',
        unit: 'index_points',
        license: 'NHB Public Data Usage Terms',
        access_method: 'Manual export from RESIDEX portal into data/raw/nhb_residex_raw.csv',
        status: 'investigated_only',
        limitations: [
          'Dimensionless index value series',
          'No programmatic REST API; browser export workflow required',
          'Covers registered housing loan disbursements only',
        ],
        retrieved_at: null,
      },
      {
        id: 'osm-amenities',
        name: 'OpenStreetMap Civic Infrastructure (Overpass)',
        url: 'https://www.openstreetmap.org',
        description:
          'Open-source geospatial vector features capturing neighborhood walkability points of interest: schools, hospitals, transit stops, and public parks.',
        metric_types: ['amenity_count'],
        geography_level: 'neighborhood',
        geographic_coverage: ['Mumbai Metropolitan Region', 'Delhi-NCR', 'Bengaluru Urban'],
        temporal_coverage: null,
        frequency: 'Continuous / Dynamic',
        unit: 'count',
        license: 'Open Data Commons Open Database License (ODbL)',
        access_method: 'Python Overpass utility (osm_fetch.py) or Overpass Turbo export',
        status: hasRealOsm ? 'integrated' : 'investigated_only',
        limitations: [
          'Community-curated dataset with density variations in peri-urban regions',
          'External HTTP access is subject to Overpass public server rate limits',
        ],
        retrieved_at: hasRealOsm ? new Date().toISOString() : null,
      },
      {
        id: 'synthetic-test-fixture',
        name: 'UrbanLens Verification Test Fixture',
        url: 'https://urbanlens.local/fixtures',
        description:
          'Deterministic synthetic test fixture used for pipeline validation, schema conformance checks, and offline CI verification.',
        metric_types: ['hpi_assessment', 'amenity_count'],
        geography_level: 'city',
        geographic_coverage: ['Mumbai', 'Delhi'],
        temporal_coverage: { start: '2020-01-01', end: '2021-10-01' },
        frequency: 'Quarterly',
        unit: 'index_points',
        license: 'MIT / Synthetic Test Data',
        access_method: 'Pre-bundled in server/python/data/fixtures/ via run_pipeline.py --test',
        status: hasTestFixtures ? 'integrated' : 'investigated_only',
        limitations: [
          'Artificially synthesized for integration testing and verification only',
          'Do not use for real market decision-making or investment research',
        ],
        retrieved_at: '2025-01-01T00:00:00Z',
      },
    ];

    return sources;
  },
};
