-- Migration 021: place-level Google rating for the homepage reviews block
-- (TZ #10 §1).
--
-- google_reviews caches individual reviews, but Places API (New) returns at
-- most 5 of them — so counting cached rows understates the clinic's real
-- review count. The place-level `rating` / `userRatingCount` fields carry the
-- true totals, and they belong in their own single-row table rather than being
-- re-derived from the review cache.
--
-- maps_uri is the "Переглянути всі відгуки" destination (Google's own profile).
CREATE TABLE IF NOT EXISTS google_place_stats (
  id                INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  rating            NUMERIC(2, 1),
  user_rating_count INT,
  maps_uri          TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO google_place_stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
