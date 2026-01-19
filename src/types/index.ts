export type CardType = 'intent-summary' | 'action-ticket' | 'bot' | 'portfolio-snapshot';

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

export type CardPayload =
  | IntentSummaryPayload
  | ActionTicketPayload
  | BotPayload
  | PortfolioSnapshotPayload;

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
