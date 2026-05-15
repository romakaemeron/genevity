/**
 * V4-injectable-a — botulinum-therapy, biorevitalisation, mesotherapy, exosomes, contour-plasty
 * Re-seeds with section variety: richText + indicationsContraindications + steps + bullets
 * Run: npx tsx scripts/seed-copy-v4-injectable-a.ts
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
type IndicationsSection = { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] };
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
  // ─── BOTULINUM THERAPY ────────────────────────────────────────────────────
  {
    slug: "botulinum-therapy",
    summary: {
      uk: "Ботулінотерапія у GENEVITY — точні ін'єкції ботулотоксину типу A для розгладження динамічних зморшок, корекції гіпергідрозу та бруксизму. Ефект до 6 місяців, без реабілітаційного periodу.",
      ru: "Ботулинотерапия в GENEVITY — точные инъекции ботулотоксина типа А для разглаживания динамических морщин, коррекции гипергидроза и бруксизма. Эффект до 6 месяцев, без реабилитационного периода.",
      en: "Botulinum therapy at GENEVITY — precise botulinum toxin type A injections for smoothing dynamic wrinkles, correcting hyperhidrosis and bruxism. Effect up to 6 months, no downtime.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Ботулінотерапія — механізм дії та препарати", ru: "Ботулинотерапия — механизм действия и препараты", en: "Botulinum Therapy — Mechanism and Preparations" },
        body: {
          uk: "Ботулотоксин типу A — нейропептид, що блокує передачу нервового імпульсу до м'яза у зоні ін'єкції. М'яз тимчасово розслаблюється, і шкіра над ним розгладжується. Ефект оборотний: через 4–6 місяців нервово-м'язова передача відновлюється повністю. У GENEVITY використовують сертифіковані препарати: Botox (Allergan), Dysport (Ipsen) та Xeomin (Merz) — усі мають доведену клінічну ефективність і профіль безпеки. Ботулінотерапія ефективна не лише для косметичних задач — вона застосовується при бруксизмі (скрегіт зубами), гіпергідрозі (надмірне потовиділення пахв, долонь, стоп), мігрені та м'язовому гіпертонусі. У кожному випадку лікар калькулює одиниці та точки ін'єкцій індивідуально.",
          ru: "Ботулотоксин типа А — нейропептид, блокирующий передачу нервного импульса к мышце в зоне инъекции. Мышца временно расслабляется, и кожа над ней разглаживается. Эффект обратим: через 4–6 месяцев нервно-мышечная передача восстанавливается полностью. В GENEVITY используют сертифицированные препараты: Botox (Allergan), Dysport (Ipsen) и Xeomin (Merz) — все имеют доказанную клиническую эффективность и профиль безопасности. Ботулинотерапия эффективна не только для косметических задач — она применяется при бруксизме (скрежет зубами), гипергидрозе (избыточное потоотделение подмышек, ладоней, стоп), мигрени и мышечном гипертонусе. В каждом случае врач рассчитывает единицы и точки инъекций индивидуально.",
          en: "Botulinum toxin type A is a neuropeptide that blocks nerve impulse transmission to the muscle in the injection zone. The muscle temporarily relaxes, and the skin above it smooths out. The effect is reversible: neuromuscular transmission is fully restored in 4–6 months. GENEVITY uses certified preparations: Botox (Allergan), Dysport (Ipsen), and Xeomin (Merz) — all with proven clinical efficacy and safety profiles. Botulinum therapy is effective not only for cosmetic goals — it is used for bruxism (teeth grinding), hyperhidrosis (excessive sweating of armpits, palms, feet), migraine, and muscle hypertonicity. In each case the physician calculates units and injection points individually.",
        },
        calloutBody: {
          uk: "Правило GENEVITY: жоден протокол не є стандартним. Кількість одиниць і розміщення ін'єкцій розраховується після аналізу мімічного патерну конкретного пацієнта — щоб уникнути «замороженого» обличчя і зберегти природну виразність.",
          ru: "Правило GENEVITY: ни один протокол не является стандартным. Количество единиц и расположение инъекций рассчитывается после анализа мимического паттерна конкретного пациента — чтобы избежать «замороженного» лица и сохранить естественную выразительность.",
          en: "GENEVITY rule: no protocol is standard. Units and injection placement are calculated after analyzing each patient's facial expression pattern — to avoid the 'frozen face' effect and preserve natural expressiveness.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до ботулінотерапії", ru: "Показания к ботулинотерапии", en: "Indications for Botulinum Therapy" },
        indications: [
          { uk: "Горизонтальні зморшки на лобі та зморшки «кролика»", ru: "Горизонтальные морщины на лбу и морщины «кролика»", en: "Horizontal forehead wrinkles and 'bunny lines'" },
          { uk: "Міжбрівні зморшки (зона гляболи)", ru: "Межбровные морщины (зона глабеллы)", en: "Glabellar lines (frown lines)" },
          { uk: "«Гусячі лапки» — зморшки у зовнішніх кутах очей", ru: "«Гусиные лапки» — морщины в наружных уголках глаз", en: "Crow's feet — wrinkles at the outer eye corners" },
          { uk: "Гіпергідроз пахв, долонь і стоп", ru: "Гипергидроз подмышек, ладоней и стоп", en: "Axillary, palmar, and plantar hyperhidrosis" },
          { uk: "Бруксизм і гіпертрофія жувального м'яза (зменшення об'єму нижньої третини)", ru: "Бруксизм и гипертрофия жевательной мышцы (уменьшение объёма нижней трети)", en: "Bruxism and masseter hypertrophy (lower face volume reduction)" },
          { uk: "Профілактичне введення для уповільнення мімічної пам'яті у 25–35 років", ru: "Профилактическое введение для замедления мимической памяти в 25–35 лет", en: "Preventive injections to slow facial muscle memory at ages 25–35" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Міастенія та нейром'язові захворювання", ru: "Миастения и нервно-мышечные заболевания", en: "Myasthenia gravis and neuromuscular disorders" },
          { uk: "Прийом антикоагулянтів і аспірину (підвищений ризик синців)", ru: "Приём антикоагулянтов и аспирина (повышенный риск синяков)", en: "Anticoagulants and aspirin use (elevated bruising risk)" },
          { uk: "Гострі інфекції та запалення у зоні ін'єкцій", ru: "Острые инфекции и воспаления в зоне инъекций", en: "Acute infections and inflammation in the injection area" },
          { uk: "Алергія на компоненти препарату", ru: "Аллергия на компоненты препарата", en: "Allergy to preparation components" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура ботулінотерапії", ru: "Как проходит процедура ботулинотерапии", en: "Botulinum Therapy Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація та мімічний аналіз", ru: "Консультация и мимический анализ", en: "Consultation and Facial Analysis" },
            description: { uk: "Лікар просить напружити цільові м'язи, фіксує патерн зморшок і розраховує зони та кількість одиниць.", ru: "Врач просит напрячь целевые мышцы, фиксирует паттерн морщин и рассчитывает зоны и количество единиц.", en: "The physician asks the patient to contract target muscles, maps the wrinkle pattern, and calculates zones and units." },
          },
          {
            title: { uk: "Підготовка: очищення та розмітка точок", ru: "Подготовка: очищение и разметка точек", en: "Preparation: Cleansing and Point Marking" },
            description: { uk: "Шкіру знежирюють, наносять розмітку точок ін'єкцій. Анестезія зазвичай не потрібна — голки дуже тонкі.", ru: "Кожу обезжиривают, наносят разметку точек инъекций. Анестезия обычно не нужна — иглы очень тонкие.", en: "Skin is degreased, injection points are marked. Anesthesia is usually not needed — needles are very fine." },
          },
          {
            title: { uk: "Ін'єкції ботулотоксину", ru: "Инъекции ботулотоксина", en: "Botulinum Toxin Injections" },
            description: { uk: "Лікар вводить препарат у розраховані точки. Процедура займає 10–20 хвилин. Відчуття — легкі поколювання.", ru: "Врач вводит препарат в рассчитанные точки. Процедура занимает 10–20 минут. Ощущения — лёгкие покалывания.", en: "The physician injects the preparation into calculated points. The procedure takes 10–20 minutes. Sensation: mild pinching." },
          },
          {
            title: { uk: "Обмеження і контрольний огляд", ru: "Ограничения и контрольный осмотр", en: "Post-Injection Restrictions and Follow-up" },
            description: { uk: "4 години не лягати, не масажувати зону, не займатися спортом. Контрольний огляд через 14 днів для корекції за потреби.", ru: "4 часа не ложиться, не массажировать зону, не заниматься спортом. Контрольный осмотр через 14 дней для коррекции при необходимости.", en: "For 4 hours: don't lie down, massage the area, or exercise. Follow-up in 14 days for correction if needed." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості ботулінотерапії", ru: "Преимущества и особенности ботулинотерапии", en: "Botulinum Therapy Advantages and Considerations" },
        items: [
          { uk: "Видимий результат через 3–7 днів, максимальний ефект — через 14 днів", ru: "Видимый результат через 3–7 дней, максимальный эффект — через 14 дней", en: "Visible results in 3–7 days, maximum effect at 14 days" },
          { uk: "Ефект зберігається 4–6 місяців, після регулярних процедур — довше", ru: "Эффект сохраняется 4–6 месяцев, после регулярных процедур — дольше", en: "Effect lasts 4–6 months, longer with regular procedures" },
          { uk: "Немає реабілітаційного periodу — повертайтеся до роботи одразу", ru: "Нет реабилитационного периода — возвращайтесь к работе сразу", en: "No downtime — return to work immediately" },
          { uk: "Ефективно не лише для зовнішності: лікує гіпергідроз і бруксизм", ru: "Эффективно не только для внешности: лечит гипергидроз и бруксизм", en: "Effective not only cosmetically: treats hyperhidrosis and bruxism" },
          { uk: "⚠ Ефект тимчасовий — потрібне повторення кожні 4–6 місяців", ru: "⚠ Эффект временный — нужно повторение каждые 4–6 месяцев", en: "⚠ Effect is temporary — repetition every 4–6 months is needed" },
          { uk: "⚠ Невдала техніка дає птоз брови або повіки — вибирайте досвідченого лікаря", ru: "⚠ Неудачная техника даёт птоз брови или века — выбирайте опытного врача", en: "⚠ Poor technique causes brow or eyelid ptosis — choose an experienced physician" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Боляче?", ru: "Больно?", en: "Is it painful?" },
        answer: { uk: "Ні. Голки для ботулінотерапії надтонкі — 30–33G. Відчуття — легке поколювання. При підвищеній чутливості наносять крем-анестетик.", ru: "Нет. Иглы для ботулинотерапии сверхтонкие — 30–33G. Ощущения — лёгкое покалывание. При повышенной чувствительности наносят крем-анестетик.", en: "No. Needles for botulinum therapy are ultra-thin — 30–33G. Sensation: mild pinching. A numbing cream is applied for high sensitivity." },
      },
      {
        question: { uk: "Через скільки днів буде помітний ефект?", ru: "Через сколько дней будет заметен эффект?", en: "How many days until the effect is visible?" },
        answer: { uk: "Перші зміни — через 3–5 днів. Повний ефект розкривається до 14-го дня. Тому контрольний огляд проводять через 2 тижні.", ru: "Первые изменения — через 3–5 дней. Полный эффект раскрывается к 14-му дню. Поэтому контрольный осмотр проводят через 2 недели.", en: "First changes in 3–5 days. Full effect by day 14. That is why the follow-up visit is at 2 weeks." },
      },
      {
        question: { uk: "Чи можна поєднувати з філерами?", ru: "Можно ли совмещать с филлерами?", en: "Can it be combined with fillers?" },
        answer: { uk: "Так, це класична комбінація — ботулінотерапія розслаблює м'язи, філери відновлюють об'єм. Зазвичай спочатку ботулотоксин, потім через 2 тижні — контурна пластика.", ru: "Да, это классическая комбинация — ботулинотерапия расслабляет мышцы, филлеры восстанавливают объём. Обычно сначала ботулотоксин, потом через 2 недели — контурная пластика.", en: "Yes, it is a classic combination — botulinum therapy relaxes muscles, fillers restore volume. Usually botulinum toxin first, then contouring 2 weeks later." },
      },
      {
        question: { uk: "Що буде, якщо перестати робити процедуру?", ru: "Что будет, если перестать делать процедуру?", en: "What happens if I stop the procedure?" },
        answer: { uk: "Ефект просто зникне — шкіра повернеться до попереднього стану. Залежності не виникає, зморшки не поглиблюються.", ru: "Эффект просто исчезнет — кожа вернётся к прежнему состоянию. Зависимости не возникает, морщины не углубляются.", en: "The effect simply fades — skin returns to its prior state. No dependency occurs and wrinkles do not deepen." },
      },
      {
        question: { uk: "Чи можна робити при гіпергідрозі?", ru: "Можно ли делать при гипергидрозе?", en: "Is it effective for hyperhidrosis?" },
        answer: { uk: "Так, це медично підтверджений метод лікування гіпергідрозу. Ефект при введенні у підпахвові зони — до 8–12 місяців. Потовиділення у зоні знижується на 80–95%.", ru: "Да, это медицински подтверждённый метод лечения гипергидроза. Эффект при введении в подмышечные зоны — до 8–12 месяцев. Потоотделение в зоне снижается на 80–95%.", en: "Yes, it is a medically proven hyperhidrosis treatment. Effect when injected into axillary zones: up to 8–12 months. Sweating in the area reduces by 80–95%." },
      },
    ],
  },

  // ─── BIOREVITALISATION ────────────────────────────────────────────────────
  {
    slug: "biorevitalisation",
    summary: {
      uk: "Біоревіталізація у GENEVITY — ін'єкції гіалуронової кислоти у дерму для глибокого зволоження, відновлення пружності і стимуляції неоколагеногенезу. Препарати Juvederm Hydrate, Restylane Vital, Belotero Hydro за показаннями лікаря.",
      ru: "Биоревитализация в GENEVITY — инъекции гиалуроновой кислоты в дерму для глубокого увлажнения, восстановления упругости и стимуляции неоколлагеногенеза. Препараты Juvederm Hydrate, Restylane Vital, Belotero Hydro по показаниям врача.",
      en: "Biorevitalisation at GENEVITY — hyaluronic acid injections into the dermis for deep hydration, elasticity restoration, and neocollagenogenesis stimulation. Juvederm Hydrate, Restylane Vital, Belotero Hydro as indicated by the physician.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Біоревіталізація — глибоке зволоження зсередини", ru: "Биоревитализация — глубокое увлажнение изнутри", en: "Biorevitalisation — Deep Hydration from Within" },
        body: {
          uk: "Біоревіталізація — це введення нативної незшитої гіалуронової кислоти безпосередньо у дерму. На відміну від топічних засобів, молекули ГК, введені ін'єкційно, не можуть проникнути крізь роговий шар. Ін'єкційний метод долає цей бар'єр і доставляє ГК точно в цільовий шар. Гіалуронова кислота — «губка» для води: одна молекула ГК зв'язує до 1000 молекул води. Це забезпечує тривале депо вологи у дермі. Крім того, ГК виступає сигнальною молекулою: її присутність стимулює власні фібробласти до синтезу нових волокон колагену і еластину — процес неоколагеногенезу. Результат: шкіра стає пружнішою, дрібні зморшки розгладжуються, сіруватий тьмяний тон зникає вже після першої процедури.",
          ru: "Биоревитализация — это введение нативной несшитой гиалуроновой кислоты непосредственно в дерму. В отличие от топических средств, молекулы ГК, введённые инъекционно, не могут проникнуть через роговой слой. Инъекционный метод преодолевает этот барьер и доставляет ГК точно в целевой слой. Гиалуроновая кислота — «губка» для воды: одна молекула ГК связывает до 1000 молекул воды. Это обеспечивает длительное депо влаги в дерме. Кроме того, ГК выступает сигнальной молекулой: её присутствие стимулирует собственные фибробласты к синтезу новых волокон коллагена и эластина — процесс неоколлагеногенеза. Результат: кожа становится упругее, мелкие морщины разглаживаются, сероватый тусклый тон исчезает уже после первой процедуры.",
          en: "Biorevitalisation is the injection of native non-crosslinked hyaluronic acid directly into the dermis. Unlike topical products, HA molecules injected this way bypass the stratum corneum barrier and reach the target layer precisely. Hyaluronic acid is a water 'sponge': one HA molecule binds up to 1,000 water molecules, creating a lasting moisture depot in the dermis. HA also acts as a signaling molecule: its presence stimulates fibroblasts to synthesize new collagen and elastin fibers — neocollagenogenesis. The result: firmer skin, smoothed fine lines, and the dull greyish tone disappears after the very first session.",
        },
        calloutBody: {
          uk: "Біоревіталізація — базова процедура в програмах антивікового догляду GENEVITY. Рекомендована двічі на рік як підтримка для шкіри будь-якого віку від 25 років.",
          ru: "Биоревитализация — базовая процедура в программах антивозрастного ухода GENEVITY. Рекомендована дважды в год как поддержка для кожи любого возраста от 25 лет.",
          en: "Biorevitalisation is the foundational procedure in GENEVITY anti-aging programs. Recommended twice a year as maintenance for any skin age 25 and older.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до біоревіталізації", ru: "Показания к биоревитализации", en: "Indications for Biorevitalisation" },
        indications: [
          { uk: "Зневоднена та суха шкіра будь-якого типу і віку", ru: "Обезвоженная и сухая кожа любого типа и возраста", en: "Dehydrated and dry skin of any type and age" },
          { uk: "Тьмяний, нерівний тон і перша сіруватість", ru: "Тусклый, неровный тон и первая сероватость", en: "Dull, uneven tone and early grey cast" },
          { uk: "Дрібні зморшки і поверхневі лінії зневоднення", ru: "Мелкие морщины и поверхностные линии обезвоживания", en: "Fine lines and superficial dehydration lines" },
          { uk: "Підготовка шкіри перед лазерними та апаратними процедурами", ru: "Подготовка кожи перед лазерными и аппаратными процедурами", en: "Skin preparation before laser and device procedures" },
          { uk: "Відновлення після агресивних пілінгів та лазерного шліфування", ru: "Восстановление после агрессивных пилингов и лазерного шлифования", en: "Recovery after aggressive peels and laser resurfacing" },
          { uk: "Профілактика вікових змін у 25–35 років", ru: "Профилактика возрастных изменений в 25–35 лет", en: "Prevention of age-related changes at 25–35 years" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Активні запальні та інфекційні процеси у зоні ін'єкцій", ru: "Активные воспалительные и инфекционные процессы в зоне инъекций", en: "Active inflammatory and infectious processes in the injection area" },
          { uk: "Схильність до гіпертрофічних рубців і келоїдів", ru: "Склонность к гипертрофическим рубцам и келоидам", en: "Tendency to hypertrophic scars and keloids" },
          { uk: "Алергія на ГК або компоненти препарату", ru: "Аллергия на ГК или компоненты препарата", en: "Allergy to HA or preparation components" },
          { uk: "Аутоімунні захворювання у стадії загострення", ru: "Аутоиммунные заболевания в стадии обострения", en: "Autoimmune diseases in acute stage" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура біоревіталізації", ru: "Как проходит процедура биоревитализации", en: "Biorevitalisation Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація та підбір препарату", ru: "Консультация и подбор препарата", en: "Consultation and Preparation Selection" },
            description: { uk: "Лікар оцінює тип і стан шкіри, ступінь зневоднення і обирає препарат ГК за молекулярною масою і концентрацією.", ru: "Врач оценивает тип и состояние кожи, степень обезвоживания и выбирает препарат ГК по молекулярной массе и концентрации.", en: "The physician assesses skin type and condition, dehydration level, and selects the HA preparation by molecular weight and concentration." },
          },
          {
            title: { uk: "Нанесення крему-анестетика", ru: "Нанесение крема-анестетика", en: "Anesthetic Cream Application" },
            description: { uk: "За 30 хвилин до ін'єкцій наносять EMLA — для максимального комфорту під час процедури.", ru: "За 30 минут до инъекций наносят EMLA — для максимального комфорта во время процедуры.", en: "EMLA is applied 30 minutes before injections for maximum comfort during the procedure." },
          },
          {
            title: { uk: "Мікропапульна техніка або лінійна інфузія", ru: "Микропапульная техника или линейная инфузия", en: "Micropapular Technique or Linear Infusion" },
            description: { uk: "Лікар вводить препарат у дерму серії мікроін'єкцій або лінійним методом залежно від зони. Процедура — 30–45 хвилин.", ru: "Врач вводит препарат в дерму серией микроинъекций или линейным методом в зависимости от зоны. Процедура — 30–45 минут.", en: "The physician injects the preparation into the dermis via micropapular series or linear method depending on the zone. Duration: 30–45 minutes." },
          },
          {
            title: { uk: "Постпроцедурний догляд", ru: "Постпроцедурный уход", en: "Post-Procedure Care" },
            description: { uk: "Наносять заспокійливу маску або крем. Уникайте макіяжу 24 год, алкоголю, сауни та активного спорту 48 год.", ru: "Наносят успокаивающую маску или крем. Избегайте макияжа 24 ч, алкоголя, сауны и активного спорта 48 ч.", en: "A soothing mask or cream is applied. Avoid makeup for 24h, alcohol, sauna, and strenuous exercise for 48h." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості біоревіталізації", ru: "Преимущества и особенности биоревитализации", en: "Biorevitalisation Advantages and Considerations" },
        items: [
          { uk: "Ефект помітний одразу: сяяння і зволоження після першої процедури", ru: "Эффект заметен сразу: сияние и увлажнение после первой процедуры", en: "Effect visible immediately: glow and hydration after the first session" },
          { uk: "Стимулює власний синтез колагену — ефект накопичується з кожною процедурою", ru: "Стимулирует собственный синтез коллагена — эффект накапливается с каждой процедурой", en: "Stimulates endogenous collagen synthesis — effect accumulates with each procedure" },
          { uk: "Підходить для обличчя, шиї, декольте і зони навколо очей", ru: "Подходит для лица, шеи, декольте и зоны вокруг глаз", en: "Suitable for face, neck, décolletage, and periorbital zone" },
          { uk: "Добре поєднується з ботулінотерапією і контурною пластикою", ru: "Хорошо сочетается с ботулинотерапией и контурной пластикой", en: "Works well in combination with botulinum therapy and contouring" },
          { uk: "⚠ Після ін'єкцій можливі папули і невеликі синці — минають за 24–72 год", ru: "⚠ После инъекций возможны папулы и небольшие синяки — проходят за 24–72 ч", en: "⚠ Post-injection papules and minor bruising are possible — resolve within 24–72h" },
          { uk: "⚠ Мінімальний курс — 3 процедури з інтервалом 3–4 тижні для стійкого ефекту", ru: "⚠ Минимальный курс — 3 процедуры с интервалом 3–4 недели для стойкого эффекта", en: "⚠ Minimum course — 3 procedures every 3–4 weeks for lasting effect" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Чим біоревіталізація відрізняється від мезотерапії?", ru: "Чем биоревитализация отличается от мезотерапии?", en: "How does biorevitalisation differ from mesotherapy?" },
        answer: { uk: "Біоревіталізація — моно-препарат ГК. Мезотерапія — коктейль вітамінів, мінералів, амінокислот, часто з малою дозою ГК. Різні задачі: біорев — глибоке зволоження і тургор, мезо — живлення, тонус і комплексна дія.", ru: "Биоревитализация — моно-препарат ГК. Мезотерапия — коктейль витаминов, минералов, аминокислот, часто с малой дозой ГК. Разные задачи: биорев — глубокое увлажнение и тургор, мезо — питание, тонус и комплексное действие.", en: "Biorevitalisation is a mono-HA preparation. Mesotherapy is a cocktail of vitamins, minerals, amino acids, often with a small HA dose. Different goals: biorev — deep hydration and turgor; meso — nourishment, tone, and multi-action." },
      },
      {
        question: { uk: "Скільки часу зберігається ефект?", ru: "Сколько времени сохраняется эффект?", en: "How long does the effect last?" },
        answer: { uk: "Після курсу з 3 процедур — 6–9 місяців. Рекомендована підтримувальна процедура двічі на рік.", ru: "После курса из 3 процедур — 6–9 месяцев. Рекомендуется поддерживающая процедура дважды в год.", en: "After a course of 3 procedures — 6–9 months. Maintenance procedure recommended twice a year." },
      },
      {
        question: { uk: "Чи помітні ін'єкції після процедури?", ru: "Заметны ли инъекции после процедуры?", en: "Are the injections visible after the procedure?" },
        answer: { uk: "Одразу після — маленькі горбики (папули) у точках введення. Вони зникають протягом 12–24 годин. Синці при мікропапульній техніці — рідкість, але можливі.", ru: "Сразу после — маленькие бугорки (папулы) в точках введения. Они исчезают в течение 12–24 часов. Синяки при микропапульной технике — редкость, но возможны.", en: "Immediately after — small bumps (papules) at injection points. They disappear within 12–24 hours. Bruising with micropapular technique is rare but possible." },
      },
    ],
  },

  // ─── MESOTHERAPY ──────────────────────────────────────────────────────────
  {
    slug: "mesotherapy",
    summary: {
      uk: "Мезотерапія обличчя у GENEVITY — ін'єкції вітамінних і пептидних коктейлів у мезодерму для активного живлення, зміцнення та тонізації шкіри. Підбір складу — персоналізовано після діагностики.",
      ru: "Мезотерапия лица в GENEVITY — инъекции витаминных и пептидных коктейлей в мезодерму для активного питания, укрепления и тонизации кожи. Подбор состава — персонализированно после диагностики.",
      en: "Facial mesotherapy at GENEVITY — vitamin and peptide cocktail injections into the mesoderm for active nourishment, strengthening, and toning of the skin. Composition selected personally after diagnosis.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Мезотерапія — ін'єкційне живлення шкіри", ru: "Мезотерапия — инъекционное питание кожи", en: "Mesotherapy — Injectable Skin Nourishment" },
        body: {
          uk: "Мезотерапія — метод інтрадермального і субдермального введення мікродоз активних речовин безпосередньо у цільовий шар шкіри. На відміну від крему чи сироватки, активні компоненти не проходять крізь епідермальний бар'єр і доставляються до клітин у концентрації, необхідній для фізіологічної відповіді. Склад коктейлів в GENEVITY підбирається індивідуально: вітаміни групи B (B1, B6, B12) для клітинного метаболізму; вітамін C і глутатіон — антиоксидантний захист і освітлення; гіалуронова кислота низької молекулярної маси — гідратація; пептиди і амінокислоти — будівельний матеріал для колагену; мікроелементи (цинк, силіцій) — регуляція сальних залоз і зміцнення матриксу. Мезотерапія ефективна як самостійна процедура і як підготовка або суперпозиція до апаратних методик.",
          ru: "Мезотерапия — метод интрадермального и субдермального введения микродоз активных веществ непосредственно в целевой слой кожи. В отличие от крема или сыворотки, активные компоненты не проходят через эпидермальный барьер и доставляются к клеткам в концентрации, необходимой для физиологического ответа. Состав коктейлей в GENEVITY подбирается индивидуально: витамины группы B (B1, B6, B12) для клеточного метаболизма; витамин C и глутатион — антиоксидантная защита и осветление; гиалуроновая кислота низкой молекулярной массы — гидратация; пептиды и аминокислоты — строительный материал для коллагена; микроэлементы (цинк, кремний) — регуляция сальных желёз и укрепление матрикса. Мезотерапия эффективна как самостоятельная процедура и как подготовка или суперпозиция к аппаратным методикам.",
          en: "Mesotherapy is a method of intradermal and subdermal injection of microdoses of active substances directly into the target skin layer. Unlike creams or serums, active components bypass the epidermal barrier and are delivered to cells at the concentration required for a physiological response. Cocktail composition at GENEVITY is selected individually: B vitamins (B1, B6, B12) for cellular metabolism; vitamin C and glutathione — antioxidant protection and brightening; low-molecular-weight HA — hydration; peptides and amino acids — collagen building blocks; trace elements (zinc, silicon) — sebaceous gland regulation and matrix strengthening. Mesotherapy is effective as a standalone procedure and as preparation or complement to device treatments.",
        },
        calloutBody: {
          uk: "У GENEVITY не використовуються готові «стандартні» мезококтейлі. Склад кожної процедури формується лікарем під конкретний запит і стан шкіри пацієнта.",
          ru: "В GENEVITY не используются готовые «стандартные» мезококтейли. Состав каждой процедуры формируется врачом под конкретный запрос и состояние кожи пациента.",
          en: "GENEVITY does not use ready-made 'standard' meso-cocktails. The composition of each procedure is formulated by the physician for the specific concern and skin condition.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до мезотерапії", ru: "Показания к мезотерапии", en: "Indications for Mesotherapy" },
        indications: [
          { uk: "Тьмяна, виснажена шкіра з дефіцитом мікроелементів", ru: "Тусклая, истощённая кожа с дефицитом микроэлементов", en: "Dull, depleted skin with micronutrient deficiency" },
          { uk: "Жирна шкіра, акне і розширені пори (цинк-пептидні протоколи)", ru: "Жирная кожа, акне и расширенные поры (цинк-пептидные протоколы)", en: "Oily skin, acne, and enlarged pores (zinc-peptide protocols)" },
          { uk: "Гіперпігментація і постзапальні плями (вітамін C + глутатіон)", ru: "Гиперпигментация и постовоспалительные пятна (витамин C + глутатион)", en: "Hyperpigmentation and post-inflammatory spots (vitamin C + glutathione)" },
          { uk: "Алопеція і дифузне випадіння волосся (мезотерапія шкіри голови)", ru: "Алопеция и диффузное выпадение волос (мезотерапия кожи головы)", en: "Alopecia and diffuse hair loss (scalp mesotherapy)" },
          { uk: "Підготовка до лазерних процедур і після них", ru: "Подготовка к лазерным процедурам и после них", en: "Preparation for laser procedures and post-laser recovery" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Алергія на компоненти коктейлю (уточнюється на консультації)", ru: "Аллергия на компоненты коктейля (уточняется на консультации)", en: "Allergy to cocktail components (clarified at consultation)" },
          { uk: "Активні запалення та гострі інфекції у зоні", ru: "Активные воспаления и острые инфекции в зоне", en: "Active inflammation and acute infections in the area" },
          { uk: "Коагулопатії та прийом антикоагулянтів", ru: "Коагулопатии и приём антикоагулянтов", en: "Coagulopathies and anticoagulant use" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Oncological diseases" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура мезотерапії", ru: "Как проходит процедура мезотерапии", en: "Mesotherapy Procedure Steps" },
        steps: [
          {
            title: { uk: "Діагностика та складання протоколу", ru: "Диагностика и составление протокола", en: "Diagnosis and Protocol Formulation" },
            description: { uk: "Лікар аналізує стан шкіри, виявляє дефіцити і формує індивідуальний коктейль із сертифікованих компонентів.", ru: "Врач анализирует состояние кожи, выявляет дефициты и формирует индивидуальный коктейль из сертифицированных компонентов.", en: "The physician analyzes skin condition, identifies deficiencies, and formulates an individual cocktail from certified components." },
          },
          {
            title: { uk: "Анестезія і підготовка зони", ru: "Анестезия и подготовка зоны", en: "Anesthesia and Zone Preparation" },
            description: { uk: "Крем-анестетик наносять за 30–40 хв. Шкіру антисептично обробляють перед ін'єкціями.", ru: "Крем-анестетик наносят за 30–40 мин. Кожу антисептически обрабатывают перед инъекциями.", en: "Anesthetic cream is applied 30–40 minutes before. Skin is treated with antiseptic prior to injections." },
          },
          {
            title: { uk: "Серія мікроін'єкцій або мезопістолет", ru: "Серия микроинъекций или мезопистолет", en: "Microinjection Series or Meso-Gun" },
            description: { uk: "Лікар вводить коктейль точковими ін'єкціями або за допомогою автоматизованого пістолету для мінімізації дискомфорту. Тривалість — 20–40 хв.", ru: "Врач вводит коктейль точечными инъекциями или с помощью автоматизированного пистолета для минимизации дискомфорта. Длительность — 20–40 мин.", en: "The physician administers the cocktail via point injections or automated meso-gun for minimal discomfort. Duration: 20–40 minutes." },
          },
          {
            title: { uk: "Завершення та рекомендації", ru: "Завершение и рекомендации", en: "Completion and Aftercare" },
            description: { uk: "Наносять заспокійливий крем. Уникайте макіяжу 24 год, сонця і сауни — 48 год. Наступна процедура — через 7–14 днів.", ru: "Наносят успокаивающий крем. Избегайте макияжа 24 ч, солнца и сауны — 48 ч. Следующая процедура — через 7–14 дней.", en: "Soothing cream is applied. Avoid makeup for 24h, sun and sauna for 48h. Next procedure in 7–14 days." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості мезотерапії", ru: "Преимущества и особенности мезотерапии", en: "Mesotherapy Advantages and Considerations" },
        items: [
          { uk: "Персоналізований склад коктейлю — точно під завдання і стан шкіри", ru: "Персонализированный состав коктейля — точно под задачу и состояние кожи", en: "Personalized cocktail composition — precisely for the goal and skin condition" },
          { uk: "Ефективна для складних завдань: акне, алопеція, гіперпігментація", ru: "Эффективна для сложных задач: акне, алопеция, гиперпигментация", en: "Effective for complex concerns: acne, alopecia, hyperpigmentation" },
          { uk: "Підсилює ефект лазерних і апаратних процедур як підготовчий етап", ru: "Усиливает эффект лазерных и аппаратных процедур как подготовительный этап", en: "Enhances the effect of laser and device procedures as a preparatory step" },
          { uk: "Може поєднуватися з біоревіталізацією та ботулінотерапією", ru: "Может сочетаться с биоревитализацией и ботулинотерапией", en: "Can be combined with biorevitalisation and botulinum therapy" },
          { uk: "⚠ Ефект курсовий — 4–6 процедур з інтервалом 7–14 днів для стійкого результату", ru: "⚠ Эффект курсовой — 4–6 процедур с интервалом 7–14 дней для стойкого результата", en: "⚠ Course effect — 4–6 procedures every 7–14 days for lasting results" },
          { uk: "⚠ Точковий синець або папула після ін'єкції — норма, зникає за 24–48 год", ru: "⚠ Точечный синяк или папула после инъекции — норма, исчезает за 24–48 ч", en: "⚠ Point bruise or papule post-injection is normal — resolves in 24–48h" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Яка різниця між мезотерапією та біоревіталізацією?", ru: "Какая разница между мезотерапией и биоревитализацией?", en: "What is the difference between mesotherapy and biorevitalisation?" },
        answer: { uk: "Мезотерапія — комплексний коктейль для живлення і корекції конкретних проблем (акне, пігмент, алопеція). Біоревіталізація — моно-ГК для глибокого зволоження і стимуляції власного колагену. Обидві процедури можна поєднувати.", ru: "Мезотерапия — комплексный коктейль для питания и коррекции конкретных проблем (акне, пигмент, алопеция). Биоревитализация — моно-ГК для глубокого увлажнения и стимуляции собственного коллагена. Обе процедуры можно сочетать.", en: "Mesotherapy is a complex cocktail for nourishment and correction of specific problems (acne, pigment, alopecia). Biorevitalisation is mono-HA for deep hydration and collagen stimulation. Both can be combined." },
      },
      {
        question: { uk: "Скільки потрібно процедур?", ru: "Сколько нужно процедур?", en: "How many procedures are needed?" },
        answer: { uk: "Базовий курс — 4–6 сесій з інтервалом 7–14 днів. Підтримувальна — 1–2 рази на рік.", ru: "Базовый курс — 4–6 сессий с интервалом 7–14 дней. Поддерживающая — 1–2 раза в год.", en: "Basic course — 4–6 sessions every 7–14 days. Maintenance — 1–2 times per year." },
      },
    ],
  },

  // ─── EXOSOMES ─────────────────────────────────────────────────────────────
  {
    slug: "exosomes",
    summary: {
      uk: "Терапія екзосомами у GENEVITY — ін'єкції позаклітинних везикул із стовбурових клітин для глибокої регенерації, омолодження і відновлення шкіри. Найновіше покоління регенеративної медицини без живих клітин.",
      ru: "Терапия экзосомами в GENEVITY — инъекции внеклеточных везикул из стволовых клеток для глубокой регенерации, омоложения и восстановления кожи. Новейшее поколение регенеративной медицины без живых клеток.",
      en: "Exosome therapy at GENEVITY — extracellular vesicle injections derived from stem cells for deep regeneration, rejuvenation, and skin restoration. The newest generation of regenerative medicine without live cells.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Екзосоми — що це і чому це революція в косметології", ru: "Экзосомы — что это и почему это революция в косметологии", en: "Exosomes — What They Are and Why It Is a Revolution in Cosmetology" },
        body: {
          uk: "Екзосоми — нанорозмірні позаклітинні везикули (30–150 нм), що продукуються клітинами організму як засіб міжклітинної комунікації. Вони переносять мікроРНК, сигнальні білки та фактори росту безпосередньо з клітини-донора до клітини-акцептора. В естетичній медицині використовуються екзосоми зі стовбурових клітин рослинного або людського походження. Потрапляючи у шкіру, вони «перепрограмують» фібробласти, активуючи синтез колагену, еластину і гіалуронової кислоти на генетичному рівні. Це ключова відмінність від будь-яких ін'єкційних препаратів: екзосоми не просто заповнюють чи зволожують — вони відновлюють клітинну функцію. Препарати, сертифіковані у GENEVITY, проходять суворий контроль якості і містять стандартизовану кількість везикул на мл.",
          ru: "Экзосомы — наноразмерные внеклеточные везикулы (30–150 нм), продуцируемые клетками организма как средство межклеточной коммуникации. Они переносят микроРНК, сигнальные белки и факторы роста непосредственно из клетки-донора в клетку-акцептор. В эстетической медицине используются экзосомы из стволовых клеток растительного или человеческого происхождения. Попадая в кожу, они «перепрограммируют» фибробласты, активируя синтез коллагена, эластина и гиалуроновой кислоты на генетическом уровне. Это ключевое отличие от любых инъекционных препаратов: экзосомы не просто заполняют или увлажняют — они восстанавливают клеточную функцию. Препараты, сертифицированные в GENEVITY, проходят строгий контроль качества и содержат стандартизированное количество везикул на мл.",
          en: "Exosomes are nano-sized extracellular vesicles (30–150 nm) produced by cells as a means of intercellular communication. They transport microRNA, signaling proteins, and growth factors directly from donor to acceptor cells. In aesthetic medicine, exosomes derived from plant or human stem cells are used. Upon entering the skin, they 'reprogram' fibroblasts, activating collagen, elastin, and hyaluronic acid synthesis at the genetic level. This is the key difference from any injectable preparation: exosomes do not merely fill or hydrate — they restore cellular function. Preparations certified at GENEVITY undergo strict quality control and contain a standardized vesicle count per ml.",
        },
        calloutBody: {
          uk: "Екзосоми — нефармакологічний регуляторний інструмент. Вони не містять живих клітин і не викликають імунної відповіді — що робить терапію безпечною навіть для чутливих і схильних до алергій пацієнтів.",
          ru: "Экзосомы — нефармакологический регуляторный инструмент. Они не содержат живых клеток и не вызывают иммунного ответа — что делает терапию безопасной даже для чувствительных и склонных к аллергиям пациентов.",
          en: "Exosomes are a non-pharmacological regulatory tool. They contain no live cells and trigger no immune response — making the therapy safe even for sensitive and allergy-prone patients.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до терапії екзосомами", ru: "Показания к терапии экзосомами", en: "Indications for Exosome Therapy" },
        indications: [
          { uk: "Виражені ознаки фотостаріння: зморшки, пігментація, птоз", ru: "Выраженные признаки фотостарения: морщины, пигментация, птоз", en: "Pronounced photoaging signs: wrinkles, pigmentation, ptosis" },
          { uk: "Відновлення після агресивних лазерних процедур і пілінгів", ru: "Восстановление после агрессивных лазерных процедур и пилингов", en: "Recovery after aggressive laser procedures and peels" },
          { uk: "Дифузне випадіння волосся і алопеція (ін'єкції у шкіру голови)", ru: "Диффузное выпадение волос и алопеция (инъекции в кожу головы)", en: "Diffuse hair loss and alopecia (scalp injections)" },
          { uk: "Рубці після акне — стимуляція реструктуризації дерми", ru: "Рубцы после акне — стимуляция реструктуризации дермы", en: "Post-acne scars — stimulation of dermal remodeling" },
          { uk: "Загальне антивікове відновлення шкіри від 35 років", ru: "Общее антивозрастное восстановление кожи от 35 лет", en: "General anti-aging skin restoration from age 35" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Онкологічні захворювання (активні або в анамнезі — консультація онколога)", ru: "Онкологические заболевания (активные или в анамнезе — консультация онколога)", en: "Oncological diseases (active or history — oncologist consultation required)" },
          { uk: "Активні запальні процеси у зоні ін'єкцій", ru: "Активные воспалительные процессы в зоне инъекций", en: "Active inflammatory processes in the injection area" },
          { uk: "Аутоімунні захворювання у стадії загострення", ru: "Аутоиммунные заболевания в стадии обострения", en: "Autoimmune diseases in acute stage" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура терапії екзосомами", ru: "Как проходит процедура терапии экзосомами", en: "Exosome Therapy Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація та визначення зони", ru: "Консультация и определение зоны", en: "Consultation and Zone Determination" },
            description: { uk: "Лікар визначає показання, вибирає препарат екзосом і методику введення: мікропапульно, лінійно або у комбінації з RF/лазером.", ru: "Врач определяет показания, выбирает препарат экзосом и методику введения: микропапульно, линейно или в комбинации с RF/лазером.", en: "The physician determines indications, selects the exosome preparation and injection method: micropapular, linear, or combined with RF/laser." },
          },
          {
            title: { uk: "Підготовка: очищення та анестезія", ru: "Подготовка: очищение и анестезия", en: "Preparation: Cleansing and Anesthesia" },
            description: { uk: "Шкіру очищають, наносять крем-анестетик за 30 хв. Перед введенням обробляють антисептиком.", ru: "Кожу очищают, наносят крем-анестетик за 30 мин. Перед введением обрабатывают антисептиком.", en: "Skin is cleansed, anesthetic cream is applied 30 min before. Antiseptic is applied before injections." },
          },
          {
            title: { uk: "Ін'єкційне або трансдермальне введення", ru: "Инъекционное или трансдермальное введение", en: "Injectable or Transdermal Administration" },
            description: { uk: "Лікар вводить екзосоми ін'єкційно або у поєднанні з мікронідлінгом/лазером для глибшого проникнення. Тривалість — 30–60 хв.", ru: "Врач вводит экзосомы инъекционно или в сочетании с микронидлингом/лазером для более глубокого проникновения. Длительность — 30–60 мин.", en: "The physician administers exosomes via injection or combined with microneedling/laser for deeper penetration. Duration: 30–60 minutes." },
          },
          {
            title: { uk: "Постпроцедурний догляд", ru: "Постпроцедурный уход", en: "Post-Procedure Care" },
            description: { uk: "Наносять заспокійливу маску. Уникайте активного сонця 48 год. Результат наростає протягом 4–8 тижнів.", ru: "Наносят успокаивающую маску. Избегайте активного солнца 48 ч. Результат нарастает в течение 4–8 недель.", en: "Soothing mask is applied. Avoid direct sun for 48h. Results build over 4–8 weeks." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості терапії екзосомами", ru: "Преимущества и особенности терапии экзосомами", en: "Exosome Therapy Advantages and Considerations" },
        items: [
          { uk: "Глибока регенерація на клітинному рівні — недосяжна іншими ін'єкційними методами", ru: "Глубокая регенерация на клеточном уровне — недостижимая другими инъекционными методами", en: "Deep cellular-level regeneration — unachievable by other injectable methods" },
          { uk: "Відсутність живих клітин — немає ризику відторгнення та імунної реакції", ru: "Отсутствие живых клеток — нет риска отторжения и иммунной реакции", en: "No live cells — no rejection or immune reaction risk" },
          { uk: "Ефективно поєднується з RF, лазером і мікронідлінгом", ru: "Эффективно сочетается с RF, лазером и микронидлингом", en: "Effectively combined with RF, laser, and microneedling" },
          { uk: "Стійкий результат: покращення тривалістю 12–18 місяців після курсу", ru: "Стойкий результат: улучшение длительностью 12–18 месяцев после курса", en: "Long-lasting result: improvement lasting 12–18 months after a course" },
          { uk: "⚠ Ефект накопичувальний — курс 2–3 процедури з інтервалом 3–4 тижні", ru: "⚠ Эффект накопительный — курс 2–3 процедуры с интервалом 3–4 недели", en: "⚠ Cumulative effect — course of 2–3 procedures every 3–4 weeks" },
          { uk: "⚠ Технологія нова: обирайте клініку з сертифікованими препаратами, а не «дженериками»", ru: "⚠ Технология новая: выбирайте клинику с сертифицированными препаратами, а не «дженериками»", en: "⚠ Technology is new: choose a clinic with certified preparations, not generics" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Екзосоми — це те саме що PRP?", ru: "Экзосомы — это то же самое, что PRP?", en: "Are exosomes the same as PRP?" },
        answer: { uk: "Ні. PRP — збагачена тромбоцитами плазма крові самого пацієнта з факторами росту. Екзосоми — нанорозмірні везикули зі стовбурових клітин з мікроРНК. Різний механізм і різна глибина впливу.", ru: "Нет. PRP — обогащённая тромбоцитами плазма крови самого пациента с факторами роста. Экзосомы — наноразмерные везикулы из стволовых клеток с микроРНК. Разный механизм и разная глубина воздействия.", en: "No. PRP is the patient's own platelet-rich plasma with growth factors. Exosomes are nano-vesicles from stem cells with microRNA. Different mechanism and depth of action." },
      },
      {
        question: { uk: "Коли буде видно результат?", ru: "Когда будет виден результат?", en: "When will results be visible?" },
        answer: { uk: "Перші ознаки поліпшення — через 2–3 тижні. Повний ефект розкривається через 4–8 тижнів і продовжує наростати протягом 3–6 місяців.", ru: "Первые признаки улучшения — через 2–3 недели. Полный эффект раскрывается через 4–8 недель и продолжает нарастать в течение 3–6 месяцев.", en: "First improvement signs in 2–3 weeks. Full effect at 4–8 weeks, continuing to build over 3–6 months." },
      },
    ],
  },

  // ─── CONTOUR PLASTY ───────────────────────────────────────────────────────
  {
    slug: "contour-plasty",
    summary: {
      uk: "Контурна пластика у GENEVITY — введення філерів на основі гіалуронової кислоти для відновлення об'єму, корекції контурів і ліфтингу обличчя без операції. Препарати Juvederm, Restylane, Belotero за анатомічним протоколом.",
      ru: "Контурная пластика в GENEVITY — введение филлеров на основе гиалуроновой кислоты для восстановления объёма, коррекции контуров и лифтинга лица без операции. Препараты Juvederm, Restylane, Belotero по анатомическому протоколу.",
      en: "Contouring at GENEVITY — hyaluronic acid filler injections for volume restoration, contour correction, and facial lifting without surgery. Juvederm, Restylane, Belotero preparations per anatomical protocol.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Контурна пластика — відновлення об'єму та контурів", ru: "Контурная пластика — восстановление объёма и контуров", en: "Contouring — Volume and Contour Restoration" },
        body: {
          uk: "Контурна пластика — введення зшитих гелів гіалуронової кислоти (філерів) у точно визначені анатомічні шари обличчя. Зшита ГК відрізняється від нативної: перехресні зв'язки між молекулами надають гелю об'ємний і довгостроковий ефект. Залежно від щільності і реологічних властивостей, різні філери підходять для різних завдань: легкі гелі — для губ і периорбітальної зони, щільніші — для вилиць і підборіддя, ультращільні — для скул і кута щелепи. У GENEVITY використовують виключно оригінальні препарати Allergan (Juvederm), Galderma (Restylane) та Merz (Belotero). Кожен протокол базується на анатомічному підході: лікар спочатку аналізує тривимірну структуру обличчя, визначає дефіцит об'єму по зонах і лише потім розраховує кількість і розміщення препарату.",
          ru: "Контурная пластика — введение сшитых гелей гиалуроновой кислоты (филлеров) в точно определённые анатомические слои лица. Сшитая ГК отличается от нативной: поперечные связи между молекулами придают гелю объёмный и долгосрочный эффект. В зависимости от плотности и реологических свойств разные филлеры подходят для разных задач: лёгкие гели — для губ и периорбитальной зоны, более плотные — для скул и подбородка, ультраплотные — для скуловой дуги и угла челюсти. В GENEVITY используют исключительно оригинальные препараты Allergan (Juvederm), Galderma (Restylane) и Merz (Belotero). Каждый протокол базируется на анатомическом подходе: врач сначала анализирует трёхмерную структуру лица, определяет дефицит объёма по зонам и только потом рассчитывает количество и размещение препарата.",
          en: "Contouring is the injection of crosslinked hyaluronic acid gels (fillers) into precisely defined anatomical facial layers. Crosslinked HA differs from native HA: cross-links between molecules give the gel a volumizing and long-lasting effect. Depending on density and rheological properties, different fillers suit different goals: light gels for lips and periorbital zone, denser gels for cheeks and chin, ultra-dense for zygomatic arch and jaw angle. GENEVITY exclusively uses original preparations from Allergan (Juvederm), Galderma (Restylane), and Merz (Belotero). Each protocol is based on an anatomical approach: the physician first analyzes the 3D facial structure, identifies volume deficit by zone, and only then calculates the amount and placement of the preparation.",
        },
        calloutBody: {
          uk: "GENEVITY не практикує шаблонні протоколи. Кожне введення розраховується після вивчення анатомії конкретного обличчя — для природного результату без «опуклостей» і «перекачаного» вигляду.",
          ru: "GENEVITY не практикует шаблонные протоколы. Каждое введение рассчитывается после изучения анатомии конкретного лица — для естественного результата без «выпуклостей» и «перекачанного» вида.",
          en: "GENEVITY does not use template protocols. Every injection is calculated after studying the anatomy of the specific face — for a natural result without 'lumps' or an 'overfilled' look.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до контурної пластики", ru: "Показания к контурной пластике", en: "Indications for Contouring" },
        indications: [
          { uk: "Вікова втрата об'єму вилиць, скронь, підщелепної зони", ru: "Возрастная потеря объёма скул, висков, подчелюстной зоны", en: "Age-related volume loss in cheeks, temples, submandibular zone" },
          { uk: "Збільшення і корекція форми губ", ru: "Увеличение и коррекция формы губ", en: "Lip augmentation and shape correction" },
          { uk: "Корекція носогубних складок, маріонеткових зморшок", ru: "Коррекция носогубных складок, марионеточных морщин", en: "Correction of nasolabial folds and marionette lines" },
          { uk: "Моделювання підборіддя і кута щелепи (jaw contouring)", ru: "Моделирование подбородка и угла челюсти (jaw contouring)", en: "Chin and jaw angle modeling (jaw contouring)" },
          { uk: "Ліфтинг птозованих м'яких тканин (liquid facelift)", ru: "Лифтинг птозированных мягких тканей (liquid facelift)", en: "Lifting of ptotic soft tissues (liquid facelift)" },
          { uk: "Корекція западин під очима (tear trough)", ru: "Коррекция западин под глазами (tear trough)", en: "Under-eye hollow correction (tear trough)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Активні запалення, герпес або інфекції у зоні ін'єкцій", ru: "Активные воспаления, герпес или инфекции в зоне инъекций", en: "Active inflammation, herpes, or infections in the injection area" },
          { uk: "Аутоімунні та тяжкі системні захворювання", ru: "Аутоиммунные и тяжёлые системные заболевания", en: "Autoimmune and severe systemic diseases" },
          { uk: "Прийом антикоагулянтів та антиагрегантів", ru: "Приём антикоагулянтов и антиагрегантів", en: "Anticoagulant and antiplatelet medication use" },
          { uk: "Наявний у зоні постійний філер або силікон", ru: "Наличие в зоне перманентного филлера или силикона", en: "Permanent filler or silicone already present in the area" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура контурної пластики", ru: "Как проходит процедура контурной пластики", en: "Contouring Procedure Steps" },
        steps: [
          {
            title: { uk: "Анатомічний аналіз і дизайн результату", ru: "Анатомический анализ и дизайн результата", en: "Anatomical Analysis and Result Design" },
            description: { uk: "Лікар аналізує пропорції обличчя, зони дефіциту об'єму, призначає препарати і кількість мл по кожній зоні.", ru: "Врач анализирует пропорции лица, зоны дефицита объёма, назначает препараты и количество мл по каждой зоне.", en: "The physician analyzes facial proportions, volume deficit zones, prescribes preparations and ml per zone." },
          },
          {
            title: { uk: "Анестезія та підготовка", ru: "Анестезия и подготовка", en: "Anesthesia and Preparation" },
            description: { uk: "Крем-анестетик або блокада. Шкіру обробляють антисептиком. Для губ — дентальна анестезія за показаннями.", ru: "Крем-анестетик или блокада. Кожу обрабатывают антисептиком. Для губ — дентальная анестезия по показаниям.", en: "Anesthetic cream or nerve block. Antiseptic skin prep. Dental block for lips as indicated." },
          },
          {
            title: { uk: "Введення філера голкою або канюлею", ru: "Введение филлера иглой или канюлей", en: "Filler Injection via Needle or Cannula" },
            description: { uk: "Лікар вводить препарат у цільові шари: канюля — безпечніше для периферійних зон, голка — для точних депо. Тривалість — 20–60 хв.", ru: "Врач вводит препарат в целевые слои: канюля — безопаснее для периферийных зон, игла — для точных депо. Длительность — 20–60 мин.", en: "The physician injects into target layers: cannula is safer for peripheral zones, needle for precise depots. Duration: 20–60 minutes." },
          },
          {
            title: { uk: "Масаж і оцінка симетрії", ru: "Массаж и оценка симметрии", en: "Massage and Symmetry Assessment" },
            description: { uk: "Лікар моделює результат, рівномірно розподіляє гель, перевіряє симетрію. Фото до/після — в день процедури.", ru: "Врач моделирует результат, равномерно распределяет гель, проверяет симметрию. Фото до/после — в день процедуры.", en: "The physician sculpts the result, distributes gel evenly, checks symmetry. Before/after photos are taken on procedure day." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості контурної пластики", ru: "Преимущества и особенности контурной пластики", en: "Contouring Advantages and Considerations" },
        items: [
          { uk: "Результат видимий одразу після процедури, набряк мінімальний", ru: "Результат виден сразу после процедуры, отёк минимальный", en: "Result visible immediately after the procedure, minimal swelling" },
          { uk: "Препарати розсмоктуються природно — ефект оборотній, безпечний", ru: "Препараты рассасываются естественно — эффект обратимый, безопасный", en: "Preparations dissolve naturally — reversible and safe effect" },
          { uk: "Тривалість ефекту: 9–18 місяців залежно від зони та препарату", ru: "Длительность эффекта: 9–18 месяцев в зависимости от зоны и препарата", en: "Effect duration: 9–18 months depending on zone and preparation" },
          { uk: "Можна розчинити гіалуронідазою — повне скасування результату за 24 год", ru: "Можно растворить гиалуронидазой — полная отмена результата за 24 ч", en: "Can be dissolved with hyaluronidase — complete result reversal in 24h" },
          { uk: "⚠ Після ін'єкцій 1–3 дні можливі набряк і синці — закладайте на це час", ru: "⚠ После инъекций 1–3 дня возможны отёк и синяки — учитывайте это в планах", en: "⚠ 1–3 days of swelling and bruising possible after injections — plan accordingly" },
          { uk: "⚠ Надлишок і «типаж» виникають від недотримання анатомічного підходу", ru: "⚠ Избыток и «типаж» возникают от несоблюдения анатомического подхода", en: "⚠ Overfill and the 'filler look' result from ignoring the anatomical approach" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Чи боляче робити губи?", ru: "Больно ли делать губы?", en: "Is lip filler painful?" },
        answer: { uk: "Губи — чутлива зона. У GENEVITY застосовують топічний анестетик і, за показаннями, дентальний блок. Більшість пацієнтів описують дискомфорт як терпимий.", ru: "Губы — чувствительная зона. В GENEVITY применяют топический анестетик и, по показаниям, дентальный блок. Большинство пациентов описывают дискомфорт как терпимый.", en: "Lips are a sensitive area. GENEVITY uses topical anesthetic and, as indicated, dental block. Most patients describe discomfort as tolerable." },
      },
      {
        question: { uk: "Коли зійде набряк?", ru: "Когда сойдёт отёк?", en: "When does swelling subside?" },
        answer: { uk: "Основний набряк — перші 24–48 год. Повний результат оцінюють через 10–14 днів після повного розподілу гелю.", ru: "Основной отёк — первые 24–48 ч. Полный результат оценивают через 10–14 дней после полного распределения геля.", en: "Main swelling: first 24–48h. Full result assessed at 10–14 days after complete gel distribution." },
      },
      {
        question: { uk: "Що якщо мені не сподобається результат?", ru: "Что если мне не понравится результат?", en: "What if I don't like the result?" },
        answer: { uk: "ГК-філери можна розчинити ін'єкцією гіалуронідази. Ефект скасовується протягом 24 годин. Це одна з головних переваг ГК-філерів перед перманентними імплантатами.", ru: "ГК-филлеры можно растворить инъекцией гиалуронидазы. Эффект отменяется в течение 24 часов. Это одно из главных преимуществ ГК-филлеров перед перманентными имплантатами.", en: "HA fillers can be dissolved with a hyaluronidase injection. The result reverses within 24 hours. This is one of the main advantages of HA fillers over permanent implants." },
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
      await sql`
        INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
        VALUES(${id}, 'service', ${serviceId}, ${i}, ${sec.type}::section_type, ${JSON.stringify(sectionData(sec))}::jsonb)
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
  console.log("\nV4-injectable-a DONE.");
}

main().catch((e) => { console.error(e); process.exit(1); });
