import { useState, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Target, DollarSign, XCircle, ChevronDown, ChevronUp, MoreVertical, Star, Pencil, Trash2, Calendar } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import type { BaseCard, TradeCardPayload } from '../../types';

interface TradeCardProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

/**
 * TradeCard Component
 * 
 * Compact/expandable card showing an active/executed trade.
 * This is the result after confirming a CreateTradeCard.
 * Displays key trade info: asset, direction, stake, payout, barrier, expiry, status.
 * Can be collapsed to show minimal info or expanded to show full details.
 */
export function TradeCard({ card, defaultExpanded = false }: TradeCardProps) {
  const { theme } = useTheme();
  const { favoriteCard, unfavoriteCard, deleteCardWithTwin } = useChat();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const payload = card.payload as unknown as TradeCardPayload;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  // Keep direction colors for the badge only, icon uses neutral gray
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFavorite = () => {
    if (card.isFavorite) {
      unfavoriteCard(card.id);
    } else {
      favoriteCard(card.id);
    }
    setIsDropdownOpen(false);
  };

  const handleEdit = () => {
    console.log('[TradeCard] Edit trade:', { tradeId });
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    console.log('[TradeCard] Delete trade (deleting twins):', { tradeId, cardId: card.id });
    deleteCardWithTwin(card.id);
    setIsDropdownOpen(false);
  };

  const handleSchedule = () => {
    console.log('[TradeCard] Schedule trade:', { tradeId });
    setIsDropdownOpen(false);
  };

  // Compact view (collapsed)
  if (!isExpanded) {
    return (
      <CardWrapper card={card} accentColor={isHigher ? 'green' : 'red'}>
        <div className="flex items-center gap-3">
          {/* Icon with status indicator - neutral gray */}
          <div className="relative flex-shrink-0">
            <div 
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'
              }`}
            >
              <DirectionIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            </div>
            {/* Status dot */}
            <div 
              className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                theme === 'dark' ? 'border-zinc-900' : 'border-white'
              } ${status === 'open' ? 'bg-cyan-500' : status === 'won' ? 'bg-[#00d0a0]' : status === 'lost' ? 'bg-[#ff444f]' : 'bg-amber-500'}`}
            />
          </div>

          {/* Content - 2 lines */}
          <div className="flex-1 min-w-0">
            {/* Line 1: Asset + Direction */}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {asset}
              </span>
              <span 
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${directionColor}20`, color: directionColor }}
              >
                {directionLabel}
              </span>
            </div>

            {/* Line 2: Stake → Payout */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {stake} → <span className="text-[#00d0a0] font-medium">{payout}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons: Status Tag, Dropdown, Expand */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Status Tag */}
            <span className={`text-xs font-medium px-2 py-1 rounded ${currentStatus.bgColor} ${currentStatus.color}`}>
              {currentStatus.label}
            </span>

            {/* Dropdown Menu (3 dots) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="More options"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-50 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={handleFavorite}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${card.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                    {card.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                  </button>
                  <button
                    onClick={handleEdit}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={handleSchedule}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              )}
            </div>

            {/* Expand Button */}
            <button
              onClick={toggleExpand}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Expanded view
  return (
    <CardWrapper card={card} accentColor={isHigher ? 'green' : 'red'}>
      <div className="space-y-3">
        {/* Header: Asset + Direction + Status + Collapse Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'
              }`}
            >
              <DirectionIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
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
          <div className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${currentStatus.bgColor}`}>
              <span className={`text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>

            {/* Dropdown Menu (3 dots) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="More options"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-50 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={handleFavorite}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${card.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                    {card.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                  </button>
                  <button
                    onClick={handleEdit}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={handleSchedule}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-300 hover:bg-zinc-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={toggleExpand}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
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
