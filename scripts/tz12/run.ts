/**
 * Inweb TZ #12 - create and fill the 11 new service pages.
 *
 * Source: tasks_inweb/genevity.com.ua _ Технічне завдання №12 _ Метатеги - genevity.com.ua.csv
 *   apparatus-cosmetology: smas-lifting, rf-lifting, microneedling-rf-lifting,
 *                          3d-rejuvenation, acne-phototherapy, pigmentation-photo-removal
 *   laser-hair-removal:    laser-abdomen, laser-face, laser-underarms, laser-arms, laser-back
 *
 * Idempotent: re-running rewrites content, sections, FAQs and relations in place.
 * Run: npx tsx scripts/tz12/run.ts
 */
import { sql, seedService } from "./lib";
import { apparatus } from "./content-apparatus";
import { apparatusB } from "./content-apparatus-b";
import { laser } from "./content-laser";
import { laserB } from "./content-laser-b";

const ALL = [...apparatus, ...apparatusB, ...laser, ...laserB];
const REVIEW_DATE = "2026-09-03"; // "content last reviewed" stamp for the reviewer badge

async function main() {
  const slugs = ALL.map((s) => s.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("duplicate slug in the TZ #12 set");
  console.log(`TZ #12 - seeding ${ALL.length} services\n`);

  for (const svc of ALL) await seedService(svc);

  // Medical reviewer badge: first linked published doctor, matching seed-service-reviewers.ts.
  const rev = await sql`
    UPDATE services s
    SET reviewer_doctor_id = sub.doctor_id, last_reviewed_at = ${REVIEW_DATE}
    FROM (
      SELECT DISTINCT ON (sd.service_id) sd.service_id, sd.doctor_id
      FROM service_doctors sd
      JOIN doctors d ON d.id = sd.doctor_id AND d.is_published = true
      ORDER BY sd.service_id, sd.sort_order, d.sort_order
    ) sub
    WHERE s.id = sub.service_id AND s.slug = ANY(${slugs}) AND s.reviewer_doctor_id IS NULL
    RETURNING s.slug`;
  console.log(`\nreviewer assigned: ${rev.length} services`);

  // Backlinks: make the new pages reachable from the siblings they point at.
  let added = 0;
  for (const svc of ALL) {
    const [me] = await sql`SELECT id FROM services WHERE slug = ${svc.slug}`;
    for (const relSlug of svc.related ?? []) {
      const [other] = await sql`SELECT id FROM services WHERE slug = ${relSlug}`;
      if (!other) continue;
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM service_related WHERE service_id = ${other.id} AND related_service_id = ${me.id}`;
      if (count > 0) continue;
      const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), -1) AS max FROM service_related WHERE service_id = ${other.id}`;
      await sql`INSERT INTO service_related(service_id, related_service_id, sort_order) VALUES(${other.id}, ${me.id}, ${Number(max) + 1})`;
      added++;
    }
  }
  console.log(`backlinks added: ${added}`);

  await sql.end();
  console.log("\nTZ #12 DONE.");
}
main().catch((e) => { console.error(e); process.exit(1); });
