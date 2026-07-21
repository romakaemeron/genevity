-- ТЗ №4: "ЗМІ про нас" media-mentions page.
CREATE TABLE IF NOT EXISTS media_mentions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url              TEXT NOT NULL,
  publisher_name   TEXT NOT NULL DEFAULT '',
  publisher_domain TEXT NOT NULL DEFAULT '',
  title_uk         TEXT NOT NULL DEFAULT '',
  title_ru         TEXT NOT NULL DEFAULT '',
  title_en         TEXT NOT NULL DEFAULT '',
  image_url        TEXT,
  logo_url         TEXT,
  published_at     DATE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_mentions_pub_idx
  ON media_mentions (is_published, published_at DESC NULLS LAST, sort_order);
