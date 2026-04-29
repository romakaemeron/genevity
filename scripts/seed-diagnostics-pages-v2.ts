/**
 * Re-seeds 5 diagnostics pages with full section structure matching botulinum-therapy:
 * richText (with heroImage) → callout → indicationsContraindications → steps → bullets → FAQ
 * Run: npx tsx scripts/seed-diagnostics-pages-v2.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

async function getServiceId(catSlug: string, svcSlug: string): Promise<string> {
  const [row] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = ${svcSlug} AND c.slug = ${catSlug}
  `;
  if (!row) throw new Error(`Service not found: ${catSlug}/${svcSlug}`);
  return row.id;
}

async function reseed(id: string, sections: object[], faqs: { q: Record<string,string>; a: Record<string,string> }[]) {
  await sql`DELETE FROM content_sections WHERE owner_id = ${id} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${id} AND owner_type = 'service'`;
  for (const s of sections as any[]) {
    await sql`INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${id}, 'service', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})`;
  }
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await sql`INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${id}, 'service', ${f.q.uk}, ${f.q.ru}, ${f.q.en}, ${f.a.uk}, ${f.a.ru}, ${f.a.en}, ${i + 1})`;
  }
}

async function main() {

  // ─── 1. InBody / Bioimpedance ─────────────────────────────────────────────
  {
    const id = await getServiceId("diagnostics", "bioimpedance");
    await reseed(id, [
      { type: "richText", sort_order: 0, data: {
        heading: { uk: "InBody в GENEVITY – що вимірює і навіщо потрібен", ru: "InBody в GENEVITY – что измеряет и зачем нужен", en: "InBody at GENEVITY – What It Measures and Why You Need It" },
        body: { uk: "Біоімпедансний аналіз на апараті InBody – це 5-хвилинне безболісне дослідження, яке показує точний склад тіла: відсоток жирової тканини, м'язову масу по кожному сегменту, рівень вісцерального жиру, водний баланс та базальний метаболізм.\n\nЗвичайні ваги показують лише загальну вагу. InBody показує, що саме складає цю вагу – жир, м'язи чи вода. Два пацієнти з однаковою вагою можуть мати принципово різний склад тіла і потребувати різних підходів.\n\nGENEVITY використовує InBody як базовий діагностичний інструмент перед будь-якою програмою корекції фігури, Longevity або Check-Up 40+.",
          ru: "Биоимпедансный анализ InBody – 5-минутное безболезненное исследование: процент жира, мышечная масса по сегментам, висцеральный жир, водный баланс, базальный метаболизм.\n\nОбычные весы показывают только вес. InBody показывает состав. GENEVITY использует InBody как базовый инструмент диагностики перед программами коррекции тела, Longevity и Check-Up 40+.",
          en: "InBody bioimpedance analysis is a 5-minute painless test showing exact body composition: fat percentage, segmental muscle mass, visceral fat level, water balance, and basal metabolic rate.\n\nOrdinary scales only show total weight. InBody shows what it consists of. GENEVITY uses InBody as the baseline diagnostic tool before any body correction programme, Longevity, or Check-Up 40+." },
      }},
      { type: "callout", sort_order: 1, data: {
        body: { uk: "Результат InBody – це детальний звіт на 1 сторінці з вашими показниками та нормами для вашого віку і статі. Лікар GENEVITY пояснить результати і складе рекомендації одразу на прийомі.",
          ru: "Результат InBody – детальный отчёт с показателями и нормами для вашего возраста и пола. Врач GENEVITY объяснит результаты и составит рекомендации сразу на приёме.",
          en: "The InBody result is a detailed one-page report with your measurements and age/gender norms. A GENEVITY physician will explain the results and provide recommendations immediately at the appointment." },
        tone: "success",
      }},
      { type: "indicationsContraindications", sort_order: 2, data: {
        title: { uk: "Кому потрібний аналіз InBody", ru: "Кому нужен анализ InBody", en: "Who Needs InBody Analysis" },
        indications: [
          { uk: "Перед початком програми схуднення або набору м'язової маси", ru: "Перед программой похудения или набора мышечной массы", en: "Before starting a weight-loss or muscle-gain programme" },
          { uk: "Для оцінки ефективності тренувань та дієти кожні 4–6 тижнів", ru: "Для оценки эффективности тренировок и диеты каждые 4–6 недель", en: "To assess training and diet effectiveness every 4–6 weeks" },
          { uk: "Перед курсом Emsculpt Neo – для фіксації вихідних показників", ru: "Перед курсом Emsculpt Neo – для фиксации исходных показателей", en: "Before Emsculpt Neo course – to record baseline measurements" },
          { uk: "Як частина Check-Up 40+ або Longevity-програми", ru: "Как часть Check-Up 40+ или Longevity-программы", en: "As part of Check-Up 40+ or Longevity programme" },
          { uk: "При підозрі на надмірний вісцеральний жир (ризик серцево-судинних захворювань)", ru: "При подозрении на избыток висцерального жира (риск ССЗ)", en: "When excess visceral fat is suspected (cardiovascular disease risk)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність", ru: "Беременность", en: "Pregnancy" },
          { uk: "Кардіостимулятор або інші імплантовані електронні пристрої", ru: "Кардиостимулятор или другие имплантированные электронные устройства", en: "Pacemaker or other implanted electronic devices" },
          { uk: "Металеві імплантати в тілі (перед дослідженням повідомте лікаря)", ru: "Металлические импланты (сообщите врачу перед исследованием)", en: "Metal implants in the body (inform physician before the test)" },
        ],
      }},
      { type: "steps", sort_order: 3, data: {
        heading: { uk: "Як проходить процедура InBody", ru: "Как проходит процедура InBody", en: "How the InBody Procedure Works" },
        steps: [
          { title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" }, description: { uk: "Не їсти 2–3 години до аналізу. Не займатися спортом за 12 годин. Зняти металеві прикраси. Вийти в туалет перед процедурою.", ru: "Не есть 2–3 часа. Не тренироваться 12 часов. Снять украшения.", en: "No food 2–3 hours before. No exercise 12 hours prior. Remove metal jewellery. Use the restroom before the test." }},
          { title: { uk: "Вимірювання", ru: "Измерение", en: "Measurement" }, description: { uk: "Пацієнт стає босоніж на платформу InBody і тримається за рукоятки. Слабкий безпечний електричний струм проходить через тіло і вимірює біоімпеданс різних тканин. Тривалість – 5 хвилин.", ru: "Пациент становится босиком на платформу InBody и держится за рукоятки. 5 минут.", en: "The patient stands barefoot on the InBody platform and holds the handles. A safe, low-level current passes through the body measuring tissue bioimpedance. Duration: 5 minutes." }},
          { title: { uk: "Аналіз результатів", ru: "Анализ результатов", en: "Results Analysis" }, description: { uk: "Апарат друкує детальний звіт. Лікар GENEVITY розбирає кожен показник, порівнює з нормами та надає конкретні рекомендації щодо харчування, тренувань або медичних процедур.", ru: "Аппарат печатает отчёт. Врач разбирает каждый показатель и даёт рекомендации.", en: "The device prints a detailed report. The GENEVITY physician reviews each measurement, compares with norms, and provides specific recommendations on nutrition, training, or medical procedures." }},
        ],
      }},
      { type: "bullets", sort_order: 4, data: {
        heading: { uk: "Що показує звіт InBody", ru: "Что показывает отчёт InBody", en: "What the InBody Report Shows" },
        items: [
          { uk: "Загальний відсоток жиру та норма для вашого віку і статі", ru: "Общий процент жира и норма для вашего возраста и пола", en: "Total fat percentage and age/gender norm" },
          { uk: "М'язова маса по сегментах: ліва/права рука, ноги, тулуб", ru: "Мышечная масса по сегментам: руки, ноги, туловище", en: "Segmental muscle mass: left/right arms, legs, trunk" },
          { uk: "Рівень вісцерального жиру (норма – до 10)", ru: "Уровень висцерального жира (норма – до 10)", en: "Visceral fat level (normal: below 10)" },
          { uk: "Водний баланс: загальна, внутрішньоклітинна та позаклітинна рідина", ru: "Водный баланс: общая, внутриклеточная и внеклеточная жидкость", en: "Water balance: total, intracellular and extracellular fluid" },
          { uk: "Базальний метаболізм – скільки калорій ваш організм витрачає у спокої", ru: "Базальный метаболизм – калории в покое", en: "Basal metabolic rate – calories your body burns at rest" },
          { uk: "Індекс маси тіла та рекомендована вагова зона", ru: "Индекс массы тела и рекомендуемая весовая зона", en: "BMI and recommended weight zone" },
        ],
      }},
    ], [
      { q: { uk: "Наскільки точний аналіз InBody?", ru: "Насколько точен анализ InBody?", en: "How accurate is InBody analysis?" },
        a: { uk: "InBody є золотим стандартом серед клінічних методів оцінки складу тіла. Точність підтверджена клінічними дослідженнями та зіставна з DEXA-скануванням. Для максимальної точності важливо дотримуватися підготовки.", ru: "InBody – золотой стандарт. Точность подтверждена исследованиями, сопоставима с DEXA. Важна подготовка.", en: "InBody is the gold standard. Accuracy is research-confirmed and comparable to DEXA scanning. Following preparation instructions is important for maximum accuracy." }},
      { q: { uk: "Як часто потрібно робити InBody?", ru: "Как часто нужно делать InBody?", en: "How often should InBody be done?" },
        a: { uk: "Для моніторингу змін – не частіше ніж раз на 4–6 тижнів (саме стільки потрібно для реальних змін у складі тіла). При активних тренуваннях – раз на 2 місяці. Як частина щорічного Check-Up – 1 раз на рік.", ru: "Для мониторинга – не чаще раза в 4–6 недель. При активных тренировках – раз в 2 месяца. Как часть Check-Up – 1 раз в год.", en: "For change monitoring: no more than once every 4–6 weeks. With active training: every 2 months. As part of annual Check-Up: once a year." }},
      { q: { uk: "Чи потрібна підготовка до InBody?", ru: "Нужна ли подготовка к InBody?", en: "Is preparation required for InBody?" },
        a: { uk: "Так: не їсти 2–3 години, не займатися спортом за 12 годин, зняти металеві прикраси. Це впливає на точність результатів. Вагітним та пацієнтам з кардіостимулятором процедура протипоказана.", ru: "Да: не есть 2–3 часа, не тренироваться 12 часов, снять украшения. Противопоказано беременным и с кардиостимулятором.", en: "Yes: no food 2–3 hours before, no exercise 12 hours prior, remove metal jewellery. This affects result accuracy. Contraindicated in pregnancy and pacemaker users." }},
    ]);
    console.log("✓ InBody / Bioimpedance");
  }

  // ─── 2. Ultrasound ────────────────────────────────────────────────────────
  {
    const id = await getServiceId("diagnostics", "ultrasound");
    await reseed(id, [
      { type: "richText", sort_order: 0, data: {
        heading: { uk: "УЗД в GENEVITY – сучасна діагностика органів", ru: "УЗИ в GENEVITY – современная диагностика органов", en: "Ultrasound at GENEVITY – Modern Organ Diagnostics" },
        body: { uk: "Ультразвукова діагностика – один із найбезпечніших та найінформативніших методів обстеження. Без рентгенівського опромінення, без болю, з результатом у день обстеження.\n\nУ GENEVITY УЗД проводить лікар ультразвукової діагностики з клінічним досвідом. Дослідження виконується на сучасному обладнанні та включає розгорнутий письмовий висновок.", ru: "УЗИ – безопасный и информативный метод диагностики. Без облучения, без боли, заключение в день исследования.\n\nВ GENEVITY УЗИ проводит врач ультразвуковой диагностики с клиническим опытом на современном оборудовании.", en: "Ultrasound diagnostics – one of the safest and most informative examination methods. No radiation, no pain, report on the day of examination.\n\nAt GENEVITY, ultrasound is performed by an experienced ultrasound diagnostician using modern equipment." },
      }},
      { type: "callout", sort_order: 1, data: {
        body: { uk: "Результат УЗД – розгорнутий висновок лікаря у день дослідження. Якщо виявлено відхилення, лікар одразу порекомендує додаткові обстеження або консультацію профільного спеціаліста.", ru: "Заключение врача в день исследования. При отклонениях – рекомендации по дообследованию.", en: "Physician's report on the day of examination. If abnormalities are found, the doctor will immediately recommend further tests or a specialist consultation." },
        tone: "success",
      }},
      { type: "indicationsContraindications", sort_order: 2, data: {
        title: { uk: "Які органи можна обстежити на УЗД", ru: "Какие органы можно обследовать на УЗИ", en: "Which Organs Can Be Examined by Ultrasound" },
        indications: [
          { uk: "Органи черевної порожнини: печінка, жовчний міхур, підшлункова залоза, селезінка", ru: "Органы брюшной полости: печень, желчный пузырь, поджелудочная железа, селезёнка", en: "Abdominal organs: liver, gallbladder, pancreas, spleen" },
          { uk: "Нирки та надниркові залози", ru: "Почки и надпочечники", en: "Kidneys and adrenal glands" },
          { uk: "Щитоподібна залоза – структура, вузли, кровотік", ru: "Щитовидная железа – структура, узлы, кровоток", en: "Thyroid gland – structure, nodules, blood flow" },
          { uk: "Суглоби: колінні, кульшові, плечові, ліктьові", ru: "Суставы: коленные, тазобедренные, плечевые, локтевые", en: "Joints: knee, hip, shoulder, elbow" },
          { uk: "Органи малого тазу (матка та яєчники у жінок, простата у чоловіків)", ru: "Органы малого таза (матка и яичники у женщин, простата у мужчин)", en: "Pelvic organs (uterus and ovaries in women, prostate in men)" },
          { uk: "Лімфатичні вузли", ru: "Лимфатические узлы", en: "Lymph nodes" },
        ],
        contraindicationsHeading: { uk: "Підготовка до УЗД", ru: "Подготовка к УЗИ", en: "Preparation" },
        contraindications: [
          { uk: "Черевна порожнина: не їсти 6–8 годин, 3 дні без газоутворюючих продуктів", ru: "Брюшная полость: не есть 6–8 часов, 3 дня без газообразующих продуктов", en: "Abdominal: no food 6–8 hours, 3 days without gas-forming foods" },
          { uk: "Нирки: прийти з повним сечовим міхуром (1 л води за 1 годину)", ru: "Почки: прийти с полным мочевым пузырём (1 л воды за час)", en: "Kidneys: arrive with full bladder (1 litre of water 1 hour before)" },
          { uk: "Щитоподібна залоза та суглоби: спеціальна підготовка не потрібна", ru: "Щитовидная железа и суставы: специальная подготовка не нужна", en: "Thyroid and joints: no special preparation required" },
        ],
      }},
      { type: "bullets", sort_order: 3, data: {
        heading: { uk: "Переваги УЗД у GENEVITY", ru: "Преимущества УЗИ в GENEVITY", en: "Advantages of Ultrasound at GENEVITY" },
        items: [
          { uk: "Відсутність рентгенівського опромінення – безпечно для всіх вікових груп", ru: "Без рентгеновского облучения – безопасно для всех", en: "No radiation – safe for all age groups" },
          { uk: "Результат у день дослідження – висновок лікаря одразу після процедури", ru: "Результат в день исследования – сразу после процедуры", en: "Same-day results – report immediately after the procedure" },
          { uk: "Сучасне обладнання з high-resolution зображенням", ru: "Современное оборудование с high-resolution изображением", en: "Modern equipment with high-resolution imaging" },
          { uk: "Можливість запису без направлення – онлайн або за телефоном", ru: "Запись без направления – онлайн или по телефону", en: "Booking without referral – online or by phone" },
        ],
      }},
    ], [
      { q: { uk: "Як підготуватися до УЗД черевної порожнини?", ru: "Как подготовиться к УЗИ брюшной полости?", en: "How to prepare for abdominal ultrasound?" },
        a: { uk: "За 3 дні: уникайте бобових, капусти, чорного хліба, газованих напоїв. За 6–8 годин до УЗД – не їсти. Можна пити негазовану воду. Приходьте натще.", ru: "За 3 дня исключите газообразующие продукты. За 6–8 часов не есть. Прийти натощак.", en: "3 days before: avoid gas-forming foods (legumes, cabbage, carbonated drinks). 6–8 hours before: no food. Come fasting." }},
      { q: { uk: "Чи потрібне направлення для УЗД?", ru: "Нужно ли направление для УЗИ?", en: "Is a referral needed for ultrasound?" },
        a: { uk: "Ні. У GENEVITY можна записатися на УЗД без направлення – самостійно онлайн або за телефоном. Якщо є направлення від лікаря – візьміть його з собою.", ru: "Нет, направление не обязательно. При наличии направления – возьмите с собой.", en: "No referral required. You can book independently online or by phone. If you have a referral, bring it along." }},
    ]);
    console.log("✓ Ultrasound");
  }

  // ─── 3. Endocrinologist ───────────────────────────────────────────────────
  {
    const id = await getServiceId("diagnostics", "endocrinologist");
    await reseed(id, [
      { type: "richText", sort_order: 0, data: {
        heading: { uk: "Ендокринолог у GENEVITY – коли і навіщо звертатися", ru: "Эндокринолог в GENEVITY – когда и зачем обращаться", en: "Endocrinologist at GENEVITY – When and Why to Consult" },
        body: { uk: "Ендокринолог – лікар, що спеціалізується на захворюваннях залоз внутрішньої секреції та гормональних порушеннях. У GENEVITY ендокринолог веде пацієнтів як у рамках загальної практики, так і в контексті програм Longevity та Гормонального балансу.\n\nГормональна система впливає на все: вагу, енергію, настрій, якість сну, стан шкіри, лібідо та темп старіння. Дисбаланс одного гормону запускає ланцюгову реакцію. Своєчасна діагностика дозволяє коригувати відхилення до розвитку хронічних захворювань.", ru: "Эндокринолог специализируется на гормональных нарушениях. В GENEVITY ведёт пациентов в рамках Longevity и программы Гормонального баланса.\n\nГормональная система влияет на всё: вес, энергию, настроение, кожу, либидо и темп старения.", en: "An endocrinologist specialises in endocrine gland diseases and hormonal disorders. At GENEVITY, the endocrinologist works within both general practice and Longevity/Hormonal Balance programmes.\n\nThe hormonal system affects everything: weight, energy, mood, sleep quality, skin condition, libido, and ageing rate." },
      }},
      { type: "callout", sort_order: 1, data: {
        body: { uk: "На першому прийомі лікар збирає детальний анамнез, призначає необхідні аналізи та складає індивідуальний план. Повторний прийом після отримання результатів аналізів включений у програму.", ru: "На первом приёме – детальный анамнез, назначение анализов, индивидуальный план. Повторный приём после результатов включён.", en: "At the first appointment: detailed history, test referrals, individual plan. Follow-up appointment after results is included in the programme." },
        tone: "success",
      }},
      { type: "indicationsContraindications", sort_order: 2, data: {
        title: { uk: "Коли потрібна консультація ендокринолога", ru: "Когда нужна консультация эндокринолога", en: "When to Consult an Endocrinologist" },
        indications: [
          { uk: "Захворювання щитоподібної залози: гіпотиреоз, гіпертиреоз, вузли, зоб", ru: "Заболевания щитовидной железы: гипотиреоз, гипертиреоз, узлы, зоб", en: "Thyroid diseases: hypothyroidism, hyperthyroidism, nodules, goitre" },
          { uk: "Цукровий діабет 1 та 2 типу, переддіабет, резистентність до інсуліну", ru: "Диабет 1 и 2 типа, предиабет, инсулинорезистентность", en: "Diabetes type 1 and 2, pre-diabetes, insulin resistance" },
          { uk: "Надмірна вага або труднощі зі схудненням на фоні гормонального дисбалансу", ru: "Лишний вес или сложности с похудением на фоне гормонального дисбаланса", en: "Excess weight or difficulty losing weight due to hormonal imbalance" },
          { uk: "Хронічна втома, погіршення пам'яті та концентрації, зниження лібідо", ru: "Хроническая усталость, ухудшение памяти и концентрации, снижение либидо", en: "Chronic fatigue, reduced memory and concentration, decreased libido" },
          { uk: "Остеопороз та дефіцит вітаміну D, кальцію", ru: "Остеопороз и дефицит витамина D, кальция", en: "Osteoporosis and vitamin D or calcium deficiency" },
          { uk: "Підготовка до програми Гормональний баланс або Longevity", ru: "Подготовка к программе Гормональный баланс или Longevity", en: "Preparation for Hormonal Balance or Longevity programme" },
        ],
        contraindicationsHeading: { uk: "Аналізи перед прийомом", ru: "Анализы перед приёмом", en: "Tests to Bring" },
        contraindications: [
          { uk: "ТТГ, Т3 вільний, Т4 вільний, антитіла до ТПО (якщо є результати)", ru: "ТТГ, Т3, Т4 свободный, антитела к ТПО (если есть результаты)", en: "TSH, free T3, free T4, anti-TPO antibodies (if available)" },
          { uk: "Глюкоза натще та HbA1c (при підозрі на діабет)", ru: "Глюкоза натощак и HbA1c (при подозрении на диабет)", en: "Fasting glucose and HbA1c (if diabetes is suspected)" },
          { uk: "Попередні аналізи та висновки лікарів – принесіть усе, що є", ru: "Предыдущие анализы и заключения – принесите всё что есть", en: "Previous test results and physician reports – bring everything available" },
        ],
      }},
      { type: "bullets", sort_order: 3, data: {
        heading: { uk: "Що включає прийом ендокринолога в GENEVITY", ru: "Что включает приём эндокринолога в GENEVITY", en: "What an Endocrinologist Appointment at GENEVITY Includes" },
        items: [
          { uk: "Збір скарг та детального анамнезу (включаючи сімейний)", ru: "Сбор жалоб и детального анамнеза (включая семейный)", en: "Complaint intake and detailed history (including family history)" },
          { uk: "Огляд та пальпація щитоподібної залози", ru: "Осмотр и пальпация щитовидной железы", en: "Examination and palpation of the thyroid gland" },
          { uk: "Аналіз наявних результатів обстежень та аналізів", ru: "Анализ имеющихся результатов обследований и анализов", en: "Review of available examination results and tests" },
          { uk: "Призначення індивідуального плану аналізів та обстежень", ru: "Назначение индивидуального плана анализов и обследований", en: "Prescription of an individual diagnostics and testing plan" },
          { uk: "Рекомендації щодо лікування або корекції способу життя", ru: "Рекомендации по лечению или коррекции образа жизни", en: "Treatment or lifestyle modification recommendations" },
        ],
      }},
    ], [
      { q: { uk: "Які аналізи здати перед прийомом ендокринолога?", ru: "Какие анализы сдать перед приёмом эндокринолога?", en: "What tests to take before an endocrinologist appointment?" },
        a: { uk: "Базовий пакет: ТТГ, Т3 вільний, Т4 вільний, антитіла до ТПО. При підозрі на діабет: глюкоза натще, HbA1c. Якщо аналізів немає – лікар призначить їх на прийомі та направить до нашої лабораторії.", ru: "ТТГ, Т3, Т4, антитела к ТПО. При диабете: глюкоза, HbA1c. Если анализов нет – врач назначит на приёме.", en: "Basic panel: TSH, free T3, free T4, anti-TPO antibodies. For diabetes: fasting glucose, HbA1c. If no tests available – the physician will order them at the appointment." }},
      { q: { uk: "Чи займається ендокринолог GENEVITY гормональним балансом і антиейджингом?", ru: "Занимается ли эндокринолог GENEVITY гормональным балансом и антиэйджингом?", en: "Does the GENEVITY endocrinologist work with hormonal balance and anti-ageing?" },
        a: { uk: "Так. Ендокринолог GENEVITY спеціалізується на превентивній медицині, включаючи оптимізацію гормонального фону у рамках програми Гормональний баланс та Longevity. Це включає роботу з дефіцитом тестостерону, естрогену, гормонів щитоподібної залози, вітаміну D та інших ключових маркерів.", ru: "Да. Специализируется на превентивной медицине: оптимизация гормонального фона в рамках программ Гормональный баланс и Longevity.", en: "Yes. The GENEVITY endocrinologist specialises in preventive medicine, including hormonal optimisation within Hormonal Balance and Longevity programmes. This includes testosterone, oestrogen, thyroid hormones, vitamin D, and other key markers." }},
    ]);
    console.log("✓ Endocrinologist");
  }

  // ─── 4. Cosmetologist ─────────────────────────────────────────────────────
  {
    const id = await getServiceId("diagnostics", "cosmetologist");
    await reseed(id, [
      { type: "richText", sort_order: 0, data: {
        heading: { uk: "Консультація лікаря-косметолога в GENEVITY", ru: "Консультация врача-косметолога в GENEVITY", en: "Medical Cosmetologist Consultation at GENEVITY" },
        body: { uk: "Лікар-косметолог у GENEVITY – це лікар з повною медичною освітою та спеціалізацією у дерматокосметології. На відміну від косметолога без медичної освіти, лікар може призначати рецептурні препарати, проводити ін'єкційні процедури та лікувати шкірні захворювання.\n\nКонсультація перед першою косметологічною процедурою – обов'язковий крок, який дозволяє підібрати саме те, що потрібно вашій шкірі, і уникнути помилок, що потім складно виправити.", ru: "Врач-косметолог в GENEVITY – врач с медицинским образованием и специализацией в дерматокосметологии. Может назначать препараты, проводить инъекции и лечить кожные заболевания.\n\nКонсультация перед первой процедурой – обязательный шаг для правильного подбора.", en: "A medical cosmetologist at GENEVITY holds a full medical degree with dermatocosmetology specialisation. Unlike a non-medical cosmetologist, they can prescribe medications, perform injectable procedures, and treat skin conditions.\n\nA consultation before the first cosmetic procedure is an essential step to select exactly what your skin needs." },
      }},
      { type: "callout", sort_order: 1, data: {
        body: { uk: "Після консультації лікар складає письмову індивідуальну програму з переліком рекомендованих процедур, їх послідовністю та домашнім доглядом. Ви точно знаєте, що і навіщо.", ru: "После консультации – письменная программа с перечнем процедур, их последовательностью и домашним уходом.", en: "After the consultation, the physician provides a written individual programme with the list of recommended procedures, their sequence, and home skincare. You know exactly what and why." },
        tone: "success",
      }},
      { type: "indicationsContraindications", sort_order: 2, data: {
        title: { uk: "З якими питаннями звертатися до косметолога", ru: "С какими вопросами обращаться к косметологу", en: "What Questions to Bring to the Cosmetologist" },
        indications: [
          { uk: "Підбір першої косметологічної процедури – апаратної, ін'єкційної або доглядової", ru: "Подбор первой косметологической процедуры – аппаратной, инъекционной или уходовой", en: "Selecting the first cosmetic procedure – apparatus, injectable, or care" },
          { uk: "Акне, постакне, висипання – встановлення причини та схема лікування", ru: "Акне, постакне, высыпания – установление причины и схема лечения", en: "Acne, post-acne, breakouts – identifying cause and treatment plan" },
          { uk: "Пігментні плями, нерівний тон, купероз", ru: "Пигментные пятна, неровный тон, купероз", en: "Pigmentation spots, uneven skin tone, rosacea" },
          { uk: "Антивікова програма: підбір процедур для конкретного віку та типу шкіри", ru: "Антивозрастная программа: подбор процедур для конкретного возраста и типа кожи", en: "Anti-ageing programme: procedure selection for specific age and skin type" },
          { uk: "Підбір домашнього догляду на основі аналізу стану шкіри", ru: "Подбор домашнего ухода на основе анализа состояния кожи", en: "Home skincare selection based on skin condition analysis" },
        ],
        contraindicationsHeading: { uk: "Що відбувається на консультації", ru: "Что происходит на консультации", en: "What Happens at the Consultation" },
        contraindications: [
          { uk: "Дерматоскопія та детальний аналіз стану шкіри під збільшенням", ru: "Дерматоскопия и детальный анализ кожи под увеличением", en: "Dermatoscopy and detailed skin analysis under magnification" },
          { uk: "Збір анамнезу: алергії, хронічні захворювання, прийом препаратів", ru: "Сбор анамнеза: аллергии, хронические заболевания, препараты", en: "History taking: allergies, chronic conditions, current medications" },
          { uk: "Визначення типу шкіри та актуальних проблем", ru: "Определение типа кожи и актуальных проблем", en: "Skin type determination and current problem identification" },
        ],
      }},
      { type: "bullets", sort_order: 3, data: {
        heading: { uk: "Чим лікар-косметолог відрізняється від косметолога без медичної освіти", ru: "Чем врач-косметолог отличается от косметолога без медобразования", en: "How a Medical Cosmetologist Differs From a Non-Medical One" },
        items: [
          { uk: "Повна медична освіта: 6 років медичного університету + інтернатура з дерматології", ru: "Полное медицинское образование: 6 лет медуниверситета + интернатура", en: "Full medical education: 6 years of medical university + dermatology residency" },
          { uk: "Право проводити ін'єкційні процедури: ботулінотерапія, філери, мезотерапія", ru: "Право на инъекционные процедуры: ботулинотерапия, филлеры, мезотерапия", en: "Licensed to perform injectables: botulinum therapy, fillers, mesotherapy" },
          { uk: "Може призначати рецептурні препарати для лікування шкіри (ізотретиноїн, антибіотики)", ru: "Может назначать рецептурные препараты для лечения кожи", en: "Can prescribe prescription medications for skin treatment (isotretinoin, antibiotics)" },
          { uk: "Відповідальність відповідно до медичної ліцензії та законодавства", ru: "Ответственность согласно медицинской лицензии и законодательству", en: "Accountability under medical licence and legislation" },
        ],
      }},
    ], [
      { q: { uk: "Чи обов'язкова консультація перед процедурою?", ru: "Обязательна ли консультация перед процедурой?", en: "Is a consultation mandatory before a procedure?" },
        a: { uk: "Для ін'єкційних процедур (ботулінотерапія, філери) – консультація є обов'язковою частиною протоколу. Для апаратних та доглядових процедур – настійно рекомендована, оскільки дозволяє правильно підібрати методику та уникнути ускладнень.", ru: "Для инъекционных – обязательна. Для аппаратных и уходовых – настоятельно рекомендована.", en: "For injectable procedures (botulinum therapy, fillers) – consultation is a mandatory protocol requirement. For apparatus and care procedures – strongly recommended to select the right technique and avoid complications." }},
      { q: { uk: "Скільки коштує консультація косметолога в GENEVITY?", ru: "Сколько стоит консультация косметолога в GENEVITY?", en: "How much is a cosmetologist consultation at GENEVITY?" },
        a: { uk: "Вартість консультації уточнюйте на сайті або за телефоном. У GENEVITY консультація включає детальний аналіз шкіри та письмову програму рекомендацій – це повноцінний прийом, а не продажний дзвінок.", ru: "Стоимость уточняйте на сайте или по телефону. Консультация включает детальный анализ кожи и письменную программу.", en: "Pricing is available on the website or by phone. At GENEVITY, the consultation includes a detailed skin analysis and a written recommendations programme – it is a full medical appointment, not a sales call." }},
    ]);
    console.log("✓ Cosmetologist");
  }

  // ─── 5. Ultrasound Diagnostician ─────────────────────────────────────────
  {
    const id = await getServiceId("diagnostics", "ultrasound-diagnostician");
    await reseed(id, [
      { type: "richText", sort_order: 0, data: {
        heading: { uk: "Лікар УЗД в GENEVITY – досвід і сучасне обладнання", ru: "Врач УЗД в GENEVITY – опыт и современное оборудование", en: "Ultrasound Diagnostician at GENEVITY – Experience and Modern Equipment" },
        body: { uk: "Лікар ультразвукової діагностики GENEVITY проводить дослідження на сучасному обладнанні класу «експерт» та надає розгорнутий письмовий висновок у день обстеження.\n\nДослідження можна пройти самостійно або за направленням лікаря. При наявності скарг або хронічних захворювань лікар УЗД враховує клінічний контекст та описує не лише виявлені зміни, а й їх можливе клінічне значення.", ru: "Врач УЗД GENEVITY проводит исследования на экспертном оборудовании. Заключение в день обследования.\n\nДоступно самостоятельно или по направлению. Врач учитывает клинический контекст.", en: "GENEVITY's ultrasound diagnostician uses expert-class equipment and provides a written report on the day of examination.\n\nAvailable without referral. When relevant, the physician considers clinical context and describes not only findings but their potential clinical significance." },
      }},
      { type: "callout", sort_order: 1, data: {
        body: { uk: "Якщо за результатами УЗД виявлено відхилення, лікар GENEVITY одразу направить вас до відповідного профільного фахівця або призначить додаткові обстеження. Весь медичний маршрут – всередині клініки.", ru: "При выявлении отклонений – направление к профильному специалисту или дополнительные обследования. Весь медицинский маршрут – внутри клиники.", en: "If abnormalities are found, the GENEVITY physician will immediately refer you to the appropriate specialist or prescribe further tests. The full medical pathway stays within the clinic." },
        tone: "success",
      }},
      { type: "indicationsContraindications", sort_order: 2, data: {
        title: { uk: "Які дослідження проводить лікар УЗД в GENEVITY", ru: "Какие исследования проводит врач УЗД в GENEVITY", en: "Ultrasound Examinations Available at GENEVITY" },
        indications: [
          { uk: "УЗД органів черевної порожнини: печінка, жовчний міхур, підшлункова, селезінка", ru: "УЗИ органов брюшной полости: печень, желчный пузырь, поджелудочная, селезёнка", en: "Abdominal organs: liver, gallbladder, pancreas, spleen" },
          { uk: "УЗД нирок та надниркових залоз", ru: "УЗИ почек и надпочечников", en: "Kidneys and adrenal glands" },
          { uk: "УЗД щитоподібної залози – структура, розмір, вузли, кровотік", ru: "УЗИ щитовидной железы – структура, размер, узлы, кровоток", en: "Thyroid gland – structure, size, nodules, blood flow" },
          { uk: "УЗД суглобів: колінні, кульшові, плечові, ліктьові", ru: "УЗИ суставов: коленные, тазобедренные, плечевые, локтевые", en: "Joints: knee, hip, shoulder, elbow" },
          { uk: "УЗД органів малого тазу (жінки та чоловіки)", ru: "УЗИ органов малого таза (женщины и мужчины)", en: "Pelvic organs (women and men)" },
          { uk: "УЗД лімфатичних вузлів", ru: "УЗИ лимфатических узлов", en: "Lymph nodes" },
        ],
        contraindicationsHeading: { uk: "Протипоказань немає", ru: "Противопоказаний нет", en: "No contraindications" },
        contraindications: [
          { uk: "УЗД не має протипоказань – метод безпечний для всіх, включаючи вагітних та дітей", ru: "УЗИ не имеет противопоказаний – метод безопасен для всех, включая беременных и детей", en: "Ultrasound has no contraindications – safe for everyone including pregnant women and children" },
        ],
      }},
      { type: "bullets", sort_order: 3, data: {
        heading: { uk: "Переваги УЗД-діагностики в GENEVITY", ru: "Преимущества УЗД-диагностики в GENEVITY", en: "Advantages of Ultrasound Diagnostics at GENEVITY" },
        items: [
          { uk: "Обладнання класу «експерт» – висока роздільна здатність зображення", ru: "Оборудование класса «эксперт» – высокое разрешение изображения", en: "Expert-class equipment – high-resolution imaging" },
          { uk: "Висновок лікаря у день дослідження – без очікування", ru: "Заключение врача в день исследования – без ожидания", en: "Physician's report on the day of examination – no waiting" },
          { uk: "Без направлення – запис онлайн або за телефоном", ru: "Без направления – запись онлайн или по телефону", en: "No referral required – book online or by phone" },
          { uk: "Консультація щодо результатів включена – лікар пояснить висновок", ru: "Консультация по результатам включена – врач объяснит заключение", en: "Results consultation included – the physician will explain the report" },
        ],
      }},
    ], [
      { q: { uk: "Чи потрібне направлення для УЗД?", ru: "Нужно ли направление для УЗИ?", en: "Is a referral needed for ultrasound?" },
        a: { uk: "Ні. У GENEVITY можна записатися на будь-яке УЗД без направлення – самостійно онлайн або за телефоном. Якщо є направлення від лікаря – принесіть його, лікар УЗД врахує клінічне питання при аналізі.", ru: "Нет, направление не обязательно. При наличии – принесите на приём.", en: "No referral required. You can book any ultrasound independently online or by phone. If you have a referral, bring it – the ultrasound physician will consider the clinical question." }},
      { q: { uk: "Коли буде готовий висновок УЗД?", ru: "Когда будет готово заключение УЗИ?", en: "When will the ultrasound report be ready?" },
        a: { uk: "Висновок видається одразу після дослідження – у день обстеження. Лікар УЗД особисто пояснить результати та відповість на запитання.", ru: "Заключение – сразу после исследования, в день обследования. Врач объяснит результаты лично.", en: "The report is issued immediately after the examination – on the same day. The ultrasound physician will personally explain the results and answer questions." }},
    ]);
    console.log("✓ Ultrasound Diagnostician");
  }

  console.log("\n✅ All 5 diagnostics pages re-seeded with full section structure.");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
