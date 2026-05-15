/**
 * Full metatag seed — updates seo_title, seo_desc, h1 for all 53 CSV pages
 * across UA / RU / EN locales.
 *
 * Rules:
 *  - seo_title stored 1:1 from CSV (no layout template — template was removed)
 *  - service_categories has no h1 col → update title_uk/ru/en with H1 value
 *
 * Run: npx tsx scripts/seed-metatags-all.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Meta { uk: string; ru: string; en: string }
interface ServiceMeta   { slug: string; h1: Meta; title: Meta; desc: Meta }
interface CategoryMeta  { slug: string; h1: Meta; title: Meta; desc: Meta }
interface StaticMeta    { slug: string; h1: Meta; title: Meta; desc: Meta }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const m = (uk: string, ru: string, en: string): Meta => ({ uk, ru, en });

// ─── SERVICES ────────────────────────────────────────────────────────────────
const services: ServiceMeta[] = [
  // Injectable
  { slug: "botulinum-therapy",
    h1:    m("Ботулінотерапія в Дніпрі","Ботулинотерапия в Днепре","Botox Treatments in Dnipro"),
    title: m("Ботулінотерапія у Дніпрі – ін'єкції ботоксу для обличчя","Ботулинотерапия в Днепре – инъекции ботокса для лица","Botulinotherapy in Dnipro – Botox injections for the face"),
    desc:  m("Ботокс для обличчя в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на уколи ботоксу – розгладження зморшок ін'єкціями ботоксу ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Ботокс для лица в Днепре 🤍 GENEVITY 💫 Доступные цены на уколы ботокса – разглаживание морщин инъекциями ботокса ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Botox for the face in Dnipro 🤍 GENEVITY 💫 Affordable prices for Botox injections – smoothing wrinkles with Botox injections ⏩ Doctors with experience 🧬 Certified drugs.") },

  { slug: "contour-plasty",
    h1:    m("Контурна пластика обличчя в Дніпрі","Контурная пластика лица в Днепре","Facial Contouring in Dnipro"),
    title: m("Контурна пластика обличчя у Дніпрі – послуги контурної пластики","Контурная пластика лица в Днепре – услуги контурной пластики","Face contouring in Dnipro – contouring services"),
    desc:  m("Контурна пластика обличчя в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на контурну пластику філерами ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Контурная пластика лица в Днепре 🤍 GENEVITY 💫 Доступные цены на контурную пластику филлерами ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Facial contouring in Dnipro 🤍 GENEVITY 💫 Affordable prices for contouring with fillers ⏩ Doctors with experience 🧬 Certified drugs.") },

  { slug: "biorevitalisation",
    h1:    m("Біоревіталізація в Дніпрі","Биоревитализация в Днепре","Biorevitalization in Dnipro"),
    title: m("Біоревіталізація у Дніпрі – процедура біоревіталізації обличчя","Биоревитализация в Днепре – процедура биоревитализации лица","Biorevitalization in Dnipro – facial biorevitalization procedure"),
    desc:  m("Процедура біоревіталізації в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на біоревіталізацію шкіри ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Процедура биоревитализации в Днепре 🤍 GENEVITY 💫 Доступные цены на биоревитализацию кожи ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Biorevitalization procedure in Dnipro 🤍 GENEVITY 💫 Affordable prices for skin biorevitalization ⏩ Doctors with experience 🧬 Certified drugs.") },

  { slug: "mesotherapy",
    h1:    m("Мезотерапія для обличчя в Дніпрі","Мезотерапия для лица в Днепре","Facial mesotherapy in Dnipro"),
    title: m("Мезотерапія для обличчя у Дніпрі – ін'єкційна мезотерапія обличчя","Мезотерапия для лица в Днепре – инъекционная мезотерапия лица","Face mesotherapy in Dnipro – facial injection mesotherapy"),
    desc:  m("Процедура мезотерапії в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на омолодження обличчя мезотерапією ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Процедура мезотерапии в Днепре 🤍 GENEVITY 💫 Доступные цены на омоложение лица мезотерапией ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Mesotherapy procedure in Dnipro 🤍 GENEVITY 💫 Affordable prices for facial rejuvenation with mesotherapy ⏩ Experienced doctors 🧬 Certified drugs.") },

  { slug: "prp-therapy",
    h1:    m("PRP-терапія в Дніпрі","PRP-терапия в Днепре","PRP therapy in Dnipro"),
    title: m("PRP-терапія у Дніпрі – уколи плазми","PRP-терапия в Днепре – уколы плазмы","PRP therapy in Dnipro – plasma injections"),
    desc:  m("Процедура PRP-плазмотерапія в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на процедуру плазмотерапії апаратом arthrex ⏩ Лікарі з досвідом 🧬 Безпека процедури.","Процедура PRP-плазмотерапия в Днепре 🤍 GENEVITY 💫 Доступные цены на процедуру плазмотерапии аппаратом arthrex ⏩ Врачи с опытом 🧬 Безопасность процедуры.","PRP-plasma therapy procedure in Dnipro 🤍 GENEVITY 💫 Affordable prices for plasma therapy procedure arthrex device ⏩ Experienced doctors 🧬 Safety of the procedure.") },

  { slug: "exosomes",
    h1:    m("Екзосоми для обличчя в Дніпрі","Экзосомы для лица в Днепре","Facial exosomes in Dnipro"),
    title: m("Екзосоми для обличчя у Дніпрі – ін'єкції екзосом для обличчя","Экзосомы для лица в Днепре – инъекции экзосом для лица","Exosomes for the face in Dnipro – facial exosomes injections"),
    desc:  m("Ін'єкції екзосом для глибокого відновлення шкіри в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на процедуру екзосомальної терапії ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Инъекции экзосом для глубокого восстановления кожи в Днепре 🤍 GENEVITY 💫 Доступные цены на процедуру экзосомальной терапии ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Exosome injections for deep skin regeneration in Dnipro 🤍 GENEVITY 💫 Affordable prices for exosomal therapy procedure ⏩ Experienced doctors 🧬 Certified drugs.") },

  { slug: "stem-cell-therapy",
    h1:    m("Омолодження стовбуровими клітинами в Дніпрі","Омоложение стволовыми клетками в Днепре","Stem cell rejuvenation in Dnipro"),
    title: m("Омолодження стовбуровими клітинами у Дніпрі – процедура омолодження стовбуровими клітинами","Омоложение стволовыми клетками в Днепре – процедура омоложения стволовыми клетками","Stem cell rejuvenation in Dnipro – stem cell rejuvenation procedure"),
    desc:  m("Процедура омолодження стовбуровими клітинами в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на омолоджуючі процедури зі стовбуровими клітинами ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Процедура омоложения стволовыми клетками в Днепре 🤍 GENEVITY 💫 Доступные цены на омолаживающие процедуры со стволовыми клетками ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Stem cell rejuvenation procedure in Dnipro 🤍 GENEVITY 💫 Affordable prices for rejuvenating procedures with stem cells ⏩ Experienced doctors 🧬 Certified drugs.") },

  { slug: "rejuran",
    h1:    m("Уколи Rejuran в Дніпрі","Уколы Rejuran в Днепре","Rejuran injections in Dnipro"),
    title: m("Уколи Rejuran у Дніпрі – косметологічні ін'єкції Rejuran","Уколы Rejuran в Днепре – косметологические инъекции Rejuran","Rejuran injections in Dnipro – Rejuran cosmetic injections"),
    desc:  m("Косметологічні ін'єкції Rejuran в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на омолодження препаратом Rejuran ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Косметологические инъекции Rejuran в Днепре 🤍 GENEVITY 💫 Доступные цены на омоложение препаратом Rejuran ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Rejuran cosmetic injections in Dnipro 🤍 GENEVITY 💫 Affordable prices for rejuvenation with Rejuran ⏩ Experienced doctors 🧬 Certified drugs.") },

  { slug: "juvederm",
    h1:    m("Уколи Juvederm в Дніпрі","Уколы Juvederm в Днепре","Juvederm Injections in Dnipro"),
    title: m("Уколи Juvederm у Дніпрі – косметологічні ін'єкції Juvederm","Уколы Juvederm в Днепре – косметологические инъекции Juvederm","Juvederm injections in Dnipro – Juvederm cosmetic injections"),
    desc:  m("Косметологічні ін'єкції Juvederm в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на омолодження препаратом Juvederm ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Косметологические инъекции Juvederm в Днепре 🤍 GENEVITY 💫 Доступные цены на омоложение препаратом Juvederm ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Juvederm cosmetic injections in Dnipro 🤍 GENEVITY 💫 Affordable prices for rejuvenation with Juvederm ⏩ Experienced doctors 🧬 Certified drugs.") },

  { slug: "polyphil",
    h1:    m("Уколи PolyPhil в Дніпрі","Уколы PolyPhil в Днепре","PolyPhil Injections in Dnipro"),
    title: m("Уколи PolyPhil у Дніпрі – косметологічні ін'єкції PolyPhil","Уколы PolyPhil в Днепре – косметологические инъекции PolyPhil","PolyPhil injections in Dnipro – cosmetic injections PolyPhil"),
    desc:  m("Косметологічні ін'єкції PolyPhil у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на омолодження препаратом PolyPhil ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Косметологические инъекции PolyPhil в Днепре 🤍 GENEVITY 💫 Доступные цены на омоложение препаратом PolyPhil ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","PolyPhil cosmetic injections in Dnipro 🤍 GENEVITY 💫 Affordable prices for rejuvenation with PolyPhil ⏩ Experienced doctors 🧬 Certified drugs.") },

  // Apparatus face hub
  { slug: "face",
    h1:    m("Апаратні процедури для обличчя в Дніпрі","Аппаратные процедуры для лица в Днепре","Non-invasive Facial Treatments in Dnipro"),
    title: m("Апаратні процедури для обличчя у Дніпрі – процедури апаратної косметології обличчя","Аппаратные процедуры для лица в Днепре – процедуры аппаратной косметологии лица","Hardware facial procedures in Dnipro – hardware facial cosmetology procedures"),
    desc:  m("Процедури апаратної косметології обличчя в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на апаратні процедури для обличчя ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедуры аппаратной косметологии лица в Днепре 🤍 GENEVITY 💫 Доступные цены на аппаратные процедуры для лица ⏩ Врачи с опытом 🧬 Современное оборудование.","Hardware facial cosmetology procedures in Dnipro 🤍 GENEVITY 💫 Affordable prices for hardware facial procedures ⏩ Experienced doctors 🧬 Modern equipment.") },

  // Individual face devices
  { slug: "emface",
    h1:    m("Процедура EMFACE в Дніпрі","Процедура EMFACE в Днепре","EMFACE Treatment in Dnipro"),
    title: m("Процедура на апараті EMFACE у Дніпрі – безопераційний ліфтинг для обличчя","Процедура на аппарате EMFACE в Днепре – безоперационный лифтинг для лица","EMFACE procedure in Dnipro – non-surgical face lifting"),
    desc:  m("Процедура EMFACE для обличчя в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на безопераційний безін'єкційний ліфтинг для обличчя на апараті EMFACE ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура EMFACE для лица в Днепре 🤍 GENEVITY 💫 Доступные цены на безоперационный, безинъекционный лифтинг для лица на аппарате EMFACE ⏩ Врачи с опытом 🧬 Современное оборудование.","EMFACE procedure for the face in Dnipro 🤍 GENEVITY 💫 Affordable prices for non-surgical face lifting using the EMFACE device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "volnewmer",
    h1:    m("Процедура VOLNEWMER в Дніпрі","Процедура VOLNEWMER в Днепре","VOLNEWMER Treatment in Dnipro"),
    title: m("Процедура на апараті VOLNEWMER у Дніпрі – радіочастотний ліфтинг для обличчя","Процедура на аппарате VOLNEWMER в Днепре – радиочастотный лифтинг для лица","VOLNEWMER procedure in Dnipro – radiofrequency face lifting"),
    desc:  m("Процедура VOLNEWMER для обличчя в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на радіочастотний ліфтинг та омолодення для обличчя на апараті VOLNEWMER ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура VOLNEWMER для лица в Днепре 🤍 GENEVITY 💫 Доступные цены на радиочастотный лифтинг и омоложение для лица на аппарате VOLNEWMER ⏩ Врачи с опытом 🧬 Современное оборудование.","VOLNEWMER procedure for the face in Dnipro 🤍 GENEVITY 💫 Affordable prices for radiofrequency lifting for the face using the VOLNEWMER device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "exion-face",
    h1:    m("Процедура EXION Face в Дніпрі","Процедура EXION Face в Днепре","EXION Face Treatment in Dnipro"),
    title: m("Процедура EXION Face у Дніпрі – радіочастотна терапія для шкіри","Процедура EXION Face в Днепре – радиочастотная терапия для кожи","EXION Face procedure in Dnipro – radiofrequency therapy for the skin"),
    desc:  m("Процедура EXION Face для обличчя в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на радіочастотну терапію для гарної підтягнутої шкіри на апараті EXION Face ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура EXION Face для лица в Днепре 🤍 GENEVITY 💫 Доступные цены на радиочастотную терапию для красивой подтянутой кожи на аппарате EXION Face ⏩ Врачи с опытом 🧬 Современное оборудование.","EXION Face procedure for the face in Dnipro 🤍 GENEVITY 💫 Affordable prices for radiofrequency therapy for beautiful skin on the EXION Face device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "ultraformer-mpt",
    h1:    m("Ultraformer MPT в Дніпрі","Ultraformer MPT в Днепре","Ultraformer MPT in Dnipro"),
    title: m("Ультраформер у Дніпрі – смас ліфтинг обличчя Ultraformer MPT","Ультраформер в Днепре – смас лифтинг лица Ultraformer MPT","Ultraformer in Dnipro – smas face lifting Ultraformer MPT"),
    desc:  m("Процедура Ultraformer MPT у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на смас ліфтинг обличчя на апараті Ultraformer MPT ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура Ultraformer MPT в Днепре 🤍 GENEVITY 💫 Доступные цены на смас лифтинг лица на аппарате Ultraformer MPT ⏩ Врачи с опытом 🧬 Современное оборудование.","Ultraformer MPT procedure in Dnipro 🤍 GENEVITY 💫 Affordable prices for face massage lifting on the Ultraformer MPT device ⏩ Experienced doctors 🧬 Modern equipment.") },

  // Apparatus body hub
  { slug: "body",
    h1:    m("Апаратна косметологія для тіла в Дніпрі","Аппаратная косметология для тела в Днепре","Non-invasive body treatments in Dnipro"),
    title: m("Апаратна косметологія для тіла у Дніпрі – послуги апаратної косметології для тіла","Аппаратная косметология для тела в Днепре – услуги аппаратной косметологии для тела","Hardware body cosmetology in Dnipro – hardware body cosmetology services"),
    desc:  m("Сучасна апаратна косметологія для корекції тіла в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на процедури апаратної косметології для тіла ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Современная аппаратная косметология для коррекции тела в Днепре 🤍 GENEVITY 💫 Доступные цены на процедуры аппаратной косметологии для тела ⏩ Врачи с опытом 🧬 Современное оборудование.","Modern hardware cosmetology for the body in Dnipro 🤍 GENEVITY 💫 Affordable prices for hardware cosmetology procedures for the body ⏩ Experienced doctors 🧬 Modern equipment.") },

  // Individual body devices
  { slug: "emsculpt-neo",
    h1:    m("Процедура Emsculpt Neo в Дніпрі","Процедура Emsculpt Neo в Днепре","Emsculpt Neo treatment in Dnipro"),
    title: m("Процедура на апараті Emsculpt Neo у Дніпрі – неінвазивна методика корекції фігури","Процедура на аппарате Emsculpt Neo в Днепре – неинвазивная методика коррекции фигуры","Emsculpt Neo procedure in Dnipro – non-invasive figure correction technique"),
    desc:  m("Процедура Emsculpt Neo в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на неінвазивну корекцію тіла на апараті Emsculpt Neo ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура Emsculpt Neo в Днепре 🤍 GENEVITY 💫 Доступные цены на неинвазивную коррекцию тела на аппарате Emsculpt Neo ⏩ Врачи с опытом 🧬 Современное оборудование.","Emsculpt Neo procedure in Dnipro 🤍 GENEVITY 💫 Affordable prices for non-invasive body correction on the Emsculpt Neo device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "ultraformer-mpt-body",
    h1:    m("Ultraformer MPT для тіла в Дніпрі","Ultraformer MPT для тела в Днепре","Ultraformer MPT for the body in Dnipro"),
    title: m("Ультраформер для тіла у Дніпрі – смас ліфтинг тіла Ultraformer MPT","Ультраформер для тела в Днепре – смас лифтинг тела Ultraformer MPT","Ultraformer for the body in Dnipro – smas body lifting Ultraformer MPT"),
    desc:  m("Ультразвуковий SMAS-ліфтинг тіла на апараті ультраформер МРТ у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на SMAS-ліфтинг тіла на апараті Ultraformer MPT ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Ультразвуковой SMAS-лифтинг тела на аппарате ультраформер МРТ в Днепре 🤍 GENEVITY 💫 Доступные цены на SMAS-лифтинг тела на аппарате Ultraformer MPT ⏩ Врачи с опытом 🧬 Современное оборудование.","Ultrasonic SMAS-lifting of the body on the Ultraformer MPT device in Dnipro 🤍 GENEVITY 💫 Affordable prices for SMAS-lifting of the body on the Ultraformer MPT device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "exion-body",
    h1:    m("Процедура EXION Body в Дніпрі","Процедура EXION Body в Днепре","EXION Body treatment in Dnipro"),
    title: m("Процедура EXION Body у Дніпрі – радіочастотна терапія для шкіри тіла","Процедура EXION Body в Днепре – радиочастотная терапия для кожи тела","EXION Body procedure in Dnipro – radiofrequency therapy for the skin of the body"),
    desc:  m("Процедура EXION Body для тіла в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на радіочастотну терапію для гарної підтягнутої шкіри тіла на апараті EXION Body ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура EXION Body для тела в Днепре 🤍 GENEVITY 💫 Доступные цены на радиочастотную терапию для красивой подтянутой кожи тела на аппарате EXION Body ⏩ Врачи с опытом 🧬 Современное оборудование.","EXION Body procedure for the body in Dnipro 🤍 GENEVITY 💫 Affordable prices for radiofrequency therapy for beautiful skin on the EXION Body device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "m22-stellar-black",
    h1:    m("Процедура M22 Stellar Black в Дніпрі","Процедура M22 Stellar Black в Днепре","M22 Stellar Black treatment in Dnipro"),
    title: m("Процедура на апараті M22 Stellar Black у Дніпрі – фотоомолодження та корекція дефектів шкіри","Процедура на аппарате M22 Stellar Black в Днепре – фотоомоложение и коррекция дефектов кожи","M22 Stellar Black procedure in Dnipro – photorejuvenation and correction of skin defects"),
    desc:  m("Процедура на апараті M22 Stellar Black для тіла в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на неінвазивну корекцію фігури та обличчя на апараті M22 Stellar Black ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура на аппарате M22 Stellar Black для тела в Днепре 🤍 GENEVITY 💫 Доступные цены на неинвазивную коррекцию фигуры и лица на аппарате M22 Stellar Black ⏩ Врачи с опытом 🧬 Современное оборудование.","M22 Stellar Black procedure for the body in Dnipro 🤍 GENEVITY 💫 Affordable prices for non-invasive figure correction and face on the M22 Stellar Black device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "splendor-x",
    h1:    m("Процедура Splendor X в Дніпрі","Процедура Splendor X в Днепре","Splendor X treatment in Dnipro"),
    title: m("Процедури на апараті Splendor X у Дніпрі – лазерне видалення волосся та омолодження шкіри","Процедуры на аппарате Splendor X в Днепре – лазерное удаление волос и омоложение кожи","Splender X procedure in Dnipro – laser hair removal and skin rejuvenation"),
    desc:  m("Процедура на апараті Splendor X для тіла в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на комплексне омолодження та корекцію дефектів шкіри на апараті Splendor X ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Процедура на аппарате Splendor X для тела в Днепре 🤍 GENEVITY 💫 Доступные цены на комплексное омоложение и коррекцию дефектов кожи на аппарате Splendor X ⏩ Врачи с опытом 🧬 Современное оборудование.","Splendor X procedure for the body in Dnipro 🤍 GENEVITY 💫 Affordable prices for comprehensive rejuvenation and correction of skin defects on the Splendor X device ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "hydrafacial",
    h1:    m("Комплексне очищення HydraFacial в Дніпрі","Комплексная чистка HydraFacial в Днепре","HydraFacial Comprehensive Cleansing in Dnipro"),
    title: m("Hydrafacial у Дніпрі – комплексне очищення HydraFacial","Hydrafacial в Днепре – комплексное очищение HydraFacial","Hydrafacial in Dnipro – comprehensive HydraFacial cleaning"),
    desc:  m("Очищення обличчя на апараті HydraFacial в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на апаратне очищення обличчя HydraFacial ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Чистка лица на аппарате HydraFacial в Днепре 🤍 GENEVITY 💫 Доступные цены на аппаратную чистку лица HydraFacial ⏩ Врачи с опытом 🧬 Современное оборудование.","HydraFacial facial cleansing in Dnipro 🤍 GENEVITY 💫 Affordable prices for HydraFacial facial cleansing ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "acupulse-co2",
    h1:    m("Лазерне шліфування AcuPulse CO₂ в Дніпрі","Лазерная шлифовка AcuPulse CO₂ в Днепре","AcuPulse CO₂ Laser Resurfacing in Dnipro"),
    title: m("Лазерне шліфування AcuPulse CO₂ у Дніпрі – лазерне шліфування на апараті AcuPulse CO₂","Лазерная шлифовка AcuPulse CO₂ в Днепре – лазерная шлифовкка на аппарате AcuPulse CO₂","AcuPulse CO₂ laser resurfacing in Dnipro – laser resurfacing on the AcuPulse CO₂ device"),
    desc:  m("Лазерне шліфування на апараті AcuPulse CO₂ в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на лазерне шліфування на апараті AcuPulse CO₂ ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Лазерная шлифовка на аппарате AcuPulse CO₂ в Днепре 🤍 GENEVITY 💫 Доступные цены на лазерную шлифовку на аппарате AcuPulse CO₂ ⏩ Врачи с опытом 🧬 Современное оборудование.","Laser resurfacing with AcuPulse CO₂ in Dnipro 🤍 GENEVITY 💫 Affordable prices for AcuPulse CO₂ laser resurfacing ⏩ Experienced doctors 🧬 Modern equipment.") },

  // Intimate zone
  { slug: "monopolar-rf-lifting",
    h1:    m("Монополярний RF-ліфтинг в Дніпрі","Монополярный RF-лифтинг в Днепре","Monopolar RF Lifting in Dnipro"),
    title: m("Монополярний RF-ліфтинг у Дніпрі – процедура глибокого омолодження та підтяжки шкіри","Монополярный RF-лифтинг в Днепре – процедура глубокого омоложения и подтяжки кожи","Monopolar RF-lifting in Dnipro – deep rejuvenation and skin tightening procedure"),
    desc:  m("Монополярний RF-ліфтинг у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на монополярний РФ ліфтинг ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Монополярный RF-лифтинг в Днепре 🤍 GENEVITY 💫 Доступные цены на монополярный РФ лифтинг ⏩ Врачи с опытом 🧬 Современное оборудование.","Monopolar RF-lifting in Dnipro 🤍 GENEVITY 💫 Affordable prices for monopolar RF lifting ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "acupulse-co2-intimate",
    h1:    m("Лазерне інтимне омолодження AcuPulse CO₂ в Дніпрі","Лазерное интимное омоложение AcuPulse CO₂ в Днепре","AcuPulse CO₂ Laser Intimate Rejuvenation in Dnipro"),
    title: m("Лазерне інтимне омолодження AcuPulse CO₂ у Дніпрі – лазерне інтимне омолодження CO₂","Лазерное интимное омоложение AcuPulse CO₂ в Днепре – лазерное интимное омоложение CO₂","AcuPulse CO₂ laser intimate rejuvenation in Dnipro – CO₂ laser intimate rejuvenation"),
    desc:  m("Інтимне омолодження лазером CO₂ AcuPulse в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на інтимне омолодження та післяпологове відновлення СО₂-лазером ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Интимное омоложение лазером CO₂ AcuPulse в Днепре 🤍 GENEVITY 💫 Доступные цены на интимное омоложение и послеродовое восстановление СО₂-лазером ⏩ Врачи с опытом 🧬 Современное оборудование.","Intimate rejuvenation with CO₂ laser AcuPulse in Dnipro 🤍 GENEVITY 💫 Affordable prices for intimate rejuvenation and postpartum recovery with CO₂ laser ⏩ Experienced doctors 🧬 Modern equipment.") },

  // Laser
  { slug: "laser-men",
    h1:    m("Лазерна епіляція для чоловіків в Дніпрі","Лазерная эпиляция для мужчин в Днепре","Laser Hair Removal for Men in Dnipro"),
    title: m("Лазерна епіляція для чоловіків у Дніпрі – чоловіча лазерна епіляція","Лазерная эпиляция для мужчин в Днепре – мужская лазерная эпиляция","Laser hair removal for men in Dnipro – men's laser hair removal"),
    desc:  m("Лазерна епіляція для чоловіків у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на лазерне видалення волосся для чоловіків ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Лазерная эпиляция для мужчин в Днепре 🤍 GENEVITY 💫 Доступные цены на лазерное удаление волос для мужчин ⏩ Врачи с опытом 🧬 Современное оборудование.","Laser hair removal for men in Dnipro 🤍 GENEVITY 💫 Affordable prices for laser hair removal for men ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "laser-women",
    h1:    m("Лазерна епіляція для жінок в Дніпрі","Лазерная эпиляция для женщин в Днепре","Laser Hair Removal for Women in Dnipro"),
    title: m("Лазерна епіляція для жінок у Дніпрі – жіноча лазерна епіляція","Лазерная эпиляция для женщин в Днепре – женская лазерная эпиляция","Laser hair removal for women in Dnipro – women's laser hair removal"),
    desc:  m("Лазерна епіляція для жінок у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на лазерне безболісне видалення волосся для жінок ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Лазерная эпиляция для женщин в Днепре 🤍 GENEVITY 💫 Доступные цены на лазерное безболезненное удаление волос для женщин ⏩ Врачи с опытом 🧬 Современное оборудование.","Laser hair removal for women in Dnipro 🤍 GENEVITY 💫 Affordable prices for laser hair removal for women ⏩ Experienced doctors 🧬 Modern equipment.") },

  // Longevity
  { slug: "check-up-40",
    h1:    m("Check-up 40+ в Дніпрі","Check-up 40+ в Днепре","40+ Check-up in Dnipro"),
    title: m("Чек-ап здоров'я після 40+ років у Дніпрі – скринінг здоров'я 40+","Чек-ап здоровья после 40+ лет в Днепре – скрининг здоровья 40+","Health check-up after 40+ years in Dnipro – health screening 40+"),
    desc:  m("Комплексна діагностика організму 40+ у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на комплексну діагностику організму після 40 років ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Комплексная диагностика организма 40+ в Днепре 🤍 GENEVITY 💫 Доступные цены на комплексную диагностику организма после 40 лет ⏩ Врачи с опытом 🧬 Современное оборудование.","Comprehensive body diagnostics 40+ in Dnipro 🤍 GENEVITY 💫 Affordable prices for comprehensive body diagnostics after 40 years ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "longevity-program",
    h1:    m("Програма довголіття Longevity в Дніпрі","Программа долголетия Longevity в Днепре","Longevity Program in Dnipro"),
    title: m("Програма довголіття Longevity у Дніпрі – програма здорове довголіття","Программа долголетия Longevity в Днепре – программа здоровое долголетие","Longevity program in Dnipro – healthy longevity program"),
    desc:  m("Програми активного довголіття Longevity у Дніпрі 🤍 GENEVITY 💫 Продовження молодості та підтримка здоров'я ⏩ Супровід лікарів.","Программы активного долголетия Longevity в Днепре 🤍 GENEVITY 💫 Продление молодости и поддержка здоровья ⏩ Сопровождение врачей.","Longevity active longevity programs in Dnipro 🤍 GENEVITY 💫 Continuation of youth and health support ⏩ Medical support.") },

  { slug: "hormonal-balance",
    h1:    m("Програма гормональний баланс в Дніпрі","Программа гормональный баланс в Днепре","Hormonal Balance Program in Dnipro"),
    title: m("Програма гормональний баланс у Дніпрі – відновлення гормонального здоров'я","Программа гормональный баланс в Днепре – восстановление гормонального здоровья","Hormonal balance program in Dnipro – restoration of hormonal health"),
    desc:  m("Програма відновлення гормонального балансу в Дніпрі 🤍 GENEVITY 💫 Діагностика, аналізи, індивідуальний план лікування та супровід лікарів ⏩ Поліпшення самопочуття та енергії.","Программа восстановления гормонального баланса в Днепре 🤍 GENEVITY 💫 Диагностика, анализы, индивидуальный план лечения и сопровождение врачей ⏩ Улучшение самочувствия и энергии.","Hormonal balance restoration program in Dnipro 🤍 GENEVITY 💫 Diagnostics, individual treatment plan and medical support ⏩ Improving well-being and energy.") },

  { slug: "iv-therapy",
    h1:    m("IV терапія в Дніпрі","IV терапия в Днепре","IV Therapy in Dnipro"),
    title: m("IV терапія у Дніпрі – внутрішньовенна вітамінна терапія","IV терапия в Днепре – внутривенная витаминная терапия","IV therapy in Dnipro – intravenous vitamin therapy"),
    desc:  m("IV терапія в Дніпрі 🤍 GENEVITY 💫 Внутрішньовенна вітамінна терапія для відновлення та зміцнення організму 💫 Доступні ціни на вітамінну терапію 🧬 Досвідчені лікарі.","IV терапия в Днепре 🤍 GENEVITY 💫 Внутривенная витаминная терапия для восстановления и укрепления организма 💫 Доступные цены на витаминную терапию 🧬 Врачи с опытом.","IV therapy in Dnipro 🤍 GENEVITY 💫 Intravenous vitamin therapy to restore and strengthen the body 💫 Affordable prices for vitamin therapy 🧬 Experienced doctors.") },

  { slug: "nutraceuticals",
    h1:    m("Нутриціолог в Дніпрі","Нутрициолог в Днепре","Nutritionist in Dnipro"),
    title: m("Нутриціолог у Дніпрі – консультація лікаря нутриціолога","Нутрициолог в Днепре – консультация врача нутрициолога","Nutritionist in Dnipro – consultation with a nutritionist"),
    desc:  m("Нутриціолог у Дніпрі 🤍 GENEVITY 💫 Консультація лікаря-нутриціолога за доступною ціною ⏩ Індивідуальний підбір харчування та аналіз стану організму 🧬 Лікарі з досвідом.","Нутрициолог в Днепре 🤍 GENEVITY 💫 Консультация врача-нутрициолога по доступной цене ⏩ Индивидуальный подбор питания и анализ состояния организма 🧬 Врачи с опытом.","Nutritionist in Dnipro 🤍 GENEVITY 💫 Consultation with a nutritionist at an affordable price ⏩ Individual nutrition selection and analysis of the body's condition 🧬 Experienced doctors.") },

  // Diagnostics
  { slug: "bioimpedance",
    h1:    m("Біоімпедансометрія в Дніпрі – діагностика складу тіла InBody","Биоимпедансометрия в Днепре – диагностика состава тела Inbody","Bioimpedance Analysis in Dnipro – InBody Body Composition Analysis"),
    title: m("Біоімпедансометрія в Дніпрі – діагностика складу тіла InBody","Биоимпедансометрия в Днепре – диагностика состава тела Inbody","Bioimpedance Analysis in Dnipro – InBody Body Composition Analysis"),
    desc:  m("Аналіз складу тіла в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на біоімпедансний аналіз складу тіла ⏩ Лікарі з досвідом 🧬 Процедура безболісна.","Анализ состава тела в Днепре 🤍 GENEVITY 💫 Доступные цены на биоимпедансный анализ состава тела ⏩ Врачи с опытом 🧬 Процедура безболезненна.","Body Composition Analysis in Dnipro 🤍 GENEVITY 💫 Affordable prices for bioimpedance body composition analysis ⏩ Experienced doctors 🧬 The procedure is painless.") },

  { slug: "ultrasound",
    h1:    m("УЗД в Дніпрі","УЗИ в Днепре","Ultrasound in Dnipro"),
    title: m("Ультразвукове дослідження в Дніпрі – Ціни на ультразвукову діагностику (УЗД)","Ультразвуковое исследование в Днепре – Цены на ультразвуковую диагностику (УЗД)","Ultrasound examination in Dnipro – Prices for ultrasound diagnostics (US)"),
    desc:  m("УЗД у Дніпрі 🤍 GENEVITY ✔️ Ультразвукове дослідження (УЗД) у Дніпрі – діагностика та консультації 💫 Доступна ціна ✨ Записатися на ультразвукову діагностику.","УЗД в Днепре 🤍 GENEVITY ✔️ Ультразвуковое исследование (УЗД) в Днепре – диагностика и консультации 💫 Доступная цена ✨ Записаться на ультразвуковую диагностику.","Ultrasound in Dnipro 🤍 GENEVITY ✔️ Ultrasound examinations in Dnipro – diagnostics and consultations 💫 Affordable prices ✨ Schedule an ultrasound appointment.") },

  { slug: "endocrinologist",
    h1:    m("Ендокринолог в Дніпрі","Эндокринолог в Днепре","Endocrinologist in Dnipro"),
    title: m("Ендокринолог у Дніпрі – консультація ендокринолога","Эндокринолог в Днепре – консультация эндокринолога","Endocrinologist in Dnipro – Endocrinologist consultation"),
    desc:  m("Консультація ендокринолога у Дніпрі 🤍 GENEVITY 💫 Доступна ціна на прийом до ендокринолога ✨ Записатися на прийом до ендокринолога.","Консультация эндокринолога в Днепре 🤍 GENEVITY 💫 Доступная цена на прием эндокринолога ✨ Записаться на прием к эндокринологу.","Endocrinologist consultation in Dnipro 🤍 GENEVITY 💫 Affordable price for an endocrinologist appointment ✨ Schedule an appointment with an endocrinologist.") },

  { slug: "cosmetologist",
    h1:    m("Косметолог в Дніпрі","Косметолог в Днепре","Cosmetologist in Dnipro"),
    title: m("Косметолог у Дніпрі – консультація косметолога","Косметолог в Днепре – консультация косметолога","Cosmetologist in Dnipro – Cosmetologist consultation"),
    desc:  m("Консультація косметолога в Дніпрі 🤍 GENEVITY 💫 Доступна ціна на прийом до косметолога ✨ Записатися на прийом до косметолога.","Консультация косметолога в Днепре 🤍 GENEVITY 💫 Доступная цена на прием косметолога ✨ Записаться на прием к косметологу.","Cosmetologist consultation in Dnipro 🤍 GENEVITY 💫 Affordable price for a cosmetologist appointment ✨ Schedule an appointment with a cosmetologist.") },

  { slug: "ultrasound-diagnostician",
    h1:    m("Лікар ультразвукової діагностики в Дніпрі","Врач ультразвуковой диагностики в Днепре","Ultrasound Diagnostician in Dnipro"),
    title: m("Лікар ультразвукової діагностики у Дніпрі – консультація лікаря УЗД","Врач ультразвуковой диагностики в Днепре – консультация врача УЗД","Ultrasound diagnostician in Dnipro – Ultrasound doctor consultation"),
    desc:  m("Консультація лікаря ультразвукової діагностики в Дніпрі 🤍 GENEVITY 💫 Доступна ціна на прийом лікаря УЗД ✨ Записатися на прийом до лікаря ультразвукової діагностики.","Консультация врача ультразвуковой диагностики в Днепре 🤍 GENEVITY 💫 Доступная цена на прием врача УЗД ✨ Записаться на прием к врачу ультразвуковой диагностики.","Ultrasound Diagnostics Consultation in Dnipro 🤍 GENEVITY 💫 Affordable prices for ultrasound appointments ✨ Book an appointment with an ultrasound specialist.") },
];

// ─── SERVICE CATEGORIES (title = h1, seo_title separate) ─────────────────────
const categories: CategoryMeta[] = [
  { slug: "injectable-cosmetology",
    h1:    m("Ін'єкційна косметологія в Дніпрі","Инъекционная косметология в Днепре","Injectable Cosmetology in Dnipro"),
    title: m("Ін'єкційна косметологія у Дніпрі – уколи краси для обличчя","Инъекционная косметология в Днепре – уколы красоты для лица","Injection cosmetology in Dnipro – beauty injections for the face"),
    desc:  m("Косметичні уколи для обличчя в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на уколи краси: ботокс, філери, біоревіталізація ⏩ Лікарі з досвідом 🧬 Сертифіковані препарати.","Косметические уколы для лица в Днепре 🤍 GENEVITY 💫 Доступные цены на уколы красоты: ботокс, филлеры, биоревитализация ⏩ Врачи с опытом 🧬 Сертифицированные препараты.","Cosmetic injections for the face in Dnipro 🤍 GENEVITY 💫 Affordable prices for beauty injections: Botox, fillers, biorevitalization ⏩ Doctors with experience 🧬 Certified drugs.") },

  { slug: "apparatus-cosmetology",
    h1:    m("Апаратна косметологія в Дніпрі","Аппаратная косметология в Днепре","Non-invasive Cosmetic Treatments in Dnipro"),
    title: m("Апаратна косметологія у Дніпрі – послуги апаратної косметології","Аппаратная косметология в Днепре – услуги аппаратной косметологии","Hardware cosmetology in Dnipro – hardware cosmetology services"),
    desc:  m("Сучасна апаратна косметологія в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на процедури апаратної косметології ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Современная аппаратная косметология в Днепре 🤍 GENEVITY 💫 Доступные цены на процедуры аппаратной косметологии ⏩ Врачи с опытом 🧬 Современное оборудование.","Modern hardware cosmetology in Dnipro 🤍 GENEVITY 💫 Affordable prices for hardware cosmetology procedures ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "intimate-rejuvenation",
    h1:    m("Апаратна косметологія для інтимних зон в Дніпрі","Аппаратная косметология для интимных зон в Днепре","Non-invasive cosmetic treatments for intimate areas in Dnipro"),
    title: m("Апаратна косметологія для інтимних зон у Дніпрі – послуги апаратної інтимної косметології","Аппаратная косметология для интимных зон в Днепре – услуги аппаратной интимной косметологии","Hardware cosmetology for intimate areas in Dnipro – hardware intimate cosmetology services"),
    desc:  m("Сучасна апаратна косметологія для інтимних зон у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на процедури апаратної косметології для інтимних зон ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Современная аппаратная косметология для интимных зон в Днепре 🤍 GENEVITY 💫 Доступные цены на процедуры аппаратной косметологии для интимных зон ⏩ Врачи с опытом 🧬 Современное оборудование.","Modern hardware cosmetology for intimate areas in Dnipro 🤍 GENEVITY 💫 Affordable prices for hardware cosmetology procedures for intimate areas ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "laser-hair-removal",
    h1:    m("Лазерна епіляція в Дніпрі","Лазерная эпиляция в Днепре","Laser Hair Removal in Dnipro"),
    title: m("Лазерна епіляція у Дніпрі – послуги лазерної епіляції","Лазерная эпиляция в Днепре – услуги лазерной эпиляции","Laser hair removal in Dnipro – laser services hair removal"),
    desc:  m("Лазерна епіляція в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на безболісну лазерну епіляцію ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Лазерная эпиляция в Днепре 🤍 GENEVITY 💫 Доступные цены на безболезненную лазерную эпиляцию ⏩ Врачи с опытом 🧬 Современное оборудование.","Laser hair removal in Dnipro 🤍 GENEVITY 💫 Affordable prices for laser hair removal ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "skincare",
    h1:    m("Доглядові процедури для обличчя в Дніпрі","Уходовые процедуры для лица в Днепре","Facial Treatments in Dnipro"),
    title: m("Доглядові процедури для обличчя в Дніпрі – процедури з догляду за обличчям","Уходовые процедуры для лица в Днепре – процедуры по уходу за лицом","Facial care procedures in Dnipro – facial care procedures"),
    desc:  m("Доглядові косметологічні процедури в Дніпрі 🤍 GENEVITY 💫 Доглядові процедури для обличчя у косметолога ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Уходовые косметологические процедуры в Днепре 🤍 GENEVITY 💫 Доступные цены на уходовые процедуры для лица у косметолога ⏩ Врачи с опытом 🧬 Современное оборудование.","Cosmetic care procedures in Dnipro 🤍 GENEVITY 💫 Facial care procedures from a cosmetologist ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "podology",
    h1:    m("Подолог в Дніпрі","Подолог в Днепре","Podiatrist in Dnipro"),
    title: m("Подолог у Дніпрі – послуги подолога","Подолог в Днепре – услуги подолога","Podiatrist in Dnipro – podiatrist services"),
    desc:  m("Прийом подолога в Дніпрі 🤍 GENEVITY 💫 Доступні ціни на послуги подолога ⏩ Лікарі з досвідом 🧬 Сучасне обладнання ✨ Запис на консультацію.","Прием подолога в Днепре 🤍 GENEVITY 💫 Доступные цены на услуги подолога ⏩ Врачи с опытом 🧬 Современное оборудование.✨ Запись на консультацию.","Flooring appointment in Dnipro 🤍 GENEVITY 💫 Affordable prices for flooring services ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "plastic-surgery",
    h1:    m("Пластична хірургія у Дніпрі","Пластическая хирургия в Днепре","Plastic Surgery in Dnipro"),
    title: m("Пластична хірургія у Дніпрі – послуги пластичного хірурга","Пластическая хирургия в Днепре – услуги пластического хирурга","Plastic surgery in Dnipro – plastic surgeon services"),
    desc:  m("Прийом пластичного хірурга в Дніпрі 🤍 GENEVITY 💫 Доступна вартість пластичної хірургії ⏩ Лікарі з досвідом ✨ Записатися до пластичного хірурга.","Прием пластического хирурга в Днепре 🤍 GENEVITY 💫 Доступная стоимость пластической хирургии ⏩ Врачи с опытом ✨ Записаться к пластическому хирургу.","Plastic surgeon appointment in Dnipro 🤍 GENEVITY 💫 Affordable cost of plastic surgery ⏩ Experienced doctors 🧬 Make an appointment with a plastic surgeon.") },
];

// ─── STATIC PAGES ─────────────────────────────────────────────────────────────
const staticPages: StaticMeta[] = [
  { slug: "home",
    h1:    m("GENEVITY — центр довголіття та естетичної медицини у Дніпрі","GENEVITY — центр долголетия и эстетической медицины в Днепре","GENEVITY — Center for Longevity and Aesthetic Medicine in Dnipro"),
    title: m("GENEVITY — центр довголіття, діагностики та естетичної медицини у Дніпрі","GENEVITY — центр долголетия, диагностики и эстетической медицины в Днепре","GENEVITY — Center of longevity, diagnostics and aesthetic medicine in Dnipro"),
    desc:  m("GENEVITY в Дніпрі 🤍 Центр довголіття, діагностики та естетичної медицини ✔️ Персональні програми здоров'я 💫 Превентивний підхід до омолодження.","GENEVITY в Днепре 🤍 Центр долголетия, диагностики и эстетической медицины ✔️ Персональные программы здоровья 💫 Превентивный подход к омоложению.","GENEVITY in Dnipro 🤍 Center for longevity, diagnostics and aesthetic medicine ✔️ Personal health programs 💫 Preventive approach to rejuvenation.") },

  { slug: "stationary",
    h1:    m("Стаціонар в Дніпрі","Стационар в Днепре","Inpatient Care in Dnipro"),
    title: m("Стаціонар у Дніпрі – послуги денного стаціонару","Стационар в Днепре – услуги дневного стационара","Inpatient in Dnipro – day hospital services"),
    desc:  m("Приватний стаціонар у Дніпрі 🤍 GENEVITY 💫 Доступні ціни на послуги денного стаціонару ⏩ Лікарі з досвідом 🧬 Сучасне обладнання.","Частный стационар в Днепре 🤍 GENEVITY 💫 Доступные цены на услуги дневного стационара ⏩ Врачи с опытом 🧬 Современное оборудование.","Private hospital in Dnipro 🤍 GENEVITY 💫 Affordable prices for day hospital services ⏩ Experienced doctors 🧬 Modern equipment.") },

  { slug: "laboratory",
    h1:    m("Лабораторія в Дніпрі","Лаборатория в Днепре","Laboratory in Dnipro"),
    title: m("Лабораторія у Дніпрі – здати аналізи швидко та точно","Лаборатория в Днепре – сдать анализы быстро и точно","Laboratory in Dnipro – take tests quickly and accurately"),
    desc:  m("Лабораторія в Дніпрі 🤍 GENEVITY 💫 Здати аналізи швидко та точно ⏩ Приватна лабораторія із сучасним обладнанням та доступними цінами 🧬 Широкий спектр досліджень.","Лаборатория в Днепре 🤍 GENEVITY 💫 Сдать анализы быстро и точно ⏩ Частная лаборатория с современным оборудованием и доступными ценами 🧬 Широкий спектр исследований.","Laboratory in Dnipro 🤍 GENEVITY 💫 Pass tests quickly and accurately ⏩ Private laboratory with modern equipment and affordable prices 🧬 A wide range of studies.") },

  { slug: "contacts",
    h1:    m("Контакти","Контакты","Contacts"),
    title: m("Контакти GENEVITY у Дніпрі – адреса, телефон, запис на прийом","Контакты GENEVITY в Днепре – адрес, телефон, запись на приём","GENEVITY contacts in Dnipro – address, phone, appointment"),
    desc:  m("Контакти 🤍 GENEVITY в Дніпрі 💫 Адреса, телефон та онлайн-запис ⏩ Зв'язок з лікарями та адміністрацією 🧬 Швидка консультація та допомога у записі.","Контакты 🤍 GENEVITY в Днепре 💫 Адрес, телефон и онлайн-запись ⏩ Связь с врачами и администрацией 🧬 Быстрая консультация и помощь в записи.","Contacts 🤍 GENEVITY in Dnipro 💫 Clinic, phone number and online appointment ⏩ Contact with doctors and administration 🧬 Quick consultation and assistance with appointment.") },

  { slug: "about",
    h1:    m("Про центр","О центре","About the Center"),
    title: m("Про центр Genevity у Дніпрі – превентивна медицина та діагностика організму","О центре Genevity в Днепре – превентивная медицина и диагностика организма","About the Genevity center in Dnipro – preventive medicine and body diagnostics"),
    desc:  m("Про центр Genevity в Дніпрі 🤍 Центр превентивної медицини та довголіття 💫 Комплексна діагностика організму, InBody-аналіз, гормональний баланс та апаратні технології ⏩ Підтримка здоров'я та профілактика старіння.","О центре Genevity в Днепре 🤍 Центр превентивной медицины и долголетия💫 Комплексная диагностика организма, InBody-анализ, гормональный баланс и аппаратные технологии ⏩ Поддержка здоровья и профилактика старения.","About the Genevity center in Dnipro 🤍 Center for preventive medicine 💫 Comprehensive diagnostics of the body, InBody analysis, hormonal balance and hardware technologies ⏩ Health maintenance and prevention of aging.") },

  { slug: "doctors",
    h1:    m("Лікарі","Врачи","Doctors"),
    title: m("Лікарі GENEVITY у Дніпрі – команда фахівців медичного центру","Врачи GENEVITY в Днепре – команда специалистов медицинского центра","GENEVITY doctors in Dnipro – team medical center specialists"),
    desc:  m("Лікарі 🤍 GENEVITY у Дніпрі 💫 Команда фахівців з превентивної медицини, діагностики та відновлення здоров'я ⏩ Ендокринологи, дерматологи, косметологи, УЗД, гастроентерологи та інші лікарі.","Врачи 🤍 GENEVITY в Днепре 💫 Команда специалистов по превентивной медицине, диагностике и восстановлению здоровья ⏩ Эндокринологи, дерматологи, кометологи, УЗИ, гастроэнтерологи и другие врачи.","Doctors 🤍 GENEVITY in Dnipro 💫 A team of specialists in preventive medicine, diagnostics and health restoration ⏩ Endocrinologists, dermatologists, ultrasound, gastroenterologists and other doctors.") },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let updated = 0;

  // Update services
  for (const s of services) {
    const r = await sql`
      UPDATE services SET
        h1_uk = ${s.h1.uk}, h1_ru = ${s.h1.ru}, h1_en = ${s.h1.en},
        seo_title_uk = ${s.title.uk}, seo_title_ru = ${s.title.ru}, seo_title_en = ${s.title.en},
        seo_desc_uk  = ${s.desc.uk},  seo_desc_ru  = ${s.desc.ru},  seo_desc_en  = ${s.desc.en}
      WHERE slug = ${s.slug}
    `;
    if (r.count === 0) console.warn(`  ⚠ service not found: ${s.slug}`);
    else updated++;
  }
  console.log(`✓ Services: ${updated} updated`);

  // Update service_categories (title = h1, seo_title separate)
  updated = 0;
  for (const c of categories) {
    const r = await sql`
      UPDATE service_categories SET
        title_uk = ${c.h1.uk}, title_ru = ${c.h1.ru}, title_en = ${c.h1.en},
        seo_title_uk = ${c.title.uk}, seo_title_ru = ${c.title.ru}, seo_title_en = ${c.title.en},
        seo_desc_uk  = ${c.desc.uk},  seo_desc_ru  = ${c.desc.ru},  seo_desc_en  = ${c.desc.en}
      WHERE slug = ${c.slug}
    `;
    if (r.count === 0) console.warn(`  ⚠ category not found: ${c.slug}`);
    else updated++;
  }
  console.log(`✓ Categories: ${updated} updated`);

  // Update static pages
  updated = 0;
  for (const p of staticPages) {
    const r = await sql`
      UPDATE static_pages SET
        h1_uk = ${p.h1.uk}, h1_ru = ${p.h1.ru}, h1_en = ${p.h1.en},
        seo_title_uk = ${p.title.uk}, seo_title_ru = ${p.title.ru}, seo_title_en = ${p.title.en},
        seo_desc_uk  = ${p.desc.uk},  seo_desc_ru  = ${p.desc.ru},  seo_desc_en  = ${p.desc.en}
      WHERE slug = ${p.slug}
    `;
    if (r.count === 0) console.warn(`  ⚠ static page not found: ${p.slug}`);
    else updated++;
  }
  console.log(`✓ Static pages: ${updated} updated`);

  const total = services.length + categories.length + staticPages.length;
  console.log(`\n✅ Done — ${total} pages updated across UA/RU/EN.`);
  console.log(`   Legal docs (license, air-raid-rules, privacy-policy) skipped — no SEO columns yet.`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
