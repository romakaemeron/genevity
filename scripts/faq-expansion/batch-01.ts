import { seed, type Batch } from "./run";

const batches: Batch[] = [
  {
    type: "service",
    slug: "acne-treatment",
    items: [
      {
        q: {
          uk: "У якому віці можна починати лікування акне?",
          ru: "В каком возрасте можно начинать лечение акне?",
          en: "At what age can acne treatment begin?",
        },
        a: {
          uk: "Дерматологічний супровід можливий із підліткового віку — з 14–16 років, за згодою батьків. Протокол для підлітків м'якший: акцент на догляді, протизапальній терапії та контролі за станом шкіри. Апаратні методики додають пізніше, коли шкіра стабілізується.",
          ru: "Дерматологическое сопровождение возможно с подросткового возраста — с 14–16 лет, с согласия родителей. Протокол для подростков мягче: акцент на уходе, противовоспалительной терапии и контроле состояния кожи. Аппаратные методики подключают позже, когда кожа стабилизируется.",
          en: "Dermatological care can begin in adolescence, from about 14–16 years with parental consent. The teenage protocol is gentler: it focuses on skincare, anti-inflammatory therapy and monitoring. Device-based methods are added later, once the skin has stabilised.",
        },
      },
      {
        q: {
          uk: "Чи впливає харчування на перебіг акне?",
          ru: "Влияет ли питание на течение акне?",
          en: "Does diet affect acne?",
        },
        a: {
          uk: "Так, але харчування — лише один із чинників. Доказова база підтверджує зв'язок акне з продуктами з високим глікемічним індексом і надлишком молочних продуктів. Лікар GENEVITY оцінює раціон разом із гормональним статусом, а за потреби скеровує до гастроентеролога-дієтолога центру.",
          ru: "Да, но питание — лишь один из факторов. Доказательная база подтверждает связь акне с продуктами высокого гликемического индекса и избытком молочных продуктов. Врач GENEVITY оценивает рацион вместе с гормональным статусом, а при необходимости направляет к гастроэнтерологу-диетологу центра.",
          en: "Yes, though diet is only one factor. Evidence links acne with high-glycaemic foods and an excess of dairy. The GENEVITY physician reviews your diet alongside your hormonal status and, if needed, refers you to the centre's gastroenterologist-dietician.",
        },
      },
      {
        q: {
          uk: "Що робити зі слідами постакне після того, як запалення минуло?",
          ru: "Что делать со следами постакне после того, как воспаление ушло?",
          en: "What can be done about post-acne marks once the inflammation has cleared?",
        },
        a: {
          uk: "Спершу стабілізуємо шкіру, і лише потім працюємо зі слідами. З пігментними плямами добре справляється M22 Stellar Black, з атрофічними рубцями — фракційна лазерна шліфовка AcuPulse CO₂. Послідовність і паузи між етапами визначає лікар за станом шкіри.",
          ru: "Сначала стабилизируем кожу и лишь затем работаем со следами. С пигментными пятнами хорошо справляется M22 Stellar Black, с атрофическими рубцами — фракционная лазерная шлифовка AcuPulse CO₂. Последовательность и паузы между этапами определяет врач по состоянию кожи.",
          en: "We stabilise the skin first and only then address the marks. Pigmented spots respond well to M22 Stellar Black, while atrophic scars are treated with fractional AcuPulse CO₂ resurfacing. The physician sets the sequence and the intervals according to how your skin responds.",
        },
      },
      {
        q: {
          uk: "Чи можна лікувати акне влітку?",
          ru: "Можно ли лечить акне летом?",
          en: "Can acne be treated in summer?",
        },
        a: {
          uk: "Так, протизапальну терапію та догляд проводять цілий рік. Обмеження стосуються процедур, що підвищують фоточутливість — їх планують на сезон із меншою сонячною активністю або компенсують суворим SPF 50+. Лікар підбирає протокол з урахуванням вашого способу життя й поїздок.",
          ru: "Да, противовоспалительную терапию и уход проводят круглый год. Ограничения касаются процедур, повышающих фоточувствительность, — их планируют на сезон с меньшей солнечной активностью или компенсируют строгим SPF 50+. Врач подбирает протокол с учётом вашего образа жизни и поездок.",
          en: "Yes — anti-inflammatory therapy and skincare run all year. Restrictions apply to treatments that increase photosensitivity: these are scheduled for a lower-UV season or offset with strict SPF 50+. The physician plans the protocol around your lifestyle and travel.",
        },
      },
    ],
  },
  {
    type: "service",
    slug: "acupulse-co2",
    items: [
      {
        q: {
          uk: "Як підготуватися до лазерної шліфовки AcuPulse CO₂?",
          ru: "Как подготовиться к лазерной шлифовке AcuPulse CO₂?",
          en: "How should I prepare for AcuPulse CO₂ resurfacing?",
        },
        a: {
          uk: "За 2–4 тижні до процедури уникайте активної інсоляції та солярію, скасуйте ретиноїди й кислоти за 5–7 днів. За наявності герпесу в анамнезі лікар призначає противірусну профілактику. Заздалегідь придбайте засоби для загоєння та SPF 50+ — вони знадобляться з першого дня.",
          ru: "За 2–4 недели до процедуры избегайте активной инсоляции и солярия, отмените ретиноиды и кислоты за 5–7 дней. При герпесе в анамнезе врач назначает противовирусную профилактику. Заранее приобретите средства для заживления и SPF 50+ — они понадобятся с первого дня.",
          en: "Avoid sun exposure and solariums for 2–4 weeks beforehand, and stop retinoids and acids 5–7 days prior. If you have a history of herpes, the physician will prescribe antiviral prophylaxis. Buy healing products and SPF 50+ in advance — you will need them from day one.",
        },
      },
      {
        q: {
          uk: "Кому не підходить шліфовка AcuPulse CO₂?",
          ru: "Кому не подходит шлифовка AcuPulse CO₂?",
          en: "Who is not suitable for AcuPulse CO₂ resurfacing?",
        },
        a: {
          uk: "Процедуру не проводять при вагітності та лактації, активних запаленнях і герпесі в зоні обробки, схильності до келоїдів, під час прийому ізотретиноїну та протягом 6 місяців після нього. Обережності потребують темні фототипи та засмагла шкіра. Остаточне рішення лікар ухвалює на консультації.",
          ru: "Процедуру не проводят при беременности и лактации, активных воспалениях и герпесе в зоне обработки, склонности к келоидам, во время приёма изотретиноина и в течение 6 месяцев после него. Осторожности требуют тёмные фототипы и загорелая кожа. Окончательное решение врач принимает на консультации.",
          en: "It is not performed during pregnancy or breastfeeding, with active inflammation or herpes in the treated area, with a tendency to keloids, or while taking isotretinoin and for six months afterwards. Darker phototypes and tanned skin require caution. The physician makes the final decision at the consultation.",
        },
      },
    ],
  },
  {
    type: "service",
    slug: "acupulse-co2-intimate",
    items: [
      {
        q: {
          uk: "Скільки триває сеанс інтимного омолодження AcuPulse CO₂?",
          ru: "Сколько длится сеанс интимного омоложения AcuPulse CO₂?",
          en: "How long does an AcuPulse CO₂ intimate rejuvenation session take?",
        },
        a: {
          uk: "Сама лазерна обробка триває 10–15 хвилин. Разом з оглядом гінеколога, підготовкою та відпочинком після процедури закладайте на візит близько години. Того ж дня можна повертатися до звичних справ.",
          ru: "Сама лазерная обработка занимает 10–15 минут. Вместе с осмотром гинеколога, подготовкой и отдыхом после процедуры закладывайте на визит около часа. В тот же день можно возвращаться к привычным делам.",
          en: "The laser treatment itself takes 10–15 minutes. Allow about an hour for the visit overall, including the gynaecological examination, preparation and a short rest afterwards. You can return to your usual routine the same day.",
        },
      },
      {
        q: {
          uk: "Які обмеження після інтимного лазерного омолодження?",
          ru: "Какие ограничения после интимного лазерного омоложения?",
          en: "What restrictions apply after intimate laser rejuvenation?",
        },
        a: {
          uk: "Протягом 5–7 днів утримайтеся від статевих контактів, басейну, сауни, гарячих ванн і тампонів. Інтенсивні фізичні навантаження краще відкласти на 3–5 днів. Лікар призначить засоби для делікатного догляду на період відновлення.",
          ru: "В течение 5–7 дней воздержитесь от половых контактов, бассейна, сауны, горячих ванн и тампонов. Интенсивные физические нагрузки лучше отложить на 3–5 дней. Врач назначит средства для деликатного ухода на период восстановления.",
          en: "For 5–7 days avoid intercourse, swimming pools, saunas, hot baths and tampons. Postpone intensive exercise for 3–5 days. The physician will prescribe gentle care products for the recovery period.",
        },
      },
      {
        q: {
          uk: "Чи допомагає лазерна терапія при стресовому нетриманні сечі?",
          ru: "Помогает ли лазерная терапия при стрессовом недержании мочи?",
          en: "Does laser therapy help with stress urinary incontinence?",
        },
        a: {
          uk: "При легких формах стресового нетримання лазерна стимуляція колагену в передній стінці піхви покращує підтримку уретри, і пацієнтки відзначають зменшення епізодів. При виражених формах метод не замінює хірургію — потрібна оцінка гінеколога та уролога, які приймають у GENEVITY.",
          ru: "При лёгких формах стрессового недержания лазерная стимуляция коллагена в передней стенке влагалища улучшает поддержку уретры, и пациентки отмечают уменьшение эпизодов. При выраженных формах метод не заменяет хирургию — нужна оценка гинеколога и уролога, которые принимают в GENEVITY.",
          en: "In mild stress incontinence, laser-induced collagen remodelling in the anterior vaginal wall improves urethral support and patients report fewer episodes. In pronounced cases it does not replace surgery — assessment by the GENEVITY gynaecologist and urologist is required.",
        },
      },
    ],
  },
  {
    type: "service",
    slug: "bioimpedance",
    items: [
      {
        q: {
          uk: "Що саме показує аналіз складу тіла на InBody?",
          ru: "Что именно показывает анализ состава тела на InBody?",
          en: "What exactly does an InBody body composition analysis show?",
        },
        a: {
          uk: "Звіт містить масу скелетних м'язів, відсоток і масу жиру, рівень вісцерального жиру, загальну воду організму та її розподіл, а також баланс сегментів — окремо руки, ноги, тулуб. Ці показники дають лікарю відправну точку для програми харчування, тренувань і корекції метаболізму.",
          ru: "Отчёт содержит массу скелетных мышц, процент и массу жира, уровень висцерального жира, общую воду организма и её распределение, а также баланс сегментов — отдельно руки, ноги, туловище. Эти показатели дают врачу отправную точку для программы питания, тренировок и коррекции метаболизма.",
          en: "The report covers skeletal muscle mass, body fat percentage and mass, visceral fat level, total body water and its distribution, plus a segmental balance for arms, legs and trunk. These figures give the physician a baseline for nutrition, training and metabolic correction.",
        },
      },
      {
        q: {
          uk: "Чи болісна процедура біоімпедансометрії?",
          ru: "Болезненна ли процедура биоимпедансометрии?",
          en: "Is bioimpedance analysis painful?",
        },
        a: {
          uk: "Ні. Ви просто стоїте на платформі, тримаючи електроди в руках, — жодних голок і дискомфорту. Через тіло проходить слабкий струм, який не відчувається. Уся процедура займає близько 60 секунд.",
          ru: "Нет. Вы просто стоите на платформе, держа электроды в руках, — никаких игл и дискомфорта. Через тело проходит слабый ток, который не ощущается. Вся процедура занимает около 60 секунд.",
          en: "No. You simply stand on the platform holding the handrails — no needles, no discomfort. A weak current passes through the body and is not felt. The whole measurement takes about 60 seconds.",
        },
      },
      {
        q: {
          uk: "Чи можна пройти InBody окремо, без програми лікування?",
          ru: "Можно ли пройти InBody отдельно, без программы лечения?",
          en: "Can I have an InBody scan on its own, without a treatment programme?",
        },
        a: {
          uk: "Так. Аналіз складу тіла можна пройти як окреме дослідження — наприклад, щоб оцінити стартові показники перед тренуваннями чи зміною харчування. За бажанням лікар розшифрує звіт і підкаже, на що звернути увагу.",
          ru: "Да. Анализ состава тела можно пройти как отдельное исследование — например, чтобы оценить стартовые показатели перед тренировками или сменой питания. По желанию врач расшифрует отчёт и подскажет, на что обратить внимание.",
          en: "Yes. The scan can be done as a stand-alone test — for instance, to establish a baseline before starting training or changing your diet. If you wish, the physician will interpret the report and point out what to focus on.",
        },
      },
      {
        q: {
          uk: "Чому вага не змінюється, а склад тіла — так?",
          ru: "Почему вес не меняется, а состав тела — да?",
          en: "Why does my weight stay the same while my body composition changes?",
        },
        a: {
          uk: "Ваги показують загальну масу, але не її структуру. Під час тренувань і корекції харчування жирова маса зменшується, а м'язова зростає — цифра на вагах при цьому може стояти на місці. Саме тому InBody точніше відображає реальний прогрес.",
          ru: "Весы показывают общую массу, но не её структуру. При тренировках и коррекции питания жировая масса уменьшается, а мышечная растёт — цифра на весах при этом может стоять на месте. Именно поэтому InBody точнее отражает реальный прогресс.",
          en: "Scales show total mass, not its structure. With training and dietary changes fat mass falls while muscle mass rises, so the number on the scales may not move. This is why InBody reflects real progress far more accurately.",
        },
      },
    ],
  },
  {
    type: "service",
    slug: "biorevitalisation",
    items: [
      {
        q: {
          uk: "Чим біоревіталізація відрізняється від мезотерапії?",
          ru: "Чем биоревитализация отличается от мезотерапии?",
          en: "How does biorevitalisation differ from mesotherapy?",
        },
        a: {
          uk: "Біоревіталізація — це введення чистої гіалуронової кислоти високої концентрації для глибокого зволоження й запуску синтезу колагену. Мезотерапія працює коктейлями з вітамінів, амінокислот і мікроелементів і радше живить шкіру. Лікар часто поєднує методики в одному курсі, розводячи їх у часі.",
          ru: "Биоревитализация — это введение чистой гиалуроновой кислоты высокой концентрации для глубокого увлажнения и запуска синтеза коллагена. Мезотерапия работает коктейлями из витаминов, аминокислот и микроэлементов и скорее питает кожу. Врач часто сочетает методики в одном курсе, разводя их во времени.",
          en: "Biorevitalisation delivers pure, high-concentration hyaluronic acid for deep hydration and collagen stimulation. Mesotherapy uses cocktails of vitamins, amino acids and trace elements and is more about nourishing the skin. The physician often combines both within one course, spaced apart.",
        },
      },
      {
        q: {
          uk: "Які зони можна опрацювати біоревіталізацією?",
          ru: "Какие зоны можно проработать биоревитализацией?",
          en: "Which areas can be treated with biorevitalisation?",
        },
        a: {
          uk: "Найчастіше це обличчя, шия, зона декольте та кисті рук — ділянки, де зневоднення помітне найраніше. Окремі протоколи існують для періорбітальної зони та губ. Кількість зон і об'єм препарату лікар визначає на консультації.",
          ru: "Чаще всего это лицо, шея, зона декольте и кисти рук — участки, где обезвоженность заметна раньше всего. Отдельные протоколы существуют для периорбитальной зоны и губ. Количество зон и объём препарата врач определяет на консультации.",
          en: "Most often the face, neck, décolleté and hands — the areas where dehydration shows first. Separate protocols exist for the periorbital zone and the lips. The physician decides on the number of areas and the volume of product at the consultation.",
        },
      },
      {
        q: {
          uk: "Чи болісна процедура біоревіталізації?",
          ru: "Болезненна ли процедура биоревитализации?",
          en: "Is biorevitalisation painful?",
        },
        a: {
          uk: "Відчуття здебільшого терпимі: використовуються тонкі голки, а перед сеансом наноситься аплікаційна анестезія. Багато сучасних препаратів містять лідокаїн у складі. Найчутливіші зони — губи та періорбітальна ділянка, для них анестезія обов'язкова.",
          ru: "Ощущения в основном терпимые: используются тонкие иглы, а перед сеансом наносится аппликационная анестезия. Многие современные препараты содержат лидокаин в составе. Наиболее чувствительные зоны — губы и периорбитальная область, для них анестезия обязательна.",
          en: "Sensations are generally tolerable: fine needles are used and topical anaesthetic is applied beforehand. Many modern products contain lidocaine. The most sensitive areas are the lips and the periorbital zone, where anaesthesia is essential.",
        },
      },
    ],
  },
  {
    type: "service",
    slug: "body",
    items: [
      {
        q: {
          uk: "Чи замінює апаратна корекція тіла спорт і харчування?",
          ru: "Заменяет ли аппаратная коррекция тела спорт и питание?",
          en: "Does body contouring replace exercise and diet?",
        },
        a: {
          uk: "Ні, і ми про це говоримо чесно. Апаратні методики працюють із локальними жировими відкладеннями, тонусом м'язів і якістю шкіри — там, де дефіцит калорій і тренування дають повільний результат. Стабільна вага та регулярна активність зберігають ефект надовго.",
          ru: "Нет, и мы говорим об этом честно. Аппаратные методики работают с локальными жировыми отложениями, тонусом мышц и качеством кожи — там, где дефицит калорий и тренировки дают медленный результат. Стабильный вес и регулярная активность сохраняют эффект надолго.",
          en: "No, and we say so plainly. Device-based methods address localised fat, muscle tone and skin quality — areas where diet and training work slowly. Stable weight and regular activity are what keep the result long term.",
        },
      },
      {
        q: {
          uk: "Як зрозуміти, який апарат потрібен саме мені?",
          ru: "Как понять, какой аппарат нужен именно мне?",
          en: "How do I know which device is right for me?",
        },
        a: {
          uk: "Вибір залежить від запиту: EMSCULPT NEO — коли потрібні м'язи й зменшення жирового прошарку, Ultraformer MPT — коли шкіра втратила щільність, EXION Body — для текстури та локальної корекції. На консультації лікар оцінює стан тканин, за потреби — дані InBody, і складає послідовність процедур.",
          ru: "Выбор зависит от запроса: EMSCULPT NEO — когда нужны мышцы и уменьшение жировой прослойки, Ultraformer MPT — когда кожа потеряла плотность, EXION Body — для текстуры и локальной коррекции. На консультации врач оценивает состояние тканей, при необходимости — данные InBody, и составляет последовательность процедур.",
          en: "It depends on the goal: EMSCULPT NEO when you need muscle and fat reduction, Ultraformer MPT when the skin has lost density, EXION Body for texture and localised correction. At the consultation the physician assesses the tissues, reviews InBody data if needed, and sets the sequence.",
        },
      },
    ],
  },
];

seed(batches);
