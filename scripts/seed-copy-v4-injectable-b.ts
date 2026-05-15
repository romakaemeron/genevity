/**
 * V4-injectable-b — prp-therapy, stem-cell-therapy, rejuran, juvederm, polyphil
 * Re-seeds with section variety: richText + indicationsContraindications + steps + bullets
 * Run: npx tsx scripts/seed-copy-v4-injectable-b.ts
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
  // ─── PRP THERAPY ──────────────────────────────────────────────────────────
  {
    slug: "prp-therapy",
    summary: {
      uk: "PRP-терапія у GENEVITY — ін'єкції збагаченої тромбоцитами плазми крові пацієнта для стимуляції природної регенерації шкіри, відновлення волосся і омолодження без чужорідних речовин.",
      ru: "PRP-терапия в GENEVITY — инъекции обогащённой тромбоцитами плазмы крови пациента для стимуляции естественной регенерации кожи, восстановления волос и омоложения без чужеродных веществ.",
      en: "PRP therapy at GENEVITY — platelet-rich plasma injections from the patient's own blood to stimulate natural skin regeneration, hair restoration, and rejuvenation without foreign substances.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "PRP-терапія — аутоплазма для регенерації", ru: "PRP-терапия — аутоплазма для регенерации", en: "PRP Therapy — Autologous Plasma for Regeneration" },
        body: {
          uk: "PRP (Platelet-Rich Plasma) — концентрована аутологічна плазма, збагачена тромбоцитами у 3–8 разів вище норми. Тромбоцити — природне депо факторів росту: PDGF, TGF-β, VEGF, EGF. При введенні у тканину вони вивільняються і запускають каскад регенерації: стимуляція фібробластів, судиноутворення, синтез матриксних білків. Для отримання PRP у GENEVITY використовують сертифіковані закриті системи (Regen Lab, RegenPRP) з подвійним центрифугуванням — це забезпечує стабільну концентрацію тромбоцитів і відсутність еритроцитів, що важливо для якості. Плазма береться виключно від самого пацієнта: ніякого ризику алергії або відторгнення — організм отримує власні сигнальні молекули.",
          ru: "PRP (Platelet-Rich Plasma) — концентрированная аутологичная плазма, обогащённая тромбоцитами в 3–8 раз выше нормы. Тромбоциты — естественное депо факторов роста: PDGF, TGF-β, VEGF, EGF. При введении в ткань они высвобождаются и запускают каскад регенерации: стимуляция фибробластов, сосудообразование, синтез матриксных белков. Для получения PRP в GENEVITY используют сертифицированные закрытые системы (Regen Lab, RegenPRP) с двойным центрифугированием — это обеспечивает стабильную концентрацию тромбоцитов и отсутствие эритроцитов, что важно для качества. Плазма берётся исключительно у самого пациента: никакого риска аллергии или отторжения — организм получает собственные сигнальные молекулы.",
          en: "PRP (Platelet-Rich Plasma) is concentrated autologous plasma enriched 3–8× above normal platelet levels. Platelets are a natural depot of growth factors: PDGF, TGF-β, VEGF, EGF. When injected into tissue, they release a regeneration cascade: fibroblast stimulation, angiogenesis, matrix protein synthesis. GENEVITY uses certified closed systems (Regen Lab, RegenPRP) with double centrifugation — ensuring stable platelet concentration and absence of red blood cells, critical for quality. Plasma is taken exclusively from the patient: no allergy or rejection risk — the body receives its own signaling molecules.",
        },
        calloutBody: {
          uk: "PRP-терапія і мезотерапія шкіри голови — золотий стандарт нехірургічного лікування алопеції. Клінічно підтверджена ефективність при андрогенетичній і телогеновій алопеції.",
          ru: "PRP-терапия и мезотерапия кожи головы — золотой стандарт нехирургического лечения алопеции. Клинически подтверждённая эффективность при андрогенетической и телогеновой алопеции.",
          en: "PRP therapy and scalp mesotherapy are the gold standard for non-surgical alopecia treatment. Clinically proven efficacy in androgenetic and telogen alopecia.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до PRP-терапії", ru: "Показания к PRP-терапии", en: "Indications for PRP Therapy" },
        indications: [
          { uk: "Андрогенетична і телогенова алопеція (випадіння волосся)", ru: "Андрогенетическая и телогеновая алопеция (выпадение волос)", en: "Androgenetic and telogen alopecia (hair loss)" },
          { uk: "Дифузне витончення волосся і зниження його густини", ru: "Диффузное истончение волос и снижение их густоты", en: "Diffuse hair thinning and reduced density" },
          { uk: "Омолодження обличчя та відновлення пружності шкіри", ru: "Омоложение лица и восстановление упругости кожи", en: "Facial rejuvenation and skin firmness restoration" },
          { uk: "Постпроцедурне відновлення після лазерних і апаратних методик", ru: "Постпроцедурное восстановление после лазерных и аппаратных методик", en: "Post-procedure recovery after laser and device treatments" },
          { uk: "Регенерація суглобів і сухожилків (ортопедичні показання)", ru: "Регенерация суставов и сухожилий (ортопедические показания)", en: "Joint and tendon regeneration (orthopedic indications)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Тромбоцитопенія (низький рівень тромбоцитів у крові)", ru: "Тромбоцитопения (низкий уровень тромбоцитов в крови)", en: "Thrombocytopenia (low platelet count)" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Oncological diseases" },
          { uk: "Активні інфекції та гострі запалення", ru: "Активные инфекции и острые воспаления", en: "Active infections and acute inflammation" },
          { uk: "Прийом антикоагулянтів", ru: "Приём антикоагулянтов", en: "Anticoagulant use" },
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить PRP-процедура", ru: "Как проходит PRP-процедура", en: "PRP Procedure Steps" },
        steps: [
          {
            title: { uk: "Забір крові та центрифугування", ru: "Забор крови и центрифугирование", en: "Blood Draw and Centrifugation" },
            description: { uk: "Беруть 10–20 мл крові з вени. Зразок поміщають у сертифіковану пробірку і центрифугують двічі для отримання збагаченої фракції тромбоцитів.", ru: "Берут 10–20 мл крови из вены. Образец помещают в сертифицированную пробирку и центрифугируют дважды для получения обогащённой фракции тромбоцитов.", en: "10–20 ml of blood is drawn from a vein. The sample is placed in a certified tube and centrifuged twice to obtain the platelet-rich fraction." },
          },
          {
            title: { uk: "Підготовка зони та анестезія", ru: "Подготовка зоны и анестезия", en: "Zone Preparation and Anesthesia" },
            description: { uk: "Зону очищають і наносять крем-анестетик (для шкіри голови — за 40 хвилин). Шкіру обробляють антисептиком безпосередньо перед ін'єкціями.", ru: "Зону очищают и наносят крем-анестетик (для кожи головы — за 40 минут). Кожу обрабатывают антисептиком непосредственно перед инъекциями.", en: "The zone is cleansed and anesthetic cream is applied (40 min for scalp). Antiseptic is applied just before injections." },
          },
          {
            title: { uk: "Ін'єкції PRP у цільову зону", ru: "Инъекции PRP в целевую зону", en: "PRP Injections into Target Zone" },
            description: { uk: "Лікар рівномірно вводить плазму мікропапулами або лінійно. Для шкіри голови — «кілком» під кутом 90° у зону алопеції. Тривалість — 20–40 хв.", ru: "Врач равномерно вводит плазму микропапулами или линейно. Для кожи головы — «кольями» под углом 90° в зону алопеции. Длительность — 20–40 мин.", en: "The physician evenly injects plasma via micropapules or linearly. For scalp: 90° injections into the alopecia zone. Duration: 20–40 minutes." },
          },
          {
            title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-Procedure Recommendations" },
            description: { uk: "Не мийте голову 24 год. Уникайте сонця і фізичних навантажень 48 год. Контрольний огляд — через 4 тижні.", ru: "Не мойте голову 24 ч. Избегайте солнца и физических нагрузок 48 ч. Контрольный осмотр — через 4 недели.", en: "Do not wash hair for 24h. Avoid sun and physical exertion for 48h. Follow-up in 4 weeks." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості PRP-терапії", ru: "Преимущества и особенности PRP-терапии", en: "PRP Therapy Advantages and Considerations" },
        items: [
          { uk: "100% аутологічна — ніяких чужорідних речовин, нульовий ризик алергії", ru: "100% аутологичная — никаких чужеродных веществ, нулевой риск аллергии", en: "100% autologous — no foreign substances, zero allergy risk" },
          { uk: "Підтверджена ефективність при алопеції: зупинка випадіння і ріст нових волосин", ru: "Подтверждённая эффективность при алопеции: остановка выпадения и рост новых волос", en: "Proven efficacy for alopecia: stopping hair loss and new hair growth" },
          { uk: "Синергія з мезотерапією шкіри голови для максимального ефекту", ru: "Синергия с мезотерапией кожи головы для максимального эффекта", en: "Synergy with scalp mesotherapy for maximum effect" },
          { uk: "Нема реабілітаційного periodу — дискомфорт мінімальний", ru: "Нет реабилитационного периода — дискомфорт минимальный", en: "No downtime — minimal discomfort" },
          { uk: "⚠ Результат при алопеції помітний через 3–4 місяці — потрібна терпіння і курс", ru: "⚠ Результат при алопеции заметен через 3–4 месяца — нужно терпение и курс", en: "⚠ Alopecia results appear in 3–4 months — patience and a course are required" },
          { uk: "⚠ Ефективність залежить від якості плазми — важлива сертифікована система центрифугування", ru: "⚠ Эффективность зависит от качества плазмы — важна сертифицированная система центрифугирования", en: "⚠ Efficacy depends on plasma quality — certified centrifugation system is critical" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Скільки процедур PRP потрібно для волосся?", ru: "Сколько процедур PRP нужно для волос?", en: "How many PRP sessions are needed for hair?" },
        answer: { uk: "Стандартний курс — 3–4 сесії з інтервалом 4–6 тижнів. Підтримувальна — 1–2 рази на рік. Результат оцінюють через 3–4 місяці після першої процедури.", ru: "Стандартный курс — 3–4 сессии с интервалом 4–6 недель. Поддерживающая — 1–2 раза в год. Результат оценивают через 3–4 месяца после первой процедуры.", en: "Standard course — 3–4 sessions every 4–6 weeks. Maintenance — 1–2 times per year. Results assessed 3–4 months after the first session." },
      },
      {
        question: { uk: "Чи болісно вводити PRP у шкіру голови?", ru: "Болезненно ли вводить PRP в кожу головы?", en: "Is scalp PRP injection painful?" },
        answer: { uk: "Шкіра голови чутлива. У GENEVITY застосовують крем-анестетик за 40 хвилин до процедури — це значно знижує дискомфорт.", ru: "Кожа головы чувствительная. В GENEVITY применяют крем-анестетик за 40 минут до процедуры — это значительно снижает дискомфорт.", en: "The scalp is sensitive. GENEVITY applies anesthetic cream 40 minutes before — this significantly reduces discomfort." },
      },
    ],
  },

  // ─── STEM CELL THERAPY ────────────────────────────────────────────────────
  {
    slug: "stem-cell-therapy",
    summary: {
      uk: "Терапія стовбуровими клітинами у GENEVITY — ін'єкції кондиційованих середовищ та ліофілізованих екстрактів мезенхімальних стовбурових клітин для глибокої регенерації, корекції фіброзу і системного антивікового ефекту.",
      ru: "Терапия стволовыми клетками в GENEVITY — инъекции кондиционированных сред и лиофилизированных экстрактов мезенхимальных стволовых клеток для глубокой регенерации, коррекции фиброза и системного антивозрастного эффекта.",
      en: "Stem cell therapy at GENEVITY — conditioned media and lyophilized mesenchymal stem cell extract injections for deep regeneration, fibrosis correction, and systemic anti-aging effect.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Терапія стовбуровими клітинами — регенерація на клітинному рівні", ru: "Терапия стволовыми клетками — регенерация на клеточном уровне", en: "Stem Cell Therapy — Cellular-Level Regeneration" },
        body: {
          uk: "У GENEVITY застосовуються не живі стовбурові клітини, а їхні похідні: кондиційовані середовища (secretome) і ліофілізовані клітинні екстракти. Секретом МСК (мезенхімальних стовбурових клітин) — це весь спектр факторів росту, цитокінів, мікроРНК і позаклітинних везикул, що продукуються клітинами під час культивування. Така «молекулярна виписка» діє системно: знижує запалення у тканинах, активує власні місцеві стовбурові клітини пацієнта, пригнічує фіброзоутворення і запускає неоколагеногенез. Ліофілізат дозволяє стабілізувати і стандартизувати дозу активних компонентів — що неможливо при роботі з «живою» плазмою або клітинами. Це безпечна, стандартизована альтернатива трансплантації клітин з потужним регенеративним потенціалом.",
          ru: "В GENEVITY применяются не живые стволовые клетки, а их производные: кондиционированные среды (secretome) и лиофилизированные клеточные экстракты. Секретом МСК (мезенхимальных стволовых клеток) — это весь спектр факторов роста, цитокинов, микроРНК и внеклеточных везикул, продуцируемых клетками в процессе культивирования. Такая «молекулярная выписка» действует системно: снижает воспаление в тканях, активирует собственные местные стволовые клетки пациента, подавляет фиброзообразование и запускает неоколлагеногенез. Лиофилизат позволяет стабилизировать и стандартизировать дозу активных компонентов — что невозможно при работе с «живой» плазмой или клетками. Это безопасная, стандартизированная альтернатива трансплантации клеток с мощным регенеративным потенциалом.",
          en: "GENEVITY uses not live stem cells but their derivatives: conditioned media (secretome) and lyophilized cell extracts. MSC (mesenchymal stem cell) secretome is the full spectrum of growth factors, cytokines, microRNA, and extracellular vesicles produced by cells during cultivation. This 'molecular output' acts systemically: reducing tissue inflammation, activating the patient's own local stem cells, suppressing fibrosis formation, and triggering neocollagenogenesis. Lyophilization stabilizes and standardizes the active component dose — impossible with live plasma or cells. This is a safe, standardized alternative to cell transplantation with powerful regenerative potential.",
        },
        calloutBody: {
          uk: "Кондиційоване середовище МСК містить понад 150 видів активних молекул. Жодна монопрепаратна ін'єкційна методика не може відтворити цей спектр дії за одне введення.",
          ru: "Кондиционированная среда МСК содержит более 150 видов активных молекул. Ни одна монопрепаратная инъекционная методика не может воспроизвести этот спектр действия за одно введение.",
          en: "MSC conditioned medium contains over 150 types of active molecules. No single-agent injectable technique can replicate this spectrum of action in one administration.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до терапії стовбуровими клітинами", ru: "Показания к терапии стволовыми клетками", en: "Indications for Stem Cell Therapy" },
        indications: [
          { uk: "Глибоке вікове старіння шкіри зі значним птозом і фіброзом", ru: "Глубокое возрастное старение кожи со значительным птозом и фиброзом", en: "Deep skin aging with significant ptosis and fibrosis" },
          { uk: "Рубцеві та фіброзні зміни після операцій, опіків чи акне", ru: "Рубцовые и фиброзные изменения после операций, ожогов или акне", en: "Scarring and fibrotic changes after surgery, burns, or acne" },
          { uk: "Хронічна сухість і атрофія шкіри, не коригована іншими методами", ru: "Хроническая сухость и атрофия кожи, не корректируемая другими методами", en: "Chronic skin dryness and atrophy not corrected by other methods" },
          { uk: "Системна антивікова програма після 45 років", ru: "Системная антивозрастная программа после 45 лет", en: "Systemic anti-aging program from age 45" },
          { uk: "Відновлення після тяжких захворювань зі зниженою регенерацією тканин", ru: "Восстановление после тяжёлых заболеваний со сниженной регенерацией тканей", en: "Recovery from serious illness with reduced tissue regeneration" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Онкологія (активна або в анамнезі до 5 років)", ru: "Онкология (активная или в анамнезе до 5 лет)", en: "Oncology (active or history within 5 years)" },
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Аутоімунні захворювання в активній фазі", ru: "Аутоиммунные заболевания в активной фазе", en: "Autoimmune diseases in active phase" },
          { uk: "Активні запальні та інфекційні процеси", ru: "Активные воспалительные и инфекционные процессы", en: "Active inflammatory and infectious processes" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура терапії стовбуровими клітинами", ru: "Как проходит процедура терапии стволовыми клетками", en: "Stem Cell Therapy Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація і вибір протоколу", ru: "Консультация и выбор протокола", en: "Consultation and Protocol Selection" },
            description: { uk: "Лікар визначає показання, обирає між секретомом і ліофілізатом залежно від задачі, розраховує дозу та зону.", ru: "Врач определяет показания, выбирает между секретомом и лиофилизатом в зависимости от задачи, рассчитывает дозу и зону.", en: "The physician determines indications, chooses between secretome and lyophilisate based on the goal, and calculates dose and zone." },
          },
          {
            title: { uk: "Підготовка препарату і анестезія", ru: "Подготовка препарата и анестезия", en: "Preparation and Anesthesia" },
            description: { uk: "Ліофілізат ресуспендують у розчиннику безпосередньо перед введенням. Крем-анестетик за 30 хв.", ru: "Лиофилизат ресуспендируют в растворителе непосредственно перед введением. Крем-анестетик за 30 мин.", en: "Lyophilisate is resuspended in solvent immediately before injection. Anesthetic cream 30 minutes before." },
          },
          {
            title: { uk: "Ін'єкційне введення секретому", ru: "Инъекционное введение секретома", en: "Secretome Injection" },
            description: { uk: "Препарат вводять у дерму мікропапульно або лінійно, рівномірно розподіляючи по зоні. Може комбінуватися з мікронідлінгом для поглиблення доставки.", ru: "Препарат вводят в дерму микропапульно или линейно, равномерно распределяя по зоне. Может комбинироваться с микронидлингом для углубления доставки.", en: "The preparation is injected into the dermis micropapularly or linearly, evenly distributed across the zone. May be combined with microneedling for deeper delivery." },
          },
          {
            title: { uk: "Постпроцедурний догляд та контроль", ru: "Постпроцедурный уход и контроль", en: "Post-Procedure Care and Follow-up" },
            description: { uk: "Заспокійлива маска, уникнення сонця 48 год. Контрольний огляд через 4–6 тижнів для оцінки динаміки регенерації.", ru: "Успокаивающая маска, избегание солнца 48 ч. Контрольный осмотр через 4–6 недель для оценки динамики регенерации.", en: "Soothing mask, avoid sun for 48h. Follow-up in 4–6 weeks to assess regeneration dynamics." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості терапії СК", ru: "Преимущества и особенности терапии СК", en: "Stem Cell Therapy Advantages and Considerations" },
        items: [
          { uk: "Найширший спектр регенеративних молекул серед усіх ін'єкційних методик", ru: "Наиширший спектр регенеративных молекул среди всех инъекционных методик", en: "Broadest spectrum of regenerative molecules among all injectable methods" },
          { uk: "Пригнічення фіброзу — ефект, недоступний ГК або PRP", ru: "Подавление фиброза — эффект, недоступный ГК или PRP", en: "Fibrosis suppression — an effect unavailable from HA or PRP" },
          { uk: "Стандартизована доза активних компонентів у кожному флаконі", ru: "Стандартизированная доза активных компонентов в каждом флаконе", en: "Standardized active component dose in every vial" },
          { uk: "Відсутність живих клітин — нема ризику відторгнення або онкогенезу", ru: "Отсутствие живых клеток — нет риска отторжения или онкогенеза", en: "No live cells — no rejection or oncogenesis risk" },
          { uk: "⚠ Ефект наростає поступово: перші зміни через 4–6 тижнів, максимум через 3–6 місяців", ru: "⚠ Эффект нарастает постепенно: первые изменения через 4–6 недель, максимум через 3–6 месяцев", en: "⚠ Effect builds gradually: first changes in 4–6 weeks, maximum at 3–6 months" },
          { uk: "⚠ Вартість вище, ніж у стандартних ін'єкційних методик — обґрунтована складністю виробництва", ru: "⚠ Стоимость выше, чем у стандартных инъекционных методик — обоснована сложностью производства", en: "⚠ Higher cost than standard injectables — justified by manufacturing complexity" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Це безпечно — вводити «клітини»?", ru: "Это безопасно — вводить «клетки»?", en: "Is it safe to inject 'cells'?" },
        answer: { uk: "У GENEVITY вводять не живі клітини, а їхній секретом або ліофілізат. Жодних живих клітин немає — тому немає ризику відторгнення, імунної реакції чи неконтрольованого розмноження.", ru: "В GENEVITY вводят не живые клетки, а их секретом или лиофилизат. Живых клеток нет — поэтому нет риска отторжения, иммунной реакции или неконтролируемого размножения.", en: "GENEVITY injects not live cells but their secretome or lyophilisate. No live cells are present — so there is no rejection risk, immune reaction, or uncontrolled proliferation." },
      },
      {
        question: { uk: "Скільки процедур потрібно?", ru: "Сколько процедур нужно?", en: "How many procedures are needed?" },
        answer: { uk: "Стандартний курс — 2–3 процедури з інтервалом 4–6 тижнів. Підтримувальна — 1 раз на рік або за показаннями лікаря.", ru: "Стандартный курс — 2–3 процедуры с интервалом 4–6 недель. Поддерживающая — 1 раз в год или по показаниям врача.", en: "Standard course — 2–3 procedures every 4–6 weeks. Maintenance — once a year or as indicated by the physician." },
      },
    ],
  },

  // ─── REJURAN ──────────────────────────────────────────────────────────────
  {
    slug: "rejuran",
    summary: {
      uk: "Реджуран у GENEVITY — ін'єкції полінуклеотидів (PDRN) лососевої ДНК для глибокої регенерації, відновлення щільності та еластичності шкіри. Золотий стандарт регенеративної косметології в К-бʼюті.",
      ru: "Реджуран в GENEVITY — инъекции полинуклеотидов (PDRN) лососевой ДНК для глубокой регенерации, восстановления плотности и эластичности кожи. Золотой стандарт регенеративной косметологии в К-бьюти.",
      en: "Rejuran at GENEVITY — polynucleotide (PDRN) salmon DNA injections for deep regeneration, density and elasticity restoration. The gold standard of regenerative cosmetology in K-beauty.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Реджуран — полінуклеотиди для регенерації шкіри", ru: "Реджуран — полинуклеотиды для регенерации кожи", en: "Rejuran — Polynucleotides for Skin Regeneration" },
        body: {
          uk: "Rejuran — препарат корейської компанії Pharmos Biopharma на основі PDRN (Polydeoxyribonucleotide) — полінуклеотидів, виділених із ДНК лосося. Молекули PDRN активують аденозинові A2A-рецептори фібробластів, запускаючи синтез колагену і еластину, прискорюючи клітинний метаболізм та пригнічуючи протизапальні шляхи. Ефект Rejuran — відновлення щільності і пружності шкіри на рівні архітектоніки дерми: шкіра стає товщою, менш пухкою, виглядає молодше без будь-якого заповнення об'єму. Це принципово відрізняє Rejuran від філерів і біоревіталізантів: він не заповнює — він реструктурує. Особливо популярний у корекції зони навколо очей, шиї і декольте — де інші препарати вводити ризиковано через тонку шкіру.",
          ru: "Rejuran — препарат корейской компании Pharmos Biopharma на основе PDRN (Polydeoxyribonucleotide) — полинуклеотидов, выделенных из ДНК лосося. Молекулы PDRN активируют аденозиновые A2A-рецепторы фибробластов, запуская синтез коллагена и эластина, ускоряя клеточный метаболизм и подавляя провоспалительные пути. Эффект Rejuran — восстановление плотности и упругости кожи на уровне архитектоники дермы: кожа становится толще, менее рыхлой, выглядит моложе без какого-либо заполнения объёма. Это принципиально отличает Rejuran от филлеров и биоревитализантов: он не заполняет — он реструктурирует. Особенно популярен в коррекции зоны вокруг глаз, шеи и декольте — где другие препараты вводить рискованно из-за тонкой кожи.",
          en: "Rejuran is a preparation by Korean company Pharmos Biopharma based on PDRN (Polydeoxyribonucleotide) — polynucleotides extracted from salmon DNA. PDRN molecules activate adenosine A2A receptors of fibroblasts, triggering collagen and elastin synthesis, accelerating cellular metabolism, and suppressing pro-inflammatory pathways. Rejuran's effect is restoring skin density and firmness at the dermal architecture level: skin becomes thicker, less lax, and looks younger without any volume filling. This fundamentally differs from fillers and biorevitalisants: it does not fill — it restructures. Particularly popular for periorbital zone, neck, and décolletage correction — where other preparations are risky due to thin skin.",
        },
        calloutBody: {
          uk: "Rejuran Healer відновлює «паспортний» вік шкіри — її товщину і щільність. Після курсу шкіра реагує краще на всі інші процедури і косметику: вона стає більш receptive до активних компонентів.",
          ru: "Rejuran Healer восстанавливает «паспортный» возраст кожи — её толщину и плотность. После курса кожа лучше реагирует на все другие процедуры и косметику: она становится более receptive к активным компонентам.",
          en: "Rejuran Healer restores the skin's 'passport age' — its thickness and density. After the course, skin responds better to all other procedures and cosmetics: it becomes more receptive to active ingredients.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до Реджуран", ru: "Показания к Реджуран", en: "Indications for Rejuran" },
        indications: [
          { uk: "Витончена, ослаблена шкіра зі зниженою щільністю і тонусом", ru: "Истончённая, ослабленная кожа со сниженной плотностью и тонусом", en: "Thinned, weakened skin with reduced density and tone" },
          { uk: "Тонка шкіра навколо очей, шиї і декольте — зони ризику для філерів", ru: "Тонкая кожа вокруг глаз, шеи и декольте — зоны риска для филлеров", en: "Thin periorbital, neck, and décolletage skin — risky zones for fillers" },
          { uk: "Відновлення після агресивних процедур (лазер, пілінг)", ru: "Восстановление после агрессивных процедур (лазер, пилинг)", en: "Recovery after aggressive procedures (laser, peeling)" },
          { uk: "Зміцнення і підготовка шкіри перед ін'єкційними програмами", ru: "Укрепление и подготовка кожи перед инъекционными программами", en: "Skin strengthening and preparation before injection programs" },
          { uk: "Профілактика і корекція перших ознак старіння від 30 років", ru: "Профилактика и коррекция первых признаков старения от 30 лет", en: "Prevention and correction of first aging signs from age 30" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Алергія на рибу та морепродукти (PDRN лососевого походження)", ru: "Аллергия на рыбу и морепродукты (PDRN лососевого происхождения)", en: "Fish and seafood allergy (salmon-derived PDRN)" },
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Активні запалення та інфекції у зоні ін'єкцій", ru: "Активные воспаления и инфекции в зоне инъекций", en: "Active inflammation and infections in the injection area" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Oncological diseases" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура Реджуран", ru: "Как проходит процедура Реджуран", en: "Rejuran Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація та алерго-скринінг", ru: "Консультация и аллерго-скрининг", en: "Consultation and Allergy Screening" },
            description: { uk: "Лікар уточнює алергоанамнез (особливо на рибу), оцінює стан шкіри і обирає між Rejuran Healer, Rejuran I (очна зона) або Rejuran S (рубці).", ru: "Врач уточняет аллергологический анамнез (особенно на рыбу), оценивает состояние кожи и выбирает между Rejuran Healer, Rejuran I (глазная зона) или Rejuran S (рубцы).", en: "The physician clarifies allergy history (especially fish), assesses skin condition, and selects between Rejuran Healer, Rejuran I (eye zone), or Rejuran S (scars)." },
          },
          {
            title: { uk: "Анестезія крем-EMLA", ru: "Анестезия крем-EMLA", en: "EMLA Cream Anesthesia" },
            description: { uk: "Крем-анестетик за 30 хв. Шкіру ретельно знежирюють перед ін'єкціями.", ru: "Крем-анестетик за 30 мин. Кожу тщательно обезжиривают перед инъекциями.", en: "Anesthetic cream 30 minutes before. Skin is thoroughly degreased before injections." },
          },
          {
            title: { uk: "Мікропапульне введення PDRN", ru: "Микропапульное введение PDRN", en: "Micropapular PDRN Injection" },
            description: { uk: "Препарат вводять мікроін'єкціями кожні 1 см по всій зоні. Наконечники утворюють рівномірний шар у дермі. Тривалість — 30–45 хв.", ru: "Препарат вводят микроинъекциями каждые 1 см по всей зоне. Наконечники формируют равномерный слой в дерме. Длительность — 30–45 мин.", en: "Preparation is injected via micro-injections every 1 cm across the zone. A uniform dermal layer is formed. Duration: 30–45 minutes." },
          },
          {
            title: { uk: "Заспокоєння та рекомендації", ru: "Успокоение и рекомендации", en: "Soothing and Recommendations" },
            description: { uk: "Наносять заспокійливу маску. Не мочіть зону 6 год. Синці можливі — мають зникнути за 24–48 год.", ru: "Наносят успокаивающую маску. Не мочите зону 6 ч. Синяки возможны — исчезают за 24–48 ч.", en: "Soothing mask applied. Do not wet the area for 6h. Bruising is possible — resolves in 24–48h." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості Реджуран", ru: "Преимущества и особенности Реджуран", en: "Rejuran Advantages and Considerations" },
        items: [
          { uk: "Реструктурує дерму — збільшує товщину і щільність без заповнення об'єму", ru: "Реструктурирует дерму — увеличивает толщину и плотность без заполнения объёма", en: "Restructures the dermis — increases thickness and density without volume filling" },
          { uk: "Безпечний для тонкої шкіри навколо очей, шиї і декольте", ru: "Безопасен для тонкой кожи вокруг глаз, шеи и декольте", en: "Safe for thin skin around the eyes, neck, and décolletage" },
          { uk: "Потужний протизапальний ефект — покращує шкіру зі схильністю до акне", ru: "Мощный противовоспалительный эффект — улучшает кожу со склонностью к акне", en: "Powerful anti-inflammatory effect — improves acne-prone skin" },
          { uk: "Добре поєднується з ботулінотерапією, контурною пластикою і лазером", ru: "Хорошо сочетается с ботулинотерапией, контурной пластикой и лазером", en: "Works well with botulinum therapy, contouring, and laser" },
          { uk: "⚠ Ефект наростає через 4–8 тижнів — не судіть по перших 2 тижнях", ru: "⚠ Эффект нарастает через 4–8 недель — не судите по первым 2 неделям", en: "⚠ Effect builds over 4–8 weeks — do not judge by the first 2 weeks" },
          { uk: "⚠ Протипоказаний при алергії на рибу — обов'язково повідомте лікаря", ru: "⚠ Противопоказан при аллергии на рыбу — обязательно сообщите врачу", en: "⚠ Contraindicated for fish allergy — be sure to inform the physician" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Чим Реджуран відрізняється від біоревіталізації?", ru: "Чем Реджуран отличается от биоревитализации?", en: "How does Rejuran differ from biorevitalisation?" },
        answer: { uk: "Біоревіталізація — ГК для зволоження і гідробалансу. Реджуран — PDRN для відновлення щільності дерми і стимуляції синтезу власного колагену на структурному рівні. Різні механізми, часто доповнюють одне одного.", ru: "Биоревитализация — ГК для увлажнения и гидробаланса. Реджуран — PDRN для восстановления плотности дермы и стимуляции синтеза собственного коллагена на структурном уровне. Разные механизмы, часто дополняют друг друга.", en: "Biorevitalisation is HA for hydration and water balance. Rejuran is PDRN for restoring dermal density and stimulating own collagen synthesis at a structural level. Different mechanisms — often complementary." },
      },
      {
        question: { uk: "Скільки процедур Реджуран потрібно?", ru: "Сколько процедур Реджуран нужно?", en: "How many Rejuran procedures are needed?" },
        answer: { uk: "Курс — 3 процедури з інтервалом 3–4 тижні. Підтримувальна — 1–2 рази на рік. Ефект зберігається 9–12 місяців після курсу.", ru: "Курс — 3 процедуры с интервалом 3–4 недели. Поддерживающая — 1–2 раза в год. Эффект сохраняется 9–12 месяцев после курса.", en: "Course — 3 procedures every 3–4 weeks. Maintenance — 1–2 times per year. Effect lasts 9–12 months after the course." },
      },
    ],
  },

  // ─── JUVEDERM ──────────────────────────────────────────────────────────────
  {
    slug: "juvederm",
    summary: {
      uk: "Juvederm у GENEVITY — преміальна лінійка зшитих філерів від Allergan з технологією VYCROSS для природного результату, мінімального набряку і максимальної тривалості ефекту до 18–24 місяців.",
      ru: "Juvederm в GENEVITY — премиальная линейка сшитых филлеров от Allergan с технологией VYCROSS для естественного результата, минимального отёка и максимальной длительности эффекта до 18–24 месяцев.",
      en: "Juvederm at GENEVITY — Allergan's premium crosslinked filler range with VYCROSS technology for natural results, minimal swelling, and maximum effect duration of 18–24 months.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Juvederm — преміальні філери з технологією VYCROSS", ru: "Juvederm — премиальные филлеры с технологией VYCROSS", en: "Juvederm — Premium Fillers with VYCROSS Technology" },
        body: {
          uk: "Juvederm — флагманська лінійка філерів на основі гіалуронової кислоти від Allergan (AbbVie). Головна технологічна відмінність — метод зшивання VYCROSS: поперечний зв'язок між молекулами різних молекулярних мас (низько- і високомолекулярна ГК) формує однорідний гель з надзвичайно гладкою консистенцією. Переваги VYCROSS-технології: мінімальний набряк після введення (менше вільної ГК, яка зв'язує воду), більш тривала ефективність (18–24 місяці в зонах зі слабкою мімікою) і точна пластичність при моделюванні. У GENEVITY використовують весь спектр лінійки: Volite — для поверхневого зволоження, Volbella — для губ і дрібних зморшок, Vollure — для носогубних складок, Voluma — для вилиць і підборіддя, Volift — для середньої третини і medium-глибоких ліній. Вибір конкретного препарату — завжди рішення лікаря після анатомічного аналізу.",
          ru: "Juvederm — флагманская линейка филлеров на основе гиалуроновой кислоты от Allergan (AbbVie). Главное технологическое отличие — метод сшивки VYCROSS: поперечная связь между молекулами разных молекулярных масс (низко- и высокомолекулярная ГК) формирует однородный гель с исключительно гладкой консистенцией. Преимущества VYCROSS-технологии: минимальный отёк после введения (меньше свободной ГК, связывающей воду), более длительная эффективность (18–24 месяца в зонах со слабой мимикой) и точная пластичность при моделировании. В GENEVITY используют весь спектр линейки: Volite — для поверхностного увлажнения, Volbella — для губ и мелких морщин, Vollure — для носогубных складок, Voluma — для скул и подбородка, Volift — для средней трети и medium-глубоких линий. Выбор конкретного препарата — всегда решение врача после анатомического анализа.",
          en: "Juvederm is Allergan's (AbbVie) flagship hyaluronic acid filler range. The key technological differentiator is VYCROSS crosslinking: cross-bonds between molecules of different molecular weights (low- and high-MW HA) form a uniform gel with exceptionally smooth consistency. VYCROSS advantages: minimal post-injection swelling (less free HA binding water), longer efficacy (18–24 months in low-movement zones), and precise plasticity when sculpting. GENEVITY uses the full range: Volite for superficial hydration, Volbella for lips and fine lines, Vollure for nasolabial folds, Voluma for cheekbones and chin, Volift for mid-face and medium-depth lines. The choice of specific preparation is always the physician's decision after anatomical analysis.",
        },
        calloutBody: {
          uk: "VYCROSS-філери виробляються з ліцензованою кількістю лідокаїну — анестетика, вбудованого у гель. Це робить введення Juvederm значно комфортнішим порівняно з препаратами без лідокаїну.",
          ru: "VYCROSS-филлеры производятся с лицензированным количеством лидокаина — анестетика, встроенного в гель. Это делает введение Juvederm значительно комфортнее по сравнению с препаратами без лидокаина.",
          en: "VYCROSS fillers are manufactured with a licensed amount of lidocaine — an anesthetic built into the gel. This makes Juvederm injection significantly more comfortable than preparations without lidocaine.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до Juvederm", ru: "Показания к Juvederm", en: "Indications for Juvederm" },
        indications: [
          { uk: "Збільшення та корекція контуру губ (Volbella, Volift)", ru: "Увеличение и коррекция контура губ (Volbella, Volift)", en: "Lip augmentation and contour correction (Volbella, Volift)" },
          { uk: "Корекція носогубних складок і маріонеткових ліній (Vollure)", ru: "Коррекция носогубных складок и марионеточных линий (Vollure)", en: "Nasolabial fold and marionette line correction (Vollure)" },
          { uk: "Відновлення і підняття об'єму вилиць (Voluma)", ru: "Восстановление и подъём объёма скул (Voluma)", en: "Cheekbone volume restoration and lifting (Voluma)" },
          { uk: "Моделювання підборіддя і чіткого jaw-контуру (Voluma)", ru: "Моделирование подбородка и чёткого jaw-контура (Voluma)", en: "Chin and jawline sculpting (Voluma)" },
          { uk: "Поверхневе зволоження і мікроліфтинг шкіри (Volite)", ru: "Поверхностное увлажнение и микролифтинг кожи (Volite)", en: "Superficial hydration and micro-lifting (Volite)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Алергія на лідокаїн або компоненти ГК-гелю", ru: "Аллергия на лидокаин или компоненты ГК-геля", en: "Allergy to lidocaine or HA gel components" },
          { uk: "Активні запалення, герпес або інфекції у зоні", ru: "Активные воспаления, герпес или инфекции в зоне", en: "Active inflammation, herpes, or infections in the area" },
          { uk: "Наявний постійний імплантат або силікон у зоні", ru: "Наличие перманентного имплантата или силикона в зоне", en: "Permanent implant or silicone already in the area" },
          { uk: "Прийом антикоагулянтів", ru: "Приём антикоагулянтов", en: "Anticoagulant use" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура з Juvederm", ru: "Как проходит процедура с Juvederm", en: "Juvederm Procedure Steps" },
        steps: [
          {
            title: { uk: "Анатомічна консультація і вибір препарату", ru: "Анатомическая консультация и выбор препарата", en: "Anatomical Consultation and Preparation Selection" },
            description: { uk: "Лікар аналізує пропорції, виявляє дефіцит об'єму і вибирає конкретний Juvederm із лінійки залежно від зони і задачі.", ru: "Врач анализирует пропорции, выявляет дефицит объёма и выбирает конкретный Juvederm из линейки в зависимости от зоны и задачи.", en: "The physician analyzes proportions, identifies volume deficit, and selects the specific Juvederm product based on the zone and goal." },
          },
          {
            title: { uk: "Підготовка і анестезія", ru: "Подготовка и анестезия", en: "Preparation and Anesthesia" },
            description: { uk: "Топічний анестетик або блокада. Juvederm вже містить лідокаїн у гелі — що знижує дискомфорт при введенні.", ru: "Топический анестетик или блокада. Juvederm уже содержит лидокаин в геле — что снижает дискомфорт при введении.", en: "Topical anesthetic or nerve block. Juvederm already contains lidocaine in the gel — reducing discomfort during injection." },
          },
          {
            title: { uk: "Введення голкою або канюлею", ru: "Введение иглой или канюлей", en: "Injection via Needle or Cannula" },
            description: { uk: "Лікар обирає техніку залежно від зони: канюля — для безпечніших зон з розгалуженою судинною сіткою, голка — для точних депо. Тривалість — 20–50 хв.", ru: "Врач выбирает технику в зависимости от зоны: канюля — для безопасных зон с разветвлённой сосудистой сетью, игла — для точных депо. Длительность — 20–50 мин.", en: "The physician selects the technique by zone: cannula for safer zones with branched vessels, needle for precise depots. Duration: 20–50 minutes." },
          },
          {
            title: { uk: "Моделювання та оцінка результату", ru: "Моделирование и оценка результата", en: "Sculpting and Result Assessment" },
            description: { uk: "Після введення лікар моделює форму, перевіряє симетрію. Результат оцінюють через 10–14 днів після зникнення набряку.", ru: "После введения врач моделирует форму, проверяет симметрию. Результат оценивают через 10–14 дней после исчезновения отёка.", en: "After injection the physician sculpts shape and checks symmetry. Result is assessed at 10–14 days after swelling subsides." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості Juvederm", ru: "Преимущества и особенности Juvederm", en: "Juvederm Advantages and Considerations" },
        items: [
          { uk: "VYCROSS-технологія: мінімальний набряк і природна гладкість гелю", ru: "VYCROSS-технология: минимальный отёк и естественная гладкость геля", en: "VYCROSS technology: minimal swelling and natural gel smoothness" },
          { uk: "Тривалість ефекту 12–24 місяці — найдовша серед ГК-філерів", ru: "Длительность эффекту 12–24 месяца — наидольше среди ГК-филлеров", en: "Effect duration 12–24 months — longest among HA fillers" },
          { uk: "Лідокаїн у складі гелю робить процедуру значно комфортнішою", ru: "Лидокаин в составе геля делает процедуру значительно комфортнее", en: "Lidocaine in the gel makes the procedure significantly more comfortable" },
          { uk: "Зворотність: повністю розчиняється гіалуронідазою за необхідності", ru: "Обратимость: полностью растворяется гиалуронидазой при необходимости", en: "Reversibility: fully dissolved by hyaluronidase if needed" },
          { uk: "⚠ Набряк після введення у губи — 3–5 днів, планувати з урахуванням подій", ru: "⚠ Отёк после введения в губы — 3–5 дней, планировать с учётом событий", en: "⚠ Post-lip-injection swelling 3–5 days — plan around events accordingly" },
          { uk: "⚠ Реальний результат оцінюється через 10–14 днів — не через годину", ru: "⚠ Реальный результат оценивается через 10–14 дней — не через час", en: "⚠ True result assessed at 10–14 days — not immediately after injection" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Juvederm чи Restylane — що краще?", ru: "Juvederm или Restylane — что лучше?", en: "Juvederm or Restylane — which is better?" },
        answer: { uk: "Обидва — преміальні препарати з доведеною ефективністю. Juvederm VYCROSS дає мінший набряк і триваліший ефект. Restylane (XpresHAn-технологія) має кращу рухливість і підходить для зон з активною мімікою. Вибір — за лікарем і показаннями.", ru: "Оба — премиальные препараты с доказанной эффективностью. Juvederm VYCROSS даёт меньший отёк и более длительный эффект. Restylane (XpresHAn-технология) имеет лучшую подвижность и подходит для зон с активной мимикой. Выбор — за врачом и показаниями.", en: "Both are premium preparations with proven efficacy. Juvederm VYCROSS gives less swelling and longer effect. Restylane (XpresHAn technology) has better mobility for high-movement zones. The choice is the physician's based on indications." },
      },
      {
        question: { uk: "Через скільки зійде набряк після губ?", ru: "Через сколько сойдёт отёк после губ?", en: "When does lip swelling subside?" },
        answer: { uk: "Основний набряк — 24–72 год. Залишковий — до 10–14 днів. VYCROSS-технологія мінімізує набряк порівняно зі звичайними ГК-філерами.", ru: "Основной отёк — 24–72 ч. Остаточный — до 10–14 дней. VYCROSS-технология минимизирует отёк по сравнению с обычными ГК-филлерами.", en: "Main swelling: 24–72h. Residual: up to 10–14 days. VYCROSS technology minimizes swelling vs. standard HA fillers." },
      },
    ],
  },

  // ─── POLYPHIL ─────────────────────────────────────────────────────────────
  {
    slug: "polyphil",
    summary: {
      uk: "PolyPhil у GENEVITY — ін'єкційний імплантат на основі полімолочної кислоти (PLLA) для об'ємного ліфтингу і довгострокового стимулювання власного колагену. Ефект зберігається до 2 років і більше.",
      ru: "PolyPhil в GENEVITY — инъекционный имплантат на основе полимолочной кислоты (PLLA) для объёмного лифтинга и долгосрочной стимуляции собственного коллагена. Эффект сохраняется до 2 лет и более.",
      en: "PolyPhil at GENEVITY — poly-L-lactic acid (PLLA) injectable implant for volumetric lifting and long-term endogenous collagen stimulation. Effect lasts up to 2 years and beyond.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "PolyPhil — біостимулятор колагену на основі PLLA", ru: "PolyPhil — биостимулятор коллагена на основе PLLA", en: "PolyPhil — PLLA-Based Collagen Biostimulator" },
        body: {
          uk: "PolyPhil — ін'єкційний препарат на основі полімолочної кислоти (PLLA) — біосумісного і біодеградуючого полімеру, що широко використовується в медицині (шовний матеріал, ортопедичні імплантати). На відміну від ГК-філерів, PLLA не заповнює об'єм безпосередньо: мікрочастки PLLA діють як каркасна структура, стимулюючи оточуючі тканини до синтезу власного колагену навколо кожної частки. З часом PLLA повністю розкладається (гідроліз до молочної кислоти), але сформований неоколаген залишається. Результат поступово наростає протягом 3–6 місяців після введення і зберігається до 24 місяців і більше. PolyPhil відрізняється від Sculptra (теж PLLA) модернізованою формулою з оптимізованим розміром частинок, що мінімізує ризик нодулів.",
          ru: "PolyPhil — инъекционный препарат на основе полимолочной кислоты (PLLA) — биосовместимого и биодеградируемого полимера, широко используемого в медицине (шовный материал, ортопедические имплантаты). В отличие от ГК-филлеров, PLLA не заполняет объём непосредственно: микрочастицы PLLA действуют как каркасная структура, стимулируя окружающие ткани к синтезу собственного коллагена вокруг каждой частицы. Со временем PLLA полностью разлагается (гидролиз до молочной кислоты), но сформированный неоколлаген остаётся. Результат постепенно нарастает в течение 3–6 месяцев после введения и сохраняется до 24 месяцев и более. PolyPhil отличается от Sculptra (тоже PLLA) модернизированной формулой с оптимизированным размером частиц, что минимизирует риск нодулей.",
          en: "PolyPhil is an injectable preparation based on poly-L-lactic acid (PLLA) — a biocompatible and biodegradable polymer widely used in medicine (sutures, orthopedic implants). Unlike HA fillers, PLLA does not fill volume directly: PLLA microparticles act as a scaffolding structure, stimulating surrounding tissues to synthesize endogenous collagen around each particle. PLLA gradually degrades completely (hydrolysis to lactic acid), but the neocollagen formed remains. Results build gradually over 3–6 months and last up to 24 months or more. PolyPhil differs from Sculptra (also PLLA) with an optimized particle size formula minimizing nodule risk.",
        },
        calloutBody: {
          uk: "PolyPhil — вибір для пацієнтів, які хочуть максимально природний і тривалий результат: ефект нарощується поступово разом із власним колагеном і не дає різкого «щойно зробленого» вигляду.",
          ru: "PolyPhil — выбор для пациентов, которые хотят максимально естественный и длительный результат: эффект нарастает постепенно вместе с собственным коллагеном и не даёт резкого «только что сделанного» вида.",
          en: "PolyPhil is the choice for patients who want the most natural and long-lasting result: the effect builds gradually alongside endogenous collagen and avoids the sudden 'just-done' look.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до PolyPhil", ru: "Показания к PolyPhil", en: "Indications for PolyPhil" },
        indications: [
          { uk: "Значна вікова втрата об'єму вилиць, скронь, нижньої третини", ru: "Значительная возрастная потеря объёма скул, висков, нижней трети", en: "Significant age-related volume loss in cheeks, temples, lower face" },
          { uk: "Глибокі носогубні складки і маріонеткові зморшки", ru: "Глубокие носогубные складки и марионеточные морщины", en: "Deep nasolabial folds and marionette lines" },
          { uk: "Пацієнти, які шукають тривалий ефект (понад 18 місяців)", ru: "Пациенты, ищущие длительный эффект (более 18 месяцев)", en: "Patients seeking long-lasting effect (over 18 months)" },
          { uk: "Поступова натуральна корекція без різких змін", ru: "Постепенная натуральная коррекция без резких изменений", en: "Gradual natural correction without abrupt changes" },
          { uk: "Відновлення після значного схуднення з птозом м'яких тканин", ru: "Восстановление после значительного похудения с птозом мягких тканей", en: "Restoration after significant weight loss with soft tissue ptosis" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and lactation" },
          { uk: "Аутоімунні захворювання і системні запальні стани", ru: "Аутоиммунные заболевания и системные воспалительные состояния", en: "Autoimmune diseases and systemic inflammatory conditions" },
          { uk: "Активні запалення та інфекції у зоні ін'єкцій", ru: "Активные воспаления и инфекции в зоне инъекций", en: "Active inflammation and infections in the injection area" },
          { uk: "Схильність до келоїдних рубців", ru: "Склонность к келоидным рубцам", en: "Tendency to keloid scarring" },
          { uk: "Прийом імунодепресантів", ru: "Приём иммунодепрессантов", en: "Immunosuppressant use" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура PolyPhil", ru: "Как проходит процедура PolyPhil", en: "PolyPhil Procedure Steps" },
        steps: [
          {
            title: { uk: "Консультація та розробка протоколу", ru: "Консультация и разработка протокола", en: "Consultation and Protocol Development" },
            description: { uk: "Лікар аналізує стан шкіри і об'єм дефіциту, пояснює градуальний характер результату, розраховує дозу і зони введення.", ru: "Врач анализирует состояние кожи и объём дефицита, объясняет градуальный характер результата, рассчитывает дозу и зоны введения.", en: "The physician analyzes skin condition and volume deficit, explains the gradual nature of results, calculates dose and injection zones." },
          },
          {
            title: { uk: "Підготовка суспензії та анестезія", ru: "Подготовка суспензии и анестезия", en: "Suspension Preparation and Anesthesia" },
            description: { uk: "PolyPhil ресуспендують у розчиннику (зазвичай 5 мл стерильної води + лідокаїн). Крем-анестетик або блокада залежно від зони.", ru: "PolyPhil ресуспендируют в растворителе (обычно 5 мл стерильной воды + лидокаин). Крем-анестетик или блокада в зависимости от зоны.", en: "PolyPhil is resuspended in solvent (usually 5 ml sterile water + lidocaine). Anesthetic cream or nerve block depending on zone." },
          },
          {
            title: { uk: "Глибоке введення канюлею", ru: "Глубокое введение канюлей", en: "Deep Injection via Cannula" },
            description: { uk: "PLLA вводять у глибокі шари (супраперіостально або глибока дерма) рівномірними депо. Канюля мінімізує ризик судинних ускладнень. Тривалість — 30–60 хв.", ru: "PLLA вводят в глубокие слои (супрапериостально или глубокая дерма) равномерными депо. Канюля минимизирует риск сосудистых осложнений. Длительность — 30–60 мин.", en: "PLLA is injected into deep layers (supraperiosteal or deep dermis) as uniform depots. Cannula minimizes vascular complication risk. Duration: 30–60 minutes." },
          },
          {
            title: { uk: "Масаж «5×5» і реабілітація", ru: "Массаж «5×5» и реабилитация", en: "5×5 Massage and Rehabilitation" },
            description: { uk: "Після кожної процедури — обов'язковий масаж 5 хв, 5 разів на день, 5 днів. Це розподіляє PLLA-частки і запобігає нодулям.", ru: "После каждой процедуры — обязательный массаж 5 мин, 5 раз в день, 5 дней. Это распределяет PLLA-частицы и предотвращает нодули.", en: "After each session — mandatory massage 5 minutes, 5 times daily for 5 days. This distributes PLLA particles and prevents nodules." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості PolyPhil", ru: "Преимущества и особенности PolyPhil", en: "PolyPhil Advantages and Considerations" },
        items: [
          { uk: "Найтриваліший ефект серед ін'єкційних методик — до 24+ місяців", ru: "Наидольший эффект среди инъекционных методик — до 24+ месяцев", en: "Longest effect among injectable methods — up to 24+ months" },
          { uk: "Результат формується власним колагеном — абсолютно природний вигляд", ru: "Результат формируется собственным коллагеном — абсолютно естественный вид", en: "Result formed by own collagen — completely natural appearance" },
          { uk: "Поступова зміна без різкого «перекаченого» ефекту", ru: "Постепенное изменение без резкого «перекачанного» эффекта", en: "Gradual change without sudden 'overfilled' effect" },
          { uk: "Біодеградується повністю — жодних чужорідних матеріалів не залишається", ru: "Биодеградирует полностью — никаких чужеродных материалов не остаётся", en: "Fully biodegrades — no foreign material remains" },
          { uk: "⚠ Ефект проявляється через 3–6 місяців — потрібне очікування", ru: "⚠ Эффект проявляется через 3–6 месяцев — нужно ожидание", en: "⚠ Effect appears in 3–6 months — patience is required" },
          { uk: "⚠ Обов'язковий масаж після процедури — невиконання підвищує ризик нодулів", ru: "⚠ Обязательный массаж после процедуры — невыполнение повышает риск нодулей", en: "⚠ Mandatory post-procedure massage — skipping it increases nodule risk" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Чим PolyPhil відрізняється від ГК-філерів?", ru: "Чем PolyPhil отличается от ГК-филлеров?", en: "How does PolyPhil differ from HA fillers?" },
        answer: { uk: "ГК-філери заповнюють об'єм одразу — результат видно відразу, тривалість 9–18 місяців, розчиняються гіалуронідазою. PolyPhil стимулює власний колаген — результат через 3–6 місяців, тривалість 24+ місяці, не розчиняється ферментами. Різні підходи для різних ситуацій.", ru: "ГК-филлеры заполняют объём сразу — результат виден сразу, длительность 9–18 месяцев, растворяются гиалуронидазой. PolyPhil стимулирует собственный коллаген — результат через 3–6 месяцев, длительность 24+ месяца, не растворяется ферментами. Разные подходы для разных ситуаций.", en: "HA fillers fill volume immediately — results visible at once, 9–18 month duration, dissolved by hyaluronidase. PolyPhil stimulates own collagen — results in 3–6 months, 24+ month duration, not dissolved by enzymes. Different approaches for different situations." },
      },
      {
        question: { uk: "Навіщо масаж після PolyPhil?", ru: "Зачем массаж после PolyPhil?", en: "Why is massage needed after PolyPhil?" },
        answer: { uk: "Масаж рівномірно розподіляє мікрочастинки PLLA у тканині, запобігаючи їх концентрації в одній точці. Без масажу зростає ризик утворення нодулів (ущільнень). Правило 5×5×5 — 5 хв, 5 разів на день, 5 днів.", ru: "Массаж равномерно распределяет микрочастицы PLLA в ткани, предотвращая их концентрацию в одной точке. Без массажа возрастает риск образования нодулей (уплотнений). Правило 5×5×5 — 5 мин, 5 раз в день, 5 дней.", en: "Massage evenly distributes PLLA microparticles in the tissue, preventing their concentration at one point. Without massage, nodule (lump) formation risk increases. The 5×5×5 rule — 5 minutes, 5 times a day, 5 days." },
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
  console.log("\nV4-injectable-b DONE.");
}

main().catch((e) => { console.error(e); process.exit(1); });
