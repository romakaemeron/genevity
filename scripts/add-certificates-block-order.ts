/**
 * Slot the new `certificates` block into every saved service block order.
 *
 * `ServiceDetailTemplate` appends fixed blocks a saved order doesn't mention,
 * which would land the certificates strip *after* the final CTA. Placing it
 * explicitly, right under `equipment`, keeps "which device" and "its paperwork"
 * next to each other. Services without a saved order already get the right
 * place from `SERVICE_FIXED_BLOCKS`.
 *
 * Idempotent. Run: npx tsx scripts/add-certificates-block-order.ts [--dry]
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
envContent.split("\n").forEach((l) => {
  const m = l.match(/^([^#=\s]+)=(.+)/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});

const sql = postgres(process.env.DATABASE_URL!);
const DRY = process.argv.includes("--dry");

function withCertificates(order: string[]): string[] {
  if (order.includes("certificates")) return order;
  const anchor = order.lastIndexOf("equipment");
  if (anchor === -1) {
    // No equipment block saved — put it before the closing CTA, else at the end.
    const cta = order.indexOf("finalCTA");
    const at = cta === -1 ? order.length : cta;
    return [...order.slice(0, at), "certificates", ...order.slice(at)];
  }
  return [...order.slice(0, anchor + 1), "certificates", ...order.slice(anchor + 1)];
}

async function run() {
  const rows = await sql<{ id: string; slug: string; block_order: string[] }[]>`
    SELECT id, slug, block_order FROM services WHERE block_order IS NOT NULL
  `;

  let changed = 0;
  for (const r of rows) {
    const next = withCertificates(r.block_order ?? []);
    if (next.length === (r.block_order ?? []).length) continue;
    changed++;
    const at = next.indexOf("certificates");
    console.log(`${DRY ? "would update" : "updated"} ${r.slug}: certificates at #${at + 1} of ${next.length}`);
    if (!DRY) await sql`UPDATE services SET block_order = ${next} WHERE id = ${r.id}`;
  }

  console.log(`\n${changed} of ${rows.length} service(s) ${DRY ? "would change" : "changed"}.`);
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
