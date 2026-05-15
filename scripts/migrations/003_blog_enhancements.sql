-- Migration 003: blog body columns + custom author + read time
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS body_uk           TEXT,
  ADD COLUMN IF NOT EXISTS body_ru           TEXT,
  ADD COLUMN IF NOT EXISTS body_en           TEXT,
  ADD COLUMN IF NOT EXISTS read_time_minutes INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS author_name       TEXT,
  ADD COLUMN IF NOT EXISTS author_avatar     TEXT;
