import { Star, Archive, Zap, Bot, Wallet, FileText, Table } from 'lucide-react';
import type { BaseCard } from '../../types';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';

interface ExecutionCardProps {
  card: BaseCard;
}

const cardIcons = {
  'intent-summary': FileText,
  'action-ticket': Zap,
  'bot': Bot,
  'portfolio-snapshot': Wallet,
  'portfolio-table': Table,
};

const cardLabels = {
  'intent-summary': 'Intent',
  'action-ticket': 'Action',
  'bot': 'Bot',
  'portfolio-snapshot': 'Portfolio',
  'portfolio-table': 'Portfolio Table',
};

export function ExecutionCard({ card }: ExecutionCardProps) {
  const { favoriteCard, unfavoriteCard, archiveCard } = useChat();
  const { theme } = useTheme();
  const Icon = cardIcons[card.type] || FileText;
  const label = cardLabels[card.type] || 'Unknown';

  const getTitle = () => {
    const payload = card.payload as Record<string, unknown>;
    if (card.type === 'intent-summary') {
      return (payload.action as string) || 'Intent';
    }
    if (card.type === 'action-ticket') {
      return `${(payload.action as string)?.toUpperCase() || 'Action'} ${payload.asset || ''}`;
    }
    if (card.type === 'bot') {
      return (payload.name as string) || 'Bot';
    }
    if (card.type === 'portfolio-snapshot') {
      return 'Portfolio';
    }
    if (card.type === 'portfolio-table') {
      return 'Portfolio Table';
    }
    return label;
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.isFavorite) {
      unfavoriteCard(card.id);
    } else {
      favoriteCard(card.id);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveCard(card.id);
  };

  return (
    <div className={`group relative px-3 py-2 rounded-lg border transition-all cursor-pointer ${
      theme === 'dark'
        ? 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-red-500/10 text-red-500'
            : 'bg-red-50 text-red-500'
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate transition-colors ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
          }`}>{getTitle()}</p>
          <p className={`text-xs truncate transition-colors ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
          }`}>{label}</p>
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={handleFavorite}
          className={`p-1 rounded transition-colors ${
            theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
          } ${card.isFavorite ? 'text-brand-green' : theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
        >
          <Star className={`w-3.5 h-3.5 ${card.isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleArchive}
          className={`p-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-zinc-700 text-zinc-500 hover:text-amber-400'
              : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
