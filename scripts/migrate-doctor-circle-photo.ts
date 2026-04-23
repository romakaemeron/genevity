/**
 * Add a third photo slot to doctors, dedicated to the booking-form
 * combobox thumbnail — a small circular crop that benefits from a
 * tighter framing around the face than the Card photo can offer.
 *
 * Columns:
 *   photo_circle        TEXT   — URL (optional, falls back to photo_card)
 *   circle_focal_point  TEXT   — object-position string, e.g. "50% 30%"
 *   circle_scale        NUMERIC — zoom factor (default 1, up to 4x)
 *
 * Run: npx tsx scripts/migrate-doctor-circle-photo.ts
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
  await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS photo_circle       TEXT`;
  await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS circle_focal_point TEXT`;
  await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS circle_scale       NUMERIC`;
  console.log("✓ doctors: photo_circle, circle_focal_point, circle_scale added");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
