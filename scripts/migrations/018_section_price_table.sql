-- Migration 018: Add 'priceTable' to section_type enum.
-- Powers the new section.priceTable content block — a compact price list
-- rendered as a table (procedure/zone on the left, price on the right),
-- matching the /prices page. Replaces the bullet-card rendering used for the
-- "Дооптимізація" per-service price sections so they read as a short table.
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'priceTable';
