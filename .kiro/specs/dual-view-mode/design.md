# Design Document: Dual View Mode System

## Overview

Centralizar estado de modos em um Context, persistir ajustes do usuário por modo.

## Arquitetura Simplificada

```
ThemeProvider
  └── ViewModeProvider
        └── ChatProvider
              └── MainLayout
                    ├── ChartLayer (visible baseado no modo)
                    ├── Sidebar (collapsed baseado no modo + userPoint)
                    ├── MainArea (bg-transparent baseado no modo)
                    │     └── ModeToggle
                    └── ExecutionsSidebar (collapsed + width baseado no modo + userPoint)
```

## ViewModeContext

```typescript
type ViewMode = 'chat' | 'graph';

// UserPoint - só o que o usuário modificou manualmente
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

interface ViewModeContextValue {
  currentMode: ViewMode;
  isResizing: boolean;
  
  // Config computada (startPoint + userPoint)
  sidebarCollapsed: boolean;
  executionsSidebarCollapsed: boolean;
  executionsSidebarWidth: number;
  chartVisible: boolean;
  
  // Actions
  toggleMode: () => void;
  setMode: (mode: ViewMode) => void;
  updateUserPoint: (updates: Partial<UserPoint>) => void;
  setResizing: (value: boolean) => void;
  resetMode: () => void;
}
```

## Start Points (hardcoded)

```typescript
const START_POINTS: Record<ViewMode, Required<UserPoint> & { chartVisible: boolean }> = {
  chat: {
    sidebarCollapsed: false,
    executionsSidebarCollapsed: false,
    executionsSidebarWidth: 288,
    chartVisible: false,
  },
  graph: {
    sidebarCollapsed: true,
    executionsSidebarCollapsed: true,
    executionsSidebarWidth: 54,
    chartVisible: true,
  },
};
```

## Computed Config

```typescript
function computeConfig(mode: ViewMode, userPoint: UserPoint) {
  const start = START_POINTS[mode];
  return {
    sidebarCollapsed: userPoint.sidebarCollapsed ?? start.sidebarCollapsed,
    executionsSidebarCollapsed: userPoint.executionsSidebarCollapsed ?? start.executionsSidebarCollapsed,
    executionsSidebarWidth: userPoint.executionsSidebarWidth ?? start.executionsSidebarWidth,
    chartVisible: start.chartVisible, // Chart visibility não é customizável
  };
}
```

## Persistência

```typescript
const STORAGE_KEY = 'deriv-neo-view-mode';

interface StoredState {
  currentMode: ViewMode;
  userPoints: Record<ViewMode, UserPoint>;
}

// Persistir com debounce de 500ms
// Carregar no mount do provider
// isResizing NÃO é persistido
```

## MainLayout Refatorado

```typescript
function MainLayout() {
  const { 
    currentMode,
    sidebarCollapsed,
    executionsSidebarCollapsed,
    executionsSidebarWidth,
    chartVisible,
    updateUserPoint,
    setResizing,
  } = useViewMode();
  const { theme } = useTheme();

  return (
    <div className="h-screen flex overflow-hidden relative">
      <ChartLayer isVisible={chartVisible} theme={theme} />
      
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => updateUserPoint({ sidebarCollapsed: !sidebarCollapsed })}
      />
      
      <MainArea isGraphMode={currentMode === 'graph'} />
      
      <ExecutionsSidebar 
        isCollapsed={executionsSidebarCollapsed}
        width={executionsSidebarWidth}
        onToggleCollapse={() => updateUserPoint({ executionsSidebarCollapsed: !executionsSidebarCollapsed })}
        onResize={(w) => updateUserPoint({ executionsSidebarWidth: w })}
        onResizeStart={() => setResizing(true)}
        onResizeEnd={() => setResizing(false)}
      />
    </div>
  );
}
```

## ExecutionsSidebar - Mudanças

```typescript
interface ExecutionsSidebarProps {
  isCollapsed: boolean;
  width: number;
  onToggleCollapse: () => void;
  onResize: (width: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

// Comportamento:
// 1. Estado local de width durante resize (performance)
// 2. Sincronizar com prop width quando não está em resize
// 3. Chamar onResize(finalWidth) no mouseUp
// 4. Quando isCollapsed=true, forçar width visual para 54px
```

## MainArea - Mudanças

```typescript
interface MainAreaProps {
  isGraphMode: boolean;
}

// Usar isGraphMode para:
// - bg-transparent quando true
// - Esconder gradient background quando true
// - Renderizar ModeToggle em vez de ChartToggle
```

## ModeToggle

```typescript
function ModeToggle() {
  const { currentMode, toggleMode } = useViewMode();
  
  // Ícone: MessageSquare (chat) ou TrendingUp (graph)
  // Label: "Chat" ou "Graph"
  // onClick: toggleMode()
  // Keyboard: Ctrl+Shift+M (opcional)
}
```

## O que NÃO muda

- **ChatInput**: Funciona igual nos dois modos, não precisa de prop mode
- **Sidebar**: Já aceita isCollapsed e onToggleCollapse, não muda
- **ChartLayer**: Já aceita isVisible, não muda

## Edge Cases

1. **Resize durante transição**: isResizing bloqueia setMode
2. **Width preservado entre modos**: userPoint.executionsSidebarWidth é por modo
3. **Collapsed manual em Graph Mode**: userPoint.sidebarCollapsed=false sobrescreve startPoint
