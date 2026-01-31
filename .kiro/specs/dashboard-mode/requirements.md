# Requirements: Dashboard Mode

## Overview

Adicionar um terceiro modo de visualização (Dashboard Mode) ao sistema existente de dual-view (Chat/Graph), mantendo o mesmo botão de alternância e criando um layout grid customizável.

## Functional Requirements

### 1. Mode Toggle - Três Modos

**REQ-1.1**: O ModeToggle DEVE suportar três modos: 'chat', 'graph', 'dashboard'

**REQ-1.2**: O ModeToggle DEVE manter o mesmo layout/posição atual

**REQ-1.3**: O ModeToggle DEVE exibir 3 botões lado a lado com slider animado

**REQ-1.4**: Cada botão DEVE ter ícone + label:
- Chat: MessageSquare + "Chat Mode"
- Graph: TrendingUp + "Graph Mode"
- Dashboard: LayoutDashboard + "Dashboard"

**REQ-1.5**: O atalho de teclado (Ctrl+Shift+M) DEVE ciclar entre os 3 modos

### 2. ViewModeContext - Suporte a Dashboard

**REQ-2.1**: ViewMode type DEVE incluir 'dashboard': `type ViewMode = 'chat' | 'graph' | 'dashboard'`

**REQ-2.2**: START_POINTS DEVE incluir configuração para 'dashboard':
```typescript
dashboard: {
  sidebarCollapsed: false,        // Left sidebar expandido
  cardsSidebarCollapsed: false,   // Right sidebar expandido
  cardsSidebarWidth: 480,         // Right sidebar mais largo
  chartVisible: false,            // Chart não visível
}
```

**REQ-2.3**: UserPoint DEVE persistir customizações por modo (incluindo dashboard)

**REQ-2.4**: localStorage DEVE persistir o modo dashboard

### 3. Dashboard Layout - Nested Grid

**REQ-3.1**: Dashboard DEVE ocupar a MainArea completa (mesmo espaço que o gráfico)

**REQ-3.2**: Dashboard DEVE ter 2 colunas principais:
- `dashboard_main_area` (esquerda): área principal grid customizável
- `right_sidebar` (direita): sidebar com cards expandidos

**REQ-3.3**: Left Sidebar DEVE permanecer visível no Dashboard Mode

**REQ-3.4**: Left Sidebar (compactado ou expandido) NÃO DEVE sobrepor o dashboard

**REQ-3.5**: Dashboard DEVE se encaixar no espaço disponível respeitando sidebars

### 4. Dashboard Main Area

**REQ-4.1**: Dashboard main area DEVE ser um grid vazio inicialmente

**REQ-4.2**: Dashboard main area DEVE ocupar flex-1 do espaço disponível

**REQ-4.3**: Dashboard main area DEVE ter background theme-aware (dark/light)

**REQ-4.4**: Dashboard main area DEVE exibir placeholder message inicialmente:
```
"Dashboard Mode - Coming Soon
This area will contain customizable grid panels"
```

### 5. Right Sidebar no Dashboard Mode

**REQ-5.1**: Right sidebar DEVE ser mais largo no Dashboard Mode (default 480px)

**REQ-5.2**: Right sidebar DEVE exibir cards em modo expandido

**REQ-5.3**: Right sidebar DEVE manter funcionalidade de resize

**REQ-5.4**: Right sidebar DEVE manter funcionalidade de collapse

**REQ-5.5**: Right sidebar DEVE ter min-width de 320px no Dashboard Mode

### 6. MainArea - Dashboard Rendering

**REQ-6.1**: MainArea DEVE detectar `isDashboardMode = currentMode === 'dashboard'`

**REQ-6.2**: MainArea DEVE renderizar DashboardView quando isDashboardMode=true

**REQ-6.3**: MainArea NÃO DEVE renderizar chat components quando isDashboardMode=true

**REQ-6.4**: ModeToggle DEVE permanecer visível no Dashboard Mode

### 7. Layout Responsiveness

**REQ-7.1**: Dashboard DEVE respeitar left sidebar width (tanto 280px quanto 54px)

**REQ-7.2**: Dashboard DEVE respeitar right sidebar width (min 320px, max 960px)

**REQ-7.3**: Dashboard main area DEVE calcular width dinamicamente:
```
width = 100vw - leftSidebarWidth - rightSidebarWidth
```

**REQ-7.4**: Dashboard DEVE manter transitions suaves entre estados

## Non-Functional Requirements

### 8. Preservação de Estado

**REQ-8.1**: Alternar entre modos NÃO DEVE resetar estado de sidebars

**REQ-8.2**: Customizações do usuário DEVEM ser isoladas por modo

**REQ-8.3**: Voltar ao Dashboard Mode DEVE restaurar último estado do usuário

### 9. Performance

**REQ-9.1**: Transições entre modos DEVEM ser fluidas (300ms)

**REQ-9.2**: Dashboard rendering NÃO DEVE causar layout shifts

**REQ-9.3**: Persistência localStorage DEVE usar debounce (500ms)

### 10. Desenvolvimento Incremental

**REQ-10.1**: NÃO implementar lógica de cards adicionais nesta fase

**REQ-10.2**: NÃO implementar painéis customizáveis nesta fase

**REQ-10.3**: NÃO implementar drag-and-drop nesta fase

**REQ-10.4**: Fase 1: apenas estrutura base do Dashboard Mode

## Out of Scope

- Grid customizável (fase futura)
- Drag-and-drop de painéis (fase futura)
- Favoritar boxes/cards no dashboard (fase futura)
- Novos tipos de cards/painéis (fase futura)
- Dashboard presets/templates (fase futura)

## Acceptance Criteria

### AC-1: Mode Toggle
- [ ] ModeToggle exibe 3 botões com ícones corretos
- [ ] Clicar em cada botão ativa o modo correspondente
- [ ] Slider anima corretamente para 3 posições
- [ ] Ctrl+Shift+M cicla: chat → graph → dashboard → chat

### AC-2: Dashboard Layout
- [ ] Dashboard renderiza no MainArea
- [ ] Left sidebar visível e funcional
- [ ] Right sidebar mais largo (480px default)
- [ ] Dashboard main area preenche espaço disponível
- [ ] Placeholder message visível

### AC-3: Sidebars Interaction
- [ ] Left sidebar collapse/expand funciona no Dashboard
- [ ] Right sidebar collapse/expand funciona no Dashboard
- [ ] Right sidebar resize funciona no Dashboard
- [ ] Dashboard NÃO sobrepõe sidebars

### AC-4: State Persistence
- [ ] Alternar chat → dashboard → chat preserva estados
- [ ] Alternar graph → dashboard → graph preserva estados
- [ ] Customizações de sidebars são isoladas por modo
- [ ] Recarregar página mantém modo dashboard se estava ativo

### AC-5: Visual Consistency
- [ ] Dashboard respeita tema dark/light
- [ ] Transições suaves entre modos
- [ ] Borders e cores consistentes com design system
- [ ] Typography consistente
