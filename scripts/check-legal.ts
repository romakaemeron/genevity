import postgres from "postgres";
import * as fs from "fs"; import * as path from "path";
const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);
(async () => {
  const rows = await sql`SELECT slug, title_uk, title_ru, title_en, LENGTH(body_uk) AS len_uk, LENGTH(body_ru) AS len_ru, LENGTH(body_en) AS len_en, sort_order FROM legal_docs ORDER BY sort_order`;
  console.log(JSON.stringify(rows, null, 2));
  await sql.end();
})().catch((e) => { console.error(e); process.exit(1); });
