-- Migration 022: bind patient reviews to a specific service (TZ #10 §4).
--
-- Reviews already carry a free-text `procedure_tag`; that's fine for display
-- but too loose to drive "show the reviews for THIS service page". A real FK
-- lets admins pick the service explicitly and lets the service page query it
-- directly. NULL = review isn't tied to any single service (doctor-level only).
ALTER TABLE doctor_reviews
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS doctor_reviews_service_idx
  ON doctor_reviews (service_id, is_published, reviewed_at DESC);
