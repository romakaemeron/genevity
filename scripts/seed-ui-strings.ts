import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type L = { uk: string; ru: string; en: string };
const L = (uk: string, ru: string, en: string): L => ({ uk, ru, en });

/**
 * Canonical UI strings tree. Every leaf is a {uk,ru,en} triplet.
 * Existing DB rows for known namespaces are preserved (only missing keys are added).
 */
const canonical = {
  // Top-bar / mega menu
  nav: {
    home: L("Головна", "Главная", "Home"),
    about: L("Про центр", "О центре", "About"),
    services: L("Послуги", "Услуги", "Services"),
    doctors: L("Лікарі", "Врачи", "Doctors"),
    contacts: L("Контакти", "Контакты", "Contacts"),
    blog: L("Блог", "Блог", "Blog"),
    stationary: L("Стаціонар", "Стационар", "Stationary"),
    laboratory: L("Лабораторія", "Лаборатория", "Laboratory"),
    prices: L("Ціни", "Цены", "Prices"),
    cta: L("Записатися", "Записаться", "Book Now"),
  },

  // Generic labels used across many components (replaces src/lib/ui-strings.ts)
  labels: {
    home: L("Головна", "Главная", "Home"),
    services: L("Послуги", "Услуги", "Services"),
    procedures: L("Процедури", "Процедуры", "Procedures"),
    faq: L("Часті запитання", "Часто задаваемые вопросы", "FAQ"),
    bookConsultation: L("Записатися на консультацію", "Записаться на консультацию", "Book a consultation"),
    book: L("Записатися", "Записаться", "Book now"),
    bookCta: L("Запишіться на консультацію", "Запишитесь на консультацию", "Book a consultation"),
    ctaSubtitle: L("Наші спеціалісти підберуть оптимальну програму саме для вас", "Наши специалисты подберут оптимальную программу именно для вас", "Our specialists will create the optimal program for you"),
    ourSpecialists: L("Наші спеціалісти", "Наши специалисты", "Our specialists"),
    alsoInteresting: L("Вас також може зацікавити", "Вас также может заинтересовать", "You may also be interested in"),
    learnMore: L("Детальніше", "Подробнее", "Learn more"),
    toc: L("Зміст", "Содержание", "Contents"),
    duration: L("Тривалість", "Длительность", "Duration"),
    effect: L("Ефект", "Эффект", "Effect"),
    sessions: L("Сеанси", "Сеансы", "Sessions"),
    price: L("Вартість", "Стоимость", "Price"),
    meetDoctors: L("Познайомтеся з нашими лікарями", "Познакомьтесь с нашими врачами", "Meet our doctors"),
    allDoctors: L("Всі лікарі", "Все врачи", "All doctors"),
    viewAllProcedures: L("Всі процедури", "Все процедуры", "All procedures"),
    typesOfProcedures: L("Види процедур", "Виды процедур", "Types of Procedures"),
    viewProcedures: L("Дивитися процедури", "Смотреть процедуры", "View procedures"),
    close: L("Закрити", "Закрыть", "Close"),
    next: L("Далі", "Далее", "Next"),
    prev: L("Назад", "Назад", "Back"),
    from: L("від", "от", "from"),
    perZone: L("за зону", "за зону", "per zone"),
    sendRequest: L("Надіслати заявку", "Отправить заявку", "Send request"),
  },

  // Nav
  meta: {
    title: L(
      "Genevity — Центр довголіття та якості життя у Дніпрі",
      "Genevity — Центр долголетия и качества жизни в Днепре",
      "Genevity — Longevity & Quality of Life Center in Dnipro",
    ),
    description: L(
      "Персоналізовані програми здоров'я, відновлення та омолодження на основі сучасної діагностики та інноваційних технологій.",
      "Персонализированные программы здоровья, восстановления и омоложения на основе современной диагностики и инновационных технологий.",
      "Personalized health, recovery, and rejuvenation programs based on modern diagnostics and innovative technologies.",
    ),
  },

  // Homepage hero — the SLIDE images' alt texts and static marketing copy
  homeHero: {
    imageAlt: L("Інтер'єр преміальної клініки довголіття GENEVITY у Дніпрі", "Интерьер премиальной клиники долголетия GENEVITY в Днепре", "Interior of GENEVITY premium longevity clinic in Dnipro"),
    slide1Caption: L("Зал апаратної косметології", "Зал аппаратной косметологии", "Apparatus cosmetology hall"),
    slide2Caption: L("Кабінет лікаря", "Кабинет врача", "Doctor's office"),
    slide3Caption: L("Приміщення для процедур", "Помещение для процедур", "Procedure room"),
  },

  // Homepage "Advantages" block — hardcoded in src/components/home/Advantages.tsx
  advantages: {
    title: L("Чому обирають GENEVITY", "Почему выбирают GENEVITY", "Why choose GENEVITY"),
    subtitle: L("Усе для вашого здоров'я в одному місці", "Всё для вашего здоровья в одном месте", "Everything for your health in one place"),
    equipment: {
      title: L("Передове обладнання", "Передовое оборудование", "Advanced Equipment"),
      desc: L(
        "Апарати преміум-класу від BTL, Lumenis, InMode, Hydrafacial — деякі з них єдині в Україні. Сертифіковані FDA та CE",
        "Аппараты премиум-класса от BTL, Lumenis, InMode, Hydrafacial — некоторые из них единственные в Украине. Сертифицированы FDA и CE",
        "Premium-class devices from BTL, Lumenis, InMode, Hydrafacial — some unique in Ukraine. FDA and CE certified",
      ),
    },
    team: {
      title: L("Команда експертів", "Команда экспертов", "Expert Team"),
      desc: L(
        "Лікарі з 10+ років досвіду в естетичній медицині та longevity",
        "Врачи с 10+ лет опыта в эстетической медицине и longevity",
        "Doctors with 10+ years of experience in aesthetic medicine and longevity",
      ),
    },
    longevity: {
      title: L("Програми довголіття", "Программы долголетия", "Longevity Programs"),
      desc: L(
        "Від глибокої діагностики до гормонального балансу, нутриціології та естетики — персональний протокол довголіття",
        "От глубокой диагностики до гормонального баланса, нутрициологии и эстетики — персональный протокол долголетия",
        "From deep diagnostics to hormonal balance, nutrition and aesthetics — personal longevity protocol",
      ),
    },
    stationary: {
      title: L("Денний стаціонар", "Дневной стационар", "Day Stationary"),
      desc: L(
        "Комфортні палати, медичний нагляд, IV-терапія та відновлення після процедур",
        "Комфортные палаты, медицинский надзор, IV-терапия и восстановление после процедур",
        "Comfortable rooms, medical supervision, IV therapy and post-procedure recovery",
      ),
    },
    laboratory: {
      title: L("Власна лабораторія", "Собственная лаборатория", "Own Laboratory"),
      desc: L(
        "Повний спектр аналізів та діагностики на місці — швидкі результати та точна діагностика",
        "Полный спектр анализов и диагностики на месте — быстрые результаты и точная диагностика",
        "Full range of tests and diagnostics on-site — fast results and accurate diagnosis",
      ),
    },
  },

  // Homepage FAQ — hardcoded in src/components/home/HomeFaq.tsx
  homeFaq: {
    title: L("Часті запитання", "Часто задаваемые вопросы", "Frequently Asked Questions"),
    subtitle: L("Відповіді на найпопулярніші запитання про наші процедури", "Ответы на самые популярные вопросы о наших процедурах", "Answers to the most popular questions about our procedures"),
    q1: {
      question: L("Які процедури пропонує центр естетичної медицини?", "Какие процедуры предлагает центр эстетической медицины?", "What procedures does the aesthetic medicine center offer?"),
      answer: L(
        "GENEVITY пропонує повний спектр процедур естетичної медицини: апаратна косметологія (EMFACE, VOLNEWMER, EXION, ULTRAFORMER), лазерна епіляція SPLENDOR X, ін'єкційні методики, HydraFacial, а також longevity-програми з глибокою діагностикою.",
        "GENEVITY предлагает полный спектр процедур эстетической медицины: аппаратная косметология (EMFACE, VOLNEWMER, EXION, ULTRAFORMER), лазерная эпиляция SPLENDOR X, инъекционные методики, HydraFacial, а также longevity-программы с глубокой диагностикой.",
        "GENEVITY offers a full range of aesthetic medicine procedures: apparatus cosmetology (EMFACE, VOLNEWMER, EXION, ULTRAFORMER), SPLENDOR X laser hair removal, injection techniques, HydraFacial, as well as longevity programs with deep diagnostics.",
      ),
    },
    q2: {
      question: L("Як записатися на консультацію?", "Как записаться на консультацию?", "How do I book a consultation?"),
      answer: L(
        "Записатися на консультацію можна за телефоном +380 73 000 0150, через форму на сайті або безпосередньо у клініці за адресою вул. Олеся Гончара, 12, Дніпро. Наші адміністратори допоможуть обрати зручний час та підготують вас до візиту.",
        "Записаться на консультацию можно по телефону +380 73 000 0150, через форму на сайте или непосредственно в клинике по адресу ул. Олеся Гончара, 12, Днепр. Наши администраторы помогут выбрать удобное время и подготовят вас к визиту.",
        "You can book a consultation by phone +380 73 000 0150, through the website form, or directly at the clinic at 12 Olesia Honchara St, Dnipro. Our administrators will help you choose a convenient time and prepare you for the visit.",
      ),
    },
    q3: {
      question: L("Які кваліфікації мають ваші спеціалісти?", "Какие квалификации имеют ваши специалисты?", "What qualifications do your specialists have?"),
      answer: L(
        "Лікарі GENEVITY мають вищу медичну освіту, спеціалізацію в дерматології, косметології та естетичній медицині, а також регулярно проходять навчання у провідних міжнародних клініках. Кожен спеціаліст має понад 10 років практичного досвіду та сертифікати від виробників обладнання (BTL, Lumenis, InMode).",
        "Врачи GENEVITY имеют высшее медицинское образование, специализацию в дерматологии, косметологии и эстетической медицине, а также регулярно проходят обучение в ведущих международных клиниках. Каждый специалист имеет более 10 лет практического опыта и сертификаты от производителей оборудования (BTL, Lumenis, InMode).",
        "GENEVITY doctors have higher medical education, specialization in dermatology, cosmetology and aesthetic medicine, and regularly undergo training in leading international clinics. Each specialist has over 10 years of practical experience and certificates from equipment manufacturers (BTL, Lumenis, InMode).",
      ),
    },
    q4: {
      question: L("Чи є у вас акції або спеціальні пропозиції?", "Есть ли у вас акции или специальные предложения?", "Do you have any promotions or special offers?"),
      answer: L(
        "Так, GENEVITY регулярно пропонує спеціальні програми та сезонні акції. Для отримання актуальної інформації рекомендуємо зателефонувати нам або слідкувати за оновленнями на нашій сторінці в Instagram @genevity.center.",
        "Да, GENEVITY регулярно предлагает специальные программы и сезонные акции. Для получения актуальной информации рекомендуем позвонить нам или следить за обновлениями на нашей странице в Instagram @genevity.center.",
        "Yes, GENEVITY regularly offers special programs and seasonal promotions. For up-to-date information, we recommend calling us or following updates on our Instagram page @genevity.center.",
      ),
    },
    q5: {
      question: L("Скільки часу займає відновлення після процедур?", "Сколько времени занимает восстановление после процедур?", "How long does recovery take after procedures?"),
      answer: L(
        "Час відновлення залежить від типу процедури. Більшість наших процедур (EMFACE, VOLNEWMER, HydraFacial) не потребують періоду реабілітації — можна одразу повертатися до звичних справ.",
        "Время восстановления зависит от типа процедуры. Большинство наших процедур (EMFACE, VOLNEWMER, HydraFacial) не требуют периода реабилитации — можно сразу возвращаться к обычным делам.",
        "Recovery time depends on the type of procedure. Most of our procedures (EMFACE, VOLNEWMER, HydraFacial) do not require a rehabilitation period — you can immediately return to your usual activities.",
      ),
    },
  },

  // About / About slideshow captions — hardcoded in src/components/home/About.tsx
  aboutSlideshow: {
    slide0: L("Зал апаратної косметології GENEVITY Дніпро", "Зал аппаратной косметологии GENEVITY Днепр", "GENEVITY apparatus cosmetology hall, Dnipro"),
    slide1: L("Інтер'єр медичного центру GENEVITY", "Интерьер медицинского центра GENEVITY", "GENEVITY medical center interior"),
    slide2: L("Кабінет лікаря клініки довголіття GENEVITY", "Кабинет врача клиники долголетия GENEVITY", "Doctor's office at GENEVITY longevity clinic"),
    slide3: L("Апарат HydraFacial у клініці GENEVITY Дніпро", "Аппарат HydraFacial в клинике GENEVITY Днепр", "HydraFacial device at GENEVITY clinic, Dnipro"),
    slide4: L("Лазерне обладнання AcuPulse у GENEVITY", "Лазерное оборудование AcuPulse в GENEVITY", "AcuPulse laser equipment at GENEVITY"),
  },

  // Generic contacts labels
  contacts: {
    title: L("Контакти", "Контакты", "Contacts"),
    instagramLabel: L("Instagram", "Instagram", "Instagram"),
    phoneLabel: L("Телефон", "Телефон", "Phone"),
    addressLabel: L("Адреса", "Адрес", "Address"),
    hoursLabel: L("Графік роботи", "График работы", "Working Hours"),
    writeToUs: L("Напишіть нам", "Напишите нам", "Write to us"),
    bookCta: L("Записатися на консультацію", "Записаться на консультацию", "Book a consultation"),
  },

  // CTA form
  ctaForm: {
    title: L("Готові підкреслити свою природну красу?", "Готовы подчеркнуть свою природную красоту?", "Ready to enhance your natural beauty?"),
    titleAlt: L("Отримати консультацію", "Получить консультацию", "Get a Consultation"),
    name: L("Ваше ім'я", "Ваше имя", "Your name"),
    phone: L("Номер телефону", "Номер телефона", "Phone number"),
    email: L("Email (не обов'язково)", "Email (необязательно)", "Email (optional)"),
    message: L("Повідомлення", "Сообщение", "Message"),
    submit: L("Записатися", "Записаться", "Submit"),
    success: L("Дякуємо! Ми зв'яжемося з вами найближчим часом.", "Спасибо! Мы свяжемся с вами в ближайшее время.", "Thank you! We will contact you shortly."),
    privacyNote: L("Натискаючи кнопку, ви погоджуєтеся з політикою конфіденційності", "Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности", "By clicking, you agree to our privacy policy"),
  },

  // Doctors block
  doctors: {
    title: L("Команда лікарів", "Команда врачей", "Our Medical Team"),
    subtitle: L(
      "Прийом ведуть спеціалісти різних напрямів, що забезпечує комплексний підхід до вашого здоров'я",
      "Приём ведут специалисты различных направлений, что обеспечивает комплексный подход к вашему здоровью",
      "Consultations are provided by specialists across multiple disciplines, ensuring a comprehensive approach to your health",
    ),
    cta: L("Записатися на консультацію", "Записаться на консультацию", "Book a consultation"),
    experience: L("Стаж: {years}", "Стаж: {years}", "Experience: {years}"),
  },

  // Equipment block
  equipment: {
    title: L("Апаратні рішення Genevity", "Аппаратные решения Genevity", "Genevity Hardware Solutions"),
    suitsTitle: L("Підходить, якщо:", "Подходит, если:", "Suitable if:"),
    resultsTitle: L("Результат:", "Результат:", "Results:"),
    details: L("Детальніше", "Подробнее", "Learn More"),
    showMore: L("Показати більше", "Показать ещё", "Show More"),
    showLess: L("Згорнути", "Свернуть", "Show Less"),
    close: L("Закрити", "Закрыть", "Close"),
    tabs: {
      all: L("Всі", "Все", "All"),
      face: L("Обличчя", "Лицо", "Face"),
      body: L("Тіло", "Тело", "Body"),
      skin: L("Шкіра", "Кожа", "Skin"),
      intimate: L("Інтимна зона", "Интимная зона", "Intimate Zone"),
      laser: L("Лазерна епіляція", "Лазерная эпиляция", "Laser Hair Removal"),
    },
  },

  // Footer
  footer: {
    description: L("Центр довголіття та якості життя.", "Центр долголетия и качества жизни.", "Longevity and quality of life center."),
    license: L("Ліцензія МОЗ України № 1296 від 14.08.2025", "Лицензия МОЗ Украины № 1296 от 14.08.2025", "Ministry of Health license № 1296 from 14.08.2025"),
    useful: L("Навігація", "Навигация", "Navigation"),
    contact: L("Контакти", "Контакты", "Contacts"),
    rights: L("Усі права захищені.", "Все права защищены.", "All rights reserved."),
    privacy: L("Політика конфіденційності", "Политика конфиденциальности", "Privacy Policy"),
    terms: L("Умови використання", "Условия использования", "Terms of Use"),
    link_about: L("Про центр", "О центре", "About"),
    link_services: L("Послуги", "Услуги", "Services"),
    link_doctors: L("Наші лікарі", "Наши врачи", "Our doctors"),
    link_contacts: L("Контакти", "Контакты", "Contacts"),
    link_stationary: L("Стаціонар", "Стационар", "Stationary"),
    link_laboratory: L("Лабораторія", "Лаборатория", "Laboratory"),
  },

  // Contacts page extras
  contactsPage: {
    heroTitle: L("Зв'яжіться з нами", "Свяжитесь с нами", "Get in touch"),
    heroSubtitle: L(
      "Наша команда готова відповісти на будь-які ваші запитання та допомогти обрати оптимальну програму.",
      "Наша команда готова ответить на любые ваши вопросы и помочь выбрать оптимальную программу.",
      "Our team is ready to answer any questions and help you choose the optimal program.",
    ),
    callUs: L("Зателефонувати", "Позвонить", "Call us"),
    visitUs: L("Відвідати", "Посетить", "Visit us"),
    hoursTitle: L("Ми працюємо", "Мы работаем", "We are open"),
    mapTitle: L("Як нас знайти", "Как нас найти", "How to find us"),
  },

  // Stationary page — the inline L() blocks from components/pages/StationaryPage.tsx
  stationaryPage: {
    comfort: {
      title: L("Комфорт та безпека", "Комфорт и безопасность", "Comfort & Safety"),
      subtitle: L(
        "Денний стаціонар GENEVITY — це сучасний медичний простір у центрі Дніпра, де кожен пацієнт отримує індивідуальний підхід, повну конфіденційність та медичну допомогу найвищого рівня.",
        "Дневной стационар GENEVITY — это современное медицинское пространство в центре Днепра, где каждый пациент получает индивидуальный подход, полную конфиденциальность и медицинскую помощь высочайшего уровня.",
        "GENEVITY day stationary is a modern medical space in central Dnipro where every patient receives an individual approach, complete confidentiality and the highest level of medical care.",
      ),
    },
    feature_rooms: { label: L("Індивідуальні палати", "Индивидуальные палаты", "Private rooms"), desc: L("Затишні окремі палати з усім необхідним для комфортного відпочинку. Зручне ліжко, кондиціонування, Wi-Fi та телевізор. Палати обладнані кнопкою виклику медперсоналу.", "Уютные отдельные палаты со всем необходимым для комфортного отдыха. Удобная кровать, кондиционирование, Wi-Fi и телевизор. Палаты оборудованы кнопкой вызова медперсонала.", "Cozy private rooms with everything needed for comfortable rest. Comfortable bed, air conditioning, Wi-Fi and TV. Rooms equipped with staff call button.") },
    feature_monitoring: { label: L("Медичний моніторинг", "Медицинский мониторинг", "Medical monitoring"), desc: L("Постійний контроль стану пацієнта сучасним обладнанням моніторингу. Лікар та медсестра доступні протягом усього перебування.", "Постоянный контроль состояния пациента современным оборудованием мониторинга. Врач и медсестра доступны в течение всего пребывания.", "Continuous patient monitoring with modern equipment. Physician and nurse available throughout the entire stay.") },
    feature_care: { label: L("Персональний супровід", "Персональное сопровождение", "Personal care"), desc: L("Індивідуальний медичний супровід від лікаря та медсестри на кожному етапі. Персоналізований план лікування та догляду.", "Индивидуальное медицинское сопровождение от врача и медсестры на каждом этапе. Персонализированный план лечения и ухода.", "Individual medical care from physician and nurse at every stage. Personalized treatment and care plan.") },
    feature_privacy: { label: L("Конфіденційність", "Конфиденциальность", "Confidentiality"), desc: L("Повна приватність та конфіденційність вашого лікування. Інформація про перебування та процедури не розголошується третім особам.", "Полная приватность и конфиденциальность вашего лечения. Информация о пребывании и процедурах не разглашается третьим лицам.", "Complete privacy and confidentiality of your treatment. Information about your stay and procedures is not disclosed to third parties.") },
    feature_noqueue: { label: L("Без черг", "Без очередей", "No Queues"), desc: L("Прийом у зручний для вас час без очікування та черг. Гнучкий графік, можливість обрати ранковий або денний час для процедур.", "Приём в удобное для вас время без ожидания и очередей. Гибкий график, возможность выбрать утреннее или дневное время для процедур.", "Appointments at your convenience without waiting or queues. Flexible schedule, choice of morning or daytime slots.") },
    servicesTitle: L("Що ми робимо", "Что мы делаем", "What we do"),
    indicationsTitle: L("Показання для стаціонарного лікування", "Показания для стационарного лечения", "Indications for stationary treatment"),
    stepsTitle: L("Як це працює", "Как это работает", "How it works"),
  },
  // Laboratory page — hardcoded blocks from components/pages/LaboratoryPage.tsx
  laboratoryPage: {
    introTitle: L("Точна діагностика за одне відвідування", "Точная диагностика за одно посещение", "Accurate diagnostics in one visit"),
    introSubtitle: L(
      "Повний спектр лабораторних досліджень та інструментальної діагностики під одним дахом. Швидкі результати, точні висновки, індивідуальні рекомендації.",
      "Полный спектр лабораторных исследований и инструментальной диагностики под одной крышей. Быстрые результаты, точные заключения, индивидуальные рекомендации.",
      "Full range of laboratory tests and instrumental diagnostics under one roof. Fast results, accurate conclusions, personalized recommendations.",
    ),
    servicesTitle: L("Види діагностики", "Виды диагностики", "Diagnostic services"),
    checkupTitle: L("Програми Check-Up", "Программы Check-Up", "Check-Up Programs"),
    stepsTitle: L("Як це працює", "Как это работает", "How it works"),
  },
};

function deepMerge<T extends Record<string, any>>(base: T, extra: T): T {
  const out: any = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    if (v && typeof v === "object" && !Array.isArray(v) && !("uk" in v) && out[k] && typeof out[k] === "object") {
      out[k] = deepMerge(out[k], v);
    } else if (out[k] === undefined) {
      out[k] = v;
    }
    // If existing, keep existing — don't overwrite edits
  }
  return out;
}

async function run() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const existing = rows[0]?.data ?? {};
  const merged = deepMerge(existing, canonical as any);
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(merged)}::jsonb WHERE id = 1`;
  console.log("✓ ui_strings merged (existing values preserved, missing keys added)");
  const after = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  console.log("Top-level keys now:", Object.keys(after[0].data).sort());
}

run().catch((e) => { console.error(e); process.exit(1); });
