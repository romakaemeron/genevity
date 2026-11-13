/**
 * ТЗ #19 — fold the client's metatag spreadsheet into the per-page base record.
 *
 * The spreadsheet is the authority for <title> and <meta description> in all
 * three languages; the H1 and the page name come from the same row's "URL"
 * column, which is really the page's display name rather than a path.
 *
 * Run: node scripts/tz19/build-meta.mjs
 * Out: scripts/tz19/meta.json — { <slug>: { name, seoTitle, seoDescription } }
 */
import fs from "node:fs";

const CSV = "/Users/romakochetov/Downloads/genevity.com.ua _ Технічне завдання №19 _ Метатеги - genevity.com.ua.csv";
const SLUGS = JSON.parse(fs.readFileSync("scripts/tz19/slugs.json", "utf-8"));

/** The descriptions contain commas and emoji, so the file needs a real parser. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') (text[i + 1] === '"') ? (cell += '"', i++) : (quoted = false);
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// The RU page name is the only column that ties a spreadsheet row to a Word
// document, so the slug map is keyed on it.
const byRuName = Object.fromEntries(
  Object.entries(SLUGS).map(([docName, slug]) => [docName, slug]),
);

const rows = parseCsv(fs.readFileSync(CSV, "utf-8")).slice(1).filter((r) => r[0]?.trim());
const meta = {};
for (const r of rows) {
  const [uRu, tRu, dRu, uUk, tUk, dUk, uEn, tEn, dEn] = r.map((c) => c.trim());
  const slug = byRuName[uRu];
  if (!slug) throw new Error(`spreadsheet row "${uRu}" matches no Word document`);
  meta[slug] = {
    name: { ru: uRu, uk: uUk, en: uEn },
    seoTitle: { ru: tRu, uk: tUk, en: tEn },
    seoDescription: { ru: dRu, uk: dUk, en: dEn },
  };
}

const missing = Object.values(SLUGS).filter((s) => !meta[s]);
if (missing.length) throw new Error(`no spreadsheet row for: ${missing.join(", ")}`);

fs.writeFileSync("scripts/tz19/meta.json", JSON.stringify(meta, null, 1));
console.log(`${Object.keys(meta).length} metatag rows matched to documents`);
for (const [slug, m] of Object.entries(meta)) {
  const over = ["ru", "uk", "en"].filter((l) => m.seoTitle[l].length > 60);
  console.log(`${slug.padEnd(34)} title ${["ru","uk","en"].map(l=>m.seoTitle[l].length).join("/")}` +
    `  desc ${["ru","uk","en"].map(l=>m.seoDescription[l].length).join("/")}` +
    (over.length ? `  ⚠ long title: ${over.join(",")}` : ""));
}
