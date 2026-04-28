import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../../data/signalflow.db');

let db;

export function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) console.error('Database connection error:', err);
      else console.log('Connected to SQLite database');
    });
  }
  return db;
}

export async function initDatabase() {
  const db = getDb();

  const schema = `
    CREATE TABLE IF NOT EXISTS signals (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      signal_type TEXT NOT NULL,
      confidence REAL NOT NULL,
      entry_price REAL,
      target_price REAL,
      stop_loss REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      status TEXT DEFAULT 'active',
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      quantity REAL NOT NULL,
      entry_price REAL NOT NULL,
      current_price REAL,
      pnl REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_predictions (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      prediction_type TEXT NOT NULL,
      value REAL NOT NULL,
      confidence REAL,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS sosovalue_data (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      data_type TEXT NOT NULL,
      value TEXT,
      source TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
    CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
    CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio(user_id);
    CREATE INDEX IF NOT EXISTS idx_predictions_symbol ON ai_predictions(symbol);
  `;

  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        console.error('Database initialization error:', err);
        reject(err);
      } else {
        console.log('Database schema initialized');
        resolve();
      }
    });
  });
}

export function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
