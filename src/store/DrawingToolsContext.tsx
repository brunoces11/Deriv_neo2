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

// Extended tag with snapshot for persistence
export interface DrawingTagWithSnapshot extends DrawingTag {
  id: string;
  snapshot: {
    points: { time: number; price: number }[];
    color: string;
  };
}

interface DrawingToolsContextValue {
  activeTool: DrawingTool;
  drawings: Drawing[];
  selectedDrawingId: string | null;
  chatTags: DrawingTag[];
  setActiveTool: (tool: DrawingTool) => void;
  toggleTool: (tool: Exclude<DrawingTool, 'none'>) => void;
  addDrawing: (drawing: Omit<Drawing, 'id' | 'createdAt'>) => Drawing;
  removeDrawing: (id: string) => void;
  clearAllDrawings: () => void;
  selectDrawing: (id: string | null) => void;
  addTagToChat: (drawing: Drawing) => DrawingTag;
  removeTagFromChat: (drawingId: string) => void;
  clearChatTags: () => void;
  // Session sync functions
  setDrawingsFromSession: (drawings: Drawing[], preserveLocal?: boolean) => void;
  setTagsFromSession: (tags: DrawingTagWithSnapshot[]) => void;
  restoreDrawingFromSnapshot: (snapshot: DrawingTagWithSnapshot) => Drawing;
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

  const addDrawing = useCallback((drawing: Omit<Drawing, 'id' | 'createdAt'>): Drawing => {
    const newDrawing: Drawing = {
      ...drawing,
      id: `drawing-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      createdAt: Date.now(),
    };
    setDrawings(current => [...current, newDrawing]);
    setActiveTool('none');
    return newDrawing;
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

  const addTagToChat = useCallback((drawing: Drawing): DrawingTag => {
    let newTag: DrawingTag | null = null;
    
    setChatTags(current => {
      // Don't add duplicate
      if (current.some(t => t.drawingId === drawing.id)) {
        newTag = current.find(t => t.drawingId === drawing.id)!;
        return current;
      }
      
      // Count existing tags of the same type to generate counter
      const sameTypeCount = current.filter(t => t.type === drawing.type).length;
      const counter = sameTypeCount + 1;
      const baseLabel = generateLabel(drawing.type);
      
      newTag = {
        drawingId: drawing.id,
        type: drawing.type,
        label: `${baseLabel}-${counter}`,
      };
      
      return [...current, newTag];
    });
    
    return newTag!;
  }, []);

  const removeTagFromChat = useCallback((drawingId: string) => {
    setChatTags(current => current.filter(t => t.drawingId !== drawingId));
  }, []);

  const clearChatTags = useCallback(() => {
    setChatTags([]);
  }, []);

  // Session sync functions
  const setDrawingsFromSession = useCallback((sessionDrawings: Drawing[], preserveLocal: boolean = false) => {
    console.log('DrawingToolsContext: setDrawingsFromSession called', { count: sessionDrawings.length, preserveLocal });
    
    if (preserveLocal && sessionDrawings.length === 0) {
      // Don't clear local drawings if session has none and we want to preserve
      console.log('DrawingToolsContext: Preserving local drawings (session empty)');
      return;
    }
    
    setDrawings(sessionDrawings);
    setSelectedDrawingId(null);
    setActiveTool('none');
  }, []);

  const setTagsFromSession = useCallback((sessionTags: DrawingTagWithSnapshot[]) => {
    // Convert session tags to chat tags format
    const tags: DrawingTag[] = sessionTags.map(t => ({
      drawingId: t.drawingId,
      type: t.type,
      label: t.label,
    }));
    setChatTags(tags);
  }, []);

  const restoreDrawingFromSnapshot = useCallback((snapshot: DrawingTagWithSnapshot): Drawing => {
    // Create a temporary drawing from the snapshot to display on chart
    const restoredDrawing: Drawing = {
      id: `restored-${snapshot.id}-${Date.now()}`,
      type: snapshot.type,
      points: snapshot.snapshot.points,
      color: snapshot.snapshot.color,
      createdAt: Date.now(),
    };
    
    // Add to drawings temporarily (for visualization)
    setDrawings(current => {
      // Remove any previous restored version of this snapshot
      const filtered = current.filter(d => !d.id.startsWith(`restored-${snapshot.id}`));
      return [...filtered, restoredDrawing];
    });
    
    // Select the restored drawing
    setSelectedDrawingId(restoredDrawing.id);
    
    return restoredDrawing;
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
        setDrawingsFromSession,
        setTagsFromSession,
        restoreDrawingFromSnapshot,
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
