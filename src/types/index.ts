export type CardType = 'intent-summary' | 'action-ticket' | 'bot-card' | 'portfolio-snapshot' | 'portfolio-table' | 'portfolio-sidebar' | 'portfolio-table-expanded' | 'portfolio-table-complete' | 'positions-card' | 'trade-card' | 'actions-card' | 'bot-creator';

export type CardStatus = 'active' | 'archived' | 'hidden';

export interface BaseCard {
  id: string;
  type: CardType;
  status: CardStatus;
  isFavorite: boolean;
  createdAt: Date;
  payload: Record<string, unknown>;
}

export interface IntentSummaryPayload {
  action: string;
  asset?: string;
  value?: string;
  summary: string;
}

export interface ActionTicketPayload {
  ticketId: string;
  action: 'buy' | 'sell' | 'transfer' | 'swap';
  asset: string;
  amount: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface BotPayload {
  botId: string;
  name: string;
  strategy: string;
  status: 'active' | 'paused' | 'stopped';
  performance?: string;
}

export interface PortfolioSnapshotPayload {
  totalValue: string;
  change24h: string;
  changePercent: string;
  assets: Array<{
    symbol: string;
    allocation: number;
    value: string;
  }>;
}

export interface PortfolioTablePayload {
  totalValue: string;
  change24h: string;
  changePercent: string;
  assets: Array<{
    symbol: string;
    name: string;
    allocation: number;
    value: string;
    invested: string;
    change: string;
    changePercent: string;
  }>;
}

export interface Position {
  id: string;
  asset: string;
  assetName: string;
  contractType: 'higher' | 'lower' | 'rise' | 'fall' | 'touch' | 'no-touch';
  stake: string;
  payout: string;
  expiryTime: string;
  timeRemaining: string;
  status: 'open' | 'won' | 'lost';
  profit?: string;
}

export interface PositionsCardPayload {
  positions: Position[];
}

export interface TradeCardPayload {
  asset: string;
  assetName: string;
  tradeType: 'higher-lower' | 'rise-fall' | 'touch-no-touch';
  duration: {
    mode: 'duration' | 'end-time';
    unit: 'days' | 'hours' | 'minutes' | 'ticks';
    value: number;
    range: { min: number; max: number };
    expiryDate: string;
  };
  barrier: {
    value: number;
    spotPrice: number;
  };
  stake: {
    mode: 'stake' | 'payout';
    value: number;
    currency: string;
  };
  payout: {
    higher: { amount: string; percentage: string };
    lower: { amount: string; percentage: string };
  };
}

export interface ActionsCardPayload {
  actionId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastExecution?: string;
}

export interface BotCreatorPayload {
  botName: string;
  trigger: {
    type: string;
    value?: string;
  };
  action: {
    type: string;
    asset: string;
  };
  target: {
    type: string;
    value: string;
  };
  condition?: {
    type: string;
    operator: string;
    value: string;
  };
}

export interface BotCardPayload {
  botId: string;
  name: string;
  strategy: string;
  status: 'active' | 'paused' | 'stopped';
  performance?: string;
}

export type CardPayload =
  | IntentSummaryPayload
  | ActionTicketPayload
  | BotPayload
  | PortfolioSnapshotPayload
  | PortfolioTablePayload
  | PositionsCardPayload
  | TradeCardPayload
  | ActionsCardPayload
  | BotCreatorPayload
  | BotCardPayload;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type UIEventType =
  | 'ADD_CARD'
  | 'UPDATE_CARD'
  | 'ARCHIVE_CARD'
  | 'FAVORITE_CARD'
  | 'HIDE_CARD';

export interface UIEvent {
  type: UIEventType;
  cardType?: CardType;
  cardId: string;
  payload?: Record<string, unknown>;
}

export interface LangFlowResponse {
  chat_message: string;
  ui_events: UIEvent[];
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  is_favorite: boolean;
  is_archived: boolean;
  user_id?: string;
}
