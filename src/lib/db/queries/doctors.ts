import { sql } from "../client";
import type { ServiceFinalCta, DoctorReview } from "../types";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}
function pickLocalized(v: unknown, l: string): string | undefined {
  if (!v || typeof v !== "object") return undefined;
  const obj = v as Record<string, unknown>;
  const raw = obj[l] ?? obj.uk;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
function resolveFinalCta(raw: unknown, l: string): ServiceFinalCta {
  if (!raw || typeof raw !== "object") {
    return { bgType: null, bgColor: null, bgImage: null, bgFocalPoint: null, heading: null, subtitle: null, buttonText: null };
  }
  const src = raw as Record<string, unknown>;
  const bgType = src.bgType === "color" || src.bgType === "image" ? src.bgType : null;
  return {
    bgType,
    bgColor: typeof src.bgColor === "string" && src.bgColor.trim() ? src.bgColor.trim() : null,
    bgImage: typeof src.bgImage === "string" && src.bgImage.trim() ? src.bgImage.trim() : null,
    bgFocalPoint: typeof src.bgFocalPoint === "string" && src.bgFocalPoint.trim() ? src.bgFocalPoint.trim() : null,
    heading: pickLocalized(src.heading, l) ?? null,
    subtitle: pickLocalized(src.subtitle, l) ?? null,
    buttonText: pickLocalized(src.buttonText, l) ?? null,
  };
}

export interface EducationEntry {
  institution_uk: string; institution_ru: string; institution_en: string;
  degree_uk: string; degree_ru: string; degree_en: string;
  year: number;
}
export interface CertEntry {
  title_uk: string; title_ru: string; title_en: string;
  issuer_uk?: string; issuer_ru?: string; issuer_en?: string;
  year?: number;
}

export interface DoctorProfileData {
  _id: string;
  slug: string;
  name: string;
  role: string;
  experience: string;
  specialties: string[];
  bio: string;
  photoCard: string | null;
  photoFull: string | null;
  photoCircle: string | null;
  profileFocalPoint: string;
  profileScale: number;
  education: (EducationEntry & { institution: string; degree: string })[];
  certifications: (CertEntry & { title: string; issuer?: string })[];
  services: { slug: string; categorySlug: string; title: string }[];
  reviews: DoctorReview[];
  seoTitle: string | null;
  seoDescription: string | null;
  finalCta: ServiceFinalCta;
}

export async function getDoctorBySlug(locale: string, slug: string): Promise<DoctorProfileData | null> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM doctors WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0];

  const [serviceRows, reviewRows] = await Promise.all([
    sql`
    SELECT s.slug, s.title_uk, s.title_ru, s.title_en, c.slug AS category_slug
    FROM service_doctors sd
    JOIN services s ON s.id = sd.service_id
    JOIN service_categories c ON c.id = s.category_id
    WHERE sd.doctor_id = ${r.id}
    ORDER BY sd.sort_order
  `,
    sql`
    SELECT id, reviewer_name,
      procedure_tag, procedure_tag_ru, procedure_tag_en,
      rating,
      review_text, review_text_ru, review_text_en,
      reviewed_at::text AS reviewed_at
    FROM doctor_reviews
    WHERE doctor_id = ${r.id} AND is_published = true
    ORDER BY sort_order, reviewed_at DESC
  `,
  ]);

  const edu: EducationEntry[] = (r.education as EducationEntry[] | null) || [];
  const certs: CertEntry[] = (r.certifications as CertEntry[] | null) || [];

  return {
    _id: r.id,
    slug: r.slug,
    name: pick(r, "name", l) || "",
    role: pick(r, "role", l) || "",
    experience: pick(r, "experience", l) || "",
    specialties: (r[`specialties_${l}`] || r.specialties_uk || []) as string[],
    bio: pick(r, "bio", l) || "",
    photoCard: r.photo_card || null,
    photoFull: r.photo_full || null,
    photoCircle: r.photo_circle || null,
    profileFocalPoint: (r.profile_focal_point as string) || "center top",
    profileScale: (() => { const s = parseFloat(String(r.profile_scale ?? "1")); return Number.isFinite(s) && s > 0 ? s : 1; })(),
    education: edu.map((e) => ({
      ...e,
      institution: e[`institution_${l}` as keyof EducationEntry] as string || e.institution_uk,
      degree: e[`degree_${l}` as keyof EducationEntry] as string || e.degree_uk,
    })),
    certifications: certs.map((c) => ({
      ...c,
      title: c[`title_${l}` as keyof CertEntry] as string || c.title_uk,
      issuer: c[`issuer_${l}` as keyof CertEntry] as string | undefined || c.issuer_uk,
    })),
    reviews: reviewRows.map((rv) => {
      const pick = (uk: unknown, ru: unknown, en: unknown) => {
        if (l === "ru") return (ru as string) || (uk as string) || "";
        if (l === "en") return (en as string) || (uk as string) || "";
        return (uk as string) || "";
      };
      return {
        _id: rv.id as string,
        reviewerName: rv.reviewer_name as string,
        procedureTag: pick(rv.procedure_tag, rv.procedure_tag_ru, rv.procedure_tag_en) || null,
        rating: rv.rating as number,
        reviewText: pick(rv.review_text, rv.review_text_ru, rv.review_text_en),
        reviewedAt: rv.reviewed_at as string,
      };
    }),
    services: serviceRows.map((s) => ({
      slug: s.slug,
      categorySlug: s.category_slug as string,
      title: (pick(s, "title", l) || "") as string,
    })),
    seoTitle: pick(r, "seo_title", l),
    seoDescription: pick(r, "seo_desc", l),
    finalCta: resolveFinalCta(r.final_cta, l),
  };
}

export async function getAllDoctorSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM doctors WHERE slug IS NOT NULL ORDER BY sort_order`;
  return rows.map((r) => r.slug as string);
}
