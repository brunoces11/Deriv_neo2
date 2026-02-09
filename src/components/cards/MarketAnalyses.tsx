import { useTheme } from '../../store/ThemeContext';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Clock, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BaseCard } from '../../types';

interface MarketAnalysesProps {
  card: BaseCard;
}

const CircularGauge = ({ value, theme }: { value: number; theme: string }) => {
  const size = 160;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 70) return '#10b981';
    if (val >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme === 'dark' ? '#27272a' : '#e5e7eb'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </span>
        <span className={`text-xs font-medium mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
          TEMPERATURE
        </span>
      </div>
    </div>
  );
};

export function MarketAnalyses({ card }: MarketAnalysesProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const mockData = {
    timestamp: '2026-02-09 14:30:00 UTC',
    scope: 'Global Crypto Markets',
    status: 'trending',
    marketTemperature: 75,
    regime: {
      current: 'Uptrend',
      volatility: 68,
      liquidity: 82,
    },
    sentiment: {
      buyPressure: 72,
      sellPressure: 28,
      riskAppetite: 'high',
      recentChange: 'bullish shift',
    },
    opportunities: [
      { instrument: 'BTC/USD', condition: 'Strong momentum', score: 85 },
      { instrument: 'ETH/USD', condition: 'Breakout pattern', score: 78 },
      { instrument: 'SOL/USD', condition: 'Volume surge', score: 72 },
    ],
    risks: [
      { event: 'Fed announcement', impact: 'medium', time: '2h' },
      { event: 'Resistance zone', impact: 'low', time: 'now' },
    ],
    operationTypes: [
      { type: 'Binary Options', status: 'favorable', score: 82 },
      { type: 'Digital Options', status: 'favorable', score: 76 },
      { type: 'CFDs', status: 'neutral', score: 58 },
      { type: 'Synthetics', status: 'favorable', score: 71 },
    ],
    timing: {
      status: 'entry',
      confidence: 78,
    },
    generalSignal: 'offensive',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'favorable': return 'text-green-500 bg-green-500/10';
      case 'neutral': return 'text-amber-500 bg-amber-500/10';
      case 'desfavorable': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'offensive': return 'bg-green-500 text-white';
      case 'neutral': return 'bg-amber-500 text-white';
      case 'defensive': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const CompactedView = () => (
    <div className={`rounded-xl border overflow-hidden ${
      theme === 'dark'
        ? 'bg-zinc-900 border-zinc-800'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
          }`}>
            <Activity className="w-4 h-4 text-brand-green" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Market Analyses
            </h3>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              {mockData.scope}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-zinc-800 text-zinc-400'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            Market Regime
          </span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {mockData.regime.current}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            General Signal
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${getSignalColor(mockData.generalSignal)}`}>
            {mockData.generalSignal.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              Volatility
            </div>
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {mockData.regime.volatility}%
            </div>
          </div>
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              Liquidity
            </div>
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {mockData.regime.liquidity}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ExpandedView = () => (
    <div className={`rounded-xl border overflow-hidden ${
      theme === 'dark'
        ? 'bg-zinc-900 border-zinc-800'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-5 py-4 border-b ${
        theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
            }`}>
              <Activity className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <h3 className={`text-base font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Market Analyses
              </h3>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
              }`}>
                {mockData.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-zinc-800 text-zinc-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'
          }`}>
            {mockData.scope}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            mockData.status === 'trending' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            {mockData.status}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className={`p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-zinc-800/30 border-zinc-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
            Market Regime & Condition
          </h4>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <CircularGauge value={mockData.marketTemperature} theme={theme} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Current Regime
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {mockData.regime.current}
                  </span>
                </div>
              </div>
              <div>
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Volatility
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                    theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${mockData.regime.volatility}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {mockData.regime.volatility}
                  </span>
                </div>
              </div>
              <div>
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Liquidity
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                    theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${mockData.regime.liquidity}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {mockData.regime.liquidity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-zinc-800/30 border-zinc-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
            Sentiment & Flow
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Buy vs Sell Pressure
                </span>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {mockData.sentiment.buyPressure}% / {mockData.sentiment.sellPressure}%
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden flex ${
                theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
              }`}>
                <div
                  className="bg-green-500"
                  style={{ width: `${mockData.sentiment.buyPressure}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${mockData.sentiment.sellPressure}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Risk Appetite
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  mockData.sentiment.riskAppetite === 'high'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {mockData.sentiment.riskAppetite.toUpperCase()}
                </span>
              </div>
              <div>
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Recent Change
                </div>
                <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {mockData.sentiment.recentChange}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-zinc-800/30 border-zinc-800'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Target className="w-3.5 h-3.5 text-green-500" />
              Opportunities
            </h4>
            <div className="space-y-2">
              {mockData.opportunities.map((opp, idx) => (
                <div key={idx} className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {opp.instrument}
                    </span>
                    <span className="text-xs text-green-500 font-semibold">
                      {opp.score}
                    </span>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                    {opp.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-zinc-800/30 border-zinc-800'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Risks
            </h4>
            <div className="space-y-2">
              {mockData.risks.map((risk, idx) => (
                <div key={idx} className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {risk.event}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      risk.impact === 'high'
                        ? 'bg-red-500/10 text-red-500'
                        : risk.impact === 'medium'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {risk.impact}
                    </span>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                    {risk.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-zinc-800/30 border-zinc-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
            Conditions by Operation Type
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {mockData.operationTypes.map((op, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {op.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(op.status)}`}>
                    {op.status}
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      op.status === 'favorable'
                        ? 'bg-green-500'
                        : op.status === 'neutral'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${op.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-zinc-800/30 border-zinc-800'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              Operational Timing
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Current Status
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  mockData.timing.status === 'entry'
                    ? 'bg-green-500/10 text-green-500'
                    : mockData.timing.status === 'caution'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {mockData.timing.status.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                    Confidence
                  </span>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {mockData.timing.confidence}%
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${mockData.timing.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-zinc-800/30 border-zinc-800'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
              General Market Signal
            </h4>
            <div className="flex items-center justify-center h-16">
              <span className={`text-lg font-bold px-6 py-2 rounded-lg ${getSignalColor(mockData.generalSignal)}`}>
                {mockData.generalSignal.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return isExpanded ? <ExpandedView /> : <CompactedView />;
}
