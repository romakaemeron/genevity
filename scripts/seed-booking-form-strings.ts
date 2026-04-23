/**
 * Seed the ui_strings keys used by the new booking form (name / phone /
 * interest search / success state). Adds them under the existing
 * `ctaForm` namespace so translators have one place to edit.
 *
 * Safe to re-run — existing keys are preserved.
 *
 * Run: npx tsx scripts/seed-booking-form-strings.ts
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

const NEW_KEYS: Record<string, { uk: string; ru: string; en: string }> = {
  interestLabel: {
    uk: "Що вас цікавить?",
    ru: "Что вас интересует?",
    en: "What are you interested in?",
  },
  interestPlaceholder: {
    uk: "Оберіть процедуру або лікаря…",
    ru: "Выберите процедуру или врача…",
    en: "Pick a service or doctor…",
  },
  interestSearchPlaceholder: {
    uk: "Пошук…",
    ru: "Поиск…",
    en: "Search…",
  },
  interestGroupServices: {
    uk: "Процедури",
    ru: "Процедуры",
    en: "Services",
  },
  interestGroupDoctors: {
    uk: "Лікарі",
    ru: "Врачи",
    en: "Doctors",
  },
  interestEmpty: {
    uk: "Нічого не знайдено",
    ru: "Ничего не найдено",
    en: "No matches",
  },
  interestClear: {
    uk: "Очистити",
    ru: "Очистить",
    en: "Clear",
  },
  errorGeneric: {
    uk: "Не вдалося надіслати. Спробуйте ще раз.",
    ru: "Не удалось отправить. Попробуйте ещё раз.",
    en: "Couldn't send your request. Please try again.",
  },
  errorNameRequired: {
    uk: "Вкажіть, будь ласка, ваше ім'я",
    ru: "Укажите, пожалуйста, ваше имя",
    en: "Please enter your name",
  },
  errorPhoneRequired: {
    uk: "Номер телефону обов'язковий",
    ru: "Номер телефона обязателен",
    en: "Phone number is required",
  },
  modalTitle: {
    uk: "Записатися на консультацію",
    ru: "Записаться на консультацию",
    en: "Book a consultation",
  },
  modalSubtitle: {
    uk: "Залиште контакти — ми зателефонуємо упродовж робочого дня.",
    ru: "Оставьте контакты — мы перезвоним в течение рабочего дня.",
    en: "Leave your details — we'll call you back within the working day.",
  },
  sendingLabel: {
    uk: "Надсилаємо…",
    ru: "Отправляем…",
    en: "Sending…",
  },
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.ctaForm = tree.ctaForm || {};

  let added = 0;
  for (const [key, value] of Object.entries(NEW_KEYS)) {
    if (!tree.ctaForm[key]) {
      tree.ctaForm[key] = value;
      added += 1;
    }
  }

  if (added === 0) {
    console.log("↷ all keys already present — no changes");
  } else {
    await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
    console.log(`✓ added ${added} new ctaForm keys`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
