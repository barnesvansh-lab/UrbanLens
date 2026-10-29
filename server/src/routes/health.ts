import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

router.get('/health', (_req, res) => {
  const processedDir = path.resolve(__dirname, '../../python/data/processed');
  let dataAvailable = false;
  try {
    dataAvailable = fs.readdirSync(processedDir).some((f) => f.endsWith('.csv') || f.endsWith('.json'));
  } catch {
    /* directory may not exist */
  }

  res.json({
    status: 'ok',
    service: 'UrbanLens API',
    version: '0.2.0',
    mode: dataAvailable ? 'data' : 'demo',
    data_available: dataAvailable,
    timestamp: new Date().toISOString(),
  });
});

export default router;
