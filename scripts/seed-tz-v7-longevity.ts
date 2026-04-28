/**
 * TZ-compliant seed: longevity services
 * Services: check-up-40, longevity-program, hormonal-balance, iv-therapy, nutraceuticals
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
  { url: "/images/interior/SEMI1276-HDR.webp", alt: "Клініка GENEVITY" },
  { url: "/images/interior/SEMI1662-HDR.webp", alt: "Медичний центр GENEVITY" },
  { url: "/images/interior/SEMI7509.webp", alt: "Кабінет GENEVITY" },
];

const services: ServiceSeed[] = [
  // ─── 34. Check-up 40 ─────────────────────────────────────────────────────
  {
    slug: "check-up-40",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Check-up 40 — комплексне обстеження організму в GENEVITY",
          ru: "Check-up 40 — комплексное обследование организма в GENEVITY",
          en: "Check-up 40 — Comprehensive Body Screening at GENEVITY",
        },
        body: {
          uk: "Програма «Check-up 40» — це систематизований медичний скринінг для чоловіків та жінок після 40 років, спрямований на раннє виявлення захворювань до появи симптомів. Чек ап після 40 дозволяє отримати повну картину стану здоров'я організму та визначити ризики розвитку серцево-судинних, ендокринних, онкологічних та інших захворювань, характерних для вікової групи 40+.\n\nПрограма check up 40 років у GENEVITY охоплює: загальноклінічні аналізи крові та сечі, розгорнуту біохімію (глюкоза, холестерин, тригліцериди, АЛТ, АСТ, креатинін та ін.), гормональний профіль (ТТГ, гормони щитоподібної залози, статеві гормони), онкомаркери (залежно від статі), ЕКГ, УЗД органів черевної порожнини, консультацію терапевта за результатами.\n\nЧек ап 40 років — не разова подія, а рекомендована щорічна практика. Дослідження показують: регулярний скринінг після 40 знижує ризик смерті від онкологічних захворювань на 25–35%, оскільки дозволяє виявити пухлини на стадії, коли лікування найбільш ефективне.\n\nВ GENEVITY програма «Check-up 40» реалізується у форматі «один день — повне обстеження»: пацієнт проходить усі обстеження за один візит, а результати видаються в організованому вигляді з коментарями лікаря. Чек ап організму в 40 років — це інвестиція в здоров'я, яка може врятувати роки та якість життя.",
          ru: "Программа «Check-up 40» — это систематизированный медицинский скрининг для мужчин и женщин после 40 лет, направленный на раннее выявление заболеваний до появления симптомов. Чек ап после 40 позволяет получить полную картину состояния здоровья организма и определить риски развития сердечно-сосудистых, эндокринных, онкологических и других заболеваний, характерных для возрастной группы 40+.\n\nПрограмма check up 40 лет в GENEVITY охватывает: общеклинические анализы крови и мочи, развёрнутую биохимию (глюкоза, холестерин, триглицериды, АЛТ, АСТ, креатинин и др.), гормональный профиль (ТТГ, гормоны щитовидной железы, половые гормоны), онкомаркеры (в зависимости от пола), ЭКГ, УЗИ органов брюшной полости, консультацию терапевта по результатам.\n\nЧек ап 40 лет — не разовое событие, а рекомендованная ежегодная практика. Исследования показывают: регулярный скрининг после 40 снижает риск смерти от онкологических заболеваний на 25–35%, так как позволяет выявить опухоли на стадии, когда лечение наиболее эффективно.\n\nВ GENEVITY программа «Check-up 40» реализуется в формате «один день — полное обследование»: пациент проходит все исследования за один визит, а результаты выдаются в организованном виде с комментариями врача. Чек ап организма в 40 лет — это инвестиция в здоровье, которая может сохранить годы и качество жизни.",
          en: "The 'Check-up 40' programme is a systematic medical screening for men and women over 40, aimed at early detection of diseases before symptoms appear. Check-up at 40 provides a complete picture of your body's health status and identifies the risk of cardiovascular, endocrine, oncological and other conditions common in the 40+ age group.\n\nThe check-up 40 programme at GENEVITY includes: general blood and urine tests, comprehensive biochemistry (glucose, cholesterol, triglycerides, ALT, AST, creatinine, etc.), hormonal profile (TSH, thyroid hormones, sex hormones), tumour markers (gender-specific), ECG, abdominal ultrasound, and a doctor's consultation with results review.\n\nCheck-up at 40 is not a one-time event — it is a recommended annual practice. Research shows that regular screening after 40 reduces cancer mortality risk by 25–35%, as it enables detection of tumours at the stage when treatment is most effective.\n\nAt GENEVITY the 'Check-up 40' programme is delivered in a 'one day — full assessment' format: the patient completes all examinations in a single visit, with results presented in organised form with the doctor's commentary. Body check-up at 40 is an investment in health that can preserve years and quality of life.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Кому рекомендована програма Check-up 40", ru: "Кому рекомендована программа Check-up 40", en: "Who Should Complete the Check-up 40 Programme" },
        indications: [
          { uk: "Чоловіки та жінки 40+ без хронічних захворювань — для профілактичного скринінгу", ru: "Мужчины и женщины 40+ без хронических заболеваний — для профилактического скрининга", en: "Men and women 40+ without chronic conditions — for preventive screening" },
          { uk: "Пацієнти з підвищеним ризиком серцево-судинних захворювань (спадковість, куріння, надлишкова вага)", ru: "Пациенты с повышенным риском сердечно-сосудистых заболеваний (наследственность, курение, избыточный вес)", en: "Patients with elevated cardiovascular risk (heredity, smoking, overweight)" },
          { uk: "Особи із сімейним анамнезом онкологічних захворювань", ru: "Лица с семейным анамнезом онкологических заболеваний", en: "Individuals with family history of oncological diseases" },
          { uk: "Пацієнти зі скаргами на підвищену втомлюваність, зниження лібідо, погіршення пам'яті", ru: "Пациенты с жалобами на повышенную утомляемость, снижение либидо, ухудшение памяти", en: "Patients with complaints of fatigue, reduced libido, memory decline" },
          { uk: "Особи, які не проходили медичне обстеження більше 2 років", ru: "Лица, не проходившие медицинское обследование более 2 лет", en: "Individuals who have not had a medical examination in over 2 years" },
        ],
        contraindicationsHeading: { uk: "Обмеження та особливості підготовки", ru: "Ограничения и особенности подготовки", en: "Limitations and Preparation Notes" },
        contraindications: [
          { uk: "Аналізи крові здаються натще (8–12 годин без їжі)", ru: "Анализы крови сдаются натощак (8–12 часов без еды)", en: "Blood tests require fasting (8–12 hours without food)" },
          { uk: "За 3 доби до УЗД — виключити газоутворюючі продукти (бобові, сирі овочі, газовані напої)", ru: "За 3 суток до УЗИ — исключить газообразующие продукты (бобовые, сырые овощи, газированные напитки)", en: "3 days before ultrasound — avoid gas-producing foods (legumes, raw vegetables, carbonated drinks)" },
          { uk: "Жінкам: оптимальний час для скринінгу — 5–10 день менструального циклу", ru: "Женщинам: оптимальное время для скрининга — 5–10 день менструального цикла", en: "Women: optimal screening time is cycle days 5–10" },
          { uk: "Гострі інфекційні захворювання — рекомендується перенести скринінг після одужання", ru: "Острые инфекционные заболевания — рекомендуется перенести скрининг после выздоровления", en: "Acute infections — it is recommended to postpone screening until recovery" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Один день у клініці — і повна картина стану здоров'я на руках. Check-up 40 виявляє захворювання до симптомів, коли лікування найпростіше та найефективніше.",
          ru: "Один день в клинике — и полная картина состояния здоровья на руках. Check-up 40 выявляет заболевания до симптомов, когда лечение проще и эффективнее всего.",
          en: "One day at the clinic — and a complete health picture in your hands. Check-up 40 detects conditions before symptoms appear, when treatment is simplest and most effective.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Що входить у програму Check-up 40", ru: "Что входит в программу Check-up 40", en: "What Is Included in the Check-up 40 Programme" },
        steps: [
          {
            title: { uk: "Лабораторна діагностика", ru: "Лабораторная диагностика", en: "Laboratory diagnostics" },
            body: { uk: "Загальний та біохімічний аналіз крові, аналіз сечі, ліпідограма, глюкоза, гормони щитоподібної залози, статеві гормони, онкомаркери (PSA для чоловіків, СА-125 для жінок).", ru: "Общий и биохимический анализ крови, анализ мочи, липидограмма, глюкоза, гормоны щитовидной железы, половые гормоны, онкомаркеры (PSA для мужчин, СА-125 для женщин).", en: "General and biochemical blood tests, urinalysis, lipid profile, glucose, thyroid hormones, sex hormones, tumour markers (PSA for men, CA-125 for women)." },
          },
          {
            title: { uk: "Інструментальна діагностика", ru: "Инструментальная диагностика", en: "Instrumental diagnostics" },
            body: { uk: "ЕКГ у спокої, УЗД органів черевної порожнини та нирок, вимірювання артеріального тиску та ЧСС.", ru: "ЭКГ в покое, УЗИ органов брюшной полости и почек, измерение артериального давления и ЧСС.", en: "Resting ECG, abdominal and kidney ultrasound, blood pressure and heart rate measurement." },
          },
          {
            title: { uk: "Консультація терапевта", ru: "Консультация терапевта", en: "General practitioner consultation" },
            body: { uk: "Лікар аналізує всі результати, виявляє відхилення, визначає групу ризику та формує персональні рекомендації щодо корекції способу життя або додаткового обстеження.", ru: "Врач анализирует все результаты, выявляет отклонения, определяет группу риска и формирует персональные рекомендации по коррекции образа жизни или дополнительному обследованию.", en: "The doctor analyses all results, identifies deviations, determines risk group and provides personalised recommendations for lifestyle correction or further investigation." },
          },
          {
            title: { uk: "Підсумковий звіт", ru: "Итоговый отчёт", en: "Summary report" },
            body: { uk: "Пацієнт отримує звіт із усіма показниками, їх інтерпретацією та конкретними рекомендаціями. Документ зберігається в електронному форматі.", ru: "Пациент получает отчёт со всеми показателями, их интерпретацией и конкретными рекомендациями. Документ хранится в электронном формате.", en: "The patient receives a report with all indicators, their interpretation and specific recommendations. The document is stored digitally." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги Check-up 40 в GENEVITY", ru: "Преимущества Check-up 40 в GENEVITY", en: "Check-up 40 Benefits at GENEVITY" },
        items: [
          { uk: "Формат «один день» — всі обстеження за один візит без черг", ru: "Формат «один день» — все обследования за один визит без очередей", en: "One-day format — all examinations in a single visit, no queues" },
          { uk: "Включає гормональний скринінг та онкомаркери — критично після 40", ru: "Включает гормональный скрининг и онкомаркеры — критически важно после 40", en: "Includes hormonal screening and tumour markers — critical after 40" },
          { uk: "Результати з інтерпретацією лікаря, а не просто цифри", ru: "Результаты с интерпретацией врача, а не просто цифры", en: "Results with doctor's interpretation, not just numbers" },
          { uk: "Персоналізований план дій за результатами скринінгу", ru: "Персонализированный план действий по результатам скрининга", en: "Personalised action plan based on screening results" },
          { uk: "⚠ Чек ап — скринінг, а не діагностика конкретного захворювання. При виявленні відхилень лікар направить до профільного спеціаліста", ru: "⚠ Чек ап — скрининг, а не диагностика конкретного заболевания. При выявлении отклонений врач направит к профильному специалисту", en: "⚠ Check-up is screening, not diagnosis of a specific disease. If deviations are found, the doctor will refer to an appropriate specialist" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка GENEVITY — медичний центр", ru: "Клиника GENEVITY — медицинский центр", en: "GENEVITY Clinic — Medical Centre" },
        images: [
          { url: "/images/equipment/inbody.webp", alt: "Аналіз складу тіла InBody у GENEVITY" },
          ...interior.slice(0, 2),
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на Check-up 40 в Дніпрі", ru: "Запишитесь на Check-up 40 в Днепре", en: "Book Check-up 40 in Dnipro" },
        body: { uk: "Дізнайтеся вартість програми «Check-up 40» та запишіться на зручний день. Один візит — повна картина вашого здоров'я.", ru: "Узнайте стоимость программы «Check-up 40» и запишитесь на удобный день. Один визит — полная картина вашего здоровья.", en: "Find out the Check-up 40 programme cost and book a convenient day. One visit — a complete health picture." },
        ctaLabel: { uk: "Записатися на Check-up", ru: "Записаться на Check-up", en: "Book a Check-up" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Яка тривалість програми «Check-up 40»?", ru: "Какова продолжительность программы «Check-up 40»?", en: "How long does the Check-up 40 programme take?" },
        answer: { uk: "Весь скринінг займає 3–4 години в один день. Лабораторні результати готові за 1–2 доби. Консультація лікаря з підсумками призначається на окремий час після отримання всіх аналізів.", ru: "Весь скрининг занимает 3–4 часа в один день. Лабораторные результаты готовы за 1–2 суток. Консультация врача с итогами назначается на отдельное время после получения всех анализов.", en: "The full screening takes 3–4 hours in one day. Laboratory results are ready within 1–2 days. A results consultation with the doctor is scheduled separately after all tests are received." },
      },
      {
        question: { uk: "Чи покриває страхування вартість «Check-up 40»?", ru: "Покрывает ли страхование стоимость «Check-up 40»?", en: "Does insurance cover the cost of Check-up 40?" },
        answer: { uk: "Залежить від умов вашого страхового поліса. Рекомендуємо уточнити у страховика перед записом. GENEVITY надає всі необхідні документи для компенсації витрат за полісом.", ru: "Зависит от условий вашего страхового полиса. Рекомендуем уточнить у страховщика перед записью. GENEVITY предоставляет все необходимые документы для компенсации расходов по полису.", en: "It depends on your insurance policy terms. We recommend checking with your insurer before booking. GENEVITY provides all necessary documents for insurance reimbursement." },
      },
      {
        question: { uk: "Як часто рекомендується проходити «Check-up 40»?", ru: "Как часто рекомендуется проходить «Check-up 40»?", en: "How often is Check-up 40 recommended?" },
        answer: { uk: "Щорічно. При виявленні відхилень або підвищеному ризику окремих захворювань лікар може рекомендувати повторний скринінг через 6 місяців або направити до профільного спеціаліста.", ru: "Ежегодно. При выявлении отклонений или повышенном риске отдельных заболеваний врач может рекомендовать повторный скрининг через 6 месяцев или направить к профильному специалисту.", en: "Annually. If deviations are found or specific disease risk is elevated, the doctor may recommend repeat screening in 6 months or refer to a specialist." },
      },
    ],
  },

  // ─── 35. Longevity програма ───────────────────────────────────────────────
  {
    slug: "longevity-program",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Програма Longevity — персоналізоване довголіття в GENEVITY",
          ru: "Программа Longevity — персонализированное долголетие в GENEVITY",
          en: "Longevity Programme — Personalised Longevity at GENEVITY",
        },
        body: {
          uk: "Програма довголіття GENEVITY Longevity — це науково обґрунтований підхід до уповільнення біологічного старіння та підвищення якості та тривалості активного довголіття. На відміну від стандартної медицини, яка лікує вже наявні хвороби, програма здорового довголіття спрямована на превентивне збереження функцій організму: серцево-судинної, нейрокогнітивної, ендокринної та опорно-рухової систем.\n\nПрограма довголіття в GENEVITY будується на чотирьох ключових компонентах:\n\n1. Діагностика біологічного віку — комплексний аналіз маркерів старіння: теломерна довжина, рівень запалення (hs-CRP, IL-6), метаболічний профіль, гормональний статус\n2. Персоналізоване харчування — складання раціону на основі генетичних тестів та метаболоміки; виключення проінфламаторних факторів\n3. Фізична активність та відновлення — індивідуальна програма тренувань на основі VO₂max, м'язової маси та складу тіла (аналіз InBody)\n4. Ментальне здоров'я та нейропротекція — робота зі стресом, сном, когнітивним резервом\n\nProgramme довголіття — це не дієта та не курс добавок. Це системна зміна способу життя під медичним супроводом лікарів GENEVITY, з регулярним контролем біомаркерів та коригуванням плану.",
          ru: "Программа долголетия GENEVITY Longevity — это научно обоснованный подход к замедлению биологического старения и повышению качества и продолжительности активного долголетия. В отличие от стандартной медицины, которая лечит уже имеющиеся болезни, программа здорового долголетия направлена на превентивное сохранение функций организма: сердечно-сосудистой, нейрокогнитивной, эндокринной и опорно-двигательной систем.\n\nПрограмма долголетия в GENEVITY строится на четырёх ключевых компонентах:\n\n1. Диагностика биологического возраста — комплексный анализ маркеров старения: теломерная длина, уровень воспаления (hs-CRP, IL-6), метаболический профиль, гормональный статус\n2. Персонализированное питание — составление рациона на основе генетических тестов и метаболомики; исключение провоспалительных факторов\n3. Физическая активность и восстановление — индивидуальная программа тренировок на основе VO₂max, мышечной массы и состава тела (анализ InBody)\n4. Ментальное здоровье и нейропротекция — работа со стрессом, сном, когнитивным резервом\n\nПрограмма долголетия — это не диета и не курс добавок. Это системное изменение образа жизни под медицинским сопровождением врачей GENEVITY с регулярным контролем биомаркеров и корректировкой плана.",
          en: "The GENEVITY Longevity Programme is a science-based approach to slowing biological ageing and improving the quality and duration of active longevity. Unlike standard medicine, which treats existing conditions, the healthy longevity programme focuses on preventive preservation of bodily functions: cardiovascular, neurocognitive, endocrine and musculoskeletal systems.\n\nThe GENEVITY longevity programme is built on four key components:\n\n1. Biological age diagnostics — comprehensive analysis of ageing biomarkers: telomere length, inflammation markers (hs-CRP, IL-6), metabolic profile, hormonal status\n2. Personalised nutrition — diet based on genetic tests and metabolomics; elimination of pro-inflammatory factors\n3. Physical activity and recovery — individual training programme based on VO₂max, muscle mass and body composition (InBody analysis)\n4. Mental health and neuroprotection — stress management, sleep optimisation, cognitive reserve building\n\nThe longevity programme is not a diet or supplement course. It is a systematic lifestyle change under the medical supervision of GENEVITY doctors, with regular biomarker monitoring and plan adjustment.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Кому підходить програма Longevity", ru: "Кому подходит программа Longevity", en: "Who the Longevity Programme Is For" },
        indications: [
          { uk: "Особи 35–65 років, які прагнуть уповільнити вікові зміни та зберегти якість життя", ru: "Лица 35–65 лет, стремящиеся замедлить возрастные изменения и сохранить качество жизни", en: "Individuals 35–65 who want to slow ageing and preserve quality of life" },
          { uk: "Пацієнти з хронічною втомою, зниженням когнітивних функцій та продуктивності", ru: "Пациенты с хронической усталостью, снижением когнитивных функций и продуктивности", en: "Patients with chronic fatigue, reduced cognitive function and productivity" },
          { uk: "Бізнес-лідери та управлінці, для яких когнітивне здоров'я — ключовий актив", ru: "Бизнес-лидеры и управленцы, для которых когнитивное здоровье — ключевой актив", en: "Business leaders and executives for whom cognitive health is a key asset" },
          { uk: "Особи з обтяженим сімейним анамнезом: цукровий діабет, деменція, серцево-судинні захворювання", ru: "Лица с отягощённым семейным анамнезом: сахарный диабет, деменция, сердечно-сосудистые заболевания", en: "Individuals with family history of diabetes, dementia, cardiovascular disease" },
          { uk: "Пацієнти після 40, які вперше системно займаються своїм здоров'ям", ru: "Пациенты после 40, впервые системно занимающиеся своим здоровьем", en: "Patients over 40 engaging in systematic health management for the first time" },
        ],
        contraindicationsHeading: { uk: "Важливі застереження", ru: "Важные оговорки", en: "Important Notes" },
        contraindications: [
          { uk: "Програма не замінює лікування гострих та хронічних захворювань — тільки превентивна медицина", ru: "Программа не заменяет лечение острых и хронических заболеваний — только превентивная медицина", en: "The programme does not replace treatment of acute or chronic conditions — preventive medicine only" },
          { uk: "Потребує особистого залучення пацієнта: зміна харчування та способу життя є обов'язковими", ru: "Требует личного вовлечённости пациента: изменение питания и образа жизни обязательны", en: "Requires personal patient commitment: diet and lifestyle changes are mandatory" },
          { uk: "Генетичні тести та деякі біомаркери виконуються в партнерських лабораторіях (додаткова вартість)", ru: "Генетические тесты и некоторые биомаркеры выполняются в партнёрских лабораториях (дополнительная стоимость)", en: "Genetic tests and some biomarkers are performed at partner laboratories (additional cost)" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Програма довголіття GENEVITY — це не про те, як жити довше. Це про те, як жити краще на кожному десятиріччі, зберігши здоров'я, енергію та когнітивні функції.",
          ru: "Программа долголетия GENEVITY — это не о том, как жить дольше. Это о том, как жить лучше на каждом десятилетии, сохранив здоровье, энергию и когнитивные функции.",
          en: "The GENEVITY longevity programme is not about living longer. It is about living better in each decade — preserving health, energy and cognitive function.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як працює програма Longevity", ru: "Как работает программа Longevity", en: "How the Longevity Programme Works" },
        steps: [
          {
            title: { uk: "Первинна консультація та діагностика", ru: "Первичная консультация и диагностика", en: "Initial consultation and diagnostics" },
            body: { uk: "Комплексне обстеження: аналізи крові, гормональний профіль, аналіз складу тіла InBody, VO₂max, анкетування щодо сну, стресу та харчування.", ru: "Комплексное обследование: анализы крови, гормональный профиль, анализ состава тела InBody, VO₂max, анкетирование по сну, стрессу и питанию.", en: "Comprehensive assessment: blood tests, hormonal profile, InBody body composition analysis, VO₂max, questionnaire on sleep, stress and nutrition." },
          },
          {
            title: { uk: "Розробка персонального плану", ru: "Разработка персонального плана", en: "Personal plan development" },
            body: { uk: "На основі результатів лікар складає план корекції: харчування, добавки, фізична активність, режим сну, управління стресом.", ru: "На основе результатов врач составляет план коррекции: питание, добавки, физическая активность, режим сна, управление стрессом.", en: "Based on results the doctor creates a correction plan: nutrition, supplements, physical activity, sleep schedule, stress management." },
          },
          {
            title: { uk: "Супровід та контроль", ru: "Сопровождение и контроль", en: "Monitoring and support" },
            body: { uk: "Регулярні консультації (раз на місяць або квартал), повторне тестування біомаркерів, коригування плану за динамікою показників.", ru: "Регулярные консультации (раз в месяц или квартал), повторное тестирование биомаркеров, корректировка плана по динамике показателей.", en: "Regular consultations (monthly or quarterly), repeat biomarker testing, plan adjustment based on indicator dynamics." },
          },
          {
            title: { uk: "Оцінка прогресу", ru: "Оценка прогресса", en: "Progress assessment" },
            body: { uk: "Через 3 та 6 місяців — порівняльний аналіз біомаркерів. Лікар оцінює динаміку біологічного віку та коригує програму.", ru: "Через 3 и 6 месяцев — сравнительный анализ биомаркеров. Врач оценивает динамику биологического возраста и корректирует программу.", en: "At 3 and 6 months — comparative biomarker analysis. The doctor assesses biological age dynamics and adjusts the programme." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Що отримує учасник програми Longevity", ru: "Что получает участник программы Longevity", en: "What Longevity Programme Participants Receive" },
        items: [
          { uk: "Визначення свого біологічного (а не паспортного) віку з конкретним планом його зниження", ru: "Определение своего биологического (а не паспортного) возраста с конкретным планом его снижения", en: "Determination of biological (not chronological) age with a specific reduction plan" },
          { uk: "Персоналізований план харчування на основі метаболічного та гормонального профілю", ru: "Персонализированный план питания на основе метаболического и гормонального профиля", en: "Personalised nutrition plan based on metabolic and hormonal profile" },
          { uk: "Протокол фізичної активності з урахуванням VO₂max та складу тіла", ru: "Протокол физической активности с учётом VO₂max и состава тела", en: "Physical activity protocol factoring in VO₂max and body composition" },
          { uk: "Регулярний медичний контроль та коригування плану за результатами", ru: "Регулярный медицинский контроль и корректировка плана по результатам", en: "Regular medical monitoring and plan adjustment based on results" },
          { uk: "⚠ Результати програми залежать від особистого залучення пацієнта — лікар може рекомендувати, але не може зобов'язати", ru: "⚠ Результаты программы зависят от личной вовлечённости пациента — врач может рекомендовать, но не может обязать", en: "⚠ Programme results depend on personal patient commitment — the doctor can recommend but not enforce" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "GENEVITY — медицина довголіття", ru: "GENEVITY — медицина долголетия", en: "GENEVITY — Longevity Medicine" },
        images: [
          { url: "/images/equipment/inbody.webp", alt: "Аналіз складу тіла InBody у GENEVITY" },
          ...interior.slice(0, 2),
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на програму Longevity в GENEVITY", ru: "Запишитесь на программу Longevity в GENEVITY", en: "Book the Longevity Programme at GENEVITY" },
        body: { uk: "Дізнайтеся вартість програми довголіття та почніть системну роботу зі своїм здоров'ям на безкоштовній первинній консультації.", ru: "Узнайте стоимость программы долголетия и начните системную работу со своим здоровьем на бесплатной первичной консультации.", en: "Find out the longevity programme cost and start systematic health management at a free initial consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Які результати можна очікувати від участі в програмі Longevity?", ru: "Какие результаты можно ожидать от участия в программе Longevity?", en: "What results can be expected from the Longevity programme?" },
        answer: { uk: "Залежить від вихідного стану. Типові результати через 6 місяців: покращення енергетичного рівня, нормалізація сну, зниження маркерів запалення, покращення складу тіла (зниження вісцерального жиру, збільшення м'язової маси), покращення когнітивних функцій.", ru: "Зависит от исходного состояния. Типичные результаты через 6 месяцев: улучшение энергетического уровня, нормализация сна, снижение маркеров воспаления, улучшение состава тела (снижение висцерального жира, увеличение мышечной массы), улучшение когнитивных функций.", en: "Depends on starting condition. Typical results after 6 months: improved energy levels, normalised sleep, reduced inflammation markers, improved body composition (reduced visceral fat, increased muscle mass), improved cognitive function." },
      },
      {
        question: { uk: "Чи підходить програма Longevity для людей з хронічними захворюваннями?", ru: "Подходит ли программа Longevity для людей с хроническими заболеваниями?", en: "Is the Longevity programme suitable for people with chronic conditions?" },
        answer: { uk: "Так, але з урахуванням наявних захворювань. При хронічних патологіях програма адаптується лікарем: деякі компоненти можуть бути протипоказані або потребують узгодження з профільним спеціалістом.", ru: "Да, но с учётом имеющихся заболеваний. При хронических патологиях программа адаптируется врачом: некоторые компоненты могут быть противопоказаны или требуют согласования с профильным специалистом.", en: "Yes, taking existing conditions into account. For chronic conditions the programme is adapted by the doctor: some components may be contraindicated or require coordination with a specialist." },
      },
      {
        question: { uk: "Як часто потрібно проходити оцінку прогресу в програмі Longevity?", ru: "Как часто нужно проходить оценку прогресса в программе Longevity?", en: "How often is progress assessed in the Longevity programme?" },
        answer: { uk: "Первинна оцінка — через 3 місяці від старту. Повторна — через 6 місяців. Далі — раз на рік або частіше за показаннями. Між сесіями доступні онлайн-консультації та моніторинг показників.", ru: "Первичная оценка — через 3 месяца от старта. Повторная — через 6 месяцев. Далее — раз в год или чаще по показаниям. Между сессиями доступны онлайн-консультации и мониторинг показателей.", en: "Initial assessment: 3 months after start. Repeat: 6 months. Subsequently: annually or more frequently as indicated. Online consultations and indicator monitoring available between sessions." },
      },
    ],
  },

  // ─── 36. Гормональний баланс ─────────────────────────────────────────────
  {
    slug: "hormonal-balance",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Програма гормональний баланс — відновлення та корекція в GENEVITY",
          ru: "Программа гормональный баланс — восстановление и коррекция в GENEVITY",
          en: "Hormonal Balance Programme — Restoration and Correction at GENEVITY",
        },
        body: {
          uk: "Гормональний баланс — це стан, при якому всі ендокринні залози виробляють гормони у кількості, необхідній для оптимального функціонування організму. Коли цей баланс порушується — виникають симптоми, які часто помилково приписують стресу або втомі: хронічна безсоння, різкі перепади настрою, набір ваги без зміни харчування, зниження лібідо, випадіння волосся, тривожність.\n\nПрограма відновлення гормонального балансу у GENEVITY — це медично супроводжений процес діагностики та корекції гормональних порушень. Програма гормональний баланс охоплює:\n\n— Комплексну гормональну діагностику: ТТГ, Т3, Т4 вільний, кортизол, ДГЕА, тестостерон, естрадіол, прогестерон, ЛГ, ФСГ, пролактин, інсулін, IGF-1\n— Виявлення симптомів гормонального дисбалансу та їх взаємозв'язку з результатами аналізів\n— Індивідуальний план корекції: харчування, нутрицевтики, фізична активність, за показаннями — гормональна терапія\n— Регулярний моніторинг та коригування плану\n\nПереваги програми гормонального балансу в GENEVITY: мультидисциплінарний підхід (ендокринолог + косметолог + нутриціолог), диференціювання між гормональними проблемами та дефіцитом мікронутрієнтів, корекція без призначення гормонів там, де це можливо.",
          ru: "Гормональный баланс — это состояние, при котором все эндокринные железы вырабатывают гормоны в количестве, необходимом для оптимального функционирования организма. Когда этот баланс нарушается — возникают симптомы, которые часто ошибочно приписывают стрессу или усталости: хроническая бессонница, резкие перепады настроения, набор веса без изменения питания, снижение либидо, выпадение волос, тревожность.\n\nПрограмма восстановления гормонального баланса в GENEVITY — это медицински сопровождаемый процесс диагностики и коррекции гормональных нарушений. Программа гормональный баланс охватывает:\n\n— Комплексную гормональную диагностику: ТТГ, Т3, Т4 свободный, кортизол, ДГЭА, тестостерон, эстрадиол, прогестерон, ЛГ, ФСГ, пролактин, инсулин, IGF-1\n— Выявление симптомов гормонального дисбаланса и их взаимосвязи с результатами анализов\n— Индивидуальный план коррекции: питание, нутрицевтики, физическая активность, по показаниям — гормональная терапия\n— Регулярный мониторинг и корректировка плана\n\nПреимущества программы гормонального баланса в GENEVITY: мультидисциплинарный подход (эндокринолог + косметолог + нутрициолог), дифференцирование между гормональными проблемами и дефицитом микронутриентов, коррекция без назначения гормонов там, где это возможно.",
          en: "Hormonal balance is the state in which all endocrine glands produce hormones in the quantity needed for optimal body function. When this balance is disrupted, symptoms arise that are often mistakenly attributed to stress or fatigue: chronic insomnia, sharp mood swings, weight gain without dietary changes, reduced libido, hair loss, anxiety.\n\nThe GENEVITY hormonal balance restoration programme is a medically supervised process of diagnosing and correcting hormonal disorders. The hormonal balance programme includes:\n\n— Comprehensive hormonal diagnostics: TSH, T3, free T4, cortisol, DHEA, testosterone, oestradiol, progesterone, LH, FSH, prolactin, insulin, IGF-1\n— Identification of hormonal imbalance symptoms and their relationship to test results\n— Individual correction plan: nutrition, nutraceuticals, physical activity, hormone therapy if indicated\n— Regular monitoring and plan adjustment\n\nAdvantages of GENEVITY's hormonal balance programme: multidisciplinary approach (endocrinologist + aesthetics doctor + nutritionist), differentiation between hormonal issues and micronutrient deficiency, correction without hormones where possible.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Ознаки та симптоми гормонального дисбалансу", ru: "Признаки и симптомы гормонального дисбаланса", en: "Signs and Symptoms of Hormonal Imbalance" },
        indications: [
          { uk: "Хронічна втома, яка не минає після відпочинку", ru: "Хроническая усталость, не проходящая после отдыха", en: "Chronic fatigue that does not resolve with rest" },
          { uk: "Різкі перепади настрою, тривожність, дратівливість без причини", ru: "Резкие перепады настроения, тревожность, раздражительность без причины", en: "Sharp mood swings, anxiety, irritability without cause" },
          { uk: "Набір ваги або неможливість схуднути попри дієту та тренування", ru: "Набор веса или невозможность похудеть несмотря на диету и тренировки", en: "Weight gain or inability to lose weight despite diet and exercise" },
          { uk: "Зниження лібідо та порушення менструального циклу (у жінок)", ru: "Снижение либидо и нарушение менструального цикла (у женщин)", en: "Reduced libido and menstrual cycle disruption (in women)" },
          { uk: "Порушення сну, нічний піт, відчуття жару", ru: "Нарушение сна, ночной пот, ощущение жара", en: "Sleep disturbance, night sweats, hot flushes" },
        ],
        contraindicationsHeading: { uk: "Важливо знати", ru: "Важно знать", en: "Important to Know" },
        contraindications: [
          { uk: "Програма не призначає гормональну терапію без показань — тільки за результатами комплексної діагностики", ru: "Программа не назначает гормональную терапию без показаний — только по результатам комплексной диагностики", en: "The programme does not prescribe hormone therapy without indications — only based on comprehensive diagnostics" },
          { uk: "При важких ендокринних захворюваннях (ЦД1, тиреоїдит Хашимото) програма є доповненням до основного лікування", ru: "При тяжёлых эндокринных заболеваниях (СД1, тиреоидит Хашимото) программа является дополнением к основному лечению", en: "With severe endocrine conditions (T1DM, Hashimoto's thyroiditis) the programme supplements primary treatment" },
          { uk: "Вагітність та лактація — деякі компоненти програми потребують адаптації", ru: "Беременность и лактация — некоторые компоненты программы требуют адаптации", en: "Pregnancy and breastfeeding — some programme components require adaptation" },
          { uk: "Онкологічні захворювання гормонозалежних органів — обов'язкова консультація онколога", ru: "Онкологические заболевания гормонозависимых органов — обязательная консультация онколога", en: "Oncological conditions of hormone-dependent organs — oncologist consultation mandatory" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Гормональний дисбаланс — це не вирок і не «вікові зміни». У більшості випадків він коригується без гормональних препаратів: харчуванням, нутрицевтиками та змінами способу життя.",
          ru: "Гормональный дисбаланс — это не приговор и не «возрастные изменения». В большинстве случаев он корректируется без гормональных препаратов: питанием, нутрицевтиками и изменениями образа жизни.",
          en: "Hormonal imbalance is not a sentence or 'age-related changes'. In most cases it can be corrected without hormone drugs: through nutrition, nutraceuticals and lifestyle changes.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Етапи програми гормональний баланс", ru: "Этапы программы гормональный баланс", en: "Hormonal Balance Programme Steps" },
        steps: [
          {
            title: { uk: "Первинна консультація та збір анамнезу", ru: "Первичная консультация и сбор анамнеза", en: "Initial consultation and medical history" },
            body: { uk: "Лікар збирає детальний анамнез, визначає скарги, аналізує попередні аналізи та призначає комплексну гормональну діагностику.", ru: "Врач собирает детальный анамнез, определяет жалобы, анализирует предыдущие анализы и назначает комплексную гормональную диагностику.", en: "The doctor takes a detailed medical history, identifies complaints, reviews previous tests and orders comprehensive hormonal diagnostics." },
          },
          {
            title: { uk: "Комплексна гормональна діагностика", ru: "Комплексная гормональная диагностика", en: "Comprehensive hormonal diagnostics" },
            body: { uk: "Розгорнутий гормональний профіль (15–20 показників) + аналіз мікронутрієнтів (вітамін D, магній, цинк, залізо) + склад тіла InBody.", ru: "Развёрнутый гормональный профиль (15–20 показателей) + анализ микронутриентов (витамин D, магний, цинк, железо) + состав тела InBody.", en: "Full hormonal profile (15–20 markers) + micronutrient analysis (vitamin D, magnesium, zinc, iron) + InBody body composition." },
          },
          {
            title: { uk: "Розробка плану корекції", ru: "Разработка плана коррекции", en: "Correction plan development" },
            body: { uk: "На основі результатів лікар формує індивідуальний план: харчування, добавки (нутрицевтики), фізична активність та — за показаннями — гормональна терапія.", ru: "На основе результатов врач формирует индивидуальный план: питание, добавки (нутрицевтики), физическая активность и — по показаниям — гормональная терапия.", en: "Based on results the doctor creates an individual plan: nutrition, supplements (nutraceuticals), physical activity, and hormone therapy if indicated." },
          },
          {
            title: { uk: "Моніторинг та коригування", ru: "Мониторинг и корректировка", en: "Monitoring and adjustment" },
            body: { uk: "Через 2–3 місяці — повторні аналізи та консультація. Оцінка динаміки та коригування схеми.", ru: "Через 2–3 месяца — повторные анализы и консультация. Оценка динамики и корректировка схемы.", en: "After 2–3 months — repeat tests and consultation. Assessment of dynamics and scheme adjustment." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги програми в GENEVITY", ru: "Преимущества программы в GENEVITY", en: "Programme Benefits at GENEVITY" },
        items: [
          { uk: "Комплексний профіль 15–20 гормонів — не один-два аналізи, а повна картина", ru: "Комплексный профиль 15–20 гормонов — не один-два анализа, а полная картина", en: "Comprehensive 15–20 hormone profile — not just one or two tests, but the full picture" },
          { uk: "Диференціація між гормональним дисбалансом та дефіцитом мікронутрієнтів", ru: "Дифференциация между гормональным дисбалансом и дефицитом микронутриентов", en: "Differentiation between hormonal imbalance and micronutrient deficiency" },
          { uk: "Корекція без гормонів там, де це можливо", ru: "Коррекция без гормонов там, где это возможно", en: "Correction without hormones where possible" },
          { uk: "Мультидисциплінарна команда: ендокринолог + косметолог + нутриціолог", ru: "Мультидисциплинарная команда: эндокринолог + косметолог + нутрициолог", en: "Multidisciplinary team: endocrinologist + aesthetics doctor + nutritionist" },
          { uk: "⚠ Самолікування гормональними препаратами без аналізів — небезпечно. Завжди потрібна лікарська діагностика", ru: "⚠ Самолечение гормональными препаратами без анализов — опасно. Всегда нужна врачебная диагностика", en: "⚠ Self-treating with hormone drugs without testing is dangerous. Medical diagnostics are always required" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "GENEVITY — медицина довголіття та гормонального здоров'я", ru: "GENEVITY — медицина долголетия и гормонального здоровья", en: "GENEVITY — Longevity and Hormonal Health Medicine" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на програму гормональний баланс у GENEVITY", ru: "Запишитесь на программу гормональный баланс в GENEVITY", en: "Book the Hormonal Balance Programme at GENEVITY" },
        body: { uk: "Перша консультація та аналіз анамнезу — безкоштовно. Дізнайтеся вартість програми відновлення гормонального балансу.", ru: "Первичная консультация и анализ анамнеза — бесплатно. Узнайте стоимость программы восстановления гормонального баланса.", en: "Initial consultation and medical history review are free. Find out the hormonal balance restoration programme cost." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Які аналізи необхідні для оцінки гормонального балансу?", ru: "Какие анализы необходимы для оценки гормонального баланса?", en: "What tests are needed to assess hormonal balance?" },
        answer: { uk: "Базовий профіль: ТТГ, Т4 вільний, кортизол ранковий, ДГЕА-С, тестостерон загальний та вільний (для чоловіків), естрадіол, прогестерон, ЛГ, ФСГ (для жінок), пролактин, інсулін натще, IGF-1. Лікар може розширити профіль за показаннями.", ru: "Базовый профиль: ТТГ, Т4 свободный, кортизол утренний, ДГЭА-С, тестостерон общий и свободный (для мужчин), эстрадиол, прогестерон, ЛГ, ФСГ (для женщин), пролактин, инсулин натощак, IGF-1. Врач может расширить профиль по показаниям.", en: "Basic profile: TSH, free T4, morning cortisol, DHEA-S, total and free testosterone (men), oestradiol, progesterone, LH, FSH (women), prolactin, fasting insulin, IGF-1. The doctor may expand the profile based on indications." },
      },
      {
        question: { uk: "Чи підходить програма для жінок різного віку?", ru: "Подходит ли программа для женщин разного возраста?", en: "Is the programme suitable for women of different ages?" },
        answer: { uk: "Так. Програма адаптується під вік та статус: для жінок 25–35 з порушеннями циклу, 35–45 в перименопаузі, та 45+ у постменопаузі протоколи діагностики та корекції суттєво відрізняються.", ru: "Да. Программа адаптируется под возраст и статус: для женщин 25–35 с нарушениями цикла, 35–45 в перименопаузе, и 45+ в постменопаузе протоколы диагностики и коррекции существенно различаются.", en: "Yes. The programme is adapted to age and status: for women 25–35 with cycle disorders, 35–45 in perimenopause, and 45+ in postmenopause, diagnostics and correction protocols differ significantly." },
      },
      {
        question: { uk: "Скільки часу потрібно для відновлення гормонального балансу?", ru: "Сколько времени нужно для восстановления гормонального баланса?", en: "How long does hormonal balance restoration take?" },
        answer: { uk: "Перші зміни відчуваються через 4–8 тижнів після початку корекції. Стійкий результат — через 3–6 місяців. При гормональній терапії терміни залежать від препарату та дози.", ru: "Первые изменения ощущаются через 4–8 недель после начала коррекции. Устойчивый результат — через 3–6 месяцев. При гормональной терапии сроки зависят от препарата и дозы.", en: "First changes are felt after 4–8 weeks of correction. Stable results: 3–6 months. With hormone therapy, timing depends on the drug and dosage." },
      },
      {
        question: { uk: "Чи можливі побічні ефекти під час проходження програми?", ru: "Возможны ли побочные эффекты во время прохождения программы?", en: "Are side effects possible during the programme?" },
        answer: { uk: "При корекції харчуванням та нутрицевтиками — ризик мінімальний. При гормональній терапії побічні ефекти можливі і обговорюються з лікарем до початку лікування. Регулярний моніторинг мінімізує ризики.", ru: "При коррекции питанием и нутрицевтиками — риск минимален. При гормональной терапии побочные эффекты возможны и обсуждаются с врачом до начала лечения. Регулярный мониторинг минимизирует риски.", en: "With nutrition and nutraceutical correction — risk is minimal. With hormone therapy, side effects are possible and discussed with the doctor before treatment begins. Regular monitoring minimises risks." },
      },
    ],
  },

  // ─── 37. IV терапія ──────────────────────────────────────────────────────
  {
    slug: "iv-therapy",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "IV терапія — внутрішньовенні вітамінні крапельниці в GENEVITY",
          ru: "IV терапия — внутривенные витаминные капельницы в GENEVITY",
          en: "IV Therapy — Intravenous Vitamin Drips at GENEVITY",
        },
        body: {
          uk: "Внутрішньовенна терапія (IV терапія) — це введення вітамінів, мінералів, амінокислот та інших корисних речовин безпосередньо в кров через внутрішньовенну крапельницю. На відміну від пероральних добавок, де засвоюваність активних речовин залежить від стану кишківника і не перевищує 30–50%, внутрішньовенна вітамінна терапія забезпечує 100% біодоступність.\n\nВнутрішньовенна крапельниця підходить для вирішення різних завдань:\n— Відновлення після хвороби, операції або фізичного виснаження\n— Антиоксидантний захист та уповільнення процесів старіння\n— Імунна підтримка в сезон респіраторних захворювань\n— Детоксикація при хронічному навантаженні\n— Підвищення продуктивності та когнітивних функцій\n— Косметичне освітлення шкіри (глутатіон)\n\nВартість внутрішньовенної терапії залежить від складу коктейлю. У GENEVITY доступні протоколи: Myers Cocktail (магній, кальцій, вітаміни В1–В12, С), Glutathione (антиоксидант та освітлення), Anti-age (NAD+, коензим Q10), Immune (цинк, селен, вітамін С у високих дозах), Energy (амінокислоти, В-комплекс), детоксикаційні крапельниці.\n\nВнутрішньовенна вітамінна терапія крапельниця для виведення токсинів та відновлення виконується виключно лікарями в умовах медичного центру з контролем стану пацієнта протягом усієї процедури.",
          ru: "Внутривенная терапия (IV терапия) — это введение витаминов, минералов, аминокислот и других полезных веществ непосредственно в кровь через внутривенную капельницу. В отличие от пероральных добавок, где усвояемость активных веществ зависит от состояния кишечника и не превышает 30–50%, внутривенная витаминная терапия обеспечивает 100% биодоступность.\n\nВнутривенная капельница подходит для решения различных задач:\n— Восстановление после болезни, операции или физического истощения\n— Антиоксидантная защита и замедление процессов старения\n— Иммунная поддержка в сезон респираторных заболеваний\n— Детоксикация при хронической нагрузке\n— Повышение продуктивности и когнитивных функций\n— Косметическое осветление кожи (глутатион)\n\nСтоимость внутривенной терапии зависит от состава коктейля. В GENEVITY доступны протоколы: Myers Cocktail (магний, кальций, витамины В1–В12, С), Glutathione (антиоксидант и осветление), Anti-age (NAD+, коэнзим Q10), Immune (цинк, селен, витамин С в высоких дозах), Energy (аминокислоты, В-комплекс), детоксикационные капельницы.\n\nВнутривенная витаминная терапия капельница для выведения токсинов и восстановления выполняется исключительно врачами в условиях медицинского центра с контролем состояния пациента в течение всей процедуры.",
          en: "Intravenous therapy (IV therapy) is the delivery of vitamins, minerals, amino acids and other beneficial compounds directly into the bloodstream via an IV drip. Unlike oral supplements where absorption depends on gut condition and does not exceed 30–50%, intravenous vitamin therapy provides 100% bioavailability.\n\nIntravenous drip is suitable for various goals:\n— Recovery after illness, surgery or physical exhaustion\n— Antioxidant protection and slowing of ageing processes\n— Immune support during respiratory illness season\n— Detoxification under chronic load\n— Productivity and cognitive function enhancement\n— Cosmetic skin brightening (glutathione)\n\nIV therapy pricing depends on the cocktail composition. GENEVITY offers: Myers Cocktail (magnesium, calcium, vitamins B1–B12, C), Glutathione (antioxidant and brightening), Anti-age (NAD+, Coenzyme Q10), Immune (zinc, selenium, high-dose vitamin C), Energy (amino acids, B-complex), detoxification drips.\n\nIntravenous vitamin therapy and detox drips are performed exclusively by doctors in a medical centre setting with patient monitoring throughout the procedure.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до IV терапії", ru: "Показания к IV терапии", en: "Indications for IV Therapy" },
        indications: [
          { uk: "Хронічна втома та синдром вигорання", ru: "Хроническая усталость и синдром выгорания", en: "Chronic fatigue and burnout syndrome" },
          { uk: "Відновлення після хвороби, операції або фізичних навантажень", ru: "Восстановление после болезни, операции или физических нагрузок", en: "Recovery after illness, surgery or physical exertion" },
          { uk: "Дефіцит вітамінів та мінералів при порушенні всмоктування в кишківнику", ru: "Дефицит витаминов и минералов при нарушении всасывания в кишечнике", en: "Vitamin and mineral deficiency with impaired intestinal absorption" },
          { uk: "Імунопрофілактика в сезон респіраторних захворювань", ru: "Иммунопрофилактика в сезон респираторных заболеваний", en: "Immune prophylaxis during respiratory illness season" },
          { uk: "Інтенсивна підготовка до важливої події (марафон, змагання, захист, конференція)", ru: "Интенсивная подготовка к важному событию (марафон, соревнования, защита, конференция)", en: "Intensive preparation for an important event (marathon, competition, presentation, conference)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання до IV терапії", ru: "Противопоказания к IV терапии", en: "Contraindications to IV Therapy" },
        contraindications: [
          { uk: "Ниркова недостатність та важкі захворювання нирок", ru: "Почечная недостаточность и тяжёлые заболевания почек", en: "Renal insufficiency and severe kidney disease" },
          { uk: "Алергія на компоненти коктейлю (уточнюється на консультації)", ru: "Аллергия на компоненты коктейля (уточняется на консультации)", en: "Allergy to cocktail components (clarified at consultation)" },
          { uk: "Гострі тромботичні стани", ru: "Острые тромботические состояния", en: "Acute thrombotic conditions" },
          { uk: "Порушення серцевого ритму (для деяких протоколів)", ru: "Нарушения сердечного ритма (для некоторых протоколов)", en: "Cardiac arrhythmias (for certain protocols)" },
          { uk: "Вагітність (для деяких складів — окрема консультація)", ru: "Беременность (для некоторых составов — отдельная консультация)", en: "Pregnancy (for some formulations — separate consultation required)" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "IV терапія — 100% засвоєння активних речовин. Там, де таблетки засвоюються на 30%, крапельниця дає повний ефект за одну процедуру.",
          ru: "IV терапия — 100% усвоение активных веществ. Там, где таблетки усваиваются на 30%, капельница даёт полный эффект за одну процедуру.",
          en: "IV therapy — 100% absorption of active compounds. Where tablets absorb at 30%, a drip delivers full effect in one procedure.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як проходить процедура IV терапії", ru: "Как проходит процедура IV терапии", en: "How IV Therapy Procedure Works" },
        steps: [
          {
            title: { uk: "Консультація та підбір протоколу", ru: "Консультация и подбор протокола", en: "Consultation and protocol selection" },
            body: { uk: "Лікар збирає анамнез, оцінює мету (відновлення, імунітет, антиейдж, детокс), перевіряє протипоказання та підбирає склад коктейлю.", ru: "Врач собирает анамнез, оценивает цель (восстановление, иммунитет, антиэйдж, детокс), проверяет противопоказания и подбирает состав коктейля.", en: "The doctor takes history, assesses the goal (recovery, immunity, anti-age, detox), checks contraindications and selects the cocktail composition." },
          },
          {
            title: { uk: "Підготовка та встановлення катетера", ru: "Подготовка и установка катетера", en: "Preparation and catheter insertion" },
            body: { uk: "Медсестра встановлює внутрішньовенний катетер. Процедура майже безболісна — тонка голка 24G.", ru: "Медсестра устанавливает внутривенный катетер. Процедура почти безболезненна — тонкая игла 24G.", en: "The nurse inserts an intravenous catheter. The procedure is nearly painless — thin 24G needle." },
          },
          {
            title: { uk: "Інфузія (30–60 хвилин)", ru: "Инфузия (30–60 минут)", en: "Infusion (30–60 minutes)" },
            body: { uk: "Пацієнт відпочиває у зручному кріслі. Лікар контролює стан протягом усієї інфузії. Можна читати, слухати музику.", ru: "Пациент отдыхает в удобном кресле. Врач контролирует состояние в течение всей инфузии. Можно читать, слушать музыку.", en: "The patient rests in a comfortable chair. The doctor monitors condition throughout the infusion. Reading or listening to music is allowed." },
          },
          {
            title: { uk: "Завершення та рекомендації", ru: "Завершение и рекомендации", en: "Completion and recommendations" },
            body: { uk: "Катетер знімається, місце пункції оброблюється. Лікар надає рекомендації щодо режиму та харчування після процедури.", ru: "Катетер снимается, место пункции обрабатывается. Врач даёт рекомендации по режиму и питанию после процедуры.", en: "The catheter is removed and the puncture site treated. The doctor provides recommendations on regimen and nutrition after the procedure." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги IV терапії в GENEVITY", ru: "Преимущества IV терапии в GENEVITY", en: "IV Therapy Benefits at GENEVITY" },
        items: [
          { uk: "100% біодоступність — ефект набагато вищий, ніж від пероральних добавок", ru: "100% биодоступность — эффект намного выше, чем от пероральных добавок", en: "100% bioavailability — far superior to oral supplements" },
          { uk: "Індивідуальний підбір складу під конкретну мету та стан здоров'я", ru: "Индивидуальный подбор состава под конкретную цель и состояние здоровья", en: "Individually selected composition for each specific goal and health status" },
          { uk: "Виконується лікарем з моніторингом стану — максимальна безпека", ru: "Выполняется врачом с мониторингом состояния — максимальная безопасность", en: "Performed by a doctor with condition monitoring — maximum safety" },
          { uk: "Ефект помітний вже після першої процедури: підвищення енергії, ясність розуму", ru: "Эффект заметен уже после первой процедуры: повышение энергии, ясность ума", en: "Effect noticeable after the first procedure: increased energy, mental clarity" },
          { uk: "⚠ IV терапія — доповнення до здорового способу життя, а не замінник правильного харчування та сну", ru: "⚠ IV терапия — дополнение к здоровому образу жизни, а не замена правильного питания и сна", en: "⚠ IV therapy supplements a healthy lifestyle — it does not replace proper nutrition and sleep" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "Клініка GENEVITY — IV терапія", ru: "Клиника GENEVITY — IV терапия", en: "GENEVITY Clinic — IV Therapy" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на IV терапію в Дніпрі", ru: "Запишитесь на IV терапию в Днепре", en: "Book IV Therapy in Dnipro" },
        body: { uk: "Дізнайтеся вартість внутрішньовенної терапії та підберіть протокол на безкоштовній консультації лікаря.", ru: "Узнайте стоимость внутривенной терапии и подберите протокол на бесплатной консультации врача.", en: "Find out the IV therapy cost and select the right protocol at a free doctor consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи безпечна IV терапія?", ru: "Безопасна ли IV терапия?", en: "Is IV therapy safe?" },
        answer: { uk: "Так, при умові виконання кваліфікованим медичним персоналом та виключенні протипоказань. У GENEVITY кожна крапельниця виконується лікарем після попередньої консультації та оцінки стану здоров'я пацієнта.", ru: "Да, при условии выполнения квалифицированным медицинским персоналом и исключения противопоказаний. В GENEVITY каждая капельница выполняется врачом после предварительной консультации и оценки состояния здоровья пациента.", en: "Yes, when performed by qualified medical staff with contraindications ruled out. At GENEVITY every drip is administered by a doctor following prior consultation and health assessment." },
      },
      {
        question: { uk: "Скільки триває одна процедура IV терапії?", ru: "Сколько длится одна процедура IV терапии?", en: "How long does one IV therapy session last?" },
        answer: { uk: "Стандартна інфузія займає 30–60 хвилин залежно від об'єму та складу коктейлю. Myers Cocktail — близько 40 хвилин, Glutathione — 20–30 хвилин, Anti-age (NAD+) — до 90 хвилин.", ru: "Стандартная инфузия занимает 30–60 минут в зависимости от объёма и состава коктейля. Myers Cocktail — около 40 минут, Glutathione — 20–30 минут, Anti-age (NAD+) — до 90 минут.", en: "A standard infusion takes 30–60 minutes depending on volume and composition. Myers Cocktail: approximately 40 minutes, Glutathione: 20–30 minutes, Anti-age (NAD+): up to 90 minutes." },
      },
      {
        question: { uk: "Як часто можна проходити IV терапію?", ru: "Как часто можно проходить IV терапию?", en: "How often can IV therapy be done?" },
        answer: { uk: "Залежить від протоколу та мети. Для підтримки імунітету — 1 раз на місяць. При дефіцитних станах — курс 4–6 процедур з інтервалом 1 тиждень. Anti-age протоколи — 1 раз на 2–4 тижні.", ru: "Зависит от протокола и цели. Для поддержки иммунитета — 1 раз в месяц. При дефицитных состояниях — курс 4–6 процедур с интервалом 1 неделя. Anti-age протоколы — 1 раз в 2–4 недели.", en: "Depends on protocol and goal. For immune support: once a month. For deficiency states: a course of 4–6 procedures, 1 week apart. Anti-age protocols: once every 2–4 weeks." },
      },
      {
        question: { uk: "Чи потрібна підготовка перед процедурою?", ru: "Нужна ли подготовка перед процедурой?", en: "Is preparation needed before the procedure?" },
        answer: { uk: "Рекомендується поїсти за 1–2 години до процедури (не натще) та випити 1–2 склянки води. Уникати алкоголю за 24 години до інфузії.", ru: "Рекомендуется поесть за 1–2 часа до процедуры (не натощак) и выпить 1–2 стакана воды. Избегать алкоголя за 24 часа до инфузии.", en: "Eat 1–2 hours before the procedure (not on empty stomach) and drink 1–2 glasses of water. Avoid alcohol 24 hours before the infusion." },
      },
      {
        question: { uk: "Чи можна поєднувати IV терапію з іншими методами лікування?", ru: "Можно ли сочетать IV терапию с другими методами лечения?", en: "Can IV therapy be combined with other treatments?" },
        answer: { uk: "Так. IV терапія добре поєднується з програмами Longevity, Гормональний баланс та косметологічними процедурами. Лікар врахує всі призначення при підборі складу коктейлю.", ru: "Да. IV терапия хорошо сочетается с программами Longevity, Гормональный баланс и косметологическими процедурами. Врач учтёт все назначения при подборе состава коктейля.", en: "Yes. IV therapy combines well with Longevity, Hormonal Balance programmes and cosmetic procedures. The doctor will consider all prescriptions when selecting the cocktail composition." },
      },
    ],
  },

  // ─── 38. Нутрицевтика ─────────────────────────────────────────────────────
  {
    slug: "nutraceuticals",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Нутрицевтика — персоналізована корекція дефіцитів у GENEVITY",
          ru: "Нутрицевтика — персонализированная коррекция дефицитов в GENEVITY",
          en: "Nutraceuticals — Personalised Deficiency Correction at GENEVITY",
        },
        body: {
          uk: "Нутрицевтика — це наука та медична практика застосування харчових компонентів та біологічно активних речовин з доведеною клінічною ефективністю для профілактики та підтримки здоров'я. На відміну від стандартних полівітамінів, персоналізована нутрицевтика в GENEVITY базується на результатах аналізів та виявлених дефіцитних станах.\n\nОсновні види нутрицевтиків, що застосовуються в GENEVITY:\n\n1. Вітаміни та мінерали — вітамін D3 + K2 (дефіцит діагностується у 80% жителів України), магній (гліцинат, малат, треонат), цинк, залізо, йод, В-комплекс\n2. Пробіотики та пребіотики — корекція мікробіому кишківника, підтримка імунітету та психічного здоров'я (вісь кишківник–мозок)\n3. Омега-3 жирні кислоти (EPA+DHA) — протизапальна дія, кардіопротекція, нейропротекція\n4. Антиоксиданти — глутатіон, коензим Q10, NAC, альфа-ліпоєва кислота, ресвератрол\n5. Адаптогени — ашвагандха, родіола, гриб рейші для корекції хронічного стресу та кортизолу\n\nПравильно обирати та вживати нутрицевтики можна тільки після аналізу відповідних маркерів. Застосування добавок без діагностики може бути неефективним або навіть шкідливим — наприклад, надлишок заліза при нормальному феритині або передозування вітаміну D без контролю кальцію.\n\nУ GENEVITY нутрицевтики призначаються лікарем виключно за показаннями та на основі аналізів. Це гарантує безпеку, ефективність та відсутність надмірних витрат.",
          ru: "Нутрицевтика — это наука и медицинская практика применения пищевых компонентов и биологически активных веществ с доказанной клинической эффективностью для профилактики и поддержания здоровья. В отличие от стандартных поливитаминов, персонализированная нутрицевтика в GENEVITY основана на результатах анализов и выявленных дефицитных состояниях.\n\nОсновные виды нутрицевтиков, применяемых в GENEVITY:\n\n1. Витамины и минералы — витамин D3 + K2 (дефицит диагностируется у 80% жителей Украины), магний (глицинат, малат, треонат), цинк, железо, йод, В-комплекс\n2. Пробиотики и пребиотики — коррекция микробиома кишечника, поддержка иммунитета и психического здоровья (ось кишечник–мозг)\n3. Омега-3 жирные кислоты (EPA+DHA) — противовоспалительное действие, кардиопротекция, нейропротекция\n4. Антиоксиданты — глутатион, коэнзим Q10, NAC, альфа-липоевая кислота, ресвератрол\n5. Адаптогены — ашваганда, родиола, гриб рейши для коррекции хронического стресса и кортизола\n\nПравильно выбирать и применять нутрицевтики можно только после анализа соответствующих маркеров. Применение добавок без диагностики может быть неэффективным или даже вредным — например, избыток железа при нормальном ферритине или передозировка витамина D без контроля кальция.\n\nВ GENEVITY нутрицевтики назначаются врачом исключительно по показаниям и на основе анализов. Это гарантирует безопасность, эффективность и отсутствие избыточных расходов.",
          en: "Nutraceuticals is the science and medical practice of using food-derived components and bioactive compounds with proven clinical efficacy for health prevention and support. Unlike standard multivitamins, personalised nutraceuticals at GENEVITY are based on test results and identified deficiency states.\n\nMain nutraceutical categories used at GENEVITY:\n\n1. Vitamins and minerals — Vitamin D3 + K2 (deficiency diagnosed in 80% of Ukrainians), magnesium (glycinate, malate, threonate), zinc, iron, iodine, B-complex\n2. Probiotics and prebiotics — gut microbiome correction, immune and mental health support (gut–brain axis)\n3. Omega-3 fatty acids (EPA+DHA) — anti-inflammatory action, cardioprotection, neuroprotection\n4. Antioxidants — glutathione, Coenzyme Q10, NAC, alpha-lipoic acid, resveratrol\n5. Adaptogens — ashwagandha, rhodiola, reishi mushroom for chronic stress and cortisol correction\n\nNutraceuticals can only be properly selected and used after analysing relevant markers. Taking supplements without diagnostics may be ineffective or even harmful — for example, excess iron with normal ferritin, or vitamin D overdose without calcium monitoring.\n\nAt GENEVITY nutraceuticals are prescribed by a doctor exclusively based on test results. This ensures safety, efficacy and no unnecessary expenditure.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Коли потрібна персоналізована нутрицевтика", ru: "Когда нужна персонализированная нутрицевтика", en: "When Personalised Nutraceuticals Are Needed" },
        indications: [
          { uk: "Підтверджений лабораторно дефіцит вітаміну D, В12, магнію, заліза, цинку", ru: "Подтверждённый лабораторно дефицит витамина D, В12, магния, железа, цинка", en: "Laboratory-confirmed deficiency of Vitamin D, B12, magnesium, iron, zinc" },
          { uk: "Хронічна втома, порушення сну, зниження імунітету", ru: "Хроническая усталость, нарушение сна, снижение иммунитета", en: "Chronic fatigue, sleep disturbance, reduced immunity" },
          { uk: "Дисбіоз та порушення роботи кишківника", ru: "Дисбиоз и нарушение работы кишечника", en: "Dysbiosis and gastrointestinal dysfunction" },
          { uk: "Підвищений ризик серцево-судинних захворювань (корекція Омега-3 та коензим Q10)", ru: "Повышенный риск сердечно-сосудистых заболеваний (коррекция Омега-3 и коэнзим Q10)", en: "Elevated cardiovascular risk (Omega-3 and Coenzyme Q10 correction)" },
          { uk: "Хронічний стрес та адаптогенна підтримка", ru: "Хронический стресс и адаптогенная поддержка", en: "Chronic stress and adaptogenic support" },
        ],
        contraindicationsHeading: { uk: "Важливі застереження щодо нутрицевтиків", ru: "Важные оговорки по нутрицевтикам", en: "Important Nutraceutical Precautions" },
        contraindications: [
          { uk: "Деякі нутрицевтики взаємодіють з ліками — обов'язково повідомте лікаря про весь список препаратів", ru: "Некоторые нутрицевтики взаимодействуют с лекарствами — обязательно сообщите врачу весь список препаратов", en: "Some nutraceuticals interact with medications — always inform the doctor of all current drugs" },
          { uk: "Вагітність та лактація — схема добавок суттєво відрізняється від стандартної", ru: "Беременность и лактация — схема добавок существенно отличается от стандартной", en: "Pregnancy and breastfeeding — supplement regimen differs significantly from standard" },
          { uk: "Ниркова та печінкова недостатність — окремий протокол з обмеженнями", ru: "Почечная и печёночная недостаточность — отдельный протокол с ограничениями", en: "Renal and hepatic insufficiency — separate protocol with restrictions" },
          { uk: "Онкологічні захворювання — деякі антиоксиданти та адаптогени протипоказані при хіміотерапії", ru: "Онкологические заболевания — некоторые антиоксиданты и адаптогени противопоказаны при химиотерапии", en: "Oncological conditions — some antioxidants and adaptogens are contraindicated during chemotherapy" },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: {
          uk: "Нутрицевтики — це не харчові продукти та не ліки від хвороби. Самопризначення БАД без аналізів — марна трата грошей у кращому випадку та шкода здоров'ю — у гіршому.",
          ru: "Нутрицевтики — это не еда и не лекарство от болезни. Самоназначение БАД без анализов — в лучшем случае трата денег, в худшем — вред здоровью.",
          en: "Nutraceuticals are neither food nor medicine for disease. Self-prescribing supplements without tests — at best a waste of money, at worst harmful to health.",
        },
      },
      {
        type: "steps",
        heading: { uk: "Як підбираються нутрицевтики в GENEVITY", ru: "Как подбираются нутрицевтики в GENEVITY", en: "How Nutraceuticals Are Selected at GENEVITY" },
        steps: [
          {
            title: { uk: "Консультація та збір анамнезу", ru: "Консультация и сбор анамнеза", en: "Consultation and history" },
            body: { uk: "Лікар оцінює скарги, харчування, спосіб життя, поточні препарати та попередні аналізи.", ru: "Врач оценивает жалобы, питание, образ жизни, текущие препараты и предыдущие анализы.", en: "The doctor assesses complaints, nutrition, lifestyle, current medications and previous tests." },
          },
          {
            title: { uk: "Лабораторна діагностика дефіцитів", ru: "Лабораторная диагностика дефицитов", en: "Laboratory deficiency diagnostics" },
            body: { uk: "Аналіз на дефіцитні маркери: вітамін D, В12, фолат, феритин, загальне залізо, магній, цинк, омега-3 індекс, аналіз мікробіому (за показаннями).", ru: "Анализ на дефицитные маркеры: витамин D, В12, фолат, ферритин, общее железо, магний, цинк, омега-3 индекс, анализ микробиома (по показаниям).", en: "Analysis of deficiency markers: Vitamin D, B12, folate, ferritin, total iron, magnesium, zinc, omega-3 index, microbiome analysis (if indicated)." },
          },
          {
            title: { uk: "Підбір схеми нутрицевтиків", ru: "Подбор схемы нутрицевтиков", en: "Nutraceutical regimen selection" },
            body: { uk: "Лікар складає чіткий список: що, скільки та коли приймати. Форма прийому (капсули, порошок, IV) підбирається з урахуванням всмоктування та переносимості.", ru: "Врач составляет чёткий список: что, сколько и когда принимать. Форма приёма (капсулы, порошок, IV) подбирается с учётом всасывания и переносимости.", en: "The doctor creates a clear list: what, how much and when to take. The form (capsules, powder, IV) is selected based on absorption and tolerability." },
          },
          {
            title: { uk: "Контроль через 2–3 місяці", ru: "Контроль через 2–3 месяца", en: "Follow-up after 2–3 months" },
            body: { uk: "Повторні аналізи для оцінки корекції дефіцитів. Коригування схеми або відміна добавок при нормалізації показників.", ru: "Повторные анализы для оценки коррекции дефицитов. Корректировка схемы или отмена добавок при нормализации показателей.", en: "Repeat tests to assess deficiency correction. Scheme adjustment or supplement discontinuation when markers normalise." },
          },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги персоналізованої нутрицевтики в GENEVITY", ru: "Преимущества персонализированной нутрицевтики в GENEVITY", en: "Personalised Nutraceuticals Benefits at GENEVITY" },
        items: [
          { uk: "Призначення тільки за результатами аналізів — ніякого «наосліп»", ru: "Назначение только по результатам анализов — никакого «вслепую»", en: "Prescribed only based on test results — no guesswork" },
          { uk: "Вибір оптимальної форми: вітамін D3 з К2, магній гліцинат (не оксид!), натуральний В12", ru: "Выбор оптимальной формы: витамин D3 с К2, магний глицинат (не оксид!), натуральный В12", en: "Optimal form selection: Vitamin D3 with K2, magnesium glycinate (not oxide!), natural B12" },
          { uk: "Перевірка взаємодій з поточними препаратами — безпека насамперед", ru: "Проверка взаимодействий с текущими препаратами — безопасность прежде всего", en: "Interaction check with current medications — safety first" },
          { uk: "Контрольні аналізи через 2–3 місяці: оцінка ефективності та корекція", ru: "Контрольные анализы через 2–3 месяца: оценка эффективности и коррекция", en: "Follow-up tests after 2–3 months: efficacy assessment and adjustment" },
          { uk: "⚠ Якість нутрицевтиків суттєво відрізняється між виробниками — лікар рекомендує перевірені бренди", ru: "⚠ Качество нутрицевтиков существенно различается между производителями — врач рекомендует проверенные бренды", en: "⚠ Nutraceutical quality varies significantly between manufacturers — the doctor recommends verified brands" },
        ],
      },
      {
        type: "imageGallery",
        heading: { uk: "GENEVITY — персоналізована медицина", ru: "GENEVITY — персонализированная медицина", en: "GENEVITY — Personalised Medicine" },
        images: interior,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на консультацію з нутрицевтики в GENEVITY", ru: "Запишитесь на консультацию по нутрицевтике в GENEVITY", en: "Book a Nutraceuticals Consultation at GENEVITY" },
        body: { uk: "Дізнайтеся, які добавки вам справді потрібні, а не просто популярні. Консультація лікаря — безкоштовно.", ru: "Узнайте, какие добавки вам действительно нужны, а не просто популярны. Консультация врача — бесплатно.", en: "Find out which supplements you genuinely need — not just which are popular. Doctor's consultation is free." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи можуть нутрицевтики замінити повноцінне харчування?", ru: "Могут ли нутрицевтики заменить полноценное питание?", en: "Can nutraceuticals replace a balanced diet?" },
        answer: { uk: "Ні. Нутрицевтики доповнюють харчування, але не замінюють його. Синергія тисяч фітохімікатів у цільних продуктах неможлива в капсулі. Оптимальна стратегія: спочатку коректне харчування, потім добавки для усунення специфічних дефіцитів.", ru: "Нет. Нутрицевтики дополняют питание, но не заменяют его. Синергия тысяч фитохимикатов в цельных продуктах невозможна в капсуле. Оптимальная стратегия: сначала корректное питание, затем добавки для устранения специфических дефицитов.", en: "No. Nutraceuticals complement but do not replace nutrition. The synergy of thousands of phytochemicals in whole foods cannot be replicated in a capsule. Optimal strategy: first, correct nutrition; then supplements to address specific deficiencies." },
      },
      {
        question: { uk: "Як довго можна приймати нутрицевтики без перерви?", ru: "Как долго можно принимать нутрицевтики без перерыва?", en: "How long can nutraceuticals be taken without a break?" },
        answer: { uk: "Залежить від виду. Вітамін D3, Омега-3, магній — як правило, постійно при підтвердженому дефіциті. Пробіотики — курсами 1–3 місяці. Адаптогени — курсами 2–3 місяці з перервою. Лікар встановлює тривалість прийому за результатами аналізів.", ru: "Зависит от вида. Витамин D3, Омега-3, магний — как правило, постоянно при подтверждённом дефиците. Пробиотики — курсами 1–3 месяца. Адаптогены — курсами 2–3 месяца с перерывом. Врач устанавливает длительность приёма по результатам анализов.", en: "Depends on the type. Vitamin D3, Omega-3, magnesium — generally continuous with confirmed deficiency. Probiotics — 1–3 month courses. Adaptogens — 2–3 month courses with breaks. The doctor sets duration based on test results." },
      },
      {
        question: { uk: "Чи потрібна консультація лікаря перед початком прийому нутрицевтиків?", ru: "Нужна ли консультация врача перед началом приёма нутрицевтиков?", en: "Is a doctor's consultation needed before starting nutraceuticals?" },
        answer: { uk: "Так, особливо якщо ви приймаєте ліки, маєте хронічні захворювання або плануєте вагітність. Деякі добавки взаємодіють з антикоагулянтами, антидепресантами та іншими препаратами.", ru: "Да, особенно если вы принимаете лекарства, имеете хронические заболевания или планируете беременность. Некоторые добавки взаимодействуют с антикоагулянтами, антидепрессантами и другими препаратами.", en: "Yes, especially if you take medications, have chronic conditions or are planning pregnancy. Some supplements interact with anticoagulants, antidepressants and other drugs." },
      },
      {
        question: { uk: "Які побічні ефекти можуть виникнути при прийомі нутрицевтиків?", ru: "Какие побочные эффекты могут возникнуть при приёме нутрицевтиков?", en: "What side effects can occur with nutraceutical use?" },
        answer: { uk: "При призначенні за показаннями та у відповідних дозах — мінімальні. Найчастіше: дискомфорт у шлунково-кишковому тракті при початку прийому пробіотиків. При передозуванні жиророзчинних вітамінів (A, D, E, K) — токсичний ефект. Тому контроль рівнів в крові є обов'язковим.", ru: "При назначении по показаниям и в соответствующих дозах — минимальные. Чаще всего: дискомфорт в желудочно-кишечном тракте при начале приёма пробиотиков. При передозировке жирорастворимых витаминов (A, D, E, K) — токсический эффект. Поэтому контроль уровней в крови обязателен.", en: "When prescribed based on indications and at appropriate doses — minimal. Most common: gastrointestinal discomfort when starting probiotics. Overdose of fat-soluble vitamins (A, D, E, K) causes toxic effects. Blood level monitoring is therefore mandatory." },
      },
      {
        question: { uk: "Чи можна поєднувати різні види нутрицевтиків одночасно?", ru: "Можно ли сочетать разные виды нутрицевтиков одновременно?", en: "Can different nutraceuticals be combined simultaneously?" },
        answer: { uk: "Так, але деякі комбінації не є ефективними або шкідливі: наприклад, залізо та кальцій конкурують за всмоктування. Лікар визначить оптимальний час прийому та сумісні комбінації.", ru: "Да, но некоторые комбинации неэффективны или вредны: например, железо и кальций конкурируют за всасывание. Врач определит оптимальное время приёма и совместимые комбинации.", en: "Yes, but some combinations are ineffective or harmful: for example, iron and calcium compete for absorption. The doctor will determine optimal timing and compatible combinations." },
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
  console.log("\nTZ-v7 longevity DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
