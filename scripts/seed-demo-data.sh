#!/bin/bash

# SignalFlow Demo Data Seeder
# Generates realistic demo data for the buildathon

API_URL="http://localhost:3001/api"

echo "🚀 SignalFlow Demo Data Seeder"
echo "================================"
echo ""

# Create BTC signal
echo "📊 Creating BTC signal..."
curl -s -X POST "$API_URL/signals" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "signal_type": "BUY",
    "confidence": 0.88,
    "entry_price": 44500,
    "target_price": 46725,
    "stop_loss": 43165
  }' > /dev/null

# Create ETH signal
echo "📊 Creating ETH signal..."
curl -s -X POST "$API_URL/signals" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETH",
    "signal_type": "BUY",
    "confidence": 0.76,
    "entry_price": 2350,
    "target_price": 2468,
    "stop_loss": 2280
  }' > /dev/null

# Create SOL signal
echo "📊 Creating SOL signal..."
curl -s -X POST "$API_URL/signals" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "SOL",
    "signal_type": "SELL",
    "confidence": 0.72,
    "entry_price": 115,
    "target_price": 109.25,
    "stop_loss": 118.45
  }' > /dev/null

# Create ARB signal
echo "📊 Creating ARB signal..."
curl -s -X POST "$API_URL/signals" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ARB",
    "signal_type": "HOLD",
    "confidence": 0.64,
    "entry_price": 1.25,
    "target_price": 1.25,
    "stop_loss": 1.25
  }' > /dev/null

# Create portfolio positions
echo "👛 Creating portfolio positions..."
curl -s -X POST "$API_URL/portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "symbol": "BTC",
    "quantity": 0.5,
    "entry_price": 42000,
    "current_price": 44500
  }' > /dev/null

curl -s -X POST "$API_URL/portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "symbol": "ETH",
    "quantity": 5,
    "entry_price": 2200,
    "current_price": 2350
  }' > /dev/null

curl -s -X POST "$API_URL/portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "symbol": "SOL",
    "quantity": 100,
    "entry_price": 108,
    "current_price": 115
  }' > /dev/null

echo ""
echo "✅ Demo data created successfully!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📊 View signals:"
echo "   curl http://localhost:3001/api/signals"
echo ""
