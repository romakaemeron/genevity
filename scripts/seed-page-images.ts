/**
 * Seed all hardcoded page images into the DB:
 * - static_pages.hero_image for laboratory and about
 * - gallery_items for CTA backgrounds and section images
 *
 * Run: npx tsx scripts/seed-page-images.ts
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

async function seed() {
  // 1. Laboratory hero image → static_pages.hero_image
  await sql`
    UPDATE static_pages
    SET hero_image = '/clinic/semi1256-hdr.webp'
    WHERE slug = 'laboratory' AND (hero_image IS NULL OR hero_image = '')
  `;
  console.log("✓ Laboratory hero_image seeded");

  // 2. About info section image → static_pages.hero_image
  await sql`
    UPDATE static_pages
    SET hero_image = '/clinic/semi1287-hdr.webp'
    WHERE slug = 'about' AND (hero_image IS NULL OR hero_image = '')
  `;
  console.log("✓ About hero_image seeded");

  // Helper: upsert a single gallery item (delete old → insert new)
  async function seedSingleImage(ownerKey: string, imageUrl: string, opts: {
    alt_uk: string; alt_ru: string; alt_en: string;
    title_uk: string; title_ru: string; title_en: string;
    label_uk?: string; label_ru?: string; label_en?: string;
  }) {
    // Only seed if not already present
    const existing = await sql`SELECT id FROM gallery_items WHERE owner_key = ${ownerKey} LIMIT 1`;
    if (existing.length > 0) {
      console.log(`  ↳ ${ownerKey}: already exists, skipping`);
      return;
    }
    await sql`
      INSERT INTO gallery_items (owner_key, image_url, alt_uk, alt_ru, alt_en, title_uk, title_ru, title_en, label_uk, label_ru, label_en, sort_order)
      VALUES (
        ${ownerKey}, ${imageUrl},
        ${opts.alt_uk}, ${opts.alt_ru}, ${opts.alt_en},
        ${opts.title_uk}, ${opts.title_ru}, ${opts.title_en},
        ${opts.label_uk || null}, ${opts.label_ru || null}, ${opts.label_en || null},
        0
      )
    `;
    console.log(`✓ ${ownerKey}: seeded`);
  }

  // 3. About gallery — hero fallback image (shown when no gallery items)
  await seedSingleImage("about", "/clinic/semi1737-hdr.webp", {
    alt_uk: "GENEVITY — центр довголіття та естетичної медицини",
    alt_ru: "GENEVITY — центр долголетия и эстетической медицины",
    alt_en: "GENEVITY — Longevity and Aesthetic Medicine Center",
    title_uk: "GENEVITY — центр довголіття та естетичної медицини",
    title_ru: "GENEVITY — центр долголетия и эстетической медицины",
    title_en: "GENEVITY — Longevity and Aesthetic Medicine Center",
    label_uk: "Клініка GENEVITY",
    label_ru: "Клиника GENEVITY",
    label_en: "GENEVITY Clinic",
  });

  // 4. About CTA background
  await seedSingleImage("about_cta_bg", "/clinic/acupulse.webp", {
    alt_uk: "GENEVITY — апаратна косметологія",
    alt_ru: "GENEVITY — аппаратная косметология",
    alt_en: "GENEVITY — Hardware Cosmetology",
    title_uk: "GENEVITY — апаратна косметологія та довголіття",
    title_ru: "GENEVITY — аппаратная косметология и долголетие",
    title_en: "GENEVITY — Hardware Cosmetology and Longevity",
  });

  // 5. Contacts CTA background
  await seedSingleImage("contacts_cta_bg", "/clinic/acupulse.webp", {
    alt_uk: "GENEVITY — клініка довголіття та естетичної медицини",
    alt_ru: "GENEVITY — клиника долголетия и эстетической медицины",
    alt_en: "GENEVITY — Longevity and Aesthetic Medicine Clinic",
    title_uk: "GENEVITY — клініка довголіття та естетичної медицини",
    title_ru: "GENEVITY — клиника долголетия и эстетической медицины",
    title_en: "GENEVITY — Longevity and Aesthetic Medicine Clinic",
  });

  // 6. Stationary comfort section background (large card behind first comfort feature)
  await seedSingleImage("stationary_comfort_bg", "/clinic/semi1256-hdr.webp", {
    alt_uk: "Денний стаціонар GENEVITY — комфортне перебування",
    alt_ru: "Дневной стационар GENEVITY — комфортное пребывание",
    alt_en: "GENEVITY Day Hospital — Comfortable Stay",
    title_uk: "Денний стаціонар GENEVITY",
    title_ru: "Дневной стационар GENEVITY",
    title_en: "GENEVITY Day Hospital",
  });

  // 7. Stationary CTA background
  await seedSingleImage("stationary_cta_bg", "/clinic/acupulse.webp", {
    alt_uk: "GENEVITY — денний стаціонар",
    alt_ru: "GENEVITY — дневной стационар",
    alt_en: "GENEVITY — Day Hospital",
    title_uk: "GENEVITY — денний стаціонар та крапельниці",
    title_ru: "GENEVITY — дневной стационар и капельницы",
    title_en: "GENEVITY — Day Hospital and IV Drip Therapy",
  });

  await sql.end();
  console.log("\n✓ All page images seeded successfully");
}

seed().catch((e) => { console.error(e); process.exit(1); });
