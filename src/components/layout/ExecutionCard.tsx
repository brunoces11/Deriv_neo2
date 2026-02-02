import { Star, Archive, Zap, Bot, Wallet, Table, TrendingUp, LineChart, Workflow, FileText } from 'lucide-react';
import type { BaseCard } from '../../types';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';

interface ExecutionCardProps {
  card: BaseCard;
}

const cardIcons = {
  'bot-card': Bot,
  'portfolio-snapshot': Wallet,
  'portfolio-sidebar': Wallet,
  'portfolio-table-complete': Table,
  'create-trade-card': LineChart,
  'trade-card': TrendingUp,
  'actions-card': Zap,
  'bot-creator': Workflow,
};

const cardLabels = {
  'bot-card': 'Bot',
  'portfolio-snapshot': 'Portfolio',
  'portfolio-sidebar': 'Portfolio',
  'portfolio-table-complete': 'Portfolio',
  'create-trade-card': 'Create Trade',
  'trade-card': 'Trade',
  'actions-card': 'Action',
  'bot-creator': 'Bot Creator',
};

// Helper function to remove tag patterns from text
function removeTagsFromText(text: string): string {
  return text.replace(/\[@([A-Za-z0-9\s]+?)(?:-(\d+))?\]\s*/g, '').trim();
}

export function ExecutionCard({ card }: ExecutionCardProps) {
  const { favoriteCard, unfavoriteCard, archiveCard } = useChat();
  const { theme } = useTheme();
  const Icon = cardIcons[card.type] || FileText;
  const label = cardLabels[card.type] || 'Unknown';

  const getTitle = () => {
    const payload = card.payload as Record<string, unknown>;
    let title = '';
    
    if (card.type === 'trade-card') {
      title = `${(payload.direction as string)?.toUpperCase() || 'Trade'} ${payload.asset || ''}`;
    } else if (card.type === 'bot-card') {
      title = (payload.name as string) || 'Bot';
    } else if (card.type === 'portfolio-snapshot' || card.type === 'portfolio-sidebar' || card.type === 'portfolio-table-complete') {
      title = 'Portfolio';
    } else if (card.type === 'create-trade-card') {
      title = `Create ${payload.asset || 'Trade'}`;
    } else if (card.type === 'actions-card') {
      title = (payload.name as string) || 'Action';
    } else if (card.type === 'bot-creator') {
      title = (payload.botName as string) || 'New Bot';
    } else {
      title = label;
    }
    
    // Remove any tag patterns from title to prevent badge rendering
    return title.replace(/\[@([A-Za-z0-9\s]+?)(?:-(\d+))?\]/g, '').trim();
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
