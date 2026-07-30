/**
 * Report duplicate blog slugs and whether the unique index exists.
 * Run: npx tsx scripts/check-blog-slugs.ts
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
    SELECT slug, COUNT(*)::int AS n, array_agg(id::text) AS ids
    FROM blog_posts GROUP BY slug HAVING COUNT(*) > 1 ORDER BY slug`;
  if (dupes.length === 0) {
    console.log("✓ no duplicate slugs");
  } else {
    console.log(`✗ ${dupes.length} duplicated slug(s):`);
    for (const d of dupes) console.log(`  ${d.slug} ×${d.n} → ${d.ids.join(", ")}`);
  }

  const idx = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'blog_posts' AND indexname = 'blog_posts_slug_key'`;
  console.log(idx.length ? "✓ blog_posts_slug_key exists" : "· blog_posts_slug_key not created yet");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
