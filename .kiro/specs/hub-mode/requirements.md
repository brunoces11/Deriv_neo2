# Requirements Document

## Introduction

This document specifies the requirements for adding a new "Hub" mode to the main navigation switch of the Deriv NEO trading simulator. The Hub mode will provide a centralized view of all available trading platforms and account types, following the Trader's Hub design pattern. This feature extends the existing 3-mode navigation (Chat | Graph | Dash) to a 4-mode system (Chat | Graph | Dash | Hub).

## Glossary

- **Hub**: A centralized view displaying all available trading platforms and account types in an organized, card-based layout
- **View_Mode**: The current display mode of the application (chat, graph, dashboard, or hub)
- **Mode_Toggle**: The UI component that allows switching between different view modes
- **Platform_Card**: A card component displaying information about a trading platform with an action button
- **Account_Card**: A card component displaying information about an MT5 account type with a "Get" action
- **Options_Section**: The section displaying options and multipliers trading platforms
- **CFDs_Section**: The section displaying CFD-related information and copy trading
- **MT5_Section**: The section displaying Deriv MT5 account types

## Requirements

### Requirement 1: View Mode Extension

**User Story:** As a user, I want to access a Hub mode from the main navigation, so that I can see all available trading platforms and account types in one place.

#### Acceptance Criteria

1. WHEN the application loads, THE View_Mode_Context SHALL support 'hub' as a valid view mode value
2. WHEN the user clicks the Hub button in the Mode_Toggle, THE System SHALL switch to hub mode
3. WHEN hub mode is active, THE Mode_Toggle SHALL visually indicate the Hub button as selected
4. WHEN hub mode is active, THE System SHALL persist the mode selection to local storage
5. WHEN the application reloads with hub mode previously selected, THE System SHALL restore hub mode

### Requirement 2: Mode Toggle UI Update

**User Story:** As a user, I want the mode toggle to display all four modes equally, so that I can easily switch between Chat, Graph, Dash, and Hub.

#### Acceptance Criteria

1. THE Mode_Toggle SHALL display exactly four buttons: Chat, Graph, Dash, and Hub
2. WHEN displaying four modes, THE Mode_Toggle SHALL allocate 25% width to each button
3. THE Hub button SHALL display a Home icon and the label "Hub"
4. WHEN the user presses Ctrl+Shift+M, THE System SHALL cycle through all four modes in order
5. WHEN switching to hub mode, THE slider animation SHALL move to the fourth position (75% offset)

### Requirement 3: Hub View Layout

**User Story:** As a user, I want to see a clean, organized Hub view, so that I can quickly find and access different trading platforms.

#### Acceptance Criteria

1. WHEN hub mode is active, THE Main_Area SHALL render the Hub_View component
2. THE Hub_View SHALL display a header with the title "Trader's Hub"
3. THE Hub_View SHALL display three main sections: Options, CFDs, and Deriv MT5
4. THE Hub_View SHALL support both dark and light themes
5. THE Hub_View SHALL be scrollable when content exceeds viewport height
6. WHEN the viewport is resized, THE Hub_View SHALL maintain responsive layout

### Requirement 4: Options Section

**User Story:** As a user, I want to see all options trading platforms, so that I can choose the right platform for my trading style.

#### Acceptance Criteria

1. THE Options_Section SHALL display a description: "Predict the market, profit if you're right, risk only what you put in."
2. THE Options_Section SHALL display a "Learn more" link
3. THE Options_Section SHALL display four platform cards: Deriv Trader, Deriv Bot, SmartTrader, and Deriv GO
4. WHEN displaying Deriv Trader card, THE System SHALL show icon "DT", name, description "The options and multipliers trading platform", and an "Open" button
5. WHEN displaying Deriv Bot card, THE System SHALL show icon "DB", name, description "The ultimate bot trading platform", and an "Open" button
6. WHEN displaying SmartTrader card, THE System SHALL show icon "ST", name, description "The legacy options trading platform", and an "Open" button
7. WHEN displaying Deriv GO card, THE System SHALL show icon "GO", name, description "The mobile app for trading multipliers and accumulators", and an "Open" button

### Requirement 5: CFDs Section

**User Story:** As a user, I want to see CFD trading information, so that I can understand and access CFD trading options.

#### Acceptance Criteria

1. THE CFDs_Section SHALL display the title "CFDs" with a "Compare accounts" link
2. THE CFDs_Section SHALL display a description: "Trade bigger positions with less capital on a wide range of global markets."
3. THE CFDs_Section SHALL display a "Learn more" link
4. THE CFDs_Section SHALL display a Deriv Nakala copy trading item with navigation arrow

### Requirement 6: Deriv MT5 Section

**User Story:** As a user, I want to see all MT5 account types, so that I can choose the right account for my trading needs.

#### Acceptance Criteria

1. THE MT5_Section SHALL display six account type cards in a grid layout
2. WHEN displaying Standard account card, THE System SHALL show MT5 icon, "Standard" label, description "CFDs on derived and financial instruments", and a "Get" button
3. WHEN displaying Financial account card, THE System SHALL show MT5 icon, "Financial" label, description "CFDs on financial instruments", and a "Get" button
4. WHEN displaying Financial STP card, THE System SHALL show MT5 icon, "Financial STP" label, description "Direct access to market prices", and a "Get" button
5. WHEN displaying Swap-Free account card, THE System SHALL show MT5 icon, "Swap-Free" label, description "Swap-free CFDs on selected financial and derived instruments", and a "Get" button
6. WHEN displaying Zero Spread card, THE System SHALL show MT5 icon, "Zero Spread" label, description "Zero spread CFDs on financial and derived instruments", and a "Get" button
7. WHEN displaying Gold account card, THE System SHALL show MT5 icon, "Gold" label with "NEW" badge, description "Trading opportunities on popular precious metals", and a "Get" button

### Requirement 7: Interactive Elements

**User Story:** As a user, I want to interact with Hub elements, so that I can take actions on platforms and accounts.

#### Acceptance Criteria

1. WHEN the user clicks an "Open" button on a platform card, THE System SHALL display a simulated action feedback (toast notification)
2. WHEN the user clicks a "Get" button on an account card, THE System SHALL display a simulated action feedback (toast notification)
3. WHEN the user hovers over a card, THE System SHALL display a hover state with subtle visual feedback
4. WHEN the user clicks "Learn more" links, THE System SHALL handle the click without navigation (placeholder behavior)
5. WHEN the user clicks "Compare accounts" link, THE System SHALL handle the click without navigation (placeholder behavior)

### Requirement 8: Sidebar Behavior

**User Story:** As a user, I want the sidebars to behave consistently with other full-screen modes, so that I have maximum space for the Hub content.

#### Acceptance Criteria

1. WHEN hub mode is active, THE left sidebar SHALL start collapsed by default (same as graph mode)
2. WHEN hub mode is active, THE right sidebar (cards sidebar) SHALL use the same default width as graph and dashboard modes (690px)
3. WHEN hub mode is active, THE right sidebar SHALL start expanded by default
4. THE Hub mode sidebar configuration SHALL be stored in START_POINTS with identical values to graph mode for sidebarCollapsed
5. THE Hub mode sidebar configuration SHALL be stored in START_POINTS with identical values to dashboard mode for cardsSidebarWidth

### Requirement 9: Visual Design

**User Story:** As a user, I want the Hub to have consistent visual design, so that it feels integrated with the rest of the application.

#### Acceptance Criteria

1. THE Platform_Card icons SHALL use distinct colors: DT=red (#ff444f), DB=green, ST=gray, GO=blue
2. THE "Open" buttons SHALL use the Deriv red color (#ff444f)
3. THE "Get" buttons SHALL use a coral/pink color variant
4. THE cards SHALL have rounded corners consistent with the application design system
5. WHEN in dark theme, THE Hub_View SHALL use zinc-based background colors
6. WHEN in light theme, THE Hub_View SHALL use gray-based background colors
