/**
 * Seed body content for all three legal documents (UK / RU / EN).
 *
 * The public /[locale]/legal/[slug] page parses body text into structured blocks:
 *   - "1.Title" or "1. Title"  → numbered h2 heading
 *   - blank line               → paragraph break
 *   - 3+ short lines after h2  → bullet list
 *   - "ФОП ..."                → attribution subheading
 *   - "від DD.MM.YYYY ..."     → metadata line
 *
 * Run: npx tsx scripts/seed-legal-bodies.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

/* ---------- 1. License ---------- */

const licenseUk = `Центр довголіття та якості життя «GENEVITY» провадить медичну практику на підставі чинної ліцензії, виданої Міністерством охорони здоров'я України.

ФОП Харківська Катерина Сергіївна

від 14.08.2025 № 1296

1.Ліцензуючий орган
Міністерство охорони здоров'я України.

2.Ліцензіат
Фізична особа-підприємець Харківська Катерина Сергіївна.

3.Реквізити ліцензії
Наказ МОЗ України від 14 серпня 2025 року № 1296.

4.Вид діяльності
Провадження господарської діяльності з медичної практики за спеціальностями, передбаченими додатком до ліцензії, за адресою розташування Центру.

5.Спеціальності
— дерматовенерологія
— ендокринологія
— ультразвукова діагностика
— акушерство та гінекологія
— гастроентерологія
— урологія
— подологія
— дієтологія
— організація та управління охороною здоров'я

6.Перевірка чинності
Перевірити чинність ліцензії можна у Єдиному державному реєстрі юридичних осіб, фізичних осіб-підприємців та громадських формувань або на офіційному порталі МОЗ України.

7.Контакт для запитів
З питань, що стосуються ліцензії та обсягу медичних послуг, звертайтеся до адміністрації Центру за телефоном або електронною поштою, вказаними на сторінці контактів.`;

const licenseRu = `Центр долголетия и качества жизни «GENEVITY» осуществляет медицинскую практику на основании действующей лицензии, выданной Министерством здравоохранения Украины.

ФЛП Харьковская Екатерина Сергеевна

от 14.08.2025 № 1296

1.Лицензирующий орган
Министерство здравоохранения Украины.

2.Лицензиат
Физическое лицо-предприниматель Харьковская Екатерина Сергеевна.

3.Реквизиты лицензии
Приказ Министерства здравоохранения Украины от 14 августа 2025 года № 1296.

4.Вид деятельности
Осуществление хозяйственной деятельности по медицинской практике по специальностям, предусмотренным приложением к лицензии, по адресу расположения Центра.

5.Специальности
— дерматовенерология
— эндокринология
— ультразвуковая диагностика
— акушерство и гинекология
— гастроэнтерология
— урология
— подология
— диетология
— организация и управление здравоохранением

6.Проверка действительности
Проверить действительность лицензии можно в Едином государственном реестре юридических лиц, физических лиц-предпринимателей и общественных формирований или на официальном портале Министерства здравоохранения Украины.

7.Контакт для запросов
По вопросам, касающимся лицензии и объёма медицинских услуг, обращайтесь в администрацию Центра по телефону или электронной почте, указанным на странице контактов.`;

const licenseEn = `GENEVITY Longevity and Quality of Life Center conducts medical practice under a valid license issued by the Ministry of Health of Ukraine.

Individual Entrepreneur Kateryna Kharkivska

dated 14.08.2025 No. 1296

1.Licensing authority
Ministry of Health of Ukraine.

2.Licensee
Individual Entrepreneur Kateryna Kharkivska.

3.License details
Order of the Ministry of Health of Ukraine No. 1296 dated 14 August 2025.

4.Activity scope
Commercial medical practice in the specialties listed in the license annex, at the Center's location.

5.Specialties
— Dermatovenereology
— Endocrinology
— Ultrasound diagnostics
— Obstetrics and gynecology
— Gastroenterology
— Urology
— Podology
— Dietetics
— Healthcare management and administration

6.License verification
License validity can be verified in the Unified State Register of Legal Entities, Individual Entrepreneurs and Public Formations or on the official Ministry of Health of Ukraine portal.

7.Contact for inquiries
For questions regarding the license and the scope of medical services, please contact the Center's administration using the phone number or email address listed on the contacts page.`;

/* ---------- 2. Air raid rules ---------- */

const airRaidUk = `Шановні відвідувачі Центру довголіття та якості життя «GENEVITY».

Сповіщення про повітряну тривогу — це сигнал «Увага всім!», що повідомляє про загрозу виникнення або виникнення надзвичайних ситуацій загальнодержавного рівня. Загальна тривалість попереджувального сигналу може становити 3–5 хвилин. Просимо завчасно ознайомитися з цими правилами та чітко дотримуватися їх.

1.Початок тривоги
Щойно прозвучить сигнал сирени або надійде повідомлення від офіційних застосунків оповіщення, усі пацієнти, гості та супроводжуючі особи мають одразу прямувати до найближчого укриття. Виконуйте вказівки адміністраторів та медичного персоналу.

2.Маршрут до укриття
Рухайтеся спокійно, не поспішаючи, без паніки. Слідкуйте за людьми поруч, особливо людьми похилого віку, маломобільними та дітьми. Персонал Центру допоможе організувати рух та супровід.

3.Поведінка в укритті
Зберігайте спокій, не створюйте шуму. Тримайтеся разом зі своєю групою. Вимкніть звук мобільних телефонів, щоб чути оголошення. Слідкуйте за офіційними каналами інформації.

4.Відбій тривоги
Покинути укриття можна лише після оголошення «ВІДБІЙ ПОВІТРЯНОЇ ТРИВОГИ» та за вказівкою адміністратора Центру чи відповідального медичного персоналу.

5.Відповідальність
Медичний центр не несе відповідальності за життя і здоров'я пацієнта, супроводжуючої особи або гостя, які відмовляються пройти до укриття після початку повітряної тривоги.

6.Найближчі укриття
— просп. Гагаріна, буд. 67 — Український державний хіміко-технологічний університет
— вул. Пісаржевського, 1А — ДП «Науково-дослідний та конструкторсько-технологічний інститут трубної промисловості ім. Я. Ю. Осади»`;

const airRaidRu = `Уважаемые посетители Центра долголетия и качества жизни «GENEVITY».

Оповещение о воздушной тревоге — это сигнал «Внимание всем!», который сообщает об угрозе возникновения или возникновении чрезвычайных ситуаций общегосударственного уровня. Общая длительность предупредительного сигнала может составлять 3–5 минут. Пожалуйста, заранее ознакомьтесь с этими правилами и чётко им следуйте.

1.Начало тревоги
Как только прозвучит сигнал сирены или поступит оповещение от официальных приложений, все пациенты, гости и сопровождающие лица должны немедленно проследовать в ближайшее укрытие. Выполняйте указания администраторов и медицинского персонала.

2.Маршрут в укрытие
Двигайтесь спокойно, не торопясь, без паники. Обращайте внимание на людей рядом, особенно пожилых, маломобильных и детей. Персонал Центра поможет организовать движение и сопровождение.

3.Поведение в укрытии
Сохраняйте спокойствие, не создавайте шума. Держитесь вместе со своей группой. Отключите звук мобильных телефонов, чтобы слышать объявления. Следите за официальными источниками информации.

4.Отбой тревоги
Покинуть укрытие можно только после объявления «ОТБОЙ ВОЗДУШНОЙ ТРЕВОГИ» и по указанию администратора Центра или ответственного медицинского персонала.

5.Ответственность
Медицинский центр не несёт ответственности за жизнь и здоровье пациента, сопровождающего лица или гостя, которые отказываются пройти в укрытие после начала воздушной тревоги.

6.Ближайшие укрытия
— просп. Гагарина, д. 67 — Украинский государственный химико-технологический университет
— ул. Писаржевского, 1А — ГП «Научно-исследовательский и конструкторско-технологический институт трубной промышленности им. Я. Е. Осады»`;

const airRaidEn = `Dear visitors of the GENEVITY Longevity and Quality of Life Center.

An air raid alert is an "Attention All!" signal warning of the threat or occurrence of national-level emergencies. The total warning signal duration may be 3–5 minutes. Please review these procedures in advance and follow them closely.

1.When the alert begins
As soon as the siren sounds or a notification arrives from official alert apps, all patients, guests, and accompanying persons must immediately proceed to the nearest shelter. Follow the instructions of administrators and medical staff.

2.Route to the shelter
Move calmly, without rushing or panic. Pay attention to those around you, especially the elderly, people with reduced mobility, and children. Center staff will help organize movement and assistance.

3.While in the shelter
Stay calm and keep quiet. Remain with your group. Mute your phones so you can hear announcements. Follow official information channels only.

4.All-clear
You may leave the shelter only after the "ALL CLEAR" announcement and on the instructions of the Center's administrator or responsible medical staff.

5.Liability
The medical center bears no responsibility for the life or health of a patient, accompanying person, or guest who refuses to enter the shelter after an air raid alert has begun.

6.Nearest shelters
— 67 Gagarin Avenue — Ukrainian State University of Chemical Technology
— 1A Pisarzhevsky Street — Y. Osada Research and Design-Technological Institute of the Pipe Industry`;

/* ---------- 3. Privacy policy ---------- */

const privacyUk = `Це Положення визначає порядок, умови, цілі та процедури збору, обробки, зберігання, використання, передачі та захисту персональних даних клієнтів, відвідувачів і користувачів сайту Центру довголіття та якості життя «GENEVITY».

ФОП Харківська Катерина Сергіївна

1.Загальні положення
Положення розроблено відповідно до Конституції України, Закону України «Про захист персональних даних», Закону України «Про інформацію» та інших нормативно-правових актів. Використовуючи сайт або послуги Центру, ви надаєте згоду на обробку ваших персональних даних на умовах цього Положення.

2.Володілець та розпорядник даних
Володільцем персональних даних є ФОП Харківська Катерина Сергіївна (Центр довголіття та якості життя «GENEVITY»). Контактні дані для звернень з питань захисту персональних даних — на сторінці контактів сайту.

3.Які дані ми збираємо
— прізвище, ім'я, по батькові
— дата народження
— контактні дані (телефон, e-mail, месенджери)
— відомості про стан здоров'я, надані добровільно в рамках медичної консультації
— дані про записи на прийом та відвідування
— технічні дані: IP-адреса, тип пристрою, cookies, джерело переходу на сайт

4.Мета обробки
— надання медичних та супутніх послуг
— комунікація щодо запису, нагадування про візит, післявізитний супровід
— ведення медичної документації у відповідності до законодавства
— адміністрування сайту та покращення якості сервісу
— виконання податкових та інших обов'язкових вимог законодавства
— за окремою згодою — маркетингові комунікації

5.Правові підстави
Обробка здійснюється на підставі вашої згоди, виконання договору про надання медичних послуг, виконання вимог законодавства та законних інтересів володільця даних.

6.Строк зберігання
Персональні дані зберігаються стільки, скільки це необхідно для цілей обробки та в строки, передбачені законодавством про охорону здоров'я, архівні та податкові норми. Медична документація зберігається протягом визначених законодавством строків для медичних карток і супутніх документів.

7.Передача третім особам
Персональні дані не передаються третім особам, крім випадків: на вимогу державних органів у межах законодавства; залученим процесорам даних для виконання технічних функцій (хостинг, e-mail, SMS, аналітика) на умовах договору про конфіденційність; за вашою прямою згодою.

8.Cookies та аналітика
Сайт використовує cookies та інструменти аналітики (Google Analytics, Meta Pixel) для оцінки аудиторії та покращення сервісу. Ви можете відмовитися від необов'язкових cookies у налаштуваннях браузера.

9.Ваші права
Ви маєте право: отримати інформацію про умови обробки; отримати копію своїх даних; виправити неточні дані; видалити дані за наявності законних підстав; обмежити або заперечувати проти обробки; відкликати згоду у будь-який час; звернутися зі скаргою до Уповноваженого Верховної Ради України з прав людини.

10.Заходи безпеки
Застосовуються технічні й організаційні заходи захисту даних: контроль доступу, шифрування каналів передачі, резервне копіювання, навчання персоналу принципам конфіденційності.

11.Зміни до Положення
Центр залишає за собою право оновлювати це Положення. Поточна редакція завжди доступна за цим посиланням із зазначенням дати останнього оновлення.

12.Контакт з питань даних
Для реалізації прав, відкликання згоди або подання запиту щодо персональних даних, звертайтеся до адміністрації Центру телефоном або електронною поштою, зазначеною на сторінці контактів.`;

const privacyRu = `Это Положение определяет порядок, условия, цели и процедуры сбора, обработки, хранения, использования, передачи и защиты персональных данных клиентов, посетителей и пользователей сайта Центра долголетия и качества жизни «GENEVITY».

ФЛП Харьковская Екатерина Сергеевна

1.Общие положения
Положение разработано в соответствии с Конституцией Украины, Законом Украины «О защите персональных данных», Законом Украины «Об информации» и другими нормативно-правовыми актами. Используя сайт или услуги Центра, вы даёте согласие на обработку ваших персональных данных на условиях настоящего Положения.

2.Владелец и распорядитель данных
Владельцем персональных данных является ФЛП Харьковская Екатерина Сергеевна (Центр долголетия и качества жизни «GENEVITY»). Контактные данные для обращений по вопросам защиты персональных данных — на странице контактов сайта.

3.Какие данные мы собираем
— фамилия, имя, отчество
— дата рождения
— контактные данные (телефон, e-mail, мессенджеры)
— сведения о состоянии здоровья, предоставленные добровольно в рамках медицинской консультации
— данные о записях на приём и посещениях
— технические данные: IP-адрес, тип устройства, cookies, источник перехода на сайт

4.Цели обработки
— предоставление медицинских и сопутствующих услуг
— коммуникация по записи, напоминания о визите, послевизитное сопровождение
— ведение медицинской документации в соответствии с законодательством
— администрирование сайта и улучшение качества сервиса
— выполнение налоговых и иных обязательных требований законодательства
— по отдельному согласию — маркетинговые коммуникации

5.Правовые основания
Обработка осуществляется на основании вашего согласия, исполнения договора о предоставлении медицинских услуг, выполнения требований законодательства и законных интересов владельца данных.

6.Срок хранения
Персональные данные хранятся столько, сколько это необходимо для целей обработки и в сроки, предусмотренные законодательством об охране здоровья, архивные и налоговые нормы. Медицинская документация хранится в течение установленных законодательством сроков для медицинских карт и сопутствующих документов.

7.Передача третьим лицам
Персональные данные не передаются третьим лицам, кроме случаев: по требованию государственных органов в рамках законодательства; привлечённым процессорам данных для выполнения технических функций (хостинг, e-mail, SMS, аналитика) на условиях договора о конфиденциальности; по вашему прямому согласию.

8.Cookies и аналитика
Сайт использует cookies и инструменты аналитики (Google Analytics, Meta Pixel) для оценки аудитории и улучшения сервиса. Вы можете отказаться от необязательных cookies в настройках браузера.

9.Ваши права
Вы имеете право: получить информацию об условиях обработки; получить копию своих данных; исправить неточные данные; удалить данные при наличии законных оснований; ограничить или возражать против обработки; отозвать согласие в любое время; обратиться с жалобой к Уполномоченному Верховной Рады Украины по правам человека.

10.Меры безопасности
Применяются технические и организационные меры защиты данных: контроль доступа, шифрование каналов передачи, резервное копирование, обучение персонала принципам конфиденциальности.

11.Изменения Положения
Центр оставляет за собой право обновлять настоящее Положение. Текущая редакция всегда доступна по данной ссылке с указанием даты последнего обновления.

12.Контакт по вопросам данных
Для реализации прав, отзыва согласия или подачи запроса по персональным данным обращайтесь в администрацию Центра по телефону или электронной почте, указанной на странице контактов.`;

const privacyEn = `This Policy defines the procedure, conditions, purposes, and processes for the collection, processing, storage, use, transfer, and protection of personal data of clients, visitors, and users of the GENEVITY Longevity and Quality of Life Center website.

Individual Entrepreneur Kateryna Kharkivska

1.General provisions
This Policy has been developed in accordance with the Constitution of Ukraine, the Law of Ukraine "On Personal Data Protection", the Law of Ukraine "On Information", and other regulatory acts. By using the website or services of the Center, you consent to the processing of your personal data under the terms of this Policy.

2.Data controller
The data controller is Individual Entrepreneur Kateryna Kharkivska (GENEVITY Longevity and Quality of Life Center). Contact details for data protection inquiries are listed on the website's contacts page.

3.What data we collect
— Last name, first name, patronymic
— Date of birth
— Contact details (phone, email, messengers)
— Health information voluntarily provided during medical consultation
— Data on bookings and visits
— Technical data: IP address, device type, cookies, traffic source

4.Purposes of processing
— Provision of medical and related services
— Communication about appointments, visit reminders, post-visit follow-up
— Maintaining medical records in accordance with legislation
— Site administration and service quality improvement
— Compliance with tax and other statutory requirements
— Marketing communications, subject to separate consent

5.Legal basis
Processing is carried out on the basis of your consent, performance of the contract for the provision of medical services, compliance with legal requirements, and the legitimate interests of the data controller.

6.Retention period
Personal data is retained as long as necessary for the purposes of processing and within the periods prescribed by healthcare legislation, archival, and tax regulations. Medical records are kept for the statutory periods applicable to medical files and related documents.

7.Disclosure to third parties
Personal data is not disclosed to third parties except: upon the request of state authorities within the scope of legislation; to engaged data processors for technical functions (hosting, email, SMS, analytics) under confidentiality agreements; with your explicit consent.

8.Cookies and analytics
The site uses cookies and analytics tools (Google Analytics, Meta Pixel) to measure audience and improve service. You may opt out of non-essential cookies via your browser settings.

9.Your rights
You have the right to: receive information about processing conditions; obtain a copy of your data; correct inaccurate data; request deletion on lawful grounds; restrict or object to processing; withdraw consent at any time; lodge a complaint with the Ukrainian Parliament Commissioner for Human Rights.

10.Security measures
Technical and organizational data protection measures are applied: access control, encryption of transmission channels, backups, and staff training on confidentiality principles.

11.Changes to this Policy
The Center reserves the right to update this Policy. The current version is always available at this link with the date of the last update indicated.

12.Contact for data inquiries
To exercise your rights, withdraw consent, or submit a request regarding personal data, please contact the Center's administration by phone or email as listed on the contacts page.`;

/* ---------- Seed ---------- */

async function main() {
  console.log("📄 Seeding legal document bodies...\n");

  await sql`
    UPDATE legal_docs SET body_uk = ${licenseUk}, body_ru = ${licenseRu}, body_en = ${licenseEn}
    WHERE slug = 'license'
  `;
  console.log("✓ license");

  await sql`
    UPDATE legal_docs SET body_uk = ${airRaidUk}, body_ru = ${airRaidRu}, body_en = ${airRaidEn}
    WHERE slug = 'air-raid-rules'
  `;
  console.log("✓ air-raid-rules");

  await sql`
    UPDATE legal_docs SET body_uk = ${privacyUk}, body_ru = ${privacyRu}, body_en = ${privacyEn}
    WHERE slug = 'privacy-policy'
  `;
  console.log("✓ privacy-policy");

  // Also seed the short labels that the footer uses
  await sql`UPDATE legal_docs SET short_label_uk = 'Ліцензія',                 short_label_ru = 'Лицензия',                 short_label_en = 'License'             WHERE slug = 'license'`;
  await sql`UPDATE legal_docs SET short_label_uk = 'Повітряна тривога',        short_label_ru = 'Воздушная тревога',        short_label_en = 'Air raid alert'      WHERE slug = 'air-raid-rules'`;
  await sql`UPDATE legal_docs SET short_label_uk = 'Політика конфіденційності', short_label_ru = 'Политика конфиденциальности', short_label_en = 'Privacy policy'     WHERE slug = 'privacy-policy'`;

  console.log("\n✅ All legal documents seeded in UK / RU / EN.");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
