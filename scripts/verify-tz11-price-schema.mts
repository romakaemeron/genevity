/**
 * ТЗ №11-2 §6 — verifies the Product/AggregateOffer markup on every service
 * page that has a price block, against what the live site actually serves.
 *
 * Recomputes the expected range from the CMS with the same helper the page
 * uses, then fetches each page and compares. Read-only.
 *
 *   npx tsx scripts/verify-tz11-price-schema.mts [--base https://genevity.com.ua]
 */
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from "@neondatabase/serverless";
import { getPriceRange } from "../src/lib/price-range";
import type { ContentSection } from "../src/lib/db/types";

const sql = neon(process.env.DATABASE_URL!);
const baseArg = process.argv.indexOf("--base");
const BASE = baseArg > -1 ? process.argv[baseArg + 1] : "https://genevity.com.ua";

const P = (d: any) => (typeof d === "string" ? JSON.parse(d) : d);
/** Resolve {uk,ru,en} leaves to Ukrainian, matching the default-locale page. */
const uk = (v: any): any => {
  if (v === null || v === undefined) return v;
  if (Array.isArray(v)) return v.map(uk);
  if (typeof v === "object") {
    if ("uk" in v || "ru" in v || "en" in v) return v.uk ?? "";
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, uk(x)]));
  }
  return v;
};

const services = (await sql`
  SELECT s.id, s.slug, c.slug AS cat, s.title_uk, s.seo_title_uk, s.seo_desc_uk, s.summary_uk
  FROM services s JOIN service_categories c ON c.id = s.category_id
  ORDER BY c.slug, s.sort_order`) as any[];

let withPrices = 0, ok = 0;
const problems: string[] = [];

for (const s of services) {
  const rows = (await sql`SELECT section_type, data FROM content_sections
                          WHERE owner_type='service' AND owner_id=${s.id} ORDER BY sort_order`) as any[];
  const sections: ContentSection[] = rows.map((r) => ({
    _type: `section.${r.section_type}`,
    _key: "k",
    ...uk(P(r.data)),
  })) as any;

  const expected = getPriceRange(sections);
  const url = `${BASE}/services/${s.cat}/${s.slug}`;
  const html = await fetch(url).then((r) => r.text()).catch(() => "");
  const found = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
    .find((d) => d && d["@type"] === "Product");

  if (!expected) {
    if (found) problems.push(`${s.cat}/${s.slug}: Product є, але блоку цін немає`);
    continue;
  }
  withPrices++;

  if (!found) {
    problems.push(`${s.cat}/${s.slug}: блок цін є, Product-розмітки НЕМАЄ`);
    continue;
  }

  const o = found.offers || {};
  const mism: string[] = [];
  if (o.priceCurrency !== expected.currency) mism.push(`currency ${o.priceCurrency}≠${expected.currency}`);
  if (Number(o.lowPrice) !== expected.lowPrice) mism.push(`low ${o.lowPrice}≠${expected.lowPrice}`);
  if (Number(o.highPrice) !== expected.highPrice) mism.push(`high ${o.highPrice}≠${expected.highPrice}`);
  if (Number(o.offerCount) !== expected.offerCount) mism.push(`count ${o.offerCount}≠${expected.offerCount}`);
  if (o.url !== url) mism.push(`url ${o.url}`);
  if (!found.name) mism.push("name порожній");
  if (!found.description) mism.push("description порожній");
  // The TZ says description must be the page's meta description.
  const metaDesc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  // The meta tag is HTML-escaped ("м&#x27;язи") while JSON-LD carries the raw
  // character, so compare the decoded forms.
  const unesc = (t: string) => t
    .replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_m: string, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m: string, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
  if (metaDesc && unesc(found.description) !== unesc(metaDesc)) mism.push("description ≠ meta description");

  if (mism.length) problems.push(`${s.cat}/${s.slug}: ${mism.join(", ")}`);
  else { ok++; console.log(`  ✓ ${s.cat}/${s.slug}  ${expected.lowPrice}–${expected.highPrice} ${expected.currency} ×${expected.offerCount}`); }
}

console.log(`\nСторінок із блоком цін: ${withPrices}   коректна розмітка: ${ok}`);
if (problems.length) {
  console.log(`\nПроблеми (${problems.length}):`);
  problems.forEach((p) => console.log("  ✗ " + p));
} else {
  console.log("Розбіжностей немає.");
}
