# Requirements Document

## Introduction

This feature adds persistence for the chat input draft state, ensuring that users don't lose their in-progress message when switching between view modes (chat ↔ graph) or when refreshing the page. The draft is stored locally using the existing ViewModeContext localStorage mechanism and is cleared upon message submission.

## Glossary

- **Draft_Input**: The current state of the chat input field including text content and all selected options
- **ViewModeContext**: The existing React context that manages view mode state and localStorage persistence
- **Chat_Input**: The ChatInput_NEO component that handles user message composition
- **Auto_Mode**: A toggle that determines whether the AI concierge automatically selects agents
- **Selected_Agents**: Array of agent names the user has explicitly selected to invoke
- **Selected_Products**: Array of market/product tags the user has selected

## Requirements

### Requirement 1: Draft State Persistence Across Mode Switches

**User Story:** As a user, I want my chat input draft to be preserved when switching between chat and graph modes, so that I don't lose my in-progress message.

#### Acceptance Criteria

1. WHEN a user switches from chat mode to graph mode, THE ViewModeContext SHALL preserve the draft input state
2. WHEN a user switches from graph mode to chat mode, THE Chat_Input SHALL restore the previously saved draft state
3. THE Draft_Input SHALL include: plainText content, selectedAgents array, selectedProducts array, and autoMode boolean

### Requirement 2: Draft State Persistence Across Page Refreshes

**User Story:** As a user, I want my chat input draft to survive page refreshes, so that I can continue composing my message after an accidental refresh.

#### Acceptance Criteria

1. WHEN the page is refreshed, THE ViewModeContext SHALL load the draft input state from localStorage
2. WHEN the Chat_Input component mounts, THE Chat_Input SHALL initialize its state from the persisted draft
3. THE ViewModeContext SHALL use the existing localStorage key 'deriv-neo-view-mode' for draft persistence
4. THE ViewModeContext SHALL use the existing 500ms debounce mechanism when saving draft changes

### Requirement 3: Draft Clearing on Message Submission

**User Story:** As a user, I want my draft to be cleared when I submit a message, so that I start fresh for my next message.

#### Acceptance Criteria

1. WHEN a user submits a message, THE Chat_Input SHALL clear the draft from ViewModeContext
2. WHEN the draft is cleared, THE ViewModeContext SHALL persist the empty draft state to localStorage
3. THE Draft_Input cleared state SHALL reset plainText to empty string, selectedAgents to empty array, selectedProducts to empty array, and autoMode to true

### Requirement 4: Draft Update Mechanism

**User Story:** As a user, I want my draft to be saved automatically as I type, so that I don't need to manually save my progress.

#### Acceptance Criteria

1. WHEN the user modifies the plainText content, THE Chat_Input SHALL update the draft in ViewModeContext
2. WHEN the user toggles autoMode, THE Chat_Input SHALL update the draft in ViewModeContext
3. WHEN the user selects or deselects an agent, THE Chat_Input SHALL update the draft in ViewModeContext
4. WHEN the user selects or deselects a product/market, THE Chat_Input SHALL update the draft in ViewModeContext
5. THE ViewModeContext SHALL provide an updateDraftInput function for partial updates
6. THE ViewModeContext SHALL provide a clearDraftInput function for resetting the draft

### Requirement 5: Editor Synchronization

**User Story:** As a user, I want the visual editor to reflect the restored draft state, so that I can see my previous input correctly rendered.

#### Acceptance Criteria

1. WHEN draft state is restored, THE Chat_Input SHALL synchronize the contenteditable editor with the plainText value
2. WHEN draft state is restored, THE Chat_Input SHALL render any product tags as styled inline elements
3. WHEN draft state is restored, THE Chat_Input SHALL display selected agents in the header area
