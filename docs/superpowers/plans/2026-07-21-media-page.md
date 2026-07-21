# «ЗМІ про нас» (Media) Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-managing public "Media about us" page at `/media` listing external press mentions of GENEVITY, where a new entry is added by pasting a URL and the system auto-fetches the headline/thumbnail/publisher and auto-translates the headline to RU/EN.

**Architecture:** New `media_mentions` DB table → public + admin query functions → a metadata-fetch helper and an OpenAI translation helper (reusing the existing `ai`/`@ai-sdk/openai` stack) → a press-wall public page → a `/admin/press` CMS section. Wiring into footer + sitemap. Mirrors the existing blog/doctors CMS pattern exactly.

**Tech Stack:** Next.js 16 (App Router, server components), TypeScript strict, `@neondatabase/serverless` (public `sql`) + `postgres` (migration runner), `ai` v6 + `@ai-sdk/openai` v3 (`gpt-4o-mini`), Tailwind v4.

## Global Constraints

- **Branch:** all work on `develop`. Never commit to `main`. Verify with `git branch --show-current` before every commit.
- **No test framework exists** (no vitest/jest). Verification = `npx tsc --noEmit` (must exit 0), `npm run build`, ad-hoc `npx tsx` scripts that assert-and-exit, and DB/curl checks. Do NOT introduce a test runner.
- **Localization suffix convention:** DB columns use `_uk` / `_ru` / `_en`; locale `"ua"` maps to DB suffix `"uk"` via `lang(locale)`.
- **Public URL is `/media`** (shared file-system slug across all 3 locales; `ua` unprefixed, `ru`/`en` prefixed). Admin section is `/admin/press` (because `/admin/media` is the existing image-asset library — do not touch it).
- **Every outbound external link on the public page MUST carry `rel="nofollow noopener noreferrer"` and `target="_blank"`** (ТЗ №4 §1.5).
- **External images** (article thumbnails, favicons) render via plain `<img loading="lazy">`, NOT `next/image` — their hosts are not in `next.config.ts` `remotePatterns` and must not be added.
- **Metatags** are the verbatim per-locale strings in the spec (§1.3) — copied into Task 6.
- Helper `translateHeadline` and `fetchMediaMeta` must **never throw** — degrade to empty/partial so the admin form always works.
- Commit messages end with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## File Structure

- Create `scripts/migrations/019_media_mentions.sql` — table DDL.
- Create `scripts/run-migration-019.ts` — migration runner (mirrors `run-migration-018.ts`).
- Create `src/lib/translate.ts` — `translateHeadline(text, target)` OpenAI helper.
- Create `src/lib/media/fetch-meta.ts` — `fetchMediaMeta(url)` OG scraper.
- Create `src/lib/db/queries/media.ts` — public + admin query/CRUD functions.
- Modify `src/lib/db/queries/index.ts` — barrel-export the media queries.
- Create `scripts/seed-media-mentions.ts` — seed the 10 client articles.
- Create `src/app/[locale]/(pages)/media/page.tsx` — public route (metatags + JSON-LD).
- Create `src/components/pages/MediaPage.tsx` — press-wall grid (client) + card.
- Modify `src/components/layout/navConfig.ts` — add `R.media` + `media` leaf in `infoLinksForFooter`.
- Modify `src/app/sitemap.ts` — add `/media`.
- Create `src/app/(admin)/admin/press/page.tsx` — admin list.
- Create `src/app/(admin)/admin/press/[id]/page.tsx` + `[id]/_form.tsx` — admin form.
- Create `src/app/(admin)/admin/press/_actions.ts` — `fetchMeta`, `saveMention`, `deleteMention`.
- Modify `src/app/(admin)/admin/_components/admin-sidebar.tsx` — add `press` nav item.
- Modify `src/app/(admin)/admin/_i18n/strings.ts` — add `press` nav label.

---

## Task 1: DB table + migration runner

**Files:**
- Create: `scripts/migrations/019_media_mentions.sql`
- Create: `scripts/run-migration-019.ts`

**Interfaces:**
- Produces: table `media_mentions` with columns `id, url, publisher_name, publisher_domain, title_uk, title_ru, title_en, image_url, logo_url, published_at, sort_order, is_published, created_at`.

- [ ] **Step 1: Write the migration SQL**

Create `scripts/migrations/019_media_mentions.sql`:

```sql
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
```

- [ ] **Step 2: Write the runner**

Create `scripts/run-migration-019.ts`:

```ts
/**
 * Create media_mentions table.
 * Run: npx tsx scripts/run-migration-019.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

async function run() {
  const migration = fs.readFileSync(
    path.resolve(__dirname, "migrations/019_media_mentions.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 019 applied: media_mentions created");
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'media_mentions' ORDER BY ordinal_position`;
  console.log("columns:", cols.map((r) => r.column_name));
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Apply and verify**

Run: `npx tsx scripts/run-migration-019.ts`
Expected: prints `✓ Migration 019 applied` and a `columns:` list containing all 13 column names.

- [ ] **Step 4: Commit**

```bash
git branch --show-current   # must print: develop
git add scripts/migrations/019_media_mentions.sql scripts/run-migration-019.ts
git commit -m "feat(media): add media_mentions table (ТЗ №4)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Translation helper

**Files:**
- Create: `src/lib/translate.ts`

**Interfaces:**
- Consumes: `ai` (`generateText`), `@ai-sdk/openai` (`openai`).
- Produces: `translateHeadline(text: string, target: "ru" | "en"): Promise<string>` — returns the translated headline, or `""` on empty input / any error.

- [ ] **Step 1: Write the helper**

Create `src/lib/translate.ts`:

```ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const LANG: Record<"ru" | "en", string> = { ru: "Russian", en: "English" };

/**
 * Translate a single Ukrainian article headline into RU or EN.
 * One-shot, used at save-time and cached in DB. Never throws — returns ""
 * on empty input or any failure so callers can fall back to manual entry.
 */
export async function translateHeadline(text: string, target: "ru" | "en"): Promise<string> {
  const src = text.trim();
  if (!src) return "";
  try {
    const { text: out } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt:
        `Translate this Ukrainian aesthetic-medicine article headline into ${LANG[target]}. ` +
        `Preserve the meaning and a natural editorial register. ` +
        `Return ONLY the translation, no quotes, no extra text.\n\n${src}`,
    });
    return out.trim();
  } catch (e) {
    console.error("translateHeadline failed:", e);
    return "";
  }
}
```

- [ ] **Step 2: Write a throwaway verification script**

Create `scripts/verify-translate.ts`:

```ts
import { readFileSync } from "fs";
readFileSync(".env.local", "utf8").split("\n").forEach((l) => {
  const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim();
});
import { translateHeadline } from "../src/lib/translate";
const ru = await translateHeadline("Як позбутися локальних жирових відкладень", "ru");
const en = await translateHeadline("Як позбутися локальних жирових відкладень", "en");
const empty = await translateHeadline("   ", "ru");
console.log("RU:", ru);
console.log("EN:", en);
if (!ru || !en) { console.error("FAIL: empty translation"); process.exit(1); }
if (empty !== "") { console.error("FAIL: blank input must return ''"); process.exit(1); }
console.log("PASS");
```

- [ ] **Step 3: Run it**

Run: `npx tsx scripts/verify-translate.ts`
Expected: prints a Russian and an English headline, then `PASS`.

- [ ] **Step 4: Delete the throwaway script and commit**

```bash
rm scripts/verify-translate.ts
git branch --show-current   # develop
git add src/lib/translate.ts
git commit -m "feat(media): add OpenAI headline translation helper

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Metadata fetch helper

**Files:**
- Create: `src/lib/media/fetch-meta.ts`

**Interfaces:**
- Produces:
  - type `MediaMeta = { publisher_name: string; publisher_domain: string; title_uk: string; image_url: string | null; published_at: string | null }`
  - `fetchMediaMeta(url: string): Promise<MediaMeta>` — best-effort OG scrape; never throws. On block/error returns `{ publisher_domain, publisher_name: domain, title_uk: "", image_url: null, published_at: null }`.

- [ ] **Step 1: Write the helper**

Create `src/lib/media/fetch-meta.ts`:

```ts
export type MediaMeta = {
  publisher_name: string;
  publisher_domain: string;
  title_uk: string;
  image_url: string | null;
  published_at: string | null;
};

function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function metaContent(html: string, ...keys: string[]): string | null {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i");
    const m = html.match(re) ||
      html.match(new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"));
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–");
}

/**
 * Best-effort Open Graph scrape for a press article. Never throws; returns a
 * partial MediaMeta (domain always set) so the admin can complete manually
 * when a site blocks server-side fetches (several Dnipro outlets return 403).
 */
export async function fetchMediaMeta(url: string): Promise<MediaMeta> {
  const publisher_domain = domainOf(url);
  const fallback: MediaMeta = {
    publisher_name: publisher_domain,
    publisher_domain,
    title_uk: "",
    image_url: null,
    published_at: null,
  };
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const rawTitle =
      metaContent(html, "og:title", "twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      "";
    const rawPublisher =
      metaContent(html, "og:site_name") || publisher_domain;
    const image = metaContent(html, "og:image", "twitter:image");
    const date =
      metaContent(html, "article:published_time", "og:updated_time") || null;
    return {
      publisher_name: decodeEntities(rawPublisher).trim() || publisher_domain,
      publisher_domain,
      title_uk: decodeEntities(rawTitle).trim(),
      image_url: image ? (image.startsWith("http") ? image : null) : null,
      published_at: date ? date.slice(0, 10) : null,
    };
  } catch (e) {
    console.error("fetchMediaMeta failed:", e);
    return fallback;
  }
}
```

- [ ] **Step 2: Write a throwaway verification script**

Create `scripts/verify-fetch-meta.ts`:

```ts
import { fetchMediaMeta } from "../src/lib/media/fetch-meta";
const ok = await fetchMediaMeta(
  "https://vesti.dp.ua/suchasni-sposoby-borotby-z-v-yalistyu-shkiry-na-tili/");
console.log("OK site:", ok);
const blocked = await fetchMediaMeta("https://gorod.dp.ua/news/260308");
console.log("Blocked site:", blocked);
if (!ok.title_uk) { console.error("FAIL: expected a title from vesti"); process.exit(1); }
if (blocked.publisher_domain !== "gorod.dp.ua") { console.error("FAIL: domain"); process.exit(1); }
console.log("PASS");
```

- [ ] **Step 3: Run it**

Run: `npx tsx scripts/verify-fetch-meta.ts`
Expected: `OK site:` shows a non-empty `title_uk` and `publisher_domain: "vesti.dp.ua"`; `Blocked site:` shows `publisher_domain: "gorod.dp.ua"` with empty `title_uk`; then `PASS`.

- [ ] **Step 4: Delete throwaway script and commit**

```bash
rm scripts/verify-fetch-meta.ts
git add src/lib/media/fetch-meta.ts
git commit -m "feat(media): add Open Graph metadata fetch helper

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Queries + barrel export

**Files:**
- Create: `src/lib/db/queries/media.ts`
- Modify: `src/lib/db/queries/index.ts`

**Interfaces:**
- Consumes: `sql` from `../client`.
- Produces:
  - type `MediaMentionPublic = { id: string; url: string; publisherName: string; title: string; imageUrl: string | null; logo: string; publishedAt: string | null }`
  - type `MediaMentionAdmin` = full row (all `_uk/_ru/_en` fields, `is_published`, `sort_order`).
  - `getMediaMentions(locale: string): Promise<MediaMentionPublic[]>` (published, newest first).
  - `getMediaMentionCount(): Promise<number>`.
  - `adminGetAllMentions(): Promise<MediaMentionAdmin[]>`.
  - `adminGetMentionById(id: string): Promise<MediaMentionAdmin | null>`.
  - `adminSaveMention(d: MediaMentionInput): Promise<string>` (returns id).
  - `adminDeleteMention(id: string): Promise<void>`.

- [ ] **Step 1: Write the query module**

Create `src/lib/db/queries/media.ts`:

```ts
import { sql } from "../client";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export type MediaMentionPublic = {
  id: string;
  url: string;
  publisherName: string;
  title: string;
  imageUrl: string | null;
  logo: string;
  publishedAt: string | null;
};

export type MediaMentionAdmin = {
  id: string;
  url: string;
  publisherName: string;
  publisherDomain: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  imageUrl: string | null;
  logoUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type MediaMentionInput = {
  id?: string;
  url: string;
  publisherName: string;
  publisherDomain: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  imageUrl: string | null;
  logoUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export async function getMediaMentions(locale: string): Promise<MediaMentionPublic[]> {
  const l = lang(locale);
  const rows = await sql`
    SELECT id, url, publisher_name, publisher_domain,
      title_uk, title_ru, title_en, image_url, logo_url,
      published_at::text AS published_at
    FROM media_mentions
    WHERE is_published = true
    ORDER BY published_at DESC NULLS LAST, sort_order`;
  return rows.map((r) => ({
    id: r.id as string,
    url: r.url as string,
    publisherName: (r.publisher_name as string) || (r.publisher_domain as string),
    title: (r[`title_${l}`] as string) || (r.title_uk as string) || "",
    imageUrl: (r.image_url as string | null) || null,
    logo: (r.logo_url as string | null) || faviconUrl(r.publisher_domain as string),
    publishedAt: (r.published_at as string | null) || null,
  }));
}

export async function getMediaMentionCount(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS n FROM media_mentions`;
  return (rows[0]?.n as number) ?? 0;
}

function toAdmin(r: Record<string, unknown>): MediaMentionAdmin {
  return {
    id: r.id as string,
    url: r.url as string,
    publisherName: r.publisher_name as string,
    publisherDomain: r.publisher_domain as string,
    titleUk: r.title_uk as string,
    titleRu: r.title_ru as string,
    titleEn: r.title_en as string,
    imageUrl: (r.image_url as string | null) || null,
    logoUrl: (r.logo_url as string | null) || null,
    publishedAt: (r.published_at as string | null) || null,
    sortOrder: r.sort_order as number,
    isPublished: r.is_published as boolean,
  };
}

export async function adminGetAllMentions(): Promise<MediaMentionAdmin[]> {
  const rows = await sql`
    SELECT *, published_at::text AS published_at FROM media_mentions
    ORDER BY published_at DESC NULLS LAST, sort_order`;
  return rows.map(toAdmin);
}

export async function adminGetMentionById(id: string): Promise<MediaMentionAdmin | null> {
  const rows = await sql`
    SELECT *, published_at::text AS published_at
    FROM media_mentions WHERE id = ${id} LIMIT 1`;
  return rows.length ? toAdmin(rows[0]) : null;
}

export async function adminSaveMention(d: MediaMentionInput): Promise<string> {
  if (d.id) {
    await sql`
      UPDATE media_mentions SET
        url=${d.url}, publisher_name=${d.publisherName}, publisher_domain=${d.publisherDomain},
        title_uk=${d.titleUk}, title_ru=${d.titleRu}, title_en=${d.titleEn},
        image_url=${d.imageUrl}, logo_url=${d.logoUrl},
        published_at=${d.publishedAt ? sql`${d.publishedAt}::date` : sql`NULL`},
        sort_order=${d.sortOrder}, is_published=${d.isPublished}
      WHERE id=${d.id}`;
    return d.id;
  }
  const rows = await sql`
    INSERT INTO media_mentions
      (url, publisher_name, publisher_domain, title_uk, title_ru, title_en,
       image_url, logo_url, published_at, sort_order, is_published)
    VALUES
      (${d.url}, ${d.publisherName}, ${d.publisherDomain}, ${d.titleUk}, ${d.titleRu}, ${d.titleEn},
       ${d.imageUrl}, ${d.logoUrl},
       ${d.publishedAt ? sql`${d.publishedAt}::date` : sql`NULL`},
       ${d.sortOrder}, ${d.isPublished})
    RETURNING id`;
  return rows[0].id as string;
}

export async function adminDeleteMention(id: string): Promise<void> {
  await sql`DELETE FROM media_mentions WHERE id = ${id}`;
}
```

- [ ] **Step 2: Barrel-export**

In `src/lib/db/queries/index.ts`, append:

```ts
export {
  getMediaMentions, getMediaMentionCount,
  adminGetAllMentions, adminGetMentionById, adminSaveMention, adminDeleteMention,
} from "./media";
export type { MediaMentionPublic, MediaMentionAdmin, MediaMentionInput } from "./media";
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/queries/media.ts src/lib/db/queries/index.ts
git commit -m "feat(media): add media_mentions queries + admin CRUD

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Seed the 10 client articles

**Files:**
- Create: `scripts/seed-media-mentions.ts`

**Interfaces:**
- Consumes: `fetchMediaMeta`, `translateHeadline`, `adminSaveMention`.

- [ ] **Step 1: Write the seed script**

Create `scripts/seed-media-mentions.ts`. The `SEED` array carries known-good UA titles (from the metadata already gathered) so the two 403-blocked outlets (#6 gorod, #8 donga) and the Google-Sites page (#2 dpcity) are correct regardless of live fetch. The script fills `image_url`/`published_at` from a live fetch when available, and translates each title once.

```ts
import { readFileSync } from "fs";
readFileSync(".env.local", "utf8").split("\n").forEach((l) => {
  const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim();
});
import { fetchMediaMeta } from "../src/lib/media/fetch-meta";
import { translateHeadline } from "../src/lib/translate";
import { adminSaveMention } from "../src/lib/db/queries/media";

const SEED: { url: string; publisher: string; titleUk: string; date: string | null }[] = [
  { url: "https://www.056.ua/news/4123776/ak-pozbutisa-lokalnih-zirovih-vidkladen-koli-dieta-ta-sport-ne-dopomagaut",
    publisher: "056.ua", titleUk: "Як позбутися локальних жирових відкладень: коли дієта та спорт не допомагають", date: "2026-06-29" },
  { url: "https://www.dpcity.v.ua/chi-mozhna-odnochasno-narostiti",
    publisher: "ДП City", titleUk: "Чи можна одночасно наростити м'язи та зменшити жировий прошарок?", date: null },
  { url: "https://faine-misto.dp.ua/check-up-40-obstezhennia-pislia-40-rokiv/",
    publisher: "Файне місто Дніпро", titleUk: "Check-Up 40+: що потрібно перевірити, щоб зберегти молодість і енергію", date: "2026-06-28" },
  { url: "https://nashdnipro.dp.ua/idealnyy-pres-bez-vysnazhlyvyh-trenuvan-mif-chy-realnist/",
    publisher: "Наш Дніпро", titleUk: "Ідеальний прес без виснажливих тренувань: міф чи реальність?", date: null },
  { url: "https://dnepr.news/public/yak-pidtyagnuti-shkiru-tila-pislya-shudnennya",
    publisher: "Новини Дніпра", titleUk: "Як підтягнути шкіру тіла після схуднення", date: "2026-07-02" },
  { url: "https://gorod.dp.ua/news/260308",
    publisher: "Городской сайт Днепра", titleUk: "Догляд за шкірою тіла: сучасні апаратні методики", date: null },
  { url: "https://vesti.dp.ua/suchasni-sposoby-borotby-z-v-yalistyu-shkiry-na-tili/",
    publisher: "Вісті Придніпров'я", titleUk: "Сучасні способи боротьби з в'ялістю шкіри на тілі", date: "2026-06-27" },
  { url: "https://donga.dp.ua/lazerna-epiliatsiia-vlitku-shcho-potribno-znaty-pered-protseduroiu/",
    publisher: "Дніпровська панорама", titleUk: "Лазерна епіляція влітку: що потрібно знати перед процедурою", date: null },
  { url: "https://nashreporter.com/dovidnyk/chomu-shkira-vtrachaye-elastychnist-i-yak-cze-vypravyty-318333",
    publisher: "Наш Репортер", titleUk: "Чому шкіра втрачає еластичність і як це виправити", date: "2026-06-29" },
  { url: "https://sobitie.com.ua/reklama/chomu-lazerna-epilyacziya-krashha-za-golinnya-ta-voskovu-depilyacziyu-427893/",
    publisher: "Событие", titleUk: "Чому лазерна епіляція краща за гоління та воскову депіляцію", date: null },
];

async function run() {
  let order = 0;
  for (const s of SEED) {
    const meta = await fetchMediaMeta(s.url);
    const titleUk = s.titleUk || meta.title_uk;
    const [titleRu, titleEn] = await Promise.all([
      translateHeadline(titleUk, "ru"),
      translateHeadline(titleUk, "en"),
    ]);
    const id = await adminSaveMention({
      url: s.url,
      publisherName: s.publisher || meta.publisher_name,
      publisherDomain: meta.publisher_domain,
      titleUk, titleRu, titleEn,
      imageUrl: meta.image_url,
      logoUrl: null,
      publishedAt: s.date || meta.published_at,
      sortOrder: order++,
      isPublished: true,
    });
    console.log(`✓ ${s.publisher} → ${id}`);
  }
  console.log("Seed complete.");
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run the seed**

Run: `npx tsx scripts/seed-media-mentions.ts`
Expected: ten `✓ <publisher> → <uuid>` lines, then `Seed complete.`

- [ ] **Step 3: Verify rows have all three titles**

Run:
```bash
npx tsx -e 'import {readFileSync} from "fs"; readFileSync(".env.local","utf8").split("\n").forEach(l=>{const m=l.match(/^([^#=\s]+)=(.+)/); if(m)process.env[m[1].trim()]=m[2].trim();}); import("./src/lib/db/queries/media").then(async m=>{const r=await m.adminGetAllMentions(); console.log("count:",r.length); console.log(r.filter(x=>!x.titleRu||!x.titleEn).map(x=>x.publisherName)); process.exit(0);});'
```
Expected: `count: 10` and an empty `[]` (every row has RU+EN titles).

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-media-mentions.ts
git commit -m "feat(media): seed 10 client press articles

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Public `/media` page + press-wall grid

**Files:**
- Create: `src/components/pages/MediaPage.tsx`
- Create: `src/app/[locale]/(pages)/media/page.tsx`

**Interfaces:**
- Consumes: `getMediaMentions`, `MediaMentionPublic`, `JsonLd`, `MegaMenuHeader`, motion presets.
- Produces: default-exported `MediaPage` component; the route page.

- [ ] **Step 1: Write the grid component**

Create `src/components/pages/MediaPage.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import type { MediaMentionPublic } from "@/lib/db/queries/media";

const COPY = {
  ua: { h1: "ЗМІ про нас",
    intro: "Публікації, інтерв'ю та згадки про центр GENEVITY та наших експертів у зовнішніх джерелах.",
    empty: "Незабаром тут з'являться публікації.", read: "Читати" },
  ru: { h1: "СМИ о нас",
    intro: "Публикации, интервью и упоминания о центре GENEVITY и наших экспертах во внешних источниках.",
    empty: "Скоро здесь появятся публикации.", read: "Читать" },
  en: { h1: "Media Coverage of Us",
    intro: "Publications, interviews and mentions of the GENEVITY center and our experts in external sources.",
    empty: "Publications will appear here soon.", read: "Read" },
} as const;

function formatDate(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const tag = locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-GB";
  try { return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(iso)); } catch { return null; }
}

export default function MediaPage({
  mentions, locale,
}: { mentions: MediaMentionPublic[]; locale: string }) {
  const t = COPY[(locale as keyof typeof COPY)] ?? COPY.ua;

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-[120px] pt-[140px]">
      <header className="mb-block max-w-[720px]">
        <h1 className="heading-1">{t.h1}</h1>
        <p className="body-l mt-element text-main/70">{t.intro}</p>
      </header>

      {mentions.length === 0 ? (
        <p className="body-m text-main/60">{t.empty}</p>
      ) : (
        <motion.ul
          variants={staggerContainer} initial="hidden" whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {mentions.map((m) => {
            const date = formatDate(m.publishedAt, locale);
            return (
              <motion.li key={m.id} variants={fadeInUp}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-main/10 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-champagne">
                    {m.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt="" loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-rosegold/40 to-champagne" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-card">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.logo} alt="" width={20} height={20}
                        loading="lazy" className="h-5 w-5 rounded-sm" />
                      <span className="body-s font-medium text-main/70">{m.publisherName}</span>
                    </div>
                    <h2 className="body-strong line-clamp-3 text-main">{m.title}</h2>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      {date && <time className="body-s text-main/50">{date}</time>}
                      <span className="body-s font-medium text-rosegold group-hover:underline">
                        {t.read} →
                      </span>
                    </div>
                  </div>
                </a>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Write the route page**

Create `src/app/[locale]/(pages)/media/page.tsx`. Metatags are the verbatim §1.3 strings.

```tsx
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/seo";
import { getMediaMentions } from "@/lib/db/queries";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import MediaPage from "@/components/pages/MediaPage";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

const META = {
  ua: { title: "ЗМІ про GENEVITY ➦ Публікації та згадки про центр GENEVITY",
    description: "ЗМІ про GENEVITY ☝ Публікації, інтерв'ю та згадки про центр й експертів GENEVITY у зовнішніх джерелах." },
  ru: { title: "СМИ о GENEVITY ➦ Публикации и упоминания о центре GENEVITY",
    description: "СМИ о GENEVITY ☝ Публикации, интервью и упоминания о центре и экспертах GENEVITY во внешних источниках." },
  en: { title: "Media Coverage of GENEVITY ➦ Publications and Mentions of the GENEVITY Center",
    description: "Media Coverage of GENEVITY ☝ Publications, interviews, and mentions of the GENEVITY Center and its experts in external sources." },
} as const;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = META[(locale as keyof typeof META)] ?? META.ua;
  return generatePageMetadata({
    title: m.title, description: m.description,
    locale: locale as Locale, path: "/media",
  });
}

export default async function Page({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const mentions = await getMediaMentions(locale);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: mentions.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: m.url,
      name: m.title,
    })),
  };

  return (
    <>
      {mentions.length > 0 && <JsonLd data={itemList} />}
      <MegaMenuHeader variant="solid" position="fixed" />
      <MediaPage mentions={mentions} locale={locale} />
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0. (If `generatePageMetadata`, `JsonLd`, or motion preset import paths differ, open `src/app/[locale]/(pages)/about/page.tsx` and `src/app/[locale]/(pages)/doctors/[slug]/page.tsx` and match their exact import specifiers.)

- [ ] **Step 4: Build + browser check**

Run: `npm run build` — expected: succeeds, and the build log lists `/[locale]/(pages)/media` as a route.
Then `npm run dev` and load `http://localhost:3000/media`, `/ru/media`, `/en/media`.
Verify: localized H1 (`ЗМІ про нас` / `СМИ о нас` / `Media Coverage of Us`), a grid of 10 cards, each linking out. In devtools, confirm each card `<a>` has `rel="nofollow noopener noreferrer"` and `target="_blank"`.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/MediaPage.tsx "src/app/[locale]/(pages)/media/page.tsx"
git commit -m "feat(media): public /media press-wall page with nofollow links + JSON-LD

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Footer link + sitemap

**Files:**
- Modify: `src/components/layout/navConfig.ts` (`R` object ~line 43; `infoLinksForFooter` ~line 279)
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: existing `R`, `L`, `NavLeaf`, `infoLinksForFooter`, `localeUrls`.

- [ ] **Step 1: Add the route constant**

In `src/components/layout/navConfig.ts`, inside the `const R = { ... }` object (next to `about: "/about",`), add:

```ts
  media: "/media",
```

- [ ] **Step 2: Add the footer leaf**

In the same file, append to the `infoLinksForFooter` array (after the `faq` entry):

```ts
  { key: "media", label: L("ЗМІ про нас", "СМИ о нас", "Media about us"), href: R.media },
```

- [ ] **Step 3: Add to sitemap**

In `src/app/sitemap.ts`, next to the other `entries.push(localeUrls("/..."))` calls, add:

```ts
  entries.push(localeUrls("/media"));
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` (expected 0), then `npm run dev` and:
- Confirm the footer on any page (e.g. `/`) now shows the "ЗМІ про нас" link → clicking goes to `/media`.
- Load `http://localhost:3000/sitemap.xml` and confirm a `<loc>…/media</loc>` entry with hreflang alternates is present.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/navConfig.ts src/app/sitemap.ts
git commit -m "feat(media): link /media in footer + sitemap

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Admin `/admin/press` section

**Files:**
- Create: `src/app/(admin)/admin/press/page.tsx`
- Create: `src/app/(admin)/admin/press/[id]/page.tsx`
- Create: `src/app/(admin)/admin/press/[id]/_form.tsx`
- Create: `src/app/(admin)/admin/press/_actions.ts`
- Modify: `src/app/(admin)/admin/_components/admin-sidebar.tsx`
- Modify: `src/app/(admin)/admin/_i18n/strings.ts`

**Interfaces:**
- Consumes: `adminGetAllMentions`, `adminGetMentionById`, `adminSaveMention`, `adminDeleteMention`, `fetchMediaMeta`, `translateHeadline`, `requireSession` (from `../_actions/auth`), `AdminPageHeader` (from `../_components/admin-list`).

> Before writing, open `src/app/(admin)/admin/blog/page.tsx`, `blog/[id]/_form.tsx`, and `blog/_actions.ts` to match the exact local admin conventions (auth guard, `AdminPageHeader`, form styling classes, `revalidatePath`/`redirect` usage). The code below is complete but should adopt those shared UI wrappers where they exist.

- [ ] **Step 1: Server actions**

Create `src/app/(admin)/admin/press/_actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "../_actions/auth";
import {
  adminSaveMention, adminDeleteMention, type MediaMentionInput,
} from "@/lib/db/queries/media";
import { fetchMediaMeta } from "@/lib/media/fetch-meta";
import { translateHeadline } from "@/lib/translate";

export type FetchMetaResult = {
  publisherName: string; publisherDomain: string;
  titleUk: string; titleRu: string; titleEn: string;
  imageUrl: string | null; publishedAt: string | null;
};

/** Admin "Отримати дані" button: scrape OG + translate the headline. */
export async function fetchMeta(url: string): Promise<FetchMetaResult> {
  await requireSession();
  const meta = await fetchMediaMeta(url);
  const [titleRu, titleEn] = meta.title_uk
    ? await Promise.all([
        translateHeadline(meta.title_uk, "ru"),
        translateHeadline(meta.title_uk, "en"),
      ])
    : ["", ""];
  return {
    publisherName: meta.publisher_name,
    publisherDomain: meta.publisher_domain,
    titleUk: meta.title_uk, titleRu, titleEn,
    imageUrl: meta.image_url, publishedAt: meta.published_at,
  };
}

function revalidateAll() {
  for (const p of ["/media", "/ru/media", "/en/media", "/admin/press"]) revalidatePath(p);
}

export async function saveMention(formData: FormData): Promise<void> {
  await requireSession();
  const id = (formData.get("id") as string) || undefined;
  const input: MediaMentionInput = {
    id,
    url: (formData.get("url") as string).trim(),
    publisherName: ((formData.get("publisherName") as string) || "").trim(),
    publisherDomain: ((formData.get("publisherDomain") as string) || "").trim(),
    titleUk: ((formData.get("titleUk") as string) || "").trim(),
    titleRu: ((formData.get("titleRu") as string) || "").trim(),
    titleEn: ((formData.get("titleEn") as string) || "").trim(),
    imageUrl: ((formData.get("imageUrl") as string) || "").trim() || null,
    logoUrl: ((formData.get("logoUrl") as string) || "").trim() || null,
    publishedAt: ((formData.get("publishedAt") as string) || "").trim() || null,
    sortOrder: Number(formData.get("sortOrder") || 0),
    isPublished: formData.get("isPublished") === "on",
  };
  await adminSaveMention(input);
  revalidateAll();
  redirect("/admin/press");
}

export async function deleteMention(formData: FormData): Promise<void> {
  await requireSession();
  await adminDeleteMention(formData.get("id") as string);
  revalidateAll();
  redirect("/admin/press");
}
```

- [ ] **Step 2: List page**

Create `src/app/(admin)/admin/press/page.tsx`:

```tsx
import Link from "next/link";
import { requireSession } from "../_actions/auth";
import { adminGetAllMentions } from "@/lib/db/queries/media";
import { AdminPageHeader } from "../_components/admin-list";

export const dynamic = "force-dynamic";

export default async function PressAdminPage() {
  await requireSession();
  const rows = await adminGetAllMentions();
  return (
    <div>
      <AdminPageHeader title="ЗМІ про нас" action={
        <Link href="/admin/press/new" className="rounded-md bg-black px-4 py-2 text-sm text-white">
          + Додати
        </Link>
      } />
      <ul className="divide-y">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-3">
            <Link href={`/admin/press/${r.id}`} className="flex-1">
              <span className="font-medium">{r.titleUk || r.url}</span>
              <span className="ml-2 text-sm text-gray-500">{r.publisherName}</span>
            </Link>
            <span className={`text-xs ${r.isPublished ? "text-green-600" : "text-gray-400"}`}>
              {r.isPublished ? "опубліковано" : "чернетка"}
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-6 text-gray-500">Ще немає записів.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Edit/new form page + client form**

Create `src/app/(admin)/admin/press/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { requireSession } from "../../_actions/auth";
import { adminGetMentionById } from "@/lib/db/queries/media";
import PressForm from "./_form";

export const dynamic = "force-dynamic";

export default async function PressEditPage({
  params,
}: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const mention = id === "new" ? null : await adminGetMentionById(id);
  if (id !== "new" && !mention) notFound();
  return <PressForm mention={mention} />;
}
```

Create `src/app/(admin)/admin/press/[id]/_form.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import type { MediaMentionAdmin } from "@/lib/db/queries/media";
import { fetchMeta, saveMention, deleteMention } from "../_actions";

export default function PressForm({ mention }: { mention: MediaMentionAdmin | null }) {
  const [f, setF] = useState({
    url: mention?.url ?? "",
    publisherName: mention?.publisherName ?? "",
    publisherDomain: mention?.publisherDomain ?? "",
    titleUk: mention?.titleUk ?? "",
    titleRu: mention?.titleRu ?? "",
    titleEn: mention?.titleEn ?? "",
    imageUrl: mention?.imageUrl ?? "",
    logoUrl: mention?.logoUrl ?? "",
    publishedAt: mention?.publishedAt ?? "",
    sortOrder: mention?.sortOrder ?? 0,
    isPublished: mention?.isPublished ?? true,
  });
  const [fetching, startFetch] = useTransition();

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  function autofill() {
    if (!f.url.trim()) return;
    startFetch(async () => {
      const m = await fetchMeta(f.url.trim());
      setF((prev) => ({
        ...prev,
        publisherName: m.publisherName || prev.publisherName,
        publisherDomain: m.publisherDomain || prev.publisherDomain,
        titleUk: m.titleUk || prev.titleUk,
        titleRu: m.titleRu || prev.titleRu,
        titleEn: m.titleEn || prev.titleEn,
        imageUrl: m.imageUrl || prev.imageUrl,
        publishedAt: m.publishedAt || prev.publishedAt,
      }));
    });
  }

  const input = "w-full rounded border px-3 py-2 text-sm";
  return (
    <form action={saveMention} className="max-w-2xl space-y-4">
      {mention && <input type="hidden" name="id" value={mention.id} />}

      <label className="block">
        <span className="text-sm font-medium">URL статті</span>
        <div className="flex gap-2">
          <input name="url" value={f.url} onChange={(e) => set("url", e.target.value)}
            required className={input} />
          <button type="button" onClick={autofill} disabled={fetching}
            className="whitespace-nowrap rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50">
            {fetching ? "Завантаження…" : "Отримати дані"}
          </button>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block"><span className="text-sm font-medium">Видання</span>
          <input name="publisherName" value={f.publisherName}
            onChange={(e) => set("publisherName", e.target.value)} className={input} /></label>
        <label className="block"><span className="text-sm font-medium">Домен</span>
          <input name="publisherDomain" value={f.publisherDomain}
            onChange={(e) => set("publisherDomain", e.target.value)} className={input} /></label>
      </div>

      <label className="block"><span className="text-sm font-medium">Заголовок (UA)</span>
        <input name="titleUk" value={f.titleUk}
          onChange={(e) => set("titleUk", e.target.value)} className={input} /></label>
      <label className="block"><span className="text-sm font-medium">Заголовок (RU)</span>
        <input name="titleRu" value={f.titleRu}
          onChange={(e) => set("titleRu", e.target.value)} className={input} /></label>
      <label className="block"><span className="text-sm font-medium">Заголовок (EN)</span>
        <input name="titleEn" value={f.titleEn}
          onChange={(e) => set("titleEn", e.target.value)} className={input} /></label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block"><span className="text-sm font-medium">Зображення (URL)</span>
          <input name="imageUrl" value={f.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)} className={input} /></label>
        <label className="block"><span className="text-sm font-medium">Лого (URL, опц.)</span>
          <input name="logoUrl" value={f.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)} className={input} /></label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block"><span className="text-sm font-medium">Дата публікації</span>
          <input type="date" name="publishedAt" value={f.publishedAt}
            onChange={(e) => set("publishedAt", e.target.value)} className={input} /></label>
        <label className="block"><span className="text-sm font-medium">Порядок</span>
          <input type="number" name="sortOrder" value={f.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))} className={input} /></label>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isPublished" defaultChecked={f.isPublished} />
        <span className="text-sm">Опубліковано</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" className="rounded bg-black px-5 py-2 text-sm text-white">
          Зберегти
        </button>
        {mention && (
          <button type="submit" formAction={deleteMention}
            className="rounded border border-red-300 px-5 py-2 text-sm text-red-600">
            Видалити
          </button>
        )}
      </div>
    </form>
  );
}
```

Note: the "new" route reuses `[id]/page.tsx` via the `id === "new"` sentinel, so no separate `new/page.tsx` is needed and `/admin/press/new` resolves to the empty form.

- [ ] **Step 4: Register in the sidebar**

In `src/app/(admin)/admin/_components/admin-sidebar.tsx`, add to the `content` section's `items` array (after `faq`), reusing an already-imported icon (e.g. `Newspaper` — add it to the `lucide-react` import if absent):

```ts
      { key: "press", href: "/admin/press", icon: Newspaper, countKey: "press", minRole: "marketing" },
```

If wiring the `countKey: "press"` badge requires a counts source that doesn't exist, omit `countKey` (the other items without it, e.g. `blog`, show that this is fine).

- [ ] **Step 5: Add the nav label**

In `src/app/(admin)/admin/_i18n/strings.ts`, add a `press` entry to the `nav.items` map for each locale, mirroring the existing keys, e.g. `press: "ЗМІ про нас"` (and RU/EN equivalents `"СМИ о нас"` / `"Press"`). Open the file first to match its exact shape.

- [ ] **Step 6: Typecheck + build**

Run: `npx tsc --noEmit` (expected 0), then `npm run build` (expected: succeeds).

- [ ] **Step 7: Browser check**

`npm run dev`, log into `/admin`, open `/admin/press`:
- The list shows the 10 seeded rows.
- Click `+ Додати`, paste a fresh article URL (e.g. `https://vesti.dp.ua/...`), click **Отримати дані** → publisher + all three titles + image populate. Save → returns to list and the row appears; open `/media` and confirm the new card shows.
- Open a seeded row, edit a RU title, save → the RU page (`/ru/media`) reflects it after revalidate.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(admin)/admin/press" src/app/\(admin\)/admin/_components/admin-sidebar.tsx src/app/\(admin\)/admin/_i18n/strings.ts
git commit -m "feat(media): admin /admin/press CMS with auto-fetch + translate

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Final verification + push

- [ ] **Step 1: Full typecheck + build**

Run: `npx tsc --noEmit` (expected 0) and `npm run build` (expected: succeeds, `/media` and `/admin/press` both in the route list).

- [ ] **Step 2: End-to-end sanity on the running app**

`npm run dev`. Confirm:
- `/media`, `/ru/media`, `/en/media` each render 10 cards with locale-correct H1, titles, and dates.
- Every card link has `rel="nofollow noopener noreferrer" target="_blank"` (devtools inspect).
- `<title>`/meta description on each locale match §1.3 verbatim (view-source).
- Footer "ЗМІ про нас / СМИ о нас / Media about us" link present and correct on all three locales.
- `/sitemap.xml` contains `/media` with hreflang alternates.
- Admin add-via-URL flow works end-to-end (Task 8 Step 7).

- [ ] **Step 3: Push develop**

```bash
git branch --show-current   # develop
git push origin develop
```

- [ ] **Step 4: Report + ask about main**

Summarize what shipped to the `develop` preview. Do NOT merge to `main` — per branch policy, ask the user to confirm a `develop → main` PR before shipping to production.

---

## Self-Review Notes

- **Spec coverage:** §1.1 footer → Task 7; §1.2 URL (`/media`, decided deviation) → Task 6; §1.3 metatags verbatim → Task 6; §1.4 sitemap → Task 7; §1.5 `rel="nofollow"` → Task 6 (+ verified Task 9); §2.6 materials/seed → Task 5; automation (fetch+translate) → Tasks 2, 3, 8; management CMS → Task 8; press-wall layout → Task 6. Part 2 (reviewer block) intentionally out of scope (already built).
- **Type consistency:** `MediaMentionPublic` / `MediaMentionAdmin` / `MediaMentionInput` names are stable across Tasks 4–8; `fetchMediaMeta`→`MediaMeta` (snake_case fields) is adapted to camelCase `FetchMetaResult` in Task 8's action; the form field `name=` attributes match the `formData.get(...)` keys in `saveMention`.
- **No test framework:** verification uses `tsc`/`build`/`tsx`/browser per Global Constraints; throwaway `tsx` verifiers in Tasks 2–3 are deleted before commit.
- **Known manual touch-ups:** seed titles for gorod (#6) and donga (#8) are hardcoded in Task 5 because those hosts 403-block the fetch; dpcity (#2) publisher name is hardcoded (Google-Sites page). Adjust wording against the live pages during Task 5 if needed.
