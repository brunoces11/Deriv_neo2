# Implementation Plan: Hub Mode

## Overview

This implementation plan adds a new "Hub" mode to the Deriv NEO trading simulator's main navigation. The Hub provides a centralized view of all trading platforms and MT5 account types following the Trader's Hub design pattern.

## Tasks

- [ ] 1. Extend ViewModeContext to support Hub mode
  - [x] 1.1 Update ViewMode type to include 'hub'
    - Add 'hub' to the ViewMode type union in `src/store/ViewModeContext.tsx`
    - _Requirements: 1.1_
  
  - [x] 1.2 Add Hub configuration to START_POINTS
    - Add hub entry with sidebarCollapsed: true, cardsSidebarCollapsed: false, cardsSidebarWidth: 690, chartVisible: false
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 1.3 Update userPoints initial state and storage functions
    - Add hub key to userPoints object in initial state
    - Update loadFromStorage and saveToStorage to handle hub mode
    - Update RESET_ALL_UI_SETTINGS action to include hub
    - _Requirements: 1.4, 1.5_
  
  - [x] 1.4 Update toggleMode to cycle through 4 modes
    - Update modes array to include 'hub' in the cycle order
    - _Requirements: 2.4_

- [ ] 2. Update ModeToggle component for 4 modes
  - [x] 2.1 Add Hub button to modes array
    - Import Home icon from lucide-react
    - Add { key: 'hub', icon: Home, label: 'Hub' } to modes array
    - _Requirements: 2.1, 2.3_
  
  - [x] 2.2 Update slider position calculation
    - Update sliderPosition to handle 4 positions (0%, 25%, 50%, 75%)
    - _Requirements: 2.5_
  
  - [x] 2.3 Update button and slider widths
    - Change button width from 33.33% to 25%
    - Change slider width from calc(33.33% - 4px) to calc(25% - 4px)
    - _Requirements: 2.2_

- [x] 3. Checkpoint - Verify mode switching works
  - Ensure mode toggle displays 4 buttons correctly
  - Ensure Ctrl+Shift+M cycles through all 4 modes
  - Ensure hub mode persists to localStorage

- [ ] 4. Update MainArea and App components
  - [x] 4.1 Add isHubMode prop to MainArea
    - Add isHubMode boolean prop to MainAreaProps interface
    - Add conditional rendering for HubView component
    - _Requirements: 3.1_
  
  - [x] 4.2 Pass isHubMode from App to MainArea
    - Add isHubMode={currentMode === 'hub'} prop in MainLayout
    - _Requirements: 3.1_
  
  - [x] 4.3 Update CardsSidebar isGraphMode prop
    - Update to include hub mode: isGraphMode={currentMode === 'graph' || currentMode === 'dashboard' || currentMode === 'hub'}
    - _Requirements: 8.1, 8.2_

- [ ] 5. Create HubView component
  - [x] 5.1 Create base HubView component structure
    - Create `src/components/layout/HubView.tsx`
    - Implement scrollable container with theme support
    - Add header with "Trader's Hub" title
    - _Requirements: 3.2, 3.4, 3.5_
  
  - [x] 5.2 Create PlatformCard sub-component
    - Implement card with icon, name, description, and Open button
    - Add icon color mapping (DT=red, DB=green, ST=gray, GO=blue)
    - Add hover states
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 9.1, 9.2, 9.4_
  
  - [x] 5.3 Create AccountCard sub-component
    - Implement card with MT5 icon, name, description, and Get button
    - Add support for "NEW" badge
    - Add hover states
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 9.3, 9.4_
  
  - [x] 5.4 Implement OptionsSection
    - Add section description text
    - Add "Learn more" link
    - Render 4 PlatformCards with PLATFORMS data
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.5 Implement CFDsSection
    - Add "CFDs" title with "Compare accounts" link
    - Add section description text
    - Add "Learn more" link
    - Add Deriv Nakala copy trading item with arrow
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 5.6 Implement MT5Section
    - Render 6 AccountCards in grid layout with MT5_ACCOUNTS data
    - _Requirements: 6.1_

- [x] 6. Checkpoint - Verify HubView renders correctly
  - Ensure HubView displays when hub mode is active
  - Ensure all 3 sections render with correct content
  - Ensure dark/light theme switching works

- [ ] 7. Implement interactive elements
  - [x] 7.1 Add toast notification for button clicks
    - Implement handleOpenPlatform function with toast feedback
    - Implement handleGetAccount function with toast feedback
    - _Requirements: 7.1, 7.2_
  
  - [x] 7.2 Add placeholder link handlers
    - Implement handleLearnMore with no-op or console log
    - Implement handleCompareAccounts with no-op or console log
    - _Requirements: 7.4, 7.5_

- [x] 8. Final checkpoint - Complete integration testing
  - Ensure all tests pass, ask the user if questions arise
  - Verify mode switching: chat → graph → dash → hub → chat
  - Verify sidebar behavior matches graph/dashboard modes
  - Verify theme support in all components

## Notes

- The implementation follows the existing DashboardView pattern for consistency
- All actions (Open, Get) are simulated with toast notifications
- Links are placeholder implementations (no actual navigation)
- Sidebar configuration matches graph mode for left sidebar and dashboard mode for right sidebar width
