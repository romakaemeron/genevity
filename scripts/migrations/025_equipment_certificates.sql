-- Migration 025: certificates for apparatus (equipment).
--
-- Mirrors `doctors.certificate_images`: an ordered JSONB array of scan pages,
-- each `{ url, type, alt_uk, alt_ru, alt_en, doc_uk, doc_ru, doc_en, issuer, number, valid_until }`.
-- Attaching to `equipment` (not to `services`) means every service page that
-- links the device through `service_equipment` shows its certificates and
-- stays in sync with a single upload.
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS certificates JSONB NOT NULL DEFAULT '[]'::jsonb;
