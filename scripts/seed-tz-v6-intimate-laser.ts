/**
 * TZ-compliant seed: intimate + laser services
 * Services: monopolar-rf-lifting, acupulse-co2-intimate, laser-women, laser-men
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
  { url: "/images/interior/SEMI1737-HDR.webp", alt: "Процедурний кабінет GENEVITY" },
  { url: "/images/interior/SEMI7509.webp", alt: "Клініка GENEVITY" },
];

const services: ServiceSeed[] = [
  // ─── 28. Monopolar RF Lifting ────────────────────────────────────────────
  {
    slug: "monopolar-rf-lifting",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Монополярний RF-ліфтинг обличчя та тіла в GENEVITY",
          ru: "Монополярный RF-лифтинг лица и тела в GENEVITY",
          en: "Monopolar RF Lifting of Face and Body at GENEVITY",
        },
        body: {
          uk: "Монополярний RF-ліфтинг — апаратна процедура радіочастотного ліфтингу, при якій електромагнітні хвилі проходять через усі шари шкіри від поверхні до глибини 4–6 мм, рівномірно прогріваючи дерму, підшкірно-жировий шар та СМАС-шар. На відміну від біполярного RF, монополярний RF-ліфтинг діє глибше та інтенсивніше, забезпечуючи стійке скорочення колагенових волокон.\n\nМонополярний рф ліфтинг запускає два ключові механізми: негайне скорочення наявних колагенових волокон при нагріванні (видимий ліфтинг вже після першої процедури) та неоколагенез — вироблення нового колагену впродовж 3–6 місяців після курсу.\n\nЦіна на монополярний RF-ліфтинг у GENEVITY залежить від зони та кількості сеансів. Стандартний курс — 4–6 процедур з інтервалом 1–2 тижні. Ефект зберігається 12–18 місяців.\n\nМонополярний рф ліфтинг монополярний підходить для обличчя, шиї, декольте, а також для тіла: живіт, стегна, руки. У GENEVITY процедуру виконують лікарі, які підбирають потужність та глибину впливу відповідно до стану шкіри та побажань пацієнта.",
          ru: "Монополярный RF-лифтинг — аппаратная процедура радиочастотного лифтинга, при которой электромагнитные волны проходят через все слои кожи от поверхности до глубины 4–6 мм, равномерно прогревая дерму, подкожно-жировой слой и СМАС-слой. В отличие от биполярного RF, монополярный RF-лифтинг действует глубже и интенсивнее, обеспечивая стойкое сокращение коллагеновых волокон.\n\nМонополярный рф лифтинг запускает два ключевых механизма: немедленное сокращение имеющихся коллагеновых волокон при нагреве (видимый лифтинг уже после первой процедуры) и неоколлагенез — выработка нового коллагена в течение 3–6 месяцев после курса.\n\nЦена на монополярный RF-лифтинг в GENEVITY зависит от зоны и количества сеансов. Стандартный курс — 4–6 процедур с интервалом 1–2 недели. Эффект сохраняется 12–18 месяцев.\n\nМонополярный рф лифтинг монополярный подходит для лица, шеи, декольте, а также для тела: живот, бёдра, руки. В GENEVITY процедуру выполняют врачи, подбирающие мощность и глубину воздействия в соответствии с состоянием кожи и пожеланиями пациента.",
          en: "Monopolar RF lifting is a device-based radiofrequency lifting procedure in which electromagnetic waves pass through all skin layers from the surface to a depth of 4–6 mm, evenly heating the dermis, subcutaneous fat and SMAS layer. Unlike bipolar RF, monopolar RF lifting acts deeper and more intensely, producing sustained collagen fibre contraction.\n\nMonopolar RF lifting triggers two key mechanisms: immediate contraction of existing collagen fibres upon heating (visible lifting after the first session) and neocollagenesis — new collagen production over 3–6 months post-course.\n\nThe monopolar RF lifting price at GENEVITY depends on the zone and number of sessions. Standard course: 4–6 procedures, 1–2 weeks apart. Results last 12–18 months.\n\nMonopolar RF lifting is suitable for the face, neck, décolletage, and body: abdomen, thighs, arms. At GENEVITY the procedure is performed by doctors who calibrate intensity and depth according to each patient's skin condition and goals.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до монополярного RF-ліфтингу", ru: "Показания к монополярному RF-лифтингу", en: "Indications for Monopolar RF Lifting" },
        indications: [
          { uk: "В'яла шкіра обличчя, шиї та декольте", ru: "Дряблая кожа лица, шеи и декольте", en: "Lax skin of the face, neck and décolletage" },
          { uk: "Опущення кутів рота та нечіткий контур обличчя", ru: "Опущение уголков рта и нечёткий контур лица", en: "Drooping mouth corners and undefined facial contour" },
          { uk: "Другий підборіддя та нечітка лінія щелепи", ru: "Второй подбородок и нечёткая линия челюсти", en: "Double chin and blurred jawline" },
          { uk: "В'яла шкіра живота, стегон та рук", ru: "Дряблая кожа живота, бёдер и рук", en: "Lax skin of abdomen, thighs and arms" },
          { uk: "Профілактика вікових змін шкіри у 30–45 років", ru: "Профилактика возрастных изменений кожи в 30–45 лет", en: "Prevention of age-related skin changes from 30–45 years" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Металеві імпланти, кардіостимулятори, кохлеарні імпланти в зоні обробки", ru: "Металлические импланты, кардиостимуляторы, кохлеарные импланты в зоне обработки", en: "Metal implants, pacemakers, cochlear implants in the treatment area" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Гострі запальні захворювання шкіри", ru: "Острые воспалительные заболевания кожи", en: "Acute inflammatory skin conditions" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
          { uk: "Тяжкі системні захворювання, порушення згортання крові", ru: "Тяжёлые системные заболевания, нарушения свёртываемости крови", en: "Severe systemic diseases, blood coagulation disorders" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Монополярний RF-ліфтинг — єдиний RF-метод, що діє одночасно на рівні дерми та СМАС-шару. Підтяжка одразу після першого сеансу, ефект посилюється 6 місяців.",
          ru: "Монополярный RF-лифтинг — единственный RF-метод, действующий одновременно на уровне дермы и СМАС-слоя. Подтяжка сразу после первого сеанса, эффект усиливается 6 месяцев.",
          en: "Monopolar RF lifting is the only RF method acting simultaneously at dermis and SMAS level. Lifting visible after the first session, effect strengthens over 6 months.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить монополярний RF-ліфтинг", ru: "Как проходит монополярный RF-лифтинг", en: "How Monopolar RF Lifting Works" },
        steps: [
          {
            title: { uk: "Консультація та підбір протоколу", ru: "Консультация и подбор протокола", en: "Consultation and protocol selection" },
            body: { uk: "Лікар оцінює стан шкіри, визначає зони та підбирає потужність RF відповідно до товщини підшкірно-жирового шару.", ru: "Врач оценивает состояние кожи, определяет зоны и подбирает мощность RF в соответствии с толщиной подкожно-жирового слоя.", en: "The doctor assesses skin condition, determines zones and calibrates RF power according to subcutaneous fat thickness." },
          },
          {
            title: { uk: "Підготовка шкіри", ru: "Подготовка кожи", en: "Skin preparation" },
            body: { uk: "Очищення шкіри, нанесення контактного гелю для рівномірної передачі RF-енергії.", ru: "Очищение кожи, нанесение контактного геля для равномерной передачи RF-энергии.", en: "Skin cleansing and contact gel application for even RF energy transmission." },
          },
          {
            title: { uk: "Процедура (30–60 хвилин)", ru: "Процедура (30–60 минут)", en: "Treatment (30–60 minutes)" },
            body: { uk: "Маніпула рівномірно переміщується по зоні. Температура контролюється на рівні 40–43°C — це оптимальний діапазон для коагуляції колагену.", ru: "Манипула равномерно перемещается по зоне. Температура контролируется на уровне 40–43°C — это оптимальный диапазон для коагуляции коллагена.", en: "The handpiece moves evenly across the zone. Temperature is maintained at 40–43°C — the optimal range for collagen coagulation." },
          },
          {
            title: { uk: "Рекомендації після", ru: "Рекомендации после", en: "Post-procedure recommendations" },
            body: { uk: "Уникати сауни та прямого сонця 48 годин. Можливе легке почервоніння — норма. Реабілітація відсутня.", ru: "Избегать сауны и прямого солнца 48 часов. Возможное лёгкое покраснение — норма. Реабилитация отсутствует.", en: "Avoid sauna and direct sun for 48 hours. Mild redness is normal. No recovery required." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги монополярного RF-ліфтингу", ru: "Преимущества монополярного RF-лифтинга", en: "Monopolar RF Lifting Benefits" },
        items: [
          { uk: "Видимий ліфтинг вже після першого сеансу завдяки негайній коагуляції колагену", ru: "Видимый лифтинг уже после первого сеанса благодаря немедленной коагуляции коллагена", en: "Visible lifting after the first session due to immediate collagen coagulation" },
          { uk: "Ефект посилюється 3–6 місяців після завершення курсу (неоколагенез)", ru: "Эффект усиливается 3–6 месяцев после завершения курса (неоколлагенез)", en: "Results strengthen for 3–6 months post-course (neocollagenesis)" },
          { uk: "Підходить для обличчя та тіла: живіт, стегна, руки", ru: "Подходит для лица и тела: живот, бёдра, руки", en: "Suitable for face and body: abdomen, thighs, arms" },
          { uk: "Нульовий реабілітаційний період", ru: "Нулевой реабилитационный период", en: "Zero downtime" },
          { uk: "⚠ Ефективність нижча, ніж у Ultraformer MPT при вираженому птозі — лікар оцінить і порекомендує правильний метод", ru: "⚠ Эффективность ниже, чем у Ultraformer MPT при выраженном птозе — врач оценит и порекомендует правильный метод", en: "⚠ Less effective than Ultraformer MPT for pronounced ptosis — the doctor will assess and recommend the right approach" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка та кабінети GENEVITY", ru: "Клиника и кабинеты GENEVITY", en: "GENEVITY Clinic and Rooms" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на монополярний RF-ліфтинг у GENEVITY", ru: "Запишитесь на монополярный RF-лифтинг в GENEVITY", en: "Book Monopolar RF Lifting at GENEVITY" },
        body: { uk: "Дізнайтеся ціну монополярного RF-ліфтингу та оцініть зони корекції на безкоштовній консультації.", ru: "Узнайте цену монополярного RF-лифтинга и оцените зоны коррекции на бесплатной консультации.", en: "Find out the monopolar RF lifting price and assess correction zones at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки триває ефект від монополярного RF-ліфтингу?", ru: "Сколько длится эффект от монополярного RF-лифтинга?", en: "How long do monopolar RF lifting results last?" },
        answer: { uk: "Ефект від курсу монополярного RF-ліфтингу зберігається 12–18 місяців. Результат продовжує покращуватися 3–6 місяців після завершення курсу завдяки неоколагенезу.", ru: "Эффект от курса монополярного RF-лифтинга сохраняется 12–18 месяцев. Результат продолжает улучшаться 3–6 месяцев после завершения курса благодаря неоколлагенезу.", en: "Monopolar RF lifting course results last 12–18 months. Results continue improving for 3–6 months post-course due to neocollagenesis." },
      },
      {
        question: { uk: "Чи болісна процедура монополярного RF-ліфтингу?", ru: "Болезненна ли процедура монополярного RF-лифтинга?", en: "Is monopolar RF lifting painful?" },
        answer: { uk: "Ні. Процедура комфортна — пацієнт відчуває приємне тепло. Температура контролюється апаратом та лікарем, виключаючи опіки та надмірний дискомфорт.", ru: "Нет. Процедура комфортна — пациент ощущает приятное тепло. Температура контролируется аппаратом и врачом, исключая ожоги и чрезмерный дискомфорт.", en: "No. The procedure is comfortable — the patient feels pleasant warmth. Temperature is monitored by both the device and doctor, preventing burns and excessive discomfort." },
      },
      {
        question: { uk: "Скільки сеансів монополярного RF-ліфтингу необхідно для досягнення бажаного результату?", ru: "Сколько сеансов монополярного RF-лифтинга необходимо для достижения желаемого результата?", en: "How many monopolar RF lifting sessions are needed for desired results?" },
        answer: { uk: "Стандартний курс — 4–6 сеансів з інтервалом 1–2 тижні. Підтримуючі процедури — 1–2 рази на рік. Кількість залежить від зони та вихідного стану шкіри.", ru: "Стандартный курс — 4–6 сеансов с интервалом 1–2 недели. Поддерживающие процедуры — 1–2 раза в год. Количество зависит от зоны и исходного состояния кожи.", en: "Standard course: 4–6 sessions, 1–2 weeks apart. Maintenance: 1–2 times per year. Number depends on zone and initial skin condition." },
      },
    ],
  },

  // ─── 30. AcuPulse CO₂ інтимне омолодження ────────────────────────────────
  {
    slug: "acupulse-co2-intimate",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерне інтимне омолодження AcuPulse CO₂ в GENEVITY",
          ru: "Лазерное интимное омоложение AcuPulse CO₂ в GENEVITY",
          en: "AcuPulse CO₂ Intimate Rejuvenation at GENEVITY",
        },
        body: {
          uk: "Лазерне омолодження піхви AcuPulse CO₂ — медична процедура відновлення слизової оболонки піхви та прилеглих тканин за допомогою фракційного CO₂ лазера (10 600 нм). Технологія доставляє контрольовану теплову енергію в тканини, стимулюючи вироблення нового колагену та відновлення зволоженості, еластичності та тонусу вагінальних стінок.\n\nLO₂-омолодження (CO₂ омолодження) показане насамперед жінкам, які відчувають наслідки вікових гормональних змін: сухість, дискомфорт під час статевого акту, зниження чутливості. Процедура також ефективна для CO₂-звуження вагінальних м'язів після пологів та при функціональному недотриманні м'язового тонусу.\n\nЛазерне омолодження CO₂ виконується спеціальним вагінальним насадком, який рівномірно обробляє слизову оболонку. Процедура займає 15–20 хвилин, проводиться в амбулаторних умовах без госпіталізації. Реабілітаційний період — 3–5 днів статевого спокою.\n\nКурс лазерного вагінального омолодження складається з 3 сеансів з інтервалом 4–6 тижнів. Ефект зберігається 12–18 місяців, після чого рекомендована підтримуюча процедура 1 раз на рік. У GENEVITY процедуру виконують лікарі-гінекологи та лікарі-косметологи зі спеціалізацією в інтимній естетиці.",
          ru: "Лазерное омоложение влагалища AcuPulse CO₂ — медицинская процедура восстановления слизистой оболочки влагалища и прилегающих тканей с помощью фракционного CO₂ лазера (10 600 нм). Технология доставляет контролируемую тепловую энергию в ткани, стимулируя выработку нового коллагена и восстановление увлажнённости, эластичности и тонуса вагинальных стенок.\n\nCO₂-омоложение показано прежде всего женщинам, испытывающим последствия возрастных гормональных изменений: сухость, дискомфорт во время полового акта, снижение чувствительности. Процедура также эффективна для CO₂-сужения вагинальных мышц после родов и при функциональном снижении мышечного тонуса.\n\nЛазерное омоложение CO₂ выполняется специальной вагинальной насадкой, которая равномерно обрабатывает слизистую оболочку. Процедура занимает 15–20 минут, проводится амбулаторно без госпитализации. Реабилитационный период — 3–5 дней полового покоя.\n\nКурс лазерного вагинального омоложения состоит из 3 сеансов с интервалом 4–6 недель. Эффект сохраняется 12–18 месяцев, после чего рекомендована поддерживающая процедура 1 раз в год. В GENEVITY процедуру выполняют врачи-гинекологи и врачи-косметологи со специализацией в интимной эстетике.",
          en: "AcuPulse CO₂ vaginal rejuvenation is a medical procedure for restoring the vaginal mucosa and surrounding tissues using a fractional CO₂ laser (10,600 nm). The technology delivers controlled thermal energy to the tissue, stimulating new collagen production and restoring moisture, elasticity and tone of the vaginal walls.\n\nCO₂ rejuvenation is primarily indicated for women experiencing the effects of age-related hormonal changes: dryness, discomfort during intercourse, and reduced sensitivity. The procedure is also effective for CO₂ vaginal muscle tightening after childbirth and when functional muscle tone is reduced.\n\nCO₂ laser rejuvenation is performed with a specialised vaginal attachment that evenly treats the mucous membrane. The procedure takes 15–20 minutes and is performed on an outpatient basis without hospitalisation. Recovery period: 3–5 days of sexual rest.\n\nA vaginal laser rejuvenation course consists of 3 sessions, 4–6 weeks apart. Results last 12–18 months, after which a maintenance session once a year is recommended. At GENEVITY the procedure is performed by gynaecologists and cosmetic doctors specialising in intimate aesthetics.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до лазерного інтимного омолодження CO₂", ru: "Показания к лазерному интимному омоложению CO₂", en: "Indications for CO₂ Intimate Rejuvenation" },
        indications: [
          { uk: "Вагінальна атрофія та сухість слизової оболонки після менопаузи", ru: "Вагинальная атрофия и сухость слизистой оболочки после менопаузы", en: "Vaginal atrophy and mucosal dryness after menopause" },
          { uk: "Зниження тонусу та розтягнення вагінальних стінок після пологів", ru: "Снижение тонуса и растяжение вагинальных стенок после родов", en: "Reduced tone and stretching of vaginal walls after childbirth" },
          { uk: "Дискомфорт та болючість під час статевого акту (диспареунія)", ru: "Дискомфорт и болезненность во время полового акта (диспареуния)", en: "Discomfort and pain during intercourse (dyspareunia)" },
          { uk: "Зниження чутливості та якості статевого життя", ru: "Снижение чувствительности и качества половой жизни", en: "Reduced sensitivity and quality of intimate life" },
          { uk: "Лёгке нетримання сечі при напруженні (функціональне)", ru: "Лёгкое недержание мочи при напряжении (функциональное)", en: "Mild stress urinary incontinence (functional)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність та підозра на вагітність", ru: "Беременность и подозрение на беременность", en: "Pregnancy or suspected pregnancy" },
          { uk: "Гострі запальні захворювання статевих органів", ru: "Острые воспалительные заболевания половых органов", en: "Acute inflammatory conditions of the genitourinary tract" },
          { uk: "Онкологічні захворювання репродуктивної системи", ru: "Онкологические заболевания репродуктивной системы", en: "Oncological conditions of the reproductive system" },
          { uk: "Менструація на момент процедури", ru: "Менструация на момент процедуры", en: "Menstruation at the time of the procedure" },
          { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "Keloid scarring tendency" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Лазерне омолодження CO₂ — єдина нехірургічна процедура, яка відновлює колаген та гіалуронову кислоту у вагінальній слизовій. Без гормонів, без імплантів, без госпіталізації.",
          ru: "Лазерное омоложение CO₂ — единственная нехирургическая процедура, восстанавливающая коллаген и гиалуроновую кислоту в вагинальной слизистой. Без гормонов, без имплантов, без госпитализации.",
          en: "CO₂ laser rejuvenation is the only non-surgical procedure that restores collagen and hyaluronic acid in the vaginal mucosa. No hormones, no implants, no hospitalisation.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура лазерного інтимного омолодження", ru: "Как проходит процедура лазерного интимного омоложения", en: "How CO₂ Intimate Rejuvenation Works" },
        steps: [
          {
            title: { uk: "Консультація лікаря", ru: "Консультация врача", en: "Doctor consultation" },
            body: { uk: "Гінекологічний огляд, виключення протипоказань, обговорення очікувань та курсу процедур.", ru: "Гинекологический осмотр, исключение противопоказаний, обсуждение ожиданий и курса процедур.", en: "Gynaecological examination, contraindication screening, discussion of expectations and course plan." },
          },
          {
            title: { uk: "Підготовка (знеболення не потрібне)", ru: "Подготовка (обезболивание не требуется)", en: "Preparation (no anaesthesia required)" },
            body: { uk: "Процедура практично безболісна. За потреби наноситься місцева анестезуюча мазь. Підготовка займає 5–10 хвилин.", ru: "Процедура практически безболезненна. При необходимости наносится местная анестезирующая мазь. Подготовка занимает 5–10 минут.", en: "The procedure is virtually painless. Topical anaesthetic ointment may be applied if needed. Preparation takes 5–10 minutes." },
          },
          {
            title: { uk: "Процедура (15–20 хвилин)", ru: "Процедура (15–20 минут)", en: "Treatment (15–20 minutes)" },
            body: { uk: "Вагінальна насадка вводиться та рівномірно обертається, обробляючи слизову 360°. Пацієнт відчуває легке тепло.", ru: "Вагинальная насадка вводится и равномерно вращается, обрабатывая слизистую на 360°. Пациент ощущает лёгкое тепло.", en: "The vaginal attachment is inserted and rotated evenly, treating the mucosa 360°. The patient feels mild warmth." },
          },
          {
            title: { uk: "Реабілітація", ru: "Реабилитация", en: "Recovery" },
            body: { uk: "3–5 днів статевого спокою. Уникати гарячих ванн та басейну 5 днів. Можливе незначне виділення — норма.", ru: "3–5 дней полового покоя. Избегать горячих ванн и бассейна 5 дней. Возможные незначительные выделения — норма.", en: "3–5 days of sexual rest. Avoid hot baths and swimming pools for 5 days. Mild discharge is normal." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості CO₂ інтимного омолодження", ru: "Преимущества и особенности CO₂ интимного омоложения", en: "CO₂ Intimate Rejuvenation Benefits and Key Points" },
        items: [
          { uk: "Відновлює колаген та гіалуронову кислоту в тканинах — без гормонів", ru: "Восстанавливает коллаген и гиалуроновую кислоту в тканях — без гормонов", en: "Restores collagen and hyaluronic acid in tissues — no hormones" },
          { uk: "Ефективне лікування вагінальної атрофії та сухості", ru: "Эффективное лечение вагинальной атрофии и сухости", en: "Effective treatment of vaginal atrophy and dryness" },
          { uk: "CO₂-звуження вагінальних м'язів після пологів без хірургії", ru: "CO₂-сужение вагинальных мышц после родов без хирургии", en: "CO₂ vaginal tightening after childbirth without surgery" },
          { uk: "15–20 хвилин, амбулаторно, без госпіталізації", ru: "15–20 минут, амбулаторно, без госпитализации", en: "15–20 minutes, outpatient, no hospitalisation" },
          { uk: "Ефект зберігається 12–18 місяців після курсу з 3 сеансів", ru: "Эффект сохраняется 12–18 месяцев после курса из 3 сеансов", en: "Results last 12–18 months after a course of 3 sessions" },
          { uk: "⚠ Не замінює гормональну терапію при значному гормональному дефіциті — лікар направить до ендокринолога за показаннями", ru: "⚠ Не заменяет гормональную терапию при значительном гормональном дефиците — врач направит к эндокринологу по показаниям", en: "⚠ Does not replace hormone therapy for significant hormonal deficiency — the doctor will refer to an endocrinologist if indicated" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка GENEVITY", ru: "Клиника GENEVITY", en: "GENEVITY Clinic" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на лазерне інтимне омолодження CO₂ в GENEVITY", ru: "Запишитесь на лазерное интимное омоложение CO₂ в GENEVITY", en: "Book CO₂ Intimate Rejuvenation at GENEVITY" },
        body: { uk: "Конфіденційна консультація лікаря — безкоштовно. Дізнайтеся ціну лазерного омолодження CO₂ та підберіть курс.", ru: "Конфиденциальная консультация врача — бесплатно. Узнайте цену лазерного омоложения CO₂ и подберите курс.", en: "Confidential doctor consultation is free. Find out the CO₂ rejuvenation price and plan your course." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи болісна процедура лазерного інтимного омолодження AcuPulse CO₂?", ru: "Болезненна ли процедура лазерного интимного омоложения AcuPulse CO₂?", en: "Is AcuPulse CO₂ intimate rejuvenation painful?" },
        answer: { uk: "Ні. Процедура практично безболісна. Більшість пацієнток відчувають лише легке тепло та незначний дискомфорт. За бажанням наноситься місцева знеболювальна мазь.", ru: "Нет. Процедура практически безболезненна. Большинство пациенток ощущают лишь лёгкое тепло и незначительный дискомфорт. По желанию наносится местная обезболивающая мазь.", en: "No. The procedure is virtually painless. Most patients feel only mild warmth and minimal discomfort. Topical anaesthetic ointment can be applied on request." },
      },
      {
        question: { uk: "Скільки триває ефект після CO2-омолодження та як його підтримати?", ru: "Сколько длится эффект после CO2-омоложения и как его поддержать?", en: "How long do CO₂ rejuvenation results last and how to maintain them?" },
        answer: { uk: "Ефект від курсу з 3 сеансів зберігається 12–18 місяців. Для підтримки рекомендована 1 процедура на рік. Додатково лікар може призначити місцеві засоби для інтимної гігієни на основі гіалуронової кислоти.", ru: "Эффект от курса из 3 сеансов сохраняется 12–18 месяцев. Для поддержки рекомендована 1 процедура в год. Дополнительно врач может назначить местные средства для интимной гигиены на основе гиалуроновой кислоты.", en: "Results from a 3-session course last 12–18 months. One maintenance session per year is recommended. The doctor may also prescribe hyaluronic acid-based intimate care products." },
      },
      {
        question: { uk: "Чи є протипоказання до лазерного омолодження CO2?", ru: "Есть ли противопоказания к лазерному омоложению CO2?", en: "Are there contraindications to CO₂ laser rejuvenation?" },
        answer: { uk: "Так. Основні протипоказання: вагітність, гострі запальні захворювання статевих органів, онкологія репродуктивної системи, менструація на момент процедури. Повний перелік уточнюється на консультації.", ru: "Да. Основные противопоказания: беременность, острые воспалительные заболевания половых органов, онкология репродуктивной системы, менструация на момент процедуры. Полный перечень уточняется на консультации.", en: "Yes. Main contraindications: pregnancy, acute inflammatory genitourinary conditions, reproductive oncology, menstruation at time of procedure. Full list clarified at consultation." },
      },
      {
        question: { uk: "Чи впливає процедура на чутливість та якість інтимного життя?", ru: "Влияет ли процедура на чувствительность и качество интимной жизни?", en: "Does the procedure affect sensitivity and quality of intimate life?" },
        answer: { uk: "Так, позитивно. Відновлення слизової, зволоженості та тонусу тканин прямо впливає на чутливість та якість статевого акту. Більшість пацієнток відзначають покращення вже після першого-другого сеансу.", ru: "Да, положительно. Восстановление слизистой, увлажнённости и тонуса тканей напрямую влияет на чувствительность и качество полового акта. Большинство пациенток отмечают улучшение уже после первого-второго сеанса.", en: "Yes, positively. Restoration of the mucosa, moisture and tissue tone directly improves sensitivity and quality of intercourse. Most patients notice improvement after the first or second session." },
      },
    ],
  },

  // ─── 33. Лазерна епіляція для жінок ─────────────────────────────────────
  {
    slug: "laser-women",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерна епіляція для жінок у GENEVITY — ціна, зони, результат",
          ru: "Лазерная эпиляция для женщин в GENEVITY — цена, зоны, результат",
          en: "Laser Hair Removal for Women at GENEVITY — Pricing, Zones, Results",
        },
        body: {
          uk: "Жіноча лазерна епіляція в GENEVITY виконується на апараті Splendor X (Lumenis) — єдиному лазері з технологією BLEND X®, яка поєднує Alexandrite 755 нм та Nd:YAG 1064 нм. Це дозволяє ефективно видаляти волосся на будь-якому типі шкіри, включаючи засмаглу (типи IV–VI за Фіцпатріком), що є критично важливим для жінок активного способу життя.\n\nЛазерна епіляція для жінок ціна залежить від обраної зони. У GENEVITY доступні всі зони жіночої лазерної епіляції: верхня губа, підборіддя, щоки, пахви, класичне та глибоке бікіні, гомілки, коліна, стегна, руки (передпліччя та повні руки), спина та живіт. Ціни на лазерну епіляцію для жінок уточнюються на консультації.\n\nРезультат після повного курсу — 80–95% постійного видалення волосся. Курс складається з 6–10 сеансів (кількість залежить від зони та типу волосся) з інтервалом 4–8 тижнів. Інтервали пов'язані з фазами росту волосся: лазер ефективний лише в анагенній (активній) фазі, тому процедури проводяться суворо за розкладом.\n\nВ GENEVITY лазерну епіляцію для жінок виконують сертифіковані лікарі, що гарантує безпеку та ефективність навіть для найчутливіших зон.",
          ru: "Женская лазерная эпиляция в GENEVITY выполняется на аппарате Splendor X (Lumenis) — единственном лазере с технологией BLEND X®, сочетающей Alexandrite 755 нм и Nd:YAG 1064 нм. Это позволяет эффективно удалять волосы на любом типе кожи, включая загорелую (типы IV–VI по Фицпатрику), что критически важно для женщин активного образа жизни.\n\nЛазерная эпиляция для женщин цена зависит от выбранной зоны. В GENEVITY доступны все зоны женской лазерной эпиляции: верхняя губа, подбородок, щёки, подмышки, классическое и глубокое бикини, голени, колени, бёдра, руки (предплечья и полные руки), спина и живот. Цены на лазерную эпиляцию для женщин уточняются на консультации.\n\nРезультат после полного курса — 80–95% постоянного удаления волос. Курс состоит из 6–10 сеансов (количество зависит от зоны и типа волос) с интервалом 4–8 недель. Интервалы связаны с фазами роста волос: лазер эффективен только в анагенной (активной) фазе, поэтому процедуры проводятся строго по расписанию.\n\nВ GENEVITY лазерную эпиляцию для женщин выполняют сертифицированные врачи, что гарантирует безопасность и эффективность даже для самых чувствительных зон.",
          en: "Women's laser hair removal at GENEVITY is performed using the Splendor X (Lumenis) device — the only laser with BLEND X® technology combining Alexandrite 755 nm and Nd:YAG 1064 nm. This enables effective hair removal on all skin types, including tanned skin (Fitzpatrick types IV–VI), which is essential for active women.\n\nLaser hair removal for women pricing depends on the selected zone. GENEVITY offers all women's laser hair removal zones: upper lip, chin, cheeks, underarms, standard and deep bikini, calves, knees, thighs, arms (forearms and full arms), back and abdomen. Pricing is confirmed at consultation.\n\nAfter a full course: 80–95% permanent hair removal. A course consists of 6–10 sessions (depending on zone and hair type), 4–8 weeks apart. Intervals align with hair growth phases: the laser is effective only during the anagen (active) phase, so sessions must follow a strict schedule.\n\nAt GENEVITY women's laser hair removal is performed by certified doctors, ensuring safety and efficacy even for the most sensitive zones.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до жіночої лазерної епіляції", ru: "Показания к женской лазерной эпиляции", en: "Indications for Women's Laser Hair Removal" },
        indications: [
          { uk: "Небажане волосся на будь-якій зоні тіла та обличчя", ru: "Нежелательные волосы на любой зоне тела и лица", en: "Unwanted hair on any body area or face" },
          { uk: "Вростаюче волосся після гоління, шугарингу або воскової депіляції", ru: "Вросшие волосы после бритья, шугаринга или восковой депиляции", en: "Ingrown hairs after shaving, sugaring or waxing" },
          { uk: "Темне або грубе волосся на обличчі (підборіддя, верхня губа)", ru: "Тёмные или грубые волосы на лице (подбородок, верхняя губа)", en: "Dark or coarse facial hair (chin, upper lip)" },
          { uk: "Гіпертрихоз та надмірний ріст волосся (у тому числі гормональний)", ru: "Гипертрихоз и избыточный рост волос (в том числе гормональный)", en: "Hypertrichosis and excessive hair growth (including hormonal)" },
          { uk: "Бажання назавжди позбутися регулярної депіляції", ru: "Желание навсегда избавиться от регулярной депиляции", en: "Desire to permanently eliminate regular hair removal" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Свіжа засмага та активне засмагання (менше 2 тижнів)", ru: "Свежий загар и активное загорание (менее 2 недель)", en: "Recent or active tanning (less than 2 weeks)" },
          { uk: "Прийом фотосенсибілізуючих засобів: ізотретиноїн, тетрацикліни, деякі антидепресанти", ru: "Приём фотосенсибилизирующих средств: изотретиноин, тетрациклины, некоторые антидепрессанты", en: "Use of photosensitising drugs: isotretinoin, tetracyclines, some antidepressants" },
          { uk: "Онкологічні захворювання та схильність до келоїдів", ru: "Онкологические заболевания и склонность к келоидам", en: "Active oncological conditions and keloid tendency" },
          { uk: "Менструація (для зони бікіні та живота)", ru: "Менструация (для зоны бикини и живота)", en: "Menstruation (for bikini and abdominal zones)" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Лазерна епіляція для жінок на Splendor X — безпечна навіть влітку та при засмазі. Всі зони, включаючи глибоке бікіні та обличчя, в одній клініці.",
          ru: "Лазерная эпиляция для женщин на Splendor X — безопасна даже летом и при загаре. Все зоны, включая глубокое бикини и лицо, в одной клинике.",
          en: "Women's laser hair removal on Splendor X — safe even in summer and with a tan. All zones including deep bikini and face, in one clinic.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить жіноча лазерна епіляція", ru: "Как проходит женская лазерная эпиляция", en: "How Women's Laser Hair Removal Works" },
        steps: [
          {
            title: { uk: "Консультація та визначення зон", ru: "Консультация и определение зон", en: "Consultation and zone selection" },
            body: { uk: "Лікар визначає тип шкіри та волосся, підбирає параметри лазера та складає розклад сеансів.", ru: "Врач определяет тип кожи и волос, подбирает параметры лазера и составляет расписание сеансов.", en: "The doctor determines skin and hair type, calibrates laser parameters and creates a session schedule." },
          },
          {
            title: { uk: "Підготовка (за 1–2 доби до)", ru: "Подготовка (за 1–2 суток до)", en: "Preparation (1–2 days before)" },
            body: { uk: "Збрити зону (не вощити). Уникати засмаги 2 тижні. Не використовувати скраби 3 доби.", ru: "Побрить зону (не восковать). Избегать загара 2 недели. Не использовать скрабы 3 суток.", en: "Shave the zone (do not wax). Avoid tanning 2 weeks. No scrubs for 3 days." },
          },
          {
            title: { uk: "Сеанс (10–60 хвилин)", ru: "Сеанс (10–60 минут)", en: "Session (10–60 minutes)" },
            body: { uk: "Лікар рівномірно обробляє зону лазером. Вбудоване охолодження знижує дискомфорт до мінімуму.", ru: "Врач равномерно обрабатывает зону лазером. Встроенное охлаждение снижает дискомфорт до минимума.", en: "The doctor treats the zone evenly with the laser. Built-in cooling minimises discomfort." },
          },
          {
            title: { uk: "Догляд після", ru: "Уход после", en: "Aftercare" },
            body: { uk: "SPF50+ 2 тижні, уникати сауни 2 доби. Через 2 тижні волосся «виходить» — це норма. Наступний сеанс — за розкладом.", ru: "SPF50+ 2 недели, избегать сауны 2 суток. Через 2 недели волосы «выходят» — это норма. Следующий сеанс — по расписанию.", en: "SPF50+ for 2 weeks, avoid sauna for 2 days. After 2 weeks hair 'sheds' — this is normal. Next session per schedule." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги жіночої лазерної епіляції в GENEVITY", ru: "Преимущества женской лазерной эпиляции в GENEVITY", en: "Benefits of Women's Laser Hair Removal at GENEVITY" },
        items: [
          { uk: "Splendor X BLEND X® — ефективно для всіх типів шкіри, включаючи засмаглу", ru: "Splendor X BLEND X® — эффективно для всех типов кожи, включая загорелую", en: "Splendor X BLEND X® — effective for all skin types including tanned" },
          { uk: "80–95% постійного видалення волосся після повного курсу", ru: "80–95% постоянного удаления волос после полного курса", en: "80–95% permanent hair removal after a full course" },
          { uk: "Всі зони тіла та обличчя — від верхньої губи до глибокого бікіні", ru: "Все зоны тела и лица — от верхней губы до глубокого бикини", en: "All body and facial zones — from upper lip to deep bikini" },
          { uk: "Безпечно влітку та при засмазі (тип IV–VI за Фіцпатріком)", ru: "Безопасно летом и при загаре (тип IV–VI по Фицпатрику)", en: "Safe in summer and with a tan (Fitzpatrick type IV–VI)" },
          { uk: "⚠ Сіре та руде волосся — знижена ефективність; рекомендується консультація перед початком курсу", ru: "⚠ Седые и рыжие волосы — сниженная эффективность; рекомендуется консультация перед началом курса", en: "⚠ Grey and red hair — reduced efficacy; consultation recommended before starting" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка GENEVITY — процедурні кабінети", ru: "Клиника GENEVITY — процедурные кабинеты", en: "GENEVITY Clinic — Treatment Rooms" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на жіночу лазерну епіляцію в Дніпрі", ru: "Запишитесь на женскую лазерную эпиляцию в Днепре", en: "Book Women's Laser Hair Removal in Dnipro" },
        body: { uk: "Дізнайтеся ціни на лазерну епіляцію для жінок та підберіть зони на безкоштовній консультації лікаря.", ru: "Узнайте цены на лазерную эпиляцию для женщин и подберите зоны на бесплатной консультации врача.", en: "Find out women's laser hair removal prices and select treatment zones at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки сеансів потрібно для повного видалення волосся?", ru: "Сколько сеансов нужно для полного удаления волос?", en: "How many sessions are needed for complete hair removal?" },
        answer: { uk: "Для більшості зон — 6–10 сеансів з інтервалом 4–8 тижнів. Обличчя та бікіні потребують більше сеансів через щільне розташування фолікулів та гормональний вплив.", ru: "Для большинства зон — 6–10 сеансов с интервалом 4–8 недель. Лицо и бикини требуют больше сеансов из-за плотного расположения фолликулов и гормонального влияния.", en: "For most zones: 6–10 sessions, 4–8 weeks apart. Face and bikini zones require more sessions due to dense follicle distribution and hormonal influence." },
      },
      {
        question: { uk: "Чи болюча процедура лазерної епіляції?", ru: "Болезненна ли процедура лазерной эпиляции?", en: "Is laser hair removal painful?" },
        answer: { uk: "Дискомфорт мінімальний завдяки вбудованій системі охолодження Splendor X. Більшість пацієнток описують відчуття як легке пощипування. Найбільш чутливі зони — бікіні та пахви.", ru: "Дискомфорт минимальный благодаря встроенной системе охлаждения Splendor X. Большинство пациенток описывают ощущения как лёгкое пощипывание. Наиболее чувствительные зоны — бикини и подмышки.", en: "Discomfort is minimal thanks to Splendor X's built-in cooling. Most patients describe the sensation as mild stinging. The most sensitive zones are bikini and underarms." },
      },
      {
        question: { uk: "Чи можна робити лазерну епіляцію влітку?", ru: "Можно ли делать лазерную эпиляцию летом?", en: "Can laser hair removal be done in summer?" },
        answer: { uk: "Так. Splendor X завдяки Nd:YAG 1064 нм безпечний для засмаглої шкіри. Умова: не загоряти 2 тижні до та після кожного сеансу та використовувати SPF50+.", ru: "Да. Splendor X благодаря Nd:YAG 1064 нм безопасен для загорелой кожи. Условие: не загорать 2 недели до и после каждого сеанса и использовать SPF50+.", en: "Yes. Splendor X with Nd:YAG 1064 nm is safe for tanned skin. Condition: avoid tanning 2 weeks before and after each session and use SPF50+." },
      },
      {
        question: { uk: "Які зони можна обробляти лазером?", ru: "Какие зоны можно обрабатывать лазером?", en: "Which zones can be treated with laser?" },
        answer: { uk: "Всі зони тіла та обличчя: верхня губа, підборіддя, бакенбарди, шия, пахви, грудь, живіт, спина, бікіні (класичне та глибоке), стегна, коліна, гомілки, стопи, руки (від пальців до плечей).", ru: "Все зоны тела и лица: верхняя губа, подбородок, бакенбарды, шея, подмышки, грудь, живот, спина, бикини (классическое и глубокое), бёдра, колени, голени, стопы, руки (от пальцев до плеч).", en: "All body and facial zones: upper lip, chin, sideburns, neck, underarms, chest, abdomen, back, bikini (standard and deep), thighs, knees, calves, feet, arms (from fingers to shoulders)." },
      },
      {
        question: { uk: "Чи підходить лазерна епіляція для всіх типів шкіри?", ru: "Подходит ли лазерная эпиляция для всех типов кожи?", en: "Is laser hair removal suitable for all skin types?" },
        answer: { uk: "Так. Splendor X з технологією BLEND X® підходить для всіх типів шкіри від I до VI за Фіцпатріком. Для чутливої та темної шкіри лікар підбере оптимальне поєднання параметрів.", ru: "Да. Splendor X с технологией BLEND X® подходит для всех типов кожи от I до VI по Фицпатрику. Для чувствительной и тёмной кожи врач подберёт оптимальное сочетание параметров.", en: "Yes. Splendor X with BLEND X® technology suits all Fitzpatrick skin types I–VI. For sensitive and dark skin the doctor will select the optimal parameter combination." },
      },
    ],
  },

  // ─── 32. Лазерна епіляція для чоловіків ──────────────────────────────────
  {
    slug: "laser-men",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Чоловіча лазерна епіляція в GENEVITY — зони, ціна, результат",
          ru: "Мужская лазерная эпиляция в GENEVITY — зоны, цена, результат",
          en: "Men's Laser Hair Removal at GENEVITY — Zones, Price, Results",
        },
        body: {
          uk: "Лазерна епіляція для чоловіків у GENEVITY виконується на апараті Splendor X (Lumenis) з технологією BLEND X®. Чоловіча лазерна епіляція відрізняється від жіночої більшою щільністю та товщиною волосяних стержнів, а також більшою площею зон обробки — особливо для спини, грудей та плечей.\n\nЧоловіча лазерна епіляція лазерна епіляція для чоловіків затребувана насамперед для зон: спина та плечі (найпопулярніша зона), груди та живіт, борода та шия (корекція лінії росту), пахви, руки, ноги. Середня тривалість сеансу для великих зон — 30–60 хвилин.\n\nКурс лазерної епіляції для чоловіків складається з 6–8 сеансів для тіла та 8–12 для обличчя (борода, шия). Щільне чоловіче волосся вимагає більшої кількості сеансів, ніж жіноче, однак і результат після повного курсу — більш виражений: 80–95% постійного видалення.\n\nВажлива перевага для чоловіків — відсутність вростаючого волосся після гоління у зоні бороди та шиї. Лазерна епіляція вирішує цю проблему кардинально: через 6–8 сеансів волосся в зоні гоління або зникає повністю (якщо пацієнт обирає видалення), або значно рідшає та стає м'якшим (якщо мета — корекція лінії).\n\nВ GENEVITY чоловіча лазерна епіляція виконується в комфортних умовах сертифікованими лікарями. Конфіденційність гарантована.",
          ru: "Лазерная эпиляция для мужчин в GENEVITY выполняется на аппарате Splendor X (Lumenis) с технологией BLEND X®. Мужская лазерная эпиляция отличается от женской большей плотностью и толщиной волосяных стержней, а также большей площадью зон обработки — особенно для спины, груди и плеч.\n\nЧоловіча лазерна лазерная эпиляция для мужчин востребована прежде всего для зон: спина и плечи (самая популярная зона), грудь и живот, борода и шея (коррекция линии роста), подмышки, руки, ноги. Средняя продолжительность сеанса для крупных зон — 30–60 минут.\n\nКурс лазерной эпиляции для мужчин состоит из 6–8 сеансов для тела и 8–12 для лица (борода, шея). Густые мужские волосы требуют большего количества сеансов, чем женские, однако и результат после полного курса более выражен: 80–95% постоянного удаления.\n\nВажное преимущество для мужчин — отсутствие вросших волос после бритья в зоне бороды и шеи. Лазерная эпиляция решает эту проблему кардинально: после 6–8 сеансов волосы в зоне бритья либо исчезают полностью (если пациент выбирает удаление), либо значительно редеют и становятся мягче (если цель — коррекция линии).\n\nВ GENEVITY мужская лазерная эпиляция выполняется в комфортных условиях сертифицированными врачами. Конфиденциальность гарантирована.",
          en: "Men's laser hair removal at GENEVITY is performed using the Splendor X (Lumenis) device with BLEND X® technology. Men's laser hair removal differs from women's due to higher hair density and thickness, as well as larger treatment areas — especially back, chest and shoulders.\n\nMen's laser hair removal is most in demand for: back and shoulders (the most popular zone), chest and abdomen, beard and neck (hairline correction), underarms, arms, legs. Average session duration for large zones: 30–60 minutes.\n\nA men's laser hair removal course consists of 6–8 sessions for body zones and 8–12 for facial zones (beard, neck). Dense male hair requires more sessions than female hair, but the result after a full course is more pronounced: 80–95% permanent removal.\n\nKey benefit for men — no ingrown hairs after shaving in the beard and neck zone. Laser hair removal solves this radically: after 6–8 sessions, hair in the shaving zone either disappears completely (if the patient chooses full removal) or thins significantly and softens (if the goal is hairline correction).\n\nAt GENEVITY men's laser hair removal is performed in a comfortable environment by certified doctors. Confidentiality is guaranteed.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до чоловічої лазерної епіляції", ru: "Показания к мужской лазерной эпиляции", en: "Indications for Men's Laser Hair Removal" },
        indications: [
          { uk: "Небажане волосся на спині, плечах, грудях, животі", ru: "Нежелательные волосы на спине, плечах, груди, животе", en: "Unwanted hair on back, shoulders, chest, abdomen" },
          { uk: "Вростаюче волосся після гоління бороди та шиї", ru: "Вросшие волосы после бритья бороды и шеи", en: "Ingrown hairs after shaving beard and neck" },
          { uk: "Корекція лінії зростання бороди та оформлення контуру", ru: "Коррекция линии роста бороды и оформление контура", en: "Beard hairline correction and contour definition" },
          { uk: "Надмірне волосся на вухах, носі та між бровами", ru: "Избыточные волосы на ушах, носу и между бровями", en: "Excessive hair on ears, nose and between eyebrows" },
          { uk: "Підготовка тіла до спортивних виступів або фотосесій", ru: "Подготовка тела к спортивным выступлениям или фотосессиям", en: "Body preparation for sports events or photoshoots" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Свіжа засмага (менше 2 тижнів)", ru: "Свежий загар (менее 2 недель)", en: "Recent tan (less than 2 weeks)" },
          { uk: "Прийом фотосенсибілізуючих препаратів (ізотретиноїн, тетрацикліни)", ru: "Приём фотосенсибилизирующих препаратов (изотретиноин, тетрациклины)", en: "Use of photosensitising drugs (isotretinoin, tetracyclines)" },
          { uk: "Онкологічні захворювання та схильність до келоїдів", ru: "Онкологические заболевания и склонность к келоидам", en: "Active oncological conditions and keloid tendency" },
          { uk: "Активні запальні захворювання шкіри в зоні обробки", ru: "Активные воспалительные заболевания кожи в зоне обработки", en: "Active skin inflammation in the treatment area" },
          { uk: "Сіре або дуже світле волосся (знижена ефективність)", ru: "Серые или очень светлые волосы (сниженная эффективность)", en: "Grey or very light hair (reduced efficacy)" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Лазерна епіляція спини за один сеанс на Splendor X займає 30–40 хвилин. Курс з 6–8 сеансів — і спина без волосся назавжди.",
          ru: "Лазерная эпиляция спины за один сеанс на Splendor X занимает 30–40 минут. Курс из 6–8 сеансов — и спина без волос навсегда.",
          en: "Back laser hair removal takes 30–40 minutes per Splendor X session. A course of 6–8 sessions — and a permanently hair-free back.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить чоловіча лазерна епіляція", ru: "Как проходит мужская лазерная эпиляция", en: "How Men's Laser Hair Removal Works" },
        steps: [
          {
            title: { uk: "Консультація та підбір параметрів", ru: "Консультация и подбор параметров", en: "Consultation and parameter selection" },
            body: { uk: "Лікар визначає тип шкіри та волосся, складає план сеансів, розраховує очікуваний результат та ціну.", ru: "Врач определяет тип кожи и волос, составляет план сеансов, рассчитывает ожидаемый результат и цену.", en: "The doctor determines skin and hair type, creates a session plan, and estimates expected results and pricing." },
          },
          {
            title: { uk: "Підготовка (за день-два)", ru: "Подготовка (за день-два)", en: "Preparation (one-two days before)" },
            body: { uk: "Збрити зону гоління (не використовувати воск або шугаринг). Уникати засмаги 2 тижні. Не наносити дезодорант перед процедурою пахв.", ru: "Побрить зону бритья (не использовать воск или шугаринг). Избегать загара 2 недели. Не наносить дезодорант перед процедурой подмышек.", en: "Shave the treatment zone (no waxing or sugaring). Avoid tanning 2 weeks. No deodorant before underarm sessions." },
          },
          {
            title: { uk: "Сеанс", ru: "Сеанс", en: "Session" },
            body: { uk: "Лікар рівномірно проходить по зоні. Для великих зон (спина, груди) — 30–60 хвилин. Для невеликих (пахви, підборіддя) — 10–15 хвилин.", ru: "Врач равномерно проходит по зоне. Для крупных зон (спина, грудь) — 30–60 минут. Для небольших (подмышки, подбородок) — 10–15 минут.", en: "The doctor treats the zone evenly. Large zones (back, chest): 30–60 minutes. Small zones (underarms, chin): 10–15 minutes." },
          },
          {
            title: { uk: "Після сеансу", ru: "После сеанса", en: "After the session" },
            body: { uk: "Уникати прямого сонця та сауни 48 годин. Через 1–2 тижні волосся виходить — можна голитися, але не вощити. Наступний сеанс — через 4–8 тижнів.", ru: "Избегать прямого солнца и сауны 48 часов. Через 1–2 недели волосы выходят — можно бриться, но не воскировать. Следующий сеанс — через 4–8 недель.", en: "Avoid direct sun and sauna for 48 hours. After 1–2 weeks hair sheds — shaving allowed, no waxing. Next session in 4–8 weeks." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги чоловічої лазерної епіляції в GENEVITY", ru: "Преимущества мужской лазерной эпиляции в GENEVITY", en: "Men's Laser Hair Removal Benefits at GENEVITY" },
        items: [
          { uk: "Видаляє навіть щільне та грубе чоловіче волосся завдяки Splendor X BLEND X®", ru: "Удаляет даже плотные и грубые мужские волосы благодаря Splendor X BLEND X®", en: "Removes even dense, coarse male hair with Splendor X BLEND X®" },
          { uk: "Вирішує проблему вростаючого волосся після гоління бороди назавжди", ru: "Решает проблему вросших волос после бритья бороды навсегда", en: "Permanently solves ingrown beard hair after shaving" },
          { uk: "Великі зони (спина, груди) — 30–60 хвилин на сеанс", ru: "Крупные зоны (спина, грудь) — 30–60 минут на сеанс", en: "Large zones (back, chest) — 30–60 minutes per session" },
          { uk: "Безпечно влітку та при засмазі (тип IV–VI за Фіцпатріком)", ru: "Безопасно летом и при загаре (тип IV–VI по Фицпатрику)", en: "Safe in summer and with a tan (Fitzpatrick type IV–VI)" },
          { uk: "⚠ Сіре та дуже світле волосся — знижена ефективність; лікар оцінить очікуваний результат на консультації", ru: "⚠ Серые и очень светлые волосы — сниженная эффективность; врач оценит ожидаемый результат на консультации", en: "⚠ Grey and very light hair — reduced efficacy; the doctor will assess expected results at consultation" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка GENEVITY — комфортні умови", ru: "Клиника GENEVITY — комфортные условия", en: "GENEVITY Clinic — Comfortable Setting" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на чоловічу лазерну епіляцію в Дніпрі", ru: "Запишитесь на мужскую лазерную эпиляцию в Днепре", en: "Book Men's Laser Hair Removal in Dnipro" },
        body: { uk: "Дізнайтеся ціну на чоловічу лазерну епіляцію та підберіть зони на безкоштовній консультації лікаря.", ru: "Узнайте цену на мужскую лазерную эпиляцию и подберите зоны на бесплатной консультации врача.", en: "Find out the men's laser hair removal price and select treatment zones at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи болюча процедура лазерної епіляції для чоловіків?", ru: "Болезненна ли процедура лазерной эпиляции для мужчин?", en: "Is men's laser hair removal painful?" },
        answer: { uk: "Дискомфорт мінімальний завдяки системі охолодження Splendor X. Чоловіки зазвичай описують відчуття як легке пощипування. Найбільш чутливі зони — борода та пахви.", ru: "Дискомфорт минимальный благодаря системе охлаждения Splendor X. Мужчины обычно описывают ощущения как лёгкое пощипывание. Наиболее чувствительные зоны — борода и подмышки.", en: "Discomfort is minimal thanks to Splendor X's cooling system. Men typically describe the sensation as mild stinging. Most sensitive zones: beard and underarms." },
      },
      {
        question: { uk: "Скільки часу триває один сеанс лазерної епіляції?", ru: "Сколько времени длится один сеанс лазерной эпиляции?", en: "How long does one laser hair removal session last?" },
        answer: { uk: "Залежить від зони: пахви — 10–15 хвилин, борода — 20–30 хвилин, спина — 30–45 хвилин, спина + плечі + груди — до 60–90 хвилин.", ru: "Зависит от зоны: подмышки — 10–15 минут, борода — 20–30 минут, спина — 30–45 минут, спина + плечи + грудь — до 60–90 минут.", en: "Depends on zone: underarms — 10–15 minutes, beard — 20–30 minutes, back — 30–45 minutes, back + shoulders + chest — up to 60–90 minutes." },
      },
      {
        question: { uk: "Чи можна засмагати після лазерної епіляції?", ru: "Можно ли загорать после лазерной эпиляции?", en: "Can you tan after laser hair removal?" },
        answer: { uk: "Ні, протягом 2 тижнів після сеансу. Активна інсоляція збільшує ризик пігментації. Splendor X безпечний для засмаглої шкіри — але тільки якщо засмага була до процедури, не після.", ru: "Нет, в течение 2 недель после сеанса. Активная инсоляция увеличивает риск пигментации. Splendor X безопасен для загорелой кожи — но только если загар был до процедуры, не после.", en: "No, for 2 weeks after the session. Active sun exposure increases pigmentation risk. Splendor X is safe for tanned skin — but only if the tan was present before the procedure, not after." },
      },
      {
        question: { uk: "Чи ефективна лазерна епіляція для світлого або сивого волосся?", ru: "Эффективна ли лазерная эпиляция для светлых или седых волос?", en: "Is laser hair removal effective for light or grey hair?" },
        answer: { uk: "Знижена ефективність. Лазер руйнує меланін у волосяному фолікулі, а сиве та дуже світле волосся містить мало меланіну. Лікар оцінить ваш тип волосся на консультації та повідомить про очікуваний результат.", ru: "Эффективность снижена. Лазер разрушает меланин в волосяном фолликуле, а седые и очень светлые волосы содержат мало меланина. Врач оценит ваш тип волос на консультации и сообщит об ожидаемом результате.", en: "Reduced efficacy. The laser destroys melanin in the hair follicle, and grey or very light hair contains little melanin. The doctor will assess your hair type at consultation and advise on expected results." },
      },
      {
        question: { uk: "Які альтернативи лазерній епіляції існують для чоловіків?", ru: "Какие альтернативы лазерной эпиляции существуют для мужчин?", en: "What alternatives to laser hair removal exist for men?" },
        answer: { uk: "Альтернативи — шугаринг, воскова депіляція та електроепіляція. Шугаринг та воск дають тимчасовий результат (2–4 тижні). Електроепіляція дає постійний результат, але займає набагато більше часу та болючіша. Лазерна епіляція — оптимальний баланс між ефективністю, швидкістю та комфортом.", ru: "Альтернативы — шугаринг, восковая депиляция и электроэпиляция. Шугаринг и воск дают временный результат (2–4 недели). Электроэпиляция даёт постоянный результат, но занимает гораздо больше времени и болезненнее. Лазерная эпиляция — оптимальный баланс между эффективностью, скоростью и комфортом.", en: "Alternatives: sugaring, wax and electrolysis. Sugaring and wax give temporary results (2–4 weeks). Electrolysis gives permanent results but takes much longer and is more painful. Laser hair removal offers the optimal balance of efficacy, speed and comfort." },
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
  console.log("\nTZ-v6 intimate+laser DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
