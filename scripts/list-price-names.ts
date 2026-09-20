/**
 * Print every distinct Ukrainian string in the catalogue, one per line.
 * Feeds the hand-authored map in src/lib/prices/translations.ts.
 * Run: npx tsx scripts/list-price-names.ts > /tmp/price-names.txt
 */
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "../src/lib/prices/parse-xlsx";
import { applyTaxonomy } from "../src/lib/prices/taxonomy";

async function run() {
  const buf = fs.readFileSync(path.resolve(__dirname, "../Прайс Геліос-4.xlsx"));
  const cats = applyTaxonomy(await parseGenevitySheet(buf));
  const strings = new Set<string>();
  for (const c of cats) {
    strings.add(c.labelUk);
    for (const s of c.subcategories) {
      if (s.labelUk) strings.add(s.labelUk);
      for (const i of s.items) {
        strings.add(i.nameUk);
        if (i.noteUk) strings.add(i.noteUk);
      }
    }
  }
  for (const s of [...strings].sort()) console.log(s);
  console.error(`${strings.size} distinct strings`);
}

run().catch((e) => { console.error(e); process.exit(1); });
