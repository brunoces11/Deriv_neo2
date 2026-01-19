import { ReactNode, useState, useRef, useEffect } from 'react';
import { Star, Archive, MoreVertical } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard } from '../../types';

interface CardWrapperProps {
  card: BaseCard;
  children: ReactNode;
  accentColor?: string;
}

export function CardWrapper({ card, children, accentColor = 'red' }: CardWrapperProps) {
  const { archiveCard, favoriteCard, unfavoriteCard } = useChat();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

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

  const handleFavoriteClick = () => {
    if (card.isFavorite) {
      unfavoriteCard(card.id);
    } else {
      favoriteCard(card.id);
    }
    setMenuOpen(false);
  };

  const handleArchiveClick = () => {
    archiveCard(card.id);
    setMenuOpen(false);
  };

  return (
    <div className={`relative group backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-visible ${colors.border} ${
      theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none rounded-xl ${
        theme === 'dark' ? 'from-white/[0.02] to-transparent' : 'from-gray-50/50 to-transparent'
      }`} />

      <div className="absolute top-3 right-3 z-10" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 ${
            theme === 'dark'
              ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400'
              : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-600'
          }`}
          title="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className={`absolute right-0 top-full mt-1 w-44 border rounded-lg shadow-xl py-1 animate-scale-in ${
            theme === 'dark'
              ? 'bg-zinc-800 border-zinc-700 shadow-black/50'
              : 'bg-white border-gray-200 shadow-gray-900/20'
          }`}>
            <button
              onClick={handleFavoriteClick}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Star className={`w-4 h-4 ${card.isFavorite ? 'text-brand-green fill-brand-green' : theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`} />
              <span>{card.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</span>
            </button>
            <button
              onClick={handleArchiveClick}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Archive className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`} />
              <span>Arquivar card</span>
            </button>
          </div>
        )}
      </div>

      <div className="relative p-4">
        {children}
      </div>
    </div>
  );
}
