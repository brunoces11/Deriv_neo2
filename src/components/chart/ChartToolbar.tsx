import { ChevronDown, RefreshCw, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AVAILABLE_SYMBOLS, AVAILABLE_TIMEFRAMES, type SupportedSymbol, type SupportedTimeframe } from '../../services/binanceApi';

interface ChartToolbarProps {
  symbol: SupportedSymbol;
  timeframe: SupportedTimeframe;
  onSymbolChange: (symbol: SupportedSymbol) => void;
  onTimeframeChange: (timeframe: SupportedTimeframe) => void;
  onRefresh: () => void;
  isLoading: boolean;
  theme: 'dark' | 'light';
}

export function ChartToolbar({
  symbol,
  timeframe,
  onSymbolChange,
  onTimeframeChange,
  onRefresh,
  isLoading,
  theme,
}: ChartToolbarProps) {
  const [symbolDropdownOpen, setSymbolDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSymbolDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseClass = theme === 'dark'
    ? 'bg-zinc-900/90 border-zinc-700/50 text-zinc-300'
    : 'bg-white/90 border-gray-200 text-gray-700';

  const buttonClass = theme === 'dark'
    ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
    : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700';

  const activeButtonClass = theme === 'dark'
    ? 'bg-red-500/20 border-red-500/50 text-red-400'
    : 'bg-red-50 border-red-200 text-red-600';

  const dropdownClass = theme === 'dark'
    ? 'bg-zinc-800 border-zinc-700 shadow-xl'
    : 'bg-white border-gray-200 shadow-xl';

  const dropdownItemClass = theme === 'dark'
    ? 'hover:bg-zinc-700 text-zinc-300'
    : 'hover:bg-gray-100 text-gray-700';

  return (
    <div className={`absolute top-4 left-4 right-4 z-20 flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-sm pointer-events-auto ${baseClass}`}>
      {/* Symbol Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setSymbolDropdownOpen(!symbolDropdownOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${buttonClass}`}
        >
          <span>{symbol}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${symbolDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {symbolDropdownOpen && (
          <div className={`absolute top-full left-0 mt-1 py-1 rounded-lg border min-w-[120px] ${dropdownClass}`}>
            {AVAILABLE_SYMBOLS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onSymbolChange(s);
                  setSymbolDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${dropdownItemClass} ${
                  s === symbol ? 'font-semibold' : ''
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1">
        {AVAILABLE_TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
              tf === timeframe ? activeButtonClass : buttonClass
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors ${buttonClass} disabled:opacity-50`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-green-500 font-medium">LIVE</span>
      </div>
    </div>
  );
}
