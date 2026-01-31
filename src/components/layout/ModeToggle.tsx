import { useEffect } from 'react';
import { MessageSquare, TrendingUp, LayoutDashboard } from 'lucide-react';
import { useViewMode } from '../../store/ViewModeContext';
import { useTheme } from '../../store/ThemeContext';

export function ModeToggle() {
  const { currentMode, toggleMode } = useViewMode();
  const { theme } = useTheme();

  const sliderPosition = currentMode === 'chat' ? 'left-1' : currentMode === 'graph' ? 'left-[calc(33.33%+1px)]' : 'left-[calc(66.66%+1px)]';
  const sliderColor = currentMode === 'graph'
    ? 'bg-gradient-to-r from-red-500 to-rose-500'
    : theme === 'dark'
      ? 'bg-zinc-600'
      : 'bg-white shadow-sm';

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
      className={`relative flex items-center h-9 rounded-full p-1 transition-colors ${
        theme === 'dark'
          ? 'bg-zinc-800 border border-zinc-700/50'
          : 'bg-gray-200 border border-gray-300'
      }`}
      title="Toggle view mode (Ctrl+Shift+M)"
    >
      {/* Slider */}
      <div
        className={`absolute h-7 rounded-full transition-all duration-300 ease-out ${sliderColor} ${sliderPosition}`}
        style={{ width: 'calc(33.33% - 4px)' }}
      />

      {/* Chat Mode Label */}
      <span
        className={`relative z-10 px-3 py-1 text-sm font-bold transition-colors text-center flex items-center gap-1.5 ${
          currentMode === 'chat'
            ? theme === 'dark' ? 'text-white' : 'text-gray-900'
            : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
        }`}
        style={{ width: '33.33%' }}
      >
        <MessageSquare className="w-4 h-4" />
        Chat
      </span>

      {/* Graph Mode Label */}
      <span
        className={`relative z-10 px-3 py-1 text-sm font-bold transition-colors text-center flex items-center gap-1.5 ${
          currentMode === 'graph'
            ? 'text-white'
            : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
        }`}
        style={{ width: '33.33%' }}
      >
        <TrendingUp className="w-4 h-4" />
        Graph
      </span>

      {/* Dashboard Mode Label */}
      <span
        className={`relative z-10 px-3 py-1 text-sm font-bold transition-colors text-center flex items-center gap-1.5 ${
          currentMode === 'dashboard'
            ? theme === 'dark' ? 'text-white' : 'text-gray-900'
            : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
        }`}
        style={{ width: '33.33%' }}
      >
        <LayoutDashboard className="w-4 h-4" />
        Dash
      </span>
    </button>
  );
}
