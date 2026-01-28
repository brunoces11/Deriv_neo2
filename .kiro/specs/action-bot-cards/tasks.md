# Implementation Plan: Action and Bot Cards

## Overview

This plan implements three new card components (ActionsCard, BotCardCreator, BotCardSimple) for the Deriv Neo trading simulator, following the existing card architecture with CardWrapper, TypeScript types, and Tailwind styling.

## Tasks

- [x] 1. Extend type system with new card types and payloads
  - Add 'actions-card', 'bot-creator', 'bot-simple' to CardType union
  - Create ActionsCardPayload interface with actionId, name, description, status, lastExecution
  - Create BotCreatorPayload interface with botName, trigger, action, target, condition
  - Create BotSimplePayload interface with botId, name, strategy, status, performance
  - Add new payloads to CardPayload union type
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 2. Implement ActionsCard component
  - [x] 2.1 Create ActionsCard.tsx with CardWrapper integration
    - Import CardWrapper, BaseCard, ActionsCardPayload, useTheme, Lucide icons
    - Implement status configuration (active/inactive/error with colors and icons)
    - Render icon container with Zap icon and amber accent
    - Display action name, description, status badge, last execution timestamp
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8_
  
  - [x] 2.2 Add action buttons row to ActionsCard
    - Create 4 buttons: Execute (Play), Edit (Pencil), Delete (Trash2), Schedule (Calendar)
    - Style buttons with neutral gray tones, theme-aware colors
    - Add onClick handlers with console.log for simulation
    - Align buttons horizontally on the right side
    - _Requirements: 1.5, 1.6, 1.7, 1.9_

- [ ] 3. Implement BotCardCreator component
  - [x] 3.1 Create BotCardCreator.tsx header and structure
    - Import CardWrapper, BaseCard, BotCreatorPayload, useTheme, Lucide icons
    - Render header with Bot icon and "NEW BOT CONFIGURATION" label
    - Display bot name/strategy as subtitle
    - Use cyan accent color for CardWrapper
    - _Requirements: 2.1, 2.2, 2.8_
  
  - [x] 3.2 Implement flowchart visualization
    - Create Trigger box (cyan color) with trigger type and value
    - Create Action box (green color) with action type and asset
    - Create Target box (amber color) with target type and value
    - Create Condition box (orange color) with condition expression
    - Connect boxes with CSS borders/lines simulating flowchart
    - _Requirements: 2.3, 2.4, 2.5_
  
  - [x] 3.3 Add footer buttons to BotCardCreator
    - Create Deploy Bot button (green/brand color)
    - Create Edit Config button (neutral)
    - Create Cancel button (neutral)
    - Add onClick handlers with console.log for simulation
    - _Requirements: 2.6, 2.7, 2.9_

- [ ] 4. Implement BotCardSimple component
  - [x] 4.1 Create BotCardSimple.tsx with CardWrapper integration
    - Import CardWrapper, BaseCard, BotSimplePayload, useTheme, Lucide icons
    - Implement status configuration (active/paused/stopped with colors, icons, dot)
    - Render icon container with Bot icon, status dot, amber accent
    - Display bot name, strategy, status badge, performance metric
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.8_
  
  - [x] 4.2 Add action buttons row to BotCardSimple
    - Create Play/Pause toggle button based on current status
    - Create Edit (Pencil), Delete (Trash2), Schedule (Calendar) buttons
    - Style buttons with neutral gray tones, theme-aware colors
    - Add onClick handlers with console.log for simulation
    - _Requirements: 3.5, 3.6, 3.7, 3.9_

- [x] 5. Checkpoint - Verify components render correctly
  - Ensure all three components compile without TypeScript errors
  - Verify CardWrapper integration works
  - Test theme switching (dark/light)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Integrate cards into CardsPage
  - [x] 6.1 Add mock data for new cards
    - Create mockActionsCard with sample action data
    - Create mockBotCreator with sample bot configuration
    - Create mockBotSimple with sample bot data
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 6.2 Add card entries to cardsInfo array
    - Add ActionsCard entry with name, type, icon, description, logicDetails
    - Add BotCardCreator entry with name, type, icon, description, logicDetails
    - Add BotCardSimple entry with name, type, icon, description, logicDetails
    - Import and render all three new card components
    - _Requirements: 5.4, 5.5_

- [x] 7. Final checkpoint - Ensure all components work
  - Verify all cards display correctly in CardsPage
  - Test all button click handlers (console.log output)
  - Verify dark/light theme support
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All data is simulated (dummy data) - no real trading operations
- Button handlers use console.log for demonstration purposes
- Follow existing card patterns (BotCard, ActionTicketCard) for consistency
- Use Deriv brand colors: red #ff444f, green #00d0a0
