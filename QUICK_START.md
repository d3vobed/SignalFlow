# ⚡ SignalFlow - Quick Start Guide

## 🎯 Get Running in 2 Minutes

### Prerequisites
- Node.js 18+ 
- npm/yarn
- 2 terminal windows

### Step 1: One-Time Setup
```bash
cd /home/obx/Desktop/SignalFlow
npm install --prefix backend
npm install --prefix frontend
mkdir -p data
```

### Step 2: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Wait for: `SignalFlow API running on http://localhost:3001`

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api npm run dev
```
Wait for: `✓ Ready in X.Xs`

### Step 4: View Dashboard
Open browser: http://localhost:3000 ✅

---

## 📊 Explore the Demo

### See Active Signals
```bash
curl http://localhost:3001/api/signals
```

### Create New Signal
```bash
curl -X POST http://localhost:3001/api/signals \
  -H "Content-Type: application/json" \
  -d '{
    "symbol":"BTC",
    "signal_type":"BUY",
    "confidence":0.85,
    "entry_price":44500,
    "target_price":46725,
    "stop_loss":43165
  }'
```

### Get Market Data
```bash
curl http://localhost:3001/api/sosovalue/market/BTC
```

---

## 🎮 Dashboard Features

### Tab 1: Trading Signals
- View all active signals
- See confidence scores
- Check entry/target/stop prices
- Real-time updates

### Tab 2: Market Analysis
- Price action chart
- Performance metrics
- Technical indicators
- Sentiment analysis

### Tab 3: Portfolio
- Your holdings
- Entry vs current price
- P&L tracking
- Total portfolio value

---

## 🔧 Configuration

Edit `.env` to customize:

```env
PORT=3001                      # Backend port
NODE_ENV=development           # Environment
SOSOVALUE_API_KEY=your_key    # SoSoValue API
NEXT_PUBLIC_API_URL=http://... # Frontend API URL
```

---

## 📁 Project Structure

```
SignalFlow/
├── frontend/          # React/Next.js dashboard
├── backend/           # Node.js/Express API
├── ai-engine/         # Python signal generator
├── contracts/         # Solidity smart contracts
├── docs/              # Documentation
└── data/              # SQLite database
```

---

## 📚 Full Documentation

- **Main Docs:** [README.md](./README.md)
- **API Reference:** [docs/API.md](./docs/API.md)
- **Deployment:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Submission:** [WAVE1_STATUS.md](./WAVE1_STATUS.md)

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Issues
```bash
# Reset database
rm -rf data/signalflow.db
# Will be recreated on next backend start
```

### API Connection Error
```bash
# Check if backend is running
curl http://localhost:3001/api/signals

# Check logs in Terminal 1 (backend)
# Look for error messages
```

---

## 🧪 Test Everything Works

```bash
# 1. Backend health check
curl http://localhost:3001/health

# 2. Get signals
curl http://localhost:3001/api/signals

# 3. Get market data
curl http://localhost:3001/api/sosovalue/market/BTC

# 4. Create signal
curl -X POST http://localhost:3001/api/signals \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ETH","signal_type":"BUY","confidence":0.8,"entry_price":2350,"target_price":2470,"stop_loss":2280}'

# 5. Get portfolio
curl http://localhost:3001/api/portfolio/demo-user

# Expected: All return JSON responses with no errors ✅
```

---

## 🚀 Next Steps

### Wave 2 (Production Ready)
- [ ] Deploy to cloud (Vercel, Railway, etc)
- [ ] Get elevated SoSoValue API tier
- [ ] Deploy smart contracts to testnet
- [ ] Implement automated trading execution
- [ ] Add advanced ML models

### Launch Business
- [ ] Set up payment processing
- [ ] Create subscription plans
- [ ] Market to traders
- [ ] Scale infrastructure
- [ ] Add more features

---

## 💡 Tips

- **Real Data:** Replace mock data with live SoSoValue API
- **ML Models:** Integrate better ML algorithms in Wave 2
- **Execution:** Add SoDEX integration for automated trades
- **Mobile:** Build React Native app
- **Analytics:** Add user tracking and metrics

---

## 📞 Support

- **Docs:** [README.md](./README.md)
- **API Help:** [docs/API.md](./docs/API.md)
- **SoSoValue:** https://discord.gg/HQuGhhkhUW
- **Issues:** Check GitHub issues or docs/

---

**Happy Building! 🎉**
