import { runQuery, getQuery } from '../db/init.js';
import crypto from 'crypto';

function uuidv4() {
  return crypto.randomUUID();
}

export async function generateSignal(symbol, marketData, aiInsight = {}) {
  const id = uuidv4();
  
  // Calculate signal based on market data and AI insights
  const confidence = calculateConfidence(marketData, aiInsight);
  const signalType = determineSignalType(marketData, aiInsight);
  const entryPrice = marketData.price || 0;
  const targetPrice = calculateTargetPrice(entryPrice, signalType, marketData);
  const stopLoss = calculateStopLoss(entryPrice, signalType);
  
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  const signal = {
    id,
    symbol: symbol.toUpperCase(),
    signal_type: signalType,
    confidence,
    entry_price: entryPrice,
    target_price: targetPrice,
    stop_loss: stopLoss,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
    status: 'active',
    metadata: JSON.stringify({ marketData, aiInsight })
  };
  
  await runQuery(
    `INSERT INTO signals (id, symbol, signal_type, confidence, entry_price, target_price, stop_loss, expires_at, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      signal.id,
      signal.symbol,
      signal.signal_type,
      signal.confidence,
      signal.entry_price,
      signal.target_price,
      signal.stop_loss,
      signal.expires_at,
      signal.metadata
    ]
  );
  
  return signal;
}

function calculateConfidence(marketData, aiInsight) {
  let confidence = 0.5; // baseline
  
  if (marketData.volume && marketData.volume > 1000000) confidence += 0.1;
  if (aiInsight.sentiment === 'bullish') confidence += 0.15;
  if (aiInsight.sentiment === 'bearish') confidence -= 0.1;
  if (aiInsight.score && aiInsight.score > 0.7) confidence += 0.2;
  
  // Cap at 0.95 max
  return Math.min(Math.max(confidence, 0.3), 0.95);
}

function determineSignalType(marketData, aiInsight) {
  const signals = [];
  
  if (aiInsight.sentiment === 'bullish') signals.push('BUY');
  if (aiInsight.sentiment === 'bearish') signals.push('SELL');
  if (aiInsight.trend === 'increasing') signals.push('BUY');
  if (aiInsight.trend === 'decreasing') signals.push('SELL');
  
  if (signals.length === 0) return 'HOLD';
  if (signals.filter(s => s === 'BUY').length > signals.filter(s => s === 'SELL').length) {
    return 'BUY';
  }
  if (signals.filter(s => s === 'SELL').length > signals.filter(s => s === 'BUY').length) {
    return 'SELL';
  }
  
  return 'HOLD';
}

function calculateTargetPrice(entryPrice, signalType, marketData) {
  if (signalType === 'BUY') {
    return entryPrice * 1.05; // 5% upside target
  } else if (signalType === 'SELL') {
    return entryPrice * 0.95; // 5% downside target
  }
  return entryPrice;
}

function calculateStopLoss(entryPrice, signalType) {
  if (signalType === 'BUY') {
    return entryPrice * 0.97; // 3% stop loss
  } else if (signalType === 'SELL') {
    return entryPrice * 1.03; // 3% stop loss
  }
  return entryPrice;
}
