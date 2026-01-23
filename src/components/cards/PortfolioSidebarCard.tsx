import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, PortfolioTablePayload } from '../../types';

interface PortfolioSidebarCardProps {
  card: BaseCard;
}

export function PortfolioSidebarCard({ card }: PortfolioSidebarCardProps) {
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
    <div className="max-w-[256px]">
      <CardWrapper card={card} accentColor="red">
        <div className="space-y-3">
          {/* Header Compacto */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <span className="text-[10px] font-medium text-red-500 uppercase tracking-wider block">
                  Portfolio
                </span>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {payload.totalValue}
                </h3>
              </div>
            </div>

            <div className={`flex items-center gap-0.5 px-1.5 py-1 rounded-md ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <TrendIcon className={`w-3 h-3 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-[10px] font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {payload.changePercent}
              </span>
            </div>
          </div>

        {/* Table Ultra Compacta */}
        <div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                <th className={`text-left py-1.5 pr-2 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Asset
                </th>
                <th className={`text-right py-1.5 px-1 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Value
                </th>
                <th className={`text-right py-1.5 px-1 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Chg / %
                </th>
                <th className={`text-center py-1.5 pl-1 font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  
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
                    <td className="py-2 pr-2">
                      <p className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {asset.symbol}
                      </p>
                      <p className={`text-[9px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                        {asset.name}
                      </p>
                    </td>
                    <td className={`text-right py-2 px-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {asset.value}
                    </td>
                    <td className="text-right py-2 px-1">
                      <span className={assetPositive ? 'text-green-500' : 'text-red-500'}>
                        {asset.changePercent}
                      </span>
                      <span className={`ml-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                        ({asset.allocation}%)
                      </span>
                    </td>
                    <td className="py-2 pl-1">
                      {/* Botões Ultra Compactos */}
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => handleBuy(asset.symbol)}
                          className="flex items-center justify-center w-5 h-5 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                          title={`Buy ${asset.symbol}`}
                        >
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSell(asset.symbol)}
                          className="flex items-center justify-center w-5 h-5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
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

        {/* Footer Compacto */}
        <div className={`flex items-center justify-between pt-2 border-t ${
          theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
        }`}>
          <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
            24h: <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{payload.change24h}</span>
          </span>
          <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
            {payload.assets.length} assets
          </span>
        </div>
      </div>
      </CardWrapper>
    </div>
  );
}
