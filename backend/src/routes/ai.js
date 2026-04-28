import express from 'express';
import crypto from 'crypto';
import { allQuery, getQuery, runQuery } from '../db/init.js';

function uuidv4() {
  return crypto.randomUUID();
}

const router = express.Router();

// Get AI predictions
router.get('/predictions', async (req, res) => {
  try {
    const symbol = req.query.symbol || '';
    
    let query = 'SELECT * FROM ai_predictions WHERE expires_at > datetime("now")';
    const params = [];
    
    if (symbol) {
      query += ' AND symbol = ?';
      params.push(symbol.toUpperCase());
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    const predictions = await allQuery(query, params);
    
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate AI prediction
router.post('/predict', async (req, res) => {
  try {
    const { symbol, marketData, features } = req.body;
    
    if (!symbol || !marketData) {
      return res.status(400).json({ error: 'Symbol and marketData are required' });
    }
    
    // Simple ML simulation - in production, call actual ML model
    const confidence = Math.random() * 0.4 + 0.6; // 60-100%
    const trend = marketData.trend || 'neutral';
    const value = trend === 'bullish' ? Math.random() * 5 + 5 : -Math.random() * 5 - 5;
    
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    
    await runQuery(
      `INSERT INTO ai_predictions (id, symbol, prediction_type, value, confidence, features, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, symbol.toUpperCase(), 'price_movement', value, confidence, JSON.stringify(features || {}), expiresAt]
    );
    
    const prediction = await getQuery('SELECT * FROM ai_predictions WHERE id = ?', [id]);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze market data
router.post('/analyze', async (req, res) => {
  try {
    const { symbol, marketData } = req.body;
    
    if (!symbol || !marketData) {
      return res.status(400).json({ error: 'Symbol and marketData are required' });
    }
    
    // Simulate analysis
    const analysis = {
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      indicators: {
        rsi: Math.random() * 100,
        macd: Math.random() * 2 - 1,
        bollingerBands: {
          upper: marketData.price * 1.02,
          lower: marketData.price * 0.98,
          middle: marketData.price
        }
      },
      sentiment: ['bullish', 'neutral', 'bearish'][Math.floor(Math.random() * 3)],
      recommendation: ['BUY', 'HOLD', 'SELL'][Math.floor(Math.random() * 3)]
    };
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
