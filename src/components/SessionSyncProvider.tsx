import { useEffect, useRef, type ReactNode } from 'react';
import { useChat } from '../store/ChatContext';
import { useDrawingTools } from '../store/DrawingToolsContext';

interface SessionSyncProviderProps {
  children: ReactNode;
}

export function SessionSyncProvider({ children }: SessionSyncProviderProps) {
  const { currentSessionId, sessionDrawings, isLoading } = useChat();
  const { setDrawingsFromSession, clearAllDrawings, clearChatTags } = useDrawingTools();

  const prevSessionIdRef = useRef<string | null>(null);
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    const justFinishedLoading = wasLoading && !isLoading;
    prevLoadingRef.current = isLoading;

    const sessionChanged = prevSessionIdRef.current !== currentSessionId;

    if (sessionChanged) {
      prevSessionIdRef.current = currentSessionId;

      if (!currentSessionId) {
        clearAllDrawings();
        clearChatTags();
        return;
      }

      if (isLoading) {
        clearAllDrawings();
        clearChatTags();
        return;
      }

      clearChatTags();
      return;
    }

    if (justFinishedLoading && currentSessionId) {
      setDrawingsFromSession(sessionDrawings);
      clearChatTags();
    }
  }, [currentSessionId, sessionDrawings, isLoading, setDrawingsFromSession, clearAllDrawings, clearChatTags]);

  return <>{children}</>;
}
