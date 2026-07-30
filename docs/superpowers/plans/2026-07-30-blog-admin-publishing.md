# Blog Admin Publishing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make publishing a blog post from the admin panel production-grade — authenticated, validated, errors visible, changes live immediately, drafts previewable, slug auto-generated, RU/EN auto-translated.

**Architecture:** All work is server actions in `src/app/(admin)/admin/blog/` plus queries in `src/lib/db/queries/blog.ts`. Validation lives in a dedicated zod schema module so the action stays thin. Cache invalidation is centralised in one helper reused by both the action and the existing `/api/revalidate` endpoint. Draft preview uses Next.js Draft Mode, gated behind the existing admin JWT session.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Neon Postgres via `postgres`/`@neondatabase/serverless`, zod, Tiptap, `ai` SDK + `@ai-sdk/openai`, next-intl.

**Spec:** `docs/superpowers/specs/2026-07-30-blog-admin-publishing-design.md`

## Global Constraints

- **Branch:** all work on `develop`. Never commit or push to `main`. Verify with `git branch --show-current` before every commit.
- **The public blog stays hidden on production.** Do NOT touch the `IS_PRODUCTION` gate in `src/app/[locale]/(pages)/blog/page.tsx:11` or `src/app/[locale]/(pages)/blog/[slug]/page.tsx:24`.
- **Scheduled publishing is out of scope.** No cron, no background job. A future `published_at` on a published post is a validation error.
- **Locale mapping:** the URL locale is `ua`, the DB column suffix is `uk`. `lang()` in `src/lib/db/queries/blog.ts:5` does this conversion. Locales are `ua` (default, no URL prefix), `ru`, `en`.
- **Admin i18n:** `src/app/(admin)/admin/_i18n/strings.ts` contains three parallel copies of the whole string tree (uk ≈ line 330, ru ≈ line 708, en ≈ line 1086). Every new key MUST be added to all three, or TypeScript fails the build.
- **No test runtime exists in this project** (`package.json` has only `dev`/`build`/`start`/`lint`). Verification is: `npx tsc --noEmit`, `npm run lint`, `npm run build`, plus purpose-built `scripts/check-*.ts` scripts run with `npx tsx` against the real database — this matches the existing convention (`scripts/check-services.ts`, `scripts/check-legal.ts`, …).
- **Database access from scripts:** read `.env.local` for `DATABASE_URL`. Follow the exact pattern in `scripts/run-migration-019.ts`.
- **Migration convention:** SQL in `scripts/migrations/NNN_name.sql`, runner in `scripts/run-migration-NNN.ts`. Latest applied is 019.
- **Caching model:** Next.js 16.1.6 with `cacheComponents` **disabled** in `next.config.ts`. This is classic ISR — `export const revalidate = N` plus `revalidatePath`. Do NOT introduce `use cache`, `cacheLife`, `cacheTag` or `updateTag`; they require the Cache Components flag and would be a project-wide migration, which is out of scope.
- **zod is v4.4.3.** Use `z.looseObject({...})` (not the deprecated `.passthrough()`) and `z.uuid()` (not the deprecated `z.string().uuid()`).

---

### Task 1: Unique slug index

Two posts sharing a slug silently break `/blog/[slug]` (the query does `LIMIT 1` and picks an arbitrary row). The database must reject the duplicate so the admin can report it.

**Files:**
- Create: `scripts/migrations/020_blog_slug_unique.sql`
- Create: `scripts/run-migration-020.ts`
- Create: `scripts/check-blog-slugs.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a unique index named `blog_posts_slug_key`, so `INSERT`/`UPDATE` with a duplicate slug raises Postgres error code `23505`. Task 3 relies on that code.

- [ ] **Step 1: Write the duplicate-audit script**

The migration must not run blind — if duplicates already exist, `CREATE UNIQUE INDEX` fails with an unhelpful message. This script reports them first.

Create `scripts/check-blog-slugs.ts`:

```ts
/**
 * Report duplicate blog slugs and whether the unique index exists.
 * Run: npx tsx scripts/check-blog-slugs.ts
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
  const dupes = await sql`
    SELECT slug, COUNT(*)::int AS n, array_agg(id::text) AS ids
    FROM blog_posts GROUP BY slug HAVING COUNT(*) > 1 ORDER BY slug`;
  if (dupes.length === 0) {
    console.log("✓ no duplicate slugs");
  } else {
    console.log(`✗ ${dupes.length} duplicated slug(s):`);
    for (const d of dupes) console.log(`  ${d.slug} ×${d.n} → ${d.ids.join(", ")}`);
  }

  const idx = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'blog_posts' AND indexname = 'blog_posts_slug_key'`;
  console.log(idx.length ? "✓ blog_posts_slug_key exists" : "· blog_posts_slug_key not created yet");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run it — expect no index yet**

Run: `npx tsx scripts/check-blog-slugs.ts`
Expected: `· blog_posts_slug_key not created yet`.

If it reports duplicates, **stop and resolve them by hand** (rename the newer post's slug in the admin) before continuing. Do not delete rows.

- [ ] **Step 3: Write the migration SQL**

Create `scripts/migrations/020_blog_slug_unique.sql`:

```sql
-- Blog slugs address a public URL (/blog/<slug>) and must be unique.
-- Table is small (tens of rows), so a plain (non-CONCURRENTLY) index is fine.
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_key ON blog_posts (slug);
```

- [ ] **Step 4: Write the migration runner**

Create `scripts/run-migration-020.ts`:

```ts
/**
 * Add a unique index on blog_posts.slug.
 * Run: npx tsx scripts/run-migration-020.ts
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
  const dupes = await sql`
    SELECT slug FROM blog_posts GROUP BY slug HAVING COUNT(*) > 1`;
  if (dupes.length) {
    console.error(`✗ refusing to run: ${dupes.length} duplicate slug(s). Fix them first:`);
    for (const d of dupes) console.error(`  ${d.slug}`);
    process.exit(1);
  }

  const migration = fs.readFileSync(
    path.resolve(__dirname, "migrations/020_blog_slug_unique.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 020 applied: blog_posts_slug_key created");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 5: Apply and verify**

Run: `npx tsx scripts/run-migration-020.ts && npx tsx scripts/check-blog-slugs.ts`
Expected: `✓ Migration 020 applied` then `✓ no duplicate slugs` and `✓ blog_posts_slug_key exists`.

- [ ] **Step 6: Verify the constraint actually rejects a duplicate**

Run this one-off check (it inserts nothing permanently — the transaction is rolled back):

```bash
npx tsx -e "
import postgres from 'postgres'; import * as fs from 'fs';
const env: Record<string,string> = {};
fs.readFileSync('.env.local','utf-8').split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&v.length)env[k.trim()]=v.join('=').trim()});
const sql = postgres(env.DATABASE_URL!);
(async () => {
  const [{ slug }] = await sql\`SELECT slug FROM blog_posts LIMIT 1\`;
  try {
    await sql.begin(async t => {
      await t\`INSERT INTO blog_posts (slug, title_uk) VALUES (\${slug}, 'dup test')\`;
      throw new Error('should not reach here');
    });
    console.log('✗ duplicate was accepted — index missing');
  } catch (e: any) {
    console.log(e.code === '23505' ? '✓ duplicate rejected with 23505' : '✗ unexpected: ' + e.code + ' ' + e.message);
  }
  await sql.end();
})();
"
```

Expected: `✓ duplicate rejected with 23505`.

- [ ] **Step 7: Commit**

```bash
git branch --show-current   # must print: develop
git add scripts/migrations/020_blog_slug_unique.sql scripts/run-migration-020.ts scripts/check-blog-slugs.ts
git commit -m "feat(blog): unique index on blog_posts.slug"
```

---

### Task 2: Validation schema

Pure, dependency-free input parsing, isolated from the action so it is easy to reason about and to exercise from a script.

**Files:**
- Create: `src/app/(admin)/admin/blog/_schema.ts`
- Create: `scripts/check-blog-schema.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `SLUG_RE: RegExp`
  - `type BlogPostInput` — the parsed, normalised post payload
  - `parseBlogPostForm(formData: FormData, coverImage: string): { ok: true; data: BlogPostInput } | { ok: false; error: string }`

  `coverImage` is passed in rather than read from `formData` because the upload pipeline resolves it asynchronously before validation runs (Task 3).

- [ ] **Step 1: Write the schema module**

Create `src/app/(admin)/admin/blog/_schema.ts`:

```ts
import { z } from "zod";

/** Lowercase words joined by single hyphens: "botox-vs-dysport". */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const csv = (v: FormDataEntryValue | null) =>
  String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

// z.looseObject = the v4 replacement for the deprecated .passthrough():
// unknown keys (the RU/EN fields, tags, SEO, …) pass through untouched, while
// the keys listed here are validated.
const schema = z.looseObject({
  id: z.uuid().optional(),
  slug: z.string().min(1, "Вкажіть slug").max(120, "Slug задовгий (максимум 120 символів)")
    .regex(SLUG_RE, "Slug може містити лише малі латинські літери, цифри та дефіси"),
  titleUk: z.string().min(1, "Заголовок UK обов'язковий"),
  readTimeMinutes: z.number().int().min(1).max(120),
  isDraft: z.boolean(),
  /** ISO string or null. Validated against isDraft in refine below. */
  publishedAt: z.string().nullable(),
}).refine(
  (d) => d.isDraft || !d.publishedAt || new Date(d.publishedAt).getTime() <= Date.now(),
  { message: "Заплановану публікацію не підтримано: вкажіть поточну або минулу дату, або збережіть як чернетку" },
);

export interface BlogPostInput {
  id?: string;
  slug: string;
  categoryId: string | null;
  authorId: string | null;
  titleUk: string; titleRu: string; titleEn: string;
  excerptUk: string; excerptRu: string; excerptEn: string;
  bodyUk: string; bodyRu: string; bodyEn: string;
  coverImage: string;
  tags: string[];
  relatedServiceSlugs: string[];
  isDraft: boolean;
  publishedAt: string | null;
  seoTitleUk: string; seoTitleRu: string; seoTitleEn: string;
  seoDescUk: string; seoDescRu: string; seoDescEn: string;
  readTimeMinutes: number;
  authorName: string;
  authorAvatar: string;
  reviewerDoctorId: string | null;
  lastReviewedAt: string | null;
}

/**
 * Parse and normalise the admin blog form.
 *
 * Normalisation rules:
 *   - slug is lowercased and trimmed before validation (a stray capital is a
 *     typo, not an error worth blocking on);
 *   - a published post with no date gets "now" — an empty published_at would
 *     make the post invisible, since the public query filters published_at <= NOW();
 *   - a draft keeps whatever date it has (drafts are never date-filtered).
 */
export function parseBlogPostForm(
  formData: FormData,
  coverImage: string,
): { ok: true; data: BlogPostInput } | { ok: false; error: string } {
  const id = str(formData.get("id"));
  const isDraft = formData.get("isDraft") === "true";
  const rawDate = str(formData.get("publishedAt"));

  let publishedAt: string | null = rawDate ? new Date(rawDate).toISOString() : null;
  if (rawDate && Number.isNaN(new Date(rawDate).getTime())) {
    return { ok: false, error: "Некоректна дата публікації" };
  }
  if (!isDraft && !publishedAt) publishedAt = new Date().toISOString();

  const candidate = {
    id: id || undefined,
    slug: str(formData.get("slug")).toLowerCase(),
    categoryId: str(formData.get("categoryId")) || null,
    authorId: str(formData.get("authorId")) || null,
    titleUk: str(formData.get("titleUk")),
    titleRu: str(formData.get("titleRu")),
    titleEn: str(formData.get("titleEn")),
    excerptUk: str(formData.get("excerptUk")),
    excerptRu: str(formData.get("excerptRu")),
    excerptEn: str(formData.get("excerptEn")),
    bodyUk: String(formData.get("bodyUk") ?? ""),
    bodyRu: String(formData.get("bodyRu") ?? ""),
    bodyEn: String(formData.get("bodyEn") ?? ""),
    coverImage,
    tags: csv(formData.get("tags")),
    relatedServiceSlugs: csv(formData.get("relatedServiceSlugs")),
    isDraft,
    publishedAt,
    seoTitleUk: str(formData.get("seoTitleUk")),
    seoTitleRu: str(formData.get("seoTitleRu")),
    seoTitleEn: str(formData.get("seoTitleEn")),
    seoDescUk: str(formData.get("seoDescUk")),
    seoDescRu: str(formData.get("seoDescRu")),
    seoDescEn: str(formData.get("seoDescEn")),
    readTimeMinutes: Number.parseInt(str(formData.get("readTimeMinutes")), 10) || 5,
    authorName: str(formData.get("authorName")),
    authorAvatar: str(formData.get("authorAvatar")),
    reviewerDoctorId: str(formData.get("reviewer_doctor_id")) || null,
    lastReviewedAt: str(formData.get("last_reviewed_at")) || null,
  };

  const parsed = schema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некоректні дані форми" };
  }
  return { ok: true, data: candidate };
}
```

- [ ] **Step 2: Write the schema check script**

Create `scripts/check-blog-schema.ts`:

```ts
/**
 * Exercise parseBlogPostForm against the cases that matter.
 * Run: npx tsx scripts/check-blog-schema.ts
 */
import { parseBlogPostForm } from "../src/app/(admin)/admin/blog/_schema";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

const base = { slug: "my-post", titleUk: "Заголовок", readTimeMinutes: "5", isDraft: "false" };
let failures = 0;
function check(name: string, cond: boolean) {
  console.log(cond ? `✓ ${name}` : `✗ ${name}`);
  if (!cond) failures++;
}

const ok = parseBlogPostForm(fd({ ...base, publishedAt: "2026-01-01T10:00" }), "");
check("valid post parses", ok.ok === true);
check("published date kept", ok.ok && ok.data.publishedAt!.startsWith("2026-01-01"));

const noDate = parseBlogPostForm(fd({ ...base }), "");
check("published without date gets now", noDate.ok === true && noDate.data.publishedAt !== null);

const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);
const fut = parseBlogPostForm(fd({ ...base, publishedAt: future }), "");
check("future date on published post rejected", fut.ok === false);

const futDraft = parseBlogPostForm(fd({ ...base, isDraft: "true", publishedAt: future }), "");
check("future date allowed on draft", futDraft.ok === true);

const badSlug = parseBlogPostForm(fd({ ...base, slug: "Мій Пост!" }), "");
check("cyrillic/space slug rejected", badSlug.ok === false);

const upper = parseBlogPostForm(fd({ ...base, slug: "My-Post" }), "");
check("uppercase slug normalised", upper.ok === true && upper.data.slug === "my-post");

const noTitle = parseBlogPostForm(fd({ ...base, titleUk: "  " }), "");
check("empty UK title rejected", noTitle.ok === false);

const tags = parseBlogPostForm(fd({ ...base, tags: " ботокс , , омолодження " }), "");
check("tags trimmed and emptied", tags.ok === true && tags.data.tags.length === 2);

process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 3: Run it — expect all green**

Run: `npx tsx scripts/check-blog-schema.ts`
Expected: eight `✓` lines, exit code 0. Fix `_schema.ts` until they pass.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must print: develop
git add "src/app/(admin)/admin/blog/_schema.ts" scripts/check-blog-schema.ts
git commit -m "feat(blog): zod validation schema for admin post form"
```

---

### Task 3: Authenticated action with visible errors

`savePost`/`deletePost` are public HTTP endpoints today — no session check at all. This task closes that and stops swallowing failures.

**Files:**
- Modify: `src/app/(admin)/admin/blog/_actions.ts` (whole file)
- Modify: `src/lib/db/queries/blog.ts:170-230` (`adminSavePost` error handling)
- Modify: `src/app/(admin)/admin/blog/[id]/_form.tsx` (form wiring + error banner)
- Modify: `src/app/(admin)/admin/_i18n/strings.ts` (three copies)

**Interfaces:**
- Consumes: `parseBlogPostForm`, `BlogPostInput` (Task 2); `blog_posts_slug_key` → error `23505` (Task 1); `requireSession()` from `src/app/(admin)/admin/_actions/auth.ts`.
- Produces:
  - `savePost(prevState: BlogActionState, formData: FormData): Promise<BlogActionState>` where `type BlogActionState = { error?: string } | null`
  - `deletePost(id: string): Promise<void>` (still redirects)

- [ ] **Step 1: Make the query return a typed duplicate error**

In `src/lib/db/queries/blog.ts`, replace the `catch` at the end of `adminSavePost`:

```ts
  } catch (e) { return { ok: false, error: String(e) }; }
```

with:

```ts
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "23505") {
      return { ok: false, error: "duplicate_slug" };
    }
    console.error("adminSavePost failed:", e);
    return { ok: false, error: "save_failed" };
  }
```

The action maps these codes to user-facing text, so the DB layer stays language-agnostic and never leaks a raw SQL string into the UI.

- [ ] **Step 2: Rewrite the action**

Replace the whole of `src/app/(admin)/admin/blog/_actions.ts`:

```ts
"use server";
import { adminSavePost, adminDeletePost } from "@/lib/db/queries/blog";
import { requireSession } from "../_actions/auth";
import { processUploadOrKeep } from "../_actions/upload";
import { parseBlogPostForm } from "./_schema";
import { redirect } from "next/navigation";

export type BlogActionState = { error?: string } | null;

const ERRORS: Record<string, string> = {
  duplicate_slug: "Стаття з таким slug уже існує — оберіть інший",
  save_failed: "Не вдалося зберегти статтю. Спробуйте ще раз",
};

export async function savePost(
  _prevState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requireSession();

  const coverFile = formData.get("coverImage") as File | null;
  const coverCurrent = (formData.get("coverImage_current") as string) || undefined;
  const coverImage = await processUploadOrKeep(
    coverFile && coverFile.size > 0 ? coverFile : null,
    "blog",
    coverCurrent,
  );

  const parsed = parseBlogPostForm(formData, coverImage || "");
  if (!parsed.ok) return { error: parsed.error };

  const result = await adminSavePost(parsed.data);
  if (!result.ok) {
    return { error: ERRORS[result.error ?? ""] ?? ERRORS.save_failed };
  }

  // redirect() throws a control-flow signal — it must sit outside any try/catch
  // above, or it would be swallowed and reported as a save failure.
  redirect(`/admin/blog/${result.id}?saved=1`);
}

export async function deletePost(id: string) {
  await requireSession();
  await adminDeletePost(id);
  redirect("/admin/blog");
}
```

Revalidation is deliberately absent here — Task 4 adds it in one place.

- [ ] **Step 3: Wire the form to `useActionState`**

In `src/app/(admin)/admin/blog/[id]/_form.tsx`:

Add `useActionState` to the React import:

```ts
import { useActionState, useRef, useState } from "react";
```

Inside `BlogPostForm`, after `const p = post || {};`, add:

```tsx
  const [state, formAction] = useActionState(savePost, null as any);
```

Change the form element from `<form action={savePost} …>` to:

```tsx
      <form action={formAction} className="flex flex-col gap-6">
```

Then replace the submit row at the bottom of the form:

```tsx
        <div className="flex items-center gap-4">
          <SubmitBtn isNew={isNew} />
```

with:

```tsx
        {state?.error && (
          <div className="p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>
        )}

        <div className="flex items-center gap-4">
          <SubmitBtn isNew={isNew} />
```

- [ ] **Step 4: Guard the delete button**

Still in `_form.tsx`, the delete button calls `deletePost(p.id)` from an `onClick`. That is fine — the action now checks the session server-side. No change needed, but confirm the call still typechecks after the signature change (it does: `deletePost` kept its `(id: string)` shape).

- [ ] **Step 5: Typecheck, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass. `useActionState` with a `null as any` initial state matches the existing pattern in `src/app/(admin)/admin/pages/_components/page-form.tsx:74`.

- [ ] **Step 6: Verify the auth hole is closed**

Start the dev server (`npm run dev`), then from a shell with **no admin cookie**:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/admin/blog/new \
  -H "Next-Action: probe" -H "Content-Type: multipart/form-data"
```

Expected: a non-2xx status or a redirect to `/admin/login` — not a successful save. Then confirm in the admin UI (logged in) that saving still works and that saving a post with an existing slug shows the red banner "Стаття з таким slug уже існує" without losing the entered text.

- [ ] **Step 7: Commit**

```bash
git branch --show-current   # must print: develop
git add "src/app/(admin)/admin/blog/_actions.ts" "src/app/(admin)/admin/blog/[id]/_form.tsx" src/lib/db/queries/blog.ts
git commit -m "fix(blog): require admin session and surface save errors"
```

---

### Task 4: Working cache invalidation

`revalidatePath('/blog')` does not invalidate `/[locale]/(pages)/blog` — the `[locale]` segment is dynamic, so Next.js needs the route pattern, not a concrete URL. This is why saved posts did not appear.

**Files:**
- Create: `src/lib/revalidate-blog.ts`
- Modify: `src/app/(admin)/admin/blog/_actions.ts`
- Modify: `src/app/api/revalidate/route.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `revalidateBlog(): void` — invalidates the blog index, every post page (all locales), the admin list and the sitemap.

- [ ] **Step 1: Write the helper**

Create `src/lib/revalidate-blog.ts`:

```ts
import { revalidatePath } from "next/cache";

/**
 * Drop the ISR cache for every blog surface.
 *
 * The public blog lives at `src/app/[locale]/(pages)/blog/...`, so its route
 * has a dynamic `[locale]` segment. `revalidatePath('/blog')` — a concrete URL —
 * does not match a dynamic route; the route-pattern form with type 'page' does,
 * and it covers all three locales in one call.
 */
export function revalidateBlog() {
  revalidatePath("/[locale]/blog", "page");
  revalidatePath("/[locale]/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemap-images.xml");
  revalidatePath("/admin/blog");
}
```

- [ ] **Step 2: Call it from the action**

In `src/app/(admin)/admin/blog/_actions.ts`, add the import:

```ts
import { revalidateBlog } from "@/lib/revalidate-blog";
```

In `savePost`, after the successful `adminSavePost` result and **before** `redirect(...)`:

```ts
  revalidateBlog();
```

In `deletePost`, after `adminDeletePost(id)` and before `redirect("/admin/blog")`:

```ts
  revalidateBlog();
```

- [ ] **Step 3: Add the entity to the revalidate endpoint**

In `src/app/api/revalidate/route.ts`:

Add `"blogPost"` to the `Entity` union:

```ts
type Entity =
  | "service"
  | "serviceCategory"
  | "staticPage"
  | "doctor"
  | "priceItem"
  | "priceCategory"
  | "navigation"
  | "siteSettings"
  | "blogPost";
```

`pathsForEntity` returns concrete URL strings, which is the wrong shape for the blog's dynamic route. So handle the blog before that loop instead. In `POST`, right after `const entity = body.entity ?? body._type;`, add:

```ts
    if (entity === "blogPost") {
      revalidateBlog();
      return NextResponse.json({ revalidated: true, scope: "blog", now: Date.now() });
    }
```

and import the helper at the top:

```ts
import { revalidateBlog } from "@/lib/revalidate-blog";
```

Add `case "blogPost": return [];` to the `pathsForEntity` switch so the union stays exhaustive for TypeScript.

- [ ] **Step 4: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: pass.

- [ ] **Step 5: Verify invalidation empirically — this is the crux of the task**

Do not accept this on theory. On a running build (`npm run build && npm start`, so ISR is real — `npm run dev` does not cache the same way):

1. Open `http://localhost:3000/blog` and note the posts shown.
2. In the admin, edit a published post's title and save.
3. Reload `/blog` and `/blog/<slug>` — the new title must appear **immediately**, and likewise on `/ru/blog` and `/en/blog`.

If it does **not** update, the route-pattern form is not matching. Fall back in this order, re-testing each time, and leave a comment in `revalidate-blog.ts` recording what actually worked:
  a. add `revalidatePath("/[locale]/blog", "layout")`;
  b. add the concrete per-locale paths as well (`/blog`, `/ru/blog`, `/en/blog` and the same for `/blog/<slug>`) — the helper can take an optional `slug` argument for this;
  c. as a last resort, drop `export const revalidate = 86400` to a short window on the blog routes only.

- [ ] **Step 6: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/revalidate-blog.ts "src/app/(admin)/admin/blog/_actions.ts" src/app/api/revalidate/route.ts
git commit -m "fix(blog): invalidate ISR with route patterns so saves go live"
```

---

### Task 5: Draft preview

**Files:**
- Create: `src/app/api/admin/preview/route.ts`
- Create: `src/app/api/admin/preview/exit/route.ts`
- Create: `src/components/blog/PreviewBanner.tsx`
- Modify: `src/lib/db/queries/blog.ts` (`getBlogPostBySlug`)
- Modify: `src/app/[locale]/(pages)/blog/[slug]/page.tsx`
- Modify: `src/app/(admin)/admin/blog/[id]/_form.tsx`
- Modify: `src/app/(admin)/admin/_i18n/strings.ts` (three copies)

**Interfaces:**
- Consumes: `getSession()` from `src/app/(admin)/admin/_actions/auth.ts`.
- Produces:
  - `getBlogPostBySlug(locale: string, slug: string, opts?: { includeDrafts?: boolean }): Promise<BlogPost | null>` — third parameter is new and optional, so existing call sites are unaffected.
  - `GET /api/admin/preview?id=<uuid>` → enables Draft Mode, 307 to `/blog/<slug>`
  - `GET /api/admin/preview/exit?id=<uuid>` → disables it, 307 back to the editor

- [ ] **Step 1: Let the query return drafts on request**

In `src/lib/db/queries/blog.ts`, replace `getBlogPostBySlug` with:

```ts
export async function getBlogPostBySlug(
  locale: string,
  slug: string,
  opts: { includeDrafts?: boolean } = {},
): Promise<BlogPost | null> {
  const l = lang(locale);
  const rows = opts.includeDrafts
    ? await sql`
        SELECT bp.*, bc.slug as cat_slug, bc.title_uk as cat_title_uk, bc.title_ru as cat_title_ru, bc.title_en as cat_title_en,
               d.name_uk as doctor_name_uk, d.name_ru as doctor_name_ru, d.name_en as doctor_name_en, d.slug as author_slug,
               COALESCE(d.photo_circle, d.photo_card) as doctor_avatar,
               d.circle_focal_point as doctor_focal_point, d.circle_scale as doctor_scale
        FROM blog_posts bp
        LEFT JOIN blog_categories bc ON bc.id = bp.category_id
        LEFT JOIN doctors d ON d.id = bp.author_id
        WHERE bp.slug = ${slug}
        LIMIT 1`
    : await sql`
        SELECT bp.*, bc.slug as cat_slug, bc.title_uk as cat_title_uk, bc.title_ru as cat_title_ru, bc.title_en as cat_title_en,
               d.name_uk as doctor_name_uk, d.name_ru as doctor_name_ru, d.name_en as doctor_name_en, d.slug as author_slug,
               COALESCE(d.photo_circle, d.photo_card) as doctor_avatar,
               d.circle_focal_point as doctor_focal_point, d.circle_scale as doctor_scale
        FROM blog_posts bp
        LEFT JOIN blog_categories bc ON bc.id = bp.category_id
        LEFT JOIN doctors d ON d.id = bp.author_id
        WHERE bp.slug = ${slug} AND bp.is_draft = false AND bp.published_at <= NOW()
        LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0];
  const reviewer = await getReviewer(r.reviewer_doctor_id as string | null, l);
  return {
    ...mapCard(r, l),
    body: pick(r, 'body', l),
    seoTitle: pick(r, 'seo_title', l),
    seoDesc: pick(r, 'seo_desc', l),
    ogImage: r.seo_og_image as string | null,
    relatedServiceSlugs: (r.related_service_slugs as string[]) || [],
    reviewer,
    lastReviewedAt: r.last_reviewed_at ? new Date(r.last_reviewed_at as string).toISOString().slice(0, 10) : null,
  };
}
```

The two branches are written out rather than composed because the `sql` tagged-template client does not accept an interpolated WHERE fragment — this mirrors how `getBlogPosts` above already handles its optional filter.

- [ ] **Step 2: Write the preview-enable route**

Create `src/app/api/admin/preview/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getSession } from "@/app/(admin)/admin/_actions/auth";
import { adminGetPostById } from "@/lib/db/queries/blog";

/**
 * Enable Next.js Draft Mode for an admin editor and send them to the article.
 *
 * Gated on the admin JWT session — without it, anyone holding a post id could
 * mint a draft-mode cookie and read unpublished content.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const post = await adminGetPostById(id);
  if (!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`/blog/${post.slug}`, req.url));
}
```

- [ ] **Step 3: Write the preview-exit route**

Create `src/app/api/admin/preview/exit/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

/** Turn Draft Mode off and return to the editor (or the blog index). */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const id = req.nextUrl.searchParams.get("id");
  return NextResponse.redirect(new URL(id ? `/admin/blog/${id}` : "/blog", req.url));
}
```

- [ ] **Step 4: Write the preview banner**

Create `src/components/blog/PreviewBanner.tsx`:

```tsx
import { Eye } from "lucide-react";

const L: Record<string, { label: string; exit: string }> = {
  ua: { label: "Режим передперегляду — цю сторінку не опубліковано", exit: "Вийти" },
  ru: { label: "Режим предпросмотра — страница не опубликована", exit: "Выйти" },
  en: { label: "Preview mode — this page is not published", exit: "Exit" },
};

export default function PreviewBanner({ locale, postId }: { locale: string; postId: string }) {
  const t = L[locale] ?? L.ua;
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-main px-4 py-2 text-white text-sm">
      <Eye size={14} />
      <span>{t.label}</span>
      <a href={`/api/admin/preview/exit?id=${postId}`} className="underline underline-offset-2">
        {t.exit}
      </a>
    </div>
  );
}
```

- [ ] **Step 5: Use Draft Mode on the article page**

In `src/app/[locale]/(pages)/blog/[slug]/page.tsx`:

Add imports:

```ts
import { draftMode } from "next/headers";
import PreviewBanner from "@/components/blog/PreviewBanner";
```

In `BlogPostPage`, replace:

```ts
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(locale, slug);
  if (!post) notFound();
```

with:

```ts
  const { locale, slug } = await params;
  const isPreview = (await draftMode()).isEnabled;
  const post = await getBlogPostBySlug(locale, slug, { includeDrafts: isPreview });
  if (!post) notFound();
```

Then render the banner as the first element of the returned JSX, immediately before `<MegaMenuHeader …>`:

```tsx
      {isPreview && <PreviewBanner locale={locale} postId={post._id} />}
```

Do the same in `generateMetadata` so a preview of a draft does not render empty tags:

```ts
  const post = await getBlogPostBySlug(locale, slug, {
    includeDrafts: (await draftMode()).isEnabled,
  });
```

Reading `draftMode()` makes the route dynamic for that request only; the static generation of published posts via `generateStaticParams` is unchanged.

- [ ] **Step 6: Add the preview button to the editor**

In `src/app/(admin)/admin/blog/[id]/_form.tsx`, in the header row next to the delete button, add (only for saved posts — a new post has no id yet):

```tsx
        {!isNew && (
          <a
            href={`/api/admin/preview?id=${p.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-main hover:underline mr-4"
          >
            {t.blogForm.preview}
          </a>
        )}
```

Add the `preview` key to `blogForm` in **all three** copies in `src/app/(admin)/admin/_i18n/strings.ts`:
- uk: `preview: "Переглянути",`
- ru: `preview: "Просмотреть",`
- en: `preview: "Preview",`

- [ ] **Step 7: Typecheck, lint, build — and check the route did NOT go dynamic**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass.

Then read the route table Next.js prints at the end of the build. `/[locale]/blog/[slug]` must still be marked as prerendered/ISR (`●` or `◐`), **not** dynamic (`ƒ`). Reading `draftMode()` can opt a route into dynamic rendering — if that happened here, every blog article would be server-rendered on each request, undoing the caching the rest of this plan depends on.

If the route did flip to `ƒ`, do not accept it. Fall back to rendering the preview from an admin-only route instead:
- create `src/app/(admin)/admin/blog/[id]/preview/page.tsx`, which calls `requireSession()`, loads the post with `adminGetPostById`, and renders the same article markup;
- extract the article body markup from `src/app/[locale]/(pages)/blog/[slug]/page.tsx` into a shared component so both routes render identically and cannot drift;
- revert the `draftMode()` changes to the public page and to `generateMetadata`, and drop the two `/api/admin/preview` routes;
- keep `getBlogPostBySlug`'s `includeDrafts` option — the admin route uses it.

Record in the commit message which of the two paths was taken.

- [ ] **Step 8: Verify the preview flow**

With `npm run build && npm start`:

1. Create a post, leave it as **Чернетка**, save.
2. Open `/blog` — it must NOT be listed. Open `/blog/<slug>` directly — 404.
3. In the editor click **Переглянути** — the article renders in the real template with the banner on top.
4. Click **Вийти** in the banner — back in the editor; `/blog/<slug>` is 404 again.
5. In a private window (no admin cookie) open `/api/admin/preview?id=<uuid>` — must redirect to `/admin/login`, and `/blog/<slug>` must stay 404.

- [ ] **Step 9: Commit**

```bash
git branch --show-current   # must print: develop
git add src/app/api/admin/preview src/components/blog/PreviewBanner.tsx src/lib/db/queries/blog.ts "src/app/[locale]/(pages)/blog/[slug]/page.tsx" "src/app/(admin)/admin/blog/[id]/_form.tsx" "src/app/(admin)/admin/_i18n/strings.ts"
git commit -m "feat(blog): draft preview via Next.js Draft Mode"
```

---

### Task 6: Auto-slug from the Ukrainian title

**Files:**
- Create: `src/lib/slugify-uk.ts`
- Create: `scripts/check-slugify.ts`
- Modify: `src/app/(admin)/admin/blog/[id]/_form.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `slugifyUk(input: string): string` — output always matches `SLUG_RE` from Task 2, or is `""`.

- [ ] **Step 1: Write the transliterator**

Create `src/lib/slugify-uk.ts`:

```ts
/**
 * Ukrainian → Latin slug, following the official transliteration
 * (Cabinet of Ministers of Ukraine resolution No. 55, 2010), lowercased.
 *
 * Output always matches /^[a-z0-9]+(?:-[a-z0-9]+)*$/ or is "".
 */
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh",
  з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu", я: "ia", "'": "", "’": "",
  // Russian-only letters, in case a title is pasted in RU
  ё: "e", ъ: "", ы: "y", э: "e",
};

/** Digraphs that take a different form word-initially, per the same resolution. */
const INITIAL: Record<string, string> = {
  є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya",
};

export function slugifyUk(input: string): string {
  const lower = input.toLowerCase().trim();
  let out = "";
  let atWordStart = true;

  for (const ch of lower) {
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      atWordStart = false;
    } else if (MAP[ch] !== undefined) {
      out += (atWordStart && INITIAL[ch]) || MAP[ch];
      atWordStart = false;
    } else {
      out += "-";
      atWordStart = true;
    }
  }

  return out.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120).replace(/-$/, "");
}
```

- [ ] **Step 2: Write the check script**

Create `scripts/check-slugify.ts`:

```ts
/**
 * Verify slugifyUk output shape.
 * Run: npx tsx scripts/check-slugify.ts
 */
import { slugifyUk } from "../src/lib/slugify-uk";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const cases: [string, string][] = [
  ["Ботокс чи диспорт: що обрати?", "botoks-chy-dysport-shcho-obraty"],
  ["Їжа для довголіття", "yizha-dlia-dovholittia"],
  ["  Подвійні   пробіли  ", "podviini-probily"],
  ["Anti-age 2026", "anti-age-2026"],
  ["!!!", ""],
];

let failures = 0;
for (const [input, expected] of cases) {
  const got = slugifyUk(input);
  const shapeOk = got === "" || SLUG_RE.test(got);
  const ok = got === expected && shapeOk;
  console.log(ok ? `✓ ${input} → ${got}` : `✗ ${input} → ${got} (expected ${expected})`);
  if (!ok) failures++;
}
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 3: Run it**

Run: `npx tsx scripts/check-slugify.ts`
Expected: all `✓`, exit 0. If a case disagrees only on a transliteration nicety (e.g. `и` vs `y`), fix the **expected value** in the script to match the resolution, not the other way round — but the shape assertion (`SLUG_RE`) must never be relaxed.

- [ ] **Step 4: Wire it into the form**

In `src/app/(admin)/admin/blog/[id]/_form.tsx`:

Import it:

```ts
import { slugifyUk } from "@/lib/slugify-uk";
```

Add state tracking whether the editor has taken manual control of the slug, next to the existing `const [slug, setSlug] = useState(p.slug || "");`:

```tsx
  const [slugTouched, setSlugTouched] = useState(!isNew || Boolean(p.slug));
```

Change the UK title input (the `LANGS.map` block renders all three; special-case `Uk`) so it drives the slug. Replace the titles block:

```tsx
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LANGS.map(lang => (
            <div key={lang}><label className={labelCls}>{t.blogForm.titleLabel(lang)}</label><input name={`title${lang}`} defaultValue={p[`title_${lang.toLowerCase()}`] || ""} className={inputCls} /></div>
          ))}
        </div>
```

with:

```tsx
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LANGS.map(lang => (
            <div key={lang}>
              <label className={labelCls}>{t.blogForm.titleLabel(lang)}</label>
              <input
                name={`title${lang}`}
                defaultValue={p[`title_${lang.toLowerCase()}`] || ""}
                onChange={lang === "Uk" && !slugTouched
                  ? e => setSlug(slugifyUk(e.target.value))
                  : undefined}
                className={inputCls}
              />
            </div>
          ))}
        </div>
```

And mark the slug field as manually edited on any user input:

```tsx
            <input
              name="slug"
              value={slug}
              onChange={e => { setSlugTouched(true); setSlug(e.target.value); }}
              required
              className={inputCls}
              placeholder="my-article-slug"
            />
```

`slugTouched` starts `true` for an existing post, so an already-published URL is never rewritten by editing its title.

- [ ] **Step 5: Typecheck, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: pass.

- [ ] **Step 6: Verify in the UI**

`npm run dev`, open `/admin/blog/new`:
1. Type a Ukrainian title → slug fills in transliterated, live.
2. Edit the slug by hand, then keep typing the title → the slug stops following.
3. Open an existing post, change its title → the slug does not move.

- [ ] **Step 7: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/slugify-uk.ts scripts/check-slugify.ts "src/app/(admin)/admin/blog/[id]/_form.tsx"
git commit -m "feat(blog): auto-generate slug from Ukrainian title"
```

---

### Task 7: RU/EN auto-translation

**Files:**
- Modify: `src/lib/translate.ts`
- Modify: `src/app/(admin)/admin/blog/_actions.ts`
- Modify: `src/app/(admin)/admin/blog/[id]/_form.tsx`
- Modify: `src/app/(admin)/admin/_i18n/strings.ts` (three copies)

**Interfaces:**
- Consumes: `requireSession()`; existing `translateHeadline(text, target)` in `src/lib/translate.ts`.
- Produces:
  - `translateHtml(html: string, target: "ru" | "en"): Promise<string>` in `src/lib/translate.ts`
  - `translatePost(target: "ru" | "en", source: TranslateSource): Promise<TranslateResult>` in `_actions.ts`, where

    ```ts
    interface TranslateSource { title: string; excerpt: string; body: string; seoTitle: string; seoDesc: string }
    type TranslateResult = { ok: true; data: TranslateSource } | { ok: false; error: string }
    ```

- [ ] **Step 1: Add HTML-preserving translation**

Append to `src/lib/translate.ts`:

```ts
/**
 * Translate an HTML article body into RU or EN, preserving the markup exactly.
 *
 * The editor stores Tiptap HTML, so the tag structure must survive the round
 * trip — only the text nodes change. Never throws: returns "" on failure so the
 * caller can fall back to manual entry.
 */
export async function translateHtml(html: string, target: "ru" | "en"): Promise<string> {
  const src = html.trim();
  if (!src) return "";
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt:
        `Translate the text content of this Ukrainian aesthetic-medicine article into ${LANG[target]}.\n` +
        `Rules:\n` +
        `- Keep the HTML markup byte-for-byte identical: same tags, same order, same attributes.\n` +
        `- Translate ONLY the text between tags, and alt/title attribute values.\n` +
        `- Do not add, remove, merge or reorder any element.\n` +
        `- Keep medical terminology accurate and the register editorial.\n` +
        `- Return ONLY the resulting HTML, with no code fence and no commentary.\n\n${src}`,
    });
    return text.trim().replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "");
  } catch (e) {
    console.error("translateHtml failed:", e);
    return "";
  }
}
```

- [ ] **Step 2: Add the server action**

Append to `src/app/(admin)/admin/blog/_actions.ts`:

```ts
import { translateHeadline, translateHtml } from "@/lib/translate";

export interface TranslateSource {
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDesc: string;
}

export type TranslateResult = { ok: true; data: TranslateSource } | { ok: false; error: string };

/**
 * Translate the Ukrainian version of a post into RU or EN and hand the result
 * back to the form. Nothing is written to the database — the editor reviews and
 * saves explicitly.
 */
export async function translatePost(
  target: "ru" | "en",
  source: TranslateSource,
): Promise<TranslateResult> {
  await requireSession();

  if (!source.title.trim() && !source.body.trim()) {
    return { ok: false, error: "Спочатку заповніть українську версію" };
  }

  try {
    const [title, excerpt, body, seoTitle, seoDesc] = await Promise.all([
      translateHeadline(source.title, target),
      translateHeadline(source.excerpt, target),
      translateHtml(source.body, target),
      translateHeadline(source.seoTitle, target),
      translateHeadline(source.seoDesc, target),
    ]);
    return { ok: true, data: { title, excerpt, body, seoTitle, seoDesc } };
  } catch (e) {
    console.error("translatePost failed:", e);
    return { ok: false, error: "Не вдалося перекласти. Спробуйте ще раз" };
  }
}
```

`translateHeadline` is reused for the excerpt and SEO fields because they are short plain-text strings — same job, no need for a second prompt.

- [ ] **Step 3: Make the RU/EN title, excerpt and SEO fields controlled**

The translation must be able to write into them, so they can no longer be `defaultValue`-only. In `_form.tsx`, add state above the return:

```tsx
  const [titles, setTitles] = useState({
    Uk: p.title_uk || "", Ru: p.title_ru || "", En: p.title_en || "",
  });
  const [excerpts, setExcerpts] = useState({
    Uk: p.excerpt_uk || "", Ru: p.excerpt_ru || "", En: p.excerpt_en || "",
  });
  const [seoTitles, setSeoTitles] = useState({
    Uk: p.seo_title_uk || "", Ru: p.seo_title_ru || "", En: p.seo_title_en || "",
  });
  const [seoDescs, setSeoDescs] = useState({
    Uk: p.seo_desc_uk || "", Ru: p.seo_desc_ru || "", En: p.seo_desc_en || "",
  });
  const [translating, setTranslating] = useState<"ru" | "en" | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
```

Then convert each of those four field groups from `defaultValue={...}` to `value={...} onChange={...}`. For titles (replacing the block from Task 6 Step 4):

```tsx
              <input
                name={`title${lang}`}
                value={titles[lang]}
                onChange={e => {
                  setTitles(prev => ({ ...prev, [lang]: e.target.value }));
                  if (lang === "Uk" && !slugTouched) setSlug(slugifyUk(e.target.value));
                }}
                className={inputCls}
              />
```

For excerpts:

```tsx
              <textarea
                name={`excerpt${lang}`}
                rows={3}
                value={excerpts[lang]}
                onChange={e => setExcerpts(prev => ({ ...prev, [lang]: e.target.value }))}
                className={`${inputCls} resize-y`}
                placeholder={t.blogForm.excerptPlaceholder}
              />
```

For the SEO pair inside the `<details>` block — note these already feed `SeoPreview` via `seoTitleUk`/`seoDescUk`, so drop those two separate `useState`s and read from the new maps instead (`<SeoPreview title={seoTitles.Uk} desc={seoDescs.Uk} slug={slug} t={t} />`):

```tsx
                  <input
                    name={`seoTitle${lang}`}
                    value={seoTitles[lang]}
                    onChange={e => setSeoTitles(prev => ({ ...prev, [lang]: e.target.value }))}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line focus:ring-1 focus:ring-main outline-none"
                  />
```

```tsx
                  <textarea
                    name={`seoDesc${lang}`}
                    rows={2}
                    value={seoDescs[lang]}
                    onChange={e => setSeoDescs(prev => ({ ...prev, [lang]: e.target.value }))}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line focus:ring-1 focus:ring-main outline-none resize-none"
                  />
```

- [ ] **Step 4: Add the translate handler and buttons**

Add the handler next to the other callbacks in `_form.tsx`:

```tsx
  async function handleTranslate(target: "ru" | "en") {
    setTranslating(target);
    setTranslateError(null);
    try {
      const res = await translatePost(target, {
        title: titles.Uk,
        excerpt: excerpts.Uk,
        body: bodyUk,
        seoTitle: seoTitles.Uk,
        seoDesc: seoDescs.Uk,
      });
      if (!res.ok) {
        setTranslateError(res.error);
        return;
      }
      const key = target === "ru" ? "Ru" : "En";
      setTitles(prev => ({ ...prev, [key]: res.data.title }));
      setExcerpts(prev => ({ ...prev, [key]: res.data.excerpt }));
      setSeoTitles(prev => ({ ...prev, [key]: res.data.seoTitle }));
      setSeoDescs(prev => ({ ...prev, [key]: res.data.seoDesc }));
      if (res.data.body) bodySetters[key](res.data.body);
    } catch {
      setTranslateError(t.blogForm.translateFailed);
    } finally {
      setTranslating(null);
    }
  }
```

Import the action:

```ts
import { savePost, deletePost, translatePost } from "../_actions";
```

Add the buttons next to the Uk/Ru/En body tab switcher (the `flex items-center justify-between mb-3` row), on the left of the tabs:

```tsx
            <div className="flex items-center gap-2">
              {(["ru", "en"] as const).map(target => (
                <button
                  key={target}
                  type="button"
                  onClick={() => handleTranslate(target)}
                  disabled={translating !== null}
                  className="px-3 py-1.5 rounded-lg bg-champagne-dark hover:bg-champagne-darker text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  {translating === target
                    ? t.blogForm.translating
                    : t.blogForm.translateTo(target.toUpperCase())}
                </button>
              ))}
            </div>
```

And render the error under them:

```tsx
          {translateError && (
            <p className="mb-3 text-xs text-error">{translateError}</p>
          )}
```

- [ ] **Step 5: Add the i18n keys**

Add to `blogForm` in **all three** copies in `src/app/(admin)/admin/_i18n/strings.ts`:

uk:
```ts
    translateTo: (lang: string) => `Перекласти на ${lang}`,
    translating: "Перекладаю…",
    translateFailed: "Не вдалося перекласти",
```
ru:
```ts
    translateTo: (lang: string) => `Перевести на ${lang}`,
    translating: "Перевожу…",
    translateFailed: "Не удалось перевести",
```
en:
```ts
    translateTo: (lang: string) => `Translate to ${lang}`,
    translating: "Translating…",
    translateFailed: "Translation failed",
```

- [ ] **Step 6: Typecheck, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: pass.

- [ ] **Step 7: Verify in the UI**

Requires `OPENAI_API_KEY` in `.env.local` (the press section already uses it — confirm with `grep OPENAI_API_KEY .env.local`; if absent, stop and ask the user for the key rather than guessing).

`npm run dev`, open a post with a filled Ukrainian version:
1. Click **Перекласти на RU** → button shows a loading label, then RU title, excerpt, SEO fields and body fill in.
2. Switch the body tab to `Ru` → the HTML structure matches the Ukrainian one (same headings, lists, images), text is Russian.
3. Edit a translated field by hand — it stays edited.
4. Save → reload the editor → translations persisted.
5. Confirm `/ru/blog/<slug>` shows the Russian version.

- [ ] **Step 8: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/translate.ts "src/app/(admin)/admin/blog/_actions.ts" "src/app/(admin)/admin/blog/[id]/_form.tsx" "src/app/(admin)/admin/_i18n/strings.ts"
git commit -m "feat(blog): one-click RU/EN translation in the post editor"
```

---

### Task 8: End-to-end acceptance on the preview deploy

Everything above was verified locally. This task confirms the same behaviour on the real Vercel preview, where ISR, Blob uploads and the Neon connection behave as in production.

**Files:** none (verification only, plus any fix the run surfaces).

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces: a verified deployment and a filled-in acceptance record in the spec.

- [ ] **Step 1: Push and wait for the preview build**

```bash
git branch --show-current   # must print: develop
git push origin develop
```

Wait for the `genevity-git-develop-*.vercel.app` deployment to go green. If the build fails, fix and re-push before continuing.

- [ ] **Step 2: Run the acceptance checklist against the preview URL**

Work through these in order, on the deployed preview, logged into the admin:

1. Create a new post: type a Ukrainian title → slug auto-fills. Upload a cover. Write a body. Save → redirected to the editor with the "Збережено" tick.
2. `/blog` shows the post **immediately** (no 24-hour wait). Same on `/ru/blog` and `/en/blog`.
3. Edit the title, save, reload `/blog/<slug>` → new title immediately.
4. Change the slug to one that already exists → red banner "Стаття з таким slug уже існує", entered content still in the form.
5. Set status **Опубліковано** with a date one day in the future → validation error about scheduled publishing.
6. Switch the post to **Чернетка**, save → gone from `/blog`, `/blog/<slug>` 404s.
7. Click **Переглянути** → article renders with the preview banner. **Вийти** → 404 again.
8. Private window: `/blog/<slug>` of the draft → 404; `/api/admin/preview?id=…` → redirect to login.
9. Click **Перекласти на EN** → EN fields fill, markup preserved. Save, check `/en/blog/<slug>`.
10. Delete the post → gone from `/blog` and from `/sitemap.xml`.

- [ ] **Step 3: Record the result**

Append an "Acceptance — <date>" section to
`docs/superpowers/specs/2026-07-30-blog-admin-publishing-design.md` listing each of the ten checks with pass/fail and, for anything that needed a workaround (particularly the revalidation fallback from Task 4 Step 5), what was actually done.

- [ ] **Step 4: Commit**

```bash
git branch --show-current   # must print: develop
git add docs/superpowers/specs/2026-07-30-blog-admin-publishing-design.md
git commit -m "docs(blog): acceptance record for admin publishing"
git push origin develop
```

- [ ] **Step 5: Report, do not merge**

Report the outcome to the user. **Do not merge `develop` into `main`** — per `CLAUDE.md`, every merge to production needs explicit per-merge confirmation, and this work is intentionally preview-only.
