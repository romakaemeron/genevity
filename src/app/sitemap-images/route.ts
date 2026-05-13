/**
 * SEO audit §1.6.1 — XML image sitemap served at /sitemap-images.xml
 * Rewrite configured in next.config.ts: /sitemap-images.xml → /sitemap-images
 * Google spec: https://developers.google.com/search/docs/advanced/sitemaps/image-sitemaps
 */

import { getAllDoctors } from "@/lib/db/queries";
import { sql } from "@/lib/db/client";

const BASE = "https://genevity.com.ua";

export const revalidate = 3600;

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
  // Relative path → prepend BASE
  if (!url.startsWith("http")) return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  // Already on our domain → keep as-is
  if (url.startsWith(BASE)) return url;
  // External storage (Vercel Blob, etc.) → proxy through Next.js image optimisation
  // so the URL in the sitemap is on genevity.com.ua, not on a third-party host.
  return `${BASE}/_next/image?url=${encodeURIComponent(url)}&w=1200&q=75`;
}

function urlBlock(loc: string, images: { url: string; title: string }[]): string {
  const imgTags = images
    .map(
      (img) =>
        `  <image:image>\n    <image:loc>${escapeXml(absUrl(img.url))}</image:loc>\n    <image:title>${escapeXml(img.title)}</image:title>\n  </image:image>`
    )
    .join("\n");
  return `<url>\n  <loc>${escapeXml(loc)}</loc>\n${imgTags}\n</url>`;
}

export async function GET() {
  const [doctors, serviceRows, heroSlides, galleryItems, equipmentRows] = await Promise.all([
    getAllDoctors("ua"),
    sql`
      SELECT s.slug, sc.slug AS category_slug, s.hero_image, s.title_uk
      FROM services s
      JOIN service_categories sc ON sc.id = s.category_id
      WHERE s.hero_image IS NOT NULL
    `,
    sql`SELECT image_url, alt_uk FROM hero_slides WHERE image_url IS NOT NULL ORDER BY sort_order`,
    sql`SELECT image_url, alt_uk, owner_key FROM gallery_items WHERE image_url IS NOT NULL ORDER BY sort_order`,
    sql`SELECT name, photo FROM equipment WHERE photo IS NOT NULL ORDER BY sort_order`,
  ]);

  const blocks: string[] = [];

  // Homepage — OG image + hero slides
  const homepageImages: { url: string; title: string }[] = [
    { url: `${BASE}/og/genevity-og.jpg`, title: "GENEVITY — центр довголіття та естетичної медицини у Дніпрі" },
    ...heroSlides.map((s) => ({ url: s.image_url as string, title: (s.alt_uk as string) || "GENEVITY" })),
  ];
  blocks.push(urlBlock(`${BASE}/`, homepageImages));

  // About page gallery
  const aboutImages = galleryItems.filter((g) => g.owner_key === "about");
  if (aboutImages.length > 0) {
    blocks.push(urlBlock(`${BASE}/about`, aboutImages.map((g) => ({ url: g.image_url as string, title: (g.alt_uk as string) || "GENEVITY" }))));
  }

  // Stationary page gallery
  const stationaryImages = galleryItems.filter((g) => g.owner_key === "stationary");
  if (stationaryImages.length > 0) {
    blocks.push(urlBlock(`${BASE}/stationary`, stationaryImages.map((g) => ({ url: g.image_url as string, title: (g.alt_uk as string) || "GENEVITY" }))));
  }

  // Laboratory page gallery
  const labImages = galleryItems.filter((g) => g.owner_key === "laboratory");
  if (labImages.length > 0) {
    blocks.push(urlBlock(`${BASE}/laboratory`, labImages.map((g) => ({ url: g.image_url as string, title: (g.alt_uk as string) || "GENEVITY" }))));
  }

  // Equipment pages (apparatus cosmetology)
  for (const eq of equipmentRows) {
    if (!eq.photo) continue;
    blocks.push(
      urlBlock(`${BASE}/services/apparatus-cosmetology`, [
        { url: eq.photo as string, title: (eq.name as string) || "Апаратна косметологія GENEVITY" },
      ])
    );
  }

  // Doctor profile photos
  for (const doc of doctors) {
    if (!doc.slug || !doc.photoCard) continue;
    blocks.push(
      urlBlock(`${BASE}/doctors/${doc.slug}`, [
        { url: doc.photoCard, title: doc.name },
      ])
    );
  }

  // Service hero images
  for (const row of serviceRows) {
    if (!row.hero_image) continue;
    blocks.push(
      urlBlock(`${BASE}/services/${row.category_slug}/${row.slug}`, [
        { url: row.hero_image as string, title: (row.title_uk as string) ?? "" },
      ])
    );
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...blocks,
    `</urlset>`,
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
    },
  });
}
