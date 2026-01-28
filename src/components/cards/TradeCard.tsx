import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, Minus, Plus, ExternalLink } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, TradeCardPayload } from '../../types';

interface TradeCardProps {
  card: BaseCard;
}

/**
 * TradeCard Component
 * 
 * Provides a full trading interface matching the Deriv platform design.
 * Displays trade configuration with duration, barrier, stake sections
 * and Higher/Lower action buttons.
 * 
 * This is a read-only simulation card - all data comes from the payload.
 * Buttons trigger simulated trade execution via console.log.
 */
export function TradeCard({ card }: TradeCardProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as TradeCardPayload;
  
  // Local state for UI interactions (simulated)
  const [durationMode, setDurationMode] = useState<'duration' | 'end-time'>(payload?.duration?.mode || 'duration');
  const [stakeMode, setStakeMode] = useState<'stake' | 'payout'>(payload?.stake?.mode || 'stake');
  const [stakeValue, setStakeValue] = useState(payload?.stake?.value || 10);

  // Default values for safety
  const asset = payload?.asset || 'BTC/USD';
  const assetName = payload?.assetName || 'Bitcoin';
  const tradeType = payload?.tradeType || 'higher-lower';
  const duration = payload?.duration || {
    mode: 'duration',
    unit: 'days',
    value: 5,
    range: { min: 1, max: 365 },
    expiryDate: '28 Jan 2025, 23:59:59 GMT',
  };
  const barrier = payload?.barrier || {
    value: 42500.00,
    spotPrice: 42350.75,
  };
  const stake = payload?.stake || {
    mode: 'stake',
    value: 10.00,
    currency: 'USD',
  };
  const payout = payload?.payout || {
    higher: { amount: '$19.50', percentage: '95%' },
    lower: { amount: '$19.50', percentage: '95%' },
  };

  /**
   * Format trade type for display
   */
  const formatTradeType = (type: string) => {
    switch (type) {
      case 'higher-lower':
        return 'Higher/Lower';
      case 'rise-fall':
        return 'Rise/Fall';
      case 'touch-no-touch':
        return 'Touch/No Touch';
      default:
        return type;
    }
  };

  /**
   * Format duration unit for display
   */
  const formatDurationUnit = (unit: string) => {
    return unit.charAt(0).toUpperCase() + unit.slice(1);
  };

  /**
   * Handle Higher button click (simulated trade execution)
   */
  const handleHigherClick = () => {
    console.log('[TradeCard] Simulated HIGHER trade execution:', {
      asset,
      tradeType,
      direction: 'higher',
      duration: { ...duration, mode: durationMode },
      barrier: barrier.value,
      stake: stakeValue,
      currency: stake.currency,
      expectedPayout: payout.higher.amount,
    });
  };

  /**
   * Handle Lower button click (simulated trade execution)
   */
  const handleLowerClick = () => {
    console.log('[TradeCard] Simulated LOWER trade execution:', {
      asset,
      tradeType,
      direction: 'lower',
      duration: { ...duration, mode: durationMode },
      barrier: barrier.value,
      stake: stakeValue,
      currency: stake.currency,
      expectedPayout: payout.lower.amount,
    });
  };

  /**
   * Handle stake increment
   */
  const handleStakeIncrement = () => {
    setStakeValue(prev => Math.round((prev + 1) * 100) / 100);
  };

  /**
   * Handle stake decrement
   */
  const handleStakeDecrement = () => {
    setStakeValue(prev => Math.max(1, Math.round((prev - 1) * 100) / 100));
  };

  return (
    <CardWrapper card={card} accentColor="red">
      <div className="space-y-4">

        {/* ===== HEADER SECTION ===== */}
        <div className="space-y-1">
          {/* Trade Type Header */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d0a0]/20 to-[#ff444f]/20 flex items-center justify-center flex-shrink-0">
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 text-[#00d0a0]" />
                <TrendingDown className="w-3 h-3 text-[#ff444f] -ml-1" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatTradeType(tradeType)}
                </span>
                <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
              </div>
            </div>
          </div>
          
          {/* Learn Link */}
          <a 
            href="#" 
            className="flex items-center gap-1 text-xs text-[#ff444f] hover:text-[#ff444f]/80 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              console.log('[TradeCard] Learn about trade type clicked:', tradeType);
            }}
          >
            Learn about this trade type
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Asset Info */}
          <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            {asset} • {assetName}
          </div>
        </div>

        {/* ===== DURATION SECTION ===== */}
        <div className={`rounded-lg p-3 border ${
          theme === 'dark' 
            ? 'bg-zinc-800/50 border-zinc-700/50' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Duration Header with Mode Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Duration
            </span>
            <div className={`flex rounded-md overflow-hidden border ${
              theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'
            }`}>
              <button
                onClick={() => setDurationMode('duration')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  durationMode === 'duration'
                    ? 'bg-[#ff444f] text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Duration
              </button>
              <button
                onClick={() => setDurationMode('end-time')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  durationMode === 'end-time'
                    ? 'bg-[#ff444f] text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                End time
              </button>
            </div>
          </div>

          {/* Duration Input Row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Unit Selector */}
            <div className={`flex items-center gap-1 px-2 py-1.5 rounded-md border cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-700 border-zinc-600 text-zinc-200'
                : 'bg-white border-gray-300 text-gray-700'
            }`}>
              <span className="text-xs font-medium">{formatDurationUnit(duration.unit)}</span>
              <ChevronDown className="w-3 h-3" />
            </div>

            {/* Duration Value Input */}
            <div className={`flex-1 px-3 py-1.5 rounded-md border text-center ${
              theme === 'dark'
                ? 'bg-zinc-700 border-zinc-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <span className="text-sm font-medium">{duration.value}</span>
            </div>
          </div>

          {/* Range Info */}
          <div className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
            Range: {duration.range.min} - {duration.range.max} {duration.unit}
          </div>

          {/* Expiry Date */}
          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            Expires: {duration.expiryDate}
          </div>
        </div>


        {/* ===== BARRIER SECTION ===== */}
        <div className={`rounded-lg p-3 border ${
          theme === 'dark' 
            ? 'bg-zinc-800/50 border-zinc-700/50' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Barrier Header */}
          <div className="mb-2">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Barrier
            </span>
          </div>

          {/* Barrier Value Input */}
          <div className={`px-3 py-2 rounded-md border text-center mb-2 ${
            theme === 'dark'
              ? 'bg-zinc-700 border-zinc-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}>
            <span className="text-sm font-semibold">{barrier.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* Spot Price Reference */}
          <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            Spot: {barrier.spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* ===== STAKE SECTION ===== */}
        <div className={`rounded-lg p-3 border ${
          theme === 'dark' 
            ? 'bg-zinc-800/50 border-zinc-700/50' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Stake Header with Mode Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {stakeMode === 'stake' ? 'Stake' : 'Payout'}
            </span>
            <div className={`flex rounded-md overflow-hidden border ${
              theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'
            }`}>
              <button
                onClick={() => setStakeMode('stake')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  stakeMode === 'stake'
                    ? 'bg-[#ff444f] text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Stake
              </button>
              <button
                onClick={() => setStakeMode('payout')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  stakeMode === 'payout'
                    ? 'bg-[#ff444f] text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Payout
              </button>
            </div>
          </div>

          {/* Stake Input Row */}
          <div className="flex items-center gap-2">
            {/* Decrement Button */}
            <button
              onClick={handleStakeDecrement}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Stake Value Input */}
            <div className={`flex-1 px-3 py-2 rounded-md border text-center ${
              theme === 'dark'
                ? 'bg-zinc-700 border-zinc-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <span className="text-sm font-semibold">{stakeValue.toFixed(2)}</span>
            </div>

            {/* Increment Button */}
            <button
              onClick={handleStakeIncrement}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Currency Label */}
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
              {stake.currency}
            </span>
          </div>

          {/* Calculated Payout/Stake Info */}
          <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            {stakeMode === 'stake' 
              ? `Payout: ~${payout.higher.amount}` 
              : `Required stake: ~$${stakeValue.toFixed(2)}`
            }
          </div>
        </div>


        {/* ===== ACTION BUTTONS ===== */}
        <div className="grid grid-cols-2 gap-3">
          {/* Higher Button */}
          <button
            onClick={handleHigherClick}
            className="flex flex-col items-center justify-center py-3 px-4 rounded-lg bg-[#00d0a0] hover:bg-[#00d0a0]/90 text-white transition-colors shadow-lg shadow-[#00d0a0]/20"
          >
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold text-sm">Higher</span>
            </div>
            <span className="text-base font-bold">{payout.higher.amount}</span>
            <span className="text-xs opacity-80">{payout.higher.percentage}</span>
          </button>

          {/* Lower Button */}
          <button
            onClick={handleLowerClick}
            className="flex flex-col items-center justify-center py-3 px-4 rounded-lg bg-[#ff444f] hover:bg-[#ff444f]/90 text-white transition-colors shadow-lg shadow-[#ff444f]/20"
          >
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="font-semibold text-sm">Lower</span>
            </div>
            <span className="text-base font-bold">{payout.lower.amount}</span>
            <span className="text-xs opacity-80">{payout.lower.percentage}</span>
          </button>
        </div>
      </div>
    </CardWrapper>
  );
}
