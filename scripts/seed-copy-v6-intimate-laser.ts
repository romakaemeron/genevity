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
type RichTextSection = { type: "richText"; heading: L; body: L; calloutBody?: L; heroImage?: string | null };
type IndicationsSection = { type: "indicationsContraindications"; indicationsHeading: L; indications: L[]; contraindicationsHeading: L; contraindications: L[] };
type StepsSection = { type: "steps"; heading: L; steps: { title: L; description: L }[] };
type BulletsSection = { type: "bullets"; heading: L; items: L[] };
type AnySection = RichTextSection | IndicationsSection | StepsSection | BulletsSection;

function sectionData(s: AnySection): object {
  if (s.type === "richText") return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: s.heroImage ?? null };
  if (s.type === "indicationsContraindications") return { indicationsHeading: s.indicationsHeading, indications: s.indications, contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications };
  if (s.type === "steps") return { heading: s.heading, steps: s.steps };
  if (s.type === "bullets") return { heading: s.heading, items: s.items };
  return {};
}

interface ServiceSeed {
  slug: string;
  summary: L;
  sections: AnySection[];
  faqs: { question: L; answer: L }[];
}

const services: ServiceSeed[] = [
  // ─── Інтимне відновлення ────────────────────────────────────────────────────
  {
    slug: "acupulse-co2-intimate",
    summary: {
      uk: "Інтимна лазерна терапія AcuPulse CO₂ — делікатне омолодження та відновлення тканин зони декольте і вагінального каналу без операції та тривалої реабілітації.",
      ru: "Интимная лазерная терапия AcuPulse CO₂ — деликатное омоложение и восстановление тканей интимной зоны без операции и длительной реабилитации.",
      en: "AcuPulse CO₂ intimate laser therapy — gentle rejuvenation and tissue restoration of the intimate zone without surgery or prolonged recovery.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерне відновлення інтимної зони — AcuPulse CO₂",
          ru: "Лазерное восстановление интимной зоны — AcuPulse CO₂",
          en: "Intimate Zone Laser Rejuvenation — AcuPulse CO₂",
        },
        body: {
          uk: "AcuPulse CO₂ — фракційний CO₂-лазер нового покоління, що поєднує абляційний та неабляційний режими для комплексного ремоделювання тканин. В інтимній медицині він застосовується для відновлення еластичності слизової вагінального каналу, корекції стресового нетримання сечі, усунення сухості та дискомфорту під час статевого життя після пологів або в менопаузі.\n\nПроцедура проводиться за допомогою спеціальної ротаційної насадки. Лазерні мікроколонки стимулюють вироблення нового колагену та прискорюють клітинне оновлення без пошкодження навколишніх тканин. Курс із 3–4 процедур з інтервалом 4–6 тижнів забезпечує стійкий ефект до 18 місяців.",
          ru: "AcuPulse CO₂ — фракционный CO₂-лазер нового поколения, сочетающий абляционный и неабляционный режимы для комплексного ремоделирования тканей. В интимной медицине он применяется для восстановления эластичности слизистой вагинального канала, коррекции стрессового недержания мочи, устранения сухости и дискомфорта во время половой жизни после родов или в менопаузе.\n\nПроцедура проводится с помощью специальной ротационной насадки. Лазерные микроколонки стимулируют выработку нового коллагена и ускоряют клеточное обновление без повреждения окружающих тканей. Курс из 3–4 процедур с интервалом 4–6 недель обеспечивает стойкий эффект до 18 месяцев.",
          en: "AcuPulse CO₂ is a next-generation fractional CO₂ laser combining ablative and non-ablative modes for comprehensive tissue remodeling. In intimate medicine, it restores vaginal canal elasticity, corrects stress urinary incontinence, and relieves post-partum or menopausal dryness and discomfort.\n\nUsing a specialized rotational handpiece, laser microcolumns stimulate new collagen production and accelerate cell renewal without damaging surrounding tissue. A course of 3–4 sessions spaced 4–6 weeks apart delivers lasting results for up to 18 months.",
        },
        calloutBody: {
          uk: "Перший видимий результат — вже після 1-ї процедури: підвищення зволоженості слизової та зменшення дискомфорту.",
          ru: "Первый видимый результат — уже после 1-й процедуры: повышение увлажнённости слизистой и уменьшение дискомфорта.",
          en: "First visible results appear after just 1 session: improved mucosal hydration and reduced discomfort.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання до процедури",
          ru: "Показания к процедуре",
          en: "Indications",
        },
        indications: [
          { uk: "Вагінальна атрофія та сухість після пологів або менопаузи", ru: "Вагинальная атрофия и сухость после родов или менопаузы", en: "Vaginal atrophy and dryness after childbirth or menopause" },
          { uk: "Стресове нетримання сечі легкого та середнього ступеня", ru: "Стрессовое недержание мочи лёгкой и средней степени", en: "Mild to moderate stress urinary incontinence" },
          { uk: "Зниження еластичності та тонусу тканин вагінального каналу", ru: "Снижение эластичности и тонуса тканей вагинального канала", en: "Reduced vaginal tissue elasticity and tone" },
          { uk: "Дискомфорт та болісність під час статевого акту (диспареунія)", ru: "Дискомфорт и болезненность во время полового акта (диспареуния)", en: "Discomfort or pain during intercourse (dyspareunia)" },
          { uk: "Профілактичне відновлення після пологів", ru: "Профилактическое восстановление после родов", en: "Preventive post-partum rejuvenation" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "⚠ Вагітність та грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Активні інфекційні захворювання (кольпіт, герпес у фазі загострення)", ru: "⚠ Активные инфекционные заболевания (кольпит, герпес в стадии обострения)", en: "⚠ Active infections (colpitis, herpes flare)" },
          { uk: "⚠ Онкологічні захворювання органів малого тазу", ru: "⚠ Онкологические заболевания органов малого таза", en: "⚠ Pelvic malignancies" },
          { uk: "⚠ Прийом антикоагулянтів та ізотретиноїну", ru: "⚠ Приём антикоагулянтов и изотретиноина", en: "⚠ Anticoagulant or isotretinoin use" },
          { uk: "⚠ Некориговані гормональні порушення", ru: "⚠ Некорригированные гормональные нарушения", en: "⚠ Uncorrected hormonal imbalances" },
        ],
      },
      {
        type: "steps",
        heading: {
          uk: "Як проходить процедура",
          ru: "Как проходит процедура",
          en: "How the Procedure Works",
        },
        steps: [
          {
            title: { uk: "Консультація гінеколога", ru: "Консультация гинеколога", en: "Gynaecologist consultation" },
            description: { uk: "Лікар збирає анамнез, проводить огляд та виключає протипоказання.", ru: "Врач собирает анамнез, проводит осмотр и исключает противопоказания.", en: "The doctor takes a medical history, performs an examination, and rules out contraindications." },
          },
          {
            title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" },
            description: { uk: "На зону нанесення наноситься знеболювальний гель (за необхідності). Процедура займає 15–20 хвилин.", ru: "На область воздействия наносится обезболивающий гель (при необходимости). Процедура занимает 15–20 минут.", en: "An anaesthetic gel is applied to the treatment area if needed. The session lasts 15–20 minutes." },
          },
          {
            title: { uk: "Лазерний вплив", ru: "Лазерное воздействие", en: "Laser application" },
            description: { uk: "Ротаційна насадка рівномірно опромінює слизову по колу — точний контроль глибини та енергії гарантує безпечність.", ru: "Ротационная насадка равномерно облучает слизистую по кругу — точный контроль глубины и энергии обеспечивает безопасность.", en: "The rotational handpiece uniformly irradiates the mucosa in a circular pattern — precise depth and energy control ensures safety." },
          },
          {
            title: { uk: "Відновлення", ru: "Восстановление", en: "Recovery" },
            description: { uk: "Протягом 2–3 днів рекомендується утриматися від статевого життя. Повсякденна активність не обмежується.", ru: "В течение 2–3 дней рекомендуется воздержаться от половой жизни. Повседневная активность не ограничивается.", en: "Sexual activity is avoided for 2–3 days. Daily activities remain unrestricted." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги та особливості",
          ru: "Преимущества и особенности",
          en: "Benefits and Key Features",
        },
        items: [
          { uk: "Безопераційна альтернатива хірургічній вагінопластиці", ru: "Безоперационная альтернатива хирургической вагинопластике", en: "Non-surgical alternative to vaginoplasty" },
          { uk: "Результат помітний вже після першого сеансу", ru: "Результат заметен уже после первого сеанса", en: "Results visible after the first session" },
          { uk: "Процедура займає лише 15–20 хвилин", ru: "Процедура занимает всего 15–20 минут", en: "Session lasts only 15–20 minutes" },
          { uk: "Стійкий ефект до 12–18 місяців після курсу", ru: "Стойкий эффект до 12–18 месяцев после курса", en: "Lasting results for 12–18 months after a course" },
          { uk: "⚠ Не замінює лікування при виражених пролапсах — консультуйтеся з гінекологом", ru: "⚠ Не заменяет лечение при выраженных пролапсах — консультируйтесь с гинекологом", en: "⚠ Does not replace surgical treatment for pronounced prolapse — consult your gynaecologist" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Боляче під час процедури?", ru: "Больно ли во время процедуры?", en: "Is the procedure painful?" },
        answer: { uk: "Більшість пацієнток описують відчуття як легке тепло або поколювання. При необхідності наноситься місцева анестезія у вигляді гелю.", ru: "Большинство пациенток описывают ощущения как лёгкое тепло или покалывание. При необходимости наносится местная анестезия в виде геля.", en: "Most patients describe a feeling of mild warmth or tingling. A topical anaesthetic gel is applied if needed." },
      },
      {
        question: { uk: "Скільки процедур потрібно для результату?", ru: "Сколько процедур нужно для результата?", en: "How many sessions are needed?" },
        answer: { uk: "Стандартний курс — 3 процедури з інтервалом 4–6 тижнів. Підтримуюча процедура — 1 раз на рік.", ru: "Стандартный курс — 3 процедуры с интервалом 4–6 недель. Поддерживающая процедура — 1 раз в год.", en: "A standard course is 3 sessions spaced 4–6 weeks apart, followed by a yearly maintenance session." },
      },
    ],
  },
  {
    slug: "monopolar-rf-lifting",
    summary: {
      uk: "Монополярний RF-ліфтинг інтимної зони — безконтактне апаратне відновлення тонусу тканин і щільності слизової без пошкоджень та тривалого відновлення.",
      ru: "Монополярный RF-лифтинг интимной зоны — бесконтактное аппаратное восстановление тонуса тканей и плотности слизистой без повреждений и длительного восстановления.",
      en: "Monopolar RF lifting of the intimate zone — non-invasive device-based restoration of tissue tone and mucosal density with no downtime.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Монополярний RF-ліфтинг — делікатне відновлення без лазера",
          ru: "Монополярный RF-лифтинг — деликатное восстановление без лазера",
          en: "Monopolar RF Lifting — Gentle Restoration Without Laser",
        },
        body: {
          uk: "Монополярна радіочастотна терапія — один із найм'якших методів відновлення тонусу інтимних тканин. Радіочастотна енергія проникає в глибокі шари дерми та підслизового прошарку, стимулюючи скорочення вже наявних колагенових волокон і запускаючи неоколагеногенез. Результат — видима підтяжка, посилення чутливості та усунення сухості без жодних пошкоджень поверхні.\n\nМетод ідеально підходить для пацієнток, які не готові до лазерної процедури або шукають м'якшу альтернативу. Процедура проводиться курсами по 4–6 сеансів; одна підтримуюча процедура на рік дозволяє зберігати ефект тривало.",
          ru: "Монополярная радиочастотная терапия — один из самых мягких методов восстановления тонуса интимных тканей. Радиочастотная энергия проникает в глубокие слои дермы и подслизистого слоя, стимулируя сокращение уже имеющихся коллагеновых волокон и запуская неоколлагеногенез. Результат — видимая подтяжка, усиление чувствительности и устранение сухости без каких-либо повреждений поверхности.\n\nМетод идеально подходит для пациенток, которые не готовы к лазерной процедуре или ищут более мягкую альтернативу. Процедура проводится курсами по 4–6 сеансов; одна поддерживающая процедура в год позволяет сохранять эффект длительно.",
          en: "Monopolar radiofrequency therapy is one of the gentlest methods of restoring intimate tissue tone. RF energy penetrates deep into the dermis and submucosal layer, contracting existing collagen fibres and triggering neocollagenogenesis. The result is visible tightening, enhanced sensitivity, and relief from dryness — all without surface damage.\n\nThis method is ideal for patients who are not ready for a laser procedure or prefer a gentler alternative. Treatment is delivered in courses of 4–6 sessions, with a single annual maintenance session to maintain results long-term.",
        },
        calloutBody: {
          uk: "Безпечна альтернатива лазеру — RF-технологія без порушення цілісності слизової.",
          ru: "Безопасная альтернатива лазеру — RF-технология без нарушения целостности слизистой.",
          en: "A safe laser alternative — RF technology with no mucosal disruption.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання",
          ru: "Показания",
          en: "Indications",
        },
        indications: [
          { uk: "Зниження тонусу та еластичності тканин інтимної зони", ru: "Снижение тонуса и эластичности тканей интимной зоны", en: "Reduced tone and elasticity of intimate tissues" },
          { uk: "Сухість слизової після менопаузи або на тлі гормональних змін", ru: "Сухость слизистой после менопаузы или на фоне гормональных изменений", en: "Mucosal dryness after menopause or hormonal changes" },
          { uk: "Відновлення після пологів — покращення тонусу без реабілітаційного простою", ru: "Восстановление после родов — улучшение тонуса без реабилитационного простоя", en: "Post-partum restoration — improving tone with no downtime" },
          { uk: "Профілактика вікових змін у жінок 35+", ru: "Профилактика возрастных изменений у женщин 35+", en: "Preventive care for age-related changes in women 35+" },
          { uk: "Підготовка або ад'ювантна терапія перед/після лазерної процедури", ru: "Подготовка или адъювантная терапия перед/после лазерной процедуры", en: "Preparatory or adjuvant therapy before/after laser treatment" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "⚠ Вагітність", ru: "⚠ Беременность", en: "⚠ Pregnancy" },
          { uk: "⚠ Електрокардіостимулятор або інші імплантовані металеві пристрої в зоні впливу", ru: "⚠ Кардиостимулятор или другие имплантированные металлические устройства в зоне воздействия", en: "⚠ Pacemaker or other metallic implants in the treatment area" },
          { uk: "⚠ Активні запальні або інфекційні захворювання в зоні обробки", ru: "⚠ Активные воспалительные или инфекционные заболевания в зоне обработки", en: "⚠ Active inflammatory or infectious conditions in the treatment area" },
          { uk: "⚠ Злоякісні новоутворення", ru: "⚠ Злокачественные новообразования", en: "⚠ Malignancies" },
        ],
      },
      {
        type: "steps",
        heading: {
          uk: "Хід процедури",
          ru: "Ход процедуры",
          en: "Procedure Steps",
        },
        steps: [
          {
            title: { uk: "Первинна консультація", ru: "Первичная консультация", en: "Initial consultation" },
            description: { uk: "Лікар-гінеколог оцінює стан тканин і формує індивідуальний протокол.", ru: "Врач-гинеколог оценивает состояние тканей и формирует индивидуальный протокол.", en: "A gynaecologist assesses tissue condition and creates an individualised protocol." },
          },
          {
            title: { uk: "Підготовка та калібрування апарату", ru: "Подготовка и калибровка аппарата", en: "Device setup and calibration" },
            description: { uk: "Параметри RF підбираються під особливості тканин пацієнтки. Анестезія зазвичай не потрібна.", ru: "Параметры RF подбираются под особенности тканей пациентки. Анестезия обычно не нужна.", en: "RF parameters are calibrated to the patient's tissue characteristics. Anaesthesia is usually not required." },
          },
          {
            title: { uk: "Сеанс RF-терапії", ru: "Сеанс RF-терапии", en: "RF therapy session" },
            description: { uk: "Спеціальна насадка рівномірно прогріває тканини до терапевтичної температури. Відчуття — комфортне тепло. Тривалість — 20–30 хвилин.", ru: "Специальная насадка равномерно прогревает ткани до терапевтической температуры. Ощущения — комфортное тепло. Продолжительность — 20–30 минут.", en: "A specialised handpiece evenly heats tissues to a therapeutic temperature. The sensation is comfortable warmth. Duration: 20–30 minutes." },
          },
          {
            title: { uk: "Після процедури", ru: "После процедуры", en: "After the session" },
            description: { uk: "Ніякого відновного періоду. Рекомендується утриматися від статевого життя 24 години.", ru: "Никакого восстановительного периода. Рекомендуется воздержаться от половой жизни 24 часа.", en: "No recovery period required. Sexual activity is avoided for 24 hours." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Чому обирають RF-ліфтинг",
          ru: "Почему выбирают RF-лифтинг",
          en: "Why Choose RF Lifting",
        },
        items: [
          { uk: "Повністю безінвазивна процедура — без пошкоджень тканин", ru: "Полностью безынвазивная процедура — без повреждения тканей", en: "Completely non-invasive — no tissue damage" },
          { uk: "Підходить для чутливих пацієнток, які не готові до лазера", ru: "Подходит для чувствительных пациенток, не готовых к лазеру", en: "Suitable for sensitive patients not ready for laser" },
          { uk: "Жодного простою — повертайтеся до звичайного ритму одразу", ru: "Никакого простоя — возвращайтесь к привычному ритму сразу", en: "Zero downtime — return to normal routine immediately" },
          { uk: "Помітне покращення вже після 2–3 процедур", ru: "Заметное улучшение уже после 2–3 процедур", en: "Noticeable improvement after 2–3 sessions" },
          { uk: "⚠ Для виражених атрофічних змін лазерна терапія може бути ефективнішою", ru: "⚠ При выраженных атрофических изменениях лазерная терапия может быть эффективнее", en: "⚠ For pronounced atrophic changes, laser therapy may be more effective" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Чим RF-ліфтинг відрізняється від лазерного відновлення?", ru: "Чем RF-лифтинг отличается от лазерного восстановления?", en: "How does RF lifting differ from laser rejuvenation?" },
        answer: { uk: "RF-ліфтинг не пошкоджує поверхню слизової — він прогріває глибокі шари без абляції. Лазер діє інтенсивніше і дає швидший результат при вираженій атрофії, але потребує 2–3 дні відновлення. RF — м'якша опція з нульовим простоєм.", ru: "RF-лифтинг не повреждает поверхность слизистой — он прогревает глубокие слои без абляции. Лазер действует интенсивнее и даёт более быстрый результат при выраженной атрофии, но требует 2–3 дня восстановления. RF — более мягкий вариант с нулевым простоем.", en: "RF lifting does not damage the mucosal surface — it heats deep layers without ablation. Laser works more intensively and delivers faster results for pronounced atrophy, but requires 2–3 days of recovery. RF is the gentler option with zero downtime." },
      },
      {
        question: { uk: "Коли я відчую результат?", ru: "Когда я почувствую результат?", en: "When will I feel results?" },
        answer: { uk: "Перші ознаки покращення — підвищення зволоженості та тонусу — зазвичай помітні після 2–3 процедур. Повний ефект формується через 4–6 тижнів після завершення курсу.", ru: "Первые признаки улучшения — повышение увлажнённости и тонуса — обычно заметны после 2–3 процедур. Полный эффект формируется через 4–6 недель после завершения курса.", en: "The first signs of improvement — increased hydration and tone — are usually noticeable after 2–3 sessions. The full effect develops 4–6 weeks after the course is complete." },
      },
    ],
  },

  // ─── Лазерна епіляція ────────────────────────────────────────────────────────
  {
    slug: "laser-women",
    summary: {
      uk: "Лазерна епіляція для жінок на апараті Splendor X — стійке видалення небажаного волосся на будь-якій ділянці тіла, включно з чутливою шкірою та засмаглим фототипом.",
      ru: "Лазерная эпиляция для женщин на аппарате Splendor X — стойкое удаление нежелательных волос на любом участке тела, включая чувствительную кожу и загорелый фототип.",
      en: "Women's laser hair removal with Splendor X — permanent reduction of unwanted hair on any body area, including sensitive skin and tanned skin types.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерна епіляція для жінок — Splendor X",
          ru: "Лазерная эпиляция для женщин — Splendor X",
          en: "Women's Laser Hair Removal — Splendor X",
        },
        body: {
          uk: "Splendor X — найсучасніша платформа для лазерної епіляції, що поєднує два довжини хвилі: Nd:YAG (1064 нм) для глибокого впливу на темні корені та Alexandre (755 нм) для точного знищення волосяних фолікулів на поверхні. Синхронний та змішаний режими BLEND дозволяють адаптувати процедуру під будь-який фототип шкіри — від світлої до засмаглої.\n\nКвадратний промінь (замість круглого в класичних апаратах) рівномірно покриває зону обробки без перекриття та пропусків, що скорочує час сеансу вдвічі. Система охолодження SQUARE PULSE захищає епідерміс в режимі реального часу. Результат після курсу — зменшення росту волосся на 85–95%.",
          ru: "Splendor X — самая современная платформа для лазерной эпиляции, сочетающая две длины волны: Nd:YAG (1064 нм) для глубокого воздействия на тёмные корни и Alexandre (755 нм) для точного уничтожения волосяных фолликулов на поверхности. Синхронный и смешанный режимы BLEND позволяют адаптировать процедуру под любой фототип кожи — от светлой до загорелой.\n\nКвадратный луч (в отличие от круглого в классических аппаратах) равномерно покрывает зону обработки без перекрытий и пропусков, что сокращает время сеанса вдвое. Система охлаждения SQUARE PULSE защищает эпидермис в режиме реального времени. Результат после курса — уменьшение роста волос на 85–95%.",
          en: "Splendor X is the most advanced laser hair removal platform, combining two wavelengths: Nd:YAG (1064 nm) for deep targeting of dark roots and Alexandre (755 nm) for precise follicle destruction at the surface. Synchronised and blended BLEND modes adapt the treatment to any skin phototype — from fair to tanned.\n\nThe square beam (unlike round beams in conventional devices) uniformly covers the treatment area without overlaps or gaps, cutting session time in half. The SQUARE PULSE cooling system protects the epidermis in real time. Results after a full course: 85–95% reduction in hair regrowth.",
        },
        calloutBody: {
          uk: "Splendor X — єдиний в Дніпрі апарат із квадратним лазерним променем, що гарантує рівне покриття та мінімальний дискомфорт.",
          ru: "Splendor X — единственный в Днепре аппарат с квадратным лазерным лучом, гарантирующий равномерное покрытие и минимальный дискомфорт.",
          en: "Splendor X is the only device in Dnipro with a square laser beam, ensuring uniform coverage and minimal discomfort.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Кому підходить лазерна епіляція",
          ru: "Кому подходит лазерная эпиляция",
          en: "Who Laser Hair Removal Is For",
        },
        indications: [
          { uk: "Небажане волосся на ногах, руках, пахвах, зоні бікіні, животі та спині", ru: "Нежелательные волосы на ногах, руках, подмышках, зоне бикини, животе и спине", en: "Unwanted hair on legs, arms, underarms, bikini zone, abdomen, and back" },
          { uk: "Темне волосся — оптимальний результат при контрасті волосся/шкіра", ru: "Тёмные волосы — оптимальный результат при контрасте волос/кожа", en: "Dark hair — optimal results with strong hair-to-skin contrast" },
          { uk: "Схильність до врослого волосся та фолікулітів", ru: "Склонность к вросшим волосам и фолликулитам", en: "Tendency to ingrown hairs and folliculitis" },
          { uk: "Гірсутизм (надмірне оволосіння) — як метод корекції", ru: "Гирсутизм (избыточное оволосение) — как метод коррекции", en: "Hirsutism (excess hair growth) — as a corrective method" },
          { uk: "Бажання позбутися щоденного гоління та воскової епіляції", ru: "Желание избавиться от ежедневного бритья и восковой эпиляции", en: "Desire to eliminate daily shaving and waxing" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "⚠ Засмага менш ніж 3 тижні тому (ризик гіперпігментації)", ru: "⚠ Загар менее 3 недель назад (риск гиперпигментации)", en: "⚠ Sun exposure less than 3 weeks ago (risk of hyperpigmentation)" },
          { uk: "⚠ Активні шкірні захворювання (псоріаз, екзема у фазі загострення) в зоні обробки", ru: "⚠ Активные кожные заболевания (псориаз, экзема в стадии обострения) в зоне обработки", en: "⚠ Active skin conditions (psoriasis, eczema flare) in the treatment area" },
          { uk: "⚠ Вагітність та грудне вигодовування", ru: "⚠ Беременность и грудное вскармливание", en: "⚠ Pregnancy and breastfeeding" },
          { uk: "⚠ Прийом фотосенсибілізаторів (тетрацикліни, ретиноїди)", ru: "⚠ Приём фотосенсибилизаторов (тетрациклины, ретиноиды)", en: "⚠ Photosensitising medication (tetracyclines, retinoids)" },
          { uk: "⚠ Онкологічні захворювання в анамнезі (потрібна консультація)", ru: "⚠ Онкологические заболевания в анамнезе (нужна консультация)", en: "⚠ History of malignancy (consultation required)" },
        ],
      },
      {
        type: "steps",
        heading: {
          uk: "Як відбувається процедура",
          ru: "Как происходит процедура",
          en: "How the Procedure Works",
        },
        steps: [
          {
            title: { uk: "Консультація та складання карти фототипу", ru: "Консультация и составление карты фототипа", en: "Consultation and phototype assessment" },
            description: { uk: "Спеціаліст визначає фототип шкіри та структуру волосся для підбору оптимальних параметрів.", ru: "Специалист определяет фототип кожи и структуру волос для подбора оптимальных параметров.", en: "The specialist determines skin phototype and hair structure to select optimal parameters." },
          },
          {
            title: { uk: "Підготовка", ru: "Подготовка", en: "Preparation" },
            description: { uk: "За 24–48 годин до процедури збрийте волосся бритвою. Не пошкоджуйте шкіру: без воску, нитки, пінцету.", ru: "За 24–48 часов до процедуры сбрейте волосы бритвой. Не повреждайте кожу: без воска, нитки, пинцета.", en: "Shave the area with a razor 24–48 hours before the session. Avoid damaging the skin: no waxing, threading, or tweezing." },
          },
          {
            title: { uk: "Сеанс лазерної епіляції", ru: "Сеанс лазерной эпиляции", en: "Laser hair removal session" },
            description: { uk: "Лазерний промінь нагріває фолікул до температури, що руйнує його ростову зону. Активне охолодження мінімізує відчуття дискомфорту.", ru: "Лазерный луч нагревает фолликул до температуры, разрушающей его ростовую зону. Активное охлаждение минимизирует ощущение дискомфорта.", en: "The laser beam heats the follicle to a temperature that destroys its growth zone. Active cooling minimises discomfort." },
          },
          {
            title: { uk: "Інтервал між сеансами", ru: "Интервал между сеансами", en: "Session intervals" },
            description: { uk: "3–6 тижнів (залежно від зони та циклу росту волосся). Стандартний курс — 6–8 процедур.", ru: "3–6 недель (в зависимости от зоны и цикла роста волос). Стандартный курс — 6–8 процедур.", en: "3–6 weeks apart (depending on the zone and hair growth cycle). A standard course is 6–8 sessions." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги лазерної епіляції Splendor X",
          ru: "Преимущества лазерной эпиляции Splendor X",
          en: "Splendor X Laser Hair Removal Benefits",
        },
        items: [
          { uk: "Підходить для всіх фототипів — від I до VI (засмагла шкіра)", ru: "Подходит для всех фототипов — от I до VI (загорелая кожа)", en: "Suitable for all skin phototypes — from I to VI (tanned skin)" },
          { uk: "Квадратний промінь = повне покриття без болісних повторних проходів", ru: "Квадратный луч = полное покрытие без болезненных повторных проходов", en: "Square beam = complete coverage with no painful re-passes" },
          { uk: "Швидший сеанс: обидві ноги — 20–30 хвилин", ru: "Более быстрый сеанс: обе ноги — 20–30 минут", en: "Faster sessions: both legs in 20–30 minutes" },
          { uk: "Мінімальний дискомфорт завдяки вбудованому охолодженню", ru: "Минимальный дискомфорт благодаря встроенному охлаждению", en: "Minimal discomfort thanks to built-in cooling" },
          { uk: "⚠ Сірі, руді та дуже світлі волосся гірше реагують на лазер — обговоріть реалістичні очікування на консультації", ru: "⚠ Серые, рыжие и очень светлые волосы хуже реагируют на лазер — обсудите реалистичные ожидания на консультации", en: "⚠ Grey, red, and very blonde hair responds poorly to laser — discuss realistic expectations at your consultation" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Скільки сеансів потрібно для стійкого результату?", ru: "Сколько сеансов нужно для стойкого результата?", en: "How many sessions are needed for lasting results?" },
        answer: { uk: "Зазвичай 6–8 сеансів з інтервалом 3–6 тижнів. Точна кількість залежить від зони, кольору та товщини волосся, фототипу шкіри та гормонального фону.", ru: "Обычно 6–8 сеансов с интервалом 3–6 недель. Точное количество зависит от зоны, цвета и толщины волос, фототипа кожи и гормонального фона.", en: "Typically 6–8 sessions spaced 3–6 weeks apart. The exact number depends on the zone, hair colour and thickness, skin phototype, and hormonal background." },
      },
      {
        question: { uk: "Чи можна робити епіляцію влітку?", ru: "Можно ли делать эпиляцию летом?", en: "Can I get laser hair removal in summer?" },
        answer: { uk: "Так, за умови захисту оброблюваної зони від сонця протягом 3–4 тижнів до та після процедури (SPF 50+). Splendor X безпечно працює і на засмаглій шкірі завдяки режиму Nd:YAG.", ru: "Да, при условии защиты обрабатываемой зоны от солнца в течение 3–4 недель до и после процедуры (SPF 50+). Splendor X безопасно работает и на загорелой коже благодаря режиму Nd:YAG.", en: "Yes, provided the treated area is protected from sun exposure for 3–4 weeks before and after the session (SPF 50+). Splendor X is safe for tanned skin thanks to its Nd:YAG mode." },
      },
    ],
  },
  {
    slug: "laser-men",
    summary: {
      uk: "Лазерна епіляція для чоловіків на апараті Splendor X — ефективне видалення волосся на спині, плечах, грудях, обличчі та паховій зоні без порізів і подразнень.",
      ru: "Лазерная эпиляция для мужчин на аппарате Splendor X — эффективное удаление волос на спине, плечах, груди, лице и паховой зоне без порезов и раздражений.",
      en: "Men's laser hair removal with Splendor X — effective hair removal on the back, shoulders, chest, face, and groin area with no cuts or irritation.",
    },
    sections: [
      {
        type: "richText",
        heading: {
          uk: "Лазерна епіляція для чоловіків — Splendor X",
          ru: "Лазерная эпиляция для мужчин — Splendor X",
          en: "Men's Laser Hair Removal — Splendor X",
        },
        body: {
          uk: "Чоловіче волосся, як правило, грубіше та густіше за жіноче — воно потребує більш потужного і точного впливу. Splendor X вирішує це завдяки режиму BLEND, що поєднує дві довжини хвилі: Alexandre 755 нм для точного ураження фолікулів та Nd:YAG 1064 нм для глибокого прогріву навіть найтовстіших коренів. Це дозволяє ефективно видаляти волосся на спині, плечах, грудній клітці, шиї та в паховій зоні — з мінімальним дискомфортом та відсутністю доби простою.\n\nМагніт для чоловіків, які хочуть позбутися регулярного гоління спини або боротьби з дратівливим «щетинним» зростанням після бритви на шиї та обличчі. Сеанс на спині та плечах займає лише 30–40 хвилин.",
          ru: "Мужские волосы, как правило, грубее и гуще женских — они требуют более мощного и точного воздействия. Splendor X решает эту задачу благодаря режиму BLEND, сочетающему две длины волны: Alexandre 755 нм для точного поражения фолликулов и Nd:YAG 1064 нм для глубокого прогрева даже самых толстых корней. Это позволяет эффективно удалять волосы на спине, плечах, грудной клетке, шее и паховой зоне — с минимальным дискомфортом и без простоя.\n\nИдеально для мужчин, которые хотят избавиться от регулярного бритья спины или борьбы с раздражающим «щетинным» ростом после бритья на шее и лице. Сеанс на спине и плечах занимает всего 30–40 минут.",
          en: "Men's hair is generally coarser and denser than women's — it requires more powerful and precise treatment. Splendor X addresses this with BLEND mode, combining two wavelengths: Alexandre 755 nm for precise follicle targeting and Nd:YAG 1064 nm for deep heating of even the thickest roots. This makes it highly effective for removing hair on the back, shoulders, chest, neck, and groin — with minimal discomfort and no downtime.\n\nPerfect for men who want to stop the cycle of back shaving or constant irritation from stubble regrowth on the neck and face. A back and shoulders session takes just 30–40 minutes.",
        },
        calloutBody: {
          uk: "Спина та плечі — 30–40 хвилин. Чоловіча зона бікіні — 15 хвилин. Рекомендований курс: 6–8 сеансів.",
          ru: "Спина и плечи — 30–40 минут. Мужская зона бикини — 15 минут. Рекомендованный курс: 6–8 сеансов.",
          en: "Back and shoulders — 30–40 minutes. Male bikini zone — 15 minutes. Recommended course: 6–8 sessions.",
        },
      },
      {
        type: "indicationsContraindications",
        indicationsHeading: {
          uk: "Показання",
          ru: "Показания",
          en: "Indications",
        },
        indications: [
          { uk: "Надмірне оволосіння спини, плечей, грудей, живота", ru: "Избыточное оволосение спины, плеч, груди, живота", en: "Excessive hair on the back, shoulders, chest, and abdomen" },
          { uk: "Постійне подразнення шкіри після гоління шиї та щелепної лінії", ru: "Постоянное раздражение кожи после бритья шеи и линии челюсти", en: "Chronic skin irritation after shaving the neck and jawline" },
          { uk: "Схильність до псевдофолікулітів (врослих волосся) після гоління", ru: "Склонность к псевдофолликулитам (вросшим волосам) после бритья", en: "Tendency to pseudofolliculitis (ingrown hairs) after shaving" },
          { uk: "Видалення волосся в зоні бікіні та пахвах для комфорту та гігієни", ru: "Удаление волос в зоне бикини и подмышках для комфорта и гигиены", en: "Hair removal in the bikini zone and underarms for comfort and hygiene" },
          { uk: "Корекція контуру бороди та рівня росту волосся на шиї", ru: "Коррекция контура бороды и уровня роста волос на шее", en: "Beard contouring and neckline definition" },
        ],
        contraindicationsHeading: {
          uk: "Протипоказання",
          ru: "Противопоказания",
          en: "Contraindications",
        },
        contraindications: [
          { uk: "⚠ Свіжа засмага або активний відпочинок на сонці (менш ніж 3 тижні)", ru: "⚠ Свежий загар или активный отдых на солнце (менее 3 недель)", en: "⚠ Recent tan or active sun exposure (less than 3 weeks)" },
          { uk: "⚠ Активний акне або запалені фолікули в зоні обробки", ru: "⚠ Активное акне или воспалённые фолликулы в зоне обработки", en: "⚠ Active acne or inflamed follicles in the treatment area" },
          { uk: "⚠ Прийом препаратів, що підвищують фотосенсибілізацію", ru: "⚠ Приём препаратов, повышающих фотосенсибилизацию", en: "⚠ Photosensitising medication use" },
          { uk: "⚠ Татуювання в зоні обробки — лазер не застосовується поверх татуювань", ru: "⚠ Татуировки в зоне обработки — лазер не применяется поверх татуировок", en: "⚠ Tattoos in the treatment zone — laser cannot be applied over tattoos" },
          { uk: "⚠ Онкологічні захворювання в анамнезі (консультація обов'язкова)", ru: "⚠ Онкологические заболевания в анамнезе (консультация обязательна)", en: "⚠ History of malignancy (consultation required)" },
        ],
      },
      {
        type: "steps",
        heading: {
          uk: "Як відбувається сеанс",
          ru: "Как проходит сеанс",
          en: "How a Session Works",
        },
        steps: [
          {
            title: { uk: "Консультація та вибір зон", ru: "Консультация и выбор зон", en: "Consultation and zone selection" },
            description: { uk: "Фахівець оцінює фототип, структуру волосся та рекомендує пакет зон. Обговорюємо реалістичні очікування.", ru: "Специалист оценивает фототип, структуру волос и рекомендует пакет зон. Обсуждаем реалистичные ожидания.", en: "The specialist assesses phototype and hair structure, recommends zone packages, and sets realistic expectations." },
          },
          {
            title: { uk: "Підготовка (за 24–48 год до сеансу)", ru: "Подготовка (за 24–48 ч до сеанса)", en: "Preparation (24–48 h before the session)" },
            description: { uk: "Збрийте волосся бритвою (не воском і не кремом-депілятором). Уникайте сонця та солярію.", ru: "Сбрейте волосы бритвой (не воском и не кремом-депилятором). Избегайте солнца и солярия.", en: "Shave with a razor (not wax or depilatory cream). Avoid sun and tanning beds." },
          },
          {
            title: { uk: "Сеанс", ru: "Сеанс", en: "Session" },
            description: { uk: "Апарат налаштовується під ваш фототип. Квадратний промінь рівномірно покриває зону. Відчуття — як легке клацання + тепло. Активне охолодження знижує дискомфорт.", ru: "Аппарат настраивается под ваш фототип. Квадратный луч равномерно покрывает зону. Ощущения — как лёгкое щелчки + тепло. Активное охлаждение снижает дискомфорт.", en: "The device is set to your phototype. The square beam covers the zone evenly. Sensations resemble light snapping + warmth. Active cooling reduces discomfort." },
          },
          {
            title: { uk: "Після сеансу", ru: "После сеанса", en: "After the session" },
            description: { uk: "Уникайте гарячого душу та сауни протягом 24 годин. Оброблену зону не сонцепечіть — SPF 50+ обов'язково.", ru: "Избегайте горячего душа и сауны в течение 24 часов. Обработанную зону не загорайте — SPF 50+ обязательно.", en: "Avoid hot showers and saunas for 24 hours. Keep the treated area out of the sun — SPF 50+ is mandatory." },
          },
        ],
      },
      {
        type: "bullets",
        heading: {
          uk: "Переваги для чоловіків",
          ru: "Преимущества для мужчин",
          en: "Benefits for Men",
        },
        items: [
          { uk: "Назавжди забудьте про гоління спини — повне покриття за один прохід", ru: "Навсегда забудьте о бритье спины — полное покрытие за один проход", en: "Forget back shaving forever — full coverage in a single pass" },
          { uk: "Менше подразнень та врослих волосся після кожного сеансу", ru: "Меньше раздражений и вросших волос после каждого сеанса", en: "Less irritation and fewer ingrown hairs after each session" },
          { uk: "Швидко: спина + плечі всього за 30–40 хвилин", ru: "Быстро: спина + плечи всего за 30–40 минут", en: "Fast: back + shoulders in just 30–40 minutes" },
          { uk: "Зменшення росту волосся на 85–95% після повного курсу", ru: "Уменьшение роста волос на 85–95% после полного курса", en: "85–95% reduction in hair regrowth after a full course" },
          { uk: "⚠ Груба чоловіча щетина потребує більше сеансів, ніж жіноче волосся — закладіть 8+ процедур для щільних зон", ru: "⚠ Грубая мужская щетина требует больше сеансов, чем женские волосы — заложите 8+ процедур для плотных зон", en: "⚠ Coarse male stubble requires more sessions than female hair — plan 8+ sessions for dense areas" },
        ],
      },
    ],
    faqs: [
      {
        question: { uk: "Чи болісна лазерна епіляція для чоловіків?", ru: "Болезненна ли лазерная эпиляция для мужчин?", en: "Is laser hair removal painful for men?" },
        answer: { uk: "Чоловіки зазвичай описують відчуття як легке клацання або тепло. Найчутливіші зони — пах та внутрішня поверхня стегна. Апарат Splendor X оснащений активним охолодженням, яке суттєво знижує дискомфорт.", ru: "Мужчины обычно описывают ощущения как лёгкое щелчки или тепло. Наиболее чувствительные зоны — пах и внутренняя поверхность бедра. Аппарат Splendor X оснащён активным охлаждением, которое существенно снижает дискомфорт.", en: "Men typically describe sensations as light snapping or warmth. The most sensitive areas are the groin and inner thigh. Splendor X features active cooling that significantly reduces discomfort." },
      },
      {
        question: { uk: "Чи можна зробити епіляцію на обличчі (борода, вуса)?", ru: "Можно ли сделать эпиляцию на лице (борода, усы)?", en: "Can I get facial hair removal (beard, moustache)?" },
        answer: { uk: "Так, але важливо розуміти мету: Splendor X може повністю видалити волосся або стоншити густу бороду. Для корекції контуру (clean neckline) або видалення одиночних волосків — це ідеально. Для стоншення бороди з'ясуйте свої цілі на консультації.", ru: "Да, но важно понимать цель: Splendor X может полностью удалить волосы или истончить густую бороду. Для коррекции контура (clean neckline) или удаления одиночных волосков — идеально. Для утончения бороды уточните свои цели на консультации.", en: "Yes, but understanding your goal is important: Splendor X can completely remove hair or thin a dense beard. For contouring (clean neckline) or removing isolated hairs — it's ideal. For beard thinning, clarify your goals at consultation." },
      },
    ],
  },
];

async function seedService(svc: ServiceSeed) {
  const [row] = await sql`SELECT id FROM services WHERE slug = ${svc.slug}`;
  if (!row) { console.log(`⚠ NOT FOUND: ${svc.slug}`); return; }
  const serviceId: string = row.id;

  await sql`UPDATE services SET summary_uk = ${svc.summary.uk}, summary_ru = ${svc.summary.ru}, summary_en = ${svc.summary.en} WHERE id = ${serviceId}`;
  await sql`DELETE FROM content_sections WHERE owner_id = ${serviceId} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${serviceId} AND owner_type = 'service'`;

  const sectionIds: string[] = [];
  for (let i = 0; i < svc.sections.length; i++) {
    const sec = svc.sections[i];
    const id = randomUUID();
    sectionIds.push(id);
    await sql`INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
      VALUES(${id}, 'service', ${serviceId}, ${i}, ${sec.type}::section_type, ${JSON.stringify(sectionData(sec))}::jsonb)`;
  }

  for (let i = 0; i < svc.faqs.length; i++) {
    const f = svc.faqs[i];
    await sql`INSERT INTO faq_items(owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
      VALUES('service', ${serviceId}, ${i}, ${f.question.uk}, ${f.question.ru}, ${f.question.en}, ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en})`;
  }

  const blockOrder = [...sectionIds, "faq", "doctors", "equipment", "relatedServices", "finalCTA"];
  await sql`UPDATE services SET block_order = ${blockOrder} WHERE id = ${serviceId}`;

  const types = svc.sections.map(s => s.type).join(", ");
  console.log(`✓ ${svc.slug} — [${types}], ${svc.faqs.length} FAQs`);
}

async function main() {
  for (const svc of services) {
    await seedService(svc);
  }
  await sql.end();
  console.log("\nV6-intimate-laser DONE.");
}
main().catch((e) => { console.error(e); process.exit(1); });
