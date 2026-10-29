import { Router, Request, Response } from 'express';
import { dataService } from '../services/dataService';
import { validateSeriesQuery } from '../middleware/validateQuery';

const router = Router();

// GET /api/data/sources
router.get('/sources', (_req: Request, res: Response) => {
  try {
    const sources = dataService.getRegisteredSources();
    res.json(sources);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve registered data sources',
      code: 'DATA_SOURCES_ERROR',
      details: err.message,
    });
  }
});

// GET /api/data/series
router.get('/series', validateSeriesQuery, (req: Request, res: Response) => {
  try {
    const { geography, metric, start_date, end_date, limit } = req.query;

    const observations = dataService.getObservations({
      geography: geography ? String(geography) : undefined,
      metric: metric ? String(metric) : undefined,
      start_date: start_date ? String(start_date) : undefined,
      end_date: end_date ? String(end_date) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    });

    res.json(observations);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to query data series',
      code: 'DATA_SERIES_ERROR',
      details: err.message,
    });
  }
});

// GET /api/data/quality
router.get('/quality', (_req: Request, res: Response) => {
  try {
    const reports = dataService.getQualityReports();
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve quality reports',
      code: 'QUALITY_REPORTS_ERROR',
      details: err.message,
    });
  }
});

// GET /api/data/summary
router.get('/summary', (_req: Request, res: Response) => {
  try {
    const summary = dataService.getSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve data summary',
      code: 'DATA_SUMMARY_ERROR',
      details: err.message,
    });
  }
});

export default router;
