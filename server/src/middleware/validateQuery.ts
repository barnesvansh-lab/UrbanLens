import { Request, Response, NextFunction } from 'express';

// Valid date pattern: YYYY-MM-DD
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Alphanumeric + spaces + hyphens + underscores only (no path traversal)
const SAFE_STRING_RE = /^[a-zA-Z0-9 _\-\.]+$/;

export function validateSeriesQuery(req: Request, res: Response, next: NextFunction): void {
  const { geography, metric, start_date, end_date, limit } = req.query;

  // Validate geography
  if (geography !== undefined) {
    const geoStr = String(geography).trim();
    if (geoStr.includes('..') || geoStr.includes('/') || geoStr.includes('\\') || !SAFE_STRING_RE.test(geoStr)) {
      res.status(400).json({
        error: 'Invalid geography parameter. Disallowed characters or path traversal attempt.',
        code: 'INVALID_QUERY_PARAM',
        details: 'geography contains forbidden characters',
      });
      return;
    }
  }

  // Validate metric
  if (metric !== undefined) {
    const metricStr = String(metric).trim();
    if (metricStr.includes('..') || metricStr.includes('/') || metricStr.includes('\\') || !SAFE_STRING_RE.test(metricStr)) {
      res.status(400).json({
        error: 'Invalid metric parameter. Disallowed characters or path traversal attempt.',
        code: 'INVALID_QUERY_PARAM',
        details: 'metric contains forbidden characters',
      });
      return;
    }
  }

  // Validate start_date
  if (start_date !== undefined) {
    const sDate = String(start_date).trim();
    if (!DATE_RE.test(sDate) || isNaN(Date.parse(sDate))) {
      res.status(400).json({
        error: "Invalid start_date format. Expected ISO date format 'YYYY-MM-DD'.",
        code: 'INVALID_DATE_FORMAT',
      });
      return;
    }
  }

  // Validate end_date
  if (end_date !== undefined) {
    const eDate = String(end_date).trim();
    if (!DATE_RE.test(eDate) || isNaN(Date.parse(eDate))) {
      res.status(400).json({
        error: "Invalid end_date format. Expected ISO date format 'YYYY-MM-DD'.",
        code: 'INVALID_DATE_FORMAT',
      });
      return;
    }
  }

  // Validate date range order
  if (start_date !== undefined && end_date !== undefined) {
    const sDate = String(start_date).trim();
    const eDate = String(end_date).trim();
    if (sDate > eDate) {
      res.status(400).json({
        error: 'end_date must be greater than or equal to start_date',
        code: 'INVALID_DATE_RANGE',
        details: `start_date (${sDate}) cannot be after end_date (${eDate})`,
      });
      return;
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (!Number.isInteger(limitNum) || limitNum <= 0) {
      res.status(400).json({
        error: 'limit must be a positive integer',
        code: 'INVALID_LIMIT',
      });
      return;
    }
  }

  next();
}

export function validateAmenityQuery(req: Request, res: Response, next: NextFunction): void {
  const { geography, amenity_type } = req.query;

  if (geography !== undefined) {
    const geoStr = String(geography).trim();
    if (geoStr.includes('..') || geoStr.includes('/') || geoStr.includes('\\') || !SAFE_STRING_RE.test(geoStr)) {
      res.status(400).json({
        error: 'Invalid geography parameter. Disallowed characters or path traversal attempt.',
        code: 'INVALID_QUERY_PARAM',
      });
      return;
    }
  }

  if (amenity_type !== undefined) {
    const typeStr = String(amenity_type).trim();
    if (typeStr.includes('..') || typeStr.includes('/') || typeStr.includes('\\') || !SAFE_STRING_RE.test(typeStr)) {
      res.status(400).json({
        error: 'Invalid amenity_type parameter.',
        code: 'INVALID_QUERY_PARAM',
      });
      return;
    }
  }

  next();
}
