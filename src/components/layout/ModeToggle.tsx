import { useEffect } from 'react';
import { MessageSquare, TrendingUp, LayoutDashboard, Home } from 'lucide-react';
import { useViewMode } from '../../store/ViewModeContext';
import { useTheme } from '../../store/ThemeContext';

type ViewMode = 'chat' | 'graph' | 'dashboard' | 'hub';

export function ModeToggle() {
  const { currentMode, setMode, toggleMode } = useViewMode();
  const { theme } = useTheme();

  const sliderPositions: Record<ViewMode, string> = {
    chat: 'left-1',
    graph: 'left-[calc(25%+1px)]',
    dashboard: 'left-[calc(50%+1px)]',
    hub: 'left-[calc(75%+1px)]',
  };
  const sliderPosition = sliderPositions[currentMode];
  const sliderColor = currentMode === 'graph'
    ? 'bg-gradient-to-r from-red-500 to-rose-500'
    : theme === 'dark'
      ? 'bg-zinc-600'
      : 'bg-white shadow-sm';

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

  const modes: { key: ViewMode; icon: typeof MessageSquare; label: string }[] = [
    { key: 'chat', icon: MessageSquare, label: 'Chat' },
    { key: 'graph', icon: TrendingUp, label: 'Graph' },
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { key: 'hub', icon: Home, label: 'Hub' },
  ];

  return (
    <div
      className={`relative flex items-center h-9 rounded-full p-1 transition-colors min-w-[340px] ${
        theme === 'dark'
          ? 'bg-zinc-800 border border-zinc-700/50'
          : 'bg-gray-200 border border-gray-300'
      }`}
    >
      <div
        className={`absolute h-7 rounded-full transition-all duration-300 ease-out ${sliderColor} ${sliderPosition}`}
        style={{ width: 'calc(25% - 4px)' }}
      />

      {modes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`relative z-10 px-3 py-1 text-sm font-bold transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            currentMode === key
              ? key === 'graph'
                ? 'text-white'
                : theme === 'dark' ? 'text-white' : 'text-gray-900'
              : theme === 'dark' ? 'text-zinc-500 hover:text-zinc-400' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={{ width: '25%' }}
          title={`Switch to ${label} mode`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
