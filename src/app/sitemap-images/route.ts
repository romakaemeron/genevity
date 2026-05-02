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

function urlBlock(loc: string, images: { url: string; title: string }[]): string {
  const imgTags = images
    .map(
      (img) =>
        `  <image:image>\n    <image:loc>${escapeXml(img.url)}</image:loc>\n    <image:title>${escapeXml(img.title)}</image:title>\n  </image:image>`
    )
    .join("\n");
  return `<url>\n  <loc>${escapeXml(loc)}</loc>\n${imgTags}\n</url>`;
}

export async function GET() {
  const [doctors, serviceRows] = await Promise.all([
    getAllDoctors("ua"),
    sql`
      SELECT s.slug, sc.slug AS category_slug, s.hero_image, s.title_uk
      FROM services s
      JOIN service_categories sc ON sc.id = s.category_id
      WHERE s.hero_image IS NOT NULL
    `,
  ]);

  const blocks: string[] = [];

  // Homepage
  blocks.push(
    urlBlock(`${BASE}/`, [
      { url: `${BASE}/og/genevity-og.jpg`, title: "GENEVITY — центр довголіття та естетичної медицини у Дніпрі" },
    ])
  );

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
