# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently no authentication required for MVP. Production should use JWT/API keys.

## Endpoints

### Signals

#### Get All Signals
```http
GET /signals?symbol=BTC&status=active
```

**Response:**
```json
[
  {
    "id": "uuid",
    "symbol": "BTC",
    "signal_type": "BUY",
    "confidence": 0.85,
    "entry_price": 44500,
    "target_price": 46725,
    "stop_loss": 43165,
    "created_at": "2026-04-28T10:30:00Z",
    "expires_at": "2026-04-29T10:30:00Z",
    "status": "active"
  }
]
```

#### Get Signal by ID
```http
GET /signals/{id}
```

#### Create Signal
```http
POST /signals
Content-Type: application/json

{
  "symbol": "BTC",
  "signal_type": "BUY",
  "confidence": 0.85,
  "entry_price": 44500,
  "target_price": 46725,
  "stop_loss": 43165
}
```

#### Generate AI Signal
```http
POST /signals/generate
Content-Type: application/json

{
  "symbol": "ETH",
  "marketData": {
    "price": 2350,
    "volume": 1500000,
    "change24h": 2.5
  },
  "aiInsight": {
    "sentiment": "bullish",
    "score": 0.78
  }
}
```

#### Update Signal Status
```http
PATCH /signals/{id}
Content-Type: application/json

{
  "status": "closed"
}
```

### Portfolio

#### Get User Portfolio
```http
GET /portfolio/{userId}
```

**Response:**
```json
{
  "userId": "user123",
  "holdings": [
    {
      "id": "uuid",
      "symbol": "BTC",
      "quantity": 0.5,
      "entry_price": 43000,
      "current_price": 44500,
      "pnl": 750
    }
  ],
  "totalValue": 124580,
  "totalPnL": 2450,
  "count": 3
}
```

#### Add Position
```http
POST /portfolio
Content-Type: application/json

{
  "userId": "user123",
  "symbol": "BTC",
  "quantity": 0.5,
  "entry_price": 43000,
  "current_price": 44500
}
```

#### Update Position
```http
PATCH /portfolio/{id}
Content-Type: application/json

{
  "current_price": 45000,
  "quantity": 0.6
}
```

### AI Analysis

#### Get Predictions
```http
GET /ai/predictions?symbol=BTC
```

#### Generate Prediction
```http
POST /ai/predict
Content-Type: application/json

{
  "symbol": "SOL",
  "marketData": {
    "price": 115,
    "volume": 800000
  },
  "features": {
    "rsi": 65,
    "macd": 0.5
  }
}
```

#### Analyze Market Data
```http
POST /ai/analyze
Content-Type: application/json

{
  "symbol": "ARB",
  "marketData": {
    "price": 1.25,
    "volume": 500000,
    "trend": "bullish"
  }
}
```

**Response:**
```json
{
  "symbol": "ARB",
  "timestamp": "2026-04-28T10:30:00Z",
  "indicators": {
    "rsi": 72.5,
    "macd": 0.8,
    "bollingerBands": {
      "upper": 1.275,
      "lower": 1.225,
      "middle": 1.25
    }
  },
  "sentiment": "bullish",
  "recommendation": "BUY"
}
```

### SoSoValue Integration

#### Get Market Data
```http
GET /sosovalue/market/{symbol}
```

**Response:**
```json
{
  "symbol": "BTC",
  "price": 44500,
  "change24h": 1.2,
  "volume": 28500000000,
  "timestamp": "2026-04-28T10:30:00Z"
}
```

#### Get Index Data
```http
GET /sosovalue/index/{indexId}
```

#### Get Sentiment
```http
GET /sosovalue/sentiment/{symbol}
```

**Response:**
```json
{
  "symbol": "BTC",
  "sentiment": "bullish",
  "score": 0.78,
  "articles": 156,
  "trend": "increasing"
}
```

#### Cache Data
```http
POST /sosovalue/cache
Content-Type: application/json

{
  "symbol": "BTC",
  "dataType": "market_data",
  "value": "{...market data...}",
  "source": "sosovalue"
}
```

#### Get Cached Data
```http
GET /sosovalue/cache/{symbol}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 404 Not Found
```json
{
  "error": "Signal not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database connection error"
}
```

## Rate Limiting
- Current: Unlimited (add in production)
- Recommended: 100 requests/minute per IP

## Pagination
Add `?limit=50&offset=0` to list endpoints

## Timestamps
All timestamps are ISO 8601 format (UTC):
```
2026-04-28T10:30:00Z
```

## Examples

### Complete Signal Generation Flow
```bash
# 1. Get market data
curl http://localhost:3001/api/sosovalue/market/BTC

# 2. Get sentiment
curl http://localhost:3001/api/sosovalue/sentiment/BTC

# 3. Generate signal
curl -X POST http://localhost:3001/api/signals/generate \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "marketData": {...},
    "aiInsight": {...}
  }'

# 4. Get signal
curl http://localhost:3001/api/signals
```

---

For more information, see [README.md](../README.md)
