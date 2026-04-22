/**
 * Seed each service's FIRST richText section with a heroImage URL and a
 * calloutBody — so the hero layout previously rendered by the route (which
 * magically split the body paragraph and pulled a hardcoded image) now lives
 * entirely in the CMS.
 *
 * What this does:
 *   1. For every service, find the earliest richText section by sort_order.
 *   2. Pick a hero image from the old route-level hardcoded mapping
 *      (service-specific → category default → global fallback).
 *   3. If the section's body has a paragraph break (double newline) and
 *      calloutBody is empty, split: first paragraph stays as body, the rest
 *      moves to calloutBody. Preserves all three locales.
 *
 * Run: npx tsx scripts/seed-richtext-hero-data.ts
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

// Mirror the old hardcoded mapping in
// src/app/[locale]/services/[category]/[slug]/page.tsx so existing pages look
// identical until admins override per-section.
const DEFAULT_PHOTOS = [
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/semi1737-hdr.webp",
];
const CATEGORY_PHOTOS: Record<string, string[]> = {
  "injectable-cosmetology": ["/services/injectable-cosmetology-hero.webp", "/clinic/semi1287-hdr.webp", "/clinic/semi1256-hdr.webp"],
  "apparatus-cosmetology": ["/clinic/semi1737-hdr.webp", "/clinic/acupulse.webp", "/clinic/hydrafacial.webp"],
  "laser-hair-removal": ["/clinic/semi1256-hdr.webp", "/clinic/semi1737-hdr.webp"],
  "longevity": ["/clinic/hydrafacial.webp", "/clinic/semi1287-hdr.webp"],
};
const SERVICE_PHOTOS: Record<string, string[]> = {
  "botulinum-therapy": ["/services/injectable-cosmetology-hero.webp", "/clinic/semi1287-hdr.webp"],
};

function pickHeroImage(serviceSlug: string, categorySlug: string): string {
  return (SERVICE_PHOTOS[serviceSlug]?.[0]) || (CATEGORY_PHOTOS[categorySlug]?.[0]) || DEFAULT_PHOTOS[0];
}

/**
 * Split a possibly-multi-paragraph string on the FIRST blank line.
 * Returns [firstParagraph, rest]. Rest may be empty.
 */
function splitParagraphs(s: string | null | undefined): [string, string] {
  if (!s) return ["", ""];
  const trimmed = s.trim();
  const idx = trimmed.indexOf("\n\n");
  if (idx === -1) return [trimmed, ""];
  return [trimmed.slice(0, idx).trim(), trimmed.slice(idx + 2).trim()];
}

type LocaleString = { uk?: string; ru?: string; en?: string };

function splitLocaleBody(body: LocaleString | null | undefined): { body: LocaleString; callout: LocaleString; didSplit: boolean } {
  const result: { body: LocaleString; callout: LocaleString; didSplit: boolean } = {
    body: {}, callout: {}, didSplit: false,
  };
  for (const l of ["uk", "ru", "en"] as const) {
    const [first, rest] = splitParagraphs(body?.[l]);
    result.body[l] = first;
    result.callout[l] = rest;
    if (rest) result.didSplit = true;
  }
  return result;
}

async function main() {
  // All services with their category slug
  const services = await sql<{ id: string; slug: string; cat_slug: string; title_uk: string }[]>`
    SELECT s.id, s.slug, s.title_uk, c.slug AS cat_slug
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
    ORDER BY c.sort_order, s.sort_order
  `;

  let updated = 0;
  let skipped = 0;
  for (const svc of services) {
    // First richText section by sort_order
    const firstRows = await sql<any[]>`
      SELECT id, data
      FROM content_sections
      WHERE owner_type = 'service' AND owner_id = ${svc.id} AND section_type = 'richText'
      ORDER BY sort_order
      LIMIT 1
    `;
    const first = firstRows[0];
    if (!first) {
      skipped++;
      continue;
    }

    const data = typeof first.data === "string" ? JSON.parse(first.data) : first.data;
    const newData = { ...data };
    let mutated = false;

    // 1. heroImage — only set if not already set
    if (!newData.heroImage) {
      newData.heroImage = pickHeroImage(svc.slug, svc.cat_slug);
      mutated = true;
    }

    // 2. calloutBody — only split if callout is empty AND body actually has a blank line
    const existingCallout = newData.calloutBody as LocaleString | undefined;
    const hasCalloutAlready =
      existingCallout &&
      (existingCallout.uk || existingCallout.ru || existingCallout.en);
    if (!hasCalloutAlready) {
      const split = splitLocaleBody(newData.body as LocaleString | undefined);
      if (split.didSplit) {
        newData.body = split.body;
        newData.calloutBody = split.callout;
        mutated = true;
      } else if (!newData.calloutBody) {
        // Initialize to empty object so the editor shows it cleanly
        newData.calloutBody = { uk: "", ru: "", en: "" };
        mutated = true;
      }
    }

    if (mutated) {
      await sql`
        UPDATE content_sections
        SET data = ${JSON.stringify(newData)}::jsonb
        WHERE id = ${first.id}
      `;
      console.log(`✓ ${svc.slug} (${svc.cat_slug}) — hero image + ${hasCalloutAlready ? "kept callout" : "split body"}`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. Updated ${updated} richText section(s), skipped ${skipped}.`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
