-- Migration 014: Add 'sources' to section_type enum.
-- Powers the new section.sources ("Джерела") content block — a titled list of
-- external reference links with nofollow, used for E-E-A-T source citations.
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'sources';
