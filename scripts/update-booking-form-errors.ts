/**
 * Overwrite the booking form's error strings with warmer, more
 * personal copy — the first seed planted placeholder-style messages
 * ("Phone number is required") which don't match the tone admins
 * wanted. Always overwrites, unlike the idempotent seed script.
 *
 * Run: npx tsx scripts/update-booking-form-errors.ts
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

const UPDATES: Record<string, { uk: string; ru: string; en: string }> = {
  errorNameRequired: {
    uk: "Як до вас звертатися? Нам важливо знати, як вас називати.",
    ru: "Как к вам обращаться? Нам важно знать, как вас называть.",
    en: "How should we call you? We'd love to greet you by name.",
  },
  errorPhoneRequired: {
    uk: "Залиште ваш номер — ми передзвонимо протягом робочого дня.",
    ru: "Оставьте ваш номер — мы перезвоним в течение рабочего дня.",
    en: "Leave your number — we'll ring you back during working hours.",
  },
  errorGeneric: {
    uk: "Щось пішло не так. Спробуйте ще раз за хвилинку — ми вже розбираємося.",
    ru: "Что-то пошло не так. Попробуйте через минутку — мы уже разбираемся.",
    en: "Something went sideways on our end. Give it another try in a minute.",
  },
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.ctaForm = tree.ctaForm || {};
  for (const [key, value] of Object.entries(UPDATES)) {
    tree.ctaForm[key] = value;
  }
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  console.log(`✓ updated ${Object.keys(UPDATES).length} booking form error messages`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
