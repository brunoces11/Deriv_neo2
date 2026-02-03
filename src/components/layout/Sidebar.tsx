import { Star, Archive, ChevronDown, ChevronRight, ChevronLeft, MessageSquare, Target } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { useDrawingTools } from '../../store/DrawingToolsContext';
import { useViewMode } from '../../store/ViewModeContext';
import { SidebarCard } from './SidebarCard';
import { ChatSessionCard } from './ChatSessionCard';
import { UserProfile } from './UserProfile';
import { ExecutionCard } from './ExecutionCard';
import derivNeoDark from '../../assets/deriv_neo_dark_mode.svg';
import derivNeoLight from '../../assets/deriv_neo_light_mode.svg';
import type { CardType } from '../../types';

const SIDEBAR_STATE_KEY = 'deriv-neo-sidebar-state';

type SidebarTab = 'chats' | 'positions';

interface SidebarState {
  activeTab: SidebarTab;
  chatsOpen: boolean;
  favoritesOpen: boolean;
  archivedOpen: boolean;
}

const defaultState: SidebarState = {
  activeTab: 'chats',
  chatsOpen: true,
  favoritesOpen: false,
  archivedOpen: false,
};

function loadSidebarState(): SidebarState {
  try {
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return defaultState;
}

function saveSidebarState(state: SidebarState): void {
  try {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { favoriteCards, archivedCards, sessions, resetChat, activeCards } = useChat();
  const { theme } = useTheme();
  const { clearChatTags, clearAllDrawings } = useDrawingTools();
  const { setMode, resetAllUISettings, panelNotification, clearPanelNotification } = useViewMode();
  
  const [sidebarState, setSidebarState] = useState<SidebarState>(loadSidebarState);
  const { chatsOpen, favoritesOpen, archivedOpen } = sidebarState;

  // Helper: verifica se é um trade card (vai para aba Positions)
  const isTradeCard = (cardType: CardType) => 
    cardType === 'create-trade-card' || 
    cardType === 'trade-card' ||
    cardType === 'card_trade' ||
    cardType === 'card_trade_creator';

  // Filtrar cards de trade para a aba Positions
  const positionCards = useMemo(() => 
    activeCards.filter(card => isTradeCard(card.type as CardType)),
    [activeCards]
  );

  // React to panel notification - expand sidebar and switch to positions tab
  useEffect(() => {
    if (panelNotification && panelNotification.sidebar === 'left' && panelNotification.panel === 'positions') {
      // Expand sidebar if collapsed
      if (isCollapsed && onToggleCollapse) {
        onToggleCollapse();
      }
      // Switch to positions tab
      setSidebarState(prev => {
        const newState = { ...prev, activeTab: 'positions' as SidebarTab };
        saveSidebarState(newState);
        return newState;
      });
      // Clear the notification
      clearPanelNotification();
    }
  }, [panelNotification, isCollapsed, onToggleCollapse, clearPanelNotification]);

  // Handler para iniciar novo chat - limpa tudo, volta pro chat mode e reseta layout
  const handleNewChat = useCallback(() => {
    // 1. Limpar dados do chat
    resetChat();
    clearChatTags();
    clearAllDrawings();
    
    // 2. Resetar modo para chat
    setMode('chat');
    
    // 3. Resetar TODOS os parâmetros de UI (larguras, collapse states, etc.)
    resetAllUISettings();
    
    // 4. Limpar estados persistidos de sidebars no localStorage
    try {
      localStorage.removeItem('deriv-neo-sidebar-state');
      localStorage.removeItem('deriv-neo-right-sidebar-state');
    } catch {
      // Ignore storage errors
    }
    
    // 5. Resetar estado local do sidebar para valores padrão
    setSidebarState(defaultState);
  }, [resetChat, clearChatTags, clearAllDrawings, setMode, resetAllUISettings]);

  // Sync state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SIDEBAR_STATE_KEY && e.newValue) {
        try {
          setSidebarState(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateState = useCallback((updates: Partial<SidebarState>) => {
    setSidebarState(prev => {
      const newState = { ...prev, ...updates };
      saveSidebarState(newState);
      return newState;
    });
  }, []);

  const setActiveTab = (tab: SidebarTab) => updateState({ activeTab: tab });
  const setChatsOpen = (open: boolean) => updateState({ chatsOpen: open });
  const setFavoritesOpen = (open: boolean) => updateState({ favoritesOpen: open });
  const setArchivedOpen = (open: boolean) => updateState({ archivedOpen: open });

  const { activeTab } = sidebarState;
  const activeChats = sessions.filter(s => !s.is_archived && !s.is_favorite);
  const favoriteChats = sessions.filter(s => s.is_favorite && !s.is_archived);
  const archivedChats = sessions.filter(s => s.is_archived);

  return (
    <aside className={`relative z-40 border-r flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-[325px]'
    } ${
      theme === 'dark'
        ? 'bg-zinc-950 border-zinc-800/50'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`p-4 border-b transition-colors ${
        theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <img
              src={theme === 'dark' ? derivNeoDark : derivNeoLight}
              alt="Deriv Neo"
              className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNewChat}
            />
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div 
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleNewChat}
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 19.11 23.89" fill="currentColor">
                  <path d="M14.42.75l-1.23,6.99h-4.28c-3.99,0-7.8,3.23-8.5,7.22l-.3,1.7c-.7,3.99,1.96,7.22,5.95,7.22h3.57c2.91,0,5.68-2.35,6.19-5.26L19.11,0l-4.69.75ZM11.39,17.96c-.16.9-.97,1.63-1.87,1.63h-2.17c-1.79,0-2.99-1.46-2.68-3.25l.19-1.06c.32-1.79,2.03-3.25,3.82-3.25h3.75l-1.05,5.93Z"/>
                </svg>
              </div>
            </div>
          )}
          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className={`absolute -right-3 top-5 p-1 rounded-full shadow-md transition-colors z-[70] ${
                theme === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700'
                  : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
          {onToggleCollapse && isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className={`absolute -right-3 top-5 p-1 rounded-full shadow-md transition-colors z-[70] ${
                theme === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700'
                  : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
              title="Expand sidebar"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <button
            onClick={() => {
              setActiveTab('chats');
              onToggleCollapse?.();
            }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'chats'
                ? theme === 'dark'
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-gray-200 text-gray-700'
                : theme === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setActiveTab('positions');
              onToggleCollapse?.();
            }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'positions'
                ? theme === 'dark'
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-gray-200 text-gray-700'
                : theme === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
            }`}
            title="Positions"
          >
            <Target className="w-5 h-5" />
          </button>
          <div className={`w-8 h-px ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} />
          <button
            onClick={() => {
              setFavoritesOpen(true);
              setActiveTab('chats');
              onToggleCollapse?.();
            }}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
            }`}
            title="Favorites"
          >
            <Star className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setArchivedOpen(true);
              setActiveTab('chats');
              onToggleCollapse?.();
            }}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
            }`}
            title="Archived"
          >
            <Archive className="w-5 h-5" />
          </button>
        </div>
      ) : (
      <>
      {/* Tab Navigation */}
      <div className={`flex border-b ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'chats'
              ? theme === 'dark'
                ? 'text-white'
                : 'text-gray-900'
              : theme === 'dark'
                ? 'text-zinc-500 hover:text-zinc-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chats</span>
          {activeTab === 'chats' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'positions'
              ? theme === 'dark'
                ? 'text-white'
                : 'text-gray-900'
              : theme === 'dark'
                ? 'text-zinc-500 hover:text-zinc-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Positions</span>
          {positionCards.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600'
            }`}>{positionCards.length}</span>
          )}
          {activeTab === 'positions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'chats' ? (
          /* Chats Tab Content */
          <>
        <div className={`p-3 rounded-lg transition-colors ${
          chatsOpen && activeChats.length > 0
            ? theme === 'dark'
              ? 'bg-zinc-900/30'
              : 'bg-gray-100/50'
            : ''
        }`}>
          <button
            onClick={() => setChatsOpen(!chatsOpen)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-lg ${
              theme === 'dark'
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <span className="flex-1 text-left">Chats</span>
            {activeChats.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600'
              }`}>
                {activeChats.length}
              </span>
            )}
            {chatsOpen ? (
              <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            )}
          </button>

          {chatsOpen && (
            <div className="mt-2 space-y-1">
              {activeChats.length === 0 ? (
                <p className={`text-xs px-3 py-2 transition-colors ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>No chats yet</p>
              ) : (
                activeChats.map(session => (
                  <ChatSessionCard key={session.id} session={session} />
                ))
              )}
            </div>
          )}
        </div>

        <div className={`p-3 pt-0 rounded-lg transition-colors ${
          favoritesOpen && (favoriteCards.length + favoriteChats.length) > 0
            ? theme === 'dark'
              ? 'bg-zinc-900/30'
              : 'bg-gray-100/50'
            : ''
        }`}>
          <button
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-lg ${
              theme === 'dark'
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Star className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <span className="flex-1 text-left">Favorites</span>
            {(favoriteCards.length + favoriteChats.length) > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600'
              }`}>
                {favoriteCards.length + favoriteChats.length}
              </span>
            )}
            {favoritesOpen ? (
              <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            )}
          </button>

          {favoritesOpen && (
            <div className="mt-2 space-y-1">
              {favoriteChats.length === 0 && favoriteCards.length === 0 ? (
                <p className={`text-xs px-3 py-2 transition-colors ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>No favorites yet</p>
              ) : (
                <>
                  {favoriteChats.map(session => (
                    <ChatSessionCard key={session.id} session={session} />
                  ))}
                  {favoriteCards.map(card => (
                    <SidebarCard key={card.id} card={card} variant="favorite" />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className={`p-3 pt-0 rounded-lg transition-colors ${
          archivedOpen && (archivedCards.length + archivedChats.length) > 0
            ? theme === 'dark'
              ? 'bg-zinc-900/30'
              : 'bg-gray-100/50'
            : ''
        }`}>
          <button
            onClick={() => setArchivedOpen(!archivedOpen)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-lg ${
              theme === 'dark'
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Archive className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            <span className="flex-1 text-left">Archived</span>
            {(archivedCards.length + archivedChats.length) > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600'
              }`}>
                {archivedCards.length + archivedChats.length}
              </span>
            )}
            {archivedOpen ? (
              <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
            )}
          </button>

          {archivedOpen && (
            <div className="mt-2 space-y-1">
              {archivedCards.length === 0 && archivedChats.length === 0 ? (
                <p className={`text-xs px-3 py-2 transition-colors ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}>No archived items</p>
              ) : (
                <>
                  {archivedChats.map(session => (
                    <ChatSessionCard key={session.id} session={session} />
                  ))}
                  {archivedCards.map(card => (
                    <SidebarCard key={card.id} card={card} variant="archived" />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
          </>
        ) : (
          /* Positions Tab Content */
          <div className="p-3">
            {positionCards.length === 0 ? (
              <div className={`text-center py-8 transition-colors ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`}>
                <Target className={`w-8 h-8 mx-auto mb-2 ${
                  theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'
                }`} />
                <p className="text-sm">No positions yet</p>
                <p className="text-xs mt-1">Your open positions will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {positionCards.map(card => (
                  <ExecutionCard key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {/* User Profile Footer - always visible */}
      <UserProfile isCollapsed={isCollapsed} />
    </aside>
  );
}
