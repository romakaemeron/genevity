/**
 * ТЗ №6 (Метатеги) — creation + full content seeding for 7 new laser / skin
 * treatment service pages under `apparatus-cosmetology`.
 *
 * Same pattern as seed-tz-v8-new-services.ts, but this script BOTH creates the
 * service rows and fills them: title, H1, summary, key facts, content sections,
 * FAQ, block_order, doctors, equipment, related services and the E-E-A-T
 * medical reviewer.
 *
 * SEO title/description are parsed verbatim (incl. emoji) straight from the
 * client CSV so nothing is re-typed by hand:
 *   tasks_inweb/genevity.com.ua _ Технічне завдання №6 _ Метатеги - genevity.com.ua.csv
 * The CSV has no URLs — only page names — so rows are matched on the exact
 * "URL UA" (name) column via NAME_TO_SLUG below.
 *
 * Run: npx tsx scripts/seed-tz6-laser-skin.ts
 *
 * Service / slug map (all under apparatus-cosmetology):
 *   Лазерна шліфовка           → laser-resurfacing
 *   Лазерна шліфовка постакне  → laser-resurfacing-post-acne
 *   Лазерний пілінг            → laser-peel
 *   Лікування куперозу         → couperose-treatment
 *   Лікування акне             → acne-treatment
 *   Видалення пігментації      → pigmentation-removal
 *   Лікування розацеа          → rosacea-treatment
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

const CATEGORY = "apparatus-cosmetology";
const REVIEWER_DOCTOR = "detsyk-dmytro";       // same reviewer as the other laser pages
const LAST_REVIEWED = "2026-07-29";
const SERVICE_DOCTORS = ["beliyanushkin-viktor", "sepkina-hanna"];
const FIXED_BLOCKS = ["equipment", "doctors", "relatedServices", "faq", "finalCTA"];

// equipment UUIDs (from the `equipment` table)
const EQ_ACUPULSE = "b9fc15cc-b374-4bc4-83f7-a0310675a287"; // CO2 лазер (AcuPulse)
const EQ_M22 = "1466b7ba-0060-447e-8619-f3c7eea7f76a";      // M22 STELLAR BLACK

// ─── CSV parsing (metatags, verbatim) ───────────────────────────────────────
const CSV_PATH = path.resolve(__dirname, "..", "tasks_inweb",
  "genevity.com.ua _ Технічне завдання №6 _ Метатеги - genevity.com.ua.csv");

/** Quote-aware CSV line parser (RFC-4180 fields, no embedded newlines). */
function parseLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(field); field = ""; }
    else field += c;
  }
  out.push(field);
  return out;
}

/** Exact "URL UA" (name) cell → slug. */
const NAME_TO_SLUG: Record<string, string> = {
  "Лазерна шліфовка": "laser-resurfacing",
  "Лазерна шліфовка постакне": "laser-resurfacing-post-acne",
  "Лазерний пілінг": "laser-peel",
  "Лікування куперозу": "couperose-treatment",
  "Лікування акне": "acne-treatment",
  "Видалення пігментації": "pigmentation-removal",
  "Лікування розацеа": "rosacea-treatment",
};

type L = { uk: string; ru: string; en: string };
interface CsvMeta { seoTitle: L; seoDesc: L }

function readMetaFromCsv(): Record<string, CsvMeta> {
  const raw = fs.readFileSync(CSV_PATH, "utf-8").replace(/\r\n/g, "\n");
  const rows = raw.split("\n").filter((l) => l.trim().length).slice(1).map(parseLine);
  const out: Record<string, CsvMeta> = {};
  for (const r of rows) {
    // cols: 0 URL RU, 1 Title RU, 2 Desc RU, 3 URL UA, 4 Title UA, 5 Desc UA, 6 URL EN, 7 Title EN, 8 Desc EN
    const [, titleRu, descRu, nameUa, titleUk, descUk, , titleEn, descEn] = r;
    const slug = NAME_TO_SLUG[nameUa.trim()];
    if (!slug) { console.warn(`⚠ CSV row not mapped to a slug: "${nameUa}"`); continue; }
    out[slug] = {
      seoTitle: { uk: titleUk.trim(), ru: titleRu.trim(), en: titleEn.trim() },
      seoDesc: { uk: descUk.trim(), ru: descRu.trim(), en: descEn.trim() },
    };
  }
  return out;
}

// ─── Section shapes ─────────────────────────────────────────────────────────
type RichTextSection = { type: "richText"; heading: L; body: L; calloutBody?: L };
type IndicationsSection = { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] };
type StepsSection = { type: "steps"; heading: L; steps: { title: L; description: L }[] };
type BulletsSection = { type: "bullets"; heading: L; items: L[] };
type AnySection = RichTextSection | IndicationsSection | StepsSection | BulletsSection;

function sectionData(s: AnySection): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: null };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  return { heading: s.heading, items: s.items };
}

interface ServiceSeed {
  slug: string;
  title: L;
  h1: L;
  summary: L;
  procedureLength: L;
  effectDuration: L;
  sessionsRecommended: L;
  equipment: string[];
  related: string[];
  sections: AnySection[];
  faqs: { question: L; answer: L }[];
}

// ════════════════════════════════════════════════════════════════════════════
const services: ServiceSeed[] = [

// ─── 1. ЛАЗЕРНА ШЛІФОВКА ────────────────────────────────────────────────────
{
  slug: "laser-resurfacing",
  title: { uk: "Лазерна шліфовка", ru: "Лазерная шлифовка", en: "Laser Resurfacing" },
  h1: { uk: "Лазерна шліфовка в Дніпрі", ru: "Лазерная шлифовка в Днепре", en: "Laser resurfacing in Dnipro" },
  summary: {
    uk: "Лазерна шліфовка обличчя в GENEVITY — фракційне оновлення шкіри на CO₂-лазері AcuPulse. Вирівнює рельєф і тон, скорочує зморшки, рубці та розширені пори. Режим і глибину впливу лікар підбирає індивідуально, Дніпро.",
    ru: "Лазерная шлифовка лица в GENEVITY — фракционное обновление кожи на CO₂-лазере AcuPulse. Выравнивает рельеф и тон, сокращает морщины, рубцы и расширенные поры. Режим и глубину воздействия врач подбирает индивидуально, Днепр.",
    en: "Laser resurfacing at GENEVITY is fractional skin renewal with the AcuPulse CO₂ laser. It evens out texture and tone and reduces wrinkles, scars, and enlarged pores. The doctor selects the mode and depth individually, Dnipro.",
  },
  procedureLength: { uk: "40-60 хвилин", ru: "40-60 минут", en: "40-60 minutes" },
  effectDuration: { uk: "12-24 місяці", ru: "12-24 месяца", en: "12-24 months" },
  sessionsRecommended: { uk: "1-3 процедури", ru: "1-3 процедуры", en: "1-3 treatments" },
  equipment: [EQ_ACUPULSE],
  related: ["acupulse-co2", "laser-peel", "laser-rejuvenation"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Що таке лазерна шліфовка обличчя", ru: "Что такое лазерная шлифовка лица", en: "What Laser Resurfacing Is" },
      body: {
        uk: "Лазерна шліфовка — це контрольоване оновлення шкіри променем CO₂-лазера з довжиною хвилі 10 600 нм. Промінь випаровує тонкий шар тканини у вигляді мікроскопічних колонок, залишаючи неушкоджену шкіру між ними. Саме ці ділянки й забезпечують швидке загоєння.\n\nУ відповідь на прогрітий колаген дерма запускає ремоделювання: синтезуються нові колагенові та еластинові волокна. Через 4-8 тижнів шкіра стає щільнішою, рельєф вирівнюється, тон світлішає.\n\nУ GENEVITY процедуру виконують на апараті AcuPulse від Lumenis. Лікар обирає щільність і глибину впливу залежно від запиту — від делікатного поверхневого режиму до глибокого опрацювання рубців.\n\n**Що коригує лазерна шліфовка:**\n- Дрібні та середні зморшки, зокрема навколо очей і губ\n- Нерівний рельєф, атрофічні рубці, наслідки акне\n- Розширені пори та втрату щільності шкіри\n- Нерівний тон і ознаки фотостаріння",
        ru: "Лазерная шлифовка — это контролируемое обновление кожи лучом CO₂-лазера с длиной волны 10 600 нм. Луч испаряет тонкий слой ткани в виде микроскопических колонок, оставляя неповреждённую кожу между ними. Именно эти участки и обеспечивают быстрое заживление.\n\nВ ответ на прогретый коллаген дерма запускает ремоделирование: синтезируются новые коллагеновые и эластиновые волокна. Через 4-8 недель кожа становится плотнее, рельеф выравнивается, тон светлеет.\n\nВ GENEVITY процедуру выполняют на аппарате AcuPulse от Lumenis. Врач выбирает плотность и глубину воздействия в зависимости от запроса — от деликатного поверхностного режима до глубокой проработки рубцов.\n\n**Что корректирует лазерная шлифовка:**\n- Мелкие и средние морщины, в том числе вокруг глаз и губ\n- Неровный рельеф, атрофические рубцы, последствия акне\n- Расширенные поры и потерю плотности кожи\n- Неровный тон и признаки фотостарения",
        en: "Laser resurfacing is a controlled renewal of the skin with a CO₂ laser beam at a wavelength of 10,600 nm. The beam vaporises a thin layer of tissue in microscopic columns and leaves intact skin between them. Those untouched areas are what allow rapid healing.\n\nIn response to the heated collagen, the dermis begins remodelling: new collagen and elastin fibres are synthesised. After 4-8 weeks the skin becomes denser, the texture evens out, and the tone lightens.\n\nAt GENEVITY the procedure is performed with the AcuPulse device by Lumenis. The doctor selects the density and depth of treatment according to your goal — from a gentle superficial mode to deep work on scars.\n\n**What laser resurfacing corrects:**\n- Fine and moderate wrinkles, including around the eyes and lips\n- Uneven texture, atrophic scars, the aftermath of acne\n- Enlarged pores and loss of skin density\n- Uneven tone and signs of photoageing",
      },
      calloutBody: {
        uk: "Лазерна шліфовка потребує планування: залежно від режиму відновлення триває від 3 до 14 днів. Найкращий сезон для процедури — осінь і зима, коли сонячна активність низька.",
        ru: "Лазерная шлифовка требует планирования: в зависимости от режима восстановление длится от 3 до 14 дней. Лучший сезон для процедуры — осень и зима, когда солнечная активность низкая.",
        en: "Laser resurfacing needs planning: depending on the mode, recovery takes 3 to 14 days. The best season for the procedure is autumn or winter, when sun exposure is low.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лазерної шліфовки", ru: "Показания к лазерной шлифовке", en: "Indications for Laser Resurfacing" },
      indications: [
        { uk: "Дрібні та середні зморшки, зокрема періорбітальна та періоральна зони", ru: "Мелкие и средние морщины, в том числе периорбитальная и периоральная зоны", en: "Fine and moderate wrinkles, including the periorbital and perioral areas" },
        { uk: "Нерівний рельєф шкіри, атрофічні рубці та сліди після акне", ru: "Неровный рельеф кожи, атрофические рубцы и следы после акне", en: "Uneven skin texture, atrophic scars, and marks left by acne" },
        { uk: "Розширені пори та себорейні зміни шкіри", ru: "Расширенные поры и себорейные изменения кожи", en: "Enlarged pores and seborrhoeic skin changes" },
        { uk: "Ознаки фотостаріння: тьмяність, нерівний тон, сонячні лентиго", ru: "Признаки фотостарения: тусклость, неровный тон, солнечные лентиго", en: "Signs of photoageing: dullness, uneven tone, solar lentigines" },
        { uk: "Втрата пружності та щільності шкіри обличчя, шиї, декольте", ru: "Потеря упругости и плотности кожи лица, шеи, декольте", en: "Loss of firmness and density on the face, neck, and décolletage" },
        { uk: "Рубці після травм і хірургічних втручань", ru: "Рубцы после травм и хирургических вмешательств", en: "Scars after injuries and surgical procedures" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Активні запальні процеси, герпес у стадії загострення", ru: "Активные воспалительные процессы, герпес в стадии обострения", en: "Active inflammation or a herpes flare-up" },
        { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "A tendency to form keloid scars" },
        { uk: "Прийом ізотретиноїну протягом останніх 6 місяців", ru: "Приём изотретиноина в течение последних 6 месяцев", en: "Isotretinoin taken within the last 6 months" },
        { uk: "Свіжа засмага та фотосенсибілізувальна терапія", ru: "Свежий загар и фотосенсибилизирующая терапия", en: "A fresh tan or photosensitising medication" },
        { uk: "Онкологічні захворювання, декомпенсований цукровий діабет", ru: "Онкологические заболевания, декомпенсированный сахарный диабет", en: "Oncological disease, uncontrolled diabetes" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура лазерної шліфовки", ru: "Как проходит процедура лазерной шлифовки", en: "How the Laser Resurfacing Procedure Works" },
      steps: [
        { title: { uk: "Консультація та вибір режиму", ru: "Консультация и выбор режима", en: "Consultation and mode selection" }, description: { uk: "Лікар оцінює тип і стан шкіри, визначає глибину та щільність впливу, узгоджує термін відновлення.", ru: "Врач оценивает тип и состояние кожи, определяет глубину и плотность воздействия, согласовывает срок восстановления.", en: "The doctor assesses your skin type and condition, sets the depth and density of treatment, and agrees the recovery window with you." } },
        { title: { uk: "Аплікаційна анестезія", ru: "Аппликационная анестезия", en: "Topical anaesthesia" }, description: { uk: "На очищену шкіру наносять анестетик на 30-40 хвилин — процедура проходить комфортно.", ru: "На очищенную кожу наносят анестетик на 30-40 минут — процедура проходит комфортно.", en: "An anaesthetic cream is applied to the cleansed skin for 30-40 minutes, so the procedure stays comfortable." } },
        { title: { uk: "Обробка лазером", ru: "Обработка лазером", en: "Laser pass" }, description: { uk: "Лікар послідовно опрацьовує зони. Сам вплив триває 15-25 хвилин, відчуття — коротке тепло та поколювання.", ru: "Врач последовательно обрабатывает зоны. Само воздействие длится 15-25 минут, ощущения — короткое тепло и покалывание.", en: "The doctor works through the zones one by one. The pass itself takes 15-25 minutes and feels like brief warmth and tingling." } },
        { title: { uk: "Охолодження та захист", ru: "Охлаждение и защита", en: "Cooling and protection" }, description: { uk: "Після обробки шкіру охолоджують і наносять відновлювальний засіб із бар'єрною дією.", ru: "После обработки кожу охлаждают и наносят восстанавливающее средство с барьерным действием.", en: "Afterwards the skin is cooled and a barrier-repair product is applied." } },
        { title: { uk: "Домашній догляд і контроль", ru: "Домашний уход и контроль", en: "Home care and follow-up" }, description: { uk: "Лікар складає протокол догляду на період загоєння та призначає контрольний огляд через 3-4 тижні.", ru: "Врач составляет протокол ухода на период заживления и назначает контрольный осмотр через 3-4 недели.", en: "The doctor writes a care protocol for the healing period and books a follow-up in 3-4 weeks." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги лазерної шліфовки в GENEVITY", ru: "Преимущества лазерной шлифовки в GENEVITY", en: "Benefits of Laser Resurfacing at GENEVITY" },
      items: [
        { uk: "CO₂-лазер AcuPulse від Lumenis — доказовий стандарт фракційної шліфовки", ru: "CO₂-лазер AcuPulse от Lumenis — доказательный стандарт фракционной шлифовки", en: "The AcuPulse CO₂ laser by Lumenis — the evidence-based standard for fractional resurfacing" },
        { uk: "Один апарат покриває і делікатне оновлення, і глибоку корекцію рубців", ru: "Один аппарат покрывает и деликатное обновление, и глубокую коррекцию рубцов", en: "One device covers both gentle renewal and deep scar correction" },
        { uk: "Прогнозований результат: щільність, рельєф і тон покращуються поступово протягом 2-3 місяців", ru: "Прогнозируемый результат: плотность, рельеф и тон улучшаются постепенно в течение 2-3 месяцев", en: "A predictable result: density, texture, and tone improve gradually over 2-3 months" },
        { uk: "Процедуру виконують лікарі-косметологи з досвідом роботи на CO₂-лазерах", ru: "Процедуру выполняют врачи-косметологи с опытом работы на CO₂-лазерах", en: "The procedure is performed by cosmetologists experienced with CO₂ lasers" },
        { uk: "Індивідуальний протокол відновлення та контрольний огляд після процедури", ru: "Индивидуальный протокол восстановления и контрольный осмотр после процедуры", en: "An individual recovery protocol and a follow-up appointment after the procedure" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Скільки триває відновлення після лазерної шліфовки?", ru: "Сколько длится восстановление после лазерной шлифовки?", en: "How long is recovery after laser resurfacing?" },
      answer: { uk: "Залежить від обраного режиму. Після поверхневої шліфовки почервоніння та легке лущення тривають 3-5 днів. Після глибокого опрацювання рубців період відновлення може сягати 10-14 днів. Лікар заздалегідь називає точний термін, щоб ви могли спланувати процедуру.", ru: "Зависит от выбранного режима. После поверхностной шлифовки покраснение и лёгкое шелушение длятся 3-5 дней. После глубокой проработки рубцов период восстановления может достигать 10-14 дней. Врач заранее называет точный срок, чтобы вы могли спланировать процедуру.", en: "It depends on the mode chosen. After superficial resurfacing, redness and light flaking last 3-5 days. After deep work on scars, recovery can take 10-14 days. The doctor tells you the exact timeframe in advance so you can plan around it." },
    },
    {
      question: { uk: "Скільки процедур лазерної шліфовки потрібно?", ru: "Сколько процедур лазерной шлифовки нужно?", en: "How many laser resurfacing sessions are needed?" },
      answer: { uk: "Для оновлення тону та рельєфу зазвичай достатньо однієї процедури. Для корекції виражених рубців або глибоких зморшок призначають курс із 2-3 сеансів з інтервалом 6-8 тижнів. Остаточний план лікар складає після огляду шкіри.", ru: "Для обновления тона и рельефа обычно достаточно одной процедуры. Для коррекции выраженных рубцов или глубоких морщин назначают курс из 2-3 сеансов с интервалом 6-8 недель. Окончательный план врач составляет после осмотра кожи.", en: "One session is usually enough to refresh tone and texture. For pronounced scars or deep wrinkles, a course of 2-3 sessions 6-8 weeks apart is prescribed. The doctor finalises the plan after examining your skin." },
    },
    {
      question: { uk: "Чи боляче робити лазерну шліфовку обличчя?", ru: "Больно ли делать лазерную шлифовку лица?", en: "Is laser resurfacing painful?" },
      answer: { uk: "Процедуру проводять під аплікаційною анестезією, тому вона переноситься комфортно. Пацієнти описують відчуття як тепло та легке поколювання. Протягом кількох годин після сеансу може зберігатися відчуття, схоже на сонячний опік, — його знімає охолодження та засоби, які призначає лікар.", ru: "Процедуру проводят под аппликационной анестезией, поэтому она переносится комфортно. Пациенты описывают ощущения как тепло и лёгкое покалывание. В течение нескольких часов после сеанса может сохраняться ощущение, похожее на солнечный ожог, — его снимает охлаждение и средства, которые назначает врач.", en: "The procedure is done under topical anaesthesia, so it is comfortable. Patients describe the sensation as warmth with light tingling. For a few hours afterwards the skin can feel like mild sunburn; cooling and the products your doctor prescribes settle it." },
    },
  ],
},

// ─── 2. ЛАЗЕРНА ШЛІФОВКА ПОСТАКНЕ ───────────────────────────────────────────
{
  slug: "laser-resurfacing-post-acne",
  title: { uk: "Лазерна шліфовка постакне", ru: "Лазерная шлифовка постакне", en: "Laser Post-Acne Resurfacing" },
  h1: { uk: "Лазерна шліфовка постакне в Дніпрі", ru: "Лазерная шлифовка постакне в Днепре", en: "Laser post-acne resurfacing in Dnipro" },
  summary: {
    uk: "Лазерна шліфовка постакне в GENEVITY — фракційне опрацювання атрофічних рубців і слідів від висипань на CO₂-лазері AcuPulse. Вирівнює рельєф, освітлює пігментні плями після акне, повертає шкірі гладкість. Дніпро.",
    ru: "Лазерная шлифовка постакне в GENEVITY — фракционная проработка атрофических рубцов и следов от высыпаний на CO₂-лазере AcuPulse. Выравнивает рельеф, осветляет пигментные пятна после акне, возвращает коже гладкость. Днепр.",
    en: "Laser post-acne resurfacing at GENEVITY is fractional treatment of atrophic scars and blemish marks with the AcuPulse CO₂ laser. It levels the texture, lightens post-acne pigmentation, and restores smoothness. Dnipro.",
  },
  procedureLength: { uk: "40-60 хвилин", ru: "40-60 минут", en: "40-60 minutes" },
  effectDuration: { uk: "Стійкий результат", ru: "Стойкий результат", en: "Long-lasting result" },
  sessionsRecommended: { uk: "2-4 процедури", ru: "2-4 процедуры", en: "2-4 treatments" },
  equipment: [EQ_ACUPULSE],
  related: ["acne-treatment", "laser-resurfacing", "acupulse-co2"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Як лазер працює з рубцями постакне", ru: "Как лазер работает с рубцами постакне", en: "How the Laser Works on Post-Acne Scars" },
      body: {
        uk: "Постакне — це не лише плями, а й зміна структури дерми. Після глибокого запалення частина колагену руйнується, і на її місці утворюються атрофічні рубці типу ice-pick, boxcar та rolling. Косметика такий дефект не прибирає: працювати потрібно з самою дермою.\n\nФракційний CO₂-лазер створює в тканині мікроколонки абляції на заданій глибині. Навколо кожної з них формується зона теплового впливу, яка запускає синтез нового колагену. Рубцева тканина поступово заміщується впорядкованою — дно рубця піднімається, краї згладжуються.\n\nПаралельно лазер працює з постзапальною пігментацією: оновлення епідермісу освітлює темні плями, що залишилися після висипань.\n\n**Реалістичні очікування:**\n- Атрофічні рубці згладжуються на 50-80% за курс\n- Найкраще відповідають на лікування rolling- і boxcar-рубці\n- Глибокі ice-pick-рубці потребують більшої кількості сеансів\n- Результат розкривається поступово протягом 3-6 місяців",
        ru: "Постакне — это не только пятна, но и изменение структуры дермы. После глубокого воспаления часть коллагена разрушается, и на её месте образуются атрофические рубцы типа ice-pick, boxcar и rolling. Косметика такой дефект не убирает: работать нужно с самой дермой.\n\nФракционный CO₂-лазер создаёт в ткани микроколонки абляции на заданной глубине. Вокруг каждой из них формируется зона теплового воздействия, которая запускает синтез нового коллагена. Рубцовая ткань постепенно замещается упорядоченной — дно рубца поднимается, края сглаживаются.\n\nПараллельно лазер работает с поствоспалительной пигментацией: обновление эпидермиса осветляет тёмные пятна, оставшиеся после высыпаний.\n\n**Реалистичные ожидания:**\n- Атрофические рубцы сглаживаются на 50-80% за курс\n- Лучше всего отвечают на лечение rolling- и boxcar-рубцы\n- Глубокие ice-pick-рубцы требуют большего количества сеансов\n- Результат раскрывается постепенно в течение 3-6 месяцев",
        en: "Post-acne is more than marks — it is a change in the structure of the dermis. After deep inflammation part of the collagen is destroyed, and atrophic scars of the ice-pick, boxcar, and rolling types form in its place. Cosmetics cannot remove this: the work has to happen in the dermis itself.\n\nA fractional CO₂ laser creates microscopic ablation columns in the tissue at a set depth. A zone of thermal effect forms around each one and triggers the synthesis of new collagen. Scar tissue is gradually replaced by ordered tissue — the floor of the scar lifts and its edges soften.\n\nAt the same time the laser addresses post-inflammatory pigmentation: renewing the epidermis lightens the dark marks left by breakouts.\n\n**Realistic expectations:**\n- Atrophic scars soften by 50-80% over a course\n- Rolling and boxcar scars respond best\n- Deep ice-pick scars need more sessions\n- The result unfolds gradually over 3-6 months",
      },
      calloutBody: {
        uk: "Шліфовку постакне проводять лише після того, як активні висипання під контролем. Якщо акне ще в активній фазі, лікар спершу призначає лікування — інакше нові запалення дадуть нові рубці.",
        ru: "Шлифовку постакне проводят только после того, как активные высыпания под контролем. Если акне ещё в активной фазе, врач сначала назначает лечение — иначе новые воспаления дадут новые рубцы.",
        en: "Post-acne resurfacing is only done once active breakouts are under control. If acne is still active, the doctor treats that first — otherwise new inflammation will create new scars.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лазерної шліфовки постакне", ru: "Показания к лазерной шлифовке постакне", en: "Indications for Laser Post-Acne Resurfacing" },
      indications: [
        { uk: "Атрофічні рубці постакне на обличчі, спині, грудях", ru: "Атрофические рубцы постакне на лице, спине, груди", en: "Atrophic post-acne scars on the face, back, and chest" },
        { uk: "Нерівний рельєф шкіри після тривалого перебігу акне", ru: "Неровный рельеф кожи после длительного течения акне", en: "Uneven skin texture after long-standing acne" },
        { uk: "Постзапальна пігментація та застійні плями", ru: "Поствоспалительная пигментация и застойные пятна", en: "Post-inflammatory pigmentation and lingering red marks" },
        { uk: "Розширені пори в зонах, де раніше були висипання", ru: "Расширенные поры в зонах, где ранее были высыпания", en: "Enlarged pores in areas that previously had breakouts" },
        { uk: "Ущільнення та фіброзні зміни після глибоких вузлів", ru: "Уплотнения и фиброзные изменения после глубоких узлов", en: "Induration and fibrotic changes after deep nodules" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Активна запальна фаза акне", ru: "Активная воспалительная фаза акне", en: "An active inflammatory phase of acne" },
        { uk: "Прийом ізотретиноїну протягом останніх 6 місяців", ru: "Приём изотретиноина в течение последних 6 месяцев", en: "Isotretinoin taken within the last 6 months" },
        { uk: "Схильність до келоїдних і гіпертрофічних рубців", ru: "Склонность к келоидным и гипертрофическим рубцам", en: "A tendency to keloid or hypertrophic scarring" },
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Свіжа засмага, герпес у стадії загострення", ru: "Свежий загар, герпес в стадии обострения", en: "A fresh tan or a herpes flare-up" },
        { uk: "Порушення згортання крові, декомпенсований цукровий діабет", ru: "Нарушения свёртывания крови, декомпенсированный сахарный диабет", en: "Clotting disorders, uncontrolled diabetes" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить лікування постакне лазером", ru: "Как проходит лечение постакне лазером", en: "How Laser Post-Acne Treatment Works" },
      steps: [
        { title: { uk: "Оцінка типу рубців", ru: "Оценка типа рубцов", en: "Assessing the scar type" }, description: { uk: "Лікар визначає тип і глибину рубців, стан шкіри та наявність активних висипань, фіксує вихідні фото.", ru: "Врач определяет тип и глубину рубцов, состояние кожи и наличие активных высыпаний, фиксирует исходные фото.", en: "The doctor identifies the type and depth of the scars, the skin condition, and any active breakouts, and takes baseline photos." } },
        { title: { uk: "Підготовка шкіри", ru: "Подготовка кожи", en: "Preparing the skin" }, description: { uk: "За потреби призначається домашній догляд за 2-4 тижні до процедури, щоб знизити ризик пігментації.", ru: "При необходимости назначается домашний уход за 2-4 недели до процедуры, чтобы снизить риск пигментации.", en: "If needed, home care is prescribed 2-4 weeks before the session to lower the risk of pigmentation." } },
        { title: { uk: "Анестезія та обробка", ru: "Анестезия и обработка", en: "Anaesthesia and the laser pass" }, description: { uk: "Після аплікаційної анестезії лікар опрацьовує зони рубців із підвищеною щільністю, решту шкіри — у м'якшому режимі.", ru: "После аппликационной анестезии врач прорабатывает зоны рубцов с повышенной плотностью, остальную кожу — в более мягком режиме.", en: "After topical anaesthesia the doctor treats the scarred areas at a higher density and the surrounding skin in a gentler mode." } },
        { title: { uk: "Період загоєння", ru: "Период заживления", en: "The healing period" }, description: { uk: "5-10 днів шкіра відновлюється: почервоніння, лущення, відчуття стягнутості. Догляд за протоколом лікаря.", ru: "5-10 дней кожа восстанавливается: покраснение, шелушение, ощущение стянутости. Уход по протоколу врача.", en: "The skin recovers over 5-10 days with redness, flaking, and tightness. Care follows the doctor's protocol." } },
        { title: { uk: "Повторні сеанси", ru: "Повторные сеансы", en: "Repeat sessions" }, description: { uk: "Наступну процедуру проводять через 6-8 тижнів. Кількість сеансів залежить від глибини рубців.", ru: "Следующую процедуру проводят через 6-8 недель. Количество сеансов зависит от глубины рубцов.", en: "The next session follows in 6-8 weeks. The number of sessions depends on how deep the scars are." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Чому шліфовку постакне варто робити в GENEVITY", ru: "Почему шлифовку постакне стоит делать в GENEVITY", en: "Why Choose GENEVITY for Post-Acne Resurfacing" },
      items: [
        { uk: "Роботу з рубцями ведуть лікарі-косметологи, а не майстри без медичної освіти", ru: "Работу с рубцами ведут врачи-косметологи, а не мастера без медицинского образования", en: "Scar work is done by medical cosmetologists, not by technicians without medical training" },
        { uk: "Перед курсом оцінюємо, чи контрольоване акне, і за потреби підключаємо дерматолога", ru: "Перед курсом оцениваем, контролируемо ли акне, и при необходимости подключаем дерматолога", en: "Before the course we check whether the acne is controlled and involve a dermatologist if necessary" },
        { uk: "Різна щільність впливу на рубцях і на здоровій шкірі — точніший результат", ru: "Разная плотность воздействия на рубцах и на здоровой коже — более точный результат", en: "Different treatment densities on scars and healthy skin give a more precise result" },
        { uk: "Фотофіксація до і після кожного сеансу для об'єктивної оцінки динаміки", ru: "Фотофиксация до и после каждого сеанса для объективной оценки динамики", en: "Before-and-after photos at every session for an objective view of progress" },
        { uk: "Персональний протокол відновлення та SPF-супровід після процедури", ru: "Персональный протокол восстановления и SPF-сопровождение после процедуры", en: "A personal recovery protocol and SPF guidance after the procedure" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи можна повністю прибрати рубці постакне лазером?", ru: "Можно ли полностью убрать рубцы постакне лазером?", en: "Can post-acne scars be removed completely with a laser?" },
      answer: { uk: "Повністю відновити початкову структуру шкіри неможливо — це чесна відповідь. Але фракційна шліфовка згладжує атрофічні рубці на 50-80% за повний курс, і візуально шкіра виглядає рівною. Найкраще відповідають rolling- і boxcar-рубці, глибокі ice-pick потребують більшої кількості сеансів або комбінації методик.", ru: "Полностью восстановить исходную структуру кожи невозможно — это честный ответ. Но фракционная шлифовка сглаживает атрофические рубцы на 50-80% за полный курс, и визуально кожа выглядит ровной. Лучше всего отвечают rolling- и boxcar-рубцы, глубокие ice-pick требуют большего количества сеансов или комбинации методик.", en: "Restoring the original structure of the skin completely is not possible — that is the honest answer. But over a full course fractional resurfacing softens atrophic scars by 50-80%, and the skin visually reads as even. Rolling and boxcar scars respond best; deep ice-pick scars need more sessions or a combination of methods." },
    },
    {
      question: { uk: "Через скільки часу після акне можна робити шліфовку?", ru: "Через сколько времени после акне можно делать шлифовку?", en: "How long after acne can resurfacing be done?" },
      answer: { uk: "Коли активних запальних елементів немає щонайменше 3 місяці, а стан шкіри стабільний. Якщо ви приймали ізотретиноїн, потрібно витримати паузу 6 місяців після завершення курсу. Точний момент старту визначає лікар на консультації.", ru: "Когда активных воспалительных элементов нет минимум 3 месяца, а состояние кожи стабильно. Если вы принимали изотретиноин, нужно выдержать паузу 6 месяцев после завершения курса. Точный момент старта определяет врач на консультации.", en: "Once there have been no active inflammatory lesions for at least 3 months and the skin is stable. If you have taken isotretinoin, a 6-month pause after finishing the course is required. The doctor sets the exact starting point at your consultation." },
    },
    {
      question: { uk: "Скільки коштує лазерна шліфовка постакне в Дніпрі?", ru: "Сколько стоит лазерная шлифовка постакне в Днепре?", en: "How much does laser post-acne resurfacing cost in Dnipro?" },
      answer: { uk: "Вартість залежить від площі обробки та кількості сеансів у курсі. Точну ціну лікар називає на консультації після огляду шкіри й оцінки типу рубців — тоді ж ви отримуєте план курсу з кількістю процедур та інтервалами. Актуальні ціни є в розділі «Ціни».", ru: "Стоимость зависит от площади обработки и количества сеансов в курсе. Точную цену врач называет на консультации после осмотра кожи и оценки типа рубцов — тогда же вы получаете план курса с количеством процедур и интервалами. Актуальные цены есть в разделе «Цены».", en: "The cost depends on the treatment area and the number of sessions in the course. The doctor gives you the exact price at the consultation after examining your skin and assessing the scar type, along with a course plan setting out the sessions and intervals. Current prices are listed in the Prices section." },
    },
  ],
},

// ─── 3. ЛАЗЕРНИЙ ПІЛІНГ ─────────────────────────────────────────────────────
{
  slug: "laser-peel",
  title: { uk: "Лазерний пілінг", ru: "Лазерный пилинг", en: "Laser Peel" },
  h1: { uk: "Лазерний пілінг в Дніпрі", ru: "Лазерный пилинг в Днепре", en: "Laser peel in Dnipro" },
  summary: {
    uk: "Лазерний пілінг обличчя в GENEVITY — делікатне поверхневе оновлення шкіри лазером. Освіжає тон, згладжує дрібні нерівності та звужує пори з мінімальним періодом відновлення. Дніпро, вул. Олеся Гончара.",
    ru: "Лазерный пилинг лица в GENEVITY — деликатное поверхностное обновление кожи лазером. Освежает тон, сглаживает мелкие неровности и сужает поры с минимальным периодом восстановления. Днепр, ул. Олеся Гончара.",
    en: "A laser peel at GENEVITY is a gentle superficial renewal of the skin. It refreshes tone, smooths fine irregularities, and tightens pores with minimal downtime. Dnipro, Olesia Honchara street.",
  },
  procedureLength: { uk: "30-45 хвилин", ru: "30-45 минут", en: "30-45 minutes" },
  effectDuration: { uk: "6-12 місяців", ru: "6-12 месяцев", en: "6-12 months" },
  sessionsRecommended: { uk: "3-4 процедури", ru: "3-4 процедуры", en: "3-4 treatments" },
  equipment: [EQ_ACUPULSE],
  related: ["laser-resurfacing", "hydrafacial", "laser-rejuvenation"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Чим лазерний пілінг відрізняється від хімічного", ru: "Чем лазерный пилинг отличается от химического", en: "How a Laser Peel Differs from a Chemical Peel" },
      body: {
        uk: "Хімічний пілінг знімає роговий шар кислотою, і глибина впливу залежить від концентрації та часу експозиції. Лазерний пілінг працює інакше: промінь випаровує рівно той шар епідермісу, який задав лікар, з точністю до мікронів.\n\nЦе дає дві переваги. По-перше, передбачуваність: однакова глибина по всій площі, без «плям» надто сильного впливу. По-друге, паралельне прогрівання дерми, якого хімічний пілінг не дає, — тобто крім оновлення поверхні ви отримуєте м'яку стимуляцію колагену.\n\nЛазерний пілінг — це поверхнева процедура. Він не замінює шліфовку в роботі з рубцями чи глибокими зморшками, але ідеально підходить, коли потрібен свіжий тон, гладкість і зменшення пор без довгого відновлення.\n\n**Що дає курс лазерного пілінгу:**\n- Рівний, посвітлілий тон обличчя\n- Гладку текстуру та звужені пори\n- Зменшення дрібних нерівностей і поверхневої пігментації\n- Кращу проникність доглядової косметики",
        ru: "Химический пилинг снимает роговой слой кислотой, и глубина воздействия зависит от концентрации и времени экспозиции. Лазерный пилинг работает иначе: луч испаряет ровно тот слой эпидермиса, который задал врач, с точностью до микрон.\n\nЭто даёт два преимущества. Во-первых, предсказуемость: одинаковая глубина по всей площади, без «пятен» слишком сильного воздействия. Во-вторых, параллельный прогрев дермы, которого химический пилинг не даёт, — то есть кроме обновления поверхности вы получаете мягкую стимуляцию коллагена.\n\nЛазерный пилинг — это поверхностная процедура. Он не заменяет шлифовку в работе с рубцами или глубокими морщинами, но идеально подходит, когда нужен свежий тон, гладкость и уменьшение пор без долгого восстановления.\n\n**Что даёт курс лазерного пилинга:**\n- Ровный, посветлевший тон лица\n- Гладкую текстуру и суженные поры\n- Уменьшение мелких неровностей и поверхностной пигментации\n- Лучшую проницаемость ухаживающей косметики",
        en: "A chemical peel removes the horny layer with acid, and the depth depends on concentration and exposure time. A laser peel works differently: the beam vaporises exactly the layer of epidermis the doctor sets, accurate to microns.\n\nThat brings two advantages. First, predictability — the same depth across the whole area, with no patches of over-treatment. Second, simultaneous heating of the dermis, which a chemical peel does not provide, so alongside surface renewal you get gentle collagen stimulation.\n\nA laser peel is a superficial procedure. It does not replace resurfacing for scars or deep wrinkles, but it is ideal when you want fresh tone, smoothness, and smaller pores without long downtime.\n\n**What a course of laser peels gives you:**\n- An even, brighter facial tone\n- Smooth texture and tightened pores\n- Fewer fine irregularities and less superficial pigmentation\n- Better absorption of your skincare products",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лазерного пілінгу", ru: "Показания к лазерному пилингу", en: "Indications for a Laser Peel" },
      indications: [
        { uk: "Тьмяний, нерівний тон обличчя", ru: "Тусклый, неровный тон лица", en: "A dull, uneven facial tone" },
        { uk: "Розширені пори та жирний блиск", ru: "Расширенные поры и жирный блеск", en: "Enlarged pores and excess shine" },
        { uk: "Дрібні нерівності рельєфу та шорсткість шкіри", ru: "Мелкие неровности рельефа и шероховатость кожи", en: "Fine textural irregularities and rough skin" },
        { uk: "Поверхнева пігментація та сліди після висипань", ru: "Поверхностная пигментация и следы после высыпаний", en: "Superficial pigmentation and marks left by breakouts" },
        { uk: "Перші ознаки в'янення шкіри, дрібні зморшки", ru: "Первые признаки увядания кожи, мелкие морщины", en: "Early signs of skin ageing and fine lines" },
        { uk: "Підготовка шкіри до події, коли потрібен швидкий і безпечний ефект", ru: "Подготовка кожи к событию, когда нужен быстрый и безопасный эффект", en: "Preparing the skin for an event, when you need a quick, safe result" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Активні запальні елементи та герпес у стадії загострення", ru: "Активные воспалительные элементы и герпес в стадии обострения", en: "Active inflammatory lesions or a herpes flare-up" },
        { uk: "Свіжа засмага та фотосенсибілізувальна терапія", ru: "Свежий загар и фотосенсибилизирующая терапия", en: "A fresh tan or photosensitising medication" },
        { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "A tendency to form keloid scars" },
        { uk: "Прийом ізотретиноїну протягом останніх 6 місяців", ru: "Приём изотретиноина в течение последних 6 месяцев", en: "Isotretinoin taken within the last 6 months" },
        { uk: "Онкологічні захворювання, гострі інфекційні стани", ru: "Онкологические заболевания, острые инфекционные состояния", en: "Oncological disease or acute infection" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура лазерного пілінгу обличчя", ru: "Как проходит процедура лазерного пилинга лица", en: "How the Laser Peel Procedure Works" },
      steps: [
        { title: { uk: "Огляд і визначення глибини", ru: "Осмотр и определение глубины", en: "Examination and depth setting" }, description: { uk: "Лікар оцінює фототип, товщину та чутливість шкіри й задає параметри поверхневого впливу.", ru: "Врач оценивает фототип, толщину и чувствительность кожи и задаёт параметры поверхностного воздействия.", en: "The doctor assesses your phototype, skin thickness, and sensitivity, then sets the parameters for the superficial pass." } },
        { title: { uk: "Очищення шкіри", ru: "Очищение кожи", en: "Cleansing" }, description: { uk: "Демакіяж і знежирення. Аплікаційна анестезія за потреби — здебільшого пілінг переноситься без неї.", ru: "Демакияж и обезжиривание. Аппликационная анестезия при необходимости — в основном пилинг переносится без неё.", en: "Make-up removal and degreasing. Topical anaesthesia if needed — most people tolerate the peel without it." } },
        { title: { uk: "Лазерний прохід", ru: "Лазерный проход", en: "The laser pass" }, description: { uk: "Обробка займає 10-20 хвилин. Відчуття — тепло та легке поколювання, без болю.", ru: "Обработка занимает 10-20 минут. Ощущения — тепло и лёгкое покалывание, без боли.", en: "The pass takes 10-20 minutes and feels like warmth and light tingling, without pain." } },
        { title: { uk: "Заспокійливий догляд", ru: "Успокаивающий уход", en: "Soothing care" }, description: { uk: "Наносять зволожувальну маску та SPF. Виходити з клініки можна одразу.", ru: "Наносят увлажняющую маску и SPF. Выходить из клиники можно сразу.", en: "A hydrating mask and SPF are applied. You can leave the clinic straight away." } },
        { title: { uk: "Курс і підтримка", ru: "Курс и поддержка", en: "Course and maintenance" }, description: { uk: "Оптимально 3-4 процедури з інтервалом 3-4 тижні, далі — підтримка 1-2 рази на рік.", ru: "Оптимально 3-4 процедуры с интервалом 3-4 недели, далее — поддержка 1-2 раза в год.", en: "Typically 3-4 sessions 3-4 weeks apart, then maintenance once or twice a year." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги лазерного пілінгу", ru: "Преимущества лазерного пилинга", en: "Benefits of a Laser Peel" },
      items: [
        { uk: "Мінімальний період відновлення — легке лущення 2-3 дні", ru: "Минимальный период восстановления — лёгкое шелушение 2-3 дня", en: "Minimal downtime — light flaking for 2-3 days" },
        { uk: "Точно контрольована глибина, однакова по всій площі обробки", ru: "Точно контролируемая глубина, одинаковая по всей площади обработки", en: "Precisely controlled depth, identical across the whole treated area" },
        { uk: "Оновлення поверхні та м'яка стимуляція колагену в одній процедурі", ru: "Обновление поверхности и мягкая стимуляция коллагена в одной процедуре", en: "Surface renewal and gentle collagen stimulation in a single treatment" },
        { uk: "Підходить для обличчя, шиї, декольте та кистей рук", ru: "Подходит для лица, шеи, декольте и кистей рук", en: "Suitable for the face, neck, décolletage, and hands" },
        { uk: "Добре поєднується з ін'єкційними методиками в комплексному протоколі", ru: "Хорошо сочетается с инъекционными методиками в комплексном протоколе", en: "Combines well with injectable methods within a comprehensive protocol" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Скільки триває відновлення після лазерного пілінгу?", ru: "Сколько длится восстановление после лазерного пилинга?", en: "How long is recovery after a laser peel?" },
      answer: { uk: "Одразу після процедури шкіра рожевіє — це минає за кілька годин. На 2-3 день з'являється легке лущення, яке добре маскується зволожувальним кремом. До звичного ритму життя можна повертатися того ж дня, декоративну косметику зазвичай дозволяють через 24-48 годин.", ru: "Сразу после процедуры кожа розовеет — это проходит за несколько часов. На 2-3 день появляется лёгкое шелушение, которое хорошо маскируется увлажняющим кремом. К привычному ритму жизни можно возвращаться в тот же день, декоративную косметику обычно разрешают через 24-48 часов.", en: "The skin looks pink immediately after the session, which settles within a few hours. Light flaking appears on days 2-3 and is easily masked with a moisturiser. You can return to your normal routine the same day; make-up is usually allowed after 24-48 hours." },
    },
    {
      question: { uk: "Скільки процедур лазерного пілінгу потрібно для результату?", ru: "Сколько процедур лазерного пилинга нужно для результата?", en: "How many laser peel sessions are needed?" },
      answer: { uk: "Свіжість тону помітна вже після першої процедури. Стійке покращення текстури та звуження пор дає курс із 3-4 сеансів з інтервалом 3-4 тижні. Далі результат підтримують однією-двома процедурами на рік.", ru: "Свежесть тона заметна уже после первой процедуры. Стойкое улучшение текстуры и сужение пор даёт курс из 3-4 сеансов с интервалом 3-4 недели. Далее результат поддерживают одной-двумя процедурами в год.", en: "Fresher tone is visible after the very first session. Lasting improvement in texture and pore size comes from a course of 3-4 sessions 3-4 weeks apart. After that, one or two sessions a year maintain the result." },
    },
    {
      question: { uk: "У яку пору року краще робити лазерний пілінг?", ru: "В какое время года лучше делать лазерный пилинг?", en: "What time of year is best for a laser peel?" },
      answer: { uk: "Класично — з жовтня до березня, коли сонячна активність низька. Влітку процедуру теж проводять, але за умови суворого SPF-захисту 50+ і відмови від прямого сонця та солярію на 3-4 тижні. Рішення ухвалює лікар з огляду на ваш фототип.", ru: "Классически — с октября по март, когда солнечная активность низкая. Летом процедуру тоже проводят, но при условии строгой SPF-защиты 50+ и отказа от прямого солнца и солярия на 3-4 недели. Решение принимает врач с учётом вашего фототипа.", en: "Classically from October to March, when sun exposure is low. It can also be done in summer, provided you use strict SPF 50+ and avoid direct sun and sunbeds for 3-4 weeks. The doctor decides based on your phototype." },
    },
  ],
},

// ─── 4. ЛІКУВАННЯ КУПЕРОЗУ ──────────────────────────────────────────────────
{
  slug: "couperose-treatment",
  title: { uk: "Лікування куперозу", ru: "Лечение купероза", en: "Couperose Treatment" },
  h1: { uk: "Лікування куперозу в Дніпрі", ru: "Лечение купероза в Днепре", en: "Couperose treatment in Dnipro" },
  summary: {
    uk: "Лікування куперозу в GENEVITY — видалення судинних зірочок і розширених капілярів на платформі M22 Stellar Black. Судина коагулюється зсередини й розсмоктується, шкіра повертає рівний колір. Дніпро.",
    ru: "Лечение купероза в GENEVITY — удаление сосудистых звёздочек и расширенных капилляров на платформе M22 Stellar Black. Сосуд коагулируется изнутри и рассасывается, кожа возвращает ровный цвет. Днепр.",
    en: "Couperose treatment at GENEVITY removes spider veins and dilated capillaries with the M22 Stellar Black platform. The vessel is coagulated from within and reabsorbed, and the skin regains an even colour. Dnipro.",
  },
  procedureLength: { uk: "20-40 хвилин", ru: "20-40 минут", en: "20-40 minutes" },
  effectDuration: { uk: "Стійкий результат", ru: "Стойкий результат", en: "Long-lasting result" },
  sessionsRecommended: { uk: "2-4 процедури", ru: "2-4 процедуры", en: "2-4 treatments" },
  equipment: [EQ_M22],
  related: ["rosacea-treatment", "m22-stellar-black", "photorejuvenation"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Що таке купероз і чому його лікують лазером", ru: "Что такое купероз и почему его лечат лазером", en: "What Couperose Is and Why It Is Treated with a Laser" },
      body: {
        uk: "Купероз — це стійке розширення поверхневих судин шкіри. Капіляри втрачають тонус, залишаються розширеними постійно й просвічують крізь епідерміс у вигляді червоних ниточок, зірочок або дифузного почервоніння на щоках, крилах носа та підборідді.\n\nКосметика цю проблему не вирішує: звузити судину, яка вже втратила еластичність, кремом неможливо. Працює тільки методика, що впливає безпосередньо на судинну стінку.\n\nСелективний фототерміліз робить саме це. Світлова енергія поглинається гемоглобіном усередині судини, кров нагрівається, стінка склеюється, і судина перестає наповнюватися. Протягом наступних тижнів організм виводить її природним шляхом. Навколишня шкіра при цьому не ушкоджується.\n\nУ GENEVITY судинні дефекти опрацьовують на платформі M22 Stellar Black від Lumenis із системою фільтрів для точного добору довжини хвилі.\n\n**Що прибирає процедура:**\n- Судинні зірочки (телеангіектазії) на обличчі\n- Червоні капілярні сітки на крилах носа та щоках\n- Стійке дифузне почервоніння шкіри\n- Поодинокі розширені судини на шиї та декольте",
        ru: "Купероз — это стойкое расширение поверхностных сосудов кожи. Капилляры теряют тонус, остаются расширенными постоянно и просвечивают сквозь эпидермис в виде красных ниточек, звёздочек или диффузного покраснения на щеках, крыльях носа и подбородке.\n\nКосметика эту проблему не решает: сузить сосуд, который уже потерял эластичность, кремом невозможно. Работает только методика, воздействующая непосредственно на сосудистую стенку.\n\nСелективный фототермолиз делает именно это. Световая энергия поглощается гемоглобином внутри сосуда, кровь нагревается, стенка склеивается, и сосуд перестаёт наполняться. В течение следующих недель организм выводит его естественным путём. Окружающая кожа при этом не повреждается.\n\nВ GENEVITY сосудистые дефекты прорабатывают на платформе M22 Stellar Black от Lumenis с системой фильтров для точного подбора длины волны.\n\n**Что убирает процедура:**\n- Сосудистые звёздочки (телеангиэктазии) на лице\n- Красные капиллярные сетки на крыльях носа и щеках\n- Стойкое диффузное покраснение кожи\n- Одиночные расширенные сосуды на шее и декольте",
        en: "Couperose is a persistent dilation of the superficial vessels of the skin. Capillaries lose their tone, stay permanently dilated, and show through the epidermis as red threads, spider veins, or diffuse redness on the cheeks, nostrils, and chin.\n\nSkincare does not solve this: no cream can constrict a vessel that has already lost its elasticity. Only a method acting directly on the vessel wall works.\n\nSelective photothermolysis does exactly that. Light energy is absorbed by the haemoglobin inside the vessel, the blood heats up, the wall seals, and the vessel stops filling. Over the following weeks the body clears it naturally. The surrounding skin is left undamaged.\n\nAt GENEVITY vascular lesions are treated on the M22 Stellar Black platform by Lumenis, with a filter system for precise wavelength selection.\n\n**What the procedure removes:**\n- Facial spider veins (telangiectasias)\n- Red capillary networks on the nostrils and cheeks\n- Persistent diffuse redness\n- Isolated dilated vessels on the neck and décolletage",
      },
      calloutBody: {
        uk: "Купероз має схильність повертатися, якщо тригери зберігаються: різкі перепади температур, алкоголь, гострі страви, сонце без захисту. Лікар обов'язково обговорює з вами профілактику — без неї результат тримається менше.",
        ru: "Купероз имеет склонность возвращаться, если триггеры сохраняются: резкие перепады температур, алкоголь, острые блюда, солнце без защиты. Врач обязательно обсуждает с вами профилактику — без неё результат держится меньше.",
        en: "Couperose tends to return if the triggers remain: sharp temperature changes, alcohol, spicy food, unprotected sun. The doctor always discusses prevention with you — without it the result lasts less time.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лікування куперозу", ru: "Показания к лечению купероза", en: "Indications for Couperose Treatment" },
      indications: [
        { uk: "Судинні зірочки та телеангіектазії на обличчі", ru: "Сосудистые звёздочки и телеангиэктазии на лице", en: "Spider veins and telangiectasias on the face" },
        { uk: "Розширені капіляри на крилах носа, щоках, підборідді", ru: "Расширенные капилляры на крыльях носа, щеках, подбородке", en: "Dilated capillaries on the nostrils, cheeks, and chin" },
        { uk: "Стійке почервоніння шкіри, схильність до припливів", ru: "Стойкое покраснение кожи, склонность к приливам", en: "Persistent redness and a tendency to flushing" },
        { uk: "Судинна сітка на шиї та в зоні декольте", ru: "Сосудистая сетка на шее и в зоне декольте", en: "Vascular networks on the neck and décolletage" },
        { uk: "Гемангіоми та винні плями невеликої площі", ru: "Гемангиомы и винные пятна небольшой площади", en: "Small haemangiomas and port-wine stains" },
        { uk: "Чутлива шкіра з ослабленою судинною стінкою", ru: "Чувствительная кожа с ослабленной сосудистой стенкой", en: "Sensitive skin with a weakened vessel wall" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Свіжа засмага, зокрема після солярію", ru: "Свежий загар, в том числе после солярия", en: "A fresh tan, including from a sunbed" },
        { uk: "Прийом фотосенсибілізувальних препаратів", ru: "Приём фотосенсибилизирующих препаратов", en: "Taking photosensitising medication" },
        { uk: "Активне запалення або інфекція в зоні обробки", ru: "Активное воспаление или инфекция в зоне обработки", en: "Active inflammation or infection in the treatment area" },
        { uk: "Порушення згортання крові, прийом антикоагулянтів", ru: "Нарушения свёртывания крови, приём антикоагулянтов", en: "Clotting disorders or anticoagulant therapy" },
        { uk: "Онкологічні захворювання, епілепсія", ru: "Онкологические заболевания, эпилепсия", en: "Oncological disease, epilepsy" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить видалення куперозу лазером", ru: "Как проходит удаление купероза лазером", en: "How Laser Couperose Removal Works" },
      steps: [
        { title: { uk: "Діагностика судинної сітки", ru: "Диагностика сосудистой сетки", en: "Assessing the vascular network" }, description: { uk: "Лікар оцінює глибину, діаметр і поширеність судин, виключає розацеа та інші причини почервоніння.", ru: "Врач оценивает глубину, диаметр и распространённость сосудов, исключает розацеа и другие причины покраснения.", en: "The doctor assesses the depth, diameter, and spread of the vessels and rules out rosacea and other causes of redness." } },
        { title: { uk: "Добір фільтра та тестовий імпульс", ru: "Подбор фильтра и тестовый импульс", en: "Filter selection and a test pulse" }, description: { uk: "Під фототип і тип судин добирають довжину хвилі. Тестовий імпульс підтверджує безпечні параметри.", ru: "Под фототип и тип сосудов подбирают длину волны. Тестовый импульс подтверждает безопасные параметры.", en: "The wavelength is matched to your phototype and vessel type. A test pulse confirms the parameters are safe." } },
        { title: { uk: "Обробка судин", ru: "Обработка сосудов", en: "Treating the vessels" }, description: { uk: "Лікар прицільно опрацьовує кожну судину. Відчуття — короткі теплі імпульси, схожі на клацання гумки.", ru: "Врач прицельно прорабатывает каждый сосуд. Ощущения — короткие тёплые импульсы, похожие на щелчок резинки.", en: "The doctor targets each vessel individually. It feels like short warm pulses, similar to the snap of an elastic band." } },
        { title: { uk: "Охолодження", ru: "Охлаждение", en: "Cooling" }, description: { uk: "Після сеансу шкіру охолоджують і наносять заспокійливий засіб та SPF 50.", ru: "После сеанса кожу охлаждают и наносят успокаивающее средство и SPF 50.", en: "After the session the skin is cooled and a soothing product plus SPF 50 are applied." } },
        { title: { uk: "Оцінка динаміки", ru: "Оценка динамики", en: "Reviewing progress" }, description: { uk: "Судини світлішають протягом 2-3 тижнів. Наступний сеанс — через 3-4 тижні за потреби.", ru: "Сосуды светлеют в течение 2-3 недель. Следующий сеанс — через 3-4 недели при необходимости.", en: "The vessels fade over 2-3 weeks. The next session follows in 3-4 weeks if needed." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги лікування куперозу в GENEVITY", ru: "Преимущества лечения купероза в GENEVITY", en: "Benefits of Couperose Treatment at GENEVITY" },
      items: [
        { uk: "M22 Stellar Black — платформа з фільтрами під різні типи та глибину судин", ru: "M22 Stellar Black — платформа с фильтрами под разные типы и глубину сосудов", en: "M22 Stellar Black — a platform with filters for different vessel types and depths" },
        { uk: "Перед процедурою лікар виключає розацеа та інші стани, що потребують іншої тактики", ru: "Перед процедурой врач исключает розацеа и другие состояния, требующие иной тактики", en: "Before the procedure the doctor rules out rosacea and other conditions needing a different approach" },
        { uk: "Прицільний вплив: обробляється судина, а не вся площа шкіри", ru: "Прицельное воздействие: обрабатывается сосуд, а не вся площадь кожи", en: "Targeted action: the vessel is treated, not the whole skin surface" },
        { uk: "Без періоду відновлення — почервоніння минає за кілька годин", ru: "Без периода восстановления — покраснение проходит за несколько часов", en: "No downtime — the redness settles within a few hours" },
        { uk: "Рекомендації щодо тригерів і домашнього догляду, які подовжують результат", ru: "Рекомендации по триггерам и домашнему уходу, которые продлевают результат", en: "Guidance on triggers and home care that make the result last" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Скільки процедур потрібно, щоб прибрати купероз?", ru: "Сколько процедур нужно, чтобы убрать купероз?", en: "How many sessions are needed to clear couperose?" },
      answer: { uk: "Поодинокі судинні зірочки часто зникають після 1-2 сеансів. При поширеній судинній сітці або стійкому дифузному почервонінні потрібен курс із 3-4 процедур з інтервалом 3-4 тижні. Кількість сеансів лікар називає після огляду.", ru: "Одиночные сосудистые звёздочки часто исчезают после 1-2 сеансов. При распространённой сосудистой сетке или стойком диффузном покраснении нужен курс из 3-4 процедур с интервалом 3-4 недели. Количество сеансов врач называет после осмотра.", en: "Isolated spider veins often disappear after 1-2 sessions. Widespread vascular networks or persistent diffuse redness need a course of 3-4 sessions 3-4 weeks apart. The doctor gives you the number after an examination." },
    },
    {
      question: { uk: "Чи повертається купероз після лазерного лікування?", ru: "Возвращается ли купероз после лазерного лечения?", en: "Does couperose come back after laser treatment?" },
      answer: { uk: "Оброблена судина не відновлюється — вона виводиться організмом остаточно. Але схильність до куперозу залишається, тож із часом можуть з'явитися нові судини. Профілактика — SPF щодня, уникнення різких перепадів температур, обмеження алкоголю та гострої їжі — суттєво відтерміновує їх появу.", ru: "Обработанный сосуд не восстанавливается — он выводится организмом окончательно. Но склонность к куперозу остаётся, поэтому со временем могут появиться новые сосуды. Профилактика — SPF ежедневно, избегание резких перепадов температур, ограничение алкоголя и острой пищи — существенно отдаляет их появление.", en: "A treated vessel does not come back — the body clears it for good. But the predisposition remains, so new vessels can appear over time. Prevention — daily SPF, avoiding sharp temperature swings, limiting alcohol and spicy food — significantly delays them." },
    },
    {
      question: { uk: "Чи боляче видаляти судинні зірочки на обличчі?", ru: "Больно ли удалять сосудистые звёздочки на лице?", en: "Is removing facial spider veins painful?" },
      answer: { uk: "Процедура переноситься комфортно й зазвичай не потребує анестезії. Відчуття описують як короткі теплі клацання. Насадка апарата має контактне охолодження, яке захищає епідерміс і знижує дискомфорт. Для чутливих зон лікар може застосувати аплікаційний анестетик.", ru: "Процедура переносится комфортно и обычно не требует анестезии. Ощущения описывают как короткие тёплые щелчки. Насадка аппарата имеет контактное охлаждение, которое защищает эпидермис и снижает дискомфорт. Для чувствительных зон врач может применить аппликационный анестетик.", en: "The procedure is comfortable and usually needs no anaesthesia. The sensation is described as short warm snaps. The handpiece has contact cooling that protects the epidermis and reduces discomfort. For sensitive areas the doctor can apply a topical anaesthetic." },
    },
  ],
},

// ─── 5. ЛІКУВАННЯ АКНЕ ──────────────────────────────────────────────────────
{
  slug: "acne-treatment",
  title: { uk: "Лікування акне", ru: "Лечение акне", en: "Acne Treatment" },
  h1: { uk: "Лікування акне в Дніпрі", ru: "Лечение акне в Днепре", en: "Acne treatment in Dnipro" },
  summary: {
    uk: "Лікування акне в GENEVITY — медичний протокол із діагностикою причини, апаратною терапією на M22 Stellar Black і супроводом лікаря. Зменшуємо запалення, нормалізуємо роботу сальних залоз, працюємо зі слідами. Дніпро.",
    ru: "Лечение акне в GENEVITY — медицинский протокол с диагностикой причины, аппаратной терапией на M22 Stellar Black и сопровождением врача. Уменьшаем воспаление, нормализуем работу сальных желёз, работаем со следами. Днепр.",
    en: "Acne treatment at GENEVITY is a medical protocol: diagnosing the cause, device therapy on the M22 Stellar Black, and ongoing physician support. We reduce inflammation, normalise sebaceous gland activity, and address the marks left behind. Dnipro.",
  },
  procedureLength: { uk: "30-45 хвилин", ru: "30-45 минут", en: "30-45 minutes" },
  effectDuration: { uk: "За умови підтримки", ru: "При условии поддержки", en: "With maintenance care" },
  sessionsRecommended: { uk: "4-6 процедур", ru: "4-6 процедур", en: "4-6 treatments" },
  equipment: [EQ_M22, EQ_ACUPULSE],
  related: ["laser-resurfacing-post-acne", "hydrafacial", "m22-stellar-black"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Чому акне лікують комплексно, а не «випалюють»", ru: "Почему акне лечат комплексно, а не «выжигают»", en: "Why Acne Is Treated Systemically, Not Just Burned Away" },
      body: {
        uk: "Акне — це захворювання сальної залози та волосяного фолікула, а не косметичний дефект. У його основі лежать чотири процеси: надлишкова продукція себуму, порушення зроговіння протоки, розмноження Cutibacterium acnes і запалення. Вплинути потрібно на всі чотири — тоді результат тримається.\n\nТому в GENEVITY лікування починається не з процедури, а з розбору причини. Лікар оцінює ступінь тяжкості, характер елементів і за потреби скеровує на гормональне обстеження чи консультацію ендокринолога — власна лабораторія клініки дозволяє зробити це в один візит.\n\nАпаратна складова працює прицільно. Світло певного спектра пригнічує бактеріальну активність у протоці й зменшує запалення, а прогрівання нормалізує роботу сальної залози. Паралельно лікар підбирає домашній догляд і, за показаннями, медикаментозну терапію.\n\n**Із чим працює протокол:**\n- Комедональне акне: чорні цятки, закриті комедони\n- Папуло-пустульозні висипання середнього ступеня\n- Жирна шкіра з розширеними порами та блиском\n- Постзапальні плями та червоні сліди після висипань",
        ru: "Акне — это заболевание сальной железы и волосяного фолликула, а не косметический дефект. В его основе лежат четыре процесса: избыточная продукция себума, нарушение ороговения протока, размножение Cutibacterium acnes и воспаление. Повлиять нужно на все четыре — тогда результат держится.\n\nПоэтому в GENEVITY лечение начинается не с процедуры, а с разбора причины. Врач оценивает степень тяжести, характер элементов и при необходимости направляет на гормональное обследование или консультацию эндокринолога — собственная лаборатория клиники позволяет сделать это в один визит.\n\nАппаратная составляющая работает прицельно. Свет определённого спектра подавляет бактериальную активность в протоке и уменьшает воспаление, а прогрев нормализует работу сальной железы. Параллельно врач подбирает домашний уход и, по показаниям, медикаментозную терапию.\n\n**С чем работает протокол:**\n- Комедональное акне: чёрные точки, закрытые комедоны\n- Папуло-пустулёзные высыпания средней степени\n- Жирная кожа с расширенными порами и блеском\n- Поствоспалительные пятна и красные следы после высыпаний",
        en: "Acne is a disease of the sebaceous gland and hair follicle, not a cosmetic flaw. Four processes drive it: excess sebum production, abnormal keratinisation of the duct, proliferation of Cutibacterium acnes, and inflammation. All four have to be addressed for the result to hold.\n\nSo at GENEVITY treatment starts not with a procedure but with finding the cause. The doctor grades the severity and the type of lesions and, if needed, refers you for hormone testing or an endocrinologist consultation — the clinic's own laboratory means this can be done in a single visit.\n\nThe device component works precisely. Light in a specific spectrum suppresses bacterial activity in the duct and reduces inflammation, while the heat normalises sebaceous gland function. In parallel the doctor selects home care and, where indicated, medical therapy.\n\n**What the protocol addresses:**\n- Comedonal acne: blackheads and closed comedones\n- Moderate papulopustular breakouts\n- Oily skin with enlarged pores and shine\n- Post-inflammatory marks and lingering redness",
      },
      calloutBody: {
        uk: "Тяжкі форми акне з вузлами та кістами потребують медикаментозної терапії під наглядом дерматолога. Апаратні методики в таких випадках — доповнення, а не заміна лікування.",
        ru: "Тяжёлые формы акне с узлами и кистами требуют медикаментозной терапии под наблюдением дерматолога. Аппаратные методики в таких случаях — дополнение, а не замена лечения.",
        en: "Severe acne with nodules and cysts requires medical therapy supervised by a dermatologist. In those cases device treatments are an addition to therapy, not a replacement for it.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лікування акне", ru: "Показания к лечению акне", en: "Indications for Acne Treatment" },
      indications: [
        { uk: "Комедональне акне: чорні цятки та закриті комедони", ru: "Комедональное акне: чёрные точки и закрытые комедоны", en: "Comedonal acne: blackheads and closed comedones" },
        { uk: "Папуло-пустульозні висипання легкого та середнього ступеня", ru: "Папуло-пустулёзные высыпания лёгкой и средней степени", en: "Mild to moderate papulopustular breakouts" },
        { uk: "Жирна шкіра з надлишковим блиском і розширеними порами", ru: "Жирная кожа с избыточным блеском и расширенными порами", en: "Oily skin with excess shine and enlarged pores" },
        { uk: "Постзапальна еритема та застійні плями", ru: "Поствоспалительная эритема и застойные пятна", en: "Post-inflammatory erythema and lingering marks" },
        { uk: "Акне на спині, грудях і плечах", ru: "Акне на спине, груди и плечах", en: "Acne on the back, chest, and shoulders" },
        { uk: "Схильність до рецидивів після попереднього лікування", ru: "Склонность к рецидивам после предыдущего лечения", en: "A tendency to relapse after previous treatment" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Прийом ізотретиноїну та фотосенсибілізувальних препаратів", ru: "Приём изотретиноина и фотосенсибилизирующих препаратов", en: "Isotretinoin or photosensitising medication" },
        { uk: "Свіжа засмага, зокрема після солярію", ru: "Свежий загар, в том числе после солярия", en: "A fresh tan, including from a sunbed" },
        { uk: "Герпес у стадії загострення, гнійничкові інфекції шкіри", ru: "Герпес в стадии обострения, гнойничковые инфекции кожи", en: "A herpes flare-up or pustular skin infection" },
        { uk: "Онкологічні захворювання, епілепсія", ru: "Онкологические заболевания, эпилепсия", en: "Oncological disease, epilepsy" },
        { uk: "Декомпенсований цукровий діабет", ru: "Декомпенсированный сахарный диабет", en: "Uncontrolled diabetes" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить лікування акне в клініці", ru: "Как проходит лечение акне в клинике", en: "How Acne Treatment Works at the Clinic" },
      steps: [
        { title: { uk: "Консультація та визначення ступеня", ru: "Консультация и определение степени", en: "Consultation and grading" }, description: { uk: "Лікар оцінює тип і тяжкість акне, збирає анамнез, за потреби призначає лабораторне обстеження.", ru: "Врач оценивает тип и тяжесть акне, собирает анамнез, при необходимости назначает лабораторное обследование.", en: "The doctor grades the type and severity, takes your history, and orders laboratory tests if needed." } },
        { title: { uk: "Складання протоколу", ru: "Составление протокола", en: "Building the protocol" }, description: { uk: "Формується план: апаратні сеанси, домашній догляд, за показаннями — медикаментозна терапія.", ru: "Формируется план: аппаратные сеансы, домашний уход, по показаниям — медикаментозная терапия.", en: "A plan is drawn up: device sessions, home care, and medical therapy where indicated." } },
        { title: { uk: "Апаратна процедура", ru: "Аппаратная процедура", en: "The device session" }, description: { uk: "Обробка на M22 Stellar Black: світлові імпульси зменшують запалення та бактеріальну активність.", ru: "Обработка на M22 Stellar Black: световые импульсы уменьшают воспаление и бактериальную активность.", en: "Treatment on the M22 Stellar Black: light pulses reduce inflammation and bacterial activity." } },
        { title: { uk: "Курс і контроль", ru: "Курс и контроль", en: "Course and follow-up" }, description: { uk: "4-6 сеансів з інтервалом 2-3 тижні. На кожному візиті лікар оцінює динаміку та коригує план.", ru: "4-6 сеансов с интервалом 2-3 недели. На каждом визите врач оценивает динамику и корректирует план.", en: "4-6 sessions 2-3 weeks apart. At each visit the doctor reviews progress and adjusts the plan." } },
        { title: { uk: "Робота зі слідами", ru: "Работа со следами", en: "Addressing the marks" }, description: { uk: "Коли висипання під контролем, переходимо до корекції постакне — плям і рубців.", ru: "Когда высыпания под контролем, переходим к коррекции постакне — пятен и рубцов.", en: "Once breakouts are controlled, we move on to post-acne correction — marks and scars." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги лікування акне в GENEVITY", ru: "Преимущества лечения акне в GENEVITY", en: "Benefits of Acne Treatment at GENEVITY" },
      items: [
        { uk: "Лікуємо причину, а не лише висипання: доступні гормональне обстеження та консультація ендокринолога", ru: "Лечим причину, а не только высыпания: доступны гормональное обследование и консультация эндокринолога", en: "We treat the cause, not only the breakouts: hormone testing and an endocrinologist consultation are available" },
        { uk: "Власна клініко-діагностична лабораторія — аналізи в день звернення", ru: "Собственная клинико-диагностическая лаборатория — анализы в день обращения", en: "An on-site clinical diagnostic laboratory — tests on the day of your visit" },
        { uk: "M22 Stellar Black для контролю запалення без агресивного впливу на шкіру", ru: "M22 Stellar Black для контроля воспаления без агрессивного воздействия на кожу", en: "M22 Stellar Black to control inflammation without aggressive treatment of the skin" },
        { uk: "Наступний етап — CO₂-лазер AcuPulse для роботи зі слідами постакне", ru: "Следующий этап — CO₂-лазер AcuPulse для работы со следами постакне", en: "The next stage — the AcuPulse CO₂ laser for post-acne marks" },
        { uk: "Супровід лікаря протягом усього курсу з коригуванням протоколу", ru: "Сопровождение врача на протяжении всего курса с корректировкой протокола", en: "Physician support throughout the course, with the protocol adjusted as you go" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Через скільки часу після початку лікування акне видно результат?", ru: "Через сколько времени после начала лечения акне виден результат?", en: "How soon are results visible after starting acne treatment?" },
      answer: { uk: "Зменшення запалення й кількості нових елементів помітне після 2-3 сеансів, тобто приблизно через 4-6 тижнів. Стійке покращення дає повний курс із 4-6 процедур у поєднанні з правильним домашнім доглядом. Постзапальні плями світлішають довше — 2-3 місяці.", ru: "Уменьшение воспаления и количества новых элементов заметно после 2-3 сеансов, то есть примерно через 4-6 недель. Стойкое улучшение даёт полный курс из 4-6 процедур в сочетании с правильным домашним уходом. Поствоспалительные пятна светлеют дольше — 2-3 месяца.", en: "Less inflammation and fewer new lesions are noticeable after 2-3 sessions, roughly 4-6 weeks in. Lasting improvement comes from the full course of 4-6 sessions combined with the right home care. Post-inflammatory marks take longer to fade — 2-3 months." },
    },
    {
      question: { uk: "Чи потрібно здавати аналізи перед лікуванням акне?", ru: "Нужно ли сдавать анализы перед лечением акне?", en: "Are tests needed before acne treatment?" },
      answer: { uk: "Не завжди. При легких формах достатньо огляду лікаря. Але якщо акне стійке, з'явилося у дорослому віці або супроводжується іншими симптомами, лікар призначає гормональну панель і за потреби скеровує до ендокринолога. Здати аналізи можна у власній лабораторії GENEVITY.", ru: "Не всегда. При лёгких формах достаточно осмотра врача. Но если акне стойкое, появилось во взрослом возрасте или сопровождается другими симптомами, врач назначает гормональную панель и при необходимости направляет к эндокринологу. Сдать анализы можно в собственной лаборатории GENEVITY.", en: "Not always. For mild cases a doctor's examination is enough. But if the acne is persistent, started in adulthood, or comes with other symptoms, the doctor orders a hormone panel and refers you to an endocrinologist if needed. Testing is available in GENEVITY's own laboratory." },
    },
    {
      question: { uk: "Чи можна поєднувати апаратне лікування акне з медикаментами?", ru: "Можно ли сочетать аппаратное лечение акне с медикаментами?", en: "Can device treatment be combined with acne medication?" },
      answer: { uk: "Так, і найчастіше саме комбінація дає найкращий результат. Важливий виняток — ізотретиноїн: під час його прийому та протягом 6 місяців після завершення курсу апаратні процедури не проводять. Про всі препарати, які ви приймаєте, обов'язково повідомте лікаря на консультації.", ru: "Да, и чаще всего именно комбинация даёт лучший результат. Важное исключение — изотретиноин: во время его приёма и в течение 6 месяцев после завершения курса аппаратные процедуры не проводят. Обо всех препаратах, которые вы принимаете, обязательно сообщите врачу на консультации.", en: "Yes, and the combination usually gives the best result. One important exception is isotretinoin: device procedures are not performed while you are taking it or for 6 months after the course ends. Always tell the doctor at your consultation about every medication you take." },
    },
  ],
},

// ─── 6. ВИДАЛЕННЯ ПІГМЕНТАЦІЇ ───────────────────────────────────────────────
{
  slug: "pigmentation-removal",
  title: { uk: "Видалення пігментації", ru: "Удаление пигментации", en: "Pigmentation Removal" },
  h1: { uk: "Видалення пігментації в Дніпрі", ru: "Удаление пигментации в Днепре", en: "Pigmentation removal in Dnipro" },
  summary: {
    uk: "Видалення пігментних плям в GENEVITY — лазерне освітлення гіперпігментації на M22 Stellar Black. Прибираємо сонячні лентиго, веснянки та постзапальні плями, вирівнюємо тон обличчя та рук. Дніпро.",
    ru: "Удаление пигментных пятен в GENEVITY — лазерное осветление гиперпигментации на M22 Stellar Black. Убираем солнечные лентиго, веснушки и поствоспалительные пятна, выравниваем тон лица и рук. Днепр.",
    en: "Pigmentation removal at GENEVITY is laser lightening of hyperpigmentation with the M22 Stellar Black. We clear solar lentigines, freckles, and post-inflammatory marks and even out the tone of the face and hands. Dnipro.",
  },
  procedureLength: { uk: "20-40 хвилин", ru: "20-40 минут", en: "20-40 minutes" },
  effectDuration: { uk: "12-24 місяці", ru: "12-24 месяца", en: "12-24 months" },
  sessionsRecommended: { uk: "2-4 процедури", ru: "2-4 процедуры", en: "2-4 treatments" },
  equipment: [EQ_M22],
  related: ["m22-stellar-black", "photorejuvenation", "laser-peel"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Як лазер освітлює пігментні плями", ru: "Как лазер осветляет пигментные пятна", en: "How the Laser Lightens Pigment Spots" },
      body: {
        uk: "Пігментна пляма — це скупчення меланіну в епідермісі або дермі. Меланін поглинає світло значно активніше, ніж навколишні тканини, і саме на цьому побудована методика.\n\nСвітловий імпульс нагріває пігментне скупчення до температури, за якої воно фрагментується на дрібні частинки. Частина з них виходить на поверхню й відлущується разом із роговим шаром протягом 7-14 днів, решту виводить лімфатична система. Здорова шкіра поруч залишається неушкодженою.\n\nКлючовий етап — діагностика. Гіперпігментація буває різного походження: сонячні лентиго, постзапальні плями, мелазма. Мелазма, наприклад, потребує обережнішої тактики — надто агресивний вплив може її посилити. Тому лікар спершу визначає тип плями, а вже потім добирає параметри.\n\n**Із чим працює процедура:**\n- Сонячні лентиго та вікові плями на обличчі й кистях\n- Веснянки, якщо ви хочете їх освітлити\n- Постзапальна пігментація після висипань і травм\n- Нерівний тон і ділянки фотостаріння",
        ru: "Пигментное пятно — это скопление меланина в эпидермисе или дерме. Меланин поглощает свет значительно активнее, чем окружающие ткани, и именно на этом построена методика.\n\nСветовой импульс нагревает пигментное скопление до температуры, при которой оно фрагментируется на мелкие частицы. Часть из них выходит на поверхность и отшелушивается вместе с роговым слоем в течение 7-14 дней, остальные выводит лимфатическая система. Здоровая кожа рядом остаётся неповреждённой.\n\nКлючевой этап — диагностика. Гиперпигментация бывает разного происхождения: солнечные лентиго, поствоспалительные пятна, мелазма. Мелазма, например, требует более осторожной тактики — слишком агрессивное воздействие может её усилить. Поэтому врач сначала определяет тип пятна, а уже затем подбирает параметры.\n\n**С чем работает процедура:**\n- Солнечные лентиго и возрастные пятна на лице и кистях\n- Веснушки, если вы хотите их осветлить\n- Поствоспалительная пигментация после высыпаний и травм\n- Неровный тон и участки фотостарения",
        en: "A pigment spot is a cluster of melanin in the epidermis or dermis. Melanin absorbs light far more readily than the surrounding tissue, and the method is built on exactly that.\n\nA light pulse heats the pigment cluster to the point where it fragments into small particles. Some rise to the surface and shed with the horny layer over 7-14 days; the rest are cleared by the lymphatic system. The healthy skin alongside is left intact.\n\nDiagnosis is the key step. Hyperpigmentation has different origins: solar lentigines, post-inflammatory marks, melasma. Melasma in particular calls for a more cautious approach — treatment that is too aggressive can worsen it. So the doctor identifies the type of spot first and only then selects the parameters.\n\n**What the procedure addresses:**\n- Solar lentigines and age spots on the face and hands\n- Freckles, if you would like them lightened\n- Post-inflammatory pigmentation after breakouts and injuries\n- Uneven tone and areas of photoageing",
      },
      calloutBody: {
        uk: "Без щоденного SPF 50 пігментація повертається — це не рекомендація «про всяк випадок», а обов'язкова умова результату. Ультрафіолет знову запускає синтез меланіну в тих самих ділянках.",
        ru: "Без ежедневного SPF 50 пигментация возвращается — это не рекомендация «на всякий случай», а обязательное условие результата. Ультрафиолет снова запускает синтез меланина в тех же участках.",
        en: "Without daily SPF 50 the pigmentation returns — this is not a precaution but a condition of the result. UV restarts melanin synthesis in the very same areas.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до видалення пігментації", ru: "Показания к удалению пигментации", en: "Indications for Pigmentation Removal" },
      indications: [
        { uk: "Сонячні лентиго та вікові пігментні плями", ru: "Солнечные лентиго и возрастные пигментные пятна", en: "Solar lentigines and age spots" },
        { uk: "Пігментація на кистях рук, у зоні декольте та на плечах", ru: "Пигментация на кистях рук, в зоне декольте и на плечах", en: "Pigmentation on the hands, décolletage, and shoulders" },
        { uk: "Постзапальні плями після акне, подряпин, опіків", ru: "Поствоспалительные пятна после акне, царапин, ожогов", en: "Post-inflammatory marks after acne, scratches, or burns" },
        { uk: "Веснянки, якщо є бажання їх освітлити", ru: "Веснушки, если есть желание их осветлить", en: "Freckles, if you wish to lighten them" },
        { uk: "Нерівний тон обличчя та ознаки фотостаріння", ru: "Неровный тон лица и признаки фотостарения", en: "Uneven facial tone and signs of photoageing" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Свіжа засмага та відвідування солярію за останні 4 тижні", ru: "Свежий загар и посещение солярия за последние 4 недели", en: "A fresh tan or sunbed use in the last 4 weeks" },
        { uk: "Прийом фотосенсибілізувальних препаратів", ru: "Приём фотосенсибилизирующих препаратов", en: "Taking photosensitising medication" },
        { uk: "Підозра на злоякісне новоутворення шкіри — потрібна консультація дерматолога", ru: "Подозрение на злокачественное новообразование кожи — нужна консультация дерматолога", en: "Suspected skin malignancy — a dermatologist consultation is required" },
        { uk: "Активне запалення або інфекція в зоні обробки", ru: "Активное воспаление или инфекция в зоне обработки", en: "Active inflammation or infection in the treatment area" },
        { uk: "Онкологічні захворювання, епілепсія", ru: "Онкологические заболевания, эпилепсия", en: "Oncological disease, epilepsy" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить лазерне видалення пігментних плям", ru: "Как проходит лазерное удаление пигментных пятен", en: "How Laser Pigment Spot Removal Works" },
      steps: [
        { title: { uk: "Діагностика типу пігментації", ru: "Диагностика типа пигментации", en: "Identifying the type of pigmentation" }, description: { uk: "Лікар визначає походження плям, оцінює фототип і виключає новоутворення, що потребують іншої тактики.", ru: "Врач определяет происхождение пятен, оценивает фототип и исключает новообразования, требующие иной тактики.", en: "The doctor identifies the origin of the spots, assesses your phototype, and rules out lesions needing a different approach." } },
        { title: { uk: "Добір параметрів", ru: "Подбор параметров", en: "Selecting the parameters" }, description: { uk: "Під тип пігменту та фототип обирають фільтр і енергію, проводять тестовий імпульс.", ru: "Под тип пигмента и фототип выбирают фильтр и энергию, проводят тестовый импульс.", en: "A filter and energy level are matched to the pigment type and phototype, and a test pulse is delivered." } },
        { title: { uk: "Обробка плям", ru: "Обработка пятен", en: "Treating the spots" }, description: { uk: "Прицільний вплив на кожну ділянку. Одразу після імпульсу пляма темнішає — це нормальна реакція.", ru: "Прицельное воздействие на каждый участок. Сразу после импульса пятно темнеет — это нормальная реакция.", en: "Each area is targeted individually. The spot darkens right after the pulse — this is the expected reaction." } },
        { title: { uk: "Відлущення", ru: "Отшелушивание", en: "Shedding" }, description: { uk: "Протягом 7-14 днів потемнілі ділянки відлущуються самостійно. Здирати їх не можна.", ru: "В течение 7-14 дней потемневшие участки отшелушиваются самостоятельно. Сдирать их нельзя.", en: "Over 7-14 days the darkened areas flake away on their own. They must not be picked off." } },
        { title: { uk: "Захист і повторний сеанс", ru: "Защита и повторный сеанс", en: "Protection and the next session" }, description: { uk: "Щоденний SPF 50 обов'язковий. Наступну процедуру за потреби проводять через 4 тижні.", ru: "Ежедневный SPF 50 обязателен. Следующую процедуру при необходимости проводят через 4 недели.", en: "Daily SPF 50 is mandatory. If needed, the next session follows in 4 weeks." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги видалення пігментації в GENEVITY", ru: "Преимущества удаления пигментации в GENEVITY", en: "Benefits of Pigmentation Removal at GENEVITY" },
      items: [
        { uk: "Перед процедурою лікар відрізняє лентиго від мелазми та невусів — це впливає на тактику", ru: "Перед процедурой врач отличает лентиго от мелазмы и невусов — это влияет на тактику", en: "Before treatment the doctor distinguishes lentigines from melasma and naevi — this changes the approach" },
        { uk: "M22 Stellar Black із набором фільтрів під різні типи пігменту та фототипи", ru: "M22 Stellar Black с набором фильтров под разные типы пигмента и фототипы", en: "M22 Stellar Black with a range of filters for different pigment types and phototypes" },
        { uk: "Помітне освітлення вже після першої процедури", ru: "Заметное осветление уже после первой процедуры", en: "Visible lightening after the very first session" },
        { uk: "Без періоду відновлення: можна повертатися до звичних справ того ж дня", ru: "Без периода восстановления: можно возвращаться к привычным делам в тот же день", en: "No downtime — you can return to your usual routine the same day" },
        { uk: "Індивідуальні рекомендації щодо фотозахисту, які втримують результат", ru: "Индивидуальные рекомендации по фотозащите, которые удерживают результат", en: "Personal photoprotection guidance that keeps the result in place" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Скільки процедур потрібно, щоб прибрати пігментні плями?", ru: "Сколько процедур нужно, чтобы убрать пигментные пятна?", en: "How many sessions are needed to remove pigment spots?" },
      answer: { uk: "Поверхневі сонячні лентиго часто зникають за 1-2 сеанси. Глибша або поширена пігментація потребує 3-4 процедур з інтервалом 4 тижні. Постзапальні плями світлішають поступово й можуть вимагати комбінації з домашнім доглядом.", ru: "Поверхностные солнечные лентиго часто исчезают за 1-2 сеанса. Более глубокая или распространённая пигментация требует 3-4 процедур с интервалом 4 недели. Поствоспалительные пятна светлеют постепенно и могут требовать комбинации с домашним уходом.", en: "Superficial solar lentigines often clear in 1-2 sessions. Deeper or widespread pigmentation needs 3-4 sessions 4 weeks apart. Post-inflammatory marks fade gradually and may need to be combined with home care." },
    },
    {
      question: { uk: "Чому після процедури пляма стала темнішою?", ru: "Почему после процедуры пятно стало темнее?", en: "Why did the spot get darker after the procedure?" },
      answer: { uk: "Це очікувана реакція: зруйнований пігмент піднімається до поверхні епідермісу, тому пляма темнішає та вкривається тонкою скоринкою. Протягом 7-14 днів вона відлущується самостійно, і шкіра світлішає. Здирати скоринки не можна — це може призвести до нової пігментації.", ru: "Это ожидаемая реакция: разрушенный пигмент поднимается к поверхности эпидермиса, поэтому пятно темнеет и покрывается тонкой корочкой. В течение 7-14 дней она отшелушивается самостоятельно, и кожа светлеет. Сдирать корочки нельзя — это может привести к новой пигментации.", en: "This is the expected reaction: the fragmented pigment rises towards the surface of the epidermis, so the spot darkens and forms a thin crust. It sheds on its own over 7-14 days and the skin lightens. Never pick the crusts off — that can cause new pigmentation." },
    },
    {
      question: { uk: "Чи можна видаляти пігментацію влітку?", ru: "Можно ли удалять пигментацию летом?", en: "Can pigmentation be removed in summer?" },
      answer: { uk: "Оптимальний сезон — осінь і зима, коли сонячна активність низька. Влітку процедуру проводять лише за умови повної відмови від засмаги, суворого SPF 50 і відсутності свіжої засмаги щонайменше 4 тижні до сеансу. Остаточне рішення ухвалює лікар з огляду на ваш фототип.", ru: "Оптимальный сезон — осень и зима, когда солнечная активность низкая. Летом процедуру проводят только при условии полного отказа от загара, строгого SPF 50 и отсутствия свежего загара минимум 4 недели до сеанса. Окончательное решение принимает врач с учётом вашего фототипа.", en: "Autumn and winter are the optimal seasons, when sun exposure is low. In summer the procedure is only performed if you avoid tanning entirely, use strict SPF 50, and have had no fresh tan for at least 4 weeks before the session. The doctor makes the final decision based on your phototype." },
    },
  ],
},

// ─── 7. ЛІКУВАННЯ РОЗАЦЕА ───────────────────────────────────────────────────
{
  slug: "rosacea-treatment",
  title: { uk: "Лікування розацеа", ru: "Лечение розацеа", en: "Rosacea Treatment" },
  h1: { uk: "Лікування розацеа в Дніпрі", ru: "Лечение розацеа в Днепре", en: "Rosacea treatment in Dnipro" },
  summary: {
    uk: "Лікування розацеа в GENEVITY — контроль хронічного почервоніння шкіри на платформі M22 Stellar Black у поєднанні з медичним супроводом. Зменшуємо еритему, судинний компонент і частоту загострень. Дніпро.",
    ru: "Лечение розацеа в GENEVITY — контроль хронического покраснения кожи на платформе M22 Stellar Black в сочетании с медицинским сопровождением. Уменьшаем эритему, сосудистый компонент и частоту обострений. Днепр.",
    en: "Rosacea treatment at GENEVITY controls chronic facial redness with the M22 Stellar Black platform alongside medical supervision. We reduce erythema, the vascular component, and the frequency of flare-ups. Dnipro.",
  },
  procedureLength: { uk: "30-40 хвилин", ru: "30-40 минут", en: "30-40 minutes" },
  effectDuration: { uk: "6-12 місяців", ru: "6-12 месяцев", en: "6-12 months" },
  sessionsRecommended: { uk: "3-5 процедур", ru: "3-5 процедур", en: "3-5 treatments" },
  equipment: [EQ_M22],
  related: ["couperose-treatment", "m22-stellar-black", "photorejuvenation"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Розацеа: хронічний стан, який можна контролювати", ru: "Розацеа: хроническое состояние, которое можно контролировать", en: "Rosacea: A Chronic Condition That Can Be Controlled" },
      body: {
        uk: "Розацеа — хронічне запальне захворювання шкіри обличчя. На відміну від куперозу, це не просто розширені судини, а системний процес: порушена реактивність судин, змінена імунна відповідь шкіри, часто — надлишкова колонізація кліщем Demodex.\n\nВилікувати розацеа остаточно неможливо, і будь-хто, хто обіцяє інше, вводить в оману. Але захворювання добре піддається контролю: правильно підібрана терапія прибирає стійке почервоніння, зменшує кількість запальних елементів і подовжує періоди ремісії.\n\nСвітлова терапія працює із судинним компонентом — тим самим, який дає стійку еритему та припливи. Енергія поглинається гемоглобіном, розширені судини коагулюються, фонове почервоніння зменшується. Паралельно знижується запальна активність у шкірі.\n\nУ GENEVITY розацеа веде лікар: він добирає апаратний протокол, зовнішню терапію та за потреби скеровує до дерматолога чи гастроентеролога — розацеа нерідко пов'язана зі станом ШКТ.\n\n**Що дає лікування:**\n- Зменшення стійкої еритеми на щоках, носі, підборідді\n- Скорочення кількості папул і пустул\n- Рідші та менш виражені припливи\n- Довші періоди ремісії між загостреннями",
        ru: "Розацеа — хроническое воспалительное заболевание кожи лица. В отличие от купероза, это не просто расширенные сосуды, а системный процесс: нарушена реактивность сосудов, изменён иммунный ответ кожи, часто — избыточная колонизация клещом Demodex.\n\nВылечить розацеа окончательно невозможно, и любой, кто обещает иное, вводит в заблуждение. Но заболевание хорошо поддаётся контролю: правильно подобранная терапия убирает стойкое покраснение, уменьшает количество воспалительных элементов и удлиняет периоды ремиссии.\n\nСветовая терапия работает с сосудистым компонентом — тем самым, который даёт стойкую эритему и приливы. Энергия поглощается гемоглобином, расширенные сосуды коагулируются, фоновое покраснение уменьшается. Параллельно снижается воспалительная активность в коже.\n\nВ GENEVITY розацеа ведёт врач: он подбирает аппаратный протокол, наружную терапию и при необходимости направляет к дерматологу или гастроэнтерологу — розацеа нередко связана с состоянием ЖКТ.\n\n**Что даёт лечение:**\n- Уменьшение стойкой эритемы на щеках, носу, подбородке\n- Сокращение количества папул и пустул\n- Более редкие и менее выраженные приливы\n- Более длительные периоды ремиссии между обострениями",
        en: "Rosacea is a chronic inflammatory disease of the facial skin. Unlike couperose, it is not simply dilated vessels but a systemic process: vascular reactivity is disturbed, the skin's immune response is altered, and there is often excess colonisation by the Demodex mite.\n\nRosacea cannot be cured outright, and anyone promising otherwise is misleading you. But it responds well to control: the right therapy clears persistent redness, reduces the number of inflammatory lesions, and lengthens periods of remission.\n\nLight therapy works on the vascular component — the very thing behind persistent erythema and flushing. The energy is absorbed by haemoglobin, the dilated vessels coagulate, and the background redness recedes. Inflammatory activity in the skin drops in parallel.\n\nAt GENEVITY rosacea is managed by a physician who selects the device protocol and topical therapy and, where needed, refers you to a dermatologist or gastroenterologist — rosacea is often linked to the state of the digestive tract.\n\n**What the treatment achieves:**\n- Less persistent erythema on the cheeks, nose, and chin\n- Fewer papules and pustules\n- Rarer, milder flushing episodes\n- Longer periods of remission between flare-ups",
      },
      calloutBody: {
        uk: "Розацеа й купероз часто плутають. Купероз — це окремі розширені судини без запалення. Розацеа — захворювання із запальним компонентом, припливами та схильністю до загострень. Тактика лікування різна, тому діагноз ставить лікар.",
        ru: "Розацеа и купероз часто путают. Купероз — это отдельные расширенные сосуды без воспаления. Розацеа — заболевание с воспалительным компонентом, приливами и склонностью к обострениям. Тактика лечения разная, поэтому диагноз ставит врач.",
        en: "Rosacea and couperose are often confused. Couperose is isolated dilated vessels without inflammation. Rosacea is a disease with an inflammatory component, flushing, and a tendency to flare. The treatment approach differs, so the diagnosis is made by a doctor.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лікування розацеа", ru: "Показания к лечению розацеа", en: "Indications for Rosacea Treatment" },
      indications: [
        { uk: "Стійка еритема на щоках, носі, підборідді та чолі", ru: "Стойкая эритема на щеках, носу, подбородке и лбу", en: "Persistent erythema on the cheeks, nose, chin, and forehead" },
        { uk: "Часті припливи та відчуття жару в обличчі", ru: "Частые приливы и ощущение жара в лице", en: "Frequent flushing and a feeling of heat in the face" },
        { uk: "Судинний компонент: телеангіектазії на тлі почервоніння", ru: "Сосудистый компонент: телеангиэктазии на фоне покраснения", en: "A vascular component: telangiectasias against a background of redness" },
        { uk: "Папуло-пустульозна форма розацеа поза загостренням", ru: "Папуло-пустулёзная форма розацеа вне обострения", en: "The papulopustular form of rosacea outside a flare" },
        { uk: "Підвищена чутливість шкіри, реакція на температуру та косметику", ru: "Повышенная чувствительность кожи, реакция на температуру и косметику", en: "Heightened skin sensitivity, reactivity to temperature and cosmetics" },
        { uk: "Потреба подовжити ремісію після медикаментозної терапії", ru: "Необходимость продлить ремиссию после медикаментозной терапии", en: "A need to extend remission after medical therapy" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Гостре загострення з вираженим запаленням", ru: "Острое обострение с выраженным воспалением", en: "An acute flare with marked inflammation" },
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Свіжа засмага, зокрема після солярію", ru: "Свежий загар, в том числе после солярия", en: "A fresh tan, including from a sunbed" },
        { uk: "Прийом ізотретиноїну та фотосенсибілізувальних препаратів", ru: "Приём изотретиноина и фотосенсибилизирующих препаратов", en: "Isotretinoin or photosensitising medication" },
        { uk: "Порушення згортання крові, прийом антикоагулянтів", ru: "Нарушения свёртывания крови, приём антикоагулянтов", en: "Clotting disorders or anticoagulant therapy" },
        { uk: "Онкологічні захворювання, епілепсія", ru: "Онкологические заболевания, эпилепсия", en: "Oncological disease, epilepsy" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить лікування розацеа лазером", ru: "Как проходит лечение розацеа лазером", en: "How Laser Rosacea Treatment Works" },
      steps: [
        { title: { uk: "Консультація та постановка діагнозу", ru: "Консультация и постановка диагноза", en: "Consultation and diagnosis" }, description: { uk: "Лікар визначає форму та стадію розацеа, відрізняє її від куперозу й інших дерматозів, з'ясовує тригери.", ru: "Врач определяет форму и стадию розацеа, отличает её от купероза и других дерматозов, выясняет триггеры.", en: "The doctor determines the form and stage of rosacea, distinguishes it from couperose and other dermatoses, and identifies your triggers." } },
        { title: { uk: "Стабілізація перед процедурою", ru: "Стабилизация перед процедурой", en: "Stabilising before the session" }, description: { uk: "Якщо є активне запалення, спершу призначають зовнішню терапію та догляд — світлова терапія йде після стихання.", ru: "Если есть активное воспаление, сначала назначают наружную терапию и уход — световая терапия идёт после стихания.", en: "If there is active inflammation, topical therapy and care come first — light therapy follows once it has settled." } },
        { title: { uk: "Світлова терапія", ru: "Световая терапия", en: "Light therapy" }, description: { uk: "Обробка на M22 Stellar Black у щадному режимі. Відчуття — тепло та легкі імпульси, без болю.", ru: "Обработка на M22 Stellar Black в щадящем режиме. Ощущения — тепло и лёгкие импульсы, без боли.", en: "Treatment on the M22 Stellar Black in a gentle mode. It feels like warmth and light pulses, without pain." } },
        { title: { uk: "Заспокійливий догляд", ru: "Успокаивающий уход", en: "Soothing care" }, description: { uk: "Після сеансу — охолодження, засоби для чутливої шкіри та обов'язковий SPF 50.", ru: "После сеанса — охлаждение, средства для чувствительной кожи и обязательный SPF 50.", en: "After the session — cooling, products for sensitive skin, and mandatory SPF 50." } },
        { title: { uk: "Курс і підтримка ремісії", ru: "Курс и поддержка ремиссии", en: "Course and maintaining remission" }, description: { uk: "3-5 сеансів з інтервалом 3-4 тижні, далі — підтримувальні процедури 1-2 рази на рік.", ru: "3-5 сеансов с интервалом 3-4 недели, далее — поддерживающие процедуры 1-2 раза в год.", en: "3-5 sessions 3-4 weeks apart, then maintenance sessions once or twice a year." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги лікування розацеа в GENEVITY", ru: "Преимущества лечения розацеа в GENEVITY", en: "Benefits of Rosacea Treatment at GENEVITY" },
      items: [
        { uk: "Розацеа веде лікар, а не косметолог без медичної освіти", ru: "Розацеа ведёт врач, а не косметолог без медицинского образования", en: "Rosacea is managed by a physician, not by a technician without medical training" },
        { uk: "Точна диференціація з куперозом, себорейним і периоральним дерматитом", ru: "Точная дифференциация с куперозом, себорейным и периоральным дерматитом", en: "Accurate differentiation from couperose, seborrhoeic and perioral dermatitis" },
        { uk: "M22 Stellar Black із щадними протоколами для реактивної шкіри", ru: "M22 Stellar Black со щадящими протоколами для реактивной кожи", en: "M22 Stellar Black with gentle protocols for reactive skin" },
        { uk: "За потреби — консультації гастроентеролога та ендокринолога в тій самій клініці", ru: "При необходимости — консультации гастроэнтеролога и эндокринолога в той же клинике", en: "If needed, gastroenterologist and endocrinologist consultations in the same clinic" },
        { uk: "План профілактики загострень: тригери, догляд, фотозахист", ru: "План профилактики обострений: триггеры, уход, фотозащита", en: "A flare-prevention plan: triggers, skincare, photoprotection" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи можна вилікувати розацеа назавжди?", ru: "Можно ли вылечить розацеа навсегда?", en: "Can rosacea be cured for good?" },
      answer: { uk: "Ні — розацеа є хронічним захворюванням, і повністю усунути схильність до нього неможливо. Але його можна впевнено контролювати: світлова терапія прибирає судинний компонент і стійке почервоніння, а правильний догляд та уникнення тригерів подовжують ремісію на місяці й роки.", ru: "Нет — розацеа является хроническим заболеванием, и полностью устранить склонность к нему невозможно. Но его можно уверенно контролировать: световая терапия убирает сосудистый компонент и стойкое покраснение, а правильный уход и избегание триггеров продлевают ремиссию на месяцы и годы.", en: "No — rosacea is a chronic condition and the underlying predisposition cannot be removed. But it can be controlled reliably: light therapy clears the vascular component and persistent redness, while the right skincare and trigger avoidance extend remission by months or years." },
    },
    {
      question: { uk: "Чим розацеа відрізняється від куперозу?", ru: "Чем розацеа отличается от купероза?", en: "How does rosacea differ from couperose?" },
      answer: { uk: "Купероз — це окремі розширені судини без запального процесу; його прибирають прицільною коагуляцією. Розацеа — захворювання з еритемою, припливами, а часто й папулами та пустулами; воно потребує комплексного ведення з медикаментозною підтримкою. Візуально стани схожі, тому діагноз має ставити лікар.", ru: "Купероз — это отдельные расширенные сосуды без воспалительного процесса; их убирают прицельной коагуляцией. Розацеа — заболевание с эритемой, приливами, а часто и папулами и пустулами; оно требует комплексного ведения с медикаментозной поддержкой. Визуально состояния похожи, поэтому диагноз должен ставить врач.", en: "Couperose is isolated dilated vessels with no inflammatory process; they are cleared by targeted coagulation. Rosacea is a disease with erythema, flushing, and often papules and pustules; it needs comprehensive management with medical support. The two look similar, so the diagnosis must be made by a doctor." },
    },
    {
      question: { uk: "Що провокує загострення розацеа?", ru: "Что провоцирует обострение розацеа?", en: "What triggers a rosacea flare-up?" },
      answer: { uk: "Найчастіші тригери — ультрафіолет, різкі перепади температур, гаряча їжа та напої, алкоголь, гострі страви, стрес, інтенсивні фізичні навантаження й агресивна косметика зі спиртом і абразивами. На консультації лікар допомагає скласти особистий список тригерів — саме він визначає, наскільки довгою буде ремісія.", ru: "Самые частые триггеры — ультрафиолет, резкие перепады температур, горячая еда и напитки, алкоголь, острые блюда, стресс, интенсивные физические нагрузки и агрессивная косметика со спиртом и абразивами. На консультации врач помогает составить личный список триггеров — именно он определяет, насколько долгой будет ремиссия.", en: "The most common triggers are UV light, sharp temperature changes, hot food and drinks, alcohol, spicy dishes, stress, intense exercise, and harsh cosmetics containing alcohol or abrasives. At the consultation the doctor helps you build a personal trigger list — that is what determines how long remission lasts." },
    },
  ],
},

];

// ════════════════════════════════════════════════════════════════════════════
async function idOf(table: "services" | "doctors", slug: string): Promise<string | null> {
  const rows = table === "services"
    ? await sql`SELECT id FROM services WHERE slug = ${slug}`
    : await sql`SELECT id FROM doctors WHERE slug = ${slug}`;
  return rows.length ? (rows[0].id as string) : null;
}

async function seedService(svc: ServiceSeed, meta: CsvMeta, categoryId: string, reviewerId: string | null) {
  let serviceId = await idOf("services", svc.slug);
  if (!serviceId) {
    serviceId = randomUUID();
    const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM services WHERE category_id = ${categoryId}`;
    await sql`INSERT INTO services(id, slug, category_id, title_uk, sort_order)
              VALUES(${serviceId}, ${svc.slug}, ${categoryId}, ${svc.title.uk}, ${Number(max) + 10})`;
    console.log(`  + created ${svc.slug} (sort ${Number(max) + 10})`);
  } else {
    console.log(`  ~ ${svc.slug} already exists — updating in place`);
  }

  await sql`
    UPDATE services SET
      category_id=${categoryId},
      title_uk=${svc.title.uk}, title_ru=${svc.title.ru}, title_en=${svc.title.en},
      h1_uk=${svc.h1.uk}, h1_ru=${svc.h1.ru}, h1_en=${svc.h1.en},
      summary_uk=${svc.summary.uk}, summary_ru=${svc.summary.ru}, summary_en=${svc.summary.en},
      procedure_length_uk=${svc.procedureLength.uk}, procedure_length_ru=${svc.procedureLength.ru}, procedure_length_en=${svc.procedureLength.en},
      effect_duration_uk=${svc.effectDuration.uk}, effect_duration_ru=${svc.effectDuration.ru}, effect_duration_en=${svc.effectDuration.en},
      sessions_recommended_uk=${svc.sessionsRecommended.uk}, sessions_recommended_ru=${svc.sessionsRecommended.ru}, sessions_recommended_en=${svc.sessionsRecommended.en},
      seo_title_uk=${meta.seoTitle.uk}, seo_title_ru=${meta.seoTitle.ru}, seo_title_en=${meta.seoTitle.en},
      seo_desc_uk=${meta.seoDesc.uk}, seo_desc_ru=${meta.seoDesc.ru}, seo_desc_en=${meta.seoDesc.en},
      reviewer_doctor_id=${reviewerId}, last_reviewed_at=${LAST_REVIEWED}
    WHERE id=${serviceId}`;

  // sections + FAQ (idempotent: wiped and rewritten)
  await sql`DELETE FROM content_sections WHERE owner_id=${serviceId} AND owner_type='service'`;
  await sql`DELETE FROM faq_items WHERE owner_id=${serviceId} AND owner_type='service'`;

  const sectionKeys: string[] = [];
  for (let i = 0; i < svc.sections.length; i++) {
    const sec = svc.sections[i];
    const id = randomUUID();
    sectionKeys.push(`section:${id}`);
    await sql`INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
              VALUES(${id}, 'service', ${serviceId}, ${i}, ${sec.type}::section_type, ${JSON.stringify(sectionData(sec))}::jsonb)`;
  }
  for (let i = 0; i < svc.faqs.length; i++) {
    const f = svc.faqs[i];
    await sql`INSERT INTO faq_items(owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
              VALUES('service', ${serviceId}, ${i}, ${f.question.uk}, ${f.question.ru}, ${f.question.en}, ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en})`;
  }
  await sql`UPDATE services SET block_order=${[...sectionKeys, ...FIXED_BLOCKS]} WHERE id=${serviceId}`;

  // doctors
  await sql`DELETE FROM service_doctors WHERE service_id=${serviceId}`;
  let d = 0;
  for (const docSlug of SERVICE_DOCTORS) {
    const docId = await idOf("doctors", docSlug);
    if (!docId) { console.warn(`    ⚠ doctor not found: ${docSlug}`); continue; }
    await sql`INSERT INTO service_doctors(service_id, doctor_id, sort_order) VALUES(${serviceId}, ${docId}, ${d++})`;
  }

  // equipment
  await sql`DELETE FROM service_equipment WHERE service_id=${serviceId}`;
  for (let i = 0; i < svc.equipment.length; i++) {
    await sql`INSERT INTO service_equipment(service_id, equipment_id, sort_order) VALUES(${serviceId}, ${svc.equipment[i]}, ${i})`;
  }

  // related services
  await sql`DELETE FROM service_related WHERE service_id=${serviceId}`;
  let r = 0;
  for (const relSlug of svc.related) {
    const relId = await idOf("services", relSlug);
    if (!relId) { console.warn(`    ⚠ related service not found: ${relSlug}`); continue; }
    await sql`INSERT INTO service_related(service_id, related_service_id, sort_order) VALUES(${serviceId}, ${relId}, ${r++})`;
  }

  console.log(`✓ ${svc.slug} — ${svc.sections.length} sections, ${svc.faqs.length} FAQs, ${svc.equipment.length} equipment, ${r} related`);
}

async function main() {
  const csvMeta = readMetaFromCsv();
  const missing = services.filter((s) => !csvMeta[s.slug]).map((s) => s.slug);
  if (missing.length) throw new Error(`No CSV metatags for: ${missing.join(", ")}`);

  const [cat] = await sql`SELECT id FROM service_categories WHERE slug = ${CATEGORY}`;
  if (!cat) throw new Error(`Category not found: ${CATEGORY}`);
  const reviewerId = await idOf("doctors", REVIEWER_DOCTOR);
  if (!reviewerId) console.warn(`⚠ reviewer doctor not found: ${REVIEWER_DOCTOR}`);

  // Pass 1: create rows first, so cross-references between the 7 new pages resolve.
  for (const svc of services) {
    if (!(await idOf("services", svc.slug))) {
      const id = randomUUID();
      const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM services WHERE category_id = ${cat.id}`;
      await sql`INSERT INTO services(id, slug, category_id, title_uk, sort_order)
                VALUES(${id}, ${svc.slug}, ${cat.id}, ${svc.title.uk}, ${Number(max) + 10})`;
      console.log(`+ pre-created ${svc.slug}`);
    }
  }
  // Pass 2: full content.
  for (const svc of services) await seedService(svc, csvMeta[svc.slug], cat.id, reviewerId);

  const check = await sql`
    SELECT slug, seo_title_uk, left(seo_desc_uk, 45) AS desc_uk, array_length(block_order, 1) AS blocks
    FROM services WHERE slug = ANY(${services.map((s) => s.slug)}) ORDER BY sort_order`;
  console.table(check);

  await sql.end();
  console.log("\nТЗ №6 — 7 laser/skin service pages DONE.");
}
main().catch((e) => { console.error(e); process.exit(1); });
