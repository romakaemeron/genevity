/**
 * TZ-v8 new-services — content seeding for 9 new service pages.
 *
 * Same pattern as seed-tz-v1-injectable-a.ts / seed-copy-v4-injectable-a.ts:
 * looks each service up by slug, warns if NOT FOUND, then fills content
 * (title, h1, key-facts, summary, sections, faq, block_order). It does NOT
 * create service rows — create the 9 skeletons in the admin dashboard first,
 * each under the category and with the exact slug listed below, then run this.
 *
 * Run: npx tsx scripts/seed-tz-v8-new-services.ts
 *
 * Service / category / slug map (set the slug manually in the admin editor):
 *   1. Лазерне омолодження              → apparatus-cosmetology / laser-rejuvenation
 *   2. Фотоомолодження                  → apparatus-cosmetology / photorejuvenation
 *   3. Збільшення губ                   → injectable-cosmetology / lip-augmentation
 *   4. Контурна пластика кутів щелепи   → injectable-cosmetology / jaw-contouring
 *   5. Контурна пластика носа           → injectable-cosmetology / nose-contouring
 *   6. Мезотерапія волосся              → injectable-cosmetology / hair-mesotherapy
 *   7. Крапельниця з екзосомами         → longevity              / exosome-iv-drip
 *   8. Лазерна епіляція бікіні          → laser-hair-removal     / laser-bikini
 *   9. Лазерна епіляція ніг             → laser-hair-removal     / laser-legs
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
type RichTextSection = { type: "richText"; heading: L; body: L; calloutBody?: L; heroImage?: string | null };
type IndicationsSection = { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] };
type StepsSection = { type: "steps"; heading: L; steps: { title: L; description: L }[] };
type BulletsSection = { type: "bullets"; heading: L; items: L[] };
type AnySection = RichTextSection | IndicationsSection | StepsSection | BulletsSection;

function sectionData(s: AnySection): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: s.heroImage ?? null };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  return {};
}

interface ServiceSeed {
  slug: string;
  title: L;
  h1?: L; // ⚠ ignored at seed time — H1 source of truth is META[slug].h1 (from the metatag CSV)
  summary: L;
  procedureLength?: L;
  effectDuration?: L;
  sessionsRecommended?: L;
  sections: AnySection[];
  faqs: { question: L; answer: L }[];
  blocks?: string[]; // page block order after the content sections; defaults to PROCEDURE_BLOCKS
}

// ─── Per-page H1 + SEO metatags (single source of truth) ────────────────────
// H1 ← "URL **/UA/RU/EN" columns, seoTitle ← "Title", seoDesc ← "Description"
// from "genevity.com.ua _ Технічне завдання №3 _ Метатеги" CSV. Consultations
// (not in the CSV) follow the established diagnostics-consultation voice.
interface Meta { category: string; h1: L; seoTitle: L; seoDesc: L }
const META: Record<string, Meta> = {
  "laser-rejuvenation": {
    category: "apparatus-cosmetology",
    h1: { uk: "Лазерне омолодження в Дніпрі", ru: "Лазерное омоложение в Днепре", en: "Laser rejuvenation in Dnipro" },
    seoTitle: { uk: "Лазерне омолодження шкіри в Дніпрі – Омолодження лазером", ru: "Лазерное омоложение кожи в Днепре – Лифтинг лазером", en: "Laser skin rejuvenation in Dnipro – Laser lifting" },
    seoDesc: { uk: "Процедура лазерного омолодження у Дніпрі 🤍 GENEVITY. Доступні ціни на інноваційне відновлення шкіри 💫 Ефект без операцій.", ru: "Процедура лазерного омоложения в Днепре 🤍 GENEVITY. Доступные цены на инновационное восстановление кожи 💫 Эффект без операций.", en: "Laser Rejuvenation Treatment in Dnipro 🤍 GENEVITY. Affordable prices for innovative skin restoration 💫 Results without surgery." },
  },
  "photorejuvenation": {
    category: "apparatus-cosmetology",
    h1: { uk: "Фотоомолодження в Дніпрі", ru: "Фотоомоложение в Днепре", en: "Photorejuvenation in Dnipro" },
    seoTitle: { uk: "Фотоомолодження шкіри в Дніпрі – Апаратне фотоомолодження", ru: "Фотоомоложение кожи в Днепре – Аппаратное фотоомоложение", en: "Skin photorejuvenation in Dnipro – IPL photorejuvenation" },
    seoDesc: { uk: "Процедура фотоомолодження у Дніпрі 🤍 GENEVITY. Доступні ціни на апаратне фотоомолодження шкіри 💫 Ефект без болю.", ru: "Процедура фотоомоложения в Днепре 🤍 GENEVITY. Доступные цены на аппаратное фотоомоложение кожи 💫 Эффект без боли.", en: "Photorejuvenation Treatment in Dnipro 🤍 GENEVITY. Affordable prices for non-invasive photorejuvenation 💫 Pain-free results." },
  },
  "lip-augmentation": {
    category: "injectable-cosmetology",
    h1: { uk: "Збільшення губ в Дніпрі", ru: "Увеличение губ в Днепре", en: "Lip augmentation in Dnipro" },
    seoTitle: { uk: "Збільшення губ в Дніпрі – корекція губ", ru: "Увеличение губ в Днепре – Коррекция губ", en: "Lip augmentation in Dnipro – Prices for lip augmentation" },
    seoDesc: { uk: "Професійне збільшення губ у Дніпрі 🤍 GENEVITY. Збільшити губи якісними філерами за доступною ціною 💫 Природний об’єм.", ru: "Профессиональная накачка губ в Днепре 🤍 GENEVITY. Накачать губы качественными филлерами по доступной цене 💫 Естественный объем.", en: "Professional lip augmentation in Dnipro 🤍 GENEVITY. Get fuller lips with high-quality fillers at an affordable price 💫 Natural volume." },
  },
  "jaw-contouring": {
    category: "injectable-cosmetology",
    h1: { uk: "Контурна пластика кутів щелепи в Дніпрі", ru: "Контурная пластика углов челюсти в Днепре", en: "Jaw angle contouring in Dnipro" },
    seoTitle: { uk: "Контурна пластика кутів нижньої щелепи в Дніпрі – Кути Джолі", ru: "Контурная пластика углов нижней челюсти в Днепре – Профиль Джоли филлерами", en: "Contour plastic of the angles of lower jaw in Dnipro – Jolie angles price" },
    seoDesc: { uk: "Ефективна процедура «кути Джолі» у Дніпрі 🤍 GENEVITY. Бездоганний профіль Джолі за допомогою контурної пластики за доступною ціною 💫 Чіткий овал.", ru: "Эффективная процедура углы Джоли в Днепре 🤍 GENEVITY. Безупречный профиль Джоли с помощью контурной пластики по доступной цене 💫 Четкий овал.", en: "Effective “Jolie’s Cheekbones” procedure in Dnipro 🤍 GENEVITY. Achieve a flawless Jolie profile with contouring at an affordable price 💫 Defined facial contours." },
  },
  "nose-contouring": {
    category: "injectable-cosmetology",
    h1: { uk: "Контурна пластика носа в Дніпрі", ru: "Контурная пластика носа в Днепре", en: "Nose contouring in Dnipro" },
    seoTitle: { uk: "Контурна пластика носа філером в Дніпрі – Безопераційна ринопластика", ru: "Контурная пластика носа филлером в Днепре – Безоперационная ринопластика", en: "Contour plastic of the nose with filler in Dnipro – Non-surgical rhinoplasty" },
    seoDesc: { uk: "Безпечна корекція носа філером у Дніпрі 🤍 GENEVITY. Доступна ціна безопераційної ринопластики для вирівнювання форми 💫 Безболісно.", ru: "Безопасная коррекция носа филлером в Днепре 🤍 GENEVITY. Доступная цена безоперационной ринопластики для выравнивания формы 💫 Безболезненно.", en: "Safe nose correction with fillers in Dnipro 🤍 GENEVITY. Affordable non-surgical rhinoplasty to refine the shape 💫 Pain-free." },
  },
  "hair-mesotherapy": {
    category: "injectable-cosmetology",
    h1: { uk: "Мезотерапія волосся в Дніпрі", ru: "Мезотерапия волос в Днепре", en: "Hair mesotherapy in Dnipro" },
    seoTitle: { uk: "Мезотерапія для волосся в Дніпрі – Мезотерапія шкіри голови", ru: "Мезотерапия для волос в Днепре – Мезотерапия волосистой части", en: "Hair mesotherapy in Dnipro – Injections for hair growth" },
    seoDesc: { uk: "Професійна мезотерапія шкіри голови в Дніпрі 🤍 GENEVITY. Вигідна ціна мезотерапії волосся від досвідчених лікарів 💫 Зупиніть випадіння.", ru: "Профессиональная мезотерапия кожи головы в Днепре 🤍 GENEVITY. Выгодная цена мезотерапии волос от опытных врачей 💫 Остановите выпадение.", en: "Professional scalp mesotherapy in Dnipro 🤍 GENEVITY. Great value for hair mesotherapy from experienced doctors 💫 Stop hair loss." },
  },
  "exosome-iv-drip": {
    category: "longevity",
    h1: { uk: "Омолоджувальна крапельниця з екзосомами в Дніпрі", ru: "Омолаживающая капельница с экзосомами в Днепре", en: "Rejuvenating dropper with exosomes in Dnipro" },
    seoTitle: { uk: "Омолоджувальна крапельниця з екзосомами в Дніпрі – Антивікова терапія", ru: "Омолаживающая капельница с экзосомами в Днепре – Антивозрастная терапия", en: "Rejuvenating IV drip with exosomes in Dnipro – Anti-aging therapy" },
    seoDesc: { uk: "Інноваційна крапельниця молодості в Дніпрі 🤍 GENEVITY. Ефективні крапельниці для омолодження та швидкого відновлення всього організму за доступною ціною 💫 Здоров’я та краса.", ru: "Инновационная капельница молодости в Днепре 🤍 GENEVITY. Эффективные капельницы для омоложения и быстрого восстановления всего организма по доступной цене 💫 Здоровье и красота.", en: "Innovative “youth” IV drip in Dnipro 🤍 GENEVITY. Effective IV drips for rejuvenation and rapid recovery of the entire body at an affordable price 💫 Health and beauty." },
  },
  "laser-bikini": {
    category: "laser-hair-removal",
    h1: { uk: "Лазерна епіляція бікіні в Дніпрі", ru: "Лазерная эпиляция бикини в Днепре", en: "Bikini laser hair removal in Dnipro" },
    seoTitle: { uk: "Лазерна епіляція зони бікіні в Дніпрі – Лазерна епіляція глибокого бікіні", ru: "Лазерная эпиляция зоны бикини в Днепре – Лазерная эпиляция глубокое бикини", en: "Laser hair removal of bikini zone in Dnipro – Deep bikini laser hair removal" },
    seoDesc: { uk: "Лазерна епіляція інтимних зон у Дніпрі 🤍 GENEVITY. Приваблива лазерна епіляція бікіні для бездоганного результату за доступною ціною 💫 Гладкість шкіри.", ru: "Лазерная эпиляция интимных зон в Днепре 🤍 GENEVITY. Привлекательная лазерная эпиляция бикини для безупречного результата по доступной цене 💫 Гладкость кожи.", en: "Laser hair removal for intimate areas in Dnipro 🤍 GENEVITY. Attractive bikini laser hair removal for flawless results at an affordable price 💫 Smooth skin." },
  },
  "laser-legs": {
    category: "laser-hair-removal",
    h1: { uk: "Лазерна епіляція ніг в Дніпрі", ru: "Лазерная эпиляция ног в Днепре", en: "Leg laser hair removal in Dnipro" },
    seoTitle: { uk: "Лазерна епіляція ніг в Дніпрі – Лазерна епіляція ноги повністю", ru: "Лазерная эпиляция ног в Днепре – Лазерная эпиляция ноги полностью", en: "Laser hair removal of legs in Dnipro – Full legs laser hair removal" },
    seoDesc: { uk: "Професійне лазерне видалення волосся на ногах у Дніпрі 🤍 GENEVITY. Лазерна епіляція ніг на сертифікованому обладнанні за доступною ціною 💫 Ідеальна гладкість.", ru: "Профессиональное лазерное удаление волос на ногах в Днепре 🤍 GENEVITY. Лазерная эпиляция ног на сертифицированном оборудовании по доступной цене 💫 Идеальная гладкость.", en: "Professional laser hair removal on the legs in Dnipro 🤍 GENEVITY. Laser hair removal on the legs using certified equipment at an affordable price 💫 Perfect smoothness." },
  },
  // ─── Consultations (not in the CSV — established diagnostics voice) ─────────
  "endocrinologist": {
    category: "diagnostics",
    h1: { uk: "Ендокринолог в Дніпрі", ru: "Эндокринолог в Днепре", en: "Endocrinologist in Dnipro" },
    seoTitle: { uk: "Ендокринолог у Дніпрі – консультація ендокринолога в GENEVITY", ru: "Эндокринолог в Днепре – консультация эндокринолога в GENEVITY", en: "Endocrinologist in Dnipro – Endocrinologist Consultation at GENEVITY" },
    seoDesc: { uk: "Консультація ендокринолога у Дніпрі 🤍 GENEVITY. Щитоподібна залоза, діабет, гормональні порушення 💫 Індивідуальна схема лікування.", ru: "Консультация эндокринолога в Днепре 🤍 GENEVITY. Щитовидная железа, диабет, гормональные нарушения 💫 Индивидуальная схема лечения.", en: "Endocrinologist consultation in Dnipro 🤍 GENEVITY. Thyroid, diabetes, hormonal disorders 💫 Individual treatment plan." },
  },
  "plastic-surgeon": {
    category: "diagnostics",
    h1: { uk: "Пластичний хірург в Дніпрі", ru: "Пластический хирург в Днепре", en: "Plastic surgeon in Dnipro" },
    seoTitle: { uk: "Пластичний хірург у Дніпрі – консультація пластичного хірурга в GENEVITY", ru: "Пластический хирург в Днепре – консультация пластического хирурга в GENEVITY", en: "Plastic Surgeon in Dnipro – Plastic Surgeon Consultation at GENEVITY" },
    seoDesc: { uk: "Консультація пластичного хірурга у Дніпрі 🤍 GENEVITY. Естетична та реконструктивна хірургія, аналіз показань 💫 Хірурги вищої категорії.", ru: "Консультация пластического хирурга в Днепре 🤍 GENEVITY. Эстетическая и реконструктивная хирургия, анализ показаний 💫 Хирурги высшей категории.", en: "Plastic surgeon consultation in Dnipro 🤍 GENEVITY. Aesthetic and reconstructive surgery, indications review 💫 Top-category surgeons." },
  },
};

const services: ServiceSeed[] = [
  // ─── 1. ЛАЗЕРНЕ ОМОЛОДЖЕННЯ (apparatus-cosmetology / laser-rejuvenation) ───
  {
    slug: "laser-rejuvenation",
    title: { uk: "Лазерне омолодження", ru: "Лазерное омоложение", en: "Laser Rejuvenation" },
    h1: {
      uk: "Лазерне омолодження обличчя у Дніпрі — оновлення шкіри фракційним лазером",
      ru: "Лазерное омоложение лица в Днепре — обновление кожи фракционным лазером",
      en: "Laser Facial Rejuvenation in Dnipro — Skin Renewal with a Fractional Laser",
    },
    summary: {
      uk: "Лазерне омолодження обличчя у GENEVITY на фракційному CO₂-лазері AcuPulse: вирівнювання текстури, корекція зморщок і рубців, запуск синтезу колагену. Медичний нагляд, Дніпро.",
      ru: "Лазерное омоложение лица в GENEVITY на фракционном CO₂-лазере AcuPulse: выравнивание текстуры, коррекция морщин и рубцов, запуск синтеза коллагена. Медицинский контроль, Днепр.",
      en: "Laser facial rejuvenation at GENEVITY with the AcuPulse fractional CO₂ laser: texture refinement, correction of wrinkles and scars, and collagen synthesis. Medical supervision, Dnipro.",
    },
    procedureLength: { uk: "30–60 хвилин", ru: "30–60 минут", en: "30–60 minutes" },
    effectDuration: { uk: "12–24 місяці", ru: "12–24 месяца", en: "12–24 months" },
    sessionsRecommended: { uk: "1–3 процедури", ru: "1–3 процедуры", en: "1–3 procedures" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерне омолодження — фракційне оновлення шкіри обличчя",
          ru: "Лазерное омоложение — фракционное обновление кожи лица",
          en: "Laser Rejuvenation — Fractional Renewal of Facial Skin",
        },
        body: {
          uk: "Лазерне омолодження обличчя — це контрольований вплив лазерного променя на шкіру для запуску її природного оновлення. Фракційний CO₂-лазер AcuPulse формує в шкірі сітку мікроскопічних зон прогрівання, залишаючи тканину навколо незмінною. Завдяки цьому шкіра відновлюється швидше, ніж після суцільного шліфування, а період відновлення коротший.\n\nУ відповідь на мікротравму запускається синтез нового колагену та еластину. Поступово вирівнюється рельєф, звужуються пори, світлішають пігментні плями, підтягується контур. Це доказовий механізм — не косметичний ефект «на поверхні», а перебудова дерми зсередини.\n\nГлибину і щільність впливу лікар підбирає індивідуально: делікатний режим для тонкого оновлення і сяйва або інтенсивніший — для корекції рубців постакне, глибших зморщок і вираженої фотопошкодженості. Перед процедурою обов'язкова консультація та оцінка фототипу шкіри.\n\nЛазерне омолодження у GENEVITY проводять сертифіковані лікарі на апараті AcuPulse під медичним наглядом. Результат розвивається поступово протягом 4–8 тижнів і зберігається до 1–2 років за умови догляду та фотозахисту.",
          ru: "Лазерное омоложение лица — это контролируемое воздействие лазерного луча на кожу для запуска её естественного обновления. Фракционный CO₂-лазер AcuPulse формирует в коже сетку микроскопических зон прогревания, оставляя ткань вокруг нетронутой. Благодаря этому кожа восстанавливается быстрее, чем после сплошной шлифовки, а период восстановления короче.\n\nВ ответ на микротравму запускается синтез нового коллагена и эластина. Постепенно выравнивается рельеф, сужаются поры, светлеют пигментные пятна, подтягивается контур. Это доказательный механизм — не косметический эффект «на поверхности», а перестройка дермы изнутри.\n\nГлубину и плотность воздействия врач подбирает индивидуально: деликатный режим для тонкого обновления и сияния или более интенсивный — для коррекции рубцов постакне, глубоких морщин и выраженной фотоповреждённости. Перед процедурой обязательна консультация и оценка фототипа кожи.\n\nЛазерное омоложение в GENEVITY проводят сертифицированные врачи на аппарате AcuPulse под медицинским контролем. Результат развивается постепенно в течение 4–8 недель и сохраняется до 1–2 лет при условии ухода и фотозащиты.",
          en: "Laser facial rejuvenation is a controlled application of a laser beam to the skin to trigger its natural renewal. The AcuPulse fractional CO₂ laser creates a grid of microscopic heated zones in the skin while leaving the surrounding tissue intact. As a result, the skin heals faster than after full resurfacing, and the recovery period is shorter.\n\nIn response to this micro-injury, the synthesis of new collagen and elastin begins. The skin texture gradually evens out, pores tighten, pigment spots lighten, and the contour firms. This is an evidence-based mechanism — not a surface cosmetic effect, but a remodelling of the dermis from within.\n\nThe depth and density of treatment are selected individually: a gentle mode for subtle renewal and radiance, or a more intensive one for correcting post-acne scars, deeper wrinkles, and pronounced photodamage. A consultation and assessment of the skin phototype are mandatory beforehand.\n\nLaser rejuvenation at GENEVITY is performed by certified doctors on the AcuPulse device under medical supervision. The result develops gradually over 4–8 weeks and lasts up to 1–2 years with proper care and sun protection.",
        },
        calloutBody: {
          uk: "Перші зміни помітні після загоєння (7–10 днів). Повний результат формується за 4–8 тижнів і зберігається до 1–2 років.",
          ru: "Первые изменения заметны после заживления (7–10 дней). Полный результат формируется за 4–8 недель и сохраняется до 1–2 лет.",
          en: "First changes appear after healing (7–10 days). The full result forms over 4–8 weeks and lasts up to 1–2 years.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до лазерного омолодження", ru: "Показания к лазерному омоложению", en: "Indications for Laser Rejuvenation" },
        indications: [
          { uk: "Дрібні та середні зморшки, нерівний рельєф шкіри", ru: "Мелкие и средние морщины, неровный рельеф кожи", en: "Fine to moderate wrinkles and uneven skin texture" },
          { uk: "Рубці постакне та розширені пори", ru: "Рубцы постакне и расширенные поры", en: "Post-acne scars and enlarged pores" },
          { uk: "Пігментні плями та ознаки фотостаріння", ru: "Пигментные пятна и признаки фотостарения", en: "Pigment spots and signs of photoageing" },
          { uk: "Втрата пружності та тьмяний колір обличчя", ru: "Потеря упругости и тусклый цвет лица", en: "Loss of firmness and a dull complexion" },
          { uk: "Розтяжки та рубці поза обличчям (за показаннями)", ru: "Растяжки и рубцы вне лица (по показаниям)", en: "Stretch marks and scars beyond the face (as indicated)" },
          { uk: "Підготовка шкіри до комплексного омолодження", ru: "Подготовка кожи к комплексному омоложению", en: "Skin preparation for a comprehensive rejuvenation plan" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Свіжа засмага та активне сонце перед процедурою", ru: "⚠ Свежий загар и активное солнце перед процедурой", en: "⚠ Fresh tan or active sun exposure before the procedure" },
          { uk: "⚠ Активні запалення, герпес або інфекції шкіри в зоні впливу", ru: "⚠ Активные воспаления, герпес или инфекции кожи в зоне воздействия", en: "⚠ Active inflammation, herpes, or skin infection in the treatment area" },
          { uk: "⚠ Схильність до келоїдних рубців", ru: "⚠ Склонность к келоидным рубцам", en: "⚠ Tendency to form keloid scars" },
          { uk: "⚠ Прийом фотосенсибілізуючих препаратів та ретиноїдів", ru: "⚠ Приём фотосенсибилизирующих препаратов и ретиноидов", en: "⚠ Use of photosensitising medication or retinoids" },
          { uk: "⚠ Онкологічні захворювання в стадії лікування", ru: "⚠ Онкологические заболевания в стадии лечения", en: "⚠ Oncological disease under active treatment" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура лазерного омолодження", ru: "Как проходит процедура лазерного омоложения", en: "How the Laser Rejuvenation Procedure Works" },
        steps: [
          { title: { uk: "Консультація та діагностика шкіри", ru: "Консультация и диагностика кожи", en: "Consultation and skin assessment" }, description: { uk: "Лікар визначає фототип, оцінює стан шкіри та задачі, підбирає режим впливу і пояснює період відновлення.", ru: "Врач определяет фототип, оценивает состояние кожи и задачи, подбирает режим воздействия и объясняет период восстановления.", en: "The doctor determines the phototype, assesses skin condition and goals, selects the treatment mode, and explains the recovery period." } },
          { title: { uk: "Підготовка та анестезія", ru: "Подготовка и анестезия", en: "Preparation and anaesthesia" }, description: { uk: "Шкіру очищають і наносять аплікаційний анестетик на 30–40 хвилин для комфорту під час процедури.", ru: "Кожу очищают и наносят аппликационный анестетик на 30–40 минут для комфорта во время процедуры.", en: "The skin is cleansed and a topical anaesthetic is applied for 30–40 minutes for comfort during the procedure." } },
          { title: { uk: "Лазерна обробка", ru: "Лазерная обработка", en: "Laser treatment" }, description: { uk: "Лікар проходить зони обличчя фракційним лазером за індивідуальним протоколом. Тривалість — 30–60 хвилин.", ru: "Врач обрабатывает зоны лица фракционным лазером по индивидуальному протоколу. Длительность — 30–60 минут.", en: "The doctor treats facial zones with the fractional laser per an individual protocol. Duration: 30–60 minutes." } },
          { title: { uk: "Відновлення та догляд", ru: "Восстановление и уход", en: "Recovery and aftercare" }, description: { uk: "Перші дні — почервоніння та легкий набряк, потім дрібне лущення. Обов'язковий SPF 50+ та зволоження. Загоєння — 7–10 днів.", ru: "Первые дни — покраснение и лёгкий отёк, затем мелкое шелушение. Обязателен SPF 50+ и увлажнение. Заживление — 7–10 дней.", en: "The first days bring redness and mild swelling, then light flaking. SPF 50+ and hydration are mandatory. Healing takes 7–10 days." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості лазерного омолодження", ru: "Преимущества и особенности лазерного омоложения", en: "Benefits and Key Features of Laser Rejuvenation" },
        items: [
          { uk: "Комплексний результат: рельєф, тон, пори та пружність одночасно", ru: "Комплексный результат: рельеф, тон, поры и упругость одновременно", en: "Comprehensive result: texture, tone, pores, and firmness at once" },
          { uk: "Фракційний принцип скорочує період відновлення порівняно зі суцільним шліфуванням", ru: "Фракционный принцип сокращает период восстановления по сравнению со сплошной шлифовкой", en: "The fractional principle shortens recovery compared with full resurfacing" },
          { uk: "Запускає власний синтез колагену — ефект розвивається тижнями і триває довго", ru: "Запускает собственный синтез коллагена — эффект развивается неделями и держится долго", en: "Triggers your own collagen synthesis — the effect builds over weeks and lasts long" },
          { uk: "Регульована глибина: від делікатного оновлення до корекції рубців", ru: "Регулируемая глубина: от деликатного обновления до коррекции рубцов", en: "Adjustable depth: from gentle renewal to scar correction" },
          { uk: "⚠ Потрібен період відновлення 7–10 днів — плануйте процедуру заздалегідь", ru: "⚠ Нужен период восстановления 7–10 дней — планируйте процедуру заранее", en: "⚠ Requires 7–10 days of recovery — plan the procedure in advance" },
          { uk: "⚠ Не проводиться на засмаглій шкірі та потребує суворого фотозахисту після", ru: "⚠ Не проводится на загорелой коже и требует строгой фотозащиты после", en: "⚠ Not performed on tanned skin and requires strict sun protection afterwards" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки процедур лазерного омолодження потрібно?", ru: "Сколько процедур лазерного омоложения нужно?", en: "How many laser rejuvenation sessions are needed?" },
        answer: { uk: "Для делікатного оновлення часто достатньо однієї процедури з повторенням раз на рік. Для корекції рубців постакне чи вираженого фотостаріння лікар може рекомендувати курс із 2–3 процедур з інтервалом 4–6 тижнів. Точну схему складають на консультації після оцінки шкіри.", ru: "Для деликатного обновления часто достаточно одной процедуры с повторением раз в год. Для коррекции рубцов постакне или выраженного фотостарения врач может рекомендовать курс из 2–3 процедур с интервалом 4–6 недель. Точную схему составляют на консультации после оценки кожи.", en: "For gentle renewal, a single procedure repeated once a year is often enough. For post-acne scars or pronounced photoageing, the doctor may recommend a course of 2–3 procedures at 4–6 week intervals. The exact plan is set at consultation after assessing the skin." },
      },
      {
        question: { uk: "Який період відновлення після лазерного омолодження?", ru: "Какой период восстановления после лазерного омоложения?", en: "What is the recovery period after laser rejuvenation?" },
        answer: { uk: "У перші 2–3 дні шкіра почервоніла та злегка набрякла, потім починається дрібне лущення. Основне загоєння триває 7–10 днів. Увесь цей час обов'язкові зволоження та SPF 50+. Декоративну косметику зазвичай можна повертати після завершення лущення за рекомендацією лікаря.", ru: "В первые 2–3 дня кожа покрасневшая и слегка отёчная, затем начинается мелкое шелушение. Основное заживление длится 7–10 дней. Всё это время обязательны увлажнение и SPF 50+. Декоративную косметику обычно можно возвращать после завершения шелушения по рекомендации врача.", en: "For the first 2–3 days the skin is red and slightly swollen, then light flaking begins. The main healing takes 7–10 days. Hydration and SPF 50+ are mandatory throughout. Makeup can usually be resumed once flaking ends, on the doctor's advice." },
      },
      {
        question: { uk: "Чи можна поєднувати лазерне омолодження з іншими процедурами?", ru: "Можно ли сочетать лазерное омоложение с другими процедурами?", en: "Can laser rejuvenation be combined with other procedures?" },
        answer: { uk: "Так, але з дотриманням інтервалів. Біоревіталізацію та мезотерапію зазвичай проводять до лазера або через 2–3 тижні після нього для кращого відновлення. Ботулінотерапію та контурну пластику планують окремими візитами. Комплексний план лікар складає індивідуально на консультації.", ru: "Да, но с соблюдением интервалов. Биоревитализацию и мезотерапию обычно проводят до лазера или через 2–3 недели после него для лучшего восстановления. Ботулинотерапию и контурную пластику планируют отдельными визитами. Комплексный план врач составляет индивидуально на консультации.", en: "Yes, but with appropriate intervals. Biorevitalisation and mesotherapy are usually done before the laser or 2–3 weeks after it to support recovery. Botulinum therapy and contour correction are scheduled as separate visits. The doctor creates a comprehensive plan individually at consultation." },
      },
    ],
  },

  // ─── 2. ФОТООМОЛОДЖЕННЯ (apparatus-cosmetology / photorejuvenation) ───
  {
    slug: "photorejuvenation",
    title: { uk: "Фотоомолодження", ru: "Фотоомоложение", en: "Photorejuvenation" },
    h1: {
      uk: "Фотоомолодження IPL у Дніпрі — рівний тон і сяйво шкіри",
      ru: "Фотоомоложение IPL в Днепре — ровный тон и сияние кожи",
      en: "IPL Photorejuvenation in Dnipro — Even Tone and Radiant Skin",
    },
    summary: {
      uk: "Фотоомолодження на платформі M22 Stellar Black у GENEVITY: корекція пігментації, судинних зірочок і почервоніння, вирівнювання тону без періоду відновлення. Дніпро, медичний нагляд.",
      ru: "Фотоомоложение на платформе M22 Stellar Black в GENEVITY: коррекция пигментации, сосудистых звёздочек и покраснений, выравнивание тона без периода восстановления. Днепр, медицинский контроль.",
      en: "Photorejuvenation with the M22 Stellar Black platform at GENEVITY: correction of pigmentation, vascular lesions, and redness, with even tone and no downtime. Dnipro, medical supervision.",
    },
    procedureLength: { uk: "20–40 хвилин", ru: "20–40 минут", en: "20–40 minutes" },
    effectDuration: { uk: "6–12 місяців", ru: "6–12 месяцев", en: "6–12 months" },
    sessionsRecommended: { uk: "3–5 процедур", ru: "3–5 процедур", en: "3–5 procedures" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Фотоомолодження — вирівнювання тону світлом IPL",
          ru: "Фотоомоложение — выравнивание тона светом IPL",
          en: "Photorejuvenation — Evening Out Skin Tone with IPL Light",
        },
        body: {
          uk: "Фотоомолодження — це вплив на шкіру широкосмуговим імпульсним світлом (IPL) для корекції пігментації та судинних недосконалостей. У GENEVITY процедуру виконують на платформі M22 Stellar Black із точними фільтрами, що дозволяють працювати прицільно з конкретною задачею.\n\nСвітлова енергія поглинається мішенню: меланіном у пігментних плямах або гемоглобіном у розширених судинах. Мішень нагрівається і руйнується, не пошкоджуючи навколишню шкіру. Плями темнішають і відходять упродовж кількох днів, судинні зірочки бліднуть, а загальний тон обличчя стає рівнішим і світлішим.\n\nОкрім видимих недосконалостей, IPL м'яко стимулює оновлення шкіри: вона стає більш гладкою та сяючою. Це делікатна процедура без періоду відновлення — повертатися до звичного ритму можна одразу, дотримуючись фотозахисту.\n\nФотоомолодження у GENEVITY проводять сертифіковані лікарі після оцінки фототипу та характеру пігментації. Найкращий результат дає курс із кількох процедур, а ефект підтримують повторними сеансами раз на рік.",
          ru: "Фотоомоложение — это воздействие на кожу широкополосным импульсным светом (IPL) для коррекции пигментации и сосудистых несовершенств. В GENEVITY процедуру выполняют на платформе M22 Stellar Black с точными фильтрами, позволяющими работать прицельно с конкретной задачей.\n\nСветовая энергия поглощается мишенью: меланином в пигментных пятнах или гемоглобином в расширенных сосудах. Мишень нагревается и разрушается, не повреждая окружающую кожу. Пятна темнеют и отходят в течение нескольких дней, сосудистые звёздочки бледнеют, а общий тон лица становится ровнее и светлее.\n\nПомимо видимых несовершенств, IPL мягко стимулирует обновление кожи: она становится более гладкой и сияющей. Это деликатная процедура без периода восстановления — возвращаться к привычному ритму можно сразу, соблюдая фотозащиту.\n\nФотоомоложение в GENEVITY проводят сертифицированные врачи после оценки фототипа и характера пигментации. Лучший результат даёт курс из нескольких процедур, а эффект поддерживают повторными сеансами раз в год.",
          en: "Photorejuvenation uses intense pulsed light (IPL) to correct pigmentation and vascular imperfections. At GENEVITY the procedure is performed on the M22 Stellar Black platform with precise filters that allow targeted work on a specific concern.\n\nThe light energy is absorbed by its target: melanin in pigment spots or haemoglobin in dilated vessels. The target heats up and breaks down without damaging the surrounding skin. Spots darken and flake away over several days, vascular lesions fade, and the overall complexion becomes more even and brighter.\n\nBeyond visible imperfections, IPL gently stimulates skin renewal, making it smoother and more radiant. This is a delicate procedure with no downtime — you can return to your routine immediately while following sun protection.\n\nPhotorejuvenation at GENEVITY is performed by certified doctors after assessing the phototype and the nature of the pigmentation. The best result comes from a course of several procedures, with the effect maintained by annual sessions.",
        },
        calloutBody: {
          uk: "Пігментні плями темнішають і відходять за 5–7 днів. Рівний тон і сяйво наростають упродовж курсу. Без періоду відновлення.",
          ru: "Пигментные пятна темнеют и отходят за 5–7 дней. Ровный тон и сияние нарастают в течение курса. Без периода восстановления.",
          en: "Pigment spots darken and flake away in 5–7 days. Even tone and radiance build over the course. No downtime.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до фотоомолодження", ru: "Показания к фотоомоложению", en: "Indications for Photorejuvenation" },
        indications: [
          { uk: "Пігментні плями, веснянки, наслідки фотостаріння", ru: "Пигментные пятна, веснушки, последствия фотостарения", en: "Pigment spots, freckles, and the effects of photoageing" },
          { uk: "Судинні зірочки та купероз на обличчі", ru: "Сосудистые звёздочки и купероз на лице", en: "Vascular lesions and couperose on the face" },
          { uk: "Стійке почервоніння та нерівний тон шкіри", ru: "Стойкое покраснение и неровный тон кожи", en: "Persistent redness and uneven skin tone" },
          { uk: "Тьмяна шкіра без сяйва", ru: "Тусклая кожа без сияния", en: "Dull skin lacking radiance" },
          { uk: "Розширені пори та ознаки раннього старіння", ru: "Расширенные поры и признаки раннего старения", en: "Enlarged pores and early signs of ageing" },
          { uk: "Профілактика фотостаріння для шкіри обличчя, шиї, декольте, рук", ru: "Профилактика фотостарения для кожи лица, шеи, декольте, рук", en: "Photoageing prevention for the face, neck, décolletage, and hands" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Свіжа засмага та засмага в солярії", ru: "⚠ Свежий загар и загар в солярии", en: "⚠ Fresh tan or tanning-bed exposure" },
          { uk: "⚠ Дуже смаглява або темна шкіра (високий фототип)", ru: "⚠ Очень смуглая или тёмная кожа (высокий фототип)", en: "⚠ Very dark skin (high phototype)" },
          { uk: "⚠ Прийом фотосенсибілізуючих препаратів", ru: "⚠ Приём фотосенсибилизирующих препаратов", en: "⚠ Use of photosensitising medication" },
          { uk: "⚠ Активні запалення, герпес або інфекції шкіри в зоні впливу", ru: "⚠ Активные воспаления, герпес или инфекции кожи в зоне воздействия", en: "⚠ Active inflammation, herpes, or skin infection in the treatment area" },
          { uk: "⚠ Онкологічні захворювання в стадії лікування", ru: "⚠ Онкологические заболевания в стадии лечения", en: "⚠ Oncological disease under active treatment" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура фотоомолодження", ru: "Как проходит процедура фотоомоложения", en: "How the Photorejuvenation Procedure Works" },
        steps: [
          { title: { uk: "Консультація та оцінка пігментації", ru: "Консультация и оценка пигментации", en: "Consultation and pigmentation assessment" }, description: { uk: "Лікар визначає фототип, характер плям і судин, підбирає фільтр і параметри спалаху.", ru: "Врач определяет фототип, характер пятен и сосудов, подбирает фильтр и параметры вспышки.", en: "The doctor determines the phototype, the nature of spots and vessels, and selects the filter and pulse parameters." } },
          { title: { uk: "Підготовка шкіри", ru: "Подготовка кожи", en: "Skin preparation" }, description: { uk: "Шкіру очищають, наносять контактний гель і надягають захисні окуляри пацієнту.", ru: "Кожу очищают, наносят контактный гель и надевают пациенту защитные очки.", en: "The skin is cleansed, contact gel is applied, and the patient is given protective eyewear." } },
          { title: { uk: "Обробка спалахами IPL", ru: "Обработка вспышками IPL", en: "IPL flash treatment" }, description: { uk: "Лікар обробляє зону світловими імпульсами. Відчуття — короткі теплі поколювання. Тривалість — 20–40 хвилин.", ru: "Врач обрабатывает зону световыми импульсами. Ощущения — короткие тёплые покалывания. Длительность — 20–40 минут.", en: "The doctor treats the area with light pulses. The sensation is brief, warm pinpricks. Duration: 20–40 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "Можливе легке почервоніння на кілька годин. Плями темнішають і відходять за 5–7 днів. Обов'язковий SPF 50+ та відмова від сонця.", ru: "Возможно лёгкое покраснение на несколько часов. Пятна темнеют и отходят за 5–7 дней. Обязателен SPF 50+ и отказ от солнца.", en: "Mild redness may last a few hours. Spots darken and flake away within 5–7 days. SPF 50+ and sun avoidance are mandatory." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості фотоомолодження", ru: "Преимущества и особенности фотоомоложения", en: "Benefits and Key Features of Photorejuvenation" },
        items: [
          { uk: "Працює одразу з пігментацією, судинами та тоном шкіри", ru: "Работает сразу с пигментацией, сосудами и тоном кожи", en: "Targets pigmentation, vessels, and skin tone at the same time" },
          { uk: "Без періоду відновлення — повернення до звичного ритму одразу", ru: "Без периода восстановления — возвращение к привычному ритму сразу", en: "No downtime — return to your routine immediately" },
          { uk: "Точні фільтри M22 Stellar Black дозволяють прицільну роботу", ru: "Точные фильтры M22 Stellar Black позволяют прицельную работу", en: "Precise M22 Stellar Black filters enable targeted treatment" },
          { uk: "Підходить для обличчя, шиї, декольте та рук", ru: "Подходит для лица, шеи, декольте и рук", en: "Suitable for the face, neck, décolletage, and hands" },
          { uk: "⚠ Не проводиться на засмаглій шкірі та для високих фототипів", ru: "⚠ Не проводится на загорелой коже и для высоких фототипов", en: "⚠ Not performed on tanned skin or for high phototypes" },
          { uk: "⚠ Ефект курсовий — для стійкого результату потрібно 3–5 процедур", ru: "⚠ Эффект курсовой — для стойкого результата нужно 3–5 процедур", en: "⚠ Course-based effect — 3–5 procedures are needed for a lasting result" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Чим фотоомолодження відрізняється від лазерного омолодження?", ru: "Чем фотоомоложение отличается от лазерного омоложения?", en: "How does photorejuvenation differ from laser rejuvenation?" },
        answer: { uk: "Фотоомолодження (IPL) працює переважно з тоном — пігментацією, судинами та почервонінням, і не потребує періоду відновлення. Лазерне омолодження працює з рельєфом — зморшками, рубцями, текстурою — і має період загоєння. Часто їх поєднують у комплексному плані: лікар визначає послідовність на консультації.", ru: "Фотоомоложение (IPL) работает преимущественно с тоном — пигментацией, сосудами и покраснением, и не требует периода восстановления. Лазерное омоложение работает с рельефом — морщинами, рубцами, текстурой — и имеет период заживления. Часто их сочетают в комплексном плане: врач определяет последовательность на консультации.", en: "Photorejuvenation (IPL) mainly addresses tone — pigmentation, vessels, and redness — with no downtime. Laser rejuvenation addresses texture — wrinkles, scars, surface — and has a healing period. They are often combined in a comprehensive plan; the doctor sets the sequence at consultation." },
      },
      {
        question: { uk: "Скільки сеансів фотоомолодження потрібно?", ru: "Сколько сеансов фотоомоложения нужно?", en: "How many photorejuvenation sessions are needed?" },
        answer: { uk: "Зазвичай курс складає 3–5 процедур з інтервалом 3–4 тижні залежно від вираженості пігментації та судин. Перші зміни помітні вже після першого сеансу, а рівний тон і сяйво наростають упродовж курсу. Для підтримання — 1 процедура на рік.", ru: "Обычно курс составляет 3–5 процедур с интервалом 3–4 недели в зависимости от выраженности пигментации и сосудов. Первые изменения заметны уже после первого сеанса, а ровный тон и сияние нарастают в течение курса. Для поддержания — 1 процедура в год.", en: "A course usually consists of 3–5 procedures at 3–4 week intervals, depending on the extent of pigmentation and vessels. First changes are visible after the first session, while even tone and radiance build over the course. Maintenance: one procedure per year." },
      },
      {
        question: { uk: "Чи болісне фотоомолодження?", ru: "Болезненно ли фотоомоложение?", en: "Is photorejuvenation painful?" },
        answer: { uk: "Процедура комфортна. Під час спалаху відчувається коротке тепле поколювання, схоже на легкий «клацок» гумки. Анестезія зазвичай не потрібна. Вбудована система охолодження платформи M22 додатково підвищує комфорт під час сеансу.", ru: "Процедура комфортна. Во время вспышки ощущается короткое тёплое покалывание, похожее на лёгкий «щелчок» резинки. Анестезия обычно не нужна. Встроенная система охлаждения платформы M22 дополнительно повышает комфорт во время сеанса.", en: "The procedure is comfortable. Each flash feels like a brief, warm pinprick, similar to a light elastic-band snap. Anaesthesia is usually not required. The M22 platform's built-in cooling further improves comfort during the session." },
      },
    ],
  },

  // ─── 3. ЗБІЛЬШЕННЯ ГУБ (injectable-cosmetology / lip-augmentation) ───
  {
    slug: "lip-augmentation",
    title: { uk: "Збільшення губ", ru: "Увеличение губ", en: "Lip Augmentation" },
    h1: {
      uk: "Збільшення губ у Дніпрі — природний об'єм і чіткий контур",
      ru: "Увеличение губ в Днепре — естественный объём и чёткий контур",
      en: "Lip Augmentation in Dnipro — Natural Volume and a Defined Contour",
    },
    summary: {
      uk: "Збільшення губ філерами гіалуронової кислоти у GENEVITY: природний об'єм, зволоження та симетрія без «качиного» ефекту. Сертифіковані препарати, оборотність, Дніпро.",
      ru: "Увеличение губ филлерами гиалуроновой кислоты в GENEVITY: естественный объём, увлажнение и симметрия без эффекта «уточки». Сертифицированные препараты, обратимость, Днепр.",
      en: "Lip augmentation with hyaluronic acid fillers at GENEVITY: natural volume, hydration, and symmetry without a 'duck lip' effect. Certified products, reversibility, Dnipro.",
    },
    procedureLength: { uk: "30–45 хвилин", ru: "30–45 минут", en: "30–45 minutes" },
    effectDuration: { uk: "6–12 місяців", ru: "6–12 месяцев", en: "6–12 months" },
    sessionsRecommended: { uk: "1 процедура, корекція за потреби", ru: "1 процедура, коррекция при необходимости", en: "1 procedure, top-up as needed" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Збільшення губ — об'єм і форма філерами гіалуронової кислоти",
          ru: "Увеличение губ — объём и форма филлерами гиалуроновой кислоты",
          en: "Lip Augmentation — Volume and Shape with Hyaluronic Acid Fillers",
        },
        body: {
          uk: "Збільшення губ — це введення філера на основі гіалуронової кислоти для додання об'єму, корекції форми та зволоження. Гіалуронова кислота — природний компонент шкіри, тому препарат добре інтегрується в тканини та виглядає природно і на дотик, і візуально.\n\nПроцедура вирішує різні задачі: додати помірний об'єм, підкреслити контур, зробити губи симетричними, скоригувати «кисетні» зморшки над верхньою губою або просто повернути зволоженість сухим губам. Щільність філера та техніку лікар підбирає під анатомію та побажання пацієнта.\n\nУ GENEVITY працюють за принципом природного результату: завдання — гармонійні губи, які пасують обличчю, а не максимальний об'єм. Лікар моделює форму поступово й узгоджує проміжний результат із пацієнтом під час процедури.\n\nЕфект помітний одразу, остаточну форму оцінюють після спадання набряку — на 10–14 день. Філери на основі гіалуронової кислоти оборотні: за потреби їх можна розчинити ін'єкцією гіалуронідази. Збереження результату — 6–12 місяців.",
          ru: "Увеличение губ — это введение филлера на основе гиалуроновой кислоты для придания объёма, коррекции формы и увлажнения. Гиалуроновая кислота — естественный компонент кожи, поэтому препарат хорошо интегрируется в ткани и выглядит естественно и на ощупь, и визуально.\n\nПроцедура решает разные задачи: добавить умеренный объём, подчеркнуть контур, сделать губы симметричными, скорректировать «кисетные» морщины над верхней губой или просто вернуть увлажнённость сухим губам. Плотность филлера и технику врач подбирает под анатомию и пожелания пациента.\n\nВ GENEVITY работают по принципу естественного результата: задача — гармоничные губы, которые подходят лицу, а не максимальный объём. Врач моделирует форму постепенно и согласовывает промежуточный результат с пациентом во время процедуры.\n\nЭффект заметен сразу, окончательную форму оценивают после спадания отёка — на 10–14 день. Филлеры на основе гиалуроновой кислоты обратимы: при необходимости их можно растворить инъекцией гиалуронидазы. Сохранение результата — 6–12 месяцев.",
          en: "Lip augmentation is the injection of a hyaluronic acid-based filler to add volume, refine shape, and hydrate. Hyaluronic acid is a natural skin component, so the product integrates well into the tissue and looks and feels natural.\n\nThe procedure addresses different goals: adding moderate volume, defining the contour, making the lips symmetrical, correcting the fine 'barcode' lines above the upper lip, or simply restoring moisture to dry lips. The filler density and technique are selected to match the anatomy and the patient's wishes.\n\nGENEVITY works on the principle of a natural result: the goal is harmonious lips that suit the face, not maximum volume. The doctor sculpts the shape gradually and confirms the intermediate result with the patient during the procedure.\n\nThe effect is visible immediately; the final shape is assessed after the swelling subsides, on days 10–14. Hyaluronic acid fillers are reversible: if needed they can be dissolved with a hyaluronidase injection. The result lasts 6–12 months.",
        },
        calloutBody: {
          uk: "Об'єм видно одразу, остаточну форму — після спадання набряку на 10–14 день. Філер оборотний, результат тримається 6–12 місяців.",
          ru: "Объём виден сразу, окончательную форму — после спадания отёка на 10–14 день. Филлер обратим, результат держится 6–12 месяцев.",
          en: "Volume is visible immediately; the final shape after swelling subsides on days 10–14. The filler is reversible and the result lasts 6–12 months.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до збільшення губ", ru: "Показания к увеличению губ", en: "Indications for Lip Augmentation" },
        indications: [
          { uk: "Недостатній природний об'єм губ", ru: "Недостаточный естественный объём губ", en: "Insufficient natural lip volume" },
          { uk: "Нечіткий або розмитий контур губ", ru: "Нечёткий или размытый контур губ", en: "An indistinct or blurred lip contour" },
          { uk: "Асиметрія губ", ru: "Асимметрия губ", en: "Lip asymmetry" },
          { uk: "Вікова втрата об'єму та «кисетні» зморшки", ru: "Возрастная потеря объёма и «кисетные» морщины", en: "Age-related volume loss and fine perioral lines" },
          { uk: "Сухість та зневоднення губ", ru: "Сухость и обезвоживание губ", en: "Dryness and dehydration of the lips" },
          { uk: "Опущені куточки рота", ru: "Опущенные уголки рта", en: "Downturned corners of the mouth" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Загострення герпесу на губах (потрібна профілактика)", ru: "⚠ Обострение герпеса на губах (нужна профилактика)", en: "⚠ Active lip herpes (preventive treatment required)" },
          { uk: "⚠ Активні запальні процеси та інфекції в зоні введення", ru: "⚠ Активные воспалительные процессы и инфекции в зоне введения", en: "⚠ Active inflammation or infection in the treatment area" },
          { uk: "⚠ Прийом антикоагулянтів (підвищений ризик синців)", ru: "⚠ Приём антикоагулянтов (повышенный риск синяков)", en: "⚠ Anticoagulant use (increased bruising risk)" },
          { uk: "⚠ Алергія на гіалуронову кислоту або компоненти препарату", ru: "⚠ Аллергия на гиалуроновую кислоту или компоненты препарата", en: "⚠ Allergy to hyaluronic acid or product components" },
          { uk: "⚠ Схильність до келоїдних рубців та аутоімунні захворювання", ru: "⚠ Склонность к келоидным рубцам и аутоиммунные заболевания", en: "⚠ Tendency to keloid scars and autoimmune conditions" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура збільшення губ", ru: "Как проходит процедура увеличения губ", en: "How the Lip Augmentation Procedure Works" },
        steps: [
          { title: { uk: "Консультація та планування форми", ru: "Консультация и планирование формы", en: "Consultation and shape planning" }, description: { uk: "Лікар оцінює анатомію губ, обговорює бажаний результат, підбирає препарат та об'єм, попереджає про можливий набряк.", ru: "Врач оценивает анатомию губ, обсуждает желаемый результат, подбирает препарат и объём, предупреждает о возможном отёке.", en: "The doctor assesses lip anatomy, discusses the desired result, selects the product and volume, and explains the possible swelling." } },
          { title: { uk: "Анестезія", ru: "Анестезия", en: "Anaesthesia" }, description: { uk: "Наноситься аплікаційний анестетик; за потреби виконується провідникова анестезія. Більшість препаратів містять лідокаїн у складі.", ru: "Наносится аппликационный анестетик; при необходимости выполняется проводниковая анестезия. Большинство препаратов содержат лидокаин в составе.", en: "A topical anaesthetic is applied; a nerve block is used if needed. Most products already contain lidocaine." } },
          { title: { uk: "Введення філера та моделювання", ru: "Введение филлера и моделирование", en: "Filler injection and sculpting" }, description: { uk: "Лікар вводить філер голкою або канюлею, поступово моделюючи форму та узгоджуючи результат. Тривалість — 30–45 хвилин.", ru: "Врач вводит филлер иглой или канюлей, постепенно моделируя форму и согласовывая результат. Длительность — 30–45 минут.", en: "The doctor injects the filler with a needle or cannula, gradually sculpting the shape and confirming the result. Duration: 30–45 minutes." } },
          { title: { uk: "Догляд після процедури", ru: "Уход после процедуры", en: "Post-procedure care" }, description: { uk: "1–2 доби можливі набряк і чутливість. Уникайте сауни, спорту, гарячих напоїв та активної міміки 24–48 годин. При схильності до герпесу — противірусна профілактика.", ru: "1–2 суток возможны отёк и чувствительность. Избегайте сауны, спорта, горячих напитков и активной мимики 24–48 часов. При склонности к герпесу — противовирусная профилактика.", en: "Swelling and tenderness are possible for 1–2 days. Avoid sauna, exercise, hot drinks, and active facial movement for 24–48 hours. If prone to herpes, take antiviral prophylaxis." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та важливі застереження", ru: "Преимущества и важные предостережения", en: "Benefits and Key Considerations" },
        items: [
          { uk: "Видимий об'єм одразу після процедури", ru: "Видимый объём сразу после процедуры", en: "Visible volume immediately after the procedure" },
          { uk: "Природний результат — акцент на гармонії, а не на максимальному об'ємі", ru: "Естественный результат — акцент на гармонии, а не на максимальном объёме", en: "Natural result — focused on harmony, not maximum volume" },
          { uk: "Повна оборотність — філер можна розчинити гіалуронідазою", ru: "Полная обратимость — филлер можно растворить гиалуронидазой", en: "Fully reversible — the filler can be dissolved with hyaluronidase" },
          { uk: "Додатково зволожує губи та згладжує «кисетні» зморшки", ru: "Дополнительно увлажняет губы и сглаживает «кисетные» морщины", en: "Also hydrates the lips and softens fine perioral lines" },
          { uk: "⚠ Набряк у перші 1–2 доби — це норма, остаточну форму оцінюють пізніше", ru: "⚠ Отёк в первые 1–2 суток — это норма, окончательную форму оценивают позже", en: "⚠ Swelling in the first 1–2 days is normal; the final shape is assessed later" },
          { uk: "⚠ Губи — мімічно активна зона, тому корекція потрібна частіше, ніж в інших зонах", ru: "⚠ Губы — мимически активная зона, поэтому коррекция нужна чаще, чем в других зонах", en: "⚠ Lips are a highly mobile zone, so top-ups are needed more often than elsewhere" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Чи боляче збільшувати губи?", ru: "Больно ли увеличивать губы?", en: "Is lip augmentation painful?" },
        answer: { uk: "Губи — чутлива зона, тому в GENEVITY обов'язково застосовують знеболення: аплікаційний анестетик, а за показаннями — провідникову анестезію. Більшість філерів містять лідокаїн, що додатково знижує дискомфорт. Пацієнти описують відчуття як цілком терпимі.", ru: "Губы — чувствительная зона, поэтому в GENEVITY обязательно применяют обезболивание: аппликационный анестетик, а по показаниям — проводниковую анестезию. Большинство филлеров содержат лидокаин, что дополнительно снижает дискомфорт. Пациенты описывают ощущения как вполне терпимые.", en: "Lips are a sensitive area, so GENEVITY always uses anaesthesia: a topical anaesthetic and, when indicated, a nerve block. Most fillers contain lidocaine, which further reduces discomfort. Patients describe the sensation as quite tolerable." },
      },
      {
        question: { uk: "Коли зійде набряк після збільшення губ?", ru: "Когда сойдёт отёк после увеличения губ?", en: "When does swelling subside after lip augmentation?" },
        answer: { uk: "Основний набряк тримається перші 24–48 годин і помітно спадає до 3–5 дня. Остаточну форму губ оцінюють на 10–14 день, коли гель повністю розподілився, а набряк зник. Саме тому будь-яку корекцію планують не раніше двох тижнів.", ru: "Основной отёк держится первые 24–48 часов и заметно спадает к 3–5 дню. Окончательную форму губ оценивают на 10–14 день, когда гель полностью распределился, а отёк ушёл. Именно поэтому любую коррекцию планируют не раньше двух недель.", en: "The main swelling lasts the first 24–48 hours and noticeably subsides by days 3–5. The final lip shape is assessed on days 10–14, once the gel has fully settled and the swelling is gone. That is why any top-up is planned no earlier than two weeks." },
      },
      {
        question: { uk: "Що робити, якщо результат не сподобається?", ru: "Что делать, если результат не понравится?", en: "What if I don't like the result?" },
        answer: { uk: "Філери на основі гіалуронової кислоти повністю оборотні. Якщо результат не влаштовує або форма потребує змін, лікар вводить гіалуронідазу, яка розчиняє філер протягом доби. Це ключова перевага гіалуронових препаратів перед перманентними імплантатами.", ru: "Филлеры на основе гиалуроновой кислоты полностью обратимы. Если результат не устраивает или форма требует изменений, врач вводит гиалуронидазу, которая растворяет филлер в течение суток. Это ключевое преимущество гиалуроновых препаратов перед перманентными имплантатами.", en: "Hyaluronic acid fillers are fully reversible. If you are unhappy with the result or the shape needs adjusting, the doctor injects hyaluronidase, which dissolves the filler within a day. This is the key advantage of hyaluronic products over permanent implants." },
      },
    ],
  },

  // ─── 4. КОНТУРНА ПЛАСТИКА КУТІВ ЩЕЛЕПИ (injectable-cosmetology / jaw-contouring) ───
  {
    slug: "jaw-contouring",
    title: { uk: "Контурна пластика кутів щелепи", ru: "Контурная пластика углов челюсти", en: "Jaw Angle Contouring" },
    h1: {
      uk: "Контурна пластика кутів щелепи — чіткий овал без операції",
      ru: "Контурная пластика углов челюсти — чёткий овал без операции",
      en: "Jaw Angle Contouring — a Defined Jawline Without Surgery",
    },
    summary: {
      uk: "Контурна пластика кутів щелепи у GENEVITY: щільні філери для чіткої лінії щелепи, корекції овалу та профілю без операції. Анатомічний протокол, оборотність, Дніпро.",
      ru: "Контурная пластика углов челюсти в GENEVITY: плотные филлеры для чёткой линии челюсти, коррекции овала и профиля без операции. Анатомический протокол, обратимость, Днепр.",
      en: "Jaw angle contouring at GENEVITY: dense fillers for a defined jawline, refined oval, and profile without surgery. Anatomical protocol, reversibility, Dnipro.",
    },
    procedureLength: { uk: "30–60 хвилин", ru: "30–60 минут", en: "30–60 minutes" },
    effectDuration: { uk: "12–18 місяців", ru: "12–18 месяцев", en: "12–18 months" },
    sessionsRecommended: { uk: "1 процедура, корекція за потреби", ru: "1 процедура, коррекция при необходимости", en: "1 procedure, top-up as needed" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Контурна пластика кутів щелепи — чітка лінія обличчя філерами",
          ru: "Контурная пластика углов челюсти — чёткая линия лица филлерами",
          en: "Jaw Angle Contouring — a Sharp Facial Line with Fillers",
        },
        body: {
          uk: "Контурна пластика кутів щелепи — це введення щільного філера гіалуронової кислоти в зону кута нижньої щелепи для формування чіткої лінії обличчя. Процедура підкреслює овал, додає профілю виразності та структурує нижню третину обличчя без хірургічного втручання.\n\nЗ віком або через анатомічні особливості кут щелепи може бути згладженим, а овал — нечітким. Щільний філер відновлює кістковий об'єм у потрібних точках: лінія щелепи стає окресленою, підборіддя й шия візуально розділяються, обличчя виглядає підтягнутішим.\n\nПроцедура підходить і чоловікам, і жінкам, але задачі різні: чоловікам зазвичай формують ширший, маскулінний кут, жінкам — м'якший і витягнутий овал. Лікар працює за анатомічним протоколом, враховуючи розташування судин і пропорції обличчя.\n\nУ GENEVITY використовують сертифіковані щільні філери з тривалим ефектом. Результат помітний одразу й остаточно формується після спадання набряку. Збереження — 12–18 місяців завдяки щільності гелю та невеликій мімічній рухливості зони. Філер оборотний — за потреби розчиняється гіалуронідазою.",
          ru: "Контурная пластика углов челюсти — это введение плотного филлера гиалуроновой кислоты в зону угла нижней челюсти для формирования чёткой линии лица. Процедура подчёркивает овал, добавляет профилю выразительности и структурирует нижнюю треть лица без хирургического вмешательства.\n\nС возрастом или из-за анатомических особенностей угол челюсти может быть сглаженным, а овал — нечётким. Плотный филлер восстанавливает костный объём в нужных точках: линия челюсти становится очерченной, подбородок и шея визуально разделяются, лицо выглядит более подтянутым.\n\nПроцедура подходит и мужчинам, и женщинам, но задачи разные: мужчинам обычно формируют более широкий, маскулинный угол, женщинам — более мягкий и вытянутый овал. Врач работает по анатомическому протоколу, учитывая расположение сосудов и пропорции лица.\n\nВ GENEVITY используют сертифицированные плотные филлеры с длительным эффектом. Результат заметен сразу и окончательно формируется после спадания отёка. Сохранение — 12–18 месяцев благодаря плотности геля и небольшой мимической подвижности зоны. Филлер обратим — при необходимости растворяется гиалуронидазой.",
          en: "Jaw angle contouring is the injection of a dense hyaluronic acid filler into the angle of the lower jaw to create a defined facial line. The procedure emphasises the oval, adds definition to the profile, and structures the lower third of the face without surgery.\n\nWith age or due to anatomy, the jaw angle can be flattened and the oval indistinct. A dense filler restores bone volume at key points: the jawline becomes defined, the chin and neck are visually separated, and the face looks firmer.\n\nThe procedure suits both men and women, but the goals differ: men are usually given a wider, more masculine angle, women a softer, more elongated oval. The doctor works to an anatomical protocol, taking vessel location and facial proportions into account.\n\nGENEVITY uses certified dense fillers with a long-lasting effect. The result is visible immediately and settles fully after the swelling subsides. It lasts 12–18 months thanks to the gel's density and the low mobility of the zone. The filler is reversible — it can be dissolved with hyaluronidase if needed.",
        },
        calloutBody: {
          uk: "Чітка лінія щелепи видна одразу, остаточно — після спадання набряку. У кістковій зоні результат тримається 12–18 місяців.",
          ru: "Чёткая линия челюсти видна сразу, окончательно — после спадания отёка. В костной зоне результат держится 12–18 месяцев.",
          en: "A defined jawline is visible immediately, fully after swelling subsides. In this bony zone the result lasts 12–18 months.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до контурної пластики кутів щелепи", ru: "Показания к контурной пластике углов челюсти", en: "Indications for Jaw Angle Contouring" },
        indications: [
          { uk: "Згладжений або нечіткий кут нижньої щелепи", ru: "Сглаженный или нечёткий угол нижней челюсти", en: "A flattened or indistinct lower jaw angle" },
          { uk: "Розмитий овал обличчя та нечітка лінія щелепи", ru: "Размытый овал лица и нечёткая линия челюсти", en: "A blurred facial oval and indistinct jawline" },
          { uk: "Бажання структурувати нижню третину обличчя", ru: "Желание структурировать нижнюю треть лица", en: "A wish to structure the lower third of the face" },
          { uk: "Корекція профілю та переходу «щелепа — шия»", ru: "Коррекция профиля и перехода «челюсть — шея»", en: "Correction of the profile and the jaw-to-neck transition" },
          { uk: "Вікова втрата кісткового об'єму в нижній третині", ru: "Возрастная потеря костного объёма в нижней трети", en: "Age-related bone volume loss in the lower third" },
          { uk: "Легка асиметрія кутів щелепи", ru: "Лёгкая асимметрия углов челюсти", en: "Mild asymmetry of the jaw angles" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні запальні процеси та інфекції в зоні введення", ru: "⚠ Активные воспалительные процессы и инфекции в зоне введения", en: "⚠ Active inflammation or infection in the treatment area" },
          { uk: "⚠ Прийом антикоагулянтів (підвищений ризик гематом)", ru: "⚠ Приём антикоагулянтов (повышенный риск гематом)", en: "⚠ Anticoagulant use (increased bruising risk)" },
          { uk: "⚠ Схильність до келоїдних рубців та аутоімунні захворювання", ru: "⚠ Склонность к келоидным рубцам и аутоиммунные заболевания", en: "⚠ Tendency to keloid scars and autoimmune conditions" },
          { uk: "⚠ Нерозсмоктані філери невідомого складу в зоні введення", ru: "⚠ Нерассосавшиеся филлеры неизвестного состава в зоне введения", en: "⚠ Unresorbed fillers of unknown composition in the treatment zone" },
          { uk: "⚠ Алергія на гіалуронову кислоту або компоненти препарату", ru: "⚠ Аллергия на гиалуроновую кислоту или компоненты препарата", en: "⚠ Allergy to hyaluronic acid or product components" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить контурна пластика кутів щелепи", ru: "Как проходит контурная пластика углов челюсти", en: "How Jaw Angle Contouring Works" },
        steps: [
          { title: { uk: "Консультація та аналіз пропорцій", ru: "Консультация и анализ пропорций", en: "Consultation and proportion analysis" }, description: { uk: "Лікар оцінює форму обличчя, профіль і пропорції, визначає бажану лінію щелепи та підбирає щільність препарату.", ru: "Врач оценивает форму лица, профиль и пропорции, определяет желаемую линию челюсти и подбирает плотность препарата.", en: "The doctor assesses face shape, profile, and proportions, defines the desired jawline, and selects the filler density." } },
          { title: { uk: "Підготовка та анестезія", ru: "Подготовка и анестезия", en: "Preparation and anaesthesia" }, description: { uk: "Шкіру обробляють антисептиком і наносять аплікаційний анестетик. Лікар розмічає точки введення вздовж лінії щелепи.", ru: "Кожу обрабатывают антисептиком и наносят аппликационный анестетик. Врач размечает точки введения вдоль линии челюсти.", en: "The skin is treated with antiseptic and a topical anaesthetic is applied. The doctor marks the injection points along the jawline." } },
          { title: { uk: "Введення філера", ru: "Введение филлера", en: "Filler injection" }, description: { uk: "Щільний філер вводять голкою або канюлею в заплановані шари біля кута щелепи. Тривалість — 30–60 хвилин залежно від обсягу.", ru: "Плотный филлер вводят иглой или канюлей в запланированные слои у угла челюсти. Длительность — 30–60 минут в зависимости от объёма.", en: "The dense filler is injected with a needle or cannula into the planned layers near the jaw angle. Duration: 30–60 minutes depending on volume." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "1–3 дні можливі набряк і синці. Уникайте сауни, спорту й алкоголю 48 годин, не масажуйте зону без призначення. Остаточний результат — за 2 тижні.", ru: "1–3 дня возможны отёк и синяки. Избегайте сауны, спорта и алкоголя 48 часов, не массируйте зону без назначения. Окончательный результат — через 2 недели.", en: "Swelling and bruising are possible for 1–3 days. Avoid sauna, exercise, and alcohol for 48 hours and do not massage the area unless advised. The final result appears within 2 weeks." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та важливі застереження", ru: "Преимущества и важные предостережения", en: "Benefits and Key Considerations" },
        items: [
          { uk: "Чітка лінія щелепи й виразний профіль без операції", ru: "Чёткая линия челюсти и выразительный профиль без операции", en: "A defined jawline and expressive profile without surgery" },
          { uk: "Тривалий ефект — до 18 місяців у малорухливій кістковій зоні", ru: "Длительный эффект — до 18 месяцев в малоподвижной костной зоне", en: "Long-lasting effect — up to 18 months in this low-mobility bony zone" },
          { uk: "Індивідуальний підхід для жіночого та чоловічого овалу", ru: "Индивидуальный подход для женского и мужского овала", en: "An individual approach for a feminine or masculine oval" },
          { uk: "Повна оборотність — філер розчиняється гіалуронідазою", ru: "Полная обратимость — филлер растворяется гиалуронидазой", en: "Fully reversible — the filler dissolves with hyaluronidase" },
          { uk: "⚠ Зона багата на судини — довіряйте процедуру лише досвідченому лікарю", ru: "⚠ Зона богата сосудами — доверяйте процедуру только опытному врачу", en: "⚠ The area is rich in vessels — trust the procedure only to an experienced doctor" },
          { uk: "⚠ Виражена корекція може потребувати двох етапів для природного результату", ru: "⚠ Выраженная коррекция может потребовать двух этапов для естественного результата", en: "⚠ Significant correction may require two stages for a natural result" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки філера потрібно для контурної пластики кутів щелепи?", ru: "Сколько филлера нужно для контурной пластики углов челюсти?", en: "How much filler is needed for jaw angle contouring?" },
        answer: { uk: "Обсяг залежить від вираженості корекції та анатомії — зазвичай від 1 до 4 мл за процедуру. При значній корекції лікар може розділити введення на два етапи з інтервалом 2–4 тижні, щоб результат був природним і прогнозованим. Точний обсяг визначають на консультації.", ru: "Объём зависит от выраженности коррекции и анатомии — обычно от 1 до 4 мл за процедуру. При значительной коррекции врач может разделить введение на два этапа с интервалом 2–4 недели, чтобы результат был естественным и прогнозируемым. Точный объём определяют на консультации.", en: "The volume depends on the extent of correction and anatomy — usually 1 to 4 ml per procedure. For significant correction, the doctor may split the injection into two stages 2–4 weeks apart so the result is natural and predictable. The exact volume is determined at consultation." },
      },
      {
        question: { uk: "Чим контурна пластика щелепи відрізняється від ботулінотерапії жувальних м'язів?", ru: "Чем контурная пластика челюсти отличается от ботулинотерапии жевательных мышц?", en: "How does jaw contouring differ from masseter botulinum therapy?" },
        answer: { uk: "Це різні задачі. Контурна пластика філером додає об'єм і формує чітку лінію щелепи. Ботулінотерапія жувальних м'язів, навпаки, зменшує їхній об'єм і робить нижню третину вужчою. Іноді методики поєднують, але рішення завжди ухвалює лікар після оцінки обличчя.", ru: "Это разные задачи. Контурная пластика филлером добавляет объём и формирует чёткую линию челюсти. Ботулинотерапия жевательных мышц, наоборот, уменьшает их объём и делает нижнюю треть уже. Иногда методики сочетают, но решение всегда принимает врач после оценки лица.", en: "These are different goals. Filler contouring adds volume and creates a defined jawline. Masseter botulinum therapy, by contrast, reduces muscle volume and narrows the lower third. The two are sometimes combined, but the doctor always decides after assessing the face." },
      },
      {
        question: { uk: "Як довго тримається результат контурної пластики кутів щелепи?", ru: "Как долго держится результат контурной пластики углов челюсти?", en: "How long does the jaw angle contouring result last?" },
        answer: { uk: "У зоні кута щелепи результат тримається довше, ніж, наприклад, у губах — 12–18 місяців. Це малорухлива кісткова зона, тому щільний філер розсмоктується повільніше. Для підтримання достатньо однієї корекції раз на 1–1,5 року.", ru: "В зоне угла челюсти результат держится дольше, чем, например, в губах — 12–18 месяцев. Это малоподвижная костная зона, поэтому плотный филлер рассасывается медленнее. Для поддержания достаточно одной коррекции раз в 1–1,5 года.", en: "In the jaw angle the result lasts longer than, for example, in the lips — 12–18 months. This is a low-mobility bony zone, so the dense filler resorbs more slowly. One top-up every 1–1.5 years is enough to maintain it." },
      },
    ],
  },

  // ─── 5. КОНТУРНА ПЛАСТИКА НОСА (injectable-cosmetology / nose-contouring) ───
  {
    slug: "nose-contouring",
    title: { uk: "Контурна пластика носа", ru: "Контурная пластика носа", en: "Nose Contouring" },
    h1: {
      uk: "Контурна пластика носа у Дніпрі — корекція форми без операції",
      ru: "Контурная пластика носа в Днепре — коррекция формы без операции",
      en: "Nose Contouring in Dnipro — Reshaping Without Surgery",
    },
    summary: {
      uk: "Безопераційна корекція носа філерами у GENEVITY: вирівнювання спинки, корекція кінчика та асиметрії за 30 хвилин. Анатомічний протокол, оборотність, Дніпро.",
      ru: "Безоперационная коррекция носа филлерами в GENEVITY: выравнивание спинки, коррекция кончика и асимметрии за 30 минут. Анатомический протокол, обратимость, Днепр.",
      en: "Non-surgical nose correction with fillers at GENEVITY: smoothing the bridge, refining the tip and asymmetry in 30 minutes. Anatomical protocol, reversibility, Dnipro.",
    },
    procedureLength: { uk: "20–40 хвилин", ru: "20–40 минут", en: "20–40 minutes" },
    effectDuration: { uk: "12–18 місяців", ru: "12–18 месяцев", en: "12–18 months" },
    sessionsRecommended: { uk: "1 процедура, корекція за потреби", ru: "1 процедура, коррекция при необходимости", en: "1 procedure, top-up as needed" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Контурна пластика носа — безопераційна корекція форми філерами",
          ru: "Контурная пластика носа — безоперационная коррекция формы филлерами",
          en: "Nose Contouring — Non-Surgical Reshaping with Fillers",
        },
        body: {
          uk: "Контурна пластика носа — це безопераційна корекція форми за допомогою філера гіалуронової кислоти. Метод дозволяє вирівняти спинку носа, підняти опущений кінчик, згладити горбинку візуально та скоригувати легку асиметрію без розрізів і наркозу.\n\nВажливо розуміти межі методу: філер додає об'єм, але не зменшує ніс. Горбинку не «прибирають», а гармонізують профіль — заповнюють зону над і під нею, завдяки чому лінія спинки виглядає рівною. Для зменшення розміру носа потрібна хірургічна ринопластика.\n\nЗона носа анатомічно складна й насичена судинами, тому процедуру виконують лише досвідчені лікарі, які досконало знають анатомію. У GENEVITY працюють за безпечним протоколом із повільним введенням і контролем кожного кроку — це мінімізує ризики.\n\nРезультат видно одразу на кушетці. Період відновлення мінімальний, можливі лише невеликий набряк або синець. Ефект тримається 12–18 місяців, а філер за потреби повністю розчиняється гіалуронідазою — це робить метод оборотним і керованим.",
          ru: "Контурная пластика носа — это безоперационная коррекция формы с помощью филлера гиалуроновой кислоты. Метод позволяет выровнять спинку носа, приподнять опущенный кончик, визуально сгладить горбинку и скорректировать лёгкую асимметрию без разрезов и наркоза.\n\nВажно понимать границы метода: филлер добавляет объём, но не уменьшает нос. Горбинку не «убирают», а гармонизируют профиль — заполняют зону над и под ней, благодаря чему линия спинки выглядит ровной. Для уменьшения размера носа нужна хирургическая ринопластика.\n\nЗона носа анатомически сложная и насыщена сосудами, поэтому процедуру выполняют только опытные врачи, в совершенстве знающие анатомию. В GENEVITY работают по безопасному протоколу с медленным введением и контролем каждого шага — это минимизирует риски.\n\nРезультат виден сразу на кушетке. Период восстановления минимальный, возможны лишь небольшой отёк или синяк. Эффект держится 12–18 месяцев, а филлер при необходимости полностью растворяется гиалуронидазой — это делает метод обратимым и управляемым.",
          en: "Nose contouring is a non-surgical reshaping of the nose using a hyaluronic acid filler. The method can straighten the bridge, lift a drooping tip, visually smooth a bump, and correct mild asymmetry without incisions or general anaesthesia.\n\nIt is important to understand the method's limits: filler adds volume but cannot reduce the nose. A bump is not 'removed' — the profile is harmonised by filling the area above and below it so the bridge line looks straight. Reducing the size of the nose requires surgical rhinoplasty.\n\nThe nasal area is anatomically complex and rich in vessels, so the procedure is performed only by experienced doctors with a thorough knowledge of anatomy. GENEVITY follows a safe protocol with slow injection and control at every step, which minimises risk.\n\nThe result is visible immediately on the couch. Recovery is minimal — only slight swelling or a small bruise is possible. The effect lasts 12–18 months, and the filler can be fully dissolved with hyaluronidase if needed, making the method reversible and controllable.",
        },
        calloutBody: {
          uk: "Результат видно одразу. Метод додає об'єм і гармонізує профіль, але не зменшує ніс — для цього потрібна хірургія. Ефект — 12–18 місяців.",
          ru: "Результат виден сразу. Метод добавляет объём и гармонизирует профиль, но не уменьшает нос — для этого нужна хирургия. Эффект — 12–18 месяцев.",
          en: "The result is visible immediately. The method adds volume and harmonises the profile but does not reduce the nose — that requires surgery. Effect: 12–18 months.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до контурної пластики носа", ru: "Показания к контурной пластике носа", en: "Indications for Nose Contouring" },
        indications: [
          { uk: "Нерівна спинка носа, бажання вирівняти профіль", ru: "Неровная спинка носа, желание выровнять профиль", en: "An uneven bridge and the wish to straighten the profile" },
          { uk: "Опущений кінчик носа", ru: "Опущенный кончик носа", en: "A drooping nasal tip" },
          { uk: "Візуальна корекція невеликої горбинки", ru: "Визуальная коррекция небольшой горбинки", en: "Visual correction of a small bump" },
          { uk: "Легка асиметрія носа", ru: "Лёгкая асимметрия носа", en: "Mild nasal asymmetry" },
          { uk: "Корекція наслідків попередньої ринопластики", ru: "Коррекция последствий предыдущей ринопластики", en: "Correction of irregularities after previous rhinoplasty" },
          { uk: "Бажання оцінити зміну форми без операції", ru: "Желание оценить изменение формы без операции", en: "A wish to preview a shape change without surgery" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Нещодавня хірургічна ринопластика (потрібен інтервал)", ru: "⚠ Недавняя хирургическая ринопластика (нужен интервал)", en: "⚠ Recent surgical rhinoplasty (an interval is required)" },
          { uk: "⚠ Активні запалення, акне або інфекції шкіри носа", ru: "⚠ Активные воспаления, акне или инфекции кожи носа", en: "⚠ Active inflammation, acne, or skin infection on the nose" },
          { uk: "⚠ Прийом антикоагулянтів (підвищений ризик гематом)", ru: "⚠ Приём антикоагулянтов (повышенный риск гематом)", en: "⚠ Anticoagulant use (increased bruising risk)" },
          { uk: "⚠ Нерозсмоктані філери невідомого складу в зоні носа", ru: "⚠ Нерассосавшиеся филлеры неизвестного состава в зоне носа", en: "⚠ Unresorbed fillers of unknown composition in the nasal area" },
          { uk: "⚠ Алергія на гіалуронову кислоту або компоненти препарату", ru: "⚠ Аллергия на гиалуроновую кислоту или компоненты препарата", en: "⚠ Allergy to hyaluronic acid or product components" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить контурна пластика носа", ru: "Как проходит контурная пластика носа", en: "How Nose Contouring Works" },
        steps: [
          { title: { uk: "Консультація та оцінка профілю", ru: "Консультация и оценка профиля", en: "Consultation and profile assessment" }, description: { uk: "Лікар аналізує форму носа, профіль і пропорції обличчя, пояснює можливості та межі методу й узгоджує план.", ru: "Врач анализирует форму носа, профиль и пропорции лица, объясняет возможности и границы метода и согласовывает план.", en: "The doctor analyses the nose shape, profile, and facial proportions, explains the method's scope and limits, and agrees the plan." } },
          { title: { uk: "Підготовка та анестезія", ru: "Подготовка и анестезия", en: "Preparation and anaesthesia" }, description: { uk: "Шкіру обробляють антисептиком, наносять аплікаційний анестетик. Більшість філерів містять лідокаїн у складі.", ru: "Кожу обрабатывают антисептиком, наносят аппликационный анестетик. Большинство филлеров содержат лидокаин в составе.", en: "The skin is treated with antiseptic and a topical anaesthetic is applied. Most fillers contain lidocaine." } },
          { title: { uk: "Точкове введення філера", ru: "Точечное введение филлера", en: "Precise filler injection" }, description: { uk: "Лікар повільно вводить невеликі порції філера у визначені точки, контролюючи кожен крок. Тривалість — 20–40 хвилин.", ru: "Врач медленно вводит небольшие порции филлера в определённые точки, контролируя каждый шаг. Длительность — 20–40 минут.", en: "The doctor slowly injects small amounts of filler at defined points, controlling every step. Duration: 20–40 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "Не носіть окуляри з опорою на ніс 1–2 тижні, уникайте сауни, спорту й тиску на зону. Невеликий набряк або синець минає за кілька днів.", ru: "Не носите очки с опорой на нос 1–2 недели, избегайте сауны, спорта и давления на зону. Небольшой отёк или синяк проходит за несколько дней.", en: "Avoid glasses that rest on the nose for 1–2 weeks, and avoid sauna, exercise, and pressure on the area. Minor swelling or a bruise resolves in a few days." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та важливі застереження", ru: "Преимущества и важные предостережения", en: "Benefits and Key Considerations" },
        items: [
          { uk: "Результат одразу, без розрізів, наркозу та тривалого відновлення", ru: "Результат сразу, без разрезов, наркоза и длительного восстановления", en: "Immediate result, with no incisions, anaesthesia, or long recovery" },
          { uk: "Можливість «приміряти» нову форму носа без хірургії", ru: "Возможность «примерить» новую форму носа без хирургии", en: "A way to 'try on' a new nose shape without surgery" },
          { uk: "Повна оборотність — філер розчиняється гіалуронідазою", ru: "Полная обратимость — филлер растворяется гиалуронидазой", en: "Fully reversible — the filler dissolves with hyaluronidase" },
          { uk: "Тривалий ефект — 12–18 місяців", ru: "Длительный эффект — 12–18 месяцев", en: "Long-lasting effect — 12–18 months" },
          { uk: "⚠ Метод додає об'єм, але не зменшує ніс — для цього потрібна ринопластика", ru: "⚠ Метод добавляет объём, но не уменьшает нос — для этого нужна ринопластика", en: "⚠ The method adds volume but does not reduce the nose — that requires rhinoplasty" },
          { uk: "⚠ Анатомічно складна зона з судинами — лише досвідчений лікар та безпечний протокол", ru: "⚠ Анатомически сложная зона с сосудами — только опытный врач и безопасный протокол", en: "⚠ An anatomically complex, vessel-rich zone — only an experienced doctor and a safe protocol" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Чи можна прибрати горбинку носа філером?", ru: "Можно ли убрать горбинку носа филлером?", en: "Can a nasal bump be removed with filler?" },
        answer: { uk: "Філером горбинку не прибирають, а візуально вирівнюють профіль: лікар заповнює зони над і під горбинкою, і лінія спинки виглядає рівною. Якщо мета — фізично зменшити горбинку чи розмір носа, потрібна хірургічна ринопластика. На консультації лікар чесно пояснює, що досяжно саме у вашому випадку.", ru: "Филлером горбинку не убирают, а визуально выравнивают профиль: врач заполняет зоны над и под горбинкой, и линия спинки выглядит ровной. Если цель — физически уменьшить горбинку или размер носа, нужна хирургическая ринопластика. На консультации врач честно объясняет, что достижимо именно в вашем случае.", en: "Filler does not remove a bump — it visually straightens the profile: the doctor fills the areas above and below the bump so the bridge line looks even. If the goal is to physically reduce the bump or the size of the nose, surgical rhinoplasty is required. At consultation the doctor honestly explains what is achievable in your case." },
      },
      {
        question: { uk: "Наскільки безпечна контурна пластика носа?", ru: "Насколько безопасна контурная пластика носа?", en: "How safe is nose contouring?" },
        answer: { uk: "Зона носа насичена судинами, тому процедура потребує точного знання анатомії та обережної техніки. У GENEVITY її виконують лише досвідчені лікарі за безпечним протоколом: повільне введення малими порціями, аспіраційні проби та постійний контроль. Це суттєво знижує ризики. Самостійне «домашнє» введення філерів у ніс категорично неприпустиме.", ru: "Зона носа насыщена сосудами, поэтому процедура требует точного знания анатомии и осторожной техники. В GENEVITY её выполняют только опытные врачи по безопасному протоколу: медленное введение малыми порциями, аспирационные пробы и постоянный контроль. Это существенно снижает риски. Самостоятельное «домашнее» введение филлеров в нос категорически недопустимо.", en: "The nasal area is rich in vessels, so the procedure requires precise anatomical knowledge and careful technique. At GENEVITY it is performed only by experienced doctors following a safe protocol: slow injection in small amounts, aspiration checks, and constant control. This significantly reduces risk. Self-administered 'home' filler injections into the nose are absolutely unacceptable." },
      },
      {
        question: { uk: "Як довго тримається результат і чи можна потім зробити операцію?", ru: "Как долго держится результат и можно ли потом сделать операцию?", en: "How long does the result last, and can I have surgery later?" },
        answer: { uk: "Результат тримається 12–18 місяців. Згодом ефект поступово зникає, і ніс повертається до початкового вигляду. Якщо ви плануєте хірургічну ринопластику пізніше, повідомте про попередню контурну пластику — зазвичай рекомендують розчинити філер і витримати інтервал перед операцією.", ru: "Результат держится 12–18 месяцев. Со временем эффект постепенно исчезает, и нос возвращается к исходному виду. Если вы планируете хирургическую ринопластику позже, сообщите о предыдущей контурной пластике — обычно рекомендуют растворить филлер и выдержать интервал перед операцией.", en: "The result lasts 12–18 months. Over time the effect gradually fades and the nose returns to its original appearance. If you plan surgical rhinoplasty later, tell your surgeon about the previous contouring — it is usually recommended to dissolve the filler and allow an interval before surgery." },
      },
    ],
  },

  // ─── 6. МЕЗОТЕРАПІЯ ВОЛОССЯ (injectable-cosmetology / hair-mesotherapy) ───
  {
    slug: "hair-mesotherapy",
    title: { uk: "Мезотерапія волосся", ru: "Мезотерапия волос", en: "Hair Mesotherapy" },
    h1: {
      uk: "Мезотерапія волосся у Дніпрі — проти випадіння та для росту",
      ru: "Мезотерапия волос в Днепре — против выпадения и для роста",
      en: "Hair Mesotherapy in Dnipro — Against Hair Loss and for Growth",
    },
    summary: {
      uk: "Мезотерапія волосся у GENEVITY: ін'єкції вітамінно-пептидних коктейлів у шкіру голови проти випадіння, для зміцнення фолікулів і росту волосся. Персональний склад, Дніпро.",
      ru: "Мезотерапия волос в GENEVITY: инъекции витаминно-пептидных коктейлей в кожу головы против выпадения, для укрепления фолликулов и роста волос. Персональный состав, Днепр.",
      en: "Hair mesotherapy at GENEVITY: vitamin-peptide cocktail injections into the scalp against hair loss, to strengthen follicles and support growth. Personalised formula, Dnipro.",
    },
    procedureLength: { uk: "30–40 хвилин", ru: "30–40 минут", en: "30–40 minutes" },
    effectDuration: { uk: "до 12 місяців після курсу", ru: "до 12 месяцев после курса", en: "up to 12 months after a course" },
    sessionsRecommended: { uk: "6–10 процедур курсом", ru: "6–10 процедур курсом", en: "6–10 procedures per course" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Мезотерапія волосся — живлення фолікулів зсередини",
          ru: "Мезотерапия волос — питание фолликулов изнутри",
          en: "Hair Mesotherapy — Nourishing the Follicles from Within",
        },
        body: {
          uk: "Мезотерапія волосся — це ін'єкційне введення активних речовин безпосередньо у шкіру голови, до зони волосяних фолікулів. На відміну від шампунів і сироваток, які діють на поверхні, коктейль доставляється прямо до коренів у концентрації, потрібній для відповіді.\n\nСклад коктейля лікар формує індивідуально: вітаміни групи B, амінокислоти й пептиди для росту, мікроелементи (цинк, мідь, силіцій), судинні компоненти для покращення мікроциркуляції. Це покращує живлення фолікулів, продовжує фазу росту і допомагає утримати волосся, схильне до випадіння.\n\nМезотерапію застосовують при дифузному випадінні, виснаженому й тонкому волоссі, після стресів, пологів або суворих дієт. На ранніх стадіях андрогенної алопеції вона входить у комплексну терапію разом з іншими методами та призначеннями трихолога.\n\nУ GENEVITY процедуру проводять сертифіковані лікарі після діагностики стану шкіри голови та волосся. Мезотерапія — курсовий метод: перші зміни помітні після 3–4 сеансів, а стійкий результат дає повний курс із 6–10 процедур із подальшою підтримкою.",
          ru: "Мезотерапия волос — это инъекционное введение активных веществ непосредственно в кожу головы, к зоне волосяных фолликулов. В отличие от шампуней и сывороток, которые действуют на поверхности, коктейль доставляется прямо к корням в концентрации, нужной для ответа.\n\nСостав коктейля врач формирует индивидуально: витамины группы B, аминокислоты и пептиды для роста, микроэлементы (цинк, медь, кремний), сосудистые компоненты для улучшения микроциркуляции. Это улучшает питание фолликулов, продлевает фазу роста и помогает удержать волосы, склонные к выпадению.\n\nМезотерапию применяют при диффузном выпадении, истощённых и тонких волосах, после стрессов, родов или строгих диет. На ранних стадиях андрогенной алопеции она входит в комплексную терапию вместе с другими методами и назначениями трихолога.\n\nВ GENEVITY процедуру проводят сертифицированные врачи после диагностики состояния кожи головы и волос. Мезотерапия — курсовой метод: первые изменения заметны после 3–4 сеансов, а стойкий результат даёт полный курс из 6–10 процедур с последующей поддержкой.",
          en: "Hair mesotherapy is the injection of active substances directly into the scalp, into the zone of the hair follicles. Unlike shampoos and serums that work on the surface, the cocktail is delivered straight to the roots at the concentration needed for a response.\n\nThe doctor formulates the cocktail individually: B vitamins, amino acids and peptides for growth, trace elements (zinc, copper, silicon), and vascular components to improve microcirculation. This improves follicle nourishment, prolongs the growth phase, and helps retain hair prone to shedding.\n\nMesotherapy is used for diffuse hair loss, depleted and thin hair, and after stress, childbirth, or strict diets. In the early stages of androgenic alopecia it is part of combined therapy alongside other methods and a trichologist's prescriptions.\n\nAt GENEVITY the procedure is performed by certified doctors after assessing the scalp and hair. Mesotherapy is a course-based method: first changes appear after 3–4 sessions, while a lasting result comes from a full course of 6–10 procedures with subsequent maintenance.",
        },
        calloutBody: {
          uk: "Перші зміни — після 3–4 сеансів. Стійкий результат дає курс із 6–10 процедур. Ефект підтримують повторними сеансами.",
          ru: "Первые изменения — после 3–4 сеансов. Стойкий результат даёт курс из 6–10 процедур. Эффект поддерживают повторными сеансами.",
          en: "First changes after 3–4 sessions. A lasting result comes from a course of 6–10 procedures. The effect is maintained with repeat sessions.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до мезотерапії волосся", ru: "Показания к мезотерапии волос", en: "Indications for Hair Mesotherapy" },
        indications: [
          { uk: "Дифузне випадіння волосся", ru: "Диффузное выпадение волос", en: "Diffuse hair loss" },
          { uk: "Тонке, ослаблене та виснажене волосся", ru: "Тонкие, ослабленные и истощённые волосы", en: "Thin, weakened, and depleted hair" },
          { uk: "Випадіння після стресу, пологів, дієт чи хвороби", ru: "Выпадение после стресса, родов, диет или болезни", en: "Shedding after stress, childbirth, diets, or illness" },
          { uk: "Рання стадія андрогенної алопеції (у комплексі)", ru: "Ранняя стадия андрогенной алопеции (в комплексе)", en: "Early-stage androgenic alopecia (as part of a plan)" },
          { uk: "Сухість, лущення та порушення стану шкіри голови", ru: "Сухость, шелушение и нарушения состояния кожи головы", en: "Dryness, flaking, and poor scalp condition" },
          { uk: "Уповільнений ріст волосся", ru: "Замедленный рост волос", en: "Slow hair growth" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Алергія на компоненти коктейля", ru: "⚠ Аллергия на компоненты коктейля", en: "⚠ Allergy to cocktail components" },
          { uk: "⚠ Запалення, інфекції або пошкодження шкіри голови", ru: "⚠ Воспаления, инфекции или повреждения кожи головы", en: "⚠ Inflammation, infection, or damage to the scalp" },
          { uk: "⚠ Прийом антикоагулянтів та порушення згортання крові", ru: "⚠ Приём антикоагулянтов и нарушения свёртываемости крови", en: "⚠ Anticoagulant use and blood-clotting disorders" },
          { uk: "⚠ Онкологічні захворювання в стадії лікування", ru: "⚠ Онкологические заболевания в стадии лечения", en: "⚠ Oncological disease under active treatment" },
          { uk: "⚠ Гарячка та гострі інфекційні стани", ru: "⚠ Лихорадка и острые инфекционные состояния", en: "⚠ Fever and acute infectious conditions" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура мезотерапії волосся", ru: "Как проходит процедура мезотерапии волос", en: "How the Hair Mesotherapy Procedure Works" },
        steps: [
          { title: { uk: "Діагностика та підбір коктейля", ru: "Диагностика и подбор коктейля", en: "Diagnosis and cocktail selection" }, description: { uk: "Лікар оцінює стан шкіри голови та волосся, з'ясовує причину випадіння та формує індивідуальний склад коктейля.", ru: "Врач оценивает состояние кожи головы и волос, выясняет причину выпадения и формирует индивидуальный состав коктейля.", en: "The doctor assesses the scalp and hair, identifies the cause of shedding, and formulates an individual cocktail." } },
          { title: { uk: "Підготовка шкіри голови", ru: "Подготовка кожи головы", en: "Scalp preparation" }, description: { uk: "Шкіру голови обробляють антисептиком. За потреби наносять знеболення для підвищеної чутливості.", ru: "Кожу головы обрабатывают антисептиком. При необходимости наносят обезболивание для повышенной чувствительности.", en: "The scalp is treated with antiseptic. Anaesthesia is applied if sensitivity is high." } },
          { title: { uk: "Серія мікроін'єкцій", ru: "Серия микроинъекций", en: "A series of microinjections" }, description: { uk: "Лікар вводить коктейль поверхневими мікроін'єкціями по всій зоні росту волосся. Тривалість — 30–40 хвилин.", ru: "Врач вводит коктейль поверхностными микроинъекциями по всей зоне роста волос. Длительность — 30–40 минут.", en: "The doctor delivers the cocktail via superficial microinjections across the hair-growth zone. Duration: 30–40 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "Не мийте голову 24 години, уникайте сауни, басейну та активного спорту 1–2 доби. Легке почервоніння шкіри минає протягом дня.", ru: "Не мойте голову 24 часа, избегайте сауны, бассейна и активного спорта 1–2 суток. Лёгкое покраснение кожи проходит в течение дня.", en: "Do not wash your hair for 24 hours, and avoid sauna, pool, and vigorous exercise for 1–2 days. Mild scalp redness resolves within the day." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості мезотерапії волосся", ru: "Преимущества и особенности мезотерапии волос", en: "Benefits and Key Features of Hair Mesotherapy" },
        items: [
          { uk: "Доставка активних речовин прямо до фолікулів, а не на поверхню", ru: "Доставка активных веществ прямо к фолликулам, а не на поверхность", en: "Active substances delivered straight to the follicles, not the surface" },
          { uk: "Персональний склад коктейля під причину випадіння", ru: "Персональный состав коктейля под причину выпадения", en: "A personalised cocktail tailored to the cause of shedding" },
          { uk: "Зменшує випадіння, зміцнює корені та покращує якість волосся", ru: "Уменьшает выпадение, укрепляет корни и улучшает качество волос", en: "Reduces shedding, strengthens roots, and improves hair quality" },
          { uk: "Покращує мікроциркуляцію та живлення шкіри голови", ru: "Улучшает микроциркуляцию и питание кожи головы", en: "Improves microcirculation and scalp nourishment" },
          { uk: "⚠ Ефект курсовий — потрібно 6–10 процедур, окремий сеанс не вирішує проблему", ru: "⚠ Эффект курсовой — нужно 6–10 процедур, отдельный сеанс не решает проблему", en: "⚠ Course-based effect — 6–10 procedures are needed; a single session is not enough" },
          { uk: "⚠ При андрогенній алопеції — лише частина комплексної терапії за призначенням лікаря", ru: "⚠ При андрогенной алопеции — только часть комплексной терапии по назначению врача", en: "⚠ For androgenic alopecia — only part of combined therapy as prescribed by a doctor" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки сеансів мезотерапії волосся потрібно?", ru: "Сколько сеансов мезотерапии волос нужно?", en: "How many hair mesotherapy sessions are needed?" },
        answer: { uk: "Стандартний курс — 6–10 процедур з інтервалом 1–2 тижні залежно від стану волосся та причини випадіння. Перші помітні зміни — після 3–4 сеансів. Після курсу лікар може рекомендувати підтримуючі процедури раз на 4–6 тижнів для збереження результату.", ru: "Стандартный курс — 6–10 процедур с интервалом 1–2 недели в зависимости от состояния волос и причины выпадения. Первые заметные изменения — после 3–4 сеансов. После курса врач может рекомендовать поддерживающие процедуры раз в 4–6 недель для сохранения результата.", en: "The standard course is 6–10 procedures at 1–2 week intervals, depending on hair condition and the cause of shedding. First noticeable changes appear after 3–4 sessions. After the course, the doctor may recommend maintenance procedures every 4–6 weeks to preserve the result." },
      },
      {
        question: { uk: "Чи болісна мезотерапія волосся?", ru: "Болезненна ли мезотерапия волос?", en: "Is hair mesotherapy painful?" },
        answer: { uk: "Відчуття залежать від чутливості шкіри голови. Більшість пацієнтів описують ін'єкції як короткі поколювання, що цілком терпимі. При підвищеній чутливості лікар застосовує знеболення. Процедура коротка, тому дискомфорт мінімальний.", ru: "Ощущения зависят от чувствительности кожи головы. Большинство пациентов описывают инъекции как короткие покалывания, вполне терпимые. При повышенной чувствительности врач применяет обезболивание. Процедура короткая, поэтому дискомфорт минимален.", en: "Sensations depend on scalp sensitivity. Most patients describe the injections as brief, tolerable pinpricks. For heightened sensitivity the doctor uses anaesthesia. The procedure is short, so discomfort is minimal." },
      },
      {
        question: { uk: "Чи допоможе мезотерапія при андрогенній алопеції?", ru: "Поможет ли мезотерапия при андрогенной алопеции?", en: "Will mesotherapy help with androgenic alopecia?" },
        answer: { uk: "При андрогенній алопеції мезотерапія не є самостійним рішенням, але ефективна як частина комплексної терапії на ранніх стадіях — вона покращує живлення фолікулів і підтримує результат основного лікування. Схему завжди визначає лікар після діагностики, за потреби — разом із трихологом.", ru: "При андрогенной алопеции мезотерапия не является самостоятельным решением, но эффективна как часть комплексной терапии на ранних стадиях — она улучшает питание фолликулов и поддерживает результат основного лечения. Схему всегда определяет врач после диагностики, при необходимости — вместе с трихологом.", en: "For androgenic alopecia, mesotherapy is not a standalone solution but is effective as part of combined therapy in the early stages — it improves follicle nourishment and supports the result of the main treatment. The plan is always set by the doctor after diagnosis, with a trichologist if needed." },
      },
    ],
  },

  // ─── 7. КРАПЕЛЬНИЦЯ З ЕКЗОСОМАМИ (longevity / exosome-iv-drip) ───
  {
    slug: "exosome-iv-drip",
    title: { uk: "Омолоджувальна крапельниця з екзосомами", ru: "Омолаживающая капельница с экзосомами", en: "Rejuvenating Exosome IV Drip" },
    h1: {
      uk: "Омолоджувальна крапельниця з екзосомами — регенерація зсередини",
      ru: "Омолаживающая капельница с экзосомами — регенерация изнутри",
      en: "Rejuvenating Exosome IV Drip — Regeneration from Within",
    },
    summary: {
      uk: "Омолоджувальна крапельниця з екзосомами у GENEVITY: внутрішньовенна регенеративна терапія для відновлення, енергії та якості шкіри. Денний стаціонар, медичний нагляд, Дніпро.",
      ru: "Омолаживающая капельница с экзосомами в GENEVITY: внутривенная регенеративная терапия для восстановления, энергии и качества кожи. Дневной стационар, медицинский контроль, Днепр.",
      en: "Rejuvenating exosome IV drip at GENEVITY: intravenous regenerative therapy for recovery, energy, and skin quality. Day stationary, medical supervision, Dnipro.",
    },
    procedureLength: { uk: "40–60 хвилин", ru: "40–60 минут", en: "40–60 minutes" },
    effectDuration: { uk: "до 6–12 місяців після курсу", ru: "до 6–12 месяцев после курса", en: "up to 6–12 months after a course" },
    sessionsRecommended: { uk: "курс за протоколом лікаря", ru: "курс по протоколу врача", en: "a course per the doctor's protocol" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Крапельниця з екзосомами — регенеративна терапія для всього організму",
          ru: "Капельница с экзосомами — регенеративная терапия для всего организма",
          en: "Exosome IV Drip — Regenerative Therapy for the Whole Body",
        },
        body: {
          uk: "Омолоджувальна крапельниця з екзосомами — це внутрішньовенна регенеративна процедура в межах longevity-напрямку GENEVITY. Екзосоми — це нанорозмірні везикули, які клітини використовують для обміну сигналами: вони переносять білки, ліпіди та молекули, що регулюють відновлення тканин.\n\nНа відміну від локальних ін'єкцій у шкіру, внутрішньовенне введення працює системно. Завдання процедури — підтримати загальну регенерацію, покращити самопочуття та енергію, опосередковано вплинути на якість шкіри й тонус. Це частина комплексного підходу до здоров'я та активного довголіття, а не разова естетична маніпуляція.\n\nПроцедуру проводять у денному стаціонарі GENEVITY — у комфортних окремих палатах під наглядом лікаря. Перед призначенням обов'язкові консультація та оцінка стану здоров'я; за потреби лікар спирається на дані лабораторної діагностики, щоб протокол був доказовим і безпечним.\n\nЕкзосомна терапія — сучасний і відносно новий напрямок, тому особливо важливі якість і сертифікація препарату та медичний контроль. У GENEVITY застосовують перевірені препарати, а схему й кратність визначає лікар індивідуально.",
          ru: "Омолаживающая капельница с экзосомами — это внутривенная регенеративная процедура в рамках longevity-направления GENEVITY. Экзосомы — это наноразмерные везикулы, которые клетки используют для обмена сигналами: они переносят белки, липиды и молекулы, регулирующие восстановление тканей.\n\nВ отличие от локальных инъекций в кожу, внутривенное введение работает системно. Задача процедуры — поддержать общую регенерацию, улучшить самочувствие и энергию, опосредованно повлиять на качество кожи и тонус. Это часть комплексного подхода к здоровью и активному долголетию, а не разовая эстетическая манипуляция.\n\nПроцедуру проводят в дневном стационаре GENEVITY — в комфортных отдельных палатах под наблюдением врача. Перед назначением обязательны консультация и оценка состояния здоровья; при необходимости врач опирается на данные лабораторной диагностики, чтобы протокол был доказательным и безопасным.\n\nЭкзосомная терапия — современное и относительно новое направление, поэтому особенно важны качество и сертификация препарата и медицинский контроль. В GENEVITY применяют проверенные препараты, а схему и кратность определяет врач индивидуально.",
          en: "The rejuvenating exosome IV drip is an intravenous regenerative procedure within GENEVITY's longevity programme. Exosomes are nano-sized vesicles that cells use to exchange signals: they carry proteins, lipids, and molecules that regulate tissue repair.\n\nUnlike local injections into the skin, intravenous delivery works systemically. The goal of the procedure is to support overall regeneration, improve wellbeing and energy, and indirectly influence skin quality and tone. It is part of a comprehensive approach to health and active longevity, not a one-off aesthetic manipulation.\n\nThe procedure is carried out in GENEVITY's day stationary — in comfortable private rooms under a doctor's supervision. A consultation and health assessment are mandatory beforehand; where needed, the doctor draws on laboratory diagnostics so that the protocol is evidence-based and safe.\n\nExosome therapy is a modern and relatively new field, so the quality and certification of the product and medical oversight are especially important. GENEVITY uses verified products, and the regimen and frequency are determined by the doctor individually.",
        },
        calloutBody: {
          uk: "Крапельниця з екзосомами — частина комплексної longevity-програми. Призначається лише після консультації та оцінки стану здоров'я.",
          ru: "Капельница с экзосомами — часть комплексной longevity-программы. Назначается только после консультации и оценки состояния здоровья.",
          en: "The exosome drip is part of a comprehensive longevity programme. It is prescribed only after a consultation and a health assessment.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до крапельниці з екзосомами", ru: "Показания к капельнице с экзосомами", en: "Indications for the Exosome IV Drip" },
        indications: [
          { uk: "Загальна втома, зниження енергії та працездатності", ru: "Общая усталость, снижение энергии и работоспособности", en: "General fatigue and reduced energy and performance" },
          { uk: "Бажання підтримати регенерацію в межах longevity-програми", ru: "Желание поддержать регенерацию в рамках longevity-программы", en: "A wish to support regeneration within a longevity programme" },
          { uk: "Відновлення після підвищених навантажень і стресу", ru: "Восстановление после повышенных нагрузок и стресса", en: "Recovery after high workloads and stress" },
          { uk: "Тьмяна шкіра та ознаки загального старіння", ru: "Тусклая кожа и признаки общего старения", en: "Dull skin and signs of general ageing" },
          { uk: "Комплексний антивіковий догляд від 35 років", ru: "Комплексный антивозрастной уход от 35 лет", en: "Comprehensive anti-ageing care from age 35" },
          { uk: "Підтримка результату інших регенеративних процедур", ru: "Поддержка результата других регенеративных процедур", en: "Supporting the result of other regenerative procedures" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Онкологічні захворювання (активні або в анамнезі — потрібна консультація онколога)", ru: "⚠ Онкологические заболевания (активные или в анамнезе — нужна консультация онколога)", en: "⚠ Oncological disease (active or in history — oncologist consultation required)" },
          { uk: "⚠ Гострі інфекційні захворювання та гарячка", ru: "⚠ Острые инфекционные заболевания и лихорадка", en: "⚠ Acute infectious diseases and fever" },
          { uk: "⚠ Аутоімунні захворювання у стадії загострення", ru: "⚠ Аутоиммунные заболевания в стадии обострения", en: "⚠ Autoimmune diseases in an acute stage" },
          { uk: "⚠ Алергія на компоненти препарату", ru: "⚠ Аллергия на компоненты препарата", en: "⚠ Allergy to product components" },
          { uk: "⚠ Тяжкі хронічні стани без компенсації (за рішенням лікаря)", ru: "⚠ Тяжёлые хронические состояния без компенсации (по решению врача)", en: "⚠ Severe uncompensated chronic conditions (at the doctor's discretion)" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура крапельниці з екзосомами", ru: "Как проходит процедура капельницы с экзосомами", en: "How the Exosome IV Drip Works" },
        steps: [
          { title: { uk: "Консультація та оцінка здоров'я", ru: "Консультация и оценка здоровья", en: "Consultation and health assessment" }, description: { uk: "Лікар оцінює стан здоров'я, аналізує показання та протипоказання, за потреби спирається на дані лабораторії та визначає протокол.", ru: "Врач оценивает состояние здоровья, анализирует показания и противопоказания, при необходимости опирается на данные лаборатории и определяет протокол.", en: "The doctor assesses health, reviews indications and contraindications, draws on lab data if needed, and defines the protocol." } },
          { title: { uk: "Підготовка у денному стаціонарі", ru: "Подготовка в дневном стационаре", en: "Preparation in the day stationary" }, description: { uk: "Пацієнт розміщується у комфортній палаті. Медичний персонал встановлює внутрішньовенний доступ із дотриманням стерильності.", ru: "Пациент размещается в комфортной палате. Медицинский персонал устанавливает внутривенный доступ с соблюдением стерильности.", en: "The patient settles into a comfortable room. Staff establish intravenous access under sterile conditions." } },
          { title: { uk: "Внутрішньовенне введення", ru: "Внутривенное введение", en: "Intravenous infusion" }, description: { uk: "Препарат вводять краплинно під контролем лікаря. Тривалість — 40–60 хвилин у спокійній обстановці.", ru: "Препарат вводят капельно под контролем врача. Длительность — 40–60 минут в спокойной обстановке.", en: "The product is infused by drip under the doctor's supervision. Duration: 40–60 minutes in a calm setting." } },
          { title: { uk: "Спостереження та рекомендації", ru: "Наблюдение и рекомендации", en: "Observation and recommendations" }, description: { uk: "Після крапельниці — короткий період спостереження. Лікар дає індивідуальні рекомендації щодо режиму та подальшого плану.", ru: "После капельницы — короткий период наблюдения. Врач даёт индивидуальные рекомендации по режиму и дальнейшему плану.", en: "After the drip there is a short observation period. The doctor gives individual recommendations on regimen and the further plan." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості процедури", ru: "Преимущества и особенности процедуры", en: "Benefits and Key Features of the Procedure" },
        items: [
          { uk: "Системна підтримка регенерації, а не лише локальний ефект", ru: "Системная поддержка регенерации, а не только локальный эффект", en: "Systemic support for regeneration, not just a local effect" },
          { uk: "Проводиться у комфортному денному стаціонарі під наглядом лікаря", ru: "Проводится в комфортном дневном стационаре под наблюдением врача", en: "Performed in a comfortable day stationary under medical supervision" },
          { uk: "Частина комплексної longevity-програми GENEVITY", ru: "Часть комплексной longevity-программы GENEVITY", en: "Part of GENEVITY's comprehensive longevity programme" },
          { uk: "Протокол спирається на консультацію та діагностику", ru: "Протокол опирается на консультацию и диагностику", en: "The protocol is based on consultation and diagnostics" },
          { uk: "⚠ Призначається лише лікарем — це медична процедура, а не косметична послуга", ru: "⚠ Назначается только врачом — это медицинская процедура, а не косметическая услуга", en: "⚠ Prescribed only by a doctor — this is a medical procedure, not a cosmetic service" },
          { uk: "⚠ Сучасний напрямок — важливі сертифікований препарат і медичний контроль", ru: "⚠ Современное направление — важны сертифицированный препарат и медицинский контроль", en: "⚠ A modern field — a certified product and medical oversight are essential" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Чим крапельниця з екзосомами відрізняється від ін'єкцій екзосомами у шкіру?", ru: "Чем капельница с экзосомами отличается от инъекций экзосомами в кожу?", en: "How does the exosome drip differ from exosome injections into the skin?" },
        answer: { uk: "Ін'єкції екзосомами у шкіру працюють локально — у конкретній зоні обличчя чи шкіри голови. Внутрішньовенна крапельниця діє системно й націлена на загальну регенерацію та самопочуття в межах longevity-підходу. Який формат доречний саме вам, визначає лікар на консультації за вашими задачами.", ru: "Инъекции экзосомами в кожу работают локально — в конкретной зоне лица или кожи головы. Внутривенная капельница действует системно и нацелена на общую регенерацию и самочувствие в рамках longevity-подхода. Какой формат уместен именно вам, определяет врач на консультации по вашим задачам.", en: "Exosome injections into the skin work locally — in a specific facial or scalp zone. The intravenous drip acts systemically and targets overall regeneration and wellbeing within a longevity approach. Which format suits you is determined by the doctor at consultation, based on your goals." },
      },
      {
        question: { uk: "Скільки крапельниць потрібно і коли буде результат?", ru: "Сколько капельниц нужно и когда будет результат?", en: "How many drips are needed and when will I see results?" },
        answer: { uk: "Кратність визначає лікар індивідуально — зазвичай це курс із кількох процедур у межах загального longevity-протоколу. Самопочуття та енергія можуть покращитися вже найближчими днями, а ефект для якості шкіри й тонусу розвивається поступово протягом тижнів. Стійкість результату залежить від способу життя та підтримки.", ru: "Кратность определяет врач индивидуально — обычно это курс из нескольких процедур в рамках общего longevity-протокола. Самочувствие и энергия могут улучшиться уже в ближайшие дни, а эффект для качества кожи и тонуса развивается постепенно в течение недель. Стойкость результата зависит от образа жизни и поддержки.", en: "The frequency is determined by the doctor individually — usually a course of several procedures within an overall longevity protocol. Wellbeing and energy may improve within days, while the effect on skin quality and tone develops gradually over weeks. How long it lasts depends on lifestyle and maintenance." },
      },
      {
        question: { uk: "Наскільки безпечна процедура?", ru: "Насколько безопасна процедура?", en: "How safe is the procedure?" },
        answer: { uk: "Крапельницю проводять у денному стаціонарі під наглядом медичного персоналу та з дотриманням стерильності. Безпеку забезпечують обов'язкова консультація, врахування протипоказань, сертифікований препарат і за потреби лабораторна діагностика. Це медична процедура, тому її призначає та контролює лише лікар.", ru: "Капельницу проводят в дневном стационаре под наблюдением медицинского персонала и с соблюдением стерильности. Безопасность обеспечивают обязательная консультация, учёт противопоказаний, сертифицированный препарат и при необходимости лабораторная диагностика. Это медицинская процедура, поэтому её назначает и контролирует только врач.", en: "The drip is performed in the day stationary under staff supervision and sterile conditions. Safety is ensured by a mandatory consultation, accounting for contraindications, a certified product, and laboratory diagnostics where needed. This is a medical procedure, so it is prescribed and supervised only by a doctor." },
      },
    ],
  },

  // ─── 8. ЛАЗЕРНА ЕПІЛЯЦІЯ БІКІНІ (laser-hair-removal / laser-bikini) ───
  {
    slug: "laser-bikini",
    title: { uk: "Лазерна епіляція бікіні", ru: "Лазерная эпиляция бикини", en: "Bikini Laser Hair Removal" },
    h1: {
      uk: "Лазерна епіляція бікіні у Дніпрі — гладкість надовго",
      ru: "Лазерная эпиляция бикини в Днепре — гладкость надолго",
      en: "Bikini Laser Hair Removal in Dnipro — Long-Lasting Smoothness",
    },
    summary: {
      uk: "Лазерна епіляція зони бікіні у GENEVITY на апараті Splendor X: комфортне видалення волосся з системою охолодження для будь-якого типу шкіри. Делікатно, конфіденційно, Дніпро.",
      ru: "Лазерная эпиляция зоны бикини в GENEVITY на аппарате Splendor X: комфортное удаление волос с системой охлаждения для любого типа кожи. Деликатно, конфиденциально, Днепр.",
      en: "Bikini laser hair removal at GENEVITY with the Splendor X device: comfortable hair removal with built-in cooling for any skin type. Delicate, confidential, Dnipro.",
    },
    procedureLength: { uk: "15–30 хвилин", ru: "15–30 минут", en: "15–30 minutes" },
    effectDuration: { uk: "до 90% зменшення росту волосся після курсу", ru: "до 90% сокращения роста волос после курса", en: "up to 90% hair reduction after a course" },
    sessionsRecommended: { uk: "6–8 процедур курсом", ru: "6–8 процедур курсом", en: "6–8 procedures per course" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерна епіляція бікіні — комфортне видалення волосся надовго",
          ru: "Лазерная эпиляция бикини — комфортное удаление волос надолго",
          en: "Bikini Laser Hair Removal — Comfortable, Long-Lasting Results",
        },
        body: {
          uk: "Лазерна епіляція зони бікіні — це довготривале видалення небажаного волосся за допомогою лазера. У GENEVITY процедуру виконують на апараті Splendor X від Lumenis — це сучасне рішення з технологією подвійної довжини хвилі (александрит + Nd:YAG).\n\nПринцип дії — селективний фототермоліз: лазерний промінь поглинається меланіном у волосині, нагріває фолікул і виводить його з фази росту. Завдяки двом довжинам хвилі апарат ефективно працює з різними типами шкіри й кольором волосся, а вбудована система охолодження робить процедуру комфортною навіть у чутливій зоні бікіні.\n\nЗона бікіні делікатна, тому особливо важливі правильні налаштування та досвід спеціаліста. У GENEVITY процедуру проводять у комфортних умовах із дотриманням конфіденційності. Доступні різні формати — від класичного бікіні до глибокого, які підбирають за побажаннями.\n\nЛазерна епіляція працює лише на волоссі у фазі росту, тому потрібен курс процедур. Зазвичай це 6–8 сеансів з інтервалом 4–6 тижнів, після чого ріст волосся зменшується до 90%, а волосся, що залишається, стає тоншим і світлішим.",
          ru: "Лазерная эпиляция зоны бикини — это долгосрочное удаление нежелательных волос с помощью лазера. В GENEVITY процедуру выполняют на аппарате Splendor X от Lumenis — это современное решение с технологией двойной длины волны (александрит + Nd:YAG).\n\nПринцип действия — селективный фототермолиз: лазерный луч поглощается меланином в волоске, нагревает фолликул и выводит его из фазы роста. Благодаря двум длинам волны аппарат эффективно работает с разными типами кожи и цветом волос, а встроенная система охлаждения делает процедуру комфортной даже в чувствительной зоне бикини.\n\nЗона бикини деликатная, поэтому особенно важны правильные настройки и опыт специалиста. В GENEVITY процедуру проводят в комфортных условиях с соблюдением конфиденциальности. Доступны разные форматы — от классического бикини до глубокого, которые подбирают по пожеланиям.\n\nЛазерная эпиляция работает только на волосах в фазе роста, поэтому нужен курс процедур. Обычно это 6–8 сеансов с интервалом 4–6 недель, после чего рост волос сокращается до 90%, а остающиеся волосы становятся тоньше и светлее.",
          en: "Bikini laser hair removal provides long-term removal of unwanted hair with a laser. At GENEVITY the procedure is performed on the Splendor X device by Lumenis — a modern solution with dual-wavelength technology (alexandrite + Nd:YAG).\n\nIt works by selective photothermolysis: the laser beam is absorbed by melanin in the hair, heats the follicle, and takes it out of the growth phase. Thanks to the two wavelengths, the device works effectively with different skin types and hair colours, while the built-in cooling makes the procedure comfortable even in the sensitive bikini area.\n\nThe bikini area is delicate, so correct settings and the specialist's experience are especially important. At GENEVITY the procedure is carried out in comfortable conditions with full confidentiality. Different formats are available — from classic to deep bikini — selected to your preference.\n\nLaser hair removal only works on hair in the growth phase, so a course is needed. This is usually 6–8 sessions at 4–6 week intervals, after which hair growth is reduced by up to 90%, and any remaining hair becomes thinner and lighter.",
        },
        calloutBody: {
          uk: "Для стійкого результату потрібен курс 6–8 процедур з інтервалом 4–6 тижнів. Ріст волосся зменшується до 90%.",
          ru: "Для стойкого результата нужен курс 6–8 процедур с интервалом 4–6 недель. Рост волос сокращается до 90%.",
          en: "A lasting result needs a course of 6–8 procedures at 4–6 week intervals. Hair growth is reduced by up to 90%.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до лазерної епіляції бікіні", ru: "Показания к лазерной эпиляции бикини", en: "Indications for Bikini Laser Hair Removal" },
        indications: [
          { uk: "Небажане волосся в зоні бікіні", ru: "Нежелательные волосы в зоне бикини", en: "Unwanted hair in the bikini area" },
          { uk: "Подразнення та вростання волосся після гоління й воску", ru: "Раздражение и врастание волос после бритья и воска", en: "Irritation and ingrown hairs after shaving and waxing" },
          { uk: "Бажання відмовитися від регулярного гоління", ru: "Желание отказаться от регулярного бритья", en: "A wish to stop regular shaving" },
          { uk: "Підвищена чутливість шкіри до інших методів епіляції", ru: "Повышенная чувствительность кожи к другим методам эпиляции", en: "Skin sensitivity to other hair-removal methods" },
          { uk: "Фолікуліт і висипання після механічного видалення волосся", ru: "Фолликулит и высыпания после механического удаления волос", en: "Folliculitis and breakouts after mechanical hair removal" },
          { uk: "Бажання довготривалого та гігієнічного результату", ru: "Желание долгосрочного и гигиеничного результата", en: "A wish for a long-term, hygienic result" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Свіжа засмага та засмага в солярії", ru: "⚠ Свежий загар и загар в солярии", en: "⚠ Fresh tan or tanning-bed exposure" },
          { uk: "⚠ Активні запалення, герпес або інфекції шкіри в зоні", ru: "⚠ Активные воспаления, герпес или инфекции кожи в зоне", en: "⚠ Active inflammation, herpes, or skin infection in the area" },
          { uk: "⚠ Прийом фотосенсибілізуючих препаратів", ru: "⚠ Приём фотосенсибилизирующих препаратов", en: "⚠ Use of photosensitising medication" },
          { uk: "⚠ Новоутворення та родимки у зоні обробки (потрібна оцінка лікаря)", ru: "⚠ Новообразования и родинки в зоне обработки (нужна оценка врача)", en: "⚠ Growths or moles in the treatment area (medical assessment required)" },
          { uk: "⚠ Цукровий діабет у стадії декомпенсації та онкозахворювання в стадії лікування", ru: "⚠ Сахарный диабет в стадии декомпенсации и онкозаболевания в стадии лечения", en: "⚠ Uncontrolled diabetes and oncological disease under active treatment" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить лазерна епіляція бікіні", ru: "Как проходит лазерная эпиляция бикини", en: "How Bikini Laser Hair Removal Works" },
        steps: [
          { title: { uk: "Консультація та тест-спалах", ru: "Консультация и тест-вспышка", en: "Consultation and test pulse" }, description: { uk: "Лікар оцінює тип шкіри й волосся, виключає протипоказання, налаштовує параметри та робить тест-спалах на чутливість.", ru: "Врач оценивает тип кожи и волос, исключает противопоказания, настраивает параметры и делает тест-вспышку на чувствительность.", en: "The doctor assesses skin and hair type, rules out contraindications, sets the parameters, and performs a test pulse for sensitivity." } },
          { title: { uk: "Підготовка зони", ru: "Подготовка зоны", en: "Area preparation" }, description: { uk: "Волосся попередньо коротко зголене. Шкіру очищають; пацієнт і спеціаліст надягають захисні окуляри.", ru: "Волосы предварительно коротко сбриты. Кожу очищают; пациент и специалист надевают защитные очки.", en: "The hair is shaved short beforehand. The skin is cleansed; both patient and specialist wear protective eyewear." } },
          { title: { uk: "Лазерна обробка", ru: "Лазерная обработка", en: "Laser treatment" }, description: { uk: "Спеціаліст обробляє зону лазером із синхронним охолодженням. Зона бікіні невелика — процедура триває 15–30 хвилин.", ru: "Специалист обрабатывает зону лазером с синхронным охлаждением. Зона бикини небольшая — процедура длится 15–30 минут.", en: "The specialist treats the area with the laser and synchronised cooling. The bikini zone is small, so the procedure takes 15–30 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "Легке почервоніння минає за кілька годин. 48 годин уникайте сауни, басейну та тертя; 2 тижні — сонця й солярію, з SPF 50+ на відкритих ділянках.", ru: "Лёгкое покраснение проходит за несколько часов. 48 часов избегайте сауны, бассейна и трения; 2 недели — солнца и солярия, с SPF 50+ на открытых участках.", en: "Mild redness fades within a few hours. Avoid sauna, pool, and friction for 48 hours; avoid sun and tanning beds for 2 weeks, using SPF 50+ on exposed areas." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості лазерної епіляції бікіні", ru: "Преимущества и особенности лазерной эпиляции бикини", en: "Benefits and Key Features of Bikini Laser Hair Removal" },
        items: [
          { uk: "Splendor X із подвійною довжиною хвилі — для різних типів шкіри й волосся", ru: "Splendor X с двойной длиной волны — для разных типов кожи и волос", en: "Splendor X with dual wavelength — for different skin and hair types" },
          { uk: "Вбудоване охолодження підвищує комфорт у чутливій зоні", ru: "Встроенное охлаждение повышает комфорт в чувствительной зоне", en: "Built-in cooling improves comfort in a sensitive area" },
          { uk: "Усуває вростання волосся та подразнення від гоління й воску", ru: "Устраняет врастание волос и раздражение от бритья и воска", en: "Eliminates ingrown hairs and irritation from shaving and waxing" },
          { uk: "Конфіденційні та комфортні умови проведення", ru: "Конфиденциальные и комфортные условия проведения", en: "Confidential and comfortable conditions" },
          { uk: "⚠ Потрібен курс 6–8 процедур — лазер діє лише на волосся у фазі росту", ru: "⚠ Нужен курс 6–8 процедур — лазер действует только на волосы в фазе роста", en: "⚠ A course of 6–8 procedures is needed — the laser acts only on hair in the growth phase" },
          { uk: "⚠ Не проводиться на засмаглій шкірі — плануйте курс поза сезоном активного сонця", ru: "⚠ Не проводится на загорелой коже — планируйте курс вне сезона активного солнца", en: "⚠ Not performed on tanned skin — plan the course outside the active-sun season" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки процедур потрібно для зони бікіні?", ru: "Сколько процедур нужно для зоны бикини?", en: "How many procedures are needed for the bikini area?" },
        answer: { uk: "Зазвичай курс складає 6–8 процедур з інтервалом 4–6 тижнів. Лазер діє лише на волосся у фазі активного росту, а воно становить частину всього об'єму, тому потрібні повторні сеанси. Після курсу ріст волосся зменшується до 90%, а для підтримання достатньо 1–2 процедур на рік.", ru: "Обычно курс составляет 6–8 процедур с интервалом 4–6 недель. Лазер действует только на волосы в фазе активного роста, а они составляют часть всего объёма, поэтому нужны повторные сеансы. После курса рост волос сокращается до 90%, а для поддержания достаточно 1–2 процедур в год.", en: "A course usually consists of 6–8 procedures at 4–6 week intervals. The laser acts only on hair in the active growth phase, which is part of the total, so repeat sessions are needed. After the course hair growth is reduced by up to 90%, and 1–2 procedures per year are enough for maintenance." },
      },
      {
        question: { uk: "Чи болісна лазерна епіляція бікіні?", ru: "Болезненна ли лазерная эпиляция бикини?", en: "Is bikini laser hair removal painful?" },
        answer: { uk: "Зона бікіні чутлива, але апарат Splendor X оснащений системою охолодження, яка захищає шкіру й суттєво підвищує комфорт. Більшість пацієнтів описують відчуття як короткі теплі поколювання. За потреби спеціаліст коригує параметри та темп під вашу чутливість.", ru: "Зона бикини чувствительна, но аппарат Splendor X оснащён системой охлаждения, которая защищает кожу и существенно повышает комфорт. Большинство пациентов описывают ощущения как короткие тёплые покалывания. При необходимости специалист корректирует параметры и темп под вашу чувствительность.", en: "The bikini area is sensitive, but the Splendor X device has a cooling system that protects the skin and considerably improves comfort. Most patients describe the sensation as brief, warm pinpricks. If needed, the specialist adjusts the settings and pace to your sensitivity." },
      },
      {
        question: { uk: "Як підготуватися до лазерної епіляції бікіні?", ru: "Как подготовиться к лазерной эпиляции бикини?", en: "How to prepare for bikini laser hair removal?" },
        answer: { uk: "За 2 тижні до процедури уникайте сонця й солярію, не виривайте волосся пінцетом, воском чи шугарингом — лазеру потрібен корінь. Напередодні коротко зголіть зону. Не використовуйте автозасмагу та парфумовані засоби на зоні. Точні рекомендації лікар дасть на консультації.", ru: "За 2 недели до процедуры избегайте солнца и солярия, не выдёргивайте волосы пинцетом, воском или шугарингом — лазеру нужен корень. Накануне коротко сбрейте зону. Не используйте автозагар и парфюмированные средства на зоне. Точные рекомендации врач даст на консультации.", en: "For 2 weeks before the procedure, avoid sun and tanning beds and do not pluck, wax, or sugar the hair — the laser needs the root. Shave the area short the day before. Do not use self-tanner or perfumed products on the area. The doctor will give precise recommendations at consultation." },
      },
    ],
  },

  // ─── 9. ЛАЗЕРНА ЕПІЛЯЦІЯ НІГ (laser-hair-removal / laser-legs) ───
  {
    slug: "laser-legs",
    title: { uk: "Лазерна епіляція ніг", ru: "Лазерная эпиляция ног", en: "Legs Laser Hair Removal" },
    h1: {
      uk: "Лазерна епіляція ніг у Дніпрі — гладка шкіра без подразнень",
      ru: "Лазерная эпиляция ног в Днепре — гладкая кожа без раздражений",
      en: "Legs Laser Hair Removal in Dnipro — Smooth Skin Without Irritation",
    },
    summary: {
      uk: "Лазерна епіляція ніг у GENEVITY на апараті Splendor X: швидке видалення волосся з великих зон завдяки великому розміру плями та охолодженню. Довготривалий результат, Дніпро.",
      ru: "Лазерная эпиляция ног в GENEVITY на аппарате Splendor X: быстрое удаление волос с больших зон благодаря большому размеру пятна и охлаждению. Долгосрочный результат, Днепр.",
      en: "Legs laser hair removal at GENEVITY with the Splendor X device: fast hair removal on large areas thanks to a large spot size and cooling. Long-lasting result, Dnipro.",
    },
    procedureLength: { uk: "30–50 хвилин", ru: "30–50 минут", en: "30–50 minutes" },
    effectDuration: { uk: "до 90% зменшення росту волосся після курсу", ru: "до 90% сокращения роста волос после курса", en: "up to 90% hair reduction after a course" },
    sessionsRecommended: { uk: "6–8 процедур курсом", ru: "6–8 процедур курсом", en: "6–8 procedures per course" },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерна епіляція ніг — гладка шкіра великих зон надовго",
          ru: "Лазерная эпиляция ног — гладкая кожа больших зон надолго",
          en: "Legs Laser Hair Removal — Smooth Skin on Large Areas, Long-Term",
        },
        body: {
          uk: "Лазерна епіляція ніг — це довготривале видалення волосся на гомілках, стегнах або повністю на ногах за допомогою лазера. У GENEVITY процедуру виконують на апараті Splendor X від Lumenis із технологією подвійної довжини хвилі (александрит + Nd:YAG).\n\nЛазерний промінь поглинається меланіном у волосині й нагріває фолікул, виводячи його з фази росту. Ноги — велика за площею зона, тому тут особливо важливі великий розмір плями та швидкість апарата: обробка проходить швидше й рівномірніше, ніж на старіших системах.\n\nЛазерна епіляція позбавляє від щоденного гоління, вростання волосся та подразнення, які часто з'являються на ногах після бритви чи воску. Завдяки двом довжинам хвилі апарат коректно працює з різними типами шкіри й кольором волосся, а охолодження робить процедуру комфортною.\n\nОскільки лазер діє лише на волосся у фазі росту, потрібен курс — зазвичай 6–8 процедур з інтервалом 4–6 тижнів. Після курсу ріст волосся зменшується до 90%, шкіра ніг залишається гладкою тривалий час, а підтримувальні сеанси проводять за потреби.",
          ru: "Лазерная эпиляция ног — это долгосрочное удаление волос на голенях, бёдрах или полностью на ногах с помощью лазера. В GENEVITY процедуру выполняют на аппарате Splendor X от Lumenis с технологией двойной длины волны (александрит + Nd:YAG).\n\nЛазерный луч поглощается меланином в волоске и нагревает фолликул, выводя его из фазы роста. Ноги — большая по площади зона, поэтому здесь особенно важны большой размер пятна и скорость аппарата: обработка проходит быстрее и равномернее, чем на более старых системах.\n\nЛазерная эпиляция избавляет от ежедневного бритья, врастания волос и раздражения, которые часто появляются на ногах после бритвы или воска. Благодаря двум длинам волны аппарат корректно работает с разными типами кожи и цветом волос, а охлаждение делает процедуру комфортной.\n\nПоскольку лазер действует только на волосы в фазе роста, нужен курс — обычно 6–8 процедур с интервалом 4–6 недель. После курса рост волос сокращается до 90%, кожа ног остаётся гладкой длительное время, а поддерживающие сеансы проводят при необходимости.",
          en: "Legs laser hair removal provides long-term hair removal on the lower legs, thighs, or the whole legs using a laser. At GENEVITY the procedure is performed on the Splendor X device by Lumenis with dual-wavelength technology (alexandrite + Nd:YAG).\n\nThe laser beam is absorbed by melanin in the hair and heats the follicle, taking it out of the growth phase. The legs are a large area, so a large spot size and the device's speed matter especially here: treatment is faster and more even than on older systems.\n\nLaser hair removal frees you from daily shaving, ingrown hairs, and the irritation that often appears on the legs after a razor or wax. Thanks to the two wavelengths, the device works correctly with different skin types and hair colours, and the cooling makes the procedure comfortable.\n\nSince the laser acts only on hair in the growth phase, a course is needed — usually 6–8 procedures at 4–6 week intervals. After the course hair growth is reduced by up to 90%, the leg skin stays smooth for a long time, and maintenance sessions are performed as needed.",
        },
        calloutBody: {
          uk: "Великий розмір плями Splendor X прискорює обробку ніг. Для стійкого результату — курс 6–8 процедур, ріст волосся зменшується до 90%.",
          ru: "Большой размер пятна Splendor X ускоряет обработку ног. Для стойкого результата — курс 6–8 процедур, рост волос сокращается до 90%.",
          en: "The large Splendor X spot size speeds up treating the legs. A lasting result needs a course of 6–8 procedures; hair growth is reduced by up to 90%.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до лазерної епіляції ніг", ru: "Показания к лазерной эпиляции ног", en: "Indications for Legs Laser Hair Removal" },
        indications: [
          { uk: "Небажане волосся на гомілках, стегнах або повністю на ногах", ru: "Нежелательные волосы на голенях, бёдрах или полностью на ногах", en: "Unwanted hair on the lower legs, thighs, or the whole legs" },
          { uk: "Втома від щоденного гоління великих зон", ru: "Усталость от ежедневного бритья больших зон", en: "Fatigue from daily shaving of large areas" },
          { uk: "Вростання волосся та подразнення після бритви й воску", ru: "Врастание волос и раздражение после бритвы и воска", en: "Ingrown hairs and irritation after razor and wax" },
          { uk: "Підвищена чутливість шкіри ніг до механічної епіляції", ru: "Повышенная чувствительность кожи ног к механической эпиляции", en: "Leg-skin sensitivity to mechanical hair removal" },
          { uk: "Фолікуліт і висипання після гоління", ru: "Фолликулит и высыпания после бритья", en: "Folliculitis and breakouts after shaving" },
          { uk: "Бажання довготривалої гладкості шкіри ніг", ru: "Желание долгосрочной гладкости кожи ног", en: "A wish for long-lasting smooth leg skin" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Свіжа засмага та засмага в солярії", ru: "⚠ Свежий загар и загар в солярии", en: "⚠ Fresh tan or tanning-bed exposure" },
          { uk: "⚠ Варикоз у зоні обробки потребує оцінки лікаря", ru: "⚠ Варикоз в зоне обработки требует оценки врача", en: "⚠ Varicose veins in the treatment area require medical assessment" },
          { uk: "⚠ Активні запалення, інфекції або пошкодження шкіри в зоні", ru: "⚠ Активные воспаления, инфекции или повреждения кожи в зоне", en: "⚠ Active inflammation, infection, or skin damage in the area" },
          { uk: "⚠ Прийом фотосенсибілізуючих препаратів", ru: "⚠ Приём фотосенсибилизирующих препаратов", en: "⚠ Use of photosensitising medication" },
          { uk: "⚠ Новоутворення й родимки у зоні обробки та онкозахворювання в стадії лікування", ru: "⚠ Новообразования и родинки в зоне обработки и онкозаболевания в стадии лечения", en: "⚠ Growths or moles in the treatment area and oncological disease under active treatment" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить лазерна епіляція ніг", ru: "Как проходит лазерная эпиляция ног", en: "How Legs Laser Hair Removal Works" },
        steps: [
          { title: { uk: "Консультація та тест-спалах", ru: "Консультация и тест-вспышка", en: "Consultation and test pulse" }, description: { uk: "Лікар оцінює тип шкіри й волосся, виключає протипоказання (зокрема варикоз), налаштовує параметри та робить тест-спалах.", ru: "Врач оценивает тип кожи и волос, исключает противопоказания (в том числе варикоз), настраивает параметры и делает тест-вспышку.", en: "The doctor assesses skin and hair type, rules out contraindications (including varicose veins), sets the parameters, and performs a test pulse." } },
          { title: { uk: "Підготовка зони", ru: "Подготовка зоны", en: "Area preparation" }, description: { uk: "Волосся попередньо коротко зголене, шкіру очищають. Пацієнт і спеціаліст надягають захисні окуляри.", ru: "Волосы предварительно коротко сбриты, кожу очищают. Пациент и специалист надевают защитные очки.", en: "The hair is shaved short beforehand and the skin is cleansed. Both patient and specialist wear protective eyewear." } },
          { title: { uk: "Лазерна обробка", ru: "Лазерная обработка", en: "Laser treatment" }, description: { uk: "Спеціаліст рівномірно проходить зону лазером із охолодженням. Завдяки великій плямі ноги обробляються швидко — 30–50 хвилин.", ru: "Специалист равномерно проходит зону лазером с охлаждением. Благодаря большому пятну ноги обрабатываются быстро — 30–50 минут.", en: "The specialist passes evenly over the area with the laser and cooling. Thanks to the large spot, the legs are treated quickly — 30–50 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "Легке почервоніння минає за кілька годин. 48 годин уникайте сауни, гарячої ванни та спорту; 2 тижні — сонця й солярію, з SPF 50+ на відкритих ділянках.", ru: "Лёгкое покраснение проходит за несколько часов. 48 часов избегайте сауны, горячей ванны и спорта; 2 недели — солнца и солярия, с SPF 50+ на открытых участках.", en: "Mild redness fades within a few hours. Avoid sauna, hot baths, and exercise for 48 hours; avoid sun and tanning beds for 2 weeks, using SPF 50+ on exposed areas." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості лазерної епіляції ніг", ru: "Преимущества и особенности лазерной эпиляции ног", en: "Benefits and Key Features of Legs Laser Hair Removal" },
        items: [
          { uk: "Великий розмір плями Splendor X — швидка обробка великих зон", ru: "Большой размер пятна Splendor X — быстрая обработка больших зон", en: "Splendor X's large spot size — fast treatment of large areas" },
          { uk: "Подвійна довжина хвилі — для різних типів шкіри й волосся", ru: "Двойная длина волны — для разных типов кожи и волос", en: "Dual wavelength — for different skin and hair types" },
          { uk: "Усуває щоденне гоління, вростання волосся та подразнення", ru: "Устраняет ежедневное бритьё, врастание волос и раздражение", en: "Eliminates daily shaving, ingrown hairs, and irritation" },
          { uk: "Охолодження робить обробку комфортною навіть на великій площі", ru: "Охлаждение делает обработку комфортной даже на большой площади", en: "Cooling keeps treatment comfortable even over a large area" },
          { uk: "⚠ Потрібен курс 6–8 процедур — лазер діє лише на волосся у фазі росту", ru: "⚠ Нужен курс 6–8 процедур — лазер действует только на волосы в фазе роста", en: "⚠ A course of 6–8 procedures is needed — the laser acts only on hair in the growth phase" },
          { uk: "⚠ Не проводиться на засмаглій шкірі — плануйте курс поза сезоном активного сонця", ru: "⚠ Не проводится на загорелой коже — планируйте курс вне сезона активного солнца", en: "⚠ Not performed on tanned skin — plan the course outside the active-sun season" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки часу займає лазерна епіляція ніг?", ru: "Сколько времени занимает лазерная эпиляция ног?", en: "How long does legs laser hair removal take?" },
        answer: { uk: "Завдяки великому розміру плями апарата Splendor X обробка проходить швидко: гомілки — близько 20–30 хвилин, повністю ноги — 30–50 хвилин. Це помітно швидше, ніж на старіших системах із малою плямою. Точний час залежить від площі та густоти волосся.", ru: "Благодаря большому размеру пятна аппарата Splendor X обработка проходит быстро: голени — около 20–30 минут, полностью ноги — 30–50 минут. Это заметно быстрее, чем на более старых системах с малым пятном. Точное время зависит от площади и густоты волос.", en: "Thanks to the large spot size of the Splendor X device, treatment is quick: lower legs about 20–30 minutes, the whole legs 30–50 minutes. This is noticeably faster than older small-spot systems. The exact time depends on the area and hair density." },
      },
      {
        question: { uk: "Скільки сеансів потрібно для гладкості ніг?", ru: "Сколько сеансов нужно для гладкости ног?", en: "How many sessions are needed for smooth legs?" },
        answer: { uk: "Зазвичай 6–8 процедур з інтервалом 4–6 тижнів. Лазер діє лише на волосся у фазі росту, тому потрібні повторні сеанси, щоб охопити всі фолікули. Після курсу ріст волосся зменшується до 90%, а для підтримання достатньо 1–2 сеансів на рік.", ru: "Обычно 6–8 процедур с интервалом 4–6 недель. Лазер действует только на волосы в фазе роста, поэтому нужны повторные сеансы, чтобы охватить все фолликулы. После курса рост волос сокращается до 90%, а для поддержания достаточно 1–2 сеансов в год.", en: "Usually 6–8 procedures at 4–6 week intervals. The laser acts only on hair in the growth phase, so repeat sessions are needed to cover all follicles. After the course hair growth is reduced by up to 90%, and 1–2 sessions per year are enough for maintenance." },
      },
      {
        question: { uk: "Чи можна робити лазерну епіляцію ніг при варикозі?", ru: "Можно ли делать лазерную эпиляцию ног при варикозе?", en: "Can legs laser hair removal be done with varicose veins?" },
        answer: { uk: "Це залежить від стадії та локалізації. Безпосередньо над вираженими варикозними венами обробку не проводять, але ділянки поза ними часто можна обробляти. Рішення ухвалює лікар після огляду, за потреби — після консультації з флебологом. Обов'язково повідомте про варикоз перед процедурою.", ru: "Это зависит от стадии и локализации. Непосредственно над выраженными варикозными венами обработку не проводят, но участки вне их часто можно обрабатывать. Решение принимает врач после осмотра, при необходимости — после консультации с флебологом. Обязательно сообщите о варикозе перед процедурой.", en: "It depends on the stage and location. Treatment is not performed directly over prominent varicose veins, but areas away from them can often be treated. The doctor decides after examination, with a phlebologist's input if needed. Always mention varicose veins before the procedure." },
      },
    ],
  },
  // ─── 10. КОНСУЛЬТАЦІЯ ЕНДОКРИНОЛОГА (diagnostics / endocrinologist) ────────
  {
    slug: "endocrinologist",
    title: { uk: "Консультація ендокринолога", ru: "Консультация эндокринолога", en: "Endocrinologist Consultation" },
    summary: {
      uk: "Консультація лікаря-ендокринолога у GENEVITY: щитоподібна залоза, цукровий діабет, гормональні порушення, надмірна вага й надниркові залози. Лікарі вищої категорії, лабораторія та УЗД того ж дня, індивідуальна схема лікування. Дніпро.",
      ru: "Консультация врача-эндокринолога в GENEVITY: щитовидная железа, сахарный диабет, гормональные нарушения, лишний вес и надпочечники. Врачи высшей категории, лаборатория и УЗИ в тот же день, индивидуальная схема лечения. Днепр.",
      en: "Consultation with an endocrinologist at GENEVITY: thyroid gland, diabetes, hormonal disorders, excess weight, and adrenal glands. Top-category doctors, same-day lab and ultrasound, an individual treatment plan. Dnipro.",
    },
    procedureLength: { uk: "30–60 хвилин", ru: "30–60 минут", en: "30–60 minutes" },
    blocks: ["faq", "doctors", "relatedServices", "finalCTA"],
    sections: [
      {
        type: "richText",
        heading: { uk: "Коли потрібна консультація ендокринолога", ru: "Когда нужна консультация эндокринолога", en: "When You Need an Endocrinologist Consultation" },
        body: {
          uk: "Ендокринолог — лікар, який діагностує та лікує захворювання залоз внутрішньої секреції та гормональні порушення. Ці стани часто розвиваються поступово й маскуються під звичайну втому, набір ваги чи зміни настрою, тому раннє звернення суттєво полегшує лікування.\n\nДо ендокринолога звертаються при проблемах зі щитоподібною залозою, цукровому діабеті, порушеннях обміну речовин, надмірній або недостатній вазі, гормональних збоях у жінок і чоловіків. У GENEVITY консультацію проводять лікарі-ендокринологи вищої категорії, спираючись на дані лабораторії та УЗД, які можна зробити того ж дня.\n\n**Симптоми, з якими варто записатися:**\n- Постійна втома, сонливість або, навпаки, дратівливість і безсоння\n- Різкі зміни ваги без зміни харчування\n- Випадіння волосся, сухість шкіри, набряки\n- Підвищена спрага та часте сечовипускання\n- Порушення менструального циклу, зниження лібідо",
          ru: "Эндокринолог — врач, который диагностирует и лечит заболевания желёз внутренней секреции и гормональные нарушения. Эти состояния часто развиваются постепенно и маскируются под обычную усталость, набор веса или перепады настроения, поэтому раннее обращение заметно облегчает лечение.\n\nК эндокринологу обращаются при проблемах со щитовидной железой, сахарном диабете, нарушениях обмена веществ, лишнем или недостаточном весе, гормональных сбоях у женщин и мужчин. В GENEVITY консультацию проводят эндокринологи высшей категории, опираясь на данные лаборатории и УЗИ, которые можно сделать в тот же день.\n\n**Симптомы, с которыми стоит записаться:**\n- Постоянная усталость, сонливость или, наоборот, раздражительность и бессонница\n- Резкие изменения веса без изменения питания\n- Выпадение волос, сухость кожи, отёки\n- Повышенная жажда и частое мочеиспускание\n- Нарушение менструального цикла, снижение либидо",
          en: "An endocrinologist is a doctor who diagnoses and treats diseases of the endocrine glands and hormonal disorders. These conditions often develop gradually and masquerade as ordinary fatigue, weight gain, or mood swings, so seeking help early makes treatment considerably easier.\n\nPeople see an endocrinologist for thyroid problems, diabetes, metabolic disorders, excess or insufficient weight, and hormonal imbalances in women and men. At GENEVITY the consultation is carried out by top-category endocrinologists who draw on lab and ultrasound data that can be obtained the same day.\n\n**Symptoms worth booking for:**\n- Constant fatigue and drowsiness, or conversely irritability and insomnia\n- Sharp weight changes without any change in diet\n- Hair loss, dry skin, swelling\n- Increased thirst and frequent urination\n- Menstrual cycle disturbances, reduced libido",
        },
      },
      {
        type: "bullets",
        heading: { uk: "З якими питаннями звертаються до ендокринолога", ru: "С какими вопросами обращаются к эндокринологу", en: "What an Endocrinologist Helps With" },
        items: [
          { uk: "Захворювання щитоподібної залози — гіпотиреоз, гіпертиреоз, вузли, аутоімунний тиреоїдит", ru: "Заболевания щитовидной железы — гипотиреоз, гипертиреоз, узлы, аутоиммунный тиреоидит", en: "Thyroid disease — hypothyroidism, hyperthyroidism, nodules, autoimmune thyroiditis" },
          { uk: "Цукровий діабет 1 і 2 типу та переддіабет", ru: "Сахарный диабет 1 и 2 типа и предиабет", en: "Type 1 and type 2 diabetes and prediabetes" },
          { uk: "Надмірна вага, ожиріння та метаболічний синдром", ru: "Лишний вес, ожирение и метаболический синдром", en: "Excess weight, obesity, and metabolic syndrome" },
          { uk: "Гормональні порушення у жінок і чоловіків", ru: "Гормональные нарушения у женщин и мужчин", en: "Hormonal imbalances in women and men" },
          { uk: "Захворювання надниркових залоз", ru: "Заболевания надпочечников", en: "Adrenal gland disorders" },
          { uk: "Остеопороз і порушення обміну кальцію", ru: "Остеопороз и нарушения обмена кальция", en: "Osteoporosis and calcium metabolism disorders" },
          { uk: "Супровід у програмах Longevity та Anti-Age", ru: "Сопровождение в программах Longevity и Anti-Age", en: "Support within Longevity and Anti-Age programmes" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить консультація ендокринолога", ru: "Как проходит консультация эндокринолога", en: "How the Endocrinologist Consultation Works" },
        steps: [
          { title: { uk: "Збір анамнезу та скарг", ru: "Сбор анамнеза и жалоб", en: "History and symptoms" }, description: { uk: "Лікар розпитує про симптоми, спосіб життя, спадковість і вже наявні результати аналізів.", ru: "Врач расспрашивает о симптомах, образе жизни, наследственности и уже имеющихся результатах анализов.", en: "The doctor asks about symptoms, lifestyle, family history, and any existing test results." } },
          { title: { uk: "Огляд та пальпація", ru: "Осмотр и пальпация", en: "Examination and palpation" }, description: { uk: "Оцінка щитоподібної залози, шкіри, ваги, артеріального тиску та інших клінічних ознак.", ru: "Оценка щитовидной железы, кожи, веса, артериального давления и других клинических признаков.", en: "Assessment of the thyroid gland, skin, weight, blood pressure, and other clinical signs." } },
          { title: { uk: "Призначення діагностики", ru: "Назначение диагностики", en: "Diagnostic tests" }, description: { uk: "За потреби — аналізи на гормони та УЗД, які можна зробити в GENEVITY того ж дня.", ru: "При необходимости — анализы на гормоны и УЗИ, которые можно сделать в GENEVITY в тот же день.", en: "If needed, hormone tests and ultrasound, available at GENEVITY the same day." } },
          { title: { uk: "Індивідуальна схема лікування", ru: "Индивидуальная схема лечения", en: "Individual treatment plan" }, description: { uk: "Лікар формує план терапії та корекції способу життя й призначає контрольний візит.", ru: "Врач формирует план терапии и коррекции образа жизни и назначает контрольный визит.", en: "The doctor builds a treatment and lifestyle-correction plan and schedules a follow-up." } },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Які аналізи потрібні перед консультацією ендокринолога?", ru: "Какие анализы нужны перед консультацией эндокринолога?", en: "What tests are needed before an endocrinologist consultation?" },
        answer: { uk: "На першу консультацію можна прийти без аналізів — лікар сам визначить, які дослідження потрібні саме у вашому випадку. Якщо у вас уже є свіжі результати аналізів на гормони, УЗД щитоподібної залози чи виписки, візьміть їх із собою: це допоможе лікарю швидше зорієнтуватися. За потреби аналізи та УЗД можна зробити в GENEVITY того ж дня.", ru: "На первую консультацию можно прийти без анализов — врач сам определит, какие исследования нужны именно в вашем случае. Если у вас уже есть свежие результаты анализов на гормоны, УЗИ щитовидной железы или выписки, возьмите их с собой: это поможет врачу быстрее сориентироваться. При необходимости анализы и УЗИ можно сделать в GENEVITY в тот же день.", en: "You can come to the first consultation without any tests — the doctor will determine which investigations you specifically need. If you already have recent hormone tests, a thyroid ultrasound, or medical records, bring them along: it helps the doctor get oriented faster. If needed, tests and ultrasound can be done at GENEVITY the same day." },
      },
      {
        question: { uk: "Коли звертатися до ендокринолога щодо щитоподібної залози?", ru: "Когда обращаться к эндокринологу по поводу щитовидной железы?", en: "When should you see an endocrinologist about the thyroid?" },
        answer: { uk: "Варто записатися при постійній втомі, помітних змінах ваги, випадінні волосся, відчутті кому в горлі, пітливості або, навпаки, мерзлякуватості, перебоях у роботі серця. Також консультація потрібна, якщо на УЗД виявили вузли або є спадкова схильність до захворювань щитоподібної залози. Раннє звернення дозволяє коригувати стан простіше та без ускладнень.", ru: "Стоит записаться при постоянной усталости, заметных изменениях веса, выпадении волос, ощущении кома в горле, потливости или, наоборот, зябкости, перебоях в работе сердца. Также консультация нужна, если на УЗИ выявили узлы или есть наследственная предрасположенность к заболеваниям щитовидной железы. Раннее обращение позволяет корректировать состояние проще и без осложнений.", en: "Book if you have persistent fatigue, noticeable weight changes, hair loss, a lump-in-the-throat sensation, sweating or conversely feeling cold, or heart-rhythm irregularities. A consultation is also needed if an ultrasound found nodules or you have a family predisposition to thyroid disease. Seeking help early makes the condition easier to manage and helps avoid complications." },
      },
      {
        question: { uk: "Чи допомагає ендокринолог при проблемах із вагою?", ru: "Помогает ли эндокринолог при проблемах с весом?", en: "Can an endocrinologist help with weight problems?" },
        answer: { uk: "Так. Надмірна вага, яка не піддається корекції харчуванням і фізичним навантаженням, часто пов'язана з гормональними чинниками — роботою щитоподібної залози, інсулінорезистентністю чи метаболічним синдромом. Ендокринолог визначить причину за допомогою аналізів і складе індивідуальний план, за потреби — у зв'язці з дієтологом GENEVITY.", ru: "Да. Лишний вес, который не поддаётся коррекции питанием и физической нагрузкой, часто связан с гормональными факторами — работой щитовидной железы, инсулинорезистентностью или метаболическим синдромом. Эндокринолог определит причину с помощью анализов и составит индивидуальный план, при необходимости — в связке с диетологом GENEVITY.", en: "Yes. Excess weight that does not respond to diet and exercise is often linked to hormonal factors — thyroid function, insulin resistance, or metabolic syndrome. The endocrinologist will identify the cause through tests and build an individual plan, working with the GENEVITY dietitian if needed." },
      },
    ],
  },

  // ─── 11. КОНСУЛЬТАЦІЯ ПЛАСТИЧНОГО ХІРУРГА (diagnostics / plastic-surgeon) ──
  {
    slug: "plastic-surgeon",
    title: { uk: "Консультація пластичного хірурга", ru: "Консультация пластического хирурга", en: "Plastic Surgeon Consultation" },
    summary: {
      uk: "Консультація пластичного хірурга у GENEVITY: естетична та реконструктивна хірургія обличчя й тіла, чесна оцінка показань, підбір методики та план підготовки до операції. Хірурги вищої категорії, Дніпро.",
      ru: "Консультация пластического хирурга в GENEVITY: эстетическая и реконструктивная хирургия лица и тела, честная оценка показаний, подбор методики и план подготовки к операции. Хирурги высшей категории, Днепр.",
      en: "Consultation with a plastic surgeon at GENEVITY: aesthetic and reconstructive surgery of the face and body, an honest assessment of indications, technique selection, and a pre-op plan. Top-category surgeons, Dnipro.",
    },
    procedureLength: { uk: "30–60 хвилин", ru: "30–60 минут", en: "30–60 minutes" },
    blocks: ["faq", "doctors", "relatedServices", "finalCTA"],
    sections: [
      {
        type: "richText",
        heading: { uk: "Навіщо потрібна консультація пластичного хірурга", ru: "Зачем нужна консультация пластического хирурга", en: "Why You Need a Plastic Surgeon Consultation" },
        body: {
          uk: "Консультація пластичного хірурга — перший і ключовий етап на шляху до естетичної чи реконструктивної операції. На прийомі лікар оцінює анатомічні особливості, стан здоров'я та очікування пацієнта, пояснює реальні можливості й обмеження методів і допомагає ухвалити зважене рішення.\n\nУ GENEVITY консультують пластичні хірурги вищої категорії з досвідом естетичної та реконструктивної хірургії. Лікар детально розповідає про хід операції, анестезію, період відновлення та можливі ризики, а також пропонує альтернативи, якщо безопераційні методи здатні дати потрібний результат.\n\n**На консультації ви отримаєте:**\n- Чесну оцінку, чи показана операція саме у вашому випадку\n- Пояснення доступних методик і очікуваного результату\n- Інформацію про підготовку, анестезію та відновлення\n- Індивідуальний план і відповіді на всі запитання",
          ru: "Консультация пластического хирурга — первый и ключевой этап на пути к эстетической или реконструктивной операции. На приёме врач оценивает анатомические особенности, состояние здоровья и ожидания пациента, объясняет реальные возможности и ограничения методов и помогает принять взвешенное решение.\n\nВ GENEVITY консультируют пластические хирурги высшей категории с опытом эстетической и реконструктивной хирургии. Врач подробно рассказывает о ходе операции, анестезии, периоде восстановления и возможных рисках, а также предлагает альтернативы, если безоперационные методы способны дать нужный результат.\n\n**На консультации вы получите:**\n- Честную оценку, показана ли операция именно в вашем случае\n- Объяснение доступных методик и ожидаемого результата\n- Информацию о подготовке, анестезии и восстановлении\n- Индивидуальный план и ответы на все вопросы",
          en: "A plastic surgeon consultation is the first and most important step on the way to aesthetic or reconstructive surgery. At the appointment the doctor assesses your anatomy, health, and expectations, explains the real possibilities and limits of each method, and helps you reach an informed decision.\n\nAt GENEVITY consultations are given by top-category plastic surgeons experienced in aesthetic and reconstructive surgery. The doctor explains the operation in detail — anaesthesia, recovery period, and possible risks — and offers alternatives when non-surgical methods can achieve the desired result.\n\n**At the consultation you will get:**\n- An honest assessment of whether surgery is indicated in your case\n- An explanation of the available techniques and the expected outcome\n- Information about preparation, anaesthesia, and recovery\n- An individual plan and answers to all your questions",
        },
      },
      {
        type: "bullets",
        heading: { uk: "Питання, з якими звертаються до пластичного хірурга", ru: "Вопросы, с которыми обращаются к пластическому хирургу", en: "What a Plastic Surgeon Helps With" },
        items: [
          { uk: "Блефаропластика — корекція повік і зони навколо очей", ru: "Блефаропластика — коррекция век и зоны вокруг глаз", en: "Blepharoplasty — correction of the eyelids and the area around the eyes" },
          { uk: "Мамопластика — збільшення, зменшення або підтяжка грудей", ru: "Маммопластика — увеличение, уменьшение или подтяжка груди", en: "Mammoplasty — breast augmentation, reduction, or lift" },
          { uk: "Абдомінопластика — корекція передньої черевної стінки", ru: "Абдоминопластика — коррекция передней брюшной стенки", en: "Abdominoplasty — correction of the anterior abdominal wall" },
          { uk: "Ліпосакція та корекція контурів тіла", ru: "Липосакция и коррекция контуров тела", en: "Liposuction and body contouring" },
          { uk: "Ринопластика та отопластика", ru: "Ринопластика и отопластика", en: "Rhinoplasty and otoplasty" },
          { uk: "Корекція рубців, шрамів і наслідків травм", ru: "Коррекция рубцов, шрамов и последствий травм", en: "Correction of scars and the consequences of injuries" },
          { uk: "Видалення новоутворень шкіри спільно з онкологом", ru: "Удаление новообразований кожи совместно с онкологом", en: "Removal of skin growths together with an oncologist" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить консультація пластичного хірурга", ru: "Как проходит консультация пластического хирурга", en: "How the Plastic Surgeon Consultation Works" },
        steps: [
          { title: { uk: "Бесіда та визначення запиту", ru: "Беседа и определение запроса", en: "Discussion and goals" }, description: { uk: "Лікар з'ясовує побажання, мотивацію та очікування пацієнта щодо результату.", ru: "Врач выясняет пожелания, мотивацию и ожидания пациента относительно результата.", en: "The doctor clarifies your wishes, motivation, and expectations for the result." } },
          { title: { uk: "Огляд та оцінка анатомії", ru: "Осмотр и оценка анатомии", en: "Examination and anatomy assessment" }, description: { uk: "Аналіз тканин, пропорцій і стану здоров'я, обговорення показань і протипоказань.", ru: "Анализ тканей, пропорций и состояния здоровья, обсуждение показаний и противопоказаний.", en: "Analysis of tissues, proportions, and health, with a discussion of indications and contraindications." } },
          { title: { uk: "Обговорення методики", ru: "Обсуждение методики", en: "Discussing the technique" }, description: { uk: "Хірург пояснює варіанти операції, анестезію, можливі ризики та період відновлення.", ru: "Хирург объясняет варианты операции, анестезию, возможные риски и период восстановления.", en: "The surgeon explains the surgical options, anaesthesia, possible risks, and the recovery period." } },
          { title: { uk: "План і підготовка", ru: "План и подготовка", en: "Plan and preparation" }, description: { uk: "Складається індивідуальний план, перелік аналізів та обстежень перед операцією.", ru: "Составляется индивидуальный план, перечень анализов и обследований перед операцией.", en: "An individual plan is drawn up, along with the list of pre-operative tests and examinations." } },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Чи обов'язкова операція після консультації пластичного хірурга?", ru: "Обязательна ли операция после консультации пластического хирурга?", en: "Is surgery mandatory after a plastic surgeon consultation?" },
        answer: { uk: "Ні. Консультація ні до чого не зобов'язує — це можливість отримати професійну оцінку та повну інформацію, щоб ухвалити рішення без поспіху. Часто хірург пропонує безопераційні альтернативи, якщо вони здатні дати потрібний результат. Рішення про операцію завжди залишається за пацієнтом.", ru: "Нет. Консультация ни к чему не обязывает — это возможность получить профессиональную оценку и полную информацию, чтобы принять решение без спешки. Часто хирург предлагает безоперационные альтернативы, если они способны дать нужный результат. Решение об операции всегда остаётся за пациентом.", en: "No. A consultation commits you to nothing — it is a chance to get a professional assessment and full information so you can decide without rushing. The surgeon often suggests non-surgical alternatives when they can achieve the desired result. The decision to operate always rests with the patient." },
      },
      {
        question: { uk: "Які аналізи потрібні перед пластичною операцією?", ru: "Какие анализы нужны перед пластической операцией?", en: "What tests are needed before plastic surgery?" },
        answer: { uk: "Перелік залежить від типу операції та визначається індивідуально, але зазвичай це стандартне передопераційне обстеження: загальний і біохімічний аналізи крові, коагулограма, аналізи на інфекції, ЕКГ і висновок терапевта. Точний список хірург надасть на консультації. Більшість досліджень можна пройти безпосередньо в GENEVITY.", ru: "Перечень зависит от типа операции и определяется индивидуально, но обычно это стандартное предоперационное обследование: общий и биохимический анализы крови, коагулограмма, анализы на инфекции, ЭКГ и заключение терапевта. Точный список хирург предоставит на консультации. Большинство исследований можно пройти прямо в GENEVITY.", en: "The list depends on the type of operation and is set individually, but it is usually a standard pre-operative work-up: complete and biochemical blood counts, a coagulation panel, infection screening, an ECG, and a physician's clearance. The surgeon provides the exact list at the consultation. Most of the tests can be done directly at GENEVITY." },
      },
      {
        question: { uk: "З якого віку можна звертатися до пластичного хірурга?", ru: "С какого возраста можно обращаться к пластическому хирургу?", en: "From what age can you see a plastic surgeon?" },
        answer: { uk: "Планові естетичні операції зазвичай виконують з 18 років, коли організм повністю сформований. Виняток — реконструктивні втручання за медичними показаннями, які проводять і раніше за рішенням лікарів. На консультації хірург враховує не лише вік, а й загальний стан здоров'я та обґрунтованість запиту.", ru: "Плановые эстетические операции обычно выполняют с 18 лет, когда организм полностью сформирован. Исключение — реконструктивные вмешательства по медицинским показаниям, которые проводят и раньше по решению врачей. На консультации хирург учитывает не только возраст, но и общее состояние здоровья и обоснованность запроса.", en: "Elective aesthetic operations are usually performed from the age of 18, when the body is fully developed. The exception is reconstructive procedures for medical reasons, which may be done earlier at the doctors' discretion. At the consultation the surgeon considers not only age but also overall health and how well-founded the request is." },
      },
    ],
  },
];

const PROCEDURE_BLOCKS = ["faq", "doctors", "equipment", "relatedServices", "finalCTA"];

async function getCategoryId(slug: string): Promise<string> {
  const [row] = await sql`SELECT id FROM service_categories WHERE slug = ${slug}`;
  if (!row) throw new Error(`Category not found: ${slug}`);
  return row.id;
}

async function seedService(svc: ServiceSeed) {
  const meta = META[svc.slug];
  if (!meta) { console.log(`⚠ NO META entry for ${svc.slug} — skipped`); return; }
  const categoryId = await getCategoryId(meta.category);

  let [row] = await sql`SELECT id FROM services WHERE slug = ${svc.slug}`;
  if (!row) {
    const id = randomUUID();
    const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM services WHERE category_id = ${categoryId}`;
    await sql`INSERT INTO services(id, slug, category_id, title_uk, sort_order) VALUES(${id}, ${svc.slug}, ${categoryId}, ${svc.title.uk}, ${Number(max) + 10})`;
    row = { id };
    console.log(`  + created ${svc.slug} in ${meta.category} (sort ${Number(max) + 10})`);
  }
  const serviceId: string = row.id;

  await sql`
    UPDATE services SET
      category_id=${categoryId},
      title_uk=${svc.title.uk}, title_ru=${svc.title.ru}, title_en=${svc.title.en},
      h1_uk=${meta.h1.uk}, h1_ru=${meta.h1.ru}, h1_en=${meta.h1.en},
      summary_uk=${svc.summary.uk}, summary_ru=${svc.summary.ru}, summary_en=${svc.summary.en},
      procedure_length_uk=${svc.procedureLength?.uk ?? null}, procedure_length_ru=${svc.procedureLength?.ru ?? null}, procedure_length_en=${svc.procedureLength?.en ?? null},
      effect_duration_uk=${svc.effectDuration?.uk ?? null}, effect_duration_ru=${svc.effectDuration?.ru ?? null}, effect_duration_en=${svc.effectDuration?.en ?? null},
      sessions_recommended_uk=${svc.sessionsRecommended?.uk ?? null}, sessions_recommended_ru=${svc.sessionsRecommended?.ru ?? null}, sessions_recommended_en=${svc.sessionsRecommended?.en ?? null},
      seo_title_uk=${meta.seoTitle.uk}, seo_title_ru=${meta.seoTitle.ru}, seo_title_en=${meta.seoTitle.en},
      seo_desc_uk=${meta.seoDesc.uk}, seo_desc_ru=${meta.seoDesc.ru}, seo_desc_en=${meta.seoDesc.en}
    WHERE id=${serviceId}`;
  await sql`DELETE FROM content_sections WHERE owner_id=${serviceId} AND owner_type='service'`;
  await sql`DELETE FROM faq_items WHERE owner_id=${serviceId} AND owner_type='service'`;
  const sectionIds: string[] = [];
  for (let i = 0; i < svc.sections.length; i++) {
    const sec = svc.sections[i]; const id = randomUUID(); sectionIds.push(id);
    await sql`INSERT INTO content_sections(id,owner_type,owner_id,sort_order,section_type,data) VALUES(${id},'service',${serviceId},${i},${sec.type}::section_type,${JSON.stringify(sectionData(sec))}::jsonb)`;
  }
  for (let i = 0; i < svc.faqs.length; i++) {
    const f = svc.faqs[i];
    await sql`INSERT INTO faq_items(owner_type,owner_id,sort_order,question_uk,question_ru,question_en,answer_uk,answer_ru,answer_en) VALUES('service',${serviceId},${i},${f.question.uk},${f.question.ru},${f.question.en},${f.answer.uk},${f.answer.ru},${f.answer.en})`;
  }
  const blockOrder = [...sectionIds, ...(svc.blocks ?? PROCEDURE_BLOCKS)];
  await sql`UPDATE services SET block_order=${blockOrder} WHERE id=${serviceId}`;
  console.log(`✓ ${svc.slug} — [${svc.sections.map(s=>s.type).join(", ")}], ${svc.faqs.length} FAQs`);
}

async function main() {
  for (const svc of services) await seedService(svc);
  await sql.end();
  console.log("\nTZ-v8 new-services DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
