import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type L = { uk: string; ru: string; en: string };
const L = (uk: string, ru: string, en: string): L => ({ uk, ru, en });

const canonical = {
  stationaryPage: {
    // Services offered
    service_iv: {
      label: L("IV-терапія (крапельниці)", "IV-терапия (капельницы)", "IV Therapy (Drips)"),
      desc: L(
        "Внутрішньовенні крапельниці вітамінів, мінералів та амінокислот. Вартість — від 20 000 грн за курс.",
        "Внутривенные капельницы витаминов, минералов и аминокислот. Стоимость — от 20 000 грн за курс.",
        "Intravenous drips of vitamins, minerals and amino acids. Price — from 20,000 UAH per course.",
      ),
    },
    service_consultations: {
      label: L("Консультації спеціалістів", "Консультации специалистов", "Specialist Consultations"),
      desc: L(
        "Косметолог, дерматолог, ендокринолог, гінеколог, гастроентеролог, подолог, дієтолог. Від 500 грн.",
        "Косметолог, дерматолог, эндокринолог, гинеколог, гастроэнтеролог, подолог, диетолог. От 500 грн.",
        "Cosmetologist, dermatologist, endocrinologist, gynecologist, gastroenterologist, podiatrist, dietitian. From 500 UAH.",
      ),
    },
    service_checkup: {
      label: L("Діагностичні програми Check-Up", "Диагностические программы Check-Up", "Check-Up Diagnostic Programs"),
      desc: L(
        "Комплексне обстеження з лабораторними аналізами, УЗД-діагностикою та консультаціями спеціалістів — усе за один візит.",
        "Комплексное обследование с лабораторными анализами, УЗД-диагностикой и консультациями специалистов — всё за один визит.",
        "Comprehensive examination with lab tests, ultrasound diagnostics and specialist consultations — all in one visit.",
      ),
    },
    service_pressotherapy: {
      label: L("Пресотерапія", "Прессотерапия", "Pressotherapy"),
      desc: L(
        "Апаратний лімфодренажний масаж для покращення кровообігу та зменшення набряків. Від 500 грн за зону.",
        "Аппаратный лимфодренажный массаж для улучшения кровообращения и уменьшения отёков. От 500 грн за зону.",
        "Apparatus lymphatic drainage massage for improving circulation and reducing swelling. From 500 UAH per zone.",
      ),
    },

    // Indications (6 items)
    indication_1: L(
      "Відновлення після пластичних та косметологічних операцій",
      "Восстановление после пластических и косметологических операций",
      "Recovery after plastic and cosmetological surgeries",
    ),
    indication_2: L(
      "Проведення курсу IV-терапії (вітамінні крапельниці)",
      "Проведение курса IV-терапии (витаминные капельницы)",
      "IV therapy course (vitamin drips)",
    ),
    indication_3: L(
      "Комплексна діагностика Check-Up 40+",
      "Комплексная диагностика Check-Up 40+",
      "Comprehensive Check-Up 40+ diagnostics",
    ),
    indication_4: L(
      "Спостереження після малоінвазивних втручань",
      "Наблюдение после малоинвазивных вмешательств",
      "Observation after minimally invasive procedures",
    ),
    indication_5: L(
      "Процедури, що потребують тривалого медичного контролю",
      "Процедуры, требующие длительного медицинского контроля",
      "Procedures requiring extended medical monitoring",
    ),
    indication_6: L(
      "Детоксикація та відновлення організму",
      "Детоксикация и восстановление организма",
      "Detoxification and body restoration",
    ),

    // Steps (3 items)
    step_1: {
      num: L("01", "01", "01"),
      label: L("Консультація", "Консультация", "Consultation"),
      desc: L(
        "Запишіться на попередню консультацію до лікаря. Фахівець оцінить ваш стан, визначить необхідність стаціонарного лікування та складе індивідуальний план процедур і спостереження.",
        "Запишитесь на предварительную консультацию к врачу. Специалист оценит ваше состояние, определит необходимость стационарного лечения и составит индивидуальный план процедур и наблюдения.",
        "Book a preliminary consultation with a physician. The specialist will assess your condition, determine the need for stationary treatment and create an individual plan for procedures and observation.",
      ),
    },
    step_2: {
      num: L("02", "02", "02"),
      label: L("Підготовка", "Подготовка", "Preparation"),
      desc: L(
        "За потреби пройдіть необхідні лабораторні дослідження у нашій лабораторії. Візьміть із собою паспорт та результати попередніх обстежень. Лікар надасть рекомендації щодо підготовки.",
        "При необходимости пройдите лабораторные исследования в нашей лаборатории. Возьмите с собой паспорт и результаты предыдущих обследований. Врач даст рекомендации по подготовке.",
        "If needed, complete laboratory tests at our facility. Bring your passport and previous examination results. The physician will provide preparation recommendations.",
      ),
    },
    step_3: {
      num: L("03", "03", "03"),
      label: L("Лікування", "Лечение", "Treatment"),
      desc: L(
        "Прибудьте у призначений час. Медичний персонал підготує палату, проведе необхідні процедури та забезпечить комфортне перебування протягом усього лікування під постійним наглядом.",
        "Прибудьте в назначенное время. Медицинский персонал подготовит палату, проведёт необходимые процедуры и обеспечит комфортное пребывание в течение всего лечения под постоянным наблюдением.",
        "Arrive at the appointed time. Medical staff will prepare the room, perform necessary procedures and ensure comfortable stay throughout treatment under constant supervision.",
      ),
    },
  },

  laboratoryPage: {
    // Diagnostic services (6 items)
    service_ultrasound: {
      label: L("Ультразвукова діагностика", "Ультразвуковая диагностика", "Ultrasound Diagnostics"),
      desc: L(
        "Експертний рівень GE LOGIQ E10. Обстеження щитоподібної залози, черевної порожнини, малого тазу, судин, молочних залоз.",
        "Экспертный уровень GE LOGIQ E10. Обследование щитовидной железы, брюшной полости, малого таза, сосудов, молочных желёз.",
        "Expert-level GE LOGIQ E10. Examination of thyroid, abdominal cavity, small pelvis, vessels, mammary glands.",
      ),
    },
    service_labs: {
      label: L("Лабораторні аналізи", "Лабораторные анализы", "Laboratory Tests"),
      desc: L(
        "Повний спектр біохімічних, гормональних та генетичних досліджень. Результати — в день здачі.",
        "Полный спектр биохимических, гормональных и генетических исследований. Результаты — в день сдачи.",
        "Full range of biochemical, hormonal and genetic tests. Same-day results.",
      ),
    },
    service_ecg: {
      label: L("ЕКГ та кардіодіагностика", "ЭКГ и кардиодиагностика", "ECG & Cardiac Diagnostics"),
      desc: L(
        "Зняття кардіограми, оцінка роботи серця, консультація кардіолога за результатами.",
        "Снятие кардиограммы, оценка работы сердца, консультация кардиолога по результатам.",
        "ECG recording, heart function assessment, cardiologist consultation based on results.",
      ),
    },
    service_dermatoscopy: {
      label: L("Дерматоскопія", "Дерматоскопия", "Dermatoscopy"),
      desc: L(
        "Цифрова діагностика новоутворень шкіри, картування невусів, оцінка ризиків.",
        "Цифровая диагностика новообразований кожи, картирование невусов, оценка рисков.",
        "Digital diagnosis of skin formations, nevus mapping, risk assessment.",
      ),
    },
    service_inbody: {
      label: L("InBody-аналіз складу тіла", "InBody-анализ состава тела", "InBody Body Composition Analysis"),
      desc: L(
        "Точне вимірювання м'язової маси, жиру, води та метаболізму. Основа для персональних програм.",
        "Точное измерение мышечной массы, жира, воды и метаболизма. Основа для персональных программ.",
        "Accurate measurement of muscle mass, fat, water and metabolism. Basis for personalized programs.",
      ),
    },
    service_consultation: {
      label: L("Консультації лікарів", "Консультации врачей", "Physician Consultations"),
      desc: L(
        "Кардіолог, ендокринолог, гінеколог, уролог, гастроентеролог — усі спеціалісти в одному місці.",
        "Кардиолог, эндокринолог, гинеколог, уролог, гастроэнтеролог — все специалисты в одном месте.",
        "Cardiologist, endocrinologist, gynecologist, urologist, gastroenterologist — all specialists in one place.",
      ),
    },

    // Check-Up programs (3 items)
    checkup_basic: {
      label: L("Check-Up Basic", "Check-Up Basic", "Check-Up Basic"),
      price: L("від 5 000 грн", "от 5 000 грн", "from 5,000 UAH"),
      desc: L(
        "Базова діагностика: загальні аналізи, ЕКГ, УЗД органів черевної порожнини, консультація терапевта.",
        "Базовая диагностика: общие анализы, ЭКГ, УЗД органов брюшной полости, консультация терапевта.",
        "Basic diagnostics: general tests, ECG, abdominal ultrasound, therapist consultation.",
      ),
    },
    checkup_40plus: {
      label: L("Check-Up 40+", "Check-Up 40+", "Check-Up 40+"),
      price: L("від 12 000 грн", "от 12 000 грн", "from 12,000 UAH"),
      desc: L(
        "Поглиблене обстеження: гормональний профіль, онкомаркери, УЗД, ЕКГ, консультації профільних лікарів.",
        "Углублённое обследование: гормональный профиль, онкомаркеры, УЗД, ЭКГ, консультации профильных врачей.",
        "Deep examination: hormonal profile, oncomarkers, ultrasound, ECG, specialist consultations.",
      ),
    },
    checkup_longevity: {
      label: L("Longevity Check-Up", "Longevity Check-Up", "Longevity Check-Up"),
      price: L("від 25 000 грн", "от 25 000 грн", "from 25,000 UAH"),
      desc: L(
        "Повний протокол довголіття: генетика, епігенетика, метаболізм, гормональний баланс, індивідуальний план.",
        "Полный протокол долголетия: генетика, эпигенетика, метаболизм, гормональный баланс, индивидуальный план.",
        "Full longevity protocol: genetics, epigenetics, metabolism, hormonal balance, personalized plan.",
      ),
    },

    // Steps (3 items)
    step_1: {
      num: L("01", "01", "01"),
      label: L("Оберіть програму", "Выберите программу", "Choose a program"),
      desc: L(
        "Запишіться на консультацію, і лікар допоможе обрати оптимальну діагностичну програму під ваш стан здоров'я та цілі.",
        "Запишитесь на консультацию, и врач поможет выбрать оптимальную диагностическую программу под ваше состояние здоровья и цели.",
        "Book a consultation and the physician will help you choose the optimal diagnostic program for your health and goals.",
      ),
    },
    step_2: {
      num: L("02", "02", "02"),
      label: L("Пройдіть діагностику", "Пройдите диагностику", "Complete diagnostics"),
      desc: L(
        "Усе за одне відвідування: здача аналізів, УЗД, ЕКГ, консультації. Результати готові того ж дня або наступного ранку.",
        "Всё за одно посещение: сдача анализов, УЗД, ЭКГ, консультации. Результаты готовы в тот же день или на следующее утро.",
        "Everything in one visit: lab tests, ultrasound, ECG, consultations. Results ready the same day or the next morning.",
      ),
    },
    step_3: {
      num: L("03", "03", "03"),
      label: L("Отримайте план", "Получите план", "Get your plan"),
      desc: L(
        "Лікар проаналізує результати, складе персональний план обстежень і профілактики, підбере необхідні процедури чи програми.",
        "Врач проанализирует результаты, составит персональный план обследований и профилактики, подберёт необходимые процедуры или программы.",
        "The physician will analyze the results, create a personalized examination and prevention plan, and select necessary procedures or programs.",
      ),
    },
  },
};

function deepMerge(base: any, extra: any): any {
  const out: any = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    if (v && typeof v === "object" && !Array.isArray(v) && !("uk" in v) && out[k] && typeof out[k] === "object" && !("uk" in out[k])) {
      out[k] = deepMerge(out[k], v);
    } else if (out[k] === undefined) {
      out[k] = v;
    }
  }
  return out;
}

async function run() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const existing = rows[0]?.data ?? {};
  const merged = deepMerge(existing, canonical);
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(merged)}::jsonb WHERE id = 1`;
  console.log("✓ Extended ui_strings with stationaryPage + laboratoryPage body content");
}

run().catch((e) => { console.error(e); process.exit(1); });
