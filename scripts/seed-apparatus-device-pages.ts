/**
 * Creates 11 individual apparatus device service pages under apparatus-cosmetology.
 * Content extracted from face-hub-v3, body-hub-v3, skin-hub seed scripts.
 * Run: npx tsx scripts/seed-apparatus-device-pages.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

async function getCategoryId(slug: string): Promise<string> {
  const [row] = await sql`SELECT id FROM service_categories WHERE slug = ${slug}`;
  if (!row) throw new Error(`Category not found: ${slug}`);
  return row.id;
}

async function upsertService(catId: string, slug: string, data: Record<string, any>): Promise<string> {
  const existing = await sql`SELECT id FROM services WHERE slug = ${slug} AND category_id = ${catId}`;
  if (existing.length) {
    const id = existing[0].id;
    await sql`UPDATE services SET ${sql(data)} WHERE id = ${id}`;
    await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'service'`;
    await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'service'`;
    return id;
  }
  const id = randomUUID();
  await sql`INSERT INTO services ${sql({ id, category_id: catId, slug, ...data })}`;
  return id;
}

async function addSections(serviceId: string, sections: { type: string; sort_order: number; data: object }[]) {
  for (const s of sections) {
    await sql`INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${serviceId}, 'service', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})`;
  }
}

async function addFaqs(serviceId: string, faqs: { q: Record<string,string>; a: Record<string,string> }[]) {
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await sql`INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${serviceId}, 'service', ${f.q.uk}, ${f.q.ru}, ${f.q.en}, ${f.a.uk}, ${f.a.ru}, ${f.a.en}, ${i + 1})`;
  }
}

async function main() {
  const apparatusId = await getCategoryId("apparatus-cosmetology");

  // ─── 1. EMFACE ───────────────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "emface", {
      title_uk: "EMFACE", title_ru: "EMFACE", title_en: "EMFACE",
      h1_uk: "EMFACE у Дніпрі – безін'єкційний ліфтинг і тонізація м'язів обличчя",
      h1_ru: "EMFACE в Днепре – безинъекционный лифтинг и тонизация мышц лица",
      h1_en: "EMFACE in Dnipro – Needle-Free Facial Lifting and Muscle Toning",
      summary_uk: "Процедура EMFACE в GENEVITY – єдина технологія, що одночасно підтягує шкіру RF-випромінюванням та тонізує мімічні м'язи HIFES-стимуляцією. Без голок, без реабілітації.",
      summary_ru: "Процедура EMFACE в GENEVITY – единственная технология, одновременно подтягивающая кожу RF и тонизирующая мышцы HIFES. Без инъекций, без реабилитации.",
      summary_en: "EMFACE at GENEVITY – the only technology simultaneously tightening skin with RF and toning facial muscles with HIFES. No injections, no downtime.",
      seo_title_uk: "Процедура EMFACE у Дніпрі – безін'єкційний ліфтинг обличчя",
      seo_title_ru: "Процедура EMFACE в Днепре – безинъекционный лифтинг лица",
      seo_title_en: "EMFACE Treatment in Dnipro – Non-Surgical Face Lifting",
      seo_desc_uk: "EMFACE у Дніпрі в GENEVITY. Безін'єкційний ліфтинг + тонізація м'язів обличчя. 4 процедури по 20 хв. Ефект 6–12 місяців. Єдина клініка в Дніпрі з EMFACE.",
      seo_desc_ru: "EMFACE в Днепре в GENEVITY. Безынъекционный лифтинг + тонизация мышц лица. 4 процедуры по 20 мин. Эффект 6–12 месяцев.",
      seo_desc_en: "EMFACE in Dnipro at GENEVITY. Needle-free lifting + facial muscle toning. 4 sessions × 20 min. Effect 6–12 months. Only clinic in Dnipro with EMFACE.",
      sort_order: 10,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "EMFACE – як працює унікальна процедура", ru: "EMFACE – как работает уникальная процедура", en: "EMFACE – How the Unique Procedure Works" },
        body: { uk: "EMFACE від BTL – єдина у світі процедура, яка одночасно діє на шкіру та мімічні м'язи. Радіочастотне (RF) випромінювання ущільнює колаген і підтягує шкіру, а HIFES-електростимуляція скорочує та тонізує м'язи обличчя. Ефект – підняті вилиці, розкриті очі, чіткіший овал – без жодної голки.\n\nGENEVITY – єдина клініка в Дніпрі, що має апарат EMFACE. Процедуру проводять лікарі-косметологи з клінічним досвідом роботи з BTL-технологіями.",
          ru: "EMFACE от BTL – единственная в мире процедура, одновременно воздействующая на кожу и мимические мышцы. RF-излучение уплотняет коллаген и подтягивает кожу, HIFES-стимуляция тонизирует мышцы лица. Результат – поднятые скулы, открытые глаза, чёткий овал – без инъекций.\n\nGENEVITY – единственная клиника в Днепре с аппаратом EMFACE.",
          en: "EMFACE by BTL is the world's only procedure acting on skin and facial muscles simultaneously. RF radiation tightens collagen and lifts skin, HIFES electrostimulation contracts and tones facial muscles. Result: lifted cheeks, open eyes, defined oval – no needles.\n\nGENEVITY is the only clinic in Dnipro with EMFACE." },
      }},
      { type: "richText", sort_order: 2, data: {
        heading: { uk: "Показання та ефект EMFACE", ru: "Показания и эффект EMFACE", en: "EMFACE Indications and Results" },
        body: { uk: "**Показання до EMFACE:** птоз м'яких тканин обличчя, зниження тонусу мімічних м'язів, носогубні складки та заломи, бажання уникнути ін'єкцій ботоксу або відтермінувати їх.\n\n**Курс і результат:** 4 процедури по 20 хвилин з інтервалом 5–7 днів. Ефект помітний після 2–3 сеансу і зберігається 6–12 місяців.\n\n**Процедура:** безболісна. Відчуття – тепло та пульсація м'язів. Без реабілітації – можна повертатися до роботи одразу.",
          ru: "**Показания:** птоз тканей лица, сниженный тонус мышц, носогубные складки, желание избежать инъекций.\n\n**Курс:** 4 процедуры по 20 мин, 5–7 дней между ними. Эффект – 6–12 месяцев. **Процедура:** безболезненна, без реабилитации.",
          en: "**Indications:** facial tissue ptosis, reduced muscle tone, nasolabial folds, preference to avoid injections.\n\n**Course:** 4 × 20-minute sessions, 5–7 days apart. Effect lasts 6–12 months.\n\n**Procedure:** painless. Sensations: warmth and muscle pulsation. No downtime." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Скільки часу зберігається ефект EMFACE?", ru: "Сколько времени сохраняется эффект EMFACE?", en: "How long does the EMFACE effect last?" },
        a: { uk: "Ефект EMFACE зберігається 6–12 місяців після повного курсу з 4 процедур. Для підтримання результату рекомендується 1–2 підтримуючих сеанси на рік. Ефект накопичується: кожен наступний курс дає кращий результат.", ru: "Эффект EMFACE – 6–12 месяцев после курса из 4 процедур. 1–2 поддерживающих сеанса в год. Результаты улучшаются с каждым последующим курсом.", en: "EMFACE effect lasts 6–12 months after a 4-session course. 1–2 maintenance sessions per year. Results tend to improve with each subsequent course." }},
      { q: { uk: "Чи боляче робити EMFACE?", ru: "Больно ли делать EMFACE?", en: "Is EMFACE painful?" },
        a: { uk: "EMFACE абсолютно безболісна. Пацієнти відчувають рівномірне тепло від RF-компонента та пульсацію м'язів від HIFES-стимуляції. Анестезії не потрібно. Одразу після процедури можна повертатися до звичного дня.", ru: "EMFACE абсолютно безболезненна. Пациенты ощущают равномерное тепло и пульсацию мышц. Анестезия не нужна.", en: "EMFACE is completely painless. Patients feel uniform warmth from RF and muscle pulsation from HIFES. No anaesthesia needed. Daily activities can resume immediately." }},
      { q: { uk: "Чому GENEVITY – єдина клініка з EMFACE у Дніпрі?", ru: "Почему GENEVITY – единственная клиника с EMFACE в Днепре?", en: "Why is GENEVITY the only clinic with EMFACE in Dnipro?" },
        a: { uk: "Апарат EMFACE від BTL є преміальним обладнанням з обмеженою дистрибуцією в Україні. GENEVITY придбала апарат як частина стратегії надавати пацієнтам доступ до топ-технологій, що доведені клінічними дослідженнями FDA.", ru: "Аппарат EMFACE от BTL имеет ограниченную дистрибуцию в Украине. GENEVITY приобрела аппарат как часть стратегии предоставлять доступ к топ-технологиям с клинической доказательной базой.", en: "EMFACE by BTL has limited distribution in Ukraine. GENEVITY acquired the device as part of its strategy to provide patients access to top clinically proven technologies." }},
    ]);
    console.log("✓ EMFACE");
  }

  // ─── 2. Ultraformer MPT (face) ────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "ultraformer-mpt", {
      title_uk: "Ultraformer MPT", title_ru: "Ultraformer MPT", title_en: "Ultraformer MPT",
      h1_uk: "Ultraformer MPT у Дніпрі – СМАС-ліфтинг ультразвуком",
      h1_ru: "Ultraformer MPT в Днепре – СМАС-лифтинг ультразвуком",
      h1_en: "Ultraformer MPT in Dnipro – Ultrasound SMAS Lifting",
      summary_uk: "Ultraformer MPT в GENEVITY – HIFU-ліфтинг обличчя та шиї без операцій. Ультразвук нагріває СМАС-шар на глибині 4,5 мм, запускаючи неоколагеногенез. Ефект 12–18 місяців.",
      summary_ru: "Ultraformer MPT в GENEVITY – HIFU-лифтинг лица и шеи без операций. Ультразвук нагревает СМАС-слой на глубине 4,5 мм. Эффект 12–18 месяцев.",
      summary_en: "Ultraformer MPT at GENEVITY – non-surgical HIFU lifting for face and neck. Ultrasound heats the SMAS layer at 4.5 mm. Effect lasts 12–18 months.",
      seo_title_uk: "Ultraformer MPT у Дніпрі – СМАС-ліфтинг ультраформер для обличчя",
      seo_title_ru: "Ultraformer MPT в Днепре – СМАС-лифтинг ультраформер для лица",
      seo_title_en: "Ultraformer MPT in Dnipro – SMAS Face Lifting",
      seo_desc_uk: "Ультраформер MPT у Дніпрі в GENEVITY. HIFU СМАС-ліфтинг обличчя та шиї. Птоз, брилі, друге підборіддя. 1 процедура на рік. Ефект через 2–3 місяці, зберігається 12–18 міс.",
      seo_desc_ru: "Ultraformer MPT в Днепре в GENEVITY. HIFU СМАС-лифтинг лица и шеи. 1 процедура в год. Эффект через 2–3 месяца, 12–18 месяцев.",
      seo_desc_en: "Ultraformer MPT in Dnipro at GENEVITY. HIFU SMAS lifting for face and neck. 1 session per year. Results develop over 2–3 months, lasting 12–18 months.",
      sort_order: 11,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "Ultraformer MPT – як працює HIFU СМАС-ліфтинг", ru: "Ultraformer MPT – как работает HIFU СМАС-лифтинг", en: "Ultraformer MPT – How HIFU SMAS Lifting Works" },
        body: { uk: "Ultraformer MPT від CLASSYS – апарат для мікрофокусованого ультразвукового ліфтингу (HIFU). Ультразвукові промені нагрівають СМАС-шар на глибині 4,5 мм без пошкодження поверхні шкіри. У точці фокусу утворюється мікрокоагуляційна зона – колаген скорочується і запускається активний неоколагеногенез. Шкіра підтягується зсередини без жодного розрізу.",
          ru: "Ultraformer MPT от CLASSYS – аппарат для HIFU-лифтинга. Ультразвуковые лучи нагревают СМАС-слой на глубине 4,5 мм без повреждения поверхности кожи. В точке фокуса – микрокоагуляция, сокращение коллагена, запуск неоколлагеногенеза.",
          en: "Ultraformer MPT by CLASSYS – micro-focused ultrasound (HIFU) lifting device. Ultrasound beams heat the SMAS layer at 4.5 mm depth without damaging skin surface. At the focal point: microcoagulation, collagen contraction, and active neocollagenesis begin." },
      }},
      { type: "richText", sort_order: 2, data: {
        heading: { uk: "Показання, результат і курс Ultraformer MPT", ru: "Показания, результат и курс Ultraformer MPT", en: "Indications, Results and Course" },
        body: { uk: "**Показання:** птоз тканин та нечіткий овал, «брилі», друге підборіддя, зморшки шиї та декольте, опущені кути рота та брови.\n\n**Результат:** ліфтинг овалу та брів, зменшення другого підборіддя, підтяжка шиї. Ефект розвивається впродовж 2–3 місяців і зберігається 12–18 місяців. Зазвичай достатньо 1 сеансу на рік.\n\n**Процедура:** 45–90 хвилин. Можлива легка анестезія. Більшість пацієнтів повертаються до роботи наступного дня.",
          ru: "**Показания:** птоз, «брыли», второй подбородок, морщины шеи.\n\n**Результат:** лифтинг овала, шеи, уменьшение второго подбородка. Эффект 12–18 месяцев, 1 сеанс в год.\n\n**Процедура:** 45–90 мин, лёгкая анестезия при необходимости.",
          en: "**Indications:** tissue ptosis, jowls, double chin, neck wrinkles, drooping mouth corners and brows.\n\n**Results:** jaw and brow lifting, double chin reduction, neck tightening. Effect develops over 2–3 months, lasts 12–18 months. Typically 1 session per year.\n\n**Procedure:** 45–90 minutes. Optional light anaesthesia. Most patients return to work the next day." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Чи болісна процедура Ultraformer MPT?", ru: "Болезненна ли процедура Ultraformer MPT?", en: "Is Ultraformer MPT painful?" },
        a: { uk: "Більшість пацієнтів описують відчуття як помірне поколювання або тепло у точках фокусу ультразвуку. При підвищеній чутливості лікар наносить анестезуючий крем за 30–40 хвилин до початку. Після процедури можлива легка гіперемія, яка проходить протягом кількох годин.", ru: "Большинство описывают умеренное покалывание в точках фокуса. При необходимости – анестезирующий крем. Лёгкая гиперемия после процедуры проходит за несколько часов.", en: "Most patients describe moderate tingling at focus points. Numbing cream is applied if needed. Mild redness fades within a few hours." }},
      { q: { uk: "Коли видно результат Ultraformer MPT?", ru: "Когда виден результат Ultraformer MPT?", en: "When are Ultraformer MPT results visible?" },
        a: { uk: "Перші зміни помітні вже через 2–4 тижні після процедури. Максимальний ефект розвивається впродовж 2–3 місяців – саме тоді завершується процес неоколагеногенезу. Результат зберігається 12–18 місяців.", ru: "Первые изменения – через 2–4 недели. Максимальный эффект – через 2–3 месяца (завершение неоколлагеногенеза). Результат – 12–18 месяцев.", en: "First changes appear 2–4 weeks post-procedure. Maximum effect develops over 2–3 months as neocollagenesis completes. Results last 12–18 months." }},
      { q: { uk: "Чи можна поєднувати Ultraformer MPT з ін'єкційними процедурами?", ru: "Можно ли совмещать Ultraformer MPT с инъекционными процедурами?", en: "Can Ultraformer MPT be combined with injectables?" },
        a: { uk: "Так. Популярна комбінація: Ultraformer MPT + біоревіталізація (ліфтинг + зволоження). Ін'єкційні процедури проводять через 2–4 тижні після HIFU. Комбінація дає синергічний ефект: ліфтинг апаратом + живлення шкіри ін'єкціями.", ru: "Да. Популярная комбинация: Ultraformer MPT + биоревитализация. Инъекции – через 2–4 недели после HIFU. Синергичный эффект: лифтинг + питание кожи.", en: "Yes. Popular combination: Ultraformer MPT + biorevitalisation (lifting + hydration). Injectables 2–4 weeks after HIFU. Synergistic effect: apparatus lifting + skin nutrition." }},
    ]);
    console.log("✓ Ultraformer MPT");
  }

  // ─── 3. EXION Face ────────────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "exion-face", {
      title_uk: "EXION Face", title_ru: "EXION Face", title_en: "EXION Face",
      h1_uk: "Процедура EXION Face у Дніпрі – радіочастотна терапія для шкіри обличчя",
      h1_ru: "Процедура EXION Face в Днепре – радиочастотная терапия для кожи лица",
      h1_en: "EXION Face Treatment in Dnipro – Radiofrequency Therapy for Facial Skin",
      summary_uk: "EXION Face в GENEVITY – монополярний RF з AI-контролем. Стимулює власне вироблення гіалуронової кислоти в шкірі без ін'єкцій. Курс 4–6 процедур.",
      summary_ru: "EXION Face в GENEVITY – монополярный RF с AI-контролем. Стимулирует выработку гиалуроновой кислоты в коже без инъекций. Курс 4–6 процедур.",
      summary_en: "EXION Face at GENEVITY – monopolar RF with AI control. Stimulates natural hyaluronic acid production without injections. Course of 4–6 sessions.",
      seo_title_uk: "Процедура EXION Face у Дніпрі – RF-терапія для красивої шкіри",
      seo_title_ru: "Процедура EXION Face в Днепре – RF-терапия для красивой кожи",
      seo_title_en: "EXION Face Procedure in Dnipro – RF Therapy for Beautiful Skin",
      seo_desc_uk: "EXION Face у Дніпрі в GENEVITY. Монополярний RF + AI. Зволоження, пружність, текстура без голок. 4–6 сеансів, перший ефект після 2–3 процедур.",
      seo_desc_ru: "EXION Face в Днепре в GENEVITY. Монополярный RF + AI. Увлажнение, упругость, текстура без игл. 4–6 сеансов.",
      seo_desc_en: "EXION Face in Dnipro at GENEVITY. Monopolar RF + AI. Hydration, firmness, texture without needles. 4–6 sessions, first effect after 2–3 procedures.",
      sort_order: 12,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "EXION Face – RF + штучний інтелект для відновлення шкіри", ru: "EXION Face – RF + искусственный интеллект для восстановления кожи", en: "EXION Face – RF + AI for Skin Renewal" },
        body: { uk: "Exion від BTL – інноваційна технологія монополярного RF-впливу з вбудованим штучним інтелектом, який у режимі реального часу регулює щільність та глибину нагріву кожної точки. Унікальна особливість Exion – стимуляція власного вироблення гіалуронової кислоти в шкірі без ін'єкцій.\n\n**Показання до Exion Face:** зневоднення та тьмяність шкіри, дрібні та середні зморшки, знижений тонус, великі пори, нерівна текстура, підготовка шкіри перед більш інтенсивними процедурами.\n\n**Курс:** 4–6 сеансів з інтервалом 1–2 тижні. Перший видимий ефект – після 2–3 процедур. Шкіра виглядає щільнішою, зволоженішою, рельєф вирівнюється.",
          ru: "Exion от BTL – монополярный RF с ИИ, регулирующим нагрев в реальном времени. Стимулирует выработку гиалуроновой кислоты без инъекций.\n\n**Показания:** обезвоживание, морщины, поры. **Курс:** 4–6 сеансов, первый эффект после 2–3 процедур.",
          en: "Exion by BTL – monopolar RF with built-in AI adjusting heat density and depth in real time. Uniquely stimulates natural hyaluronic acid production without injections.\n\n**Indications:** dehydration, fine-to-medium wrinkles, reduced tone, enlarged pores, uneven texture.\n\n**Course:** 4–6 sessions, 1–2 weeks apart. First visible effect after 2–3 procedures." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Скільки сеансів Exion Face потрібно для результату?", ru: "Сколько сеансов Exion Face нужно для результата?", en: "How many Exion Face sessions are needed?" },
        a: { uk: "Курс Exion Face – 4–6 сеансів з інтервалом 1–2 тижні. Перші видимі зміни після 2–3 процедур. Фінальний результат оцінюється через 4 тижні після останнього сеансу.", ru: "4–6 сеансов, 1–2 недели между ними. Первые изменения – после 2–3 процедур.", en: "4–6 sessions, 1–2 weeks apart. First visible changes after 2–3 sessions. Final result assessed 4 weeks after last session." }},
      { q: { uk: "Чим Exion Face відрізняється від біоревіталізації?", ru: "Чем Exion Face отличается от биоревитализации?", en: "How does Exion Face differ from biorevitalisation?" },
        a: { uk: "Biоревіталізація доставляє гіалуронову кислоту ззовні через ін'єкції. Exion Face стимулює шкіру виробляти власну гіалуронову кислоту через RF-вплив. Exion – безголкова альтернатива для пацієнтів, що уникають ін'єкцій. Ефект трохи м'якший, але природний і накопичувальний.", ru: "Биоревитализация доставляет гиалуроновую кислоту через инъекции. Exion стимулирует выработку собственной ГК через RF. Безыгольная альтернатива с накопительным эффектом.", en: "Biorevitalisation delivers hyaluronic acid via injections. Exion Face stimulates the skin to produce its own HA through RF. Needle-free alternative with a softer but natural, cumulative effect." }},
    ]);
    console.log("✓ EXION Face");
  }

  // ─── 4. VOLNEWMER ────────────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "volnewmer", {
      title_uk: "VOLNEWMER", title_ru: "VOLNEWMER", title_en: "VOLNEWMER",
      h1_uk: "Процедура VOLNEWMER у Дніпрі – радіочастотний ліфтинг та омолодження обличчя",
      h1_ru: "Процедура VOLNEWMER в Днепре – радиочастотный лифтинг и омоложение лица",
      h1_en: "VOLNEWMER Treatment in Dnipro – Radiofrequency Face Lifting and Rejuvenation",
      summary_uk: "VOLNEWMER в GENEVITY – трансдермальний RF-апарат, що доставляє гіалуронову кислоту та пептиди у дерму без голок. Результат видно після першого сеансу.",
      summary_ru: "VOLNEWMER в GENEVITY – трансдермальный RF-аппарат: гиалуроновая кислота и пептиды в дерму без игл. Результат – после первого сеанса.",
      summary_en: "VOLNEWMER at GENEVITY – transdermal RF device delivering hyaluronic acid and peptides into the dermis without needles. Result visible after first session.",
      seo_title_uk: "Процедура VOLNEWMER у Дніпрі – безголковий RF-ліфтинг",
      seo_title_ru: "Процедура VOLNEWMER в Днепре – безыгольный RF-лифтинг",
      seo_title_en: "VOLNEWMER Procedure in Dnipro – Needle-Free RF Lifting",
      seo_desc_uk: "VOLNEWMER у Дніпрі в GENEVITY. Безголковий RF-ліфтинг + доставка гіалуронової кислоти. 30–40 хв. Ефект після першого сеансу. Курс 4–6 процедур.",
      seo_desc_ru: "VOLNEWMER в Днепре в GENEVITY. Безыгольный RF-лифтинг + гиалуроновая кислота в дерму. 30–40 мин. Эффект после первого сеанса.",
      seo_desc_en: "VOLNEWMER in Dnipro at GENEVITY. Needle-free RF lifting + hyaluronic acid delivery. 30–40 min. Effect after first session. Course of 4–6 procedures.",
      sort_order: 13,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "VOLNEWMER – безголковий RF-ліфтинг та зволоження обличчя", ru: "VOLNEWMER – безыгольный RF-лифтинг и увлажнение лица", en: "VOLNEWMER – Needle-Free RF Lifting and Facial Hydration" },
        body: { uk: "Volnewmer – апарат трансдермального RF-впливу, який одночасно доставляє активні речовини (гіалуронову кислоту, пептиди) у глибокі шари шкіри без голок. Технологія TRANSION відкриває канали в шкірі та транспортує компоненти в дерму – туди, де вони найефективніші.\n\n**Показання до Volnewmer:** зневоднена і тьмяна шкіра, дрібні зморшки, знижений тонус, перша птоза тканин, бажання уникнути будь-яких голок.\n\n**Процедура:** 30–40 хвилин, абсолютно комфортна. Результат видно вже після першого сеансу – шкіра виглядає зволоженою, підтягнутою, сяючою. Рекомендується курс 4–6 процедур або регулярно як підтримувальна програма.",
          ru: "Volnewmer – трансдермальный RF-аппарат с технологией TRANSION: гиалуроновая кислота и пептиды в дерму без игл.\n\n**Показания:** обезвоженная кожа, морщины, сниженный тонус. **Процедура:** 30–40 мин, результат после первого сеанса.",
          en: "Volnewmer – transdermal RF device with TRANSION technology delivering hyaluronic acid and peptides into the dermis without needles.\n\n**Indications:** dehydrated skin, fine wrinkles, reduced tone. **Procedure:** 30–40 min, result visible after first session. Course of 4–6 procedures recommended." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Чи є різниця між Exion Face та Volnewmer?", ru: "Есть ли разница между Exion Face и Volnewmer?", en: "What is the difference between Exion Face and Volnewmer?" },
        a: { uk: "Обидва апарати – безголкові RF-процедури. Exion Face використовує AI-контроль і більш орієнтований на підвищення тонусу та вироблення HA. Volnewmer доставляє готові активні компоненти (HA, пептиди) трансдермально. Ефект Volnewmer видно швидше (після 1 сеансу), Exion – більш глибокий і накопичувальний.", ru: "Оба – безыгольные RF. Exion – AI-контроль, стимуляция выработки HA. Volnewmer – доставка готовых активных компонентов трансдермально. Volnewmer даёт эффект после 1 сеанса, Exion – глубокий накопительный.", en: "Both are needle-free RF procedures. Exion Face uses AI control and focuses more on tone and HA stimulation. Volnewmer delivers ready-made actives (HA, peptides) transdermally. Volnewmer shows results after 1 session; Exion is deeper and cumulative." }},
    ]);
    console.log("✓ VOLNEWMER");
  }

  // ─── 5. EMSCULPT NEO ─────────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "emsculpt-neo", {
      title_uk: "Emsculpt Neo", title_ru: "Emsculpt Neo", title_en: "Emsculpt Neo",
      h1_uk: "Процедура Emsculpt Neo у Дніпрі – корекція фігури без операцій",
      h1_ru: "Процедура Emsculpt Neo в Днепре – коррекция фигуры без операций",
      h1_en: "Emsculpt Neo Treatment in Dnipro – Non-Surgical Figure Correction",
      summary_uk: "Emsculpt Neo в GENEVITY – єдина технологія, що одночасно нарощує м'язи (+25%) та спалює жир (-30%). 4 процедури по 30 хв. Без хірургії та наркозу.",
      summary_ru: "Emsculpt Neo в GENEVITY – единственная технология, одновременно наращивающая мышцы (+25%) и сжигающая жир (-30%). 4 процедуры по 30 мин.",
      summary_en: "Emsculpt Neo at GENEVITY – the only technology simultaneously building muscle (+25%) and burning fat (-30%). 4 × 30-minute sessions. No surgery.",
      seo_title_uk: "Процедура Emsculpt Neo у Дніпрі – м'язи та корекція фігури",
      seo_title_ru: "Процедура Emsculpt Neo в Днепре – мышцы и коррекция фигуры",
      seo_title_en: "Emsculpt Neo Procedure in Dnipro – Muscle Building and Body Correction",
      seo_desc_uk: "Emsculpt Neo у Дніпрі в GENEVITY. +25% м'язів, -30% жиру за курс 4 процедур. HIFES + RF. Живіт, сідниці, стегна, руки. Для чоловіків та жінок.",
      seo_desc_ru: "Emsculpt Neo в Днепре в GENEVITY. +25% мышц, -30% жира. Курс 4 процедуры. HIFES + RF. Живот, ягодицы, бёдра, руки.",
      seo_desc_en: "Emsculpt Neo in Dnipro at GENEVITY. +25% muscle, -30% fat. 4-session course. HIFES + RF. Abdomen, buttocks, thighs, arms. For men and women.",
      sort_order: 20,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "Emsculpt Neo – накачування м'язів та спалювання жиру одночасно", ru: "Emsculpt Neo – накачивание мышц и сжигание жира одновременно", en: "Emsculpt Neo – Build Muscle and Burn Fat Simultaneously" },
        body: { uk: "EMSCULPT NEO від BTL – єдина у світі технологія, що одночасно нарощує м'язи та руйнує жирові клітини. Під час 30-хвилинного сеансу HIFES-електромагнітна стимуляція змушує м'яз виконати 20 000 супрамаксимальних скорочень. Паралельно RF-нагрівання піднімає температуру жирових клітин до точки їх деструкції.\n\n**Клінічно доведені результати (FDA):** +25% до об'єму м'язів, -30% жирової тканини.\n\n**Показання:** недостатній тонус м'язів живота, сідниць, стегон і рук; локальні жирові відкладення; діастаз прямих м'язів живота; бажання поліпшити рельєф без тренувань або після вагітності.\n\n**Курс:** 4 сеанси з інтервалом 5–7 днів. Ефект оцінюється через 1–3 місяці. Підходить чоловікам і жінкам.",
          ru: "EMSCULPT NEO от BTL – единственная технология, одновременно наращивающая мышцы и разрушающая жир. 20 000 сокращений за 30 мин + RF-деструкция жира.\n\n**Результаты (FDA):** +25% мышц, -30% жира.\n\n**Курс:** 4 сеанса, 5–7 дней. Оценка через 1–3 месяца.",
          en: "EMSCULPT NEO by BTL – the world's only technology simultaneously building muscle and destroying fat. 20,000 supramaximal contractions per 30-min session + RF fat destruction.\n\n**FDA-proven results:** +25% muscle volume, -30% fat tissue.\n\n**Course:** 4 sessions, 5–7 days apart. Results assessed 1–3 months after course completion." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Скільки процедур Emsculpt Neo необхідно?", ru: "Сколько процедур Emsculpt Neo необходимо?", en: "How many Emsculpt Neo sessions are needed?" },
        a: { uk: "Стандартний курс – 4 процедури з інтервалом 5–7 днів. Перші результати помітні після 2–3 сеансів. Фінальний ефект оцінюється через 1–3 місяці після курсу.", ru: "4 процедуры, 5–7 дней между ними. Финальный результат – через 1–3 месяца.", en: "4 sessions, 5–7 days apart. Final results assessed 1–3 months after the course." }},
      { q: { uk: "Чи підходить Emsculpt Neo чоловікам?", ru: "Подходит ли Emsculpt Neo мужчинам?", en: "Is Emsculpt Neo suitable for men?" },
        a: { uk: "Так. Популярний серед чоловіків для рельєфу живота, сідниць та рук. Протипоказання і кількість сеансів ідентичні для обох статей.", ru: "Да, популярен для рельефа живота, ягодиц и рук. Противопоказания одинаковы.", en: "Yes. Popular among men for abdominal, gluteal, and arm definition. Contraindications and session count are identical." }},
      { q: { uk: "Чи є реабілітація після Emsculpt Neo?", ru: "Есть ли реабилитация после Emsculpt Neo?", en: "Is there recovery after Emsculpt Neo?" },
        a: { uk: "Реабілітації немає – можна повертатися до роботи одразу. Крепатура м'язів 1–3 доби є нормою – це ознака активної роботи м'язів під час процедури.", ru: "Реабилитации нет. Крепатура 1–3 дня – норма.", en: "No downtime. Muscle soreness for 1–3 days is normal – a sign of active muscle work during the procedure." }},
    ]);
    console.log("✓ Emsculpt Neo");
  }

  // ─── 6. Ultraformer MPT Body ──────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "ultraformer-mpt-body", {
      title_uk: "Ultraformer MPT для тіла", title_ru: "Ultraformer MPT для тела", title_en: "Ultraformer MPT for Body",
      h1_uk: "Ultraformer MPT для тіла у Дніпрі – СМАС-ліфтинг шкіри тіла",
      h1_ru: "Ultraformer MPT для тела в Днепре – СМАС-лифтинг кожи тела",
      h1_en: "Ultraformer MPT for Body in Dnipro – SMAS Skin Lifting",
      summary_uk: "Ultraformer MPT по тілу в GENEVITY – HIFU-підтяжка млявої шкіри після схуднення або вагітності. Живіт, стегна, руки, декольте. Ефект 12–18 місяців.",
      summary_ru: "Ultraformer MPT по телу в GENEVITY – HIFU-подтяжка кожи после похудения. Живот, бёдра, руки, декольте. Эффект 12–18 месяцев.",
      summary_en: "Ultraformer MPT body at GENEVITY – HIFU skin tightening after weight loss or pregnancy. Abdomen, thighs, arms, décolletage. Effect 12–18 months.",
      seo_title_uk: "Ultraformer MPT для тіла у Дніпрі – ліфтинг шкіри ультраформером",
      seo_title_ru: "Ultraformer MPT для тела в Днепре – лифтинг кожи ультраформером",
      seo_title_en: "Ultraformer MPT for Body in Dnipro – Skin Lifting",
      seo_desc_uk: "Ультраформер для тіла у Дніпрі в GENEVITY. HIFU підтяжка живота, стегон, рук, декольте. 1 процедура на рік. Ефект через 2–3 місяці, зберігається 12–18 міс.",
      seo_desc_ru: "Ультраформер для тела в Днепре в GENEVITY. HIFU-подтяжка живота, бёдер, рук. 1 процедура в год, эффект 12–18 месяцев.",
      seo_desc_en: "Ultraformer MPT body in Dnipro at GENEVITY. HIFU skin tightening abdomen, thighs, arms. 1 session per year. Effect 12–18 months.",
      sort_order: 21,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "Ultraformer MPT для тіла – ультразвуковий ліфтинг шкіри", ru: "Ultraformer MPT для тела – ультразвуковой лифтинг кожи", en: "Ultraformer MPT for Body – Ultrasound Skin Lifting" },
        body: { uk: "Ultraformer MPT по тілу – та сама технологія HIFU, що підтягує обличчя, адаптована для зон тіла. Ультразвукові промені нагрівають колаген на глибині 3–4,5 мм, запускаючи його скорочення та активний неоколагеногенез. Результат – помітне підтягування та ущільнення шкіри.\n\n**Показання:** млява шкіра після схуднення або вагітності, птоз внутрішньої поверхні стегон і плечей, ліфтинг живота, целюліт 1–2 ступеня.\n\n**Зони обробки:** живіт, стегна, внутрішня поверхня рук і ніг, декольте, шия, коліна.\n\n**Результат:** підтягування впродовж 2–3 місяців, максимальний ефект через 3 місяці. Зберігається 12–18 місяців. Зазвичай 1 сеанс на рік.",
          ru: "Ultraformer MPT по телу – HIFU-лифтинг кожи тела. Нагрев коллагена 3–4,5 мм.\n\n**Показания:** вялая кожа, птоз, целлюлит. **Зоны:** живот, бёдра, руки, декольте.\n\n**Результат:** подтяжка 2–3 месяца, 12–18 месяцев.",
          en: "Ultraformer MPT for body – the same HIFU technology adapted for body zones. Heats collagen at 3–4.5 mm depth, triggering neocollagenesis.\n\n**Indications:** loose skin post-weight loss/pregnancy, inner thigh/arm ptosis, abdominal laxity, cellulite grades 1–2.\n\n**Zones:** abdomen, thighs, inner arms/legs, décolletage, neck, knees.\n\n**Result:** gradual tightening over 2–3 months, lasting 12–18 months." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Скільки процедур Ultraformer MPT потрібно для тіла?", ru: "Сколько процедур Ultraformer MPT нужно для тела?", en: "How many Ultraformer MPT body sessions are needed?" },
        a: { uk: "Зазвичай достатньо 1 процедури на рік. При значній млявості шкіри або декількох зонах – 2 сеанси з інтервалом 3–6 місяців. Максимальний ефект розвивається через 3 місяці після процедури.", ru: "Обычно 1 сеанс в год. При значительной вялости или нескольких зонах – 2 сеанса, интервал 3–6 месяцев.", en: "Typically 1 session per year. For significant laxity or multiple zones: 2 sessions, 3–6 months apart. Maximum effect at 3 months." }},
    ]);
    console.log("✓ Ultraformer MPT Body");
  }

  // ─── 7. EXION Body ───────────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "exion-body", {
      title_uk: "EXION Body", title_ru: "EXION Body", title_en: "EXION Body",
      h1_uk: "Процедура EXION Body у Дніпрі – радіочастотна терапія для шкіри тіла",
      h1_ru: "Процедура EXION Body в Днепре – радиочастотная терапия для кожи тела",
      h1_en: "EXION Body Treatment in Dnipro – Radiofrequency Therapy for Body Skin",
      summary_uk: "EXION Body в GENEVITY – монополярний RF з AI-контролем для корекції целюліту та підвищення пружності шкіри тіла. Курс 4–8 процедур, будь-які зони тіла.",
      summary_ru: "EXION Body в GENEVITY – монополярный RF с AI-контролем для целлюлита и упругости кожи. 4–8 процедур, любые зоны.",
      summary_en: "EXION Body at GENEVITY – monopolar RF with AI control for cellulite correction and skin firmness. 4–8 sessions, any body zone.",
      seo_title_uk: "Процедура EXION Body у Дніпрі – RF-терапія для тіла",
      seo_title_ru: "Процедура EXION Body в Днепре – RF-терапия для тела",
      seo_title_en: "EXION Body Procedure in Dnipro – RF Therapy for the Body",
      seo_desc_uk: "EXION Body у Дніпрі в GENEVITY. Монополярний RF + AI для целюліту, пружності, текстури. 4–8 сеансів. Результат з 3–4 процедури.",
      seo_desc_ru: "EXION Body в Днепре в GENEVITY. RF + AI для целлюлита и упругости. 4–8 сеансов.",
      seo_desc_en: "EXION Body in Dnipro at GENEVITY. Monopolar RF + AI for cellulite and firmness. 4–8 sessions. Results from session 3–4.",
      sort_order: 22,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "EXION Body – RF-корекція текстури та целюліту", ru: "EXION Body – RF-коррекция текстуры и целлюлита", en: "EXION Body – RF Correction of Skin Texture and Cellulite" },
        body: { uk: "Exion Body від BTL використовує монополярний RF з AI-контролем для рівномірного нагрівання шкіри та підшкірного шару. Апарат ефективно вирівнює «апельсинову шкірку», підвищує пружність та покращує текстуру на всіх зонах тіла.\n\n**Показання:** целюліт будь-якого ступеня, знижена пружність шкіри, нерівна текстура живота, стегон, сідниць та рук.\n\n**Курс:** 4–8 сеансів залежно від зони та ступеня вираженості проблеми. Процедура комфортна – пацієнт відчуває рівномірне тепло. Результати видно вже після 3–4 сеансів.",
          ru: "Exion Body от BTL – монополярный RF с AI для коррекции текстуры и целлюлита.\n\n**Показания:** целлюлит, сниженная упругость. **Курс:** 4–8 сеансов. Результаты – с 3–4 сеанса.",
          en: "Exion Body by BTL – monopolar RF with AI control for uniform heating and cellulite correction.\n\n**Indications:** any-grade cellulite, reduced firmness, uneven texture.\n\n**Course:** 4–8 sessions. Visible results from session 3–4." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Чи можна поєднувати EXION Body з Emsculpt Neo?", ru: "Можно ли совмещать EXION Body с Emsculpt Neo?", en: "Can EXION Body be combined with Emsculpt Neo?" },
        a: { uk: "Так – це оптимальна комбінація. Emsculpt Neo нарощує м'язи та спалює жир, а Exion Body покращує текстуру та пружність шкіри над зоною обробки. Разом вони дають результат, що раніше був досяжний лише хірургічним шляхом.", ru: "Да – оптимальная комбинация: Emsculpt Neo (мышцы + жир) + Exion Body (текстура кожи).", en: "Yes – optimal combination: Emsculpt Neo (muscle + fat) + Exion Body (skin texture and firmness over the treated area)." }},
    ]);
    console.log("✓ EXION Body");
  }

  // ─── 8. M22 Stellar Black ────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "m22-stellar-black", {
      title_uk: "M22 Stellar Black", title_ru: "M22 Stellar Black", title_en: "M22 Stellar Black",
      h1_uk: "Процедура M22 Stellar Black у Дніпрі – фотоомолодження та корекція дефектів шкіри",
      h1_ru: "Процедура M22 Stellar Black в Днепре – фотоомоложение и коррекция дефектов кожи",
      h1_en: "M22 Stellar Black Treatment in Dnipro – Photorejuvenation and Skin Defect Correction",
      summary_uk: "M22 Stellar Black в GENEVITY – IPL + Nd:YAG для видалення пігментних плям, судинних зірочок та купероза. Мінімальна реабілітація, 3–5 процедур.",
      summary_ru: "M22 Stellar Black в GENEVITY – IPL + Nd:YAG для пигментных пятен, купероза, сосудистых звёздочек. 3–5 процедур.",
      summary_en: "M22 Stellar Black at GENEVITY – IPL + Nd:YAG for pigmentation, rosacea, and spider veins. Minimal recovery, 3–5 sessions.",
      seo_title_uk: "Процедура M22 Stellar Black у Дніпрі – IPL фотоомолодження",
      seo_title_ru: "Процедура M22 Stellar Black в Днепре – IPL фотоомоложение",
      seo_title_en: "M22 Stellar Black Treatment in Dnipro – IPL Photorejuvenation",
      seo_desc_uk: "M22 Stellar Black у Дніпрі в GENEVITY. IPL + Nd:YAG. Пігментація, купероз, судинні зірочки, фотостаріння. 20–45 хв. Курс 3–5 процедур.",
      seo_desc_ru: "M22 Stellar Black в Днепре в GENEVITY. IPL + Nd:YAG. Пигментация, купероз, сосудистые звёздочки. 3–5 процедур.",
      seo_desc_en: "M22 Stellar Black in Dnipro at GENEVITY. IPL + Nd:YAG. Pigmentation, rosacea, spider veins, photoageing. 3–5 sessions.",
      sort_order: 23,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "M22 Stellar Black – IPL та Nd:YAG для корекції шкіри", ru: "M22 Stellar Black – IPL и Nd:YAG для коррекции кожи", en: "M22 Stellar Black – IPL and Nd:YAG for Skin Correction" },
        body: { uk: "M22 Stellar Black від Lumenis – передова мультимодульна платформа IPL (OPT-технологія) з Nd:YAG лазером. IPL ефективно видаляє пігментні плями (веснянки, хлоазма, сонячне лентиго), дифузне почервоніння та судинні зірочки. Nd:YAG застосовується для глибших судинних уражень та стійкої пігментації.\n\n**Кому підходить:** пігментні плями, судинні зірочки, купероз, дифузне почервоніння, акне та постакне в ремісії, фотостаріння.\n\n**Процедура:** 20–45 хвилин. Реабілітація мінімальна – легке почервоніння 24–48 годин. Курс: 3–5 процедур з інтервалом 3–4 тижні. Уникати засмаги 2–4 тижні перед курсом.",
          ru: "M22 Stellar Black от Lumenis – IPL (OPT) + Nd:YAG лазер. Пигментные пятна, купероз, сосудистые звёздочки. Реабилитация 24–48 ч. Курс 3–5 процедур.",
          en: "M22 Stellar Black by Lumenis – advanced IPL (OPT technology) + Nd:YAG laser. Removes pigmentation, rosacea, spider veins. Minimal recovery: 24–48 hours redness. Course: 3–5 sessions, 3–4 weeks apart." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Скільки процедур M22 Stellar Black потрібно для видалення пігментних плям?", ru: "Сколько процедур M22 Stellar Black нужно для удаления пигментных пятен?", en: "How many M22 Stellar Black sessions are needed for pigmentation?" },
        a: { uk: "Для поверхневих пігментних плям (веснянки, сонячне лентиго) зазвичай достатньо 1–2 процедур. Стійка пігментація (хлоазма) потребує 3–5 процедур. Результат помітний через 7–14 днів після кожного сеансу.", ru: "Поверхностные пятна (веснушки, лентиго): 1–2 процедуры. Стойкая пигментация: 3–5 процедур.", en: "Surface spots (freckles, solar lentigo): 1–2 sessions. Stubborn pigmentation (melasma): 3–5 sessions. Result visible 7–14 days after each session." }},
    ]);
    console.log("✓ M22 Stellar Black");
  }

  // ─── 9. Splendor X ───────────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "splendor-x", {
      title_uk: "Splendor X", title_ru: "Splendor X", title_en: "Splendor X",
      h1_uk: "Процедура Splendor X у Дніпрі – лазерне видалення волосся та омолодження шкіри",
      h1_ru: "Процедура Splendor X в Днепре – лазерное удаление волос и омоложение кожи",
      h1_en: "Splendor X Treatment in Dnipro – Laser Hair Removal and Skin Rejuvenation",
      summary_uk: "Splendor X в GENEVITY – апарат Alexandrite + Nd:YAG для безболісного лазерного видалення волосся та фотоомолодження шкіри. Усі типи шкіри та волосся.",
      summary_ru: "Splendor X в GENEVITY – Alexandrite + Nd:YAG для безболезненной лазерной эпиляции и фотоомоложения. Все типы кожи.",
      summary_en: "Splendor X at GENEVITY – Alexandrite + Nd:YAG for painless laser hair removal and photorejuvenation. All skin and hair types.",
      seo_title_uk: "Процедура Splendor X у Дніпрі – лазерна епіляція та омолодження",
      seo_title_ru: "Процедура Splendor X в Днепре – лазерная эпиляция и омоложение",
      seo_title_en: "Splendor X Treatment in Dnipro – Laser Hair Removal and Rejuvenation",
      seo_desc_uk: "Splendor X у Дніпрі в GENEVITY. Alexandrite + Nd:YAG. Лазерна епіляція всіх зон, фотоомолодження, корекція пігментації та судин. Для всіх типів шкіри.",
      seo_desc_ru: "Splendor X в Днепре в GENEVITY. Alexandrite + Nd:YAG. Лазерная эпиляция, фотоомоложение, пигментация. Все типы кожи.",
      seo_desc_en: "Splendor X in Dnipro at GENEVITY. Alexandrite + Nd:YAG. Laser hair removal all zones, photorejuvenation, pigmentation and vessel correction. All skin types.",
      sort_order: 24,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "Splendor X – лазер Alexandrite + Nd:YAG для двох задач", ru: "Splendor X – лазер Alexandrite + Nd:YAG для двух задач", en: "Splendor X – Alexandrite + Nd:YAG Laser for Two Goals" },
        body: { uk: "Splendor X від Lumenis – унікальна платформа, що поєднує два лазери в одному апараті: Alexandrite (755 нм) для світлої шкіри та Nd:YAG (1064 нм) для темної. Квадратний профіль пучка SQUARE рівномірно покриває поверхню без перекриттів і пропусків. Система BLEND X дозволяє одночасно використовувати обидва лазери.\n\n**Лазерна епіляція Splendor X:** видалення волосся на будь-яких зонах тіла та обличчя. Підходить для всіх типів шкіри, включаючи засмаглу та темну. Мінімальний дискомфорт завдяки охолоджуючій системі.\n\n**Фотоомолодження та корекція шкіри:** видалення судинних зірочок, пігментних плям, покращення тону та текстури шкіри.\n\n**Курс лазерної епіляції:** 6–8 сеансів з інтервалом 4–8 тижнів залежно від зони тіла.",
          ru: "Splendor X от Lumenis – Alexandrite (755 нм) + Nd:YAG (1064 нм). SQUARE-профиль луча. Все типы кожи.\n\n**Эпиляция:** все зоны, минимальный дискомфорт. **Фотоомоложение:** сосуды, пигмент. **Курс:** 6–8 сеансов, 4–8 недель между ними.",
          en: "Splendor X by Lumenis – Alexandrite (755 nm) + Nd:YAG (1064 nm) dual-laser platform. SQUARE beam profile. BLEND X allows simultaneous use of both lasers.\n\n**Laser hair removal:** all body and face zones. All skin types including tanned and dark.\n\n**Photorejuvenation:** spider veins, pigmentation, skin tone improvement.\n\n**Course:** 6–8 sessions, 4–8 weeks apart depending on zone." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Скільки сеансів Splendor X потрібно для лазерної епіляції?", ru: "Сколько сеансов Splendor X нужно для лазерной эпиляции?", en: "How many Splendor X sessions for laser hair removal?" },
        a: { uk: "Стандартний курс – 6–8 сеансів. Обличчя та зони бікіні зазвичай потребують 6 сеансів, ноги та спина – 8. Інтервал між сеансами: 4–6 тижнів для обличчя, 6–8 тижнів для тіла.", ru: "6–8 сеансов. Лицо, бикини – 6 сеансов. Ноги, спина – 8. Интервал 4–8 недель.", en: "6–8 sessions. Face and bikini zone: typically 6 sessions. Legs and back: 8. Interval: 4–6 weeks for face, 6–8 weeks for body." }},
    ]);
    console.log("✓ Splendor X");
  }

  // ─── 10. HydraFacial ─────────────────────────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "hydrafacial", {
      title_uk: "HydraFacial", title_ru: "HydraFacial", title_en: "HydraFacial",
      h1_uk: "Комплексне очищення HydraFacial у Дніпрі",
      h1_ru: "Комплексная чистка HydraFacial в Днепре",
      h1_en: "HydraFacial Comprehensive Cleansing in Dnipro",
      summary_uk: "HydraFacial в GENEVITY – 6 дій за один сеанс: очищення, ексфоліація, видалення комедонів, сироватки, зволоження та захист. Безпечно влітку для всіх типів шкіри.",
      summary_ru: "HydraFacial в GENEVITY – 6 действий за один сеанс. Безопасно летом, для всех типов кожи.",
      summary_en: "HydraFacial at GENEVITY – 6 actions in one session: cleansing, exfoliation, extraction, serums, hydration, protection. Safe in summer for all skin types.",
      seo_title_uk: "Hydrafacial у Дніпрі – комплексне очищення HydraFacial",
      seo_title_ru: "Hydrafacial в Днепре – комплексное очищение HydraFacial",
      seo_title_en: "HydraFacial in Dnipro – Comprehensive HydraFacial Cleansing",
      seo_desc_uk: "HydraFacial у Дніпрі в GENEVITY. Очищення, ексфоліація, сироватки – за 30–60 хв. Всі типи шкіри. Результат одразу. Курс 4–6 процедур.",
      seo_desc_ru: "HydraFacial в Днепре в GENEVITY. Очищение, сыворотки, увлажнение за 30–60 мин. Результат сразу. Все типы кожи.",
      seo_desc_en: "HydraFacial in Dnipro at GENEVITY. Cleansing, serums, hydration in 30–60 min. Immediate results. All skin types.",
      sort_order: 30,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "HydraFacial – глибоке очищення та зволоження шкіри обличчя", ru: "HydraFacial – глубокое очищение и увлажнение кожи лица", en: "HydraFacial – Deep Facial Cleansing and Hydration" },
        body: { uk: "HydraFacial – нетравматична процедура, яка за один 30–60-хвилинний сеанс виконує 6 дій: очищення, ексфоліацію, безболісне вакуумне видалення комедонів, насичення активними сироватками, зволоження та захист шкіри. Унікальна вихрова технологія Vortex-Fusion одночасно відсмоктує забруднення і доставляє активні компоненти вглиб шкіри.\n\n**Показання:** всі типи шкіри включаючи чутливу та схильну до акне. Збільшені пори, тьмяний тон, зневоднення, поверхнева пігментація, постакне, дрібні зморшки. Підходить влітку – не підвищує фоточутливість.\n\n**Протипоказання:** активні запалення (папули, пустули), герпес у стадії загострення, розацеа в активній фазі.\n\n**Результат:** видно одразу – шкіра свіжа, зволожена, сяюча. Рекомендується курс 4–6 процедур.",
          ru: "HydraFacial – 6 действий за сеанс: очищение, эксфолиация, вакуумное удаление комедонов, сыворотки, увлажнение, защита. Все типы кожи. Безопасна летом. Результат – сразу.",
          en: "HydraFacial performs 6 actions in one 30–60-minute session: cleansing, exfoliation, vacuum comedone extraction, serum infusion, hydration, protection. Vortex-Fusion simultaneously extracts and delivers actives.\n\n**Indications:** all skin types including sensitive and acne-prone. Enlarged pores, dull tone, dehydration, pigmentation, post-acne, fine wrinkles. Safe in summer.\n\n**Result:** visible immediately – fresh, hydrated, glowing skin." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Чи можна робити HydraFacial влітку?", ru: "Можно ли делать HydraFacial летом?", en: "Can HydraFacial be done in summer?" },
        a: { uk: "Так. HydraFacial безпечна влітку і не має сезонних обмежень. На відміну від CO₂ лазера або IPL, вона не підвищує фоточутливість шкіри. SPF 30+ після сеансу є стандартною рекомендацією.", ru: "Да. HydraFacial безопасна летом, не повышает фоточувствительность. SPF 30+ после сеанса.", en: "Yes. HydraFacial is safe in summer with no seasonal restrictions. Unlike CO₂ laser or IPL, it does not increase photosensitivity. SPF 30+ after session is standard advice." }},
      { q: { uk: "Як часто можна робити HydraFacial?", ru: "Как часто можно делать HydraFacial?", en: "How often can HydraFacial be done?" },
        a: { uk: "Рекомендована частота: 1 раз на місяць як підтримуюча програма. Для курсового лікування (постакне, великі пори) – 4–6 процедур з інтервалом 2–4 тижні.", ru: "1 раз в месяц – поддерживающая программа. Курс лечения: 4–6 процедур, 2–4 недели.", en: "Monthly as a maintenance programme. For treatment course (post-acne, pores): 4–6 procedures, 2–4 weeks apart." }},
    ]);
    console.log("✓ HydraFacial");
  }

  // ─── 11. AcuPulse CO₂ (skin resurfacing) ─────────────────────────────────────
  {
    const id = await upsertService(apparatusId, "acupulse-co2", {
      title_uk: "Лазерна шліфовка AcuPulse CO₂", title_ru: "Лазерная шлифовка AcuPulse CO₂", title_en: "AcuPulse CO₂ Laser Resurfacing",
      h1_uk: "Лазерна шліфовка AcuPulse CO₂ у Дніпрі",
      h1_ru: "Лазерная шлифовка AcuPulse CO₂ в Днепре",
      h1_en: "AcuPulse CO₂ Laser Resurfacing in Dnipro",
      summary_uk: "AcuPulse CO₂ в GENEVITY – золотий стандарт лікування постакне, рубців та зморшок. Фракційний CO₂ лазер (10 600 нм). Реабілітація 5–10 днів, ефект 2–5 років.",
      summary_ru: "AcuPulse CO₂ в GENEVITY – золотой стандарт лечения постакне и рубцов. Фракционный CO₂ лазер. Реабилитация 5–10 дней, эффект 2–5 лет.",
      summary_en: "AcuPulse CO₂ at GENEVITY – the gold standard for post-acne, scar, and wrinkle treatment. Fractional CO₂ laser (10,600 nm). Recovery 5–10 days, effect 2–5 years.",
      seo_title_uk: "Лазерна шліфовка AcuPulse CO₂ у Дніпрі",
      seo_title_ru: "Лазерная шлифовка AcuPulse CO₂ в Днепре",
      seo_title_en: "AcuPulse CO₂ Laser Resurfacing in Dnipro",
      seo_desc_uk: "AcuPulse CO₂ у Дніпрі в GENEVITY. Лазерна шліфовка постакне, рубців, зморшок. Місцева анестезія. Реабілітація 5–10 днів. Результат 2–5 років.",
      seo_desc_ru: "AcuPulse CO₂ в Днепре в GENEVITY. Шлифовка постакне, рубцов, морщин. Местная анестезия. Реабилитация 5–10 дней.",
      seo_desc_en: "AcuPulse CO₂ in Dnipro at GENEVITY. Laser resurfacing for post-acne, scars, wrinkles. Local anaesthesia. Recovery 5–10 days. Results 2–5 years.",
      sort_order: 31,
    });
    await addSections(id, [
      { type: "richText", sort_order: 1, data: {
        heading: { uk: "AcuPulse CO₂ – лазерна шліфовка для лікування рубців та зморшок", ru: "AcuPulse CO₂ – лазерная шлифовка для лечения рубцов и морщин", en: "AcuPulse CO₂ – Laser Resurfacing for Scars and Wrinkles" },
        body: { uk: "AcuPulse CO₂ від Lumenis – апарат фракційного вуглекислотного (CO₂) лазера, золотий стандарт лікування постакне, рубців та виражених зморшок. Лазер (10 600 нм) випаровує мікростовпці тканини в дермі, запускаючи активну регенерацію: фібробласти виробляють новий колаген, рубцева тканина замінюється на нормальну.\n\n**Показання:** постакне та рубці атрофічного типу, зморшки (дрібні та середні), нерівна текстура, розширені пори, пігментація, фотостаріння, шліфовка шиї та зони навколо очей.\n\n**Процедура:** під місцевою анестезією. Тривалість 30–90 хвилин. **Реабілітація:** 5–10 днів. Результат стабільний 2–5 років. Кількість процедур: 1–3.",
          ru: "AcuPulse CO₂ от Lumenis – золотой стандарт лечения постакне и рубцов. CO₂ лазер (10 600 нм) запускает регенерацию: рубцовая ткань замещается нормальной.\n\n**Показания:** постакне, рубцы, морщины, пигментация. **Реабилитация:** 5–10 дней. Эффект 2–5 лет.",
          en: "AcuPulse CO₂ by Lumenis – gold standard for post-acne, scar, and wrinkle treatment. CO₂ laser (10,600 nm) vaporises micro-columns, triggering regeneration and scar replacement.\n\n**Indications:** post-acne, atrophic scars, wrinkles, uneven texture, pigmentation, photoageing.\n\n**Procedure:** local anaesthesia, 30–90 min. **Recovery:** 5–10 days. Results last 2–5 years." },
      }},
    ]);
    await addFaqs(id, [
      { q: { uk: "Скільки процедур AcuPulse CO₂ потрібно для постакне?", ru: "Сколько процедур AcuPulse CO₂ нужно для постакне?", en: "How many AcuPulse CO₂ sessions for post-acne?" },
        a: { uk: "Поверхнева пігментація без рубців: 1–2 сеанси. Рубці атрофічного типу середньої глибини: 2–3 сеанси з інтервалом 2–3 місяці. Глибокі рубці: 3–4 процедури.", ru: "Поверхностная пигментация: 1–2 сеанса. Рубцы средней глубины: 2–3 сеанса. Глубокие рубцы: 3–4 процедуры.", en: "Surface pigmentation without scars: 1–2 sessions. Medium-depth atrophic scars: 2–3 sessions, 2–3 months apart. Deep scars: 3–4 procedures." }},
      { q: { uk: "Який реабілітаційний період після CO₂ лазерної шліфовки?", ru: "Какой реабилитационный период после CO₂ лазерной шлифовки?", en: "What is the recovery period after CO₂ laser resurfacing?" },
        a: { uk: "5–10 днів: дні 1–3 – гіперемія та набряк, дні 3–7 – активне лущення, до 10-го дня – загоєння. Протягом місяця після процедури необхідний щоденний SPF 50+.", ru: "5–10 дней: гиперемия и отёк (1–3), шелушение (3–7), заживление к 10 дню. SPF 50+ в течение месяца.", en: "5–10 days: redness and swelling (days 1–3), active peeling (days 3–7), healing by day 10. SPF 50+ for one month." }},
    ]);
    console.log("✓ AcuPulse CO₂ (skin resurfacing)");
  }

  // ─── Update nav_mega translations ─────────────────────────────────────────────
  const [ui] = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof ui.data === "string" ? JSON.parse(ui.data) : ui.data;
  const nav = (tree.nav_mega as Record<string, any>) || {};

  const newKeys: Record<string, { uk: string; ru: string; en: string }> = {
    apparatusFace:      { uk: "Апаратна для обличчя", ru: "Аппаратная для лица",   en: "Face Treatments" },
    apparatusBody:      { uk: "Апаратна для тіла",    ru: "Аппаратная для тела",   en: "Body Treatments" },
    emface:             { uk: "EMFACE",               ru: "EMFACE",               en: "EMFACE" },
    "ultraformer-mpt":  { uk: "Ultraformer MPT",      ru: "Ultraformer MPT",      en: "Ultraformer MPT" },
    "exion-face":       { uk: "EXION Face",           ru: "EXION Face",           en: "EXION Face" },
    volnewmer:          { uk: "VOLNEWMER",            ru: "VOLNEWMER",            en: "VOLNEWMER" },
    "emsculpt-neo":     { uk: "Emsculpt Neo",         ru: "Emsculpt Neo",         en: "Emsculpt Neo" },
    "ultraformer-mpt-body": { uk: "Ultraformer MPT для тіла", ru: "Ultraformer MPT для тела", en: "Ultraformer MPT Body" },
    "exion-body":       { uk: "EXION Body",           ru: "EXION Body",           en: "EXION Body" },
    "m22":              { uk: "M22 Stellar Black",    ru: "M22 Stellar Black",    en: "M22 Stellar Black" },
    "splendor-x":       { uk: "Splendor X",           ru: "Splendor X",           en: "Splendor X" },
    hydrafacial:        { uk: "HydraFacial",          ru: "HydraFacial",          en: "HydraFacial" },
    "acupulse-co2":     { uk: "AcuPulse CO₂",        ru: "AcuPulse CO₂",        en: "AcuPulse CO₂" },
  };

  for (const [key, val] of Object.entries(newKeys)) {
    nav[key] = val;
  }
  tree.nav_mega = nav;
  await sql`UPDATE ui_strings SET data = ${sql.json(tree)} WHERE id = 1`;
  console.log("✓ nav_mega translations updated");

  console.log("\n✅ All 11 apparatus device pages created + nav translations seeded.");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
