import express from 'express';
import crypto from 'crypto';
import { allQuery, getQuery, runQuery } from '../db/init.js';
import { generateSignal } from '../services/signalGenerator.js';

function uuidv4() {
  return crypto.randomUUID();
}

const router = express.Router();

// Get all active signals
router.get('/', async (req, res) => {
  try {
    const symbol = req.query.symbol || '';
    const status = req.query.status || 'active';
    
    let query = 'SELECT * FROM signals WHERE status = ?';
    const params = [status];
    
    if (symbol) {
      query += ' AND symbol = ?';
      params.push(symbol.toUpperCase());
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    const signals = await allQuery(query, params);
    
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get signal by ID
router.get('/:id', async (req, res) => {
  try {
    const signal = await getQuery('SELECT * FROM signals WHERE id = ?', [req.params.id]);
    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate new signal
router.post('/generate', async (req, res) => {
  try {
    const { symbol, marketData, aiInsight } = req.body;
    
    if (!symbol || !marketData) {
      return res.status(400).json({ error: 'Symbol and marketData are required' });
    }
    
    const signal = await generateSignal(symbol, marketData, aiInsight);
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create manual signal
router.post('/', async (req, res) => {
  try {
    const { symbol, signal_type, confidence, entry_price, target_price, stop_loss } = req.body;
    
    if (!symbol || !signal_type || !confidence) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await runQuery(
      `INSERT INTO signals (id, symbol, signal_type, confidence, entry_price, target_price, stop_loss, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, symbol.toUpperCase(), signal_type, confidence, entry_price, target_price, stop_loss, expiresAt]
    );
    
    const signal = await getQuery('SELECT * FROM signals WHERE id = ?', [id]);
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update signal status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    await runQuery(
      'UPDATE signals SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    const signal = await getQuery('SELECT * FROM signals WHERE id = ?', [req.params.id]);
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
