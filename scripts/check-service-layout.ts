import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);
(async () => {
  const svc = await sql`SELECT id, slug, block_order FROM services WHERE slug = 'botulinum-therapy'`;
  console.log("Service:", svc[0]);
  if (svc[0]) {
    const sections = await sql`SELECT id, section_type, sort_order FROM content_sections WHERE owner_type = 'service' AND owner_id = ${svc[0].id} ORDER BY sort_order`;
    console.log("\nSections in DB:");
    for (const s of sections) console.log(`  ${s.sort_order}: ${s.section_type} id=${s.id}`);
  }
  await sql.end();
})().catch((e) => { console.error(e); process.exit(1); });
