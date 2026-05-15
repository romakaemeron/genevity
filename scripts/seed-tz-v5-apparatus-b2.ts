/**
 * TZ-compliant seed: apparatus services batch B2
 * Services: splendor-x, hydrafacial, acupulse-co2
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
type Section =
  | { type: "richText"; heading: L; body: L }
  | { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] }
  | { type: "callout"; tone: "info" | "warning" | "success"; body: L }
  | { type: "steps"; heading: L; steps: { title: L; body: L }[] }
  | { type: "bullets"; heading: L; items: L[] }
  | { type: "imageGallery"; heading: L; images: { url: string; alt: string }[] }
  | { type: "cta"; heading: L; body: L; ctaLabel: L; ctaHref: string };

function sectionData(s: Section): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "callout") return { tone: s.tone, body: s.body };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  if (s.type === "imageGallery") return { heading: s.heading, images: s.images };
  if (s.type === "cta") return { heading: s.heading, body: s.body, ctaLabel: s.ctaLabel, ctaHref: s.ctaHref };
  return {};
}

interface ServiceSeed { slug: string; sections: Section[]; faqs: { question: L; answer: L }[]; }

const interior = [
  { url: "/images/interior/SEMI1276-HDR.webp", alt: "Кабінет GENEVITY" },
  { url: "/images/interior/SEMI1662-HDR.webp", alt: "Клініка GENEVITY" },
  { url: "/images/interior/SEMI7509.webp", alt: "Процедурний кабінет GENEVITY" },
];

const services: ServiceSeed[] = [
  // ─── 24. Splendor X ──────────────────────────────────────────────────────
  {
    slug: "splendor-x",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Splendor X — лазерна епіляція для всіх типів шкіри в GENEVITY",
          ru: "Splendor X — лазерная эпиляция для всех типов кожи в GENEVITY",
          en: "Splendor X — Laser Hair Removal for All Skin Types at GENEVITY",
        },
        body: {
          uk: "Splendor X від Lumenis — лазерний апарат нового покоління для епіляції, що поєднує Nd:YAG 1064 нм та Alexandrite 755 нм лазери в одній системі. Унікальна технологія BLEND X® дозволяє синхронно подавати обидва випромінювання в налаштованих пропорціях, що забезпечує ефективне знищення волосяних фолікулів при будь-якому типі та кольорі шкіри — від I до VI за Фіцпатріком.\n\nПереваги лазерної епіляції Splendor X перед традиційними методами (шугаринг, воскова депіляція, електроепіляція):\n— Постійний результат: після повного курсу 80–95% волосся видаляється назавжди\n— Безпека для засмаглої та темної шкіри завдяки Nd:YAG 1064 нм компоненті\n— Охолоджуваний наконечник виключає опіки та знижує дискомфорт\n— Обробка великих зон (спина, ноги) за 20–30 хвилин\n\nSplendor X підходить для всіх зон тіла: обличчя (верхня губа, підборіддя, щоки), пахви, бікіні (класичне та глибоке), ноги (коліна, гомілки, стегна), руки, спина, груди. Зони на обличчі та інтимні зони обробляються тими самими налаштуваннями безпеки, що й великі ділянки тіла.\n\nВ GENEVITY процедура виконується сертифікованими лікарями на оригінальному обладнанні Lumenis. Перед курсом проводиться консультація з визначенням типу шкіри та волосся, виключенням протипоказань та розрахунком кількості необхідних сеансів.",
          ru: "Splendor X от Lumenis — лазерный аппарат нового поколения для эпиляции, сочетающий Nd:YAG 1064 нм и Alexandrite 755 нм лазеры в одной системе. Уникальная технология BLEND X® позволяет синхронно подавать оба излучения в настраиваемых пропорциях, что обеспечивает эффективное уничтожение волосяных фолликулов при любом типе и цвете кожи — от I до VI по Фицпатрику.\n\nПреимущества лазерной эпиляции Splendor X перед традиционными методами (шугаринг, восковая депиляция, электроэпиляция):\n— Постоянный результат: после полного курса 80–95% волос удаляется навсегда\n— Безопасность для загорелой и тёмной кожи благодаря Nd:YAG 1064 нм компоненте\n— Охлаждаемый наконечник исключает ожоги и снижает дискомфорт\n— Обработка крупных зон (спина, ноги) за 20–30 минут\n\nSplendor X подходит для всех зон тела: лицо (верхняя губа, подбородок, щёки), подмышки, бикини (классическое и глубокое), ноги (колени, голени, бёдра), руки, спина, грудь. Зоны на лице и интимные зоны обрабатываются с теми же настройками безопасности, что и крупные участки тела.\n\nВ GENEVITY процедура выполняется сертифицированными врачами на оригинальном оборудовании Lumenis. Перед курсом проводится консультация с определением типа кожи и волос, исключением противопоказаний и расчётом количества необходимых сеансов.",
          en: "Splendor X by Lumenis is a next-generation laser hair removal system combining Nd:YAG 1064 nm and Alexandrite 755 nm lasers in one device. The unique BLEND X® technology synchronously delivers both wavelengths in adjustable proportions, ensuring effective destruction of hair follicles on all skin types and tones — Fitzpatrick I through VI.\n\nAdvantages of Splendor X laser hair removal over traditional methods (sugaring, wax, electrolysis):\n— Permanent results: after a full course 80–95% of hair is eliminated permanently\n— Safe for tanned and dark skin due to the Nd:YAG 1064 nm component\n— Cooled handpiece prevents burns and reduces discomfort\n— Large zones (back, legs) treated in 20–30 minutes\n\nSplendor X is suitable for all body zones: face (upper lip, chin, cheeks), underarms, bikini (standard and deep), legs (knees, calves, thighs), arms, back, chest. Facial and intimate zones are treated with the same safety settings as large body areas.\n\nAt GENEVITY the procedure is performed by certified doctors on original Lumenis equipment. A pre-course consultation determines skin and hair type, rules out contraindications, and calculates the required number of sessions.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до Splendor X", ru: "Показания к Splendor X", en: "Indications for Splendor X" },
        indications: [
          { uk: "Небажане волосся на будь-якій ділянці тіла та обличчя", ru: "Нежелательные волосы на любом участке тела и лица", en: "Unwanted hair on any body area or face" },
          { uk: "Вростаюче волосся та подразнення після гоління або шугарингу", ru: "Вросшие волосы и раздражение после бритья или шугаринга", en: "Ingrown hairs and irritation after shaving or sugaring" },
          { uk: "Гіпертрихоз та надмірний ріст волосся гормональної природи", ru: "Гипертрихоз и избыточный рост волос гормональной природы", en: "Hypertrichosis and hormone-related excessive hair growth" },
          { uk: "Бажання позбутися регулярної депіляції назавжди", ru: "Желание навсегда избавиться от регулярной депиляции", en: "Desire to permanently eliminate regular hair removal routines" },
          { uk: "Підходить для всіх типів шкіри, включаючи засмаглу та темну (тип IV–VI)", ru: "Подходит для всех типов кожи, включая загорелую и тёмную (тип IV–VI)", en: "Suitable for all skin types including tanned and dark (type IV–VI)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Сильна свіжа засмага (менше 2 тижнів до процедури)", ru: "Сильный свежий загар (менее 2 недель до процедуры)", en: "Heavy recent tan (less than 2 weeks before procedure)" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Прийом фотосенсибілізуючих препаратів та ретиноїдів", ru: "Приём фотосенсибилизирующих препаратов и ретиноидов", en: "Use of photosensitising drugs and retinoids" },
          { uk: "Онкологічні захворювання та схильність до келоїдів", ru: "Онкологические заболевания и склонность к келоидам", en: "Active oncological conditions and keloid tendency" },
          { uk: "Активне запалення та герпес у зоні обробки", ru: "Активное воспаление и герпес в зоне обработки", en: "Active inflammation or herpes in the treatment area" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Splendor X — єдиний лазер з технологією BLEND X®, який безпечно проводить епіляцію навіть на засмаглій та темній шкірі (тип IV–VI за Фіцпатріком).",
          ru: "Splendor X — единственный лазер с технологией BLEND X®, который безопасно проводит эпиляцию даже на загорелой и тёмной коже (тип IV–VI по Фицпатрику).",
          en: "Splendor X is the only laser with BLEND X® technology that safely performs hair removal even on tanned and dark skin (Fitzpatrick type IV–VI).",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить лазерна епіляція Splendor X", ru: "Как проходит лазерная эпиляция Splendor X", en: "How Splendor X Laser Hair Removal Works" },
        steps: [
          {
            title: { uk: "Консультація та діагностика шкіри", ru: "Консультация и диагностика кожи", en: "Consultation and skin assessment" },
            body: { uk: "Лікар визначає тип шкіри та волосся, підбирає оптимальне поєднання хвиль Nd:YAG/Alex, розраховує кількість сеансів.", ru: "Врач определяет тип кожи и волос, подбирает оптимальное сочетание волн Nd:YAG/Alex, рассчитывает количество сеансов.", en: "The doctor determines skin and hair type, selects the optimal Nd:YAG/Alex wavelength combination, and calculates the number of sessions." },
          },
          {
            title: { uk: "Підготовка до процедури", ru: "Подготовка к процедуре", en: "Pre-procedure preparation" },
            body: { uk: "За 1–2 доби до сеансу збрити зону (не вощити). Не загоряти 2 тижні. Уникати скрабів 3 доби.", ru: "За 1–2 суток до сеанса побрить зону (не восковать). Не загорать 2 недели. Избегать скрабов 3 суток.", en: "Shave the zone 1–2 days before (do not wax). No tanning 2 weeks before. Avoid scrubs for 3 days." },
          },
          {
            title: { uk: "Процедура (10–60 хвилин залежно від зони)", ru: "Процедура (10–60 минут в зависимости от зоны)", en: "Treatment (10–60 minutes depending on zone)" },
            body: { uk: "Лікар обробляє зону лазером. Вбудоване охолодження виключає опіки. Відчуття — легке тепло та поколювання.", ru: "Врач обрабатывает зону лазером. Встроенное охлаждение исключает ожоги. Ощущения — лёгкое тепло и покалывание.", en: "The doctor treats the zone with the laser. Built-in cooling prevents burns. Sensation: mild warmth and tingling." },
          },
          {
            title: { uk: "Догляд після процедури", ru: "Уход после процедуры", en: "Post-procedure care" },
            body: { uk: "Уникати прямого сонця та солярію 2 тижні, наносити SPF50+. Не парити зону 2 доби. Через 10–14 днів волосся «випадає» — це норма.", ru: "Избегать прямого солнца и солярия 2 недели, наносить SPF50+. Не парить зону 2 суток. Через 10–14 дней волосы «выпадают» — это норма.", en: "Avoid direct sun and tanning beds for 2 weeks, apply SPF50+. No steaming for 2 days. After 10–14 days hair 'sheds' — this is normal." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги лазерної епіляції Splendor X", ru: "Преимущества лазерной эпиляции Splendor X", en: "Splendor X Laser Hair Removal Benefits" },
        items: [
          { uk: "BLEND X® — синхронна подача двох хвиль для максимального ефекту на будь-якому типі шкіри", ru: "BLEND X® — синхронная подача двух волн для максимального эффекта на любом типе кожи", en: "BLEND X® — synchronised dual-wavelength delivery for maximum effect on all skin types" },
          { uk: "80–95% волосся видаляється назавжди після повного курсу", ru: "80–95% волос удаляется навсегда после полного курса", en: "80–95% of hair permanently removed after a full course" },
          { uk: "Безпечно для засмаглої та темної шкіри (Фіцпатрік IV–VI)", ru: "Безопасно для загорелой и тёмной кожи (Фицпатрик IV–VI)", en: "Safe for tanned and dark skin (Fitzpatrick IV–VI)" },
          { uk: "Великі зони (ноги, спина) — за 20–30 хвилин", ru: "Крупные зоны (ноги, спина) — за 20–30 минут", en: "Large zones (legs, back) completed in 20–30 minutes" },
          { uk: "Вбудоване охолодження — мінімальний дискомфорт без анестезії", ru: "Встроенное охлаждение — минимальный дискомфорт без анестезии", en: "Built-in cooling — minimal discomfort without anaesthesia" },
          { uk: "⚠ Сіре та руде волосся — знижена ефективність, лікар оцінить очікуваний результат на консультації", ru: "⚠ Седые и рыжие волосы — сниженная эффективность, врач оценит ожидаемый результат на консультации", en: "⚠ Grey and red hair — reduced efficacy; the doctor will assess the expected result at consultation" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Апарат Splendor X та клініка GENEVITY", ru: "Аппарат Splendor X и клиника GENEVITY", en: "Splendor X Device and GENEVITY Clinic" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на лазерну епіляцію Splendor X в Дніпрі", ru: "Запишитесь на лазерную эпиляцию Splendor X в Днепре", en: "Book Splendor X Laser Epilation in Dnipro" },
        body: { uk: "Дізнайтеся ціну на лазерну епіляцію Splendor X та підберіть зони на безкоштовній консультації лікаря.", ru: "Узнайте цену на лазерную эпиляцию Splendor X и подберите зоны на бесплатной консультации врача.", en: "Find out the Splendor X laser hair removal price and select treatment zones at a free doctor consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки сеансів потрібно для досягнення бажаного результату з Splendor X?", ru: "Сколько сеансов нужно для достижения желаемого результата с Splendor X?", en: "How many Splendor X sessions are needed for desired results?" },
        answer: { uk: "Для більшості зон потрібно 6–8 сеансів з інтервалом 4–8 тижнів (залежно від зони та фази росту волосся). Обличчя — 6–8 сеансів, ноги та великі зони — 6–10.", ru: "Для большинства зон нужно 6–8 сеансов с интервалом 4–8 недель (в зависимости от зоны и фазы роста волос). Лицо — 6–8 сеансов, ноги и крупные зоны — 6–10.", en: "Most zones require 6–8 sessions, 4–8 weeks apart (depending on zone and hair growth phase). Face: 6–8 sessions; legs and large zones: 6–10." },
      },
      {
        question: { uk: "Чи безпечна процедура Splendor X для засмаглої шкіри?", ru: "Безопасна ли процедура Splendor X для загорелой кожи?", en: "Is Splendor X safe for tanned skin?" },
        answer: { uk: "Так. Завдяки Nd:YAG 1064 нм компоненті Splendor X є безпечним для засмаглої та темної шкіри (типи IV–VI за Фіцпатріком). Лікар підбере оптимальне поєднання хвиль та потужність, виключаючи ризик пігментних змін.", ru: "Да. Благодаря компоненте Nd:YAG 1064 нм Splendor X безопасен для загорелой и тёмной кожи (типы IV–VI по Фицпатрику). Врач подберёт оптимальное сочетание волн и мощность, исключая риск пигментных изменений.", en: "Yes. Thanks to the Nd:YAG 1064 nm component, Splendor X is safe for tanned and dark skin (Fitzpatrick types IV–VI). The doctor selects the optimal wavelength combination and power, excluding the risk of pigmentation changes." },
      },
      {
        question: { uk: "Які можливі побічні ефекти після лазерної епіляції Splendor X?", ru: "Какие возможные побочные эффекты после лазерной эпиляции Splendor X?", en: "What are the possible side effects after Splendor X laser hair removal?" },
        answer: { uk: "Після процедури можливе тимчасове почервоніння та легка набряклість навколо фолікулів — минає протягом кількох годин. Пігментні зміни виникають лише при порушенні протоколу (засмага, прийом фотосенсибілізаторів).", ru: "После процедуры возможно временное покраснение и лёгкая отёчность вокруг фолликулов — проходит в течение нескольких часов. Пигментные изменения возникают только при нарушении протокола (загар, приём фотосенсибилизаторов).", en: "Temporary redness and mild swelling around follicles after the procedure — resolves within a few hours. Pigmentation changes only occur if the protocol is violated (tanning, photosensitising drugs)." },
      },
    ],
  },

  // ─── 25. HydraFacial ─────────────────────────────────────────────────────
  {
    slug: "hydrafacial",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "HydraFacial — глибоке очищення та зволоження обличчя в GENEVITY",
          ru: "HydraFacial — глубокое очищение и увлажнение лица в GENEVITY",
          en: "HydraFacial — Deep Facial Cleansing and Hydration at GENEVITY",
        },
        body: {
          uk: "HydraFacial — апаратна процедура для комплексного догляду за шкірою обличчя, яка одночасно очищає, відлущує, видобуває забруднення та насичує шкіру активними сироватками. Технологія Vortex Fusion® використовує спіральний потік рідини для одночасного введення живильних речовин та виведення відмерлих клітин та вмісту пор без механічного подразнення.\n\nЧистка обличчя HydraFacial складається з 3 обов'язкових етапів:\n1. Cleanse + Peel — м'яке відлущення та ресурфейсинг за допомогою глюконолактонової кислоти та саліцилової кислоти\n2. Extract + Hydrate — видобування закупорених пор вакуумним відсмоктуванням та одночасне введення гіалуронової кислоти\n3. Fuse + Protect — насичення антиоксидантами, пептидами та гіалуроновою кислотою через технологію Vortex Fusion®\n\nHydraFacial підходить для будь-якого типу шкіри та будь-якого сезону, включаючи літо. Процедура повністю безпечна для чутливої шкіри, шкіри зі схильністю до почервоніння та для пацієнтів з розацеа легкого ступеня.\n\nВ GENEVITY HydraFacial виконується лікарями-косметологами з підбором бустерів (Living Defense, Growth Factor, Britenol або CTGF) відповідно до типу та запиту шкіри. Можливе поєднання з LED-терапією та біоревіталізацією для посиленого ефекту.",
          ru: "HydraFacial — аппаратная процедура для комплексного ухода за кожей лица, которая одновременно очищает, отшелушивает, извлекает загрязнения и насыщает кожу активными сыворотками. Технология Vortex Fusion® использует спиральный поток жидкости для одновременного введения питательных веществ и выведения отмерших клеток и содержимого пор без механического раздражения.\n\nЧистка лица HydraFacial состоит из 3 обязательных этапов:\n1. Cleanse + Peel — мягкое отшелушивание и ресёрфейсинг с помощью глюконолактоновой и салициловой кислот\n2. Extract + Hydrate — извлечение закупоренных пор вакуумным отсасыванием и одновременное введение гиалуроновой кислоты\n3. Fuse + Protect — насыщение антиоксидантами, пептидами и гиалуроновой кислотой через технологию Vortex Fusion®\n\nHydraFacial подходит для любого типа кожи и любого сезона, включая лето. Процедура полностью безопасна для чувствительной кожи, кожи со склонностью к покраснениям и для пациентов с розацеа лёгкой степени.\n\nВ GENEVITY HydraFacial выполняется врачами-косметологами с подбором бустеров (Living Defense, Growth Factor, Britenol или CTGF) в соответствии с типом и запросом кожи. Возможно сочетание с LED-терапией и биоревитализацией для усиленного эффекта.",
          en: "HydraFacial is a device-based comprehensive facial care procedure that simultaneously cleanses, exfoliates, extracts impurities and infuses the skin with active serums. The Vortex Fusion® technology uses a spiral fluid flow to simultaneously introduce nutrients and remove dead cells and pore contents without mechanical irritation.\n\nThe HydraFacial facial cleansing procedure consists of 3 essential steps:\n1. Cleanse + Peel — gentle exfoliation and resurfacing using gluconolactone and salicylic acids\n2. Extract + Hydrate — vacuum-based extraction of clogged pores with simultaneous hyaluronic acid infusion\n3. Fuse + Protect — enrichment with antioxidants, peptides and hyaluronic acid via Vortex Fusion® technology\n\nHydraFacial is suitable for all skin types and all seasons, including summer. The procedure is completely safe for sensitive skin, redness-prone skin and patients with mild rosacea.\n\nAt GENEVITY HydraFacial is performed by cosmetic doctors who select boosters (Living Defense, Growth Factor, Britenol or CTGF) according to each patient's skin type and concerns. Combination with LED therapy and biorevitalisation is available for an enhanced effect.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до HydraFacial", ru: "Показания к HydraFacial", en: "Indications for HydraFacial" },
        indications: [
          { uk: "Забруднені та розширені пори, чорні точки", ru: "Загрязнённые и расширенные поры, чёрные точки", en: "Clogged and enlarged pores, blackheads" },
          { uk: "Зневоднена та тьмяна шкіра, нерівний тон", ru: "Обезвоженная и тусклая кожа, неровный тон", en: "Dehydrated and dull skin, uneven tone" },
          { uk: "Жирна шкіра та схильність до акне (профілактика)", ru: "Жирная кожа и склонность к акне (профилактика)", en: "Oily skin and acne-prone skin (preventive care)" },
          { uk: "Чутлива шкіра, яка потребує делікатного очищення", ru: "Чувствительная кожа, требующая деликатного очищения", en: "Sensitive skin requiring gentle cleansing" },
          { uk: "Підготовка шкіри перед апаратними та ін'єкційними процедурами", ru: "Подготовка кожи перед аппаратными и инъекционными процедурами", en: "Skin preparation before device-based and injectable procedures" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Активні запальні акне (пустули, кісти) в зоні обробки", ru: "Активные воспалительные акне (пустулы, кисты) в зоне обработки", en: "Active inflammatory acne (pustules, cysts) in the treatment area" },
          { uk: "Вагітність та лактація (залежно від складу бустера)", ru: "Беременность и лактация (в зависимости от состава бустера)", en: "Pregnancy and breastfeeding (depending on booster composition)" },
          { uk: "Алергія на компоненти сироватки (уточнюється на консультації)", ru: "Аллергия на компоненты сыворотки (уточняется на консультации)", en: "Allergy to serum components (clarified at consultation)" },
          { uk: "Рожеве акне (розацеа) у стадії загострення", ru: "Розацеа в стадии обострения", en: "Rosacea in active flare" },
          { uk: "Відкриті рани та пошкодження шкіри в зоні обробки", ru: "Открытые раны и повреждения кожи в зоне обработки", en: "Open wounds or skin damage in the treatment area" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "HydraFacial — єдина процедура, яку можна робити цілий рік, включаючи літо та підготовку до важливої події: результат помітний одразу після першого сеансу.",
          ru: "HydraFacial — единственная процедура, которую можна делать круглый год, включая лето и подготовку к важному событию: результат заметен сразу после первого сеанса.",
          en: "HydraFacial is the only procedure that can be performed year-round, including summer and pre-event preparation: results are visible immediately after the first session.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Етапи процедури HydraFacial", ru: "Этапы процедуры HydraFacial", en: "HydraFacial Procedure Steps" },
        steps: [
          {
            title: { uk: "Cleanse + Peel — очищення та відлущення", ru: "Cleanse + Peel — очищение и отшелушивание", en: "Cleanse + Peel — cleansing and exfoliation" },
            body: { uk: "М'яке відлущення глюконолактоновою та саліциловою кислотами розм'якшує та видаляє відмерлі клітини без подразнення. Результат — рівна текстура.", ru: "Мягкое отшелушивание глюконолактоновой и салициловой кислотами размягчает и удаляет отмершие клетки без раздражения. Результат — ровная текстура.", en: "Gentle exfoliation with gluconolactone and salicylic acids softens and removes dead cells without irritation. Result: smooth texture." },
          },
          {
            title: { uk: "Extract + Hydrate — видобування та зволоження", ru: "Extract + Hydrate — извлечение и увлажнение", en: "Extract + Hydrate — extraction and hydration" },
            body: { uk: "Вакуумне відсмоктування видаляє вміст закупорених пор. Одночасно в шкіру вводиться гіалуронова кислота — зволоження зсередини.", ru: "Вакуумное отсасывание удаляет содержимое закупоренных пор. Одновременно в кожу вводится гиалуроновая кислота — увлажнение изнутри.", en: "Vacuum extraction removes clogged pore contents. Hyaluronic acid is simultaneously infused into the skin — hydration from within." },
          },
          {
            title: { uk: "Fuse + Protect — насичення та захист", ru: "Fuse + Protect — насыщение и защита", en: "Fuse + Protect — infusion and protection" },
            body: { uk: "Через технологію Vortex Fusion® у шкіру вводяться антиоксиданти, пептиди та обраний бустер. Шкіра отримує концентрований живильний імпульс.", ru: "Через технологию Vortex Fusion® в кожу вводятся антиоксиданты, пептиды и выбранный бустер. Кожа получает концентрированный питательный импульс.", en: "Antioxidants, peptides and the selected booster are infused via Vortex Fusion® technology. The skin receives a concentrated nourishing impulse." },
          },
          {
            title: { uk: "Фінальний догляд (опціонально)", ru: "Финальный уход (опционально)", en: "Final care (optional)" },
            body: { uk: "LED-терапія або нанесення SPF-засобу. Процедура завершена — реабілітації немає, можна одразу повертатися до справ.", ru: "LED-терапия или нанесение SPF-средства. Процедура завершена — реабилитации нет, можно сразу возвращаться к делам.", en: "LED therapy or SPF application. Procedure complete — no downtime, you can return to normal activities immediately." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості HydraFacial", ru: "Преимущества и особенности HydraFacial", en: "HydraFacial Benefits and Key Points" },
        items: [
          { uk: "Одночасно очищає, відлущує, зволожує та насичує активними речовинами", ru: "Одновременно очищает, отшелушивает, увлажняет и насыщает активными веществами", en: "Simultaneously cleanses, exfoliates, hydrates and infuses active ingredients" },
          { uk: "Результат помітний одразу: сяюча, зволожена, рівна шкіра", ru: "Результат заметен сразу: сияющая, увлажнённая, ровная кожа", en: "Immediate results: radiant, hydrated, even skin" },
          { uk: "Підходить для всіх типів шкіри та в будь-яку пору року", ru: "Подходит для всех типов кожи и в любое время года", en: "Suitable for all skin types and any time of year" },
          { uk: "Нульовий реабілітаційний період, немає почервоніння та лущення", ru: "Нулевой реабилитационный период, нет покраснения и шелушения", en: "Zero downtime, no redness or peeling" },
          { uk: "Індивідуальний бустер підбирається під конкретне завдання шкіри", ru: "Индивидуальный бустер подбирается под конкретную задачу кожи", en: "Individual booster selected for each specific skin concern" },
          { uk: "⚠ При активному запаленні (пустульозне акне) — виконується тільки після призначення лікування лікарем", ru: "⚠ При активном воспалении (пустулёзное акне) — выполняется только после назначения лечения врачом", en: "⚠ With active inflammation (pustular acne) — performed only after the doctor prescribes treatment" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Апарат HydraFacial та кабінети GENEVITY", ru: "Аппарат HydraFacial и кабинеты GENEVITY", en: "HydraFacial Device and GENEVITY Rooms" },
        images: [
          { url: "/images/equipment/HydraFacial-2.webp", alt: "Апарат HydraFacial у GENEVITY" },
          ...interior,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на HydraFacial в Дніпрі", ru: "Запишитесь на HydraFacial в Днепре", en: "Book HydraFacial in Dnipro" },
        body: { uk: "Дізнайтеся ціну HydraFacial та підберіть бустер для вашого типу шкіри на безкоштовній консультації.", ru: "Узнайте цену HydraFacial и подберите бустер для вашего типа кожи на бесплатной консультации.", en: "Find out the HydraFacial price and select the right booster for your skin type at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки триває процедура HydraFacial?", ru: "Сколько длится процедура HydraFacial?", en: "How long does the HydraFacial procedure last?" },
        answer: { uk: "Стандартна процедура HydraFacial займає 45–60 хвилин. З додатковими опціями (LED-терапія, бустери) — до 75–90 хвилин.", ru: "Стандартная процедура HydraFacial занимает 45–60 минут. С дополнительными опциями (LED-терапия, бустеры) — до 75–90 минут.", en: "A standard HydraFacial takes 45–60 minutes. With additional options (LED therapy, boosters) — up to 75–90 minutes." },
      },
      {
        question: { uk: "Чи можна проводити HydraFacial влітку?", ru: "Можно ли проводить HydraFacial летом?", en: "Can HydraFacial be done in summer?" },
        answer: { uk: "Так. HydraFacial — одна з небагатьох апаратних процедур, яку можна робити цілий рік, включаючи літо та при наявності засмаги. Відсутність агресивних кислот виключає ризик пігментації після ультрафіолету.", ru: "Да. HydraFacial — одна из немногих аппаратных процедур, которую можно делать круглый год, включая лето и при наличии загара. Отсутствие агрессивных кислот исключает риск пигментации после ультрафиолета.", en: "Yes. HydraFacial is one of the few device procedures that can be performed year-round, including summer and with a tan. The absence of aggressive acids eliminates the risk of post-UV pigmentation." },
      },
      {
        question: { uk: "Як часто рекомендується проходити процедуру HydraFacial?", ru: "Как часто рекомендуется проходить процедуру HydraFacial?", en: "How often is HydraFacial recommended?" },
        answer: { uk: "Для підтримки оптимального стану шкіри — раз на місяць. Для вирішення конкретного завдання (підготовка до події, відновлення після зими) — курс з 3–4 сеансів з інтервалом 2 тижні.", ru: "Для поддержания оптимального состояния кожи — раз в месяц. Для решения конкретной задачи (подготовка к событию, восстановление после зимы) — курс из 3–4 сеансов с интервалом 2 недели.", en: "For maintaining optimal skin condition — once a month. For a specific concern (pre-event preparation, post-winter restoration) — a course of 3–4 sessions, 2 weeks apart." },
      },
    ],
  },

  // ─── 26. AcuPulse CO₂ ────────────────────────────────────────────────────
  {
    slug: "acupulse-co2",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "AcuPulse CO₂ — лазерне шліфування обличчя в GENEVITY",
          ru: "AcuPulse CO₂ — лазерная шлифовка лица в GENEVITY",
          en: "AcuPulse CO₂ — CO₂ Laser Skin Resurfacing at GENEVITY",
        },
        body: {
          uk: "AcuPulse CO₂ від Lumenis — золотий стандарт лазерного шліфування шкіри, що використовує фракційний та абляційний режими CO₂ лазера (10 600 нм). Процедура є найбільш ефективним нехірургічним методом для глибокої корекції зморшок, шрамів постакне та пігментації — там, де апаратні RF та HIFU-процедури дають обмежений ефект.\n\nAcuPulse CO₂ лазер видаляє мікроколонки тканини, запускаючи інтенсивний процес регенерації. Нова шкіра утворюється більш рівномірною, пружною та з покращеною текстурою. Лазерне шліфування CO₂ ефективне для: зморшок (поверхневих та глибоких), рубців постакне (у тому числі «льодоколи» та «трамвайні рейки»), гіперпігментації та нерівного тону шкіри, розтяжок та гіпертрофічних рубців, омолодження зони декольте та рук.\n\nCO₂ лазерна шліфовка обличчя в GENEVITY виконується у двох режимах:\n— Фракційний AcuPulse (FRAC3®): менш глибоке шліфування, реабілітація 3–5 днів — ідеально для відновлення текстури та тону\n— Повноабляційний режим: глибше шліфування для виражених зморшок та рубців, реабілітація 7–14 днів\n\nВ GENEVITY процедуру виконують лікарі з досвідом лазерної медицини. Перед процедурою — обов'язкова консультація для оцінки стану шкіри та вибору режиму. Пацієнтам надається детальний план догляду в реабілітаційному періоді.",
          ru: "AcuPulse CO₂ от Lumenis — золотой стандарт лазерной шлифовки кожи, использующий фракционный и абляционный режимы CO₂ лазера (10 600 нм). Процедура является наиболее эффективным нехирургическим методом для глубокой коррекции морщин, рубцов постакне и пигментации — там, где аппаратные RF и HIFU-процедуры дают ограниченный эффект.\n\nAcuPulse CO₂ лазер удаляет микроколонки ткани, запуская интенсивный процесс регенерации. Новая кожа образуется более ровной, упругой и с улучшенной текстурой. Лазерная шлифовка CO₂ эффективна для: морщин (поверхностных и глубоких), рубцов постакне (в том числе «ледоруб» и «трамвайные рельсы»), гиперпигментации и неровного тона кожи, растяжек и гипертрофических рубцов, омоложения зоны декольте и рук.\n\nCO₂ лазерная шлифовка лица в GENEVITY выполняется в двух режимах:\n— Фракционный AcuPulse (FRAC3®): менее глубокая шлифовка, реабилитация 3–5 дней — идеально для восстановления текстуры и тона\n— Полноаблятивный режим: более глубокая шлифовка для выраженных морщин и рубцов, реабилитация 7–14 дней\n\nВ GENEVITY процедуру выполняют врачи с опытом лазерной медицины. Перед процедурой — обязательная консультация для оценки состояния кожи и выбора режима. Пациентам предоставляется детальный план ухода в реабилитационном периоде.",
          en: "AcuPulse CO₂ by Lumenis is the gold standard for laser skin resurfacing, using fractional and ablative CO₂ laser modes (10,600 nm). It is the most effective non-surgical method for deep correction of wrinkles, post-acne scars and pigmentation — where RF and HIFU device procedures deliver limited results.\n\nThe AcuPulse CO₂ laser removes micro-columns of tissue, triggering an intense regeneration process. New skin forms more evenly, with improved firmness and texture. CO₂ laser resurfacing is effective for: wrinkles (superficial and deep), post-acne scars (including ice-pick and rolling scars), hyperpigmentation and uneven skin tone, stretch marks and hypertrophic scars, rejuvenation of the décolletage and hands.\n\nCO₂ laser skin resurfacing at GENEVITY is performed in two modes:\n— Fractional AcuPulse (FRAC3®): less deep resurfacing, 3–5 days recovery — ideal for texture and tone improvement\n— Full ablative mode: deeper resurfacing for pronounced wrinkles and scars, 7–14 days recovery\n\nAt GENEVITY the procedure is performed by doctors with laser medicine experience. A mandatory pre-procedure consultation assesses skin condition and selects the appropriate mode. Patients receive a detailed post-procedure care plan.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до AcuPulse CO₂", ru: "Показания к AcuPulse CO₂", en: "Indications for AcuPulse CO₂" },
        indications: [
          { uk: "Глибокі зморшки та виражені ознаки фотостаріння", ru: "Глубокие морщины и выраженные признаки фотостарения", en: "Deep wrinkles and pronounced signs of photoageing" },
          { uk: "Рубці постакне будь-якого типу (атрофічні, нормотрофічні)", ru: "Рубцы постакне любого типа (атрофические, нормотрофические)", en: "Post-acne scars of any type (atrophic, normotrophic)" },
          { uk: "Гіперпігментація та нерівний тон шкіри, мелазма", ru: "Гиперпигментация и неровный тон кожи, мелазма", en: "Hyperpigmentation, uneven skin tone and melasma" },
          { uk: "Нерівна текстура, розширені пори, розтяжки", ru: "Неровная текстура, расширенные поры, растяжки", en: "Uneven texture, enlarged pores, stretch marks" },
          { uk: "Омолодження зони обличчя, декольте, шиї та рук", ru: "Омоложение зоны лица, декольте, шеи и рук", en: "Rejuvenation of face, décolletage, neck and hands" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Прийом ретиноїдів та ізотретиноїну (відміна за 6–12 місяців)", ru: "Приём ретиноидов и изотретиноина (отмена за 6–12 месяцев)", en: "Use of retinoids and isotretinoin (discontinue 6–12 months before)" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Свіжа засмага та схильність до пігментації (Фіцпатрік IV–VI)", ru: "Свежий загар и склонность к пигментации (Фицпатрик IV–VI)", en: "Recent tan and pigmentation tendency (Fitzpatrick IV–VI)" },
          { uk: "Активні запальні захворювання шкіри та герпес", ru: "Активные воспалительные заболевания кожи и герпес", en: "Active inflammatory skin conditions and herpes" },
          { uk: "Онкологічні захворювання та схильність до келоїдних рубців", ru: "Онкологические заболевания и склонность к келоидным рубцам", en: "Active oncological conditions and keloid tendency" },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: {
          uk: "CO₂ лазерна шліфовка — найефективніший, але й найбільш реабілітаційний апаратний метод. Реабілітація — від 3 до 14 днів залежно від режиму. Плануйте заздалегідь.",
          ru: "CO₂ лазерная шлифовка — наиболее эффективный, но и наиболее реабилитационный аппаратный метод. Реабилитация — от 3 до 14 дней в зависимости от режима. Планируйте заранее.",
          en: "CO₂ laser resurfacing is the most effective but also the most recovery-intensive device method. Recovery: 3 to 14 days depending on the mode. Plan ahead.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура AcuPulse CO₂", ru: "Как проходит процедура AcuPulse CO₂", en: "How the AcuPulse CO₂ Procedure Works" },
        steps: [
          {
            title: { uk: "Консультація та вибір режиму", ru: "Консультация и выбор режима", en: "Consultation and mode selection" },
            body: { uk: "Лікар оцінює стан шкіри, тип проблеми, визначає фракційний або повноабляційний режим та планує кількість сеансів.", ru: "Врач оценивает состояние кожи, тип проблемы, определяет фракционный или полноаблятивный режим и планирует количество сеансов.", en: "The doctor assesses skin condition and problem type, determines fractional or full ablative mode, and plans the number of sessions." },
          },
          {
            title: { uk: "Підготовка та анестезія", ru: "Подготовка и анестезия", en: "Preparation and anaesthesia" },
            body: { uk: "Нанесення анестезуючого крему за 45–60 хвилин до початку. Очищення шкіри. Для глибокого режиму можлива місцева анестезія ін'єкцією.", ru: "Нанесение анестезирующего крема за 45–60 минут до начала. Очищение кожи. Для глубокого режима возможна местная анестезия инъекцией.", en: "Topical anaesthetic cream applied 45–60 minutes before. Skin cleansing. For deep mode, local injection anaesthesia may be used." },
          },
          {
            title: { uk: "Процедура (30–60 хвилин)", ru: "Процедура (30–60 минут)", en: "Treatment (30–60 minutes)" },
            body: { uk: "Лікар рівномірно обробляє зону лазерним пучком. Пацієнт відчуває тепло та легке поколювання (фракційний режим) або інтенсивне пощипування (повноабляційний).", ru: "Врач равномерно обрабатывает зону лазерным пучком. Пациент ощущает тепло и лёгкое покалывание (фракционный режим) или интенсивное пощипывание (полноаблятивный).", en: "The doctor evenly treats the zone with the laser beam. The patient feels warmth and mild tingling (fractional mode) or intense stinging (full ablative)." },
          },
          {
            title: { uk: "Реабілітація та догляд", ru: "Реабилитация и уход", en: "Recovery and aftercare" },
            body: { uk: "Фракційний: 3–5 днів мікровідлущення, SPF50+ обов'язковий 4 тижні. Повноабляційний: 7–14 днів реабілітація з індивідуальними засобами догляду.", ru: "Фракционный: 3–5 дней микроотшелушивание, SPF50+ обязателен 4 недели. Полноаблятивный: 7–14 дней реабилитация с индивидуальными средствами ухода.", en: "Fractional: 3–5 days micro-peeling, SPF50+ mandatory for 4 weeks. Full ablative: 7–14 days recovery with individual skincare products." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості AcuPulse CO₂", ru: "Преимущества и особенности AcuPulse CO₂", en: "AcuPulse CO₂ Benefits and Key Points" },
        items: [
          { uk: "Найефективніший нехірургічний метод для глибоких зморшок та рубців постакне", ru: "Наиболее эффективный нехирургический метод для глубоких морщин и рубцов постакне", en: "The most effective non-surgical method for deep wrinkles and post-acne scars" },
          { uk: "Два режими: фракційний (мінімальна реабілітація) та повноабляційний (максимальний ефект)", ru: "Два режима: фракционный (минимальная реабилитация) и полноаблятивный (максимальный эффект)", en: "Two modes: fractional (minimal downtime) and full ablative (maximum effect)" },
          { uk: "Ефект зберігається 2–5 років при дотриманні SPF-захисту", ru: "Эффект сохраняется 2–5 лет при соблюдении SPF-защиты", en: "Results last 2–5 years with consistent SPF protection" },
          { uk: "Ефективно для рубців постакне, де ін'єкції та RF-процедури малоефективні", ru: "Эффективно для рубцов постакне, где инъекции и RF-процедуры малоэффективны", en: "Effective for post-acne scars where injectables and RF procedures have limited efficacy" },
          { uk: "⚠ Реабілітаційний період: 3–14 днів — плануйте заздалегідь та дотримуйтесь рекомендацій лікаря", ru: "⚠ Реабилитационный период: 3–14 дней — планируйте заранее и соблюдайте рекомендации врача", en: "⚠ Recovery: 3–14 days — plan ahead and follow the doctor's recommendations" },
          { uk: "⚠ Потрібна підготовка шкіри за 2–4 тижні для пацієнтів з IV–VI типом шкіри (ретинол, арбутин)", ru: "⚠ Необходима подготовка кожи за 2–4 недели для пациентов с IV–VI типом кожи (ретинол, арбутин)", en: "⚠ Skin preparation 2–4 weeks prior is required for patients with skin type IV–VI (retinol, arbutin)" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Апарат AcuPulse CO₂ та клініка GENEVITY", ru: "Аппарат AcuPulse CO₂ и клиника GENEVITY", en: "AcuPulse CO₂ Device and GENEVITY Clinic" },
        images: [
          { url: "/images/equipment/acupulse2.webp", alt: "Апарат AcuPulse CO₂ у GENEVITY" },
          { url: "/images/hero/AcuPulse.webp", alt: "Лазерне шліфування AcuPulse у GENEVITY" },
          ...interior.slice(0, 2),
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на CO₂ лазерну шліфовку в Дніпрі", ru: "Запишитесь на CO₂ лазерную шлифовку в Днепре", en: "Book CO₂ Laser Resurfacing in Dnipro" },
        body: { uk: "Дізнайтеся ціну на CO₂ лазерну шліфовку та оберіть оптимальний режим для вашої шкіри на безкоштовній консультації.", ru: "Узнайте цену на CO₂ лазерную шлифовку и выберите оптимальный режим для вашей кожи на бесплатной консультации.", en: "Find out the CO₂ laser resurfacing price and select the optimal mode for your skin at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки процедур AcuPulse CO₂ лазера потрібно для досягнення бажаного результату?", ru: "Сколько процедур AcuPulse CO₂ лазера нужно для достижения желаемого результата?", en: "How many AcuPulse CO₂ laser sessions are needed for desired results?" },
        answer: { uk: "Для більшості завдань (омолодження, пігментація) достатньо 1–2 повноабляційних сеансів або 3–5 фракційних. Рубці постакне можуть потребувати 3–6 сеансів фракційного шліфування.", ru: "Для большинства задач (омоложение, пигментация) достаточно 1–2 полноаблятивных сеансов или 3–5 фракционных. Рубцы постакне могут потребовать 3–6 сеансов фракционной шлифовки.", en: "For most concerns (rejuvenation, pigmentation) 1–2 full ablative sessions or 3–5 fractional sessions are sufficient. Post-acne scars may require 3–6 fractional sessions." },
      },
      {
        question: { uk: "Чи болюча процедура лазерного шліфування AcuPulse CO₂?", ru: "Болезненна ли процедура лазерной шлифовки AcuPulse CO₂?", en: "Is AcuPulse CO₂ laser resurfacing painful?" },
        answer: { uk: "Фракційний режим переноситься відносно комфортно після нанесення анестезуючого крему. Повноабляційний режим вимагає глибшої анестезії та є більш інтенсивним. Лікар підбере оптимальне знеболення.", ru: "Фракционный режим переносится относительно комфортно после нанесения анестезирующего крема. Полноаблятивный режим требует более глубокой анестезии и является более интенсивным. Врач подберёт оптимальное обезболивание.", en: "Fractional mode is relatively comfortable after topical anaesthetic application. Full ablative mode requires deeper anaesthesia and is more intense. The doctor will select optimal pain management." },
      },
      {
        question: { uk: "Який період реабілітації після процедури?", ru: "Какой период реабилитации после процедуры?", en: "What is the recovery period after the procedure?" },
        answer: { uk: "Фракційний AcuPulse: 3–5 днів мікровідлущення та незначне почервоніння. Повноабляційний: 7–14 днів відкрите загоєння з обов'язковим використанням призначених засобів. SPF50+ обов'язковий мінімум 4 тижні після.", ru: "Фракционный AcuPulse: 3–5 дней микроотшелушивание и незначительное покраснение. Полноаблятивный: 7–14 дней открытое заживление с обязательным использованием назначенных средств. SPF50+ обязателен минимум 4 недели после.", en: "Fractional AcuPulse: 3–5 days of micro-peeling and mild redness. Full ablative: 7–14 days open healing with mandatory use of prescribed products. SPF50+ required for at least 4 weeks after." },
      },
      {
        question: { uk: "Чи можна поєднувати AcuPulse CO₂ лазер з іншими косметологічними процедурами?", ru: "Можно ли сочетать AcuPulse CO₂ лазер с другими косметологическими процедурами?", en: "Can AcuPulse CO₂ be combined with other cosmetic procedures?" },
        answer: { uk: "Так. AcuPulse CO₂ ефективно поєднується з PRP-терапією (після лазера для прискорення регенерації) та M22 Stellar Black (IPL для залишкової пігментації після загоєння). Інтервал між процедурами — щонайменше 1–3 місяці.", ru: "Да. AcuPulse CO₂ эффективно сочетается с PRP-терапией (после лазера для ускорения регенерации) и M22 Stellar Black (IPL для остаточной пигментации после заживления). Интервал между процедурами — не менее 1–3 месяцев.", en: "Yes. AcuPulse CO₂ combines effectively with PRP therapy (post-laser for accelerated regeneration) and M22 Stellar Black (IPL for residual pigmentation after healing). Interval between procedures: at least 1–3 months." },
      },
      {
        question: { uk: "Як довго зберігається ефект після лазерного шліфування AcuPulse CO₂?", ru: "Как долго сохраняется эффект после лазерной шлифовки AcuPulse CO₂?", en: "How long do AcuPulse CO₂ results last?" },
        answer: { uk: "Ефект від повноабляційного шліфування зберігається 2–5 років при дотриманні SPF-захисту та правильного догляду. Фракційний режим — 1–2 роки. Рубці постакне після курсу не повертаються.", ru: "Эффект от полноаблятивной шлифовки сохраняется 2–5 лет при соблюдении SPF-защиты и правильного ухода. Фракционный режим — 1–2 года. Рубцы постакне после курса не возвращаются.", en: "Full ablative resurfacing results last 2–5 years with consistent SPF protection and proper skincare. Fractional mode: 1–2 years. Post-acne scars treated in a course do not return." },
      },
    ],
  },
];

async function seedService(s: ServiceSeed) {
  const [row] = await sql`SELECT id FROM services WHERE slug = ${s.slug}`;
  if (!row) { console.log(`⚠ NOT FOUND: ${s.slug}`); return; }
  const serviceId: string = row.id;
  await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${serviceId}`;
  await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${serviceId}`;
  const sectionIds: string[] = [];
  for (let i = 0; i < s.sections.length; i++) {
    const id = randomUUID(); sectionIds.push(id);
    await sql`INSERT INTO content_sections(id,owner_type,owner_id,sort_order,section_type,data)
      VALUES(${id},'service',${serviceId},${i},${s.sections[i].type}::section_type,${JSON.stringify(sectionData(s.sections[i]))}::jsonb)`;
  }
  for (let i = 0; i < s.faqs.length; i++) {
    const f = s.faqs[i];
    await sql`INSERT INTO faq_items(id,owner_type,owner_id,sort_order,question_uk,question_ru,question_en,answer_uk,answer_ru,answer_en)
      VALUES(${randomUUID()},'service',${serviceId},${i},${f.question.uk},${f.question.ru},${f.question.en},${f.answer.uk},${f.answer.ru},${f.answer.en})`;
  }
  await sql`UPDATE services SET block_order = ${[...sectionIds,"faq","doctors","equipment","relatedServices","finalCTA"]} WHERE id = ${serviceId}`;
  console.log(`✓ ${s.slug} — [${s.sections.map(x=>x.type).join(", ")}], ${s.faqs.length} FAQs`);
}

async function main() {
  for (const s of services) await seedService(s);
  await sql.end();
  console.log("\nTZ-v5 apparatus-B2 DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
