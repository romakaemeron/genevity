/**
 * Convert `hero_slides.object_position` from TEXT to JSONB so each slide can
 * store a separate focal point for desktop / tablet / mobile. Existing TEXT
 * values (e.g. "50% 30%") are backfilled into all three keys so slides keep
 * rendering exactly as before until an admin tweaks a breakpoint.
 *
 * Run: npx tsx scripts/migrate-hero-responsive-focal.ts
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

async function main() {
  // Check current type — skip the cast if another environment already ran this.
  const typeRows = await sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'object_position'
  `;
  const currentType = typeRows[0]?.data_type;
  if (currentType === "jsonb") {
    console.log("↷ already JSONB — skipping conversion");
    await sql.end();
    return;
  }

  // Drop the existing TEXT default first — Postgres refuses to auto-cast
  // the default even when we provide USING for the column data itself.
  await sql`ALTER TABLE hero_slides ALTER COLUMN object_position DROP DEFAULT`;
  await sql`
    ALTER TABLE hero_slides
    ALTER COLUMN object_position TYPE JSONB
    USING jsonb_build_object(
      'desktop', COALESCE(object_position, 'center center'),
      'tablet',  COALESCE(object_position, 'center center'),
      'mobile',  COALESCE(object_position, 'center center')
    )
  `;
  await sql`ALTER TABLE hero_slides ALTER COLUMN object_position SET DEFAULT '{"desktop":"center center","tablet":"center center","mobile":"center center"}'::jsonb`;
  console.log("✓ hero_slides.object_position → JSONB with per-breakpoint keys");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
