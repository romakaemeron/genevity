/**
 * TZ-compliant seed: apparatus services batch B1
 * Services: ultraformer-mpt-body, exion-body, m22-stellar-black
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
  // ─── 21. Ultraformer MPT для тіла ─────────────────────────────────────
  {
    slug: "ultraformer-mpt-body",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Ultraformer MPT для тіла — HIFU-ліфтинг шкіри в GENEVITY",
          ru: "Ultraformer MPT для тела — HIFU-лифтинг кожи в GENEVITY",
          en: "Ultraformer MPT for Body — HIFU Skin Lifting at GENEVITY",
        },
        body: {
          uk: "Ultraformer MPT для тіла — це апаратний HIFU-ліфтинг, адаптований для великих ділянок тіла: живота, внутрішньої поверхні стегон, рук та зони «галіфе». Технологія мікро- та макрофокусованого ультразвуку (MMFU) дозволяє доставляти тепловий імпульс безпосередньо в підшкірно-жировий шар (4,5 мм) та дерму (3,0 мм), запускаючи неоколагенез та скорочення колагенових волокон.\n\nНа відміну від косметичних RF-апаратів, Ultraformer MPT для тіла (ультраформер по тілу) діє глибше та точніше. Теплові коагуляційні точки формуються строго на заданій глибині без пошкодження поверхневих шарів шкіри — відсутність реабілітаційного періоду після процедури пояснюється саме цим принципом.\n\nОсновний ефект — підтяжка та ущільнення шкіри, яка втратила тонус після схуднення, вагітності або природного старіння. Ультраформер для тіла є ефективним рішенням для ділянок з вираженою в'ялістю, де RF та масажні процедури дають лише поверхневий результат.\n\nКурс складається з 1–3 сеансів залежно від зони та ступеня птозу. Ефект наростає 2–3 місяці та зберігається до 18 місяців. У GENEVITY процедуру виконують сертифіковані лікарі з підбором картриджів та глибини для кожної зони індивідуально.",
          ru: "Ultraformer MPT для тела — это аппаратный HIFU-лифтинг, адаптированный для крупных участков тела: живота, внутренней поверхности бёдер, рук и зоны «галифе». Технология микро- и макрофокусированного ультразвука (MMFU) позволяет доставлять тепловой импульс непосредственно в подкожно-жировой слой (4,5 мм) и дерму (3,0 мм), запуская неоколлагенез и сокращение коллагеновых волокон.\n\nВ отличие от косметических RF-аппаратов, Ultraformer MPT для тела (ультраформер по телу) действует глубже и точнее. Тепловые коагуляционные точки формируются строго на заданной глубине без повреждения поверхностных слоёв кожи — отсутствие реабилитационного периода объясняется именно этим принципом.\n\nОсновной эффект — подтяжка и уплотнение кожи, потерявшей тонус после похудения, беременности или естественного старения. Ультраформер для тела является эффективным решением для участков с выраженной дряблостью, где RF и массажные процедуры дают лишь поверхностный результат.\n\nКурс состоит из 1–3 сеансов в зависимости от зоны и степени птоза. Эффект нарастает 2–3 месяца и сохраняется до 18 месяцев. В GENEVITY процедуру выполняют сертифицированные врачи с подбором картриджей и глубины для каждой зоны индивидуально.",
          en: "Ultraformer MPT for Body is a device-based HIFU lifting adapted for large body areas: abdomen, inner thighs, upper arms, and saddlebag zones. The micro- and macro-focused ultrasound (MMFU) technology delivers thermal impulses directly into the subcutaneous fat layer (4.5 mm) and dermis (3.0 mm), triggering neocollagenesis and collagen fibre contraction.\n\nUnlike cosmetic RF devices, the Ultraformer MPT for body acts deeper and with greater precision. Thermal coagulation points form strictly at the target depth without damaging the surface skin layers — the absence of recovery period is explained by this principle.\n\nThe primary effect is tightening and firming of skin that has lost tone after weight loss, pregnancy or natural ageing. The body Ultraformer is an effective solution for areas with pronounced laxity where RF and massage-based treatments deliver only superficial results.\n\nA course consists of 1–3 sessions depending on the zone and degree of ptosis. Results build over 2–3 months and last up to 18 months. At GENEVITY the procedure is performed by certified doctors who individually select cartridges and depth for each zone.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до Ultraformer MPT для тіла", ru: "Показания к Ultraformer MPT для тела", en: "Indications for Ultraformer MPT for Body" },
        indications: [
          { uk: "В'яла шкіра живота після вагітності або схуднення", ru: "Дряблая кожа живота после беременности или похудения", en: "Lax abdominal skin after pregnancy or weight loss" },
          { uk: "Розтягнута шкіра внутрішньої поверхні стегон та рук", ru: "Растянутая кожа внутренней поверхности бёдер и рук", en: "Stretched skin on the inner thighs and upper arms" },
          { uk: "Жирові «галіфе» та нечіткі контури стегон", ru: "Жировые «галифе» и нечёткие контуры бёдер", en: "Saddlebag fat deposits and undefined hip contours" },
          { uk: "Профілактика птозу шкіри при активному схудненні", ru: "Профилактика птоза кожи при активном похудении", en: "Prevention of skin ptosis during active weight loss" },
          { uk: "Ліфтинг зони декольте та шиї", ru: "Лифтинг зоны декольте и шеи", en: "Décolletage and neck lifting" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Металеві імпланти та кардіостимулятори в зоні обробки", ru: "Металлические импланты и кардиостимуляторы в зоне обработки", en: "Metal implants and pacemakers in the treatment area" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Грижі в зоні обробки", ru: "Грыжи в зоне обработки", en: "Hernias in the treatment area" },
          { uk: "Активні інфекційні захворювання шкіри", ru: "Активные инфекционные заболевания кожи", en: "Active skin infections" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Ультраформер для тіла — це підтяжка шкіри без ліпосакції та реабілітаційного одягу. Один-три сеанси — і результат, як після пластики.",
          ru: "Ультраформер для тела — это подтяжка кожи без липосакции и реабилитационной одежды. Один-три сеанса — и результат, как после пластики.",
          en: "The body Ultraformer delivers skin tightening without liposuction or compression garments. One to three sessions — results comparable to plastic surgery.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура Ultraformer MPT для тіла", ru: "Как проходит процедура Ultraformer MPT для тела", en: "How Ultraformer MPT Body Procedure Works" },
        steps: [
          {
            title: { uk: "Консультація та оцінка зон", ru: "Консультация и оценка зон", en: "Consultation and zone assessment" },
            body: { uk: "Лікар визначає глибину птозу, товщину підшкірно-жирового шару та обирає відповідні картриджі.", ru: "Врач определяет глубину птоза, толщину подкожно-жирового слоя и выбирает подходящие картриджи.", en: "The doctor determines ptosis depth, subcutaneous fat thickness and selects the appropriate cartridges." },
          },
          {
            title: { uk: "Підготовка та знеболення", ru: "Подготовка и обезболивание", en: "Preparation and anaesthesia" },
            body: { uk: "Нанесення анестезуючого крему на 30–40 хвилин (для великих зон). Нанесення контактного гелю.", ru: "Нанесение анестезирующего крема на 30–40 минут (для крупных зон). Нанесение контактного геля.", en: "Topical anaesthetic cream applied for 30–40 minutes (for large zones). Contact gel applied." },
          },
          {
            title: { uk: "Процедура (45–90 хвилин)", ru: "Процедура (45–90 минут)", en: "Treatment (45–90 minutes)" },
            body: { uk: "Апарат рухається по зоні, формуючи теплові точки на заданій глибині. Пацієнт відчуває тепло та поколювання.", ru: "Аппарат движется по зоне, формируя тепловые точки на заданной глубине. Пациент ощущает тепло и покалывание.", en: "The device moves across the zone creating thermal points at the target depth. The patient feels warmth and tingling." },
          },
          {
            title: { uk: "Після процедури", ru: "После процедуры", en: "After the procedure" },
            body: { uk: "Незначна набряклість та почервоніння — норма, зникають упродовж доби. Уникати сауни та прямого ультрафіолету 2 тижні.", ru: "Незначная отёчность и покраснение — норма, проходят в течение суток. Избегать сауны и прямого ультрафиолета 2 недели.", en: "Mild swelling and redness is normal, resolving within a day. Avoid sauna and direct UV for 2 weeks." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості Ultraformer MPT для тіла", ru: "Преимущества и особенности Ultraformer MPT для тела", en: "Ultraformer MPT Body: Benefits and Key Points" },
        items: [
          { uk: "Ефективний для великих зон: живіт, стегна, руки, декольте", ru: "Эффективен для крупных зон: живот, бёдра, руки, декольте", en: "Effective for large zones: abdomen, thighs, arms, décolletage" },
          { uk: "Дія на рівні СМАС і дерми одночасно — глибина 3 та 4,5 мм", ru: "Воздействие на уровне СМАС и дермы одновременно — глубина 3 и 4,5 мм", en: "Acts at SMAS and dermal level simultaneously — 3 and 4.5 mm depth" },
          { uk: "Нульовий реабілітаційний період, немає компресійної білизни", ru: "Нулевой реабилитационный период, нет компрессионного белья", en: "Zero downtime, no compression garments required" },
          { uk: "Ефект посилюється 2–3 місяці, зберігається до 18 місяців", ru: "Эффект усиливается 2–3 месяца, сохраняется до 18 месяцев", en: "Results build over 2–3 months, lasting up to 18 months" },
          { uk: "Добре поєднується з EMSCULPT NEO для комплексної корекції тіла", ru: "Хорошо сочетается с EMSCULPT NEO для комплексной коррекции тела", en: "Combines well with EMSCULPT NEO for comprehensive body contouring" },
          { uk: "⚠ При вираженому надлишку жиру — не замінює ліпосакцію; лікар оцінить реалістичний результат", ru: "⚠ При выраженном избытке жира — не заменяет липосакцию; врач оценит реалистичный результат", en: "⚠ With significant fat excess — not a substitute for liposuction; the doctor will assess the realistic outcome" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка та кабінети GENEVITY", ru: "Клиника и кабинеты GENEVITY", en: "GENEVITY Clinic and Treatment Rooms" },
        images: [
          { url: "/images/equipment/Ultrafomer.webp", alt: "Апарат Ultraformer MPT для тіла" },
          ...interior,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на ультраформер для тіла в Дніпрі", ru: "Запишитесь на ультраформер для тела в Днепре", en: "Book Body Ultraformer in Dnipro" },
        body: { uk: "Оцініть зони корекції та дізнайтеся ціну на ультраформер для тіла на безкоштовній консультації лікаря.", ru: "Оцените зоны коррекции и узнайте цену на ультраформер для тела на бесплатной консультации врача.", en: "Assess your correction zones and find out the body Ultraformer price at a free doctor consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки триває ефект від процедури Ultraformer MPT?", ru: "Сколько длится эффект от процедуры Ultraformer MPT?", en: "How long do Ultraformer MPT body results last?" },
        answer: { uk: "Ефект зберігається 12–18 місяців. Результат продовжує наростати 2–3 місяці після процедури завдяки активному синтезу нового колагену.", ru: "Эффект сохраняется 12–18 месяцев. Результат продолжает нарастать 2–3 месяца после процедуры благодаря активному синтезу нового коллагена.", en: "Results last 12–18 months, continuing to build for 2–3 months post-procedure due to active collagen synthesis." },
      },
      {
        question: { uk: "Чи болюча процедура Ultraformer MPT для тіла?", ru: "Болезненна ли процедура Ultraformer MPT для тела?", en: "Is the Ultraformer MPT body procedure painful?" },
        answer: { uk: "Дискомфорт помірний. Для великих зон застосовується анестезуючий крем, що значно знижує чутливість. Більшість пацієнтів добре переносять процедуру.", ru: "Дискомфорт умеренный. Для крупных зон применяется анестезирующий крем, что значительно снижает чувствительность. Большинство пациентов хорошо переносят процедуру.", en: "Discomfort is moderate. For large zones, topical anaesthetic significantly reduces sensitivity. Most patients tolerate the procedure well." },
      },
      {
        question: { uk: "Чи можна поєднувати Ultraformer MPT з іншими косметологічними процедурами?", ru: "Можно ли сочетать Ultraformer MPT с другими косметологическими процедурами?", en: "Can Ultraformer MPT be combined with other procedures?" },
        answer: { uk: "Так. Найефективніше поєднання — Ultraformer MPT + EMSCULPT NEO: перший підтягує шкіру, другий нарощує м'язи та спалює жир. Лікар складе оптимальний план.", ru: "Да. Наиболее эффективное сочетание — Ultraformer MPT + EMSCULPT NEO: первый подтягивает кожу, второй наращивает мышцы и сжигает жир. Врач составит оптимальный план.", en: "Yes. The most effective combination is Ultraformer MPT + EMSCULPT NEO: the former tightens skin, the latter builds muscle and burns fat. The doctor will create an optimal plan." },
      },
      {
        question: { uk: "Які зони тіла можна обробляти за допомогою Ultraformer MPT?", ru: "Какие зоны тела можно обрабатывать с помощью Ultraformer MPT?", en: "Which body zones can be treated with Ultraformer MPT?" },
        answer: { uk: "Живіт, внутрішня поверхня стегон, зовнішня поверхня стегон («галіфе»), руки (трицепс), коліна, зона декольте та шия. Лікар оцінить кожну зону та підбере протокол.", ru: "Живот, внутренняя поверхность бёдер, внешняя поверхность бёдер («галифе»), руки (трицепс), колени, зона декольте и шея. Врач оценит каждую зону и подберёт протокол.", en: "Abdomen, inner thighs, outer thighs (saddlebags), upper arms (triceps), knees, décolletage and neck. The doctor will assess each zone and select a protocol." },
      },
      {
        question: { uk: "Чи потрібна спеціальна підготовка перед процедурою Ultraformer MPT?", ru: "Нужна ли специальная подготовка перед процедурой Ultraformer MPT?", en: "Is special preparation needed before Ultraformer MPT?" },
        answer: { uk: "Спеціальна підготовка не потрібна. Рекомендується прийти без лосьйонів та масел на шкірі. За 2 тижні уникати агресивних пілінгів та надмірної засмаги.", ru: "Специальная подготовка не нужна. Рекомендуется прийти без лосьонов и масел на коже. За 2 недели избегать агрессивных пилингов и чрезмерного загара.", en: "No special preparation is required. Come without lotions or oils on the skin. Avoid aggressive peels and excessive tanning 2 weeks before." },
      },
    ],
  },

  // ─── 22. Exion Body ──────────────────────────────────────────────────────
  {
    slug: "exion-body",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Exion Body — RF + ультразвук для підтяжки тіла в GENEVITY",
          ru: "Exion Body — RF + ультразвук для подтяжки тела в GENEVITY",
          en: "Exion Body — RF + Ultrasound Body Tightening at GENEVITY",
        },
        body: {
          uk: "Exion Body — апаратна процедура від компанії BTL для неінвазивної корекції контурів тіла, яка поєднує монополярну радіочастотну (RF) енергію з ультразвуковою стимуляцією. AI-система в режимі реального часу контролює температуру тканин та автоматично регулює параметри впливу, виключаючи ризик перегріву.\n\nТехнологія Exion Body (exion rf body) доставляє RF-енергію на глибину до 8 мм, прогріваючи підшкірно-жировий шар і активуючи синтез колагену в дермі. Одночасна ультразвукова стимуляція покращує мікроциркуляцію та сприяє природному виведенню ліполізованого жиру через лімфатичну систему.\n\nExion Body ефективний для корекції ділянок з локальними жировими відкладеннями та в'ялою шкірою: живіт, стегна, руки, сідниці, коліна, зона під підборіддям. Процедура виконується курсами по 4–6 сеансів з інтервалом 1–2 тижні.\n\nВ GENEVITY Exion Body використовується як окремо, так і в комбінації з EMSCULPT NEO для досягнення максимального результату: зменшення жиру + підтяжка шкіри + ріст м'язів в одній програмі.",
          ru: "Exion Body — аппаратная процедура от компании BTL для неинвазивной коррекции контуров тела, сочетающая монополярную радиочастотную (RF) энергию с ультразвуковой стимуляцией. AI-система в реальном времени контролирует температуру тканей и автоматически регулирует параметры воздействия, исключая риск перегрева.\n\nТехнология Exion Body (exion rf body) доставляет RF-энергию на глубину до 8 мм, прогревая подкожно-жировой слой и активируя синтез коллагена в дерме. Одновременная ультразвуковая стимуляция улучшает микроциркуляцию и способствует естественному выведению лизированного жира через лимфатическую систему.\n\nExion Body эффективен для коррекции участков с локальными жировыми отложениями и дряблой кожей: живот, бёдра, руки, ягодицы, колени, зона под подбородком. Процедура выполняется курсами по 4–6 сеансов с интервалом 1–2 недели.\n\nВ GENEVITY Exion Body используется как отдельно, так и в комбинации с EMSCULPT NEO для достижения максимального результата: уменьшение жира + подтяжка кожи + рост мышц в одной программе.",
          en: "Exion Body is a BTL device-based procedure for non-invasive body contouring that combines monopolar radiofrequency (RF) energy with ultrasound stimulation. A real-time AI system monitors tissue temperature and automatically adjusts treatment parameters, eliminating overheating risk.\n\nExion Body technology (exion rf body) delivers RF energy up to 8 mm deep, heating the subcutaneous fat layer and activating collagen synthesis in the dermis. Simultaneous ultrasound stimulation improves microcirculation and facilitates natural clearance of lipolysed fat through the lymphatic system.\n\nExion Body is effective for areas with localised fat deposits and lax skin: abdomen, thighs, arms, buttocks, knees, submental zone. Courses consist of 4–6 sessions, 1–2 weeks apart.\n\nAt GENEVITY, Exion Body is used both standalone and in combination with EMSCULPT NEO for maximum results: fat reduction + skin tightening + muscle growth in one programme.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до Exion Body", ru: "Показания к Exion Body", en: "Indications for Exion Body" },
        indications: [
          { uk: "Локальні жирові відкладення та целюліт", ru: "Локальные жировые отложения и целлюлит", en: "Localised fat deposits and cellulite" },
          { uk: "В'яла шкіра тіла після схуднення або вагітності", ru: "Дряблая кожа тела после похудения или беременности", en: "Lax body skin after weight loss or pregnancy" },
          { uk: "Зниження тонусу та текстури шкіри внаслідок вікових змін", ru: "Снижение тонуса и текстуры кожи вследствие возрастных изменений", en: "Reduced skin tone and texture due to ageing" },
          { uk: "Розтяжки та нерівності шкіри", ru: "Растяжки и неровности кожи", en: "Stretch marks and skin irregularities" },
          { uk: "Корекція контуру будь-якої зони тіла", ru: "Коррекция контура любой зоны тела", en: "Body contour correction of any zone" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Кардіостимулятори та електронні медичні імпланти", ru: "Кардиостимуляторы и электронные медицинские импланты", en: "Pacemakers and electronic medical implants" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Тромбофлебіт та тромбоз в анамнезі", ru: "Тромбофлебит и тромбоз в анамнезе", en: "History of thrombophlebitis or thrombosis" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
          { uk: "Гострі інфекційні захворювання шкіри", ru: "Острые инфекционные заболевания кожи", en: "Acute skin infections" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Exion Body — єдина RF-процедура для тіла з AI-контролем температури тканин в реальному часі. Максимальна ефективність, виключений ризик перегріву.",
          ru: "Exion Body — единственная RF-процедура для тела с AI-контролем температуры тканей в реальном времени. Максимальная эффективность, исключён риск перегрева.",
          en: "Exion Body is the only body RF procedure with real-time AI tissue temperature control. Maximum efficacy with overheating risk eliminated.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Етапи процедури Exion Body", ru: "Этапы процедуры Exion Body", en: "Exion Body Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація та розробка протоколу", ru: "Консультация и разработка протокола", en: "Consultation and protocol design" },
            body: { uk: "Лікар оцінює зони корекції, стан шкіри та жирового шару, визначає кількість сеансів.", ru: "Врач оценивает зоны коррекции, состояние кожи и жирового слоя, определяет количество сеансов.", en: "The doctor assesses correction zones, skin and fat condition, and determines the number of sessions." },
          },
          {
            title: { uk: "Підготовка шкіри", ru: "Подготовка кожи", en: "Skin preparation" },
            body: { uk: "Очищення шкіри, нанесення контактного середовища для ультразвукової компоненти.", ru: "Очищение кожи, нанесение контактной среды для ультразвуковой компоненты.", en: "Skin cleansing and application of contact medium for the ultrasound component." },
          },
          {
            title: { uk: "Процедура (30–60 хвилин)", ru: "Процедура (30–60 минут)", en: "Treatment (30–60 minutes)" },
            body: { uk: "Лікар обробляє зони за протоколом. AI постійно моніторить температуру та коригує потужність RF.", ru: "Врач обрабатывает зоны по протоколу. AI постоянно мониторит температуру и корректирует мощность RF.", en: "The doctor treats zones per protocol. AI continuously monitors temperature and adjusts RF power." },
          },
          {
            title: { uk: "Догляд після процедури", ru: "Уход после процедуры", en: "Post-procedure care" },
            body: { uk: "Нанесення заспокійливого засобу. Уникати сауни та прямого сонця 48 годин. Рекомендується пити більше води.", ru: "Нанесение успокаивающего средства. Избегать сауны и прямого солнца 48 часов. Рекомендуется пить больше воды.", en: "Soothing product applied. Avoid sauna and direct sun for 48 hours. Increased water intake is recommended." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та недоліки Exion Body", ru: "Преимущества и недостатки Exion Body", en: "Exion Body Pros and Cons" },
        items: [
          { uk: "Поєднує RF та ультразвук — жироліз + підтяжка шкіри в одній процедурі", ru: "Сочетает RF и ультразвук — липолиз + подтяжка кожи в одной процедуре", en: "Combines RF and ultrasound — lipolysis + skin tightening in one procedure" },
          { uk: "AI-контроль — безпека та стабільний результат без залежності від техніки лікаря", ru: "AI-контроль — безопасность и стабильный результат без зависимости от техники врача", en: "AI control — safety and consistent results independent of operator technique" },
          { uk: "Підходить для всіх типів і кольорів шкіри тіла", ru: "Подходит для всех типов и цветов кожи тела", en: "Suitable for all skin types and tones" },
          { uk: "Нульовий реабілітаційний період", ru: "Нулевой реабилитационный период", en: "Zero downtime" },
          { uk: "Ефективна комбінація з EMSCULPT NEO та Ultraformer MPT для тіла", ru: "Эффективная комбинация с EMSCULPT NEO и Ultraformer MPT для тела", en: "Effective combination with EMSCULPT NEO and Ultraformer MPT for body" },
          { uk: "⚠ Не видаляє великі об'єми жиру — для значних відкладень лікар може порекомендувати хірургічний метод", ru: "⚠ Не удаляет большие объёмы жира — при значительных отложениях врач может рекомендовать хирургический метод", en: "⚠ Does not remove large fat volumes — the doctor may recommend a surgical approach for significant deposits" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Обладнання та кабінети GENEVITY", ru: "Оборудование и кабинеты GENEVITY", en: "GENEVITY Equipment and Rooms" },
        images: [
          { url: "/images/equipment/EXION.webp", alt: "Апарат Exion Body у GENEVITY" },
          ...interior,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на Exion Body в GENEVITY", ru: "Запишитесь на Exion Body в GENEVITY", en: "Book Exion Body at GENEVITY" },
        body: { uk: "Дізнайтеся ціну Exion Body та підберіть програму корекції тіла на безкоштовній консультації.", ru: "Узнайте цену Exion Body и подберите программу коррекции тела на бесплатной консультации.", en: "Find out the Exion Body price and select your body contouring programme at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи безпечна процедура Exion Body?", ru: "Безопасна ли процедура Exion Body?", en: "Is the Exion Body procedure safe?" },
        answer: { uk: "Так. Exion Body — FDA-схвалена процедура з AI-системою контролю температури, яка унеможливлює перегрів тканин. Виконується виключно лікарями з медичною освітою.", ru: "Да. Exion Body — FDA-одобренная процедура с AI-системой контроля температуры, исключающей перегрев тканей. Выполняется исключительно врачами с медицинским образованием.", en: "Yes. Exion Body is FDA-approved with an AI temperature control system that prevents tissue overheating. Performed exclusively by medically qualified doctors." },
      },
      {
        question: { uk: "Скільки сеансів Exion Body потрібно для досягнення бажаного результату?", ru: "Сколько сеансов Exion Body нужно для достижения желаемого результата?", en: "How many Exion Body sessions are needed?" },
        answer: { uk: "Оптимальний курс — 4–6 сеансів з інтервалом 1–2 тижні. Для підтримуючого ефекту — 1–2 процедури на рік.", ru: "Оптимальный курс — 4–6 сеансов с интервалом 1–2 недели. Для поддерживающего эффекта — 1–2 процедуры в год.", en: "Optimal course: 4–6 sessions, 1–2 weeks apart. For maintenance: 1–2 procedures per year." },
      },
      {
        question: { uk: "Чи є побічні ефекти після процедури Exion Body?", ru: "Есть ли побочные эффекты после процедуры Exion Body?", en: "Are there side effects after Exion Body?" },
        answer: { uk: "Можливе тимчасове почервоніння та незначна набряклість у зоні обробки — минає протягом кількох годин. Серйозних побічних ефектів при дотриманні протоколу та відсутності протипоказань не виникає.", ru: "Возможно временное покраснение и незначительная отёчность в зоне обработки — проходит в течение нескольких часов. Серьёзных побочных эффектов при соблюдении протокола и отсутствии противопоказаний не возникает.", en: "Temporary redness and mild swelling in the treatment area is possible — resolves within a few hours. No serious side effects when the protocol is followed and contraindications are absent." },
      },
      {
        question: { uk: "Як підготуватися до сеансу Exion Body?", ru: "Как подготовиться к сеансу Exion Body?", en: "How to prepare for an Exion Body session?" },
        answer: { uk: "Прийдіть без лосьйонів та масел на шкірі. Забезпечте достатнє зволоження — випийте 1–2 склянки води перед процедурою. Уникайте сильного засмаги за 2 тижні до сеансу.", ru: "Придите без лосьонов и масел на коже. Обеспечьте достаточное увлажнение — выпейте 1–2 стакана воды перед процедурой. Избегайте сильного загара за 2 недели до сеанса.", en: "Come without lotions or oils on the skin. Stay hydrated — drink 1–2 glasses of water before the procedure. Avoid heavy tanning 2 weeks before the session." },
      },
      {
        question: { uk: "Чи можна поєднувати Exion Body з іншими косметичними процедурами?", ru: "Можно ли сочетать Exion Body с другими косметическими процедурами?", en: "Can Exion Body be combined with other procedures?" },
        answer: { uk: "Так. Exion Body ефективно поєднується з EMSCULPT NEO та Ultraformer MPT для тіла. Комплексна програма дозволяє одночасно спалити жир, нарости м'язи та підтягнути шкіру.", ru: "Да. Exion Body эффективно сочетается с EMSCULPT NEO и Ultraformer MPT для тела. Комплексная программа позволяет одновременно сжечь жир, нарастить мышцы и подтянуть кожу.", en: "Yes. Exion Body combines effectively with EMSCULPT NEO and Ultraformer MPT for body. A combined programme simultaneously burns fat, builds muscle and tightens skin." },
      },
    ],
  },

  // ─── 23. M22 Stellar Black ───────────────────────────────────────────────
  {
    slug: "m22-stellar-black",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "M22 Stellar Black — комплексне лікування шкіри в GENEVITY",
          ru: "M22 Stellar Black — комплексное лечение кожи в GENEVITY",
          en: "M22 Stellar Black — Comprehensive Skin Treatment at GENEVITY",
        },
        body: {
          uk: "M22 Stellar Black від Lumenis — найбільш технологічна багатоплатформна система для лікування шкіри, яка об'єднує IPL (інтенсивний імпульсний світло), ResurFX (фракційний лазер 1565 нм), Nd:YAG 1064 нм та Q-Switched 532/1064 нм лазери в одному апараті. Це дозволяє вирішувати широкий спектр естетичних та медичних проблем шкіри в рамках однієї клініки.\n\nM22 Stellar Black ефективний для: лікування судинних уражень (купероз, рожеве акне, телеангіектазії), корекції пігментних плям (меланодермія, постзапальна пігментація, ластовиння), фракційного омолодження шкіри (зменшення зморшок, пор, нерівностей, постакне рубців), лазерного видалення татуажу та перманентного макіяжу.\n\nПеревага M22 Stellar Black перед окремими лазерними апаратами — можливість за один візит вирішити кілька завдань: наприклад, знизити судинний компонент (IPL) та провести фракційне шліфування (ResurFX) в одному протоколі. Це скорочує загальну кількість сеансів та підвищує ефективність лікування.\n\nВ GENEVITY M22 Stellar Black використовується для широкого кола показань під наглядом лікарів з медичною освітою та досвідом роботи з лазерним обладнанням. На консультації лікар визначить, який модуль та протокол підходить для вашого конкретного запиту.",
          ru: "M22 Stellar Black от Lumenis — наиболее технологичная многоплатформная система для лечения кожи, объединяющая IPL (интенсивный импульсный свет), ResurFX (фракционный лазер 1565 нм), Nd:YAG 1064 нм и Q-Switched 532/1064 нм лазеры в одном аппарате. Это позволяет решать широкий спектр эстетических и медицинских проблем кожи в рамках одной клиники.\n\nM22 Stellar Black эффективен для: лечения сосудистых поражений (купероз, розацеа, телеангиэктазии), коррекции пигментных пятен (мелазма, поствоспалительная пигментация, веснушки), фракционного омоложения кожи (уменьшение морщин, пор, неровностей, рубцов постакне), лазерного удаления татуажа и перманентного макияжа.\n\nПреимущество M22 Stellar Black перед отдельными лазерными аппаратами — возможность за один визит решить несколько задач: например, снизить сосудистый компонент (IPL) и провести фракционное шлифование (ResurFX) в одном протоколе. Это сокращает общее количество сеансов и повышает эффективность лечения.\n\nВ GENEVITY M22 Stellar Black используется для широкого круга показаний под наблюдением врачей с медицинским образованием и опытом работы с лазерным оборудованием. На консультации врач определит, какой модуль и протокол подходит для вашего конкретного запроса.",
          en: "M22 Stellar Black by Lumenis is the most technologically advanced multi-platform skin treatment system, integrating IPL (intense pulsed light), ResurFX (1565 nm fractional laser), Nd:YAG 1064 nm and Q-Switched 532/1064 nm lasers in a single device. This enables treatment of a wide range of aesthetic and medical skin conditions within one clinic.\n\nM22 Stellar Black is effective for: vascular lesion treatment (rosacea, couperosis, telangiectasias), pigmentation correction (melasma, post-inflammatory hyperpigmentation, freckles), fractional skin rejuvenation (reducing wrinkles, pores, irregularities, acne scars), and laser removal of tattoos and permanent make-up.\n\nThe key advantage of M22 Stellar Black over individual laser devices is the ability to address multiple concerns in one visit — for example, reducing the vascular component (IPL) and performing fractional resurfacing (ResurFX) in a single protocol. This reduces total sessions and increases treatment efficacy.\n\nAt GENEVITY, M22 Stellar Black is used for a wide range of indications by doctors with medical qualifications and laser equipment experience. At consultation the doctor determines which module and protocol is appropriate for your specific concern.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до M22 Stellar Black", ru: "Показания к M22 Stellar Black", en: "Indications for M22 Stellar Black" },
        indications: [
          { uk: "Купероз, рожеве акне (розацеа), судинні зірочки та телеангіектазії", ru: "Купероз, розацеа, сосудистые звёздочки и телеангиэктазии", en: "Rosacea, couperosis, spider veins and telangiectasias" },
          { uk: "Пігментні плями: меланодермія, постзапальна пігментація, ластовиння", ru: "Пигментные пятна: меланодермия, поствоспалительная пигментация, веснушки", en: "Pigmentation: melasma, post-inflammatory pigmentation, freckles" },
          { uk: "Зморшки, нерівна текстура, розширені пори, рубці постакне", ru: "Морщины, неровная текстура, расширенные поры, рубцы постакне", en: "Wrinkles, uneven texture, enlarged pores, acne scars" },
          { uk: "Видалення татуажу, мікропігментації та перманентного макіяжу", ru: "Удаление татуажа, микропигментации и перманентного макияжа", en: "Tattoo, micropigmentation and permanent make-up removal" },
          { uk: "Комплексне омолодження шкіри обличчя, шиї та зони декольте", ru: "Комплексное омоложение кожи лица, шеи и зоны декольте", en: "Comprehensive skin rejuvenation of face, neck and décolletage" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Засмагла шкіра та активна засмага (останні 4 тижні)", ru: "Загорелая кожа и активный загар (последние 4 недели)", en: "Tanned skin or active tanning (last 4 weeks)" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Прийом фотосенсибілізуючих препаратів (ізотретиноїн, тетрацикліни)", ru: "Приём фотосенсибилизирующих препаратов (изотретиноин, тетрациклины)", en: "Use of photosensitising drugs (isotretinoin, tetracyclines)" },
          { uk: "Онкологічні захворювання та схильність до келоїдних рубців", ru: "Онкологические заболевания и склонность к келоидным рубцам", en: "Active oncological conditions and keloid scarring tendency" },
          { uk: "Активний герпес та запальні захворювання в зоні обробки", ru: "Активный герпес и воспалительные заболевания в зоне обработки", en: "Active herpes and inflammatory conditions in the treatment area" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "M22 Stellar Black — єдиний апарат, який за один візит може одночасно лікувати судини, пігмент та проводити фракційне омолодження. Один апарат замість трьох.",
          ru: "M22 Stellar Black — единственный аппарат, который за один визит может одновременно лечить сосуды, пигмент и проводить фракционное омоложение. Один аппарат вместо трёх.",
          en: "M22 Stellar Black is the only device that can simultaneously treat vascularity, pigmentation and perform fractional rejuvenation in a single visit. One device instead of three.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура M22 Stellar Black", ru: "Как проходит процедура M22 Stellar Black", en: "How the M22 Stellar Black Procedure Works" },
        steps: [
          {
            title: { uk: "Консультація та підбір протоколу", ru: "Консультация и подбор протокола", en: "Consultation and protocol selection" },
            body: { uk: "Лікар оцінює тип шкіри, проблему та підбирає модулі M22: IPL, ResurFX, Nd:YAG або Q-Switched. Обговорюється кількість сеансів.", ru: "Врач оценивает тип кожи, проблему и подбирает модули M22: IPL, ResurFX, Nd:YAG или Q-Switched. Обсуждается количество сеансов.", en: "The doctor assesses skin type and concern, selects M22 modules: IPL, ResurFX, Nd:YAG or Q-Switched. Number of sessions is discussed." },
          },
          {
            title: { uk: "Підготовка та захист очей", ru: "Подготовка и защита глаз", en: "Preparation and eye protection" },
            body: { uk: "Очищення шкіри, нанесення контактного гелю (для IPL/ResurFX). Пацієнт та лікар одягають захисні окуляри.", ru: "Очищение кожи, нанесение контактного геля (для IPL/ResurFX). Пациент и врач надевают защитные очки.", en: "Skin cleansing, contact gel application (for IPL/ResurFX). Patient and doctor wear protective goggles." },
          },
          {
            title: { uk: "Процедура (20–40 хвилин)", ru: "Процедура (20–40 минут)", en: "Treatment (20–40 minutes)" },
            body: { uk: "Лікар послідовно або комбіновано обробляє зони за обраним протоколом. IPL та Q-Switch — відчуття легкого пощипування, ResurFX — більш інтенсивне тепло.", ru: "Врач последовательно или комбинированно обрабатывает зоны по выбранному протоколу. IPL и Q-Switch — ощущение лёгкого пощипывания, ResurFX — более интенсивное тепло.", en: "The doctor treats zones sequentially or in combination per the selected protocol. IPL and Q-Switch feel like mild stinging; ResurFX feels like more intense heat." },
          },
          {
            title: { uk: "Реабілітація та догляд", ru: "Реабилитация и уход", en: "Recovery and aftercare" },
            body: { uk: "Після IPL — мінімальне почервоніння. Після ResurFX — 2–4 дні мікровідлущення. Обов'язковий SPF50+ протягом курсу та 4 тижні після.", ru: "После IPL — минимальное покраснение. После ResurFX — 2–4 дня микроотшелушивание. Обязательный SPF50+ в течение курса и 4 недели после.", en: "After IPL — minimal redness. After ResurFX — 2–4 days of micro-peeling. SPF50+ is mandatory throughout the course and 4 weeks after." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості M22 Stellar Black", ru: "Преимущества и особенности M22 Stellar Black", en: "M22 Stellar Black Benefits and Key Points" },
        items: [
          { uk: "Багатоплатформна система: IPL + ResurFX + Nd:YAG + Q-Switch в одному апараті", ru: "Многоплатформная система: IPL + ResurFX + Nd:YAG + Q-Switch в одном аппарате", en: "Multi-platform system: IPL + ResurFX + Nd:YAG + Q-Switch in one device" },
          { uk: "Ефективно лікує судини, пігмент, зморшки, акне та рубці", ru: "Эффективно лечит сосуды, пигмент, морщины, акне и рубцы", en: "Effectively treats vascularity, pigmentation, wrinkles, acne and scars" },
          { uk: "Можна поєднувати кілька модулів за один сеанс", ru: "Можно комбинировать несколько модулей за один сеанс", en: "Multiple modules can be combined in a single session" },
          { uk: "Клінічно підтверджена ефективність, FDA-схвалення", ru: "Клинически подтверждённая эффективность, FDA-одобрение", en: "Clinically proven efficacy with FDA clearance" },
          { uk: "⚠ Протипоказаний при засмазі — уникайте загоряння мінімум 4 тижні до процедури", ru: "⚠ Противопоказано при загаре — избегайте загорания минимум 4 недели до процедуры", en: "⚠ Contraindicated with tan — avoid sun exposure for at least 4 weeks before the procedure" },
          { uk: "⚠ Після ResurFX — мікровідлущення 2–4 дні; плануйте процедуру не перед важливими подіями", ru: "⚠ После ResurFX — микроотшелушивание 2–4 дня; планируйте процедуру не перед важными событиями", en: "⚠ After ResurFX — micro-peeling for 2–4 days; avoid scheduling before important events" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Обладнання M22 та клініка GENEVITY", ru: "Оборудование M22 и клиника GENEVITY", en: "M22 Equipment and GENEVITY Clinic" },
        images: [
          { url: "/images/equipment/Lumenis M22.webp", alt: "Апарат M22 Stellar Black у GENEVITY" },
          ...interior,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на M22 Stellar Black в Дніпрі", ru: "Запишитесь на M22 Stellar Black в Днепре", en: "Book M22 Stellar Black in Dnipro" },
        body: { uk: "Дізнайтеся ціну лікування на M22 Stellar Black та підберіть протокол для вашої проблеми на безкоштовній консультації.", ru: "Узнайте цену лечения на M22 Stellar Black и подберите протокол для вашей проблемы на бесплатной консультации.", en: "Find out the M22 Stellar Black treatment cost and select the right protocol for your concern at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Що таке процедура M22 Stellar Black і як вона впливає на шкіру?", ru: "Что такое процедура M22 Stellar Black и как она воздействует на кожу?", en: "What is the M22 Stellar Black procedure and how does it affect the skin?" },
        answer: { uk: "M22 Stellar Black — багатоплатформна лазерна система, яка об'єднує IPL, фракційний лазер ResurFX, Nd:YAG та Q-Switched лазери. Залежно від обраного модуля вона руйнує пігментні клітини, закриває судини, запускає фракційне оновлення шкіри або видаляє татуаж.", ru: "M22 Stellar Black — многоплатформная лазерная система, объединяющая IPL, фракционный лазер ResurFX, Nd:YAG и Q-Switched лазеры. В зависимости от выбранного модуля она разрушает пигментные клетки, закрывает сосуды, запускает фракционное обновление кожи или удаляет татуаж.", en: "M22 Stellar Black is a multi-platform laser system integrating IPL, fractional ResurFX laser, Nd:YAG and Q-Switched lasers. Depending on the selected module, it destroys pigment cells, closes vessels, triggers fractional skin renewal, or removes tattoos." },
      },
      {
        question: { uk: "Кому рекомендовано проходити M22 Stellar Black і при яких проблемах вона найбільш ефективна?", ru: "Кому рекомендовано проходить M22 Stellar Black и при каких проблемах она наиболее эффективна?", en: "Who is M22 Stellar Black recommended for and which conditions does it treat most effectively?" },
        answer: { uk: "M22 Stellar Black найефективніша для: купероза та розацеа (IPL), пігментних плям (IPL + Q-Switched), рубців постакне та зморшок (ResurFX), видалення татуажу (Q-Switched). Підходить для I–IV типів шкіри за Фіцпатріком.", ru: "M22 Stellar Black наиболее эффективна для: купероза и розацеа (IPL), пигментных пятен (IPL + Q-Switched), рубцов постакне и морщин (ResurFX), удаления татуажа (Q-Switched). Подходит для I–IV типов кожи по Фицпатрику.", en: "M22 Stellar Black is most effective for: rosacea and couperosis (IPL), pigmentation (IPL + Q-Switched), acne scars and wrinkles (ResurFX), tattoo removal (Q-Switched). Suitable for Fitzpatrick skin types I–IV." },
      },
      {
        question: { uk: "Як проходить процедура M22 Stellar Black у медичному центрі?", ru: "Как проходит процедура M22 Stellar Black в медицинском центре?", en: "How is the M22 Stellar Black procedure performed at the medical centre?" },
        answer: { uk: "Після консультації та підбору протоколу лікар очищує шкіру, наносить контактний гель (при необхідності) та обробляє зону обраним модулем. Процедура займає 20–40 хвилин залежно від зони та протоколу.", ru: "После консультации и подбора протокола врач очищает кожу, наносит контактный гель (при необходимости) и обрабатывает зону выбранным модулем. Процедура занимает 20–40 минут в зависимости от зоны и протокола.", en: "After consultation and protocol selection, the doctor cleanses the skin, applies contact gel (if needed) and treats the zone with the selected module. The procedure takes 20–40 minutes depending on the zone and protocol." },
      },
      {
        question: { uk: "Скільки процедур M22 Stellar Black потрібно для досягнення помітного результату?", ru: "Сколько процедур M22 Stellar Black нужно для достижения заметного результата?", en: "How many M22 Stellar Black sessions are needed for visible results?" },
        answer: { uk: "Залежить від показання: IPL для судин — 2–4 сеанси; корекція пігменту — 3–5; фракційне омолодження ResurFX — 3–5; видалення татуажу — 5–10+ залежно від кольору та розміру.", ru: "Зависит от показания: IPL для сосудов — 2–4 сеанса; коррекция пигмента — 3–5; фракционное омоложение ResurFX — 3–5; удаление татуажа — 5–10+ в зависимости от цвета и размера.", en: "It depends on the indication: IPL for vessels — 2–4 sessions; pigment correction — 3–5; ResurFX fractional rejuvenation — 3–5; tattoo removal — 5–10+ depending on colour and size." },
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
  console.log("\nTZ-v4 apparatus-B1 DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
