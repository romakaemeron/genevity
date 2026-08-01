/**
 * The translator stored two model refusals as if they were translations
 * (short ambiguous inputs "RF" and "Нет"). Repair both the JSON artefact and
 * the DB row. Run: npx tsx scripts/dooptim/fix-refusals.ts [--apply]
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import * as fs from "fs";

const APPLY = process.argv.includes("--apply");
const sql = postgres(process.env.DATABASE_URL!);
const PAT = /(i'?m sorry|i can(?:no|’|')t assist|на жаль, я не мож)/i;

/** Correct values, taken from the Russian source column/cell. */
const FIX: Record<string, { uk: string; en: string }> = {
  "RF": { uk: "RF", en: "RF" },
  "Нет": { uk: "Немає", en: "None" },
};

(async () => {
  // 1. JSON artefact
  const p = "scripts/dooptim/copy-i18n.json";
  const doc = JSON.parse(fs.readFileSync(p, "utf-8"));
  let jsonFixed = 0;
  const walk = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(walk);
    if (typeof v.ru === "string" && (PAT.test(String(v.uk)) || PAT.test(String(v.en)))) {
      const f = FIX[v.ru.trim()];
      if (f) { v.uk = f.uk; v.en = f.en; jsonFixed++; }
      else console.log(`  ! no correction defined for ru="${v.ru}"`);
    }
    Object.values(v).forEach(walk);
  };
  walk(doc);
  console.log(`JSON: ${jsonFixed} value(s) repaired`);
  if (APPLY) fs.writeFileSync(p, JSON.stringify(doc, null, 2));

  // 2. DB
  const rows = await sql`SELECT cs.id, cs.data FROM content_sections cs
    WHERE cs.owner_type='service' AND cs.data->>'source'='inweb-tz1'`;
  let dbFixed = 0;
  for (const r of rows) {
    const d = typeof r.data === "string" ? JSON.parse(r.data as string) : (r.data as any);
    let touched = 0;
    const fixArr = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj.uk) && Array.isArray(obj.ru)) {
        obj.ru.forEach((ruVal: string, i: number) => {
          if (PAT.test(String(obj.uk[i])) || PAT.test(String(obj.en?.[i]))) {
            const f = FIX[String(ruVal).trim()];
            if (f) { obj.uk[i] = f.uk; if (obj.en) obj.en[i] = f.en; touched++; }
          }
        });
      }
      Object.values(obj).forEach(fixArr);
    };
    fixArr(d);
    if (touched) {
      dbFixed += touched;
      console.log(`DB row ${String(r.id).slice(0, 8)}: ${touched} value(s) repaired`);
      if (APPLY) await sql`UPDATE content_sections SET data = ${sql.json(d)}, updated_at = NOW() WHERE id = ${r.id}`;
    }
  }
  console.log(`\nDB: ${dbFixed} value(s) repaired`);
  console.log(APPLY ? "APPLIED" : "DRY RUN — re-run with --apply");
  await sql.end();
})();
