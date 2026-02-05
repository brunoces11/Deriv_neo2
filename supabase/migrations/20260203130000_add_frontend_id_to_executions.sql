/*
  # Add frontend_id column to chat_executions

  This allows us to track the frontend-generated card ID separately from the
  Supabase UUID, enabling proper deletion of cards by their frontend ID.

  1. Changes
    - Add `frontend_id` column (text, nullable) to chat_executions
    - Create index on frontend_id for faster lookups
*/

-- Add frontend_id column
ALTER TABLE chat_executions ADD COLUMN IF NOT EXISTS frontend_id text;

-- Create index for faster lookups by frontend_id
CREATE INDEX IF NOT EXISTS idx_chat_executions_frontend_id ON chat_executions(frontend_id);
