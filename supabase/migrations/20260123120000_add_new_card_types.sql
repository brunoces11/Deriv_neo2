/*
  # Add new card types to chat_executions

  1. Changes
    - Update type constraint to include new portfolio card variants:
      - 'portfolio-sidebar'
      - 'portfolio-table-expanded'
      - 'portfolio-table-complete'

  2. Reason
    - Langflow integration returns these new card types
    - Frontend already supports rendering these cards
*/

-- Drop the existing constraint
ALTER TABLE chat_executions DROP CONSTRAINT IF EXISTS chat_executions_type_check;

-- Add updated constraint with all card types
ALTER TABLE chat_executions ADD CONSTRAINT chat_executions_type_check 
  CHECK (type IN (
    'intent-summary', 
    'action-ticket', 
    'bot', 
    'portfolio-snapshot', 
    'portfolio-table',
    'portfolio-sidebar',
    'portfolio-table-expanded',
    'portfolio-table-complete'
  ));
