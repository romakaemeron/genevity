-- Migration 015: About-page trust blocks — license photo, medical director,
-- verified-numbers note. Localized text columns follow the _uk/_ru/_en pattern.
ALTER TABLE about
  ADD COLUMN IF NOT EXISTS license_image TEXT,
  ADD COLUMN IF NOT EXISTS director_photo TEXT,
  ADD COLUMN IF NOT EXISTS director_name_uk TEXT,
  ADD COLUMN IF NOT EXISTS director_name_ru TEXT,
  ADD COLUMN IF NOT EXISTS director_name_en TEXT,
  ADD COLUMN IF NOT EXISTS director_role_uk TEXT,
  ADD COLUMN IF NOT EXISTS director_role_ru TEXT,
  ADD COLUMN IF NOT EXISTS director_role_en TEXT,
  ADD COLUMN IF NOT EXISTS stats_note_uk TEXT,
  ADD COLUMN IF NOT EXISTS stats_note_ru TEXT,
  ADD COLUMN IF NOT EXISTS stats_note_en TEXT;
