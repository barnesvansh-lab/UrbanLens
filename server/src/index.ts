import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import dataRouter from './routes/data';
import neighborhoodsRouter from './routes/neighborhoods';
import forecastingRouter from './routes/forecasting';
import transformationRouter from './routes/transformation';
import affordabilityRouter from './routes/affordability';

const app = express();
const PORT = process.env.PORT || 3001;

// Universal CORS: allow all origins, headers, and preflight methods
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

// Root welcome & health route
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    name: 'UrbanLens API Gateway',
    version: '0.2.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      data_sources: '/api/data/sources',
      data_series: '/api/data/series',
      neighborhoods: '/api/neighborhoods',
      forecasting: '/api/forecasting/predict',
      transformation: '/api/transformation/summary',
      affordability: '/api/affordability/calculate',
    },
  });
});

app.use('/api', healthRouter);
app.use('/api/data', dataRouter);
app.use('/api/neighborhoods', neighborhoodsRouter);
app.use('/api/forecasting', forecastingRouter);
app.use('/api/transformation', transformationRouter);
app.use('/api/affordability', affordabilityRouter);

// Global error handler — never exposes stack traces
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[UrbanLens API Error]', err.message);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`UrbanLens API v0.2.0 running on http://localhost:${PORT}`);
  });
}

export { app };
export default app;
