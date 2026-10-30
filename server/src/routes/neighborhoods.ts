import { Router, Request, Response } from 'express';
import { dataService } from '../services/dataService';
import { neighborhoodService } from '../services/neighborhoodService';
import { validateAmenityQuery } from '../middleware/validateQuery';

const router = Router();

// ── Existing endpoint (M4) — preserve unchanged ───────────────────────────────
// GET /api/neighborhoods/amenities
router.get('/amenities', validateAmenityQuery, (req: Request, res: Response) => {
  try {
    const { geography, amenity_type } = req.query;

    const amenities = dataService.getAmenities({
      geography: geography ? String(geography) : undefined,
      amenity_type: amenity_type ? String(amenity_type) : undefined,
    });

    res.json(amenities);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve neighborhood amenities',
      code: 'AMENITIES_ERROR',
      details: err.message,
    });
  }
});

// ── Milestone 5 endpoints ─────────────────────────────────────────────────────

// GET /api/neighborhoods
// Returns list of available neighborhood regions with analytics
router.get('/', (req: Request, res: Response) => {
  try {
    const payload = neighborhoodService.getAnalyticsPayload();
    if (!payload) {
      return res.status(503).json({
        error: 'Neighborhood analytics data is not available',
        code: 'ANALYTICS_UNAVAILABLE',
        details: 'Run server/python/geo_pipeline.py to generate neighborhood_analytics.json',
      });
    }
    res.json({
      generated_at: payload.generated_at,
      pipeline_version: payload.pipeline_version,
      geographic_scope: payload.geographic_scope,
      total_amenities_loaded: payload.total_amenities_loaded,
      total_amenities_assigned: payload.total_amenities_assigned,
      boundary_methodology: payload.boundary_methodology,
      boundary_warning: payload.boundary_warning,
      data_status: payload.data_status,
      osm_snapshot_date: payload.osm_snapshot_date,
      limitations: payload.limitations,
      regions: payload.regions.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        centroid: r.centroid,
        area_km2: r.area_km2,
        total_amenities: r.total_amenities,
        amenity_density_per_km2: r.amenity_density_per_km2,
        data_status: r.data_status,
      })),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve neighborhoods',
      code: 'NEIGHBORHOODS_ERROR',
      details: err.message,
    });
  }
});

// GET /api/neighborhoods/boundaries
// Returns GeoJSON-compatible bounding box features for all regions.
// NOTE: These are approximate bounding boxes, NOT official MCGM ward boundaries.
router.get('/boundaries', (req: Request, res: Response) => {
  try {
    const payload = neighborhoodService.getAnalyticsPayload();
    if (!payload) {
      // Return documented empty state rather than error
      return res.json({
        type: 'FeatureCollection',
        features: [],
        metadata: {
          status: 'unavailable',
          reason: 'No neighborhood boundary data available. Run geo_pipeline.py first.',
          boundary_type: 'none',
        },
      });
    }

    const features = payload.regions.map((r) => ({
      type: 'Feature',
      id: r.id,
      properties: {
        id: r.id,
        name: r.name,
        description: r.description,
        boundary_type: r.boundary_type,
        boundary_note: r.boundary_note,
        area_km2: r.area_km2,
        total_amenities: r.total_amenities,
        amenity_density_per_km2: r.amenity_density_per_km2,
        data_status: r.data_status,
      },
      geometry: {
        type: 'Polygon',
        // GeoJSON polygon: coordinates are [lon, lat] — counter-clockwise winding
        coordinates: [[
          [r.bbox.lon_min, r.bbox.lat_min],
          [r.bbox.lon_max, r.bbox.lat_min],
          [r.bbox.lon_max, r.bbox.lat_max],
          [r.bbox.lon_min, r.bbox.lat_max],
          [r.bbox.lon_min, r.bbox.lat_min],  // close ring
        ]],
      },
    }));

    res.json({
      type: 'FeatureCollection',
      features,
      metadata: {
        status: 'ok',
        boundary_type: payload.boundary_methodology,
        boundary_warning: payload.boundary_warning,
        osm_snapshot_date: payload.osm_snapshot_date,
        generated_at: payload.generated_at,
        data_status: payload.data_status,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve neighborhood boundaries',
      code: 'BOUNDARIES_ERROR',
      details: err.message,
    });
  }
});

// GET /api/neighborhoods/compare?ids=id1,id2,id3
// Returns side-by-side analytics for multiple regions
router.get('/compare', (req: Request, res: Response) => {
  try {
    const idsParam = String(req.query.ids || '');
    if (!idsParam) {
      return res.status(400).json({
        error: "Query parameter 'ids' is required (comma-separated region ids)",
        code: 'MISSING_IDS',
      });
    }

    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0 || ids.length > 10) {
      return res.status(400).json({
        error: "Parameter 'ids' must contain 1–10 region ids",
        code: 'INVALID_IDS_COUNT',
      });
    }

    // Validate no path traversal
    const invalid = ids.filter((id) => !/^[a-z0-9_-]{1,80}$/i.test(id));
    if (invalid.length > 0) {
      return res.status(400).json({
        error: 'Invalid region id format',
        code: 'INVALID_REGION_ID',
        details: `Invalid ids: ${invalid.join(', ')}`,
      });
    }

    const regions = neighborhoodService.compareRegions(ids);
    if (!regions) {
      return res.status(503).json({
        error: 'Neighborhood analytics data is not available',
        code: 'ANALYTICS_UNAVAILABLE',
      });
    }

    res.json({
      requested_ids: ids,
      found_count: regions.length,
      regions,
      comparison_note: (
        'Comparisons are based on approximate bounding-box sub-regions of South Mumbai. ' +
        'These are NOT official ward boundaries. All data is from a single OSM snapshot.'
      ),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to compare regions',
      code: 'COMPARE_ERROR',
      details: err.message,
    });
  }
});

// GET /api/neighborhoods/:id
// Returns full analytics for a single region
// NOTE: This must come AFTER /amenities, /boundaries, /compare to avoid route conflicts
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');

    // Validate id format — prevent path traversal
    if (!/^[a-z0-9_-]{1,80}$/i.test(id)) {
      return res.status(400).json({
        error: 'Invalid region id format',
        code: 'INVALID_REGION_ID',
        details: 'Region id must contain only alphanumeric characters, hyphens, or underscores',
      });
    }

    const region = neighborhoodService.getRegionById(id);
    if (!region) {
      return res.status(404).json({
        error: `Region '${id}' not found`,
        code: 'REGION_NOT_FOUND',
        details: 'Use GET /api/neighborhoods to list available region ids',
      });
    }

    res.json(region);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve region detail',
      code: 'REGION_ERROR',
      details: err.message,
    });
  }
});

// GET /api/neighborhoods/:id/analytics
// Alias that explicitly returns full analytics (same as /:id but more explicit URL)
router.get('/:id/analytics', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');

    if (!/^[a-z0-9_-]{1,80}$/i.test(id)) {
      return res.status(400).json({
        error: 'Invalid region id format',
        code: 'INVALID_REGION_ID',
      });
    }

    const region = neighborhoodService.getRegionById(id);
    if (!region) {
      return res.status(404).json({
        error: `Region '${id}' not found`,
        code: 'REGION_NOT_FOUND',
      });
    }

    const payload = neighborhoodService.getAnalyticsPayload();
    res.json({
      region,
      context: {
        osm_snapshot_date: payload?.osm_snapshot_date ?? null,
        boundary_type: region.boundary_type,
        boundary_note: region.boundary_note,
        data_integrity_note: (
          'OSM amenity data is a single snapshot. Historical trends cannot be inferred. ' +
          'City-level RBI HPI data is NOT applicable at this geographic level.'
        ),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve region analytics',
      code: 'REGION_ANALYTICS_ERROR',
      details: err.message,
    });
  }
});

export default router;
