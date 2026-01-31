import { ChatMessages } from '../chat/ChatMessages';
import { ChatInput_NEO } from '../chat/ChatInput_NEO';
import { ActiveCards } from '../cards/ActiveCards';
import { ModeToggle } from './ModeToggle';
import { DrawingToolsPanel } from '../chart/DrawingToolsPanel';
import { AssetSelector } from '../chart/AssetSelector';
import { DashboardView } from './DashboardView';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';

interface MainAreaProps {
  isGraphMode: boolean;
  isDashboardMode: boolean;
}

export function MainArea({ isGraphMode, isDashboardMode }: MainAreaProps) {
  const { messages } = useChat();
  const { theme } = useTheme();
  const hasMessages = messages.length > 0;

  return (
    <main className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors ${
      isGraphMode ? 'bg-transparent pointer-events-none' : theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
    }`}>
      {!isGraphMode && !isDashboardMode && (
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] pointer-events-none transition-opacity ${
          theme === 'dark'
            ? 'from-zinc-800/20 via-zinc-900 to-zinc-900'
            : 'from-gray-100/50 via-white to-white'
        }`} />
      )}

      {/* Header row - Mode Toggle + Asset Selector (graph mode) */}
      <div className={`relative z-10 flex items-center px-4 border-b pointer-events-auto h-14 ${
        theme === 'dark' ? 'border-zinc-800/30' : 'border-gray-100'
      } ${isGraphMode ? 'border-transparent' : ''}`} style={{ marginTop: '7px' }}>
        {/* Left spacer / Asset Selector */}
        <div className="flex-1 flex items-center justify-start min-w-0 h-full">
          {isGraphMode && <AssetSelector />}
        </div>
        {/* Mode Toggle - center */}
        <div className="flex-shrink-0 flex items-center h-full">
          <ModeToggle />
        </div>
        {/* Right spacer */}
        <div className="flex-1 min-w-0 h-full" />
      </div>

      {/* Drawing Tools Panel - positioned at bottom center in Graph Mode */}
      {isGraphMode && (
        <div className="absolute bottom-[110px] left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <DrawingToolsPanel />
        </div>
      )}

      <div className={`flex-1 flex flex-col relative z-10 overflow-hidden ${isGraphMode ? 'pointer-events-none' : ''}`}>
        {isDashboardMode ? (
          <DashboardView />
        ) : isGraphMode ? (
          // Graph Mode: área vazia, chart está no fundo e recebe eventos
          <div className="flex-1" />
        ) : !hasMessages ? (
          <WelcomeScreen />
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="mx-auto w-full px-4 chat-content-width">
              <ChatMessages />
              <ActiveCards />
            </div>
          </div>
        )}
      </div>

      {!isGraphMode && !isDashboardMode && (
        <div className={`relative z-20 border-t backdrop-blur-xl transition-colors ${
          theme === 'dark'
            ? 'border-zinc-800/50 bg-zinc-900/80'
            : 'border-gray-200 bg-white/80'
        }`}>
          <div className="mx-auto w-full px-4 py-4 chat-content-width">
            <ChatInput_NEO />
          </div>
        </div>
      )}
    </main>
  );
}

function WelcomeScreen() {
  const { theme } = useTheme();

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
          <svg
            className="w-8 h-8 text-white"
            viewBox="0 0 19.11 23.89"
            fill="currentColor"
          >
            <path d="M14.42.75l-1.23,6.99h-4.28c-3.99,0-7.8,3.23-8.5,7.22l-.3,1.7c-.7,3.99,1.96,7.22,5.95,7.22h3.57c2.91,0,5.68-2.35,6.19-5.26L19.11,0l-4.69.75ZM11.39,17.96c-.16.9-.97,1.63-1.87,1.63h-2.17c-1.79,0-2.99-1.46-2.68-3.25l.19-1.06c.32-1.79,2.03-3.25,3.82-3.25h3.75l-1.05,5.93Z"/>
          </svg>
        </div>
        <h2 className={`text-2xl font-semibold mb-3 transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          What can I help you with?
        </h2>
        <p className={`mb-8 leading-relaxed transition-colors ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          Ask me to buy, sell, swap assets, check your portfolio, or set up trading bots.
          I'll create actionable cards based on your requests.
        </p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <SuggestionCard text="Show my portfolio" />
          <SuggestionCard text="Buy 0.1 BTC" />
          <SuggestionCard text="Set up a DCA bot" />
          <SuggestionCard text="Swap ETH to USDC" />
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ text }: { text: string }) {
  const { theme } = useTheme();

  return (
    <button className={`group px-4 py-3 rounded-xl border transition-all text-sm text-left ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300'
        : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-gray-700'
    }`}>
      <span className={`transition-colors ${
        theme === 'dark' ? 'group-hover:text-white' : 'group-hover:text-gray-900'
      }`}>{text}</span>
    </button>
  );
}
