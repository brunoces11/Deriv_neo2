import { useRef, useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import type { ChatMessage } from '../../types';

// URL da foto do usuário (mesma usada no UserProfile)
const USER_AVATAR_URL = "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200";

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
        {isUser ? (
          <div
            className={`flex-shrink-0 rounded-lg overflow-hidden ${
              isSidebar ? 'w-8 h-8' : 'w-[37px] h-[37px]'
            }`}
          >
            <img
              src={USER_AVATAR_URL}
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex-shrink-0 rounded-lg flex items-center justify-center ${
              isSidebar ? 'w-8 h-8' : 'w-[37px] h-[37px]'
            } ${
              theme === 'dark' ? 'bg-zinc-600' : 'bg-zinc-500'
            }`}
          >
            <Bot className={`${isSidebar ? 'w-4 h-4' : 'w-[18px] h-[18px]'} text-white`} />
          </div>
        )}

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
            <div className={`prose prose-sm max-w-none leading-relaxed ${isSidebar ? 'text-[13px]' : 'text-sm'} ${
              theme === 'dark' ? 'prose-invert' : ''
            }`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children }) => (
                    <code className={`px-1 py-0.5 rounded text-xs ${
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
                    }`}>{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className={`p-2 rounded overflow-x-auto text-xs mb-2 ${
                      theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'
                    }`}>{children}</pre>
                  ),
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-2 pl-3 italic mb-2 ${
                      theme === 'dark' ? 'border-zinc-600 text-zinc-400' : 'border-gray-300 text-gray-600'
                    }`}>{children}</blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
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
      <div className={`flex-shrink-0 rounded-lg flex items-center justify-center ${
        isSidebar ? 'w-8 h-8' : 'w-[37px] h-[37px]'
      } ${
        theme === 'dark' ? 'bg-zinc-600' : 'bg-zinc-500'
      }`}>
        <Bot className={`${isSidebar ? 'w-4 h-4' : 'w-[18px] h-[18px]'} text-white`} />
      </div>
      <div className={`flex items-center gap-2 rounded-2xl rounded-tl-md transition-colors ${
        isSidebar ? 'px-3 py-2' : 'px-4 py-3'
      } ${
        theme === 'dark' 
          ? isSidebar ? 'bg-zinc-800' : 'bg-zinc-800/50' 
          : isSidebar ? 'bg-gray-200' : 'bg-gray-50'
      }`}>
        <Loader2 className={`text-zinc-400 animate-spin ${isSidebar ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
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
