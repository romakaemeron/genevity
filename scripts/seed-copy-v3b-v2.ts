/**
 * V3b-v2 — EMSCULPT NEO, Ultraformer MPT Body, EXION Body
 * Re-seeds with section variety: richText + indicationsContraindications + steps + bullets
 * Run: npx tsx scripts/seed-copy-v3b-v2.ts
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

type RichTextSection = {
  type: "richText";
  heading: L;
  body: L;
  calloutBody?: L;
  heroImage?: string | null;
};
type IndicationsSection = {
  type: "indicationsContraindications";
  indicationsHeading: L;
  indications: L[];
  contraindicationsHeading: L;
  contraindications: L[];
};
type StepsSection = {
  type: "steps";
  heading: L;
  steps: { title: L; description: L }[];
};
type BulletsSection = {
  type: "bullets";
  heading: L;
  items: L[];
};
type AnySection = RichTextSection | IndicationsSection | StepsSection | BulletsSection;

interface FaqCopy { question: L; answer: L; }
interface ServiceCopy {
  slug: string;
  summary: L;
  sections: AnySection[];
  faq: FaqCopy[];
}

function sectionData(s: AnySection): object {
  if (s.type === "richText") {
    return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: s.heroImage ?? null };
  }
  if (s.type === "indicationsContraindications") {
    return {
      indicationsHeading: s.indicationsHeading,
      indications: s.indications,
      contraindicationsHeading: s.contraindicationsHeading,
      contraindications: s.contraindications,
    };
  }
  if (s.type === "steps") {
    return { heading: s.heading, steps: s.steps };
  }
  if (s.type === "bullets") {
    return { heading: s.heading, items: s.items };
  }
  return {};
}

const SERVICES: ServiceCopy[] = [
  // ─── EMSCULPT NEO ──────────────────────────────────────────────────────────
  {
    slug: "emsculpt-neo",
    summary: {
      uk: "EMSCULPT NEO у GENEVITY — єдина сертифікована апаратна процедура, яка одночасно нарощує м'язи і зменшує жирові відкладення. Синхронізована дія HIFEM і RF за 30 хвилин відповідає 20 000 м'язових скорочень. Клінічно підтверджено: +25% до м'язової маси, –30% жиру після курсу.",
      ru: "EMSCULPT NEO в GENEVITY — единственная сертифицированная аппаратная процедура, которая одновременно наращивает мышцы и уменьшает жировые отложения. Синхронизированное действие HIFEM и RF за 30 минут эквивалентно 20 000 мышечных сокращений. Клинически подтверждено: +25% мышечной массы, –30% жира после курса.",
      en: "EMSCULPT NEO at GENEVITY is the only certified device procedure that simultaneously builds muscle and reduces fat. The synchronized HIFEM + RF action in 30 minutes equals 20,000 muscle contractions. Clinically proven: +25% muscle mass, –30% fat after a course.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Що таке EMSCULPT NEO і як він працює",
          ru: "Что такое EMSCULPT NEO и как он работает",
          en: "What Is EMSCULPT NEO and How It Works",
        },
        body: {
          uk: "EMSCULPT NEO поєднує два медичних технологічних рішення в одному аплікаторі: HIFEM (High-Intensity Focused Electromagnetic energy) для глибокої нейром'язової стимуляції та синхронізований радіочастотний нагрів, який розігріває підшкірний жир до температури апоптозу. Результат: за одну 30-хвилинну сесію виникає до 20 000 надмаксимальних м'язових скорочень — таких, що неможливі при звичайних тренуваннях. Жирові клітини руйнуються необоротно, а м'яз адаптується і гіпертрофується. Це єдина процедура в Україні, яка одночасно і спалює жир, і збільшує м'язову масу без відновлювального періоду.",
          ru: "EMSCULPT NEO объединяет два медицинских технологических решения в одном аппликаторе: HIFEM (High-Intensity Focused Electromagnetic energy) для глубокой нейромышечной стимуляции и синхронизированный радиочастотный нагрев, который разогревает подкожный жир до температуры апоптоза. Результат: за одну 30-минутную сессию возникает до 20 000 суперсильных мышечных сокращений — таких, которые невозможны при обычных тренировках. Жировые клетки разрушаются необратимо, а мышца адаптируется и гипертрофируется. Это единственная процедура в Украине, которая одновременно сжигает жир и наращивает мышечную массу без восстановительного периода.",
          en: "EMSCULPT NEO combines two medical technologies in one applicator: HIFEM (High-Intensity Focused Electromagnetic energy) for deep neuromuscular stimulation and synchronized radiofrequency heating that warms subcutaneous fat to apoptosis temperature. The result: up to 20,000 supramaximal muscle contractions per 30-minute session — impossible through conventional exercise. Fat cells are permanently destroyed while the muscle adapts and hypertrophies. It is the only procedure in Ukraine that simultaneously burns fat and builds muscle mass with zero downtime.",
        },
        calloutBody: {
          uk: "Клінічні дослідження BTL підтверджують: після курсу з 4 процедур — в середньому +25% м'язової маси та –30% жирової тканини у зоні обробки.",
          ru: "Клинические исследования BTL подтверждают: после курса из 4 процедур — в среднем +25% мышечной массы и –30% жировой ткани в зоне обработки.",
          en: "BTL clinical studies confirm: after a 4-session course — an average of +25% muscle mass and –30% fat tissue in the treated area.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до EMSCULPT NEO",
          ru: "Показания к EMSCULPT NEO",
          en: "Indications for EMSCULPT NEO",
        },
        indications: [
          { uk: "Ослаблені м'язи живота після вагітності або хірургії", ru: "Ослабленные мышцы живота после беременности или хирургии", en: "Weakened abdominal muscles after pregnancy or surgery" },
          { uk: "Дифузне жировідкладення на животі, стегнах, руках", ru: "Диффузное жироотложение на животе, бёдрах, руках", en: "Diffuse fat deposits on abdomen, thighs, arms" },
          { uk: "Бажання скорегувати форму тіла без хірургії та дієти", ru: "Желание скорректировать форму тела без хирургии и диеты", en: "Desire to reshape the body without surgery or diet" },
          { uk: "Зміцнення сідничних м'язів (ефект ліфтингу)", ru: "Укрепление ягодичных мышц (эффект лифтинга)", en: "Gluteal muscle toning (lifting effect)" },
          { uk: "Реабілітація після травм та атрофія м'язів", ru: "Реабилитация после травм и атрофия мышц", en: "Post-injury rehabilitation and muscle atrophy" },
          { uk: "Підтримання спортивної форми і прискорення відновлення", ru: "Поддержание спортивной формы и ускорение восстановления", en: "Maintaining athletic form and accelerating recovery" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Металеві імплантати або кардіостимулятор у зоні обробки", ru: "Металлические имплантаты или кардиостимулятор в зоне обработки", en: "Metal implants or pacemaker in the treatment area" },
          { uk: "Вагітність", ru: "Беременность", en: "Pregnancy" },
          { uk: "Злоякісні новоутворення", ru: "Злокачественные новообразования", en: "Malignant neoplasms" },
          { uk: "Епілепсія та судомний синдром", ru: "Эпилепсия и судорожный синдром", en: "Epilepsy and seizure disorders" },
          { uk: "Гострі запальні процеси та інфекції", ru: "Острые воспалительные процессы и инфекции", en: "Acute inflammatory processes and infections" },
        ],
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить процедура EMSCULPT NEO",
          ru: "Как проходит процедура EMSCULPT NEO",
          en: "How the EMSCULPT NEO Procedure Works",
        },
        steps: [
          {
            title: { uk: "Консультація та картографування", ru: "Консультация и картографирование", en: "Consultation and Mapping" },
            description: { uk: "Лікар оцінює зони корекції, вимірює м'язову масу та жировий шар, погоджує протокол і кількість аплікаторів.", ru: "Врач оценивает зоны коррекции, измеряет мышечную массу и жировой слой, согласовывает протокол и количество аппликаторов.", en: "The physician assesses correction zones, measures muscle mass and fat layer, and agrees on the protocol and number of applicators." },
          },
          {
            title: { uk: "Підготовка і фіксація аплікаторів", ru: "Подготовка и фиксация аппликаторов", en: "Preparation and Applicator Placement" },
            description: { uk: "Аплікатори фіксуються ременями на цільових ділянках без будь-якого знеболення — процедура безболісна.", ru: "Аппликаторы фиксируются ремнями на целевых участках без какого-либо обезболивания — процедура безболезненна.", en: "Applicators are strapped to target areas without any anesthesia — the procedure is painless." },
          },
          {
            title: { uk: "30-хвилинна сесія HIFEM + RF", ru: "30-минутная сессия HIFEM + RF", en: "30-Minute HIFEM + RF Session" },
            description: { uk: "Ви відчуваєте інтенсивні м'язові скорочення та приємне тепло. Режими автоматично змінюються за запрограмованим протоколом BTL.", ru: "Вы чувствуете интенсивные мышечные сокращения и приятное тепло. Режимы автоматически меняются по запрограммованному протоколу BTL.", en: "You feel intense muscle contractions and pleasant warmth. Modes change automatically following the BTL programmed protocol." },
          },
          {
            title: { uk: "Завершення та рекомендації", ru: "Завершение и рекомендации", en: "Completion and Recommendations" },
            description: { uk: "Аплікатори знімають, лікар фіксує відчуття, дає поради щодо водного режиму і рекомендує наступну сесію через 5–7 днів.", ru: "Аппликаторы снимают, врач фиксирует ощущения, даёт советы по водному режиму и рекомендует следующую сессию через 5–7 дней.", en: "Applicators are removed, the physician records sensations, advises on hydration, and recommends the next session in 5–7 days." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та особливості EMSCULPT NEO",
          ru: "Преимущества и особенности EMSCULPT NEO",
          en: "EMSCULPT NEO Advantages and Key Facts",
        },
        items: [
          { uk: "Єдина технологія, що одночасно нарощує м'язи і спалює жир", ru: "Единственная технология, одновременно наращивающая мышцы и сжигающая жир", en: "The only technology that simultaneously builds muscle and burns fat" },
          { uk: "Результат помітний після першої сесії, максимум — через 3 місяці", ru: "Результат заметен после первой сесии, максимум — через 3 месяца", en: "Results visible after the first session, peak at 3 months" },
          { uk: "Немає розрізів, анестезії, відновлювального періоду", ru: "Нет разрезов, анестезии, восстановительного периода", en: "No incisions, anesthesia, or recovery period" },
          { uk: "Схвалено FDA та CE — безпека підтверджена 30+ клінічними дослідженнями", ru: "Одобрено FDA и CE — безопасность подтверждена 30+ клиническими исследованиями", en: "FDA and CE approved — safety confirmed by 30+ clinical studies" },
          { uk: "⚠ Ефект залежить від кількості сесій — мінімум 4 процедури для стійкого результату", ru: "⚠ Эффект зависит от количества сессий — минимум 4 процедуры для стойкого результата", en: "⚠ Effect depends on number of sessions — minimum 4 procedures for lasting results" },
          { uk: "⚠ Не замінює повноцінне харчування і фізичне навантаження — підсилює і закріплює їх", ru: "⚠ Не заменяет полноценное питание и физическую нагрузку — усиливает и закрепляет их", en: "⚠ Does not replace proper nutrition and exercise — it amplifies and reinforces them" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Скільки потрібно процедур EMSCULPT NEO?", ru: "Сколько нужно процедур EMSCULPT NEO?", en: "How many EMSCULPT NEO sessions are needed?" },
        answer: { uk: "Стандартний курс — 4 сесії по 30 хвилин з інтервалом 5–7 днів. Підтримувальна процедура — раз на 3–6 місяців.", ru: "Стандартный курс — 4 сессии по 30 минут с интервалом 5–7 дней. Поддерживающая процедура — раз в 3–6 месяцев.", en: "The standard course is 4 sessions of 30 minutes each, 5–7 days apart. A maintenance session every 3–6 months." },
      },
      {
        question: { uk: "Чи боляче під час процедури?", ru: "Больно ли во время процедуры?", en: "Is the procedure painful?" },
        answer: { uk: "Ні. Ви відчуваєте сильні м'язові скорочення і тепло — як після дуже інтенсивного тренування, але без болю. Інтенсивність налаштовується індивідуально.", ru: "Нет. Вы чувствуете сильные мышечные сокращения и тепло — как после очень интенсивной тренировки, но без боли. Интенсивность настраивается индивидуально.", en: "No. You feel strong muscle contractions and warmth — like after a very intense workout, but without pain. Intensity is adjusted individually." },
      },
      {
        question: { uk: "Коли буде помітний результат?", ru: "Когда будет заметен результат?", en: "When will results be visible?" },
        answer: { uk: "Після першої процедури — приємна м'язова втома. Видимий результат — через 2–4 тижні. Максимальний ефект — через 2–3 місяці після завершення курсу.", ru: "После первой процедуры — приятная мышечная усталость. Видимый результат — через 2–4 недели. Максимальный эффект — через 2–3 месяца после окончания курса.", en: "After the first session — pleasant muscle soreness. Visible results in 2–4 weeks. Maximum effect at 2–3 months after completing the course." },
      },
      {
        question: { uk: "Чи можна поєднувати EMSCULPT NEO з іншими процедурами?", ru: "Можно ли совмещать EMSCULPT NEO с другими процедурами?", en: "Can EMSCULPT NEO be combined with other procedures?" },
        answer: { uk: "Так. Добре поєднується з Ultraformer MPT для ліфтингу та підтяжки шкіри над обробленою ділянкою, а також із нутрицевтичними програмами GENEVITY.", ru: "Да. Хорошо сочетается с Ultraformer MPT для лифтинга и подтяжки кожи над обработанным участком, а также с нутрицевтическими программами GENEVITY.", en: "Yes. Works well with Ultraformer MPT for skin lifting and tightening over the treated area, and with GENEVITY nutraceutical programs." },
      },
      {
        question: { uk: "Хто може отримати процедуру?", ru: "Кто может получить процедуру?", en: "Who can have the procedure?" },
        answer: { uk: "Дорослі без металевих імплантів у зоні обробки, без кардіостимулятора, не вагітні. ІМТ може бути будь-яким — EMSCULPT NEO ефективний навіть при значному надлишку ваги.", ru: "Взрослые без металлических имплантов в зоне обработки, без кардиостимулятора, не беременные. ИМТ может быть любым — EMSCULPT NEO эффективен даже при значительном избытке веса.", en: "Adults without metal implants in the treatment area, no pacemaker, not pregnant. BMI can be any — EMSCULPT NEO is effective even with significant excess weight." },
      },
    ],
  },

  // ─── ULTRAFORMER MPT BODY ──────────────────────────────────────────────────
  {
    slug: "ultraformer-mpt-body",
    summary: {
      uk: "Ultraformer MPT Body у GENEVITY — ліфтинг і підтяжка шкіри тіла за допомогою мікро- і макрофокусованого ультразвуку. Коагулює підшкірний жир і стимулює вироблення колагену, що призводить до підтяжки без операцій і рубців.",
      ru: "Ultraformer MPT Body в GENEVITY — лифтинг и подтяжка кожи тела с помощью микро- и макрофокусированного ультразвука. Коагулирует подкожный жир и стимулирует выработку коллагена, обеспечивая подтяжку без операций и рубцов.",
      en: "Ultraformer MPT Body at GENEVITY — skin lifting and tightening using micro- and macro-focused ultrasound. Coagulates subcutaneous fat and stimulates collagen production for lift without surgery or scarring.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Ultraformer MPT Body — ультразвукове моделювання тіла",
          ru: "Ultraformer MPT Body — ультразвуковое моделирование тела",
          en: "Ultraformer MPT Body — Ultrasound Body Contouring",
        },
        body: {
          uk: "Ultraformer MPT — апарат корейського виробника CLASSYS, який використовує HIFU (High-Intensity Focused Ultrasound) для роботи з різними шарами тканин тіла. Для тілесного ліфтингу застосовують картриджі з різною глибиною фокуса: 4,5 мм (SMAS-шар), 3,0 мм (дерма), 6,0–13,0 мм (підшкірно-жировий шар). У зоні фокуса температура досягає 65–75 °C, що призводить до термічної коагуляції жирових клітин і теплового стресу для фібробластів. У відповідь організм запускає масштабний неоколагеногенез — утворення нових волокон колагену і еластину. Шкіра ущільнюється, підтягується і набуває видимого скульптурного рельєфу без жодних розрізів.",
          ru: "Ultraformer MPT — аппарат корейского производителя CLASSYS, использующий HIFU (High-Intensity Focused Ultrasound) для работы с различными слоями тканей тела. Для телесного лифтинга применяют картриджи с различной глубиной фокуса: 4,5 мм (SMAS-слой), 3,0 мм (дерма), 6,0–13,0 мм (подкожно-жировой слой). В зоне фокуса температура достигает 65–75 °C, что приводит к термической коагуляции жировых клеток и тепловому стрессу для фибробластов. В ответ организм запускает масштабный неоколлагеногенез — образование новых волокон коллагена и эластина. Кожа уплотняется, подтягивается и приобретает видимый скульптурный рельеф без каких-либо разрезов.",
          en: "Ultraformer MPT is a device by Korean manufacturer CLASSYS that uses HIFU (High-Intensity Focused Ultrasound) to work with different tissue layers. For body lifting, cartridges with different focal depths are used: 4.5 mm (SMAS layer), 3.0 mm (dermis), 6.0–13.0 mm (subcutaneous fat). In the focal zone, temperature reaches 65–75 °C, causing thermal coagulation of fat cells and heat stress for fibroblasts. The body responds with large-scale neocollagenogenesis — formation of new collagen and elastin fibers. Skin densifies, tightens, and gains visible sculpted relief without any incisions.",
        },
        calloutBody: {
          uk: "Ultraformer MPT Body — ідеальне доповнення до EMSCULPT NEO: поки EMSCULPT нарощує м'яз і спалює жир, Ultraformer підтягує шкіру над обробленою зоною.",
          ru: "Ultraformer MPT Body — идеальное дополнение к EMSCULPT NEO: пока EMSCULPT наращивает мышцу и сжигает жир, Ultraformer подтягивает кожу над обработанной зоной.",
          en: "Ultraformer MPT Body is the ideal complement to EMSCULPT NEO: while EMSCULPT builds muscle and burns fat, Ultraformer tightens the skin above the treated area.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до Ultraformer MPT Body",
          ru: "Показания к Ultraformer MPT Body",
          en: "Indications for Ultraformer MPT Body",
        },
        indications: [
          { uk: "Птоз шкіри на животі, стегнах, внутрішній поверхні плечей", ru: "Птоз кожи на животе, бёдрах, внутренней поверхности плеч", en: "Skin laxity on abdomen, thighs, inner arms" },
          { uk: "Целюліт 1–3 ступеня та апельсинова шкірка", ru: "Целлюлит 1–3 степени и апельсиновая корка", en: "Cellulite grades 1–3 and orange peel texture" },
          { uk: "Ліпоптоз: відвислість підшкірно-жирової клітковини", ru: "Липоптоз: отвислость подкожно-жировой клетчатки", en: "Lipoptosis: sagging subcutaneous fat tissue" },
          { uk: "Корекція контурів після схуднення або вагітності", ru: "Коррекция контуров после похудения или беременности", en: "Contouring after weight loss or pregnancy" },
          { uk: "Профілактика вікової втрати пружності у 30–50 років", ru: "Профилактика возрастной потери упругости в 30–50 лет", en: "Prevention of age-related loss of firmness at 30–50 years" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Металеві імплантати у зоні обробки", ru: "Металлические имплантаты в зоне обработки", en: "Metal implants in the treatment area" },
          { uk: "Грубі рубці, відкриті рани, активне акне у зоні", ru: "Грубые рубцы, открытые раны, активное акне в зоне", en: "Keloid scars, open wounds, active acne in the area" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Oncological diseases" },
          { uk: "Тяжкі системні захворювання (цукровий діабет у декомпенсації)", ru: "Тяжёлые системные заболевания (сахарный диабет в декомпенсации)", en: "Severe systemic diseases (decompensated diabetes)" },
        ],
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить процедура Ultraformer MPT Body",
          ru: "Как проходит процедура Ultraformer MPT Body",
          en: "Ultraformer MPT Body Procedure Steps",
        },
        steps: [
          {
            title: { uk: "Огляд і план корекції", ru: "Осмотр и план коррекции", en: "Assessment and Correction Plan" },
            description: { uk: "Лікар виявляє зони птозу, оцінює товщину підшкірно-жирового шару й обирає відповідні картриджі та кількість ліній.", ru: "Врач выявляет зоны птоза, оценивает толщину подкожно-жирового слоя и выбирает соответствующие картриджи и количество линий.", en: "The physician identifies ptosis zones, evaluates fat layer thickness, and selects appropriate cartridges and line count." },
          },
          {
            title: { uk: "Нанесення гелю та позначення зон", ru: "Нанесение геля и разметка зон", en: "Gel Application and Zone Marking" },
            description: { uk: "На шкіру наносять ультразвуковий гель, позначають ділянки обробки. За показаннями застосовують місцеву анестезію кремом.", ru: "На кожу наносят ультразвуковой гель, размечают участки обработки. По показаниям применяют местную анестезию кремом.", en: "Ultrasound gel is applied to the skin and treatment zones are marked. Topical anesthetic cream may be used as indicated." },
          },
          {
            title: { uk: "Фокусований ультразвуковий вплив", ru: "Фокусированное ультразвуковое воздействие", en: "Focused Ultrasound Application" },
            description: { uk: "Лікар проводить картридж по розмічених лініях, формуючи термічні коагуляційні точки у цільовому шарі. Процедура займає 30–90 хвилин залежно від площі.", ru: "Врач проводит картридж по размеченным линиям, формируя термические коагуляционные точки в целевом слое. Процедура занимает 30–90 минут в зависимости от площади.", en: "The physician passes the cartridge along marked lines, creating thermal coagulation points in the target layer. Duration: 30–90 minutes depending on the area." },
          },
          {
            title: { uk: "Охолодження та повторний огляд", ru: "Охлаждение и повторный осмотр", en: "Cooling and Follow-up Assessment" },
            description: { uk: "Після процедури наносять заспокійливий крем. Лікар перевіряє рівномірність обробки та дає рекомендації по догляду.", ru: "После процедуры наносят успокаивающий крем. Врач проверяет равномерность обработки и даёт рекомендации по уходу.", en: "A soothing cream is applied post-procedure. The physician checks treatment uniformity and provides aftercare recommendations." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та важливі особливості",
          ru: "Преимущества и важные особенности",
          en: "Advantages and Key Considerations",
        },
        items: [
          { uk: "Стійкий підтяжувальний ефект від 12 до 18 місяців після одного курсу", ru: "Стойкий подтягивающий эффект от 12 до 18 месяцев после одного курса", en: "Long-lasting lifting effect from 12 to 18 months after one course" },
          { uk: "Синергія з EMSCULPT NEO — комбінуйте для максимального скульптурування тіла", ru: "Синергия с EMSCULPT NEO — комбинируйте для максимального скульптурирования тела", en: "Synergy with EMSCULPT NEO — combine for maximum body sculpting" },
          { uk: "Немає реабілітації: одразу після процедури можна повертатися до звичного ритму", ru: "Нет реабилитации: сразу после процедуры можно возвращаться к привычному ритму", en: "No rehabilitation: normal activities can resume immediately after the procedure" },
          { uk: "Лікар підбирає глибину HIFU індивідуально під товщину тканин", ru: "Врач подбирает глубину HIFU индивидуально под толщину тканей", en: "The physician customizes HIFU depth individually based on tissue thickness" },
          { uk: "⚠ Перші результати помітні через 4–6 тижнів після стимуляції колагеногенезу", ru: "⚠ Первые результаты заметны через 4–6 недель после стимуляции коллагеногенеза", en: "⚠ First results become visible 4–6 weeks after collagenogenesis stimulation" },
          { uk: "⚠ При вираженому птозі може знадобитися 2–3 процедури з інтервалом 3 місяці", ru: "⚠ При выраженном птозе может потребоваться 2–3 процедуры с интервалом 3 месяца", en: "⚠ Significant ptosis may require 2–3 procedures 3 months apart" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Чим Ultraformer MPT Body відрізняється від процедури на обличчя?", ru: "Чем Ultraformer MPT Body отличается от процедуры на лицо?", en: "How does Ultraformer MPT Body differ from the facial procedure?" },
        answer: { uk: "Для тіла застосовують картриджі з більшою глибиною фокуса (6–13 мм) — для роботи з товстішим шаром підшкірно-жирової клітковини. Протоколи та потужність відрізняються.", ru: "Для тела применяют картриджи с большей глубиной фокуса (6–13 мм) — для работы с более толстым слоем подкожно-жировой клетчатки. Протоколы и мощность отличаются.", en: "Body cartridges have greater focal depth (6–13 mm) to work with thicker subcutaneous fat. Protocols and power settings differ." },
      },
      {
        question: { uk: "Боляче?", ru: "Больно?", en: "Is it painful?" },
        answer: { uk: "Під час впливу відчувається тепло і точкові поколювання — терпимо. При низькому больовому порозі використовують топічну анестезію.", ru: "Во время воздействия ощущается тепло и точечные покалывания — терпимо. При низком болевом пороге используют топическую анестезию.", en: "Warmth and pinpoint sensations are felt — tolerable. Topical anesthesia is used for low pain tolerance." },
      },
      {
        question: { uk: "Через скільки буде ефект?", ru: "Через сколько будет эффект?", en: "When does the effect appear?" },
        answer: { uk: "Ранній ефект — одразу (дренаж, тонус). Видимий ліфтинг — через 4–6 тижнів. Максимальний результат — через 3–4 місяці.", ru: "Ранний эффект — сразу (дренаж, тонус). Видимый лифтинг — через 4–6 недель. Максимальный результат — через 3–4 месяца.", en: "Early effect — immediate (drainage, tone). Visible lifting — in 4–6 weeks. Maximum result — in 3–4 months." },
      },
    ],
  },

  // ─── EXION BODY ───────────────────────────────────────────────────────────
  {
    slug: "exion-body",
    summary: {
      uk: "EXION Body у GENEVITY — комбінований вплив монополярного RF і ультразвуку для глибокого ліфтингу шкіри тіла, редукції жиру та стимуляції вироблення гіалуронової кислоти зсередини.",
      ru: "EXION Body в GENEVITY — комбинированное воздействие монополярного RF и ультразвука для глубокого лифтинга кожи тела, редукции жира и стимуляции выработки гиалуроновой кислоты изнутри.",
      en: "EXION Body at GENEVITY — combined monopolar RF and ultrasound for deep body skin lifting, fat reduction, and stimulation of hyaluronic acid production from within.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "EXION Body — RF + ультразвук для шкіри тіла",
          ru: "EXION Body — RF + ультразвук для кожи тела",
          en: "EXION Body — RF + Ultrasound for Body Skin",
        },
        body: {
          uk: "EXION Body — апарат виробника BTL, що поєднує монополярний радіочастотний нагрів з ультразвуковою мікровібрацією. Монополярний RF проникає глибоко у підшкірні тканини, рівномірно нагріваючи колагеновий матрикс до 42–44 °C у безпечному режимі з контролем температури в реальному часі. Ультразвук посилює мікроциркуляцію і прискорює виведення продуктів ліполізу. Ключова особливість EXION — стимуляція фібробластів до синтезу не лише колагену і еластину, але й гіалуронової кислоти. Це унікально: більшість апаратних методик не впливають на ГК-синтез у глибоких шарах дерми тіла. Результат — одночасний ліфтинг, зволоження і скорочення об'єму ділянки.",
          ru: "EXION Body — аппарат производителя BTL, объединяющий монополярный радиочастотный нагрев с ультразвуковой микровибрацией. Монополярный RF проникает глубоко в подкожные ткани, равномерно нагревая коллагеновый матрикс до 42–44 °C в безопасном режиме с контролем температуры в реальном времени. Ультразвук усиливает микроциркуляцию и ускоряет выведение продуктов липолиза. Ключевая особенность EXION — стимуляция фибробластов к синтезу не только коллагена и эластина, но и гиалуроновой кислоты. Это уникально: большинство аппаратных методик не влияют на синтез ГК в глубоких слоях дермы тела. Результат — одновременный лифтинг, увлажнение и сокращение объёма участка.",
          en: "EXION Body is a BTL device combining monopolar radiofrequency heating with ultrasound microvibration. Monopolar RF penetrates deep into subcutaneous tissues, evenly heating the collagen matrix to 42–44 °C in a safe mode with real-time temperature control. Ultrasound enhances microcirculation and accelerates removal of lipolysis byproducts. EXION's key feature — stimulating fibroblasts to synthesize not only collagen and elastin, but also hyaluronic acid. This is unique: most device treatments do not affect HA synthesis in deep body skin layers. The result — simultaneous lifting, hydration, and volume reduction.",
        },
        calloutBody: {
          uk: "Технологія штучного інтелекту AutoSense контролює температуру тканин у реальному часі, запобігаючи перегріву та забезпечуючи стабільну ефективність упродовж всієї сесії.",
          ru: "Технология искусственного интеллекта AutoSense контролирует температуру тканей в реальном времени, предотвращая перегрев и обеспечивая стабильную эффективность на протяжении всей сессии.",
          en: "The AI-driven AutoSense technology monitors tissue temperature in real time, preventing overheating and ensuring consistent efficacy throughout the session.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до EXION Body",
          ru: "Показания к EXION Body",
          en: "Indications for EXION Body",
        },
        indications: [
          { uk: "Зниження пружності і тонусу шкіри на животі, стегнах, сідницях", ru: "Снижение упругости и тонуса кожи на животе, бёдрах, ягодицах", en: "Loss of skin firmness and tone on abdomen, thighs, buttocks" },
          { uk: "Целюліт і локальні жирові відкладення", ru: "Целлюлит и локальные жировые отложения", en: "Cellulite and localized fat deposits" },
          { uk: "Сухість і зневоднення шкіри тіла (дефіцит ГК)", ru: "Сухость и обезвоженность кожи тела (дефицит ГК)", en: "Dry, dehydrated body skin (HA deficiency)" },
          { uk: "Підготовка до та відновлення після хірургічного ліпосакшену", ru: "Подготовка к и восстановление после хирургического липосакшена", en: "Preparation for and recovery after surgical liposuction" },
          { uk: "Профілактика розтяжок і втрати еластичності у 25–60 років", ru: "Профилактика растяжек и потери эластичности в 25–60 лет", en: "Prevention of stretch marks and elasticity loss ages 25–60" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Металеві та електронні імплантати", ru: "Металлические и электронные имплантаты", en: "Metal and electronic implants" },
          { uk: "Активні запальні процеси або інфекції у зоні", ru: "Активные воспалительные процессы или инфекции в зоне", en: "Active inflammatory processes or infections in the area" },
          { uk: "Тяжкі серцево-судинні захворювання", ru: "Тяжёлые сердечно-сосудистые заболевания", en: "Severe cardiovascular diseases" },
          { uk: "Тромбоз і варикозна хвороба у зоні обробки", ru: "Тромбоз и варикозная болезнь в зоне обработки", en: "Thrombosis and varicose veins in the treatment area" },
        ],
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить сесія EXION Body",
          ru: "Как проходит сессия EXION Body",
          en: "EXION Body Session Protocol",
        },
        steps: [
          {
            title: { uk: "Первинна консультація і вибір програми", ru: "Первичная консультация и выбор программы", en: "Initial Consultation and Program Selection" },
            description: { uk: "Лікар оцінює стан шкіри, товщину жирового шару, судинний статус і обирає між протоколами ліфтингу, ліполізу або ГК-синтезу.", ru: "Врач оценивает состояние кожи, толщину жирового слоя, сосудистый статус и выбирает между протоколами лифтинга, липолиза или ГК-синтеза.", en: "The physician evaluates skin condition, fat layer thickness, vascular status, and selects between lifting, lipolysis, or HA-synthesis protocols." },
          },
          {
            title: { uk: "Підготовка зони та нанесення геля", ru: "Подготовка зоны и нанесение геля", en: "Zone Preparation and Gel Application" },
            description: { uk: "Шкіру очищають, наносять провідний гель. Налаштовують параметри апарату відповідно до протоколу і типу шкіри.", ru: "Кожу очищают, наносят проводящий гель. Настраивают параметры аппарата в соответствии с протоколом и типом кожи.", en: "Skin is cleansed, conductive gel is applied. Device parameters are set according to protocol and skin type." },
          },
          {
            title: { uk: "Термічна обробка з AutoSense", ru: "Термическая обработка с AutoSense", en: "Thermal Treatment with AutoSense" },
            description: { uk: "Лікар рухає аплікатором круговими та лінійними рухами. AutoSense автоматично регулює потужність, підтримуючи цільову температуру 42–44 °C.", ru: "Врач двигает аппликатором круговыми и линейными движениями. AutoSense автоматически регулирует мощность, поддерживая целевую температуру 42–44 °C.", en: "The physician moves the applicator in circular and linear strokes. AutoSense automatically adjusts power to maintain the target temperature of 42–44 °C." },
          },
          {
            title: { uk: "Завершення та домашній догляд", ru: "Завершение и домашний уход", en: "Completion and Home Care" },
            description: { uk: "Наносять зволожувальний крем. Лікар рекомендує питний режим, уникнення сонця 48 год і підтримувальні косметичні засоби.", ru: "Наносят увлажняющий крем. Врач рекомендует питьевой режим, избегание солнца 48 ч и поддерживающие косметические средства.", en: "Moisturizing cream is applied. The physician recommends hydration, avoiding sun for 48h, and supportive skincare products." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та особливості EXION Body",
          ru: "Преимущества и особенности EXION Body",
          en: "EXION Body Advantages and Considerations",
        },
        items: [
          { uk: "Єдина технологія, що стимулює синтез гіалуронової кислоти у глибоких шарах тіла", ru: "Единственная технология, стимулирующая синтез гиалуроновой кислоты в глубоких слоях тела", en: "The only technology stimulating hyaluronic acid synthesis in deep body skin layers" },
          { uk: "Інтелектуальний AutoSense: нагрів до цільової температури без ризику опіків", ru: "Интеллектуальный AutoSense: нагрев до целевой температуры без риска ожогов", en: "Intelligent AutoSense: heats to target temperature without burn risk" },
          { uk: "Поєднує три ефекти: ліфтинг + зволоження + ліполіз за одну сесію", ru: "Сочетает три эффекта: лифтинг + увлажнение + липолиз за одну сессию", en: "Combines three effects: lifting + hydration + lipolysis in one session" },
          { uk: "Немає реабілітаційного période — повертайтеся до активності одразу", ru: "Нет реабилитационного периода — возвращайтесь к активности сразу", en: "No recovery period — return to activity immediately" },
          { uk: "⚠ Повний ефект ГК-синтезу проявляється через 6–8 тижнів після курсу", ru: "⚠ Полный эффект ГК-синтеза проявляется через 6–8 недель после курса", en: "⚠ Full HA-synthesis effect manifests 6–8 weeks after the course" },
          { uk: "⚠ Для корекції вираженого целюліту рекомендується курс 6–8 процедур", ru: "⚠ Для коррекции выраженного целлюлита рекомендуется курс 6–8 процедур", en: "⚠ Correction of pronounced cellulite requires a course of 6–8 procedures" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Яка різниця між EXION Body і EXION Face?", ru: "В чём разница между EXION Body и EXION Face?", en: "What is the difference between EXION Body and EXION Face?" },
        answer: { uk: "EXION Face — делікатний протокол для шкіри обличчя, шиї та зони декольте. EXION Body — потужніший режим з адаптованими аплікаторами для великих площ тіла.", ru: "EXION Face — деликатный протокол для кожи лица, шеи и зоны декольте. EXION Body — более мощный режим с адаптированными аппликаторами для больших площадей тела.", en: "EXION Face is a delicate protocol for face, neck, and décolletage. EXION Body is a more powerful mode with adapted applicators for large body areas." },
      },
      {
        question: { uk: "Скільки процедур потрібно?", ru: "Сколько процедур нужно?", en: "How many sessions are needed?" },
        answer: { uk: "Базовий курс — 4–6 процедур 1 раз на тиждень. При вираженому птозі або целюліті — 6–8 процедур. Підтримувальна — раз на 4–6 місяців.", ru: "Базовый курс — 4–6 процедур 1 раз в неделю. При выраженном птозе или целлюлите — 6–8 процедур. Поддерживающая — раз в 4–6 месяцев.", en: "Basic course — 4–6 sessions weekly. For pronounced ptosis or cellulite — 6–8 sessions. Maintenance — every 4–6 months." },
      },
      {
        question: { uk: "Чи можна поєднувати EXION Body з EMSCULPT NEO?", ru: "Можно ли совмещать EXION Body с EMSCULPT NEO?", en: "Can EXION Body be combined with EMSCULPT NEO?" },
        answer: { uk: "Так, це один з найкращих апаратних комплексів для тіла: EMSCULPT NEO формує м'яз і спалює жир, EXION Body підтягує і зволожує шкіру над ділянкою. Процедури призначають у різні дні.", ru: "Да, это один из лучших аппаратных комплексов для тела: EMSCULPT NEO формирует мышцу и сжигает жир, EXION Body подтягивает и увлажняет кожу над участком. Процедуры назначают в разные дни.", en: "Yes, this is one of the best device combinations for the body: EMSCULPT NEO builds muscle and burns fat, EXION Body tightens and hydrates the skin above. Sessions are scheduled on different days." },
      },
    ],
  },
];

async function main() {
  for (const svc of SERVICES) {
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM services WHERE slug = ${svc.slug} LIMIT 1
    `;
    if (!rows.length) { console.warn(`⚠ slug not found: ${svc.slug}`); continue; }
    const serviceId = rows[0].id;

    await sql`UPDATE services SET summary_uk = ${svc.summary.uk}, summary_ru = ${svc.summary.ru}, summary_en = ${svc.summary.en} WHERE id = ${serviceId}`;
    await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${serviceId}`;
    await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${serviceId}`;

    const sectionIds: string[] = [];
    for (let i = 0; i < svc.sections.length; i++) {
      const sec = svc.sections[i];
      const id = randomUUID();
      const dbType = sec.type;
      const data = sectionData(sec);
      await sql`
        INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
        VALUES(${id}, 'service', ${serviceId}, ${i}, ${dbType}::section_type, ${JSON.stringify(data)}::jsonb)
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

    const types = svc.sections.map((s) => s.type);
    console.log(`✓ ${svc.slug} — [${types.join(", ")}], ${svc.faq.length} FAQs`);
  }
  await sql.end();
  console.log("\nV3b-v2 DONE — EMSCULPT NEO, Ultraformer MPT Body, EXION Body re-seeded with section variety.");
}

main().catch((e) => { console.error(e); process.exit(1); });
