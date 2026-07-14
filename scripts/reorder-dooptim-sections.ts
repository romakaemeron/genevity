/**
 * Place the "Дооптимізація" sections in a logical mid-page position by splicing
 * their keys into each service's block_order (they were appended at the end).
 * Idempotent: sets block_order to the computed arrays.
 * Run: npx tsx scripts/reorder-dooptim-sections.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const sec = (id: string) => `section:${id}`;

// New block_order per service (section:<id> for content sections; bare keys for fixed blocks).
const ORDER: Record<string, string[]> = {
  "ultraformer-mpt": [
    sec("b88786dc-6979-4477-bd72-30114aca86f4"), // intro
    sec("b1059789-0df1-4a82-bb2a-1db22a722731"), // indications/contra
    sec("23718d28-5949-44fe-a763-3eb6ae0583a7"), // callout
    sec("a88ee802-d63b-47d0-ad7c-33acbb87e27b"), // NEW: preparation
    sec("505d50c6-d77a-41af-8783-aaa9e8eb8566"), // steps (how it works)
    sec("abf735e7-d56d-438c-8aa5-78d8419dff5a"), // benefits
    sec("47a90ef6-26d2-4e04-abfe-bbef098507d5"), // NEW: comparison
    sec("4a7cdc23-647c-4966-b7d7-44811414c344"), // gallery
    sec("082b3a92-0392-4c62-bde3-457d93191f9f"), // cta
    "equipment", "doctors", "relatedServices", "faq", "finalCTA",
  ],
  "hydrafacial": [
    sec("348d0b92-1b63-4a06-bcf0-b5b78bb82930"), // intro
    sec("8ec93c85-6acb-469f-8d29-3f7ddefd32b8"), // indications/contra
    sec("37466c47-2f95-4729-807f-cab7da25a350"), // callout
    sec("ec88c9c6-1f5e-4523-8b4f-1064902fb2e5"), // steps
    sec("e448dcc0-51e1-458e-aaf0-7a1f044ce742"), // benefits
    sec("d6c95ab6-4143-4d37-99af-9c93239c9fe7"), // NEW: aftercare
    sec("b14e7f9d-e580-44d6-98b0-1f1b54dcd484"), // gallery
    sec("493fdc61-e4c8-48e0-9ac5-5e65f4c2203d"), // cta
    "equipment", "doctors", "relatedServices", "faq", "finalCTA",
  ],
  "acupulse-co2": [
    sec("1acdebed-8e7b-4923-8b82-4e94838b8ea2"), // intro
    sec("ab41f7a0-c295-49c9-8045-c8267f0d395a"), // NEW: problems it solves
    sec("766a9578-7863-47de-bffe-e39827d7060a"), // indications/contra
    sec("a6c6e910-5afc-4731-a0ad-992c2e46b414"), // callout
    sec("5a72d8a7-4780-4792-86f3-518ae9789552"), // steps
    sec("8e74c994-0f82-4756-9d56-1300b5c95772"), // benefits
    sec("9ff5c237-8bcc-46ce-a56d-b13b2e062521"), // NEW: aftercare
    sec("e86d4db4-baff-4404-a8af-058feafbf154"), // gallery
    sec("7ed40bb7-135b-4947-910f-3cc55d29f61f"), // cta
    "equipment", "doctors", "relatedServices", "faq", "finalCTA",
  ],
};

async function main() {
  for (const [slug, order] of Object.entries(ORDER)) {
    // Safety: confirm every section:<id> in the new order actually belongs to this service.
    const s = await sql`SELECT id FROM services WHERE slug = ${slug}`;
    if (!s.length) { console.warn(`✗ no service ${slug}`); continue; }
    const owned = await sql`SELECT id FROM content_sections WHERE owner_type='service' AND owner_id=${s[0].id}`;
    const ownedSet = new Set(owned.map((r) => `section:${r.id}`));
    const missing = order.filter((k) => k.startsWith("section:") && !ownedSet.has(k));
    if (missing.length) { console.error(`✗ ${slug}: block_order references sections not owned by it:`, missing); process.exit(1); }
    // Also confirm we didn't drop any existing section.
    const dropped = [...ownedSet].filter((k) => !order.includes(k));
    if (dropped.length) { console.error(`✗ ${slug}: these sections would be dropped from block_order:`, dropped); process.exit(1); }

    await sql`UPDATE services SET block_order = ${order} WHERE slug = ${slug}`;
    console.log(`✓ ${slug}: block_order updated (${order.length} blocks)`);
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
