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
