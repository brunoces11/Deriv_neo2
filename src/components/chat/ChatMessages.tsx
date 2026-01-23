import { useRef, useEffect } from 'react';
import { User, Bot, Loader2 } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import type { ChatMessage } from '../../types';

interface ChatMessagesProps {
  displayMode?: 'center' | 'sidebar';
}

export function ChatMessages({ displayMode = 'center' }: ChatMessagesProps) {
  const { messages, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSidebar = displayMode === 'sidebar';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className={`space-y-4 ${isSidebar ? 'py-3' : 'py-6 space-y-6'}`}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} isSidebar={isSidebar} />
      ))}
      {isTyping && <TypingIndicator isSidebar={isSidebar} />}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isSidebar?: boolean;
}

function MessageBubble({ message, isSidebar = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { theme } = useTheme();

  return (
    <div className="animate-slide-up opacity-0">
      <div className={`flex ${isSidebar ? 'gap-2' : 'gap-4'} ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex-shrink-0 rounded-lg flex items-center justify-center ${
            isSidebar ? 'w-7 h-7' : 'w-8 h-8'
          } ${
            isUser
              ? theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}
        >
          {isUser ? (
            <User className={`${isSidebar ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`} />
          ) : (
            <Bot className={`${isSidebar ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
          )}
        </div>

        <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
          <div
            className={`inline-block rounded-2xl max-w-[85%] transition-colors ${
              isSidebar ? 'px-3 py-2' : 'px-4 py-3'
            } ${
              isUser
                ? theme === 'dark'
                  ? isSidebar 
                    ? 'bg-zinc-700 text-zinc-100 rounded-tr-md' 
                    : 'bg-zinc-800 text-white rounded-tr-md'
                  : isSidebar
                    ? 'bg-gray-200 text-gray-900 rounded-tr-md'
                    : 'bg-gray-100 text-gray-900 rounded-tr-md'
                : theme === 'dark'
                  ? isSidebar
                    ? 'bg-zinc-800 text-zinc-200 rounded-tl-md'
                    : 'bg-zinc-800/50 text-zinc-200 rounded-tl-md'
                  : isSidebar
                    ? 'bg-gray-200 text-gray-800 rounded-tl-md'
                    : 'bg-gray-50 text-gray-800 rounded-tl-md'
            }`}
          >
            <p className={`leading-relaxed whitespace-pre-wrap ${isSidebar ? 'text-[13px]' : 'text-sm'}`}>
              {message.content}
            </p>
          </div>
          <p className={`mt-1 px-1 transition-colors ${
            isSidebar ? 'text-[10px]' : 'text-xs'
          } ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  isSidebar?: boolean;
}

function TypingIndicator({ isSidebar = false }: TypingIndicatorProps) {
  const { theme } = useTheme();

  return (
    <div className={`flex animate-fade-in ${isSidebar ? 'gap-2' : 'gap-4'}`}>
      <div className={`flex-shrink-0 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center ${
        isSidebar ? 'w-7 h-7' : 'w-8 h-8'
      }`}>
        <Bot className={`${isSidebar ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
      </div>
      <div className={`flex items-center gap-2 rounded-2xl rounded-tl-md transition-colors ${
        isSidebar ? 'px-3 py-2' : 'px-4 py-3'
      } ${
        theme === 'dark' 
          ? isSidebar ? 'bg-zinc-800' : 'bg-zinc-800/50' 
          : isSidebar ? 'bg-gray-200' : 'bg-gray-50'
      }`}>
        <Loader2 className={`text-red-500 animate-spin ${isSidebar ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        <span className={`transition-colors ${
          isSidebar ? 'text-[13px]' : 'text-sm'
        } ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>Thinking...</span>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
