/*
  # Create Chat Sessions Schema

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key) - Unique identifier for the chat session
      - `title` (text) - Title of the chat (first characters of user's first message)
      - `created_at` (timestamptz) - When the session was created
      - `updated_at` (timestamptz) - Last time the session was updated
      - `is_favorite` (boolean) - Whether the session is marked as favorite
      - `is_archived` (boolean) - Whether the session is archived
      - `user_id` (uuid, nullable) - For future auth integration
    
    - `chat_messages`
      - `id` (uuid, primary key) - Unique identifier for the message
      - `session_id` (uuid, foreign key) - Reference to chat_sessions
      - `role` (text) - 'user' or 'assistant'
      - `content` (text) - Message content
      - `created_at` (timestamptz) - When the message was sent
    
    - `chat_cards`
      - `id` (uuid, primary key) - Unique identifier for the card
      - `session_id` (uuid, foreign key) - Reference to chat_sessions
      - `type` (text) - Card type (intent-summary, action-ticket, bot, portfolio-snapshot)
      - `status` (text) - Card status (active, archived, hidden)
      - `is_favorite` (boolean) - Whether the card is favorited
      - `payload` (jsonb) - Card data
      - `created_at` (timestamptz) - When the card was created

  2. Security
    - Enable RLS on all tables
    - For now, allow all operations (will be restricted when auth is added)
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_favorite boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  user_id uuid
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chat_cards table
CREATE TABLE IF NOT EXISTS chat_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('intent-summary', 'action-ticket', 'bot', 'portfolio-snapshot')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
  is_favorite boolean DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_cards_session_id ON chat_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_favorite ON chat_sessions(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_archived ON chat_sessions(is_archived) WHERE is_archived = true;

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_cards ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, will be restricted with auth later)
CREATE POLICY "Allow all operations on chat_sessions"
  ON chat_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on chat_messages"
  ON chat_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on chat_cards"
  ON chat_cards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on chat_sessions
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
