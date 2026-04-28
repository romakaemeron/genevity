import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

type L = { uk: string; ru: string; en: string };

type AnySection =
  | { type: "richText"; heading: L; body: L; calloutBody?: L; heroImage?: string | null }
  | { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] }
  | { type: "callout"; tone: "info" | "warning" | "success"; body: L }
  | { type: "steps"; heading: L; steps: { title: L; description: L }[] }
  | { type: "bullets"; heading: L; items: L[] }
  | { type: "imageGallery"; heading: L; images: { url: string; alt: string }[] }
  | { type: "cta"; heading: L; body: L; ctaLabel: L; ctaHref: string };

function sectionData(s: AnySection): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: s.heroImage ?? null };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "callout") return { tone: s.tone, body: s.body };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  if (s.type === "imageGallery") return { heading: s.heading, images: s.images };
  if (s.type === "cta") return { heading: s.heading, body: s.body, ctaLabel: s.ctaLabel, ctaHref: s.ctaHref };
  return {};
}

const interiorImages = [
  { url: "/images/interior/SEMI1276-HDR.webp", alt: "Кабінет косметолога GENEVITY" },
  { url: "/images/interior/SEMI1662-HDR.webp", alt: "Клініка GENEVITY" },
  { url: "/images/interior/SEMI7509.webp", alt: "Процедурний кабінет GENEVITY" },
];

interface ServiceSeed { slug: string; summary: L; sections: AnySection[]; faqs: { question: L; answer: L }[] }

const services: ServiceSeed[] = [
  // ─── ЕКЗОСОМИ ────────────────────────────────────────────────────────────
  {
    slug: "exosomes",
    summary: {
      uk: "Екзосомальна терапія в GENEVITY — ін'єкції екзосом для глибокого відновлення шкіри, лікування акне та постакне. Найсучасніший метод регенеративної косметології в Дніпрі.",
      ru: "Экзосомальная терапия в GENEVITY — инъекции экзосом для глубокого восстановления кожи, лечения акне и постакне. Самый современный метод регенеративной косметологии в Днепре.",
      en: "Exosome therapy at GENEVITY — exosome injections for deep skin restoration, acne and post-acne treatment. The most advanced regenerative cosmetology method in Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Екзосоми для обличчя — регенеративна терапія нового покоління", ru: "Экзосомы для лица — регенеративная терапия нового поколения", en: "Facial Exosomes — Next-Generation Regenerative Therapy" },
        body: {
          uk: "Екзосоми — це наноскопічні позаклітинні везикули (30–150 нм), що виробляються клітинами організму і слугують природними носіями інформації між клітинами. Вони містять мікроРНК, фактори росту, сигнальні білки та ліпіди, які активують процеси відновлення в клітинах-реципієнтах. Застосування екзосом у косметології — це якісно новий рівень регенеративної терапії, що перевершує PRP за концентрацією біоактивних молекул.\n\nЕфекти екзосомальної терапії для обличчя: відновлення пошкоджених тканин, зменшення запалення, стимуляція синтезу колагену та еластину, корекція пігментації, а також ефективне лікування акне через регуляцію сального залозистого апарату. Екзосоми проникають у глибокі шари дерми і перепрограмують фібробласти на активний синтез позаклітинного матриксу.\n\nЯк проходить процедура введення екзосом: на підготовчому етапі лікар оцінює стан шкіри і призначає кількість сеансів. Підготовка до процедури: відмовтеся від ретиноїдів за 5 днів, не засмагайте 2 тижні. Препарат вводиться мікроін'єкціями або в поєднанні з мікроголковою терапією (дермаролер, дермапен). Рекомендації після процедури: 24–48 годин уникайте прямого сонця, фізичного навантаження і алкоголю.\n\nПорівняння екзосомальної терапії з іншими методами омолодження: на відміну від PRP, екзосоми діють на клітинному рівні через молекулярні сигнали, забезпечуючи більш тривалий і глибший ефект відновлення. На відміну від філерів — не заповнюють, а відновлюють. Можливі побічні ефекти та ризики: мінімальні, оскільки препарати проходять жорсткий контроль якості. Можлива помірна гіперемія та набряклість протягом 24–48 годин.",
          ru: "Экзосомы — это наноскопические внеклеточные везикулы (30–150 нм), вырабатываемые клетками организма и служащие естественными носителями информации между клетками. Они содержат микроРНК, факторы роста, сигнальные белки и липиды, которые активируют процессы восстановления в клетках-реципиентах. Применение экзосом в косметологии — это качественно новый уровень регенеративной терапии, превосходящей PRP по концентрации биоактивных молекул.\n\nЭффекты экзосомальной терапии для лица: восстановление повреждённых тканей, уменьшение воспаления, стимуляция синтеза коллагена и эластина, коррекция пигментации, а также эффективное лечение акне. Экзосомы проникают в глубокие слои дермы и перепрограммируют фибробласты на активный синтез внеклеточного матрикса.\n\nКак проходит процедура введения экзосом: подготовка — откажитесь от ретиноидов за 5 дней, не загорайте 2 недели. Препарат вводится микроинъекциями или в сочетании с микроигольной терапией. Рекомендации после процедуры: 24–48 часов избегайте прямого солнца, физической нагрузки и алкоголя.",
          en: "Exosomes are nanoscopic extracellular vesicles (30–150 nm) produced by body cells that serve as natural information carriers between cells. They contain microRNA, growth factors, signalling proteins, and lipids that activate restoration processes in recipient cells. Exosome use in cosmetology represents a qualitatively new level of regenerative therapy, surpassing PRP in bioactive molecule concentration.\n\nExosomal therapy effects for the face: restoration of damaged tissue, reduction of inflammation, stimulation of collagen and elastin synthesis, pigmentation correction, and effective acne treatment through regulation of the sebaceous glandular apparatus. Exosomes penetrate deep into the dermis and reprogramme fibroblasts for active extracellular matrix synthesis.\n\nProcedure: preparation — discontinue retinoids 5 days before, avoid tanning 2 weeks prior. The product is delivered via micro-injections or combined with microneedling therapy. Post-procedure: avoid direct sun, exercise, and alcohol for 24–48 hours.",
        },
        calloutBody: {
          uk: "Екзосомальна терапія — клінічно доведена альтернатива PRP з більш тривалим регенеративним ефектом.",
          ru: "Экзосомальная терапия — клинически доказанная альтернатива PRP с более длительным регенеративным эффектом.",
          en: "Exosome therapy is a clinically proven PRP alternative with a longer-lasting regenerative effect.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до екзосомальної терапії", ru: "Показания к экзосомальной терапии", en: "Indications for Exosome Therapy" },
        indications: [
          { uk: "Втрата тонусу, пружності та природного сяяння шкіри", ru: "Потеря тонуса, упругости и естественного сияния кожи", en: "Loss of skin tone, firmness, and natural radiance" },
          { uk: "Активне акне та постзапальна пігментація (постакне)", ru: "Активное акне и постовоспалительная пигментация (постакне)", en: "Active acne and post-inflammatory pigmentation (post-acne)" },
          { uk: "Рубці, нерівна текстура шкіри після дерматологічних захворювань", ru: "Рубцы, неровная текстура кожи после дерматологических заболеваний", en: "Scars and uneven skin texture after dermatological conditions" },
          { uk: "Реабілітація після агресивних лазерних процедур і пілінгів", ru: "Реабилитация после агрессивных лазерных процедур и пилингов", en: "Recovery after aggressive laser procedures and peels" },
          { uk: "Комбінована вікова шкіра з пігментацією та зморшками", ru: "Комбинированная возрастная кожа с пигментацией и морщинами", en: "Combination ageing skin with pigmentation and wrinkles" },
          { uk: "Хронічне запалення шкіри (розацеа, купероз)", ru: "Хроническое воспаление кожи (розацеа, купероз)", en: "Chronic skin inflammation (rosacea, couperosis)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні інфекції в зоні введення (герпес, бактеріальний фолікуліт)", ru: "⚠ Активные инфекции в зоне введения (герпес, бактериальный фолликулит)", en: "⚠ Active infections at the injection site (herpes, bacterial folliculitis)" },
          { uk: "⚠ Онкологічні захворювання та імунодефіцитні стани", ru: "⚠ Онкологические заболевания и иммунодефицитные состояния", en: "⚠ Malignancies and immunodeficiency conditions" },
          { uk: "⚠ Алергія на компоненти препарату", ru: "⚠ Аллергия на компоненты препарата", en: "⚠ Allergy to product components" },
          { uk: "⚠ Прийом імуносупресантів та системних кортикостероїдів", ru: "⚠ Приём иммуносупрессантов и системных кортикостероидов", en: "⚠ Use of immunosuppressants and systemic corticosteroids" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Екзосомальна терапія підходить для всіх типів шкіри, включно з чутливою та схильною до почервоніння. Вона не містить клітин і не ризикує реакцією відторгнення.",
          ru: "Экзосомальная терапия подходит для всех типов кожи, включая чувствительную и склонную к покраснению. Она не содержит клеток и не несёт риска реакции отторжения.",
          en: "Exosome therapy is suitable for all skin types, including sensitive and redness-prone. It contains no cells and carries no rejection risk.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Етапи проведення екзосомальної терапії", ru: "Этапы проведения экзосомальной терапии", en: "Exosome Therapy Procedure Steps" },
        steps: [
          { title: { uk: "Консультація та діагностика", ru: "Консультация и диагностика", en: "Consultation and diagnosis" }, description: { uk: "Лікар оцінює тип і стан шкіри, визначає цілі терапії і підбирає концентрацію препарату. Обговорюються очікування та кількість сеансів.", ru: "Врач оценивает тип и состояние кожи, определяет цели терапии и подбирает концентрацию препарата.", en: "The doctor assesses skin type and condition, determines therapy goals, and selects the product concentration." } },
          { title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" }, description: { uk: "Шкіра очищується і знежирюється. Наноситься аплікаційна анестезія за 30 хвилин до початку. За 5 днів до процедури потрібно відмінити ретиноїди.", ru: "Кожа очищается и обезжиривается. Наносится аппликационная анестезия за 30 минут. За 5 дней до процедуры отменяются ретиноиды.", en: "Skin is cleansed and degreased. Topical anaesthesia is applied 30 minutes before. Retinoids should be discontinued 5 days prior." } },
          { title: { uk: "Введення екзосом", ru: "Введение экзосом", en: "Exosome injection" }, description: { uk: "Препарат вводиться мікроін'єкціями або в поєднанні з мікроголковою терапією (дермапен). Це підвищує глибину проникнення та ефективність. Тривалість — 30–45 хвилин.", ru: "Препарат вводится микроинъекциями или в сочетании с микроигольной терапией. Продолжительность — 30–45 минут.", en: "The product is delivered via micro-injections or combined with microneedling. Duration: 30–45 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "48 годин уникайте прямого сонця, алкоголю і фізичного навантаження. Наносьте SPF 50+ щодня. Наступний сеанс — через 3–4 тижні.", ru: "48 часов избегайте прямого солнца, алкоголя и физической нагрузки. Наносите SPF 50+ ежедневно. Следующий сеанс — через 3–4 недели.", en: "Avoid direct sun, alcohol, and exercise for 48 hours. Apply SPF 50+ daily. Next session in 3–4 weeks." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та можливі ризики екзосомальної терапії", ru: "Преимущества и возможные риски экзосомальной терапии", en: "Benefits and Possible Risks of Exosome Therapy" },
        items: [
          { uk: "Регенерація на клітинному рівні — відновлює шкіру глибше, ніж будь-яке зволоження", ru: "Регенерация на клеточном уровне — восстанавливает кожу глубже, чем любое увлажнение", en: "Cellular-level regeneration — restores skin deeper than any hydration" },
          { uk: "Ефективне лікування акне та постакне без гормональних препаратів", ru: "Эффективное лечение акне и постакне без гормональных препаратов", en: "Effective acne and post-acne treatment without hormonal drugs" },
          { uk: "Підходить для чутливої шкіри та схильної до почервоніння (розацеа)", ru: "Подходит для чувствительной кожи и склонной к покраснению (розацеа)", en: "Suitable for sensitive and redness-prone skin (rosacea)" },
          { uk: "Не містить клітин — нульовий ризик відторгнення та алергії", ru: "Не содержит клеток — нулевой риск отторжения и аллергии", en: "Cell-free — zero rejection and allergy risk" },
          { uk: "⚠ Ефект поступовий — видимий результат зазвичай після 2–3-го сеансу", ru: "⚠ Эффект постепенный — видимый результат обычно после 2–3-го сеанса", en: "⚠ Gradual effect — visible results usually after the 2nd–3rd session" },
          { uk: "⚠ Препарат потребує правильного зберігання — уточнюйте умови у лікаря до процедури", ru: "⚠ Препарат требует правильного хранения — уточняйте условия у врача до процедуры", en: "⚠ The product requires proper storage — verify conditions with the doctor before the procedure" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка GENEVITY — де проводиться процедура", ru: "Клиника GENEVITY — где проводится процедура", en: "GENEVITY Clinic — Where the Procedure Takes Place" },
        images: interiorImages,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на екзосомальну терапію в Дніпрі", ru: "Запишитесь на экзосомальную терапию в Днепре", en: "Book Exosome Therapy in Dnipro" },
        body: { uk: "Лікар оцінить стан вашої шкіри та підбере оптимальну програму. Перша консультація — безкоштовно.", ru: "Врач оценит состояние вашей кожи и подберёт оптимальную программу. Первая консультация — бесплатно.", en: "The doctor will assess your skin and select an optimal programme. First consultation is free." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      { question: { uk: "Чи безпечна екзосомальна терапія для всіх типів шкіри?", ru: "Безопасна ли экзосомальная терапия для всех типов кожи?", en: "Is exosome therapy safe for all skin types?" }, answer: { uk: "Так. Екзосомальна терапія не містить живих клітин, тому ризик алергічної реакції або відторгнення мінімальний. Вона підходить для чутливої шкіри, схильної до почервоніння, а також для шкіри з розацеа або куперозом. Перед процедурою лікар проводить patch-тест для пацієнтів з відомою схильністю до алергій.", ru: "Да. Экзосомальная терапия не содержит живых клеток, поэтому риск аллергической реакции или отторжения минимален. Она подходит для чувствительной кожи, склонной к покраснению, а также при розацеа или куперозе.", en: "Yes. Exosome therapy contains no living cells, so the risk of allergic reaction or rejection is minimal. It is suitable for sensitive and redness-prone skin, including rosacea and couperosis." } },
      { question: { uk: "Скільки процедур екзосомальної терапії необхідно для досягнення видимого результату?", ru: "Сколько процедур экзосомальной терапии необходимо для достижения видимого результата?", en: "How many exosome therapy sessions are needed for visible results?" }, answer: { uk: "Видимий результат зазвичай з'являється після 2–3-го сеансу. Стандартний курс — 3–4 процедури з інтервалом 3–4 тижні. Ефект зберігається 6–12 місяців після завершення курсу. Для лікування акне та постакне курс може складати 4–6 процедур.", ru: "Видимый результат обычно появляется после 2–3-го сеанса. Стандартный курс — 3–4 процедуры с интервалом 3–4 недели. Эффект сохраняется 6–12 месяцев после завершения курса.", en: "Visible results typically appear after the 2nd–3rd session. Standard course: 3–4 sessions at 3–4 week intervals. Results last 6–12 months after completing the course." } },
      { question: { uk: "Чи можна поєднувати екзосомальну терапію з іншими косметологічними процедурами?", ru: "Можно ли сочетать экзосомальную терапию с другими косметологическими процедурами?", en: "Can exosome therapy be combined with other cosmetic procedures?" }, answer: { uk: "Так, екзосоми особливо ефективні в поєднанні з мікронідлінгом (дермапен), лазерними процедурами та RF-ліфтингом як частина реабілітаційного протоколу. З ін'єкційними процедурами (ботокс, філери) — через 2 тижні. Лікар підбере оптимальне поєднання.", ru: "Да, экзосомы особенно эффективны в сочетании с микронидлингом, лазерными процедурами и RF-лифтингом как часть реабилитационного протокола.", en: "Yes, exosomes are particularly effective combined with microneedling, laser procedures, and RF lifting as part of a rehabilitation protocol. With injectable procedures (botox, fillers) — after 2 weeks." } },
      { question: { uk: "Який період реабілітації після введення екзосом?", ru: "Какой период реабилитации после введения экзосом?", en: "What is the recovery period after exosome injections?" }, answer: { uk: "Реабілітація після екзосомальної терапії мінімальна. Протягом 24–48 годин може спостерігатися легка гіперемія та набряклість — вони проходять самостійно. Уникайте прямого сонця, алкоголю і фізичного навантаження 48 годин. Більшість пацієнтів повертаються до роботи наступного дня.", ru: "Реабилитация минимальна. В течение 24–48 часов может наблюдаться лёгкая гиперемия — она проходит самостоятельно. Избегайте прямого солнца 48 часов.", en: "Recovery is minimal. Mild redness and swelling for 24–48 hours resolve on their own. Avoid direct sun, alcohol, and exercise for 48 hours. Most patients return to work the next day." } },
      { question: { uk: "Чи підходить екзосомальна терапія для лікування акне?", ru: "Подходит ли экзосомальная терапия для лечения акне?", en: "Is exosome therapy suitable for treating acne?" }, answer: { uk: "Так. Екзосоми ефективно зменшують запалення, регулюють роботу сальних залоз і прискорюють загоєння після акне. Для лікування активного акне зазвичай потрібен курс 4–6 процедур. Екзосоми також ефективно усувають постзапальну пігментацію та нерівності шкіри після акне.", ru: "Да. Экзосомы эффективно уменьшают воспаление, регулируют работу сальных желёз и ускоряют заживление. Для лечения активного акне — курс 4–6 процедур.", en: "Yes. Exosomes effectively reduce inflammation, regulate sebaceous glands, and accelerate post-acne healing. For active acne treatment, a course of 4–6 sessions is typically needed." } },
    ],
  },

  // ─── СТОВБУРОВІ КЛІТИНИ ──────────────────────────────────────────────────
  {
    slug: "stem-cell-therapy",
    summary: {
      uk: "Омолодження стовбуровими клітинами в GENEVITY — введення мезенхімальних стовбурових клітин для глибокого відновлення шкіри, корекції рубців та загального омолодження. Дніпро.",
      ru: "Омоложение стволовыми клетками в GENEVITY — введение мезенхимальных стволовых клеток для глубокого восстановления кожи, коррекции рубцов и общего омоложения. Днепр.",
      en: "Stem cell rejuvenation at GENEVITY — mesenchymal stem cell injections for deep skin restoration, scar correction, and comprehensive rejuvenation. Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Омолодження стовбуровими клітинами — найглибший рівень відновлення", ru: "Омоложение стволовыми клетками — самый глубокий уровень восстановления", en: "Stem Cell Rejuvenation — The Deepest Level of Restoration" },
        body: {
          uk: "Омолодження стовбуровими клітинами — це ін'єкційна процедура з використанням мезенхімальних стовбурових клітин (МСК), які є попередниками фібробластів і мають унікальну здатність до диференціювання та секреції паракринних факторів. МСК виробляють широкий спектр цитокінів, факторів росту та екзосом, що запускають регенеративні каскади в тканинах.\n\nПереваги процедури омолодження стовбуровими клітинами: відновлення архітектури позаклітинного матриксу, стимуляція неоколагеногенезу та вироблення власної гіалуронової кислоти, зменшення глибоких зморшок та рубців, а також системний омолоджуючий ефект — покращення якості та кольору шкіри по всій ділянці введення.\n\nЯк проходить процедура: на підготовчому етапі проводиться забір або підготовка аутологічного матеріалу (власних клітин) або використовуються алогенні клітини від сертифікованого банку донорів. Введення здійснюється шляхом мікроін'єкцій або інфузії в зону відновлення. Відновлення після процедури: 48–72 год уникайте фізичного навантаження, прямого сонця і алкоголю.\n\nМожливі ризики та побічні ефекти: при використанні власних клітин ризики мінімальні. При алогенних клітинах можлива локальна запальна реакція, що минає самостійно. Всі процедури проводяться в стерильних умовах медичного класу. Частота проведення: не частіше 1 разу на 6–12 місяців для оптимального ефекту.",
          ru: "Омоложение стволовыми клетками — это инъекционная процедура с использованием мезенхимальных стволовых клеток (МСК), которые являются предшественниками фибробластов и обладают уникальной способностью к дифференцировке и секреции паракринных факторов. МСК производят широкий спектр цитокинов, факторов роста и экзосом, запускающих регенеративные каскады в тканях.\n\nПреимущества процедуры: восстановление архитектуры внеклеточного матрикса, стимуляция неоколлагеногенеза и выработки собственной гиалуроновой кислоты, уменьшение глубоких морщин и рубцов.\n\nКак проходит процедура: подготовка — аутологичный или аллогенный материал от сертифицированного банка доноров. Введение — микроинъекции или инфузия. Восстановление: 48–72 ч избегайте нагрузок и прямого солнца.",
          en: "Stem cell rejuvenation is an injectable procedure using mesenchymal stem cells (MSCs), which are fibroblast precursors with a unique ability to differentiate and secrete paracrine factors. MSCs produce a wide spectrum of cytokines, growth factors, and exosomes that trigger regenerative cascades in tissues.\n\nBenefits: restoration of extracellular matrix architecture, stimulation of neocollagenogenesis and endogenous hyaluronic acid production, reduction of deep wrinkles and scars, and systemic rejuvenation of skin quality and tone.\n\nProcedure: preparation — autologous or allogeneic material from a certified donor bank. Injection via micro-injections or infusion. Recovery: 48–72 hours avoid exercise, direct sun, and alcohol.",
        },
        calloutBody: {
          uk: "Стовбурові клітини не просто зволожують — вони відновлюють шкіру на рівні архітектури тканин, формуючи нову колагенову сітку.",
          ru: "Стволовые клетки не просто увлажняют — они восстанавливают кожу на уровне архитектуры тканей, формируя новую коллагеновую сеть.",
          en: "Stem cells do not simply hydrate — they restore skin at the tissue architecture level, forming a new collagen network.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до омолодження стовбуровими клітинами", ru: "Показания к омоложению стволовыми клетками", en: "Indications for Stem Cell Rejuvenation" },
        indications: [
          { uk: "Глибокі зморшки та значна втрата об'єму тканин обличчя", ru: "Глубокие морщины и значительная потеря объёма тканей лица", en: "Deep wrinkles and significant facial tissue volume loss" },
          { uk: "Рубці, у тому числі постакне та атрофічні рубці", ru: "Рубцы, в том числе постакне и атрофические рубцы", en: "Scars, including post-acne and atrophic scars" },
          { uk: "Загальне омолодження шкіри 40+ при вираженому фотостарінні", ru: "Общее омоложение кожи 40+ при выраженном фотостарении", en: "Comprehensive skin rejuvenation 40+ with pronounced photoageing" },
          { uk: "Відновлення після хімічних опіків або серйозних дерматологічних захворювань", ru: "Восстановление после химических ожогов или серьёзных дерматологических заболеваний", en: "Recovery after chemical burns or serious dermatological conditions" },
          { uk: "Волосся, що випадає, — трихологічне застосування МСК", ru: "Выпадение волос — трихологическое применение МСК", en: "Hair loss — trichological MSC application" },
        ],
        contraindicationsHeading: { uk: "Протипоказання та обмеження", ru: "Противопоказания и ограничения", en: "Contraindications and Restrictions" },
        contraindications: [
          { uk: "⚠ Онкологічні захворювання та передракові стани (абсолютне протипоказання)", ru: "⚠ Онкологические заболевания и предраковые состояния (абсолютное противопоказание)", en: "⚠ Malignancies and precancerous conditions (absolute contraindication)" },
          { uk: "⚠ Аутоімунні захворювання у фазі загострення", ru: "⚠ Аутоиммунные заболевания в фазе обострения", en: "⚠ Autoimmune diseases in the acute phase" },
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні інфекційні захворювання та гарячка", ru: "⚠ Активные инфекционные заболевания и лихорадка", en: "⚠ Active infectious diseases and fever" },
          { uk: "⚠ Психічні розлади, що унеможливлюють усвідомлену згоду", ru: "⚠ Психические расстройства, препятствующие осознанному согласию", en: "⚠ Mental disorders preventing informed consent" },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: {
          uk: "Процедура проводиться виключно в медичному центрі з ліцензією на клітинну терапію. Перед призначенням — повне обстеження та виключення протипоказань.",
          ru: "Процедура проводится исключительно в медицинском центре с лицензией на клеточную терапию. Перед назначением — полное обследование и исключение противопоказаний.",
          en: "The procedure is performed exclusively at a medical centre licensed for cell therapy. A full examination and contraindication screening is required before prescription.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура омолодження стовбуровими клітинами", ru: "Как проходит процедура омоложения стволовыми клетками", en: "How the Stem Cell Rejuvenation Procedure Works" },
        steps: [
          { title: { uk: "Первинна консультація та обстеження", ru: "Первичная консультация и обследование", en: "Initial consultation and examination" }, description: { uk: "Лікар збирає детальний анамнез, призначає аналізи крові та виключає протипоказання. Обговорюється тип клітинного матеріалу.", ru: "Врач собирает анамнез, назначает анализы крови и исключает противопоказания. Обсуждается тип клеточного материала.", en: "The doctor takes a detailed medical history, orders blood tests, and rules out contraindications. The type of cellular material is discussed." } },
          { title: { uk: "Підготовка матеріалу", ru: "Подготовка материала", en: "Material preparation" }, description: { uk: "Аутологічні клітини отримують з жирової тканини пацієнта або кісткового мозку. Алогенні клітини надходять із сертифікованого кріобанку.", ru: "Аутологичные клетки получают из жировой ткани или костного мозга пациента. Аллогенные клетки поступают из сертифицированного криобанка.", en: "Autologous cells are obtained from the patient's adipose tissue or bone marrow. Allogeneic cells come from a certified cryobank." } },
          { title: { uk: "Введення клітин", ru: "Введение клеток", en: "Cell injection" }, description: { uk: "Матеріал вводиться мікроін'єкціями в зону відновлення під місцевою анестезією. Тривалість — 30–60 хвилин.", ru: "Материал вводится микроинъекциями в зону восстановления под местной анестезией. Продолжительность — 30–60 минут.", en: "Material is injected via micro-injections into the restoration zone under local anaesthesia. Duration: 30–60 minutes." } },
          { title: { uk: "Відновлення та спостереження", ru: "Восстановление и наблюдение", en: "Recovery and follow-up" }, description: { uk: "48–72 год уникайте фізичного навантаження і прямого сонця. Контрольний огляд через 4 тижні — оцінка результату та планування підтримуючих процедур.", ru: "48–72 ч избегайте нагрузок и прямого солнца. Контрольный осмотр через 4 недели.", en: "Avoid exercise and direct sun for 48–72 hours. Follow-up check at 4 weeks to assess results." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та важливі аспекти клітинної терапії", ru: "Преимущества и важные аспекты клеточной терапии", en: "Benefits and Key Aspects of Cell Therapy" },
        items: [
          { uk: "Відновлення тканин на рівні архітектурної організації — ефект глибший за будь-яку ін'єкційну косметологію", ru: "Восстановление тканей на уровне архитектурной организации — эффект глубже, чем у любой инъекционной косметологии", en: "Tissue restoration at the architectural level — deeper effect than any injectable cosmetic procedure" },
          { uk: "Тривалий ефект — результат зберігається 12–24 місяці та більше", ru: "Длительный эффект — результат сохраняется 12–24 месяца и более", en: "Long-lasting effect — results maintained for 12–24 months or longer" },
          { uk: "Мультизональна дія: обличчя, шия, кисті рук, шкіра голови", ru: "Мультизональное действие: лицо, шея, кисти рук, кожа головы", en: "Multi-zone action: face, neck, hands, scalp" },
          { uk: "⚠ Процедура потребує детального попереднього обстеження — не підходить для швидкого «ефекту краси»", ru: "⚠ Процедура требует детального предварительного обследования — не подходит для быстрого «эффекта красоты»", en: "⚠ Requires thorough pre-treatment examination — not suitable for a quick beauty fix" },
          { uk: "⚠ Онкологічні захворювання є абсолютним протипоказанням — самостійне призначення неприпустиме", ru: "⚠ Онкологические заболевания — абсолютное противопоказание — самостоятельное назначение недопустимо", en: "⚠ Malignancy is an absolute contraindication — self-prescription is unacceptable" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "GENEVITY — медичний простір для регенеративних процедур", ru: "GENEVITY — медицинское пространство для регенеративных процедур", en: "GENEVITY — Medical Space for Regenerative Procedures" },
        images: interiorImages,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на консультацію щодо клітинної терапії", ru: "Запишитесь на консультацию по клеточной терапии", en: "Book a Cell Therapy Consultation" },
        body: { uk: "Лікар проведе детальне обстеження та пояснить, чи підходить вам ця процедура. Безпека — насамперед.", ru: "Врач проведёт детальное обследование и объяснит, подходит ли вам эта процедура. Безопасность — прежде всего.", en: "The doctor will conduct a thorough examination and explain whether this procedure is right for you. Safety comes first." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      { question: { uk: "Які результати можна очікувати після омолодження стовбуровими клітинами?", ru: "Какие результаты можно ожидать после омоложения стволовыми клетками?", en: "What results can be expected from stem cell rejuvenation?" }, answer: { uk: "Очікувані результати: значне покращення якості та щільності шкіри, зменшення глибоких зморшок та рубців, підвищення пружності та природного сяяння. При трихологічному застосуванні — зменшення випадіння і ущільнення волосся. Результати розвиваються поступово протягом 1–3 місяців після процедури.", ru: "Ожидаемые результаты: значительное улучшение качества и плотности кожи, уменьшение глубоких морщин и рубцов, повышение упругости. При трихологическом применении — уменьшение выпадения и уплотнение волос.", en: "Expected results: significant improvement in skin quality and density, reduction of deep wrinkles and scars, increased firmness. For trichological use — reduced hair loss and thicker hair. Results develop gradually over 1–3 months." } },
      { question: { uk: "Скільки триває ефект від процедури?", ru: "Сколько длится эффект от процедуры?", en: "How long does the effect last?" }, answer: { uk: "Ефект від процедури омолодження стовбуровими клітинами зберігається 12–24 місяці і довше — залежно від кількості введеного матеріалу, індивідуальних особливостей пацієнта та способу життя. Одна підтримуюча процедура на рік дозволяє підтримувати результат тривало.", ru: "Эффект сохраняется 12–24 месяца и дольше — в зависимости от количества введённого материала и образа жизни пациента.", en: "The effect lasts 12–24 months or longer, depending on the amount of material injected and the patient's lifestyle." } },
      { question: { uk: "Чи безпечне омолодження стовбуровими клітинами?", ru: "Безопасно ли омоложение стволовыми клетками?", en: "Is stem cell rejuvenation safe?" }, answer: { uk: "При дотриманні протоколу та відсутності протипоказань — так. Аутологічні (власні) клітини є найбезпечнішим варіантом. Алогенні клітини від сертифікованих банків проходять ретельне тестування на інфекції та генетичні аномалії. Найважливіше — проводити процедуру лише після повного медичного обстеження.", ru: "При соблюдении протокола и отсутствии противопоказаний — да. Аутологичные клетки наиболее безопасны. Аллогенные клетки из сертифицированных банков проходят тщательное тестирование.", en: "With proper protocol and no contraindications — yes. Autologous (own) cells are the safest option. Allogeneic cells from certified banks undergo rigorous testing for infections and genetic abnormalities." } },
      { question: { uk: "Чи можна поєднувати цю процедуру з іншими методами омолодження?", ru: "Можно ли сочетать эту процедуру с другими методами омоложения?", en: "Can this procedure be combined with other rejuvenation methods?" }, answer: { uk: "Так, але з обережністю. Стовбурові клітини можна поєднувати з мезотерапією та PRP в рамках одного протоколу. З апаратними та лазерними методами — інтервал не менше 4–6 тижнів. Комплексний план складається лікарем після оцінки стану пацієнта.", ru: "Да, но с осторожностью. Стволовые клетки можно сочетать с мезотерапией и PRP. С аппаратными и лазерными методами — интервал не менее 4–6 недель.", en: "Yes, but cautiously. Stem cells can be combined with mesotherapy and PRP within one protocol. With device-based and laser methods — minimum 4–6 week interval." } },
      { question: { uk: "Як часто можна проводити омолодження стовбуровими клітинами?", ru: "Как часто можно проводить омоложение стволовыми клетками?", en: "How often can stem cell rejuvenation be performed?" }, answer: { uk: "Рекомендована частота — не більше 1 разу на 6–12 місяців. Це пов'язано з тривалістю дозрівання ефекту та необхідністю оцінки результату перед наступним введенням. Занадто часті процедури не дають додаткового ефекту і можуть порушити природний баланс тканин.", ru: "Рекомендованная частота — не более 1 раза в 6–12 месяцев. Это связано с длительностью созревания эффекта и необходимостью оценки результата.", en: "Recommended frequency — no more than once every 6–12 months. This is due to the maturation time of the effect and the need to assess results before the next injection." } },
    ],
  },

  // ─── REJURAN ─────────────────────────────────────────────────────────────
  {
    slug: "rejuran",
    summary: {
      uk: "Rejuran в GENEVITY — ін'єкції полінуклеотидів (PDRN) для відновлення шкіри, корекції рубців і глибокого омолодження. Ціна процедури Rejuran в Дніпрі.",
      ru: "Rejuran в GENEVITY — инъекции полинуклеотидов (PDRN) для восстановления кожи, коррекции рубцов и глубокого омоложения. Цена процедуры Rejuran в Днепре.",
      en: "Rejuran at GENEVITY — polynucleotide (PDRN) injections for skin restoration, scar correction, and deep rejuvenation. Rejuran procedure price in Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Rejuran — ін'єкції PDRN для відновлення та омолодження шкіри", ru: "Rejuran — инъекции PDRN для восстановления и омоложения кожи", en: "Rejuran — PDRN Injections for Skin Restoration and Rejuvenation" },
        body: {
          uk: "Rejuran — препарат на основі полінуклеотидів (PDRN — Polydeoxyribonucleotide), отриманих із ДНК лосося. Полінуклеотиди є фрагментами ДНК, що взаємодіють з рецепторами A2A на клітинних мембранах і активують синтез нових колагенових волокон, відновлення пошкоджень ДНК у клітинах шкіри та посилення мікроциркуляції.\n\nПереваги ін'єкцій Rejuran: препарат є біосумісним і безпечним, оскільки молекули PDRN не мають видових відмінностей і не викликають імунної реакції. Ін'єкції Rejuran ефективні для: відновлення тонкої та зневодненої шкіри, корекції атрофічних рубців та постакне, лікування периорбітальних зморшок та тонкої шкіри навколо очей, загального омолодження зі стійким результатом.\n\nВиди препаратів Rejuran та їх особливості: Rejuran HB — для зон з підвищеними механічними навантаженнями (губи, навколо очей); Rejuran I (Rejuran Healer) — для відновлення тонкої та чутливої шкіри; Rejuran S — для корекції рубців. Лікар підбирає тип препарату залежно від цілей процедури.\n\nПоказання та протипоказання до процедури Rejuran обговорюються на консультації. Можливі побічні ефекти та ускладнення після ін'єкцій Rejuran: дрібні папули, що зникають за 24–72 год; рідко — гематоми та локальна реакція. Реджуран добре переноситься навіть пацієнтами з чутливою шкірою.",
          ru: "Rejuran — препарат на основе полинуклеотидов (PDRN — Polydeoxyribonucleotide), полученных из ДНК лосося. Полинуклеотиды взаимодействуют с рецепторами A2A на клеточных мембранах и активируют синтез коллагена, восстановление повреждений ДНК и усиление микроциркуляции.\n\nПреимущества Rejuran: биосовместимость, безопасность для чувствительной кожи. Эффективен для: восстановления тонкой и обезвоженной кожи, коррекции атрофических рубцов, лечения периорбитальных морщин, общего омоложения.\n\nВиды препаратов: Rejuran HB — для губ и области вокруг глаз; Rejuran I (Healer) — для тонкой чувствительной кожи; Rejuran S — для рубцов.",
          en: "Rejuran is a polynucleotide (PDRN — Polydeoxyribonucleotide) product derived from salmon DNA. Polynucleotides interact with A2A receptors on cell membranes, activating collagen synthesis, DNA damage repair, and microcirculation enhancement.\n\nRejuran injection benefits: biocompatibility, safety for sensitive skin. Effective for: restoring thin and dehydrated skin, correcting atrophic scars and post-acne, treating periorbital wrinkles and thin under-eye skin, overall rejuvenation with lasting results.\n\nProduct types: Rejuran HB — for lips and around the eyes; Rejuran I (Healer) — for thin sensitive skin; Rejuran S — for scar correction.",
        },
        calloutBody: {
          uk: "Rejuran — натуральний препарат із ДНК лосося. Молекули PDRN ідентичні людській ДНК за будовою, тому повністю біосумісні.",
          ru: "Rejuran — натуральный препарат из ДНК лосося. Молекулы PDRN идентичны человеческой ДНК по строению, поэтому полностью биосовместимы.",
          en: "Rejuran is a natural salmon DNA product. PDRN molecules are structurally identical to human DNA and are therefore fully biocompatible.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до процедури Rejuran", ru: "Показания к процедуре Rejuran", en: "Indications for Rejuran" },
        indications: [
          { uk: "Тонка, суха та зневоднена шкіра з ознаками втоми", ru: "Тонкая, сухая и обезвоженная кожа с признаками усталости", en: "Thin, dry, and dehydrated skin with signs of fatigue" },
          { uk: "Атрофічні рубці, постакне та нерівна текстура шкіри", ru: "Атрофические рубцы, постакне и неровная текстура кожи", en: "Atrophic scars, post-acne, and uneven skin texture" },
          { uk: "Зморшки навколо очей і тонка шкіра периорбітальної зони", ru: "Морщины вокруг глаз и тонкая кожа периорбитальной зоны", en: "Wrinkles around the eyes and thin periorbital skin" },
          { uk: "Реабілітація після лазерних процедур, пілінгів та дерматозів", ru: "Реабилитация после лазерных процедур, пилингов и дерматозов", en: "Recovery after laser procedures, peels, and dermatoses" },
          { uk: "Комплексне омолодження: обличчя, шия, декольте, руки", ru: "Комплексное омоложение: лицо, шея, декольте, руки", en: "Comprehensive rejuvenation: face, neck, décolletage, hands" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Алергія на рибу або морепродукти (препарат отриманий із ДНК лосося)", ru: "⚠ Аллергия на рыбу или морепродукты (препарат получен из ДНК лосося)", en: "⚠ Allergy to fish or seafood (product derived from salmon DNA)" },
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні запальні процеси в зоні введення", ru: "⚠ Активные воспалительные процессы в зоне введения", en: "⚠ Active inflammation at the injection site" },
          { uk: "⚠ Прийом антикоагулянтів та НПЗЗ без консультації лікаря", ru: "⚠ Приём антикоагулянтов и НПВС без консультации врача", en: "⚠ Anticoagulant and NSAID use without medical consultation" },
          { uk: "⚠ Онкологічні захворювання", ru: "⚠ Онкологические заболевания", en: "⚠ Malignancies" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Важливо: якщо у вас алергія на рибу або морепродукти — повідомте лікаря до призначення Rejuran. Препарат отриманий із ДНК лосося і може спричинити реакцію у чутливих пацієнтів.",
          ru: "Важно: если у вас аллергия на рыбу или морепродукты — сообщите врачу до назначения Rejuran. Препарат получен из ДНК лосося и может вызвать реакцию у чувствительных пациентов.",
          en: "Important: if you have a fish or seafood allergy — inform the doctor before Rejuran is prescribed. The product is derived from salmon DNA and may cause a reaction in sensitive patients.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура Rejuran", ru: "Как проходит процедура Rejuran", en: "How the Rejuran Procedure Works" },
        steps: [
          { title: { uk: "Консультація", ru: "Консультация", en: "Consultation" }, description: { uk: "Лікар визначає цілі (відновлення, омолодження, корекція рубців) і підбирає тип препарату (HB, I або S) та схему введення.", ru: "Врач определяет цели и подбирает тип препарата (HB, I или S) и схему введения.", en: "The doctor defines goals (restoration, rejuvenation, scar correction) and selects the product type (HB, I, or S) and injection scheme." } },
          { title: { uk: "Підготовка до процедури", ru: "Подготовка к процедуре", en: "Preparation" }, description: { uk: "Нанесення аплікаційного анестетика на 30–40 хвилин. За 7 днів до процедури не приймайте НПЗЗ та аспірин.", ru: "Нанесение аппликационного анестетика на 30–40 минут. За 7 дней до процедуры не принимайте НПВС и аспирин.", en: "Topical anaesthetic is applied for 30–40 minutes. Avoid NSAIDs and aspirin for 7 days before." } },
          { title: { uk: "Введення препарату", ru: "Введение препарата", en: "Injection" }, description: { uk: "Rejuran вводиться папульною або ретропунктурною технікою мікроін'єкціями в середній шар дерми. Тривалість — 30–45 хвилин.", ru: "Rejuran вводится папульной или ретропунктурной техникой микроинъекциями в средний слой дермы. Продолжительность — 30–45 минут.", en: "Rejuran is injected using the papule or retrograde puncture technique into the mid-dermis. Duration: 30–45 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "24–48 год уникайте макіяжу, алкоголю, сауни та фізичного навантаження. Папули розсмоктуються за 24–72 год. SPF 50+ обов'язковий.", ru: "24–48 ч избегайте макияжа, алкоголя, сауны и физических нагрузок. Папулы рассасываются за 24–72 ч.", en: "Avoid makeup, alcohol, sauna, and exercise for 24–48 hours. Papules resolve in 24–72 hours. SPF 50+ mandatory." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги Rejuran та на що звернути увагу", ru: "Преимущества Rejuran и на что обратить внимание", en: "Rejuran Benefits and What to Watch Out For" },
        items: [
          { uk: "Відновлення шкіри без синтетичних компонентів — тільки природні полінуклеотиди", ru: "Восстановление кожи без синтетических компонентов — только природные полинуклеотиды", en: "Skin restoration without synthetic components — natural polynucleotides only" },
          { uk: "Ефективний для тонкої шкіри навколо очей, де інші ін'єкційні процедури ризиковані", ru: "Эффективен для тонкой кожи вокруг глаз, где другие инъекционные процедуры рискованны", en: "Effective for thin skin around the eyes where other injectable procedures carry risks" },
          { uk: "Стійкий результат: ефект зберігається 6–12 місяців після курсу", ru: "Стойкий результат: эффект сохраняется 6–12 месяцев после курса", en: "Lasting result: effect maintained for 6–12 months after the course" },
          { uk: "⚠ Пацієнтам з алергією на рибу — обов'язково повідомте лікаря перед призначенням", ru: "⚠ Пациентам с аллергией на рыбу — обязательно сообщите врачу перед назначением", en: "⚠ Patients with fish allergy — must inform the doctor before prescription" },
          { uk: "⚠ Папульний ефект після процедури може зберігатися до 3 днів — плануйте відповідно", ru: "⚠ Папульный эффект после процедуры может сохраняться до 3 дней — планируйте соответственно", en: "⚠ Papular effect after procedure may persist for up to 3 days — plan accordingly" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Наш медичний центр", ru: "Наш медицинский центр", en: "Our Medical Centre" },
        images: interiorImages,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на процедуру Rejuran в Дніпрі", ru: "Запишитесь на процедуру Rejuran в Днепре", en: "Book a Rejuran Procedure in Dnipro" },
        body: { uk: "Дізнайтеся ціну процедури Rejuran та підберіть оптимальний тип препарату на безкоштовній консультації.", ru: "Узнайте цену процедуры Rejuran и подберите оптимальный тип препарата на бесплатной консультации.", en: "Find out the Rejuran procedure price and select the optimal product type at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      { question: { uk: "Скільки триває ефект від процедури Rejuran?", ru: "Сколько длится эффект от процедуры Rejuran?", en: "How long do Rejuran results last?" }, answer: { uk: "Ефект після курсу Rejuran (3–4 процедури з інтервалом 3–4 тижні) зберігається 6–12 місяців. Відновлення якості шкіри відбувається поступово — повний результат формується через 4–8 тижнів після останньої процедури. Підтримуюча процедура — 1 раз на рік.", ru: "Эффект после курса Rejuran сохраняется 6–12 месяцев. Полный результат формируется через 4–8 недель после последней процедуры. Поддерживающая процедура — 1 раз в год.", en: "Rejuran results last 6–12 months after a course. Full results form 4–8 weeks after the last session. Maintenance: once a year." } },
      { question: { uk: "Чи можна поєднувати Rejuran з іншими косметологічними процедурами?", ru: "Можно ли сочетать Rejuran с другими косметологическими процедурами?", en: "Can Rejuran be combined with other cosmetic procedures?" }, answer: { uk: "Так. Rejuran добре поєднується з біоревіталізацією, мезотерапією та мікронідлінгом. З ботулотоксином та філерами — в один день або через 2 тижні після. З лазерними процедурами — інтервал 2–4 тижні. Lікар підбирає оптимальний протокол.", ru: "Да. Rejuran хорошо сочетается с биоревитализацией, мезотерапией и микронидлингом. С ботулотоксином и филлерами — в один день или через 2 недели. С лазерными процедурами — интервал 2–4 недели.", en: "Yes. Rejuran combines well with biorevitalisation, mesotherapy, and microneedling. With botulinum toxin and fillers — same day or 2 weeks apart. With laser — 2–4 week interval." } },
      { question: { uk: "Як часто рекомендується проводити процедуру Rejuran?", ru: "Как часто рекомендуется проводить процедуру Rejuran?", en: "How often is Rejuran recommended?" }, answer: { uk: "Початковий курс — 3–4 процедури з інтервалом 3–4 тижні. Після завершення курсу підтримуюча процедура — 1–2 рази на рік. Не рекомендується проводити процедуру частіше, оскільки ефект накопичується поступово і вимагає часу для розвитку.", ru: "Начальный курс — 3–4 процедуры с интервалом 3–4 недели. Поддерживающая процедура — 1–2 раза в год. Более частое проведение не рекомендуется.", en: "Initial course: 3–4 sessions at 3–4 week intervals. Maintenance: 1–2 times per year. More frequent sessions are not recommended as the effect develops gradually." } },
    ],
  },

  // ─── JUVEDERM ─────────────────────────────────────────────────────────────
  {
    slug: "juvederm",
    summary: {
      uk: "Juvederm в GENEVITY — ін'єкції краси для корекції зморшок, збільшення губ і відновлення об'ємів обличчя. Ін'єкції Juvederm у Дніпрі — природний результат від сертифікованого лікаря.",
      ru: "Juvederm в GENEVITY — инъекции красоты для коррекции морщин, увеличения губ и восстановления объёмов лица. Инъекции Juvederm в Днепре — естественный результат от сертифицированного врача.",
      en: "Juvederm at GENEVITY — beauty injections for wrinkle correction, lip augmentation, and facial volume restoration. Juvederm injections in Dnipro — natural results from a certified doctor.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Juvederm — ін'єкції гіалуронової кислоти для корекції та омолодження", ru: "Juvederm — инъекции гиалуроновой кислоты для коррекции и омоложения", en: "Juvederm — Hyaluronic Acid Injections for Correction and Rejuvenation" },
        body: {
          uk: "Juvederm — лінія сертифікованих дермальних філерів на основі стабілізованої гіалуронової кислоти (технологія VYCROSS та HYLACROSS), розроблених Allergan Aesthetics. Препарати лінійки Juvederm вирізняються м'якою консистенцією, тривалою дією та доведеною клінічною безпекою — вони є найбільш дослідженими філерами у світі з понад 20 роками клінічних досліджень.\n\nПереваги ін'єкцій Juvederm: природна інтеграція в тканини, тактильна м'якість, стійкий результат від 6 до 24 місяців залежно від серії та зони введення, а також наявність у складі лідокаїну — знеболювальний комфорт під час процедури.\n\nПроцедура введення філерів Juvederm: на підготовчому етапі лікар аналізує структуру обличчя та підбирає відповідну серію препарату. Juvederm Volite — для поверхневого зволоження; Juvederm Volbella — для губ і тонких зон; Juvederm Voluma — для об'ємних зон (вилиці, підборіддя); Juvederm Vollure — для глибоких складок. Введення виконується голкою або канюлею в залежності від зони.\n\nМожливі побічні ефекти та протипоказання: набряклість, гематоми (зникають за 5–7 днів), рідко — ущільнення або гранульоми. При дотриманні техніки та вибору правильного препарату ускладнення вкрай рідкісні. Рекомендації після процедури: 48 год без сауни, алкоголю, фізичного навантаження та масажу зон введення.",
          ru: "Juvederm — линейка сертифицированных дермальных филлеров на основе стабилизированной гиалуроновой кислоты (технологии VYCROSS и HYLACROSS), разработанных Allergan Aesthetics. Препараты Juvederm отличаются мягкой консистенцией, длительным действием и доказанной клинической безопасностью.\n\nПреимущества: естественная интеграция в ткани, стойкий результат 6–24 месяца, наличие лидокаина для комфорта.\n\nСерии: Juvederm Volite — поверхностное увлажнение; Volbella — губы и тонкие зоны; Voluma — объёмные зоны; Vollure — глубокие складки.",
          en: "Juvederm is a line of certified dermal fillers based on stabilised hyaluronic acid (VYCROSS and HYLACROSS technology), developed by Allergan Aesthetics. Juvederm products are distinguished by their soft consistency, long-lasting action, and proven clinical safety — the most researched fillers in the world with over 20 years of clinical studies.\n\nBenefits: natural tissue integration, tactile softness, lasting results 6–24 months, and lidocaine content for injection comfort.\n\nProduct lines: Juvederm Volite — surface hydration; Volbella — lips and fine zones; Voluma — volumising zones; Vollure — deep folds.",
        },
        calloutBody: {
          uk: "Juvederm — один із найдосліджуваніших філерів у світі. Понад 20 років клінічних досліджень та мільйони процедур підтверджують його безпеку.",
          ru: "Juvederm — один из наиболее изученных филлеров в мире. Более 20 лет клинических исследований и миллионы процедур подтверждают его безопасность.",
          en: "Juvederm is one of the most researched fillers in the world. Over 20 years of clinical studies and millions of procedures confirm its safety.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання та протипоказання до застосування Juvederm", ru: "Показания и противопоказания к применению Juvederm", en: "Indications and Contraindications for Juvederm" },
        indications: [
          { uk: "Збільшення та корекція форми губ (Volbella, Volift)", ru: "Увеличение и коррекция формы губ (Volbella, Volift)", en: "Lip augmentation and shaping (Volbella, Volift)" },
          { uk: "Заповнення носогубних складок та маріонеткових зморшок (Vollure)", ru: "Заполнение носогубных складок и морщин марионетки (Vollure)", en: "Nasolabial fold and marionette line filling (Vollure)" },
          { uk: "Відновлення об'єму вилиць, скронь та підочних зон (Voluma)", ru: "Восстановление объёма скул, висков и подглазничных зон (Voluma)", en: "Cheek, temple, and under-eye volume restoration (Voluma)" },
          { uk: "Поверхневе зволоження та покращення якості шкіри (Volite)", ru: "Поверхностное увлажнение и улучшение качества кожи (Volite)", en: "Surface hydration and skin quality improvement (Volite)" },
          { uk: "Корекція підборіддя та нижньої третини обличчя", ru: "Коррекция подбородка и нижней трети лица", en: "Chin and lower third facial correction" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Алергія на гіалуронову кислоту або лідокаїн", ru: "⚠ Аллергия на гиалуроновую кислоту или лидокаин", en: "⚠ Allergy to hyaluronic acid or lidocaine" },
          { uk: "⚠ Активні запальні процеси (акне, герпес) в зоні введення", ru: "⚠ Активные воспалительные процессы (акне, герпес) в зоне введения", en: "⚠ Active inflammation (acne, herpes) at the injection site" },
          { uk: "⚠ Нерозсмоктані філери невідомого складу — ризик ускладнень", ru: "⚠ Нерассосавшиеся филлеры неизвестного состава — риск осложнений", en: "⚠ Unresorbed fillers of unknown composition — risk of complications" },
          { uk: "⚠ Схильність до гранульом та аутоімунні захворювання", ru: "⚠ Склонность к гранулёмам и аутоиммунные заболевания", en: "⚠ Granuloma tendency and autoimmune conditions" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Juvederm — повністю оборотний філер. Гіалуронідаза розчиняє препарат у будь-який момент, якщо результат з будь-якої причини не влаштує.",
          ru: "Juvederm — полностью обратимый филлер. Гиалуронидаза растворяет препарат в любой момент, если результат по любой причине не устроит.",
          en: "Juvederm is fully reversible. Hyaluronidase dissolves the product at any time if the result is unsatisfactory for any reason.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Етапи проведення ін'єкції Juvederm", ru: "Этапы проведения инъекции Juvederm", en: "Juvederm Injection Steps" },
        steps: [
          { title: { uk: "Консультація та вибір серії", ru: "Консультация и выбор серии", en: "Consultation and product selection" }, description: { uk: "Лікар аналізує структуру обличчя та підбирає відповідну серію Juvederm — від легкого Volite до щільного Voluma.", ru: "Врач анализирует структуру лица и подбирает нужную серию Juvederm.", en: "The doctor analyses facial structure and selects the appropriate Juvederm line." } },
          { title: { uk: "Підготовка до процедури", ru: "Подготовка к процедуре", en: "Preparation" }, description: { uk: "За 7 днів — без аспірину та НПЗЗ. Обличчя очищається, за потреби — місцева анестезія (Juvederm вже містить лідокаїн).", ru: "За 7 дней — без аспирина и НПВС. Лицо очищается; при необходимости — местная анестезия (Juvederm уже содержит лидокаин).", en: "7 days before — no aspirin or NSAIDs. Face is cleansed; local anaesthesia if needed (Juvederm already contains lidocaine)." } },
          { title: { uk: "Введення Juvederm", ru: "Введение Juvederm", en: "Juvederm injection" }, description: { uk: "Введення голкою або канюлею залежно від зони. Після кожного введення лікар моделює результат. Процедура: 30–60 хвилин.", ru: "Введение иглой или канюлей в зависимости от зоны. После каждого введения врач моделирует результат. Процедура: 30–60 минут.", en: "Injection by needle or cannula depending on the zone. The doctor sculpts the result after each injection. Duration: 30–60 minutes." } },
          { title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" }, description: { uk: "48 год уникайте сауни, алкоголю, спорту і масажу оброблюваних зон. Набряк і синці — норма, зникають за 3–7 днів.", ru: "48 ч избегайте сауны, алкоголя, спорта и массажа зон введения. Отёк и синяки — норма, исчезают за 3–7 дней.", en: "48 hours avoid sauna, alcohol, exercise, and massage of treated zones. Swelling and bruising are normal and resolve within 3–7 days." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги Juvederm та важливі зауваження", ru: "Преимущества Juvederm и важные замечания", en: "Juvederm Benefits and Key Notes" },
        items: [
          { uk: "Одна з найбільш досліджуваних та безпечних ліній філерів у світі", ru: "Одна из наиболее изученных и безопасных линеек филлеров в мире", en: "One of the most studied and safest filler lines in the world" },
          { uk: "Широкий вибір серій: від легкого зволоження до щільного об'ємного моделювання", ru: "Широкий выбор серий: от лёгкого увлажнения до плотного объёмного моделирования", en: "Wide range of products: from light hydration to dense volumising" },
          { uk: "Містить лідокаїн — знижує болісність введення без додаткової анестезії", ru: "Содержит лидокаин — снижает болезненность введения без дополнительной анестезии", en: "Contains lidocaine — reduces injection discomfort without additional anaesthesia" },
          { uk: "⚠ Результат губ потребує корекції кожні 6–12 місяців через активну мімічну навантаженість", ru: "⚠ Результат губ требует коррекции каждые 6–12 месяцев из-за активной мимической нагрузки", en: "⚠ Lip results require correction every 6–12 months due to high expression activity" },
          { uk: "⚠ Технічна помилка при введенні може призвести до ускладнень — обирайте сертифікованого лікаря", ru: "⚠ Техническая ошибка при введении может привести к осложнениям — выбирайте сертифицированного врача", en: "⚠ Technical errors during injection can cause complications — choose a certified doctor" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Кабінети та умови процедури Juvederm в GENEVITY", ru: "Кабинеты и условия процедуры Juvederm в GENEVITY", en: "GENEVITY Juvederm Treatment Rooms and Conditions" },
        images: interiorImages,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на ін'єкції Juvederm у Дніпрі", ru: "Запишитесь на инъекции Juvederm в Днепре", en: "Book Juvederm Injections in Dnipro" },
        body: { uk: "Лікар підбере оптимальну серію Juvederm для вашого завдання. Консультація — безкоштовно.", ru: "Врач подберёт оптимальную серию Juvederm для вашей задачи. Консультация — бесплатно.", en: "The doctor will select the optimal Juvederm line for your goals. Consultation is free." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      { question: { uk: "Які результати можна очікувати після ін'єкцій Juvederm?", ru: "Какие результаты можно ожидать после инъекций Juvederm?", en: "What results can be expected from Juvederm injections?" }, answer: { uk: "Результати від Juvederm видимі одразу після процедури. Залежно від обраної серії: Volbella збільшить та надасть форму губам; Voluma відновить об'єм вилиць та підборіддя; Vollure згладить носогубні складки; Volite покращить зволоженість та якість шкіри. Остаточний результат стабілізується через 7–14 днів після спаду набряку.", ru: "Результаты от Juvederm видны сразу. В зависимости от серии: Volbella — увеличение губ; Voluma — объём скул; Vollure — коррекция складок; Volite — увлажнение кожи. Окончательный результат стабилизируется через 7–14 дней.", en: "Juvederm results are visible immediately. Depending on the product line: Volbella for lip augmentation; Voluma for cheek volume; Vollure for fold correction; Volite for skin hydration. Final results stabilise 7–14 days after swelling resolves." } },
      { question: { uk: "Скільки триває ефект від процедури?", ru: "Сколько длится эффект от процедуры?", en: "How long do results last?" }, answer: { uk: "Тривалість залежить від серії та зони: Volbella (губи) — 6–12 місяців; Vollure (носогубні складки) — 12–18 місяців; Voluma (вилиці, підборіддя) — 18–24 місяці; Volite (зволоження) — 6–9 місяців. Більш активна мімічна зона — коротша тривалість ефекту.", ru: "Продолжительность зависит от серии и зоны: Volbella — 6–12 месяцев; Vollure — 12–18 месяцев; Voluma — 18–24 месяца; Volite — 6–9 месяцев.", en: "Duration depends on the product and zone: Volbella (lips) 6–12 months; Vollure (nasolabial folds) 12–18 months; Voluma (cheeks, chin) 18–24 months; Volite (hydration) 6–9 months." } },
      { question: { uk: "Чи можна поєднувати Juvederm з іншими косметичними процедурами?", ru: "Можно ли сочетать Juvederm с другими косметическими процедурами?", en: "Can Juvederm be combined with other cosmetic procedures?" }, answer: { uk: "Так. Juvederm чудово поєднується з ботулотоксином — їх часто вводять в один день (рідкий ліфтинг). З біоревіталізацією та мезотерапією — через 2 тижні. З апаратними методиками (RF, HIFU, лазер) — мінімум 4 тижні після введення. Лікар складає план на консультації.", ru: "Да. Juvederm отлично сочетается с ботулотоксином — часто вводят в один день. С биоревитализацией — через 2 недели. С RF, HIFU, лазером — минимум 4 недели после введения.", en: "Yes. Juvederm combines well with botulinum toxin — often on the same day. With biorevitalisation — 2 weeks apart. With RF, HIFU, laser — minimum 4 weeks after injection." } },
    ],
  },

  // ─── POLYPHIL ─────────────────────────────────────────────────────────────
  {
    slug: "polyphil",
    summary: {
      uk: "PolyPhil в GENEVITY — ін'єкційна процедура для довготривалого відновлення об'ємів та ліфтингу обличчя. Ціна процедури PolyPhil в Дніпрі.",
      ru: "PolyPhil в GENEVITY — инъекционная процедура для долгосрочного восстановления объёмов и лифтинга лица. Цена процедуры PolyPhil в Днепре.",
      en: "PolyPhil at GENEVITY — an injectable procedure for long-term volume restoration and facial lifting. PolyPhil procedure price in Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "PolyPhil — біостимулятор для тривалого ліфтингу та відновлення об'ємів", ru: "PolyPhil — биостимулятор для длительного лифтинга и восстановления объёмов", en: "PolyPhil — Biostimulator for Long-Term Lifting and Volume Restoration" },
        body: {
          uk: "PolyPhil — ін'єкційний препарат на основі полімолочної кислоти (PLLA) або полікапролактону (PCL) залежно від серії. Це біостимулятор нового покоління, який діє у два етапи: спочатку забезпечує миттєвий об'ємний ефект завдяки гелевій базі-носію, а потім стимулює власний синтез колагену протягом 3–6 місяців після введення. Результатом є тривалий ліфтинг та відновлення каркасу шкіри без наповнення синтетичними матеріалами.\n\nПереваги процедури PolyPhil: тривалість ефекту до 18–24 місяців, поступово натуральний вигляд без «ефекту маски», покращення якості та щільності шкіри в зоні введення. Препарат підходить для корекції значних вікових змін, коли гіалуронові філери вже не дають достатнього результату.\n\nЯк проходить процедура PolyPhil: підготовка — відмова від антикоагулянтів за 7–10 днів, місцева анестезія. Введення виконується канюлею або голкою в глибокі шари дерми та підшкірного жиру. Тривалість — 30–60 хвилин. Рекомендації після процедури PolyPhil: 7–14 днів масажуйте зони введення за рекомендацією лікаря для рівномірного розподілу препарату.\n\nМожливі побічні ефекти: набряклість і синці (перші 5–10 днів), вузлики в зоні введення (проходять самостійно або після масажу). Показання та протипоказання — аналогічні до інших філерів.",
          ru: "PolyPhil — инъекционный препарат на основе полимолочной кислоты (PLLA) или поликапролактона (PCL). Биостимулятор нового поколения, действующий в два этапа: сначала даёт мгновенный объёмный эффект через гелевый носитель, затем стимулирует синтез собственного коллагена в течение 3–6 месяцев.\n\nПреимущества: длительность эффекта до 18–24 месяцев, постепенно натуральный вид, улучшение качества кожи. Подходит для значительных возрастных изменений.\n\nКак проходит процедура: подготовка — отмена антикоагулянтов за 7–10 дней. Введение канюлей или иглой. Рекомендации: 7–14 дней массируйте зоны по рекомендации врача.",
          en: "PolyPhil is an injectable product based on poly-L-lactic acid (PLLA) or polycaprolactone (PCL) depending on the series. A next-generation biostimulator acting in two stages: first an immediate volume effect via the gel carrier, then stimulation of endogenous collagen synthesis over 3–6 months after injection. The result is long-term lifting and skin framework restoration without synthetic filling.\n\nBenefits: effect lasting up to 18–24 months, gradually natural appearance without a 'mask effect', improved skin quality and density. Suitable for significant age-related changes when HA fillers no longer provide sufficient results.\n\nProcedure: preparation — discontinue anticoagulants 7–10 days before. Injection via cannula or needle into deep dermis and subcutaneous fat. Post-procedure: massage treated zones for 7–14 days as directed.",
        },
        calloutBody: {
          uk: "PolyPhil поєднує два ефекти: миттєвий об'єм від гелю-носія + тривалий неоколагеногенез від PLLA/PCL. Результат — до 2 років.",
          ru: "PolyPhil сочетает два эффекта: мгновенный объём от геля-носителя + длительный неоколлагеногенез от PLLA/PCL. Результат — до 2 лет.",
          en: "PolyPhil combines two effects: immediate volume from the gel carrier + long-term neocollagenogenesis from PLLA/PCL. Result lasts up to 2 years.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до процедури PolyPhil", ru: "Показания к процедуре PolyPhil", en: "Indications for PolyPhil" },
        indications: [
          { uk: "Значна вікова втрата об'єму в зоні вилиць, підочних западин та скронь", ru: "Значительная возрастная потеря объёма в зоне скул, подглазничных впадин и висков", en: "Significant age-related volume loss in the cheeks, under-eye area, and temples" },
          { uk: "Недостатній ліфтинговий ефект від гіалуронових філерів", ru: "Недостаточный лифтинговый эффект от гиалуроновых филлеров", en: "Insufficient lifting effect from hyaluronic acid fillers" },
          { uk: "Зниження щільності та якості шкіри при вираженому фотостарінні", ru: "Снижение плотности и качества кожи при выраженном фотостарении", en: "Reduced skin density and quality with pronounced photoageing" },
          { uk: "Бажання тривалого результату без частих підтримуючих ін'єкцій", ru: "Желание длительного результата без частых поддерживающих инъекций", en: "Desire for lasting results without frequent maintenance injections" },
          { uk: "Корекція опущення тканин нижньої третини обличчя (птоз щік)", ru: "Коррекция опущения тканей нижней трети лица (птоз щёк)", en: "Correction of lower facial tissue descent (cheek ptosis)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Аутоімунні захворювання та схильність до гранульом — відносне протипоказання", ru: "⚠ Аутоиммунные заболевания и склонность к гранулёмам — относительное противопоказание", en: "⚠ Autoimmune conditions and granuloma tendency — relative contraindication" },
          { uk: "⚠ Активні запальні процеси в зоні введення", ru: "⚠ Активные воспалительные процессы в зоне введения", en: "⚠ Active inflammation at the injection site" },
          { uk: "⚠ Прийом антикоагулянтів без медичного погодження", ru: "⚠ Приём антикоагулянтов без медицинского согласования", en: "⚠ Anticoagulant use without medical clearance" },
          { uk: "⚠ Надлишок філера від попередніх ін'єкцій у зоні введення", ru: "⚠ Избыток филлера от предыдущих инъекций в зоне введения", en: "⚠ Excess filler from previous injections in the treatment zone" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Після введення PolyPhil важливо дотримуватися протоколу масажу — лікар навчить техніці та поясить тривалість. Це забезпечує рівномірний розподіл препарату і мінімізує ризик вузликів.",
          ru: "После введения PolyPhil важно соблюдать протокол массажа — врач научит технике и объяснит продолжительность. Это обеспечивает равномерное распределение препарата и минимизирует риск узелков.",
          en: "After PolyPhil injection it is important to follow the massage protocol — the doctor will teach the technique and explain the duration. This ensures even product distribution and minimises nodule risk.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура PolyPhil", ru: "Как проходит процедура PolyPhil", en: "How the PolyPhil Procedure Works" },
        steps: [
          { title: { uk: "Консультація", ru: "Консультация", en: "Consultation" }, description: { uk: "Лікар визначає зони введення, оцінює ступінь вікових змін і пояснює двофазну дію препарату. Обговорюється кількість флаконів.", ru: "Врач определяет зоны введения, оценивает степень возрастных изменений и объясняет двухфазное действие препарата.", en: "The doctor identifies injection zones, assesses the degree of ageing changes, and explains the two-phase action." } },
          { title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" }, description: { uk: "За 7–10 днів — без аспірину та НПЗЗ. Наноситься місцева анестезія. Обличчя очищається і маркується.", ru: "За 7–10 дней — без аспирина и НПВС. Наносится местная анестезия. Лицо очищается и маркируется.", en: "7–10 days before — no aspirin or NSAIDs. Local anaesthesia applied. Face cleansed and marked." } },
          { title: { uk: "Введення PolyPhil", ru: "Введение PolyPhil", en: "PolyPhil injection" }, description: { uk: "Препарат вводиться канюлею в глибокі шари тканин. Лікар моделює розподіл. Тривалість — 30–60 хвилин.", ru: "Препарат вводится канюлей в глубокие слои тканей. Врач моделирует распределение. Продолжительность — 30–60 минут.", en: "Product is injected by cannula into deep tissue layers. The doctor sculpts the distribution. Duration: 30–60 minutes." } },
          { title: { uk: "Протокол після процедури", ru: "Протокол после процедуры", en: "Post-procedure protocol" }, description: { uk: "7–14 днів: масажуйте зони введення 3–5 разів на день за технікою, показаною лікарем. Уникайте сауни, алкоголю і спорту 48 год. Контроль через 4 тижні.", ru: "7–14 дней: массируйте зоны 3–5 раз в день по технике врача. Избегайте сауны, алкоголя и спорта 48 ч. Контроль через 4 недели.", en: "7–14 days: massage zones 3–5 times daily using the doctor-shown technique. Avoid sauna, alcohol, and exercise 48 hours. Check-up at 4 weeks." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги PolyPhil та на що звернути увагу", ru: "Преимущества PolyPhil и на что обратить внимание", en: "PolyPhil Benefits and What to Watch Out For" },
        items: [
          { uk: "Два ефекти в одному: об'єм одразу + стимуляція колагену протягом 3–6 місяців", ru: "Два эффекта в одном: объём сразу + стимуляция коллагена в течение 3–6 месяцев", en: "Two effects in one: immediate volume + collagen stimulation over 3–6 months" },
          { uk: "Тривалий результат — до 18–24 місяців без повторних введень", ru: "Длительный результат — до 18–24 месяцев без повторных введений", en: "Long-lasting result — up to 18–24 months without repeat injections" },
          { uk: "Покращення якості та щільності шкіри в зоні введення", ru: "Улучшение качества и плотности кожи в зоне введения", en: "Improved skin quality and density in the treatment zone" },
          { uk: "⚠ Перші 2 тижні після процедури може спостерігатися нерівномірний контур — це норма, стабілізується", ru: "⚠ Первые 2 недели после процедуры возможен неравномерный контур — это норма, стабилизируется", en: "⚠ Uneven contour for the first 2 weeks post-procedure is normal and will stabilise" },
          { uk: "⚠ Протокол масажу після введення є обов'язковим — недотримання збільшує ризик вузликів", ru: "⚠ Протокол массажа после введения обязателен — несоблюдение увеличивает риск узелков", en: "⚠ Post-injection massage protocol is mandatory — non-compliance increases nodule risk" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "GENEVITY — простір для естетичної медицини", ru: "GENEVITY — пространство для эстетической медицины", en: "GENEVITY — Aesthetic Medicine Space" },
        images: interiorImages,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на процедуру PolyPhil в Дніпрі", ru: "Запишитесь на процедуру PolyPhil в Днепре", en: "Book a PolyPhil Procedure in Dnipro" },
        body: { uk: "Дізнайтеся ціну процедури PolyPhil та оцініть, чи підходить вона для ваших завдань, на безкоштовній консультації.", ru: "Узнайте цену процедуры PolyPhil и оцените, подходит ли она для ваших задач, на бесплатной консультации.", en: "Find out the PolyPhil procedure price and assess if it suits your goals at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      { question: { uk: "Скільки триває ефект від процедури PolyPhil?", ru: "Сколько длится эффект от процедуры PolyPhil?", en: "How long do PolyPhil results last?" }, answer: { uk: "Ефект від PolyPhil зберігається 18–24 місяці. Перші 6 місяців — поступово наростаючий результат за рахунок стимуляції колагеногенезу. Повний ефект формується до 4–6 місяця після введення і зберігається тривало без підтримуючих ін'єкцій.", ru: "Эффект от PolyPhil сохраняется 18–24 месяца. Первые 6 месяцев — постепенно нарастающий результат. Полный эффект формируется к 4–6 месяцу.", en: "PolyPhil results last 18–24 months. The first 6 months show a gradually increasing result due to collagen stimulation. Full effect forms by months 4–6 and is maintained without top-ups." } },
      { question: { uk: "Чи можна поєднувати процедуру PolyPhil з іншими косметичними процедурами?", ru: "Можно ли сочетать процедуру PolyPhil с другими косметическими процедурами?", en: "Can PolyPhil be combined with other cosmetic procedures?" }, answer: { uk: "Так, але з певними обмеженнями. З ботулотоксином PolyPhil поєднується добре — в один день або через 2 тижні. З гіалуроновими філерами — через 2–4 тижні (потрібна оцінка розподілу). З апаратними методами (RF, HIFU) — мінімум 4–6 тижнів після введення PolyPhil.", ru: "Да, но с ограничениями. С ботулотоксином — в один день или через 2 недели. С ГК-филлерами — через 2–4 недели. С RF, HIFU — минимум 4–6 недель после PolyPhil.", en: "Yes, with limitations. With botulinum toxin — same day or 2 weeks apart. With HA fillers — 2–4 weeks. With RF, HIFU — minimum 4–6 weeks after PolyPhil." } },
      { question: { uk: "Які можливі побічні ефекти після процедури PolyPhil?", ru: "Какие возможные побочные эффекты после процедуры PolyPhil?", en: "What are possible side effects after PolyPhil?" }, answer: { uk: "Найпоширеніші побічні ефекти після PolyPhil: набряклість (5–10 днів), синці (1–2 тижні), нерівномірний контур у перші 2 тижні (стабілізується). Рідко — дрібні вузлики в зоні введення, які зникають після масажу або самостійно. При дотриманні протоколу серйозні ускладнення вкрай рідкісні.", ru: "Наиболее частые побочные эффекты: отёчность (5–10 дней), синяки (1–2 недели), неровный контур в первые 2 недели. Редко — мелкие узелки, исчезающие после массажа.", en: "Most common side effects: swelling (5–10 days), bruising (1–2 weeks), uneven contour for the first 2 weeks (stabilises). Rarely — small nodules at injection sites, which resolve with massage." } },
    ],
  },
];

async function seedService(svc: ServiceSeed) {
  const [row] = await sql`SELECT id FROM services WHERE slug = ${svc.slug}`;
  if (!row) { console.log(`⚠ NOT FOUND: ${svc.slug}`); return; }
  const serviceId: string = row.id;
  await sql`UPDATE services SET summary_uk=${svc.summary.uk}, summary_ru=${svc.summary.ru}, summary_en=${svc.summary.en} WHERE id=${serviceId}`;
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
  const blockOrder = [...sectionIds, "faq", "doctors", "equipment", "relatedServices", "finalCTA"];
  await sql`UPDATE services SET block_order=${blockOrder} WHERE id=${serviceId}`;
  console.log(`✓ ${svc.slug} — [${svc.sections.map(s=>s.type).join(", ")}], ${svc.faqs.length} FAQs`);
}

async function main() {
  for (const svc of services) await seedService(svc);
  await sql.end();
  console.log("\nTZ-v2 injectable-B DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
