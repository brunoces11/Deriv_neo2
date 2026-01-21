import { useEffect } from 'react';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { useViewMode } from '../../store/ViewModeContext';
import { useTheme } from '../../store/ThemeContext';

export function ModeToggle() {
  const { currentMode, toggleMode } = useViewMode();
  const { theme } = useTheme();
  const isGraphMode = currentMode === 'graph';

  // Keyboard shortcut: Ctrl/Cmd + Shift + M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        toggleMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode]);

  return (
    <button
      onClick={toggleMode}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        isGraphMode
          ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30'
          : theme === 'dark'
            ? 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700/50'
            : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-gray-200'
      }`}
      title={isGraphMode ? 'Switch to Chat Mode' : 'Switch to Graph Mode'}
    >
      {isGraphMode ? (
        <MessageSquare className="w-3.5 h-3.5" />
      ) : (
        <TrendingUp className="w-3.5 h-3.5" />
      )}
      <span>{isGraphMode ? 'Chat Mode' : 'Graph Mode'}</span>
    </button>
  );
}
