-- Apple Wallet pass updates (PassKit web service). Additive only.
-- apple_auth_token: per-card secret baked into pass.json as authenticationToken;
-- the volatile default is evaluated per row, so existing cards each get their own.
-- pass_updated_at: bumped whenever a card's pass content should be re-fetched.
-- Run: npx tsx scripts/run-migration-029.ts
ALTER TABLE loyalty_cards
  ADD COLUMN IF NOT EXISTS apple_auth_token TEXT NOT NULL
    DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
ALTER TABLE loyalty_cards
  ADD COLUMN IF NOT EXISTS pass_updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS loyalty_apple_registrations (
  device_id  TEXT NOT NULL,
  card_id    UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, card_id)
);
CREATE INDEX IF NOT EXISTS idx_loyalty_apple_registrations_card ON loyalty_apple_registrations (card_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_apple_registrations_push ON loyalty_apple_registrations (push_token);
