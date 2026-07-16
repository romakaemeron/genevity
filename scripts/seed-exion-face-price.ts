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

const HEADING = {
  _type: "localeString",
  uk: "Вартість EXION Face у Дніпрі",
  ru: "Стоимость EXION Face в Днепре",
  en: "EXION Face pricing in Dnipro",
};

// Catalog "RF-ЛІФТИНГ + УЛЬТРАЗВУК" (monopolar RF + ultrasound = EXION Face tech).
type P = { uk: string; ru: string; en: string; p: string };
const ROWS: P[] = [
  { uk: "1 зона (RF + ультразвук)", ru: "1 зона (RF + ультразвук)", en: "1 area (RF + ultrasound)", p: "2 000" },
  { uk: "2 зони", ru: "2 зоны", en: "2 areas", p: "3 500" },
  { uk: "3 зони", ru: "3 зоны", en: "3 areas", p: "5 000" },
  { uk: "Консультація дерматолога-косметолога", ru: "Консультация дерматолога-косметолога", en: "Dermatologist-cosmetologist consultation", p: "950" },
];
const NOTE = {
  uk: "Ціни вказані за одну процедуру. Точну вартість лікар підтверджує на консультації.",
  ru: "Цены указаны за одну процедуру. Точную стоимость врач подтверждает на консультации.",
  en: "Prices are per single procedure. The exact cost is confirmed by the doctor at your consultation.",
};

const items = {
  _type: "localeStringArray",
  uk: [...ROWS.map((r) => `${r.uk} — ${r.p} грн`), NOTE.uk],
  ru: [...ROWS.map((r) => `${r.ru} — ${r.p} грн`), NOTE.ru],
  en: [...ROWS.map((r) => `${r.en} — ${r.p} UAH`), NOTE.en],
};

async function main() {
  await sql`
    DELETE FROM content_sections WHERE owner_type='service' AND (
      (jsonb_typeof(data)='object' AND data->>'_seed'=${SEED}) OR
      (jsonb_typeof(data)='string' AND (data #>> '{}')::jsonb->>'_seed'=${SEED})
    )`;

  const svc = await sql`SELECT id, block_order FROM services WHERE slug=${SLUG}`;
  if (!svc.length) { console.error(`✗ no service ${SLUG}`); process.exit(1); }
  const ownerId = svc[0].id as string;
  const data = { _seed: SEED, body: null, heading: HEADING, items };
  const ins = await sql`
    INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
    VALUES ('service', ${ownerId}, 20, 'bullets'::section_type, ${sql.json(data)})
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
