import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { CardMenuActions } from './CardMenuActions';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, PortfolioTablePayload } from '../../types';

interface PortfolioTableCardCompleteProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

const assetColors = ['bg-red-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];

export function PortfolioTableCardComplete({ card, defaultExpanded = true }: PortfolioTableCardCompleteProps) {
  // === ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS ===
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Safe payload access - card may be undefined during deletion
  const payload = card?.payload as unknown as PortfolioTablePayload | undefined;
  const changePercent = payload?.changePercent || '+0%';
  const isPositive = changePercent.startsWith('+');
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const cardTitle = payload?.title || 'Portfolio Complete';

  // === GUARD CHECK - All hooks must be ABOVE this line ===
  if (!card || !card.id || !payload) {
    return null;
  }

  const handleBuy = (symbol: string) => {
    console.log(`Buy action for ${symbol}`);
  };

  const handleSell = (symbol: string) => {
    console.log(`Sell action for ${symbol}`);
  };

  return (
    <CardWrapper card={card} accentColor="red">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
              <Wallet className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <span className="text-xs font-medium text-red-500 uppercase tracking-wider block mb-1">
                {cardTitle}
              </span>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {payload.totalValue}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {payload.changePercent}
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                24h
              </span>
            </div>
            <CardMenuActions 
              card={card} 
              isExpanded={isExpanded} 
              onToggleExpand={() => setIsExpanded(!isExpanded)} 
            />
          </div>
        </div>

        {/* Allocation Bar */}
        <div className="space-y-3">
          <div className={`h-3 rounded-full overflow-hidden flex ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`}>
            {payload.assets.map((asset, index) => (
              <div
                key={asset.symbol}
                className={`${assetColors[index % assetColors.length]} transition-all duration-500`}
                style={{ width: `${asset.allocation}%` }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {payload.assets.map((asset, index) => (
              <div key={asset.symbol} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${assetColors[index % assetColors.length]}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  {asset.symbol}
                </span>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {asset.allocation}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table - Only visible when expanded */}
        {isExpanded && (
          <>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-xs min-w-0">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-2 pr-2 font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                      Asset
                    </th>
                    <th className={`text-right py-2 px-2 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                      Value
                    </th>
                    <th className={`text-right py-2 px-2 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                      Change
                    </th>
                    <th className={`text-right py-2 px-2 font-semibold border-l whitespace-nowrap ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                      %
                    </th>
                    <th className={`text-center py-2 pl-2 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payload.assets.map((asset, index) => {
                    const assetPositive = asset.changePercent.startsWith('+');
                    const isLast = index === payload.assets.length - 1;
                    return (
                      <tr 
                        key={asset.symbol} 
                        className={!isLast ? `border-b ${theme === 'dark' ? 'border-zinc-800/30' : 'border-gray-50'}` : ''}
                      >
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${assetColors[index % assetColors.length]}`} />
                            <div className="min-w-0">
                              <p className={`font-bold text-xs truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {asset.symbol}
                              </p>
                              <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                                {asset.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={`text-right py-2 px-2 font-semibold text-xs border-l whitespace-nowrap ${theme === 'dark' ? 'text-white border-zinc-800/50' : 'text-gray-900 border-gray-100'}`}>
                          {asset.value}
                        </td>
                        <td className={`text-right py-2 px-2 border-l ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'}`}>
                          <div className="flex items-center justify-end gap-1">
                            <span className={`font-medium text-xs ${assetPositive ? 'text-green-500' : 'text-red-500'}`}>
                              {asset.changePercent}
                            </span>
                            {assetPositive ? (
                              <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className={`text-[10px] ${assetPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>
                            {asset.change}
                          </p>
                        </td>
                        <td className={`text-right py-2 px-2 font-medium text-xs border-l ${theme === 'dark' ? 'text-zinc-300 border-zinc-800/50' : 'text-gray-700 border-gray-100'}`}>
                          {asset.allocation}%
                        </td>
                        <td className={`py-2 pl-2 border-l ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'}`}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleBuy(asset.symbol)}
                              className="flex items-center justify-center w-6 h-6 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                              title={`Buy ${asset.symbol}`}
                            >
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleSell(asset.symbol)}
                              className="flex items-center justify-center w-6 h-6 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              title={`Sell ${asset.symbol}`}
                            >
                              <ArrowDownRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between pt-3 border-t ${
              theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
            }`}>
              <span className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Change: <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{payload.change24h}</span>
              </span>
              <span className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {payload.assets.length} assets
              </span>
            </div>
          </>
        )}
      </div>
    </CardWrapper>
  );
}
