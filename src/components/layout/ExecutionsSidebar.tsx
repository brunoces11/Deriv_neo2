import { Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { ExecutionCard } from './ExecutionCard';

interface ExecutionsSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ExecutionsSidebar({ isCollapsed = false, onToggleCollapse }: ExecutionsSidebarProps) {
  const { activeCards } = useChat();
  const { theme } = useTheme();

  return (
    <aside className={`relative z-40 border-l flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    } ${
      theme === 'dark'
        ? 'bg-zinc-950 border-zinc-800/50'
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b transition-colors ${
        theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
              title="Collapse sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {onToggleCollapse && isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className={`absolute -left-3 top-5 p-1 rounded-full shadow-md transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700'
                  : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
              title="Expand sidebar"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-red-500/10'
              : 'bg-red-50'
          }`}>
            <Zap className="w-4 h-4 text-red-500" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1">
                <h2 className={`text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Executions
                </h2>
                <p className={`text-xs transition-colors ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                }`}>
                  {activeCards.length} active
                </p>
              </div>
              {activeCards.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-2">
            {activeCards.length === 0 ? (
              <Zap className={`w-5 h-5 ${
                theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'
              }`} />
            ) : (
              activeCards.slice(0, 5).map((card, index) => (
                <div
                  key={card.id}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    theme === 'dark'
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  title={card.title}
                >
                  {index + 1}
                </div>
              ))
            )}
            {activeCards.length > 5 && (
              <div className={`text-xs ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
              }`}>
                +{activeCards.length - 5}
              </div>
            )}
          </div>
        ) : activeCards.length === 0 ? (
          <div className={`text-center py-8 transition-colors ${
            theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
          }`}>
            <Zap className={`w-8 h-8 mx-auto mb-2 ${
              theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'
            }`} />
            <p className="text-sm">No executions yet</p>
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
    </aside>
  );
}
