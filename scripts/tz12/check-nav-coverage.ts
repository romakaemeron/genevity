/**
 * Nav coverage check: every published service and category hub must be
 * reachable from the mega menu. Run after adding service pages.
 *
 * Run: npx tsx scripts/tz12/check-nav-coverage.ts
 */
import { sql } from "./lib";
import { navTop } from "../../src/components/layout/navConfig";

async function main(){
  const inNav = new Set<string>();
  for (const top of navTop) {
    inNav.add(top.href);
    for (const sec of top.mega?.sections ?? []) inNav.add(sec.href);
    for (const c of top.mega?.categories ?? []) { inNav.add(c.href); c.items.forEach(i=>inNav.add(i.href)); }
  }
  const rows = await sql`SELECT s.slug, s.title_uk, c.slug AS cat FROM services s JOIN service_categories c ON c.id=s.category_id ORDER BY c.slug, s.sort_order`;
  const missing: any[] = [];
  for (const r of rows as any[]) {
    if (r.slug === r.cat) continue;
    const p = `/services/${r.cat}/${r.slug}`;
    if (!inNav.has(p)) missing.push({ ...r, path: p });
  }
  console.log(`services in DB: ${rows.length}`);
  console.log(`rendered in mega menu: ${[...inNav].filter(h=>h.startsWith("/services/")).length}`);
  console.log(`MISSING from mega menu: ${missing.length}\n`);
  if (missing.length) process.exitCode = 1;
  let cur=""; for (const m of missing){ if(m.cat!==cur){cur=m.cat;console.log(`[${cur}]`);} console.log("  ", m.slug.padEnd(32), m.title_uk); }
  const cats = await sql`SELECT slug, title_uk FROM service_categories ORDER BY sort_order`;
  console.log("\nCATEGORY hubs in mega menu:");
  for (const c of cats as any[]) console.log("  ", inNav.has(`/services/${c.slug}`)?"✓":"✗", c.slug);
  await sql.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
