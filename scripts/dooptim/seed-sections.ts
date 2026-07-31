/**
 * Дооптимізація (ТЗ inweb #1) — seed the extra SEO content sections for the six
 * `apparatus-cosmetology` service pages.
 *
 * Input : scripts/dooptim/copy-i18n.json (Task 1 + Task 2 output, every user
 *         visible string is `{uk, ru, en}`).
 * Output: rows in `content_sections` (owner_type = 'service'), each carrying
 *         `data.source = 'inweb-tz1'` so re-runs are idempotent.
 *
 * Safety:
 *  - Only ever touches `content_sections` rows with owner_type = 'service' and
 *    owner_id ∈ the six target services. No other table is written.
 *  - Only deletes rows carrying the `inweb-tz1` provenance marker. Hand-authored
 *    sections are never deleted.
 *  - Dry run by default; writes only with `--apply`.
 *  - Every service's delete + insert + reorder runs in one transaction.
 *
 * Run: npx tsx scripts/dooptim/seed-sections.ts            (dry run)
 *      npx tsx scripts/dooptim/seed-sections.ts --apply    (write)
 *      npx tsx scripts/dooptim/seed-sections.ts --apply --rollback-out=<path>
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const APPLY = process.argv.includes("--apply");
const SOURCE = "inweb-tz1";
const OWNER_TYPE = "service";

const DEFAULT_ROLLBACK_DIR =
  "/private/tmp/claude-501/-Users-romakochetov-genevity/acfae8db-2697-4b82-b818-04a1172f9d44/scratchpad";
const rollbackArg = process.argv.find((a) => a.startsWith("--rollback-out="));
const ROLLBACK_PATH = rollbackArg
  ? rollbackArg.slice("--rollback-out=".length)
  : path.join(DEFAULT_ROLLBACK_DIR, "rollback-sections.json");

/** Slugs to seed, in report order. All under `apparatus-cosmetology`. */
const SLUGS = [
  "body",
  "splendor-x",
  "emsculpt-neo",
  "ultraformer-mpt-body",
  "exion-body",
  "m22-stellar-black",
] as const;

/** The `body` hub page interleaves new sections after these device intros. */
const DEVICE_ANCHORS = ["EMSCULPT NEO", "Ultraformer MPT", "Exion Body"];

// ─── localized value shapes (the admin editor + renderer key off `_type`) ────
type L = { uk: string; ru: string; en: string };
type LA = { uk: string[]; ru: string[]; en: string[] };

const locStr = (v: L) => ({ _type: "localeString", uk: v.uk, ru: v.ru, en: v.en });
const locText = (v: L) => ({ _type: "localeText", uk: v.uk, ru: v.ru, en: v.en });
const locArr = (items: L[]) => ({
  _type: "localeStringArray",
  uk: items.map((i) => i.uk),
  ru: items.map((i) => i.ru),
  en: items.map((i) => i.en),
});
/** Already-grouped `{uk: [...], ru: [...], en: [...]}` payload. */
const locArrRaw = (v: LA) => ({ _type: "localeStringArray", uk: v.uk, ru: v.ru, en: v.en });

// ─── input ──────────────────────────────────────────────────────────────────
type Section = Record<string, any> & { type: string; after?: string };
type Page = { slug: string; sections: Section[] };

const COPY_PATH = path.resolve(__dirname, "copy-i18n.json");
const copy: { pages: Page[] } = JSON.parse(fs.readFileSync(COPY_PATH, "utf-8"));

function isLocaleArrayObject(v: any): v is LA {
  return v && !Array.isArray(v) && Array.isArray(v.uk) && Array.isArray(v.ru) && Array.isArray(v.en);
}
function toArray(v: any) {
  if (isLocaleArrayObject(v)) return locArrRaw(v);
  if (Array.isArray(v)) return locArr(v as L[]);
  throw new Error(`Cannot coerce to localeStringArray: ${JSON.stringify(v).slice(0, 120)}`);
}

/** Map a copy-i18n section onto the exact `data` payload createDefaultData expects. */
function buildData(s: Section): Record<string, any> {
  let data: Record<string, any>;
  switch (s.type) {
    case "bullets":
      data = { heading: locStr(s.heading), items: toArray(s.items) };
      break;
    case "indicationsContraindications":
      data = {
        title: locStr(s.title),
        indicationsHeading: locStr(s.indicationsHeading),
        indications: toArray(s.indications),
        contraindicationsHeading: locStr(s.contraindicationsHeading),
        contraindications: toArray(s.contraindications),
      };
      break;
    case "priceTable":
      data = {
        heading: locStr(s.heading),
        rows: (s.rows ?? []).map((r: any) => ({ label: locStr(r.label), price: locStr(r.price) })),
        note: s.note ? locStr(s.note) : locStr({ uk: "", ru: "", en: "" }),
      };
      break;
    case "compareTable":
      data = {
        heading: locStr(s.heading),
        columns: toArray(s.columns),
        rows: (s.rows ?? []).map((r: any) => ({ label: locStr(r.label), values: toArray(r.values) })),
      };
      break;
    case "richText":
      data = { heading: locStr(s.heading), body: locText(s.body) };
      break;
    default:
      throw new Error(`Unsupported section type in copy-i18n.json: ${s.type}`);
  }
  data.source = SOURCE;
  return data;
}

// ─── db ─────────────────────────────────────────────────────────────────────
const sql = postgres(process.env.DATABASE_URL!);

type Row = { id: string; section_type: string; sort_order: number; data: any };

type PlanEntry = {
  id: string;
  section_type: string;
  sort_order: number;
  isNew: boolean;
  source: string | null;
  data?: Record<string, any>;
};

/** Pick the existing richText row that *describes* the given device. */
function findAnchor(rows: Row[], device: string): Row {
  const needle = device.toLowerCase();
  const candidates = rows
    .filter((r) => r.section_type === "richText")
    .map((r) => ({ r, idx: String(r.data?.body?.ru ?? "").toLowerCase().indexOf(needle) }))
    .filter((c) => c.idx >= 0)
    .sort((a, b) => a.idx - b.idx || a.r.sort_order - b.r.sort_order);
  if (!candidates.length) throw new Error(`No existing richText mentions "${device}"`);
  if (candidates.length > 1 && candidates[0].idx === candidates[1].idx) {
    throw new Error(`Ambiguous anchor for "${device}" (two rows match at the same position)`);
  }
  return candidates[0].r;
}

/**
 * Plan for the interleaved `body` page: renumber every section of the page in a
 * single pass (0,1,2,… — gap free), new sections landing directly after the
 * richText describing the device named in their `after` field.
 */
function planInterleaved(existing: Row[], sections: Section[]): PlanEntry[] {
  const anchors = new Map<string, string>(); // device -> existing row id
  for (const device of DEVICE_ANCHORS) {
    if (!sections.some((s) => s.after === device)) continue;
    anchors.set(device, findAnchor(existing, device).id);
  }
  const byAnchor = new Map<string, Section[]>();
  const trailing: Section[] = [];
  for (const s of sections) {
    if (s.after) {
      if (!anchors.has(s.after)) throw new Error(`Unknown anchor device "${s.after}"`);
      const id = anchors.get(s.after)!;
      byAnchor.set(id, [...(byAnchor.get(id) ?? []), s]);
    } else {
      trailing.push(s);
    }
  }

  const seq: PlanEntry[] = [];
  const push = (s: Section) =>
    seq.push({ id: randomUUID(), section_type: s.type, sort_order: 0, isNew: true, source: SOURCE, data: buildData(s) });

  const ctas: Row[] = [];
  for (const r of existing) {
    if (r.section_type === "cta") { ctas.push(r); continue; }
    seq.push({
      id: r.id, section_type: r.section_type, sort_order: r.sort_order, isNew: false,
      source: (r.data?.source as string) ?? null,
    });
    for (const s of byAnchor.get(r.id) ?? []) push(s);
  }
  for (const s of trailing) push(s);
  // CTA stays last on the page.
  for (const r of ctas) {
    seq.push({
      id: r.id, section_type: r.section_type, sort_order: r.sort_order, isNew: false,
      source: (r.data?.source as string) ?? null,
    });
  }
  seq.forEach((e, i) => (e.sort_order = i));
  return seq;
}

/** Plan for the simple pages: keep existing sort_order, append from 100 by 10, cta → 900. */
function planAppended(existing: Row[], sections: Section[]): PlanEntry[] {
  const plan: PlanEntry[] = existing.map((r) => ({
    id: r.id,
    section_type: r.section_type,
    sort_order: r.section_type === "cta" ? 900 : r.sort_order,
    isNew: false,
    source: (r.data?.source as string) ?? null,
  }));
  sections.forEach((s, i) => {
    plan.push({
      id: randomUUID(), section_type: s.type, sort_order: 100 + i * 10,
      isNew: true, source: SOURCE, data: buildData(s),
    });
  });
  return plan.sort((a, b) => a.sort_order - b.sort_order);
}

async function main() {
  console.log(`\n=== dooptim seed-sections — ${APPLY ? "APPLY (writing)" : "DRY RUN (no writes)"} ===\n`);

  // 1. resolve slugs → service ids
  const svcRows = await sql<{ id: string; slug: string }[]>`
    SELECT id, slug FROM services WHERE slug = ANY(${SLUGS as unknown as string[]})`;
  const idBySlug = new Map(svcRows.map((r) => [r.slug, r.id]));
  const missing = SLUGS.filter((s) => !idBySlug.has(s));
  if (missing.length) throw new Error(`Missing services: ${missing.join(", ")}`);
  const ALL_IDS = SLUGS.map((s) => idBySlug.get(s)!);

  // 2. rollback snapshot of EVERY existing row for the six services
  const snapshot = await sql`
    SELECT id, owner_type, owner_id, sort_order, section_type::text AS section_type, data
    FROM content_sections
    WHERE owner_type = ${OWNER_TYPE} AND owner_id = ANY(${ALL_IDS})
    ORDER BY owner_id, sort_order`;
  fs.mkdirSync(path.dirname(ROLLBACK_PATH), { recursive: true });
  fs.writeFileSync(
    ROLLBACK_PATH,
    JSON.stringify({ takenAt: new Date().toISOString(), services: Object.fromEntries(idBySlug), rows: snapshot }, null, 2),
  );
  console.log(`Rollback snapshot: ${ROLLBACK_PATH} (${snapshot.length} rows)\n`);

  for (const slug of SLUGS) {
    const serviceId = idBySlug.get(slug)!;
    const page = copy.pages.find((p) => p.slug === slug);
    if (!page) throw new Error(`copy-i18n.json has no page for slug "${slug}"`);

    const existingAll = await sql<Row[]>`
      SELECT id, section_type::text AS section_type, sort_order, data
      FROM content_sections
      WHERE owner_type = ${OWNER_TYPE} AND owner_id = ${serviceId}
      ORDER BY sort_order, created_at`;
    const toDelete = existingAll.filter((r) => r.data?.source === SOURCE);
    const keep = existingAll.filter((r) => r.data?.source !== SOURCE);

    const plan = slug === "body" ? planInterleaved(keep, page.sections) : planAppended(keep, page.sections);

    console.log(`── ${slug} (${serviceId})`);
    console.log(`   existing: ${existingAll.length} | delete (${SOURCE}): ${toDelete.length} | keep: ${keep.length} | insert: ${page.sections.length}`);

    if (APPLY) {
      await sql.begin(async (tx) => {
        await tx`
          DELETE FROM content_sections
          WHERE owner_type = ${OWNER_TYPE} AND owner_id = ${serviceId} AND data->>'source' = ${SOURCE}`;
        for (const e of plan) {
          if (e.isNew) {
            await tx`
              INSERT INTO content_sections (id, owner_type, owner_id, sort_order, section_type, data)
              VALUES (${e.id}, ${OWNER_TYPE}, ${serviceId}, ${e.sort_order}, ${e.section_type}::section_type, ${tx.json(e.data as any)})`;
          } else {
            await tx`
              UPDATE content_sections SET sort_order = ${e.sort_order}, updated_at = now()
              WHERE id = ${e.id} AND owner_type = ${OWNER_TYPE} AND owner_id = ${serviceId}`;
          }
        }
      });
    }

    const final = APPLY
      ? (await sql<{ sort_order: number; section_type: string; source: string | null }[]>`
          SELECT sort_order, section_type::text AS section_type, data->>'source' AS source
          FROM content_sections
          WHERE owner_type = ${OWNER_TYPE} AND owner_id = ${serviceId}
          ORDER BY sort_order`)
      : plan.map((e) => ({ sort_order: e.sort_order, section_type: e.section_type, source: e.source }));

    console.log(`   ${APPLY ? "final" : "planned"} order (${final.length} rows):`);
    for (const r of final) {
      console.log(`     ${String(r.sort_order).padStart(3)}  ${r.section_type.padEnd(30)} ${r.source ?? "—"}`);
    }
    console.log();
  }

  if (!APPLY) console.log("Dry run complete — nothing was written. Re-run with --apply.\n");
  await sql.end();
}

main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
