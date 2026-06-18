-- Migration 008: Add requisites field to about table (company bank/legal details)
ALTER TABLE about
  ADD COLUMN IF NOT EXISTS requisites TEXT;
