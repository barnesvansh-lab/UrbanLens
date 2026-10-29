import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import dataRouter from './routes/data';
import neighborhoodsRouter from './routes/neighborhoods';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/data', dataRouter);
app.use('/api/neighborhoods', neighborhoodsRouter);

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
