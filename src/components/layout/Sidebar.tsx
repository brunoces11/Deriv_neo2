import { Star, Archive, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { SidebarCard } from './SidebarCard';
import { ChatSessionCard } from './ChatSessionCard';
import { UserProfile } from './UserProfile';
import derivNeoDark from '../../assets/deriv_neo_dark_mode.svg';
import derivNeoLight from '../../assets/deriv_neo_light_mode.svg';

const SIDEBAR_STATE_KEY = 'deriv-neo-sidebar-state';

interface SidebarState {
  chatsOpen: boolean;
  favoritesOpen: boolean;
  archivedOpen: boolean;
}

const defaultState: SidebarState = {
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

export function Sidebar() {
  const { favoriteCards, archivedCards, sessions, resetChat } = useChat();
  const { theme } = useTheme();
  
  const [sidebarState, setSidebarState] = useState<SidebarState>(loadSidebarState);
  const { chatsOpen, favoritesOpen, archivedOpen } = sidebarState;

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

  const setChatsOpen = (open: boolean) => updateState({ chatsOpen: open });
  const setFavoritesOpen = (open: boolean) => updateState({ favoritesOpen: open });
  const setArchivedOpen = (open: boolean) => updateState({ archivedOpen: open });

  const activeChats = sessions.filter(s => !s.is_archived && !s.is_favorite);
  const favoriteChats = sessions.filter(s => s.is_favorite && !s.is_archived);
  const archivedChats = sessions.filter(s => s.is_archived);

  return (
    <aside className={`relative z-40 w-72 border-r flex flex-col h-full transition-colors ${
      theme === 'dark'
        ? 'bg-zinc-950 border-zinc-800/50'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`p-4 border-b transition-colors ${
        theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-center">
          <img
            src={theme === 'dark' ? derivNeoDark : derivNeoLight}
            alt="Deriv Neo"
            className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={resetChat}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
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
            <MessageSquare className="w-4 h-4 text-brand-green" />
            <span className="flex-1 text-left">Chats</span>
            {activeChats.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors text-brand-green ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
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
            <Star className="w-4 h-4 text-brand-green" />
            <span className="flex-1 text-left">Favorites</span>
            {(favoriteCards.length + favoriteChats.length) > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors text-brand-green ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
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
            <Archive className="w-4 h-4 text-brand-green" />
            <span className="flex-1 text-left">Archived</span>
            {(archivedCards.length + archivedChats.length) > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors text-brand-green ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
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
      </div>

      {/* User Profile Footer */}
      <UserProfile />
    </aside>
  );
}
