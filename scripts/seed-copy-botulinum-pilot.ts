/**
 * PILOT — luxury, semantic-aligned copy for the Botulinum Therapy service.
 *
 * Replaces the existing content_sections + faq_items rows for this one
 * service and rebuilds block_order so the new sections appear first in
 * the admin's Layout tab. The next pass (other services) will follow
 * this structure.
 *
 * Voice: restrained, trust-via-specificity, no superlatives. Hits the
 * semantic cluster naturally:
 *   ботулінотерапія (1900), ботокс для обличчя (390), ботокс для
 *   обличчя ціна (140), уколи ботоксу (90), уколи ботоксу ціна (70),
 *   протипоказання до ботулінотерапії (30)
 *
 * Safe to re-run. Existing block_order is preserved for fixed blocks
 * (faq, doctors, equipment, relatedServices, finalCTA) while content
 * section UUIDs are replaced.
 *
 * Run: npx tsx scripts/seed-copy-botulinum-pilot.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});
const sql = postgres(env.DATABASE_URL!);

const SERVICE_SLUG = "botulinum-therapy";

const SUMMARY = {
  uk: "Ботулінотерапія у GENEVITY — точкові ін'єкції для корекції мімічних зморшок із передбачуваним результатом. Працюємо тільки з оригінальними препаратами, лікарі-дерматологи розраховують кількість одиниць під ваше обличчя, а не за прайсом.",
  ru: "Ботулинотерапия в GENEVITY — точечные инъекции для коррекции мимических морщин с предсказуемым результатом. Работаем только с оригинальными препаратами, врачи-дерматологи рассчитывают количество единиц под ваше лицо, а не по прайсу.",
  en: "Botulinum toxin therapy at GENEVITY — precise injections that soften expression lines with a predictable result. Only original preparations, and dermatologists who dose for your face rather than a price list.",
};

// Three rich-text sections. First one carries the hero image — picks up
// the side-by-side layout on /services/…/botulinum-therapy. Remaining
// sections render in standard blocks below.
const SECTIONS = [
  {
    heading: {
      uk: "Точність, що повертає свіжість",
      ru: "Точность, возвращающая свежесть",
      en: "The precision that returns freshness",
    },
    body: {
      uk: "Ботулінотерапія розслаблює мімічні м'язи — ті, що з роками залишають на обличчі зморшки в найбільш активних зонах: чоло, між брів, зовнішні кути очей. У центрі довголіття та естетичної медицини GENEVITY ми працюємо виключно з сертифікованими препаратами ботулотоксину і розраховуємо дозу індивідуально, орієнтуючись на анатомію вашого обличчя і силу мімічних м'язів. Процедура триває 20-30 хвилин, ефект настає через 3-7 днів і тримається 4-6 місяців.",
      ru: "Ботулинотерапия расслабляет мимические мышцы — те, что с годами оставляют на лице морщины в наиболее активных зонах: лоб, межбровье, внешние уголки глаз. В центре долголетия и эстетической медицины GENEVITY мы работаем исключительно с сертифицированными препаратами ботулотоксина и рассчитываем дозу индивидуально, ориентируясь на анатомию вашего лица и силу мимических мышц. Процедура занимает 20-30 минут, эффект наступает через 3-7 дней и держится 4-6 месяцев.",
      en: "Botulinum therapy relaxes the expression muscles that, over the years, leave lines in the most active zones: forehead, glabella, outer corners of the eyes. At the GENEVITY longevity and aesthetic medicine centre we use only certified botulinum toxin preparations, and the dose is calculated individually for your facial anatomy and muscle strength. The procedure takes 20-30 minutes; the effect sets in within 3-7 days and lasts 4-6 months.",
    },
    calloutBody: {
      uk: "Ми не продаємо «одиниці за тариф». Ми вираховуємо рівно стільки, скільки потрібно вашому обличчю — часто це менше, ніж пропонують клініки, що поспішають.",
      ru: "Мы не продаём «единицы по тарифу». Мы рассчитываем ровно столько, сколько нужно вашему лицу — часто это меньше, чем предлагают клиники, которые спешат.",
      en: "We don't sell 'units by the menu'. We calculate exactly what your face needs — often considerably less than clinics in a hurry suggest.",
    },
    heroImage: null as string | null,
  },
  {
    heading: {
      uk: "Зморшки, з якими працюємо",
      ru: "Морщины, с которыми работаем",
      en: "The lines we work with",
    },
    body: {
      uk: "Горизонтальні зморшки на чолі. Міжбрівні — вертикальні «гнівні» складки, що видають втому, якої немає. Гусячі лапки навколо очей. Верхні носогубні лінії, що з'являються від посмішки. Зморшки на підборідді — ефект «галькової поверхні». Окрім мімічних ліній, ботулотоксин допомагає при бруксизмі (скрегіт зубами вночі), гіпергідрозі долонь і пахв, асиметрії брів. Кожен випадок починається з діагностики: лікар дивиться не на зморшку, а на м'яз, що її створює.",
      ru: "Горизонтальные морщины на лбу. Межбровные — вертикальные «гневные» складки, выдающие усталость, которой нет. Гусиные лапки вокруг глаз. Верхние носогубные линии от улыбки. Морщины на подбородке — эффект «галечной поверхности». Помимо мимических линий, ботулотоксин помогает при бруксизме (скрежет зубами ночью), гипергидрозе ладоней и подмышек, асимметрии бровей. Каждый случай начинается с диагностики: врач смотрит не на морщину, а на мышцу, которая её создаёт.",
      en: "Horizontal forehead lines. Glabellar 'angry' folds that read as fatigue you don't feel. Crow's feet around the eyes. The upper nasolabial lines that emerge from a smile. The cobblestone texture on the chin. Beyond expression lines, botulinum toxin also treats bruxism (nighttime teeth grinding), palmar and axillary hyperhidrosis, and eyebrow asymmetry. Each case starts with diagnosis: the doctor reads the muscle, not the line.",
    },
    calloutBody: {
      uk: "Ботулінотерапія — не про «натягнути обличчя». Це про вимкнути м'яз, який надмірно скорочується і поступово залишає слід на шкірі. Тому показання — завжди м'яз, а не сама зморшка.",
      ru: "Ботулинотерапия — не про «натянуть лицо». Это про отключить мышцу, которая чрезмерно сокращается и постепенно оставляет след на коже. Поэтому показание — всегда мышца, а не сама морщина.",
      en: "Botulinum therapy is never about 'tightening' the face. It's about switching off a muscle that over-contracts and gradually leaves a mark on the skin. The indication is always the muscle, never the line itself.",
    },
    heroImage: null,
  },
  {
    heading: {
      uk: "Як проходить процедура",
      ru: "Как проходит процедура",
      en: "How the session runs",
    },
    body: {
      uk: "Спочатку консультація: лікар оцінює стан шкіри, тонус мімічних м'язів, ваші побажання. Разом визначаємо зони роботи та кількість одиниць — пишемо це в карту, щоб наступна процедура відштовхувалась від ваших минулих даних, а не від прайсу. Далі — розмітка точок, антисептика і самі уколи тонкою інсуліновою голкою. Дискомфортно, але не болісно; більшість клієнтів відмовляється від анестезії. Одразу після — лёгка мімічна гімнастика, щоб препарат розподілився рівномірно. Через 14 днів призначаємо контрольний огляд: якщо десь залишилась активна зона, додаємо одиниці без доплати.",
      ru: "Сначала консультация: врач оценивает состояние кожи, тонус мимических мышц, ваши пожелания. Вместе определяем зоны работы и количество единиц — записываем это в карту, чтобы следующая процедура опиралась на ваши прошлые данные, а не на прайс. Далее — разметка точек, антисептика и сами уколы тонкой инсулиновой иглой. Дискомфортно, но не болезненно; большинство клиентов отказывается от анестезии. Сразу после — лёгкая мимическая гимнастика, чтобы препарат распределился равномерно. Через 14 дней назначаем контрольный осмотр: если где-то осталась активная зона, добавляем единицы без доплаты.",
      en: "We start with a consultation: the doctor evaluates the skin, the tone of the expression muscles, and the result you want. Together we define the zones and the number of units, and record them in your chart so your next session starts from your own data rather than a menu. Then: marking the points, antiseptic prep, and the injections themselves with a fine insulin needle. Uncomfortable but not painful — most clients skip the anaesthesia. A short muscle warm-up directly after helps the product spread evenly. Fourteen days later we book a follow-up: if any zone still feels active, we top up — no extra charge.",
    },
    calloutBody: {
      uk: "Перші 24 години: без фізичних навантажень, сауни, басейну та солярію. Уникайте нахилів і сильного тиску на оброблені зони. Обличчям — прямо і спокійно.",
      ru: "Первые 24 часа: без физических нагрузок, сауны, бассейна и солярия. Избегайте наклонов и сильного давления на обработанные зоны. Лицом — прямо и спокойно.",
      en: "The first 24 hours: no strenuous exercise, sauna, pool or tanning bed. Avoid bending over and direct pressure on the treated zones. Keep your face upright and relaxed.",
    },
    heroImage: null,
  },
];

// Long-tail questions from the semantic cluster, turned into FAQ items.
// "Скільки коштують уколи ботоксу" / "Протипоказання до ботулінотерапії" /
// "Через скільки видно результат" — all high-intent phrases that drive
// rich-result eligibility via the FaqSchema already wired on the page.
const FAQ = [
  {
    question: {
      uk: "Скільки коштують уколи ботоксу?",
      ru: "Сколько стоят уколы ботокса?",
      en: "How much do botox injections cost?",
    },
    answer: {
      uk: "Вартість залежить від кількості одиниць, необхідних для вашого обличчя — на консультації лікар розрахує індивідуальний план. Ціни на ботулінотерапію у GENEVITY, Дніпро, вказані у прайсі на цій сторінці як базові за одну зону.",
      ru: "Стоимость зависит от количества единиц, необходимых для вашего лица — на консультации врач рассчитает индивидуальный план. Цены на ботулинотерапию в GENEVITY, Днепр, указаны в прайсе на этой странице как базовые за одну зону.",
      en: "The price depends on how many units your face needs — the doctor builds an individual plan at the consultation. The price list on this page shows the base cost per zone for botulinum therapy at GENEVITY, Dnipro.",
    },
  },
  {
    question: {
      uk: "Як довго тримається ефект?",
      ru: "Как долго держится эффект?",
      en: "How long does the effect last?",
    },
    answer: {
      uk: "Від 4 до 6 місяців — залежно від активності мімічних м'язів, метаболізму та способу життя (спорт, сауна, сонце). Регулярні процедури кожні 5-6 місяців зменшують виразність зморшок з кожним циклом.",
      ru: "От 4 до 6 месяцев — в зависимости от активности мимических мышц, метаболизма и образа жизни (спорт, сауна, солнце). Регулярные процедуры каждые 5-6 месяцев уменьшают выраженность морщин с каждым циклом.",
      en: "Four to six months — depending on muscle activity, metabolism and lifestyle (sports, sauna, sun exposure). Maintenance every 5-6 months softens the lines further with each cycle.",
    },
  },
  {
    question: {
      uk: "Які протипоказання до ботулінотерапії?",
      ru: "Какие противопоказания к ботулинотерапии?",
      en: "What are the contraindications?",
    },
    answer: {
      uk: "Вагітність і період грудного вигодовування, міастенія та інші нервово-м'язові захворювання, період загострення хронічних інфекцій, підвищена чутливість до компонентів препарату, запальні процеси у зоні ін'єкції, прийом деяких антибіотиків групи аміноглікозидів. Повний перелік обов'язково звіряємо на консультації.",
      ru: "Беременность и период грудного вскармливания, миастения и другие нервно-мышечные заболевания, период обострения хронических инфекций, повышенная чувствительность к компонентам препарата, воспалительные процессы в зоне инъекции, приём некоторых антибиотиков группы аминогликозидов. Полный перечень обязательно сверяем на консультации.",
      en: "Pregnancy and breastfeeding, myasthenia gravis and other neuromuscular disorders, active chronic infections, hypersensitivity to the preparation, inflammation in the injection area, and current aminoglycoside antibiotic therapy. We review the full list during your consultation.",
    },
  },
  {
    question: {
      uk: "Чи залишаться сліди після процедури?",
      ru: "Останутся ли следы после процедуры?",
      en: "Will there be visible marks afterward?",
    },
    answer: {
      uk: "У місцях ін'єкцій можливе невелике точкове почервоніння — проходить за 30-60 хвилин. Інколи з'являється легка набряклість у перші години. Макіяж можна наносити через 2 години, на роботу — одразу.",
      ru: "В местах инъекций возможно небольшое точечное покраснение — проходит за 30-60 минут. Иногда появляется лёгкая отёчность в первые часы. Макияж можно наносить через 2 часа, выходить на работу — сразу.",
      en: "Small pinpoint redness at the injection sites is possible — it resolves within 30-60 minutes. Mild swelling in the first few hours is occasional. Makeup can go on after 2 hours; you can return to work the same day.",
    },
  },
  {
    question: {
      uk: "Через скільки видно результат?",
      ru: "Через сколько виден результат?",
      en: "When will I see the result?",
    },
    answer: {
      uk: "Перші зміни відчуваються на 2-3 добу, повний ефект розкривається на 7-14 день після процедури. Саме тому контрольний огляд плануємо через 2 тижні — якщо десь залишився активний м'яз, коректуємо.",
      ru: "Первые изменения ощущаются на 2-3 сутки, полный эффект раскрывается на 7-14 день после процедуры. Именно поэтому контрольный осмотр планируем через 2 недели — если где-то остался активный мышечный участок, корректируем.",
      en: "You'll notice the first changes on day 2-3; the full effect unfolds by day 7-14. That's why we schedule a follow-up after two weeks — if any muscle zone is still active, we correct it there.",
    },
  },
  {
    question: {
      uk: "Наскільки це безпечно?",
      ru: "Насколько это безопасно?",
      en: "How safe is this, really?",
    },
    answer: {
      uk: "Ботулотоксин застосовується в медицині понад 30 років — у косметології, неврології, офтальмології, ортопедії. У сертифікованих руках, з оригінальним препаратом і правильно розрахованою дозою — одна з найбільш досліджених ін'єкційних процедур у світі. Ризики пов'язані не з молекулою, а з якістю її застосування.",
      ru: "Ботулотоксин применяется в медицине более 30 лет — в косметологии, неврологии, офтальмологии, ортопедии. В сертифицированных руках, с оригинальным препаратом и правильно рассчитанной дозой — одна из самых исследованных инъекционных процедур в мире. Риски связаны не с молекулой, а с качеством её применения.",
      en: "Botulinum toxin has been used in medicine for over 30 years — in cosmetology, neurology, ophthalmology and orthopaedics. In certified hands, with an original preparation and a correctly calculated dose, it's one of the most thoroughly studied injectable procedures in the world. The risk isn't in the molecule — it's in the quality of how it's used.",
    },
  },
];

async function main() {
  const svc = await sql`SELECT id FROM services WHERE slug = ${SERVICE_SLUG} LIMIT 1`;
  if (!svc[0]) {
    console.error(`Service "${SERVICE_SLUG}" not found.`);
    process.exit(1);
  }
  const serviceId = svc[0].id as string;

  // Update hero summary on the service row so it flows into meta descr.
  await sql`
    UPDATE services SET
      summary_uk = ${SUMMARY.uk},
      summary_ru = ${SUMMARY.ru},
      summary_en = ${SUMMARY.en}
    WHERE id = ${serviceId}
  `;
  console.log(`✓ Updated summary for ${SERVICE_SLUG}`);

  // Replace sections + FAQ for this service.
  await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${serviceId}`;
  await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${serviceId}`;

  const sectionIds: string[] = [];
  for (let i = 0; i < SECTIONS.length; i++) {
    const s = SECTIONS[i];
    const id = randomUUID();
    sectionIds.push(id);
    const data = {
      heading: s.heading,
      body: s.body,
      calloutBody: s.calloutBody,
      heroImage: s.heroImage,
    };
    await sql`
      INSERT INTO content_sections (id, owner_type, owner_id, sort_order, section_type, data)
      VALUES (${id}, 'service', ${serviceId}, ${i}, 'richText'::section_type, ${JSON.stringify(data)}::jsonb)
    `;
  }
  console.log(`✓ Inserted ${SECTIONS.length} rich-text sections`);

  for (let i = 0; i < FAQ.length; i++) {
    const f = FAQ[i];
    await sql`
      INSERT INTO faq_items (owner_type, owner_id, sort_order,
        question_uk, question_ru, question_en,
        answer_uk, answer_ru, answer_en)
      VALUES ('service', ${serviceId}, ${i},
        ${f.question.uk}, ${f.question.ru}, ${f.question.en},
        ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en})
    `;
  }
  console.log(`✓ Inserted ${FAQ.length} FAQ items`);

  // Rebuild block_order: new sections first (in order), then fixed blocks.
  const newOrder = [
    ...sectionIds.map((id) => `section:${id}`),
    "faq",
    "doctors",
    "equipment",
    "relatedServices",
    "finalCTA",
  ];
  await sql`UPDATE services SET block_order = ${newOrder} WHERE id = ${serviceId}`;
  console.log(`✓ Rebuilt block_order`);

  await sql.end();
  console.log(`\nPILOT DONE — review at /services/injectable-cosmetology/botulinum-therapy`);
}

main().catch((e) => { console.error(e); process.exit(1); });
