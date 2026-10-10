import { sql } from "../client";

/**
 * ТЗ #16 §1.2 — "Акції / Спеціальні пропозиції" on the homepage.
 *
 * Expired offers (`valid_until` in the past) are filtered out in SQL rather
 * than in the component, so an offer that lapses disappears on the next ISR
 * revalidation without anyone having to unpublish it by hand.
 */

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: Record<string, unknown>, field: string, l: string): string {
  const v = row[`${field}_${l}`] ?? row[`${field}_uk`];
  return typeof v === "string" ? v : "";
}

export interface PromotionView {
  id: string;
  badge: string;
  title: string;
  description: string;
  terms: string;
  imageUrl: string | null;
  imageFocalPoint: string;
  ctaHref: string;
  ctaLabel: string;
  /** ISO date (YYYY-MM-DD) or null when the offer has no end date. */
  validUntil: string | null;
}

export async function getPromotions(locale: string): Promise<PromotionView[]> {
  const l = lang(locale);
  const rows = await sql`
    SELECT * FROM promotions
    WHERE is_published = true
      AND title_uk <> ''
      AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    ORDER BY sort_order, created_at
  `;
  return rows.map((r) => ({
    id: r.id as string,
    badge: pick(r, "badge", l),
    title: pick(r, "title", l),
    description: pick(r, "description", l),
    terms: pick(r, "terms", l),
    imageUrl: (r.image_url as string) || null,
    imageFocalPoint: (r.image_focal_point as string) || "50% 50%",
    ctaHref: (r.cta_href as string) || "",
    ctaLabel: pick(r, "cta_label", l),
    validUntil: r.valid_until ? new Date(r.valid_until as string).toISOString().slice(0, 10) : null,
  }));
}

/* ── Admin ─────────────────────────────────────────────────────────────── */

export interface PromotionInput {
  id?: string;
  badge_uk: string; badge_ru: string; badge_en: string;
  title_uk: string; title_ru: string; title_en: string;
  description_uk: string; description_ru: string; description_en: string;
  terms_uk: string; terms_ru: string; terms_en: string;
  cta_label_uk: string; cta_label_ru: string; cta_label_en: string;
  image_url: string;
  image_focal_point: string;
  cta_href: string;
  valid_until: string;
  is_published: boolean;
}

const TEXT_FIELDS = [
  "badge_uk", "badge_ru", "badge_en",
  "title_uk", "title_ru", "title_en",
  "description_uk", "description_ru", "description_en",
  "terms_uk", "terms_ru", "terms_en",
  "cta_label_uk", "cta_label_ru", "cta_label_en",
] as const;

export async function adminGetPromotions(): Promise<PromotionInput[]> {
  const rows = await sql`SELECT * FROM promotions ORDER BY sort_order, created_at`;
  return rows.map((r) => {
    const out: Record<string, unknown> = {
      id: r.id as string,
      image_url: (r.image_url as string) || "",
      image_focal_point: (r.image_focal_point as string) || "50% 50%",
      cta_href: (r.cta_href as string) || "",
      valid_until: r.valid_until ? new Date(r.valid_until as string).toISOString().slice(0, 10) : "",
      is_published: r.is_published !== false,
    };
    for (const f of TEXT_FIELDS) out[f] = (r[f] as string) || "";
    return out as unknown as PromotionInput;
  });
}

/** Full replace, same contract as the before/after editor. */
export async function adminSavePromotions(items: PromotionInput[]): Promise<void> {
  const clean = items.filter((it) => (it.title_uk || "").trim());
  const keptIds = clean.map((it) => it.id).filter((id): id is string => Boolean(id));

  if (keptIds.length > 0) {
    await sql`DELETE FROM promotions WHERE id <> ALL(${keptIds}::uuid[])`;
  } else {
    await sql`DELETE FROM promotions`;
  }

  for (let i = 0; i < clean.length; i++) {
    const it = clean[i];
    const v = (f: (typeof TEXT_FIELDS)[number]) => (it[f] || "").trim();
    // Only site-internal links are accepted — an absolute URL in a promo card
    // would quietly send homepage traffic off-site.
    const href = (it.cta_href || "").trim();
    const safeHref = href.startsWith("/") && !href.startsWith("//") ? href : "";
    const validUntil = /^\d{4}-\d{2}-\d{2}$/.test((it.valid_until || "").trim())
      ? it.valid_until.trim()
      : null;

    if (it.id) {
      await sql`
        UPDATE promotions SET
          badge_uk = ${v("badge_uk")}, badge_ru = ${v("badge_ru")}, badge_en = ${v("badge_en")},
          title_uk = ${v("title_uk")}, title_ru = ${v("title_ru")}, title_en = ${v("title_en")},
          description_uk = ${v("description_uk")}, description_ru = ${v("description_ru")}, description_en = ${v("description_en")},
          terms_uk = ${v("terms_uk")}, terms_ru = ${v("terms_ru")}, terms_en = ${v("terms_en")},
          cta_label_uk = ${v("cta_label_uk")}, cta_label_ru = ${v("cta_label_ru")}, cta_label_en = ${v("cta_label_en")},
          image_url = ${(it.image_url || "").trim() || null},
          image_focal_point = ${(it.image_focal_point || "").trim() || "50% 50%"},
          cta_href = ${safeHref},
          valid_until = ${validUntil},
          is_published = ${it.is_published !== false},
          sort_order = ${i}, updated_at = now()
        WHERE id = ${it.id}
      `;
    } else {
      await sql`
        INSERT INTO promotions (
          badge_uk, badge_ru, badge_en,
          title_uk, title_ru, title_en,
          description_uk, description_ru, description_en,
          terms_uk, terms_ru, terms_en,
          cta_label_uk, cta_label_ru, cta_label_en,
          image_url, image_focal_point, cta_href, valid_until, is_published, sort_order
        ) VALUES (
          ${v("badge_uk")}, ${v("badge_ru")}, ${v("badge_en")},
          ${v("title_uk")}, ${v("title_ru")}, ${v("title_en")},
          ${v("description_uk")}, ${v("description_ru")}, ${v("description_en")},
          ${v("terms_uk")}, ${v("terms_ru")}, ${v("terms_en")},
          ${v("cta_label_uk")}, ${v("cta_label_ru")}, ${v("cta_label_en")},
          ${(it.image_url || "").trim() || null},
          ${(it.image_focal_point || "").trim() || "50% 50%"},
          ${safeHref}, ${validUntil}, ${it.is_published !== false}, ${i}
        )
      `;
    }
  }
}
