import { createClient } from '@supabase/supabase-js';
import type { ChatSession, ChatMessage, BaseCard } from '../types';
import type { Drawing, DrawingTag, DrawingTool } from '../store/DrawingToolsContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Chat Drawings (chart drawings per session)
// ============================================

export interface ChatDrawing {
  id: string;
  session_id: string;
  type: Exclude<DrawingTool, 'none'>;
  points: { time: number; price: number }[];
  color: string;
  created_at: Date;
}

export async function getSessionDrawings(sessionId: string): Promise<Drawing[]> {
  console.log('getSessionDrawings called:', { sessionId });
  
  const { data, error } = await supabase
    .from('chat_drawings')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching session drawings:', error);
    return [];
  }

  console.log('Drawings fetched:', data?.length || 0, 'items');

  return (data || []).map(d => ({
    id: d.id,
    type: d.type as Exclude<DrawingTool, 'none'>,
    points: d.points || [],
    color: d.color,
    createdAt: new Date(d.created_at).getTime(),
  }));
}

export async function addSessionDrawing(
  sessionId: string,
  drawing: Drawing
): Promise<boolean> {
  console.log('addSessionDrawing called:', { sessionId, drawingId: drawing.id, drawingType: drawing.type });
  
  const { data, error } = await supabase
    .from('chat_drawings')
    .insert({
      session_id: sessionId,
      type: drawing.type,
      points: drawing.points,
      color: drawing.color,
    })
    .select();

  if (error) {
    console.error('Error adding session drawing:', error);
    return false;
  }

  console.log('Drawing inserted successfully:', data);
  return true;
}

export async function deleteSessionDrawing(drawingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_drawings')
    .delete()
    .eq('id', drawingId);

  if (error) {
    console.error('Error deleting session drawing:', error);
    return false;
  }

  return true;
}

export async function clearSessionDrawings(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_drawings')
    .delete()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error clearing session drawings:', error);
    return false;
  }

  return true;
}

// ============================================
// Chat Tags (drawing snapshots for chat)
// ============================================

export interface ChatTag {
  id: string;
  session_id: string;
  label: string;
  drawing_type: Exclude<DrawingTool, 'none'>;
  drawing_snapshot: {
    points: { time: number; price: number }[];
    color: string;
  };
  created_at: Date;
}

export interface ChatTagWithSnapshot extends DrawingTag {
  id: string;
  snapshot: {
    points: { time: number; price: number }[];
    color: string;
  };
}


export async function getSessionTags(sessionId: string): Promise<ChatTagWithSnapshot[]> {
  console.log('getSessionTags called:', { sessionId });
  
  const { data, error } = await supabase
    .from('chat_tags')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching session tags:', error);
    return [];
  }

  console.log('Tags fetched:', data?.length || 0, 'items');

  return (data || []).map(t => ({
    id: t.id,
    drawingId: t.id,
    type: t.drawing_type as Exclude<DrawingTool, 'none'>,
    label: t.label,
    snapshot: t.drawing_snapshot || { points: [], color: '#3b82f6' },
  }));
}

export async function addSessionTag(
  sessionId: string,
  tag: DrawingTag,
  drawing: Drawing
): Promise<string | null> {
  console.log('addSessionTag called:', { sessionId, tagLabel: tag.label });
  
  const { data, error } = await supabase
    .from('chat_tags')
    .insert({
      session_id: sessionId,
      label: tag.label,
      drawing_type: tag.type,
      drawing_snapshot: {
        points: drawing.points,
        color: drawing.color,
      },
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding session tag:', error);
    return null;
  }

  console.log('Tag inserted successfully:', data?.id);
  return data?.id || null;
}

export async function deleteSessionTag(tagId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_tags')
    .delete()
    .eq('id', tagId);

  if (error) {
    console.error('Error deleting session tag:', error);
    return false;
  }

  return true;
}

export async function clearSessionTags(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_tags')
    .delete()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error clearing session tags:', error);
    return false;
  }

  return true;
}

// ============================================
// Chat Sessions
// ============================================

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


// ============================================
// Chat Messages
// ============================================

export async function addMessageToSession(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<boolean> {
  console.log('addMessageToSession called:', { sessionId, role: message.role, contentLength: message.content.length });
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role: message.role,
      content: message.content,
    })
    .select();

  if (error) {
    console.error('Error adding message:', error);
    return false;
  }

  console.log('Message inserted successfully:', data);

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

// ============================================
// Chat Executions
// ============================================

const EXECUTIONS_TABLE = 'chat_executions';

export async function addExecutionToSession(
  sessionId: string,
  card: Omit<BaseCard, 'createdAt'>
): Promise<boolean> {
  console.log('addExecutionToSession called:', { sessionId, cardId: card.id, cardType: card.type });
  
  const { data, error } = await supabase
    .from(EXECUTIONS_TABLE)
    .insert({
      session_id: sessionId,
      type: card.type,
      status: card.status,
      is_favorite: card.isFavorite,
      payload: card.payload,
    })
    .select();

  if (error) {
    console.error('Error adding execution:', error);
    return false;
  }

  console.log('Execution inserted successfully:', data);

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  return true;
}

export async function getSessionExecutions(sessionId: string): Promise<BaseCard[]> {
  console.log('getSessionExecutions called:', { sessionId });
  
  const { data, error } = await supabase
    .from(EXECUTIONS_TABLE)
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching executions:', error);
    return [];
  }

  console.log('Executions fetched:', data?.length || 0, 'items');

  return (data || []).map(card => ({
    id: card.id,
    type: card.type,
    status: card.status,
    isFavorite: card.is_favorite,
    createdAt: new Date(card.created_at),
    payload: card.payload,
  }));
}

export async function updateSessionExecution(
  executionId: string,
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
    .from(EXECUTIONS_TABLE)
    .update(updateData)
    .eq('id', executionId);

  if (error) {
    console.error('Error updating execution:', error);
    return false;
  }

  return true;
}

// Legacy aliases for backward compatibility
export const addCardToSession = addExecutionToSession;
export const getSessionCards = getSessionExecutions;
export const updateCardInSession = updateSessionExecution;
