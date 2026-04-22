/**
 * Check which doctors are missing RU/EN translations.
 * Run: npx tsx scripts/check-doctor-translations.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

async function main() {
  const doctors = await sql<any[]>`
    SELECT id, name_uk, name_ru, name_en, role_uk, role_ru, role_en, experience_uk, experience_ru, experience_en
    FROM doctors
    ORDER BY sort_order
  `;
  for (const d of doctors) {
    console.log("───");
    console.log(`ID: ${d.id}`);
    console.log(`  UK: name="${d.name_uk}" role="${d.role_uk}" exp="${d.experience_uk}"`);
    console.log(`  RU: name="${d.name_ru}" role="${d.role_ru}" exp="${d.experience_ru}"`);
    console.log(`  EN: name="${d.name_en}" role="${d.role_en}" exp="${d.experience_en}"`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
