/**
 * "Дооптимізація послуг / Червень" — add the draftable content sections to the
 * selected apparatus-cosmetology service pages (real before/after photos +
 * prices remain the clinic's to add via CMS). Content is brand-voiced draft for
 * clinic review; keywords woven per the brief. Appended after existing sections
 * (sort_order 10+); clinic can reorder in the admin section builder.
 *
 * Idempotent: rows carry data->>'_seed'='dooptim-jun'; re-running clears + reinserts.
 * Run: npx tsx scripts/seed-service-sections-dooptim.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const SEED = "dooptim-jun";

const S = (uk: string, ru: string, en: string) => ({ _type: "localeString", uk, ru, en });
const T = (uk: string, ru: string, en: string) => ({ _type: "localeText", uk, ru, en });
const A = (uk: string[], ru: string[], en: string[]) => ({ _type: "localeStringArray", uk, ru, en });

type Sec = { slug: string; type: "bullets" | "richText"; sort: number; data: Record<string, unknown> };

const SECTIONS: Sec[] = [
  // ── Ultraformer MPT ──────────────────────────────────────────────────
  {
    slug: "ultraformer-mpt", type: "bullets", sort: 10,
    data: {
      heading: S("Підготовка до процедури Ultraformer MPT", "Подготовка к процедуре Ultraformer MPT", "Preparing for the Ultraformer MPT procedure"),
      items: A(
        [
          "За 1–2 тижні до сеансу уникайте засмаги та відвідування солярію.",
          "Повідомте лікаря про хронічні захворювання, вагітність, наявність імплантів чи кардіостимулятора.",
          "За кілька днів припиніть застосування агресивних пілінгів і ретиноїдів.",
          "У день процедури прийдіть без макіяжу або очистіть шкіру на місці.",
          "Дотримуйтесь питного режиму — зволожена шкіра краще реагує на SMAS-ліфтинг ультраформер.",
        ],
        [
          "За 1–2 недели до сеанса избегайте загара и посещения солярия.",
          "Сообщите врачу о хронических заболеваниях, беременности, наличии имплантов или кардиостимулятора.",
          "За несколько дней прекратите агрессивные пилинги и ретиноиды.",
          "В день процедуры приходите без макияжа или очистите кожу на месте.",
          "Соблюдайте питьевой режим — увлажнённая кожа лучше реагирует на SMAS-лифтинг ультраформер.",
        ],
        [
          "Avoid tanning and solariums for 1–2 weeks before the session.",
          "Tell your physician about chronic conditions, pregnancy, implants or a pacemaker.",
          "Stop aggressive peels and retinoids a few days beforehand.",
          "Arrive without make-up on the day, or cleanse your skin on-site.",
          "Stay well hydrated — well-moisturised skin responds better to Ultraformer SMAS lifting.",
        ],
      ),
    },
  },
  {
    slug: "ultraformer-mpt", type: "richText", sort: 11,
    data: {
      heading: S("Ultraformer MPT чи інші методи ліфтингу обличчя", "Ultraformer MPT или другие методы лифтинга лица", "Ultraformer MPT vs other facial lifting methods"),
      body: T(
        "SMAS-ліфтинг ультраформер діє на той самий глибокий м'язово-апоневротичний шар, що й хірургічна підтяжка, але без розрізів і періоду відновлення. На відміну від філерів, які заповнюють об'єм, ультраформер підтягує тканини за рахунок стимуляції власного колагену. Порівняно з нитковим ліфтингом ефект розвивається поступово — протягом 2–3 місяців — і виглядає природно, а результат зберігається 12–18 місяців.\n\nЯкий метод підходить саме вам, лікар визначає на консультації, орієнтуючись на стан шкіри та ваші очікування.",
        "SMAS-лифтинг ультраформер воздействует на тот же глубокий мышечно-апоневротический слой, что и хирургическая подтяжка, но без разрезов и периода восстановления. В отличие от филлеров, которые заполняют объём, ультраформер подтягивает ткани за счёт стимуляции собственного коллагена. По сравнению с нитевым лифтингом эффект развивается постепенно — в течение 2–3 месяцев — и выглядит естественно, а результат сохраняется 12–18 месяцев.\n\nКакой метод подходит именно вам, врач определяет на консультации, ориентируясь на состояние кожи и ваши ожидания.",
        "Ultraformer SMAS lifting works on the same deep musculo-aponeurotic layer as a surgical lift, but without incisions or recovery time. Unlike fillers, which add volume, Ultraformer tightens tissue by stimulating your own collagen. Compared with thread lifting, the effect develops gradually over 2–3 months and looks natural, with results lasting 12–18 months.\n\nWhich method suits you best is something your physician determines at a consultation, based on your skin and your goals.",
      ),
    },
  },
  // ── HydraFacial ──────────────────────────────────────────────────────
  {
    slug: "hydrafacial", type: "bullets", sort: 10,
    data: {
      heading: S("Догляд після процедури HydraFacial", "Уход после процедуры HydraFacial", "Aftercare following HydraFacial"),
      items: A(
        [
          "Шкіра готова до макіяжу вже за кілька годин — реабілітація після чистки HydraFacial не потрібна.",
          "Першу добу уникайте сауни, басейну та інтенсивних тренувань.",
          "Протягом 1–2 днів не застосовуйте скрабів, кислот і ретиноїдів.",
          "Використовуйте сонцезахист SPF 30+ у перші дні після апаратної чистки обличчя.",
          "Для стійкого результату лікар порадить оптимальний інтервал між сеансами.",
        ],
        [
          "Кожа готова к макияжу уже через несколько часов — реабилитация после чистки HydraFacial не нужна.",
          "В первые сутки избегайте сауны, бассейна и интенсивных тренировок.",
          "В течение 1–2 дней не применяйте скрабы, кислоты и ретиноиды.",
          "Используйте солнцезащиту SPF 30+ в первые дни после аппаратной чистки лица.",
          "Для стойкого результата врач подскажет оптимальный интервал между сеансами.",
        ],
        [
          "Your skin is ready for make-up within a few hours — HydraFacial needs no recovery.",
          "Avoid saunas, pools and intense workouts for the first 24 hours.",
          "Skip scrubs, acids and retinoids for 1–2 days.",
          "Use SPF 30+ sun protection in the first days after the cleanse.",
          "For lasting results your physician will advise the ideal interval between sessions.",
        ],
      ),
    },
  },
  // ── AcuPulse CO₂ ─────────────────────────────────────────────────────
  {
    slug: "acupulse-co2", type: "bullets", sort: 10,
    data: {
      heading: S("Догляд за шкірою після лазерного шліфування CO₂", "Уход за кожей после лазерной шлифовки CO₂", "Skin care after CO₂ laser resurfacing"),
      items: A(
        [
          "Перші 5–10 днів шкіра відновлюється — можливі почервоніння, лущення та відчуття стягнутості.",
          "Регулярно наносьте засоби, які рекомендував лікар, і не знімайте кірочки самостійно.",
          "Уникайте сонця та обов'язково використовуйте SPF 50 протягом кількох тижнів.",
          "Тимчасово відмовтеся від сауни, басейну, декоративної косметики та активних доглядових засобів.",
          "Дотримуйтесь рекомендацій лікаря — від цього залежить якість результату лазерного шліфування.",
        ],
        [
          "Первые 5–10 дней кожа восстанавливается — возможны покраснение, шелушение и чувство стянутости.",
          "Регулярно наносите средства, рекомендованные врачом, и не снимайте корочки самостоятельно.",
          "Избегайте солнца и обязательно используйте SPF 50 в течение нескольких недель.",
          "Временно откажитесь от сауны, бассейна, декоративной косметики и активных уходовых средств.",
          "Соблюдайте рекомендации врача — от этого зависит качество результата лазерной шлифовки.",
        ],
        [
          "Skin recovers over the first 5–10 days — redness, flaking and a feeling of tightness are normal.",
          "Apply the products your physician recommends and don't pick at any crusting.",
          "Avoid the sun and always use SPF 50 for several weeks.",
          "Temporarily skip saunas, pools, make-up and active skincare.",
          "Follow your physician's advice — it directly affects the quality of the resurfacing result.",
        ],
      ),
    },
  },
  {
    slug: "acupulse-co2", type: "bullets", sort: 11,
    data: {
      heading: S("Які проблеми вирішує лазерне шліфування CO₂", "Какие проблемы решает лазерная шлифовка CO₂", "What CO₂ laser resurfacing addresses"),
      items: A(
        [
          "Постакне, рубці та нерівний рельєф шкіри.",
          "Дрібні та середні зморшки, зокрема навколо очей і губ.",
          "Розширені пори та сліди від висипань.",
          "Пігментні плями й нерівний тон обличчя.",
          "Втрата пружності та ознаки фотостаріння шкіри.",
        ],
        [
          "Постакне, рубцы и неровный рельеф кожи.",
          "Мелкие и средние морщины, в том числе вокруг глаз и губ.",
          "Расширенные поры и следы от высыпаний.",
          "Пигментные пятна и неровный тон лица.",
          "Потеря упругости и признаки фотостарения кожи.",
        ],
        [
          "Post-acne, scars and uneven skin texture.",
          "Fine to moderate wrinkles, including around the eyes and lips.",
          "Enlarged pores and marks left by breakouts.",
          "Pigmentation and uneven facial tone.",
          "Loss of firmness and signs of photo-ageing.",
        ],
      ),
    },
  },
];

async function main() {
  const svc = await sql`SELECT id, slug FROM services WHERE slug IN ('ultraformer-mpt','hydrafacial','acupulse-co2')`;
  const idBySlug = new Map(svc.map((r) => [r.slug, r.id]));

  // Clear prior seed rows. Handle BOTH encodings: a real jsonb object
  // (data->>'_seed') and a double-encoded jsonb string scalar (older insert or
  // admin-saved rows), where the object is nested one JSON level down.
  await sql`
    DELETE FROM content_sections
    WHERE owner_type = 'service' AND (
      (jsonb_typeof(data) = 'object' AND data->>'_seed' = ${SEED}) OR
      (jsonb_typeof(data) = 'string' AND (data #>> '{}')::jsonb->>'_seed' = ${SEED})
    )
  `;

  let n = 0;
  for (const s of SECTIONS) {
    const ownerId = idBySlug.get(s.slug);
    if (!ownerId) { console.warn(`✗ service not found: ${s.slug}`); continue; }
    const data = { _seed: SEED, ...s.data };
    // sql.json() stores a real jsonb OBJECT (jsonb_typeof=object) — getSections
    // reads it directly; interpolating JSON.stringify(...) instead double-encodes.
    await sql`
      INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
      VALUES ('service', ${ownerId}, ${s.sort}, ${s.type}::section_type, ${sql.json(data)})
    `;
    n++;
    console.log(`✓ ${s.slug} · ${s.type} · sort ${s.sort}`);
  }
  console.log(`\nInserted ${n} sections.`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
