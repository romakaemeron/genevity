/**
 * Inweb's ТЗ copy supersedes the older indications/contraindications and the
 * "Подготовка и рекомендации" bullets that were already on the six apparatus
 * pages — their content overlaps 70-100%, so keeping both renders duplicate
 * blocks back to back.
 *
 * This removes the superseded (unmarked) rows, leaving the `inweb-tz1` ones,
 * and drops their keys from services.block_order.
 *
 * Only ever deletes a row when a marked replacement of the SAME section_type
 * exists on the SAME service, so it cannot strip a page of a block type.
 *
 * Dry run by default. Run: npx tsx scripts/dooptim/replace-superseded.ts [--apply]
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const APPLY = process.argv.includes("--apply");

const SLUGS = ["body", "splendor-x", "emsculpt-neo", "ultraformer-mpt-body", "exion-body", "m22-stellar-black"];

/** Section types where the new copy supersedes the old block. */
const SUPERSEDES = new Set(["indicationsContraindications", "bullets"]);

const norm = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9 ]/g, "").replace(/\s+/g, " ").trim();

function headingRu(d: any): string {
  const h = d.heading ?? d.indicationsHeading;
  if (!h) return "";
  return typeof h === "string" ? h : (h.ru ?? h.uk ?? "");
}

(async () => {
  let totalDeleted = 0;

  for (const slug of SLUGS) {
    const svc = await sql`SELECT id FROM services WHERE slug = ${slug}`;
    if (!svc.length) throw new Error(`service ${slug} not found`);
    const serviceId = svc[0].id as string;

    const rows = await sql`
      SELECT id, section_type, data, sort_order, data->>'source' AS src
      FROM content_sections
      WHERE owner_type = 'service' AND owner_id = ${serviceId}
      ORDER BY sort_order`;

    const parsed = rows.map((r) => ({
      id: r.id as string,
      type: r.section_type as string,
      src: r.src as string | null,
      data: typeof r.data === "string" ? JSON.parse(r.data as string) : (r.data as any),
    }));

    const doomed: { id: string; type: string; heading: string; because: string }[] = [];

    for (const old of parsed) {
      if (old.src === "inweb-tz1") continue;          // never touch the new rows
      if (!SUPERSEDES.has(old.type)) continue;         // only these two types

      const replacements = parsed.filter((n) => n.src === "inweb-tz1" && n.type === old.type);
      if (!replacements.length) continue;              // nothing supersedes it — keep

      // For bullets the heading must match; for indications the type alone is
      // enough, since a page has exactly one such block per procedure.
      let match = replacements[0];
      if (old.type === "bullets") {
        const m = replacements.find((n) => norm(headingRu(n.data)) === norm(headingRu(old.data)));
        if (!m) continue;                              // different bullets block — keep
        match = m;
      }

      doomed.push({
        id: old.id,
        type: old.type,
        heading: headingRu(old.data).slice(0, 60),
        because: `superseded by ${match.id.slice(0, 8)}`,
      });
    }

    console.log(`\n=== ${slug}`);
    if (!doomed.length) {
      console.log("   nothing superseded");
      continue;
    }
    for (const d of doomed) console.log(`   DELETE ${d.id.slice(0, 8)} ${d.type.padEnd(30)} "${d.heading}"  (${d.because})`);
    totalDeleted += doomed.length;

    if (APPLY) {
      await sql.begin(async (t) => {
        for (const d of doomed) {
          await t`DELETE FROM content_sections WHERE id = ${d.id}`;
        }
        // Drop the removed keys from block_order.
        const keys = doomed.map((d) => `section:${d.id}`);
        await t`
          UPDATE services
          SET block_order = (
            SELECT array_agg(k ORDER BY ord)
            FROM unnest(block_order) WITH ORDINALITY AS u(k, ord)
            WHERE k <> ALL(${keys})
          )
          WHERE id = ${serviceId}`;
      });
      console.log(`   ✓ deleted ${doomed.length}, block_order cleaned`);
    }
  }

  console.log(APPLY ? `\nDONE — ${totalDeleted} superseded row(s) removed` : `\nDRY RUN — ${totalDeleted} row(s) would be removed. Re-run with --apply`);
  await sql.end();
})();
