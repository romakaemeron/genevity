# E-E-A-T Implementation — Design Spec

**Date:** 2026-07-13
**Branch:** `develop` (never `main` without explicit per-merge confirmation)
**Source:** `docs/genevity.com.ua _ Аналіз функціонала _ E-E-A-T фактори - genevity.com.ua .csv`

## Goal

Close the trust / E-E-A-T gaps from the functional audit that are marked **not done** (`Не розпочато`) or **in progress** (`В процесі`) — while respecting that the codebase is already substantially further along than the audit implies.

## Context: current state (verified against code)

Already implemented (do **not** rebuild):
- **Doctor E-E-A-T**: bio, education, certifications, certificate images, user reviews with `AggregateRating`, JSON-LD `Physician` + `ProfilePage`. (`src/components/doctors/`, `src/lib/db/queries/doctors.ts`, `doctors/[slug]/page.tsx`)
- **Structured data**: `MedicalOrganization`, `WebSite`, `MedicalProcedure`, `FAQPage`, `Breadcrumb`, `ImageObject`. (`src/components/seo/`)
- **Service pages**: reorderable section blocks incl. `IndicationsContraindications`, price, FAQ, related doctors/services/equipment, galleries. (`ServiceData` in `src/lib/db/types.ts:294`, `SectionRenderer.tsx`)
- **Legal**: privacy policy, license, **public offer, clinic certificates page, quality/guarantees policy** — all in admin CMS (`legal_docs` table, dynamic route `legal/[slug]/page.tsx`). *These audit rows (10, 13, 39) are therefore complete and out of scope.*
- **i18n**: DB-driven via `ui_strings` JSONB table (NOT `messages/*.json`). New UI strings are added to that table (admin `settings` editor or seed), resolved by `getMessagesForLocale()`.

Architecture facts that constrain this work:
- **DB**: Neon Postgres, raw SQL + Drizzle. Schema lives in `scripts/migrations/00X_*.sql` (no `schema.ts`). Query layer: `src/lib/db/queries/`.
- **Admin**: custom CMS under `src/app/(admin)/admin/` (has `services`, `doctors`, `equipment`, `pages`, `blog`, `reviews`, `legal`, `media`, `settings`, …).
- **Content i18n**: per-field `_uk/_ru/_en` columns; locale `ua`→`uk` mapping in each query file.

## Out of scope — deferred (awaiting content, per client decision)

Tracked but NOT built in this effort until materials arrive:
- **ЗМІ про нас** (row 11) — awaiting «Символ» publication (Anastasia).
- **Партнери** (row 15) — awaiting partner logos/list.
- **Відео про послугу** (row 32) — awaiting video content.
- **Doctor scientific articles / external medical registries** (residual of rows 25, 37) — Anastasia collecting from doctors.

Reputation signals (row 4): the *external* media/profile-building part is marketing, not dev. The dev-buildable part = the reviews hub, covered in Phase 1.2.

---

## Phase 0 — Shared infrastructure

Small reusable pieces every later phase depends on.

1. **`MedicalDisclaimer`** component (`src/components/ui/` or `src/components/seo/`) — renders "Ця інформація має ознайомлювальний характер і не замінює консультацію лікаря." Auto-appended on medical service pages and blog articles. Strings via `ui_strings`.
2. **`ReviewedByBadge`** component — "Перевірено лікарем [Name] · оновлено [date]", links to doctor profile. Renders only when a reviewer is set.
3. **`JsonLdMedicalWebPage`** (`src/components/seo/`) — emits `MedicalWebPage` with `reviewedBy` (Physician ref) and `lastReviewed`. Composes with existing `MedicalProcedure` on service pages and with blog article schema.

## Phase 1 — High priority

### 1.1 Evidence layer / medical reviewer (rows 3, 24, 25)
- **Migration** (`scripts/migrations/0XX_medical_reviewer.sql`): add `reviewer_doctor_id UUID NULL REFERENCES doctors(id)` and `last_reviewed_at DATE NULL` to `services` and `blog_posts`.
- **Query layer**: extend `services.ts` / `blog.ts` to select reviewer + join minimal doctor fields (name, slug, photo).
- **Admin**: reviewer-doctor selector + review-date field in service and blog editors (`admin/services`, `admin/blog`).
- **Frontend**: `ReviewedByBadge` + `MedicalDisclaimer` on `ServiceDetailTemplate` and blog article template.
- **JSON-LD**: wire `JsonLdMedicalWebPage` (`reviewedBy` + `lastReviewed`) into service detail and blog article.
- **New section type "Джерела / Sources"**: add to `ContentSection` union (`types.ts:233`), renderer in `SectionRenderer.tsx`, admin block editor entry. Renders a titled list of source links (medical studies / references) for a service.

### 1.2 Reviews via Google Business Profile (rows 33, 34, part of 4)
- **Prerequisite (client)**: `Place ID` + credentials. Two integration paths:
  - **Places API** — simplest, but returns **max 5 reviews** + overall rating. Needs a Google Maps API key.
  - **Business Profile API** — full review list, but requires ownership verification + OAuth. Preferred if access is available.
  - Plan supports both behind one server module; choose at implementation based on granted access.
- **Migration**: `google_reviews` cache table (author, rating, text, time, source, `service_id NULL`, `fetched_at`).
- **Fetch/refresh**: server module `src/lib/reviews/google.ts`; revalidate via cron or ISR (`revalidate` window). Moderation flag for hiding individual reviews from admin.
- **Frontend**: `ReviewsBlock` component (list + aggregate rating), placed on service pages and a reputation hub section.
- **Schema**: update clinic-level `AggregateRating` with real Google data.
- **Admin**: read-only review list + hide/show toggle under `admin/reviews`.

### 1.3 "Про центр" completeness (row 8)
Company requisites already translatable (commit `c846cf7`). Add the remaining trust blocks to the About page + CMS fields:
- **License photo** block (image of the МОЗ license).
- **Medical director / керівник** block (name, role, photo).
- **Numbers confirmation** — 10+ years / 15+ doctors / 5000+ patients with a source/basis note.
- CMS fields for the above in `admin/pages` (About editor) with `_uk/_ru/_en`.

## Phase 2 — Medium priority

### 2.1 Dedicated FAQ page (row 16)
- New route `/faq` under `src/app/[locale]/(pages)/`.
- Reuse `faq_items` table; add category grouping (запис, підготовка, протипоказання, оплата, безпека, лабораторія, стаціонар, IV-терапія, check-up).
- `FAQPage` JSON-LD (reuse `FaqSchema.tsx`). Nav/footer link + `ui_strings`.

### 2.2 Equipment detail pages/cards (row 21)
- Detail route for `equipment` (e.g. `/equipment/[slug]` or under about) — the table + `src/components/equipment/` already exist.
- Per-device: photo, manufacturer, certification, procedures it's used for, safety, contraindications.
- Link device cards from related service pages (`service_equipment` join already present).

### 2.3 "Консультація лікаря" Q&A page (row 30)
- New route: patient-question / doctor-answer format, filterable by specialty.
- Question-submission form (reuse `BookingForm` patterns → `form_submissions`) + `MedicalDisclaimer` about individual consultation.
- Content model: `consultation_qa` table (question, answer, doctor_id, specialty) OR reuse `faq_items` with a doctor link — decide in plan.

### 2.4 Technical / UX QA pass (row 6)
Audit task, not a feature. Checklist: mobile adaptation, Core Web Vitals, booking-form submission, clickable phone links, map accessibility, event analytics correctness. Produce a findings list; fix criticals inline.

## Phase 3 — Low priority

### 3.1 Newsletter subscription (row 38)
- `newsletter_subscribers` table (email, locale, consent, created_at).
- Subscribe form component + server action, mandatory data-processing consent checkbox.
- Default: store in DB only. ESP integration (if later desired) is a separate follow-up.

---

## Data-model summary (new/changed)

| Object | Change |
|---|---|
| `services` | + `reviewer_doctor_id`, `last_reviewed_at` |
| `blog_posts` | + `reviewer_doctor_id`, `last_reviewed_at` |
| `ContentSection` | + `Sources` block type |
| `google_reviews` | new cache table |
| `about` / pages | + license photo, medical director, numbers-source fields |
| `consultation_qa` | new table (or reuse `faq_items` + doctor link) |
| `newsletter_subscribers` | new table |

## JSON-LD summary (new/changed)

- New `MedicalWebPage` with `reviewedBy` + `lastReviewed` on service + blog pages.
- Clinic `AggregateRating` fed by real Google reviews.
- `FAQPage` on the new `/faq` route.

## Cross-cutting conventions

- All new UI strings → `ui_strings` JSONB (uk/ru/en), NOT JSON files.
- All new content tables → `_uk/_ru/_en` per-field columns + `ua`→`uk` mapping in query layer.
- Migrations → `scripts/migrations/0XX_*.sql`.
- Everything ships to `develop`; production merge only on explicit confirmation.

## Sequencing / dependencies

- Phase 0 first (all later phases consume its components).
- 1.2 (reviews) is gated on client-provided Google credentials — start scaffolding (table, component, module) in parallel; wire live data when access lands.
- Phases 1 → 2 → 3 by priority; items within a phase are largely independent and parallelizable.
