import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);
(async () => {
  const info = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'ui_strings'`;
  console.log("Columns:", info.map((r: any) => r.column_name).join(", "));
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const keys = Object.keys(rows[0].data);
  console.log("Top-level namespaces:\n  " + keys.join("\n  "));
  for (const k of ["home", "hero", "aboutSlideshow", "advantages", "homeFaq", "labels", "equipment", "doctors", "contacts"]) {
    if (rows[0].data[k]) {
      const subKeys = Object.keys(rows[0].data[k]);
      console.log(`\n[${k}] (${subKeys.length}): ${subKeys.join(", ")}`);
    }
  }
  await sql.end();
})().catch((e) => { console.error(e); process.exit(1); });
