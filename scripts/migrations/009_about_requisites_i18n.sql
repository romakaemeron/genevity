-- Migration 009: Make about.requisites translatable (uk/ru/en)
-- Adds per-language columns and backfills them from the existing single
-- `requisites` column so current content is preserved across all locales.
-- The legacy `requisites` column is kept (unused) to avoid data loss.
ALTER TABLE about
  ADD COLUMN IF NOT EXISTS requisites_uk TEXT,
  ADD COLUMN IF NOT EXISTS requisites_ru TEXT,
  ADD COLUMN IF NOT EXISTS requisites_en TEXT;

UPDATE about
SET
  requisites_uk = COALESCE(requisites_uk, requisites),
  requisites_ru = COALESCE(requisites_ru, requisites),
  requisites_en = COALESCE(requisites_en, requisites)
WHERE id = 1;
