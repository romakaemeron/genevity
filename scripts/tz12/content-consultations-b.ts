/** Consultation pages, part B: dietician, therapist, neurologist, reproductologist. */
import { CONSULTATION_BLOCKS, type ServiceSeed } from "./lib";

const UAH = { uk: "консультація", ru: "консультация", en: "consultation" };

export const consultationsB: ServiceSeed[] = [
  // ─── ДІЄТОЛОГ ─────────────────────────────────────────────────────────────
  {
    slug: "dietician",
    meta: {
      category: "diagnostics",
      h1: { uk: "Дієтолог в Дніпрі", ru: "Диетолог в Днепре", en: "Dietician in Dnipro" },
      seoTitle: {
        uk: "Дієтолог у Дніпрі - консультація дієтолога",
        ru: "Диетолог в Днепре - консультация диетолога",
        en: "Dietician in Dnipro - dietary consultation",
      },
      seoDesc: {
        uk: "Консультація дієтолога у Дніпрі 🤍 GENEVITY. Аналіз складу тіла на InBody, індивідуальне меню та супровід лікаря 💫 Без жорстких дієт.",
        ru: "Консультация диетолога в Днепре 🤍 GENEVITY. Анализ состава тела на InBody, индивидуальное меню и сопровождение врача 💫 Без жёстких диет.",
        en: "Dietary consultation in Dnipro 🤍 GENEVITY. InBody body composition analysis, an individual menu and medical follow-up 💫 No crash diets.",
      },
    },
    title: { uk: "Консультація дієтолога", ru: "Консультация диетолога", en: "Dietician Consultation" },
    summary: {
      uk: "Консультація дієтолога у GENEVITY: аналіз складу тіла на InBody, розбір харчових звичок і аналізів, індивідуальний план харчування під ваш стан здоров'я. Очно або онлайн, Дніпро.",
      ru: "Консультация диетолога в GENEVITY: анализ состава тела на InBody, разбор пищевых привычек и анализов, индивидуальный план питания под ваше состояние здоровья. Очно или онлайн, Днепр.",
      en: "A dietary consultation at GENEVITY: InBody body composition analysis, a review of your eating habits and test results, and an individual nutrition plan built around your health. In person or online, Dnipro.",
    },
    procedureLength: { uk: "40-90 хвилин", ru: "40-90 минут", en: "40-90 minutes" },
    priceFrom: { uk: "від 1000 грн", ru: "от 1000 грн", en: "from UAH 1000" },
    priceUnit: UAH,
    blocks: CONSULTATION_BLOCKS,
    related: ["gastroenterologist", "bioimpedance", "nutraceuticals", "longevity-program"],
    doctors: ["minchuk-yevheniia", "tolstykova-tetiana"],
    sections: [
      {
        type: "richText",
        heading: { uk: "Чим дієтолог відрізняється від популярних дієт", ru: "Чем диетолог отличается от популярных диет", en: "How a dietician differs from a popular diet" },
        body: {
          uk: "Дієтолог - це лікар, який будує харчування під конкретний організм: вік, стан здоров'я, аналізи, склад тіла, режим дня та харчові звички. Готова дієта з інтернету цих даних не має, тому працює у когось одного з десяти, а решті дає зрив і повернення ваги.\n\nУ GENEVITY консультують дієтологи, які водночас є гастроентерологами з досвідом 25 і 28 років. Це принципово: більшість проблем із вагою й травленням пов'язані між собою, і розділяти їх на два прийоми не має сенсу.\n\nПрийом починається з об'єктивних даних. Аналіз складу тіла на InBody 270 показує співвідношення м'язової маси, жиру та води за 60 секунд - це набагато інформативніше за цифру на вагах. Далі лікар дивиться аналізи: без розуміння гормонального фону, стану щитоподібної залози та обміну заліза план харчування будувати рано.\n\nРезультат консультації - не список заборон, а робоча схема: що, коли і в якому обсязі їсти, з урахуванням вашого графіка та смаків. Окремо можна замовити підбір індивідуального дієтичного меню на 7 діб.",
          ru: "Диетолог - это врач, который строит питание под конкретный организм: возраст, состояние здоровья, анализы, состав тела, режим дня и пищевые привычки. Готовая диета из интернета этих данных не имеет, поэтому работает у кого-то одного из десяти, а остальным даёт срыв и возвращение веса.\n\nВ GENEVITY консультируют диетологи, которые одновременно являются гастроэнтерологами с опытом 25 и 28 лет. Это принципиально: большинство проблем с весом и пищеварением связаны между собой, и разделять их на два приёма не имеет смысла.\n\nПриём начинается с объективных данных. Анализ состава тела на InBody 270 показывает соотношение мышечной массы, жира и воды за 60 секунд - это намного информативнее цифры на весах. Далее врач смотрит анализы: без понимания гормонального фона, состояния щитовидной железы и обмена железа план питания строить рано.\n\nРезультат консультации - не список запретов, а рабочая схема: что, когда и в каком объёме есть, с учётом вашего графика и вкусов. Отдельно можно заказать подбор индивидуального диетического меню на 7 суток.",
          en: "A dietician is a physician who builds an eating plan around a particular body: age, health status, blood results, body composition, daily routine and food preferences. A ready-made diet from the internet has none of that information, which is why it works for perhaps one person in ten and leaves the rest with a relapse and regained weight.\n\nAt GENEVITY our dieticians are also gastroenterologists with 25 and 28 years of experience. That matters: most weight and digestive problems are connected, and separating them into two appointments makes little sense.\n\nThe consultation starts with objective data. InBody 270 body composition analysis shows the balance of muscle, fat and water in 60 seconds - far more informative than a number on the scales. The physician then reviews your blood results: without understanding your hormones, thyroid function and iron metabolism, it is too early to build a nutrition plan.\n\nThe outcome is not a list of prohibitions but a workable scheme: what to eat, when and how much, fitted around your schedule and tastes. An individual seven-day menu can be ordered separately.",
        },
      },
      {
        type: "bullets",
        heading: { uk: "Із якими запитами йдуть до дієтолога", ru: "С какими запросами идут к диетологу", en: "What people consult a dietician about" },
        items: [
          { uk: "Надлишкова вага, яка не йде на дефіциті калорій", ru: "Избыточный вес, который не уходит на дефиците калорий", en: "Excess weight that will not shift on a calorie deficit" },
          { uk: "Дефіцит маси тіла й труднощі з набором м'язів", ru: "Дефицит массы тела и трудности с набором мышц", en: "Being underweight and struggling to build muscle" },
          { uk: "Харчування при гастриті, рефлюксі, синдромі подразненого кишківника", ru: "Питание при гастрите, рефлюксе, синдроме раздражённого кишечника", en: "Eating with gastritis, reflux or irritable bowel syndrome" },
          { uk: "Інсулінорезистентність, переддіабет, метаболічний синдром", ru: "Инсулинорезистентность, преддиабет, метаболический синдром", en: "Insulin resistance, prediabetes and metabolic syndrome" },
          { uk: "Харчова непереносимість і виключні дієти", ru: "Пищевая непереносимость и исключающие диеты", en: "Food intolerance and elimination diets" },
          { uk: "Корекція раціону при захворюваннях щитоподібної залози", ru: "Коррекция рациона при заболеваниях щитовидной железы", en: "Adjusting the diet in thyroid disease" },
          { uk: "Харчування як частина longevity-протоколу", ru: "Питание как часть longevity-протокола", en: "Nutrition as part of a longevity protocol" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить прийом дієтолога", ru: "Как проходит приём диетолога", en: "How the dietician appointment works" },
        steps: [
          { title: { uk: "Аналіз складу тіла", ru: "Анализ состава тела", en: "Body composition analysis" }, description: { uk: "Вимірювання на InBody 270: м'язова маса, відсоток жиру, вісцеральний жир, вода. Займає близько хвилини.", ru: "Измерение на InBody 270: мышечная масса, процент жира, висцеральный жир, вода. Занимает около минуты.", en: "A measurement on the InBody 270: muscle mass, body fat percentage, visceral fat and water. It takes about a minute." } },
          { title: { uk: "Розбір харчових звичок", ru: "Разбор пищевых привычек", en: "Reviewing your eating habits" }, description: { uk: "Лікар аналізує ваш звичайний раціон, режим, рівень активності, сон і стрес - усе це впливає на обмін речовин.", ru: "Врач анализирует ваш обычный рацион, режим, уровень активности, сон и стресс - всё это влияет на обмен веществ.", en: "The physician looks at your usual diet, routine, activity level, sleep and stress - all of which affect metabolism." } },
          { title: { uk: "Оцінка аналізів", ru: "Оценка анализов", en: "Assessing your blood work" }, description: { uk: "Якщо аналізів немає, лікар призначає потрібні - здати їх можна одразу у власній лабораторії клініки.", ru: "Если анализов нет, врач назначает нужные - сдать их можно сразу в собственной лаборатории клиники.", en: "If you have no recent tests, the physician orders what is needed - and you can have them done straight away in the clinic's own laboratory." } },
          { title: { uk: "План харчування", ru: "План питания", en: "The nutrition plan" }, description: { uk: "Ви отримуєте письмову схему з розрахунком калорій і нутрієнтів. За бажанням - готове меню на 7 діб.", ru: "Вы получаете письменную схему с расчётом калорий и нутриентов. По желанию - готовое меню на 7 суток.", en: "You receive a written scheme with calorie and nutrient targets, and, if you wish, a ready seven-day menu." } },
        ],
      },
    ],
    faqs: [
      { question: { uk: "Що входить у консультацію дієтолога?", ru: "Что входит в консультацию диетолога?", en: "What does the dietician consultation include?" },
        answer: { uk: "Розбір харчових звичок і способу життя, оцінка аналізів, рекомендації щодо раціону та письмова схема харчування. Аналіз складу тіла на InBody і підбір індивідуального меню на 7 діб - окремі послуги; уточніть, чи потрібні вони вам, під час запису.", ru: "Разбор пищевых привычек и образа жизни, оценка анализов, рекомендации по рациону и письменная схема питания. Анализ состава тела на InBody и подбор индивидуального меню на 7 суток - отдельные услуги; уточните, нужны ли они вам, при записи.", en: "A review of your eating habits and lifestyle, assessment of your blood results, dietary recommendations and a written nutrition scheme. InBody body composition analysis and the individual seven-day menu are separate services - mention when booking whether you want them." } },
      { question: { uk: "Чи потрібно здавати аналізи перед прийомом?", ru: "Нужно ли сдавать анализы перед приёмом?", en: "Do I need blood tests before the appointment?" },
        answer: { uk: "Не обов'язково. Якщо аналізи є - візьміть їх, це прискорить роботу. Якщо ні, лікар призначить саме ті, що потрібні у вашому випадку, і здати їх можна одразу в клініці. Так ви не платите за зайві дослідження «про всяк випадок».", ru: "Не обязательно. Если анализы есть - возьмите их, это ускорит работу. Если нет, врач назначит именно те, что нужны в вашем случае, и сдать их можно сразу в клинике. Так вы не платите за лишние исследования «на всякий случай».", en: "Not necessarily. If you have recent results, bring them - it speeds things up. If not, the physician will order exactly what your case requires and you can have them done in the clinic straight away, so you do not pay for just-in-case tests." } },
      { question: { uk: "Скільки коштує індивідуальне меню на 7 діб?", ru: "Сколько стоит индивидуальное меню на 7 суток?", en: "How much does the seven-day menu cost?" },
        answer: { uk: "Підбір індивідуального дієтичного меню на 7 діб - окрема послуга вартістю 900 грн. Її замовляють після консультації, коли лікар уже знає ваші аналізи, склад тіла та обмеження. Меню складається з урахуванням ваших смаків і графіка.", ru: "Подбор индивидуального диетического меню на 7 суток - отдельная услуга стоимостью 900 грн. Её заказывают после консультации, когда врач уже знает ваши анализы, состав тела и ограничения. Меню составляется с учётом ваших вкусов и графика.", en: "The individual seven-day menu is a separate service costing UAH 900. It is ordered after the consultation, once the physician knows your test results, body composition and any restrictions. The menu is built around your tastes and schedule." } },
      { question: { uk: "Чи призначає дієтолог препарати для схуднення?", ru: "Назначает ли диетолог препараты для похудения?", en: "Does the dietician prescribe weight-loss medication?" },
        answer: { uk: "Медикаментозна підтримка можлива, але лише за показаннями й після обстеження - це рішення лікаря, а не стандартна частина прийому. Основа роботи завжди харчування, режим і корекція станів, які заважають знижувати вагу: гормональних, гастроентерологічних, метаболічних.", ru: "Медикаментозная поддержка возможна, но только по показаниям и после обследования - это решение врача, а не стандартная часть приёма. Основа работы всегда питание, режим и коррекция состояний, мешающих снижать вес: гормональных, гастроэнтерологических, метаболических.", en: "Medication is possible where indicated and after investigation - it is a clinical decision, not a routine part of the appointment. The foundation is always diet, routine and correcting the conditions that block weight loss: hormonal, gastroenterological and metabolic." } },
      { question: { uk: "Як часто потрібні повторні візити?", ru: "Как часто нужны повторные визиты?", en: "How often are follow-ups needed?" },
        answer: { uk: "Зазвичай перший контроль через 3-4 тижні, далі - раз на 1-2 місяці. Повторні прийоми потрібні, щоб оцінити динаміку складу тіла й скоригувати схему: організм адаптується, і план, який працював на старті, з часом потребує змін.", ru: "Обычно первый контроль через 3-4 недели, далее - раз в 1-2 месяца. Повторные приёмы нужны, чтобы оценить динамику состава тела и скорректировать схему: организм адаптируется, и план, работавший на старте, со временем требует изменений.", en: "Usually a first review at three to four weeks, then every one to two months. Follow-ups are needed to track changes in body composition and adjust the scheme: the body adapts, and a plan that worked at the start will need revising." } },
      { question: { uk: "Чи можна консультуватися з дієтологом онлайн?", ru: "Можно ли консультироваться с диетологом онлайн?", en: "Can I see the dietician online?" },
        answer: { uk: "Так, за тією ж вартістю. Онлайн-формат добре працює для повторних прийомів і корекції плану. Для первинної консультації краще прийти очно - аналіз складу тіла на InBody дистанційно зробити неможливо, а без цих даних план буде менш точним.", ru: "Да, по той же стоимости. Онлайн-формат хорошо работает для повторных приёмов и коррекции плана. Для первичной консультации лучше прийти очно - анализ состава тела на InBody дистанционно сделать невозможно, а без этих данных план будет менее точным.", en: "Yes, at the same price. The online format works well for follow-ups and plan adjustments. For a first consultation it is better to come in person - InBody analysis cannot be done remotely, and without that data the plan is less precise." } },
      { question: { uk: "Скільки коштує консультація дієтолога в Дніпрі?", ru: "Сколько стоит консультация диетолога в Днепре?", en: "How much does a dietary consultation cost in Dnipro?" },
        answer: { uk: "Прийом дієтолога коштує від 1000 грн; тривалість - від 40 до 90 хвилин залежно від лікаря. Онлайн-формат - за тією ж ціною. Актуальні ціни є в розділі «Ціни», адміністратор підтвердить їх під час запису.", ru: "Приём диетолога стоит от 1000 грн; длительность - от 40 до 90 минут в зависимости от врача. Онлайн-формат - по той же цене. Актуальные цены есть в разделе «Цены», администратор подтвердит их при записи.", en: "A dietary consultation costs from UAH 1000 and lasts between 40 and 90 minutes depending on the physician. The online format is the same price. Current prices are in the Prices section and the administrator will confirm them when you book." } },
    ],
  },

  // ─── ТЕРАПЕВТ ─────────────────────────────────────────────────────────────
  {
    slug: "therapist",
    meta: {
      category: "diagnostics",
      h1: { uk: "Терапевт в Дніпрі", ru: "Терапевт в Днепре", en: "General practitioner in Dnipro" },
      seoTitle: {
        uk: "Терапевт у Дніпрі - консультація лікаря-терапевта",
        ru: "Терапевт в Днепре - консультация врача-терапевта",
        en: "General practitioner in Dnipro - GP consultation",
      },
      seoDesc: {
        uk: "Консультація лікаря-терапевта у Дніпрі 🤍 GENEVITY. Первинний огляд, розбір аналізів і маршрут обстеження 💫 Власна лабораторія та УЗД на місці.",
        ru: "Консультация врача-терапевта в Днепре 🤍 GENEVITY. Первичный осмотр, разбор анализов и маршрут обследования 💫 Собственная лаборатория и УЗИ на месте.",
        en: "GP consultation in Dnipro 🤍 GENEVITY. Initial assessment, review of your test results and a clear investigation pathway 💫 Own laboratory and ultrasound on site.",
      },
    },
    title: { uk: "Консультація лікаря-терапевта", ru: "Консультация врача-терапевта", en: "General Practitioner Consultation" },
    summary: {
      uk: "Консультація терапевта у GENEVITY: перша точка входу в медицину, коли незрозуміло, до якого спеціаліста йти. Огляд, розбір скарг і аналізів, маршрут обстеження. Дніпро.",
      ru: "Консультация терапевта в GENEVITY: первая точка входа в медицину, когда непонятно, к какому специалисту идти. Осмотр, разбор жалоб и анализов, маршрут обследования. Днепр.",
      en: "A GP consultation at GENEVITY: the first point of entry when it is not clear which specialist you need. Examination, a review of your symptoms and test results, and a clear investigation pathway. Dnipro.",
    },
    procedureLength: { uk: "30 хвилин", ru: "30 минут", en: "30 minutes" },
    priceFrom: { uk: "від 900 грн", ru: "от 900 грн", en: "from UAH 900" },
    priceUnit: UAH,
    blocks: CONSULTATION_BLOCKS,
    related: ["check-up-40", "endocrinologist", "ultrasound", "gastroenterologist"],
    doctors: [],
    sections: [
      {
        type: "richText",
        heading: { uk: "Навіщо потрібен лікар-терапевт", ru: "Зачем нужен врач-терапевт", en: "Why you need a general practitioner" },
        body: {
          uk: "Терапевт - лікар широкого профілю, який дивиться на організм цілісно. Це саме той спеціаліст, до якого варто йти, коли симптоми є, а зрозуміти їх причину самостійно не виходить: слабкість, задишка, підвищений тиск, температура без явної причини, відхилення в аналізах.\n\nЦінність терапевта не в тому, що він лікує все, а в тому, що він правильно визначає напрям. Замість того щоб самостійно записуватися до трьох спеціалістів по черзі й платити за кожен прийом, ви приходите один раз - і отримуєте маршрут обстеження, який має сенс.\n\nУ GENEVITY це працює особливо швидко, бо лабораторія й ультразвукова діагностика розташовані на місці. Терапевт може призначити аналізи та УЗД, отримати результати й повернутися до вас із висновком без зайвих візитів до інших закладів.\n\n**До терапевта звертаються, щоб:**\n- розібратися з незрозумілими симптомами;\n- отримати трактування аналізів і зрозуміти, що з ними робити далі;\n- пройти передопераційне обстеження й отримати висновок;\n- скоригувати терапію хронічного захворювання;\n- отримати довідку чи медичний висновок.",
          ru: "Терапевт - врач широкого профиля, который смотрит на организм целостно. Это именно тот специалист, к которому стоит идти, когда симптомы есть, а понять их причину самостоятельно не выходит: слабость, одышка, повышенное давление, температура без явной причины, отклонения в анализах.\n\nЦенность терапевта не в том, что он лечит всё, а в том, что он правильно определяет направление. Вместо того чтобы самостоятельно записываться к трём специалистам по очереди и платить за каждый приём, вы приходите один раз - и получаете маршрут обследования, который имеет смысл.\n\nВ GENEVITY это работает особенно быстро, поскольку лаборатория и ультразвуковая диагностика расположены на месте. Терапевт может назначить анализы и УЗИ, получить результаты и вернуться к вам с заключением без лишних визитов в другие учреждения.\n\n**К терапевту обращаются, чтобы:**\n- разобраться с непонятными симптомами;\n- получить трактовку анализов и понять, что с ними делать дальше;\n- пройти предоперационное обследование и получить заключение;\n- скорректировать терапию хронического заболевания;\n- получить справку или медицинское заключение.",
          en: "A general practitioner is a broad-spectrum physician who looks at the body as a whole. This is the specialist to see when you have symptoms but cannot work out what is behind them: fatigue, breathlessness, raised blood pressure, an unexplained temperature, or abnormalities in your test results.\n\nThe value of a GP is not that they treat everything, but that they identify the right direction. Instead of booking three specialists in turn and paying for each appointment, you come once and leave with an investigation pathway that makes sense.\n\nAt GENEVITY this works particularly quickly, because the laboratory and ultrasound diagnostics are on site. The GP can order tests and a scan, receive the results and come back to you with a conclusion without sending you elsewhere.\n\n**People see a GP to:**\n- make sense of unexplained symptoms;\n- have their test results interpreted and know what to do next;\n- complete a pre-operative work-up and obtain clearance;\n- adjust treatment for a chronic condition;\n- obtain a medical certificate or report.",
        },
      },
      {
        type: "bullets",
        heading: { uk: "З чим працює терапевт", ru: "С чем работает терапевт", en: "What a general practitioner covers" },
        items: [
          { uk: "Гострі респіраторні захворювання та їх ускладнення", ru: "Острые респираторные заболевания и их осложнения", en: "Acute respiratory illness and its complications" },
          { uk: "Підвищений артеріальний тиск і контроль серцево-судинних ризиків", ru: "Повышенное артериальное давление и контроль сердечно-сосудистых рисков", en: "Raised blood pressure and cardiovascular risk management" },
          { uk: "Хронічна втома, слабкість, порушення сну", ru: "Хроническая усталость, слабость, нарушения сна", en: "Chronic fatigue, weakness and sleep disturbance" },
          { uk: "Анемія та порушення обміну заліза", ru: "Анемия и нарушения обмена железа", en: "Anaemia and disorders of iron metabolism" },
          { uk: "Трактування аналізів і маршрут подальшого обстеження", ru: "Трактовка анализов и маршрут дальнейшего обследования", en: "Interpreting test results and planning further investigation" },
          { uk: "Передопераційне обстеження та висновок перед втручанням", ru: "Предоперационное обследование и заключение перед вмешательством", en: "Pre-operative work-up and clearance before a procedure" },
          { uk: "Профілактичні огляди й контроль хронічних станів", ru: "Профилактические осмотры и контроль хронических состояний", en: "Preventive check-ups and monitoring of chronic conditions" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить прийом терапевта", ru: "Как проходит приём терапевта", en: "How the GP appointment works" },
        steps: [
          { title: { uk: "Збір скарг і анамнезу", ru: "Сбор жалоб и анамнеза", en: "Symptoms and history" }, description: { uk: "Лікар з'ясовує, що турбує, як довго, які хронічні захворювання є в анамнезі та які препарати ви приймаєте.", ru: "Врач выясняет, что беспокоит, как долго, какие хронические заболевания есть в анамнезе и какие препараты вы принимаете.", en: "The physician establishes what is troubling you and for how long, your past medical history and your current medication." } },
          { title: { uk: "Фізикальний огляд", ru: "Физикальный осмотр", en: "Physical examination" }, description: { uk: "Вимірювання тиску та пульсу, аускультація серця й легень, пальпація живота, огляд лімфовузлів.", ru: "Измерение давления и пульса, аускультация сердца и лёгких, пальпация живота, осмотр лимфоузлов.", en: "Blood pressure and pulse, auscultation of the heart and lungs, abdominal palpation and examination of the lymph nodes." } },
          { title: { uk: "Обстеження на місці", ru: "Обследования на месте", en: "Investigations on site" }, description: { uk: "За потреби лікар призначає аналізи або УЗД - здати їх можна одразу, без запису до іншої клініки.", ru: "При необходимости врач назначает анализы или УЗИ - сдать их можно сразу, без записи в другую клинику.", en: "Where needed the physician orders tests or an ultrasound, which you can have done immediately without booking elsewhere." } },
          { title: { uk: "Висновок і маршрут", ru: "Заключение и маршрут", en: "Conclusion and pathway" }, description: { uk: "Ви отримуєте письмовий висновок, призначення й розуміння, до якого спеціаліста йти далі, якщо це потрібно.", ru: "Вы получаете письменное заключение, назначения и понимание, к какому специалисту идти дальше, если это нужно.", en: "You receive a written conclusion, prescriptions and a clear idea of which specialist to see next, if that is needed." } },
        ],
      },
    ],
    faqs: [
      { question: { uk: "Коли краще йти до терапевта, а коли одразу до вузького спеціаліста?", ru: "Когда лучше идти к терапевту, а когда сразу к узкому специалисту?", en: "When should I see a GP rather than a specialist directly?" },
        answer: { uk: "Якщо ви точно знаєте, у чому проблема, - наприклад, спостерігаєтеся в ендокринолога з приводу щитоподібної залози, - записуйтеся до профільного лікаря. Якщо симптоми розмиті або їх кілька, терапевт заощадить час і кошти: він визначить напрям і призначить тільки потрібні обстеження.", ru: "Если вы точно знаете, в чём проблема, - например, наблюдаетесь у эндокринолога по поводу щитовидной железы, - записывайтесь к профильному врачу. Если симптомы размыты или их несколько, терапевт сэкономит время и средства: он определит направление и назначит только нужные обследования.", en: "If you already know what the problem is - you are under an endocrinologist for your thyroid, say - book the specialist directly. If your symptoms are vague or there are several of them, a GP will save you time and money by identifying the direction and ordering only the tests that are needed." } },
      { question: { uk: "Чи можна здати аналізи в день прийому?", ru: "Можно ли сдать анализы в день приёма?", en: "Can I have tests done on the day?" },
        answer: { uk: "Так. Клініко-діагностична лабораторія працює безпосередньо в центрі, тому призначені дослідження можна здати одразу після консультації. Більшість аналізів потребує підготовки натще - уточніть це в адміністратора, коли записуєтеся.", ru: "Да. Клинико-диагностическая лаборатория работает непосредственно в центре, поэтому назначенные исследования можно сдать сразу после консультации. Большинство анализов требует подготовки натощак - уточните это у администратора, когда записываетесь.", en: "Yes. The clinical diagnostic laboratory is inside the centre, so any tests ordered can be taken straight after the consultation. Most require fasting - check with the administrator when you book." } },
      { question: { uk: "Чи видає терапевт довідки та медичні висновки?", ru: "Выдаёт ли терапевт справки и медицинские заключения?", en: "Does the GP issue certificates and medical reports?" },
        answer: { uk: "Так, у межах компетенції лікаря та після необхідного обстеження. Якщо вам потрібен конкретний документ - для роботи, спорту, оперативного втручання чи страхової - скажіть про це під час запису, щоб лікар заздалегідь знав обсяг обстеження.", ru: "Да, в пределах компетенции врача и после необходимого обследования. Если вам нужен конкретный документ - для работы, спорта, оперативного вмешательства или страховой - скажите об этом при записи, чтобы врач заранее знал объём обследования.", en: "Yes, within the physician's remit and after the necessary examination. If you need a specific document - for work, sport, surgery or an insurer - say so when booking, so the physician knows in advance what the assessment must cover." } },
      { question: { uk: "Чи можна прийти лише щоб розібрати аналізи?", ru: "Можно ли прийти только чтобы разобрать анализы?", en: "Can I come just to have my results explained?" },
        answer: { uk: "Так, це поширений запит. Візьміть із собою всі наявні результати, зокрема старі - динаміка показників часто інформативніша за одне значення. Лікар пояснить, що означають відхилення, які з них потребують дій, а які ні.", ru: "Да, это распространённый запрос. Возьмите с собой все имеющиеся результаты, включая старые - динамика показателей часто информативнее одного значения. Врач объяснит, что означают отклонения, какие из них требуют действий, а какие нет.", en: "Yes, it is a common request. Bring all the results you have, including older ones - a trend is often more informative than a single value. The physician will explain what the abnormalities mean and which of them require action." } },
      { question: { uk: "Чи проводите ви передопераційне обстеження?", ru: "Проводите ли вы предоперационное обследование?", en: "Do you carry out pre-operative work-ups?" },
        answer: { uk: "Так. Терапевт складає перелік досліджень відповідно до типу втручання, аналізи здаються у власній лабораторії, а за результатами лікар готує висновок. Це зручно, якщо ви плануєте операцію - зокрема пластичну - і потрібен повний пакет обстежень в одному місці.", ru: "Да. Терапевт составляет перечень исследований в соответствии с типом вмешательства, анализы сдаются в собственной лаборатории, а по результатам врач готовит заключение. Это удобно, если вы планируете операцию - в том числе пластическую - и нужен полный пакет обследований в одном месте.", en: "Yes. The GP draws up the list of tests appropriate to the procedure, the samples are processed in our own laboratory, and the physician issues a report on the results. This is convenient if you are planning surgery - including plastic surgery - and need the full package in one place." } },
      { question: { uk: "Чи потрібно приходити натще?", ru: "Нужно ли приходить натощак?", en: "Do I need to come fasting?" },
        answer: { uk: "На саму консультацію - ні. Але якщо ви плануєте одразу здати аналізи або зробити УЗД органів черевної порожнини, приходьте натще: останній прийом їжі за 8-12 годин, воду пити можна. Скажіть про свої плани адміністратору під час запису.", ru: "На саму консультацию - нет. Но если вы планируете сразу сдать анализы или сделать УЗИ органов брюшной полости, приходите натощак: последний приём пищи за 8-12 часов, воду пить можно. Скажите о своих планах администратору при записи.", en: "Not for the consultation itself. If you plan to have blood tests or an abdominal ultrasound at the same visit, though, come fasting: last meal 8-12 hours before, water allowed. Tell the administrator your plans when booking." } },
      { question: { uk: "Скільки коштує консультація терапевта в Дніпрі?", ru: "Сколько стоит консультация терапевта в Днепре?", en: "How much does a GP consultation cost in Dnipro?" },
        answer: { uk: "Прийом лікаря-терапевта коштує від 900 грн і триває 30 хвилин. Актуальні ціни є в розділі «Ціни» на сайті, адміністратор підтвердить їх під час запису. Аналізи, УЗД та інші обстеження оплачуються окремо за прайсом.", ru: "Приём врача-терапевта стоит от 900 грн и длится 30 минут. Актуальные цены есть в разделе «Цены» на сайте, администратор подтвердит их при записи. Анализы, УЗИ и другие обследования оплачиваются отдельно по прайсу.", en: "A GP appointment costs from UAH 900 and lasts 30 minutes. Current prices are in the Prices section and the administrator will confirm them when you book. Tests, ultrasound and other investigations are charged separately." } },
    ],
  },

  // ─── НЕВРОЛОГ ─────────────────────────────────────────────────────────────
  {
    slug: "neurologist",
    meta: {
      category: "diagnostics",
      h1: { uk: "Невролог в Дніпрі", ru: "Невролог в Днепре", en: "Neurologist in Dnipro" },
      seoTitle: {
        uk: "Невролог у Дніпрі - консультація лікаря-невролога",
        ru: "Невролог в Днепре - консультация врача-невролога",
        en: "Neurologist in Dnipro - neurology consultation",
      },
      seoDesc: {
        uk: "Консультація невролога у Дніпрі 🤍 GENEVITY. Головний біль, біль у спині, запаморочення, порушення сну 💫 Обстеження та лікування без черг.",
        ru: "Консультация невролога в Днепре 🤍 GENEVITY. Головная боль, боль в спине, головокружение, нарушения сна 💫 Обследование и лечение без очередей.",
        en: "Neurology consultation in Dnipro 🤍 GENEVITY. Headache, back pain, dizziness and sleep disorders 💫 Assessment and treatment without queues.",
      },
    },
    title: { uk: "Консультація лікаря-невролога", ru: "Консультация врача-невролога", en: "Neurologist Consultation" },
    summary: {
      uk: "Консультація невролога у GENEVITY: головний біль, біль у спині та шиї, запаморочення, оніміння, порушення сну. Неврологічний огляд, обстеження й план лікування. Дніпро.",
      ru: "Консультация невролога в GENEVITY: головная боль, боль в спине и шее, головокружение, онемение, нарушения сна. Неврологический осмотр, обследование и план лечения. Днепр.",
      en: "A neurology consultation at GENEVITY: headache, back and neck pain, dizziness, numbness and sleep disturbance. A neurological examination, investigations and a treatment plan. Dnipro.",
    },
    procedureLength: { uk: "30 хвилин", ru: "30 минут", en: "30 minutes" },
    priceFrom: { uk: "від 1000 грн", ru: "от 1000 грн", en: "from UAH 1000" },
    priceUnit: UAH,
    blocks: CONSULTATION_BLOCKS,
    related: ["therapist", "check-up-40", "endocrinologist", "ultrasound"],
    doctors: [],
    sections: [
      {
        type: "richText",
        heading: { uk: "Коли потрібна консультація невролога", ru: "Когда нужна консультация невролога", en: "When a neurology consultation is needed" },
        body: {
          uk: "Невролог працює з нервовою системою: головним і спинним мозком, периферичними нервами. Найчастіші причини звернення - головний біль і біль у спині, і саме тут найбільше самолікування: знеболювальні знімають симптом, але не змінюють причину, а біль поступово стає хронічним.\n\nНеврологічний огляд - це не формальність. Лікар перевіряє рефлекси, чутливість, м'язову силу, координацію та роботу черепних нервів. Ці прості проби дають достатньо інформації, щоб зрозуміти рівень ураження й вирішити, які обстеження справді потрібні, а які ні.\n\nОкремий напрям - сон і когнітивні функції. Порушення сну, зниження концентрації, погіршення пам'яті часто списують на втому, хоча за ними може стояти неврологічна або ендокринна причина. У GENEVITY це зручно перевірити комплексно: лабораторія та ультразвукова діагностика працюють на місці, а за потреби лікар залучає ендокринолога.\n\n**Не відкладайте візит, якщо:**\n- головний біль став частішим або змінив характер;\n- біль у спині чи шиї віддає в руку або ногу;\n- з'явилося оніміння, поколювання, слабкість у кінцівках;\n- турбує запаморочення чи хиткість при ходьбі;\n- сон порушений довше місяця.",
          ru: "Невролог работает с нервной системой: головным и спинным мозгом, периферическими нервами. Самые частые причины обращения - головная боль и боль в спине, и именно здесь больше всего самолечения: обезболивающие снимают симптом, но не меняют причину, а боль постепенно становится хронической.\n\nНеврологический осмотр - это не формальность. Врач проверяет рефлексы, чувствительность, мышечную силу, координацию и работу черепных нервов. Эти простые пробы дают достаточно информации, чтобы понять уровень поражения и решить, какие обследования действительно нужны, а какие нет.\n\nОтдельное направление - сон и когнитивные функции. Нарушения сна, снижение концентрации, ухудшение памяти часто списывают на усталость, хотя за ними может стоять неврологическая или эндокринная причина. В GENEVITY это удобно проверить комплексно: лаборатория и ультразвуковая диагностика работают на месте, а при необходимости врач привлекает эндокринолога.\n\n**Не откладывайте визит, если:**\n- головная боль стала чаще или изменила характер;\n- боль в спине или шее отдаёт в руку либо ногу;\n- появилось онемение, покалывание, слабость в конечностях;\n- беспокоит головокружение или шаткость при ходьбе;\n- сон нарушен дольше месяца.",
          en: "A neurologist deals with the nervous system: the brain, spinal cord and peripheral nerves. The commonest reasons for a consultation are headache and back pain - and these are exactly where self-medication is most common. Painkillers take away the symptom without changing the cause, and the pain gradually becomes chronic.\n\nThe neurological examination is not a formality. The physician tests reflexes, sensation, muscle power, coordination and cranial nerve function. These simple manoeuvres give enough information to identify the level of the problem and decide which investigations are genuinely required.\n\nSleep and cognition are a field of their own. Disturbed sleep, poor concentration and failing memory are often put down to tiredness, when a neurological or endocrine cause may lie behind them. At GENEVITY this is easy to assess comprehensively: the laboratory and ultrasound diagnostics are on site, and the physician can involve an endocrinologist where needed.\n\n**Do not delay a visit if:**\n- your headaches have become more frequent or changed in character;\n- back or neck pain radiates into an arm or leg;\n- you have developed numbness, tingling or weakness in a limb;\n- you are troubled by dizziness or unsteadiness when walking;\n- your sleep has been disturbed for more than a month.",
        },
      },
      {
        type: "bullets",
        heading: { uk: "Із чим звертаються до невролога", ru: "С чем обращаются к неврологу", en: "What people consult a neurologist about" },
        items: [
          { uk: "Головний біль напруги та мігрень", ru: "Головная боль напряжения и мигрень", en: "Tension-type headache and migraine" },
          { uk: "Біль у спині та шиї, наслідки остеохондрозу", ru: "Боль в спине и шее, последствия остеохондроза", en: "Back and neck pain, and the effects of spinal degeneration" },
          { uk: "Оніміння, поколювання та слабкість у кінцівках", ru: "Онемение, покалывание и слабость в конечностях", en: "Numbness, tingling and weakness in the limbs" },
          { uk: "Запаморочення та порушення рівноваги", ru: "Головокружение и нарушения равновесия", en: "Dizziness and problems with balance" },
          { uk: "Безсоння та інші порушення сну", ru: "Бессонница и другие нарушения сна", en: "Insomnia and other sleep disorders" },
          { uk: "Зниження пам'яті та концентрації", ru: "Снижение памяти и концентрации", en: "Declining memory and concentration" },
          { uk: "Невралгії, защемлення нервів, тунельні синдроми", ru: "Невралгии, защемления нервов, туннельные синдромы", en: "Neuralgia, nerve entrapment and tunnel syndromes" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить прийом невролога", ru: "Как проходит приём невролога", en: "How the neurology appointment works" },
        steps: [
          { title: { uk: "Опис скарг", ru: "Описание жалоб", en: "Describing the problem" }, description: { uk: "Лікар з'ясовує характер, локалізацію та тригери болю, як довго це триває і що допомагало раніше.", ru: "Врач выясняет характер, локализацию и триггеры боли, как долго это длится и что помогало раньше.", en: "The physician establishes the character, location and triggers of the pain, how long it has lasted and what has helped before." } },
          { title: { uk: "Неврологічний огляд", ru: "Неврологический осмотр", en: "Neurological examination" }, description: { uk: "Перевірка рефлексів, чутливості, м'язової сили, координації та роботи черепних нервів.", ru: "Проверка рефлексов, чувствительности, мышечной силы, координации и работы черепных нервов.", en: "Testing of reflexes, sensation, muscle power, coordination and cranial nerve function." } },
          { title: { uk: "Призначення обстежень", ru: "Назначение обследований", en: "Ordering investigations" }, description: { uk: "За потреби - аналізи та УЗД судин у клініці; МРТ або КТ лікар призначає з направленням і поясненням підготовки.", ru: "При необходимости - анализы и УЗИ сосудов в клинике; МРТ или КТ врач назначает с направлением и объяснением подготовки.", en: "Where needed, blood tests and vascular ultrasound in the clinic; for MRI or CT the physician issues a referral and explains the preparation." } },
          { title: { uk: "План лікування", ru: "План лечения", en: "Treatment plan" }, description: { uk: "Медикаментозна схема, рекомендації щодо режиму й навантажень, за потреби - направлення до реабілітолога.", ru: "Медикаментозная схема, рекомендации по режиму и нагрузкам, при необходимости - направление к реабилитологу.", en: "A medication regimen, advice on routine and activity, and a referral for rehabilitation where appropriate." } },
        ],
      },
    ],
    faqs: [
      { question: { uk: "Чи потрібно робити МРТ перед візитом до невролога?", ru: "Нужно ли делать МРТ перед визитом к неврологу?", en: "Should I have an MRI before seeing the neurologist?" },
        answer: { uk: "Ні, і робити його «про всяк випадок» не варто. Обсяг обстеження визначає лікар після огляду: у багатьох випадках МРТ не потрібне взагалі, а знахідки без клінічного значення лише додають тривоги. Якщо дослідження вже зроблено - візьміть диск або знімки з собою.", ru: "Нет, и делать его «на всякий случай» не стоит. Объём обследования определяет врач после осмотра: во многих случаях МРТ не нужно вообще, а находки без клинического значения лишь добавляют тревоги. Если исследование уже сделано - возьмите диск или снимки с собой.", en: "No, and having one just in case is not advisable. The physician decides the scope of investigation after examining you: in many cases an MRI is not needed at all, and incidental findings of no clinical significance only cause anxiety. If you have already had one, bring the images with you." } },
      { question: { uk: "Як підготуватися до консультації невролога?", ru: "Как подготовиться к консультации невролога?", en: "How should I prepare for the consultation?" },
        answer: { uk: "Занотуйте, коли з'явилися симптоми, як часто повторюються, що їх провокує та що полегшує. Візьміть результати попередніх обстежень і список препаратів, які приймаєте. Якщо йдеться про головний біль, стане в пригоді щоденник за 2-4 тижні.", ru: "Запишите, когда появились симптомы, как часто повторяются, что их провоцирует и что облегчает. Возьмите результаты предыдущих обследований и список препаратов, которые принимаете. Если речь о головной боли, пригодится дневник за 2-4 недели.", en: "Note down when the symptoms started, how often they recur, what brings them on and what relieves them. Bring previous test results and a list of your medication. For headache, a diary covering two to four weeks is particularly useful." } },
      { question: { uk: "Чи лікує невролог головний біль без знеболювальних?", ru: "Лечит ли невролог головную боль без обезболивающих?", en: "Can the neurologist treat headache without painkillers?" },
        answer: { uk: "Мета лікування - зменшити частоту нападів, а не лише знімати біль. Для цього використовують профілактичну терапію, корекцію режиму сну, харчування та навантажень, роботу з тригерами. Знеболювальні залишаються для нападів, але їх кількість контролюють - надмірний прийом сам стає причиною хронічного болю.", ru: "Цель лечения - уменьшить частоту приступов, а не только снимать боль. Для этого используют профилактическую терапию, коррекцию режима сна, питания и нагрузок, работу с триггерами. Обезболивающие остаются для приступов, но их количество контролируют - чрезмерный приём сам становится причиной хронической боли.", en: "The aim is to reduce how often attacks occur, not merely to relieve pain. That involves preventive medication, adjusting sleep, diet and activity, and working on triggers. Painkillers remain for attacks, but their use is monitored - overuse itself becomes a cause of chronic headache." } },
      { question: { uk: "Чи можна поєднати прийом невролога з обстеженнями?", ru: "Можно ли совместить приём невролога с обследованиями?", en: "Can I combine the appointment with investigations?" },
        answer: { uk: "Так. Аналізи та ультразвукову діагностику виконують у центрі, тому призначені дослідження можна пройти в той самий день. Попередьте адміністратора під час запису, щоб для вас передбачили час.", ru: "Да. Анализы и ультразвуковую диагностику выполняют в центре, поэтому назначенные исследования можно пройти в тот же день. Предупредите администратора при записи, чтобы для вас предусмотрели время.", en: "Yes. Laboratory tests and ultrasound are done at the centre, so any investigations ordered can be completed the same day. Let the administrator know when booking so the time can be set aside." } },
      { question: { uk: "Чи пов'язані порушення сну з неврологією?", ru: "Связаны ли нарушения сна с неврологией?", en: "Are sleep problems a neurological matter?" },
        answer: { uk: "Часто так, але не завжди. Безсоння буває наслідком тривожних розладів, гормональних порушень, апное або больового синдрому. Невролог визначає, у якому напрямі шукати, і за потреби залучає ендокринолога чи терапевта - у GENEVITY це відбувається в межах одного центру.", ru: "Часто да, но не всегда. Бессонница бывает следствием тревожных расстройств, гормональных нарушений, апноэ или болевого синдрома. Невролог определяет, в каком направлении искать, и при необходимости привлекает эндокринолога или терапевта - в GENEVITY это происходит в рамках одного центра.", en: "Often, but not always. Insomnia can stem from anxiety, hormonal disturbance, sleep apnoea or a pain syndrome. The neurologist works out where to look and involves an endocrinologist or GP if needed - at GENEVITY that all happens within one centre." } },
      { question: { uk: "Як швидко буде результат від лікування?", ru: "Как быстро будет результат от лечения?", en: "How quickly will treatment work?" },
        answer: { uk: "Залежить від діагнозу. Гострий біль у спині зазвичай відступає за 1-2 тижні коректної терапії. Профілактичне лікування мігрені оцінюють не раніше ніж через 2-3 місяці - саме стільки потрібно, щоб побачити зміну частоти нападів. Лікар назве реальні строки на прийомі.", ru: "Зависит от диагноза. Острая боль в спине обычно отступает за 1-2 недели корректной терапии. Профилактическое лечение мигрени оценивают не раньше чем через 2-3 месяца - именно столько нужно, чтобы увидеть изменение частоты приступов. Врач назовёт реальные сроки на приёме.", en: "It depends on the diagnosis. Acute back pain usually settles within one to two weeks of correct treatment. Preventive migraine therapy cannot be judged before two to three months, which is how long it takes to see a change in attack frequency. The physician will give you realistic timescales." } },
      { question: { uk: "Скільки коштує консультація невролога в Дніпрі?", ru: "Сколько стоит консультация невролога в Днепре?", en: "How much does a neurology consultation cost in Dnipro?" },
        answer: { uk: "Прийом лікаря-невролога коштує від 1000 грн і триває 30 хвилин. Актуальні ціни є в розділі «Ціни» на сайті, адміністратор підтвердить їх під час запису. Обстеження оплачуються окремо за прайсом.", ru: "Приём врача-невролога стоит от 1000 грн и длится 30 минут. Актуальные цены есть в разделе «Цены» на сайте, администратор подтвердит их при записи. Обследования оплачиваются отдельно по прайсу.", en: "A neurology appointment costs from UAH 1000 and lasts 30 minutes. Current prices are in the Prices section and the administrator will confirm them when you book. Investigations are charged separately." } },
    ],
  },

  // ─── РЕПРОДУКТОЛОГ ────────────────────────────────────────────────────────
  {
    slug: "reproductologist",
    meta: {
      category: "diagnostics",
      h1: { uk: "Репродуктолог в Дніпрі", ru: "Репродуктолог в Днепре", en: "Fertility specialist in Dnipro" },
      seoTitle: {
        uk: "Репродуктолог у Дніпрі - консультація лікаря-репродуктолога",
        ru: "Репродуктолог в Днепре - консультация врача-репродуктолога",
        en: "Fertility specialist in Dnipro - reproductive medicine consultation",
      },
      seoDesc: {
        uk: "Консультація репродуктолога у Дніпрі 🤍 GENEVITY. Обстеження при плануванні вагітності та труднощах із зачаттям 💫 УЗД і гормони на місці.",
        ru: "Консультация репродуктолога в Днепре 🤍 GENEVITY. Обследование при планировании беременности и трудностях с зачатием 💫 УЗИ и гормоны на месте.",
        en: "Fertility consultation in Dnipro 🤍 GENEVITY. Assessment when planning a pregnancy or struggling to conceive 💫 Ultrasound and hormone testing on site.",
      },
    },
    title: { uk: "Консультація лікаря-репродуктолога", ru: "Консультация врача-репродуктолога", en: "Fertility Specialist Consultation" },
    summary: {
      uk: "Консультація репродуктолога у GENEVITY: обстеження пари при плануванні вагітності та труднощах із зачаттям, оцінка оваріального резерву, гормональний профіль і УЗД на місці. Дніпро.",
      ru: "Консультация репродуктолога в GENEVITY: обследование пары при планировании беременности и трудностях с зачатием, оценка овариального резерва, гормональный профиль и УЗИ на месте. Днепр.",
      en: "A fertility consultation at GENEVITY: assessment of a couple planning a pregnancy or having difficulty conceiving, ovarian reserve testing, a hormone profile and ultrasound on site. Dnipro.",
    },
    procedureLength: { uk: "30 хвилин", ru: "30 минут", en: "30 minutes" },
    priceFrom: { uk: "від 1100 грн", ru: "от 1100 грн", en: "from UAH 1100" },
    priceUnit: UAH,
    blocks: CONSULTATION_BLOCKS,
    related: ["hormonal-balance", "endocrinologist", "ultrasound", "check-up-40"],
    doctors: [],
    sections: [
      {
        type: "richText",
        heading: { uk: "Чим займається репродуктолог", ru: "Чем занимается репродуктолог", en: "What a fertility specialist does" },
        body: {
          uk: "Репродуктолог - лікар, який займається фертильністю: здатністю завагітніти й виносити дитину. До нього звертаються у двох ситуаціях - коли вагітність планують і хочуть підготуватися, і коли зачаття не настає попри регулярні спроби.\n\nВажливий момент, який часто ігнорують: репродуктивне здоров'я - питання пари, а не лише жінки. Приблизно в третині випадків причина труднощів із зачаттям виявляється з боку чоловіка, ще в третині - обопільна. Тому коректне обстеження від початку охоплює обох партнерів.\n\nУ GENEVITY консультація репродуктолога спирається на власну діагностичну базу. Гормональний профіль, включно з АМГ для оцінки оваріального резерву, здають у лабораторії центру. Ультразвукове дослідження органів малого таза виконують на апараті експертного класу GE LOGIQ E10. За потреби лікар залучає ендокринолога - щитоподібна залоза, інсулінорезистентність і пролактин безпосередньо впливають на фертильність.\n\nПро строки. Пáрам до 35 років рекомендують звертатися після 12 місяців регулярних спроб без результату, після 35 років - після 6 місяців. Але якщо цикл нерегулярний, були втрати вагітності або операції на органах малого таза, приходьте одразу, не вичікуючи.",
          ru: "Репродуктолог - врач, который занимается фертильностью: способностью забеременеть и выносить ребёнка. К нему обращаются в двух ситуациях - когда беременность планируют и хотят подготовиться, и когда зачатие не наступает несмотря на регулярные попытки.\n\nВажный момент, который часто игнорируют: репродуктивное здоровье - вопрос пары, а не только женщины. Примерно в трети случаев причина трудностей с зачатием обнаруживается со стороны мужчины, ещё в трети - обоюдная. Поэтому корректное обследование с самого начала охватывает обоих партнёров.\n\nВ GENEVITY консультация репродуктолога опирается на собственную диагностическую базу. Гормональный профиль, включая АМГ для оценки овариального резерва, сдают в лаборатории центра. Ультразвуковое исследование органов малого таза выполняют на аппарате экспертного класса GE LOGIQ E10. При необходимости врач привлекает эндокринолога - щитовидная железа, инсулинорезистентность и пролактин напрямую влияют на фертильность.\n\nО сроках. Парам до 35 лет рекомендуют обращаться после 12 месяцев регулярных попыток без результата, после 35 лет - после 6 месяцев. Но если цикл нерегулярный, были потери беременности или операции на органах малого таза, приходите сразу, не выжидая.",
          en: "A fertility specialist deals with the ability to conceive and carry a pregnancy. People come in two situations: when planning a pregnancy and wanting to prepare, and when conception is not happening despite regular attempts.\n\nOne point is frequently overlooked: fertility is a matter for the couple, not the woman alone. In roughly a third of cases the cause lies with the male partner, and in another third with both. A proper assessment therefore covers both partners from the outset.\n\nAt GENEVITY the fertility consultation is backed by our own diagnostic facilities. The hormone profile, including AMH for ovarian reserve, is processed in the centre's laboratory. Pelvic ultrasound is performed on an expert-class GE LOGIQ E10. Where needed the physician involves an endocrinologist, since thyroid function, insulin resistance and prolactin all bear directly on fertility.\n\nOn timing: couples under 35 are advised to seek help after 12 months of regular attempts without success, and after 35 following six months. If your cycle is irregular, you have had pregnancy losses, or you have had pelvic surgery, come straight away rather than waiting.",
        },
      },
      {
        type: "bullets",
        heading: { uk: "Із якими запитами звертаються до репродуктолога", ru: "С какими запросами обращаются к репродуктологу", en: "What a fertility specialist is consulted about" },
        items: [
          { uk: "Планування вагітності та підготовка організму", ru: "Планирование беременности и подготовка организма", en: "Planning a pregnancy and preparing for it" },
          { uk: "Відсутність вагітності протягом 6-12 місяців спроб", ru: "Отсутствие беременности в течение 6-12 месяцев попыток", en: "No pregnancy after 6-12 months of trying" },
          { uk: "Нерегулярний менструальний цикл і відсутність овуляції", ru: "Нерегулярный менструальный цикл и отсутствие овуляции", en: "An irregular cycle or absent ovulation" },
          { uk: "Оцінка оваріального резерву перед плануванням", ru: "Оценка овариального резерва перед планированием", en: "Assessment of ovarian reserve before trying" },
          { uk: "Синдром полікістозних яєчників і ендометріоз", ru: "Синдром поликистозных яичников и эндометриоз", en: "Polycystic ovary syndrome and endometriosis" },
          { uk: "Повторні втрати вагітності на ранніх строках", ru: "Повторные потери беременности на ранних сроках", en: "Recurrent early pregnancy loss" },
          { uk: "Обстеження чоловічого фактора фертильності", ru: "Обследование мужского фактора фертильности", en: "Investigation of the male factor" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить консультація репродуктолога", ru: "Как проходит консультация репродуктолога", en: "How the fertility consultation works" },
        steps: [
          { title: { uk: "Репродуктивний анамнез", ru: "Репродуктивный анамнез", en: "Reproductive history" }, description: { uk: "Лікар з'ясовує характер циклу, тривалість спроб, попередні вагітності, операції та хронічні захворювання - в обох партнерів.", ru: "Врач выясняет характер цикла, длительность попыток, предыдущие беременности, операции и хронические заболевания - у обоих партнёров.", en: "The physician establishes the pattern of your cycle, how long you have been trying, previous pregnancies, surgery and chronic illness - for both partners." } },
          { title: { uk: "Обстеження та УЗД", ru: "Обследование и УЗИ", en: "Examination and ultrasound" }, description: { uk: "Ультразвукове дослідження органів малого таза з підрахунком антральних фолікулів виконують у центрі на GE LOGIQ E10.", ru: "Ультразвуковое исследование органов малого таза с подсчётом антральных фолликулов выполняют в центре на GE LOGIQ E10.", en: "Pelvic ultrasound with an antral follicle count is performed at the centre on the GE LOGIQ E10." } },
          { title: { uk: "Гормональний профіль", ru: "Гормональный профиль", en: "Hormone profile" }, description: { uk: "АМГ, ФСГ, ЛГ, пролактин, гормони щитоподібної залози - здають у власній лабораторії, з урахуванням дня циклу.", ru: "АМГ, ФСГ, ЛГ, пролактин, гормоны щитовидной железы - сдают в собственной лаборатории, с учётом дня цикла.", en: "AMH, FSH, LH, prolactin and thyroid hormones are taken in our own laboratory, timed to the correct day of your cycle." } },
          { title: { uk: "План дій", ru: "План действий", en: "The plan" }, description: { uk: "За результатами лікар складає план: підготовка, лікування виявлених станів або направлення до профільного репродуктивного центру.", ru: "По результатам врач составляет план: подготовка, лечение выявленных состояний или направление в профильный репродуктивный центр.", en: "Based on the results the physician sets out a plan: preparation, treatment of what has been found, or referral to a specialist fertility centre." } },
        ],
      },
    ],
    faqs: [
      { question: { uk: "Коли варто звертатися до репродуктолога?", ru: "Когда стоит обращаться к репродуктологу?", en: "When should I see a fertility specialist?" },
        answer: { uk: "Якщо вам до 35 років - після 12 місяців регулярних спроб без результату. Після 35 років - після 6 місяців. Не чекайте цих строків, якщо цикл нерегулярний, були втрати вагітності, операції на органах малого таза або вже відомі гормональні порушення.", ru: "Если вам до 35 лет - после 12 месяцев регулярных попыток без результата. После 35 лет - после 6 месяцев. Не ждите этих сроков, если цикл нерегулярный, были потери беременности, операции на органах малого таза или уже известны гормональные нарушения.", en: "If you are under 35, after 12 months of regular attempts without success; over 35, after six months. Do not wait that long if your cycle is irregular, you have had pregnancy losses or pelvic surgery, or a hormonal disorder is already known." } },
      { question: { uk: "Чи потрібно приходити разом із партнером?", ru: "Нужно ли приходить вместе с партнёром?", en: "Should my partner come too?" },
        answer: { uk: "Це бажано. Приблизно в третині випадків причина труднощів із зачаттям пов'язана з чоловічим фактором, ще в третині - обопільна. Якщо прийти разом не виходить, партнер може пройти обстеження окремо, а лікар розгляне результати обох.", ru: "Это желательно. Примерно в трети случаев причина трудностей с зачатием связана с мужским фактором, ещё в трети - обоюдная. Если прийти вместе не выходит, партнёр может пройти обследование отдельно, а врач рассмотрит результаты обоих.", en: "Ideally yes. In roughly a third of cases the difficulty relates to the male partner, and in another third to both. If coming together is not possible, your partner can be investigated separately and the physician will review both sets of results." } },
      { question: { uk: "На який день циклу планувати візит?", ru: "На какой день цикла планировать визит?", en: "Which day of the cycle should I book?" },
        answer: { uk: "Для першої консультації день циклу значення не має. Але частина досліджень прив'язана до нього: ФСГ, ЛГ і естрадіол здають на 2-5 день, УЗД для підрахунку антральних фолікулів роблять у першій фазі. Скажіть адміністратору дату останньої менструації - вам підберуть зручний час.", ru: "Для первой консультации день цикла значения не имеет. Но часть исследований привязана к нему: ФСГ, ЛГ и эстрадиол сдают на 2-5 день, УЗИ для подсчёта антральных фолликулов делают в первой фазе. Скажите администратору дату последней менструации - вам подберут удобное время.", en: "For a first consultation the day does not matter. Some tests are tied to it, though: FSH, LH and oestradiol are taken on days 2-5, and the antral follicle count is done in the first phase. Tell the administrator the date of your last period and a suitable slot will be found." } },
      { question: { uk: "Чи робите ви ЕКЗ?", ru: "Делаете ли вы ЭКО?", en: "Do you carry out IVF?" },
        answer: { uk: "Програми допоміжних репродуктивних технологій у центрі не проводять. Ми беремо на себе діагностичний етап - обстеження, гормональний профіль, УЗД, корекцію станів, які знижують шанси, - і за потреби готуємо повний пакет документів для профільного репродуктивного центру.", ru: "Программы вспомогательных репродуктивных технологий в центре не проводят. Мы берём на себя диагностический этап - обследование, гормональный профиль, УЗИ, коррекцию состояний, снижающих шансы, - и при необходимости готовим полный пакет документов для профильного репродуктивного центра.", en: "Assisted reproduction programmes are not carried out at the centre. We handle the diagnostic stage - investigation, hormone profile, ultrasound and treatment of conditions that reduce your chances - and prepare the full documentation for a specialist fertility centre where that is needed." } },
      { question: { uk: "Що показує аналіз на АМГ?", ru: "Что показывает анализ на АМГ?", en: "What does the AMH test show?" },
        answer: { uk: "Антимюллерів гормон відображає оваріальний резерв - запас яйцеклітин, які ще можуть дозріти. Показник допомагає оцінити перспективи природного зачаття й спланувати строки. Важливо: низький АМГ не означає неможливість вагітності, це один із параметрів, який лікар оцінює в комплексі.", ru: "Антимюллеров гормон отражает овариальный резерв - запас яйцеклеток, которые ещё могут созреть. Показатель помогает оценить перспективы естественного зачатия и спланировать сроки. Важно: низкий АМГ не означает невозможность беременности, это один из параметров, который врач оценивает в комплексе.", en: "Anti-Mullerian hormone reflects ovarian reserve - the pool of eggs still capable of maturing. It helps assess the outlook for natural conception and plan timing. Importantly, a low AMH does not mean pregnancy is impossible; it is one parameter among several the physician weighs up." } },
      { question: { uk: "Чи пов'язана фертильність із роботою щитоподібної залози?", ru: "Связана ли фертильность с работой щитовидной железы?", en: "Is fertility linked to thyroid function?" },
        answer: { uk: "Безпосередньо. Порушення функції щитоподібної залози, підвищений пролактин та інсулінорезистентність збивають овуляцію і збільшують ризик втрати вагітності. Тому в обстеження завжди входить гормональний профіль, а за відхилень репродуктолог працює разом з ендокринологом центру.", ru: "Напрямую. Нарушения функции щитовидной железы, повышенный пролактин и инсулинорезистентность сбивают овуляцию и увеличивают риск потери беременности. Поэтому в обследование всегда входит гормональный профиль, а при отклонениях репродуктолог работает вместе с эндокринологом центра.", en: "Directly. Thyroid dysfunction, raised prolactin and insulin resistance all disrupt ovulation and increase the risk of pregnancy loss. A hormone profile is therefore always part of the work-up, and where abnormalities are found the fertility specialist works alongside the centre's endocrinologist." } },
      { question: { uk: "Скільки коштує консультація репродуктолога в Дніпрі?", ru: "Сколько стоит консультация репродуктолога в Днепре?", en: "How much does a fertility consultation cost in Dnipro?" },
        answer: { uk: "Прийом лікаря-репродуктолога коштує від 1100 грн і триває 30 хвилин. Актуальні ціни є в розділі «Ціни» на сайті, адміністратор підтвердить їх під час запису. Аналізи та УЗД оплачуються окремо за прайсом.", ru: "Приём врача-репродуктолога стоит от 1100 грн и длится 30 минут. Актуальные цены есть в разделе «Цены» на сайте, администратор подтвердит их при записи. Анализы и УЗИ оплачиваются отдельно по прайсу.", en: "A fertility appointment costs from UAH 1100 and lasts 30 minutes. Current prices are in the Prices section and the administrator will confirm them when you book. Tests and ultrasound are charged separately." } },
    ],
  },
];
