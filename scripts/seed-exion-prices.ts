/**
 * EXION pricing — from the client price file (docs/Прайс дженевети (1).xlsx,
 * section "Exion"), verified against the client's screenshots (2026-07).
 *
 * The EXION device has 4 sub-modes; they are split across the two site pages:
 *   exion-face → Microneedling RF (face zones) + Monopolar RF + RF+ultrasound
 *   exion-body → Microneedling RF (body zones) + Monopolar RF + RF+ultrasound
 *                + Gynaecology
 * The sub-mode is prefixed into each row label so the repeated "1/2/3 зони"
 * zone rows across modes stay unambiguous inside one compact priceTable.
 *
 * Idempotent via data->>'_seed'='dooptim-price-exion'. Places the block before
 * the first fixed block, matching seed-service-prices-dooptim.ts.
 * Run: npx tsx scripts/seed-exion-prices.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const SEED = "dooptim-price-exion";
const FIXED = new Set(["equipment", "doctors", "relatedServices", "faq", "finalCTA"]);

type L = { uk: string; ru: string; en: string };
const S = (uk: string, ru: string, en: string): L & { _type: string } => ({ _type: "localeString", uk, ru, en });
const price = (p: string) => S(`${p} грн`, `${p} грн`, `${p} UAH`);
const HEAD = (svc: string) => S(`Вартість ${svc} у Дніпрі`, `Стоимость ${svc} в Днепре`, `${svc} pricing in Dnipro`);
const NOTE = S(
  "Ціни вказані за одну процедуру. Точну вартість лікар підтверджує на консультації.",
  "Цены указаны за одну процедуру. Точную стоимость врач подтверждает на консультации.",
  "Prices are per single procedure. The exact cost is confirmed by the doctor at your consultation.",
);

// mode prefix + zone label → "Mode: zone"
const MRF: L = { uk: "Мікроголковий RF", ru: "Микроигольчатый RF", en: "Microneedling RF" };
const MONO: L = { uk: "Монополярний RF", ru: "Монополярный RF", en: "Monopolar RF" };
const RFUS: L = { uk: "RF + ультразвук", ru: "RF + ультразвук", en: "RF + ultrasound" };
const GYN: L = { uk: "Гінекологія", ru: "Гинекология", en: "Gynaecology" };
const row = (m: L, uk: string, ru: string, en: string, p: string) => ({
  label: S(`${m.uk}: ${uk}`, `${m.ru}: ${ru}`, `${m.en}: ${en}`),
  price: price(p),
});

// Shared zone modes (identical on both pages).
const MONO_ROWS = [
  row(MONO, "1 зона (20 хв)", "1 зона (20 мин)", "1 area (20 min)", "2 350"),
  row(MONO, "2 зони (30 хв)", "2 зоны (30 мин)", "2 areas (30 min)", "4 000"),
  row(MONO, "3 зони (40 хв)", "3 зоны (40 мин)", "3 areas (40 min)", "5 500"),
];
const RFUS_ROWS = [
  row(RFUS, "1 зона", "1 зона", "1 area", "2 000"),
  row(RFUS, "2 зони", "2 зоны", "2 areas", "3 500"),
  row(RFUS, "3 зони", "3 зоны", "3 areas", "5 000"),
];
const CONSULT = {
  label: S("Консультація дерматолога-косметолога", "Консультация дерматолога-косметолога", "Dermatologist-cosmetologist consultation"),
  price: price("950"),
};

// Microneedling RF — face zones (exion-face) vs body zones (exion-body).
const FACE_MRF = [
  row(MRF, "Обличчя", "Лицо", "Face", "14 500"),
  row(MRF, "Шия", "Шея", "Neck", "13 500"),
  row(MRF, "Обличчя та шия", "Лицо и шея", "Face and neck", "17 500"),
  row(MRF, "Обличчя, шия, декольте", "Лицо, шея, декольте", "Face, neck, décolleté", "19 500"),
  row(MRF, "Шия та декольте", "Шея и декольте", "Neck and décolleté", "14 500"),
];
const BODY_MRF = [
  row(MRF, "Живіт (20×20 см²)", "Живот (20×20 см²)", "Abdomen (20×20 cm²)", "15 500"),
  row(MRF, "Тіло (20×20 см²)", "Тело (20×20 см²)", "Body (20×20 cm²)", "15 500"),
  row(MRF, "Кисті рук, коліна, лікті", "Кисти рук, колени, локти", "Hands, knees, elbows", "13 500"),
  row(MRF, "Трицепс", "Трицепс", "Triceps", "15 500"),
  row(MRF, "Внутрішня поверхня стегон", "Внутренняя поверхность бёдер", "Inner thighs", "17 500"),
];
const GYN_ROWS = [row(GYN, "1 зона", "1 зона", "1 area", "1 600")];

const PAGES: Record<string, { heading: unknown; rows: unknown[] }> = {
  "exion-face": { heading: HEAD("EXION Face"), rows: [...FACE_MRF, ...MONO_ROWS, ...RFUS_ROWS, CONSULT] },
  "exion-body": { heading: HEAD("EXION Body"), rows: [...BODY_MRF, ...MONO_ROWS, ...RFUS_ROWS, ...GYN_ROWS, CONSULT] },
};

async function main() {
  await sql`
    DELETE FROM content_sections WHERE owner_type='service' AND (
      (jsonb_typeof(data)='object' AND data->>'_seed'=${SEED}) OR
      (jsonb_typeof(data)='string' AND (data #>> '{}')::jsonb->>'_seed'=${SEED})
    )`;

  for (const [slug, sec] of Object.entries(PAGES)) {
    const svc = await sql`SELECT id, block_order FROM services WHERE slug=${slug}`;
    if (!svc.length) { console.warn(`✗ no service ${slug}`); continue; }
    const ownerId = svc[0].id as string;
    const data = { _seed: SEED, note: NOTE, heading: sec.heading, rows: sec.rows };
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
    console.log(`✓ ${slug}: EXION price table added (${(sec.rows as unknown[]).length} rows)`);
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
