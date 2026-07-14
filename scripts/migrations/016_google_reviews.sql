-- Migration 016: cache table for Google reviews (Business Profile API or Places
-- API). Populated server-side by a refresh job; pages read from here, never the
-- API directly. service_id reserved for future manual per-service tagging.
CREATE TABLE IF NOT EXISTS google_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL CHECK (source IN ('gbp', 'places')),
  external_id   TEXT NOT NULL UNIQUE,
  author_name   TEXT NOT NULL DEFAULT '',
  author_photo  TEXT,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT NOT NULL DEFAULT '',
  reply_text    TEXT,
  review_time   TIMESTAMPTZ,
  service_id    UUID REFERENCES services(id) ON DELETE SET NULL,
  hidden        BOOLEAN NOT NULL DEFAULT false,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS google_reviews_visible_idx
  ON google_reviews (hidden, review_time DESC);
