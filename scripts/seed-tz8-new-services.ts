/**
 * ТЗ №8 (Метатеги) — creation + full content seeding for 9 new service pages.
 *
 * Same pattern as seed-tz6-laser-skin.ts, but the nine pages span three
 * categories, so category, doctors and reviewer are per-service here rather
 * than module constants.
 *
 * SEO title/description are parsed verbatim (incl. emoji) straight from the
 * client CSV so nothing is re-typed by hand:
 *   tasks_inweb/genevity.com.ua _ Технічне завдання №8 _ Метатеги - genevity.com.ua.csv
 * The CSV has no URLs — only page names — so rows are matched on the exact
 * "URL UA" (name) column via NAME_TO_SLUG below.
 *
 * Run: npx tsx scripts/seed-tz8-new-services.ts
 *
 * Service / slug map:
 *   apparatus-cosmetology
 *     Лазерне шліфування шрамів і рубців   → scar-resurfacing
 *     Лазерне видалення розтяжок та стрій  → stretch-marks-removal
 *     Лазерне звуження пор                 → pore-tightening
 *   intimate-rejuvenation
 *     Відбілювання інтимних зон            → intimate-whitening
 *   injectable-cosmetology
 *     Інтимна біоревіталізація             → intimate-biorevitalisation
 *     Біоревіталізація губ                 → lip-biorevitalisation
 *     Біоревіталізація шиї і декольте      → neck-biorevitalisation
 *     Біоревіталізація інтимної зони       → intimate-zone-biorevitalisation
 *     Ботулінотерапія під пахвами          → underarm-botulinum
 *
 * NOTE on rows 5 and 8: "Інтимна біоревіталізація" and "Біоревіталізація
 * інтимної зони" are the same treatment under two query variants. Both are
 * created because both are in the client CSV; the copy is deliberately split
 * so they do not read as duplicates — the first covers the treatment and its
 * mechanism, the second the anatomical zones and aesthetic outcome. If Search
 * Console later shows the two competing for the same queries, consolidate into
 * one page and 301 the other.
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

const LAST_REVIEWED = "2026-08-26";
const FIXED_BLOCKS = ["equipment", "doctors", "relatedServices", "faq", "finalCTA"];

// equipment UUIDs (from the `equipment` table)
const EQ_ACUPULSE = "b9fc15cc-b374-4bc4-83f7-a0310675a287"; // CO2 лазер (AcuPulse)
const EQ_M22 = "1466b7ba-0060-447e-8619-f3c7eea7f76a";      // M22 STELLAR BLACK

// ─── CSV parsing (metatags, verbatim) ───────────────────────────────────────
const CSV_PATH = path.resolve(__dirname, "..", "tasks_inweb",
  "genevity.com.ua _ Технічне завдання №8 _ Метатеги - genevity.com.ua.csv");

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
  "Лазерне шліфування шрамів і рубців в Дніпрі": "scar-resurfacing",
  "Лазерне видалення розтяжок та стрій в Дніпрі": "stretch-marks-removal",
  "Лазерне звуження пор в Дніпрі": "pore-tightening",
  "Відбілювання інтимних зон в Дніпрі": "intimate-whitening",
  "Інтимна біоревіталізація в Дніпрі": "intimate-biorevitalisation",
  "Біоревіталізація губ в Дніпрі": "lip-biorevitalisation",
  "Біоревіталізація шиї і декольте в Дніпрі": "neck-biorevitalisation",
  "Біоревіталізація інтимної зони в Дніпрі": "intimate-zone-biorevitalisation",
  "Ботулінотерапія під пахвами в Дніпрі": "underarm-botulinum",
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
  category: string;
  doctors: string[];
  reviewer: string;
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

const COSMETOLOGISTS = ["beliyanushkin-viktor", "sepkina-hanna"];
const GYNAECOLOGISTS = ["kroshka-iryna"];

// ════════════════════════════════════════════════════════════════════════════
const services: ServiceSeed[] = [

// ─── 1. ЛАЗЕРНЕ ШЛІФУВАННЯ ШРАМІВ І РУБЦІВ ──────────────────────────────────
{
  slug: "scar-resurfacing",
  category: "apparatus-cosmetology",
  doctors: COSMETOLOGISTS,
  reviewer: "beliyanushkin-viktor",
  title: { uk: "Лазерне шліфування шрамів і рубців", ru: "Лазерная шлифовка шрамов и рубцов", en: "Laser Scar Resurfacing" },
  h1: { uk: "Лазерне шліфування шрамів і рубців в Дніпрі", ru: "Лазерная шлифовка шрамов и рубцов в Днепре", en: "Laser scar and scar resurfacing in Dnipro" },
  summary: {
    uk: "Лазерне шліфування шрамів і рубців у GENEVITY — фракційна обробка рубцевої тканини на CO₂-лазері AcuPulse. Вирівнює рельєф, пом'якшує щільний рубець і зрівнює його колір зі здоровою шкірою. Кількість сеансів залежить від віку та типу рубця, Дніпро.",
    ru: "Лазерная шлифовка шрамов и рубцов в GENEVITY — фракционная обработка рубцовой ткани на CO₂-лазере AcuPulse. Выравнивает рельеф, смягчает плотный рубец и сравнивает его цвет со здоровой кожей. Количество сеансов зависит от возраста и типа рубца, Днепр.",
    en: "Laser scar resurfacing at GENEVITY is fractional treatment of scar tissue with the AcuPulse CO₂ laser. It levels the texture, softens dense scarring, and brings its colour closer to the surrounding skin. The number of sessions depends on the age and type of the scar, Dnipro.",
  },
  procedureLength: { uk: "30-60 хвилин", ru: "30-60 минут", en: "30-60 minutes" },
  effectDuration: { uk: "Результат постійний", ru: "Результат постоянный", en: "The result is permanent" },
  sessionsRecommended: { uk: "3-5 процедур", ru: "3-5 процедур", en: "3-5 treatments" },
  equipment: [EQ_ACUPULSE],
  related: ["laser-resurfacing", "laser-resurfacing-post-acne", "acupulse-co2"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Як лазер працює з рубцевою тканиною", ru: "Как лазер работает с рубцовой тканью", en: "How the Laser Works on Scar Tissue" },
      body: {
        uk: "Рубець відрізняється від здорової шкіри будовою: колагенові волокна в ньому лежать паралельними пучками, а не переплітаються сіткою. Через це рубцева тканина щільніша, гірше розтягується й інакше відбиває світло — саме тому шрам помітний навіть тоді, коли його рельєф незначний.\n\nЛазерне шліфування шрамів і рубців діє на цю структуру. Промінь CO₂-лазера створює в тканині мікроскопічні колонки прогріву, залишаючи неушкоджені ділянки між ними. Стара колагенова матриця частково руйнується, а на її місці синтезується новий колаген — вже з нормальним, переплетеним розташуванням волокон.\n\nУ GENEVITY процедуру виконують на апараті AcuPulse від Lumenis. Лікар обирає глибину та щільність впливу окремо для кожного рубця: атрофічний, гіпертрофічний і нормотрофічний рубці потребують різних режимів.\n\n**З якими рубцями працює методика:**\n- Атрофічні — втягнуті рубці після акне, вітряної віспи, травм\n- Нормотрофічні — плоскі рубці, що відрізняються кольором або блиском\n- Гіпертрофічні — щільні випуклі рубці в межах початкової травми\n- Post-operative — сліди після хірургічних втручань і кесаревого розтину",
        ru: "Рубец отличается от здоровой кожи строением: коллагеновые волокна в нём лежат параллельными пучками, а не переплетаются сеткой. Из-за этого рубцовая ткань плотнее, хуже растягивается и иначе отражает свет — именно поэтому шрам заметен даже тогда, когда его рельеф незначителен.\n\nЛазерная шлифовка шрамов и рубцов действует на эту структуру. Луч CO₂-лазера создаёт в ткани микроскопические колонки прогрева, оставляя неповреждённые участки между ними. Старая коллагеновая матрица частично разрушается, а на её месте синтезируется новый коллаген — уже с нормальным, переплетённым расположением волокон.\n\nВ GENEVITY процедуру выполняют на аппарате AcuPulse от Lumenis. Врач выбирает глубину и плотность воздействия отдельно для каждого рубца: атрофический, гипертрофический и нормотрофический рубцы требуют разных режимов.\n\n**С какими рубцами работает методика:**\n- Атрофические — втянутые рубцы после акне, ветряной оспы, травм\n- Нормотрофические — плоские рубцы, отличающиеся цветом или блеском\n- Гипертрофические — плотные выпуклые рубцы в пределах первоначальной травмы\n- Post-operative — следы после хирургических вмешательств и кесарева сечения",
        en: "A scar differs from healthy skin in its architecture: the collagen fibres lie in parallel bundles instead of weaving into a mesh. That makes scar tissue denser, less elastic, and different in the way it reflects light — which is why a scar stays visible even when its relief is slight.\n\nLaser scar resurfacing acts on that structure. The CO₂ laser beam creates microscopic columns of heating in the tissue and leaves intact areas between them. Part of the old collagen matrix breaks down and new collagen is synthesised in its place — this time with a normal, interwoven fibre arrangement.\n\nAt GENEVITY the procedure is performed with the AcuPulse device by Lumenis. The doctor selects the depth and density separately for each scar: atrophic, hypertrophic, and normotrophic scars require different settings.\n\n**Which scars the method addresses:**\n- Atrophic — depressed scars after acne, chickenpox, or injury\n- Normotrophic — flat scars that differ in colour or sheen\n- Hypertrophic — dense raised scars confined to the original wound\n- Post-operative — marks left by surgery and caesarean section",
      },
      calloutBody: {
        uk: "Свіжий рубець і рубець віком кілька років реагують по-різному. Оптимальне вікно для роботи — від 6 до 18 місяців після загоєння, коли тканина ще активно перебудовується. Зі старішими рубцями методика теж працює, але сеансів потрібно більше.",
        ru: "Свежий рубец и рубец возрастом несколько лет реагируют по-разному. Оптимальное окно для работы — от 6 до 18 месяцев после заживления, когда ткань ещё активно перестраивается. Со старыми рубцами методика тоже работает, но сеансов нужно больше.",
        en: "A fresh scar and one several years old respond differently. The best window for treatment is 6 to 18 months after healing, while the tissue is still actively remodelling. Older scars also respond, but they need more sessions.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лазерного шліфування рубців", ru: "Показания к лазерной шлифовке рубцов", en: "Indications for Laser Scar Resurfacing" },
      indications: [
        { uk: "Атрофічні рубці після акне, вітряної віспи та травм", ru: "Атрофические рубцы после акне, ветряной оспы и травм", en: "Atrophic scars after acne, chickenpox, and injuries" },
        { uk: "Післяопераційні рубці, зокрема після кесаревого розтину", ru: "Послеоперационные рубцы, в том числе после кесарева сечения", en: "Post-surgical scars, including after a caesarean section" },
        { uk: "Гіпертрофічні рубці, що виступають над рівнем шкіри", ru: "Гипертрофические рубцы, выступающие над уровнем кожи", en: "Hypertrophic scars raised above the skin surface" },
        { uk: "Рубці, що відрізняються від навколишньої шкіри кольором або блиском", ru: "Рубцы, отличающиеся от окружающей кожи цветом или блеском", en: "Scars that differ from the surrounding skin in colour or sheen" },
        { uk: "Стягнутість тканин і обмежена рухливість шкіри в зоні рубця", ru: "Стянутость тканей и ограниченная подвижность кожи в зоне рубца", en: "Tightness and restricted skin mobility around a scar" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "A tendency to form keloid scars" },
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Активне запалення або герпес у зоні обробки", ru: "Активное воспаление или герпес в зоне обработки", en: "Active inflammation or herpes in the treatment area" },
        { uk: "Прийом ізотретиноїну протягом останніх 6 місяців", ru: "Приём изотретиноина в течение последних 6 месяцев", en: "Isotretinoin taken within the last 6 months" },
        { uk: "Свіжа засмага в зоні обробки", ru: "Свежий загар в зоне обработки", en: "A fresh tan in the treatment area" },
        { uk: "Онкологічні захворювання, декомпенсований цукровий діабет", ru: "Онкологические заболевания, декомпенсированный сахарный диабет", en: "Oncological disease, uncontrolled diabetes" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить лазерне шліфування рубця", ru: "Как проходит лазерная шлифовка рубца", en: "How Laser Scar Resurfacing Works" },
      steps: [
        { title: { uk: "Огляд і визначення типу рубця", ru: "Осмотр и определение типа рубца", en: "Assessment and scar typing" }, description: { uk: "Лікар оцінює вік, тип і глибину рубця, перевіряє схильність до келоїдів і планує кількість сеансів.", ru: "Врач оценивает возраст, тип и глубину рубца, проверяет склонность к келоидам и планирует количество сеансов.", en: "The doctor assesses the age, type, and depth of the scar, checks for a keloid tendency, and plans the number of sessions." } },
        { title: { uk: "Аплікаційна анестезія", ru: "Аппликационная анестезия", en: "Topical anaesthesia" }, description: { uk: "На зону наносять анестетик на 30-40 хвилин. Для щільних рубців можлива інфільтраційна анестезія.", ru: "На зону наносят анестетик на 30-40 минут. Для плотных рубцов возможна инфильтрационная анестезия.", en: "Anaesthetic cream is applied to the area for 30-40 minutes. Dense scars may call for infiltration anaesthesia." } },
        { title: { uk: "Фракційна обробка", ru: "Фракционная обработка", en: "Fractional pass" }, description: { uk: "Лікар опрацьовує рубець і 2-3 мм здорової шкіри навколо, щоб згладити перехід. Вплив триває 10-30 хвилин.", ru: "Врач обрабатывает рубец и 2-3 мм здоровой кожи вокруг, чтобы сгладить переход. Воздействие длится 10-30 минут.", en: "The doctor treats the scar plus 2-3 mm of healthy skin around it to soften the transition. The pass takes 10-30 minutes." } },
        { title: { uk: "Охолодження та пов'язка", ru: "Охлаждение и повязка", en: "Cooling and dressing" }, description: { uk: "Зону охолоджують, наносять загоювальний засіб, за потреби закривають захисною пов'язкою.", ru: "Зону охлаждают, наносят заживляющее средство, при необходимости закрывают защитной повязкой.", en: "The area is cooled, a healing product is applied, and a protective dressing is added if needed." } },
        { title: { uk: "Повторний сеанс через 6-8 тижнів", ru: "Повторный сеанс через 6-8 недель", en: "Repeat session in 6-8 weeks" }, description: { uk: "Колаген перебудовується поступово, тому наступний сеанс планують не раніше ніж через 6-8 тижнів.", ru: "Коллаген перестраивается постепенно, поэтому следующий сеанс планируют не раньше чем через 6-8 недель.", en: "Collagen remodels gradually, so the next session is scheduled no sooner than 6-8 weeks later." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги лазерного шліфування рубців у GENEVITY", ru: "Преимущества лазерной шлифовки рубцов в GENEVITY", en: "Benefits of Laser Scar Resurfacing at GENEVITY" },
      items: [
        { uk: "CO₂-лазер AcuPulse від Lumenis — доказовий стандарт роботи з рубцевою тканиною", ru: "CO₂-лазер AcuPulse от Lumenis — доказательный стандарт работы с рубцовой тканью", en: "The AcuPulse CO₂ laser by Lumenis — the evidence-based standard for scar tissue" },
        { uk: "Режим підбирається окремо під тип рубця, а не за єдиним протоколом", ru: "Режим подбирается отдельно под тип рубца, а не по единому протоколу", en: "Settings are chosen for the specific scar type rather than by a single protocol" },
        { uk: "Обробка країв рубця згладжує перехід до здорової шкіри", ru: "Обработка краёв рубца сглаживает переход к здоровой коже", en: "Treating the scar edges softens the transition to healthy skin" },
        { uk: "Результат накопичувальний і зберігається постійно", ru: "Результат накопительный и сохраняется постоянно", en: "The result is cumulative and lasts permanently" },
        { uk: "Перед курсом лікар перевіряє схильність до келоїдів — це впливає на тактику", ru: "Перед курсом врач проверяет склонность к келоидам — это влияет на тактику", en: "Before the course the doctor checks for a keloid tendency, which shapes the approach" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи можна прибрати рубець повністю?", ru: "Можно ли убрать рубец полностью?", en: "Can a scar be removed completely?" },
      answer: { uk: "Повністю прибрати рубець не може жодна методика — рубцева тканина не перетворюється на звичайну шкіру. Реалістична мета лазерного шліфування — зробити рубець непомітним у побутовому освітленні: вирівняти рельєф, наблизити колір до навколишньої шкіри та повернути тканині еластичність. За курс із 3-5 процедур помітність рубця зазвичай зменшується на 50-80%.", ru: "Полностью убрать рубец не может ни одна методика — рубцовая ткань не превращается в обычную кожу. Реалистичная цель лазерной шлифовки — сделать рубец незаметным при бытовом освещении: выровнять рельеф, приблизить цвет к окружающей коже и вернуть ткани эластичность. За курс из 3-5 процедур заметность рубца обычно уменьшается на 50-80%.", en: "No method removes a scar completely — scar tissue does not turn back into ordinary skin. The realistic goal of laser resurfacing is to make the scar unremarkable in everyday light: to level the texture, bring the colour closer to the surrounding skin, and restore elasticity. Over a course of 3-5 treatments, visibility typically drops by 50-80%." },
    },
    {
      question: { uk: "Через скільки часу після травми можна робити процедуру?", ru: "Через какое время после травмы можно делать процедуру?", en: "How long after an injury can the procedure be done?" },
      answer: { uk: "Рубець має повністю загоїтися — це мінімум 6 місяців. Оптимальне вікно для лазерної роботи — від 6 до 18 місяців, коли тканина ще активно перебудовується й краще відповідає на вплив. Зі старішими рубцями методика теж працює, просто потрібно більше сеансів.", ru: "Рубец должен полностью зажить — это минимум 6 месяцев. Оптимальное окно для лазерной работы — от 6 до 18 месяцев, когда ткань ещё активно перестраивается и лучше отвечает на воздействие. Со старыми рубцами методика тоже работает, просто нужно больше сеансов.", en: "The scar must be fully healed, which takes at least 6 months. The best window for laser work is 6 to 18 months, while the tissue is still remodelling actively and responds better. Older scars can be treated too — they simply need more sessions." },
    },
    {
      question: { uk: "Скільки триває відновлення після процедури?", ru: "Сколько длится восстановление после процедуры?", en: "How long is recovery after the procedure?" },
      answer: { uk: "Почервоніння та набряк тримаються 2-4 дні, легке лущення — до 7 днів. Точний термін залежить від глибини обраного режиму: делікатна обробка нормотрофічного рубця відновлюється швидше, ніж глибока робота з атрофічним. Протягом місяця після процедури зону потрібно захищати від сонця кремом SPF 50.", ru: "Покраснение и отёк держатся 2-4 дня, лёгкое шелушение — до 7 дней. Точный срок зависит от глубины выбранного режима: деликатная обработка нормотрофического рубца восстанавливается быстрее, чем глубокая работа с атрофическим. В течение месяца после процедуры зону нужно защищать от солнца кремом SPF 50.", en: "Redness and swelling last 2-4 days and light flaking up to 7 days. The exact timeframe depends on the depth of the chosen mode: gentle work on a normotrophic scar heals faster than deep treatment of an atrophic one. For a month afterwards the area must be protected with SPF 50." },
    },
  ],
},

// ─── 2. ЛАЗЕРНЕ ВИДАЛЕННЯ РОЗТЯЖОК ТА СТРІЙ ─────────────────────────────────
{
  slug: "stretch-marks-removal",
  category: "apparatus-cosmetology",
  doctors: COSMETOLOGISTS,
  reviewer: "beliyanushkin-viktor",
  title: { uk: "Лазерне видалення розтяжок", ru: "Лазерное удаление растяжек", en: "Laser Stretch Mark Removal" },
  h1: { uk: "Лазерне видалення розтяжок та стрій в Дніпрі", ru: "Лазерное удаление растяжек и стрий в Днепре", en: "Laser stretch mark removal in Dnipro" },
  summary: {
    uk: "Лазерне видалення розтяжок у GENEVITY — фракційна обробка стрій на CO₂-лазері AcuPulse. Ущільнює витончену шкіру, згладжує рельєф і зменшує контраст між стрією та навколишньою тканиною. Найкраще відповідають молоді рожеві розтяжки, Дніпро.",
    ru: "Лазерное удаление растяжек в GENEVITY — фракционная обработка стрий на CO₂-лазере AcuPulse. Уплотняет истончённую кожу, сглаживает рельеф и уменьшает контраст между стрией и окружающей тканью. Лучше всего отвечают молодые розовые растяжки, Днепр.",
    en: "Laser stretch mark removal at GENEVITY is fractional treatment of striae with the AcuPulse CO₂ laser. It thickens the thinned skin, smooths the texture, and reduces the contrast between the stria and the surrounding tissue. Young pink stretch marks respond best, Dnipro.",
  },
  procedureLength: { uk: "40-60 хвилин", ru: "40-60 минут", en: "40-60 minutes" },
  effectDuration: { uk: "Результат постійний", ru: "Результат постоянный", en: "The result is permanent" },
  sessionsRecommended: { uk: "3-6 процедур", ru: "3-6 процедур", en: "3-6 treatments" },
  equipment: [EQ_ACUPULSE],
  related: ["scar-resurfacing", "laser-resurfacing", "exion-body"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Чому розтяжки не зникають самі", ru: "Почему растяжки не исчезают сами", en: "Why Stretch Marks Do Not Fade on Their Own" },
      body: {
        uk: "Стрія — це рубець, який утворився всередині шкіри. Коли тканина розтягується швидше, ніж встигає синтезуватися колаген, волокна дерми рвуться. Розрив заповнюється сполучною тканиною — вона тонша, менш еластична й позбавлена нормального судинного та пігментного малюнка.\n\nСаме тому креми та масажі не прибирають розтяжки: діюча речовина не змінює структуру дерми на глибині 1-2 мм. Лазерне видалення розтяжок працює саме там.\n\nПромінь CO₂-лазера створює в зоні стрії мікроколонки прогріву. Пошкоджена матриця частково руйнується, запускається синтез нового колагену й еластину, а шкіра в зоні розтяжки поступово потовщується. Рельєф вирівнюється, а межа між стрією та здоровою шкірою стає менш контрастною.\n\n**Що впливає на результат:**\n- Вік стрій: свіжі рожеві та червоні (striae rubrae) відповідають краще за старі білі (striae albae)\n- Площа та глибина ураження\n- Локалізація: живіт і стегна реагують повільніше за груди та руки\n- Регулярність курсу та догляд між сеансами",
        ru: "Стрия — это рубец, который образовался внутри кожи. Когда ткань растягивается быстрее, чем успевает синтезироваться коллаген, волокна дермы рвутся. Разрыв заполняется соединительной тканью — она тоньше, менее эластична и лишена нормального сосудистого и пигментного рисунка.\n\nИменно поэтому кремы и массажи не убирают растяжки: действующее вещество не меняет структуру дермы на глубине 1-2 мм. Лазерное удаление растяжек работает именно там.\n\nЛуч CO₂-лазера создаёт в зоне стрии микроколонки прогрева. Повреждённая матрица частично разрушается, запускается синтез нового коллагена и эластина, а кожа в зоне растяжки постепенно утолщается. Рельеф выравнивается, а граница между стрией и здоровой кожей становится менее контрастной.\n\n**Что влияет на результат:**\n- Возраст стрий: свежие розовые и красные (striae rubrae) отвечают лучше старых белых (striae albae)\n- Площадь и глубина поражения\n- Локализация: живот и бёдра реагируют медленнее груди и рук\n- Регулярность курса и уход между сеансами",
        en: "A stria is a scar formed inside the skin. When tissue stretches faster than collagen can be synthesised, the dermal fibres tear. The tear fills with connective tissue that is thinner, less elastic, and lacks the normal vascular and pigment pattern.\n\nThat is why creams and massage do not remove stretch marks: the active ingredient does not change the structure of the dermis at a depth of 1-2 mm. Laser stretch mark removal works exactly there.\n\nThe CO₂ laser beam creates microcolumns of heating in the stria. The damaged matrix partly breaks down, synthesis of new collagen and elastin begins, and the skin over the stretch mark gradually thickens. The texture levels out and the border between the stria and healthy skin becomes less pronounced.\n\n**What affects the result:**\n- Age of the striae: fresh pink and red ones (striae rubrae) respond better than old white ones (striae albae)\n- The area and depth involved\n- Location: the abdomen and thighs respond more slowly than the chest and arms\n- Consistency of the course and care between sessions",
      },
      calloutBody: {
        uk: "Білі розтяжки віком понад 2 роки теж піддаються корекції, але потребують більшої кількості сеансів і дають скромніший приріст. На консультації лікар називає реалістичний відсоток покращення саме для ваших стрій.",
        ru: "Белые растяжки возрастом более 2 лет тоже поддаются коррекции, но требуют большего количества сеансов и дают более скромный прирост. На консультации врач называет реалистичный процент улучшения именно для ваших стрий.",
        en: "White stretch marks older than two years can also be improved, but they need more sessions and give a more modest gain. At the consultation the doctor gives you a realistic percentage for your own striae.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лазерного видалення розтяжок", ru: "Показания к лазерному удалению растяжек", en: "Indications for Laser Stretch Mark Removal" },
      indications: [
        { uk: "Свіжі рожеві та червоні стрії після вагітності або зміни ваги", ru: "Свежие розовые и красные стрии после беременности или изменения веса", en: "Fresh pink and red striae after pregnancy or weight change" },
        { uk: "Білі атрофічні розтяжки на животі, стегнах, сідницях", ru: "Белые атрофические растяжки на животе, бёдрах, ягодицах", en: "White atrophic stretch marks on the abdomen, thighs, and buttocks" },
        { uk: "Стрії після інтенсивного набору м'язової маси", ru: "Стрии после интенсивного набора мышечной массы", en: "Striae after rapid muscle gain" },
        { uk: "Розтяжки на грудях і плечах після підліткового ростового стрибка", ru: "Растяжки на груди и плечах после подросткового ростового скачка", en: "Stretch marks on the chest and shoulders after an adolescent growth spurt" },
        { uk: "Втрата щільності шкіри в зоні стрій", ru: "Потеря плотности кожи в зоне стрий", en: "Loss of skin density in the area of striae" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "A tendency to form keloid scars" },
        { uk: "Свіжа засмага, зокрема після солярію", ru: "Свежий загар, в том числе после солярия", en: "A fresh tan, including from a sunbed" },
        { uk: "Активні запальні процеси або пошкодження шкіри в зоні обробки", ru: "Активные воспалительные процессы или повреждения кожи в зоне обработки", en: "Active inflammation or broken skin in the treatment area" },
        { uk: "Прийом ізотретиноїну протягом останніх 6 місяців", ru: "Приём изотретиноина в течение последних 6 месяцев", en: "Isotretinoin taken within the last 6 months" },
        { uk: "Декомпенсований цукровий діабет, онкологічні захворювання", ru: "Декомпенсированный сахарный диабет, онкологические заболевания", en: "Uncontrolled diabetes, oncological disease" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура", ru: "Как проходит процедура", en: "How the Procedure Works" },
      steps: [
        { title: { uk: "Оцінка стрій", ru: "Оценка стрий", en: "Assessing the striae" }, description: { uk: "Лікар визначає вік і тип розтяжок, площу зони та планує кількість сеансів і інтервал між ними.", ru: "Врач определяет возраст и тип растяжек, площадь зоны и планирует количество сеансов и интервал между ними.", en: "The doctor determines the age and type of the stretch marks and the size of the area, then plans the number of sessions and the interval between them." } },
        { title: { uk: "Підготовка зони", ru: "Подготовка зоны", en: "Preparing the area" }, description: { uk: "Шкіру очищують і наносять анестетик на 30-40 хвилин — обробка великих зон проходить комфортно.", ru: "Кожу очищают и наносят анестетик на 30-40 минут — обработка больших зон проходит комфортно.", en: "The skin is cleansed and anaesthetic cream is applied for 30-40 minutes, so treating larger areas stays comfortable." } },
        { title: { uk: "Обробка лазером", ru: "Обработка лазером", en: "Laser pass" }, description: { uk: "Лікар опрацьовує кожну стрію та шкіру навколо неї. Живіт або стегна займають 30-45 хвилин.", ru: "Врач обрабатывает каждую стрию и кожу вокруг неё. Живот или бёдра занимают 30-45 минут.", en: "The doctor treats each stria and the skin around it. The abdomen or thighs take 30-45 minutes." } },
        { title: { uk: "Охолодження та відновлювальний засіб", ru: "Охлаждение и восстанавливающее средство", en: "Cooling and repair product" }, description: { uk: "Зону охолоджують, наносять пантенол або інший бар'єрний засіб і дають рекомендації на 7 днів.", ru: "Зону охлаждают, наносят пантенол или другое барьерное средство и дают рекомендации на 7 дней.", en: "The area is cooled, panthenol or another barrier product is applied, and you receive care instructions for 7 days." } },
        { title: { uk: "Курс із інтервалом 6-8 тижнів", ru: "Курс с интервалом 6-8 недель", en: "A course at 6-8 week intervals" }, description: { uk: "Результат накопичується від сеансу до сеансу — фінальну оцінку роблять через 3 місяці після останньої процедури.", ru: "Результат накапливается от сеанса к сеансу — финальную оценку делают через 3 месяца после последней процедуры.", en: "The result builds from session to session — the final assessment is made three months after the last treatment." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги методики в GENEVITY", ru: "Преимущества методики в GENEVITY", en: "Benefits of the Method at GENEVITY" },
      items: [
        { uk: "Фракційний CO₂-лазер працює на глибині залягання стрії, а не на поверхні шкіри", ru: "Фракционный CO₂-лазер работает на глубине залегания стрии, а не на поверхности кожи", en: "The fractional CO₂ laser works at the depth where the stria sits, not on the skin surface" },
        { uk: "Підходить для великих зон: живіт, стегна, сідниці, груди", ru: "Подходит для больших зон: живот, бёдра, ягодицы, грудь", en: "Suitable for larger areas: abdomen, thighs, buttocks, chest" },
        { uk: "Одночасно покращує і рельєф, і щільність витонченої шкіри", ru: "Одновременно улучшает и рельеф, и плотность истончённой кожи", en: "Improves both the texture and the density of thinned skin at once" },
        { uk: "Лікар заздалегідь називає реалістичний відсоток покращення", ru: "Врач заранее называет реалистичный процент улучшения", en: "The doctor tells you a realistic percentage of improvement in advance" },
        { uk: "Результат зберігається постійно за умови стабільної ваги", ru: "Результат сохраняется постоянно при условии стабильного веса", en: "The result lasts permanently as long as weight stays stable" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи прибирає лазер білі розтяжки?", ru: "Убирает ли лазер белые растяжки?", en: "Does the laser remove white stretch marks?" },
      answer: { uk: "Так, але результат скромніший, ніж на свіжих рожевих стріях. У білій розтяжці вже немає судинного компонента, тому працюємо тільки з рельєфом і щільністю тканини. Реалістичне очікування — зменшення помітності на 30-50% за курс із 4-6 процедур; стрія стає більш гладкою й менш контрастною, але слід залишається.", ru: "Да, но результат скромнее, чем на свежих розовых стриях. В белой растяжке уже нет сосудистого компонента, поэтому работаем только с рельефом и плотностью ткани. Реалистичное ожидание — уменьшение заметности на 30-50% за курс из 4-6 процедур; стрия становится более гладкой и менее контрастной, но след остаётся.", en: "Yes, though the result is more modest than on fresh pink striae. A white stretch mark no longer has a vascular component, so the work is limited to texture and tissue density. A realistic expectation is a 30-50% reduction in visibility over 4-6 treatments: the stria becomes smoother and less contrasting, but a trace remains." },
    },
    {
      question: { uk: "Коли можна робити процедуру після пологів?", ru: "Когда можно делать процедуру после родов?", en: "How soon after giving birth can the procedure be done?" },
      answer: { uk: "Після завершення лактації та стабілізації ваги — зазвичай це 6-12 місяців після пологів. Раніше процедуру не проводять із двох причин: під час годування діє протипоказання, а нестабільна вага може призвести до появи нових стрій уже після курсу.", ru: "После завершения лактации и стабилизации веса — обычно это 6-12 месяцев после родов. Раньше процедуру не проводят по двум причинам: во время кормления действует противопоказание, а нестабильный вес может привести к появлению новых стрий уже после курса.", en: "After breastfeeding has finished and weight has stabilised — usually 6-12 months after birth. It is not done earlier for two reasons: breastfeeding is a contraindication, and unstable weight can produce new striae after the course is complete." },
    },
    {
      question: { uk: "Скільки сеансів потрібно?", ru: "Сколько сеансов нужно?", en: "How many sessions are needed?" },
      answer: { uk: "Зазвичай 3-6 процедур з інтервалом 6-8 тижнів. Свіжі рожеві стрії часто відповідають уже після 2-3 сеансів, старі білі потребують повного курсу. Точну кількість лікар називає після огляду, орієнтуючись на вік розтяжок і площу зони.", ru: "Обычно 3-6 процедур с интервалом 6-8 недель. Свежие розовые стрии часто отвечают уже после 2-3 сеансов, старые белые требуют полного курса. Точное количество врач называет после осмотра, ориентируясь на возраст растяжек и площадь зоны.", en: "Usually 3-6 treatments at 6-8 week intervals. Fresh pink striae often respond after 2-3 sessions, while old white ones need the full course. The doctor gives you an exact number after examining the area, based on the age of the stretch marks and the size of the zone." },
    },
  ],
},

// ─── 3. ЛАЗЕРНЕ ЗВУЖЕННЯ ПОР ────────────────────────────────────────────────
{
  slug: "pore-tightening",
  category: "apparatus-cosmetology",
  doctors: COSMETOLOGISTS,
  reviewer: "beliyanushkin-viktor",
  title: { uk: "Лазерне звуження пор", ru: "Лазерное сужение пор", en: "Laser Pore Tightening" },
  h1: { uk: "Лазерне звуження пор в Дніпрі", ru: "Лазерное сужение пор в Днепре", en: "Laser pore tightening in Dnipro" },
  summary: {
    uk: "Лазерне звуження пор у GENEVITY — делікатна фракційна обробка шкіри на CO₂-лазері AcuPulse. Ущільнює стінки пори, скорочує її видимий діаметр і вирівнює текстуру Т-зони. Курс планують з урахуванням типу шкіри та активності сальних залоз, Дніпро.",
    ru: "Лазерное сужение пор в GENEVITY — деликатная фракционная обработка кожи на CO₂-лазере AcuPulse. Уплотняет стенки поры, сокращает её видимый диаметр и выравнивает текстуру Т-зоны. Курс планируют с учётом типа кожи и активности сальных желёз, Днепр.",
    en: "Laser pore tightening at GENEVITY is gentle fractional treatment with the AcuPulse CO₂ laser. It firms the walls of the pore, reduces its visible diameter, and evens out the texture of the T-zone. The course is planned around your skin type and sebaceous activity, Dnipro.",
  },
  procedureLength: { uk: "30-45 хвилин", ru: "30-45 минут", en: "30-45 minutes" },
  effectDuration: { uk: "8-12 місяців", ru: "8-12 месяцев", en: "8-12 months" },
  sessionsRecommended: { uk: "2-4 процедури", ru: "2-4 процедуры", en: "2-4 treatments" },
  equipment: [EQ_ACUPULSE, EQ_M22],
  related: ["laser-peel", "laser-resurfacing", "hydrafacial"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Чому пори стають помітними", ru: "Почему поры становятся заметными", en: "Why Pores Become Visible" },
      body: {
        uk: "Пора — це вихід сально-волосяного фолікула. Її діаметр закладений генетично, але видимість залежить від трьох факторів: кількості себуму, щільності колагену навколо гирла та ступеня зроговіння.\n\nКоли шкіра втрачає колагенову підтримку, стінки пори перестають триматися й гирло розкривається ширше. Надлишок себуму та злущені клітини заповнюють його, окислюються — і пора стає ще помітнішою.\n\nЛазерне звуження пор діє на першопричину. Фракційний прогрів дерми навколо гирла стимулює синтез колагену: тканина ущільнюється й механічно стягує стінки пори. Одночасно зменшується активність сальних залоз, тому ефект тримається довше, ніж після поверхневих чисток.\n\n**Що дає курс процедур:**\n- Видимий діаметр пор зменшується, Т-зона виглядає рівнішою\n- Шкіра стає щільнішою, зменшується жирний блиск\n- Скорочується кількість закритих комедонів\n- Тон вирівнюється, макіяж лягає рівніше",
        ru: "Пора — это выход сально-волосяного фолликула. Её диаметр заложен генетически, но видимость зависит от трёх факторов: количества себума, плотности коллагена вокруг устья и степени ороговения.\n\nКогда кожа теряет коллагеновую поддержку, стенки поры перестают держаться и устье раскрывается шире. Избыток себума и отшелушенные клетки заполняют его, окисляются — и пора становится ещё заметнее.\n\nЛазерное сужение пор действует на первопричину. Фракционный прогрев дермы вокруг устья стимулирует синтез коллагена: ткань уплотняется и механически стягивает стенки поры. Одновременно уменьшается активность сальных желёз, поэтому эффект держится дольше, чем после поверхностных чисток.\n\n**Что даёт курс процедур:**\n- Видимый диаметр пор уменьшается, Т-зона выглядит ровнее\n- Кожа становится плотнее, уменьшается жирный блеск\n- Сокращается количество закрытых комедонов\n- Тон выравнивается, макияж ложится ровнее",
        en: "A pore is the opening of a sebaceous hair follicle. Its diameter is set genetically, but how visible it is depends on three things: the amount of sebum, the density of collagen around the opening, and the degree of keratinisation.\n\nWhen the skin loses collagen support, the walls of the pore stop holding their shape and the opening widens. Excess sebum and shed cells fill it and oxidise, making the pore more noticeable still.\n\nLaser pore tightening addresses the underlying cause. Fractional heating of the dermis around the opening stimulates collagen synthesis: the tissue becomes denser and mechanically draws the pore walls together. Sebaceous activity decreases at the same time, so the effect outlasts that of superficial cleansing treatments.\n\n**What a course delivers:**\n- The visible diameter of pores decreases and the T-zone looks smoother\n- Skin becomes denser and oily shine is reduced\n- Fewer closed comedones form\n- Tone evens out and make-up sits better",
      },
      calloutBody: {
        uk: "Звузити пору назавжди неможливо — її розмір визначено генетично. Реалістична мета — зменшити видимий діаметр і підтримувати результат повторним сеансом раз на 8-12 місяців.",
        ru: "Сузить пору навсегда невозможно — её размер определён генетически. Реалистичная цель — уменьшить видимый диаметр и поддерживать результат повторным сеансом раз в 8-12 месяцев.",
        en: "A pore cannot be narrowed permanently — its size is genetically determined. The realistic goal is to reduce the visible diameter and maintain that with a repeat session every 8-12 months.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лазерного звуження пор", ru: "Показания к лазерному сужению пор", en: "Indications for Laser Pore Tightening" },
      indications: [
        { uk: "Розширені пори в Т-зоні: чоло, ніс, підборіддя", ru: "Расширенные поры в Т-зоне: лоб, нос, подбородок", en: "Enlarged pores in the T-zone: forehead, nose, chin" },
        { uk: "Жирна та комбінована шкіра з вираженим блиском", ru: "Жирная и комбинированная кожа с выраженным блеском", en: "Oily and combination skin with noticeable shine" },
        { uk: "Нерівна текстура шкіри, ефект «апельсинової кірки» на обличчі", ru: "Неровная текстура кожи, эффект «апельсиновой корки» на лице", en: "Uneven skin texture, an orange-peel look on the face" },
        { uk: "Закриті комедони, що повертаються після чисток", ru: "Закрытые комедоны, возвращающиеся после чисток", en: "Closed comedones that keep returning after cleansing treatments" },
        { uk: "Втрата щільності шкіри після 30 років", ru: "Потеря плотности кожи после 30 лет", en: "Loss of skin density after the age of 30" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Активне запальне акне у стадії загострення", ru: "Активное воспалительное акне в стадии обострения", en: "Active inflammatory acne in a flare" },
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Герпес у стадії загострення", ru: "Герпес в стадии обострения", en: "A herpes flare-up" },
        { uk: "Свіжа засмага та фотосенсибілізувальна терапія", ru: "Свежий загар и фотосенсибилизирующая терапия", en: "A fresh tan or photosensitising medication" },
        { uk: "Прийом ізотретиноїну протягом останніх 6 місяців", ru: "Приём изотретиноина в течение последних 6 месяцев", en: "Isotretinoin taken within the last 6 months" },
        { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "A tendency to form keloid scars" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура", ru: "Как проходит процедура", en: "How the Procedure Works" },
      steps: [
        { title: { uk: "Діагностика шкіри", ru: "Диагностика кожи", en: "Skin assessment" }, description: { uk: "Лікар оцінює тип шкіри, активність сальних залоз і ступінь розширення пор, обирає режим впливу.", ru: "Врач оценивает тип кожи, активность сальных желёз и степень расширения пор, выбирает режим воздействия.", en: "The doctor assesses skin type, sebaceous activity, and how enlarged the pores are, then selects the treatment mode." } },
        { title: { uk: "Очищення та анестезія", ru: "Очищение и анестезия", en: "Cleansing and anaesthesia" }, description: { uk: "Шкіру очищують від макіяжу та себуму, наносять анестетик на 20-30 хвилин.", ru: "Кожу очищают от макияжа и себума, наносят анестетик на 20-30 минут.", en: "The skin is cleansed of make-up and sebum, and anaesthetic cream is applied for 20-30 minutes." } },
        { title: { uk: "Делікатна фракційна обробка", ru: "Деликатная фракционная обработка", en: "Gentle fractional pass" }, description: { uk: "Лікар працює в поверхневому режимі — саме він потрібен для пор. Обробка обличчя триває 15-20 хвилин.", ru: "Врач работает в поверхностном режиме — именно он нужен для пор. Обработка лица длится 15-20 минут.", en: "The doctor works in a superficial mode, which is what pores require. Treating the face takes 15-20 minutes." } },
        { title: { uk: "Заспокійлива маска", ru: "Успокаивающая маска", en: "Soothing mask" }, description: { uk: "Після обробки наносять охолоджувальну маску та засіб із SPF — виходити на сонце без захисту не можна.", ru: "После обработки наносят охлаждающую маску и средство с SPF — выходить на солнце без защиты нельзя.", en: "A cooling mask and an SPF product are applied afterwards — going out unprotected is not an option." } },
        { title: { uk: "Повторний сеанс через 4-6 тижнів", ru: "Повторный сеанс через 4-6 недель", en: "Repeat session in 4-6 weeks" }, description: { uk: "Пори скорочуються поступово. Оптимальний курс — 2-4 процедури, далі підтримка раз на 8-12 місяців.", ru: "Поры сокращаются постепенно. Оптимальный курс — 2-4 процедуры, далее поддержка раз в 8-12 месяцев.", en: "Pores reduce gradually. The optimal course is 2-4 treatments, then maintenance every 8-12 months." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги лазерного звуження пор", ru: "Преимущества лазерного сужения пор", en: "Benefits of Laser Pore Tightening" },
      items: [
        { uk: "Працює з причиною — щільністю дерми навколо пори, а не з її вмістом", ru: "Работает с причиной — плотностью дермы вокруг поры, а не с её содержимым", en: "Works on the cause — dermal density around the pore — not just its contents" },
        { uk: "Ефект тримається місяцями, на відміну від механічної чистки", ru: "Эффект держится месяцами, в отличие от механической чистки", en: "The effect lasts for months, unlike a mechanical cleanse" },
        { uk: "Поверхневий режим означає коротке відновлення — 2-3 дні", ru: "Поверхностный режим означает короткое восстановление — 2-3 дня", en: "The superficial mode means short recovery — 2-3 days" },
        { uk: "Паралельно вирівнюється тон і зменшується жирний блиск", ru: "Параллельно выравнивается тон и уменьшается жирный блеск", en: "Tone evens out and oily shine decreases at the same time" },
        { uk: "Поєднується з доглядовими протоколами для підтримки результату", ru: "Сочетается с уходовыми протоколами для поддержания результата", en: "Combines with skincare protocols to maintain the result" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи можна звузити пори назавжди?", ru: "Можно ли сузить поры навсегда?", en: "Can pores be tightened permanently?" },
      answer: { uk: "Ні. Діаметр пори закладений генетично, і жодна методика його не змінює назавжди. Лазер зменшує видимий діаметр за рахунок ущільнення тканини навколо гирла — цей ефект тримається 8-12 місяців. Далі результат підтримують повторним сеансом і домашнім доглядом із ретиноїдами або кислотами.", ru: "Нет. Диаметр поры заложен генетически, и ни одна методика не меняет его навсегда. Лазер уменьшает видимый диаметр за счёт уплотнения ткани вокруг устья — этот эффект держится 8-12 месяцев. Далее результат поддерживают повторным сеансом и домашним уходом с ретиноидами или кислотами.", en: "No. Pore diameter is genetically determined and no method changes it for good. The laser reduces the visible diameter by firming the tissue around the opening, and that effect lasts 8-12 months. After that the result is maintained with a repeat session and home care using retinoids or acids." },
    },
    {
      question: { uk: "Чим лазер кращий за механічну чистку?", ru: "Чем лазер лучше механической чистки?", en: "How is the laser better than a mechanical cleanse?" },
      answer: { uk: "Чистка прибирає вміст пори, але не змінює її стінки — через 2-3 тижні пора виглядає так само. Лазер працює глибше: стимулює колаген у дермі, тому стінки пори підтягуються, а видимий діаметр зменшується на місяці. Оптимально ці методи поєднувати: чистка готує шкіру, лазер закріплює результат.", ru: "Чистка убирает содержимое поры, но не меняет её стенки — через 2-3 недели пора выглядит так же. Лазер работает глубже: стимулирует коллаген в дерме, поэтому стенки поры подтягиваются, а видимый диаметр уменьшается на месяцы. Оптимально эти методы сочетать: чистка готовит кожу, лазер закрепляет результат.", en: "A cleanse clears the contents of the pore but does not change its walls — in 2-3 weeks the pore looks the same. The laser works deeper: it stimulates collagen in the dermis, so the pore walls firm up and the visible diameter stays reduced for months. Ideally the two are combined: the cleanse prepares the skin, the laser consolidates the result." },
    },
    {
      question: { uk: "Чи підходить процедура для жирної шкіри з акне?", ru: "Подходит ли процедура для жирной кожи с акне?", en: "Is the procedure suitable for oily, acne-prone skin?" },
      answer: { uk: "Для жирної шкіри — так, це одне з основних показань. Але за активного запального акне процедуру відкладають: спочатку лікар знімає запалення, і лише потім працює з порами. Приходьте на консультацію — лікар складе послідовність кроків саме для вашого стану шкіри.", ru: "Для жирной кожи — да, это одно из основных показаний. Но при активном воспалительном акне процедуру откладывают: сначала врач снимает воспаление, и только потом работает с порами. Приходите на консультацию — врач составит последовательность шагов именно для вашего состояния кожи.", en: "For oily skin, yes — it is one of the main indications. With active inflammatory acne, however, the procedure is postponed: the doctor settles the inflammation first and only then works on the pores. Come for a consultation and the doctor will map out the right sequence for your skin." },
    },
  ],
},

// ─── 4. ВІДБІЛЮВАННЯ ІНТИМНИХ ЗОН ───────────────────────────────────────────
{
  slug: "intimate-whitening",
  category: "intimate-rejuvenation",
  doctors: GYNAECOLOGISTS,
  reviewer: "kroshka-iryna",
  title: { uk: "Відбілювання інтимних зон", ru: "Отбеливание интимных зон", en: "Intimate Area Whitening" },
  h1: { uk: "Відбілювання інтимних зон в Дніпрі", ru: "Отбеливание интимных зон в Днепре", en: "Intimate area whitening in Dnipro" },
  summary: {
    uk: "Відбілювання інтимних зон у GENEVITY — лазерне освітлення пігментації в зоні бікіні, паху та внутрішньої поверхні стегон на CO₂-лазері AcuPulse. Вирівнює тон, зменшує гіперкератоз і повертає шкірі гладкість. Процедуру проводить лікар-гінеколог, Дніпро.",
    ru: "Отбеливание интимных зон в GENEVITY — лазерное осветление пигментации в зоне бикини, паха и внутренней поверхности бёдер на CO₂-лазере AcuPulse. Выравнивает тон, уменьшает гиперкератоз и возвращает коже гладкость. Процедуру проводит врач-гинеколог, Днепр.",
    en: "Intimate area whitening at GENEVITY lightens pigmentation in the bikini line, groin, and inner thighs with the AcuPulse CO₂ laser. It evens out tone, reduces hyperkeratosis, and restores smoothness. The procedure is performed by a gynaecologist, Dnipro.",
  },
  procedureLength: { uk: "30-40 хвилин", ru: "30-40 минут", en: "30-40 minutes" },
  effectDuration: { uk: "12-18 місяців", ru: "12-18 месяцев", en: "12-18 months" },
  sessionsRecommended: { uk: "2-4 процедури", ru: "2-4 процедуры", en: "2-4 treatments" },
  equipment: [EQ_ACUPULSE],
  related: ["acupulse-co2-intimate", "monopolar-rf-lifting", "laser-bikini"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Звідки береться пігментація в інтимній зоні", ru: "Откуда берётся пигментация в интимной зоне", en: "Where Intimate Pigmentation Comes From" },
      body: {
        uk: "Шкіра паху та зони бікіні темніє з кількох причин. Найчастіша — постійне механічне тертя: білизна, одяг, гоління. У відповідь на подразнення меланоцити виробляють більше пігменту, а роговий шар потовщується.\n\nДодають внесок гормональні зміни (вагітність, оральні контрацептиви), надлишкова вага, а також постзапальна гіперпігментація після вростання волосся чи подразнення від депіляції.\n\nВідбілювання інтимних зон у GENEVITY виконують на CO₂-лазері AcuPulse у делікатному фракційному режимі. Промінь знімає потовщений роговий шар разом із надлишком пігменту та стимулює оновлення епідермісу. Шкіра світлішає поступово — протягом 3-4 тижнів після кожного сеансу.\n\n**З чим працює процедура:**\n- Гіперпігментація зони бікіні, паху, внутрішньої поверхні стегон\n- Потемніння після вростання волосся та подразнення від гоління\n- Гіперкератоз — шорсткість і потовщення шкіри\n- Нерівний тон після тривалого носіння тісної білизни",
        ru: "Кожа паха и зоны бикини темнеет по нескольким причинам. Самая частая — постоянное механическое трение: бельё, одежда, бритьё. В ответ на раздражение меланоциты вырабатывают больше пигмента, а роговой слой утолщается.\n\nДобавляют вклад гормональные изменения (беременность, оральные контрацептивы), избыточный вес, а также поствоспалительная гиперпигментация после врастания волос или раздражения от депиляции.\n\nОтбеливание интимных зон в GENEVITY выполняют на CO₂-лазере AcuPulse в деликатном фракционном режиме. Луч снимает утолщённый роговой слой вместе с избытком пигмента и стимулирует обновление эпидермиса. Кожа светлеет постепенно — в течение 3-4 недель после каждого сеанса.\n\n**С чем работает процедура:**\n- Гиперпигментация зоны бикини, паха, внутренней поверхности бёдер\n- Потемнение после врастания волос и раздражения от бритья\n- Гиперкератоз — шероховатость и утолщение кожи\n- Неровный тон после длительного ношения тесного белья",
        en: "The skin of the groin and bikini line darkens for several reasons. The most common is constant friction: underwear, clothing, shaving. In response to that irritation melanocytes produce more pigment and the horny layer thickens.\n\nHormonal changes (pregnancy, oral contraceptives), excess weight, and post-inflammatory hyperpigmentation after ingrown hairs or shaving irritation all add to it.\n\nAt GENEVITY intimate whitening is performed with the AcuPulse CO₂ laser in a gentle fractional mode. The beam removes the thickened horny layer together with excess pigment and stimulates renewal of the epidermis. The skin lightens gradually, over 3-4 weeks after each session.\n\n**What the procedure addresses:**\n- Hyperpigmentation of the bikini line, groin, and inner thighs\n- Darkening after ingrown hairs and shaving irritation\n- Hyperkeratosis — roughness and thickening of the skin\n- Uneven tone after prolonged wear of tight underwear",
      },
      calloutBody: {
        uk: "Процедуру проводить лікар-гінеколог у окремому кабінеті з дотриманням повної конфіденційності. Перед курсом обов'язковий огляд: пігментація іноді має медичну причину, яку потрібно виключити.",
        ru: "Процедуру проводит врач-гинеколог в отдельном кабинете с соблюдением полной конфиденциальности. Перед курсом обязателен осмотр: пигментация иногда имеет медицинскую причину, которую нужно исключить.",
        en: "The procedure is performed by a gynaecologist in a private room with full confidentiality. An examination before the course is required: pigmentation sometimes has a medical cause that must be ruled out.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до відбілювання інтимних зон", ru: "Показания к отбеливанию интимных зон", en: "Indications for Intimate Whitening" },
      indications: [
        { uk: "Гіперпігментація зони бікіні та паху", ru: "Гиперпигментация зоны бикини и паха", en: "Hyperpigmentation of the bikini line and groin" },
        { uk: "Потемніння внутрішньої поверхні стегон", ru: "Потемнение внутренней поверхности бёдер", en: "Darkening of the inner thighs" },
        { uk: "Постзапальна пігментація після вростання волосся", ru: "Поствоспалительная пигментация после врастания волос", en: "Post-inflammatory pigmentation after ingrown hairs" },
        { uk: "Гіперкератоз і шорсткість шкіри в інтимній зоні", ru: "Гиперкератоз и шероховатость кожи в интимной зоне", en: "Hyperkeratosis and rough skin in the intimate area" },
        { uk: "Нерівний тон шкіри після вагітності або зміни ваги", ru: "Неровный тон кожи после беременности или изменения веса", en: "Uneven skin tone after pregnancy or weight change" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Гострі запальні захворювання сечостатевої системи", ru: "Острые воспалительные заболевания мочеполовой системы", en: "Acute inflammatory conditions of the urogenital system" },
        { uk: "Активні інфекції, зокрема герпетична, у зоні обробки", ru: "Активные инфекции, в том числе герпетическая, в зоне обработки", en: "Active infections, including herpes, in the treatment area" },
        { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "A tendency to form keloid scars" },
        { uk: "Онкологічні захворювання, декомпенсований цукровий діабет", ru: "Онкологические заболевания, декомпенсированный сахарный диабет", en: "Oncological disease, uncontrolled diabetes" },
        { uk: "Свіжа депіляція або подразнення шкіри в зоні обробки", ru: "Свежая депиляция или раздражение кожи в зоне обработки", en: "Recent hair removal or skin irritation in the treatment area" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура", ru: "Как проходит процедура", en: "How the Procedure Works" },
      steps: [
        { title: { uk: "Консультація гінеколога", ru: "Консультация гинеколога", en: "Gynaecologist consultation" }, description: { uk: "Лікар оглядає зону, виключає медичні причини пігментації та підбирає режим і кількість сеансів.", ru: "Врач осматривает зону, исключает медицинские причины пигментации и подбирает режим и количество сеансов.", en: "The doctor examines the area, rules out medical causes of the pigmentation, and selects the mode and number of sessions." } },
        { title: { uk: "Підготовка та анестезія", ru: "Подготовка и анестезия", en: "Preparation and anaesthesia" }, description: { uk: "Зону очищують і наносять анестетик на 30 хвилин — шкіра тут тонка й чутлива.", ru: "Зону очищают и наносят анестетик на 30 минут — кожа здесь тонкая и чувствительная.", en: "The area is cleansed and anaesthetic cream is applied for 30 minutes — the skin here is thin and sensitive." } },
        { title: { uk: "Лазерна обробка", ru: "Лазерная обработка", en: "Laser pass" }, description: { uk: "Лікар працює делікатним фракційним режимом. Сама обробка триває 10-15 хвилин.", ru: "Врач работает деликатным фракционным режимом. Сама обработка длится 10-15 минут.", en: "The doctor works in a gentle fractional mode. The pass itself takes 10-15 minutes." } },
        { title: { uk: "Заспокійливий догляд", ru: "Успокаивающий уход", en: "Soothing aftercare" }, description: { uk: "Наносять відновлювальний засіб і дають рекомендації: 5-7 днів без басейну, сауни та тісної білизни.", ru: "Наносят восстанавливающее средство и дают рекомендации: 5-7 дней без бассейна, сауны и тесного белья.", en: "A repair product is applied and you receive instructions: 5-7 days without pools, saunas, or tight underwear." } },
        { title: { uk: "Повторний сеанс через 4-6 тижнів", ru: "Повторный сеанс через 4-6 недель", en: "Repeat session in 4-6 weeks" }, description: { uk: "Тон вирівнюється поступово. Зазвичай потрібно 2-4 процедури, далі підтримка раз на рік.", ru: "Тон выравнивается постепенно. Обычно нужно 2-4 процедуры, далее поддержка раз в год.", en: "Tone evens out gradually. Usually 2-4 treatments are needed, then maintenance once a year." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги процедури в GENEVITY", ru: "Преимущества процедуры в GENEVITY", en: "Benefits of the Procedure at GENEVITY" },
      items: [
        { uk: "Процедуру виконує лікар-гінеколог, а не косметолог", ru: "Процедуру выполняет врач-гинеколог, а не косметолог", en: "The procedure is performed by a gynaecologist, not a beautician" },
        { uk: "Делікатний фракційний режим CO₂-лазера для тонкої шкіри інтимної зони", ru: "Деликатный фракционный режим CO₂-лазера для тонкой кожи интимной зоны", en: "A gentle fractional CO₂ mode suited to the thin skin of the intimate area" },
        { uk: "Одночасно вирівнюється тон і зменшується гіперкератоз", ru: "Одновременно выравнивается тон и уменьшается гиперкератоз", en: "Tone evens out and hyperkeratosis reduces at the same time" },
        { uk: "Огляд перед курсом виключає медичні причини пігментації", ru: "Осмотр перед курсом исключает медицинские причины пигментации", en: "The examination before the course rules out medical causes of pigmentation" },
        { uk: "Повна конфіденційність: окремий кабінет, лікар однієї статі за запитом", ru: "Полная конфиденциальность: отдельный кабинет, врач одного пола по запросу", en: "Full confidentiality: a private room and, on request, a doctor of the same gender" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Наскільки світлішою стане шкіра?", ru: "Насколько светлее станет кожа?", en: "How much lighter will the skin become?" },
      answer: { uk: "Мета процедури — не змінити природний тон, а прибрати надлишкову пігментацію, що з'явилася через тертя, гоління чи запалення. Зазвичай шкіра повертається до свого базового відтінку: різниця з навколишньою тканиною стає майже непомітною. Ступінь освітлення лікар прогнозує на консультації після огляду.", ru: "Цель процедуры — не изменить природный тон, а убрать избыточную пигментацию, появившуюся из-за трения, бритья или воспаления. Обычно кожа возвращается к своему базовому оттенку: разница с окружающей тканью становится почти незаметной. Степень осветления врач прогнозирует на консультации после осмотра.", en: "The goal is not to change your natural tone but to remove excess pigmentation caused by friction, shaving, or inflammation. The skin usually returns to its baseline shade, so the difference from the surrounding tissue becomes barely noticeable. The doctor predicts the degree of lightening at the consultation." },
    },
    {
      question: { uk: "Чи болісна процедура?", ru: "Болезненна ли процедура?", en: "Is the procedure painful?" },
      answer: { uk: "Шкіра інтимної зони чутливіша за шкіру обличчя, тому аплікаційну анестезію застосовують завжди — її наносять за 30 хвилин до початку. Під час обробки відчувається тепло та легке поколювання. Після процедури можливе відчуття, схоже на сонячний опік, воно минає за 1-2 дні.", ru: "Кожа интимной зоны чувствительнее кожи лица, поэтому аппликационную анестезию применяют всегда — её наносят за 30 минут до начала. Во время обработки ощущается тепло и лёгкое покалывание. После процедуры возможно ощущение, похожее на солнечный ожог, оно проходит за 1-2 дня.", en: "The skin of the intimate area is more sensitive than facial skin, so topical anaesthesia is always used and applied 30 minutes beforehand. During the pass you feel warmth and light tingling. Afterwards there may be a sunburn-like sensation that settles within 1-2 days." },
    },
    {
      question: { uk: "Коли можна повернутися до звичного режиму?", ru: "Когда можно вернуться к привычному режиму?", en: "When can I go back to my normal routine?" },
      answer: { uk: "До роботи та побутових справ — того ж дня. Протягом 5-7 днів варто відмовитися від басейну, сауни, інтенсивних тренувань, тісної білизни та статевих контактів. Депіляцію в зоні обробки відкладають щонайменше на 2 тижні. Точні терміни лікар називає після процедури.", ru: "К работе и бытовым делам — в тот же день. В течение 5-7 дней стоит отказаться от бассейна, сауны, интенсивных тренировок, тесного белья и половых контактов. Депиляцию в зоне обработки откладывают минимум на 2 недели. Точные сроки врач называет после процедуры.", en: "You can return to work and everyday activities the same day. For 5-7 days avoid pools, saunas, intense exercise, tight underwear, and sexual activity. Hair removal in the treated area is postponed for at least two weeks. The doctor confirms exact timings after the procedure." },
    },
  ],
},

// ─── 5. ІНТИМНА БІОРЕВІТАЛІЗАЦІЯ ────────────────────────────────────────────
{
  slug: "intimate-biorevitalisation",
  category: "injectable-cosmetology",
  doctors: GYNAECOLOGISTS,
  reviewer: "kroshka-iryna",
  title: { uk: "Інтимна біоревіталізація", ru: "Интимная биоревитализация", en: "Intimate Biorevitalisation" },
  h1: { uk: "Інтимна біоревіталізація в Дніпрі", ru: "Интимная биоревитализация в Днепре", en: "Intimate biorevitalization in Dnipro" },
  summary: {
    uk: "Інтимна біоревіталізація у GENEVITY — ін'єкції гіалуронової кислоти в тканини статевих органів. Відновлюють зволоженість слизової, повертають еластичність і знімають сухість та дискомфорт. Процедуру виконує лікар-гінеколог після огляду, Дніпро.",
    ru: "Интимная биоревитализация в GENEVITY — инъекции гиалуроновой кислоты в ткани половых органов. Восстанавливают увлажнённость слизистой, возвращают эластичность и снимают сухость и дискомфорт. Процедуру выполняет врач-гинеколог после осмотра, Днепр.",
    en: "Intimate biorevitalisation at GENEVITY involves injections of hyaluronic acid into the tissues of the genital area. They restore mucosal hydration, return elasticity, and relieve dryness and discomfort. The procedure is performed by a gynaecologist after an examination, Dnipro.",
  },
  procedureLength: { uk: "30-40 хвилин", ru: "30-40 минут", en: "30-40 minutes" },
  effectDuration: { uk: "6-12 місяців", ru: "6-12 месяцев", en: "6-12 months" },
  sessionsRecommended: { uk: "1-3 процедури", ru: "1-3 процедуры", en: "1-3 treatments" },
  equipment: [],
  related: ["intimate-zone-biorevitalisation", "biorevitalisation", "acupulse-co2-intimate"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Що таке інтимна біоревіталізація", ru: "Что такое интимная биоревитализация", en: "What Intimate Biorevitalisation Is" },
      body: {
        uk: "Слизова та шкіра статевих органів залежать від естрогену. Коли його рівень падає — у менопаузі, після пологів, під час грудного вигодовування чи на тлі гормональної терапії — тканини втрачають вологу, стоншуються й гірше відновлюються після мікротравм.\n\nІнтимна біоревіталізація повертає тканинам гіалуронову кислоту — молекулу, яка утримує воду. Препарат вводять мікроін'єкціями у власну пластинку слизової та підслизовий шар. Гіалуронова кислота зв'язує рідину, а її поступове розщеплення стимулює фібробласти виробляти власний колаген.\n\nПроцедуру в GENEVITY виконує лікар-гінеколог: він оцінює стан тканин, виключає інфекційний процес і підбирає щільність препарату.\n\n**Які скарги знімає процедура:**\n- Сухість, печіння та відчуття стягнутості\n- Дискомфорт і біль під час статевого акту\n- Підвищену чутливість слизової до білизни й гігієнічних засобів\n- Часті мікротріщини та повільне загоєння",
        ru: "Слизистая и кожа половых органов зависят от эстрогена. Когда его уровень падает — в менопаузе, после родов, во время грудного вскармливания или на фоне гормональной терапии — ткани теряют влагу, истончаются и хуже восстанавливаются после микротравм.\n\nИнтимная биоревитализация возвращает тканям гиалуроновую кислоту — молекулу, которая удерживает воду. Препарат вводят микроинъекциями в собственную пластинку слизистой и подслизистый слой. Гиалуроновая кислота связывает жидкость, а её постепенное расщепление стимулирует фибробласты вырабатывать собственный коллаген.\n\nПроцедуру в GENEVITY выполняет врач-гинеколог: он оценивает состояние тканей, исключает инфекционный процесс и подбирает плотность препарата.\n\n**Какие жалобы снимает процедура:**\n- Сухость, жжение и ощущение стянутости\n- Дискомфорт и боль во время полового акта\n- Повышенную чувствительность слизистой к белью и гигиеническим средствам\n- Частые микротрещины и медленное заживление",
        en: "The mucosa and skin of the genital area depend on oestrogen. When its level falls — in menopause, after childbirth, during breastfeeding, or under hormone therapy — the tissues lose moisture, thin out, and recover more slowly from microtrauma.\n\nIntimate biorevitalisation returns hyaluronic acid to the tissue — the molecule that holds water. The product is delivered by microinjections into the lamina propria and submucosal layer. Hyaluronic acid binds fluid, and as it gradually breaks down it prompts fibroblasts to produce collagen of their own.\n\nAt GENEVITY the procedure is performed by a gynaecologist, who assesses the tissue, rules out infection, and selects the density of the product.\n\n**Which complaints the procedure addresses:**\n- Dryness, burning, and a feeling of tightness\n- Discomfort or pain during intercourse\n- Heightened sensitivity of the mucosa to underwear and hygiene products\n- Frequent microtears and slow healing",
      },
      calloutBody: {
        uk: "Біоревіталізація не замінює гормональну терапію, якщо сухість спричинена дефіцитом естрогену. Вона знімає симптом, а причину лікар оцінює окремо — за потреби разом з ендокринологом.",
        ru: "Биоревитализация не заменяет гормональную терапию, если сухость вызвана дефицитом эстрогена. Она снимает симптом, а причину врач оценивает отдельно — при необходимости вместе с эндокринологом.",
        en: "Biorevitalisation does not replace hormone therapy when dryness is caused by oestrogen deficiency. It relieves the symptom, while the cause is assessed separately — with an endocrinologist if needed.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до інтимної біоревіталізації", ru: "Показания к интимной биоревитализации", en: "Indications for Intimate Biorevitalisation" },
      indications: [
        { uk: "Сухість слизової в менопаузі та перименопаузі", ru: "Сухость слизистой в менопаузе и перименопаузе", en: "Mucosal dryness in menopause and perimenopause" },
        { uk: "Дискомфорт під час статевого акту", ru: "Дискомфорт во время полового акта", en: "Discomfort during intercourse" },
        { uk: "Відновлення тканин після пологів", ru: "Восстановление тканей после родов", en: "Tissue recovery after childbirth" },
        { uk: "Сухість на тлі лактації або гормональної терапії", ru: "Сухость на фоне лактации или гормональной терапии", en: "Dryness related to breastfeeding or hormone therapy" },
        { uk: "Підвищена чутливість і схильність до мікротріщин", ru: "Повышенная чувствительность и склонность к микротрещинам", en: "Increased sensitivity and a tendency to microtears" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Гострі запальні захворювання сечостатевої системи", ru: "Острые воспалительные заболевания мочеполовой системы", en: "Acute inflammatory conditions of the urogenital system" },
        { uk: "Інфекції, що передаються статевим шляхом, у активній фазі", ru: "Инфекции, передающиеся половым путём, в активной фазе", en: "Sexually transmitted infections in an active phase" },
        { uk: "Порушення згортання крові та прийом антикоагулянтів", ru: "Нарушения свёртывания крови и приём антикоагулянтов", en: "Coagulation disorders or anticoagulant therapy" },
        { uk: "Алергія на препарати гіалуронової кислоти", ru: "Аллергия на препараты гиалуроновой кислоты", en: "Allergy to hyaluronic acid products" },
        { uk: "Онкологічні захворювання, декомпенсований цукровий діабет", ru: "Онкологические заболевания, декомпенсированный сахарный диабет", en: "Oncological disease, uncontrolled diabetes" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить інтимна біоревіталізація", ru: "Как проходит интимная биоревитализация", en: "How Intimate Biorevitalisation Works" },
      steps: [
        { title: { uk: "Гінекологічний огляд", ru: "Гинекологический осмотр", en: "Gynaecological examination" }, description: { uk: "Лікар оцінює стан слизової, за потреби призначає мазок, щоб виключити запальний процес.", ru: "Врач оценивает состояние слизистой, при необходимости назначает мазок, чтобы исключить воспалительный процесс.", en: "The doctor assesses the mucosa and, if needed, orders a swab to rule out inflammation." } },
        { title: { uk: "Вибір препарату", ru: "Выбор препарата", en: "Choosing the product" }, description: { uk: "Щільність гіалуронової кислоти підбирають за станом тканин — від легкої зволожувальної до щільнішої.", ru: "Плотность гиалуроновой кислоты подбирают по состоянию тканей — от лёгкой увлажняющей до более плотной.", en: "The density of the hyaluronic acid is matched to the tissue — from a light hydrating formula to a firmer one." } },
        { title: { uk: "Аплікаційна анестезія", ru: "Аппликационная анестезия", en: "Topical anaesthesia" }, description: { uk: "На зону наносять анестетик на 20-30 хвилин, тому ін'єкції відчуваються як легкий тиск.", ru: "На зону наносят анестетик на 20-30 минут, поэтому инъекции ощущаются как лёгкое давление.", en: "Anaesthetic is applied for 20-30 minutes, so the injections feel like light pressure." } },
        { title: { uk: "Мікроін'єкції", ru: "Микроинъекции", en: "Microinjections" }, description: { uk: "Лікар вводить препарат тонкою голкою за визначеною схемою. Сама процедура триває 10-15 хвилин.", ru: "Врач вводит препарат тонкой иглой по определённой схеме. Сама процедура длится 10-15 минут.", en: "The doctor injects the product with a fine needle following a set pattern. The procedure itself takes 10-15 minutes." } },
        { title: { uk: "Рекомендації та контроль", ru: "Рекомендации и контроль", en: "Aftercare and follow-up" }, description: { uk: "5-7 днів без басейну, сауни та статевих контактів. Контрольний огляд — через 3-4 тижні.", ru: "5-7 дней без бассейна, сауны и половых контактов. Контрольный осмотр — через 3-4 недели.", en: "No pools, saunas, or sexual activity for 5-7 days. A follow-up is scheduled in 3-4 weeks." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги процедури в GENEVITY", ru: "Преимущества процедуры в GENEVITY", en: "Benefits of the Procedure at GENEVITY" },
      items: [
        { uk: "Процедуру виконує лікар-гінеколог вищої категорії", ru: "Процедуру выполняет врач-гинеколог высшей категории", en: "The procedure is performed by a senior gynaecologist" },
        { uk: "Перед курсом обов'язковий огляд і виключення запального процесу", ru: "Перед курсом обязателен осмотр и исключение воспалительного процесса", en: "An examination to exclude inflammation is required before the course" },
        { uk: "Ефект відчутний уже після першої процедури, повний — через 3-4 тижні", ru: "Эффект ощутим уже после первой процедуры, полный — через 3-4 недели", en: "The effect is noticeable after the first treatment and complete in 3-4 weeks" },
        { uk: "Без періоду відновлення: до звичного режиму — того ж дня", ru: "Без периода восстановления: к привычному режиму — в тот же день", en: "No downtime: back to your usual routine the same day" },
        { uk: "За потреби лікар скеровує до ендокринолога, щоб оцінити гормональну причину", ru: "При необходимости врач направляет к эндокринологу, чтобы оценить гормональную причину", en: "If needed the doctor refers you to an endocrinologist to assess a hormonal cause" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи болісна процедура?", ru: "Болезненна ли процедура?", en: "Is the procedure painful?" },
      answer: { uk: "Аплікаційну анестезію застосовують завжди — її наносять за 20-30 хвилин до початку. Після цього ін'єкції відчуваються як легкий тиск або поколювання. Більшість пацієнток описують відчуття як цілком терпимі. Після процедури можливий незначний набряк, що минає за 1-2 дні.", ru: "Аппликационную анестезию применяют всегда — её наносят за 20-30 минут до начала. После этого инъекции ощущаются как лёгкое давление или покалывание. Большинство пациенток описывают ощущения как вполне терпимые. После процедуры возможен незначительный отёк, который проходит за 1-2 дня.", en: "Topical anaesthesia is always used, applied 20-30 minutes beforehand. After that the injections feel like light pressure or tingling. Most patients describe the sensation as easily tolerable. Mild swelling afterwards settles within 1-2 days." },
    },
    {
      question: { uk: "Скільки тримається результат?", ru: "Сколько держится результат?", en: "How long does the result last?" },
      answer: { uk: "Від 6 до 12 місяців — залежно від щільності препарату, віку та гормонального фону. У менопаузі гіалуронова кислота розщеплюється швидше, тому підтримувальну процедуру планують раз на 6-8 місяців. Якщо сухість спричинена дефіцитом естрогену, лікар паралельно оцінює потребу в системній терапії.", ru: "От 6 до 12 месяцев — в зависимости от плотности препарата, возраста и гормонального фона. В менопаузе гиалуроновая кислота расщепляется быстрее, поэтому поддерживающую процедуру планируют раз в 6-8 месяцев. Если сухость вызвана дефицитом эстрогена, врач параллельно оценивает потребность в системной терапии.", en: "From 6 to 12 months, depending on the density of the product, your age, and hormonal status. In menopause hyaluronic acid breaks down faster, so a maintenance treatment is planned every 6-8 months. If dryness stems from oestrogen deficiency, the doctor also assesses whether systemic therapy is needed." },
    },
    {
      question: { uk: "Чи можна робити процедуру після пологів?", ru: "Можно ли делать процедуру после родов?", en: "Can the procedure be done after childbirth?" },
      answer: { uk: "Так, але після завершення лактації та відновлення менструального циклу — зазвичай це 6-8 місяців після пологів. Під час годування грудьми процедуру не проводять. Точний термін лікар визначає на огляді, враховуючи стан тканин і спосіб розродження.", ru: "Да, но после завершения лактации и восстановления менструального цикла — обычно это 6-8 месяцев после родов. Во время грудного вскармливания процедуру не проводят. Точный срок врач определяет на осмотре, учитывая состояние тканей и способ родоразрешения.", en: "Yes, but after breastfeeding has ended and the menstrual cycle has returned — usually 6-8 months after birth. It is not performed while breastfeeding. The doctor sets the exact timing at the examination, taking the tissue condition and mode of delivery into account." },
    },
  ],
},

// ─── 6. БІОРЕВІТАЛІЗАЦІЯ ГУБ ────────────────────────────────────────────────
{
  slug: "lip-biorevitalisation",
  category: "injectable-cosmetology",
  doctors: COSMETOLOGISTS,
  reviewer: "beliyanushkin-viktor",
  title: { uk: "Біоревіталізація губ", ru: "Биоревитализация губ", en: "Lip Biorevitalisation" },
  h1: { uk: "Біоревіталізація губ в Дніпрі", ru: "Биоревитализация губ в Днепре", en: "Lip biorevitalization in Dnipro" },
  summary: {
    uk: "Біоревіталізація губ у GENEVITY — ін'єкції нестабілізованої гіалуронової кислоти для зволоження без збільшення об'єму. Прибирає сухість і дрібні зморшки, повертає губам колір і гладкість. Форма губ залишається вашою, Дніпро.",
    ru: "Биоревитализация губ в GENEVITY — инъекции нестабилизированной гиалуроновой кислоты для увлажнения без увеличения объёма. Убирает сухость и мелкие морщины, возвращает губам цвет и гладкость. Форма губ остаётся вашей, Днепр.",
    en: "Lip biorevitalisation at GENEVITY uses injections of non-stabilised hyaluronic acid to hydrate without adding volume. It clears dryness and fine lines and restores colour and smoothness. The shape of your lips stays your own, Dnipro.",
  },
  procedureLength: { uk: "20-30 хвилин", ru: "20-30 минут", en: "20-30 minutes" },
  effectDuration: { uk: "4-6 місяців", ru: "4-6 месяцев", en: "4-6 months" },
  sessionsRecommended: { uk: "2-3 процедури", ru: "2-3 процедуры", en: "2-3 treatments" },
  equipment: [],
  related: ["lip-augmentation", "biorevitalisation", "juvederm"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Чим біоревіталізація губ відрізняється від філерів", ru: "Чем биоревитализация губ отличается от филлеров", en: "How Lip Biorevitalisation Differs from Fillers" },
      body: {
        uk: "Це дві різні задачі. Філер — це щільний гель зі стабілізованої гіалуронової кислоти: він тримає форму й додає об'єм. Біоревіталізація губ використовує нестабілізовану гіалуронову кислоту, яка не формує об'єм, а насичує тканину вологою.\n\nЧервона облямівка губ позбавлена сальних залоз, тому вона першою реагує на зневоднення: з'являються лущення, вертикальні зморшки, тьмяність. Мікроін'єкції гіалуронової кислоти зв'язують воду в тканині й стимулюють фібробласти — губи стають гладкими, а колір яскравішає за рахунок кращої мікроциркуляції.\n\nУ GENEVITY процедуру виконують лікарі-косметологи. Препарат і глибину введення підбирають за станом тканин, а не за єдиним протоколом.\n\n**Що дає біоревіталізація губ:**\n- Зволоження: сухість і лущення зникають\n- Розгладження дрібних вертикальних зморшок (кисетних)\n- Природніший колір без пігменту та перманентного макіяжу\n- Кращу переносимість помади й блиску",
        ru: "Это две разные задачи. Филлер — это плотный гель из стабилизированной гиалуроновой кислоты: он держит форму и добавляет объём. Биоревитализация губ использует нестабилизированную гиалуроновую кислоту, которая не формирует объём, а насыщает ткань влагой.\n\nКрасная кайма губ лишена сальных желёз, поэтому она первой реагирует на обезвоживание: появляются шелушение, вертикальные морщины, тусклость. Микроинъекции гиалуроновой кислоты связывают воду в ткани и стимулируют фибробласты — губы становятся гладкими, а цвет ярче за счёт лучшей микроциркуляции.\n\nВ GENEVITY процедуру выполняют врачи-косметологи. Препарат и глубину введения подбирают по состоянию тканей, а не по единому протоколу.\n\n**Что даёт биоревитализация губ:**\n- Увлажнение: сухость и шелушение исчезают\n- Разглаживание мелких вертикальных морщин (кисетных)\n- Более естественный цвет без пигмента и перманентного макияжа\n- Лучшую переносимость помады и блеска",
        en: "These are two different jobs. A filler is a dense gel of stabilised hyaluronic acid: it holds shape and adds volume. Lip biorevitalisation uses non-stabilised hyaluronic acid, which does not create volume but saturates the tissue with moisture.\n\nThe vermilion border has no sebaceous glands, so it is the first area to show dehydration: flaking, vertical lines, dullness. Microinjections of hyaluronic acid bind water in the tissue and stimulate fibroblasts — the lips become smooth and the colour brightens thanks to better microcirculation.\n\nAt GENEVITY the procedure is performed by cosmetologists. The product and injection depth are matched to the tissue rather than applied by a single protocol.\n\n**What lip biorevitalisation delivers:**\n- Hydration: dryness and flaking disappear\n- Smoothing of fine vertical (smoker's) lines\n- A more natural colour without pigment or permanent make-up\n- Lipstick and gloss sit better",
      },
      calloutBody: {
        uk: "Якщо мета — змінити форму або додати об'єм, потрібен філер, а не біоревіталізація. На консультації лікар чесно скаже, яка методика відповідає вашому запиту, і за потреби запропонує поєднати обидві.",
        ru: "Если цель — изменить форму или добавить объём, нужен филлер, а не биоревитализация. На консультации врач честно скажет, какая методика отвечает вашему запросу, и при необходимости предложит совместить обе.",
        en: "If the goal is to change shape or add volume, a filler is the right tool, not biorevitalisation. At the consultation the doctor will tell you plainly which method matches your goal, and may suggest combining the two.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до біоревіталізації губ", ru: "Показания к биоревитализации губ", en: "Indications for Lip Biorevitalisation" },
      indications: [
        { uk: "Постійна сухість і лущення губ", ru: "Постоянная сухость и шелушение губ", en: "Persistent dryness and flaking of the lips" },
        { uk: "Дрібні вертикальні зморшки навколо рота", ru: "Мелкие вертикальные морщины вокруг рта", en: "Fine vertical lines around the mouth" },
        { uk: "Тьмяний колір і втрата чіткості контуру", ru: "Тусклый цвет и потеря чёткости контура", en: "Dull colour and loss of definition in the lip border" },
        { uk: "Зневоднення губ після зими або тривалого перебування на сонці", ru: "Обезвоживание губ после зимы или длительного пребывания на солнце", en: "Dehydrated lips after winter or prolonged sun exposure" },
        { uk: "Підготовка тканин перед контурною пластикою", ru: "Подготовка тканей перед контурной пластикой", en: "Preparing the tissue before lip augmentation" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Герпес у стадії загострення", ru: "Герпес в стадии обострения", en: "A herpes flare-up" },
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Алергія на препарати гіалуронової кислоти", ru: "Аллергия на препараты гиалуроновой кислоты", en: "Allergy to hyaluronic acid products" },
        { uk: "Порушення згортання крові та прийом антикоагулянтів", ru: "Нарушения свёртывания крови и приём антикоагулянтов", en: "Coagulation disorders or anticoagulant therapy" },
        { uk: "Запальні процеси та пошкодження шкіри в зоні губ", ru: "Воспалительные процессы и повреждения кожи в зоне губ", en: "Inflammation or broken skin in the lip area" },
        { uk: "Автоімунні захворювання в стадії загострення", ru: "Аутоиммунные заболевания в стадии обострения", en: "Autoimmune disease in an active phase" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура", ru: "Как проходит процедура", en: "How the Procedure Works" },
      steps: [
        { title: { uk: "Консультація та огляд", ru: "Консультация и осмотр", en: "Consultation and assessment" }, description: { uk: "Лікар оцінює стан тканин губ, з'ясовує запит і пояснює різницю між зволоженням і об'ємом.", ru: "Врач оценивает состояние тканей губ, выясняет запрос и объясняет разницу между увлажнением и объёмом.", en: "The doctor assesses the lip tissue, clarifies your goal, and explains the difference between hydration and volume." } },
        { title: { uk: "Аплікаційна анестезія", ru: "Аппликационная анестезия", en: "Topical anaesthesia" }, description: { uk: "На губи наносять анестетик на 20 хвилин — зона чутлива, тому анестезію застосовують завжди.", ru: "На губы наносят анестетик на 20 минут — зона чувствительна, поэтому анестезию применяют всегда.", en: "Anaesthetic cream is applied to the lips for 20 minutes — the area is sensitive, so anaesthesia is always used." } },
        { title: { uk: "Мікроін'єкції", ru: "Микроинъекции", en: "Microinjections" }, description: { uk: "Препарат вводять тонкою голкою по червоній облямівці та контуру. Введення триває 10-15 хвилин.", ru: "Препарат вводят тонкой иглой по красной кайме и контуру. Введение длится 10-15 минут.", en: "The product is injected with a fine needle along the vermilion and the border. This takes 10-15 minutes." } },
        { title: { uk: "Охолодження", ru: "Охлаждение", en: "Cooling" }, description: { uk: "Після ін'єкцій губи охолоджують — це зменшує набряк, який тримається 1-2 дні.", ru: "После инъекций губы охлаждают — это уменьшает отёк, который держится 1-2 дня.", en: "The lips are cooled afterwards, which limits the swelling that lasts 1-2 days." } },
        { title: { uk: "Курс із 2-3 процедур", ru: "Курс из 2-3 процедур", en: "A course of 2-3 treatments" }, description: { uk: "Інтервал між сеансами — 2-3 тижні. Ефект накопичується, повний результат видно після курсу.", ru: "Интервал между сеансами — 2-3 недели. Эффект накапливается, полный результат виден после курса.", en: "Sessions are 2-3 weeks apart. The effect builds, and the full result shows after the course." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги біоревіталізації губ", ru: "Преимущества биоревитализации губ", en: "Benefits of Lip Biorevitalisation" },
      items: [
        { uk: "Зволоження без зміни форми — губи залишаються природними", ru: "Увлажнение без изменения формы — губы остаются естественными", en: "Hydration without changing shape — the lips stay natural" },
        { uk: "Розгладжує кисетні зморшки, з якими не працює звичайний бальзам", ru: "Разглаживает кисетные морщины, с которыми не работает обычный бальзам", en: "Smooths perioral lines that a lip balm cannot address" },
        { uk: "Підходить тим, хто не хоче помітних змін в об'ємі", ru: "Подходит тем, кто не хочет заметных изменений в объёме", en: "Suits anyone who does not want a visible change in volume" },
        { uk: "Готує тканини, якщо надалі планується контурна пластика", ru: "Готовит ткани, если в дальнейшем планируется контурная пластика", en: "Prepares the tissue if lip augmentation is planned later" },
        { uk: "Мінімальний період відновлення — набряк минає за 1-2 дні", ru: "Минимальный период восстановления — отёк проходит за 1-2 дня", en: "Minimal downtime — swelling settles within 1-2 days" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи збільшаться губи після біоревіталізації?", ru: "Увеличатся ли губы после биоревитализации?", en: "Will my lips get bigger after biorevitalisation?" },
      answer: { uk: "Ні. Нестабілізована гіалуронова кислота не формує об'єм — вона утримує воду в тканині. У перші 1-2 дні губи можуть виглядати трохи повнішими через набряк після ін'єкцій, але це не результат процедури. Коли набряк минає, форма залишається вашою, а губи стають гладкими та зволоженими.", ru: "Нет. Нестабилизированная гиалуроновая кислота не формирует объём — она удерживает воду в ткани. В первые 1-2 дня губы могут выглядеть немного полнее из-за отёка после инъекций, но это не результат процедуры. Когда отёк проходит, форма остаётся вашей, а губы становятся гладкими и увлажнёнными.", en: "No. Non-stabilised hyaluronic acid does not create volume — it holds water in the tissue. For the first day or two the lips may look slightly fuller because of post-injection swelling, but that is not the result of the treatment. Once the swelling settles, the shape stays your own and the lips are smooth and hydrated." },
    },
    {
      question: { uk: "Скільки потрібно процедур?", ru: "Сколько нужно процедур?", en: "How many treatments are needed?" },
      answer: { uk: "Зазвичай 2-3 процедури з інтервалом 2-3 тижні. Ефект накопичується: після першого сеансу зникає сухість, після повного курсу розгладжуються дрібні зморшки й вирівнюється колір. Далі результат підтримують однією процедурою раз на 4-6 місяців.", ru: "Обычно 2-3 процедуры с интервалом 2-3 недели. Эффект накапливается: после первого сеанса исчезает сухость, после полного курса разглаживаются мелкие морщины и выравнивается цвет. Далее результат поддерживают одной процедурой раз в 4-6 месяцев.", en: "Usually 2-3 treatments at 2-3 week intervals. The effect is cumulative: dryness clears after the first session, and fine lines and colour improve after the full course. The result is then maintained with a single treatment every 4-6 months." },
    },
    {
      question: { uk: "Що робити, якщо на губах буває герпес?", ru: "Что делать, если на губах бывает герпес?", en: "What if I get cold sores on my lips?" },
      answer: { uk: "Схильність до герпесу не є абсолютним протипоказанням, але потребує підготовки. Будь-яка травматизація губ може спровокувати загострення, тому лікар призначає профілактичний курс противірусного препарату за 2-3 дні до процедури. У стадії активного висипання процедуру не проводять.", ru: "Склонность к герпесу не является абсолютным противопоказанием, но требует подготовки. Любая травматизация губ может спровоцировать обострение, поэтому врач назначает профилактический курс противовирусного препарата за 2-3 дня до процедуры. В стадии активного высыпания процедуру не проводят.", en: "A tendency to cold sores is not an absolute contraindication but does require preparation. Any trauma to the lips can trigger a flare, so the doctor prescribes a preventive course of antiviral medication 2-3 days before the procedure. It is not performed during an active outbreak." },
    },
  ],
},

// ─── 7. БІОРЕВІТАЛІЗАЦІЯ ШИЇ І ДЕКОЛЬТЕ ─────────────────────────────────────
{
  slug: "neck-biorevitalisation",
  category: "injectable-cosmetology",
  doctors: COSMETOLOGISTS,
  reviewer: "beliyanushkin-viktor",
  title: { uk: "Біоревіталізація шиї і декольте", ru: "Биоревитализация шеи и декольте", en: "Neck and Décolletage Biorevitalisation" },
  h1: { uk: "Біоревіталізація шиї і декольте в Дніпрі", ru: "Биоревитализация шеи и декольте в Днепре", en: "Neck and cleavage biorevitalization in Dnipro" },
  summary: {
    uk: "Біоревіталізація шиї і декольте у GENEVITY — ін'єкції гіалуронової кислоти в зони, де шкіра тонша за шкіру обличчя. Зволожує, згладжує поперечні складки та повертає щільність. Курс планують з урахуванням віку шкіри та стану тканин, Дніпро.",
    ru: "Биоревитализация шеи и декольте в GENEVITY — инъекции гиалуроновой кислоты в зоны, где кожа тоньше кожи лица. Увлажняет, сглаживает поперечные складки и возвращает плотность. Курс планируют с учётом возраста кожи и состояния тканей, Днепр.",
    en: "Neck and décolletage biorevitalisation at GENEVITY delivers hyaluronic acid into areas where the skin is thinner than on the face. It hydrates, softens horizontal folds, and restores density. The course is planned around skin age and tissue condition, Dnipro.",
  },
  procedureLength: { uk: "30-40 хвилин", ru: "30-40 минут", en: "30-40 minutes" },
  effectDuration: { uk: "6-9 місяців", ru: "6-9 месяцев", en: "6-9 months" },
  sessionsRecommended: { uk: "3-4 процедури", ru: "3-4 процедуры", en: "3-4 treatments" },
  equipment: [],
  related: ["biorevitalisation", "mesotherapy", "rejuran"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Чому шия і декольте старіють швидше за обличчя", ru: "Почему шея и декольте стареют быстрее лица", en: "Why the Neck and Décolletage Age Faster Than the Face" },
      body: {
        uk: "Шкіра шиї та декольте тонша за шкіру обличчя, у ній менше сальних залоз і слабший підшкірно-жировий шар. При цьому зона постійно рухається й майже завжди відкрита сонцю — а догляд за нею зазвичай обмежується залишками крему для обличчя.\n\nРезультат передбачуваний: зневоднення, поперечні складки («кільця Венери»), дрібна зморшкуватість у декольте та пігментні плями від ультрафіолету.\n\nБіоревіталізація шиї і декольте вводить гіалуронову кислоту безпосередньо в дерму. Молекула зв'язує воду, відновлюючи тургор, а мікротравма від ін'єкції стимулює фібробласти до синтезу власного колагену. Шкіра стає щільнішою, складки стають менш глибокими.\n\n**Що коригує процедура:**\n- Зневоднення та дрібну сітку зморшок у зоні декольте\n- Поперечні складки на шиї\n- Втрату щільності й тонусу шкіри\n- Нерівний тон після фотоушкодження",
        ru: "Кожа шеи и декольте тоньше кожи лица, в ней меньше сальных желёз и слабее подкожно-жировой слой. При этом зона постоянно движется и почти всегда открыта солнцу — а уход за ней обычно ограничивается остатками крема для лица.\n\nРезультат предсказуем: обезвоживание, поперечные складки («кольца Венеры»), мелкая морщинистость в декольте и пигментные пятна от ультрафиолета.\n\nБиоревитализация шеи и декольте вводит гиалуроновую кислоту непосредственно в дерму. Молекула связывает воду, восстанавливая тургор, а микротравма от инъекции стимулирует фибробласты к синтезу собственного коллагена. Кожа становится плотнее, складки становятся менее глубокими.\n\n**Что корректирует процедура:**\n- Обезвоживание и мелкую сетку морщин в зоне декольте\n- Поперечные складки на шее\n- Потерю плотности и тонуса кожи\n- Неровный тон после фотоповреждения",
        en: "The skin of the neck and décolletage is thinner than facial skin, with fewer sebaceous glands and a weaker subcutaneous fat layer. The area moves constantly and is nearly always exposed to the sun — while its care usually amounts to whatever face cream is left on the hands.\n\nThe outcome is predictable: dehydration, horizontal folds (so-called necklace lines), fine crêping across the décolletage, and UV-related pigment spots.\n\nNeck and décolletage biorevitalisation delivers hyaluronic acid directly into the dermis. The molecule binds water and restores turgor, while the microtrauma of the injection prompts fibroblasts to synthesise collagen of their own. The skin becomes denser and the folds less deep.\n\n**What the procedure corrects:**\n- Dehydration and fine crêping across the décolletage\n- Horizontal folds on the neck\n- Loss of density and tone\n- Uneven tone after photodamage",
      },
      calloutBody: {
        uk: "Біоревіталізація працює зі станом шкіри, а не з провисанням тканин. Якщо основна скарга — втрата чіткості овалу та птоз, лікар запропонує апаратний ліфтинг або поєднання методик.",
        ru: "Биоревитализация работает с состоянием кожи, а не с провисанием тканей. Если основная жалоба — потеря чёткости овала и птоз, врач предложит аппаратный лифтинг или сочетание методик.",
        en: "Biorevitalisation works on skin quality, not on sagging tissue. If the main concern is loss of definition and ptosis, the doctor will suggest device-based lifting or a combination of methods.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до біоревіталізації шиї і декольте", ru: "Показания к биоревитализации шеи и декольте", en: "Indications for Neck and Décolletage Biorevitalisation" },
      indications: [
        { uk: "Зневоднення шкіри шиї та зони декольте", ru: "Обезвоживание кожи шеи и зоны декольте", en: "Dehydrated skin on the neck and décolletage" },
        { uk: "Поперечні складки на шиї", ru: "Поперечные складки на шее", en: "Horizontal folds on the neck" },
        { uk: "Дрібна зморшкуватість у декольте, помітна вранці", ru: "Мелкая морщинистость в декольте, заметная утром", en: "Fine crêping on the décolletage, most visible in the morning" },
        { uk: "Втрата пружності після 30 років", ru: "Потеря упругости после 30 лет", en: "Loss of firmness after the age of 30" },
        { uk: "Наслідки фотостаріння: тьмяність і нерівний тон", ru: "Последствия фотостарения: тусклость и неровный тон", en: "The effects of photoageing: dullness and uneven tone" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Алергія на препарати гіалуронової кислоти", ru: "Аллергия на препараты гиалуроновой кислоты", en: "Allergy to hyaluronic acid products" },
        { uk: "Порушення згортання крові та прийом антикоагулянтів", ru: "Нарушения свёртывания крови и приём антикоагулянтов", en: "Coagulation disorders or anticoagulant therapy" },
        { uk: "Запальні процеси та пошкодження шкіри в зоні обробки", ru: "Воспалительные процессы и повреждения кожи в зоне обработки", en: "Inflammation or broken skin in the treatment area" },
        { uk: "Захворювання щитоподібної залози в стадії декомпенсації", ru: "Заболевания щитовидной железы в стадии декомпенсации", en: "Uncontrolled thyroid disease" },
        { uk: "Онкологічні захворювання, автоімунні стани в загостренні", ru: "Онкологические заболевания, аутоиммунные состояния в обострении", en: "Oncological disease, autoimmune conditions in an active phase" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура", ru: "Как проходит процедура", en: "How the Procedure Works" },
      steps: [
        { title: { uk: "Оцінка стану шкіри", ru: "Оценка состояния кожи", en: "Skin assessment" }, description: { uk: "Лікар визначає ступінь зневоднення й щільність шкіри, обирає препарат і схему введення.", ru: "Врач определяет степень обезвоживания и плотность кожи, выбирает препарат и схему введения.", en: "The doctor gauges the level of dehydration and skin density, then selects the product and injection pattern." } },
        { title: { uk: "Анестезія", ru: "Анестезия", en: "Anaesthesia" }, description: { uk: "Наносять аплікаційний анестетик на 20-30 хвилин: шкіра шиї чутлива до ін'єкцій.", ru: "Наносят аппликационный анестетик на 20-30 минут: кожа шеи чувствительна к инъекциям.", en: "Topical anaesthetic is applied for 20-30 minutes: the skin of the neck is sensitive to injections." } },
        { title: { uk: "Введення препарату", ru: "Введение препарата", en: "Injecting the product" }, description: { uk: "Лікар працює технікою мікропапул або лінійно — залежно від зони. Введення триває 15-20 хвилин.", ru: "Врач работает техникой микропапул или линейно — в зависимости от зоны. Введение длится 15-20 минут.", en: "The doctor uses a micropapule or linear technique depending on the area. Injecting takes 15-20 minutes." } },
        { title: { uk: "Заспокійливий догляд", ru: "Успокаивающий уход", en: "Soothing aftercare" }, description: { uk: "Після процедури наносять заспокійливий засіб. Папули розсмоктуються протягом 12-24 годин.", ru: "После процедуры наносят успокаивающее средство. Папулы рассасываются в течение 12-24 часов.", en: "A soothing product is applied afterwards. The papules resolve within 12-24 hours." } },
        { title: { uk: "Курс і підтримка", ru: "Курс и поддержка", en: "Course and maintenance" }, description: { uk: "3-4 процедури з інтервалом 2-3 тижні, далі підтримка раз на 6-9 місяців.", ru: "3-4 процедуры с интервалом 2-3 недели, далее поддержка раз в 6-9 месяцев.", en: "3-4 treatments at 2-3 week intervals, then maintenance every 6-9 months." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги процедури в GENEVITY", ru: "Преимущества процедуры в GENEVITY", en: "Benefits of the Procedure at GENEVITY" },
      items: [
        { uk: "Препарат і техніку підбирають окремо для шиї та для декольте", ru: "Препарат и технику подбирают отдельно для шеи и для декольте", en: "Product and technique are chosen separately for the neck and the décolletage" },
        { uk: "Працює з причиною — зневодненням дерми, а не маскує зморшки", ru: "Работает с причиной — обезвоживанием дермы, а не маскирует морщины", en: "Addresses the cause — dermal dehydration — rather than masking lines" },
        { uk: "Поєднується з апаратним ліфтингом, якщо є втрата тонусу", ru: "Сочетается с аппаратным лифтингом, если есть потеря тонуса", en: "Combines with device-based lifting when tone has been lost" },
        { uk: "Папули розсмоктуються за 12-24 години — наступного дня зона виглядає звично", ru: "Папулы рассасываются за 12-24 часа — на следующий день зона выглядит привычно", en: "Papules resolve in 12-24 hours — the area looks normal the next day" },
        { uk: "Процедуру виконують лікарі-косметологи з досвідом роботи в тонких зонах", ru: "Процедуру выполняют врачи-косметологи с опытом работы в тонких зонах", en: "Performed by cosmetologists experienced in working on delicate areas" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи залишаються сліди від ін'єкцій?", ru: "Остаются ли следы от инъекций?", en: "Do the injections leave marks?" },
      answer: { uk: "Одразу після процедури в зоні введення видно невеликі папули — це нормальна реакція, вони розсмоктуються протягом 12-24 годин. Можливі точкові синці, особливо в зоні декольте, де судини розташовані поверхнево; вони минають за 3-5 днів. Тому процедуру краще планувати не напередодні важливої події.", ru: "Сразу после процедуры в зоне введения видны небольшие папулы — это нормальная реакция, они рассасываются в течение 12-24 часов. Возможны точечные синяки, особенно в зоне декольте, где сосуды расположены поверхностно; они проходят за 3-5 дней. Поэтому процедуру лучше планировать не накануне важного события.", en: "Small papules are visible at the injection points immediately afterwards — a normal reaction that resolves within 12-24 hours. Pinpoint bruising is possible, especially on the décolletage where vessels sit close to the surface; it clears in 3-5 days. It is best not to schedule the procedure the day before an important event." },
    },
    {
      question: { uk: "Чи прибере процедура «кільця Венери»?", ru: "Уберёт ли процедура «кольца Венеры»?", en: "Will the procedure remove necklace lines?" },
      answer: { uk: "Зменшить їхню глибину, але не прибере повністю. Поперечні складки на шиї формуються не лише через стан шкіри — вони пов'язані з анатомією та звичною поставою. Біоревіталізація ущільнює шкіру, тому складки стають менш вираженими. Для помітнішого результату лікар може запропонувати поєднання з філером або апаратним ліфтингом.", ru: "Уменьшит их глубину, но не уберёт полностью. Поперечные складки на шее формируются не только из-за состояния кожи — они связаны с анатомией и привычной осанкой. Биоревитализация уплотняет кожу, поэтому складки становятся менее выраженными. Для более заметного результата врач может предложить сочетание с филлером или аппаратным лифтингом.", en: "It reduces their depth but does not erase them. Horizontal neck folds are not only a matter of skin quality — they relate to anatomy and habitual posture. Biorevitalisation thickens the skin, so the folds become less pronounced. For a more visible result the doctor may suggest combining it with a filler or device-based lifting." },
    },
    {
      question: { uk: "З якого віку варто починати?", ru: "С какого возраста стоит начинать?", en: "At what age should I start?" },
      answer: { uk: "Орієнтир — не вік, а стан шкіри. Найчастіше запит з'являється після 30 років, коли зона декольте починає видавати вік раніше за обличчя. Якщо є виражене зневоднення чи дрібна зморшкуватість, процедура доречна й раніше. Лікар оцінює стан тканин на консультації та каже, чи потрібен курс зараз.", ru: "Ориентир — не возраст, а состояние кожи. Чаще всего запрос появляется после 30 лет, когда зона декольте начинает выдавать возраст раньше лица. Если есть выраженное обезвоживание или мелкая морщинистость, процедура уместна и раньше. Врач оценивает состояние тканей на консультации и говорит, нужен ли курс сейчас.", en: "The guide is skin condition, not age. The request usually comes after 30, when the décolletage starts showing age before the face does. With marked dehydration or fine crêping, the procedure makes sense earlier. The doctor assesses the tissue at the consultation and tells you whether a course is warranted now." },
    },
  ],
},

// ─── 8. БІОРЕВІТАЛІЗАЦІЯ ІНТИМНОЇ ЗОНИ ──────────────────────────────────────
{
  slug: "intimate-zone-biorevitalisation",
  category: "injectable-cosmetology",
  doctors: GYNAECOLOGISTS,
  reviewer: "kroshka-iryna",
  title: { uk: "Біоревіталізація інтимної зони", ru: "Биоревитализация интимной зоны", en: "Intimate Zone Biorevitalisation" },
  h1: { uk: "Біоревіталізація інтимної зони в Дніпрі", ru: "Биоревитализация интимной зоны в Днепре", en: "Intimate zone biorevitalization in Dnipro" },
  summary: {
    uk: "Біоревіталізація інтимної області у GENEVITY — робота з зовнішніми статевими органами та зоною промежини. Гіалуронова кислота повертає тканинам тургор, згладжує зморшкуватість великих статевих губ і покращує їхній вигляд. Процедуру виконує гінеколог, Дніпро.",
    ru: "Биоревитализация интимной области в GENEVITY — работа с наружными половыми органами и зоной промежности. Гиалуроновая кислота возвращает тканям тургор, сглаживает морщинистость больших половых губ и улучшает их вид. Процедуру выполняет гинеколог, Днепр.",
    en: "Intimate zone biorevitalisation at GENEVITY treats the external genitalia and the perineal area. Hyaluronic acid restores turgor to the tissue, smooths crêping of the labia majora, and improves their appearance. The procedure is performed by a gynaecologist, Dnipro.",
  },
  procedureLength: { uk: "30-40 хвилин", ru: "30-40 минут", en: "30-40 minutes" },
  effectDuration: { uk: "6-12 місяців", ru: "6-12 месяцев", en: "6-12 months" },
  sessionsRecommended: { uk: "1-3 процедури", ru: "1-3 процедуры", en: "1-3 treatments" },
  equipment: [],
  related: ["intimate-biorevitalisation", "intimate-whitening", "monopolar-rf-lifting"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Які зони опрацьовує процедура", ru: "Какие зоны прорабатывает процедура", en: "Which Areas the Procedure Treats" },
      body: {
        uk: "Біоревіталізація інтимної області працює із зовнішніми статевими органами: великими та малими статевими губами, лобковою зоною і зоною промежини. Це естетичний і водночас функціональний запит — тканини тут втрачають об'єм і пружність так само, як шкіра обличчя, тільки візуально це помічають пізніше.\n\nЗ віком і після значних коливань ваги великі статеві губи стоншуються, шкіра стає зморшкуватою, а зона промежини втрачає еластичність. Після пологів додається рубцева тканина в місцях розривів або епізіотомії.\n\nГіалуронова кислота, введена в дерму цих зон, зв'язує воду й повертає тургор. Тканина стає щільнішою та рівнішою, зменшується сухість зовнішніх покривів, а рубці після пологів стають м'якшими.\n\n**З чим працює процедура:**\n- Зморшкуватість і в'ялість великих статевих губ\n- Втрата пружності шкіри лобкової зони\n- Сухість і стягнутість зовнішніх покривів\n- Ущільнення та дискомфорт у зоні післяпологових рубців",
        ru: "Биоревитализация интимной области работает с наружными половыми органами: большими и малыми половыми губами, лобковой зоной и зоной промежности. Это эстетический и одновременно функциональный запрос — ткани здесь теряют объём и упругость так же, как кожа лица, только визуально это замечают позже.\n\nС возрастом и после значительных колебаний веса большие половые губы истончаются, кожа становится морщинистой, а зона промежности теряет эластичность. После родов добавляется рубцовая ткань в местах разрывов или эпизиотомии.\n\nГиалуроновая кислота, введённая в дерму этих зон, связывает воду и возвращает тургор. Ткань становится плотнее и ровнее, уменьшается сухость наружных покровов, а рубцы после родов становятся мягче.\n\n**С чем работает процедура:**\n- Морщинистость и дряблость больших половых губ\n- Потеря упругости кожи лобковой зоны\n- Сухость и стянутость наружных покровов\n- Уплотнение и дискомфорт в зоне послеродовых рубцов",
        en: "Intimate zone biorevitalisation treats the external genitalia: the labia majora and minora, the pubic area, and the perineum. The request is both aesthetic and functional — the tissue here loses volume and firmness just as facial skin does, it is simply noticed later.\n\nWith age and after significant weight change the labia majora thin out, the skin becomes crêpey, and the perineum loses elasticity. After childbirth there is often scar tissue where tears or an episiotomy healed.\n\nHyaluronic acid injected into the dermis of these areas binds water and restores turgor. The tissue becomes denser and smoother, dryness of the external surfaces decreases, and postpartum scars soften.\n\n**What the procedure addresses:**\n- Crêping and laxity of the labia majora\n- Loss of firmness in the pubic area\n- Dryness and tightness of the external surfaces\n- Firmness and discomfort around postpartum scars",
      },
      calloutBody: {
        uk: "Якщо основний запит — сухість слизової та дискомфорт під час близькості, лікар порекомендує інтимну біоревіталізацію, яка працює зі слизовою. Ці дві процедури часто доповнюють одна одну, і на консультації лікар пояснить, що потрібно саме вам.",
        ru: "Если основной запрос — сухость слизистой и дискомфорт во время близости, врач порекомендует интимную биоревитализацию, которая работает со слизистой. Эти две процедуры часто дополняют друг друга, и на консультации врач объяснит, что нужно именно вам.",
        en: "If the main concern is mucosal dryness and discomfort during intimacy, the doctor will recommend intimate biorevitalisation, which works on the mucosa. The two procedures often complement each other, and the consultation clarifies which one you need.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до біоревіталізації інтимної зони", ru: "Показания к биоревитализации интимной зоны", en: "Indications for Intimate Zone Biorevitalisation" },
      indications: [
        { uk: "Зморшкуватість і в'ялість великих статевих губ", ru: "Морщинистость и дряблость больших половых губ", en: "Crêping and laxity of the labia majora" },
        { uk: "Втрата пружності тканин після значної зміни ваги", ru: "Потеря упругости тканей после значительного изменения веса", en: "Loss of tissue firmness after significant weight change" },
        { uk: "Вікові зміни зовнішніх статевих органів", ru: "Возрастные изменения наружных половых органов", en: "Age-related changes in the external genitalia" },
        { uk: "Післяпологові рубці після розривів або епізіотомії", ru: "Послеродовые рубцы после разрывов или эпизиотомии", en: "Postpartum scars from tears or an episiotomy" },
        { uk: "Сухість і стягнутість шкіри зовнішніх покривів", ru: "Сухость и стянутость кожи наружных покровов", en: "Dryness and tightness of the external skin" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Гострі запальні захворювання сечостатевої системи", ru: "Острые воспалительные заболевания мочеполовой системы", en: "Acute inflammatory conditions of the urogenital system" },
        { uk: "Інфекції, що передаються статевим шляхом, у активній фазі", ru: "Инфекции, передающиеся половым путём, в активной фазе", en: "Sexually transmitted infections in an active phase" },
        { uk: "Алергія на препарати гіалуронової кислоти", ru: "Аллергия на препараты гиалуроновой кислоты", en: "Allergy to hyaluronic acid products" },
        { uk: "Порушення згортання крові та прийом антикоагулянтів", ru: "Нарушения свёртывания крови и приём антикоагулянтов", en: "Coagulation disorders or anticoagulant therapy" },
        { uk: "Онкологічні захворювання, декомпенсований цукровий діабет", ru: "Онкологические заболевания, декомпенсированный сахарный диабет", en: "Oncological disease, uncontrolled diabetes" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура", ru: "Как проходит процедура", en: "How the Procedure Works" },
      steps: [
        { title: { uk: "Огляд і планування зон", ru: "Осмотр и планирование зон", en: "Examination and zone planning" }, description: { uk: "Лікар-гінеколог оглядає зону, обговорює очікування та визначає, які саме ділянки потребують корекції.", ru: "Врач-гинеколог осматривает зону, обсуждает ожидания и определяет, какие именно участки требуют коррекции.", en: "The gynaecologist examines the area, discusses expectations, and identifies which specific zones need correction." } },
        { title: { uk: "Анестезія", ru: "Анестезия", en: "Anaesthesia" }, description: { uk: "Аплікаційний анестетик наносять на 25-30 хвилин — цього достатньо для комфортного введення.", ru: "Аппликационный анестетик наносят на 25-30 минут — этого достаточно для комфортного введения.", en: "Topical anaesthetic is applied for 25-30 minutes, which is enough for comfortable injection." } },
        { title: { uk: "Введення препарату", ru: "Введение препарата", en: "Injecting the product" }, description: { uk: "Гіалуронову кислоту вводять мікроін'єкціями або канюлею — залежно від зони. Триває 15-20 хвилин.", ru: "Гиалуроновую кислоту вводят микроинъекциями или канюлей — в зависимости от зоны. Длится 15-20 минут.", en: "Hyaluronic acid is delivered by microinjection or cannula depending on the area. This takes 15-20 minutes." } },
        { title: { uk: "Охолодження та рекомендації", ru: "Охлаждение и рекомендации", en: "Cooling and instructions" }, description: { uk: "Зону охолоджують. На 5-7 днів виключають басейн, сауну, тісну білизну та статеві контакти.", ru: "Зону охлаждают. На 5-7 дней исключают бассейн, сауну, тесное бельё и половые контакты.", en: "The area is cooled. Pools, saunas, tight underwear, and sexual activity are excluded for 5-7 days." } },
        { title: { uk: "Оцінка результату через 3-4 тижні", ru: "Оценка результата через 3-4 недели", en: "Assessment after 3-4 weeks" }, description: { uk: "Тканина повністю відповідає на препарат за місяць. Тоді ж вирішують, чи потрібна друга процедура.", ru: "Ткань полностью отвечает на препарат за месяц. Тогда же решают, нужна ли вторая процедура.", en: "The tissue responds fully within a month, and that is when a second treatment is considered." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги процедури в GENEVITY", ru: "Преимущества процедуры в GENEVITY", en: "Benefits of the Procedure at GENEVITY" },
      items: [
        { uk: "Естетичну корекцію інтимної зони виконує лікар-гінеколог", ru: "Эстетическую коррекцию интимной зоны выполняет врач-гинеколог", en: "Aesthetic correction of the intimate area is performed by a gynaecologist" },
        { uk: "Огляд перед процедурою виключає запальний процес", ru: "Осмотр перед процедурой исключает воспалительный процесс", en: "The pre-procedure examination rules out inflammation" },
        { uk: "Працює і з естетикою, і з післяпологовими рубцями", ru: "Работает и с эстетикой, и с послеродовыми рубцами", en: "Addresses both aesthetics and postpartum scarring" },
        { uk: "Поєднується з лазерними методиками для комплексного результату", ru: "Сочетается с лазерными методиками для комплексного результата", en: "Combines with laser methods for a comprehensive result" },
        { uk: "Окремий кабінет і повна конфіденційність на всіх етапах", ru: "Отдельный кабинет и полная конфиденциальность на всех этапах", en: "A private room and full confidentiality at every stage" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чим ця процедура відрізняється від інтимної біоревіталізації?", ru: "Чем эта процедура отличается от интимной биоревитализации?", en: "How does this differ from intimate biorevitalisation?" },
      answer: { uk: "Різниця в зоні роботи. Інтимна біоревіталізація спрямована на слизову й вирішує функціональні скарги: сухість, печіння, дискомфорт під час близькості. Біоревіталізація інтимної зони працює із зовнішніми статевими органами та шкірою — це насамперед естетичний запит: зморшкуватість, в'ялість, післяпологові рубці. Часто лікар рекомендує обидві.", ru: "Разница в зоне работы. Интимная биоревитализация направлена на слизистую и решает функциональные жалобы: сухость, жжение, дискомфорт во время близости. Биоревитализация интимной зоны работает с наружными половыми органами и кожей — это прежде всего эстетический запрос: морщинистость, дряблость, послеродовые рубцы. Часто врач рекомендует обе.", en: "The difference is the area treated. Intimate biorevitalisation targets the mucosa and addresses functional complaints: dryness, burning, discomfort during intimacy. Intimate zone biorevitalisation works on the external genitalia and skin — primarily an aesthetic concern: crêping, laxity, postpartum scars. The doctor often recommends both." },
    },
    {
      question: { uk: "Чи буде помітний набряк після процедури?", ru: "Будет ли заметный отёк после процедуры?", en: "Will there be noticeable swelling afterwards?" },
      answer: { uk: "Незначний набряк у зоні введення тримається 1-2 дні — це нормальна реакція тканини на ін'єкції. Можливі точкові синці, які минають за 3-5 днів. До роботи та звичних справ можна повертатися того ж дня, але тренування, басейн і тісну білизну варто відкласти на 5-7 днів.", ru: "Незначительный отёк в зоне введения держится 1-2 дня — это нормальная реакция ткани на инъекции. Возможны точечные синяки, которые проходят за 3-5 дней. К работе и привычным делам можно возвращаться в тот же день, но тренировки, бассейн и тесное бельё стоит отложить на 5-7 дней.", en: "Mild swelling at the injection sites lasts 1-2 days — a normal tissue response. Pinpoint bruising is possible and clears in 3-5 days. You can return to work and everyday activities the same day, but training, pools, and tight underwear should wait 5-7 days." },
    },
    {
      question: { uk: "Скільки тримається результат?", ru: "Сколько держится результат?", en: "How long does the result last?" },
      answer: { uk: "Від 6 до 12 місяців залежно від препарату, віку та індивідуальної швидкості метаболізму. Гіалуронова кислота поступово розщеплюється, тому для стабільного результату процедуру повторюють раз на 8-12 місяців. Після першого курсу тканина зазвичай утримує вологу краще, і інтервал можна збільшити.", ru: "От 6 до 12 месяцев в зависимости от препарата, возраста и индивидуальной скорости метаболизма. Гиалуроновая кислота постепенно расщепляется, поэтому для стабильного результата процедуру повторяют раз в 8-12 месяцев. После первого курса ткань обычно удерживает влагу лучше, и интервал можно увеличить.", en: "From 6 to 12 months depending on the product, your age, and individual metabolism. Hyaluronic acid breaks down gradually, so the treatment is repeated every 8-12 months for a stable result. After the first course the tissue usually holds moisture better and the interval can be extended." },
    },
  ],
},

// ─── 9. БОТУЛІНОТЕРАПІЯ ПІД ПАХВАМИ ─────────────────────────────────────────
{
  slug: "underarm-botulinum",
  category: "injectable-cosmetology",
  doctors: COSMETOLOGISTS,
  reviewer: "beliyanushkin-viktor",
  title: { uk: "Ботулінотерапія під пахвами", ru: "Ботулинотерапия подмышками", en: "Underarm Botulinum Therapy" },
  h1: { uk: "Ботулінотерапія під пахвами в Дніпрі", ru: "Ботулинотерапия подмышками в Днепре", en: "Botulinum therapy for underarms in Dnipro" },
  summary: {
    uk: "Ботулінотерапія під пахвами у GENEVITY — ін'єкції ботулотоксину для контролю надмірної пітливості. Блокують сигнал до потових залоз і прибирають гіпергідроз на 6-9 місяців. Процедура займає 30 хвилин і не потребує відновлення, Дніпро.",
    ru: "Ботулинотерапия подмышками в GENEVITY — инъекции ботулотоксина для контроля избыточной потливости. Блокируют сигнал к потовым железам и убирают гипергидроз на 6-9 месяцев. Процедура занимает 30 минут и не требует восстановления, Днепр.",
    en: "Underarm botulinum therapy at GENEVITY uses botulinum toxin injections to control excessive sweating. They block the signal to the sweat glands and clear hyperhidrosis for 6-9 months. The procedure takes 30 minutes and requires no downtime, Dnipro.",
  },
  procedureLength: { uk: "20-30 хвилин", ru: "20-30 минут", en: "20-30 minutes" },
  effectDuration: { uk: "6-9 місяців", ru: "6-9 месяцев", en: "6-9 months" },
  sessionsRecommended: { uk: "1 процедура", ru: "1 процедура", en: "1 treatment" },
  equipment: [],
  related: ["botulinum-therapy", "biorevitalisation", "laser-women"],
  sections: [
    {
      type: "richText",
      heading: { uk: "Як ботулотоксин зупиняє пітливість", ru: "Как ботулотоксин останавливает потливость", en: "How Botulinum Toxin Stops Sweating" },
      body: {
        uk: "Потові залози працюють за командою нервової системи. Нервове закінчення виділяє ацетилхолін — медіатор, який дає залозі сигнал виробляти піт. При гіпергідрозі цей механізм надмірно активний: залози реагують навіть тоді, коли тілу не потрібне охолодження.\n\nБотулотоксин типу А блокує вивільнення ацетилхоліну в зоні введення. Сигнал не доходить до залози, і вона припиняє виробляти піт. Важливо: сама залоза не руйнується — через 6-9 місяців нервові закінчення відновлюються, і робота залоз повертається.\n\nУ GENEVITY процедуру виконують лікарі-косметологи. Перед введенням лікар проводить пробу Мінора, щоб точно визначити зону активного потовиділення — це дозволяє не витрачати препарат на ділянки, де він не потрібен.\n\n**Що дає процедура:**\n- Пітливість під пахвами зменшується на 80-95%\n- Зникає потреба в антиперспірантах із солями алюмінію\n- Немає слідів на одязі та пов'язаного з ними дискомфорту\n- Зменшується запах, оскільки бактерії позбавлені вологого середовища",
        ru: "Потовые железы работают по команде нервной системы. Нервное окончание выделяет ацетилхолин — медиатор, который даёт железе сигнал вырабатывать пот. При гипергидрозе этот механизм избыточно активен: железы реагируют даже тогда, когда телу не нужно охлаждение.\n\nБотулотоксин типа А блокирует высвобождение ацетилхолина в зоне введения. Сигнал не доходит до железы, и она прекращает вырабатывать пот. Важно: сама железа не разрушается — через 6-9 месяцев нервные окончания восстанавливаются, и работа желёз возвращается.\n\nВ GENEVITY процедуру выполняют врачи-косметологи. Перед введением врач проводит пробу Минора, чтобы точно определить зону активного потоотделения — это позволяет не расходовать препарат на участки, где он не нужен.\n\n**Что даёт процедура:**\n- Потливость под мышками уменьшается на 80-95%\n- Исчезает потребность в антиперспирантах с солями алюминия\n- Нет следов на одежде и связанного с ними дискомфорта\n- Уменьшается запах, поскольку бактерии лишены влажной среды",
        en: "Sweat glands work on a signal from the nervous system. The nerve ending releases acetylcholine, the messenger that tells the gland to produce sweat. In hyperhidrosis this mechanism is overactive: the glands respond even when the body does not need cooling.\n\nBotulinum toxin type A blocks the release of acetylcholine in the treated area. The signal does not reach the gland and it stops producing sweat. Importantly, the gland itself is not destroyed — after 6-9 months the nerve endings recover and gland function returns.\n\nAt GENEVITY the procedure is performed by cosmetologists. Before injecting, the doctor performs Minor's starch-iodine test to map the actively sweating area precisely, so no product is spent where it is not needed.\n\n**What the procedure delivers:**\n- Underarm sweating is reduced by 80-95%\n- No further need for aluminium-salt antiperspirants\n- No marks on clothing and none of the discomfort that comes with them\n- Less odour, because bacteria lose the moist environment they need",
      },
      calloutBody: {
        uk: "Гіпергідроз буває первинним і вторинним. Якщо надмірна пітливість з'явилася раптово, охоплює все тіло або супроводжується іншими симптомами, лікар спершу скерує на обстеження — причиною можуть бути щитоподібна залоза, цукровий діабет або інфекція.",
        ru: "Гипергидроз бывает первичным и вторичным. Если избыточная потливость появилась внезапно, охватывает всё тело или сопровождается другими симптомами, врач сначала направит на обследование — причиной могут быть щитовидная железа, сахарный диабет или инфекция.",
        en: "Hyperhidrosis can be primary or secondary. If excessive sweating appeared suddenly, affects the whole body, or comes with other symptoms, the doctor will first refer you for tests — the thyroid, diabetes, or an infection may be behind it.",
      },
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до ботулінотерапії під пахвами", ru: "Показания к ботулинотерапии подмышками", en: "Indications for Underarm Botulinum Therapy" },
      indications: [
        { uk: "Первинний аксилярний гіпергідроз", ru: "Первичный аксиллярный гипергидроз", en: "Primary axillary hyperhidrosis" },
        { uk: "Пітливість, що не контролюється антиперспірантами", ru: "Потливость, не контролируемая антиперспирантами", en: "Sweating that antiperspirants fail to control" },
        { uk: "Сліди поту на одязі, що заважають у роботі та спілкуванні", ru: "Следы пота на одежде, мешающие в работе и общении", en: "Sweat marks on clothing that interfere with work and social life" },
        { uk: "Неприємний запах, пов'язаний із надмірним потовиділенням", ru: "Неприятный запах, связанный с избыточным потоотделением", en: "Odour related to excessive sweating" },
        { uk: "Подразнення шкіри від постійного використання антиперспірантів", ru: "Раздражение кожи от постоянного использования антиперспирантов", en: "Skin irritation from constant antiperspirant use" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Вагітність і період лактації", ru: "Беременность и период лактации", en: "Pregnancy and breastfeeding" },
        { uk: "Міастенія та інші нервово-м'язові захворювання", ru: "Миастения и другие нервно-мышечные заболевания", en: "Myasthenia gravis and other neuromuscular disorders" },
        { uk: "Алергія на ботулотоксин або компоненти препарату", ru: "Аллергия на ботулотоксин или компоненты препарата", en: "Allergy to botulinum toxin or the product's components" },
        { uk: "Запальні процеси або пошкодження шкіри в зоні введення", ru: "Воспалительные процессы или повреждения кожи в зоне введения", en: "Inflammation or broken skin in the injection area" },
        { uk: "Прийом аміноглікозидних антибіотиків", ru: "Приём аминогликозидных антибиотиков", en: "Treatment with aminoglycoside antibiotics" },
        { uk: "Гострі інфекційні захворювання та підвищена температура", ru: "Острые инфекционные заболевания и повышенная температура", en: "Acute infection or fever" },
      ],
    },
    {
      type: "steps",
      heading: { uk: "Як проходить процедура", ru: "Как проходит процедура", en: "How the Procedure Works" },
      steps: [
        { title: { uk: "Консультація та виключення вторинних причин", ru: "Консультация и исключение вторичных причин", en: "Consultation and ruling out secondary causes" }, description: { uk: "Лікар з'ясовує характер пітливості та за потреби скеровує на аналізи, щоб виключити системну причину.", ru: "Врач выясняет характер потливости и при необходимости направляет на анализы, чтобы исключить системную причину.", en: "The doctor establishes the pattern of sweating and, if needed, orders tests to exclude a systemic cause." } },
        { title: { uk: "Проба Мінора", ru: "Проба Минора", en: "Minor's starch-iodine test" }, description: { uk: "На шкіру наносять йод і крохмаль — активні зони темніють. Так лікар точно бачить, куди вводити препарат.", ru: "На кожу наносят йод и крахмал — активные зоны темнеют. Так врач точно видит, куда вводить препарат.", en: "Iodine and starch are applied to the skin and the active zones darken, showing the doctor exactly where to inject." } },
        { title: { uk: "Розмітка та ін'єкції", ru: "Разметка и инъекции", en: "Mapping and injections" }, description: { uk: "Препарат вводять внутрішньошкірно по сітці з кроком 1-2 см. Обидві пахви займають 10-15 хвилин.", ru: "Препарат вводят внутрикожно по сетке с шагом 1-2 см. Обе подмышки занимают 10-15 минут.", en: "The product is injected intradermally in a grid 1-2 cm apart. Both underarms take 10-15 minutes." } },
        { title: { uk: "Рекомендації на добу", ru: "Рекомендации на сутки", en: "Instructions for the first day" }, description: { uk: "24 години без сауни, тренувань і алкоголю. Дезодорант можна використовувати з наступного дня.", ru: "24 часа без сауны, тренировок и алкоголя. Дезодорант можно использовать со следующего дня.", en: "No sauna, training, or alcohol for 24 hours. Deodorant can be used from the next day." } },
        { title: { uk: "Оцінка ефекту через 7-14 днів", ru: "Оценка эффекта через 7-14 дней", en: "Assessing the effect in 7-14 days" }, description: { uk: "Дія розвивається поступово. На контрольному огляді лікар за потреби коригує зону введення.", ru: "Действие развивается постепенно. На контрольном осмотре врач при необходимости корректирует зону введения.", en: "The effect develops gradually. At the follow-up the doctor can top up the treated area if needed." } },
      ],
    },
    {
      type: "bullets",
      heading: { uk: "Переваги ботулінотерапії під пахвами", ru: "Преимущества ботулинотерапии подмышками", en: "Benefits of Underarm Botulinum Therapy" },
      items: [
        { uk: "Проба Мінора визначає активну зону — препарат вводять точно, а не «за шаблоном»", ru: "Проба Минора определяет активную зону — препарат вводят точно, а не «по шаблону»", en: "Minor's test maps the active zone, so the product is placed precisely rather than by template" },
        { uk: "Результат тримається 6-9 місяців — це охоплює весь теплий сезон", ru: "Результат держится 6-9 месяцев — это охватывает весь тёплый сезон", en: "The result lasts 6-9 months, covering the whole warm season" },
        { uk: "Без періоду відновлення: повертатися до справ можна одразу", ru: "Без периода восстановления: возвращаться к делам можно сразу", en: "No downtime: you can return to your day immediately" },
        { uk: "Дія оборотна — робота потових залоз повністю відновлюється", ru: "Действие обратимо — работа потовых желёз полностью восстанавливается", en: "The effect is reversible — sweat gland function fully returns" },
        { uk: "Перед процедурою лікар виключає системні причини гіпергідрозу", ru: "Перед процедурой врач исключает системные причины гипергидроза", en: "Before the procedure the doctor excludes systemic causes of hyperhidrosis" },
      ],
    },
  ],
  faqs: [
    {
      question: { uk: "Чи шкідливо блокувати потовиділення під пахвами?", ru: "Вредно ли блокировать потоотделение под мышками?", en: "Is it harmful to block underarm sweating?" },
      answer: { uk: "Ні. Пахви дають лише близько 2% загального потовиділення, тому терморегуляція тіла не порушується — решта поверхні шкіри продовжує працювати як зазвичай. Компенсаторне посилення пітливості в інших зонах при аксилярному введенні трапляється рідко й зазвичай не потребує втручання.", ru: "Нет. Подмышки дают лишь около 2% общего потоотделения, поэтому терморегуляция тела не нарушается — остальная поверхность кожи продолжает работать как обычно. Компенсаторное усиление потливости в других зонах при аксиллярном введении встречается редко и обычно не требует вмешательства.", en: "No. The underarms account for only about 2% of total sweating, so thermoregulation is not impaired — the rest of the skin continues to work as usual. Compensatory sweating elsewhere is rare after axillary treatment and usually needs no intervention." },
    },
    {
      question: { uk: "Коли з'явиться ефект і скільки він триває?", ru: "Когда появится эффект и сколько он длится?", en: "When does the effect appear and how long does it last?" },
      answer: { uk: "Перше зменшення пітливості помітне на 3-5 день, повний ефект розвивається до 14 дня. Тримається 6-9 місяців — довше, ніж на м'язах обличчя, оскільки потові залози відновлюють іннервацію повільніше. Повторну процедуру планують, коли пітливість починає повертатися.", ru: "Первое уменьшение потливости заметно на 3-5 день, полный эффект развивается к 14 дню. Держится 6-9 месяцев — дольше, чем на мышцах лица, поскольку потовые железы восстанавливают иннервацию медленнее. Повторную процедуру планируют, когда потливость начинает возвращаться.", en: "The first reduction is noticeable on day 3-5 and the full effect develops by day 14. It lasts 6-9 months — longer than on facial muscles, because sweat glands re-establish innervation more slowly. A repeat treatment is scheduled once sweating begins to return." },
    },
    {
      question: { uk: "Чи можна поєднувати з лазерною епіляцією пахв?", ru: "Можно ли сочетать с лазерной эпиляцией подмышек?", en: "Can it be combined with underarm laser hair removal?" },
      answer: { uk: "Так, але не в один день. Лазерну епіляцію проводять або за 7-10 днів до ботулінотерапії, або через 2 тижні після неї, коли препарат уже повністю розподілився. Такий інтервал виключає додаткове подразнення шкіри в зоні ін'єкцій. Послідовність лікар складе на консультації.", ru: "Да, но не в один день. Лазерную эпиляцию проводят либо за 7-10 дней до ботулинотерапии, либо через 2 недели после неё, когда препарат уже полностью распределился. Такой интервал исключает дополнительное раздражение кожи в зоне инъекций. Последовательность врач составит на консультации.", en: "Yes, but not on the same day. Laser hair removal is done either 7-10 days before the botulinum treatment or two weeks after it, once the product has fully distributed. That interval avoids extra irritation in the injection area. The doctor will plan the sequence at your consultation." },
    },
  ],
},

];

// ════════════════════════════════════════════════════════════════════════════
async function idOf(table: "services" | "doctors" | "service_categories", slug: string): Promise<string | null> {
  const rows = table === "services"
    ? await sql`SELECT id FROM services WHERE slug = ${slug}`
    : table === "doctors"
      ? await sql`SELECT id FROM doctors WHERE slug = ${slug}`
      : await sql`SELECT id FROM service_categories WHERE slug = ${slug}`;
  return rows.length ? (rows[0].id as string) : null;
}

async function seedService(svc: ServiceSeed, meta: CsvMeta) {
  const categoryId = await idOf("service_categories", svc.category);
  if (!categoryId) throw new Error(`Category not found: ${svc.category}`);
  const reviewerId = await idOf("doctors", svc.reviewer);
  if (!reviewerId) console.warn(`    ⚠ reviewer doctor not found: ${svc.reviewer}`);

  const serviceId = await idOf("services", svc.slug);
  if (!serviceId) throw new Error(`Service row missing (pass 1 should have created it): ${svc.slug}`);

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
  for (const docSlug of svc.doctors) {
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

  console.log(`✓ ${svc.category}/${svc.slug} — ${svc.sections.length} sections, ${svc.faqs.length} FAQs, ${d} doctors, ${svc.equipment.length} equipment, ${r} related`);
}

async function main() {
  const csvMeta = readMetaFromCsv();
  const missing = services.filter((s) => !csvMeta[s.slug]).map((s) => s.slug);
  if (missing.length) throw new Error(`No CSV metatags for: ${missing.join(", ")}`);

  // Pass 1: create rows first, so cross-references between the new pages resolve.
  for (const svc of services) {
    if (!(await idOf("services", svc.slug))) {
      const categoryId = await idOf("service_categories", svc.category);
      if (!categoryId) throw new Error(`Category not found: ${svc.category}`);
      const id = randomUUID();
      const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM services WHERE category_id = ${categoryId}`;
      await sql`INSERT INTO services(id, slug, category_id, title_uk, sort_order)
                VALUES(${id}, ${svc.slug}, ${categoryId}, ${svc.title.uk}, ${Number(max) + 10})`;
      console.log(`+ pre-created ${svc.slug}`);
    } else {
      console.log(`~ ${svc.slug} already exists — updating in place`);
    }
  }
  // Pass 2: full content.
  for (const svc of services) await seedService(svc, csvMeta[svc.slug]);

  const check = await sql`
    SELECT s.slug, c.slug AS category, s.seo_title_uk, array_length(s.block_order, 1) AS blocks
    FROM services s JOIN service_categories c ON c.id = s.category_id
    WHERE s.slug = ANY(${services.map((s) => s.slug)}) ORDER BY c.slug, s.sort_order`;
  console.table(check);

  await sql.end();
  console.log("\nТЗ №8 — 9 service pages DONE.");
}
main().catch((e) => { console.error(e); process.exit(1); });
