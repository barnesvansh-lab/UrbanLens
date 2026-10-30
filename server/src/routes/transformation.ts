import { Router, Request, Response } from 'express';
import { neighborhoodService } from '../services/neighborhoodService';
import { transformationAnalysisService } from '../services/transformationAnalysisService';

const router = Router();

// ── 1. GET /api/transformation/overview ───────────────────────────────────────
router.get('/overview', (_req: Request, res: Response) => {
  try {
    const overview = transformationAnalysisService.getOverview();
    if (!overview) {
      return res.status(503).json({
        error: 'Transformation overview data is not available',
        code: 'TRANSFORMATION_OVERVIEW_UNAVAILABLE',
        details: 'Run server/python/transformation/run_transformation.py to generate data',
      });
    }
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation overview',
      code: 'OVERVIEW_ERROR',
      details: err.message,
    });
  }
});

// ── 2. GET /api/transformation/indicators ─────────────────────────────────────
// Preserves Milestone 5 query parameters (category, data_status)
router.get('/indicators', (req: Request, res: Response) => {
  try {
    const categoryFilter = req.query.category ? String(req.query.category) : undefined;
    const statusFilter = req.query.data_status ? String(req.query.data_status) : undefined;

    // Validate status filter
    const validStatuses = ['real', 'unavailable', 'proxy', 'synthetic_test', 'VERIFIED REAL DATA', 'DATA UNAVAILABLE'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      return res.status(400).json({
        error: `Invalid data_status filter. Must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS_FILTER',
      });
    }

    const indicators = neighborhoodService.listIndicators({
      category: categoryFilter,
      data_status: statusFilter,
    });

    if (!indicators) {
      return res.status(503).json({
        error: 'Transformation indicator data is not available',
        code: 'INDICATORS_UNAVAILABLE',
        details: 'Run server/python/transformation/run_transformation.py to generate data',
      });
    }

    const payload = neighborhoodService.getTransformationPayload();

    res.json({
      total: indicators.length,
      filters_applied: {
        category: categoryFilter ?? null,
        data_status: statusFilter ?? null,
      },
      summary: payload?.summary ?? null,
      data_integrity_statement: payload?.data_integrity_statement ?? null,
      indicators,
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation indicators',
      code: 'INDICATORS_ERROR',
      details: err.message,
    });
  }
});

// ── 3. GET /api/transformation/trends ─────────────────────────────────────────
router.get('/trends', (_req: Request, res: Response) => {
  try {
    const trends = transformationAnalysisService.getTrends();
    if (!trends) {
      return res.status(503).json({
        error: 'Transformation trends data is not available',
        code: 'TRENDS_UNAVAILABLE',
        details: 'Run server/python/transformation/run_transformation.py to generate trends data',
      });
    }
    res.json(trends);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation trends',
      code: 'TRENDS_ERROR',
      details: err.message,
    });
  }
});

// ── 4. GET /api/transformation/areas ──────────────────────────────────────────
router.get('/areas', (_req: Request, res: Response) => {
  try {
    const areas = transformationAnalysisService.getAreas();
    res.json({
      total: areas.length,
      geographic_scope: 'South Mumbai Peninsula',
      boundary_type: 'approximate_bounding_box',
      disclaimer: 'Sub-region areas are approximate research extents, not official MCGM wards.',
      areas: areas.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        area_km2: a.area_km2,
        total_amenities: a.total_amenities,
        amenity_density_per_km2: a.amenity_density_per_km2,
        centroid: a.centroid,
        data_status: a.data_status,
      })),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation areas',
      code: 'AREAS_ERROR',
      details: err.message,
    });
  }
});

// ── 5. GET /api/transformation/areas/:id ──────────────────────────────────────
router.get('/areas/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    if (!/^[a-z0-9_-]{1,80}$/i.test(id)) {
      return res.status(400).json({
        error: 'Invalid area id format',
        code: 'INVALID_AREA_ID',
        details: 'Area id must contain only alphanumeric characters, hyphens, or underscores',
      });
    }

    const area = transformationAnalysisService.getAreaById(id);
    if (!area) {
      return res.status(404).json({
        error: `Area '${id}' not found`,
        code: 'AREA_NOT_FOUND',
        details: 'Use GET /api/transformation/areas to list available areas',
      });
    }

    res.json({
      area,
      context: {
        boundary_disclaimer: 'Approximate research bounding box; not an official administrative ward.',
        data_integrity_mandate: (
          'City-level RBI HPI cannot be treated as micro-market transaction prices for this area. ' +
          'Amenity counts are from a single OpenStreetMap snapshot.'
        ),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve area details',
      code: 'AREA_DETAIL_ERROR',
      details: err.message,
    });
  }
});

// ── 6. GET /api/transformation/comparison ─────────────────────────────────────
router.get('/comparison', (req: Request, res: Response) => {
  try {
    const idsParam = String(req.query.ids || '');
    if (!idsParam) {
      return res.status(400).json({
        error: "Query parameter 'ids' is required (comma-separated area ids)",
        code: 'MISSING_IDS',
      });
    }

    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0 || ids.length > 10) {
      return res.status(400).json({
        error: "Parameter 'ids' must contain 1 to 10 area ids",
        code: 'INVALID_IDS_COUNT',
      });
    }

    const invalid = ids.filter((id) => !/^[a-z0-9_-]{1,80}$/i.test(id));
    if (invalid.length > 0) {
      return res.status(400).json({
        error: 'Invalid area id format',
        code: 'INVALID_AREA_ID',
        details: `Invalid ids: ${invalid.join(', ')}`,
      });
    }

    const areas = transformationAnalysisService.compareAreas(ids);
    res.json({
      requested_ids: ids,
      found_count: areas.length,
      areas,
      comparison_disclaimer: (
        'Comparisons assess real civic amenity densities from OpenStreetMap within approximate research extents. ' +
        'Higher density does not imply active gentrification.'
      ),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to compare transformation areas',
      code: 'COMPARISON_ERROR',
      details: err.message,
    });
  }
});

// ── 7. GET /api/transformation/anomalies ───────────────────────────────────────
router.get('/anomalies', (_req: Request, res: Response) => {
  try {
    const anomalies = transformationAnalysisService.getAnomalies();
    if (!anomalies) {
      return res.status(503).json({
        error: 'Transformation anomaly data is not available',
        code: 'ANOMALIES_UNAVAILABLE',
        details: 'Run server/python/transformation/run_transformation.py to generate anomaly data',
      });
    }
    res.json(anomalies);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation anomalies',
      code: 'ANOMALIES_ERROR',
      details: err.message,
    });
  }
});

// ── 8. GET /api/transformation/evidence ───────────────────────────────────────
router.get('/evidence', (_req: Request, res: Response) => {
  try {
    const evidence = transformationAnalysisService.getEvidence();
    if (!evidence) {
      return res.status(503).json({
        error: 'Transformation evidence data is not available',
        code: 'EVIDENCE_UNAVAILABLE',
        details: 'Run server/python/transformation/run_transformation.py to generate evidence assessment',
      });
    }
    res.json(evidence);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation evidence',
      code: 'EVIDENCE_ERROR',
      details: err.message,
    });
  }
});

// ── 9. GET /api/transformation/data-sources ───────────────────────────────────
router.get('/data-sources', (_req: Request, res: Response) => {
  try {
    const sources = transformationAnalysisService.getDataSources();
    res.json({
      total: sources.length,
      sources,
      provenance_mandate: (
        'All data sources undergo strict audit. Unavailable data is documented transparently ' +
        'rather than synthesized or simulated.'
      ),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation data sources',
      code: 'DATA_SOURCES_ERROR',
      details: err.message,
    });
  }
});

// ── 10. GET /api/transformation/quality ───────────────────────────────────────
router.get('/quality', (_req: Request, res: Response) => {
  try {
    const quality = transformationAnalysisService.getQuality();
    if (!quality) {
      return res.status(503).json({
        error: 'Transformation quality data is not available',
        code: 'QUALITY_UNAVAILABLE',
        details: 'Run server/python/transformation/run_transformation.py to generate quality report',
      });
    }
    res.json(quality);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation quality report',
      code: 'QUALITY_ERROR',
      details: err.message,
    });
  }
});

// ── Backward Compatibility: GET /api/transformation/summary (Milestone 5) ────
router.get('/summary', (req: Request, res: Response) => {
  try {
    const payload = neighborhoodService.getTransformationPayload();

    if (!payload) {
      return res.status(503).json({
        error: 'Transformation data is not available',
        code: 'TRANSFORMATION_UNAVAILABLE',
        details: 'Run server/python/transformation_indicators.py to generate data',
      });
    }

    res.json({
      generated_at: payload.generated_at,
      geographic_scope: payload.geographic_scope,
      summary: payload.summary,
      data_integrity_statement: payload.data_integrity_statement,
      hpi_city_trend: payload.hpi_city_trend,
      indicator_categories: [
        ...new Set(payload.indicators.map((i) => i.category)),
      ],
      real_indicator_count: payload.summary.real_indicators,
      unavailable_indicator_count: payload.summary.unavailable_indicators,
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve transformation summary',
      code: 'TRANSFORMATION_SUMMARY_ERROR',
      details: err.message,
    });
  }
});

export default router;
