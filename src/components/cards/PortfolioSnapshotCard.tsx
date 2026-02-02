import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { CardMenuActions } from './CardMenuActions';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, PortfolioSnapshotPayload } from '../../types';

interface PortfolioSnapshotCardProps {
  card: BaseCard;
}

const assetColors = ['bg-red-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];

export function PortfolioSnapshotCard({ card }: PortfolioSnapshotCardProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const payload = card.payload as unknown as PortfolioSnapshotPayload;
  const isPositive = payload.changePercent.startsWith('+');
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <CardWrapper card={card} accentColor="red">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="text-xs font-medium text-red-500 uppercase tracking-wider block mb-1">
                Portfolio
              </span>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{payload.totalValue}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-red-500/10' : 'bg-rose-500/10'}`}>
              <TrendIcon className={`w-3.5 h-3.5 ${isPositive ? 'text-red-500' : 'text-rose-500'}`} />
              <span className={`text-sm font-medium ${isPositive ? 'text-red-400' : 'text-rose-400'}`}>
                {payload.changePercent}
              </span>
            </div>
            <CardMenuActions 
              card={card} 
              isExpanded={isExpanded} 
              onToggleExpand={() => setIsExpanded(!isExpanded)} 
            />
          </div>
        </div>

        <div className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
          24h change: <span className={isPositive ? 'text-red-400' : 'text-rose-400'}>{payload.change24h}</span>
        </div>

        <div className={`h-2 rounded-full overflow-hidden flex ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`}>
          {payload.assets.map((asset, index) => (
            <div
              key={asset.symbol}
              className={`${assetColors[index % assetColors.length]} transition-all duration-500`}
              style={{ width: `${asset.allocation}%` }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {payload.assets.map((asset, index) => (
            <div key={asset.symbol} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${assetColors[index % assetColors.length]}`} />
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>{asset.symbol}</span>
              <span className={`text-xs ml-auto ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{asset.allocation}%</span>
            </div>
          ))}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className={`pt-3 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
              {payload.assets.map((asset) => (
                <div key={asset.symbol} className="flex justify-between py-1">
                  <span>{asset.symbol}</span>
                  <span className="font-medium">{asset.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
