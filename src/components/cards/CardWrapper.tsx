import { ReactNode } from 'react';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard } from '../../types';

interface CardWrapperProps {
  card: BaseCard;
  children: ReactNode;
  accentColor?: string;
}

export function CardWrapper({ children, accentColor = 'red' }: CardWrapperProps) {
  const { theme } = useTheme();

  // All cards now use neutral gray borders and icons
  const neutralColors = {
    border: theme === 'dark' 
      ? 'border-zinc-600/40 hover:border-zinc-500/60' 
      : 'border-gray-300/60 hover:border-gray-400/80',
    hover: theme === 'dark' ? 'hover:bg-zinc-700/10' : 'hover:bg-gray-100/50',
    icon: theme === 'dark' ? 'text-zinc-400' : 'text-gray-500',
  };

  const colors = neutralColors;

  return (
    <div className={`relative group backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-visible ${colors.border} ${
      theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none rounded-xl ${
        theme === 'dark' ? 'from-white/[0.02] to-transparent' : 'from-gray-50/50 to-transparent'
      }`} />

      <div className="relative p-4">
        {children}
      </div>
    </div>
  );
}
