/*
  # Add note type and text field to chat_drawings

  1. Changes
    - Add 'note' to type constraint in chat_drawings
    - Add 'text' column to chat_drawings for note content
    - Add 'note' to drawing_type constraint in chat_tags

  2. Notes
    - text field is nullable (only used for note type)
    - Existing drawings are unaffected
*/

-- Update chat_drawings type constraint to include 'note'
ALTER TABLE chat_drawings DROP CONSTRAINT IF EXISTS chat_drawings_type_check;
ALTER TABLE chat_drawings ADD CONSTRAINT chat_drawings_type_check 
  CHECK (type IN ('trendline', 'horizontal', 'rectangle', 'note'));

-- Add text column for note content
ALTER TABLE chat_drawings ADD COLUMN IF NOT EXISTS text text;

-- Update chat_tags drawing_type constraint to include 'note'
ALTER TABLE chat_tags DROP CONSTRAINT IF EXISTS chat_tags_drawing_type_check;
ALTER TABLE chat_tags ADD CONSTRAINT chat_tags_drawing_type_check 
  CHECK (drawing_type IN ('trendline', 'horizontal', 'rectangle', 'note'));
