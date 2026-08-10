/**
 * UI strings introduced by Inweb TZ #10 / #11:
 *   - eeat.reviewsAll             — "Переглянути всі відгуки" link on the
 *                                    homepage Google reviews block (§10.1)
 *   - eeat.serviceReviewsHeading  — heading of the reviews carousel on
 *                                    service pages (§10.4)
 *   - booking.*                   — the step-by-step appointment wizard (§10.2)
 *
 * Safe to re-run — existing keys are preserved.
 *
 * Run: npx tsx scripts/seed-inweb-10-11-ui-strings.ts
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

const EEAT: Record<string, L> = {
  reviewsAll: {
    uk: "Переглянути всі відгуки",
    ru: "Смотреть все отзывы",
    en: "See all reviews",
  },
  serviceReviewsHeading: {
    uk: "Відгуки про послугу",
    ru: "Отзывы об услуге",
    en: "Reviews of this service",
  },
};

const BOOKING: Record<string, L> = {
  title: {
    uk: "Онлайн-запис на прийом",
    ru: "Онлайн-запись на приём",
    en: "Book an appointment online",
  },
  subtitle: {
    uk: "Оберіть спеціаліста, послугу та зручний час — адміністратор передзвонить, щоб підтвердити запис.",
    ru: "Выберите специалиста, услугу и удобное время — администратор перезвонит, чтобы подтвердить запись.",
    en: "Choose a specialist, a service and a convenient time — our administrator will call you back to confirm.",
  },
  navLabel: { uk: "Онлайн-запис", ru: "Онлайн-запись", en: "Book online" },

  // Step titles
  stepDoctor:  { uk: "Спеціаліст", ru: "Специалист", en: "Specialist" },
  stepService: { uk: "Послуга",    ru: "Услуга",     en: "Service" },
  stepDate:    { uk: "Дата",       ru: "Дата",       en: "Date" },
  stepTime:    { uk: "Час",        ru: "Время",      en: "Time" },
  stepContact: { uk: "Контакти",   ru: "Контакты",   en: "Contact details" },
  stepConfirm: { uk: "Підтвердження", ru: "Подтверждение", en: "Confirmation" },

  // Step headings / helpers
  doctorHeading: {
    uk: "До якого спеціаліста ви хочете записатися?",
    ru: "К какому специалисту вы хотите записаться?",
    en: "Which specialist would you like to see?",
  },
  serviceHeading: {
    uk: "Оберіть послугу",
    ru: "Выберите услугу",
    en: "Choose a service",
  },
  dateHeading: {
    uk: "Оберіть зручну дату",
    ru: "Выберите удобную дату",
    en: "Choose a date",
  },
  timeHeading: {
    uk: "Оберіть зручний час",
    ru: "Выберите удобное время",
    en: "Choose a time",
  },
  contactHeading: {
    uk: "Ваші контактні дані",
    ru: "Ваши контактные данные",
    en: "Your contact details",
  },
  anyDoctor: {
    uk: "Будь-який доступний спеціаліст",
    ru: "Любой доступный специалист",
    en: "Any available specialist",
  },
  anyService: {
    uk: "Ще не визначився / потрібна консультація",
    ru: "Ещё не определился / нужна консультация",
    en: "Not sure yet / I need a consultation",
  },
  noServicesForDoctor: {
    uk: "Для цього спеціаліста послуги ще не додані — оберіть консультацію нижче.",
    ru: "Для этого специалиста услуги ещё не добавлены — выберите консультацию ниже.",
    en: "No services listed for this specialist yet — pick a consultation below.",
  },
  slotsNote: {
    uk: "Час орієнтовний. Адміністратор підтвердить його під час дзвінка.",
    ru: "Время ориентировочное. Администратор подтвердит его во время звонка.",
    en: "Times are indicative. Our administrator will confirm the exact slot by phone.",
  },
  noSlots: {
    uk: "На цю дату вільних годин немає — оберіть іншу.",
    ru: "На эту дату свободных часов нет — выберите другую.",
    en: "No slots left on this date — please pick another.",
  },
  morning:   { uk: "Ранок",  ru: "Утро",   en: "Morning" },
  afternoon: { uk: "День",   ru: "День",   en: "Afternoon" },
  evening:   { uk: "Вечір",  ru: "Вечер",  en: "Evening" },
  today:     { uk: "Сьогодні", ru: "Сегодня", en: "Today" },
  tomorrow:  { uk: "Завтра", ru: "Завтра", en: "Tomorrow" },

  // Summary / actions
  summaryHeading: {
    uk: "Перевірте деталі запису",
    ru: "Проверьте детали записи",
    en: "Check your appointment details",
  },
  back:    { uk: "Назад",     ru: "Назад",   en: "Back" },
  next:    { uk: "Далі",      ru: "Далее",   en: "Next" },
  change:  { uk: "Змінити",   ru: "Изменить", en: "Change" },
  confirm: { uk: "Підтвердити запис", ru: "Подтвердить запись", en: "Confirm appointment" },
  sending: { uk: "Надсилаємо…", ru: "Отправляем…", en: "Sending…" },

  nameLabel:  { uk: "Ім'я та прізвище", ru: "Имя и фамилия", en: "Full name" },
  phoneLabel: { uk: "Телефон", ru: "Телефон", en: "Phone" },
  commentLabel: {
    uk: "Коментар (не обов'язково)",
    ru: "Комментарий (необязательно)",
    en: "Comment (optional)",
  },
  commentPlaceholder: {
    uk: "Що вас турбує, побажання щодо часу тощо",
    ru: "Что вас беспокоит, пожелания по времени и т. д.",
    en: "What brings you in, timing preferences, etc.",
  },
  privacyNote: {
    uk: "Надсилаючи заявку, ви погоджуєтесь на обробку персональних даних.",
    ru: "Отправляя заявку, вы соглашаетесь на обработку персональных данных.",
    en: "By submitting the form you consent to the processing of your personal data.",
  },

  successTitle: {
    uk: "Заявку прийнято",
    ru: "Заявка принята",
    en: "Request received",
  },
  successText: {
    uk: "Дякуємо! Адміністратор зателефонує вам найближчим часом, щоб підтвердити дату й час візиту.",
    ru: "Спасибо! Администратор позвонит вам в ближайшее время, чтобы подтвердить дату и время визита.",
    en: "Thank you! Our administrator will call you shortly to confirm the date and time of your visit.",
  },
  successAgain: {
    uk: "Записатися ще раз",
    ru: "Записаться ещё раз",
    en: "Book another appointment",
  },

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
  errorGeneric: {
    uk: "Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.",
    ru: "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.",
    en: "We couldn't send your request. Please try again or give us a call.",
  },
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.eeat = tree.eeat || {};
  tree.booking = tree.booking || {};

  let added = 0;
  for (const [key, value] of Object.entries(EEAT)) {
    if (!tree.eeat[key]) { tree.eeat[key] = value; added += 1; }
  }
  for (const [key, value] of Object.entries(BOOKING)) {
    if (!tree.booking[key]) { tree.booking[key] = value; added += 1; }
  }

  if (added === 0) {
    console.log("↷ all keys already present — no changes");
  } else {
    await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
    console.log(`✓ added ${added} new eeat/booking keys`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
