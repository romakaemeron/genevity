/**
 * Sets Вероніка Полуніна's stated experience to "11+" everywhere, per the
 * client's instruction.
 *
 * Before this, three different numbers were live at once: the SEO title and
 * description said 14 years, the experience chip said 11, and the new bio says
 * "понад 11 років". The client's call is 11+, so the metatags come down to
 * match the bio rather than the bio going up to match them.
 *
 * Her professional designation is left exactly as it was — "медична сестра-
 * косметолог" in the metatags — because that is what her questionnaire states
 * (Спеціалізація: «Мед сестра», Освіта: «Середня медична»).
 *
 * Note: the metatags were authored by the SEO agency in a ТЗ CSV. This edit
 * overrides their copy on the client's instruction; if Inweb re-issues that
 * CSV, the 14 will come back unless they update it too.
 *
 *   npx tsx scripts/update-polunina-experience.mts          # dry run
 *   npx tsx scripts/update-polunina-experience.mts --apply
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const APPLY = process.argv.includes("--apply");
const SLUG = "polunina-veronika";

const next: Record<string, string> = {
  seo_title_uk: "Полуніна Вероніка Вадимівна Медична сестра-косметолог з досвідом 11+ років",
  seo_title_ru: "Полунина Вероника Вадимовна Медицинская сестра-косметолог с опытом 11+ лет",
  seo_title_en: "Veronika Polunina Medical Nurse-Cosmetologist with 11+ years of experience",
  seo_desc_uk: "Медична сестра-косметолог Полуніна Вероніка Вадимівна з досвідом роботи 11+ років 🤍 Консультація в GENEVITY 💫 Запис онлайн.",
  seo_desc_ru: "Медицинская сестра-косметолог Полунина Вероника Вадимовна с опытом работы 11+ лет 🤍 Консультация в GENEVITY 💫 Запись онлайн.",
  seo_desc_en: "Medical Nurse-Cosmetologist Veronika Polunina with 11+ years of experience 🤍 Consultation at GENEVITY 💫 Book online.",
  experience_uk: "11+ років",
  experience_ru: "11+ лет",
  experience_en: "11+ years",
};

const before = (await sql`SELECT * FROM doctors WHERE slug = ${SLUG}`)[0] as any;
if (!before) throw new Error(`Doctor not found: ${SLUG}`);

console.log(APPLY ? "APPLYING\n" : "DRY RUN — pass --apply to write\n");
let changes = 0;
for (const [col, val] of Object.entries(next)) {
  if (before[col] === val) { console.log(`  = ${col} (already set)`); continue; }
  changes++;
  console.log(`  ✓ ${col}\n      було:  ${before[col]}\n      стане: ${val}`);
}

// Nothing outside these columns should still claim 14 years.
const leftovers = Object.entries(before)
  .filter(([col, v]) => typeof v === "string" && /\b14\b/.test(v) && !(col in next))
  .map(([col]) => col);
if (leftovers.length) console.log(`\n  ⚠ ще згадують 14: ${leftovers.join(", ")}`);

if (APPLY && changes) {
  if (!existsSync("scripts/backups")) mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/polunina-experience-rollback-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(before, null, 2));
  await sql`UPDATE doctors SET
              seo_title_uk = ${next.seo_title_uk}, seo_title_ru = ${next.seo_title_ru}, seo_title_en = ${next.seo_title_en},
              seo_desc_uk = ${next.seo_desc_uk}, seo_desc_ru = ${next.seo_desc_ru}, seo_desc_en = ${next.seo_desc_en},
              experience_uk = ${next.experience_uk}, experience_ru = ${next.experience_ru}, experience_en = ${next.experience_en},
              updated_at = now()
            WHERE slug = ${SLUG}`;
  console.log(`\nUpdated ${changes} field(s). Previous row saved to ${file}`);
}
