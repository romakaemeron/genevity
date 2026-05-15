-- ============================================================
-- GENEVITY CMS — Phase 2: Structured content tables
-- ============================================================

-- === HERO SLIDES (homepage) ===
CREATE TABLE IF NOT EXISTS hero_slides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url       TEXT NOT NULL,
  object_position TEXT NOT NULL DEFAULT 'center center',
  alt_uk          TEXT,
  alt_ru          TEXT,
  alt_en          TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(sort_order);

-- === GALLERY ITEMS (polymorphic: owner_type/owner_key — string slug like 'stationary', 'about') ===
CREATE TABLE IF NOT EXISTS gallery_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_key    TEXT NOT NULL,            -- 'stationary' | 'laboratory' | 'about' | 'homepage' | etc.
  image_url    TEXT NOT NULL,
  alt_uk       TEXT,
  alt_ru       TEXT,
  alt_en       TEXT,
  label_uk     TEXT,
  label_ru     TEXT,
  label_en     TEXT,
  sublabel_uk  TEXT,
  sublabel_ru  TEXT,
  sublabel_en  TEXT,
  description_uk TEXT,
  description_ru TEXT,
  description_en TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_owner ON gallery_items(owner_key, sort_order);

-- === PRICE CATEGORIES + ITEMS ===
CREATE TABLE IF NOT EXISTS price_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT UNIQUE NOT NULL,
  label_uk   TEXT NOT NULL,
  label_ru   TEXT,
  label_en   TEXT,
  link       TEXT,                -- optional link to a services page
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES price_categories(id) ON DELETE CASCADE,
  name_uk      TEXT NOT NULL,
  name_ru      TEXT,
  name_en      TEXT,
  price        TEXT NOT NULL,            -- stored as text e.g. '4 500' to support ranges like 'від 20 000'
  currency     TEXT NOT NULL DEFAULT '₴',
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_price_items_category ON price_items(category_id, sort_order);

-- === LABORATORY PAGE: services / prep steps / checkups ===
CREATE TABLE IF NOT EXISTS lab_services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_key     TEXT NOT NULL,          -- lucide icon name: 'Scan', 'TestTube', etc.
  label_uk     TEXT NOT NULL,
  label_ru     TEXT,
  label_en     TEXT,
  items_uk     TEXT[] NOT NULL DEFAULT '{}',
  items_ru     TEXT[] NOT NULL DEFAULT '{}',
  items_en     TEXT[] NOT NULL DEFAULT '{}',
  price_uk     TEXT,
  price_ru     TEXT,
  price_en     TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_prep_steps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_key     TEXT NOT NULL,
  label_uk     TEXT NOT NULL,
  label_ru     TEXT,
  label_en     TEXT,
  desc_uk      TEXT,
  desc_ru      TEXT,
  desc_en      TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_checkups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_uk     TEXT NOT NULL,
  label_ru     TEXT,
  label_en     TEXT,
  price_uk     TEXT,
  price_ru     TEXT,
  price_en     TEXT,
  desc_uk      TEXT,
  desc_ru      TEXT,
  desc_en      TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === Updated-at triggers ===
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
      AND table_name IN ('hero_slides', 'gallery_items', 'price_categories', 'price_items', 'lab_services', 'lab_prep_steps', 'lab_checkups')
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I',
      t, t
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;
