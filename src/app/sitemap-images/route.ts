/**
 * SEO audit §1.6.1 — XML image sitemap served at /sitemap-images.xml
 * Rewrite configured in next.config.ts: /sitemap-images.xml → /sitemap-images
 * Google spec: https://developers.google.com/search/docs/advanced/sitemaps/image-sitemaps
 *
 * Covers ALL image sources on the site:
 *   - Hero slides, OG image (homepage)
 *   - Gallery items (all owner_keys → their respective page URLs)
 *   - Doctor profile photos (photo_card + photo_circle)
 *   - Service hero images
 *   - Equipment photos
 *   - Blog post cover images
 *   - Before/after case photos (homepage + service pages), promotion cards
 */

import { getAllDoctors } from "@/lib/db/queries";
import { sql } from "@/lib/db/client";

const BASE = "https://genevity.com.ua";

export const revalidate = 3600;

// Maps gallery owner_key → the page URL where those images appear
const GALLERY_PAGE_MAP: Record<string, string> = {
  homepage_about: `${BASE}/`,
  advantages_bento: `${BASE}/`,
  about: `${BASE}/about`,
  about_cta_bg: `${BASE}/about`,
  laboratory: `${BASE}/laboratory`,
  stationary: `${BASE}/stationary`,
  stationary_comfort_bg: `${BASE}/stationary`,
  stationary_cta_bg: `${BASE}/stationary`,
  contacts_cta_bg: `${BASE}/contacts`,
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absUrl(url: string): string {
  if (!url) return "";
  if (!url.startsWith("http")) return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  if (url.startsWith(BASE)) return url;
  // External storage (Vercel Blob etc.) → proxy through Next.js image optimisation
  return `${BASE}/_next/image?url=${encodeURIComponent(url)}&w=1200&q=75`;
}

function urlBlock(loc: string, images: { url: string; title: string }[]): string {
  const valid = images.filter((i) => i.url);
  if (!valid.length) return "";
  const imgTags = valid
    .map(
      (img) =>
        `  <image:image>\n    <image:loc>${escapeXml(absUrl(img.url))}</image:loc>\n    <image:title>${escapeXml(img.title)}</image:title>\n  </image:image>`
    )
    .join("\n");
  return `<url>\n  <loc>${escapeXml(loc)}</loc>\n${imgTags}\n</url>`;
}

export async function GET() {
  const [doctors, serviceRows, heroSlides, galleryItems, equipmentRows, blogRows, beforeAfterRows, promotionRows] =
    await Promise.all([
      getAllDoctors("ua"),
      sql`
        SELECT s.slug, sc.slug AS category_slug, s.hero_image, s.title_uk
        FROM services s
        JOIN service_categories sc ON sc.id = s.category_id
        WHERE s.hero_image IS NOT NULL AND s.hero_image != ''
          AND s.slug <> sc.slug
      `,
      sql`SELECT image_url, alt_uk FROM hero_slides WHERE image_url IS NOT NULL AND image_url != '' ORDER BY sort_order`,
      sql`SELECT image_url, alt_uk, owner_key FROM gallery_items WHERE image_url IS NOT NULL AND image_url != '' ORDER BY sort_order`,
      sql`SELECT name, photo FROM equipment WHERE photo IS NOT NULL AND photo != '' ORDER BY sort_order`,
      sql`
        SELECT slug, cover_image, title_uk
        FROM blog_posts
        WHERE is_draft = false
          AND published_at <= NOW()
          AND cover_image IS NOT NULL
          AND cover_image != ''
      `,
      // ТЗ #16 §1.1 / §2.1 — before/after proof photos, resolved to the page
      // that renders them (homepage, or the owning service's URL).
      sql`
        SELECT b.owner_key, b.before_url, b.after_url, b.alt_uk, b.title_uk,
               s.slug AS service_slug, sc.slug AS category_slug
        FROM before_after_cases b
        LEFT JOIN services s
          ON b.owner_key = 'service:' || s.id::text
        LEFT JOIN service_categories sc ON sc.id = s.category_id
        WHERE b.is_published = true AND b.before_url <> '' AND b.after_url <> ''
        ORDER BY b.sort_order
      `,
      // ТЗ #16 §1.2 — promotion card images live on the homepage.
      sql`
        SELECT image_url, title_uk FROM promotions
        WHERE is_published = true AND image_url IS NOT NULL AND image_url <> ''
          AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
        ORDER BY sort_order
      `,
    ]);

  const blocks: string[] = [];

  // — Homepage: OG image + hero slides. The block itself is emitted after the
  //   gallery / before-after / promotion passes below have contributed their
  //   homepage images, so everything on `/` ends up in one <url> entry.
  const homepageImages: { url: string; title: string }[] = [
    { url: `${BASE}/og/genevity-og.jpg`, title: "GENEVITY — центр довголіття та естетичної медицини у Дніпрі" },
    ...heroSlides.map((s) => ({ url: s.image_url as string, title: (s.alt_uk as string) || "GENEVITY" })),
  ];

  // — Gallery items grouped by page
  const galleryByPage = new Map<string, { url: string; title: string }[]>();
  for (const g of galleryItems) {
    const ownerKey = g.owner_key as string;
    const pageUrl = GALLERY_PAGE_MAP[ownerKey];
    if (!pageUrl) continue;
    if (!galleryByPage.has(pageUrl)) galleryByPage.set(pageUrl, []);
    galleryByPage.get(pageUrl)!.push({
      url: g.image_url as string,
      title: (g.alt_uk as string) || "GENEVITY",
    });
  }
  for (const [pageUrl, images] of galleryByPage.entries()) {
    // Homepage images already emitted above — merge into the existing block or skip
    if (pageUrl === `${BASE}/`) {
      homepageImages.push(...images);
      continue;
    }
    const block = urlBlock(pageUrl, images);
    if (block) blocks.push(block);
  }

  // — Before/after cases, grouped by the page that shows them
  const beforeAfterByPage = new Map<string, { url: string; title: string }[]>();
  for (const c of beforeAfterRows) {
    const ownerKey = c.owner_key as string;
    const pageUrl =
      ownerKey === "homepage"
        ? `${BASE}/`
        : c.service_slug && c.category_slug
        ? `${BASE}/services/${c.category_slug}/${c.service_slug}`
        : null;
    // An orphaned owner_key (service deleted) has no page to point at.
    if (!pageUrl) continue;
    const title = (c.alt_uk as string) || (c.title_uk as string) || "GENEVITY — до і після";
    const target = pageUrl === `${BASE}/` ? homepageImages : (beforeAfterByPage.get(pageUrl) ?? []);
    target.push({ url: c.before_url as string, title });
    target.push({ url: c.after_url as string, title });
    if (pageUrl !== `${BASE}/`) beforeAfterByPage.set(pageUrl, target);
  }

  // — Promotion card images (homepage)
  for (const p of promotionRows) {
    homepageImages.push({
      url: p.image_url as string,
      title: (p.title_uk as string) || "GENEVITY — акція",
    });
  }

  blocks.push(urlBlock(`${BASE}/`, homepageImages));

  // — Equipment photos (apparatus cosmetology page)
  const equipmentImages = equipmentRows
    .filter((eq) => eq.photo)
    .map((eq) => ({ url: eq.photo as string, title: (eq.name as string) || "Апаратна косметологія GENEVITY" }));
  if (equipmentImages.length) {
    blocks.push(urlBlock(`${BASE}/services/apparatus-cosmetology`, equipmentImages));
  }

  // — Doctor profile photos (photo_card + photo_circle, deduplicated)
  for (const doc of doctors) {
    if (!doc.slug) continue;
    const images: { url: string; title: string }[] = [];
    if (doc.photoCard) images.push({ url: doc.photoCard, title: doc.name });
    if (doc.photoCircle && doc.photoCircle !== doc.photoCard) {
      images.push({ url: doc.photoCircle, title: doc.name });
    }
    const block = urlBlock(`${BASE}/doctors/${doc.slug}`, images);
    if (block) blocks.push(block);
  }

  // — Service hero images (plus that service's before/after photos, so each
  //   service URL appears exactly once)
  for (const row of serviceRows) {
    const pageUrl = `${BASE}/services/${row.category_slug}/${row.slug}`;
    const images: { url: string; title: string }[] = [];
    if (row.hero_image) {
      images.push({ url: row.hero_image as string, title: (row.title_uk as string) ?? "" });
    }
    const ba = beforeAfterByPage.get(pageUrl);
    if (ba) { images.push(...ba); beforeAfterByPage.delete(pageUrl); }
    const block = urlBlock(pageUrl, images);
    if (block) blocks.push(block);
  }

  // — Before/after photos on services whose hero image is missing (or whose
  //   page was filtered out of `serviceRows`), so those cases aren't lost.
  for (const [pageUrl, images] of beforeAfterByPage.entries()) {
    const block = urlBlock(pageUrl, images);
    if (block) blocks.push(block);
  }

  // — Blog post cover images
  for (const post of blogRows) {
    if (!post.cover_image) continue;
    const block = urlBlock(`${BASE}/blog/${post.slug}`, [
      { url: post.cover_image as string, title: (post.title_uk as string) ?? "" },
    ]);
    if (block) blocks.push(block);
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...blocks.filter(Boolean),
    `</urlset>`,
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
    },
  });
}
