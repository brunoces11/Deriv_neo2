# Implementation Plan: Executions Sidebar

## Overview

Implementação do sidebar de Executions à direita da interface, reutilizando padrões existentes do Left Sidebar e sistema de cards.

## Tasks

- [x] 1. Criar componente ExecutionCard
  - Criar `src/components/layout/ExecutionCard.tsx`
  - Implementar renderização compacta com ícone, título e label
  - Adicionar ações de hover (favorite, archive)
  - Suportar dark/light theme via useTheme
  - _Requirements: 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2_

- [x] 2. Criar componente ExecutionsSidebar
  - Criar `src/components/layout/ExecutionsSidebar.tsx`
  - Implementar header com título "Executions", ícone e contador
  - Consumir activeCards do ChatContext
  - Renderizar lista de ExecutionCard para cada card ativo
  - Implementar empty state quando não há cards
  - Adicionar scroll com custom-scrollbar
  - Suportar dark/light theme
  - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2, 3.3, 6.1, 6.2, 7.1, 7.2, 7.3_

- [x] 3. Atualizar MainLayout para três colunas
  - Modificar `src/App.tsx` para incluir ExecutionsSidebar
  - Manter ordem: Sidebar → MainArea → ExecutionsSidebar
  - Garantir layout flex correto
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Checkpoint - Verificar integração visual
  - Ensure all components render correctly, ask the user if questions arise.

- [ ]* 5. Escrever property tests
  - [ ]* 5.1 Property test: Sidebar-ActiveCards Invariant
    - **Property 1: Sidebar-ActiveCards Invariant**
    - **Validates: Requirements 2.2, 2.3, 3.3**

  - [ ]* 5.2 Property test: Card Rendering Completeness
    - **Property 2: Card Rendering Completeness**
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [ ]* 5.3 Property test: Favorite Action Propagation
    - **Property 3: Favorite Action Propagation**
    - **Validates: Requirements 5.2, 5.5**

  - [ ]* 5.4 Property test: Archive Action Effect
    - **Property 4: Archive Action Effect**
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 5.5 Property test: Theme Reactivity
    - **Property 5: Theme Reactivity**
    - **Validates: Requirements 6.3**

- [ ] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- O componente ExecutionCard é baseado no SidebarCard existente
- O ExecutionsSidebar segue o mesmo padrão estrutural do Sidebar
- Não há mudanças necessárias no ChatContext - reutiliza activeCards existente
- Property tests usam fast-check com mínimo 100 iterações

