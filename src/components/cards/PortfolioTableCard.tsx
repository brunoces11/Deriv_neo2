import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, PortfolioTablePayload } from '../../types';

interface PortfolioTableCardProps {
  card: BaseCard;
}

export function PortfolioTableCard({ card }: PortfolioTableCardProps) {
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="text-xs font-medium text-red-500 uppercase tracking-wider block mb-1">
                Portfolio Details
              </span>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {payload.totalValue}
              </h3>
            </div>
          </div>

          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <TrendIcon className={`w-3.5 h-3.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {payload.changePercent}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                <th className={`text-left py-2 pr-3 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Asset
                </th>
                <th className={`text-right py-2 px-2 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Value
                </th>
                <th className={`text-right py-2 px-2 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Invested
                </th>
                <th className={`text-right py-2 px-2 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Change
                </th>
                <th className={`text-right py-2 px-2 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  %
                </th>
                <th className={`text-center py-2 pl-2 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payload.assets.map((asset) => {
                const assetPositive = asset.changePercent.startsWith('+');
                return (
                  <tr 
                    key={asset.symbol} 
                    className={`border-b ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'}`}
                  >
                    <td className="py-2.5 pr-3">
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {asset.symbol}
                      </p>
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                        {asset.name}
                      </p>
                    </td>
                    <td className={`text-right py-2.5 px-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {asset.value}
                    </td>
                    <td className={`text-right py-2.5 px-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      {asset.invested}
                    </td>
                    <td className="text-right py-2.5 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <span className={assetPositive ? 'text-green-500' : 'text-red-500'}>
                          {asset.changePercent}
                        </span>
                        {assetPositive ? (
                          <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5 text-red-500" />
                        )}
                      </div>
                      <p className={`text-[10px] ${assetPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>
                        {asset.change}
                      </p>
                    </td>
                    <td className={`text-right py-2.5 px-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      {asset.allocation}%
                    </td>
                    <td className="py-2.5 pl-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleBuy(asset.symbol)}
                          className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-[10px] font-medium"
                        >
                          <ArrowUpRight className="w-2.5 h-2.5" />
                          Buy
                        </button>
                        <button
                          onClick={() => handleSell(asset.symbol)}
                          className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-[10px] font-medium"
                        >
                          <ArrowDownRight className="w-2.5 h-2.5" />
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
        <div className={`flex items-center justify-between pt-2 border-t ${
          theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
        }`}>
          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
            24h change: <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{payload.change24h}</span>
          </span>
          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
            {payload.assets.length} assets
          </span>
        </div>
      </div>
    </CardWrapper>
  );
}
