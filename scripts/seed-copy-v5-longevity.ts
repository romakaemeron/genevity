/**
 * V5-longevity — check-up-40, hormonal-balance, iv-therapy, longevity-program, nutraceuticals
 * Fresh seed with section variety: richText + indicationsContraindications + steps + bullets
 * Run: npx tsx scripts/seed-copy-v5-longevity.ts
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
  // ─── CHECK-UP 40+ ─────────────────────────────────────────────────────────
  {
    slug: "check-up-40",
    summary: {
      uk: "Check-Up 40+ у GENEVITY — розширена діагностична панель для людей після 40 років: гормони, маркери запалення, метаболізм, мікробіом і біологічний вік. Результат — персоналізована roadmap здоров'я і довголіття.",
      ru: "Check-Up 40+ в GENEVITY — расширенная диагностическая панель для людей после 40 лет: гормоны, маркеры воспаления, метаболизм, микробиом и биологический возраст. Результат — персонализированная roadmap здоровья и долголетия.",
      en: "Check-Up 40+ at GENEVITY — comprehensive diagnostic panel for people over 40: hormones, inflammation markers, metabolism, microbiome, and biological age. The result — a personalized health and longevity roadmap.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Check-Up 40+ — діагностика для керованого довголіття", ru: "Check-Up 40+ — диагностика для управляемого долголетия", en: "Check-Up 40+ — Diagnostics for Managed Longevity" },
        body: {
          uk: "Після 40 років тіло починає демонструвати перші системні зміни: знижується рівень анаболічних гормонів, наростає субклінічне запалення, знижується чутливість до інсуліну, накопичуються сенесцентні клітини. Ці процеси непомітні суб'єктивно на ранньому етапі, але виявляються лабораторно — і саме тут відкривається вікно для ефективного втручання. Check-Up 40+ в GENEVITY — це не стандартний аналіз крові на 8 показників. Це мультисистемна діагностика: гормональна панель (ЛГ, ФСГ, тестостерон/естроген, ДГЕА-С, IGF-1, кортизол, ТТГ, Т3/Т4), метаболічний профіль (інсулін, НОМА-IR, HbA1c, ліпідограма з розгорнутими фракціями), маркери запалення (СРБ hs, ІЛ-6, феритин), нутрієнтний статус (вітамін D, B12, фолат, залізо, цинк, магній), маркер клітинного старіння. За результатами — консультація лікаря anti-age медицини з побудовою персонального плану корекції.",
          ru: "После 40 лет тело начинает демонстрировать первые системные изменения: снижается уровень анаболических гормонов, нарастает субклиническое воспаление, снижается чувствительность к инсулину, накапливаются сенесцентные клетки. Эти процессы незаметны субъективно на раннем этапе, но выявляются лабораторно — и именно здесь открывается окно для эффективного вмешательства. Check-Up 40+ в GENEVITY — это не стандартный анализ крови на 8 показателей. Это мультисистемная диагностика: гормональная панель (ЛГ, ФСГ, тестостерон/эстроген, ДГЭА-С, IGF-1, кортизол, ТТГ, Т3/Т4), метаболический профиль (инсулин, НОМА-IR, HbA1c, липидограмма с развёрнутыми фракциями), маркеры воспаления (СРБ hs, ИЛ-6, ферритин), нутриентный статус (витамин D, B12, фолат, железо, цинк, магний), маркер клеточного старения. По результатам — консультация врача anti-age медицины с построением персонального плана коррекции.",
          en: "After 40, the body begins showing first systemic changes: anabolic hormone levels decline, subclinical inflammation grows, insulin sensitivity decreases, senescent cells accumulate. These processes are not felt subjectively at early stages but are detectable in labs — and this is exactly where the intervention window opens. Check-Up 40+ at GENEVITY is not a standard 8-marker blood test. It is multisystem diagnostics: hormonal panel (LH, FSH, testosterone/estrogen, DHEA-S, IGF-1, cortisol, TSH, T3/T4), metabolic profile (insulin, HOMA-IR, HbA1c, full lipid panel), inflammation markers (hs-CRP, IL-6, ferritin), nutrient status (vitamin D, B12, folate, iron, zinc, magnesium), cellular aging marker. The results are reviewed with an anti-aging medicine physician who builds a personalized correction plan.",
        },
        calloutBody: {
          uk: "Check-Up 40+ — точка відліку для будь-якої longevity-програми GENEVITY. Без базових вимірювань неможливо оцінити прогрес і скоригувати стратегію.",
          ru: "Check-Up 40+ — точка отсчёта для любой longevity-программы GENEVITY. Без базовых измерений невозможно оценить прогресс и скорректировать стратегию.",
          en: "Check-Up 40+ is the baseline for any GENEVITY longevity program. Without baseline measurements it is impossible to track progress or adjust the strategy.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Кому рекомендований Check-Up 40+", ru: "Кому рекомендован Check-Up 40+", en: "Who Should Do Check-Up 40+" },
        indications: [
          { uk: "Всі, кому виповнилося 40 років — навіть за відсутності скарг", ru: "Все, кому исполнилось 40 лет — даже при отсутствии жалоб", en: "Everyone who has turned 40 — even without complaints" },
          { uk: "Хронічна втома, зниження продуктивності і концентрації", ru: "Хроническая усталость, снижение продуктивности и концентрации", en: "Chronic fatigue, reduced productivity and concentration" },
          { uk: "Підвищена тривожність, порушення сну, зміни настрою", ru: "Повышенная тревожность, нарушения сна, изменения настроения", en: "Increased anxiety, sleep disturbances, mood changes" },
          { uk: "Зміни маси тіла без змін у харчуванні або навантаженнях", ru: "Изменения массы тела без изменений в питании или нагрузках", en: "Body weight changes without dietary or activity changes" },
          { uk: "Планування гормональних, нутрицевтичних або longevity-програм", ru: "Планирование гормональных, нутрицевтических или longevity-программ", en: "Planning hormonal, nutraceutical, or longevity programs" },
          { uk: "Щорічна превентивна діагностика для відстеження динаміки", ru: "Ежегодная превентивная диагностика для отслеживания динамики", en: "Annual preventive diagnostics for tracking dynamics" },
        ],
        contraindicationsHeading: { uk: "Особливі умови здачі аналізів", ru: "Особые условия сдачи анализов", en: "Special Conditions for Testing" },
        contraindications: [
          { uk: "Здавати натщесерце (8–12 год після останнього прийому їжі)", ru: "Сдавать натощак (8–12 ч после последнего приёма пищи)", en: "Fasting required (8–12 hours after last meal)" },
          { uk: "Не займатися інтенсивним спортом за 24 год до аналізу", ru: "Не заниматься интенсивным спортом за 24 ч до анализа", en: "Avoid intense exercise 24 hours before testing" },
          { uk: "Жінки: гормональну панель здавати на певний день циклу (уточнюється на консультації)", ru: "Женщины: гормональную панель сдавать на определённый день цикла (уточняется на консультации)", en: "Women: hormonal panel on specific cycle day (clarified at consultation)" },
          { uk: "Повідомити лікаря про поточний прийом гормональних препаратів", ru: "Сообщить врачу о текущем приёме гормональных препаратов", en: "Inform the physician about current hormonal medications" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить Check-Up 40+", ru: "Как проходит Check-Up 40+", en: "Check-Up 40+ Process" },
        steps: [
          {
            title: { uk: "Первинна консультація та анкетування", ru: "Первичная консультация и анкетирование", en: "Initial Consultation and Questionnaire" },
            description: { uk: "Лікар збирає анамнез, актуальні скарги, сімейну спадковість, спосіб життя і призначає індивідуальну панель аналізів.", ru: "Врач собирает анамнез, актуальные жалобы, семейную наследственность, образ жизни и назначает индивидуальную панель анализов.", en: "The physician collects history, current complaints, family history, lifestyle, and assigns an individual test panel." },
          },
          {
            title: { uk: "Лабораторний забір (натщесерце)", ru: "Лабораторный забор (натощак)", en: "Laboratory Sample Collection (Fasting)" },
            description: { uk: "Забір крові вранці натщесерце. За необхідності — додаткові зразки (сеча, слина для кортизолу). Результати готові за 3–5 робочих днів.", ru: "Забор крови утром натощак. При необходимости — дополнительные образцы (моча, слюна для кортизола). Результаты готовы через 3–5 рабочих дней.", en: "Blood draw in the morning, fasting. Additional samples (urine, saliva for cortisol) if needed. Results ready in 3–5 business days." },
          },
          {
            title: { uk: "Розшифровка та інтерпретація результатів", ru: "Расшифровка и интерпретация результатов", en: "Results Interpretation" },
            description: { uk: "Лікар anti-age медицини аналізує результати в контексті оптимальних (а не лише референсних) значень. Виявляє субклінічні відхилення.", ru: "Врач anti-age медицины анализирует результаты в контексте оптимальных (а не только референсных) значений. Выявляет субклинические отклонения.", en: "The anti-aging physician analyzes results in the context of optimal (not just reference) values. Identifies subclinical deviations." },
          },
          {
            title: { uk: "Персональний план корекції", ru: "Персональный план коррекции", en: "Personalized Correction Plan" },
            description: { uk: "Лікар формує roadmap: нутрицевтики, зміни способу життя, за показаннями — гормональна корекція, IV-терапія, longevity-протоколи.", ru: "Врач формирует roadmap: нутрицевтики, изменения образа жизни, по показаниям — гормональная коррекция, IV-терапия, longevity-протоколы.", en: "The physician forms a roadmap: nutraceuticals, lifestyle changes, and as indicated — hormonal correction, IV therapy, longevity protocols." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги Check-Up 40+ у GENEVITY", ru: "Преимущества Check-Up 40+ в GENEVITY", en: "Check-Up 40+ Advantages at GENEVITY" },
        items: [
          { uk: "Більше 40 показників — повна мультисистемна картина здоров'я", ru: "Более 40 показателей — полная мультисистемная картина здоровья", en: "Over 40 markers — complete multisystem health picture" },
          { uk: "Аналіз в контексті оптимальних значень для активного довголіття, не лише норми", ru: "Анализ в контексте оптимальных значений для активного долголетия, не только нормы", en: "Analysis in the context of optimal values for active longevity, not just reference ranges" },
          { uk: "Результат — конкретний персональний план, а не список рекомендацій «займайтеся спортом»", ru: "Результат — конкретный персональный план, а не список рекомендаций «занимайтесь спортом»", en: "Result — a specific personalized plan, not a list of 'exercise more' recommendations" },
          { uk: "Базис для всіх longevity-програм і гормональної корекції", ru: "Базис для всех longevity-программ и гормональной коррекции", en: "Foundation for all longevity programs and hormonal correction" },
          { uk: "⚠ Аналізи здаються натщесерце — плануйте ранній візит", ru: "⚠ Анализы сдаются натощак — планируйте ранний визит", en: "⚠ Tests require fasting — plan an early morning visit" },
          { uk: "⚠ Повторний Check-Up рекомендований через 6–12 місяців для оцінки динаміки", ru: "⚠ Повторный Check-Up рекомендован через 6–12 месяцев для оценки динамики", en: "⚠ Repeat Check-Up recommended in 6–12 months to track progress" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Скільки часу займає весь процес Check-Up?", ru: "Сколько времени занимает весь процесс Check-Up?", en: "How long does the entire Check-Up process take?" },
        answer: { uk: "Первинна консультація — 30–45 хв. Забір крові — 10–15 хв. Результати — 3–5 робочих днів. Консультація з розшифровкою — ще 45–60 хв.", ru: "Первичная консультация — 30–45 мин. Забор крови — 10–15 мин. Результаты — 3–5 рабочих дней. Консультация с расшифровкой — ещё 45–60 мин.", en: "Initial consultation — 30–45 min. Blood draw — 10–15 min. Results — 3–5 business days. Results interpretation consultation — another 45–60 min." },
      },
      {
        question: { uk: "Чи підходить Check-Up для чоловіків?", ru: "Подходит ли Check-Up для мужчин?", en: "Is Check-Up suitable for men?" },
        answer: { uk: "Так, і для жінок, і для чоловіків. Для чоловіків включає перевірку тестостерону (загальний і вільний), ГСПЗ, пролактин і PSA після 45 років.", ru: "Да, и для женщин, и для мужчин. Для мужчин включает проверку тестостерона (общий и свободный), ГСПГ, пролактин и ПСА после 45 лет.", en: "Yes, for both women and men. For men includes testosterone (total and free), SHBG, prolactin, and PSA from age 45." },
      },
      {
        question: { uk: "Що таке «оптимальні значення» на відміну від референсних?", ru: "Что такое «оптимальные значения» в отличие от референсных?", en: "What are 'optimal values' versus reference ranges?" },
        answer: { uk: "Референсний діапазон — норма для «середньо-популяційної» людини. Оптимальне значення — те, при якому доведено найнижчий ризик хвороб і найкраще самопочуття. Наприклад, рефренсна норма вітаміну D — від 30 нг/мл, але оптимум для імунітету і кісток — 60–80 нг/мл.", ru: "Референсный диапазон — норма для «среднепопуляционного» человека. Оптимальное значение — то, при котором доказан наименьший риск болезней и наилучшее самочувствие. Например, референсная норма витамина D — от 30 нг/мл, но оптимум для иммунитета и костей — 60–80 нг/мл.", en: "Reference range is normal for the 'average population person.' Optimal value is where the lowest disease risk and best well-being are proven. For example, the reference norm for vitamin D is from 30 ng/ml, but the optimum for immunity and bones is 60–80 ng/ml." },
      },
    ],
  },

  // ─── HORMONAL BALANCE ─────────────────────────────────────────────────────
  {
    slug: "hormonal-balance",
    summary: {
      uk: "Гормональний баланс у GENEVITY — медично кероване відновлення оптимального гормонального фону для чоловіків і жінок: корекція дефіциту тестостерону, естрогенів, ДГЕА, гормону росту і щитовидної залози.",
      ru: "Гормональный баланс в GENEVITY — медицински управляемое восстановление оптимального гормонального фона для мужчин и женщин: коррекция дефицита тестостерона, эстрогенов, ДГЭА, гормона роста и щитовидной железы.",
      en: "Hormonal Balance at GENEVITY — medically managed restoration of optimal hormonal profile for men and women: correction of testosterone, estrogen, DHEA, growth hormone, and thyroid deficiencies.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Гормональний баланс — фундамент здоров'я і довголіття", ru: "Гормональный баланс — фундамент здоровья и долголетия", en: "Hormonal Balance — The Foundation of Health and Longevity" },
        body: {
          uk: "Гормони — молекулярні сигнали, що регулюють метаболізм, настрій, сексуальну функцію, склад тіла, рівень енергії, стан шкіри і волосся, когнітивні функції та серцево-судинний ризик. З віком продукція більшості анаболічних гормонів знижується: тестостерон у чоловіків — приблизно на 1–2% на рік після 30 років; жіночий клімакс супроводжується різким падінням естрадіолу і прогестерону; ДГЕА-С знижується у обох статей, впливаючи на імунну відповідь і самопочуття. Дефіцит гормонів — не просто «вікова норма». Це клінічний стан, що підвищує ризик серцево-судинних хвороб, остеопорозу, метаболічного синдрому і когнітивного зниження. Гормональна корекція в GENEVITY — це персоналізований підхід після комплексної діагностики: вибір між біоідентичними гормонами, фітокоректорами і нутрицевтичними протоколами залежно від показань, ризиків і преференцій пацієнта.",
          ru: "Гормоны — молекулярные сигналы, регулирующие метаболизм, настроение, сексуальную функцию, состав тела, уровень энергии, состояние кожи и волос, когнитивные функции и сердечно-сосудистый риск. С возрастом продукция большинства анаболических гормонов снижается: тестостерон у мужчин — примерно на 1–2% в год после 30 лет; женский климакс сопровождается резким падением эстрадиола и прогестерона; ДГЭА-С снижается у обоих полов, влияя на иммунный ответ и самочувствие. Дефицит гормонов — не просто «возрастная норма». Это клиническое состояние, повышающее риск сердечно-сосудистых болезней, остеопороза, метаболического синдрома и когнитивного снижения. Гормональная коррекция в GENEVITY — это персонализированный подход после комплексной диагностики: выбор между биоидентичными гормонами, фитокорректорами и нутрицевтическими протоколами в зависимости от показаний, рисков и предпочтений пациента.",
          en: "Hormones are molecular signals regulating metabolism, mood, sexual function, body composition, energy levels, skin and hair condition, cognitive function, and cardiovascular risk. With age, most anabolic hormone production declines: testosterone in men decreases approximately 1–2% per year after 30; female menopause involves a sharp drop in estradiol and progesterone; DHEA-S declines in both sexes, affecting immune response and well-being. Hormonal deficiency is not just an 'age-related norm.' It is a clinical condition that increases the risk of cardiovascular disease, osteoporosis, metabolic syndrome, and cognitive decline. Hormonal correction at GENEVITY uses a personalized approach after comprehensive diagnostics: choosing between bioidentical hormones, phytocorrectors, and nutraceutical protocols based on indications, risks, and patient preference.",
        },
        calloutBody: {
          uk: "GENEVITY застосовує концепцію оптимізації, а не нормалізації: мета — гормональний рівень, при якому пацієнт почувається і функціонує найкраще, а не просто «не виходить за референс».",
          ru: "GENEVITY применяет концепцию оптимизации, а не нормализации: цель — гормональный уровень, при котором пациент чувствует себя и функционирует лучше всего, а не просто «не выходит за референс».",
          en: "GENEVITY applies the optimization, not normalization, concept: the goal is the hormonal level at which the patient feels and functions best — not simply 'staying within reference range.'",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до програми гормонального балансу", ru: "Показания к программе гормонального баланса", en: "Indications for Hormonal Balance Program" },
        indications: [
          { uk: "Хронічна втома, зниження лібідо і сексуальної функції", ru: "Хроническая усталость, снижение либидо и сексуальной функции", en: "Chronic fatigue, reduced libido and sexual function" },
          { uk: "Симптоми андропаузи у чоловіків (дефіцит тестостерону)", ru: "Симптомы андропаузы у мужчин (дефицит тестостерона)", en: "Male andropause symptoms (testosterone deficiency)" },
          { uk: "Перименопауза і менопауза у жінок", ru: "Перименопауза и менопауза у женщин", en: "Perimenopause and menopause in women" },
          { uk: "Збільшення жирової маси при нормальному харчуванні та активності", ru: "Увеличение жировой массы при нормальном питании и активности", en: "Fat mass increase despite normal diet and activity" },
          { uk: "Зниження м'язової маси, погіршення відновлення після спорту", ru: "Снижение мышечной массы, ухудшение восстановления после спорта", en: "Muscle mass decrease and impaired post-exercise recovery" },
          { uk: "Порушення сну, когнітивний туман, депресивні стани без очевидних причин", ru: "Нарушения сна, когнитивный туман, депрессивные состояния без очевидных причин", en: "Sleep disturbances, brain fog, depressive states without obvious cause" },
        ],
        contraindicationsHeading: { uk: "Обмеження до гормональної корекції", ru: "Ограничения к гормональной коррекции", en: "Limitations for Hormonal Correction" },
        contraindications: [
          { uk: "Гормонозалежні онкологічні захворювання в анамнезі", ru: "Гормонозависимые онкологические заболевания в анамнезе", en: "History of hormone-dependent cancers" },
          { uk: "Некоригована серцева недостатність або тромбоз", ru: "Некорригированная сердечная недостаточность или тромбоз", en: "Uncorrected heart failure or thrombosis" },
          { uk: "Важкі захворювання печінки (для пероральних форм)", ru: "Тяжёлые заболевания печени (для пероральных форм)", en: "Severe liver disease (for oral forms)" },
          { uk: "Вагітність (плануємо окремо — у рамках фертильної програми)", ru: "Беременность (планируется отдельно — в рамках фертильной программы)", en: "Pregnancy (planned separately within a fertility program)" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить програма гормонального балансу", ru: "Как проходит программа гормонального баланса", en: "Hormonal Balance Program Steps" },
        steps: [
          {
            title: { uk: "Гормональна діагностика і аналіз ризиків", ru: "Гормональная диагностика и анализ рисков", en: "Hormonal Diagnostics and Risk Assessment" },
            description: { uk: "Розширена панель гормонів + онкомаркери за показаннями. Лікар оцінює ризики і вибирає форму корекції.", ru: "Расширенная панель гормонов + онкомаркеры по показаниям. Врач оценивает риски и выбирает форму коррекции.", en: "Expanded hormonal panel + cancer markers as indicated. The physician assesses risks and selects the correction form." },
          },
          {
            title: { uk: "Розробка протоколу корекції", ru: "Разработка протокола коррекции", en: "Correction Protocol Development" },
            description: { uk: "Вибір між біоідентичними гормонами (BHRT), фітоестрогенами, нутрицевтичними протоколами або комбінацією. Форма — пероральна, трансдермальна або ін'єкційна.", ru: "Выбор между биоидентичными гормонами (BHRT), фитоэстрогенами, нутрицевтическими протоколами или комбинацией. Форма — пероральная, трансдермальная или инъекционная.", en: "Choice between bioidentical hormones (BHRT), phytoestrogens, nutraceutical protocols, or a combination. Form: oral, transdermal, or injectable." },
          },
          {
            title: { uk: "Запуск і моніторинг терапії", ru: "Запуск и мониторинг терапии", en: "Therapy Launch and Monitoring" },
            description: { uk: "Низькі стартові дози з поступовою титрацією. Контроль через 4–6 тижнів: суб'єктивне самопочуття + лабораторний контроль.", ru: "Низкие стартовые дозы с постепенной титрацией. Контроль через 4–6 недель: субъективное самочувствие + лабораторный контроль.", en: "Low starting doses with gradual titration. Monitoring at 4–6 weeks: subjective well-being + laboratory control." },
          },
          {
            title: { uk: "Довгострокова підтримка і щорічна діагностика", ru: "Долгосрочная поддержка и ежегодная диагностика", en: "Long-term Support and Annual Diagnostics" },
            description: { uk: "Щорічний повторний Check-Up і корекція протоколу. Мета — підтримувати оптимальний гормональний фон роками.", ru: "Ежегодный повторный Check-Up и коррекция протокола. Цель — поддерживать оптимальный гормональный фон годами.", en: "Annual repeat Check-Up and protocol adjustment. Goal: maintain optimal hormonal profile for years." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги програми GENEVITY", ru: "Преимущества программы GENEVITY", en: "GENEVITY Program Advantages" },
        items: [
          { uk: "Персоналізований протокол — не стандартна ГЗТ, а індивідуальна оптимізація", ru: "Персонализированный протокол — не стандартная ГЗТ, а индивидуальная оптимизация", en: "Personalized protocol — not standard HRT but individual optimization" },
          { uk: "Комплексний підхід: гормони + нутрицевтики + спосіб життя", ru: "Комплексный подход: гормоны + нутрицевтики + образ жизни", en: "Comprehensive approach: hormones + nutraceuticals + lifestyle" },
          { uk: "Моніторинг у динаміці — дозу коригують, а не призначають одноразово", ru: "Мониторинг в динамике — дозу корректируют, а не назначают одноразово", en: "Dynamic monitoring — dose is adjusted, not prescribed once and forgotten" },
          { uk: "Робота зі щитовидною залозою і надниркою — не лише статевими гормонами", ru: "Работа со щитовидной железой и надпочечниками — не только половыми гормонами", en: "Includes thyroid and adrenal work — not only sex hormones" },
          { uk: "⚠ Гормональна корекція потребує обстеження — самостійне призначення небезпечне", ru: "⚠ Гормональная коррекция требует обследования — самостоятельное назначение опасно", en: "⚠ Hormonal correction requires examination — self-prescribing is dangerous" },
          { uk: "⚠ Ефект відчувається через 4–12 тижнів після старту — не одразу", ru: "⚠ Эффект ощущается через 4–12 недель после старта — не сразу", en: "⚠ Effect is felt 4–12 weeks after starting — not immediately" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Чи безпечна гормональна терапія?", ru: "Безопасна ли гормональная терапия?", en: "Is hormonal therapy safe?" },
        answer: { uk: "Сучасні дані підтверджують безпечність біоідентичної гормональної терапії при правильних показаннях, дозах і моніторингу. Ризики значно переоцінені через застарілі дослідження 2002 року. Лікар оцінює співвідношення ризик/користь індивідуально.", ru: "Современные данные подтверждают безопасность биоидентичной гормональной терапии при правильных показаниях, дозах и мониторинге. Риски значительно переоценены из-за устаревших исследований 2002 года. Врач оценивает соотношение риск/польза индивидуально.", en: "Current data confirm the safety of bioidentical hormone therapy with correct indications, doses, and monitoring. Risks are significantly overstated due to outdated 2002 studies. The physician assesses the risk/benefit ratio individually." },
      },
      {
        question: { uk: "Скільки коштує і як довго тривати?", ru: "Сколько стоит и как долго продолжать?", en: "How much does it cost and how long should it continue?" },
        answer: { uk: "Вартість залежить від обраного протоколу. Гормональна корекція — довгострокова стратегія: зазвичай терапія продовжується роками з щорічним переоцінюванням показань і коригуванням дози.", ru: "Стоимость зависит от выбранного протокола. Гормональная коррекция — долгосрочная стратегия: обычно терапия продолжается годами с ежегодным переоцениванием показаний и корректировкой дозы.", en: "Cost depends on the selected protocol. Hormonal correction is a long-term strategy: therapy typically continues for years with annual reassessment of indications and dose adjustment." },
      },
    ],
  },

  // ─── IV THERAPY ───────────────────────────────────────────────────────────
  {
    slug: "iv-therapy",
    summary: {
      uk: "IV-терапія у GENEVITY — внутрішньовенні інфузії вітамінів, мінералів, антиоксидантів і амінокислот для швидкого відновлення, підвищення енергії, детоксикації і нутрицевтичної підтримки.",
      ru: "IV-терапия в GENEVITY — внутривенные инфузии витаминов, минералов, антиоксидантов и аминокислот для быстрого восстановления, повышения энергии, детоксикации и нутрицевтической поддержки.",
      en: "IV therapy at GENEVITY — intravenous infusions of vitamins, minerals, antioxidants, and amino acids for rapid recovery, energy boost, detoxification, and nutraceutical support.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "IV-терапія — пряма доставка нутрієнтів у кров", ru: "IV-терапия — прямая доставка нутриентов в кровь", en: "IV Therapy — Direct Nutrient Delivery into the Blood" },
        body: {
          uk: "Пероральний прийом вітамінів і нутрицевтиків обмежений біодоступністю: вітамін C засвоюється перорально максимум на 15–20% при дозах понад 1 г; магній — 30–45%; глутатіон — майже не всмоктується у незміненому вигляді. Внутрішньовенне введення обходить шлунково-кишковий тракт: 100% дози потрапляє у кров і досягає тканин. IV-терапія у GENEVITY використовується для конкретних протоколів: Myers' Cocktail (класичний вітамінно-мінеральний коктейль) — для підвищення енергії і відновлення; High-dose Vitamin C (25–50 г) — антиоксидантний захист і імунна підтримка; Glutathione push — детоксикація і освітлення шкіри; NAD+ infusion — клітинна регенерація і нейропротекція; Amino acid blend — підтримка м'язів і відновлення після тренувань. Кожен протокол складається індивідуально після аналізів і консультації.",
          ru: "Пероральный приём витаминов и нутрицевтиков ограничен биодоступностью: витамин C усваивается перорально максимум на 15–20% при дозах более 1 г; магний — 30–45%; глутатион — почти не всасывается в неизменённом виде. Внутривенное введение обходит желудочно-кишечный тракт: 100% дозы попадает в кровь и достигает тканей. IV-терапия в GENEVITY используется для конкретных протоколов: Myers' Cocktail (классический витаминно-минеральный коктейль) — для повышения энергии и восстановления; High-dose Vitamin C (25–50 г) — антиоксидантная защита и иммунная поддержка; Glutathione push — детоксикация и осветление кожи; NAD+ infusion — клеточная регенерация и нейропротекция; Amino acid blend — поддержка мышц и восстановление после тренировок. Каждый протокол составляется индивидуально после анализов и консультации.",
          en: "Oral vitamin and nutraceutical intake is limited by bioavailability: vitamin C absorbs orally maximum 15–20% at doses over 1g; magnesium — 30–45%; glutathione — barely absorbed intact. Intravenous administration bypasses the GI tract: 100% of the dose enters the blood and reaches tissues. IV therapy at GENEVITY uses specific protocols: Myers' Cocktail (classic vitamin-mineral cocktail) — energy boost and recovery; High-dose Vitamin C (25–50g) — antioxidant protection and immune support; Glutathione push — detoxification and skin brightening; NAD+ infusion — cellular regeneration and neuroprotection; Amino acid blend — muscle support and post-workout recovery. Each protocol is formulated individually after tests and consultation.",
        },
        calloutBody: {
          uk: "NAD+ IV-інфузія — одна з найбільш досліджуваних longevity-інтервенцій: NAD+ активує сиртуїни (гени довголіття), покращує мітохондріальну функцію і підвищує клітинний метаболізм.",
          ru: "NAD+ IV-инфузия — одна из наиболее исследуемых longevity-интервенций: NAD+ активирует сиртуины (гены долголетия), улучшает митохондриальную функцию и повышает клеточный метаболизм.",
          en: "NAD+ IV infusion is one of the most researched longevity interventions: NAD+ activates sirtuins (longevity genes), improves mitochondrial function, and boosts cellular metabolism.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до IV-терапії", ru: "Показания к IV-терапии", en: "Indications for IV Therapy" },
        indications: [
          { uk: "Хронічна втома і синдром вигорання", ru: "Хроническая усталость и синдром выгорания", en: "Chronic fatigue and burnout syndrome" },
          { uk: "Відновлення після захворювань, операцій або інтенсивних тренувань", ru: "Восстановление после заболеваний, операций или интенсивных тренировок", en: "Recovery after illness, surgery, or intense training" },
          { uk: "Профілактика під час підвищеного імунного навантаження", ru: "Профилактика в период повышенной иммунной нагрузки", en: "Prevention during periods of high immune load" },
          { uk: "Детоксикація і підтримка після алкогольного або токсичного навантаження", ru: "Детоксикация и поддержка после алкогольной или токсической нагрузки", en: "Detoxification and support after alcohol or toxic exposure" },
          { uk: "NAD+-підтримка в рамках longevity і антивікових програм", ru: "NAD+-поддержка в рамках longevity и антивозрастных программ", en: "NAD+ support within longevity and anti-aging programs" },
          { uk: "Освітлення шкіри (глутатіон-протокол)", ru: "Осветление кожи (глутатион-протокол)", en: "Skin brightening (glutathione protocol)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Ниркова недостатність (обмеження для деяких компонентів)", ru: "Почечная недостаточность (ограничение для некоторых компонентов)", en: "Renal failure (limitation for some components)" },
          { uk: "Дефіцит G6PD (для високодозного вітаміну C)", ru: "Дефицит G6PD (для высокодозного витамина C)", en: "G6PD deficiency (for high-dose vitamin C)" },
          { uk: "Серцева недостатність зі схильністю до набряків", ru: "Сердечная недостаточность со склонностью к отёкам", en: "Heart failure with edema tendency" },
          { uk: "Алергія на компоненти розчину", ru: "Аллергия на компоненты раствора", en: "Allergy to solution components" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить IV-терапія", ru: "Как проходит IV-терапия", en: "IV Therapy Process" },
        steps: [
          {
            title: { uk: "Консультація і підбір протоколу", ru: "Консультация и подбор протокола", en: "Consultation and Protocol Selection" },
            description: { uk: "Лікар аналізує скарги, аналізи і цілі пацієнта. Обирає між готовими протоколами або складає індивідуальний коктейль.", ru: "Врач анализирует жалобы, анализы и цели пациента. Выбирает между готовыми протоколами или составляет индивидуальный коктейль.", en: "The physician analyzes complaints, tests, and patient goals. Selects a standard protocol or formulates a custom cocktail." },
          },
          {
            title: { uk: "Підготовка розчину і постановка катетера", ru: "Подготовка раствора и постановка катетера", en: "Solution Preparation and Catheter Placement" },
            description: { uk: "Медсестра готує стерильний розчин, встановлює внутрішньовенний катетер. Пацієнт комфортно розміщується у кріслі.", ru: "Медсестра готовит стерильный раствор, устанавливает внутривенный катетер. Пациент комфортно размещается в кресле.", en: "The nurse prepares the sterile solution and places the intravenous catheter. The patient is comfortably seated in a chair." },
          },
          {
            title: { uk: "Крапельниця 45–90 хвилин", ru: "Капельница 45–90 минут", en: "IV Drip 45–90 Minutes" },
            description: { uk: "Інфузія проводиться повільно для максимальної переносимості. NAD+ потребує 2–4 год. Пацієнт може відпочивати, читати або слухати музику.", ru: "Инфузия проводится медленно для максимальной переносимости. NAD+ требует 2–4 ч. Пациент может отдыхать, читать или слушать музыку.", en: "Infusion is conducted slowly for maximum tolerability. NAD+ requires 2–4 hours. The patient can rest, read, or listen to music." },
          },
          {
            title: { uk: "Завершення і рекомендації", ru: "Завершение и рекомендации", en: "Completion and Recommendations" },
            description: { uk: "Катетер видаляють. Рекомендують достатнє водне навантаження після процедури. Деякі пацієнти відчувають бадьорість відразу; інші — через кілька годин.", ru: "Катетер удаляют. Рекомендуют достаточную водную нагрузку после процедуры. Некоторые пациенты чувствуют бодрость сразу; другие — через несколько часов.", en: "Catheter is removed. Adequate hydration is recommended after the procedure. Some patients feel energized immediately; others after a few hours." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості IV-терапії", ru: "Преимущества и особенности IV-терапии", en: "IV Therapy Advantages and Considerations" },
        items: [
          { uk: "100% біодоступність — ефект порівнянний з дозами, недосяжними перорально", ru: "100% биодоступность — эффект сопоставим с дозами, недостижимыми перорально", en: "100% bioavailability — effect comparable to doses unachievable orally" },
          { uk: "Відновлення помітне вже у день процедури — особливо при синдромі втоми", ru: "Восстановление заметно уже в день процедуры — особенно при синдроме усталости", en: "Recovery noticeable on the day of procedure — especially for fatigue syndrome" },
          { uk: "NAD+-протокол — одна з найдосліджуваніших longevity-інтервенцій", ru: "NAD+-протокол — одна из наиболее исследуемых longevity-интервенций", en: "NAD+ protocol — one of the most researched longevity interventions" },
          { uk: "Підходить для разового відновлення і курсової longevity-підтримки", ru: "Подходит для разового восстановления и курсовой longevity-поддержки", en: "Suitable for one-time recovery and course-based longevity support" },
          { uk: "⚠ Не замінює базове харчування і нутрицевтики — це інтенсивна підтримка", ru: "⚠ Не заменяет базовое питание и нутрицевтики — это интенсивная поддержка", en: "⚠ Does not replace baseline nutrition and nutraceuticals — this is intensive support" },
          { uk: "⚠ NAD+-інфузія може супроводжуватися відчуттям тепла і тиском у грудях — нормальна реакція при повільній подачі", ru: "⚠ NAD+-инфузия может сопровождаться ощущением тепла и давлением в груди — нормальная реакция при медленной подаче", en: "⚠ NAD+ infusion may cause warmth and chest pressure — a normal reaction at slow infusion rate" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Як часто можна робити IV-терапію?", ru: "Как часто можно делать IV-терапию?", en: "How often can IV therapy be done?" },
        answer: { uk: "Myers' Cocktail і відновлювальні протоколи — 1–2 рази на місяць або курс з 4–6 процедур раз на квартал. NAD+ — 1–3 дні поспіль для насичення, потім підтримувально раз на місяць.", ru: "Myers' Cocktail и восстановительные протоколы — 1–2 раза в месяц или курс из 4–6 процедур раз в квартал. NAD+ — 1–3 дня подряд для насыщения, затем поддерживающе раз в месяц.", en: "Myers' Cocktail and recovery protocols — 1–2 times per month or a course of 4–6 procedures quarterly. NAD+ — 1–3 consecutive days for loading, then monthly maintenance." },
      },
      {
        question: { uk: "Чи безпечна IV-терапія?", ru: "Безопасна ли IV-терапия?", en: "Is IV therapy safe?" },
        answer: { uk: "Так, при правильних показаннях і складі. У GENEVITY всі інфузії проводяться медичним персоналом з моніторингом. Склад розчину визначається після аналізів.", ru: "Да, при правильных показаниях и составе. В GENEVITY все инфузии проводятся медицинским персоналом с мониторингом. Состав раствора определяется после анализов.", en: "Yes, with correct indications and composition. At GENEVITY all infusions are administered by medical staff with monitoring. Solution composition is determined after tests." },
      },
    ],
  },

  // ─── LONGEVITY PROGRAM ────────────────────────────────────────────────────
  {
    slug: "longevity-program",
    summary: {
      uk: "Longevity-програма у GENEVITY — персоналізована комплексна система уповільнення біологічного старіння: поєднання діагностики біологічного віку, гормональної оптимізації, нутрицевтиків, IV-терапії та lifestyle-протоколів.",
      ru: "Longevity-программа в GENEVITY — персонализированная комплексная система замедления биологического старения: сочетание диагностики биологического возраста, гормональной оптимизации, нутрицевтиков, IV-терапии и lifestyle-протоколов.",
      en: "Longevity program at GENEVITY — a personalized comprehensive system for slowing biological aging: a combination of biological age diagnostics, hormonal optimization, nutraceuticals, IV therapy, and lifestyle protocols.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Longevity-програма — системний підхід до уповільнення старіння", ru: "Longevity-программа — системный подход к замедлению старения", en: "Longevity Program — Systemic Approach to Slowing Aging" },
        body: {
          uk: "Longevity-медицина — наукова дисципліна, що досліджує механізми старіння і розробляє доказові стратегії їхнього сповільнення. GENEVITY будує longevity-програму навколо «Hallmarks of Aging» — 12 молекулярних і клітинних механізмів старіння, виявлених у науці за останні 20 років. Серед них: вкорочення теломер, епігенетичні зміни, дисфункція мітохондрій, накопичення сенесцентних клітин, хронічне субклінічне запалення (inflammaging), виснаження стовбурових клітин. Програма GENEVITY інтегрує: діагностику біологічного віку (телометрія, епігенетичний вік, IMC і склад тіла, кардіометаболічний ризик); персоналізований нутрицевтичний стек (за результатами аналізів); гормональну оптимізацію за показаннями; IV-протоколи NAD+, вітаміну C і глутатіону; науково обґрунтовані lifestyle-рекомендації (сон, зонд Харвіна, mTOR-інтервенції). Мета програми — максимізація healthspan, а не лише lifespan.",
          ru: "Longevity-медицина — научная дисциплина, исследующая механизмы старения и разрабатывающая доказательные стратегии их замедления. GENEVITY строит longevity-программу вокруг «Hallmarks of Aging» — 12 молекулярных и клеточных механизмов старения, выявленных наукой за последние 20 лет. Среди них: укорочение теломер, эпигенетические изменения, дисфункция митохондрий, накопление сенесцентных клеток, хроническое субклиническое воспаление (inflammaging), истощение стволовых клеток. Программа GENEVITY интегрирует: диагностику биологического возраста (телометрия, эпигенетический возраст, состав тела, кардиометаболический риск); персонализированный нутрицевтический стек (по результатам анализов); гормональную оптимизацию по показаниям; IV-протоколы NAD+, витамина C и глутатиона; научно обоснованные lifestyle-рекомендации (сон, зона Харвина, mTOR-интервенции). Цель программы — максимизация healthspan, а не только lifespan.",
          en: "Longevity medicine is a scientific discipline studying aging mechanisms and developing evidence-based strategies to slow them. GENEVITY builds the longevity program around the 'Hallmarks of Aging' — 12 molecular and cellular aging mechanisms identified by science over the last 20 years. Among them: telomere shortening, epigenetic changes, mitochondrial dysfunction, senescent cell accumulation, chronic subclinical inflammation (inflammaging), and stem cell exhaustion. The GENEVITY program integrates: biological age diagnostics (telomere length, epigenetic age, body composition, cardiometabolic risk); personalized nutraceutical stack (based on test results); hormonal optimization as indicated; IV protocols of NAD+, vitamin C, and glutathione; science-based lifestyle recommendations (sleep, zone 2 cardio, mTOR interventions). The program goal is maximizing healthspan, not only lifespan.",
        },
        calloutBody: {
          uk: "Ключова ідея GENEVITY Longevity: старіння — це процес, яким можна керувати. Не зупинити, але суттєво сповільнити за допомогою персоналізованих наукових інтервенцій.",
          ru: "Ключевая идея GENEVITY Longevity: старение — это процесс, которым можно управлять. Не остановить, но существенно замедлить с помощью персонализированных научных интервенций.",
          en: "GENEVITY Longevity's key idea: aging is a process that can be managed. Not stopped, but significantly slowed through personalized scientific interventions.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Кому підходить Longevity-програма", ru: "Кому подходит Longevity-программа", en: "Who the Longevity Program Is For" },
        indications: [
          { uk: "Люди 35–70 років, орієнтовані на якість і тривалість активного здоров'я", ru: "Люди 35–70 лет, ориентированные на качество и длительность активного здоровья", en: "People 35–70 years old focused on quality and duration of active health" },
          { uk: "Ті, хто хоче знати свій біологічний вік і розуміти, як на нього впливати", ru: "Те, кто хочет знать свой биологический возраст и понимать, как на него влиять", en: "Those who want to know their biological age and how to influence it" },
          { uk: "Пацієнти з хронічними ознаками запалення, гормональним дисбалансом чи метаболічними порушеннями", ru: "Пациенты с хроническими признаками воспаления, гормональным дисбалансом или метаболическими нарушениями", en: "Patients with chronic inflammation signs, hormonal imbalance, or metabolic disorders" },
          { uk: "Ті, хто пройшов Check-Up 40+ і хоче систематизувати корекцію виявлених порушень", ru: "Те, кто прошёл Check-Up 40+ и хочет систематизировать коррекцию выявленных нарушений", en: "Those who completed Check-Up 40+ and want to systematize correction of identified issues" },
          { uk: "Топ-менеджери і підприємці з високим рівнем стресу та вимогами до продуктивності", ru: "Топ-менеджеры и предприниматели с высоким уровнем стресса и требованиями к производительности", en: "Top managers and entrepreneurs with high stress levels and productivity demands" },
        ],
        contraindicationsHeading: { uk: "Важливо до старту програми", ru: "Важно до старта программы", en: "Important Before Starting the Program" },
        contraindications: [
          { uk: "Програма починається з повної діагностики — без неї персоналізація неможлива", ru: "Программа начинается с полной диагностики — без неё персонализация невозможна", en: "The program starts with full diagnostics — personalization is impossible without it" },
          { uk: "При онкологічних захворюваннях в анамнезі — узгодження з лікарем-онкологом", ru: "При онкологических заболеваниях в анамнезе — согласование с врачом-онкологом", en: "History of oncological diseases requires oncologist coordination" },
          { uk: "Деякі протоколи (NAD+, BHRT) не підходять під час вагітності", ru: "Некоторые протоколы (NAD+, BHRT) не подходят во время беременности", en: "Some protocols (NAD+, BHRT) are not suitable during pregnancy" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "З чого складається Longevity-програма", ru: "Из чего состоит Longevity-программа", en: "Longevity Program Components" },
        steps: [
          {
            title: { uk: "Діагностика біологічного та паспортного розриву", ru: "Диагностика биологического и паспортного разрыва", en: "Biological vs. Chronological Age Gap Diagnostics" },
            description: { uk: "Check-Up 40+, телометрія, склад тіла (InBody), кардіометаболічний скринінг. Визначається дельта між паспортним і біологічним віком.", ru: "Check-Up 40+, телометрия, состав тела (InBody), кардиометаболический скрининг. Определяется дельта между паспортным и биологическим возрастом.", en: "Check-Up 40+, telomere length, body composition (InBody), cardiometabolic screening. The gap between chronological and biological age is determined." },
          },
          {
            title: { uk: "Розробка персонального longevity-стеку", ru: "Разработка персонального longevity-стека", en: "Personalized Longevity Stack Development" },
            description: { uk: "На основі результатів лікар підбирає нутрицевтики, гормональний протокол, IV-план і lifestyle-рекомендації — формується 90-денна roadmap.", ru: "На основе результатов врач подбирает нутрицевтики, гормональный протокол, IV-план и lifestyle-рекомендации — формируется 90-дневная roadmap.", en: "Based on results the physician selects nutraceuticals, hormonal protocol, IV plan, and lifestyle recommendations — a 90-day roadmap is formed." },
          },
          {
            title: { uk: "Впровадження і 90-денний моніторинг", ru: "Внедрение и 90-дневный мониторинг", en: "Implementation and 90-Day Monitoring" },
            description: { uk: "Щомісячний чекін з лікарем. Коригування стеку за суб'єктивним самопочуттям і проміжними аналізами.", ru: "Ежемесячный чекин с врачом. Корректировка стека по субъективному самочувствию и промежуточным анализам.", en: "Monthly physician check-ins. Stack adjustment based on subjective well-being and interim tests." },
          },
          {
            title: { uk: "Повторна діагностика та оцінка прогресу", ru: "Повторная диагностика и оценка прогресса", en: "Repeat Diagnostics and Progress Assessment" },
            description: { uk: "Через 90–180 днів: повторний Check-Up і порівняння маркерів. Оцінка «дельти» біологічного віку. Корекція стратегії на наступний цикл.", ru: "Через 90–180 дней: повторный Check-Up и сравнение маркеров. Оценка «дельты» биологического возраста. Коррекция стратегии на следующий цикл.", en: "At 90–180 days: repeat Check-Up and marker comparison. Biological age delta assessment. Strategy adjustment for the next cycle." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги програми GENEVITY Longevity", ru: "Преимущества программы GENEVITY Longevity", en: "GENEVITY Longevity Program Advantages" },
        items: [
          { uk: "Доказова база: протоколи базуються на peer-reviewed дослідженнях, а не трендах", ru: "Доказательная база: протоколы базируются на peer-reviewed исследованиях, а не трендах", en: "Evidence base: protocols based on peer-reviewed research, not trends" },
          { uk: "Вимірюваний результат: біологічний вік до і після дає об'єктивну оцінку ефективності", ru: "Измеримый результат: биологический возраст до и после даёт объективную оценку эффективности", en: "Measurable result: biological age before and after gives an objective effectiveness assessment" },
          { uk: "Системний підхід — не окремі процедури, а інтегрована стратегія", ru: "Системный подход — не отдельные процедуры, а интегрированная стратегия", en: "Systemic approach — not individual procedures but an integrated strategy" },
          { uk: "Адаптується динамічно: стек переглядається за результатами, а не встановлюється раз і назавжди", ru: "Адаптируется динамически: стек пересматривается по результатам, а не устанавливается раз и навсегда", en: "Dynamically adaptive: stack is reviewed by results, not set once and forgotten" },
          { uk: "⚠ Програма вимагає прихильності і зусиль — без участі пацієнта результат неможливий", ru: "⚠ Программа требует приверженности и усилий — без участия пациента результат невозможен", en: "⚠ The program requires commitment and effort — without patient participation results are impossible" },
          { uk: "⚠ Ефект накопичувальний: перші зміни помітні через 3–6 місяців регулярної роботи", ru: "⚠ Эффект накопительный: первые изменения заметны через 3–6 месяцев регулярной работы", en: "⚠ Cumulative effect: first changes noticeable after 3–6 months of regular work" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Що таке healthspan і чим він відрізняється від lifespan?", ru: "Что такое healthspan и чем он отличается от lifespan?", en: "What is healthspan and how does it differ from lifespan?" },
        answer: { uk: "Lifespan — загальна тривалість життя. Healthspan — кількість років у здоров'ї, без хронічних хвороб і когнітивного зниження. GENEVITY фокусується на healthspan: жити довго і активно, а не просто довго.", ru: "Lifespan — общая продолжительность жизни. Healthspan — количество лет в здоровье, без хронических болезней и когнитивного снижения. GENEVITY фокусируется на healthspan: жить долго и активно, а не просто долго.", en: "Lifespan is total life duration. Healthspan is years spent healthy, without chronic disease or cognitive decline. GENEVITY focuses on healthspan: living long and active, not just long." },
      },
      {
        question: { uk: "Скільки коштує longevity-програма?", ru: "Сколько стоит longevity-программа?", en: "How much does the longevity program cost?" },
        answer: { uk: "Вартість залежить від виявлених показань і обраних протоколів. Мінімальний вхід — Check-Up 40+ і перша консультація. Повна програма розраховується після діагностики.", ru: "Стоимость зависит от выявленных показаний и выбранных протоколов. Минимальный вход — Check-Up 40+ и первая консультация. Полная программа рассчитывается после диагностики.", en: "Cost depends on identified indications and selected protocols. Minimum entry — Check-Up 40+ and first consultation. Full program is calculated after diagnostics." },
      },
    ],
  },

  // ─── NUTRACEUTICALS ───────────────────────────────────────────────────────
  {
    slug: "nutraceuticals",
    summary: {
      uk: "Нутрицевтики у GENEVITY — персоналізований підбір високоякісних нутрицевтиків і дієтичних добавок за результатами аналізів для корекції дефіцитів, підтримки енергії, імунітету і антивікових процесів.",
      ru: "Нутрицевтики в GENEVITY — персонализированный подбор высококачественных нутрицевтиков и диетических добавок по результатам анализов для коррекции дефицитов, поддержки энергии, иммунитету и антивозрастных процессов.",
      en: "Nutraceuticals at GENEVITY — personalized selection of high-quality nutraceuticals and dietary supplements based on test results to correct deficiencies, support energy, immunity, and anti-aging processes.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Нутрицевтики — медичний підхід до добавок", ru: "Нутрицевтики — медицинский подход к добавкам", en: "Nutraceuticals — The Medical Approach to Supplements" },
        body: {
          uk: "Нутрицевтики — це харчові компоненти або їхні ізольовані форми, що мають доведений позитивний вплив на здоров'я. Ринок добавок переповнений маркетингом: «омолоджувальні» комплекси продаються без урахування того, що конкретна людина вже отримує з їжею, які дефіцити у неї реально є і в якій формі і дозі нутрієнт засвоюється краще. Підхід GENEVITY: нутрицевтики призначаються ПІСЛЯ аналізів, а не натомість них. Лікар оцінює реальні рівні вітаміну D, B12, омега-3 індекс, магній, цинк, ферум, CoQ10 та інші маркери. На основі цього призначаються конкретні форми (наприклад, метилфолат замість фолієвої для осіб з MTHFR-поліморфізмом) і дозування — без «стандартних» таблеток-«на всякий випадок». Для longevity-завдань окремо розглядають: NMN або NR (попередники NAD+), сплячий ресвератрол, берберин, спермідин, альфа-ліпоєва кислота і телометр-підтримувальні нутрієнти.",
          ru: "Нутрицевтики — это пищевые компоненты или их изолированные формы, оказывающие доказанное положительное влияние на здоровье. Рынок добавок переполнен маркетингом: «омолаживающие» комплексы продаются без учёта того, что конкретный человек уже получает из пищи, какие дефициты у него реально есть и в какой форме и дозе нутриент усваивается лучше. Подход GENEVITY: нутрицевтики назначаются ПОСЛЕ анализов, а не вместо них. Врач оценивает реальные уровни витамина D, B12, омега-3 индекс, магний, цинк, железо, CoQ10 и другие маркеры. На основе этого назначаются конкретные формы (например, метилфолат вместо фолиевой кислоты для лиц с MTHFR-полиморфизмом) и дозировки — без «стандартных» таблеток «на всякий случай». Для longevity-задач отдельно рассматриваются: NMN или NR (предшественники NAD+), транс-ресвератрол, берберин, спермидин, альфа-липоевая кислота и теломер-поддерживающие нутриенты.",
          en: "Nutraceuticals are food components or their isolated forms with proven positive health effects. The supplement market is saturated with marketing: 'rejuvenating' complexes are sold without accounting for what the specific person already gets from food, what deficiencies they actually have, and which form and dose absorbs better. GENEVITY's approach: nutraceuticals are prescribed AFTER tests, not instead of them. The physician assesses real levels of vitamin D, B12, omega-3 index, magnesium, zinc, iron, CoQ10, and other markers. Based on this, specific forms (e.g., methylfolate instead of folic acid for MTHFR polymorphism carriers) and dosages are prescribed — without 'standard' just-in-case tablets. For longevity goals, separately considered: NMN or NR (NAD+ precursors), trans-resveratrol, berberine, spermidine, alpha-lipoic acid, and telomere-supportive nutrients.",
        },
        calloutBody: {
          uk: "Правило GENEVITY: будь-який нутрицевтик може нашкодити у неправильній дозі або при невиявленому дефіциті протилежного мікроелементу. Вітамін D без K2 — ризик для кальцієвого метаболізму. Залізо без ферментативного контролю — оксидативний стрес. Спочатку аналізи — потім добавки.",
          ru: "Правило GENEVITY: любой нутрицевтик может навредить в неправильной дозе или при невыявленном дефиците противоположного микроэлемента. Витамин D без K2 — риск для кальциевого метаболизма. Железо без ферментативного контроля — оксидативный стресс. Сначала анализы — потом добавки.",
          en: "GENEVITY rule: any nutraceutical can harm at the wrong dose or when an opposing micronutrient deficiency is undetected. Vitamin D without K2 — calcium metabolism risk. Iron without enzymatic monitoring — oxidative stress. Tests first — supplements second.",
        },
        heroImage: null,
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Коли потрібна нутрицевтична консультація", ru: "Когда нужна нутрицевтическая консультация", en: "When a Nutraceutical Consultation Is Needed" },
        indications: [
          { uk: "Втома, зниження концентрації і когнітивна туманність без виявлених причин", ru: "Усталость, снижение концентрации и когнитивный туман без выявленных причин", en: "Fatigue, reduced concentration, and brain fog without identified causes" },
          { uk: "Зниження імунітету, часті ГРВІ і повільне відновлення", ru: "Снижение иммунитету, частые ОРВИ и медленное восстановление", en: "Reduced immunity, frequent respiratory infections, and slow recovery" },
          { uk: "Погіршення стану шкіри, волосся і нігтів", ru: "Ухудшение состояния кожи, волос и ногтей", en: "Deterioration of skin, hair, and nail condition" },
          { uk: "Планування вагітності і преконцепційна підготовка", ru: "Планирование беременности и преконцепционная подготовка", en: "Pregnancy planning and preconception preparation" },
          { uk: "Підбір longevity-стеку в рамках антивікової програми", ru: "Подбор longevity-стека в рамках антивозрастной программы", en: "Longevity stack selection within an anti-aging program" },
          { uk: "Вегетаріанство/веганство — підвищений ризик специфічних дефіцитів", ru: "Вегетарианство/веганство — повышенный риск специфических дефицитов", en: "Vegetarianism/veganism — elevated risk of specific deficiencies" },
        ],
        contraindicationsHeading: { uk: "Важливі застереження", ru: "Важные предостережения", en: "Important Cautions" },
        contraindications: [
          { uk: "Деякі нутрицевтики взаємодіють з ліками — обов'язково повідомте про поточну фармакотерапію", ru: "Некоторые нутрицевтики взаимодействуют с лекарствами — обязательно сообщите о текущей фармакотерапии", en: "Some nutraceuticals interact with medications — always inform about current pharmacotherapy" },
          { uk: "Жиророзчинні вітаміни (A, D, E, K) накопичуються — без контролю рівня можлива токсичність", ru: "Жирорастворимые витамины (A, D, E, K) накапливаются — без контроля уровня возможна токсичность", en: "Fat-soluble vitamins (A, D, E, K) accumulate — toxicity is possible without level monitoring" },
          { uk: "Під час вагітності деякі нутрицевтики (ретинол у високих дозах) протипоказані", ru: "Во время беременности некоторые нутрицевтики (ретинол в высоких дозах) противопоказаны", en: "During pregnancy some nutraceuticals (high-dose retinol) are contraindicated" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить нутрицевтична консультація", ru: "Как проходит нутрицевтическая консультация", en: "Nutraceutical Consultation Process" },
        steps: [
          {
            title: { uk: "Збір анамнезу і харчового щоденника", ru: "Сбор анамнеза и пищевого дневника", en: "History and Food Diary Collection" },
            description: { uk: "Лікар з'ясовує спосіб харчування, наявні добавки, ліки, скарги і цілі. Виявляє потенційні ризики дефіцитів.", ru: "Врач выясняет способ питания, имеющиеся добавки, лекарства, жалобы и цели. Выявляет потенциальные риски дефицитов.", en: "The physician clarifies dietary habits, current supplements, medications, complaints, and goals. Identifies potential deficiency risks." },
          },
          {
            title: { uk: "Аналіз лабораторних даних", ru: "Анализ лабораторных данных", en: "Laboratory Data Analysis" },
            description: { uk: "Оцінюють рівні ключових нутрієнтів: D, B12, фолат, залізо/феритин, омега-3 індекс, магній, цинк, CoQ10. За показаннями — генетика (MTHFR).", ru: "Оценивают уровни ключевых нутриентов: D, B12, фолат, железо/ферритин, омега-3 индекс, магний, цинк, CoQ10. По показаниям — генетика (MTHFR).", en: "Key nutrient levels are assessed: D, B12, folate, iron/ferritin, omega-3 index, magnesium, zinc, CoQ10. Genetics (MTHFR) as indicated." },
          },
          {
            title: { uk: "Складання персонального нутрицевтичного стеку", ru: "Составление персонального нутрицевтического стека", en: "Personal Nutraceutical Stack Formulation" },
            description: { uk: "Лікар підбирає форми, дози, схеми прийому і комбінації. Враховуються взаємодії з ліками і між нутрієнтами.", ru: "Врач подбирает формы, дозы, схемы приёма и комбинации. Учитываются взаимодействия с лекарствами и между нутриентами.", en: "The physician selects forms, doses, schedules, and combinations. Drug and nutrient interactions are accounted for." },
          },
          {
            title: { uk: "Моніторинг і коригування через 3 місяці", ru: "Мониторинг и корректировка через 3 месяца", en: "Monitoring and Adjustment at 3 Months" },
            description: { uk: "Контрольні аналізи через 8–12 тижнів для оцінки ефективності корекції. Дози коригують за результатами.", ru: "Контрольные анализы через 8–12 недель для оценки эффективности коррекции. Дозы корректируют по результатам.", en: "Follow-up tests at 8–12 weeks to assess correction efficacy. Doses adjusted based on results." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги нутрицевтичного підходу GENEVITY", ru: "Преимущества нутрицевтического подхода GENEVITY", en: "GENEVITY Nutraceutical Approach Advantages" },
        items: [
          { uk: "Призначення за реальними аналізами — не «на всякий випадок»", ru: "Назначение по реальным анализам — не «на всякий случай»", en: "Prescribed based on actual tests — not 'just in case'" },
          { uk: "Вибір оптимальних форм: метилфолат, магній гліцинат, хелатне залізо — не найдешевша форма", ru: "Выбор оптимальных форм: метилфолат, магний глицинат, хелатное железо — не самая дешёвая форма", en: "Optimal form selection: methylfolate, magnesium glycinate, chelated iron — not the cheapest form" },
          { uk: "Врахування взаємодій і синергій між нутрієнтами і ліками", ru: "Учёт взаимодействий и синергий между нутриентами и лекарствами", en: "Drug and nutrient interaction and synergy accounting" },
          { uk: "Включає longevity-молекули: NMN, NR, берберин, спермідин за показаннями", ru: "Включает longevity-молекулы: NMN, NR, берберин, спермидин по показаниям", en: "Includes longevity molecules: NMN, NR, berberine, spermidine as indicated" },
          { uk: "⚠ Ефективні нутрицевтики — не замінники медицини при серйозних захворюваннях", ru: "⚠ Эффективные нутрицевтики — не заменители медицины при серьёзных заболеваниях", en: "⚠ Effective nutraceuticals are not substitutes for medicine in serious diseases" },
          { uk: "⚠ Деякі longevity-молекули (NMN) дорогі — підбір з урахуванням бюджету пацієнта", ru: "⚠ Некоторые longevity-молекулы (NMN) дорогие — подбор с учётом бюджета пациента", en: "⚠ Some longevity molecules (NMN) are expensive — selection accounts for patient budget" },
        ],
      },
    ],
    faq: [
      {
        question: { uk: "Чи можна просто купити популярний комплекс у аптеці?", ru: "Можно ли просто купить популярный комплекс в аптеке?", en: "Can I just buy a popular complex at the pharmacy?" },
        answer: { uk: "Можна, але ефективність буде випадковою: стандартний комплекс не враховує ваш реальний рівень нутрієнтів, форму засвоєння і взаємодії. Персоналізований підбір — в 3–5 разів ефективніший.", ru: "Можно, но эффективность будет случайной: стандартный комплекс не учитывает ваш реальный уровень нутриентов, форму усвоения и взаимодействия. Персонализированный подбор — в 3–5 раз эффективнее.", en: "You can, but efficacy will be random: a standard complex doesn't account for your actual nutrient levels, absorption forms, or interactions. Personalized selection is 3–5 times more effective." },
      },
      {
        question: { uk: "Які нутрицевтики найважливіші для антивікового ефекту?", ru: "Какие нутрицевтики наиболее важны для антивозрастного эффекта?", en: "Which nutraceuticals are most important for anti-aging effects?" },
        answer: { uk: "Базова «п'ятірка»: вітамін D3+K2, магній, омега-3, CoQ10 і B12/фолат. З longevity-молекул: NMN/NR для NAD+-підтримки, берберин для метаболізму, спермідин для аутофагії. Але все — після аналізів.", ru: "Базовая «пятёрка»: витамин D3+K2, магний, омега-3, CoQ10 и B12/фолат. Из longevity-молекул: NMN/NR для NAD+-поддержки, берберин для метаболизма, спермидин для аутофагии. Но всё — после анализов.", en: "The basic 'five': vitamin D3+K2, magnesium, omega-3, CoQ10, and B12/folate. Longevity molecules: NMN/NR for NAD+ support, berberine for metabolism, spermidine for autophagy. But all — after tests." },
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
  console.log("\nV5-longevity DONE.");
}

main().catch((e) => { console.error(e); process.exit(1); });
