import express from 'express';
import crypto from 'crypto';
import { allQuery, getQuery, runQuery } from '../db/init.js';

function uuidv4() {
  return crypto.randomUUID();
}

const router = express.Router();

// Get portfolio for user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const holdings = await allQuery(
      'SELECT * FROM portfolio WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);
    const totalPnL = holdings.reduce((sum, h) => sum + (h.pnl || 0), 0);
    
    res.json({
      userId,
      holdings,
      totalValue,
      totalPnL,
      count: holdings.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add position to portfolio
router.post('/', async (req, res) => {
  try {
    const { userId, symbol, quantity, entry_price, current_price } = req.body;
    
    if (!userId || !symbol || !quantity || !entry_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const id = uuidv4();
    const pnl = (current_price || entry_price - entry_price) * quantity;
    
    await runQuery(
      `INSERT INTO portfolio (id, user_id, symbol, quantity, entry_price, current_price, pnl)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, symbol.toUpperCase(), quantity, entry_price, current_price || entry_price, pnl]
    );
    
    const position = await getQuery('SELECT * FROM portfolio WHERE id = ?', [id]);
    res.json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update position
router.patch('/:id', async (req, res) => {
  try {
    const { current_price, quantity } = req.body;
    
    const position = await getQuery('SELECT * FROM portfolio WHERE id = ?', [req.params.id]);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    const newPrice = current_price || position.current_price;
    const newQuantity = quantity !== undefined ? quantity : position.quantity;
    const newPnL = (newPrice - position.entry_price) * newQuantity;
    
    await runQuery(
      'UPDATE portfolio SET current_price = ?, quantity = ?, pnl = ? WHERE id = ?',
      [newPrice, newQuantity, newPnL, req.params.id]
    );
    
    const updated = await getQuery('SELECT * FROM portfolio WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
