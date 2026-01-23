# Requirements Document

## Introduction

Este documento define os requisitos para implementação do sistema de **Dual View Mode** no Deriv Neo Simulator. O sistema permitirá alternar entre dois modos de visualização principais (Chat Mode e Graph Mode), cada um com parâmetros específicos de UI, preservando ajustes finos feitos pelo usuário em cada modo.

## Glossary

- **View_Mode_System**: Sistema central que gerencia os modos de visualização e seus estados
- **Chat_Mode**: Modo de visualização padrão focado na interação conversacional com IA
- **Graph_Mode**: Modo de visualização focado no gráfico de trading com componentes otimizados
- **Start_Point**: Configuração inicial/padrão de um modo de visualização
- **User_Point**: Ajustes personalizados feitos pelo usuário sobre o Start_Point
- **Mode_State**: Estado completo de um modo incluindo Start_Point e User_Point
- **Component_Config**: Configuração de parâmetros de um componente específico para um modo
- **Layout_Manager**: Gerenciador de layout que aplica configurações de modo aos componentes
- **Chat_Components**: Conjunto de componentes de interação do chat (ChatInput, ChatMessages, WelcomeScreen)
- **Display_Mode**: Modo de exibição de um componente ('center' para MainArea, 'sidebar' para ExecutionsSidebar)

## Requirements

### Requirement 1: Sistema Central de Modos

**User Story:** As a user, I want to switch between Chat Mode and Graph Mode, so that I can optimize my interface for different trading workflows.

#### Acceptance Criteria

1. THE View_Mode_System SHALL support exactly two modes: 'chat' and 'graph'
2. WHEN the application loads, THE View_Mode_System SHALL initialize with Chat_Mode as default
3. THE View_Mode_System SHALL persist the current mode selection in localStorage
4. WHEN a mode is selected, THE View_Mode_System SHALL apply all Component_Configs for that mode

### Requirement 2: Preservação de Estado por Modo

**User Story:** As a user, I want my customizations to be preserved when switching modes, so that I don't lose my preferred settings.

#### Acceptance Criteria

1. THE View_Mode_System SHALL maintain separate User_Point states for each mode
2. WHEN the user modifies a component parameter, THE View_Mode_System SHALL update the User_Point for the current mode only
3. WHEN switching from Mode A to Mode B, THE View_Mode_System SHALL preserve Mode A's User_Point intact
4. WHEN returning to a previously used mode, THE View_Mode_System SHALL restore that mode's User_Point
5. THE View_Mode_System SHALL persist User_Point states in localStorage for session continuity

### Requirement 3: Configuração de Componentes por Modo

**User Story:** As a developer, I want to define different default parameters for each component per mode, so that the UI adapts optimally to each workflow.

#### Acceptance Criteria

1. THE Component_Config SHALL define parameters for: visibility, dimensions, collapsed state, and position
2. WHEN a component lacks explicit config for a mode, THE View_Mode_System SHALL use sensible defaults
3. THE View_Mode_System SHALL support the following configurable components:
   - Sidebar (left): collapsed state only (no custom width)
   - ExecutionsSidebar (right): collapsed state AND custom width (resizable)
   - ChartLayer: visibility only
   - MainArea: background transparency only
4. THE View_Mode_System SHALL NOT override component state during active user interaction (e.g., resize in progress)

### Requirement 4: Chat Mode Configuration

**User Story:** As a user, I want Chat Mode to prioritize the conversation interface, so that I can focus on AI interaction.

#### Acceptance Criteria

1. WHEN Chat_Mode is active, THE Layout_Manager SHALL set Sidebar to expanded (w-72)
2. WHEN Chat_Mode is active, THE Layout_Manager SHALL set ExecutionsSidebar to expanded (w-72)
3. WHEN Chat_Mode is active, THE Layout_Manager SHALL hide ChartLayer
4. WHEN Chat_Mode is active, THE Layout_Manager SHALL set MainArea background to opaque
5. WHEN Chat_Mode is active, THE Layout_Manager SHALL render Chat_Components (ChatInput, WelcomeScreen, ChatMessages) inside MainArea centered
6. WHEN Chat_Mode is active, THE ExecutionsSidebar SHALL display only Executions cards (no chat components)

### Requirement 5: Graph Mode Configuration

**User Story:** As a user, I want Graph Mode to maximize chart visibility while keeping chat accessible in the sidebar, so that I can focus on market analysis without losing conversation context.

#### Acceptance Criteria

1. WHEN Graph_Mode is active, THE Layout_Manager SHALL set Sidebar to collapsed (w-16)
2. WHEN Graph_Mode is active, THE Layout_Manager SHALL set ExecutionsSidebar to expanded with default width of 669px
3. WHEN Graph_Mode is active, THE Layout_Manager SHALL show ChartLayer as full-screen background
4. WHEN Graph_Mode is active, THE Layout_Manager SHALL set MainArea to transparent and empty (no chat components)
5. WHEN Graph_Mode is active, THE ExecutionsSidebar SHALL render Chat_Components in sidebar layout: Executions (top), ChatMessages (middle), ChatInput (bottom)
6. WHEN Graph_Mode is active for the first time in a session, THE ExecutionsSidebar SHALL open with 669px width by default

### Requirement 6: Transição Suave entre Modos

**User Story:** As a user, I want smooth transitions when switching modes, so that the experience feels polished.

#### Acceptance Criteria

1. WHEN switching modes, THE Layout_Manager SHALL animate all component transitions with duration 300ms using CSS transitions
2. WHEN switching modes, THE View_Mode_System SHALL set isTransitioning flag to true for 300ms
3. WHILE isTransitioning is true, THE View_Mode_System SHALL ignore additional mode switch requests
4. WHEN transition completes, THE View_Mode_System SHALL set isTransitioning to false

### Requirement 7: Toggle de Modo na Interface

**User Story:** As a user, I want an accessible toggle to switch modes, so that I can quickly change my workflow.

#### Acceptance Criteria

1. THE View_Mode_System SHALL replace the existing ChartToggle with a ModeToggle button in the MainArea header
2. THE mode toggle SHALL display the current mode visually (icon + label)
3. WHEN the toggle is clicked, THE View_Mode_System SHALL switch to the alternate mode
4. THE mode toggle SHALL be accessible via keyboard shortcut (Ctrl/Cmd + Shift + M)

### Requirement 8: Ajustes Finos do Usuário

**User Story:** As a user, I want to customize component states within each mode, so that I can personalize my experience.

#### Acceptance Criteria

1. WHEN the user manually collapses/expands a sidebar, THE View_Mode_System SHALL record this as User_Point
2. WHEN the user resizes ExecutionsSidebar, THE View_Mode_System SHALL record the width as User_Point
3. THE User_Point SHALL override Start_Point values when present

### Requirement 9: Reset de Modo

**User Story:** As a user, I want to reset a mode to its defaults, so that I can start fresh if needed.

#### Acceptance Criteria

1. THE View_Mode_System SHALL provide a reset option for each mode
2. WHEN reset is triggered, THE View_Mode_System SHALL clear User_Point for that mode
3. WHEN reset is triggered, THE View_Mode_System SHALL apply Start_Point configuration
4. THE reset action SHALL display a browser confirmation dialog before proceeding

### Requirement 10: Chat Components Dual Display Mode

**User Story:** As a user, I want chat components to adapt their display based on the current view mode, so that I can interact with the chat regardless of which mode I'm using.

#### Acceptance Criteria

1. THE ChatInput component SHALL support two display modes: 'center' (for Chat_Mode) and 'sidebar' (for Graph_Mode)
2. WHEN in 'center' mode, THE ChatInput SHALL render with full width, max-w-3xl, centered in MainArea
3. WHEN in 'sidebar' mode, THE ChatInput SHALL render compact, fitting within ExecutionsSidebar width
4. THE ChatMessages component SHALL support two display modes: 'center' (for Chat_Mode) and 'sidebar' (for Graph_Mode)
5. WHEN in 'center' mode, THE ChatMessages SHALL render with full width, max-w-3xl, centered in MainArea
6. WHEN in 'sidebar' mode, THE ChatMessages SHALL render compact with smaller message bubbles fitting sidebar width
7. THE WelcomeScreen component SHALL only render in Chat_Mode (not displayed in Graph_Mode sidebar)
8. WHEN Graph_Mode is active and no messages exist, THE ExecutionsSidebar SHALL show ChatInput without WelcomeScreen

### Requirement 11: ExecutionsSidebar Graph Mode Layout

**User Story:** As a user, I want the ExecutionsSidebar in Graph Mode to contain both executions and chat, so that I can monitor trades and chat simultaneously.

#### Acceptance Criteria

1. WHEN Graph_Mode is active, THE ExecutionsSidebar SHALL use a three-section vertical layout
2. THE top section SHALL display Executions cards with scrollable overflow
3. THE middle section SHALL display ChatMessages with scrollable overflow
4. THE bottom section SHALL display ChatInput fixed at the bottom
5. THE ExecutionsSidebar SHALL use flex layout with appropriate flex-grow for each section
6. WHEN ExecutionsSidebar is resized in Graph_Mode, THE Chat_Components SHALL adapt to the new width

### Requirement 12: Extensibilidade para Novos Modos (Future Enhancement)

**User Story:** As a developer, I want the system to support adding new modes easily, so that we can expand functionality in the future.

#### Acceptance Criteria

1. THE View_Mode_System SHALL use a configuration object pattern for mode definitions
2. THE mode configuration SHALL be defined in a single configuration file
3. (Future) THE View_Mode_System MAY support mode inheritance in future versions
4. (Future) THE View_Mode_System MAY support runtime mode registration in future versions
