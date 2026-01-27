import { createContext, useContext, useReducer, useEffect, useRef, useCallback, useMemo } from 'react';

// Types
type ViewMode = 'chat' | 'graph';

interface UserPoint {
  sidebarCollapsed?: boolean;
  executionsSidebarCollapsed?: boolean;
  executionsSidebarWidth?: number;
}

interface ViewModeState {
  currentMode: ViewMode;
  userPoints: Record<ViewMode, UserPoint>;
  isResizing: boolean;
}

// Start Points - configuração padrão de cada modo
const START_POINTS: Record<ViewMode, Required<Omit<UserPoint, never>> & { chartVisible: boolean }> = {
  chat: {
    sidebarCollapsed: false,
    executionsSidebarCollapsed: false,
    executionsSidebarWidth: 660,
    chartVisible: false,
  },
  graph: {
    sidebarCollapsed: true,
    executionsSidebarCollapsed: false,
    executionsSidebarWidth: 840,
    chartVisible: true,
  },
};

// Computed config - merge startPoint + userPoint
function computeConfig(mode: ViewMode, userPoint: UserPoint) {
  const start = START_POINTS[mode];
  return {
    sidebarCollapsed: userPoint.sidebarCollapsed ?? start.sidebarCollapsed,
    executionsSidebarCollapsed: userPoint.executionsSidebarCollapsed ?? start.executionsSidebarCollapsed,
    executionsSidebarWidth: userPoint.executionsSidebarWidth ?? start.executionsSidebarWidth,
    chartVisible: start.chartVisible, // Chart visibility não é customizável pelo usuário
  };
}

// Context value
interface ViewModeContextValue {
  currentMode: ViewMode;
  isResizing: boolean;
  sidebarCollapsed: boolean;
  executionsSidebarCollapsed: boolean;
  executionsSidebarWidth: number;
  chartVisible: boolean;
  toggleMode: () => void;
  setMode: (mode: ViewMode) => void;
  updateUserPoint: (updates: Partial<UserPoint>) => void;
  setResizing: (value: boolean) => void;
  resetMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

// Reducer
type Action =
  | { type: 'SET_MODE'; payload: ViewMode }
  | { type: 'UPDATE_USER_POINT'; payload: Partial<UserPoint> }
  | { type: 'SET_RESIZING'; payload: boolean }
  | { type: 'RESET_MODE' }
  | { type: 'LOAD_STATE'; payload: { currentMode: ViewMode; userPoints: Record<ViewMode, UserPoint> } };

function reducer(state: ViewModeState, action: Action): ViewModeState {
  switch (action.type) {
    case 'SET_MODE':
      if (state.isResizing) return state; // Bloquear durante resize
      return { ...state, currentMode: action.payload };
    
    case 'UPDATE_USER_POINT':
      return {
        ...state,
        userPoints: {
          ...state.userPoints,
          [state.currentMode]: {
            ...state.userPoints[state.currentMode],
            ...action.payload,
          },
        },
      };
    
    case 'SET_RESIZING':
      return { ...state, isResizing: action.payload };
    
    case 'RESET_MODE':
      return {
        ...state,
        userPoints: {
          ...state.userPoints,
          [state.currentMode]: {},
        },
      };
    
    case 'LOAD_STATE':
      return {
        ...state,
        currentMode: action.payload.currentMode,
        userPoints: action.payload.userPoints,
      };
    
    default:
      return state;
  }
}

// Storage
const STORAGE_KEY = 'deriv-neo-view-mode';

function loadFromStorage(): { currentMode: ViewMode; userPoints: Record<ViewMode, UserPoint> } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.userPoints) {
        // Only restore userPoints (sidebar widths, collapsed states)
        // Always start in 'chat' mode - don't restore currentMode
        return {
          currentMode: 'chat', // Always start in chat mode
          userPoints: parsed.userPoints,
        };
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveToStorage(currentMode: ViewMode, userPoints: Record<ViewMode, UserPoint>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentMode, userPoints }));
  } catch {
    // Ignore
  }
}

// Provider
export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    currentMode: 'chat',
    userPoints: { chat: {}, graph: {} },
    isResizing: false,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      dispatch({ type: 'LOAD_STATE', payload: stored });
    }
  }, []);

  // Save to storage with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      saveToStorage(state.currentMode, state.userPoints);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state.currentMode, state.userPoints]);

  // Actions
  const toggleMode = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: state.currentMode === 'chat' ? 'graph' : 'chat' });
  }, [state.currentMode]);

  const setMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const updateUserPoint = useCallback((updates: Partial<UserPoint>) => {
    dispatch({ type: 'UPDATE_USER_POINT', payload: updates });
  }, []);

  const setResizing = useCallback((value: boolean) => {
    dispatch({ type: 'SET_RESIZING', payload: value });
  }, []);

  const resetMode = useCallback(() => {
    dispatch({ type: 'RESET_MODE' });
  }, []);

  // Computed config
  const config = useMemo(
    () => computeConfig(state.currentMode, state.userPoints[state.currentMode]),
    [state.currentMode, state.userPoints]
  );

  const value: ViewModeContextValue = {
    currentMode: state.currentMode,
    isResizing: state.isResizing,
    ...config,
    toggleMode,
    setMode,
    updateUserPoint,
    setResizing,
    resetMode,
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

// Hook
export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within ViewModeProvider');
  }
  return context;
}
