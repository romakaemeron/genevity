/**
 * Audit all image tables for missing alt/title text.
 * Run: npx tsx scripts/check-image-alt-title.ts
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
  console.log("\n=== HERO SLIDES ===");
  const heroMissing = await sql`
    SELECT id, image_url, alt_uk, alt_ru, alt_en
    FROM hero_slides
    WHERE image_url IS NOT NULL AND image_url != ''
      AND (alt_uk IS NULL OR alt_uk = '' OR alt_ru IS NULL OR alt_ru = '' OR alt_en IS NULL OR alt_en = '')
  `;
  if (heroMissing.length === 0) console.log("✅ All hero slides have alt text");
  else heroMissing.forEach(r => console.log(`❌ slide ${r.id}: alt_uk="${r.alt_uk}" alt_ru="${r.alt_ru}" alt_en="${r.alt_en}"`));

  console.log("\n=== GALLERY ITEMS ===");
  const galleryMissing = await sql`
    SELECT id, owner_key, image_url, alt_uk, title_uk
    FROM gallery_items
    WHERE image_url IS NOT NULL AND image_url != ''
      AND (alt_uk IS NULL OR alt_uk = '' OR title_uk IS NULL OR title_uk = '')
    ORDER BY owner_key
  `;
  if (galleryMissing.length === 0) console.log("✅ All gallery items have alt+title");
  else galleryMissing.forEach(r => console.log(`❌ gallery[${r.owner_key}] ${r.id}: alt_uk="${r.alt_uk}" title_uk="${r.title_uk}"`));

  console.log("\n=== SERVICES (hero_image) ===");
  const servicesMissing = await sql`
    SELECT s.id, s.slug, s.hero_image, s.title_uk
    FROM services s
    WHERE s.hero_image IS NOT NULL AND s.hero_image != ''
      AND (s.title_uk IS NULL OR s.title_uk = '')
  `;
  if (servicesMissing.length === 0) console.log("✅ All service images have title (used as alt)");
  else servicesMissing.forEach(r => console.log(`❌ service ${r.slug}: title_uk missing`));

  console.log("\n=== DOCTORS (photos) ===");
  const doctorsMissing = await sql`
    SELECT id, slug, name_uk, photo_card, photo_circle
    FROM doctors
    WHERE (photo_card IS NOT NULL AND photo_card != '' OR photo_circle IS NOT NULL AND photo_circle != '')
      AND (name_uk IS NULL OR name_uk = '')
  `;
  if (doctorsMissing.length === 0) console.log("✅ All doctor photos have name (used as alt)");
  else doctorsMissing.forEach(r => console.log(`❌ doctor ${r.slug}: name_uk missing`));

  console.log("\n=== EQUIPMENT (photo) ===");
  const equipMissing = await sql`
    SELECT id, name, photo
    FROM equipment
    WHERE photo IS NOT NULL AND photo != ''
      AND (name IS NULL OR name = '')
  `;
  if (equipMissing.length === 0) console.log("✅ All equipment photos have name (used as alt)");
  else equipMissing.forEach(r => console.log(`❌ equipment ${r.id}: name missing`));

  console.log("\n=== BLOG POSTS (cover_image) ===");
  const blogMissing = await sql`
    SELECT id, slug, title_uk, cover_image
    FROM blog_posts
    WHERE cover_image IS NOT NULL AND cover_image != ''
      AND (title_uk IS NULL OR title_uk = '')
  `;
  if (blogMissing.length === 0) console.log("✅ All blog cover images have title (used as alt)");
  else blogMissing.forEach(r => console.log(`❌ blog ${r.slug}: title_uk missing`));

  console.log("\n=== SUMMARY ===");
  const total = heroMissing.length + galleryMissing.length + servicesMissing.length +
    doctorsMissing.length + equipMissing.length + blogMissing.length;
  console.log(`Total issues: ${total}`);

  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
