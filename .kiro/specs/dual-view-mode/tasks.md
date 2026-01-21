# Implementation Plan: Dual View Mode

## Overview

Centralizar estado de modos no Context + persistir ajustes do usuário por modo.

## O que já funciona

- handleChartToggle já faz: chart ON → collapse sidebars, chart OFF → expand sidebars
- ExecutionsSidebar já tem resize funcional
- CSS transitions já existem (duration-300)

## O que precisa mudar

1. Mover estado do MainLayout pro ViewModeContext
2. Persistir userPoint por modo (width do ExecutionsSidebar, collapsed states)
3. Trocar ChartToggle por ModeToggle (mesmo comportamento, nome diferente)

## Tasks

- [x] 1. Criar ViewModeContext
  - `src/store/ViewModeContext.tsx`
  - Estado: currentMode, userPoints por modo, isResizing
  - Actions: setMode, toggleMode, updateUserPoint, setResizing
  - Persistência: localStorage com debounce
  - Start Points hardcoded: chat={sidebars expanded, chart hidden}, graph={sidebars collapsed, chart visible}
  - _Requirements: 1.1-1.4, 2.1-2.5_

- [x] 2. Integrar no App
  - ViewModeProvider entre ThemeProvider e ChatProvider
  - MainLayout: remover useState, usar useViewMode()
  - Passar props pros componentes baseado em config computada
  - _Requirements: 4.1-4.4, 5.1-5.4, 8.1-8.2_

- [x] 3. Atualizar ExecutionsSidebar
  - Adicionar props: width, onResize, onResizeStart, onResizeEnd
  - Chamar onResizeStart no mouseDown, onResizeEnd+onResize no mouseUp
  - _Requirements: 3.4, 8.2_

- [x] 4. Criar ModeToggle
  - Substituir ChartToggle por ModeToggle
  - Mesmo visual, só muda o nome e ícones
  - Keyboard shortcut opcional
  - _Requirements: 7.1-7.4_

- [x] 5. Reset Mode (opcional)
  - Função resetMode() já implementada no ViewModeContext
  - Pode ser chamada via useViewMode().resetMode()
  - _Requirements: 9.1-9.4_

- [x] 6. Checkpoint Final
  - Build verificado: OK
  - Todos os componentes integrados
  - localStorage persistence implementado
  - Keyboard shortcut Ctrl+Shift+M funcionando

## Arquivos

**Criar:**
- src/store/ViewModeContext.tsx
- src/components/layout/ModeToggle.tsx

**Modificar:**
- src/App.tsx
- src/components/layout/ExecutionsSidebar.tsx
- src/components/layout/MainArea.tsx (trocar ChartToggle por ModeToggle)

## O que NÃO fazer

- ChatInput compact mode - desnecessário, funciona igual nos dois modos
- MainArea backgroundTransparent prop - usar isGraphMode direto
- Over-engineering de tipos - manter simples
