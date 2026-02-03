import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import { transformCard as transformCardRule } from '../../services/placeholderRules';
import type { BaseCard, CreateTradeCardPayload, CardType } from '../../types';

interface CreateTradeCardProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

/**
 * CreateTradeCard Component
 * 
 * Compact trading interface for configuring and executing trades.
 * Displays trade configuration with duration, barrier, stake sections
 * and Higher/Lower action buttons.
 * 
 * Features expand/collapse toggle (chevron button only, no three-dots menu).
 */
export function CreateTradeCard({ card, defaultExpanded = true }: CreateTradeCardProps) {
  const { theme } = useTheme();
  const { transformCard } = useChat();
  const payload = card.payload as unknown as CreateTradeCardPayload;
  
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const [durationMode, setDurationMode] = useState<'duration' | 'end-time'>(payload?.duration?.mode || 'duration');
  const [stakeMode, setStakeMode] = useState<'stake' | 'payout'>(payload?.stake?.mode || 'stake');
  const [stakeValue, setStakeValue] = useState(payload?.stake?.value || 10);

  const asset = payload?.asset || 'BTC/USD';
  const tradeType = payload?.tradeType || 'higher-lower';
  const duration = payload?.duration || {
    mode: 'duration',
    unit: 'days',
    value: 5,
    range: { min: 1, max: 365 },
    expiryDate: '28 Jan 2025, 23:59:59 GMT',
  };
  const barrier = payload?.barrier || { value: 42500.00, spotPrice: 42350.75 };
  const payout = payload?.payout || {
    higher: { amount: '$19.50', percentage: '95%' },
    lower: { amount: '$19.50', percentage: '95%' },
  };

  const formatTradeType = (type: string) => {
    switch (type) {
      case 'higher-lower': return 'Higher/Lower';
      case 'rise-fall': return 'Rise/Fall';
      case 'touch-no-touch': return 'Touch/No Touch';
      default: return type;
    }
  };

  const formatDurationUnit = (unit: string) => unit.charAt(0).toUpperCase() + unit.slice(1);

  const handleHigherClick = () => {
    console.log('[TradeCard] HIGHER:', { asset, stakeValue });
    const result = transformCardRule('create-trade-card', 'onHigher', {
      asset,
      assetName: payload?.assetName || 'Bitcoin',
      stake: `$${stakeValue.toFixed(2)}`,
      payout: payout.higher.amount,
      barrier: barrier.value.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      expiryDate: duration.expiryDate,
    });
    if (result) {
      transformCard(card.id, result.newType as CardType, result.newPayload);
    }
  };
  
  const handleLowerClick = () => {
    console.log('[TradeCard] LOWER:', { asset, stakeValue });
    const result = transformCardRule('create-trade-card', 'onLower', {
      asset,
      assetName: payload?.assetName || 'Bitcoin',
      stake: `$${stakeValue.toFixed(2)}`,
      payout: payout.lower.amount,
      barrier: barrier.value.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      expiryDate: duration.expiryDate,
    });
    if (result) {
      transformCard(card.id, result.newType as CardType, result.newPayload);
    }
  };
  const handleStakeIncrement = () => setStakeValue(prev => Math.round((prev + 1) * 100) / 100);
  const handleStakeDecrement = () => setStakeValue(prev => Math.max(1, Math.round((prev - 1) * 100) / 100));

  return (
    <CardWrapper card={card} accentColor="red">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d0a0]/20 to-[#ff444f]/20 flex items-center justify-center flex-shrink-0">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-[#00d0a0]" />
              <TrendingDown className="w-4 h-4 text-[#ff444f] -ml-1.5" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{asset}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ff444f]/20 text-[#ff444f]">{formatTradeType(tradeType)}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                ${stakeValue.toFixed(2)} → <span className="text-[#00d0a0] font-medium">{payout.higher.amount}</span>
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>• {duration.value} {duration.unit}</span>
            </div>
          </div>
          {/* Expand/Collapse Button (no three-dots menu) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3 pt-1">
            {/* Duration */}
            <div className={`rounded-lg p-2 border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Duration</span>
                <div className={`flex rounded overflow-hidden border ${theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'}`}>
                  <button onClick={() => setDurationMode('duration')} className={`px-1.5 py-0.5 text-[10px] font-medium ${durationMode === 'duration' ? 'bg-[#ff444f] text-white' : theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}>Duration</button>
                  <button onClick={() => setDurationMode('end-time')} className={`px-1.5 py-0.5 text-[10px] font-medium ${durationMode === 'end-time' ? 'bg-[#ff444f] text-white' : theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}>End time</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-1.5 py-1 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-zinc-200' : 'bg-white border-gray-300 text-gray-700'}`}>
                  <span className="text-[10px] font-medium">{formatDurationUnit(duration.unit)}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </div>
                <div className={`flex-1 px-2 py-1 rounded border text-center ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <span className="text-xs font-medium">{duration.value}</span>
                </div>
                <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{duration.range.min}-{duration.range.max}</span>
              </div>
            </div>

            {/* Barrier + Stake Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Barrier */}
              <div className={`rounded-lg p-2 border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`text-[10px] font-medium block mb-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Barrier</span>
                <div className={`px-2 py-1 rounded border text-center ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <span className="text-xs font-semibold">{barrier.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <span className={`text-[10px] mt-0.5 block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>Spot: {barrier.spotPrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
              </div>

              {/* Stake */}
              <div className={`rounded-lg p-2 border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>{stakeMode === 'stake' ? 'Stake' : 'Payout'}</span>
                  <div className={`flex rounded overflow-hidden border ${theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'}`}>
                    <button onClick={() => setStakeMode('stake')} className={`px-1 py-0.5 text-[8px] font-medium ${stakeMode === 'stake' ? 'bg-[#ff444f] text-white' : theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}>S</button>
                    <button onClick={() => setStakeMode('payout')} className={`px-1 py-0.5 text-[8px] font-medium ${stakeMode === 'payout' ? 'bg-[#ff444f] text-white' : theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}>P</button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleStakeDecrement} className={`w-5 h-5 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}><Minus className="w-3 h-3" /></button>
                  <div className={`flex-1 px-1 py-1 rounded border text-center ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                    <span className="text-xs font-semibold">{stakeValue.toFixed(2)}</span>
                  </div>
                  <button onClick={handleStakeIncrement} className={`w-5 h-5 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleHigherClick} className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#00d0a0] hover:bg-[#00d0a0]/90 text-white transition-colors">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs">Higher</span>
                <span className="text-xs font-bold">{payout.higher.amount}</span>
              </button>
              <button onClick={handleLowerClick} className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#ff444f] hover:bg-[#ff444f]/90 text-white transition-colors">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs">Lower</span>
                <span className="text-xs font-bold">{payout.lower.amount}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
