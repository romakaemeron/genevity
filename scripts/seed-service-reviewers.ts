/**
 * Seed the medical reviewer ("Перевірено лікарем") for each service, chosen by
 * specialty. Populates services.reviewer_doctor_id + last_reviewed_at so the
 * reviewed-by badge + reviewedBy/lastReviewed JSON-LD render on service pages.
 *
 * Strategy (most truthful first):
 *   Tier 1 — a published doctor DIRECTLY linked to the service (service_doctors);
 *            these are the specialists who actually perform the procedure.
 *   Tier 2 — fallback: a published doctor linked to another service in the SAME
 *            category (keeps the reviewer within the service's specialty).
 *   Remaining services (no doctor in the category) are left unassigned for the
 *   clinic to set manually in the admin. Existing manual assignments are never
 *   overwritten (guarded by `reviewer_doctor_id IS NULL`).
 *
 * Run: npx tsx scripts/seed-service-reviewers.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const REVIEW_DATE = "2026-07-01"; // "content last reviewed" stamp shown in the badge
const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  // Tier 1: reviewer = top published doctor directly linked to the service.
  const t1 = await sql`
    UPDATE services s
    SET reviewer_doctor_id = sub.doctor_id, last_reviewed_at = ${REVIEW_DATE}
    FROM (
      SELECT DISTINCT ON (sd.service_id) sd.service_id, sd.doctor_id
      FROM service_doctors sd
      JOIN doctors d ON d.id = sd.doctor_id AND d.is_published = true
      ORDER BY sd.service_id, sd.sort_order, d.sort_order
    ) sub
    WHERE s.id = sub.service_id AND s.reviewer_doctor_id IS NULL
    RETURNING s.id
  `;
  console.log(`Tier 1 (direct specialist):   ${t1.length} services`);

  // Tier 2: category fallback = top published doctor active anywhere in the category.
  const t2 = await sql`
    UPDATE services s
    SET reviewer_doctor_id = sub.doctor_id, last_reviewed_at = ${REVIEW_DATE}
    FROM (
      SELECT DISTINCT ON (s2.category_id) s2.category_id, sd.doctor_id
      FROM services s2
      JOIN service_doctors sd ON sd.service_id = s2.id
      JOIN doctors d ON d.id = sd.doctor_id AND d.is_published = true
      ORDER BY s2.category_id, sd.sort_order, d.sort_order
    ) sub
    WHERE s.category_id = sub.category_id AND s.reviewer_doctor_id IS NULL
    RETURNING s.id
  `;
  console.log(`Tier 2 (category fallback):    ${t2.length} services`);

  const remaining = await sql`
    SELECT s.slug, c.slug AS cat
    FROM services s JOIN service_categories c ON c.id = s.category_id
    WHERE s.reviewer_doctor_id IS NULL
    ORDER BY c.slug, s.slug
  `;
  console.log(`Unassigned (no doctor in category, set manually in admin): ${remaining.length}`);
  if (remaining.length) console.table(remaining);

  const totalSet = await sql`SELECT COUNT(*)::int n FROM services WHERE reviewer_doctor_id IS NOT NULL`;
  const total = await sql`SELECT COUNT(*)::int n FROM services`;
  console.log(`\nServices with a reviewer now: ${totalSet[0].n}/${total[0].n}`);

  const sample = await sql`
    SELECT c.slug AS category, s.slug AS service, d.name_uk AS reviewer
    FROM services s
    JOIN service_categories c ON c.id = s.category_id
    LEFT JOIN doctors d ON d.id = s.reviewer_doctor_id
    ORDER BY c.slug, s.slug LIMIT 25
  `;
  console.table(sample);

  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
