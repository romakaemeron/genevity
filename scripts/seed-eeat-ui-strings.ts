/**
 * Seed the ui_strings keys used by the E-E-A-T `ReviewedByBadge` and
 * `MedicalDisclaimer` components (under `eeat`), and the FAQ page
 * (under `faq`).
 *
 * Safe to re-run — existing keys are preserved, other namespaces untouched.
 *
 * Run: npx tsx scripts/seed-eeat-ui-strings.ts
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
  reviewedBy: {
    uk: "Перевірено лікарем",
    ru: "Проверено врачом",
    en: "Medically reviewed by",
  },
  updated: {
    uk: "оновлено",
    ru: "обновлено",
    en: "updated",
  },
  disclaimer: {
    uk: "Ця інформація має ознайомлювальний характер і не замінює консультацію лікаря.",
    ru: "Эта информация носит ознакомительный характер и не заменяет консультацию врача.",
    en: "This information is for general awareness and does not replace a doctor's consultation.",
  },
  sourcesHeading: {
    uk: "Джерела",
    ru: "Источники",
    en: "Sources",
  },
  licenseCaption: {
    uk: "Ліцензія на медичну практику GENEVITY",
    ru: "Лицензия на медицинскую практику GENEVITY",
    en: "GENEVITY medical practice license",
  },
  reviewsHeading: {
    uk: "Відгуки пацієнтів",
    ru: "Отзывы пациентов",
    en: "Patient reviews",
  },
  reviewsCount: {
    uk: "на основі {n} відгуків Google",
    ru: "на основе {n} отзывов Google",
    en: "based on {n} Google reviews",
  },
};

const FAQ_KEYS: Record<string, { uk: string; ru: string; en: string }> = {
  title: {
    uk: "Часті запитання",
    ru: "Частые вопросы",
    en: "Frequently asked questions",
  },
  heading: {
    uk: "Часті запитання",
    ru: "Частые вопросы",
    en: "Frequently asked questions",
  },
  subtitle: {
    uk: "Відповіді на поширені питання про запис, підготовку, оплату та безпеку.",
    ru: "Ответы на частые вопросы о записи, подготовке, оплате и безопасности.",
    en: "Answers to common questions about booking, preparation, payment and safety.",
  },
  navLabel: {
    uk: "Питання та відповіді",
    ru: "Вопросы и ответы",
    en: "FAQ",
  },
};

const FAQ_CATEGORY_KEYS: Record<string, { uk: string; ru: string; en: string }> = {
  booking: {
    uk: "Запис і консультація",
    ru: "Запись и консультация",
    en: "Booking & consultation",
  },
  preparation: {
    uk: "Підготовка до візиту",
    ru: "Подготовка к визиту",
    en: "Preparing for your visit",
  },
  payment: {
    uk: "Оплата і документи",
    ru: "Оплата и документы",
    en: "Payment & documents",
  },
  safety: {
    uk: "Безпека і гарантії",
    ru: "Безопасность и гарантии",
    en: "Safety & assurance",
  },
  lab: {
    uk: "Лабораторія і діагностика",
    ru: "Лаборатория и диагностика",
    en: "Laboratory & diagnostics",
  },
  visit: {
    uk: "Перший візит",
    ru: "Первый визит",
    en: "Your first visit",
  },
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.eeat = tree.eeat || {};
  tree.faq = tree.faq || {};
  tree.faq.categories = tree.faq.categories || {};

  let added = 0;
  for (const [key, value] of Object.entries(NEW_KEYS)) {
    if (!tree.eeat[key]) {
      tree.eeat[key] = value;
      added += 1;
    }
  }
  for (const [key, value] of Object.entries(FAQ_KEYS)) {
    if (!tree.faq[key]) {
      tree.faq[key] = value;
      added += 1;
    }
  }
  for (const [key, value] of Object.entries(FAQ_CATEGORY_KEYS)) {
    if (!tree.faq.categories[key]) {
      tree.faq.categories[key] = value;
      added += 1;
    }
  }

  if (added === 0) {
    console.log("↷ all keys already present — no changes");
  } else {
    await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
    console.log(`✓ added ${added} new eeat/faq keys`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
