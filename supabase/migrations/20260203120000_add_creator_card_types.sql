/*
  # Add creator and trade card types to chat_executions

  1. Changes
    - Update type constraint to include new card types:
      - 'bot-creator'
      - 'actions-creator'
      - 'create-trade-card'
      - 'trade-card'
      - 'actions-card'
      - 'bot-card'

  2. Reason
    - Placeholder-based card rendering system needs these types
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
    'bot-card',
    'bot-creator',
    'portfolio-snapshot', 
    'portfolio-table',
    'portfolio-sidebar',
    'portfolio-table-expanded',
    'portfolio-table-complete',
    'create-trade-card',
    'trade-card',
    'actions-card',
    'actions-creator'
  ));
