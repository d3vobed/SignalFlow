import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { allQuery, runQuery } from '../db/init.js';

function uuidv4() {
  return crypto.randomUUID();
}

const router = express.Router();

const SOSOVALUE_API = process.env.SOSOVALUE_API_URL || 'https://api.sosovalue.com/v1';
const SOSOVALUE_API_KEY = process.env.SOSOVALUE_API_KEY || '';

// Get market data from SoSoValue
router.get('/market/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    // Try to fetch from SoSoValue API
    let data = null;
    try {
      const response = await axios.get(
        `${SOSOVALUE_API}/market/price/${symbol}`,
        {
          headers: { 'Authorization': `Bearer ${SOSOVALUE_API_KEY}` },
          timeout: 5000
        }
      );
      data = response.data;
    } catch (apiError) {
      console.log('SoSoValue API unavailable, using mock data');
      // Mock data for development
      data = {
        symbol,
        price: Math.random() * 50000 + 20000,
        change24h: Math.random() * 10 - 5,
        volume: Math.random() * 1000000,
        timestamp: new Date().toISOString()
      };
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get market index from SoSoValue
router.get('/index/:indexId', async (req, res) => {
  try {
    const indexId = req.params.indexId;
    
    try {
      const response = await axios.get(
        `${SOSOVALUE_API}/ssi/index/${indexId}`,
        {
          headers: { 'Authorization': `Bearer ${SOSOVALUE_API_KEY}` },
          timeout: 5000
        }
      );
      res.json(response.data);
    } catch (apiError) {
      // Mock index data
      const mockIndex = {
        indexId,
        name: `Index ${indexId}`,
        components: [
          { symbol: 'BTC', weight: 0.4 },
          { symbol: 'ETH', weight: 0.3 },
          { symbol: 'SOL', weight: 0.2 },
          { symbol: 'ARB', weight: 0.1 }
        ],
        value: Math.random() * 50000 + 20000,
        change24h: Math.random() * 10 - 5
      };
      res.json(mockIndex);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news sentiment from SoSoValue
router.get('/sentiment/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    try {
      const response = await axios.get(
        `${SOSOVALUE_API}/sentiment/${symbol}`,
        {
          headers: { 'Authorization': `Bearer ${SOSOVALUE_API_KEY}` },
          timeout: 5000
        }
      );
      res.json(response.data);
    } catch (apiError) {
      // Mock sentiment data
      const mockSentiment = {
        symbol,
        sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        score: Math.random(),
        articles: Math.floor(Math.random() * 100),
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
      };
      res.json(mockSentiment);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache SoSoValue data
router.post('/cache', async (req, res) => {
  try {
    const { symbol, dataType, value, source } = req.body;
    
    if (!symbol || !dataType) {
      return res.status(400).json({ error: 'Symbol and dataType are required' });
    }
    
    const id = uuidv4();
    await runQuery(
      `INSERT INTO sosovalue_data (id, symbol, data_type, value, source)
       VALUES (?, ?, ?, ?, ?)`,
      [id, symbol.toUpperCase(), dataType, value, source || 'sosovalue']
    );
    
    res.json({ id, symbol, dataType, cached: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cached data
router.get('/cache/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = await allQuery(
      'SELECT * FROM sosovalue_data WHERE symbol = ? ORDER BY timestamp DESC LIMIT 50',
      [symbol]
    );
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
