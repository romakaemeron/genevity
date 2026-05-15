-- Migration 007: Add SEO fields to legal_docs
ALTER TABLE legal_docs
  ADD COLUMN IF NOT EXISTS seo_title_uk TEXT,
  ADD COLUMN IF NOT EXISTS seo_title_ru TEXT,
  ADD COLUMN IF NOT EXISTS seo_title_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_desc_uk  TEXT,
  ADD COLUMN IF NOT EXISTS seo_desc_ru  TEXT,
  ADD COLUMN IF NOT EXISTS seo_desc_en  TEXT;
