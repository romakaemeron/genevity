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
(async () => {
  const cats = await sql`SELECT id, slug, label_uk FROM price_categories ORDER BY sort_order`;
  for (const c of cats) {
    console.log("\n===", c.slug, "===");
    const items = await sql`SELECT name_uk, name_ru, name_en, price FROM price_items WHERE category_id = ${c.id} ORDER BY sort_order`;
    for (const it of items) {
      console.log(`  UK: ${JSON.stringify(it.name_uk)} · price: ${JSON.stringify(it.price)}`);
    }
  }
  await sql.end();
})();
