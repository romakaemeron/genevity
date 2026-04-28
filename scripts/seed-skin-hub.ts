/**
 * Skin hub: M22 Stellar Black + Hydrafacial + AcuPulse CO₂.
 * Semantic targets: hydrafacial (5kw), Acupuls co2 (3kw), m22 stellar black (1kw).
 * Run: npx tsx scripts/seed-skin-hub.ts
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
  const [svc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'skin' AND c.slug = 'apparatus-cosmetology'
  `;
  if (!svc) { console.error("skin service not found — run seed-apparatus-hub-pages.ts first"); process.exit(1); }
  const id = svc.id;

  await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'service'`;

  await sql`
    UPDATE services SET
      title_uk = 'Корекція шкіри', title_ru = 'Коррекция кожи', title_en = 'Skin Correction',
      h1_uk = 'Корекція шкіри у Дніпрі — Hydrafacial, AcuPulse CO₂, M22 Stellar Black',
      h1_ru = 'Коррекция кожи в Днепре — Hydrafacial, AcuPulse CO₂, M22 Stellar Black',
      h1_en = 'Skin Correction in Dnipro — Hydrafacial, AcuPulse CO₂, M22 Stellar Black',
      summary_uk = 'Апаратна корекція шкіри в GENEVITY: Hydrafacial (глибоке очищення + зволоження), AcuPulse CO₂ (лазерна шліфовка постакне та зморшок), M22 Stellar Black (IPL від пігментації та судин). Дніпро.',
      summary_ru = 'Аппаратная коррекция кожи в GENEVITY: Hydrafacial, AcuPulse CO₂ (лазерная шлифовка), M22 Stellar Black (IPL). Днепр.',
      summary_en = 'Apparatus skin correction at GENEVITY: Hydrafacial (deep cleansing + hydration), AcuPulse CO₂ (laser resurfacing), M22 Stellar Black (IPL for pigmentation and vessels). Dnipro.',
      seo_title_uk = 'Корекція шкіри апаратами у Дніпрі — Hydrafacial, AcuPulse CO₂, M22',
      seo_title_ru = 'Коррекция кожи аппаратами в Днепре — Hydrafacial, AcuPulse CO₂, M22',
      seo_title_en = 'Apparatus Skin Correction in Dnipro — Hydrafacial, AcuPulse CO₂, M22',
      seo_desc_uk  = 'Апаратне лікування шкіри в GENEVITY: Hydrafacial — очищення та зволоження; AcuPulse CO₂ — лазерне шліфування рубців, постакне та зморшок; M22 Stellar Black — IPL від пігментації та куперозу. Дніпро.',
      seo_desc_ru  = 'Аппаратное лечение кожи в GENEVITY: Hydrafacial, AcuPulse CO₂ (лазерная шлифовка рубцов и морщин), M22 Stellar Black (IPL). Днепр.',
      seo_desc_en  = 'Apparatus skin treatment at GENEVITY: Hydrafacial (cleanse & hydrate), AcuPulse CO₂ (laser resurfacing scars & wrinkles), M22 Stellar Black (IPL pigmentation & redness). Dnipro.',
      seo_keywords_uk = 'hydrafacial, hydrafacial процедура, hydrafacial ціна, hydrafacial протипоказання, чистка обличчя hydrafacial, co2 лазерна шліфовка, лазерна шліфовка co2, лазерна шліфовка co2 обличчя, co2 лазерна шліфовка обличчя, лазерна co2 шліфовка, acupulse co2, m22 stellar black, корекція шкіри, постакне лікування, пігментація шкіри'
    WHERE id = ${id}
  `;

  const sections = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Апаратна корекція шкіри — лікування, очищення, омолодження", ru: "Аппаратная коррекция кожи — лечение, очищение, омоложение", en: "Apparatus Skin Correction — Treatment, Cleansing, Rejuvenation" },
        body: { uk: "Корекція шкіри апаратними методами вирішує конкретні задачі, які неможливо виправити косметичними засобами або поверхневими процедурами: постакне та рубці, пігментні плями, судинні зірочки та купероз, засмічені й розширені пори, виражені зморшки та нерівна текстура.\n\nВ GENEVITY для корекції шкіри застосовуються три апарати з різним принципом дії, що дозволяє підібрати методику під тип і стан шкіри кожного пацієнта. Усі процедури проводять лікарі-косметологи з медичною освітою та клінічним досвідом.", ru: "Коррекция кожи аппаратными методами решает задачи, неустранимые косметическими средствами: постакне, рубцы, пигментные пятна, купероз, расширенные поры, морщины.\n\nВ GENEVITY три аппарата с разным принципом действия. Процедуры проводят врачи-косметологи с медицинским образованием.", en: "Apparatus skin correction solves problems that cosmetics cannot address: post-acne, scars, pigmentation spots, rosacea, spider veins, enlarged pores, deep wrinkles, and uneven texture.\n\nGENEVITY uses three devices with different mechanisms of action. Procedures are performed by aesthetic physicians with medical education and clinical experience." },
      },
    },
    {
      type: "richText", sort_order: 2,
      data: {
        heading: { uk: "Hydrafacial — глибоке очищення та зволоження шкіри обличчя", ru: "Hydrafacial — глубокое очищение и увлажнение кожи лица", en: "Hydrafacial — Deep Facial Cleansing and Hydration" },
        body: { uk: "Hydrafacial — нетравматична процедура, яка за один 30–60-хвилинний сеанс виконує 6 дій: очищення, ексфоліацію, безболісне вакуумне видалення комедонів, насичення активними сироватками, зволоження та захист шкіри. Унікальна вихрова технологія Vortex-Fusion одночасно відсмоктує забруднення і доставляє активні компоненти вглиб шкіри.\n\n**Показання до Hydrafacial:** всі типи шкіри включаючи чутливу та схильну до акне. Збільшені пори, тьмяний тон, зневоднення, поверхнева пігментація, постакне, дрібні зморшки. Підходить влітку — не підвищує фоточутливість шкіри.\n\n**Протипоказання:** активні запалення на шкірі (папули, пустули), герпес у стадії загострення, розацеа в активній фазі.\n\n**Результат:** видно одразу — шкіра свіжа, зволожена, сяюча. Рекомендується курс 4–6 процедур з інтервалом 2–4 тижні та підтримуючий сеанс раз на місяць.", ru: "Hydrafacial — нетравматическая процедура: очищение, эксфолиация, вакуумное удаление комедонов, сыворотки, увлажнение и защита — за один сеанс 30–60 минут.\n\n**Показания:** все типы кожи, расширенные поры, тусклый тон, постакне. Безопасна летом. **Противопоказания:** активные воспаления, герпес.\n\n**Результат:** виден сразу — свежая, увлажнённая, сияющая кожа.", en: "Hydrafacial is a non-traumatic procedure performing 6 actions in one 30–60-minute session: cleansing, exfoliation, vacuum comedone extraction, serum infusion, hydration, and protection. Unique Vortex-Fusion technology simultaneously extracts impurities and delivers actives into the skin.\n\n**Indications:** all skin types including sensitive and acne-prone. Enlarged pores, dull tone, dehydration, surface pigmentation, post-acne, fine wrinkles. Safe in summer — no increased photosensitivity.\n\n**Result:** visible immediately — fresh, hydrated, glowing skin. Course of 4–6 sessions recommended." },
      },
    },
    {
      type: "richText", sort_order: 3,
      data: {
        heading: { uk: "AcuPulse CO₂ — лазерне шліфування обличчя для лікування рубців та зморшок", ru: "AcuPulse CO₂ — лазерная шлифовка лица для лечения рубцов и морщин", en: "AcuPulse CO₂ — Facial Laser Resurfacing for Scars and Wrinkles" },
        body: { uk: "AcuPulse CO₂ від Lumenis — апарат фракційного вуглекислотного (CO₂) лазера, золотий стандарт лікування постакне, рубців та виражених зморшок. Лазер (10 600 нм) випаровує мікростовпці тканини в дермі, запускаючи активну регенерацію: фібробласти виробляють новий колаген, рубцева тканина замінюється на нормальну, зморшки вирівнюються.\n\n**Показання до лазерного шліфування CO₂:**\n- Постакне та рубці атрофічного типу\n- Зморшки — дрібні та середні\n- Нерівна текстура, розширені пори\n- Пігментація, фотостаріння\n- Шліфовка шиї, декольте, зони навколо очей\n\n**Процедура:** під місцевою анестезією. Тривалість 30–90 хвилин залежно від зони. **Реабілітація:** 5–10 днів (гіперемія, набряк, лущення). Результат стабільний і зберігається 2–5 років. Кількість процедур: 1–3 залежно від глибини проблеми.", ru: "AcuPulse CO₂ от Lumenis — золотой стандарт лечения постакне, рубцов и морщин. Фракционный CO₂ лазер (10 600 нм) запускает регенерацию: рубцовая ткань замещается нормальной.\n\n**Показания:** постакне, рубцы, морщины, пигментация, неровная текстура. **Реабилитация:** 5–10 дней. Результат — 2–5 лет.", en: "AcuPulse CO₂ by Lumenis is the gold standard for post-acne, scar, and wrinkle treatment. The fractional CO₂ laser (10,600 nm) vaporises micro-columns in the dermis, triggering regeneration: scar tissue is replaced with normal tissue, wrinkles smooth out.\n\n**Indications:** post-acne, atrophic scars, fine-to-medium wrinkles, uneven texture, pigmentation, photoageing. **Rehabilitation:** 5–10 days. Results last 2–5 years." },
      },
    },
    {
      type: "richText", sort_order: 4,
      data: {
        heading: { uk: "M22 Stellar Black — IPL та Nd:YAG для пігментації, судинних зірочок та омолодження", ru: "M22 Stellar Black — IPL и Nd:YAG для пигментации, купероза и омоложения", en: "M22 Stellar Black — IPL and Nd:YAG for Pigmentation, Rosacea and Rejuvenation" },
        body: { uk: "M22 Stellar Black від Lumenis — передова мультимодульна платформа, що поєднує вдосконалений IPL (OPT-технологія) з Nd:YAG лазером. IPL ефективно видаляє пігментні плями (веснянки, хлоазма, сонячне лентиго, постзапальна гіперпігментація), дифузне почервоніння та судинні зірочки. Nd:YAG застосовується для глибших судинних уражень та стійкої пігментації.\n\n**Кому підходить M22 Stellar Black:**\n- Пігментні плями різного походження\n- Судинні зірочки, телеангіектазії, купероз\n- Дифузне почервоніння та рівномірний тон шкіри\n- Акне та постакне у фазі ремісії\n- Фотостаріння — нерівний тон, дрібні зморшки\n\n**Процедура:** 20–45 хвилин. Реабілітація мінімальна — легке почервоніння 24–48 годин. Курс: 3–5 процедур з інтервалом 3–4 тижні. Перед курсом необхідно уникати засмаги 2–4 тижні.", ru: "M22 Stellar Black от Lumenis — IPL (OPT-технология) + Nd:YAG лазер. IPL удаляет пигментные пятна, купероз, сосудистые звёздочки. Nd:YAG — для глубоких сосудистых поражений.\n\n**Кому подходит:** пигментация, купероз, фотостарение, постакне. **Процедура:** 20–45 мин, реабилитация 24–48 ч. Курс: 3–5 процедур.", en: "M22 Stellar Black by Lumenis — advanced IPL (OPT technology) + Nd:YAG laser. IPL removes pigmentation spots (freckles, melasma, solar lentigo), diffuse redness, spider veins. Nd:YAG treats deeper vascular lesions and stubborn pigmentation.\n\n**Suitable for:** pigmentation of any origin, spider veins, rosacea, photoageing, post-acne remission.\n\n**Procedure:** 20–45 min. Minimal recovery: mild redness 24–48 h. Course: 3–5 sessions, 3–4 weeks apart. Avoid tanning 2–4 weeks before." },
      },
    },
    {
      type: "indicationsContraindications", sort_order: 5,
      data: {
        indicationsHeading: { uk: "Показання до апаратної корекції шкіри", ru: "Показания к аппаратной коррекции кожи", en: "Indications for Apparatus Skin Correction" },
        indications: [
          { uk: "Постакне: пігментація, рубці, нерівна текстура після акне", ru: "Постакне: пигментация, рубцы, неровная текстура", en: "Post-acne: pigmentation, scars, uneven texture after acne" },
          { uk: "Пігментні плями: веснянки, хлоазма, сонячне лентиго", ru: "Пигментные пятна: веснушки, хлоазма, солнечное лентиго", en: "Pigmentation: freckles, melasma, solar lentigo" },
          { uk: "Судинні зірочки, телеангіектазії, купероз", ru: "Сосудистые звёздочки, телеангиэктазии, купероз", en: "Spider veins, telangiectasias, rosacea" },
          { uk: "Зморшки (дрібні та середні), нерівна текстура, великі пори", ru: "Морщины, неровная текстура, расширенные поры", en: "Wrinkles, uneven skin texture, enlarged pores" },
          { uk: "Загальне тьмяне обличчя, зневоднення, втомлений вигляд", ru: "Тусклый цвет лица, обезвоживание, усталый вид", en: "Dull complexion, dehydration, fatigued appearance" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність та грудне вигодовування", ru: "Беременность и грудное вскармливание", en: "Pregnancy and breastfeeding" },
          { uk: "Активні запальні процеси на шкірі в зоні обробки", ru: "Активные воспалительные процессы в зоне обработки", en: "Active inflammatory processes in the treatment area" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Oncological diseases" },
          { uk: "Прийом фотосенсибілізуючих препаратів (для IPL/лазера)", ru: "Приём фотосенсибилизирующих препаратов (для IPL/лазера)", en: "Photosensitising medications (for IPL/laser)" },
          { uk: "Свіжа засмага (для IPL та CO₂ лазера)", ru: "Свежий загар (для IPL и CO₂ лазера)", en: "Recent tan (for IPL and CO₂ laser)" },
        ],
      },
    },
    {
      type: "bullets", sort_order: 6,
      data: {
        heading: { uk: "Як обрати процедуру для корекції шкіри?", ru: "Как выбрать процедуру для коррекции кожи?", en: "How to Choose the Right Skin Correction Procedure?" },
        items: [
          { uk: "Глибоке очищення, зволоження, зашлакованість пор → Hydrafacial", ru: "Глубокое очищение, увлажнение, засорённые поры → Hydrafacial", en: "Deep cleansing, hydration, clogged pores → Hydrafacial" },
          { uk: "Постакне рубці, виражені зморшки, груба текстура → AcuPulse CO₂", ru: "Постакне рубцы, выраженные морщины, грубая текстура → AcuPulse CO₂", en: "Post-acne scars, deep wrinkles, coarse texture → AcuPulse CO₂" },
          { uk: "Пігментні плями, судинні зірочки, купероз, нерівний тон → M22 Stellar Black", ru: "Пигментные пятна, сосудистые звёздочки, купероз → M22 Stellar Black", en: "Pigmentation spots, spider veins, rosacea, uneven tone → M22 Stellar Black" },
          { uk: "Комплексна задача: Hydrafacial (підготовка) + CO₂ або IPL (корекція)", ru: "Комплексная задача: Hydrafacial (подготовка) + CO₂ или IPL (коррекция)", en: "Complex task: Hydrafacial (preparation) + CO₂ or IPL (correction)" },
          { uk: "Лікар підбирає процедуру після огляду — консультація безкоштовна", ru: "Врач подбирает процедуру после осмотра — консультация бесплатна", en: "The physician selects the procedure after examination — free consultation" },
        ],
      },
    },
  ];

  for (const s of sections) {
    await sql`
      INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${id}, 'service', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})
    `;
  }

  const faqs = [
    {
      q: { uk: "Скільки коштує і як довго триває процедура Hydrafacial?", ru: "Сколько стоит и как долго длится процедура Hydrafacial?", en: "How much does Hydrafacial cost and how long does it take?" },
      a: { uk: "Сеанс Hydrafacial займає 30–60 хвилин залежно від програми (базова чи розширена з бустерами). Вартість уточнюйте на консультації — ціна залежить від обраної програми та додаткових компонентів. Результат видно одразу після сеансу.", ru: "Сеанс Hydrafacial — 30–60 минут в зависимости от программы. Стоимость уточняйте на консультации. Результат виден сразу.", en: "A Hydrafacial session takes 30–60 minutes depending on the programme (basic or extended with boosters). Pricing is confirmed at consultation and depends on the programme. Results are visible immediately." },
    },
    {
      q: { uk: "Чи можна робити Hydrafacial влітку або після засмаги?", ru: "Можно ли делать Hydrafacial летом или после загара?", en: "Can Hydrafacial be done in summer or after tanning?" },
      a: { uk: "Так, Hydrafacial безпечна влітку і не має сезонних обмежень. На відміну від CO₂ лазера або IPL, вона не підвищує фоточутливість шкіри. Рекомендується наносити SPF 30+ після сеансу — це стандартна рекомендація, актуальна у будь-яку пору року.", ru: "Да, Hydrafacial безопасна летом и не имеет сезонных ограничений. В отличие от CO₂ лазера или IPL, она не повышает фоточувствительность. SPF 30+ после сеанса рекомендован в любое время года.", en: "Yes, Hydrafacial is safe in summer with no seasonal restrictions. Unlike CO₂ laser or IPL, it does not increase photosensitivity. SPF 30+ after the session is standard advice regardless of season." },
    },
    {
      q: { uk: "Скільки процедур AcuPulse CO₂ лазера потрібно для усунення постакне?", ru: "Сколько процедур AcuPulse CO₂ лазера нужно для устранения постакне?", en: "How many AcuPulse CO₂ sessions are needed for post-acne treatment?" },
      a: { uk: "Поверхневе постакне (пігментація без рубців): 1–2 сеанси. Рубці атрофічного типу середньої глибини: 2–3 сеанси з інтервалом 2–3 місяці. Глибокі рубці: 3–4 процедури. Між сеансами шкіра повністю відновлюється. Точну кількість лікар визначить після огляду та оцінки глибини ураження.", ru: "Поверхностное постакне: 1–2 сеанса. Рубцы средней глубины: 2–3 сеанса, 2–3 месяца между ними. Глубокие рубцы: 3–4 процедуры. Точное количество врач определит после осмотра.", en: "Surface post-acne (pigmentation without scars): 1–2 sessions. Medium-depth atrophic scars: 2–3 sessions, 2–3 months apart. Deep scars: 3–4 procedures. The physician determines the exact number after assessing scar depth." },
    },
    {
      q: { uk: "Чи болюча лазерна шліфовка CO₂ обличчя?", ru: "Болезненна ли лазерная шлифовка CO₂ лица?", en: "Is CO₂ facial laser resurfacing painful?" },
      a: { uk: "Процедура проводиться під місцевою анестезією (анестезуючий крем наносять за 30–40 хвилин до початку). Під час сеансу пацієнт відчуває тепло та незначний дискомфорт, але не гострий біль. Після процедури перші 2–3 дні можливі відчуття стягнутості та тепла.", ru: "Процедура под местной анестезией. Во время сеанса — тепло и лёгкий дискомфорт, не острая боль. После — ощущение стянутости 2–3 дня.", en: "The procedure is performed under topical anaesthesia (numbing cream applied 30–40 minutes before). During the session: warmth and mild discomfort, not sharp pain. Post-procedure: tightness and warmth for the first 2–3 days." },
    },
    {
      q: { uk: "Який реабілітаційний період після CO₂ лазерної шліфовки?", ru: "Какой реабилитационный период после CO₂ лазерной шлифовки?", en: "What is the recovery period after CO₂ laser resurfacing?" },
      a: { uk: "Повне відновлення займає 5–10 днів: дні 1–3 — гіперемія та набряк, дні 3–7 — активне лущення, до 10-го дня — загоєння. Протягом місяця після процедури необхідний щоденний SPF 50+. Декоративну косметику можна наносити після повного загоєння шкіри (7–10 день).", ru: "5–10 дней: гиперемия и отёк (1–3 дни), шелушение (3–7 дни), заживление к 10 дню. SPF 50+ в течение месяца после процедуры.", en: "5–10 days: redness and swelling (days 1–3), active peeling (days 3–7), healing by day 10. SPF 50+ for one month post-procedure. Makeup can be applied after complete healing (day 7–10)." },
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${id}, 'service', ${faqs[i].q.uk}, ${faqs[i].q.ru}, ${faqs[i].q.en}, ${faqs[i].a.uk}, ${faqs[i].a.ru}, ${faqs[i].a.en}, ${i + 1})
    `;
  }

  console.log(`✓ Skin hub: ${sections.length} sections + ${faqs.length} FAQs`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
