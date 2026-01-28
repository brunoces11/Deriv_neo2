import { TrendingUp, TrendingDown, Clock, Target, DollarSign, XCircle } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, TradeCardPayload } from '../../types';

interface TradeCardProps {
  card: BaseCard;
}

/**
 * TradeCard Component
 * 
 * Compact card showing an active/executed trade.
 * This is the result after confirming a CreateTradeCard.
 * Displays key trade info: asset, direction, stake, payout, barrier, expiry, status.
 */
export function TradeCard({ card }: TradeCardProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as TradeCardPayload;

  const tradeId = payload?.tradeId || 'TRD-000';
  const asset = payload?.asset || 'BTC/USD';
  const direction = payload?.direction || 'higher';
  const stake = payload?.stake || '$100.00';
  const payout = payload?.payout || '$195.00';
  const barrier = payload?.barrier || '772,009.31';
  const expiryDate = payload?.expiryDate || '28 Jan 2026, 23:59:59';
  const status = payload?.status || 'open';
  const profit = payload?.profit;
  const entrySpot = payload?.entrySpot;
  const currentSpot = payload?.currentSpot;

  const isHigher = direction === 'higher' || direction === 'rise';
  const DirectionIcon = isHigher ? TrendingUp : TrendingDown;
  const directionColor = isHigher ? '#00d0a0' : '#ff444f';
  const directionLabel = direction.charAt(0).toUpperCase() + direction.slice(1);

  const statusConfig = {
    open: { color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', label: 'Open' },
    won: { color: 'text-[#00d0a0]', bgColor: 'bg-[#00d0a0]/10', label: 'Won' },
    lost: { color: 'text-[#ff444f]', bgColor: 'bg-[#ff444f]/10', label: 'Lost' },
    sold: { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Sold' },
  };

  const currentStatus = statusConfig[status] || statusConfig.open;

  const handleSellEarly = () => {
    console.log('[TradeCard] Sell early:', { tradeId, asset, direction });
  };

  return (
    <CardWrapper card={card} accentColor={isHigher ? 'green' : 'red'}>
      <div className="space-y-3">
        {/* Header: Asset + Direction + Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${directionColor}20` }}
            >
              <DirectionIcon className="w-4 h-4" style={{ color: directionColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {asset}
                </span>
                <span 
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${directionColor}20`, color: directionColor }}
                >
                  {directionLabel}
                </span>
              </div>
              <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                {tradeId}
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${currentStatus.bgColor}`}>
            <span className={`text-xs font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Trade Details Grid */}
        <div className={`grid grid-cols-2 gap-2 p-2 rounded-lg ${
          theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'
        }`}>
          {/* Stake */}
          <div className="flex items-center gap-1.5">
            <DollarSign className={`w-3 h-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            <div>
              <span className={`text-[10px] block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Stake
              </span>
              <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stake}
              </span>
            </div>
          </div>

          {/* Payout */}
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-[#00d0a0]" />
            <div>
              <span className={`text-[10px] block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Payout
              </span>
              <span className="text-xs font-semibold text-[#00d0a0]">
                {payout}
              </span>
            </div>
          </div>

          {/* Barrier */}
          <div className="flex items-center gap-1.5">
            <Target className={`w-3 h-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            <div>
              <span className={`text-[10px] block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Barrier
              </span>
              <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {barrier}
              </span>
            </div>
          </div>

          {/* Expiry */}
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3 h-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            <div>
              <span className={`text-[10px] block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Expiry
              </span>
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                {expiryDate}
              </span>
            </div>
          </div>
        </div>

        {/* Spot Prices (if available) */}
        {(entrySpot || currentSpot) && (
          <div className={`flex items-center justify-between text-xs px-2 py-1.5 rounded ${
            theme === 'dark' ? 'bg-zinc-800/30' : 'bg-gray-100'
          }`}>
            {entrySpot && (
              <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}>
                Entry: <span className="font-medium">{entrySpot}</span>
              </span>
            )}
            {currentSpot && (
              <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}>
                Current: <span className="font-medium">{currentSpot}</span>
              </span>
            )}
          </div>
        )}

        {/* Profit/Loss (for closed trades) */}
        {profit && status !== 'open' && (
          <div className={`text-center py-2 rounded-lg ${
            profit.startsWith('+') ? 'bg-[#00d0a0]/10' : 'bg-[#ff444f]/10'
          }`}>
            <span className={`text-sm font-bold ${
              profit.startsWith('+') ? 'text-[#00d0a0]' : 'text-[#ff444f]'
            }`}>
              {profit}
            </span>
          </div>
        )}

        {/* Sell Early Button (for open trades) */}
        {status === 'open' && (
          <button
            onClick={handleSellEarly}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Sell Early</span>
          </button>
        )}
      </div>
    </CardWrapper>
  );
}
