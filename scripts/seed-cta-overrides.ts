/**
 * Seed empty per-instance CTA override entries under ui_strings.cta.<key>
 * for every CtaRegistryEntry. Safe to re-run — existing non-empty keys
 * are preserved, only missing ones are added.
 *
 * Each field is saved as a {uk, ru, en} object with all three blank —
 * the admin fills in overrides through the new /admin/settings/cta page;
 * anything left blank falls back to ctaForm.* defaults at render time.
 *
 * Run: npx tsx scripts/seed-cta-overrides.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { CTA_REGISTRY } from "../src/lib/cta-registry";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

const FIELDS = ["buttonLabel", "modalTitle", "modalSubtitle", "submitLabel"] as const;

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.cta = tree.cta || {};

  let added = 0;
  for (const entry of CTA_REGISTRY) {
    if (!tree.cta[entry.key]) tree.cta[entry.key] = {};
    for (const field of FIELDS) {
      if (!tree.cta[entry.key][field]) {
        tree.cta[entry.key][field] = { uk: "", ru: "", en: "" };
        added += 1;
      }
    }
  }

  if (added === 0) {
    console.log("↷ all CTA override slots already present — no changes");
  } else {
    await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
    console.log(`✓ added ${added} CTA override slots (${CTA_REGISTRY.length} instances × ${FIELDS.length} fields)`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
