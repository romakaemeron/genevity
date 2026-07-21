# Технічне завдання №4 — «ЗМІ про нас» (Media / Press) page + auto-managed CMS

**Date:** 2026-07-21
**Branch:** develop
**Status:** approved design → implementation plan next

## Goal

Build a public "Media about us" page listing outreach/PR articles published about
GENEVITY on external Dnipro news outlets. It must be **self-managing**: the client
adds a new mention by pasting a URL, and the system auto-fetches the headline,
publisher, thumbnail, and auto-translates the headline to RU/EN — no developer and
no manual copywriting required.

Covers ТЗ №4 **Part 1** in full. Part 2 ("Перевірено лікарем" on service pages) is
already implemented via `ReviewedByBadge` and is out of scope for this build (it only
needs reviewer doctors assigned per service in the admin — a content step, flagged
separately).

## Decisions (locked)

- **URL:** `/media` (not the spec's `/zmi-pro-nas`) — matches the site's short
  single-word English slug convention (`about`, `blog`, `doctors`, `prices`…).
  Deviation from spec §1.2 to be noted to the reviewer.
- **Management model:** custom CMS section + auto-fetch of metadata.
- **Title language:** UA auto-fetched; RU/EN auto-translated at save-time via the
  existing OpenAI key (`gpt-4o-mini`), cached in DB, all fields editable.
- **Layout:** press-wall responsive card grid.
- **Publisher logo:** favicon (auto, zero-effort) by default; optional manual
  `logo_url` upload per mention for a crisper wordmark.
- **Seed:** pre-load the 10 client-provided articles so the page ships populated.

## Data model

New table via `scripts/migrations/019_media_mentions.sql` (additive, mirrors blog/doctors):

```sql
CREATE TABLE IF NOT EXISTS media_mentions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url            TEXT NOT NULL,                 -- external article, same across locales
  publisher_name TEXT NOT NULL DEFAULT '',
  publisher_domain TEXT NOT NULL DEFAULT '',    -- for favicon
  title_uk       TEXT NOT NULL DEFAULT '',
  title_ru       TEXT NOT NULL DEFAULT '',
  title_en       TEXT NOT NULL DEFAULT '',
  image_url      TEXT,                          -- og:image thumbnail (nullable)
  logo_url       TEXT,                          -- optional publisher logo (nullable)
  published_at   DATE,                          -- nullable
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_published   BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_mentions_pub_idx
  ON media_mentions (is_published, published_at DESC, sort_order);
```

Migration applied via an ad-hoc runner mirroring `scripts/run-migration-013.ts`.

## Components / units

### a) Metadata fetch + translation
- `src/lib/media/fetch-meta.ts` — `fetchMediaMeta(url)`: server-side `fetch` with a
  browser-like User-Agent, parse `og:title` / `og:site_name` / `og:image`, fall back
  to `<title>` and `<link rel=icon>`; derive `publisher_domain` from the URL host.
  Returns a partial `{ publisher_name, publisher_domain, title_uk, image_url,
  published_at }`. On 403/error, returns just `{ publisher_domain }` + host as name so
  the admin can complete manually. Never throws — always returns a usable partial.
- `src/lib/translate.ts` — `translateHeadline(text, target: "ru" | "en")` using
  `generateText({ model: openai("gpt-4o-mini"), ... })`. Prompt: translate a Ukrainian
  aesthetic-medicine article headline into RU/EN, preserve meaning and register, return
  only the translation. Returns `""` on any error (admin fills manually). Mirrors the
  existing `ai` + `@ai-sdk/openai` stack in `src/app/api/chat/route.ts`.

### b) Public queries + admin CRUD
- `src/lib/db/queries/media.ts`, exported from `queries/index.ts`:
  - `getMediaMentions(locale)` — published rows, newest first, with `title` resolved to
    the locale (uk fallback) and a `logo` field (logo_url or favicon URL).
  - `getMediaMentionCount()` — for the sidebar badge.
  - `adminGetAllMentions()`, `adminGetMentionById(id)`, `adminSaveMention(data)`
    (single upsert), `adminDeleteMention(id)`.

### c) Admin section
- `src/app/(admin)/admin/media/page.tsx` (list), `[id]/page.tsx` + `[id]/_form.tsx`
  (client form with the "Отримати дані" fetch button that calls the fetch+translate
  server action and populates fields), `_actions.ts` (`fetchMeta`, `saveMention`,
  `deleteMention` — with `revalidatePath` for `/media`, `/ru/media`, `/en/media`,
  `/admin/media`). Optional logo upload via existing `processUploadOrKeep`.
- Registered in `src/app/(admin)/admin/_components/admin-sidebar.tsx` nav array +
  label in `admin/_i18n/strings.ts`.

### d) Public page
- `src/app/[locale]/(pages)/media/page.tsx`, `revalidate = 3600`, `setRequestLocale`.
- `generateMetadata` returns the exact per-locale Title/Description from §1.3 below.
- Renders `MegaMenuHeader`, a localized H1 + short intro paragraph, then a responsive
  card grid component `src/components/pages/MediaPage.tsx` (or inline). Each card:
  thumbnail (`image_url` or a gradient placeholder), favicon+publisher chip, localized
  title, formatted date; the whole card is an `<a>` with
  `rel="nofollow noopener noreferrer" target="_blank"`.
- Empty state when no mentions. Lightweight `ItemList` JSON-LD of the mentions.

### e) Wiring
- **Footer:** add `media` leaf to `infoLinksForFooter` in
  `src/components/layout/navConfig.ts` with inline labels
  `{ ua: "ЗМІ про нас", ru: "СМИ о нас", en: "Media about us" }`, `href: "/media"`.
- **Sitemap:** `entries.push(localeUrls("/media"))` in `src/app/sitemap.ts`.

## Metatags (§1.3, verbatim from spec)

**UA** — Title: `ЗМІ про GENEVITY ➦ Публікації та згадки про центр GENEVITY`
Description: `ЗМІ про GENEVITY ☝ Публікації, інтерв'ю та згадки про центр й експертів GENEVITY у зовнішніх джерелах.`
H1: `ЗМІ про нас`

**RU** — Title: `СМИ о GENEVITY ➦ Публикации и упоминания о центре GENEVITY`
Description: `СМИ о GENEVITY ☝ Публикации, интервью и упоминания о центре и экспертах GENEVITY во внешних источниках.`
H1: `СМИ о нас`

**EN** — Title: `Media Coverage of GENEVITY ➦ Publications and Mentions of the GENEVITY Center`
Description: `Media Coverage of GENEVITY ☝ Publications, interviews, and mentions of the GENEVITY Center and its experts in external sources.`
H1: `Media Coverage of Us`

## Seed data (10 client-provided articles)

Pre-load via a seed script (`scripts/seed-media-mentions.ts`). Metadata already pulled;
403-blocked outlets filled from known values:

| # | URL | Publisher | Title (UA) |
|---|-----|-----------|-----------|
| 1 | 056.ua/news/4123776/… | 056.ua | Як позбутися локальних жирових відкладень: коли дієта та спорт не допомагають |
| 2 | dpcity.v.ua/chi-mozhna-odnochasno-narostiti | ДП Сity | Чи можна одночасно наростити м'язи та зменшити жировий прошарок? |
| 3 | faine-misto.dp.ua/check-up-40-… | Файне місто Дніпро | Check-Up 40+: що потрібно перевірити, щоб зберегти молодість і енергію |
| 4 | nashdnipro.dp.ua/idealnyy-pres-… | Наш Дніпро | Ідеальний прес без виснажливих тренувань: міф чи реальність? |
| 5 | dnepr.news/public/yak-pidtyagnuti-shkiru-… | Новини Дніпра | Як підтягнути шкіру тіла після схуднення |
| 6 | gorod.dp.ua/news/260308 | Городской сайт Днепра | (fill from page) |
| 7 | vesti.dp.ua/suchasni-sposoby-… | Вісті Придніпров'я | Сучасні способи боротьби з в'ялістю шкіри на тілі |
| 8 | donga.dp.ua/lazerna-epiliatsiia-vlitku-… | Дніпровська Панорама | Лазерна епіляція влітку: що потрібно знати перед процедурою |
| 9 | nashreporter.com/dovidnyk/chomu-shkira-… | Наш Репортер | Чому шкіра втрачає еластичність і як це виправити |
| 10 | sobitie.com.ua/reklama/chomu-lazerna-… | Событие | Чому лазерна епіляція краща за гоління та воскову депіляцію |

RU/EN titles generated at seed time via `translateHeadline`. Titles 6/8 verified/filled
during implementation (pages 403-block automated fetch).

## Error handling

- `fetchMediaMeta` and `translateHeadline` never throw; both degrade to partial/empty so
  the admin form always renders and stays editable.
- Public page tolerates null `image_url`/`logo_url`/`published_at` (placeholder,
  favicon, hidden date respectively).

## Out of scope

- Part 2 reviewer block (already built).
- Per-locale translated URL slugs (site uses shared file-system slugs).
- A `media_outlets` join table — single `media_mentions` table is sufficient (YAGNI).

## Testing / verification

- Migration applies cleanly; seed populates 10 rows with all three title languages.
- Public `/media`, `/ru/media`, `/en/media` render localized H1/meta/titles; all
  outbound links carry `rel="nofollow noopener noreferrer"`.
- Footer link present on all pages; `/media` appears in `sitemap.xml` with hreflang.
- Admin: paste a fresh URL → fetch populates fields → save → appears on public page.
- `npx tsc --noEmit` clean; `npm run build` succeeds.
