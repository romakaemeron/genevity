/**
 * 1. Add seo_keywords_{uk,ru,en} to static_pages.
 * 2. Backfill static_pages.seo_* from existing ui_strings.pageMeta.{slug}.{title,description}
 *    (these were the actual values the public site has been showing until now).
 * 3. Remove the now-redundant pageMeta.* tree from ui_strings.
 *
 * Run: npx tsx scripts/migrate-seo-and-backfill.ts
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

function pick<T>(o: any, ks: string[]): T | null {
  for (const k of ks) {
    if (o && typeof o === "object" && k in o) return o[k];
  }
  return null;
}

async function main() {
  console.log("▸ Adding seo_keywords_{uk,ru,en} columns…");
  await sql`ALTER TABLE static_pages ADD COLUMN IF NOT EXISTS seo_keywords_uk TEXT`;
  await sql`ALTER TABLE static_pages ADD COLUMN IF NOT EXISTS seo_keywords_ru TEXT`;
  await sql`ALTER TABLE static_pages ADD COLUMN IF NOT EXISTS seo_keywords_en TEXT`;

  console.log("▸ Backfilling seo_title / seo_desc from ui_strings.pageMeta…");
  const uiRows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const pageMeta = (uiRows[0]?.data?.pageMeta || {}) as Record<string, any>;

  const pages = await sql`SELECT id, slug, seo_title_uk, seo_desc_uk FROM static_pages`;
  let updated = 0;
  for (const p of pages) {
    const meta = pageMeta[p.slug as string];
    if (!meta) continue;
    const t = meta.title || {};
    const d = meta.description || {};
    const titleUk = pick<string>(t, ["uk", "ua"]);
    const titleRu = pick<string>(t, ["ru"]);
    const titleEn = pick<string>(t, ["en"]);
    const descUk = pick<string>(d, ["uk", "ua"]);
    const descRu = pick<string>(d, ["ru"]);
    const descEn = pick<string>(d, ["en"]);

    // Only fill columns that are currently null or empty, don't clobber admin edits
    await sql`
      UPDATE static_pages SET
        seo_title_uk = COALESCE(NULLIF(seo_title_uk, ''), ${titleUk}),
        seo_title_ru = COALESCE(NULLIF(seo_title_ru, ''), ${titleRu}),
        seo_title_en = COALESCE(NULLIF(seo_title_en, ''), ${titleEn}),
        seo_desc_uk  = COALESCE(NULLIF(seo_desc_uk, ''),  ${descUk}),
        seo_desc_ru  = COALESCE(NULLIF(seo_desc_ru, ''),  ${descRu}),
        seo_desc_en  = COALESCE(NULLIF(seo_desc_en, ''),  ${descEn})
      WHERE id = ${p.id}
    `;
    console.log(`  ✓ ${p.slug}: title=${titleUk?.slice(0, 40)}`);
    updated++;
  }

  console.log(`\n▸ Removing pageMeta.* subtree from ui_strings (no longer used)…`);
  // Only drop if backfill wrote something, so we keep a trace otherwise.
  if (updated > 0) {
    const data = uiRows[0].data;
    if (data.pageMeta) delete data.pageMeta;
    await sql`UPDATE ui_strings SET data = ${sql.json(data)}, updated_at = now() WHERE id = 1`;
    console.log("  ✓ pageMeta subtree dropped");
  }

  console.log(`\nDone. Updated ${updated} static_pages row(s).`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
