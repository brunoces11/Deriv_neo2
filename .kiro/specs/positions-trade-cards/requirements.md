# Requirements Document

## Introduction

This document specifies the requirements for two new dynamic card components in the Deriv Neo trading simulator: the Positions Card and the Trade Card. These cards will be displayed on-demand via AI chat interactions, following the existing card architecture patterns. All data is simulated (dummy data) as this is a prototype demonstrating AI-first trading interfaces.

## Glossary

- **Card_System**: The modular UI component system that renders dynamic cards based on AI responses
- **Positions_Card**: A card component displaying active trading positions with contract details
- **Trade_Card**: A card component for executing trades, pre-filled by AI during chat interactions
- **Digital_Contract**: A simulated trading contract on a specific asset with defined parameters (stake, payout, duration)
- **CardWrapper**: The base wrapper component providing consistent styling and actions (favorite, archive) for all cards
- **BaseCard**: The TypeScript interface defining the common structure for all card types
- **Payload**: The card-specific data structure containing the information to be displayed

## Requirements

### Requirement 1: Positions Card Display

**User Story:** As a trader, I want to see my active trading positions in a card format, so that I can monitor my open contracts at a glance.

#### Acceptance Criteria

1. WHEN the AI returns a positions-card UI event, THE Card_System SHALL render a Positions_Card component
2. THE Positions_Card SHALL display the asset symbol and name for each position
3. THE Positions_Card SHALL display the contract type (e.g., Higher/Lower, Rise/Fall)
4. THE Positions_Card SHALL display the stake amount with currency
5. THE Positions_Card SHALL display the potential payout amount
6. THE Positions_Card SHALL display the remaining time until contract expiry
7. THE Positions_Card SHALL display the current status of each position (open, won, lost)
8. WHEN a position status is "won", THE Positions_Card SHALL display a green visual indicator
9. WHEN a position status is "lost", THE Positions_Card SHALL display a red visual indicator
10. THE Positions_Card SHALL use the CardWrapper component for consistent styling and actions

### Requirement 2: Trade Card Structure

**User Story:** As a trader, I want to see a trade card pre-filled by the AI, so that I can quickly review and execute trades suggested during our conversation.

#### Acceptance Criteria

1. WHEN the AI returns a trade-card UI event, THE Card_System SHALL render a Trade_Card component
2. THE Trade_Card SHALL display a header with the selected trade type and icon
3. THE Trade_Card SHALL include a "Learn about this trade type" link in the header area
4. THE Trade_Card SHALL display the selected asset information
5. THE Trade_Card SHALL use the CardWrapper component for consistent styling and actions

### Requirement 3: Trade Card Duration Section

**User Story:** As a trader, I want to configure the duration of my trade, so that I can control when my contract expires.

#### Acceptance Criteria

1. THE Trade_Card SHALL display a Duration section with toggle between "Duration" and "End time" modes
2. WHEN in Duration mode, THE Trade_Card SHALL display a unit selector (Days, Hours, Minutes, Ticks)
3. WHEN in Duration mode, THE Trade_Card SHALL display a numeric input for the duration value
4. THE Trade_Card SHALL display the valid range for the selected duration unit
5. THE Trade_Card SHALL display the calculated expiry date and time

### Requirement 4: Trade Card Barrier Section

**User Story:** As a trader, I want to set a barrier/target price for my trade, so that I can define the price level for my contract.

#### Acceptance Criteria

1. THE Trade_Card SHALL display a Barrier section with a numeric input
2. THE Trade_Card SHALL display the current spot price as reference
3. THE Trade_Card SHALL allow input of barrier values relative to spot price

### Requirement 5: Trade Card Stake Section

**User Story:** As a trader, I want to configure my stake amount, so that I can control my risk and potential return.

#### Acceptance Criteria

1. THE Trade_Card SHALL display a Stake section with toggle between "Stake" and "Payout" modes
2. THE Trade_Card SHALL display increment/decrement buttons for the stake value
3. THE Trade_Card SHALL display the currency (USD) alongside the stake input
4. THE Trade_Card SHALL display the calculated payout when in Stake mode
5. THE Trade_Card SHALL display the required stake when in Payout mode

### Requirement 6: Trade Card Action Buttons

**User Story:** As a trader, I want clear action buttons to execute my trade, so that I can quickly place Higher or Lower contracts.

#### Acceptance Criteria

1. THE Trade_Card SHALL display a "Higher" action button with teal/green color (#00d0a0)
2. THE Trade_Card SHALL display a "Lower" action button with red color (#ff444f)
3. WHEN displaying action buttons, THE Trade_Card SHALL show the potential payout amount on each button
4. WHEN displaying action buttons, THE Trade_Card SHALL show the payout percentage on each button
5. WHEN a user clicks an action button, THE Trade_Card SHALL trigger a simulated trade execution

### Requirement 7: Type System Integration

**User Story:** As a developer, I want the new cards to integrate with the existing type system, so that the codebase remains consistent and type-safe.

#### Acceptance Criteria

1. THE Card_System SHALL include 'positions-card' in the CardType union type
2. THE Card_System SHALL include 'trade-card' in the CardType union type
3. THE Card_System SHALL define a PositionsCardPayload interface with position data structure
4. THE Card_System SHALL define a TradeCardPayload interface with trade configuration structure
5. THE Card_System SHALL export the new payload types from the types module

### Requirement 8: CardsPage Integration

**User Story:** As a developer, I want the new cards displayed on the CardsPage, so that all card types can be previewed and documented.

#### Acceptance Criteria

1. WHEN viewing the CardsPage, THE Card_System SHALL display a preview of the Positions_Card with mock data
2. WHEN viewing the CardsPage, THE Card_System SHALL display a preview of the Trade_Card with mock data
3. THE CardsPage SHALL include documentation of the logic implemented in each new card
4. THE CardsPage SHALL follow the existing card section format with icon, description, and logic details
