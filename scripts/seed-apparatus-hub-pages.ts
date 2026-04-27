/**
 * Apparatus cosmetology restructure:
 * — Delete 11 individual apparatus service pages
 * — Create 3 hub landing pages: face / body / skin
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

const CATEGORY_ID = "ecc57f42-24cd-419e-bb32-f427795283f1";

const OLD_SLUGS = [
  "acupulse-co2", "emface", "emsculpt-neo", "exion", "exion-body",
  "hydrafacial", "m22-stellar-black", "splendor-x", "ultraformer-mpt",
  "ultraformer-mpt-body", "volnewmer",
];

type L = { uk: string; ru: string; en: string };
type Section =
  | { type: "richText"; heading: L; body: L }
  | { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] }
  | { type: "callout"; tone: "info" | "warning" | "success"; body: L }
  | { type: "steps"; heading: L; steps: { title: L; body: L }[] }
  | { type: "bullets"; heading: L; items: L[] }
  | { type: "imageGallery"; heading: L; images: { url: string; alt: string }[] }
  | { type: "cta"; heading: L; body: L; ctaLabel: L; ctaHref: string };

function sd(s: Section): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "callout") return { tone: s.tone, body: s.body };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  if (s.type === "imageGallery") return { heading: s.heading, images: s.images };
  if (s.type === "cta") return { heading: s.heading, body: s.body, ctaLabel: s.ctaLabel, ctaHref: s.ctaHref };
  return {};
}

const interiorImages = [
  { url: "/images/interior/SEMI1276-HDR.webp", alt: "Процедурний кабінет GENEVITY" },
  { url: "/images/interior/SEMI1662-HDR.webp", alt: "Клініка GENEVITY — інтер'єр" },
  { url: "/images/interior/SEMI7509.webp", alt: "Кабінет косметолога GENEVITY" },
];

interface ServiceData {
  slug: string;
  title: L; h1: L; summary: L;
  procedure_length: L; effect_duration: L; sessions_recommended: L;
  price_from: L; price_unit: L;
  seo_title: L; seo_desc: L; seo_keywords: L;
  sort_order: number;
  sections: Section[];
  faqs: { question: L; answer: L }[];
}

// ─── FACE PAGE ───────────────────────────────────────────────────────────────
const face: ServiceData = {
  slug: "face",
  title: {
    uk: "Апаратна косметологія для обличчя",
    ru: "Аппаратная косметология для лица",
    en: "Advanced Facial Equipment Treatments",
  },
  h1: {
    uk: "Апаратна косметологія для обличчя в Дніпрі",
    ru: "Аппаратная косметология для лица в Днепре",
    en: "Advanced Facial Aesthetic Treatments in Dnipro",
  },
  summary: {
    uk: "Ліфтинг, омолодження та відновлення шкіри обличчя за допомогою медичних апаратів: EMFACE, VOLNEWMER, EXION, Ultraformer MPT, HydraFacial, M22 Stellar Black. Без операцій, без довгої реабілітації.",
    ru: "Лифтинг, омоложение и восстановление кожи лица с помощью медицинских аппаратов: EMFACE, VOLNEWMER, EXION, Ultraformer MPT, HydraFacial, M22 Stellar Black. Без операций, без долгой реабилитации.",
    en: "Lifting, rejuvenation and skin renewal for the face using medical-grade devices: EMFACE, VOLNEWMER, EXION, Ultraformer MPT, HydraFacial, M22 Stellar Black. No surgery, minimal downtime.",
  },
  procedure_length: { uk: "20–60 хв", ru: "20–60 мин", en: "20–60 min" },
  effect_duration: { uk: "6–18 місяців", ru: "6–18 месяцев", en: "6–18 months" },
  sessions_recommended: { uk: "1–5 сеансів курсом", ru: "1–5 сеансов курсом", en: "1–5 sessions per course" },
  price_from: { uk: "від 2 500 ₴", ru: "от 2 500 ₴", en: "from 2,500 ₴" },
  price_unit: { uk: "за сеанс", ru: "за сеанс", en: "per session" },
  seo_title: {
    uk: "Апаратна косметологія для обличчя в Дніпрі — EMFACE, Ultraformer, EXION | GENEVITY",
    ru: "Аппаратная косметология для лица в Днепре — EMFACE, Ultraformer, EXION | GENEVITY",
    en: "Facial Aesthetic Equipment Treatments in Dnipro — EMFACE, Ultraformer, EXION | GENEVITY",
  },
  seo_desc: {
    uk: "Апаратний ліфтинг і омолодження обличчя в клініці GENEVITY, Дніпро. EMFACE, VOLNEWMER, EXION, Ultraformer MPT HIFU, HydraFacial, M22 Stellar Black IPL. Лікарі-косметологи, офіційне обладнання.",
    ru: "Аппаратный лифтинг и омоложение лица в клинике GENEVITY, Днепр. EMFACE, VOLNEWMER, EXION, Ultraformer MPT HIFU, HydraFacial, M22 Stellar Black IPL. Врачи-косметологи, официальное оборудование.",
    en: "Facial lifting and rejuvenation treatments at GENEVITY clinic, Dnipro. EMFACE, VOLNEWMER, EXION, Ultraformer MPT HIFU, HydraFacial, M22 Stellar Black IPL. Medical doctors, certified equipment.",
  },
  seo_keywords: {
    uk: "апаратна косметологія обличчя Дніпро, EMFACE Дніпро, Ultraformer MPT обличчя, EXION ліфтинг, безін'єкційне омолодження обличчя, HIFU ліфтинг Дніпро, HydraFacial Дніпро, RF ліфтинг обличчя",
    ru: "аппаратная косметология лицо Днепр, EMFACE Днепр, Ultraformer MPT лицо, EXION лифтинг, безынъекционное омоложение лица, HIFU лифтинг Днепр, HydraFacial Днепр, RF лифтинг лица",
    en: "facial aesthetic treatments Dnipro, EMFACE Ukraine, Ultraformer HIFU face, EXION RF lifting, non-invasive facial rejuvenation, HydraFacial Ukraine, face lifting without surgery",
  },
  sort_order: 1,
  sections: [
    {
      type: "richText",
      heading: {
        uk: "Апаратна косметологія для обличчя: сучасний підхід без скальпеля",
        ru: "Аппаратная косметология для лица: современный подход без скальпеля",
        en: "Advanced Facial Treatments: Modern Approach Without Surgery",
      },
      body: {
        uk: "Апаратна косметологія для обличчя — це клас медичних процедур, що використовують контрольовану енергію (ультразвук, радіочастоти, електромагнітні поля, фотони) для досягнення ліфтингового, омолоджуючого або відновлювального ефекту без хірургічного втручання.\n\nУ клініці GENEVITY в Дніпрі представлено шість сертифікованих апаратів для роботи з обличчям: EMFACE — єдиний пристрій, що одночасно зміцнює м'язи та шкіру; VOLNEWMER — безконтактна радіочастотна терапія до 6 мм глибини; EXION — монополярний RF з мікроголковою фракційною насадкою; Ultraformer MPT — HIFU-ліфтинг SMAS-шару; HydraFacial — глибоке очищення та зволоження; M22 Stellar Black — IPL-фотоомолодження та корекція судин і пігментації.\n\nПеревага апаратного підходу — передбачуваний, відтворюваний результат, підкріплений клінічними дослідженнями. Кожен апарат в GENEVITY пройшов сертифікацію та використовується лікарями-косметологами з медичною освітою. Перед будь-якою процедурою проводиться консультація, на якій лікар оцінює стан шкіри, показання та можливі обмеження.\n\nАпаратні методи добре поєднуються між собою та з ін'єкційними процедурами (ботулінотерапія, біоревіталізація, контурна пластика). Правильна комбінація дозволяє досягти комплексного результату, недоступного при використанні лише одного методу.",
        ru: "Аппаратная косметология для лица — это класс медицинских процедур, использующих контролируемую энергию (ультразвук, радиочастоты, электромагнитные поля, фотоны) для достижения лифтингового, омолаживающего или восстановительного эффекта без хирургического вмешательства.\n\nВ клинике GENEVITY в Днепре представлено шесть сертифицированных аппаратов для работы с лицом: EMFACE — единственное устройство, одновременно укрепляющее мышцы и кожу; VOLNEWMER — бесконтактная радиочастотная терапия до 6 мм глубины; EXION — монополярный RF с микроигольчатой фракционной насадкой; Ultraformer MPT — HIFU-лифтинг СМАС-слоя; HydraFacial — глубокое очищение и увлажнение; M22 Stellar Black — IPL-фотоомоложение и коррекция сосудов и пигментации.\n\nПреимущество аппаратного подхода — предсказуемый, воспроизводимый результат, подкреплённый клиническими исследованиями. Каждый аппарат в GENEVITY прошёл сертификацию и используется врачами-косметологами с медицинским образованием. Перед любой процедурой проводится консультация, на которой врач оценивает состояние кожи, показания и возможные ограничения.\n\nАппаратные методы хорошо сочетаются между собой и с инъекционными процедурами (ботулинотерапия, биоревитализация, контурная пластика). Правильная комбинация позволяет достичь комплексного результата, недоступного при использовании только одного метода.",
        en: "Advanced facial aesthetic treatments are a class of medical procedures using controlled energy (ultrasound, radiofrequency, electromagnetic fields, photons) to achieve lifting, rejuvenating or restorative effects without surgery.\n\nGENEVITY clinic in Dnipro offers six certified devices for facial work: EMFACE — the only device that simultaneously strengthens muscles and skin; VOLNEWMER — contactless radiofrequency therapy reaching 6 mm depth; EXION — monopolar RF with fractional micro-needling; Ultraformer MPT — HIFU lifting of the SMAS layer; HydraFacial — deep cleansing and hydration; M22 Stellar Black — IPL photorejuvenation and vascular/pigmentation correction.\n\nThe advantage of the device-based approach is predictable, reproducible results backed by clinical research. Every device at GENEVITY is certified and operated by doctors with medical qualifications. A consultation precedes every procedure, during which the doctor assesses skin condition, indications and contraindications.\n\nDevice treatments combine well with each other and with injectable procedures (botulinum therapy, biorevitalisation, fillers). The right combination delivers a comprehensive outcome unachievable with a single method alone.",
      },
    },
    {
      type: "bullets",
      heading: {
        uk: "Апарати для обличчя в GENEVITY та їхні можливості",
        ru: "Аппараты для лица в GENEVITY и их возможности",
        en: "Facial Devices at GENEVITY and What They Deliver",
      },
      items: [
        {
          uk: "EMFACE (BTL) — синхронізований RF + HIFES™: ліфтинг м'язів та шкіри за 20 хв, без голок. Ефект: −23% зморшок, +37% тонусу м'язів, +26% колагену.",
          ru: "EMFACE (BTL) — синхронизированный RF + HIFES™: лифтинг мышц и кожи за 20 мин, без игл. Эффект: −23% морщин, +37% тонуса мышц, +26% коллагена.",
          en: "EMFACE (BTL) — synchronised RF + HIFES™: muscle and skin lifting in 20 min, needle-free. Results: −23% wrinkles, +37% muscle tone, +26% collagen.",
        },
        {
          uk: "VOLNEWMER — безконтактний RF-ліфтинг, глибина до 6 мм. Зміцнює СМАС-шар, підтягує овал, немає болю та реабілітації.",
          ru: "VOLNEWMER — бесконтактный RF-лифтинг, глубина до 6 мм. Укрепляет СМАС-слой, подтягивает овал, нет боли и реабилитации.",
          en: "VOLNEWMER — contactless RF lifting reaching 6 mm deep. Tightens the SMAS layer, lifts the facial contour, no pain or downtime.",
        },
        {
          uk: "EXION (Syneron-Candela) — монополярний RF + мікроголки: колагенез та текстурний ремоделінг. Вводить гіалуронову кислоту на глибину до 4 мм без ін'єкцій.",
          ru: "EXION (Syneron-Candela) — монополярный RF + микроиглы: коллагенез и текстурный ремоделинг. Вводит гиалуроновую кислоту на глубину до 4 мм без инъекций.",
          en: "EXION (Syneron-Candela) — monopolar RF + micro-needles: collagenesis and texture remodelling. Delivers hyaluronic acid to 4 mm depth without injections.",
        },
        {
          uk: "Ultraformer MPT (Classys) — HIFU мікро- та макрофокусований ультразвук: SMAS-ліфтинг, ефект від 12 до 18 місяців після 1 процедури.",
          ru: "Ultraformer MPT (Classys) — HIFU микро- и макрофокусированный ультразвук: SMAS-лифтинг, эффект от 12 до 18 месяцев после 1 процедуры.",
          en: "Ultraformer MPT (Classys) — HIFU micro and macro-focused ultrasound: SMAS lifting, results lasting 12–18 months after a single procedure.",
        },
        {
          uk: "HydraFacial — 4-етапний протокол: очищення, ексфоліація, вакуумне видалення комедонів, насичення сироватками. Підходить всім типам шкіри, нульовий відновний період.",
          ru: "HydraFacial — 4-этапный протокол: очищение, эксфолиация, вакуумное удаление комедонов, насыщение сыворотками. Подходит всем типам кожи, нулевой восстановительный период.",
          en: "HydraFacial — 4-step protocol: cleansing, exfoliation, vacuum comedone extraction, serum infusion. Suitable for all skin types, zero downtime.",
        },
        {
          uk: "M22 Stellar Black (Lumenis) — IPL-фотоомолодження + OPT-технологія: рівномірний тон, видалення пігментних плям, корекція розширених судин, поліпшення текстури.",
          ru: "M22 Stellar Black (Lumenis) — IPL-фотоомоложение + OPT-технология: равномерный тон, удаление пигментных пятен, коррекция расширенных сосудов, улучшение текстуры.",
          en: "M22 Stellar Black (Lumenis) — IPL photorejuvenation + OPT technology: even skin tone, pigment spot removal, vascular correction, texture improvement.",
        },
      ],
    },
    {
      type: "steps",
      heading: {
        uk: "Як обрати процедуру: алгоритм підбору",
        ru: "Как выбрать процедуру: алгоритм подбора",
        en: "How to Choose the Right Procedure",
      },
      steps: [
        {
          title: { uk: "Консультація лікаря-косметолога", ru: "Консультация врача-косметолога", en: "Consultation with a cosmetic doctor" },
          body: { uk: "Лікар оцінює тип шкіри, ступінь птозу, наявність пігментних змін, судинних проблем, об'єм підшкірного жиру та тонус м'язів. На основі аналізу формує персональний план процедур.", ru: "Врач оценивает тип кожи, степень птоза, наличие пигментных изменений, сосудистых проблем, объём подкожного жира и тонус мышц. На основе анализа формирует персональный план процедур.", en: "The doctor evaluates skin type, degree of ptosis, pigmentation, vascular issues, subcutaneous fat and muscle tone, then builds a personalised treatment plan." },
        },
        {
          title: { uk: "Монопроцедура або комбінована програма", ru: "Монопроцедура или комбинированная программа", en: "Single treatment or combined programme" },
          body: { uk: "Для початку можна обрати одну процедуру. Якщо завдань декілька (наприклад, ліфтинг + текстура + пігментація), лікар складе послідовну програму — апарати можна поєднувати без шкоди для результату.", ru: "Для начала можно выбрать одну процедуру. Если задач несколько (например, лифтинг + текстура + пигментация), врач составит последовательную программу — аппараты можно сочетать без вреда для результата.", en: "You may start with a single procedure. If you have multiple goals (e.g. lifting + texture + pigmentation), the doctor will build a sequential programme — devices can be combined safely." },
        },
        {
          title: { uk: "Проведення процедури та контроль результату", ru: "Проведение процедуры и контроль результата", en: "Treatment and result monitoring" },
          body: { uk: "Процедура проводиться лікарем у медичному кабінеті. Після сеансу лікар дає рекомендації щодо домашнього догляду та графіку наступних відвідувань.", ru: "Процедура выполняется врачом в медицинском кабинете. После сеанса врач даёт рекомендации по домашнему уходу и графику следующих визитов.", en: "The procedure is performed by the doctor in a medical treatment room. Afterwards the doctor provides home care instructions and schedules follow-up visits." },
        },
        {
          title: { uk: "Підтримуючі сеанси", ru: "Поддерживающие сеансы", en: "Maintenance sessions" },
          body: { uk: "Ефект від більшості апаратних процедур зберігається 6–18 місяців. Підтримуючий протокол (1–2 рази на рік) дозволяє пролонгувати результат і запобігти накопиченню вікових змін.", ru: "Эффект от большинства аппаратных процедур сохраняется 6–18 месяцев. Поддерживающий протокол (1–2 раза в год) позволяет продлить результат и предотвратить накопление возрастных изменений.", en: "Most device treatments last 6–18 months. A maintenance protocol (1–2 times a year) prolongs results and prevents the accumulation of age-related changes." },
        },
      ],
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до апаратної косметології обличчя", ru: "Показания к аппаратной косметологии лица", en: "Indications for Facial Device Treatments" },
      indications: [
        { uk: "Зниження тонусу та птоз шкіри обличчя та шиї", ru: "Снижение тонуса и птоз кожи лица и шеи", en: "Reduced skin tone and facial/neck ptosis" },
        { uk: "Зморшки та складки (лоб, носогубні, зморшки марионетки)", ru: "Морщины и складки (лоб, носогубные, морщины марионетки)", en: "Wrinkles and folds (forehead, nasolabial, marionette lines)" },
        { uk: "Нечіткий контур нижньої третини, подвійне підборіддя", ru: "Нечёткий контур нижней трети, двойной подбородок", en: "Undefined lower-face contour, double chin" },
        { uk: "Пігментні плями, нерівномірний тон шкіри", ru: "Пигментные пятна, неровный тон кожи", en: "Pigmentation spots, uneven skin tone" },
        { uk: "Розширені судини обличчя (куперозу, розацеа)", ru: "Расширенные сосуды лица (купероз, розацеа)", en: "Facial vascular concerns (rosacea, couperose)" },
        { uk: "Знижена зволоженість, тьмяність та втомлений вигляд шкіри", ru: "Сниженная увлажнённость, тусклость и усталый вид кожи", en: "Dehydration, dullness and fatigued skin appearance" },
        { uk: "Профілактика вікових змін починаючи з 25 років", ru: "Профилактика возрастных изменений начиная с 25 лет", en: "Prevention of age-related changes from age 25" },
      ],
      contraindicationsHeading: { uk: "Протипоказання (загальні)", ru: "Противопоказания (общие)", en: "General Contraindications" },
      contraindications: [
        { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
        { uk: "Металеві імпланти, кардіостимулятори, нейростимулятори у зоні дії апарата", ru: "Металлические импланты, кардиостимуляторы, нейростимуляторы в зоне действия аппарата", en: "Metal implants, pacemakers, neurostimulators in the treatment area" },
        { uk: "Онкологічні захворювання в активній стадії", ru: "Онкологические заболевания в активной стадии", en: "Active oncological conditions" },
        { uk: "Гострі запальні процеси шкіри у зоні обробки", ru: "Острые воспалительные процессы кожи в зоне обработки", en: "Acute skin inflammation in the treatment area" },
        { uk: "Індивідуальні протипоказання уточнюються лікарем на консультації", ru: "Индивидуальные противопоказания уточняются врачом на консультации", en: "Individual contraindications are confirmed by the doctor at consultation" },
      ],
    },
    {
      type: "callout",
      tone: "success",
      body: {
        uk: "Усі апарати в GENEVITY — сертифіковані медичні пристрої з доведеною клінічною ефективністю. Процедури виконують лікарі-косметологи з вищою медичною освітою. Перший крок — безкоштовна консультація.",
        ru: "Все аппараты в GENEVITY — сертифицированные медицинские устройства с доказанной клинической эффективностью. Процедуры выполняют врачи-косметологи с высшим медицинским образованием. Первый шаг — бесплатная консультация.",
        en: "All devices at GENEVITY are certified medical-grade equipment with proven clinical efficacy. Procedures are performed by doctors with medical degrees. The first step is a free consultation.",
      },
    },
    {
      type: "imageGallery",
      heading: {
        uk: "Клініка GENEVITY та обладнання для апаратної косметології",
        ru: "Клиника GENEVITY и оборудование для аппаратной косметологии",
        en: "GENEVITY Clinic and Facial Equipment",
      },
      images: [
        { url: "/images/equipment/emface.webp", alt: "EMFACE у GENEVITY" },
        { url: "/images/equipment/HydraFacial-2.webp", alt: "HydraFacial у GENEVITY" },
        ...interiorImages,
      ],
    },
    {
      type: "cta",
      heading: { uk: "Запишіться на апаратну косметологію для обличчя в GENEVITY", ru: "Запишитесь на аппаратную косметологию для лица в GENEVITY", en: "Book Facial Aesthetic Treatment at GENEVITY" },
      body: { uk: "Безкоштовна консультація лікаря-косметолога: підбір процедур під ваші завдання, оцінка зон корекції та орієнтовна вартість курсу.", ru: "Бесплатная консультация врача-косметолога: подбор процедур под ваши задачи, оценка зон коррекции и ориентировочная стоимость курса.", en: "Free cosmetic doctor consultation: procedure selection for your goals, zone assessment and estimated course cost." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
      ctaHref: "/kontakty",
    },
  ],
  faqs: [
    {
      question: { uk: "Яка процедура краще: EMFACE чи Ultraformer MPT?", ru: "Какая процедура лучше: EMFACE или Ultraformer MPT?", en: "Which is better: EMFACE or Ultraformer MPT?" },
      answer: { uk: "EMFACE і Ultraformer MPT діють по-різному. EMFACE зміцнює м'язи обличчя і одночасно відновлює шкіру — курс із 4 сеансів по 20 хвилин. Ultraformer MPT — HIFU-процедура, що підтягує SMAS-шар одним сеансом з ефектом на 12–18 місяців. Вибір залежить від глибини птозу та завдань: при вираженому опущенні частіше рекомендують Ultraformer MPT, для профілактики та тонізування м'язів — EMFACE. Лікар-косметолог підкаже оптимальний варіант після огляду.", ru: "EMFACE и Ultraformer MPT действуют по-разному. EMFACE укрепляет мышцы лица и одновременно восстанавливает кожу — курс из 4 сеансов по 20 минут. Ultraformer MPT — HIFU-процедура, подтягивающая СМАС-слой одним сеансом с эффектом на 12–18 месяцев. Выбор зависит от глубины птоза и задач: при выраженном опущении чаще рекомендуют Ultraformer MPT, для профилактики и тонизирования мышц — EMFACE. Врач-косметолог подскажет оптимальный вариант после осмотра.", en: "EMFACE and Ultraformer MPT work differently. EMFACE strengthens facial muscles and restores skin simultaneously — a course of 4 sessions, 20 minutes each. Ultraformer MPT is a HIFU procedure that tightens the SMAS layer in a single session with results lasting 12–18 months. The choice depends on ptosis severity: for marked sagging, Ultraformer MPT is often recommended; for prevention and muscle toning, EMFACE. A doctor will advise the best option after assessment." },
    },
    {
      question: { uk: "Чи боляче робити апаратні процедури для обличчя?", ru: "Больно ли делать аппаратные процедуры для лица?", en: "Are facial device treatments painful?" },
      answer: { uk: "Рівень дискомфорту залежить від апарата. EMFACE, VOLNEWMER та HydraFacial — практично безболісні. EXION з мікроголками потребує нанесення анестезуючого крему (30–40 хвилин до процедури). Ultraformer MPT — при глибокому впливі можливе помірне поколювання; за показаннями застосовується місцева анестезія. Лікар заздалегідь розповідає про відчуття для кожної процедури.", ru: "Уровень дискомфорта зависит от аппарата. EMFACE, VOLNEWMER и HydraFacial — практически безболезненны. EXION с микроиглами требует нанесения анестезирующего крема (30–40 минут до процедуры). Ultraformer MPT — при глубоком воздействии возможно умеренное покалывание; по показаниям применяется местная анестезия. Врач заранее рассказывает об ощущениях для каждой процедуры.", en: "Comfort levels vary by device. EMFACE, VOLNEWMER and HydraFacial are virtually painless. EXION with micro-needles requires anaesthetic cream applied 30–40 minutes before. Ultraformer MPT may produce moderate tingling at depth; local anaesthesia is applied when indicated. The doctor always explains what to expect for each procedure in advance." },
    },
    {
      question: { uk: "Скільки часу потрібно для відновлення після апаратних процедур?", ru: "Сколько времени нужно для восстановления после аппаратных процедур?", en: "How long is the recovery after device treatments?" },
      answer: { uk: "Більшість апаратних процедур для обличчя не потребують реабілітаційного періоду: EMFACE, VOLNEWMER, Ultraformer MPT, HydraFacial, M22 — можна повертатися до роботи одразу. EXION з мікроголками: можливе почервоніння до 24 годин, мікроскоринки протягом 3–5 днів. Лікар дає детальні рекомендації після кожного сеансу.", ru: "Большинство аппаратных процедур для лица не требуют реабилитационного периода: EMFACE, VOLNEWMER, Ultraformer MPT, HydraFacial, M22 — можно возвращаться к работе сразу. EXION с микроиглами: возможно покраснение до 24 часов, микрокорочки в течение 3–5 дней. Врач даёт подробные рекомендации после каждого сеанса.", en: "Most facial device procedures require no downtime: EMFACE, VOLNEWMER, Ultraformer MPT, HydraFacial, M22 — you can return to work immediately. EXION with micro-needles: possible redness for up to 24 hours and micro-scabbing for 3–5 days. The doctor provides detailed after-care guidance following every session." },
    },
    {
      question: { uk: "Можна поєднувати апаратні процедури з ботоксом та філерами?", ru: "Можно ли сочетать аппаратные процедуры с ботоксом и филлерами?", en: "Can device treatments be combined with Botox and fillers?" },
      answer: { uk: "Так, апаратні процедури і ін'єкційні методи добре поєднуються і взаємно посилюють ефект. Важливо дотримуватись правильної послідовності та інтервалів між процедурами — лікар-косметолог складе персональну програму.", ru: "Да, аппаратные процедуры и инъекционные методы хорошо сочетаются и взаимно усиливают эффект. Важно соблюдать правильную последовательность и интервалы между процедурами — врач-косметолог составит персональную программу.", en: "Yes, device treatments and injectables combine well and mutually enhance results. Correct sequencing and intervals are important — your cosmetic doctor will build a personalised programme." },
    },
    {
      question: { uk: "З якого віку можна робити апаратні процедури для обличчя?", ru: "С какого возраста можно делать аппаратные процедуры для лица?", en: "From what age can facial device treatments be done?" },
      answer: { uk: "Рекомендований вік для профілактичних процедур (HydraFacial, EMFACE, M22 для пігментації) — від 20–25 років. Ліфтингові процедури (VOLNEWMER, Ultraformer MPT, EXION) найчастіше рекомендуються від 30 років, коли починається перший ptоз. Кінцеве рішення приймає лікар після огляду.", ru: "Рекомендованный возраст для профилактических процедур (HydraFacial, EMFACE, M22 для пигментации) — от 20–25 лет. Лифтинговые процедуры (VOLNEWMER, Ultraformer MPT, EXION) чаще всего рекомендуются от 30 лет, когда начинается первый птоз. Окончательное решение принимает врач после осмотра.", en: "Preventive treatments (HydraFacial, EMFACE, M22 for pigmentation) are suitable from age 20–25. Lifting procedures (VOLNEWMER, Ultraformer MPT, EXION) are most commonly recommended from age 30 when initial ptosis begins. The final decision is made by the doctor after assessment." },
    },
    {
      question: { uk: "Скільки коштує курс апаратної косметології для обличчя?", ru: "Сколько стоит курс аппаратной косметологии для лица?", en: "How much does a facial device treatment course cost?" },
      answer: { uk: "Вартість залежить від обраної процедури та кількості сеансів. Один сеанс HydraFacial — від 2 500 ₴, EMFACE — від 6 000 ₴ за сеанс (курс 4 сеанси), Ultraformer MPT — від 8 000 ₴ за процедуру. Точну вартість повідомляє лікар на консультації після оцінки зон корекції.", ru: "Стоимость зависит от выбранной процедуры и количества сеансов. Один сеанс HydraFacial — от 2 500 ₴, EMFACE — от 6 000 ₴ за сеанс (курс 4 сеанса), Ultraformer MPT — от 8 000 ₴ за процедуру. Точную стоимость сообщает врач на консультации после оценки зон коррекции.", en: "Cost depends on the chosen procedure and number of sessions. A single HydraFacial session from 2,500 ₴; EMFACE from 6,000 ₴ per session (course of 4); Ultraformer MPT from 8,000 ₴ per procedure. The exact price is confirmed by the doctor at consultation after assessing correction zones." },
    },
    {
      question: { uk: "Чи потрібна підготовка до апаратних процедур для обличчя?", ru: "Нужна ли подготовка к аппаратным процедурам для лица?", en: "Is preparation needed before facial device treatments?" },
      answer: { uk: "Для більшості процедур підготовка мінімальна: очищена шкіра, відсутність макіяжу. Перед EXION наноситься анестезуючий крем (30–40 хв). Перед M22/IPL потрібно уникати засмаги 2–4 тижні. Детальні рекомендації лікар надає на консультації.", ru: "Для большинства процедур подготовка минимальна: очищённая кожа, отсутствие макияжа. Перед EXION наносится анестезирующий крем (30–40 мин). Перед M22/IPL нужно избегать загара 2–4 недели. Подробные рекомендации врач даёт на консультации.", en: "Preparation is minimal for most procedures: clean skin, no make-up. EXION requires anaesthetic cream 30–40 minutes before. M22/IPL requires avoiding sun exposure 2–4 weeks prior. Detailed instructions are provided at the consultation." },
    },
    {
      question: { uk: "Коли видно перший результат від апаратних процедур?", ru: "Когда виден первый результат от аппаратных процедур?", en: "When are the first results visible?" },
      answer: { uk: "Залежить від апарата: HydraFacial — ефект помітний одразу після процедури. M22 IPL — рівномірний тон видно через 7–14 днів. EMFACE — перший підйом через 2–4 тижні, максимум після 4 сеансів. Ultraformer MPT — ліфтинг поступово наростає 2–3 місяці. VOLNEWMER і EXION — приріст колагену протягом 1–3 місяців.", ru: "Зависит от аппарата: HydraFacial — эффект заметен сразу после процедуры. M22 IPL — ровный тон виден через 7–14 дней. EMFACE — первый подъём через 2–4 недели, максимум после 4 сеансов. Ultraformer MPT — лифтинг постепенно нарастает 2–3 месяца. VOLNEWMER и EXION — прирост коллагена в течение 1–3 месяцев.", en: "It depends on the device: HydraFacial — noticeable immediately after. M22 IPL — even tone visible in 7–14 days. EMFACE — first lift in 2–4 weeks, peak after 4 sessions. Ultraformer MPT — lifting builds gradually over 2–3 months. VOLNEWMER and EXION — collagen increase over 1–3 months." },
    },
  ],
};

// ─── BODY PAGE ───────────────────────────────────────────────────────────────
const body: ServiceData = {
  slug: "body",
  title: {
    uk: "Апаратна корекція тіла",
    ru: "Аппаратная коррекция тела",
    en: "Advanced Body Contouring Treatments",
  },
  h1: {
    uk: "Апаратна корекція тіла в Дніпрі",
    ru: "Аппаратная коррекция тела в Днепре",
    en: "Advanced Body Contouring in Dnipro",
  },
  summary: {
    uk: "Скульптурування тіла, зменшення жирових відкладень та підтягування шкіри без операцій: EMSCULPT NEO, Ultraformer MPT Body, EXION Body. Клінічно доведені результати.",
    ru: "Скульптурирование тела, уменьшение жировых отложений и подтяжка кожи без операций: EMSCULPT NEO, Ultraformer MPT Body, EXION Body. Клинически доказанные результаты.",
    en: "Body sculpting, fat reduction and skin tightening without surgery: EMSCULPT NEO, Ultraformer MPT Body, EXION Body. Clinically proven results.",
  },
  procedure_length: { uk: "30–60 хв", ru: "30–60 мин", en: "30–60 min" },
  effect_duration: { uk: "6–12 місяців", ru: "6–12 месяцев", en: "6–12 months" },
  sessions_recommended: { uk: "4–6 сеансів курсом", ru: "4–6 сеансов курсом", en: "4–6 sessions per course" },
  price_from: { uk: "від 3 500 ₴", ru: "от 3 500 ₴", en: "from 3,500 ₴" },
  price_unit: { uk: "за сеанс", ru: "за сеанс", en: "per session" },
  seo_title: {
    uk: "Апаратна корекція тіла в Дніпрі — EMSCULPT NEO, Ultraformer, EXION Body | GENEVITY",
    ru: "Аппаратная коррекция тела в Днепре — EMSCULPT NEO, Ultraformer, EXION Body | GENEVITY",
    en: "Body Contouring Treatments in Dnipro — EMSCULPT NEO, Ultraformer, EXION Body | GENEVITY",
  },
  seo_desc: {
    uk: "Корекція фігури, спалювання жиру та нарощування м'язів без операцій у клініці GENEVITY, Дніпро. EMSCULPT NEO, Ultraformer MPT Body HIFU, EXION Body RF. Лікарі, сертифіковане обладнання.",
    ru: "Коррекция фигуры, сжигание жира и наращивание мышц без операций в клинике GENEVITY, Днепр. EMSCULPT NEO, Ultraformer MPT Body HIFU, EXION Body RF. Врачи, сертифицированное оборудование.",
    en: "Body shaping, fat burning and muscle building without surgery at GENEVITY clinic, Dnipro. EMSCULPT NEO, Ultraformer MPT Body HIFU, EXION Body RF. Doctors, certified equipment.",
  },
  seo_keywords: {
    uk: "корекція тіла Дніпро, EMSCULPT NEO Дніпро, спалювання жиру апаратом, збільшення м'язів без спортзалу, Ultraformer MPT тіло, EXION Body, підтягування шкіри тіла, ліпосакція без операції, діастаз лікування",
    ru: "коррекция тела Днепр, EMSCULPT NEO Днепр, сжигание жира аппаратом, увеличение мышц без спортзала, Ultraformer MPT тело, EXION Body, подтяжка кожи тела, липосакция без операции, диастаз лечение",
    en: "body contouring Dnipro, EMSCULPT NEO Ukraine, fat burning without surgery, muscle building device, Ultraformer MPT body, EXION Body RF, skin tightening body, non-surgical liposuction, diastasis treatment",
  },
  sort_order: 2,
  sections: [
    {
      type: "richText",
      heading: {
        uk: "Апаратна корекція тіла: спалити жир, нарастити м'язи, підтягнути шкіру",
        ru: "Аппаратная коррекция тела: сжечь жир, нарастить мышцы, подтянуть кожу",
        en: "Body Contouring: Burn Fat, Build Muscle, Tighten Skin",
      },
      body: {
        uk: "Апаратна корекція тіла в GENEVITY — це медичний підхід до скульптурування фігури без хірургії, ліпосакції та довгого відновлення. Три апарати клініки охоплюють різні завдання та механізми дії, дозволяючи підібрати оптимальне рішення або скласти комплексну програму.\n\nEMSCULPT NEO — єдиний у світі апарат, що одночасно знищує жирові клітини та нарощує м'язовий об'єм. Технологія HIFEM® викликає 20 000+ надінтенсивних м'язових скорочень за 30 хвилин — ефект, недосяжний тренуванням. Синхронна RF-складова розігріває та руйнує жирові клітини через апоптоз. Клінічні дані: −30% жиру, +25% м'язової маси після стандартного курсу.\n\nUltraformer MPT Body — HIFU-технологія для підтягування шкіри та знищення підшкірного жиру на тілі. Апарат адресно впливає на поверхневий та глибокий жировий шар, запускаючи термоліз адипоцитів. Результат — зменшення об'ємів та покращення тонусу шкіри в зоні живота, боків, стегон і внутрішньої поверхні рук.\n\nEXION Body — монополярний радіочастотний апарат для ремоделінгу шкіри тіла. RF-енергія стимулює неоколагенез у дермі, підвищуючи щільність та еластичність шкіри. Особливо ефективний при целюліті та в'ялості шкіри після схуднення або пологів.\n\nТри апарати можна комбінувати між собою для синергетичного ефекту: EMSCULPT NEO для жиру та м'язів, Ultraformer MPT Body для об'ємів, EXION Body для якості шкіри.",
        ru: "Аппаратная коррекция тела в GENEVITY — это медицинский подход к скульптурированию фигуры без хирургии, липосакции и длительного восстановления. Три аппарата клиники охватывают разные задачи и механизмы действия, позволяя подобрать оптимальное решение или составить комплексную программу.\n\nEMSCULPT NEO — единственный в мире аппарат, одновременно уничтожающий жировые клетки и наращивающий мышечный объём. Технология HIFEM® вызывает 20 000+ сверхинтенсивных мышечных сокращений за 30 минут — эффект, недостижимый тренировкой. Синхронная RF-составляющая разогревает и разрушает жировые клетки через апоптоз. Клинические данные: −30% жира, +25% мышечной массы после стандартного курса.\n\nUltraformer MPT Body — HIFU-технология для подтяжки кожи и уничтожения подкожного жира на теле. Аппарат адресно воздействует на поверхностный и глубокий жировой слой, запуская термолиз адипоцитов. Результат — уменьшение объёмов и улучшение тонуса кожи в зоне живота, боков, бёдер и внутренней поверхности рук.\n\nEXION Body — монополярный радиочастотный аппарат для ремоделирования кожи тела. RF-энергия стимулирует неоколлагенез в дерме, повышая плотность и эластичность кожи. Особенно эффективен при целлюлите и дряблости кожи после похудения или родов.\n\nТри аппарата можно комбинировать между собой для синергетического эффекта: EMSCULPT NEO для жира и мышц, Ultraformer MPT Body для объёмов, EXION Body для качества кожи.",
        en: "Body contouring at GENEVITY is a medical approach to figure sculpting without surgery, liposuction or prolonged recovery. Three clinic devices cover different goals and mechanisms, allowing you to choose the optimal solution or build a comprehensive programme.\n\nEMSCULPT NEO is the world's only device that simultaneously eliminates fat cells and builds muscle mass. HIFEM® technology triggers 20,000+ supramaximal muscle contractions in 30 minutes — an effect unachievable by exercise. The synchronised RF component heats and destroys fat cells through apoptosis. Clinical data: −30% fat, +25% muscle mass after the standard course.\n\nUltraformer MPT Body uses HIFU technology for skin tightening and subcutaneous fat reduction on the body. The device precisely targets the superficial and deep fat layers, triggering adipocyte thermolysis. Results include volume reduction and improved skin tone in the abdomen, flanks, thighs and inner arms.\n\nEXION Body is a monopolar radiofrequency device for body skin remodelling. RF energy stimulates neocollagenesis in the dermis, increasing skin density and elasticity. Particularly effective for cellulite and loose skin after weight loss or childbirth.\n\nAll three devices can be combined for synergistic effect: EMSCULPT NEO for fat and muscle, Ultraformer MPT Body for volume, EXION Body for skin quality.",
      },
    },
    {
      type: "bullets",
      heading: {
        uk: "Що вирішує апаратна корекція тіла",
        ru: "Что решает аппаратная коррекция тела",
        en: "What Body Device Treatments Can Address",
      },
      items: [
        { uk: "Локальні жирові відкладення (живіт, стегна, боки, руки, коліна) — без хірургії", ru: "Локальные жировые отложения (живот, бёдра, бока, руки, колени) — без хирургии", en: "Localised fat deposits (abdomen, thighs, flanks, arms, knees) — without surgery" },
        { uk: "Слабкість м'язів живота та діастаз після пологів або малорухливого способу життя", ru: "Слабость мышц живота и диастаз после родов или малоподвижного образа жизни", en: "Weak abdominal muscles and diastasis after childbirth or sedentary lifestyle" },
        { uk: "Підтягнути та зміцнити сідниці без імплантів", ru: "Подтянуть и укрепить ягодицы без имплантов", en: "Lift and firm buttocks without implants" },
        { uk: "В'яла шкіра після схуднення або вагітності — підвищити тонус та еластичність", ru: "Дряблая кожа после похудения или беременности — повысить тонус и эластичность", en: "Loose skin after weight loss or pregnancy — restore tone and elasticity" },
        { uk: "Целюліт — поліпшити рельєф та мікроциркуляцію шкіри", ru: "Целлюлит — улучшить рельеф и микроциркуляцию кожи", en: "Cellulite — improve texture and skin microcirculation" },
        { uk: "Бажання сформувати м'язовий рельєф без тривалих тренувань", ru: "Желание сформировать мышечный рельеф без длительных тренировок", en: "Goal to define muscle contour without extended gym training" },
      ],
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання", ru: "Показания", en: "Indications" },
      indications: [
        { uk: "Локальний ліпоматоз (жирові депо, що не піддаються дієті та тренуванням)", ru: "Локальный липоматоз (жировые депо, не поддающиеся диете и тренировкам)", en: "Localised lipomatosis (fat deposits resistant to diet and exercise)" },
        { uk: "Діастаз прямих м'язів живота", ru: "Диастаз прямых мышц живота", en: "Rectus abdominis diastasis" },
        { uk: "Зниження тонусу м'язів сідниць, стегон, живота та рук", ru: "Снижение тонуса мышц ягодиц, бёдер, живота и рук", en: "Reduced muscle tone in buttocks, thighs, abdomen and arms" },
        { uk: "В'яла шкіра тіла, стрії та целюліт", ru: "Дряблая кожа тела, стрии и целлюлит", en: "Body skin laxity, stretch marks and cellulite" },
        { uk: "Бажання збільшити об'єм м'язів або підтягнути силует без хірургії", ru: "Желание увеличить объём мышц или подтянуть силуэт без хирургии", en: "Desire to increase muscle volume or reshape the silhouette without surgery" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Металеві імпланти, кардіостимулятори, нейростимулятори в зоні обробки", ru: "Металлические импланты, кардиостимуляторы, нейростимуляторы в зоне обработки", en: "Metal implants, pacemakers, neurostimulators in the treatment area" },
        { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
        { uk: "Грижа в зоні обробки (для EMSCULPT NEO)", ru: "Грыжа в зоне обработки (для EMSCULPT NEO)", en: "Hernia in the treatment area (for EMSCULPT NEO)" },
        { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
        { uk: "Гострі запальні або шкірні захворювання в зоні обробки", ru: "Острые воспалительные или кожные заболевания в зоне обработки", en: "Acute inflammatory or skin conditions in the treatment area" },
      ],
    },
    {
      type: "callout",
      tone: "info",
      body: {
        uk: "EMSCULPT NEO — єдина процедура, яка одночасно спалює жир І нарощує м'язи. За 30 хвилин апарат виконує понад 20 000 м'язових скорочень. Жоден тренувальний протокол не дає такого ефекту за такий час.",
        ru: "EMSCULPT NEO — единственная процедура, которая одновременно сжигает жир И наращивает мышцы. За 30 минут аппарат выполняет более 20 000 мышечных сокращений. Ни один тренировочный протокол не даёт такого эффекта за такое время.",
        en: "EMSCULPT NEO is the only procedure that simultaneously burns fat AND builds muscle. In 30 minutes it induces over 20,000 muscle contractions. No training protocol delivers this effect in this timeframe.",
      },
    },
    {
      type: "steps",
      heading: {
        uk: "Як відбувається програма корекції тіла в GENEVITY",
        ru: "Как проходит программа коррекции тела в GENEVITY",
        en: "How the Body Contouring Programme Works at GENEVITY",
      },
      steps: [
        {
          title: { uk: "Консультація та складання програми", ru: "Консультация и составление программы", en: "Consultation and programme design" },
          body: { uk: "Лікар оцінює зони корекції, ІМТ, тонус м'язів та стан шкіри. На основі аналізу підбирає один або кілька апаратів, визначає кількість сеансів та їхню послідовність.", ru: "Врач оценивает зоны коррекции, ИМТ, тонус мышц и состояние кожи. На основе анализа подбирает один или несколько аппаратов, определяет количество сеансов и их последовательность.", en: "The doctor assesses correction zones, BMI, muscle tone and skin condition, then selects one or more devices and defines the number and sequence of sessions." },
        },
        {
          title: { uk: "Курс процедур (4–6 сеансів)", ru: "Курс процедур (4–6 сеансов)", en: "Treatment course (4–6 sessions)" },
          body: { uk: "Сеанси проводяться з інтервалом 5–10 днів. Після курсу жирові клітини поступово виводяться природним шляхом, а м'язовий об'єм та тонус шкіри продовжують покращуватися 2–3 місяці.", ru: "Сеансы проводятся с интервалом 5–10 дней. После курса жировые клетки постепенно выводятся естественным путём, а мышечный объём и тонус кожи продолжают улучшаться 2–3 месяца.", en: "Sessions are spaced 5–10 days apart. After the course, fat cells are gradually eliminated naturally, while muscle volume and skin tone continue improving for 2–3 months." },
        },
        {
          title: { uk: "Оцінка результату та підтримуюча програма", ru: "Оценка результата и поддерживающая программа", en: "Result assessment and maintenance programme" },
          body: { uk: "Через 2–3 місяці після курсу лікар оцінює результат. При необхідності призначаються підтримуючі сеанси 1–2 рази на рік для збереження ефекту.", ru: "Через 2–3 месяца после курса врач оценивает результат. При необходимости назначаются поддерживающие сеансы 1–2 раза в год для сохранения эффекта.", en: "2–3 months after the course the doctor assesses results. Maintenance sessions (1–2 per year) are prescribed as needed to sustain the effect." },
        },
      ],
    },
    {
      type: "imageGallery",
      heading: {
        uk: "Клініка GENEVITY та обладнання для корекції тіла",
        ru: "Клиника GENEVITY и оборудование для коррекции тела",
        en: "GENEVITY Clinic and Body Contouring Equipment",
      },
      images: [
        { url: "/images/equipment/emsculpt.webp", alt: "EMSCULPT NEO у GENEVITY" },
        { url: "/images/equipment/Ultrafomer.webp", alt: "Ultraformer MPT у GENEVITY" },
        ...interiorImages,
      ],
    },
    {
      type: "cta",
      heading: { uk: "Запишіться на корекцію тіла в GENEVITY", ru: "Запишитесь на коррекцию тела в GENEVITY", en: "Book Body Contouring at GENEVITY" },
      body: { uk: "Дізнайтеся, яка комбінація процедур підійде саме вам — безкоштовна консультація лікаря з оцінкою зон корекції та розрахунком курсу.", ru: "Узнайте, какая комбинация процедур подойдёт именно вам — бесплатная консультация врача с оценкой зон коррекции и расчётом курса.", en: "Find out which combination of procedures suits you — free doctor consultation with zone assessment and course calculation." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
      ctaHref: "/kontakty",
    },
  ],
  faqs: [
    {
      question: { uk: "EMSCULPT NEO — це як 20 000 присідань?", ru: "EMSCULPT NEO — это как 20 000 приседаний?", en: "Is EMSCULPT NEO really like 20,000 squats?" },
      answer: { uk: "Не зовсім. EMSCULPT NEO викликає 20 000+ надінтенсивних скорочень м'язів за 30 хвилин. Це скорочення вищої інтенсивності, ніж при звичайних тренуваннях — людина фізично не здатна свідомо скоротити м'язи з такою частотою. Крім того, RF-компонент одночасно руйнує жирові клітини, чого тренуваннями досягти неможливо.", ru: "Не совсем. EMSCULPT NEO вызывает 20 000+ сверхинтенсивных сокращений мышц за 30 минут. Это сокращения более высокой интенсивности, чем при обычных тренировках — человек физически не способен сознательно сократить мышцы с такой частотой. Кроме того, RF-компонент одновременно разрушает жировые клетки, чего тренировками достичь невозможно.", en: "Not exactly. EMSCULPT NEO induces 20,000+ supramaximal muscle contractions in 30 minutes — at an intensity higher than voluntary exercise can achieve. Additionally, the RF component simultaneously destroys fat cells, which training alone cannot do." },
    },
    {
      question: { uk: "Чи підходить EMSCULPT NEO для чоловіків?", ru: "Подходит ли EMSCULPT NEO для мужчин?", en: "Is EMSCULPT NEO suitable for men?" },
      answer: { uk: "Так. EMSCULPT NEO активно використовується чоловіками для опрацювання м'язів живота (кубики), сідниць, біцепса та трицепса. Протипоказань за статтю немає. Результат часто більш виражений завдяки вищій вихідній м'язовій масі.", ru: "Да. EMSCULPT NEO активно используется мужчинами для проработки мышц живота (кубики), ягодиц, бицепса и трицепса. Противопоказаний по полу нет. Результат часто более выражен благодаря более высокой исходной мышечной массе.", en: "Yes. EMSCULPT NEO is widely used by men to define abs, build buttock and arm muscles. There are no gender-based contraindications. Results are often more pronounced thanks to higher baseline muscle mass." },
    },
    {
      question: { uk: "Скільки кілограмів можна скинути за курс EMSCULPT NEO?", ru: "Сколько килограммов можно сбросить за курс EMSCULPT NEO?", en: "How much weight can you lose with EMSCULPT NEO?" },
      answer: { uk: "EMSCULPT NEO — не засіб для схуднення, а метод зміни складу тіла. Вага може залишитися незмінною або навіть зрости (через набір м'язової маси), але об'єми зменшаться, а фігура стане більш підтягнутою. Клінічні дані: −30% жиру і +25% м'язів у зоні обробки.", ru: "EMSCULPT NEO — не средство для похудения, а метод изменения состава тела. Вес может остаться неизменным или даже вырасти (из-за набора мышечной массы), но объёмы уменьшатся, а фигура станет более подтянутой. Клинические данные: −30% жира и +25% мышц в зоне обработки.", en: "EMSCULPT NEO is not a weight-loss device — it changes body composition. Weight may stay the same or even increase (due to muscle gain), but measurements will decrease and the figure will become more defined. Clinical data: −30% fat and +25% muscle in the treatment zone." },
    },
    {
      question: { uk: "Чи потрібно дотримуватися дієти після процедур корекції тіла?", ru: "Нужно ли соблюдать диету после процедур коррекции тела?", en: "Should you follow a diet after body contouring treatments?" },
      answer: { uk: "Результат збережеться краще при збалансованому харчуванні та фізичній активності. Жирові клітини, знищені апаратом, не відновлюються, але при надлишку калорій залишкові клітини можуть збільшуватися в розмірі. Лікар дає індивідуальні рекомендації.", ru: "Результат сохранится лучше при сбалансированном питании и физической активности. Жировые клетки, уничтоженные аппаратом, не восстанавливаются, но при избытке калорий оставшиеся клетки могут увеличиваться в размере. Врач даёт индивидуальные рекомендации.", en: "Results are better maintained with balanced nutrition and physical activity. Fat cells destroyed by the device do not regenerate, but remaining cells can enlarge with excess calories. The doctor provides individual recommendations." },
    },
    {
      question: { uk: "Чи є болю або реабілітації після EMSCULPT NEO?", ru: "Есть ли боль или реабилитация после EMSCULPT NEO?", en: "Is there pain or recovery after EMSCULPT NEO?" },
      answer: { uk: "Процедура EMSCULPT NEO безболісна. Після сеансу можливе відчуття м'язової крепатури (як після інтенсивного тренування) протягом 1–2 днів. Реабілітаційного періоду немає — можна відразу повертатися до звичного ритму.", ru: "Процедура EMSCULPT NEO безболезненна. После сеанса возможно ощущение мышечной крепатуры (как после интенсивной тренировки) в течение 1–2 дней. Реабилитационного периода нет — можно сразу возвращаться к обычному ритму.", en: "EMSCULPT NEO is painless. Post-session muscle soreness (similar to after an intense workout) may occur for 1–2 days. There is no recovery period — you can return to your normal routine immediately." },
    },
    {
      question: { uk: "Наскільки помітний ефект від Ultraformer MPT Body?", ru: "Насколько заметен эффект от Ultraformer MPT Body?", en: "How noticeable are Ultraformer MPT Body results?" },
      answer: { uk: "Ефект від Ultraformer MPT Body поступово наростає 2–3 місяці після процедури та зберігається до 12 місяців. Найпомітніший результат — зменшення об'ємів у зоні живота та стегон, підвищення тонусу шкіри. Для вираженого птозу може знадобитись повторний курс.", ru: "Эффект от Ultraformer MPT Body постепенно нарастает 2–3 месяца после процедуры и сохраняется до 12 месяцев. Наиболее заметный результат — уменьшение объёмов в зоне живота и бёдер, повышение тонуса кожи. При выраженном птозе может потребоваться повторный курс.", en: "Ultraformer MPT Body results build gradually over 2–3 months and last up to 12 months. The most noticeable effects are volume reduction in the abdomen and thighs, and improved skin tone. Significant ptosis may require a repeat course." },
    },
    {
      question: { uk: "Яка різниця між EXION Body та Ultraformer MPT Body?", ru: "В чём разница между EXION Body и Ultraformer MPT Body?", en: "What is the difference between EXION Body and Ultraformer MPT Body?" },
      answer: { uk: "EXION Body — монополярний RF для покращення якості шкіри (тонус, текстура, целюліт, стрії). Ultraformer MPT Body — HIFU для зменшення об'ємів жиру та підтягування SMAS-шару. Обидва апарати добре доповнюють один одного: Ultraformer зменшує об'єм, EXION покращує якість шкіри у зоні корекції.", ru: "EXION Body — монополярный RF для улучшения качества кожи (тонус, текстура, целлюлит, стрии). Ultraformer MPT Body — HIFU для уменьшения объёмов жира и подтяжки СМАС-слоя. Оба аппарата хорошо дополняют друг друга: Ultraformer уменьшает объём, EXION улучшает качество кожи в зоне коррекции.", en: "EXION Body is monopolar RF for improving skin quality (tone, texture, cellulite, stretch marks). Ultraformer MPT Body is HIFU for fat volume reduction and SMAS-layer tightening. Both devices complement each other well: Ultraformer reduces volume, EXION improves skin quality in the correction zone." },
    },
  ],
};

// ─── SKIN PAGE ────────────────────────────────────────────────────────────────
const skin: ServiceData = {
  slug: "skin",
  title: {
    uk: "Корекція шкіри: шрами, пігментація, омолодження",
    ru: "Коррекция кожи: шрамы, пигментация, омоложение",
    en: "Skin Correction: Scars, Pigmentation, Rejuvenation",
  },
  h1: {
    uk: "Лікування шкіри: шрами, пігментація та омолодження в Дніпрі",
    ru: "Лечение кожи: шрамы, пигментация и омоложение в Днепре",
    en: "Skin Treatment: Scars, Pigmentation and Rejuvenation in Dnipro",
  },
  summary: {
    uk: "Корекція акне-шрамів, постзапальної та вікової пігментації, шліфування та омолодження шкіри за допомогою AcuPulse CO₂ та M22 Stellar Black. Медичний підхід, доведені результати.",
    ru: "Коррекция шрамов от акне, постзапалительной и возрастной пигментации, шлифовка и омоложение кожи с помощью AcuPulse CO₂ и M22 Stellar Black. Медицинский подход, доказанные результаты.",
    en: "Correction of acne scars, post-inflammatory and age-related pigmentation, skin resurfacing and rejuvenation using AcuPulse CO₂ and M22 Stellar Black. Medical approach, proven results.",
  },
  procedure_length: { uk: "30–90 хв", ru: "30–90 мин", en: "30–90 min" },
  effect_duration: { uk: "12–36 місяців", ru: "12–36 месяцев", en: "12–36 months" },
  sessions_recommended: { uk: "1–3 сеанси", ru: "1–3 сеанса", en: "1–3 sessions" },
  price_from: { uk: "від 3 000 ₴", ru: "от 3 000 ₴", en: "from 3,000 ₴" },
  price_unit: { uk: "за сеанс", ru: "за сеанс", en: "per session" },
  seo_title: {
    uk: "Шрами, пігментація, шліфування шкіри — AcuPulse CO₂ та M22 Stellar Black | GENEVITY Дніпро",
    ru: "Шрамы, пигментация, шлифовка кожи — AcuPulse CO₂ и M22 Stellar Black | GENEVITY Днепр",
    en: "Scars, Pigmentation, Skin Resurfacing — AcuPulse CO₂ and M22 Stellar Black | GENEVITY Dnipro",
  },
  seo_desc: {
    uk: "Лікування акне-шрамів, пігментних плям, омолодження шкіри фракційним CO₂ лазером AcuPulse та IPL M22 Stellar Black у клініці GENEVITY, Дніпро. Лікарі-дерматологи, сертифіковане обладнання Lumenis.",
    ru: "Лечение шрамов от акне, пигментных пятен, омоложение кожи фракционным CO₂ лазером AcuPulse и IPL M22 Stellar Black в клинике GENEVITY, Днепр. Врачи-дерматологи, сертифицированное оборудование Lumenis.",
    en: "Treatment of acne scars, pigmentation spots, skin rejuvenation with fractional CO₂ laser AcuPulse and IPL M22 Stellar Black at GENEVITY clinic, Dnipro. Dermatologists, certified Lumenis equipment.",
  },
  seo_keywords: {
    uk: "видалення шрамів Дніпро, лікування акне-шрамів лазером, пігментні плями видалення, шліфування шкіри CO₂ лазером, AcuPulse CO₂ Дніпро, M22 Stellar Black IPL, фракційний лазер шрами, лікування рубців",
    ru: "удаление шрамов Днепр, лечение шрамов от акне лазером, пигментные пятна удаление, шлифовка кожи CO₂ лазером, AcuPulse CO₂ Днепр, M22 Stellar Black IPL, фракционный лазер шрамы, лечение рубцов",
    en: "scar removal Dnipro, acne scar laser treatment Ukraine, pigmentation spots removal, CO₂ laser skin resurfacing, AcuPulse CO₂ Ukraine, M22 Stellar Black IPL, fractional laser scars, keloid scar treatment",
  },
  sort_order: 3,
  sections: [
    {
      type: "richText",
      heading: {
        uk: "AcuPulse CO₂ та M22 Stellar Black — лазерне та IPL-лікування шкіри в GENEVITY",
        ru: "AcuPulse CO₂ и M22 Stellar Black — лазерное и IPL-лечение кожи в GENEVITY",
        en: "AcuPulse CO₂ and M22 Stellar Black — Laser and IPL Skin Treatment at GENEVITY",
      },
      body: {
        uk: "Проблеми шкіри — акне-шрами, пігментні плями, судинні сітки, нерівна текстура — довгий час вважалися незворотними або потребували агресивних хімічних пілінгів та хірургічних методів. Сучасні апарати AcuPulse CO₂ та M22 Stellar Black від Lumenis змінили цей підхід: тепер більшість дефектів шкіри вирішується прецизійними медичними лазерами без тривалого відновлення та ризику пігментних ускладнень.\n\nAcuPulse CO₂ — фракційний вуглекислотний лазер нового покоління. Лазерний промінь створює мікроскопічні зони теплового впливу (мікротермальні зони — МТЗ) у дермі, запускаючи природний механізм регенерації та синтезу нового колагену. Навколишня незачеплена шкіра прискорює загоєння, забезпечуючи ефект «шліфування» без суцільного ранового покриття. AcuPulse ефективний при атрофічних шрамах від акне, зморшках, нерівній текстурі, млявості шкіри та постопераційних рубцях.\n\nM22 Stellar Black (Lumenis) — мультиплатформна система IPL + ResurFX. IPL (Intense Pulsed Light) знищує меланін у пігментних плямах та оксигемоглобін у розширених судинах, не пошкоджуючи оточуючу шкіру. Модуль ResurFX — нещодавно додана фракційна насадка для стимуляції колагену та усунення дрібних шрамів. M22 — золотий стандарт для фотоомолодження, лікування куперозу та розацеа, корекції веснянок та мелазми.\n\nВ GENEVITY обидва апарати використовуються лікарями з досвідом у дерматокосметології. Вибір між лазером CO₂ та IPL залежить від типу проблеми, тону шкіри та бажаного часу відновлення. Лікар визначає оптимальний метод на консультації.",
        ru: "Проблемы кожи — шрамы от акне, пигментные пятна, сосудистые сеточки, неровная текстура — долгое время считались необратимыми или требовали агрессивных химических пилингов и хирургических методов. Современные аппараты AcuPulse CO₂ и M22 Stellar Black от Lumenis изменили этот подход: теперь большинство дефектов кожи решается прецизионными медицинскими лазерами без длительного восстановления и риска пигментных осложнений.\n\nAcuPulse CO₂ — фракционный углекислотный лазер нового поколения. Лазерный луч создаёт микроскопические зоны теплового воздействия (микротермальные зоны — МТЗ) в дерме, запуская естественный механизм регенерации и синтеза нового коллагена. Окружающая неповреждённая кожа ускоряет заживление, обеспечивая эффект «шлифовки» без сплошного раневого покрытия. AcuPulse эффективен при атрофических шрамах от акне, морщинах, неровной текстуре, дряблости кожи и послеоперационных рубцах.\n\nM22 Stellar Black (Lumenis) — мультиплатформная система IPL + ResurFX. IPL (Intense Pulsed Light) уничтожает меланин в пигментных пятнах и оксигемоглобин в расширенных сосудах, не повреждая окружающую кожу. Модуль ResurFX — недавно добавленная фракционная насадка для стимуляции коллагена и устранения мелких шрамов. M22 — золотой стандарт для фотоомоложения, лечения купероза и розацеа, коррекции веснушек и мелазмы.\n\nВ GENEVITY оба аппарата используются врачами с опытом в дерматокосметологии. Выбор между лазером CO₂ и IPL зависит от типа проблемы, тона кожи и желаемого времени восстановления. Врач определяет оптимальный метод на консультации.",
        en: "Skin problems — acne scars, pigmentation spots, vascular networks, uneven texture — were long considered irreversible or requiring aggressive chemical peels and surgical methods. Modern AcuPulse CO₂ and M22 Stellar Black devices from Lumenis have changed this: most skin defects can now be addressed with precision medical lasers without prolonged recovery or pigmentation complications.\n\nAcuPulse CO₂ is a next-generation fractional carbon dioxide laser. The laser beam creates microscopic thermal injury zones (micro-thermal zones — MTZ) in the dermis, activating the natural regeneration mechanism and new collagen synthesis. Surrounding intact skin accelerates healing, delivering a 'resurfacing' effect without a full wound surface. AcuPulse is effective for atrophic acne scars, wrinkles, uneven texture, skin laxity and post-surgical scars.\n\nM22 Stellar Black (Lumenis) is a multi-platform IPL + ResurFX system. IPL (Intense Pulsed Light) destroys melanin in pigmentation spots and oxyhaemoglobin in dilated vessels without damaging surrounding skin. The ResurFX module is a recently added fractional attachment for collagen stimulation and minor scar correction. M22 is the gold standard for photorejuvenation, rosacea and couperose treatment, freckle and melasma correction.\n\nAt GENEVITY both devices are operated by doctors with experience in dermatocosmology. The choice between CO₂ laser and IPL depends on the type of problem, skin tone and desired recovery time. The doctor identifies the optimal method at consultation.",
      },
    },
    {
      type: "bullets",
      heading: {
        uk: "Які проблеми шкіри вирішують AcuPulse CO₂ та M22 Stellar Black",
        ru: "Какие проблемы кожи решают AcuPulse CO₂ и M22 Stellar Black",
        en: "Skin Problems Addressed by AcuPulse CO₂ and M22 Stellar Black",
      },
      items: [
        { uk: "Атрофічні шрами від акне (льодоруб, кочани, рухомі шрами) — AcuPulse CO₂ фракційне шліфування", ru: "Атрофические шрами от акне (ледоруб, волнистые, рассыпные шрамы) — AcuPulse CO₂ фракционная шлифовка", en: "Atrophic acne scars (ice-pick, rolling, boxcar) — AcuPulse CO₂ fractional resurfacing" },
        { uk: "Постопераційні та травматичні рубці — фракційне лазерне ремоделювання", ru: "Послеоперационные и травматические рубцы — фракционное лазерное ремоделирование", en: "Post-surgical and traumatic scars — fractional laser remodelling" },
        { uk: "Вікова та сонячна пігментація (лентиго, пігментні плями) — M22 IPL", ru: "Возрастная и солнечная пигментация (лентиго, пигментные пятна) — M22 IPL", en: "Age and sun-related pigmentation (lentigo, dark spots) — M22 IPL" },
        { uk: "Мелазма та постзапальна гіперпігментація — M22 IPL з протоколом контролю пігменту", ru: "Мелазма и постзапалительная гиперпигментация — M22 IPL с протоколом контроля пигмента", en: "Melasma and post-inflammatory hyperpigmentation — M22 IPL with pigment control protocol" },
        { uk: "Куперозу (розширені капіляри, судинна сіточка) та розацеа — M22 IPL судинний протокол", ru: "Купероз (расширенные капилляры, сосудистая сеточка) и розацеа — M22 IPL сосудистый протокол", en: "Couperose (dilated capillaries, vascular network) and rosacea — M22 IPL vascular protocol" },
        { uk: "Дрібні зморшки, нерівна текстура та тьмяність шкіри — AcuPulse CO₂ або M22 ResurFX", ru: "Мелкие морщины, неровная текстура и тусклость кожи — AcuPulse CO₂ или M22 ResurFX", en: "Fine wrinkles, uneven texture and dullness — AcuPulse CO₂ or M22 ResurFX" },
        { uk: "Розширені пори та жирна шкіра — AcuPulse фракційний протокол", ru: "Расширенные поры и жирная кожа — AcuPulse фракционный протокол", en: "Enlarged pores and oily skin — AcuPulse fractional protocol" },
      ],
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: { uk: "Показання до лазерного та IPL-лікування шкіри", ru: "Показания к лазерному и IPL-лечению кожи", en: "Indications for Laser and IPL Skin Treatment" },
      indications: [
        { uk: "Шрами від акне (атрофічні, гіпертрофічні, нормотрофічні)", ru: "Шрамы от акне (атрофические, гипертрофические, нормотрофические)", en: "Acne scars (atrophic, hypertrophic, normotrophic)" },
        { uk: "Постопераційні та травматичні рубці", ru: "Послеоперационные и травматические рубцы", en: "Post-surgical and traumatic scars" },
        { uk: "Пігментні плями: веснянки, лентиго, мелазма, постзапальна пігментація", ru: "Пигментные пятна: веснушки, лентиго, мелазма, постзапалительная пигментация", en: "Pigmentation: freckles, lentigo, melasma, post-inflammatory hyperpigmentation" },
        { uk: "Куперозу, розширені судини та розацеа", ru: "Купероз, расширенные сосуды и розацеа", en: "Couperose, dilated vessels and rosacea" },
        { uk: "Фотостаріння, нерівна текстура та дрібні зморшки", ru: "Фотостарение, неровная текстура и мелкие морщины", en: "Photoageing, uneven texture and fine wrinkles" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Активна фаза акне або запалення у зоні обробки", ru: "Активная фаза акне или воспаления в зоне обработки", en: "Active acne or inflammation in the treatment area" },
        { uk: "Засмага або темний фототип шкіри (IV–VI) без попередньої підготовки для IPL", ru: "Загар или тёмный фототип кожи (IV–VI) без предварительной подготовки для IPL", en: "Tan or dark skin phototype (IV–VI) without prior preparation for IPL" },
        { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
        { uk: "Прийом ізотретиноїну (Роаккутан) менше 6 місяців тому", ru: "Приём изотретиноина (Роаккутан) менее 6 месяцев назад", en: "Isotretinoin (Roaccutane) use within the past 6 months" },
        { uk: "Онкологічні захворювання та схильність до гіпертрофічних рубців", ru: "Онкологические заболевания и склонность к гипертрофическим рубцам", en: "Active oncological conditions and tendency to hypertrophic scarring" },
      ],
    },
    {
      type: "steps",
      heading: {
        uk: "Як відбувається лікування шрамів і пігментації в GENEVITY",
        ru: "Как проходит лечение шрамов и пигментации в GENEVITY",
        en: "How Scar and Pigmentation Treatment Works at GENEVITY",
      },
      steps: [
        {
          title: { uk: "Консультація та визначення протоколу", ru: "Консультация и определение протокола", en: "Consultation and protocol definition" },
          body: { uk: "Лікар оцінює тип і глибину шрамів або характер пігментації, фототип шкіри, наявність активного запалення. Визначає апарат і параметри: AcuPulse CO₂ або M22 IPL/ResurFX, кількість сеансів, інтервали.", ru: "Врач оценивает тип и глубину шрамов или характер пигментации, фототип кожи, наличие активного воспаления. Определяет аппарат и параметры: AcuPulse CO₂ или M22 IPL/ResurFX, количество сеансов, интервалы.", en: "The doctor assesses the type and depth of scars or pigmentation pattern, skin phototype and active inflammation. Determines device and parameters: AcuPulse CO₂ or M22 IPL/ResurFX, number of sessions and intervals." },
        },
        {
          title: { uk: "Підготовка шкіри (для AcuPulse CO₂)", ru: "Подготовка кожи (для AcuPulse CO₂)", en: "Skin preparation (for AcuPulse CO₂)" },
          body: { uk: "За 4–6 тижнів до фракційного CO₂ призначається депігментуюча програма (крем з азелаїновою кислотою, ретинол) для профілактики постзапальної пігментації. Перед процедурою наноситься анестезуючий крем.", ru: "За 4–6 недель до фракционного CO₂ назначается депигментирующая программа (крем с азелаиновой кислотой, ретинол) для профилактики постзапалительной пигментации. Перед процедурой наносится анестезирующий крем.", en: "4–6 weeks before fractional CO₂, a depigmenting programme is prescribed (azelaic acid cream, retinol) to prevent post-inflammatory pigmentation. Anaesthetic cream is applied before the procedure." },
        },
        {
          title: { uk: "Процедура та відновний період", ru: "Процедура и восстановительный период", en: "Procedure and recovery period" },
          body: { uk: "AcuPulse CO₂: почервоніння та мікроскоринки 3–7 днів. M22 IPL: мінімальний відновний період, темніння пігментних плям з відшаруванням через 7–14 днів. Лікар надає детальний протокол догляду.", ru: "AcuPulse CO₂: покраснение и микрокорочки 3–7 дней. M22 IPL: минимальный восстановительный период, потемнение пигментных пятен с отшелушиванием через 7–14 дней. Врач предоставляет подробный протокол ухода.", en: "AcuPulse CO₂: redness and micro-scabbing 3–7 days. M22 IPL: minimal recovery, darkening of pigmentation spots followed by shedding in 7–14 days. The doctor provides a detailed aftercare protocol." },
        },
        {
          title: { uk: "Оцінка результату та підтримуючий протокол", ru: "Оценка результата и поддерживающий протокол", en: "Result assessment and maintenance protocol" },
          body: { uk: "Через 4–8 тижнів лікар оцінює динаміку. Для глибоких шрамів може знадобитись 2–3 сеанси. Підтримуюча програма включає SPF 50+ щодня та домашній догляд з відновлюючими компонентами.", ru: "Через 4–8 недель врач оценивает динамику. Для глубоких шрамов может потребоваться 2–3 сеанса. Поддерживающая программа включает SPF 50+ ежедневно и домашний уход с восстанавливающими компонентами.", en: "After 4–8 weeks the doctor assesses progress. Deep scars may require 2–3 sessions. The maintenance programme includes daily SPF 50+ and home care with regenerating ingredients." },
        },
      ],
    },
    {
      type: "callout",
      tone: "info",
      body: {
        uk: "AcuPulse CO₂ — фракційний CO₂ лазер Lumenis, який є золотим стандартом для шліфування шрамів від акне у світовій дерматологічній практиці. Клінічні дослідження підтверджують зменшення глибини атрофічних шрамів на 50–70% після 2–3 сеансів.",
        ru: "AcuPulse CO₂ — фракционный CO₂ лазер Lumenis, являющийся золотым стандартом для шлифовки шрамов от акне в мировой дерматологической практике. Клинические исследования подтверждают уменьшение глубины атрофических шрамов на 50–70% после 2–3 сеансов.",
        en: "AcuPulse CO₂ is a Lumenis fractional CO₂ laser — the gold standard for acne scar resurfacing in global dermatology practice. Clinical studies confirm a 50–70% reduction in atrophic scar depth after 2–3 sessions.",
      },
    },
    {
      type: "imageGallery",
      heading: {
        uk: "Клініка GENEVITY та лазерне обладнання",
        ru: "Клиника GENEVITY и лазерное оборудование",
        en: "GENEVITY Clinic and Laser Equipment",
      },
      images: [
        { url: "/images/equipment/acupulse2.webp", alt: "AcuPulse CO₂ у GENEVITY" },
        { url: "/images/equipment/Lumenis M22.webp", alt: "M22 Stellar Black у GENEVITY" },
        ...interiorImages,
      ],
    },
    {
      type: "cta",
      heading: { uk: "Запишіться на лікування шкіри в GENEVITY", ru: "Запишитесь на лечение кожи в GENEVITY", en: "Book Skin Treatment at GENEVITY" },
      body: { uk: "Безкоштовна консультація дерматолога-косметолога: діагностика шрамів і пігментації, підбір протоколу лікування та розрахунок курсу.", ru: "Бесплатная консультация дерматолога-косметолога: диагностика шрамов и пигментации, подбор протокола лечения и расчёт курса.", en: "Free dermatocosmologist consultation: scar and pigmentation assessment, treatment protocol selection and course calculation." },
      ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
      ctaHref: "/kontakty",
    },
  ],
  faqs: [
    {
      question: { uk: "Чи можна повністю прибрати шрами від акне лазером?", ru: "Можно ли полностью убрать шрамы от акне лазером?", en: "Can acne scars be completely removed by laser?" },
      answer: { uk: "Повне видалення залежить від типу та глибини шраму. Поверхневі та рухомі шрами (rolling scars) коригуються на 70–80%, глибокі льодорубні (ice-pick) — на 40–60% за курс із 2–3 сеансів AcuPulse CO₂. Для максимального результату поєднують лазер із мікроголковою терапією або субцизією. Лікар-косметолог оцінює ваші шрами індивідуально.", ru: "Полное удаление зависит от типа и глубины шрама. Поверхностные и подвижные шрамы (rolling scars) корректируются на 70–80%, глубокие ледорубные (ice-pick) — на 40–60% за курс из 2–3 сеансов AcuPulse CO₂. Для максимального результата сочетают лазер с микроигольчатой терапией или субцизией. Врач-косметолог оценивает ваши шрамы индивидуально.", en: "Complete removal depends on scar type and depth. Superficial and rolling scars improve 70–80%; deep ice-pick scars 40–60% over a course of 2–3 AcuPulse CO₂ sessions. For maximum results, laser is combined with micro-needling or subcision. Your cosmetic doctor assesses each case individually." },
    },
    {
      question: { uk: "Скільки часу займає відновлення після AcuPulse CO₂?", ru: "Сколько времени занимает восстановление после AcuPulse CO₂?", en: "How long is recovery after AcuPulse CO₂?" },
      answer: { uk: "При фракційному режимі (не абляційному): почервоніння та відчуття тепла 1–2 дні, мікроскоринки 3–5 днів, повне загоєння 5–7 днів. Для більш глибоких шрамів (більш агресивний протокол): відновлення 7–10 днів. Протягом першого місяця необхідно уникати прямого сонця та використовувати SPF 50+.", ru: "При фракционном режиме (не абляционном): покраснение и ощущение тепла 1–2 дня, микрокорочки 3–5 дней, полное заживление 5–7 дней. Для более глубоких шрамов (более агрессивный протокол): восстановление 7–10 дней. В течение первого месяца необходимо избегать прямого солнца и использовать SPF 50+.", en: "For fractional mode (non-ablative): redness and warmth 1–2 days, micro-scabbing 3–5 days, full healing 5–7 days. For deeper scars (more aggressive protocol): recovery 7–10 days. Direct sun exposure must be avoided and SPF 50+ used for the first month." },
    },
    {
      question: { uk: "Чим відрізняється M22 IPL від лазерного лікування пігментації?", ru: "Чем отличается M22 IPL от лазерного лечения пигментации?", en: "How does M22 IPL differ from laser pigmentation treatment?" },
      answer: { uk: "IPL — це широкосмуговий світловий імпульс, а лазер — монохроматичний промінь. M22 IPL ефективніший для рівномірного дифузного фотоомолодження (безліч дрібних плям, загальний нерівний тон, судинна сітка). Лазер CO₂ — для глибшої роботи зі шрамами та вираженими одиничними дефектами. Вибір залежить від конкретної проблеми — лікар визначає після огляду.", ru: "IPL — это широкополосный световой импульс, а лазер — монохроматический луч. M22 IPL эффективнее для равномерного диффузного фотоомоложения (множество мелких пятен, общий неровный тон, сосудистая сетка). Лазер CO₂ — для более глубокой работы со шрамами и выраженными единичными дефектами. Выбор зависит от конкретной проблемы — врач определяет после осмотра.", en: "IPL is a broadband light pulse; laser is a monochromatic beam. M22 IPL is more effective for uniform diffuse photorejuvenation (multiple small spots, general uneven tone, vascular network). CO₂ laser is for deeper work on scars and pronounced individual defects. The choice depends on the specific problem — the doctor advises after examination." },
    },
    {
      question: { uk: "Скільки сеансів потрібно для видалення пігментних плям M22?", ru: "Сколько сеансов нужно для удаления пигментных пятен M22?", en: "How many M22 sessions are needed to remove pigmentation?" },
      answer: { uk: "Для більшості пігментних плям (лентиго, сонячна пігментація) достатньо 1–2 сеансів. Мелазма потребує 3–5 сеансів і підтримуючого протоколу. Після процедури пляма темніє на 5–7 днів, а потім відшаровується природним шляхом. Повторний огляд через 4–6 тижнів.", ru: "Для большинства пигментных пятен (лентиго, солнечная пигментация) достаточно 1–2 сеансов. Мелазма требует 3–5 сеансов и поддерживающего протокола. После процедуры пятно темнеет на 5–7 дней, а затем отшелушивается естественным путём. Повторный осмотр через 4–6 недель.", en: "For most pigmentation spots (lentigo, sun spots) 1–2 sessions are sufficient. Melasma requires 3–5 sessions and a maintenance protocol. After treatment the spot darkens for 5–7 days before naturally shedding. Follow-up review after 4–6 weeks." },
    },
    {
      question: { uk: "Чи можна робити лазерне шліфування влітку?", ru: "Можно ли делать лазерную шлифовку летом?", en: "Can laser resurfacing be done in summer?" },
      answer: { uk: "AcuPulse CO₂ краще планувати восени-взимку, коли активність сонця нижча. Влітку процедура можлива, але потребує суворого захисту SPF 50+ та уникнення прямого сонця 4–6 тижнів. M22 IPL не рекомендується на засмаглій шкірі. Лікар визначає індивідуально залежно від фототипу та способу життя.", ru: "AcuPulse CO₂ лучше планировать осенью-зимой, когда активность солнца ниже. Летом процедура возможна, но требует строгой защиты SPF 50+ и избегания прямого солнца 4–6 недель. M22 IPL не рекомендуется на загорелой коже. Врач определяет индивидуально в зависимости от фототипа и образа жизни.", en: "AcuPulse CO₂ is best planned for autumn-winter when sun activity is lower. Summer treatment is possible but requires strict SPF 50+ protection and avoiding direct sun for 4–6 weeks. M22 IPL is not recommended on tanned skin. The doctor advises based on phototype and lifestyle." },
    },
    {
      question: { uk: "Чи боляче лікувати шрами лазером?", ru: "Больно ли лечить шрамы лазером?", en: "Is laser scar treatment painful?" },
      answer: { uk: "AcuPulse CO₂: за 30–40 хвилин до процедури наноситься анестезуючий крем, тому дискомфорт мінімальний. Відчуття тепла та легкого поколювання є, але не інтенсивне. M22 IPL: відчуття схоже на легкий укол або клацання — більшість пацієнтів переносять без анестезії.", ru: "AcuPulse CO₂: за 30–40 минут до процедуры наносится анестезирующий крем, поэтому дискомфорт минимален. Ощущение тепла и лёгкого покалывания есть, но не интенсивное. M22 IPL: ощущение похоже на лёгкий укол или щелчок — большинство пациентов переносят без анестезии.", en: "AcuPulse CO₂: anaesthetic cream applied 30–40 minutes before means minimal discomfort. Some warmth and mild tingling occurs, but not intense. M22 IPL: the sensation is similar to a light snap or pinprick — most patients tolerate it without anaesthesia." },
    },
    {
      question: { uk: "Чи допоможе лазер при куперозі та червоній шкірі?", ru: "Поможет ли лазер при куперозе и красной коже?", en: "Does laser help with couperose and skin redness?" },
      answer: { uk: "Так. M22 Stellar Black з судинним IPL-протоколом — один із найефективніших методів лікування куперозу та дифузного почервоніння. IPL-імпульс нагріває оксигемоглобін у судинах, коагулюючи їх без пошкодження поверхні шкіри. Для розацеа зазвичай необхідно 2–4 сеанси.", ru: "Да. M22 Stellar Black с сосудистым IPL-протоколом — один из наиболее эффективных методов лечения купероза и диффузного покраснения. IPL-импульс нагревает оксигемоглобин в сосудах, коагулируя их без повреждения поверхности кожи. Для розацеа обычно необходимо 2–4 сеанса.", en: "Yes. M22 Stellar Black with the vascular IPL protocol is one of the most effective methods for treating couperose and diffuse redness. The IPL pulse heats oxyhaemoglobin in the vessels, coagulating them without damaging the skin surface. Rosacea typically requires 2–4 sessions." },
    },
    {
      question: { uk: "Чи можна поєднувати AcuPulse CO₂ з ін'єкційними процедурами?", ru: "Можно ли сочетать AcuPulse CO₂ с инъекционными процедурами?", en: "Can AcuPulse CO₂ be combined with injectable treatments?" },
      answer: { uk: "Так. AcuPulse CO₂ добре поєднується з біоревіталізацією та PRP-терапією — ці методи прискорюють відновлення та посилюють стимуляцію колагену. Ін'єкції філерів у зону шрамів роблять до або через 4–6 тижнів після лазера. Ботулінотерапія — незалежно від лазерного курсу. Лікар складає послідовність процедур індивідуально.", ru: "Да. AcuPulse CO₂ хорошо сочетается с биоревитализацией и PRP-терапией — эти методы ускоряют восстановление и усиливают стимуляцию коллагена. Инъекции филлеров в зону шрамов делают до или через 4–6 недель после лазера. Ботулинотерапия — независимо от лазерного курса. Врач составляет последовательность процедур индивидуально.", en: "Yes. AcuPulse CO₂ combines well with biorevitalisation and PRP therapy — these accelerate recovery and enhance collagen stimulation. Filler injections into the scar area are done before or 4–6 weeks after laser. Botulinum therapy can be done independently of the laser course. The doctor plans the procedure sequence individually." },
    },
  ],
};

// ─── DB OPERATIONS ────────────────────────────────────────────────────────────

async function deleteOldServices() {
  console.log("Deleting 11 old apparatus service pages...");
  for (const slug of OLD_SLUGS) {
    const rows = await sql`SELECT id FROM services WHERE slug = ${slug} AND category_id = ${CATEGORY_ID}`;
    if (!rows[0]) { console.log(`  ⚠ not found: ${slug}`); continue; }
    const id: string = rows[0].id;
    await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${id}`;
    await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${id}`;
    await sql`DELETE FROM services WHERE id = ${id}`;
    console.log(`  ✓ deleted: ${slug}`);
  }
}

async function createService(s: ServiceData) {
  // Upsert: delete if slug exists (safety), then insert fresh
  const existing = await sql`SELECT id FROM services WHERE slug = ${s.slug} AND category_id = ${CATEGORY_ID}`;
  if (existing[0]) {
    const eid: string = existing[0].id;
    await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${eid}`;
    await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${eid}`;
    await sql`DELETE FROM services WHERE id = ${eid}`;
  }

  const newId = await sql`
    INSERT INTO services (
      slug, category_id,
      title_uk, title_ru, title_en,
      h1_uk, h1_ru, h1_en,
      summary_uk, summary_ru, summary_en,
      procedure_length_uk, procedure_length_ru, procedure_length_en,
      effect_duration_uk, effect_duration_ru, effect_duration_en,
      sessions_recommended_uk, sessions_recommended_ru, sessions_recommended_en,
      price_from_uk, price_from_ru, price_from_en,
      price_unit_uk, price_unit_ru, price_unit_en,
      seo_title_uk, seo_title_ru, seo_title_en,
      seo_desc_uk, seo_desc_ru, seo_desc_en,
      seo_keywords_uk, seo_keywords_ru, seo_keywords_en,
      sort_order
    ) VALUES (
      ${s.slug}, ${CATEGORY_ID},
      ${s.title.uk}, ${s.title.ru}, ${s.title.en},
      ${s.h1.uk}, ${s.h1.ru}, ${s.h1.en},
      ${s.summary.uk}, ${s.summary.ru}, ${s.summary.en},
      ${s.procedure_length.uk}, ${s.procedure_length.ru}, ${s.procedure_length.en},
      ${s.effect_duration.uk}, ${s.effect_duration.ru}, ${s.effect_duration.en},
      ${s.sessions_recommended.uk}, ${s.sessions_recommended.ru}, ${s.sessions_recommended.en},
      ${s.price_from.uk}, ${s.price_from.ru}, ${s.price_from.en},
      ${s.price_unit.uk}, ${s.price_unit.ru}, ${s.price_unit.en},
      ${s.seo_title.uk}, ${s.seo_title.ru}, ${s.seo_title.en},
      ${s.seo_desc.uk}, ${s.seo_desc.ru}, ${s.seo_desc.en},
      ${s.seo_keywords.uk}, ${s.seo_keywords.ru}, ${s.seo_keywords.en},
      ${s.sort_order}
    ) RETURNING id
  `;
  const serviceId: string = newId[0].id;

  const sectionIds: string[] = [];
  for (let i = 0; i < s.sections.length; i++) {
    const sec = s.sections[i];
    const secId = randomUUID();
    sectionIds.push(secId);
    await sql`INSERT INTO content_sections(id,owner_type,owner_id,sort_order,section_type,data)
      VALUES(${secId},'service',${serviceId},${i},${sec.type}::section_type,${JSON.stringify(sd(sec))}::jsonb)`;
  }

  for (let i = 0; i < s.faqs.length; i++) {
    const f = s.faqs[i];
    await sql`INSERT INTO faq_items(id,owner_type,owner_id,sort_order,question_uk,question_ru,question_en,answer_uk,answer_ru,answer_en)
      VALUES(${randomUUID()},'service',${serviceId},${i},${f.question.uk},${f.question.ru},${f.question.en},${f.answer.uk},${f.answer.ru},${f.answer.en})`;
  }

  const blockOrder = [...sectionIds.map(id => `section:${id}`), "faq", "doctors", "equipment", "relatedServices", "finalCTA"];
  await sql`UPDATE services SET block_order = ${blockOrder} WHERE id = ${serviceId}`;

  console.log(`  ✓ created: ${s.slug} — ${s.sections.length} sections, ${s.faqs.length} FAQs`);
}

async function main() {
  await deleteOldServices();
  console.log("\nCreating 3 hub pages...");
  await createService(face);
  await createService(body);
  await createService(skin);
  await sql.end();
  console.log("\n✅ Apparatus hub pages DONE.");
}

main().catch(e => { console.error(e); process.exit(1); });
