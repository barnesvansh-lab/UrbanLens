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
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

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
