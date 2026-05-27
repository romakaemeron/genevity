CREATE TABLE IF NOT EXISTS chat_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token     text UNIQUE NOT NULL,
  locale            text NOT NULL DEFAULT 'uk',
  started_at        timestamptz NOT NULL DEFAULT now(),
  escalated_at      timestamptz,
  escalation_by     text,
  escalation_target text,
  summary           text,
  patient_name      text,
  patient_phone     text,
  patient_interest  text,
  page_url          text,
  page_title        text
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        text NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_id_created_at
  ON chat_messages(session_id, created_at);
