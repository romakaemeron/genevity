-- Blog slugs address a public URL (/blog/<slug>) and must be unique.
-- Table is small (tens of rows), so a plain (non-CONCURRENTLY) index is fine.
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_key ON blog_posts (slug);
