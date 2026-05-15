/**
 * Content gap fixes:
 * 1. Apparatus-cosmetology hub — add "Як обрати клініку" section (TZ #13)
 * 2. Laser-hair-removal hub — add prep/aftercare/side-effects sections (TZ #31)
 * 3. Nutraceuticals service — full rewrite (TZ #38: vitamins, omega-3, probiotics)
 * 4. Check-up-40 service — add age-range content (semantic: check up 41-46)
 * 5. Intimate rejuvenation category — add intimate peeling + contour section (TZ #27)
 * 6. Laboratory static page — add equipment/staff/speed/prep sections (TZ #40)
 * Run: npx tsx scripts/seed-content-gaps.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

async function addSection(ownerId: string, ownerType: string, type: string, sortOrder: number, data: object) {
  await sql`
    INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
    VALUES (${randomUUID()}, ${ownerId}, ${ownerType}, ${type}, ${sortOrder}, ${sql.json(data)})
  `;
}

async function addFaq(ownerId: string, ownerType: string, qUk: string, qRu: string, qEn: string, aUk: string, aRu: string, aEn: string, order: number) {
  await sql`
    INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
    VALUES (${randomUUID()}, ${ownerId}, ${ownerType}, ${qUk}, ${qRu}, ${qEn}, ${aUk}, ${aRu}, ${aEn}, ${order})
  `;
}

async function main() {
  // ─── 1. Apparatus-cosmetology hub — "Як обрати клініку" ─────────────────────
  const [appCat] = await sql`SELECT id FROM service_categories WHERE slug = 'apparatus-cosmetology'`;
  if (appCat) {
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM content_sections WHERE owner_id = ${appCat.id} AND owner_type = 'category'`;
    const nextOrder = Number(maxOrder[0].m) + 1;
    await addSection(appCat.id, "category", "bullets", nextOrder, {
      heading: { uk: "Як обрати клініку для апаратної косметології?", ru: "Как выбрать клинику для аппаратной косметологии?", en: "How to Choose a Clinic for Apparatus Cosmetology?" },
      items: [
        { uk: "Наявність оригінальних сертифікованих апаратів (не копій) — запитайте сертифікати", ru: "Наличие оригинальных сертифицированных аппаратов (не копий) — попросите сертификаты", en: "Original certified devices (not copies) — ask for certification documents" },
        { uk: "Процедури проводять лікарі з медичною освітою, а не косметологи без диплому", ru: "Процедуры проводят врачи с медицинским образованием, а не косметологи без диплома", en: "Procedures performed by physicians with medical degrees, not unlicensed cosmetologists" },
        { uk: "Клініка надає підтвердження лікензій на медичну діяльність", ru: "Клиника предоставляет подтверждение лицензий на медицинскую деятельность", en: "Clinic provides confirmation of medical practice licences" },
        { uk: "Перед будь-якою процедурою проводиться консультація та виключаються протипоказання", ru: "Перед любой процедурой проводится консультация и исключаются противопоказания", en: "A consultation is conducted before any procedure and contraindications are ruled out" },
        { uk: "Відгуки пацієнтів та реальні фото результатів до/після (не стокові)", ru: "Отзывы пациентов и реальные фото результатов до/после (не стоковые)", en: "Patient reviews and real before/after result photos (not stock images)" },
        { uk: "Можливість поєднання апаратних та ін'єкційних методик в одній команді лікарів", ru: "Возможность сочетания аппаратных и инъекционных методик в одной команде врачей", en: "Ability to combine apparatus and injectable methods within one team of physicians" },
      ],
    });
    console.log("✓ Apparatus-cosmetology hub: 'Як обрати клініку' section added");
  } else {
    console.warn("⚠ apparatus-cosmetology category not found");
  }

  // ─── 2. Laser-hair-removal hub — prep/aftercare/side-effects ────────────────
  const [laserCat] = await sql`SELECT id FROM service_categories WHERE slug = 'laser-hair-removal'`;
  if (laserCat) {
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM content_sections WHERE owner_id = ${laserCat.id} AND owner_type = 'category'`;
    let order = Number(maxOrder[0].m);

    await addSection(laserCat.id, "category", "steps", ++order, {
      heading: { uk: "Як підготуватися до лазерної епіляції?", ru: "Как подготовиться к лазерной эпиляции?", en: "How to Prepare for Laser Hair Removal?" },
      steps: [
        { title: { uk: "За 4–6 тижнів", ru: "За 4–6 недель", en: "4–6 weeks before" }, description: { uk: "Відмовтесь від воскової, цукрової та нитковидної депіляції — корінь волосини має бути на місці. Гоління дозволено.", ru: "Откажитесь от восковой, сахарной и нитевидной депиляции. Бритьё разрешено.", en: "Stop waxing, sugaring, and threading — the hair root must be intact. Shaving is allowed." } },
        { title: { uk: "За 2–4 тижні", ru: "За 2–4 недели", en: "2–4 weeks before" }, description: { uk: "Уникайте засмаги (природного та солярного) та фотосенсибілізуючих препаратів (ретиноїди, тетрацикліни).", ru: "Избегайте загара (естественного и солярия) и фотосенсибилизирующих препаратов (ретиноиды, тетрациклины).", en: "Avoid tanning (natural and tanning beds) and photosensitising drugs (retinoids, tetracyclines)." } },
        { title: { uk: "За 1–2 доби", ru: "За 1–2 суток", en: "1–2 days before" }, description: { uk: "Поголіть зону обробки. Не наносьте дезодоранти, креми та засоби, що містять спирт на зону перед сеансом.", ru: "Побрейте зону обработки. Не наносите дезодоранты, кремы и средства со спиртом.", en: "Shave the treatment area. Do not apply deodorants, creams, or alcohol-based products to the zone." } },
        { title: { uk: "У день процедури", ru: "В день процедуры", en: "Day of procedure" }, description: { uk: "Прийдіть зі чистою шкірою без макіяжу та косметики на зоні обробки. Зручний одяг для доступу до зони.", ru: "Чистая кожа без макияжа и косметики на зоне обработки. Удобная одежда.", en: "Clean skin without make-up or cosmetics on the treatment area. Comfortable clothing for zone access." } },
      ],
    });

    await addSection(laserCat.id, "category", "bullets", ++order, {
      heading: { uk: "Догляд після лазерної епіляції", ru: "Уход после лазерной эпиляции", en: "Aftercare Following Laser Hair Removal" },
      items: [
        { uk: "24–48 годин: уникайте гарячого душу, сауни, лазні та активних фізнавантажень", ru: "24–48 часов: избегайте горячего душа, сауны, бани и интенсивных физнагрузок", en: "24–48 hours: avoid hot showers, sauna, steam rooms, and intense exercise" },
        { uk: "2 тижні: захист SPF 50+ на оброблених зонах при виході на сонце", ru: "2 недели: SPF 50+ на обработанных зонах при выходе на солнце", en: "2 weeks: SPF 50+ on treated areas when outdoors" },
        { uk: "Зволожуйте шкіру легким засобом без спирту — пантенол або алое вера", ru: "Увлажняйте кожу лёгким средством без спирта — пантенол или алоэ вера", en: "Moisturise with a light alcohol-free product — panthenol or aloe vera" },
        { uk: "Видаляйте волосся, що залишилося, лише гоління — не щипцями та не воском", ru: "Удаляйте оставшиеся волосы только бритьём — не пинцетом и не воском", en: "Remove any remaining hairs by shaving only — no tweezers or waxing" },
        { uk: "Незначне почервоніння та набряк фолікулів — норма протягом 24–48 годин", ru: "Лёгкое покраснение и отёк фолликулов — норма в течение 24–48 часов", en: "Mild redness and follicle swelling — normal for 24–48 hours" },
      ],
    });

    await addSection(laserCat.id, "category", "richText", ++order, {
      heading: { uk: "Можливі побічні ефекти та що є нормою", ru: "Возможные побочные эффекты и что является нормой", en: "Possible Side Effects and What is Normal" },
      body: { uk: "Лазерна епіляція на Splendor X — одна з найбезпечніших процедур при дотриманні протоколу. Нормальні реакції, які проходять самостійно: легке почервоніння та набряк в зоні фолікулів (24–48 год), незначне поколювання під час процедури, легкий темний колір волосин у фолікулах (1–3 тижні після сеансу — волосся виходить назовні).\n\nПри появі наступних симптомів слід звернутися до лікаря: сильне стійке почервоніння більше 48 годин, утворення пухирів, виражений набряк, ознаки інфекції. Ризик побічних ефектів мінімальний при дотриманні рекомендацій щодо підготовки (відсутність засмаги) та правильному виборі параметрів апарата лікарем.", ru: "Лазерная эпиляция на Splendor X — одна из самых безопасных процедур при соблюдении протокола. Нормальные реакции (проходят самостоятельно): лёгкое покраснение и отёк (24–48 ч), покалывание во время процедуры, тёмный цвет волосков (выходят в течение 1–3 недель).\n\nСледует обратиться к врачу при: стойком покраснении более 48 ч, пузырях, выраженном отёке, признаках инфекции.", en: "Laser hair removal with Splendor X is one of the safest procedures when the protocol is followed. Normal reactions (resolve on their own): mild redness and follicle swelling (24–48 h), mild tingling during the procedure, dark hair shaft colour (hairs shed over 1–3 weeks post-session).\n\nSeek the physician if you experience: persistent redness beyond 48 h, blistering, marked swelling, or signs of infection." },
    });

    console.log("✓ Laser hub: prep/aftercare/side-effects sections added");
  } else {
    console.warn("⚠ laser-hair-removal category not found");
  }

  // ─── 3. Nutraceuticals — full rewrite ────────────────────────────────────────
  const [nutriSvc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'nutraceuticals' AND c.slug = 'longevity'
  `;
  if (nutriSvc) {
    await sql`DELETE FROM content_sections WHERE owner_id = ${nutriSvc.id} AND owner_type = 'service'`;
    await sql`DELETE FROM faq_items WHERE owner_id = ${nutriSvc.id} AND owner_type = 'service'`;

    await sql`
      UPDATE services SET
        h1_uk = 'Нутрицевтика у Дніпрі — вітаміни, мінерали, омега-3, пробіотики в GENEVITY',
        h1_ru = 'Нутрицевтика в Днепре — витамины, минералы, омега-3, пробиотики в GENEVITY',
        h1_en = 'Nutraceuticals in Dnipro — Vitamins, Minerals, Omega-3, Probiotics at GENEVITY',
        summary_uk = 'Нутрицевтика в GENEVITY — науково обґрунтований підбір вітамінів, мінералів, омега-3, пробіотиків та пребіотиків для підтримки здоров''я та довголіття. Персоналізований підхід на основі аналізів.',
        summary_ru = 'Нутрицевтика в GENEVITY — научно обоснованный подбор витаминов, минералов, омега-3, пробиотиков для поддержки здоровья и долголетия. Персонализированный подход.',
        summary_en = 'Nutraceuticals at GENEVITY — evidence-based selection of vitamins, minerals, omega-3, probiotics and prebiotics for health support and longevity. Personalised approach based on lab results.',
        seo_title_uk = 'Нутрицевтика у Дніпрі — підбір вітамінів, омега-3 та пробіотиків',
        seo_title_ru = 'Нутрицевтика в Днепре — подбор витаминов, омега-3 и пробиотиков',
        seo_title_en = 'Nutraceuticals in Dnipro — Personalised Vitamins, Omega-3 and Probiotics',
        seo_desc_uk  = 'Персоналізований підбір нутрицевтиків в GENEVITY: вітаміни та мінерали, омега-3, пробіотики, пребіотики. На основі аналізів. Дніпро.',
        seo_desc_ru  = 'Персонализированный подбор нутрицевтиков в GENEVITY: витамины, омега-3, пробиотики. На основе анализов. Днепр.',
        seo_desc_en  = 'Personalised nutraceutical selection at GENEVITY: vitamins, minerals, omega-3, probiotics. Based on lab results. Dnipro.',
        seo_keywords_uk = 'нутрицевтика, нутриціолог, підбір вітамінів, омега-3, пробіотики, пребіотики, вітаміни та мінерали, нутрицевтики ціна, нутрицевтика дніпро'
      WHERE id = ${nutriSvc.id}
    `;

    await addSection(nutriSvc.id, "service", "richText", 1, {
      heading: { uk: "Що таке нутрицевтика?", ru: "Что такое нутрицевтика?", en: "What Are Nutraceuticals?" },
      body: { uk: "Нутрицевтика — це наука про використання біологічно активних речовин їжі та харчових добавок з доведеним впливом на здоров'я. На відміну від фармакологічних препаратів, нутрицевтики діють м'яко та системно: вони компенсують дефіцити, підтримують фізіологічні процеси та знижують ризики хронічних захворювань.\n\nПідбір нутрицевтиків у GENEVITY ґрунтується на лабораторній діагностиці: перш ніж рекомендувати будь-яку добавку, лікар аналізує рівень вітамінів, мінералів, маркерів запалення та метаболічних показників. Такий підхід виключає «лікування навмання» та дозволяє призначати саме те, чого бракує організму конкретної людини.", ru: "Нутрицевтика — наука об использовании биологически активных веществ пищи и пищевых добавок с доказанным влиянием на здоровье. В отличие от фармакологических препаратов, нутрицевтики действуют мягко и системно.\n\nПодбор нутрицевтиков в GENEVITY основан на лабораторной диагностике: врач анализирует уровень витаминов, минералов, маркеров воспаления. Такой подход исключает назначения «вслепую».", en: "Nutraceuticals is the science of using biologically active food substances and dietary supplements with proven health effects. Unlike pharmaceutical drugs, nutraceuticals work gently and systemically.\n\nNutraceutical selection at GENEVITY is based on lab diagnostics: the physician analyses vitamin, mineral, inflammation marker and metabolic indicator levels before making any recommendation. This approach eliminates guesswork." },
    });

    await addSection(nutriSvc.id, "service", "bullets", 2, {
      heading: { uk: "Основні групи нутрицевтиків та їх дія", ru: "Основные группы нутрицевтиков и их действие", en: "Main Nutraceutical Groups and Their Effects" },
      items: [
        { uk: "Вітаміни та мінерали: D3 (імунітет, кістки), B12 (нервова система, енергія), залізо (гемоглобін), цинк (шкіра, імунітет), магній (стрес, сон, м'язи)", ru: "Витамины и минералы: D3 (иммунитет, кости), B12 (нервная система), железо, цинк (кожа, иммунитет), магний (стресс, сон)", en: "Vitamins & minerals: D3 (immunity, bones), B12 (nervous system, energy), iron (haemoglobin), zinc (skin, immunity), magnesium (stress, sleep, muscles)" },
        { uk: "Омега-3 жирні кислоти (EPA/DHA): серцево-судинна система, знижують запалення, підтримують мозок, покращують стан шкіри та волосся", ru: "Омега-3 (EPA/DHA): сердечно-сосудистая система, снижение воспаления, поддержка мозга, состояние кожи и волос", en: "Omega-3 fatty acids (EPA/DHA): cardiovascular system, anti-inflammation, brain support, skin and hair condition" },
        { uk: "Пробіотики: корисні бактерії для мікробіому кишечника — покращують травлення, імунітет, якість шкіри та психоемоційний стан", ru: "Пробиотики: полезные бактерии для микробиома кишечника — пищеварение, иммунитет, кожа, психоэмоциональное состояние", en: "Probiotics: beneficial bacteria for gut microbiome — digestion, immunity, skin quality, psycho-emotional wellbeing" },
        { uk: "Пребіотики: «їжа» для пробіотиків (інулін, пектин, бета-глюкани) — підтримують ріст корисної мікрофлори", ru: "Пребиотики: «пища» для пробиотиков (инулин, пектин, бета-глюканы) — поддерживают рост полезной микрофлоры", en: "Prebiotics: 'food' for probiotics (inulin, pectin, beta-glucans) — support growth of beneficial microflora" },
        { uk: "Антиоксиданти: CoQ10, резвератрол, вітамін C, глутатіон — захищають клітини від окисного стресу, уповільнюють старіння", ru: "Антиоксиданты: CoQ10, ресвератрол, витамин C, глутатион — защищают клетки от окислительного стресса, замедляют старение", en: "Antioxidants: CoQ10, resveratrol, vitamin C, glutathione — protect cells from oxidative stress, slow ageing" },
        { uk: "Адаптогени: ашваганда, родіола рожева — підвищують стресостійкість, знижують кортизол, покращують енергетику та когнітивні функції", ru: "Адаптогены: ашваганда, родиола розовая — повышают стрессоустойчивость, снижают кортизол, улучшают энергетику", en: "Adaptogens: ashwagandha, rhodiola rosea — improve stress resilience, reduce cortisol, enhance energy and cognitive function" },
      ],
    });

    await addSection(nutriSvc.id, "service", "richText", 3, {
      heading: { uk: "Як правильно обирати та вживати нутрицевтики?", ru: "Как правильно выбирать и принимать нутрицевтики?", en: "How to Choose and Take Nutraceuticals Correctly?" },
      body: { uk: "Головне правило нутрицевтики — персоналізація. Добавки, що добре працюють для одної людини, можуть бути марними або навіть шкідливими для іншої залежно від генетики, стану мікробіому, рівня дефіцитів і наявних захворювань.\n\n**Правила безпечного прийому:**\n- Визначте дефіцити лабораторно (мінімум: D3, B12, залізо, феритин, магній, гомоцистеїн)\n- Починайте з однієї добавки — щоб відстежити реакцію\n- Жиророзчинні вітаміни (A, D, E, K) приймайте з їжею, що містить жир\n- Водорозчинні вітаміни (C, B-комплекс) краще вранці натщесерце або з їжею\n- Омега-3 — з прийомом їжі для кращого засвоєння та уникнення дискомфорту\n- Пробіотики — за 20–30 хвилин до їжі або між прийомами їжі\n- Не перевищуйте дозування без контролю лікаря — особливо для жиророзчинних вітамінів", ru: "Главное правило нутрицевтики — персонализация. Определите дефициты лабораторно. Начинайте с одной добавки. Жирорастворимые витамины — с жирной едой. Омега-3 — во время еды. Пробиотики — до еды. Не превышайте дозировку без контроля врача.", en: "The key principle of nutraceuticals is personalisation. Identify deficiencies via lab tests. Start with one supplement to monitor response. Fat-soluble vitamins (A, D, E, K) — take with fatty food. Omega-3 — with meals. Probiotics — 20–30 min before meals. Do not exceed dosing without physician guidance, especially for fat-soluble vitamins." },
    });

    await addSection(nutriSvc.id, "service", "richText", 4, {
      heading: { uk: "Можливі ризики та протипоказання при прийомі нутрицевтиків", ru: "Возможные риски и противопоказания при приёме нутрицевтиков", en: "Possible Risks and Contraindications" },
      body: { uk: "Нутрицевтики вважаються безпечними, але мають власні ризики при неправильному застосуванні:\n\n- **Гіпервітаміноз** (надлишок D3, A, заліза) — токсичний при тривалому перевищенні дозування без контролю рівнів у крові\n- **Взаємодія з ліками:** омега-3 посилює дію антикоагулянтів; залізо знижує засвоєння тироксину; CoQ10 може взаємодіяти з варфарином\n- **Алергічні реакції** на компоненти добавок (риб'ячий жир, дріжджі, соєвий лецитин)\n- **ШКТ-дискомфорт** при прийомі заліза та пробіотиків — проходить при зміні форми або дозування\n- **Неправильна сезонність** — деякі добавки мають сезонну актуальність (D3 — переважно осінь-зима)\n\nВсі нутрицевтики в GENEVITY підбираються лікарем після аналізів з урахуванням поточних препаратів пацієнта.", ru: "Нутрицевтики безопасны при правильном применении. Риски: гипервитаминоз (D3, A, железо при превышении доз), взаимодействие с лекарствами (омега-3 + антикоагулянты), аллергические реакции, дискомфорт ЖКТ.\n\nВсе нутрицевтики в GENEVITY подбирает врач после анализов.", en: "Nutraceuticals are safe when used correctly. Risks: hypervitaminosis (D3, A, iron when exceeding doses), drug interactions (omega-3 + anticoagulants), allergic reactions, GI discomfort from iron and probiotics.\n\nAll GENEVITY nutraceuticals are selected by a physician after lab tests, accounting for current medications." },
    });

    const nutFaqs = [
      { q: { uk: "Чи можуть нутрицевтики замінити повноцінне харчування?", ru: "Могут ли нутрицевтики заменить полноценное питание?", en: "Can nutraceuticals replace proper nutrition?" }, a: { uk: "Ні. Нутрицевтики — доповнення до збалансованого раціону, а не його замінник. Їжа містить тисячі сполук у природних пропорціях та з синергетичним ефектом, який неможливо відтворити в добавці. Нутрицевтики найефективніші для корекції специфічних дефіцитів та підтримки при підвищеному навантаженні — стресі, хворобі, вагітності.", ru: "Нет. Нутрицевтики — дополнение к сбалансированному рациону, а не его замена. Они наиболее эффективны для коррекции дефицитов.", en: "No. Nutraceuticals supplement a balanced diet — they cannot replace it. Food contains thousands of compounds in natural ratios with synergistic effects impossible to replicate in a supplement. Nutraceuticals are most effective for correcting specific deficiencies and supporting the body under increased load." } },
      { q: { uk: "Як довго можна приймати нутрицевтики без перерви?", ru: "Как долго можно принимать нутрицевтики без перерыва?", en: "How long can nutraceuticals be taken without a break?" }, a: { uk: "Залежить від препарату та показань. Жиророзчинні вітаміни (D3, A, E) рекомендується контролювати аналізами кожні 3–6 місяців — надмірне накопичення токсичне. Водорозчинні вітаміни (C, B) можна приймати тривало — надлишок виводиться з сечею. Пробіотики — курсами 1–3 місяці з перервами або постійно при показаннях. Омега-3 — безпечна при тривалому прийомі рекомендованих доз.", ru: "Зависит от препарата. Жирорастворимые витамины контролируются анализами каждые 3–6 месяцев. Водорастворимые — можно принимать длительно. Пробиотики — курсами 1–3 месяца. Омега-3 — безопасна при длительном приёме рекомендованных доз.", en: "Depends on the supplement and indication. Fat-soluble vitamins (D3, A, E) require lab monitoring every 3–6 months — excess accumulation is toxic. Water-soluble vitamins (C, B) can be taken long-term. Probiotics — courses of 1–3 months or continuously per indication. Omega-3 — safe at recommended doses long-term." } },
      { q: { uk: "Чи потрібна консультація лікаря перед початком прийому нутрицевтиків?", ru: "Нужна ли консультация врача перед началом приёма нутрицевтиков?", en: "Is a physician consultation needed before starting nutraceuticals?" }, a: { uk: "Настійно рекомендується. По-перше, необхідно виключити протипоказання та взаємодію з поточними ліками. По-друге, прийом «наосліп» — без знання рівнів у крові — може бути марним або токсичним. В GENEVITY лікар призначає нутрицевтики після аналізів та складає індивідуальний протокол.", ru: "Настоятельно рекомендуется. Нужно исключить противопоказания и взаимодействие с лекарствами. В GENEVITY нутрицевтики назначаются после анализов.", en: "Strongly recommended. First, contraindications and drug interactions must be ruled out. Second, taking supplements 'blindly' without knowing blood levels can be wasteful or toxic. At GENEVITY, a physician prescribes nutraceuticals after lab analysis." } },
      { q: { uk: "Які побічні ефекти можуть виникнути при прийомі нутрицевтиків?", ru: "Какие побочные эффекты могут возникнуть при приёме нутрицевтиков?", en: "What side effects can nutraceuticals cause?" }, a: { uk: "Найчастіші: нудота або дискомфорт у шлунку (залізо, цинк — приймайте з їжею), послаблення кишечника (магній у великих дозах, вітамін C), «рибне» відрижання (омега-3 — беріть з кишково-розчинним покриттям), первинне метеоризм при пробіотиках (проходить за 3–7 днів). При появі висипу або алергічної реакції — зупиніть прийом та зверніться до лікаря.", ru: "Наиболее частые: тошнота (железо, цинк — принимайте с едой), послабление кишечника (магний), рыбная отрыжка (омега-3), метеоризм при пробиотиках (проходит за 3–7 дней).", en: "Most common: nausea or stomach discomfort (iron, zinc — take with food), loose stools (magnesium in high doses, vitamin C), fishy burping (omega-3 — choose enteric-coated), initial bloating with probiotics (resolves in 3–7 days). If rash or allergic reaction occurs — stop and consult the physician." } },
      { q: { uk: "Чи можна поєднувати різні нутрицевтики одночасно?", ru: "Можно ли сочетать разные нутрицевтики одновременно?", en: "Can different nutraceuticals be taken together?" }, a: { uk: "Більшість нутрицевтиків можна поєднувати, але є важливі правила сумісності: залізо не приймайте разом із кальцієм та цинком — вони конкурують за засвоєння; жиророзчинні вітаміни A і D можуть конкурувати при надлишку; омега-3 + вітамін E — хороша комбінація (E захищає від окиснення). Лікар GENEVITY враховує всі взаємодії при складанні протоколу.", ru: "Большинство нутрицевтиков можно сочетать, но есть правила: железо не принимайте с кальцием и цинком; жирорастворимые A и D могут конкурировать при избытке; омега-3 + витамин E — хорошая комбинация.", en: "Most nutraceuticals can be combined, but key compatibility rules apply: iron should not be taken with calcium or zinc — they compete for absorption; fat-soluble A and D may compete at excess; omega-3 + vitamin E is a good combination (E protects from oxidation). GENEVITY physicians factor in all interactions when creating a protocol." } },
    ];
    for (let i = 0; i < nutFaqs.length; i++) {
      await addFaq(nutriSvc.id, "service", nutFaqs[i].q.uk, nutFaqs[i].q.ru, nutFaqs[i].q.en, nutFaqs[i].a.uk, nutFaqs[i].a.ru, nutFaqs[i].a.en, i + 1);
    }
    console.log("✓ Nutraceuticals: full rewrite (4 sections + 5 FAQs)");
  } else {
    console.warn("⚠ nutraceuticals service not found");
  }

  // ─── 4. Check-up-40 — add age-range content ──────────────────────────────────
  const [checkupSvc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'check-up-40' AND c.slug = 'longevity'
  `;
  if (checkupSvc) {
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM content_sections WHERE owner_id = ${checkupSvc.id} AND owner_type = 'service'`;
    await addSection(checkupSvc.id, "service", "richText", Number(maxOrder[0].m) + 1, {
      heading: { uk: "Check-Up після 40 — скринінг у різних вікових групах", ru: "Check-Up после 40 — скрининг в разных возрастных группах", en: "Check-Up from 40 — Screening Across Age Groups" },
      body: { uk: "Програма Check-Up 40+ адаптується під вік пацієнта. Кожні 5 років після 40 з'являються нові пріоритетні напрями скринінгу:\n\n**40–44 роки:** базовий метаболічний профіль, серцево-судинні ризики, гормональний скринінг (перехід до перименопаузи у жінок), рання діагностика діабету, мамографія/УЗД молочних залоз.\n\n**45–49 років:** поглиблений серцево-судинний скринінг (кальцієвий індекс), колоноскопія (починаючи з 45 для зон середнього ризику), моніторинг щитовидної залози, гормони менопаузи.\n\n**50–55 років:** денситометрія (щільність кісток), розгорнутий онкоскринінг, ПСА у чоловіків (рак простати), контроль артеріального тиску та ниркової функції.\n\nЛікар GENEVITY адаптує склад програми відповідно до точного віку, сімейного анамнезу та факторів ризику конкретного пацієнта.", ru: "Программа Check-Up 40+ адаптируется под возраст. Каждые 5 лет после 40 появляются новые приоритеты скрининга:\n\n**40–44:** метаболический профиль, сердечно-сосудистые риски, гормональный скрининг, маммография.\n\n**45–49:** углублённый кардио-скрининг, колоноскопия, гормоны менопаузы.\n\n**50–55:** денситометрия, онкоскрининг, ПСА у мужчин.\n\nВрач адаптирует программу под возраст, анамнез и факторы риска.", en: "The Check-Up 40+ programme adapts to the patient's exact age. New priority screening areas emerge every 5 years after 40:\n\n**40–44:** basic metabolic profile, cardiovascular risks, hormonal screening, mammography.\n\n**45–49:** extended cardiovascular screening (calcium score), colonoscopy, menopause hormone monitoring.\n\n**50–55:** bone densitometry, comprehensive cancer screening, PSA in men.\n\nThe GENEVITY physician adapts the programme to the patient's exact age, family history, and risk factors." },
    });

    // Update SEO keywords to include all age variants
    await sql`
      UPDATE services SET
        seo_keywords_uk = 'check up 40, програма чек ап 40, чек ап після 40, чек ап 40 років, чек ап організму в 40 років, check up 41, check up 42, check up 43, check up 44, check up 45, check up 46, чек ап після 45, медичний чек ап дніпро'
      WHERE id = ${checkupSvc.id}
    `;
    console.log("✓ Check-Up: age-range section + keywords added");
  } else {
    console.warn("⚠ check-up-40 service not found");
  }

  // ─── 5. Intimate rejuvenation — add peeling + contour topics ─────────────────
  const [intimateCat] = await sql`SELECT id FROM service_categories WHERE slug = 'intimate-rejuvenation'`;
  if (intimateCat) {
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM content_sections WHERE owner_id = ${intimateCat.id} AND owner_type = 'category'`;
    await addSection(intimateCat.id, "category", "bullets", Number(maxOrder[0].m) + 1, {
      heading: { uk: "Апаратні процедури для інтимної зони — методики та показання", ru: "Аппаратные процедуры для интимной зоны — методики и показания", en: "Apparatus Procedures for the Intimate Zone — Methods and Indications" },
      items: [
        { uk: "Монополярний RF-ліфтинг: підвищення тонусу і відновлення чутливості тканин піхви та вульви", ru: "Монополярный RF-лифтинг: повышение тонуса и восстановление чувствительности тканей влагалища и вульвы", en: "Monopolar RF lifting: toning and restoring sensitivity of vaginal and vulvar tissues" },
        { uk: "Інтимне омолодження AcuPulse CO₂: лазерна вагінальна терапія для лікування атрофії, дисфункцій та стресового нетримання", ru: "Интимное омоложение AcuPulse CO₂: лазерная вагинальная терапия при атрофии, дисфункциях и стрессовом недержании", en: "AcuPulse CO₂ intimate rejuvenation: vaginal laser therapy for atrophy, dysfunction, and stress incontinence" },
        { uk: "Інтимний пілінг: хімічна або апаратна ексфоліація шкіри зовнішніх статевих органів — освітлення, вирівнювання тону, усунення гіперкератозу", ru: "Интимный пилинг: химическая или аппаратная эксфолиация кожи наружных половых органов — осветление, выравнивание тона, устранение гиперкератоза", en: "Intimate peeling: chemical or apparatus exfoliation of external genitalia skin — lightening, tone evening, hyperkeratosis removal" },
        { uk: "Контурна пластика інтимної зони: введення філерів для корекції форми та об'єму — збільшення великих статевих губ, корекція асиметрії", ru: "Контурная пластика интимной зоны: введение филлеров для коррекции формы и объёма — увеличение больших половых губ, коррекция асимметрии", en: "Intimate zone contour correction: filler injections for shape and volume correction — labia majora augmentation, asymmetry correction" },
        { uk: "Показання до процедур: дискомфорт при статевому житті, сухість та атрофія після пологів або менопаузи, стресове нетримання сечі, естетичні побажання", ru: "Показания: дискомфорт при половой жизни, сухость после родов или менопаузы, стрессовое недержание мочи, эстетические пожелания", en: "Indications: sexual discomfort, post-partum or menopausal dryness, stress urinary incontinence, aesthetic wishes" },
        { uk: "Всі процедури проводяться в умовах повної конфіденційності досвідченими лікарями-гінекологами та косметологами", ru: "Все процедуры проводятся в условиях полной конфиденциальности опытными врачами-гинекологами и косметологами", en: "All procedures are performed in complete confidentiality by experienced gynaecologists and aesthetic physicians" },
      ],
    });
    console.log("✓ Intimate zone: peeling + contour topics section added");
  } else {
    console.warn("⚠ intimate-rejuvenation category not found");
  }

  await sql.end();
  console.log("\n✅ All content gaps filled.");
}
main().catch((e) => { console.error(e); process.exit(1); });
