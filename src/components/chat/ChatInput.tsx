import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { simulateLangFlowResponse } from '../../services/mockSimulation';
import type { ChatMessage } from '../../types';

interface ChatInputProps {
  displayMode?: 'center' | 'sidebar';
}

export function ChatInput({ displayMode = 'center' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage, setTyping, isTyping, processUIEvent, currentSessionId, createNewSession } = useChat();
  const { theme } = useTheme();

  const isSidebar = displayMode === 'sidebar';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = async () => {
    if (!message.trim() || isTyping) return;

    const messageContent = message.trim();
    setMessage('');
    setTyping(true);

    try {
      if (!currentSessionId) {
        await createNewSession(messageContent);
      }

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };

      await addMessage(userMessage);

      const response = await simulateLangFlowResponse(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.chat_message,
        timestamp: new Date(),
      };

      await addMessage(assistantMessage);

      for (let i = 0; i < response.ui_events.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)));
        await processUIEvent(response.ui_events[i]);
      }
    } catch {
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
      <div className="relative rounded-2xl">
        <div
          className={`absolute -inset-[1px] rounded-2xl transition-all duration-300 ${
            isFocused
              ? 'bg-gradient-to-r from-red-500/50 via-rose-400/50 to-red-500/50 animate-pulse'
              : 'bg-transparent'
          }`}
        />

        <div className={`relative rounded-2xl border transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-900 border-zinc-700/50'
            : 'bg-white border-gray-200'
        }`}>
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
              disabled={!message.trim() || isTyping}
              className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isSidebar ? 'w-8 h-8' : 'w-10 h-10'
              } ${
                message.trim() && !isTyping
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95'
                  : theme === 'dark'
                    ? 'bg-zinc-800 text-zinc-500'
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
