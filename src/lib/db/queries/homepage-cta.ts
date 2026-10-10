import { sql } from "../client";

/**
 * ТЗ #16 §1.3 — the final call-to-action banner above the footer on the
 * homepage. A singleton row (id = 1), created by migration 026.
 *
 * `isEnabled` plus a non-empty heading is the render gate: the block stays
 * invisible until an editor has actually written the offer copy, so the page
 * never ships a half-filled banner.
 */

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }

export interface HomepageCtaData {
  isEnabled: boolean;
  eyebrow: string;
  heading: string;
  subtitle: string;
  benefits: string[];
  note: string;
  bgImage: string | null;
  bgFocalPoint: string;
}

const EMPTY: HomepageCtaData = {
  isEnabled: false, eyebrow: "", heading: "", subtitle: "",
  benefits: [], note: "", bgImage: null, bgFocalPoint: "50% 50%",
};

export async function getHomepageCta(locale: string): Promise<HomepageCtaData> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM homepage_cta WHERE id = 1`;
  const r = rows[0];
  if (!r) return EMPTY;

  const text = (field: string): string => {
    const v = r[`${field}_${l}`] ?? r[`${field}_uk`];
    return typeof v === "string" ? v.trim() : "";
  };
  const list = (field: string): string[] => {
    const v = r[`${field}_${l}`];
    const fallback = r[`${field}_uk`];
    const arr = Array.isArray(v) && v.length ? v : Array.isArray(fallback) ? fallback : [];
    return (arr as unknown[]).map(String).map((s) => s.trim()).filter(Boolean);
  };

  const heading = text("heading");
  return {
    isEnabled: r.is_enabled !== false && heading.length > 0,
    eyebrow: text("eyebrow"),
    heading,
    subtitle: text("subtitle"),
    benefits: list("benefits"),
    note: text("note"),
    bgImage: (r.bg_image as string) || null,
    bgFocalPoint: (r.bg_focal_point as string) || "50% 50%",
  };
}

/* ── Admin ─────────────────────────────────────────────────────────────── */

export interface HomepageCtaRow {
  is_enabled: boolean;
  eyebrow_uk: string; eyebrow_ru: string; eyebrow_en: string;
  heading_uk: string; heading_ru: string; heading_en: string;
  subtitle_uk: string; subtitle_ru: string; subtitle_en: string;
  benefits_uk: string[]; benefits_ru: string[]; benefits_en: string[];
  note_uk: string; note_ru: string; note_en: string;
  bg_image: string;
  bg_focal_point: string;
}

export async function adminGetHomepageCta(): Promise<HomepageCtaRow> {
  const rows = await sql`SELECT * FROM homepage_cta WHERE id = 1`;
  const r = rows[0] ?? {};
  const str = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
  const arr = (k: string) => (Array.isArray(r[k]) ? (r[k] as unknown[]).map(String) : []);
  return {
    is_enabled: r.is_enabled !== false,
    eyebrow_uk: str("eyebrow_uk"), eyebrow_ru: str("eyebrow_ru"), eyebrow_en: str("eyebrow_en"),
    heading_uk: str("heading_uk"), heading_ru: str("heading_ru"), heading_en: str("heading_en"),
    subtitle_uk: str("subtitle_uk"), subtitle_ru: str("subtitle_ru"), subtitle_en: str("subtitle_en"),
    benefits_uk: arr("benefits_uk"), benefits_ru: arr("benefits_ru"), benefits_en: arr("benefits_en"),
    note_uk: str("note_uk"), note_ru: str("note_ru"), note_en: str("note_en"),
    bg_image: str("bg_image"),
    bg_focal_point: str("bg_focal_point") || "50% 50%",
  };
}
