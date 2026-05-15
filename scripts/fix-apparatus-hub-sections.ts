/**
 * Fix apparatus hub pages section order + gallery type
 * Correct TZ order: richText → callout → indicationsContraindications → steps → bullets → showcaseGallery
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

const CATEGORY_ID = "ecc57f42-24cd-419e-bb32-f427795283f1";

type L = { uk: string; ru: string; en: string };

// Shared clinic gallery — same across all TZ pages
const CLINIC_GALLERY = {
  heading: { uk: "Атмосфера клініки GENEVITY", ru: "Атмосфера клиники GENEVITY", en: "GENEVITY Clinic Atmosphere" },
  subtitle: { uk: "", ru: "", en: "" },
  images: [
    {
      url: "/images/interior/SEMI7509.jpg", span: "1", focalPoint: "50% 50%",
      title: { uk: "Рецепція", ru: "Рецепция", en: "Reception" },
      subtitle: { uk: "Ваша подорож до краси починається тут", ru: "Ваше путешествие к красоте начинается здесь", en: "Your journey to beauty begins here" },
      alt: { uk: "Рецепція клініки GENEVITY", ru: "Рецепция клиники GENEVITY", en: "GENEVITY clinic reception" },
    },
    {
      url: "/images/interior/SEMI1737-HDR.jpg", span: "1", focalPoint: "50% 50%",
      title: { uk: "Денний стаціонар", ru: "Дневной стационар", en: "Day Stationary" },
      subtitle: { uk: "Відновлення у розкішному спокої", ru: "Восстановление в роскошном спокойствии", en: "Recovery in luxurious calm" },
      alt: { uk: "Денний стаціонар GENEVITY", ru: "Дневной стационар GENEVITY", en: "GENEVITY day stationary" },
    },
    {
      url: "/images/interior/SEMI1281-HDR.jpg", span: "1", focalPoint: "50% 50%",
      title: { uk: "Атмосфера клініки", ru: "Атмосфера клиники", en: "Clinic Ambiance" },
      subtitle: { uk: "Естетика у кожній деталі інтер'єру", ru: "Эстетика в каждой детали интерьера", en: "Aesthetics in every interior detail" },
      alt: { uk: "Коридор клініки GENEVITY", ru: "Коридор клиники GENEVITY", en: "GENEVITY clinic hallway" },
    },
    {
      url: "/images/interior/EMFACE и EMSculpt.jpg", span: "1", focalPoint: "50% 50%",
      title: { uk: "Процедурний кабінет", ru: "Процедурный кабинет", en: "Treatment Room" },
      subtitle: { uk: "Сучасне обладнання для точних результатів", ru: "Современное оборудование для точных результатов", en: "Advanced equipment for precise results" },
      alt: { uk: "Процедурний кабінет GENEVITY", ru: "Процедурный кабинет GENEVITY", en: "GENEVITY treatment room" },
    },
    {
      url: "/clinic/hydrafacial.webp", span: "1", focalPoint: "50% 50%",
      title: { uk: "Кабінет краси", ru: "Кабинет красоты", en: "Beauty Suite" },
      subtitle: { uk: "Комфорт і медична точність в одному просторі", ru: "Комфорт и медицинская точность в одном пространстве", en: "Comfort and clinical precision in one space" },
      alt: { uk: "Кабінет краси GENEVITY", ru: "Кабинет красоты GENEVITY", en: "GENEVITY beauty suite" },
    },
    {
      url: "/images/interior/SEMI1276-HDR.jpg", span: "1", focalPoint: "50% 50%",
      title: { uk: "Вхідна зона", ru: "Входная зона", en: "Entrance Hall" },
      subtitle: { uk: "Перше враження — завжди бездоганне", ru: "Первое впечатление — всегда безупречное", en: "A first impression that's always impeccable" },
      alt: { uk: "Вхідна зона клініки GENEVITY", ru: "Входная зона клиники GENEVITY", en: "GENEVITY clinic entrance" },
    },
  ],
};

interface RawSection {
  type: string;
  data: object;
}

// ─── FACE sections in correct TZ order ───────────────────────────────────────
const faceSections: RawSection[] = [
  {
    type: "richText",
    data: {
      heading: { uk: "Апаратна косметологія для обличчя: сучасний підхід без скальпеля", ru: "Аппаратная косметология для лица: современный подход без скальпеля", en: "Advanced Facial Treatments: Modern Approach Without Surgery" },
      body: { uk: "Апаратна косметологія для обличчя — це клас медичних процедур, що використовують контрольовану енергію (ультразвук, радіочастоти, електромагнітні поля, фотони) для досягнення ліфтингового, омолоджуючого або відновлювального ефекту без хірургічного втручання.\n\nУ клініці GENEVITY в Дніпрі представлено шість сертифікованих апаратів для роботи з обличчям: EMFACE — єдиний пристрій, що одночасно зміцнює м'язи та шкіру обличчя за допомогою RF та HIFES™; VOLNEWMER — безконтактна радіочастотна терапія глибиною до 6 мм для ліфтингу СМАС-шару; EXION — монополярний RF з мікроголковою фракційною насадкою та ін'єкцією гіалуронової кислоти без голки; Ultraformer MPT — HIFU-ліфтинг SMAS-шару з ефектом 12–18 місяців після одного сеансу; HydraFacial — чотириетапне глибоке очищення, ексфоліація та зволоження; M22 Stellar Black — IPL-фотоомолодження та корекція судин і пігментації.\n\nПеревага апаратного підходу — передбачуваний, відтворюваний результат, підкріплений клінічними дослідженнями виробника. Кожен апарат в GENEVITY сертифікований та використовується лікарями-косметологами з медичною освітою. Перед будь-якою процедурою проводиться консультація, на якій лікар оцінює стан шкіри, показання та можливі обмеження.\n\nАпаратні методи добре поєднуються між собою та з ін'єкційними процедурами (ботулінотерапія, біоревіталізація, контурна пластика). Правильна комбінація дозволяє досягти комплексного результату, недоступного при використанні лише одного методу.", ru: "Аппаратная косметология для лица — это класс медицинских процедур, использующих контролируемую энергию (ультразвук, радиочастоты, электромагнитные поля, фотоны) для достижения лифтингового, омолаживающего или восстановительного эффекта без хирургического вмешательства.\n\nВ клинике GENEVITY в Днепре представлено шесть сертифицированных аппаратов для работы с лицом: EMFACE — единственное устройство, одновременно укрепляющее мышцы и кожу лица с помощью RF и HIFES™; VOLNEWMER — бесконтактная радиочастотная терапия глубиной до 6 мм для лифтинга СМАС-слоя; EXION — монополярный RF с микроигольчатой фракционной насадкой и введением гиалуроновой кислоты без иглы; Ultraformer MPT — HIFU-лифтинг СМАС-слоя с эффектом 12–18 месяцев после одного сеанса; HydraFacial — четырёхэтапное глубокое очищение, эксфолиация и увлажнение; M22 Stellar Black — IPL-фотоомоложение и коррекция сосудов и пигментации.\n\nПреимущество аппаратного подхода — предсказуемый, воспроизводимый результат, подкреплённый клиническими исследованиями производителя. Каждый аппарат в GENEVITY сертифицирован и используется врачами-косметологами с медицинским образованием. Перед любой процедурой проводится консультация, на которой врач оценивает состояние кожи, показания и возможные ограничения.\n\nАппаратные методы хорошо сочетаются между собой и с инъекционными процедурами (ботулинотерапия, биоревитализация, контурная пластика). Правильная комбинация позволяет достичь комплексного результата, недоступного при использовании только одного метода.", en: "Advanced facial aesthetic treatments are a class of medical procedures using controlled energy (ultrasound, radiofrequency, electromagnetic fields, photons) to achieve lifting, rejuvenating or restorative effects without surgery.\n\nGENEVITY clinic in Dnipro offers six certified devices for facial work: EMFACE — the only device that simultaneously strengthens muscles and skin using RF and HIFES™; VOLNEWMER — contactless radiofrequency therapy reaching 6 mm depth for SMAS-layer lifting; EXION — monopolar RF with fractional micro-needling and needle-free hyaluronic acid delivery; Ultraformer MPT — HIFU lifting of the SMAS layer with results lasting 12–18 months after a single session; HydraFacial — four-step deep cleansing, exfoliation and hydration; M22 Stellar Black — IPL photorejuvenation and vascular/pigmentation correction.\n\nThe advantage of the device-based approach is predictable, reproducible results backed by manufacturer clinical research. Every device at GENEVITY is certified and operated by doctors with medical qualifications. A consultation precedes every procedure, assessing skin condition, indications and contraindications.\n\nDevice treatments combine well with each other and with injectables (botulinum therapy, biorevitalisation, fillers). The right combination delivers a comprehensive outcome unachievable with a single method alone." },
    },
  },
  {
    type: "callout",
    data: {
      tone: "success",
      body: { uk: "Усі апарати в GENEVITY — сертифіковані медичні пристрої з доведеною клінічною ефективністю. Процедури виконують лікарі-косметологи з вищою медичною освітою. EMFACE: −23% зморшок, +37% тонусу м'язів. Ultraformer MPT: ефект 12–18 місяців. EXION: введення гіалуронової кислоти без голки.", ru: "Все аппараты в GENEVITY — сертифицированные медицинские устройства с доказанной клинической эффективностью. Процедуры выполняют врачи-косметологи с высшим медицинским образованием. EMFACE: −23% морщин, +37% тонуса мышц. Ultraformer MPT: эффект 12–18 месяцев. EXION: введение гиалуроновой кислоты без иглы.", en: "All devices at GENEVITY are certified medical-grade equipment with proven clinical efficacy. Procedures are performed by doctors with medical degrees. EMFACE: −23% wrinkles, +37% muscle tone. Ultraformer MPT: results lasting 12–18 months. EXION: needle-free hyaluronic acid delivery." },
    },
  },
  {
    type: "indicationsContraindications",
    data: {
      indicationsHeading: { uk: "Показання до апаратної косметології обличчя", ru: "Показания к аппаратной косметологии лица", en: "Indications for Facial Device Treatments" },
      indications: [
        { uk: "Зниження тонусу та птоз шкіри обличчя та шиї", ru: "Снижение тонуса и птоз кожи лица и шеи", en: "Reduced skin tone and facial/neck ptosis" },
        { uk: "Зморшки та складки (лоб, носогубні, зморшки марионетки)", ru: "Морщины и складки (лоб, носогубные, морщины марионетки)", en: "Wrinkles and folds (forehead, nasolabial, marionette lines)" },
        { uk: "Нечіткий контур нижньої третини, подвійне підборіддя", ru: "Нечёткий контур нижней трети, двойной подбородок", en: "Undefined lower-face contour, double chin" },
        { uk: "Пігментні плями, нерівномірний тон шкіри", ru: "Пигментные пятна, неровный тон кожи", en: "Pigmentation spots, uneven skin tone" },
        { uk: "Розширені судини обличчя (купероз, розацеа)", ru: "Расширенные сосуды лица (купероз, розацеа)", en: "Facial vascular concerns (rosacea, couperose)" },
        { uk: "Знижена зволоженість, тьмяність та втомлений вигляд шкіри", ru: "Сниженная увлажнённость, тусклость и усталый вид кожи", en: "Dehydration, dullness and fatigued skin appearance" },
        { uk: "Профілактика вікових змін починаючи з 25 років", ru: "Профилактика возрастных изменений начиная с 25 лет", en: "Prevention of age-related changes from age 25" },
      ],
      contraindicationsHeading: { uk: "Протипоказання (загальні)", ru: "Противопоказания (общие)", en: "General Contraindications" },
      contraindications: [
        { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
        { uk: "Металеві імпланти, кардіостимулятори, нейростимулятори у зоні дії апарата", ru: "Металлические импланты, кардиостимуляторы, нейростимуляторы в зоне действия аппарата", en: "Metal implants, pacemakers, neurostimulators in the treatment area" },
        { uk: "Онкологічні захворювання в активній стадії", ru: "Онкологические заболевания в активной стадии", en: "Active oncological conditions" },
        { uk: "Гострі запальні процеси шкіри у зоні обробки", ru: "Острые воспалительные процессы кожи в зоне обработки", en: "Acute skin inflammation in the treatment area" },
        { uk: "Індивідуальні протипоказання уточнюються лікарем на консультації", ru: "Индивидуальные противопоказания уточняются врачом на консультации", en: "Individual contraindications are confirmed by the doctor at consultation" },
      ],
    },
  },
  {
    type: "steps",
    data: {
      heading: { uk: "Як обрати процедуру: алгоритм підбору", ru: "Как выбрать процедуру: алгоритм подбора", en: "How to Choose the Right Procedure" },
      steps: [
        { title: { uk: "Консультація лікаря-косметолога", ru: "Консультация врача-косметолога", en: "Consultation with a cosmetic doctor" }, body: { uk: "Лікар оцінює тип шкіри, ступінь птозу, наявність пігментних змін, судинних проблем та тонус м'язів. На основі аналізу формує персональний план процедур.", ru: "Врач оценивает тип кожи, степень птоза, пигментные изменения, сосудистые проблемы и тонус мышц. На основе анализа формирует персональный план процедур.", en: "The doctor evaluates skin type, ptosis degree, pigmentation, vascular issues and muscle tone, then builds a personalised treatment plan." } },
        { title: { uk: "Монопроцедура або комбінована програма", ru: "Монопроцедура или комбинированная программа", en: "Single treatment or combined programme" }, body: { uk: "Для початку можна обрати одну процедуру. Якщо завдань декілька (ліфтинг + текстура + пігментація), лікар складе послідовну програму — апарати можна поєднувати без шкоди для результату.", ru: "Для начала можно выбрать одну процедуру. Если задач несколько (лифтинг + текстура + пигментация), врач составит последовательную программу — аппараты можно сочетать без вреда для результата.", en: "You may start with a single procedure. For multiple goals (lifting + texture + pigmentation), the doctor builds a sequential programme — devices combine safely." } },
        { title: { uk: "Проведення процедури та контроль результату", ru: "Проведение процедуры и контроль результата", en: "Treatment and result monitoring" }, body: { uk: "Процедура проводиться лікарем у медичному кабінеті. Після сеансу лікар дає рекомендації щодо домашнього догляду та графіку наступних відвідувань.", ru: "Процедура выполняется врачом в медицинском кабинете. После сеанса врач даёт рекомендации по домашнему уходу и графику следующих визитов.", en: "The procedure is performed by the doctor in a medical treatment room. Afterwards home care instructions and follow-up scheduling are provided." } },
        { title: { uk: "Підтримуючі сеанси", ru: "Поддерживающие сеансы", en: "Maintenance sessions" }, body: { uk: "Ефект від більшості апаратних процедур зберігається 6–18 місяців. Підтримуючий протокол (1–2 рази на рік) дозволяє пролонгувати результат та запобігти накопиченню вікових змін.", ru: "Эффект от большинства аппаратных процедур сохраняется 6–18 месяцев. Поддерживающий протокол (1–2 раза в год) позволяет продлить результат и предотвратить накопление возрастных изменений.", en: "Most device treatments last 6–18 months. A maintenance protocol (1–2 times a year) prolongs results and prevents the accumulation of age-related changes." } },
      ],
    },
  },
  {
    type: "bullets",
    data: {
      heading: { uk: "Апарати для обличчя в GENEVITY та їхні можливості", ru: "Аппараты для лица в GENEVITY и их возможности", en: "Facial Devices at GENEVITY and What They Deliver" },
      items: [
        { uk: "EMFACE (BTL) — синхронізований RF + HIFES™: ліфтинг м'язів та шкіри за 20 хв, без голок. −23% зморшок, +37% тонусу м'язів, +26% колагену.", ru: "EMFACE (BTL) — синхронизированный RF + HIFES™: лифтинг мышц и кожи за 20 мин, без игл. −23% морщин, +37% тонуса мышц, +26% коллагена.", en: "EMFACE (BTL) — synchronised RF + HIFES™: muscle and skin lifting in 20 min, needle-free. −23% wrinkles, +37% muscle tone, +26% collagen." },
        { uk: "VOLNEWMER — безконтактний RF-ліфтинг до 6 мм глибини: зміцнює СМАС-шар, підтягує овал, без болю та реабілітації.", ru: "VOLNEWMER — бесконтактный RF-лифтинг до 6 мм глубины: укрепляет СМАС-слой, подтягивает овал, без боли и реабилитации.", en: "VOLNEWMER — contactless RF lifting to 6 mm depth: tightens SMAS layer, lifts facial contour, no pain or downtime." },
        { uk: "EXION (Syneron-Candela) — монополярний RF + мікроголки: колагенез, текстурний ремоделінг, доставка гіалуронової кислоти до 4 мм без ін'єкцій.", ru: "EXION (Syneron-Candela) — монополярный RF + микроиглы: коллагенез, текстурный ремоделинг, доставка гиалуроновой кислоты до 4 мм без инъекций.", en: "EXION (Syneron-Candela) — monopolar RF + micro-needles: collagenesis, texture remodelling, hyaluronic acid delivery to 4 mm depth needle-free." },
        { uk: "Ultraformer MPT (Classys) — HIFU мікро- та макрофокусований ультразвук: SMAS-ліфтинг, ефект 12–18 місяців після 1 процедури.", ru: "Ultraformer MPT (Classys) — HIFU микро- и макрофокусированный ультразвук: SMAS-лифтинг, эффект 12–18 месяцев после 1 процедуры.", en: "Ultraformer MPT (Classys) — HIFU micro and macro-focused ultrasound: SMAS lifting, results lasting 12–18 months after a single procedure." },
        { uk: "HydraFacial — 4-етапний протокол: очищення, ексфоліація, вакуумне видалення комедонів, насичення сироватками. Підходить всім типам шкіри, нульовий відновний період.", ru: "HydraFacial — 4-этапный протокол: очищение, эксфолиация, вакуумное удаление комедонов, насыщение сыворотками. Подходит всем типам кожи, нулевой восстановительный период.", en: "HydraFacial — 4-step protocol: cleansing, exfoliation, vacuum comedone extraction, serum infusion. All skin types, zero downtime." },
        { uk: "M22 Stellar Black (Lumenis) — IPL + OPT: рівномірний тон, видалення пігментних плям, корекція розширених судин, поліпшення текстури шкіри.", ru: "M22 Stellar Black (Lumenis) — IPL + OPT: равномерный тон, удаление пигментных пятен, коррекция расширенных сосудов, улучшение текстуры кожи.", en: "M22 Stellar Black (Lumenis) — IPL + OPT: even skin tone, pigment spot removal, vascular correction, texture improvement." },
      ],
    },
  },
  { type: "showcaseGallery", data: CLINIC_GALLERY },
];

// ─── BODY sections in correct TZ order ───────────────────────────────────────
const bodySections: RawSection[] = [
  {
    type: "richText",
    data: {
      heading: { uk: "Апаратна корекція тіла: спалити жир, наростити м'язи, підтягнути шкіру", ru: "Аппаратная коррекция тела: сжечь жир, нарастить мышцы, подтянуть кожу", en: "Body Contouring: Burn Fat, Build Muscle, Tighten Skin" },
      body: { uk: "Апаратна корекція тіла в GENEVITY — це медичний підхід до скульптурування фігури без хірургії, ліпосакції та тривалого відновлення. Три апарати клініки охоплюють різні завдання та механізми дії, дозволяючи підібрати оптимальне рішення або скласти комплексну програму.\n\nEMSCULPT NEO (BTL) — єдиний у світі апарат, що одночасно знищує жирові клітини та нарощує м'язовий об'єм. Технологія HIFEM® викликає 20 000+ надінтенсивних м'язових скорочень за 30 хвилин — ефект, недоступний жодним тренуванням. Синхронна RF-складова розігріває та руйнує жирові клітини через апоптоз. Клінічні дані виробника: −30% жиру, +25% м'язової маси після стандартного курсу із 4 сеансів. Доступні зони: живіт, сідниці, стегна, руки, литки.\n\nUltraformer MPT Body (Classys) — HIFU-технологія для підтягування шкіри та знищення підшкірного жиру на тілі. Апарат адресно впливає на поверхневий та глибокий жировий шар, запускаючи термоліз адипоцитів. Результат — зменшення об'ємів та покращення тонусу шкіри в зоні живота, боків, стегон і внутрішньої поверхні рук.\n\nEXION Body (Syneron-Candela) — монополярний радіочастотний апарат для ремоделінгу шкіри тіла. RF-енергія стимулює неоколагенез у дермі, підвищуючи щільність та еластичність шкіри. Особливо ефективний при целюліті та в'ялості шкіри після схуднення або пологів.\n\nТри апарати можна комбінувати: EMSCULPT NEO для жиру та м'язів, Ultraformer MPT Body для об'ємів, EXION Body для якості шкіри.", ru: "Аппаратная коррекция тела в GENEVITY — это медицинский подход к скульптурированию фигуры без хирургии, липосакции и длительного восстановления. Три аппарата клиники охватывают разные задачи и механизмы действия, позволяя подобрать оптимальное решение или составить комплексную программу.\n\nEMSCULPT NEO (BTL) — единственный в мире аппарат, одновременно уничтожающий жировые клетки и наращивающий мышечный объём. Технология HIFEM® вызывает 20 000+ сверхинтенсивных мышечных сокращений за 30 минут — эффект, недостижимый ни одной тренировкой. Синхронная RF-составляющая разогревает и разрушает жировые клетки через апоптоз. Клинические данные производителя: −30% жира, +25% мышечной массы после стандартного курса из 4 сеансов. Доступные зоны: живот, ягодицы, бёдра, руки, икры.\n\nUltraformer MPT Body (Classys) — HIFU-технология для подтяжки кожи и уничтожения подкожного жира на теле. Аппарат адресно воздействует на поверхностный и глубокий жировой слой, запуская термолиз адипоцитов. Результат — уменьшение объёмов и улучшение тонуса кожи в зоне живота, боков, бёдер и внутренней поверхности рук.\n\nEXION Body (Syneron-Candela) — монополярный радиочастотный аппарат для ремоделирования кожи тела. RF-энергия стимулирует неоколлагенез в дерме, повышая плотность и эластичность кожи. Особенно эффективен при целлюлите и дряблости кожи после похудения или родов.\n\nТри аппарата можно комбинировать: EMSCULPT NEO для жира и мышц, Ultraformer MPT Body для объёмов, EXION Body для качества кожи.", en: "Body contouring at GENEVITY is a medical approach to figure sculpting without surgery, liposuction or prolonged recovery. Three clinic devices cover different goals and mechanisms, allowing you to choose the optimal solution or build a comprehensive programme.\n\nEMSCULPT NEO (BTL) is the world's only device that simultaneously eliminates fat cells and builds muscle mass. HIFEM® technology triggers 20,000+ supramaximal muscle contractions in 30 minutes — unachievable by any workout. The synchronised RF component heats and destroys fat cells through apoptosis. Manufacturer clinical data: −30% fat, +25% muscle mass after the standard 4-session course. Treatment zones: abdomen, buttocks, thighs, arms, calves.\n\nUltraformer MPT Body (Classys) uses HIFU technology for skin tightening and subcutaneous fat reduction. The device precisely targets the superficial and deep fat layers, triggering adipocyte thermolysis. Results include volume reduction and improved skin tone in the abdomen, flanks, thighs and inner arms.\n\nEXION Body (Syneron-Candela) is a monopolar radiofrequency device for body skin remodelling. RF energy stimulates neocollagenesis in the dermis, increasing density and elasticity. Particularly effective for cellulite and loose skin after weight loss or childbirth.\n\nAll three devices combine synergistically: EMSCULPT NEO for fat and muscle, Ultraformer MPT Body for volume, EXION Body for skin quality." },
    },
  },
  {
    type: "callout",
    data: {
      tone: "info",
      body: { uk: "EMSCULPT NEO — єдина процедура, яка одночасно спалює жир І нарощує м'язи. За 30 хвилин апарат викликає понад 20 000 надінтенсивних м'язових скорочень та руйнує жирові клітини через апоптоз. Клінічний результат: −30% жиру, +25% м'язового об'єму.", ru: "EMSCULPT NEO — единственная процедура, которая одновременно сжигает жир И наращивает мышцы. За 30 минут аппарат вызывает более 20 000 сверхинтенсивных мышечных сокращений и разрушает жировые клетки через апоптоз. Клинический результат: −30% жира, +25% мышечного объёма.", en: "EMSCULPT NEO is the only procedure that simultaneously burns fat AND builds muscle. In 30 minutes it induces over 20,000 supramaximal muscle contractions and destroys fat cells through apoptosis. Clinical result: −30% fat, +25% muscle volume." },
    },
  },
  {
    type: "indicationsContraindications",
    data: {
      indicationsHeading: { uk: "Показання до апаратної корекції тіла", ru: "Показания к аппаратной коррекции тела", en: "Indications for Body Device Treatments" },
      indications: [
        { uk: "Локальний ліпоматоз (жирові депо, що не піддаються дієті та тренуванням)", ru: "Локальный липоматоз (жировые депо, не поддающиеся диете и тренировкам)", en: "Localised lipomatosis (fat deposits resistant to diet and exercise)" },
        { uk: "Діастаз прямих м'язів живота", ru: "Диастаз прямых мышц живота", en: "Rectus abdominis diastasis" },
        { uk: "Зниження тонусу м'язів сідниць, стегон, живота та рук", ru: "Снижение тонуса мышц ягодиц, бёдер, живота и рук", en: "Reduced muscle tone in buttocks, thighs, abdomen and arms" },
        { uk: "В'яла шкіра тіла, стрії та целюліт", ru: "Дряблая кожа тела, стрии и целлюлит", en: "Body skin laxity, stretch marks and cellulite" },
        { uk: "Бажання збільшити об'єм м'язів або підтягнути силует без хірургії", ru: "Желание увеличить объём мышц или подтянуть силуэт без хирургии", en: "Desire to increase muscle volume or reshape the silhouette without surgery" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Металеві імпланти, кардіостимулятори, нейростимулятори в зоні обробки", ru: "Металлические импланты, кардиостимуляторы, нейростимуляторы в зоне обработки", en: "Metal implants, pacemakers, neurostimulators in the treatment area" },
        { uk: "Вагітність і лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
        { uk: "Грижа в зоні обробки (для EMSCULPT NEO)", ru: "Грыжа в зоне обработки (для EMSCULPT NEO)", en: "Hernia in the treatment area (for EMSCULPT NEO)" },
        { uk: "Онкологічні захворювання", ru: "Онкологические заболевания", en: "Active oncological conditions" },
        { uk: "Гострі запальні або шкірні захворювання в зоні обробки", ru: "Острые воспалительные или кожные заболевания в зоне обработки", en: "Acute inflammatory or skin conditions in the treatment area" },
      ],
    },
  },
  {
    type: "steps",
    data: {
      heading: { uk: "Як відбувається програма корекції тіла в GENEVITY", ru: "Как проходит программа коррекции тела в GENEVITY", en: "How the Body Contouring Programme Works at GENEVITY" },
      steps: [
        { title: { uk: "Консультація та складання програми", ru: "Консультация и составление программы", en: "Consultation and programme design" }, body: { uk: "Лікар оцінює зони корекції, ІМТ, тонус м'язів та стан шкіри. Підбирає один або кілька апаратів, визначає кількість сеансів та їхню послідовність.", ru: "Врач оценивает зоны коррекции, ИМТ, тонус мышц и состояние кожи. Подбирает один или несколько аппаратов, определяет количество сеансов и их последовательность.", en: "The doctor assesses correction zones, BMI, muscle tone and skin condition, then selects devices and defines the session count and sequence." } },
        { title: { uk: "Курс процедур (4–6 сеансів)", ru: "Курс процедур (4–6 сеансов)", en: "Treatment course (4–6 sessions)" }, body: { uk: "Сеанси проводяться з інтервалом 5–10 днів. Після курсу жирові клітини виводяться природним шляхом, а м'язовий об'єм і тонус шкіри продовжують покращуватися 2–3 місяці.", ru: "Сеансы проводятся с интервалом 5–10 дней. После курса жировые клетки постепенно выводятся естественным путём, а мышечный объём и тонус кожи продолжают улучшаться 2–3 месяца.", en: "Sessions are spaced 5–10 days apart. After the course, fat cells are gradually eliminated naturally while muscle volume and skin tone continue improving for 2–3 months." } },
        { title: { uk: "Оцінка результату та підтримуюча програма", ru: "Оценка результата и поддерживающая программа", en: "Result assessment and maintenance programme" }, body: { uk: "Через 2–3 місяці після курсу лікар оцінює результат. При необхідності призначаються підтримуючі сеанси 1–2 рази на рік для збереження ефекту.", ru: "Через 2–3 месяца после курса врач оценивает результат. При необходимости назначаются поддерживающие сеансы 1–2 раза в год для сохранения эффекта.", en: "2–3 months after the course the doctor assesses results. Maintenance sessions (1–2 per year) are prescribed as needed to sustain the effect." } },
      ],
    },
  },
  {
    type: "bullets",
    data: {
      heading: { uk: "Що вирішує апаратна корекція тіла", ru: "Что решает аппаратная коррекция тела", en: "What Body Device Treatments Can Address" },
      items: [
        { uk: "Локальні жирові відкладення (живіт, стегна, боки, руки, коліна) — без хірургії та тривалого відновлення", ru: "Локальные жировые отложения (живот, бёдра, бока, руки, колени) — без хирургии и длительного восстановления", en: "Localised fat deposits (abdomen, thighs, flanks, arms, knees) — without surgery or lengthy recovery" },
        { uk: "Слабкість м'язів живота та діастаз після пологів або малорухливого способу життя", ru: "Слабость мышц живота и диастаз после родов или малоподвижного образа жизни", en: "Weak abdominal muscles and diastasis after childbirth or sedentary lifestyle" },
        { uk: "Підтягнути та зміцнити сідниці без імплантів і операцій", ru: "Подтянуть и укрепить ягодицы без имплантов и операций", en: "Lift and firm buttocks without implants or surgery" },
        { uk: "В'яла шкіра після схуднення або вагітності — підвищити тонус та еластичність", ru: "Дряблая кожа после похудения или беременности — повысить тонус и эластичность", en: "Loose skin after weight loss or pregnancy — restore tone and elasticity" },
        { uk: "Целюліт — поліпшити рельєф, мікроциркуляцію та якість шкіри", ru: "Целлюлит — улучшить рельеф, микроциркуляцию и качество кожи", en: "Cellulite — improve texture, microcirculation and skin quality" },
        { uk: "Бажання сформувати м'язовий рельєф швидше та ефективніше, ніж у спортзалі", ru: "Желание сформировать мышечный рельеф быстрее и эффективнее, чем в спортзале", en: "Goal to define muscle contour faster and more effectively than gym training alone" },
      ],
    },
  },
  { type: "showcaseGallery", data: CLINIC_GALLERY },
];

// ─── SKIN sections in correct TZ order ───────────────────────────────────────
const skinSections: RawSection[] = [
  {
    type: "richText",
    data: {
      heading: { uk: "AcuPulse CO₂ та M22 Stellar Black — лазерне та IPL-лікування шкіри в GENEVITY", ru: "AcuPulse CO₂ и M22 Stellar Black — лазерное и IPL-лечение кожи в GENEVITY", en: "AcuPulse CO₂ and M22 Stellar Black — Laser and IPL Skin Treatment at GENEVITY" },
      body: { uk: "Проблеми шкіри — акне-шрами, пігментні плями, судинні сітки, нерівна текстура — довгий час вважалися незворотними або потребували агресивних хімічних пілінгів та хірургічних методів. Апарати AcuPulse CO₂ та M22 Stellar Black від Lumenis змінили цей підхід: більшість дефектів шкіри тепер вирішується прецизійними медичними лазерами без тривалого відновлення та ризику пігментних ускладнень.\n\nAcuPulse CO₂ — фракційний вуглекислотний лазер нового покоління від Lumenis. Лазерний промінь створює мікроскопічні зони теплового впливу (МТЗ) у дермі, запускаючи природний механізм регенерації та синтезу нового колагену. Навколишня незачеплена шкіра прискорює загоєння, забезпечуючи ефект «шліфування» без суцільного ранового покриття. Ефективний при атрофічних шрамах від акне (льодоруб, рухомі, кочані), постопераційних рубцях, зморшках, нерівній текстурі та млявості шкіри. Клінічні дослідження: зменшення глибини атрофічних шрамів на 50–70% після 2–3 сеансів.\n\nM22 Stellar Black (Lumenis) — мультиплатформна система IPL + ResurFX. IPL (Intense Pulsed Light) знищує меланін у пігментних плямах та оксигемоглобін у розширених судинах без пошкодження навколишньої шкіри. Золотий стандарт для фотоомолодження, лікування куперозу та розацеа, корекції веснянок та мелазми. Модуль ResurFX — фракційна насадка для стимуляції колагену та усунення дрібних шрамів.\n\nВ GENEVITY обидва апарати використовуються лікарями з досвідом у дерматокосметології. Вибір між CO₂ і IPL залежить від типу проблеми, тону шкіри та бажаного часу відновлення — лікар визначає на консультації.", ru: "Проблемы кожи — шрамы от акне, пигментные пятна, сосудистые сеточки, неровная текстура — долгое время считались необратимыми или требовали агрессивных химических пилингов и хирургических методов. Аппараты AcuPulse CO₂ и M22 Stellar Black от Lumenis изменили этот подход: большинство дефектов кожи теперь решается прецизионными медицинскими лазерами без длительного восстановления и риска пигментных осложнений.\n\nAcuPulse CO₂ — фракционный углекислотный лазер нового поколения от Lumenis. Лазерный луч создаёт микроскопические зоны теплового воздействия (МТЗ) в дерме, запуская естественный механизм регенерации и синтеза нового коллагена. Окружающая неповреждённая кожа ускоряет заживление, обеспечивая эффект «шлифовки» без сплошного раневого покрытия. Эффективен при атрофических шрамах от акне (ледоруб, подвижные, волнистые), послеоперационных рубцах, морщинах, неровной текстуре и дряблости кожи. Клинические исследования: уменьшение глубины атрофических шрамов на 50–70% после 2–3 сеансов.\n\nM22 Stellar Black (Lumenis) — мультиплатформная система IPL + ResurFX. IPL (Intense Pulsed Light) уничтожает меланин в пигментных пятнах и оксигемоглобин в расширенных сосудах без повреждения окружающей кожи. Золотой стандарт для фотоомоложения, лечения купероза и розацеа, коррекции веснушек и мелазмы. Модуль ResurFX — фракционная насадка для стимуляции коллагена и устранения мелких шрамов.\n\nВ GENEVITY оба аппарата используются врачами с опытом в дерматокосметологии. Выбор между CO₂ и IPL зависит от типа проблемы, тона кожи и желаемого времени восстановления — врач определяет на консультации.", en: "Skin problems — acne scars, pigmentation spots, vascular networks, uneven texture — were long considered irreversible or requiring aggressive peels and surgical methods. AcuPulse CO₂ and M22 Stellar Black from Lumenis have changed this: most skin defects can now be addressed with precision medical lasers without prolonged recovery or pigmentation complications.\n\nAcuPulse CO₂ is a next-generation fractional CO₂ laser from Lumenis. The laser beam creates microscopic thermal injury zones (MTZ) in the dermis, activating natural regeneration and new collagen synthesis. Surrounding intact skin accelerates healing, delivering a resurfacing effect without a full wound surface. Effective for atrophic acne scars (ice-pick, rolling, boxcar), post-surgical scars, wrinkles, uneven texture and skin laxity. Clinical research: 50–70% reduction in atrophic scar depth after 2–3 sessions.\n\nM22 Stellar Black (Lumenis) is a multi-platform IPL + ResurFX system. IPL destroys melanin in pigmentation spots and oxyhaemoglobin in dilated vessels without damaging surrounding skin. Gold standard for photorejuvenation, rosacea and couperose treatment, freckle and melasma correction. The ResurFX module is a fractional attachment for collagen stimulation and minor scar correction.\n\nAt GENEVITY both devices are operated by doctors with dermatocosmology experience. The choice between CO₂ and IPL depends on the problem type, skin tone and desired recovery time — determined by the doctor at consultation." },
    },
  },
  {
    type: "callout",
    data: {
      tone: "info",
      body: { uk: "AcuPulse CO₂ — золотий стандарт для шліфування шрамів від акне у світовій дерматологічній практиці. Клінічні дослідження Lumenis: зменшення глибини атрофічних шрамів на 50–70% після 2–3 сеансів. M22 IPL — золотий стандарт для фотоомолодження та лікування судинних і пігментних змін.", ru: "AcuPulse CO₂ — золотой стандарт для шлифовки шрамов от акне в мировой дерматологической практике. Клинические исследования Lumenis: уменьшение глубины атрофических шрамов на 50–70% после 2–3 сеансов. M22 IPL — золотой стандарт для фотоомоложения и лечения сосудистых и пигментных изменений.", en: "AcuPulse CO₂ is the gold standard for acne scar resurfacing in global dermatology practice. Lumenis clinical studies: 50–70% reduction in atrophic scar depth after 2–3 sessions. M22 IPL is the gold standard for photorejuvenation and treatment of vascular and pigmentation concerns." },
    },
  },
  {
    type: "indicationsContraindications",
    data: {
      indicationsHeading: { uk: "Показання до лазерного та IPL-лікування шкіри", ru: "Показания к лазерному и IPL-лечению кожи", en: "Indications for Laser and IPL Skin Treatment" },
      indications: [
        { uk: "Шрами від акне (атрофічні: льодоруб, рухомі, кочані; гіпертрофічні)", ru: "Шрамы от акне (атрофические: ледоруб, подвижные, волнистые; гипертрофические)", en: "Acne scars (atrophic: ice-pick, rolling, boxcar; hypertrophic)" },
        { uk: "Постопераційні та травматичні рубці", ru: "Послеоперационные и травматические рубцы", en: "Post-surgical and traumatic scars" },
        { uk: "Пігментні плями: веснянки, лентиго, мелазма, постзапальна пігментація", ru: "Пигментные пятна: веснушки, лентиго, мелазма, постзапалительная пигментация", en: "Pigmentation: freckles, lentigo, melasma, post-inflammatory hyperpigmentation" },
        { uk: "Купероз, розширені судини та розацеа", ru: "Купероз, расширенные сосуды и розацеа", en: "Couperose, dilated vessels and rosacea" },
        { uk: "Фотостаріння, нерівна текстура та дрібні зморшки", ru: "Фотостарение, неровная текстура и мелкие морщины", en: "Photoageing, uneven texture and fine wrinkles" },
      ],
      contraindicationsHeading: { uk: "Протипоказання", ru: "Противопоказания", en: "Contraindications" },
      contraindications: [
        { uk: "Активна фаза акне або запалення у зоні обробки", ru: "Активная фаза акне или воспаления в зоне обработки", en: "Active acne or inflammation in the treatment area" },
        { uk: "Засмага або темний фототип шкіри (IV–VI) без попередньої підготовки для IPL", ru: "Загар или тёмный фототип кожи (IV–VI) без предварительной подготовки для IPL", en: "Tan or dark skin phototype (IV–VI) without prior preparation for IPL" },
        { uk: "Вагітність та лактація", ru: "Беременность и лактация", en: "Pregnancy and breastfeeding" },
        { uk: "Прийом ізотретиноїну менше 6 місяців тому", ru: "Приём изотретиноина менее 6 месяцев назад", en: "Isotretinoin use within the past 6 months" },
        { uk: "Онкологічні захворювання та схильність до гіпертрофічних рубців", ru: "Онкологические заболевания и склонность к гипертрофическим рубцам", en: "Active oncological conditions and tendency to hypertrophic scarring" },
      ],
    },
  },
  {
    type: "steps",
    data: {
      heading: { uk: "Як відбувається лікування шрамів і пігментації в GENEVITY", ru: "Как проходит лечение шрамов и пигментации в GENEVITY", en: "How Scar and Pigmentation Treatment Works at GENEVITY" },
      steps: [
        { title: { uk: "Консультація та визначення протоколу", ru: "Консультация и определение протокола", en: "Consultation and protocol definition" }, body: { uk: "Лікар оцінює тип і глибину шрамів або характер пігментації, фототип шкіри, наявність активного запалення. Визначає апарат і параметри: AcuPulse CO₂ або M22 IPL/ResurFX, кількість сеансів та інтервали.", ru: "Врач оценивает тип и глубину шрамов или характер пигментации, фототип кожи, наличие активного воспаления. Определяет аппарат и параметры: AcuPulse CO₂ или M22 IPL/ResurFX, количество сеансов и интервалы.", en: "The doctor assesses scar type and depth or pigmentation pattern, skin phototype and active inflammation, then determines the device and parameters: AcuPulse CO₂ or M22 IPL/ResurFX, session count and intervals." } },
        { title: { uk: "Підготовка шкіри (для AcuPulse CO₂)", ru: "Подготовка кожи (для AcuPulse CO₂)", en: "Skin preparation (for AcuPulse CO₂)" }, body: { uk: "За 4–6 тижнів до фракційного CO₂ призначається депігментуюча програма (азелаїнова кислота, ретинол) для профілактики постзапальної пігментації. Перед процедурою наноситься анестезуючий крем.", ru: "За 4–6 недель до фракционного CO₂ назначается депигментирующая программа (азелаиновая кислота, ретинол) для профилактики постзапалительной пигментации. Перед процедурой наносится анестезирующий крем.", en: "4–6 weeks before fractional CO₂, a depigmenting programme (azelaic acid, retinol) is prescribed to prevent post-inflammatory pigmentation. Anaesthetic cream is applied before the procedure." } },
        { title: { uk: "Процедура та відновний період", ru: "Процедура и восстановительный период", en: "Procedure and recovery period" }, body: { uk: "AcuPulse CO₂: почервоніння та мікроскоринки 3–7 днів. M22 IPL: мінімальний відновний період, темніння пігментних плям з відшаруванням через 7–14 днів. Лікар надає детальний протокол догляду після кожного сеансу.", ru: "AcuPulse CO₂: покраснение и микрокорочки 3–7 дней. M22 IPL: минимальный восстановительный период, потемнение пигментных пятен с отшелушиванием через 7–14 дней. Врач предоставляет подробный протокол ухода после каждого сеанса.", en: "AcuPulse CO₂: redness and micro-scabbing 3–7 days. M22 IPL: minimal recovery, darkening of pigmentation spots followed by shedding in 7–14 days. The doctor provides a detailed aftercare protocol after every session." } },
        { title: { uk: "Оцінка результату та підтримуючий протокол", ru: "Оценка результата и поддерживающий протокол", en: "Result assessment and maintenance protocol" }, body: { uk: "Через 4–8 тижнів лікар оцінює динаміку. Для глибоких шрамів може знадобитися 2–3 сеанси. Підтримуюча програма: SPF 50+ щодня, домашній догляд з відновлюючими компонентами.", ru: "Через 4–8 недель врач оценивает динамику. Для глубоких шрамов может потребоваться 2–3 сеанса. Поддерживающая программа: SPF 50+ ежедневно, домашний уход с восстанавливающими компонентами.", en: "After 4–8 weeks the doctor assesses progress. Deep scars may require 2–3 sessions. Maintenance: daily SPF 50+ and home care with regenerating ingredients." } },
      ],
    },
  },
  {
    type: "bullets",
    data: {
      heading: { uk: "Які проблеми шкіри вирішують AcuPulse CO₂ та M22 Stellar Black", ru: "Какие проблемы кожи решают AcuPulse CO₂ и M22 Stellar Black", en: "Skin Problems Addressed by AcuPulse CO₂ and M22 Stellar Black" },
      items: [
        { uk: "Атрофічні шрами від акне (льодоруб, кочані, рухомі) — AcuPulse CO₂ фракційне шліфування", ru: "Атрофические шрамы от акне (ледоруб, волнистые, рассыпные) — AcuPulse CO₂ фракционная шлифовка", en: "Atrophic acne scars (ice-pick, rolling, boxcar) — AcuPulse CO₂ fractional resurfacing" },
        { uk: "Постопераційні та травматичні рубці — фракційне лазерне ремоделювання", ru: "Послеоперационные и травматические рубцы — фракционное лазерное ремоделирование", en: "Post-surgical and traumatic scars — fractional laser remodelling" },
        { uk: "Вікова та сонячна пігментація (лентиго, пігментні плями) — M22 IPL", ru: "Возрастная и солнечная пигментация (лентиго, пигментные пятна) — M22 IPL", en: "Age and sun-related pigmentation (lentigo, dark spots) — M22 IPL" },
        { uk: "Мелазма та постзапальна гіперпігментація — M22 IPL з протоколом контролю пігменту", ru: "Мелазма и постзапалительная гиперпигментация — M22 IPL с протоколом контроля пигмента", en: "Melasma and post-inflammatory hyperpigmentation — M22 IPL with pigment control protocol" },
        { uk: "Купероз (розширені капіляри, судинна сіточка) та розацеа — M22 IPL судинний протокол", ru: "Купероз (расширенные капилляры, сосудистая сеточка) и розацеа — M22 IPL сосудистый протокол", en: "Couperose (dilated capillaries, vascular network) and rosacea — M22 IPL vascular protocol" },
        { uk: "Дрібні зморшки, нерівна текстура та тьмяність шкіри — AcuPulse CO₂ або M22 ResurFX", ru: "Мелкие морщины, неровная текстура и тусклость кожи — AcuPulse CO₂ или M22 ResurFX", en: "Fine wrinkles, uneven texture and dullness — AcuPulse CO₂ or M22 ResurFX" },
        { uk: "Розширені пори та жирна шкіра — AcuPulse фракційний протокол", ru: "Расширенные поры и жирная кожа — AcuPulse фракционный протокол", en: "Enlarged pores and oily skin — AcuPulse fractional protocol" },
      ],
    },
  },
  { type: "showcaseGallery", data: CLINIC_GALLERY },
];

// ─── Apply ────────────────────────────────────────────────────────────────────
async function fixServiceSections(slug: string, sections: RawSection[]) {
  const rows = await sql`SELECT id FROM services WHERE slug = ${slug} AND category_id = ${CATEGORY_ID}`;
  if (!rows[0]) { console.log(`  ⚠ not found: ${slug}`); return; }
  const serviceId: string = rows[0].id;

  await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${serviceId}`;

  const sectionIds: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const id = randomUUID();
    sectionIds.push(id);
    await sql`INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
      VALUES(${id}, 'service', ${serviceId}, ${i}, ${sec.type}::section_type, ${JSON.stringify(sec.data)}::jsonb)`;
  }

  const blockOrder = [...sectionIds.map(id => `section:${id}`), "faq", "doctors", "equipment", "relatedServices", "finalCTA"];
  await sql`UPDATE services SET block_order = ${blockOrder} WHERE id = ${serviceId}`;

  const types = sections.map(s => s.type);
  console.log(`  ✓ ${slug}: [${types.join(" → ")}]`);
}

async function main() {
  console.log("Fixing apparatus hub page sections...");
  await fixServiceSections("face", faceSections);
  await fixServiceSections("body", bodySections);
  await fixServiceSections("skin", skinSections);
  await sql.end();
  console.log("\n✅ Done.");
}

main().catch(e => { console.error(e); process.exit(1); });
