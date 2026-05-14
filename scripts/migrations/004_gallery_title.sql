-- Add title columns to gallery_items (SEO: title attribute for images)
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS title_uk TEXT,
  ADD COLUMN IF NOT EXISTS title_ru TEXT,
  ADD COLUMN IF NOT EXISTS title_en TEXT;
