import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Types
export type DrawingTool = 'none' | 'trendline' | 'horizontal' | 'rectangle';

export interface Drawing {
  id: string;
  type: Exclude<DrawingTool, 'none'>;
  points: { time: number; price: number }[];
  color: string;
  createdAt: number;
}

export interface DrawingTag {
  drawingId: string;
  type: Exclude<DrawingTool, 'none'>;
  label: string;
}

interface DrawingToolsContextValue {
  activeTool: DrawingTool;
  drawings: Drawing[];
  selectedDrawingId: string | null;
  chatTags: DrawingTag[];
  setActiveTool: (tool: DrawingTool) => void;
  toggleTool: (tool: Exclude<DrawingTool, 'none'>) => void;
  addDrawing: (drawing: Omit<Drawing, 'id' | 'createdAt'>) => void;
  removeDrawing: (id: string) => void;
  clearAllDrawings: () => void;
  selectDrawing: (id: string | null) => void;
  addTagToChat: (drawing: Drawing) => void;
  removeTagFromChat: (drawingId: string) => void;
  clearChatTags: () => void;
}

const DrawingToolsContext = createContext<DrawingToolsContextValue | null>(null);

// Drawing colors by type
export const DRAWING_COLORS: Record<Exclude<DrawingTool, 'none'>, { 
  color: string; 
  selectedColor: string; 
  tagBg: string; 
  tagText: string; 
  tagTextSelected: string;
  tagBorder: string;
  tagBorderSelected: string;
  tagBgSelected: string;
}> = {
  trendline: {
    color: '#3b82f6',           // Blue escuro
    selectedColor: '#60a5fa',   // Blue mais claro quando selecionado
    tagBg: 'bg-blue-500/20',
    tagBgSelected: 'bg-blue-600/30',
    tagText: 'text-blue-300',   // 13% mais escuro que text-blue-400
    tagTextSelected: 'text-blue-200',
    tagBorder: 'border-blue-500/30',
    tagBorderSelected: 'border-blue-900/80',
  },
  horizontal: {
    color: '#a1a1aa',           // Cinza 50%
    selectedColor: '#d4d4d8',   // Cinza mais claro quando selecionado
    tagBg: 'bg-zinc-500/20',
    tagBgSelected: 'bg-zinc-600/30',
    tagText: 'text-zinc-400',
    tagTextSelected: 'text-zinc-300',
    tagBorder: 'border-zinc-500/30',
    tagBorderSelected: 'border-zinc-800/80',
  },
  rectangle: {
    color: '#22d3ee',           // Cyan claro
    selectedColor: '#67e8f9',   // Cyan mais claro quando selecionado
    tagBg: 'bg-cyan-500/20',
    tagBgSelected: 'bg-cyan-600/30',
    tagText: 'text-cyan-300',   // 18% mais escuro que text-cyan-400
    tagTextSelected: 'text-cyan-200',
    tagBorder: 'border-cyan-500/30',
    tagBorderSelected: 'border-cyan-900/80',
  },
};

// Helper to generate label
function generateLabel(type: Exclude<DrawingTool, 'none'>): string {
  const labels: Record<Exclude<DrawingTool, 'none'>, string> = {
    trendline: 'TrendLine',
    horizontal: 'Horizontal',
    rectangle: 'Rectangle',
  };
  return labels[type];
}

export function DrawingToolsProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [chatTags, setChatTags] = useState<DrawingTag[]>([]);

  const toggleTool = useCallback((tool: Exclude<DrawingTool, 'none'>) => {
    setActiveTool(current => current === tool ? 'none' : tool);
    setSelectedDrawingId(null); // Deselect when changing tool
  }, []);

  const addDrawing = useCallback((drawing: Omit<Drawing, 'id' | 'createdAt'>) => {
    const newDrawing: Drawing = {
      ...drawing,
      id: `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setDrawings(current => [...current, newDrawing]);
    setActiveTool('none');
  }, []);

  const removeDrawing = useCallback((id: string) => {
    setDrawings(current => current.filter(d => d.id !== id));
    if (selectedDrawingId === id) {
      setSelectedDrawingId(null);
    }
    // Also remove from chat tags if present
    setChatTags(current => current.filter(t => t.drawingId !== id));
  }, [selectedDrawingId]);

  const clearAllDrawings = useCallback(() => {
    setDrawings([]);
    setSelectedDrawingId(null);
    setChatTags([]);
  }, []);

  const selectDrawing = useCallback((id: string | null) => {
    setSelectedDrawingId(id);
    if (id) {
      setActiveTool('none'); // Deselect tool when selecting a drawing
    }
  }, []);

  const addTagToChat = useCallback((drawing: Drawing) => {
    setChatTags(current => {
      // Don't add duplicate
      if (current.some(t => t.drawingId === drawing.id)) {
        return current;
      }
      
      // Count existing tags of the same type to generate counter
      const sameTypeCount = current.filter(t => t.type === drawing.type).length;
      const counter = sameTypeCount + 1;
      const baseLabel = generateLabel(drawing.type);
      
      return [...current, {
        drawingId: drawing.id,
        type: drawing.type,
        label: `${baseLabel}-${counter}`,
      }];
    });
  }, []);

  const removeTagFromChat = useCallback((drawingId: string) => {
    setChatTags(current => current.filter(t => t.drawingId !== drawingId));
  }, []);

  const clearChatTags = useCallback(() => {
    setChatTags([]);
  }, []);

  return (
    <DrawingToolsContext.Provider
      value={{
        activeTool,
        drawings,
        selectedDrawingId,
        chatTags,
        setActiveTool,
        toggleTool,
        addDrawing,
        removeDrawing,
        clearAllDrawings,
        selectDrawing,
        addTagToChat,
        removeTagFromChat,
        clearChatTags,
      }}
    >
      {children}
    </DrawingToolsContext.Provider>
  );
}

export function useDrawingTools() {
  const context = useContext(DrawingToolsContext);
  if (!context) {
    throw new Error('useDrawingTools must be used within DrawingToolsProvider');
  }
  return context;
}
