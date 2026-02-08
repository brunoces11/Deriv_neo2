import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Activity, Target, Shield, Zap, Award, BarChart3, PieChart, LineChart } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { CardMenuActions } from './CardMenuActions';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard } from '../../types';

interface PortfolioPerformanceProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

interface PerformanceMetrics {
  totalPnL: number;
  capitalGrowth: number;
  avgReturnPerTrade: number;
  winRate: number;
  expectancy: number;
  avgPayoff: number;
  currentDrawdown: number;
  maxDrawdown: number;
  avgRiskPerTrade: number;
  tradeCount: number;
  recommendation: 'maintain' | 'optimize' | 'reduce-risk' | 'pause' | 'scale';
  capitalCurve: number[];
  productPerformance: {
    name: string;
    profit: number;
    risk: number;
    consistency: number;
  }[];
}

const mockData: PerformanceMetrics = {
  totalPnL: 12450.80,
  capitalGrowth: 24.5,
  avgReturnPerTrade: 145.30,
  winRate: 68.5,
  expectancy: 2.1,
  avgPayoff: 1.85,
  currentDrawdown: 5.2,
  maxDrawdown: 8.7,
  avgRiskPerTrade: 2.3,
  tradeCount: 87,
  recommendation: 'maintain',
  capitalCurve: [10000, 10500, 11200, 10800, 11500, 12100, 11900, 12450],
  productPerformance: [
    { name: 'Binaries', profit: 45, risk: 25, consistency: 85 },
    { name: 'Digitals', profit: 32, risk: 18, consistency: 78 },
    { name: 'CFDs', profit: 18, risk: 42, consistency: 65 },
    { name: 'Synthetics', profit: 28, risk: 22, consistency: 72 },
  ],
};

export function PortfolioPerformance({ card, defaultExpanded = true }: PortfolioPerformanceProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  if (!card || !card.id) {
    return null;
  }

  const data = mockData;
  const isPositivePnL = data.totalPnL > 0;
  const isPositiveGrowth = data.capitalGrowth > 0;

  const recommendationConfig = {
    maintain: { icon: CheckCircle2, text: 'Maintain Strategy', color: 'text-green-500', bg: 'bg-green-500/10' },
    optimize: { icon: Target, text: 'Optimize Parameters', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'reduce-risk': { icon: Shield, text: 'Reduce Risk Exposure', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    pause: { icon: AlertTriangle, text: 'Pause Operations', color: 'text-red-500', bg: 'bg-red-500/10' },
    scale: { icon: Award, text: 'Scale Capital', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  };

  const recommendation = recommendationConfig[data.recommendation];
  const RecommendationIcon = recommendation.icon;

  if (!isExpanded) {
    return (
      <CardWrapper card={card} accentColor="blue" hasOpenDropdown={isMenuDropdownOpen}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
                <BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <span className="text-xs font-medium text-blue-500 uppercase tracking-wider block mb-1">
                  Portfolio Performance
                </span>
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${data.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isPositiveGrowth ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {isPositiveGrowth ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-semibold ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositiveGrowth ? '+' : ''}{data.capitalGrowth}%
                </span>
              </div>
              <CardMenuActions
                card={card}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                onDropdownChange={setIsMenuDropdownOpen}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
              <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Win Rate</div>
              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.winRate}%</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
              <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Trades</div>
              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.tradeCount}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
              <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Drawdown</div>
              <div className="text-lg font-bold text-red-500">{data.currentDrawdown}%</div>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-3 rounded-lg ${recommendation.bg}`}>
            <RecommendationIcon className={`w-4 h-4 ${recommendation.color}`} />
            <span className={`text-sm font-medium ${recommendation.color}`}>{recommendation.text}</span>
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper card={card} accentColor="blue" hasOpenDropdown={isMenuDropdownOpen}>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
              <BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <span className="text-xs font-medium text-blue-500 uppercase tracking-wider block mb-1">
                Portfolio Performance Report
              </span>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Period Analysis
              </h3>
            </div>
          </div>

          <CardMenuActions
            card={card}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onDropdownChange={setIsMenuDropdownOpen}
          />
        </div>

        <div className={`grid grid-cols-4 gap-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-br from-zinc-800/80 to-zinc-800/40' : 'bg-gradient-to-br from-gray-50 to-white'} border ${theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-200/50'}`}>
          <div className="space-y-1">
            <div className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Total PnL</div>
            <div className={`text-2xl font-bold ${isPositivePnL ? 'text-green-500' : 'text-red-500'}`}>
              ${data.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1">
              {isPositivePnL ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${isPositivePnL ? 'text-green-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{data.capitalGrowth}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Capital Growth</div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isPositiveGrowth ? '+' : ''}{data.capitalGrowth}%
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Period</div>
          </div>

          <div className="space-y-1">
            <div className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Return/Trade</div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${data.avgReturnPerTrade.toFixed(2)}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{data.tradeCount} trades</div>
          </div>

          <div className="space-y-1">
            <div className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Expectancy</div>
            <div className={`text-2xl font-bold text-blue-500`}>
              {data.expectancy.toFixed(2)}R
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Math edge</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-3`}>
            <div className="flex items-center gap-2">
              <Target className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Strategy Quality</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Win Rate</span>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.winRate}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${data.winRate}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Payoff</div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.avgPayoff}:1</div>
              </div>
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Expectancy</div>
                <div className="text-lg font-bold text-green-500">{data.expectancy}R</div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-3`}>
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Risk & Exposure</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Current Drawdown</span>
                <span className="text-sm font-bold text-red-500">{data.currentDrawdown}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(data.currentDrawdown / data.maxDrawdown) * 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Max DD</div>
                <div className="text-lg font-bold text-red-500">{data.maxDrawdown}%</div>
              </div>
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Risk/Trade</div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.avgRiskPerTrade}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-3`}>
          <div className="flex items-center gap-2">
            <LineChart className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Capital Curve</h4>
          </div>
          <div className="h-32 flex items-end gap-1">
            {data.capitalCurve.map((value, index) => {
              const maxValue = Math.max(...data.capitalCurve);
              const minValue = Math.min(...data.capitalCurve);
              const height = ((value - minValue) / (maxValue - minValue)) * 100;
              const isProfit = index === 0 ? false : value > data.capitalCurve[index - 1];

              return (
                <div
                  key={index}
                  className={`flex-1 rounded-t transition-all ${isProfit ? 'bg-green-500/70' : 'bg-red-500/70'}`}
                  style={{ height: `${height}%` }}
                  title={`$${value.toLocaleString()}`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Start: ${data.capitalCurve[0].toLocaleString()}</span>
            <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Current: ${data.capitalCurve[data.capitalCurve.length - 1].toLocaleString()}</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-3`}>
          <div className="flex items-center gap-2">
            <PieChart className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Performance by Product</h4>
          </div>
          <div className="space-y-2">
            {data.productPerformance.map((product, index) => (
              <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{product.name}</span>
                  <span className={`text-sm font-bold ${product.profit > 30 ? 'text-green-500' : product.profit > 20 ? 'text-blue-500' : 'text-amber-500'}`}>
                    +{product.profit}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Profit</div>
                    <div className={`h-1 rounded-full mt-1 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${product.profit}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Risk</div>
                    <div className={`h-1 rounded-full mt-1 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${product.risk}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Consistency</div>
                    <div className={`h-1 rounded-full mt-1 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${product.consistency}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-3`}>
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Operational Efficiency</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.tradeCount}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Total Trades</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-blue-500`}>{(data.tradeCount / 30).toFixed(1)}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Trades/Day</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-green-500`}>92%</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Efficiency</div>
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-xl ${recommendation.bg} border-2 ${theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-200/50'}`}>
          <div className="flex items-center gap-3 mb-2">
            <RecommendationIcon className={`w-6 h-6 ${recommendation.color}`} />
            <div>
              <h4 className={`text-sm font-semibold ${recommendation.color}`}>Recommended Action</h4>
              <p className={`text-lg font-bold ${recommendation.color}`}>{recommendation.text}</p>
            </div>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {data.recommendation === 'maintain' && 'Strategy is performing optimally. Continue current approach and monitor for changes.'}
            {data.recommendation === 'optimize' && 'Minor adjustments recommended. Review entry/exit parameters for improved efficiency.'}
            {data.recommendation === 'reduce-risk' && 'Exposure levels above target. Consider reducing position sizes or leverage.'}
            {data.recommendation === 'pause' && 'Strategy performance degraded. Pause trading and review approach before continuing.'}
            {data.recommendation === 'scale' && 'Excellent performance with low risk. Consider increasing capital allocation.'}
          </p>
        </div>
      </div>
    </CardWrapper>
  );
}
