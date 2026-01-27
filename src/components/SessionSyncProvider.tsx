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

  // Sync drawings from session to DrawingToolsContext when session changes
  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;
    
    const sessionChanged = prevSessionIdRef.current !== currentSessionId;
    
    if (sessionChanged) {
      prevSessionIdRef.current = currentSessionId;
      
      // Session changed - ALWAYS clear old drawings and load new ones
      // This ensures each chat has its own isolated drawings (like Photoshop layers)
      if (currentSessionId) {
        // Load drawings for the new session (may be empty array)
        setDrawingsFromSession(sessionDrawings);
        setTagsFromSession(sessionTags);
      } else {
        // No session selected (new chat) - clear all drawings
        clearAllDrawings();
        clearChatTags();
      }
    }
  }, [currentSessionId, sessionDrawings, sessionTags, isLoading, setDrawingsFromSession, setTagsFromSession, clearAllDrawings, clearChatTags]);

  return <>{children}</>;
}
