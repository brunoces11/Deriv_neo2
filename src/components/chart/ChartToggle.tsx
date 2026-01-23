import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';

interface ChartToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function ChartToggle({ isActive, onToggle }: ChartToggleProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        isActive
          ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30'
          : theme === 'dark'
            ? 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700/50'
            : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-gray-200'
      }`}
      title={isActive ? 'Hide chart' : 'Show chart'}
    >
      {isActive ? (
        <TrendingDown className="w-3.5 h-3.5" />
      ) : (
        <TrendingUp className="w-3.5 h-3.5" />
      )}
      <span>{isActive ? 'Hide Chart' : 'Show Chart'}</span>
    </button>
  );
}
