import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type L = [string, string, string]; // [uk, ru, en]

/* ============ HERO SLIDES ============ */
const heroSlides = [
  { url: "/images/hero/SEMI7475.webp", pos: "center 80%", alt: ["Інтер'єр преміальної клініки GENEVITY", "Интерьер премиальной клиники GENEVITY", "GENEVITY premium clinic interior"] as L },
  { url: "/images/hero/SEMI7120.webp", pos: "center center", alt: ["Зал апаратної косметології", "Зал аппаратной косметологии", "Apparatus cosmetology hall"] as L },
  { url: "/images/hero/SEMI7515.webp", pos: "center 5%", alt: ["Кабінет лікаря", "Кабинет врача", "Doctor's office"] as L },
  { url: "/images/hero/SEMI1657-HDR.webp", pos: "center 75%", alt: ["Рецепція клініки", "Рецепция клиники", "Clinic reception"] as L },
  { url: "/images/hero/AcuPulse.webp", pos: "center center", alt: ["Лазерне обладнання AcuPulse", "Лазерное оборудование AcuPulse", "AcuPulse laser equipment"] as L },
  { url: "/images/hero/SEMI7511.webp", pos: "center 25%", alt: ["Інтер'єр преміальної клініки", "Интерьер премиальной клиники", "Premium clinic interior"] as L },
];

/* ============ GALLERY ITEMS (stationary + about) ============ */
const stationaryGallery = [
  { url: "/images/interior/SEMI1737-HDR.webp", label: ["Зал апаратної косметології", "Зал аппаратной косметологии", "Apparatus Cosmetology Room"] as L, sub: ["Сучасне обладнання преміум-класу", "Современное оборудование премиум-класса", "Premium modern equipment"] as L, desc: ["Простір обладнано апаратами BTL, Lumenis та InMode для ліфтингу, контурування тіла та омолодження шкіри. Деяке обладнання — єдине в Україні.", "Пространство оборудовано аппаратами BTL, Lumenis и InMode для лифтинга, контурирования тела и омоложения кожи. Некоторое оборудование — единственное в Украине.", "Space equipped with BTL, Lumenis and InMode devices for lifting, body contouring and skin rejuvenation. Some equipment is the only one in Ukraine."] as L },
  { url: "/images/interior/SEMI1276-HDR.webp", label: ["Палати стаціонару", "Палаты стационара", "Stationary Rooms"] as L, sub: ["Комфорт та приватність", "Комфорт и приватность", "Comfort & privacy"] as L, desc: ["Індивідуальні палати з усім необхідним: зручне ліжко, система моніторингу, кондиціонування, Wi-Fi та кнопка виклику медперсоналу.", "Индивидуальные палаты со всем необходимым: удобная кровать, система мониторинга, кондиционирование, Wi-Fi и кнопка вызова медперсонала.", "Private rooms with everything needed: comfortable bed, monitoring system, air conditioning, Wi-Fi and staff call button."] as L },
  { url: "/images/interior/SEMI1281-HDR.webp", label: ["Кабінет лікаря", "Кабинет врача", "Physician Office"] as L, sub: ["Індивідуальні консультації", "Индивидуальные консультации", "Individual consultations"] as L, desc: ["Затишний простір для детальних консультацій, діагностики стану шкіри та складання індивідуальних програм лікування.", "Уютное пространство для детальных консультаций, диагностики состояния кожи и составления индивидуальных программ лечения.", "Cozy space for detailed consultations, skin diagnostics and individual treatment program planning."] as L },
  { url: "/images/interior/EMFACE и EMSculpt.webp", label: ["EMFACE та EMSculpt Neo", "EMFACE и EMSculpt Neo", "EMFACE & EMSculpt Neo"] as L, sub: ["Апаратне омолодження та контурування", "Аппаратное омоложение и контурирование", "Apparatus rejuvenation & contouring"] as L, desc: ["Унікальне поєднання апаратів для одночасної підтяжки обличчя, тонусу м'язів та корекції контурів тіла.", "Уникальное сочетание аппаратов для одновременной подтяжки лица, тонуса мышц и коррекции контуров тела.", "Unique combination of devices for simultaneous facial lifting, muscle toning and body contouring."] as L },
  { url: "/images/interior/SEMI1662-HDR.webp", label: ["Процедурний кабінет", "Процедурный кабинет", "Procedure Room"] as L, sub: ["Ін'єкційна косметологія", "Инъекционная косметология", "Injectable cosmetology"] as L, desc: ["Кабінет для проведення ін'єкційних процедур: ботулінотерапія, контурна пластика, біоревіталізація та мезотерапія.", "Кабинет для проведения инъекционных процедур: ботулинотерапия, контурная пластика, биоревитализация и мезотерапия.", "Room for injectable procedures: botulinum therapy, contour plasty, biorevitalization and mesotherapy."] as L },
  { url: "/images/interior/SEMI7509.webp", label: ["Рецепція", "Рецепция", "Reception"] as L, sub: ["Перше враження", "Первое впечатление", "First impression"] as L, desc: ["Простір, де починається ваш візит — привітна атмосфера та професійний прийом.", "Пространство, где начинается ваш визит — приветливая атмосфера и профессиональный приём.", "Where your visit begins — welcoming atmosphere and professional service."] as L },
  { url: "/images/interior/SEMI7515.webp", label: ["Зона відпочинку", "Зона отдыха", "Rest Area"] as L, sub: ["Затишок після процедур", "Уют после процедур", "Comfort after procedures"] as L, desc: ["Комфортна зона для відпочинку та відновлення після процедур з напоями та увагою медичного персоналу.", "Комфортная зона для отдыха и восстановления после процедур с напитками и вниманием медицинского персонала.", "Comfortable area for rest and recovery after procedures with beverages and medical staff attention."] as L },
];

const aboutGallery = [
  { url: "/images/interior/SEMI1737-HDR.webp", label: ["Зал апаратної косметології", "Зал аппаратной косметологии", "Apparatus Cosmetology Room"] as L, sub: ["", "", ""] as L, desc: ["Простір обладнано апаратами BTL, Lumenis та InMode для ліфтингу, контурування тіла та омолодження шкіри.", "Пространство оборудовано аппаратами BTL, Lumenis и InMode для лифтинга, контурирования тела и омоложения кожи.", "Space equipped with BTL, Lumenis and InMode devices for lifting, body contouring and skin rejuvenation."] as L },
  { url: "/images/interior/SEMI1276-HDR.webp", label: ["Кабінет консультацій", "Кабинет консультаций", "Consultation Room"] as L, sub: ["", "", ""] as L, desc: ["Затишний простір для детальних консультацій та діагностики стану шкіри.", "Уютное пространство для детальных консультаций и диагностики состояния кожи.", "Cozy space for detailed consultations and skin diagnostics."] as L },
  { url: "/images/interior/SEMI1281-HDR.webp", label: ["Кабінет лікаря", "Кабинет врача", "Physician Office"] as L, sub: ["", "", ""] as L, desc: ["Індивідуальні консультації та складання плану лікування.", "Индивидуальные консультации и составление плана лечения.", "Individual consultations and treatment planning."] as L },
  { url: "/images/interior/EMFACE и EMSculpt.webp", label: ["EMFACE та EMSculpt Neo", "EMFACE и EMSculpt Neo", "EMFACE & EMSculpt Neo"] as L, sub: ["", "", ""] as L, desc: ["Апарати для одночасної підтяжки обличчя та корекції контурів тіла.", "Аппараты для одновременной подтяжки лица и коррекции контуров тела.", "Devices for simultaneous facial lifting and body contouring."] as L },
  { url: "/images/interior/SEMI7509.webp", label: ["Рецепція клініки", "Рецепция клиники", "Clinic Reception"] as L, sub: ["", "", ""] as L, desc: ["Простір, де починається ваш візит — привітна атмосфера та професійний прийом.", "Пространство, где начинается ваш визит — приветливая атмосфера и профессиональный приём.", "Where your visit begins — welcoming atmosphere and professional service."] as L },
];

/* ============ PRICE CATEGORIES + ITEMS ============ */
const priceCategories = [
  {
    slug: "consultations",
    label: ["Консультації лікарів", "Консультации врачей", "Doctor Consultations"] as L,
    link: "/doctors",
    items: [
      { name: ["Консультація косметолога", "Консультация косметолога", "Cosmetologist consultation"] as L, price: "950" },
      { name: ["Консультація дерматолога", "Консультация дерматолога", "Dermatologist consultation"] as L, price: "950" },
      { name: ["Консультація ендокринолога", "Консультация эндокринолога", "Endocrinologist consultation"] as L, price: "950" },
      { name: ["Консультація гінеколога", "Консультация гинеколога", "Gynecologist consultation"] as L, price: "950" },
      { name: ["Консультація гастроентеролога", "Консультация гастроэнтеролога", "Gastroenterologist consultation"] as L, price: "950" },
      { name: ["Консультація подолога", "Консультация подолога", "Podiatrist consultation"] as L, price: "500" },
      { name: ["Консультація дієтолога", "Консультация диетолога", "Dietitian consultation"] as L, price: "1 000" },
    ],
  },
  {
    slug: "apparatus",
    label: ["Апаратні процедури", "Аппаратные процедуры", "Apparatus Procedures"] as L,
    link: "/services/apparatus-cosmetology",
    items: [
      { name: ["SMAS-ліфтинг Ultraformer (full face)", "SMAS-лифтинг Ultraformer (full face)", "SMAS lifting Ultraformer (full face)"] as L, price: "40 000" },
      { name: ["EMFACE (чоло)", "EMFACE (лоб)", "EMFACE (forehead)"] as L, price: "5 000" },
      { name: ["EMSCULPT NEO (1 зона)", "EMSCULPT NEO (1 зона)", "EMSCULPT NEO (1 zone)"] as L, price: "4 500" },
      { name: ["HydraFacial Express", "HydraFacial Express", "HydraFacial Express"] as L, price: "4 000" },
      { name: ["HydraFacial Delux + LED", "HydraFacial Delux + LED", "HydraFacial Delux + LED"] as L, price: "4 900" },
      { name: ["Exion фракційний RF (обличчя)", "Exion фракционный RF (лицо)", "Exion fractional RF (face)"] as L, price: "14 500" },
      { name: ["Volnewmer (full face)", "Volnewmer (full face)", "Volnewmer (full face)"] as L, price: "75 000" },
    ],
  },
  {
    slug: "injectable",
    label: ["Ін'єкційна косметологія", "Инъекционная косметология", "Injectable Cosmetology"] as L,
    link: "/services/injectable-cosmetology",
    items: [
      { name: ["Ботулінотерапія (верхня третина)", "Ботулинотерапия (верхняя треть)", "Botulinum therapy (upper third)"] as L, price: "9 000" },
      { name: ["Ботулінотерапія (повне обличчя + шия)", "Ботулинотерапия (полное лицо + шея)", "Botulinum therapy (full face + neck)"] as L, price: "20 000" },
      { name: ["Juvederm Volift / Vollume", "Juvederm Volift / Vollume", "Juvederm Volift / Vollume"] as L, price: "10 800" },
      { name: ["Біоревіталізація Ialest 2 мл", "Биоревитализация Ialest 2 мл", "Biorevitalization Ialest 2ml"] as L, price: "4 500" },
      { name: ["Rejuran Healer 2 мл", "Rejuran Healer 2 мл", "Rejuran Healer 2ml"] as L, price: "8 900" },
      { name: ["Екзосоми", "Экзосомы", "Exosomes"] as L, price: "14 000" },
      { name: ["PolyPhil", "PolyPhil", "PolyPhil"] as L, price: "7 500" },
    ],
  },
  {
    slug: "laser",
    label: ["Лазерна епіляція", "Лазерная эпиляция", "Laser Hair Removal"] as L,
    link: "/services/laser-hair-removal",
    items: [
      { name: ["Верхня губа", "Верхняя губа", "Upper lip"] as L, price: "200" },
      { name: ["Пахви", "Подмышки", "Underarms"] as L, price: "400" },
      { name: ["Повне бікіні (жін.)", "Полное бикини (жен.)", "Full bikini (women)"] as L, price: "950" },
      { name: ["Ноги повністю (жін.)", "Ноги полностью (жен.)", "Full legs (women)"] as L, price: "1 800" },
      { name: ["Обличчя (чол.)", "Лицо (муж.)", "Face (men)"] as L, price: "1 250" },
      { name: ["Повне бікіні (чол.)", "Полное бикини (муж.)", "Full bikini (men)"] as L, price: "1 500" },
    ],
  },
  {
    slug: "podology",
    label: ["Подологія", "Подология", "Podology"] as L,
    link: "/services/podology",
    items: [
      { name: ["Медичний манікюр", "Медицинский маникюр", "Medical manicure"] as L, price: "700" },
      { name: ["Подологічна обробка 1 кат.", "Подологическая обработка 1 кат.", "Podological treatment cat. 1"] as L, price: "800" },
      { name: ["Подологічна обробка 2 кат.", "Подологическая обработка 2 кат.", "Podological treatment cat. 2"] as L, price: "1 100" },
      { name: ["Врослий ніготь 1-2 ст.", "Вросший ноготь 1-2 ст.", "Ingrown nail grade 1-2"] as L, price: "800" },
      { name: ["Корекційна система (1 ніготь)", "Коррекционная система (1 ноготь)", "Correction system (1 nail)"] as L, price: "1 500" },
    ],
  },
];

/* ============ LAB SERVICES / PREP / CHECKUPS ============ */
const labServices = [
  {
    icon_key: "Scan",
    label: ["УЗД-діагностика", "УЗД-диагностика", "Ultrasound Diagnostics"] as L,
    items: {
      uk: ["Органи черевної порожнини", "Щитоподібна залоза", "Молочні залози", "Органи малого тазу", "Серце (ехокардіографія)", "Судини (доплерографія)", "Суглоби та м'язи", "Нирки та сечовий міхур"],
      ru: ["Органы брюшной полости", "Щитовидная железа", "Молочные железы", "Органы малого таза", "Сердце (эхокардиография)", "Сосуды (допплерография)", "Суставы и мышцы", "Почки и мочевой пузырь"],
      en: ["Abdominal organs", "Thyroid", "Breast", "Pelvic organs", "Heart (echocardiography)", "Vessels (Doppler)", "Joints & muscles", "Kidneys & bladder"],
    },
    price: ["від 500 грн", "от 500 грн", "from 500 UAH"] as L,
  },
  {
    icon_key: "HeartPulse",
    label: ["Еластографія", "Эластография", "Elastography"] as L,
    items: {
      uk: ["Печінки", "Щитоподібної залози", "Молочної залози", "М'яких тканин", "Нирок", "Підшлункової залози"],
      ru: ["Печени", "Щитовидной железы", "Молочной железы", "Мягких тканей", "Почек", "Поджелудочной железы"],
      en: ["Liver", "Thyroid", "Breast", "Soft tissue", "Kidneys", "Pancreas"],
    },
    price: ["від 500 грн", "от 500 грн", "from 500 UAH"] as L,
  },
  {
    icon_key: "Brain",
    label: ["Апаратна діагностика", "Аппаратная диагностика", "Apparatus Diagnostics"] as L,
    items: {
      uk: ["InBody — аналіз складу тіла", "Zemits VeraFace — діагностика шкіри"],
      ru: ["InBody — анализ состава тела", "Zemits VeraFace — диагностика кожи"],
      en: ["InBody — body composition analysis", "Zemits VeraFace — skin diagnostics"],
    },
    price: ["500 грн", "500 грн", "500 UAH"] as L,
  },
];

const labPrepSteps = [
  {
    icon_key: "Clock",
    label: ["Запишіться заздалегідь", "Запишитесь заранее", "Book in advance"] as L,
    desc: ["За телефоном або онлайн. Для УЗД бажаний попередній запис.", "По телефону или онлайн. Для УЗД желательна предварительная запись.", "By phone or online. Pre-booking preferred for ultrasound."] as L,
  },
  {
    icon_key: "FileText",
    label: ["Візьміть документи", "Возьмите документы", "Bring documents"] as L,
    desc: ["Паспорт та результати попередніх обстежень для порівняння.", "Паспорт и результаты предыдущих обследований для сравнения.", "Passport and previous examination results for comparison."] as L,
  },
  {
    icon_key: "TestTube",
    label: ["Підготовка до аналізів", "Подготовка к анализам", "Test preparation"] as L,
    desc: ["УЗД черевної порожнини — натще. Інші дослідження — без спеціальної підготовки.", "УЗД брюшной полости — натощак. Другие исследования — без специальной подготовки.", "Abdominal ultrasound — fasting. Other examinations — no special preparation."] as L,
  },
  {
    icon_key: "CheckCircle",
    label: ["Отримайте результати", "Получите результаты", "Get results"] as L,
    desc: ["Результати УЗД — одразу. Лабораторні аналізи — протягом 1–3 днів на email.", "Результаты УЗД — сразу. Лабораторные анализы — в течение 1–3 дней на email.", "Ultrasound results — immediately. Lab tests — within 1–3 days by email."] as L,
  },
];

const labCheckups = [
  {
    label: ["Check-Up Basic", "Check-Up Basic", "Check-Up Basic"] as L,
    price: ["від 5 000 грн", "от 5 000 грн", "from 5,000 UAH"] as L,
    desc: ["Базова діагностика: загальні аналізи, ЕКГ, УЗД органів черевної порожнини, консультація терапевта.", "Базовая диагностика: общие анализы, ЭКГ, УЗД органов брюшной полости, консультация терапевта.", "Basic diagnostics: general tests, ECG, abdominal ultrasound, therapist consultation."] as L,
  },
  {
    label: ["Check-Up 40+", "Check-Up 40+", "Check-Up 40+"] as L,
    price: ["від 12 000 грн", "от 12 000 грн", "from 12,000 UAH"] as L,
    desc: ["Поглиблене обстеження: гормональний профіль, онкомаркери, УЗД, ЕКГ, консультації профільних лікарів.", "Углублённое обследование: гормональный профиль, онкомаркеры, УЗД, ЭКГ, консультации профильных врачей.", "Deep examination: hormonal profile, oncomarkers, ultrasound, ECG, specialist consultations."] as L,
  },
  {
    label: ["Longevity Check-Up", "Longevity Check-Up", "Longevity Check-Up"] as L,
    price: ["від 25 000 грн", "от 25 000 грн", "from 25,000 UAH"] as L,
    desc: ["Повний протокол довголіття: генетика, епігенетика, метаболізм, гормональний баланс, індивідуальний план.", "Полный протокол долголетия: генетика, эпигенетика, метаболизм, гормональный баланс, индивидуальный план.", "Full longevity protocol: genetics, epigenetics, metabolism, hormonal balance, personalized plan."] as L,
  },
];

async function run() {
  // Hero slides — only seed if empty
  const hsRows = await sql`SELECT count(*) AS c FROM hero_slides`;
  if (Number(hsRows[0].c) === 0) {
    for (let i = 0; i < heroSlides.length; i++) {
      const s = heroSlides[i];
      await sql`
        INSERT INTO hero_slides (image_url, object_position, alt_uk, alt_ru, alt_en, sort_order)
        VALUES (${s.url}, ${s.pos}, ${s.alt[0]}, ${s.alt[1]}, ${s.alt[2]}, ${i})
      `;
    }
    console.log(`✓ Seeded ${heroSlides.length} hero slides`);
  } else console.log("• hero_slides already populated — skipping");

  // Gallery — only seed if empty
  const galRows = await sql`SELECT count(*) AS c FROM gallery_items`;
  if (Number(galRows[0].c) === 0) {
    for (const [key, arr] of [["stationary", stationaryGallery], ["about", aboutGallery]] as const) {
      for (let i = 0; i < arr.length; i++) {
        const g = arr[i];
        await sql`
          INSERT INTO gallery_items (owner_key, image_url, alt_uk, alt_ru, alt_en, label_uk, label_ru, label_en, sublabel_uk, sublabel_ru, sublabel_en, description_uk, description_ru, description_en, sort_order)
          VALUES (${key}, ${g.url}, ${g.label[0]}, ${g.label[1]}, ${g.label[2]}, ${g.label[0]}, ${g.label[1]}, ${g.label[2]}, ${g.sub[0]}, ${g.sub[1]}, ${g.sub[2]}, ${g.desc[0]}, ${g.desc[1]}, ${g.desc[2]}, ${i})
        `;
      }
    }
    console.log(`✓ Seeded gallery_items (${stationaryGallery.length} stationary + ${aboutGallery.length} about)`);
  } else console.log("• gallery_items already populated — skipping");

  // Price categories + items — only if empty
  const pcRows = await sql`SELECT count(*) AS c FROM price_categories`;
  if (Number(pcRows[0].c) === 0) {
    for (let i = 0; i < priceCategories.length; i++) {
      const c = priceCategories[i];
      const inserted = await sql`
        INSERT INTO price_categories (slug, label_uk, label_ru, label_en, link, sort_order)
        VALUES (${c.slug}, ${c.label[0]}, ${c.label[1]}, ${c.label[2]}, ${c.link}, ${i})
        RETURNING id
      `;
      const catId = inserted[0].id;
      for (let j = 0; j < c.items.length; j++) {
        const it = c.items[j];
        await sql`
          INSERT INTO price_items (category_id, name_uk, name_ru, name_en, price, sort_order)
          VALUES (${catId}, ${it.name[0]}, ${it.name[1]}, ${it.name[2]}, ${it.price}, ${j})
        `;
      }
    }
    const total = priceCategories.reduce((s, c) => s + c.items.length, 0);
    console.log(`✓ Seeded ${priceCategories.length} price categories with ${total} items`);
  } else console.log("• price_categories already populated — skipping");

  // Lab services — only if empty
  const lsRows = await sql`SELECT count(*) AS c FROM lab_services`;
  if (Number(lsRows[0].c) === 0) {
    for (let i = 0; i < labServices.length; i++) {
      const s = labServices[i];
      await sql`
        INSERT INTO lab_services (icon_key, label_uk, label_ru, label_en, items_uk, items_ru, items_en, price_uk, price_ru, price_en, sort_order)
        VALUES (${s.icon_key}, ${s.label[0]}, ${s.label[1]}, ${s.label[2]}, ${s.items.uk}, ${s.items.ru}, ${s.items.en}, ${s.price[0]}, ${s.price[1]}, ${s.price[2]}, ${i})
      `;
    }
    console.log(`✓ Seeded ${labServices.length} lab services`);
  } else console.log("• lab_services already populated — skipping");

  // Lab prep steps
  const psRows = await sql`SELECT count(*) AS c FROM lab_prep_steps`;
  if (Number(psRows[0].c) === 0) {
    for (let i = 0; i < labPrepSteps.length; i++) {
      const s = labPrepSteps[i];
      await sql`
        INSERT INTO lab_prep_steps (icon_key, label_uk, label_ru, label_en, desc_uk, desc_ru, desc_en, sort_order)
        VALUES (${s.icon_key}, ${s.label[0]}, ${s.label[1]}, ${s.label[2]}, ${s.desc[0]}, ${s.desc[1]}, ${s.desc[2]}, ${i})
      `;
    }
    console.log(`✓ Seeded ${labPrepSteps.length} lab prep steps`);
  } else console.log("• lab_prep_steps already populated — skipping");

  // Lab checkups
  const chRows = await sql`SELECT count(*) AS c FROM lab_checkups`;
  if (Number(chRows[0].c) === 0) {
    for (let i = 0; i < labCheckups.length; i++) {
      const c = labCheckups[i];
      await sql`
        INSERT INTO lab_checkups (label_uk, label_ru, label_en, price_uk, price_ru, price_en, desc_uk, desc_ru, desc_en, sort_order)
        VALUES (${c.label[0]}, ${c.label[1]}, ${c.label[2]}, ${c.price[0]}, ${c.price[1]}, ${c.price[2]}, ${c.desc[0]}, ${c.desc[1]}, ${c.desc[2]}, ${i})
      `;
    }
    console.log(`✓ Seeded ${labCheckups.length} lab checkups`);
  } else console.log("• lab_checkups already populated — skipping");

  console.log("\nDone.");
}

run().catch((e) => { console.error(e); process.exit(1); });
