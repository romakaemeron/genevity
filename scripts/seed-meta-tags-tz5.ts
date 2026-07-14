/**
 * Apply the client's meta-tag spec (ТЗ №5 / Метатеги) to the 7 apparatus-
 * cosmetology service pages. Parses the source CSV directly so the exact
 * trilingual Title/Description (incl. emoji) is applied verbatim — no manual
 * transcription. Matches services by slug (last path segment of the UA URL).
 *
 * Run: npx tsx scripts/seed-meta-tags-tz5.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

const CSV = "genevity.com.ua _ Технічне завдання №5 _ Метатеги - genevity.com.ua.csv";
const sql = postgres(process.env.DATABASE_URL!);

/** Quote-aware CSV line parser (RFC-4180 fields, no embedded newlines). */
function parseLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { field += '"'; i++; } else { inQ = false; }
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(field); field = ""; }
    else field += c;
  }
  out.push(field);
  return out;
}

function slugOf(url: string): string {
  return url.trim().replace(/\/+$/, "").split("/").pop() || "";
}

async function main() {
  const raw = readFileSync(join(__dirname, "..", "docs", CSV), "utf-8").replace(/\r\n/g, "\n");
  const lines = raw.split("\n").filter((l) => l.trim().length);
  const rows = lines.slice(1).map(parseLine); // drop header

  let updated = 0;
  for (const r of rows) {
    // cols: 0 URL RU, 1 Title RU, 2 Desc RU, 3 URL UA, 4 Title UA, 5 Desc UA, 6 URL EN, 7 Title EN, 8 Desc EN
    const [, titleRu, descRu, urlUa, titleUk, descUk, , titleEn, descEn] = r;
    const slug = slugOf(urlUa);
    if (!slug) { console.warn("skip: no slug for row", r[0]); continue; }
    const res = await sql`
      UPDATE services SET
        seo_title_uk = ${titleUk.trim()}, seo_desc_uk = ${descUk.trim()},
        seo_title_ru = ${titleRu.trim()}, seo_desc_ru = ${descRu.trim()},
        seo_title_en = ${titleEn.trim()}, seo_desc_en = ${descEn.trim()}
      WHERE slug = ${slug}
      RETURNING slug
    `;
    if (res.length) { updated++; console.log(`✓ ${slug}`); }
    else console.warn(`✗ no service matched slug '${slug}'`);
  }
  console.log(`\nUpdated ${updated}/${rows.length} services.`);

  // Echo back a sample to confirm the exact content landed
  const sample = await sql`
    SELECT slug, seo_title_uk, left(seo_desc_uk, 60) AS desc_uk FROM services
    WHERE slug IN ('skin','emface','acupulse-co2') ORDER BY slug
  `;
  console.table(sample);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
