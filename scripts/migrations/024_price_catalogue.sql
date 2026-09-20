-- Migration 024: full price catalogue.
-- Adds a subcategory level between price_categories and price_items, plus the
-- per-item metadata carried by the clinic's spreadsheet (duration, RoApp
-- service id, notes) and the visibility/provenance flags the importer needs.

CREATE TABLE IF NOT EXISTS price_subcategories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES price_categories(id) ON DELETE CASCADE,
  slug        text NOT NULL,
  label_uk    text NOT NULL,
  label_ru    text,
  label_en    text,
  is_visible  boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS price_subcategories_category_idx
  ON price_subcategories (category_id, sort_order);

ALTER TABLE price_items
  ADD COLUMN IF NOT EXISTS subcategory_id   uuid REFERENCES price_subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duration         text,
  ADD COLUMN IF NOT EXISTS roapp_service_id text,
  ADD COLUMN IF NOT EXISTS note_uk          text,
  ADD COLUMN IF NOT EXISTS note_ru          text,
  ADD COLUMN IF NOT EXISTS note_en          text,
  ADD COLUMN IF NOT EXISTS price_numeric    integer,
  ADD COLUMN IF NOT EXISTS is_visible       boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS source           text NOT NULL DEFAULT 'manual';

ALTER TABLE price_categories
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS price_items_subcategory_idx
  ON price_items (subcategory_id, sort_order);

-- Matching key for re-imports. Not unique: the sheet reuses a blank id for
-- some rows, so the diff falls back to (category, subcategory, name).
CREATE INDEX IF NOT EXISTS price_items_roapp_idx
  ON price_items (roapp_service_id);
