import { useEffect, useRef, type ReactNode } from 'react';
import { useChat } from '../store/ChatContext';
import { useDrawingTools } from '../store/DrawingToolsContext';

interface SessionSyncProviderProps {
  children: ReactNode;
}

/**
 * Component that synchronizes session data (drawings, tags) between
 * ChatContext (Supabase persistence) and DrawingToolsContext (local state)
 */
export function SessionSyncProvider({ children }: SessionSyncProviderProps) {
  const { currentSessionId, sessionDrawings, sessionTags, isLoading } = useChat();
  const { setDrawingsFromSession, setTagsFromSession, clearAllDrawings, clearChatTags } = useDrawingTools();
  
  // Track previous session to detect changes
  const prevSessionIdRef = useRef<string | null>(null);

  // Sync drawings from session to DrawingToolsContext when session changes or data loads
  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;
    
    const sessionChanged = prevSessionIdRef.current !== currentSessionId;
    
    if (sessionChanged) {
      prevSessionIdRef.current = currentSessionId;
    }
    
    if (currentSessionId) {
      // Session loaded - sync drawings and tags from database
      // If session has no drawings, preserve any local drawings (user may have drawn before sending first message)
      const preserveLocal = sessionDrawings.length === 0;
      console.log('SessionSync: Syncing session data', { 
        sessionId: currentSessionId, 
        drawings: sessionDrawings.length, 
        tags: sessionTags.length,
        sessionChanged,
        preserveLocal
      });
      setDrawingsFromSession(sessionDrawings, preserveLocal);
      setTagsFromSession(sessionTags);
    }
    // Note: When there's no session (new chat), we DON'T clear drawings.
    // This allows users to draw on the chart before starting a conversation.
    // Drawings will be persisted when the user sends their first message (which creates a session).
  }, [currentSessionId, sessionDrawings, sessionTags, isLoading, setDrawingsFromSession, setTagsFromSession]);

  return <>{children}</>;
}
