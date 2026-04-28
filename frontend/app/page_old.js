'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, AlertCircle, CheckCircle, Brain, Zap as ZapIcon, BarChart3, Wallet, ArrowUpRight, ArrowDownLeft, Lock, Lightbulb, GitBranch } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [signalsRes, portfolioRes] = await Promise.all([
        axios.get(`${API_BASE}/signals?status=active`),
        axios.get(`${API_BASE}/portfolio/demo-user`)
      ]);
      
      setSignals(signalsRes.data);
      setPortfolio(portfolioRes.data.holdings || []);
      
      // Fetch market data for BTC and ETH
      const btcMarket = await axios.get(`${API_BASE}/sosovalue/market/BTC`).catch(() => ({ data: {} }));
      const ethMarket = await axios.get(`${API_BASE}/sosovalue/market/ETH`).catch(() => ({ data: {} }));
      
      setMarketData({
        BTC: btcMarket.data,
        ETH: ethMarket.data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    { time: '00:00', price: 42000, signal: 41900 },
    { time: '04:00', price: 42500, signal: 42400 },
    { time: '08:00', price: 41800, signal: 41900 },
    { time: '12:00', price: 43200, signal: 43100 },
    { time: '16:00', price: 43800, signal: 43700 },
    { time: '20:00', price: 44200, signal: 44100 },
    { time: '24:00', price: 44500, signal: 44400 }
  ];

  const performanceData = [
    { signal: 'Buy BTC', gain: 3.2, winRate: 78 },
    { signal: 'Sell ETH', gain: -1.5, winRate: 65 },
    { signal: 'Buy SOL', gain: 5.1, winRate: 82 },
    { signal: 'Hold ARB', gain: 0.8, winRate: 72 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header onShowHero={() => setShowHero(!showHero)} />
      
      {showHero && <HeroSection onClose={() => setShowHero(false)} />}
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <TabButton label="📊 Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <TabButton label="⚡ Signals" active={activeTab === 'signals'} onClick={() => setActiveTab('signals')} />
          <TabButton label="📈 Analysis" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
          <TabButton label="👛 Portfolio" active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
          <TabButton label="🔧 How It Works" active={activeTab === 'howitworks'} onClick={() => setActiveTab('howitworks')} />
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard title="Active Signals" value={signals.length} icon={<Zap className="w-6 h-6" />} trend="up" change="+12%" />
              <MetricCard title="Portfolio Value" value="$124,580" icon={<Wallet className="w-6 h-6" />} trend="up" change="+8.2%" />
              <MetricCard title="Win Rate" value="76%" icon={<CheckCircle className="w-6 h-6" />} trend="stable" change="↔ 2%" />
              <MetricCard title="Risk Score" value="4.2/10" icon={<AlertCircle className="w-6 h-6" />} trend="down" change="-1.5" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SignalsList signals={signals} loading={loading} />
              </div>
              <div className="space-y-6">
                <StatsCard title="Quick Stats" stats={[
                  { label: 'Total Trades', value: '128', color: 'blue' },
                  { label: 'Avg Return', value: '+3.2%', color: 'green' },
                  { label: 'Max Drawdown', value: '-2.1%', color: 'red' }
                ]} />
                <PerformanceCard />
              </div>
            </div>
          </>
        )}

        {/* Signals Tab */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Trading Signals</h2>
              <SignalsList signals={signals} loading={loading} expanded={true} />
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="BTC Price Action" data={chartData} />
              <ChartCard title="Signal Performance" data={performanceData} isBar={true} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketIndicators />
              <SentimentAnalysis />
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <PortfolioTable holdings={portfolio} />
        )}

        {/* How It Works Tab */}
        {activeTab === 'howitworks' && (
          <HowItWorks />
        )}
      </main>

      <Footer />
    </div>
  );
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <TabButton
            label="Trading Signals"
            active={activeTab === 'signals'}
            onClick={() => setActiveTab('signals')}
          />
          <TabButton
            label="Market Analysis"
            active={activeTab === 'analysis'}
            onClick={() => setActiveTab('analysis')}
          />
          <TabButton
            label="Portfolio"
            active={activeTab === 'portfolio'}
            onClick={() => setActiveTab('portfolio')}
          />
        </div>

        {/* Content */}
        {activeTab === 'signals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SignalsList signals={signals} loading={loading} />
            </div>
            <div>
              <PerformanceCard data={performanceData} />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="BTC Price Action" data={chartData} />
            <ChartCard title="Signal Performance" data={performanceData} isBar={true} />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTable holdings={portfolio} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SignalFlow
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Powered by SoSoValue</span>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}

function MetricCard({ title, value, icon, trend, change }) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <div className="text-slate-500">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className={`text-sm mt-1 ${trendColor}`}>{change}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function SignalsList({ signals, loading }) {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
        Loading signals...
      </div>
    );
  }

  const displaySignals = signals.slice(0, 10);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Active Trading Signals</h2>
      </div>
      <div className="divide-y divide-slate-700">
        {displaySignals.length === 0 ? (
          <div className="p-6 text-center text-slate-400">No active signals</div>
        ) : (
          displaySignals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))
        )}
      </div>
    </div>
  );
}

function SignalRow({ signal }) {
  const signalColor =
    signal.signal_type === 'BUY'
      ? 'text-green-400 bg-green-400/10'
      : signal.signal_type === 'SELL'
      ? 'text-red-400 bg-red-400/10'
      : 'text-slate-400 bg-slate-400/10';

  return (
    <div className="px-6 py-4 hover:bg-slate-700/50 transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-white">{signal.symbol}</h3>
            <span className={`px-2 py-1 rounded text-sm font-medium ${signalColor}`}>
              {signal.signal_type}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Active</span>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>Entry: ${signal.entry_price?.toFixed(2)}</span>
            <span>Target: ${signal.target_price?.toFixed(2)}</span>
            <span>Stop: ${signal.stop_loss?.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-white">
            {(signal.confidence * 100).toFixed(0)}%
          </div>
          <div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${signal.confidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceCard({ data }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{item.signal}</span>
            <div className="flex items-center gap-2">
              <span className={item.gain >= 0 ? 'text-green-400' : 'text-red-400'}>
                {item.gain > 0 ? '+' : ''}{item.gain}%
              </span>
              <span className="text-xs text-slate-400">{item.winRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, data, isBar }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {isBar ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="signal" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Bar dataKey="gain" fill="#3b82f6" />
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function PortfolioTable({ holdings }) {
  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Portfolio Holdings</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
            <p className="text-sm text-green-400">+8.2%</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Entry Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Current Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {holdings.map((holding) => (
              <tr key={holding.id} className="hover:bg-slate-700/50 transition">
                <td className="px-6 py-4 font-medium text-white">{holding.symbol}</td>
                <td className="px-6 py-4 text-slate-300">{holding.quantity.toFixed(4)}</td>
                <td className="px-6 py-4 text-slate-300">${holding.entry_price.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-300">${holding.current_price.toFixed(2)}</td>
                <td className={`px-6 py-4 font-medium ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {holding.pnl > 0 ? '+' : ''}{holding.pnl.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-800/50 border-t border-slate-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-white mb-3">SignalFlow</h3>
            <p className="text-sm text-slate-400">AI-powered trading signals powered by SoSoValue</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Discord</a></li>
              <li><a href="#" className="hover:text-white transition">Twitter</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Partners</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="https://sosovalue.com" className="hover:text-white transition">SoSoValue</a></li>
              <li><a href="https://sodex.com" className="hover:text-white transition">SoDEX</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 flex items-center justify-between">
          <p className="text-sm text-slate-400">&copy; 2026 SignalFlow. All rights reserved.</p>
          <p className="text-sm text-slate-400">Built for the SoSoValue Buildathon</p>
        </div>
      </div>
    </footer>
  );
}
