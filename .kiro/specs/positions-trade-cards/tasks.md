# Implementation Plan: Positions and Trade Cards

## Overview

This plan implements two new card components (PositionsCard and TradeCard) for the Deriv Neo trading simulator. The implementation follows the existing card architecture patterns, extending the type system and integrating with CardsPage for documentation.

## Tasks

- [x] 1. Extend type system with new card types and payload interfaces
  - Add 'positions-card' and 'trade-card' to CardType union
  - Define Position interface with all required fields
  - Define PositionsCardPayload interface
  - Define TradeCardPayload interface with nested duration, barrier, stake, payout structures
  - Export new types from src/types/index.ts
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Implement PositionsCard component
  - [x] 2.1 Create PositionsCard.tsx with CardWrapper integration
    - Create component file at src/components/cards/PositionsCard.tsx
    - Import CardWrapper, BaseCard, and new payload types
    - Implement card header with icon and title
    - _Requirements: 1.1, 1.10_
  
  - [x] 2.2 Implement position list rendering
    - Map over positions array from payload
    - Display asset symbol and name for each position
    - Display contract type with appropriate formatting
    - Display stake and payout amounts
    - Display time remaining with countdown format
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 2.3 Implement status indicators with color coding
    - Display status badge for each position (open, won, lost)
    - Apply green color classes for 'won' status
    - Apply red color classes for 'lost' status
    - Apply neutral color for 'open' status
    - Display profit amount for completed positions
    - _Requirements: 1.7, 1.8, 1.9_

  - [ ]* 2.4 Write property test for PositionsCard data completeness
    - **Property 1: Positions Card Data Completeness**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**

  - [ ]* 2.5 Write property test for PositionsCard status colors
    - **Property 2: Positions Card Status Color Mapping**
    - **Validates: Requirements 1.8, 1.9**

- [x] 3. Checkpoint - Verify PositionsCard renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement TradeCard component
  - [x] 4.1 Create TradeCard.tsx with header section
    - Create component file at src/components/cards/TradeCard.tsx
    - Import CardWrapper, BaseCard, and new payload types
    - Implement header with trade type icon and selector display
    - Add "Learn about this trade type" link
    - Display asset information
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.2 Implement Duration section
    - Create Duration section with mode toggle (Duration/End time)
    - Display unit selector (Days, Hours, Minutes, Ticks)
    - Display numeric input for duration value
    - Show valid range for selected unit
    - Display calculated expiry date and time
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.3 Implement Barrier section
    - Create Barrier section with numeric input
    - Display current spot price as reference
    - Style input to match Deriv design
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 4.4 Implement Stake section
    - Create Stake section with mode toggle (Stake/Payout)
    - Add increment/decrement buttons
    - Display currency (USD) alongside input
    - Show calculated payout in Stake mode
    - Show required stake in Payout mode
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 4.5 Implement action buttons
    - Create "Higher" button with teal/green color (#00d0a0)
    - Create "Lower" button with red color (#ff444f)
    - Display payout amount on each button
    - Display payout percentage on each button
    - Add click handlers for simulated trade execution
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 4.6 Write property test for TradeCard payload rendering
    - **Property 3: Trade Card Payload Rendering**
    - **Validates: Requirements 2.2, 2.4, 3.4, 3.5, 4.2, 5.3, 6.3, 6.4**

  - [ ]* 4.7 Write property test for TradeCard mode-based rendering
    - **Property 4: Trade Card Mode-Based Rendering**
    - **Validates: Requirements 3.2, 3.3, 5.4, 5.5**

- [x] 5. Checkpoint - Verify TradeCard renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Integrate cards with CardsPage
  - [x] 6.1 Add mock data for new cards
    - Create mockPositionsCard with sample positions data
    - Create mockTradeCard with sample trade configuration
    - Add mock data constants to CardsPage.tsx
    - _Requirements: 8.1, 8.2_
  
  - [x] 6.2 Add card sections to cardsInfo array
    - Add PositionsCard entry with icon, description, and logic details
    - Add TradeCard entry with icon, description, and logic details
    - Import new card components
    - Follow existing card section format
    - _Requirements: 8.3, 8.4_

- [x] 7. Final checkpoint - Ensure all components work together
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All data is simulated/dummy - no real trading functionality
- Deriv colors: red #ff444f, teal/green #00d0a0
- Follow existing card patterns (CardWrapper, theme support, responsive design)
