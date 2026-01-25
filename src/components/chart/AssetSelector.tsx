import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Bitcoin, DollarSign } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';

interface AssetData {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
}

interface AssetSelectorProps {
  asset?: AssetData;
  onClick?: () => void;
}

const defaultAsset: AssetData = {
  pair: 'BTC/USD',
  price: 87953.409,
  change: -0.128,
  changePercent: 0.00,
};

export function AssetSelector({ asset = defaultAsset, onClick }: AssetSelectorProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isPositive = asset.change > 0;
  const isNegative = asset.change < 0;
  const isNeutral = asset.change === 0;

  const variationColor = isPositive 
    ? 'text-green-500' 
    : isNegative 
      ? 'text-red-500' 
      : theme === 'dark' ? 'text-zinc-400' : 'text-gray-500';

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
        theme === 'dark'
          ? 'bg-zinc-800/90 border-zinc-700 hover:bg-zinc-700/90 focus:border-zinc-500'
          : 'bg-white border-gray-200 hover:bg-gray-50 focus:border-gray-400'
      }`}
    >
      {/* Icon Area */}
      <div className="relative">
        {/* Main crypto icon */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
          theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
        }`}>
          <Bitcoin className={`w-5 h-5 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'
          }`} />
        </div>
        {/* Small currency icon (overlapping) */}
        <div className={`absolute -bottom-0.5 -left-1 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
          theme === 'dark' 
            ? 'bg-zinc-600 border-zinc-800' 
            : 'bg-gray-300 border-white'
        }`}>
          <DollarSign className={`w-2.5 h-2.5 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'
          }`} />
        </div>
      </div>

      {/* Text Area */}
      <div className="flex flex-col items-start">
        {/* Line 1: Pair */}
        <span className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {asset.pair}
        </span>
        {/* Line 2: Price + Change */}
        <div className="flex items-center gap-1">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            {asset.price.toLocaleString('en-US', { minimumFractionDigits: 3 })}
          </span>
          <span className={`text-xs ${variationColor}`}>
            {isPositive ? '+' : ''}{asset.change.toFixed(3)} ({asset.changePercent.toFixed(2)}%)
          </span>
          {/* Direction indicator */}
          {!isNeutral && (
            isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )
          )}
        </div>
      </div>

      {/* Chevron */}
      <div className={`ml-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </button>
  );
}
