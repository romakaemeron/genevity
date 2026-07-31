/**
 * Дооптимізація (ТЗ inweb #1) — splice the newly seeded content sections into each
 * service's `block_order`.
 *
 * Why this exists: page block order is driven by `services.block_order`, NOT by
 * `content_sections.sort_order`. `ServiceDetailTemplate` resolves
 *   [...savedValid, ...defaultOrder.filter(k => !savedValid.includes(k))]
 * so any section missing from the saved array is appended *after* the fixed
 * blocks (equipment / doctors / relatedServices / faq / finalCTA) — i.e. it
 * renders below the FAQ and the final CTA. The `inweb-tz1` sections were seeded
 * without touching block_order, so they all landed there.
 *
 * Approach: recompute the whole array per service (idempotent) from placement
 * rules that resolve section ids at runtime — nothing is hard-coded to a UUID,
 * so this survives a re-seed of `scripts/dooptim/seed-sections.ts`.
 *
 * Safety:
 *  - Only ever runs `UPDATE services SET block_order = ...` for the six target
 *    slugs. No other column and no other table is written.
 *  - Dry run by default; writes only with `--apply`.
 *  - Dumps the current block_order of all six services before writing.
 *  - Asserts every emitted key is valid (a `section:<uuid>` owned by that
 *    service, or a known fixed block) and that no section is dropped — the
 *    template silently filters invalid keys, which would make sections vanish.
 *
 * Run: npx tsx scripts/dooptim/reorder-block-order.ts            (dry run)
 *      npx tsx scripts/dooptim/reorder-block-order.ts --apply    (write)
 *      npx tsx scripts/dooptim/reorder-block-order.ts --apply --rollback-out=<path>
 *      npx tsx scripts/dooptim/reorder-block-order.ts --apply --restore-from=<path>
 *        ^ put the six services back to a snapshot written by --rollback-out
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const APPLY = process.argv.includes("--apply");
const SOURCE = "inweb-tz1";
const OWNER_TYPE = "service";

/** Must match SERVICE_FIXED_BLOCKS in src/components/templates/ServiceDetailTemplate.tsx */
const FIXED_BLOCKS = ["equipment", "doctors", "relatedServices", "faq", "finalCTA"] as const;

const DEFAULT_ROLLBACK_DIR =
  "/private/tmp/claude-501/-Users-romakochetov-genevity/acfae8db-2697-4b82-b818-04a1172f9d44/scratchpad";
const rollbackArg = process.argv.find((a) => a.startsWith("--rollback-out="));
const ROLLBACK_PATH = rollbackArg
  ? rollbackArg.slice("--rollback-out=".length)
  : path.join(DEFAULT_ROLLBACK_DIR, "rollback-block-order.json");

const SLUGS = [
  "body",
  "splendor-x",
  "emsculpt-neo",
  "ultraformer-mpt-body",
  "exion-body",
  "m22-stellar-black",
] as const;

/** The `body` hub page is three device summaries; each device's new sections follow its intro. */
const DEVICE_ANCHORS = ["EMSCULPT NEO", "Ultraformer MPT", "Exion Body"];

// ─── placement rules ────────────────────────────────────────────────────────
/**
 * A slot describes exactly one content section of the page, in final reading
 * order. `src` distinguishes hand-authored rows (`old`) from the seeded
 * `inweb-tz1` rows (`new`); `h` disambiguates same-typed rows by heading.
 * Each slot consumes the first not-yet-consumed matching row (scanned by
 * sort_order), and every row must be consumed exactly once.
 */
type Slot = { src: "old" | "new"; type: string; h?: RegExp; why: string };

const s = (src: "old" | "new", type: string, why: string, h?: RegExp): Slot => ({ src, type, h, why });
const IC = "indicationsContraindications";

const RULES: Record<string, Slot[]> = {
  // intro → indications (new merged beside the existing one) → callout → steps →
  // preparation/aftercare → benefits → results → prices → gallery → cta
  "splendor-x": [
    s("old", "richText", "intro"),
    s("old", IC, "existing indications"),
    s("new", IC, "NEW indications — merged beside the existing block"),
    s("old", "callout", "callout"),
    s("old", "steps", "how it works"),
    s("new", "richText", "NEW preparation — after the steps block", /Подготовка/i),
    s("new", "richText", "NEW aftercare — after preparation", /после процедуры/i),
    s("old", "bullets", "benefits"),
    s("new", "richText", "NEW staged results — after benefits", /результат/i),
    s("new", "compareTable", "NEW price table — end of content, before gallery", /прайс|цен/i),
    s("old", "imageGallery", "gallery"),
    s("old", "cta", "cta stays last among content sections"),
  ],
  "emsculpt-neo": [
    s("old", "richText", "intro"),
    s("old", IC, "existing indications"),
    s("new", IC, "NEW indications — merged beside the existing block"),
    s("old", "callout", "callout"),
    s("old", "steps", "how it works"),
    s("old", "bullets", "benefits"),
    s("new", "richText", "NEW results — after benefits", /результат/i),
    s("new", "priceTable", "NEW price table — end of content, before gallery"),
    s("old", "imageGallery", "gallery"),
    s("old", "cta", "cta stays last among content sections"),
  ],
  "ultraformer-mpt-body": [
    s("old", "richText", "intro"),
    s("old", IC, "existing indications"),
    s("new", IC, "NEW indications — merged beside the existing block"),
    s("old", "callout", "callout"),
    s("old", "steps", "how it works"),
    s("old", "bullets", "benefits"),
    s("new", "compareTable", "NEW method comparison — after benefits", /сравнени/i),
    s("new", "richText", "NEW staged results — after the comparison", /результат/i),
    s("new", "compareTable", "NEW prices — after the comparison, before gallery", /цен/i),
    s("old", "imageGallery", "gallery"),
    s("old", "cta", "cta stays last among content sections"),
  ],
  "exion-body": [
    s("old", "richText", "intro"),
    s("old", IC, "existing indications"),
    s("new", IC, "NEW indications — merged beside the existing block"),
    s("old", "callout", "callout"),
    s("old", "steps", "how it works"),
    s("old", "bullets", "benefits"),
    s("new", "richText", "NEW results — after benefits", /результат/i),
    s("old", "imageGallery", "gallery"),
    s("old", "priceTable", "existing price table — before the cta"),
    s("old", "cta", "cta stays last among content sections"),
  ],
  "m22-stellar-black": [
    s("old", "richText", "intro"),
    s("old", IC, "existing indications"),
    s("new", IC, "NEW indications — merged beside the existing block"),
    s("old", "callout", "callout"),
    s("old", "steps", "how it works"),
    s("new", "richText", "NEW aftercare — after the steps block", /рекомендации после/i),
    s("old", "bullets", "benefits"),
    s("new", "richText", "NEW when best to do it — after benefits", /когда лучше/i),
    s("new", "richText", "NEW staged results — after benefits", /поэтапные результаты/i),
    s("old", "imageGallery", "gallery"),
    s("old", "cta", "cta stays last among content sections"),
  ],
};

// ─── db ─────────────────────────────────────────────────────────────────────
const sql = postgres(process.env.DATABASE_URL!);

type Row = { id: string; section_type: string; sort_order: number; data: any };
type Emitted = { key: string; why: string };

const key = (id: string) => `section:${id}`;
const isNew = (r: Row) => r.data?.source === SOURCE;
const headingOf = (r: Row) =>
  String(r.data?.heading?.ru ?? r.data?.title?.ru ?? r.data?.heading?.uk ?? r.data?.title?.uk ?? "");

/** Fixed-block keys of a saved array, in their saved relative order, plus any missing ones. */
function fixedKeysOf(saved: string[]): string[] {
  const inSaved = saved.filter((k) => (FIXED_BLOCKS as readonly string[]).includes(k));
  return [...inSaved, ...FIXED_BLOCKS.filter((k) => !inSaved.includes(k))];
}

/** Slot-driven plan for the five single-device pages. */
function planBySlots(slug: string, rows: Row[], saved: string[]): Emitted[] {
  const slots = RULES[slug];
  if (!slots) throw new Error(`No placement rules for "${slug}"`);
  const pool = [...rows].sort((a, b) => a.sort_order - b.sort_order);
  const used = new Set<string>();
  const out: Emitted[] = [];

  for (const slot of slots) {
    const hit = pool.find(
      (r) =>
        !used.has(r.id) &&
        r.section_type === slot.type &&
        (isNew(r) ? "new" : "old") === slot.src &&
        (!slot.h || slot.h.test(headingOf(r))),
    );
    if (!hit) {
      throw new Error(
        `${slug}: no section matches slot {${slot.src} ${slot.type}${slot.h ? ` ${slot.h}` : ""}} — "${slot.why}"`,
      );
    }
    used.add(hit.id);
    out.push({ key: key(hit.id), why: `${slot.why} [${slot.type}${slot.src === "new" ? " ·new" : ""}]` });
  }

  const leftover = pool.filter((r) => !used.has(r.id));
  if (leftover.length) {
    throw new Error(
      `${slug}: ${leftover.length} section(s) unmatched by the rules: ` +
        leftover.map((r) => `${r.section_type}/"${headingOf(r)}"`).join(", "),
    );
  }

  return [...out, ...fixedKeysOf(saved).map((k) => ({ key: k, why: "fixed block" }))];
}

/**
 * Plan for the `body` hub page. Its copy is three device summaries and its saved
 * block_order deliberately interleaves `equipment` and `doctors` between them, so
 * we keep that shape: each fixed block stays anchored to the same hand-authored
 * section it currently follows, and each device's new sections are emitted
 * directly after that device's intro richText (and before the next fixed block).
 */
function planBody(rows: Row[], saved: string[]): Emitted[] {
  const ordered = [...rows].sort((a, b) => a.sort_order - b.sort_order);

  // Resolve the per-device intro richTexts by provenance-free content match, the
  // same way the seeder did, and assert each one actually owns new sections.
  const anchorNotes = new Map<string, string>();
  for (const device of DEVICE_ANCHORS) {
    const needle = device.toLowerCase();
    const cands = ordered
      .filter((r) => !isNew(r) && r.section_type === "richText")
      .map((r) => ({ r, idx: String(r.data?.body?.ru ?? "").toLowerCase().indexOf(needle) }))
      .filter((c) => c.idx >= 0)
      .sort((a, b) => a.idx - b.idx || a.r.sort_order - b.r.sort_order);
    if (!cands.length) throw new Error(`body: no existing richText mentions "${device}"`);
    const anchor = cands[0].r;
    const at = ordered.findIndex((r) => r.id === anchor.id);
    const run = [];
    for (let j = at + 1; j < ordered.length && isNew(ordered[j]); j++) run.push(ordered[j]);
    if (!run.length) throw new Error(`body: the "${device}" richText is not followed by any ${SOURCE} section`);
    anchorNotes.set(anchor.id, device);
    for (const r of run) anchorNotes.set(r.id, `${device} — NEW ${r.section_type}`);
  }

  // Which hand-authored section does each fixed block currently sit behind?
  // Anchors must be hand-authored rows: the emit loop below walks only those and
  // hangs each device's new sections off them. Anchoring to a seeded row would
  // strand the fixed block (and break idempotency on the second run, once the
  // seeded rows are themselves present in `saved`).
  const newIds = new Set(ordered.filter(isNew).map((r) => r.id));
  const fixedByAnchor = new Map<string, string[]>();
  const leadingFixed: string[] = [];
  let lastSection: string | null = null;
  for (const k of saved) {
    if ((FIXED_BLOCKS as readonly string[]).includes(k)) {
      if (lastSection === null) leadingFixed.push(k);
      else fixedByAnchor.set(lastSection, [...(fixedByAnchor.get(lastSection) ?? []), k]);
    } else if (k.startsWith("section:")) {
      const id = k.slice("section:".length);
      if (!newIds.has(id)) lastSection = id;
    }
  }

  const out: Emitted[] = leadingFixed.map((k) => ({ key: k, why: "fixed block" }));
  const emittedFixed = new Set(leadingFixed);
  for (let i = 0; i < ordered.length; i++) {
    const r = ordered[i];
    if (isNew(r)) continue; // consumed with its anchor below
    out.push({ key: key(r.id), why: anchorNotes.get(r.id) ?? `existing ${r.section_type}` });
    for (let j = i + 1; j < ordered.length && isNew(ordered[j]); j++) {
      const n = ordered[j];
      out.push({ key: key(n.id), why: anchorNotes.get(n.id) ?? `NEW ${n.section_type} — after "${headingOf(r)}"` });
    }
    for (const k of fixedByAnchor.get(r.id) ?? []) {
      out.push({ key: k, why: "fixed block (kept at its existing anchor)" });
      emittedFixed.add(k);
    }
  }
  for (const k of FIXED_BLOCKS) if (!emittedFixed.has(k)) out.push({ key: k, why: "fixed block" });
  return out;
}

// ─── validity assertion ─────────────────────────────────────────────────────
function assertValid(slug: string, order: string[], rows: Row[]) {
  const owned = new Set(rows.map((r) => key(r.id)));

  const invalid = order.filter(
    (k) => (k.startsWith("section:") ? !owned.has(k) : !(FIXED_BLOCKS as readonly string[]).includes(k)),
  );
  if (invalid.length) throw new Error(`${slug}: invalid keys (template would silently drop these): ${invalid.join(", ")}`);

  const dropped = [...owned].filter((k) => !order.includes(k));
  if (dropped.length) throw new Error(`${slug}: sections missing from block_order: ${dropped.join(", ")}`);

  const missingFixed = FIXED_BLOCKS.filter((k) => !order.includes(k));
  if (missingFixed.length) throw new Error(`${slug}: fixed blocks missing: ${missingFixed.join(", ")}`);

  const dupes = order.filter((k, i) => order.indexOf(k) !== i);
  if (dupes.length) throw new Error(`${slug}: duplicate keys: ${[...new Set(dupes)].join(", ")}`);

  const fixedSeq = order.filter((k) => (FIXED_BLOCKS as readonly string[]).includes(k));
  const canonical = FIXED_BLOCKS.filter((k) => fixedSeq.includes(k));
  if (fixedSeq.join(",") !== canonical.join(","))
    throw new Error(`${slug}: fixed blocks reordered: ${fixedSeq.join(", ")}`);

  return { keys: order.length, sections: owned.size };
}

// ─── main ───────────────────────────────────────────────────────────────────
/** Put the six services back to a snapshot written by --rollback-out. */
async function restore(from: string) {
  const snap = JSON.parse(fs.readFileSync(from, "utf-8")) as {
    takenAt: string;
    services: { slug: string; id: string; block_order: string[] | null }[];
  };
  console.log(`Restoring block_order from ${from} (taken ${snap.takenAt})\n`);
  for (const svc of snap.services) {
    if (!(SLUGS as readonly string[]).includes(svc.slug)) throw new Error(`Refusing to restore off-target slug ${svc.slug}`);
    console.log(`   ${svc.slug}: ${svc.block_order?.length ?? 0} keys`);
    if (APPLY) await sql`UPDATE services SET block_order = ${svc.block_order as any} WHERE slug = ${svc.slug}`;
  }
  console.log(APPLY ? "\n✓ restored\n" : "\nDry run — nothing written.\n");
  await sql.end();
}

async function main() {
  const restoreArg = process.argv.find((a) => a.startsWith("--restore-from="));
  if (restoreArg) return restore(restoreArg.slice("--restore-from=".length));

  console.log(`\n=== dooptim reorder-block-order — ${APPLY ? "APPLY (writing)" : "DRY RUN (no writes)"} ===\n`);

  const svcRows = await sql<{ id: string; slug: string; block_order: string[] | null }[]>`
    SELECT id, slug, block_order FROM services WHERE slug = ANY(${SLUGS as unknown as string[]})`;
  const bySlug = new Map(svcRows.map((r) => [r.slug, r]));
  const missing = SLUGS.filter((s) => !bySlug.has(s));
  if (missing.length) throw new Error(`Missing services: ${missing.join(", ")}`);

  // Rollback snapshot — always written, before any UPDATE.
  fs.mkdirSync(path.dirname(ROLLBACK_PATH), { recursive: true });
  fs.writeFileSync(
    ROLLBACK_PATH,
    JSON.stringify(
      {
        takenAt: new Date().toISOString(),
        note: "Restore with: UPDATE services SET block_order = <block_order> WHERE id = <id>;",
        services: SLUGS.map((slug) => {
          const r = bySlug.get(slug)!;
          return { slug, id: r.id, block_order: r.block_order };
        }),
      },
      null,
      2,
    ),
  );
  console.log(`Rollback snapshot: ${ROLLBACK_PATH}\n`);

  let changed = 0;
  for (const slug of SLUGS) {
    const svc = bySlug.get(slug)!;
    const saved = svc.block_order ?? [];
    const rows = await sql<Row[]>`
      SELECT id, section_type::text AS section_type, sort_order, data
      FROM content_sections
      WHERE owner_type = ${OWNER_TYPE} AND owner_id = ${svc.id}
      ORDER BY sort_order, created_at`;

    const plan = slug === "body" ? planBody(rows, saved) : planBySlots(slug, rows, saved);
    const order = plan.map((p) => p.key);
    const stats = assertValid(slug, order, rows);
    const same = JSON.stringify(saved) === JSON.stringify(order);

    console.log(`── ${slug} (${svc.id})  ${same ? "· already up to date (no-op)" : "· CHANGED"}`);
    console.log(`   assertion: OK — ${stats.keys} keys, all valid, all ${stats.sections} sections present, no dupes`);
    console.log(`   OLD (${saved.length}):`);
    for (const k of saved) console.log(`      ${k}`);
    console.log(`   NEW (${order.length}):`);
    for (const p of plan) {
      const flag = saved.includes(p.key) ? " " : "+";
      console.log(`    ${flag} ${p.key.padEnd(46)} ${p.why}`);
    }
    console.log();

    if (!same) changed++;
    if (APPLY && !same) {
      await sql`UPDATE services SET block_order = ${order} WHERE slug = ${slug}`;
      const after = await sql<{ block_order: string[] }[]>`SELECT block_order FROM services WHERE slug = ${slug}`;
      if (JSON.stringify(after[0].block_order) !== JSON.stringify(order))
        throw new Error(`${slug}: write-back verification failed`);
      console.log(`   ✓ written & verified\n`);
    }
  }

  console.log(
    APPLY
      ? `Done — ${changed} service(s) updated, ${SLUGS.length - changed} already correct.\n`
      : `Dry run complete — ${changed} service(s) would change. Nothing written. Re-run with --apply.\n`,
  );
  await sql.end();
}

main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
