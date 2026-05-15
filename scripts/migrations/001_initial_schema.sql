-- ============================================================
-- GENEVITY CMS — Initial Schema
-- Neon Postgres 17
-- ============================================================

-- === ENUMS ===
CREATE TYPE equipment_category AS ENUM ('face', 'body', 'skin', 'intimate', 'laser');
CREATE TYPE section_type AS ENUM (
  'richText', 'bullets', 'steps', 'compareTable',
  'indicationsContraindications', 'priceTeaser', 'callout',
  'imageGallery', 'relatedDoctors', 'cta'
);
CREATE TYPE form_status AS ENUM ('new', 'read', 'processed', 'archived');

-- === SERVICE CATEGORIES ===
CREATE TABLE service_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title_uk      TEXT NOT NULL,
  title_ru      TEXT,
  title_en      TEXT,
  summary_uk    TEXT,
  summary_ru    TEXT,
  summary_en    TEXT,
  hero_image    TEXT,
  parent_id     UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  clickable     BOOLEAN NOT NULL DEFAULT true,
  icon_key      TEXT,
  seo_title_uk  TEXT,
  seo_title_ru  TEXT,
  seo_title_en  TEXT,
  seo_desc_uk   TEXT,
  seo_desc_ru   TEXT,
  seo_desc_en   TEXT,
  seo_og_image  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === SERVICES ===
CREATE TABLE services (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT NOT NULL,
  category_id             UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  title_uk                TEXT NOT NULL,
  title_ru                TEXT,
  title_en                TEXT,
  h1_uk                   TEXT,
  h1_ru                   TEXT,
  h1_en                   TEXT,
  summary_uk              TEXT,
  summary_ru              TEXT,
  summary_en              TEXT,
  hero_image              TEXT,
  procedure_length_uk     TEXT,
  procedure_length_ru     TEXT,
  procedure_length_en     TEXT,
  effect_duration_uk      TEXT,
  effect_duration_ru      TEXT,
  effect_duration_en      TEXT,
  sessions_recommended_uk TEXT,
  sessions_recommended_ru TEXT,
  sessions_recommended_en TEXT,
  price_from_uk           TEXT,
  price_from_ru           TEXT,
  price_from_en           TEXT,
  price_unit_uk           TEXT,
  price_unit_ru           TEXT,
  price_unit_en           TEXT,
  seo_title_uk            TEXT,
  seo_title_ru            TEXT,
  seo_title_en            TEXT,
  seo_desc_uk             TEXT,
  seo_desc_ru             TEXT,
  seo_desc_en             TEXT,
  seo_og_image            TEXT,
  seo_noindex             BOOLEAN NOT NULL DEFAULT false,
  sort_order              INT NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug, category_id)
);

-- === DOCTORS ===
CREATE TABLE doctors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE,
  name_uk         TEXT NOT NULL,
  name_ru         TEXT,
  name_en         TEXT,
  role_uk         TEXT,
  role_ru         TEXT,
  role_en         TEXT,
  experience_uk   TEXT,
  experience_ru   TEXT,
  experience_en   TEXT,
  specialties_uk  TEXT[],
  specialties_ru  TEXT[],
  specialties_en  TEXT[],
  photo_card      TEXT,
  photo_full      TEXT,
  card_position   TEXT DEFAULT 'center center',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === EQUIPMENT ===
CREATE TABLE equipment (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  category              equipment_category NOT NULL,
  short_description_uk  TEXT,
  short_description_ru  TEXT,
  short_description_en  TEXT,
  description_uk        TEXT,
  description_ru        TEXT,
  description_en        TEXT,
  suits_uk              TEXT[],
  suits_ru              TEXT[],
  suits_en              TEXT[],
  results_uk            TEXT[],
  results_ru            TEXT[],
  results_en            TEXT[],
  note_uk               TEXT,
  note_ru               TEXT,
  note_en               TEXT,
  photo                 TEXT,
  sort_order            INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === STATIC PAGES ===
CREATE TABLE static_pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title_uk      TEXT NOT NULL,
  title_ru      TEXT,
  title_en      TEXT,
  h1_uk         TEXT,
  h1_ru         TEXT,
  h1_en         TEXT,
  summary_uk    TEXT,
  summary_ru    TEXT,
  summary_en    TEXT,
  seo_title_uk  TEXT,
  seo_title_ru  TEXT,
  seo_title_en  TEXT,
  seo_desc_uk   TEXT,
  seo_desc_ru   TEXT,
  seo_desc_en   TEXT,
  seo_og_image  TEXT,
  seo_noindex   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === LEGAL DOCS ===
CREATE TABLE legal_docs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title_uk        TEXT NOT NULL,
  title_ru        TEXT,
  title_en        TEXT,
  short_label_uk  TEXT,
  short_label_ru  TEXT,
  short_label_en  TEXT,
  body_uk         TEXT,
  body_ru         TEXT,
  body_en         TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === CONTENT SECTIONS (polymorphic — used by services, categories, static pages) ===
CREATE TABLE content_sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type      TEXT NOT NULL,   -- 'service' | 'category' | 'static_page'
  owner_id        UUID NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  section_type    section_type NOT NULL,
  data            JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sections_owner ON content_sections(owner_type, owner_id, sort_order);

-- === FAQ ITEMS ===
CREATE TABLE faq_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type    TEXT NOT NULL,   -- 'service' | 'category' | 'static_page'
  owner_id      UUID NOT NULL,
  question_uk   TEXT NOT NULL,
  question_ru   TEXT,
  question_en   TEXT,
  answer_uk     TEXT NOT NULL,
  answer_ru     TEXT,
  answer_en     TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_faq_owner ON faq_items(owner_type, owner_id, sort_order);

-- === JUNCTION TABLES ===
CREATE TABLE service_doctors (
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  sort_order  INT NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, doctor_id)
);

CREATE TABLE service_related (
  service_id          UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  related_service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  sort_order          INT NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, related_service_id)
);

CREATE TABLE service_equipment (
  service_id    UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  equipment_id  UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, equipment_id)
);

-- === SINGLETONS ===

-- Homepage hero
CREATE TABLE hero (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title_uk    TEXT,
  title_ru    TEXT,
  title_en    TEXT,
  subtitle_uk TEXT,
  subtitle_ru TEXT,
  subtitle_en TEXT,
  cta_uk      TEXT,
  cta_ru      TEXT,
  cta_en      TEXT,
  location_uk TEXT,
  location_ru TEXT,
  location_en TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Homepage about section
CREATE TABLE about (
  id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title_uk        TEXT,
  title_ru        TEXT,
  title_en        TEXT,
  text1_uk        TEXT,
  text1_ru        TEXT,
  text1_en        TEXT,
  text2_uk        TEXT,
  text2_ru        TEXT,
  text2_en        TEXT,
  diagnostics_uk  TEXT,
  diagnostics_ru  TEXT,
  diagnostics_en  TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site-wide settings
CREATE TABLE site_settings (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone1      TEXT,
  phone2      TEXT,
  address_uk  TEXT,
  address_ru  TEXT,
  address_en  TEXT,
  instagram   TEXT,
  hours_uk    TEXT,
  hours_ru    TEXT,
  hours_en    TEXT,
  maps_url    TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UI strings (big JSONB blob mirroring current structure)
CREATE TABLE ui_strings (
  id         INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Navigation
CREATE TABLE navigation (
  id            INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cta_label_uk  TEXT,
  cta_label_ru  TEXT,
  cta_label_en  TEXT,
  cta_href      TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nav_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_uk        TEXT NOT NULL,
  label_ru        TEXT,
  label_en        TEXT,
  href            TEXT,
  is_mega_menu    BOOLEAN NOT NULL DEFAULT false,
  category_id     UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  sort_order      INT NOT NULL DEFAULT 0
);

-- === FORM SUBMISSIONS ===
CREATE TABLE form_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type     TEXT NOT NULL DEFAULT 'consultation',
  name          TEXT,
  phone         TEXT,
  email         TEXT,
  message       TEXT,
  direction     TEXT,
  preferred_time TEXT,
  page_url      TEXT,
  service_id    UUID REFERENCES services(id) ON DELETE SET NULL,
  status        form_status NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at       TIMESTAMPTZ,
  processed_at  TIMESTAMPTZ
);
CREATE INDEX idx_submissions_status ON form_submissions(status, created_at DESC);

-- === MEDIA LIBRARY ===
CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url         TEXT NOT NULL,
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INT,
  width       INT,
  height      INT,
  alt_text    TEXT,
  folder      TEXT NOT NULL DEFAULT 'general',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_folder ON media(folder, created_at DESC);

-- === CMS USERS ===
CREATE TABLE cms_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor',
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === BLOG (v2) ===
CREATE TABLE blog_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title_uk      TEXT NOT NULL,
  title_ru      TEXT,
  title_en      TEXT,
  description_uk TEXT,
  description_ru TEXT,
  description_en TEXT,
  seo_title_uk  TEXT,
  seo_title_ru  TEXT,
  seo_title_en  TEXT,
  seo_desc_uk   TEXT,
  seo_desc_ru   TEXT,
  seo_desc_en   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  category_id     UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id       UUID REFERENCES doctors(id) ON DELETE SET NULL,
  title_uk        TEXT NOT NULL,
  title_ru        TEXT,
  title_en        TEXT,
  excerpt_uk      TEXT,
  excerpt_ru      TEXT,
  excerpt_en      TEXT,
  cover_image     TEXT,
  tags            TEXT[],
  published_at    TIMESTAMPTZ,
  is_draft        BOOLEAN NOT NULL DEFAULT true,
  seo_title_uk    TEXT,
  seo_title_ru    TEXT,
  seo_title_en    TEXT,
  seo_desc_uk     TEXT,
  seo_desc_ru     TEXT,
  seo_desc_en     TEXT,
  seo_og_image    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blog_published ON blog_posts(is_draft, published_at DESC);

-- Blog posts use content_sections with owner_type = 'blog_post'

-- === UPDATED_AT TRIGGER ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;
