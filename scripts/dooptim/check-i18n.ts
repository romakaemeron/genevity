/**
 * Coverage check for scripts/dooptim/copy-i18n.json.
 *
 * Walks every { uk, ru, en } triple in the file and reports, per page, how
 * many are complete, how many have an empty uk, and how many have an empty
 * en. Exits non-zero if any `ru` is empty — that would mean Task 1's
 * extraction (or this file) is damaged, since `ru` is always the original,
 * untranslated string and should never be missing. Empty uk/en are reported
 * but do NOT fail the run, so the real translation failure rate is visible.
 *
 * Usage: npx tsx scripts/dooptim/check-i18n.ts
 */
import * as fs from "fs";
import * as path from "path";

const IN = path.join(process.cwd(), "scripts/dooptim/copy-i18n.json");

type Tri = { uk: string; ru: string; en: string };

function isTri(v: unknown): v is Tri {
  return (
    !!v &&
    typeof v === "object" &&
    "uk" in (v as object) &&
    "ru" in (v as object) &&
    "en" in (v as object) &&
    typeof (v as Tri).uk === "string" &&
    typeof (v as Tri).ru === "string" &&
    typeof (v as Tri).en === "string"
  );
}

/**
 * Recursively find every {uk,ru,en} triple under a page's sections.
 *
 * `priceTable.note` is the one field the extractor (Task 1) allows to be a
 * genuinely empty string in the source — some price tables just don't have a
 * note. An empty `ru` there reflects an empty *source*, not a damaged
 * extraction, so it is excluded rather than counted as a gap.
 */
function collectTriples(node: unknown, out: Tri[], key?: string): void {
  if (isTri(node)) {
    if (key === "note" && !node.ru.trim()) return; // legitimately-empty optional field
    out.push(node);
    return; // a triple's own uk/ru/en strings aren't nested triples
  }
  if (Array.isArray(node)) {
    for (const item of node) collectTriples(item, out, key);
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === "type" || k === "after") continue; // metadata, not translated content
      collectTriples(v, out, k);
    }
  }
}

function main() {
  const data = JSON.parse(fs.readFileSync(IN, "utf-8")) as { pages: { slug: string; sections: unknown[] }[] };

  let totalTriples = 0;
  let totalComplete = 0;
  let totalEmptyUk = 0;
  let totalEmptyEn = 0;
  let totalEmptyRu = 0;
  const damagedRu: string[] = [];

  console.log("Translation coverage — scripts/dooptim/copy-i18n.json\n");

  for (const page of data.pages) {
    const triples: Tri[] = [];
    collectTriples(page.sections, triples);

    let complete = 0;
    let emptyUk = 0;
    let emptyEn = 0;
    let emptyRu = 0;

    for (const t of triples) {
      const ukEmpty = !t.uk.trim();
      const enEmpty = !t.en.trim();
      const ruEmpty = !t.ru.trim();
      if (ukEmpty) emptyUk++;
      if (enEmpty) emptyEn++;
      if (ruEmpty) {
        emptyRu++;
        damagedRu.push(`${page.slug}: ru empty (uk="${t.uk.slice(0, 40)}", en="${t.en.slice(0, 40)}")`);
      }
      if (!ukEmpty && !enEmpty && !ruEmpty) complete++;
    }

    console.log(
      `  ${page.slug}: ${triples.length} triples — complete: ${complete}, empty uk: ${emptyUk}, empty en: ${emptyEn}, empty ru: ${emptyRu}`,
    );

    totalTriples += triples.length;
    totalComplete += complete;
    totalEmptyUk += emptyUk;
    totalEmptyEn += emptyEn;
    totalEmptyRu += emptyRu;
  }

  console.log(
    `\nTotals: ${totalTriples} triples — complete: ${totalComplete}, empty uk: ${totalEmptyUk} (${((totalEmptyUk / totalTriples) * 100).toFixed(1)}%), empty en: ${totalEmptyEn} (${((totalEmptyEn / totalTriples) * 100).toFixed(1)}%), empty ru: ${totalEmptyRu}`,
  );

  if (totalEmptyRu > 0) {
    console.error(`\n✗ ${totalEmptyRu} empty ru value(s) — extraction/output is damaged:`);
    for (const line of damagedRu) console.error(`  - ${line}`);
    process.exit(1);
  }

  console.log("\n✓ ru is fully populated everywhere (extraction intact).");
  if (totalEmptyUk > 0 || totalEmptyEn > 0) {
    console.log(`  (uk/en gaps above should be re-run before shipping if more than a handful.)`);
  }
  process.exit(0);
}

main();
