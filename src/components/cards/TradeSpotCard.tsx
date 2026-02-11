import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { CardMenuActions } from './CardMenuActions';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import { useViewMode } from '../../store/ViewModeContext';
import type { BaseCard, TradeSpotCardPayload } from '../../types';

interface TradeSpotCardProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

export function TradeSpotCard({ card, defaultExpanded = true }: TradeSpotCardProps) {
  const { theme } = useTheme();
  const { updateCardPayload, processUIEvent } = useChat();
  const { notifyPanelActivation } = useViewMode();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  if (!card || !card.id) {
    return null;
  }

  const payload = card.payload as unknown as TradeSpotCardPayload;
  const executionState = payload?.executionState || 'open';
  const pair = payload?.pair || 'BTC/USD';
  const amount = payload?.amount || 100;
  const priceMode = payload?.priceMode || 'market';
  const price = payload?.price || 42350.75;
  const targetPrice = payload?.targetPrice || price;
  const executionPrice = payload?.executionPrice;
  const executionTime = payload?.executionTime;

  const handleBuy = () => {
    const execPrice = priceMode === 'market' ? price : targetPrice;
    const executionPayload = {
      executionState: 'bought',
      executionPrice: execPrice,
      executionTime: new Date().toISOString(),
    };
    updateCardPayload(card.id, executionPayload);

    // Add executed card to Positions panel
    processUIEvent({
      type: 'ADD_CARD',
      cardId: `panel-${card.id}`,
      cardType: 'trade-spot-card',
      payload: { ...payload, ...executionPayload, pair, amount, priceMode, price, targetPrice },
    });
    notifyPanelActivation('left', 'positions');
  };

  const handleSell = () => {
    const execPrice = priceMode === 'market' ? price : targetPrice;
    const executionPayload = {
      executionState: 'sold',
      executionPrice: execPrice,
      executionTime: new Date().toISOString(),
    };
    updateCardPayload(card.id, executionPayload);

    // Add executed card to Positions panel
    processUIEvent({
      type: 'ADD_CARD',
      cardId: `panel-${card.id}`,
      cardType: 'trade-spot-card',
      payload: { ...payload, ...executionPayload, pair, amount, priceMode, price, targetPrice },
    });
    notifyPanelActivation('left', 'positions');
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateCardPayload(card.id, { amount: numValue });
  };

  const handlePriceModeChange = (mode: 'market' | 'target') => {
    updateCardPayload(card.id, { priceMode: mode });
  };

  const handleTargetPriceChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateCardPayload(card.id, { targetPrice: numValue });
  };

  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compacted view
  if (!isExpanded) {
    return (
      <CardWrapper card={card} hasOpenDropdown={isMenuDropdownOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
              {executionState === 'bought' ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : executionState === 'sold' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-xs font-medium uppercase tracking-wide leading-tight ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Spot Trade
              </h3>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {pair}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              ${amount.toFixed(2)}
            </span>
            {executionState !== 'open' && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                executionState === 'bought'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {executionState === 'bought' ? 'BOUGHT' : 'SOLD'}
              </span>
            )}
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

  // Expanded - Open state
  if (executionState === 'open') {
    return (
      <CardWrapper card={card} hasOpenDropdown={isMenuDropdownOpen}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
                <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <span className="text-[10px] font-medium text-red-500 uppercase tracking-wider block">
                  Spot Trade
                </span>
                <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {pair}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <CardMenuActions
                card={card}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                onDropdownChange={setIsMenuDropdownOpen}
              />
            </div>
          </div>

          {/* Price tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => handlePriceModeChange('market')}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                priceMode === 'market'
                  ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-gray-200 text-gray-900'
                  : theme === 'dark' ? 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-400' : 'bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              Market Price
            </button>
            <button
              onClick={() => handlePriceModeChange('target')}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                priceMode === 'target'
                  ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-gray-200 text-gray-900'
                  : theme === 'dark' ? 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-400' : 'bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              Target Price
            </button>
          </div>

          {/* Amount and Target Price inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full px-2 py-1.5 rounded text-sm ${
                  theme === 'dark' ? 'bg-zinc-700 text-white border border-zinc-600' : 'bg-white text-gray-900 border border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Target Price
              </label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => handleTargetPriceChange(e.target.value)}
                disabled={priceMode === 'market'}
                className={`w-full px-2 py-1.5 rounded text-sm ${
                  priceMode === 'market'
                    ? theme === 'dark' ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : theme === 'dark' ? 'bg-zinc-700 text-white border border-zinc-600' : 'bg-white text-gray-900 border border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Buy/Sell buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleBuy}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded font-medium text-xs transition-colors bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Buy
            </button>
            <button
              onClick={handleSell}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded font-medium text-xs transition-colors bg-red-500 hover:bg-red-600 text-white"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Sell
            </button>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Expanded - Executed state (bought/sold)
  return (
    <CardWrapper card={card} hasOpenDropdown={isMenuDropdownOpen}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              executionState === 'bought' ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              {executionState === 'bought' ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div>
              <span className={`text-[10px] font-medium uppercase tracking-wider block ${
                executionState === 'bought' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {executionState === 'bought' ? 'Bought' : 'Sold'} · Spot
              </span>
              <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {pair}
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

        {/* Execution details */}
        <div className={`p-3 rounded-xl space-y-2 ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Amount</span>
            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Exec. Price</span>
            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${executionPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {executionTime && (
            <div className="flex justify-between items-center">
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Time</span>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                {formatTime(executionTime)}
              </span>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
