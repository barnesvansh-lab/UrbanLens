import * as fs from 'fs';
import * as path from 'path';
import {
  NeighborhoodAnalyticsPayload,
  NeighborhoodRegion,
  TransformationPayload,
  TransformationIndicator,
} from '../types/api';

const PROCESSED_DIR = path.resolve(__dirname, '../../python/data/processed');
const ANALYTICS_FILE = path.join(PROCESSED_DIR, 'neighborhood_analytics.json');
const TRANSFORMATION_FILE = path.join(PROCESSED_DIR, 'transformation_indicators.json');

// ── In-memory cache ────────────────────────────────────────────────────────
let analyticsCache: NeighborhoodAnalyticsPayload | null = null;
let transformationCache: TransformationPayload | null = null;

function loadAnalytics(): NeighborhoodAnalyticsPayload | null {
  if (analyticsCache) return analyticsCache;
  if (!fs.existsSync(ANALYTICS_FILE)) return null;
  try {
    const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
    analyticsCache = JSON.parse(raw) as NeighborhoodAnalyticsPayload;
    return analyticsCache;
  } catch (err) {
    console.error('[neighborhoodService] Failed to load neighborhood_analytics.json:', err);
    return null;
  }
}

function loadTransformation(): TransformationPayload | null {
  if (transformationCache) return transformationCache;
  if (!fs.existsSync(TRANSFORMATION_FILE)) return null;
  try {
    const raw = fs.readFileSync(TRANSFORMATION_FILE, 'utf-8');
    transformationCache = JSON.parse(raw) as TransformationPayload;
    return transformationCache;
  } catch (err) {
    console.error('[neighborhoodService] Failed to load transformation_indicators.json:', err);
    return null;
  }
}

// Safe identifier: only allow alphanumeric, hyphens, underscores
function isSafeId(id: string): boolean {
  return /^[a-z0-9_-]{1,80}$/i.test(id);
}

export const neighborhoodService = {
  /**
   * List all available neighborhood regions (summary, no per-amenity detail).
   */
  listRegions(): NeighborhoodRegion[] | null {
    const payload = loadAnalytics();
    if (!payload) return null;
    return payload.regions;
  },

  /**
   * Full analytics payload (used for /api/neighborhoods endpoint).
   */
  getAnalyticsPayload(): NeighborhoodAnalyticsPayload | null {
    return loadAnalytics();
  },

  /**
   * Single region by id.
   */
  getRegionById(id: string): NeighborhoodRegion | null {
    if (!isSafeId(id)) return null;
    const payload = loadAnalytics();
    if (!payload) return null;
    return payload.regions.find((r) => r.id === id) ?? null;
  },

  /**
   * Compare multiple regions by their ids.
   */
  compareRegions(ids: string[]): NeighborhoodRegion[] | null {
    const payload = loadAnalytics();
    if (!payload) return null;
    const safeIds = ids.filter(isSafeId);
    if (safeIds.length === 0) return [];
    return payload.regions.filter((r) => safeIds.includes(r.id));
  },

  /**
   * Full transformation payload.
   */
  getTransformationPayload(): TransformationPayload | null {
    return loadTransformation();
  },

  /**
   * List transformation indicators, optionally filtered by category or data_status.
   */
  listIndicators(filters?: {
    category?: string;
    data_status?: string;
  }): TransformationIndicator[] | null {
    const payload = loadTransformation();
    if (!payload) return null;
    let indicators = payload.indicators;
    if (filters?.category) {
      const cat = filters.category.toLowerCase();
      indicators = indicators.filter((i) => i.category.toLowerCase() === cat);
    }
    if (filters?.data_status) {
      const ds = filters.data_status.toLowerCase();
      indicators = indicators.filter((i) => i.data_status === ds);
    }
    return indicators;
  },
};
