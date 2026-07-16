/**
 * One-off content cleanup: replace em-dash (—, U+2014) and en-dash (–, U+2013)
 * with a plain hyphen-minus (-) across EVERY text / varchar / jsonb column in
 * the public schema. Row-scoped (only touches rows that actually contain a
 * dash). jsonb is handled by round-tripping through ::text so both real objects
 * and the double-encoded string-scalar rows (ui_strings, content_sections) are
 * covered — neither dash is JSON-syntactic, so the round-trip is safe.
 *
 * No code parses these dashes as delimiters (verified), and this is pure data —
 * the live site picks it up on ISR revalidation. Neon PITR is the rollback net.
 * Run: npx tsx scripts/replace-dashes.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const EM = "—", EN = "–";

async function main() {
  const cols = await sql<{ table_name: string; column_name: string; data_type: string }[]>`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'jsonb', 'character')
    ORDER BY table_name, column_name`;

  let totalRows = 0;
  const changed: string[] = [];

  for (const c of cols) {
    const tbl = sql(c.table_name);
    const col = sql(c.column_name);
    try {
      let res;
      if (c.data_type === "jsonb") {
        res = await sql`
          UPDATE ${tbl}
          SET ${col} = replace(replace(${col}::text, ${EM}, '-'), ${EN}, '-')::jsonb
          WHERE ${col}::text LIKE ${"%" + EM + "%"} OR ${col}::text LIKE ${"%" + EN + "%"}`;
      } else {
        res = await sql`
          UPDATE ${tbl}
          SET ${col} = replace(replace(${col}, ${EM}, '-'), ${EN}, '-')
          WHERE ${col} LIKE ${"%" + EM + "%"} OR ${col} LIKE ${"%" + EN + "%"}`;
      }
      if (res.count > 0) {
        changed.push(`  ${c.table_name}.${c.column_name} (${c.data_type}): ${res.count} rows`);
        totalRows += res.count;
      }
    } catch (e: any) {
      changed.push(`  ! ${c.table_name}.${c.column_name}: ${e.message?.slice(0, 60)}`);
    }
  }

  console.log(changed.join("\n"));
  console.log(`\n✓ Updated ${totalRows} rows across ${changed.length} columns.`);

  // Verify: nothing left
  let remaining = 0;
  for (const c of cols) {
    try {
      const r = await sql`
        SELECT count(*)::int n FROM ${sql(c.table_name)}
        WHERE ${sql(c.column_name)}::text LIKE ${"%" + EM + "%"}
           OR ${sql(c.column_name)}::text LIKE ${"%" + EN + "%"}`;
      remaining += Number(r[0].n) || 0;
    } catch { /* ignore */ }
  }
  console.log(`Remaining rows still containing — or –: ${remaining}`);

  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
