# Design Document: Dashboard Mode

## Architecture Overview

```
App
├── ThemeProvider
│   └── ViewModeProvider (ATUALIZADO: suporta 'dashboard')
│       └── DrawingToolsProvider
│           └── ChatProvider
│               └── SessionSyncProvider
│                   └── MainLayout
│                       ├── ChartLayer (isVisible: chat=false, graph=true, dashboard=false)
│                       ├── Sidebar (left - igual em todos os modos)
│                       ├── MainArea (ATUALIZADO: renderiza DashboardView quando dashboard)
│                       │   ├── [Chat Mode] WelcomeScreen / ChatMessages / ChatInput
│                       │   ├── [Graph Mode] ModeToggle + área transparente
│                       │   └── [Dashboard Mode] DashboardView (NOVO)
│                       └── CardsSidebar (right - mais largo no dashboard)
```

## ViewModeContext Updates

### Type Updates

```typescript
// ANTES
type ViewMode = 'chat' | 'graph';

// DEPOIS
type ViewMode = 'chat' | 'graph' | 'dashboard';
```

### START_POINTS Updates

```typescript
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
    cardsSidebarWidth: 840,
    chartVisible: true,
  },
  dashboard: {  // NOVO
    sidebarCollapsed: false,      // Left sidebar expandido por padrão
    cardsSidebarCollapsed: false, // Right sidebar expandido
    cardsSidebarWidth: 480,       // Right sidebar mais largo
    chartVisible: false,          // Chart não visível
  },
};
```

### Context Value Updates

```typescript
interface ViewModeContextValue {
  currentMode: ViewMode;  // Agora suporta 'dashboard'
  isResizing: boolean;
  sidebarCollapsed: boolean;
  cardsSidebarCollapsed: boolean;
  cardsSidebarWidth: number;
  chartVisible: boolean;
  draftInput: DraftInput;
  toggleMode: () => void;  // ATUALIZADO: cicla entre 3 modos
  setMode: (mode: ViewMode) => void;
  updateUserPoint: (updates: Partial<UserPoint>) => void;
  setResizing: (value: boolean) => void;
  resetMode: () => void;
  updateDraftInput: (updates: Partial<DraftInput>) => void;
  clearDraftInput: () => void;
}
```

### toggleMode Logic Update

```typescript
// ANTES
const toggleMode = useCallback(() => {
  dispatch({
    type: 'SET_MODE',
    payload: state.currentMode === 'chat' ? 'graph' : 'chat'
  });
}, [state.currentMode]);

// DEPOIS
const toggleMode = useCallback(() => {
  const modes: ViewMode[] = ['chat', 'graph', 'dashboard'];
  const currentIndex = modes.indexOf(state.currentMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  dispatch({ type: 'SET_MODE', payload: modes[nextIndex] });
}, [state.currentMode]);
```

### UserPoints Storage

```typescript
interface ViewModeState {
  currentMode: ViewMode;
  userPoints: Record<ViewMode, UserPoint>;  // Agora inclui 'dashboard'
  isResizing: boolean;
  draftInput: DraftInput;
}

// Exemplo de estado persistido:
{
  currentMode: 'dashboard',
  userPoints: {
    chat: { cardsSidebarWidth: 660 },
    graph: { sidebarCollapsed: true, cardsSidebarWidth: 840 },
    dashboard: { cardsSidebarWidth: 520 }  // Customização do usuário
  },
  draftInput: { ... }
}
```

## ModeToggle Redesign

### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  [💬 Chat Mode]  [📈 Graph Mode]  [🎛️ Dashboard]  │
│   └─────────────┘                                       │  (slider)
└─────────────────────────────────────────────────────────┘

// 3 botões com slider que se move entre eles
// Width total: auto-ajusta para 3 botões
// Cada botão: ~33% do width total
```

### Component Structure

```typescript
export function ModeToggle() {
  const { currentMode, toggleMode } = useViewMode();
  const { theme } = useTheme();

  // Keyboard shortcut: Ctrl/Cmd + Shift + M (cicla entre 3 modos)
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

  // Calcular posição do slider (0 = chat, 1 = graph, 2 = dashboard)
  const sliderPosition =
    currentMode === 'chat' ? 0 :
    currentMode === 'graph' ? 1 :
    2;

  return (
    <div className="relative flex items-center h-9 rounded-full p-1 ...">
      {/* Slider */}
      <div
        className="absolute h-7 rounded-full transition-all duration-300 ease-out ..."
        style={{
          width: 'calc(33.333% - 4px)',
          left: `calc(${sliderPosition * 33.333}% + 4px)`,
        }}
      />

      {/* Botão Chat */}
      <button onClick={() => setMode('chat')} className="...">
        <MessageSquare className="w-4 h-4" />
        <span>Chat Mode</span>
      </button>

      {/* Botão Graph */}
      <button onClick={() => setMode('graph')} className="...">
        <TrendingUp className="w-4 h-4" />
        <span>Graph Mode</span>
      </button>

      {/* Botão Dashboard */}
      <button onClick={() => setMode('dashboard')} className="...">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
      </button>
    </div>
  );
}
```

### Slider Animation

```typescript
// Posição do slider baseada no modo atual
const sliderStyles = {
  chat: {
    left: '4px',
    background: 'gradient-chat',  // zinc/white
  },
  graph: {
    left: 'calc(33.333% + 4px)',
    background: 'gradient-graph',  // red gradient
  },
  dashboard: {
    left: 'calc(66.666% + 4px)',
    background: 'gradient-dashboard',  // blue gradient ou outro
  },
};
```

## DashboardView Component (NEW)

### File: `src/components/dashboard/DashboardView.tsx`

```typescript
import { useTheme } from '../../store/ThemeContext';
import { LayoutDashboard } from 'lucide-react';

export function DashboardView() {
  const { theme } = useTheme();

  return (
    <div className={`flex-1 flex items-center justify-center transition-colors ${
      theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
    }`}>
      <div className="text-center max-w-md px-4">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-800 border border-zinc-700'
            : 'bg-gray-100 border border-gray-200'
        }`}>
          <LayoutDashboard className={`w-10 h-10 transition-colors ${
            theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
          }`} />
        </div>

        <h2 className={`text-2xl font-semibold mb-3 transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Dashboard Mode
        </h2>

        <p className={`text-sm leading-relaxed transition-colors ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          This area will contain customizable grid panels for charts, cards,
          portfolio views, and more. Coming soon.
        </p>

        <div className={`mt-8 p-4 rounded-xl border transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-800/50 border-zinc-700'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-xs transition-colors ${
            theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
          }`}>
            💡 Tip: Use the right sidebar to view your active cards in expanded mode
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Layout Behavior

- **Full height**: `flex-1` para ocupar altura disponível
- **Centered content**: placeholder centralizado
- **Theme-aware**: dark/light mode support
- **Future-proof**: estrutura preparada para grid customizável

## MainArea Updates

### Rendering Logic

```typescript
export function MainArea({ isGraphMode, isDashboardMode }: MainAreaProps) {
  const { messages } = useChat();
  const { theme } = useTheme();
  const hasMessages = messages.length > 0;

  return (
    <main className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors ${
      theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
    } ${(isGraphMode || isDashboardMode) ? 'bg-transparent pointer-events-none' : ''}`}>

      {/* Background gradient - apenas Chat Mode */}
      {!isGraphMode && !isDashboardMode && (
        <div className="absolute inset-0 bg-[radial-gradient(...)] ..." />
      )}

      {/* Header row - ModeToggle centralizado + AssetSelector (apenas graph) */}
      <div className="relative z-10 flex items-center px-4 py-2 border-b ...">
        {isGraphMode && (
          <div className="absolute left-4">
            <AssetSelector />
          </div>
        )}
        <div className="flex-1 flex justify-center">
          <ModeToggle />
        </div>
      </div>

      {/* Drawing Tools - apenas Graph Mode */}
      {isGraphMode && (
        <div className="absolute bottom-[110px] left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <DrawingToolsPanel />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden ...">
        {isDashboardMode ? (
          // Dashboard Mode: renderizar DashboardView
          <DashboardView />
        ) : isGraphMode ? (
          // Graph Mode: área vazia (chart no fundo)
          <div className="flex-1" />
        ) : !hasMessages ? (
          // Chat Mode: WelcomeScreen ou messages
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

      {/* ChatInput - apenas Chat Mode */}
      {!isGraphMode && !isDashboardMode && (
        <div className="relative z-20 border-t backdrop-blur-xl ...">
          <div className="mx-auto w-full px-4 py-4 chat-content-width">
            <ChatInput_NEO />
          </div>
        </div>
      )}
    </main>
  );
}
```

### Props Interface

```typescript
interface MainAreaProps {
  isGraphMode: boolean;
  isDashboardMode: boolean;  // NOVO
}
```

## App.tsx Updates

```typescript
function MainLayout() {
  const { theme } = useTheme();
  const {
    currentMode,
    sidebarCollapsed,
    cardsSidebarCollapsed,
    cardsSidebarWidth,
    chartVisible,
    updateUserPoint,
    setResizing,
  } = useViewMode();

  const isGraphMode = currentMode === 'graph';
  const isDashboardMode = currentMode === 'dashboard';  // NOVO

  return (
    <div className="h-screen flex overflow-hidden relative">
      <ChartLayer isVisible={chartVisible} theme={theme} />

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => updateUserPoint({ sidebarCollapsed: !sidebarCollapsed })}
      />

      <MainArea
        isGraphMode={isGraphMode}
        isDashboardMode={isDashboardMode}  // NOVO
      />

      <CardsSidebar
        isCollapsed={cardsSidebarCollapsed}
        width={cardsSidebarWidth}
        isGraphMode={isGraphMode}
        isDashboardMode={isDashboardMode}  // NOVO (opcional)
        onToggleCollapse={() => updateUserPoint({ cardsSidebarCollapsed: !cardsSidebarCollapsed })}
        onResize={(width) => updateUserPoint({ cardsSidebarWidth: width })}
        onResizeStart={() => setResizing(true)}
        onResizeEnd={() => setResizing(false)}
      />
    </div>
  );
}
```

## Layout Calculations

### Dashboard Main Area Width

```typescript
// Cálculo dinâmico do width disponível para dashboard
const dashboardWidth =
  window.innerWidth
  - (sidebarCollapsed ? 54 : 280)        // Left sidebar
  - (cardsSidebarCollapsed ? 54 : cardsSidebarWidth);  // Right sidebar

// CSS: usar flex-1 automaticamente calcula isso
```

### Responsive Behavior

```typescript
// Dashboard respeita sidebars em todos os estados:

┌──────────────────────────────────────────────────────┐
│ 54px │      Dashboard Main Area       │ 480px       │  (left collapsed)
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 280px│      Dashboard Main Area       │ 480px       │  (left expanded)
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 280px│      Dashboard Main Area                     │ 54px │  (right collapsed)
└──────────────────────────────────────────────────────┘
```

## Future Enhancements (Out of Scope)

### Phase 2: Grid System
- Implementar react-grid-layout ou similar
- Drag-and-drop de widgets
- Resize de widgets individuais
- Save/load layouts

### Phase 3: Widgets
- Chart widget (TradingView style)
- Portfolio snapshot widget
- Active cards widget
- Bot status widget
- Watchlist widget

### Phase 4: Customization
- Layout presets (trader, analyst, casual)
- Widget library
- Favoritar/pin widgets
- Share layouts

## Migration Strategy

### Fase 1 (Current): Base Structure
✅ ViewModeContext atualizado
✅ ModeToggle com 3 botões
✅ DashboardView placeholder
✅ MainArea condicional rendering
✅ Persistência de estado

### Fase 2: Visual Polish (Opcional)
- Dashboard-specific colors/gradients
- Loading states
- Empty state variations

### Fase 3: Grid Implementation
- Implementar grid system
- Conectar com cards existentes

## Error Handling

### Edge Cases

1. **Mode Switch Durante Resize**
   - `isResizing` bloqueia `setMode`
   - Finalizar resize antes de permitir switch

2. **LocalStorage Unavailable**
   - Usar estado em memória
   - Default para 'chat' mode

3. **Invalid Mode in Storage**
   - Validar mode ao carregar
   - Fallback para 'chat'

4. **Width Inconsistencies**
   - Clamp cardsSidebarWidth entre min/max
   - Dashboard: min 320px, max 960px

## Testing Checklist

### Unit Tests
- [ ] ViewModeContext suporta 3 modos
- [ ] toggleMode cicla corretamente
- [ ] START_POINTS contém dashboard config
- [ ] computeConfig funciona com dashboard

### Integration Tests
- [ ] ModeToggle renderiza 3 botões
- [ ] Slider anima para 3 posições
- [ ] Keyboard shortcut cicla modos
- [ ] MainArea renderiza DashboardView
- [ ] Sidebars respeitam dashboard layout

### E2E Tests
- [ ] Persistência: dashboard state salvo/carregado
- [ ] Isolamento: customizações por modo
- [ ] Responsiveness: layout adapta a sidebars
- [ ] Tema: dark/light mode funciona
