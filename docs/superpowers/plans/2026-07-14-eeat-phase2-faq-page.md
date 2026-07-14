# E-E-A-T Phase 2 — Dedicated FAQ Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A dedicated, categorized `/faq` page fed by a new curated general FAQ (admin-editable), with `FAQPage` JSON-LD and a medical disclaimer, linked from nav + footer.

**Architecture:** Reuse the existing `faq_items` table via a new `owner_type = 'faq_page'` (fixed sentinel `owner_id`) plus a nullable `category` key column so items group into sections. Curated content is authored (operational questions only — no medical claims) and seeded, then editable in a new `/admin/faq` section. The public page reads the items grouped by category, resolves labels from `ui_strings`, and emits `FAQPage` structured data.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Neon Postgres via raw `postgres`/`sql`, next-intl with DB-backed `ui_strings`, Tailwind v4. Migrations = numbered SQL + `tsx` runner.

## Global Constraints

- **Branch:** all work on `develop`. Never `main`. Verify `git branch --show-current` before every commit.
- **Content is operational only** (booking, payment, preparation, safety/guarantees, first visit, lab) — NO medical claims. Drafted answers are flagged for clinic review; the page ships to **preview** and is NOT merged to prod until the clinic verifies the copy.
- **Sentinel owner:** `faq_page` items use `owner_type = 'faq_page'` and a fixed `owner_id` constant `00000000-0000-0000-0000-0000000000fa`. Queries filter by `owner_type = 'faq_page'` (never by service/page ids).
- **Categories** are stable keys (`booking`, `preparation`, `payment`, `safety`, `lab`, `visit`); their display labels + page copy live in `ui_strings` under a new `faq` namespace (uk/ru/en). NO hardcoded per-locale strings in components.
- **i18n content:** trilingual `question_{uk,ru,en}` / `answer_{uk,ru,en}` (existing columns). `ua`→`uk` mapping via the query layer's `lang()` helper.
- **No test framework.** Per-task verification = `npm run build`, `npm run lint`, migration runner output, and dev-server / `view-source` checks (FAQPage JSON-LD).
- **Commit per task**, conventional messages, footer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

### Task 1: Migration — `category` column on `faq_items`

**Files:**
- Create: `scripts/migrations/017_faq_category.sql`
- Create: `scripts/run-migration-017.ts`

- [ ] **Step 1: SQL** — `017_faq_category.sql`:
```sql
-- Migration 017: optional category key on faq_items, used to group the
-- dedicated /faq page (owner_type='faq_page') into sections. Nullable so all
-- existing per-owner FAQ rows are unaffected.
ALTER TABLE faq_items ADD COLUMN IF NOT EXISTS category TEXT;
```
- [ ] **Step 2: Runner** — `run-migration-017.ts` mirroring `scripts/run-migration-013.ts` (env load, `sql.unsafe`, verify the column exists via `information_schema.columns`, exit).
- [ ] **Step 3: Run + verify** — `npx tsx scripts/run-migration-017.ts` → success; column present. Include output.
- [ ] **Step 4: Commit** — `git commit -m "feat(db): add category column to faq_items (migration 017)"`

---

### Task 2: Author + seed the curated FAQ content

> **Controller-authored task.** The FAQ copy is authored by the controller using the `genevity-brand-copywriting` skill (brand voice, trilingual), NOT by a generic subagent. This task's deliverable is the committed seed script with the real content already in it.

**Files:**
- Create: `scripts/seed-faq-page.ts`

- [ ] **Step 1: Author ~18 operational Q&A** across the 6 categories (`booking`, `preparation`, `payment`, `safety`, `lab`, `visit`), trilingual (uk/ru/en). Pull real facts from `site_settings` (hours, phones) and generalize from existing service `faq_items` where useful. NO medical claims. Each answer is a clinic-review draft.
- [ ] **Step 2: Write the seed** — `scripts/seed-faq-page.ts` (model env-loading + `postgres` client on `scripts/seed-service-reviewers.ts`). It DELETEs existing `owner_type='faq_page'` rows then INSERTs the authored items with `owner_id = '00000000-0000-0000-0000-0000000000fa'`, `category`, `question_*`, `answer_*`, `sort_order` (idempotent re-seed).
- [ ] **Step 3: Run + verify** — `npx tsx scripts/seed-faq-page.ts`; verify count per category. Include output.
- [ ] **Step 4: Commit** — `git commit -m "feat(faq): seed curated general FAQ content (draft for clinic review)"`

---

### Task 3: Read layer — grouped FAQ query

**Files:**
- Create or extend: `src/lib/db/queries/faq.ts` (or extend `sections.ts` if FAQ queries live there — check first)
- Modify: `src/lib/db/queries/index.ts` (re-export, matching its style)

**Interfaces:**
- Produces: `type FaqPageGroup = { category: string; items: { question: string; answer: string }[] }` and `getFaqPage(locale: string): Promise<FaqPageGroup[]>` — returns `faq_page` items resolved to the locale, grouped by `category`, groups and items ordered by `sort_order`. Categories with no items are omitted.

- [ ] **Step 1: Read** how `getFaqItems(ownerType, ownerId, l)` is implemented in `src/lib/db/queries/sections.ts` to match the locale/`pick` convention.
- [ ] **Step 2: Implement `getFaqPage(locale)`** selecting `WHERE owner_type = 'faq_page'` ordered by `sort_order`, mapping to locale, grouping by `category` in JS (preserve first-seen category order by min sort_order).
- [ ] **Step 3: Re-export** from `index.ts`.
- [ ] **Step 4: Build** — `npm run build` succeeds.
- [ ] **Step 5: Commit** — `git commit -m "feat(faq): grouped FAQ-page read layer (getFaqPage)"`

---

### Task 4: `ui_strings` — faq namespace + nav labels

**Files:**
- Modify: `scripts/seed-eeat-ui-strings.ts` (or a new `scripts/seed-faq-ui-strings.ts` — follow the eeat seed's non-destructive merge pattern)
- Modify: `src/lib/db/types.ts` (`UiStringsData` — add `faq`)
- Modify: `src/lib/db/queries/homepage.ts` (`getUiStrings()` projection — add `faq` via the `pick2` pattern)

- [ ] **Step 1: Add strings** under a `faq` namespace (uk/ru/en): `title`, `heading`, `subtitle`, `navLabel`, and `categories.{booking,preparation,payment,safety,lab,visit}`. Run the seed; verify it reads back.
- [ ] **Step 2: Extend `UiStringsData`** with the `faq` shape and the `getUiStrings()` projection (mirror how `eeat` was added in Phase 1).
- [ ] **Step 3: Build** — succeeds.
- [ ] **Step 4: Commit** — `git commit -m "feat(faq): faq ui_strings namespace + projection"`

---

### Task 5: `/faq` route — page + FAQPage JSON-LD + disclaimer

**Files:**
- Create: `src/app/[locale]/(pages)/faq/page.tsx`
- Possibly create: a `FaqPageView` client component under `src/components/` if an accordion needs client state (reuse the accordion pattern from `src/components/home/HomeFaq.tsx` / `ServiceDetailTemplate`'s `FaqBlock`)
- Modify: `src/i18n/routing.ts` ONLY if the project localizes pathnames (it currently shares slugs — likely no change; verify)

**Interfaces:**
- Consumes: `getFaqPage(locale)`, `faq` ui_strings, `FaqSchema` (`src/components/seo/FaqSchema.tsx`), `MedicalDisclaimer` (Phase 1).

- [ ] **Step 1: Read** `src/components/home/HomeFaq.tsx` (or `FaqBlock` in `ServiceDetailTemplate.tsx`) for the accordion markup + `FaqSchema.tsx` for the JSON-LD component signature.
- [ ] **Step 2: Build the page** — server component: breadcrumbs, `faq.title`/`heading` from ui_strings, render each category (label from `ui_strings.faq.categories[key]`) with its accordion of Q&A. Emit `<FaqSchema items={allItems} />` (flattened) and a `<MedicalDisclaimer>` at the bottom. Set `generateMetadata` (title/description from ui_strings) consistent with other `(pages)` routes.
- [ ] **Step 3: Build + manual check** — `npm run build`; `npm run dev`, open `/faq`, confirm categories + accordions render, `view-source` shows `"FAQPage"` JSON-LD.
- [ ] **Step 4: Commit** — `git commit -m "feat(faq): dedicated /faq page with FAQPage JSON-LD"`

---

### Task 6: Nav + footer link to `/faq`

**Files:**
- Modify: `src/components/layout/navConfig.ts` (add an info/nav entry with a localized `label` → `/faq`) and/or `src/components/layout/Footer.tsx`'s info links
- Modify: header nav if FAQ should appear there (check where "about/doctors/contacts" info links are defined — `infoLinksForFooter` / nav)

- [ ] **Step 1: Read** how `infoLinksForFooter` / the header info links are structured in `navConfig.ts`, add a FAQ entry (localized label via the `L()` helper → `R.faq = "/faq"`). Reuse `resolveNavLabel` if the label goes through `nav_mega`; otherwise use the navConfig label directly.
- [ ] **Step 2: Build + check** — `/faq` link appears in footer (and header if added) in all locales.
- [ ] **Step 3: Commit** — `git commit -m "feat(faq): link /faq from nav + footer"`

---

### Task 7: Admin `/admin/faq` editor

**Files:**
- Create: `src/app/(admin)/admin/faq/page.tsx` + form/action files (follow the closest existing admin CRUD section, e.g. how per-owner FAQ is edited, or a simple list+form section like `admin/legal`)
- Create: the server action to insert/update/delete `faq_page` items (category, question_*, answer_*, sort_order)

**Interfaces:**
- Consumes: `faq_items` (`owner_type='faq_page'`), the category keys.

- [ ] **Step 1: Read** an existing admin CRUD section (e.g. `src/app/(admin)/admin/legal/` or the per-owner FAQ editor) to match the form + server-action + revalidate pattern.
- [ ] **Step 2: Build the editor** — list existing `faq_page` items grouped by category; add/edit/delete a row (category `<select>` of the 6 keys, trilingual question + answer fields, sort_order). Persist via a server action; `revalidatePath("/faq")` + `/ru/faq` + `/en/faq` on save (match the locale-prefix convention used by `saveAbout`/blog).
- [ ] **Step 3: Add the sidebar link** to `/admin/faq` (match how other admin sections register in the nav).
- [ ] **Step 4: Build + manual check** — edit an item in admin, confirm it changes on `/faq` after revalidation.
- [ ] **Step 5: Commit** — `git commit -m "feat(admin): FAQ-page editor"`

---

## Self-Review

**Spec coverage:** dedicated categorized `/faq` (T5) ✓; new curated admin-editable content (T2 seed + T7 editor) ✓; FAQPage JSON-LD (T5) ✓; nav/footer link (T6) ✓; category grouping via `faq_items.category` (T1/T3) ✓; disclaimer (T5) ✓.
**Content safety:** operational-only, drafted for clinic review, preview-first (Global Constraints).
**Type consistency:** `FaqPageGroup` (T3) consumed by T5; `ui_strings.faq` (T4) consumed by T5/T6.

## Out of scope (deferred Phase 2 items)
Equipment detail pages, «Консультація лікаря» Q&A page, UX/CWV audit — separate plans when requested.
