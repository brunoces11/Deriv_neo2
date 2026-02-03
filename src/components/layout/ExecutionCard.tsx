import type { BaseCard, CardType } from '../../types';

// Import all card components
import { TradeCard } from '../cards/TradeCard';
import { CreateTradeCard } from '../cards/CreateTradeCard';
import { BotCard } from '../cards/BotCard';
import { BotCardCreator } from '../cards/BotCardCreator';
import { ActionsCard } from '../cards/ActionsCard';
import { ActionsCardCreator } from '../cards/ActionsCardCreator';
import { PortfolioSnapshotCard } from '../cards/PortfolioSnapshotCard';
import { PortfolioTableCardComplete } from '../cards/PortfolioTableCardComplete';
import { PortfolioSidebarCard } from '../cards/PortfolioSidebarCard';

interface ExecutionCardProps {
  card: BaseCard;
}

/**
 * ExecutionCard Component
 * 
 * Renders the actual card component based on card type.
 * Cards in the panel are rendered in compacted mode (defaultExpanded=false).
 * This ensures the same card component is used both inline and in the panel.
 */
export function ExecutionCard({ card }: ExecutionCardProps) {
  // Render the actual card component based on type, always in compacted mode
  return renderCardByType(card, false);
}

/**
 * Renders the appropriate card component based on card type
 * @param card - The card data
 * @param defaultExpanded - Whether the card should start expanded (false for panel, true for inline)
 */
export function renderCardByType(card: BaseCard, defaultExpanded: boolean): JSX.Element | null {
  const cardType = card.type as CardType;

  switch (cardType) {
    // Trade cards
    case 'trade-card':
    case 'card_trade':
      return <TradeCard card={card} defaultExpanded={defaultExpanded} />;
    
    case 'create-trade-card':
    case 'card_trade_creator':
      return <CreateTradeCard card={card} defaultExpanded={defaultExpanded} />;

    // Bot cards
    case 'bot-card':
    case 'card_bot':
      return <BotCard card={card} defaultExpanded={defaultExpanded} />;
    
    case 'bot-creator':
    case 'card_bot_creator':
      return <BotCardCreator card={card} defaultExpanded={defaultExpanded} />;

    // Action cards
    case 'actions-card':
    case 'card_actions':
      return <ActionsCard card={card} defaultExpanded={defaultExpanded} />;
    
    case 'actions-creator':
    case 'card_actions_creator':
      return <ActionsCardCreator card={card} defaultExpanded={defaultExpanded} />;

    // Portfolio cards
    case 'portfolio-snapshot':
    case 'card_portfolio_exemple_compacto':
      return <PortfolioSnapshotCard card={card} defaultExpanded={defaultExpanded} />;
    
    case 'portfolio-table-complete':
    case 'card_portfolio':
      return <PortfolioTableCardComplete card={card} defaultExpanded={defaultExpanded} />;
    
    case 'portfolio-sidebar':
    case 'card_portfolio_sidebar':
      return <PortfolioSidebarCard card={card} />;

    default:
      console.warn(`[ExecutionCard] Unknown card type: ${cardType}`);
      return null;
  }
}

/**
 * Helper to determine which panel tab a card belongs to
 */
export type PanelTab = 'cards' | 'actions' | 'bots';

export function getCardPanelTab(cardType: CardType): PanelTab {
  // Bot cards go to 'bots' panel
  if (cardType === 'bot-card' || cardType === 'bot-creator' || 
      cardType === 'card_bot' || cardType === 'card_bot_creator') {
    return 'bots';
  }
  
  // Action cards go to 'actions' panel
  if (cardType === 'actions-card' || cardType === 'actions-creator' ||
      cardType === 'card_actions' || cardType === 'card_actions_creator') {
    return 'actions';
  }
  
  // Everything else goes to 'cards' panel (portfolio, trade, etc.)
  return 'cards';
}
