import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type L = { uk: string; ru: string; en: string };
const L = (uk: string, ru: string, en: string): L => ({ uk, ru, en });

const canonical = {
  nav_mega: {
    // Top-level nav
    about: L("Про центр", "О центре", "About"),
    prices: L("Ціни", "Цены", "Prices"),
    services: L("Послуги", "Услуги", "Services"),
    stationary: L("Стаціонар", "Стационар", "Stationary"),
    lab: L("Лабораторія", "Лаборатория", "Laboratory"),
    doctors: L("Лікарі", "Врачи", "Doctors"),
    contacts: L("Контакти", "Контакты", "Contacts"),

    // Category headers
    injectable: L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable cosmetology"),
    apparatus: L("Апаратна косметологія", "Аппаратная косметология", "Apparatus cosmetology"),
    intimate: L("Інтимне відновлення", "Интимное восстановление", "Intimate rejuvenation"),
    laser: L("Лазерна епіляція", "Лазерная эпиляция", "Laser hair removal"),
    longevity: L("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),

    // Footer column headings
    more: L("Інші послуги", "Другие услуги", "More services"),
    info: L("Інформація", "Информация", "Information"),
    allServices: L("Всі послуги", "Все услуги", "All services"),

    // Injectable children
    botulinum: L("Ботулінотерапія", "Ботулинотерапия", "Botulinum therapy"),
    contour: L("Контурна пластика", "Контурная пластика", "Dermal fillers"),
    bioreval: L("Біоревіталізація", "Биоревитализация", "Biorevitalisation"),
    meso: L("Мезотерапія", "Мезотерапия", "Mesotherapy"),
    prp: L("PRP-терапія", "PRP-терапия", "PRP therapy"),
    exosomes: L("Екзосоми", "Экзосомы", "Exosomes"),
    "stem-cells": L("Терапія стовбуровими клітинами", "Стволовые клетки", "Stem cell therapy"),

    // Apparatus children
    face: L("Апаратна для обличчя", "Аппаратная для лица", "For the face"),
    body: L("Апаратна для тіла", "Аппаратная для тела", "For the body"),
    skin: L("Шкіра (скоро)", "Кожа (скоро)", "Skin (coming soon)"),

    // Intimate children
    "rf-lifting": L("Монополярний RF-ліфтинг", "Монополярный RF-лифтинг", "Monopolar RF lifting"),
    "acupulse-co2": L("Інтимне омолодження AcuPulse CO₂", "Интимное омоложение AcuPulse CO₂", "Intimate AcuPulse CO₂ rejuvenation"),

    // Laser children
    men: L("Чоловіча лазерна епіляція", "Мужская лазерная эпиляция", "For men"),
    women: L("Жіноча лазерна епіляція", "Женская лазерная эпиляция", "For women"),

    // Longevity children
    "check-up-40": L("Check-Up 40+", "Check-Up 40+", "Check-Up 40+"),
    "longevity-program": L("Longevity програма", "Longevity программа", "Longevity programme"),
    hormonal: L("Гормональний баланс", "Гормональный баланс", "Hormonal balance"),
    "iv-therapy": L("IV-терапія", "IV-терапия", "IV therapy"),
    nutraceuticals: L("Нутрицевтика", "Нутрицевтика", "Nutraceuticals"),

    // Extra services
    care: L("Доглядові процедури", "Уходовые процедуры", "Skincare treatments"),
    podology: L("Подологія", "Подология", "Podology"),
    diagnostics: L("Діагностичні послуги", "Диагностические услуги", "Diagnostic services"),
    plastic: L("Пластична хірургія", "Пластическая хирургия", "Plastic surgery"),
  },

  // Page metadata moved to CMS (title + description per page, per locale)
  pageMeta: {
    stationary: {
      title: L("Стаціонар — GENEVITY Дніпро", "Стационар — GENEVITY Днепр", "Stationary — GENEVITY Dnipro"),
      description: L(
        "Денний стаціонар GENEVITY у Дніпрі: індивідуальні палати, IV-терапія, відновлення після процедур. ☎ +380 73 000 0150",
        "Дневной стационар GENEVITY в Днепре: индивидуальные палаты, IV-терапия, восстановление после процедур. ☎ +380 73 000 0150",
        "GENEVITY day stationary in Dnipro: private rooms, IV therapy, post-procedure recovery. ☎ +380 73 000 0150",
      ),
    },
    laboratory: {
      title: L("Лабораторія та діагностика — GENEVITY", "Лаборатория и диагностика — GENEVITY", "Laboratory & Diagnostics — GENEVITY"),
      description: L(
        "Повний спектр лабораторних аналізів та УЗД у центрі GENEVITY у Дніпрі. ☎ +380 73 000 0150",
        "Полный спектр лабораторных анализов и УЗИ в центре GENEVITY в Днепре. ☎ +380 73 000 0150",
        "Full range of lab tests and ultrasound at GENEVITY center in Dnipro. ☎ +380 73 000 0150",
      ),
    },
    about: {
      title: L("Про центр — естетична медицина у Дніпрі", "О центре — эстетическая медицина в Днепре", "About — Aesthetic Medicine in Dnipro"),
      description: L(
        "Центр естетичної медицини та довголіття GENEVITY у Дніпрі. Команда експертів, передове обладнання, доказова медицина.",
        "Центр эстетической медицины и долголетия GENEVITY в Днепре. Команда экспертов, передовое оборудование, доказательная медицина.",
        "GENEVITY aesthetic medicine and longevity center in Dnipro. Expert team, advanced equipment, evidence-based medicine.",
      ),
    },
    contacts: {
      title: L("Контакти — адреса, телефон, графік", "Контакты — адрес, телефон, график", "Contacts — Address, Phone, Hours"),
      description: L(
        "Контакти клініки GENEVITY у Дніпрі: адреса, телефон, графік роботи. ☎ +380 73 000 0150",
        "Контакты клиники GENEVITY в Днепре: адрес, телефон, график работы. ☎ +380 73 000 0150",
        "GENEVITY clinic contacts in Dnipro: address, phone, working hours. ☎ +380 73 000 0150",
      ),
    },
    prices: {
      title: L("Ціни на послуги", "Цены на услуги", "Prices"),
      description: L(
        "Ціни на послуги GENEVITY у Дніпрі: косметологія, апаратні процедури, лазерна епіляція, діагностика. ☎ +380 73 000 0150",
        "Цены на услуги GENEVITY в Днепре: косметология, аппаратные процедуры, лазерная эпиляция, диагностика. ☎ +380 73 000 0150",
        "GENEVITY prices in Dnipro: cosmetology, apparatus procedures, laser hair removal, diagnostics. ☎ +380 73 000 0150",
      ),
    },
    doctors: {
      title: L("Команда лікарів — GENEVITY", "Команда врачей — GENEVITY", "Our Medical Team — GENEVITY"),
      description: L(
        "Команда лікарів центру GENEVITY у Дніпрі. Досвідчені спеціалісти в естетичній медицині та longevity.",
        "Команда врачей центра GENEVITY в Днепре. Опытные специалисты в эстетической медицине и longevity.",
        "GENEVITY physician team in Dnipro. Experienced specialists in aesthetic medicine and longevity.",
      ),
    },
  },

  // Extras that were still inline
  stationaryPage: {
    galleryTitle: L("Наш простір", "Наше пространство", "Our Space"),
    gallerySubtitle: L("Познайомтеся з клінікою GENEVITY зсередини", "Познакомьтесь с клиникой GENEVITY изнутри", "Explore GENEVITY clinic from the inside"),
    relatedLaboratory: L("Лабораторія", "Лаборатория", "Laboratory"),
    relatedIv: L("IV-терапія", "IV-терапия", "IV Therapy"),
    relatedPlastic: L("Пластична хірургія", "Пластическая хирургия", "Plastic Surgery"),
    pricingTitle: L("Вартість перебування", "Стоимость пребывания", "Stay Pricing"),
    pricingBody: L(
      "Вартість перебування у денному стаціонарі GENEVITY залежить від типу, тривалості та складності процедур. Базова вартість перебування — від 950 грн на день, що включає палату, медичний нагляд та харчування. IV-терапія (вітамінні крапельниці) — від 20 000 грн за курс. Точну вартість визначить лікар на безкоштовній консультації.",
      "Стоимость пребывания в дневном стационаре GENEVITY зависит от типа, продолжительности и сложности процедур. Базовая стоимость — от 950 грн в день, включая палату, медицинское наблюдение и питание. IV-терапия — от 20 000 грн за курс. Точную стоимость определит врач на бесплатной консультации.",
      "GENEVITY day stationary cost depends on procedure type, duration and complexity. Basic stay — from 950 UAH per day, including room, medical supervision and meals. IV therapy — from 20,000 UAH per course. Exact pricing determined at a free consultation.",
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
  console.log("✓ Seeded nav_mega, pageMeta, and stationaryPage extras");
}

run().catch((e) => { console.error(e); process.exit(1); });
