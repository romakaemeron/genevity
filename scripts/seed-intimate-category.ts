/**
 * Intimate rejuvenation category — full content per TZ #27.
 * Sections: what is it, indications/contraindications, 3 types (RF, peeling, contour),
 * advantages, prep/aftercare + FAQs.
 * Run: npx tsx scripts/seed-intimate-category.ts
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
  const [cat] = await sql`SELECT id FROM service_categories WHERE slug = 'intimate-rejuvenation'`;
  if (!cat) { console.error("intimate-rejuvenation category not found"); process.exit(1); }
  const id = cat.id;

  await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'category'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'category'`;

  await sql`
    UPDATE service_categories SET
      seo_title_uk = 'Інтимна косметологія у Дніпрі — RF-ліфтинг, лазерне омолодження CO₂, інтимний пілінг',
      seo_title_ru = 'Интимная косметология в Днепре — RF-лифтинг, лазерное омоложение CO₂, интимный пилинг',
      seo_title_en = 'Intimate Cosmetology in Dnipro — RF Lifting, CO₂ Laser Rejuvenation, Intimate Peeling',
      seo_desc_uk  = 'Апаратні процедури для інтимної зони в GENEVITY: монополярний RF-ліфтинг, лазерне омолодження AcuPulse CO₂, інтимний пілінг, контурна пластика. Конфіденційно. Дніпро.',
      seo_desc_ru  = 'Аппаратные процедуры для интимной зоны в GENEVITY: RF-лифтинг, лазерное омоложение AcuPulse CO₂, интимный пилинг, контурная пластика. Конфиденциально. Днепр.',
      seo_desc_en  = 'Apparatus intimate zone procedures at GENEVITY: monopolar RF lifting, AcuPulse CO₂ laser rejuvenation, intimate peeling, contour correction. Confidential. Dnipro.',
      seo_keywords_uk = 'інтимна косметологія, косметологія інтимних зон, лазерна інтимна косметологія, інтимне омолодження, rf ліфтинг інтимної зони, інтимний пілінг, контурна пластика інтимної зони'
    WHERE id = ${id}
  `;

  type Section = { type: string; sort_order: number; data: object };
  const sections: Section[] = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Апаратна косметологія для інтимної зони — що це та кому підходить?", ru: "Аппаратная косметология для интимной зоны — что это и кому подходит?", en: "Apparatus Intimate Zone Cosmetology — What Is It and Who Is It For?" },
        body: { uk: "Апаратна косметологія для інтимної зони — це напрямок естетичної та відновлювальної медицини, що вирішує функціональні та естетичні задачі без хірургічного втручання. Процедури застосовуються як для лікування дискомфорту (сухість, атрофія, нетримання), так і для естетичної корекції зовнішнього вигляду.\n\nВ GENEVITY всі процедури для інтимної зони проводяться в умовах повної конфіденційності сертифікованими лікарями-гінекологами та косметологами з медичною освітою. Перед будь-якою процедурою проводиться детальна консультація та виключаються протипоказання.", ru: "Аппаратная косметология для интимной зоны — направление эстетической и восстановительной медицины без хирургического вмешательства. Решает функциональные и эстетические задачи: дискомфорт, атрофия, недержание, коррекция внешнего вида.\n\nВ GENEVITY все процедуры проводятся в полной конфиденциальности сертифицированными врачами-гинекологами и косметологами с медицинским образованием.", en: "Apparatus intimate zone cosmetology is a branch of aesthetic and restorative medicine that addresses functional and aesthetic concerns without surgery. Procedures treat discomfort (dryness, atrophy, incontinence) as well as cosmetic concerns.\n\nAt GENEVITY, all intimate zone procedures are performed in complete confidentiality by certified gynaecologists and aesthetic physicians with medical qualifications." },
      },
    },
    {
      type: "indicationsContraindications", sort_order: 2,
      data: {
        indicationsHeading: { uk: "Показання до процедур для інтимної зони", ru: "Показания к процедурам для интимной зоны", en: "Indications for Intimate Zone Procedures" },
        indications: [
          { uk: "Вагінальна сухість та атрофія — особливо після пологів або в менопаузі", ru: "Вагинальная сухость и атрофия — после родов или в менопаузе", en: "Vaginal dryness and atrophy — especially post-partum or in menopause" },
          { uk: "Зниження тонусу та еластичності тканин піхви", ru: "Снижение тонуса и эластичности тканей влагалища", en: "Reduced vaginal tissue tone and elasticity" },
          { uk: "Стресове нетримання сечі (лёгкий та середній ступінь)", ru: "Стрессовое недержание мочи (лёгкая и средняя степень)", en: "Stress urinary incontinence (mild to moderate)" },
          { uk: "Дискомфорт та зниження чутливості під час статевого життя", ru: "Дискомфорт и снижение чувствительности во время половой жизни", en: "Discomfort and reduced sensitivity during sexual activity" },
          { uk: "Естетична корекція — пігментація, асиметрія, гіперкератоз зовнішніх статевих органів", ru: "Эстетическая коррекция — пигментация, асимметрия, гиперкератоз наружных половых органов", en: "Aesthetic correction — pigmentation, asymmetry, hyperkeratosis of external genitalia" },
          { uk: "Зміни шкіри в паховій зоні після лазерної епіляції, деформацій або вікових змін", ru: "Изменения кожи в паховой зоне после эпиляции, деформаций или возрастных изменений", en: "Skin changes in the inguinal area after epilation, deformities, or age-related changes" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність та грудне вигодовування", ru: "Беременность и грудное вскармливание", en: "Pregnancy and breastfeeding" },
          { uk: "Гострі запальні гінекологічні захворювання (кольпіт, ендометрит тощо)", ru: "Острые воспалительные гинекологические заболевания (кольпит, эндометрит и др.)", en: "Acute inflammatory gynaecological conditions (colpitis, endometritis, etc.)" },
          { uk: "ЗПСШ в активній стадії", ru: "ЗППП в активной стадии", en: "Active sexually transmitted infections" },
          { uk: "Онкологічні захворювання статевих органів", ru: "Онкологические заболевания половых органов", en: "Oncological diseases of the genital organs" },
          { uk: "Менструація в день процедури", ru: "Менструация в день процедуры", en: "Menstruation on the day of procedure" },
        ],
      },
    },
    {
      type: "bullets", sort_order: 3,
      data: {
        heading: { uk: "Методики апаратної косметології для інтимної зони", ru: "Методики аппаратной косметологии для интимной зоны", en: "Apparatus Methods for Intimate Zone" },
        items: [
          { uk: "Монополярний RF-ліфтинг — радіочастотне підвищення тонусу тканин піхви та вульви, стимуляція вироблення колагену, лікування стресового нетримання сечі без операції", ru: "Монополярный RF-лифтинг — радиочастотное повышение тонуса тканей влагалища и вульвы, стимуляция коллагена, лечение стрессового недержания без операции", en: "Monopolar RF lifting — radiofrequency toning of vaginal and vulvar tissues, collagen stimulation, non-surgical stress incontinence treatment" },
          { uk: "Інтимне омолодження AcuPulse CO₂ — фракційне лазерне відновлення вагінального епітелію, лікування атрофічного кольпіту, стимуляція слизової, підвищення чутливості", ru: "Интимное омоложение AcuPulse CO₂ — фракционное лазерное восстановление вагинального эпителия, лечение атрофического кольпита, стимуляция слизистой", en: "AcuPulse CO₂ intimate rejuvenation — fractional laser restoration of vaginal epithelium, treatment of atrophic colpitis, mucosal stimulation, sensitivity enhancement" },
          { uk: "Інтимний пілінг — хімічна або апаратна ексфоліація шкіри зовнішніх статевих органів: освітлення пігментації в паховій зоні та зоні бікіні, вирівнювання тону, усунення гіперкератозу", ru: "Интимный пилинг — химическая или аппаратная эксфолиация кожи наружных половых органов: осветление пигментации паховой зоны и зоны бикини, выравнивание тона, устранение гиперкератоза", en: "Intimate peeling — chemical or apparatus exfoliation of external genital skin: pigmentation lightening in the inguinal and bikini zone, tone evening, hyperkeratosis removal" },
          { uk: "Контурна пластика інтимної зони — введення філерів на основі гіалуронової кислоти для корекції об'єму та форми великих статевих губ, усунення асиметрії, відновлення тургору тканин", ru: "Контурная пластика интимной зоны — введение филлеров для коррекции объёма и формы больших половых губ, устранения асимметрии, восстановления тургора тканей", en: "Intimate zone contour correction — hyaluronic acid filler injections for labia majora volume and shape correction, asymmetry correction, tissue turgor restoration" },
        ],
      },
    },
    {
      type: "bullets", sort_order: 4,
      data: {
        heading: { uk: "Переваги апаратних методик для інтимної зони", ru: "Преимущества аппаратных методик для интимной зоны", en: "Advantages of Apparatus Intimate Zone Methods" },
        items: [
          { uk: "Без хірургічного втручання — жодних розрізів, анестезії, реабілітації від 2 тижнів", ru: "Без хирургического вмешательства — никаких разрезов, наркоза, реабилитации от 2 недель", en: "No surgery — no incisions, no anaesthesia, no 2-week recovery" },
          { uk: "Короткий відновлювальний період: більшість процедур не потребують спеціальних обмежень", ru: "Короткий восстановительный период: большинство процедур не требуют специальных ограничений", en: "Short recovery: most procedures require no special restrictions" },
          { uk: "Комплексний ефект — одночасне вирішення функціональних та естетичних задач", ru: "Комплексный эффект — одновременное решение функциональных и эстетических задач", en: "Combined effect — addressing functional and aesthetic concerns simultaneously" },
          { uk: "Конфіденційність та деліктатність — усі процедури проводяться у закритих кабінетах з дотриманням медичної таємниці", ru: "Конфиденциальность — все процедуры в закрытых кабинетах с соблюдением медицинской тайны", en: "Full confidentiality — all procedures in private rooms with medical secrecy maintained" },
          { uk: "Клінічно підтверджена безпека апаратів (FDA, CE) та кваліфіковані лікарі з медичною освітою", ru: "Клинически подтверждённая безопасность аппаратов (FDA, CE) и квалифицированные врачи с медицинским образованием", en: "Clinically confirmed device safety (FDA, CE) and qualified physicians with medical degrees" },
        ],
      },
    },
    {
      type: "steps", sort_order: 5,
      data: {
        heading: { uk: "Як підготуватися та що очікувати після процедур", ru: "Как подготовиться и что ожидать после процедур", en: "How to Prepare and What to Expect After Procedures" },
        steps: [
          { title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" }, description: { uk: "Гігієнічний туалет перед процедурою. Процедури не проводяться в дні менструації. Перед CO₂ лазером — виключити статеві контакти за 3 дні. Перед контурною пластикою — не приймати кроворозріджуючі препарати 5–7 днів.", ru: "Гигиенический туалет перед процедурой. Не в дни менструации. Перед CO₂ лазером — исключить половые контакты за 3 дня. Перед контурной пластикой — не принимать разжижающие кровь препараты 5–7 дней.", en: "Hygiene wash before the procedure. Not during menstruation. Before CO₂ laser — no sexual contact for 3 days. Before contour correction — stop blood-thinning medications 5–7 days prior." } },
          { title: { uk: "Після RF-ліфтингу та CO₂", ru: "После RF-лифтинга и CO₂", en: "After RF lifting and CO₂" }, description: { uk: "7–10 днів: утримуйтеся від статевих контактів, тампонів, сауни та купання у відкритих водоймах. Можлива помірна болючість та виділення — норма на 2–3 доби. Водні процедури (душ) — дозволені.", ru: "7–10 дней: воздержитесь от половых контактов, тампонов, сауны и купания. Умеренная болезненность и выделения — норма 2–3 суток. Душ — разрешён.", en: "7–10 days: abstain from sexual contact, tampons, sauna, and swimming in open water. Mild soreness and discharge for 2–3 days is normal. Showering is allowed." } },
          { title: { uk: "Після інтимного пілінгу", ru: "После интимного пилинга", en: "After intimate peeling" }, description: { uk: "Зволожувальний засіб без спирту на зону обробки двічі на день. SPF при відкритому одязі. Уникайте тертя та синтетичної білизни 3–5 днів. Лущення — норма протягом 3–7 днів.", ru: "Увлажняющее средство без спирта дважды в день. SPF при открытой одежде. Избегайте трения и синтетического белья 3–5 дней. Шелушение — норма 3–7 дней.", en: "Alcohol-free moisturiser on treated area twice daily. SPF in exposed clothing. Avoid friction and synthetic underwear for 3–5 days. Peeling is normal for 3–7 days." } },
          { title: { uk: "Після контурної пластики", ru: "После контурной пластики", en: "After contour correction" }, description: { uk: "24–48 годин: холодний компрес при набряку. 7 днів: без статевих контактів, сауни та активних фізнавантажень. Ефект від філерів оцінюється через 2–4 тижні після введення.", ru: "24–48 ч: холодный компресс при отёке. 7 дней: без половых контактов, сауны, активных нагрузок. Оценка эффекта — через 2–4 недели.", en: "24–48 hours: cold compress if swelling. 7 days: no sexual contact, sauna, or intense exercise. Filler effect is assessed 2–4 weeks after injection." } },
        ],
      },
    },
  ];

  for (const s of sections) {
    await sql`
      INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${id}, 'category', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})
    `;
  }

  const faqs = [
    {
      q: { uk: "Які результати можна очікувати після апаратних процедур для інтимної зони?", ru: "Какие результаты после аппаратных процедур для интимной зоны?", en: "What results can be expected from intimate zone procedures?" },
      a: { uk: "RF-ліфтинг: підвищення тонусу та зволоження слизової, зменшення нетримання, покращення чутливості — ефект через 2–4 тижні, зберігається 12–18 місяців. CO₂ лазер: відновлення епітелію, усунення сухості та атрофії, підвищення еластичності — ефект через 4–6 тижнів, 12–24 місяці. Пілінг: вирівнювання тону, усунення пігментації та гіперкератозу — ефект після 1–3 процедур курсом.", ru: "RF-лифтинг: повышение тонуса, уменьшение недержания, улучшение чувствительности — эффект через 2–4 недели, 12–18 месяцев. CO₂ лазер: восстановление эпителия, устранение сухости — 4–6 недель, 12–24 месяца. Пилинг: выравнивание тона, пигментации — 1–3 процедуры.", en: "RF lifting: improved tone and moisture, reduced incontinence, enhanced sensitivity — effect in 2–4 weeks, lasting 12–18 months. CO₂ laser: epithelial restoration, dryness elimination, elasticity improvement — 4–6 weeks, 12–24 months. Peeling: tone evening, pigmentation and hyperkeratosis correction — 1–3 course sessions." },
    },
    {
      q: { uk: "Скільки сеансів потрібно для досягнення бажаного ефекту?", ru: "Сколько сеансов нужно для достижения желаемого эффекта?", en: "How many sessions are needed?" },
      a: { uk: "RF-ліфтинг: курс 3–5 процедур з інтервалом 2–4 тижні, потім 1–2 підтримуючих сеанси на рік. CO₂ лазер: 1–3 процедури з інтервалом 1–2 місяці. Пілінг: 3–5 сеансів курсом. Контурна пластика: 1 процедура з корекцією через 2–4 тижні за потреби. Лікар визначить точну кількість після огляду.", ru: "RF-лифтинг: 3–5 процедур, интервал 2–4 недели. CO₂ лазер: 1–3 процедуры, 1–2 месяца. Пилинг: 3–5 сеансов. Контурная пластика: 1 процедура с коррекцией при необходимости.", en: "RF lifting: 3–5 sessions, 2–4 weeks apart; 1–2 maintenance sessions yearly. CO₂ laser: 1–3 procedures, 1–2 months apart. Peeling: 3–5 course sessions. Contour correction: 1 procedure with top-up if needed after 2–4 weeks. The physician determines exact numbers after assessment." },
    },
    {
      q: { uk: "Чи є болісними апаратні процедури для інтимної зони?", ru: "Болезненны ли аппаратные процедуры для интимной зоны?", en: "Are intimate zone apparatus procedures painful?" },
      a: { uk: "RF-ліфтинг — безболісний, відчувається лише тепло. CO₂ лазер — проводиться після нанесення місцевого анестетика, дискомфорт мінімальний. Пілінг — може відчуватися легке поколювання. Контурна пластика — виконується під місцевою анестезією. Більшість пацієнток характеризують процедури як комфортні.", ru: "RF-лифтинг — безболезненный, только тепло. CO₂ лазер — с местным анестетиком, дискомфорт минимален. Пилинг — лёгкое покалывание. Контурная пластика — под местной анестезией.", en: "RF lifting — painless, only warmth is felt. CO₂ laser — performed after applying local anaesthetic, minimal discomfort. Peeling — mild tingling. Contour correction — performed under local anaesthesia. Most patients describe the procedures as comfortable." },
    },
    {
      q: { uk: "Який період відновлення після процедур для інтимної зони?", ru: "Какой период восстановления после процедур для интимной зоны?", en: "What is the recovery period after intimate zone procedures?" },
      a: { uk: "RF-ліфтинг: 24–48 годин уникати статевих контактів, фізнавантажень. CO₂ лазер: 7–10 днів — без статевих контактів, тампонів, сауни. Пілінг: 3–7 днів помірного лущення, обмежити тертя. Контурна пластика: 7 днів без статевих контактів та фізнавантажень. Загалом реабілітація значно коротша, ніж після хірургічного втручання.", ru: "RF-лифтинг: 24–48 ч без нагрузок. CO₂ лазер: 7–10 дней без контактов, тампонов, сауны. Пилинг: 3–7 дней. Контурная пластика: 7 дней.", en: "RF lifting: 24–48 hours without sexual contact or intense exercise. CO₂ laser: 7–10 days without sexual contact, tampons, or sauna. Peeling: 3–7 days of mild peeling, limit friction. Contour correction: 7 days without sexual contact or exercise. Overall recovery is significantly shorter than after surgery." },
    },
    {
      q: { uk: "Чи можна поєднувати апаратні процедури для інтимної зони з іншими методами омолодження?", ru: "Можно ли сочетать аппаратные процедуры для интимной зоны с другими методами?", en: "Can intimate zone procedures be combined with other rejuvenation methods?" },
      a: { uk: "Так. Ефективні комбінації: RF-ліфтинг + CO₂ лазер (максимальне відновлення тонусу та епітелію), RF-ліфтинг + контурна пластика (тонус + об'єм), пілінг + контурна пластика (підготовка шкіри + корекція форми). Проте між процедурами необхідні інтервали — лікар визначає послідовність після огляду.", ru: "Да. Комбинации: RF-лифтинг + CO₂ лазер (тонус + эпителий), RF + контурная пластика (тонус + объём), пилинг + контурная пластика. Между процедурами нужны интервалы.", en: "Yes. Effective combinations: RF lifting + CO₂ laser (maximum tone and epithelial restoration), RF lifting + contour correction (tone + volume), peeling + contour correction (skin preparation + shape). Intervals between procedures are required — the physician determines the sequence after assessment." },
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${id}, 'category', ${f.q.uk}, ${f.q.ru}, ${f.q.en}, ${f.a.uk}, ${f.a.ru}, ${f.a.en}, ${i + 1})
    `;
  }

  console.log(`✓ Intimate rejuvenation: ${sections.length} sections + ${faqs.length} FAQs`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
