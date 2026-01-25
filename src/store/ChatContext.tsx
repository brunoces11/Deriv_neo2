import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type { BaseCard, ChatMessage, UIEvent, CardStatus, ChatSession } from '../types';
import type { Drawing, DrawingTag } from './DrawingToolsContext';
import * as supabaseService from '../services/supabase';
import type { ChatTagWithSnapshot } from '../services/supabase';

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
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_CARD'; payload: BaseCard }
  | { type: 'SET_CARDS'; payload: BaseCard[] }
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
  setTyping: (typing: boolean) => void;
  processUIEvent: (event: UIEvent, sessionId?: string) => Promise<void>;
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

  const setTyping = useCallback((typing: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: typing });
  }, []);

  const processUIEvent = useCallback(async (event: UIEvent, sessionId?: string) => {
    const targetSessionId = sessionId || state.currentSessionId;
    console.log('processUIEvent called:', { 
      eventType: event.type, 
      providedSessionId: sessionId, 
      stateSessionId: state.currentSessionId,
      targetSessionId 
    });
    
    if (event.type === 'ADD_CARD' && event.cardType && event.payload) {
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
      addDrawingToSession,
      updateDrawingInSession,
      removeDrawingFromSession,
      addTagToSession,
      removeTagFromSession,
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
