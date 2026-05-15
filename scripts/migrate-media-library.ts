/**
 * Create the media_assets table — the central image library used by the
 * /admin/media page. Rows are URLs already referenced somewhere on the site
 * (blob uploads OR /public/ bundled assets) plus any new uploads added
 * directly from the Media page.
 *
 * Run: npx tsx scripts/migrate-media-library.ts
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
  await sql`
    CREATE TABLE IF NOT EXISTS media_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url TEXT NOT NULL UNIQUE,
      filename TEXT NOT NULL,
      folder TEXT NOT NULL DEFAULT 'uncategorized',
      mime_type TEXT,
      size_bytes BIGINT,
      -- 'blob' = uploaded via admin (lives on Vercel Blob), 'public' = bundled in /public/
      source TEXT NOT NULL DEFAULT 'blob',
      -- Freeform label for search — defaults to filename, admin can override
      title TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_media_folder ON media_assets(folder)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_media_created ON media_assets(created_at DESC)`;
  console.log("✓ media_assets table created");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
