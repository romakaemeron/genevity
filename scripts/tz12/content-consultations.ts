/**
 * Consultation pages missing from the site, taken from the clinic's
 * "Консультації лікарів" price list.
 *
 * Already on the site and therefore not re-created here:
 *   косметолог          → diagnostics/cosmetologist
 *   ендокринолог        → diagnostics/endocrinologist
 *   пластичний хірург   → diagnostics/plastic-surgeon
 *   гінеколог           → the /services/gynaecology hub (seo_title "Гінеколог у Дніпрі")
 *   подолог             → the /services/podology hub (seo_title "Подолог у Дніпрі")
 *
 * Online variants in the price list are the same consultation in a different
 * format, so they live as a section inside each page rather than as separate
 * near-duplicate URLs.
 */
import { CONSULTATION_BLOCKS, type ServiceSeed } from "./lib";

const UAH = { uk: "консультація", ru: "консультация", en: "consultation" };

export const consultations: ServiceSeed[] = [
  // ─── ДЕРМАТОЛОГ ───────────────────────────────────────────────────────────
  {
    slug: "dermatologist",
    meta: {
      category: "diagnostics",
      h1: { uk: "Дерматолог в Дніпрі", ru: "Дерматолог в Днепре", en: "Dermatologist in Dnipro" },
      seoTitle: {
        uk: "Дерматолог у Дніпрі - консультація дерматолога",
        ru: "Дерматолог в Днепре - консультация дерматолога",
        en: "Dermatologist in Dnipro - dermatology consultation",
      },
      seoDesc: {
        uk: "Консультація дерматолога у Дніпрі 🤍 GENEVITY. Діагностика висипань, акне, пігментації та огляд родимок 💫 Лікарі з досвідом від 10 років.",
        ru: "Консультация дерматолога в Днепре 🤍 GENEVITY. Диагностика высыпаний, акне, пигментации и осмотр родинок 💫 Врачи с опытом от 10 лет.",
        en: "Dermatologist consultation in Dnipro 🤍 GENEVITY. Diagnosis of rashes, acne and pigmentation, plus mole checks 💫 Physicians with 10+ years of experience.",
      },
    },
    title: { uk: "Консультація дерматолога", ru: "Консультация дерматолога", en: "Dermatologist Consultation" },
    summary: {
      uk: "Консультація дерматолога у GENEVITY: діагностика захворювань шкіри, дерматоскопія родимок, розбір причин висипань і план лікування. Прийом очно або онлайн, Дніпро.",
      ru: "Консультация дерматолога в GENEVITY: диагностика заболеваний кожи, дерматоскопия родинок, разбор причин высыпаний и план лечения. Приём очно или онлайн, Днепр.",
      en: "A dermatology consultation at GENEVITY: diagnosis of skin conditions, dermatoscopy of moles, an analysis of what is behind your rash and a treatment plan. In person or online, Dnipro.",
    },
    procedureLength: { uk: "30 хвилин", ru: "30 минут", en: "30 minutes" },
    priceFrom: { uk: "від 950 грн", ru: "от 950 грн", en: "from UAH 950" },
    priceUnit: UAH,
    blocks: CONSULTATION_BLOCKS,
    related: ["cosmetologist", "acne-treatment", "pigmentation-removal", "acne-phototherapy"],
    doctors: ["beliyanushkin-viktor", "sepkina-hanna", "harmash-serhii"],
    sections: [
      {
        type: "richText",
        heading: { uk: "Коли варто звернутися до дерматолога", ru: "Когда стоит обратиться к дерматологу", en: "When to see a dermatologist" },
        body: {
          uk: "Дерматолог - лікар, який лікує шкіру, волосся й нігті як орган, а не як косметичну проблему. Різниця принципова: висипання на обличчі можуть бути наслідком гормонального збою, захворювання шлунково-кишкового тракту чи реакції на препарат, і без діагнозу будь-який догляд буде вгадуванням.\n\nУ GENEVITY консультують дерматологи з досвідом від 10 років. На прийомі лікар оглядає шкіру, за потреби проводить дерматоскопію, збирає анамнез і призначає обстеження - від аналізів крові до зішкребу чи посіву.\n\n**Звертайтеся до дерматолога, якщо:**\n- висипання не минають довше двох тижнів або повертаються;\n- змінилася родимка: колір, розмір, межі, з'явився свербіж або кровоточивість;\n- шкіра свербить, лущиться, з'явилися плями незрозумілого походження;\n- випадає волосся або змінилися нігтьові пластини;\n- призначене раніше лікування не дало результату.\n\nПісля консультації ви отримуєте діагноз, план лікування й розуміння, чого очікувати. Якщо потрібні апаратні або ін'єкційні методики, лікар підкаже, які саме та коли їх доречно починати.",
          ru: "Дерматолог - врач, который лечит кожу, волосы и ногти как орган, а не как косметическую проблему. Разница принципиальна: высыпания на лице могут быть следствием гормонального сбоя, заболевания желудочно-кишечного тракта или реакции на препарат, и без диагноза любой уход будет угадыванием.\n\nВ GENEVITY консультируют дерматологи с опытом от 10 лет. На приёме врач осматривает кожу, при необходимости проводит дерматоскопию, собирает анамнез и назначает обследования - от анализов крови до соскоба или посева.\n\n**Обращайтесь к дерматологу, если:**\n- высыпания не проходят дольше двух недель или возвращаются;\n- изменилась родинка: цвет, размер, границы, появился зуд или кровоточивость;\n- кожа зудит, шелушится, появились пятна непонятного происхождения;\n- выпадают волосы или изменились ногтевые пластины;\n- назначенное ранее лечение не дало результата.\n\nПосле консультации вы получаете диагноз, план лечения и понимание, чего ожидать. Если нужны аппаратные или инъекционные методики, врач подскажет, какие именно и когда их уместно начинать.",
          en: "A dermatologist treats skin, hair and nails as an organ rather than as a cosmetic problem. The distinction matters: a facial rash can be the result of a hormonal disturbance, a gastrointestinal condition or a drug reaction, and without a diagnosis any skincare routine is guesswork.\n\nAt GENEVITY consultations are given by dermatologists with more than ten years of experience. At the appointment the physician examines your skin, performs dermatoscopy if needed, takes a history and orders investigations - from blood tests to a scraping or culture.\n\n**See a dermatologist if:**\n- a rash has lasted more than two weeks or keeps coming back;\n- a mole has changed in colour, size or outline, or has started to itch or bleed;\n- your skin itches or flakes, or unexplained patches have appeared;\n- you are losing hair or your nails have changed;\n- previously prescribed treatment has not worked.\n\nAfter the consultation you leave with a diagnosis, a treatment plan and a clear idea of what to expect. If device or injectable treatments are appropriate, the physician will explain which ones and when to begin.",
        },
      },
      {
        type: "bullets",
        heading: { uk: "З якими станами працює дерматолог", ru: "С какими состояниями работает дерматолог", en: "What a dermatologist treats" },
        items: [
          { uk: "Акне та постакне, себорейний дерматит", ru: "Акне и постакне, себорейный дерматит", en: "Acne and post-acne, seborrhoeic dermatitis" },
          { uk: "Розацеа, купероз, стійке почервоніння обличчя", ru: "Розацеа, купероз, стойкое покраснение лица", en: "Rosacea, thread veins and persistent facial redness" },
          { uk: "Екзема, атопічний і контактний дерматит", ru: "Экзема, атопический и контактный дерматит", en: "Eczema, atopic and contact dermatitis" },
          { uk: "Пігментні порушення: мелазма, лентиго, вітиліго", ru: "Пигментные нарушения: мелазма, лентиго, витилиго", en: "Pigment disorders: melasma, lentigines, vitiligo" },
          { uk: "Огляд і дерматоскопія родимок та новоутворень", ru: "Осмотр и дерматоскопия родинок и новообразований", en: "Examination and dermatoscopy of moles and skin lesions" },
          { uk: "Псоріаз, грибкові ураження шкіри й нігтів", ru: "Псориаз, грибковые поражения кожи и ногтей", en: "Psoriasis and fungal infections of skin and nails" },
          { uk: "Випадіння волосся та захворювання шкіри голови", ru: "Выпадение волос и заболевания кожи головы", en: "Hair loss and scalp conditions" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить прийом дерматолога", ru: "Как проходит приём дерматолога", en: "How a dermatology appointment works" },
        steps: [
          { title: { uk: "Розмова та анамнез", ru: "Беседа и анамнез", en: "Discussion and history" }, description: { uk: "Лікар з'ясовує, коли з'явилася проблема, що їй передувало, які препарати ви приймаєте та чим лікувалися раніше.", ru: "Врач выясняет, когда появилась проблема, что ей предшествовало, какие препараты вы принимаете и чем лечились раньше.", en: "The physician establishes when the problem began, what preceded it, what medication you take and how it has been treated before." } },
          { title: { uk: "Огляд і дерматоскопія", ru: "Осмотр и дерматоскопия", en: "Examination and dermatoscopy" }, description: { uk: "Оцінка стану шкіри під збільшенням. Родимки та новоутворення оглядають дерматоскопом.", ru: "Оценка состояния кожи под увеличением. Родинки и новообразования осматривают дерматоскопом.", en: "The skin is assessed under magnification, with moles and lesions examined through a dermatoscope." } },
          { title: { uk: "Обстеження за потреби", ru: "Обследования при необходимости", en: "Investigations if needed" }, description: { uk: "Лікар може призначити аналізи, зішкреб, посів або консультацію ендокринолога чи гастроентеролога - лабораторія працює на місці.", ru: "Врач может назначить анализы, соскоб, посев или консультацию эндокринолога либо гастроэнтеролога - лаборатория работает на месте.", en: "The physician may order blood tests, a scraping, a culture, or a referral to an endocrinologist or gastroenterologist - the laboratory is on site." } },
          { title: { uk: "Діагноз і план лікування", ru: "Диагноз и план лечения", en: "Diagnosis and treatment plan" }, description: { uk: "Ви отримуєте письмові призначення, схему догляду та дату контрольного огляду.", ru: "Вы получаете письменные назначения, схему ухода и дату контрольного осмотра.", en: "You receive written prescriptions, a skincare regimen and a date for review." } },
        ],
      },
    ],
    faqs: [
      { question: { uk: "Чим дерматолог відрізняється від косметолога?", ru: "Чем дерматолог отличается от косметолога?", en: "How does a dermatologist differ from a cosmetologist?" },
        answer: { uk: "Дерматолог ставить діагноз і лікує захворювання шкіри, косметолог працює з естетичним запитом. На практиці межа умовна: у GENEVITY консультують лікарі з обома спеціалізаціями, тому на одному прийомі можна і розібратися з причиною висипань, і скласти план догляду.", ru: "Дерматолог ставит диагноз и лечит заболевания кожи, косметолог работает с эстетическим запросом. На практике граница условна: в GENEVITY консультируют врачи с обеими специализациями, поэтому на одном приёме можно и разобраться с причиной высыпаний, и составить план ухода.", en: "A dermatologist diagnoses and treats skin disease; a cosmetologist works on aesthetic concerns. In practice the line is blurred: at GENEVITY our physicians hold both qualifications, so a single appointment can both identify the cause of a rash and set out a skincare plan." } },
      { question: { uk: "Чи потрібно готуватися до прийому дерматолога?", ru: "Нужно ли готовиться к приёму дерматолога?", en: "Do I need to prepare for the appointment?" },
        answer: { uk: "Приходьте без макіяжу, якщо мова про шкіру обличчя, і без лаку, якщо про нігті. Візьміть із собою назви препаратів, які ви приймаєте або наносили на шкіру, і результати попередніх аналізів. Не починайте нове лікування за кілька днів до візиту - воно змінює картину.", ru: "Приходите без макияжа, если речь о коже лица, и без лака, если о ногтях. Возьмите с собой названия препаратов, которые вы принимаете или наносили на кожу, и результаты предыдущих анализов. Не начинайте новое лечение за несколько дней до визита - оно меняет картину.", en: "Come without make-up if the concern is facial skin, and without nail polish if it is your nails. Bring the names of any medication you take or apply, plus previous test results. Do not start a new treatment in the days before the visit - it changes the picture." } },
      { question: { uk: "Як часто треба перевіряти родимки?", ru: "Как часто нужно проверять родинки?", en: "How often should moles be checked?" },
        answer: { uk: "Раз на рік для більшості людей і раз на 6 місяців, якщо родимок багато, ви маєте світлий фототип або в родині були випадки меланоми. Позапланово - одразу, щойно родимка змінила колір, розмір чи форму, почала свербіти або кровоточити.", ru: "Раз в год для большинства людей и раз в 6 месяцев, если родинок много, у вас светлый фототип или в семье были случаи меланомы. Внепланово - сразу, как только родинка изменила цвет, размер или форму, начала зудеть или кровоточить.", en: "Once a year for most people, and every six months if you have many moles, a fair phototype or a family history of melanoma. Outside that schedule, come immediately if a mole changes colour, size or shape, or starts to itch or bleed." } },
      { question: { uk: "Чи можна отримати консультацію дерматолога онлайн?", ru: "Можно ли получить консультацию дерматолога онлайн?", en: "Is an online dermatology consultation possible?" },
        answer: { uk: "Так, онлайн-формат доступний і коштує стільки ж, скільки очний прийом. Він добре працює для повторних консультацій, розбору аналізів і корекції призначень. Але первинний огляд родимок і дерматоскопію дистанційно провести неможливо - для цього потрібен візит.", ru: "Да, онлайн-формат доступен и стоит столько же, сколько очный приём. Он хорошо работает для повторных консультаций, разбора анализов и коррекции назначений. Но первичный осмотр родинок и дерматоскопию дистанционно провести невозможно - для этого нужен визит.", en: "Yes, an online appointment is available at the same price as an in-person one. It works well for follow-ups, reviewing test results and adjusting prescriptions. An initial mole check and dermatoscopy cannot be done remotely, though - that requires a visit." } },
      { question: { uk: "Чи призначить лікар аналізи одразу на прийомі?", ru: "Назначит ли врач анализы прямо на приёме?", en: "Will tests be ordered during the appointment?" },
        answer: { uk: "Якщо вони потрібні - так, і здати їх можна одразу: клініко-діагностична лабораторія працює на місці. Це економить час, бо не доводиться шукати, де здати конкретне дослідження, і результати одразу потрапляють до вашого лікаря.", ru: "Если они нужны - да, и сдать их можно сразу: клинико-диагностическая лаборатория работает на месте. Это экономит время, поскольку не приходится искать, где сдать конкретное исследование, и результаты сразу попадают к вашему врачу.", en: "If they are needed, yes - and you can have them done immediately, as the clinical diagnostic laboratory is on site. That saves time, since you do not have to find somewhere to take a specific test, and the results go straight to your physician." } },
      { question: { uk: "Чи приймає дерматолог дітей?", ru: "Принимает ли дерматолог детей?", en: "Does the dermatologist see children?" },
        answer: { uk: "Уточніть це в адміністратора під час запису - віковий поріг залежить від конкретного лікаря та характеру запиту. Підлітків з акне ми консультуємо з 16 років, за згодою батьків.", ru: "Уточните это у администратора при записи - возрастной порог зависит от конкретного врача и характера запроса. Подростков с акне мы консультируем с 16 лет, с согласия родителей.", en: "Check with the administrator when booking - the age threshold depends on the particular physician and the nature of the concern. We see teenagers with acne from the age of 16, with parental consent." } },
      { question: { uk: "Скільки коштує консультація дерматолога в Дніпрі?", ru: "Сколько стоит консультация дерматолога в Днепре?", en: "How much does a dermatology consultation cost in Dnipro?" },
        answer: { uk: "Прийом дерматолога коштує від 950 грн і триває 30 хвилин. Онлайн-консультація - за тією ж ціною. Актуальні ціни є в розділі «Ціни» на сайті, адміністратор підтвердить їх під час запису. Аналізи та процедури оплачуються окремо.", ru: "Приём дерматолога стоит от 950 грн и длится 30 минут. Онлайн-консультация - по той же цене. Актуальные цены есть в разделе «Цены» на сайте, администратор подтвердит их при записи. Анализы и процедуры оплачиваются отдельно.", en: "A dermatology appointment costs from UAH 950 and lasts 30 minutes. An online consultation is the same price. Current prices are in the Prices section and the administrator will confirm them when you book. Tests and treatments are charged separately." } },
    ],
  },

  // ─── ГАСТРОЕНТЕРОЛОГ ──────────────────────────────────────────────────────
  {
    slug: "gastroenterologist",
    meta: {
      category: "diagnostics",
      h1: { uk: "Гастроентеролог в Дніпрі", ru: "Гастроэнтеролог в Днепре", en: "Gastroenterologist in Dnipro" },
      seoTitle: {
        uk: "Гастроентеролог у Дніпрі - консультація гастроентеролога",
        ru: "Гастроэнтеролог в Днепре - консультация гастроэнтеролога",
        en: "Gastroenterologist in Dnipro - gastroenterology consultation",
      },
      seoDesc: {
        uk: "Консультація гастроентеролога у Дніпрі 🤍 GENEVITY. Діагностика та лікування шлунка, кишківника, печінки й жовчного 💫 Лікарі з досвідом 25+ років.",
        ru: "Консультация гастроэнтеролога в Днепре 🤍 GENEVITY. Диагностика и лечение желудка, кишечника, печени и жёлчного 💫 Врачи с опытом 25+ лет.",
        en: "Gastroenterology consultation in Dnipro 🤍 GENEVITY. Diagnosis and treatment of the stomach, bowel, liver and gallbladder 💫 Physicians with 25+ years of experience.",
      },
    },
    title: { uk: "Консультація гастроентеролога", ru: "Консультация гастроэнтеролога", en: "Gastroenterologist Consultation" },
    summary: {
      uk: "Консультація гастроентеролога у GENEVITY: розбір симптомів з боку шлунка та кишківника, УЗД органів черевної порожнини й аналізи на місці, план лікування. Прийом очно або онлайн, Дніпро.",
      ru: "Консультация гастроэнтеролога в GENEVITY: разбор симптомов со стороны желудка и кишечника, УЗИ органов брюшной полости и анализы на месте, план лечения. Приём очно или онлайн, Днепр.",
      en: "A gastroenterology consultation at GENEVITY: assessment of stomach and bowel symptoms, abdominal ultrasound and laboratory tests on site, and a treatment plan. In person or online, Dnipro.",
    },
    procedureLength: { uk: "30 хвилин", ru: "30 минут", en: "30 minutes" },
    priceFrom: { uk: "від 950 грн", ru: "от 950 грн", en: "from UAH 950" },
    priceUnit: UAH,
    blocks: CONSULTATION_BLOCKS,
    related: ["dietician", "endocrinologist", "check-up-40", "ultrasound"],
    doctors: ["minchuk-yevheniia", "tolstykova-tetiana"],
    sections: [
      {
        type: "richText",
        heading: { uk: "Що лікує гастроентеролог", ru: "Что лечит гастроэнтеролог", en: "What a gastroenterologist treats" },
        body: {
          uk: "Гастроентеролог займається травною системою повністю: стравохід, шлунок, кишківник, печінка, жовчний міхур і підшлункова залоза. Це напрям, де симптоми часто здаються дрібними - здуття, печія, важкість після їжі, - а причина буває серйозною й потребує лікування, а не таблетки за порадою аптеки.\n\nУ GENEVITY консультують гастроентерологи з досвідом 25 і 28 років. Обидві лікарки водночас є дієтологами, тому лікування одразу поєднується з корекцією харчування - без цього більшість гастроентерологічних діагнозів повертається.\n\nПеревага прийому в GENEVITY - усе на місці. УЗД органів черевної порожнини роблять на апараті експертного класу GE LOGIQ E10, аналізи здають у власній лабораторії. Не потрібно збирати обстеження по різних клініках і чекати тижнями.\n\n**Не відкладайте візит, якщо:**\n- біль або дискомфорт у животі повторюється;\n- печія турбує частіше ніж двічі на тиждень;\n- змінився стілець або з'явилися нехарактерні для вас реакції на їжу;\n- ви худнете без причини;\n- в аналізах є відхилення печінкових показників.",
          ru: "Гастроэнтеролог занимается пищеварительной системой полностью: пищевод, желудок, кишечник, печень, жёлчный пузырь и поджелудочная железа. Это направление, где симптомы часто кажутся мелкими - вздутие, изжога, тяжесть после еды, - а причина бывает серьёзной и требует лечения, а не таблетки по совету аптеки.\n\nВ GENEVITY консультируют гастроэнтерологи с опытом 25 и 28 лет. Обе врача одновременно являются диетологами, поэтому лечение сразу сочетается с коррекцией питания - без этого большинство гастроэнтерологических диагнозов возвращается.\n\nПреимущество приёма в GENEVITY - всё на месте. УЗИ органов брюшной полости делают на аппарате экспертного класса GE LOGIQ E10, анализы сдают в собственной лаборатории. Не нужно собирать обследования по разным клиникам и ждать неделями.\n\n**Не откладывайте визит, если:**\n- боль или дискомфорт в животе повторяется;\n- изжога беспокоит чаще двух раз в неделю;\n- изменился стул или появились нехарактерные для вас реакции на еду;\n- вы худеете без причины;\n- в анализах есть отклонения печёночных показателей.",
          en: "A gastroenterologist looks after the whole digestive system: oesophagus, stomach, bowel, liver, gallbladder and pancreas. It is a field where the symptoms often seem minor - bloating, heartburn, heaviness after eating - while the cause can be serious and needs treatment rather than a tablet recommended over a pharmacy counter.\n\nAt GENEVITY consultations are given by gastroenterologists with 25 and 28 years of experience. Both are also qualified dieticians, so treatment is combined with dietary correction from the outset - without which most gastroenterological diagnoses return.\n\nThe advantage of being seen at GENEVITY is that everything is in one place. Abdominal ultrasound is performed on an expert-class GE LOGIQ E10, and tests are processed in our own laboratory. There is no need to gather investigations from several clinics and wait weeks for them.\n\n**Do not put off a visit if:**\n- abdominal pain or discomfort keeps returning;\n- heartburn troubles you more than twice a week;\n- your bowel habit has changed or food affects you in unfamiliar ways;\n- you are losing weight without trying;\n- your tests show abnormal liver markers.",
        },
      },
      {
        type: "bullets",
        heading: { uk: "Із чим звертаються до гастроентеролога", ru: "С чем обращаются к гастроэнтерологу", en: "What people see a gastroenterologist for" },
        items: [
          { uk: "Гастрит, гастроезофагеальна рефлюксна хвороба, печія", ru: "Гастрит, гастроэзофагеальная рефлюксная болезнь, изжога", en: "Gastritis, gastro-oesophageal reflux disease, heartburn" },
          { uk: "Виразкова хвороба шлунка та дванадцятипалої кишки", ru: "Язвенная болезнь желудка и двенадцатиперстной кишки", en: "Peptic ulcer disease of the stomach and duodenum" },
          { uk: "Синдром подразненого кишківника, здуття, порушення стільця", ru: "Синдром раздражённого кишечника, вздутие, нарушения стула", en: "Irritable bowel syndrome, bloating and altered bowel habit" },
          { uk: "Жовчнокам'яна хвороба та дискінезія жовчовивідних шляхів", ru: "Желчнокаменная болезнь и дискинезия желчевыводящих путей", en: "Gallstones and biliary dyskinesia" },
          { uk: "Жировий гепатоз, підвищені печінкові показники", ru: "Жировой гепатоз, повышенные печёночные показатели", en: "Fatty liver disease and raised liver markers" },
          { uk: "Панкреатит і ферментна недостатність", ru: "Панкреатит и ферментная недостаточность", en: "Pancreatitis and enzyme insufficiency" },
          { uk: "Харчова непереносимість і підозра на целіакію", ru: "Пищевая непереносимость и подозрение на целиакию", en: "Food intolerance and suspected coeliac disease" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить консультація гастроентеролога", ru: "Как проходит консультация гастроэнтеролога", en: "How the gastroenterology consultation works" },
        steps: [
          { title: { uk: "Детальний анамнез", ru: "Подробный анамнез", en: "A detailed history" }, description: { uk: "Лікар розбирає симптоми, режим харчування, спосіб життя, препарати та попередні обстеження. Це найдовша частина прийому.", ru: "Врач разбирает симптомы, режим питания, образ жизни, препараты и предыдущие обследования. Это самая длинная часть приёма.", en: "The physician goes through your symptoms, eating pattern, lifestyle, medication and previous investigations. This is the longest part of the appointment." } },
          { title: { uk: "Огляд і пальпація", ru: "Осмотр и пальпация", en: "Examination and palpation" }, description: { uk: "Оцінка стану живота, печінки та зон болючості - це задає напрям подальшої діагностики.", ru: "Оценка состояния живота, печени и зон болезненности - это задаёт направление дальнейшей диагностики.", en: "Assessment of the abdomen, liver and areas of tenderness, which guides the investigations that follow." } },
          { title: { uk: "Обстеження на місці", ru: "Обследования на месте", en: "Investigations on site" }, description: { uk: "За потреби - УЗД органів черевної порожнини та аналізи у власній лабораторії клініки, без записів в інші заклади.", ru: "При необходимости - УЗИ органов брюшной полости и анализы в собственной лаборатории клиники, без записей в другие учреждения.", en: "Where needed, abdominal ultrasound and laboratory tests are done in the clinic's own facilities, with no referrals elsewhere." } },
          { title: { uk: "Лікування й харчування", ru: "Лечение и питание", en: "Treatment and diet" }, description: { uk: "Лікар складає схему лікування та коригує раціон - обидві наші лікарки мають дієтологічну спеціалізацію.", ru: "Врач составляет схему лечения и корректирует рацион - обе наши врача имеют диетологическую специализацию.", en: "The physician sets out a treatment plan and adjusts your diet - both of our specialists are also qualified dieticians." } },
        ],
      },
    ],
    faqs: [
      { question: { uk: "Як підготуватися до прийому гастроентеролога?", ru: "Как подготовиться к приёму гастроэнтеролога?", en: "How should I prepare for the appointment?" },
        answer: { uk: "Якщо плануєте одразу зробити УЗД органів черевної порожнини, приходьте натще - не їжте 6-8 годин до візиту. Візьміть результати попередніх обстежень і список препаратів. Корисно кілька днів перед прийомом занотовувати, що ви їли й коли з'являлися симптоми.", ru: "Если планируете сразу сделать УЗИ органов брюшной полости, приходите натощак - не ешьте 6-8 часов до визита. Возьмите результаты предыдущих обследований и список препаратов. Полезно несколько дней перед приёмом записывать, что вы ели и когда появлялись симптомы.", en: "If you plan to have an abdominal ultrasound at the same visit, come fasting - no food for six to eight hours beforehand. Bring previous test results and a list of your medication. It also helps to note down for a few days what you ate and when symptoms appeared." } },
      { question: { uk: "Чи можна зробити УЗД у день консультації?", ru: "Можно ли сделать УЗИ в день консультации?", en: "Can I have an ultrasound the same day?" },
        answer: { uk: "Так. УЗД органів черевної порожнини виконують у клініці на апараті експертного класу GE LOGIQ E10. Попередьте адміністратора під час запису, щоб для вас передбачили час і в гастроентеролога, і в лікаря УЗД.", ru: "Да. УЗИ органов брюшной полости выполняют в клинике на аппарате экспертного класса GE LOGIQ E10. Предупредите администратора при записи, чтобы для вас предусмотрели время и у гастроэнтеролога, и у врача УЗИ.", en: "Yes. Abdominal ultrasound is performed in the clinic on an expert-class GE LOGIQ E10. Let the administrator know when booking so that time is set aside with both the gastroenterologist and the sonographer." } },
      { question: { uk: "Чим відрізняються прийоми у двох ваших гастроентерологів?", ru: "Чем отличаются приёмы у двух ваших гастроэнтерологов?", en: "What is the difference between your two gastroenterologists?" },
        answer: { uk: "Обидві лікарки - гастроентерологи й дієтологи з досвідом 25 і 28 років, і обидві ведуть повний спектр гастроентерологічних станів. Різниця у вартості та тривалості прийому вказана в прайсі. Адміністратор допоможе обрати, орієнтуючись на ваш запит і зручний час.", ru: "Обе врача - гастроэнтерологи и диетологи с опытом 25 и 28 лет, и обе ведут полный спектр гастроэнтерологических состояний. Разница в стоимости и длительности приёма указана в прайсе. Администратор поможет выбрать, ориентируясь на ваш запрос и удобное время.", en: "Both are gastroenterologists and dieticians with 25 and 28 years of experience, and both cover the full range of gastroenterological conditions. The difference in fee and appointment length is shown in the price list. The administrator will help you choose based on your concern and the times available." } },
      { question: { uk: "Чи потрібне направлення від терапевта?", ru: "Нужно ли направление от терапевта?", en: "Do I need a referral?" },
        answer: { uk: "Ні, записатися можна самостійно. Якщо у вас уже є результати обстежень від іншого лікаря - візьміть їх із собою, це заощадить час і кошти на повторних аналізах.", ru: "Нет, записаться можно самостоятельно. Если у вас уже есть результаты обследований от другого врача - возьмите их с собой, это сэкономит время и средства на повторных анализах.", en: "No, you can book directly. If you already have results from another physician, bring them - it saves time and the cost of repeating tests." } },
      { question: { uk: "Чи проводите ви гастроскопію та колоноскопію?", ru: "Проводите ли вы гастроскопию и колоноскопию?", en: "Do you perform gastroscopy and colonoscopy?" },
        answer: { uk: "Ендоскопічні дослідження в центрі не виконують. Якщо вони потрібні, лікар випише направлення й пояснить, як підготуватися, а результати розбере на повторній консультації та вбудує в план лікування.", ru: "Эндоскопические исследования в центре не выполняют. Если они нужны, врач выпишет направление и объяснит, как подготовиться, а результаты разберёт на повторной консультации и встроит в план лечения.", en: "Endoscopic procedures are not carried out at the centre. If they are needed, the physician will issue a referral and explain the preparation, then go through the findings at a follow-up and build them into your treatment plan." } },
      { question: { uk: "Чи можлива онлайн-консультація гастроентеролога?", ru: "Возможна ли онлайн-консультация гастроэнтеролога?", en: "Is an online gastroenterology consultation possible?" },
        answer: { uk: "Так, за тією ж вартістю, що й очний прийом. Онлайн зручно розбирати результати аналізів, коригувати схему лікування та харчування. Первинний прийом краще пройти очно, бо огляд і пальпація живота дають лікарю важливу інформацію.", ru: "Да, по той же стоимости, что и очный приём. Онлайн удобно разбирать результаты анализов, корректировать схему лечения и питания. Первичный приём лучше пройти очно, поскольку осмотр и пальпация живота дают врачу важную информацию.", en: "Yes, at the same price as an in-person appointment. Online works well for reviewing test results and adjusting treatment or diet. A first appointment is better done in person, since examining and palpating the abdomen gives the physician important information." } },
      { question: { uk: "Скільки коштує консультація гастроентеролога в Дніпрі?", ru: "Сколько стоит консультация гастроэнтеролога в Днепре?", en: "How much does a gastroenterology consultation cost in Dnipro?" },
        answer: { uk: "Прийом гастроентеролога коштує від 950 грн і триває 30 хвилин; вартість залежить від лікаря. Онлайн-формат - за тією ж ціною. Актуальні ціни є в розділі «Ціни», адміністратор підтвердить їх під час запису. УЗД та аналізи оплачуються окремо.", ru: "Приём гастроэнтеролога стоит от 950 грн и длится 30 минут; стоимость зависит от врача. Онлайн-формат - по той же цене. Актуальные цены есть в разделе «Цены», администратор подтвердит их при записи. УЗИ и анализы оплачиваются отдельно.", en: "A gastroenterology appointment costs from UAH 950 and lasts 30 minutes; the fee depends on the physician. The online format is the same price. Current prices are in the Prices section and the administrator will confirm them when you book. Ultrasound and tests are charged separately." } },
    ],
  },
];
