/**
 * Patches already-seeded services to append callout + imageGallery + cta sections
 * and updates block_order accordingly.
 * Run after seed-tz-v1-injectable-a.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

type L = { uk: string; ru: string; en: string };

interface PatchEntry {
  slug: string;
  callout: { tone: "info" | "warning" | "success"; body: L };
  gallery: { heading: L; images: { url: string; alt: string }[] };
  cta: { heading: L; body: L; ctaLabel: L };
}

// Clinic interior images shared across injectable services
const interiorImages = [
  { url: "/images/interior/SEMI1276-HDR.webp", alt: "Кабінет косметолога GENEVITY" },
  { url: "/images/interior/SEMI1662-HDR.webp", alt: "Клініка GENEVITY — інтер'єр" },
  { url: "/images/interior/SEMI7509.webp", alt: "Процедурний кабінет GENEVITY" },
];

const patches: PatchEntry[] = [
  {
    slug: "botulinum-therapy",
    callout: {
      tone: "success",
      body: {
        uk: "Ефект помітний вже через 3–5 днів. Повний результат — на 14-й день. Реабілітація — нульова: повертайтеся до звичного ритму одразу після процедури.",
        ru: "Эффект заметен уже через 3–5 дней. Полный результат — на 14-й день. Реабилитация — нулевая: возвращайтесь к привычному ритму сразу после процедуры.",
        en: "Results are visible within 3–5 days. Full effect by day 14. Zero downtime — return to your normal routine immediately after the procedure.",
      },
    },
    gallery: {
      heading: { uk: "Наша клініка та процедурні кабінети", ru: "Наша клиника и процедурные кабинеты", en: "Our Clinic and Treatment Rooms" },
      images: interiorImages,
    },
    cta: {
      heading: { uk: "Запишіться на ботулінотерапію в GENEVITY", ru: "Запишитесь на ботулинотерапию в GENEVITY", en: "Book Botulinum Therapy at GENEVITY" },
      body: { uk: "Перша консультація з лікарем-косметологом — безкоштовно. Підберемо оптимальні зони введення та дозування під ваші цілі.", ru: "Первая консультация с врачом-косметологом — бесплатно. Подберём оптимальные зоны введения и дозировку под ваши цели.", en: "First consultation with our aesthetic doctor is free. We will select the optimal injection zones and dosing for your goals." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
    },
  },
  {
    slug: "contour-plasty",
    callout: {
      tone: "info",
      body: {
        uk: "Контурна пластика — повністю оборотна процедура. Якщо результат з будь-якої причини не влаштує, гіалуронідаза розчиняє філер протягом 15–20 хвилин.",
        ru: "Контурная пластика — полностью обратимая процедура. Если результат по любой причине не устроит, гиалуронидаза растворяет филлер в течение 15–20 минут.",
        en: "Contour correction is a fully reversible procedure. If the result is unsatisfactory for any reason, hyaluronidase dissolves the filler within 15–20 minutes.",
      },
    },
    gallery: {
      heading: { uk: "Кабінети та умови проведення процедури", ru: "Кабинеты и условия проведения процедуры", en: "Treatment Rooms and Conditions" },
      images: interiorImages,
    },
    cta: {
      heading: { uk: "Запишіться на контурну пластику в GENEVITY", ru: "Запишитесь на контурную пластику в GENEVITY", en: "Book Contour Correction at GENEVITY" },
      body: { uk: "На консультації лікар оцінить пропорції вашого обличчя, запропонує план корекції та розраховує вартість. Консультація — безкоштовно.", ru: "На консультации врач оценит пропорции вашего лица, предложит план коррекции и рассчитает стоимость. Консультация — бесплатно.", en: "At consultation the doctor assesses your facial proportions, proposes a correction plan, and calculates the cost. Consultation is free." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
    },
  },
  {
    slug: "biorevitalisation",
    callout: {
      tone: "success",
      body: {
        uk: "Перше зволоження помітне одразу після процедури. Повний курс із 3–4 сеансів — стійкий результат на 6–9 місяців.",
        ru: "Первое увлажнение заметно сразу после процедуры. Полный курс из 3–4 сеансов — стойкий результат на 6–9 месяцев.",
        en: "Initial hydration is visible immediately after the procedure. A full course of 3–4 sessions delivers lasting results for 6–9 months.",
      },
    },
    gallery: {
      heading: { uk: "Клініка GENEVITY — простір для вашого догляду", ru: "Клиника GENEVITY — пространство для вашего ухода", en: "GENEVITY Clinic — Your Care Space" },
      images: interiorImages,
    },
    cta: {
      heading: { uk: "Запишіться на біоревіталізацію в Дніпрі", ru: "Запишитесь на биоревитализацию в Днепре", en: "Book Biorevitalisation in Dnipro" },
      body: { uk: "Дізнайтеся ціну біоревіталізації та підберіть оптимальний препарат на безкоштовній консультації лікаря.", ru: "Узнайте цену биоревитализации и подберите оптимальный препарат на бесплатной консультации врача.", en: "Find out the biorevitalisation price and select the optimal product at a free doctor consultation." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
    },
  },
  {
    slug: "mesotherapy",
    callout: {
      tone: "info",
      body: {
        uk: "Склад мезококтейлю підбирається індивідуально кожному пацієнту — один і той самий препарат не використовується для всіх. Це основна відмінність від масових салонних процедур.",
        ru: "Состав мезококтейля подбирается индивидуально каждому пациенту — один и тот же препарат не используется для всех. Это главное отличие от массовых салонных процедур.",
        en: "The meso-cocktail composition is selected individually for each patient — the same product is not used for everyone. This is the key difference from mass-market salon treatments.",
      },
    },
    gallery: {
      heading: { uk: "Процедурні кабінети GENEVITY", ru: "Процедурные кабинеты GENEVITY", en: "GENEVITY Treatment Rooms" },
      images: interiorImages,
    },
    cta: {
      heading: { uk: "Запишіться на мезотерапію обличчя в Дніпрі", ru: "Запишитесь на мезотерапию лица в Днепре", en: "Book Facial Mesotherapy in Dnipro" },
      body: { uk: "На консультації лікар визначить проблемні зони та підбере індивідуальний склад коктейлю. Ціна на мезотерапію обличчя — на консультації.", ru: "На консультации врач определит проблемные зоны и подберёт индивидуальный состав коктейля. Цена на мезотерапию лица — на консультации.", en: "At consultation the doctor identifies problem zones and selects a personalised cocktail formula. Facial mesotherapy price at consultation." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
    },
  },
  {
    slug: "prp-therapy",
    callout: {
      tone: "success",
      body: {
        uk: "PRP-терапія — єдина ін'єкційна процедура з нульовим ризиком алергічної реакції: використовується тільки власна плазма пацієнта.",
        ru: "PRP-терапия — единственная инъекционная процедура с нулевым риском аллергической реакции: используется только собственная плазма пациента.",
        en: "PRP therapy is the only injectable procedure with zero risk of allergic reaction: only the patient's own plasma is used.",
      },
    },
    gallery: {
      heading: { uk: "Клініка та обладнання", ru: "Клиника и оборудование", en: "Clinic and Equipment" },
      images: [
        { url: "/images/interior/SEMI1276-HDR.webp", alt: "Кабінет косметолога GENEVITY" },
        { url: "/images/interior/SEMI1737-HDR.webp", alt: "Процедурний кабінет" },
        { url: "/images/interior/SEMI7509.webp", alt: "GENEVITY — інтер'єр клініки" },
      ],
    },
    cta: {
      heading: { uk: "Запишіться на PRP-терапію в GENEVITY", ru: "Запишитесь на PRP-терапию в GENEVITY", en: "Book PRP Therapy at GENEVITY" },
      body: { uk: "PRP підходить для відновлення шкіри та лікування випадіння волосся. Дізнайтеся ціну плазмотерапії на безкоштовній консультації.", ru: "PRP подходит для восстановления кожи и лечения выпадения волос. Узнайте цену плазмотерапии на бесплатной консультации.", en: "PRP is suitable for skin restoration and hair loss treatment. Find out the plasmotherapy price at a free consultation." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
    },
  },
];

async function patchService(patch: PatchEntry) {
  const [row] = await sql`SELECT id, block_order FROM services WHERE slug = ${patch.slug}`;
  if (!row) { console.log(`⚠ NOT FOUND: ${patch.slug}`); return; }
  const serviceId: string = row.id;
  const blockOrder: string[] = row.block_order || [];

  // Find where "faq" starts to inject before it
  const faqIndex = blockOrder.indexOf("faq");
  const existingSectionIds = faqIndex >= 0 ? blockOrder.slice(0, faqIndex) : blockOrder.filter(id =>
    !["faq","doctors","equipment","relatedServices","finalCTA"].includes(id)
  );
  const existingSortMax = existingSectionIds.length;

  // callout section
  const calloutId = randomUUID();
  await sql`INSERT INTO content_sections(id,owner_type,owner_id,sort_order,section_type,data)
    VALUES(${calloutId},'service',${serviceId},${existingSortMax},
    'callout'::section_type,
    ${JSON.stringify({ tone: patch.callout.tone, body: patch.callout.body })}::jsonb)`;

  // imageGallery section
  const galleryId = randomUUID();
  await sql`INSERT INTO content_sections(id,owner_type,owner_id,sort_order,section_type,data)
    VALUES(${galleryId},'service',${serviceId},${existingSortMax + 1},
    'imageGallery'::section_type,
    ${JSON.stringify({ heading: patch.gallery.heading, images: patch.gallery.images })}::jsonb)`;

  // cta section
  const ctaId = randomUUID();
  await sql`INSERT INTO content_sections(id,owner_type,owner_id,sort_order,section_type,data)
    VALUES(${ctaId},'service',${serviceId},${existingSortMax + 2},
    'cta'::section_type,
    ${JSON.stringify({ heading: patch.cta.heading, body: patch.cta.body, ctaLabel: patch.cta.ctaLabel, ctaHref: "/kontakty" })}::jsonb)`;

  // Update block_order: insert new IDs before "faq"
  const tail = faqIndex >= 0 ? blockOrder.slice(faqIndex) : ["faq","doctors","equipment","relatedServices","finalCTA"];
  const newBlockOrder = [...existingSectionIds, calloutId, galleryId, ctaId, ...tail];
  await sql`UPDATE services SET block_order = ${newBlockOrder} WHERE id = ${serviceId}`;

  console.log(`✓ patched ${patch.slug} — added callout + imageGallery + cta`);
}

async function main() {
  for (const p of patches) await patchService(p);
  await sql.end();
  console.log("\nPatch DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
