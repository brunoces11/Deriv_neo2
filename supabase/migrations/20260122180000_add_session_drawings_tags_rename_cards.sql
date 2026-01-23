/*
  # Rename chat_cards to chat_executions and add chat_drawings/chat_tags

  1. Changes
    - Rename `chat_cards` to `chat_executions`
    - Add `portfolio-table` to type constraint
    - Create `chat_drawings` table for chart drawings per session
    - Create `chat_tags` table for drawing snapshots (self-contained tags)

  2. New Tables
    - `chat_drawings`
      - `id` (uuid, primary key)
      - `session_id` (uuid, FK → chat_sessions)
      - `type` (text: 'trendline', 'horizontal', 'rectangle')
      - `points` (jsonb) - array of {time, price} coordinates
      - `color` (text)
      - `created_at` (timestamptz)

    - `chat_tags`
      - `id` (uuid, primary key)
      - `session_id` (uuid, FK → chat_sessions)
      - `label` (text) - display label like "TrendLine-1"
      - `drawing_type` (text: 'trendline', 'horizontal', 'rectangle')
      - `drawing_snapshot` (jsonb) - complete drawing data (points, color, etc)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on new tables
    - Allow all operations (will be restricted with auth later)
*/

-- Rename chat_cards to chat_executions
ALTER TABLE IF EXISTS chat_cards RENAME TO chat_executions;

-- Update the type constraint to include portfolio-table
ALTER TABLE chat_executions DROP CONSTRAINT IF EXISTS chat_cards_type_check;
ALTER TABLE chat_executions ADD CONSTRAINT chat_executions_type_check 
  CHECK (type IN ('intent-summary', 'action-ticket', 'bot', 'portfolio-snapshot', 'portfolio-table'));

-- Rename indexes
ALTER INDEX IF EXISTS idx_chat_cards_session_id RENAME TO idx_chat_executions_session_id;

-- Rename policy
DROP POLICY IF EXISTS "Allow all operations on chat_cards" ON chat_executions;
CREATE POLICY "Allow all operations on chat_executions"
  ON chat_executions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create chat_drawings table
CREATE TABLE IF NOT EXISTS chat_drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('trendline', 'horizontal', 'rectangle')),
  points jsonb NOT NULL DEFAULT '[]',
  color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

-- Create chat_tags table
CREATE TABLE IF NOT EXISTS chat_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  label text NOT NULL,
  drawing_type text NOT NULL CHECK (drawing_type IN ('trendline', 'horizontal', 'rectangle')),
  drawing_snapshot jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_drawings_session_id ON chat_drawings(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_tags_session_id ON chat_tags(session_id);

-- Enable Row Level Security
ALTER TABLE chat_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_tags ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, will be restricted with auth later)
CREATE POLICY "Allow all operations on chat_drawings"
  ON chat_drawings
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on chat_tags"
  ON chat_tags
  FOR ALL
  USING (true)
  WITH CHECK (true);
