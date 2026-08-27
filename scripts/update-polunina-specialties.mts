/**
 * Aligns Вероніка Полуніна's specialty chips with the client-supplied bio
 * ("Врачи на сайт дженевети/Полуніна Вероніка.txt", section "Професійні
 * напрямки") in all three locales.
 *
 * The old chips (доглядові процедури, проблемна шкіра, підбір домашнього
 * догляду) predate the new positioning and contradicted both the new bio and
 * her own questionnaire ("Апаратна, доглядова, ін'єкційна косметологія").
 *
 * Deliberately NOT touched here — they are credential claims and need the
 * client's word, see the note in the PR:
 *   - role / experience: DB says "Косметолог / 11 років"; the questionnaire
 *     says "Мед сестра", practice since 02.09.2011 (≈14 years)
 *   - seo_title / seo_desc: "Медична сестра-косметолог з досвідом 14 років",
 *     which matches the questionnaire and was set by the SEO agency
 *
 *   npx tsx scripts/update-polunina-specialties.mts          # dry run
 *   npx tsx scripts/update-polunina-specialties.mts --apply
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const APPLY = process.argv.includes("--apply");
const SLUG = "polunina-veronika";

/** "Професійні напрямки" from the client's text, plus the care procedures her
 *  questionnaire lists — the bio omits them, but they are part of her practice. */
const specialties = {
  uk: [
    "Апаратні методики омолодження нового покоління",
    "Комплексні anti-age програми",
    "Персоналізовані протоколи корекції вікових змін",
    "Ін’єкційна косметологія преміум-рівня",
    "Доглядові косметологічні процедури",
  ],
  ru: [
    "Аппаратные методики омоложения нового поколения",
    "Комплексные anti-age программы",
    "Персонализированные протоколы коррекции возрастных изменений",
    "Инъекционная косметология премиум-уровня",
    "Уходовые косметологические процедуры",
  ],
  en: [
    "Next-generation device-based rejuvenation",
    "Comprehensive anti-age programmes",
    "Personalised protocols for age-related change",
    "Premium-level injectable cosmetology",
    "Cosmetological care treatments",
  ],
};

const before = (await sql`SELECT slug, name_uk, specialties_uk, specialties_ru, specialties_en FROM doctors WHERE slug = ${SLUG}`)[0] as any;
if (!before) throw new Error(`Doctor not found: ${SLUG}`);

console.log(APPLY ? "APPLYING\n" : "DRY RUN — pass --apply to write\n");
console.log(`${before.name_uk} (${SLUG})\n`);
console.log("  було:");
(before.specialties_uk ?? []).forEach((s: string) => console.log(`    − ${s}`));
console.log("  стане:");
specialties.uk.forEach((s) => console.log(`    + ${s}`));

if (APPLY) {
  if (!existsSync("scripts/backups")) mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/polunina-specialties-rollback-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(before, null, 2));
  await sql`UPDATE doctors SET
              specialties_uk = ${specialties.uk},
              specialties_ru = ${specialties.ru},
              specialties_en = ${specialties.en},
              updated_at = now()
            WHERE slug = ${SLUG}`;
  console.log(`\nUpdated. Previous values saved to ${file}`);
}
