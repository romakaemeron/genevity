import { sql } from "../client";
import type { EquipmentCertificate } from "../types";

/** Raw shape stored in `equipment.certificates` — see migration 025. */
export interface RawEquipmentCertificate {
  url: string;
  type: "image";
  /** Stable key of the source document; pages of one scan share it. */
  source: string;
  page: number;
  pageCount: number;
  doc_uk: string; doc_ru: string; doc_en: string;
  issuer_uk: string; issuer_ru: string; issuer_en: string;
  number: string;
  valid_until_uk: string; valid_until_ru: string; valid_until_en: string;
  alt_uk: string; alt_ru: string; alt_en: string;
}

type Lang = "uk" | "ru" | "en";

/**
 * Resolve the stored `{uk,ru,en}` columns down to one locale.
 *
 * The jsonb column can come back as a string from the Neon HTTP driver, the
 * same way `content_sections.data` does — accept either shape.
 */
export function resolveCertificates(
  raw: RawEquipmentCertificate[] | string | null | undefined,
  l: string,
): EquipmentCertificate[] {
  const parsed: RawEquipmentCertificate[] =
    typeof raw === "string" ? JSON.parse(raw) : raw ?? [];
  if (!Array.isArray(parsed)) return [];
  const lang = (l === "ua" ? "uk" : l) as Lang;
  const pick = (c: RawEquipmentCertificate, key: "doc" | "issuer" | "alt") =>
    c[`${key}_${lang}` as const] || c[`${key}_uk` as const] || "";

  return parsed.map((c) => ({
    url: c.url,
    doc: pick(c, "doc"),
    issuer: pick(c, "issuer"),
    number: c.number || "",
    validUntil: c[`valid_until_${lang}` as const] || c.valid_until_uk || "",
    alt: pick(c, "alt"),
    page: c.page ?? 1,
    pageCount: c.pageCount ?? 1,
  }));
}

/** A service page a certified device is used on. */
export interface CertificateServiceLink {
  slug: string;
  categorySlug: string;
  title: string;
}

/** One source document — a certificate and all of its scanned pages. */
export interface CertificateDocument {
  /** `source` key from the seed; stable across re-runs, used as the anchor id. */
  key: string;
  doc: string;
  issuer: string;
  number: string;
  validUntil: string;
  /** Pages in document order. */
  pages: { url: string; alt: string; page: number }[];
  /** Devices the document covers, in `equipment.sort_order`. */
  devices: string[];
  /** Service pages those devices are used on, deduped. */
  services: CertificateServiceLink[];
}

/**
 * Every certificate on file, grouped by document rather than by device.
 *
 * One scan usually covers several machines — the BTL certificate covers EMFACE,
 * EMSCULPT NEO and the three EXION variants; one Classys certificate covers
 * both Ultraformer MPT and Volnewmer. Grouping by device would print the same
 * five pages five times over, so the hub lists each document once and names the
 * devices it applies to.
 */
export async function getCertificateDocuments(locale: string): Promise<CertificateDocument[]> {
  const l = locale === "ua" ? "uk" : locale;

  const rows = await sql`
    SELECT id, name, certificates
    FROM equipment
    WHERE jsonb_typeof(certificates) = 'array'
      AND jsonb_array_length(certificates) > 0
    ORDER BY sort_order
  `;
  if (!rows.length) return [];

  const linkRows = await sql`
    SELECT se.equipment_id, s.slug, c.slug AS category_slug,
           s.title_uk, s.title_ru, s.title_en
    FROM service_equipment se
    JOIN services s ON s.id = se.service_id
    JOIN service_categories c ON c.id = s.category_id
    WHERE se.equipment_id = ANY(${rows.map((r) => r.id as string)}::uuid[])
    ORDER BY se.sort_order
  `;

  const servicesByEquipment = new Map<string, CertificateServiceLink[]>();
  for (const r of linkRows) {
    const list = servicesByEquipment.get(r.equipment_id as string) ?? [];
    list.push({
      slug: r.slug as string,
      categorySlug: r.category_slug as string,
      title:
        ((r as Record<string, unknown>)[`title_${l}`] as string) ||
        (r.title_uk as string) ||
        (r.slug as string),
    });
    servicesByEquipment.set(r.equipment_id as string, list);
  }

  const byKey = new Map<string, CertificateDocument>();
  const seenPage = new Map<string, Set<string>>();
  const seenDevice = new Map<string, Set<string>>();
  const seenService = new Map<string, Set<string>>();

  for (const row of rows) {
    const raw = (typeof row.certificates === "string"
      ? JSON.parse(row.certificates)
      : row.certificates) as RawEquipmentCertificate[];
    const resolved = resolveCertificates(raw, locale);

    resolved.forEach((cert, i) => {
      const key = raw[i]?.source || cert.doc;
      let doc = byKey.get(key);
      if (!doc) {
        doc = {
          key,
          doc: cert.doc,
          issuer: cert.issuer,
          number: cert.number,
          validUntil: cert.validUntil,
          pages: [],
          devices: [],
          services: [],
        };
        byKey.set(key, doc);
        seenPage.set(key, new Set());
        seenDevice.set(key, new Set());
        seenService.set(key, new Set());
      }

      if (!seenPage.get(key)!.has(cert.url)) {
        seenPage.get(key)!.add(cert.url);
        doc.pages.push({ url: cert.url, alt: cert.alt, page: cert.page });
      }

      const name = row.name as string;
      if (!seenDevice.get(key)!.has(name)) {
        seenDevice.get(key)!.add(name);
        doc.devices.push(name);
      }

      for (const svc of servicesByEquipment.get(row.id as string) ?? []) {
        const svcKey = `${svc.categorySlug}/${svc.slug}`;
        if (seenService.get(key)!.has(svcKey)) continue;
        seenService.get(key)!.add(svcKey);
        doc.services.push(svc);
      }
    });
  }

  for (const doc of byKey.values()) doc.pages.sort((a, b) => a.page - b.page);
  return [...byKey.values()];
}
