import { useRef, useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import type { ChatMessage } from '../../types';

// URL da foto do usuário (mesma usada no UserProfile)
const USER_AVATAR_URL = "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200";

// Regex para detectar tags no formato [@TagName-N] ou [@TagName]
const TAG_REGEX = /\[@([A-Za-z0-9\s]+?)(?:-(\d+))?\]/g;

// Lista de agentes e markets para identificação
const AGENTS = [
  'RiskAnalysisAgent',
  'PortfolioManagerAgent',
  'TraderAgent',
  'BotCreatorAgent',
  'MarketAgent',
  'SupportAgent',
  'TrainerAgent',
];

const MARKETS = [
  'Forex',
  'DerivedIndices',
  'Stocks',
  'StockIndices',
  'Commodities',
  'Cryptocurrencies',
  'ETFs',
];

// Cores para tags - com versões light e dark (mesmo padrão do ChatInput_NEO)
const TAG_COLORS: Record<string, { bg: string; textLight: string; textDark: string; border: string }> = {
  drawing: { bg: 'rgba(59, 130, 246, 0.25)', textLight: '#1e3a5f', textDark: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
  agent: { bg: 'rgba(239, 68, 68, 0.25)', textLight: '#5c1a1a', textDark: '#fca5a5', border: 'rgba(239, 68, 68, 0.4)' },
  market: { bg: 'rgba(147, 51, 234, 0.25)', textLight: '#3b1a5c', textDark: '#d8b4fe', border: 'rgba(147, 51, 234, 0.4)' },
  default: { bg: 'rgba(113, 113, 122, 0.25)', textLight: '#3d3d3d', textDark: '#d4d4d8', border: 'rgba(113, 113, 122, 0.4)' },
};

// Mapeia nomes de tags para tipos de drawing
function getDrawingTypeFromTagName(tagName: string): 'trendline' | 'horizontal' | 'rectangle' | 'note' | null {
  const normalized = tagName.toLowerCase();
  if (normalized === 'trendline') return 'trendline';
  if (normalized === 'horizontal') return 'horizontal';
  if (normalized === 'rectangle') return 'rectangle';
  if (normalized === 'note') return 'note';
  return null;
}

// Verifica se é uma tag de agente
function isAgentTag(tagName: string): boolean {
  const normalized = tagName.replace(/\s+/g, '');
  return AGENTS.some(a => a.toLowerCase() === normalized.toLowerCase());
}

// Verifica se é uma tag de market
function isMarketTag(tagName: string): boolean {
  const normalized = tagName.replace(/\s+/g, '');
  return MARKETS.some(m => m.toLowerCase() === normalized.toLowerCase());
}

// Componente para renderizar uma tag estilizada
function TagBadge({ tagName, tagNumber, theme }: { tagName: string; tagNumber?: string; theme: 'light' | 'dark' }) {
  const label = tagNumber ? `${tagName}-${tagNumber}` : tagName;
  
  // Determinar cor baseado no tipo de tag
  let colors: { bg: string; textLight: string; textDark: string; border: string };
  
  if (isAgentTag(tagName)) {
    colors = TAG_COLORS.agent;
  } else if (isMarketTag(tagName)) {
    colors = TAG_COLORS.market;
  } else if (getDrawingTypeFromTagName(tagName)) {
    colors = TAG_COLORS.drawing;
  } else {
    colors = TAG_COLORS.default;
  }
  
  return (
    <span 
      className="inline-flex items-center px-2 rounded-full text-xs font-medium" 
      style={{ 
        paddingTop: '0px', 
        paddingBottom: '0px', 
        lineHeight: '1.4',
        background: colors.bg,
        color: theme === 'dark' ? colors.textDark : colors.textLight,
        border: `1px solid ${colors.border}`
      }}
    >
      @{label}
    </span>
  );
}

// Função para parsear texto e substituir tags por componentes
function parseMessageWithTags(content: string, theme: 'light' | 'dark'): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  // Reset regex
  TAG_REGEX.lastIndex = 0;

  while ((match = TAG_REGEX.exec(content)) !== null) {
    // Adiciona texto antes da tag
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Adiciona a tag como componente
    const tagName = match[1];
    const tagNumber = match[2];
    parts.push(<TagBadge key={`tag-${keyIndex++}`} tagName={tagName} tagNumber={tagNumber} theme={theme} />);

    lastIndex = match.index + match[0].length;
  }

  // Adiciona texto restante após a última tag
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [content];
}

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
              {isUser ? (
                // Para mensagens do usuário, renderiza tags como badges (line-height aumentado para tags)
                <p className="mb-0 leading-[1.77]">{parseMessageWithTags(message.content, theme)}</p>
              ) : (
                // Para mensagens da IA, usa ReactMarkdown com suporte completo
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    // Parágrafos
                    p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                    
                    // Quebras de linha
                    br: () => <br />,
                    
                    // Listas
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                    
                    // Código inline e blocos
                    code: ({ inline, children }) => {
                      if (inline) {
                        return (
                          <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                            theme === 'dark' ? 'bg-zinc-700 text-zinc-200' : 'bg-gray-200 text-gray-800'
                          }`}>{children}</code>
                        );
                      }
                      return (
                        <code className={`block p-3 rounded overflow-x-auto text-xs font-mono mb-2 ${
                          theme === 'dark' ? 'bg-zinc-900 text-zinc-200' : 'bg-gray-100 text-gray-800'
                        }`}>{children}</code>
                      );
                    },
                    pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                    
                    // Formatação de texto
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    del: ({ children }) => <del className="line-through">{children}</del>,
                    
                    // Headings
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-2 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 mt-1 first:mt-0">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-xs font-semibold mb-1 mt-1 first:mt-0">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-xs font-semibold mb-1 mt-1 first:mt-0">{children}</h6>,
                    
                    // Links
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-red-500 hover:text-red-600 underline transition-colors"
                      >
                        {children}
                      </a>
                    ),
                    
                    // Imagens
                    img: ({ src, alt }) => (
                      <img 
                        src={src} 
                        alt={alt || ''} 
                        className="max-w-full h-auto rounded-lg my-2"
                        loading="lazy"
                      />
                    ),
                    
                    // Blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className={`border-l-4 pl-3 py-1 italic my-2 ${
                        theme === 'dark' 
                          ? 'border-zinc-600 text-zinc-400 bg-zinc-800/30' 
                          : 'border-gray-300 text-gray-600 bg-gray-100/50'
                      }`}>{children}</blockquote>
                    ),
                    
                    // Linhas horizontais
                    hr: () => (
                      <hr className={`my-3 border-t ${
                        theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'
                      }`} />
                    ),
                    
                    // Tabelas (GFM)
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-2">
                        <table className={`min-w-full border-collapse text-xs ${
                          theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'
                        }`}>{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}>{children}</thead>
                    ),
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => (
                      <tr className={`border-b ${
                        theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'
                      }`}>{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left font-semibold">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2">{children}</td>
                    ),
                    
                    // Checkboxes (GFM)
                    input: ({ type, checked }) => {
                      if (type === 'checkbox') {
                        return (
                          <input 
                            type="checkbox" 
                            checked={checked} 
                            disabled 
                            className="mr-2 align-middle"
                          />
                        );
                      }
                      return null;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
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
