/** TZ #12 — laser-hair-removal, part B: arms and back. */
import { EQ, COSMETOLOGISTS, type ServiceSeed } from "./lib";

export const laserB: ServiceSeed[] = [
  // ─── 10. ЛАЗЕРНА ЕПІЛЯЦІЯ РУК ────────────────────────────────────────────
  {
    slug: "laser-arms",
    meta: {
      category: "laser-hair-removal",
      h1: { uk: "Лазерна епіляція рук в Дніпрі", ru: "Лазерная эпиляция рук в Днепре", en: "Arm laser hair removal in Dnipro" },
      seoTitle: {
        uk: "Лазерна епіляція рук в Дніпрі - Лазерна епіляція руки",
        ru: "Лазерная эпиляция рук в Днепре - Лазерная эпиляция волос на руках",
        en: "Arm Laser Hair Removal in Dnipro - Arm laser hair removal price",
      },
      seoDesc: {
        uk: "Лазерна епіляція на руках в Дніпрі 🤍 GENEVITY. Доступні ціни на лазерну епіляцію рук 💫 Ніжна шкіра.",
        ru: "Лазерная эпиляция на руках в Днепре 🤍 GENEVITY. Доступные цены на лазерное удаление волос на руках 💫 Нежная кожа.",
        en: "Laser hair removal on arms in Dnipro 🤍 GENEVITY. Available prices on laser hair removal for arms 💫 Tender skin.",
      },
    },
    title: { uk: "Лазерна епіляція рук", ru: "Лазерная эпиляция рук", en: "Arm Laser Hair Removal" },
    summary: {
      uk: "Лазерна епіляція рук у GENEVITY на Splendor X: передпліччя, плечі та кисті. Руки постійно відкриті сонцю, тому лікар підбирає довжину хвилі під колір шкіри на момент кожного сеансу.",
      ru: "Лазерная эпиляция рук в GENEVITY на Splendor X: предплечья, плечи и кисти. Руки постоянно открыты солнцу, поэтому врач подбирает длину волны под цвет кожи на момент каждого сеанса.",
      en: "Arm laser hair removal at GENEVITY on the Splendor X: forearms, upper arms and hands. Arms are constantly exposed to the sun, so the physician matches the wavelength to your skin tone at each session.",
    },
    procedureLength: { uk: "20-30 хвилин", ru: "20-30 минут", en: "20-30 minutes" },
    effectDuration: { uk: "стійке порідіння після курсу", ru: "стойкое поредение после курса", en: "lasting thinning after a course" },
    sessionsRecommended: { uk: "6-8 процедур курсом", ru: "6-8 процедур курсом", en: "6-8 sessions per course" },
    related: ["laser-underarms", "laser-legs", "laser-women", "splendor-x"],
    doctors: COSMETOLOGISTS,
    equipment: [EQ.SPLENDOR_X],
    sections: [
      {
        type: "richText",
        heading: { uk: "Особливості лазерної епіляції рук", ru: "Особенности лазерной эпиляции рук", en: "What is specific about arm laser hair removal" },
        body: {
          uk: "Лазерна епіляція рук має одну відмінність, яку легко недооцінити: руки цілий рік відкриті сонцю. Навіть узимку шкіра передпліч отримує більше ультрафіолету, ніж, скажімо, шкіра стегон. Через це її фототип фактично змінюється від сезону до сезону, і параметри, безпечні у грудні, можуть бути надто високими у травні.\n\nТому в GENEVITY лікар оцінює колір шкіри перед кожним сеансом, а не лише на першій консультації. На Splendor X можна переходити з александритової довжини хвилі 755 нм на Nd:YAG 1064 нм, який не реагує на пігмент шкіри й безпечно працює на засмаглій.\n\nВолосся на руках теж неоднорідне: на передпліччях воно зазвичай тонше й світліше, на плечах - густіше. Тонке волосся поглинає менше енергії, тому передпліччя часто потребують більше сеансів, ніж плечі.\n\nЗону кистей і пальців обробляють окремо - там шкіра тонка, а волосків небагато, тому робота ведеться малою плямою прицільно.",
          ru: "Лазерная эпиляция рук имеет одно отличие, которое легко недооценить: руки круглый год открыты солнцу. Даже зимой кожа предплечий получает больше ультрафиолета, чем, скажем, кожа бёдер. Из-за этого её фототип фактически меняется от сезона к сезону, и параметры, безопасные в декабре, могут быть слишком высокими в мае.\n\nПоэтому в GENEVITY врач оценивает цвет кожи перед каждым сеансом, а не только на первой консультации. На Splendor X можно переходить с александритовой длины волны 755 нм на Nd:YAG 1064 нм, который не реагирует на пигмент кожи и безопасно работает на загорелой.\n\nВолосы на руках тоже неоднородны: на предплечьях они обычно тоньше и светлее, на плечах - гуще. Тонкие волосы поглощают меньше энергии, поэтому предплечья часто требуют больше сеансов, чем плечи.\n\nЗону кистей и пальцев обрабатывают отдельно - там кожа тонкая, а волосков немного, поэтому работа ведётся малым пятном прицельно.",
          en: "Arm laser hair removal has one feature that is easy to underestimate: the arms are exposed to the sun all year. Even in winter the skin of the forearms receives more ultraviolet than, say, the skin of the thighs. Its effective phototype therefore shifts from season to season, and settings that are safe in December may be too high in May.\n\nAt GENEVITY the physician therefore checks your skin tone before every session, not only at the first consultation. The Splendor X allows switching from the alexandrite wavelength of 755 nm to the Nd:YAG at 1064 nm, which does not react to skin pigment and works safely on tanned skin.\n\nArm hair is uneven too: on the forearms it is usually finer and lighter, on the upper arms denser. Fine hair absorbs less energy, so forearms often need more sessions than upper arms.\n\nThe hands and fingers are treated separately - the skin there is thin and the hairs few, so the physician works precisely with a small spot size.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до лазерної епіляції на руках", ru: "Показания к лазерной эпиляции на руках", en: "Indications for arm laser hair removal" },
        indications: [
          { uk: "Темне волосся на передпліччях, помітне при денному світлі", ru: "Тёмные волосы на предплечьях, заметные при дневном свете", en: "Dark forearm hair that shows up in daylight" },
          { uk: "Густе волосся на плечах у чоловіків і жінок", ru: "Густые волосы на плечах у мужчин и женщин", en: "Dense hair on the upper arms in both men and women" },
          { uk: "Волосся на кистях і фалангах пальців", ru: "Волосы на кистях и фалангах пальцев", en: "Hair on the backs of the hands and finger joints" },
          { uk: "Подразнення після гоління або воску", ru: "Раздражение после бритья или воска", en: "Irritation following shaving or waxing" },
          { uk: "Бажання позбутися регулярного догляду перед сезоном коротких рукавів", ru: "Желание избавиться от регулярного ухода перед сезоном коротких рукавов", en: "Wanting to stop the upkeep before the short-sleeve season" },
          { uk: "Скорочення густоти без повного видалення - частий чоловічий запит", ru: "Сокращение густоты без полного удаления - частый мужской запрос", en: "Thinning rather than full removal, a common request from men" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Свіжа засмага - процедуру відкладають на 2-3 тижні", ru: "Свежий загар - процедуру откладывают на 2-3 недели", en: "A fresh tan - treatment is postponed for two to three weeks" },
          { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Пігментні новоутворення в зоні впливу - лікар обходить їх", ru: "Пигментные новообразования в зоне воздействия - врач обходит их", en: "Pigmented lesions in the treatment area, which the physician works around" },
          { uk: "Прийом фотосенсибілізувальних препаратів", ru: "Приём фотосенсибилизирующих препаратов", en: "Photosensitising medication" },
          { uk: "Пошкодження шкіри, опіки, свіжі рубці", ru: "Повреждения кожи, ожоги, свежие рубцы", en: "Broken skin, burns or fresh scars" },
          { uk: "Онкологічні захворювання в активній фазі", ru: "Онкологические заболевания в активной фазе", en: "Active oncological disease" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить сеанс епіляції рук", ru: "Как проходит сеанс эпиляции рук", en: "How an arm session works" },
        steps: [
          { title: { uk: "Оцінка кольору шкіри", ru: "Оценка цвета кожи", en: "Assessing skin tone" }, description: { uk: "Перед кожним сеансом лікар перевіряє, чи не з'явилася засмага, і за потреби змінює довжину хвилі та параметри.", ru: "Перед каждым сеансом врач проверяет, не появился ли загар, и при необходимости меняет длину волны и параметры.", en: "Before each session the physician checks for any tan and adjusts the wavelength and settings if needed." } },
          { title: { uk: "Підготовка зони", ru: "Подготовка зоны", en: "Preparing the area" }, description: { uk: "Руки очищують, знімають прикраси. Волосся має бути поголене за добу до сеансу.", ru: "Руки очищают, снимают украшения. Волосы должны быть побриты за сутки до сеанса.", en: "The arms are cleansed and jewellery removed. The hair should have been shaved the day before." } },
          { title: { uk: "Обробка передпліч і плечей", ru: "Обработка предплечий и плеч", en: "Treating forearms and upper arms" }, description: { uk: "Лікар проходить зони послідовно, змінюючи параметри для тоншого волосся передпліч і густішого на плечах.", ru: "Врач проходит зоны последовательно, меняя параметры для более тонких волос предплечий и более густых на плечах.", en: "The physician works through the zones in turn, changing settings for the finer forearm hair and the denser hair on the upper arms." } },
          { title: { uk: "Охолодження та SPF", ru: "Охлаждение и SPF", en: "Cooling and SPF" }, description: { uk: "Наносять заспокійливий гель і сонцезахисний засіб - руки одразу після сеансу опиняються на сонці.", ru: "Наносят успокаивающий гель и солнцезащитное средство - руки сразу после сеанса оказываются на солнце.", en: "A soothing gel and sunscreen are applied, since the arms are exposed to the sun straight after the session." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Переваги лазерного видалення волосся на руках", ru: "Преимущества лазерного удаления волос на руках", en: "Advantages of laser hair removal on the arms" },
        items: [
          { uk: "Рівна шкіра без щоденного гоління та воску", ru: "Ровная кожа без ежедневного бритья и воска", en: "Smooth skin without daily shaving or waxing" },
          { uk: "Зона обробляється швидко попри велику площу", ru: "Зона обрабатывается быстро несмотря на большую площадь", en: "The area is treated quickly despite its size" },
          { uk: "Дві довжини хвилі - можна працювати й на засмаглій шкірі", ru: "Две длины волны - можно работать и на загорелой коже", en: "Two wavelengths, so even tanned skin can be treated" },
          { uk: "Можна прибрати волосся лише частково, залишивши природну густоту", ru: "Можно убрать волосы лишь частично, оставив естественную густоту", en: "Hair can be thinned rather than removed, keeping a natural density" },
          { uk: "Зникає подразнення на згинах ліктів", ru: "Исчезает раздражение на сгибах локтей", en: "Irritation at the elbow creases disappears" },
          { uk: "Зручно поєднувати з зоною пахв в один візит", ru: "Удобно совмещать с зоной подмышек в один визит", en: "Easy to combine with the underarms in one visit" },
        ],
      },
      {
        type: "richText",
        heading: { uk: "Сонце, сезонність і догляд за руками", ru: "Солнце, сезонность и уход за руками", en: "Sun, seasons and caring for your arms" },
        body: {
          uk: "Головна складність курсу для рук - сонце. Свіжа засмага підвищує ризик опіку та пігментації, тому влітку доводиться або переходити на Nd:YAG, або витримувати паузу після пляжу.\n\nОптимально починати курс восени: до літа встигнете пройти основні 6-8 сеансів, і в сезон коротких рукавів залишиться тільки підтримка. Але це не жорстке правило - при коректному підборі параметрів руки обробляють цілий рік.\n\n**Догляд протягом курсу:**\n- SPF 50 на відкриті ділянки рук щодня, повторне нанесення кожні 2-3 години на сонці;\n- 2 дні після сеансу без сауни, басейну й тривалого перебування на сонці;\n- зволожувальний крем щодня - суха шкіра гірше переносить процедуру;\n- між сеансами голити, але не виривати волосся.\n\nЩодо результату: передпліччя часто потребують більше сеансів, ніж очікують пацієнти, - там волосся тонше й світліше. Це не означає, що метод не працює, просто відповідь приходить повільніше. Лікар прогнозує реальну кількість процедур після третього сеансу, коли видно динаміку.",
          ru: "Главная сложность курса для рук - солнце. Свежий загар повышает риск ожога и пигментации, поэтому летом приходится либо переходить на Nd:YAG, либо выдерживать паузу после пляжа.\n\nОптимально начинать курс осенью: до лета успеете пройти основные 6-8 сеансов, и в сезон коротких рукавов останется только поддержка. Но это не жёсткое правило - при корректном подборе параметров руки обрабатывают круглый год.\n\n**Уход в течение курса:**\n- SPF 50 на открытые участки рук ежедневно, повторное нанесение каждые 2-3 часа на солнце;\n- 2 дня после сеанса без сауны, бассейна и длительного пребывания на солнце;\n- увлажняющий крем ежедневно - сухая кожа хуже переносит процедуру;\n- между сеансами брить, но не выдёргивать волосы.\n\nОтносительно результата: предплечья часто требуют больше сеансов, чем ожидают пациенты, - там волосы тоньше и светлее. Это не значит, что метод не работает, просто ответ приходит медленнее. Врач прогнозирует реальное количество процедур после третьего сеанса, когда видна динамика.",
          en: "The main difficulty with an arm course is the sun. A fresh tan raises the risk of burns and pigmentation, so in summer you either switch to the Nd:YAG wavelength or allow a pause after time at the beach.\n\nStarting in autumn works best: you can complete the main 6-8 sessions before summer and only need maintenance once short sleeves come out. It is not a hard rule, though - with correctly chosen settings the arms can be treated all year.\n\n**Care during the course:**\n- SPF 50 on exposed areas every day, reapplied every 2-3 hours in the sun;\n- no sauna, swimming pool or prolonged sun for two days after each session;\n- daily moisturiser, since dry skin tolerates the treatment less well;\n- shave between sessions, never pluck.\n\nOn results: forearms often need more sessions than patients expect, because the hair there is finer and lighter. That does not mean the method is failing - the response simply takes longer. The physician can predict the realistic number of sessions after the third one, when the trend is visible.",
        },
      },
    ],
    faqs: [
      { question: { uk: "Скільки сеансів потрібно для рук?", ru: "Сколько сеансов нужно для рук?", en: "How many sessions do the arms need?" },
        answer: { uk: "У середньому 6-8 процедур з інтервалом 4-6 тижнів. Плечі зазвичай відповідають швидше через густіше й темніше волосся, передпліччя можуть потребувати 1-2 додаткових сеанси. Точний прогноз лікар дає після третьої процедури, коли видно, як реагує саме ваше волосся.", ru: "В среднем 6-8 процедур с интервалом 4-6 недель. Плечи обычно отвечают быстрее из-за более густых и тёмных волос, предплечья могут потребовать 1-2 дополнительных сеанса. Точный прогноз врач даёт после третьей процедуры, когда видно, как реагируют именно ваши волосы.", en: "Six to eight sessions on average, four to six weeks apart. Upper arms usually respond faster because the hair is denser and darker; forearms may need one or two extra sessions. The physician gives a firm forecast after the third session, once your own response is visible." } },
      { question: { uk: "Чи можна робити епіляцію рук улітку?", ru: "Можно ли делать эпиляцию рук летом?", en: "Can arms be treated in summer?" },
        answer: { uk: "Так, але з умовами. Якщо на руках свіжа засмага, лікар або відкладе сеанс на 2-3 тижні, або перейде на Nd:YAG 1064 нм, який безпечний для засмаглої шкіри. Після процедури обов'язковий SPF 50 і мінімум прямого сонця протягом 2 днів.", ru: "Да, но с условиями. Если на руках свежий загар, врач либо отложит сеанс на 2-3 недели, либо перейдёт на Nd:YAG 1064 нм, безопасный для загорелой кожи. После процедуры обязателен SPF 50 и минимум прямого солнца в течение 2 дней.", en: "Yes, with conditions. If your arms are freshly tanned the physician will either postpone for two to three weeks or switch to the Nd:YAG at 1064 nm, which is safe on tanned skin. SPF 50 afterwards is essential, along with minimal direct sun for two days." } },
      { question: { uk: "Чи можна прибрати волосся не повністю, а лише проріділи?", ru: "Можно ли убрать волосы не полностью, а только проредить?", en: "Can the hair just be thinned rather than removed?" },
        answer: { uk: "Так. Це частий запит у чоловіків: зменшити густоту, зберігши природний вигляд. Лікар обмежує кількість сеансів і працює на м'якших параметрах - у результаті волосся стає тоншим і рідшим, але не зникає. Домовитися про це варто на консультації, до початку курсу.", ru: "Да. Это частый запрос у мужчин: уменьшить густоту, сохранив естественный вид. Врач ограничивает количество сеансов и работает на более мягких параметрах - в результате волосы становятся тоньше и реже, но не исчезают. Договориться об этом стоит на консультации, до начала курса.", en: "Yes. It is a common request from men: reduce the density while keeping a natural look. The physician limits the number of sessions and uses gentler settings, so the hair becomes finer and sparser without disappearing. Agree this at the consultation, before the course begins." } },
      { question: { uk: "Чи включені кисті рук у зону?", ru: "Включены ли кисти рук в зону?", en: "Are the hands included in the zone?" },
        answer: { uk: "Зазвичай кисті й пальці рахуються окремою невеликою зоною. Волосків там небагато, тому обробка займає кілька хвилин, і її часто додають до основного сеансу без істотного подорожчання. Уточніть це в адміністратора під час запису.", ru: "Обычно кисти и пальцы считаются отдельной небольшой зоной. Волосков там немного, поэтому обработка занимает несколько минут, и её часто добавляют к основному сеансу без существенного удорожания. Уточните это у администратора при записи.", en: "The hands and fingers are usually counted as a separate small zone. There are few hairs, so treating them takes a few minutes and is often added to the main session for little extra. Check with the administrator when you book." } },
      { question: { uk: "Чи не залишиться межа між обробленою та необробленою ділянкою?", ru: "Не останется ли граница между обработанным и необработанным участком?", en: "Will there be a visible line between treated and untreated skin?" },
        answer: { uk: "Різка межа може з'явитися, якщо обробляти лише передпліччя й залишати плечі. Тому лікар зазвичай радить брати руки повністю або робити плавний перехід, знижуючи щільність проходу біля межі зони. Це обговорюють на консультації до початку курсу.", ru: "Резкая граница может появиться, если обрабатывать только предплечья и оставлять плечи. Поэтому врач обычно советует брать руки полностью или делать плавный переход, снижая плотность прохода у границы зоны. Это обсуждают на консультации до начала курса.", en: "A sharp line can appear if only the forearms are treated and the upper arms left. The physician therefore usually suggests treating the whole arm, or creating a gradient by reducing pass density near the boundary. This is discussed at the consultation before the course starts." } },
      { question: { uk: "Чи впливає лазер на родимки на руках?", ru: "Влияет ли лазер на родинки на руках?", en: "Does the laser affect moles on the arms?" },
        answer: { uk: "Родимки та пігментні новоутворення лазером не обробляють - лікар обходить їх або закриває під час сеансу. Якщо на руках багато невусів, перед курсом варто пройти дерматоскопію. У GENEVITY огляд шкіри перед першою процедурою входить у консультацію.", ru: "Родинки и пигментные новообразования лазером не обрабатывают - врач обходит их или закрывает во время сеанса. Если на руках много невусов, перед курсом стоит пройти дерматоскопию. В GENEVITY осмотр кожи перед первой процедурой входит в консультацию.", en: "Moles and pigmented lesions are never treated with the laser - the physician works around them or covers them during the session. If you have many naevi on your arms, have dermatoscopy before the course. At GENEVITY a skin examination before the first session is part of the consultation." } },
      { question: { uk: "Скільки коштує лазерна епіляція рук у Дніпрі?", ru: "Сколько стоит лазерная эпиляция рук в Днепре?", en: "How much does arm laser hair removal cost in Dnipro?" },
        answer: { uk: "Ціна залежить від того, які саме ділянки береться: передпліччя, руки повністю чи разом із кистями. Актуальні ціни є в розділі «Ціни» на сайті, адміністратор озвучить їх під час запису. При оформленні курсу умови вигідніші.", ru: "Цена зависит от того, какие именно участки берутся: предплечья, руки полностью или вместе с кистями. Актуальные цены есть в разделе «Цены» на сайте, администратор озвучит их при записи. При оформлении курса условия выгоднее.", en: "The price depends on which areas you treat: forearms, the full arm, or the arms together with the hands. Current prices are in the Prices section and the administrator will quote them when you book. Booking a course comes with better terms." } },
    ],
  },

  // ─── 11. ЛАЗЕРНА ЕПІЛЯЦІЯ СПИНИ ──────────────────────────────────────────
  {
    slug: "laser-back",
    meta: {
      category: "laser-hair-removal",
      h1: { uk: "Лазерна епіляція спини в Дніпрі", ru: "Лазерная эпиляция спины в Днепре", en: "Back laser hair removal in Dnipro" },
      seoTitle: {
        uk: "Лазерна епіляція спини в Дніпрі - Лазерна епіляція на спині",
        ru: "Лазерная эпиляция спины в Днепре - Лазерная эпиляция спина",
        en: "Back Laser Hair Removal in Dnipro - Back laser hair removal price",
      },
      seoDesc: {
        uk: "Лазерна епіляція поясниці в Дніпрі 🤍 GENEVITY. Доступні ціни на лазерну епіляцію спини 💫 Бездоганний результат.",
        ru: "Лазерная эпиляция поясницы в Днепре 🤍 GENEVITY. Доступные цены на лазерную эпиляцию спины 💫 Безупречный результат.",
        en: "Laser hair removal for lower back in Dnipro 🤍 GENEVITY. Available prices on laser hair removal back 💫 Flawless result.",
      },
    },
    title: { uk: "Лазерна епіляція спини", ru: "Лазерная эпиляция спины", en: "Back Laser Hair Removal" },
    summary: {
      uk: "Лазерна епіляція спини у GENEVITY на Splendor X: верх спини, поперек і лопатки. Зона, до якої важко дотягнутися самостійно, - лазер знімає щоденну проблему разом із вростанням і фолікулітом.",
      ru: "Лазерная эпиляция спины в GENEVITY на Splendor X: верх спины, поясница и лопатки. Зона, до которой трудно дотянуться самостоятельно, - лазер снимает ежедневную проблему вместе с врастанием и фолликулитом.",
      en: "Back laser hair removal at GENEVITY on the Splendor X: upper back, lower back and shoulder blades. An area that is hard to reach yourself - the laser removes the daily problem along with ingrown hairs and folliculitis.",
    },
    procedureLength: { uk: "25-40 хвилин", ru: "25-40 минут", en: "25-40 minutes" },
    effectDuration: { uk: "до 90% менше волосся після курсу", ru: "до 90% меньше волос после курса", en: "up to 90% less hair after a course" },
    sessionsRecommended: { uk: "6-10 процедур курсом", ru: "6-10 процедур курсом", en: "6-10 sessions per course" },
    related: ["laser-abdomen", "laser-men", "laser-arms", "splendor-x"],
    doctors: COSMETOLOGISTS,
    equipment: [EQ.SPLENDOR_X],
    sections: [
      {
        type: "richText",
        heading: { uk: "Чому спину складно доглядати без лазера", ru: "Почему спину сложно ухаживать без лазера", en: "Why the back is hard to manage without a laser" },
        body: {
          uk: "Спина - зона, яку фізично складно обробити самостійно. Дотягнутися бритвою до лопаток неможливо, віск потребує сторонньої допомоги, а крем-депілятор на великій площі часто дає подразнення. Через це багато чоловіків просто миряться з волоссям на спині, хоча запит на його видалення дуже поширений.\n\nДругий чинник - механіка. Спина постійно контактує з одягом, спинкою крісла, спортивним інвентарем. Поголене волосся відростає з гострим кінчиком, чіпляється за тканину й вростає, а щільні фолікули на тлі активних сальних залоз дають фолікуліт і запальні елементи.\n\nЛазерна епіляція знімає обидві проблеми одразу. Splendor X має великий розмір плями й високу частоту імпульсів, тому суцільна обробка спини займає 25-40 хвилин - зіставно з тим, скільки часу йде на воскову депіляцію значно меншої зони.\n\nВолосся на спині зазвичай жорстке й темне, тому реагує на лазер добре. Складність в іншому: спина велика, а зростання волосся тут нерівномірне, тому курс частіше довший - до 10 сеансів.",
          ru: "Спина - зона, которую физически сложно обработать самостоятельно. Дотянуться бритвой до лопаток невозможно, воск требует посторонней помощи, а крем-депилятор на большой площади часто даёт раздражение. Из-за этого многие мужчины просто мирятся с волосами на спине, хотя запрос на их удаление очень распространён.\n\nВторой фактор - механика. Спина постоянно контактирует с одеждой, спинкой кресла, спортивным инвентарём. Побритые волосы отрастают с острым кончиком, цепляются за ткань и врастают, а плотные фолликулы на фоне активных сальных желёз дают фолликулит и воспалительные элементы.\n\nЛазерная эпиляция снимает обе проблемы сразу. Splendor X имеет большой размер пятна и высокую частоту импульсов, поэтому сплошная обработка спины занимает 25-40 минут - сопоставимо с тем, сколько времени уходит на восковую депиляцию значительно меньшей зоны.\n\nВолосы на спине обычно жёсткие и тёмные, поэтому реагируют на лазер хорошо. Сложность в другом: спина большая, а рост волос здесь неравномерный, поэтому курс чаще длиннее - до 10 сеансов.",
          en: "The back is an area that is physically hard to manage yourself. You cannot reach the shoulder blades with a razor, waxing needs another pair of hands, and depilatory creams over a large area often cause irritation. Many men simply put up with back hair, even though the wish to remove it is very common.\n\nThe second factor is mechanical. The back is in constant contact with clothing, chair backs and gym equipment. Shaved hair grows back with a sharp tip, catches on fabric and grows inward, while dense follicles combined with active sebaceous glands produce folliculitis and inflamed spots.\n\nLaser hair removal solves both at once. The Splendor X has a large spot size and a high pulse rate, so treating the whole back takes 25-40 minutes - comparable to waxing a far smaller area.\n\nBack hair is usually coarse and dark, so it responds well to the laser. The difficulty lies elsewhere: the back is large and growth across it is uneven, so the course is often longer, up to ten sessions.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання до лазерної епіляції на спині", ru: "Показания к лазерной эпиляции на спине", en: "Indications for back laser hair removal" },
        indications: [
          { uk: "Густе темне волосся на плечах, лопатках і попереку", ru: "Густые тёмные волосы на плечах, лопатках и пояснице", en: "Dense dark hair on the shoulders, shoulder blades and lower back" },
          { uk: "Вростання волосся та фолікуліт", ru: "Врастание волос и фолликулит", en: "Ingrown hairs and folliculitis" },
          { uk: "Неможливість доглядати зону самостійно", ru: "Невозможность ухаживать за зоной самостоятельно", en: "Being unable to manage the area yourself" },
          { uk: "Спортивні дисципліни, де потрібна гладка шкіра", ru: "Спортивные дисциплины, где нужна гладкая кожа", en: "Sports that call for smooth skin" },
          { uk: "Волосся, що переходить із шиї на спину", ru: "Волосы, переходящие с шеи на спину", en: "Hair running from the neck down onto the back" },
          { uk: "Скорочення густоти без повного видалення", ru: "Сокращение густоты без полного удаления", en: "Reducing density rather than full removal" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Свіжа засмага на спині", ru: "Свежий загар на спине", en: "A fresh tan on the back" },
          { uk: "Активне запалення, гнійничкові висипання, акне спини в загостренні", ru: "Активное воспаление, гнойничковые высыпания, акне спины в обострении", en: "Active inflammation, pustular lesions or a flare of back acne" },
          { uk: "Велика кількість родимок у зоні - потрібна дерматоскопія", ru: "Большое количество родинок в зоне - нужна дерматоскопия", en: "Numerous moles in the area, which require dermatoscopy first" },
          { uk: "Прийом ізотретиноїну протягом останніх 6 місяців", ru: "Приём изотретиноина в последние 6 месяцев", en: "Isotretinoin use within the past six months" },
          { uk: "Онкологічні захворювання в активній фазі", ru: "Онкологические заболевания в активной фазе", en: "Active oncological disease" },
          { uk: "Свіжі татуювання - лікар обходить зону", ru: "Свежие татуировки - врач обходит зону", en: "Fresh tattoos, which the physician works around" },
        ],
      },
      {
        type: "steps",
        heading: { uk: "Як проходить сеанс епіляції спини", ru: "Как проходит сеанс эпиляции спины", en: "How a back session works" },
        steps: [
          { title: { uk: "Огляд шкіри та дерматоскопія", ru: "Осмотр кожи и дерматоскопия", en: "Skin check and dermatoscopy" }, description: { uk: "Лікар оглядає родимки, оцінює стан шкіри та наявність запальних елементів - при активному акне сеанс відкладають.", ru: "Врач осматривает родинки, оценивает состояние кожи и наличие воспалительных элементов - при активном акне сеанс откладывают.", en: "The physician examines moles and assesses the skin for inflammation; with active acne the session is postponed." } },
          { title: { uk: "Підготовка та розмітка", ru: "Подготовка и разметка", en: "Preparation and mapping" }, description: { uk: "Спину очищують, окреслюють межі зони - особливо перехід із шиї та боків, щоб не залишити різкої лінії.", ru: "Спину очищают, очерчивают границы зоны - особенно переход с шеи и боков, чтобы не оставить резкой линии.", en: "The back is cleansed and the zone borders outlined, especially the transition from the neck and sides, so no sharp line is left." } },
          { title: { uk: "Суцільна обробка", ru: "Сплошная обработка", en: "Full-area pass" }, description: { uk: "Лікар проходить зону великою плямою. Родимки закриває, ділянки з різною густотою обробляє на різних параметрах.", ru: "Врач проходит зону большим пятном. Родинки закрывает, участки с разной густотой обрабатывает на разных параметрах.", en: "The physician works across the area with a large spot, covering moles and adjusting settings for regions of different hair density." } },
          { title: { uk: "Охолодження та рекомендації", ru: "Охлаждение и рекомендации", en: "Cooling and instructions" }, description: { uk: "Наносять заспокійливий гель. Лікар нагадує про вільний одяг і паузу в тренуваннях на 2 дні.", ru: "Наносят успокаивающий гель. Врач напоминает о свободной одежде и паузе в тренировках на 2 дня.", en: "A soothing gel is applied. The physician reminds you to wear loose clothing and to pause training for two days." } },
        ],
      },
      {
        type: "bullets",
        heading: { uk: "Що дає лазерна епіляція спини", ru: "Что даёт лазерная эпиляция спины", en: "What back laser hair removal delivers" },
        items: [
          { uk: "Вирішує зону, яку неможливо доглядати самостійно", ru: "Решает зону, которую невозможно обслуживать самостоятельно", en: "Solves an area you cannot manage on your own" },
          { uk: "Прибирає вростання волосся й фолікуліт", ru: "Убирает врастание волос и фолликулит", en: "Clears ingrown hairs and folliculitis" },
          { uk: "Уся спина обробляється за 25-40 хвилин", ru: "Вся спина обрабатывается за 25-40 минут", en: "The whole back is treated in 25-40 minutes" },
          { uk: "Шкіра перестає подразнюватися від одягу та спорядження", ru: "Кожа перестаёт раздражаться от одежды и снаряжения", en: "The skin stops being irritated by clothing and equipment" },
          { uk: "Можна прибрати волосся частково, залишивши природний вигляд", ru: "Можно убрать волосы частично, оставив естественный вид", en: "Hair can be reduced partially, keeping a natural look" },
          { uk: "Обов'язковий огляд родимок перед кожним курсом", ru: "Обязательный осмотр родинок перед каждым курсом", en: "A mandatory mole check before every course" },
        ],
      },
      {
        type: "richText",
        heading: { uk: "Курс, догляд і поєднання з лікуванням акне спини", ru: "Курс, уход и сочетание с лечением акне спины", en: "The course, aftercare and combining with back acne treatment" },
        body: {
          uk: "Спина потребує довшого курсу, ніж більшість зон: у середньому 6-10 сеансів з інтервалом 5-6 тижнів. Причина в площі та в тому, що фолікули тут перебувають у різних фазах росту нерівномірно - верх спини часто відповідає швидше за поперек.\n\nПерше порідіння видно після 2-3 процедури. Разом із волоссям зазвичай зникають вростання й дрібні запальні елементи - шкіра перестає травмуватися.\n\n**Догляд після сеансу:**\n- 48 годин без сауни, басейну, гарячого душу й тренувань - піт і тертя подразнюють оброблену шкіру;\n- вільний одяг із бавовни перші 2-3 дні;\n- SPF 50, якщо спина буде відкрита сонцю;\n- не використовувати скраби протягом тижня.\n\nОкремо про акне спини. Якщо в зоні є активні запальні елементи, лазерну епіляцію відкладають до стихання загострення - інакше зростає ризик поширення запалення. У GENEVITY у такому разі спершу проводять курс фототерапії акне на M22, а вже потім переходять до епіляції. Це довший шлях, але безпечніший і результативніший.",
          ru: "Спина требует более длинного курса, чем большинство зон: в среднем 6-10 сеансов с интервалом 5-6 недель. Причина в площади и в том, что фолликулы здесь находятся в разных фазах роста неравномерно - верх спины часто отвечает быстрее поясницы.\n\nПервое поредение видно после 2-3 процедуры. Вместе с волосами обычно исчезают врастания и мелкие воспалительные элементы - кожа перестаёт травмироваться.\n\n**Уход после сеанса:**\n- 48 часов без сауны, бассейна, горячего душа и тренировок - пот и трение раздражают обработанную кожу;\n- свободная одежда из хлопка первые 2-3 дня;\n- SPF 50, если спина будет открыта солнцу;\n- не использовать скрабы в течение недели.\n\nОтдельно об акне спины. Если в зоне есть активные воспалительные элементы, лазерную эпиляцию откладывают до стихания обострения - иначе растёт риск распространения воспаления. В GENEVITY в таком случае сначала проводят курс фототерапии акне на M22, а уже потом переходят к эпиляции. Это более длинный путь, но безопаснее и результативнее.",
          en: "The back needs a longer course than most zones: 6-10 sessions on average, five to six weeks apart. This is down to the size of the area and to the uneven distribution of growth phases across it - the upper back often responds faster than the lower back.\n\nThe first thinning shows after two or three sessions. Ingrown hairs and small inflamed spots usually clear at the same time, as the skin stops being traumatised.\n\n**Aftercare:**\n- 48 hours without sauna, pool, hot showers or training - sweat and friction irritate treated skin;\n- loose cotton clothing for the first two or three days;\n- SPF 50 if the back will be exposed to the sun;\n- no scrubs for a week.\n\nA note on back acne. If active inflammatory lesions are present, laser hair removal is postponed until the flare settles, otherwise the inflammation may spread. At GENEVITY we then run a course of M22 acne phototherapy first and move on to hair removal afterwards. It is a longer route, but a safer and more effective one.",
        },
      },
    ],
    faqs: [
      { question: { uk: "Скільки сеансів потрібно для спини?", ru: "Сколько сеансов нужно для спины?", en: "How many sessions does the back need?" },
        answer: { uk: "У середньому 6-10 процедур з інтервалом 5-6 тижнів - більше, ніж для компактних зон. Спина велика, і фолікули в різних її частинах перебувають у різних фазах росту. Верх спини зазвичай відповідає швидше, поперек - повільніше.", ru: "В среднем 6-10 процедур с интервалом 5-6 недель - больше, чем для компактных зон. Спина большая, и фолликулы в разных её частях находятся в разных фазах роста. Верх спины обычно отвечает быстрее, поясница - медленнее.", en: "Six to ten sessions on average, five to six weeks apart - more than for compact areas. The back is large and follicles in different parts of it are in different growth phases. The upper back usually responds faster, the lower back more slowly." } },
      { question: { uk: "Чи можна робити епіляцію спини при акне?", ru: "Можно ли делать эпиляцию спины при акне?", en: "Can the back be treated if I have acne there?" },
        answer: { uk: "При активному запаленні - ні, сеанс відкладають. Спочатку лікар знімає загострення: часто це курс фототерапії акне на M22, іноді - медикаментозне лікування. Коли запалення стихне, до епіляції повертаються, і вона додатково зменшує вростання волосся, яке підтримувало запальні елементи.", ru: "При активном воспалении - нет, сеанс откладывают. Сначала врач снимает обострение: часто это курс фототерапии акне на M22, иногда - медикаментозное лечение. Когда воспаление стихнет, к эпиляции возвращаются, и она дополнительно уменьшает врастание волос, которое поддерживало воспалительные элементы.", en: "Not while the inflammation is active - the session is postponed. The physician first settles the flare, often with a course of M22 acne phototherapy and sometimes with medication. Once it has calmed, hair removal resumes, and it further reduces the ingrown hairs that were feeding the inflammation." } },
      { question: { uk: "Чи боляче робити лазерну епіляцію на спині?", ru: "Больно ли делать лазерную эпиляцию на спине?", en: "Is back laser hair removal painful?" },
        answer: { uk: "Спина переноситься легше за пахви й бікіні: шкіра тут товща й менш чутлива. Найвиразніші відчуття - вздовж хребта та над лопатками, де кістка близько до поверхні. Контактне охолодження манипули знімає більшу частину дискомфорту, анестезія зазвичай не потрібна.", ru: "Спина переносится легче подмышек и бикини: кожа здесь толще и менее чувствительна. Самые выраженные ощущения - вдоль позвоночника и над лопатками, где кость близко к поверхности. Контактное охлаждение манипулы снимает большую часть дискомфорта, анестезия обычно не нужна.", en: "The back is easier to tolerate than the underarms or bikini line, as the skin is thicker and less sensitive. The strongest sensation is along the spine and over the shoulder blades, where bone sits close to the surface. The handpiece's contact cooling removes most of the discomfort and anaesthesia is not usually needed." } },
      { question: { uk: "Що робити з родимками на спині?", ru: "Что делать с родинками на спине?", en: "What about moles on the back?" },
        answer: { uk: "Лікар обов'язково оглядає їх перед курсом і закриває під час обробки - лазером по родимках не працюють. Якщо невусів багато або якийсь із них виглядає нетипово, ми рекомендуємо повноцінну дерматоскопію до початку курсу. Це стандартна практика, а не додаткова обережність.", ru: "Врач обязательно осматривает их перед курсом и закрывает во время обработки - лазером по родинкам не работают. Если невусов много или какой-то из них выглядит нетипично, мы рекомендуем полноценную дерматоскопию до начала курса. Это стандартная практика, а не дополнительная осторожность.", en: "The physician always examines them before the course and covers them during treatment - the laser is never used over moles. If there are many naevi, or one looks atypical, we recommend full dermatoscopy before starting. That is standard practice, not extra caution." } },
      { question: { uk: "Чи можна прибрати волосся лише на плечах?", ru: "Можно ли убрать волосы только на плечах?", en: "Can I treat just the shoulders?" },
        answer: { uk: "Так, зону можна розділити: верх спини з плечима, поперек або спина повністю. Але варто врахувати перехід - різка межа між обробленою й необробленою ділянкою помітна. Лікар зробить плавний градієнт, знизивши щільність проходу біля межі.", ru: "Да, зону можно разделить: верх спины с плечами, поясница или спина полностью. Но стоит учесть переход - резкая граница между обработанным и необработанным участком заметна. Врач сделает плавный градиент, снизив плотность прохода у границы.", en: "Yes, the area can be split: upper back with shoulders, lower back, or the whole back. Bear the transition in mind, though - a sharp line between treated and untreated skin is noticeable. The physician will blend it by reducing pass density near the border." } },
      { question: { uk: "Чи потрібна допомога, щоб голити спину перед сеансом?", ru: "Нужна ли помощь, чтобы побрить спину перед сеансом?", en: "Do I need help shaving my back before a session?" },
        answer: { uk: "Волосся має бути завдовжки 1-2 мм. Якщо самостійно підготувати зону не вийшло, скажіть про це під час запису - адміністратор передбачить час, і лікар добриє зону перед процедурою. Це звична ситуація, окремо домовлятися незручно не потрібно.", ru: "Волосы должны быть длиной 1-2 мм. Если самостоятельно подготовить зону не получилось, скажите об этом при записи - администратор предусмотрит время, и врач добреет зону перед процедурой. Это привычная ситуация, отдельно договариваться неловко не нужно.", en: "The hair should be 1-2 mm long. If you cannot prepare the area yourself, say so when booking - the administrator will allow extra time and the physician will trim it before the session. It is a routine situation, so there is no need to feel awkward about asking." } },
      { question: { uk: "Скільки коштує лазерна епіляція спини в Дніпрі?", ru: "Сколько стоит лазерная эпиляция спины в Днепре?", en: "How much does back laser hair removal cost in Dnipro?" },
        answer: { uk: "Вартість залежить від того, береться спина повністю чи окрема ділянка - верх, поперек, плечі. Актуальні ціни є в розділі «Ціни» на сайті, адміністратор назве їх під час запису. Спину часто беруть у комплексі з плечима та шиєю - у такому разі умови вигідніші.", ru: "Стоимость зависит от того, берётся спина полностью или отдельный участок - верх, поясница, плечи. Актуальные цены есть в разделе «Цены» на сайте, администратор назовёт их при записи. Спину часто берут в комплексе с плечами и шеей - в таком случае условия выгоднее.", en: "The price depends on whether you treat the whole back or a single section - upper back, lower back or shoulders. Current prices are in the Prices section and the administrator will quote them when you book. The back is often combined with the shoulders and neck, which comes with better terms." } },
    ],
  },
];
