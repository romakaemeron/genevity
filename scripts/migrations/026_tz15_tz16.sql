-- Migration 026 — Технічне завдання №15 + №16.
--
-- ТЗ #15
--   §1  doctors.publications  — "Наукові публікації / Наукова діяльність" block
--                               on the doctor profile. Ordered JSONB array of
--                               { title_uk/ru/en, source_uk/ru/en, role, year, url }.
--       (§2 reviews-block position and §3 rating-next-to-the-name are pure
--        template changes — no schema involved.)
--
-- ТЗ #16
--   §1.1 / §2.1  before_after_cases — "До / Після" proof cases. One table serves
--                both surfaces: `owner_key = 'homepage'` for the homepage slider
--                and `owner_key = 'service:<service uuid>'` for a service page,
--                so the editor, the query and the public component are shared.
--   §1.2        promotions        — "Акції / Спеціальні пропозиції" cards.
--   §1.3        homepage_cta      — final call-to-action banner above the footer.
--   §2.2        section_type 'alternatives' — "Порівняння з альтернативами"
--                content block, orderable per service like every other section.

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS publications JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── ТЗ #16 §1.1 / §2.1 — before / after cases ───────────────────────────────
CREATE TABLE IF NOT EXISTS before_after_cases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'homepage' | 'service:<uuid>'
  owner_key     TEXT NOT NULL,
  before_url    TEXT NOT NULL DEFAULT '',
  after_url     TEXT NOT NULL DEFAULT '',
  -- Caption: what the case is, which zone was corrected, how many sessions.
  title_uk      TEXT NOT NULL DEFAULT '',
  title_ru      TEXT NOT NULL DEFAULT '',
  title_en      TEXT NOT NULL DEFAULT '',
  zone_uk       TEXT NOT NULL DEFAULT '',
  zone_ru       TEXT NOT NULL DEFAULT '',
  zone_en       TEXT NOT NULL DEFAULT '',
  sessions_uk   TEXT NOT NULL DEFAULT '',
  sessions_ru   TEXT NOT NULL DEFAULT '',
  sessions_en   TEXT NOT NULL DEFAULT '',
  note_uk       TEXT NOT NULL DEFAULT '',
  note_ru       TEXT NOT NULL DEFAULT '',
  note_en       TEXT NOT NULL DEFAULT '',
  alt_uk        TEXT NOT NULL DEFAULT '',
  alt_ru        TEXT NOT NULL DEFAULT '',
  alt_en        TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS before_after_cases_owner_idx
  ON before_after_cases (owner_key, sort_order);

-- ── ТЗ #16 §1.2 — promotions / special offers ───────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Short corner badge: "-20%", "Подарунок", "Сезонна пропозиція".
  badge_uk        TEXT NOT NULL DEFAULT '',
  badge_ru        TEXT NOT NULL DEFAULT '',
  badge_en        TEXT NOT NULL DEFAULT '',
  title_uk        TEXT NOT NULL DEFAULT '',
  title_ru        TEXT NOT NULL DEFAULT '',
  title_en        TEXT NOT NULL DEFAULT '',
  description_uk  TEXT NOT NULL DEFAULT '',
  description_ru  TEXT NOT NULL DEFAULT '',
  description_en  TEXT NOT NULL DEFAULT '',
  -- Fine print ("умови акції").
  terms_uk        TEXT NOT NULL DEFAULT '',
  terms_ru        TEXT NOT NULL DEFAULT '',
  terms_en        TEXT NOT NULL DEFAULT '',
  image_url       TEXT,
  image_focal_point TEXT NOT NULL DEFAULT '50% 50%',
  -- Optional internal link (e.g. "/services/apparatus-cosmetology/emsculpt-neo").
  -- Blank = the card's button opens the booking modal instead.
  cta_href        TEXT NOT NULL DEFAULT '',
  cta_label_uk    TEXT NOT NULL DEFAULT '',
  cta_label_ru    TEXT NOT NULL DEFAULT '',
  cta_label_en    TEXT NOT NULL DEFAULT '',
  valid_until     DATE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promotions_published_idx
  ON promotions (is_published, sort_order);

-- ── ТЗ #16 §1.3 — homepage final CTA banner ─────────────────────────────────
CREATE TABLE IF NOT EXISTS homepage_cta (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  is_enabled      BOOLEAN NOT NULL DEFAULT true,
  eyebrow_uk      TEXT NOT NULL DEFAULT '',
  eyebrow_ru      TEXT NOT NULL DEFAULT '',
  eyebrow_en      TEXT NOT NULL DEFAULT '',
  heading_uk      TEXT NOT NULL DEFAULT '',
  heading_ru      TEXT NOT NULL DEFAULT '',
  heading_en      TEXT NOT NULL DEFAULT '',
  subtitle_uk     TEXT NOT NULL DEFAULT '',
  subtitle_ru     TEXT NOT NULL DEFAULT '',
  subtitle_en     TEXT NOT NULL DEFAULT '',
  -- Bullet list of what the visitor gets by booking now.
  benefits_uk     TEXT[] NOT NULL DEFAULT '{}',
  benefits_ru     TEXT[] NOT NULL DEFAULT '{}',
  benefits_en     TEXT[] NOT NULL DEFAULT '{}',
  note_uk         TEXT NOT NULL DEFAULT '',
  note_ru         TEXT NOT NULL DEFAULT '',
  note_en         TEXT NOT NULL DEFAULT '',
  bg_image        TEXT,
  bg_focal_point  TEXT NOT NULL DEFAULT '50% 50%',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT homepage_cta_singleton CHECK (id = 1)
);

INSERT INTO homepage_cta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── ТЗ #16 §2.2 — "Порівняння з альтернативами" section ─────────────────────
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'alternatives';
