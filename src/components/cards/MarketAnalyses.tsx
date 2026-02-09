import { useTheme } from '../../store/ThemeContext';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Clock, Activity, ChevronDown, ChevronUp, CircleDashed, Droplets } from 'lucide-react';
import { useState } from 'react';
import type { BaseCard } from '../../types';

interface MarketAnalysesProps {
  card: BaseCard;
}

const CircularGauge = ({ value, theme }: { value: number; theme: string }) => {
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const totalSegments = 36;
  const gapDeg = 4;
  const segmentDeg = (360 / totalSegments) - gapDeg;
  const progressAngle = (value / 100) * 360;

  const activeColor = theme === 'dark' ? '#a1a1aa' : '#6b7280';
  const inactiveColor = theme === 'dark' ? '#27272a' : '#e5e7eb';

  const segments = Array.from({ length: totalSegments }, (_, i) => {
    const startAngle = i * (360 / totalSegments) - 90;
    const endAngle = startAngle + segmentDeg;
    const isActive = (i * (360 / totalSegments)) < progressAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    return { x1, y1, x2, y2, isActive };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={`M ${seg.x1} ${seg.y1} A ${radius} ${radius} 0 0 1 ${seg.x2} ${seg.y2}`}
            stroke={seg.isActive ? activeColor : inactiveColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {value}<span className="text-lg relative -top-3">°</span>
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
      case 'favorable': return theme === 'dark' ? 'text-zinc-300 bg-zinc-700/40' : 'text-gray-600 bg-gray-200/70';
      case 'neutral': return theme === 'dark' ? 'text-zinc-400 bg-zinc-700/30' : 'text-gray-500 bg-gray-200/50';
      case 'desfavorable': return theme === 'dark' ? 'text-zinc-500 bg-zinc-700/20' : 'text-gray-400 bg-gray-200/40';
      default: return theme === 'dark' ? 'text-zinc-500 bg-zinc-700/20' : 'text-gray-500 bg-gray-200/40';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'offensive': return theme === 'dark' ? 'bg-zinc-600 text-zinc-100' : 'bg-gray-700 text-white';
      case 'neutral': return theme === 'dark' ? 'bg-zinc-700 text-zinc-200' : 'bg-gray-500 text-white';
      case 'defensive': return theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-400 text-white';
      default: return theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-500 text-white';
    }
  };

  const getTemperatureColor = (temp: number, themeMode: string) => {
    if (temp >= 70) {
      return {
        bg: themeMode === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200',
        text: themeMode === 'dark' ? 'text-zinc-300' : 'text-gray-700'
      };
    }
    if (temp >= 40) {
      return {
        bg: themeMode === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200',
        text: themeMode === 'dark' ? 'text-zinc-400' : 'text-gray-600'
      };
    }
    return {
      bg: themeMode === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200',
      text: themeMode === 'dark' ? 'text-zinc-500' : 'text-gray-500'
    };
  };

  const temperatureColors = getTemperatureColor(mockData.marketTemperature, theme);

  const CompactedView = () => (
    <div className={`rounded-xl border overflow-hidden ${
      theme === 'dark'
        ? 'bg-zinc-900 border-zinc-800'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 flex items-center justify-between ${
        theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'
          }`}>
            <Activity className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-xs font-medium uppercase tracking-wide leading-tight ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Market<br />Analyses
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
            theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'
          }`}>
            <Activity className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {mockData.regime.volatility}%
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
            theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'
          }`}>
            <Droplets className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {mockData.regime.liquidity}%
            </span>
          </div>

          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${temperatureColors.bg}`}>
            <CircleDashed className={`w-3.5 h-3.5 ${temperatureColors.text}`} />
            <span className={`text-sm font-semibold ${temperatureColors.text}`}>
              {mockData.marketTemperature}°
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-zinc-800 text-zinc-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
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
                      className={`h-full rounded-full transition-all ${
                        theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'
                      }`}
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
                      className={`h-full rounded-full transition-all ${
                        theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${mockData.regime.liquidity}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {mockData.regime.liquidity}
                  </span>
                </div>
              </div>
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
                    className={`rounded-l-full ${theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`}
                    style={{ width: `${mockData.sentiment.buyPressure}%` }}
                  />
                  <div
                    className={`rounded-r-full ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-500'}`}
                    style={{ width: `${mockData.sentiment.sellPressure}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
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
            <div className="flex-shrink-0">
              <CircularGauge value={mockData.marketTemperature} theme={theme} />
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
                      theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'
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
              <Clock className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              Operational Timing
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Current Status
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  theme === 'dark' ? 'bg-zinc-700/50 text-zinc-300' : 'bg-gray-200 text-gray-600'
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
                    className={`h-full rounded-full transition-all ${theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`}
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
              <TrendingUp className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
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
