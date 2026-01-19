import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type { BaseCard, ChatMessage, UIEvent, CardStatus, ChatSession } from '../types';
import * as supabaseService from '../services/supabase';

interface ChatState {
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  activeCards: BaseCard[];
  archivedCards: BaseCard[];
  favoriteCards: BaseCard[];
  isTyping: boolean;
  isLoading: boolean;
}

type ChatAction =
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'SET_CURRENT_SESSION'; payload: string | null }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_CARD'; payload: BaseCard }
  | { type: 'SET_CARDS'; payload: BaseCard[] }
  | { type: 'ARCHIVE_CARD'; payload: string }
  | { type: 'FAVORITE_CARD'; payload: string }
  | { type: 'UNFAVORITE_CARD'; payload: string }
  | { type: 'HIDE_CARD'; payload: string }
  | { type: 'RESET_CHAT' };

const initialState: ChatState = {
  currentSessionId: null,
  sessions: [],
  messages: [],
  activeCards: [],
  archivedCards: [],
  favoriteCards: [],
  isTyping: false,
  isLoading: true,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload, isLoading: false };

    case 'SET_CURRENT_SESSION':
      return { ...state, currentSessionId: action.payload };

    case 'ADD_SESSION':
      return { ...state, sessions: [action.payload, ...state.sessions] };

    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };

    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.payload),
        currentSessionId: state.currentSessionId === action.payload ? null : state.currentSessionId,
        messages: state.currentSessionId === action.payload ? [] : state.messages,
        activeCards: state.currentSessionId === action.payload ? [] : state.activeCards,
      };

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'ADD_CARD':
      return { ...state, activeCards: [...state.activeCards, action.payload] };

    case 'SET_CARDS': {
      const activeCards = action.payload.filter(c => c.status === 'active');
      const archivedCards = action.payload.filter(c => c.status === 'archived');
      const favoriteCards = action.payload.filter(c => c.isFavorite);
      return { ...state, activeCards, archivedCards, favoriteCards };
    }

    case 'ARCHIVE_CARD': {
      const card = state.activeCards.find(c => c.id === action.payload);
      if (!card) return state;

      return {
        ...state,
        activeCards: state.activeCards.filter(c => c.id !== action.payload),
        archivedCards: [...state.archivedCards, { ...card, status: 'archived' as CardStatus }],
      };
    }

    case 'FAVORITE_CARD': {
      const card = [...state.activeCards, ...state.archivedCards].find(c => c.id === action.payload);
      if (!card || state.favoriteCards.some(c => c.id === action.payload)) return state;

      const updatedCard = { ...card, isFavorite: true };
      return {
        ...state,
        activeCards: state.activeCards.map(c => c.id === action.payload ? updatedCard : c),
        archivedCards: state.archivedCards.map(c => c.id === action.payload ? updatedCard : c),
        favoriteCards: [...state.favoriteCards, updatedCard],
      };
    }

    case 'UNFAVORITE_CARD':
      return {
        ...state,
        activeCards: state.activeCards.map(c =>
          c.id === action.payload ? { ...c, isFavorite: false } : c
        ),
        archivedCards: state.archivedCards.map(c =>
          c.id === action.payload ? { ...c, isFavorite: false } : c
        ),
        favoriteCards: state.favoriteCards.filter(c => c.id !== action.payload),
      };

    case 'HIDE_CARD':
      return {
        ...state,
        activeCards: state.activeCards.filter(c => c.id !== action.payload),
        archivedCards: state.archivedCards.filter(c => c.id !== action.payload),
        favoriteCards: state.favoriteCards.filter(c => c.id !== action.payload),
      };

    case 'RESET_CHAT':
      return {
        ...state,
        currentSessionId: null,
        messages: [],
        activeCards: [],
        isTyping: false,
      };

    default:
      return state;
  }
}

interface ChatContextValue extends ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addMessage: (message: ChatMessage) => Promise<void>;
  setTyping: (typing: boolean) => void;
  processUIEvent: (event: UIEvent) => Promise<void>;
  archiveCard: (cardId: string) => Promise<void>;
  favoriteCard: (cardId: string) => Promise<void>;
  unfavoriteCard: (cardId: string) => Promise<void>;
  hideCard: (cardId: string) => void;
  resetChat: () => void;
  createNewSession: (firstMessage: string) => Promise<string | null>;
  loadSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<Pick<ChatSession, 'title' | 'is_favorite' | 'is_archived'>>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const refreshSessions = useCallback(async () => {
    const sessions = await supabaseService.getChatSessions();
    dispatch({ type: 'SET_SESSIONS', payload: sessions });
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const createNewSession = useCallback(async (firstMessage: string): Promise<string | null> => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    const session = await supabaseService.createChatSession(title);

    if (!session) return null;

    dispatch({ type: 'ADD_SESSION', payload: session });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session.id });
    dispatch({ type: 'SET_MESSAGES', payload: [] });
    dispatch({ type: 'SET_CARDS', payload: [] });

    return session.id;
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });

    const [messages, cards] = await Promise.all([
      supabaseService.getSessionMessages(sessionId),
      supabaseService.getSessionCards(sessionId),
    ]);

    dispatch({ type: 'SET_MESSAGES', payload: messages });
    dispatch({ type: 'SET_CARDS', payload: cards });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const addMessage = useCallback(async (message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });

    if (state.currentSessionId) {
      await supabaseService.addMessageToSession(state.currentSessionId, {
        role: message.role,
        content: message.content,
      });
    }
  }, [state.currentSessionId]);

  const setTyping = useCallback((typing: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: typing });
  }, []);

  const processUIEvent = useCallback(async (event: UIEvent) => {
    if (event.type === 'ADD_CARD' && event.cardType && event.payload) {
      const card: BaseCard = {
        id: event.cardId,
        type: event.cardType,
        status: 'active',
        isFavorite: false,
        createdAt: new Date(),
        payload: event.payload,
      };

      dispatch({ type: 'ADD_CARD', payload: card });

      if (state.currentSessionId) {
        await supabaseService.addCardToSession(state.currentSessionId, card);
      }
    } else if (event.type === 'ARCHIVE_CARD') {
      dispatch({ type: 'ARCHIVE_CARD', payload: event.cardId });
      await supabaseService.updateCardInSession(event.cardId, { status: 'archived' });
    } else if (event.type === 'FAVORITE_CARD') {
      dispatch({ type: 'FAVORITE_CARD', payload: event.cardId });
      await supabaseService.updateCardInSession(event.cardId, { isFavorite: true });
    } else if (event.type === 'HIDE_CARD') {
      dispatch({ type: 'HIDE_CARD', payload: event.cardId });
      await supabaseService.updateCardInSession(event.cardId, { status: 'hidden' });
    }
  }, [state.currentSessionId]);

  const archiveCard = useCallback(async (cardId: string) => {
    dispatch({ type: 'ARCHIVE_CARD', payload: cardId });
    await supabaseService.updateCardInSession(cardId, { status: 'archived' });
  }, []);

  const favoriteCard = useCallback(async (cardId: string) => {
    dispatch({ type: 'FAVORITE_CARD', payload: cardId });
    await supabaseService.updateCardInSession(cardId, { isFavorite: true });
  }, []);

  const unfavoriteCard = useCallback(async (cardId: string) => {
    dispatch({ type: 'UNFAVORITE_CARD', payload: cardId });
    await supabaseService.updateCardInSession(cardId, { isFavorite: false });
  }, []);

  const hideCard = useCallback((cardId: string) => {
    dispatch({ type: 'HIDE_CARD', payload: cardId });
    supabaseService.updateCardInSession(cardId, { status: 'hidden' });
  }, []);

  const resetChat = useCallback(() => {
    dispatch({ type: 'RESET_CHAT' });
  }, []);

  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<Pick<ChatSession, 'title' | 'is_favorite' | 'is_archived'>>
  ) => {
    const success = await supabaseService.updateChatSession(sessionId, updates);
    if (success) {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { id: sessionId, updates },
      });
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    const success = await supabaseService.deleteChatSession(sessionId);
    if (success) {
      dispatch({ type: 'DELETE_SESSION', payload: sessionId });
    }
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      ...state,
      addMessage,
      setTyping,
      processUIEvent,
      archiveCard,
      favoriteCard,
      unfavoriteCard,
      hideCard,
      resetChat,
      createNewSession,
      loadSession,
      updateSession,
      deleteSession,
      refreshSessions,
    }),
    [
      state,
      addMessage,
      setTyping,
      processUIEvent,
      archiveCard,
      favoriteCard,
      unfavoriteCard,
      hideCard,
      resetChat,
      createNewSession,
      loadSession,
      updateSession,
      deleteSession,
      refreshSessions,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
