ALTER TABLE chat_sessions
  ADD COLUMN IF NOT EXISTS urgency       text DEFAULT 'browsing',
  ADD COLUMN IF NOT EXISTS topics        text[],
  ADD COLUMN IF NOT EXISTS operator_note text;
