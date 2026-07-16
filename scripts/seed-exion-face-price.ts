/**
 * "Дооптимізація" §4.1 — add the missing "Вартість" section to the EXION Face
 * service page. The price catalog (Genevity_Price_Catalog.pdf, Розділ 01) has
 * NO "EXION"-labelled block; EXION Face's own page describes the procedure as
 * "монополярна RF + ультразвук", which maps to the catalog's per-zone
 * "RF-ЛІФТИНГ + УЛЬТРАЗВУК" rows (1/2/3 зони). This mapping is INFERRED from
 * the page's stated technology and, like VOLNEWMER, is flagged DRAFT — the
 * clinic must confirm the exact EXION Face price rows before production.
 *
 * Idempotent via data->>'_seed'='dooptim-price-exion'. Placed before the first
 * fixed block, matching seed-service-prices-dooptim.ts.
 * Run: npx tsx scripts/seed-exion-face-price.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const SEED = "dooptim-price-exion";
const SLUG = "exion-face";
const FIXED = new Set(["equipment", "doctors", "relatedServices", "faq", "finalCTA"]);

const S = (uk: string, ru: string, en: string) => ({ _type: "localeString", uk, ru, en });
const price = (p: string) => S(`${p} грн`, `${p} грн`, `${p} UAH`);

const HEADING = S("Вартість EXION Face у Дніпрі", "Стоимость EXION Face в Днепре", "EXION Face pricing in Dnipro");

// Catalog "RF-ЛІФТИНГ + УЛЬТРАЗВУК" (monopolar RF + ultrasound = EXION Face tech).
const ROWS = [
  { label: S("1 зона (RF + ультразвук)", "1 зона (RF + ультразвук)", "1 area (RF + ultrasound)"), price: price("2 000") },
  { label: S("2 зони", "2 зоны", "2 areas"), price: price("3 500") },
  { label: S("3 зони", "3 зоны", "3 areas"), price: price("5 000") },
  { label: S("Консультація дерматолога-косметолога", "Консультация дерматолога-косметолога", "Dermatologist-cosmetologist consultation"), price: price("950") },
];
const NOTE = S(
  "Ціни вказані за одну процедуру. Точну вартість лікар підтверджує на консультації.",
  "Цены указаны за одну процедуру. Точную стоимость врач подтверждает на консультации.",
  "Prices are per single procedure. The exact cost is confirmed by the doctor at your consultation.",
);

async function main() {
  await sql`
    DELETE FROM content_sections WHERE owner_type='service' AND (
      (jsonb_typeof(data)='object' AND data->>'_seed'=${SEED}) OR
      (jsonb_typeof(data)='string' AND (data #>> '{}')::jsonb->>'_seed'=${SEED})
    )`;

  const svc = await sql`SELECT id, block_order FROM services WHERE slug=${SLUG}`;
  if (!svc.length) { console.error(`✗ no service ${SLUG}`); process.exit(1); }
  const ownerId = svc[0].id as string;
  const data = { _seed: SEED, heading: HEADING, rows: ROWS, note: NOTE };
  const ins = await sql`
    INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
    VALUES ('service', ${ownerId}, 20, 'priceTable'::section_type, ${sql.json(data)})
    RETURNING id`;
  const key = `section:${ins[0].id}`;

  const order: string[] = (svc[0].block_order as string[] | null) || [];
  if (order.length) {
    const filtered = order.filter((k) => k !== key);
    const idx = filtered.findIndex((k) => FIXED.has(k));
    const at = idx === -1 ? filtered.length : idx;
    filtered.splice(at, 0, key);
    await sql`UPDATE services SET block_order=${filtered} WHERE id=${ownerId}`;
  }
  console.log(`✓ ${SLUG}: price section added (DRAFT — clinic to verify EXION Face rows)`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
