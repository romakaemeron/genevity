# E-E-A-T Phase 1 — Medical Reviewer & Evidence Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a medical-reviewer trust layer (reviewer doctor + last-reviewed date + "Перевірено лікарем" badge + medical disclaimer + `MedicalWebPage`/`reviewedBy` JSON-LD + a Sources content block) to service and blog pages, and complete the "Про центр" page with license-photo / medical-director / verified-numbers trust blocks.

**Architecture:** Reviewer + review-date are nullable columns on `services` and `blog_posts`, edited in the existing custom admin CMS and read through the existing Neon/raw-SQL query layer. Two small presentational components (`ReviewedByBadge`, `MedicalDisclaimer`) and one JSON-LD component (`JsonLdMedicalWebPage`) render the trust signals. A new `section.sources` content-section type extends the existing reorderable block system. About-page trust blocks reuse the same per-locale column + admin patterns.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Neon Postgres via `postgres`/raw SQL (`src/lib/db/client.ts` `sql` tag), next-intl with **DB-backed `ui_strings`** (no `messages/*.json`), Tailwind v4. Migrations = numbered SQL in `scripts/migrations/` run by a `tsx` runner.

## Global Constraints

- **Branch:** all work on `develop`. Never commit/push to `main`. Verify with `git branch --show-current` before every commit.
- **i18n content:** every user-facing content field is per-locale `_uk/_ru/_en` columns; locale `ua`→`uk` mapping via the `lang()` helper already in each query file. Ukrainian (`uk`) is the canonical fallback.
- **UI strings:** new interface labels go in the **`ui_strings` JSONB table** (uk/ru/en leaves), NOT JSON files. Resolved by `getMessagesForLocale()` in `src/lib/db/queries/ui-strings.ts`.
- **Migrations:** new SQL file `scripts/migrations/0NN_*.sql` + a runner `scripts/run-migration-0NN.ts` modeled on `scripts/run-migration-009.ts`. Run with `npx tsx scripts/run-migration-0NN.ts`. All DDL uses `IF NOT EXISTS`.
- **No test harness exists.** Per-task verification = `npm run lint`, `npm run build`, migration runner output, and dev-server/`view-source` checks. Do NOT add a test framework (YAGNI).
- **JSON-LD:** developer-controlled; inject via existing `<JsonLd data={…} />` (`src/components/seo/JsonLd.tsx`). Emit optional fields only when present (follow `JsonLdMedicalProcedure.tsx`).
- **Commit frequently:** one commit per task, conventional-commit messages, footer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

### Task 1: Migration — reviewer columns on `services` and `blog_posts`

**Files:**
- Create: `scripts/migrations/013_medical_reviewer.sql`
- Create: `scripts/run-migration-013.ts`

**Interfaces:**
- Produces: columns `services.reviewer_doctor_id UUID`, `services.last_reviewed_at DATE`, `blog_posts.reviewer_doctor_id UUID`, `blog_posts.last_reviewed_at DATE` (all nullable). FK → `doctors(id)` with `ON DELETE SET NULL`.

- [ ] **Step 1: Write the migration SQL**

`scripts/migrations/013_medical_reviewer.sql`:
```sql
-- Migration 013: Medical reviewer + last-reviewed date on services & blog posts.
-- Nullable so existing rows stay valid; FK clears the reference if a doctor is
-- deleted. Powers the "Перевірено лікарем" badge and reviewedBy/lastReviewed JSON-LD.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS reviewer_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_reviewed_at DATE;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS reviewer_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_reviewed_at DATE;
```

- [ ] **Step 2: Write the runner** (copy `scripts/run-migration-009.ts`, swap the filename)

`scripts/run-migration-013.ts`:
```ts
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "fs";
import { join } from "path";
import { sql } from "../src/lib/db/client";

async function main() {
  const migration = readFileSync(join(__dirname, "migrations/013_medical_reviewer.sql"), "utf-8");
  console.log("Running migration 013_medical_reviewer.sql…");
  await sql.unsafe(migration);
  console.log("✅ Migration 013 applied.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

> Before writing, open `scripts/run-migration-009.ts` and match its exact imports (env loading, `sql` import path, and whether it uses `sql.unsafe(...)` vs `sql(...)`). Mirror that file precisely; the block above is the shape, not a substitute for the real pattern.

- [ ] **Step 3: Run the migration**

Run: `npx tsx scripts/run-migration-013.ts`
Expected: `✅ Migration 013 applied.` and exit 0.

- [ ] **Step 4: Verify columns exist**

Run:
```bash
npx tsx -e "import('./src/lib/db/client').then(async ({sql})=>{const r=await sql\`SELECT column_name FROM information_schema.columns WHERE table_name='services' AND column_name IN ('reviewer_doctor_id','last_reviewed_at')\`;console.log(r);process.exit(0)})"
```
Expected: two rows — `reviewer_doctor_id`, `last_reviewed_at`.

- [ ] **Step 5: Commit**

```bash
git add scripts/migrations/013_medical_reviewer.sql scripts/run-migration-013.ts
git commit -m "feat(db): add medical reviewer + last-reviewed columns (migration 013)"
```

---

### Task 2: Load reviewer into the service query + types

**Files:**
- Modify: `src/lib/db/types.ts` (add `ServiceReviewer` type + `reviewer` / `lastReviewedAt` on `ServiceData`)
- Modify: `src/lib/db/queries/services.ts:65` (SELECT) and `:84` (return object) + a `getReviewer` helper

**Interfaces:**
- Consumes: Task 1 columns.
- Produces: `ServiceData.reviewer: ServiceReviewer | null` and `ServiceData.lastReviewedAt: string | null` (ISO date). `ServiceReviewer = { name: string; slug: string | null; role: string; photoCircle: string | null }`.

- [ ] **Step 1: Add the type** in `src/lib/db/types.ts` (near `ServiceData`, before line 294):

```ts
export interface ServiceReviewer {
  name: string;
  slug: string | null;
  role: string;
  photoCircle: string | null;
}
```
And add to the `ServiceData` interface (after `finalCta`):
```ts
  /** Medical reviewer doctor for this page (null = not set). */
  reviewer: ServiceReviewer | null;
  /** ISO date (YYYY-MM-DD) the medical content was last reviewed, or null. */
  lastReviewedAt: string | null;
```

- [ ] **Step 2: Add the reviewer helper** to `src/lib/db/queries/services.ts` (after `getRelatedEquipment`):

```ts
async function getReviewer(doctorId: string | null, l: string): Promise<import("../types").ServiceReviewer | null> {
  if (!doctorId) return null;
  const rows = await sql`
    SELECT slug, role_uk, role_ru, role_en, name_uk, name_ru, name_en, photo_circle
    FROM doctors WHERE id = ${doctorId} AND is_published = true LIMIT 1
  `;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    name: pick(r, "name", l) || "",
    slug: r.slug || null,
    role: pick(r, "role", l) || "",
    photoCircle: r.photo_circle || null,
  };
}
```

- [ ] **Step 3: Fetch it in `getServiceBySlug`.** Add `getReviewer(r.reviewer_doctor_id, l)` into the `Promise.all` at line 76 and destructure it:

```ts
  const [sections, faq, relatedDoctors, relatedServices, relatedEquipment, reviewer] = await Promise.all([
    getSections("service", r.id, l),
    getFaqItems("service", r.id, l),
    getRelatedDoctors(r.id, l),
    getRelatedServices(r.id, l),
    getRelatedEquipment(r.id, l),
    getReviewer(r.reviewer_doctor_id, l),
  ]);
```
(`r.reviewer_doctor_id` is already available because the query uses `SELECT s.*`.)

- [ ] **Step 4: Return the new fields.** In the returned object (after `finalCta:` at line 110) add:

```ts
    reviewer,
    lastReviewedAt: r.last_reviewed_at ? new Date(r.last_reviewed_at).toISOString().slice(0, 10) : null,
```

- [ ] **Step 5: Typecheck**

Run: `npm run build`
Expected: build succeeds (no TS errors about `ServiceData` missing fields).

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/types.ts src/lib/db/queries/services.ts
git commit -m "feat(services): load medical reviewer + last-reviewed date"
```

---

### Task 3: `MedicalDisclaimer` + `ReviewedByBadge` components + ui_strings

**Files:**
- Create: `src/components/ui/MedicalDisclaimer.tsx`
- Create: `src/components/ui/ReviewedByBadge.tsx`
- Modify: `ui_strings` DB row (via a seed script `scripts/seed-eeat-ui-strings.ts`)

**Interfaces:**
- Produces:
  - `MedicalDisclaimer(props: { text: string })` — renders a muted disclaimer note.
  - `ReviewedByBadge(props: { name: string; role: string; slug: string | null; photoCircle: string | null; date: string | null; label: string; updatedLabel: string })`.

- [ ] **Step 1: Seed the UI strings.** Create `scripts/seed-eeat-ui-strings.ts` that patches the `ui_strings` JSONB with an `eeat` namespace. First open `scripts/list-ui-ns.ts` and an existing ui-strings write to match how the row is patched. The values to add (all three locales):

```
eeat.reviewedBy      = { uk: "Перевірено лікарем", ru: "Проверено врачом", en: "Medically reviewed by" }
eeat.updated         = { uk: "оновлено", ru: "обновлено", en: "updated" }
eeat.disclaimer      = {
  uk: "Ця інформація має ознайомлювальний характер і не замінює консультацію лікаря.",
  ru: "Эта информация носит ознакомительный характер и не заменяет консультацию врача.",
  en: "This information is for general awareness and does not replace a doctor's consultation."
}
eeat.sourcesHeading  = { uk: "Джерела", ru: "Источники", en: "Sources" }
```

Run: `npx tsx scripts/seed-eeat-ui-strings.ts` → expect success log. Verify by reading the row back (`SELECT data->'eeat' FROM ui_strings`).

- [ ] **Step 2: Build `MedicalDisclaimer`** — `src/components/ui/MedicalDisclaimer.tsx`:

```tsx
export default function MedicalDisclaimer({ text }: { text: string }) {
  return (
    <p className="body-s text-muted italic border-l-2 border-line pl-4 mt-8">
      {text}
    </p>
  );
}
```

- [ ] **Step 3: Build `ReviewedByBadge`** — `src/components/ui/ReviewedByBadge.tsx`:

```tsx
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";

interface Props {
  name: string;
  role: string;
  slug: string | null;
  photoCircle: string | null;
  date: string | null;
  label: string;        // "Перевірено лікарем"
  updatedLabel: string; // "оновлено"
}

export default function ReviewedByBadge({ name, role, slug, photoCircle, date, label, updatedLabel }: Props) {
  const inner = (
    <span className="inline-flex items-center gap-3 rounded-[var(--radius-card)] bg-champagne-dark px-4 py-3">
      {photoCircle ? (
        <Image src={photoCircle} alt={name} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
      ) : (
        <ShieldCheck className="w-5 h-5 text-main" />
      )}
      <span className="flex flex-col">
        <span className="body-s text-muted">{label}</span>
        <span className="body-strong text-black text-sm">
          {name}{role ? `, ${role}` : ""}
        </span>
        {date && <span className="body-s text-muted">{updatedLabel}: {date}</span>}
      </span>
    </span>
  );
  return slug ? <Link href={`/doctors/${slug}`} className="hover:opacity-80 transition-opacity">{inner}</Link> : inner;
}
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors in the two new files.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/MedicalDisclaimer.tsx src/components/ui/ReviewedByBadge.tsx scripts/seed-eeat-ui-strings.ts
git commit -m "feat(ui): reviewed-by badge + medical disclaimer components"
```

---

### Task 4: `JsonLdMedicalWebPage` component

**Files:**
- Create: `src/components/seo/JsonLdMedicalWebPage.tsx`

**Interfaces:**
- Produces: `JsonLdMedicalWebPage(props: { url: string; name: string; lastReviewed?: string; reviewer?: { name: string; url?: string } })`.

- [ ] **Step 1: Write the component** (mirror `JsonLdMedicalProcedure.tsx` optional-field style):

```tsx
import { JsonLd } from "./JsonLd";

interface Props {
  url: string;
  name: string;
  /** ISO date YYYY-MM-DD */
  lastReviewed?: string;
  reviewer?: { name: string; url?: string };
}

/** schema.org MedicalWebPage with reviewedBy + lastReviewed for E-E-A-T. */
export function JsonLdMedicalWebPage({ url, name, lastReviewed, reviewer }: Props) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    url,
    name,
  };
  if (lastReviewed) data.lastReviewed = lastReviewed;
  if (reviewer) {
    data.reviewedBy = {
      "@type": "Physician",
      name: reviewer.name,
      ...(reviewer.url ? { url: reviewer.url } : {}),
    };
  }
  return <JsonLd data={data} />;
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/seo/JsonLdMedicalWebPage.tsx
git commit -m "feat(seo): MedicalWebPage JSON-LD with reviewedBy/lastReviewed"
```

---

### Task 5: Wire badge + disclaimer + JSON-LD into the service page

**Files:**
- Modify: `src/components/templates/ServiceDetailTemplate.tsx` (imports, JSON-LD block ~line 91, hero block ~line 116, end of render ~line 254)
- Modify: `src/components/templates/ServiceDetailTemplate.tsx` `Props` (line 26) to receive the eeat labels
- Modify: the service detail server page that renders the template (find with grep below) to pass eeat labels

**Interfaces:**
- Consumes: `ServiceData.reviewer`, `ServiceData.lastReviewedAt` (Task 2); `ReviewedByBadge`, `MedicalDisclaimer` (Task 3); `JsonLdMedicalWebPage` (Task 4); `eeat` ui_strings (Task 3).
- Produces: reviewer badge under the hero CTA; disclaimer + `MedicalWebPage` JSON-LD on the page.

- [ ] **Step 1: Find the server page** that renders `ServiceDetailTemplate` and how it builds label props:

Run: `grep -rn "ServiceDetailTemplate\|doctorsUi=\|equipmentUi=" src/app/[locale]/services`
Expected: the `[category]/[slug]/page.tsx` server component. Read how it resolves `doctorsUi`/`equipmentUi` from `getTranslations`/ui_strings — you'll mirror it for `eeatUi`.

- [ ] **Step 2: Extend `Props`** in `ServiceDetailTemplate.tsx` (line 26):

```ts
  eeatUi?: { reviewedBy: string; updated: string; disclaimer: string };
```
And in the destructure at line 57: `{ data, locale, doctorsUi, detailsLabel, equipmentUi, eeatUi }`.

- [ ] **Step 3: Add imports** (top of file, near line 20):

```ts
import ReviewedByBadge from "@/components/ui/ReviewedByBadge";
import MedicalDisclaimer from "@/components/ui/MedicalDisclaimer";
import { JsonLdMedicalWebPage } from "@/components/seo/JsonLdMedicalWebPage";
```

- [ ] **Step 4: Emit the JSON-LD.** After the `<JsonLdMedicalProcedure … />` block (line 96), add:

```tsx
      <JsonLdMedicalWebPage
        url={absoluteUrl(`/services/${data.category.slug}/${data.slug}`, locale)}
        name={data.h1 || data.title}
        lastReviewed={data.lastReviewedAt ?? undefined}
        reviewer={data.reviewer ? {
          name: data.reviewer.name,
          url: data.reviewer.slug ? absoluteUrl(`/doctors/${data.reviewer.slug}`, locale) : undefined,
        } : undefined}
      />
```

- [ ] **Step 5: Render the badge** under the hero booking CTA. Inside the hero `<div className="mt-4 mb-10">…</div>` block (lines 116–120), append after `</BookingCTA>`… actually add a sibling right after that div:

```tsx
        {data.reviewer && eeatUi && (
          <div className="mb-8">
            <ReviewedByBadge
              name={data.reviewer.name}
              role={data.reviewer.role}
              slug={data.reviewer.slug}
              photoCircle={data.reviewer.photoCircle}
              date={data.lastReviewedAt}
              label={eeatUi.reviewedBy}
              updatedLabel={eeatUi.updated}
            />
          </div>
        )}
```

- [ ] **Step 6: Render the disclaimer** at the very end of the block loop, before the closing `</>` (after line 254 `})}`):

```tsx
      {eeatUi?.disclaimer && (
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-12">
          <MedicalDisclaimer text={eeatUi.disclaimer} />
        </div>
      )}
```

- [ ] **Step 7: Pass `eeatUi` from the server page.** In the service detail server page (found in Step 1), resolve the three `eeat` strings the same way `doctorsUi` is resolved and pass `eeatUi={{ reviewedBy, updated, disclaimer }}` to `<ServiceDetailTemplate>`.

- [ ] **Step 8: Build + manual check**

Run: `npm run build` → succeeds.
Then `npm run dev`, open a service page whose reviewer you set in Task 6 (or temporarily set one via SQL), and:
- Confirm the badge shows under the hero CTA and links to the doctor.
- `view-source` and grep for `"MedicalWebPage"` and `"reviewedBy"`.
- Confirm the disclaimer renders at the bottom.

- [ ] **Step 9: Commit**

```bash
git add src/components/templates/ServiceDetailTemplate.tsx "src/app/[locale]/services/[category]/[slug]/page.tsx"
git commit -m "feat(services): render reviewed-by badge, disclaimer, MedicalWebPage JSON-LD"
```

---

### Task 6: Admin — reviewer selector + review date in the service form

**Files:**
- Modify: `src/app/(admin)/admin/services/_components/service-form.tsx`
- Modify: the service update server action (find via grep) to persist the two columns
- Possibly Modify: `src/app/(admin)/admin/services/[id]/page.tsx` / `new/page.tsx` to load doctor options

**Interfaces:**
- Consumes: `doctors` list (id, name), Task 1 columns.
- Produces: admins can set `reviewer_doctor_id` + `last_reviewed_at` per service.

- [ ] **Step 1: Read the form + action.** Open `service-form.tsx` and locate: (a) how existing simple fields (e.g. `procedure_length`, `seo_title`) are rendered and bound, (b) the server action it submits to. Run:

Run: `grep -rn "UPDATE services\|reviewer_doctor_id\|export async function" "src/app/(admin)/admin/services"`
Note the action file + the existing `UPDATE services SET …` statement you will extend.

- [ ] **Step 2: Provide doctor options.** In the service edit/new page loader, fetch published doctors `{ id, name }` (reuse or add a `getDoctorOptions()` in `src/lib/db/queries/doctors.ts`):

```ts
export async function getDoctorOptions(locale: string): Promise<{ id: string; name: string }[]> {
  const l = locale === "ua" ? "uk" : locale;
  const rows = await sql`SELECT id, name_uk, name_ru, name_en FROM doctors WHERE is_published = true ORDER BY sort_order`;
  return rows.map((r) => ({ id: r.id, name: r[`name_${l}`] ?? r.name_uk ?? "" }));
}
```
Pass the options into `service-form.tsx`.

- [ ] **Step 3: Add the two fields** to the form, following the file's existing field markup — a `<select name="reviewer_doctor_id">` (empty option = "— не задано —" + one `<option value={d.id}>` per doctor, `defaultValue={service.reviewer_doctor_id ?? ""}`) and `<input type="date" name="last_reviewed_at" defaultValue={service.last_reviewed_at ?? ""}>`. Place them in the SEO/meta section of the form.

- [ ] **Step 4: Persist in the action.** Extend the `UPDATE services SET …` to include `reviewer_doctor_id = ${reviewerDoctorId || null}, last_reviewed_at = ${lastReviewedAt || null}`, reading the two fields from the submitted `FormData` (empty string → `null`).

- [ ] **Step 5: Manual check**

Run: `npm run dev`, open `/admin/services/<id>`, set a reviewer + date, save. Reload the public service page and confirm the badge appears with that doctor + date.

- [ ] **Step 6: Build + commit**

Run: `npm run build` → succeeds.
```bash
git add "src/app/(admin)/admin/services" src/lib/db/queries/doctors.ts
git commit -m "feat(admin): service reviewer selector + last-reviewed date"
```

---

### Task 7: `section.sources` content-block type

**Files:**
- Modify: `src/lib/db/types.ts` (add `SectionSources` + union member, lines 233–244)
- Modify: `src/components/sections/SectionRenderer.tsx` (render case)
- Create: `src/components/sections/SourcesSection.tsx`
- Modify: admin block editor for sections (find via grep) to allow adding a `section.sources` block

**Interfaces:**
- Consumes: `eeat.sourcesHeading` ui_string (Task 3).
- Produces: a reorderable "Джерела" block = titled list of `{ label: string; url: string }` links, usable on services + static pages.

- [ ] **Step 1: Add the type** in `src/lib/db/types.ts` (after `SectionCta`, line 231):

```ts
export interface SectionSources {
  _type: "section.sources";
  _key: string;
  heading: string;
  items: { label: string; url: string }[];
}
```
Add `| SectionSources` to the `ContentSection` union (line 244).

- [ ] **Step 2: Create the renderer** `src/components/sections/SourcesSection.tsx` (match sibling section styling, e.g. `BulletsSection.tsx` — read it first):

```tsx
import type { SectionSources } from "@/lib/db/types";

export default function SourcesSection({ section }: { section: SectionSources }) {
  if (!section.items?.length) return null;
  return (
    <section>
      {section.heading && <h2 className="heading-2 text-black mb-6"><span>{section.heading}</span></h2>}
      <ol className="list-decimal pl-6 space-y-2">
        {section.items.map((it, i) => (
          <li key={i} className="body-m text-muted">
            <a href={it.url} target="_blank" rel="nofollow noopener noreferrer" className="text-main hover:underline break-words">
              {it.label || it.url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `SectionRenderer.tsx`.** Open it, note the switch/map on `section._type`, and add a case:

```tsx
    case "section.sources":
      return <SourcesSection key={section._key} section={section} />;
```
plus the import. Match the file's existing exhaustive-switch pattern.

- [ ] **Step 4: Admin block editor.** Find where block types are offered:

Run: `grep -rn "section.callout\|section.bullets\|_type" "src/app/(admin)/admin" src/app/\(admin\) 2>/dev/null | grep -i section | head`
Add `section.sources` to the block-type picker and a minimal editor (heading input + repeatable label/url rows), following the existing `section.bullets`/`section.cta` editor pattern in that file.

- [ ] **Step 5: Build + manual check**

Run: `npm run build` → succeeds. In dev, add a Sources block to a service, save, confirm it renders with `rel="nofollow"` external links (`view-source` grep `nofollow`).

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/types.ts src/components/sections/SourcesSection.tsx src/components/sections/SectionRenderer.tsx "src/app/(admin)/admin"
git commit -m "feat(sections): add Sources (Джерела) content block"
```

---

### Task 8: Blog reviewer parity

**Files:**
- Modify: `src/lib/db/queries/blog.ts` (load reviewer + last_reviewed_at)
- Modify: the blog article template/page (find via grep) — badge + disclaimer + JSON-LD
- Modify: `src/app/(admin)/admin/blog` form + action (reviewer selector + date)

**Interfaces:**
- Consumes: Task 1 blog columns; Task 3/4 components.
- Produces: same reviewer trust layer on blog articles.

- [ ] **Step 1: Extend the blog query.** Read `src/lib/db/queries/blog.ts`, find the single-post loader, and add `reviewer` (reuse the `getReviewer` pattern — extract it to `src/lib/db/queries/_shared.ts` if cleaner, or duplicate the small helper) + `lastReviewedAt`, mirroring Task 2. Add the fields to the blog post type.

- [ ] **Step 2: Render on the article.** Find the blog article component:

Run: `grep -rln "getPostBySlug\|BlogArticle\|article" src/app/[locale] src/components | grep -i blog`
Add `ReviewedByBadge` (near the byline/date), `MedicalDisclaimer` (article end), and `JsonLdMedicalWebPage`, resolving `eeat` strings the same way as the service page.

- [ ] **Step 3: Admin.** Add the reviewer `<select>` + date `<input>` to the blog editor form and persist both columns in its update action (mirror Task 6).

- [ ] **Step 4: Build + manual check**

Run: `npm run build` → succeeds. In dev, set a reviewer on a post, confirm badge + disclaimer + `reviewedBy` JSON-LD on the article.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/queries/blog.ts "src/app/[locale]" src/components "src/app/(admin)/admin/blog"
git commit -m "feat(blog): medical reviewer badge, disclaimer, MedicalWebPage JSON-LD"
```

---

### Task 9: "Про центр" trust blocks (license photo, medical director, verified numbers)

**Files:**
- Create: `scripts/migrations/014_about_trust_blocks.sql` + `scripts/run-migration-014.ts`
- Modify: `src/lib/db/types.ts` `AboutData` (line 51)
- Modify: the about query (find via grep) + About page component
- Modify: `src/app/(admin)/admin/pages` About editor + action

**Interfaces:**
- Produces: `AboutData` gains `licenseImage: string | null`, `directorName/_uk_ru_en`, `directorRole` (localized), `directorPhoto: string | null`, `statsNote` (localized) — rendered on `/about`.

- [ ] **Step 1: Migration** `scripts/migrations/014_about_trust_blocks.sql`:

```sql
-- Migration 014: About-page trust blocks — license photo, medical director,
-- verified-numbers note. Localized text columns follow the _uk/_ru/_en pattern.
ALTER TABLE about
  ADD COLUMN IF NOT EXISTS license_image TEXT,
  ADD COLUMN IF NOT EXISTS director_photo TEXT,
  ADD COLUMN IF NOT EXISTS director_name_uk TEXT,
  ADD COLUMN IF NOT EXISTS director_name_ru TEXT,
  ADD COLUMN IF NOT EXISTS director_name_en TEXT,
  ADD COLUMN IF NOT EXISTS director_role_uk TEXT,
  ADD COLUMN IF NOT EXISTS director_role_ru TEXT,
  ADD COLUMN IF NOT EXISTS director_role_en TEXT,
  ADD COLUMN IF NOT EXISTS stats_note_uk TEXT,
  ADD COLUMN IF NOT EXISTS stats_note_ru TEXT,
  ADD COLUMN IF NOT EXISTS stats_note_en TEXT;
```
Create the runner (copy Task 1 pattern, filename `014_about_trust_blocks.sql`). Run: `npx tsx scripts/run-migration-014.ts` → expect ✅.

- [ ] **Step 2: Extend `AboutData`** (types.ts line 51) with:

```ts
  licenseImage?: string | null;
  directorPhoto?: string | null;
  directorName?: string | null;
  directorRole?: string | null;
  statsNote?: string | null;
```

- [ ] **Step 3: Extend the about query.** Find it (`grep -rn "FROM about" src/lib/db/queries`), select the new columns, resolve localized ones with the existing `pick()` helper, return them.

- [ ] **Step 4: Render on `/about`.** Read the About page component, add: a license-photo figure (only if `licenseImage`), a medical-director card (photo + name + role, only if `directorName`), and the `statsNote` line under the existing numbers block. Gate each on presence.

- [ ] **Step 5: Admin editor.** In the About editor add: an image field for `license_image`, image + localized text for the director, and a localized `stats_note` field. Persist all in the update action (extend its `UPDATE about SET …`). Match how the existing `requisites_uk/_ru/_en` fields are edited (migration 009 added those — the form already handles that trio; mirror it).

- [ ] **Step 6: Build + manual check**

Run: `npm run build` → succeeds. In dev, set the fields in admin, confirm they render on `/about` in uk/ru/en and stay hidden when empty.

- [ ] **Step 7: Commit**

```bash
git add scripts/migrations/014_about_trust_blocks.sql scripts/run-migration-014.ts src/lib/db/types.ts src/lib/db/queries "src/app/[locale]/(pages)/about" src/components "src/app/(admin)/admin/pages"
git commit -m "feat(about): license photo, medical director, verified-numbers trust blocks"
```

---

## Self-Review

**Spec coverage (Phase 0 + 1.1 + 1.3):**
- `MedicalDisclaimer` → Task 3, wired Tasks 5/8. ✓
- `ReviewedByBadge` → Task 3, wired Tasks 5/8. ✓
- `MedicalWebPage` reviewedBy/lastReviewed → Task 4, wired Tasks 5/8. ✓
- reviewer_doctor_id + last_reviewed_at on services & blog → Tasks 1/2/6/8. ✓
- Sources (Джерела) block → Task 7. ✓
- About completeness (license photo, medical director, numbers) → Task 9. ✓
- Phase 1.2 (Google reviews) → deliberately deferred to its own plan (external-access-gated). ✓
- Reputation-signals external outreach (row 4), deferred content items (ЗМІ/partners/video/scientific articles) → out of scope per spec. ✓

**Placeholder scan:** All code steps carry real code; the few "read the sibling file first" notes are for matching existing admin-form/section-editor markup that lives in files too large to reproduce verbatim, and each names the exact file + the exact field/statement to add — not vague "add validation" placeholders.

**Type consistency:** `getReviewer` returns `ServiceReviewer` (Task 2) consumed unchanged in Tasks 5/8; `ReviewedByBadge` prop names match the call sites; `JsonLdMedicalWebPage` prop shape matches Task 5/8 usage; `section.sources` `_type` string identical across type, renderer case, and admin picker.

## Notes / follow-up plans

- **Phase 1.2 — Google Business Profile reviews:** separate plan `docs/superpowers/plans/2026-07-13-eeat-phase1-google-reviews.md` (to be written) once the client grants Business Profile API access (see spec §1.2 prerequisites).
- **Phase 2** (FAQ page, equipment detail pages, "Консультація лікаря", QA pass) and **Phase 3** (newsletter) → their own plans when reached.
