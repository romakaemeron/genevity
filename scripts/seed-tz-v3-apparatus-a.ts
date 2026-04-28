/**
 * TZ-compliant seed: apparatus services batch A
 * Services: emface, volnewmer, exion, ultraformer-mpt, emsculpt-neo
 * 7 sections each + exact FAQ questions from TZ
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

type Section =
  | { type: "richText"; heading: L; body: L }
  | { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] }
  | { type: "callout"; tone: "info" | "warning" | "success"; body: L }
  | { type: "steps"; heading: L; steps: { title: L; body: L }[] }
  | { type: "bullets"; heading: L; items: L[] }
  | { type: "imageGallery"; heading: L; images: { url: string; alt: string }[] }
  | { type: "cta"; heading: L; body: L; ctaLabel: L; ctaHref: string };

function sectionData(s: Section): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "callout") return { tone: s.tone, body: s.body };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  if (s.type === "imageGallery") return { heading: s.heading, images: s.images };
  if (s.type === "cta") return { heading: s.heading, body: s.body, ctaLabel: s.ctaLabel, ctaHref: s.ctaHref };
  return {};
}

interface ServiceSeed {
  slug: string;
  sections: Section[];
  faqs: { question: L; answer: L }[];
}

const interiorImages = [
  { url: "/images/interior/SEMI1276-HDR.webp", alt: "Кабінет косметолога GENEVITY" },
  { url: "/images/interior/SEMI1662-HDR.webp", alt: "Клініка GENEVITY — інтер'єр" },
  { url: "/images/interior/SEMI7509.webp", alt: "Процедурний кабінет GENEVITY" },
];

const services: ServiceSeed[] = [
  // ─── 15. EMFACE ───────────────────────────────────────────────────────────
  {
    slug: "emface",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "EMFACE — безін'єкційне омолодження обличчя в GENEVITY",
          ru: "EMFACE — безинъекционное омоложение лица в GENEVITY",
          en: "EMFACE — Non-Invasive Facial Rejuvenation at GENEVITY",
        },
        body: {
          uk: "EMFACE — перша у світі процедура, яка одночасно впливає на шкіру та м'язи обличчя без ін'єкцій і хірургічного втручання. Технологія поєднує синхронізовану радіочастотну (RF) енергію та HIFES™-стимуляцію м'язів, досягаючи ліфтингового ефекту, який раніше був можливий лише з ботулотоксином або хірургічним натяжінням.\n\nРадіочастотна складова нагріває дерму до терапевтичної температури, стимулюючи вироблення нового колагену та еластину. Синхронна м'язова стимуляція HIFES™ викликає скорочення мімічних м'язів, зміцнюючи та підтягуючи овал обличчя без жодного уколу.\n\nКлінічні дослідження виробника показали: після курсу з 4 сеансів у пацієнтів відзначається збільшення щільності колагену на 26%, підвищення тонусу м'язів на 37% та видиме зменшення зморшок на 23%. Процедура виконується за допомогою апаратного методу — аплікатори накладаються на лоб, щоки та підборіддя, сеанс триває 20 хвилин.\n\nEMFACE підходить для профілактичного та корекційного омолодження в будь-якому віці. У GENEVITY процедуру виконують лікарі-косметологи з медичною освітою, що гарантує безпеку та правильний підбір параметрів індивідуально для кожного пацієнта.",
          ru: "EMFACE — первая в мире процедура, которая одновременно воздействует на кожу и мышцы лица без инъекций и хирургического вмешательства. Технология сочетает синхронизированную радиочастотную (RF) энергию и HIFES™-стимуляцию мышц, достигая лифтингового эффекта, который раньше был возможен только с ботулотоксином или хирургическим натяжением.\n\nРадиочастотная составляющая нагревает дерму до терапевтической температуры, стимулируя выработку нового коллагена и эластина. Синхронная мышечная стимуляция HIFES™ вызывает сокращение мимических мышц, укрепляя и подтягивая овал лица без единого укола.\n\nКлинические исследования производителя показали: после курса из 4 сеансов у пациентов отмечается увеличение плотности коллагена на 26%, повышение тонуса мышц на 37% и видимое уменьшение морщин на 23%. Процедура выполняется с помощью аппаратного метода — аппликаторы накладываются на лоб, щёки и подбородок, сеанс длится 20 минут.\n\nEMFACE подходит для профилактического и коррекционного омоложения в любом возрасте. В GENEVITY процедуру выполняют врачи-косметологи с медицинским образованием, что гарантирует безопасность и правильный подбор параметров индивидуально для каждого пациента.",
          en: "EMFACE is the world's first procedure that simultaneously targets skin and facial muscles — no injections, no surgery. The technology combines synchronised radiofrequency (RF) energy and HIFES™ muscle stimulation, delivering a lifting effect previously only achievable with botulinum toxin or surgical tightening.\n\nThe RF component heats the dermis to a therapeutic temperature, stimulating new collagen and elastin production. Synchronised HIFES™ muscle stimulation triggers contractions in the facial muscles, firming and lifting the facial contour without a single needle.\n\nClinical studies by the manufacturer showed: after a course of 4 sessions, patients experienced a 26% increase in collagen density, 37% improvement in muscle tone, and a visible 23% reduction in wrinkles. The procedure uses applicators placed on the forehead, cheeks, and chin; each session lasts 20 minutes.\n\nEMFACE is suitable for preventive and corrective rejuvenation at any age. At GENEVITY the procedure is performed by doctors with medical qualifications, ensuring safety and individually calibrated settings.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до EMFACE",
          ru: "Показания к EMFACE",
          en: "Indications for EMFACE",
        },
        indications: [
          { uk: "Зниження тонусу та птоз м'яких тканин обличчя", ru: "Снижение тонуса и птоз мягких тканей лица", en: "Reduced muscle tone and soft tissue ptosis" },
          { uk: "Поверхневі та глибокі зморшки лоба, міжбрівної зони, носогубних складок", ru: "Поверхностные и глубокие морщины лба, межбровной зоны, носогубных складок", en: "Superficial and deep wrinkles of the forehead, glabella, nasolabial folds" },
          { uk: "Нечіткий овал обличчя, розпливчастий контур нижньої третини", ru: "Нечёткий овал лица, размытый контур нижней трети", en: "Undefined facial contour and blurred lower-third definition" },
          { uk: "Профілактика вікових змін у 25–35 років", ru: "Профилактика возрастных изменений в 25–35 лет", en: "Prevention of age-related changes from 25–35 years" },
          { uk: "Бажання замінити ін'єкційне омолодження безін'єкційним методом", ru: "Желание заменить инъекционное омоложение безынъекционным методом", en: "Preference for needle-free rejuvenation instead of injectable treatments" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Металеві імпланти, кардіостимулятори, нейростимулятори в зоні обробки", ru: "Металлические импланты, кардиостимуляторы, нейростимуляторы в зоне обработки", en: "Metal implants, pacemakers, neurostimulators in the treatment area" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Гострі запальні захворювання шкіри, відкриті рани у зоні обробки", ru: "Острые воспалительные заболевания кожи, открытые раны в зоне обработки", en: "Acute inflammatory skin conditions or open wounds in the treatment area" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
          { uk: "Епілепсія", ru: "Эпилепсия", en: "Epilepsy" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "EMFACE — єдина апаратна процедура, яка одночасно омолоджує шкіру та зміцнює м'язи обличчя. 20 хвилин без болю, без голок, без реабілітаційного періоду.",
          ru: "EMFACE — единственная аппаратная процедура, которая одновременно омолаживает кожу и укрепляет мышцы лица. 20 минут без боли, без иголок, без реабилитационного периода.",
          en: "EMFACE is the only device-based procedure that simultaneously rejuvenates skin and strengthens facial muscles. 20 minutes, no pain, no needles, no downtime.",
        },
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить процедура EMFACE",
          ru: "Как проходит процедура EMFACE",
          en: "How the EMFACE Procedure Works",
        },
        steps: [
          {
            title: { uk: "Консультація та діагностика", ru: "Консультация и диагностика", en: "Consultation and assessment" },
            body: { uk: "Лікар оцінює стан шкіри, тонус м'язів, виразність зморшок та визначає зони для обробки. Обговорюються очікування та кількість сеансів.", ru: "Врач оценивает состояние кожи, тонус мышц, выраженность морщин и определяет зоны для обработки. Обсуждаются ожидания и количество сеансов.", en: "The doctor assesses skin condition, muscle tone, wrinkle depth and determines treatment zones. Expectations and number of sessions are discussed." },
          },
          {
            title: { uk: "Підготовка шкіри", ru: "Подготовка кожи", en: "Skin preparation" },
            body: { uk: "Обличчя очищається від макіяжу та засобів догляду. Ніякого гелю, ніяких ін'єкцій — аплікатори прикладаються безпосередньо до шкіри.", ru: "Лицо очищается от макияжа и средств по уходу. Никакого геля, никаких инъекций — аппликаторы прикладываются непосредственно к коже.", en: "The face is cleansed of make-up and skincare products. No gel, no injections — applicators are placed directly on the skin." },
          },
          {
            title: { uk: "Процедура (20 хвилин)", ru: "Процедура (20 минут)", en: "Treatment (20 minutes)" },
            body: { uk: "Три аплікатори розміщуються на лобі та щоках. Апарат синхронно подає RF-енергію та HIFES™-імпульси. Пацієнт відчуває тепло та легке поколювання.", ru: "Три аппликатора размещаются на лбу и щёках. Аппарат синхронно подаёт RF-энергию и HIFES™-импульсы. Пациент ощущает тепло и лёгкое покалывание.", en: "Three applicators are placed on the forehead and cheeks. The device simultaneously delivers RF energy and HIFES™ impulses. The patient feels warmth and mild tingling." },
          },
          {
            title: { uk: "Завершення та рекомендації", ru: "Завершение и рекомендации", en: "Completion and aftercare" },
            body: { uk: "Аплікатори знімаються. Шкіра може бути злегка рожевою — це норма. Лікар надає рекомендації щодо догляду після процедури.", ru: "Аппликаторы снимаются. Кожа может быть слегка розовой — это норма. Врач даёт рекомендации по уходу после процедуры.", en: "Applicators are removed. Slight skin redness is normal. The doctor provides post-procedure skincare recommendations." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та особливості EMFACE",
          ru: "Преимущества и особенности EMFACE",
          en: "Benefits and Key Features of EMFACE",
        },
        items: [
          { uk: "Поєднує RF-ліфтинг шкіри та HIFES™-стимуляцію м'язів в одній процедурі", ru: "Сочетает RF-лифтинг кожи и HIFES™-стимуляцию мышц в одной процедуре", en: "Combines RF skin lifting and HIFES™ muscle stimulation in a single session" },
          { uk: "Немає ін'єкцій, немає хірургічного втручання, нульова реабілітація", ru: "Нет инъекций, нет хирургии, нулевая реабилитация", en: "No injections, no surgery, zero downtime" },
          { uk: "Клінічно підтверджено: +26% колагену, +37% тонусу м'язів, −23% зморшок", ru: "Клинически подтверждено: +26% коллагена, +37% тонуса мышц, −23% морщин", en: "Clinically proven: +26% collagen, +37% muscle tone, −23% wrinkles" },
          { uk: "Тривалість сеансу — 20 хвилин, курс — 4 процедури з інтервалом 1 тиждень", ru: "Длительность сеанса — 20 минут, курс — 4 процедуры с интервалом 1 неделя", en: "Session duration 20 minutes; a course of 4 procedures, 1 week apart" },
          { uk: "Ефект зберігається 6–12 місяців та посилюється впродовж 3 місяців після курсу", ru: "Эффект сохраняется 6–12 месяцев и усиливается в течение 3 месяцев после курса", en: "Results last 6–12 months and continue to improve for 3 months post-course" },
          { uk: "⚠ Не є заміною хірургічного ліфтингу при вираженому птозі — лікар визначить підходящий метод", ru: "⚠ Не является заменой хирургического лифтинга при выраженном птозе — врач определит подходящий метод", en: "⚠ Not a replacement for surgical lifting with severe ptosis — the doctor will advise the right approach" },
        ],
      },
      {
        type: "imageGallery",
        heading: {
          uk: "Апаратний кабінет та обладнання GENEVITY",
          ru: "Аппаратный кабинет и оборудование GENEVITY",
          en: "GENEVITY Device Room and Equipment",
        },
        images: [
          { url: "/images/equipment/emface.webp", alt: "Апарат EMFACE у GENEVITY" },
          ...interiorImages,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на EMFACE в Дніпрі", ru: "Запишитесь на EMFACE в Днепре", en: "Book EMFACE in Dnipro" },
        body: { uk: "Дізнайтеся вартість курсу EMFACE та підберіть оптимальну програму омолодження на безкоштовній консультації лікаря.", ru: "Узнайте стоимость курса EMFACE и подберите оптимальную программу омоложения на бесплатной консультации врача.", en: "Find out the EMFACE course cost and select your personalised rejuvenation programme at a free doctor consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи безпечна процедура EMFACE?", ru: "Безопасна ли процедура EMFACE?", en: "Is the EMFACE procedure safe?" },
        answer: { uk: "Так. EMFACE пройшла клінічні дослідження та отримала схвалення FDA. Процедура не пошкоджує шкіру, не має побічних ефектів, характерних для ін'єкцій, і виконується виключно лікарями.", ru: "Да. EMFACE прошла клинические исследования и получила одобрение FDA. Процедура не повреждает кожу, не имеет побочных эффектов, характерных для инъекций, и выполняется исключительно врачами.", en: "Yes. EMFACE has passed clinical trials and received FDA clearance. It does not damage the skin, carries none of the side effects of injectables, and is performed exclusively by doctors." },
      },
      {
        question: { uk: "Скільки триває реабілітаційний період після EMFACE?", ru: "Сколько длится реабилитационный период после EMFACE?", en: "How long is the recovery period after EMFACE?" },
        answer: { uk: "Реабілітаційний період відсутній. Після процедури може зберігатися легке почервоніння шкіри протягом 1–2 годин — це норма. Ви можете відразу повернутися до звичного ритму життя.", ru: "Реабилитационный период отсутствует. После процедуры может сохраняться лёгкое покраснение кожи в течение 1–2 часов — это норма. Вы можете сразу вернуться к привычному ритму жизни.", en: "There is no recovery period. Mild skin redness may persist for 1–2 hours after the procedure — this is normal. You can return to your usual routine immediately." },
      },
      {
        question: { uk: "Чи можна поєднувати EMFACE з іншими косметологічними процедурами?", ru: "Можно ли сочетать EMFACE с другими косметологическими процедурами?", en: "Can EMFACE be combined with other cosmetic procedures?" },
        answer: { uk: "Так. EMFACE добре поєднується з біоревіталізацією, мезотерапією та контурною пластикою. Лікар підбере оптимальну комбінацію та інтервали між процедурами.", ru: "Да. EMFACE хорошо сочетается с биоревитализацией, мезотерапией и контурной пластикой. Врач подберёт оптимальную комбинацию и интервалы между процедурами.", en: "Yes. EMFACE combines well with biorevitalisation, mesotherapy and contour correction. The doctor will select the optimal combination and intervals." },
      },
      {
        question: { uk: "Які можливі побічні ефекти після EMFACE?", ru: "Какие возможные побочные эффекты после EMFACE?", en: "What are the possible side effects after EMFACE?" },
        answer: { uk: "EMFACE є безпечною процедурою з мінімальними побічними ефектами. Можливе тимчасове почервоніння та незначний набряк у зоні обробки, які зникають упродовж кількох годин.", ru: "EMFACE является безопасной процедурой с минимальными побочными эффектами. Возможно временное покраснение и незначительный отёк в зоне обработки, которые проходят в течение нескольких часов.", en: "EMFACE is a safe procedure with minimal side effects. Temporary redness and slight swelling in the treatment area may occur and typically resolve within a few hours." },
      },
      {
        question: { uk: "Як довго зберігається ефект від процедури EMFACE?", ru: "Как долго сохраняется эффект от процедуры EMFACE?", en: "How long do EMFACE results last?" },
        answer: { uk: "Ефект від курсу EMFACE зберігається 6–12 місяців. Результати продовжують покращуватися впродовж 3 місяців після завершення курсу з 4 сеансів завдяки поступовому відновленню колагену.", ru: "Эффект от курса EMFACE сохраняется 6–12 месяцев. Результаты продолжают улучшаться в течение 3 месяцев после завершения курса из 4 сеансов благодаря постепенному восстановлению коллагена.", en: "EMFACE course results last 6–12 months. Results continue improving for 3 months after completing the 4-session course as collagen gradually regenerates." },
      },
    ],
  },

  // ─── 16. Volnewmer ───────────────────────────────────────────────────────
  {
    slug: "volnewmer",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Volnewmer — безголкова RF-терапія обличчя в GENEVITY",
          ru: "Volnewmer — безыгольная RF-терапия лица в GENEVITY",
          en: "Volnewmer — Needle-Free RF Facial Therapy at GENEVITY",
        },
        body: {
          uk: "Volnewmer — інноваційний апарат для безконтактної радіочастотної терапії обличчя, що доставляє RF-енергію в глибокі шари дерми та гіподерми без пошкодження поверхні шкіри. Технологія мікрохвильового діапазону дозволяє рівномірно прогріти тканини на глибині до 6 мм, запускаючи природні процеси синтезу колагену та скорочення колагенових волокон.\n\nПроцедура Volnewmer показана насамперед для корекції в'ялості шкіри та ліфтингу середньої третини обличчя. На відміну від поверхневих RF-процедур, Volnewmer впливає безпосередньо на дерму та СМАС-шар, дозволяючи домогтися стійкого ліфтингу без введення препаратів і без хірургічного втручання.\n\nЕфект від процедури Volnewmer стійкий: активне вироблення нового колагену та ремоделювання наявних волокон триває 3–6 місяців після завершення курсу. Оптимальний результат досягається після серії з 3–5 сеансів з інтервалом 2–4 тижні.\n\nВ GENEVITY процедуру Volnewmer виконують лікарі з медичною освітою, індивідуально підбираючи параметри потужності та глибину впливу відповідно до стану шкіри та завдань пацієнта.",
          ru: "Volnewmer — инновационный аппарат для бесконтактной радиочастотной терапии лица, который доставляет RF-энергию в глубокие слои дермы и гиподермы без повреждения поверхности кожи. Технология микроволнового диапазона позволяет равномерно прогреть ткани на глубине до 6 мм, запуская естественные процессы синтеза коллагена и сокращения коллагеновых волокон.\n\nПроцедура Volnewmer показана прежде всего для коррекции дряблости кожи и лифтинга средней трети лица. В отличие от поверхностных RF-процедур, Volnewmer воздействует непосредственно на дерму и СМАС-слой, позволяя добиться стойкого лифтинга без введения препаратов и без хирургического вмешательства.\n\nЭффект от процедуры Volnewmer стойкий: активная выработка нового коллагена и ремоделирование имеющихся волокон продолжается 3–6 месяцев после завершения курса. Оптимальный результат достигается после серии из 3–5 сеансов с интервалом 2–4 недели.\n\nВ GENEVITY процедуру Volnewmer выполняют врачи с медицинским образованием, индивидуально подбирая параметры мощности и глубину воздействия в соответствии с состоянием кожи и задачами пациента.",
          en: "Volnewmer is an innovative device for contactless radiofrequency facial therapy that delivers RF energy to the deep layers of the dermis and hypodermis without damaging the skin surface. Its microwave-range technology evenly heats tissue to a depth of up to 6 mm, triggering natural collagen synthesis and collagen fibre contraction.\n\nVolnewmer is primarily indicated for skin laxity correction and mid-face lifting. Unlike superficial RF procedures, Volnewmer acts directly on the dermis and SMAS layer, delivering lasting lifting results without injectables or surgery.\n\nVolnewmer results are long-lasting: active new collagen production and fibre remodelling continues for 3–6 months after the course. Optimal results are achieved after a series of 3–5 sessions, 2–4 weeks apart.\n\nAt GENEVITY, Volnewmer is performed by licensed doctors who individually calibrate the power parameters and treatment depth according to each patient's skin condition and goals.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до Volnewmer",
          ru: "Показания к Volnewmer",
          en: "Indications for Volnewmer",
        },
        indications: [
          { uk: "В'ялість шкіри обличчя та шиї, зниження пружності та еластичності", ru: "Дряблость кожи лица и шеи, снижение упругости и эластичности", en: "Skin laxity of the face and neck, reduced firmness and elasticity" },
          { uk: "Опущення м'яких тканин середньої та нижньої третини обличчя", ru: "Опущение мягких тканей средней и нижней трети лица", en: "Soft tissue ptosis of the mid and lower face" },
          { uk: "Нечіткий контур щелепи та подвійне підборіддя", ru: "Нечёткий контур челюсти и двойной подбородок", en: "Undefined jawline and double chin" },
          { uk: "Дрібні та середні зморшки", ru: "Мелкие и средние морщины", en: "Fine to moderate wrinkles" },
          { uk: "Профілактика вікових змін шкіри від 30 років", ru: "Профилактика возрастных изменений кожи от 30 лет", en: "Prevention of age-related skin changes from age 30" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Металеві імпланти, кардіостимулятори, кохлеарні імпланти", ru: "Металлические импланты, кардиостимуляторы, кохлеарные импланты", en: "Metal implants, pacemakers, cochlear implants" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Активні запальні захворювання шкіри, герпес у фазі загострення", ru: "Активные воспалительные заболевания кожи, герпес в фазе обострения", en: "Active inflammatory skin conditions, herpes in active phase" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
          { uk: "Порушення згортання крові", ru: "Нарушения свёртываемости крови", en: "Blood coagulation disorders" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Volnewmer — безголкова технологія RF-ліфтингу, яка впливає на глибину до 6 мм без пошкодження поверхні шкіри. Немає реабілітаційного періоду, немає уколів.",
          ru: "Volnewmer — безыгольная технология RF-лифтинга, воздействующая на глубину до 6 мм без повреждения поверхности кожи. Нет реабилитационного периода, нет уколов.",
          en: "Volnewmer is a needle-free RF lifting technology acting to a depth of up to 6 mm without damaging the skin surface. No downtime, no needles.",
        },
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить процедура Volnewmer",
          ru: "Как проходит процедура Volnewmer",
          en: "How the Volnewmer Procedure Works",
        },
        steps: [
          {
            title: { uk: "Діагностика та підбір параметрів", ru: "Диагностика и подбор параметров", en: "Assessment and parameter selection" },
            body: { uk: "Лікар оцінює тургор шкіри, глибину птозу, зони корекції та підбирає потужність та глибину впливу RF-енергії.", ru: "Врач оценивает тургор кожи, глубину птоза, зоны коррекции и подбирает мощность и глубину воздействия RF-энергии.", en: "The doctor assesses skin turgor, ptosis depth, correction zones and calibrates the RF energy power and depth." },
          },
          {
            title: { uk: "Очищення та підготовка шкіри", ru: "Очищение и подготовка кожи", en: "Skin cleansing and preparation" },
            body: { uk: "Обличчя очищається від косметики. Нанесення контактного гелю не потрібне — Volnewmer працює без прямого контакту з поверхнею шкіри.", ru: "Лицо очищается от косметики. Нанесение контактного геля не требуется — Volnewmer работает без прямого контакта с поверхностью кожи.", en: "The face is cleansed of cosmetics. No contact gel is required — Volnewmer works without direct contact with the skin surface." },
          },
          {
            title: { uk: "Процедура (30–45 хвилин)", ru: "Процедура (30–45 минут)", en: "Treatment (30–45 minutes)" },
            body: { uk: "Маніпула рухається по зонах корекції, рівномірно прогріваючи тканини. Пацієнт відчуває приємне тепло без болю.", ru: "Манипула движется по зонам коррекции, равномерно прогревая ткани. Пациент ощущает приятное тепло без боли.", en: "The handpiece moves across correction zones, evenly heating the tissue. The patient feels pleasant warmth without pain." },
          },
          {
            title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" },
            body: { uk: "Можливе незначне почервоніння, що зникає впродовж 1–2 годин. Рекомендується уникати прямого сонця та відвідування лазні 48 годин.", ru: "Возможно незначительное покраснение, проходящее в течение 1–2 часов. Рекомендуется избегать прямого солнца и посещения бани 48 часов.", en: "Mild redness may occur and usually fades within 1–2 hours. Avoid direct sun exposure and saunas for 48 hours." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги Volnewmer перед іншими RF-процедурами",
          ru: "Преимущества Volnewmer перед другими RF-процедурами",
          en: "Volnewmer Advantages Over Other RF Treatments",
        },
        items: [
          { uk: "Безконтактна доставка RF-енергії — без болю та без ризику опіків", ru: "Бесконтактная доставка RF-энергии — без боли и без риска ожогов", en: "Contactless RF energy delivery — no pain, no burn risk" },
          { uk: "Вплив на глибину до 6 мм — ефективно на рівні дерми та СМАС-шару", ru: "Воздействие на глубину до 6 мм — эффективно на уровне дермы и СМАС-слоя", en: "Acts to 6 mm depth — effective at dermis and SMAS level" },
          { uk: "Нульовий реабілітаційний період: можна відразу повертатися до роботи", ru: "Нулевой реабилитационный период: можно сразу возвращаться к работе", en: "Zero downtime: immediate return to work" },
          { uk: "Ефект посилюється 3–6 місяців після курсу завдяки неоколагенезу", ru: "Эффект усиливается 3–6 месяцев после курса благодаря неоколлагенезу", en: "Results continue improving for 3–6 months post-course due to neocollagenesis" },
          { uk: "Підходить для будь-якого типу та кольору шкіри", ru: "Подходит для любого типа и цвета кожи", en: "Suitable for all skin types and tones" },
          { uk: "⚠ Для вираженого птозу потрібна консультація — можлива комбінація з нитковим ліфтингом або ін'єкціями", ru: "⚠ При выраженном птозе необходима консультация — возможна комбинация с нитевым лифтингом или инъекциями", en: "⚠ Significant ptosis requires consultation — combination with thread lifting or injectables may be recommended" },
        ],
      },
      {
        type: "imageGallery",
        heading: {
          uk: "Наша клініка та процедурні кабінети",
          ru: "Наша клиника и процедурные кабинеты",
          en: "Our Clinic and Treatment Rooms",
        },
        images: interiorImages,
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на Volnewmer в GENEVITY", ru: "Запишитесь на Volnewmer в GENEVITY", en: "Book Volnewmer at GENEVITY" },
        body: { uk: "Дізнайтеся ціну на Volnewmer та оцініть зони корекції на безкоштовній консультації лікаря-косметолога.", ru: "Узнайте цену на Volnewmer и оцените зоны коррекции на бесплатной консультации врача-косметолога.", en: "Find out the Volnewmer price and assess your correction zones at a free cosmetic doctor consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи безпечна процедура Volnewmer?", ru: "Безопасна ли процедура Volnewmer?", en: "Is the Volnewmer procedure safe?" },
        answer: { uk: "Так, Volnewmer є безпечною апаратною процедурою. Завдяки безконтактній доставці RF-енергії виключається ризик опіків та механічного пошкодження шкіри. Процедура виконується виключно лікарями.", ru: "Да, Volnewmer является безопасной аппаратной процедурой. Благодаря бесконтактной доставке RF-энергии исключается риск ожогов и механического повреждения кожи. Процедура выполняется исключительно врачами.", en: "Yes, Volnewmer is a safe device-based procedure. Contactless RF energy delivery eliminates the risk of burns and mechanical skin damage. The procedure is performed exclusively by doctors." },
      },
      {
        question: { uk: "Скільки часу триває ефект після процедури Volnewmer?", ru: "Сколько времени длится эффект после процедуры Volnewmer?", en: "How long do Volnewmer results last?" },
        answer: { uk: "Ефект від курсу Volnewmer зберігається 12–18 місяців. Результат продовжує покращуватися протягом 3–6 місяців після завершення курсу завдяки активному синтезу нового колагену.", ru: "Эффект от курса Volnewmer сохраняется 12–18 месяцев. Результат продолжает улучшаться в течение 3–6 месяцев после завершения курса благодаря активному синтезу нового коллагена.", en: "Volnewmer course results last 12–18 months. Results continue improving for 3–6 months post-course due to active new collagen synthesis." },
      },
      {
        question: { uk: "Чи потрібна спеціальна підготовка перед процедурою Volnewmer?", ru: "Нужна ли специальная подготовка перед процедурой Volnewmer?", en: "Is special preparation required before Volnewmer?" },
        answer: { uk: "Спеціальної підготовки не потрібно. Достатньо прийти на процедуру без макіяжу та активних косметичних засобів. За 2 тижні до сеансу слід уникати надмірного засмаги та агресивних пілінгів.", ru: "Специальной подготовки не требуется. Достаточно прийти на процедуру без макияжа и активных косметических средств. За 2 недели до сеанса следует избегать чрезмерного загара и агрессивных пилингов.", en: "No special preparation is required. Come to the procedure without make-up or active skincare products. Avoid excessive tanning and aggressive peels 2 weeks before the session." },
      },
    ],
  },

  // ─── 17. Exion ───────────────────────────────────────────────────────────
  {
    slug: "exion",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Exion Face — монополярна RF + ультразвук для омолодження в GENEVITY",
          ru: "Exion Face — монополярный RF + ультразвук для омоложения в GENEVITY",
          en: "Exion Face — Monopolar RF + Ultrasound Rejuvenation at GENEVITY",
        },
        body: {
          uk: "Exion Face — апаратна процедура нового покоління від компанії BTL, яка поєднує монополярну радіочастотну (RF) енергію з ультразвуковою стимуляцією для глибокого омолодження шкіри обличчя. Унікальна технологія AI-керованого зворотного зв'язку дозволяє апарату в режимі реального часу контролювати температуру тканин та автоматично коригувати інтенсивність впливу.\n\nМонополярна RF-складова Exion проникає на глибину 4–6 мм, стимулюючи вироблення колагену, еластину та гіалуронової кислоти в дермі. Ультразвукова компонента забезпечує мікромасаж тканин, покращуючи мікроциркуляцію та лімфодренаж. Сукупний ефект — видиме зменшення зморшок, підвищення пружності та зволоженості шкіри.\n\nExion підходить для всіх типів шкіри, включаючи чутливу та зі схильністю до гіперпігментації. Процедура Exion Face виконується на шкірі обличчя, шиї та зони декольте. Курс складається з 4–6 сеансів з інтервалом 1–2 тижні, ефект зберігається 12–18 місяців.\n\nУ GENEVITY Exion Face використовується як самостійна процедура та у поєднанні з ін'єкційними методами (біоревіталізація, мезотерапія) для синергетичного результату.",
          ru: "Exion Face — аппаратная процедура нового поколения от компании BTL, которая сочетает монополярную радиочастотную (RF) энергию с ультразвуковой стимуляцией для глубокого омоложения кожи лица. Уникальная технология AI-управляемой обратной связи позволяет аппарату в режиме реального времени контролировать температуру тканей и автоматически корректировать интенсивность воздействия.\n\nМонополярная RF-составляющая Exion проникает на глубину 4–6 мм, стимулируя выработку коллагена, эластина и гиалуроновой кислоты в дерме. Ультразвуковая компонента обеспечивает микромассаж тканей, улучшая микроциркуляцию и лимфодренаж. Совокупный эффект — видимое уменьшение морщин, повышение упругости и увлажнённости кожи.\n\nExion подходит для всех типов кожи, включая чувствительную и склонную к гиперпигментации. Процедура Exion Face выполняется на коже лица, шеи и зоны декольте. Курс состоит из 4–6 сеансов с интервалом 1–2 недели, эффект сохраняется 12–18 месяцев.\n\nВ GENEVITY Exion Face используется как самостоятельная процедура и в сочетании с инъекционными методами (биоревитализация, мезотерапия) для синергетического результата.",
          en: "Exion Face is a next-generation device procedure from BTL that combines monopolar radiofrequency (RF) energy with ultrasound stimulation for deep facial rejuvenation. Its unique AI-driven feedback technology enables the device to monitor tissue temperature in real time and automatically adjust treatment intensity.\n\nThe monopolar RF component penetrates 4–6 mm deep, stimulating collagen, elastin and hyaluronic acid production in the dermis. The ultrasound component provides micro-massage of the tissue, improving microcirculation and lymphatic drainage. The combined effect is visible wrinkle reduction, improved firmness and increased skin hydration.\n\nExion is suitable for all skin types, including sensitive and hyperpigmentation-prone skin. The Exion Face procedure is performed on the face, neck and décolletage. A course consists of 4–6 sessions spaced 1–2 weeks apart; results last 12–18 months.\n\nAt GENEVITY, Exion Face is used both as a standalone procedure and in combination with injectable methods (biorevitalisation, mesotherapy) for a synergistic outcome.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до Exion Face",
          ru: "Показания к Exion Face",
          en: "Indications for Exion Face",
        },
        indications: [
          { uk: "Зморшки та тонка шкіра внаслідок вікових змін", ru: "Морщины и тонкая кожа вследствие возрастных изменений", en: "Wrinkles and thin skin due to age-related changes" },
          { uk: "Зниження пружності та еластичності шкіри обличчя та шиї", ru: "Снижение упругости и эластичности кожи лица и шеи", en: "Reduced firmness and elasticity of face and neck skin" },
          { uk: "Зневоднена та тьмяна шкіра", ru: "Обезвоженная и тусклая кожа", en: "Dehydrated and dull skin" },
          { uk: "Птоз м'яких тканин обличчя (початкова та помірна ступінь)", ru: "Птоз мягких тканей лица (начальная и умеренная степень)", en: "Soft tissue ptosis of the face (mild to moderate)" },
          { uk: "Розширені пори та нерівна текстура шкіри", ru: "Расширенные поры и неровная текстура кожи", en: "Enlarged pores and uneven skin texture" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Кардіостимулятори та електронні імпланти", ru: "Кардиостимуляторы и электронные импланты", en: "Pacemakers and electronic implants" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Гострі інфекційні захворювання шкіри у зоні обробки", ru: "Острые инфекционные заболевания кожи в зоне обработки", en: "Acute skin infections in the treatment area" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
          { uk: "Тромбоз, тяжкі судинні патології", ru: "Тромбоз, тяжёлые сосудистые патологии", en: "Thrombosis and severe vascular pathologies" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "Exion Face — одна з небагатьох апаратних процедур, яка стимулює вироблення власної гіалуронової кислоти в шкірі. Зволоження зсередини, а не ін'єкцією.",
          ru: "Exion Face — одна из немногих аппаратных процедур, которая стимулирует выработку собственной гиалуроновой кислоты в коже. Увлажнение изнутри, а не инъекцией.",
          en: "Exion Face is one of the few device-based procedures that stimulates the skin's own hyaluronic acid production. Hydration from within, not from a syringe.",
        },
      },
      {
        type: "steps",
        heading: {
          uk: "Етапи процедури Exion Face",
          ru: "Этапы процедуры Exion Face",
          en: "Exion Face Procedure Steps",
        },
        steps: [
          {
            title: { uk: "Консультація та визначення зон", ru: "Консультация и определение зон", en: "Consultation and zone mapping" },
            body: { uk: "Лікар оцінює стан шкіри, фотостаріння, глибину зморшок і складає план процедури.", ru: "Врач оценивает состояние кожи, фотостарение, глубину морщин и составляет план процедуры.", en: "The doctor assesses skin condition, photoaging, wrinkle depth and creates a treatment plan." },
          },
          {
            title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" },
            body: { uk: "Очищення шкіри, нанесення контактного середовища для ультразвукової компоненти.", ru: "Очищение кожи, нанесение контактной среды для ультразвуковой компоненты.", en: "Skin cleansing and application of contact medium for the ultrasound component." },
          },
          {
            title: { uk: "Процедура (30–45 хвилин)", ru: "Процедура (30–45 минут)", en: "Treatment (30–45 minutes)" },
            body: { uk: "Лікар обробляє зони відповідно до протоколу. AI-система автоматично контролює температуру та корегує інтенсивність RF.", ru: "Врач обрабатывает зоны согласно протоколу. AI-система автоматически контролирует температуру и корректирует интенсивность RF.", en: "The doctor treats each zone per protocol. The AI system automatically monitors temperature and adjusts RF intensity." },
          },
          {
            title: { uk: "Завершення та догляд", ru: "Завершение и уход", en: "Completion and aftercare" },
            body: { uk: "Нанесення заспокійливої маски. Шкіра злегка рожева — норма. Уникати сауни та прямого сонця 2 доби.", ru: "Нанесение успокаивающей маски. Кожа слегка розовая — норма. Избегать сауны и прямого солнца 2 суток.", en: "Application of a soothing mask. Slight skin redness is normal. Avoid sauna and direct sun for 48 hours." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та недоліки Exion Face",
          ru: "Преимущества и недостатки Exion Face",
          en: "Exion Face Pros and Cons",
        },
        items: [
          { uk: "Стимулює синтез колагену, еластину та власної гіалуронової кислоти одночасно", ru: "Стимулирует синтез коллагена, эластина и собственной гиалуроновой кислоты одновременно", en: "Simultaneously stimulates collagen, elastin and endogenous hyaluronic acid synthesis" },
          { uk: "AI-контроль температури в режимі реального часу — безпека та ефективність", ru: "AI-контроль температуры в реальном времени — безопасность и эффективность", en: "Real-time AI temperature control — safety and efficacy" },
          { uk: "Підходить для всіх типів шкіри, включаючи чутливу та засмаглу", ru: "Подходит для всех типов кожи, включая чувствительную и загорелую", en: "Suitable for all skin types including sensitive and tanned skin" },
          { uk: "Нульовий реабілітаційний період, можна поєднувати з ін'єкціями", ru: "Нулевой реабилитационный период, можно сочетать с инъекциями", en: "Zero downtime, can be combined with injectable treatments" },
          { uk: "Ефект накопичується: максимум на 3-й місяць після курсу", ru: "Эффект накапливается: максимум на 3-й месяц после курса", en: "Cumulative results: peak improvement at 3 months post-course" },
          { uk: "⚠ Не рекомендується при наявності металевих або електронних імплантів — обов'язково повідомте лікаря", ru: "⚠ Не рекомендуется при наличии металлических или электронных имплантов — обязательно сообщите врачу", en: "⚠ Not recommended with metal or electronic implants — inform your doctor" },
        ],
      },
      {
        type: "imageGallery",
        heading: {
          uk: "Обладнання та кабінети GENEVITY",
          ru: "Оборудование и кабинеты GENEVITY",
          en: "GENEVITY Equipment and Treatment Rooms",
        },
        images: [
          { url: "/images/equipment/EXION.webp", alt: "Апарат Exion у GENEVITY" },
          ...interiorImages,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на Exion Face в Дніпрі", ru: "Запишитесь на Exion Face в Днепре", en: "Book Exion Face in Dnipro" },
        body: { uk: "Дізнайтеся ціну Exion Face та підберіть індивідуальний курс омолодження на безкоштовній консультації.", ru: "Узнайте цену Exion Face и подберите индивидуальный курс омоложения на бесплатной консультации.", en: "Find out the Exion Face price and select your personalised rejuvenation course at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи підходить Exion Face для всіх типів шкіри?", ru: "Подходит ли Exion Face для всех типов кожи?", en: "Is Exion Face suitable for all skin types?" },
        answer: { uk: "Так. Exion Face підходить для всіх типів шкіри, включаючи чутливу, суху, жирну та схильну до гіперпігментації. AI-система в режимі реального часу контролює параметри, забезпечуючи безпеку.", ru: "Да. Exion Face подходит для всех типов кожи, включая чувствительную, сухую, жирную и склонную к гиперпигментации. AI-система в реальном времени контролирует параметры, обеспечивая безопасность.", en: "Yes. Exion Face is suitable for all skin types including sensitive, dry, oily and hyperpigmentation-prone. The real-time AI system monitors parameters to ensure safety." },
      },
      {
        question: { uk: "Скільки сеансів Exion Face потрібно для досягнення бажаного результату?", ru: "Сколько сеансов Exion Face нужно для достижения желаемого результата?", en: "How many Exion Face sessions are needed to achieve desired results?" },
        answer: { uk: "Оптимальний результат досягається після курсу з 4–6 сеансів з інтервалом 1–2 тижні. Ефект продовжує покращуватися ще 2–3 місяці після завершення курсу.", ru: "Оптимальный результат достигается после курса из 4–6 сеансов с интервалом 1–2 недели. Эффект продолжает улучшаться ещё 2–3 месяца после завершения курса.", en: "Optimal results are achieved after a course of 4–6 sessions spaced 1–2 weeks apart. Results continue improving for 2–3 months after the course." },
      },
      {
        question: { uk: "Чи можна поєднувати Exion Face з іншими косметичними процедурами?", ru: "Можно ли сочетать Exion Face с другими косметическими процедурами?", en: "Can Exion Face be combined with other cosmetic procedures?" },
        answer: { uk: "Так. Exion Face добре поєднується з біоревіталізацією, мезотерапією, плазмотерапією. Лікар визначить оптимальну комбінацію та необхідні інтервали між процедурами.", ru: "Да. Exion Face хорошо сочетается с биоревитализацией, мезотерапией, плазмотерапией. Врач определит оптимальную комбинацию и необходимые интервалы между процедурами.", en: "Yes. Exion Face combines well with biorevitalisation, mesotherapy, and PRP therapy. The doctor will determine the optimal combination and required intervals." },
      },
      {
        question: { uk: "Як довго зберігається ефект після процедури Exion Face?", ru: "Как долго сохраняется эффект после процедуры Exion Face?", en: "How long do Exion Face results last?" },
        answer: { uk: "Ефект від курсу Exion Face зберігається 12–18 місяців. Результати накопичуються та досягають піку приблизно через 3 місяці після завершення курсу.", ru: "Эффект от курса Exion Face сохраняется 12–18 месяцев. Результаты накапливаются и достигают пика примерно через 3 месяца после завершения курса.", en: "Exion Face course results last 12–18 months. Results accumulate and peak approximately 3 months after the course is complete." },
      },
    ],
  },

  // ─── 18. Ultraformer MPT (face) ──────────────────────────────────────────
  {
    slug: "ultraformer-mpt",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Ultraformer MPT — СМАС-ліфтинг ультразвуком в GENEVITY",
          ru: "Ultraformer MPT — СМАС-лифтинг ультразвуком в GENEVITY",
          en: "Ultraformer MPT — Ultrasound SMAS Lifting at GENEVITY",
        },
        body: {
          uk: "Ultraformer MPT — апаратна процедура ліфтингу на основі мікро- та макрофокусованого ультразвуку (HIFU), яка впливає безпосередньо на СМАС-шар — фіброзно-м'язовий апарат обличчя. Ця технологія відтворює ефект, аналогічний хірургічному СМАС-ліфтингу, але без розрізів, без наркозу та з мінімальним відновлювальним періодом.\n\nUltraformer MPT (Multi-Point Technology) відрізняється від попередніх поколінь HIFU-апаратів здатністю точно доставляти ультразвукову енергію на три рівні: поверхневий (1,5 мм), дермальний (3 мм) та на рівень СМАС (4,5 мм). Це дозволяє вирішувати завдання різної глибини в рамках одного сеансу.\n\nПід дією сфокусованого ультразвуку в тканинах утворюються точкові теплові ушкодження (теплові коагуляційні точки), які запускають природну регенеративну відповідь: активне відновлення колагену та скорочення наявних волокон. Ефект ліфтингу видний вже після першої процедури, але максимальний результат формується через 2–3 місяці.\n\nUltraformer MPT — золотий стандарт безопераційного ультраформер СМАС-ліфтингу для обличчя в Дніпрі та Україні. У GENEVITY процедуру виконують сертифіковані лікарі-косметологи, що гарантує точність впливу на потрібну глибину та мінімальний дискомфорт.",
          ru: "Ultraformer MPT — аппаратная процедура лифтинга на основе микро- и макрофокусированного ультразвука (HIFU), которая воздействует непосредственно на СМАС-слой — фиброзно-мышечный аппарат лица. Эта технология воспроизводит эффект, аналогичный хирургическому СМАС-лифтингу, но без разрезов, без наркоза и с минимальным восстановительным периодом.\n\nUltraformer MPT (Multi-Point Technology) отличается от предыдущих поколений HIFU-аппаратов способностью точно доставлять ультразвуковую энергию на три уровня: поверхностный (1,5 мм), дермальный (3 мм) и на уровень СМАС (4,5 мм). Это позволяет решать задачи разной глубины в рамках одного сеанса.\n\nПод воздействием сфокусированного ультразвука в тканях образуются точечные тепловые повреждения (тепловые коагуляционные точки), которые запускают естественную регенеративную реакцию: активное восстановление коллагена и сокращение имеющихся волокон. Эффект лифтинга заметен уже после первой процедуры, но максимальный результат формируется через 2–3 месяца.\n\nUltraformer MPT — золотой стандарт безоперационного ультраформер СМАС-лифтинга для лица в Днепре и Украине. В GENEVITY процедуру выполняют сертифицированные врачи-косметологи, что гарантирует точность воздействия на нужную глубину и минимальный дискомфорт.",
          en: "Ultraformer MPT is a device-based lifting procedure using micro- and macro-focused ultrasound (HIFU) that acts directly on the SMAS layer — the fibromuscular apparatus of the face. This technology reproduces an effect comparable to surgical SMAS lifting, but without incisions, anaesthesia, or significant downtime.\n\nUltraformer MPT (Multi-Point Technology) differs from previous HIFU devices in its ability to deliver ultrasound energy precisely to three tissue levels: superficial (1.5 mm), dermal (3 mm) and SMAS (4.5 mm) — allowing treatment at multiple depths in a single session.\n\nFocused ultrasound creates micro-coagulation points within the tissue, triggering a natural regenerative response: active collagen regeneration and contraction of existing fibres. A visible lifting effect is noticeable after the first session, with the full result forming over 2–3 months.\n\nUltraformer MPT is the gold standard for non-surgical SMAS lifting of the face in Dnipro and Ukraine. At GENEVITY the procedure is performed by certified cosmetic doctors, ensuring precise depth targeting and minimal discomfort.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до Ultraformer MPT",
          ru: "Показания к Ultraformer MPT",
          en: "Indications for Ultraformer MPT",
        },
        indications: [
          { uk: "Опущення м'яких тканин обличчя та шиї (птоз)", ru: "Опущение мягких тканей лица и шеи (птоз)", en: "Soft tissue ptosis of the face and neck" },
          { uk: "Нечіткий контур нижньої щелепи, брилі, нависання повік", ru: "Нечёткий контур нижней челюсти, брыли, нависание век", en: "Undefined jaw contour, jowls, drooping upper eyelids" },
          { uk: "Виражені носогубні складки та марйонеткові зморшки", ru: "Выраженные носогубные складки и марьонеточные морщины", en: "Pronounced nasolabial folds and marionette lines" },
          { uk: "В'яла шкіра шиї та підборіддя", ru: "Дряблая кожа шеи и подбородка", en: "Lax skin of the neck and chin" },
          { uk: "Ультраформер ціна процедури — підходить як для профілактики (від 35 років), так і для корекції вікових змін", ru: "Ультраформер цена процедуры — подходит как для профилактики (от 35 лет), так и для коррекции возрастных изменений", en: "Suitable for prevention (from age 35) as well as correction of age-related changes" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Золоті нитки та металеві імпланти в зоні обробки", ru: "Золотые нити и металлические импланты в зоне обработки", en: "Gold threads and metal implants in the treatment area" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Активні інфекційні або запальні захворювання шкіри", ru: "Активные инфекционные или воспалительные заболевания кожи", en: "Active skin infections or inflammatory conditions" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
          { uk: "Недавнє введення філерів у зоні обробки (менше 6 місяців)", ru: "Недавнее введение филлеров в зоне обработки (менее 6 месяцев)", en: "Recent filler injection in the treatment area (less than 6 months ago)" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: {
          uk: "Ultraformer MPT — єдиний безопераційний метод, який діє на рівні СМАС-шару так само, як хірургічний ліфтинг. Підтяжка без скальпеля, без наркозу, без лікарняного.",
          ru: "Ultraformer MPT — единственный безоперационный метод, который действует на уровне СМАС-слоя так же, как хирургический лифтинг. Подтяжка без скальпеля, без наркоза, без больничного.",
          en: "Ultraformer MPT is the only non-surgical method acting at the SMAS level just like surgical lifting. Tightening without a scalpel, without anaesthesia, without sick leave.",
        },
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить процедура Ultraformer MPT",
          ru: "Как проходит процедура Ultraformer MPT",
          en: "How the Ultraformer MPT Procedure Works",
        },
        steps: [
          {
            title: { uk: "Консультація та розмітка зон", ru: "Консультация и разметка зон", en: "Consultation and zone marking" },
            body: { uk: "Лікар визначає глибину птозу, вибирає картриджі (1,5 / 3,0 / 4,5 мм) та розмічає зони корекції.", ru: "Врач определяет глубину птоза, выбирает картриджи (1,5 / 3,0 / 4,5 мм) и размечает зоны коррекции.", en: "The doctor determines ptosis depth, selects cartridges (1.5 / 3.0 / 4.5 mm) and marks correction zones." },
          },
          {
            title: { uk: "Знеболення (за потреби)", ru: "Обезболивание (при необходимости)", en: "Anaesthesia (if needed)" },
            body: { uk: "Для чутливих пацієнтів наноситься місцевий анестезуючий крем за 30–40 хвилин до початку.", ru: "Для чувствительных пациентов наносится местный обезболивающий крем за 30–40 минут до начала.", en: "For sensitive patients, topical anaesthetic cream is applied 30–40 minutes before the procedure." },
          },
          {
            title: { uk: "Процедура (45–60 хвилин)", ru: "Процедура (45–60 минут)", en: "Treatment (45–60 minutes)" },
            body: { uk: "Апарат рухається по намічених лініях, лікар формує рядки коагуляційних точок на різних глибинах. Пацієнт відчуває поколювання та тепло.", ru: "Аппарат движется по намеченным линиям, врач формирует ряды коагуляционных точек на разных глубинах. Пациент ощущает покалывание и тепло.", en: "The device moves along marked lines as the doctor creates rows of coagulation points at different depths. The patient feels tingling and warmth." },
          },
          {
            title: { uk: "Рекомендації після процедури", ru: "Рекомендации после процедуры", en: "Post-procedure recommendations" },
            body: { uk: "Перші 2 тижні: уникати лазні, сауни та прямого ультрафіолету. Результат наростає 2–3 місяці.", ru: "Первые 2 недели: избегать бани, сауны и прямого ультрафиолета. Результат нарастает 2–3 месяца.", en: "First 2 weeks: avoid sauna, steam rooms and direct UV exposure. Results build over 2–3 months." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та особливості Ultraformer MPT",
          ru: "Преимущества и особенности Ultraformer MPT",
          en: "Ultraformer MPT Benefits and Key Points",
        },
        items: [
          { uk: "Єдиний безопераційний метод, що діє на СМАС-рівні (4,5 мм)", ru: "Единственный безоперационный метод, действующий на СМАС-уровне (4,5 мм)", en: "The only non-surgical method acting at SMAS level (4.5 mm depth)" },
          { uk: "Видимий ліфтинг вже після першого сеансу, максимум — через 2–3 місяці", ru: "Видимый лифтинг уже после первого сеанса, максимум — через 2–3 месяца", en: "Visible lifting after the first session, maximum result in 2–3 months" },
          { uk: "Ефект зберігається 12–18 місяців, не потрібна щоденна підтримка", ru: "Эффект сохраняется 12–18 месяцев, не нужна ежедневная поддержка", en: "Results last 12–18 months with no daily maintenance required" },
          { uk: "Три глибини в одному сеансі: 1,5 / 3,0 / 4,5 мм", ru: "Три глубины в одном сеансе: 1,5 / 3,0 / 4,5 мм", en: "Three depths in one session: 1.5 / 3.0 / 4.5 mm" },
          { uk: "Можна поєднувати з контурною пластикою для комплексного ефекту", ru: "Можно сочетать с контурной пластикой для комплексного эффекта", en: "Can be combined with contour correction for a comprehensive result" },
          { uk: "⚠ Болючість під час процедури — індивідуальна; за потреби застосовується анестезуючий крем", ru: "⚠ Болезненность во время процедуры — индивидуальна; при необходимости применяется анестезирующий крем", en: "⚠ Discomfort during the procedure is individual; topical anaesthetic is applied if needed" },
        ],
      },
      {
        type: "imageGallery",
        heading: {
          uk: "Клініка GENEVITY та процедурні кабінети",
          ru: "Клиника GENEVITY и процедурные кабинеты",
          en: "GENEVITY Clinic and Treatment Rooms",
        },
        images: [
          { url: "/images/equipment/Ultrafomer.webp", alt: "Апарат Ultraformer MPT у GENEVITY" },
          ...interiorImages,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на ультраформер СМАС-ліфтинг в Дніпрі", ru: "Запишитесь на ультраформер СМАС-лифтинг в Днепре", en: "Book Ultraformer SMAS Lifting in Dnipro" },
        body: { uk: "Дізнайтеся ціну ультраформера та оцініть результат для вашої зони корекції на безкоштовній консультації лікаря.", ru: "Узнайте цену ультраформера и оцените результат для вашей зоны коррекции на бесплатной консультации врача.", en: "Find out the Ultraformer MPT price and assess the expected result for your correction zone at a free consultation." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Чи болісна процедура Ultraformer MPT?", ru: "Болезненна ли процедура Ultraformer MPT?", en: "Is the Ultraformer MPT procedure painful?" },
        answer: { uk: "Больові відчуття індивідуальні. Більшість пацієнтів описують їх як помірне поколювання та тепло. За потреби перед процедурою наноситься анестезуючий крем, що значно знижує дискомфорт.", ru: "Болевые ощущения индивидуальны. Большинство пациентов описывают их как умеренное покалывание и тепло. При необходимости перед процедурой наносится анестезирующий крем, что значительно снижает дискомфорт.", en: "Pain perception is individual. Most patients describe it as moderate tingling and warmth. Topical anaesthetic cream is applied beforehand if needed, significantly reducing discomfort." },
      },
      {
        question: { uk: "Скільки триває ефект після процедури Ultraformer MPT?", ru: "Сколько длится эффект после процедуры Ultraformer MPT?", en: "How long do Ultraformer MPT results last?" },
        answer: { uk: "Ефект зберігається 12–18 місяців. Результат продовжує наростати 2–3 місяці після процедури. Підтримуючі сеанси рекомендуються 1 раз на рік.", ru: "Эффект сохраняется 12–18 месяцев. Результат продолжает нарастать 2–3 месяца после процедуры. Поддерживающие сеансы рекомендуются 1 раз в год.", en: "Results last 12–18 months, continuing to build for 2–3 months post-procedure. Maintenance sessions are recommended once a year." },
      },
      {
        question: { uk: "Чи можна поєднувати Ultraformer MPT з іншими косметологічними процедурами?", ru: "Можно ли сочетать Ultraformer MPT с другими косметологическими процедурами?", en: "Can Ultraformer MPT be combined with other cosmetic procedures?" },
        answer: { uk: "Так. Ultraformer MPT добре поєднується з контурною пластикою філерами та ботулінотерапією. Поєднання дозволяє досягти комплексного ефекту омолодження. Лікар підбере оптимальну послідовність.", ru: "Да. Ultraformer MPT хорошо сочетается с контурной пластикой филлерами и ботулинотерапией. Сочетание позволяет достичь комплексного эффекта омоложения. Врач подберёт оптимальную последовательность.", en: "Yes. Ultraformer MPT combines well with filler correction and botulinum therapy. The combination delivers a comprehensive rejuvenation effect. The doctor will advise the optimal sequence." },
      },
    ],
  },

  // ─── 20. EMSCULPT NEO ────────────────────────────────────────────────────
  {
    slug: "emsculpt-neo",
    sections: [
      {
        type: "richText",
        heading: {
          uk: "EMSCULPT NEO — спалювання жиру та ріст м'язів в GENEVITY",
          ru: "EMSCULPT NEO — сжигание жира и рост мышц в GENEVITY",
          en: "EMSCULPT NEO — Fat Burning and Muscle Building at GENEVITY",
        },
        body: {
          uk: "EMSCULPT NEO — єдиний апарат у світі, який одночасно спалює жир та нарощує м'язову масу за допомогою технологій HIFEM® та RF. За один 30-хвилинний сеанс апарат викликає понад 20 000 надінтенсивних скорочень м'язів — ефект, недосяжний жодним тренуванням.\n\nРадіочастотна складова EMSCULPT NEO розігріває та руйнує жирові клітини (апоптоз адипоцитів) перед кожним HIFEM®-пульсом, що забезпечує синергетичний ефект. Клінічні дослідження виробника: −30% жирових відкладень, +25% м'язового об'єму в зоні обробки після стандартного курсу з 4 сеансів.\n\nEMSCULPT NEO підходить для корекції тіла як у чоловіків, так і у жінок. Апарат обробляє живіт (включаючи м'яз-розгинач хребта), сідниці, стегна, руки та литки. Процедура є ефективнішою за ліполітичні ін'єкції при локальних відкладеннях та поступається тільки хірургічній ліпосакції за об'ємом видаленого жиру.\n\nВажлива перевага — EMSCULPT NEO не лише позбавляє від жиру, а й формує рельєф завдяки збільшенню м'язового об'єму. Це робить процедуру незамінною для пацієнтів, які хочуть не просто схуднути, а змінити форму тіла. У GENEVITY процедура виконується сертифікованими спеціалістами з використанням оригінального обладнання BTL.",
          ru: "EMSCULPT NEO — единственный аппарат в мире, который одновременно сжигает жир и наращивает мышечную массу с помощью технологий HIFEM® и RF. За один 30-минутный сеанс аппарат вызывает более 20 000 сверхинтенсивных сокращений мышц — эффект, недостижимый никакой тренировкой.\n\nРадиочастотная составляющая EMSCULPT NEO разогревает и разрушает жировые клетки (апоптоз адипоцитов) перед каждым HIFEM®-импульсом, что обеспечивает синергетический эффект. Клинические исследования производителя: −30% жировых отложений, +25% мышечного объёма в зоне обработки после стандартного курса из 4 сеансов.\n\nEMSCULPT NEO подходит для коррекции тела как у мужчин, так и у женщин. Аппарат обрабатывает живот (включая разгибатель спины), ягодицы, бёдра, руки и икры. Процедура эффективнее липолитических инъекций при локальных отложениях и уступает только хирургической липосакции по объёму удалённого жира.\n\nВажное преимущество — EMSCULPT NEO не только избавляет от жира, но и формирует рельеф благодаря увеличению мышечного объёма. Это делает процедуру незаменимой для пациентов, которые хотят не просто похудеть, а изменить форму тела. В GENEVITY процедура выполняется сертифицированными специалистами с использованием оригинального оборудования BTL.",
          en: "EMSCULPT NEO is the world's only device that simultaneously burns fat and builds muscle using HIFEM® and RF technologies. In a single 30-minute session, the device induces over 20,000 supramaximal muscle contractions — an effect unachievable by any workout.\n\nThe EMSCULPT NEO RF component heats and destroys fat cells (adipocyte apoptosis) before each HIFEM® pulse, creating a synergistic effect. Manufacturer clinical studies: −30% fat reduction, +25% muscle volume in the treatment zone after a standard 4-session course.\n\nEMSCULPT NEO is suitable for body contouring in both men and women. The device treats the abdomen (including the erector spinae), buttocks, thighs, arms and calves. It is more effective than lipolytic injections for localised fat deposits and is second only to surgical liposuction in total fat volume removed.\n\nA key advantage — EMSCULPT NEO not only eliminates fat but also sculpts contour through increased muscle volume. This makes it indispensable for patients who want to reshape their body, not just lose weight. At GENEVITY the procedure is performed by certified BTL specialists using original equipment.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до EMSCULPT NEO",
          ru: "Показания к EMSCULPT NEO",
          en: "Indications for EMSCULPT NEO",
        },
        indications: [
          { uk: "Локальні жирові відкладення на животі, стегнах, сідницях та руках", ru: "Локальные жировые отложения на животе, бёдрах, ягодицах и руках", en: "Localised fat deposits on the abdomen, thighs, buttocks and arms" },
          { uk: "Бажання збільшити м'язовий об'єм та сформувати рельєф", ru: "Желание увеличить мышечный объём и сформировать рельеф", en: "Goal to increase muscle volume and define body contour" },
          { uk: "Диастаз прямих м'язів живота (розходження)", ru: "Диастаз прямых мышц живота (расхождение)", en: "Rectus abdominis diastasis (muscle separation)" },
          { uk: "Збільшення та підтяжка сідниць без імплантів", ru: "Увеличение и подтяжка ягодиц без имплантов", en: "Buttock lifting and enhancement without implants" },
          { uk: "Відновлення м'язового тонусу після пологів або тривалого сидячого способу життя", ru: "Восстановление мышечного тонуса после родов или длительного сидячего образа жизни", en: "Muscle tone restoration after childbirth or prolonged sedentary lifestyle" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "Металеві імпланти, кардіостимулятори, нейростимулятори в зоні обробки", ru: "Металлические импланты, кардиостимуляторы, нейростимуляторы в зоне обработки", en: "Metal implants, pacemakers, neurostimulators in the treatment area" },
          { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
          { uk: "Грижа в зоні обробки (особливо пупкова)", ru: "Грыжа в зоне обработки (особенно пупочная)", en: "Hernia in the treatment area (especially umbilical)" },
          { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
          { uk: "Менструація (для ділянки живота)", ru: "Менструация (для области живота)", en: "Menstruation (for abdominal treatment)" },
        ],
      },
      {
        type: "callout",
        tone: "success",
        body: {
          uk: "EMSCULPT NEO за один сеанс замінює близько 20 000 присідань або скручувань. Без болю, без поту, без відновлювального періоду — результат, як після 6 місяців тренувань.",
          ru: "EMSCULPT NEO за один сеанс заменяет около 20 000 приседаний или скручиваний. Без боли, без пота, без восстановительного периода — результат, как после 6 месяцев тренировок.",
          en: "EMSCULPT NEO replaces approximately 20,000 squats or crunches in a single session. No pain, no sweat, no recovery time — results equivalent to 6 months of training.",
        },
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить процедура EMSCULPT NEO",
          ru: "Как проходит процедура EMSCULPT NEO",
          en: "How the EMSCULPT NEO Procedure Works",
        },
        steps: [
          {
            title: { uk: "Консультація та вибір зон", ru: "Консультация и выбор зон", en: "Consultation and zone selection" },
            body: { uk: "Лікар оцінює зони корекції, стан м'язів та жирової тканини, виключає протипоказання. Складається індивідуальний план курсу.", ru: "Врач оценивает зоны коррекции, состояние мышц и жировой ткани, исключает противопоказания. Составляется индивидуальный план курса.", en: "The doctor assesses correction zones, muscle and fat tissue condition, and rules out contraindications. An individual course plan is created." },
          },
          {
            title: { uk: "Фіксація аплікаторів", ru: "Фиксация аппликаторов", en: "Applicator placement" },
            body: { uk: "Аплікатори EMSCULPT NEO фіксуються на зоні за допомогою ременів. Не потрібно роздягатись до кінця — процедура проводиться через одяг (без металевих елементів).", ru: "Аппликаторы EMSCULPT NEO фиксируются на зоне с помощью ремней. Не нужно полностью раздеваться — процедура проводится через одежду (без металлических элементов).", en: "EMSCULPT NEO applicators are strapped to the treatment zone. Full undressing is not required — the procedure is performed through clothing (without metal elements)." },
          },
          {
            title: { uk: "Процедура (30 хвилин)", ru: "Процедура (30 минут)", en: "Treatment (30 minutes)" },
            body: { uk: "Апарат почергово подає RF-прогрів та HIFEM®-імпульси. Пацієнт відчуває тепло та скорочення м'язів. Болю немає, деякі описують відчуття як інтенсивне тренування.", ru: "Аппарат поочерёдно подаёт RF-прогрев и HIFEM®-импульсы. Пациент ощущает тепло и сокращения мышц. Боли нет, некоторые описывают ощущение как интенсивную тренировку.", en: "The device alternates RF heating and HIFEM® pulses. The patient feels warmth and muscle contractions. There is no pain; some describe the sensation as an intense workout." },
          },
          {
            title: { uk: "Після процедури", ru: "После процедуры", en: "After the procedure" },
            body: { uk: "Реабілітація не потрібна. Можлива м'язова крепатура 1–2 доби. Курс — 4 сеанси з інтервалом 5–10 днів.", ru: "Реабилитация не нужна. Возможна мышечная крепатура 1–2 суток. Курс — 4 сеанса с интервалом 5–10 дней.", en: "No recovery needed. Mild muscle soreness for 1–2 days is possible. Course: 4 sessions, 5–10 days apart." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та особливості EMSCULPT NEO",
          ru: "Преимущества и особенности EMSCULPT NEO",
          en: "EMSCULPT NEO Benefits and Key Points",
        },
        items: [
          { uk: "Єдиний апарат, що одночасно спалює жир (-30%) та нарощує м'язи (+25%) за один курс", ru: "Единственный аппарат, одновременно сжигающий жир (−30%) и наращивающий мышцы (+25%) за один курс", en: "The only device that simultaneously burns fat (−30%) and builds muscle (+25%) in one course" },
          { uk: "Підходить для чоловіків та жінок будь-якого рівня фізичної підготовки", ru: "Подходит для мужчин и жин любого уровня физической подготовки", en: "Suitable for men and women at any fitness level" },
          { uk: "Лікує діастаз: зміцнює та зближує прямі м'язи живота", ru: "Лечит диастаз: укрепляет и сближает прямые мышцы живота", en: "Treats diastasis: strengthens and approximates the rectus abdominis muscles" },
          { uk: "Жодної реабілітації: відразу на роботу після сеансу", ru: "Никакой реабилитации: сразу на работу после сеанса", en: "Zero downtime: back to work immediately after each session" },
          { uk: "Ефект зберігається 6–12 місяців, підсилюється регулярними тренуваннями", ru: "Эффект сохраняется 6–12 месяцев, усиливается регулярными тренировками", en: "Results last 6–12 months and are enhanced by regular exercise" },
          { uk: "⚠ Не є заміною дієти та тренувань — підсилює їх ефект. ІМТ вище 35 — проконсультуйтесь лікарем", ru: "⚠ Не является заменой диеты и тренировок — усиливает их эффект. ИМТ выше 35 — проконсультируйтесь с врачом", en: "⚠ Not a substitute for diet and exercise — amplifies their effect. BMI above 35 — consult the doctor first" },
        ],
      },
      {
        type: "imageGallery",
        heading: {
          uk: "Апарат EMSCULPT NEO та кабінети GENEVITY",
          ru: "Аппарат EMSCULPT NEO и кабинеты GENEVITY",
          en: "EMSCULPT NEO Device and GENEVITY Rooms",
        },
        images: [
          { url: "/images/equipment/emsculpt.webp", alt: "Апарат EMSCULPT NEO у GENEVITY" },
          ...interiorImages,
        ],
      },
      {
        type: "cta",
        heading: { uk: "Запишіться на EMSCULPT NEO в Дніпрі", ru: "Запишитесь на EMSCULPT NEO в Днепре", en: "Book EMSCULPT NEO in Dnipro" },
        body: { uk: "Дізнайтеся ціну EMSCULPT NEO та оцініть зони корекції на безкоштовній консультації. Перший сеанс — з візуальним аналізом складу тіла.", ru: "Узнайте цену EMSCULPT NEO и оцените зоны коррекции на бесплатной консультации. Первый сеанс — с визуальным анализом состава тела.", en: "Find out the EMSCULPT NEO price and assess your correction zones at a free consultation. First session includes a visual body composition analysis." },
        ctaLabel: { uk: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a Consultation" },
        ctaHref: "/kontakty",
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки триває одна процедура EMSCULPT NEO?", ru: "Сколько длится одна процедура EMSCULPT NEO?", en: "How long does one EMSCULPT NEO session last?" },
        answer: { uk: "Один сеанс EMSCULPT NEO триває 30 хвилин. За цей час апарат виконує понад 20 000 м'язових скорочень, а RF-компонент нагріває та руйнує жирові клітини.", ru: "Один сеанс EMSCULPT NEO длится 30 минут. За это время аппарат выполняет более 20 000 мышечных сокращений, а RF-компонент нагревает и разрушает жировые клетки.", en: "One EMSCULPT NEO session lasts 30 minutes. During this time the device induces over 20,000 muscle contractions while the RF component heats and destroys fat cells." },
      },
      {
        question: { uk: "Чи потрібна реабілітація після процедури?", ru: "Нужна ли реабилитация после процедуры?", en: "Is recovery needed after the procedure?" },
        answer: { uk: "Реабілітації не потрібно. Після процедури ви можете відразу повертатися до звичайного ритму. Протягом 1–2 діб може відчуватись м'язова крепатура — як після інтенсивного тренування.", ru: "Реабилитации не нужно. После процедуры вы можете сразу возвращаться к обычному ритму. В течение 1–2 суток может ощущаться мышечная крепатура — как после интенсивной тренировки.", en: "No recovery is needed. You can return to your normal routine immediately. Mild muscle soreness for 1–2 days is possible — similar to after an intense workout." },
      },
      {
        question: { uk: "Скільки процедур необхідно для досягнення бажаного результату?", ru: "Сколько процедур необходимо для достижения желаемого результата?", en: "How many sessions are needed to achieve the desired result?" },
        answer: { uk: "Стандартний курс — 4 сеанси з інтервалом 5–10 днів. Максимальний ефект (−30% жиру, +25% м'язового об'єму) досягається через 3 місяці після завершення курсу.", ru: "Стандартный курс — 4 сеанса с интервалом 5–10 дней. Максимальный эффект (−30% жира, +25% мышечного объёма) достигается через 3 месяца после завершения курса.", en: "Standard course: 4 sessions, 5–10 days apart. Maximum effect (−30% fat, +25% muscle volume) is reached 3 months after the course." },
      },
      {
        question: { uk: "Чи підходить EMSCULPT NEO для чоловіків?", ru: "Подходит ли EMSCULPT NEO для мужчин?", en: "Is EMSCULPT NEO suitable for men?" },
        answer: { uk: "Так. EMSCULPT NEO ефективно використовується чоловіками для опрацювання преса, збільшення об'єму біцепса та трицепса, а також для зміцнення м'язів спини. Протипоказань за статтю немає.", ru: "Да. EMSCULPT NEO эффективно используется мужчинами для проработки пресса, увеличения объёма бицепса и трицепса, а также для укрепления мышц спины. Противопоказаний по полу нет.", en: "Yes. EMSCULPT NEO is effectively used by men to define abs, increase bicep and tricep volume, and strengthen back muscles. There are no gender-based contraindications." },
      },
      {
        question: { uk: "Чи можна поєднувати EMSCULPT NEO з іншими косметичними процедурами?", ru: "Можно ли сочетать EMSCULPT NEO с другими косметическими процедурами?", en: "Can EMSCULPT NEO be combined with other cosmetic procedures?" },
        answer: { uk: "Так. EMSCULPT NEO добре поєднується з процедурою Exion Body (RF-ліфтинг шкіри) та Ultraformer MPT для тіла. Таке поєднання дозволяє одночасно зменшити жир, збільшити м'язи та підтягнути шкіру.", ru: "Да. EMSCULPT NEO хорошо сочетается с процедурой Exion Body (RF-лифтинг кожи) и Ultraformer MPT для тела. Такое сочетание позволяет одновременно уменьшить жир, увеличить мышцы и подтянуть кожу.", en: "Yes. EMSCULPT NEO combines well with Exion Body (RF skin lifting) and Ultraformer MPT for the body. This combination simultaneously reduces fat, builds muscle and tightens skin." },
      },
    ],
  },
];

async function seedService(s: ServiceSeed) {
  const [row] = await sql`SELECT id FROM services WHERE slug = ${s.slug}`;
  if (!row) { console.log(`⚠ NOT FOUND: ${s.slug}`); return; }
  const serviceId: string = row.id;

  // Delete existing sections and faqs
  await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${serviceId}`;
  await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${serviceId}`;

  const sectionIds: string[] = [];
  for (let i = 0; i < s.sections.length; i++) {
    const sec = s.sections[i];
    const id = randomUUID();
    sectionIds.push(id);
    await sql`INSERT INTO content_sections(id,owner_type,owner_id,sort_order,section_type,data)
      VALUES(${id},'service',${serviceId},${i},${sec.type}::section_type,${JSON.stringify(sectionData(sec))}::jsonb)`;
  }

  for (let i = 0; i < s.faqs.length; i++) {
    const f = s.faqs[i];
    await sql`INSERT INTO faq_items(id,owner_type,owner_id,sort_order,question_uk,question_ru,question_en,answer_uk,answer_ru,answer_en)
      VALUES(${randomUUID()},'service',${serviceId},${i},${f.question.uk},${f.question.ru},${f.question.en},${f.answer.uk},${f.answer.ru},${f.answer.en})`;
  }

  const blockOrder = [...sectionIds, "faq", "doctors", "equipment", "relatedServices", "finalCTA"];
  await sql`UPDATE services SET block_order = ${blockOrder} WHERE id = ${serviceId}`;

  const types = s.sections.map(sec => sec.type);
  console.log(`✓ ${s.slug} — [${types.join(", ")}], ${s.faqs.length} FAQs`);
}

async function main() {
  for (const s of services) await seedService(s);
  await sql.end();
  console.log("\nTZ-v3 apparatus-A DONE.");
}
main().catch(e => { console.error(e); process.exit(1); });
