/**
 * E-E-A-T doctor seed: slugs, bios, education, certifications, SEO, service mappings
 * Source: technical_task/Гончара_образование_для_маркетологів.xlsx
 *         technical_task/Аппарат - процедура - врач - Аркуш1.csv
 */
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(env.DATABASE_URL!);

// ─── Types ────────────────────────────────────────────────────────────────────
interface EducationEntry {
  institution_uk: string; institution_ru: string; institution_en: string;
  degree_uk: string; degree_ru: string; degree_en: string;
  year: number;
}
interface CertEntry {
  title_uk: string; title_ru: string; title_en: string;
  issuer_uk?: string; issuer_ru?: string; issuer_en?: string;
  year?: number;
}
interface DoctorSeed {
  name_uk: string;
  slug: string;
  seo_title_uk: string; seo_title_ru: string; seo_title_en: string;
  seo_desc_uk: string; seo_desc_ru: string; seo_desc_en: string;
  bio_uk: string; bio_ru: string; bio_en: string;
  education: EducationEntry[];
  certifications: CertEntry[];
  service_slugs: string[];
}

// ─── Doctor data ──────────────────────────────────────────────────────────────
const doctors: DoctorSeed[] = [

  // ─── 1. Бєлянушкін Віктор Ігорович ──────────────────────────────────────
  {
    name_uk: "Бєлянушкін Віктор Ігорович",
    slug: "beliyanushkin-viktor",
    seo_title_uk: "Бєлянушкін Віктор Ігорович – лікар дерматолог-косметолог у Дніпрі",
    seo_title_ru: "Бєлянушкін Виктор Игоревич – врач дерматолог-косметолог в Днепре",
    seo_title_en: "Viktor Beliyanushkin – Dermatologist & Cosmetologist in Dnipro",
    seo_desc_uk: "Бєлянушкін Віктор Ігорович — директор філії GENEVITY, лікар-дерматовенеролог з 20-річним досвідом. Ін'єкційна та апаратна косметологія у Дніпрі. Запис онлайн.",
    seo_desc_ru: "Бєлянушкін Виктор Игоревич — директор филиала GENEVITY, врач-дерматовенеролог с 20-летним опытом. Инъекционная и аппаратная косметология в Днепре. Запись онлайн.",
    seo_desc_en: "Viktor Beliyanushkin — Branch Director at GENEVITY, dermatovenereologist with 20 years of experience. Injectable & device cosmetology in Dnipro. Book online.",
    bio_uk: "Віктор Ігорович Бєлянушкін — директор філії медичного центру GENEVITY та лікар-дерматовенеролог із 20-річним клінічним досвідом. У 2003 році закінчив Дніпровську державну медичну академію за спеціальністю «Лікувальна справа» та з тих пір спеціалізується у дерматовенерології та естетичній медицині.\n\nВіктор Ігорович є провідним спеціалістом з ін'єкційної косметології в GENEVITY: ботулінотерапія, контурна пластика філерами, біоревіталізація, мезотерапія, PRP-терапія, екзосомальна терапія та терапія стовбуровими клітинами. Крім цього, він виконує процедури на провідному апаратному обладнанні — EMFACE, Ultraformer MPT, EXION, Emsculpt Neo, M22 Stellar Black, Splendor X, HydraFacial.\n\nЛікар регулярно підвищує кваліфікацію: бере участь у міжнародних конгресах (ЮСТІ Україна 2024), профільних конференціях з дерматології та Anti-Age медицини, опановує сучасні протоколи лазерного шліфування та лікування рубців. Підхід до кожного пацієнта — індивідуальний, з урахуванням типу шкіри, вікових змін та особистих цілей.",
    bio_ru: "Виктор Игоревич Бєлянушкін — директор филиала медицинского центра GENEVITY и врач-дерматовенеролог с 20-летним клиническим опытом. В 2003 году окончил Днепровскую государственную медицинскую академию по специальности «Лечебное дело» и с тех пор специализируется в дерматовенерологии и эстетической медицине.\n\nВиктор Игоревич является ведущим специалистом по инъекционной косметологии в GENEVITY: ботулинотерапия, контурная пластика филлерами, биоревитализация, мезотерапия, PRP-терапия, экзосомальная терапия и терапия стволовыми клетками. Помимо этого, он выполняет процедуры на ведущем аппаратном оборудовании — EMFACE, Ultraformer MPT, EXION, Emsculpt Neo, M22 Stellar Black, Splendor X, HydraFacial.\n\nВрач регулярно повышает квалификацию: участвует в международных конгрессах (ЮСТИ Украина 2024), профильных конференциях по дерматологии и Anti-Age медицине, осваивает современные протоколы лазерной шлифовки и лечения рубцов. Подход к каждому пациенту — индивидуальный, с учётом типа кожи, возрастных изменений и личных целей.",
    bio_en: "Viktor Beliyanushkin is the Branch Director of GENEVITY medical centre and a dermatovenereologist with 20 years of clinical experience. He graduated from Dnipro State Medical Academy with a degree in General Medicine in 2003 and has since specialised in dermatovenereology and aesthetic medicine.\n\nViktor is GENEVITY's leading specialist in injectable cosmetology: botulinum therapy, contour plasty with fillers, biorevitalisation, mesotherapy, PRP therapy, exosome therapy and stem cell therapy. He also performs procedures on leading device platforms — EMFACE, Ultraformer MPT, EXION, Emsculpt Neo, M22 Stellar Black, Splendor X, HydraFacial.\n\nHe continuously advances his skills through international congresses (YUST Ukraine 2024), dermatology and Anti-Age medicine conferences, and mastery of modern laser resurfacing and scar treatment protocols. Each patient receives an individualised approach based on skin type, age-related changes and personal goals.",
    education: [
      {
        institution_uk: "Дніпровська державна медична академія",
        institution_ru: "Днепровская государственная медицинская академия",
        institution_en: "Dnipro State Medical Academy",
        degree_uk: "Лікувальна справа (Спеціаліст)",
        degree_ru: "Лечебное дело (Специалист)",
        degree_en: "General Medicine (Specialist)",
        year: 2003,
      },
    ],
    certifications: [
      { title_uk: "Використання філерів, ботулотоксину та мікроігольної терапії", title_ru: "Применение филлеров, ботулотоксина и микроигольной терапии", title_en: "Fillers, botulinum toxin and microneedling techniques" },
      { title_uk: "Конгрес ЮСТІ Україна 2024", title_ru: "Конгресс ЮСТИ Украина 2024", title_en: "YUST Ukraine Congress 2024", year: 2024 },
      { title_uk: "Мистецтво Anti-Age — школа лікарів та спеціалістів", title_ru: "Искусство Anti-Age — школа врачей и специалистов", title_en: "Anti-Age Art School for Physicians and Specialists" },
      { title_uk: "Меланоцитарні ураження шкіри: діагностика та лікування", title_ru: "Меланоцитарные поражения кожи: диагностика и лечение", title_en: "Melanocytic skin lesions: diagnostics and treatment" },
      { title_uk: "4-та науково-практична конференція з дерматології", title_ru: "4-я научно-практическая конференция по дерматологии", title_en: "4th Scientific-Practical Dermatology Conference", year: 2025 },
      { title_uk: "Лазерне шліфування, рубці, постакне: сучасні протоколи", title_ru: "Лазерная шлифовка, рубцы, постакне: современные протоколы", title_en: "Laser resurfacing, scars, post-acne: modern protocols" },
    ],
    service_slugs: [
      "botulinum-therapy", "contour-plasty", "biorevitalisation", "mesotherapy",
      "prp-therapy", "exosomes", "stem-cell-therapy", "rejuran", "juvederm", "polyphil",
      "emface", "volnewmer", "exion-face", "ultraformer-mpt",
      "emsculpt-neo", "ultraformer-mpt-body", "exion-body",
      "m22-stellar-black", "splendor-x", "hydrafacial",
      "bioimpedance", "cosmetologist",
    ],
  },

  // ─── 2. Сепкіна Ганна Сергіївна ─────────────────────────────────────────
  {
    name_uk: "Сепкіна Ганна Сергіївна",
    slug: "sepkina-hanna",
    seo_title_uk: "Сепкіна Ганна Сергіївна – лікар дерматолог-косметолог у Дніпрі",
    seo_title_ru: "Сепкина Анна Сергеевна – врач дерматолог-косметолог в Днепре",
    seo_title_en: "Hanna Sepkina – Dermatologist & Cosmetologist in Dnipro",
    seo_desc_uk: "Сепкіна Ганна Сергіївна — лікар-дерматовенеролог GENEVITY з 18-річним досвідом. Ін'єкційна косметологія, лазерна епіляція, апаратне омолодження у Дніпрі.",
    seo_desc_ru: "Сепкина Анна Сергеевна — врач-дерматовенеролог GENEVITY с 18-летним опытом. Инъекционная косметология, лазерная эпиляция, аппаратное омоложение в Днепре.",
    seo_desc_en: "Hanna Sepkina — GENEVITY dermatovenereologist with 18 years of experience. Injectable cosmetology, laser hair removal, device rejuvenation in Dnipro.",
    bio_uk: "Ганна Сергіївна Сепкіна — лікар-дерматовенеролог медичного центру GENEVITY з 18-річним досвідом у дерматовенерології та естетичній медицині. У 2006 році закінчила Дніпровську державну медичну академію, після чого здобула первинну спеціалізацію з дерматовенерології та кваліфікацію з косметології.\n\nГанна Сергіївна виконує повний спектр ін'єкційних процедур: ботулінотерапія, контурна пластика, біоревіталізація, мезотерапія, PRP-терапія та екзосоми. Серед апаратних методів — EMFACE, Ultraformer MPT, EXION, Emsculpt Neo, M22 Stellar Black, Splendor X та HydraFacial. Також спеціалізується на лазерній епіляції апаратом Splendor X для жінок і чоловіків.\n\nПостійно навчається: у 2025–2026 роках пройшла курси з полімолочної кислоти Juviluk, PRP-терапії Arthrex, гармонізації Full Face та ботулотоксину. Відрізняється уважним індивідуальним підходом та детальним аналізом стану шкіри перед кожним курсом лікування.",
    bio_ru: "Анна Сергеевна Сепкина — врач-дерматовенеролог медицинского центра GENEVITY с 18-летним опытом в дерматовенерологии и эстетической медицине. В 2006 году окончила Днепровскую государственную медицинскую академию, после чего получила первичную специализацию по дерматовенерологии и квалификацию по косметологии.\n\nАнна Сергеевна выполняет полный спектр инъекционных процедур: ботулинотерапия, контурная пластика, биоревитализация, мезотерапия, PRP-терапия и экзосомы. Среди аппаратных методов — EMFACE, Ultraformer MPT, EXION, Emsculpt Neo, M22 Stellar Black, Splendor X и HydraFacial. Также специализируется на лазерной эпиляции аппаратом Splendor X для женщин и мужчин.\n\nПостоянно обучается: в 2025–2026 годах прошла курсы по полимолочной кислоте Juviluk, PRP-терапии Arthrex, гармонизации Full Face и ботулотоксину. Отличается внимательным индивидуальным подходом и детальным анализом состояния кожи перед каждым курсом лечения.",
    bio_en: "Hanna Sepkina is a dermatovenereologist at GENEVITY medical centre with 18 years of experience in dermatovenereology and aesthetic medicine. She graduated from Dnipro State Medical Academy in 2006 and subsequently obtained primary specialisation in dermatovenereology and a qualification in cosmetology.\n\nHanna performs the full range of injectable procedures: botulinum therapy, contour plasty, biorevitalisation, mesotherapy, PRP therapy and exosomes. Device-based procedures include EMFACE, Ultraformer MPT, EXION, Emsculpt Neo, M22 Stellar Black, Splendor X and HydraFacial. She also specialises in laser hair removal with the Splendor X for both women and men.\n\nShe continuously updates her skills: in 2025–2026 she completed courses in poly-L-lactic acid (Juviluk), PRP therapy (Arthrex), Full Face harmonisation and botulinum toxin. She is known for her attentive, personalised approach and thorough skin assessment before every treatment course.",
    education: [
      {
        institution_uk: "Дніпровська державна медична академія",
        institution_ru: "Днепровская государственная медицинская академия",
        institution_en: "Dnipro State Medical Academy",
        degree_uk: "Лікувальна справа (Спеціаліст)",
        degree_ru: "Лечебное дело (Специалист)",
        degree_en: "General Medicine (Specialist)",
        year: 2006,
      },
    ],
    certifications: [
      { title_uk: "Первинний сертифікат лікаря-спеціаліста «Дерматовенерологія»", title_ru: "Первичный сертификат врача-специалиста «Дерматовенерология»", title_en: "Primary Specialist Certificate in Dermatovenereology", year: 2009 },
      { title_uk: "Сертифікат лікаря-спеціаліста «Дерматовенерологія»", title_ru: "Сертификат врача-специалиста «Дерматовенерология»", title_en: "Specialist Certificate in Dermatovenereology", year: 2019 },
      { title_uk: "Курс спеціалізації в косметології, НМУ ім. О.О. Богомольця", title_ru: "Курс специализации в косметологии, НМУ им. А.А. Богомольца", title_en: "Cosmetology Specialisation Course, Bohomolets National Medical University", year: 2007 },
      { title_uk: "Полімолочна кислота Juviluk — практичний курс", title_ru: "Полимолочная кислота Juviluk — практический курс", title_en: "Poly-L-lactic acid Juviluk — practical course", year: 2026 },
      { title_uk: "PRP-терапія Arthrex — сертифікація", title_ru: "PRP-терапия Arthrex — сертификация", title_en: "Arthrex PRP Therapy Certification", year: 2026 },
      { title_uk: "Гармонізація Full Face — майстер-клас", title_ru: "Гармонизация Full Face — мастер-класс", title_en: "Full Face Harmonisation Masterclass", year: 2026 },
    ],
    service_slugs: [
      "botulinum-therapy", "contour-plasty", "biorevitalisation", "mesotherapy",
      "prp-therapy", "exosomes", "rejuran", "juvederm", "polyphil",
      "emface", "volnewmer", "exion-face", "ultraformer-mpt",
      "emsculpt-neo", "ultraformer-mpt-body", "exion-body",
      "m22-stellar-black", "splendor-x", "hydrafacial",
      "laser-men", "laser-women", "cosmetologist",
    ],
  },

  // ─── 3. Макаренко Олександра Сергіївна ──────────────────────────────────
  {
    name_uk: "Макаренко Олександра Сергіївна",
    slug: "makarenko-oleksandra",
    seo_title_uk: "Макаренко Олександра Сергіївна – лікар ендокринолог у Дніпрі",
    seo_title_ru: "Макаренко Александра Сергеевна – врач эндокринолог в Днепре",
    seo_title_en: "Oleksandra Makarenko – Endocrinologist in Dnipro",
    seo_desc_uk: "Макаренко Олександра Сергіївна — лікар-ендокринолог GENEVITY з 8-річним досвідом. Діагностика та лікування захворювань щитоподібної залози, цукровий діабет, гормональні порушення у Дніпрі.",
    seo_desc_ru: "Макаренко Александра Сергеевна — врач-эндокринолог GENEVITY с 8-летним опытом. Диагностика и лечение заболеваний щитовидной железы, сахарный диабет, гормональные нарушения в Днепре.",
    seo_desc_en: "Oleksandra Makarenko — GENEVITY endocrinologist with 8 years of experience. Thyroid conditions, diabetes, hormonal disorders in Dnipro.",
    bio_uk: "Олександра Сергіївна Макаренко — лікар-ендокринолог медичного центру GENEVITY з 8-річним досвідом у діагностиці та лікуванні захворювань ендокринної системи. У 2016 році закінчила Дніпропетровську медичну академію МОЗ України за спеціальністю «Лікувальна справа».\n\nСпеціалізується на лікуванні захворювань щитоподібної залози, цукрового діабету 1-го та 2-го типу, метаболічного синдрому та гормональних порушень. У своїй практиці застосовує доказовий підхід та сучасні міжнародні протоколи лікування.\n\nПостійно вдосконалює знання на профільних конференціях — зокрема, навчалась у «Національному науковому центрі радіаційної медицини НАМН України» та брала участь у заходах Української діабетологічної асоціації. Приділяє особливу увагу профілактиці ускладнень та довгостроковій підтримці здоров'я пацієнтів.",
    bio_ru: "Александра Сергеевна Макаренко — врач-эндокринолог медицинского центра GENEVITY с 8-летним опытом в диагностике и лечении заболеваний эндокринной системы. В 2016 году окончила Днепропетровскую медицинскую академию МЗ Украины по специальности «Лечебное дело».\n\nСпециализируется на лечении заболеваний щитовидной железы, сахарного диабета 1-го и 2-го типа, метаболического синдрома и гормональных нарушений. В своей практике применяет доказательный подход и современные международные протоколы лечения.\n\nПостоянно совершенствует знания на профильных конференциях — в частности, проходила обучение в «Национальном научном центре радиационной медицины НАМН Украины» и участвовала в мероприятиях Украинской диабетологической ассоциации. Уделяет особое внимание профилактике осложнений и долгосрочной поддержке здоровья пациентов.",
    bio_en: "Oleksandra Makarenko is an endocrinologist at GENEVITY medical centre with 8 years of experience in diagnosing and treating endocrine disorders. She graduated from Dnipropetrovsk Medical Academy of the Ministry of Health of Ukraine in 2016 with a degree in General Medicine.\n\nShe specialises in thyroid conditions, type 1 and type 2 diabetes, metabolic syndrome and hormonal imbalances, applying evidence-based approaches and current international treatment protocols.\n\nShe regularly advances her expertise at specialist conferences — including training at the National Scientific Centre for Radiation Medicine of the NAMS of Ukraine and participation in Ukrainian Diabetological Association events. She places particular emphasis on complication prevention and long-term patient health support.",
    education: [
      {
        institution_uk: "Державний заклад «Дніпропетровська медична академія МОЗ України»",
        institution_ru: "Государственное учреждение «Днепропетровская медицинская академия МЗ Украины»",
        institution_en: "Dnipropetrovsk Medical Academy of the Ministry of Health of Ukraine",
        degree_uk: "Лікувальна справа (Спеціаліст)",
        degree_ru: "Лечебное дело (Специалист)",
        degree_en: "General Medicine (Specialist)",
        year: 2016,
      },
    ],
    certifications: [
      { title_uk: "Трансплантація печінки та судинна хірургія в гепатології", title_ru: "Трансплантация печени и сосудистая хирургия в гепатологии", title_en: "Liver transplantation and vascular surgery in hepatology", issuer_uk: "НЦРМ НАМН України", issuer_ru: "НЦРМ НАМН Украины", issuer_en: "National Scientific Centre for Radiation Medicine, NAMS of Ukraine" },
      { title_uk: "Актуальні питання сучасної діабетології", title_ru: "Актуальные вопросы современной диабетологии", title_en: "Current Issues in Modern Diabetology", issuer_uk: "Українська діабетологічна асоціація", issuer_ru: "Украинская диабетологическая ассоциация", issuer_en: "Ukrainian Diabetological Association" },
    ],
    service_slugs: ["endocrinologist"],
  },

  // ─── 4. Полешко Катерина Володимирівна ──────────────────────────────────
  {
    name_uk: "Полешко Катерина Володимирівна",
    slug: "poleshko-kateryna",
    seo_title_uk: "Полешко Катерина Володимирівна – лікар ендокринолог у Дніпрі",
    seo_title_ru: "Полешко Екатерина Владимировна – врач эндокринолог в Днепре",
    seo_title_en: "Kateryna Poleshko – Endocrinologist in Dnipro",
    seo_desc_uk: "Полешко Катерина Володимирівна — завідувач відділенням, лікар-ендокринолог GENEVITY з 15-річним досвідом. Гормональний баланс, longevity-програми, IV-терапія у Дніпрі.",
    seo_desc_ru: "Полешко Екатерина Владимировна — заведующая отделением, врач-эндокринолог GENEVITY с 15-летним опытом. Гормональный баланс, longevity-программы, IV-терапия в Днепре.",
    seo_desc_en: "Kateryna Poleshko — Head of Department, GENEVITY endocrinologist with 15 years of experience. Hormonal balance, longevity programmes, IV therapy in Dnipro.",
    bio_uk: "Катерина Володимирівна Полешко — завідувач відділенням та лікар-ендокринолог медичного центру GENEVITY з 15-річним клінічним досвідом. Закінчила Дніпропетровську державну медичну академію у 2009 році за спеціальністю «Лікувальна справа».\n\nЄ провідним фахівцем центру у сфері longevity-медицини та гормонального здоров'я. Веде пацієнтів із захворюваннями щитоподібної залози, цукровим діабетом, порушеннями гормонального балансу та метаболічного здоров'я. Розробляє та реалізує індивідуальні Longevity програми, програми гормонального балансу та IV-терапії.\n\nАктивно бере участь у провідних наукових конференціях: «Клуб Ендокринологічних Новацій», «Актуальні питання ендокринології та ендокринної хірургії», майстер-класах з мультидисциплінарного підходу та сучасних методів лікування болю. Відрізняється системним підходом до здоров'я пацієнта — оцінює весь організм, а не лише окремий симптом.",
    bio_ru: "Екатерина Владимировна Полешко — заведующая отделением и врач-эндокринолог медицинского центра GENEVITY с 15-летним клиническим опытом. Окончила Днепропетровскую государственную медицинскую академию в 2009 году по специальности «Лечебное дело».\n\nЯвляется ведущим специалистом центра в области longevity-медицины и гормонального здоровья. Ведёт пациентов с заболеваниями щитовидной железы, сахарным диабетом, нарушениями гормонального баланса и метаболического здоровья. Разрабатывает и реализует индивидуальные Longevity-программы, программы гормонального баланса и IV-терапии.\n\nАктивно участвует в ведущих научных конференциях: «Клуб Эндокринологических Новаций», «Актуальные вопросы эндокринологии и эндокринной хирургии», мастер-классах по мультидисциплинарному подходу и современным методам лечения боли. Отличается системным подходом к здоровью пациента — оценивает весь организм, а не только отдельный симптом.",
    bio_en: "Kateryna Poleshko is Head of Department and endocrinologist at GENEVITY medical centre with 15 years of clinical experience. She graduated from Dnipropetrovsk State Medical Academy in 2009 with a degree in General Medicine.\n\nShe is the centre's leading specialist in longevity medicine and hormonal health, managing patients with thyroid conditions, diabetes, hormonal imbalances and metabolic health concerns. She designs and delivers personalised Longevity programmes, hormonal balance programmes and IV therapy protocols.\n\nShe actively participates in leading scientific events: the Club of Endocrinological Innovations, the Actual Issues in Endocrinology and Endocrine Surgery conference, and masterclasses on multidisciplinary pain management and modern treatment methods. She is known for her systemic approach to patient health — assessing the whole organism rather than treating isolated symptoms.",
    education: [
      {
        institution_uk: "Дніпропетровська державна медична академія",
        institution_ru: "Днепропетровская государственная медицинская академия",
        institution_en: "Dnipropetrovsk State Medical Academy",
        degree_uk: "Лікувальна справа (Спеціаліст)",
        degree_ru: "Лечебное дело (Специалист)",
        degree_en: "General Medicine (Specialist)",
        year: 2009,
      },
    ],
    certifications: [
      { title_uk: "Клуб Ендокринологічних Новацій", title_ru: "Клуб Эндокринологических Новаций", title_en: "Club of Endocrinological Innovations" },
      { title_uk: "Актуальні питання ендокринології та ендокринної хірургії", title_ru: "Актуальные вопросы эндокринологии и эндокринной хирургии", title_en: "Actual Issues in Endocrinology and Endocrine Surgery" },
      { title_uk: "Мультидисциплінарний підхід у лікуванні та реабілітації пацієнтів з психотравмою", title_ru: "Мультидисциплинарный подход в лечении и реабилитации пациентов с психотравмой", title_en: "Multidisciplinary approach in treating patients with psychotrauma" },
      { title_uk: "Сучасні підходи до діагностики та лікування ендокринної патології", title_ru: "Современные подходы к диагностике и лечению эндокринной патологии", title_en: "Modern approaches to endocrine pathology diagnostics and treatment" },
      { title_uk: "Інновації в ендокринології", title_ru: "Инновации в эндокринологии", title_en: "Innovations in Endocrinology" },
    ],
    service_slugs: ["endocrinologist", "hormonal-balance", "longevity-program", "iv-therapy", "bioimpedance"],
  },

  // ─── 5. Лисенко Максим Ігорович ─────────────────────────────────────────
  {
    name_uk: "Лисенко Максим Ігорович",
    slug: "lysenko-maksym",
    seo_title_uk: "Лисенко Максим Ігорович – лікар УЗД у Дніпрі",
    seo_title_ru: "Лысенко Максим Игоревич – врач УЗИ в Днепре",
    seo_title_en: "Maksym Lysenko – Ultrasound Diagnostician in Dnipro",
    seo_desc_uk: "Лисенко Максим Ігорович — лікар з ультразвукової діагностики GENEVITY з 8-річним досвідом. УЗД органів, судин, еластографія у Дніпрі. Запис онлайн.",
    seo_desc_ru: "Лысенко Максим Игоревич — врач по ультразвуковой диагностике GENEVITY с 8-летним опытом. УЗИ органов, сосудов, эластография в Днепре. Запись онлайн.",
    seo_desc_en: "Maksym Lysenko — GENEVITY ultrasound diagnostician with 8 years of experience. Organ and vascular ultrasound, elastography in Dnipro. Book online.",
    bio_uk: "Максим Ігорович Лисенко — лікар з ультразвукової діагностики медичного центру GENEVITY з 8-річним досвідом. Закінчив Донецький державний медичний університет ім. Горького у 2016 році та спеціалізується в ультразвуковій діагностиці, загальній хірургії та ендоскопії.\n\nВиконує УЗД органів черевної порожнини та малого тазу, УЗД судин (вени та артерії нижніх кінцівок), а також ендоскопічні дослідження. Опанував сучасні методи еластографії для оцінки жорсткості тканин та ультразвукової діагностики судинних захворювань.\n\nПройшов спеціалізовані курси в провідних медичних установах: УЗД вен нижніх кінцівок у МБЦ «ГЕНОМ», ультразвукова діагностика артерій у клініці «Інноваційна медицина», еластографія в Міжнародній академії сучасної медичної освіти та ендоскопічні інтервенції в НМУ ім. О.О. Богомольця.",
    bio_ru: "Максим Игоревич Лысенко — врач по ультразвуковой диагностике медицинского центра GENEVITY с 8-летним опытом. Окончил Донецкий государственный медицинский университет им. Горького в 2016 году и специализируется в ультразвуковой диагностике, общей хирургии и эндоскопии.\n\nВыполняет УЗИ органов брюшной полости и малого таза, УЗИ сосудов (вены и артерии нижних конечностей), а также эндоскопические исследования. Освоил современные методы эластографии для оценки жёсткости тканей и ультразвуковой диагностики сосудистых заболеваний.\n\nПрошёл специализированные курсы в ведущих медицинских учреждениях: УЗИ вен нижних конечностей в МБЦ «ГЕНОМ», ультразвуковая диагностика артерий в клинике «Инновационная медицина», эластография в Международной академии современного медицинского образования и эндоскопические интервенции в НМУ им. А.А. Богомольца.",
    bio_en: "Maksym Lysenko is an ultrasound diagnostician at GENEVITY medical centre with 8 years of experience. He graduated from Donetsk State Medical University named after Gorky in 2016 and specialises in ultrasound diagnostics, general surgery and endoscopy.\n\nHe performs ultrasound examinations of abdominal and pelvic organs, vascular ultrasound (lower extremity veins and arteries) and endoscopic investigations. He has mastered modern elastography techniques for tissue stiffness assessment and vascular disease diagnostics.\n\nHe has completed specialist training at leading medical institutions: lower extremity vein ultrasound at the HENOM Medical Biological Centre, vascular arterial diagnostics at Innovative Medicine clinic, elastography at the International Academy of Contemporary Medical Education, and endoscopic interventions at Bohomolets National Medical University.",
    education: [
      {
        institution_uk: "Донецький державний медичний університет ім. Горького",
        institution_ru: "Донецкий государственный медицинский университет им. Горького",
        institution_en: "Donetsk State Medical University named after Gorky",
        degree_uk: "Загальна хірургія (Спеціаліст)",
        degree_ru: "Общая хирургия (Специалист)",
        degree_en: "General Surgery (Specialist)",
        year: 2016,
      },
    ],
    certifications: [
      { title_uk: "УЗД вен нижніх кінцівок", title_ru: "УЗИ вен нижних конечностей", title_en: "Lower Extremity Vein Ultrasound", issuer_uk: "МБЦ «ГЕНОМ»", issuer_ru: "МБЦ «ГЕНОМ»", issuer_en: "Medical Biological Centre HENOM" },
      { title_uk: "УЗД захворювань артерій нижніх кінцівок", title_ru: "УЗИ заболеваний артерий нижних конечностей", title_en: "Lower Extremity Arterial Disease Ultrasound", issuer_uk: "Інноваційна медицина", issuer_ru: "Инновационная медицина", issuer_en: "Innovative Medicine" },
      { title_uk: "Еластографія", title_ru: "Эластография", title_en: "Elastography", issuer_uk: "Міжнародна академія сучасної медичної освіти", issuer_ru: "Международная академия современного медицинского образования", issuer_en: "International Academy of Contemporary Medical Education" },
      { title_uk: "Ендоскопічні інтервенції та менеджмент критичних ускладнень в ендоскопії", title_ru: "Эндоскопические интервенции и менеджмент критических осложнений в эндоскопии", title_en: "Endoscopic Interventions and Critical Complication Management", issuer_uk: "НМУ ім. О.О. Богомольця", issuer_ru: "НМУ им. А.А. Богомольца", issuer_en: "Bohomolets National Medical University" },
    ],
    service_slugs: ["ultrasound", "ultrasound-diagnostician"],
  },

  // ─── 6. Федоренко Світлана Олексіївна ───────────────────────────────────
  {
    name_uk: "Федоренко Світлана Олексіївна",
    slug: "fedorenko-svitlana",
    seo_title_uk: "Федоренко Світлана Олексіївна – лікар УЗД у Дніпрі",
    seo_title_ru: "Федоренко Светлана Алексеевна – врач УЗИ в Днепре",
    seo_title_en: "Svitlana Fedorenko – Ultrasound Diagnostician in Dnipro",
    seo_desc_uk: "Федоренко Світлана Олексіївна — лікар УЗД GENEVITY з 8-річним досвідом. Нейросонографія, УЗД судин, органів, суглобів у Дніпрі. Точна діагностика.",
    seo_desc_ru: "Федоренко Светлана Алексеевна — врач УЗИ GENEVITY с 8-летним опытом. Нейросонография, УЗИ сосудов, органов, суставов в Днепре. Точная диагностика.",
    seo_desc_en: "Svitlana Fedorenko — GENEVITY ultrasound diagnostician with 8 years of experience. Neurosonography, vascular, organ and joint ultrasound in Dnipro.",
    bio_uk: "Світлана Олексіївна Федоренко — лікар з ультразвукової діагностики медичного центру GENEVITY з 8-річним досвідом. У 2016 році закінчила Дніпропетровську медичну академію МОЗ України та спеціалізується в ультразвуковій діагностиці.\n\nМає широку клінічну практику: УЗД органів черевної порожнини, судин (допплерографія аорти та її гілок, вени нижніх кінцівок), м'яких тканин та суглобів (зокрема плечового), УЗД нирок, сечовидільної системи, органів калитки. Також виконує нейросонографію у немовлят.\n\nПройшла численні курси підвищення кваліфікації: нейросонографія немовлят (МП «Прогрес»), RADIODAY — конгрес ультразвукової та променевої діагностики, УЗД органів калитки та патологій плечового суглоба (СОНОКЛАБ), допплерографія судин черевної порожнини (СОНОКЛАБ), а також скринінги на виявлення онкології (НСЗУ). Відрізняється детальністю та точністю в інтерпретації результатів.",
    bio_ru: "Светлана Алексеевна Федоренко — врач по ультразвуковой диагностике медицинского центра GENEVITY с 8-летним опытом. В 2016 году окончила Днепропетровскую медицинскую академию МЗ Украины и специализируется в ультразвуковой диагностике.\n\nИмеет широкую клиническую практику: УЗИ органов брюшной полости, сосудов (доплерография аорты и её ветвей, вены нижних конечностей), мягких тканей и суставов (в т.ч. плечевого), УЗИ почек, мочевыделительной системы, органов мошонки. Также выполняет нейросонографию у новорождённых.\n\nПрошла многочисленные курсы повышения квалификации: нейросонография новорождённых (МП «Прогресс»), RADIODAY — конгресс ультразвуковой и лучевой диагностики, УЗИ органов мошонки и патологий плечевого сустава (СОНОКЛАБ), доплерография сосудов брюшной полости (СОНОКЛАБ), а также скрининги на выявление онкологии (НСЗУ). Отличается детальностью и точностью в интерпретации результатов.",
    bio_en: "Svitlana Fedorenko is an ultrasound diagnostician at GENEVITY medical centre with 8 years of experience. She graduated from Dnipropetrovsk Medical Academy of the Ministry of Health of Ukraine in 2016 and specialises in ultrasound diagnostics.\n\nShe has broad clinical practice: abdominal organ ultrasound, vascular studies (Doppler of the aorta and its branches, lower extremity veins), soft tissue and joint examinations (including shoulder), renal and urinary system, scrotal ultrasound, and neonatal neurosonography.\n\nShe has completed numerous continuing education courses: neonatal neurosonography (Medical Platform Progress), RADIODAY congress of ultrasound and radiological diagnostics, scrotal organ and shoulder joint ultrasound (SONOLAB), abdominal vascular Doppler (SONOLAB) and oncology screening protocols (National Health Service of Ukraine). She is noted for her thoroughness and precision in result interpretation.",
    education: [
      {
        institution_uk: "Дніпропетровська медична академія МОЗ України",
        institution_ru: "Днепропетровская медицинская академия МЗ Украины",
        institution_en: "Dnipropetrovsk Medical Academy of the Ministry of Health of Ukraine",
        degree_uk: "Ультразвукова діагностика (Спеціаліст)",
        degree_ru: "Ультразвуковая диагностика (Специалист)",
        degree_en: "Ultrasound Diagnostics (Specialist)",
        year: 2016,
      },
    ],
    certifications: [
      { title_uk: "Нейросонографія у немовлят: від норми до патології", title_ru: "Нейросонография у новорождённых: от нормы до патологии", title_en: "Neonatal Neurosonography: From Norm to Pathology", issuer_uk: "МП «Прогрес»", issuer_ru: "МП «Прогресс»", issuer_en: "Medical Platform Progress" },
      { title_uk: "Доплерографія судин черевної порожнини. Патологія аорти", title_ru: "Допплерография сосудов брюшной полости. Патология аорты", title_en: "Abdominal Vascular Doppler. Aortic Pathology", issuer_uk: "СОНОКЛАБ", issuer_ru: "СОНОКЛАБ", issuer_en: "SONOLAB" },
      { title_uk: "УЗД органів калитки. Професійний рівень діагностики", title_ru: "УЗИ органов мошонки. Профессиональный уровень диагностики", title_en: "Scrotal Organ Ultrasound — Professional Diagnostics Level", issuer_uk: "СОНОКЛАБ", issuer_ru: "СОНОКЛАБ", issuer_en: "SONOLAB" },
      { title_uk: "Ультразвукова діагностика патології плечового суглоба", title_ru: "Ультразвуковая диагностика патологии плечевого сустава", title_en: "Ultrasound Diagnostics of Shoulder Joint Pathology", issuer_uk: "Дніпровський державний медичний університет", issuer_ru: "Днепровский государственный медицинский университет", issuer_en: "Dnipro State Medical University" },
      { title_uk: "RADIODAY — Конгрес ультразвукової та променевої діагностики", title_ru: "RADIODAY — Конгресс ультразвуковой и лучевой диагностики", title_en: "RADIODAY — Ultrasound and Radiological Diagnostics Congress", issuer_uk: "Професійна платформа", issuer_ru: "Профессиональная платформа", issuer_en: "Professional Platform" },
    ],
    service_slugs: ["ultrasound", "ultrasound-diagnostician"],
  },

  // ─── 7. Єсаянц Анна Олександрівна ───────────────────────────────────────
  {
    name_uk: "Єсаянц Анна Олександрівна",
    slug: "yesayants-anna",
    seo_title_uk: "Єсаянц Анна Олександрівна – лікар гінеколог у Дніпрі",
    seo_title_ru: "Есаянц Анна Александровна – врач гинеколог в Днепре",
    seo_title_en: "Anna Yesayants – Gynaecologist in Dnipro",
    seo_desc_uk: "Єсаянц Анна Олександрівна — лікар-гінеколог GENEVITY з 7-річним досвідом. Естетична гінекологія, інтимне відновлення AcuPulse CO₂, гінекологічне УЗД у Дніпрі.",
    seo_desc_ru: "Есаянц Анна Александровна — врач-гинеколог GENEVITY с 7-летним опытом. Эстетическая гинекология, интимное восстановление AcuPulse CO₂, гинекологическое УЗИ в Днепре.",
    seo_desc_en: "Anna Yesayants — GENEVITY gynaecologist with 7 years of experience. Aesthetic gynaecology, AcuPulse CO₂ intimate rejuvenation, gynaecological ultrasound in Dnipro.",
    bio_uk: "Анна Олександрівна Єсаянц — лікар-акушер-гінеколог медичного центру GENEVITY з 7-річним клінічним досвідом. У 2017 році закінчила Запорізький державний медичний університет за спеціальністю «Лікувальна справа» та спеціалізується в акушерстві та гінекології, онкогінекології та ультразвуковій діагностиці.\n\nАнна Олександрівна є спеціалістом центру з естетичної та функціональної гінекології. Виконує процедури інтимного відновлення: монополярний RF-ліфтинг та лазерне відновлення AcuPulse CO₂ — сучасні нехірургічні методи для покращення функціонального стану та естетики інтимної зони. Також проводить гінекологічне УЗД.\n\nПостійно вдосконалює кваліфікацію: брала участь у тематичних навчаннях з естетичної гінекології, передракових процесів у гінекології, оперативного лікування міоми матки та горизонтів материнсько-фетальної медицини. Поєднує глибокі медичні знання з чуйним ставленням до пацієнток.",
    bio_ru: "Анна Александровна Есаянц — врач акушер-гинеколог медицинского центра GENEVITY с 7-летним клиническим опытом. В 2017 году окончила Запорожский государственный медицинский университет по специальности «Лечебное дело» и специализируется в акушерстве и гинекологии, онкогинекологии и ультразвуковой диагностике.\n\nАнна Александровна является специалистом центра по эстетической и функциональной гинекологии. Выполняет процедуры интимного восстановления: монополярный RF-лифтинг и лазерное восстановление AcuPulse CO₂ — современные нехирургические методы для улучшения функционального состояния и эстетики интимной зоны. Также проводит гинекологическое УЗИ.\n\nПостоянно совершенствует квалификацию: участвовала в тематических обучениях по эстетической гинекологии, предраковым процессам в гинекологии, оперативному лечению миомы матки и горизонтам материнско-фетальной медицины. Сочетает глубокие медицинские знания с чутким отношением к пациенткам.",
    bio_en: "Anna Yesayants is an obstetrician-gynaecologist at GENEVITY medical centre with 7 years of clinical experience. She graduated from Zaporizhzhia State Medical University in 2017 and specialises in obstetrics and gynaecology, oncogynecology and ultrasound diagnostics.\n\nAnna is the centre's specialist in aesthetic and functional gynaecology. She performs intimate rejuvenation procedures: monopolar RF lifting and AcuPulse CO₂ laser rejuvenation — modern non-surgical methods for improving the functional condition and aesthetics of the intimate zone. She also performs gynaecological ultrasound.\n\nShe continuously advances her qualifications through targeted training in aesthetic gynaecology, pre-cancerous gynaecological conditions, surgical management of uterine fibroids and horizons of maternal-fetal medicine. She combines deep medical expertise with a compassionate approach to her patients.",
    education: [
      {
        institution_uk: "Запорізький державний медичний університет",
        institution_ru: "Запорожский государственный медицинский университет",
        institution_en: "Zaporizhzhia State Medical University",
        degree_uk: "Лікувальна справа (Спеціаліст)",
        degree_ru: "Лечебное дело (Специалист)",
        degree_en: "General Medicine (Specialist)",
        year: 2017,
      },
    ],
    certifications: [
      { title_uk: "Тематичне навчання: Естетична гінекологія", title_ru: "Тематическое обучение: Эстетическая гинекология", title_en: "Thematic Training: Aesthetic Gynaecology" },
      { title_uk: "Передракові процеси в гінекології: тактика ведення з погляду онкогінеколога", title_ru: "Предраковые процессы в гинекологии: тактика ведения с точки зрения онкогинеколога", title_en: "Pre-cancerous Processes in Gynaecology: Management from an Oncogynecologist's Perspective" },
      { title_uk: "Міома матки: методи вибору оперативного втручання", title_ru: "Миома матки: методы выбора оперативного вмешательства", title_en: "Uterine Fibroids: Choosing the Optimal Surgical Approach" },
      { title_uk: "Горизонти материнсько-фетальної медицини", title_ru: "Горизонты материнско-фетальной медицины", title_en: "Horizons of Maternal-Fetal Medicine" },
    ],
    service_slugs: ["monopolar-rf-lifting", "acupulse-co2-intimate", "ultrasound"],
  },

  // ─── 8. Кириленко Анжела В'ячеславівна ──────────────────────────────────
  {
    name_uk: "Кириленко Анжела В'ячеславівна",
    slug: "kyrylenko-anzhela",
    seo_title_uk: "Кириленко Анжела В'ячеславівна – лікар-подолог у Дніпрі",
    seo_title_ru: "Кириленко Анжела Вячеславовна – врач-подолог в Днепре",
    seo_title_en: "Anzhela Kyrylenko – Podologist in Dnipro",
    seo_desc_uk: "Кириленко Анжела В'ячеславівна — подолог GENEVITY з 10-річним досвідом. Лікування патології нігтів, оніхолізис, медичний педикюр у Дніпрі. Запис онлайн.",
    seo_desc_ru: "Кириленко Анжела Вячеславовна — подолог GENEVITY с 10-летним опытом. Лечение патологии ногтей, онихолизис, медицинский педикюр в Днепре. Запись онлайн.",
    seo_desc_en: "Anzhela Kyrylenko — GENEVITY podologist with 10 years of experience. Nail pathology treatment, onycholysis, medical pedicure in Dnipro. Book online.",
    bio_uk: "Анжела В'ячеславівна Кириленко — подолог медичного центру GENEVITY з 10-річним досвідом у лікуванні захворювань нігтів та шкіри стоп. У 2002 році закінчила Дніпропетровський державний інститут фізичної культури і спорту.\n\nСпеціалізується на лікуванні патології нігтів, оніхолізису, вросших нігтів, гіперкератозу та інших захворювань шкіри стоп. Виконує медичний педикюр із застосуванням сучасних апаратних методів, використовуючи індивідуальний підхід для кожного пацієнта.\n\nПройшла спеціалізовану подологічну освіту в провідних школах: школа краси Діани Остоматій, курс «Подологія з нуля» в Подоцентрі Ольги Пашиної, практичний курс від Асоціації подологів України Ірини Єгорової. Поєднує медичні знання з косметологічними навичками, забезпечуючи комплексний догляд за здоров'ям стоп.",
    bio_ru: "Анжела Вячеславовна Кириленко — подолог медицинского центра GENEVITY с 10-летним опытом в лечении заболеваний ногтей и кожи стоп. В 2002 году окончила Днепропетровский государственный институт физической культуры и спорта.\n\nСпециализируется на лечении патологии ногтей, онихолизиса, вросших ногтей, гиперкератоза и других заболеваний кожи стоп. Выполняет медицинский педикюр с применением современных аппаратных методов, используя индивидуальный подход для каждого пациента.\n\nПрошла специализированное подологическое образование в ведущих школах: школа красоты Дианы Остоматий, курс «Подология с нуля» в Подоцентре Ольги Пашиной, практический курс от Ассоциации подологов Украины Ирины Егоровой. Сочетает медицинские знания с косметологическими навыками, обеспечивая комплексный уход за здоровьем стоп.",
    bio_en: "Anzhela Kyrylenko is a podologist at GENEVITY medical centre with 10 years of experience in treating nail and foot skin conditions. She graduated from Dnipropetrovsk State Institute of Physical Culture and Sport in 2002.\n\nShe specialises in nail pathology, onycholysis, ingrown nails, hyperkeratosis and other foot skin conditions, performing medical pedicure using modern device-assisted methods with an individualised approach for each patient.\n\nShe has completed specialist podological training at leading schools: Diana Ostomaty Beauty School, the \"Podology from Scratch\" course at Olha Pashyna's Podocenter, and a practical course from the Association of Podologists of Ukraine by Iryna Yehorova. She combines medical knowledge with cosmetological skills to provide comprehensive foot health care.",
    education: [
      {
        institution_uk: "Дніпропетровський державний інститут фізичної культури і спорту",
        institution_ru: "Днепропетровский государственный институт физической культуры и спорта",
        institution_en: "Dnipropetrovsk State Institute of Physical Culture and Sport",
        degree_uk: "Фізична культура і спорт (Спеціаліст)",
        degree_ru: "Физическая культура и спорт (Специалист)",
        degree_en: "Physical Culture and Sport (Specialist)",
        year: 2002,
      },
    ],
    certifications: [
      { title_uk: "Патологія нігтів. Оніхолізис — школа краси Діани Остоматій", title_ru: "Патология ногтей. Онихолизис — школа красоты Дианы Остоматий", title_en: "Nail Pathology. Onycholysis — Diana Ostomaty Beauty School", issuer_uk: "Школа краси Діани Остоматій", issuer_ru: "Школа красоты Дианы Остоматий", issuer_en: "Diana Ostomaty Beauty School" },
      { title_uk: "Подологія з нуля", title_ru: "Подология с нуля", title_en: "Podology from Scratch", issuer_uk: "Подоцентр Ольги Пашиної", issuer_ru: "Подоцентр Ольги Пашиной", issuer_en: "Olha Pashyna Podocenter" },
      { title_uk: "Подологія — практика від Асоціації подологів України", title_ru: "Подология — практика от Ассоциации подологов Украины", title_en: "Podology Practice — Association of Podologists of Ukraine", issuer_uk: "Асоціація подологів України (Ірина Єгорова)", issuer_ru: "Ассоциация подологов Украины (Ирина Егорова)", issuer_en: "Association of Podologists of Ukraine (Iryna Yehorova)" },
    ],
    service_slugs: [],
  },

  // ─── 9. Мінчук Євгенія Анатоліївна ──────────────────────────────────────
  {
    name_uk: "Мінчук Євгенія Анатоліївна",
    slug: "minchuk-yevheniia",
    seo_title_uk: "Мінчук Євгенія Анатоліївна – лікар гастроентеролог у Дніпрі",
    seo_title_ru: "Минчук Евгения Анатольевна – врач гастроэнтеролог в Днепре",
    seo_title_en: "Yevheniia Minchuk – Gastroenterologist in Dnipro",
    seo_desc_uk: "Мінчук Євгенія Анатоліївна — гастроентеролог-дієтолог GENEVITY з 20-річним досвідом. Захворювання ШКТ, дієтологія, нутрицевтика, нормалізація ваги у Дніпрі.",
    seo_desc_ru: "Минчук Евгения Анатольевна — гастроэнтеролог-диетолог GENEVITY с 20-летним опытом. Заболевания ЖКТ, диетология, нутрицевтика, нормализация веса в Днепре.",
    seo_desc_en: "Yevheniia Minchuk — GENEVITY gastroenterologist-dietologist with 20 years of experience. GI tract conditions, dietology, nutraceuticals, weight normalisation in Dnipro.",
    bio_uk: "Євгенія Анатоліївна Мінчук — лікар-гастроентеролог та дієтолог медичного центру GENEVITY з 20-річним досвідом у гастроентерології та 3 роками у дієтології. У 1996 році закінчила Дніпропетровську державну медичну академію за спеціальністю «Лікувальна справа».\n\nСпеціалізується на діагностиці та лікуванні захворювань шлунково-кишкового тракту: гастрит, виразкова хвороба, синдром подразненого кишечника, захворювання жовчного міхура та підшлункової залози, неалкогольна жирова хвороба печінки. У напрямку дієтології розробляє індивідуальні харчові програми, консультує з питань нутрицевтики та корекції ваги.\n\nЄвгенія Анатоліївна поєднує багаторічний досвід з постійним вдосконаленням знань. Особлива увага приділяється зв'язку мікробіому кишечника із загальним здоров'ям та превентивному підходу до хронічних захворювань травного тракту.",
    bio_ru: "Евгения Анатольевна Минчук — врач-гастроэнтеролог и диетолог медицинского центра GENEVITY с 20-летним опытом в гастроэнтерологии и 3 годами в диетологии. В 1996 году окончила Днепропетровскую государственную медицинскую академию по специальности «Лечебное дело».\n\nСпециализируется на диагностике и лечении заболеваний желудочно-кишечного тракта: гастрит, язвенная болезнь, синдром раздражённого кишечника, заболевания желчного пузыря и поджелудочной железы, неалкогольная жировая болезнь печени. В направлении диетологии разрабатывает индивидуальные пищевые программы, консультирует по вопросам нутрицевтики и коррекции веса.\n\nЕвгения Анатольевна сочетает многолетний опыт с постоянным совершенствованием знаний. Особое внимание уделяется связи микробиома кишечника с общим здоровьем и превентивному подходу к хроническим заболеваниям пищеварительного тракта.",
    bio_en: "Yevheniia Minchuk is a gastroenterologist and dietologist at GENEVITY medical centre with 20 years of gastroenterology experience and 3 years in dietology. She graduated from Dnipropetrovsk State Medical Academy in 1996 with a degree in General Medicine.\n\nShe specialises in diagnosing and treating gastrointestinal conditions: gastritis, peptic ulcer disease, irritable bowel syndrome, gallbladder and pancreatic conditions, and non-alcoholic fatty liver disease. In dietology she develops personalised nutritional programmes and provides nutraceutical and weight management consultations.\n\nYevheniia combines extensive clinical experience with continuous professional development. She places particular emphasis on the gut microbiome's relationship to overall health and a preventive approach to chronic digestive conditions.",
    education: [
      {
        institution_uk: "Дніпропетровська державна медична академія",
        institution_ru: "Днепропетровская государственная медицинская академия",
        institution_en: "Dnipropetrovsk State Medical Academy",
        degree_uk: "Лікувальна справа (Спеціаліст)",
        degree_ru: "Лечебное дело (Специалист)",
        degree_en: "General Medicine (Specialist)",
        year: 1996,
      },
    ],
    certifications: [],
    service_slugs: ["nutraceuticals", "bioimpedance"],
  },

  // ─── 10. Толстикова Тетяна Миколаївна ───────────────────────────────────
  {
    name_uk: "Толстикова Тетяна Миколаївна",
    slug: "tolstykova-tetiana",
    seo_title_uk: "Толстикова Тетяна Миколаївна – гастроентеролог, кандидат наук у Дніпрі",
    seo_title_ru: "Толстикова Татьяна Николаевна – гастроэнтеролог, кандидат наук в Днепре",
    seo_title_en: "Tetiana Tolstykova – Gastroenterologist, PhD in Dnipro",
    seo_desc_uk: "Толстикова Тетяна Миколаївна — кандидат медичних наук, гастроентеролог GENEVITY з 19-річним досвідом. Захворювання ШКТ, дієтологія, нутрицевтика у Дніпрі.",
    seo_desc_ru: "Толстикова Татьяна Николаевна — кандидат медицинских наук, гастроэнтеролог GENEVITY с 19-летним опытом. Заболевания ЖКТ, диетология, нутрицевтика в Днепре.",
    seo_desc_en: "Tetiana Tolstykova — PhD, GENEVITY gastroenterologist with 19 years of experience. GI tract conditions, dietology, nutraceuticals in Dnipro.",
    bio_uk: "Тетяна Миколаївна Толстикова — кандидат медичних наук, лікар-гастроентеролог та дієтолог медичного центру GENEVITY з 19-річним клінічним досвідом. У 2003 році закінчила Дніпропетровську державну медичну академію за спеціальністю «Педіатрія», а у 2007 році захистила дисертацію кандидата медичних наук за спеціальністю «Внутрішні хвороби» у Харківському державному медичному університеті.\n\nСпеціалізується на гастроентерології та дієтології: лікує захворювання шлунку, кишечника, печінки, підшлункової залози та жовчовивідних шляхів. Має глибоку наукову базу та застосовує найновіші методи доказової медицини у клінічній практиці. Консультує з питань лікувального харчування та нутрицевтики.\n\nАктивно бере участь у провідних науково-практичних конференціях: XVI Український гастроентерологічний тиждень, ХIII наукова сесія Інституту гастроентерології НАМН України, конференція «Поліморбідна патологія органів травлення у практиці сімейного лікаря». Поєднує наукову глибину з практичним досвідом та індивідуальним підходом до кожного пацієнта.",
    bio_ru: "Татьяна Николаевна Толстикова — кандидат медицинских наук, врач-гастроэнтеролог и диетолог медицинского центра GENEVITY с 19-летним клиническим опытом. В 2003 году окончила Днепропетровскую государственную медицинскую академию по специальности «Педиатрия», а в 2007 году защитила диссертацию кандидата медицинских наук по специальности «Внутренние болезни» в Харьковском государственном медицинском университете.\n\nСпециализируется на гастроэнтерологии и диетологии: лечит заболевания желудка, кишечника, печени, поджелудочной железы и желчевыводящих путей. Имеет глубокую научную базу и применяет новейшие методы доказательной медицины в клинической практике. Консультирует по вопросам лечебного питания и нутрицевтики.\n\nАктивно участвует в ведущих научно-практических конференциях: XVI Украинская гастроэнтерологическая неделя, XIII научная сессия Института гастроэнтерологии НАМН Украины, конференция «Полиморбидная патология органов пищеварения в практике семейного врача». Сочетает научную глубину с практическим опытом и индивидуальным подходом к каждому пациенту.",
    bio_en: "Tetiana Tolstykova is a PhD (Candidate of Medical Sciences), gastroenterologist and dietologist at GENEVITY medical centre with 19 years of clinical experience. She graduated from Dnipropetrovsk State Medical Academy in Paediatrics in 2003 and defended her PhD dissertation in Internal Medicine at Kharkiv State Medical University in 2007.\n\nShe specialises in gastroenterology and dietology, treating conditions of the stomach, intestine, liver, pancreas and biliary tract. She possesses a strong scientific background and applies the latest evidence-based medicine methods in clinical practice, providing consultations on therapeutic nutrition and nutraceuticals.\n\nShe actively participates in leading scientific conferences: the XVI Ukrainian Gastroenterological Week, the XIII Scientific Session of the Institute of Gastroenterology of the NAMS of Ukraine, and the conference on \"Polymorbid Digestive Pathology in Family Practice\". She combines scientific depth with clinical experience and a personalised approach to every patient.",
    education: [
      {
        institution_uk: "Дніпропетровська державна медична академія",
        institution_ru: "Днепропетровская государственная медицинская академия",
        institution_en: "Dnipropetrovsk State Medical Academy",
        degree_uk: "Педіатрія (Спеціаліст)",
        degree_ru: "Педиатрия (Специалист)",
        degree_en: "Paediatrics (Specialist)",
        year: 2003,
      },
      {
        institution_uk: "Харківський державний медичний університет",
        institution_ru: "Харьковский государственный медицинский университет",
        institution_en: "Kharkiv State Medical University",
        degree_uk: "Кандидат медичних наук — Внутрішні хвороби",
        degree_ru: "Кандидат медицинских наук — Внутренние болезни",
        degree_en: "PhD (Candidate of Medical Sciences) — Internal Medicine",
        year: 2007,
      },
    ],
    certifications: [
      { title_uk: "XVI Український гастроентерологічний тиждень", title_ru: "XVI Украинская гастроэнтерологическая неделя", title_en: "XVI Ukrainian Gastroenterological Week", issuer_uk: "Українська гастроентерологічна асоціація", issuer_ru: "Украинская гастроэнтерологическая ассоциация", issuer_en: "Ukrainian Gastroenterological Association" },
      { title_uk: "ХIII наукова сесія Інституту гастроентерології НАМН України", title_ru: "XIII научная сессия Института гастроэнтерологии НАМН Украины", title_en: "XIII Scientific Session of the Institute of Gastroenterology, NAMS of Ukraine", issuer_uk: "Інститут гастроентерології НАМН України", issuer_ru: "Институт гастроэнтерологии НАМН Украины", issuer_en: "Institute of Gastroenterology, NAMS of Ukraine" },
      { title_uk: "Поліморбідна патологія органів травлення у практиці сімейного лікаря", title_ru: "Полиморбидная патология органов пищеварения в практике семейного врача", title_en: "Polymorbid Digestive Pathology in Family Practice", issuer_uk: "Інститут гастроентерології НАМН України", issuer_ru: "Институт гастроэнтерологии НАМН Украины", issuer_en: "Institute of Gastroenterology, NAMS of Ukraine" },
    ],
    service_slugs: ["nutraceuticals", "bioimpedance"],
  },

  // ─── 11. Петренко Світлана Андріївна ────────────────────────────────────
  {
    name_uk: "Петренко Світлана Андріївна",
    slug: "petrenko-svitlana",
    seo_title_uk: "Петренко Світлана Андріївна – лікар уролог у Дніпрі",
    seo_title_ru: "Петренко Светлана Андреевна – врач уролог в Днепре",
    seo_title_en: "Svitlana Petrenko – Urologist in Dnipro",
    seo_desc_uk: "Петренко Світлана Андріївна — лікар-уролог GENEVITY з 6-річним досвідом. Діагностика та лікування урологічних захворювань, малоінвазивна урологія у Дніпрі.",
    seo_desc_ru: "Петренко Светлана Андреевна — врач-уролог GENEVITY с 6-летним опытом. Диагностика и лечение урологических заболеваний, малоинвазивная урология в Днепре.",
    seo_desc_en: "Svitlana Petrenko — GENEVITY urologist with 6 years of experience. Diagnosis and treatment of urological conditions, minimally invasive urology in Dnipro.",
    bio_uk: "Світлана Андріївна Петренко — лікар-уролог медичного центру GENEVITY з 6-річним досвідом у діагностиці та лікуванні урологічних захворювань. У 2020 році закінчила Дніпропетровську медичну академію МОЗ України за спеціальністю «Лікувальна справа».\n\nСпеціалізується на діагностиці та лікуванні захворювань нирок, сечового міхура, сечовивідних шляхів та простати. Застосовує сучасні малоінвазивні підходи та доказову медицину у клінічній практиці. Консультує чоловіків і жінок з урологічною патологією.\n\nПостійно підвищує кваліфікацію: пройшла навчання з принципів застосування гіалуронової кислоти в реконструктивній хірургії, а також отримала актуальні знання з діагностики та лікування раку простати (MOVEMBER-2024) і малоінвазивних технологій в урології. Відрізняється уважним ставленням до пацієнтів та прагненням до якнайшвидшого вирішення проблем зі здоров'ям.",
    bio_ru: "Светлана Андреевна Петренко — врач-уролог медицинского центра GENEVITY с 6-летним опытом в диагностике и лечении урологических заболеваний. В 2020 году окончила Днепропетровскую медицинскую академию МЗ Украины по специальности «Лечебное дело».\n\nСпециализируется на диагностике и лечении заболеваний почек, мочевого пузыря, мочевыводящих путей и предстательной железы. Применяет современные малоинвазивные подходы и доказательную медицину в клинической практике. Консультирует мужчин и женщин с урологической патологией.\n\nПостоянно повышает квалификацию: прошла обучение по принципам применения гиалуроновой кислоты в реконструктивной хирургии, а также получила актуальные знания по диагностике и лечению рака предстательной железы (MOVEMBER-2024) и малоинвазивным технологиям в урологии. Отличается внимательным отношением к пациентам и стремлением к скорейшему решению проблем со здоровьем.",
    bio_en: "Svitlana Petrenko is a urologist at GENEVITY medical centre with 6 years of experience in diagnosing and treating urological conditions. She graduated from Dnipropetrovsk Medical Academy of the Ministry of Health of Ukraine in 2020 with a degree in General Medicine.\n\nShe specialises in diagnosing and treating kidney, bladder, urinary tract and prostate conditions, applying modern minimally invasive approaches and evidence-based medicine in her clinical practice. She consults both male and female patients with urological pathologies.\n\nShe continuously updates her expertise: she has completed training in hyaluronic acid principles in reconstructive surgery, acquired current knowledge in prostate cancer diagnostics and treatment (MOVEMBER-2024), and studied minimally invasive technologies in urology. She is noted for her attentive approach to patients and commitment to swift health problem resolution.",
    education: [
      {
        institution_uk: "Державний заклад «Дніпропетровська медична академія МОЗ України»",
        institution_ru: "Государственное учреждение «Днепропетровская медицинская академия МЗ Украины»",
        institution_en: "Dnipropetrovsk Medical Academy of the Ministry of Health of Ukraine",
        degree_uk: "Лікувальна справа (Спеціаліст)",
        degree_ru: "Лечебное дело (Специалист)",
        degree_en: "General Medicine (Specialist)",
        year: 2020,
      },
    ],
    certifications: [
      { title_uk: "Принципи застосування гіалуронової кислоти: від естетики до реконструктивної хірургії", title_ru: "Принципы применения гиалуроновой кислоты: от эстетики до реконструктивной хирургии", title_en: "Hyaluronic Acid Principles: from Aesthetics to Reconstructive Surgery", issuer_uk: "Українська асоціація фундаментальної, експериментальної і клінічної фармакології", issuer_ru: "Украинская ассоциация фундаментальной, экспериментальной и клинической фармакологии", issuer_en: "Ukrainian Association of Fundamental, Experimental and Clinical Pharmacology" },
      { title_uk: "MOVEMBER-2024: Інновації в діагностиці та лікуванні раку простати", title_ru: "MOVEMBER-2024: Инновации в диагностике и лечении рака простаты", title_en: "MOVEMBER-2024: Innovations in Prostate Cancer Diagnostics and Treatment", issuer_uk: "Спілка онкоурологів України", issuer_ru: "Союз онкоурологов Украины", issuer_en: "Union of Oncourologists of Ukraine", year: 2024 },
      { title_uk: "Малоінвазивні технології в урології", title_ru: "Малоинвазивные технологии в урологии", title_en: "Minimally Invasive Technologies in Urology", issuer_uk: "Товариство з громадського здоров'я Львівщини", issuer_ru: "Общество общественного здравоохранения Львовщины", issuer_en: "Lviv Public Health Society" },
    ],
    service_slugs: [],
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function main() {
  let ok = 0;

  for (const d of doctors) {
    // Find by name
    const rows = await sql`SELECT id FROM doctors WHERE name_uk = ${d.name_uk}`;
    if (!rows.length) { console.warn(`⚠  NOT FOUND: ${d.name_uk}`); continue; }
    const id = rows[0].id;

    await sql`
      UPDATE doctors SET
        slug              = ${d.slug},
        seo_title_uk      = ${d.seo_title_uk},
        seo_title_ru      = ${d.seo_title_ru},
        seo_title_en      = ${d.seo_title_en},
        seo_desc_uk       = ${d.seo_desc_uk},
        seo_desc_ru       = ${d.seo_desc_ru},
        seo_desc_en       = ${d.seo_desc_en},
        bio_uk            = ${d.bio_uk},
        bio_ru            = ${d.bio_ru},
        bio_en            = ${d.bio_en},
        education         = ${JSON.stringify(d.education)},
        certifications    = ${JSON.stringify(d.certifications)}
      WHERE id = ${id}
    `;

    // Service mappings
    await sql`DELETE FROM service_doctors WHERE doctor_id = ${id}`;
    for (let i = 0; i < d.service_slugs.length; i++) {
      const svcRows = await sql`SELECT id FROM services WHERE slug = ${d.service_slugs[i]}`;
      if (!svcRows.length) { console.warn(`  ⚠  service not found: ${d.service_slugs[i]}`); continue; }
      await sql`
        INSERT INTO service_doctors (service_id, doctor_id, sort_order)
        VALUES (${svcRows[0].id}, ${id}, ${i})
        ON CONFLICT DO NOTHING
      `;
    }

    console.log(`✓ ${d.name_uk} → /${d.slug} | ${d.service_slugs.length} services`);
    ok++;
  }

  console.log(`\n✅ ${ok}/${doctors.length} doctors seeded.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
