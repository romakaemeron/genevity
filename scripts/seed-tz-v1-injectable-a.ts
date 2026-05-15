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
  summary: L;
  sections: AnySection[];
  faqs: { question: L; answer: L }[];
}

const services: ServiceSeed[] = [
  // ─── 1. БОТУЛІНОТЕРАПІЯ ───────────────────────────────────────────────────
  {
    slug: "botulinum-therapy",
    summary: {
      uk: "Ботулінотерапія в GENEVITY — ін'єкції ботоксу для обличчя, що усувають зморшки та запобігають їх появі. Природний результат, сертифіковані препарати, досвідчені лікарі в Дніпрі.",
      ru: "Ботулинотерапия в GENEVITY — инъекции ботокса для лица, устраняющие морщины и предотвращающие их появление. Естественный результат, сертифицированные препараты, опытные врачи в Днепре.",
      en: "Botulinum therapy at GENEVITY — botox injections for the face that eliminate wrinkles and prevent new ones. Natural results, certified products, experienced doctors in Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Ботулінотерапія — ін'єкції ботоксу для природного омолодження обличчя",
          ru: "Ботулинотерапия — инъекции ботокса для естественного омоложения лица",
          en: "Botulinum Therapy — Botox Injections for Natural Facial Rejuvenation",
        },
        body: {
          uk: "Ботулінотерапія — медична процедура введення очищеного ботулотоксину типу А в м'язи обличчя з метою тимчасового розслаблення м'язових волокон, які спричиняють утворення зморшок. Уколи ботулотоксину діють шляхом блокування нервово-м'язової передачі: препарат тимчасово перешкоджає виділенню ацетилхоліну, м'яз розслаблюється, шкіра над ним вирівнюється, а нові мімічні зморшки не утворюються.\n\nЕфект від ін'єкцій ботоксу для обличчя розвивається протягом 3–14 днів і зберігається від 4 до 6 місяців залежно від зони введення, концентрації препарату та індивідуальних особливостей пацієнта. Процедура підходить для корекції горизонтальних зморшок лоба, вертикальних складок між бровами («зморшки гніву»), «гусячих лапок» навколо очей, а також для підняття куточків рота та зменшення підборідного напруження.\n\nВ центрі GENEVITY ботулінотерапія проводиться виключно сертифікованими препаратами з підтвердженим профілем безпеки. Лікар-косметолог спочатку аналізує міміку пацієнта в динаміці — це дозволяє точно визначити точки введення і розрахувати дозування так, щоб зберегти природну виразність обличчя. Ін'єкції виконуються ультратонкими голками під місцевою аплікаційною анестезією.\n\nВартість ботулінотерапії залежить від кількості зон обробки та об'єму препарату. На консультації лікар складає індивідуальний план і надає детальний розрахунок вартості. Для збереження тривалого ефекту рекомендується підтримуюча процедура раз на 4–6 місяців.",
          ru: "Ботулинотерапия — медицинская процедура введения очищенного ботулотоксина типа А в мышцы лица с целью временного расслабления мышечных волокон, вызывающих образование морщин. Уколы ботулотоксина действуют путём блокирования нервно-мышечной передачи: препарат временно препятствует выделению ацетилхолина, мышца расслабляется, кожа над ней разглаживается, а новые мимические морщины не образуются.\n\nЭффект от инъекций ботокса для лица развивается в течение 3–14 дней и сохраняется от 4 до 6 месяцев в зависимости от зоны введения, концентрации препарата и индивидуальных особенностей пациента. Процедура подходит для коррекции горизонтальных морщин лба, вертикальных складок между бровями («морщины гнева»), «гусиных лапок» вокруг глаз, а также для подъёма уголков рта и уменьшения подбородочного напряжения.\n\nВ центре GENEVITY ботулинотерапия проводится исключительно сертифицированными препаратами с подтверждённым профилем безопасности. Врач-косметолог предварительно анализирует мимику пациента в динамике — это позволяет точно определить точки введения и рассчитать дозировку так, чтобы сохранить естественную выразительность лица. Инъекции выполняются ультратонкими иглами под местной аппликационной анестезией.\n\nЦена на ботулинотерапию зависит от количества зон обработки и объёма препарата. На консультации врач составляет индивидуальный план и предоставляет детальный расчёт стоимости. Для сохранения длительного эффекта рекомендуется поддерживающая процедура раз в 4–6 месяцев.",
          en: "Botulinum therapy is a medical procedure involving the injection of purified botulinum toxin type A into facial muscles to temporarily relax the muscle fibres that cause wrinkles. Botox injections work by blocking neuromuscular transmission: the product temporarily prevents acetylcholine release, the muscle relaxes, the overlying skin smooths out, and new expression lines stop forming.\n\nResults from botox injections for the face develop within 3–14 days and last 4–6 months depending on the treated zone, product concentration, and individual patient characteristics. The procedure is suitable for correcting horizontal forehead lines, vertical frown lines between the brows, crow's feet around the eyes, as well as lifting the corners of the mouth and softening chin tension.\n\nAt GENEVITY, botulinum therapy is performed exclusively with certified products with a confirmed safety profile. The aesthetic doctor first analyses the patient's facial expressions in motion — this enables precise identification of injection points and dosing that preserves natural facial expressiveness. Injections are performed with ultra-fine needles under topical anaesthetic.\n\nThe cost of botulinum therapy depends on the number of treatment zones and product volume. At consultation, the doctor creates an individualised plan and provides a detailed cost breakdown. A maintenance session every 4–6 months is recommended to sustain long-term results.",
        },
        calloutBody: {
          uk: "Ефект помітний вже через 3–5 днів. Повний результат — на 14-й день. Збереження ефекту — 4–6 місяців.",
          ru: "Эффект заметен уже через 3–5 дней. Полный результат — на 14-й день. Сохранение эффекта — 4–6 месяцев.",
          en: "Results are visible within 3–5 days. Full effect by day 14. Duration: 4–6 months.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до ботулінотерапії", ru: "Показания к ботулинотерапии", en: "Indications for Botulinum Therapy" },
        indications: [
          { uk: "Мімічні зморшки лоба, міжбрів'я та навколо очей («гусячі лапки»)", ru: "Мимические морщины лба, межбровья и вокруг глаз («гусиные лапки»)", en: "Expression lines on the forehead, between the brows, and crow's feet around the eyes" },
          { uk: "Опущені куточки губ та «зморшки маріонетки»", ru: "Опущенные уголки губ и «морщины марионетки»", en: "Downturned corners of the mouth and marionette lines" },
          { uk: "Підборідна складка та горизонтальні зморшки шиї", ru: "Подбородочная складка и горизонтальные морщины шеи", en: "Chin crease and horizontal neck lines" },
          { uk: "Гіпергідроз (підвищена пітливість) пахвин, долонь, стоп", ru: "Гипергидроз (повышенная потливость) подмышек, ладоней, стоп", en: "Hyperhidrosis (excessive sweating) of underarms, palms, and soles" },
          { uk: "Корекція форми брів та підняття куточків очей без операції", ru: "Коррекция формы бровей и подъём уголков глаз без операции", en: "Eyebrow shaping and non-surgical eye corner lifting" },
          { uk: "Бруксизм (скреготіння зубами) та гіпертрофія жувальних м'язів", ru: "Бруксизм (скрежет зубами) и гипертрофия жевательных мышц", en: "Bruxism (teeth grinding) and masseter muscle hypertrophy" },
          { uk: "Профілактика утворення нових мімічних зморшок у пацієнтів 25–35 років", ru: "Профилактика образования новых мимических морщин у пациентов 25–35 лет", en: "Prevention of new expression lines in patients aged 25–35" },
        ],
        contraindicationsHeading: { uk: "Протипоказання та обмеження", ru: "Противопоказания и ограничения", en: "Contraindications and Restrictions" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Нервово-м'язові захворювання (міастенія гравіс, синдром Ламберта–Ітона)", ru: "⚠ Нервно-мышечные заболевания (миастения гравис, синдром Ламберта–Итона)", en: "⚠ Neuromuscular diseases (myasthenia gravis, Lambert–Eaton syndrome)" },
          { uk: "⚠ Прийом антикоагулянтів або антиагрегантів без погодження з лікарем", ru: "⚠ Приём антикоагулянтов или антиагрегантов без согласования с врачом", en: "⚠ Anticoagulant or antiplatelet therapy without medical clearance" },
          { uk: "⚠ Активні запальні процеси або інфекції шкіри в зоні введення", ru: "⚠ Активные воспалительные процессы или инфекции кожи в зоне введения", en: "⚠ Active skin inflammation or infection at the injection site" },
          { uk: "⚠ Алергія на компоненти препарату (ботулотоксин, людський альбумін)", ru: "⚠ Аллергия на компоненты препарата (ботулотоксин, человеческий альбумин)", en: "⚠ Allergy to product components (botulinum toxin, human albumin)" },
          { uk: "⚠ Онкологічні захворювання в стадії лікування", ru: "⚠ Онкологические заболевания в стадии лечения", en: "⚠ Oncological disease under active treatment" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура ботулінотерапії", ru: "Как проходит процедура ботулинотерапии", en: "How the Botulinum Therapy Procedure Works" },
        steps: [
          {
            title: { uk: "Консультація та аналіз міміки", ru: "Консультация и анализ мимики", en: "Consultation and facial analysis" },
            description: { uk: "Лікар оцінює тонус і рухливість м'язів обличчя в статиці та динаміці, визначає зони корекції, пояснює очікуваний результат та підбирає дозування препарату індивідуально.", ru: "Врач оценивает тонус и подвижность мышц лица в статике и динамике, определяет зоны коррекции, объясняет ожидаемый результат и подбирает дозировку препарата индивидуально.", en: "The doctor assesses facial muscle tone and movement both at rest and in motion, identifies correction zones, explains the expected result, and selects dosing individually." },
          },
          {
            title: { uk: "Підготовка шкіри", ru: "Подготовка кожи", en: "Skin preparation" },
            description: { uk: "Обличчя очищається і знежирюється. За потреби наноситься аплікаційний знеболювальний крем на 20–30 хвилин. Лікар розмічає точки введення.", ru: "Лицо очищается и обезжиривается. При необходимости наносится аппликационный обезболивающий крем на 20–30 минут. Врач намечает точки введения.", en: "The face is cleansed and degreased. A topical anaesthetic cream is applied for 20–30 minutes if needed. The doctor marks the injection points." },
          },
          {
            title: { uk: "Введення препарату", ru: "Введение препарата", en: "Product injection" },
            description: { uk: "Ультратонкою голкою вводяться розраховані дози ботулотоксину в кожну точку. Вся процедура займає 15–30 хвилин. Пацієнт відчуває лише незначне поколювання.", ru: "Ультратонкой иглой вводятся рассчитанные дозы ботулотоксина в каждую точку. Вся процедура занимает 15–30 минут. Пациент ощущает лишь незначительное покалывание.", en: "Calculated doses of botulinum toxin are injected at each marked point with an ultra-fine needle. The whole procedure takes 15–30 minutes. The patient feels only minor pricking sensations." },
          },
          {
            title: { uk: "Догляд після процедури", ru: "Уход после процедуры", en: "Post-procedure care" },
            description: { uk: "Протягом 4 годин після ін'єкцій не нахиляйте голову і не лягайте. Уникайте фізичного навантаження, сауни, алкоголю та масажу обличчя 24–48 годин. Не натискайте на зони введення. Макіяж — через 4 години.", ru: "В течение 4 часов после инъекций не наклоняйте голову и не ложитесь. Избегайте физических нагрузок, сауны, алкоголя и массажа лица 24–48 часов. Не давите на зоны введения. Макияж — через 4 часа.", en: "For 4 hours after injections, avoid bending forward or lying down. Avoid exercise, sauna, alcohol, and facial massage for 24–48 hours. Do not press on injection sites. Makeup can be applied after 4 hours." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та недоліки ботулінотерапії", ru: "Преимущества и недостатки ботулинотерапии", en: "Advantages and Disadvantages of Botulinum Therapy" },
        items: [
          { uk: "Швидкий результат — ефект помітний вже через 3–5 днів після процедури", ru: "Быстрый результат — эффект заметен уже через 3–5 дней после процедуры", en: "Fast results — effect visible within 3–5 days after the procedure" },
          { uk: "Мінімальний реабілітаційний період — повертайтеся до звичного ритму одразу", ru: "Минимальный реабилитационный период — возвращайтесь к привычному ритму сразу", en: "Minimal downtime — return to your normal routine immediately" },
          { uk: "Запобігає появі нових зморшок при регулярному застосуванні", ru: "Предотвращает появление новых морщин при регулярном применении", en: "Prevents new wrinkles from forming with regular use" },
          { uk: "Ефективне лікування гіпергідрозу та бруксизму — не лише естетична процедура", ru: "Эффективное лечение гипергидроза и бруксизма — не только эстетическая процедура", en: "Effective treatment for hyperhidrosis and bruxism — not just an aesthetic procedure" },
          { uk: "⚠ Ефект тимчасовий — потребує повторень кожні 4–6 місяців", ru: "⚠ Эффект временный — требует повторений каждые 4–6 месяцев", en: "⚠ Temporary effect — repeat sessions every 4–6 months required" },
          { uk: "⚠ При неправильному дозуванні можливий птоз повіки або асиметрія — обирайте досвідченого лікаря", ru: "⚠ При неправильной дозировке возможен птоз века или асимметрия — выбирайте опытного врача", en: "⚠ Incorrect dosing can cause eyelid ptosis or asymmetry — choose an experienced doctor" },
          { uk: "⚠ Не усуває глибокі статичні зморшки, що потребують філерів або лазерної корекції", ru: "⚠ Не устраняет глубокие статические морщины, требующие филлеров или лазерной коррекции", en: "⚠ Does not address deep static wrinkles that require fillers or laser correction" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Як швидко проявляється ефект після ботулінотерапії?", ru: "Как быстро проявляется эффект после ботулинотерапии?", en: "How quickly do results appear after botulinum therapy?" },
        answer: { uk: "Перші зміни помітні вже через 3–5 днів після ін'єкцій ботоксу — м'язи починають розслаблюватися, зморшки поступово згладжуються. Повний ефект формується до 14-го дня. Саме тому контрольний огляд призначається через 2 тижні після процедури.", ru: "Первые изменения заметны уже через 3–5 дней после инъекций ботокса — мышцы начинают расслабляться, морщины постепенно сглаживаются. Полный эффект формируется к 14-му дню. Именно поэтому контрольный осмотр назначается через 2 недели после процедуры.", en: "First changes are visible within 3–5 days of botox injections — muscles begin relaxing and wrinkles gradually smooth out. The full effect forms by day 14. That is why a follow-up check is scheduled two weeks after the procedure." },
      },
      {
        question: { uk: "Чи можна поєднувати ботулінотерапію з іншими косметологічними процедурами?", ru: "Можно ли сочетать ботулинотерапию с другими косметологическими процедурами?", en: "Can botulinum therapy be combined with other cosmetic procedures?" },
        answer: { uk: "Так, ботулінотерапія добре поєднується з контурною пластикою (філери вводяться в той самий день або через 2 тижні після ботоксу), біоревіталізацією та апаратними процедурами. Проте між ботоксом і агресивними лазерними шліфовками, хімічними пілінгами чи RF-ліфтингом рекомендується витримувати інтервал 2–4 тижні. Лікар складає комплексний план лікування на консультації.", ru: "Да, ботулинотерапия хорошо сочетается с контурной пластикой (филлеры вводятся в тот же день или через 2 недели после ботокса), биоревитализацией и аппаратными процедурами. Однако между ботоксом и агрессивными лазерными шлифовками, химическими пилингами или RF-лифтингом рекомендуется выдерживать интервал 2–4 недели. Врач составляет комплексный план лечения на консультации.", en: "Yes, botulinum therapy combines well with contour correction (fillers can be injected the same day or two weeks after botox), biorevitalisation, and device-based procedures. However, a 2–4 week interval is recommended between botox and aggressive laser resurfacing, chemical peels, or RF lifting. The doctor creates a comprehensive treatment plan at consultation." },
      },
      {
        question: { uk: "Скільки триває реабілітаційний період після ін'єкцій ботулотоксину?", ru: "Сколько длится реабилитационный период после инъекций ботулотоксина?", en: "How long is the recovery period after botulinum toxin injections?" },
        answer: { uk: "Реабілітаційний період після ботулінотерапії мінімальний. Протягом перших 4–6 годин не рекомендується нахилятися та лягати. Упродовж 24–48 годин слід уникати фізичних навантажень, алкоголю, сауни та масажу обличчя. Незначна почервонілість або набряклість у місцях ін'єкцій минає за кілька годин. Більшість пацієнтів повертаються до роботи в той самий день.", ru: "Реабилитационный период после ботулинотерапии минимален. В течение первых 4–6 часов не рекомендуется наклоняться и ложиться. В течение 24–48 часов следует избегать физических нагрузок, алкоголя, сауны и массажа лица. Незначительное покраснение или отёчность в местах инъекций проходит за несколько часов. Большинство пациентов возвращаются к работе в тот же день.", en: "The recovery period after botulinum therapy is minimal. For the first 4–6 hours, bending forward and lying down are not recommended. For 24–48 hours, avoid physical exertion, alcohol, sauna, and facial massage. Minor redness or swelling at injection sites resolves within a few hours. Most patients return to work the same day." },
      },
    ],
  },

  // ─── 2. КОНТУРНА ПЛАСТИКА ────────────────────────────────────────────────
  {
    slug: "contour-plasty",
    summary: {
      uk: "Контурна пластика обличчя в GENEVITY — ін'єкції філерів для відновлення об'ємів, корекції овалу та зволоження шкіри. Препарати на основі гіалуронової кислоти, природний результат, Дніпро.",
      ru: "Контурная пластика лица в GENEVITY — инъекции филлеров для восстановления объёмов, коррекции овала и увлажнения кожи. Препараты на основе гиалуроновой кислоты, естественный результат, Днепр.",
      en: "Facial contour correction at GENEVITY — filler injections to restore volume, define facial contours, and hydrate skin. Hyaluronic acid products, natural results, Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Контурна пластика обличчя — ін'єкції для відновлення об'ємів і чіткості рис",
          ru: "Контурная пластика лица — инъекции для восстановления объёмов и чёткости черт",
          en: "Facial Contour Correction — Injections to Restore Volume and Define Features",
        },
        body: {
          uk: "Контурна пластика овалу обличчя — це введення дермальних філерів на основі гіалуронової кислоти для моделювання рис, заповнення зморшок і складок, а також відновлення вікових втрат об'єму. Гіалуронова кислота є природним компонентом шкіри, тому філери відмінно інтегруються в тканини, зберігаючи природний вигляд і тактильну якість.\n\nПроцедура контурної пластики дозволяє без хірургічного втручання: збільшити або скоригувати губи, підкреслити вилиці, заповнити носогубні складки та «маріонеткові» зморшки, підтягнути овал обличчя, збільшити підборіддя і скорегувати профіль носа. Ефект помітний одразу після ін'єкцій і зберігається від 6 до 24 місяців залежно від типу і щільності препарату, зони введення та обміну речовин пацієнта.\n\nДля контурної пластики в GENEVITY використовуються сертифіковані препарати з різним ступенем щільності — легкі для поверхневої корекції зволоженості, щільні для моделювання чітких контурів і відновлення скелетного об'єму. Лікар-косметолог підбирає тип препарату та техніку введення (канюля або голка) індивідуально після оцінки структури обличчя.\n\nТривалість ефекту та необхідність повторних процедур залежать від зони: губи потребують корекції раз на 6–12 місяців, вилиці та підборіддя — раз на 12–18 місяців. Рекомендується не допускати повного розсмоктування філера і проводити підтримуючі введення до 30% вихідного об'єму.",
          ru: "Контурная пластика овала лица — это введение дермальных филлеров на основе гиалуроновой кислоты для моделирования черт, заполнения морщин и складок, а также восстановления возрастных потерь объёма. Гиалуроновая кислота является естественным компонентом кожи, поэтому филлеры отлично интегрируются в ткани, сохраняя естественный вид и тактильное качество.\n\nПроцедура контурной пластики позволяет без хирургического вмешательства: увеличить или скорректировать губы, подчеркнуть скулы, заполнить носогубные складки и «морщины марионетки», подтянуть овал лица, увеличить подбородок и скорректировать профиль носа. Эффект заметен сразу после инъекций и сохраняется от 6 до 24 месяцев в зависимости от типа и плотности препарата, зоны введения и метаболизма пациента.\n\nДля контурной пластики в GENEVITY используются сертифицированные препараты с различной степенью плотности — лёгкие для поверхностной коррекции увлажнённости, плотные для моделирования чётких контуров и восстановления скелетного объёма. Врач-косметолог подбирает тип препарата и технику введения (канюля или игла) индивидуально после оценки структуры лица.\n\nПродолжительность эффекта и необходимость повторных процедур зависят от зоны: губы требуют коррекции раз в 6–12 месяцев, скулы и подбородок — раз в 12–18 месяцев.",
          en: "Facial contour correction involves injecting hyaluronic acid-based dermal fillers to reshape features, fill wrinkles and folds, and restore age-related volume loss. Hyaluronic acid is a natural skin component, so fillers integrate seamlessly into tissues, maintaining a natural look and feel.\n\nContour correction allows non-surgical lip augmentation and shaping, cheekbone enhancement, filling of nasolabial folds and marionette lines, jawline definition, chin augmentation, and non-surgical rhinoplasty. Results are visible immediately after injections and last 6–24 months depending on product type and density, injection zone, and the patient's metabolism.\n\nGENEVITY uses certified products of varying density — light formulas for surface hydration correction, denser ones for sculpting defined contours and restoring skeletal volume. The aesthetic doctor selects the product type and technique (cannula or needle) individually after assessing facial structure.\n\nDuration of effect varies by zone: lips require correction every 6–12 months, cheeks and chin every 12–18 months. It is recommended to schedule top-ups before complete resorption.",
        },
        calloutBody: {
          uk: "Ефект від контурної пластики видимий одразу. Тривалість залежить від зони: губи — 6–12 місяців, вилиці та підборіддя — до 18 місяців.",
          ru: "Эффект от контурной пластики виден сразу. Продолжительность зависит от зоны: губы — 6–12 месяцев, скулы и подбородок — до 18 месяцев.",
          en: "Contour correction results are visible immediately. Duration depends on the zone: lips 6–12 months, cheeks and chin up to 18 months.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до контурної пластики", ru: "Показания к контурной пластике", en: "Indications for Contour Correction" },
        indications: [
          { uk: "Вікова втрата об'єму в зоні вилиць, скронь, підочних западин", ru: "Возрастная потеря объёма в зоне скул, висков, подглазничных впадин", en: "Age-related volume loss in the cheeks, temples, and under-eye area" },
          { uk: "Виражені носогубні складки та «маріонеткові» зморшки", ru: "Выраженные носогубные складки и «морщины марионетки»", en: "Pronounced nasolabial folds and marionette lines" },
          { uk: "Збільшення або корекція форми губ", ru: "Увеличение или коррекция формы губ", en: "Lip augmentation or reshaping" },
          { uk: "Корекція асиметрії рис обличчя без операції", ru: "Коррекция асимметрии черт лица без операции", en: "Non-surgical correction of facial asymmetry" },
          { uk: "Підтяжка та чіткіше окреслення овалу обличчя", ru: "Подтяжка и более чёткое очерчивание овала лица", en: "Jawline lifting and definition" },
          { uk: "Корекція профілю носа (ринопластика філерами)", ru: "Коррекция профиля носа (ринопластика филлерами)", en: "Nose profile correction (filler rhinoplasty)" },
          { uk: "Збільшення або корекція форми підборіддя", ru: "Увеличение или коррекция формы подбородка", en: "Chin augmentation or reshaping" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні запальні захворювання шкіри (акне у фазі загострення, герпес)", ru: "⚠ Активные воспалительные заболевания кожи (акне в стадии обострения, герпес)", en: "⚠ Active skin inflammation (acne flare, herpes)" },
          { uk: "⚠ Схильність до утворення келоїдних рубців", ru: "⚠ Склонность к образованию келоидных рубцов", en: "⚠ Tendency to form keloid scars" },
          { uk: "⚠ Прийом антикоагулянтів (підвищений ризик гематом)", ru: "⚠ Приём антикоагулянтов (повышенный риск гематом)", en: "⚠ Anticoagulant use (increased bruising risk)" },
          { uk: "⚠ Наявність нерозсмоктаних філерів невідомого складу в зоні введення", ru: "⚠ Наличие нерассосавшихся филлеров неизвестного состава в зоне введения", en: "⚠ Presence of unresorbed fillers of unknown composition in the treatment zone" },
          { uk: "⚠ Аутоімунні захворювання та схильність до гранульом", ru: "⚠ Аутоиммунные заболевания и склонность к гранулёмам", en: "⚠ Autoimmune conditions and tendency to granulomas" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Процедура контурної пластики: етапи та особливості", ru: "Процедура контурной пластики: этапы и особенности", en: "Contour Correction Procedure: Steps and Details" },
        steps: [
          {
            title: { uk: "Консультація та планування", ru: "Консультация и планирование", en: "Consultation and planning" },
            description: { uk: "Лікар аналізує пропорції обличчя, обговорює бажаний результат і підбирає препарати. Для складних зон виконується фотоаналіз у різних ракурсах.", ru: "Врач анализирует пропорции лица, обсуждает желаемый результат и подбирает препараты. Для сложных зон выполняется фотоанализ в различных ракурсах.", en: "The doctor analyses facial proportions, discusses the desired result, and selects products. For complex zones, photo analysis from various angles is performed." },
          },
          {
            title: { uk: "Підготовка до процедури", ru: "Подготовка к процедуре", en: "Preparation" },
            description: { uk: "За 7–10 днів до контурної пластики слід відмовитися від аспірину та НПЗЗ. Наноситься аплікаційний анестетик на 30–40 хвилин або використовується місцева анестезія лідокаїном.", ru: "За 7–10 дней до контурной пластики следует отказаться от аспирина и НПВС. Наносится аппликационный анестетик на 30–40 минут или используется местная анестезия лидокаином.", en: "Aspirin and NSAIDs should be discontinued 7–10 days before contour correction. A topical anaesthetic is applied for 30–40 minutes, or local lidocaine anaesthesia is used." },
          },
          {
            title: { uk: "Введення філера", ru: "Введение филлера", en: "Filler injection" },
            description: { uk: "Препарат вводиться голкою або канюлею в заплановані шари тканин. Після кожного введення лікар моделює результат пальцями. Тривалість процедури — 30–60 хвилин залежно від кількості зон.", ru: "Препарат вводится иглой или канюлей в запланированные слои тканей. После каждого введения врач моделирует результат пальцами. Продолжительность процедуры — 30–60 минут в зависимости от количества зон.", en: "The product is injected by needle or cannula into the planned tissue layers. After each injection the doctor sculpts the result with their fingers. Duration is 30–60 minutes depending on the number of zones." },
          },
          {
            title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" },
            description: { uk: "Уникайте інтенсивного фізичного навантаження, сауни, алкоголю і масажу обличчя протягом 48 годин. Можлива легка набряклість і синці — проходять за 3–7 днів. Не масажуйте зони введення без рекомендації лікаря.", ru: "Избегайте интенсивных физических нагрузок, сауны, алкоголя и массажа лица в течение 48 часов. Возможна лёгкая отёчность и синяки — проходят за 3–7 дней. Не массируйте зоны введения без рекомендации врача.", en: "Avoid intense exercise, sauna, alcohol, and facial massage for 48 hours. Mild swelling and bruising are possible and resolve within 3–7 days. Do not massage injection zones without the doctor's recommendation." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги контурної пластики та важливі застереження", ru: "Преимущества контурной пластики и важные предостережения", en: "Benefits of Contour Correction and Key Considerations" },
        items: [
          { uk: "Видимий результат одразу після процедури без хірургічного втручання", ru: "Видимый результат сразу после процедуры без хирургического вмешательства", en: "Visible results immediately after the procedure, no surgery required" },
          { uk: "Повна оборотність — гіалуронідаза розчиняє філер у будь-який момент", ru: "Полная обратимость — гиалуронидаза растворяет филлер в любой момент", en: "Fully reversible — hyaluronidase can dissolve the filler at any time" },
          { uk: "Персоналізований підхід: поєднання різних препаратів для комплексного результату", ru: "Персонализированный подход: комбинация различных препаратов для комплексного результату", en: "Personalised approach: combination of different products for a comprehensive result" },
          { uk: "Тривалий ефект — до 18–24 місяців у кістково-хрящових зонах", ru: "Длительный эффект — до 18–24 месяцев в костно-хрящевых зонах", en: "Long-lasting effect — up to 18–24 months in bone-cartilage zones" },
          { uk: "⚠ Некваліфіковане введення філерів може призвести до оклюзії судин — довіряйте лише досвідченому лікарю", ru: "⚠ Неквалифицированное введение филлеров может привести к окклюзии сосудов — доверяйте только опытному врачу", en: "⚠ Inexpert filler injection can lead to vascular occlusion — trust only an experienced doctor" },
          { uk: "⚠ Губи потребують повторних корекцій кожні 6–12 місяців через активну мімічну навантаженість", ru: "⚠ Губы требуют повторных коррекций каждые 6–12 месяцев из-за активной мимической нагрузки", en: "⚠ Lips require repeat corrections every 6–12 months due to high expression activity" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Які препарати використовуються для контурної пластики?", ru: "Какие препараты используются для контурной пластики?", en: "What products are used for contour correction?" },
        answer: { uk: "В GENEVITY використовуються сертифіковані філери на основі стабілізованої гіалуронової кислоти. Щільність препарату підбирається залежно від зони: м'які гелі — для губ і зволоження, середні — для носогубних складок, щільні — для вилиць, підборіддя та кісткових зон. Лікар озвучує назву і характеристики препарату перед процедурою.", ru: "В GENEVITY используются сертифицированные филлеры на основе стабилизированной гиалуроновой кислоты. Плотность препарата подбирается в зависимости от зоны: мягкие гели — для губ и увлажнения, средние — для носогубных складок, плотные — для скул, подбородка и костных зон. Врач называет препарат и его характеристики перед процедурой.", en: "GENEVITY uses certified stabilised hyaluronic acid fillers. Product density is selected by zone: soft gels for lips and hydration, medium density for nasolabial folds, dense formulas for cheeks, chin, and skeletal zones. The doctor names the product and its characteristics before the procedure." },
      },
      {
        question: { uk: "Чи можна поєднувати контурну пластику з іншими косметологічними процедурами?", ru: "Можно ли сочетать контурную пластику с другими косметологическими процедурами?", en: "Can contour correction be combined with other cosmetic procedures?" },
        answer: { uk: "Так. Ботулотоксин і філери часто вводяться в один день або з інтервалом 2 тижні — це «рідкий ліфтинг». Біоревіталізацію і мезотерапію поєднують з філерами через 2–4 тижні. Апаратні процедури (RF, HIFU) проводяться до або мінімум через 4 тижні після введення філерів. Лікар складає план комплексного лікування на консультації.", ru: "Да. Ботулотоксин и филлеры часто вводятся в один день или с интервалом 2 недели — это «жидкий лифтинг». Биоревитализацию и мезотерапию сочетают с филлерами через 2–4 недели. Аппаратные процедуры (RF, HIFU) проводятся до или минимум через 4 недели после введения филлеров. Врач составляет план комплексного лечения на консультации.", en: "Yes. Botulinum toxin and fillers are often combined on the same day or two weeks apart — this is known as a 'liquid lift'. Biorevitalisation and mesotherapy are combined with fillers 2–4 weeks apart. Device-based procedures (RF, HIFU) are performed before or at least 4 weeks after filler injection. The doctor creates a comprehensive treatment plan at consultation." },
      },
      {
        question: { uk: "Як підготуватися до процедури контурної пластики?", ru: "Как подготовиться к процедуре контурной пластики?", en: "How to prepare for contour correction?" },
        answer: { uk: "За 7–10 днів до процедури відмовтеся від аспірину, ібупрофену та інших НПЗЗ — вони розріджують кров і підвищують ризик синців. За 2–3 дні уникайте алкоголю. При схильності до герпесу на губах прийміть профілактичний курс противірусних препаратів, призначений лікарем. У день процедури не наносьте макіяж на оброблювані зони.", ru: "За 7–10 дней до процедуры откажитесь от аспирина, ибупрофена и других НПВС — они разжижают кровь и повышают риск синяков. За 2–3 дня избегайте алкоголя. При склонности к герпесу на губах примите профилактический курс противовирусных препаратов, назначенный врачом. В день процедуры не наносите макияж на обрабатываемые зоны.", en: "Discontinue aspirin, ibuprofen, and other NSAIDs 7–10 days before the procedure — they thin the blood and increase bruising risk. Avoid alcohol for 2–3 days beforehand. If prone to lip herpes, take a preventive antiviral course prescribed by your doctor. On the day of the procedure, do not apply makeup to the treatment zones." },
      },
    ],
  },

  // ─── 3. БІОРЕВІТАЛІЗАЦІЯ ─────────────────────────────────────────────────
  {
    slug: "biorevitalisation",
    summary: {
      uk: "Біоревіталізація обличчя в GENEVITY — ін'єкційне глибоке зволоження шкіри гіалуроновою кислотою. Відновлення тургору, сяйва та еластичності шкіри. Ціна біоревіталізації в Дніпрі.",
      ru: "Биоревитализация лица в GENEVITY — инъекционное глубокое увлажнение кожи гиалуроновой кислотой. Восстановление тургора, сияния и эластичности кожи. Цена биоревитализации в Днепре.",
      en: "Facial biorevitalisation at GENEVITY — injectable deep skin hydration with hyaluronic acid. Restoring skin turgor, radiance, and elasticity. Biorevitalisation price in Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Біоревіталізація обличчя — глибоке зволоження та відновлення шкіри",
          ru: "Биоревитализация лица — глубокое увлажнение и восстановление кожи",
          en: "Facial Biorevitalisation — Deep Hydration and Skin Restoration",
        },
        body: {
          uk: "Біоревіталізація — це ін'єкційна процедура введення нативної (нестабілізованої) гіалуронової кислоти безпосередньо в середні та глибокі шари дерми. На відміну від філерів, які моделюють форму, біоревіталізація шкіри обличчя спрямована на відновлення природного водного балансу: гіалуронова кислота зв'язує молекули води у тканинах, підвищуючи тургор, еластичність і природне сяяння шкіри.\n\nПроцедура біоревіталізації показана при першіх ознаках зневоднення та фотостаріння: коли шкіра втрачає пружність, тьмяніє, а дрібні зморшки стають помітними. Вона ефективна для підготовки шкіри до більш інтенсивних процедур і для відновлення після лазерних шліфовок або хімічних пілінгів.\n\nРезультати біоревіталізації накопичуються: після першого сеансу шкіра стає більш зволоженою та сяючою, після повного курсу (3–4 процедури з інтервалом 3–4 тижні) відбувається стійке покращення якості шкіри, яке зберігається 6–9 місяців. Для підтримання ефекту рекомендується 1–2 підтримуючі процедури на рік.\n\nЦіна біоревіталізації в Дніпрі залежить від виробника і об'єму препарату, кількості зон (обличчя, шия, декольте, руки) та методики введення. В GENEVITY використовуються препарати з підтвердженою клінічною ефективністю, а лікар підбирає оптимальну схему після діагностики шкіри.",
          ru: "Биоревитализация — это инъекционная процедура введения нативной (нестабилизированной) гиалуроновой кислоты непосредственно в средние и глубокие слои дермы. В отличие от филлеров, которые моделируют форму, биоревитализация кожи лица направлена на восстановление естественного водного баланса: гиалуроновая кислота связывает молекулы воды в тканях, повышая тургор, эластичность и естественное сияние кожи.\n\nПроцедура биоревитализации показана при первых признаках обезвоживания и фотостарения: когда кожа теряет упругость, тускнеет, а мелкие морщины становятся заметными. Она эффективна для подготовки кожи к более интенсивным процедурам и для восстановления после лазерных шлифовок или химических пилингов.\n\nРезультаты биоревитализации накапливаются: после первого сеанса кожа становится более увлажнённой и сияющей, после полного курса (3–4 процедуры с интервалом 3–4 недели) происходит стойкое улучшение качества кожи, сохраняющееся 6–9 месяцев. Для поддержания эффекта рекомендуется 1–2 поддерживающие процедуры в год.",
          en: "Biorevitalisation is an injectable procedure delivering native (non-crosslinked) hyaluronic acid directly into the mid and deep dermis. Unlike fillers that shape contours, facial skin biorevitalisation aims to restore the skin's natural water balance: hyaluronic acid binds water molecules in the tissue, increasing turgor, elasticity, and natural radiance.\n\nBiorevitalisation is indicated for the first signs of dehydration and photoageing: when the skin loses firmness, looks dull, and fine lines become visible. It is effective for preparing skin for more intensive treatments and for recovery after laser resurfacing or chemical peels.\n\nResults accumulate: after the first session the skin is noticeably more hydrated and glowing; after a full course (3–4 sessions at 3–4 week intervals), a lasting improvement in skin quality is achieved that persists for 6–9 months. One to two maintenance sessions per year are recommended.",
        },
        calloutBody: {
          uk: "Перше зволоження помітне одразу. Після повного курсу — стійке покращення якості шкіри на 6–9 місяців.",
          ru: "Первое увлажнение заметно сразу. После полного курса — стойкое улучшение качества кожи на 6–9 месяцев.",
          en: "Initial hydration is visible immediately. After a full course — lasting skin quality improvement for 6–9 months.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до біоревіталізації", ru: "Показания к биоревитализации", en: "Indications for Biorevitalisation" },
        indications: [
          { uk: "Зневоднення шкіри, відчуття стягування та тьмяність", ru: "Обезвоживание кожи, ощущение стянутости и тусклость", en: "Skin dehydration, tightness sensation, and dullness" },
          { uk: "Перші ознаки фотостаріння: дрібні зморшки, нерівний тон", ru: "Первые признаки фотостарения: мелкие морщины, неровный тон", en: "Early photoageing signs: fine lines, uneven skin tone" },
          { uk: "Відновлення після лазерних процедур, пілінгів, дерматозів", ru: "Восстановление после лазерных процедур, пилингов, дерматозов", en: "Recovery after laser procedures, peels, or dermatoses" },
          { uk: "Підготовка шкіри до активних омолоджуючих процедур", ru: "Подготовка кожи к активным омолаживающим процедурам", en: "Skin preparation before intensive rejuvenation procedures" },
          { uk: "Покращення кольору та текстури шкіри обличчя, шиї, декольте, рук", ru: "Улучшение цвета и текстури кожи лица, шеи, декольте, рук", en: "Improving skin colour and texture on face, neck, décolletage, and hands" },
          { uk: "Профілактика вікових змін у пацієнтів 25–35 років", ru: "Профилактика возрастных изменений у пациентов 25–35 лет", en: "Preventive anti-ageing care for patients aged 25–35" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні запальні захворювання шкіри в зоні введення (акне, герпес)", ru: "⚠ Активные воспалительные заболевания кожи в зоне введения (акне, герпес)", en: "⚠ Active skin inflammation in the treatment zone (acne, herpes)" },
          { uk: "⚠ Алергія на гіалуронову кислоту або компоненти препарату", ru: "⚠ Аллергия на гиалуроновую кислоту или компоненты препарата", en: "⚠ Allergy to hyaluronic acid or product components" },
          { uk: "⚠ Схильність до утворення гіпертрофічних рубців та келоїдів", ru: "⚠ Склонность к образованию гипертрофических рубцов и келоидов", en: "⚠ Tendency to form hypertrophic scars and keloids" },
          { uk: "⚠ Прийом антикоагулянтів без погодження з лікарем", ru: "⚠ Приём антикоагулянтов без согласования с врачом", en: "⚠ Anticoagulant use without medical clearance" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура біоревіталізації", ru: "Как проходит процедура биоревитализации", en: "How Biorevitalisation Works" },
        steps: [
          { title: { uk: "Діагностика шкіри", ru: "Диагностика кожи", en: "Skin diagnosis" }, description: { uk: "Лікар оцінює тип і стан шкіри, ступінь зневоднення, визначає зони для введення та підбирає препарат.", ru: "Врач оценивает тип и состояние кожи, степень обезвоживания, определяет зоны для введения и подбирает препарат.", en: "The doctor assesses skin type and condition, degree of dehydration, identifies injection zones, and selects the product." } },
          { title: { uk: "Анестезія", ru: "Анестезия", en: "Anaesthesia" }, description: { uk: "Наноситься аплікаційний знеболювальний крем на 30–40 хвилин. Деякі препарати вже містять лідокаїн у складі, що мінімізує дискомфорт.", ru: "Наносится аппликационный обезболивающий крем на 30–40 минут. Некоторые препараты уже содержат лидокаин в составе, что минимизирует дискомфорт.", en: "Topical anaesthetic cream is applied for 30–40 minutes. Some products already contain lidocaine, further minimising discomfort." } },
          { title: { uk: "Введення препарату", ru: "Введение препарата", en: "Injection" }, description: { uk: "Гіалуронова кислота вводиться мікроін'єкціями або папульною технікою в середні та поверхневі шари дерми. Тривалість — 30–45 хвилин.", ru: "Гиалуроновая кислота вводится микроинъекциями или папульной техникой в средние и поверхностные слои дермы. Продолжительность — 30–45 минут.", en: "Hyaluronic acid is delivered via microinjections or papule technique into the mid and superficial dermis. Duration: 30–45 minutes." } },
          { title: { uk: "Відновлення", ru: "Восстановление", en: "Recovery" }, description: { uk: "Протягом 24–48 годин уникайте макіяжу, фізичного навантаження та сауни. Дрібні папули (гулики) розсмоктуються за 24–72 години. Сонцезахисний крем SPF 50+ обов'язковий протягом 2 тижнів.", ru: "В течение 24–48 часов избегайте макияжа, физических нагрузок и сауны. Мелкие папулы (бугорки) рассасываются за 24–72 часа. Солнцезащитный крем SPF 50+ обязателен в течение 2 недель.", en: "Avoid makeup, exercise, and sauna for 24–48 hours. Small papules (bumps) resolve within 24–72 hours. SPF 50+ sunscreen is mandatory for 2 weeks." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості біоревіталізації", ru: "Преимущества и особенности биоревитализации", en: "Benefits and Key Features of Biorevitalisation" },
        items: [
          { uk: "Глибоке зволоження — відновлює природний водний баланс там, де звичайні креми безсилі", ru: "Глубокое увлажнение — восстанавливает естественный водный баланс там, где обычные кремы бессильны", en: "Deep hydration — restores natural water balance where topical creams cannot reach" },
          { uk: "Покращує якість шкіри в будь-якому віці: від 25 до 65+ років", ru: "Улучшает качество кожи в любом возрасте: от 25 до 65+ лет", en: "Improves skin quality at any age: from 25 to 65+" },
          { uk: "Ефект накопичується: кожна наступна процедура дає кращий і тривалiший результат", ru: "Эффект накапливается: каждая следующая процедура даёт лучший и более длительный результат", en: "Results accumulate: each subsequent session delivers better and longer-lasting improvement" },
          { uk: "⚠ Вікові обмеження відсутні, але пацієнтам до 25 років процедура призначається лише за медичними показаннями", ru: "⚠ Возрастных ограничений нет, но пациентам до 25 лет процедура назначается только по медицинским показаниям", en: "⚠ No age restrictions, but patients under 25 receive the procedure only when medically indicated" },
          { uk: "⚠ Після процедури можливі видимі папули (гулики) — вони розсмоктуються за 1–3 дні", ru: "⚠ После процедуры возможны видимые папулы (бугорки) — они рассасываются за 1–3 дня", en: "⚠ Visible papules (bumps) may appear after the procedure — they resolve within 1–3 days" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки триває ефект від біоревіталізації?", ru: "Сколько длится эффект от биоревитализации?", en: "How long do biorevitalisation results last?" },
        answer: { uk: "Ефект від одного сеансу зберігається 2–4 тижні. Після повного курсу з 3–4 процедур з інтервалом 3–4 тижні стійкий результат — покращена якість, зволоженість і сяяння шкіри — утримується 6–9 місяців. Для підтримання рекомендується 1–2 процедури на рік.", ru: "Эффект от одного сеанса сохраняется 2–4 недели. После полного курса из 3–4 процедур с интервалом 3–4 недели стойкий результат — улучшенное качество, увлажнённость и сияние кожи — удерживается 6–9 месяцев. Для поддержания рекомендуется 1–2 процедуры в год.", en: "The effect of a single session lasts 2–4 weeks. After a full course of 3–4 sessions at 3–4 week intervals, lasting improvement in skin quality, hydration, and radiance is maintained for 6–9 months. One to two maintenance sessions per year are recommended." },
      },
      {
        question: { uk: "Чи можна поєднувати біоревіталізацію з іншими косметологічними процедурами?", ru: "Можно ли сочетать биоревитализацию с другими косметологическими процедурами?", en: "Can biorevitalisation be combined with other cosmetic procedures?" },
        answer: { uk: "Так. Біоревіталізація чудово доповнює ботулінотерапію та апаратні процедури. Між біоревіталізацією і лазерними шліфовками або глибокими пілінгами рекомендується витримувати інтервал 2–3 тижні. Комбінований підхід дає значно кращий і триваліший результат, ніж кожна процедура окремо.", ru: "Да. Биоревитализация отлично дополняет ботулинотерапию и аппаратные процедуры. Между биоревитализацией и лазерными шлифовками или глубокими пилингами рекомендуется выдерживать интервал 2–3 недели. Комбинированный подход даёт значительно лучший и более длительный результат, чем каждая процедура по отдельности.", en: "Yes. Biorevitalisation complements botulinum therapy and device-based procedures well. A 2–3 week interval is recommended between biorevitalisation and laser resurfacing or deep peels. A combined approach delivers significantly better and longer-lasting results than any single procedure." },
      },
      {
        question: { uk: "Який реабілітаційний період після біоревіталізації?", ru: "Какой реабилитационный период после биоревитализации?", en: "What is the recovery period after biorevitalisation?" },
        answer: { uk: "Реабілітаційний період мінімальний. Безпосередньо після процедури залишаються дрібні точкові папули — вони розсмоктуються протягом 24–72 годин. Уникайте макіяжу, інтенсивного спорту, сауни та прямого сонця 24–48 годин. Більшість пацієнтів виходять на роботу наступного дня.", ru: "Реабилитационный период минимален. Непосредственно после процедуры остаются мелкие точечные папулы — они рассасываются в течение 24–72 часов. Избегайте макияжа, интенсивного спорта, сауны и прямого солнца 24–48 часов. Большинство пациентов выходят на работу на следующий день.", en: "The recovery period is minimal. Small punctate papules remain immediately after the procedure and resolve within 24–72 hours. Avoid makeup, intense exercise, sauna, and direct sun for 24–48 hours. Most patients return to work the next day." },
      },
      {
        question: { uk: "Чи є вікові обмеження для проведення біоревіталізації?", ru: "Есть ли возрастные ограничения для проведения биоревитализации?", en: "Are there age restrictions for biorevitalisation?" },
        answer: { uk: "Процедура не має суворих вікових обмежень. Пацієнтам 25–35 років вона призначається переважно для зволоження та профілактики. Після 35–40 років — для корекції перших ознак старіння та відновлення тургору. Пацієнтам до 18 років процедура не проводиться. Від 18 до 25 — лише за медичними показаннями (постакне, зневоднення після дерматологічного лікування).", ru: "Процедура не имеет строгих возрастных ограничений. Пациентам 25–35 лет она назначается преимущественно для увлажнения и профилактики. После 35–40 лет — для коррекции первых признаков старения и восстановления тургора. Пациентам до 18 лет процедура не проводится. От 18 до 25 — только по медицинским показаниям.", en: "The procedure has no strict age restrictions. Patients aged 25–35 receive it primarily for hydration and prevention. After 35–40, it targets early signs of ageing and turgor restoration. Under-18 patients are not treated. Ages 18–25 — only with medical indications (post-acne, dehydration from dermatological treatment)." },
      },
    ],
  },

  // ─── 4. МЕЗОТЕРАПІЯ ──────────────────────────────────────────────────────
  {
    slug: "mesotherapy",
    summary: {
      uk: "Мезотерапія обличчя в GENEVITY — ін'єкції коктейлів з вітамінів, амінокислот і мікроелементів для живлення, зволоження та омолодження шкіри. Ціна на мезотерапію обличчя в Дніпрі.",
      ru: "Мезотерапия лица в GENEVITY — инъекции коктейлей из витаминов, аминокислот и микроэлементов для питания, увлажнения и омоложения кожи. Цена мезотерапии лица в Днепре.",
      en: "Facial mesotherapy at GENEVITY — vitamin, amino acid, and micronutrient cocktail injections for skin nourishment, hydration, and rejuvenation. Facial mesotherapy price in Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Мезотерапія обличчя — ін'єкційне живлення та омолодження шкіри",
          ru: "Мезотерапия лица — инъекционное питание и омоложение кожи",
          en: "Facial Mesotherapy — Injectable Skin Nourishment and Rejuvenation",
        },
        body: {
          uk: "Мезотерапія обличчя — це введення мікродоз активних речовин (вітамінів, мінералів, амінокислот, пептидів, ліполітиків) безпосередньо в мезодерму — середній шар шкіри, де відбуваються основні метаболічні процеси. Ін'єкції мезотерапії обходять роговий шар епідерміса і доставляють активні компоненти саме туди, де вони найефективніші — до фібробластів, відповідальних за синтез колагену та еластину.\n\nПроцедура мезотерапії для обличчя використовується для вирішення широкого спектра задач: зволоження та відновлення тьмяної шкіри, корекція пігментації, боротьба з акне та постакне, ліфтинг та підтяжка овалу, а також корекція локальних жирових відкладень (мезотерапія для схуднення в зоні підборіддя та щік). Склад «мезококтейлю» підбирається лікарем індивідуально залежно від проблем та типу шкіри.\n\nВиди мезотерапії: класична (мікроін'єкції голкою), безін'єкційна (електропорація, ультрафонофорез) і апаратна. В GENEVITY застосовується класична ін'єкційна мезотерапія сертифікованими препаратами — вона забезпечує найвищу біодоступність активних речовин.\n\nПідготовка до мезотерапії: за 5–7 днів відмовтеся від аспірину та розріджуючих кров препаратів. Реабілітація після процедури мезотерапії: можлива легка гіперемія та дрібні папули протягом 24–48 годин.",
          ru: "Мезотерапия лица — это введение микродоз активных веществ (витаминов, минералов, аминокислот, пептидов, липолитиков) непосредственно в мезодерму — средний слой кожи, где происходят основные метаболические процессы. Инъекции мезотерапии обходят роговой слой эпидермиса и доставляют активные компоненты именно туда, где они наиболее эффективны — к фибробластам, отвечающим за синтез коллагена и эластина.\n\nПроцедура мезотерапии для лица используется для решения широкого спектра задач: увлажнение и восстановление тусклой кожи, коррекция пигментации, борьба с акне и постакне, лифтинг и подтяжка овала, а также коррекция локальных жировых отложений. Состав «мезококтейля» подбирается врачом индивидуально в зависимости от проблем и типа кожи.\n\nВ GENEVITY применяется классическая инъекционная мезотерапия сертифицированными препаратами — она обеспечивает наивысшую биодоступность активных веществ. Подготовка: за 5–7 дней откажитесь от аспирина. Реабилитация: возможна лёгкая гиперемия и мелкие папулы в течение 24–48 часов.",
          en: "Facial mesotherapy involves injecting micro-doses of active substances (vitamins, minerals, amino acids, peptides, lipolytics) directly into the mesoderm — the middle skin layer where key metabolic processes occur. Mesotherapy injections bypass the stratum corneum and deliver active components exactly where they are most effective — to fibroblasts responsible for collagen and elastin synthesis.\n\nFacial mesotherapy addresses a wide range of concerns: hydrating and restoring dull skin, correcting pigmentation, treating acne and post-acne, lifting and tightening the oval, and reducing localised fat deposits (chin and cheek mesotherapy). The 'meso-cocktail' composition is selected by the doctor individually based on skin problems and type.\n\nGENEVITY uses classic injection mesotherapy with certified products — this ensures the highest bioavailability of active ingredients. Preparation: discontinue aspirin 5–7 days before. Recovery: mild redness and small papules possible for 24–48 hours.",
        },
        calloutBody: {
          uk: "Склад мезококтейлю підбирається індивідуально під тип шкіри та конкретні завдання — від зволоження до корекції пігментації.",
          ru: "Состав мезококтейля подбирается индивидуально под тип кожи и конкретные задачи — от увлажнения до коррекции пигментации.",
          en: "The meso-cocktail composition is selected individually to suit the skin type and specific goals — from hydration to pigmentation correction.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до мезотерапії обличчя", ru: "Показания к мезотерапии лица", en: "Indications for Facial Mesotherapy" },
        indications: [
          { uk: "Зневоднення і тьмяність шкіри, втрата природного сяяння", ru: "Обезвоживание и тусклость кожи, потеря естественного сияния", en: "Skin dehydration, dullness, and loss of natural radiance" },
          { uk: "Пігментація, нерівний тон і постзапальні плями", ru: "Пигментация, неровный тон и постовоспалительные пятна", en: "Pigmentation, uneven skin tone, and post-inflammatory marks" },
          { uk: "Акне та жирна шкіра (себорегулюючі коктейлі)", ru: "Акне и жирная кожа (себорегулирующие коктейли)", en: "Acne and oily skin (sebum-regulating cocktails)" },
          { uk: "Ліфтинг та підтяжка без хірургічного втручання", ru: "Лифтинг и подтяжка без хирургического вмешательства", en: "Non-surgical lifting and tightening" },
          { uk: "Корекція локальних жирових відкладень в зоні підборіддя і щік", ru: "Коррекция локальных жировых отложений в зоне подбородка и щёк", en: "Correcting localised fat deposits in the chin and cheeks" },
          { uk: "Підготовка до лазерних процедур та реабілітація після них", ru: "Подготовка к лазерным процедурам и реабилитация после них", en: "Preparation for laser procedures and recovery after them" },
          { uk: "Лікування випадіння волосся (трихологічна мезотерапія)", ru: "Лечение выпадения волос (трихологическая мезотерапия)", en: "Hair loss treatment (trichological mesotherapy)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання та можливі побічні ефекти", ru: "Противопоказания и возможные побочные эффекты", en: "Contraindications and Possible Side Effects" },
        contraindications: [
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні запальні та інфекційні захворювання шкіри в зоні введення", ru: "⚠ Активные воспалительные и инфекционные заболевания кожи в зоне введения", en: "⚠ Active inflammatory or infectious skin conditions in the treatment zone" },
          { uk: "⚠ Алергія на компоненти препарату (вітаміни групи В, ліпоєва кислота)", ru: "⚠ Аллергия на компоненты препарата (витамины группы В, липоевая кислота)", en: "⚠ Allergy to product components (B vitamins, lipoic acid)" },
          { uk: "⚠ Порушення згортання крові та прийом антикоагулянтів", ru: "⚠ Нарушения свёртываемости крови и приём антикоагулянтов", en: "⚠ Blood coagulation disorders and anticoagulant use" },
          { uk: "⚠ Онкологічні захворювання", ru: "⚠ Онкологические заболевания", en: "⚠ Malignancies" },
          { uk: "⚠ Можливі побічні ефекти: гематоми, локальна гіперемія, дрібні папули — проходять самостійно за 24–72 год", ru: "⚠ Возможные побочные эффекты: гематомы, локальная гиперемия, мелкие папулы — проходят самостоятельно за 24–72 ч", en: "⚠ Possible side effects: bruising, localised redness, small papules — resolve spontaneously within 24–72 h" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Процедура проведення мезотерапії", ru: "Процедура проведения мезотерапии", en: "Mesotherapy Procedure" },
        steps: [
          { title: { uk: "Консультація та підбір коктейлю", ru: "Консультация и подбор коктейля", en: "Consultation and cocktail selection" }, description: { uk: "Лікар аналізує тип і стан шкіри, визначає цільові зони та підбирає склад мезококтейлю індивідуально.", ru: "Врач анализирует тип и состояние кожи, определяет целевые зоны и подбирает состав мезококтейля индивидуально.", en: "The doctor analyses skin type and condition, identifies target zones, and selects a personalised meso-cocktail." } },
          { title: { uk: "Знеболення", ru: "Обезболивание", en: "Anaesthesia" }, description: { uk: "Аплікаційна анестезія наноситься за 20–40 хвилин до початку процедури. Деякі коктейлі містять лідокаїн.", ru: "Аппликационная анестезия наносится за 20–40 минут до начала процедуры. Некоторые коктейли содержат лидокаин.", en: "Topical anaesthetic is applied 20–40 minutes before the procedure. Some cocktails already contain lidocaine." } },
          { title: { uk: "Ін'єкції мезококтейлю", ru: "Инъекции мезококтейля", en: "Meso-cocktail injections" }, description: { uk: "Препарат вводиться мікроін'єкціями на глибину 1–4 мм в сітчасту або папульну техніку. Тривалість сеансу — 30–50 хвилин.", ru: "Препарат вводится микроинъекциями на глубину 1–4 мм по сетчатой или папульной технике. Продолжительность сеанса — 30–50 минут.", en: "The product is delivered via micro-injections at 1–4 mm depth using a grid or papule technique. Session duration: 30–50 minutes." } },
          { title: { uk: "Реабілітація", ru: "Реабилитация", en: "Recovery" }, description: { uk: "24–48 годин уникайте фізичного навантаження, сауни, макіяжу і прямого сонця. Через 2 тижні — наступний сеанс. Курс: 4–6 процедур.", ru: "24–48 часов избегайте физических нагрузок, сауны, макияжа и прямого солнца. Через 2 недели — следующий сеанс. Курс: 4–6 процедур.", en: "For 24–48 hours avoid exercise, sauna, makeup, and direct sun. Next session in 2 weeks. Course: 4–6 sessions." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та недоліки мезотерапії", ru: "Преимущества и недостатки мезотерапии", en: "Advantages and Disadvantages of Mesotherapy" },
        items: [
          { uk: "Адресна доставка активних речовин — максимальна ефективність при мінімальній дозі", ru: "Адресная доставка активных веществ — максимальная эффективность при минимальной дозе", en: "Targeted delivery of active ingredients — maximum effect at a minimal dose" },
          { uk: "Широкий спектр задач: від зволоження до ліполізу — один метод, сотні завдань", ru: "Широкий спектр задач: от увлажнения до липолиза — один метод, сотни задач", en: "Wide application range: from hydration to lipolysis — one method, hundreds of uses" },
          { uk: "Мінімальний реабілітаційний період — 24–48 годин", ru: "Минимальный реабилитационный период — 24–48 часов", en: "Minimal recovery period — 24–48 hours" },
          { uk: "⚠ Ефект накопичувальний — потрібен повний курс (4–6 процедур) для стійкого результату", ru: "⚠ Эффект накопительный — необходим полный курс (4–6 процедур) для стойкого результата", en: "⚠ Cumulative effect — a full course (4–6 sessions) is needed for lasting results" },
          { uk: "⚠ Після процедури можливі синці та папули — плануйте із запасом часу перед важливими подіями", ru: "⚠ После процедуры возможны синяки и папулы — планируйте с запасом времени перед важными событиями", en: "⚠ Bruising and papules are possible — plan sessions well before important events" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки триває ефект від мезотерапії обличчя?", ru: "Сколько длится эффект от мезотерапии лица?", en: "How long do facial mesotherapy results last?" },
        answer: { uk: "Ефект від одного сеансу мезотерапії обличчя помітний протягом 2–4 тижнів. Після повного курсу з 4–6 процедур стійке покращення кольору, зволоженості та текстури шкіри зберігається 4–6 місяців. Для підтримання результату рекомендуються підтримуючі сеанси раз на 2–3 місяці.", ru: "Эффект от одного сеанса мезотерапии лица заметен в течение 2–4 недель. После полного курса из 4–6 процедур стойкое улучшение цвета, увлажнённости и текстуры кожи сохраняется 4–6 месяцев. Для поддержания результата рекомендуются поддерживающие сеансы раз в 2–3 месяца.", en: "The effect of a single facial mesotherapy session is visible for 2–4 weeks. After a full course of 4–6 procedures, lasting improvement in skin colour, hydration, and texture is maintained for 4–6 months. Maintenance sessions every 2–3 months are recommended." },
      },
      {
        question: { uk: "Чи болюча процедура мезотерапії?", ru: "Болезненна ли процедура мезотерапии?", en: "Is mesotherapy painful?" },
        answer: { uk: "Відчуття під час процедури мезотерапії — легке поколювання. Завдяки аплікаційній анестезії більшість пацієнтів переносять ін'єкції мезотерапії комфортно. Найчутливіші зони — навколо очей і губ. Деякі коктейлі вже містять лідокаїн, що додатково знижує дискомфорт.", ru: "Ощущения во время процедуры мезотерапии — лёгкое покалывание. Благодаря аппликационной анестезии большинство пациентов переносят инъекции мезотерапии комфортно. Наиболее чувствительные зоны — вокруг глаз и губ. Некоторые коктейли уже содержат лидокаин, что дополнительно снижает дискомфорт.", en: "Sensations during mesotherapy are mild pricking. With topical anaesthesia, most patients find mesotherapy injections comfortable. The most sensitive zones are around the eyes and lips. Some cocktails already contain lidocaine, further reducing discomfort." },
      },
      {
        question: { uk: "Скільки сеансів мезотерапії необхідно для досягнення результату?", ru: "Сколько сеансов мезотерапии необходимо для достижения результата?", en: "How many mesotherapy sessions are needed?" },
        answer: { uk: "Стандартний курс мезотерапії — 4–6 процедур з інтервалом 10–14 днів. Перший помітний результат зазвичай з'являється після 2–3-ї процедури. Для корекції пігментації або акне курс може складати 6–8 процедур. Після завершення курсу рекомендуються підтримуючі сеанси раз на 2–3 місяці.", ru: "Стандартный курс мезотерапии — 4–6 процедур с интервалом 10–14 дней. Первый заметный результат обычно появляется после 2–3-й процедуры. Для коррекции пигментации или акне курс может составлять 6–8 процедур. После завершения курса рекомендуются поддерживающие сеансы раз в 2–3 месяца.", en: "The standard mesotherapy course is 4–6 sessions at 10–14 day intervals. The first noticeable result typically appears after the 2nd or 3rd session. For pigmentation or acne correction, the course may be 6–8 sessions. Maintenance sessions every 2–3 months are recommended after completing the course." },
      },
      {
        question: { uk: "Чи можна поєднувати мезотерапію з іншими косметологічними процедурами?", ru: "Можно ли сочетать мезотерапию с другими косметологическими процедурами?", en: "Can mesotherapy be combined with other cosmetic procedures?" },
        answer: { uk: "Так. Мезотерапія добре поєднується з біоревіталізацією, пілінгами та апаратними методиками. З ботулінотерапією або філерами — через 2 тижні після або до. З лазерними процедурами та RF-ліфтингом — інтервал 2–4 тижні. Лікар підбирає оптимальну послідовність на консультації.", ru: "Да. Мезотерапия хорошо сочетается с биоревитализацией, пилингами и аппаратными методиками. С ботулинотерапией или филлерами — через 2 недели после или до. С лазерными процедурами и RF-лифтингом — интервал 2–4 недели. Врач подбирает оптимальную последовательность на консультации.", en: "Yes. Mesotherapy combines well with biorevitalisation, peels, and device-based treatments. With botulinum therapy or fillers — 2 weeks before or after. With laser procedures and RF lifting — a 2–4 week interval. The doctor selects the optimal sequence at consultation." },
      },
    ],
  },

  // ─── 5. PRP-ТЕРАПІЯ ──────────────────────────────────────────────────────
  {
    slug: "prp-therapy",
    summary: {
      uk: "PRP-терапія (плазмоліфтинг) в GENEVITY — введення збагаченої тромбоцитами плазми власної крові для відновлення шкіри, стимуляції колагену та лікування випадіння волосся. Дніпро.",
      ru: "PRP-терапия (плазмолифтинг) в GENEVITY — введение обогащённой тромбоцитами плазмы собственной крови для восстановления кожи, стимуляции коллагена и лечения выпадения волос. Днепр.",
      en: "PRP therapy (plasmolift) at GENEVITY — platelet-rich plasma injections from your own blood to restore skin, stimulate collagen, and treat hair loss. Dnipro.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "PRP-терапія — плазмоліфтинг власною кров'ю для омолодження та відновлення",
          ru: "PRP-терапия — плазмолифтинг собственной кровью для омоложения и восстановления",
          en: "PRP Therapy — Platelet-Rich Plasma for Rejuvenation and Restoration",
        },
        body: {
          uk: "PRP-терапія (Platelet-Rich Plasma) — це процедура введення концентрату тромбоцитів, виділеного з власної крові пацієнта, в зону, що потребує відновлення. Тромбоцити містять фактори росту (PDGF, TGF-β, VEGF, EGF), які запускають природні механізми регенерації: стимулюють проліферацію фібробластів, синтез колагену та еластину, неоваскуляризацію тканин.\n\nPRP-терапія для обличчя показана при зневодненні, тьмяності, втраті тонусу, а також при постакне і рубцях. Плазмоліфтинг активно застосовується в трихології для лікування андрогенної алопеції та дифузного випадіння волосся — ін'єкції PRP у шкіру голови стимулюють сплячі фолікули і подовжують анагенну фазу.\n\nПроцедура повністю біосумісна, оскільки використовується власний матеріал пацієнта — ризик алергічних реакцій виключений. У день процедури забирається 10–20 мл крові, яка центрифугується для відокремлення збагаченої тромбоцитами плазми. Концентрат вводиться в зону обробки мікроін'єкціями або за допомогою мікроголок.\n\nПереваги та недоліки PRP-терапії: натуральність і безпека — головна перевага; необхідність кількох сеансів і болісність процедури без анестезії — недоліки, які усуваються правильною підготовкою. Ціна плазмотерапії включає вартість матеріалів та часу лікаря — уточнюйте на консультації.",
          ru: "PRP-терапия (Platelet-Rich Plasma) — это процедура введения концентрата тромбоцитов, выделенного из собственной крови пациента, в зону, требующую восстановления. Тромбоциты содержат факторы роста (PDGF, TGF-β, VEGF, EGF), которые запускают естественные механизмы регенерации: стимулируют пролиферацию фибробластов, синтез коллагена и эластина, неоваскуляризацию тканей.\n\nPRP-терапия для лица показана при обезвоживании, тусклости, потере тонуса, а также при постакне и рубцах. Плазмолифтинг активно применяется в трихологии для лечения андрогенной алопеции — инъекции PRP в кожу головы стимулируют спящие фолликулы и продлевают анагенную фазу.\n\nПроцедура полностью биосовместима, поскольку используется собственный материал пациента — риск аллергических реакций исключён. В день процедуры берётся 10–20 мл крови, которая центрифугируется для отделения обогащённой тромбоцитами плазмы. Концентрат вводится в зону обработки микроинъекциями.",
          en: "PRP therapy (Platelet-Rich Plasma) involves injecting a platelet concentrate derived from the patient's own blood into the area requiring restoration. Platelets contain growth factors (PDGF, TGF-β, VEGF, EGF) that activate natural regeneration: they stimulate fibroblast proliferation, collagen and elastin synthesis, and tissue neovascularisation.\n\nFacial PRP therapy is indicated for dehydration, dullness, loss of tone, post-acne, and scars. Plasmolift is actively used in trichology for androgenic alopecia — scalp PRP injections stimulate dormant follicles and extend the anagen phase.\n\nThe procedure is fully biocompatible since the patient's own material is used — allergic reactions are excluded. On the day of the procedure, 10–20 ml of blood is drawn and centrifuged to separate platelet-rich plasma. The concentrate is injected into the treatment zone via micro-injections.",
        },
        calloutBody: {
          uk: "Власна плазма — нульовий ризик відторгнення та алергії. Природна регенерація без сторонніх речовин.",
          ru: "Собственная плазма — нулевой риск отторжения и аллергии. Естественная регенерация без посторонних веществ.",
          en: "Your own plasma — zero risk of rejection or allergy. Natural regeneration without foreign substances.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до PRP-терапії", ru: "Показания к PRP-терапии", en: "Indications for PRP Therapy" },
        indications: [
          { uk: "Зневоднення, тьмяність та втрата тонусу шкіри обличчя", ru: "Обезвоживание, тусклость и потеря тонуса кожи лица", en: "Facial skin dehydration, dullness, and loss of tone" },
          { uk: "Постакне, рубці та нерівна текстура шкіри", ru: "Постакне, рубцы и неровная текстура кожи", en: "Post-acne, scars, and uneven skin texture" },
          { uk: "Андрогенна алопеція та дифузне випадіння волосся", ru: "Андрогенная алопеция и диффузное выпадение волос", en: "Androgenic alopecia and diffuse hair loss" },
          { uk: "Реабілітація шкіри після лазерних та апаратних процедур", ru: "Реабилитация кожи после лазерных и аппаратных процедур", en: "Skin recovery after laser and device-based procedures" },
          { uk: "Загальне омолодження та покращення якості шкіри 35+", ru: "Общее омоложение и улучшение качества кожи 35+", en: "General rejuvenation and skin quality improvement 35+" },
        ],
        contraindicationsHeading: { uk: "Протипоказання до PRP-терапії", ru: "Противопоказания к PRP-терапии", en: "Contraindications for PRP Therapy" },
        contraindications: [
          { uk: "⚠ Тромбоцитопенія та порушення функції тромбоцитів", ru: "⚠ Тромбоцитопения и нарушение функции тромбоцитов", en: "⚠ Thrombocytopenia and platelet dysfunction" },
          { uk: "⚠ Прийом антикоагулянтів та антиагрегантів", ru: "⚠ Приём антикоагулянтов и антиагрегантов", en: "⚠ Anticoagulant and antiplatelet medication use" },
          { uk: "⚠ Онкологічні захворювання (особливо гематологічні)", ru: "⚠ Онкологические заболевания (особенно гематологические)", en: "⚠ Malignancies (especially haematological)" },
          { uk: "⚠ Активні інфекційні захворювання, гарячка", ru: "⚠ Активные инфекционные заболевания, лихорадка", en: "⚠ Active infectious diseases, fever" },
          { uk: "⚠ Вагітність і грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Анемія (рівень гемоглобіну нижче 100 г/л)", ru: "⚠ Анемия (уровень гемоглобина ниже 100 г/л)", en: "⚠ Anaemia (haemoglobin below 100 g/L)" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Процедура проведення плазмотерапії", ru: "Процедура проведения плазмотерапии", en: "PRP Plasmotherapy Procedure" },
        steps: [
          { title: { uk: "Забір крові", ru: "Забор крови", en: "Blood draw" }, description: { uk: "З вени пацієнта забирається 10–20 мл крові у спеціальні пробірки з антикоагулянтом. Процедура аналогічна звичайному аналізу крові.", ru: "Из вены пациента берётся 10–20 мл крови в специальные пробирки с антикоагулянтом. Процедура аналогична обычному анализу крови.", en: "10–20 ml of blood is drawn from the patient's vein into special anticoagulant tubes — identical to a routine blood test." } },
          { title: { uk: "Центрифугування", ru: "Центрифугирование", en: "Centrifugation" }, description: { uk: "Пробірки поміщаються в центрифугу на 8–12 хвилин. Під дією відцентрової сили кров поділяється на фракції — виділяється збагачена тромбоцитами плазма.", ru: "Пробирки помещаются в центрифугу на 8–12 минут. Под действием центробежной силы кровь разделяется на фракции — выделяется обогащённая тромбоцитами плазма.", en: "Tubes are placed in a centrifuge for 8–12 minutes. Centrifugal force separates blood into fractions — platelet-rich plasma is extracted." } },
          { title: { uk: "Введення PRP", ru: "Введение PRP", en: "PRP injection" }, description: { uk: "Після нанесення анестетика плазма вводиться мікроін'єкціями або за допомогою мікроголок (дермаролер) у шкіру обличчя або шкіру голови. Тривалість — 20–40 хвилин.", ru: "После нанесения анестетика плазма вводится микроинъекциями или с помощью микроигл (дермаролер) в кожу лица или кожу головы. Продолжительность — 20–40 минут.", en: "After anaesthetic application, plasma is delivered via micro-injections or a micro-needle roller into the facial skin or scalp. Duration: 20–40 minutes." } },
          { title: { uk: "Відновлення", ru: "Восстановление", en: "Recovery" }, description: { uk: "24–48 годин уникайте фізичного навантаження, алкоголю та сауни. Можлива легка гіперемія та набряклість — проходить за 24 години. Для волосся — не мийте голову 24 год після процедури.", ru: "24–48 часов избегайте физических нагрузок, алкоголя и сауны. Возможна лёгкая гиперемия и отёчность — проходит за 24 часа. Для волос — не мойте голову 24 ч после процедуры.", en: "Avoid exercise, alcohol, and sauna for 24–48 hours. Mild redness and swelling possible — resolves within 24 hours. For scalp treatments — do not wash hair for 24 hours after the procedure." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та недоліки PRP-терапії", ru: "Преимущества и недостатки PRP-терапии", en: "Advantages and Disadvantages of PRP Therapy" },
        items: [
          { uk: "Повна біосумісність — власна плазма, нульовий ризик алергії та відторгнення", ru: "Полная биосовместимость — собственная плазма, нулевой риск аллергии и отторжения", en: "Full biocompatibility — own plasma, zero risk of allergy or rejection" },
          { uk: "Комплексний ефект: омолодження, зволоження та регенерація одночасно", ru: "Комплексный эффект: омоложение, увлажнение и регенерация одновременно", en: "Combined effect: rejuvenation, hydration, and regeneration simultaneously" },
          { uk: "Ефективне лікування випадіння волосся — стимулює фолікули без хімічних препаратів", ru: "Эффективное лечение выпадения волос — стимулирует фолликулы без химических препаратов", en: "Effective hair loss treatment — stimulates follicles without chemical products" },
          { uk: "⚠ Ефект накопичувальний — для стійкого результату потрібно 3–4 сеанси", ru: "⚠ Эффект накопительный — для стойкого результата необходимо 3–4 сеанса", en: "⚠ Cumulative effect — 3–4 sessions needed for lasting results" },
          { uk: "⚠ Болісність без анестезії — обов'язково попросіть нанести аплікаційний крем перед процедурою", ru: "⚠ Болезненность без анестезии — обязательно попросите нанести аппликационный крем перед процедурой", en: "⚠ Painful without anaesthesia — always request topical cream before the procedure" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки триває ефект від PRP-терапії?", ru: "Сколько длится эффект от PRP-терапии?", en: "How long do PRP therapy results last?" },
        answer: { uk: "Ефект від курсу PRP-терапії (3–4 сеанси з інтервалом 3–4 тижні) зберігається від 6 до 12 місяців. При лікуванні випадіння волосся результат помітний через 3–6 місяців після початку курсу і утримується 12–18 місяців при регулярних підтримуючих процедурах раз на рік.", ru: "Эффект от курса PRP-терапии (3–4 сеанса с интервалом 3–4 недели) сохраняется от 6 до 12 месяцев. При лечении выпадения волос результат заметен через 3–6 месяцев после начала курса и удерживается 12–18 месяцев при регулярных поддерживающих процедурах раз в год.", en: "Results from a PRP therapy course (3–4 sessions at 3–4 week intervals) last 6–12 months. For hair loss treatment, results become visible 3–6 months after starting the course and are maintained for 12–18 months with annual maintenance sessions." },
      },
      {
        question: { uk: "Чи болісна процедура PRP-терапії?", ru: "Болезненна ли процедура PRP-терапии?", en: "Is PRP therapy painful?" },
        answer: { uk: "Без анестезії PRP-ін'єкції досить болісні через щільність введень. В GENEVITY обов'язково наноситься аплікаційний знеболювальний крем за 30–40 хвилин до процедури — це робить її комфортною для більшості пацієнтів. Після процедури можливе відчуття тепла та невеликої напруженості в зоні введення.", ru: "Без анестезии PRP-инъекции достаточно болезненны из-за плотности введений. В GENEVITY обязательно наносится аппликационный обезболивающий крем за 30–40 минут до процедуры — это делает её комфортной для большинства пациентов.", en: "Without anaesthesia, PRP injections are quite painful due to the density of injection points. At GENEVITY, topical anaesthetic cream is always applied 30–40 minutes before the procedure — this makes it comfortable for most patients." },
      },
      {
        question: { uk: "Скільки сеансів PRP-терапії необхідно для досягнення результату?", ru: "Сколько сеансов PRP-терапии необходимо для достижения результата?", en: "How many PRP sessions are needed?" },
        answer: { uk: "Стандартний курс — 3–4 сеанси з інтервалом 3–4 тижні. Перші помітні результати зазвичай з'являються після 2-го сеансу. При лікуванні випадіння волосся курс може становити 4–6 процедур. Для підтримання результату — 1–2 сеанси на рік.", ru: "Стандартный курс — 3–4 сеанса с интервалом 3–4 недели. Первые заметные результаты обычно появляются после 2-го сеанса. При лечении выпадения волос курс может составлять 4–6 процедур. Для поддержания результата — 1–2 сеанса в год.", en: "The standard course is 3–4 sessions at 3–4 week intervals. First noticeable results typically appear after the 2nd session. For hair loss treatment, the course may be 4–6 procedures. Maintenance: 1–2 sessions per year." },
      },
      {
        question: { uk: "Чи можна поєднувати PRP-терапію з іншими косметологічними процедурами?", ru: "Можно ли сочетать PRP-терапию с другими косметологическими процедурами?", en: "Can PRP therapy be combined with other cosmetic procedures?" },
        answer: { uk: "Так. PRP відмінно поєднується з мезотерапією, біоревіталізацією та мікронідлінгом — їх часто проводять в один день. З апаратними та лазерними процедурами рекомендується інтервал 2–4 тижні. PRP також використовується як прискорювач загоєння після агресивних лазерних шліфовок.", ru: "Да. PRP отлично сочетается с мезотерапией, биоревитализацией и микронидлингом — их часто проводят в один день. С аппаратными и лазерными процедурами рекомендуется интервал 2–4 недели. PRP также используется как ускоритель заживления после агрессивных лазерных шлифовок.", en: "Yes. PRP combines excellently with mesotherapy, biorevitalisation, and microneedling — they are often performed on the same day. A 2–4 week interval is recommended before device-based and laser procedures. PRP is also used as a healing accelerator after aggressive laser resurfacing." },
      },
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
  console.log("\nTZ-v1 injectable-A DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
