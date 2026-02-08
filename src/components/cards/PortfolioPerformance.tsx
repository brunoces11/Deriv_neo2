import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Activity, Target, Shield, Award, BarChart3, PieChart, LineChart } from 'lucide-react';
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
  capitalCurve: [
    10000, 10100, 10300, 10250, 10400, 10600, 10550, 10700, 10850, 10800,
    10950, 11100, 11050, 11200, 11350, 11300, 11450, 11600, 11550, 11700,
    11850, 11800, 11950, 12100, 12050, 12200, 12150, 12300, 12250, 12450
  ],
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
              <BarChart3 className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-xs font-medium uppercase tracking-wide leading-tight ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Portfolio<br />Performance
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isPositiveGrowth ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {isPositiveGrowth ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={`text-sm font-semibold ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{data.capitalGrowth}%
              </span>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'}`}>
              <Target className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {data.winRate}%
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
          <div className="h-40 flex items-end gap-0.5">
            {data.capitalCurve.map((value, index) => {
              const maxValue = Math.max(...data.capitalCurve);
              const minValue = Math.min(...data.capitalCurve);
              const height = ((value - minValue) / (maxValue - minValue)) * 100;
              const isProfit = index === 0 ? false : value > data.capitalCurve[index - 1];

              return (
                <div
                  key={index}
                  className={`flex-1 rounded-t transition-all ${isProfit ? 'bg-green-500/80' : 'bg-red-500/80'}`}
                  style={{ height: `${Math.max(height, 2)}%`, minHeight: '2px' }}
                  title={`$${value.toLocaleString()}`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(63, 63, 70, 0.5)' : 'rgba(229, 231, 235, 0.8)' }}>
            <div className="flex flex-col">
              <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Start</span>
              <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-600'}>${data.capitalCurve[0].toLocaleString()}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Period</span>
              <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-600'}>30 days</span>
            </div>
            <div className="flex flex-col text-right">
              <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Current</span>
              <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-600'}>${data.capitalCurve[data.capitalCurve.length - 1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-4`}>
          <div className="flex items-center gap-2">
            <PieChart className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Performance by Product</h4>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {data.productPerformance.map((product, index) => {
              const profitColor = product.profit > 30 ? 'text-green-500' : product.profit > 20 ? 'text-blue-500' : 'text-amber-500';
              const profitBg = product.profit > 30 ? 'bg-green-500' : product.profit > 20 ? 'bg-blue-500' : 'bg-amber-500';
              const profitBgLight = product.profit > 30 ? 'bg-green-500/10' : product.profit > 20 ? 'bg-blue-500/10' : 'bg-amber-500/10';
              const maxValue = 100;

              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}
                >
                  <div className="p-3 space-y-3">
                    <div className="text-center space-y-1">
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </span>
                      <div className={`inline-flex px-2.5 py-1 rounded-lg ${profitBgLight}`}>
                        <span className={`text-base font-bold ${profitColor}`}>
                          +{product.profit}%
                        </span>
                      </div>
                    </div>

                    <div className="h-32 flex items-end justify-between gap-2 px-1">
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={`w-full relative rounded-t overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ height: '100px' }}>
                          <div
                            className={`w-full ${profitBg} absolute bottom-0 left-0 right-0 transition-all rounded-t`}
                            style={{ height: `${(product.profit / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Profit</span>
                        <span className={`text-[10px] font-bold ${profitColor}`}>{product.profit}%</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={`w-full relative rounded-t overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ height: '100px' }}>
                          <div
                            className="w-full bg-red-500/70 absolute bottom-0 left-0 right-0 transition-all rounded-t"
                            style={{ height: `${(product.risk / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Risk</span>
                        <span className="text-[10px] font-bold text-red-500">{product.risk}%</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={`w-full relative rounded-t overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ height: '100px' }}>
                          <div
                            className="w-full bg-blue-500/70 absolute bottom-0 left-0 right-0 transition-all rounded-t"
                            style={{ height: `${(product.consistency / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Stability</span>
                        <span className="text-[10px] font-bold text-blue-500">{product.consistency}%</span>
                      </div>
                    </div>
                  </div>

                  <div className={`absolute top-0 left-0 right-0 h-1 ${profitBg} opacity-30`} />
                </div>
              );
            })}
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
