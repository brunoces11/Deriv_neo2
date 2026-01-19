import { useRef, useEffect } from 'react';
import { User, Bot, Loader2 } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import type { ChatMessage } from '../../types';

export function ChatMessages() {
  const { messages, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="py-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { theme } = useTheme();

  return (
    <div className="animate-slide-up opacity-0">
      <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            isUser
              ? theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}
        >
          {isUser ? (
            <User className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`} />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
          <div
            className={`inline-block rounded-2xl px-4 py-3 max-w-[85%] transition-colors ${
              isUser
                ? theme === 'dark'
                  ? 'bg-zinc-800 text-white rounded-tr-md'
                  : 'bg-gray-100 text-gray-900 rounded-tr-md'
                : theme === 'dark'
                  ? 'bg-zinc-800/50 text-zinc-200 rounded-tl-md'
                  : 'bg-gray-50 text-gray-800 rounded-tl-md'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <p className={`text-xs mt-1 px-1 transition-colors ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  const { theme } = useTheme();

  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md transition-colors ${
        theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'
      }`}>
        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
        <span className={`text-sm transition-colors ${
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
