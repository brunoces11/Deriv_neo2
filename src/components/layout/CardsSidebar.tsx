import { useState, useRef, useCallback, useEffect } from 'react';
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { ExecutionCard } from './ExecutionCard';
import { ChatMessages } from '../chat/ChatMessages';
import { ChatInput_NEO } from '../chat/ChatInput_NEO';

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
const DEFAULT_EXPAND_WIDTH_GRAPH_MODE = 780;

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
  const [localWidth, setLocalWidth] = useState(propWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [cardsHeight, setCardsHeight] = useState(200); // Default height in pixels
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const finalWidthRef = useRef(propWidth);

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

  // Vertical resize handler
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

      {/* Header */}
      <div className={`p-4 border-b transition-colors ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          {/* Collapse/Expand button - always on the border */}
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
          
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
            <Zap className="w-4 h-4 text-red-500" />
          </div>
          {!showCollapsedContent && (
            <>
              <div className="flex-1 min-w-0">
                <h2 className={`text-sm font-medium transition-colors truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Cards
                </h2>
                <p className={`text-xs transition-colors ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {activeCards.length} active
                </p>
              </div>
              {activeCards.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Cards List - Chat Mode: apenas cards, Graph Mode: cards + chat */}
      {isGraphMode && !showCollapsedContent ? (
        // Graph Mode Layout: 3 seções
        <div ref={contentRef} className="flex-1 flex flex-col overflow-hidden">
          {/* Cards Section */}
          <div 
            className="overflow-y-auto custom-scrollbar p-3"
            style={{ height: cardsHeight, minHeight: MIN_CARDS_HEIGHT }}
          >
            {activeCards.length === 0 ? (
              <div className={`text-center py-4 transition-colors ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>
                <Zap className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} />
                <p className="text-xs">No cards</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCards.map(card => (
                  <ExecutionCard key={card.id} card={card} />
                ))}
              </div>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
            <ChatMessages displayMode="sidebar" />
          </div>

          {/* Chat Input Section */}
          <div className={`flex-shrink-0 p-[22px] border-t ${
            theme === 'dark' ? 'border-zinc-700 bg-zinc-900/80' : 'border-gray-200 bg-gray-100/50'
          }`}>
            <ChatInput_NEO displayMode="sidebar" />
          </div>
        </div>
      ) : (
        // Chat Mode Layout: apenas cards (comportamento original)
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {showCollapsedContent ? (
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
          ) : activeCards.length === 0 ? (
            <div className={`text-center py-8 transition-colors ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>
              <Zap className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'}`} />
              <p className="text-sm">No cards yet</p>
              <p className="text-xs mt-1">Cards will appear here as you chat</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeCards.map(card => (
                <ExecutionCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
