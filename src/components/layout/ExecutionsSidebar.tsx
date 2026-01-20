import { Zap } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { ExecutionCard } from './ExecutionCard';

export function ExecutionsSidebar() {
  const { activeCards } = useChat();
  const { theme } = useTheme();

  return (
    <aside className={`w-72 border-l flex flex-col h-full transition-colors ${
      theme === 'dark'
        ? 'bg-zinc-950 border-zinc-800/50'
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b transition-colors ${
        theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-red-500/10'
              : 'bg-red-50'
          }`}>
            <Zap className="w-4 h-4 text-red-500" />
          </div>
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
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {activeCards.length === 0 ? (
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
