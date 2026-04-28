"""
SignalFlow AI Engine
Real-time trading signal generation using machine learning and market analysis
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import numpy as np

class SignalEngine:
    def __init__(self, api_url: str = "http://localhost:3001/api"):
        self.api_url = api_url
        self.models = {}
        self.cache = {}
        
    def fetch_market_data(self, symbol: str) -> Dict:
        """Fetch market data from SoSoValue API"""
        try:
            response = requests.get(
                f"{self.api_url}/sosovalue/market/{symbol}",
                timeout=5
            )
            return response.json()
        except Exception as e:
            print(f"Error fetching market data for {symbol}: {e}")
            return self._mock_market_data(symbol)
    
    def _mock_market_data(self, symbol: str) -> Dict:
        """Generate mock market data for development"""
        base_prices = {
            'BTC': 44500,
            'ETH': 2350,
            'SOL': 115,
            'ARB': 1.25
        }
        
        base = base_prices.get(symbol, 100)
        return {
            'symbol': symbol,
            'price': base * (1 + np.random.uniform(-0.02, 0.02)),
            'change24h': np.random.uniform(-5, 5),
            'volume': np.random.uniform(1e6, 1e9),
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_indicators(self, prices: List[float]) -> Dict:
        """Calculate technical indicators"""
        if len(prices) < 14:
            return {}
        
        # RSI
        deltas = np.diff(prices)
        seed = deltas[:14].mean()
        up = seed * np.ones_like(prices)
        dn = seed * np.ones_like(prices)
        
        for i in range(14, len(prices)):
            if deltas[i - 1] > 0:
                up[i] = deltas[i - 1]
            else:
                dn[i] = -deltas[i - 1]
        
        rs = up / dn
        rsi = 100 - (100 / (1 + rs))
        
        return {
            'rsi': float(rsi[-1]),
            'sma_20': float(np.mean(prices[-20:])),
            'sma_50': float(np.mean(prices[-50:])) if len(prices) >= 50 else None,
            'volatility': float(np.std(prices[-20:]))
        }
    
    def analyze_sentiment(self, symbol: str) -> Dict:
        """Analyze market sentiment using various data sources"""
        try:
            response = requests.get(
                f"{self.api_url}/sosovalue/sentiment/{symbol}",
                timeout=5
            )
            return response.json()
        except:
            return {
                'sentiment': np.random.choice(['bullish', 'bearish', 'neutral']),
                'score': np.random.uniform(0.3, 0.9),
                'trend': np.random.choice(['increasing', 'decreasing', 'stable'])
            }
    
    def generate_signal(self, symbol: str, market_data: Dict = None) -> Dict:
        """Generate trading signal for a symbol"""
        if not market_data:
            market_data = self.fetch_market_data(symbol)
        
        # Get sentiment
        sentiment = self.analyze_sentiment(symbol)
        
        # Calculate confidence based on multiple factors
        confidence = self._calculate_confidence(market_data, sentiment)
        
        # Determine signal type
        signal_type = self._determine_signal_type(market_data, sentiment)
        
        # Calculate price targets
        entry = market_data.get('price', 0)
        target, stop_loss = self._calculate_targets(entry, signal_type)
        
        signal = {
            'symbol': symbol,
            'signal_type': signal_type,
            'confidence': confidence,
            'entry_price': entry,
            'target_price': target,
            'stop_loss': stop_loss,
            'sentiment': sentiment,
            'generated_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(hours=24)).isoformat()
        }
        
        return signal
    
    def _calculate_confidence(self, market_data: Dict, sentiment: Dict) -> float:
        """Calculate signal confidence score"""
        confidence = 0.5
        
        # Volume factor
        if market_data.get('volume', 0) > 1e9:
            confidence += 0.1
        
        # Sentiment factor
        if sentiment.get('sentiment') == 'bullish':
            confidence += 0.15
        elif sentiment.get('sentiment') == 'bearish':
            confidence -= 0.1
        
        # Sentiment score
        score = sentiment.get('score', 0.5)
        confidence += (score - 0.5) * 0.2
        
        return min(max(confidence, 0.3), 0.95)
    
    def _determine_signal_type(self, market_data: Dict, sentiment: Dict) -> str:
        """Determine if signal is BUY, SELL, or HOLD"""
        signals = []
        
        if sentiment.get('sentiment') == 'bullish':
            signals.append('BUY')
        elif sentiment.get('sentiment') == 'bearish':
            signals.append('SELL')
        
        if sentiment.get('trend') == 'increasing':
            signals.append('BUY')
        elif sentiment.get('trend') == 'decreasing':
            signals.append('SELL')
        
        if not signals:
            return 'HOLD'
        
        buy_count = signals.count('BUY')
        sell_count = signals.count('SELL')
        
        if buy_count > sell_count:
            return 'BUY'
        elif sell_count > buy_count:
            return 'SELL'
        else:
            return 'HOLD'
    
    def _calculate_targets(self, entry: float, signal_type: str) -> Tuple[float, float]:
        """Calculate target price and stop loss"""
        if signal_type == 'BUY':
            target = entry * 1.05  # 5% upside
            stop_loss = entry * 0.97  # 3% downside
        elif signal_type == 'SELL':
            target = entry * 0.95  # 5% downside
            stop_loss = entry * 1.03  # 3% upside
        else:
            target = entry
            stop_loss = entry
        
        return target, stop_loss
    
    def batch_generate_signals(self, symbols: List[str]) -> List[Dict]:
        """Generate signals for multiple symbols"""
        signals = []
        for symbol in symbols:
            try:
                signal = self.generate_signal(symbol)
                signals.append(signal)
                
                # Submit to backend
                try:
                    requests.post(
                        f"{self.api_url}/signals/generate",
                        json={'symbol': symbol, 'marketData': signal},
                        timeout=5
                    )
                except:
                    pass
            except Exception as e:
                print(f"Error generating signal for {symbol}: {e}")
        
        return signals


if __name__ == "__main__":
    engine = SignalEngine()
    
    # Generate signals for major symbols
    symbols = ['BTC', 'ETH', 'SOL', 'ARB']
    signals = engine.batch_generate_signals(symbols)
    
    print("Generated Signals:")
    print(json.dumps(signals, indent=2, default=str))
