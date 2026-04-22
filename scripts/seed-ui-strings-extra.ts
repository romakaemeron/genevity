import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type L = { uk: string; ru: string; en: string };
const L = (uk: string, ru: string, en: string): L => ({ uk, ru, en });

const canonical = {
  // Doctors page filter pills
  doctorsPage: {
    filter_all: L("Всі", "Все", "All"),
    filter_cosmetology: L("Косметологія", "Косметология", "Cosmetology"),
    filter_endocrinology: L("Ендокринологія", "Эндокринология", "Endocrinology"),
    filter_diagnostics: L("Діагностика", "Диагностика", "Diagnostics"),
    filter_gynecology: L("Гінекологія", "Гинекология", "Gynecology"),
    filter_gastro: L("Гастроентерологія", "Гастроэнтерология", "Gastroenterology"),
    filter_other: L("Інші спеціалісти", "Другие специалисты", "Other Specialists"),
  },

  // Prices page content
  pricesPage: {
    heroTitle: L("Прайс-лист GENEVITY", "Прайс-лист GENEVITY", "GENEVITY Price List"),
    heroSubtitle: L(
      "Прозорі ціни на всі послуги. Точну вартість підтвердить адміністратор під час запису.",
      "Прозрачные цены на все услуги. Точную стоимость подтвердит администратор во время записи.",
      "Transparent pricing for all services. Exact cost will be confirmed by the administrator during booking.",
    ),
    searchPlaceholder: L("Пошук послуги...", "Поиск услуги...", "Search services..."),
    noResults: L("Нічого не знайдено", "Ничего не найдено", "Nothing found"),
    allCategories: L("Всі категорії", "Все категории", "All categories"),
    priceHeading: L("Ціна", "Цена", "Price"),
    noteTitle: L("Важлива примітка", "Важное примечание", "Important Note"),
    noteText: L(
      "Ціни вказано орієнтовно. Точна вартість процедури залежить від індивідуальних потреб пацієнта та визначається лікарем на консультації.",
      "Цены указаны ориентировочно. Точная стоимость процедуры зависит от индивидуальных потребностей пациента и определяется врачом на консультации.",
      "Prices are indicative. The exact cost of a procedure depends on the patient's individual needs and is determined by the physician during consultation.",
    ),
  },

  // About page content
  aboutPage: {
    heroTitle: L("Про центр GENEVITY", "О центре GENEVITY", "About GENEVITY"),
    heroSubtitle: L(
      "Центр естетичної медицини, косметології та довголіття у Дніпрі. Команда експертів, передове обладнання, доказова медицина.",
      "Центр эстетической медицины, косметологии и долголетия в Днепре. Команда экспертов, передовое оборудование, доказательная медицина.",
      "Center for aesthetic medicine, cosmetology, and longevity in Dnipro. Expert team, advanced equipment, evidence-based medicine.",
    ),
    philosophyTitle: L("Наша філософія", "Наша философия", "Our Philosophy"),
    philosophyText: L(
      "Ми віримо, що краса та здоров'я — це результат комплексного підходу. GENEVITY поєднує естетичну медицину з напрямом longevity, щоб підтримати вашу енергію, зовнішній вигляд та якість життя на довгі роки.",
      "Мы верим, что красота и здоровье — это результат комплексного подхода. GENEVITY объединяет эстетическую медицину с направлением longevity, чтобы поддержать вашу энергию, внешний вид и качество жизни на долгие годы.",
      "We believe that beauty and health are the result of a comprehensive approach. GENEVITY combines aesthetic medicine with longevity to support your energy, appearance, and quality of life for many years.",
    ),
    statsTitle: L("GENEVITY у цифрах", "GENEVITY в цифрах", "GENEVITY by the numbers"),
    stat_experience: L("років на ринку", "лет на рынке", "years in business"),
    stat_doctors: L("лікарів-експертів", "врачей-экспертов", "expert physicians"),
    stat_equipment: L("сертифікованих апаратів", "сертифицированных аппаратов", "certified devices"),
    stat_patients: L("пацієнтів", "пациентов", "patients"),
    valuesTitle: L("Наші цінності", "Наши ценности", "Our Values"),
    value_evidence: {
      title: L("Доказова медицина", "Доказательная медицина", "Evidence-Based Medicine"),
      desc: L(
        "Тільки перевірені протоколи та сертифіковані препарати. Ми не використовуємо сумнівних новинок.",
        "Только проверенные протоколы и сертифицированные препараты. Мы не используем сомнительных новинок.",
        "Only proven protocols and certified products. We don't use questionable novelties.",
      ),
    },
    value_personal: {
      title: L("Персональний підхід", "Персональный подход", "Personal Approach"),
      desc: L(
        "Кожна програма розробляється індивідуально з урахуванням вашого стану, цілей та способу життя.",
        "Каждая программа разрабатывается индивидуально с учётом вашего состояния, целей и образа жизни.",
        "Every program is developed individually considering your condition, goals, and lifestyle.",
      ),
    },
    value_tech: {
      title: L("Передові технології", "Передовые технологии", "Advanced Technology"),
      desc: L(
        "Ми інвестуємо в найсучасніше обладнання — деякі апарати є єдиними в Україні.",
        "Мы инвестируем в самое современное оборудование — некоторые аппараты являются единственными в Украине.",
        "We invest in the most modern equipment — some devices are the only ones in Ukraine.",
      ),
    },
    value_confidentiality: {
      title: L("Конфіденційність", "Конфиденциальность", "Confidentiality"),
      desc: L(
        "Повна приватність вашого візиту та лікування. Ми дотримуємося суворих стандартів захисту даних.",
        "Полная приватность вашего визита и лечения. Мы соблюдаем строгие стандарты защиты данных.",
        "Complete privacy of your visit and treatment. We follow strict data protection standards.",
      ),
    },
    teamTitle: L("Наша команда", "Наша команда", "Our Team"),
    galleryTitle: L("Клініка зсередини", "Клиника изнутри", "Clinic from the inside"),
  },

  // Contacts page content (hero + map + working hours)
  contactsPageExtra: {
    heroTitle: L("Зв'яжіться з нами", "Свяжитесь с нами", "Get in touch"),
    heroSubtitle: L(
      "Ми завжди раді відповісти на ваші запитання та допомогти обрати оптимальну програму.",
      "Мы всегда рады ответить на ваши вопросы и помочь выбрать оптимальную программу.",
      "We are always happy to answer your questions and help you choose the optimal program.",
    ),
    phoneLabel: L("Телефон", "Телефон", "Phone"),
    addressLabel: L("Адреса", "Адрес", "Address"),
    hoursLabel: L("Графік роботи", "График работы", "Working Hours"),
    socialLabel: L("Соцмережі", "Соцсети", "Social Media"),
    directionsTitle: L("Як нас знайти", "Как нас найти", "How to find us"),
    directionsText: L(
      "Ми розташовані у центрі Дніпра, 5 хвилин від метро та з зручним парковочним місцем.",
      "Мы расположены в центре Днепра, 5 минут от метро и с удобным парковочным местом.",
      "We are located in the center of Dnipro, 5 minutes from the metro with convenient parking.",
    ),
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
  console.log("✓ Seeded doctorsPage filters + aboutPage + pricesPage + contactsPageExtra");
}

run().catch((e) => { console.error(e); process.exit(1); });
