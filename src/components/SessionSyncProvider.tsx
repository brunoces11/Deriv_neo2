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
      // Session loaded - sync drawings and tags
      console.log('SessionSync: Syncing session data', { 
        sessionId: currentSessionId, 
        drawings: sessionDrawings.length, 
        tags: sessionTags.length,
        sessionChanged
      });
      setDrawingsFromSession(sessionDrawings);
      setTagsFromSession(sessionTags);
    } else if (!currentSessionId && sessionChanged) {
      // No session (new chat) - clear everything
      console.log('SessionSync: Clearing session data');
      clearAllDrawings();
      clearChatTags();
    }
  }, [currentSessionId, sessionDrawings, sessionTags, isLoading, setDrawingsFromSession, setTagsFromSession, clearAllDrawings, clearChatTags]);

  return <>{children}</>;
}
