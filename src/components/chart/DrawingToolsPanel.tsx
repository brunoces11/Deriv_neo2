import { useState } from 'react';
import { TrendingUp, Minus, Square, Trash2, MessageSquare } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useDrawingTools, type DrawingTool } from '../../store/DrawingToolsContext';
import { useViewMode } from '../../store/ViewModeContext';

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
}

function ToolButton({ icon, label, isActive, onClick, theme }: ToolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all ${
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
    selectedDrawingId,
    addTagToChat,
    selectDrawing,
  } = useDrawingTools();
  const { updateUserPoint, executionsSidebarWidth, executionsSidebarCollapsed } = useViewMode();
  
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const [showSendTooltip, setShowSendTooltip] = useState(false);

  const tools: { tool: Exclude<DrawingTool, 'none'>; icon: React.ReactNode; label: string }[] = [
    { tool: 'trendline', icon: <TrendingUp className="w-4 h-4" />, label: 'Trend Line' },
    { tool: 'horizontal', icon: <Minus className="w-4 h-4" />, label: 'Support/Resistance' },
    { tool: 'rectangle', icon: <Square className="w-4 h-4" />, label: 'Rectangle Selection' },
  ];

  const selectedDrawing = selectedDrawingId 
    ? drawings.find(d => d.id === selectedDrawingId) 
    : null;

  const handleSendToChat = () => {
    if (!selectedDrawing) return;
    
    // Add tag to chat
    addTagToChat(selectedDrawing);
    
    // Expand the executions sidebar if collapsed or too small
    // Only resize if current width is less than 500px
    const currentWidth = executionsSidebarWidth;
    if (executionsSidebarCollapsed || currentWidth < 500) {
      updateUserPoint({ 
        executionsSidebarCollapsed: false,
        executionsSidebarWidth: 500 
      });
    }
    
    // Deselect the drawing
    selectDrawing(null);
  };

  return (
    <div
      className={`flex items-center h-9 rounded-full p-1 gap-1 transition-colors ${
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
        />
      ))}

      {/* Separator + Action buttons */}
      {(drawings.length > 0 || selectedDrawingId) && (
        <>
          <div
            className={`w-px h-5 mx-1 ${
              theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'
            }`}
          />
          
          {/* Send to Chat button - only when drawing is selected */}
          {selectedDrawing && (
            <button
              onClick={handleSendToChat}
              onMouseEnter={() => setShowSendTooltip(true)}
              onMouseLeave={() => setShowSendTooltip(false)}
              className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                theme === 'dark'
                  ? 'text-zinc-400 hover:text-blue-400 hover:bg-zinc-700'
                  : 'text-gray-500 hover:text-blue-500 hover:bg-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <Tooltip text="Send to Chat" visible={showSendTooltip} />
            </button>
          )}
          
          {/* Clear all button */}
          {drawings.length > 0 && (
            <button
              onClick={clearAllDrawings}
              onMouseEnter={() => setShowClearTooltip(true)}
              onMouseLeave={() => setShowClearTooltip(false)}
              className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                theme === 'dark'
                  ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-700'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <Tooltip text={`Clear all (${drawings.length})`} visible={showClearTooltip} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
