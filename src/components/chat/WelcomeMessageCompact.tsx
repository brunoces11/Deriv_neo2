import { useTheme } from '../../store/ThemeContext';
import { useViewMode } from '../../store/ViewModeContext';
import { useDrawingTools } from '../../store/DrawingToolsContext';
import { useCallback } from 'react';

/**
 * WelcomeMessageCompact Component
 * 
 * Versão compacta do welcome message para o chat no right sidebar
 * (usado em graph/dashboard/hub modes).
 * Mantém os ice breaker buttons funcionais.
 */
export function WelcomeMessageCompact() {
  const { theme } = useTheme();
  const { updateDraftInput, clearDraftInput } = useViewMode();
  const { clearChatTags } = useDrawingTools();

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

  return (
    <div className="h-full flex items-center justify-center px-3">
      <div className="w-full max-w-[510px] py-6">
        {/* Logo Icon */}
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 19.11 23.89"
          fill="currentColor"
        >
          <path d="M14.42.75l-1.23,6.99h-4.28c-3.99,0-7.8,3.23-8.5,7.22l-.3,1.7c-.7,3.99,1.96,7.22,5.95,7.22h3.57c2.91,0,5.68-2.35,6.19-5.26L19.11,0l-4.69.75ZM11.39,17.96c-.16.9-.97,1.63-1.87,1.63h-2.17c-1.79,0-2.99-1.46-2.68-3.25l.19-1.06c.32-1.79,2.03-3.25,3.82-3.25h3.75l-1.05,5.93Z"/>
        </svg>
      </div>

      {/* Title */}
      <h3 className={`text-center text-sm font-semibold mb-2 transition-colors ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        What can I help you with?
      </h3>

      {/* Description */}
      <p className={`text-center text-xs mb-4 leading-relaxed transition-colors ${
        theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
      }`}>
        Ask me to buy, sell, swap assets, check your portfolio, or set up trading bots.
      </p>

        {/* Ice Breaker Buttons - Grid 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          <IceBreakerButton 
            text="Create new Trade" 
            onClick={() => handleIcebreaker('Create new Trade')} 
          />
          <IceBreakerButton 
            text="Create new Bot" 
            onClick={() => handleIcebreaker('Create new Bot')} 
          />
          <IceBreakerButton 
            text="Create new Action" 
            onClick={() => handleIcebreaker('Create new Action')} 
          />
          <IceBreakerButton 
            text="Check my portfolio performance" 
            onClick={() => handleIcebreaker('Check my portfolio performance')} 
          />
        </div>
      </div>
    </div>
  );
}

function IceBreakerButton({ text, onClick }: { text: string; onClick: () => void }) {
  const { theme } = useTheme();

  return (
    <button 
      onClick={onClick}
      className={`group px-2 py-2 rounded-lg border transition-all text-xs text-left ${
        theme === 'dark'
          ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-400'
          : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-gray-600'
      }`}
    >
      <span className={`transition-colors ${
        theme === 'dark' ? 'group-hover:text-zinc-300' : 'group-hover:text-gray-800'
      }`}>{text}</span>
    </button>
  );
}
