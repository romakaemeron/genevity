/**
 * Hide the pre-existing hand-curated price categories that the imported
 * taxonomy (Task 6) now supersedes. These four categories carry the old,
 * pre-correction prices (e.g. laser "Пахви" 400 vs. the corrected 810/500 in
 * lazerna-epilyatsiya) and would otherwise be published twice.
 *
 * Hides, never deletes: rows stay in the database for reference and can be
 * re-enabled from the admin if needed.
 *
 * Run: npx tsx scripts/hide-legacy-price-categories.ts
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

/** Exactly these four slugs — the legacy categories replaced by the import. */
const LEGACY_SLUGS = ["apparatus", "injectable", "laser", "podology"];

/** Guard against a future edit widening this list to include the protected category. */
if (LEGACY_SLUGS.includes("consultations")) {
  throw new Error("Refusing to run: consultations must never be hidden by this script.");
}

async function printState(label: string) {
  const rows = await sql`
    SELECT c.slug, c.is_visible, count(i.id) AS row_count
    FROM price_categories c
    LEFT JOIN price_items i ON i.category_id = c.id
    GROUP BY c.slug, c.is_visible
    ORDER BY c.slug
  `;
  console.log(`\n=== ${label} ===`);
  for (const r of rows) {
    console.log(`  ${String(r.slug).padEnd(50)} is_visible=${r.is_visible}  rows=${r.row_count}`);
  }
}

async function run() {
  await printState("before");

  if (LEGACY_SLUGS.includes("consultations")) {
    throw new Error("Refusing to run: consultations must never be hidden by this script.");
  }

  const updated = await sql`
    UPDATE price_categories
    SET is_visible = false, updated_at = now()
    WHERE slug = ANY(${LEGACY_SLUGS})
    RETURNING slug
  `;
  console.log(`\nHidden ${updated.length} categories: ${updated.map((r) => r.slug).join(", ")}`);

  await printState("after");

  await sql.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
