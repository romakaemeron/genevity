/**
 * Add a unique index on blog_posts.slug.
 * Run: npx tsx scripts/run-migration-020.ts
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

async function run() {
  const dupes = await sql`
    SELECT slug FROM blog_posts GROUP BY slug HAVING COUNT(*) > 1`;
  if (dupes.length) {
    console.error(`✗ refusing to run: ${dupes.length} duplicate slug(s). Fix them first:`);
    for (const d of dupes) console.error(`  ${d.slug}`);
    process.exit(1);
  }

  const migration = fs.readFileSync(
    path.resolve(__dirname, "migrations/020_blog_slug_unique.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 020 applied: blog_posts_slug_key created");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
