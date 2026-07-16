/**
 * "Дооптимізація" — add per-service "Вартість" sections to the 7 apparatus
 * pages, using the real per-zone prices from Genevity_Price_Catalog.pdf
 * (Розділ 01 «Апаратні процедури»). Prices are identical across locales; only
 * zone labels translate, so items are generated from a structured table to
 * minimise transcription error. DRAFT — clinic must verify numbers before prod.
 *
 * NOTE: VOLNEWMER per-zone attribution in the catalog's multi-column layout is
 * ambiguous — those figures are flagged for clinic verification.
 *
 * Idempotent via data->>'_seed'='dooptim-price'. Places the block before the
 * first fixed block (equipment/doctors/relatedServices/faq/finalCTA).
 * Run: npx tsx scripts/seed-service-prices-dooptim.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const SEED = "dooptim-price";
const FIXED = new Set(["equipment", "doctors", "relatedServices", "faq", "finalCTA"]);

const S = (uk: string, ru: string, en: string) => ({ _type: "localeString", uk, ru, en });

type P = { uk: string; ru: string; en: string; p: string };
const NOTE = S(
  "Ціни вказані за одну процедуру. Точну вартість лікар підтверджує на консультації.",
  "Цены указаны за одну процедуру. Точную стоимость врач подтверждает на консультации.",
  "Prices are per single procedure. The exact cost is confirmed by the doctor at your consultation.",
);
const CONSULT: P = { uk: "Консультація дерматолога-косметолога", ru: "Консультация дерматолога-косметолога", en: "Dermatologist-cosmetologist consultation", p: "950" };

/** A price value localises only its currency suffix (грн / UAH). */
const price = (p: string) => S(`${p} грн`, `${p} грн`, `${p} UAH`);

/** Build priceTable rows from the per-zone table (+ trailing consultation). */
function rows(list: P[]) {
  return list.map((r) => ({ label: S(r.uk, r.ru, r.en), price: price(r.p) }));
}

const HEAD = (svc: string) => ({
  _type: "localeString",
  uk: `Вартість ${svc} у Дніпрі`, ru: `Стоимость ${svc} в Днепре`, en: `${svc} pricing in Dnipro`,
});

// ── Prices from the catalog (Розділ 01) ──────────────────────────────────
const ULTRAFORMER: P[] = [
  { uk: "Full face (щоки, очі, лоб)", ru: "Full face (щёки, глаза, лоб)", en: "Full face (cheeks, eyes, forehead)", p: "40 000" },
  { uk: "Обличчя, шия, декольте", ru: "Лицо, шея, декольте", en: "Face, neck, décolleté", p: "45 000" },
  { uk: "Овал обличчя", ru: "Овал лица", en: "Face oval", p: "20 000" },
  { uk: "Щоки", ru: "Щёки", en: "Cheeks", p: "15 000" },
  { uk: "Декольте", ru: "Декольте", en: "Décolleté", p: "14 000" },
  { uk: "Чоло", ru: "Лоб", en: "Forehead", p: "12 000" },
  { uk: "Шия", ru: "Шея", en: "Neck", p: "12 000" },
  { uk: "Верхня третина обличчя", ru: "Верхняя треть лица", en: "Upper third of the face", p: "10 000" },
  { uk: "Підборіддя", ru: "Подбородок", en: "Chin", p: "9 000" },
  { uk: "Очі", ru: "Глаза", en: "Eyes", p: "8 000" },
  { uk: "Брови", ru: "Брови", en: "Brows", p: "7 000" },
  { uk: "Маляри", ru: "Скулы", en: "Cheekbones", p: "5 000" },
];
const HYDRAFACIAL: P[] = [
  { uk: "Express — глибоке очищення та зволоження", ru: "Express — глубокое очищение и увлажнение", en: "Express — deep cleansing and hydration", p: "4 000" },
  { uk: "Delux — глибоке очищення + LED-терапія", ru: "Delux — глубокое очищение + LED-терапия", en: "Delux — deep cleansing + LED therapy", p: "4 900" },
  { uk: "Platinum — вакуумний масаж + очищення + LED", ru: "Platinum — вакуумный массаж + очищение + LED", en: "Platinum — vacuum massage + cleansing + LED", p: "5 500" },
  { uk: "Delux для кистей рук", ru: "Delux для кистей рук", en: "Delux for hands", p: "4 500" },
  { uk: "Delux для декольте", ru: "Delux для декольте", en: "Delux for décolleté", p: "4 800" },
];
const EMFACE: P[] = [
  { uk: "Чоло, щоки", ru: "Лоб, щёки", en: "Forehead, cheeks", p: "9 500" },
  { uk: "Чоло, очі", ru: "Лоб, глаза", en: "Forehead, eyes", p: "9 500" },
  { uk: "Підборіддя, щоки", ru: "Подбородок, щёки", en: "Chin, cheeks", p: "9 500" },
  { uk: "Підборіддя, очі", ru: "Подбородок, глаза", en: "Chin, eyes", p: "9 500" },
  { uk: "Чоло", ru: "Лоб", en: "Forehead", p: "5 000" },
  { uk: "Щоки", ru: "Щёки", en: "Cheeks", p: "5 000" },
  { uk: "Очі", ru: "Глаза", en: "Eyes", p: "5 000" },
  { uk: "Підборіддя", ru: "Подбородок", en: "Chin", p: "5 000" },
];
const ACUPULSE: P[] = [
  { uk: "Обличчя, шия, декольте (фракційне)", ru: "Лицо, шея, декольте (фракционное)", en: "Face, neck, décolleté (fractional)", p: "14 000" },
  { uk: "Обличчя комбіноване шліфування", ru: "Лицо комбинированная шлифовка", en: "Face combined resurfacing", p: "9 500" },
  { uk: "Інтимне омолодження", ru: "Интимное омоложение", en: "Intimate rejuvenation", p: "8 000" },
  { uk: "Обличчя фракційне шліфування", ru: "Лицо фракционная шлифовка", en: "Face fractional resurfacing", p: "7 500" },
  { uk: "Щоки комбіноване шліфування", ru: "Щёки комбинированная шлифовка", en: "Cheeks combined resurfacing", p: "6 500" },
  { uk: "Щоки фракційне шліфування", ru: "Щёки фракционная шлифовка", en: "Cheeks fractional resurfacing", p: "4 500" },
  { uk: "Шия фракційне шліфування", ru: "Шея фракционная шлифовка", en: "Neck fractional resurfacing", p: "4 500" },
  { uk: "Декольте фракційне шліфування", ru: "Декольте фракционная шлифовка", en: "Décolleté fractional resurfacing", p: "4 500" },
  { uk: "Прицільне шліфування рубця", ru: "Прицельная шлифовка рубца", en: "Targeted scar resurfacing", p: "1 500" },
];
// VOLNEWMER — full per-zone list, confirmed against the client price file (2026-07).
const VOLNEWMER: P[] = [
  { uk: "Full face (щоки, очі, лоб)", ru: "Full face (щёки, глаза, лоб)", en: "Full face (cheeks, eyes, forehead)", p: "75 000" },
  { uk: "Щоки", ru: "Щёки", en: "Cheeks", p: "45 000" },
  { uk: "Шия", ru: "Шея", en: "Neck", p: "22 000" },
  { uk: "Декольте", ru: "Декольте", en: "Décolleté", p: "20 000" },
  { uk: "Очі", ru: "Глаза", en: "Eyes", p: "14 000" },
  { uk: "Коліна", ru: "Колени", en: "Knees", p: "14 000" },
  { uk: "Лоб", ru: "Лоб", en: "Forehead", p: "10 000" },
  { uk: "Маляри", ru: "Скулы", en: "Cheekbones", p: "10 000" },
  { uk: "Підборідна область", ru: "Подбородочная область", en: "Chin area", p: "10 000" },
  { uk: "Брови", ru: "Брови", en: "Brows", p: "9 500" },
  { uk: "Руки", ru: "Руки", en: "Arms", p: "40 000" },
  { uk: "Живіт", ru: "Живот", en: "Abdomen", p: "60 000" },
  { uk: "Коліни + передня поверхня стегна", ru: "Колени + передняя поверхность бедра", en: "Knees + front of thigh", p: "75 000" },
  { uk: "Сідниці", ru: "Ягодицы", en: "Buttocks", p: "75 000" },
];
// Hub pages (face / skin) — consultation + a range row, no single device table.
const HUB_ROWS = (rangeUk: string, rangeRu: string, rangeEn: string) => [
  { label: S(CONSULT.uk, CONSULT.ru, CONSULT.en), price: price(CONSULT.p) },
  {
    label: S("Апаратні процедури", "Аппаратные процедуры", "Device procedures"),
    price: S(rangeUk, rangeRu, rangeEn),
  },
];

function rowsWithConsult(list: P[]) {
  return rows([...list, CONSULT]);
}

const PRICE_SECTIONS: Record<string, Record<string, unknown>> = {
  "ultraformer-mpt": { heading: HEAD("Ultraformer MPT"), rows: rowsWithConsult(ULTRAFORMER) },
  "hydrafacial": { heading: HEAD("HydraFacial"), rows: rowsWithConsult(HYDRAFACIAL) },
  "emface": { heading: HEAD("EMFACE"), rows: rowsWithConsult(EMFACE) },
  "acupulse-co2": { heading: HEAD("лазерного шліфування AcuPulse CO₂"), rows: rowsWithConsult(ACUPULSE) },
  "volnewmer": { heading: HEAD("VOLNEWMER"), rows: rowsWithConsult(VOLNEWMER) },
  "face": { heading: S("Вартість апаратних процедур для обличчя", "Стоимость аппаратных процедур для лица", "Facial device procedure pricing"), rows: HUB_ROWS("від 5 000 до 45 000 грн залежно від зони", "от 5 000 до 45 000 грн в зависимости от зоны", "from 5,000 to 45,000 UAH by area") },
  "skin": { heading: S("Вартість апаратної корекції шкіри", "Стоимость аппаратной коррекции кожи", "Device skin-correction pricing"), rows: HUB_ROWS("від 1 500 грн", "от 1 500 грн", "from 1,500 UAH") },
};

async function main() {
  await sql`
    DELETE FROM content_sections WHERE owner_type='service' AND (
      (jsonb_typeof(data)='object' AND data->>'_seed'=${SEED}) OR
      (jsonb_typeof(data)='string' AND (data #>> '{}')::jsonb->>'_seed'=${SEED})
    )`;

  for (const [slug, secData] of Object.entries(PRICE_SECTIONS)) {
    const svc = await sql`SELECT id, block_order FROM services WHERE slug=${slug}`;
    if (!svc.length) { console.warn(`✗ no service ${slug}`); continue; }
    const ownerId = svc[0].id as string;
    const data = { _seed: SEED, note: NOTE, ...secData };
    const ins = await sql`
      INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
      VALUES ('service', ${ownerId}, 20, 'priceTable'::section_type, ${sql.json(data)})
      RETURNING id`;
    const key = `section:${ins[0].id}`;

    // Splice the price block right before the first fixed block in block_order.
    const order: string[] = (svc[0].block_order as string[] | null) || [];
    if (order.length) {
      const filtered = order.filter((k) => k !== key);
      const idx = filtered.findIndex((k) => FIXED.has(k));
      const at = idx === -1 ? filtered.length : idx;
      filtered.splice(at, 0, key);
      await sql`UPDATE services SET block_order=${filtered} WHERE id=${ownerId}`;
    }
    console.log(`✓ ${slug}: price section added`);
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
