# Дооптимізація of apparatus-cosmetology pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the content blocks Inweb's optimisation spec requires to six `apparatus-cosmetology` service pages, using the RU copy they supplied, translated to UA and EN.

**Architecture:** Three scripts in sequence, each producing a reviewable artefact before the next runs — extract the exported HTML into structured JSON, enrich that JSON with UA/EN translations, then seed it into `content_sections`. No application code changes: every required block maps onto a section type that already exists in the DB enum, the admin editor and the renderer.

**Tech Stack:** TypeScript run with `npx tsx`, `postgres` client against Neon, `src/lib/translate.ts` (`ai` SDK + `@ai-sdk/openai`, gpt-4o-mini).

**Spec:** `docs/superpowers/specs/2026-07-31-dooptymizatsiya-apparatus-pages-design.md`

## Global Constraints

- **Branch:** all work on `develop`. Never commit or push to `main`. Verify with `git branch --show-current` before every commit.
- **No application code changes.** Only files under `scripts/` and the JSON artefact. If you believe a component or type must change, stop and report — it means the mapping in the spec is wrong.
- **Target pages:** `body`, `splendor-x`, `emsculpt-neo`, `ultraformer-mpt-body`, `exion-body`, `m22-stellar-black`, all under `apparatus-cosmetology`.
- **Do NOT create "Фото До/Після" blocks.** The copy has a literal `…` placeholder there and no images exist.
- **Do NOT rewrite Inweb's wording** to inject keywords. Their copy goes in as delivered.
- **The database is the SHARED PRODUCTION Neon dataset.** Only touch `content_sections` rows for the six target services, and only rows carrying the provenance marker. Never modify `services`, `service_categories` or any other table.
- **Provenance marker:** every inserted row's `data` gets `"source": "inweb-tz1"`. The seed deletes only rows with that marker before inserting, so hand-authored sections are never destroyed and re-runs never duplicate.
- **Locale value shapes**, copied verbatim from existing rows:
  - string: `{ "_type": "localeString", "uk": "...", "ru": "...", "en": "..." }`
  - string array: `{ "_type": "localeStringArray", "uk": [...], "ru": [...], "en": [...] }`
  - long text: `{ "_type": "localeText", "uk": "...", "ru": "...", "en": "..." }`
- **Section data shapes**, from `createDefaultData` in `src/app/(admin)/admin/_components/section-editors.tsx:32-68`:
  - `bullets`: `{ heading: localeString, items: localeStringArray }`
  - `indicationsContraindications`: `{ title, indicationsHeading, indications, contraindicationsHeading, contraindications }`
  - `priceTable`: `{ heading: localeString, rows: [{ label: localeString, price: localeString }], note: localeString }`
  - `compareTable`: `{ heading: localeString, columns: localeStringArray, rows: [{ label: localeString, values: localeStringArray }] }`
  - `richText`: `{ heading: localeString, body: localeText }`
- **Scripts read `DATABASE_URL` from `.env.local`**, following the pattern in `scripts/run-migration-019.ts`.
- No test runtime exists. Verification is purpose-built check scripts plus a real dev server.

---

### Task 1: Extract the RU copy into structured JSON

**Files:**
- Create: `scripts/dooptim/extract-copy.ts`
- Create (output, committed): `scripts/dooptim/copy-ru.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `scripts/dooptim/copy-ru.json` with this exact shape, which Tasks 2 and 3 read:

```ts
interface Extracted {
  pages: {
    slug: string;              // "body" | "splendor-x" | ...
    sections: ExtractedSection[];
  }[];
}
type ExtractedSection =
  | { type: "bullets"; heading: string; items: string[]; after?: string }
  | { type: "indicationsContraindications"; title: string;
      indicationsHeading: string; indications: string[];
      contraindicationsHeading: string; contraindications: string[]; after?: string }
  | { type: "priceTable"; heading: string; rows: { label: string; price: string }[]; note: string; after?: string }
  | { type: "compareTable"; heading: string; columns: string[]; rows: { label: string; values: string[] }[]; after?: string }
  | { type: "richText"; heading: string; body: string; after?: string };
```

`after` is optional and only used on the `body` page: it names the device whose existing
`richText` this block must follow (`"EMSCULPT NEO" | "Ultraformer MPT" | "Exion Body"`).

- [ ] **Step 1: Write the extractor**

Create `scripts/dooptim/extract-copy.ts`. It reads the exported HTML, strips `<style>`/`<script>`, converts `</td>`/`</th>` to a cell separator and block-closing tags to newlines, unescapes entities, then walks the resulting lines splitting on the `№N <url>` page markers.

Content that MUST be dropped:
- lines that are exactly `…` (the photo placeholders),
- the stray artefact line `3503 сбп` and any `[IMG]` marker,
- the `№N <url>` marker lines themselves.

Write the parsed result to `scripts/dooptim/copy-ru.json` with `JSON.stringify(out, null, 2)`.

Because the source is a hand-made Google Doc rather than a schema, hard-code the block boundaries per page from the headings rather than inferring them generically — a generic parser over six irregular pages is more code and less reliable. Drive it from a table of `{ pageSlug, headingText, sectionType }`.

The headings present in the document, verified by reading it:
- `body`: `Показания` / `Противопоказания` ×3 (one per device), `Цена` ×3, `Подготовка и рекомендации после аппаратных процедур для тела`
- `splendor-x`: `Подготовка к процедуре`, `Показания к Splendor X`, `Противопоказания`, `Рекомендации после процедуры`, `Поэтапные результаты после сеансов Splendor X`, `Полный прайс по зонам (за один сеанс)`
- `emsculpt-neo`: `Показания к EMSCULPT NEO`, `Противопоказания`, `Результат процедуры`, `Стоимость процедуры`
- `ultraformer-mpt-body`: `Показания к Ultraformer MPT для тела`, `Противопоказания`, `Сравнение методов`, `Цены`, `Результаты по этапам курса`, `Подготовка и обезболивание`, `После процедуры`
- `exion-body`: `Показания к Exion Body`, `Противопоказания`, `Результаты процедуры`, `Цены`, `Подготовка кожи`, `Уход после процедуры`
- `m22-stellar-black`: `Показания к M22 Stellar Black`, `Противопоказания`, `Когда лучше всего делать процедуру`, `Подготовка и защита глаз`, `Рекомендации после проведения процедуры`, `Стоимость`

- [ ] **Step 2: Run the extractor**

Run: `npx tsx scripts/dooptim/extract-copy.ts`
Expected: writes `scripts/dooptim/copy-ru.json` and prints a per-page summary.

- [ ] **Step 3: Write a check script that validates the extraction**

Create `scripts/dooptim/check-copy.ts`:

```ts
import * as fs from "fs";
const data = JSON.parse(fs.readFileSync("scripts/dooptim/copy-ru.json", "utf-8"));
const SLUGS = ["body","splendor-x","emsculpt-neo","ultraformer-mpt-body","exion-body","m22-stellar-black"];
let bad = 0;
const fail = (m: string) => { console.log("✗ " + m); bad++; };

if (data.pages.length !== 6) fail(`expected 6 pages, got ${data.pages.length}`);
for (const slug of SLUGS) if (!data.pages.find((p: any) => p.slug === slug)) fail(`missing page ${slug}`);

for (const p of data.pages) {
  if (!p.sections.length) fail(`${p.slug}: no sections`);
  for (const s of p.sections) {
    const j = JSON.stringify(s);
    if (j.includes("…")) fail(`${p.slug}/${s.type}: photo placeholder leaked in`);
    if (j.includes("3503")) fail(`${p.slug}/${s.type}: artefact "3503 сбп" leaked in`);
    if (j.includes("[IMG]")) fail(`${p.slug}/${s.type}: [IMG] marker leaked in`);
    if (j.includes("№")) fail(`${p.slug}/${s.type}: page marker leaked in`);
    if (s.type === "bullets" && !s.items.length) fail(`${p.slug}: empty bullets "${s.heading}"`);
    if (s.type === "compareTable") {
      if (!s.columns.length) fail(`${p.slug}: compareTable "${s.heading}" has no columns`);
      for (const r of s.rows)
        if (r.values.length !== s.columns.length)
          fail(`${p.slug}: compareTable "${s.heading}" row "${r.label}" has ${r.values.length} values but ${s.columns.length} columns`);
    }
    if (s.type === "priceTable" && !s.rows.length) fail(`${p.slug}: empty priceTable "${s.heading}"`);
    if (s.type === "indicationsContraindications" && (!s.indications.length || !s.contraindications.length))
      fail(`${p.slug}: indications/contraindications block is half empty`);
  }
  console.log(`  ${p.slug}: ${p.sections.length} sections — ${p.sections.map((s: any) => s.type).join(", ")}`);
}
console.log(bad ? `\n✗ ${bad} problem(s)` : "\n✓ extraction looks sane");
process.exit(bad ? 1 : 0);
```

- [ ] **Step 4: Run the check until clean**

Run: `npx tsx scripts/dooptim/check-copy.ts`
Expected: exit 0, `✓ extraction looks sane`, and a per-page section list.

The column-count assertion is the important one — the copy's tables are the most likely thing to mis-parse, and a ragged table renders broken.

- [ ] **Step 5: Eyeball the JSON against the source**

Open `scripts/dooptim/copy-ru.json` and compare two things by hand against the doc: the `splendor-x` price table (it is the largest, `Полный прайс по зонам`) and the `ultraformer-mpt-body` `Сравнение методов` table. Confirm row labels and cell values line up with the right columns. Report what you compared.

- [ ] **Step 6: Commit**

```bash
git branch --show-current   # must print: develop
git add scripts/dooptim/extract-copy.ts scripts/dooptim/check-copy.ts scripts/dooptim/copy-ru.json
git commit -m "feat(services): extract Inweb дооптимізація copy into structured JSON"
```

---

### Task 2: Translate the copy into UA and EN

**Files:**
- Create: `scripts/dooptim/translate-copy.ts`
- Create (output, committed): `scripts/dooptim/copy-i18n.json`

**Interfaces:**
- Consumes: `scripts/dooptim/copy-ru.json` (Task 1).
- Produces: `scripts/dooptim/copy-i18n.json` — the same structure, but every string replaced by `{ uk: string; ru: string; en: string }`. Task 3 reads it.

- [ ] **Step 1: Write the translator**

Create `scripts/dooptim/translate-copy.ts`. It walks the extracted JSON and, for every user-visible string, produces a `{uk, ru, en}` triple with `ru` set to the original.

Use `translateHeadline(text, target)` from `src/lib/translate.ts` for headings, list items, table cells and price labels — these are short strings. Use `translateHtml` **only** for `richText.body`.

Two requirements:
- **Never fall back to RU on failure.** `translateHeadline` returns `""` on error; keep that empty so gaps are visible rather than silently leaving Russian text in the Ukrainian column.
- **Cache identical strings.** The copy repeats contraindications heavily across pages (`Беременность и лактация`, `Онкология`, `Эпилепсия` appear many times). Translate each distinct string once and reuse — this is the difference between a few hundred model calls and a few thousand.

Run translations with limited concurrency (8 at a time is fine) and print progress, because this will take minutes.

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/dooptim/translate-copy.ts`

Requires `OPENAI_API_KEY` in `.env.local` — confirm with `grep -c OPENAI_API_KEY .env.local` before starting. If it is absent, STOP and report rather than guessing at a key.

Expected: writes `scripts/dooptim/copy-i18n.json`, prints the number of distinct strings translated and the number of failures.

- [ ] **Step 3: Write a check script for translation coverage**

Create `scripts/dooptim/check-i18n.ts` that walks `copy-i18n.json` and reports, per page: how many locale triples are complete, how many have an empty `uk`, and how many have an empty `en`. It exits non-zero if any `ru` value is empty (that would mean the extraction was damaged), and prints — but tolerates — empty `uk`/`en` so you can see the real translation failure rate.

- [ ] **Step 4: Run it**

Run: `npx tsx scripts/dooptim/check-i18n.ts`
Expected: exit 0, and a report. If more than a handful of `uk` values are empty, re-run the translator for the failed strings before continuing — a page half in Ukrainian is worse than one that is obviously untranslated.

- [ ] **Step 5: Spot-check the Ukrainian**

Print three translated Ukrainian strings from different pages and read them. Medical terms are the risk: confirm that terms like `Онкологія`, `Вагітність та лактація`, `Епілепсія` came out as real Ukrainian medical wording rather than transliterated Russian. Report the three you checked.

- [ ] **Step 6: Commit**

```bash
git branch --show-current   # must print: develop
git add scripts/dooptim/translate-copy.ts scripts/dooptim/check-i18n.ts scripts/dooptim/copy-i18n.json
git commit -m "feat(services): translate дооптимізація copy to UA and EN"
```

---

### Task 3: Seed the sections into the database

**Files:**
- Create: `scripts/dooptim/seed-sections.ts`

**Interfaces:**
- Consumes: `scripts/dooptim/copy-i18n.json` (Task 2).
- Produces: rows in `content_sections` for the six services, every one carrying `data.source = "inweb-tz1"`.

- [ ] **Step 1: Write the seed script**

Create `scripts/dooptim/seed-sections.ts`. Default to a **dry run**; write only when passed `--apply`.

Behaviour:
1. Resolve each target slug to its `services.id`. Abort if any of the six is missing.
2. Delete existing rows: `DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = $1 AND data->>'source' = 'inweb-tz1'`. This makes re-runs idempotent while leaving hand-authored sections alone.
3. Push any existing `cta` section for that service to `sort_order = 900` so it stays last.
4. Insert the new sections with `sort_order` starting at 100, incrementing by 10.
5. For the `body` page only, honour the `after` field: a section with `after: "EMSCULPT NEO"` must be ordered directly after the existing `richText` that mentions that device. Find those existing rows by searching their `data->'body'->>'ru'` for the device name, take that row's `sort_order`, and give the new section a fractional slot by renumbering that page's sections in one pass at the end.
6. Wrap each service's delete-and-insert in a transaction so a failure cannot leave a page half-seeded.
7. Print a per-service summary: how many rows deleted, how many inserted, and the resulting ordered list of `(sort_order, section_type)`.

Every localised value must be written in the exact shapes given in Global Constraints, including the `_type` discriminators — the admin editor and renderer both rely on them.

- [ ] **Step 2: Dry run**

Run: `npx tsx scripts/dooptim/seed-sections.ts`
Expected: prints what it would delete and insert for each of the six services, and writes nothing. Confirm the counts match the extraction summary from Task 1 Step 4.

- [ ] **Step 3: Capture a rollback snapshot**

Before writing, dump every existing `content_sections` row for the six services to `scripts/dooptim/rollback-sections.json` (id, owner_id, sort_order, section_type, data). Keep it out of git — write it to the scratchpad directory — but state its path in your report.

- [ ] **Step 4: Apply**

Run: `npx tsx scripts/dooptim/seed-sections.ts --apply`
Expected: per-service summary showing rows inserted and the final ordering.

- [ ] **Step 5: Verify idempotency**

Run the same command a second time: `npx tsx scripts/dooptim/seed-sections.ts --apply`
Expected: the same final row count as after the first run — the delete-by-marker removes the previous insert. If the count grows, the marker logic is broken; fix it before continuing.

- [ ] **Step 6: Verify hand-authored sections survived**

Query each of the six services and confirm the original sections (the ones without the `inweb-tz1` marker) are all still present, with `cta` last. Print the ordered `(sort_order, section_type, source?)` list per page.

- [ ] **Step 7: Commit**

```bash
git branch --show-current   # must print: develop
git add scripts/dooptim/seed-sections.ts
git commit -m "feat(services): seed дооптимізація sections for apparatus-cosmetology pages"
```

---

### Task 4: Verify the six pages render

**Files:** none (verification only, plus any fix a real problem requires).

**Interfaces:**
- Consumes: everything from Tasks 1–3.

- [ ] **Step 1: Confirm no application code changed**

Run: `git diff --stat 239c5e2..HEAD -- src/`
Expected: empty. This task must not have touched `src/`. If it did, explain why in your report.

Then run `npx tsc --noEmit` and `npm run build` and confirm both are clean.

- [ ] **Step 2: Start the dev server**

Run `npm run dev` in the background and wait for it to report ready.

- [ ] **Step 3: Load all six pages in a browser and screenshot each**

Visit each of the six, in Ukrainian (no locale prefix):

```
/services/apparatus-cosmetology/body
/services/apparatus-cosmetology/splendor-x
/services/apparatus-cosmetology/emsculpt-neo
/services/apparatus-cosmetology/ultraformer-mpt-body
/services/apparatus-cosmetology/exion-body
/services/apparatus-cosmetology/m22-stellar-black
```

For each, confirm and screenshot: the new blocks appear; the `compareTable` blocks render as real tables and are not clipped or overflowing horizontally at desktop width; the indications/contraindications block shows both columns; no block renders with a visible empty body.

- [ ] **Step 4: Check the tables at mobile width**

Re-load `splendor-x` (largest price table) and `ultraformer-mpt-body` (comparison table) at 375px and screenshot. Wide tables are the most likely thing to break the layout. If a table overflows the viewport, report it with the screenshot — do NOT change component code to fix it without checking in first, since that is outside this plan's scope.

- [ ] **Step 5: Check one page in RU and EN**

Load `/ru/services/apparatus-cosmetology/emsculpt-neo` and `/en/services/apparatus-cosmetology/emsculpt-neo`. Confirm the new blocks show translated content and not empty fields or Russian text sitting in the English page.

- [ ] **Step 6: Stop the server and report**

Stop the dev server. Report: which pages you verified, screenshots taken, anything that rendered wrong, and the count of new sections per page.

- [ ] **Step 7: Do NOT deploy**

Leave everything on `develop`, unpushed unless told otherwise. Publishing to production is explicitly out of scope and additionally requires a production redeploy, because `/api/revalidate` on `main` does not invalidate service pages.
