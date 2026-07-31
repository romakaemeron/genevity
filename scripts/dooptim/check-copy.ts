import * as fs from "fs";
const data = JSON.parse(fs.readFileSync("scripts/dooptim/copy-ru.json", "utf-8"));
const SLUGS = ["body","splendor-x","emsculpt-neo","ultraformer-mpt-body","exion-body","m22-stellar-black"];
let bad = 0;
const fail = (m: string) => { console.log("✗ " + m); bad++; };

if (data.pages.length !== 6) fail(`expected 6 pages, got ${data.pages.length}`);
for (const slug of SLUGS) if (!data.pages.find((p: any) => p.slug === slug)) fail(`missing page ${slug}`);

for (const p of data.pages) {
  if (!p.sections.length) fail(`${p.slug}: no sections`);
  for (const s of p.sections) {
    const j = JSON.stringify(s);
    if (j.includes("…")) fail(`${p.slug}/${s.type}: photo placeholder leaked in`);
    if (j.includes("3503")) fail(`${p.slug}/${s.type}: artefact "3503 сбп" leaked in`);
    if (j.includes("[IMG]")) fail(`${p.slug}/${s.type}: [IMG] marker leaked in`);
    if (j.includes("№")) fail(`${p.slug}/${s.type}: page marker leaked in`);
    if (s.type === "bullets" && !s.items.length) fail(`${p.slug}: empty bullets "${s.heading}"`);
    if (s.type === "compareTable") {
      if (!s.columns.length) fail(`${p.slug}: compareTable "${s.heading}" has no columns`);
      for (const r of s.rows)
        if (r.values.length !== s.columns.length)
          fail(`${p.slug}: compareTable "${s.heading}" row "${r.label}" has ${r.values.length} values but ${s.columns.length} columns`);
    }
    if (s.type === "priceTable" && !s.rows.length) fail(`${p.slug}: empty priceTable "${s.heading}"`);
    if (s.type === "indicationsContraindications" && (!s.indications.length || !s.contraindications.length))
      fail(`${p.slug}: indications/contraindications block is half empty`);
  }
  console.log(`  ${p.slug}: ${p.sections.length} sections — ${p.sections.map((s: any) => s.type).join(", ")}`);
}
console.log(bad ? `\n✗ ${bad} problem(s)` : "\n✓ extraction looks sane");
process.exit(bad ? 1 : 0);
