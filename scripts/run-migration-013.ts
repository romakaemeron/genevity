/**
 * Add medical reviewer + last-reviewed date columns to services and blog_posts.
 * Run: npx tsx scripts/run-migration-013.ts
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
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/013_medical_reviewer.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 013 applied: reviewer_doctor_id & last_reviewed_at added to services & blog_posts");

  const servicesCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'services' AND column_name IN ('reviewer_doctor_id', 'last_reviewed_at')
    ORDER BY column_name
  `;
  console.log("Services columns added:", servicesCols.map((r) => r.column_name));

  const blogPostsCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name IN ('reviewer_doctor_id', 'last_reviewed_at')
    ORDER BY column_name
  `;
  console.log("Blog_posts columns added:", blogPostsCols.map((r) => r.column_name));

  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
