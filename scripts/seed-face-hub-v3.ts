/**
 * Face hub v3: comprehensive content covering EMFACE, Volnewmer, Exion, Ultraformer MPT.
 * Targets semantic groups: emface (2kw), volnewmer (2kw), exion (2kw), Ultraformer mpt (8kw).
 * Run: npx tsx scripts/seed-face-hub-v3.ts
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

async function main() {
  const [svc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'face' AND c.slug = 'apparatus-cosmetology'
  `;
  if (!svc) { console.error("face service not found"); process.exit(1); }
  const id = svc.id;

  await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'service'`;

  await sql`
    UPDATE services SET
      h1_uk = 'Апаратна косметологія для обличчя — EMFACE, Ultraformer MPT, Exion, Volnewmer у Дніпрі',
      h1_ru = 'Аппаратная косметология для лица — EMFACE, Ultraformer MPT, Exion, Volnewmer в Днепре',
      h1_en = 'Apparatus Facial Cosmetology — EMFACE, Ultraformer MPT, Exion, Volnewmer in Dnipro',
      summary_uk = 'Апаратне омолодження обличчя в GENEVITY без операцій та ін''єкцій: EMFACE, Ultraformer MPT (СМАС-ліфтинг), Exion (RF + AI), Volnewmer (безголковий RF). Дніпро.',
      summary_ru = 'Аппаратное омоложение лица в GENEVITY без операций и инъекций: EMFACE, Ultraformer MPT (СМАС-лифтинг), Exion (RF + AI), Volnewmer. Днепр.',
      summary_en = 'Apparatus facial rejuvenation at GENEVITY — no surgery, no needles: EMFACE, Ultraformer MPT (SMAS lifting), Exion (RF + AI), Volnewmer. Dnipro.',
      seo_title_uk = 'Апаратна косметологія для обличчя у Дніпрі — EMFACE, Ultraformer MPT, Exion, Volnewmer',
      seo_title_ru = 'Аппаратная косметология для лица в Днепре — EMFACE, Ultraformer MPT, Exion, Volnewmer',
      seo_title_en = 'Apparatus Facial Cosmetology in Dnipro — EMFACE, Ultraformer MPT, Exion, Volnewmer',
      seo_desc_uk  = 'Апаратне омолодження обличчя в GENEVITY: EMFACE (ліфтинг + тонізація м''язів), Ultraformer MPT (СМАС-ліфтинг), Exion (RF+AI), Volnewmer (безголковий RF). Без операцій. Дніпро.',
      seo_desc_ru  = 'Аппаратное омоложение лица в GENEVITY: EMFACE, Ultraformer MPT (СМАС-лифтинг), Exion (RF+AI), Volnewmer. Без операций. Днепр.',
      seo_desc_en  = 'Apparatus facial rejuvenation at GENEVITY: EMFACE, Ultraformer MPT (SMAS lifting), Exion (RF+AI), Volnewmer. No surgery. Dnipro.',
      seo_keywords_uk = 'emface, emface процедура, ультраформер, смас ліфтинг ультраформер, ультраформер для обличчя, ультраформер показання, ультраформер ціна процедури, exion face, exion, процедура volnewmer, volnewmer показання, апаратна косметологія для обличчя, апаратні процедури для обличчя'
    WHERE id = ${id}
  `;

  type Section = { type: string; sort_order: number; data: object };

  const sections: Section[] = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Апаратне омолодження обличчя в GENEVITY — без операцій та голок", ru: "Аппаратное омоложение лица в GENEVITY — без операций и игл", en: "Non-Surgical Apparatus Facial Rejuvenation at GENEVITY" },
        body: { uk: "Апаратна косметологія для обличчя — це сучасна альтернатива хірургічним методам та ін'єкційній косметології. У центрі GENEVITY представлені чотири технології, кожна з яких вирішує власні задачі й може застосовуватися як окремо, так і в комплексі.\n\nУсі апарати сертифіковані FDA та CE. Процедури проводять лікарі-косметологи з клінічним досвідом — без лаборантів чи косметологів без медичної освіти.", ru: "Аппаратная косметология для лица — современная альтернатива хирургическим методам и инъекционной косметологии. В GENEVITY четыре технологии, каждая из которых решает собственные задачи и может применяться как отдельно, так и в комплексе.\n\nВсе аппараты сертифицированы FDA и CE. Процедуры проводят врачи-косметологи с клиническим опытом.", en: "Apparatus cosmetology for the face is the modern alternative to surgical methods and injectables. GENEVITY offers four technologies, each solving its own problems, applicable individually or in combination.\n\nAll devices are FDA and CE certified. Procedures are performed by aesthetic physicians with clinical experience — not technicians or non-medical cosmetologists." },
      },
    },
    {
      type: "richText", sort_order: 2,
      data: {
        heading: { uk: "EMFACE — безін'єкційний ліфтинг і тонізація м'язів обличчя", ru: "EMFACE — безынъекционный лифтинг и тонизация мышц лица", en: "EMFACE — Needle-Free Facial Lifting and Muscle Toning" },
        body: { uk: "EMFACE від BTL — єдина у світі процедура, яка одночасно діє на шкіру та мімічні м'язи. Радіочастотне (RF) випромінювання ущільнює колаген і підтягує шкіру, а HIFES-електростимуляція скорочує та тонізує м'язи обличчя. Ефект — підняті вилиці, розкриті очі, чіткіший овал — без жодної голки.\n\n**Показання до EMFACE:** птоз м'яких тканин обличчя, зниження тонусу мімічних м'язів, носогубні складки та заломи, бажання уникнути ін'єкцій ботоксу або відтермінувати їх.\n\n**Курс і результат:** 4 процедури по 20 хвилин з інтервалом 5–7 днів. Ефект помітний після 2–3 сеансу і зберігається 6–12 місяців. GENEVITY — єдина клініка в Дніпрі з апаратом EMFACE.\n\n**Процедура:** безболісна. Відчуття — тепло та пульсація м'язів. Без реабілітації — можна повертатися до роботи одразу.", ru: "EMFACE от BTL — единственная в мире процедура, одновременно воздействующая на кожу и мимические мышцы. RF-излучение уплотняет коллаген, HIFES-стимуляция тонизирует мышцы. Результат: поднятые скулы, открытые глаза, чёткий овал — без инъекций.\n\n**Показания:** птоз тканей лица, сниженный тонус мышц, носогубные складки, желание избежать инъекций.\n\n**Курс:** 4 процедуры по 20 минут. Эффект — 6–12 месяцев. GENEVITY — единственная клиника в Днепре с аппаратом EMFACE.", en: "EMFACE by BTL — the world's only procedure acting on skin and facial muscles simultaneously. RF radiation tightens collagen, HIFES stimulation tones muscles. Result: lifted cheeks, open eyes, defined oval — no needles.\n\n**Indications:** facial tissue ptosis, reduced muscle tone, nasolabial folds, preference to avoid injections.\n\n**Course:** 4 sessions of 20 minutes. Effect lasts 6–12 months. GENEVITY is the only clinic in Dnipro with EMFACE." },
      },
    },
    {
      type: "richText", sort_order: 3,
      data: {
        heading: { uk: "Ultraformer MPT — СМАС-ліфтинг ультразвуком", ru: "Ultraformer MPT — СМАС-лифтинг ультразвуком", en: "Ultraformer MPT — Ultrasound SMAS Lifting" },
        body: { uk: "Ultraformer MPT від CLASSYS — апарат для мікрофокусованого ультразвукового ліфтингу (HIFU). Ультразвукові промені нагрівають СМАС-шар на глибині 4,5 мм без пошкодження поверхні шкіри. У точці фокусу утворюється мікрокоагуляційна зона — колаген скорочується і запускається активний неоколагеногенез.\n\n**Показання до Ultraformer MPT:** птоз тканин та нечіткий овал, «брилі», друге підборіддя, зморшки шиї та декольте, опущені кути рота та брови.\n\n**Результат:** ліфтинг овалу та брів, зменшення другого підборіддя, підтяжка шиї. Ефект розвивається протягом 2–3 місяців і зберігається 12–18 місяців. Зазвичай достатньо 1 сеансу на рік.\n\n**Процедура:** 45–90 хвилин. Можлива легка анестезія. Більшість пацієнтів повертаються до роботи наступного дня.", ru: "Ultraformer MPT от CLASSYS — аппарат для микрофокусированного ультразвукового лифтинга (HIFU). Ультразвуковые лучи нагревают СМАС-слой на глубине 4,5 мм. Результат: лифтинг овала, уменьшение второго подбородка, подтяжка шеи.\n\n**Показания:** птоз тканей, «брыли», второй подбородок, морщины шеи. Эффект 12–18 месяцев, 1 сеанс в год.\n\n**Процедура:** 45–90 минут. Большинство пациентов возвращаются к работе на следующий день.", en: "Ultraformer MPT by CLASSYS — micro-focused ultrasound lifting (HIFU). Ultrasound heats the SMAS layer at 4.5 mm depth. Results: jaw lifting, double chin reduction, neck tightening.\n\n**Indications:** tissue ptosis, jowls, double chin, neck wrinkles. Effect lasts 12–18 months, typically 1 session per year.\n\n**Procedure:** 45–90 minutes. Most patients return to work the next day." },
      },
    },
    {
      type: "richText", sort_order: 4,
      data: {
        heading: { uk: "Exion — RF + штучний інтелект для відновлення шкіри обличчя", ru: "Exion — RF + искусственный интеллект для восстановления кожи лица", en: "Exion — RF + AI for Facial Skin Renewal" },
        body: { uk: "Exion від BTL — інноваційна технологія монополярного RF-впливу з вбудованим штучним інтелектом, який у режимі реального часу регулює щільність та глибину нагріву кожної точки. Унікальна особливість Exion — стимуляція власного вироблення гіалуронової кислоти в шкірі без ін'єкцій.\n\n**Показання до Exion Face:** зневоднення та тьмяність шкіри, дрібні та середні зморшки, знижений тонус, великі пори, нерівна текстура, підготовка шкіри перед більш інтенсивними процедурами.\n\n**Процедура:** 30–45 хвилин, мінімальний дискомфорт. **Курс:** 4–6 сеансів з інтервалом 1–2 тижні. Перший видимий ефект — після 2–3 процедур. Шкіра виглядає щільнішою, зволоженішою, рельєф вирівнюється.", ru: "Exion от BTL — монополярный RF с ИИ, регулирующим нагрев в реальном времени. Стимулирует выработку гиалуроновой кислоты в коже без инъекций.\n\n**Показания:** обезвоживание, морщины, сниженный тонус, расширенные поры. **Курс:** 4–6 сеансов. Первый эффект — после 2–3 процедур.", en: "Exion by BTL — monopolar RF with built-in AI adjusting heat density and depth in real time. Stimulates natural hyaluronic acid production in the skin without injections.\n\n**Indications:** dehydration, fine-to-medium wrinkles, reduced tone, enlarged pores, uneven texture. **Course:** 4–6 sessions, 1–2 weeks apart. First visible effect after 2–3 procedures." },
      },
    },
    {
      type: "richText", sort_order: 5,
      data: {
        heading: { uk: "Volnewmer — безголковий RF-ліфтинг та зволоження обличчя", ru: "Volnewmer — безыгольный RF-лифтинг и увлажнение лица", en: "Volnewmer — Needle-Free RF Lifting and Facial Hydration" },
        body: { uk: "Volnewmer — апарат трансдермального RF-впливу, який одночасно доставляє активні речовини (гіалуронову кислоту, пептиди) у глибокі шари шкіри без голок. Технологія TRANSION відкриває канали в шкірі та транспортує компоненти в дерму — туди, де вони найефективніші.\n\n**Показання до Volnewmer:** зневоднена і тьмяна шкіра, дрібні зморшки, знижений тонус, перша птоза тканин, бажання уникнути будь-яких голок.\n\n**Процедура:** 30–40 хвилин, абсолютно комфортна. Результат видно вже після першого сеансу — шкіра виглядає зволоженою, підтягнутою, сяючою. Рекомендується курс 4–6 процедур або регулярно як підтримувальна програма.", ru: "Volnewmer — трансдермальный RF-аппарат, доставляющий гиалуроновую кислоту и пептиды в дерму без игл. Технология TRANSION открывает каналы в коже.\n\n**Показания:** обезвоженная кожа, морщины, сниженный тонус. **Процедура:** 30–40 минут, результат виден после первого сеанса.", en: "Volnewmer — transdermal RF device that delivers hyaluronic acid and peptides into the dermis without needles. TRANSION technology opens skin channels for deep active transport.\n\n**Indications:** dehydrated skin, fine wrinkles, reduced tone. **Procedure:** 30–40 min, absolutely comfortable. Result visible after first session." },
      },
    },
    {
      type: "bullets", sort_order: 6,
      data: {
        heading: { uk: "Як обрати апаратну процедуру для обличчя?", ru: "Как выбрать аппаратную процедуру для лица?", en: "How to Choose the Right Facial Apparatus Procedure?" },
        items: [
          { uk: "Птоз, «брилі», друге підборіддя, зморшки шиї → Ultraformer MPT (СМАС-ліфтинг)", ru: "Птоз, «брыли», второй подбородок, морщины шеи → Ultraformer MPT (СМАС-лифтинг)", en: "Ptosis, jowls, double chin, neck wrinkles → Ultraformer MPT (SMAS lifting)" },
          { uk: "Знижений тонус м'язів, бажання підняти овал без голок → EMFACE", ru: "Сниженный тонус мышц, желание поднять овал без игл → EMFACE", en: "Reduced muscle tone, wish to lift oval without injections → EMFACE" },
          { uk: "Зневоднення, пори, текстура, ранні зморшки без голок → Exion або Volnewmer", ru: "Обезвоживание, поры, текстура, ранние морщины без игл → Exion или Volnewmer", en: "Dehydration, pores, texture, early wrinkles needle-free → Exion or Volnewmer" },
          { uk: "Комбінований результат: EMFACE + Ultraformer MPT або Exion + Volnewmer", ru: "Комбинированный результат: EMFACE + Ultraformer MPT или Exion + Volnewmer", en: "Combined result: EMFACE + Ultraformer MPT, or Exion + Volnewmer" },
          { uk: "Протипоказання: вагітність, онкологічні захворювання, металеві імплантати в зоні обробки, епілепсія", ru: "Противопоказания: беременность, онкология, металлические импланты в зоне обработки, эпилепсия", en: "Contraindications: pregnancy, oncology, metal implants in treatment zone, epilepsy" },
        ],
      },
    },
    {
      type: "steps", sort_order: 7,
      data: {
        heading: { uk: "Як проходить апаратна процедура для обличчя в GENEVITY", ru: "Как проходит аппаратная процедура для лица в GENEVITY", en: "How an Apparatus Facial Procedure Works at GENEVITY" },
        steps: [
          { title: { uk: "Консультація лікаря", ru: "Консультация врача", en: "Physician consultation" }, description: { uk: "Лікар-косметолог оглядає шкіру, оцінює тонус м'язів і тканин, визначає оптимальний апарат або комбінацію процедур, озвучує очікуваний результат і кількість сеансів.", ru: "Врач-косметолог осматривает кожу, определяет оптимальный аппарат или комбинацию процедур.", en: "The aesthetic physician examines skin, assesses tissue tone, selects the optimal device or combination, and outlines expected results and session count." } },
          { title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" }, description: { uk: "Очищення шкіри, нанесення контактного гелю (Ultraformer MPT, Exion) або підготовка без гелю (EMFACE). При Ultraformer MPT за потреби — нанесення знеболювального крему за 30–40 хвилин.", ru: "Очищение кожи, нанесение контактного геля. При Ultraformer MPT при необходимости — анестезирующий крем за 30–40 минут.", en: "Skin cleansing, contact gel application (Ultraformer MPT, Exion). For Ultraformer MPT if needed: numbing cream 30–40 min prior." } },
          { title: { uk: "Процедура", ru: "Процедура", en: "Procedure" }, description: { uk: "Лікар проводить сеанс за індивідуальним протоколом. Тривалість: EMFACE — 20 хв, Ultraformer MPT — 45–90 хв, Exion — 30–45 хв, Volnewmer — 30–40 хв.", ru: "Врач проводит сеанс по индивидуальному протоколу. EMFACE — 20 мин, Ultraformer MPT — 45–90 мин, Exion — 30–45 мин.", en: "The physician conducts the session per individual protocol. EMFACE — 20 min, Ultraformer MPT — 45–90 min, Exion — 30–45 min, Volnewmer — 30–40 min." } },
          { title: { uk: "Рекомендації та спостереження", ru: "Рекомендации и наблюдение", en: "Recommendations and follow-up" }, description: { uk: "Лікар надає індивідуальні рекомендації щодо догляду після процедури. Контрольна консультація для оцінки результату включена в курс.", ru: "Врач даёт рекомендации по уходу. Контрольная консультация для оценки результата включена в курс.", en: "The physician provides post-procedure care guidance. A follow-up consultation to assess results is included in the course." } },
        ],
      },
    },
  ];

  for (const s of sections) {
    await sql`
      INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${id}, 'service', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})
    `;
  }

  const faqs = [
    {
      q: { uk: "Скільки часу зберігається ефект EMFACE?", ru: "Сколько времени сохраняется эффект EMFACE?", en: "How long does the EMFACE effect last?" },
      a: { uk: "Ефект EMFACE зберігається 6–12 місяців після повного курсу з 4 процедур. Для підтримання результату рекомендується 1–2 підтримуючих сеанси на рік. Ефект накопичується: кожен наступний курс, як правило, дає кращий результат.", ru: "Эффект EMFACE — 6–12 месяцев после курса из 4 процедур. Для поддержания — 1–2 поддерживающих сеанса в год.", en: "EMFACE effect lasts 6–12 months after a 4-session course. 1–2 maintenance sessions per year are recommended. Results tend to improve with each subsequent course." },
    },
    {
      q: { uk: "Чи болісна процедура Ultraformer MPT (ультраформер для обличчя)?", ru: "Болезненна ли процедура Ultraformer MPT (ультраформер для лица)?", en: "Is the Ultraformer MPT procedure painful?" },
      a: { uk: "Більшість пацієнтів описують відчуття як помірне поколювання або тепло у точках фокусу ультразвуку. При підвищеній чутливості лікар наносить анестезуючий крем за 30–40 хвилин до початку. Після процедури можлива легка гіперемія, яка проходить протягом кількох годин.", ru: "Большинство описывают ощущения как умеренное покалывание в точках фокуса. При необходимости — анестезирующий крем. Лёгкая гиперемия после процедуры проходит за несколько часов.", en: "Most patients describe a moderate tingling or warmth at focus points. Numbing cream is applied if needed. Mild redness after the procedure fades within a few hours." },
    },
    {
      q: { uk: "Скільки сеансів Exion Face потрібно для результату?", ru: "Сколько сеансов Exion Face нужно для результата?", en: "How many Exion Face sessions are needed?" },
      a: { uk: "Курс Exion Face — 4–6 сеансів з інтервалом 1–2 тижні. Перші видимі зміни (зволоження, сяяння шкіри) — після 2–3 процедур. Фінальний результат оцінюється через 4 тижні після останнього сеансу.", ru: "Курс Exion Face — 4–6 сеансов с интервалом 1–2 недели. Первые изменения — после 2–3 процедур. Итог оценивается через 4 недели после последнего сеанса.", en: "Exion Face course: 4–6 sessions, 1–2 weeks apart. First visible changes (hydration, glow) after 2–3 sessions. Final result assessed 4 weeks after last session." },
    },
    {
      q: { uk: "Чи можна поєднувати апаратні процедури для обличчя з ін'єкційними методиками?", ru: "Можно ли совмещать аппаратные процедуры лица с инъекционными?", en: "Can apparatus face procedures be combined with injectables?" },
      a: { uk: "Так, і часто це дає найкращий результат. Популярні поєднання: Ultraformer MPT + біоревіталізація (ліфтинг + глибоке зволоження), EMFACE + ботулінотерапія (тонус м'язів + розгладження зморшок), Exion + мезотерапія (RF відновлення + активні коктейлі). Лікар GENEVITY складає індивідуальну програму з урахуванням сумісності та інтервалів.", ru: "Да, популярные комбинации: Ultraformer MPT + биоревитализация, EMFACE + ботулинотерапия, Exion + мезотерапия. Врач составит индивидуальную программу.", en: "Yes, popular combinations: Ultraformer MPT + biorevitalisation (lift + hydration), EMFACE + botulinum therapy (muscle tone + wrinkle smoothing), Exion + mesotherapy. GENEVITY physicians create individual programmes with correct timing." },
    },
    {
      q: { uk: "Яка процедура підходить для профілактики старіння у молодому віці?", ru: "Какая процедура подходит для профилактики старения в молодом возрасте?", en: "Which procedure is best for anti-ageing prevention in younger patients?" },
      a: { uk: "Для пацієнтів до 35 років найкраще підходять Exion та Volnewmer — вони підтримують зволоженість, тонус і якість шкіри без агресивного впливу. З 35–40 років рекомендуємо додавати EMFACE для профілактики птозу м'язів. Ultraformer MPT більш актуальний при вираженому птозі від 40+.", ru: "До 35 лет — Exion и Volnewmer для поддержания качества кожи. С 35–40 лет — добавлять EMFACE для профилактики птоза. Ultraformer MPT — при выраженном птозе от 40+.", en: "Under 35: Exion and Volnewmer maintain skin hydration, tone, and quality without aggressive action. From 35–40: add EMFACE for muscle ptosis prevention. Ultraformer MPT is most relevant for pronounced ptosis from 40+." },
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${id}, 'service', ${faqs[i].q.uk}, ${faqs[i].q.ru}, ${faqs[i].q.en}, ${faqs[i].a.uk}, ${faqs[i].a.ru}, ${faqs[i].a.en}, ${i + 1})
    `;
  }

  console.log(`✓ Face hub: ${sections.length} sections + ${faqs.length} FAQs`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
