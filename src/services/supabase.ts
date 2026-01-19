import { createClient } from '@supabase/supabase-js';
import type { ChatSession, ChatMessage, BaseCard } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createChatSession(title: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ title })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating chat session:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    is_favorite: data.is_favorite,
    is_archived: data.is_archived,
    user_id: data.user_id,
  };
}

export async function getChatSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }

  return (data || []).map(session => ({
    id: session.id,
    title: session.title,
    created_at: new Date(session.created_at),
    updated_at: new Date(session.updated_at),
    is_favorite: session.is_favorite,
    is_archived: session.is_archived,
    user_id: session.user_id,
  }));
}

export async function updateChatSession(
  sessionId: string,
  updates: Partial<Pick<ChatSession, 'title' | 'is_favorite' | 'is_archived'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating chat session:', error);
    return false;
  }

  return true;
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }

  return true;
}

export async function addMessageToSession(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<boolean> {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role: message.role,
      content: message.content,
    });

  if (error) {
    console.error('Error adding message:', error);
    return false;
  }

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  return true;
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date(msg.created_at),
  }));
}

export async function addCardToSession(
  sessionId: string,
  card: Omit<BaseCard, 'createdAt'>
): Promise<boolean> {
  const { error } = await supabase
    .from('chat_cards')
    .insert({
      id: card.id,
      session_id: sessionId,
      type: card.type,
      status: card.status,
      is_favorite: card.isFavorite,
      payload: card.payload,
    });

  if (error) {
    console.error('Error adding card:', error);
    return false;
  }

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  return true;
}

export async function getSessionCards(sessionId: string): Promise<BaseCard[]> {
  const { data, error } = await supabase
    .from('chat_cards')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cards:', error);
    return [];
  }

  return (data || []).map(card => ({
    id: card.id,
    type: card.type,
    status: card.status,
    isFavorite: card.is_favorite,
    createdAt: new Date(card.created_at),
    payload: card.payload,
  }));
}

export async function updateCardInSession(
  cardId: string,
  updates: Partial<Pick<BaseCard, 'status' | 'isFavorite'>>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }
  if (updates.isFavorite !== undefined) {
    updateData.is_favorite = updates.isFavorite;
  }

  const { error } = await supabase
    .from('chat_cards')
    .update(updateData)
    .eq('id', cardId);

  if (error) {
    console.error('Error updating card:', error);
    return false;
  }

  return true;
}
