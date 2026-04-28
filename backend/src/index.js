import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { initDatabase } from './db/init.js';
import signalsRouter from './routes/signals.js';
import portfolioRouter from './routes/portfolio.js';
import aiRouter from './routes/ai.js';
import sosoValueRouter from './routes/sosoValue.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
await initDatabase();

// Routes
app.use('/api/signals', signalsRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/ai', aiRouter);
app.use('/api/sosovalue', sosoValueRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SignalFlow API',
    version: '1.0.0',
    description: 'AI-powered trading signal generator with SoSoValue integration',
    endpoints: {
      health: '/health',
      signals: '/api/signals',
      portfolio: '/api/portfolio',
      ai: '/api/ai',
      sosoValue: '/api/sosovalue'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`SignalFlow API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
