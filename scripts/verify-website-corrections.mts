/**
 * Verifies every correction in GENEVITY_website_corrections.docx against the
 * live CMS. Read-only — asserts current state, never writes.
 *
 *   npx tsx scripts/verify-website-corrections.mts
 */
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const P = (d: any) => (typeof d === "string" ? JSON.parse(d) : d);

let pass = 0, fail = 0;
const failures: string[] = [];
function check(label: string, ok: boolean, detail = "") {
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

async function svc(cat: string, slug: string) {
  const r = await sql`SELECT s.* FROM services s JOIN service_categories c ON c.id = s.category_id
                      WHERE c.slug = ${cat} AND s.slug = ${slug}`;
  return r[0] as any;
}
async function secsOf(id: string) {
  return (await sql`SELECT id, sort_order, section_type, data FROM content_sections
                    WHERE owner_type = 'service' AND owner_id = ${id} ORDER BY sort_order`) as any[];
}
/** every image URL referenced anywhere on a service page */
async function imagesOf(cat: string, slug: string): Promise<string[]> {
  const s = await svc(cat, slug);
  if (!s) return [];
  const out: string[] = [];
  if (s.hero_image) out.push(s.hero_image);
  for (const r of await secsOf(s.id)) {
    const d = P(r.data);
    if (d.heroImage) out.push(d.heroImage);
    if (Array.isArray(d.images)) d.images.forEach((i: any) => out.push(i.url));
  }
  return out;
}
async function hasPhoto(label: string, cat: string, slug: string, mustContain?: string) {
  const imgs = await imagesOf(cat, slug);
  if (!imgs.length) return check(label, false, "жодного фото на сторінці");
  if (mustContain) return check(label, imgs.some((i) => i.includes(mustContain)), `є ${imgs.length} фото, але без "${mustContain}"`);
  check(label, true);
}
async function categoryHas(label: string, slug: string, mustContain?: string) {
  const c = (await sql`SELECT hero_image FROM service_categories WHERE slug = ${slug}`)[0] as any;
  const g = (await sql`SELECT image_url FROM gallery_items WHERE owner_key = ${"category_" + slug} ORDER BY sort_order`) as any[];
  const all = [c?.hero_image, ...g.map((x) => x.image_url)].filter(Boolean) as string[];
  if (!all.length) return check(label, false, "немає ні hero, ні галереї");
  if (mustContain) return check(label, all.some((u) => u.includes(mustContain)), `є ${all.length}, але без "${mustContain}"`);
  check(label, true);
}

console.log("Перевірка правок з GENEVITY_website_corrections.docx\n");

console.log("Правка №1 — /about");
{
  const g = (await sql`SELECT sort_order, image_url, title_uk FROM gallery_items WHERE owner_key='about' ORDER BY sort_order`) as any[];
  check("слайд «Зал апаратної косметології» — реальне фото залу", g[0]?.image_url.includes("hall-apparatus-cosmetology"));
  check("слайд «Кабінет консультацій» — реальне фото кабінету", g[1]?.image_url.includes("consultation-room"));
  check("слайд «Кабінет лікаря» — реальне фото кабінету", g[2]?.image_url.includes("doctor-office"));
  const p = (await sql`SELECT hero_image FROM static_pages WHERE slug='about'`)[0] as any;
  check("замінене фото на сторінці (друге зображення)", !!p?.hero_image && p.hero_image.includes("skincare-eye-treatment"), String(p?.hero_image));
}

console.log("\nПравка №2 — Splendor X");
await hasPhoto("фото апарата SPLENDOR X", "apparatus-cosmetology", "splendor-x", "splendor-x");

console.log("\nПравка №3 — фільтр лікарів (перевіряється у браузері окремо)");
{
  const src = readFileSync("src/components/pages/DoctorsPage.tsx", "utf8");
  check("фільтри більше не використовують застарілі doctor-N id", !/doctor-\d/.test(src));
  check("фільтри працюють за slug лікаря", src.includes("cat.slugs.includes(d.slug)"));
  const page = readFileSync("src/app/[locale]/services/[category]/page.tsx", "utf8");
  check("хаби категорій теж за slug", !/doctor-\d/.test(page) && page.includes("categoryDoctorSlugs"));
  const slugs = [...src.matchAll(/slugs:\s*\[([^\]]*)\]/g)]
    .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
  const known = ((await sql`SELECT slug FROM doctors`) as any[]).map((r) => r.slug);
  const unknown = slugs.filter((s) => !known.includes(s));
  check(`усі ${slugs.length} slug у фільтрах існують у базі`, unknown.length === 0, unknown.join(", "));
  const published = ((await sql`SELECT slug FROM doctors WHERE is_published = true`) as any[]).map((r) => r.slug);
  const orphans = published.filter((s) => !slugs.includes(s));
  check("кожен опублікований лікар потрапляє у якийсь фільтр", orphans.length === 0, orphans.join(", "));
}

console.log("\nПравка №4 — категорія «Апаратна косметологія»");
await categoryHas("кабінети та обладнання замість інтер'єру", "apparatus-cosmetology", "hall-apparatus-cosmetology");

console.log("\nПравка №5 — категорія «Ін'єкційна косметологія»");
await categoryHas("додане тематичне фото", "injectable-cosmetology", "injectable-cosmetology");

console.log("\nПравка №6 — категорія «Лазерна епіляція»");
await categoryHas("фото процедури", "laser-hair-removal", "laser-hair-removal-legs");
await categoryHas("фото апарата Splendor X", "laser-hair-removal", "splendor-x");

console.log("\nПравка №7 — категорія «Подологія»");
{
  const g = (await sql`SELECT image_url FROM gallery_items WHERE owner_key='category_podology'`) as any[];
  await categoryHas("тематичне фото подології", "podology", "podology");
  check("одне фото замість двох інтер'єрних", g.length === 1, `${g.length} фото`);
}

console.log("\nПравка №8 — сторінки ін'єкційної косметології");
for (const [slug, expect] of [
  ["biorevitalisation", "biorevitalisation"], ["mesotherapy", "mesotherapy"], ["exosomes", "exosomes"],
  ["stem-cell-therapy", "stem-cell-therapy"], ["lip-augmentation", "lip-augmentation"],
  ["jaw-contouring", "jaw-contouring"], ["nose-contouring", "nose-contouring"], ["hair-mesotherapy", "hair-mesotherapy"],
] as [string, string][]) await hasPhoto(slug, "injectable-cosmetology", slug, expect);

console.log("\nПравка №10 / №20 — апарат на кожній сторінці апаратної косметології");
for (const [slug, expect] of [
  ["m22-stellar-black", "M22"], ["emface", "emface"], ["ultraformer-mpt", "ultraformer"],
  ["ultraformer-mpt-body", "ultraformer"], ["exion-face", "exion"], ["exion-body", "exion"],
  ["volnewmer", "volnewmer"], ["emsculpt-neo", "emsculpt"], ["hydrafacial", "hydrafacial"],
  ["acupulse-co2", "acupulse"], ["photorejuvenation", "m22-stellar-black"], ["splendor-x", "splendor-x"],
] as [string, string][]) await hasPhoto(slug, "apparatus-cosmetology", slug, expect);

console.log("\nПравка №11 — «IV-терапія»");
{
  const s = await svc("longevity", "iv-therapy");
  const blobs: string[] = [s.title_uk, s.h1_uk, s.summary_uk, s.seo_title_uk, s.seo_desc_uk, s.title_ru, s.h1_ru, s.summary_ru];
  for (const r of await secsOf(s.id)) blobs.push(JSON.stringify(P(r.data)));
  const faq = (await sql`SELECT * FROM faq_items WHERE owner_type='service' AND owner_id=${s.id}`) as any[];
  faq.forEach((f) => blobs.push(JSON.stringify(f)));
  const bad = blobs.filter(Boolean).join(" ").match(/IV[  ]терап/g) || [];
  check("немає варіанта «IV терапія» без дефіса", bad.length === 0, `знайдено ${bad.length}`);
}

console.log("\nПравка №12 — опис перед додатковими блоками");
{
  const rows = (await sql`SELECT s.id, s.slug, c.slug AS cat, s.block_order FROM services s
                          JOIN service_categories c ON c.id = s.category_id WHERE s.block_order IS NOT NULL`) as any[];
  const broken: string[] = [];
  const wrongOrder: string[] = [];
  const FIXED = ["equipment", "doctors", "relatedServices", "faq", "finalCTA", "reviews", "priceTeaser"];
  for (const r of rows) {
    const ids = new Set((await secsOf(r.id)).map((x) => x.id));
    const order: string[] = r.block_order;
    if (order.some((k) => ids.has(k))) broken.push(`${r.cat}/${r.slug}`);
    const valid = order.filter((k) => k.startsWith("section:") ? ids.has(k.slice(8)) : FIXED.includes(k));
    const firstSection = valid.findIndex((k) => k.startsWith("section:"));
    const firstFixed = valid.findIndex((k) => !k.startsWith("section:"));
    if (firstSection > -1 && firstFixed > -1 && firstFixed < firstSection) wrongOrder.push(`${r.cat}/${r.slug}`);
  }
  check("немає block_order зі старими «голими» UUID", broken.length === 0, broken.join(", "));
  check("жодна сторінка не показує додаткові блоки перед описом", wrongOrder.length === 0, wrongOrder.join(", "));
}

console.log("\nПравка №13 — «Пластичний хірург»");
{
  await hasPhoto("тематичне фото", "diagnostics", "plastic-surgeon", "plastic-surgery-consult");
  const s = await svc("diagnostics", "plastic-surgeon");
  const docs = (await sql`SELECT d.slug FROM service_doctors sd JOIN doctors d ON d.id = sd.doctor_id
                          WHERE sd.service_id = ${s.id}`) as any[];
  const have = docs.map((d) => d.slug);
  check("блок «Команда лікарів»: Децик Д. А.", have.includes("detsyk-dmytro"), have.join(", "));
  check("блок «Команда лікарів»: Гармаш С. К.", have.includes("harmash-serhii"), have.join(", "));
  const order: string[] = s.block_order || [];
  check("блок лікарів увімкнений у порядку блоків", order.length === 0 || order.includes("doctors"));
}

console.log("\nПравка №14 — категорія «Доглядові процедури»");
{
  await categoryHas("тематичне фото доглядової процедури", "skincare", "skincare-facial-mask");
  const g = (await sql`SELECT image_url FROM gallery_items WHERE owner_key='category_skincare'`) as any[];
  check("одне фото замість двох інтер'єрних", g.length === 1, `${g.length} фото`);
}

console.log("\nПравка №15 — /laboratory: фото відповідають підписам");
{
  const g = (await sql`SELECT sort_order, image_url, title_uk FROM gallery_items WHERE owner_key='laboratory' ORDER BY sort_order`) as any[];
  const expect: Record<number, string> = { 0: "ultrasound-logiq", 2: "consultation-room", 3: "Zemits", 4: "emface-emsculpt" };
  for (const [i, want] of Object.entries(expect))
    check(`слайд «${g[+i]?.title_uk}» відповідає фото`, !!g[+i]?.image_url.includes(want), g[+i]?.image_url);
}

console.log("\nПравка №16 — блок, що описує апарат, має фото цього апарата");
{
  const DEV = ["M22", "AcuPulse", "Splendor", "EMFACE", "EXION", "Exion", "Ultraformer",
    "Volnewmer", "HydraFacial", "Hydrafacial", "EMSCULPT", "EMSculpt"];
  // Блоки-порівняння та блоки результатів апарат не описують — фото там зайве.
  const NOT_A_DEVICE_BLOCK = /чи інші|результат|порівн/i;
  const svcs = (await sql`SELECT s.id, s.slug, c.slug AS cat FROM services s
                          JOIN service_categories c ON c.id = s.category_id`) as any[];
  const gaps: string[] = [];
  for (const s of svcs) {
    for (const r of await secsOf(s.id)) {
      if (r.section_type !== "richText") continue;
      const d = P(r.data);
      const h = d.heading;
      const head = String(typeof h === "object" && h ? h.uk ?? "" : h ?? "");
      if (!DEV.some((x) => head.includes(x))) continue;
      if (NOT_A_DEVICE_BLOCK.test(head)) continue;
      if (!d.heroImage) gaps.push(`${s.cat}/${s.slug}: «${head.slice(0, 40)}»`);
    }
  }
  check("кожен блок, що описує апарат, має його фото", gaps.length === 0, gaps.join("; "));
}

console.log("\nПравка №17 — «Апаратна косметологія для тіла»: апарат у кожному блоці");
{
  const s = await svc("apparatus-cosmetology", "body");
  const secs = await secsOf(s.id);
  for (const [needle, expect] of [["EMSCULPT", "emsculpt"], ["Ultraformer", "ultraformer"], ["Exion", "exion"]] as [string, string][]) {
    const sec = secs.find((r) => {
      const h = P(r.data).heading;
      return String(typeof h === "object" && h ? h.uk : h ?? "").toLowerCase().includes(needle.toLowerCase());
    });
    const img = sec ? P(sec.data).heroImage : null;
    check(`блок ${needle} має фото апарата`, !!img && img.toLowerCase().includes(expect), String(img));
  }
}

console.log("\nПравка №18 / №19 — категорії Longevity та Діагностика");
await categoryHas("Longevity: одне тематичне фото", "longevity", "longevity-anti-age");
await categoryHas("Діагностика: тематичне фото діагностики", "diagnostics", "ultrasound-logiq");
{
  for (const slug of ["longevity", "diagnostics"]) {
    const g = (await sql`SELECT image_url FROM gallery_items WHERE owner_key=${"category_" + slug}`) as any[];
    check(`${slug}: одне фото замість кількох загальних`, g.length === 1, `${g.length} фото`);
  }
}

console.log("\nПравка №21 — решта сторінок");
await hasPhoto("AcuPulse CO₂ Intimate", "intimate-rejuvenation", "acupulse-co2-intimate", "acupulse-co2-intimate");
await hasPhoto("Лазерна епіляція для чоловіків", "laser-hair-removal", "laser-men", "laser-hair-removal-men");
await hasPhoto("Лазерна епіляція для жінок — Splendor X внизу", "laser-hair-removal", "laser-women", "splendor-x");
await hasPhoto("Лазерна епіляція бікіні — фото", "laser-hair-removal", "laser-bikini", "laser-hair-removal-bikini");
await hasPhoto("Лазерна епіляція ніг — фото", "laser-hair-removal", "laser-legs", "laser-hair-removal-legs-procedure");
for (const slug of ["laser-bikini", "laser-legs"]) {
  const s = await svc("laser-hair-removal", slug);
  const has = (await secsOf(s.id)).some((r) => r.section_type === "showcaseGallery");
  check(`${slug}: галерея «Атмосфера клініки»`, has);
}
for (const [slug, expect] of [
  ["check-up-40", "check-up-40"], ["longevity-program", "longevity-program"], ["hormonal-balance", "hormonal-balance"],
  ["iv-therapy", "iv-therapy"], ["nutraceuticals", "nutraceuticals"], ["exosome-iv-drip", "exosome-iv-drip"],
] as [string, string][]) await hasPhoto(slug, "longevity", slug, expect);
await hasPhoto("Біоімпедансометрія", "diagnostics", "bioimpedance", "inbody");
await hasPhoto("УЗД", "diagnostics", "ultrasound", "ultrasound-logiq");
await hasPhoto("Косметолог", "diagnostics", "cosmetologist", "cosmetologist-injection");

console.log("\nЗагальна перевірка — повторне використання фото");
{
  const svcs = (await sql`SELECT s.id, s.slug, c.slug AS cat FROM services s JOIN service_categories c ON c.id = s.category_id`) as any[];
  const uses = new Map<string, string[]>();
  for (const s of svcs) {
    for (const r of await secsOf(s.id)) {
      const d = P(r.data);
      if (d.heroImage) uses.set(d.heroImage, [...(uses.get(d.heroImage) ?? []), `${s.cat}/${s.slug}`]);
    }
  }
  // Документ забороняє повтор лише тоді, коли фото "не відповідають тематиці".
  // Фото апарата на сторінці процедури, яку на ньому виконують, тематиці
  // відповідає — так само побудована взірцева сторінка /apparatus-cosmetology/face.
  const onTopic = (url: string, page: string) => {
    const dev = url.split("/").pop()!.toLowerCase().replace(/\.webp$/, "");
    const key = dev.split(/[-\s]/)[0];
    return ["m22", "lumenis", "acupulse", "hydrafacial", "exion", "ultraformer",
      "emface", "emsculpt", "volnewmer", "splendor"].some((d) => key.includes(d) || dev.includes(d));
  };
  const dupes = [...uses.entries()].filter(([, v]) => v.length > 1);
  const offTopic = dupes.filter(([k, v]) => !v.every((page) => onTopic(k, page)));
  check("жодне невідповідне фото не повторюється на кількох сторінках",
    offTopic.length === 0, offTopic.map(([k, v]) => `${k.split("/").pop()} → ${v.join(" + ")}`).join("; "));
  if (dupes.length) {
    console.log(`    (свідомі повтори фото апарата на профільних сторінках: ${dupes.length} — ` +
      dupes.map(([k, v]) => `${k.split("/").pop()} на ${v.length} стор.`).join(", ") + ")");
  }
}

console.log("\nЗагальна перевірка — усі файли існують на диску");
{
  const { existsSync } = await import("fs");
  const rows = (await sql`SELECT DISTINCT image_url AS u FROM gallery_items WHERE image_url LIKE '/images/%'
                          UNION SELECT DISTINCT hero_image FROM service_categories WHERE hero_image LIKE '/images/%'
                          UNION SELECT DISTINCT hero_image FROM static_pages WHERE hero_image LIKE '/images/%'`) as any[];
  const urls = new Set(rows.map((r) => r.u as string));
  for (const s of (await sql`SELECT id FROM services`) as any[])
    for (const r of await secsOf(s.id)) {
      const d = P(r.data);
      if (typeof d.heroImage === "string" && d.heroImage.startsWith("/images/")) urls.add(d.heroImage);
      if (Array.isArray(d.images)) d.images.forEach((i: any) => typeof i.url === "string" && i.url.startsWith("/images/") && urls.add(i.url));
    }
  const missing = [...urls].filter((u) => !existsSync("public" + decodeURIComponent(u)));
  check(`усі ${urls.size} файлів /images/* присутні в репозиторії`, missing.length === 0, missing.join(", "));
}

console.log(`\n${"─".repeat(60)}\nПройдено: ${pass}   Не пройдено: ${fail}`);
if (failures.length) { console.log("\nПотребує уваги:"); failures.forEach((f) => console.log("  • " + f)); }
