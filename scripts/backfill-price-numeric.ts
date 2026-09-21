/**
 * Backfill `price_items.price_numeric` for rows that predate the column
 * (source = 'manual', excluded from the spreadsheet import — see
 * import-prices.ts / hide-legacy-price-categories.ts).
 *
 * Derives the integer from the existing `price` text using the exact same
 * normalisation as the importer's `parsePrice` (src/lib/prices/parse-xlsx.ts):
 * strip spaces (including U+00A0 NBSP), treat "," as a decimal separator,
 * round to the nearest integer. Mirrored here rather than imported so the
 * backfill has no runtime dependency on exceljs; kept in lockstep by hand —
 * if parsePrice changes, update parsePriceNumeric below to match.
 *
 * Only updates rows where the derived value is finite. Never touches `price`
 * or any other column, so `source` stays 'manual' and the importer continues
 * to leave these rows alone. Safe to re-run — already-numeric rows are
 * excluded by the WHERE clause.
 *
 * Run: npx tsx scripts/backfill-price-numeric.ts [--dry]
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
const DRY = process.argv.includes("--dry");

/** Mirrors parsePrice's numeric derivation in src/lib/prices/parse-xlsx.ts. */
function parsePriceNumeric(raw: string): number | null {
  const normalized = String(raw).replace(/ /g, " ").trim();
  const digits = normalized.replace(/[\s]/g, "");
  const asFloat = Number(digits.replace(",", "."));
  if (!Number.isFinite(asFloat)) return null;
  return Math.round(asFloat);
}

async function run() {
  const rows = await sql`
    SELECT id, name_uk, price
    FROM price_items
    WHERE price_numeric IS NULL
    ORDER BY name_uk`;

  console.log(`Found ${rows.length} row(s) with price_numeric IS NULL.\n`);

  const changed: { name: string; price: string; before: null; after: number }[] = [];
  const unparseable: { name: string; price: string }[] = [];

  for (const r of rows) {
    const numeric = parsePriceNumeric(r.price);
    if (numeric === null) {
      unparseable.push({ name: r.name_uk, price: r.price });
      continue;
    }
    changed.push({ name: r.name_uk, price: r.price, before: null, after: numeric });
    if (!DRY) {
      await sql`UPDATE price_items SET price_numeric = ${numeric} WHERE id = ${r.id}`;
    }
  }

  console.log(`${DRY ? "[dry] would update" : "Updated"} ${changed.length} row(s):\n`);
  console.log("name".padEnd(40), "price".padEnd(10), "before".padEnd(8), "after");
  for (const c of changed) {
    console.log(c.name.padEnd(40), c.price.padEnd(10), String(c.before).padEnd(8), c.after);
  }

  if (unparseable.length) {
    console.log(`\nLeft NULL — unparseable (${unparseable.length}):`);
    for (const u of unparseable) console.log(`  ${JSON.stringify(u.price)}  ${u.name}`);
  }

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM price_items WHERE price_numeric IS NULL`;
  console.log(`\nRows still NULL after this run: ${count}`);

  await sql.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
