import { Router, Request, Response } from 'express';
import { neighborhoodService } from '../services/neighborhoodService';

const router = Router();

// GET /api/transformation/indicators
// Returns the indicator registry, optionally filtered by category or data_status
router.get('/indicators', (req: Request, res: Response) => {
  try {
    const categoryFilter = req.query.category ? String(req.query.category) : undefined;
    const statusFilter = req.query.data_status ? String(req.query.data_status) : undefined;

    // Validate filters
    const validStatuses = ['real', 'unavailable', 'synthetic_test'];
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
        details: 'Run server/python/transformation_indicators.py to generate data',
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

// GET /api/transformation/summary
// Returns city-level HPI trend + indicator registry summary
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
