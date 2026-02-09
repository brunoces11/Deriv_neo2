import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import { useViewMode } from '../../store/ViewModeContext';
import type { BaseCard, TradeSpotCardPayload } from '../../types';

interface TradeSpotCardProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

const PAIRS = [
  { symbol: 'BTC/USD', name: 'Bitcoin' },
  { symbol: 'ETH/USD', name: 'Ethereum' },
  { symbol: 'XAU/USD', name: 'Gold' },
  { symbol: 'EUR/USD', name: 'Euro' },
  { symbol: 'GBP/USD', name: 'Pound' },
];

export function TradeSpotCard({ card, defaultExpanded = true }: TradeSpotCardProps) {
  const { theme } = useTheme();
  const { viewMode } = useViewMode();
  const { updateCard, deleteCardWithTwin } = useChat();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!card || !card.id) {
    return null;
  }

  const payload = card.payload as unknown as TradeSpotCardPayload;
  const executionState = payload?.executionState || 'open';
  const pair = payload?.pair || 'BTC/USD';
  const amount = payload?.amount || 100;
  const priceMode = payload?.priceMode || 'market';
  const price = payload?.price || 42350.75;
  const executionPrice = payload?.executionPrice;
  const executionTime = payload?.executionTime;

  const handleBuy = () => {
    const executionPrice = priceMode === 'market' ? price : payload?.manualPrice || price;
    updateCard(card.id, {
      ...payload,
      executionState: 'bought',
      executionPrice,
      executionTime: new Date().toISOString(),
    });
  };

  const handleSell = () => {
    const executionPrice = priceMode === 'market' ? price : payload?.manualPrice || price;
    updateCard(card.id, {
      ...payload,
      executionState: 'sold',
      executionPrice,
      executionTime: new Date().toISOString(),
    });
  };

  const handleDiscard = async () => {
    await deleteCardWithTwin(card.id);
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateCard(card.id, { ...payload, amount: numValue });
  };

  const handlePriceModeToggle = () => {
    const newMode = priceMode === 'market' ? 'manual' : 'market';
    updateCard(card.id, { ...payload, priceMode: newMode });
  };

  const handleManualPriceChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateCard(card.id, { ...payload, manualPrice: numValue });
  };

  const handlePairChange = (newPair: string) => {
    updateCard(card.id, { ...payload, pair: newPair });
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

  // Versão compactada (uma linha)
  if (!isExpanded) {
    return (
      <CardWrapper
        card={card}
        isExpanded={false}
        onToggleExpand={() => setIsExpanded(true)}
        onDiscard={handleDiscard}
        showChevron={viewMode === 'chat'}
        showMenu={false}
      >
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2 min-w-0">
            {executionState === 'bought' ? (
              <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : executionState === 'sold' ? (
              <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : (
              <DollarSign className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {pair}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              ${amount.toFixed(2)}
            </span>
            {executionState !== 'open' && (
              <span className={`text-xs font-medium ${
                executionState === 'bought'
                  ? 'text-emerald-500'
                  : 'text-red-500'
              }`}>
                {executionState === 'bought' ? 'BOUGHT' : 'SOLD'}
              </span>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Versão expandida - Estado "aberto"
  if (executionState === 'open') {
    return (
      <CardWrapper
        card={card}
        isExpanded={true}
        onToggleExpand={() => setIsExpanded(false)}
        onDiscard={handleDiscard}
        showChevron={viewMode === 'chat'}
        showMenu={false}
      >
        <div className="space-y-4 py-2">
          {/* Pair selector */}
          <div>
            <label className={`text-xs mb-2 block ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Trading Pair
            </label>
            <div className="flex gap-2 flex-wrap">
              {PAIRS.map((p) => (
                <button
                  key={p.symbol}
                  onClick={() => handlePairChange(p.symbol)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    pair === p.symbol
                      ? theme === 'dark'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {p.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Current price display */}
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Current Price
              </span>
              <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Price mode toggle */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handlePriceModeToggle}
                className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {priceMode === 'market' ? '📍 Market Price' : '✏️ Manual Price'}
              </button>
            </div>
            {priceMode === 'manual' && (
              <input
                type="number"
                step="0.01"
                value={payload?.manualPrice || price}
                onChange={(e) => handleManualPriceChange(e.target.value)}
                className={`w-full px-3 py-2 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-zinc-700 text-white border border-zinc-600'
                    : 'bg-white text-gray-900 border border-gray-300'
                }`}
                placeholder="Enter price"
              />
            )}
          </div>

          {/* Amount input */}
          <div>
            <label className={`text-xs mb-2 block ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`w-full px-3 py-2 rounded text-sm ${
                theme === 'dark'
                  ? 'bg-zinc-700 text-white border border-zinc-600'
                  : 'bg-white text-gray-900 border border-gray-300'
              }`}
              placeholder="Enter amount"
            />
          </div>

          {/* Buy/Sell buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleBuy}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded font-medium text-sm transition-colors bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <TrendingUp className="w-4 h-4" />
              Buy
            </button>
            <button
              onClick={handleSell}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded font-medium text-sm transition-colors bg-red-500 hover:bg-red-600 text-white"
            >
              <TrendingDown className="w-4 h-4" />
              Sell
            </button>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Versão expandida - Estado "executado" (bought/sold)
  return (
    <CardWrapper
      card={card}
      isExpanded={true}
      onToggleExpand={() => setIsExpanded(false)}
      onDiscard={handleDiscard}
      showChevron={viewMode === 'chat'}
      showMenu={false}
    >
      <div className="space-y-4 py-2">
        {/* Status header */}
        <div className={`p-4 rounded ${
          executionState === 'bought'
            ? theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-50'
            : theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {executionState === 'bought' ? (
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-lg font-bold ${
                executionState === 'bought' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {executionState === 'bought' ? 'BOUGHT' : 'SOLD'}
              </span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {executionTime && formatTime(executionTime)}
            </span>
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            Order executed successfully
          </div>
        </div>

        {/* Execution details */}
        <div className={`p-3 rounded space-y-2 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Pair
            </span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {pair}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Amount
            </span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Execution Price
            </span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${executionPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Total Cost
            </span>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${(amount * (executionPrice || price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDiscard}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
            theme === 'dark'
              ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Close Position
        </button>
      </div>
    </CardWrapper>
  );
}
