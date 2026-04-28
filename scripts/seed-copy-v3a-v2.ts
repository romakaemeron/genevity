/**
 * V3a v2 — EMFACE, VOLNEWMER, EXION, Ultraformer MPT
 * Re-seeds with varied section types: richText + indicationsContraindications + steps + bullets
 * Run: npx tsx scripts/seed-copy-v3a-v2.ts
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

type L = { uk: string; ru: string; en: string };

interface RichTextSection {
  type: "richText";
  heading: L;
  body: L;
  calloutBody?: L;
  heroImage?: string | null;
}

interface IndicationsSection {
  type: "indicationsContraindications";
  indicationsHeading: L;
  indications: L[];
  contraindicationsHeading: L;
  contraindications: L[];
}

interface StepsSection {
  type: "steps";
  heading: L;
  steps: { title: L; description: L }[];
}

interface BulletsSection {
  type: "bullets";
  heading: L;
  items: L[];        // items starting with "⚠" render as warnings
}

type AnySection = RichTextSection | IndicationsSection | StepsSection | BulletsSection;

interface FaqCopy { question: L; answer: L; }
interface ServiceCopy {
  slug: string;
  summary: L;
  sections: AnySection[];
  faq: FaqCopy[];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function sectionData(s: AnySection): object {
  if (s.type === "richText") {
    return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: s.heroImage ?? null };
  }
  if (s.type === "indicationsContraindications") {
    return {
      indicationsHeading: s.indicationsHeading,
      indications: s.indications,
      contraindicationsHeading: s.contraindicationsHeading,
      contraindications: s.contraindications,
    };
  }
  if (s.type === "steps") {
    return { heading: s.heading, steps: s.steps };
  }
  if (s.type === "bullets") {
    return { heading: s.heading, items: s.items };
  }
  return {};
}

const SERVICES: ServiceCopy[] = [
  // ─── EMFACE ────────────────────────────────────────────────────────────────
  {
    slug: "emface",
    summary: {
      uk: "EMFACE у GENEVITY — єдина безін'єкційна процедура, яка одночасно зміцнює м'язовий каркас обличчя і підвищує щільність шкіри. Синхронізована дія RF-енергії та HIFES-імпульсів — без голок, без відновлення, з документально підтвердженим скороченням зморшок на 37% після курсу.",
      ru: "EMFACE в GENEVITY — единственная безинъекционная процедура, одновременно укрепляющая мышечный каркас лица и повышающая плотность кожи. Синхронизированное действие RF и HIFES — без игл, без реабилитации, задокументированное сокращение морщин на 37%.",
      en: "EMFACE at GENEVITY — the only needle-free procedure that simultaneously strengthens the facial muscle framework and increases skin density. Synchronised RF and HIFES — no needles, no downtime, documented 37% wrinkle reduction after a course.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Як EMFACE зміцнює обличчя без голок", ru: "Как EMFACE укрепляет лицо без игл", en: "How EMFACE strengthens the face without needles" },
        body: {
          uk: "EMFACE — апарат BTL Aesthetics із двома синхронізованими технологіями в одному аплікаторі. RF-енергія нагріває дерму до 40–43°C, запускаючи неоколагенез і неоеластиногенез. Водночас HIFES-імпульси (High-Intensity Facial Electromagnetic Stimulation) примушують мімічні м'язи виконати близько 20 000 супрамаксимальних скорочень за 20 хвилин — недосяжних при довільних тренуваннях. М'язи-ліфтери зміцнюються, відновлюючи вертикальний вектор тканин обличчя, що природно знижується з роками.\n\nКлінічно підтверджені результати (peer-reviewed дослідження BTL): скорочення зморшок на 37%, підвищення тонусу м'язів на 23%, підйом брів на 4,7 мм. Стандартний курс — 4 сесії з інтервалом 5–7 днів.",
          ru: "EMFACE — аппарат BTL Aesthetics с двумя синхронизированными технологиями в одном аппликаторе. RF-энергия нагревает дерму до 40–43°C, запуская неоколлагенез и неоэластиногенез. Одновременно HIFES-импульсы заставляют мимические мышцы выполнить около 20 000 супрамаксимальных сокращений за 20 минут. Мышцы-лифтеры укрепляются, восстанавливая вертикальный вектор тканей лица.\n\nКлинически подтверждённые результаты: сокращение морщин на 37%, повышение тонуса мышц на 23%, подъём бровей на 4,7 мм. Стандартный курс — 4 сессии с интервалом 5–7 дней.",
          en: "EMFACE is a BTL Aesthetics device with two synchronised technologies in one applicator. RF energy heats the dermis to 40–43°C, triggering neocollagenesis and neoelastinogenesis. Simultaneously, HIFES impulses force the expression muscles through approximately 20,000 supramaximal contractions in 20 minutes — unachievable with voluntary exercise. The lifting muscles strengthen, restoring the vertical tissue vector that naturally declines with age.\n\nClinically confirmed results (BTL peer-reviewed studies): 37% wrinkle reduction, 23% muscle tone improvement, 4.7 mm brow elevation. Standard course: 4 sessions at 5–7 day intervals.",
        },
        calloutBody: {
          uk: "EMFACE не є альтернативою ботоксу чи філерам — це інший вектор. Ботокс розслаблює гіперактивний м'яз. EMFACE зміцнює весь каркас. Найкращий результат — в комбінації.",
          ru: "EMFACE не является альтернативой ботоксу или филлерам — это другой вектор. Ботокс расслабляет гиперактивную мышцу. EMFACE укрепляет весь каркас. Лучший результат — в комбинации.",
          en: "EMFACE is not an alternative to botox or fillers — it works on a different vector. Botox relaxes a hyperactive muscle. EMFACE strengthens the entire framework. Best results come in combination.",
        },
        heroImage: null,
      } as RichTextSection,
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Кому підходить EMFACE", ru: "Кому подходит EMFACE", en: "Who EMFACE is for" },
        indications: [
          { uk: "Опущення брів і повік (птоз) — легкий або початковий ступінь", ru: "Опущение бровей и век (птоз) — лёгкая или начальная степень", en: "Brow and eyelid ptosis — mild or early stage" },
          { uk: "Втрата чіткості овалу обличчя, «брилі» і кути рота опускаються", ru: "Потеря чёткости овала лица, брыли, опущение углов рта", en: "Loss of jaw-oval definition, jowls, descended mouth corners" },
          { uk: "Горизонтальні зморшки на чолі від гіперактивного лобового м'яза", ru: "Горизонтальные морщины на лбу от гиперактивной лобной мышцы", en: "Horizontal forehead lines from overworking frontalis muscle" },
          { uk: "«Стомлений» вигляд обличчя — виглядає сумнішим, ніж відчуваєте", ru: "«Усталый» вид лица — выглядит грустнее, чем вы себя чувствуете", en: "Tired facial appearance — looks sadder than you feel" },
          { uk: "Профілактика вікових змін 30–40 років — м'язовий тонус починає знижуватися", ru: "Профилактика возрастных изменений 30–40 лет", en: "Prevention of ageing changes at 30–40 — muscle tone beginning to decline" },
          { uk: "Альтернатива для тих, хто уникає голок принципово або за медичними показаннями", ru: "Альтернатива для тех, кто избегает игл принципиально или по медицинским показаниям", en: "Alternative for those who avoid needles on principle or for medical reasons" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і грудне вигодовування", ru: "Беременность и грудное вскармливание", en: "Pregnancy and breastfeeding" },
          { uk: "Кардіостимулятор або будь-який металевий імплант у зоні лікування", ru: "Кардиостимулятор или металлический имплант в зоне лечения", en: "Pacemaker or any metal implant in the treatment zone" },
          { uk: "Епілепсія", ru: "Эпилепсия", en: "Epilepsy" },
          { uk: "Активні запальні процеси на шкірі обличчя", ru: "Активные воспалительные процессы на коже лица", en: "Active inflammatory skin conditions on the face" },
          { uk: "Важкий птоз, що потребує хірургічного лікування", ru: "Тяжёлый птоз, требующий хирургического лечения", en: "Severe ptosis requiring surgical correction" },
        ],
      } as IndicationsSection,
      {
        type: "steps",
        heading: { uk: "Як проходить курс EMFACE", ru: "Как проходит курс EMFACE", en: "What an EMFACE course looks like" },
        steps: [
          {
            title: { uk: "Консультація і фотопротокол", ru: "Консультация и фотопротокол", en: "Consultation and photo protocol" },
            description: { uk: "Оцінка тонусу м'язів, виразності птозу, вихідного стану шкіри. Фото до процедури — щоб побачити реальний прогрес.", ru: "Оценка тонуса мышц, выраженности птоза, исходного состояния кожи. Фото до процедуры.", en: "Assessment of muscle tone, ptosis degree, baseline skin condition. Photos taken before the first session." },
          },
          {
            title: { uk: "Накладання аплікаторів", ru: "Наложение аппликаторов", en: "Applicator placement" },
            description: { uk: "4 самоклейних аплікатори на лоб і щоки. Жодного гелю, жодної голки. Пацієнт лежить горизонтально.", ru: "4 самоклеящихся аппликатора на лоб и щёки. Ни геля, ни иглы. Пациент лежит горизонтально.", en: "4 adhesive applicators on forehead and cheeks. No gel, no needle. Patient lies horizontally." },
          },
          {
            title: { uk: "20 хвилин синхронізованої дії", ru: "20 минут синхронизированного воздействия", en: "20 minutes of synchronised treatment" },
            description: { uk: "RF нагріває дерму, HIFES скорочує м'язи. Відчуття — тепло і ритмічне тремтіння. Більшість клієнтів дрімають.", ru: "RF нагревает дерму, HIFES сокращает мышцы. Ощущения — тепло и ритмическая вибрация. Большинство клиентов дремлют.", en: "RF heats the dermis, HIFES contracts the muscles. Sensation: warmth and rhythmic trembling. Most clients doze off." },
          },
          {
            title: { uk: "Після сесії — без обмежень", ru: "После сессии — без ограничений", en: "After the session — no restrictions" },
            description: { uk: "Лёгка рожевість 30–60 хвилин. Макіяж одразу. Фізичне тренування — наступного дня.", ru: "Лёгкая розовость 30–60 минут. Макияж сразу. Спорт — на следующий день.", en: "Mild redness 30–60 minutes. Makeup immediately. Exercise the next day." },
          },
        ],
      } as StepsSection,
      {
        type: "bullets",
        heading: { uk: "Переваги EMFACE і що варто знати", ru: "Преимущества EMFACE и что стоит знать", en: "EMFACE advantages and what to know" },
        items: [
          { uk: "Єдина процедура, що одночасно тренує м'язи і стимулює колаген", ru: "Единственная процедура, одновременно тренирующая мышцы и стимулирующая коллаген", en: "The only procedure that simultaneously trains muscles and stimulates collagen" },
          { uk: "Клінічно підтверджений підйом брів на 4,7 мм після курсу", ru: "Клинически подтверждённый подъём бровей на 4,7 мм после курса", en: "Clinically confirmed 4.7 mm brow elevation after a course" },
          { uk: "Без голок, без анестезії, без відновлення — 20 хвилин і одразу до роботи", ru: "Без игл, без анестезии, без восстановления — 20 минут и сразу на работу", en: "No needles, no anaesthesia, no downtime — 20 minutes and straight to work" },
          { uk: "Ефект накопичується 3–6 місяців після курсу (колагенез продовжується)", ru: "Эффект накапливается 3–6 месяцев после курса (коллагенез продолжается)", en: "Effect accumulates 3–6 months post-course (collagenesis continues)" },
          { uk: "⚠ Потрібен курс 4 сесій — один сеанс результату не дасть", ru: "⚠ Нужен курс 4 сессий — один сеанс результата не даст", en: "⚠ A 4-session course is required — one session will not deliver results" },
          { uk: "⚠ Не підходить при важкому птозі — там потрібна хірургія або глибокий HIFU", ru: "⚠ Не подходит при тяжёлом птозе — там нужна хирургия или глубокий HIFU", en: "⚠ Not suitable for severe ptosis — surgery or deep HIFU is needed there" },
        ],
      } as BulletsSection,
    ],
    faq: [
      {
        question: { uk: "EMFACE чи ботокс — що вибрати?", ru: "EMFACE или ботокс — что выбрать?", en: "EMFACE or botox — which to choose?" },
        answer: { uk: "Вони не конкурують: ботокс розслаблює гіперактивний м'яз, EMFACE зміцнює ліфтерів. Оптимально — поєднувати. Спочатку курс EMFACE, потім ботокс за показаннями.", ru: "Они не конкурируют: ботокс расслабляет гиперактивную мышцу, EMFACE укрепляет лифтеры. Оптимально — сочетать.", en: "They don't compete: botox relaxes a hyperactive muscle, EMFACE strengthens the lifters. Optimal: combine them." },
      },
      {
        question: { uk: "Після скількох сесій видно результат?", ru: "После скольких сессий виден результат?", en: "After how many sessions is the result visible?" },
        answer: { uk: "Перша помітна різниця — після 2-ї сесії. Повний результат розкривається через 2–3 місяці після курсу з 4 сесій. Колагенез активний ще 3–6 місяців після завершення курсу.", ru: "Первая заметная разница — после 2-й сессии. Полный результат — через 2–3 месяца после курса из 4 сессий.", en: "The first noticeable difference after session 2. Full result unfolds 2–3 months after the 4-session course." },
      },
      {
        question: { uk: "Як довго тримається ефект EMFACE?", ru: "Как долго держится эффект EMFACE?", en: "How long does the EMFACE effect last?" },
        answer: { uk: "6–12 місяців залежно від вихідного тонусу та способу життя. Підтримуючий сеанс 1 раз на 3–6 місяців подовжує результат.", ru: "6–12 месяцев в зависимости от исходного тонуса и образа жизни. Поддерживающий сеанс раз в 3–6 месяцев продлевает результат.", en: "6–12 months depending on baseline muscle tone and lifestyle. Maintenance every 3–6 months extends the result." },
      },
      {
        question: { uk: "Чи боляче робити EMFACE?", ru: "Больно ли делать EMFACE?", en: "Is EMFACE painful?" },
        answer: { uk: "Ні. Відчуття — тепло від RF і ритмічні скорочення від HIFES («дивно, але не боляче»). Анестезія не потрібна. Більшість клієнтів засинають під час сесії.", ru: "Нет. Ощущения — тепло и ритмичные сокращения («странно, но не больно»). Анестезия не нужна.", en: "No. Sensation: warmth and rhythmic contractions ('strange but not painful'). No anaesthesia needed. Most clients doze off." },
      },
      {
        question: { uk: "Чи можна поєднувати EMFACE з Ultraformer MPT?", ru: "Можно ли сочетать EMFACE с Ultraformer MPT?", en: "Can EMFACE be combined with Ultraformer MPT?" },
        answer: { uk: "Так, і це ефективна комбінація: Ultraformer MPT ліфтингує на рівні SMAS-фасції, EMFACE зміцнює поверхневі м'язи-ліфтери. Разом вирішують обидва рівні. Інтервал між процедурами — 2–4 тижні.", ru: "Да, эффективная комбинация: Ultraformer MPT лифтингует на уровне SMAS-фасции, EMFACE укрепляет поверхностные мышцы-лифтеры.", en: "Yes — an effective combination. Ultraformer MPT lifts at SMAS level; EMFACE strengthens the superficial lifting muscles. Allow 2–4 weeks between procedures." },
      },
    ],
  },

  // ─── VOLNEWMER ─────────────────────────────────────────────────────────────
  {
    slug: "volnewmer",
    summary: {
      uk: "VOLNEWMER у GENEVITY — монополярна RF-терапія для глибокого прогрівання дерми та підшкірних тканин: стимулює синтез нового колагену, підтягує контур обличчя, покращує тонус шкіри шиї та декольте. Без голок, без реабілітації, ефект накопичується протягом 3–6 місяців.",
      ru: "VOLNEWMER в GENEVITY — монополярная RF-терапия для глубокого прогрева дермы: стимулирует синтез нового коллагена, подтягивает контур лица, улучшает тонус шеи и декольте. Без игл, без реабилитации, эффект накапливается 3–6 месяцев.",
      en: "VOLNEWMER at GENEVITY — monopolar RF therapy for deep dermis and subcutaneous heating: stimulates new collagen synthesis, tightens facial contour, improves neck and décolletage tone. No needles, no downtime, results build over 3–6 months.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "Монополярний RF: глибше і рівномірніше", ru: "Монополярный RF: глубже и равномернее", en: "Monopolar RF: deeper and more even" },
        body: {
          uk: "VOLNEWMER — апарат монополярної радіочастотної терапії від BTL Aesthetics. На відміну від біполярного RF (нагрів між двома електродами на шкірі), монополярна система формує електромагнітне поле між аплікатором і заземлюючим електродом на тілі пацієнта. Енергія проникає значно глибше — в підшкірну жирову клітковину (1,5–2 см), рівномірно нагріваючи глибокі шари дерми.\n\nПри нагріві до 40–43°C фібробласти активізуються і посилено синтезують проколаген. Новий колаген дозріває 3–6 місяців після процедури — ефект накопичується після завершення курсу. Тепловий вплив також скорочує наявні колагенові волокна — з першої сесії помітний підтягуючий ефект.",
          ru: "VOLNEWMER — аппарат монополярной радиочастотной терапии от BTL Aesthetics. В отличие от биполярного RF, монополярная система создаёт поле между аппликатором и заземляющим электродом на теле. Энергия проникает до 1,5–2 см в глубину, равномерно нагревая дерму и гиподерму.\n\nПри нагреве до 40–43°C фибробласты синтезируют проколлаген. Новый коллаген созревает 3–6 месяцев. Тепловой эффект также сокращает имеющиеся волокна — с первой сессии есть заметная подтяжка.",
          en: "VOLNEWMER is a monopolar radiofrequency therapy device from BTL Aesthetics. Unlike bipolar RF (heating between two surface electrodes), monopolar creates a field between the applicator and a body-placed grounding electrode. Energy penetrates 1.5–2 cm deep, uniformly heating the dermis and hypodermis.\n\nAt 40–43°C, fibroblasts ramp up procollagen synthesis. New collagen matures over 3–6 months post-procedure. The thermal effect also contracts existing fibres — a noticeable tightening is visible from the first session.",
        },
        calloutBody: {
          uk: "Ефект RF напряму залежить від досягнутої температури тканин. Дешевші апарати часто не виходять на 40°C — результат мінімальний. Ми контролюємо температуру пірометром під час кожної сесії.",
          ru: "Эффект RF напрямую зависит от достигнутой температуры тканей. Более дешёвые аппараты часто не достигают 40°C — результат минимален. Мы контролируем температуру пирометром во время каждой сессии.",
          en: "RF efficacy depends directly on the tissue temperature reached. Cheaper devices often fail to hit 40°C — the result is minimal. We monitor temperature with a pyrometer during every session.",
        },
        heroImage: null,
      } as RichTextSection,
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання для VOLNEWMER", ru: "Показания для VOLNEWMER", en: "Indications for VOLNEWMER" },
        indications: [
          { uk: "Птоз і гравітаційне зміщення тканин обличчя — брилі, опущені кути рота", ru: "Птоз и гравитационное смещение тканей лица — брыли, опущенные углы рта", en: "Facial ptosis and gravitational tissue displacement — jowls, descended mouth corners" },
          { uk: "Зниження тургору та пружності шкіри обличчя, шиї, декольте", ru: "Снижение тургора и упругости кожи лица, шеи, декольте", en: "Loss of skin turgor and elasticity on face, neck, décolletage" },
          { uk: "«Другий підборіддя» — поверхнева ліподистрофія субментальної зони", ru: "«Второй подбородок» — поверхностная липодистрофия субментальной зоны", en: "Double chin — superficial lipodystrophy of the submental zone" },
          { uk: "Дрібні і середні зморшки (RF найефективніший при ранніх зморшках)", ru: "Мелкие и средние морщины (RF наиболее эффективен при ранних морщинах)", en: "Fine-to-medium wrinkles (RF is most effective on early lines)" },
          { uk: "Дрібні зморшки і в'ялість шкіри навколо очей (режим EYE)", ru: "Мелкие морщины и дряблость кожи вокруг глаз (режим EYE)", en: "Fine wrinkles and laxity around the eyes (EYE mode)" },
          { uk: "Профілактика вікових змін — 30+ (підтримка вже наявного тонусу)", ru: "Профилактика возрастных изменений — 30+ (поддержание имеющегося тонуса)", en: "Prevention of ageing changes at 30+ (maintaining existing tone)" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність і грудне вигодовування", ru: "Беременность и грудное вскармливание", en: "Pregnancy and breastfeeding" },
          { uk: "Кардіостимулятор або металеві імпланти в зоні лікування", ru: "Кардиостимулятор или металлические импланты в зоне лечения", en: "Pacemaker or metal implants in the treatment zone" },
          { uk: "Злоякісні новоутворення", ru: "Злокачественные новообразования", en: "Malignant tumours" },
          { uk: "Активні запальні процеси шкіри у зоні обробки", ru: "Активные воспалительные процессы кожи в зоне обработки", en: "Active skin inflammation in the treatment zone" },
        ],
      } as IndicationsSection,
      {
        type: "steps",
        heading: { uk: "Як проходить сесія VOLNEWMER", ru: "Как проходит сессия VOLNEWMER", en: "What a VOLNEWMER session looks like" },
        steps: [
          {
            title: { uk: "Очищення і розмітка зон", ru: "Очищение и разметка зон", en: "Skin cleansing and zone mapping" },
            description: { uk: "Шкіра очищається. Лікар розмічає зони впливу і встановлює заземлюючий електрод на спину або стегно.", ru: "Кожа очищается. Врач размечает зоны воздействия, устанавливает заземляющий электрод.", en: "Skin is cleansed. The specialist maps treatment zones and places the grounding electrode on the back or thigh." },
          },
          {
            title: { uk: "Нанесення гелю і розігрів", ru: "Нанесение геля и разогрев", en: "Gel application and warm-up" },
            description: { uk: "RF-аплікатор рухається по шкірі з гелем. Оператор контролює температуру пірометром: мета — досягнути 40–42°C і підтримувати 3–5 хв у кожній зоні.", ru: "RF-аппликатор движется по коже с гелем. Оператор контролирует температуру: цель — 40–42°C в каждой зоне.", en: "The RF applicator moves across the gel-coated skin. Temperature is monitored: target 40–42°C per zone for 3–5 minutes." },
          },
          {
            title: { uk: "Обробка всіх зон", ru: "Обработка всех зон", en: "Treating all zones" },
            description: { uk: "Обличчя 30–45 хв; обличчя + шия + декольте — до 60 хв. Відчуття — рівне, приємне тепло без пульсацій.", ru: "Лицо — 30–45 мин; лицо + шея + декольте — до 60 мин. Ощущения — ровное, приятное тепло.", en: "Face 30–45 min; face + neck + décolletage up to 60 min. Sensation: steady, comfortable warmth." },
          },
          {
            title: { uk: "Після сесії", ru: "После сессии", en: "After the session" },
            description: { uk: "Легка рожевість 30–60 хв, можливий невеликий набряк навколо очей 2–4 год. Макіяж через 2 год. SPF 30+ — 2 тижні після.", ru: "Лёгкая розовость 30–60 мин, возможный отёк вокруг глаз 2–4 ч. Макияж через 2 ч.", en: "Mild redness 30–60 min, possible eye-area swelling 2–4 h. Makeup after 2 h. SPF 30+ for 2 weeks." },
          },
        ],
      } as StepsSection,
      {
        type: "bullets",
        heading: { uk: "Переваги VOLNEWMER і важливі нюанси", ru: "Преимущества VOLNEWMER и важные нюансы", en: "VOLNEWMER advantages and key nuances" },
        items: [
          { uk: "Перший підтягуючий ефект — вже після 1–2 сесій (скорочення «старого» колагену)", ru: "Первый подтягивающий эффект — уже после 1–2 сессий", en: "First tightening after 1–2 sessions (existing collagen contraction)" },
          { uk: "Без реабілітації і жодних обмежень після сесії — можна йти на роботу одразу", ru: "Без реабилитации и ограничений после сессии", en: "No downtime or restrictions after the session" },
          { uk: "4 режими: FACE, BODY, EYE, PLUS — різні протоколи для різних зон і завдань", ru: "4 режима: FACE, BODY, EYE, PLUS — разные протоколи для разных зон", en: "4 modes: FACE, BODY, EYE, PLUS — different protocols for different zones" },
          { uk: "Стимулює синтез гіалуронової кислоти у дермі — шкіра пружніша і зволоженіша", ru: "Стимулирует синтез гиалуроновой кислоты в дерме — кожа упругее и увлажнённее", en: "Stimulates hyaluronic acid synthesis in the dermis — firmer and more hydrated skin" },
          { uk: "⚠ Не ліфтингує SMAS-фасцію — для глибокого ліфтингу потрібен Ultraformer MPT (HIFU)", ru: "⚠ Не лифтингует SMAS-фасцию — для глубокого лифтинга нужен Ultraformer MPT (HIFU)", en: "⚠ Does not lift the SMAS fascia — Ultraformer MPT (HIFU) is needed for deep lifting" },
          { uk: "⚠ Результат потребує курсу 4–6 сесій; одноразова процедура — лише профілактика", ru: "⚠ Результат требует курса 4–6 сессий; разовая процедура — лишь профилактика", en: "⚠ A 4–6 session course is needed for results; a single session is prevention only" },
        ],
      } as BulletsSection,
    ],
    faq: [
      {
        question: { uk: "Скільки сесій VOLNEWMER потрібно?", ru: "Сколько сессий VOLNEWMER нужно?", en: "How many VOLNEWMER sessions are needed?" },
        answer: { uk: "Стандартний курс — 4–6 сесій з інтервалом 1–2 тижні. Для профілактики — 3–4. Підтримуючий сеанс раз на 3–6 місяців зберігає результат.", ru: "Стандартный курс — 4–6 сессий с интервалом 1–2 недели. Для профилактики — 3–4. Поддержка раз в 3–6 месяцев.", en: "Standard course: 4–6 sessions at 1–2 week intervals. For prevention: 3–4. Maintenance every 3–6 months." },
      },
      {
        question: { uk: "Чим VOLNEWMER відрізняється від Ultraformer MPT?", ru: "Чем VOLNEWMER отличается от Ultraformer MPT?", en: "How does VOLNEWMER differ from Ultraformer MPT?" },
        answer: { uk: "VOLNEWMER — монополярний RF, нагріває дерму і гіподерму (до 2 см). Ultraformer MPT — фокусований ультразвук HIFU, що досягає SMAS-фасції (4,5 мм і глибше). При помірному птозі — VOLNEWMER. При вираженому — Ultraformer або комбінація.", ru: "VOLNEWMER — монополярный RF до 2 см глубины. Ultraformer MPT — HIFU, достигает SMAS-фасции. При умеренном птозе — VOLNEWMER; при выраженном — Ultraformer или комбинация.", en: "VOLNEWMER is monopolar RF up to 2 cm deep. Ultraformer MPT is HIFU reaching the SMAS fascia. For moderate ptosis — VOLNEWMER. For pronounced — Ultraformer or both." },
      },
      {
        question: { uk: "Через скільки видно результат VOLNEWMER?", ru: "Через сколько виден результат VOLNEWMER?", en: "When does the VOLNEWMER result appear?" },
        answer: { uk: "Перший ефект — після 1–2 сесій (скорочення наявного колагену). Основний результат від нового колагену — через 1–3 місяці після курсу, продовжується до 6 місяців.", ru: "Первый эффект — после 1–2 сессий. Основной результат — через 1–3 месяца после курса, продолжается до 6 месяцев.", en: "First effect after 1–2 sessions. Main result from new collagen at 1–3 months post-course, continuing to 6 months." },
      },
    ],
  },

  // ─── EXION ──────────────────────────────────────────────────────────────────
  {
    slug: "exion",
    summary: {
      uk: "EXION у GENEVITY — апарат BTL, що поєднує монополярний RF та AI-керований ультразвук для стимулювання синтезу гіалуронової кислоти і колагену без ін'єкцій. Версія EXION PRIME з фракційними мікроголками ефективна при рубцях після акне та нерівній текстурі — з мінімальним реабілітаційним часом.",
      ru: "EXION в GENEVITY — аппарат BTL, сочетающий монополярный RF и AI-управляемый ультразвук для стимуляции синтеза гиалуроновой кислоты и коллагена без инъекций. EXION PRIME с фракционными микроиглами эффективен при рубцах после акне и неровной текстуре.",
      en: "EXION at GENEVITY — a BTL device combining monopolar RF and AI-guided ultrasound to stimulate hyaluronic acid and collagen synthesis without injections. EXION PRIME with fractional microneedles is effective for post-acne scars and uneven texture.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "EXION: AI-контроль і гіалуронова кислота без ін'єкцій", ru: "EXION: AI-контроль и гиалуроновая кислота без инъекций", en: "EXION: AI control and hyaluronic acid without injections" },
        body: {
          uk: "EXION — платформа нового покоління від BTL Aesthetics. Ключова відмінність: інтеграція монополярного RF з AI-керованим ультразвуком у реальному часі. AI-модуль відстежує реакцію тканин і автоматично коригує параметри енергії, підтримуючи терапевтичну температуру 40–43°C без перегріву і «холодних зон».\n\nУльтразвуковий компонент EXION — не фокусований HIFU, а спрямований ультразвук, що стимулює синтез гіалуронової кислоти у дермі: клінічно підтверджено збільшення на 168%, вироблення колагену — на 26% після курсу. Це перша процедура, що стимулює власну гіалуронову кислоту без ін'єкцій.\n\nEXION PRIME — версія з мікроголками: RF+мікронідлінг для рубців і текстури, відновлення 2–3 дні замість 7–10 після CO₂-лазера.",
          ru: "EXION — платформа нового поколения от BTL Aesthetics. Ключевое отличие: AI-модуль отслеживает реакцию тканей и автоматически корректирует параметры энергии, поддерживая 40–43°C без перегрева.\n\nУльтразвуковой компонент стимулирует синтез гиалуроновой кислоты в дерме: клинически подтверждено увеличение на 168%, коллагена — на 26%. Первая процедура, стимулирующая собственную гиалуронку без инъекций.\n\nEXION PRIME — версия с микроиглами: RF+микронидлинг для рубцов, восстановление 2–3 дня вместо 7–10 после CO₂.",
          en: "EXION is BTL Aesthetics' next-generation platform. The key differentiator: an AI module monitors tissue response and automatically adjusts energy parameters to maintain 40–43°C without overheating.\n\nThe ultrasound component stimulates hyaluronic acid synthesis in the dermis: clinically confirmed 168% increase, collagen +26% after a course. The first procedure to stimulate native hyaluronic acid without injections.\n\nEXION PRIME — microneedling version: RF + microneedling for scars, 2–3 day recovery vs 7–10 days after CO₂ laser.",
        },
        calloutBody: {
          uk: "EXION — перша процедура, яка стимулює синтез власної гіалуронової кислоти без ін'єкцій. Ефект накопичується поступово, але зберігається довше, ніж від введеного філера.",
          ru: "EXION — первая процедура, стимулирующая синтез собственной гиалуроновой кислоты без инъекций. Эффект накапливается постепенно, но сохраняется дольше, чем от введённого филлера.",
          en: "EXION is the first procedure to stimulate native hyaluronic acid without injections. The effect builds gradually but lasts longer than injected filler.",
        },
        heroImage: null,
      } as RichTextSection,
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання", ru: "Показания", en: "Indications" },
        indications: [
          { uk: "Зниження тургору, пружності та зволоженості шкіри обличчя, шиї, декольте, рук", ru: "Снижение тургора, упругости и увлажнённости кожи лица, шеи, декольте, рук", en: "Loss of turgor, elasticity and hydration on face, neck, décolletage, hands" },
          { uk: "Дрібні і середні зморшки, тьмяна «стомлена» шкіра", ru: "Мелкие и средние морщины, тусклая «усталая» кожа", en: "Fine-to-medium wrinkles, dull 'tired' complexion" },
          { uk: "Рубці після акне — поверхневі та середньої глибини (EXION PRIME)", ru: "Рубцы после акне — поверхностные и средней глубины (EXION PRIME)", en: "Post-acne scars — superficial and medium depth (EXION PRIME)" },
          { uk: "Розширені пори та нерівна текстура шкіри (EXION PRIME)", ru: "Расширенные поры и неровная текстура кожи (EXION PRIME)", en: "Enlarged pores and uneven skin texture (EXION PRIME)" },
          { uk: "Підготовка шкіри перед ін'єкційними процедурами", ru: "Подготовка кожи перед инъекционными процедурами", en: "Skin preparation before injection procedures" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність (абсолютне для будь-якого RF та ультразвуку)", ru: "Беременность (абсолютное для любого RF и ультразвука)", en: "Pregnancy (absolute for any RF or ultrasound)" },
          { uk: "Кардіостимулятор або металеві імпланти у зоні лікування", ru: "Кардиостимулятор или металлические импланты в зоне лечения", en: "Pacemaker or metal implants in the treatment zone" },
          { uk: "Злоякісні новоутворення", ru: "Злокачественные новообразования", en: "Malignant tumours" },
          { uk: "Активне запалення шкіри в зоні обробки", ru: "Активное воспаление кожи в зоне обработки", en: "Active skin inflammation in the treatment zone" },
          { uk: "Для EXION PRIME: активний герпес, нещодавній пілінг або лазер (< 2 тижні)", ru: "Для EXION PRIME: активный герпес, недавний пилинг или лазер (< 2 недели)", en: "For EXION PRIME: active herpes, recent peel or laser (< 2 weeks)" },
        ],
      } as IndicationsSection,
      {
        type: "steps",
        heading: { uk: "Процедура EXION крок за кроком", ru: "Процедура EXION шаг за шагом", en: "The EXION procedure step by step" },
        steps: [
          {
            title: { uk: "EXION FACE: гель і рух аплікатора", ru: "EXION FACE: гель и движение аппликатора", en: "EXION FACE: gel and applicator movement" },
            description: { uk: "Гель на шкіру, аплікатор рухається плавно. AI підтримує 40–43°C в реальному часі. Анестезія не потрібна. 30–45 хвилин.", ru: "Гель на кожу, аппликатор движется плавно. AI поддерживает 40–43°C. Анестезия не нужна. 30–45 минут.", en: "Gel on skin, applicator moves smoothly. AI maintains 40–43°C. No anaesthesia. 30–45 minutes." },
          },
          {
            title: { uk: "EXION PRIME: анестезія та мікроголки", ru: "EXION PRIME: анестезия и микроиглы", en: "EXION PRIME: anaesthesia and microneedles" },
            description: { uk: "Крем-анестетик за 30–45 хв до. Голки 0,5–3,5 мм, 9000 об/хв — мінімальна травма. RF через голки нагріває глибокі шари.", ru: "Крем-анестетик за 30–45 мин. Иглы 0,5–3,5 мм, 9000 об/мин. RF через иглы нагревает глубокие слои.", en: "Topical anaesthetic 30–45 min before. 0.5–3.5 mm needles at 9,000 rpm. RF through needles heats deeper layers." },
          },
          {
            title: { uk: "Відновлення після EXION FACE", ru: "Восстановление после EXION FACE", en: "Recovery after EXION FACE" },
            description: { uk: "Легка рожевість 30–60 хв. Одразу на роботу. Макіяж одразу. Жодних обмежень.", ru: "Лёгкая розовость 30–60 мин. Можно сразу на работу. Никаких ограничений.", en: "Mild redness 30–60 min. Straight to work. Makeup immediately. No restrictions." },
          },
          {
            title: { uk: "Відновлення після EXION PRIME", ru: "Восстановление после EXION PRIME", en: "Recovery after EXION PRIME" },
            description: { uk: "Рожевість і стягнутість 24–48 год. Шелушіння 3–5 день. Повна нормалізація до 7-го дня. SPF 50+ — 4 тижні.", ru: "Розовость и стянутость 24–48 ч. Шелушение 3–5 день. Нормализация к 7-му дню. SPF 50+ — 4 недели.", en: "Redness and tightness 24–48 h. Peeling day 3–5. Full normalisation by day 7. SPF 50+ for 4 weeks." },
          },
        ],
      } as StepsSection,
      {
        type: "bullets",
        heading: { uk: "Переваги та особливості EXION", ru: "Преимущества и особенности EXION", en: "EXION advantages and key points" },
        items: [
          { uk: "AI-контроль температури в реальному часі — більш рівномірний і безпечний нагрів, ніж у класичного RF", ru: "AI-контроль температуры в реальном времени — более равномерный и безопасный нагрев", en: "AI real-time temperature control — more even and safe heating than classic RF" },
          { uk: "Стимулює власну гіалуронову кислоту (+168%) і колаген (+26%) — підтверджено FDA", ru: "Стимулирует собственную гиалуроновую кислоту (+168%) и коллаген (+26%) — подтверждено FDA", en: "Stimulates native hyaluronic acid (+168%) and collagen (+26%) — FDA confirmed" },
          { uk: "EXION PRIME — ефективна альтернатива CO₂-лазеру при поверхневих рубцях з меншим downtime", ru: "EXION PRIME — эффективная альтернатива CO₂-лазеру при поверхностных рубцах с меньшим downtime", en: "EXION PRIME — effective CO₂ alternative for superficial scars with less downtime" },
          { uk: "⚠ EXION PRIME не замінює CO₂-лазер при глибоких ice-pick рубцях — там AcuPulse дасть кращий результат", ru: "⚠ EXION PRIME не заменяет CO₂-лазер при глубоких ice-pick рубцах", en: "⚠ EXION PRIME doesn't replace CO₂ laser for deep ice-pick scars — AcuPulse delivers better results there" },
          { uk: "⚠ Перед EXION PRIME — обов'язково повідомити про схильність до герпесу: потрібна профілактика", ru: "⚠ Перед EXION PRIME — обязательно сообщить о склонности к герпесу: нужна профилактика", en: "⚠ Before EXION PRIME — always disclose herpes susceptibility: prophylaxis required" },
        ],
      } as BulletsSection,
    ],
    faq: [
      {
        question: { uk: "EXION чи VOLNEWMER — в чому різниця?", ru: "EXION или VOLNEWMER — в чём разница?", en: "EXION vs VOLNEWMER — what's the difference?" },
        answer: { uk: "VOLNEWMER — класичний монополярний RF. EXION додає AI-контроль температури і ультразвукову стимуляцію гіалуронової кислоти. Для базового омолодження — VOLNEWMER. При вираженій сухості і текстурних проблемах — EXION.", ru: "VOLNEWMER — классический монополярный RF. EXION добавляет AI-контроль и стимуляцию гиалуронки. Для базового омоложения — VOLNEWMER; при выраженной сухости — EXION.", en: "VOLNEWMER is classic monopolar RF. EXION adds AI temperature control and hyaluronic acid stimulation. For basic rejuvenation — VOLNEWMER; for significant dryness — EXION." },
      },
      {
        question: { uk: "EXION PRIME допомагає від рубців після акне?", ru: "EXION PRIME помогает от рубцов после акне?", en: "Does EXION PRIME help with post-acne scars?" },
        answer: { uk: "Так — ефективний при поверхневих і середніх атрофічних рубцях (rolling, boxcar). Для глибоких ice-pick рубців — краще AcuPulse CO₂ або комбінація. На консультації лікар визначить оптимальний протокол.", ru: "Да — эффективен при поверхностных и средних атрофических рубцах. Для глубоких ice-pick — лучше AcuPulse CO₂.", en: "Yes — effective for superficial and medium atrophic scars (rolling, boxcar). For deep ice-pick — AcuPulse CO₂ or a combination. The doctor defines the protocol at consultation." },
      },
      {
        question: { uk: "Скільки часу відновлення після EXION PRIME?", ru: "Сколько времени восстановление после EXION PRIME?", en: "How long is the recovery after EXION PRIME?" },
        answer: { uk: "2–3 дні рожевості і стягнутості, шелушіння на 3–5-й день, повна нормалізація до 7-го. Для порівняння: AcuPulse CO₂ — 7–10 днів.", ru: "2–3 дня розовости и стянутости, шелушение на 3–5 день, нормализация к 7-му. AcuPulse CO₂ для сравнения — 7–10 дней.", en: "2–3 days of redness and tightness, peeling on days 3–5, full normalisation by day 7. For comparison: AcuPulse CO₂ takes 7–10 days." },
      },
    ],
  },

  // ─── ULTRAFORMER MPT ────────────────────────────────────────────────────────
  {
    slug: "ultraformer-mpt",
    summary: {
      uk: "Ultraformer MPT у GENEVITY — HIFU-апарат нового покоління для нехірургічного SMAS-ліфтингу обличчя, шиї та підборіддя. Фокусований ультразвук досягає тих самих шарів, що і хірургічний ліфтинг, без розрізів. Видимий ефект після одного сеансу, пік результату — через 3–6 місяців.",
      ru: "Ultraformer MPT в GENEVITY — HIFU-аппарат нового поколения для нехирургического SMAS-лифтинга лица, шеи и подбородка. Фокусированный ультразвук достигает тех же слоёв, что и хирургический лифтинг, без разрезов. Эффект виден после одного сеанса, пик — через 3–6 месяцев.",
      en: "Ultraformer MPT at GENEVITY — a next-generation HIFU device for non-surgical SMAS lifting of the face, neck and chin. Focused ultrasound reaches the same layers as a surgical lift — without incisions. Visible effect after one session, peak result at 3–6 months.",
    },
    sections: [
      {
        type: "richText",
        heading: { uk: "HIFU і SMAS: нехірургічний ліфтинг на глибинному рівні", ru: "HIFU и SMAS: нехирургический лифтинг на глубинном уровне", en: "HIFU and SMAS: non-surgical lifting at depth" },
        body: {
          uk: "SMAS (Superficial Musculo-Aponeurotic System) — глибока м'язово-апоневротична фасція, що «тримає» обличчя. Вона опускається з роком, тягнучи щоки, кути рота і шию. Хірургічний SMAS-ліфтинг працює з нею через розрізи. Ultraformer MPT (HIFU) — перша технологія, що дозволяє дістатися до SMAS без скальпеля.\n\nАплікатор випромінює ультразвукові хвилі, які фокусуються в точці на заданій глибині — 1,5 мм (поверхнева дерма), 3 мм (глибока дерма), 4,5 мм (SMAS-фасція). У точці фокусу температура миттєво досягає 65–70°C — утворюється теплова коагуляційна точка (TCP). Тисячі TCP за сесію стискають SMAS-волокна (негайний ліфтинг) і запускають регенерацію — новий колаген зростає 3–6 місяців після процедури.\n\nUltraformer MPT використовує Multi Pulse Technology (MPT) — щільніший масив TCP за менший час, рівномірніший результат і менший дискомфорт порівняно з першим поколінням HIFU.",
          ru: "SMAS — глубокая мышечно-апоневротическая фасция, удерживающая лицо. Она опускается с годами. HIFU — первая технология, позволившая добраться до SMAS без скальпеля.\n\nАппликатор формирует тепловые коагуляционные точки (TCP) на глубине 1,5, 3 и 4,5 мм. Тысячи TCP сжимают SMAS-волокна (немедленный лифтинг) и запускают неоколлагенез на 3–6 месяцев.\n\nUltraformer MPT использует Multi Pulse Technology: более плотный массив TCP за меньшее время, равномерный результат, меньший дискомфорт.",
          en: "SMAS is the deep musculoaponeurotic fascia holding the face in place. It descends with age, pulling cheeks, mouth corners and neck with it. HIFU is the first technology to reach the SMAS without a scalpel.\n\nThe applicator creates thermal coagulation points (TCP) at set depths — 1.5, 3 and 4.5 mm. Thousands of TCP per session contract SMAS fibres (immediate lift) and trigger neocollagenesis over 3–6 months.\n\nUltraformer MPT uses Multi Pulse Technology (MPT): a denser TCP array in less time, more uniform result, less discomfort than first-generation HIFU.",
        },
        calloutBody: {
          uk: "Ultraformer MPT — найближче, що існує до хірургічного ліфтингу без хірургії. Але не те саме: при птозі 2–3 ступеня — лише хірург дасть стабільний результат. HIFU — для 1 ступеня і профілактики.",
          ru: "Ultraformer MPT — ближайшее к хирургическому лифтингу без хирургии. Но не одно и то же: при птозе 2–3 степени — только хирург. HIFU — для 1 степени и профилактики.",
          en: "Ultraformer MPT is the closest thing to a surgical lift without surgery. But not the same: for grade-2 and 3 ptosis — only a surgeon. HIFU is for grade-1 and prevention.",
        },
        heroImage: null,
      } as RichTextSection,
      {
        type: "indicationsContraindications",
        indicationsHeading: { uk: "Показання для Ultraformer MPT", ru: "Показания для Ultraformer MPT", en: "Indications for Ultraformer MPT" },
        indications: [
          { uk: "Опущення брів — підйом на 2–5 мм, «відкриває» погляд (трансдюсер 1,5 мм на чоло)", ru: "Опущение бровей — подъём на 2–5 мм, «открывает» взгляд", en: "Brow ptosis — 2–5 mm elevation, 'opens' the gaze (1.5 mm transducer on forehead)" },
          { uk: "Брилі та нечіткий кут щелепи — ліфтинг нижньої третини обличчя", ru: "Брыли и нечёткий угол челюсти — лифтинг нижней трети лица", en: "Jowls and undefined jaw angle — lower-face lifting" },
          { uk: "Підтягування шкіри шиї — одна з кращих зон відгуку HIFU", ru: "Подтяжка кожи шеи — одна из лучших зон отклика HIFU", en: "Neck skin tightening — one of the best HIFU response zones" },
          { uk: "«Другий підборіддя» — субментальна зона, поєднання ліполітичного та ліфтингового ефекту", ru: "«Второй подбородок» — субментальная зона, сочетание липолитического и лифтингового эффектов", en: "Double chin — submental zone, combining lipolytic and lifting effects" },
          { uk: "Дрібні вертикальні зморшки навколо рота і опущені кути губ (мікрофокус 1,5 мм)", ru: "Мелкие вертикальные морщины вокруг рта, опущенные углы губ (микрофокус 1,5 мм)", en: "Fine vertical perioral lines and descended mouth corners (1.5 mm microfocus)" },
          { uk: "Профілактика птозу від 30 років і при активному способі життя", ru: "Профилактика птоза от 30 лет и при активном образе жизни", en: "Ptosis prevention from age 30 and for active lifestyles" },
        ],
        contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
        contraindications: [
          { uk: "Вагітність", ru: "Беременность", en: "Pregnancy" },
          { uk: "Металеві або електронні імпланти у зоні лікування", ru: "Металлические или электронные импланты в зоне лечения", en: "Metal or electronic implants in the treatment zone" },
          { uk: "Злоякісні новоутворення", ru: "Злокачественные новообразования", en: "Malignant tumours" },
          { uk: "Активне запалення шкіри у зоні обробки", ru: "Активное воспаление кожи в зоне обработки", en: "Active skin inflammation in the treatment zone" },
          { uk: "Важкий птоз 3-го ступеня (потрібна хірургія)", ru: "Тяжёлый птоз 3-й степени (нужна хирургия)", en: "Severe grade-3 ptosis (surgery required)" },
          { uk: "Дуже тонка атрофічна шкіра — знижений відгук на HIFU", ru: "Очень тонкая атрофичная кожа — сниженный отклик на HIFU", en: "Very thin atrophic skin — reduced HIFU response" },
        ],
      } as IndicationsSection,
      {
        type: "steps",
        heading: { uk: "Сесія Ultraformer MPT крок за кроком", ru: "Сессия Ultraformer MPT шаг за шагом", en: "The Ultraformer MPT session step by step" },
        steps: [
          {
            title: { uk: "Підготовка: гель і вибір трансдюсерів", ru: "Подготовка: гель и выбор трансдюсеров", en: "Preparation: gel and transducer selection" },
            description: { uk: "Очищення, нанесення УЗ-гелю. Лікар вибирає глибину і трансдюсер для кожної зони. Анестезія — за бажанням.", ru: "Очищение, нанесение УЗ-геля. Выбор глубины и трансдюсеров. Анестезия — по желанию.", en: "Cleansing, ultrasound gel applied. Doctor selects depth and transducer per zone. Anaesthesia optional." },
          },
          {
            title: { uk: "Обробка зон «пострілами»", ru: "Обработка зон «выстрелами»", en: "Zone treatment with 'shots'" },
            description: { uk: "Кожна лінія — менш ніж за 1 секунду. Відчуття від легкого поколювання до короткого різкого (залежно від зони). Чоло і шия — менш чутливі; підборіддя і кути рота — чутливіші.", ru: "Каждая линия — менее чем за 1 секунду. Ощущения от лёгкого покалывания до короткого резкого. Лоб и шея менее чувствительны.", en: "Each line in under 1 second. Sensations from mild tingle to brief sharp sting by zone. Forehead and neck less sensitive; chin and mouth corners more." },
          },
          {
            title: { uk: "Одразу після — видимий ефект", ru: "Сразу после — видимый эффект", en: "Immediately after — visible effect" },
            description: { uk: "SMAS-волокна скорочуються під час сесії — перший підйом помітний одразу. Це не фінальний результат: набряк на 24–48 год, потім обличчя «стабілізується».", ru: "SMAS-волокна сокращаются во время сессии — первый подъём заметен сразу. Это не финальный результат: отёк на 24–48 ч.", en: "SMAS fibres contract during the session — first lift visible immediately. This is not the final result: swelling for 24–48 h, then stabilisation." },
          },
          {
            title: { uk: "Пік результату через 3–6 місяців", ru: "Пик результата через 3–6 месяцев", en: "Peak result at 3–6 months" },
            description: { uk: "Новий колаген дозріває 3–6 місяців. Контрольне фото через 3 місяці покаже реальний кумулятивний ефект.", ru: "Новый коллаген созревает 3–6 месяцев. Фото через 3 месяца покажет реальный кумулятивный эффект.", en: "New collagen matures over 3–6 months. A 3-month follow-up photo shows the real cumulative effect." },
          },
        ],
      } as StepsSection,
      {
        type: "bullets",
        heading: { uk: "Переваги та нюанси Ultraformer MPT", ru: "Преимущества и нюансы Ultraformer MPT", en: "Ultraformer MPT advantages and nuances" },
        items: [
          { uk: "Єдиний безопераційний метод, що діє на рівні SMAS-фасції — там, де починається хірургічний ліфтинг", ru: "Единственный безоперационный метод на уровне SMAS-фасции — там, где начинается хирургический лифтинг", en: "The only non-surgical method targeting the SMAS fascia — where surgical lifting begins" },
          { uk: "1 сесія на рік достатня для більшості пацієнтів (тривалість 12–18 місяців)", ru: "1 сессия в год достаточна для большинства пациентов (продолжительность 12–18 месяцев)", en: "1 session per year sufficient for most patients (duration 12–18 months)" },
          { uk: "Без реабілітації — макіяж наступного дня, робота одразу", ru: "Без реабилитации — макияж на следующий день, работа сразу", en: "No downtime — makeup the next day, work immediately" },
          { uk: "Добре комбінується з ботоксом і філерами (інтервал 2 тижні між процедурами)", ru: "Хорошо сочетается с ботоксом и филлерами (интервал 2 недели)", en: "Combines well with botox and fillers (2-week interval between procedures)" },
          { uk: "⚠ Не замінює хірургічний ліфтинг при птозі 2–3 ступеня — там потрібен хірург", ru: "⚠ Не заменяет хирургический лифтинг при птозе 2–3 степени", en: "⚠ Does not replace surgical lifting for grade 2–3 ptosis — a surgeon is needed there" },
          { uk: "⚠ Перша сесія може бути більш чутлива — до наступної адаптація значно краща", ru: "⚠ Первая сессия может быть более чувствительной — к следующей адаптация значительно лучше", en: "⚠ First session may be more sensitive — subsequent sessions are much more comfortable" },
        ],
      } as BulletsSection,
    ],
    faq: [
      {
        question: { uk: "Скільки коштує Ultraformer MPT у Дніпрі?", ru: "Сколько стоит Ultraformer MPT в Днепре?", en: "How much does Ultraformer MPT cost in Dnipro?" },
        answer: { uk: "Вартість залежить від кількості зон і кількості ліній (TCP). Базовий прайс на Ultraformer MPT у GENEVITY вказаний на цій сторінці. Точна вартість визначається на консультації після оцінки зон і протоколу.", ru: "Стоимость зависит от количества зон и линий. Базовый прайс на этой странице. Точная стоимость — на консультации.", en: "Cost depends on the number of zones and lines (TCP). Base price is on this page. Exact cost confirmed at consultation." },
      },
      {
        question: { uk: "Скільки сесій Ultraformer MPT потрібно?", ru: "Сколько сессий Ultraformer MPT нужно?", en: "How many Ultraformer MPT sessions are needed?" },
        answer: { uk: "Зазвичай 1 сесія на рік. При вираженому птозі — 2 сесії з інтервалом 6 місяців у перший рік. Ефект тримається 12–18 місяців.", ru: "Обычно 1 сессия в год. При выраженном птозе — 2 с интервалом 6 месяцев в первый год. Эффект 12–18 месяцев.", en: "Usually 1 session per year. For pronounced ptosis — 2 at 6-month intervals in year one. Effect lasts 12–18 months." },
      },
      {
        question: { uk: "Боляче робити Ultraformer MPT?", ru: "Больно ли делать Ultraformer MPT?", en: "Is Ultraformer MPT painful?" },
        answer: { uk: "Залежно від зони і порогу болю. Чоло, шия — зазвичай комфортно. Підборіддя, кути щелепи — може бути різке короткочасне відчуття. Більшість описують як «терпимо». Анестезуючий крем на 30 хв знімає більшість дискомфорту.", ru: "Зависит от зоны и болевого порога. Лоб, шея — комфортно. Подбородок — короткое резкое ощущение. Крем за 30 мин снимает дискомфорт.", en: "Depends on zone and pain threshold. Forehead and neck — comfortable. Chin — brief sharp sensation. Anaesthetic cream 30 min prior removes most discomfort." },
      },
      {
        question: { uk: "Як довго тримається результат Ultraformer MPT?", ru: "Как долго держится результат Ultraformer MPT?", en: "How long does the result last?" },
        answer: { uk: "12–18 місяців для більшості пацієнтів. Залежить від вихідного тонусу шкіри і темпу вікових змін. Регулярні сесії раз на рік сповільнюють природний птоз.", ru: "12–18 месяцев для большинства. Регулярные сессии раз в год замедляют естественный птоз.", en: "12–18 months for most patients. Annual sessions slow natural ptosis progression." },
      },
    ],
  },
];

// ─── SEEDER ──────────────────────────────────────────────────────────────────

function dbSectionType(s: AnySection): string {
  return s.type;
}

async function seedService(copy: ServiceCopy) {
  const svc = await sql`SELECT id FROM services WHERE slug = ${copy.slug} LIMIT 1`;
  if (!svc[0]) { console.error(`Service "${copy.slug}" not found — skip`); return; }
  const serviceId = svc[0].id as string;

  await sql`UPDATE services SET summary_uk=${copy.summary.uk}, summary_ru=${copy.summary.ru}, summary_en=${copy.summary.en} WHERE id=${serviceId}`;
  await sql`DELETE FROM content_sections WHERE owner_type='service' AND owner_id=${serviceId}`;
  await sql`DELETE FROM faq_items WHERE owner_type='service' AND owner_id=${serviceId}`;

  const sectionIds: string[] = [];
  for (let i = 0; i < copy.sections.length; i++) {
    const s = copy.sections[i];
    const id = randomUUID();
    sectionIds.push(id);
    const data = sectionData(s);
    const dbType = dbSectionType(s);
    await sql`
      INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
      VALUES(${id}, 'service', ${serviceId}, ${i}, ${dbType}::section_type, ${JSON.stringify(data)}::jsonb)
    `;
  }
  for (let i = 0; i < copy.faq.length; i++) {
    const f = copy.faq[i];
    await sql`INSERT INTO faq_items(owner_type,owner_id,sort_order,question_uk,question_ru,question_en,answer_uk,answer_ru,answer_en)
      VALUES('service',${serviceId},${i},${f.question.uk},${f.question.ru},${f.question.en},${f.answer.uk},${f.answer.ru},${f.answer.en})`;
  }

  const newOrder = [...sectionIds.map(id => `section:${id}`), "faq", "doctors", "equipment", "relatedServices", "finalCTA"];
  await sql`UPDATE services SET block_order=${newOrder} WHERE id=${serviceId}`;
  const types = copy.sections.map(s => s.type).join(", ");
  console.log(`✓ ${copy.slug} — [${types}], ${copy.faq.length} FAQs`);
}

async function main() {
  for (const svc of SERVICES) await seedService(svc);
  await sql.end();
  console.log("\nV3a-v2 DONE — EMFACE, VOLNEWMER, EXION, Ultraformer MPT re-seeded with section variety.");
}
main().catch(e => { console.error(e); process.exit(1); });
