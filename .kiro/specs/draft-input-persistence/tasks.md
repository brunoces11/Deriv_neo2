# Implementation Plan: Draft Input Persistence

## Overview

This implementation extends the existing ViewModeContext to persist chat input draft state. The approach is minimal and non-invasive, adding a `draftInput` field to the existing localStorage mechanism and updating ChatInput_NEO to use context state instead of local state for the persisted fields.

## Tasks

- [x] 1. Extend ViewModeContext with draft input state
  - [x] 1.1 Add DraftInput interface and DEFAULT_DRAFT_INPUT constant
    - Define interface with plainText, selectedAgents, selectedProducts, autoMode
    - Create default state constant with empty values and autoMode true
    - _Requirements: 1.3, 3.3_

  - [x] 1.2 Extend ViewModeState and reducer with draft actions
    - Add draftInput field to ViewModeState interface
    - Add UPDATE_DRAFT_INPUT and CLEAR_DRAFT_INPUT action types
    - Implement reducer cases for both actions
    - _Requirements: 4.5, 4.6_

  - [x] 1.3 Update storage functions for draft persistence
    - Modify saveToStorage to include draftInput
    - Modify loadFromStorage to load draftInput with fallback to defaults
    - Ensure backward compatibility with existing stored data
    - _Requirements: 2.1, 2.3_

  - [x] 1.4 Add context value functions and expose draftInput
    - Create updateDraftInput callback with useCallback
    - Create clearDraftInput callback with useCallback
    - Add draftInput and both functions to context value
    - _Requirements: 4.5, 4.6_

  - [ ]* 1.5 Write property test for persistence round-trip
    - **Property 2: Persistence Round-Trip**
    - **Validates: Requirements 2.1, 2.2**

- [x] 2. Update ChatInput_NEO to use context draft state
  - [x] 2.1 Replace local state with context draft state
    - Import useViewMode hook
    - Remove useState for plainText, selectedAgents, selectedProducts, autoMode
    - Read initial values from context draftInput
    - Use local state only for UI-specific state (dropdowns, cursor position)
    - _Requirements: 2.2, 4.1, 4.2, 4.3, 4.4_

  - [x] 2.2 Update input handlers to sync with context
    - Modify handleInput to call updateDraftInput with plainText changes
    - Modify toggleAgent to call updateDraftInput with selectedAgents changes
    - Modify toggleProduct to call updateDraftInput with selectedProducts changes
    - Modify autoMode toggle to call updateDraftInput with autoMode changes
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.3 Update handleSubmit to clear draft on submission
    - Call clearDraftInput after successful message submission
    - Ensure editor innerHTML is cleared
    - Ensure chatTags are cleared (existing behavior)
    - _Requirements: 3.1, 3.2_

  - [ ]* 2.4 Write property test for clear resets to defaults
    - **Property 4: Clear Resets to Defaults**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 3. Implement editor synchronization on draft restore
  - [x] 3.1 Add useEffect to sync editor with restored draft
    - Watch for draftInput.plainText changes from context
    - Convert plainText to HTML with textToHTML function
    - Update editor innerHTML when draft is restored (not during typing)
    - Apply correct tag colors based on current theme
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Handle selectedAgents restoration in header
    - Ensure selectedAgents from context displays in header area
    - No additional code needed if reading from context (automatic)
    - _Requirements: 5.3_

  - [ ]* 3.3 Write property test for editor synchronization
    - **Property 6: Editor Synchronization on Restore**
    - **Validates: Requirements 5.1, 5.2**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integration testing and edge cases
  - [x] 5.1 Test mode switch preservation manually
    - Type text in chat mode, switch to graph mode, switch back
    - Verify text, agents, products, autoMode are preserved
    - _Requirements: 1.1, 1.2_

  - [ ]* 5.2 Write property test for mode switch round-trip
    - **Property 1: Mode Switch Round-Trip**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 5.3 Write property test for partial updates
    - **Property 5: Partial Updates Propagate**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation reuses the existing 500ms debounce mechanism
- No new localStorage keys are created - extends existing 'deriv-neo-view-mode'
- Backward compatibility is maintained for existing stored data
