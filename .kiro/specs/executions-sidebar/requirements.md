# Requirements Document

## Introduction

Este documento define os requisitos para adicionar um novo sidebar à direita da interface, dedicado a exibir "Executions" - todos os cards/módulos dinâmicos gerados durante as interações de chat. Cada card exibido no chat representa uma "execution simulada" e deve aparecer simultaneamente no sidebar direito, criando uma visão persistente e organizada de todas as execuções da sessão.

## Glossary

- **Execution**: Representação visual de uma operação simulada, materializada como um card dinâmico gerado pela IA
- **Executions_Sidebar**: Componente de sidebar posicionado à direita da área principal, dedicado a exibir todas as executions ativas
- **Card**: Módulo visual dinâmico que representa uma execution (IntentSummary, ActionTicket, Bot, PortfolioSnapshot)
- **Left_Sidebar**: Sidebar existente à esquerda, dedicado a sessões de chat, favoritos e arquivados
- **Main_Area**: Área central da interface onde ocorre o chat e exibição inline de cards
- **Active_Cards**: Lista de cards ativos na sessão atual, gerenciada pelo ChatContext

## Requirements

### Requirement 1: Layout com Três Colunas

**User Story:** As a user, I want to see a three-column layout with the executions sidebar on the right, so that I can have a persistent view of all my executions while chatting.

#### Acceptance Criteria

1. THE Main_Layout SHALL display three columns: Left_Sidebar, Main_Area, and Executions_Sidebar
2. THE Executions_Sidebar SHALL be positioned on the right side of the Main_Area
3. THE Executions_Sidebar SHALL have the same width as the Left_Sidebar (w-72 / 288px)
4. THE Executions_Sidebar SHALL maintain consistent visual styling with the Left_Sidebar (borders, backgrounds, transitions)

### Requirement 2: Exibição de Executions

**User Story:** As a user, I want to see all active cards in the executions sidebar, so that I can track all operations generated during my chat session.

#### Acceptance Criteria

1. WHEN a new card is added to the chat, THE Executions_Sidebar SHALL display the same card
2. THE Executions_Sidebar SHALL display all Active_Cards from the current session
3. THE Executions_Sidebar SHALL update in real-time when cards are added, archived, or removed
4. WHEN no cards exist, THE Executions_Sidebar SHALL display an empty state message

### Requirement 3: Header do Sidebar

**User Story:** As a user, I want to see a clear header identifying the executions sidebar, so that I understand its purpose.

#### Acceptance Criteria

1. THE Executions_Sidebar SHALL display a header with title "Executions"
2. THE header SHALL include a visual indicator (icon) representing executions
3. THE header SHALL display a counter showing the number of active executions
4. THE header SHALL follow the same styling pattern as the Left_Sidebar header

### Requirement 4: Renderização de Cards

**User Story:** As a user, I want to see execution cards in a compact format in the sidebar, so that I can quickly identify each execution.

#### Acceptance Criteria

1. THE Executions_Sidebar SHALL render each card using a compact card component
2. WHEN displaying a card, THE component SHALL show the card type icon
3. WHEN displaying a card, THE component SHALL show a title derived from the card payload
4. WHEN displaying a card, THE component SHALL show the card type label
5. THE cards SHALL be displayed in a scrollable list when exceeding viewport height

### Requirement 5: Interações com Cards

**User Story:** As a user, I want to interact with execution cards in the sidebar, so that I can manage my executions.

#### Acceptance Criteria

1. WHEN hovering over a card, THE Executions_Sidebar SHALL display action buttons
2. THE user SHALL be able to favorite a card from the Executions_Sidebar
3. THE user SHALL be able to archive a card from the Executions_Sidebar
4. WHEN a card is archived, THE Executions_Sidebar SHALL remove it from the active list
5. WHEN a card is favorited, THE card SHALL appear in both Executions_Sidebar and Left_Sidebar favorites

### Requirement 6: Suporte a Temas

**User Story:** As a user, I want the executions sidebar to respect my theme preference, so that it matches the rest of the interface.

#### Acceptance Criteria

1. THE Executions_Sidebar SHALL support dark theme styling
2. THE Executions_Sidebar SHALL support light theme styling
3. WHEN the theme changes, THE Executions_Sidebar SHALL update its appearance immediately
4. THE theme styling SHALL be consistent with the Left_Sidebar theme implementation

### Requirement 7: Responsividade e Overflow

**User Story:** As a user, I want the executions sidebar to handle many cards gracefully, so that I can scroll through all my executions.

#### Acceptance Criteria

1. WHEN cards exceed the viewport height, THE Executions_Sidebar SHALL enable vertical scrolling
2. THE scrollbar SHALL use the custom-scrollbar styling consistent with other scrollable areas
3. THE header SHALL remain fixed while the card list scrolls
4. THE Executions_Sidebar SHALL maintain its width regardless of content

