/**
 * Create the consultation pages missing from the "Консультації лікарів" price list.
 *
 * New:      dermatologist, gastroenterologist, dietician, therapist, neurologist, reproductologist
 * Existing: cosmetologist, endocrinologist, plastic-surgeon (diagnostics),
 *           гінеколог → /services/gynaecology hub, подолог → /services/podology hub
 *
 * Idempotent. Run: npx tsx scripts/tz12/run-consultations.ts
 */
import { sql, seedService } from "./lib";
import { consultations } from "./content-consultations";
import { consultationsB } from "./content-consultations-b";

const ALL = [...consultations, ...consultationsB];
const REVIEW_DATE = "2026-09-03";

async function main() {
  console.log(`Consultations - seeding ${ALL.length} services\n`);
  for (const svc of ALL) await seedService(svc);

  const slugs = ALL.map((s) => s.slug);
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
  console.log(`\nreviewer assigned: ${rev.length}`);

  // Pages with no specialist on the roster yet - the clinic must add the doctor
  // before the "doctors" block and the reviewed-by badge can render.
  const orphans = await sql`
    SELECT s.slug FROM services s
    WHERE s.slug = ANY(${slugs})
      AND NOT EXISTS (SELECT 1 FROM service_doctors sd WHERE sd.service_id = s.id)
    ORDER BY s.slug`;
  if (orphans.length) console.log(`awaiting a doctor: ${orphans.map((o: { slug: string }) => o.slug).join(", ")}`);

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
  console.log("\nConsultations DONE.");
}
main().catch((e) => { console.error(e); process.exit(1); });
