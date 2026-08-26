/**
 * Repoints CMS image references from /images/**\/*.jpg to their .webp siblings.
 *
 * The .jpg files are the untouched camera originals (SEMI7509.jpg is 12 MB,
 * 8192×5464); every one of them already has a 2560px WebP sibling built at the
 * same path. Content referenced the originals and relied on the image optimizer
 * to cut them down — which breaks the moment the optimizer is unavailable, and
 * costs a transformation per width even when it works.
 *
 *   npx tsx scripts/repoint-jpg-to-webp.mts          # dry run
 *   npx tsx scripts/repoint-jpg-to-webp.mts --apply
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const APPLY = process.argv.includes("--apply");
const rollback: any[] = [];
let changes = 0;

/** Only swap when the .webp sibling actually exists on disk. */
const swap = (url: string) => {
  if (!url.startsWith("/images/") || !url.toLowerCase().endsWith(".jpg")) return url;
  const webp = url.slice(0, -4) + ".webp";
  return existsSync("public" + decodeURIComponent(webp)) ? webp : url;
};

console.log(APPLY ? "APPLYING\n" : "DRY RUN — pass --apply to write\n");

// content_sections: heroImage + gallery image urls live inside the JSONB blob
const secs = (await sql`SELECT id, data FROM content_sections WHERE data::text LIKE '%/images/%.jpg%'`) as any[];
for (const row of secs) {
  const before = typeof row.data === "string" ? row.data : JSON.stringify(row.data);
  const after = before.replace(/\/images\/[^"\\]+?\.jpg/g, (m: string) => swap(m));
  if (after === before) continue;
  rollback.push({ table: "content_sections", id: row.id, before: row.data });
  changes++;
  console.log(`  ✓ section ${row.id}`);
  if (APPLY) await sql`UPDATE content_sections SET data = ${after}::jsonb, updated_at = now() WHERE id = ${row.id}`;
}

// gallery_items / categories / static pages / services store a plain URL column
for (const [table, col] of [
  ["gallery_items", "image_url"], ["service_categories", "hero_image"],
  ["static_pages", "hero_image"], ["services", "hero_image"],
] as [string, string][]) {
  const rows = (await sql.query(
    `SELECT id, ${col} AS u FROM ${table} WHERE ${col} LIKE '/images/%.jpg'`)) as any[];
  for (const r of rows) {
    const next = swap(r.u);
    if (next === r.u) continue;
    rollback.push({ table, id: r.id, column: col, before: r.u });
    changes++;
    console.log(`  ✓ ${table}.${col} ${r.u} → ${next}`);
    if (APPLY) await sql.query(`UPDATE ${table} SET ${col} = $1 WHERE id = $2`, [next, r.id]);
  }
}

console.log(`\n${APPLY ? "Applied" : "Would apply"} ${changes} change(s).`);
if (APPLY && rollback.length) {
  if (!existsSync("scripts/backups")) mkdirSync("scripts/backups", { recursive: true });
  const f = `scripts/backups/jpg-to-webp-rollback-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(f, JSON.stringify(rollback, null, 2));
  console.log(`Rollback data written to ${f}`);
}
