import { useRef, useEffect, useCallback } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { useViewMode } from '../../store/ViewModeContext';
import type { ChatMessage, BaseCard, CardType } from '../../types';

// Placeholder rendering imports
import { 
  PLACEHOLDER_REGEX, 
  getRuleForMode, 
  type ViewMode as PlaceholderViewMode,
  type ModeConfig,
  type RenderCardType,
  type PanelTab
} from '../../services/placeholderRules';

// Card components for inline rendering
import { BotCard } from '../cards/BotCard';
import { PortfolioSnapshotCard } from '../cards/PortfolioSnapshotCard';
import { PortfolioTableCardComplete } from '../cards/PortfolioTableCardComplete';
import { CreateTradeCard } from '../cards/CreateTradeCard';
import { TradeCard } from '../cards/TradeCard';
import { ActionsCard } from '../cards/ActionsCard';
import { ActionsCardCreator } from '../cards/ActionsCardCreator';
import { BotCardCreator } from '../cards/BotCardCreator';

// URL da foto do usuário (mesma usada no UserProfile)
const USER_AVATAR_URL = "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200";

// Regex para detectar tags no formato [@TagName-N] ou [@TagName]
const TAG_REGEX = /\[@([A-Za-z0-9\s]+?)(?:-(\d+))?\]/g;

// Lista de agentes e markets para identificação
const AGENTS = [
  'RiskAnalysisAgent',
  'PortfolioManagerAgent',
  'TraderAgent',
  'ActionCreatorAgent',
  'BotCreatorAgent',
  'MarketAnalysesAgent',
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

// ============================================================================
// Card Components Map for Inline Rendering
// ============================================================================

const cardComponents: Record<RenderCardType, React.ComponentType<{ card: BaseCard; defaultExpanded?: boolean }>> = {
  'bot-card': BotCard,
  'portfolio-snapshot': PortfolioSnapshotCard,
  'portfolio-sidebar': PortfolioSnapshotCard, // Fallback to snapshot
  'portfolio-table-complete': PortfolioTableCardComplete,
  'create-trade-card': CreateTradeCard,
  'trade-card': TradeCard,
  'actions-card': ActionsCard,
  'actions-creator': ActionsCardCreator,
  'bot-creator': BotCardCreator,
};

// ============================================================================
// Placeholder Parsing Types and Functions
// ============================================================================

type MessagePart = 
  | { type: 'text'; content: string }
  | { type: 'card'; placeholder: string; config: ModeConfig; cardId: string };

/**
 * Parse message content and extract placeholders for inline card rendering
 * Uses deterministic cardId based on message content and placeholder position
 */
function parseMessageWithPlaceholders(
  content: string, 
  mode: PlaceholderViewMode,
  messageId: string
): MessagePart[] {
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  let placeholderIndex = 0;
  
  // Reset regex state
  PLACEHOLDER_REGEX.lastIndex = 0;
  let match;
  
  while ((match = PLACEHOLDER_REGEX.exec(content)) !== null) {
    // Text before the placeholder
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    
    // Placeholder → Card config
    const placeholder = `[[${match[1]}]]`;
    const config = getRuleForMode(placeholder, mode);
    
    if (config) {
      // Use deterministic cardId based on messageId and placeholder position
      // This ensures the same placeholder in the same message always gets the same ID
      parts.push({ 
        type: 'card', 
        placeholder, 
        config,
        cardId: `${messageId}-placeholder-${placeholderIndex}`
      });
      placeholderIndex++;
    } else {
      // Unknown placeholder, keep as text
      parts.push({ type: 'text', content: match[0] });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Remaining text after last placeholder
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', content }];
}

/**
 * Create a mock BaseCard for inline rendering
 */
function createMockCard(cardType: RenderCardType, cardId: string): BaseCard {
  return {
    id: cardId,
    type: cardType as any, // Type coercion needed due to CardType mismatch
    status: 'active',
    isFavorite: false,
    createdAt: new Date(),
    payload: getDefaultPayloadForCard(cardType),
  };
}

/**
 * Get default payload for each card type (for inline rendering)
 */
function getDefaultPayloadForCard(cardType: RenderCardType): Record<string, unknown> {
  const defaultPortfolioAssets = [
    { symbol: 'BTC', name: 'Bitcoin', allocation: 45, value: '$20,353.50', invested: '$18,000.00', change: '+$2,353.50', changePercent: '+13.07%' },
    { symbol: 'ETH', name: 'Ethereum', allocation: 30, value: '$13,569.00', invested: '$12,500.00', change: '+$1,069.00', changePercent: '+8.55%' },
    { symbol: 'SOL', name: 'Solana', allocation: 15, value: '$6,784.50', invested: '$7,200.00', change: '-$415.50', changePercent: '-5.77%' },
    { symbol: 'Other', name: 'Others', allocation: 10, value: '$4,523.00', invested: '$4,500.00', change: '+$23.00', changePercent: '+0.51%' },
  ];

  switch (cardType) {
    case 'trade-card':
      return {
        tradeId: `TRD-${Math.floor(Math.random() * 10000)}`,
        asset: 'BTC/USD',
        assetName: 'Bitcoin',
        direction: 'higher',
        stake: '$100.00',
        payout: '$195.00',
        barrier: '42,500.00',
        expiryDate: '28 Jan 2026, 23:59:59',
        status: 'open',
      };
    case 'create-trade-card':
      return {
        asset: 'BTC/USD',
        assetName: 'Bitcoin',
        tradeType: 'higher-lower',
        duration: {
          mode: 'duration',
          unit: 'days',
          value: 1,
          range: { min: 1, max: 365 },
          expiryDate: '28 Jan 2026, 23:59:59 GMT +0',
        },
        barrier: { value: 42500.00, spotPrice: 42350.75 },
        stake: { mode: 'stake', value: 100, currency: 'USD' },
        payout: {
          higher: { amount: '$195.00', percentage: '95%' },
          lower: { amount: '$195.00', percentage: '95%' },
        },
      };
    case 'bot-card':
    case 'bot-creator':
      return {
        botId: `BOT-${Math.floor(Math.random() * 1000)}`,
        botName: 'DCA Bitcoin Weekly',
        name: 'DCA Bitcoin Weekly',
        strategy: 'Dollar Cost Averaging',
        status: 'active',
        performance: '+12.5%',
        trigger: { type: 'Weekly', value: 'Monday' },
        action: { type: 'Buy', asset: 'BTC' },
        target: { type: 'Amount', value: '$100' },
      };
    case 'actions-card':
    case 'actions-creator':
      return {
        actionId: `ACT-${Math.floor(Math.random() * 1000)}`,
        actionName: 'Price Alert BTC',
        name: 'Price Alert BTC',
        description: 'Alert when BTC reaches target',
        status: 'active',
        trigger: { type: 'price', value: '$50,000' },
        action: { type: 'Alert', asset: 'BTC' },
        schedule: { frequency: 'once', time: '09:00' },
      };
    case 'portfolio-snapshot':
    case 'portfolio-sidebar':
      return {
        totalValue: '$45,230.00',
        change24h: '+$1,250.00',
        changePercent: '+2.84%',
        assets: [
          { symbol: 'BTC', allocation: 45, value: '$20,353.50' },
          { symbol: 'ETH', allocation: 30, value: '$13,569.00' },
          { symbol: 'SOL', allocation: 15, value: '$6,784.50' },
          { symbol: 'Other', allocation: 10, value: '$4,523.00' },
        ],
      };
    case 'portfolio-table-complete':
      return {
        totalValue: '$45,230.00',
        change24h: '+$1,250.00',
        changePercent: '+2.84%',
        assets: defaultPortfolioAssets,
      };
    default:
      return {};
  }
}

// ============================================================================
// InlineCard Component
// ============================================================================

interface InlineCardProps {
  config: ModeConfig;
  cardId: string;
  onAddToPanel: (
    cardId: string, 
    cardType: RenderCardType, 
    panelTab: PanelTab,
    payload: Record<string, unknown>
  ) => void;
}

function InlineCard({ config, cardId, onAddToPanel }: InlineCardProps) {
  const { inline, panel } = config;
  const CardComponent = cardComponents[inline.cardType];
  // Track if we've already added to panel for this specific card instance
  const hasAddedToPanelRef = useRef(false);
  
  if (!CardComponent) {
    console.warn(`[InlineCard] Unknown card type: ${inline.cardType}`);
    return null;
  }
  
  const mockCard = createMockCard(inline.cardType, cardId);
  const isExpanded = inline.visualState === 'expanded';
  
  // Add card to panel on mount (only once per card instance)
  useEffect(() => {
    // Only add to panel once per card instance
    if (hasAddedToPanelRef.current) {
      return;
    }
    
    if (panel && panel.panel) {
      hasAddedToPanelRef.current = true;
      const payload = getDefaultPayloadForCard(panel.cardType);
      onAddToPanel(cardId, panel.cardType, panel.panel, payload);
    }
  }, [cardId, panel, onAddToPanel]);
  
  return (
    <div className="my-4 max-w-full">
      <CardComponent card={mockCard} defaultExpanded={isExpanded} />
    </div>
  );
}

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

// Track which cards have been added to panel to avoid duplicates
const addedToPanelSet = new Set<string>();

export function ChatMessages({ displayMode = 'center' }: ChatMessagesProps) {
  const { messages, isTyping, processUIEvent, currentSessionId } = useChat();
  const { currentMode, notifyPanelActivation } = useViewMode();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSidebar = displayMode === 'sidebar';

  // Callback to add card to panel (called by InlineCard)
  const addCardToPanel = useCallback(async (
    cardId: string, 
    cardType: RenderCardType, 
    panelTab: PanelTab,
    payload: Record<string, unknown>
  ) => {
    // REGRA ESPECIAL: Portfolio table cards são singleton no painel
    // Podem aparecer múltiplas vezes inline, mas só uma vez no painel
    const isSingletonCard = cardType === 'portfolio-table-complete';
    
    // Para singleton cards, usar o tipo como chave (garante única instância)
    // Para outros cards, usar cardId (permite múltiplas instâncias diferentes)
    const uniqueKey = isSingletonCard 
      ? `${currentSessionId}-singleton-${cardType}`
      : `${currentSessionId}-${cardId}`;
    
    // Skip if already added to panel
    if (addedToPanelSet.has(uniqueKey)) {
      return;
    }
    
    // Mark as added
    addedToPanelSet.add(uniqueKey);
    
    // Para singleton cards, usar um ID fixo baseado no tipo
    const panelCardId = isSingletonCard 
      ? `panel-singleton-${cardType}`
      : `panel-${cardId}`;
    
    // Add to panel via processUIEvent with notification callback
    await processUIEvent({
      type: 'ADD_CARD',
      cardType: cardType as CardType,
      cardId: panelCardId,
      payload: {
        ...payload,
        visualState: 'compacted',
        panelTab,
      },
    }, undefined, (sidebar, panel) => {
      // Notify to expand and activate the panel where the card was added
      notifyPanelActivation(sidebar, panel);
    });
  }, [processUIEvent, currentSessionId, notifyPanelActivation]);

  // Clear tracked cards when session changes
  useEffect(() => {
    // When session changes, we could clear the set, but keeping it prevents
    // re-adding cards when switching back to a session
    // For now, we keep the set persistent
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className={`space-y-4 ${isSidebar ? 'py-3' : 'py-6 space-y-6'}`}>
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isSidebar={isSidebar}
          currentMode={currentMode as PlaceholderViewMode}
          onAddCardToPanel={addCardToPanel}
        />
      ))}
      {isTyping && <TypingIndicator isSidebar={isSidebar} />}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isSidebar?: boolean;
  currentMode: PlaceholderViewMode;
  onAddCardToPanel: (
    cardId: string, 
    cardType: RenderCardType, 
    panelTab: PanelTab,
    payload: Record<string, unknown>
  ) => void;
}

function MessageBubble({ message, isSidebar = false, currentMode, onAddCardToPanel }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { theme } = useTheme();
  
  // Parse message for placeholders (only for AI messages)
  const messageParts = !isUser 
    ? parseMessageWithPlaceholders(message.content, currentMode, message.id)
    : null;
  
  // Check if message has inline cards
  const hasInlineCards = messageParts?.some(part => part.type === 'card') ?? false;

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
              ) : hasInlineCards && messageParts ? (
                // Para mensagens da IA com placeholders, renderiza texto + cards inline
                <div className="space-y-2">
                  {messageParts.map((part, index) => {
                    if (part.type === 'text') {
                      // Render text parts with ReactMarkdown
                      const trimmedContent = part.content.trim();
                      if (!trimmedContent) return null;
                      return (
                        <ReactMarkdown
                          key={`text-${index}`}
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                            br: () => <br />,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="mb-0.5">{children}</li>,
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
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            del: ({ children }) => <del className="line-through">{children}</del>,
                            // Headings - enhanced hierarchy with better spacing
                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 mt-10 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-8 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold mb-1.5 mt-6 first:mt-0">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 mt-5 first:mt-0">{children}</h4>,
                            h5: ({ children }) => <h5 className="text-sm font-semibold mb-1 mt-4 first:mt-0">{children}</h5>,
                            h6: ({ children }) => <h6 className="text-xs font-semibold mb-1 mt-3 first:mt-0">{children}</h6>,
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600 underline transition-colors">{children}</a>
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
                          }}
                        >
                          {trimmedContent}
                        </ReactMarkdown>
                      );
                    } else {
                      // Render inline card
                      return (
                        <InlineCard 
                          key={`card-${index}-${part.cardId}`} 
                          config={part.config} 
                          cardId={part.cardId}
                          onAddToPanel={onAddCardToPanel}
                        />
                      );
                    }
                  })}
                </div>
              ) : (
                // Para mensagens da IA sem placeholders, usa ReactMarkdown com suporte completo
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
                    
                    // Headings - enhanced hierarchy with better spacing
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 mt-10 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-8 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-1.5 mt-6 first:mt-0">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 mt-5 first:mt-0">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-sm font-semibold mb-1 mt-4 first:mt-0">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-xs font-semibold mb-1 mt-3 first:mt-0">{children}</h6>,
                    
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
