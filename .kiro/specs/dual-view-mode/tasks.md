# Implementation Plan: Dual View Mode - Chat Components Migration

## Overview

Atualizar o sistema de dual view mode para:
1. Mudar o START_POINT do Graph Mode (sidebar expandido 669px)
2. Adicionar displayMode aos componentes de chat
3. Migrar chat components para ExecutionsSidebar no Graph Mode
4. MainArea vazia no Graph Mode

## O que já funciona

- ViewModeContext com persistência
- ExecutionsSidebar com resize funcional
- ModeToggle funcionando
- CSS transitions existentes

## O que precisa mudar

1. Atualizar START_POINTS no ViewModeContext (graph: 669px, não colapsado)
2. Adicionar prop displayMode ao ChatInput e ChatMessages
3. ExecutionsSidebar renderiza chat components quando isGraphMode=true
4. MainArea não renderiza chat components quando isGraphMode=true

## Tasks

- [x] 1. Atualizar START_POINTS no ViewModeContext
  - Mudar `graph.executionsSidebarCollapsed` de `true` para `false`
  - Mudar `graph.executionsSidebarWidth` de `54` para `669`
  - _Requirements: 5.2, 5.6_

- [x] 2. Adicionar displayMode ao ChatInput
  - [x] 2.1 Criar prop `displayMode?: 'center' | 'sidebar'`
    - Default: 'center'
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 2.2 Implementar estilos para modo 'sidebar'
    - Remover max-w-3xl
    - Padding reduzido (p-1.5 em vez de p-2)
    - Textarea menor (text-xs, max-h-[80px])
    - Esconder texto de disclaimer
    - _Requirements: 10.3_

- [x] 3. Adicionar displayMode ao ChatMessages
  - [x] 3.1 Criar prop `displayMode?: 'center' | 'sidebar'`
    - Default: 'center'
    - _Requirements: 10.4, 10.5, 10.6_
  - [x] 3.2 Implementar estilos para modo 'sidebar'
    - Avatars menores (w-6 h-6 em vez de w-8 h-8)
    - Font size menor (text-xs em vez de text-sm)
    - Padding reduzido nos bubbles (px-3 py-2)
    - Spacing reduzido (space-y-4, py-3)
    - _Requirements: 10.6_

- [x] 4. Atualizar ExecutionsSidebar para Graph Mode
  - [x] 4.1 Adicionar prop `isGraphMode: boolean`
    - _Requirements: 11.1_
  - [x] 4.2 Implementar layout de 3 seções quando isGraphMode=true
    - Executions section: max-h-[40%], overflow-y-auto
    - ChatMessages section: flex-1, overflow-y-auto
    - ChatInput section: flex-shrink-0, border-t
    - _Requirements: 11.2, 11.3, 11.4, 11.5_
  - [x] 4.3 Importar e renderizar ChatMessages e ChatInput no Graph Mode
    - Passar displayMode='sidebar' para ambos
    - _Requirements: 5.5, 10.8_

- [x] 5. Atualizar MainArea para Graph Mode
  - [x] 5.1 Condicionar renderização de chat components
    - Se isGraphMode=true: não renderizar WelcomeScreen, ChatMessages, ChatInput
    - Se isGraphMode=false: comportamento atual
    - _Requirements: 4.5, 5.4, 10.7_
  - [x] 5.2 Manter ModeToggle visível em ambos os modos
    - _Requirements: 7.1_

- [x] 6. Atualizar App.tsx para passar isGraphMode ao ExecutionsSidebar
  - Passar `isGraphMode={currentMode === 'graph'}` como prop
  - _Requirements: 11.1_

- [x] 7. Checkpoint - Build verificado
  - Build passou sem erros
  - Todos os componentes integrados

## Arquivos a Modificar

- `src/store/ViewModeContext.tsx` - START_POINTS
- `src/components/chat/ChatInput.tsx` - displayMode prop
- `src/components/chat/ChatMessages.tsx` - displayMode prop
- `src/components/layout/ExecutionsSidebar.tsx` - isGraphMode + layout
- `src/components/layout/MainArea.tsx` - condicionar chat components
- `src/App.tsx` - passar isGraphMode

## O que NÃO fazer

- Não modificar ChatContext
- Não modificar Sidebar (left)
- Não modificar ChartLayer
- Não criar novos componentes desnecessários
