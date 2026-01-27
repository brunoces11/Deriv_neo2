import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { useDrawingTools, DRAWING_COLORS } from '../../store/DrawingToolsContext';
import { callLangflow } from '../../services/langflowApi';
import { simulateLangFlowResponse } from '../../services/mockSimulation';
import type { ChatMessage } from '../../types';

interface ChatInputProps {
  displayMode?: 'center' | 'sidebar';
}

export function ChatInput({ displayMode = 'center' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    addMessage, 
    setTyping, 
    isTyping, 
    processUIEvent, 
    currentSessionId, 
    createNewSession,
    addTagToSession,
  } = useChat();
  const { theme } = useTheme();
  const { chatTags, removeTagFromChat, clearChatTags, selectDrawing, selectedDrawingId, drawings } = useDrawingTools();

  const isSidebar = displayMode === 'sidebar';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = async () => {
    if ((!message.trim() && chatTags.length === 0) || isTyping) return;

    // Build message content with tags prefix
    const tagsPrefix = chatTags.length > 0 
      ? chatTags.map(tag => `[@${tag.label}]`).join(' ') + ' '
      : '';
    const messageContent = tagsPrefix + message.trim();
    
    // Store tags to persist before clearing
    const tagsToSave = [...chatTags];
    
    setMessage('');
    clearChatTags(); // Clear tags after sending
    setTyping(true);

    try {
      // Get or create session ID
      let sessionId = currentSessionId;
      
      if (!sessionId) {
        sessionId = await createNewSession(messageContent);
        if (!sessionId) {
          throw new Error('Failed to create session');
        }
      }

      // Persist tags to session (as snapshots)
      if (tagsToSave.length > 0) {
        for (const tag of tagsToSave) {
          const drawing = drawings.find(d => d.id === tag.drawingId);
          if (drawing) {
            await addTagToSession(tag, drawing);
          }
        }
      }

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };

      // Pass sessionId explicitly to ensure message is saved to correct session
      await addMessage(userMessage, sessionId);

      // Try Langflow API first, fallback to mock simulation
      let response;
      try {
        response = await callLangflow(userMessage.content, sessionId);
        console.log('[ChatInput] Langflow response received');
      } catch (langflowError) {
        console.warn('[ChatInput] Langflow failed, using mock simulation:', langflowError);
        response = await simulateLangFlowResponse(userMessage.content);
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.chat_message,
        timestamp: new Date(),
      };

      // Pass sessionId explicitly
      await addMessage(assistantMessage, sessionId);

      for (let i = 0; i < response.ui_events.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)));
        // Pass sessionId explicitly
        await processUIEvent(response.ui_events[i], sessionId);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      await addMessage(errorMessage);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div className={`relative rounded-2xl ${isSidebar ? 'shadow-lg shadow-black/20' : ''}`}>
        <div
          className={`absolute -inset-[1px] rounded-2xl transition-all duration-300 ${
            isFocused
              ? 'bg-gradient-to-r from-red-500/50 via-rose-400/50 to-red-500/50 animate-pulse'
              : 'bg-transparent'
          }`}
        />

        <div className={`relative rounded-2xl border transition-colors ${
          theme === 'dark'
            ? isSidebar 
              ? 'bg-zinc-800 border-zinc-600'
              : 'bg-zinc-900 border-zinc-700/50'
            : 'bg-white border-gray-200'
        }`}>
          {/* Drawing Tags */}
          {chatTags.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 px-3 pt-2 ${isSidebar ? 'pb-0' : 'pb-1'}`}>
              {chatTags.map((tag) => {
                const colors = DRAWING_COLORS[tag.type];
                const isTagSelected = selectedDrawingId === tag.drawingId;
                
                return (
                  <span
                    key={tag.drawingId}
                    onClick={() => selectDrawing(isTagSelected ? null : tag.drawingId)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none ${
                      isTagSelected
                        ? `${colors.tagBgSelected} ${colors.tagTextSelected} border-2 ${colors.tagBorderSelected}`
                        : `${colors.tagBg} ${colors.tagText} border ${colors.tagBorder} hover:opacity-80`
                    }`}
                  >
                    @{tag.label}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTagFromChat(tag.drawingId);
                      }}
                      className={`ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/20 ${
                        isTagSelected ? colors.tagTextSelected : colors.tagText
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className={`flex items-end gap-2 ${isSidebar ? 'p-1.5' : 'p-2'}`}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isSidebar ? "Message..." : "Message FlowChat..."}
              rows={1}
              disabled={isTyping}
              className={`flex-1 bg-transparent resize-none focus:outline-none py-2 px-3 disabled:opacity-50 transition-colors ${
                isSidebar ? 'text-xs max-h-[80px]' : 'text-sm max-h-[150px]'
              } ${
                theme === 'dark'
                  ? 'text-white placeholder-zinc-500'
                  : 'text-gray-900 placeholder-gray-400'
              }`}
            />
            <button
              onClick={handleSubmit}
              disabled={(!message.trim() && chatTags.length === 0) || isTyping}
              className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isSidebar ? 'w-8 h-8' : 'w-10 h-10'
              } ${
                (message.trim() || chatTags.length > 0) && !isTyping
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95'
                  : theme === 'dark'
                    ? isSidebar 
                      ? 'bg-zinc-700 text-zinc-400'
                      : 'bg-zinc-800 text-zinc-500'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isTyping ? (
                <Loader2 className={`animate-spin ${isSidebar ? 'w-4 h-4' : 'w-5 h-5'}`} />
              ) : (
                <Send className={isSidebar ? 'w-4 h-4' : 'w-5 h-5'} />
              )}
            </button>
          </div>
        </div>
      </div>

      {!isSidebar && (
        <p className={`text-xs text-center mt-3 transition-colors ${
          theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
        }`}>
          FlowChat may produce inaccurate information. Cards are dynamically generated.
        </p>
      )}
    </div>
  );
}
