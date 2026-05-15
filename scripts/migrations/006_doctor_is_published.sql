-- Migration 006: Add is_published flag to doctors
-- Default true so all existing doctors remain visible
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
