export type CardType =
  // Legacy names (for backward compatibility)
  | 'card_portfolio_exemple_compacto'
  | 'card_portfolio_sidebar'
  | 'card_portfolio'
  | 'card_portfolio_performance'
  | 'card_market_analyses'
  | 'card_trade_creator'
  | 'card_trade'
  | 'card_actions_creator'
  | 'card_actions'
  | 'card_bot_creator'
  | 'card_bot'
  // New kebab-case names (used by placeholder system)
  | 'portfolio-table-complete'
  | 'portfolio-sidebar'
  | 'portfolio-snapshot'
  | 'portfolio-performance'
  | 'market-analyses'
  | 'create-trade-card'
  | 'trade-card'
  | 'trade-spot-card'
  | 'actions-card'
  | 'actions-creator'
  | 'bot-creator'
  | 'bot-card';

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
  title?: string; // Dynamic title from LLM
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
  title?: string; // Dynamic title from LLM
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
  title?: string; // Dynamic title from LLM
  botId: string;
  name: string;
  strategy: string;
  status: 'active' | 'paused' | 'stopped';
  performance?: string;
}

export interface PortfolioSnapshotPayload {
  title?: string; // Dynamic title from LLM
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
  title?: string; // Dynamic title from LLM
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
  title?: string; // Dynamic title from LLM
  actionId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastExecution?: string;
  trigger?: {
    type: 'schedule' | 'price' | 'event';
    value: string;
  };
  action?: {
    type: string;
    asset?: string;
    amount?: string;
  };
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    day?: string;
  };
  condition?: {
    type: string;
    operator: string;
    value: string;
  };
}

export interface ActionsCreatorPayload {
  title?: string; // Dynamic title from LLM
  actionName: string;
  trigger: {
    type: 'schedule' | 'price' | 'event';
    value: string;
  };
  action: {
    type: string;
    asset?: string;
    amount?: string;
  };
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    day?: string;
  };
  condition?: {
    type: string;
    operator: string;
    value: string;
  };
}

export interface BotCreatorPayload {
  title?: string; // Dynamic title from LLM
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
  title?: string; // Dynamic title from LLM
  botId: string;
  name: string;
  strategy: string;
  status: 'active' | 'paused' | 'stopped';
  performance?: string;
  lastRun?: string;
  trigger?: {
    type: string;
    value?: string;
  };
  action?: {
    type: string;
    asset: string;
  };
  target?: {
    type: string;
    value: string;
  };
  condition?: {
    type: string;
    operator: string;
    value: string;
  };
}

export interface TradeSpotCardPayload {
  title?: string; // Dynamic title from LLM
  pair: string; // e.g., 'BTC/USD', 'XAU/USD'
  amount: number; // Amount in USD
  priceMode: 'market' | 'target';
  price: number; // Current market price
  targetPrice?: number; // Target price if priceMode is 'target'
  executionState: 'open' | 'bought' | 'sold';
  executionPrice?: number;
  executionTime?: string; // ISO string
}

export type CardPayload =
  | CreateTradeCardPayload
  | TradeCardPayload
  | BotPayload
  | PortfolioSnapshotPayload
  | PortfolioTablePayload
  | ActionsCardPayload
  | BotCreatorPayload
  | BotCardPayload
  | TradeSpotCardPayload;

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
