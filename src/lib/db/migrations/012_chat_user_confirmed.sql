ALTER TABLE chat_sessions
  ADD COLUMN IF NOT EXISTS user_confirmed_at TIMESTAMPTZ;
