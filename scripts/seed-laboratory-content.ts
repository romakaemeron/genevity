/**
 * Laboratory page — add TZ #40 required sections:
 * equipment, staff quality, speed of results, how to prepare for tests.
 * Run: npx tsx scripts/seed-laboratory-content.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

async function main() {
  const [page] = await sql`SELECT id FROM static_pages WHERE slug = 'laboratory'`;
  if (!page) { console.error("laboratory page not found"); process.exit(1); }
  const id = page.id;

  // Clear existing sections and FAQs
  await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'static_page'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'static_page'`;

  // Update seo_keywords
  await sql`
    UPDATE static_pages SET
      seo_keywords_uk = 'здати аналізи, де здати аналізи, приватні лабораторії у Дніпрі, лабораторія для здачі аналізів, скільки коштує здати аналіз, аналізи дніпро, узд дніпро',
      seo_keywords_ru = 'сдать анализы, где сдать анализы, частные лаборатории Днепр, анализы Днепр, УЗИ Днепр',
      seo_keywords_en = 'lab tests dnipro, blood tests private clinic, ultrasound dnipro, health diagnostics'
    WHERE id = ${id}
  `;

  const sections = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Лабораторія та діагностика GENEVITY — повний спектр послуг у Дніпрі", ru: "Лаборатория и диагностика GENEVITY — полный спектр услуг в Днепре", en: "GENEVITY Laboratory & Diagnostics — Full Range of Services in Dnipro" },
        body: { uk: "Лабораторія GENEVITY — сучасний діагностичний центр, де зібрані всі необхідні дослідження для моніторингу здоров'я, скринінгу захворювань та контролю лікування. Аналізи та УЗД в одному місці без черг і бюрократії — зручно і швидко.\n\nРезультати більшості аналізів доступні онлайн у день здачі або на наступний день. Лабораторія GENEVITY входить до складу медичного центру, тому результати одразу ж можуть бути інтерпретовані вашим лікуючим лікарем.", ru: "Лаборатория GENEVITY — современный диагностический центр с полным спектром исследований для мониторинга здоровья, скрининга и контроля лечения. Анализы и УЗИ в одном месте без очередей.\n\nРезультаты большинства анализов доступны онлайн в день сдачи или на следующий день.", en: "GENEVITY Laboratory is a modern diagnostic centre covering all investigations needed for health monitoring, disease screening, and treatment control. Tests and ultrasound in one place — no queues, no bureaucracy.\n\nResults for most tests are available online on the day of collection or the next day." },
      },
    },
    {
      type: "bullets", sort_order: 2,
      data: {
        heading: { uk: "Послуги лабораторії та діагностики", ru: "Услуги лаборатории и диагностики", en: "Laboratory and Diagnostic Services" },
        items: [
          { uk: "Загальний аналіз крові та сечі — базовий скринінг здоров'я", ru: "Общий анализ крови и мочи — базовый скрининг здоровья", en: "Complete blood count and urinalysis — basic health screening" },
          { uk: "Біохімічний аналіз крові — печінка, нирки, глюкоза, ліпідограма", ru: "Биохимический анализ крови — печень, почки, глюкоза, липидограмма", en: "Biochemical blood panel — liver, kidneys, glucose, lipid profile" },
          { uk: "Гормональний профіль — щитовидна залоза, статеві гормони, кортизол, інсулін", ru: "Гормональный профиль — щитовидная железа, половые гормоны, кортизол, инсулин", en: "Hormonal profile — thyroid, sex hormones, cortisol, insulin" },
          { uk: "Вітаміни та мікроелементи — D3, B12, залізо, феритин, магній, цинк", ru: "Витамины и микроэлементы — D3, B12, железо, ферритин, магний, цинк", en: "Vitamins and micronutrients — D3, B12, iron, ferritin, magnesium, zinc" },
          { uk: "Онкомаркери — ПСА, СА-125, АФП, РЕА та інші за показаннями", ru: "Онкомаркеры — ПСА, СА-125, АФП, РЭА и другие по показаниям", en: "Tumour markers — PSA, CA-125, AFP, CEA and others per indication" },
          { uk: "ПЛР-діагностика — інфекційні панелі, TORCH, ЗПСШ", ru: "ПЦР-диагностика — инфекционные панели, TORCH, ЗППП", en: "PCR diagnostics — infection panels, TORCH, STIs" },
          { uk: "УЗД органів черевної порожнини, малого таза, щитовидної залози, молочних залоз", ru: "УЗИ органов брюшной полости, малого таза, щитовидной железы, молочных желёз", en: "Ultrasound of abdominal organs, pelvis, thyroid gland, breast" },
          { uk: "Комплексні програми Check-Up 40+ для повного скринінгу здоров'я", ru: "Комплексные программы Check-Up 40+ для полного скрининга здоровья", en: "Comprehensive Check-Up 40+ programmes for complete health screening" },
        ],
      },
    },
    {
      type: "bullets", sort_order: 3,
      data: {
        heading: { uk: "Переваги лабораторії GENEVITY", ru: "Преимущества лаборатории GENEVITY", en: "Why Choose GENEVITY Laboratory" },
        items: [
          { uk: "Сучасне автоматичне лабораторне обладнання — мінімізація людського фактора та висока відтворюваність", ru: "Современное автоматическое лабораторне оборудование — минимизация человеческого фактора", en: "Modern automated laboratory equipment — minimising human error and ensuring high reproducibility" },
          { uk: "Висококваліфікований медперсонал — лаборанти зі спеціалізованою освітою та досвідом", ru: "Высококвалифицированный медперсонал — лаборанты со специализированным образованием", en: "Highly qualified medical staff — laboratory technicians with specialised education and experience" },
          { uk: "Швидкість результатів: більшість аналізів — до 24 годин, термінові — у день здачі", ru: "Скорость результатов: большинство анализов — до 24 часов, срочные — в день сдачи", en: "Speed of results: most tests within 24 hours, urgent tests on the day of collection" },
          { uk: "Результати онлайн — доступні в особистому кабінеті або надсилаються на email/месенджер", ru: "Результаты онлайн — доступны в личном кабинете или отправляются на email/мессенджер", en: "Online results — accessible in your personal account or sent to email/messenger" },
          { uk: "Внутрішня інтерпретація — результати можуть одразу розглянути лікарі GENEVITY", ru: "Внутренняя интерпретация — результаты могут сразу рассмотреть врачи GENEVITY", en: "In-house interpretation — results can be immediately reviewed by GENEVITY physicians" },
          { uk: "Конфіденційність — медична таємниця дотримується відповідно до законодавства", ru: "Конфиденциальность — медицинская тайна соблюдается в соответствии с законодательством", en: "Confidentiality — medical secrecy is maintained in accordance with legislation" },
        ],
      },
    },
    {
      type: "steps", sort_order: 4,
      data: {
        heading: { uk: "Як підготуватися до здачі аналізів", ru: "Как подготовиться к сдаче анализов", en: "How to Prepare for Laboratory Tests" },
        steps: [
          { title: { uk: "Аналізи крові натщесерце", ru: "Анализы крови натощак", en: "Fasting blood tests" }, description: { uk: "Більшість біохімічних та гормональних аналізів здаються натщесерце — 8–12 годин без їжі. Воду пити можна (чисту, без газу). Не палити за 2 години до здачі.", ru: "Большинство биохимических и гормональных анализов — натощак, 8–12 часов без еды. Воду пить можно. Не курить за 2 часа.", en: "Most biochemical and hormonal tests require fasting for 8–12 hours. Plain still water is allowed. No smoking 2 hours before." } },
          { title: { uk: "За добу до аналізів", ru: "За сутки до анализов", en: "Day before tests" }, description: { uk: "Уникайте алкоголю, жирної їжі та інтенсивних фізичних навантажень. Вони спотворюють показники печінкових ферментів, ліпідограми та загального аналізу крові.", ru: "Избегайте алкоголя, жирной пищи и интенсивных нагрузок. Они искажают показатели ферментов печени, липидограммы и ОАК.", en: "Avoid alcohol, fatty food, and intense exercise. These distort liver enzyme, lipid profile, and CBC results." } },
          { title: { uk: "Гормональні аналізи", ru: "Гормональные анализы", en: "Hormonal tests" }, description: { uk: "Гормони щитовидної залози — будь-який день, вранці натщесерце. Статеві гормони (естрадіол, ФСГ, ЛГ) — на 2–5-й день циклу, якщо не вказано інше. Прогестерон — на 19–23-й день циклу. Лікар уточнить оптимальний день при записі.", ru: "Гормоны щитовидной железы — любой день, утром натощак. Половые гормоны (эстрадиол, ФСГ, ЛГ) — на 2–5-й день цикла. Прогестерон — на 19–23-й. Врач уточнит при записи.", en: "Thyroid hormones — any day, morning fasting. Sex hormones (oestradiol, FSH, LH) — cycle days 2–5 unless otherwise indicated. Progesterone — cycle days 19–23. The physician will specify at the time of booking." } },
          { title: { uk: "Загальний аналіз сечі", ru: "Общий анализ мочи", en: "Urinalysis" }, description: { uk: "Перша ранкова порція сечі (середній струмінь). Попередньо провести гігієнічний туалет. Зібрати у стерильний контейнер та доставити до лабораторії протягом 2 годин.", ru: "Первая утренняя порция мочи (средняя струя). Гигиенический туалет предварительно. Стерильный контейнер, доставить в течение 2 часов.", en: "First morning urine (midstream). Prior hygiene wash required. Collect in sterile container, deliver within 2 hours." } },
          { title: { uk: "УЗД органів черевної порожнини", ru: "УЗИ органов брюшной полости", en: "Abdominal ultrasound" }, description: { uk: "Натщесерце (мінімум 4–6 годин без їжі). За 1–2 дні обмежте газоутворюючі продукти (капуста, бобові, газовані напої) — для кращої візуалізації. УЗД малого таза у жінок може виконуватись трансабдомінально (повний сечовий міхур) або трансвагінально (порожній).", ru: "Натощак (минимум 4–6 часов). За 1–2 дня ограничьте газообразующие продукты. УЗИ малого таза у женщин — трансабдоминально (полный мочевой) или трансвагинально (пустой).", en: "Fasting for at least 4–6 hours. Limit gas-producing foods 1–2 days before (cabbage, legumes, sparkling drinks) for better visualisation. Pelvic ultrasound in women: transabdominal (full bladder) or transvaginal (empty bladder)." } },
        ],
      },
    },
  ];

  for (const s of sections) {
    await sql`
      INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${id}, 'static_page', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})
    `;
  }

  const faqs = [
    {
      q: { uk: "Які години роботи лабораторії GENEVITY?", ru: "Каков график работы лаборатории GENEVITY?", en: "What are GENEVITY laboratory working hours?" },
      a: { uk: "Уточнюйте актуальний графік роботи лабораторії за телефоном +380 73 000 0150 або на ресепшен центру. Для здачі аналізів натщесерце рекомендується ранній запис.", ru: "Актуальный график работы уточняйте по телефону +380 73 000 0150 или на ресепции центра.", en: "Check current laboratory hours by phone +380 73 000 0150 or at the clinic reception. Early morning appointments are recommended for fasting tests." },
    },
    {
      q: { uk: "Чи можна отримати результати аналізів онлайн?", ru: "Можно ли получить результаты анализов онлайн?", en: "Can lab results be received online?" },
      a: { uk: "Так. Результати більшості аналізів надсилаються на email або в месенджер — це зручно і швидко. Термін готовності залежить від виду дослідження: загальний аналіз крові — 2–4 години, біохімія — до 24 годин, гормони — 1–2 дні, ПЛР — 1–3 доби. Уточнюйте при здачі.", ru: "Да. Результаты отправляются на email или в мессенджер. Сроки зависят от исследования: ОАК — 2–4 часа, биохимия — до 24 ч, гормоны — 1–2 дня, ПЦР — 1–3 суток.", en: "Yes. Results are sent to email or messenger. Turnaround depends on the test: CBC — 2–4 hours, biochemistry — up to 24 hours, hormones — 1–2 days, PCR — 1–3 days. Confirm at time of collection." },
    },
    {
      q: { uk: "Чи потрібен запис для здачі аналізів?", ru: "Нужна ли запись для сдачи анализов?", en: "Is an appointment needed for lab tests?" },
      a: { uk: "Рекомендується попередній запис — щоб запланувати зручний час і уникнути очікування. Записатися можна онлайн або за телефоном +380 73 000 0150. Для УЗД запис обов'язковий.", ru: "Рекомендуется предварительная запись — для удобного времени без ожидания. Записаться онлайн или по телефону +380 73 000 0150. Для УЗИ запись обязательна.", en: "Advance booking is recommended to secure a convenient time and avoid waiting. Book online or call +380 73 000 0150. Appointment is mandatory for ultrasound." },
    },
    {
      q: { uk: "Які документи необхідні для здачі аналізів?", ru: "Какие документы нужны для сдачи анализов?", en: "What documents are needed for lab tests?" },
      a: { uk: "Для первинного відвідування знадобиться паспорт або інший документ, що підтверджує особу. Для неповнолітніх — документи батька або опікуна та свідоцтво про народження. Направлення від лікаря не є обов'язковим — аналізи можна замовити самостійно.", ru: "Для первичного визита нужен паспорт или другой документ. Для несовершеннолетних — документы родителей и свидетельство о рождении. Направление врача не обязательно.", en: "For your first visit, bring a passport or other identity document. For minors — parent/guardian documents and birth certificate. A physician's referral is not required — tests can be self-ordered." },
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${id}, 'static_page', ${f.q.uk}, ${f.q.ru}, ${f.q.en}, ${f.a.uk}, ${f.a.ru}, ${f.a.en}, ${i + 1})
    `;
  }

  console.log(`✓ Laboratory: ${sections.length} sections + ${faqs.length} FAQs`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
