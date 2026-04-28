/**
 * V3c-v2 — M22 Stellar Black, Splendor X, HydraFacial, AcuPulse CO₂
 * Re-seeds with section variety: richText + indicationsContraindications + steps + bullets
 * Run: npx tsx scripts/seed-copy-v3c-v2.ts
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

type L = { uk: string; ru: string; en: string };

type RichTextSection = { type: "richText"; heading: L; body: L; calloutBody?: L; heroImage?: string | null };
type IndicationsSection = {
  type: "indicationsContraindications";
  indicationsHeading: L; indications: L[];
  contraindicationsHeading: L; contraindications: L[];
};
type StepsSection = { type: "steps"; heading: L; steps: { title: L; description: L }[] };
type BulletsSection = { type: "bullets"; heading: L; items: L[] };
type AnySection = RichTextSection | IndicationsSection | StepsSection | BulletsSection;

interface FaqCopy { question: L; answer: L }
interface ServiceCopy { slug: string; summary: L; sections: AnySection[]; faq: FaqCopy[] }

function sectionData(s: AnySection): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: s.heroImage ?? null };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  return {};
}

const SERVICES: ServiceCopy[] = [
  // ─── M22 STELLAR BLACK ────────────────────────────────────────────────────
  {
    slug: "m22-stellar-black",
    summary: {
      uk: "M22 Stellar Black від Lumenis у GENEVITY — платформа фотомедицини з модулями IPL, ResurFX фракційний лазер і Q-Switched Nd:YAG. Усуває судинні та пігментні дефекти, омолоджує і вирівнює тон шкіри без хірургії.",
      ru: "M22 Stellar Black от Lumenis в GENEVITY — платформа фотомедицины с модулями IPL, ResurFX фракционный лазер и Q-Switched Nd:YAG. Устраняет сосудистые и пигментные дефекты, омолаживает и выравнивает тон кожи без хирургии.",
      en: "M22 Stellar Black by Lumenis at GENEVITY — a photomedicine platform with IPL, ResurFX fractional laser, and Q-Switched Nd:YAG modules. Eliminates vascular and pigmentary defects, rejuvenates and evens skin tone without surgery.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "M22 Stellar Black — платформа фотомедицини Lumenis", ru: "M22 Stellar Black — платформа фотомедицины Lumenis", en: "M22 Stellar Black — Lumenis Photomedicine Platform" },
        body: {
          uk: "M22 Stellar Black — найновіша мультимодальна платформа фотомедицини від ізраїльського лідера Lumenis. В одному апараті поєднані три технологічні модулі: IPL (Intense Pulsed Light) — широкосмуговий імпульсний фотовплив для судин, пігменту та дифузного почервоніння; ResurFX — нефракційний фракційний 1565 нм лазер для неаблятивного ремоделювання дерми; Q-Switched Nd:YAG 1064/532 нм — для глибоких пігментних уражень, татуювань і оніхомікозу. IPL-модуль оснащений технологією Optimal Pulse Technology (OPT), яка забезпечує ідеально рівну форму імпульсу, — це унеможливлює пік-перегрів і підвищує безпеку. Завдяки набору змінних фільтрів IPL ефективно працює зі широким спектром фотодерматозів: телеангіектазії, розацеа, плями Otu, хлоазма, поствугровий еритем.",
          ru: "M22 Stellar Black — новейшая мультимодальная платформа фотомедицины от израильского лидера Lumenis. В одном аппарате объединены три технологических модуля: IPL (Intense Pulsed Light) — широкополосный импульсный фотовоздействие для сосудов, пигмента и диффузного покраснения; ResurFX — нефракционный фракционный 1565 нм лазер для неаблятивного ремоделирования дермы; Q-Switched Nd:YAG 1064/532 нм — для глубоких пигментных поражений, татуировок и онихомикоза. IPL-модуль оснащён технологией Optimal Pulse Technology (OPT), которая обеспечивает идеально ровную форму импульса, — это исключает пиковый перегрев и повышает безопасность. Благодаря набору сменных фильтров IPL эффективно работает с широким спектром фотодерматозов: телеангиэктазии, розацеа, пятна Оты, хлоазма, поствугревая эритема.",
          en: "M22 Stellar Black is the latest multimodal photomedicine platform by Israeli leader Lumenis. Three technology modules are combined in one device: IPL (Intense Pulsed Light) — broadband pulsed light for vessels, pigment, and diffuse redness; ResurFX — non-ablative fractional 1565 nm laser for non-ablative dermal remodeling; Q-Switched Nd:YAG 1064/532 nm — for deep pigmentary lesions, tattoos, and onychomycosis. The IPL module features Optimal Pulse Technology (OPT) ensuring perfectly flat pulse shape — eliminating peak overheating and enhancing safety. With its set of interchangeable filters, IPL effectively treats a wide range of photodermatoses: telangiectasias, rosacea, Ota's nevi, chloasma, post-acne erythema.",
        },
        calloutBody: {
          uk: "Один апарат — три лазерні технологічних рішення. Протокол обирається на консультації після фотоаналізу шкіри і підбирається до конкретного дефекту, а не до типу апарату.",
          ru: "Один аппарат — три лазерных технологических решения. Протокол выбирается на консультации после фотоанализа кожи и подбирается под конкретный дефект, а не под тип аппарата.",
          en: "One device — three laser technology solutions. The protocol is selected at consultation after skin photoanalysis and is tailored to the specific defect, not the device type.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до M22 Stellar Black", ru: "Показания к M22 Stellar Black", en: "Indications for M22 Stellar Black" },
        indications: [
          { uk: "Судинні зірочки та розширені капіляри обличчя", ru: "Сосудистые звёздочки и расширенные капилляры лица", en: "Spider veins and enlarged facial capillaries" },
          { uk: "Розацеа, дифузна еритема, куперозний висип", ru: "Розацеа, диффузная эритема, купероз", en: "Rosacea, diffuse erythema, couperose" },
          { uk: "Хлоазма, мелазма, сонячні лентиго і вікові плями", ru: "Хлоазма, мелазма, солнечные лентиго и возрастные пятна", en: "Chloasma, melasma, solar lentigines, and age spots" },
          { uk: "Нерівний тон шкіри, постзапальна пігментація", ru: "Неровный тон кожи, постовоспалительная пигментация", en: "Uneven skin tone and post-inflammatory pigmentation" },
          { uk: "Поверхневі зморшки, втрата тонусу (ResurFX)", ru: "Поверхностные морщины, потеря тонуса (ResurFX)", en: "Fine lines and loss of tone (ResurFX)" },
          { uk: "Видалення татуювань та перманентного макіяжу (Q-Switched)", ru: "Удаление татуировок и перманентного макияжа (Q-Switched)", en: "Tattoo and permanent makeup removal (Q-Switched)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "IV–VI фототип шкіри для IPL (ризик гіперпігментації)", ru: "IV–VI фототип кожи для IPL (риск гиперпигментации)", en: "Skin phototype IV–VI for IPL (hyperpigmentation risk)" },
          { uk: "Активне вугрове висипання (стадія запалення)", ru: "Активное угревое высыпание (стадия воспаления)", en: "Active acne breakout (inflammatory stage)" },
          { uk: "Засмага або солярій протягом 4 тижнів до процедури", ru: "Загар или солярий в течение 4 недель до процедуры", en: "Tan or solarium within 4 weeks before the procedure" },
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Прийом фотосенсибілізуючих препаратів (тетрацикліни, ретиноїди)", ru: "Приём фотосенсибилизирующих препаратов (тетрациклины, ретиноиды)", en: "Photosensitizing medications (tetracyclines, retinoids)" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура на M22 Stellar Black", ru: "Как проходит процедура на M22 Stellar Black", en: "M22 Stellar Black Procedure Steps" },
        steps: [
          {
            title: { uk: "Фотоаналіз шкіри і вибір модуля", ru: "Фотоанализ кожи и выбор модуля", en: "Skin Photoanalysis and Module Selection" },
            description: { uk: "Лікар аналізує тип і фототип шкіри, дефекти, глибину пігменту. Обирає IPL, ResurFX або Q-Switched залежно від задачі.", ru: "Врач анализирует тип и фототип кожи, дефекты, глубину пигмента. Выбирает IPL, ResurFX или Q-Switched в зависимости от задачи.", en: "The physician analyzes skin type and phototype, defects, pigment depth. Selects IPL, ResurFX, or Q-Switched depending on the goal." },
          },
          {
            title: { uk: "Підготовка: очищення та захисні окуляри", ru: "Подготовка: очищение и защитные очки", en: "Preparation: Cleansing and Protective Eyewear" },
            description: { uk: "Шкіру очищають від косметики, накладають захисні окуляри. Для деяких протоколів наносять охолоджуючий гель.", ru: "Кожу очищают от косметики, надевают защитные очки. Для некоторых протоколов наносят охлаждающий гель.", en: "Skin is cleansed of cosmetics, protective eyewear is applied. A cooling gel is applied for some protocols." },
          },
          {
            title: { uk: "Лікувальний вплив по зонах", ru: "Лечебное воздействие по зонам", en: "Targeted Treatment by Zone" },
            description: { uk: "Лікар обробляє зони послідовно, контролюючи інтенсивність реакції шкіри. Процедура займає 20–60 хвилин залежно від площі та модуля.", ru: "Врач последовательно обрабатывает зоны, контролируя интенсивность реакции кожи. Процедура занимает 20–60 минут в зависимости от площади и модуля.", en: "The physician treats zones sequentially, monitoring skin reaction intensity. Duration: 20–60 minutes depending on area and module." },
          },
          {
            title: { uk: "Заспокоєння та сонцезахисний крем", ru: "Успокоение и солнцезащитный крем", en: "Soothing and Sun Protection" },
            description: { uk: "Наносять заспокійливий крем або маску. Обов'язково — SPF 50+ у перші 2–4 тижні після процедури.", ru: "Наносят успокаивающий крем или маску. Обязательно — SPF 50+ в первые 2–4 недели после процедуры.", en: "Soothing cream or mask is applied. SPF 50+ is mandatory for the first 2–4 weeks after the procedure." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості M22 Stellar Black", ru: "Преимущества и особенности M22 Stellar Black", en: "M22 Stellar Black Advantages and Considerations" },
        items: [
          { uk: "Три модулі в одному апараті — IPL, ResurFX, Q-Switched Nd:YAG", ru: "Три модуля в одном аппарате — IPL, ResurFX, Q-Switched Nd:YAG", en: "Three modules in one device — IPL, ResurFX, Q-Switched Nd:YAG" },
          { uk: "OPT-технологія забезпечує безпечну рівномірну форму імпульсу", ru: "OPT-технология обеспечивает безопасную равномерную форму импульса", en: "OPT technology ensures safe, uniform pulse shape" },
          { uk: "Ефективна робота з судинами, пігментом і рубцями за одну сесію", ru: "Эффективная работа с сосудами, пигментом и рубцами за одну сессию", en: "Effective treatment of vessels, pigment, and scars in one session" },
          { uk: "Рекомендований курс IPL — 3–5 процедур з інтервалом 3–4 тижні", ru: "Рекомендованный курс IPL — 3–5 процедур с интервалом 3–4 недели", en: "Recommended IPL course — 3–5 procedures every 3–4 weeks" },
          { uk: "⚠ Необхідно уникати засмаги мінімум 4 тижні до та після IPL", ru: "⚠ Необходимо избегать загара минимум 4 недели до и после IPL", en: "⚠ Avoid tanning at least 4 weeks before and after IPL" },
          { uk: "⚠ Для темних фототипів (IV+) IPL протипоказано — обирається Q-Switched або лазер", ru: "⚠ Для тёмных фототипов (IV+) IPL противопоказано — выбирается Q-Switched или лазер", en: "⚠ For dark phototypes (IV+) IPL is contraindicated — Q-Switched or laser is selected instead" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Що краще — IPL чи лазер?", ru: "Что лучше — IPL или лазер?", en: "What is better — IPL or laser?" },
        answer: { uk: "IPL — широкосмуговий і підходить для дифузних проблем (рівний тон, судини, розацеа). Лазер точніший — ідеальний для конкретних пігментних плям або рубців. Лікар обирає залежно від задачі.", ru: "IPL — широкополосный и подходит для диффузных проблем (ровный тон, сосуды, розацеа). Лазер точнее — идеален для конкретных пигментных пятен или рубцов. Врач выбирает в зависимости от задачи.", en: "IPL is broadband and suits diffuse issues (even tone, vessels, rosacea). Laser is more precise — ideal for specific pigmented spots or scars. The physician chooses based on the goal." },
      },
      {
        question: { uk: "Чи боляча процедура IPL?", ru: "Больна ли процедура IPL?", en: "Is the IPL procedure painful?" },
        answer: { uk: "Відчувається короткий укол-клацання при спалаху. Більшість пацієнтів описують це як «легке щипання». Вбудований DCD-кулер мінімізує дискомфорт.", ru: "Ощущается короткий укол-щелчок при вспышке. Большинство пациентов описывают это как «лёгкое пощипывание». Встроенный DCD-кулер минимизирует дискомфорт.", en: "A brief sting is felt at each flash. Most patients describe it as a 'mild pinch.' The built-in DCD cooler minimizes discomfort." },
      },
      {
        question: { uk: "Скільки процедур IPL потрібно для видимого результату?", ru: "Сколько процедур IPL нужно для видимого результата?", en: "How many IPL sessions are needed for visible results?" },
        answer: { uk: "Зазвичай 3–5 сесій з інтервалом 3–4 тижні. Після першої процедури пігмент може потемніти перед тим, як злущитися — це норма.", ru: "Обычно 3–5 сессий с интервалом 3–4 недели. После первой процедуры пигмент может потемнеть перед тем, как слущиться — это норма.", en: "Typically 3–5 sessions every 3–4 weeks. After the first session, pigment may darken before flaking off — this is normal." },
      },
    ],
  },

  // ─── SPLENDOR X ───────────────────────────────────────────────────────────
  {
    slug: "splendor-x",
    summary: {
      uk: "Splendor X від Lumenis у GENEVITY — найшвидший та найбезпечніший лазер для видалення небажаного волосся на будь-якому фототипі. Унікальна квадратна пляма лазера BLEND X забезпечує рівномірне перекриття без пропусків, рецидивів і опіків.",
      ru: "Splendor X от Lumenis в GENEVITY — самый быстрый и безопасный лазер для удаления нежелательных волос на любом фототипе. Уникальное квадратное пятно лазера BLEND X обеспечивает равномерное перекрытие без пропусков, рецидивов и ожогов.",
      en: "Splendor X by Lumenis at GENEVITY — the fastest and safest laser for unwanted hair removal on any phototype. The unique square laser spot BLEND X ensures uniform coverage without gaps, recurrence, or burns.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Splendor X — лазерна епіляція нового покоління", ru: "Splendor X — лазерная эпиляция нового поколения", en: "Splendor X — Next-Generation Laser Hair Removal" },
        body: {
          uk: "Splendor X — лазерна система від Lumenis з унікальною технологією BLEND X: одночасне використання двох довжин хвиль — александритового (755 нм) і Nd:YAG (1064 нм) лазерів у будь-якому заданому співвідношенні. Це дає змогу охопити весь спектр фототипів від I до VI включно: 755 нм ефективно знищує волосяний фолікул у світлих типах шкіри, 1064 нм безпечно проникає у меланін-насичену темну шкіру. Ключова перевага апарату — квадратна форма плями замість традиційної круглої. Математично: квадрати замощують площину без пробілів, кола — ні. Це означає 100% перекриття зони за мінімальну кількість проходів, без пропусків і без надмірних перекрить, що спричиняють опіки. У поєднанні з активним охолодженням Cryogen Spray Cooling (CSC) Splendor X є клінічно безпечним для засмаглої шкіри та чутливих зон.",
          ru: "Splendor X — лазерная система от Lumenis с уникальной технологией BLEND X: одновременное использование двух длин волн — александритового (755 нм) и Nd:YAG (1064 нм) лазеров в любом заданном соотношении. Это позволяет охватить весь спектр фототипов от I до VI включительно: 755 нм эффективно уничтожает волосяной фолликул у светлых типов кожи, 1064 нм безопасно проникает в меланин-насыщенную тёмную кожу. Ключевое преимущество аппарата — квадратная форма пятна вместо традиционной круглой. Математически: квадраты покрывают плоскость без пробелов, круги — нет. Это означает 100% перекрытие зоны за минимальное количество проходов, без пропусков и без лишних перекрытий, вызывающих ожоги. В сочетании с активным охлаждением Cryogen Spray Cooling (CSC) Splendor X клинически безопасен для загорелой кожи и чувствительных зон.",
          en: "Splendor X is a Lumenis laser system with unique BLEND X technology: simultaneous use of two wavelengths — Alexandrite (755 nm) and Nd:YAG (1064 nm) lasers in any set ratio. This covers the full spectrum of phototypes I through VI: 755 nm effectively destroys the hair follicle in fair skin types, while 1064 nm safely penetrates melanin-rich dark skin. The device's key advantage is a square spot shape instead of the traditional round. Mathematically: squares tile a plane without gaps, circles do not. This means 100% zone coverage in minimum passes — no missed spots and no excess overlaps causing burns. Combined with active Cryogen Spray Cooling (CSC), Splendor X is clinically safe for tanned skin and sensitive areas.",
        },
        calloutBody: {
          uk: "Швидкість Splendor X: до 1500 см²/хв для ніг — повна епіляція обох ніг за 20 хвилин. Найбільша пляма серед усіх лазерних систем на ринку — 26 × 26 мм.",
          ru: "Скорость Splendor X: до 1500 см²/мин для ног — полная эпиляция обеих ног за 20 минут. Самое большое пятно среди всех лазерных систем на рынке — 26 × 26 мм.",
          en: "Splendor X speed: up to 1,500 cm²/min for legs — full epilation of both legs in 20 minutes. Largest spot size among all laser systems on the market — 26 × 26 mm.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до Splendor X", ru: "Показания к Splendor X", en: "Indications for Splendor X" },
        indications: [
          { uk: "Небажане волосся на обличчі, тілі та чутливих зонах (бікіні, пахви)", ru: "Нежелательные волосы на лице, теле и чувствительных зонах (бикини, подмышки)", en: "Unwanted hair on face, body, and sensitive areas (bikini, underarms)" },
          { uk: "Всі фототипи шкіри від I до VI включно", ru: "Все фототипы кожи от I до VI включительно", en: "All skin phototypes from I to VI" },
          { uk: "Засмагла шкіра (безпечно завдяки Nd:YAG + охолодженню CSC)", ru: "Загорелая кожа (безопасно благодаря Nd:YAG + охлаждению CSC)", en: "Tanned skin (safe thanks to Nd:YAG + CSC cooling)" },
          { uk: "Гірсутизм і гіпертрихоз — підвищена волосатість", ru: "Гирсутизм и гипертрихоз — повышенная волосатость", en: "Hirsutism and hypertrichosis — excessive hair growth" },
          { uk: "Вросле волосся і фолікуліт після гоління", ru: "Вросшие волосы и фолликулит после бритья", en: "Ingrown hairs and folliculitis after shaving" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Дуже світле (сіре, руде, біле) волосся — без пігменту лазер не діє", ru: "Очень светлые (седые, рыжие, белые) волосы — без пигмента лазер не действует", en: "Very light (grey, red, white) hair — without pigment the laser is ineffective" },
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Активна герпетична інфекція у зоні обробки", ru: "Активная герпетическая инфекция в зоне обработки", en: "Active herpes infection in the treatment area" },
          { uk: "Свіжа засмага (менше 2 тижнів до процедури)", ru: "Свежий загар (менее 2 недель до процедуры)", en: "Fresh tan (less than 2 weeks before the procedure)" },
          { uk: "Прийом фотосенсибілізуючих препаратів", ru: "Приём фотосенсибилизирующих препаратов", en: "Use of photosensitizing medications" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить лазерна епіляція Splendor X", ru: "Как проходит лазерная эпиляция Splendor X", en: "Splendor X Laser Hair Removal Steps" },
        steps: [
          {
            title: { uk: "Консультація та підбір параметрів", ru: "Консультация и подбор параметров", en: "Consultation and Parameter Selection" },
            description: { uk: "Визначають фототип, оцінюють колір і густину волосся, виключають протипоказання. Лікар налаштовує співвідношення BLEND X та щільність енергії.", ru: "Определяют фототип, оценивают цвет и густоту волос, исключают противопоказания. Врач настраивает соотношение BLEND X и плотность энергии.", en: "Phototype is determined, hair color and density assessed, contraindications excluded. The physician configures the BLEND X ratio and energy density." },
          },
          {
            title: { uk: "Підготовка: гоління і охолоджуючий гель", ru: "Подготовка: бритьё и охлаждающий гель", en: "Preparation: Shaving and Cooling Gel" },
            description: { uk: "Зону голять (за день до процедури або в день). Наносять охолоджуючий гель для додаткового комфорту. Шкіру не депілюють воском або нитками — корінь має бути цілим.", ru: "Зону бреют (за день до процедуры или в день). Наносят охлаждающий гель для дополнительного комфорта. Кожу не депилируют воском или нитями — корень должен быть целым.", en: "The area is shaved (day before or on the day). Cooling gel is applied for comfort. No waxing or threading — the root must be intact." },
          },
          {
            title: { uk: "Лазерна обробка з CSC-охолодженням", ru: "Лазерная обработка с CSC-охлаждением", en: "Laser Treatment with CSC Cooling" },
            description: { uk: "Лікар обробляє зону рівномірними квадратними імпульсами. Кріоген-охолодження CSC автоматично охолоджує шкіру до та після кожного імпульсу. Дискомфорт мінімальний.", ru: "Врач обрабатывает зону равномерными квадратными импульсами. Криоген-охлаждение CSC автоматически охлаждает кожу до и после каждого импульса. Дискомфорт минимальный.", en: "The physician treats the zone with uniform square pulses. CSC cryogen cooling automatically cools the skin before and after each pulse. Discomfort is minimal." },
          },
          {
            title: { uk: "Постпроцедурний догляд", ru: "Постпроцедурный уход", en: "Post-Procedure Care" },
            description: { uk: "Наносять заспокійливий крем. Уникайте сонця та солярію 2–4 тижні. Волосся випадає самостійно протягом 7–14 днів після процедури.", ru: "Наносят успокаивающий крем. Избегайте солнца и солярия 2–4 недели. Волосы выпадают самостоятельно в течение 7–14 дней после процедуры.", en: "Soothing cream is applied. Avoid sun and solarium for 2–4 weeks. Hair sheds naturally within 7–14 days after the procedure." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості Splendor X", ru: "Преимущества и особенности Splendor X", en: "Splendor X Advantages and Considerations" },
        items: [
          { uk: "Квадратна пляма 26×26 мм — 100% перекриття без пропусків і надлишкових перекрить", ru: "Квадратное пятно 26×26 мм — 100% перекрытие без пропусков и лишних перекрытий", en: "Square 26×26 mm spot — 100% coverage without gaps or excess overlaps" },
          { uk: "BLEND X поєднує два лазери — ефективно на всіх фототипах I–VI", ru: "BLEND X объединяет два лазера — эффективно на всех фототипах I–VI", en: "BLEND X combines two lasers — effective on all phototypes I–VI" },
          { uk: "Найшвидша система: ноги обидві — 20 хвилин", ru: "Самая быстрая система: обе ноги — 20 минут", en: "Fastest system: both legs in 20 minutes" },
          { uk: "CSC-охолодження робить процедуру безпечною навіть на засмаглій шкірі", ru: "CSC-охлаждение делает процедуру безопасной даже на загорелой коже", en: "CSC cooling makes the procedure safe even on tanned skin" },
          { uk: "⚠ Потрібен курс 6–8 сесій — волосся в анагені, не всі ростуть одночасно", ru: "⚠ Нужен курс 6–8 сессий — волосы в анагене, не все растут одновременно", en: "⚠ A course of 6–8 sessions is needed — hair in anagen phase, not all grow simultaneously" },
          { uk: "⚠ Ефективність на сірому та білому волоссі — нульова (відсутній хромофор)", ru: "⚠ Эффективность на седых и белых волосах — нулевая (отсутствует хромофор)", en: "⚠ Effectiveness on grey and white hair is zero — no chromophore" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Скільки сесій потрібно для постійного результату?", ru: "Сколько сессий нужно для постоянного результата?", en: "How many sessions are needed for permanent results?" },
        answer: { uk: "6–8 сесій з інтервалом 4–8 тижнів залежно від зони. Після курсу — підтримувальна процедура 1–2 рази на рік.", ru: "6–8 сессий с интервалом 4–8 недель в зависимости от зоны. После курса — поддерживающая процедура 1–2 раза в год.", en: "6–8 sessions every 4–8 weeks depending on the area. After the course — 1–2 maintenance sessions per year." },
      },
      {
        question: { uk: "Боляче? Як відчуваєте?", ru: "Больно? Какие ощущения?", en: "Is it painful? What does it feel like?" },
        answer: { uk: "Відчуття — легке покалювання і тепло при кожному імпульсі. CSC-охолодження значно знижує дискомфорт. Більшість порівнює з клацанням гумкою.", ru: "Ощущения — лёгкое покалывание и тепло при каждом импульсе. CSC-охлаждение значительно снижает дискомфорт. Большинство сравнивает со щелчком резинкой.", en: "A mild sting and warmth at each pulse. CSC cooling significantly reduces discomfort. Most compare it to a rubber band snap." },
      },
      {
        question: { uk: "Чи можна робити процедуру влітку?", ru: "Можно ли делать процедуру летом?", en: "Can the procedure be done in summer?" },
        answer: { uk: "Так, але необхідно уникати прямого сонця мінімум 2 тижні до і після. Завдяки Nd:YAG-лазеру і CSC Splendor X безпечний навіть для помірно засмаглої шкіри.", ru: "Да, но необходимо избегать прямого солнца минимум 2 недели до и после. Благодаря Nd:YAG-лазеру и CSC Splendor X безопасен даже для умеренно загорелой кожи.", en: "Yes, but avoid direct sun at least 2 weeks before and after. Thanks to the Nd:YAG laser and CSC, Splendor X is safe even for moderately tanned skin." },
      },
    ],
  },

  // ─── HYDRAFACIAL ──────────────────────────────────────────────────────────
  {
    slug: "hydrafacial",
    summary: {
      uk: "HydraFacial у GENEVITY — медична гідродермабразія з одночасним очищенням, ексфоліацією, пілінгом, зволоженням та живленням шкіри. Протокол Signature, Deluxe або Platinum — обирається за типом шкіри і завданням.",
      ru: "HydraFacial в GENEVITY — медицинская гидродермабразия с одновременным очищением, эксфолиацией, пилингом, увлажнением и питанием кожи. Протокол Signature, Deluxe или Platinum — выбирается по типу кожи и задаче.",
      en: "HydraFacial at GENEVITY — medical hydrodermabrasion with simultaneous cleansing, exfoliation, peeling, hydration, and nourishment. Signature, Deluxe, or Platinum protocol — selected by skin type and goal.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "HydraFacial — гідродермабразія без дискомфорту", ru: "HydraFacial — гидродермабразия без дискомфорта", en: "HydraFacial — Hydrodermabrasion Without Discomfort" },
        body: {
          uk: "HydraFacial — запатентована система гідродермабразії американської компанії Edge Systems. Унікальний спіральний наконечник Vortex-Fusion одночасно виконує чотири дії: механічну ексфоліацію, від'ємний тиск для вакуумного чищення пор, хімічний пілінг і інфузію активних сироваток. Завдяки цьому вся процедура займає 30–60 хвилин без болю, почервоніння й лущення — шкіра виглядає сяючою і зволоженою одразу після кабінету. Доступні три рівні протоколів: Signature (базова гідродермабразія), Deluxe (+ бустер за показаннями: антиоксидант, освітлення, антивік або заспокоєння), Platinum (+ лімфодренаж і LED-терапія). Процедура є бенчмарком для підготовки шкіри перед важливими подіями.",
          ru: "HydraFacial — запатентованная система гидродермабразии американской компании Edge Systems. Уникальный спиральный наконечник Vortex-Fusion одновременно выполняет четыре действия: механическую эксфолиацию, отрицательное давление для вакуумной чистки пор, химический пилинг и инфузию активных сывороток. Благодаря этому вся процедура занимает 30–60 минут без боли, покраснения и шелушения — кожа выглядит сияющей и увлажнённой сразу после кабинета. Доступны три уровня протоколов: Signature (базовая гидродермабразия), Deluxe (+ бустер по показаниям: антиоксидант, осветление, антивозраст или успокоение), Platinum (+ лимфодренаж и LED-терапия). Процедура является бенчмарком для подготовки кожи перед важными событиями.",
          en: "HydraFacial is a patented hydrodermabrasion system by Edge Systems. The unique Vortex-Fusion spiral tip simultaneously performs four actions: mechanical exfoliation, negative pressure for vacuum pore cleansing, chemical peeling, and active serum infusion. The entire procedure takes 30–60 minutes with no pain, redness, or flaking — skin looks radiant and hydrated immediately after the session. Three protocol levels are available: Signature (basic hydrodermabrasion), Deluxe (+ booster as indicated: antioxidant, brightening, anti-aging, or calming), Platinum (+ lymphatic drainage and LED therapy). The procedure is the benchmark for skin preparation before important events.",
        },
        calloutBody: {
          uk: "HydraFacial можна робити в будь-яку пору року, включаючи літо. Немає реабілітаційного periodу — ідеально напередодні будь-якої події.",
          ru: "HydraFacial можно делать в любое время года, включая лето. Нет реабилитационного периода — идеально накануне любого события.",
          en: "HydraFacial can be done any time of year, including summer. No rehabilitation period — perfect before any event.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до HydraFacial", ru: "Показания к HydraFacial", en: "Indications for HydraFacial" },
        indications: [
          { uk: "Жирна та комбінована шкіра з розширеними порами і комедонами", ru: "Жирная и комбинированная кожа с расширенными порами и комедонами", en: "Oily and combination skin with enlarged pores and comedones" },
          { uk: "Тьмяна шкіра, нерівний тон і постзапальна пігментація", ru: "Тусклая кожа, неровный тон и постовоспалительная пигментация", en: "Dull skin, uneven tone, and post-inflammatory pigmentation" },
          { uk: "Зневоднена і суха шкіра будь-якого типу і віку", ru: "Обезвоженная и сухая кожа любого типа и возраста", en: "Dehydrated and dry skin of any type and age" },
          { uk: "Перша ознаки старіння: поверхневі зморшки, птоз", ru: "Первые признаки старения: поверхностные морщины, птоз", en: "First signs of aging: fine lines, early ptosis" },
          { uk: "Підготовка до важливої події (швидкий wow-ефект за день-два)", ru: "Подготовка к важному событию (быстрый wow-эффект за день-два)", en: "Preparation for an important event (quick wow effect in 1–2 days)" },
          { uk: "Підтримувальний догляд 1 раз на місяць для будь-якого типу шкіри", ru: "Поддерживающий уход 1 раз в месяц для любого типа кожи", en: "Monthly maintenance care for any skin type" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Активні запальні висипання (пустули, папули стадії запалення)", ru: "Активные воспалительные высыпания (пустулы, папулы в стадии воспаления)", en: "Active inflammatory eruptions (pustules, papules in inflamed stage)" },
          { uk: "Розацеа у стадії загострення", ru: "Розацеа в стадии обострения", en: "Rosacea in acute stage" },
          { uk: "Активний герпес або відкриті рани у зоні обробки", ru: "Активный герпес или открытые раны в зоне обработки", en: "Active herpes or open wounds in the treatment area" },
          { uk: "Алергія на компоненти сироваток (уточнюється на консультації)", ru: "Аллергия на компоненты сывороток (уточняется на консультации)", en: "Allergy to serum components (clarified at consultation)" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура HydraFacial", ru: "Как проходит процедура HydraFacial", en: "HydraFacial Procedure Steps" },
        steps: [
          {
            title: { uk: "Очищення і підготовка шкіри", ru: "Очищение и подготовка кожи", en: "Cleansing and Skin Preparation" },
            description: { uk: "Лікар демакіює та очищує шкіру, оцінює тип і стан, підбирає протокол і бустер.", ru: "Врач демакиирует и очищает кожу, оценивает тип и состояние, подбирает протокол и бустер.", en: "The physician removes makeup, cleanses skin, assesses type and condition, and selects the protocol and booster." },
          },
          {
            title: { uk: "Ексфоліація і вакуумне чищення пор", ru: "Эксфолиация и вакуумная чистка пор", en: "Exfoliation and Vacuum Pore Cleansing" },
            description: { uk: "Наконечник Vortex-Fusion видаляє ороговілі клітини і одночасно всмоктує вміст пор, не спричиняючи мікротравм.", ru: "Наконечник Vortex-Fusion удаляет ороговевшие клетки и одновременно всасывает содержимое пор, не вызывая микротравм.", en: "The Vortex-Fusion tip removes keratinized cells while simultaneously suctioning pore contents — without microdamage." },
          },
          {
            title: { uk: "Хімічний пілінг і кислотна інфузія", ru: "Химический пилинг и кислотная инфузия", en: "Chemical Peeling and Acid Infusion" },
            description: { uk: "Суміш гліколевої і саліцилової кислот активно відновлює поверхню дерми. Потужний вакуум нейтралізує реакцію та видаляє відмерлий шар.", ru: "Смесь гликолевой и салициловой кислот активно обновляет поверхность дермы. Мощный вакуум нейтрализует реакцию и удаляет отмерший слой.", en: "A glycolic and salicylic acid blend actively resurfaces the dermis. Powerful vacuum neutralizes the reaction and removes the dead layer." },
          },
          {
            title: { uk: "Інфузія активних сироваток (Vortex-Boost)", ru: "Инфузия активных сывороток (Vortex-Boost)", en: "Active Serum Infusion (Vortex-Boost)" },
            description: { uk: "У підготовлену шкіру вводять пептиди, гіалуронову кислоту, антиоксиданти або освітлюючий комплекс залежно від обраного бустера.", ru: "В подготовленную кожу вводят пептиды, гиалуроновую кислоту, антиоксиданты или осветляющий комплекс в зависимости от выбранного бустера.", en: "Peptides, hyaluronic acid, antioxidants, or a brightening complex are infused into the prepared skin depending on the selected booster." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості HydraFacial", ru: "Преимущества и особенности HydraFacial", en: "HydraFacial Advantages and Considerations" },
        items: [
          { uk: "Результат помітний одразу: сяяння, зволоженість і чистота шкіри", ru: "Результат заметен сразу: сияние, увлажнённость и чистота кожи", en: "Results visible immediately: glow, hydration, and skin clarity" },
          { uk: "Немає почервоніння, болю і реабілітації — ідеально перед виходом у світ", ru: "Нет покраснения, боли и реабилитации — идеально перед выходом в свет", en: "No redness, pain, or downtime — perfect before a social event" },
          { uk: "Підходить для всіх типів шкіри та будь-якого сезону, включаючи літо", ru: "Подходит для всех типов кожи и любого сезона, включая лето", en: "Suitable for all skin types and any season including summer" },
          { uk: "Три рівні протоколів — обирається під конкретне завдання клієнта", ru: "Три уровня протоколов — выбирается под конкретную задачу клиента", en: "Three protocol levels — selected for the client's specific goal" },
          { uk: "⚠ Ефект тимчасовий без регулярних процедур — оптимально раз на 4–6 тижнів", ru: "⚠ Эффект временный без регулярных процедур — оптимально раз в 4–6 недель", en: "⚠ Effect is temporary without regular procedures — optimal every 4–6 weeks" },
          { uk: "⚠ При активному вугровому висипанні процедура не проводиться — спочатку лікування", ru: "⚠ При активном угревом высыпании процедура не проводится — сначала лечение", en: "⚠ Active acne breakout must be treated first — procedure is not done during inflammation" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "HydraFacial і звичне чищення обличчя — в чому різниця?", ru: "HydraFacial и обычная чистка лица — в чём разница?", en: "HydraFacial vs regular facial cleansing — what is the difference?" },
        answer: { uk: "Звичне механічне чищення чистить пори, але не зволожує і не харчує. HydraFacial одночасно очищає, пілінгує, зволожує і насичує активними компонентами — без дискомфорту і почервоніння.", ru: "Обычная механическая чистка чистит поры, но не увлажняет и не питает. HydraFacial одновременно очищает, пилингует, увлажняет и насыщает активными компонентами — без дискомфорта и покраснения.", en: "Regular mechanical cleansing cleans pores but doesn't hydrate or nourish. HydraFacial simultaneously cleanses, peels, hydrates, and infuses active ingredients — without discomfort or redness." },
      },
      {
        question: { uk: "Як часто можна робити HydraFacial?", ru: "Как часто можно делать HydraFacial?", en: "How often can HydraFacial be done?" },
        answer: { uk: "Для підтримки результату — раз на 4–6 тижнів. Перед важливою подією — за 1–2 дні. Курс 4–6 процедур можна комбінувати з іншими методиками.", ru: "Для поддержания результата — раз в 4–6 недель. Перед важным событием — за 1–2 дня. Курс 4–6 процедур можно комбинировать с другими методиками.", en: "For maintaining results — every 4–6 weeks. Before an important event — 1–2 days before. A course of 4–6 procedures can be combined with other treatments." },
      },
      {
        question: { uk: "Чи можна зробити HydraFacial влітку або після засмаги?", ru: "Можно ли сделать HydraFacial летом или после загара?", en: "Can HydraFacial be done in summer or after tanning?" },
        answer: { uk: "Так, без обмежень. На відміну від лазерних процедур, HydraFacial не має фотосенсибілізуючого ефекту і не потребує уникання сонця.", ru: "Да, без ограничений. В отличие от лазерных процедур, HydraFacial не имеет фотосенсибилизирующего эффекта и не требует избегания солнца.", en: "Yes, without restrictions. Unlike laser procedures, HydraFacial has no photosensitizing effect and doesn't require sun avoidance." },
      },
    ],
  },

  // ─── ACUPULSE CO₂ ─────────────────────────────────────────────────────────
  {
    slug: "acupulse-co2",
    summary: {
      uk: "AcuPulse CO₂ від Lumenis у GENEVITY — найпотужніший апаратний метод омолодження обличчя і корекції рубців. Фракційний СО₂-лазер видаляє верхній шар епідермісу і стимулює масштабний неоколагеногенез — ефект операційного ліфтингу без скальпеля.",
      ru: "AcuPulse CO₂ от Lumenis в GENEVITY — самый мощный аппаратный метод омоложения лица и коррекции рубцов. Фракционный СО₂-лазер удаляет верхний слой эпидермиса и стимулирует масштабный неоколлагеногенез — эффект операционного лифтинга без скальпеля.",
      en: "AcuPulse CO₂ by Lumenis at GENEVITY — the most powerful device-based facial rejuvenation and scar correction method. Fractional CO₂ laser removes the upper epidermal layer and stimulates large-scale neocollagenogenesis — surgical lifting effect without a scalpel.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "AcuPulse CO₂ — фракційний лазер для глибокого омолодження", ru: "AcuPulse CO₂ — фракционный лазер для глубокого омоложения", en: "AcuPulse CO₂ — Fractional Laser for Deep Rejuvenation" },
        body: {
          uk: "AcuPulse CO₂ — преміальна система фракційного вуглекислотного лазера від Lumenis із найдовшою підтвердженою ефективністю у дерматології. Лазер на довжині хвилі 10 600 нм поглинається водою у клітинах тканин, вибухово випаровуючи їх у мікроколонках діаметром 120–300 мкм. Між цими мікрозонами аблації залишаються «острівці» незайманої тканини, звідки відбувається швидка репарація. Саме ця зонова архітектура — фракційний принцип — дає змогу добитися аблятивного ефекту (повне видалення епідермісу в зоні) при значно коротшому відновлювальному periodі (5–7 днів), ніж при суцільному CO₂-шліфуванні (3–4 тижні). Результат: глибоке ремоделювання дерми, корекція рубців, різке скорочення зморшок, підтяжка і вирівнювання рельєфу шкіри — ефект, який у комплексі не дає жодна ін'єкційна або неаблятивна методика.",
          ru: "AcuPulse CO₂ — премиальная система фракционного углекислотного лазера от Lumenis с наидлиннейшей подтверждённой эффективностью в дерматологии. Лазер на длине волны 10 600 нм поглощается водой в клетках тканей, взрывообразно испаряя их в микроколонках диаметром 120–300 мкм. Между этими микрозонами аблации остаются «островки» нетронутой ткани, откуда происходит быстрая репарация. Именно эта зонная архитектура — фракционный принцип — позволяет добиться аблятивного эффекта (полное удаление эпидермиса в зоне) при значительно более коротком восстановительном периоде (5–7 дней), чем при сплошном CO₂-шлифовании (3–4 недели). Результат: глубокое ремоделирование дермы, коррекция рубцов, резкое сокращение морщин, подтяжка и выравнивание рельефа кожи — эффект, который в комплексе не даёт ни одна инъекционная или неаблятивная методика.",
          en: "AcuPulse CO₂ is Lumenis's premium fractional carbon dioxide laser system with the longest confirmed efficacy record in dermatology. The 10,600 nm laser is absorbed by water in tissue cells, explosively vaporizing them in micro-columns 120–300 μm in diameter. Between these micro-ablation zones, 'islands' of intact tissue remain for rapid repair. This zonal architecture — the fractional principle — enables an ablative effect (complete epidermal removal in the zone) with a significantly shorter recovery period (5–7 days) than full-field CO₂ resurfacing (3–4 weeks). The result: deep dermal remodeling, scar correction, dramatic wrinkle reduction, lifting, and skin texture evening — an effect unmatched by any injectable or non-ablative method.",
        },
        calloutBody: {
          uk: "AcuPulse CO₂ — вибір для тих, хто хоче максимального результату за одну процедуру. Одна повноформатна сесія дає ефект, порівнянний з 5–7 неаблятивними лазерними процедурами.",
          ru: "AcuPulse CO₂ — выбор для тех, кто хочет максимального результата за одну процедуру. Одна полноформатная сессия даёт эффект, сопоставимый с 5–7 неаблятивными лазерными процедурами.",
          en: "AcuPulse CO₂ — the choice for those who want maximum results in one procedure. One full-format session delivers an effect comparable to 5–7 non-ablative laser procedures.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до AcuPulse CO₂", ru: "Показания к AcuPulse CO₂", en: "Indications for AcuPulse CO₂" },
        indications: [
          { uk: "Глибокі зморшки і носогубні складки", ru: "Глубокие морщины и носогубные складки", en: "Deep wrinkles and nasolabial folds" },
          { uk: "Рубці після вугрів (атрофічні: icepick, rolling, boxcar)", ru: "Рубцы после угрей (атрофические: icepick, rolling, boxcar)", en: "Post-acne scars (atrophic: icepick, rolling, boxcar)" },
          { uk: "Розтяжки (striae distensae) на обличчі, шиї, декольте", ru: "Растяжки (striae distensae) на лице, шее, декольте", en: "Stretch marks (striae distensae) on face, neck, décolletage" },
          { uk: "Значна втрата тонусу і птоз м'яких тканин обличчя", ru: "Значительная потеря тонуса и птоз мягких тканей лица", en: "Significant loss of tone and soft tissue facial ptosis" },
          { uk: "Нерівний рельєф і текстура шкіри після акне або травм", ru: "Неровный рельеф и текстура кожи после акне или травм", en: "Uneven skin surface and texture after acne or trauma" },
          { uk: "Доброякісні новоутворення шкіри (папіломи, кератоми — за показаннями лікаря)", ru: "Доброкачественные новообразования кожи (папилломы, кератомы — по показаниям врача)", en: "Benign skin lesions (papillomas, keratomas — as indicated by the physician)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "IV–VI фототип шкіри (ризик поствогнищевої гіперпігментації)", ru: "IV–VI фототип кожи (риск постоочаговой гиперпигментации)", en: "Skin phototype IV–VI (post-inflammatory hyperpigmentation risk)" },
          { uk: "Активний герпес або відкриті рани у зоні", ru: "Активный герпес или открытые раны в зоне", en: "Active herpes or open wounds in the area" },
          { uk: "Системний прийом ретиноїдів протягом останніх 6 місяців", ru: "Системный приём ретиноидов в течение последних 6 месяцев", en: "Systemic retinoid use in the last 6 months" },
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Схильність до гіпертрофічних рубців і келоїдів", ru: "Склонность к гипертрофическим рубцам и келоидам", en: "Tendency to hypertrophic scars and keloids" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура AcuPulse CO₂", ru: "Как проходит процедура AcuPulse CO₂", en: "AcuPulse CO₂ Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація та фотодокументація", ru: "Консультация и фотодокументация", en: "Consultation and Photo Documentation" },
            description: { uk: "Лікар оцінює стан шкіри, глибину рубців і зморшок, фотодокументує стан до процедури та обговорює очікування.", ru: "Врач оценивает состояние кожи, глубину рубцов и морщин, фотодокументирует состояние до процедуры и обсуждает ожидания.", en: "The physician assesses skin condition, scar and wrinkle depth, photo-documents pre-procedure state, and discusses expectations." },
          },
          {
            title: { uk: "Підготовка: крем-анестетик та обробка шкіри", ru: "Подготовка: крем-анестетик и обработка кожи", en: "Preparation: Anesthetic Cream and Skin Preparation" },
            description: { uk: "За 30–60 хвилин до процедури наносять EMLA або аналог. Шкіру ретельно очищують від залишків крему та косметики перед лазерним впливом.", ru: "За 30–60 минут до процедуры наносят EMLA или аналог. Кожу тщательно очищают от остатков крема и косметики перед лазерным воздействием.", en: "EMLA or equivalent is applied 30–60 minutes before. Skin is thoroughly cleansed of cream and cosmetic residue before laser treatment." },
          },
          {
            title: { uk: "Фракційна лазерна обробка по протоколу", ru: "Фракционная лазерная обработка по протоколу", en: "Fractional Laser Treatment per Protocol" },
            description: { uk: "Лікар обробляє зони послідовно, контролюючи глибину аблації. Процедура займає 30–90 хвилин залежно від площі та протоколу.", ru: "Врач последовательно обрабатывает зоны, контролируя глубину аблации. Процедура занимает 30–90 минут в зависимости от площади и протокола.", en: "The physician treats zones sequentially, monitoring ablation depth. Duration: 30–90 minutes depending on area and protocol." },
          },
          {
            title: { uk: "Відновлення: 5–7 днів реабілітації", ru: "Восстановление: 5–7 дней реабилитации", en: "Recovery: 5–7 Days of Rehabilitation" },
            description: { uk: "Лікар призначає схему відновлювального догляду (зволожуючі маски, антибактеріальна мазь). Соціальна реабілітація — через 5–7 днів, захисний SPF — 4–8 тижнів.", ru: "Врач назначает схему восстановительного ухода (увлажняющие маски, антибактериальная мазь). Социальная реабилитация — через 5–7 дней, защитный SPF — 4–8 недель.", en: "The physician prescribes a recovery care regimen (hydrating masks, antibacterial ointment). Social rehabilitation — in 5–7 days, protective SPF — 4–8 weeks." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості AcuPulse CO₂", ru: "Преимущества и особенности AcuPulse CO₂", en: "AcuPulse CO₂ Advantages and Considerations" },
        items: [
          { uk: "Максимальний омолоджувальний ефект серед усіх неінвазивних методик — за одну процедуру", ru: "Максимальный омолаживающий эффект среди всех неинвазивных методик — за одну процедуру", en: "Maximum rejuvenating effect among all non-invasive methods — in one procedure" },
          { uk: "Ефективна корекція глибоких постакне-рубців і розтяжок", ru: "Эффективная коррекция глубоких постакне-рубцов и растяжек", en: "Effective correction of deep post-acne scars and stretch marks" },
          { uk: "Фракційний принцип скорочує реабілітацію до 5–7 днів (vs 3–4 тиж у класичного CO₂)", ru: "Фракционный принцип сокращает реабилитацию до 5–7 дней (vs 3–4 нед у классического CO₂)", en: "Fractional principle shortens recovery to 5–7 days (vs 3–4 weeks for classic CO₂)" },
          { uk: "Тривалий результат: максимальний ефект проявляється через 3–6 місяців і зберігається роками", ru: "Длительный результат: максимальный эффект проявляется через 3–6 месяцев и сохраняется годами", en: "Long-lasting result: maximum effect manifests in 3–6 months and lasts for years" },
          { uk: "⚠ Обов'язкова реабілітація 5–7 днів — плануйте з урахуванням робочого графіку", ru: "⚠ Обязательная реабилитация 5–7 дней — планируйте с учётом рабочего графика", en: "⚠ Mandatory 5–7 day rehabilitation — plan according to your work schedule" },
          { uk: "⚠ Не підходить для темних фототипів IV–VI — підвищений ризик гіперпігментації", ru: "⚠ Не подходит для тёмных фототипов IV–VI — повышенный риск гиперпигментации", en: "⚠ Not suitable for dark phototypes IV–VI — elevated hyperpigmentation risk" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Скільки часу займає відновлення після AcuPulse CO₂?", ru: "Сколько времени занимает восстановление после AcuPulse CO₂?", en: "How long is the recovery after AcuPulse CO₂?" },
        answer: { uk: "5–7 днів активного загоєння (почервоніння, набряк, кірочки). Соціально активний вигляд — через 7–10 днів. Повний косметичний результат — через 3–6 місяців.", ru: "5–7 дней активного заживления (покраснение, отёк, корочки). Социально активный вид — через 7–10 дней. Полный косметический результат — через 3–6 месяцев.", en: "5–7 days of active healing (redness, swelling, crusting). Socially acceptable appearance — in 7–10 days. Full cosmetic result — in 3–6 months." },
      },
      {
        question: { uk: "AcuPulse CO₂ чи RF-ліфтинг (EMFACE/EXION) — що вибрати?", ru: "AcuPulse CO₂ или RF-лифтинг (EMFACE/EXION) — что выбрать?", en: "AcuPulse CO₂ or RF lifting (EMFACE/EXION) — which to choose?" },
        answer: { uk: "AcuPulse CO₂ — аблятивний метод з реабілітацією: максимальний ефект за одну процедуру. RF-технології (EMFACE, EXION) — неаблятивні, без відновлювального periodу, результат накопичується поступово. Вибір залежить від глибини завдання і готовності до реабілітації.", ru: "AcuPulse CO₂ — аблятивный метод с реабилитацией: максимальный эффект за одну процедуру. RF-технологии (EMFACE, EXION) — неаблятивные, без восстановительного периода, результат накапливается постепенно. Выбор зависит от глубины задачи и готовности к реабилитации.", en: "AcuPulse CO₂ is an ablative method with recovery: maximum effect in one procedure. RF technologies (EMFACE, EXION) are non-ablative, no downtime, gradual results. The choice depends on the depth of the goal and willingness to have downtime." },
      },
      {
        question: { uk: "Скільки процедур AcuPulse CO₂ потрібно?", ru: "Сколько процедур AcuPulse CO₂ нужно?", en: "How many AcuPulse CO₂ procedures are needed?" },
        answer: { uk: "Зазвичай 1 процедура на рік при повному протоколі. Для глибоких рубців — 2–3 процедури з інтервалом 3–6 місяців.", ru: "Обычно 1 процедура в год при полном протоколе. Для глубоких рубцов — 2–3 процедуры с интервалом 3–6 месяцев.", en: "Usually 1 procedure per year with a full protocol. For deep scars — 2–3 procedures every 3–6 months." },
      },
    ],
  },
];

async function main() {
  for (const svc of SERVICES) {
    const rows = await sql<{ id: string }[]>`SELECT id FROM services WHERE slug = ${svc.slug} LIMIT 1`;
    if (!rows.length) { console.warn(`⚠ slug not found: ${svc.slug}`); continue; }
    const serviceId = rows[0].id;

    await sql`UPDATE services SET summary_uk = ${svc.summary.uk}, summary_ru = ${svc.summary.ru}, summary_en = ${svc.summary.en} WHERE id = ${serviceId}`;
    await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${serviceId}`;
    await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${serviceId}`;

    const sectionIds: string[] = [];
    for (let i = 0; i < svc.sections.length; i++) {
      const sec = svc.sections[i];
      const id = randomUUID();
      const data = sectionData(sec);
      await sql`
        INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
        VALUES(${id}, 'service', ${serviceId}, ${i}, ${sec.type}::section_type, ${JSON.stringify(data)}::jsonb)
      `;
      sectionIds.push(`section:${id}`);
    }

    for (let i = 0; i < svc.faq.length; i++) {
      const f = svc.faq[i];
      await sql`
        INSERT INTO faq_items(owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
        VALUES('service', ${serviceId}, ${i}, ${f.question.uk}, ${f.question.ru}, ${f.question.en}, ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en})
      `;
    }

    const blockOrder = [...sectionIds, "faq", "doctors", "equipment", "relatedServices", "finalCTA"];
    await sql`UPDATE services SET block_order = ${blockOrder} WHERE id = ${serviceId}`;

    console.log(`✓ ${svc.slug} — [${svc.sections.map((s) => s.type).join(", ")}], ${svc.faq.length} FAQs`);
  }
  await sql.end();
  console.log("\nV3c-v2 DONE — M22 Stellar Black, Splendor X, HydraFacial, AcuPulse CO₂ re-seeded with section variety.");
}

main().catch((e) => { console.error(e); process.exit(1); });
