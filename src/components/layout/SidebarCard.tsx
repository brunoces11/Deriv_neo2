import { Star, X, Zap, Bot, Wallet, Table, TrendingUp, LineChart, Workflow } from 'lucide-react';
import type { BaseCard } from '../../types';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';

interface SidebarCardProps {
  card: BaseCard;
  variant: 'favorite' | 'archived';
}

const cardIcons = {
  'bot-card': Bot,
  'portfolio-snapshot': Wallet,
  'portfolio-table': Table,
  'portfolio-sidebar': Wallet,
  'portfolio-table-expanded': Table,
  'portfolio-table-complete': Table,
  'create-trade-card': LineChart,
  'trade-card': TrendingUp,
  'actions-card': Zap,
  'bot-creator': Workflow,
};

const cardLabels = {
  'bot-card': 'Bot',
  'portfolio-snapshot': 'Portfolio',
  'portfolio-table': 'Portfolio Table',
  'portfolio-sidebar': 'Portfolio',
  'portfolio-table-expanded': 'Portfolio',
  'portfolio-table-complete': 'Portfolio',
  'create-trade-card': 'Create Trade',
  'trade-card': 'Trade',
  'actions-card': 'Action',
  'bot-creator': 'Bot Creator',
};

export function SidebarCard({ card, variant }: SidebarCardProps) {
  const { unfavoriteCard, hideCard } = useChat();
  const { theme } = useTheme();
  const Icon = cardIcons[card.type];
  const label = cardLabels[card.type];

  const getTitle = () => {
    const payload = card.payload as Record<string, unknown>;
    if (card.type === 'trade-card') {
      return `${(payload.direction as string)?.toUpperCase() || 'Trade'} ${payload.asset || ''}`;
    }
    if (card.type === 'bot-card') {
      return (payload.name as string) || 'Bot';
    }
    if (card.type === 'portfolio-snapshot' || card.type === 'portfolio-sidebar' || card.type === 'portfolio-table-expanded' || card.type === 'portfolio-table-complete') {
      return 'Portfolio';
    }
    if (card.type === 'portfolio-table') {
      return 'Portfolio Table';
    }
    if (card.type === 'create-trade-card') {
      return `Create ${payload.asset || 'Trade'}`;
    }
    if (card.type === 'actions-card') {
      return (payload.name as string) || 'Action';
    }
    if (card.type === 'bot-creator') {
      return (payload.botName as string) || 'New Bot';
    }
    return label;
  };

  return (
    <div className={`group relative px-3 py-2 rounded-lg border transition-all cursor-pointer ${
      theme === 'dark'
        ? 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
          variant === 'favorite'
            ? 'bg-brand-green/10 text-brand-green'
            : theme === 'dark'
              ? 'bg-zinc-800 text-zinc-500'
              : 'bg-gray-100 text-gray-500'
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
        {variant === 'favorite' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              unfavoriteCard(card.id);
            }}
            className={`p-1 rounded transition-colors ${
              theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
            } text-brand-green`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            hideCard(card.id);
          }}
          className={`p-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-zinc-700 text-zinc-500 hover:text-red-400'
              : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
