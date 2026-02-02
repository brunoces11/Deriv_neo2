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

  const colorClasses: Record<string, { border: string; hover: string; icon: string }> = {
    red: {
      border: 'border-red-500/20 hover:border-red-500/40',
      hover: 'hover:bg-red-500/10',
      icon: 'text-red-500',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      hover: 'hover:bg-amber-500/10',
      icon: 'text-amber-500',
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      hover: 'hover:bg-cyan-500/10',
      icon: 'text-cyan-500',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      hover: 'hover:bg-rose-500/10',
      icon: 'text-rose-500',
    },
  };

  const colors = colorClasses[accentColor] || colorClasses.red;

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
