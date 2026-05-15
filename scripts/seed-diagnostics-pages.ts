/**
 * Creates 5 diagnostic service pages under the diagnostics category.
 * Run: npx tsx scripts/seed-diagnostics-pages.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

async function getCategoryId(slug: string): Promise<string> {
  const [row] = await sql`SELECT id FROM service_categories WHERE slug = ${slug}`;
  if (!row) throw new Error(`Category not found: ${slug}`);
  return row.id;
}

async function upsertService(catId: string, slug: string, data: Record<string, any>): Promise<string> {
  const existing = await sql`SELECT id FROM services WHERE slug = ${slug} AND category_id = ${catId}`;
  if (existing.length) {
    const id = existing[0].id;
    await sql`UPDATE services SET ${sql(data)} WHERE id = ${id}`;
    await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'service'`;
    await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'service'`;
    return id;
  }
  const id = randomUUID();
  await sql`INSERT INTO services ${sql({ id, category_id: catId, slug, ...data })}`;
  return id;
}

async function addSections(serviceId: string, sections: { type: string; sort_order: number; data: object }[]) {
  for (const s of sections) {
    await sql`INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${serviceId}, 'service', ${s.type}, ${s.sort_order}, ${JSON.stringify(s.data)}::jsonb)`;
  }
}

async function addFaqs(serviceId: string, faqs: { q: Record<string,string>; a: Record<string,string> }[]) {
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await sql`INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${serviceId}, 'service', ${f.q.uk}, ${f.q.ru}, ${f.q.en}, ${f.a.uk}, ${f.a.ru}, ${f.a.en}, ${i + 1})`;
  }
}

async function main() {
  const diagId = await getCategoryId("diagnostics");

  // ─── 1. InBody / Bioimpedance ─────────────────────────────────────────────
  {
    const id = await upsertService(diagId, "bioimpedance", {
      title_uk: "Біоімпедансометрія InBody", title_ru: "Биоимпедансометрия InBody", title_en: "InBody Bioimpedance Analysis",
      h1_uk: "Біоімпедансометрія в Дніпрі – діагностика складу тіла InBody",
      h1_ru: "Биоимпедансометрия в Днепре – диагностика состава тела InBody",
      h1_en: "Bioimpedance Analysis in Dnipro – InBody Body Composition Diagnostics",
      summary_uk: "Аналіз складу тіла на апараті InBody в GENEVITY: відсоток жиру, м'язова маса, водний баланс, вісцеральний жир. 5 хвилин, без голок. Основа для персональної програми здоров'я.",
      summary_ru: "Анализ состава тела на InBody в GENEVITY: жир, мышцы, вода, висцеральный жир. 5 минут, без игл. Основа для персональной программы здоровья.",
      summary_en: "Body composition analysis on InBody at GENEVITY: fat percentage, muscle mass, water balance, visceral fat. 5 minutes, no needles. The foundation for a personal health programme.",
      seo_title_uk: "Біоімпедансометрія в Дніпрі – діагностика складу тіла InBody",
      seo_title_ru: "Биоимпедансометрия в Днепре – диагностика состава тела InBody",
      seo_title_en: "Bioimpedance Analysis in Dnipro – InBody Body Composition Analysis",
      seo_desc_uk: "Аналіз складу тіла InBody у Дніпрі в GENEVITY. Відсоток жиру, м'язи, вода, вісцеральний жир. Результат за 5 хвилин. Доступна ціна. Запис онлайн.",
      seo_desc_ru: "Анализ состава тела InBody в Днепре в GENEVITY. Жир, мышцы, вода. Результат за 5 минут. Доступная цена.",
      seo_desc_en: "InBody body composition analysis in Dnipro at GENEVITY. Fat %, muscle mass, water balance. Results in 5 minutes. Affordable price.",
      sort_order: 10,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "Що таке біоімпедансометрія InBody і навіщо вона потрібна", ru: "Что такое биоимпедансометрия InBody и зачем она нужна", en: "What is InBody Bioimpedance Analysis and Why You Need It" },
        body: { uk: "Біоімпедансний аналіз складу тіла (InBody) – це швидке та безболісне дослідження, яке за 5 хвилин показує точний розподіл маси тіла: відсоток жирової тканини, м'язову масу по кожному сегменту тіла, рівень вісцерального жиру, водний баланс та базальний метаболізм.\n\nЗвичайні ваги показують лише загальну вагу. InBody показує, що саме складає цю вагу – жир, м'язи чи вода. Два пацієнти з однаковою вагою можуть мати принципово різний склад тіла і потребувати різних підходів до харчування та тренувань.\n\n**Коли потрібна InBody-діагностика:**\n- Перед початком програми схуднення або набору м'язової маси\n- Для оцінки ефективності тренувань та дієти\n- Перед програмами Emsculpt Neo (для оцінки вихідних даних)\n- Як частина Check-Up 40+ або програм Longevity\n- При підозрі на надмірний вісцеральний жир (ризик серцево-судинних захворювань)",
          ru: "Биоимпедансный анализ (InBody) за 5 минут показывает процент жира, мышечную массу по сегментам, висцеральный жир, водный баланс и базальный метаболизм.\n\nОбычные весы показывают только общий вес. InBody показывает его состав. **Когда нужна InBody-диагностика:** перед программой похудения, для оценки тренировок, перед Emsculpt Neo, как часть Check-Up 40+.",
          en: "InBody bioimpedance analysis shows in 5 minutes: body fat percentage, segmental muscle mass, visceral fat level, water balance, and basal metabolic rate.\n\nOrdinary scales only show total weight. InBody shows what that weight consists of. **When InBody is needed:** before a weight-loss or muscle-gain programme, to assess training effectiveness, before Emsculpt Neo, as part of Check-Up 40+ or Longevity programmes." },
      }},
      { type: "richText", sort_order: 2, data: {
        heading: { uk: "Як проходить процедура та що показує звіт InBody", ru: "Как проходит процедура и что показывает отчёт InBody", en: "How the Procedure Works and What the InBody Report Shows" },
        body: { uk: "**Підготовка:** не їсти 2–3 години до аналізу, не займатися спортом за 12 годин, знімаються металеві прикраси. Вагітним та пацієнтам з кардіостимулятором процедура протипоказана.\n\n**Процедура:** пацієнт стає на платформу InBody та тримається за рукоятки. Безпечний слабкий електричний струм проходить через тіло і вимірює опір різних тканин. Займає 5 хвилин.\n\n**Звіт включає:** загальний відсоток жиру та норму для вашого віку і статі, сегментний аналіз м'язів (ліва/права рука, ноги, тулуб), рівень вісцерального жиру (норма до 10), водний баланс, індекс маси тіла, базальний метаболізм.",
          ru: "**Подготовка:** не есть 2–3 часа, не тренироваться 12 часов, снять металлические украшения. Противопоказано беременным и пациентам с кардиостимулятором.\n\n**Процедура:** 5 минут. Безопасный слабый ток через тело.\n\n**Отчёт:** процент жира, сегментный анализ мышц, висцеральный жир, водный баланс, базальный метаболизм.",
          en: "**Preparation:** no food 2–3 hours before, no exercise 12 hours prior, remove metal jewellery. Contraindicated in pregnancy and pacemaker users.\n\n**Procedure:** 5 minutes. Safe low-level current passes through the body.\n\n**Report includes:** fat percentage vs. age/gender norm, segmental muscle analysis (left/right arms, legs, trunk), visceral fat level (normal <10), water balance, BMI, basal metabolic rate." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Наскільки точний аналіз InBody?", ru: "Насколько точен анализ InBody?", en: "How accurate is InBody analysis?" },
        a: { uk: "InBody є золотим стандартом серед побутових та клінічних методів оцінки складу тіла. Точність вимірювань підтверджена клінічними дослідженнями та зіставна з DEXA-скануванням. Для максимальної точності важливо дотримуватися підготовки: не їсти 2–3 години та не займатися спортом за 12 годин до процедури.", ru: "InBody – золотой стандарт среди клинических методов оценки состава тела. Точность подтверждена исследованиями и сопоставима с DEXA. Важно соблюдать подготовку.", en: "InBody is the gold standard among clinical body composition methods. Accuracy is research-confirmed and comparable to DEXA scanning. Preparation (no food 2–3 h, no exercise 12 h prior) is important for maximum accuracy." }},
      { q: { uk: "Як часто потрібно робити InBody?", ru: "Как часто нужно делать InBody?", en: "How often should InBody be done?" },
        a: { uk: "Для моніторингу змін – не частіше ніж раз на 4–6 тижнів (саме стільки потрібно для реальних змін у складі тіла). При активних тренуваннях або зміні харчування – раз на 2 місяці. Як частина щорічного Check-Up – 1 раз на рік.", ru: "Для мониторинга – не чаще раза в 4–6 недель. При активных тренировках – раз в 2 месяца. Как часть Check-Up – 1 раз в год.", en: "For change monitoring: no more than once every 4–6 weeks (minimum time for real body composition changes). With active training: every 2 months. As part of annual Check-Up: once a year." }},
    ]);
    console.log("✓ Bioimpedance / InBody");
  }

  // ─── 2. Ultrasound (УЗД) ─────────────────────────────────────────────────
  {
    const id = await upsertService(diagId, "ultrasound", {
      title_uk: "Ультразвукова діагностика", title_ru: "Ультразвуковая диагностика", title_en: "Ultrasound Diagnostics",
      h1_uk: "УЗД у Дніпрі – ультразвукове дослідження в GENEVITY",
      h1_ru: "УЗИ в Днепре – ультразвуковое исследование в GENEVITY",
      h1_en: "Ultrasound in Dnipro – Ultrasound Examination at GENEVITY",
      summary_uk: "Ультразвукова діагностика в GENEVITY: УЗД органів черевної порожнини, щитоподібної залози, суглобів, органів малого тазу. Сучасне обладнання, лікарі з досвідом. Запис онлайн.",
      summary_ru: "УЗИ в GENEVITY: органы брюшной полости, щитовидная железа, суставы, малый таз. Современное оборудование. Онлайн-запись.",
      summary_en: "Ultrasound diagnostics at GENEVITY: abdominal organs, thyroid gland, joints, pelvic organs. Modern equipment, experienced physicians. Online booking.",
      seo_title_uk: "УЗД у Дніпрі – ультразвукова діагностика в GENEVITY",
      seo_title_ru: "УЗИ в Днепре – ультразвуковая диагностика в GENEVITY",
      seo_title_en: "Ultrasound in Dnipro – Ultrasound Diagnostics at GENEVITY",
      seo_desc_uk: "УЗД у Дніпрі в GENEVITY. Черевна порожнина, щитоподібна залоза, суглоби, малий таз. Сучасне обладнання. Доступна ціна. Запис на консультацію онлайн.",
      seo_desc_ru: "УЗИ в Днепре в GENEVITY. Брюшная полость, щитовидная железа, суставы. Доступная цена. Онлайн-запись.",
      seo_desc_en: "Ultrasound in Dnipro at GENEVITY. Abdominal organs, thyroid, joints, pelvis. Affordable prices. Online appointment.",
      sort_order: 20,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "УЗД в GENEVITY – які дослідження доступні", ru: "УЗИ в GENEVITY – какие исследования доступны", en: "Ultrasound at GENEVITY – Available Examinations" },
        body: { uk: "Ультразвукова діагностика – один із найбезпечніших та найінформативніших методів обстеження. У GENEVITY проводяться:\n\n**УЗД органів черевної порожнини:** печінка, жовчний міхур, підшлункова залоза, селезінка, нирки – для оцінки структури, розміру та виявлення патологій.\n\n**УЗД щитоподібної залози:** оцінка структури та розміру залози, виявлення вузлів та кіст, оцінка кровотоку.\n\n**УЗД суглобів:** колінні, кульшові, плечові – оцінка стану хряща, сухожиль та синовіальної рідини.\n\n**УЗД органів малого тазу:** для жінок (матка, яєчники), для чоловіків (простата, сечовий міхур).\n\nВсі дослідження проводить лікар ультразвукової діагностики з клінічним досвідом. Результат – висновок лікаря у день дослідження.",
          ru: "УЗИ в GENEVITY: органы брюшной полости (печень, желчный пузырь, поджелудочная, почки), щитовидная железа, суставы, органы малого таза. Заключение врача в день исследования.",
          en: "Ultrasound at GENEVITY: abdominal organs (liver, gallbladder, pancreas, kidneys), thyroid gland, joints (knee, hip, shoulder), pelvic organs. Physician's report on the day of examination." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Як підготуватися до УЗД черевної порожнини?", ru: "Как подготовиться к УЗИ брюшной полости?", en: "How to prepare for abdominal ultrasound?" },
        a: { uk: "За 3 дні до дослідження уникайте продуктів, що спричиняють газоутворення (бобові, капуста, чорний хліб, газовані напої). За 6–8 годин до УЗД – не їсти. Можна випити 1–2 склянки негазованої води. Для УЗД нирок – навпаки, прийти з повним сечовим міхуром (випити 1 л води за 1 годину до процедури).", ru: "За 3 дня исключите газообразующие продукты. За 6–8 часов до УЗИ не есть. Для УЗИ почек – прийти с полным мочевым пузырём.", en: "3 days before: avoid gas-forming foods (legumes, cabbage, carbonated drinks). 6–8 hours before: no food. For kidney ultrasound: arrive with a full bladder (drink 1 litre of still water 1 hour before)." }},
    ]);
    console.log("✓ Ultrasound / УЗД");
  }

  // ─── 3. Endocrinologist ───────────────────────────────────────────────────
  {
    const id = await upsertService(diagId, "endocrinologist", {
      title_uk: "Консультація ендокринолога", title_ru: "Консультация эндокринолога", title_en: "Endocrinologist Consultation",
      h1_uk: "Ендокринолог у Дніпрі – консультація лікаря-ендокринолога в GENEVITY",
      h1_ru: "Эндокринолог в Днепре – консультация врача-эндокринолога в GENEVITY",
      h1_en: "Endocrinologist in Dnipro – Consultation at GENEVITY",
      summary_uk: "Консультація ендокринолога в GENEVITY: щитоподібна залоза, цукровий діабет, гормональні порушення, надниркові залози. Індивідуальна схема лікування. Запис онлайн.",
      summary_ru: "Консультация эндокринолога в GENEVITY: щитовидная железа, диабет, гормональные нарушения. Индивидуальная схема лечения. Онлайн-запись.",
      summary_en: "Endocrinologist consultation at GENEVITY: thyroid gland, diabetes, hormonal disorders, adrenal glands. Individual treatment plan. Online booking.",
      seo_title_uk: "Ендокринолог у Дніпрі – консультація ендокринолога в GENEVITY",
      seo_title_ru: "Эндокринолог в Днепре – консультация эндокринолога в GENEVITY",
      seo_title_en: "Endocrinologist in Dnipro – Endocrinologist Consultation at GENEVITY",
      seo_desc_uk: "Прийом ендокринолога в Дніпрі в GENEVITY. Щитоподібна залоза, діабет, гормони. Доступна ціна. Запис на консультацію онлайн.",
      seo_desc_ru: "Приём эндокринолога в Днепре в GENEVITY. Щитовидная железа, диабет, гормоны. Доступная цена.",
      seo_desc_en: "Endocrinologist appointment in Dnipro at GENEVITY. Thyroid, diabetes, hormones. Affordable price. Online booking.",
      sort_order: 30,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "Коли потрібна консультація ендокринолога", ru: "Когда нужна консультация эндокринолога", en: "When to See an Endocrinologist" },
        body: { uk: "Ендокринолог – лікар, що спеціалізується на захворюваннях залоз внутрішньої секреції та гормональних порушеннях. У GENEVITY ендокринолог веде пацієнтів як у рамках загальної практики, так і в контексті програм довголіття та гормонального балансу.\n\n**Основні причини звернення:**\n- Захворювання щитоподібної залози (гіпотиреоз, гіпертиреоз, вузли, зоб)\n- Цукровий діабет 1 та 2 типу, переддіабет\n- Надмірна вага, пов'язана з гормональними порушеннями\n- Порушення менструального циклу на фоні гормонального дисбалансу\n- Остеопороз та дефіцит вітаміну D\n- Хронічна втома, погіршення пам'яті, зниження лібідо\n- Підготовка до програми Гормональний баланс",
          ru: "Эндокринолог лечит заболевания желёз внутренней секреции. **Причины обращения:** щитовидная железа, диабет, лишний вес (гормональный), нарушение цикла, остеопороз, хроническая усталость, снижение либидо.",
          en: "An endocrinologist specialises in endocrine gland diseases and hormonal disorders. **Reasons to consult:** thyroid disease, diabetes, hormone-related weight gain, cycle disorders, osteoporosis, chronic fatigue, reduced libido, preparation for Hormonal Balance programme." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Які аналізи потрібно здати перед прийомом ендокринолога?", ru: "Какие анализы нужно сдать перед приёмом эндокринолога?", en: "What tests are needed before an endocrinologist appointment?" },
        a: { uk: "Базовий пакет: ТТГ (тиреотропний гормон), Т3 вільний, Т4 вільний, антитіла до ТПО. При підозрі на діабет: глюкоза натще, HbA1c. Лікар GENEVITY може призначити аналізи на консультації та направити до нашої лабораторії.", ru: "Базовый пакет: ТТГ, Т3, Т4 свободный, антитела к ТПО. При подозрении на диабет: глюкоза натощак, HbA1c. Врач назначит анализы на консультации.", en: "Basic panel: TSH, free T3, free T4, anti-TPO antibodies. For suspected diabetes: fasting glucose, HbA1c. The GENEVITY physician can order tests at consultation and refer to our laboratory." }},
    ]);
    console.log("✓ Endocrinologist");
  }

  // ─── 4. Cosmetologist ─────────────────────────────────────────────────────
  {
    const id = await upsertService(diagId, "cosmetologist", {
      title_uk: "Консультація косметолога", title_ru: "Консультация косметолога", title_en: "Cosmetologist Consultation",
      h1_uk: "Косметолог у Дніпрі – консультація лікаря-косметолога в GENEVITY",
      h1_ru: "Косметолог в Днепре – консультация врача-косметолога в GENEVITY",
      h1_en: "Cosmetologist in Dnipro – Medical Cosmetologist Consultation at GENEVITY",
      summary_uk: "Консультація лікаря-косметолога в GENEVITY: підбір процедур, лікування акне, пігментації, розробка індивідуальної програми догляду. Лікарі з медичною освітою.",
      summary_ru: "Консультация косметолога в GENEVITY: подбор процедур, акне, пигментация, персональная программа ухода. Врачи с медицинским образованием.",
      summary_en: "Medical cosmetologist consultation at GENEVITY: procedure selection, acne treatment, pigmentation, individual skincare programme. Physicians with medical education.",
      seo_title_uk: "Косметолог у Дніпрі – консультація косметолога в GENEVITY",
      seo_title_ru: "Косметолог в Днепре – консультация косметолога в GENEVITY",
      seo_title_en: "Cosmetologist in Dnipro – Cosmetologist Consultation at GENEVITY",
      seo_desc_uk: "Прийом косметолога в Дніпрі в GENEVITY. Підбір процедур, акне, пігментація, антивікова програма. Доступна ціна. Запис онлайн.",
      seo_desc_ru: "Приём косметолога в Днепре в GENEVITY. Подбор процедур, акне, пигментация. Доступная цена.",
      seo_desc_en: "Cosmetologist appointment in Dnipro at GENEVITY. Procedure selection, acne, pigmentation, anti-ageing programme. Affordable price. Online booking.",
      sort_order: 40,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "Що вирішує консультація лікаря-косметолога", ru: "Что решает консультация врача-косметолога", en: "What a Medical Cosmetologist Consultation Solves" },
        body: { uk: "Лікар-косметолог у GENEVITY – це лікар з медичною освітою та спеціалізацією у дерматокосметології. На відміну від звичайного косметолога, лікар може призначати рецептурні препарати, проводити ін'єкційні процедури та лікувати шкірні захворювання.\n\n**На консультації лікар:**\n- Проводить детальний аналіз стану шкіри (тип, проблеми, вік)\n- Збирає анамнез: алергії, препарати, попередні процедури\n- Ставить діагноз (акне, розацеа, пігментація, дерматит тощо)\n- Підбирає індивідуальну схему – апаратні, ін'єкційні та доглядові процедури\n- Призначає домашній догляд із конкретними рекомендаціями\n\n**Коли потрібна консультація:** перш ніж вперше робити будь-яку естетичну процедуру, при проблемній шкірі (акне, висипання, почервоніння), при підборі антивікової програми.",
          ru: "Врач-косметолог в GENEVITY – врач с медицинским образованием. Анализ кожи, диагноз (акне, розацеа, пигментация), индивидуальная программа процедур и домашний уход.",
          en: "A medical cosmetologist at GENEVITY holds a medical degree with dermatocosmetology specialisation. The consultation includes: detailed skin analysis, medical history, diagnosis (acne, rosacea, pigmentation), individual procedure programme (apparatus, injectable, care), and home skincare recommendations." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Чим лікар-косметолог відрізняється від звичайного косметолога?", ru: "Чем врач-косметолог отличается от обычного косметолога?", en: "How does a medical cosmetologist differ from a regular cosmetologist?" },
        a: { uk: "Лікар-косметолог має повну медичну освіту (6 років медичного університету + інтернатура) та може проводити ін'єкційні процедури (ботулінотерапія, філери, біоревіталізація), призначати рецептурні препарати та лікувати шкірні захворювання. Косметолог без медичної освіти може виконувати лише доглядові та апаратні процедури без медичного компонента. У GENEVITY всі косметологи – лікарі.", ru: "Врач-косметолог имеет полное медицинское образование, может проводить инъекционные процедуры и назначать рецептурные препараты. В GENEVITY все косметологи – врачи.", en: "A medical cosmetologist has full medical education (6 years + residency) and can perform injectables (botulinum therapy, fillers, biorevitalisation), prescribe prescription medications, and treat skin conditions. At GENEVITY, all cosmetologists are qualified physicians." }},
    ]);
    console.log("✓ Cosmetologist");
  }

  // ─── 5. Ultrasound diagnostician ─────────────────────────────────────────
  {
    const id = await upsertService(diagId, "ultrasound-diagnostician", {
      title_uk: "Лікар УЗД", title_ru: "Врач УЗД", title_en: "Ultrasound Diagnostician",
      h1_uk: "Лікар ультразвукової діагностики у Дніпрі – УЗД в GENEVITY",
      h1_ru: "Врач ультразвуковой диагностики в Днепре – УЗИ в GENEVITY",
      h1_en: "Ultrasound Diagnostician in Dnipro – at GENEVITY",
      summary_uk: "Прийом лікаря УЗД в GENEVITY: УЗД органів черевної порожнини, щитоподібної залози, нирок, суглобів, малого тазу. Висновок у день обстеження. Доступна ціна.",
      summary_ru: "Приём врача УЗД в GENEVITY: УЗИ органов. Заключение в день обследования. Доступная цена.",
      summary_en: "Ultrasound diagnostician appointment at GENEVITY: organ ultrasound. Report on the day of examination. Affordable prices.",
      seo_title_uk: "Лікар ультразвукової діагностики у Дніпрі – консультація лікаря УЗД",
      seo_title_ru: "Врач ультразвуковой диагностики в Днепре – консультация врача УЗД",
      seo_title_en: "Ultrasound Diagnostician in Dnipro – Ultrasound Doctor Consultation",
      seo_desc_uk: "Лікар УЗД у Дніпрі в GENEVITY. Ультразвукова діагностика органів. Сучасне обладнання. Висновок у день обстеження. Запис онлайн.",
      seo_desc_ru: "Врач УЗД в Днепре в GENEVITY. Диагностика органов. Заключение в день обследования.",
      seo_desc_en: "Ultrasound diagnostician in Dnipro at GENEVITY. Organ diagnostics. Report on day of examination. Online booking.",
      sort_order: 50,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "УЗД-діагностика в GENEVITY – швидко, точно, доступно", ru: "УЗИ-диагностика в GENEVITY – быстро, точно, доступно", en: "Ultrasound Diagnostics at GENEVITY – Fast, Accurate, Affordable" },
        body: { uk: "Лікар ультразвукової діагностики GENEVITY проводить УЗД на сучасному обладнанні та видає розгорнутий висновок у день обстеження. Дослідження призначають самостійно або за направленням іншого лікаря.\n\n**Доступні дослідження:**\n- УЗД органів черевної порожнини (печінка, жовчний міхур, підшлункова залоза, селезінка)\n- УЗД нирок та надниркових залоз\n- УЗД щитоподібної залози\n- УЗД суглобів (колінні, кульшові, плечові, ліктьові)\n- УЗД органів малого тазу (жінки та чоловіки)\n- УЗД лімфатичних вузлів\n\n**Переваги:** відсутність радіаційного навантаження, безболісність, можливість обстеження в режимі реального часу, негайна консультація щодо результатів.",
          ru: "Врач УЗД в GENEVITY проводит исследования на современном оборудовании. Заключение в день обследования. Доступны: брюшная полость, почки, щитовидная железа, суставы, малый таз, лимфоузлы.",
          en: "GENEVITY's ultrasound diagnostician uses modern equipment and provides a detailed report on the day of examination. Available: abdominal organs, kidneys, thyroid, joints, pelvic organs, lymph nodes. No radiation, painless, real-time imaging with immediate result consultation." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Чи потрібне направлення для УЗД?", ru: "Нужно ли направление для УЗИ?", en: "Is a referral needed for ultrasound?" },
        a: { uk: "Ні. У GENEVITY можна записатися на УЗД без направлення – самостійно, онлайн або за телефоном. Якщо є направлення від лікаря, принесіть його – лікар УЗД врахує клінічне питання при аналізі результатів.", ru: "Нет, направление не обязательно. Можно записаться самостоятельно. При наличии направления – принесите его на приём.", en: "No referral is required at GENEVITY. You can book independently online or by phone. If you have a referral, bring it — the ultrasound physician will consider the clinical question when analysing results." }},
    ]);
    console.log("✓ Ultrasound diagnostician");
  }

  // ─── Update nav_mega translations ────────────────────────────────────────
  const [ui] = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof ui.data === "string" ? JSON.parse(ui.data) : ui.data;
  const nav = (tree.nav_mega as Record<string, any>) || {};

  nav["diagnosticsNav"]            = { uk: "Діагностика",              ru: "Диагностика",              en: "Diagnostics" };
  nav["bioimpedance"]              = { uk: "InBody (склад тіла)",       ru: "InBody (состав тела)",     en: "InBody (body composition)" };
  nav["ultrasound"]                = { uk: "УЗД",                      ru: "УЗИ",                      en: "Ultrasound" };
  nav["endocrinologist"]           = { uk: "Ендокринолог",             ru: "Эндокринолог",             en: "Endocrinologist" };
  nav["cosmetologist"]             = { uk: "Косметолог",               ru: "Косметолог",               en: "Cosmetologist" };
  nav["ultrasound-diagnostician"]  = { uk: "Лікар УЗД",                ru: "Врач УЗД",                 en: "Ultrasound Doctor" };

  tree.nav_mega = nav;
  const json = JSON.stringify(tree);
  await sql`UPDATE ui_strings SET data = ${json}::jsonb WHERE id = 1`;
  console.log("✓ nav_mega translations updated");

  console.log("\n✅ All 5 diagnostics pages created.");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
