/**
 * V1 — luxury, TZ-aligned copy for the 4 highest-frequency injectable
 * cosmetology services:
 *
 *    1. Ботулінотерапія (re-seeds the pilot with the TZ section plan)
 *    2. Біоревіталізація
 *    3. Мезотерапія
 *    4. Екзосоми
 *
 * Each service gets:
 *   - Hero summary (Ukrainian master; RU / EN professionally aligned)
 *   - 4-5 rich-text sections covering the exact TZ section plan
 *   - 5-7 FAQ items built around the long-tail questions from the
 *     semantic core + the FAQs named in the TZ
 *   - seo_title / seo_desc / seo_keywords left to the earlier
 *     seo-from-semantics.ts run (no overwrite)
 *
 * Voice: restrained, specific, trust-via-detail. No superlatives.
 * No "найкращий" / "унікальний" / "гарантовано безпечний".
 * Every claim is precise (minutes, days, measured units, contraindications).
 *
 * The script replaces existing content_sections + faq_items for each
 * service and rebuilds block_order so the fresh content takes the
 * first slots. Idempotent — safe to re-run.
 *
 * Run: npx tsx scripts/seed-copy-v1.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});
const sql = postgres(env.DATABASE_URL!);

type Locale = "uk" | "ru" | "en";
type L = Record<Locale, string>;

interface SectionCopy { heading: L; body: L; calloutBody: L; }
interface FaqCopy { question: L; answer: L; }
interface ServiceCopy {
  slug: string;
  summary: L;
  sections: SectionCopy[];
  faq: FaqCopy[];
}

/* ────────────────────────────────────────────────────────────────
 * 1. БОТУЛІНОТЕРАПІЯ — re-seed per TZ section plan
 *    Semantic cluster: ботулінотерапія (1900) + 6 supporting terms
 * ──────────────────────────────────────────────────────────────── */
const botulinum: ServiceCopy = {
  slug: "botulinum-therapy",
  summary: {
    uk: "Ботулінотерапія у GENEVITY — точкові ін'єкції ботулотоксину, які розслаблюють мімічні м'язи і розгладжують зморшки на чолі, між брів, у зоні гусячих лапок. Працюємо лише з оригінальними препаратами, дозу розраховуємо індивідуально під ваше обличчя.",
    ru: "Ботулинотерапия в GENEVITY — точечные инъекции ботулотоксина, которые расслабляют мимические мышцы и разглаживают морщины на лбу, между бровей, в зоне гусиных лапок. Работаем только с оригинальными препаратами, дозу рассчитываем индивидуально под ваше лицо.",
    en: "Botulinum therapy at GENEVITY — precise injections that relax expression muscles and soften lines on the forehead, glabella and around the eyes. Only original preparations, with doses calculated individually for your face.",
  },
  sections: [
    {
      heading: {
        uk: "Що таке ботулінотерапія",
        ru: "Что такое ботулинотерапия",
        en: "What botulinum therapy is",
      },
      body: {
        uk: "Ботулінотерапія — ін'єкційна процедура на основі ботулотоксину типу А: м'яких блокуючих сигналів між нервом і м'язом. Коли мімічний м'яз припиняє надмірно скорочуватись, шкіра над ним поступово розгладжується, а нові зморшки не встигають формуватись. Процедуру застосовують у косметології понад 30 років, а у неврології та офтальмології — і того довше.\n\nУ GENEVITY, центрі довголіття та естетичної медицини у Дніпрі, ми використовуємо виключно сертифіковані препарати — Botox, Dysport, Xeomin, Bocouture — обраний препарат обговорюємо з пацієнтом на консультації залежно від зон, сили м'язів і очікуваного результату. Для кожного обличчя розраховуємо індивідуальну карту точок ін'єкції та кількість одиниць: прайс не визначає дозу — визначає лікар.",
        ru: "Ботулинотерапия — инъекционная процедура на основе ботулотоксина типа А: мягкого блокатора сигнала между нервом и мышцей. Когда мимическая мышца перестаёт чрезмерно сокращаться, кожа над ней постепенно разглаживается, а новые морщины не успевают формироваться. Процедура применяется в косметологии более 30 лет, а в неврологии и офтальмологии — ещё дольше.\n\nВ GENEVITY, центре долголетия и эстетической медицины в Днепре, мы используем исключительно сертифицированные препараты — Botox, Dysport, Xeomin, Bocouture — выбор обсуждаем с пациентом на консультации в зависимости от зон, силы мышц и ожидаемого результата. Для каждого лица рассчитываем индивидуальную карту точек инъекции и количество единиц: прайс не определяет дозу — определяет врач.",
        en: "Botulinum therapy is an injectable procedure based on botulinum toxin type A — a gentle blocker of the signal between nerve and muscle. When an expression muscle stops over-contracting, the skin above it smooths out and new lines stop forming. The procedure has been used in cosmetology for over 30 years, and in neurology and ophthalmology for longer still.\n\nAt GENEVITY, our longevity and aesthetic medicine centre in Dnipro, we work exclusively with certified preparations — Botox, Dysport, Xeomin, Bocouture — and we choose between them during your consultation based on the zones, muscle strength and the result you want. For every face we map individual injection points and unit counts: the price list doesn't dictate the dose, the doctor does.",
      },
      calloutBody: {
        uk: "Ботулінотерапія не робить обличчя нерухомим. Задача — зменшити надмірне скорочення конкретного м'яза, а не знерухомити мімічний малюнок. Якщо процедуру зробили правильно, люди навколо помітять, що ви відпочили — але не зрозуміють, чому.",
        ru: "Ботулинотерапия не делает лицо неподвижным. Задача — уменьшить избыточное сокращение конкретной мышцы, а не обездвижить мимику. Если процедура сделана правильно, окружающие заметят, что вы отдохнули, — но не поймут, почему.",
        en: "Botulinum therapy doesn't immobilise the face. The goal is to soften the over-activity of one specific muscle, not to freeze expression. Done well, the people around you will notice that you look rested — they just won't know why.",
      },
    },
    {
      heading: {
        uk: "Показання до ботулінотерапії",
        ru: "Показания к ботулинотерапии",
        en: "Indications",
      },
      body: {
        uk: "Процедура працює там, де зморшка утворюється внаслідок роботи м'яза, а не через фотостаріння чи втрату обсягу. Ботулінотерапію призначають при:\n\n— мімічних зморшках на чолі (горизонтальні лінії);\n— міжбрівних вертикальних зморшках (складка «гніву»);\n— гусячих лапках навколо очей;\n— носогубних лініях у верхній частині (\"лінії кролика\");\n— \"галькоподібній\" поверхні підборіддя;\n— опущених кутах рота (ефект суму);\n— платизмальних тяжах на шиї;\n— асиметрії брів або опущенні брови;\n— бруксизмі (нічне скрегіт зубами) та гіпертрофії жувальних м'язів;\n— гіпергідрозі долонь, пахв та стоп.\n\nКращий вік для початку — 28–35 років, коли зморшки лише починають фіксуватись. Проте ботулотоксин ефективний і в зрілому віці, часто в комплексі з біоревіталізацією чи контурною пластикою.",
        ru: "Процедура работает там, где морщина образуется из-за работы мышцы, а не из-за фотостарения или потери объёма. Ботулинотерапию назначают при:\n\n— мимических морщинах на лбу (горизонтальные линии);\n— межбровных вертикальных морщинах (складка «гнева»);\n— гусиных лапках вокруг глаз;\n— носогубных линиях в верхней части («линии кролика»);\n— «галечной» поверхности подбородка;\n— опущенных уголках рта (эффект грусти);\n— платизмальных тяжах на шее;\n— асимметрии бровей или опущении брови;\n— бруксизме (ночной скрежет зубами) и гипертрофии жевательных мышц;\n— гипергидрозе ладоней, подмышек и стоп.\n\nЛучший возраст для старта — 28–35 лет, когда морщины только начинают фиксироваться. Однако ботулотоксин эффективен и в зрелом возрасте, часто в комплексе с биоревитализацией или контурной пластикой.",
        en: "The procedure works where a line is formed by muscle activity rather than photo-ageing or volume loss. We prescribe botulinum therapy for:\n\n— horizontal forehead lines;\n— glabellar frown lines;\n— crow's feet around the eyes;\n— upper nasolabial \"bunny\" lines;\n— cobblestone chin texture;\n— down-turned corners of the mouth (sad-mouth effect);\n— platysmal neck bands;\n— eyebrow asymmetry or drooping brow;\n— bruxism and hypertrophy of the masseter muscles;\n— palmar, axillary and plantar hyperhidrosis.\n\nThe best age to start is 28–35, when lines are only beginning to set. But botulinum toxin also works beautifully at later ages, often paired with biorevitalisation or fillers.",
      },
      calloutBody: {
        uk: "Якщо зморшка глибока і стає видимою у спокої — одного ботулотоксину замало. Такі випадки працюємо в комплексі: ботокс розслаблює м'яз, філер або біоревіталізація повертають шкірі об'єм і якість.",
        ru: "Если морщина глубокая и видна в покое — одного ботулотоксина мало. Такие случаи работаем в комплексе: ботокс расслабляет мышцу, филлер или биоревитализация возвращают коже объём и качество.",
        en: "When a line is deep and visible at rest, botulinum alone isn't enough. We treat these cases in combination: botulinum relaxes the muscle while filler or biorevitalisation restore volume and skin quality.",
      },
    },
    {
      heading: {
        uk: "Протипоказання та обмеження",
        ru: "Противопоказания и ограничения",
        en: "Contraindications",
      },
      body: {
        uk: "Протипоказання до ботулінотерапії ділимо на абсолютні та відносні. Абсолютні — це ті, при яких процедура не проводиться:\n\n— вагітність і період грудного вигодовування;\n— міастенія, синдром Ламберта–Ітона та інші нервово-м'язові захворювання;\n— гіперчутливість до ботулотоксину чи компонентів препарату;\n— запальні процеси у зоні ін'єкції;\n— злоякісні новоутворення в активній фазі.\n\nВідносні — процедуру можна проводити, але з обережністю та після додаткової оцінки:\n\n— прийом антикоагулянтів чи аміноглікозидів;\n— загострення хронічних захворювань;\n— герпес у стадії активного прояву;\n— вік до 18 років;\n— гемофілія та порушення згортання крові.\n\nПеред процедурою лікар проводить огляд, уточнює анамнез і список поточних медикаментів. Якщо у вас є хронічні стани — приносьте виписки: це допомагає скласти точну карту безпечної процедури.",
        ru: "Противопоказания к ботулинотерапии делим на абсолютные и относительные. Абсолютные — это те, при которых процедура не проводится:\n\n— беременность и период грудного вскармливания;\n— миастения, синдром Ламберта–Итона и другие нервно-мышечные заболевания;\n— гиперчувствительность к ботулотоксину или компонентам препарата;\n— воспалительные процессы в зоне инъекции;\n— злокачественные новообразования в активной фазе.\n\nОтносительные — процедуру можно проводить, но с осторожностью и после дополнительной оценки:\n\n— приём антикоагулянтов или аминогликозидов;\n— обострение хронических заболеваний;\n— герпес в стадии активного проявления;\n— возраст до 18 лет;\n— гемофилия и нарушения свёртываемости крови.\n\nПеред процедурой врач проводит осмотр, уточняет анамнез и список текущих медикаментов. Если у вас есть хронические состояния — приносите выписки: это помогает составить точную карту безопасной процедуры.",
        en: "Contraindications split into absolute — when the procedure is not performed — and relative, when it's performed with caution after additional assessment.\n\nAbsolute: pregnancy and breastfeeding; myasthenia gravis, Lambert-Eaton syndrome and other neuromuscular disorders; hypersensitivity to botulinum toxin or the preparation itself; active inflammation in the injection zone; active-phase malignancies.\n\nRelative: ongoing anticoagulant or aminoglycoside therapy; flare-ups of chronic disease; active herpes outbreaks; age under 18; haemophilia and clotting disorders.\n\nBefore the procedure the doctor takes a history, reviews current medications and examines the treatment area. If you have chronic conditions, bring your medical records — they help us build a precise, safe treatment plan.",
      },
      calloutBody: {
        uk: "Чесно: якщо лікар при консультації не питав вас про ліки, алергії та хронічні стани — це червоний прапорець. У GENEVITY консультація перед першою ботулінотерапією триває 30–45 хвилин саме тому.",
        ru: "Честно: если врач на консультации не спросил вас о лекарствах, аллергиях и хронических состояниях — это красный флаг. В GENEVITY консультация перед первой ботулинотерапией длится 30–45 минут именно поэтому.",
        en: "Honest note: if a doctor doesn't ask about your medications, allergies and chronic conditions during consultation — that's a red flag. At GENEVITY a first-visit botulinum consultation lasts 30-45 minutes for exactly this reason.",
      },
    },
    {
      heading: {
        uk: "Як проходить процедура",
        ru: "Как проходит процедура",
        en: "How the session runs",
      },
      body: {
        uk: "Процедура займає 20–30 хвилин і складається з п'яти етапів:\n\n1. Консультація і карта точок. Лікар оцінює стан шкіри, тонус м'язів, ваші побажання до результату. Разом малюємо карту точок і визначаємо кількість одиниць препарату на кожну зону.\n\n2. Підготовка. Демакіяж, обробка шкіри антисептиком, маркування точок ін'єкції медичним олівцем.\n\n3. Ін'єкції. Тонкою інсуліновою голкою у кожну точку вводиться мікродоза препарату — по 2–4 одиниці залежно від зони. Відчуття — легкі поколювання. Анестезію не застосовуємо у 90% випадків.\n\n4. Мімічна гімнастика. Одразу після уколів лікар просить активно мімікувати — нахмуритись, підняти брови, зажмуритись. Це допомагає препарату рівномірно розподілитись у м'язі.\n\n5. Контрольний огляд на 14-й день. Дивимось результат, додаємо одиниці без доплати у зоні, де м'яз виявився активнішим за очікування.\n\nДогляд після процедури на 24 години: без спорту, сауни, басейну, солярію, масажу обличчя; уникати горизонтального положення перші 4 години; макіяж — через 2 години.",
        ru: "Процедура занимает 20–30 минут и состоит из пяти этапов:\n\n1. Консультация и карта точек. Врач оценивает состояние кожи, тонус мышц, ваши пожелания. Вместе рисуем карту точек и определяем количество единиц препарата на каждую зону.\n\n2. Подготовка. Демакияж, обработка кожи антисептиком, маркировка точек инъекции медицинским карандашом.\n\n3. Инъекции. Тонкой инсулиновой иглой в каждую точку вводится микродоза препарата — 2–4 единицы в зависимости от зоны. Ощущение — лёгкое покалывание. Анестезию не применяем в 90% случаев.\n\n4. Мимическая гимнастика. Сразу после уколов врач просит активно мимикировать — нахмуриться, поднять брови, зажмуриться. Это помогает препарату равномерно распределиться в мышце.\n\n5. Контрольный осмотр на 14-й день. Смотрим результат, добавляем единицы без доплаты в зоне, где мышца оказалась активнее ожидаемого.\n\nУход после процедуры на 24 часа: без спорта, сауны, бассейна, солярия, массажа лица; избегать горизонтального положения первые 4 часа; макияж — через 2 часа.",
        en: "The session takes 20-30 minutes across five steps:\n\n1. Consultation and injection map. The doctor evaluates skin quality, muscle tone and the result you want. Together we draw the point map and agree on the unit count per zone.\n\n2. Preparation. Makeup removal, antiseptic, injection-point marking with a medical pencil.\n\n3. Injections. A fine insulin needle delivers a microdose into each point — 2-4 units per zone. The feeling is a light pinch; we skip anaesthesia in 90% of cases.\n\n4. Muscle exercise. Right after the injections the doctor asks you to actively engage the muscles — frown, raise the brows, squeeze the eyes shut. This helps the product distribute evenly.\n\n5. Two-week follow-up. We check the result and top up any zone that stayed more active than expected — no extra charge.\n\nAftercare for 24 hours: no sports, sauna, pool, tanning or facial massage; avoid lying flat for the first 4 hours; makeup after 2 hours.",
      },
      calloutBody: {
        uk: "Контрольний огляд на 14-й день — не додаткова послуга і не ознака «недоробки». Це стандарт GENEVITY: м'язи обличчя реагують по-різному, і precision-touchup — це частина однієї процедури, а не окремий візит.",
        ru: "Контрольный осмотр на 14-й день — не дополнительная услуга и не признак «недоделки». Это стандарт GENEVITY: мышцы лица реагируют по-разному, и precision-touchup — это часть одной процедуры, а не отдельный визит.",
        en: "The two-week check isn't an upsell and it doesn't mean the first visit was incomplete. It's a GENEVITY standard: different muscles respond differently, and the touch-up is part of the same procedure — not a separate appointment.",
      },
    },
    {
      heading: {
        uk: "Вартість ботулінотерапії у Дніпрі",
        ru: "Стоимость ботулинотерапии в Днепре",
        en: "Pricing",
      },
      body: {
        uk: "Вартість ботулінотерапії залежить від трьох факторів: обраного препарату, кількості зон обробки та індивідуальної дози в одиницях. Орієнтовні ціни:\n\n— Ботулінотерапія 1 зони (між брів, чоло або гусячі лапки) — від базової вартості, зазначеної в прайсі;\n— Ботулінотерапія 2–3 зон — у комплекс з вигіднішою ціною за одиницю;\n— Ботулінотерапія нижньої третини обличчя (підборіддя, носогубні, платизма) — розраховуємо окремо після консультації;\n— Ботулінотерапія при бруксизмі або гіпергідрозі — від базової вартості, кількість одиниць більша, ніж у косметологічних зонах.\n\nТочну ціну для вашого обличчя озвучуємо на консультації — після огляду лікар визначить, скільки одиниць потрібно на ваш м'язовий малюнок. Часто це менше, ніж може здатися з прайсу: у GENEVITY ми не додаємо «про запас» та не округлюємо в більший бік.",
        ru: "Стоимость ботулинотерапии зависит от трёх факторов: выбранного препарата, количества зон обработки и индивидуальной дозы в единицах. Ориентировочные цены:\n\n— Ботулинотерапия 1 зоны (межбровье, лоб или гусиные лапки) — от базовой стоимости, указанной в прайсе;\n— Ботулинотерапия 2–3 зон — в комплексе с более выгодной ценой за единицу;\n— Ботулинотерапия нижней трети лица (подбородок, носогубные, платизма) — рассчитываем отдельно после консультации;\n— Ботулинотерапия при бруксизме или гипергидрозе — от базовой стоимости, количество единиц больше, чем в косметологических зонах.\n\nТочную цену для вашего лица озвучиваем на консультации — после осмотра врач определит, сколько единиц нужно на ваш мышечный рисунок. Часто это меньше, чем может показаться из прайса: в GENEVITY мы не добавляем «про запас» и не округляем в большую сторону.",
        en: "The price of botulinum therapy depends on three factors: the preparation you choose, the number of zones treated, and the individual dose in units. Indicative pricing:\n\n— Botulinum therapy, single zone (glabella, forehead or crow's feet) — from the base price listed;\n— Two to three zones combined — at a better per-unit rate;\n— Lower-face treatment (chin, nasolabial, platysma) — quoted individually after consultation;\n— Bruxism or hyperhidrosis — from the base price, with unit counts higher than for cosmetic zones.\n\nThe exact price for your face is quoted during the consultation — after the doctor examines your muscle pattern. It's often less than the price list suggests: at GENEVITY we don't add units \"just in case\" or round up.",
      },
      calloutBody: {
        uk: "Дешева ботулінотерапія зазвичай означає розведення препарату. Це знижує стабільність результату, пропорційно скорочує тривалість ефекту та підвищує ризик міграції. GENEVITY не розводить препарати — і тому ефект тримається 4–6 місяців, а не 2–3.",
        ru: "Дешёвая ботулинотерапия обычно означает разведение препарата. Это снижает стабильность результата, пропорционально сокращает длительность эффекта и повышает риск миграции. GENEVITY не разводит препараты — и поэтому эффект держится 4–6 месяцев, а не 2–3.",
        en: "Cheap botulinum therapy usually means a diluted preparation. That reduces stability of the result, proportionally shortens the effect, and raises the risk of migration. GENEVITY doesn't dilute — which is why our results last 4-6 months, not 2-3.",
      },
    },
  ],
  faq: [
    {
      question: {
        uk: "Як швидко проявляється ефект після ботулінотерапії?",
        ru: "Как быстро проявляется эффект после ботулинотерапии?",
        en: "How quickly do the results appear?",
      },
      answer: {
        uk: "Перші зміни відчуваються на 2–3 добу після процедури — м'язи починають «заспокоюватись». Повний результат розкривається на 7–14 день. Саме тому контрольний огляд у GENEVITY призначаємо через 2 тижні: до цього часу м'язи повністю відреагували на препарат і видно, де потрібна корекція.",
        ru: "Первые изменения ощущаются на 2–3 сутки после процедуры — мышцы начинают «успокаиваться». Полный результат раскрывается на 7–14 день. Именно поэтому контрольный осмотр в GENEVITY назначаем через 2 недели: к этому времени мышцы полностью отреагировали на препарат, и видно, где нужна коррекция.",
        en: "First changes are felt on day 2-3 as the muscles start to \"settle\". The full effect unfolds by day 7-14. That's why GENEVITY schedules the follow-up two weeks later: by then the muscles have fully responded and any needed correction becomes visible.",
      },
    },
    {
      question: {
        uk: "Чи можна поєднувати ботулінотерапію з іншими косметологічними процедурами?",
        ru: "Можно ли сочетать ботулинотерапию с другими косметологическими процедурами?",
        en: "Can I combine it with other cosmetology treatments?",
      },
      answer: {
        uk: "Так, у переважній більшості випадків ботулінотерапія чудово поєднується з іншими процедурами — і часто саме комплекс дає найбільш природний результат. Ботокс + біоревіталізація — класика для зморшок на чолі та навколо очей. Ботокс + філери (контурна пластика) — при глибоких носогубних складках. Ботокс + апаратні процедури (HydraFacial, EXION, Ultraformer) — для загального омолодження. Інтервали та послідовність підбираємо на консультації індивідуально.",
        ru: "Да, в подавляющем большинстве случаев ботулинотерапия прекрасно сочетается с другими процедурами — и часто именно комплекс даёт наиболее естественный результат. Ботокс + биоревитализация — классика для морщин на лбу и вокруг глаз. Ботокс + филлеры (контурная пластика) — при глубоких носогубных складках. Ботокс + аппаратные процедуры (HydraFacial, EXION, Ultraformer) — для общего омоложения. Интервалы и последовательность подбираем на консультации индивидуально.",
        en: "Yes, in most cases botulinum therapy combines beautifully with other procedures — and a combined approach often delivers the most natural-looking result. Botulinum + biorevitalisation is a classic for forehead and eye-area lines. Botulinum + fillers works for deep nasolabial folds. Botulinum + apparatus treatments (HydraFacial, EXION, Ultraformer) for overall rejuvenation. We choose the intervals and sequence individually during consultation.",
      },
    },
    {
      question: {
        uk: "Скільки триває реабілітаційний період після ін'єкцій ботулотоксину?",
        ru: "Сколько длится реабилитационный период после инъекций ботулотоксина?",
        en: "How long is the downtime?",
      },
      answer: {
        uk: "Соціальна реабілітація — відсутня. Після уколів можна відразу повертатись до звичайних справ. Обмеження стосуються лише перших 24 годин: без фізичних навантажень, сауни, басейну, солярію, масажу обличчя, горизонтального положення перші 4 години. Макіяж — через 2 години. Невеликі точкові почервоніння у місцях ін'єкцій проходять за 30–60 хвилин.",
        ru: "Социальная реабилитация — отсутствует. После уколов можно сразу возвращаться к обычным делам. Ограничения касаются только первых 24 часов: без физических нагрузок, сауны, бассейна, солярия, массажа лица, горизонтального положения первые 4 часа. Макияж — через 2 часа. Небольшие точечные покраснения в местах инъекций проходят за 30–60 минут.",
        en: "No social downtime — you can return to normal activities immediately. Restrictions only apply for the first 24 hours: no sports, sauna, pool, tanning, facial massage, or lying flat for the first 4 hours. Makeup after 2 hours. Small pinpoint redness at injection sites resolves within 30-60 minutes.",
      },
    },
    {
      question: {
        uk: "Скільки тримається ефект від ботулінотерапії?",
        ru: "Сколько держится эффект от ботулинотерапии?",
        en: "How long does the effect last?",
      },
      answer: {
        uk: "У середньому — 4–6 місяців. На тривалість впливають сила мімічних м'язів (чим активніша міміка, тим швидше повертається), тип препарату, метаболізм, спосіб життя (спорт, сауна, сонце). З кожною наступною процедурою м'язова пам'ять слабшає, і ефект починає триматись довше.",
        ru: "В среднем — 4–6 месяцев. На длительность влияют сила мимических мышц (чем активнее мимика, тем быстрее возвращается), тип препарата, метаболизм, образ жизни (спорт, сауна, солнце). С каждой следующей процедурой мышечная память слабеет, и эффект начинает держаться дольше.",
        en: "On average, four to six months. Duration depends on muscle strength (more active expression means faster return), the preparation used, metabolism and lifestyle (sport, sauna, sun exposure). With each repeat session muscle memory weakens and the effect lasts longer.",
      },
    },
    {
      question: {
        uk: "Які протипоказання до ботулінотерапії?",
        ru: "Какие противопоказания к ботулинотерапии?",
        en: "What are the contraindications?",
      },
      answer: {
        uk: "Абсолютні: вагітність і грудне вигодовування, міастенія та інші нервово-м'язові захворювання, гіперчутливість до ботулотоксину, активні запальні процеси у зоні ін'єкції, злоякісні новоутворення в активній фазі. Відносні (вимагають додаткової оцінки): прийом антикоагулянтів чи аміноглікозидів, загострення хронічних станів, активний герпес, вік до 18 років, порушення згортання крові. Повний перелік обов'язково звіряємо на консультації.",
        ru: "Абсолютные: беременность и грудное вскармливание, миастения и другие нервно-мышечные заболевания, гиперчувствительность к ботулотоксину, активные воспалительные процессы в зоне инъекции, злокачественные новообразования в активной фазе. Относительные (требуют дополнительной оценки): приём антикоагулянтов или аминогликозидов, обострение хронических состояний, активный герпес, возраст до 18 лет, нарушения свёртываемости крови. Полный перечень обязательно сверяем на консультации.",
        en: "Absolute: pregnancy and breastfeeding, myasthenia and other neuromuscular disorders, hypersensitivity to botulinum toxin, active inflammation in the injection area, active-phase malignancies. Relative (need additional assessment): ongoing anticoagulant or aminoglycoside therapy, flare-ups of chronic disease, active herpes, age under 18, clotting disorders. The full list is reviewed during consultation.",
      },
    },
    {
      question: {
        uk: "Скільки коштують уколи ботоксу у Дніпрі?",
        ru: "Сколько стоят уколы ботокса в Днепре?",
        en: "How much do botox injections cost in Dnipro?",
      },
      answer: {
        uk: "Ціна залежить від препарату, кількості зон та індивідуальної дози. Орієнтовна вартість однієї зони вказана у нашому прайсі; комплекс із 2–3 зон пропонуємо за більш вигідною ціною за одиницю. Бруксизм і гіпергідроз рахуються окремо, бо вимагають більшої кількості одиниць. Точну ціну для вашого обличчя лікар озвучує на консультації після огляду.",
        ru: "Цена зависит от препарата, количества зон и индивидуальной дозы. Ориентировочная стоимость одной зоны указана в нашем прайсе; комплекс из 2–3 зон предлагаем по более выгодной цене за единицу. Бруксизм и гипергидроз считаются отдельно, так как требуют большего количества единиц. Точную цену для вашего лица врач озвучивает на консультации после осмотра.",
        en: "Price depends on the preparation, the number of zones and the individual dose. Single-zone pricing is on our list; a package of 2-3 zones is at a better per-unit rate. Bruxism and hyperhidrosis are quoted separately, as they require more units. The exact price for your face is given during the consultation.",
      },
    },
  ],
};

/* ────────────────────────────────────────────────────────────────
 * 2. БІОРЕВІТАЛІЗАЦІЯ
 *    Cluster: біоревіталізація обличчя (1000), біоревіталізація ціна
 *    (1000), протипоказання (50), процедура (70) + 10 long-tails
 * ──────────────────────────────────────────────────────────────── */
const biorev: ServiceCopy = {
  slug: "biorevitalisation",
  summary: {
    uk: "Біоревіталізація у GENEVITY — курс ін'єкцій чистої нестабілізованої гіалуронової кислоти, які повертають шкірі щільність, зволоженість і власне світіння. Не змінюємо рис обличчя — відновлюємо якість шкіри зсередини.",
    ru: "Биоревитализация в GENEVITY — курс инъекций чистой нестабилизированной гиалуроновой кислоты, которые возвращают коже плотность, увлажнённость и собственное сияние. Не меняем черты лица — восстанавливаем качество кожи изнутри.",
    en: "Biorevitalisation at GENEVITY — a course of pure non-stabilised hyaluronic acid injections that restore skin density, hydration and inner glow. We don't reshape the face — we rebuild skin quality from within.",
  },
  sections: [
    {
      heading: {
        uk: "Що таке біоревіталізація",
        ru: "Что такое биоревитализация",
        en: "What biorevitalisation is",
      },
      body: {
        uk: "Біоревіталізація — це процедура ін'єкційного омолодження шкіри чистою нестабілізованою гіалуроновою кислотою з низькою або середньою молекулярною вагою. На відміну від філерів, препарат не утворює «подушки» і не змінює рельєф — він глибоко зволожує шкіру, активує власну фібробластну активність і запускає синтез колагену й еластину.\n\nУ центрі естетичної медицини GENEVITY у Дніпрі ми працюємо з преміум-препаратами: Juvederm Volite, Restylane Vital, Princess Rich, IAL-System — обираємо відповідно до стану вашої шкіри, віку та зон роботи. Процедура підходить для обличчя, шиї, декольте, внутрішньої поверхні рук, зони навколо очей.\n\nРезультат: пружніша, зволоженіша, сяюча шкіра з рівнішим тоном і зменшенням тонких мімічних зморшок. Після курсу з 2–4 процедур ефект тримається 6–12 місяців залежно від початкового стану шкіри та способу життя.",
        ru: "Биоревитализация — это процедура инъекционного омоложения кожи чистой нестабилизированной гиалуроновой кислотой с низкой или средней молекулярной массой. В отличие от филлеров, препарат не образует «подушки» и не меняет рельеф — он глубоко увлажняет кожу, активирует собственную фибробластную активность и запускает синтез коллагена и эластина.\n\nВ центре эстетической медицины GENEVITY в Днепре мы работаем с премиум-препаратами: Juvederm Volite, Restylane Vital, Princess Rich, IAL-System — выбираем в соответствии с состоянием вашей кожи, возрастом и зонами работы. Процедура подходит для лица, шеи, декольте, внутренней поверхности рук, зоны вокруг глаз.\n\nРезультат: упругая, увлажнённая, сияющая кожа с ровным тоном и уменьшением тонких мимических морщин. После курса из 2–4 процедур эффект держится 6–12 месяцев в зависимости от исходного состояния кожи и образа жизни.",
        en: "Biorevitalisation is an injectable skin-rejuvenation procedure using pure non-stabilised hyaluronic acid of low or medium molecular weight. Unlike fillers, the product doesn't form a \"cushion\" or reshape the face — it hydrates the skin deeply, activates the fibroblasts and triggers the synthesis of collagen and elastin.\n\nAt GENEVITY aesthetic medicine centre in Dnipro we work with premium preparations — Juvederm Volite, Restylane Vital, Princess Rich, IAL-System — matching the choice to your skin condition, age and treatment area. The procedure suits the face, neck, décolleté, inner arms and the area around the eyes.\n\nThe result: firmer, more hydrated, glowing skin with an evener tone and softened fine expression lines. After a course of 2-4 sessions the effect lasts 6-12 months depending on your baseline skin condition and lifestyle.",
      },
      calloutBody: {
        uk: "Різниця між філером і біоревіталізацією проста: філер додає обсяг у конкретну зону, біоревіталізація — покращує якість шкіри на всій ділянці. Це не конкуруючі процедури, це різні інструменти.",
        ru: "Разница между филлером и биоревитализацией простая: филлер добавляет объём в конкретную зону, биоревитализация — улучшает качество кожи на всём участке. Это не конкурирующие процедуры, это разные инструменты.",
        en: "The difference between a filler and biorevitalisation is straightforward: filler adds volume to a specific zone, biorevitalisation improves skin quality across the whole treated area. They're not competing procedures — they're different tools.",
      },
    },
    {
      heading: {
        uk: "Переваги біоревіталізації",
        ru: "Преимущества биоревитализации",
        en: "What you gain",
      },
      body: {
        uk: "Біоревіталізація — одна з найбільш універсальних процедур ін'єкційної косметології. Головні переваги:\n\n— Глибоке зволоження. Гіалуронова кислота працює у шарах шкіри, недосяжних для кремів. Якість шкіри змінюється вже після першої процедури, тривалий ефект — після курсу.\n\n— Стимуляція власних ресурсів шкіри. Препарат не замінює колаген і еластин — він запускає їхнє вироблення. Шкіра тренується регенерувати сама.\n\n— Природний вигляд. Біоревіталізація не змінює риси, не додає об'єму в неправильних місцях, не створює «ефекту маски». Рідко хто здогадується про процедуру — видно лише результат.\n\n— Підходить майже всім. Від 25 років при профілактиці першого фотостаріння; у 35+ — при зневодненні та перших мімічних зморшках; у 45+ — як підтримка комплексного омолодження разом із ботулінотерапією або апаратними процедурами.\n\n— Комбінується з усім. Біоревіталізація — базовий шар в комплексних програмах: прекрасно працює з ботулотоксином, філерами, пілінгами, апаратним RF-ліфтингом.\n\n— Всесезонність. Процедуру можна робити в будь-яку пору року, включно з літом — достатньо уникати активного сонця 2 тижні після сеансу.",
        ru: "Биоревитализация — одна из самых универсальных процедур инъекционной косметологии. Главные преимущества:\n\n— Глубокое увлажнение. Гиалуроновая кислота работает в слоях кожи, недоступных для кремов. Качество кожи меняется уже после первой процедуры, устойчивый эффект — после курса.\n\n— Стимуляция собственных ресурсов кожи. Препарат не заменяет коллаген и эластин — он запускает их выработку. Кожа тренируется регенерировать сама.\n\n— Естественный вид. Биоревитализация не меняет черты, не добавляет объём в неправильных местах, не создаёт «эффекта маски». Редко кто догадывается о процедуре — виден только результат.\n\n— Подходит почти всем. От 25 лет при профилактике первого фотостарения; в 35+ — при обезвоживании и первых мимических морщинах; в 45+ — как поддержка комплексного омоложения вместе с ботулинотерапией или аппаратными процедурами.\n\n— Комбинируется со всем. Биоревитализация — базовый слой в комплексных программах: прекрасно работает с ботулотоксином, филлерами, пилингами, аппаратным RF-лифтингом.\n\n— Всесезонность. Процедуру можно делать в любое время года, включая лето — достаточно избегать активного солнца 2 недели после сеанса.",
        en: "Biorevitalisation is one of the most versatile procedures in injectable cosmetology. The main advantages:\n\n— Deep hydration. Hyaluronic acid works in skin layers that creams can't reach. Skin quality changes after the first session, a lasting effect after the full course.\n\n— Stimulates your skin's own resources. The product doesn't replace collagen and elastin — it triggers their production. The skin learns to regenerate on its own.\n\n— Natural look. Biorevitalisation doesn't change features, doesn't add volume where it shouldn't, and doesn't create a \"mask effect\". People rarely notice the procedure — they only see the result.\n\n— Suits almost everyone. From 25 as early photo-ageing prevention; 35+ for dehydration and first expression lines; 45+ as support for a complex rejuvenation plan alongside botulinum therapy or apparatus treatments.\n\n— Combines with everything. Biorevitalisation is the base layer in complex programs — it pairs beautifully with botulinum toxin, fillers, peels and RF lifting.\n\n— Year-round. Suitable any season including summer — just avoid direct sun exposure for two weeks after each session.",
      },
      calloutBody: {
        uk: "Ціна біоревіталізації у Дніпрі варіюється в рази між клініками. Різниця — у препараті. Ми ніколи не працюємо з сірими постачальниками й не відновлюємо флакони: кожен препарат ми відкриваємо при вас, з оригінальною упаковкою, серійним номером і сертифікатом.",
        ru: "Цена биоревитализации в Днепре варьируется в разы между клиниками. Разница — в препарате. Мы никогда не работаем с серыми поставщиками и не восстанавливаем флаконы: каждый препарат мы открываем при вас, с оригинальной упаковкой, серийным номером и сертификатом.",
        en: "Biorevitalisation prices in Dnipro vary widely between clinics. The difference is in the preparation. We never work with grey-market suppliers and never reconstitute vials — every product is opened in your presence with its original packaging, serial number and certificate.",
      },
    },
    {
      heading: {
        uk: "Показання та протипоказання",
        ru: "Показания и противопоказания",
        en: "Indications and contraindications",
      },
      body: {
        uk: "Показання до біоревіталізації:\n— зневоднена, тьмяна шкіра з втратою пружності;\n— дрібні мімічні зморшки, особливо у зоні навколо очей і губ;\n— ознаки фотостаріння (шкіра після активного сонця);\n— підготовка шкіри до пластики, лазерного шліфування або глибокого пілінгу;\n— реабілітація після інтенсивних апаратних процедур;\n— попередження вікових змін у 25–35 років;\n— комплексне омолодження у 35+ разом із ботулотоксином і філерами;\n— шкіра курців, людей з нестабільним режимом і тих, хто часто подорожує.\n\nПротипоказання до біоревіталізації:\n— вагітність та період лактації;\n— гіперчутливість до гіалуронової кислоти чи компонентів препарату;\n— активні вірусні чи бактеріальні інфекції у зоні ін'єкції;\n— аутоімунні захворювання у фазі загострення;\n— запалення, герпес, ранки, свіжі рубці у зоні введення;\n— прийом антикоагулянтів чи імунодепресантів;\n— онкологічні захворювання в активній фазі;\n— порушення згортання крові.\n\nПеред процедурою лікар проводить огляд, уточнює історію прийому ліків і алергічний анамнез. При перших процедурах рекомендуємо зробити алерготест з препаратом.",
        ru: "Показания к биоревитализации:\n— обезвоженная, тусклая кожа с потерей упругости;\n— мелкие мимические морщины, особенно в зоне вокруг глаз и губ;\n— признаки фотостарения (кожа после активного солнца);\n— подготовка кожи к пластике, лазерной шлифовке или глубокому пилингу;\n— реабилитация после интенсивных аппаратных процедур;\n— предупреждение возрастных изменений в 25–35 лет;\n— комплексное омоложение в 35+ вместе с ботулотоксином и филлерами;\n— кожа курящих, людей с нестабильным режимом и тех, кто часто путешествует.\n\nПротивопоказания к биоревитализации:\n— беременность и период лактации;\n— гиперчувствительность к гиалуроновой кислоте или компонентам препарата;\n— активные вирусные или бактериальные инфекции в зоне инъекции;\n— аутоиммунные заболевания в фазе обострения;\n— воспаления, герпес, ранки, свежие рубцы в зоне введения;\n— приём антикоагулянтов или иммунодепрессантов;\n— онкологические заболевания в активной фазе;\n— нарушения свёртываемости крови.\n\nПеред процедурой врач проводит осмотр, уточняет историю приёма лекарств и аллергический анамнез. При первых процедурах рекомендуем сделать аллерготест с препаратом.",
        en: "Indications: dehydrated, dull skin with loss of firmness; fine expression lines especially around the eyes and mouth; signs of photo-ageing; preparation before plastic surgery, laser resurfacing or deep peel; recovery after intensive apparatus treatments; prevention of age-related changes at 25-35; complex rejuvenation at 35+ combined with botulinum and fillers; smokers, people with unstable sleep schedules, frequent travellers.\n\nContraindications: pregnancy and lactation; hypersensitivity to hyaluronic acid or the preparation; active viral or bacterial infections in the injection area; autoimmune disorders in flare-up; inflammation, herpes, open wounds or fresh scars in the zone; ongoing anticoagulant or immunosuppressant therapy; active-phase oncology; clotting disorders.\n\nThe doctor reviews your medication history and allergies during consultation. For first-time patients we recommend an allergy test with the product.",
      },
      calloutBody: {
        uk: "Якщо вас турбують множинні алергії або у вас була реакція на косметологічні ін'єкції раніше — обов'язково скажіть лікарю. Проведемо тест на малій ділянці за 24–48 годин до процедури.",
        ru: "Если вас беспокоят множественные аллергии или у вас была реакция на косметологические инъекции ранее — обязательно скажите врачу. Проведём тест на малом участке за 24–48 часов до процедуры.",
        en: "If you have multiple allergies or have had a reaction to cosmetic injections before, tell the doctor. We'll run a skin test in a small area 24-48 hours before the procedure.",
      },
    },
    {
      heading: {
        uk: "Як проходить процедура біоревіталізації",
        ru: "Как проходит процедура биоревитализации",
        en: "How a biorevitalisation session runs",
      },
      body: {
        uk: "Процедура триває 30–60 хвилин залежно від площі обробки та техніки введення. Основні етапи:\n\n1. Консультація і діагностика. Лікар оцінює тип шкіри, ступінь зневоднення, наявність тонких зморшок, загальний тонус. Разом обираємо препарат і техніку.\n\n2. Підготовка. Демакіяж, обробка антисептиком, нанесення анестезуючого крему на 15–20 хвилин (за бажанням). Для більшості пацієнтів анестезія приємна, але необов'язкова.\n\n3. Техніка введення. Використовуємо три основні техніки залежно від зони:\n— папульна (мікропапули на поверхні шкіри);\n— лінійно-ретроградна (для зон із тонкою шкірою — повіки, губи);\n— канюльна (для зон з високим ризиком судинних уражень — навколо очей, виски).\n\n4. Постпроцедурний догляд. Після процедури — заспокійлива маска або крем. Протягом 24 годин: без сауни, басейну, спорту, масажу обличчя, активного сонця. Папули розсмоктуються за 24–48 годин.\n\n5. Курс. Оптимальний курс — 2–4 процедури з інтервалом 2–4 тижні. Після — підтримка 1 раз на 4–6 місяців залежно від стану шкіри.",
        ru: "Процедура длится 30–60 минут в зависимости от площади обработки и техники введения. Основные этапы:\n\n1. Консультация и диагностика. Врач оценивает тип кожи, степень обезвоженности, наличие тонких морщин, общий тонус. Вместе выбираем препарат и технику.\n\n2. Подготовка. Демакияж, обработка антисептиком, нанесение анестезирующего крема на 15–20 минут (по желанию). Для большинства пациентов анестезия приятна, но необязательна.\n\n3. Техника введения. Используем три основные техники в зависимости от зоны:\n— папульная (микропапулы на поверхности кожи);\n— линейно-ретроградная (для зон с тонкой кожей — веки, губы);\n— канюльная (для зон с высоким риском сосудистых повреждений — вокруг глаз, виски).\n\n4. Постпроцедурный уход. После процедуры — успокаивающая маска или крем. В течение 24 часов: без сауны, бассейна, спорта, массажа лица, активного солнца. Папулы рассасываются за 24–48 часов.\n\n5. Курс. Оптимальный курс — 2–4 процедуры с интервалом 2–4 недели. После — поддержка 1 раз в 4–6 месяцев в зависимости от состояния кожи.",
        en: "A session takes 30-60 minutes depending on the area and the injection technique.\n\n1. Consultation and diagnosis. The doctor evaluates skin type, hydration level, fine lines and overall tone. Together we choose the product and technique.\n\n2. Preparation. Makeup removal, antiseptic, topical anaesthetic cream for 15-20 minutes (optional — most patients find it pleasant but not essential).\n\n3. Technique. Three main approaches depending on the zone:\n— papular (microdeposits on the skin surface);\n— linear retrograde (for thin-skinned zones — eyelids, lips);\n— cannula (for areas with high vascular risk — around the eyes, temples).\n\n4. Aftercare. A calming mask or cream right after. For 24 hours: no sauna, pool, sport, facial massage or active sun exposure. Papules resolve within 24-48 hours.\n\n5. Course. An optimal course is 2-4 sessions with 2-4 week intervals. Maintenance every 4-6 months afterwards depending on skin condition.",
      },
      calloutBody: {
        uk: "Папули — це ті мікроскопічні «укуси» на шкірі, які з'являються після процедури. Це не побічний ефект, а спосіб працює техніка: препарат депонується у верхніх шарах, де має стимулювати колагеноутворення. Вони розсмоктуються за 24–48 годин.",
        ru: "Папулы — это те микроскопические «укусы» на коже, которые появляются после процедуры. Это не побочный эффект, а то, как работает техника: препарат депонируется в верхних слоях, где должен стимулировать коллагенообразование. Они рассасываются за 24–48 часов.",
        en: "The tiny \"bite\" marks on the skin after a session are papules. They're not a side effect — they're how the technique works: the product is deposited in the upper layers where it triggers collagen synthesis. They resolve within 24-48 hours.",
      },
    },
    {
      heading: {
        uk: "Результати та ефективність",
        ru: "Результаты и эффективность",
        en: "Results and effectiveness",
      },
      body: {
        uk: "Перші результати помітні вже після першої процедури: шкіра виглядає свіжішою, зволоженішою, отримує природне сяйво. Але справжній ефект біоревіталізації — накопичувальний. Після курсу з 2–4 процедур:\n\n— Шкіра стає щільнішою, пружнішою, краще тримає форму;\n— Зменшується виразність дрібних зморшок (особливо мімічних і зневоднення);\n— Покращується колір обличчя — зникає сірий відтінок, шкіра світиться зсередини;\n— Пори стають візуально меншими, рельєф шкіри рівнішим;\n— Зростає еластичність — пощипування шкіри залишає менше слідів.\n\nТривалість ефекту — 6–12 місяців залежно від препарату, площі обробки та вашого способу життя. Для підтримки рекомендуємо одну процедуру кожні 4–6 місяців. Люди, які почали регулярно робити біоревіталізацію у 28–35 років, часто «відстають» від своїх однолітків на 5–7 років візуально.",
        ru: "Первые результаты заметны уже после первой процедуры: кожа выглядит свежее, увлажнённее, получает естественное сияние. Но настоящий эффект биоревитализации — накопительный. После курса из 2–4 процедур:\n\n— Кожа становится плотнее, упруже, лучше держит форму;\n— Уменьшается выраженность мелких морщин (особенно мимических и обезвоживания);\n— Улучшается цвет лица — исчезает серый оттенок, кожа светится изнутри;\n— Поры становятся визуально меньше, рельеф кожи ровнее;\n— Возрастает эластичность — пощипывание кожи оставляет меньше следов.\n\nДлительность эффекта — 6–12 месяцев в зависимости от препарата, площади обработки и вашего образа жизни. Для поддержки рекомендуем одну процедуру каждые 4–6 месяцев. Люди, которые начали регулярно делать биоревитализацию в 28–35 лет, часто «отстают» от своих сверстников на 5–7 лет визуально.",
        en: "First results are visible after the first session — skin looks fresher, more hydrated, with a natural glow. But the real effect of biorevitalisation is cumulative. After a course of 2-4 sessions:\n\n— Skin becomes denser and firmer, holds its shape better;\n— Fine lines soften, particularly expression and dehydration lines;\n— Complexion brightens — the grey undertone lifts, skin glows from within;\n— Pores appear visually smaller, skin texture evens out;\n— Elasticity increases — skin bounces back faster when pinched.\n\nThe effect lasts 6-12 months depending on the product, the treated area and lifestyle. For maintenance we recommend one session every 4-6 months. Patients who start regular biorevitalisation at 28-35 often look 5-7 years younger than their peers later on.",
      },
      calloutBody: {
        uk: "Біоревіталізація — це інвестиція в шкіру, не чарівна паличка. Результат завжди сильніший у тих, хто після процедури береже шкіру: сонцезахист 30+ щодня, достатньо сну, мінімум алкоголю, якісні базові засоби. Інакше препарат працює наполовину.",
        ru: "Биоревитализация — это инвестиция в кожу, не волшебная палочка. Результат всегда сильнее у тех, кто после процедуры бережёт кожу: солнцезащита 30+ ежедневно, достаточно сна, минимум алкоголя, качественные базовые средства. Иначе препарат работает наполовину.",
        en: "Biorevitalisation is an investment in your skin, not a magic wand. Results are always stronger for those who protect the skin between sessions: daily SPF 30+, enough sleep, minimal alcohol, quality basic skincare. Without that, the product only works halfway.",
      },
    },
  ],
  faq: [
    {
      question: {
        uk: "Скільки триває ефект від біоревіталізації?",
        ru: "Сколько держится эффект от биоревитализации?",
        en: "How long does biorevitalisation last?",
      },
      answer: {
        uk: "Ефект від одиничної процедури видно 3–4 тижні. Після повного курсу (2–4 процедури з інтервалом 2–4 тижні) результат тримається 6–12 місяців. Точна тривалість залежить від препарату, вашого віку, стану шкіри на старті, способу життя та догляду. Для підтримки рекомендуємо одну процедуру кожні 4–6 місяців.",
        ru: "Эффект от одиночной процедуры виден 3–4 недели. После полного курса (2–4 процедуры с интервалом 2–4 недели) результат держится 6–12 месяцев. Точная длительность зависит от препарата, вашего возраста, состояния кожи на старте, образа жизни и ухода. Для поддержки рекомендуем одну процедуру каждые 4–6 месяцев.",
        en: "A single session shows effects for 3-4 weeks. A full course (2-4 sessions with 2-4 week intervals) lasts 6-12 months. Duration depends on the preparation, age, baseline skin, lifestyle and skincare. We recommend maintenance every 4-6 months.",
      },
    },
    {
      question: {
        uk: "Чи можна поєднувати біоревіталізацію з іншими косметологічними процедурами?",
        ru: "Можно ли сочетать биоревитализацию с другими косметологическими процедурами?",
        en: "Can biorevitalisation be combined with other treatments?",
      },
      answer: {
        uk: "Так, біоревіталізація — базова процедура в комплексному омолодженні. Найчастіше поєднуємо з ботулінотерапією (ботокс для мімічних зморшок + біоревіталізація для якості шкіри — класичний тандем), з філерами для відновлення об'єму, з апаратними процедурами (HydraFacial, EXION, Ultraformer) та пілінгами. Інтервали між процедурами: 1–2 тижні для комфорту шкіри. Точну послідовність підбираємо на консультації.",
        ru: "Да, биоревитализация — базовая процедура в комплексном омоложении. Чаще всего сочетаем с ботулинотерапией (ботокс для мимических морщин + биоревитализация для качества кожи — классический тандем), с филлерами для восстановления объёма, с аппаратными процедурами (HydraFacial, EXION, Ultraformer) и пилингами. Интервалы между процедурами: 1–2 недели для комфорта кожи. Точную последовательность подбираем на консультации.",
        en: "Yes — biorevitalisation is a foundation procedure in complex rejuvenation. It pairs most often with botulinum therapy (botox for expression lines + biorevitalisation for skin quality is a classic combination), fillers for volume restoration, apparatus treatments (HydraFacial, EXION, Ultraformer) and peels. Intervals are typically 1-2 weeks for skin comfort; the exact sequence is planned during consultation.",
      },
    },
    {
      question: {
        uk: "Який реабілітаційний період після біоревіталізації?",
        ru: "Какой реабилитационный период после биоревитализации?",
        en: "What's the downtime after biorevitalisation?",
      },
      answer: {
        uk: "Соціальної реабілітації практично немає. Після процедури на шкірі видно папули — маленькі горбочки в місцях ін'єкцій. Вони розсмоктуються за 24–48 годин. Протягом 24 годин: без сауни, басейну, спорту, масажу обличчя, солярію. 2 тижні — активний сонцезахист (SPF 30+). Макіяж — через 6 годин. Більшість пацієнтів повертаються на роботу вже наступного дня.",
        ru: "Социальной реабилитации практически нет. После процедуры на коже видны папулы — маленькие бугорки в местах инъекций. Они рассасываются за 24–48 часов. В течение 24 часов: без сауны, бассейна, спорта, массажа лица, солярия. 2 недели — активная солнцезащита (SPF 30+). Макияж — через 6 часов. Большинство пациентов возвращаются на работу уже на следующий день.",
        en: "Social downtime is minimal. The papules — small bumps at injection sites — resolve within 24-48 hours. For 24 hours: no sauna, pool, sport, facial massage or tanning. For two weeks: consistent SPF 30+. Makeup after 6 hours. Most patients return to work the next day.",
      },
    },
    {
      question: {
        uk: "Чи є вікові обмеження для проведення біоревіталізації?",
        ru: "Есть ли возрастные ограничения для проведения биоревитализации?",
        en: "Are there age limits for biorevitalisation?",
      },
      answer: {
        uk: "Формально процедуру роблять від 18 років, але по показаннях. До 25 років біоревіталізація рідко потрібна — лише якщо шкіра від природи суха чи зневоднена. Оптимальний старт — 28–35 років для профілактики. Верхньої межі немає: біоревіталізацію успішно роблять і в 60+, часто у комплексі з ботулотоксином і філерами.",
        ru: "Формально процедуру делают от 18 лет, но по показаниям. До 25 лет биоревитализация редко нужна — только если кожа от природы сухая или обезвоженная. Оптимальный старт — 28–35 лет для профилактики. Верхнего предела нет: биоревитализацию успешно делают и в 60+, часто в комплексе с ботулотоксином и филлерами.",
        en: "Formally the procedure is available from 18, but only by indication. Under 25 it's rarely needed — unless your skin is naturally dry or dehydrated. The optimal start is 28-35 as prevention. There's no upper limit: biorevitalisation works well at 60+ too, often alongside botulinum toxin and fillers.",
      },
    },
    {
      question: {
        uk: "Скільки коштує біоревіталізація у Дніпрі?",
        ru: "Сколько стоит биоревитализация в Днепре?",
        en: "What does biorevitalisation cost in Dnipro?",
      },
      answer: {
        uk: "Ціна залежить від препарату (Juvederm Volite, Restylane Vital, Princess Rich, IAL-System коштують по-різному), об'єму препарату (1 мл, 1,5 мл, 2 мл), площі обробки (тільки обличчя, обличчя + шия, повний «тріо»: обличчя + шия + декольте). Курс вигідніше: у GENEVITY пропонуємо пакет на 2–4 процедури за зниженою ціною за одиницю. Точну вартість для вашого плану розраховуємо на консультації.",
        ru: "Цена зависит от препарата (Juvederm Volite, Restylane Vital, Princess Rich, IAL-System стоят по-разному), объёма препарата (1 мл, 1,5 мл, 2 мл), площади обработки (только лицо, лицо + шея, полный «трио»: лицо + шея + декольте). Курс выгоднее: в GENEVITY предлагаем пакет на 2–4 процедуры по сниженной цене за единицу. Точную стоимость для вашего плана рассчитываем на консультации.",
        en: "Price depends on the preparation (Juvederm Volite, Restylane Vital, Princess Rich, IAL-System all price differently), volume (1 ml, 1.5 ml, 2 ml) and area (face only, face + neck, or the full face + neck + décolleté). The course rate is better: GENEVITY offers packages of 2-4 sessions at a reduced per-unit price. Exact cost is quoted during consultation.",
      },
    },
    {
      question: {
        uk: "Як швидко буде видно результат?",
        ru: "Как быстро будет виден результат?",
        en: "How quickly will I see results?",
      },
      answer: {
        uk: "Ефект свіжості шкіри видно вже через декілька годин після процедури, коли зникають папули. Справжній результат накопичується: через 2 тижні після першої процедури шкіра виглядає помітно здоровішою, через 2 місяці після повного курсу — шкіра виглядає на 5–7 років молодше, з кращою текстурою і сяйвом.",
        ru: "Эффект свежести кожи виден уже через несколько часов после процедуры, когда исчезают папулы. Настоящий результат накапливается: через 2 недели после первой процедуры кожа выглядит заметно здоровее, через 2 месяца после полного курса — кожа выглядит на 5–7 лет моложе, с лучшей текстурой и сиянием.",
        en: "Freshness is visible within a few hours once the papules settle. The real result is cumulative: two weeks after the first session the skin looks noticeably healthier; two months after a full course, 5-7 years younger with better texture and glow.",
      },
    },
  ],
};

/* ────────────────────────────────────────────────────────────────
 * 3. МЕЗОТЕРАПІЯ
 *    Cluster: мезотерапія обличчя (880), мезотерапія обличчя ціна
 *    (320), мезотерапія ціна (170), показання/протипоказання
 * ──────────────────────────────────────────────────────────────── */
const meso: ServiceCopy = {
  slug: "mesotherapy",
  summary: {
    uk: "Мезотерапія у GENEVITY — ін'єкції «коктейлів» з вітамінів, амінокислот, мікроелементів і пептидів, підібраних індивідуально. Працює з тьмяністю, зневодненням, перших зморшками, пігментацією, тонким волоссям. Не замінює гіалуронову кислоту — доповнює її, живлячи шкіру зсередини.",
    ru: "Мезотерапия в GENEVITY — инъекции «коктейлей» из витаминов, аминокислот, микроэлементов и пептидов, подобранных индивидуально. Работает с тусклостью, обезвоживанием, первыми морщинами, пигментацией, тонкими волосами. Не заменяет гиалуроновую кислоту — дополняет её, питая кожу изнутри.",
    en: "Mesotherapy at GENEVITY — injections of individually blended cocktails of vitamins, amino acids, trace elements and peptides. Works on dullness, dehydration, first lines, pigmentation, thinning hair. Doesn't replace hyaluronic acid — it complements it by feeding the skin from within.",
  },
  sections: [
    {
      heading: {
        uk: "Що таке мезотерапія обличчя",
        ru: "Что такое мезотерапия лица",
        en: "What mesotherapy is",
      },
      body: {
        uk: "Мезотерапія — це ін'єкційна процедура, при якій у середні шари шкіри вводять терапевтичний «коктейль» активних компонентів: вітамінів (A, C, E, групи B), амінокислот, мікроелементів (цинк, мідь, магній), пептидів, антиоксидантів, іноді — низькомолекулярної гіалуронової кислоти. Склад коктейлю підбирається під конкретну проблему — це головна відмінність від біоревіталізації, де препарат стандартний.\n\nМетод розроблений французьким лікарем Мішелем Пістором у 1950-х роках для лікування судинних і ревматичних захворювань; у косметології з 1970-х. За цей час мезотерапія пройшла шлях від експерименту до одного з найбільш персоналізованих інструментів сучасної естетичної медицини.\n\nУ GENEVITY, Дніпро, ми складаємо склад коктейлю на кожного пацієнта окремо — після оцінки стану шкіри, аналізу способу життя, розгляду попередніх процедур. Це дорожче, ніж використати стандартний препарат, — але результат набагато точніший.",
        ru: "Мезотерапия — это инъекционная процедура, при которой в средние слои кожи вводят терапевтический «коктейль» активных компонентов: витаминов (A, C, E, группы B), аминокислот, микроэлементов (цинк, медь, магний), пептидов, антиоксидантов, иногда — низкомолекулярной гиалуроновой кислоты. Состав коктейля подбирается под конкретную проблему — это главное отличие от биоревитализации, где препарат стандартный.\n\nМетод разработан французским врачом Мишелем Пистором в 1950-х годах для лечения сосудистых и ревматических заболеваний; в косметологии — с 1970-х. За это время мезотерапия прошла путь от эксперимента до одного из самых персонализированных инструментов современной эстетической медицины.\n\nВ GENEVITY, Днепр, мы составляем состав коктейля на каждого пациента отдельно — после оценки состояния кожи, анализа образа жизни, рассмотрения предыдущих процедур. Это дороже, чем использовать стандартный препарат, — но результат намного точнее.",
        en: "Mesotherapy is an injectable procedure that delivers a therapeutic cocktail of active ingredients into the middle layers of the skin — vitamins (A, C, E, B-complex), amino acids, trace elements (zinc, copper, magnesium), peptides, antioxidants, and sometimes low-molecular-weight hyaluronic acid. The cocktail is blended for a specific concern — that's the key difference from biorevitalisation, which uses a standard preparation.\n\nThe method was developed by the French physician Michel Pistor in the 1950s for vascular and rheumatic conditions; cosmetology adopted it in the 1970s. Since then mesotherapy has moved from experiment to one of the most personalised tools in modern aesthetic medicine.\n\nAt GENEVITY in Dnipro we blend a cocktail individually for each patient — after evaluating the skin, reviewing lifestyle, and assessing previous procedures. It's more expensive than using an off-the-shelf product — but the result is far more precise.",
      },
      calloutBody: {
        uk: "Мезотерапія не «лікує» шкіру. Вона дає шкірі те, чого їй не вистачає — вітаміни, амінокислоти, мікроелементи — напряму, в обхід кровотоку. Це біодобавка точного введення, а не магія.",
        ru: "Мезотерапия не «лечит» кожу. Она даёт коже то, чего ей не хватает — витамины, аминокислоты, микроэлементы — напрямую, в обход кровотока. Это биодобавка точного введения, а не магия.",
        en: "Mesotherapy doesn't \"heal\" the skin. It gives the skin what it lacks — vitamins, amino acids, trace elements — directly, bypassing circulation. Think of it as precise-delivery supplementation, not magic.",
      },
    },
    {
      heading: {
        uk: "Показання до мезотерапії",
        ru: "Показания к мезотерапии",
        en: "Indications",
      },
      body: {
        uk: "Мезотерапія працює з широким спектром станів шкіри. Основні показання:\n\n— тьмяна, втомлена шкіра з «сірим» відтінком;\n— зневоднення шкіри у будь-якому віці;\n— дрібні мімічні зморшки, особливо у зоні навколо очей і носогубному трикутнику;\n— перші ознаки фотостаріння;\n— гіперпігментація, поствуглеві плями, нерівний тон;\n— постакне, розширені пори;\n— зниження тонусу та пружності шкіри;\n— «синці» під очима судинного походження;\n— підготовка шкіри до активного літа чи після нього;\n— комплексне омолодження разом із біоревіталізацією, ботулотоксином, філерами;\n— профілактика старіння у 25–35 років.\n\nОкремий напрям — мезотерапія волосистої частини голови при випаданні волосся, посіченні, ламкості. Склад коктейлю тут зовсім інший — з мінералами, вітамінами групи B і стимуляторами росту.",
        ru: "Мезотерапия работает с широким спектром состояний кожи. Основные показания:\n\n— тусклая, уставшая кожа с «серым» оттенком;\n— обезвоживание кожи в любом возрасте;\n— мелкие мимические морщины, особенно в зоне вокруг глаз и носогубном треугольнике;\n— первые признаки фотостарения;\n— гиперпигментация, постугревые пятна, неровный тон;\n— постакне, расширенные поры;\n— снижение тонуса и упругости кожи;\n— «синяки» под глазами сосудистого происхождения;\n— подготовка кожи к активному лету или после него;\n— комплексное омоложение вместе с биоревитализацией, ботулотоксином, филлерами;\n— профилактика старения в 25–35 лет.\n\nОтдельное направление — мезотерапия волосистой части головы при выпадении волос, сечении, ломкости. Состав коктейля здесь совсем другой — с минералами, витаминами группы B и стимуляторами роста.",
        en: "Mesotherapy addresses a wide range of skin concerns:\n\n— dull, tired skin with a grey undertone;\n— dehydration at any age;\n— fine expression lines, especially around the eyes and nasolabial area;\n— early photo-ageing signs;\n— hyperpigmentation, post-acne marks, uneven tone;\n— post-acne texture and enlarged pores;\n— loss of tone and elasticity;\n— vascular-origin dark circles under the eyes;\n— skin preparation before or after an active summer;\n— complex rejuvenation with biorevitalisation, botulinum and fillers;\n— anti-ageing prevention at 25-35.\n\nA separate application is scalp mesotherapy for hair loss, brittleness and split ends. The cocktail here is quite different — with minerals, B-complex vitamins and growth stimulators.",
      },
      calloutBody: {
        uk: "Мезотерапія особливо цінна, коли шкіра перенесла стрес: після хвороби, тривалого перельоту, інтенсивного сонця. Це швидка «зарядка» для шкіри, яка відкриває дорогу для подальших процедур.",
        ru: "Мезотерапия особенно ценна, когда кожа перенесла стресс: после болезни, длительного перелёта, интенсивного солнца. Это быстрая «подзарядка» для кожи, которая открывает дорогу для последующих процедур.",
        en: "Mesotherapy is especially valuable when the skin has been through stress — after illness, a long flight, intense sun. It's a rapid recharge that paves the way for other procedures.",
      },
    },
    {
      heading: {
        uk: "Протипоказання та можливі побічні ефекти",
        ru: "Противопоказания и возможные побочные эффекты",
        en: "Contraindications and side effects",
      },
      body: {
        uk: "Протипоказання до мезотерапії обличчя:\n— вагітність та період грудного вигодовування;\n— гіперчутливість до компонентів коктейлю (алергія на будь-який вітамін, амінокислоту, консервант);\n— активні запальні процеси, герпес, рани у зоні ін'єкції;\n— інфекційні захворювання в активній фазі;\n— аутоімунні захворювання у фазі загострення;\n— онкологічні захворювання в активній фазі;\n— порушення згортання крові;\n— цукровий діабет у декомпенсованому стані;\n— прийом антикоагулянтів.\n\nМожливі побічні ефекти:\n— почервоніння у місцях ін'єкцій (до 24 годин);\n— набряклість (до 2 діб, рідко — до тижня);\n— невеликі гематоми (у 5–10% випадків, зникають за 4–7 днів);\n— болючість у місцях уколів (мінімальна, за 2–3 години зникає);\n— короткочасне підвищення температури (дуже рідко, при індивідуальній чутливості);\n— свербіж чи алергічна реакція (при гіперчутливості — за умови, якщо алерготест не проводився).\n\nСерйозні ускладнення при мезотерапії вкрай рідкісні за умови коректного підбору коктейлю, стерильної техніки і правильно зібраного анамнезу.",
        ru: "Противопоказания к мезотерапии лица:\n— беременность и период грудного вскармливания;\n— гиперчувствительность к компонентам коктейля (аллергия на любой витамин, аминокислоту, консервант);\n— активные воспалительные процессы, герпес, раны в зоне инъекции;\n— инфекционные заболевания в активной фазе;\n— аутоиммунные заболевания в фазе обострения;\n— онкологические заболевания в активной фазе;\n— нарушения свёртываемости крови;\n— сахарный диабет в декомпенсированном состоянии;\n— приём антикоагулянтов.\n\nВозможные побочные эффекты:\n— покраснение в местах инъекций (до 24 часов);\n— отёчность (до 2 суток, редко — до недели);\n— небольшие гематомы (в 5–10% случаев, исчезают за 4–7 дней);\n— болезненность в местах уколов (минимальная, за 2–3 часа исчезает);\n— кратковременное повышение температуры (очень редко, при индивидуальной чувствительности);\n— зуд или аллергическая реакция (при гиперчувствительности — при условии, если аллерготест не проводился).\n\nСерьёзные осложнения при мезотерапии крайне редки при условии корректного подбора коктейля, стерильной техники и правильно собранного анамнеза.",
        en: "Contraindications: pregnancy and breastfeeding; hypersensitivity to any cocktail ingredient (vitamin, amino acid, preservative); active inflammation, herpes, wounds in the injection zone; active-phase infectious disease; autoimmune flare-ups; active-phase oncology; clotting disorders; uncontrolled diabetes; anticoagulant therapy.\n\nPossible side effects: redness at injection sites (up to 24 hours); swelling (up to 2 days, rarely up to a week); small bruises (in 5-10% of cases, resolving in 4-7 days); mild injection-point tenderness (gone in 2-3 hours); brief fever (very rare, related to individual sensitivity); itching or allergic reaction (in cases of hypersensitivity without prior skin test).\n\nSerious complications are extremely rare when the cocktail is correctly blended, aseptic technique is observed, and the medical history is properly taken.",
      },
      calloutBody: {
        uk: "Якщо ви вперше робите мезотерапію і маєте алергію на будь-що — скажіть лікарю на консультації. Проведемо алерготест з коктейлем, який плануємо використовувати, за 24–48 годин до процедури.",
        ru: "Если вы впервые делаете мезотерапию и у вас есть аллергия на что-либо — скажите врачу на консультации. Проведём аллерготест с коктейлем, который планируем использовать, за 24–48 часов до процедуры.",
        en: "If it's your first mesotherapy and you have any allergies — mention it at consultation. We'll run a skin test with the exact cocktail we plan to use, 24-48 hours before the procedure.",
      },
    },
    {
      heading: {
        uk: "Як проходить процедура мезотерапії",
        ru: "Как проходит процедура мезотерапии",
        en: "How a mesotherapy session works",
      },
      body: {
        uk: "Процедура мезотерапії триває 30–45 хвилин. Основні етапи:\n\n1. Консультація та складання коктейлю. Лікар оцінює стан шкіри, обговорює з вами ваші цілі (зволоження, сяйво, боротьба з пігментацією, постакне), вивчає спосіб життя. На основі цього блендується індивідуальний коктейль із сертифікованих препаратів (Meso-Wharton, Dermaheal, Meline, BCN тощо).\n\n2. Підготовка. Демакіяж, очищення, обробка антисептиком. За бажанням — аплікаційна анестезія (лідокаїновий крем на 15 хвилин).\n\n3. Техніка введення. Використовуємо дві техніки залежно від зони:\n— мануальна (ручні ін'єкції тонкою голкою — більш точна, менше мікротравм);\n— мезороллер чи мезоінжектор (для великих зон, наприклад, декольте чи волосистої частини голови).\n\n4. Завершення процедури. Нанесення заспокійливої маски чи крему. Лікар проводить консультацію з догляду: 24 години без сауни, басейну, спорту, макіяжу; 2 тижні — активний SPF.\n\n5. Курс. Оптимальний курс — 4–10 процедур з інтервалом 7–14 днів залежно від коктейлю і мети. Підтримка — 1 процедура на 1–2 місяці.\n\nВиди мезотерапії за складом коктейлю: гідроревіталізуюча (для зневодненої шкіри), антивікова (з пептидами для старішої шкіри), проти пігментації (з вітаміном C, транексамовою кислотою), постакне (з антибіотиками, протизапальними), ліполітична (для локальної корекції жирових відкладень).",
        ru: "Процедура мезотерапии длится 30–45 минут. Основные этапы:\n\n1. Консультация и составление коктейля. Врач оценивает состояние кожи, обсуждает с вами ваши цели (увлажнение, сияние, борьба с пигментацией, постакне), изучает образ жизни. На основе этого блендируется индивидуальный коктейль из сертифицированных препаратов (Meso-Wharton, Dermaheal, Meline, BCN и др.).\n\n2. Подготовка. Демакияж, очищение, обработка антисептиком. По желанию — аппликационная анестезия (лидокаиновый крем на 15 минут).\n\n3. Техника введения. Используем две техники в зависимости от зоны:\n— мануальная (ручные инъекции тонкой иглой — более точная, меньше микротравм);\n— мезороллер или мезоинжектор (для больших зон, например, декольте или волосистой части головы).\n\n4. Завершение процедуры. Нанесение успокаивающей маски или крема. Врач проводит консультацию по уходу: 24 часа без сауны, бассейна, спорта, макияжа; 2 недели — активный SPF.\n\n5. Курс. Оптимальный курс — 4–10 процедур с интервалом 7–14 дней в зависимости от коктейля и цели. Поддержка — 1 процедура в 1–2 месяца.\n\nВиды мезотерапии по составу коктейля: гидроревитализирующая (для обезвоженной кожи), антивозрастная (с пептидами для зрелой кожи), против пигментации (с витамином C, транексамовой кислотой), постакне (с антибиотиками, противовоспалительными), липолитическая (для локальной коррекции жировых отложений).",
        en: "A mesotherapy session takes 30-45 minutes.\n\n1. Consultation and cocktail blend. The doctor evaluates the skin, discusses your goals (hydration, glow, pigmentation, post-acne) and lifestyle, then blends an individual cocktail from certified preparations (Meso-Wharton, Dermaheal, Meline, BCN and others).\n\n2. Preparation. Makeup removal, cleansing, antiseptic. Optional topical anaesthetic cream for 15 minutes.\n\n3. Technique. Two approaches depending on the zone:\n— manual (hand injections with a fine needle — most precise, less micro-trauma);\n— meso-roller or meso-injector (for larger areas like décolleté or scalp).\n\n4. Finish. Calming mask or cream. Aftercare briefing: 24 hours without sauna, pool, sport, makeup; two weeks of consistent SPF.\n\n5. Course. Optimal course is 4-10 sessions with 7-14 day intervals depending on the cocktail and goal. Maintenance: one session every 1-2 months.\n\nCocktail types by target: hydrating (dehydrated skin); anti-ageing (peptides for mature skin); anti-pigmentation (vitamin C, tranexamic acid); post-acne (antibiotic and anti-inflammatory components); lipolytic (localised fat correction).",
      },
      calloutBody: {
        uk: "Курс мезотерапії з 4–10 процедур здається довгим, але кожна процедура триває 30 хвилин і не має соціальної реабілітації. Багато пацієнтів роблять мезотерапію в обідню перерву.",
        ru: "Курс мезотерапии из 4–10 процедур кажется длинным, но каждая процедура длится 30 минут и не имеет социальной реабилитации. Многие пациенты делают мезотерапию в обеденный перерыв.",
        en: "A 4-10 session course sounds long, but each visit is 30 minutes with no social downtime. Many patients book mesotherapy on a lunch break.",
      },
    },
    {
      heading: {
        uk: "Результати та ефективність мезотерапії",
        ru: "Результаты и эффективность мезотерапии",
        en: "Results and effectiveness",
      },
      body: {
        uk: "Результати мезотерапії — накопичувальні. Перша процедура помітна як свіжість — шкіра виглядає відпочилою, сяючою, «підживленою». Справжній ефект розкривається на 3–4 процедурі:\n\n— шкіра помітно щільніша, пружніша;\n— тон вирівнюється — зникає сірий відтінок, з'являється рум'янець;\n— зменшуються тонкі зморшки (особливо мімічні навколо очей);\n— помітно скорочуються розширені пори;\n— покращується структура шкіри (при постакне, нерівностях);\n— зменшується виразність синців під очима;\n— пігментація стає менш помітною (при використанні відбілюючих коктейлів).\n\nПідготовка до процедури: за 3–5 днів відмова від аспірину та інших антикоагулянтів (якщо немає протипоказань), мінімум алкоголю, активного сонця, сауни. Не варто планувати процедуру перед важливою подією — при індивідуальній реакції можуть бути гематоми, які тривають 4–7 днів.\n\nРеабілітація після процедури: 24 години — обмеження фізичної активності, сауни, басейну, макіяжу; 2 тижні — активний SPF (30+); мінімум 1 літр чистої води на день (це посилює ефект коктейлю); м'яке очищення шкіри без скрабів протягом 5 днів.",
        ru: "Результаты мезотерапии — накопительные. Первая процедура заметна как свежесть — кожа выглядит отдохнувшей, сияющей, «подпитанной». Настоящий эффект раскрывается на 3–4 процедуре:\n\n— кожа заметно плотнее, упруже;\n— тон выравнивается — исчезает серый оттенок, появляется румянец;\n— уменьшаются тонкие морщины (особенно мимические вокруг глаз);\n— заметно сокращаются расширенные поры;\n— улучшается структура кожи (при постакне, неровностях);\n— уменьшается выраженность синяков под глазами;\n— пигментация становится менее заметной (при использовании отбеливающих коктейлей).\n\nПодготовка к процедуре: за 3–5 дней отказ от аспирина и других антикоагулянтов (если нет противопоказаний), минимум алкоголя, активного солнца, сауны. Не стоит планировать процедуру перед важным событием — при индивидуальной реакции могут быть гематомы, которые длятся 4–7 дней.\n\nРеабилитация после процедуры: 24 часа — ограничение физической активности, сауны, бассейна, макияжа; 2 недели — активный SPF (30+); минимум 1 литр чистой воды в день (это усиливает эффект коктейля); мягкое очищение кожи без скрабов в течение 5 дней.",
        en: "Results are cumulative. The first session is noticed as freshness — the skin looks rested, luminous, nourished. The real effect builds from sessions 3-4:\n\n— skin is visibly denser and firmer;\n— tone evens out — the grey cast clears, a healthy flush appears;\n— fine lines soften (especially expression lines around the eyes);\n— enlarged pores visibly shrink;\n— texture improves (useful for post-acne and unevenness);\n— dark circles under the eyes lighten;\n— pigmentation becomes less visible (with brightening cocktails).\n\nPreparation: 3-5 days without aspirin or other anticoagulants (unless contraindicated), minimal alcohol, no active sun or sauna. Don't plan the procedure before an important event — bruising can occur and last 4-7 days.\n\nRecovery: 24 hours without sport, sauna, pool or makeup; two weeks of SPF 30+; at least 1 litre of clean water daily (it amplifies the cocktail); gentle cleansing without scrubs for 5 days.",
      },
      calloutBody: {
        uk: "Мезотерапія не любить поспіху. Курс з 4–10 процедур дає стабільний, тривалий ефект — пропустити 1–2 процедури означає втратити накопичувальний результат. Плануйте курс на сезон без активних поїздок і стресу.",
        ru: "Мезотерапия не любит спешки. Курс из 4–10 процедур даёт стабильный, длительный эффект — пропустить 1–2 процедуры означает потерять накопительный результат. Планируйте курс на сезон без активных поездок и стресса.",
        en: "Mesotherapy doesn't reward haste. A 4-10 session course delivers stable, lasting results — skipping even 1-2 sessions loses the cumulative effect. Plan the course for a calm season without heavy travel.",
      },
    },
  ],
  faq: [
    {
      question: {
        uk: "Скільки триває ефект від мезотерапії обличчя?",
        ru: "Сколько держится эффект от мезотерапии лица?",
        en: "How long does facial mesotherapy last?",
      },
      answer: {
        uk: "Результат після повного курсу (4–10 процедур) тримається 6–12 місяців. Точна тривалість залежить від індивідуального обміну речовин, способу життя, стану шкіри на старті, сонячної активності. Для підтримки рекомендуємо 1 процедуру на 1–2 місяці.",
        ru: "Результат после полного курса (4–10 процедур) держится 6–12 месяцев. Точная длительность зависит от индивидуального обмена веществ, образа жизни, состояния кожи на старте, солнечной активности. Для поддержки рекомендуем 1 процедуру в 1–2 месяца.",
        en: "After a full course (4-10 sessions) the result holds for 6-12 months. Duration depends on individual metabolism, lifestyle, baseline skin and sun exposure. Maintenance: one session every 1-2 months.",
      },
    },
    {
      question: {
        uk: "Чи болюча процедура мезотерапії?",
        ru: "Болезненна ли процедура мезотерапии?",
        en: "Is mesotherapy painful?",
      },
      answer: {
        uk: "Відчуття — легкі поколювання і «печіння» у місцях ін'єкцій. Більшість пацієнтів не потребують анестезії. Для чутливих зон (повіки, губи) застосовуємо аплікаційну анестезію — лідокаїновий крем на 15 хвилин. Після нанесення анестетика відчуття практично відсутні. Для великих зон чи при зниженому больовому порозі можемо використати мезоінжектор — це швидше й менш болісно.",
        ru: "Ощущения — лёгкие покалывания и «жжение» в местах инъекций. Большинство пациентов не нуждаются в анестезии. Для чувствительных зон (веки, губы) применяем аппликационную анестезию — лидокаиновый крем на 15 минут. После нанесения анестетика ощущения практически отсутствуют. Для больших зон или при сниженном болевом пороге можем использовать мезоинжектор — это быстрее и менее болезненно.",
        en: "The sensation is light pinching and slight warmth at the injection points. Most patients don't need anaesthesia. For sensitive zones (eyelids, lips) we apply a lidocaine cream for 15 minutes — after that, sensation is almost absent. For larger zones or low pain tolerance we can use a meso-injector: faster and more comfortable.",
      },
    },
    {
      question: {
        uk: "Скільки сеансів мезотерапії необхідно для досягнення результату?",
        ru: "Сколько сеансов мезотерапии необходимо для достижения результата?",
        en: "How many mesotherapy sessions are needed?",
      },
      answer: {
        uk: "Мінімальний курс — 4 процедури; оптимальний — 6–8; для складних станів (виражена пігментація, глибоке постакне) — до 10 процедур. Інтервал між сеансами — 7–14 днів на початку курсу, 2–3 тижні на завершальному етапі. Перші помітні зміни — після 2-ї процедури, стабільний результат — після 4-ї. Лікар визначає оптимальну тривалість курсу індивідуально.",
        ru: "Минимальный курс — 4 процедуры; оптимальный — 6–8; для сложных состояний (выраженная пигментация, глубокое постакне) — до 10 процедур. Интервал между сеансами — 7–14 дней в начале курса, 2–3 недели на завершающем этапе. Первые заметные изменения — после 2-й процедуры, стабильный результат — после 4-й. Врач определяет оптимальную длительность курса индивидуально.",
        en: "Minimum course: 4 sessions; optimal: 6-8; for complex concerns (pronounced pigmentation, deep post-acne): up to 10. Intervals: 7-14 days early in the course, 2-3 weeks towards the end. First noticeable changes after the 2nd session, stable results after the 4th. The doctor defines the optimal course individually.",
      },
    },
    {
      question: {
        uk: "Чи можна поєднувати мезотерапію з іншими косметологічними процедурами?",
        ru: "Можно ли сочетать мезотерапию с другими косметологическими процедурами?",
        en: "Can mesotherapy be combined with other treatments?",
      },
      answer: {
        uk: "Так, мезотерапія відмінно поєднується з усіма базовими процедурами. Класичні поєднання: мезотерапія + ботулінотерапія (для комплексної роботи з усіма аспектами старіння); мезотерапія + біоревіталізація (накопичувальне зволоження і живлення); мезотерапія + апаратні процедури (HydraFacial, EXION, Ultraformer) — особливо ефективно після курсу мезо. Не рекомендуємо поєднувати мезо з лазерним шліфуванням і глибокими пілінгами в один день — робимо з інтервалом 2–4 тижні.",
        ru: "Да, мезотерапия отлично сочетается со всеми базовыми процедурами. Классические сочетания: мезотерапия + ботулинотерапия (для комплексной работы со всеми аспектами старения); мезотерапия + биоревитализация (накопительное увлажнение и питание); мезотерапия + аппаратные процедуры (HydraFacial, EXION, Ultraformer) — особенно эффективно после курса мезо. Не рекомендуем сочетать мезо с лазерной шлифовкой и глубокими пилингами в один день — делаем с интервалом 2–4 недели.",
        en: "Yes, mesotherapy combines well with all foundational procedures. Classic pairings: mesotherapy + botulinum (complex anti-ageing); mesotherapy + biorevitalisation (cumulative hydration and nourishment); mesotherapy + apparatus treatments (HydraFacial, EXION, Ultraformer) — particularly effective after a mesotherapy course. We don't combine mesotherapy with laser resurfacing or deep peels on the same day — 2-4 week intervals instead.",
      },
    },
    {
      question: {
        uk: "Скільки коштує мезотерапія обличчя у Дніпрі?",
        ru: "Сколько стоит мезотерапия лица в Днепре?",
        en: "How much does facial mesotherapy cost in Dnipro?",
      },
      answer: {
        uk: "Ціна мезотерапії залежить від складу коктейлю, площі обробки (обличчя, обличчя + шия, декольте, волосиста частина голови), техніки введення (мануальна / мезоінжектор). У GENEVITY вартість однієї процедури розраховується індивідуально після консультації; курс з 4–10 процедур пропонуємо за зниженою ціною за сеанс. Базова вартість однієї процедури зазначена у прайсі на цій сторінці.",
        ru: "Цена мезотерапии зависит от состава коктейля, площади обработки (лицо, лицо + шея, декольте, волосистая часть головы), техники введения (мануальная / мезоинжектор). В GENEVITY стоимость одной процедуры рассчитывается индивидуально после консультации; курс из 4–10 процедур предлагаем по сниженной цене за сеанс. Базовая стоимость одной процедуры указана в прайсе на этой странице.",
        en: "Price depends on the cocktail blend, area (face, face + neck, décolleté, scalp) and technique (manual or injector). At GENEVITY a single session price is quoted individually after consultation; a 4-10 session course is offered at a reduced per-session rate. Base single-session pricing is on the price list on this page.",
      },
    },
    {
      question: {
        uk: "Яка різниця між мезотерапією і біоревіталізацією?",
        ru: "В чём разница между мезотерапией и биоревитализацией?",
        en: "What's the difference between mesotherapy and biorevitalisation?",
      },
      answer: {
        uk: "Основна відмінність — у складі препарату. Біоревіталізація — це виключно гіалуронова кислота (з невеликими домішками), стандартний склад, глибоке зволоження. Мезотерапія — це індивідуально блендований коктейль із вітамінів, амінокислот, мікроелементів, пептидів, іноді з гіалуронкою. Біоревіталізація — більш «універсальна», мезотерапія — більш точна під конкретну проблему. У комплексному омолодженні ці процедури чудово доповнюють одна одну.",
        ru: "Основное отличие — в составе препарата. Биоревитализация — это исключительно гиалуроновая кислота (с небольшими примесями), стандартный состав, глубокое увлажнение. Мезотерапия — это индивидуально блендированный коктейль из витаминов, аминокислот, микроэлементов, пептидов, иногда с гиалуронкой. Биоревитализация — более «универсальная», мезотерапия — более точная под конкретную проблему. В комплексном омоложении эти процедуры прекрасно дополняют друг друга.",
        en: "The main difference is in the product. Biorevitalisation is pure hyaluronic acid (with small additives), standard formulation, deep hydration. Mesotherapy is an individually blended cocktail of vitamins, amino acids, trace elements, peptides, sometimes with hyaluronic. Biorevitalisation is more universal; mesotherapy is more precisely targeted at a specific concern. In a complex rejuvenation plan they complement each other beautifully.",
      },
    },
  ],
};

/* ────────────────────────────────────────────────────────────────
 * 4. ЕКЗОСОМИ
 *    Cluster: екзосоми (1600, low comp!), екзосоми для обличчя
 *    (1000), екзосомальна терапія (40) — huge SEO opportunity
 * ──────────────────────────────────────────────────────────────── */
const exosomes: ServiceCopy = {
  slug: "exosomes",
  summary: {
    uk: "Екзосомальна терапія у GENEVITY — одна з найсучасніших процедур регенеративної медицини: ін'єкції біоактивних наночастинок, які запускають шкіру відновлюватись зсередини. Глибока регенерація без синтетичних наповнювачів, підходить при постакне, рубцях, фотостарінні, випаданні волосся.",
    ru: "Экзосомальная терапия в GENEVITY — одна из самых современных процедур регенеративной медицины: инъекции биоактивных наночастиц, которые запускают кожу восстанавливаться изнутри. Глубокая регенерация без синтетических наполнителей, подходит при постакне, рубцах, фотостарении, выпадении волос.",
    en: "Exosomal therapy at GENEVITY — one of the most advanced regenerative-medicine procedures. Injections of bioactive nanoparticles that trigger the skin to rebuild itself from within. Deep regeneration without synthetic fillers — effective for post-acne, scarring, photo-ageing, hair loss.",
  },
  sections: [
    {
      heading: {
        uk: "Що таке екзосоми",
        ru: "Что такое экзосомы",
        en: "What exosomes are",
      },
      body: {
        uk: "Екзосоми — це мікроскопічні везикули діаметром 30–150 нанометрів, які кожна клітина нашого організму виділяє назовні для комунікації з іншими клітинами. Всередині екзосоми містять сигнальні молекули — фактори росту, мікроРНК, пептиди, ліпіди, антиоксиданти. Фактично, це «інструкції», які клітини передають одна одній про те, як відновлюватись, регенерувати, ділитись.\n\nЕкзосомальна терапія в косметології — це прицільне введення екзосом (зазвичай виділених зі стовбурових клітин людини чи рослин) у шкіру для запуску глибокого регенеративного процесу. Це не гіалуронова кислота і не філер: екзосоми не заповнюють простір і не додають об'єму. Вони вмикають власні механізми омолодження шкіри.\n\nУ GENEVITY, Дніпро, ми працюємо виключно з сертифікованими препаратами екзосом топових південнокорейських і американських виробників — Rejuran Healer Exosome, ASCE+, ExoCoBio. Кожен флакон приходить з серійним номером, сертифікатом походження і температурним логом.",
        ru: "Экзосомы — это микроскопические везикулы диаметром 30–150 нанометров, которые каждая клетка нашего организма выделяет наружу для коммуникации с другими клетками. Внутри экзосомы содержат сигнальные молекулы — факторы роста, микроРНК, пептиды, липиды, антиоксиданты. Фактически, это «инструкции», которые клетки передают друг другу о том, как восстанавливаться, регенерировать, делиться.\n\nЭкзосомальная терапия в косметологии — это прицельное введение экзосом (обычно выделенных из стволовых клеток человека или растений) в кожу для запуска глубокого регенеративного процесса. Это не гиалуроновая кислота и не филлер: экзосомы не заполняют пространство и не добавляют объём. Они включают собственные механизмы омоложения кожи.\n\nВ GENEVITY, Днепр, мы работаем исключительно с сертифицированными препаратами экзосом топовых южнокорейских и американских производителей — Rejuran Healer Exosome, ASCE+, ExoCoBio. Каждый флакон приходит с серийным номером, сертификатом происхождения и температурным логом.",
        en: "Exosomes are microscopic vesicles 30-150 nanometres in diameter that every cell in our body releases to communicate with other cells. Inside exosomes are signalling molecules — growth factors, microRNA, peptides, lipids, antioxidants. Effectively, they're the \"instructions\" cells send each other on how to recover, regenerate and divide.\n\nExosomal therapy in cosmetology is the targeted introduction of exosomes (usually isolated from human or plant stem cells) into the skin to trigger deep regeneration. It's not hyaluronic acid, not filler — exosomes don't fill space or add volume. They switch on the skin's own rejuvenation mechanisms.\n\nAt GENEVITY in Dnipro we work exclusively with certified preparations from top South Korean and American manufacturers — Rejuran Healer Exosome, ASCE+, ExoCoBio. Every vial arrives with a serial number, certificate of origin and temperature log.",
      },
      calloutBody: {
        uk: "Екзосомальна терапія — не про «додати» щось шкірі. Це про «нагадати» шкірі, як вона вміла себе відновлювати у 20 років. Саме тому її ще називають «молекулярним ліфтингом» — результат глибший і довший, ніж від процедур, що просто вводять активи.",
        ru: "Экзосомальная терапия — не про «добавить» что-то коже. Это про «напомнить» коже, как она умела себя восстанавливать в 20 лет. Именно поэтому её ещё называют «молекулярным лифтингом» — результат глубже и длительнее, чем от процедур, которые просто вводят активы.",
        en: "Exosomal therapy isn't about adding anything to the skin. It's about reminding the skin how it knew to repair itself at 20. That's why it's called a \"molecular lift\" — results run deeper and last longer than procedures that merely deliver actives.",
      },
    },
    {
      heading: {
        uk: "Застосування екзосом у косметології",
        ru: "Применение экзосом в косметологии",
        en: "How exosomes are used in cosmetology",
      },
      body: {
        uk: "Екзосомальна терапія для обличчя вирішує кілька проблем одночасно — регенерація шкіри, стимулювання колагену, зменшення запалення, вирівнювання тону. Основні показання:\n\n— фотостаріння: тонкі зморшки, втрата пружності, грубий тон шкіри;\n— постакне: атрофічні рубці, червоні плями, нерівний рельєф;\n— гіперпігментація: мелазма, поствуглеві плями, сонячні плями;\n— відновлення після агресивних процедур (лазерне шліфування, глибокі пілінги);\n— випадання волосся, ослаблення волосяних фолікулів (трихологічні показання);\n— шкіра після важкої хвороби, антибіотикотерапії, хіміотерапії — там, де потрібна глибока регенерація.\n\nОкремо — для зон, де інші процедури працюють слабо: шкіра повік, тильної поверхні рук, шиї.\n\nЕфекти екзосомальної терапії накопичуються — після повного курсу з 3–6 процедур шкіра:\n\n— стає помітно щільнішою, пружнішою, з відновленою еластичністю;\n— пори зменшуються, текстура шкіри вирівнюється;\n— зменшуються червоні плями, постакне-рубці робляться менш глибокими;\n— пігментація стає менш помітною;\n— «світіння» — не побічний ефект, а пряма ознака клітинного оновлення.",
        ru: "Экзосомальная терапия для лица решает несколько проблем одновременно — регенерация кожи, стимулирование коллагена, уменьшение воспаления, выравнивание тона. Основные показания:\n\n— фотостарение: тонкие морщины, потеря упругости, грубый тон кожи;\n— постакне: атрофические рубцы, красные пятна, неровный рельеф;\n— гиперпигментация: мелазма, постугревые пятна, солнечные пятна;\n— восстановление после агрессивных процедур (лазерная шлифовка, глубокие пилинги);\n— выпадение волос, ослабление волосяных фолликулов (трихологические показания);\n— кожа после тяжёлой болезни, антибиотикотерапии, химиотерапии — там, где нужна глубокая регенерация.\n\nОтдельно — для зон, где другие процедуры работают слабо: кожа век, тыльной поверхности рук, шеи.\n\nЭффекты экзосомальной терапии накапливаются — после полного курса из 3–6 процедур кожа:\n\n— становится заметно плотнее, упруже, с восстановленной эластичностью;\n— поры уменьшаются, текстура кожи выравнивается;\n— уменьшаются красные пятна, постакне-рубцы становятся менее глубокими;\n— пигментация становится менее заметной;\n— «свечение» — не побочный эффект, а прямой признак клеточного обновления.",
        en: "Exosomal facial therapy addresses several issues at once — regeneration, collagen stimulation, inflammation reduction, tone evening. Main indications:\n\n— photo-ageing: fine lines, loss of firmness, rough skin tone;\n— post-acne: atrophic scars, red marks, uneven texture;\n— hyperpigmentation: melasma, post-acne marks, sun spots;\n— recovery after aggressive procedures (laser resurfacing, deep peels);\n— hair loss and weakened follicles (trichology indications);\n— skin after serious illness, antibiotic or chemotherapy courses — wherever deep regeneration is needed.\n\nAnd specifically — for zones where other procedures underperform: eyelid skin, backs of the hands, neck.\n\nExosomal effects accumulate. After a course of 3-6 sessions the skin:\n\n— becomes noticeably denser and more elastic;\n— pores shrink and texture evens;\n— red marks fade and post-acne scars become shallower;\n— pigmentation lightens;\n— the \"glow\" isn't a side effect — it's a direct sign of cellular renewal.",
      },
      calloutBody: {
        uk: "Екзосоми — одна з найдорожчих процедур у нашому прайсі, і це чесно. Технологія виділення екзосом з стовбурових клітин складна, виробництво — в мінімальній кількості клінічних лабораторій світу. Але порівняно з тим, що екзосоми можуть замінити 3–4 різні процедури, це виправдана інвестиція.",
        ru: "Экзосомы — одна из самых дорогих процедур в нашем прайсе, и это честно. Технология выделения экзосом из стволовых клеток сложна, производство — в минимальном количестве клинических лабораторий мира. Но учитывая, что экзосомы могут заменить 3–4 разные процедуры, это оправданная инвестиция.",
        en: "Exosomes are among the more expensive procedures on our list — honestly so. The technology of isolating exosomes from stem cells is complex and production only happens in a handful of clinical labs worldwide. But when exosomes can replace 3-4 separate treatments, the investment makes sense.",
      },
    },
    {
      heading: {
        uk: "Процедура введення екзосом",
        ru: "Процедура введения экзосом",
        en: "How the exosomal procedure runs",
      },
      body: {
        uk: "Процедура екзосомальної терапії триває 60–90 хвилин. Основні етапи:\n\n1. Консультація і вибір препарату. Лікар оцінює стан шкіри, обговорює ваші очікування, підбирає препарат (регенеративний, antiage, лікування акне, трихологічний) і визначає оптимальний курс.\n\n2. Підготовка шкіри. Демакіяж, глибоке очищення, за потреби — м'який пілінг для кращого проникнення. Обов'язково — аплікаційна анестезія лідокаїновим кремом на 15–30 хвилин.\n\n3. Мікронідлінг або ін'єкції. Використовуємо дві техніки в залежності від мети:\n— мікронідлінг (dermapen або автомат на кшталт Dermapen 4): робимо мікроканали у шкірі глибиною 0,5–2 мм, після чого наносимо екзосомальний препарат — він проникає через канали у середні шари. Ідеально для глобальної регенерації;\n— прямі ін'єкції (частіше для зон навколо очей, губ, рубців): тонкою голкою препарат вводиться мануально в конкретні точки.\n\n4. Завершення процедури. Нанесення заспокійливої маски чи крему з фактором росту. Відразу після процедури можливе легке почервоніння шкіри — зникає за 2–6 годин.\n\n5. Курс і підтримка. Оптимальний курс — 3–6 процедур з інтервалом 2–4 тижні. Далі — підтримка 1 процедура на 3–6 місяців.",
        ru: "Процедура экзосомальной терапии длится 60–90 минут. Основные этапы:\n\n1. Консультация и выбор препарата. Врач оценивает состояние кожи, обсуждает ваши ожидания, подбирает препарат (регенеративный, antiage, лечение акне, трихологический) и определяет оптимальный курс.\n\n2. Подготовка кожи. Демакияж, глубокое очищение, при необходимости — мягкий пилинг для лучшего проникновения. Обязательно — аппликационная анестезия лидокаиновым кремом на 15–30 минут.\n\n3. Микронидлинг или инъекции. Используем две техники в зависимости от цели:\n— микронидлинг (dermapen или автомат типа Dermapen 4): делаем микроканалы в коже глубиной 0,5–2 мм, после чего наносим экзосомальный препарат — он проникает через каналы в средние слои. Идеально для глобальной регенерации;\n— прямые инъекции (чаще для зон вокруг глаз, губ, рубцов): тонкой иглой препарат вводится мануально в конкретные точки.\n\n4. Завершение процедуры. Нанесение успокаивающей маски или крема с фактором роста. Сразу после процедуры возможно лёгкое покраснение кожи — исчезает за 2–6 часов.\n\n5. Курс и поддержка. Оптимальный курс — 3–6 процедур с интервалом 2–4 недели. Далее — поддержка 1 процедура в 3–6 месяцев.",
        en: "A session runs 60-90 minutes.\n\n1. Consultation and product selection. The doctor evaluates the skin, discusses goals, selects the preparation (regenerative, anti-ageing, acne therapy, or trichology) and defines the optimal course.\n\n2. Skin preparation. Makeup removal, deep cleansing, optionally a gentle peel for better penetration. A topical lidocaine anaesthetic is always applied for 15-30 minutes.\n\n3. Microneedling or injections. Two techniques by objective:\n— microneedling (Dermapen or similar automated device): we create microchannels 0.5-2 mm deep, then apply the exosomal preparation — it passes through the channels into the middle skin layers. Ideal for overall regeneration;\n— direct injections (more often for eye area, lips, scar work): delivered manually with a fine needle into specific points.\n\n4. Finish. Calming mask or growth-factor cream. Mild redness is possible and resolves within 2-6 hours.\n\n5. Course and maintenance. Optimal course: 3-6 sessions with 2-4 week intervals. Maintenance: one session every 3-6 months.",
      },
      calloutBody: {
        uk: "Екзосомальний препарат активний лише за умови холодового ланцюга: від виробника до вашого обличчя температура не повинна підніматись вище 2–8°C. У GENEVITY відкриваємо флакон при вас — щоб ви бачили, що це не розкритий заздалегідь матеріал.",
        ru: "Экзосомальный препарат активен только при условии холодовой цепи: от производителя до вашего лица температура не должна подниматься выше 2–8°C. В GENEVITY открываем флакон при вас — чтобы вы видели, что это не вскрытый заранее материал.",
        en: "Exosomal preparations are only active under cold-chain storage — from manufacturer to your face, temperature must stay at 2-8°C. At GENEVITY we open the vial in front of you so you can see it hasn't been pre-opened.",
      },
    },
    {
      heading: {
        uk: "Порівняння з іншими методами омолодження",
        ru: "Сравнение с другими методами омоложения",
        en: "How exosomes compare with other methods",
      },
      body: {
        uk: "Екзосомальна терапія не конкурує з ін'єкційною і апаратною косметологією — вона доповнює їх. Основні порівняння:\n\nЕкзосоми vs біоревіталізація. Біоревіталізація — зволоження і стимуляція через гіалуронову кислоту. Екзосоми — регенерація через сигнальні молекули, які включають власні клітинні процеси. Біоревіталізація — базовий рівень; екзосоми — більш глибокий, молекулярний.\n\nЕкзосоми vs PRP (плазмотерапія). PRP — плазма з власної крові пацієнта, багата на фактори росту. Результат залежить від якості вашої крові — чим старше пацієнт, тим менше факторів. Екзосоми — стандартизований препарат з молодих стовбурових клітин: працює однаково ефективно незалежно від віку.\n\nЕкзосоми vs лазерне шліфування. Лазер — інтенсивний, з тривалою реабілітацією (1–2 тижні), працює на поверхневому шарі. Екзосоми — м'яка процедура без соціальної реабілітації, працює у середньому шарі шкіри. Часто поєднуємо: після лазерного шліфування екзосоми прискорюють відновлення в декілька разів.\n\nЕкзосоми vs філери. Філери додають обсяг у конкретні зони. Екзосоми не додають обсяг — вони відновлюють якість шкіри на всій площі. Ці процедури працюють з різними задачами і часто використовуються разом.",
        ru: "Экзосомальная терапия не конкурирует с инъекционной и аппаратной косметологией — она дополняет их. Основные сравнения:\n\nЭкзосомы vs биоревитализация. Биоревитализация — увлажнение и стимуляция через гиалуроновую кислоту. Экзосомы — регенерация через сигнальные молекулы, которые включают собственные клеточные процессы. Биоревитализация — базовый уровень; экзосомы — более глубокий, молекулярный.\n\nЭкзосомы vs PRP (плазмотерапия). PRP — плазма из собственной крови пациента, богатая факторами роста. Результат зависит от качества вашей крови — чем старше пациент, тем меньше факторов. Экзосомы — стандартизированный препарат из молодых стволовых клеток: работает одинаково эффективно независимо от возраста.\n\nЭкзосомы vs лазерная шлифовка. Лазер — интенсивный, с длительной реабилитацией (1–2 недели), работает на поверхностном слое. Экзосомы — мягкая процедура без социальной реабилитации, работает в среднем слое кожи. Часто сочетаем: после лазерной шлифовки экзосомы ускоряют восстановление в несколько раз.\n\nЭкзосомы vs филлеры. Филлеры добавляют объём в конкретные зоны. Экзосомы не добавляют объём — они восстанавливают качество кожи на всей площади. Эти процедуры работают с разными задачами и часто используются вместе.",
        en: "Exosomal therapy doesn't compete with injectable or apparatus cosmetology — it complements them.\n\nExosomes vs biorevitalisation. Biorevitalisation hydrates and stimulates via hyaluronic acid. Exosomes regenerate via signalling molecules that switch on the cell's own processes. Biorevitalisation is a baseline; exosomes go deeper, at the molecular level.\n\nExosomes vs PRP. PRP is plasma from the patient's own blood, rich in growth factors. The quality depends on your blood — older patients have fewer active factors. Exosomes are a standardised preparation from young stem cells: equally effective regardless of age.\n\nExosomes vs laser resurfacing. Laser is intensive with 1-2 weeks of downtime and works on the surface layer. Exosomes are a soft procedure with no social downtime, working in the middle skin layer. They combine well — after laser resurfacing, exosomes accelerate healing several times over.\n\nExosomes vs fillers. Fillers add volume to specific zones. Exosomes don't add volume — they restore skin quality across the whole area. Different tools, often used together.",
      },
      calloutBody: {
        uk: "Екзосомальна терапія — це свіжий напрям у регенеративній медицині. Її можна порівняти з тим, чим була біоревіталізація 15 років тому: нова процедура з сильним доказовим базисом, яка поступово стає стандартом.",
        ru: "Экзосомальная терапия — это свежее направление в регенеративной медицине. Её можно сравнить с тем, чем была биоревитализация 15 лет назад: новая процедура с сильной доказательной базой, которая постепенно становится стандартом.",
        en: "Exosomal therapy is a fresh direction in regenerative medicine. You could compare it to where biorevitalisation was 15 years ago: a new procedure with strong evidence that's gradually becoming the standard.",
      },
    },
    {
      heading: {
        uk: "Можливі побічні ефекти та протипоказання",
        ru: "Возможные побочные эффекты и противопоказания",
        en: "Side effects and contraindications",
      },
      body: {
        uk: "Екзосомальна терапія — одна з найбезпечніших ін'єкційних процедур, оскільки препарат не викликає імунної реакції: екзосоми «невидимі» для імунної системи. Проте повної безпеки в медицині не існує, тому проходимо через протипоказання і побічні ефекти.\n\nПротипоказання:\n— вагітність і грудне вигодовування (дослідження не проводились);\n— активні онкологічні захворювання (екзосоми стимулюють ріст клітин — теоретично можуть прискорити ріст пухлини);\n— аутоімунні захворювання у фазі загострення;\n— інфекційні захворювання в активній фазі;\n— запалення, рани, свіжі рубці у зоні обробки;\n— гіперчутливість до компонентів препарату (рідко);\n— прийом імунодепресантів;\n— вік до 18 років.\n\nПобічні ефекти — мінімальні та короткочасні:\n— почервоніння шкіри (зникає за 2–6 годин);\n— невелика набряклість (1–2 доби);\n— мікросиняки у місцях мікропроколів (при мікронідлінгу, 4–7 днів);\n— сухість шкіри або шкірна лущення через 2–4 дні після процедури (нормальна реакція на регенерацію);\n— тимчасове посилення прищів (дуже рідко, при наявності активного акне).",
        ru: "Экзосомальная терапия — одна из самых безопасных инъекционных процедур, поскольку препарат не вызывает иммунной реакции: экзосомы «невидимы» для иммунной системы. Однако полной безопасности в медицине не существует, поэтому проходим через противопоказания и побочные эффекты.\n\nПротивопоказания:\n— беременность и грудное вскармливание (исследования не проводились);\n— активные онкологические заболевания (экзосомы стимулируют рост клеток — теоретически могут ускорить рост опухоли);\n— аутоиммунные заболевания в фазе обострения;\n— инфекционные заболевания в активной фазе;\n— воспаления, раны, свежие рубцы в зоне обработки;\n— гиперчувствительность к компонентам препарата (редко);\n— приём иммунодепрессантов;\n— возраст до 18 лет.\n\nПобочные эффекты — минимальные и кратковременные:\n— покраснение кожи (исчезает за 2–6 часов);\n— небольшая отёчность (1–2 суток);\n— микросиняки в местах микропроколов (при микронидлинге, 4–7 дней);\n— сухость кожи или шелушение через 2–4 дня после процедуры (нормальная реакция на регенерацию);\n— временное усиление прыщей (очень редко, при наличии активного акне).",
        en: "Exosomal therapy is one of the safest injectable procedures — exosomes don't trigger an immune reaction, they're essentially invisible to the immune system. Complete safety doesn't exist in medicine, though, so here are the contraindications and side effects.\n\nContraindications: pregnancy and breastfeeding (no studies); active oncology (exosomes stimulate cell growth — theoretically they could accelerate tumour growth); autoimmune flare-ups; active-phase infections; inflammation, wounds or fresh scars in the area; hypersensitivity to the preparation (rare); immunosuppressant therapy; age under 18.\n\nSide effects — minimal and short-lived: redness (2-6 hours); mild swelling (1-2 days); micro-bruises at needling points (with microneedling, 4-7 days); dryness or peeling 2-4 days later (a normal regenerative response); temporary acne flare-up (rare, only with active acne).",
      },
      calloutBody: {
        uk: "Ризик екзосомальної терапії — це не сама процедура. Це неперевірений препарат, відсутність холодового ланцюга або нестерильна техніка. Саме тому ми завжди відкриваємо флакон при вас і показуємо сертифікат. Якщо клініка не може це зробити — шукайте іншу.",
        ru: "Риск экзосомальной терапии — это не сама процедура. Это непроверенный препарат, отсутствие холодовой цепи или нестерильная техника. Именно поэтому мы всегда открываем флакон при вас и показываем сертификат. Если клиника не может это сделать — ищите другую.",
        en: "The real risk with exosomal therapy isn't the procedure itself. It's an unverified preparation, a broken cold chain or non-sterile technique. That's why we always open the vial in your presence and show the certificate. If a clinic can't do that — look for another.",
      },
    },
  ],
  faq: [
    {
      question: {
        uk: "Чи безпечна екзосомальна терапія для всіх типів шкіри?",
        ru: "Безопасна ли экзосомальная терапия для всех типов кожи?",
        en: "Is exosomal therapy safe for all skin types?",
      },
      answer: {
        uk: "Так, екзосомальна терапія підходить для всіх типів шкіри — від сухої до жирної, від світлої до темної. Препарат не викликає імунної реакції і не стимулює меланогенез (тому безпечний для темної шкіри і не провокує пігментацію). Протипоказання пов'язані з загальним станом здоров'я (онкологія, аутоімунні стани), а не з типом шкіри.",
        ru: "Да, экзосомальная терапия подходит для всех типов кожи — от сухой до жирной, от светлой до тёмной. Препарат не вызывает иммунной реакции и не стимулирует меланогенез (поэтому безопасен для тёмной кожи и не провоцирует пигментацию). Противопоказания связаны с общим состоянием здоровья (онкология, аутоиммунные состояния), а не с типом кожи.",
        en: "Yes, exosomal therapy suits all skin types — from dry to oily, from light to dark. The preparation doesn't trigger an immune response or stimulate melanogenesis (so it's safe for darker skin and doesn't provoke pigmentation). Contraindications relate to general health (oncology, autoimmune conditions), not skin type.",
      },
    },
    {
      question: {
        uk: "Скільки процедур екзосомальної терапії необхідно для досягнення видимого результату?",
        ru: "Сколько процедур экзосомальной терапии необходимо для достижения видимого результата?",
        en: "How many exosomal sessions are needed for a visible result?",
      },
      answer: {
        uk: "Перші помітні зміни видно вже після першої процедури — шкіра виглядає свіжіше. Стабільний, глибокий результат приходить після курсу з 3–6 процедур з інтервалом 2–4 тижні. Точну кількість процедур визначає лікар — у середньому: 3 процедури для свіжої молодої шкіри; 4–5 при фотостарінні; 5–6 при постакне чи виражених рубцях. Підтримка — 1 процедура на 3–6 місяців.",
        ru: "Первые заметные изменения видны уже после первой процедуры — кожа выглядит свежее. Стабильный, глубокий результат приходит после курса из 3–6 процедур с интервалом 2–4 недели. Точное количество процедур определяет врач — в среднем: 3 процедуры для свежей молодой кожи; 4–5 при фотостарении; 5–6 при постакне или выраженных рубцах. Поддержка — 1 процедура в 3–6 месяцев.",
        en: "First noticeable changes are visible after the first session — skin looks fresher. A stable, deep result comes after a course of 3-6 sessions with 2-4 week intervals. The exact number is set by the doctor — typically 3 for young fresh skin; 4-5 for photo-ageing; 5-6 for post-acne or pronounced scars. Maintenance: one session every 3-6 months.",
      },
    },
    {
      question: {
        uk: "Чи можна поєднувати екзосомальну терапію з іншими косметологічними процедурами?",
        ru: "Можно ли сочетать экзосомальную терапию с другими косметологическими процедурами?",
        en: "Can exosomal therapy be combined with other treatments?",
      },
      answer: {
        uk: "Так, екзосомальна терапія чудово поєднується з більшістю процедур і часто підсилює їх результат. Класичні поєднання: екзосоми + мікронідлінг (одна процедура, два механізми); екзосоми + ботулінотерапія (інтервал 2 тижні); екзосоми + біоревіталізація (взаємно підсилюють одна одну); екзосоми після лазерного шліфування або глибокого пілінгу — прискорюють регенерацію у декілька разів. Поєднання з філерами планується з інтервалом 1–2 тижні.",
        ru: "Да, экзосомальная терапия прекрасно сочетается с большинством процедур и часто усиливает их результат. Классические сочетания: экзосомы + микронидлинг (одна процедура, два механизма); экзосомы + ботулинотерапия (интервал 2 недели); экзосомы + биоревитализация (взаимно усиливают друг друга); экзосомы после лазерной шлифовки или глубокого пилинга — ускоряют регенерацию в несколько раз. Сочетание с филлерами планируется с интервалом 1–2 недели.",
        en: "Yes, exosomal therapy combines well with most procedures and often amplifies results. Classic pairings: exosomes + microneedling (one session, two mechanisms); exosomes + botulinum therapy (2 week interval); exosomes + biorevitalisation (mutually reinforcing); exosomes after laser resurfacing or deep peels — they accelerate healing several times over. Pairing with fillers is planned with a 1-2 week gap.",
      },
    },
    {
      question: {
        uk: "Який період реабілітації після введення екзосом?",
        ru: "Какой период реабилитации после введения экзосом?",
        en: "What's the recovery period after exosomes?",
      },
      answer: {
        uk: "Соціальна реабілітація мінімальна — 2–6 годин до зникнення легкого почервоніння. Протягом 24 годин: без сауни, басейну, спорту, макіяжу, масажу обличчя. При мікронідлінгу — 2–3 дні можуть бути мікросиняки (легко маскуються тональним кремом через 24 години). 2 тижні активний SPF (30+). Більшість пацієнтів повертаються на роботу наступного дня без видимих ознак процедури.",
        ru: "Социальная реабилитация минимальна — 2–6 часов до исчезновения лёгкого покраснения. В течение 24 часов: без сауны, бассейна, спорта, макияжа, массажа лица. При микронидлинге — 2–3 дня могут быть микросиняки (легко маскируются тональным кремом через 24 часа). 2 недели активный SPF (30+). Большинство пациентов возвращаются на работу на следующий день без видимых признаков процедуры.",
        en: "Social downtime is minimal — 2-6 hours for mild redness to clear. For 24 hours: no sauna, pool, sport, makeup or facial massage. With microneedling, micro-bruises may be visible for 2-3 days (easily covered with foundation after 24 hours). Two weeks of SPF 30+. Most patients return to work the next day with no visible signs of the procedure.",
      },
    },
    {
      question: {
        uk: "Чи підходить екзосомальна терапія для лікування акне?",
        ru: "Подходит ли экзосомальная терапия для лечения акне?",
        en: "Does exosomal therapy help with acne?",
      },
      answer: {
        uk: "Так, особливо при постакне (рубці, червоні плями, нерівний рельєф). Екзосомальні препарати з протизапальними компонентами також зменшують поточне запалення, але основний результат — регенерація пошкодженої після акне тканини. Курс з 4–6 процедур суттєво покращує якість шкіри при постакне; іноді результати помітніші, ніж після лазерного шліфування, і без тривалої реабілітації.",
        ru: "Да, особенно при постакне (рубцы, красные пятна, неровный рельеф). Экзосомальные препараты с противовоспалительными компонентами также уменьшают текущее воспаление, но основной результат — регенерация повреждённой после акне ткани. Курс из 4–6 процедур существенно улучшает качество кожи при постакне; иногда результаты заметнее, чем после лазерной шлифовки, и без длительной реабилитации.",
        en: "Yes, particularly for post-acne (scarring, red marks, uneven texture). Exosomal preparations with anti-inflammatory components also calm active inflammation, but the main benefit is regenerating acne-damaged tissue. A 4-6 session course substantially improves skin quality in post-acne — sometimes with results more noticeable than laser resurfacing, and without the long downtime.",
      },
    },
    {
      question: {
        uk: "Скільки коштує екзосомальна терапія у Дніпрі?",
        ru: "Сколько стоит экзосомальная терапия в Днепре?",
        en: "How much does exosomal therapy cost in Dnipro?",
      },
      answer: {
        uk: "Екзосомальна терапія — одна з найдорожчих процедур у нашому прайсі через вартість сировини (сертифіковані екзосомальні препарати виробляються у мінімальній кількості лабораторій світу). Ціна залежить від препарату, площі обробки і техніки введення. У GENEVITY базову ціну однієї процедури вказано у прайсі на цій сторінці; курс із 3–6 процедур пропонуємо за зниженою ціною за сеанс.",
        ru: "Экзосомальная терапия — одна из самых дорогих процедур в нашем прайсе из-за стоимости сырья (сертифицированные экзосомальные препараты производятся в минимальном количестве лабораторий мира). Цена зависит от препарата, площади обработки и техники введения. В GENEVITY базовую цену одной процедуры указано в прайсе на этой странице; курс из 3–6 процедур предлагаем по сниженной цене за сеанс.",
        en: "Exosomal therapy is one of the more expensive procedures on our list because of raw-material costs — certified exosomal preparations are produced in only a handful of labs worldwide. Price depends on the product, area and technique. GENEVITY's base per-session price is on the price list on this page; a course of 3-6 sessions is offered at a reduced per-session rate.",
      },
    },
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Apply all copies
 * ──────────────────────────────────────────────────────────────── */

async function applyService(copy: ServiceCopy) {
  const svc = await sql`SELECT id FROM services WHERE slug = ${copy.slug} LIMIT 1`;
  if (!svc[0]) {
    console.error(`✗ Service "${copy.slug}" not found — skipping`);
    return;
  }
  const serviceId = svc[0].id as string;

  await sql`
    UPDATE services SET
      summary_uk = ${copy.summary.uk},
      summary_ru = ${copy.summary.ru},
      summary_en = ${copy.summary.en}
    WHERE id = ${serviceId}
  `;

  await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${serviceId}`;
  await sql`DELETE FROM faq_items      WHERE owner_type = 'service' AND owner_id = ${serviceId}`;

  const sectionIds: string[] = [];
  for (let i = 0; i < copy.sections.length; i++) {
    const s = copy.sections[i];
    const id = randomUUID();
    sectionIds.push(id);
    const data = {
      heading: s.heading,
      body: s.body,
      calloutBody: s.calloutBody,
      heroImage: null,
    };
    await sql`
      INSERT INTO content_sections (id, owner_type, owner_id, sort_order, section_type, data)
      VALUES (${id}, 'service', ${serviceId}, ${i}, 'richText'::section_type, ${JSON.stringify(data)}::jsonb)
    `;
  }

  for (let i = 0; i < copy.faq.length; i++) {
    const f = copy.faq[i];
    await sql`
      INSERT INTO faq_items (owner_type, owner_id, sort_order,
        question_uk, question_ru, question_en,
        answer_uk, answer_ru, answer_en)
      VALUES ('service', ${serviceId}, ${i},
        ${f.question.uk}, ${f.question.ru}, ${f.question.en},
        ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en})
    `;
  }

  const newOrder = [
    ...sectionIds.map((id) => `section:${id}`),
    "faq", "doctors", "equipment", "relatedServices", "finalCTA",
  ];
  await sql`UPDATE services SET block_order = ${newOrder} WHERE id = ${serviceId}`;

  console.log(`✓ ${copy.slug} — ${copy.sections.length} sections, ${copy.faq.length} FAQs`);
}

async function main() {
  for (const copy of [botulinum, biorev, meso, exosomes]) {
    await applyService(copy);
  }
  await sql.end();
  console.log("\nV1 DONE — review the 4 services and reply \"continue\" for V2.");
}

main().catch((e) => { console.error(e); process.exit(1); });
