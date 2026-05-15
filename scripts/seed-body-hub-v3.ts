/**
 * Body hub v3: EMSCULPT NEO + Ultraformer MPT Body + Exion Body.
 * Targets: emsculpt neo (4kw), ультраформер для тіла (1), exion body (2), апаратна корекція фігури (3).
 * Run: npx tsx scripts/seed-body-hub-v3.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

async function main() {
  const [svc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'body' AND c.slug = 'apparatus-cosmetology'
  `;
  if (!svc) { console.error("body service not found"); process.exit(1); }
  const id = svc.id;

  await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'service'`;

  await sql`
    UPDATE services SET
      h1_uk = 'Апаратна корекція тіла — EMSCULPT NEO, Ultraformer MPT, Exion Body у Дніпрі',
      h1_ru = 'Аппаратная коррекция тела — EMSCULPT NEO, Ultraformer MPT, Exion Body в Днепре',
      h1_en = 'Apparatus Body Correction — EMSCULPT NEO, Ultraformer MPT, Exion Body in Dnipro',
      summary_uk = 'Апаратна корекція тіла в GENEVITY: EMSCULPT NEO (м''язи + жир), Ultraformer MPT по тілу (ультразвуковий ліфтинг шкіри), Exion Body (RF корекція). Без операцій і наркозу. Дніпро.',
      summary_ru = 'Аппаратная коррекция тела в GENEVITY: EMSCULPT NEO, Ultraformer MPT по телу, Exion Body (RF). Без операций. Днепр.',
      summary_en = 'Apparatus body correction at GENEVITY: EMSCULPT NEO, Ultraformer MPT body, Exion Body RF. No surgery. Dnipro.',
      seo_title_uk = 'Апаратна корекція тіла у Дніпрі — EMSCULPT NEO, Ultraformer MPT, Exion Body',
      seo_title_ru = 'Аппаратная коррекция тела в Днепре — EMSCULPT NEO, Ultraformer MPT, Exion Body',
      seo_title_en = 'Apparatus Body Correction in Dnipro — EMSCULPT NEO, Ultraformer MPT, Exion Body',
      seo_desc_uk  = 'Апаратна корекція тіла в GENEVITY: EMSCULPT NEO (+25% м''язів, -30% жиру), Ultraformer MPT по тілу (ліфтинг шкіри), Exion Body (RF корекція целюліту). Без хірургії. Дніпро.',
      seo_desc_ru  = 'Аппаратная коррекция тела в GENEVITY: EMSCULPT NEO (+25% мышц, -30% жира), Ultraformer MPT (лифтинг кожи), Exion Body (RF коррекция). Без хирургии. Днепр.',
      seo_desc_en  = 'Apparatus body correction at GENEVITY: EMSCULPT NEO (+25% muscle, -30% fat), Ultraformer MPT body (skin lifting), Exion Body (RF correction). No surgery. Dnipro.',
      seo_keywords_uk = 'emsculpt neo, emsculpt ціна, emsculpt процедура, emsculpt ціна процедури, процедура emsculpt, ультраформер тіло, ультраформер по тілу, ультраформер для тіла, exion body, exion rf body, апаратна корекція фігури, апаратна косметологія для тіла, апаратні процедури для тіла'
    WHERE id = ${id}
  `;

  const sections = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Апаратна корекція тіла в GENEVITY — без хірургії та наркозу", ru: "Аппаратная коррекция тела в GENEVITY — без хирургии и наркоза", en: "Apparatus Body Correction at GENEVITY — No Surgery, No Anaesthesia" },
        body: { uk: "Апаратна косметологія для тіла вирішує задачі, які раніше потребували хірургічного втручання: видалення локальних жирових відкладень, нарощування м'язів, підтяжка шкіри після схуднення, корекція целюліту.\n\nВ GENEVITY три технології для тіла різного механізму дії: EMSCULPT NEO (поєднання HIFES-стимуляції м'язів та RF-знищення жирових клітин), Ultraformer MPT по тілу (ультразвуковий ліфтинг шкіри) та Exion Body (монополярний RF для корекції текстури та целюліту). Кожна може застосовуватися самостійно або в комплексній програмі.", ru: "Аппаратная косметология для тела — решение задач без хирургии: удаление локальных жировых отложений, наращивание мышц, подтяжка кожи, коррекция целлюлита.\n\nВ GENEVITY три технологии: EMSCULPT NEO (HIFES + RF), Ultraformer MPT по телу (ультразвуковой лифтинг), Exion Body (монополярный RF).", en: "Apparatus body cosmetology solves problems that previously required surgery: removing local fat deposits, building muscles, tightening loose skin, correcting cellulite.\n\nGENEVITY offers three body technologies: EMSCULPT NEO (HIFES muscle stimulation + RF fat destruction), Ultraformer MPT body (ultrasound skin lifting), and Exion Body (monopolar RF for texture and cellulite correction)." },
      },
    },
    {
      type: "richText", sort_order: 2,
      data: {
        heading: { uk: "EMSCULPT NEO — накачування м'язів та спалювання жиру одночасно", ru: "EMSCULPT NEO — накачивание мышц и сжигание жира одновременно", en: "EMSCULPT NEO — Build Muscle and Burn Fat Simultaneously" },
        body: { uk: "EMSCULPT NEO від BTL — єдина у світі технологія, що одночасно нарощує м'язи та руйнує жирові клітини. Під час 30-хвилинного сеансу HIFES-електромагнітна стимуляція змушує м'яз виконати 20 000 супрамаксимальних скорочень — більше, ніж будь-яке тренування в залі. Паралельно RF-нагрівання піднімає температуру жирових клітин до точки їх деструкції.\n\n**Клінічно доведені результати (за FDA-дослідженнями):** +25% до об'єму м'язів, -30% жирової тканини в зоні обробки.\n\n**Показання:** недостатній тонус м'язів живота, сідниць, стегон і рук; локальні жирові відкладення стійкі до дієти та спорту; діастаз прямих м'язів живота; бажання поліпшити рельєф без інтенсивних тренувань або після вагітності.\n\n**Курс:** 4 сеанси з інтервалом 5–7 днів. Ефект оцінюється через 1–3 місяці після курсу. Підходить і чоловікам, і жінкам.", ru: "EMSCULPT NEO от BTL — единственная технология, одновременно наращивающая мышцы и разрушающая жир. За 30-минутный сеанс мышца выполняет 20 000 сокращений. RF-нагрев разрушает жировые клетки.\n\n**Результаты:** +25% мышечного объёма, -30% жировой ткани.\n\n**Показания:** слабый тонус мышц, локальные жировые отложения, диастаз. **Курс:** 4 сеанса, 5–7 дней между ними.", en: "EMSCULPT NEO by BTL — the world's only technology simultaneously building muscle and destroying fat. In 30 minutes, HIFES stimulation causes 20,000 supramaximal contractions. RF heating raises fat cell temperature to destruction point.\n\n**FDA-proven results:** +25% muscle volume, -30% fat tissue.\n\n**Indications:** weak muscle tone, stubborn local fat, diastasis recti. **Course:** 4 sessions, 5–7 days apart. Works for men and women." },
      },
    },
    {
      type: "richText", sort_order: 3,
      data: {
        heading: { uk: "Ultraformer MPT для тіла — ультразвуковий ліфтинг шкіри", ru: "Ultraformer MPT для тела — ультразвуковой лифтинг кожи", en: "Ultraformer MPT for Body — Ultrasound Skin Lifting" },
        body: { uk: "Ultraformer MPT по тілу — та сама технологія мікрофокусованого ультразвуку (HIFU), що підтягує обличчя, але адаптована для зон тіла. Ультразвукові промені нагрівають колаген на глибині 3–4,5 мм, запускаючи його скорочення та активний неоколагеногенез. Результат — помітне підтягування та ущільнення шкіри.\n\n**Показання:** млява шкіра після схуднення або вагітності, птоз внутрішньої поверхні стегон і плечей, ліфтинг живота, зони декольте та шиї, целюліт 1–2 ступеня. **Зони обробки:** живіт, стегна, внутрішня поверхня рук і ніг, декольте, коліна.\n\n**Результат:** поступове підтягування впродовж 2–3 місяців після процедури, максимальний ефект — через 3 місяці. Зберігається 12–18 місяців. Зазвичай 1 сеанс на рік.", ru: "Ultraformer MPT по телу — микрофокусированный ультразвук (HIFU) для подтяжки кожи тела. Нагревает коллаген на глубине 3–4,5 мм.\n\n**Показания:** вялая кожа после похудения, птоз, целлюлит. **Зоны:** живот, бёдра, руки, декольте.\n\n**Результат:** подтяжка в течение 2–3 месяцев, сохраняется 12–18 месяцев.", en: "Ultraformer MPT for body — the same HIFU technology used for face lifting, adapted for body zones. Heats collagen at 3–4.5 mm depth, triggering contraction and neocollagenesis.\n\n**Indications:** loose skin post-weight loss or pregnancy, inner thigh/arm ptosis, abdominal skin laxity, cellulite grades 1–2. **Result:** gradual tightening over 2–3 months, lasting 12–18 months." },
      },
    },
    {
      type: "richText", sort_order: 4,
      data: {
        heading: { uk: "Exion Body — RF-корекція текстури та целюліту", ru: "Exion Body — RF-коррекция текстуры и целлюлита", en: "Exion Body — RF Correction of Skin Texture and Cellulite" },
        body: { uk: "Exion Body від BTL використовує монополярний RF з AI-контролем для рівномірного нагрівання шкіри та підшкірного шару по всьому тілу. Апарат ефективно вирівнює «апельсинову шкірку», підвищує пружність та покращує текстуру на всіх зонах тіла.\n\n**Показання:** целюліт будь-якого ступеня, знижена пружність шкіри, нерівна текстура живота, стегон, сідниць та рук. **Зони:** будь-які ділянки тіла, включаючи чутливі.\n\n**Курс:** 4–8 сеансів залежно від зони та ступеня вираженості проблеми. Процедура комфортна — пацієнт відчуває рівномірне тепло. Результати видно вже після 3–4 сеансів. Підходить як самостійний курс і як доповнення до EMSCULPT NEO.", ru: "Exion Body от BTL — монополярный RF с AI-контролем для коррекции текстуры и целлюлита.\n\n**Показания:** целлюлит, сниженная упругость, неровная текстура. **Курс:** 4–8 сеансов. Результаты — после 3–4 сеансов.", en: "Exion Body by BTL uses monopolar RF with AI control for uniform heating of skin and subcutaneous layer. Effectively smooths cellulite, improves firmness and texture on all body zones.\n\n**Indications:** any-grade cellulite, reduced skin firmness, uneven texture. **Course:** 4–8 sessions. Visible results from session 3–4. Works standalone or as a complement to EMSCULPT NEO." },
      },
    },
    {
      type: "bullets", sort_order: 5,
      data: {
        heading: { uk: "Підготовка та рекомендації після апаратних процедур для тіла", ru: "Подготовка и рекомендации после аппаратных процедур для тела", en: "Preparation and Post-Procedure Recommendations" },
        items: [
          { uk: "За 2 години до EMSCULPT NEO: не приймайте важку їжу", ru: "За 2 часа до EMSCULPT NEO: не принимайте тяжёлую пищу", en: "2 hours before EMSCULPT NEO: avoid heavy meals" },
          { uk: "Знімте металеві прикраси та одяг з металевими деталями в зоні обробки", ru: "Снимите металлические украшения и одежду с металлическими деталями", en: "Remove metal jewellery and clothing with metal elements from the treatment zone" },
          { uk: "Після EMSCULPT NEO: можлива крепатура м'язів 1–3 доби — це нормальна реакція", ru: "После EMSCULPT NEO: крепатура мышц 1–3 суток — нормальная реакция", en: "After EMSCULPT NEO: muscle soreness for 1–3 days is a normal response" },
          { uk: "Після Ultraformer MPT по тілу: уникайте сауни та інтенсивних навантажень 48 годин", ru: "После Ultraformer MPT по телу: избегайте сауны и интенсивных нагрузок 48 часов", en: "After Ultraformer MPT body: avoid sauna and intense exercise for 48 hours" },
          { uk: "Після Exion Body: ніяких обмежень — можна повертатися до звичного дня одразу", ru: "После Exion Body: никаких ограничений — сразу к привычному дню", en: "After Exion Body: no restrictions — immediate return to daily routine" },
          { uk: "Результати накопичуються курсом: кожен наступний сеанс підсилює ефект попереднього", ru: "Результаты накапливаются: каждый следующий сеанс усиливает эффект предыдущего", en: "Results are cumulative: each session amplifies the effect of the previous one" },
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
      q: { uk: "Скільки процедур EMSCULPT NEO необхідно?", ru: "Сколько процедур EMSCULPT NEO необходимо?", en: "How many EMSCULPT NEO sessions are needed?" },
      a: { uk: "Стандартний курс — 4 процедури з інтервалом 5–7 днів. Перші результати помітні після 2–3 сеансів. Фінальний ефект оцінюється через 1–3 місяці після завершення курсу — саме тоді завершується формування м'язової тканини та адаптація метаболізму.", ru: "Стандартный курс — 4 процедуры с интервалом 5–7 дней. Финальный результат оценивается через 1–3 месяца после завершения курса.", en: "Standard course: 4 sessions, 5–7 days apart. Final results assessed 1–3 months after the last session, when muscle remodelling and metabolic adaptation are complete." },
    },
    {
      q: { uk: "Чи підходить EMSCULPT NEO чоловікам?", ru: "Подходит ли EMSCULPT NEO мужчинам?", en: "Is EMSCULPT NEO suitable for men?" },
      a: { uk: "Так. EMSCULPT NEO популярний серед чоловіків для опрацювання рельєфу живота, сідниць та рук. Чоловічий м'яз відповідає на HIFES-стимуляцію так само ефективно. Протипоказання і кількість сеансів ідентичні для обох статей.", ru: "Да, популярен среди мужчин для проработки рельефа живота, ягодиц и рук. Противопоказания и количество сеансов одинаковы.", en: "Yes. EMSCULPT NEO is popular among men for defining abdominal, gluteal, and arm contours. Male muscle responds to HIFES stimulation equally effectively. Contraindications and session count are identical." },
    },
    {
      q: { uk: "Яку зону тіла можна обробляти апаратами?", ru: "Какие зоны тела можно обрабатывать аппаратами?", en: "Which body zones can be treated?" },
      a: { uk: "EMSCULPT NEO: живіт, сідниці, стегна, біцепс/трицепс рук, литки. Ultraformer MPT по тілу: живіт, стегна, внутрішня поверхня рук та ніг, декольте, шия, коліна. Exion Body: будь-які ділянки тіла, включаючи чутливі зони.", ru: "EMSCULPT NEO: живот, ягодицы, бёдра, руки, икры. Ultraformer MPT: живот, бёдра, внутренняя поверхность рук и ног, декольте. Exion Body: любые зоны.", en: "EMSCULPT NEO: abdomen, buttocks, thighs, bicep/tricep, calves. Ultraformer MPT body: abdomen, thighs, inner arms/legs, décolletage, neck, knees. Exion Body: any body zone including sensitive areas." },
    },
    {
      q: { uk: "Чи є реабілітація після апаратних процедур для тіла?", ru: "Есть ли реабилитация после аппаратных процедур для тела?", en: "Is there recovery time after body apparatus procedures?" },
      a: { uk: "Після EMSCULPT NEO реабілітації немає — можна повертатися до роботи одразу. Крепатура м'язів 1–3 доби є нормою. Після Ultraformer MPT по тілу рекомендовано 48 годин уникати сауни та фізнавантажень. Після Exion Body — жодних обмежень.", ru: "После EMSCULPT NEO — реабилитации нет, крепатура 1–3 дня норма. После Ultraformer MPT по телу — 48 ч без сауны. После Exion Body — без ограничений.", en: "After EMSCULPT NEO: no downtime, muscle soreness for 1–3 days is normal. After Ultraformer MPT body: 48 hours without sauna/intense exercise. After Exion Body: no restrictions." },
    },
    {
      q: { uk: "Чи можна поєднувати апаратні процедури для тіла між собою?", ru: "Можно ли комбинировать аппаратные процедуры для тела?", en: "Can body apparatus procedures be combined?" },
      a: { uk: "Так. Найефективніша комбінація: EMSCULPT NEO (м'язи + жир) + Ultraformer MPT по тілу (підтяжка шкіри над зоною обробки). Exion Body можна додавати як фінальний етап корекції текстури шкіри. Лікар GENEVITY розробляє послідовність процедур індивідуально.", ru: "Да. Оптимальная комбинация: EMSCULPT NEO + Ultraformer MPT по телу (мышцы + жир + лифтинг кожи). Exion Body — финальный этап коррекции текстуры.", en: "Yes. Most effective combination: EMSCULPT NEO (muscle + fat) + Ultraformer MPT body (skin tightening over treated area). Exion Body adds final skin texture refinement. GENEVITY physicians design individual treatment sequences." },
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${id}, 'service', ${faqs[i].q.uk}, ${faqs[i].q.ru}, ${faqs[i].q.en}, ${faqs[i].a.uk}, ${faqs[i].a.ru}, ${faqs[i].a.en}, ${i + 1})
    `;
  }

  console.log(`✓ Body hub: ${sections.length} sections + ${faqs.length} FAQs`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
