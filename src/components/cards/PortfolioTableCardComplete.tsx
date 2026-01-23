import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, PortfolioTablePayload } from '../../types';

interface PortfolioTableCardCompleteProps {
  card: BaseCard;
}

const assetColors = ['bg-red-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];

export function PortfolioTableCardComplete({ card }: PortfolioTableCardCompleteProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as PortfolioTablePayload;
  const isPositive = payload.changePercent.startsWith('+');
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

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
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="text-xs font-medium text-red-500 uppercase tracking-wider block mb-1">
                Portfolio Complete
              </span>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {payload.totalValue}
              </h3>
            </div>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {payload.changePercent}
            </span>
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

        {/* Table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 pr-4 font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                  Asset
                </th>
                <th className={`text-right py-3 px-4 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                  Value
                </th>
                <th className={`text-right py-3 px-4 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                  Invested
                </th>
                <th className={`text-right py-3 px-4 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                  Change
                </th>
                <th className={`text-right py-3 px-4 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
                  % Portfolio
                </th>
                <th className={`text-center py-3 pl-4 font-semibold border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>
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
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${assetColors[index % assetColors.length]}`} />
                        <div>
                          <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {asset.symbol}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                            {asset.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`text-right py-4 px-4 font-semibold border-l ${theme === 'dark' ? 'text-white border-zinc-800/50' : 'text-gray-900 border-gray-100'}`}>
                      {asset.value}
                    </td>
                    <td className={`text-right py-4 px-4 border-l ${theme === 'dark' ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-600 border-gray-100'}`}>
                      {asset.invested}
                    </td>
                    <td className={`text-right py-4 px-4 border-l ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`font-medium ${assetPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {asset.changePercent}
                        </span>
                        {assetPositive ? (
                          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${assetPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>
                        {asset.change}
                      </p>
                    </td>
                    <td className={`text-right py-4 px-4 font-medium border-l ${theme === 'dark' ? 'text-zinc-300 border-zinc-800/50' : 'text-gray-700 border-gray-100'}`}>
                      {asset.allocation}%
                    </td>
                    <td className={`py-4 pl-4 border-l ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleBuy(asset.symbol)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-xs font-semibold"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Buy
                        </button>
                        <button
                          onClick={() => handleSell(asset.symbol)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-xs font-semibold"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          Sell
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
            24h change: <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{payload.change24h}</span>
          </span>
          <span className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
            {payload.assets.length} assets
          </span>
        </div>
      </div>
    </CardWrapper>
  );
}
