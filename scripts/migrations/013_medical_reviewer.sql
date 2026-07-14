-- Migration 013: Medical reviewer + last-reviewed date on services & blog posts.
-- Nullable so existing rows stay valid; FK clears the reference if a doctor is
-- deleted. Powers the "Перевірено лікарем" badge and reviewedBy/lastReviewed JSON-LD.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS reviewer_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_reviewed_at DATE;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS reviewer_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_reviewed_at DATE;
