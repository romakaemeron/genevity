/**
 * Creates 4 missing service category pages: skincare, podology, diagnostics, plastic-surgery.
 * Run: npx tsx scripts/seed-missing-categories.ts
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

type RichTextSection = { type: "richText"; heading: L; body: L };
type BulletsSection = { type: "bullets"; heading: L; items: L[] };
type StepsSection = { type: "steps"; heading: L; steps: { title: L; description: L }[] };
type IndicationsSection = {
  type: "indicationsContraindications";
  indicationsHeading: L;
  indications: L[];
  contraindicationsHeading: L;
  contraindications: L[];
};
type AnySection = RichTextSection | BulletsSection | StepsSection | IndicationsSection;

function sectionData(s: AnySection): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "indicationsContraindications") return {
    indicationsHeading: s.indicationsHeading,
    indications: s.indications,
    contraindicationsHeading: s.contraindicationsHeading,
    contraindications: s.contraindications,
  };
  return {};
}

interface CategorySeed {
  slug: string;
  sort_order: number;
  clickable: boolean;
  title: L;
  summary?: L;
  seo_title: L;
  seo_desc: L;
  seo_keywords: L;
  sections: AnySection[];
  faqs: { question: L; answer: L }[];
}

// ─── CATEGORY 1: SKINCARE ─────────────────────────────────────────────────────
const skincare: CategorySeed = {
  slug: "skincare",
  sort_order: 10,
  clickable: true,
  title: {
    uk: "Доглядові процедури",
    ru: "Уходовые процедуры",
    en: "Skincare Treatments",
  },
  seo_title: {
    uk: "Доглядові процедури для обличчя у Дніпрі — пілінги, маски, апаратні методики",
    ru: "Уходовые процедуры для лица в Днепре — пилинги, маски, аппаратные методики",
    en: "Skincare Treatments for Face in Dnipro — Peels, Masks, Apparatus Methods",
  },
  seo_desc: {
    uk: "Професійні доглядові процедури для обличчя в GENEVITY: пілінги, маски, мікротоки, ультразвук, RF-ліфтинг. Догляд під типом шкіри. Дніпро.",
    ru: "Профессиональные уходовые процедуры для лица в GENEVITY: пилинги, маски, микротоки, ультразвук, RF-лифтинг. Уход под тип кожи. Днепр.",
    en: "Professional skincare treatments for the face at GENEVITY: peels, masks, microcurrent, ultrasound, RF lifting. Tailored to your skin type. Dnipro.",
  },
  seo_keywords: {
    uk: "процедури догляду за обличчям, процедури догляду, процедури з догляду за шкірою обличчя, процедури догляду у косметолога, доглядові процедури косметологія",
    ru: "процедуры по уходу за лицом, уходовые процедуры, уходовые процедуры косметолога, косметологические процедуры уход за кожей",
    en: "facial skincare treatments, skincare procedures, professional face care, skincare cosmetology Dnipro",
  },
  sections: [
    {
      type: "richText",
      heading: {
        uk: "Що таке доглядові процедури для обличчя?",
        ru: "Что такое уходовые процедуры для лица?",
        en: "What Are Professional Skincare Treatments?",
      },
      body: {
        uk: "Доглядові процедури для обличчя — це комплекс медичних косметологічних маніпуляцій, спрямованих на підтримання та покращення стану шкіри. На відміну від домашнього догляду, професійні процедури використовують концентровані активні речовини, медичне обладнання та протоколи, недоступні у побуті.\n\nОсновні категорії доглядових процедур:\n\nПілінги — механічний, хімічний і фізичний. Механічний пілінг використовує абразивні частинки або апаратний ефект для видалення ороговілих клітин. Хімічний пілінг застосовує кислоти (АНА, ВНА, TCA) різних концентрацій для ексфоліації та стимуляції оновлення шкіри. Фізичний пілінг задіює ультразвук або лазерну енергію для безконтактного очищення.\n\nМаски — альгінатні, з екзосомами, з ретиноїдами. Альгінатні маски створюють оклюзійний шар, посилюючи проникнення активних компонентів. Маски з екзосомами містять нанопузирці клітинного походження, що прискорюють регенерацію тканин. Маски з ретиноїдами стимулюють синтез колагену та прискорюють клітинне оновлення.\n\nАпаратні методики — мікроструми, ультразвук, RF-ліфтинг. Мікроструми передають у тканини слабкі електричні імпульси, що тонізують м'язи та активують лімфодренаж. Ультразвукова чистка використовує кавітацію та фонофорез для глибокого очищення пор. RF-ліфтинг прогріває дерму радіохвилями, стимулюючи вироблення колагену.\n\nПовний алгоритм доглядової процедури: консультація → діагностика шкіри → очищення → ексфоліація → введення активних сироваток → масаж → маска → завершальний догляд (сонцезахисний крем / зволожувач).",
        ru: "Уходовые процедуры для лица — это комплекс медицинских косметологических манипуляций, направленных на поддержание и улучшение состояния кожи. В отличие от домашнего ухода, профессиональные процедуры используют концентрированные активные вещества, медицинское оборудование и протоколы, недоступные в быту.\n\nОсновные категории уходовых процедур:\n\nПилинги — механический, химический и физический. Механический пилинг использует абразивные частицы или аппаратный эффект для удаления ороговевших клеток. Химический пилинг применяет кислоты (АНА, ВНА, TCA) различных концентраций для эксфолиации и стимуляции обновления кожи. Физический пилинг задействует ультразвук или лазерную энергию для бесконтактного очищения.\n\nМаски — альгинатные, с экзосомами, с ретиноидами. Альгинатные маски создают окклюзионный слой, усиливая проникновение активных компонентов. Маски с экзосомами содержат нановезикулы клеточного происхождения, ускоряющие регенерацию тканей. Маски с ретиноидами стимулируют синтез коллагена и ускоряют клеточное обновление.\n\nАппаратные методики — микротоки, ультразвук, RF-лифтинг. Микротоки передают в ткани слабые электрические импульсы, тонизирующие мышцы и активирующие лимфодренаж. Ультразвуковая чистка использует кавитацию и фонофорез для глубокого очищения пор. RF-лифтинг прогревает дерму радиоволнами, стимулируя выработку коллагена.\n\nПолный алгоритм уходовой процедуры: консультация → диагностика кожи → очищение → эксфолиация → введение активных сывороток → массаж → маска → завершающий уход (солнцезащитный крем / увлажнитель).",
        en: "Professional skincare treatments are a set of medical cosmetic procedures aimed at maintaining and improving skin condition. Unlike home care, professional treatments use concentrated active ingredients, medical equipment, and protocols unavailable for everyday use.\n\nMain categories of skincare treatments:\n\nPeels — mechanical, chemical, and physical. Mechanical peeling uses abrasive particles or apparatus effects to remove dead skin cells. Chemical peeling applies acids (AHA, BHA, TCA) at various concentrations for exfoliation and skin renewal stimulation. Physical peeling uses ultrasound or laser energy for contactless cleansing.\n\nMasks — alginate, exosome, retinoid. Alginate masks create an occlusive layer, enhancing the penetration of active components. Exosome masks contain cell-derived nanovesicles that accelerate tissue regeneration. Retinoid masks stimulate collagen synthesis and accelerate cellular renewal.\n\nApparatus techniques — microcurrent, ultrasound, RF lifting. Microcurrents transmit weak electrical impulses to tissues, toning muscles and activating lymphatic drainage. Ultrasonic cleansing uses cavitation and phonophoresis for deep pore cleansing. RF lifting heats the dermis with radio waves, stimulating collagen production.\n\nFull skincare procedure algorithm: consultation → skin diagnostics → cleansing → exfoliation → active serum application → massage → mask → finishing care (sunscreen / moisturiser).",
      },
    },
    {
      type: "bullets",
      heading: {
        uk: "Основні види доглядових процедур у GENEVITY",
        ru: "Основные виды уходовых процедур в GENEVITY",
        en: "Key Skincare Treatments at GENEVITY",
      },
      items: [
        {
          uk: "Хімічний пілінг — кислотна ексфоліація, вирівнювання текстури та тону шкіри",
          ru: "Химический пилинг — кислотная эксфолиация, выравнивание текстуры и тона кожи",
          en: "Chemical peel — acid exfoliation, texture and skin tone evening",
        },
        {
          uk: "Альгінатна маска — глибоке зволоження, заспокоєння роздратованої шкіри",
          ru: "Альгинатная маска — глубокое увлажнение, успокоение раздражённой кожи",
          en: "Alginate mask — deep hydration, soothing irritated skin",
        },
        {
          uk: "Маска з екзосомами — регенерація клітин, відновлення після агресивних процедур",
          ru: "Маска с экзосомами — регенерация клеток, восстановление после агрессивных процедур",
          en: "Exosome mask — cell regeneration, recovery after intensive procedures",
        },
        {
          uk: "Маска з ретиноїдами — оновлення клітин, корекція пігментації та дрібних зморшок",
          ru: "Маска с ретиноидами — обновление клеток, коррекция пигментации и мелких морщин",
          en: "Retinoid mask — cell renewal, correction of pigmentation and fine lines",
        },
        {
          uk: "Мікроструми — ліфтинг м'язів обличчя, активація лімфодренажу",
          ru: "Микротоки — лифтинг мышц лица, активация лимфодренажа",
          en: "Microcurrent — facial muscle lifting, lymphatic drainage activation",
        },
        {
          uk: "Ультразвукова чистка — глибоке очищення пор без травмування шкіри",
          ru: "Ультразвуковая чистка — глубокое очищение пор без травмирования кожи",
          en: "Ultrasonic cleansing — deep pore cleansing without skin trauma",
        },
        {
          uk: "RF-ліфтинг обличчя — радіочастотне тонізування та підтяжка шкіри",
          ru: "RF-лифтинг лица — радиочастотное тонизирование и подтяжка кожи",
          en: "RF lifting for face — radiofrequency toning and skin tightening",
        },
      ],
    },
    {
      type: "indicationsContraindications",
      indicationsHeading: {
        uk: "Показання до доглядових процедур",
        ru: "Показания к уходовым процедурам",
        en: "Indications for Skincare Treatments",
      },
      indications: [
        {
          uk: "Тьмяна та зневоднена шкіра, що потребує зволоження та відновлення",
          ru: "Тусклая и обезвоженная кожа, нуждающаяся в увлажнении и восстановлении",
          en: "Dull and dehydrated skin in need of hydration and restoration",
        },
        {
          uk: "Збільшені пори, надмірний жирний блиск",
          ru: "Расширенные поры, чрезмерный жирный блеск",
          en: "Enlarged pores, excessive oily shine",
        },
        {
          uk: "Перші ознаки старіння, поверхневі зморшки",
          ru: "Первые признаки старения, поверхностные морщины",
          en: "Early signs of ageing, superficial wrinkles",
        },
        {
          uk: "Нерівна текстура та нерівномірний тон шкіри",
          ru: "Неровная текстура и неравномерный тон кожи",
          en: "Uneven skin texture and skin tone",
        },
        {
          uk: "Чутлива шкіра, що потребує заспокоєння та бар'єрного відновлення",
          ru: "Чувствительная кожа, нуждающаяся в успокоении и барьерном восстановлении",
          en: "Sensitive skin requiring soothing and barrier restoration",
        },
        {
          uk: "Підготовка до більш інтенсивних косметологічних процедур",
          ru: "Подготовка к более интенсивным косметологическим процедурам",
          en: "Preparation for more intensive cosmetic procedures",
        },
      ],
      contraindicationsHeading: {
        uk: "Протипоказання",
        ru: "Противопоказания",
        en: "Contraindications",
      },
      contraindications: [
        {
          uk: "Гострі запальні процеси в зоні обробки",
          ru: "Острые воспалительные процессы в зоне обработки",
          en: "Acute inflammatory processes in the treatment area",
        },
        {
          uk: "Герпес у стадії загострення",
          ru: "Герпес в стадии обострения",
          en: "Active herpes outbreak",
        },
        {
          uk: "Вагітність (для деяких видів пілінгів)",
          ru: "Беременность (для некоторых видов пилингов)",
          en: "Pregnancy (for certain types of peels)",
        },
        {
          uk: "Онкологічні захворювання",
          ru: "Онкологические заболевания",
          en: "Oncological diseases",
        },
      ],
    },
    {
      type: "bullets",
      heading: {
        uk: "Як обрати доглядову процедуру?",
        ru: "Как выбрать уходовую процедуру?",
        en: "How to Choose a Skincare Treatment?",
      },
      items: [
        {
          uk: "Тьмяна суха шкіра → Альгінатна маска + зволожуюча сироватка",
          ru: "Тусклая сухая кожа → Альгинатная маска + увлажняющая сыворотка",
          en: "Dull dry skin → Alginate mask + hydrating serum",
        },
        {
          uk: "Жирна шкіра, розширені пори → Хімічний пілінг + ультразвукова чистка",
          ru: "Жирная кожа, расширенные поры → Химический пилинг + ультразвуковая чистка",
          en: "Oily skin, enlarged pores → Chemical peel + ultrasonic cleansing",
        },
        {
          uk: "Перші зморшки, птоз → Мікроструми + RF-ліфтинг",
          ru: "Первые морщины, птоз → Микротоки + RF-лифтинг",
          en: "Early wrinkles, ptosis → Microcurrent + RF lifting",
        },
        {
          uk: "Запалення, акне → Очищення + заспокійлива маска (без агресивних методів)",
          ru: "Воспаления, акне → Очищение + успокаивающая маска (без агрессивных методов)",
          en: "Inflammation, acne → Cleansing + soothing mask (no aggressive methods)",
        },
        {
          uk: "Лікар підбирає програму після діагностики шкіри на консультації",
          ru: "Врач подбирает программу после диагностики кожи на консультации",
          en: "The doctor selects the programme after skin diagnostics at consultation",
        },
      ],
    },
  ],
  faqs: [
    {
      question: {
        uk: "Які доглядові процедури підходять для чутливої шкіри?",
        ru: "Какие уходовые процедуры подходят для чувствительной кожи?",
        en: "Which skincare treatments are suitable for sensitive skin?",
      },
      answer: {
        uk: "Для чутливої шкіри найкраще підходять альгінатні маски, мікрострумовий ліфтинг та м'які зволожуючі протоколи без агресивної ексфоліації. Хімічні пілінги та ультразвук застосовуються з мінімальними концентраціями активних речовин. Лікар підбирає склад сироваток та маски з урахуванням типу шкіри і реактивності.",
        ru: "Для чувствительной кожи лучше всего подходят альгинатные маски, микротоковый лифтинг и мягкие увлажняющие протоколы без агрессивной эксфолиации. Химические пилинги и ультразвук применяются с минимальными концентрациями активных веществ. Врач подбирает состав сывороток и маски с учётом типа кожи и реактивности.",
        en: "For sensitive skin, alginate masks, microcurrent lifting, and gentle hydrating protocols without aggressive exfoliation are most suitable. Chemical peels and ultrasound are applied with minimal active ingredient concentrations. The doctor selects serum and mask formulations based on skin type and reactivity.",
      },
    },
    {
      question: {
        uk: "Як часто рекомендується проходити доглядові процедури?",
        ru: "Как часто рекомендуется проходить уходовые процедуры?",
        en: "How often should skincare treatments be done?",
      },
      answer: {
        uk: "Оптимальна частота залежить від типу шкіри та обраної процедури. Базовий догляд (очищення + зволоження) — щомісяця. Хімічні пілінги — 1 раз на 2–4 тижні курсом 3–6 процедур. Підтримуючий RF-ліфтинг або мікроструми — 1 раз на 3–4 тижні. Лікар складає індивідуальний план під час консультації.",
        ru: "Оптимальная частота зависит от типа кожи и выбранной процедуры. Базовый уход (очищение + увлажнение) — ежемесячно. Химические пилинги — 1 раз в 2–4 недели курсом 3–6 процедур. Поддерживающий RF-лифтинг или микротоки — 1 раз в 3–4 недели. Врач составляет индивидуальный план во время консультации.",
        en: "The optimal frequency depends on skin type and the chosen procedure. Basic care (cleansing + hydration) — monthly. Chemical peels — once every 2–4 weeks in a course of 3–6 procedures. Maintenance RF lifting or microcurrent — once every 3–4 weeks. The doctor creates an individual plan during consultation.",
      },
    },
    {
      question: {
        uk: "Чи можна поєднувати різні види доглядових процедур?",
        ru: "Можно ли сочетать разные виды уходовых процедур?",
        en: "Can different types of skincare treatments be combined?",
      },
      answer: {
        uk: "Так, поєднання процедур дає комплексний результат. Наприклад: ультразвукова чистка + хімічний пілінг + зволожуюча маска — класичний комплекс глибокого очищення. Мікроструми + RF-ліфтинг + альгінатна маска — підтягуючий протокол. Лікар підбирає комбінацію з урахуванням типу та стану шкіри.",
        ru: "Да, сочетание процедур даёт комплексный результат. Например: ультразвуковая чистка + химический пилинг + увлажняющая маска — классический комплекс глубокого очищения. Микротоки + RF-лифтинг + альгинатная маска — подтягивающий протокол. Врач подбирает комбинацию с учётом типа и состояния кожи.",
        en: "Yes, combining procedures yields comprehensive results. For example: ultrasonic cleansing + chemical peel + hydrating mask — classic deep cleansing complex. Microcurrent + RF lifting + alginate mask — a firming protocol. The doctor selects the combination based on skin type and condition.",
      },
    },
    {
      question: {
        uk: "Які результати можна очікувати після першої доглядової процедури?",
        ru: "Каких результатов можно ожидать после первой уходовой процедуры?",
        en: "What results can be expected after the first skincare treatment?",
      },
      answer: {
        uk: "Після першого сеансу шкіра виглядає свіжішою, більш зволоженою та зовні відпочилою. Вирівнюється тон, звужуються видимі пори, зникає тьмяність. Стійкий ефект — покращення якості та здоров'я шкіри — накопичується після курсу 4–6 процедур.",
        ru: "После первого сеанса кожа выглядит свежее, более увлажнённой и внешне отдохнувшей. Выравнивается тон, сужаются видимые поры, исчезает тусклость. Устойчивый эффект — улучшение качества и здоровья кожи — накапливается после курса 4–6 процедур.",
        en: "After the first session, skin looks fresher, more hydrated and visibly rested. Skin tone evens out, visible pores narrow, and dullness disappears. The lasting effect — improved skin quality and health — accumulates after a course of 4–6 procedures.",
      },
    },
    {
      question: {
        uk: "Чи є вікові обмеження для доглядових процедур?",
        ru: "Есть ли возрастные ограничения для уходовых процедур?",
        en: "Are there age restrictions for skincare treatments?",
      },
      answer: {
        uk: "Доглядові процедури не мають суворих вікових обмежень. Їх призначають починаючи з підліткового віку при проблемній шкірі (акне, підвищена жирність) і до будь-якого зрілого віку. Склад і інтенсивність процедури підбираються лікарем відповідно до потреб шкіри.",
        ru: "Уходовые процедуры не имеют строгих возрастных ограничений. Их назначают начиная с подросткового возраста при проблемной коже (акне, повышенная жирность) и до любого зрелого возраста. Состав и интенсивность процедуры подбираются врачом в соответствии с потребностями кожи.",
        en: "Skincare treatments have no strict age restrictions. They are prescribed from adolescence for problem skin (acne, excess oiliness) through to any adult age. The composition and intensity of the procedure are selected by the doctor according to the skin's needs.",
      },
    },
  ],
};

// ─── CATEGORY 2: PODOLOGY ─────────────────────────────────────────────────────
const podology: CategorySeed = {
  slug: "podology",
  sort_order: 11,
  clickable: true,
  title: {
    uk: "Подологія",
    ru: "Подология",
    en: "Podology",
  },
  seo_title: {
    uk: "Подологія у Дніпрі — послуги подолога, лікування нігтів та стоп",
    ru: "Подология в Днепре — услуги подолога, лечение ногтей и стоп",
    en: "Podology in Dnipro — Podologist Services, Nail and Foot Treatment",
  },
  seo_desc: {
    uk: "Медична подологія в GENEVITY: лікування врослого нігтя, грибка, мозолів, тріщин п'ят. Апаратний манікюр/педикюр. Запис у Дніпрі.",
    ru: "Медицинская подология в GENEVITY: лечение вросшего ногтя, грибка, мозолей, трещин пяток. Аппаратный маникюр/педикюр. Запись в Днепре.",
    en: "Medical podology at GENEVITY: treatment of ingrown nails, fungal infections, calluses, heel cracks. Apparatus manicure/pedicure. Book in Dnipro.",
  },
  seo_keywords: {
    uk: "подолог, послуги подолога, прайс на послуги подолога, скільки коштують послуги подолога, ціни на послуги подолога, подологія дніпро",
    ru: "подолог, услуги подолога, прайс на услуги подолога, сколько стоят услуги подолога, цены на услуги подолога, подология днепр",
    en: "podologist, podology services, podiatrist Dnipro, nail treatment, foot care clinic",
  },
  sections: [
    {
      type: "richText",
      heading: {
        uk: "Хто такий подолог і які послуги він надає",
        ru: "Кто такой подолог и какие услуги он оказывает",
        en: "Who Is a Podologist and What Services Do They Provide",
      },
      body: {
        uk: "Подолог (podiatrist) — це медичний фахівець, який спеціалізується на діагностиці та лікуванні захворювань і патологій стоп, нігтів та нижніх кінцівок. На відміну від косметичного педикюру, медична подологія вирішує реальні клінічні проблеми: вростання нігтів, грибкові ураження, мозолі та натоптні, тріщини п'ят, деформації стоп.\n\nПодологія — це не пов'язана з естетикою, а суто медична спеціальність. Подолог оцінює біомеханіку ходи, ризик ускладнень (особливо у пацієнтів з цукровим діабетом та захворюваннями судин) і призначає індивідуальне лікування.\n\nВ GENEVITY подологічні послуги надаються з використанням апаратного обладнання нового покоління, стерильних одноразових інструментів та доказових медичних протоколів. Кожен пацієнт отримує повний огляд і план лікування перед початком маніпуляцій.",
        ru: "Подолог (podiatrist) — это медицинский специалист, специализирующийся на диагностике и лечении заболеваний и патологий стоп, ногтей и нижних конечностей. В отличие от косметического педикюра, медицинская подология решает реальные клинические проблемы: вросший ноготь, грибковые поражения, мозоли и натоптыши, трещины пяток, деформации стоп.\n\nПодология — это не связанная с эстетикой, а сугубо медицинская специальность. Подолог оценивает биомеханику ходьбы, риск осложнений (особенно у пациентов с сахарным диабетом и заболеваниями сосудов) и назначает индивидуальное лечение.\n\nВ GENEVITY подологические услуги оказываются с использованием аппаратного оборудования нового поколения, стерильных одноразовых инструментов и доказательных медицинских протоколов. Каждый пациент получает полный осмотр и план лечения перед началом манипуляций.",
        en: "A podologist (podiatrist) is a medical specialist who focuses on diagnosing and treating diseases and pathologies of the feet, nails and lower limbs. Unlike cosmetic pedicure, medical podology addresses real clinical problems: ingrown nails, fungal infections, calluses and corns, heel cracks, and foot deformities.\n\nPodology is a purely medical specialty, not an aesthetic one. The podologist assesses gait biomechanics, the risk of complications (especially in patients with diabetes and vascular disease), and prescribes individual treatment.\n\nAt GENEVITY, podological services are provided using next-generation apparatus equipment, sterile single-use instruments, and evidence-based medical protocols. Every patient receives a full examination and treatment plan before any procedures begin.",
      },
    },
    {
      type: "bullets",
      heading: {
        uk: "Основні послуги подолога в GENEVITY",
        ru: "Основные услуги подолога в GENEVITY",
        en: "Key Podology Services at GENEVITY",
      },
      items: [
        {
          uk: "Апаратний педикюр — безпечна обробка нігтів та шкіри стоп за медичним протоколом",
          ru: "Аппаратный педикюр — безопасная обработка ногтей и кожи стоп по медицинскому протоколу",
          en: "Apparatus pedicure — safe nail and foot skin treatment following medical protocol",
        },
        {
          uk: "Лікування врослого нігтя — без операції, з коригуючими системами",
          ru: "Лечение вросшего ногтя — без операции, с корригирующими системами",
          en: "Ingrown nail treatment — without surgery, using corrective systems",
        },
        {
          uk: "Лікування грибкових уражень нігтів і шкіри (оніхомікоз, мікоз)",
          ru: "Лечение грибковых поражений ногтей и кожи (онихомикоз, микоз)",
          en: "Treatment of fungal nail and skin infections (onychomycosis, mycosis)",
        },
        {
          uk: "Видалення мозолів та натоптних — апаратним методом без болю",
          ru: "Удаление мозолей и натоптышей — аппаратным методом без боли",
          en: "Callus and corn removal — painless apparatus method",
        },
        {
          uk: "Лікування тріщин п'ят — апаратне + медикаментозне",
          ru: "Лечение трещин пяток — аппаратное + медикаментозное",
          en: "Heel crack treatment — apparatus and medicinal combined",
        },
        {
          uk: "Протезування нігтів при травмах та деформаціях",
          ru: "Протезирование ногтей при травмах и деформациях",
          en: "Nail prosthetics for injuries and deformities",
        },
        {
          uk: "Дитяча подологія — деформації стоп, плоскостопість",
          ru: "Детская подология — деформации стоп, плоскостопие",
          en: "Paediatric podology — foot deformities, flat feet",
        },
      ],
    },
    {
      type: "steps",
      heading: {
        uk: "Як проходить прийом у подолога",
        ru: "Как проходит приём у подолога",
        en: "How a Podologist Appointment Works",
      },
      steps: [
        {
          title: {
            uk: "Консультація та анамнез",
            ru: "Консультация и анамнез",
            en: "Consultation and medical history",
          },
          description: {
            uk: "Лікар оцінює стан стоп та нігтів, з'ясовує скарги та медичну історію, включаючи наявність системних захворювань.",
            ru: "Врач оценивает состояние стоп и ногтей, выясняет жалобы и медицинскую историю, включая наличие системных заболеваний.",
            en: "The doctor assesses the condition of feet and nails, clarifies complaints and medical history, including any systemic conditions.",
          },
        },
        {
          title: {
            uk: "Діагностика",
            ru: "Диагностика",
            en: "Diagnostics",
          },
          description: {
            uk: "Визначення типу проблеми, ступеня ураження, призначення аналізів при необхідності (наприклад, зіскрібок на грибок).",
            ru: "Определение типа проблемы, степени поражения, назначение анализов при необходимости (например, соскоб на грибок).",
            en: "Determining the type of problem, extent of damage, and ordering tests if necessary (e.g., fungal scraping).",
          },
        },
        {
          title: {
            uk: "Процедура",
            ru: "Процедура",
            en: "Procedure",
          },
          description: {
            uk: "Проводиться необхідне лікування: апаратне видалення, корекція нігтьової пластини, медикаментозна обробка.",
            ru: "Проводится необходимое лечение: аппаратное удаление, коррекция ногтевой пластины, медикаментозная обработка.",
            en: "The required treatment is performed: apparatus removal, nail plate correction, medicinal treatment.",
          },
        },
        {
          title: {
            uk: "Рекомендації",
            ru: "Рекомендации",
            en: "Recommendations",
          },
          description: {
            uk: "Лікар надає план домашнього догляду, призначає препарати за потреби та визначає терміни контрольного візиту.",
            ru: "Врач предоставляет план домашнего ухода, назначает препараты при необходимости и определяет сроки контрольного визита.",
            en: "The doctor provides a home care plan, prescribes medications if needed, and sets the timing for a follow-up visit.",
          },
        },
      ],
    },
    {
      type: "bullets",
      heading: {
        uk: "Показання для звернення до подолога",
        ru: "Показания для обращения к подологу",
        en: "Indications for Seeing a Podologist",
      },
      items: [
        {
          uk: "Вростання нігтя — біль, почервоніння, запалення кутків нігтьової пластини",
          ru: "Вросший ноготь — боль, покраснение, воспаление углов ногтевой пластины",
          en: "Ingrown nail — pain, redness, inflammation at the nail corners",
        },
        {
          uk: "Грибкові ураження нігтів (оніхомікоз) — потовщення, зміна кольору, кришення",
          ru: "Грибковые поражения ногтей (онихомикоз) — утолщение, изменение цвета, крошение",
          en: "Fungal nail infection (onychomycosis) — thickening, colour change, crumbling",
        },
        {
          uk: "Мозолі та натоптні — болючі ущільнення на підошві або пальцях стопи",
          ru: "Мозоли и натоптыши — болезненные уплотнения на подошве или пальцах стопы",
          en: "Calluses and corns — painful hardened skin on the sole or toes",
        },
        {
          uk: "Тріщини п'ят — особливо глибокі та болючі, що кровоточать",
          ru: "Трещины пяток — особенно глубокие и болезненные, кровоточащие",
          en: "Heel cracks — especially deep, painful, and bleeding cracks",
        },
        {
          uk: "Сухість та огрубіння шкіри стоп, гіперкератоз підошовної поверхні",
          ru: "Сухость и огрубение кожи стоп, гиперкератоз подошвенной поверхности",
          en: "Dry and rough foot skin, plantar hyperkeratosis",
        },
        {
          uk: "Деформації нігтів після травм або хімічного ураження",
          ru: "Деформации ногтей после травм или химического поражения",
          en: "Nail deformities following trauma or chemical damage",
        },
      ],
    },
  ],
  faqs: [
    {
      question: {
        uk: "Які проблеми вирішує подолог?",
        ru: "Какие проблемы решает подолог?",
        en: "What problems does a podologist treat?",
      },
      answer: {
        uk: "Подолог лікує: вростання нігтів, грибкові ураження нігтів і шкіри стоп (оніхомікоз, мікоз), мозолі та натоптні, тріщини п'ят, деформації нігтів, гіперкератоз підошов. Також проводить апаратний медичний педикюр для пацієнтів з діабетом, захворюваннями судин та порушеннями чутливості стоп.",
        ru: "Подолог лечит: вросший ноготь, грибковые поражения ногтей и кожи стоп (онихомикоз, микоз), мозоли и натоптыши, трещины пяток, деформации ногтей, гиперкератоз подошв. Также проводит аппаратный медицинский педикюр для пациентов с диабетом, заболеваниями сосудов и нарушениями чувствительности стоп.",
        en: "A podologist treats: ingrown nails, fungal infections of nails and foot skin (onychomycosis, mycosis), calluses and corns, heel cracks, nail deformities, plantar hyperkeratosis. Also performs apparatus medical pedicure for patients with diabetes, vascular disease, and foot sensitivity disorders.",
      },
    },
    {
      question: {
        uk: "Чи потрібна підготовка перед візитом до подолога?",
        ru: "Нужна ли подготовка перед визитом к подологу?",
        en: "Is any preparation needed before seeing a podologist?",
      },
      answer: {
        uk: "Спеціальна підготовка не потрібна. Рекомендується прийти зі свіжо вимитими ногами. Якщо є грибкове ураження — не зафарбовувати нігті лаком перед прийомом, щоб лікар зміг оцінити їх стан. Зручне взуття після процедури полегшить комфортне пересування.",
        ru: "Специальная подготовка не требуется. Рекомендуется прийти со свежевымытыми ногами. При наличии грибкового поражения — не закрашивать ногти лаком перед приёмом, чтобы врач смог оценить их состояние. Удобная обувь после процедуры облегчит комфортное передвижение.",
        en: "No special preparation is required. It is recommended to arrive with freshly washed feet. If there is a fungal infection — do not apply nail polish before the appointment so the doctor can assess nail condition. Comfortable footwear after the procedure will make movement easier.",
      },
    },
    {
      question: {
        uk: "Скільки триває прийом у подолога?",
        ru: "Сколько длится приём у подолога?",
        en: "How long does a podologist appointment take?",
      },
      answer: {
        uk: "Тривалість залежить від об'єму роботи: стандартний апаратний педикюр — 45–60 хвилин. Лікування врослого нігтя з встановленням коригуючої системи — 60–90 хвилин. Консультація без маніпуляцій — 20–30 хвилин.",
        ru: "Длительность зависит от объёма работы: стандартный аппаратный педикюр — 45–60 минут. Лечение вросшего ногтя с установкой корригирующей системы — 60–90 минут. Консультация без манипуляций — 20–30 минут.",
        en: "Duration depends on the scope of work: standard apparatus pedicure — 45–60 minutes. Ingrown nail treatment with corrective system fitting — 60–90 minutes. Consultation without procedures — 20–30 minutes.",
      },
    },
    {
      question: {
        uk: "Чи болісні процедури у подолога?",
        ru: "Болезненны ли процедуры у подолога?",
        en: "Are podology procedures painful?",
      },
      answer: {
        uk: "Медична подологія в GENEVITY проводиться максимально комфортно. Апаратний педикюр безболісний. При видаленні глибоких мозолів може відчуватися тиск. Лікування врослого нігтя при необхідності виконується під місцевою анестезією.",
        ru: "Медицинская подология в GENEVITY проводится максимально комфортно. Аппаратный педикюр безболезненный. При удалении глубоких мозолей может ощущаться давление. Лечение вросшего ногтя при необходимости выполняется под местной анестезией.",
        en: "Medical podology at GENEVITY is performed with maximum comfort. Apparatus pedicure is painless. Removal of deep calluses may involve a sense of pressure. Ingrown nail treatment is performed under local anaesthesia when necessary.",
      },
    },
    {
      question: {
        uk: "Як часто слід відвідувати подолога для профілактики?",
        ru: "Как часто следует посещать подолога для профилактики?",
        en: "How often should one visit a podologist for prevention?",
      },
      answer: {
        uk: "Для профілактичного медичного педикюру рекомендується звертатися раз на 1,5–2 місяці. Пацієнтам з цукровим діабетом, судинними захворюваннями або хронічними проблемами зі стопами — кожні 3–4 тижні. При активному лікуванні врослого нігтя або грибка — за індивідуальним планом лікаря.",
        ru: "Для профилактического медицинского педикюра рекомендуется обращаться раз в 1,5–2 месяца. Пациентам с сахарным диабетом, сосудистыми заболеваниями или хроническими проблемами со стопами — каждые 3–4 недели. При активном лечении вросшего ногтя или грибка — по индивидуальному плану врача.",
        en: "For preventive medical pedicure, visiting once every 1.5–2 months is recommended. Patients with diabetes, vascular disease, or chronic foot problems — every 3–4 weeks. For active ingrown nail or fungal treatment — according to the doctor's individual plan.",
      },
    },
  ],
};

// ─── CATEGORY 3: DIAGNOSTICS ──────────────────────────────────────────────────
const diagnostics: CategorySeed = {
  slug: "diagnostics",
  sort_order: 12,
  clickable: true,
  title: {
    uk: "Діагностичні послуги",
    ru: "Диагностические услуги",
    en: "Diagnostic Services",
  },
  seo_title: {
    uk: "Діагностичні послуги у Дніпрі — здати аналізи, УЗД у приватній клініці",
    ru: "Диагностические услуги в Днепре — сдать анализы, УЗИ в частной клинике",
    en: "Diagnostic Services in Dnipro — Lab Tests and Ultrasound at Private Clinic",
  },
  seo_desc: {
    uk: "Діагностика в GENEVITY: лабораторні аналізи, УЗД, комплексні чек-апи. Швидкі результати онлайн. Приватна клініка у Дніпрі.",
    ru: "Диагностика в GENEVITY: лабораторные анализы, УЗИ, комплексные чек-апы. Быстрые результаты онлайн. Частная клиника в Днепре.",
    en: "Diagnostics at GENEVITY: lab tests, ultrasound, comprehensive check-ups. Fast results online. Private clinic in Dnipro.",
  },
  seo_keywords: {
    uk: "здати аналізи, де здати аналізи, приватні лабораторії у Дніпрі, лабораторія для здачі аналізів, скільки коштує здати аналіз, діагностика дніпро, узд дніпро",
    ru: "сдать анализы, где сдать анализы, частные лаборатории в Днепре, лаборатория для сдачи анализов, сколько стоит сдать анализ, диагностика днепр, узи днепр",
    en: "lab tests Dnipro, where to get blood test, private laboratory Dnipro, ultrasound Dnipro, medical diagnostics private clinic",
  },
  sections: [
    {
      type: "richText",
      heading: {
        uk: "Діагностичні послуги GENEVITY",
        ru: "Диагностические услуги GENEVITY",
        en: "GENEVITY Diagnostic Services",
      },
      body: {
        uk: "Клініка GENEVITY пропонує повний діагностичний цикл — від лабораторних аналізів до комплексних check-up програм. Лабораторна діагностика охоплює загальні та біохімічні аналізи крові, гормональні профілі, ліпідограми, онкомаркери, імунологічні та алергологічні дослідження, ПЛР-діагностику. Інструментальна діагностика включає ультразвукові дослідження органів черевної порожнини, малого таза, щитовидної залози.\n\nРезультати більшості досліджень доступні онлайн — у особистому кабінеті пацієнта або надсилаються в месенджер. Аналізи виконуються на сертифікованому обладнанні. Відсутність черг — перевага приватної клініки.\n\nДіагностичні послуги GENEVITY органічно доповнюють програми естетичної медицини та longevity. Комплексний чек-ап допомагає лікарю підібрати оптимальний терапевтичний протокол — будь то естетична корекція чи програма довголіття.",
        ru: "Клиника GENEVITY предлагает полный диагностический цикл — от лабораторных анализов до комплексных check-up программ. Лабораторная диагностика охватывает общие и биохимические анализы крови, гормональные профили, липидограммы, онкомаркеры, иммунологические и аллергологические исследования, ПЦР-диагностику. Инструментальная диагностика включает ультразвуковые исследования органов брюшной полости, малого таза, щитовидной железы.\n\nРезультаты большинства исследований доступны онлайн — в личном кабинете пациента или отправляются в мессенджер. Анализы выполняются на сертифицированном оборудовании. Отсутствие очередей — преимущество частной клиники.\n\nДиагностические услуги GENEVITY органично дополняют программы эстетической медицины и longevity. Комплексный чек-ап помогает врачу подобрать оптимальный терапевтический протокол — будь то эстетическая коррекция или программа долголетия.",
        en: "GENEVITY clinic offers a complete diagnostic cycle — from laboratory tests to comprehensive check-up programmes. Laboratory diagnostics cover general and biochemical blood tests, hormonal profiles, lipid panels, tumour markers, immunological and allergological studies, and PCR diagnostics. Instrumental diagnostics include ultrasound examinations of the abdominal organs, pelvis, and thyroid gland.\n\nResults of most tests are available online — in the patient's personal account or sent via messenger. Tests are performed on certified equipment. No queues — the advantage of a private clinic.\n\nGENEVITY's diagnostic services naturally complement aesthetic medicine and longevity programmes. A comprehensive check-up helps the doctor select the optimal therapeutic protocol — whether aesthetic correction or a longevity programme.",
      },
    },
    {
      type: "bullets",
      heading: {
        uk: "Що входить до діагностичних послуг",
        ru: "Что входит в диагностические услуги",
        en: "What Diagnostic Services Include",
      },
      items: [
        {
          uk: "Загальний та біохімічний аналіз крові",
          ru: "Общий и биохимический анализ крови",
          en: "General and biochemical blood test",
        },
        {
          uk: "Гормональний профіль (щитовидна залоза, статеві гормони, кортизол)",
          ru: "Гормональный профиль (щитовидная железа, половые гормоны, кортизол)",
          en: "Hormonal profile (thyroid, sex hormones, cortisol)",
        },
        {
          uk: "Аналіз на вітаміни та мікроелементи (D, B12, залізо, феритин, магній)",
          ru: "Анализ на витамины и микроэлементы (D, B12, железо, ферритин, магний)",
          en: "Vitamins and micronutrient testing (D, B12, iron, ferritin, magnesium)",
        },
        {
          uk: "УЗД органів черевної порожнини та малого таза",
          ru: "УЗИ органов брюшной полости и малого таза",
          en: "Ultrasound of abdominal and pelvic organs",
        },
        {
          uk: "УЗД щитовидної залози",
          ru: "УЗИ щитовидной железы",
          en: "Thyroid ultrasound",
        },
        {
          uk: "Ліпідограма та кардіоваскулярні маркери",
          ru: "Липидограмма и кардиоваскулярные маркеры",
          en: "Lipid panel and cardiovascular markers",
        },
        {
          uk: "Онкомаркери",
          ru: "Онкомаркеры",
          en: "Tumour markers",
        },
        {
          uk: "Комплексні програми Check-Up 40+",
          ru: "Комплексные программы Check-Up 40+",
          en: "Comprehensive Check-Up 40+ programmes",
        },
        {
          uk: "ПЛР діагностика та інфекційні панелі",
          ru: "ПЦР диагностика и инфекционные панели",
          en: "PCR diagnostics and infectious disease panels",
        },
      ],
    },
    {
      type: "bullets",
      heading: {
        uk: "Як підготуватися до здачі аналізів",
        ru: "Как подготовиться к сдаче анализов",
        en: "How to Prepare for Lab Tests",
      },
      items: [
        {
          uk: "Більшість аналізів крові здаються натщесерце (8–12 годин голодування)",
          ru: "Большинство анализов крови сдаются натощак (8–12 часов голодания)",
          en: "Most blood tests are taken on an empty stomach (8–12 hours fasting)",
        },
        {
          uk: "За добу уникайте алкоголю та інтенсивних фізичних навантажень",
          ru: "За сутки избегайте алкоголя и интенсивных физических нагрузок",
          en: "Avoid alcohol and intense physical activity for 24 hours before testing",
        },
        {
          uk: "Кров на гормони здають у певні дні циклу — лікар уточнить при записі",
          ru: "Кровь на гормоны сдают в определённые дни цикла — врач уточнит при записи",
          en: "Hormone blood tests are taken on specific cycle days — the doctor will advise at booking",
        },
        {
          uk: "Загальний аналіз сечі: перша ранкова порція середнього струменя",
          ru: "Общий анализ мочи: первая утренняя порция среднего струи",
          en: "Urinalysis: first morning midstream urine sample",
        },
        {
          uk: "Рекомендується пити достатньо чистої води напередодні (крім спеціальних тестів)",
          ru: "Рекомендуется пить достаточно чистой воды накануне (кроме специальных тестов)",
          en: "It is recommended to drink enough clean water the day before (except for specific tests)",
        },
      ],
    },
  ],
  faqs: [
    {
      question: {
        uk: "Які аналізи можна здати у GENEVITY?",
        ru: "Какие анализы можно сдать в GENEVITY?",
        en: "What tests can be done at GENEVITY?",
      },
      answer: {
        uk: "В GENEVITY доступний широкий спектр лабораторних досліджень: загальний та біохімічний аналіз крові, гормональний профіль (тиреоїдні, статеві гормони, кортизол, інсулін), аналізи на вітаміни D, B12, залізо, феритин, ліпідограма, онкомаркери, ПЛР-діагностика, алергологічні та імунологічні тести. Повний перелік — на консультації.",
        ru: "В GENEVITY доступен широкий спектр лабораторных исследований: общий и биохимический анализ крови, гормональный профиль (тиреоидные, половые гормоны, кортизол, инсулин), анализы на витамины D, B12, железо, ферритин, липидограмма, онкомаркеры, ПЦР-диагностика, аллергологические и иммунологические тесты. Полный перечень — на консультации.",
        en: "GENEVITY offers a wide range of laboratory tests: general and biochemical blood tests, hormonal profile (thyroid, sex hormones, cortisol, insulin), vitamin D, B12, iron, ferritin tests, lipid panel, tumour markers, PCR diagnostics, allergological and immunological tests. Full list available at consultation.",
      },
    },
    {
      question: {
        uk: "Чи можна отримати результати аналізів онлайн?",
        ru: "Можно ли получить результаты анализов онлайн?",
        en: "Can test results be received online?",
      },
      answer: {
        uk: "Так. Результати більшості аналізів доступні в особистому кабінеті пацієнта або надсилаються на email/месенджер протягом 1–3 робочих днів залежно від виду дослідження. Термінові аналізи готові впродовж кількох годин.",
        ru: "Да. Результаты большинства анализов доступны в личном кабинете пациента или отправляются на email/мессенджер в течение 1–3 рабочих дней в зависимости от вида исследования. Срочные анализы готовы в течение нескольких часов.",
        en: "Yes. Results of most tests are available in the patient's personal account or sent to email/messenger within 1–3 business days depending on the type of test. Urgent tests are ready within a few hours.",
      },
    },
    {
      question: {
        uk: "Чи потрібен запис для здачі аналізів?",
        ru: "Нужна ли запись для сдачи анализов?",
        en: "Do I need to book an appointment to have tests done?",
      },
      answer: {
        uk: "Рекомендується попередній запис, щоб уникнути очікування. Для аналізів, що здаються натщесерце, запис допомагає спланувати зручний ранковий час. Записатися можна онлайн або за телефоном +380 73 000 0150.",
        ru: "Рекомендуется предварительная запись, чтобы избежать ожидания. Для анализов, сдаваемых натощак, запись помогает спланировать удобное утреннее время. Записаться можно онлайн или по телефону +380 73 000 0150.",
        en: "Advance booking is recommended to avoid waiting. For fasting tests, booking helps plan a convenient morning time. You can book online or by phone at +380 73 000 0150.",
      },
    },
    {
      question: {
        uk: "Які документи необхідні для здачі аналізів?",
        ru: "Какие документы необходимы для сдачи анализов?",
        en: "What documents are required for testing?",
      },
      answer: {
        uk: "Для здачі аналізів потрібен паспорт або інший документ, що підтверджує особу. Для неповнолітніх — документи батьків або опікунів. Направлення лікаря не є обов'язковим — можна замовити аналіз самостійно.",
        ru: "Для сдачи анализов необходим паспорт или другой документ, удостоверяющий личность. Для несовершеннолетних — документы родителей или опекунов. Направление врача не является обязательным — можно заказать анализ самостоятельно.",
        en: "A passport or other identity document is required for testing. For minors — documents of parents or guardians. A doctor's referral is not mandatory — tests can be ordered independently.",
      },
    },
  ],
};

// ─── CATEGORY 4: PLASTIC SURGERY ─────────────────────────────────────────────
const plasticSurgery: CategorySeed = {
  slug: "plastic-surgery",
  sort_order: 13,
  clickable: true,
  title: {
    uk: "Пластична хірургія",
    ru: "Пластическая хирургия",
    en: "Plastic Surgery",
  },
  seo_title: {
    uk: "Пластична хірургія у Дніпрі — консультація пластичного хірурга",
    ru: "Пластическая хирургия в Днепре — консультация пластического хирурга",
    en: "Plastic Surgery in Dnipro — Plastic Surgeon Consultation",
  },
  seo_desc: {
    uk: "Консультація пластичного хірурга в GENEVITY у Дніпрі. Корекція форм тіла та обличчя, поєднання хірургічних та апаратних методів. Запис.",
    ru: "Консультация пластического хирурга в GENEVITY в Днепре. Коррекция форм тела и лица, сочетание хирургических и аппаратных методов. Запись.",
    en: "Plastic surgeon consultation at GENEVITY in Dnipro. Face and body correction, combining surgical and apparatus methods. Book now.",
  },
  seo_keywords: {
    uk: "пластична хірургія, пластична хірургія дніпро, пластичний хірург дніпро, пластична операція, пластична хірургія ціна",
    ru: "пластическая хирургия, пластическая хирургия днепр, пластический хирург днепр, пластическая операция, пластическая хирургия цена",
    en: "plastic surgery Dnipro, plastic surgeon Ukraine, cosmetic surgery consultation, facelift Dnipro, rhinoplasty Dnipro",
  },
  sections: [
    {
      type: "richText",
      heading: {
        uk: "Пластична хірургія в GENEVITY — консультація та планування",
        ru: "Пластическая хирургия в GENEVITY — консультация и планирование",
        en: "Plastic Surgery at GENEVITY — Consultation and Planning",
      },
      body: {
        uk: "GENEVITY пропонує консультації пластичного хірурга для планування хірургічної корекції обличчя та тіла. Пластичний хірург — це лікар з вищою медичною освітою та спеціалізацією у пластичній та реконструктивній хірургії, який виконує операції по зміні форм і контурів тіла.\n\nФілософія GENEVITY — комплексний підхід, що поєднує хірургічні та нехірургічні методи. Найкращий результат часто досягається завдяки комбінації: операція формує основу, а апаратні та ін'єкційні процедури доповнюють і утримують ефект. Наприклад, підтяжка обличчя у поєднанні з ботулінотерапією та Ultraformer MPT дає більш природний і тривалий результат, ніж хірургія наодинці.\n\nКонсультація пластичного хірурга в GENEVITY не зобов'язує до операції. Лікар чесно оцінює ситуацію: якщо нехірургічні методи здатні досягти бажаного результату — він скаже про це відкрито. Якщо хірургія справді необхідна — розробить детальний план із урахуванням підготовки, самої операції та реабілітаційного супроводу командою клініки.",
        ru: "GENEVITY предлагает консультации пластического хирурга для планирования хирургической коррекции лица и тела. Пластический хирург — это врач с высшим медицинским образованием и специализацией в пластической и реконструктивной хирургии, выполняющий операции по изменению форм и контуров тела.\n\nФилософия GENEVITY — комплексный подход, сочетающий хирургические и нехирургические методы. Лучший результат часто достигается благодаря комбинации: операция формирует основу, а аппаратные и инъекционные процедуры дополняют и удерживают эффект. Например, подтяжка лица в сочетании с ботулинотерапией и Ultraformer MPT даёт более естественный и продолжительный результат, чем хирургия в одиночку.\n\nКонсультация пластического хирурга в GENEVITY не обязывает к операции. Врач честно оценивает ситуацию: если нехирургические методы способны достичь желаемого результата — он скажет об этом открыто. Если хирургия действительно необходима — разработает детальный план с учётом подготовки, самой операции и реабилитационного сопровождения командой клиники.",
        en: "GENEVITY offers plastic surgeon consultations for planning surgical correction of the face and body. A plastic surgeon is a doctor with advanced medical training and specialisation in plastic and reconstructive surgery, performing operations to change body shapes and contours.\n\nGENEVITY's philosophy is a comprehensive approach combining surgical and non-surgical methods. The best result is often achieved through a combination: surgery forms the foundation, while apparatus and injectable procedures complement and sustain the effect. For example, a facelift combined with botulinum therapy and Ultraformer MPT yields a more natural and lasting result than surgery alone.\n\nA plastic surgeon consultation at GENEVITY carries no obligation to proceed with surgery. The doctor honestly assesses the situation: if non-surgical methods can achieve the desired result — this will be stated openly. If surgery is genuinely necessary — a detailed plan will be developed covering preparation, the operation itself, and rehabilitation support from the clinic team.",
      },
    },
    {
      type: "bullets",
      heading: {
        uk: "Напрями пластичної хірургії",
        ru: "Направления пластической хирургии",
        en: "Plastic Surgery Directions",
      },
      items: [
        {
          uk: "Ліфтинг обличчя та шиї — підтяжка тканин, усунення птозу",
          ru: "Лифтинг лица и шеи — подтяжка тканей, устранение птоза",
          en: "Face and neck lift — tissue tightening, ptosis correction",
        },
        {
          uk: "Блефаропластика — хірургічна корекція верхніх та нижніх повік",
          ru: "Блефаропластика — хирургическая коррекция верхних и нижних век",
          en: "Blepharoplasty — surgical correction of upper and lower eyelids",
        },
        {
          uk: "Ринопластика — корекція форми та функції носа",
          ru: "Ринопластика — коррекция формы и функции носа",
          en: "Rhinoplasty — correction of nose shape and function",
        },
        {
          uk: "Маммопластика — збільшення, зменшення або підтяжка грудей",
          ru: "Маммопластика — увеличение, уменьшение или подтяжка груди",
          en: "Mammoplasty — breast augmentation, reduction, or lift",
        },
        {
          uk: "Абдомінопластика — корекція живота, усунення діастазу прямих м'язів",
          ru: "Абдоминопластика — коррекция живота, устранение диастаза прямых мышц",
          en: "Abdominoplasty — abdominal correction, diastasis recti repair",
        },
        {
          uk: "Ліпосакція — хірургічне видалення локальних жирових відкладень",
          ru: "Липосакция — хирургическое удаление локальных жировых отложений",
          en: "Liposuction — surgical removal of localised fat deposits",
        },
        {
          uk: "Отопластика — корекція форми та положення вух",
          ru: "Отопластика — коррекция формы и положения ушей",
          en: "Otoplasty — correction of ear shape and position",
        },
      ],
    },
    {
      type: "bullets",
      heading: {
        uk: "Комбінований підхід GENEVITY",
        ru: "Комбинированный подход GENEVITY",
        en: "GENEVITY Combined Approach",
      },
      items: [
        {
          uk: "Хірургічне втручання + апаратна реабілітація (EMSCULPT NEO, Exion Body) — прискорює відновлення",
          ru: "Хирургическое вмешательство + аппаратная реабилитация (EMSCULPT NEO, Exion Body) — ускоряет восстановление",
          en: "Surgery + apparatus rehabilitation (EMSCULPT NEO, Exion Body) — accelerates recovery",
        },
        {
          uk: "Пластика обличчя + ін'єкційна косметологія — максимальне омолодження з природним ефектом",
          ru: "Пластика лица + инъекционная косметология — максимальное омоложение с естественным эффектом",
          en: "Facial plastics + injectable cosmetology — maximum rejuvenation with natural results",
        },
        {
          uk: "Маммопластика + Ultraformer MPT для декольте та підтяжки шкіри",
          ru: "Маммопластика + Ultraformer MPT для декольте и подтяжки кожи",
          en: "Mammoplasty + Ultraformer MPT for décolleté and skin tightening",
        },
        {
          uk: "Консультація пластичного хірурга + лікаря-косметолога — спільне планування результату",
          ru: "Консультация пластического хирурга + врача-косметолога — совместное планирование результата",
          en: "Plastic surgeon + aesthetic doctor consultation — joint outcome planning",
        },
        {
          uk: "Ведення пацієнта до і після операції командою GENEVITY",
          ru: "Ведение пациента до и после операции командой GENEVITY",
          en: "Patient management before and after surgery by the GENEVITY team",
        },
      ],
    },
  ],
  faqs: [
    {
      question: {
        uk: "Як проходить консультація пластичного хірурга в GENEVITY?",
        ru: "Как проходит консультация пластического хирурга в GENEVITY?",
        en: "How does a plastic surgeon consultation at GENEVITY work?",
      },
      answer: {
        uk: "На консультації хірург оцінює вихідний стан, з'ясовує побажання та очікуваний результат, визначає оптимальний метод корекції (хірургічний або нехірургічний). Обговорюються ризики, реабілітаційний період, вартість. Консультація конфіденційна та зобов'язань не накладає.",
        ru: "На консультации хирург оценивает исходное состояние, выясняет пожелания и ожидаемый результат, определяет оптимальный метод коррекции (хирургический или нехирургический). Обсуждаются риски, реабилитационный период, стоимость. Консультация конфиденциальна и не накладывает обязательств.",
        en: "At the consultation, the surgeon assesses the baseline condition, clarifies wishes and the expected result, and determines the optimal correction method (surgical or non-surgical). Risks, the rehabilitation period, and costs are discussed. The consultation is confidential and carries no obligations.",
      },
    },
    {
      question: {
        uk: "Чи можна уникнути операції за допомогою апаратних методик?",
        ru: "Можно ли избежать операции с помощью аппаратных методик?",
        en: "Can surgery be avoided using apparatus techniques?",
      },
      answer: {
        uk: "В багатьох випадках — так. Сучасні апаратні методики (Ultraformer MPT, EMFACE, EMSCULPT NEO) дозволяють досягти значного підтягуючого та контурувального ефекту без операції. Хірург чесно оцінить, чи вирішить нехірургічний підхід конкретне завдання, або хірургія дасть суттєво кращий результат.",
        ru: "Во многих случаях — да. Современные аппаратные методики (Ultraformer MPT, EMFACE, EMSCULPT NEO) позволяют достичь значительного подтягивающего и контурирующего эффекта без операции. Хирург честно оценит, решит ли нехирургический подход конкретную задачу, или хирургия даст существенно лучший результат.",
        en: "In many cases — yes. Modern apparatus techniques (Ultraformer MPT, EMFACE, EMSCULPT NEO) can achieve significant lifting and contouring effects without surgery. The surgeon will honestly assess whether a non-surgical approach can address the specific goal, or whether surgery will deliver a substantially better result.",
      },
    },
    {
      question: {
        uk: "Яка вартість консультації пластичного хірурга?",
        ru: "Какова стоимость консультации пластического хирурга?",
        en: "What is the cost of a plastic surgeon consultation?",
      },
      answer: {
        uk: "Вартість первинної консультації уточнюйте за телефоном або в адміністратора. Консультація включає огляд, обговорення плану лікування та попередній розрахунок вартості процедур.",
        ru: "Стоимость первичной консультации уточняйте по телефону или у администратора. Консультация включает осмотр, обсуждение плана лечения и предварительный расчёт стоимости процедур.",
        en: "The cost of the initial consultation can be confirmed by phone or with the administrator. The consultation includes an examination, discussion of the treatment plan, and a preliminary cost estimate for procedures.",
      },
    },
  ],
};

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────

async function seedCategory(cat: CategorySeed): Promise<void> {
  // Check if already exists
  const existing = await sql`SELECT id FROM service_categories WHERE slug = ${cat.slug}`;
  if (existing.length > 0) {
    console.log(`⚠ SKIP: "${cat.slug}" already exists (id: ${existing[0].id})`);
    return;
  }

  // Insert category row
  const catId = randomUUID();
  await sql`
    INSERT INTO service_categories (
      id, slug, sort_order, clickable,
      title_uk, title_ru, title_en,
      seo_title_uk, seo_title_ru, seo_title_en,
      seo_desc_uk, seo_desc_ru, seo_desc_en,
      seo_keywords_uk, seo_keywords_ru, seo_keywords_en
    ) VALUES (
      ${catId}, ${cat.slug}, ${cat.sort_order}, ${cat.clickable},
      ${cat.title.uk}, ${cat.title.ru}, ${cat.title.en},
      ${cat.seo_title.uk}, ${cat.seo_title.ru}, ${cat.seo_title.en},
      ${cat.seo_desc.uk}, ${cat.seo_desc.ru}, ${cat.seo_desc.en},
      ${cat.seo_keywords.uk}, ${cat.seo_keywords.ru}, ${cat.seo_keywords.en}
    )
  `;

  // Insert content_sections
  const sectionIds: string[] = [];
  for (let i = 0; i < cat.sections.length; i++) {
    const sec = cat.sections[i];
    const secId = randomUUID();
    sectionIds.push(secId);
    await sql`
      INSERT INTO content_sections (id, owner_type, owner_id, sort_order, section_type, data)
      VALUES (
        ${secId}, 'category', ${catId}, ${i},
        ${sec.type}::section_type,
        ${JSON.stringify(sectionData(sec))}::jsonb
      )
    `;
  }

  // Insert faq_items
  for (let i = 0; i < cat.faqs.length; i++) {
    const f = cat.faqs[i];
    await sql`
      INSERT INTO faq_items (id, owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
      VALUES (
        ${randomUUID()}, 'category', ${catId}, ${i},
        ${f.question.uk}, ${f.question.ru}, ${f.question.en},
        ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en}
      )
    `;
  }

  // Set block_order
  const blockOrder = [
    ...sectionIds.map((id) => `section:${id}`),
    "faq",
    "doctors",
    "relatedServices",
    "finalCTA",
  ];
  await sql`UPDATE service_categories SET block_order = ${blockOrder} WHERE id = ${catId}`;

  console.log(
    `✓ CREATED: "${cat.slug}" (id: ${catId}) — ${cat.sections.length} sections, ${cat.faqs.length} FAQs`
  );
}

async function main() {
  console.log("Seeding 4 missing service categories...\n");

  await seedCategory(skincare);
  await seedCategory(podology);
  await seedCategory(diagnostics);
  await seedCategory(plasticSurgery);

  await sql.end();

  console.log("\n✅ Done.");
  console.log("  skincare      — sort_order: 10");
  console.log("  podology      — sort_order: 11");
  console.log("  diagnostics   — sort_order: 12");
  console.log("  plastic-surgery — sort_order: 13");
}

main().catch((e) => { console.error(e); process.exit(1); });
