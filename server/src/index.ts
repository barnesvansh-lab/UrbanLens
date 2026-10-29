import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'UrbanLens API',
    version: '0.1.0',
    mode: 'demo',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`UrbanLens API running on http://localhost:${PORT}`);
});
