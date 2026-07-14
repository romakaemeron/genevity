# E-E-A-T Phase 1.2 — Google Reviews Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the full Google-reviews scaffold — a cache table, a source module that pulls from Google Business Profile API (preferred) or Places API (fallback), a refresh cron, a `ReviewsBlock` UI, and clinic `AggregateRating` JSON-LD — all env-gated so it ships now and renders nothing until credentials/data exist. When the pending Business Profile API access is granted, only env vars are added; no code changes.

**Architecture:** Reviews are fetched server-side into a `google_reviews` Neon table (never fetched at request time). A single source module resolves the provider by which env vars are present: GBP (full reviews, OAuth refresh-token) → Places (max 5, API key) → none. Pages read the cached rows; a cron route refreshes them. `ReviewsBlock` and the clinic `AggregateRating` render only when cached reviews exist (graceful empty state).

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Neon Postgres via raw `postgres`/`sql`, next-intl (`ui_strings`), Tailwind v4. Migrations = numbered SQL + `tsx` runner.

## Global Constraints

- **Branch:** all work on `develop`. Never `main`. Verify `git branch --show-current` before every commit.
- **External dependency is PENDING:** Business Profile API access request submitted 2026-07-13 (ID `7-4185000041581`, ~7–10 business days). GBP env vars do not exist yet. Everything here must build and run with NO reviews env set, rendering nothing. Do not block any task on live Google data.
- **Provider resolution order:** GBP (all of `GOOGLE_BP_CLIENT_ID/SECRET/REFRESH_TOKEN/ACCOUNT_ID/LOCATION_ID` present) → Places (`GOOGLE_MAPS_API_KEY` + `GOOGLE_PLACE_ID` present) → none.
- **Reviews are clinic-wide** (Google reviews attach to the business location, not a service). `google_reviews.service_id` exists for future manual tagging but is populated `NULL` in this phase.
- **Secrets:** all Google creds + `CRON_SECRET` via env only — never committed. Cron route must reject unauthenticated calls.
- **i18n:** any new UI strings go in the `ui_strings` `eeat` (or a new `reviews`) namespace, NOT JSON files. Content author names come from Google as-is (not localized).
- **No test framework exists.** Per-task verification = `npm run build`, `npm run lint`, migration runner output, and dev-server checks using temporarily-seeded fake rows (which MUST be deleted afterward — shared prod DB).
- **Commit per task**, conventional messages, footer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

### Task 1: Migration — `google_reviews` cache table

**Files:**
- Create: `scripts/migrations/016_google_reviews.sql`
- Create: `scripts/run-migration-016.ts`

**Interfaces:**
- Produces table `google_reviews` with a unique `external_id` for idempotent upserts.

- [ ] **Step 1: Migration SQL** — `scripts/migrations/016_google_reviews.sql`:
```sql
-- Migration 016: cache table for Google reviews (Business Profile API or Places
-- API). Populated server-side by a refresh job; pages read from here, never the
-- API directly. service_id reserved for future manual per-service tagging.
CREATE TABLE IF NOT EXISTS google_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL CHECK (source IN ('gbp', 'places')),
  external_id   TEXT NOT NULL UNIQUE,
  author_name   TEXT NOT NULL DEFAULT '',
  author_photo  TEXT,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT NOT NULL DEFAULT '',
  reply_text    TEXT,
  review_time   TIMESTAMPTZ,
  service_id    UUID REFERENCES services(id) ON DELETE SET NULL,
  hidden        BOOLEAN NOT NULL DEFAULT false,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS google_reviews_visible_idx
  ON google_reviews (hidden, review_time DESC);
```

- [ ] **Step 2: Runner** — `scripts/run-migration-016.ts`, mirroring `scripts/run-migration-013.ts` exactly (env loading, `sql.unsafe(...)`, an `information_schema.tables` / `information_schema.columns` verification for `google_reviews`, then exit).

- [ ] **Step 3: Run + verify**
Run: `npx tsx scripts/run-migration-016.ts` → expect success; verify the table + columns exist. Include output in the report.

- [ ] **Step 4: Commit**
```bash
git add scripts/migrations/016_google_reviews.sql scripts/run-migration-016.ts
git commit -m "feat(db): google_reviews cache table (migration 016)"
```

---

### Task 2: Read layer — reviews query + types

**Files:**
- Create: `src/lib/db/queries/reviews.ts`
- Modify: `src/lib/db/queries/index.ts` (export the new query fns, matching the file's existing re-export style)

**Interfaces:**
- Produces:
  - `type GoogleReview = { id: string; source: "gbp"|"places"; authorName: string; authorPhoto: string|null; rating: number; text: string; replyText: string|null; reviewTime: string|null }`
  - `getClinicReviews(limit?: number): Promise<GoogleReview[]>` — visible reviews (`hidden = false`), newest first.
  - `type ReviewsSummary = { count: number; average: number }`
  - `getReviewsSummary(): Promise<ReviewsSummary>` — count + average over visible reviews (average rounded to 1 decimal; `{count:0, average:0}` when none).

- [ ] **Step 1: Write `reviews.ts`**:
```ts
import { sql } from "../client";

export type GoogleReview = {
  id: string;
  source: "gbp" | "places";
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  replyText: string | null;
  reviewTime: string | null;
};

export type ReviewsSummary = { count: number; average: number };

export async function getClinicReviews(limit = 12): Promise<GoogleReview[]> {
  const rows = await sql`
    SELECT id, source, author_name, author_photo, rating, text, reply_text, review_time
    FROM google_reviews
    WHERE hidden = false
    ORDER BY review_time DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    authorName: r.author_name || "",
    authorPhoto: r.author_photo || null,
    rating: Number(r.rating),
    text: r.text || "",
    replyText: r.reply_text || null,
    reviewTime: r.review_time ? new Date(r.review_time).toISOString() : null,
  }));
}

export async function getReviewsSummary(): Promise<ReviewsSummary> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS average
    FROM google_reviews WHERE hidden = false
  `;
  const r = rows[0] || { count: 0, average: 0 };
  return { count: r.count, average: Math.round(r.average * 10) / 10 };
}
```

- [ ] **Step 2: Re-export** from `src/lib/db/queries/index.ts` following its existing pattern (open it first).

- [ ] **Step 3: Build** — `npm run build` succeeds.

- [ ] **Step 4: Commit**
```bash
git add src/lib/db/queries/reviews.ts src/lib/db/queries/index.ts
git commit -m "feat(reviews): cached-reviews read layer (getClinicReviews, getReviewsSummary)"
```

---

### Task 3: Source module — fetch + upsert (GBP → Places → none)

**Files:**
- Create: `src/lib/reviews/google.ts`

**Interfaces:**
- Consumes: `sql` from `@/lib/db/client`.
- Produces: `refreshGoogleReviews(): Promise<{ provider: "gbp"|"places"|"none"; upserted: number }>` — resolves provider by env, fetches, upserts into `google_reviews` by `external_id`, returns a summary. Never throws on "no provider configured" — returns `{provider:"none", upserted:0}`.

- [ ] **Step 1: Write `src/lib/reviews/google.ts`** with the provider resolution + both fetchers + upsert:
```ts
import { sql } from "@/lib/db/client";

type NormalizedReview = {
  source: "gbp" | "places";
  externalId: string;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  replyText: string | null;
  reviewTime: string | null; // ISO
};

function hasGbp() {
  return Boolean(
    process.env.GOOGLE_BP_CLIENT_ID && process.env.GOOGLE_BP_CLIENT_SECRET &&
    process.env.GOOGLE_BP_REFRESH_TOKEN && process.env.GOOGLE_BP_ACCOUNT_ID &&
    process.env.GOOGLE_BP_LOCATION_ID,
  );
}
function hasPlaces() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_PLACE_ID);
}

const STAR_WORD: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

async function gbpAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_BP_CLIENT_ID!,
      client_secret: process.env.GOOGLE_BP_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_BP_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`GBP token refresh failed: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

async function fetchGbp(): Promise<NormalizedReview[]> {
  const token = await gbpAccessToken();
  const url = `https://mybusiness.googleapis.com/v4/accounts/${process.env.GOOGLE_BP_ACCOUNT_ID}/locations/${process.env.GOOGLE_BP_LOCATION_ID}/reviews`;
  const out: NormalizedReview[] = [];
  let pageToken: string | undefined;
  do {
    const res = await fetch(pageToken ? `${url}?pageToken=${pageToken}` : url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`GBP reviews fetch failed: ${res.status}`);
    const json = await res.json();
    for (const rv of json.reviews ?? []) {
      out.push({
        source: "gbp",
        externalId: `gbp:${rv.reviewId}`,
        authorName: rv.reviewer?.displayName ?? "",
        authorPhoto: rv.reviewer?.profilePhotoUrl ?? null,
        rating: STAR_WORD[rv.starRating] ?? 0,
        text: rv.comment ?? "",
        replyText: rv.reviewReply?.comment ?? null,
        reviewTime: rv.createTime ?? null,
      });
    }
    pageToken = json.nextPageToken;
  } while (pageToken);
  return out.filter((r) => r.rating >= 1);
}

async function fetchPlaces(): Promise<NormalizedReview[]> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${process.env.GOOGLE_PLACE_ID}?fields=reviews`,
    { headers: { "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!, "X-Goog-FieldMask": "reviews" } },
  );
  if (!res.ok) throw new Error(`Places fetch failed: ${res.status}`);
  const json = await res.json();
  return (json.reviews ?? []).map((rv: Record<string, unknown>, i: number): NormalizedReview => ({
    source: "places",
    externalId: `places:${(rv as { name?: string }).name ?? i}`,
    authorName: (rv as { authorAttribution?: { displayName?: string } }).authorAttribution?.displayName ?? "",
    authorPhoto: (rv as { authorAttribution?: { photoUri?: string } }).authorAttribution?.photoUri ?? null,
    rating: Number((rv as { rating?: number }).rating ?? 0),
    text: ((rv as { text?: { text?: string } }).text?.text) ?? "",
    replyText: null,
    reviewTime: (rv as { publishTime?: string }).publishTime ?? null,
  })).filter((r: NormalizedReview) => r.rating >= 1);
}

async function upsert(reviews: NormalizedReview[]): Promise<number> {
  for (const r of reviews) {
    await sql`
      INSERT INTO google_reviews (source, external_id, author_name, author_photo, rating, text, reply_text, review_time, fetched_at)
      VALUES (${r.source}, ${r.externalId}, ${r.authorName}, ${r.authorPhoto}, ${r.rating}, ${r.text}, ${r.replyText}, ${r.reviewTime}, now())
      ON CONFLICT (external_id) DO UPDATE SET
        author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo,
        rating = EXCLUDED.rating, text = EXCLUDED.text, reply_text = EXCLUDED.reply_text,
        review_time = EXCLUDED.review_time, fetched_at = now()
    `;
  }
  return reviews.length;
}

export async function refreshGoogleReviews(): Promise<{ provider: "gbp" | "places" | "none"; upserted: number }> {
  if (hasGbp()) return { provider: "gbp", upserted: await upsert(await fetchGbp()) };
  if (hasPlaces()) return { provider: "places", upserted: await upsert(await fetchPlaces()) };
  return { provider: "none", upserted: 0 };
}
```
> Verify the Places API (New) field names against current docs (`X-Goog-FieldMask: reviews`, `reviews[].authorAttribution.displayName/photoUri`, `reviews[].text.text`, `reviews[].publishTime`, `reviews[].name`) before finalizing — adjust the mapping if the shape differs.

- [ ] **Step 2: Build + lint** — `npm run build` and `npx eslint src/lib/reviews/google.ts` clean (no new `any`-rule violations beyond what's unavoidable; prefer typed access as shown).

- [ ] **Step 3: Commit**
```bash
git add src/lib/reviews/google.ts
git commit -m "feat(reviews): Google source module (Business Profile API + Places fallback)"
```

---

### Task 4: Refresh cron route

**Files:**
- Create: `src/app/api/cron/refresh-reviews/route.ts`
- Modify: the Vercel cron config (find it — `vercel.json` or `vercel.ts`; the repo already has `/api/cron/revalidate-sitemap`, so mirror that route's auth + the existing cron entry)

**Interfaces:**
- Consumes: `refreshGoogleReviews` (Task 3).
- Produces: `GET /api/cron/refresh-reviews` — auth-guarded; runs the refresh; returns JSON `{ provider, upserted }`.

- [ ] **Step 1: Read the existing cron route** `src/app/api/cron/revalidate-sitemap/route.ts` to match its auth pattern (Vercel sets `Authorization: Bearer ${CRON_SECRET}` or checks a header). Reuse the exact guard.

- [ ] **Step 2: Write the route**:
```ts
import { NextResponse } from "next/server";
import { refreshGoogleReviews } from "@/lib/reviews/google";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await refreshGoogleReviews();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
```
> Match the auth guard to whatever `revalidate-sitemap` actually uses — if that route reads a different header/secret, mirror it exactly instead of the block above.

- [ ] **Step 3: Add the cron schedule** to the Vercel config next to the existing sitemap cron, e.g. daily: `{ "path": "/api/cron/refresh-reviews", "schedule": "0 4 * * *" }`.

- [ ] **Step 4: Build** — succeeds. Manually GET the route in dev (with the auth header if required) and confirm it returns `{provider:"none",upserted:0}` when no env is set.

- [ ] **Step 5: Commit**
```bash
git add src/app/api/cron/refresh-reviews/route.ts vercel.json
git commit -m "feat(reviews): cron route to refresh cached Google reviews"
```

---

### Task 5: `ReviewsBlock` UI + wiring + AggregateRating

**Files:**
- Create: `src/components/reviews/ReviewsBlock.tsx`
- Modify: the homepage composition (find where home sections render — `src/app/[locale]/page.tsx` / `src/components/home/*`) to include a clinic reviews section, data-gated
- Modify: `src/components/seo/OrganizationSchema.tsx` to add `aggregateRating` when reviews exist
- Modify: `ui_strings` (extend `scripts/seed-eeat-ui-strings.ts`) with a `reviews` heading + "based on N reviews" label (uk/ru/en)

**Interfaces:**
- Consumes: `getClinicReviews`, `getReviewsSummary` (Task 2).
- Produces: `ReviewsBlock({ reviews, summary, heading, countLabel })` — renders a star average + review cards; **returns null when `reviews.length === 0`**.

- [ ] **Step 1: Seed strings** — add to `scripts/seed-eeat-ui-strings.ts`:
```
eeat.reviewsHeading = { uk: "Відгуки пацієнтів", ru: "Отзывы пациентов", en: "Patient reviews" }
eeat.reviewsCount   = { uk: "на основі {n} відгуків Google", ru: "на основе {n} отзывов Google", en: "based on {n} Google reviews" }
```
Run the seed; verify the keys read back.

- [ ] **Step 2: Build `ReviewsBlock.tsx`** (server component; match the project's card/section styling — read a sibling like `src/components/home/Advantages.tsx` first). Render nothing when empty:
```tsx
import Image from "next/image";
import type { GoogleReview, ReviewsSummary } from "@/lib/db/queries/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} / 5`} className="text-main">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function ReviewsBlock({
  reviews, summary, heading, countLabel,
}: { reviews: GoogleReview[]; summary: ReviewsSummary; heading: string; countLabel: string }) {
  if (!reviews.length) return null;
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-block">
      <div className="mb-8">
        <h2 className="heading-2 text-black">{heading}</h2>
        <p className="body-m text-muted mt-2">
          <span className="body-strong text-main">{summary.average.toFixed(1)}</span>{" "}
          <Stars rating={summary.average} /> · {countLabel.replace("{n}", String(summary.count))}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-[var(--radius-card)] bg-champagne-dark p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {r.authorPhoto
                ? <Image src={r.authorPhoto} alt={r.authorName} width={40} height={40} className="rounded-full w-10 h-10 object-cover" unoptimized />
                : <span className="w-10 h-10 rounded-full bg-champagne-darker inline-flex items-center justify-center body-strong text-main">{r.authorName.charAt(0) || "G"}</span>}
              <div>
                <p className="body-strong text-black text-sm">{r.authorName}</p>
                <Stars rating={r.rating} />
              </div>
            </div>
            {r.text && <p className="body-m text-muted line-clamp-6">{r.text}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
```
> `unoptimized` on the Google author photo avoids configuring `next.config` remote patterns for `googleusercontent.com`; if the project already allows that host, drop it.

- [ ] **Step 3: Wire into the homepage** — in the home page/composition, fetch `getClinicReviews()` + `getReviewsSummary()`, resolve the two `eeat.reviews*` strings the way other home strings are resolved, and render `<ReviewsBlock .../>` (it self-hides when empty). Place it in a sensible spot (e.g. after doctors / before FAQ).

- [ ] **Step 4: AggregateRating** — read `OrganizationSchema.tsx`; add `aggregateRating: { "@type": "AggregateRating", ratingValue, reviewCount }` to the MedicalOrganization JSON-LD ONLY when `summary.count > 0`. Thread the summary into wherever `OrganizationSchema` is rendered (the `[locale]/layout.tsx`), fetching `getReviewsSummary()` there. Emit nothing rating-related when count is 0.

- [ ] **Step 5: Verify with fake data** — insert 3 fake rows into `google_reviews` via SQL, run `npm run dev`, confirm: the homepage section appears with stars + cards, `view-source` shows `aggregateRating` in the MedicalOrganization JSON-LD. Then DELETE the fake rows and confirm the section + aggregateRating disappear (empty state). Report both states.

- [ ] **Step 6: Build + commit**
```bash
git add src/components/reviews/ReviewsBlock.tsx src/components/seo/OrganizationSchema.tsx scripts/seed-eeat-ui-strings.ts "src/app/[locale]/page.tsx" "src/app/[locale]/layout.tsx"
git commit -m "feat(reviews): ReviewsBlock on homepage + clinic AggregateRating JSON-LD"
```

---

## Self-Review

**Spec coverage (§1.2):** cache table (T1) ✓; source module GBP+Places behind one interface (T3) ✓; refresh via cron (T4) ✓; ReviewsBlock + aggregate rating (T5) ✓; clinic AggregateRating fed by real data (T5) ✓. Admin read-only moderation list + hide toggle: **deferred** (the `hidden` column exists; note as follow-up — not needed for the scaffold to ship).

**Env-gated / ships-now:** every task builds and renders with no reviews env and no rows (empty state), satisfying the "ship before Google approves" constraint.

**Placeholder scan:** network mappings for GBP (v4) and Places (New) are real but flagged for a docs re-check in T3; no vague "handle errors" — the cron catches and returns 500, the module returns `{none,0}` when unconfigured.

**Type consistency:** `GoogleReview`/`ReviewsSummary` defined in T2 are consumed unchanged in T5; `refreshGoogleReviews` return shape (T3) is what the cron route (T4) serializes.

## Follow-ups (post-scaffold, when access granted)
- Add `GOOGLE_BP_*` (or `GOOGLE_MAPS_API_KEY`+`GOOGLE_PLACE_ID` to demo now) to Vercel env → the module goes live with zero code change.
- Admin moderation UI (hide/show, view replies) under `admin/reviews`.
- Optional per-service review tagging via `google_reviews.service_id` + a service-page `ReviewsBlock`.
