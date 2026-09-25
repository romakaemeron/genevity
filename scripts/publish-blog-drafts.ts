/**
 * Publish every blog draft (blog launch, 2026-09-25).
 *
 * Flips `is_draft = false` on all draft posts. The public queries filter on
 * `is_draft = false AND published_at <= NOW()`, and the drafts already carry
 * past `published_at` values, so they go live as soon as the blog itself is
 * un-gated on production (see src/lib/blog-visibility.ts).
 *
 * Prints the slugs it touched so the change can be reversed by hand if needed:
 *   UPDATE blog_posts SET is_draft = true WHERE slug IN (…);
 *
 * Run: npx tsx scripts/publish-blog-drafts.ts        (dry run — lists only)
 *      npx tsx scripts/publish-blog-drafts.ts --write (applies)
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
const WRITE = process.argv.includes("--write");

async function main() {
  const drafts = await sql<{ slug: string; title_uk: string; published_at: Date | null }[]>`
    SELECT slug, title_uk, published_at
    FROM blog_posts
    WHERE is_draft = true
    ORDER BY published_at
  `;

  if (drafts.length === 0) {
    console.log("↷ no drafts — nothing to publish");
    await sql.end();
    return;
  }

  console.log(`${drafts.length} draft${drafts.length === 1 ? "" : "s"}:`);
  for (const d of drafts) {
    const when = d.published_at ? d.published_at.toISOString().slice(0, 16).replace("T", " ") : "no date";
    console.log(`  ${when}  ${d.title_uk?.slice(0, 68) ?? d.slug}`);
  }

  if (!WRITE) {
    console.log("\nDry run. Re-run with --write to publish.");
    await sql.end();
    return;
  }

  const updated = await sql<{ slug: string }[]>`
    UPDATE blog_posts SET is_draft = false, updated_at = now()
    WHERE is_draft = true
    RETURNING slug
  `;

  console.log(`\n✓ published ${updated.length} post${updated.length === 1 ? "" : "s"}`);
  console.log("\nTo reverse:");
  console.log(
    `UPDATE blog_posts SET is_draft = true WHERE slug IN (\n${updated
      .map((r) => `  '${r.slug}'`)
      .join(",\n")}\n);`,
  );

  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
