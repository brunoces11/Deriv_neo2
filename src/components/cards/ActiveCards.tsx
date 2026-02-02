import { useChat } from '../../store/ChatContext';
import { BotCard } from './BotCard';
import { PortfolioSnapshotCard } from './PortfolioSnapshotCard';
import { PortfolioSidebarCard } from './PortfolioSidebarCard';
import { PortfolioTableCardComplete } from './PortfolioTableCardComplete';
import { CreateTradeCard } from './CreateTradeCard';
import { TradeCard } from './TradeCard';
import { ActionsCard } from './ActionsCard';
import { ActionsCardCreator } from './ActionsCardCreator';
import { BotCardCreator } from './BotCardCreator';
import type { BaseCard } from '../../types';

const cardComponents = {
  'bot-card': BotCard,
  'portfolio-snapshot': PortfolioSnapshotCard,
  'portfolio-sidebar': PortfolioSidebarCard,
  'portfolio-table-complete': PortfolioTableCardComplete,
  'create-trade-card': CreateTradeCard,
  'trade-card': TradeCard,
  'actions-card': ActionsCard,
  'actions-creator': ActionsCardCreator,
  'bot-creator': BotCardCreator,
};

export function ActiveCards() {
  const { activeCards } = useChat();

  if (activeCards.length === 0) return null;

  return (
    <div className="py-6 border-t border-zinc-800/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Active Cards
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {activeCards.map((card) => (
          <CardRenderer key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

interface CardRendererProps {
  card: BaseCard;
}

function CardRenderer({ card }: CardRendererProps) {
  const Component = cardComponents[card.type];

  if (!Component) return null;

  return (
    <div className="animate-scale-in opacity-0">
      <Component card={card} />
    </div>
  );
}
