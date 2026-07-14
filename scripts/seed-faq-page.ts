/**
 * Seed the curated general FAQ shown on the dedicated /faq page.
 * Items live in faq_items with owner_type='faq_page' + a fixed sentinel owner_id,
 * grouped by `category`. Content is OPERATIONAL only (no medical claims) and is a
 * DRAFT for the clinic to verify/edit in /admin/faq before this goes to production.
 * Idempotent: clears existing faq_page rows, then re-inserts.
 *
 * Run: npx tsx scripts/seed-faq-page.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const OWNER_ID = "00000000-0000-0000-0000-0000000000fa";
const sql = postgres(process.env.DATABASE_URL!);

interface Item {
  category: "booking" | "preparation" | "payment" | "safety" | "lab" | "visit";
  q_uk: string; q_ru: string; q_en: string;
  a_uk: string; a_ru: string; a_en: string;
}

const ITEMS: Item[] = [
  // ── Запис і консультація ──────────────────────────────────────────────
  {
    category: "booking",
    q_uk: "Як записатися на консультацію?",
    q_ru: "Как записаться на консультацию?",
    q_en: "How do I book a consultation?",
    a_uk: "Записатися можна кількома способами: онлайн через форму на сайті, за телефонами +380 73 000 0150 та +380 93 000 0150 або в Instagram @genevity.center. Адміністратор підбере зручний час і профільного лікаря під ваш запит.",
    a_ru: "Записаться можно несколькими способами: онлайн через форму на сайте, по телефонам +380 73 000 0150 и +380 93 000 0150 или в Instagram @genevity.center. Администратор подберёт удобное время и профильного врача под ваш запрос.",
    a_en: "You can book in several ways: online via the website form, by phone on +380 73 000 0150 and +380 93 000 0150, or through Instagram @genevity.center. Our administrator will arrange a convenient time and the right specialist for your request.",
  },
  {
    category: "booking",
    q_uk: "Чи обов'язкова консультація перед процедурою?",
    q_ru: "Обязательна ли консультация перед процедурой?",
    q_en: "Is a consultation required before a procedure?",
    a_uk: "Так. Перед будь-якою процедурою лікар проводить консультацію: оцінює показання та протипоказання, збирає анамнез і підбирає персоналізований протокол. Це основа прогнозованого та безпечного результату.",
    a_ru: "Да. Перед любой процедурой врач проводит консультацию: оценивает показания и противопоказания, собирает анамнез и подбирает персонализированный протокол. Это основа прогнозируемого и безопасного результата.",
    a_en: "Yes. Before any procedure the doctor holds a consultation: assessing indications and contraindications, taking your history and building a personalised protocol. This is the basis of a predictable, safe result.",
  },
  {
    category: "booking",
    q_uk: "Скільки триває консультація і що на неї взяти?",
    q_ru: "Сколько длится консультация и что взять с собой?",
    q_en: "How long is a consultation and what should I bring?",
    a_uk: "Консультація зазвичай триває 30–60 хвилин. Візьміть із собою результати попередніх обстежень і список ліків, які приймаєте, — це допоможе лікарю скласти повнішу картину.",
    a_ru: "Консультация обычно длится 30–60 минут. Возьмите с собой результаты предыдущих обследований и список препаратов, которые принимаете, — это поможет врачу составить более полную картину.",
    a_en: "A consultation usually lasts 30–60 minutes. Please bring the results of any previous tests and a list of medicines you take — it helps the doctor build a fuller picture.",
  },

  // ── Підготовка до візиту ──────────────────────────────────────────────
  {
    category: "preparation",
    q_uk: "Як підготуватися до першого візиту?",
    q_ru: "Как подготовиться к первому визиту?",
    q_en: "How do I prepare for a first visit?",
    a_uk: "Спеціальна підготовка до консультації не потрібна. Якщо візит передбачає діагностику чи процедуру, адміністратор заздалегідь надішле індивідуальні рекомендації — наприклад, прийти натще для окремих аналізів.",
    a_ru: "Специальная подготовка к консультации не нужна. Если визит предполагает диагностику или процедуру, администратор заранее пришлёт индивидуальные рекомендации — например, прийти натощак для отдельных анализов.",
    a_en: "No special preparation is needed for a consultation. If your visit involves diagnostics or a procedure, the administrator will send tailored guidance in advance — for example, arriving fasting for certain tests.",
  },
  {
    category: "preparation",
    q_uk: "Чи можна приходити з макіяжем на косметологічні процедури?",
    q_ru: "Можно ли приходить с макияжем на косметологические процедуры?",
    q_en: "Can I wear make-up to cosmetology procedures?",
    a_uk: "На апаратні та ін'єкційні процедури краще приходити без макіяжу, або ми делікатно очистимо шкіру на місці. Це потрібно для точної роботи лікаря та гігієни.",
    a_ru: "На аппаратные и инъекционные процедуры лучше приходить без макияжа, либо мы деликатно очистим кожу на месте. Это нужно для точной работы врача и гигиены.",
    a_en: "For device-based and injectable procedures it's best to arrive without make-up, or we'll gently cleanse the skin on-site. This allows precise work and proper hygiene.",
  },
  {
    category: "preparation",
    q_uk: "Чи потрібні аналізи перед процедурами?",
    q_ru: "Нужны ли анализы перед процедурами?",
    q_en: "Do I need tests before procedures?",
    a_uk: "Для більшості естетичних процедур окремі аналізи не потрібні. Для longevity-програм, IV-терапії чи гормональних протоколів лікар може призначити обстеження — їх можна здати у власній лабораторії центру.",
    a_ru: "Для большинства эстетических процедур отдельные анализы не нужны. Для longevity-программ, IV-терапии или гормональных протоколов врач может назначить обследование — его можно пройти в собственной лаборатории центра.",
    a_en: "Most aesthetic procedures don't require separate tests. For longevity programmes, IV therapy or hormonal protocols the doctor may order tests — which you can take in the centre's own laboratory.",
  },

  // ── Оплата і документи ────────────────────────────────────────────────
  {
    category: "payment",
    q_uk: "Які способи оплати доступні?",
    q_ru: "Какие способы оплаты доступны?",
    q_en: "What payment methods are available?",
    a_uk: "Оплатити послуги можна готівкою та банківською карткою в центрі. Точну вартість лікар озвучує після консультації — коли протокол уже підібрано під ваш випадок.",
    a_ru: "Оплатить услуги можно наличными и банковской картой в центре. Точную стоимость врач озвучивает после консультации — когда протокол уже подобран под ваш случай.",
    a_en: "You can pay by cash or bank card at the centre. The exact cost is confirmed by the doctor after your consultation — once the protocol has been tailored to your case.",
  },
  {
    category: "payment",
    q_uk: "Чи можна отримати документи для страхової?",
    q_ru: "Можно ли получить документы для страховой?",
    q_en: "Can I get documents for insurance?",
    a_uk: "Так. За запитом ми надаємо договір, чек та довідку про надані послуги. Якщо документи потрібні для страхової компанії, попередьте адміністратора заздалегідь.",
    a_ru: "Да. По запросу мы предоставляем договор, чек и справку об оказанных услугах. Если документы нужны для страховой компании, предупредите администратора заранее.",
    a_en: "Yes. On request we provide a contract, receipt and a certificate of services rendered. If you need documents for an insurance company, please let the administrator know in advance.",
  },
  {
    category: "payment",
    q_uk: "Чи є пакетні умови на курс процедур?",
    q_ru: "Есть ли пакетные условия на курс процедур?",
    q_en: "Are there package options for a course of treatments?",
    a_uk: "Для курсових методик і longevity-програм передбачені пакетні умови. Лікар та адміністратор розкажуть про доступні варіанти на консультації, орієнтуючись на ваш протокол.",
    a_ru: "Для курсовых методик и longevity-программ предусмотрены пакетные условия. Врач и администратор расскажут о доступных вариантах на консультации, ориентируясь на ваш протокол.",
    a_en: "Course-based treatments and longevity programmes come with package options. The doctor and administrator will explain the available choices during your consultation, based on your protocol.",
  },

  // ── Безпека і гарантії ────────────────────────────────────────────────
  {
    category: "safety",
    q_uk: "Чи має центр ліцензію на медичну діяльність?",
    q_ru: "Есть ли у центра лицензия на медицинскую деятельность?",
    q_en: "Does the centre hold a medical licence?",
    a_uk: "Так. GENEVITY працює за ліцензією МОЗ України № 1296 від 14.08.2025. Усі процедури виконують лікарі з профільною освітою, на сертифікованому обладнанні та препаратах.",
    a_ru: "Да. GENEVITY работает по лицензии МОЗ Украины № 1296 от 14.08.2025. Все процедуры выполняют врачи с профильным образованием, на сертифицированном оборудовании и препаратах.",
    a_en: "Yes. GENEVITY operates under licence No. 1296 (14.08.2025) from the Ministry of Health of Ukraine. All procedures are performed by qualified doctors using certified devices and products.",
  },
  {
    category: "safety",
    q_uk: "Як забезпечується стерильність і безпека?",
    q_ru: "Как обеспечивается стерильность и безопасность?",
    q_en: "How are sterility and safety ensured?",
    a_uk: "Ми використовуємо одноразові витратні матеріали, сертифіковані препарати та контроль стерилізації інструментів. Перед процедурою лікар перевіряє показання та протипоказання — це стандарт для кожного пацієнта.",
    a_ru: "Мы используем одноразовые расходные материалы, сертифицированные препараты и контроль стерилизации инструментов. Перед процедурой врач проверяет показания и противопоказания — это стандарт для каждого пациента.",
    a_en: "We use single-use consumables, certified products and controlled instrument sterilisation. Before each procedure the doctor checks indications and contraindications — a standard applied to every patient.",
  },
  {
    category: "safety",
    q_uk: "Що робити, якщо після процедури виникли питання?",
    q_ru: "Что делать, если после процедуры возникли вопросы?",
    q_en: "What if I have questions after a procedure?",
    a_uk: "Зв'яжіться з нами за телефоном — лікар проконсультує та за потреби запросить на огляд. Ми супроводжуємо пацієнта і після процедури, а не лише під час неї.",
    a_ru: "Свяжитесь с нами по телефону — врач проконсультирует и при необходимости пригласит на осмотр. Мы сопровождаем пациента и после процедуры, а не только во время неё.",
    a_en: "Contact us by phone — the doctor will advise and, if needed, invite you for a follow-up. We support our patients after a procedure, not only during it.",
  },

  // ── Лабораторія і діагностика ─────────────────────────────────────────
  {
    category: "lab",
    q_uk: "Чи є у центрі власна лабораторія?",
    q_ru: "Есть ли у центра собственная лаборатория?",
    q_en: "Does the centre have its own laboratory?",
    a_uk: "Так. GENEVITY має власну клініко-діагностичну лабораторію на місці. Це прискорює отримання результатів і дає лікарю точні дані для персоналізованого протоколу.",
    a_ru: "Да. У GENEVITY есть собственная клинико-диагностическая лаборатория на месте. Это ускоряет получение результатов и даёт врачу точные данные для персонализированного протокола.",
    a_en: "Yes. GENEVITY has its own on-site clinical diagnostic laboratory. This speeds up results and gives the doctor accurate data for a personalised protocol.",
  },
  {
    category: "lab",
    q_uk: "Як швидко готові результати аналізів?",
    q_ru: "Как быстро готовы результаты анализов?",
    q_en: "How soon are test results ready?",
    a_uk: "Терміни залежать від типу дослідження — від кількох годин до кількох днів. Точний час адміністратор повідомить під час здачі аналізів.",
    a_ru: "Сроки зависят от типа исследования — от нескольких часов до нескольких дней. Точное время администратор сообщит при сдаче анализов.",
    a_en: "Turnaround depends on the type of test — from a few hours to a few days. The administrator will tell you the exact timing when you take the tests.",
  },
  {
    category: "lab",
    q_uk: "Чи можна пройти діагностику без прив'язки до процедур?",
    q_ru: "Можно ли пройти диагностику отдельно от процедур?",
    q_en: "Can I have diagnostics without booking a procedure?",
    a_uk: "Так. Check-up та діагностику можна пройти окремо — наприклад, УЗД, аналіз складу тіла на InBody чи лабораторну панель. За результатами лікар за бажанням складе план подальших дій.",
    a_ru: "Да. Check-up и диагностику можно пройти отдельно — например, УЗИ, анализ состава тела на InBody или лабораторную панель. По результатам врач при желании составит план дальнейших действий.",
    a_en: "Yes. You can have a check-up or diagnostics on their own — for example, ultrasound, InBody body-composition analysis or a lab panel. Based on the results the doctor can, if you wish, outline next steps.",
  },

  // ── Перший візит ──────────────────────────────────────────────────────
  {
    category: "visit",
    q_uk: "Де ви розташовані та які години роботи?",
    q_ru: "Где вы находитесь и какие часы работы?",
    q_en: "Where are you located and what are your hours?",
    a_uk: "Ми у Дніпрі, на вул. Олеся Гончара, 12. Центр працює щодня з 08:00 до 20:00. Актуальний графік і карту проїзду знайдете на сторінці контактів.",
    a_ru: "Мы в Днепре, на ул. Олеся Гончара, 12. Центр работает ежедневно с 08:00 до 20:00. Актуальный график и карту проезда найдёте на странице контактов.",
    a_en: "We're in Dnipro, at 12 Oles Honchar St. The centre is open daily from 08:00 to 20:00. You'll find the current schedule and directions on our contacts page.",
  },
  {
    category: "visit",
    q_uk: "Чи можна прийти на консультацію із супроводом?",
    q_ru: "Можно ли прийти на консультацию с сопровождением?",
    q_en: "May I bring someone with me?",
    a_uk: "Так, ви можете прийти із супроводом. Якщо плануєте процедуру, попередьте адміністратора заздалегідь — ми підкажемо, як зробити візит комфортним для всіх.",
    a_ru: "Да, вы можете прийти с сопровождением. Если планируете процедуру, предупредите администратора заранее — мы подскажем, как сделать визит комфортным для всех.",
    a_en: "Yes, you're welcome to bring someone. If you're planning a procedure, let the administrator know in advance — we'll help make the visit comfortable for everyone.",
  },
  {
    category: "visit",
    q_uk: "Скільки часу закладати на перший візит?",
    q_ru: "Сколько времени закладывать на первый визит?",
    q_en: "How much time should I allow for a first visit?",
    a_uk: "На перший візит закладіть 60–90 хвилин: консультація, за потреби діагностика та обговорення протоколу. Точніше зорієнтує адміністратор під час запису.",
    a_ru: "На первый визит заложите 60–90 минут: консультация, при необходимости диагностика и обсуждение протокола. Точнее сориентирует администратор при записи.",
    a_en: "Allow 60–90 minutes for a first visit: the consultation, any diagnostics and a discussion of your protocol. The administrator will give you a more precise estimate when booking.",
  },
];

async function main() {
  await sql`DELETE FROM faq_items WHERE owner_type = 'faq_page'`;
  let i = 0;
  for (const it of ITEMS) {
    await sql`
      INSERT INTO faq_items (owner_type, owner_id, category, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES ('faq_page', ${OWNER_ID}, ${it.category}, ${it.q_uk}, ${it.q_ru}, ${it.q_en}, ${it.a_uk}, ${it.a_ru}, ${it.a_en}, ${i})
    `;
    i += 1;
  }
  const counts = await sql`
    SELECT category, COUNT(*)::int n FROM faq_items WHERE owner_type = 'faq_page' GROUP BY category ORDER BY MIN(sort_order)
  `;
  console.log(`Seeded ${ITEMS.length} faq_page items.`);
  console.table(counts);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
