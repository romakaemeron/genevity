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
