import { useState } from 'react';
import { TrendingUp, Minus, Square, Trash2 } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useDrawingTools, type DrawingTool } from '../../store/DrawingToolsContext';

interface TooltipProps {
  text: string;
  visible: boolean;
}

function Tooltip({ text, visible }: TooltipProps) {
  if (!visible) return null;
  
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 rounded-md bg-zinc-800 text-white text-xs font-medium whitespace-nowrap shadow-lg z-50 pointer-events-none">
      {text}
      {/* Arrow */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-800" />
    </div>
  );
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  theme: 'dark' | 'light';
  onHover: (hovering: boolean) => void;
}

function ToolButton({ icon, label, isActive, onClick, theme, onHover }: ToolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setShowTooltip(true); onHover(true); }}
      onMouseLeave={() => { setShowTooltip(false); onHover(false); }}
      className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
        isActive
          ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20'
          : theme === 'dark'
            ? 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-300'
      }`}
    >
      {icon}
      <Tooltip text={label} visible={showTooltip} />
    </button>
  );
}

export function DrawingToolsPanel() {
  const { theme } = useTheme();
  const { 
    activeTool, 
    toggleTool, 
    drawings, 
    clearAllDrawings,
  } = useDrawingTools();
  
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const [isPanelHovered, setIsPanelHovered] = useState(false);

  const tools: { tool: Exclude<DrawingTool, 'none'>; icon: React.ReactNode; label: string }[] = [
    { tool: 'trendline', icon: <TrendingUp className="w-[18px] h-[18px]" />, label: 'Trend Line' },
    { tool: 'horizontal', icon: <Minus className="w-[18px] h-[18px]" />, label: 'Support/Resistance' },
    { tool: 'rectangle', icon: <Square className="w-[18px] h-[18px]" />, label: 'Rectangle Selection' },
  ];

  return (
    <div 
      className="relative flex flex-col items-center"
      onMouseEnter={() => setIsPanelHovered(true)}
      onMouseLeave={() => setIsPanelHovered(false)}
    >
      <div
        className={`flex items-center h-10 rounded-full p-1.5 gap-1.5 transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-800 border border-zinc-700/50'
            : 'bg-gray-200 border border-gray-300'
        }`}
      >
        {tools.map(({ tool, icon, label }) => (
          <ToolButton
            key={tool}
            icon={icon}
            label={label}
            isActive={activeTool === tool}
            onClick={() => toggleTool(tool)}
            theme={theme}
            onHover={setIsPanelHovered}
          />
        ))}

        {/* Clear all button - only when there are drawings */}
        {drawings.length > 0 && (
          <>
            <div
              className={`w-px h-6 mx-1 ${
                theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'
              }`}
            />
            
            <button
              onClick={clearAllDrawings}
              onMouseEnter={() => { setShowClearTooltip(true); setIsPanelHovered(true); }}
              onMouseLeave={() => { setShowClearTooltip(false); setIsPanelHovered(false); }}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                theme === 'dark'
                  ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-700'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-300'
              }`}
            >
              <Trash2 className="w-[18px] h-[18px]" />
              <Tooltip text={`Clear all (${drawings.length})`} visible={showClearTooltip} />
            </button>
          </>
        )}
      </div>
      
      {/* Hint text - appears on hover */}
      <div 
        className={`absolute top-full mt-2 text-xs text-zinc-500 whitespace-nowrap transition-opacity duration-200 ${
          isPanelHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Create interactive drawings and send them to chat with AI
      </div>
    </div>
  );
}
