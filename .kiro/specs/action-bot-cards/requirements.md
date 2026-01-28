# Requirements Document

## Introduction

This document specifies the requirements for three new card components in the Deriv Neo trading simulator: ActionsCard, BotCardCreator, and BotCardSimple. These cards extend the existing dynamic card system that appears in the chat interface and sidebar, following the AI-first paradigm where the interface adapts based on user conversations with the Concierge agent.

## Glossary

- **Card**: A dynamic UI module that displays information and actions, rendered inline in chat or persisted in the sidebar
- **CardWrapper**: The base wrapper component that provides consistent styling, favorite/archive functionality for all cards
- **BaseCard**: The TypeScript interface defining the common structure for all card types
- **CardType**: Union type defining all valid card type identifiers
- **Action**: A user-configured automated task that can be executed, edited, scheduled, or deleted
- **Bot**: An automated trading strategy that runs based on configured triggers, conditions, and actions
- **BotCardCreator**: A visual card showing a bot configuration as a flowchart/mind-map before deployment
- **Payload**: The card-specific data structure containing the information to display

## Requirements

### Requirement 1: Actions Card Component

**User Story:** As a user, I want to view and manage my configured actions through a card interface, so that I can quickly execute, edit, delete, or schedule actions from the chat or sidebar.

#### Acceptance Criteria

1. THE ActionsCard SHALL display the action name as the primary title
2. THE ActionsCard SHALL display the action description below the title
3. THE ActionsCard SHALL display the action status with appropriate visual indicator
4. THE ActionsCard SHALL display the last execution timestamp
5. THE ActionsCard SHALL render four action buttons aligned horizontally on the right side:
   - Execute button with play icon
   - Edit button with pencil icon
   - Delete button with trash icon
   - Schedule button with calendar/clock icon
6. WHEN a user clicks any action button, THEN THE ActionsCard SHALL log the action to console (simulated execution)
7. THE ActionsCard SHALL use neutral gray tones for all action buttons
8. THE ActionsCard SHALL integrate with CardWrapper for consistent styling and favorite/archive functionality
9. THE ActionsCard SHALL support both dark and light themes via useTheme hook

### Requirement 2: Bot Card Creator Component

**User Story:** As a user, I want to see a visual representation of my bot configuration as a flowchart before deploying it, so that I can understand and verify the bot logic the AI mapped from our conversation.

#### Acceptance Criteria

1. THE BotCardCreator SHALL display a header with bot icon and "NEW BOT CONFIGURATION" label
2. THE BotCardCreator SHALL display the bot name/strategy as a subtitle
3. THE BotCardCreator SHALL render configuration boxes representing:
   - Trigger box (e.g., "Weekly", "Daily", "Price Alert")
   - Action box (e.g., "Buy BTC", "Sell ETH")
   - Target box (e.g., "$100", "0.5 BTC")
   - Condition box (e.g., "Price < 50k", "RSI > 70")
4. THE BotCardCreator SHALL connect boxes with visual lines simulating a flowchart
5. THE BotCardCreator SHALL use distinct colors for each box type:
   - Trigger: cyan/teal color
   - Action: green color
   - Target: amber/yellow color
   - Condition: amber/orange color
6. THE BotCardCreator SHALL render three action buttons at the bottom:
   - Deploy Bot button (green/brand color)
   - Edit Config button (neutral)
   - Cancel button (neutral)
7. WHEN a user clicks any action button, THEN THE BotCardCreator SHALL log the action to console (simulated execution)
8. THE BotCardCreator SHALL integrate with CardWrapper for consistent styling
9. THE BotCardCreator SHALL support both dark and light themes via useTheme hook

### Requirement 3: Bot Card Simple Component

**User Story:** As a user, I want to view and manage my active bots through a simple card interface, so that I can quickly control bot execution, edit settings, delete bots, or schedule operations.

#### Acceptance Criteria

1. THE BotCardSimple SHALL display the bot name as the primary title
2. THE BotCardSimple SHALL display the bot strategy description
3. THE BotCardSimple SHALL display the bot status with visual indicator (active/paused/stopped)
4. THE BotCardSimple SHALL display the bot performance metric when available
5. THE BotCardSimple SHALL render four action buttons aligned horizontally on the right side:
   - Execute/Pause toggle button with play/pause icon based on current status
   - Edit button with pencil icon
   - Delete button with trash icon
   - Schedule button with calendar icon
6. WHEN a user clicks any action button, THEN THE BotCardSimple SHALL log the action to console (simulated execution)
7. THE BotCardSimple SHALL use neutral gray tones for all action buttons
8. THE BotCardSimple SHALL integrate with CardWrapper for consistent styling and favorite/archive functionality
9. THE BotCardSimple SHALL support both dark and light themes via useTheme hook

### Requirement 4: Type System Integration

**User Story:** As a developer, I want the new cards to be properly typed and integrated with the existing type system, so that the cards work seamlessly with the ChatContext and UI event system.

#### Acceptance Criteria

1. THE CardType union in types/index.ts SHALL include 'actions-card', 'bot-creator', and 'bot-simple' types
2. THE types/index.ts SHALL export ActionsCardPayload interface with: name, description, status, lastExecution fields
3. THE types/index.ts SHALL export BotCreatorPayload interface with: botName, trigger, action, target, condition fields
4. THE types/index.ts SHALL export BotSimplePayload interface with: botId, name, strategy, status, performance fields
5. THE CardPayload union type SHALL include the three new payload types

### Requirement 5: CardsPage Integration

**User Story:** As a developer, I want the new cards to appear in the CardsPage blueprint, so that all cards can be previewed and documented in one place.

#### Acceptance Criteria

1. THE CardsPage SHALL import and display ActionsCard with mock data
2. THE CardsPage SHALL import and display BotCardCreator with mock data
3. THE CardsPage SHALL import and display BotCardSimple with mock data
4. THE CardsPage SHALL include card descriptions and logic details for each new card
5. THE cardsInfo array SHALL include entries for all three new card types
