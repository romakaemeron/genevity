/**
 * Homepage H1: "центр довголіття та естетичної медицини" → "центр довголіття
 * та якості життя", in all three locales.
 *
 * "Якість життя" is the clinic's own registered wording — its quality policy
 * and personal-data regulation both name it «ЦЕНТР ДОВГОЛІТТЯ ТА ЯКОСТІ ЖИТТЯ
 * "GENEVITY"» — so the H1 now matches the legal name.
 *
 * The "GENEVITY - " prefix and the "у Дніпрі" suffix are deliberately kept:
 * only the descriptor changes, and the city carries local-search weight.
 *
 * Idempotent. Run: npx tsx scripts/update-hero-h1.ts [--dry]
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
envContent.split("\n").forEach((l) => {
  const m = l.match(/^([^#=\s]+)=(.+)/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});

const sql = postgres(process.env.DATABASE_URL!);
const DRY = process.argv.includes("--dry");

const NEXT = {
  uk: "GENEVITY - центр довголіття та якості життя у Дніпрі",
  ru: "GENEVITY - центр долголетия и качества жизни в Днепре",
  en: "GENEVITY - Longevity & Quality of Life Center in Dnipro",
};

async function run() {
  const [before] = await sql<{ title_uk: string; title_ru: string; title_en: string }[]>`
    SELECT title_uk, title_ru, title_en FROM hero WHERE id = 1
  `;
  if (!before) throw new Error("hero row id=1 not found");

  for (const l of ["uk", "ru", "en"] as const) {
    const from = before[`title_${l}`];
    const to = NEXT[l];
    console.log(`${l}: ${from === to ? "(already set)" : `\n  - ${from}\n  + ${to}`}`);
  }

  if (DRY) {
    console.log("\nDry run — nothing written.");
    await sql.end();
    return;
  }

  await sql`
    UPDATE hero
    SET title_uk = ${NEXT.uk}, title_ru = ${NEXT.ru}, title_en = ${NEXT.en},
        updated_at = now()
    WHERE id = 1
  `;
  console.log("\n✓ hero H1 updated in all three locales.");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
