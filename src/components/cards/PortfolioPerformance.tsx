import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target, Shield, Award, BarChart3, PieChart, LineChart } from 'lucide-react';
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
    10000, 10200, 10350, 10500, 10650, 10750, 10900, 11050, 11150,
    11300, 11450, 11550, 11700, 11850, 11950, 12100, 12250, 12450
  ],
  productPerformance: [
    { name: 'Binaries', profit: 45, risk: 25, consistency: 85 },
    { name: 'Digitals', profit: 32, risk: 18, consistency: 78 },
    { name: 'CFDs', profit: 18, risk: 42, consistency: 65 },
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
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
              <BarChart3 className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <span className="text-[10px] font-medium text-blue-500 uppercase tracking-wider block">
                Portfolio Performance
              </span>
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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

        <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-br from-zinc-800/80 to-zinc-800/40' : 'bg-gradient-to-br from-gray-50 to-white'} border ${theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-200/50'} space-y-3`}>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Total PnL</div>
              <div className={`text-xl font-bold ${isPositivePnL ? 'text-green-500' : 'text-red-500'}`}>
                ${data.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1">
                {isPositivePnL ? (
                  <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 text-red-500" />
                )}
                <span className={`text-[10px] font-medium ${isPositivePnL ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositiveGrowth ? '+' : ''}{data.capitalGrowth}%
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Capital Growth</div>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {isPositiveGrowth ? '+' : ''}{data.capitalGrowth}%
              </div>
              <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Period</div>
            </div>

            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Return/Trade</div>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${data.avgReturnPerTrade.toFixed(2)}
              </div>
              <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{data.tradeCount} trades</div>
            </div>

            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Expectancy</div>
              <div className={`text-xl font-bold text-blue-500`}>
                {data.expectancy.toFixed(2)}R
              </div>
              <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Math edge</div>
            </div>
          </div>

          <div className={`grid grid-cols-4 gap-3 pt-3 border-t ${theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-200/50'}`}>
            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Total Trades</div>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {data.tradeCount}
              </div>
              <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Executed</div>
            </div>

            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Per Day</div>
              <div className={`text-xl font-bold text-blue-500`}>
                {(data.tradeCount / 30).toFixed(1)}
              </div>
              <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Avg trades</div>
            </div>

            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Efficiency</div>
              <div className={`text-xl font-bold text-green-500`}>
                92%
              </div>
              <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Operational</div>
            </div>

            <div className="space-y-0.5">
              <div className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Activity</div>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                High
              </div>
              <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Level</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-2`}>
            <div className="flex items-center gap-1.5">
              <Target className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              <h4 className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Strategy Quality</h4>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Win Rate</span>
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.winRate}%</span>
              </div>
              <div className={`h-1 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                <div className={`h-full rounded-full ${theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`} style={{ width: `${data.winRate}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Payoff</div>
                <div className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.avgPayoff}:1</div>
              </div>
              <div>
                <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Expectancy</div>
                <div className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.expectancy}R</div>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-2`}>
            <div className="flex items-center gap-1.5">
              <Shield className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              <h4 className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Risk & Exposure</h4>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Current Drawdown</span>
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.currentDrawdown}%</span>
              </div>
              <div className={`h-1 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                <div className={`h-full rounded-full ${theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`} style={{ width: `${(data.currentDrawdown / data.maxDrawdown) * 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Max DD</div>
                <div className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.maxDrawdown}%</div>
              </div>
              <div>
                <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Risk/Trade</div>
                <div className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.avgRiskPerTrade}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-2`}>
            <div className="flex items-center gap-1.5">
              <LineChart className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              <h4 className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Capital Curve</h4>
            </div>
            <div className="h-24 flex items-end justify-center gap-0.5">
              {data.capitalCurve.map((value, index) => {
                const maxValue = Math.max(...data.capitalCurve);
                const minValue = Math.min(...data.capitalCurve);
                const height = ((value - minValue) / (maxValue - minValue)) * 100;
                const isProfit = index === 0 ? false : value > data.capitalCurve[index - 1];

                return (
                  <div
                    key={index}
                    className={`rounded-t transition-all ${isProfit ? 'bg-green-500/80' : 'bg-red-500/80'}`}
                    style={{
                      height: `${Math.max(height, 2)}%`,
                      minHeight: '2px',
                      width: '12px'
                    }}
                    title={`$${value.toLocaleString()}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(63, 63, 70, 0.5)' : 'rgba(229, 231, 235, 0.8)' }}>
              <div className="flex flex-col">
                <span className={`text-[9px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Start</span>
                <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-600'}`}>${data.capitalCurve[0].toLocaleString()}</span>
              </div>
              <div className="flex flex-col text-center">
                <span className={`text-[9px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Period</span>
                <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-600'}`}>30 days</span>
              </div>
              <div className="flex flex-col text-right">
                <span className={`text-[9px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>Current</span>
                <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-600'}`}>${data.capitalCurve[data.capitalCurve.length - 1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} space-y-2`}>
            <div className="flex items-center gap-1.5">
              <PieChart className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              <h4 className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Performance by Product</h4>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {data.productPerformance.map((product, index) => {
                const profitColor = product.profit > 30 ? 'text-green-500' : product.profit > 20 ? 'text-blue-500' : 'text-amber-500';
                const profitBg = product.profit > 30 ? 'bg-green-500' : product.profit > 20 ? 'bg-blue-500' : 'bg-amber-500';
                const profitBgLight = product.profit > 30 ? 'bg-green-500/10' : product.profit > 20 ? 'bg-blue-500/10' : 'bg-amber-500/10';
                const maxValue = 100;

                return (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-lg border ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}
                  >
                    <div className="p-2 space-y-2">
                      <div className="text-center space-y-0.5">
                        <span className={`text-[10px] font-semibold block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </span>
                        <div className={`inline-flex px-1.5 py-0.5 rounded ${profitBgLight}`}>
                          <span className={`text-xs font-bold ${profitColor}`}>
                            +{product.profit}%
                          </span>
                        </div>
                      </div>

                      <div className="h-20 flex items-end justify-center gap-1.5">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`relative rounded-t overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ height: '60px', width: '12px' }}>
                            <div
                              className={`${profitBg} absolute bottom-0 left-0 right-0 transition-all rounded-t`}
                              style={{ height: `${(product.profit / maxValue) * 100}%` }}
                            />
                          </div>
                          <span className={`text-[8px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>P</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className={`relative rounded-t overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ height: '60px', width: '12px' }}>
                            <div
                              className="bg-red-500/70 absolute bottom-0 left-0 right-0 transition-all rounded-t"
                              style={{ height: `${(product.risk / maxValue) * 100}%` }}
                            />
                          </div>
                          <span className={`text-[8px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>R</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className={`relative rounded-t overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ height: '60px', width: '12px' }}>
                            <div
                              className="bg-blue-500/70 absolute bottom-0 left-0 right-0 transition-all rounded-t"
                              style={{ height: `${(product.consistency / maxValue) * 100}%` }}
                            />
                          </div>
                          <span className={`text-[8px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>S</span>
                        </div>
                      </div>
                    </div>

                    <div className={`absolute top-0 left-0 right-0 h-0.5 ${profitBg} opacity-30`} />
                  </div>
                );
              })}
            </div>

            <div className={`flex items-center justify-center gap-3 pt-1 text-[9px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-green-500/70" />
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-red-500/70" />
                <span>Risk</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-blue-500/70" />
                <span>Stability</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-200/50'}`}>
          <div className="flex items-center gap-2">
            <RecommendationIcon className={`w-4 h-4 ${recommendation.color}`} />
            <div className="flex-1">
              <h4 className={`text-[9px] font-medium ${recommendation.color}`}>Recommended</h4>
              <p className={`text-xs font-bold ${recommendation.color}`}>{recommendation.text}</p>
            </div>
          </div>
          <p className={`text-[10px] mt-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {data.recommendation === 'maintain' && 'Strategy performing optimally. Continue and monitor.'}
            {data.recommendation === 'optimize' && 'Review entry/exit parameters for efficiency.'}
            {data.recommendation === 'reduce-risk' && 'Reduce position sizes or leverage.'}
            {data.recommendation === 'pause' && 'Performance degraded. Review before continuing.'}
            {data.recommendation === 'scale' && 'Excellent performance. Consider scaling capital.'}
          </p>
        </div>
      </div>
    </CardWrapper>
  );
}
