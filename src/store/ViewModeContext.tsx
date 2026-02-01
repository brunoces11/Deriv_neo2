import { createContext, useContext, useReducer, useEffect, useRef, useCallback, useMemo } from 'react';

// Types
type ViewMode = 'chat' | 'graph' | 'dashboard';

interface UserPoint {
  sidebarCollapsed?: boolean;
  cardsSidebarCollapsed?: boolean;
  cardsSidebarWidth?: number;
}

// Draft Input - persisted chat input state
interface DraftInput {
  plainText: string;
  selectedAgents: string[];
  selectedProducts: string[];
  autoMode: boolean;
}

const DEFAULT_DRAFT_INPUT: DraftInput = {
  plainText: '',
  selectedAgents: [],
  selectedProducts: [],
  autoMode: true,
};

interface ViewModeState {
  currentMode: ViewMode;
  userPoints: Record<ViewMode, UserPoint>;
  isResizing: boolean;
  draftInput: DraftInput;
}

// Start Points - configuração padrão de cada modo
const START_POINTS: Record<ViewMode, Required<Omit<UserPoint, never>> & { chartVisible: boolean }> = {
  chat: {
    sidebarCollapsed: false,
    cardsSidebarCollapsed: false,
    cardsSidebarWidth: 660,
    chartVisible: false,
  },
  graph: {
    sidebarCollapsed: true,
    cardsSidebarCollapsed: false,
    cardsSidebarWidth: 690,
    chartVisible: true,
  },
  dashboard: {
    sidebarCollapsed: true,
    cardsSidebarCollapsed: false,
    cardsSidebarWidth: 690,
    chartVisible: false,
  },
};

// Computed config - merge startPoint + userPoint
function computeConfig(mode: ViewMode, userPoint: UserPoint | undefined) {
  const start = START_POINTS[mode];
  const user = userPoint ?? {};
  return {
    sidebarCollapsed: user.sidebarCollapsed ?? start.sidebarCollapsed,
    cardsSidebarCollapsed: user.cardsSidebarCollapsed ?? start.cardsSidebarCollapsed,
    cardsSidebarWidth: user.cardsSidebarWidth ?? start.cardsSidebarWidth,
    chartVisible: start.chartVisible,
  };
}

// Context value
interface ViewModeContextValue {
  currentMode: ViewMode;
  isResizing: boolean;
  sidebarCollapsed: boolean;
  cardsSidebarCollapsed: boolean;
  cardsSidebarWidth: number;
  chartVisible: boolean;
  draftInput: DraftInput;
  toggleMode: () => void;
  setMode: (mode: ViewMode) => void;
  updateUserPoint: (updates: Partial<UserPoint>) => void;
  setResizing: (value: boolean) => void;
  resetMode: () => void;
  updateDraftInput: (updates: Partial<DraftInput>) => void;
  clearDraftInput: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

// Reducer
type Action =
  | { type: 'SET_MODE'; payload: ViewMode }
  | { type: 'UPDATE_USER_POINT'; payload: Partial<UserPoint> }
  | { type: 'SET_RESIZING'; payload: boolean }
  | { type: 'RESET_MODE' }
  | { type: 'LOAD_STATE'; payload: { currentMode: ViewMode; userPoints: Record<ViewMode, UserPoint>; draftInput?: DraftInput } }
  | { type: 'UPDATE_DRAFT_INPUT'; payload: Partial<DraftInput> }
  | { type: 'CLEAR_DRAFT_INPUT' };

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
        draftInput: action.payload.draftInput ?? DEFAULT_DRAFT_INPUT,
      };
    
    case 'UPDATE_DRAFT_INPUT':
      return {
        ...state,
        draftInput: {
          ...state.draftInput,
          ...action.payload,
        },
      };
    
    case 'CLEAR_DRAFT_INPUT':
      return {
        ...state,
        draftInput: DEFAULT_DRAFT_INPUT,
      };
    
    default:
      return state;
  }
}

// Storage
const STORAGE_KEY = 'deriv-neo-view-mode';

function loadFromStorage(): { currentMode: ViewMode; userPoints: Record<ViewMode, UserPoint>; draftInput: DraftInput } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.userPoints) {
        return {
          currentMode: 'chat',
          userPoints: {
            chat: parsed.userPoints.chat ?? {},
            graph: parsed.userPoints.graph ?? {},
            dashboard: parsed.userPoints.dashboard ?? {},
          },
          draftInput: parsed.draftInput ?? DEFAULT_DRAFT_INPUT,
        };
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveToStorage(currentMode: ViewMode, userPoints: Record<ViewMode, UserPoint>, draftInput: DraftInput) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentMode, userPoints, draftInput }));
  } catch {
    // Ignore
  }
}

// Provider
export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    currentMode: 'chat',
    userPoints: { chat: {}, graph: {}, dashboard: {} },
    isResizing: false,
    draftInput: DEFAULT_DRAFT_INPUT,
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
      saveToStorage(state.currentMode, state.userPoints, state.draftInput);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state.currentMode, state.userPoints, state.draftInput]);

  // Actions
  const toggleMode = useCallback(() => {
    const modes: ViewMode[] = ['chat', 'graph', 'dashboard'];
    const currentIndex = modes.indexOf(state.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    dispatch({ type: 'SET_MODE', payload: modes[nextIndex] });
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

  const updateDraftInput = useCallback((updates: Partial<DraftInput>) => {
    dispatch({ type: 'UPDATE_DRAFT_INPUT', payload: updates });
  }, []);

  const clearDraftInput = useCallback(() => {
    dispatch({ type: 'CLEAR_DRAFT_INPUT' });
  }, []);

  // Computed config
  const config = useMemo(
    () => computeConfig(state.currentMode, state.userPoints[state.currentMode]),
    [state.currentMode, state.userPoints]
  );

  const value: ViewModeContextValue = {
    currentMode: state.currentMode,
    isResizing: state.isResizing,
    draftInput: state.draftInput,
    ...config,
    toggleMode,
    setMode,
    updateUserPoint,
    setResizing,
    resetMode,
    updateDraftInput,
    clearDraftInput,
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
