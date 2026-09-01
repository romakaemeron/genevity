/**
 * UI strings for the RoApp-backed online booking wizard (TZ #10 §2).
 *
 * Replaces the earlier placeholder `booking.*` keys from the parked version:
 * the flow is now five steps instead of six, slots are real rather than
 * indicative, and there are new failure states (slot taken, RoApp unreachable).
 * Keys that changed meaning are overwritten; the rest are left alone.
 *
 * Run: npx tsx scripts/seed-booking-ui-strings.ts
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

type L = { uk: string; ru: string; en: string };

const BOOKING: Record<string, L> = {
  title: {
    uk: "Онлайн-запис на прийом",
    ru: "Онлайн-запись на приём",
    en: "Book an appointment online",
  },
  subtitle: {
    uk: "Оберіть лікаря, послугу та вільний час — запис одразу потрапляє в розклад клініки.",
    ru: "Выберите врача, услугу и свободное время — запись сразу попадает в расписание клиники.",
    en: "Choose a doctor, a service and a free time — your appointment goes straight into the clinic's schedule.",
  },
  navLabel: { uk: "Онлайн-запис", ru: "Онлайн-запись", en: "Book online" },

  startHeading: {
    uk: "З чого почнемо?",
    ru: "С чего начнём?",
    en: "Where would you like to start?",
  },
  startByDoctor: {
    uk: "Обрати лікаря",
    ru: "Выбрать врача",
    en: "Choose a doctor",
  },
  startByDoctorHint: {
    uk: "Якщо ви вже знаєте, до кого хочете потрапити.",
    ru: "Если вы уже знаете, к кому хотите попасть.",
    en: "If you already know who you want to see.",
  },
  startByService: {
    uk: "Обрати послугу",
    ru: "Выбрать услугу",
    en: "Choose a service",
  },
  startByServiceHint: {
    uk: "Якщо знаєте процедуру, але не лікаря.",
    ru: "Если знаете процедуру, но не врача.",
    en: "If you know the procedure but not the doctor.",
  },

  // Entry + step 1/2 framing
  startSub: {
    uk: "Оберіть послугу або лікаря — далі покажемо вільний час і запишемо вас у розклад клініки.",
    ru: "Выберите услугу или врача — дальше покажем свободное время и запишем вас в расписание клиники.",
    en: "Pick a service or a doctor — then choose a free time and we'll put you in the clinic's schedule.",
  },
  startWithService: { uk: "Почати з послуги", ru: "Начать с услуги", en: "Start with a service" },
  startWithDoctor:  { uk: "Почати з лікаря",  ru: "Начать с врача",  en: "Start with a doctor" },
  notSureEyebrow:   { uk: "Найпростіший шлях", ru: "Самый простой путь", en: "Simplest option" },
  step2DoctorTitle: { uk: "До кого записуємо?", ru: "К кому записываем?", en: "Who will you see?" },
  step2DoctorSub: {
    uk: "Оберіть лікаря — далі побачите його справжній розклад із вільними годинами.",
    ru: "Выберите врача — дальше увидите его реальное расписание со свободными часами.",
    en: "Choose a doctor — you'll then see their real schedule with the free hours.",
  },
  step2ServiceTitle: { uk: "Що записуємо?", ru: "Что записываем?", en: "What are we booking?" },
  step2ServiceSub: {
    uk: "Від послуги залежить тривалість і вартість візиту.",
    ru: "От услуги зависит длительность и стоимость визита.",
    en: "The service sets how long the visit takes and what it costs.",
  },
  whenSub: { uk: "Справжній розклад:", ru: "Реальное расписание:", en: "Live schedule:" },
  contactSub: {
    uk: "Адміністратор зателефонує, щоб підтвердити візит. Рекламних розсилок не надсилаємо.",
    ru: "Администратор позвонит, чтобы подтвердить визит. Рекламных рассылок не отправляем.",
    en: "Our administrator will call to confirm. We don't send marketing messages.",
  },
  summarySub: {
    uk: "Усе ще можна змінити — запис поки не створено.",
    ru: "Всё ещё можно изменить — запись пока не создана.",
    en: "Anything can still be changed — nothing is booked yet.",
  },
  durationLabel: { uk: "Тривалість", ru: "Длительность", en: "Duration" },

  // Nav hints
  hintPickDoctor:  { uk: "Оберіть лікаря",     ru: "Выберите врача",      en: "Pick a doctor" },
  hintPickService: { uk: "Оберіть послугу",    ru: "Выберите услугу",     en: "Pick a service" },
  hintPickWhen:    { uk: "Оберіть дату й час", ru: "Выберите дату и время", en: "Pick a date and time" },
  hintContact:     { uk: "Потрібні імʼя та телефон", ru: "Нужны имя и телефон", en: "Name and phone required" },

  // Confirmation screen
  bookingNumber: { uk: "Номер запису", ru: "Номер записи", en: "Booking number" },
  addressLabel:  { uk: "Адреса",       ru: "Адрес",        en: "Address" },
  whatNext:      { uk: "Що далі",      ru: "Что дальше",   en: "What happens next" },
  next1Title: { uk: "Дзвінок для підтвердження", ru: "Звонок для подтверждения", en: "A confirmation call" },
  next1Body: {
    uk: "Адміністратор зателефонує у робочі години, щоб підтвердити візит.",
    ru: "Администратор позвонит в рабочие часы, чтобы подтвердить визит.",
    en: "Our administrator will call during clinic hours to confirm.",
  },
  next2Title: { uk: "Додайте візит у календар", ru: "Добавьте визит в календарь", en: "Add it to your calendar" },
  next2Body: {
    uk: "Кнопка нижче збереже дату, час і адресу у ваш календар.",
    ru: "Кнопка ниже сохранит дату, время и адрес в ваш календарь.",
    en: "The button below saves the date, time and address to your calendar.",
  },
  next3Title: { uk: "Приходьте на 10 хвилин раніше", ru: "Приходите на 10 минут раньше", en: "Come 10 minutes early" },
  next3Body: {
    uk: "Візьміть документ і попередні результати обстежень, якщо вони є.",
    ru: "Возьмите документ и предыдущие результаты обследований, если они есть.",
    en: "Bring an ID and any previous test results you have.",
  },
  addToCalendar: { uk: "Додати в календар", ru: "Добавить в календарь", en: "Add to calendar" },
  asideNote: {
    uk: "Запис займає близько хвилини. Час підтверджує адміністратор — якщо плани зміняться, попередьте нас заздалегідь.",
    ru: "Запись занимает около минуты. Время подтверждает администратор — если планы изменятся, предупредите нас заранее.",
    en: "Booking takes about a minute. The time is confirmed by our administrator — if your plans change, let us know in advance.",
  },

  // Live summary rail
  railTitle:      { uk: "Ваш запис",    ru: "Ваша запись",   en: "Your visit" },
  railPatient:    { uk: "Пацієнт",      ru: "Пациент",       en: "Patient" },
  railTotal:      { uk: "Разом",        ru: "Итого",         en: "Total" },
  railNotChosen:  { uk: "не обрано",    ru: "не выбрано",    en: "not selected" },
  railNotFilled:  { uk: "не заповнено", ru: "не заполнено",  en: "not filled in" },

  // Steps
  stepDoctor:  { uk: "Лікар",         ru: "Врач",           en: "Doctor" },
  stepService: { uk: "Послуга",       ru: "Услуга",         en: "Service" },
  stepWhen:    { uk: "Дата й час",    ru: "Дата и время",   en: "Date & time" },
  stepContact: { uk: "Контакти",      ru: "Контакты",       en: "Contact details" },
  stepConfirm: { uk: "Підтвердження", ru: "Подтверждение",  en: "Confirmation" },

  doctorHeading: {
    uk: "До якого лікаря вас записати?",
    ru: "К какому врачу вас записать?",
    en: "Which doctor would you like to see?",
  },
  nextAvailable: {
    uk: "Найближчий запис:",
    ru: "Ближайшая запись:",
    en: "Next available:",
  },

  serviceHeading: { uk: "Оберіть послугу", ru: "Выберите услугу", en: "Choose a service" },
  serviceHint: {
    uk: "Якщо не впевнені — оберіть консультацію, і лікар підбере все на місці.",
    ru: "Если не уверены — выберите консультацию, и врач подберёт всё на месте.",
    en: "Not sure? Pick a consultation and the doctor will advise at your visit.",
  },
  serviceSearch: { uk: "Пошук послуги", ru: "Поиск услуги", en: "Search services" },
  serviceNoMatch: {
    uk: "Нічого не знайдено. Спробуйте іншу назву.",
    ru: "Ничего не найдено. Попробуйте другое название.",
    en: "Nothing found. Try another name.",
  },
  otherServices: { uk: "Інші послуги", ru: "Другие услуги", en: "Other services" },
  anyService: {
    uk: "Потрібна консультація — визначимось на місці",
    ru: "Нужна консультация — определимся на месте",
    en: "I need a consultation — we'll decide at the visit",
  },

  whenHeading: { uk: "Оберіть дату й час", ru: "Выберите дату и время", en: "Choose a date and time" },
  calendarLegend: {
    uk: "Підсвічені дні мають вільні години",
    ru: "Подсвеченные дни имеют свободные часы",
    en: "Highlighted days have free hours",
  },
  pickDayFirst: {
    uk: "Оберіть день у календарі, щоб побачити вільні години.",
    ru: "Выберите день в календаре, чтобы увидеть свободные часы.",
    en: "Pick a day in the calendar to see the free hours.",
  },
  morning:   { uk: "Ранок", ru: "Утро",  en: "Morning" },
  afternoon: { uk: "День",  ru: "День",  en: "Afternoon" },
  evening:   { uk: "Вечір", ru: "Вечер", en: "Evening" },
  hourShort: { uk: "год",   ru: "ч",     en: "hr" },
  minShort:  { uk: "хв",    ru: "мин",   en: "min" },
  noSlotsTitle: {
    uk: "У цього лікаря зараз немає вільних годин",
    ru: "У этого врача сейчас нет свободных часов",
    en: "This doctor has no free hours right now",
  },
  noSlotsText: {
    uk: "Оберіть іншого лікаря або зателефонуйте нам — підберемо час.",
    ru: "Выберите другого врача или позвоните нам — подберём время.",
    en: "Choose another doctor or call us and we'll find a time.",
  },

  contactHeading: { uk: "Ваші контактні дані", ru: "Ваши контактные данные", en: "Your contact details" },
  nameLabel:  { uk: "Ім'я та прізвище", ru: "Имя и фамилия", en: "Full name" },
  phoneLabel: { uk: "Телефон", ru: "Телефон", en: "Phone" },
  commentLabel: {
    uk: "Коментар (не обов'язково)",
    ru: "Комментарий (необязательно)",
    en: "Comment (optional)",
  },
  commentPlaceholder: {
    uk: "Що вас турбує або що варто знати лікарю",
    ru: "Что вас беспокоит или что стоит знать врачу",
    en: "What brings you in, or anything the doctor should know",
  },
  privacyNote: {
    uk: "Надсилаючи заявку, ви погоджуєтесь на обробку персональних даних.",
    ru: "Отправляя заявку, вы соглашаетесь на обработку персональных данных.",
    en: "By submitting the form you consent to the processing of your personal data.",
  },

  summaryHeading: { uk: "Перевірте деталі запису", ru: "Проверьте детали записи", en: "Check your appointment" },
  confirmNote: {
    uk: "Ми зателефонуємо, щоб підтвердити візит. Якщо плани зміняться — попередьте нас заздалегідь.",
    ru: "Мы позвоним, чтобы подтвердить визит. Если планы изменятся — предупредите нас заранее.",
    en: "We'll call to confirm your visit. If your plans change, please let us know in advance.",
  },
  back:    { uk: "Назад",   ru: "Назад",    en: "Back" },
  next:    { uk: "Далі",    ru: "Далее",    en: "Next" },
  change:  { uk: "Змінити", ru: "Изменить", en: "Change" },
  confirm: { uk: "Записатися", ru: "Записаться", en: "Book appointment" },
  sending: { uk: "Записуємо…", ru: "Записываем…", en: "Booking…" },

  successTitle: { uk: "Вас записано", ru: "Вы записаны", en: "You're booked" },
  successText: {
    uk: "Запис уже в розкладі клініки. Адміністратор зателефонує, щоб підтвердити візит.",
    ru: "Запись уже в расписании клиники. Администратор позвонит, чтобы подтвердить визит.",
    en: "Your appointment is in the clinic's schedule. Our administrator will call to confirm.",
  },
  successAgain: { uk: "Записатися ще раз", ru: "Записаться ещё раз", en: "Book another appointment" },

  errorName: {
    uk: "Вкажіть, будь ласка, ваше ім'я",
    ru: "Укажите, пожалуйста, ваше имя",
    en: "Please enter your name",
  },
  errorPhone: {
    uk: "Вкажіть коректний номер телефону",
    ru: "Укажите корректный номер телефона",
    en: "Please enter a valid phone number",
  },
  errorSlotTaken: {
    uk: "Цей час щойно зайняли. Оберіть, будь ласка, інший — список уже оновлено.",
    ru: "Это время только что заняли. Выберите, пожалуйста, другое — список уже обновлён.",
    en: "That time was just taken. Please choose another — the list is already updated.",
  },
  errorUnavailable: {
    uk: "Не вдалося зв'язатися з системою запису. Зателефонуйте нам, і ми запишемо вас вручну.",
    ru: "Не удалось связаться с системой записи. Позвоните нам, и мы запишем вас вручную.",
    en: "We couldn't reach the booking system. Call us and we'll book you in manually.",
  },
  errorGeneric: {
    uk: "Не вдалося завершити запис. Спробуйте ще раз або зателефонуйте нам.",
    ru: "Не удалось завершить запись. Попробуйте ещё раз или позвоните нам.",
    en: "We couldn't complete the booking. Please try again or give us a call.",
  },

  // The slot-taken modal. `errorSlotTaken` stays as the note that persists on
  // the calendar step after the modal has dismissed itself.
  slotTakenTitle: {
    uk: "Цей час уже зайняли",
    ru: "Это время уже заняли",
    en: "That time has just been taken",
  },
  slotTakenText: {
    uk: "Поки ви заповнювали дані, слот зайняв інший пацієнт. Ми вже оновили список вільних годин.",
    ru: "Пока вы заполняли данные, слот занял другой пациент. Мы уже обновили список свободных часов.",
    en: "Another patient booked it while you were filling in your details. The list of free times is already refreshed.",
  },
  slotTakenCta: {
    uk: "Обрати інший час",
    ru: "Выбрать другое время",
    en: "Choose another time",
  },
  close: { uk: "Закрити", ru: "Закрыть", en: "Close" },

  // WhatsApp consent. Names what will be sent and by whom — an opt-in that
  // doesn't say what you're agreeing to isn't much of one.
  whatsappOptIn: {
    uk: "Надіслати підтвердження у WhatsApp",
    ru: "Отправить подтверждение в WhatsApp",
    en: "Send me a WhatsApp confirmation",
  },
  whatsappOptInHint: {
    uk: "Надішлемо дату, час, лікаря та адресу на цей номер. Одне повідомлення, без розсилок.",
    ru: "Отправим дату, время, врача и адрес на этот номер. Одно сообщение, без рассылок.",
    en: "We'll send the date, time, doctor and address to this number. One message, no marketing.",
  },

  unavailableTitle: {
    uk: "Онлайн-запис тимчасово недоступний",
    ru: "Онлайн-запись временно недоступна",
    en: "Online booking is temporarily unavailable",
  },
  unavailableText: {
    uk: "Зателефонуйте нам — адміністратор запише вас на зручний час.",
    ru: "Позвоните нам — администратор запишет вас на удобное время.",
    en: "Give us a call and our administrator will book a convenient time for you.",
  },
  unavailableCta: {
    uk: "Записатися на сторінці клініки",
    ru: "Записаться на странице клиники",
    en: "Book on the clinic's page",
  },
};

/** Keys whose meaning changed when the wizard was rebuilt on RoApp. */
const OVERWRITE = new Set([
  "startHeading",
  "serviceHint",
  "subtitle", "stepDoctor", "stepService", "stepConfirm", "doctorHeading",
  "serviceHeading", "anyService", "confirm", "sending", "successTitle",
  "successText", "commentPlaceholder", "privacyNote", "summaryHeading",
]);

/** Keys from the parked six-step version that no longer exist. */
const REMOVE = [
  "anyService", "notSureEyebrow",
  "startByDoctor", "startByDoctorHint", "startByService", "startByServiceHint",
  "serviceHint", "confirmNote2",
  "stepDate", "stepTime", "dateHeading", "timeHeading", "anyDoctor",
  "noServicesForDoctor", "slotsNote", "noSlots", "today", "tomorrow",
];

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.booking = tree.booking || {};

  let added = 0;
  let updated = 0;
  for (const [key, value] of Object.entries(BOOKING)) {
    if (!tree.booking[key]) { tree.booking[key] = value; added += 1; }
    else if (OVERWRITE.has(key)) { tree.booking[key] = value; updated += 1; }
  }
  let removed = 0;
  for (const key of REMOVE) {
    if (tree.booking[key]) { delete tree.booking[key]; removed += 1; }
  }

  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  console.log(`✓ booking strings: ${added} added, ${updated} updated, ${removed} removed`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
