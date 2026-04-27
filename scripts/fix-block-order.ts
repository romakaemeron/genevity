/**
 * Fix block_order for all services: replace plain UUID entries with section:<uuid>
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

const FIXED_BLOCKS = new Set(["faq", "doctors", "equipment", "relatedServices", "finalCTA"]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const services = await sql`SELECT id, slug, block_order FROM services WHERE block_order IS NOT NULL`;
  let fixed = 0;

  for (const svc of services) {
    const order: string[] = svc.block_order || [];
    if (!order.length) continue;

    // Get valid section IDs for this service
    const sections = await sql`SELECT id FROM content_sections WHERE owner_type = 'service' AND owner_id = ${svc.id}`;
    const validSectionIds = new Set(sections.map((s: any) => s.id as string));

    let changed = false;
    const newOrder = order.map((key) => {
      if (key.startsWith("section:")) return key; // already correct
      if (FIXED_BLOCKS.has(key)) return key; // fixed block, keep as is
      if (UUID_RE.test(key) && validSectionIds.has(key)) {
        changed = true;
        return `section:${key}`;
      }
      return key; // unknown key, keep as-is
    });

    if (changed) {
      await sql`UPDATE services SET block_order = ${newOrder} WHERE id = ${svc.id}`;
      console.log(`  ✓ ${svc.slug}: ${order.length} entries fixed`);
      fixed++;
    }
  }

  await sql.end();
  console.log(`\n✅ Fixed ${fixed} services.`);
}

main().catch(e => { console.error(e); process.exit(1); });
