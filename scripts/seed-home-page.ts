/**
 * Seed the "home" row into static_pages so it appears in /admin/pages
 * and is editable like every other page.
 * Run: npx tsx scripts/seed-home-page.ts
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

async function main() {
  await sql`
    INSERT INTO static_pages (
      slug, title_uk, title_ru, title_en, h1_uk, h1_ru, h1_en,
      summary_uk, summary_ru, summary_en
    ) VALUES (
      'home',
      'Головна', 'Главная', 'Home',
      'Головна сторінка', 'Главная страница', 'Home page',
      'Homepage — hero, about, equipment, doctors, FAQ, contacts.',
      'Главная страница — hero, о центре, оборудование, врачи, FAQ, контакты.',
      'Homepage — hero, about, equipment, doctors, FAQ, contacts.'
    )
    ON CONFLICT (slug) DO NOTHING
  `;
  console.log("✓ static_pages.home seeded");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
