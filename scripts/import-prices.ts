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

  for (const w of diff.warnings) console.warn("  ⚠", w);

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

  // Sanity gate specific to this CLI: it knows the expected size of THIS
  // sheet (~551 items), which applyCatalogue cannot know in general. The
  // more general "would hide most of what's currently visible" guard now
  // lives inside applyCatalogue itself, so both this CLI and the admin
  // upload inherit it from one place instead of duplicating it here.
  if (total < 500) {
    throw new Error(`Refusing to apply: parsed only ${total} items, expected ~551.`);
  }

  const result = await applyCatalogue(sql as never, cats);
  console.log("Applied:", result);
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
