import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "qzct6skk",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

type L = { _type: "localeString"; uk: string; ru: string; en: string };
type LT = { _type: "localeText"; uk: string; ru: string; en: string };
type LA = { _type: "localeStringArray"; uk: string[]; ru: string[]; en: string[] };

const ls = (uk: string, ru: string, en: string): L => ({ _type: "localeString", uk, ru, en });
const lt = (uk: string, ru: string, en: string): LT => ({ _type: "localeText", uk, ru, en });
const la = (uk: string[], ru: string[], en: string[]): LA => ({ _type: "localeStringArray", uk, ru, en });

async function main() {
  console.log("Seeding categories...");

  // ===== CATEGORIES =====

  // Apparatus Cosmetology
  await client.createOrReplace({
    _id: "category-apparatus-cosmetology",
    _type: "serviceCategory",
    title: ls("Апаратна косметологія", "Аппаратная косметология", "Apparatus Cosmetology"),
    slug: { _type: "slug", current: "apparatus-cosmetology" },
    summary: lt(
      "Апаратні процедури для обличчя та тіла на обладнанні преміум-класу від BTL, Lumenis та InMode. Безінвазивний ліфтинг, контурування тіла та омолодження шкіри — деяке обладнання єдине в Україні.",
      "Аппаратные процедуры для лица и тела на оборудовании премиум-класса от BTL, Lumenis и InMode. Безинвазивный лифтинг, контурирование тела и омоложение кожи — некоторое оборудование единственное в Украине.",
      "Apparatus procedures for face and body using premium equipment from BTL, Lumenis and InMode. Non-invasive lifting, body contouring and skin rejuvenation — some equipment is the only one in Ukraine."
    ),
    order: 2,
    clickable: true,
    sections: [
      {
        _type: "section.richText", _key: "what-is",
        heading: ls("Що таке апаратна косметологія?", "Что такое аппаратная косметология?", "What is Apparatus Cosmetology?"),
        body: lt(
          "Апаратна косметологія — це напрямок естетичної медицини, який використовує сучасне високотехнологічне обладнання для омолодження, ліфтингу, корекції фігури та відновлення шкіри без хірургічного втручання. У центрі GENEVITY представлені апарати, яких немає в жодній іншій клініці України: EMFACE для одночасного ліфтингу та тонізації м'язів обличчя, EMSCULPT NEO для корекції фігури, Ultraformer MPT для SMAS-ліфтингу.\n\nКожна процедура проводиться під контролем сертифікованих лікарів із дотриманням протоколів виробників обладнання.",
          "Аппаратная косметология — это направление эстетической медицины, использующее современное высокотехнологичное оборудование для омоложения, лифтинга, коррекции фигуры и восстановления кожи без хирургического вмешательства. В центре GENEVITY представлены аппараты, которых нет ни в одной другой клинике Украины: EMFACE для одновременного лифтинга и тонизации мышц лица, EMSCULPT NEO для коррекции фигуры, Ultraformer MPT для SMAS-лифтинга.\n\nКаждая процедура проводится под контролем сертифицированных врачей с соблюдением протоколов производителей оборудования.",
          "Apparatus cosmetology uses cutting-edge high-tech equipment for rejuvenation, lifting, body contouring and skin restoration without surgery. GENEVITY features devices found in no other clinic in Ukraine: EMFACE for simultaneous facial lifting and muscle toning, EMSCULPT NEO for body contouring, Ultraformer MPT for SMAS lifting.\n\nEvery procedure is performed under the supervision of certified physicians following manufacturer protocols."
        ),
      },
      {
        _type: "section.bullets", _key: "benefits",
        heading: ls("Переваги апаратних процедур", "Преимущества аппаратных процедур", "Benefits of Apparatus Procedures"),
        items: la(
          ["Безінвазивність — без розрізів, голок та наркозу", "Комфортність — більшість процедур безболісні", "Відсутність реабілітації — повернення до звичного ритму одразу", "Тривалий ефект — результат зберігається від 6 місяців до 2 років", "Накопичувальний ефект при курсовому лікуванні", "Можливість поєднання з ін'єкційними методиками", "Безпека підтверджена клінічними дослідженнями FDA та CE"],
          ["Безинвазивность — без разрезов, игл и наркоза", "Комфортность — большинство процедур безболезненны", "Отсутствие реабилитации — возвращение к привычному ритму сразу", "Длительный эффект — результат сохраняется от 6 месяцев до 2 лет", "Накопительный эффект при курсовом лечении", "Возможность сочетания с инъекционными методиками", "Безопасность подтверждена клиническими исследованиями FDA и CE"],
          ["Non-invasive — no incisions, needles or anesthesia", "Comfortable — most procedures are painless", "No recovery — return to normal routine immediately", "Long-lasting — results last from 6 months to 2 years", "Cumulative effect with course treatment", "Can be combined with injectable techniques", "Safety confirmed by FDA and CE clinical research"]
        ),
      },
      {
        _type: "section.steps", _key: "procedure",
        heading: ls("Як проходить апаратна процедура?", "Как проходит аппаратная процедура?", "How Does an Apparatus Procedure Work?"),
        steps: [
          { _key: "s1", title: ls("Діагностика", "Диагностика", "Diagnostics"), description: lt("Лікар оцінює стан шкіри та визначає оптимальний протокол апаратного лікування.", "Врач оценивает состояние кожи и определяет оптимальный протокол аппаратного лечения.", "The physician assesses skin condition and determines the optimal apparatus treatment protocol.") },
          { _key: "s2", title: ls("Підготовка", "Подготовка", "Preparation"), description: lt("Очищення зони обробки, нанесення контактного гелю або захисного засобу залежно від процедури.", "Очищение зоны обработки, нанесение контактного геля или защитного средства в зависимости от процедуры.", "Cleansing the treatment area, applying contact gel or protective agent depending on the procedure.") },
          { _key: "s3", title: ls("Процедура", "Процедура", "Procedure"), description: lt("Лікар проводить обробку апаратом за індивідуальним протоколом. Тривалість — від 20 до 60 хвилин.", "Врач проводит обработку аппаратом по индивидуальному протоколу. Длительность — от 20 до 60 минут.", "The physician performs treatment following an individual protocol. Duration — 20 to 60 minutes.") },
          { _key: "s4", title: ls("Результат", "Результат", "Results"), description: lt("Ефект видно одразу або протягом 2–4 тижнів. Лікар надає рекомендації для підтримки результату.", "Эффект виден сразу или в течение 2–4 недель. Врач дает рекомендации для поддержания результата.", "Effects visible immediately or within 2–4 weeks. The physician provides recommendations for maintaining results.") },
        ],
      },
      {
        _type: "section.priceTeaser", _key: "price",
        heading: ls("Вартість апаратних процедур", "Стоимость аппаратных процедур", "Apparatus Procedures Pricing"),
        intro: lt("Вартість апаратних процедур залежить від зони обробки, типу обладнання та кількості сеансів. Для точного розрахунку запишіться на безкоштовну консультацію.", "Стоимость аппаратных процедур зависит от зоны обработки, типа оборудования и количества сеансов. Для точного расчёта запишитесь на бесплатную консультацию.", "Apparatus procedure pricing depends on the treatment area, equipment type and number of sessions. Book a free consultation for an exact calculation."),
        ctaLabel: ls("Дізнатися вартість", "Узнать стоимость", "Get pricing"),
      },
    ],
    faq: [
      { _type: "faqItem", _key: "faq1", question: ls("Чи болісні апаратні процедури?", "Болезненны ли аппаратные процедуры?", "Are apparatus procedures painful?"), answer: lt("Більшість апаратних процедур у GENEVITY безболісні або супроводжуються мінімальним дискомфортом. Наприклад, EMFACE та EMSCULPT NEO викликають лише відчуття інтенсивних м'язових скорочень, а Ultraformer MPT може супроводжуватися легким поколюванням.", "Большинство аппаратных процедур в GENEVITY безболезненны или сопровождаются минимальным дискомфортом. Например, EMFACE и EMSCULPT NEO вызывают лишь ощущение интенсивных мышечных сокращений, а Ultraformer MPT может сопровождаться лёгким покалыванием.", "Most apparatus procedures at GENEVITY are painless or involve minimal discomfort. For example, EMFACE and EMSCULPT NEO cause only a sensation of intense muscle contractions, while Ultraformer MPT may involve mild tingling.") },
      { _type: "faqItem", _key: "faq2", question: ls("Скільки сеансів потрібно для результату?", "Сколько сеансов нужно для результата?", "How many sessions are needed for results?"), answer: lt("Кількість сеансів залежить від процедури: EMFACE — 4 сеанси, EMSCULPT NEO — 4–6 сеансів, Ultraformer MPT — зазвичай 1 сеанс із повторенням через рік. Лікар складе індивідуальний план після консультації.", "Количество сеансов зависит от процедуры: EMFACE — 4 сеанса, EMSCULPT NEO — 4–6 сеансов, Ultraformer MPT — обычно 1 сеанс с повторением через год. Врач составит индивидуальный план после консультации.", "The number of sessions depends on the procedure: EMFACE — 4 sessions, EMSCULPT NEO — 4–6 sessions, Ultraformer MPT — usually 1 session repeated annually. The physician will create an individual plan after consultation.") },
      { _type: "faqItem", _key: "faq3", question: ls("Чи можна поєднувати апаратні та ін'єкційні процедури?", "Можно ли сочетать аппаратные и инъекционные процедуры?", "Can apparatus and injectable procedures be combined?"), answer: lt("Так, комбінування апаратних та ін'єкційних методик часто дає найкращий результат. Наприклад, EMFACE + ботулінотерапія або Ultraformer MPT + біоревіталізація. Лікарі GENEVITY складають комплексні програми з урахуванням сумісності процедур.", "Да, сочетание аппаратных и инъекционных методик часто даёт лучший результат. Например, EMFACE + ботулинотерапия или Ultraformer MPT + биоревитализация. Врачи GENEVITY составляют комплексные программы с учётом совместимости процедур.", "Yes, combining apparatus and injectable techniques often yields the best results. For example, EMFACE + botulinum therapy or Ultraformer MPT + biorevitalization. GENEVITY physicians create comprehensive programs considering procedure compatibility.") },
    ],
  });
  console.log("✓ Apparatus Cosmetology");

  // Intimate Rejuvenation
  await client.createOrReplace({
    _id: "category-intimate-rejuvenation",
    _type: "serviceCategory",
    title: ls("Інтимне відновлення", "Интимное восстановление", "Intimate Rejuvenation"),
    slug: { _type: "slug", current: "intimate-rejuvenation" },
    summary: lt(
      "Делікатні процедури відновлення інтимного здоров'я та комфорту з використанням передових апаратних технологій. Конфіденційність, професіоналізм та індивідуальний підхід.",
      "Деликатные процедуры восстановления интимного здоровья и комфорта с использованием передовых аппаратных технологий. Конфиденциальность, профессионализм и индивидуальный подход.",
      "Delicate procedures for intimate health and comfort restoration using advanced apparatus technologies. Confidentiality, professionalism and individual approach."
    ),
    order: 3,
    clickable: true,
    sections: [
      {
        _type: "section.richText", _key: "what-is",
        heading: ls("Інтимне відновлення в GENEVITY", "Интимное восстановление в GENEVITY", "Intimate Rejuvenation at GENEVITY"),
        body: lt(
          "Інтимне відновлення — це напрямок естетичної та відновлювальної медицини, спрямований на покращення якості інтимного здоров'я та комфорту. У центрі GENEVITY ми використовуємо апаратні методики нового покоління, які дозволяють досягти результатів без хірургічного втручання.\n\nУсі процедури проводяться в умовах повної конфіденційності досвідченими лікарями-спеціалістами.",
          "Интимное восстановление — это направление эстетической и восстановительной медицины, направленное на улучшение качества интимного здоровья и комфорта. В центре GENEVITY мы используем аппаратные методики нового поколения, позволяющие достичь результатов без хирургического вмешательства.\n\nВсе процедуры проводятся в условиях полной конфиденциальности опытными врачами-специалистами.",
          "Intimate rejuvenation is a branch of aesthetic and restorative medicine focused on improving intimate health and comfort quality. At GENEVITY, we use next-generation apparatus techniques that achieve results without surgical intervention.\n\nAll procedures are performed in complete confidentiality by experienced specialist physicians."
        ),
      },
    ],
    faq: [
      { _type: "faqItem", _key: "faq1", question: ls("Чи безпечні процедури інтимного відновлення?", "Безопасны ли процедуры интимного восстановления?", "Are intimate rejuvenation procedures safe?"), answer: lt("Так, усі апаратні методики інтимного відновлення у GENEVITY мають клінічно доведену безпеку та ефективність. Обладнання сертифіковане FDA та CE, процедури проводяться виключно лікарями з відповідною спеціалізацією.", "Да, все аппаратные методики интимного восстановления в GENEVITY имеют клинически доказанную безопасность и эффективность. Оборудование сертифицировано FDA и CE, процедуры проводятся исключительно врачами с соответствующей специализацией.", "Yes, all apparatus intimate rejuvenation techniques at GENEVITY have clinically proven safety and efficacy. Equipment is FDA and CE certified, procedures are performed exclusively by physicians with appropriate specialization.") },
    ],
  });
  console.log("✓ Intimate Rejuvenation");

  // Laser Hair Removal
  await client.createOrReplace({
    _id: "category-laser-hair-removal",
    _type: "serviceCategory",
    title: ls("Лазерна епіляція", "Лазерная эпиляция", "Laser Hair Removal"),
    slug: { _type: "slug", current: "laser-hair-removal" },
    summary: lt(
      "Лазерна епіляція на апараті Splendor X від Lumenis — золотий стандарт видалення небажаного волосся. Технологія BLEND X поєднує александритовий та Nd:YAG лазери для ефективної роботи з будь-яким типом шкіри та волосся.",
      "Лазерная эпиляция на аппарате Splendor X от Lumenis — золотой стандарт удаления нежелательных волос. Технология BLEND X сочетает александритовый и Nd:YAG лазеры для эффективной работы с любым типом кожи и волос.",
      "Laser hair removal with Splendor X by Lumenis — the gold standard in unwanted hair removal. BLEND X technology combines alexandrite and Nd:YAG lasers for effective treatment of any skin and hair type."
    ),
    order: 4,
    clickable: true,
    sections: [
      {
        _type: "section.richText", _key: "what-is",
        heading: ls("Лазерна епіляція Splendor X", "Лазерная эпиляция Splendor X", "Splendor X Laser Hair Removal"),
        body: lt(
          "Лазерна епіляція — найефективніший метод довготривалого видалення небажаного волосся. У центрі GENEVITY ми використовуємо апарат Splendor X від ізраїльської компанії Lumenis — світового лідера в лазерних технологіях.\n\nТехнологія BLEND X одночасно використовує два типи лазерів (александритовий 755 нм та Nd:YAG 1064 нм), що дозволяє ефективно працювати з будь-яким фототипом шкіри та будь-яким кольором волосся, включаючи світле та сиве.",
          "Лазерная эпиляция — наиболее эффективный метод долгосрочного удаления нежелательных волос. В центре GENEVITY мы используем аппарат Splendor X от израильской компании Lumenis — мирового лидера в лазерных технологиях.\n\nТехнология BLEND X одновременно использует два типа лазеров (александритовый 755 нм и Nd:YAG 1064 нм), что позволяет эффективно работать с любым фототипом кожи и любым цветом волос, включая светлые и седые.",
          "Laser hair removal is the most effective method for long-term unwanted hair removal. At GENEVITY, we use Splendor X by Israeli company Lumenis — a world leader in laser technologies.\n\nBLEND X technology simultaneously uses two laser types (alexandrite 755nm and Nd:YAG 1064nm), enabling effective treatment of any skin phototype and any hair color, including light and grey."
        ),
      },
      {
        _type: "section.bullets", _key: "benefits",
        heading: ls("Переваги Splendor X", "Преимущества Splendor X", "Splendor X Advantages"),
        items: la(
          ["Подвійна довжина хвилі BLEND X — працює з будь-яким фототипом", "Великий розмір плями — швидке покриття великих зон", "Вбудована система охолодження — комфорт під час процедури", "Мінімальний ризик побічних ефектів", "Довготривалий результат — до 90% зменшення росту волосся", "Підходить для чутливих зон"],
          ["Двойная длина волны BLEND X — работает с любым фототипом", "Большой размер пятна — быстрое покрытие больших зон", "Встроенная система охлаждения — комфорт во время процедуры", "Минимальный риск побочных эффектов", "Долгосрочный результат — до 90% сокращения роста волос", "Подходит для чувствительных зон"],
          ["Dual wavelength BLEND X — works with any phototype", "Large spot size — fast coverage of large areas", "Built-in cooling system — comfort during procedure", "Minimal risk of side effects", "Long-term results — up to 90% hair growth reduction", "Suitable for sensitive areas"]
        ),
      },
    ],
    faq: [
      { _type: "faqItem", _key: "faq1", question: ls("Скільки сеансів потрібно для повного видалення волосся?", "Сколько сеансов нужно для полного удаления волос?", "How many sessions are needed for complete hair removal?"), answer: lt("Зазвичай для досягнення стійкого результату потрібно 6–8 сеансів з інтервалом 4–6 тижнів. Кількість може варіюватися залежно від зони, кольору волосся та індивідуальних особливостей.", "Обычно для достижения стойкого результата необходимо 6–8 сеансов с интервалом 4–6 недель. Количество может варьироваться в зависимости от зоны, цвета волос и индивидуальных особенностей.", "Typically, 6–8 sessions with 4–6 week intervals are needed for lasting results. The number may vary depending on the area, hair color and individual characteristics.") },
      { _type: "faqItem", _key: "faq2", question: ls("Чи підходить лазерна епіляція для світлого волосся?", "Подходит ли лазерная эпиляция для светлых волос?", "Is laser hair removal suitable for light hair?"), answer: lt("Так, апарат Splendor X з технологією BLEND X ефективно працює навіть зі світлим та тонким волоссям завдяки поєднанню двох довжин хвиль лазера.", "Да, аппарат Splendor X с технологией BLEND X эффективно работает даже со светлыми и тонкими волосами благодаря сочетанию двух длин волн лазера.", "Yes, Splendor X with BLEND X technology effectively treats even light and fine hair thanks to the combination of two laser wavelengths.") },
    ],
  });
  console.log("✓ Laser Hair Removal");

  // Longevity & Anti-Age (NON-clickable parent — but we make it clickable since it has services)
  await client.createOrReplace({
    _id: "category-longevity",
    _type: "serviceCategory",
    title: ls("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),
    slug: { _type: "slug", current: "longevity" },
    summary: lt(
      "Комплексні програми довголіття та антивікової медицини: глибока діагностика, гормональна корекція, IV-терапія, нутрицевтика. Індивідуальний підхід до кожного пацієнта на основі доказової медицини.",
      "Комплексные программы долголетия и антивозрастной медицины: глубокая диагностика, гормональная коррекция, IV-терапия, нутрицевтика. Индивидуальный подход к каждому пациенту на основе доказательной медицины.",
      "Comprehensive longevity and anti-aging programs: deep diagnostics, hormonal correction, IV therapy, nutraceuticals. Individual approach to each patient based on evidence-based medicine."
    ),
    order: 5,
    clickable: true,
    sections: [
      {
        _type: "section.richText", _key: "what-is",
        heading: ls("Longevity-медицина в GENEVITY", "Longevity-медицина в GENEVITY", "Longevity Medicine at GENEVITY"),
        body: lt(
          "Longevity-медицина — це науковий підхід до продовження активного та здорового життя. На відміну від традиційної медицини, яка лікує хвороби, longevity-медицина працює на випередження: виявляє ризики на ранніх стадіях, оптимізує метаболізм, гормональний баланс та клітинне здоров'я.\n\nУ GENEVITY ми пропонуємо комплексні програми, які поєднують глибоку лабораторну діагностику, персоналізовану терапію та постійний моніторинг здоров'я. Наші протоколи базуються на останніх дослідженнях у галузі геронтології та превентивної медицини.",
          "Longevity-медицина — это научный подход к продлению активной и здоровой жизни. В отличие от традиционной медицины, которая лечит болезни, longevity-медицина работает на опережение: выявляет риски на ранних стадиях, оптимизирует метаболизм, гормональный баланс и клеточное здоровье.\n\nВ GENEVITY мы предлагаем комплексные программы, сочетающие глубокую лабораторную диагностику, персонализированную терапию и постоянный мониторинг здоровья. Наши протоколы основаны на последних исследованиях в области геронтологии и превентивной медицины.",
          "Longevity medicine is a scientific approach to extending active and healthy life. Unlike traditional medicine that treats diseases, longevity medicine works proactively: identifying risks at early stages, optimizing metabolism, hormonal balance and cellular health.\n\nAt GENEVITY, we offer comprehensive programs combining deep laboratory diagnostics, personalized therapy and continuous health monitoring. Our protocols are based on the latest research in gerontology and preventive medicine."
        ),
      },
    ],
    faq: [
      { _type: "faqItem", _key: "faq1", question: ls("Для кого підходять longevity-програми?", "Для кого подходят longevity-программы?", "Who are longevity programs suitable for?"), answer: lt("Longevity-програми підходять для всіх, хто хоче зберегти здоров'я та активність на довгі роки. Особливо рекомендовані для людей 35+ років, тих, хто відчуває хронічну втому, має гормональний дисбаланс або хоче пройти комплексну діагностику.", "Longevity-программы подходят для всех, кто хочет сохранить здоровье и активность на долгие годы. Особенно рекомендованы для людей 35+ лет, тех, кто испытывает хроническую усталость, имеет гормональный дисбаланс или хочет пройти комплексную диагностику.", "Longevity programs are suitable for anyone who wants to maintain health and activity for years to come. Especially recommended for people 35+, those experiencing chronic fatigue, hormonal imbalance, or those wanting comprehensive diagnostics.") },
    ],
  });
  console.log("✓ Longevity & Anti-Age");

  // ===== SERVICES FOR NEW CATEGORIES =====

  // Apparatus services
  const apparatusServices = [
    { id: "emface", uk: "EMFACE", ru: "EMFACE", en: "EMFACE", sUk: "Революційна процедура одночасного ліфтингу та тонізації м'язів обличчя без голок та хірургії. Єдиний в Україні апарат.", sRu: "Революционная процедура одновременного лифтинга и тонизации мышц лица без игл и хирургии. Единственный в Украине аппарат.", sEn: "Revolutionary procedure for simultaneous facial lifting and muscle toning without needles or surgery. The only device in Ukraine.", order: 1 },
    { id: "volnewmer", uk: "VOLNEWMER", ru: "VOLNEWMER", en: "VOLNEWMER", sUk: "Процедура глибокого прогрівання шкіри, яка підтягує обличчя та підвищує щільність шкіри.", sRu: "Процедура глубокого прогревания кожи, которая подтягивает лицо и повышает плотность кожи.", sEn: "Deep skin heating procedure that lifts the face and increases skin density.", order: 2 },
    { id: "exion", uk: "EXION", ru: "EXION", en: "EXION", sUk: "Монополярний радіочастотний ліфтинг та фракційне мікроголкове впливання для оновлення шкіри обличчя.", sRu: "Монополярный радиочастотный лифтинг и фракционное микроигольчатое воздействие для обновления кожи лица.", sEn: "Monopolar radiofrequency lifting and fractional micro-needling for facial skin renewal.", order: 3 },
    { id: "ultraformer-mpt", uk: "Ultraformer MPT", ru: "Ultraformer MPT", en: "Ultraformer MPT", sUk: "Безінвазивний SMAS-ліфтинг на апараті нового покоління, який працює на глибоких шарах шкіри.", sRu: "Безинвазивный SMAS-лифтинг на аппарате нового поколения, работающем на глубоких слоях кожи.", sEn: "Non-invasive SMAS lifting with a next-generation device working on deep skin layers.", order: 4 },
    { id: "emsculpt-neo", uk: "EMSCULPT NEO", ru: "EMSCULPT NEO", en: "EMSCULPT NEO", sUk: "Процедура для корекції фігури, яка одночасно зміцнює м'язи та зменшує жирові відкладення.", sRu: "Процедура коррекции фигуры, одновременно укрепляющая мышцы и уменьшающая жировые отложения.", sEn: "Body contouring procedure that simultaneously strengthens muscles and reduces fat deposits.", order: 5 },
    { id: "ultraformer-mpt-body", uk: "Ultraformer MPT Body", ru: "Ultraformer MPT Body", en: "Ultraformer MPT Body", sUk: "Процедура для підтягання та корекції тіла без хірургічного втручання.", sRu: "Процедура для подтяжки и коррекции тела без хирургического вмешательства.", sEn: "Non-surgical body lifting and contouring procedure.", order: 6 },
    { id: "exion-body", uk: "EXION Body", ru: "EXION Body", en: "EXION Body", sUk: "Апаратна процедура для підвищення тонусу шкіри та зменшення об'ємів тіла.", sRu: "Аппаратная процедура для повышения тонуса кожи и уменьшения объёмов тела.", sEn: "Apparatus procedure for improving skin tone and reducing body volume.", order: 7 },
    { id: "m22-stellar-black", uk: "M22 Stellar Black", ru: "M22 Stellar Black", en: "M22 Stellar Black", sUk: "Мультиплатформна система IPL для фотоомолодження, лікування пігментації та судинних змін.", sRu: "Мультиплатформная система IPL для фотоомоложения, лечения пигментации и сосудистых изменений.", sEn: "Multi-platform IPL system for photorejuvenation, pigmentation and vascular treatment.", order: 8 },
    { id: "splendor-x", uk: "Splendor X", ru: "Splendor X", en: "Splendor X", sUk: "Преміальний лазер для епіляції з технологією BLEND X — подвійна довжина хвилі для будь-якого типу шкіри.", sRu: "Премиальный лазер для эпиляции с технологией BLEND X — двойная длина волны для любого типа кожи.", sEn: "Premium hair removal laser with BLEND X technology — dual wavelength for any skin type.", order: 9 },
    { id: "hydrafacial", uk: "HydraFacial", ru: "HydraFacial", en: "HydraFacial", sUk: "Багатоетапна процедура глибокого очищення, ексфоліації, зволоження та захисту шкіри обличчя.", sRu: "Многоэтапная процедура глубокого очищения, эксфолиации, увлажнения и защиты кожи лица.", sEn: "Multi-step procedure for deep cleansing, exfoliation, hydration and facial skin protection.", order: 10 },
    { id: "acupulse-co2", uk: "AcuPulse CO₂", ru: "AcuPulse CO₂", en: "AcuPulse CO₂", sUk: "Фракційний CO₂ лазер для шліфування шкіри, видалення рубців та глибокого омолодження.", sRu: "Фракционный CO₂ лазер для шлифовки кожи, удаления рубцов и глубокого омоложения.", sEn: "Fractional CO₂ laser for skin resurfacing, scar removal and deep rejuvenation.", order: 11 },
  ];

  for (const svc of apparatusServices) {
    await client.createOrReplace({
      _id: `service-${svc.id}`,
      _type: "service",
      title: { _type: "localeString", uk: svc.uk, ru: svc.ru, en: svc.en },
      slug: { _type: "slug", current: svc.id },
      category: { _type: "reference", _ref: "category-apparatus-cosmetology" },
      summary: { _type: "localeText", uk: svc.sUk, ru: svc.sRu, en: svc.sEn },
      order: svc.order,
    });
  }
  console.log("✓ 11 apparatus services");

  // Intimate services
  const intimateServices = [
    { id: "monopolar-rf-lifting", uk: "Монополярний RF-ліфтинг", ru: "Монополярный RF-лифтинг", en: "Monopolar RF Lifting", sUk: "Безінвазивна процедура підтягування та відновлення тонусу тканин інтимної зони за допомогою радіочастотної енергії.", sRu: "Безинвазивная процедура подтяжки и восстановления тонуса тканей интимной зоны с помощью радиочастотной энергии.", sEn: "Non-invasive procedure for lifting and restoring intimate zone tissue tone using radiofrequency energy.", order: 1 },
    { id: "acupulse-co2-intimate", uk: "AcuPulse CO₂ інтимне омолодження", ru: "AcuPulse CO₂ интимное омоложение", en: "AcuPulse CO₂ Intimate Rejuvenation", sUk: "Фракційний лазер CO₂ для відновлення слизової та шкіри інтимної зони, покращення еластичності та комфорту.", sRu: "Фракционный лазер CO₂ для восстановления слизистой и кожи интимной зоны, улучшения эластичности и комфорта.", sEn: "Fractional CO₂ laser for intimate zone mucosa and skin restoration, improving elasticity and comfort.", order: 2 },
  ];

  for (const svc of intimateServices) {
    await client.createOrReplace({
      _id: `service-${svc.id}`,
      _type: "service",
      title: { _type: "localeString", uk: svc.uk, ru: svc.ru, en: svc.en },
      slug: { _type: "slug", current: svc.id },
      category: { _type: "reference", _ref: "category-intimate-rejuvenation" },
      summary: { _type: "localeText", uk: svc.sUk, ru: svc.sRu, en: svc.sEn },
      order: svc.order,
    });
  }
  console.log("✓ 2 intimate services");

  // Laser services
  const laserServices = [
    { id: "laser-men", uk: "Чоловіча лазерна епіляція", ru: "Мужская лазерная эпиляция", en: "Men's Laser Hair Removal", sUk: "Лазерна епіляція для чоловіків на апараті Splendor X — спина, груди, живіт, руки, ноги та інтимні зони.", sRu: "Лазерная эпиляция для мужчин на аппарате Splendor X — спина, грудь, живот, руки, ноги и интимные зоны.", sEn: "Laser hair removal for men with Splendor X — back, chest, abdomen, arms, legs and intimate areas.", order: 1 },
    { id: "laser-women", uk: "Жіноча лазерна епіляція", ru: "Женская лазерная эпиляция", en: "Women's Laser Hair Removal", sUk: "Лазерна епіляція для жінок на апараті Splendor X — обличчя, підпахви, руки, ноги, зона бікіні та все тіло.", sRu: "Лазерная эпиляция для женщин на аппарате Splendor X — лицо, подмышки, руки, ноги, зона бикини и всё тело.", sEn: "Laser hair removal for women with Splendor X — face, underarms, arms, legs, bikini area and full body.", order: 2 },
  ];

  for (const svc of laserServices) {
    await client.createOrReplace({
      _id: `service-${svc.id}`,
      _type: "service",
      title: { _type: "localeString", uk: svc.uk, ru: svc.ru, en: svc.en },
      slug: { _type: "slug", current: svc.id },
      category: { _type: "reference", _ref: "category-laser-hair-removal" },
      summary: { _type: "localeText", uk: svc.sUk, ru: svc.sRu, en: svc.sEn },
      order: svc.order,
    });
  }
  console.log("✓ 2 laser services");

  // Longevity services
  const longevityServices = [
    { id: "check-up-40", uk: "Check-Up 40+", ru: "Check-Up 40+", en: "Check-Up 40+", sUk: "Комплексна програма діагностики для пацієнтів 40+ років: аналізи, апаратна діагностика, консультації спеціалістів та персоналізований план здоров'я.", sRu: "Комплексная программа диагностики для пациентов 40+ лет: анализы, аппаратная диагностика, консультации специалистов и персонализированный план здоровья.", sEn: "Comprehensive diagnostic program for patients 40+: lab tests, apparatus diagnostics, specialist consultations and personalized health plan.", order: 1 },
    { id: "longevity-program", uk: "Longevity програма", ru: "Longevity программа", en: "Longevity Program", sUk: "Індивідуальна програма довголіття на основі глибокої діагностики: оптимізація метаболізму, клітинного здоров'я та якості життя.", sRu: "Индивидуальная программа долголетия на основе глубокой диагностики: оптимизация метаболизма, клеточного здоровья и качества жизни.", sEn: "Individual longevity program based on deep diagnostics: metabolism optimization, cellular health and quality of life.", order: 2 },
    { id: "hormonal-balance", uk: "Гормональний баланс", ru: "Гормональный баланс", en: "Hormonal Balance", sUk: "Діагностика та корекція гормонального дисбалансу: щитоподібна залоза, статеві гормони, наднирники, інсулінорезистентність.", sRu: "Диагностика и коррекция гормонального дисбаланса: щитовидная железа, половые гормоны, надпочечники, инсулинорезистентность.", sEn: "Diagnostics and correction of hormonal imbalance: thyroid, sex hormones, adrenals, insulin resistance.", order: 3 },
    { id: "iv-therapy", uk: "IV-терапія", ru: "IV-терапия", en: "IV Therapy", sUk: "Внутрішньовенне введення вітамінів, мінералів та амінокислот для швидкого відновлення організму, підвищення енергії та імунітету.", sRu: "Внутривенное введение витаминов, минералов и аминокислот для быстрого восстановления организма, повышения энергии и иммунитета.", sEn: "Intravenous administration of vitamins, minerals and amino acids for rapid body recovery, energy and immunity boost.", order: 4 },
    { id: "nutraceuticals", uk: "Нутрицевтика", ru: "Нутрицевтика", en: "Nutraceuticals", sUk: "Персоналізований підбір дієтичних добавок та нутрицевтиків на основі лабораторної діагностики для оптимізації здоров'я.", sRu: "Персонализированный подбор диетических добавок и нутрицевтиков на основе лабораторной диагностики для оптимизации здоровья.", sEn: "Personalized selection of dietary supplements and nutraceuticals based on laboratory diagnostics for health optimization.", order: 5 },
  ];

  for (const svc of longevityServices) {
    await client.createOrReplace({
      _id: `service-${svc.id}`,
      _type: "service",
      title: { _type: "localeString", uk: svc.uk, ru: svc.ru, en: svc.en },
      slug: { _type: "slug", current: svc.id },
      category: { _type: "reference", _ref: "category-longevity" },
      summary: { _type: "localeText", uk: svc.sUk, ru: svc.sRu, en: svc.sEn },
      order: svc.order,
    });
  }
  console.log("✓ 5 longevity services");

  // Add priceTeaser to injectable cosmetology (missing per spec)
  const injectableCat = await client.getDocument("category-injectable-cosmetology");
  if (injectableCat) {
    const sections = (injectableCat.sections as unknown[]) || [];
    const hasPriceTeaser = sections.some((s: any) => s._type === "section.priceTeaser");
    if (!hasPriceTeaser) {
      await client.patch("category-injectable-cosmetology")
        .append("sections", [{
          _type: "section.priceTeaser",
          _key: "price",
          heading: ls("Вартість ін'єкційних процедур у Дніпрі", "Стоимость инъекционных процедур в Днепре", "Injectable Procedures Pricing in Dnipro"),
          intro: lt("Вартість ін'єкційних процедур залежить від типу препарату, обсягу корекції та зони обробки. Для точного розрахунку запишіться на безкоштовну консультацію до нашого лікаря.", "Стоимость инъекционных процедур зависит от типа препарата, объёма коррекции и зоны обработки. Для точного расчёта запишитесь на бесплатную консультацию к нашему врачу.", "Injectable procedure pricing depends on the product type, correction volume and treatment area. Book a free consultation with our physician for an exact calculation."),
          ctaLabel: ls("Дізнатися вартість", "Узнать стоимость", "Get pricing"),
        }])
        .commit();
      console.log("✓ Added priceTeaser to injectable cosmetology");
    }
  }

  console.log("\n✅ All categories and services seeded!");
  console.log("Categories: 5 (injectable ✓, apparatus ✓, intimate ✓, laser ✓, longevity ✓)");
  console.log("Services: 30 total (10 injectable + 11 apparatus + 2 intimate + 2 laser + 5 longevity)");
}

main().catch(console.error);
