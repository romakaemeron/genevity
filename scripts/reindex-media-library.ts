/**
 * Scan every image-holding column in the DB + the /public/ directory and
 * populate media_assets with one row per unique URL. Idempotent —
 * existing rows are untouched (URL is UNIQUE).
 *
 * Folder-detection heuristic:
 *   - blob URLs under /doctors/... → folder = "doctors"
 *   - blob URLs under /equipment/... → "equipment"
 *   - content section images → "sections"
 *   - /public/clinic/* → "clinic"
 *   - /public/og/* → "og"
 *   - etc. See FOLDER_BY_PREFIX below.
 *
 * Run: npx tsx scripts/reindex-media-library.ts
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

function folderFromUrl(url: string): string {
  // Vercel Blob URLs: https://<hash>.public.blob.vercel-storage.com/<folder>/<file>.webp
  if (url.includes("blob.vercel-storage.com")) {
    const after = url.split(".blob.vercel-storage.com/")[1] || "";
    const folder = after.split("/")[0] || "uncategorized";
    return folder || "uncategorized";
  }
  // Local /public/ URLs — folder is the first path segment
  if (url.startsWith("/")) {
    const seg = url.slice(1).split("/")[0] || "uncategorized";
    if (seg === "images") {
      // /images/<sub>/<file> — use sub folder
      return url.split("/")[2] || "images";
    }
    return seg;
  }
  return "uncategorized";
}

function filenameFromUrl(url: string): string {
  return decodeURIComponent(url.split("/").pop() || url);
}

async function insertIfNew(url: string, source: "blob" | "public") {
  const filename = filenameFromUrl(url);
  const folder = folderFromUrl(url);
  await sql`
    INSERT INTO media_assets (url, filename, folder, source, title)
    VALUES (${url}, ${filename}, ${folder}, ${source}, ${filename})
    ON CONFLICT (url) DO NOTHING
  `;
}

async function scanDb() {
  const urls = new Set<string>();

  // doctors
  for (const r of await sql`SELECT photo_card, photo_full FROM doctors`) {
    if (r.photo_card) urls.add(r.photo_card);
    if (r.photo_full) urls.add(r.photo_full);
  }
  // equipment
  for (const r of await sql`SELECT photo FROM equipment WHERE photo IS NOT NULL`) {
    if (r.photo) urls.add(r.photo);
  }
  // hero slides
  for (const r of await sql`SELECT image_url FROM hero_slides WHERE image_url IS NOT NULL`) {
    if (r.image_url) urls.add(r.image_url);
  }
  // gallery items
  for (const r of await sql`SELECT image_url FROM gallery_items WHERE image_url IS NOT NULL`) {
    if (r.image_url) urls.add(r.image_url);
  }
  // static pages OG
  for (const r of await sql`SELECT seo_og_image FROM static_pages WHERE seo_og_image IS NOT NULL`) {
    if (r.seo_og_image) urls.add(r.seo_og_image);
  }
  // services
  for (const r of await sql`SELECT hero_image, seo_og_image FROM services`) {
    if (r.hero_image) urls.add(r.hero_image);
    if (r.seo_og_image) urls.add(r.seo_og_image);
  }
  // categories
  for (const r of await sql`SELECT hero_image, seo_og_image FROM service_categories`) {
    if (r.hero_image) urls.add(r.hero_image);
    if (r.seo_og_image) urls.add(r.seo_og_image);
  }
  // site settings
  for (const r of await sql`SELECT og_image FROM site_settings`) {
    if (r.og_image) urls.add(r.og_image);
  }
  // content sections — nested JSON (heroImage per-section, images[] for galleries)
  for (const r of await sql`SELECT data FROM content_sections`) {
    const d = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
    if (d?.heroImage && typeof d.heroImage === "string") urls.add(d.heroImage);
    if (Array.isArray(d?.images)) {
      for (const img of d.images) {
        if (typeof img === "string") urls.add(img);
        else if (img?.url && typeof img.url === "string") urls.add(img.url);
      }
    }
  }

  let newRows = 0;
  for (const u of urls) {
    const before = await sql`SELECT 1 FROM media_assets WHERE url = ${u} LIMIT 1`;
    if (!before.length) {
      const source = u.startsWith("http") ? "blob" : "public";
      await insertIfNew(u, source);
      newRows++;
    }
  }
  return { scanned: urls.size, newRows };
}

async function scanPublic() {
  const PUBLIC = path.resolve(__dirname, "../public");
  const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
  const urls = new Set<string>();

  const walk = (dir: string, base: string) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full, `${base}/${name}`);
      } else {
        const ext = path.extname(name).toLowerCase();
        if (exts.has(ext)) {
          urls.add(`${base}/${name}`);
        }
      }
    }
  };
  walk(PUBLIC, "");

  let newRows = 0;
  for (const u of urls) {
    const before = await sql`SELECT 1 FROM media_assets WHERE url = ${u} LIMIT 1`;
    if (!before.length) {
      await insertIfNew(u, "public");
      newRows++;
    }
  }
  return { scanned: urls.size, newRows };
}

async function main() {
  console.log("▸ Scanning DB image columns…");
  const db = await scanDb();
  console.log(`  ${db.scanned} unique URLs in DB (${db.newRows} new)`);

  console.log("▸ Walking /public/ for bundled images…");
  const pub = await scanPublic();
  console.log(`  ${pub.scanned} files in /public/ (${pub.newRows} new)`);

  const total = await sql`SELECT count(*) FROM media_assets`;
  console.log(`\nTotal media_assets rows: ${total[0].count}`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
