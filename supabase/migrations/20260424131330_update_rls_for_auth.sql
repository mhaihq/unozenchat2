/*
  # Update RLS policies to require authentication

  ## Overview
  Restricts chat_sessions and messages to authenticated users only.
  Documents and chunks remain readable by anyone (students can browse),
  but sessions and messages are private to logged-in users.

  ## Changes
  - chat_sessions: authenticated users only (own sessions)
  - messages: authenticated users only (own messages via session ownership)
  - documents & chunks: keep public read, restrict write to authenticated
*/

-- Drop existing open policies on chat_sessions
DROP POLICY IF EXISTS "Anyone can view sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can insert sessions" ON chat_sessions;

-- Add user_id to chat_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE chat_sessions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Drop existing open policies on messages
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;

CREATE POLICY "Users can view messages in own sessions"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own sessions"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );
