# Design Document: Dual View Mode System

## Overview

Centralizar estado de modos em um Context, persistir ajustes do usuário por modo, e suportar dois modos de exibição para componentes de chat (center/sidebar).

## Arquitetura Simplificada

```
ThemeProvider
  └── ViewModeProvider
        └── ChatProvider
              └── MainLayout
                    ├── ChartLayer (visible baseado no modo)
                    ├── Sidebar (collapsed baseado no modo + userPoint)
                    ├── MainArea (renderiza chat components apenas em Chat Mode)
                    │     └── ModeToggle
                    │     └── [Chat Mode only] WelcomeScreen / ChatMessages / ChatInput
                    └── ExecutionsSidebar (collapsed + width baseado no modo + userPoint)
                          └── [Graph Mode only] Executions + ChatMessages + ChatInput
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

## Start Points (ATUALIZADO)

```typescript
const START_POINTS: Record<ViewMode, Required<UserPoint> & { chartVisible: boolean }> = {
  chat: {
    sidebarCollapsed: false,
    executionsSidebarCollapsed: false,
    executionsSidebarWidth: 288, // w-72
    chartVisible: false,
  },
  graph: {
    sidebarCollapsed: true,
    executionsSidebarCollapsed: false,  // MUDANÇA: agora abre expandido
    executionsSidebarWidth: 669,        // MUDANÇA: largura padrão 669px
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

## Chat Components Display Mode

Os componentes de chat agora suportam dois modos de exibição:

### ChatInput

```typescript
interface ChatInputProps {
  displayMode?: 'center' | 'sidebar';
}

// center (default): max-w-3xl, padding maior, textarea maior
// sidebar: width 100%, padding reduzido, textarea compacto
```

### ChatMessages

```typescript
interface ChatMessagesProps {
  displayMode?: 'center' | 'sidebar';
}

// center (default): max-w-3xl, message bubbles maiores, avatars 32px
// sidebar: width 100%, message bubbles compactos, avatars 24px, font menor
```

### WelcomeScreen

- Renderiza APENAS em Chat Mode
- NÃO aparece no Graph Mode (sidebar mostra ChatInput direto)



## ExecutionsSidebar - Layout por Modo

### Chat Mode Layout
```
┌─────────────────────────┐
│ Header (Executions)     │
├─────────────────────────┤
│                         │
│ Executions Cards        │
│ (scrollable)            │
│                         │
└─────────────────────────┘
```

### Graph Mode Layout (NOVO)
```
┌─────────────────────────┐
│ Header (Executions)     │
├─────────────────────────┤
│ Executions Cards        │
│ (flex-shrink, max-h)    │
├─────────────────────────┤
│                         │
│ ChatMessages            │
│ (flex-1, scrollable)    │
│                         │
├─────────────────────────┤
│ ChatInput (compact)     │
│ (flex-shrink-0)         │
└─────────────────────────┘
```

```typescript
interface ExecutionsSidebarProps {
  isCollapsed: boolean;
  width: number;
  isGraphMode: boolean;  // NOVO: determina qual layout usar
  onToggleCollapse: () => void;
  onResize: (width: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

// Comportamento:
// 1. Se isGraphMode=false: layout atual (apenas executions)
// 2. Se isGraphMode=true: layout de 3 seções (executions + chat + input)
// 3. Executions section: max-height 40%, overflow-y-auto
// 4. ChatMessages section: flex-1, overflow-y-auto
// 5. ChatInput section: flex-shrink-0, padding reduzido
```

## MainArea - Mudanças

```typescript
interface MainAreaProps {
  isGraphMode: boolean;
}

// Comportamento:
// 1. Se isGraphMode=false: renderiza WelcomeScreen/ChatMessages + ChatInput (atual)
// 2. Se isGraphMode=true: renderiza APENAS ModeToggle, área vazia/transparente
// 3. bg-transparent quando isGraphMode=true
// 4. Esconder gradient background quando isGraphMode=true
```

## ModeToggle

```typescript
function ModeToggle() {
  const { currentMode, toggleMode } = useViewMode();
  
  // Ícone: MessageSquare (chat) ou TrendingUp (graph)
  // Label: "Chat" ou "Graph"
  // onClick: toggleMode()
  // Keyboard: Ctrl+Shift+M
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mode State Isolation
*For any* sequence of user interactions in Mode A, switching to Mode B and back to Mode A SHALL restore the exact User_Point state that existed before switching.
**Validates: Requirements 2.1, 2.3, 2.4**

### Property 2: Start Point Application
*For any* mode without User_Point customizations, the computed config SHALL equal the Start_Point for that mode.
**Validates: Requirements 4.1-4.4, 5.1-5.6**

### Property 3: User Point Override
*For any* User_Point value set by the user, that value SHALL override the corresponding Start_Point value in computed config.
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 4: Chat Components Location
*For any* view mode, Chat_Components SHALL render in exactly one location: MainArea (center) for Chat_Mode OR ExecutionsSidebar for Graph_Mode.
**Validates: Requirements 4.5, 5.4, 5.5, 10.1-10.8**

### Property 5: Graph Mode Default Width
*For any* new session accessing Graph_Mode for the first time, ExecutionsSidebar SHALL open with width 669px.
**Validates: Requirements 5.2, 5.6**

## Error Handling

1. **localStorage indisponível**: Usar estado em memória, sem persistência
2. **Resize durante transição**: isResizing bloqueia setMode
3. **Width inválido**: Clamp entre COLLAPSED_WIDTH e MAX_WIDTH

## Testing Strategy

### Unit Tests
- Testar computeConfig com diferentes combinações de startPoint/userPoint
- Testar reducer actions isoladamente
- Testar persistência localStorage

### Property Tests
- Property 1: Gerar sequência aleatória de interações, verificar isolamento
- Property 2: Verificar startPoint aplicado quando userPoint vazio
- Property 3: Verificar override de userPoint sobre startPoint
- Property 4: Verificar localização exclusiva de chat components
- Property 5: Verificar width padrão em primeira sessão

## O que NÃO muda

- **Sidebar (left)**: Já aceita isCollapsed e onToggleCollapse, não muda
- **ChartLayer**: Já aceita isVisible, não muda
- **ChatContext**: Não precisa de mudanças

## Edge Cases

1. **Resize durante transição**: isResizing bloqueia setMode
2. **Width preservado entre modos**: userPoint.executionsSidebarWidth é por modo
3. **Collapsed manual em Graph Mode**: userPoint.executionsSidebarCollapsed=true sobrescreve startPoint
4. **Sem mensagens em Graph Mode**: Mostrar ChatInput sem WelcomeScreen
