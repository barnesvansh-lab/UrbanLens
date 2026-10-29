import { Router, Request, Response } from 'express';
import { dataService } from '../services/dataService';
import { validateAmenityQuery } from '../middleware/validateQuery';

const router = Router();

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

export default router;
