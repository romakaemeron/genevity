# Full Price Catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 34 hand-curated price rows on `/prices` with the clinic's full 575-service catalogue, imported from `Прайс Геліос-4.xlsx`, browsable by category and subcategory with instant search.

**Architecture:** A parser module reads the `прайс GENEVITY (Гончара)` sheet and emits a normalized tree (category → subcategory → item). A taxonomy module applies the project's editorial rules to that tree (category-8 split, consultation exclusion, visibility). A diff module compares the tree against the database and classifies every row. An apply module writes a confirmed diff. The same three modules back both a CLI seed script and an admin upload screen. The page renders the resulting tree as sticky category pills over collapsible subcategory sections.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Neon Postgres via `@neondatabase/serverless` (app) and `postgres` (scripts), Tailwind v4, next-intl with UI strings stored in the `ui_strings` JSONB table, `exceljs` (new), `vitest` (new).

**Spec:** `docs/superpowers/specs/2026-09-21-price-catalogue-design.md`

## Global Constraints

- **Branch:** all work on `develop`. Never commit or push to `main`. Verify with `git branch --show-current` before every commit.
- **Source file:** `Прайс Геліос-4.xlsx` in the repo root. Only sheet 1, `прайс GENEVITY (Гончара)`, is in scope. All other sheets are ignored.
- **Locales:** `uk` (canonical), `ru`, `en`. DB columns are `*_uk` / `*_ru` / `*_en`; `pick()` in `src/lib/db/queries/phase2.ts` already falls back to `_uk`.
- **Migrations:** SQL in `scripts/migrations/NNN_name.sql`, runner in `scripts/run-migration-NNN.ts`, run with `npx tsx`. Next free number is **024**.
- **Scripts** read `DATABASE_URL` by parsing `../.env.local` by hand and connect with `postgres` (see `scripts/run-migration-019.ts`). App code uses `sql` from `@/lib/db/client`.
- **Path alias:** `@/` → `./src/`.
- **Consultations are never imported.** The `consultations` category keeps its existing rows and prices, including ендокринолог 1 100 ₴ and гастроентеролог 1 100 ₴.
- **Hidden on import:** the Крапельниці category and its single row; the oncology/urology/intimate-injection rows listed in Task 3.
- **Destructive deletes are forbidden.** Rows absent from a newer spreadsheet are set `is_visible=false`, never deleted.
- **Never run** `npm run dev` in a blocking foreground call. Use `npm run build` to verify.

---

### Task 1: Schema migration

**Files:**
- Create: `scripts/migrations/024_price_catalogue.sql`
- Create: `scripts/run-migration-024.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: table `price_subcategories`, and new columns on `price_items` — `subcategory_id uuid`, `duration text`, `roapp_service_id text`, `note_uk/ru/en text`, `price_numeric integer`, `is_visible boolean`, `source text`. Also `price_categories.is_visible boolean`.

- [ ] **Step 1: Write the migration SQL**

Create `scripts/migrations/024_price_catalogue.sql`:

```sql
-- Migration 024: full price catalogue.
-- Adds a subcategory level between price_categories and price_items, plus the
-- per-item metadata carried by the clinic's spreadsheet (duration, RoApp
-- service id, notes) and the visibility/provenance flags the importer needs.

CREATE TABLE IF NOT EXISTS price_subcategories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES price_categories(id) ON DELETE CASCADE,
  slug        text NOT NULL,
  label_uk    text NOT NULL,
  label_ru    text,
  label_en    text,
  is_visible  boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS price_subcategories_category_idx
  ON price_subcategories (category_id, sort_order);

ALTER TABLE price_items
  ADD COLUMN IF NOT EXISTS subcategory_id   uuid REFERENCES price_subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duration         text,
  ADD COLUMN IF NOT EXISTS roapp_service_id text,
  ADD COLUMN IF NOT EXISTS note_uk          text,
  ADD COLUMN IF NOT EXISTS note_ru          text,
  ADD COLUMN IF NOT EXISTS note_en          text,
  ADD COLUMN IF NOT EXISTS price_numeric    integer,
  ADD COLUMN IF NOT EXISTS is_visible       boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS source           text NOT NULL DEFAULT 'manual';

ALTER TABLE price_categories
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS price_items_subcategory_idx
  ON price_items (subcategory_id, sort_order);

-- Matching key for re-imports. Not unique: the sheet reuses a blank id for
-- some rows, so the diff falls back to (category, subcategory, name).
CREATE INDEX IF NOT EXISTS price_items_roapp_idx
  ON price_items (roapp_service_id);
```

- [ ] **Step 2: Write the runner**

Create `scripts/run-migration-024.ts`:

```ts
/**
 * Add price_subcategories + price_items catalogue columns.
 * Run: npx tsx scripts/run-migration-024.ts
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
    path.resolve(__dirname, "migrations/024_price_catalogue.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 024 applied");
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'price_items' ORDER BY ordinal_position`;
  console.log("price_items:", cols.map((r) => r.column_name).join(", "));
  const sub = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'price_subcategories' ORDER BY ordinal_position`;
  console.log("price_subcategories:", sub.map((r) => r.column_name).join(", "));
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Run it**

Run: `npx tsx scripts/run-migration-024.ts`
Expected: `✓ Migration 024 applied`, then both column lists printed, with `subcategory_id`, `duration`, `roapp_service_id`, `price_numeric`, `is_visible`, `source` present on `price_items`.

- [ ] **Step 4: Verify existing rows are untouched**

Run: `npx tsx scripts/check-prices.ts`
Expected: the existing 34 items still print with their current prices. The migration is additive; nothing should have changed.

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must print: develop
git add scripts/migrations/024_price_catalogue.sql scripts/run-migration-024.ts
git commit -m "feat(prices): add subcategory table and catalogue columns"
```

---

### Task 2: XLSX parser

**Files:**
- Create: `src/lib/prices/parse-xlsx.ts`
- Create: `src/lib/prices/parse-xlsx.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add `exceljs`, `vitest`, `test` script)

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  export interface ParsedItem {
    roappServiceId: string | null;
    nameUk: string;
    duration: string | null;
    price: string;
    priceNumeric: number | null;
    noteUk: string | null;
  }
  export interface ParsedSubcategory { labelUk: string; groupUk: string | null; items: ParsedItem[] }
  export interface ParsedCategory {
    index: number;              // 1–8 from column A
    labelUk: string;
    subcategories: ParsedSubcategory[];   // items with no subcategory go in one with labelUk === ""
  }
  export function parseGenevitySheet(buffer: Buffer): Promise<ParsedCategory[]>;
  export function parsePrice(raw: string): { display: string; numeric: number | null };
  ```

**Context the executor needs.** The sheet's shape is the only classification signal:

| Column A | Column B | Price col | Meaning |
|---|---|---|---|
| integer 0–8 | text | absent | **category** header (0 = the consultations block at the top of the sheet) |
| absent | **bold** text | absent | **group** header — an umbrella over the non-bold headers beneath it |
| absent | non-bold text | absent | **subcategory** header |
| any number | text | present | **item** |
| anything | empty | — | skip |

**The sheet encodes its third hierarchy level in bold, not in position.** A
bold header row ("Exion", "RF-ліфтінг", "Естетична хірургія", "Естетична
медицина", "Видалення новоутворень шкіри та слизових") is an umbrella; the
non-bold header rows beneath it are its children, until the next bold header
or the next category. A bold header that owns items directly ("SMAS-ліфтінг
ULTRAFORMER", "EmFace", "Volnewmer") is an ordinary subcategory with no group
of its own. Read it with exceljs via `cell.font?.bold`. Do not infer the
hierarchy from position or from the "N. " numbering — both give the wrong
answer on this sheet.

Prices live in column D but arrive in three shapes: `40 000` (non-breaking or regular space as thousands separator), `950.0` (Excel float), and `10`. Durations in column C are usually an integer as float (`90.0`) but one row is the literal string `15/30`. Column E carries free-text notes (`Гармаш С.К.`, `нова послуга 22/06`).

- [ ] **Step 1: Install dependencies**

```bash
npm install exceljs
npm install -D vitest
```

Then add to the `scripts` block of `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Create the vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Write the failing test**

Create `src/lib/prices/parse-xlsx.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet, parsePrice, type ParsedCategory } from "./parse-xlsx";

const XLSX = path.resolve(__dirname, "../../../Прайс Геліос-4.xlsx");

describe("parsePrice", () => {
  it("strips thousands separators and keeps the display string", () => {
    expect(parsePrice("40 000")).toEqual({ display: "40 000", numeric: 40000 });
  });
  it("normalizes Excel floats to integers", () => {
    expect(parsePrice("950.0")).toEqual({ display: "950", numeric: 950 });
  });
  it("handles bare small numbers", () => {
    expect(parsePrice("10")).toEqual({ display: "10", numeric: 10 });
  });
  it("handles non-breaking space separators", () => {
    expect(parsePrice("1 500")).toEqual({ display: "1 500", numeric: 1500 });
  });
});

describe("parseGenevitySheet", () => {
  let cats: ParsedCategory[];
  beforeAll(async () => {
    cats = await parseGenevitySheet(fs.readFileSync(XLSX));
  });

  it("finds 8 numbered categories plus the consultations block", () => {
    expect(cats.map((c) => c.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("reads the consultations block at the top of the sheet as category 0", () => {
    const consultations = cats.find((c) => c.index === 0)!;
    expect(consultations.labelUk).toBe("Консультації лікарів");
    expect(consultations.subcategories.flatMap((s) => s.items)).toHaveLength(24);
  });

  it("names them as the sheet does", () => {
    const byIndex = (n: number) => cats.find((c) => c.index === n)!;
    expect(byIndex(1).labelUk).toBe("Апаратні процедури");
    expect(byIndex(2).labelUk).toBe("Лазерна епіляція");
    expect(byIndex(6).labelUk).toBe("Подологія");
  });

  it("parses 575 priced rows in total, consultations included", () => {
    const total = cats.reduce(
      (n, c) => n + c.subcategories.reduce((m, s) => m + s.items.length, 0), 0);
    expect(total).toBe(575);
  });

  it("groups laser epilation into women's and men's subcategories", () => {
    const laser = cats.find((c) => c.index === 2)!;
    expect(laser.subcategories.map((s) => s.labelUk)).toEqual([
      "Жіноча лазерна епіляція",
      "Чоловіча лазерна епіляція",
    ]);
  });

  it("reads the corrected epilation prices from the sheet", () => {
    const women = cats.find((c) => c.index === 2)!.subcategories[0];
    const pahvy = women.items.find((i) => i.nameUk === "Пахви")!;
    const bikini = women.items.find((i) => i.nameUk === "Повне бікіні")!;
    expect(pahvy.priceNumeric).toBe(810);
    expect(bikini.priceNumeric).toBe(1540);
  });

  it("captures duration, RoApp id and notes", () => {
    const apparatus = cats.find((c) => c.index === 1)!;
    const smas = apparatus.subcategories.find((s) => s.labelUk === "SMAS-ліфтінг ULTRAFORMER")!;
    const full = smas.items.find((i) => i.nameUk.startsWith("Full face"))!;
    expect(full.duration).toBe("90");
    expect(full.roappServiceId).toBe("10001");
    expect(full.priceNumeric).toBe(40000);

    const noted = apparatus.subcategories
      .flatMap((s) => s.items)
      .find((i) => i.noteUk?.includes("Гармаш"));
    expect(noted).toBeDefined();
  });

  it("preserves the one non-numeric duration verbatim", () => {
    const odd = cats
      .flatMap((c) => c.subcategories)
      .flatMap((s) => s.items)
      .filter((i) => i.duration !== null && !/^\d+$/.test(i.duration));
    expect(odd.map((i) => i.duration)).toContain("15/30");
  });

  it("attaches a bold group header to every child beneath it", () => {
    const apparatus = cats.find((c) => c.index === 1)!;
    const grouped = (g: string) => apparatus.subcategories
      .filter((s) => s.groupUk === g).map((s) => s.labelUk);

    expect(grouped("Exion")).toEqual([
      "1. Фракційний мікроігольчастий RF",
      "2. Монополярний RF-ліфтінг",
      "3. RF-ліфтинг + ультразвук",
      "4. Гінекологія",
    ]);
    expect(grouped("RF-ліфтінг")).toEqual(["EmSculpt"]);
  });

  it("stops a group at the next bold header", () => {
    const apparatus = cats.find((c) => c.index === 1)!;
    // EmFace is bold and owns items, so it is its own subcategory — it must
    // NOT inherit Exion, which is the header immediately above its run.
    const emface = apparatus.subcategories.find((s) => s.labelUk === "EmFace")!;
    expect(emface.groupUk).toBeNull();
    const volnewmer = apparatus.subcategories.find((s) => s.labelUk === "Volnewmer")!;
    expect(volnewmer.groupUk).toBeNull();
  });

  it("attaches the surgery umbrellas to all of their children", () => {
    const mixed = cats.find((c) => c.index === 8)!;
    const grouped = (g: string) => mixed.subcategories
      .filter((s) => s.groupUk === g).map((s) => s.labelUk);

    expect(grouped("Естетична хірургія")).toEqual([
      "Пластика",
      "Видалення новоутворень хірургічним шляхом",
      "Лазерні методики Smart Lipo",
    ]);
    expect(grouped("Естетична медицина")).toEqual([
      "Нітковий ліфтинг",
      "Ліпофілінг",
      "Інʼєкційни методики",
    ]);
  });

  it("leaves groupUk null for an ordinary subcategory", () => {
    const laser = cats.find((c) => c.index === 2)!;
    expect(laser.subcategories[0].groupUk).toBeNull();
  });

  it("loses no header text anywhere in the sheet", () => {
    const groups = new Set(
      cats.flatMap((c) => c.subcategories).map((s) => s.groupUk).filter(Boolean));
    expect([...groups].sort()).toEqual([
      "Exion",
      "RF-ліфтінг",
      "Видалення новоутворень шкіри та слизових",
      "Естетична медицина",
      "Естетична хірургія",
    ].sort());
  });

  it("puts subcategory-less items in an unnamed bucket", () => {
    const podology = cats.find((c) => c.index === 6)!;
    expect(podology.subcategories[0].labelUk).toBe("");
    expect(podology.subcategories[0].items.length).toBeGreaterThan(30);
  });
});
```

- [ ] **Step 4: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./parse-xlsx"`.

- [ ] **Step 5: Implement the parser**

Create `src/lib/prices/parse-xlsx.ts`:

```ts
import ExcelJS from "exceljs";

/** The only sheet in the Геліос workbook that belongs to GENEVITY. */
export const GENEVITY_SHEET = "прайс GENEVITY (Гончара)";

export interface ParsedItem {
  roappServiceId: string | null;
  nameUk: string;
  duration: string | null;
  price: string;
  priceNumeric: number | null;
  noteUk: string | null;
}

export interface ParsedSubcategory {
  labelUk: string;
  /**
   * The sheet has a third, unlabelled hierarchy level: a header row followed
   * immediately by another header row rather than by items — "Exion" above
   * "1. Фракційний мікроігольчастий RF", "Естетична хірургія" above "Пластика".
   * Such a group header owns no items, so unless it is carried on its children
   * its text is lost entirely. taxonomy.ts decides how to present it; the
   * parser only records it.
   */
  groupUk: string | null;
  items: ParsedItem[];
}

export interface ParsedCategory {
  index: number;
  labelUk: string;
  subcategories: ParsedSubcategory[];
}

/**
 * The sheet mixes "40 000" (spaced thousands, sometimes NBSP), Excel floats
 * like "950.0", and bare "10". Keep a clean display string, derive an integer
 * for structured data. Returns numeric: null when nothing parses.
 */
export function parsePrice(raw: string): { display: string; numeric: number | null } {
  const normalized = String(raw).replace(/ /g, " ").trim();
  const digits = normalized.replace(/[\s]/g, "");
  const asFloat = Number(digits.replace(",", "."));
  if (!Number.isFinite(asFloat)) return { display: normalized, numeric: null };
  const numeric = Math.round(asFloat);
  // "950.0" should display as "950"; "40 000" should keep its spacing.
  const display = /\.\d+$/.test(normalized) ? String(numeric) : normalized;
  return { display, numeric };
}

function cellText(cell: ExcelJS.Cell | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) return "";
  const v = cell.value;
  if (typeof v === "object" && "richText" in v) {
    return (v.richText as { text: string }[]).map((t) => t.text).join("").trim();
  }
  if (typeof v === "object" && "text" in v) return String((v as { text: string }).text).trim();
  if (typeof v === "object" && "result" in v) return String((v as { result: unknown }).result ?? "").trim();
  return String(v).trim();
}

/** Excel stores the duration 90 as "90.0"; keep "15/30" as written. */
function normalizeDuration(raw: string): string | null {
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isFinite(n)) return String(Math.round(n));
  return raw;
}

/** Column A holds a service id like 10001, or a category index 1–8. */
function normalizeServiceId(raw: string): string | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return String(Math.round(n));
}

export async function parseGenevitySheet(buffer: Buffer): Promise<ParsedCategory[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = wb.getWorksheet(GENEVITY_SHEET);
  if (!sheet) throw new Error(`Sheet not found: ${GENEVITY_SHEET}`);

  const categories: ParsedCategory[] = [];
  let currentCategory: ParsedCategory | null = null;
  let currentSub: ParsedSubcategory | null = null;

  sheet.eachRow((row) => {
    const a = cellText(row.getCell(1));
    const b = cellText(row.getCell(2));
    const c = cellText(row.getCell(3));
    const d = cellText(row.getCell(4));
    const e = cellText(row.getCell(5));

    if (!b) return;                       // blank or spacer row

    const aNum = a ? Number(a) : NaN;
    const hasPrice = d !== "" && /\d/.test(d);

    // Category header: small integer index in A, no price.
    if (!hasPrice && Number.isFinite(aNum) && aNum >= 1 && aNum <= 8 && Number.isInteger(aNum)) {
      currentCategory = { index: aNum, labelUk: b, subcategories: [] };
      currentSub = null;
      categories.push(currentCategory);
      return;
    }

    // Subcategory header: text in B alone, no price.
    if (!hasPrice) {
      if (!currentCategory) return;       // headers above category 1 are ignored
      currentSub = { labelUk: b, items: [] };
      currentCategory.subcategories.push(currentSub);
      return;
    }

    // Item.
    if (!currentCategory) return;
    if (!currentSub) {
      currentSub = { labelUk: "", items: [] };
      currentCategory.subcategories.push(currentSub);
    }
    const { display, numeric } = parsePrice(d);
    currentSub.items.push({
      roappServiceId: normalizeServiceId(a),
      nameUk: b,
      duration: normalizeDuration(c),
      price: display,
      priceNumeric: numeric,
      noteUk: e || null,
    });
  });

  // Drop header-only subcategories left empty by spacer rows.
  for (const cat of categories) {
    cat.subcategories = cat.subcategories.filter((s) => s.items.length > 0);
  }
  return categories;
}
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: PASS, all assertions in both describe blocks.

If the total is not exactly 575, print the per-category counts and compare against the spec's table. The 575 came from a different counting heuristic than this parser implements, so it is a strong prior, not ground truth: first assume the parser is missing a row shape and fix the rules. If the parser is demonstrably right and the constant wrong, correct the constant — but only with the per-category breakdown as evidence, and say in your report which number you settled on and why.

- [ ] **Step 7: Commit**

```bash
git branch --show-current   # must print: develop
git add package.json package-lock.json vitest.config.ts src/lib/prices/parse-xlsx.ts src/lib/prices/parse-xlsx.test.ts
git commit -m "feat(prices): parse the GENEVITY sheet of the Helios price book"
```

---

### Task 3: Taxonomy rules

**Files:**
- Create: `src/lib/prices/taxonomy.ts`
- Create: `src/lib/prices/taxonomy.test.ts`

**Interfaces:**
- Consumes: `ParsedCategory` from `./parse-xlsx`.
- Produces:
  ```ts
  export interface CatalogueItem extends ParsedItem { isVisible: boolean }
  export interface CatalogueSubcategory { slug: string; labelUk: string; isVisible: boolean; items: CatalogueItem[] }
  export interface CatalogueCategory { slug: string; labelUk: string; isVisible: boolean; subcategories: CatalogueSubcategory[] }
  export function applyTaxonomy(parsed: ParsedCategory[]): CatalogueCategory[];
  export function slugify(uk: string): string;
  ```

**Context.** This is where the spec's editorial decisions live, isolated from parsing so they can be changed without touching the reader. Three rules:

0. **The consultations block is dropped.** The sheet opens with 24 consultation rows under a header carrying `A=0`, before category 1. The parser reports them faithfully as category index 0; this module drops them, because the site's consultations category is curated by hand and deliberately carries different prices. This is the single place that exclusion lives.
1. **Group headers fold into their children.** The parser reports a `groupUk`
   for any subcategory whose header was preceded by a header that owned no items
   of its own. This module composes the display label — `Exion — Фракційний
   мікроігольчастий RF` — and strips the sheet's `N. ` numbering. Without this
   the page shows a bare numbered fragment with no device name.
2. **Category 8 splits.** The sheet bundles IV drips, surgery and aesthetic medicine under one heading. `Нітковий ліфтинг` and `Ліпофілінг` move into Ін'єкційна косметологія (category 3). `Крапельниці` becomes its own category, hidden. Everything else becomes a new `Естетична хірургія` category, visible.
3. **Seven rows are hidden by name** — oncology, urology and intimate injections.
4. **Slugs** are transliterated from Ukrainian, because the categories need stable URL keys for `?c=`/`?s=`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/prices/taxonomy.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "./parse-xlsx";
import { applyTaxonomy, slugify, type CatalogueCategory } from "./taxonomy";

const XLSX = path.resolve(__dirname, "../../../Прайс Геліос-4.xlsx");

describe("slugify", () => {
  it("transliterates Ukrainian to a URL-safe slug", () => {
    expect(slugify("Апаратні процедури")).toBe("aparatni-protsedury");
    expect(slugify("Лазерна епіляція")).toBe("lazerna-epilyatsiya");
  });
  it("collapses punctuation and case", () => {
    expect(slugify("SMAS-ліфтінг ULTRAFORMER")).toBe("smas-liftinh-ultraformer");
    expect(slugify("Ін'єкційна косметологія")).toBe("inyektsiyna-kosmetolohiya");
  });
});

describe("applyTaxonomy", () => {
  let cats: CatalogueCategory[];
  beforeAll(async () => {
    cats = applyTaxonomy(await parseGenevitySheet(fs.readFileSync(XLSX)));
  });

  it("produces the expected top-level categories", () => {
    expect(cats.map((c) => c.labelUk)).toEqual([
      "Апаратні процедури",
      "Лазерна епіляція",
      "Ін'єкційна косметологія",
      "Діагностичні послуги",
      "Доглядові процедури",
      "Подологія",
      "Видалення родимок, папіломив, бородавок та інші",
      "Естетична хірургія",
      "Крапельниці",
    ]);
  });

  it("never emits a consultations category", () => {
    expect(cats.find((c) => c.labelUk.includes("Консультац"))).toBeUndefined();
  });

  it("folds a device group header into its child's label", () => {
    const apparatus = cats.find((c) => c.labelUk === "Апаратні процедури")!;
    const labels = apparatus.subcategories.map((s) => s.labelUk);
    expect(labels).toContain("Exion — Фракційний мікроігольчастий RF");
    expect(labels).toContain("RF-ліфтінг — EmSculpt");
    expect(labels).not.toContain("1. Фракційний мікроігольчастий RF");
  });

  it("folds thread lift and lipofilling into injectables without their old umbrella", () => {
    const inj = cats.find((c) => c.labelUk === "Ін'єкційна косметологія")!;
    const labels = inj.subcategories.map((s) => s.labelUk);
    expect(labels).toContain("Нітковий ліфтинг");
    expect(labels).toContain("Ліпофілінг");
    expect(labels).not.toContain("Естетична медицина — Ліпофілінг");
  });

  it("hides the Крапельниці category pending price confirmation", () => {
    const drips = cats.find((c) => c.labelUk === "Крапельниці")!;
    expect(drips.isVisible).toBe(false);
    expect(drips.subcategories.flatMap((s) => s.items)).toHaveLength(1);
  });

  it("hides exactly the intended rows and no others", () => {
    // An exact-set assertion, not a `some()` spot check: the hidden set is an
    // editorial decision about what appears on a public medical price list, so
    // any drift in either direction — a row that stops hiding, or a new sheet
    // row that starts hiding — must fail this test and be re-decided, never
    // slip through silently.
    const hidden = cats
      .filter((c) => c.isVisible)          // a hidden category is a separate rule
      .flatMap((c) => c.subcategories)
      .flatMap((s) => s.items)
      .filter((i) => !i.isVisible)
      .map((i) => i.nameUk)
      .sort();
    expect(hidden).toEqual([
      "Видалення базально-клітинної карциноми (1 категорія)",
      "Видалення базально-клітинної карциноми (2 категорія)",
      "Видалення базально-клітинної карциноми (3 категорія)",
      "Корекція статевого члена філером (без вартості препарату)",
      "Лазерне обрізання крайньої плоті (циркумцизія)",
      "PRP статевого члена (1 пробірка)",
      "Панч-біопсія (без вартості гістології)",
    ].sort());
  });

  it("gives the PolyPhil variants real names", () => {
    const inj = cats.find((c) => c.labelUk === "Ін'єкційна косметологія")!;
    const polyphil = inj.subcategories.find((s) => s.labelUk === "PolyPhil")!;
    const names = polyphil.items.map((i) => i.nameUk).sort();
    expect(names).toEqual([
      "PolyPhil",
      "PolyPhil Eye",
      "PolyPhil Hair",
      "PolyPhil Next",
    ]);
  });

  it("keeps surgery visible", () => {
    const surgery = cats.find((c) => c.labelUk === "Естетична хірургія")!;
    expect(surgery.isVisible).toBe(true);
    const blepharo = surgery.subcategories
      .flatMap((s) => s.items)
      .find((i) => i.nameUk.includes("Блефаропластика верхніх повік"))!;
    expect(blepharo.isVisible).toBe(true);
    expect(blepharo.priceNumeric).toBe(50000);
  });

  it("totals 551 items — the sheet's 575 minus the 24 consultations", () => {
    const total = cats.reduce(
      (n, c) => n + c.subcategories.reduce((m, s) => m + s.items.length, 0), 0);
    expect(total).toBe(551);
  });

  it("gives every category and subcategory a unique non-empty slug", () => {
    const slugs = cats.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((s) => s.length > 0)).toBe(true);
    for (const c of cats) {
      const subs = c.subcategories.map((s) => s.slug);
      expect(new Set(subs).size).toBe(subs.length);
    }
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- taxonomy`
Expected: FAIL — `Failed to resolve import "./taxonomy"`.

- [ ] **Step 3: Implement the taxonomy module**

Create `src/lib/prices/taxonomy.ts`:

```ts
import type { ParsedCategory, ParsedItem, ParsedSubcategory } from "./parse-xlsx";

export interface CatalogueItem extends ParsedItem {
  isVisible: boolean;
}
export interface CatalogueSubcategory {
  slug: string;
  labelUk: string;
  isVisible: boolean;
  items: CatalogueItem[];
}
export interface CatalogueCategory {
  slug: string;
  labelUk: string;
  isVisible: boolean;
  subcategories: CatalogueSubcategory[];
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh",
  з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya", ъ: "", ы: "y", э: "e", ё: "e",
};

/** Stable URL key for a Ukrainian label. Latin characters pass through. */
export function slugify(uk: string): string {
  return uk
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/['’ʼ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Rows that must not appear on a public aesthetic-medicine price list:
 * oncological excision, biopsy, circumcision and intimate injections.
 * Matched as case-insensitive substrings of the Ukrainian name.
 */
const HIDDEN_ITEM_PATTERNS = [
  "базально-клітинної карциноми",
  "панч-біопсія",
  "циркумцизія",
  "статевого члена",
];

/**
 * Rows whose name in the spreadsheet is internal shorthand that would be
 * meaningless — or actively broken — on a public page. The sheet files three
 * PolyPhil variants under the "PolyPhil" subcategory as bare "hair", "eye" and
 * "next", which would render as price rows called "next — 7 800 ₴".
 *
 * Renaming is safe across re-imports because the diff matches on
 * roapp_service_id first, and all three rows carry one.
 */
const ITEM_RENAMES: Record<string, string> = {
  hair: "PolyPhil Hair",
  eye: "PolyPhil Eye",
  next: "PolyPhil Next",
};

/** Category-8 subcategories that belong with the injectables instead. */
const MOVE_TO_INJECTABLES = ["Нітковий ліфтинг", "Ліпофілінг"];

const INJECTABLES_INDEX = 3;
const MIXED_INDEX = 8;
/** The consultations block at the top of the sheet. Never imported: the
 *  consultations category on the site is curated by hand and carries prices
 *  the spreadsheet deliberately disagrees with. */
const CONSULTATIONS_INDEX = 0;

function isHidden(name: string): boolean {
  const lower = name.toLowerCase();
  return HIDDEN_ITEM_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

/** The sheet numbers some subcategories ("1. Фракційний…"); that is a
 *  spreadsheet artifact, not part of the name. */
function stripNumberPrefix(label: string): string {
  return label.replace(/^\s*\d+\.\s*/, "");
}

/**
 * Compose the display label. A group header ("Exion") is folded into its
 * child ("1. Фракційний мікроігольчастий RF") so the device name survives:
 * "Exion — Фракційний мікроігольчастий RF". Without this the user sees a bare
 * numbered fragment and no way to tell which device it belongs to.
 */
function composeLabel(sub: ParsedSubcategory): string {
  const own = stripNumberPrefix(sub.labelUk);
  if (!sub.groupUk) return own;
  if (!own) return sub.groupUk;
  return `${sub.groupUk} — ${own}`;
}

/**
 * `dropGroup` is for a subcategory being relocated out of its source category:
 * once "Ліпофілінг" sits under Ін'єкційна косметологія, prefixing it with its
 * old umbrella ("Естетична медицина — Ліпофілінг") describes where it came
 * from rather than what it is.
 */
function toCatalogueSub(
  sub: ParsedSubcategory,
  visible: boolean,
  dropGroup = false,
): CatalogueSubcategory {
  const labelUk = dropGroup ? stripNumberPrefix(sub.labelUk) : composeLabel(sub);
  return {
    slug: slugify(labelUk) || "inshe",
    labelUk,
    isVisible: visible,
    items: sub.items.map((i) => ({
      ...i,
      nameUk: ITEM_RENAMES[i.nameUk] ?? i.nameUk,
      isVisible: visible && !isHidden(i.nameUk),
    })),
  };
}

export function applyTaxonomy(parsed: ParsedCategory[]): CatalogueCategory[] {
  const out: CatalogueCategory[] = [];
  const mixed = parsed.find((c) => c.index === MIXED_INDEX);

  for (const cat of parsed) {
    if (cat.index === CONSULTATIONS_INDEX) continue;   // never imported
    if (cat.index === MIXED_INDEX) continue;           // handled below

    const subs = cat.subcategories.map((s) => toCatalogueSub(s, true));

    if (cat.index === INJECTABLES_INDEX && mixed) {
      for (const name of MOVE_TO_INJECTABLES) {
        const moved = mixed.subcategories.find((s) => s.labelUk === name);
        if (moved) subs.push(toCatalogueSub(moved, true, true));
      }
    }

    out.push({
      slug: slugify(cat.labelUk),
      labelUk: cat.labelUk,
      isVisible: true,
      subcategories: subs,
    });
  }

  if (mixed) {
    const drips: CatalogueSubcategory[] = [];
    const surgery: CatalogueSubcategory[] = [];

    for (const sub of mixed.subcategories) {
      if (MOVE_TO_INJECTABLES.includes(sub.labelUk)) continue;   // already moved
      // The sheet's category-8 heading row itself carries the single drip item.
      if (sub.labelUk === "" || sub.labelUk === mixed.labelUk) {
        drips.push(toCatalogueSub(sub, false));
        continue;
      }
      surgery.push(toCatalogueSub(sub, true));
    }

    if (surgery.length) {
      out.push({
        slug: slugify("Естетична хірургія"),
        labelUk: "Естетична хірургія",
        isVisible: true,
        subcategories: surgery,
      });
    }
    if (drips.length) {
      out.push({
        slug: slugify("Крапельниці"),
        labelUk: "Крапельниці",
        isVisible: false,
        subcategories: drips,
      });
    }
  }

  return out;
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- taxonomy`
Expected: PASS.

The `Крапельниці` assertion is the fragile one: the single `Крапельниця — 20 000` row sits directly under the category-8 header with no subcategory heading, so the parser files it under `labelUk: ""`. If the test fails on that, log `mixed.subcategories.map(s => [s.labelUk, s.items.length])` and adjust the branch rather than the expectation.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS — both parser and taxonomy suites.

- [ ] **Step 6: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/prices/taxonomy.ts src/lib/prices/taxonomy.test.ts
git commit -m "feat(prices): apply editorial taxonomy rules to the parsed sheet"
```

---

### Task 4: Translation map

**Files:**
- Create: `src/lib/prices/translations.ts`
- Create: `src/lib/prices/translations.test.ts`
- Create: `scripts/list-price-names.ts`

**Interfaces:**
- Consumes: `applyTaxonomy` from `./taxonomy`.
- Produces:
  ```ts
  export interface Translation { ru: string; en: string }
  export const PRICE_TRANSLATIONS: Record<string, Translation>;   // keyed on the Ukrainian string
  export function translate(uk: string): { ru: string | null; en: string | null };
  ```

**Context.** The project's established pattern for translations is a hand-authored map keyed on the Ukrainian string (`scripts/backfill-doctor-translations.ts`), not a runtime API call. That is deliberate: it is deterministic, reviewable in a diff, and survives re-imports for free because the key is the source text. Follow it here.

The map covers every distinct Ukrainian string in the catalogue — category labels, subcategory labels and item names, roughly 630 keys after deduplication. `translate()` returns nulls for anything missing so `pick()` falls back to Ukrainian rather than showing an empty cell.

Translation rules:
- **Brand and device names stay Latin and unchanged** in all three locales: `Ultraformer`, `Hydrafacial`, `EmSculpt`, `EmFace`, `Exion`, `Volnewmer`, `M-22`, `AcuPuls`, `Smart XIDE`, `Smart Lipo`, `Juvederm`, `Rejuran`, `Belotero`, `PolyPhil`, `Ialest`, `InBody`, `Zemits`, `IsClinical`, `Maria Galland`, `Regenera`.
- **Anatomical and procedural terms use standard medical Russian and English** — `Обличчя` → `Лицо` / `Face`, `Декольте` → `Декольте` / `Décolleté`, `Внутрішня поверхня стегна` → `Внутренняя поверхность бедра` / `Inner thigh`.
- **Parenthetical qualifiers are translated too**: `Full face (щоки, очі, лоб)` → `Full face (щёки, глаза, лоб)` / `Full face (cheeks, eyes, forehead)`.
- **Doctor attributions in notes are transliterated, not translated**: `Гармаш С.К.` → `Гармаш С.К.` / `Harmash S.K.`

- [ ] **Step 1: Generate the list of strings needing translation**

Create `scripts/list-price-names.ts`:

```ts
/**
 * Print every distinct Ukrainian string in the catalogue, one per line.
 * Feeds the hand-authored map in src/lib/prices/translations.ts.
 * Run: npx tsx scripts/list-price-names.ts > /tmp/price-names.txt
 */
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "../src/lib/prices/parse-xlsx";
import { applyTaxonomy } from "../src/lib/prices/taxonomy";

async function run() {
  const buf = fs.readFileSync(path.resolve(__dirname, "../Прайс Геліос-4.xlsx"));
  const cats = applyTaxonomy(await parseGenevitySheet(buf));
  const strings = new Set<string>();
  for (const c of cats) {
    strings.add(c.labelUk);
    for (const s of c.subcategories) {
      if (s.labelUk) strings.add(s.labelUk);
      for (const i of s.items) {
        strings.add(i.nameUk);
        if (i.noteUk) strings.add(i.noteUk);
      }
    }
  }
  for (const s of [...strings].sort()) console.log(s);
  console.error(`${strings.size} distinct strings`);
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/list-price-names.ts > /tmp/price-names.txt`
Expected: roughly 600–650 on stderr; `/tmp/price-names.txt` holds one string per line.

- [ ] **Step 3: Write the failing test**

Create `src/lib/prices/translations.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "./parse-xlsx";
import { applyTaxonomy } from "./taxonomy";
import { PRICE_TRANSLATIONS, translate } from "./translations";

const XLSX = path.resolve(__dirname, "../../../Прайс Геліос-4.xlsx");

describe("translate", () => {
  it("returns nulls for an unknown string so pick() falls back to uk", () => {
    expect(translate("не існує в каталозі")).toEqual({ ru: null, en: null });
  });

  it("keeps device brand names unchanged", () => {
    expect(translate("SMAS-ліфтінг ULTRAFORMER").en).toContain("ULTRAFORMER");
    expect(translate("SMAS-ліфтінг ULTRAFORMER").ru).toContain("ULTRAFORMER");
  });

  it("translates anatomy into medical Russian and English", () => {
    expect(translate("Обличчя")).toEqual({ ru: "Лицо", en: "Face" });
    expect(translate("Шия")).toEqual({ ru: "Шея", en: "Neck" });
  });

  it("translates parenthetical qualifiers", () => {
    const t = translate("Full face (щоки, очі, лоб)");
    expect(t.ru).toBe("Full face (щёки, глаза, лоб)");
    expect(t.en).toBe("Full face (cheeks, eyes, forehead)");
  });
});

describe("coverage", () => {
  it("covers every distinct string in the catalogue", async () => {
    const cats = applyTaxonomy(await parseGenevitySheet(fs.readFileSync(XLSX)));
    const missing: string[] = [];
    for (const c of cats) {
      if (!PRICE_TRANSLATIONS[c.labelUk]) missing.push(c.labelUk);
      for (const s of c.subcategories) {
        if (s.labelUk && !PRICE_TRANSLATIONS[s.labelUk]) missing.push(s.labelUk);
        for (const i of s.items) {
          if (!PRICE_TRANSLATIONS[i.nameUk]) missing.push(i.nameUk);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("has no empty translations", () => {
    const empties = Object.entries(PRICE_TRANSLATIONS)
      .filter(([, v]) => !v.ru?.trim() || !v.en?.trim())
      .map(([k]) => k);
    expect(empties).toEqual([]);
  });
});
```

- [ ] **Step 4: Run it to confirm it fails**

Run: `npm test -- translations`
Expected: FAIL — `Failed to resolve import "./translations"`.

- [ ] **Step 5: Write the map**

Create `src/lib/prices/translations.ts` with this exact shape, then fill it with one entry per line of `/tmp/price-names.txt`:

```ts
export interface Translation { ru: string; en: string }

/**
 * Ukrainian → RU/EN for every string in the price catalogue.
 * Keyed on the source text so the map survives re-imports: a row whose name
 * is unchanged keeps its translation no matter how the spreadsheet is
 * reordered or re-issued.
 *
 * Device and brand names are intentionally left in Latin script in all
 * locales. Generate the key list with: npx tsx scripts/list-price-names.ts
 */
export const PRICE_TRANSLATIONS: Record<string, Translation> = {
  // — categories —
  "Апаратні процедури": { ru: "Аппаратные процедуры", en: "Device-based treatments" },
  "Лазерна епіляція": { ru: "Лазерная эпиляция", en: "Laser hair removal" },
  "Ін'єкційна косметологія": { ru: "Инъекционная косметология", en: "Injectable cosmetology" },
  "Діагностичні послуги": { ru: "Диагностические услуги", en: "Diagnostics" },
  "Доглядові процедури": { ru: "Уходовые процедуры", en: "Skincare treatments" },
  "Подологія": { ru: "Подология", en: "Podiatry" },
  "Видалення родимок, папіломив, бородавок та інші": {
    ru: "Удаление родинок, папиллом, бородавок и другое",
    en: "Removal of moles, papillomas, warts and more",
  },
  "Естетична хірургія": { ru: "Эстетическая хирургия", en: "Aesthetic surgery" },
  "Крапельниці": { ru: "Капельницы", en: "IV drips" },

  // — subcategories —
  "SMAS-ліфтінг ULTRAFORMER": { ru: "SMAS-лифтинг ULTRAFORMER", en: "ULTRAFORMER SMAS lifting" },
  "Глибоке очищення (Hydrafacial)": { ru: "Глубокое очищение (Hydrafacial)", en: "Deep cleansing (Hydrafacial)" },
  "Жіноча лазерна епіляція": { ru: "Женская лазерная эпиляция", en: "Laser hair removal — women" },
  "Чоловіча лазерна епіляція": { ru: "Мужская лазерная эпиляция", en: "Laser hair removal — men" },
  "Ботулінотерапія": { ru: "Ботулинотерапия", en: "Botulinum therapy" },
  "Нітковий ліфтинг": { ru: "Нитевой лифтинг", en: "Thread lift" },
  "Ліпофілінг": { ru: "Липофилинг", en: "Lipofilling" },

  // — items —
  "Full face (щоки, очі, лоб)": { ru: "Full face (щёки, глаза, лоб)", en: "Full face (cheeks, eyes, forehead)" },
  "Обличчя": { ru: "Лицо", en: "Face" },
  "Шия": { ru: "Шея", en: "Neck" },
  "Декольте": { ru: "Декольте", en: "Décolleté" },
  "Щоки": { ru: "Щёки", en: "Cheeks" },
  "Пахви": { ru: "Подмышки", en: "Underarms" },
  "Повне бікіні": { ru: "Полное бикини", en: "Full bikini" },
  // … one entry for every remaining line of /tmp/price-names.txt
};

/** Nulls (not empty strings) so the DB stores NULL and pick() falls back to uk. */
export function translate(uk: string): { ru: string | null; en: string | null } {
  const hit = PRICE_TRANSLATIONS[uk];
  return { ru: hit?.ru ?? null, en: hit?.en ?? null };
}
```

Work through `/tmp/price-names.txt` in order and add every line. Names repeat heavily across categories — `Обличчя`, `Шия`, `Щоки`, `Живіт`, `Коліна` appear under many devices — so the deduplicated key count is well below 575.

- [ ] **Step 6: Run the tests**

Run: `npm test -- translations`
Expected: PASS. The coverage test lists every missing key in its failure output; keep adding entries until it is empty.

- [ ] **Step 7: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/prices/translations.ts src/lib/prices/translations.test.ts scripts/list-price-names.ts
git commit -m "feat(prices): add uk→ru/en translation map for the catalogue"
```

---

### Task 5: Diff engine

**Files:**
- Create: `src/lib/prices/diff.ts`
- Create: `src/lib/prices/diff.test.ts`

**Interfaces:**
- Consumes: `CatalogueCategory` from `./taxonomy`.
- Produces:
  ```ts
  export interface ExistingRow {
    id: string; categorySlug: string; subcategorySlug: string | null;
    nameUk: string; price: string; roappServiceId: string | null; source: string;
  }
  export type ChangeKind = "added" | "price-changed" | "renamed" | "removed" | "unchanged";
  export interface Change {
    kind: ChangeKind; nameUk: string; categorySlug: string;
    previousName?: string; previousPrice?: string; nextPrice?: string;
    existingId?: string; isManualConflict: boolean;
  }
  export interface DiffResult { changes: Change[]; counts: Record<ChangeKind, number> }
  export function diffCatalogue(incoming: CatalogueCategory[], existing: ExistingRow[]): DiffResult;
  ```

**Context.** Matching is two-tier: on `roappServiceId` when both sides have one, otherwise on `categorySlug + subcategorySlug + nameUk`. A row matched by id whose name differs is a **rename**; one whose price differs is **price-changed**; both can be true, in which case report `renamed` and carry `nextPrice` so the reviewer sees the whole change. An existing row matched by nothing is **removed**. A changed row whose existing `source` is `manual` sets `isManualConflict`, which the admin screen surfaces separately — the spec's rule that hand edits are never silently overwritten.

- [ ] **Step 1: Write the failing test**

Create `src/lib/prices/diff.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { diffCatalogue, type ExistingRow } from "./diff";
import type { CatalogueCategory } from "./taxonomy";

function cat(items: { name: string; price: string; id?: string | null }[]): CatalogueCategory[] {
  return [{
    slug: "test", labelUk: "Test", isVisible: true,
    subcategories: [{
      slug: "sub", labelUk: "Sub", isVisible: true,
      items: items.map((i) => ({
        roappServiceId: i.id === undefined ? "100" : i.id,
        nameUk: i.name, duration: null, price: i.price,
        priceNumeric: Number(i.price), noteUk: null, isVisible: true,
      })),
    }],
  }];
}

const existing = (over: Partial<ExistingRow> = {}): ExistingRow => ({
  id: "row-1", categorySlug: "test", subcategorySlug: "sub",
  nameUk: "Процедура", price: "500", roappServiceId: "100",
  source: "import", ...over,
});

describe("diffCatalogue", () => {
  it("reports an identical row as unchanged", () => {
    const d = diffCatalogue(cat([{ name: "Процедура", price: "500" }]), [existing()]);
    expect(d.counts.unchanged).toBe(1);
    expect(d.counts.added).toBe(0);
  });

  it("detects a price change matched by service id", () => {
    const d = diffCatalogue(cat([{ name: "Процедура", price: "800" }]), [existing()]);
    const change = d.changes.find((c) => c.kind === "price-changed")!;
    expect(change.previousPrice).toBe("500");
    expect(change.nextPrice).toBe("800");
    expect(change.existingId).toBe("row-1");
  });

  it("detects a rename matched by service id", () => {
    const d = diffCatalogue(cat([{ name: "Процедура нова", price: "500" }]), [existing()]);
    const change = d.changes.find((c) => c.kind === "renamed")!;
    expect(change.previousName).toBe("Процедура");
    expect(change.nameUk).toBe("Процедура нова");
  });

  it("reports rename when name and price both change", () => {
    const d = diffCatalogue(cat([{ name: "Нова", price: "900" }]), [existing()]);
    const change = d.changes.find((c) => c.kind === "renamed")!;
    expect(change.previousPrice).toBe("500");
    expect(change.nextPrice).toBe("900");
  });

  it("falls back to name matching when there is no service id", () => {
    const d = diffCatalogue(
      cat([{ name: "Процедура", price: "800", id: null }]),
      [existing({ roappServiceId: null })]);
    expect(d.counts["price-changed"]).toBe(1);
    expect(d.counts.added).toBe(0);
  });

  it("reports an unmatched incoming row as added", () => {
    const d = diffCatalogue(cat([{ name: "Зовсім нова", price: "100", id: "999" }]), [existing()]);
    expect(d.counts.added).toBe(1);
    expect(d.counts.removed).toBe(1);
  });

  it("reports an existing row missing from the sheet as removed", () => {
    const d = diffCatalogue(cat([]), [existing()]);
    const change = d.changes.find((c) => c.kind === "removed")!;
    expect(change.nameUk).toBe("Процедура");
    expect(change.existingId).toBe("row-1");
  });

  it("flags a change over a hand-edited row as a manual conflict", () => {
    const d = diffCatalogue(
      cat([{ name: "Процедура", price: "800" }]),
      [existing({ source: "manual" })]);
    expect(d.changes.find((c) => c.kind === "price-changed")!.isManualConflict).toBe(true);
  });

  it("does not flag an unchanged manual row as a conflict", () => {
    const d = diffCatalogue(
      cat([{ name: "Процедура", price: "500" }]),
      [existing({ source: "manual" })]);
    expect(d.changes.every((c) => !c.isManualConflict)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- diff`
Expected: FAIL — `Failed to resolve import "./diff"`.

- [ ] **Step 3: Implement the diff engine**

Create `src/lib/prices/diff.ts`:

```ts
import type { CatalogueCategory } from "./taxonomy";

export interface ExistingRow {
  id: string;
  categorySlug: string;
  subcategorySlug: string | null;
  nameUk: string;
  price: string;
  roappServiceId: string | null;
  source: string;
}

export type ChangeKind = "added" | "price-changed" | "renamed" | "removed" | "unchanged";

export interface Change {
  kind: ChangeKind;
  nameUk: string;
  categorySlug: string;
  previousName?: string;
  previousPrice?: string;
  nextPrice?: string;
  existingId?: string;
  isManualConflict: boolean;
}

export interface DiffResult {
  changes: Change[];
  counts: Record<ChangeKind, number>;
}

/** Secondary key when a row carries no RoApp service id. */
function nameKey(categorySlug: string, subSlug: string | null, name: string): string {
  return `${categorySlug}::${subSlug ?? ""}::${name.trim().toLowerCase()}`;
}

export function diffCatalogue(
  incoming: CatalogueCategory[],
  existing: ExistingRow[],
): DiffResult {
  const byId = new Map<string, ExistingRow>();
  const byName = new Map<string, ExistingRow>();
  for (const row of existing) {
    if (row.roappServiceId) byId.set(row.roappServiceId, row);
    byName.set(nameKey(row.categorySlug, row.subcategorySlug, row.nameUk), row);
  }

  const changes: Change[] = [];
  const matched = new Set<string>();

  for (const cat of incoming) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        const subSlug = sub.labelUk ? sub.slug : null;
        const hit =
          (item.roappServiceId ? byId.get(item.roappServiceId) : undefined) ??
          byName.get(nameKey(cat.slug, subSlug, item.nameUk));

        if (!hit) {
          changes.push({
            kind: "added", nameUk: item.nameUk, categorySlug: cat.slug,
            nextPrice: item.price, isManualConflict: false,
          });
          continue;
        }

        matched.add(hit.id);
        const renamed = hit.nameUk.trim() !== item.nameUk.trim();
        const repriced = hit.price.trim() !== item.price.trim();

        if (!renamed && !repriced) {
          changes.push({
            kind: "unchanged", nameUk: item.nameUk, categorySlug: cat.slug,
            existingId: hit.id, isManualConflict: false,
          });
          continue;
        }

        changes.push({
          kind: renamed ? "renamed" : "price-changed",
          nameUk: item.nameUk,
          categorySlug: cat.slug,
          previousName: renamed ? hit.nameUk : undefined,
          previousPrice: hit.price,
          nextPrice: item.price,
          existingId: hit.id,
          isManualConflict: hit.source === "manual",
        });
      }
    }
  }

  for (const row of existing) {
    if (matched.has(row.id)) continue;
    changes.push({
      kind: "removed", nameUk: row.nameUk, categorySlug: row.categorySlug,
      previousPrice: row.price, existingId: row.id,
      isManualConflict: row.source === "manual",
    });
  }

  const counts: Record<ChangeKind, number> = {
    added: 0, "price-changed": 0, renamed: 0, removed: 0, unchanged: 0,
  };
  for (const c of changes) counts[c.kind]++;

  return { changes, counts };
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- diff`
Expected: PASS, all nine assertions.

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/prices/diff.ts src/lib/prices/diff.test.ts
git commit -m "feat(prices): add catalogue diff engine with manual-edit conflicts"
```

---

### Task 6: Persist the catalogue and run the seed

**Files:**
- Create: `src/lib/prices/apply.ts`
- Create: `scripts/import-prices.ts`
- Modify: `package.json` (add an `import:prices` script)

**Interfaces:**
- Consumes: `CatalogueCategory` from `./taxonomy`, `translate` from `./translations`, `ExistingRow` from `./diff`.
- Produces:
  ```ts
  type SqlClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;
  export function loadExistingRows(sql: SqlClient): Promise<ExistingRow[]>;
  export function applyCatalogue(sql: SqlClient, cats: CatalogueCategory[]): Promise<{ categories: number; subcategories: number; items: number; hidden: number }>;
  ```

**Context.** `applyCatalogue` must be idempotent and must never delete. It upserts categories and subcategories on slug, upserts items on `roapp_service_id` (falling back to category+subcategory+name), and marks any existing imported row absent from the incoming tree as `is_visible=false`. The `consultations` category is excluded by slug and is never touched.

Both the CLI and the admin route call this, so it takes the `sql` client as a parameter — `scripts/*` use `postgres`, app code uses `@/lib/db/client`. Both expose the same tagged-template call signature.

- [ ] **Step 1: Write the apply module**

Create `src/lib/prices/apply.ts`:

```ts
import type { CatalogueCategory } from "./taxonomy";
import { translate } from "./translations";
import type { ExistingRow } from "./diff";

type SqlClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

/** Category slug that the importer must never create, update or delete. */
export const PROTECTED_CATEGORY_SLUGS = ["consultations"];

export async function loadExistingRows(sql: SqlClient): Promise<ExistingRow[]> {
  const rows = await sql`
    SELECT i.id, i.name_uk, i.price, i.roapp_service_id, i.source,
           c.slug AS category_slug, s.slug AS subcategory_slug
    FROM price_items i
    JOIN price_categories c ON c.id = i.category_id
    LEFT JOIN price_subcategories s ON s.id = i.subcategory_id
    WHERE c.slug <> ALL(${PROTECTED_CATEGORY_SLUGS})
  `;
  return rows.map((r) => ({
    id: String(r.id),
    categorySlug: String(r.category_slug),
    subcategorySlug: r.subcategory_slug ? String(r.subcategory_slug) : null,
    nameUk: String(r.name_uk ?? ""),
    price: String(r.price ?? ""),
    roappServiceId: r.roapp_service_id ? String(r.roapp_service_id) : null,
    source: String(r.source ?? "manual"),
  }));
}

export async function applyCatalogue(
  sql: SqlClient,
  cats: CatalogueCategory[],
): Promise<{ categories: number; subcategories: number; items: number; hidden: number }> {
  const seenItemIds: string[] = [];
  let categories = 0, subcategories = 0, items = 0, hidden = 0;

  for (let ci = 0; ci < cats.length; ci++) {
    const cat = cats[ci];
    if (PROTECTED_CATEGORY_SLUGS.includes(cat.slug)) continue;

    const t = translate(cat.labelUk);
    const catRows = await sql`
      INSERT INTO price_categories (slug, label_uk, label_ru, label_en, is_visible, sort_order)
      VALUES (${cat.slug}, ${cat.labelUk}, ${t.ru}, ${t.en}, ${cat.isVisible}, ${ci + 10})
      ON CONFLICT (slug) DO UPDATE SET
        label_uk = EXCLUDED.label_uk,
        label_ru = COALESCE(EXCLUDED.label_ru, price_categories.label_ru),
        label_en = COALESCE(EXCLUDED.label_en, price_categories.label_en),
        is_visible = EXCLUDED.is_visible,
        sort_order = EXCLUDED.sort_order,
        updated_at = now()
      RETURNING id
    `;
    const categoryId = String(catRows[0].id);
    categories++;

    for (let si = 0; si < cat.subcategories.length; si++) {
      const sub = cat.subcategories[si];
      let subcategoryId: string | null = null;

      if (sub.labelUk) {
        const st = translate(sub.labelUk);
        const subRows = await sql`
          INSERT INTO price_subcategories (category_id, slug, label_uk, label_ru, label_en, is_visible, sort_order)
          VALUES (${categoryId}, ${sub.slug}, ${sub.labelUk}, ${st.ru}, ${st.en}, ${sub.isVisible}, ${si})
          ON CONFLICT (category_id, slug) DO UPDATE SET
            label_uk = EXCLUDED.label_uk,
            label_ru = COALESCE(EXCLUDED.label_ru, price_subcategories.label_ru),
            label_en = COALESCE(EXCLUDED.label_en, price_subcategories.label_en),
            is_visible = EXCLUDED.is_visible,
            sort_order = EXCLUDED.sort_order,
            updated_at = now()
          RETURNING id
        `;
        subcategoryId = String(subRows[0].id);
        subcategories++;
      }

      for (let ii = 0; ii < sub.items.length; ii++) {
        const item = sub.items[ii];
        const it = translate(item.nameUk);
        const note = item.noteUk ? translate(item.noteUk) : { ru: null, en: null };

        // Match an existing row the same way the diff does.
        const found = await sql`
          SELECT id FROM price_items
          WHERE (${item.roappServiceId}::text IS NOT NULL AND roapp_service_id = ${item.roappServiceId})
             OR (category_id = ${categoryId}
                 AND subcategory_id IS NOT DISTINCT FROM ${subcategoryId}
                 AND name_uk = ${item.nameUk})
          LIMIT 1
        `;

        let itemId: string;
        if (found.length) {
          itemId = String(found[0].id);
          await sql`
            UPDATE price_items SET
              category_id = ${categoryId},
              subcategory_id = ${subcategoryId},
              name_uk = ${item.nameUk},
              name_ru = COALESCE(${it.ru}, name_ru),
              name_en = COALESCE(${it.en}, name_en),
              price = ${item.price},
              price_numeric = ${item.priceNumeric},
              duration = ${item.duration},
              roapp_service_id = ${item.roappServiceId},
              note_uk = ${item.noteUk},
              note_ru = ${note.ru},
              note_en = ${note.en},
              is_visible = ${item.isVisible},
              source = 'import',
              sort_order = ${ii},
              updated_at = now()
            WHERE id = ${itemId}
          `;
        } else {
          const inserted = await sql`
            INSERT INTO price_items (
              category_id, subcategory_id, name_uk, name_ru, name_en,
              price, price_numeric, duration, roapp_service_id,
              note_uk, note_ru, note_en, is_visible, source, sort_order)
            VALUES (
              ${categoryId}, ${subcategoryId}, ${item.nameUk}, ${it.ru}, ${it.en},
              ${item.price}, ${item.priceNumeric}, ${item.duration}, ${item.roappServiceId},
              ${item.noteUk}, ${note.ru}, ${note.en}, ${item.isVisible}, 'import', ${ii})
            RETURNING id
          `;
          itemId = String(inserted[0].id);
        }

        seenItemIds.push(itemId);
        items++;
        if (!item.isVisible) hidden++;
      }
    }
  }

  // Rows that vanished from the spreadsheet are hidden, never deleted.
  const orphaned = await sql`
    UPDATE price_items SET is_visible = false, updated_at = now()
    WHERE source = 'import'
      AND id <> ALL(${seenItemIds}::uuid[])
      AND category_id IN (SELECT id FROM price_categories WHERE slug <> ALL(${PROTECTED_CATEGORY_SLUGS}))
    RETURNING id
  `;
  hidden += orphaned.length;

  return { categories, subcategories, items, hidden };
}
```

- [ ] **Step 2: Write the CLI**

Create `scripts/import-prices.ts`:

```ts
/**
 * Import the GENEVITY sheet of the Helios price book.
 * Dry run:  npx tsx scripts/import-prices.ts
 * Apply:    npx tsx scripts/import-prices.ts --apply
 * Run: npm run import:prices -- --apply
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "../src/lib/prices/parse-xlsx";
import { applyTaxonomy } from "../src/lib/prices/taxonomy";
import { diffCatalogue } from "../src/lib/prices/diff";
import { applyCatalogue, loadExistingRows } from "../src/lib/prices/apply";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);
const APPLY = process.argv.includes("--apply");
const FILE = process.argv.find((a) => a.endsWith(".xlsx"))
  ?? path.resolve(__dirname, "../Прайс Геліос-4.xlsx");

async function run() {
  const cats = applyTaxonomy(await parseGenevitySheet(fs.readFileSync(FILE)));
  const total = cats.reduce((n, c) => n + c.subcategories.reduce((m, s) => m + s.items.length, 0), 0);
  console.log(`Parsed ${cats.length} categories, ${total} items from ${path.basename(FILE)}`);

  const existing = await loadExistingRows(sql as never);
  const diff = diffCatalogue(cats, existing);
  console.log("Diff:", diff.counts);

  for (const c of diff.changes.filter((c) => c.kind !== "unchanged").slice(0, 40)) {
    const conflict = c.isManualConflict ? "  ⚠ manual edit" : "";
    console.log(`  ${c.kind.padEnd(14)} ${c.nameUk} ${c.previousPrice ?? ""}→${c.nextPrice ?? ""}${conflict}`);
  }
  const rest = diff.changes.filter((c) => c.kind !== "unchanged").length - 40;
  if (rest > 0) console.log(`  … and ${rest} more`);

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to write.");
    await sql.end();
    return;
  }

  const result = await applyCatalogue(sql as never, cats);
  console.log("Applied:", result);
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
```

Add to the `scripts` block of `package.json`:

```json
"import:prices": "tsx scripts/import-prices.ts"
```

- [ ] **Step 3: Dry run**

Run: `npm run import:prices`
Expected: `Parsed 9 categories, 575 items`, then a diff dominated by `added` (the DB has no imported rows yet), with `removed` covering only the existing non-consultation curated rows. Nothing is written.

- [ ] **Step 4: Apply**

Run: `npm run import:prices -- --apply`
Expected: `Applied: { categories: 9, subcategories: ~45, items: 575, hidden: ~8 }`.

- [ ] **Step 5: Verify in the database**

```bash
npx tsx scripts/check-prices.ts | head -40
```

Expected: the new categories print with their items. Then confirm the four corrections and the untouched consultations:

```bash
npx tsx -e "
import postgres from 'postgres';
import * as fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env.local','utf-8').split('\n').filter(l=>l.includes('=')).map(l=>{const [k,...v]=l.split('=');return [k.trim(),v.join('=').trim()]}));
const sql = postgres(env.DATABASE_URL);
const r = await sql\`SELECT name_uk, price FROM price_items WHERE name_uk IN ('Пахви','Повне бікіні') OR name_uk LIKE 'Подологічна обробка%' OR name_uk LIKE 'Консультація ендокринолога%' ORDER BY name_uk\`;
console.table(r);
await sql.end();
"
```

Expected: Пахви 810 (women's) and 500 (men's), Повне бікіні 1 540 and 1 500, Подологічна обробка 1 000 / 1 200 / 1 400, Консультація ендокринолога still **1 100**.

- [ ] **Step 6: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/prices/apply.ts scripts/import-prices.ts package.json
git commit -m "feat(prices): import the 575-item catalogue into the database"
```

---

### Task 7: Query layer

**Files:**
- Modify: `src/lib/db/queries/phase2.ts:113-138` (the `PriceCategory` interface and `getPriceCategoriesWithItems`)

**Interfaces:**
- Consumes: the schema from Task 1.
- Produces:
  ```ts
  export interface PriceItemView { id: string; name: string; price: string; currency: string; duration: string | null; note: string | null; priceNumeric: number | null }
  export interface PriceSubcategoryView { id: string; slug: string; label: string; items: PriceItemView[] }
  export interface PriceCategory {
    id: string; slug: string; label: string; link: string | null;
    items: PriceItemView[];                 // direct items, no subcategory
    subcategories: PriceSubcategoryView[];
    itemCount: number;
  }
  export async function getPriceCategoriesWithItems(locale: string): Promise<PriceCategory[]>;
  ```

**Context.** The return type gains `subcategories` and `itemCount` but keeps `items` so `src/app/(admin)/admin/pages/_components/page-form.tsx:99` (which sums `c.items.length`) and the admin editor keep compiling. Invisible rows are filtered out here, so no caller has to remember to.

- [ ] **Step 1: Replace the interface and query**

In `src/lib/db/queries/phase2.ts`, replace the `PriceCategory` interface and `getPriceCategoriesWithItems` with:

```ts
export interface PriceItemView {
  id: string;
  name: string;
  price: string;
  currency: string;
  duration: string | null;
  note: string | null;
  priceNumeric: number | null;
}

export interface PriceSubcategoryView {
  id: string;
  slug: string;
  label: string;
  items: PriceItemView[];
}

export interface PriceCategory {
  id: string;
  slug: string;
  label: string;
  link: string | null;
  /** Items filed directly under the category, with no subcategory. */
  items: PriceItemView[];
  subcategories: PriceSubcategoryView[];
  /** Direct items plus every subcategory's items — for the pill badges. */
  itemCount: number;
}

export async function getPriceCategoriesWithItems(locale: string): Promise<PriceCategory[]> {
  const l = lang(locale);
  const categories = await sql`
    SELECT * FROM price_categories WHERE is_visible ORDER BY sort_order`;
  const subcategories = await sql`
    SELECT * FROM price_subcategories WHERE is_visible ORDER BY sort_order`;
  const items = await sql`
    SELECT * FROM price_items WHERE is_visible ORDER BY sort_order`;

  const toView = (it: Record<string, unknown>): PriceItemView => ({
    id: String(it.id),
    name: pick(it, "name", l) || "",
    price: String(it.price ?? ""),
    currency: (it.currency as string) || "₴",
    duration: (it.duration as string) ?? null,
    note: pick(it, "note", l),
    priceNumeric: (it.price_numeric as number) ?? null,
  });

  return categories.map((c) => {
    const catItems = items.filter((it) => it.category_id === c.id);
    const subs = subcategories
      .filter((s) => s.category_id === c.id)
      .map((s) => ({
        id: String(s.id),
        slug: String(s.slug),
        label: pick(s, "label", l) || "",
        items: catItems.filter((it) => it.subcategory_id === s.id).map(toView),
      }))
      .filter((s) => s.items.length > 0);
    const direct = catItems.filter((it) => !it.subcategory_id).map(toView);

    return {
      id: String(c.id),
      slug: String(c.slug),
      label: pick(c, "label", l) || "",
      link: (c.link as string) ?? null,
      items: direct,
      subcategories: subs,
      itemCount: direct.length + subs.reduce((n, s) => n + s.items.length, 0),
    };
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If `prices-editor.tsx` complains about the new item fields, that is Task 10's job — for now confirm the error is confined to that file and continue.

- [ ] **Step 3: Verify the shape at runtime**

```bash
npx tsx -e "
import { getPriceCategoriesWithItems } from './src/lib/db/queries/phase2';
const cats = await getPriceCategoriesWithItems('uk');
for (const c of cats) console.log(c.slug.padEnd(28), String(c.itemCount).padStart(4), c.subcategories.length + ' subs');
"
```

Expected: nine categories minus the hidden Крапельниці — so eight rows, `aparatni-protsedury` around 215, `lazerna-epilyatsiya` 79, and `consultations` 11 once Task 12 adds the three doctors.

- [ ] **Step 4: Commit**

```bash
git branch --show-current   # must print: develop
git add src/lib/db/queries/phase2.ts
git commit -m "feat(prices): return subcategories and item metadata from the query layer"
```

---

### Task 8: Page UI

**Files:**
- Modify: `src/components/pages/PricesPage.tsx` (full rewrite of the body)
- Create: `src/components/pages/prices/CategoryPills.tsx`
- Create: `src/components/pages/prices/SubcategorySection.tsx`
- Create: `src/components/pages/prices/PriceRow.tsx`
- Create: `scripts/seed-prices-ui-strings.ts`

**Interfaces:**
- Consumes: `PriceCategory`, `PriceSubcategoryView`, `PriceItemView` from `@/lib/db/queries/phase2`.
- Produces: no exported API beyond the default `PricesPageComponent` the route already imports.

**Context.** UI copy lives in the `ui_strings` JSONB table under the `pricesPage` namespace, **not** in JSON message files — `src/i18n/request.ts` loads messages from the database. The namespace already holds `heroTitle`, `heroSubtitle`, `searchPlaceholder`, `noResults`, `noteText`, `noteTitle`, `priceHeading`, `allCategories`. Three new keys are needed: `servicesCount`, `resultsCount`, `showAll`.

The page is a client component (`"use client"`) because it owns search and accordion state. Categories all render into the DOM and are hidden with CSS rather than unmounted, so every price is indexable — this is the point of the SEO section in the spec and must not be "optimized" into conditional rendering.

- [ ] **Step 1: Seed the new UI strings**

Create `scripts/seed-prices-ui-strings.ts`:

```ts
/**
 * Add the three new pricesPage keys to the ui_strings tree.
 * Run: npx tsx scripts/seed-prices-ui-strings.ts
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

const ADDITIONS = {
  servicesCount: { uk: "послуг", ru: "услуг", en: "services" },
  resultsCount: { uk: "Знайдено", ru: "Найдено", en: "Found" },
  showAll: { uk: "Показати всі", ru: "Показать все", en: "Show all" },
};

async function run() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.pricesPage = { ...tree.pricesPage, ...ADDITIONS };
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb, updated_at = now() WHERE id = 1`;
  console.log("✓ pricesPage keys:", Object.keys(tree.pricesPage).join(", "));
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/seed-prices-ui-strings.ts`
Expected: the key list printed, including `servicesCount`, `resultsCount`, `showAll`.

- [ ] **Step 3: Write the price row**

Create `src/components/pages/prices/PriceRow.tsx`:

```tsx
"use client";

import type { PriceItemView } from "@/lib/db/queries/phase2";

export default function PriceRow({ item }: { item: PriceItemView }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 sm:px-6 py-3.5 hover:bg-champagne-darker/50 transition-colors">
      <div className="min-w-0">
        <span className="body-m text-black">{item.name}</span>
        {item.note && <span className="body-s text-muted ml-2">{item.note}</span>}
      </div>
      <div className="flex items-baseline gap-3 shrink-0">
        {item.duration && (
          <span className="body-s text-muted whitespace-nowrap">{item.duration} хв</span>
        )}
        <span className="body-strong text-main whitespace-nowrap">
          {item.price} {item.currency}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write the collapsible subcategory section**

Create `src/components/pages/prices/SubcategorySection.tsx`:

```tsx
"use client";

import { ChevronDown } from "lucide-react";
import type { PriceSubcategoryView } from "@/lib/db/queries/phase2";
import PriceRow from "./PriceRow";

interface Props {
  sub: PriceSubcategoryView;
  open: boolean;
  countLabel: string;
  onToggle: () => void;
}

export default function SubcategorySection({ sub, open, countLabel, onToggle }: Props) {
  return (
    <div id={sub.slug} className="border-b border-line last:border-b-0 scroll-mt-28">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`panel-${sub.slug}`}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-4 text-left cursor-pointer hover:bg-champagne-darker/40 transition-colors"
      >
        <span className="body-strong text-black">{sub.label}</span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="body-s text-muted">{sub.items.length} {countLabel}</span>
          <ChevronDown
            size={18}
            className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div id={`panel-${sub.slug}`} hidden={!open} className="divide-y divide-line">
        {sub.items.map((item) => <PriceRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write the category pills**

Create `src/components/pages/prices/CategoryPills.tsx`:

```tsx
"use client";

import type { PriceCategory } from "@/lib/db/queries/phase2";

interface Props {
  categories: PriceCategory[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export default function CategoryPills({ categories, activeSlug, onSelect }: Props) {
  return (
    <div className="sticky top-20 z-20 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12 py-3 bg-champagne/95 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onSelect(cat.slug)}
            aria-current={activeSlug === cat.slug}
            className={`shrink-0 px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
              activeSlug === cat.slug
                ? "bg-main text-champagne"
                : "bg-champagne-dark text-black hover:bg-champagne-darker"
            }`}
          >
            {cat.label}
            <span className="body-s opacity-60 ml-2">{cat.itemCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite the page body**

In `src/components/pages/PricesPage.tsx`, keep the existing imports, hero section and closing CTA block exactly as they are. Replace the component body between the hero `</section>` and the CTA `<div>` with:

```tsx
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-20">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tPage("searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-champagne-dark border border-line body-m text-black placeholder:text-muted focus:outline-none focus:border-main transition-colors appearance-none"
          />
        </div>

        {search ? (
          <div aria-live="polite">
            <p className="body-s text-muted mb-4">
              {tPage("resultsCount")}: {results.length}
            </p>
            {results.length > 0 ? (
              <div className="bg-champagne-dark rounded-[var(--radius-card)] divide-y divide-line">
                {results.map((r) => (
                  <div key={r.item.id} className="px-4 sm:px-6 py-3.5">
                    <p className="body-s text-muted mb-0.5">
                      {r.categoryLabel}{r.subLabel ? ` › ${r.subLabel}` : ""}
                    </p>
                    <div className="flex items-start justify-between gap-4">
                      <span className="body-m text-black">{r.item.name}</span>
                      <span className="body-strong text-main whitespace-nowrap">
                        {r.item.price} {r.item.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="body-m text-muted">{tPage("noResults")}</p>
            )}
          </div>
        ) : (
          <>
            <CategoryPills
              categories={categories}
              activeSlug={activeSlug}
              onSelect={selectCategory}
            />

            {/* Every category stays mounted and is hidden with CSS so all 575
                prices are present in the HTML for indexing. Do not switch this
                to conditional rendering. */}
            {categories.map((cat) => (
              <div
                key={cat.slug}
                id={cat.slug}
                hidden={cat.slug !== activeSlug}
                className="mt-6 scroll-mt-28"
              >
                <div className="bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line">
                    <h2 className="heading-3 text-black">{cat.label}</h2>
                    {cat.link && (
                      <Link href={cat.link}>
                        <Button variant="outline" size="sm">
                          {tLabels("learnMore")}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  {cat.items.length > 0 ? (
                    <div className="divide-y divide-line">
                      {cat.items.map((item) => <PriceRow key={item.id} item={item} />)}
                    </div>
                  ) : null}

                  {cat.subcategories.map((sub) => (
                    <SubcategorySection
                      key={sub.id}
                      sub={sub}
                      open={openSubs.has(sub.slug)}
                      countLabel={tPage("servicesCount")}
                      onToggle={() => toggleSub(sub.slug)}
                    />
                  ))}
                </div>
                <p className="body-s text-muted mt-4">{tPage("noteText")}</p>
              </div>
            ))}
          </>
        )}
      </section>
```

Replace the state block at the top of the component with:

```tsx
  const [search, setSearch] = useState("");
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug || "");
  const [openSubs, setOpenSubs] = useState<Set<string>>(
    () => new Set(categories[0]?.subcategories[0] ? [categories[0].subcategories[0].slug] : []),
  );

  // Hydrate from the URL so a shared /prices?c=…&s=…&q=… link lands correctly.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get("c"); const s = p.get("s"); const q = p.get("q");
    if (c && categories.some((cat) => cat.slug === c)) setActiveSlug(c);
    if (s) setOpenSubs((prev) => new Set(prev).add(s));
    if (q) setSearch(q);
  }, [categories]);

  const syncUrl = (next: { c?: string; s?: string; q?: string }) => {
    const p = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    const first = categories.find((c) => c.slug === slug)?.subcategories[0];
    if (first) setOpenSubs((prev) => new Set(prev).add(first.slug));
    syncUrl({ c: slug, s: undefined });
  };

  const toggleSub = (slug: string) => {
    setOpenSubs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
    syncUrl({ s: slug });
  };

  // useDeferredValue keeps the input responsive while the 575-row filter
  // renders at a lower priority — React's own answer to this, and better than
  // a hand-rolled setTimeout debounce because it yields to typing rather than
  // guessing a delay. The URL sync stays on a timer: it is a side effect, not
  // a render.
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const t = setTimeout(() => syncUrl({ q: search }), 300);
    return () => clearTimeout(t);
  }, [search]);

  const results = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return [];
    const out: { item: PriceItemView; categoryLabel: string; subLabel: string | null }[] = [];
    for (const cat of categories) {
      for (const item of cat.items) {
        if (item.name.toLowerCase().includes(q)) {
          out.push({ item, categoryLabel: cat.label, subLabel: null });
        }
      }
      for (const sub of cat.subcategories) {
        const subHit = sub.label.toLowerCase().includes(q);
        for (const item of sub.items) {
          if (subHit || item.name.toLowerCase().includes(q)) {
            out.push({ item, categoryLabel: cat.label, subLabel: sub.label });
          }
        }
      }
    }
    return out;
  }, [deferredSearch, categories]);
```

Add to the imports at the top of the file:

```tsx
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { PriceItemView } from "@/lib/db/queries/phase2";
import CategoryPills from "./prices/CategoryPills";
import SubcategorySection from "./prices/SubcategorySection";
import PriceRow from "./prices/PriceRow";
```

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: a clean build. Fix any type error before continuing — most likely an unused import left from the old body.

- [ ] **Step 8: Check the rendered page**

Start the dev server in the background, then verify the HTML actually contains hidden-category prices:

```bash
npm run dev &
sleep 8
curl -s localhost:3000/prices | grep -c "₴"
kill %1
```

Expected: a count in the hundreds — proof that every category is in the DOM, not just the active one.

- [ ] **Step 9: Commit**

```bash
git branch --show-current   # must print: develop
git add src/components/pages/PricesPage.tsx src/components/pages/prices scripts/seed-prices-ui-strings.ts
git commit -m "feat(prices): two-level catalogue browse with search and URL state"
```

---

### Task 9: Structured data

**Files:**
- Modify: `src/app/[locale]/(pages)/prices/page.tsx`

**Interfaces:**
- Consumes: `PriceCategory` from `@/lib/db/queries/phase2`, `JsonLd` (named export) from `@/components/seo/JsonLd`.
- Produces: an `OfferCatalog` JSON-LD node on `/prices`.

**Context.** `src/components/seo/JsonLd.tsx` is the existing wrapper for structured data. Only items with a `priceNumeric` are emitted — a non-numeric price cannot be expressed as a valid `Offer`.

- [ ] **Step 1: Add the catalogue node**

In `src/app/[locale]/(pages)/prices/page.tsx`, after the `pricelistPdf` line and before the `return`, add:

```tsx
  const offerCatalog = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "GENEVITY",
    itemListElement: categories.map((cat) => ({
      "@type": "OfferCatalog",
      name: cat.label,
      itemListElement: [
        ...cat.items,
        ...cat.subcategories.flatMap((s) => s.items),
      ]
        .filter((item) => item.priceNumeric !== null)
        .map((item) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: item.name },
          price: item.priceNumeric,
          priceCurrency: "UAH",
        })),
    })),
  };
```

Then render it inside the returned fragment, directly above `<MegaMenuHeader …>`:

```tsx
      <JsonLd data={offerCatalog} />
```

And add the import:

```tsx
import { JsonLd } from "@/components/seo/JsonLd";
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Verify the JSON-LD is emitted and valid**

```bash
npm run dev &
sleep 8
curl -s localhost:3000/prices | python3 -c "
import sys, re, json
html = sys.stdin.read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S)
cat = [json.loads(b) for b in blocks]
cat = [c for c in cat if c.get('@type') == 'OfferCatalog'][0]
offers = sum(len(g['itemListElement']) for g in cat['itemListElement'])
print('categories:', len(cat['itemListElement']), 'offers:', offers)
assert offers > 500, offers
print('OK')
"
kill %1
```

Expected: `offers:` above 500, then `OK`.

- [ ] **Step 4: Commit**

```bash
git branch --show-current   # must print: develop
git add "src/app/[locale]/(pages)/prices/page.tsx"
git commit -m "feat(prices): emit OfferCatalog structured data for the catalogue"
```

---

### Task 10: Admin catalogue tab

**Files:**
- Rewrite: `src/app/(admin)/admin/_components/prices-editor.tsx`
- Modify: `src/app/(admin)/admin/_actions/phase2.ts:132-155` (replace `savePriceCategories`)

**Interfaces:**
- Consumes: the schema from Task 1.
- Produces:
  ```ts
  export async function updatePriceItem(input: { id: string; name_uk: string; name_ru: string; name_en: string; price: string; is_visible: boolean }): Promise<{ ok: true }>;
  export async function setPriceCategoryVisibility(id: string, isVisible: boolean): Promise<{ ok: true }>;
  export async function setPriceSubcategoryVisibility(id: string, isVisible: boolean): Promise<{ ok: true }>;
  ```

**Context.** The current `savePriceCategories` does `DELETE FROM price_items; DELETE FROM price_categories;` then re-inserts everything. At 575 rows that destroys every imported id, duration, service id and visibility flag on any save. It must be replaced with per-row updates before the editor is shown catalogue data.

Editing a price by hand sets `source = 'manual'`, which is what makes the diff engine's conflict detection work.

- [ ] **Step 1: Replace the server actions**

In `src/app/(admin)/admin/_actions/phase2.ts`, delete `savePriceCategories` and its `PriceCatInput` type, and add:

```ts
/* ==========  PRICES  ========== */

function revalidatePrices() {
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/ru/prices");
  revalidatePath("/en/prices");
}

/**
 * Update a single price row. Marks the row `manual` so the next spreadsheet
 * import reports it as a conflict instead of silently overwriting the edit.
 */
export async function updatePriceItem(input: {
  id: string;
  name_uk: string;
  name_ru: string;
  name_en: string;
  price: string;
  is_visible: boolean;
}) {
  const numeric = Number(String(input.price).replace(/[\s ]/g, "").replace(",", "."));
  await sql`
    UPDATE price_items SET
      name_uk = ${input.name_uk},
      name_ru = ${input.name_ru || null},
      name_en = ${input.name_en || null},
      price = ${input.price},
      price_numeric = ${Number.isFinite(numeric) ? Math.round(numeric) : null},
      is_visible = ${input.is_visible},
      source = 'manual',
      updated_at = now()
    WHERE id = ${input.id}
  `;
  revalidatePrices();
  return { ok: true as const };
}

export async function setPriceCategoryVisibility(id: string, isVisible: boolean) {
  await sql`UPDATE price_categories SET is_visible = ${isVisible}, updated_at = now() WHERE id = ${id}`;
  revalidatePrices();
  return { ok: true as const };
}

export async function setPriceSubcategoryVisibility(id: string, isVisible: boolean) {
  await sql`UPDATE price_subcategories SET is_visible = ${isVisible}, updated_at = now() WHERE id = ${id}`;
  revalidatePrices();
  return { ok: true as const };
}
```

- [ ] **Step 2: Find every caller of the deleted action**

Run: `grep -rn "savePriceCategories" src`
Expected: hits only in `src/app/(admin)/admin/_components/prices-editor.tsx`. Every one is replaced in the next step.

- [ ] **Step 3: Rewrite the editor**

Replace the whole of `src/app/(admin)/admin/_components/prices-editor.tsx` with a searchable, per-row editor:

```tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { updatePriceItem } from "../_actions/phase2";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";

export interface PriceItem {
  id?: string;
  name_uk: string;
  name_ru: string;
  name_en: string;
  price: string;
  is_visible?: boolean;
  duration?: string | null;
  subcategory_label?: string | null;
}

export interface PriceCategory {
  id?: string;
  slug: string;
  label_uk: string;
  label_ru: string;
  label_en: string;
  link: string | null;
  items: PriceItem[];
}

interface Props { initial: PriceCategory[] }

export default function PricesEditor({ initial }: Props) {
  const [cats, setCats] = useState<PriceCategory[]>(initial);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [activeSlug, setActiveSlug] = useState(initial[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = cats.find((c) => c.slug === activeSlug) ?? cats[0];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = q ? cats.flatMap((c) => c.items) : (active?.items ?? []);
    return q ? source.filter((i) => i.name_uk.toLowerCase().includes(q)) : source;
  }, [cats, active, query]);

  const patch = (id: string, p: Partial<PriceItem>) => {
    setCats((prev) => prev.map((c) => ({
      ...c,
      items: c.items.map((i) => (i.id === id ? { ...i, ...p } : i)),
    })));
  };

  const save = (item: PriceItem) => {
    if (!item.id) return;
    startTransition(async () => {
      await updatePriceItem({
        id: item.id!,
        name_uk: item.name_uk,
        name_ru: item.name_ru,
        name_en: item.name_en,
        price: item.price,
        is_visible: item.is_visible ?? true,
      });
      setSavedId(item.id!);
      setTimeout(() => setSavedId(null), 1500);
    });
  };

  const nameField = (`name_${locale}`) as "name_uk" | "name_ru" | "name_en";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <MiniTabs value={locale} onChange={setLocale} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all categories…"
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-md text-sm"
        />
      </div>

      {!query && (
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActiveSlug(c.slug)}
              className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                activeSlug === c.slug ? "bg-neutral-900 text-white" : "bg-neutral-100"
              }`}
            >
              {c.label_uk} <span className="opacity-60">{c.items.length}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        {rows.length} rows. Editing a price marks the row as a manual override —
        the next spreadsheet import will flag it instead of overwriting it.
      </p>

      <div className="divide-y border rounded-md">
        {rows.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2">
            <button
              type="button"
              onClick={() => { patch(item.id!, { is_visible: !(item.is_visible ?? true) }); }}
              title={item.is_visible ?? true ? "Visible" : "Hidden"}
              className="shrink-0 text-neutral-500 cursor-pointer"
            >
              {item.is_visible ?? true ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <input
              value={item[nameField] ?? ""}
              onChange={(e) => patch(item.id!, { [nameField]: e.target.value })}
              className="flex-1 px-2 py-1.5 border rounded text-sm"
            />
            <input
              value={item.price}
              onChange={(e) => patch(item.id!, { price: e.target.value })}
              className="w-28 px-2 py-1.5 border rounded text-sm text-right"
            />
            <button
              type="button"
              onClick={() => save(item)}
              disabled={pending}
              className="shrink-0 px-3 py-1.5 text-sm bg-neutral-900 text-white rounded cursor-pointer disabled:opacity-50"
            >
              {savedId === item.id ? <Check size={14} /> : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Feed the editor the new fields**

Both admin pages build `PriceCategory[]` from two plain `SELECT *` queries. In
`src/app/(admin)/admin/pricing/page.tsx`, replace the `price_items` query in the
`Promise.all` block:

```ts
    sql`SELECT i.*, s.label_uk AS subcategory_label
        FROM price_items i
        LEFT JOIN price_subcategories s ON s.id = i.subcategory_id
        ORDER BY i.sort_order`,
```

and extend the item mapping inside `cats` with the three new fields:

```ts
      .map((it) => ({
        id: it.id as string,
        name_uk: (it.name_uk as string) || "",
        name_ru: (it.name_ru as string) || "",
        name_en: (it.name_en as string) || "",
        price: (it.price as string) || "",
        is_visible: (it.is_visible as boolean) ?? true,
        duration: (it.duration as string) ?? null,
        subcategory_label: (it.subcategory_label as string) ?? null,
      })),
```

Then apply the identical two changes to the equivalent query and mapping in
`src/app/(admin)/admin/pages/[slug]/page.tsx`, which builds the same shape for
the page-form "Price Items" tab.

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: clean.

- [ ] **Step 6: Verify a save round-trips**

```bash
npm run dev &
sleep 8
```

Open `http://localhost:3000/admin/pricing`, search for `Пахви`, change the price to `815`, press Save, reload the page, and confirm it persists. Then check the row is flagged:

```bash
npx tsx -e "
import postgres from 'postgres';
import * as fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env.local','utf-8').split('\n').filter(l=>l.includes('=')).map(l=>{const [k,...v]=l.split('=');return [k.trim(),v.join('=').trim()]}));
const sql = postgres(env.DATABASE_URL);
console.table(await sql\`SELECT name_uk, price, source FROM price_items WHERE name_uk = 'Пахви'\`);
await sql.end();
"
kill %1
```

Expected: one row with `price = 815` and `source = manual`. Set it back to `810` in the UI afterwards.

- [ ] **Step 7: Commit**

```bash
git branch --show-current   # must print: develop
git add "src/app/(admin)/admin/_components/prices-editor.tsx" "src/app/(admin)/admin/_actions/phase2.ts" "src/app/(admin)/admin/pricing/page.tsx" "src/app/(admin)/admin/pages/[slug]/page.tsx"
git commit -m "feat(admin): per-row price editing instead of delete-and-reinsert"
```

---

### Task 11: Admin import tab

**Files:**
- Create: `src/app/(admin)/admin/pricing/_components/price-import.tsx`
- Create: `src/app/(admin)/admin/_actions/price-import.ts`
- Modify: `src/app/(admin)/admin/pricing/page.tsx` (mount the component)

**Interfaces:**
- Consumes: `parseGenevitySheet`, `applyTaxonomy`, `diffCatalogue`, `loadExistingRows`, `applyCatalogue`.
- Produces:
  ```ts
  export async function previewPriceImport(formData: FormData): Promise<DiffResult>;
  export async function commitPriceImport(formData: FormData): Promise<{ categories: number; subcategories: number; items: number; hidden: number }>;
  ```

**Context.** Two actions rather than one because the file is re-parsed on commit: the preview must not hold server state between requests. The upload is the same `.xlsx` both times.

- [ ] **Step 1: Write the server actions**

Create `src/app/(admin)/admin/_actions/price-import.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/client";
import { parseGenevitySheet } from "@/lib/prices/parse-xlsx";
import { applyTaxonomy } from "@/lib/prices/taxonomy";
import { diffCatalogue, type DiffResult } from "@/lib/prices/diff";
import { applyCatalogue, loadExistingRows } from "@/lib/prices/apply";

async function readCatalogue(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file uploaded");
  const buffer = Buffer.from(await file.arrayBuffer());
  return applyTaxonomy(await parseGenevitySheet(buffer));
}

export async function previewPriceImport(formData: FormData): Promise<DiffResult> {
  const cats = await readCatalogue(formData);
  const existing = await loadExistingRows(sql as never);
  return diffCatalogue(cats, existing);
}

export async function commitPriceImport(formData: FormData) {
  const cats = await readCatalogue(formData);
  const result = await applyCatalogue(sql as never, cats);
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/ru/prices");
  revalidatePath("/en/prices");
  return result;
}
```

- [ ] **Step 2: Write the upload UI**

Create `src/app/(admin)/admin/pricing/_components/price-import.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Upload, AlertTriangle } from "lucide-react";
import { previewPriceImport, commitPriceImport } from "../../_actions/price-import";
import type { DiffResult } from "@/lib/prices/diff";

export default function PriceImport() {
  const [file, setFile] = useState<File | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: "preview" | "commit") => {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      try {
        if (fn === "preview") {
          setDiff(await previewPriceImport(fd));
          setApplied(null);
        } else {
          const r = await commitPriceImport(fd);
          setApplied(`${r.items} items across ${r.categories} categories (${r.hidden} hidden)`);
          setDiff(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const notable = diff?.changes.filter((c) => c.kind !== "unchanged") ?? [];
  const conflicts = notable.filter((c) => c.isManualConflict);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setDiff(null); setApplied(null); }}
          className="text-sm"
        />
        <button
          type="button"
          onClick={() => run("preview")}
          disabled={!file || pending}
          className="px-3 py-1.5 text-sm border rounded cursor-pointer disabled:opacity-50"
        >
          <Upload size={14} className="inline mr-1" /> Preview changes
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        Reads only the “прайс GENEVITY (Гончара)” sheet. Consultations are never
        touched. Rows missing from the file are hidden, not deleted.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {applied && <p className="text-sm text-green-700">Imported {applied}</p>}

      {diff && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            {Object.entries(diff.counts).map(([kind, n]) => (
              <span key={kind}>{kind}: <strong>{n}</strong></span>
            ))}
          </div>

          {conflicts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
              <AlertTriangle size={14} className="inline mr-1 text-amber-600" />
              {conflicts.length} row(s) were edited by hand in admin and will be
              overwritten by this import.
            </div>
          )}

          <div className="max-h-80 overflow-y-auto border rounded divide-y text-sm">
            {notable.map((c, i) => (
              <div key={i} className="px-3 py-1.5 flex justify-between gap-3">
                <span>
                  <span className="text-neutral-500 mr-2">{c.kind}</span>
                  {c.previousName ? `${c.previousName} → ${c.nameUk}` : c.nameUk}
                </span>
                <span className="shrink-0 tabular-nums">
                  {c.previousPrice ?? "—"} → {c.nextPrice ?? "—"}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => run("commit")}
            disabled={pending}
            className="px-4 py-2 text-sm bg-neutral-900 text-white rounded cursor-pointer disabled:opacity-50"
          >
            Apply {notable.length} changes
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Mount it**

In `src/app/(admin)/admin/pricing/page.tsx`, import `PriceImport` and render it above the existing `PricelistPdfForm`, under a heading such as `Import from spreadsheet`.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 5: Verify the round trip**

```bash
npm run dev &
sleep 8
```

Open `http://localhost:3000/admin/pricing`, upload `Прайс Геліос-4.xlsx`, and press Preview. Expected: `unchanged: 575` and everything else `0`, because Task 6 already imported this exact file. Then temporarily edit one price in the Catalogue tab, preview again, and confirm the row appears as `price-changed` with the manual-conflict banner. Restore the price and re-apply.

```bash
kill %1
```

- [ ] **Step 6: Commit**

```bash
git branch --show-current   # must print: develop
git add "src/app/(admin)/admin/pricing" "src/app/(admin)/admin/_actions/price-import.ts"
git commit -m "feat(admin): upload a price spreadsheet with a diff preview"
```

---

### Task 12: Consultations and final verification

**Files:**
- Create: `scripts/add-consultations.ts`

**Interfaces:**
- Consumes: the `consultations` category.
- Produces: three new rows in `price_items`.

**Context.** The spec adds терапевт, невролог and репродуктолог to the consultations category by hand — they are in the spreadsheet but the category is excluded from import, so they must be inserted directly. Prices come from the sheet; the two overridden consultation prices stay as they are.

- [ ] **Step 1: Write the script**

Create `scripts/add-consultations.ts`:

```ts
/**
 * Add the three consultations present in the price book but missing from the
 * site. The consultations category is excluded from the importer, so these are
 * inserted directly. Idempotent: keyed on the Ukrainian name.
 * Run: npx tsx scripts/add-consultations.ts
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

const NEW = [
  { uk: "Консультація лікаря-терапевта", ru: "Консультация врача-терапевта", en: "Therapist consultation", price: "900", numeric: 900 },
  { uk: "Консультація лікаря-невролога", ru: "Консультация врача-невролога", en: "Neurologist consultation", price: "1 000", numeric: 1000 },
  { uk: "Консультація лікаря-репродуктолога", ru: "Консультация врача-репродуктолога", en: "Reproductive specialist consultation", price: "1 100", numeric: 1100 },
];

async function run() {
  const cat = await sql`SELECT id FROM price_categories WHERE slug = 'consultations'`;
  if (!cat.length) throw new Error("consultations category not found");
  const categoryId = cat[0].id;

  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), 0) AS max FROM price_items WHERE category_id = ${categoryId}`;
  let order = Number(maxRows[0].max);

  for (const c of NEW) {
    const exists = await sql`
      SELECT id FROM price_items WHERE category_id = ${categoryId} AND name_uk = ${c.uk}`;
    if (exists.length) { console.log(`= ${c.uk}`); continue; }
    order++;
    await sql`
      INSERT INTO price_items (category_id, name_uk, name_ru, name_en, price, price_numeric, is_visible, source, sort_order)
      VALUES (${categoryId}, ${c.uk}, ${c.ru}, ${c.en}, ${c.price}, ${c.numeric}, true, 'manual', ${order})
    `;
    console.log(`+ ${c.uk} — ${c.price} ₴`);
  }

  const all = await sql`
    SELECT name_uk, price FROM price_items WHERE category_id = ${categoryId} ORDER BY sort_order`;
  console.table(all);
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/add-consultations.ts`
Expected: three `+` lines, then a table of 11 consultations. Running it again prints three `=` lines and adds nothing.

- [ ] **Step 3: Verify the consultation prices were not disturbed**

Expected in that same table: `Консультація ендокринолога — 1 100` and `Консультація гастроентеролога — 1 100`. If either reads 950, the importer touched a protected category — stop and check `PROTECTED_CATEGORY_SLUGS` in `src/lib/prices/apply.ts`.

- [ ] **Step 4: Run the full test suite and build**

```bash
npm test
npm run build
npx tsc --noEmit
npm run lint
```

Expected: all pass.

- [ ] **Step 5: Verify the live page end to end**

```bash
npm run dev &
sleep 8
curl -s localhost:3000/prices | grep -c "₴"           # hundreds — all categories in the DOM
curl -s localhost:3000/ru/prices | grep -c "Лицо"     # > 0 — Russian translations resolved
curl -s localhost:3000/prices | grep -c "Крапельниц"  # 0 — hidden category absent
curl -s localhost:3000/prices | grep -c "карциноми"   # 0 — hidden rows absent
kill %1
```

Expected exactly as annotated. A non-zero count on either of the last two means a visibility filter is missing in `getPriceCategoriesWithItems`.

- [ ] **Step 6: Commit**

```bash
git branch --show-current   # must print: develop
git add scripts/add-consultations.ts
git commit -m "feat(prices): add therapist, neurologist and reproductive consultations"
```

- [ ] **Step 7: Push and verify on the preview URL**

```bash
git branch --show-current   # must print: develop
git push origin develop
```

Then open the Vercel preview (`genevity-git-develop-*.vercel.app/prices`) and check: category pills scroll horizontally on mobile, accordions open and close, search finds `ботулін` across categories, a shared `?c=…&s=…` link restores state, and `/ru/prices` shows Russian names.

---

## Notes for the reviewer

- **Nothing here may be merged to `main` without the client's confirmation.** The branch policy allows content and page changes to be cherry-picked, but this is a large, visible change to public pricing and should be seen on the preview URL first.
- **The `Крапельниця — 20 000 ₴` row stays hidden** until the clinic confirms the price. It is one toggle in the admin Catalogue tab.
- **Consultation prices are deliberately not what the spreadsheet says.** Ендокринолог and гастроентеролог remain at 1 100 ₴ per the client's instruction; see the spec's provenance table.
- **Do not migrate the page to Cache Components.** `cacheComponents` is not enabled in `next.config.ts`, so `export const revalidate = 300` on the route plus `revalidatePath()` in the server actions is both correct and consistent with the rest of the app. Enabling PPR is a project-wide change and is out of scope here.
