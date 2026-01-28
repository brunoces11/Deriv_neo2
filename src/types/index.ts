export type CardType = 'bot-card' | 'portfolio-snapshot' | 'portfolio-table' | 'portfolio-sidebar' | 'portfolio-table-expanded' | 'portfolio-table-complete' | 'create-trade-card' | 'trade-card' | 'actions-card' | 'bot-creator';

export type CardStatus = 'active' | 'archived' | 'hidden';

export interface BaseCard {
  id: string;
  type: CardType;
  status: CardStatus;
  isFavorite: boolean;
  createdAt: Date;
  payload: Record<string, unknown>;
}



export interface CreateTradeCardPayload {
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

export interface TradeCardPayload {
  tradeId: string;
  asset: string;
  assetName: string;
  direction: 'higher' | 'lower' | 'rise' | 'fall';
  stake: string;
  payout: string;
  barrier: string;
  expiryDate: string;
  status: 'open' | 'won' | 'lost' | 'sold';
  profit?: string;
  entrySpot?: string;
  currentSpot?: string;
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
  | CreateTradeCardPayload
  | TradeCardPayload
  | BotPayload
  | PortfolioSnapshotPayload
  | PortfolioTablePayload
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
