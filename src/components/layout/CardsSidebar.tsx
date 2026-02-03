import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Zap, ChevronLeft, ChevronRight, Play, Bot, LayoutGrid, BotMessageSquare } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { useViewMode } from '../../store/ViewModeContext';
import { useDrawingTools } from '../../store/DrawingToolsContext';
import { ExecutionCard, getCardPanelTab } from './ExecutionCard';
import { ChatMessages } from '../chat/ChatMessages';
import { ChatInput_NEO } from '../chat/ChatInput_NEO';
import type { CardType } from '../../types';

type RightSidebarTab = 'cards' | 'actions' | 'bots';

const RIGHT_SIDEBAR_STATE_KEY = 'deriv-neo-right-sidebar-state';

interface RightSidebarState {
  activeTab: RightSidebarTab;
  // ChatMode section heights (percentages)
  cardsSectionHeight: number;
  actionsSectionHeight: number;
}

const defaultRightSidebarState: RightSidebarState = {
  activeTab: 'cards',
  cardsSectionHeight: 33,
  actionsSectionHeight: 33,
};

function loadRightSidebarState(): RightSidebarState {
  try {
    const stored = localStorage.getItem(RIGHT_SIDEBAR_STATE_KEY);
    if (stored) {
      return { ...defaultRightSidebarState, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultRightSidebarState;
}

function saveRightSidebarState(state: RightSidebarState): void {
  try {
    localStorage.setItem(RIGHT_SIDEBAR_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

interface CardsSidebarProps {
  isCollapsed: boolean;
  width: number;
  isGraphMode: boolean;
  onToggleCollapse: () => void;
  onResize: (width: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

const COLLAPSED_WIDTH = 54;
const MAX_WIDTH = 960;
const SNAP_THRESHOLD = 100;
const MIN_WIDTH_GRAPH_MODE = 425;
const DEFAULT_EXPAND_WIDTH_GRAPH_MODE = 690;

// Vertical resize constants
const MIN_CARDS_HEIGHT = 100;
const MAX_CARDS_PERCENT = 70; // Max 70% of available height

export function CardsSidebar({ 
  isCollapsed, 
  width: propWidth,
  isGraphMode,
  onToggleCollapse, 
  onResize,
  onResizeStart,
  onResizeEnd,
}: CardsSidebarProps) {
  const { activeCards } = useChat();
  const { theme } = useTheme();
  const { updateDraftInput, clearDraftInput, panelNotification, clearPanelNotification } = useViewMode();
  const { clearChatTags } = useDrawingTools();
  const [localWidth, setLocalWidth] = useState(propWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [cardsHeight, setCardsHeight] = useState(200); // Default height in pixels for graph mode
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const finalWidthRef = useRef(propWidth);
  
  // Right sidebar state (tabs + section heights)
  const [rightSidebarState, setRightSidebarState] = useState<RightSidebarState>(loadRightSidebarState);
  const { activeTab, cardsSectionHeight, actionsSectionHeight } = rightSidebarState;
  const [resizingSection, setResizingSection] = useState<'cards' | 'actions' | null>(null);

  const updateRightSidebarState = useCallback((updates: Partial<RightSidebarState>) => {
    setRightSidebarState(prev => {
      const newState = { ...prev, ...updates };
      saveRightSidebarState(newState);
      return newState;
    });
  }, []);

  const setActiveTab = (tab: RightSidebarTab) => updateRightSidebarState({ activeTab: tab });

  // React to panel notification - expand sidebar and switch to correct tab
  useEffect(() => {
    if (panelNotification && panelNotification.sidebar === 'right') {
      const targetTab = panelNotification.panel as RightSidebarTab;
      if (targetTab === 'cards' || targetTab === 'actions' || targetTab === 'bots') {
        // Expand sidebar if collapsed
        if (isCollapsed) {
          onToggleCollapse();
        }
        // Switch to the target tab
        updateRightSidebarState({ activeTab: targetTab });
        // Clear the notification
        clearPanelNotification();
      }
    }
  }, [panelNotification, isCollapsed, onToggleCollapse, clearPanelNotification, updateRightSidebarState]);

  // Helper: verifica se é QUALQUER tipo de card de portfolio (singleton - não pode duplicar no painel)
  // Inclui TODOS os tipos possíveis: snapshot, table-complete, e variantes legacy
  const isAnyPortfolioCard = (cardType: CardType) => 
    cardType === 'portfolio-snapshot' ||
    cardType === 'portfolio-table-complete' ||
    cardType === 'portfolio-sidebar' ||
    cardType === 'card_portfolio' ||
    cardType === 'card_portfolio_exemple_compacto' ||
    cardType === 'card_portfolio_sidebar';

  // Filter cards by panel type, com deduplicação de TODOS os tipos de portfolio
  const cardsForCardsPanel = useMemo(() => {
    const filtered = activeCards.filter(card => getCardPanelTab(card.type as CardType) === 'cards');
    
    // Deduplicar cards de portfolio: manter apenas o primeiro de qualquer tipo
    let hasPortfolioCard = false;
    return filtered.filter(card => {
      if (isAnyPortfolioCard(card.type as CardType)) {
        if (hasPortfolioCard) {
          return false; // Já existe um portfolio card, não mostrar duplicata
        }
        hasPortfolioCard = true;
      }
      return true;
    });
  }, [activeCards]);
  
  const cardsForActionsPanel = useMemo(() => 
    activeCards.filter(card => getCardPanelTab(card.type as CardType) === 'actions'),
    [activeCards]
  );
  
  const cardsForBotsPanel = useMemo(() => 
    activeCards.filter(card => getCardPanelTab(card.type as CardType) === 'bots'),
    [activeCards]
  );

  // Handler para icebreaker buttons
  const handleIcebreaker = useCallback((text: string) => {
    // 1. Limpar completamente o draft input (texto, agentes, produtos, tags)
    clearDraftInput();
    clearChatTags();
    
    // 2. Usar setTimeout para garantir que o clear seja processado primeiro
    setTimeout(() => {
      // 3. Inserir o novo texto
      updateDraftInput({ plainText: text });
    }, 50);
  }, [clearDraftInput, clearChatTags, updateDraftInput]);

  // Sincronizar com prop width quando não está em resize
  useEffect(() => {
    if (!isResizing) {
      setLocalWidth(isCollapsed ? COLLAPSED_WIDTH : propWidth);
    }
  }, [propWidth, isCollapsed, isResizing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    onResizeStart();
    
    const startX = e.clientX;
    // Quando colapsado, começar do COLLAPSED_WIDTH real
    const startWidth = isCollapsed ? COLLAPSED_WIDTH : localWidth;
    
    // Atualizar localWidth para o valor real de início
    setLocalWidth(startWidth);
    finalWidthRef.current = startWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX;
      let newWidth = startWidth + delta;
      
      // Snap para collapsed se abaixo do threshold
      if (newWidth < SNAP_THRESHOLD) {
        newWidth = COLLAPSED_WIDTH;
      } else if (isGraphMode && newWidth < MIN_WIDTH_GRAPH_MODE) {
        // No Graph Mode, não permitir width entre SNAP_THRESHOLD e MIN_WIDTH_GRAPH_MODE
        // Se está tentando diminuir e passou do min, snap para collapsed
        if (newWidth < MIN_WIDTH_GRAPH_MODE && newWidth >= SNAP_THRESHOLD) {
          newWidth = MIN_WIDTH_GRAPH_MODE;
        }
      }
      
      newWidth = Math.min(MAX_WIDTH, newWidth);
      
      finalWidthRef.current = newWidth;
      setLocalWidth(newWidth);
    };

    const handleMouseUp = () => {
      const finalWidth = finalWidthRef.current;
      
      setIsResizing(false);
      onResizeEnd();
      
      // Persistir o width final - se snap para collapsed, atualizar collapsed state
      if (finalWidth <= COLLAPSED_WIDTH) {
        // Snap para collapsed - atualizar o estado de collapsed
        if (!isCollapsed) {
          onToggleCollapse();
        }
      } else {
        // Width normal - garantir que não está collapsed e persistir width
        if (isCollapsed) {
          onToggleCollapse();
        }
        onResize(finalWidth);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [localWidth, isCollapsed, onResizeStart, onResizeEnd, onResize, onToggleCollapse]);

  // Vertical resize handler for graph mode
  const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVerticalResizing(true);
    
    const startY = e.clientY;
    const startHeight = cardsHeight;
    const containerHeight = contentRef.current?.clientHeight || 500;
    const maxHeight = containerHeight * (MAX_CARDS_PERCENT / 100);

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startY;
      let newHeight = startHeight + delta;
      
      // Clamp to min/max
      newHeight = Math.max(MIN_CARDS_HEIGHT, Math.min(maxHeight, newHeight));
      setCardsHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsVerticalResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [cardsHeight]);

  // ChatMode section resize handler
  const handleSectionResize = useCallback((section: 'cards' | 'actions', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingSection(section);
    
    const startY = e.clientY;
    const containerHeight = contentRef.current?.clientHeight || 500;
    const startCardsHeight = cardsSectionHeight;
    const startActionsHeight = actionsSectionHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaPercent = ((e.clientY - startY) / containerHeight) * 100;
      
      if (section === 'cards') {
        // Resizing cards section affects cards and actions
        let newCardsHeight = startCardsHeight + deltaPercent;
        let newActionsHeight = startActionsHeight - deltaPercent;
        
        // Clamp values (min 15%, max 60%)
        newCardsHeight = Math.max(15, Math.min(60, newCardsHeight));
        newActionsHeight = Math.max(15, Math.min(60, newActionsHeight));
        
        updateRightSidebarState({ 
          cardsSectionHeight: newCardsHeight, 
          actionsSectionHeight: newActionsHeight 
        });
      } else {
        // Resizing actions section affects actions and bots
        let newActionsHeight = startActionsHeight + deltaPercent;
        
        // Clamp values (min 15%, max 60%)
        newActionsHeight = Math.max(15, Math.min(60, newActionsHeight));
        
        updateRightSidebarState({ actionsSectionHeight: newActionsHeight });
      }
    };

    const handleMouseUp = () => {
      setResizingSection(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [cardsSectionHeight, actionsSectionHeight, updateRightSidebarState]);

  // Calculate bots section height
  const botsSectionHeight = 100 - cardsSectionHeight - actionsSectionHeight;

  // Width visual: durante resize sempre usa localWidth, senão respeita collapsed
  const displayWidth = isResizing ? localWidth : (isCollapsed ? COLLAPSED_WIDTH : localWidth);
  const showCollapsedContent = displayWidth <= COLLAPSED_WIDTH;

  // Custom toggle handler - applies 780px default when expanding in Graph Mode
  const handleToggleCollapse = useCallback(() => {
    if (isCollapsed && isGraphMode) {
      // Expanding in Graph Mode - set to 780px
      onResize(DEFAULT_EXPAND_WIDTH_GRAPH_MODE);
    }
    onToggleCollapse();
  }, [isCollapsed, isGraphMode, onResize, onToggleCollapse]);

  return (
    <aside 
      ref={sidebarRef}
      className={`relative z-30 border-l flex flex-col h-full ${
        isResizing ? '' : 'transition-all duration-300'
      } ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800/50' : 'bg-gray-50 border-gray-200'}`}
      style={{ width: displayWidth }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-3 cursor-col-resize group z-[60]"
        style={{ marginLeft: '-4px' }}
      >
        <div className={`absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-20 rounded-full transition-colors ${
          isResizing 
            ? 'bg-red-500' 
            : theme === 'dark' 
              ? 'bg-zinc-500 group-hover:bg-red-400' 
              : 'bg-gray-400 group-hover:bg-red-400'
        }`} />
      </div>

      {/* Collapse/Expand button */}
      <button 
        onClick={handleToggleCollapse} 
        className={`absolute -left-3 top-5 p-1 rounded-full shadow-md transition-colors z-[70] ${
          theme === 'dark' 
            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700' 
            : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200'
        }`} 
        title={showCollapsedContent ? "Expand sidebar" : "Collapse sidebar"}
      >
        {showCollapsedContent ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {/* Tab Navigation - Graph Mode only */}
      {isGraphMode && !showCollapsedContent && (
        <div className={`flex border-b ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'cards'
                ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                : theme === 'dark' ? 'text-zinc-400 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Cards</span>
            {cardsForCardsPanel.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full text-brand-green ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
              }`}>{cardsForCardsPanel.length}</span>
            )}
            {activeTab === 'cards' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'actions'
                ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                : theme === 'dark' ? 'text-zinc-400 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Actions</span>
            {cardsForActionsPanel.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full text-brand-green ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
              }`}>{cardsForActionsPanel.length}</span>
            )}
            {activeTab === 'actions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'bots'
                ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                : theme === 'dark' ? 'text-zinc-400 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Bots</span>
            {cardsForBotsPanel.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full text-brand-green ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
              }`}>{cardsForBotsPanel.length}</span>
            )}
            {activeTab === 'bots' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
        </div>
      )}

      {/* Cards List - Chat Mode: 3 sections, Graph Mode: tabs + chat */}
      {isGraphMode && !showCollapsedContent ? (
        // Graph Mode Layout: tabs in upper section + chat below
        <div ref={contentRef} className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Content Section */}
          <div 
            className="overflow-y-auto custom-scrollbar p-3"
            style={{ height: cardsHeight, minHeight: MIN_CARDS_HEIGHT }}
          >
            {activeTab === 'cards' && (
              cardsForCardsPanel.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <LayoutGrid className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} strokeWidth={1.5} />
                  <p className={`text-sm text-center leading-relaxed max-w-[280px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                    Cards são módulos visuais interativos que organizam informações solicitadas pelo usuário.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cardsForCardsPanel.map(card => (
                    <ExecutionCard key={card.id} card={card} />
                  ))}
                </div>
              )
            )}
            {activeTab === 'actions' && (
              cardsForActionsPanel.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <Zap className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} strokeWidth={1.5} />
                  <p className={`text-xs text-center leading-relaxed mb-4 max-w-[280px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-300'}`}>
                    Actions são automações inteligentes que executam tarefas ou trades automaticamente com base em regras do usuário.
                  </p>
                  <button 
                    onClick={() => handleIcebreaker('I want to create an Action')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      theme === 'dark' 
                        ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 border border-zinc-800' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400 border border-gray-200'
                    }`}
                  >
                    Criar Action
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cardsForActionsPanel.map(card => (
                    <ExecutionCard key={card.id} card={card} />
                  ))}
                </div>
              )
            )}
            {activeTab === 'bots' && (
              cardsForBotsPanel.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <BotMessageSquare className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} strokeWidth={1.5} />
                  <p className={`text-xs text-center leading-relaxed mb-4 max-w-[280px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-300'}`}>
                    Bots são agentes de trading autônomos que executam estratégias de investimento definidas pelo usuário.
                  </p>
                  <button 
                    onClick={() => handleIcebreaker('I want to create a trading Bot')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      theme === 'dark' 
                        ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 border border-zinc-800' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400 border border-gray-200'
                    }`}
                  >
                    Criar Bot
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cardsForBotsPanel.map(card => (
                    <ExecutionCard key={card.id} card={card} />
                  ))}
                </div>
              )
            )}
          </div>

          {/* Vertical Resize Handle */}
          <div
            onMouseDown={handleVerticalMouseDown}
            className={`relative h-2 cursor-ns-resize group flex-shrink-0 ${
              theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-200'
            }`}
          >
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 rounded-full transition-colors ${
              isVerticalResizing 
                ? 'bg-red-500' 
                : theme === 'dark' 
                  ? 'bg-zinc-600 group-hover:bg-red-400' 
                  : 'bg-gray-400 group-hover:bg-red-400'
            }`} />
          </div>

          {/* Chat Messages Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`px-3 py-2 flex items-center gap-2 border-b flex-shrink-0 ${
              theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <BotMessageSquare className="w-4 h-4 text-red-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>Chats</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
              <ChatMessages displayMode="sidebar" />
            </div>
          </div>

          {/* Chat Input Section */}
          <div className={`flex-shrink-0 p-[22px] border-t ${
            theme === 'dark' ? 'border-zinc-700 bg-zinc-900/80' : 'border-gray-200 bg-gray-100/50'
          }`}>
            <ChatInput_NEO displayMode="sidebar" />
          </div>
        </div>
      ) : !isGraphMode && !showCollapsedContent ? (
        // Chat Mode Layout: 3 vertical sections (Cards, Actions, Bots)
        <div ref={contentRef} className="flex-1 flex flex-col overflow-hidden">
          {/* Cards Section */}
          <div 
            className="overflow-y-auto custom-scrollbar flex flex-col"
            style={{ height: `${cardsSectionHeight}%`, minHeight: '60px' }}
          >
            <div className={`px-3 py-2 flex items-center gap-2 border-b ${
              theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <Zap className="w-4 h-4 text-red-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>Cards</span>
              {cardsForCardsPanel.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full text-brand-green ${
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                }`}>{cardsForCardsPanel.length}</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {cardsForCardsPanel.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <LayoutGrid className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} strokeWidth={1.5} />
                  <p className={`text-sm text-center leading-relaxed max-w-[280px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                    Cards são módulos visuais interativos que organizam informações solicitadas pelo usuário.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cardsForCardsPanel.map(card => (
                    <ExecutionCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cards/Actions Resize Handle */}
          <div
            onMouseDown={(e) => handleSectionResize('cards', e)}
            className={`relative h-1.5 cursor-ns-resize group flex-shrink-0 ${
              theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-200'
            }`}
          >
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-0.5 rounded-full transition-colors ${
              resizingSection === 'cards' 
                ? 'bg-red-500' 
                : theme === 'dark' 
                  ? 'bg-zinc-600 group-hover:bg-red-400' 
                  : 'bg-gray-400 group-hover:bg-red-400'
            }`} />
          </div>

          {/* Actions Section */}
          <div 
            className="overflow-y-auto custom-scrollbar flex flex-col"
            style={{ height: `${actionsSectionHeight}%`, minHeight: '60px' }}
          >
            <div className={`px-3 py-2 flex items-center gap-2 border-b ${
              theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <Play className="w-4 h-4 text-red-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>Actions</span>
              {cardsForActionsPanel.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full text-brand-green ${
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                }`}>{cardsForActionsPanel.length}</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {cardsForActionsPanel.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <Zap className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} strokeWidth={1.5} />
                  <p className={`text-xs text-center leading-relaxed mb-4 max-w-[280px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-300'}`}>
                    Actions são automações inteligentes que executam tarefas ou trades automaticamente com base em regras do usuário.
                  </p>
                  <button 
                    onClick={() => handleIcebreaker('I want to create an Action')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      theme === 'dark' 
                        ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 border border-zinc-800' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400 border border-gray-200'
                    }`}
                  >
                    Criar Action
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cardsForActionsPanel.map(card => (
                    <ExecutionCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions/Bots Resize Handle */}
          <div
            onMouseDown={(e) => handleSectionResize('actions', e)}
            className={`relative h-1.5 cursor-ns-resize group flex-shrink-0 ${
              theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-200'
            }`}
          >
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-0.5 rounded-full transition-colors ${
              resizingSection === 'actions' 
                ? 'bg-red-500' 
                : theme === 'dark' 
                  ? 'bg-zinc-600 group-hover:bg-red-400' 
                  : 'bg-gray-400 group-hover:bg-red-400'
            }`} />
          </div>

          {/* Bots Section */}
          <div 
            className="overflow-y-auto custom-scrollbar flex flex-col"
            style={{ height: `${botsSectionHeight}%`, minHeight: '60px' }}
          >
            <div className={`px-3 py-2 flex items-center gap-2 border-b ${
              theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <Bot className="w-4 h-4 text-red-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>Bots</span>
              {cardsForBotsPanel.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full text-brand-green ${
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                }`}>{cardsForBotsPanel.length}</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {cardsForBotsPanel.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <BotMessageSquare className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} strokeWidth={1.5} />
                  <p className={`text-xs text-center leading-relaxed mb-4 max-w-[280px] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-300'}`}>
                    Bots são agentes de trading autônomos que executam estratégias de investimento definidas pelo usuário.
                  </p>
                  <button 
                    onClick={() => handleIcebreaker('I want to create a trading Bot')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      theme === 'dark' 
                        ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 border border-zinc-800' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400 border border-gray-200'
                    }`}
                  >
                    Criar Bot
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cardsForBotsPanel.map(card => (
                    <ExecutionCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Collapsed Layout
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          <div className="flex flex-col items-center space-y-2">
            {activeCards.length === 0 ? (
              <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} />
            ) : (
              activeCards.slice(0, 5).map((card, index) => (
                <div 
                  key={card.id} 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600'
                  }`} 
                  title={card.type}
                >
                  {index + 1}
                </div>
              ))
            )}
            {activeCards.length > 5 && (
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                +{activeCards.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
