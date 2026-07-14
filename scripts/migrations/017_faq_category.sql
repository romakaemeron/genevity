-- Migration 017: optional category key on faq_items, used to group the
-- dedicated /faq page (owner_type='faq_page') into sections. Nullable so all
-- existing per-owner FAQ rows are unaffected.
ALTER TABLE faq_items ADD COLUMN IF NOT EXISTS category TEXT;
