-- Friends loyalty cards (Google Wallet). cms_users.id is UUID and cms_users.role
-- is free TEXT with no CHECK constraint, so 'frontdesk' needs no schema change.
-- Run: npx tsx scripts/run-migration-027.ts
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  add_token        TEXT NOT NULL UNIQUE,
  verify_token     TEXT NOT NULL UNIQUE,
  holder_name      TEXT NOT NULL,
  tier             SMALLINT NOT NULL CHECK (tier IN (10, 15)),
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  issued_by        UUID,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_by       UUID,
  revoked_at       TIMESTAMPTZ,
  google_object_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_issued_at ON loyalty_cards (issued_at DESC);
