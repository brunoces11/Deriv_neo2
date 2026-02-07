import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type { BaseCard, ChatMessage, UIEvent, CardStatus, ChatSession, CardType } from '../types';
import type { Drawing, DrawingTag } from './DrawingToolsContext';
import * as supabaseService from '../services/supabase';
import type { ChatTagWithSnapshot } from '../services/supabase';
import { markCardAsDeleted } from '../services/deletedCardsStorage';

// Helper to determine which panel a card should go to
function getCardTargetPanel(cardType: CardType): { sidebar: 'left' | 'right'; panel: string } {
  // Trade cards go to left sidebar 'positions' panel
  if (cardType === 'create-trade-card' || cardType === 'trade-card' ||
      cardType === 'card_trade' || cardType === 'card_trade_creator') {
    return { sidebar: 'left', panel: 'positions' };
  }
  
  // Bot cards go to right sidebar 'bots' panel
  if (cardType === 'bot-card' || cardType === 'bot-creator' ||
      cardType === 'card_bot' || cardType === 'card_bot_creator') {
    return { sidebar: 'right', panel: 'bots' };
  }
  
  // Action cards go to right sidebar 'actions' panel
  if (cardType === 'actions-card' || cardType === 'actions-creator' ||
      cardType === 'card_actions' || cardType === 'card_actions_creator') {
    return { sidebar: 'right', panel: 'actions' };
  }
  
  // Everything else (portfolio, etc.) goes to right sidebar 'cards' panel
  return { sidebar: 'right', panel: 'cards' };
}

interface ChatState {
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  activeCards: BaseCard[];
  archivedCards: BaseCard[];
  favoriteCards: BaseCard[];
  sessionDrawings: Drawing[];
  sessionTags: ChatTagWithSnapshot[];
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
  | { type: 'UPDATE_MESSAGE_CONTENT'; payload: { messageId: string; content: string } }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_CARD'; payload: BaseCard }
  | { type: 'SET_CARDS'; payload: BaseCard[] }
  | { type: 'TRANSFORM_CARD'; payload: { cardId: string; newType: CardType; newPayload: Record<string, unknown> } }
  | { type: 'UPDATE_CARD_PAYLOAD'; payload: { cardId: string; updates: Record<string, unknown> } }
  | { type: 'DELETE_CARD_WITH_TWIN'; payload: string }
  | { type: 'ARCHIVE_CARD'; payload: string }
  | { type: 'FAVORITE_CARD'; payload: string }
  | { type: 'UNFAVORITE_CARD'; payload: string }
  | { type: 'HIDE_CARD'; payload: string }
  | { type: 'SET_SESSION_DRAWINGS'; payload: Drawing[] }
  | { type: 'ADD_SESSION_DRAWING'; payload: Drawing }
  | { type: 'REMOVE_SESSION_DRAWING'; payload: string }
  | { type: 'SET_SESSION_TAGS'; payload: ChatTagWithSnapshot[] }
  | { type: 'ADD_SESSION_TAG'; payload: ChatTagWithSnapshot }
  | { type: 'REMOVE_SESSION_TAG'; payload: string }
  | { type: 'RESET_CHAT' };

const initialState: ChatState = {
  currentSessionId: null,
  sessions: [],
  messages: [],
  activeCards: [],
  archivedCards: [],
  favoriteCards: [],
  sessionDrawings: [],
  sessionTags: [],
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

    case 'UPDATE_MESSAGE_CONTENT': {
      const { messageId, content } = action.payload;
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === messageId ? { ...msg, content } : msg
        ),
      };
    }

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'ADD_CARD':
      return { ...state, activeCards: [...state.activeCards, action.payload] };

    case 'TRANSFORM_CARD': {
      const { cardId, newType, newPayload } = action.payload;
      // Get the base ID (without 'panel-' prefix) for twin matching
      const baseId = cardId.replace(/^panel-/, '');
      const panelId = cardId.startsWith('panel-') ? cardId : `panel-${cardId}`;
      
      return {
        ...state,
        activeCards: state.activeCards.map(card => {
          // Match both the inline card (baseId) and panel card (panelId)
          const cardBaseId = card.id.replace(/^panel-/, '');
          if (cardBaseId === baseId || card.id === panelId) {
            return { ...card, type: newType, payload: newPayload };
          }
          return card;
        }),
        archivedCards: state.archivedCards.map(card => {
          const cardBaseId = card.id.replace(/^panel-/, '');
          if (cardBaseId === baseId || card.id === panelId) {
            return { ...card, type: newType, payload: newPayload };
          }
          return card;
        }),
        favoriteCards: state.favoriteCards.map(card => {
          const cardBaseId = card.id.replace(/^panel-/, '');
          if (cardBaseId === baseId || card.id === panelId) {
            return { ...card, type: newType, payload: newPayload };
          }
          return card;
        }),
      };
    }

    case 'UPDATE_CARD_PAYLOAD': {
      const { cardId, updates } = action.payload;
      // Get the base ID for twin matching
      const baseId = cardId.replace(/^panel-/, '');
      
      return {
        ...state,
        activeCards: state.activeCards.map(card => {
          const cardBaseId = card.id.replace(/^panel-/, '');
          if (cardBaseId === baseId) {
            return { ...card, payload: { ...card.payload, ...updates } };
          }
          return card;
        }),
        archivedCards: state.archivedCards.map(card => {
          const cardBaseId = card.id.replace(/^panel-/, '');
          if (cardBaseId === baseId) {
            return { ...card, payload: { ...card.payload, ...updates } };
          }
          return card;
        }),
        favoriteCards: state.favoriteCards.map(card => {
          const cardBaseId = card.id.replace(/^panel-/, '');
          if (cardBaseId === baseId) {
            return { ...card, payload: { ...card.payload, ...updates } };
          }
          return card;
        }),
      };
    }

    case 'DELETE_CARD_WITH_TWIN': {
      const cardId = action.payload;
      // Get the base ID for twin matching - remove 'panel-' prefix if present
      const baseId = cardId.replace(/^panel-/, '');
      
      // Filter out both the inline card and its panel twin
      const filterTwins = (cards: BaseCard[]) => 
        cards.filter(card => {
          const cardBaseId = card.id.replace(/^panel-/, '');
          return cardBaseId !== baseId;
        });
      
      return {
        ...state,
        activeCards: filterTwins(state.activeCards),
        archivedCards: filterTwins(state.archivedCards),
        favoriteCards: filterTwins(state.favoriteCards),
      };
    }

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

    case 'SET_SESSION_DRAWINGS':
      return { ...state, sessionDrawings: action.payload };

    case 'ADD_SESSION_DRAWING':
      return { ...state, sessionDrawings: [...state.sessionDrawings, action.payload] };

    case 'REMOVE_SESSION_DRAWING':
      return { ...state, sessionDrawings: state.sessionDrawings.filter(d => d.id !== action.payload) };

    case 'SET_SESSION_TAGS':
      return { ...state, sessionTags: action.payload };

    case 'ADD_SESSION_TAG':
      return { ...state, sessionTags: [...state.sessionTags, action.payload] };

    case 'REMOVE_SESSION_TAG':
      return { ...state, sessionTags: state.sessionTags.filter(t => t.id !== action.payload) };

    case 'RESET_CHAT':
      return {
        ...state,
        currentSessionId: null,
        messages: [],
        activeCards: [],
        sessionDrawings: [],
        sessionTags: [],
        isTyping: false,
      };

    default:
      return state;
  }
}

interface ChatContextValue extends ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  sessionDrawings: Drawing[];
  sessionTags: ChatTagWithSnapshot[];
  addMessage: (message: ChatMessage, sessionId?: string) => Promise<void>;
  updateMessageContent: (messageId: string, content: string) => void;
  setTyping: (typing: boolean) => void;
  processUIEvent: (event: UIEvent, sessionId?: string, onCardAdded?: (sidebar: 'left' | 'right', panel: string) => void) => Promise<void>;
  transformCard: (cardId: string, newType: CardType, newPayload: Record<string, unknown>) => void;
  updateCardPayload: (cardId: string, updates: Record<string, unknown>) => void;
  deleteCardWithTwin: (cardId: string) => Promise<void>;
  getCardById: (cardId: string) => BaseCard | undefined;
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
  // Drawing persistence
  addDrawingToSession: (drawing: Drawing) => Promise<boolean>;
  updateDrawingInSession: (drawingId: string, text: string) => Promise<boolean>;
  removeDrawingFromSession: (drawingId: string) => Promise<boolean>;
  // Tag persistence
  addTagToSession: (tag: DrawingTag, drawing: Drawing) => Promise<ChatTagWithSnapshot | null>;
  removeTagFromSession: (tagId: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// Storage key for persisting current session
const SESSION_STORAGE_KEY = 'deriv-neo-current-session';

// Load current session ID from localStorage
function loadCurrentSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

// Save current session ID to localStorage
function saveCurrentSessionId(sessionId: string | null) {
  try {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const refreshSessions = useCallback(async () => {
    const sessions = await supabaseService.getChatSessions();
    dispatch({ type: 'SET_SESSIONS', payload: sessions });
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    console.log('loadSession called:', sessionId);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });

    const [messages, cards, drawings, tags] = await Promise.all([
      supabaseService.getSessionMessages(sessionId),
      supabaseService.getSessionCards(sessionId),
      supabaseService.getSessionDrawings(sessionId),
      supabaseService.getSessionTags(sessionId),
    ]);

    console.log('loadSession data loaded:', { 
      sessionId, 
      messagesCount: messages.length, 
      cardsCount: cards.length,
      drawingsCount: drawings.length,
      tagsCount: tags.length 
    });

    dispatch({ type: 'SET_MESSAGES', payload: messages });
    dispatch({ type: 'SET_CARDS', payload: cards });
    dispatch({ type: 'SET_SESSION_DRAWINGS', payload: drawings });
    dispatch({ type: 'SET_SESSION_TAGS', payload: tags });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const createNewSession = useCallback(async (firstMessage: string): Promise<string | null> => {
    // Remove tags from title to prevent them from appearing in session cards
    const cleanMessage = firstMessage.replace(/\[@([A-Za-z0-9\s]+?)(?:-(\d+))?\]\s*/g, '').trim();
    const title = cleanMessage.slice(0, 50) + (cleanMessage.length > 50 ? '...' : '');
    console.log('createNewSession called:', { title });
    
    const session = await supabaseService.createChatSession(title);

    if (!session) {
      console.error('Failed to create session in Supabase');
      return null;
    }

    console.log('Session created successfully:', session.id);
    
    dispatch({ type: 'ADD_SESSION', payload: session });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session.id });
    dispatch({ type: 'SET_MESSAGES', payload: [] });
    dispatch({ type: 'SET_CARDS', payload: [] });
    dispatch({ type: 'SET_SESSION_DRAWINGS', payload: [] });
    dispatch({ type: 'SET_SESSION_TAGS', payload: [] });

    return session.id;
  }, []);

  // Load sessions and restore last active session on mount
  useEffect(() => {
    const initializeSessions = async () => {
      await refreshSessions();
      
      // Try to restore last active session
      const savedSessionId = loadCurrentSessionId();
      if (savedSessionId) {
        console.log('Restoring last active session:', savedSessionId);
        // Verify session still exists before loading
        const sessions = await supabaseService.getChatSessions();
        const sessionExists = sessions.some(s => s.id === savedSessionId);
        
        if (sessionExists) {
          await loadSession(savedSessionId);
        } else {
          console.warn('Saved session no longer exists, clearing storage');
          saveCurrentSessionId(null);
        }
      }
    };
    
    initializeSessions();
  }, [loadSession, refreshSessions]);

  // Save currentSessionId to localStorage whenever it changes
  useEffect(() => {
    saveCurrentSessionId(state.currentSessionId);
  }, [state.currentSessionId]);

  const addMessage = useCallback(async (message: ChatMessage, sessionId?: string) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });

    const targetSessionId = sessionId || state.currentSessionId;
    console.log('addMessage called:', { 
      providedSessionId: sessionId, 
      stateSessionId: state.currentSessionId, 
      targetSessionId,
      messageRole: message.role 
    });
    
    if (targetSessionId) {
      const success = await supabaseService.addMessageToSession(targetSessionId, {
        role: message.role,
        content: message.content,
      });
      if (!success) {
        console.error('Failed to persist message to session:', targetSessionId);
      } else {
        console.log('Message persisted successfully to session:', targetSessionId);
      }
    } else {
      console.warn('No session ID available for message persistence');
    }
  }, [state.currentSessionId]);

  const updateMessageContent = useCallback(async (messageId: string, content: string) => {
    // Update local state immediately for responsive UI
    dispatch({ type: 'UPDATE_MESSAGE_CONTENT', payload: { messageId, content } });
    
    // Persist to Supabase in background (don't await to avoid blocking UI)
    if (content) {
      supabaseService.updateMessageContent(messageId, content).catch(err => {
        console.error('Failed to persist message update:', err);
      });
    }
  }, []);

  const setTyping = useCallback((typing: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: typing });
  }, []);

  const processUIEvent = useCallback(async (event: UIEvent, sessionId?: string, onCardAdded?: (sidebar: 'left' | 'right', panel: string) => void) => {
    const targetSessionId = sessionId || state.currentSessionId;
    console.log('processUIEvent called:', { 
      eventType: event.type, 
      providedSessionId: sessionId, 
      stateSessionId: state.currentSessionId,
      targetSessionId 
    });
    
    if (event.type === 'ADD_CARD' && event.cardType && event.payload) {
      // REGRA: Cards de portfolio-table são singleton no painel
      // Podem aparecer múltiplas vezes inline, mas só uma vez no painel
      const isPortfolioTableCard = event.cardType === 'portfolio-table-complete' || 
                                    event.cardType === 'card_portfolio';
      
      if (isPortfolioTableCard) {
        // Verificar se já existe um card de portfolio-table no activeCards
        const existingPortfolioTable = state.activeCards.find(
          c => c.type === 'portfolio-table-complete' || c.type === 'card_portfolio'
        );
        
        if (existingPortfolioTable) {
          console.log('Portfolio table card already exists, skipping duplicate:', existingPortfolioTable.id);
          return; // Não adicionar duplicata
        }
      }
      
      const card: BaseCard = {
        id: event.cardId,
        type: event.cardType,
        status: 'active',
        isFavorite: false,
        createdAt: new Date(),
        payload: event.payload,
      };

      console.log('Adding card to state:', card.id, card.type);
      dispatch({ type: 'ADD_CARD', payload: card });

      // Notify which panel should be activated
      if (onCardAdded) {
        const targetPanel = getCardTargetPanel(event.cardType as CardType);
        onCardAdded(targetPanel.sidebar, targetPanel.panel);
      }

      if (targetSessionId) {
        console.log('Persisting card to session:', targetSessionId);
        const success = await supabaseService.addCardToSession(targetSessionId, card);
        console.log('Card persistence result:', success);
      } else {
        console.warn('No session ID for card persistence');
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
  }, [state.currentSessionId, state.activeCards]);

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

  const transformCard = useCallback((cardId: string, newType: CardType, newPayload: Record<string, unknown>) => {
    dispatch({ 
      type: 'TRANSFORM_CARD', 
      payload: { cardId, newType, newPayload } 
    });
    
    // Persist transformation to Supabase
    // Panel cards are the ones persisted, so we use the panel ID
    const panelId = cardId.startsWith('panel-') ? cardId : `panel-${cardId}`;
    supabaseService.updateCardInSession(panelId, { 
      type: newType, 
      payload: newPayload 
    });
  }, []);

  const updateCardPayload = useCallback((cardId: string, updates: Record<string, unknown>) => {
    dispatch({
      type: 'UPDATE_CARD_PAYLOAD',
      payload: { cardId, updates }
    });
  }, []);

  const deleteCardWithTwin = useCallback(async (cardId: string) => {
    console.log('[ChatContext] deleteCardWithTwin called:', cardId);
    
    try {
      // Get the base ID (without 'panel-' prefix) for twin matching
      const baseId = cardId.replace(/^panel-/, '');
      const panelId = `panel-${baseId}`;
      
      // Find the panel card to get its Supabase ID (if it exists)
      const panelCard = state.activeCards.find(c => c.id === panelId);
      
      // Mark card as permanently deleted (persisted in localStorage)
      // This prevents the card from being recreated when the page is refreshed
      markCardAsDeleted(baseId);
      
      // Delete from UI state first (removes both twins)
      dispatch({ type: 'DELETE_CARD_WITH_TWIN', payload: cardId });
      
      // Delete from Supabase if the panel card exists
      // Panel cards are the ones persisted to Supabase
      if (panelCard) {
        await supabaseService.deleteCardFromSession(panelCard.id);
      }
      
      console.log('[ChatContext] Card twins deleted permanently:', { baseId, panelId });
    } catch (error) {
      console.error('[ChatContext] Error deleting card twins:', error);
    }
  }, [state.activeCards]);

  const getCardById = useCallback((cardId: string): BaseCard | undefined => {
    // Get the base ID for twin matching
    const baseId = cardId.replace(/^panel-/, '');
    
    // Search in all card arrays
    const allCards = [...state.activeCards, ...state.archivedCards, ...state.favoriteCards];
    
    // First try exact match, then try base ID match
    return allCards.find(card => card.id === cardId) || 
           allCards.find(card => card.id.replace(/^panel-/, '') === baseId);
  }, [state.activeCards, state.archivedCards, state.favoriteCards]);

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

  // Drawing persistence functions
  const addDrawingToSession = useCallback(async (drawing: Drawing): Promise<boolean> => {
    console.log('addDrawingToSession called:', { 
      drawingId: drawing.id, 
      currentSessionId: state.currentSessionId 
    });
    
    if (!state.currentSessionId) {
      console.warn('No current session ID for drawing persistence');
      return false;
    }
    
    const success = await supabaseService.addSessionDrawing(state.currentSessionId, drawing);
    if (success) {
      dispatch({ type: 'ADD_SESSION_DRAWING', payload: drawing });
      console.log('Drawing added to session state');
    }
    return success;
  }, [state.currentSessionId]);

  const removeDrawingFromSession = useCallback(async (drawingId: string): Promise<boolean> => {
    const success = await supabaseService.deleteSessionDrawing(drawingId);
    if (success) {
      dispatch({ type: 'REMOVE_SESSION_DRAWING', payload: drawingId });
    }
    return success;
  }, []);

  const updateDrawingInSession = useCallback(async (drawingId: string, text: string): Promise<boolean> => {
    const success = await supabaseService.updateSessionDrawingText(drawingId, text);
    return success;
  }, []);

  // Tag persistence functions
  const addTagToSession = useCallback(async (
    tag: DrawingTag,
    drawing: Drawing
  ): Promise<ChatTagWithSnapshot | null> => {
    if (!state.currentSessionId) return null;
    
    const tagId = await supabaseService.addSessionTag(state.currentSessionId, tag, drawing);
    if (!tagId) return null;

    const newTag: ChatTagWithSnapshot = {
      id: tagId,
      drawingId: tagId,
      type: tag.type,
      label: tag.label,
      snapshot: {
        points: drawing.points,
        color: drawing.color,
      },
    };
    
    dispatch({ type: 'ADD_SESSION_TAG', payload: newTag });
    return newTag;
  }, [state.currentSessionId]);

  const removeTagFromSession = useCallback(async (tagId: string): Promise<boolean> => {
    const success = await supabaseService.deleteSessionTag(tagId);
    if (success) {
      dispatch({ type: 'REMOVE_SESSION_TAG', payload: tagId });
    }
    return success;
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      ...state,
      addMessage,
      updateMessageContent,
      setTyping,
      processUIEvent,
      transformCard,
      updateCardPayload,
      deleteCardWithTwin,
      getCardById,
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
      addDrawingToSession,
      updateDrawingInSession,
      removeDrawingFromSession,
      addTagToSession,
      removeTagFromSession,
    }),
    [
      state,
      addMessage,
      updateMessageContent,
      setTyping,
      processUIEvent,
      transformCard,
      updateCardPayload,
      deleteCardWithTwin,
      getCardById,
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
      addDrawingToSession,
      updateDrawingInSession,
      removeDrawingFromSession,
      addTagToSession,
      removeTagFromSession,
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
