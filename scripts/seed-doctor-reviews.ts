/**
 * Seed multilingual patient reviews for each doctor.
 * Run: npx tsx scripts/seed-doctor-reviews.ts
 */
import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = neon(env.DATABASE_URL!);

interface R {
  reviewer_name: string;
  procedure_tag: string; procedure_tag_ru: string; procedure_tag_en: string;
  rating: number;
  review_text: string; review_text_ru: string; review_text_en: string;
  reviewed_at: string;
}

const DATA: { slug: string; reviews: R[] }[] = [
  {
    slug: "beliyanushkin-viktor",
    reviews: [
      {
        reviewer_name: "Олена К.",
        procedure_tag: "Контурна пластика", procedure_tag_ru: "Контурная пластика", procedure_tag_en: "Contour Plasty",
        rating: 5, reviewed_at: "2025-02-14",
        review_text: "Вікторе Ігоровичу, дякую від щирого серця! Прийшла з опущеними куточками губ і страхом щось змінювати. Він уважно вислухав, пояснив кожен крок і зробив так природно, що навіть чоловік не одразу зрозумів – просто сказав, що я вигляджу відпочилою. Обов'язково повернуся!",
        review_text_ru: "Виктор Игоревич, огромное вам спасибо! Пришла с опущенными уголками губ и страхом что-либо менять. Он внимательно выслушал, объяснил каждый шаг и сделал всё так естественно, что даже муж не сразу понял – просто сказал, что я выгляжу отдохнувшей. Обязательно вернусь!",
        review_text_en: "Viktor Ihorovych, thank you from the bottom of my heart! I came with drooping lip corners and a fear of changing anything. He listened carefully, explained each step and worked so naturally that even my husband didn't notice – he just said I looked well-rested. I'll definitely be back!",
      },
      {
        reviewer_name: "Марія Т.",
        procedure_tag: "Ботулінотерапія", procedure_tag_ru: "Ботулинотерапия", procedure_tag_en: "Botulinum Therapy",
        rating: 5, reviewed_at: "2025-01-20",
        review_text: "Вперше робила ботулінотерапію і дуже боялась. Але Віктор Ігорович – це той лікар, поруч з яким не страшно. Дуже детально пояснює що і навіщо, не поспішає, відповідає на всі запитання. Результат – через два тижні жодної зморшки на лобі, і виглядаю себе, тільки краще.",
        review_text_ru: "Делала ботулинотерапию впервые и очень боялась. Но Виктор Игоревич – это тот доктор, рядом с которым не страшно. Очень подробно объясняет что и зачем, не торопит, отвечает на все вопросы. Результат – через две недели ни одной морщины на лбу, и выгляжу собой, только лучше.",
        review_text_en: "First time getting botulinum therapy and I was terrified. But Viktor Ihorovych is one of those doctors who makes you feel completely safe. He explains everything in detail, takes his time, answers every question. Two weeks later – not a wrinkle on my forehead, and I still look like myself, just better.",
      },
      {
        reviewer_name: "Наталя В.",
        procedure_tag: "EMFACE", procedure_tag_ru: "EMFACE", procedure_tag_en: "EMFACE",
        rating: 5, reviewed_at: "2024-12-05",
        review_text: "Займаюсь із Віктором Ігоровичем вже три роки. Встигла зробити EMFACE, контурну пластику і ревіталізацію. Кожного разу відчуття, що тебе чують і розуміють. Ніколи не нав'язує зайвого, завжди говорить реальні очікування. Найкращий лікар-естет якого я знаю.",
        review_text_ru: "Работаю с Виктором Игоревичем уже три года. Успела сделать EMFACE, контурную пластику и ревитализацию. Каждый раз ощущение, что тебя слышат и понимают. Никогда не навязывает лишнего, всегда честно говорит о реальных ожиданиях. Лучший врач-эстет, которого я знаю.",
        review_text_en: "I've been seeing Viktor Ihorovych for three years. Done EMFACE, contour plasty and revitalisation. Every time I feel genuinely heard and understood. He never pushes unnecessary treatments and is always honest about realistic results. The best aesthetic doctor I know.",
      },
      {
        reviewer_name: "Ганна П.",
        procedure_tag: "HydraFacial", procedure_tag_ru: "HydraFacial", procedure_tag_en: "HydraFacial",
        rating: 5, reviewed_at: "2025-03-08",
        review_text: "Прийшла на HydraFacial із забитими порами і тьмяною шкірою після літа. Після однієї процедури шкіра засяяла – подруги одразу помітили зміну. Віктор Ігорович ще й підказав, як доглядати вдома, щоб результат тримався довше. Дуже уважний підхід!",
        review_text_ru: "Пришла на HydraFacial с забитыми порами и тусклой кожей после лета. После одной процедуры кожа засияла – подруги сразу заметили перемены. Виктор Игоревич ещё и подсказал, как ухаживать дома, чтобы результат держался дольше. Очень внимательный подход!",
        review_text_en: "Came in for HydraFacial with clogged pores and dull skin after summer. After just one session my skin was glowing – friends noticed straight away. Viktor Ihorovych also advised me on home care to make the results last. Such a thoughtful approach!",
      },
    ],
  },
  {
    slug: "sepkina-hanna",
    reviews: [
      {
        reviewer_name: "Світлана М.",
        procedure_tag: "Лазерна шліфовка AcuPulse CO₂", procedure_tag_ru: "Лазерная шлифовка AcuPulse CO₂", procedure_tag_en: "AcuPulse CO₂ Laser Resurfacing",
        rating: 5, reviewed_at: "2025-03-10",
        review_text: "Ганна Сергіївна – це лікар від Бога. Робила у неї лазерну шліфовку AcuPulse і ревіталізацію. Після кількох сеансів шкіра помолоділа так, що подруги питають у чому секрет. А секрет простий – правильний лікар :)",
        review_text_ru: "Анна Сергеевна – это врач от Бога. Делала у неё лазерную шлифовку AcuPulse и ревитализацию. После нескольких сеансов кожа помолодела настолько, что подруги спрашивают в чём секрет. А секрет простой – правильный врач :)",
        review_text_en: "Hanna Serhiivna is simply a gifted doctor. I had AcuPulse laser resurfacing and revitalisation with her. After a few sessions my skin looked so much younger that friends kept asking my secret. The secret is simple – the right doctor :)",
      },
      {
        reviewer_name: "Юлія Д.",
        procedure_tag: "EMFACE", procedure_tag_ru: "EMFACE", procedure_tag_en: "EMFACE",
        rating: 5, reviewed_at: "2025-02-28",
        review_text: "Прийшла до Ганни Сергіївни з пігментацією, яка мучила мене роками. Вже після першого сеансу EMFACE побачила різницю. Дуже вдячна за уважне ставлення і результат, що перевершив усі очікування.",
        review_text_ru: "Пришла к Анне Сергеевне с пигментацией, которая мучила меня годами. Уже после первого сеанса EMFACE увидела разницу. Очень благодарна за внимательное отношение и результат, превзошедший все ожидания.",
        review_text_en: "I came to Hanna Serhiivna with pigmentation that had bothered me for years. After the very first EMFACE session I could already see a difference. So grateful for the attentive care and results that exceeded every expectation.",
      },
      {
        reviewer_name: "Катерина Р.",
        procedure_tag: "Біоревіталізація", procedure_tag_ru: "Биоревитализация", procedure_tag_en: "Biorevitalisation",
        rating: 5, reviewed_at: "2025-01-15",
        review_text: "Тільки після Ганни нарешті зрозуміла, що не боюсь уколів. Вона настільки делікатна і точна в роботі, що навіть болюче завжди мінімально. Після курсу біоревіталізації шкіра стала зволоженою і сяючою. Рекомендую всім своїм подругам!",
        review_text_ru: "Только после Анны я наконец поняла, что не боюсь уколов. Она настолько деликатна и точна в работе, что даже болезненное всегда минимально. После курса биоревитализации кожа стала увлажнённой и сияющей. Рекомендую всем своим подругам!",
        review_text_en: "Only after going to Hanna did I finally realise I'm no longer scared of injections. She is so delicate and precise that even the difficult parts are always minimal. After my biorevitalisation course my skin became genuinely hydrated and glowing. I recommend her to all my friends!",
      },
      {
        reviewer_name: "Інна В.",
        procedure_tag: "Жіноча лазерна епіляція", procedure_tag_ru: "Женская лазерная эпиляция", procedure_tag_en: "Women's Laser Hair Removal",
        rating: 5, reviewed_at: "2024-11-20",
        review_text: "Ходила на лазерну епіляцію до різних майстрів, але тільки у GENEVITY знайшла той рівень сервісу, на який чекала. Ганна Сергіївна уважна, тактовна, завжди попереджає про відчуття. Після першого ж курсу результат вразив. Тепер тут і тільки тут!",
        review_text_ru: "Ходила на лазерную эпиляцию к разным специалистам, но только в GENEVITY нашла тот уровень сервиса, которого ждала. Анна Сергеевна внимательная, тактичная, всегда предупреждает об ощущениях. После первого же курса результат впечатлил. Теперь здесь и только здесь!",
        review_text_en: "I'd tried laser hair removal at different places, but only at GENEVITY did I find the level of service I was looking for. Hanna Serhiivna is attentive and tactful, always prepares you for what to expect. After the very first course the results were impressive. It's here and nowhere else!",
      },
    ],
  },
  {
    slug: "makarenko-oleksandra",
    reviews: [
      {
        reviewer_name: "Ірина С.",
        procedure_tag: "Консультація ендокринолога", procedure_tag_ru: "Консультация эндокринолога", procedure_tag_en: "Endocrinologist Consultation",
        rating: 5, reviewed_at: "2025-03-20",
        review_text: "Олександра Сергіївна повністю змінила моє розуміння власного здоров'я. Прийшла з хронічною втомою і купою аналізів з різних клінік. Вона не просто призначила лікування – пояснила, чому і як все пов'язано між собою. Вже через місяць відчуваю себе набагато краще.",
        review_text_ru: "Александра Сергеевна полностью изменила моё понимание собственного здоровья. Пришла с хронической усталостью и кучей анализов из разных клиник. Она не просто назначила лечение – объяснила, почему и как всё связано между собой. Уже через месяц чувствую себя значительно лучше.",
        review_text_en: "Oleksandra Serhiivna completely changed my understanding of my own health. I came in with chronic fatigue and a pile of tests from different clinics. She didn't just prescribe treatment – she explained why everything was connected. Just a month later I feel so much better.",
      },
      {
        reviewer_name: "Тетяна Г.",
        procedure_tag: "Консультація ендокринолога", procedure_tag_ru: "Консультация эндокринолога", procedure_tag_en: "Endocrinologist Consultation",
        rating: 5, reviewed_at: "2025-02-01",
        review_text: "Звернулась до Олександри Сергіївни з проблемами щитовидної залози. Лікар дуже уважна, вдумлива, завжди знаходить час відповісти на запитання навіть після прийому. Завдяки її підходу мої показники нарешті в нормі!",
        review_text_ru: "Обратилась к Александре Сергеевне с проблемами щитовидной железы. Врач очень внимательная, вдумчивая, всегда находит время ответить на вопросы даже после приёма. Благодаря её подходу мои показатели наконец-то в норме!",
        review_text_en: "I went to Oleksandra Serhiivna with thyroid issues. She is incredibly attentive and thoughtful, always making time to answer questions even after the appointment. Thanks to her approach my levels are finally back to normal!",
      },
      {
        reviewer_name: "Валентина К.",
        procedure_tag: "Консультація ендокринолога", procedure_tag_ru: "Консультация эндокринолога", procedure_tag_en: "Endocrinologist Consultation",
        rating: 5, reviewed_at: "2025-01-10",
        review_text: "Наша сім'я ходить до Олександри Сергіївни вже два роки. Вона допомогла мені, а потім і дочці впоратись із гормональними проблемами. Завжди уважна, нікуди не поспішає, пояснює все дуже доступно. Надійний лікар, якому довіряємо повністю.",
        review_text_ru: "Наша семья ходит к Александре Сергеевне уже два года. Она помогла мне, а потом и дочери справиться с гормональными проблемами. Всегда внимательна, никуда не торопится, объясняет всё очень доступно. Надёжный врач, которому доверяем полностью.",
        review_text_en: "Our family has been seeing Oleksandra Serhiivna for two years. She helped me, and then my daughter, deal with hormonal issues. Always attentive, never in a rush, explains even complex things simply. A trusted doctor we rely on completely.",
      },
      {
        reviewer_name: "Марина П.",
        procedure_tag: "Консультація ендокринолога", procedure_tag_ru: "Консультация эндокринолога", procedure_tag_en: "Endocrinologist Consultation",
        rating: 5, reviewed_at: "2024-12-18",
        review_text: "Щиро вдячна Олександрі Сергіївні за те, що нарешті поставила мені правильний діагноз після двох років блукань по різних лікарях. Підійшла комплексно, призначила грамотне лікування. Через три місяці відчуваю себе живою людиною знову.",
        review_text_ru: "Искренне благодарна Александре Сергеевне за то, что наконец поставила мне правильный диагноз после двух лет хождения по разным врачам. Подошла комплексно, назначила грамотное лечение. Через три месяца чувствую себя живым человеком снова.",
        review_text_en: "I'm truly grateful to Oleksandra Serhiivna for finally giving me the right diagnosis after two years of going from doctor to doctor. She took a holistic approach and prescribed proper treatment. Three months later I feel like myself again.",
      },
    ],
  },
  {
    slug: "poleshko-kateryna",
    reviews: [
      {
        reviewer_name: "Вікторія Л.",
        procedure_tag: "Longevity програма", procedure_tag_ru: "Longevity программа", procedure_tag_en: "Longevity Program",
        rating: 5, reviewed_at: "2025-03-05",
        review_text: "Катерина Володимирівна – це той лікар, до якого хочеться повертатись. Після longevity програми відчула справжній підйом енергії. Вона не просто лікує симптоми, а працює з причиною. Вдячна їй безмежно!",
        review_text_ru: "Екатерина Владимировна – это тот врач, к которому хочется возвращаться. После longevity программы почувствовала настоящий подъём энергии. Она не просто лечит симптомы, а работает с причиной. Безмерно ей благодарна!",
        review_text_en: "Kateryna Volodymyrivna is the kind of doctor you always want to come back to. After the Longevity Programme I felt a genuine surge of energy. She doesn't just treat symptoms – she works on the root cause. I'm endlessly grateful to her!",
      },
      {
        reviewer_name: "Наталія М.",
        procedure_tag: "IV-терапія", procedure_tag_ru: "IV-терапия", procedure_tag_en: "IV Therapy",
        rating: 5, reviewed_at: "2025-01-28",
        review_text: "Прийшла на IV-терапію за рекомендацією подруги і не пошкодувала. Катерина Володимирівна детально пояснює склад кожної краплинниці і підбирає його індивідуально. Після курсу відчуваю себе набагато бадьоріше й активніше.",
        review_text_ru: "Пришла на IV-терапию по рекомендации подруги и не пожалела. Екатерина Владимировна подробно объясняет состав каждой капельницы и подбирает его индивидуально. После курса чувствую себя значительно бодрее и активнее.",
        review_text_en: "Came for IV therapy on a friend's recommendation and have no regrets. Kateryna Volodymyrivna explains every infusion in detail and tailors it personally. After the course I feel so much more energetic.",
      },
      {
        reviewer_name: "Олена С.",
        procedure_tag: "Гормональний баланс", procedure_tag_ru: "Гормональный баланс", procedure_tag_en: "Hormonal Balance",
        rating: 5, reviewed_at: "2025-02-20",
        review_text: "Зверталась до Катерини Володимирівни з постійною втомою і поганим настроєм. Вона провела повне обстеження, знайшла кілька дефіцитів і склала персональну програму. Через місяць мій чоловік сказав, що я знову стала собою. Ось що означає правильний підхід до здоров'я!",
        review_text_ru: "Обращалась к Екатерине Владимировне с постоянной усталостью и плохим настроением. Она провела полное обследование, нашла несколько дефицитов и составила персональную программу. Через месяц муж сказал, что я снова стала собой. Вот что значит правильный подход к здоровью!",
        review_text_en: "I came to Kateryna Volodymyrivna with constant fatigue and low mood. She ran a thorough assessment, found several deficiencies and built a personalised programme. A month later my husband said I was back to being myself. That's what the right approach to health looks like!",
      },
      {
        reviewer_name: "Тетяна Ю.",
        procedure_tag: "Консультація ендокринолога", procedure_tag_ru: "Консультация эндокринолога", procedure_tag_en: "Endocrinologist Consultation",
        rating: 5, reviewed_at: "2024-11-30",
        review_text: "Мене вразило, наскільки ретельно Катерина Володимирівна підійшла до збору анамнезу. Жодна деталь не лишилась поза увагою. Вперше за довгий час відчуваю, що мене справді лікують, а не просто виписують рецепти. Рекомендую від щирого серця.",
        review_text_ru: "Меня поразило, насколько тщательно Екатерина Владимировна подошла к сбору анамнеза. Ни одна деталь не осталась без внимания. Впервые за долгое время чувствую, что меня действительно лечат, а не просто выписывают рецепты. Рекомендую от всего сердца.",
        review_text_en: "I was struck by how thorough Kateryna Volodymyrivna was in taking my medical history. Not a single detail was overlooked. For the first time in a long time I feel genuinely cared for, not just handed a prescription. I recommend her wholeheartedly.",
      },
    ],
  },
  {
    slug: "yesayants-anna",
    reviews: [
      {
        reviewer_name: "Аліна Б.",
        procedure_tag: "Ультразвукова діагностика", procedure_tag_ru: "Ультразвуковая диагностика", procedure_tag_en: "Ultrasound Diagnostics",
        rating: 5, reviewed_at: "2025-03-18",
        review_text: "Анна Олександрівна – це той лікар, до якого прийшла раз і залишилась назавжди. Уважна, тактовна, все пояснює доступно. Більше не боюсь оглядів, бо знаю – Анна Олександрівна зробить усе максимально комфортно.",
        review_text_ru: "Анна Александровна – это тот врач, к которому пришла один раз и осталась навсегда. Внимательная, тактичная, всё объясняет доступно. Больше не боюсь осмотров, потому что знаю – Анна Александровна сделает всё максимально комфортно.",
        review_text_en: "Anna Oleksandrivna is the kind of doctor you visit once and keep coming back to. Attentive, tactful, explains everything clearly. I no longer dread check-ups because I know Anna Oleksandrivna makes everything as comfortable as possible.",
      },
      {
        reviewer_name: "Дарина С.",
        procedure_tag: "AcuPulse CO₂ інтимне омолодження", procedure_tag_ru: "AcuPulse CO₂ интимное омоложение", procedure_tag_en: "AcuPulse CO₂ Intimate Rejuvenation",
        rating: 5, reviewed_at: "2025-02-10",
        review_text: "Довго не наважувалась записатись, але Анна Олександрівна розвіяла всі сумніви вже на першій консультації. Говорить відверто і по суті, без зайвого. Дуже рада, що вирішилась. Результат чудовий.",
        review_text_ru: "Долго не решалась записаться, но Анна Александровна развеяла все сомнения уже на первой консультации. Говорит откровенно и по существу, без лишнего. Очень рада, что решилась. Результат превосходный.",
        review_text_en: "I hesitated for a long time, but Anna Oleksandrivna put all my doubts to rest at the very first consultation. She speaks directly and to the point. So glad I went for it. The results are wonderful.",
      },
      {
        reviewer_name: "Катерина Л.",
        procedure_tag: "Монополярний RF-ліфтинг", procedure_tag_ru: "Монополярный RF-лифтинг", procedure_tag_en: "Monopolar RF Lifting",
        rating: 5, reviewed_at: "2025-01-22",
        review_text: "Вирішила спробувати RF-ліфтинг після того, як помітила зміни в овалі обличчя. Анна Олександрівна провела повноцінну консультацію, пояснила механізм і чесно сказала чого очікувати. Після трьох сеансів контур помітно підтягнувся. Задоволена на 100%!",
        review_text_ru: "Решила попробовать RF-лифтинг, заметив изменения в овале лица. Анна Александровна провела полноценную консультацию, объяснила механизм и честно сказала, чего ожидать. После трёх сеансов контур заметно подтянулся. Довольна на 100%!",
        review_text_en: "Decided to try RF lifting after noticing changes in my facial contour. Anna Oleksandrivna gave a thorough consultation, explained the mechanism and was honest about what to expect. After three sessions the contour is visibly tighter. 100% satisfied!",
      },
      {
        reviewer_name: "Ганна В.",
        procedure_tag: "AcuPulse CO₂ інтимне омолодження", procedure_tag_ru: "AcuPulse CO₂ интимное омоложение", procedure_tag_en: "AcuPulse CO₂ Intimate Rejuvenation",
        rating: 5, reviewed_at: "2024-12-15",
        review_text: "Тема делікатна, тому дуже важливо знайти лікаря якому довіряєш. Анна Олександрівна – саме такий спеціаліст. Жодного зайвого слова, жодної незручності, тільки чіткий план і відчутний результат. Рада, що обрала саме GENEVITY.",
        review_text_ru: "Тема деликатная, поэтому очень важно найти врача, которому доверяешь. Анна Александровна – именно такой специалист. Ни лишнего слова, ни неловкости, только чёткий план и ощутимый результат. Рада, что выбрала именно GENEVITY.",
        review_text_en: "It's a sensitive area, so finding a doctor you trust completely matters enormously. Anna Oleksandrivna is exactly that kind of specialist. No awkwardness, no unnecessary words – just a clear plan and tangible results. So glad I chose GENEVITY.",
      },
    ],
  },
  {
    slug: "lysenko-maksym",
    reviews: [
      {
        reviewer_name: "Тамара В.",
        procedure_tag: "Ультразвукова діагностика", procedure_tag_ru: "Ультразвуковая диагностика", procedure_tag_en: "Ultrasound Diagnostics",
        rating: 5, reviewed_at: "2025-02-15",
        review_text: "Максим Ігорович – дуже уважний і терпеливий фахівець. Детально пояснив результати, відповів на всі запитання. Після обстеження пішла зі спокійним серцем і повним розумінням своєї ситуації.",
        review_text_ru: "Максим Игоревич – очень внимательный и терпеливый специалист. Подробно объяснил результаты, ответил на все вопросы. После обследования ушла со спокойным сердцем и полным пониманием своей ситуации.",
        review_text_en: "Maksym Ihorovych is an incredibly attentive and patient specialist. He explained the results in detail and answered every question. I left the appointment calm and with a clear understanding of my situation.",
      },
      {
        reviewer_name: "Ольга К.",
        procedure_tag: "Лікар УЗД", procedure_tag_ru: "Врач УЗД", procedure_tag_en: "Ultrasound Diagnostician",
        rating: 5, reviewed_at: "2025-01-25",
        review_text: "Пройшла у Максима Ігоровича повне УЗД обстеження. Дуже точна і детальна робота. Описав все настільки зрозуміло, що навіть без медичної освіти я чудово розібралась. Ніколи не поспішав, відповів на кожне запитання.",
        review_text_ru: "Проходила у Максима Игоревича полное УЗИ обследование. Очень точная и детальная работа. Описал всё настолько понятно, что даже без медицинского образования я прекрасно разобралась. Никуда не торопился, ответил на каждый вопрос.",
        review_text_en: "Went through a full ultrasound examination with Maksym Ihorovych. Very precise and thorough work. He described everything so clearly that even without medical knowledge I understood perfectly. Never rushed, answered every single question.",
      },
      {
        reviewer_name: "Людмила С.",
        procedure_tag: "Ультразвукова діагностика", procedure_tag_ru: "Ультразвуковая диагностика", procedure_tag_en: "Ultrasound Diagnostics",
        rating: 5, reviewed_at: "2024-12-10",
        review_text: "Раніше боялась діагностики, але Максим Ігорович повністю змінив моє ставлення. Спокійний, уважний, жодного тиску. Тепер хожу до нього на профілактичні огляди раз на рік і завжди виходжу з чіткими відповідями.",
        review_text_ru: "Раньше боялась диагностики, но Максим Игоревич полностью изменил моё отношение. Спокойный, внимательный, никакого давления. Теперь хожу к нему на профилактические осмотры раз в год и всегда выхожу с чёткими ответами.",
        review_text_en: "I used to dread check-ups, but Maksym Ihorovych completely changed my attitude. Calm, attentive, never any pressure. Now I see him for preventive check-ups once a year and always leave with clear answers.",
      },
    ],
  },
  {
    slug: "fedorenko-svitlana",
    reviews: [
      {
        reviewer_name: "Ольга М.",
        procedure_tag: "Ультразвукова діагностика", procedure_tag_ru: "Ультразвуковая диагностика", procedure_tag_en: "Ultrasound Diagnostics",
        rating: 5, reviewed_at: "2025-01-30",
        review_text: "Світлана Олексіївна – дуже досвідчений фахівець. Провела огляд ретельно і з поясненнями. Після консультації з нею нарешті зрозуміла, що в мене відбувається. Щиро рекомендую!",
        review_text_ru: "Светлана Алексеевна – очень опытный специалист. Провела осмотр тщательно и с объяснениями. После консультации с ней наконец поняла, что у меня происходит. Искренне рекомендую!",
        review_text_en: "Svitlana Oleksiivna is a highly experienced specialist. Conducted the examination thoroughly and with explanations. After my consultation I finally understood what was going on. I recommend her wholeheartedly!",
      },
      {
        reviewer_name: "Катерина П.",
        procedure_tag: "Лікар УЗД", procedure_tag_ru: "Врач УЗД", procedure_tag_en: "Ultrasound Diagnostician",
        rating: 5, reviewed_at: "2025-02-22",
        review_text: "Ходила до Світлани Олексіївни вже тричі. Кожного разу все чітко, зрозуміло і без поспіху. Вона одразу знаходить те, на що потрібно звернути увагу, і пояснює як лікуючому лікарю, так і пацієнту. Ось що таке справжній фахівець!",
        review_text_ru: "Ходила к Светлане Алексеевне уже трижды. Каждый раз всё чётко, понятно и без спешки. Она сразу находит то, на что нужно обратить внимание, и объясняет как лечащему врачу, так и пациенту. Вот что такое настоящий специалист!",
        review_text_en: "I've been to Svitlana Oleksiivna three times now. Every time it's precise, clear and unhurried. She immediately spots what needs attention and explains it to both the referring doctor and the patient. That's what a true professional looks like!",
      },
      {
        reviewer_name: "Ірина Д.",
        procedure_tag: "Ультразвукова діагностика", procedure_tag_ru: "Ультразвуковая диагностика", procedure_tag_en: "Ultrasound Diagnostics",
        rating: 5, reviewed_at: "2024-11-15",
        review_text: "Дуже вдячна Світлані Олексіївні за уважне ставлення. Прийшла зі скаргами, які інші лікарі раніше відкидали. Вона виявила проблему і скерувала до правильного спеціаліста. Завдяки їй нарешті отримала правильне лікування.",
        review_text_ru: "Очень благодарна Светлане Алексеевне за внимательное отношение. Пришла с жалобами, которые другие врачи раньше отметали. Она выявила проблему и направила к нужному специалисту. Благодаря ей наконец получила правильное лечение.",
        review_text_en: "Very grateful to Svitlana Oleksiivna for her attentiveness. I came with complaints that other doctors had dismissed. She identified the problem and referred me to the right specialist. Thanks to her I finally got the correct treatment.",
      },
    ],
  },
  {
    slug: "minchuk-yevheniia",
    reviews: [
      {
        reviewer_name: "Оксана В.",
        procedure_tag: "Нутрицевтика", procedure_tag_ru: "Нутрицевтика", procedure_tag_en: "Nutraceuticals",
        rating: 5, reviewed_at: "2025-02-20",
        review_text: "Євгенія Анатоліївна допомогла нарешті розібратись з добавками – до цього я хаотично пила все підряд за порадами інтернету. Після консультації отримала чіткий план, і вже за місяць відчула різницю в рівні енергії та якості сну.",
        review_text_ru: "Евгения Анатольевна помогла наконец разобраться с добавками – до этого я хаотично пила всё подряд по советам интернета. После консультации получила чёткий план, и уже через месяц почувствовала разницу в уровне энергии и качестве сна.",
        review_text_en: "Yevheniia Anatoliivna finally helped me make sense of supplements – before this I was randomly taking everything based on internet advice. After the consultation I had a clear plan, and within a month I felt the difference in energy and sleep quality.",
      },
      {
        reviewer_name: "Марія Б.",
        procedure_tag: "Нутрицевтика", procedure_tag_ru: "Нутрицевтика", procedure_tag_en: "Nutraceuticals",
        rating: 5, reviewed_at: "2025-01-12",
        review_text: "Зверталась до Євгенії Анатоліївни з хронічною втомою і жалями на волосся та нігті. Вона провела детальне анкетування, призначила аналізи і підібрала персональну схему. Через два місяці і волосся краще, і сил більше. Неймовірно, як правильно підібрані добавки міняють якість життя!",
        review_text_ru: "Обращалась к Евгении Анатольевне с хронической усталостью и жалобами на волосы и ногти. Она провела детальное анкетирование, назначила анализы и подобрала персональную схему. Через два месяца и волосы лучше, и сил больше. Невероятно, как правильно подобранные добавки меняют качество жизни!",
        review_text_en: "I came to Yevheniia Anatoliivna with chronic fatigue and concerns about my hair and nails. She conducted a thorough assessment, ran tests and built a personalised nutraceutical plan. Two months later my hair is better and my energy is up. It's incredible how the right supplements transform your quality of life!",
      },
      {
        reviewer_name: "Лілія К.",
        procedure_tag: "Біоімпедансометрія InBody", procedure_tag_ru: "Биоимпедансометрия InBody", procedure_tag_en: "InBody Bioimpedance Analysis",
        rating: 5, reviewed_at: "2024-12-28",
        review_text: "Робила біоімпедансометрію InBody у Євгенії Анатоліївни. Це не просто цифри на екрані – вона пояснила кожен показник і розповіла що саме потрібно коригувати в харчуванні та добавках. Такого детального підходу я ще ніде не зустрічала. Щиро дякую!",
        review_text_ru: "Делала биоимпедансометрию InBody у Евгении Анатольевны. Это не просто цифры на экране – она объяснила каждый показатель и рассказала, что именно нужно корректировать в питании и добавках. Такого детального подхода я нигде ещё не встречала. Искренне благодарю!",
        review_text_en: "I had InBody bioimpedance analysis with Yevheniia Anatoliivna. It wasn't just numbers on a screen – she explained every indicator and outlined exactly what to adjust in my nutrition and supplements. I've never encountered such a detailed approach anywhere else. Truly grateful!",
      },
    ],
  },
  {
    slug: "tolstykova-tetiana",
    reviews: [
      {
        reviewer_name: "Лариса К.",
        procedure_tag: "Нутрицевтика", procedure_tag_ru: "Нутрицевтика", procedure_tag_en: "Nutraceuticals",
        rating: 5, reviewed_at: "2025-03-01",
        review_text: "До Тетяни Миколаївни звернулась після того, як все перепробувала самостійно і нічого не спрацювало. Вона підійшла комплексно, призначила аналізи і склала персональну схему. Через три місяці відчуваю себе набагато краще. Спасибі за такий уважний підхід!",
        review_text_ru: "К Татьяне Николаевне обратилась после того, как всё перепробовала самостоятельно и ничего не сработало. Она подошла комплексно, назначила анализы и составила персональную схему. Через три месяца чувствую себя значительно лучше. Спасибо за такой внимательный подход!",
        review_text_en: "I went to Tetiana Mykolaivna after trying everything on my own without results. She took a comprehensive approach, ran tests and created a personalised plan. Three months later I feel so much better. Thank you for such an attentive approach!",
      },
      {
        reviewer_name: "Наталя Г.",
        procedure_tag: "Нутрицевтика", procedure_tag_ru: "Нутрицевтика", procedure_tag_en: "Nutraceuticals",
        rating: 5, reviewed_at: "2025-02-05",
        review_text: "Тетяна Миколаївна – це фахівець, який справді розуміється на нутрицевтиці. Жодних загальних рекомендацій – тільки персональний підхід і конкретний план. Вже після першого місяця прийому відчула зміни в самопочутті. Дякую за таку якісну роботу!",
        review_text_ru: "Татьяна Николаевна – это специалист, который действительно разбирается в нутрицевтике. Никаких общих рекомендаций – только персональный подход и конкретный план. Уже после первого месяца приёма почувствовала изменения в самочувствии. Спасибо за такую качественную работу!",
        review_text_en: "Tetiana Mykolaivna is a specialist who truly understands nutraceuticals. No generic recommendations – just a personal approach and a concrete plan. After just the first month on the programme I could already feel the difference. Thank you for such quality work!",
      },
      {
        reviewer_name: "Аня С.",
        procedure_tag: "Біоімпедансометрія InBody", procedure_tag_ru: "Биоимпедансометрия InBody", procedure_tag_en: "InBody Bioimpedance Analysis",
        rating: 5, reviewed_at: "2024-11-25",
        review_text: "Пройшла InBody аналіз складу тіла у Тетяни Миколаївни. Вона не просто роздрукувала результати, а детально пояснила кожну цифру і зв'язала все з моїм способом життя. Тепер чітко розумію куди рухатись. Рекомендую всім хто хоче розібратись у своєму здоров'ї!",
        review_text_ru: "Прошла InBody анализ состава тела у Татьяны Николаевны. Она не просто распечатала результаты, а подробно объяснила каждую цифру и связала всё с моим образом жизни. Теперь чётко понимаю куда двигаться. Рекомендую всем, кто хочет разобраться в своём здоровье!",
        review_text_en: "Had InBody body composition analysis with Tetiana Mykolaivna. She didn't just print out the results – she explained every number in detail and connected it to my lifestyle. Now I have a clear direction. I recommend this to everyone who wants to understand their health better!",
      },
    ],
  },
];

async function main() {
  const docRows = await sql`SELECT id, slug FROM doctors WHERE slug IS NOT NULL`;
  const docMap = Object.fromEntries(docRows.map((r) => [r.slug as string, r.id as string]));

  await sql`DELETE FROM doctor_reviews`;

  let total = 0;
  for (const { slug, reviews } of DATA) {
    const docId = docMap[slug];
    if (!docId) { console.warn(`⚠  Doctor not found: ${slug}`); continue; }
    for (let i = 0; i < reviews.length; i++) {
      const r = reviews[i];
      await sql`
        INSERT INTO doctor_reviews
          (doctor_id, reviewer_name,
           procedure_tag, procedure_tag_ru, procedure_tag_en,
           rating,
           review_text, review_text_ru, review_text_en,
           reviewed_at, sort_order)
        VALUES
          (${docId}, ${r.reviewer_name},
           ${r.procedure_tag}, ${r.procedure_tag_ru}, ${r.procedure_tag_en},
           ${r.rating},
           ${r.review_text}, ${r.review_text_ru}, ${r.review_text_en},
           ${r.reviewed_at}::date, ${i})
      `;
      total++;
    }
    console.log(`✓ ${slug} → ${reviews.length} reviews`);
  }
  console.log(`\n✅ Seeded ${total} reviews total.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
