import { z } from "zod";

/** Lowercase words joined by single hyphens: "botox-vs-dysport". */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const csv = (v: FormDataEntryValue | null) =>
  String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

// z.looseObject = the v4 replacement for the deprecated .passthrough():
// unknown keys (the RU/EN fields, tags, SEO, …) pass through untouched, while
// the keys listed here are validated.
const schema = z.looseObject({
  id: z.uuid().optional(),
  slug: z.string().min(1, "Вкажіть slug").max(120, "Slug задовгий (максимум 120 символів)")
    .regex(SLUG_RE, "Slug може містити лише малі латинські літери, цифри та дефіси"),
  titleUk: z.string().min(1, "Заголовок UK обов'язковий"),
  readTimeMinutes: z.number().int().min(1).max(120),
  isDraft: z.boolean(),
  /** ISO string or null. Validated against isDraft in refine below. */
  publishedAt: z.string().nullable(),
}).refine(
  (d) => d.isDraft || !d.publishedAt || new Date(d.publishedAt).getTime() <= Date.now(),
  { message: "Заплановану публікацію не підтримано: вкажіть поточну або минулу дату, або збережіть як чернетку" },
);

export interface BlogPostInput {
  id?: string;
  slug: string;
  categoryId: string | null;
  authorId: string | null;
  titleUk: string; titleRu: string; titleEn: string;
  excerptUk: string; excerptRu: string; excerptEn: string;
  bodyUk: string; bodyRu: string; bodyEn: string;
  coverImage: string;
  tags: string[];
  relatedServiceSlugs: string[];
  isDraft: boolean;
  publishedAt: string | null;
  seoTitleUk: string; seoTitleRu: string; seoTitleEn: string;
  seoDescUk: string; seoDescRu: string; seoDescEn: string;
  readTimeMinutes: number;
  authorName: string;
  authorAvatar: string;
  reviewerDoctorId: string | null;
  lastReviewedAt: string | null;
}

/**
 * Parse and normalise the admin blog form.
 *
 * Normalisation rules:
 *   - slug is lowercased and trimmed before validation (a stray capital is a
 *     typo, not an error worth blocking on);
 *   - a published post with no date gets "now" — an empty published_at would
 *     make the post invisible, since the public query filters published_at <= NOW();
 *   - a draft keeps whatever date it has (drafts are never date-filtered).
 */
export function parseBlogPostForm(
  formData: FormData,
  coverImage: string,
): { ok: true; data: BlogPostInput } | { ok: false; error: string } {
  const id = str(formData.get("id"));
  const isDraft = formData.get("isDraft") === "true";
  const rawDate = str(formData.get("publishedAt"));

  let publishedAt: string | null = rawDate ? new Date(rawDate).toISOString() : null;
  if (rawDate && Number.isNaN(new Date(rawDate).getTime())) {
    return { ok: false, error: "Некоректна дата публікації" };
  }
  if (!isDraft && !publishedAt) publishedAt = new Date().toISOString();

  const candidate = {
    id: id || undefined,
    slug: str(formData.get("slug")).toLowerCase(),
    categoryId: str(formData.get("categoryId")) || null,
    authorId: str(formData.get("authorId")) || null,
    titleUk: str(formData.get("titleUk")),
    titleRu: str(formData.get("titleRu")),
    titleEn: str(formData.get("titleEn")),
    excerptUk: str(formData.get("excerptUk")),
    excerptRu: str(formData.get("excerptRu")),
    excerptEn: str(formData.get("excerptEn")),
    bodyUk: String(formData.get("bodyUk") ?? ""),
    bodyRu: String(formData.get("bodyRu") ?? ""),
    bodyEn: String(formData.get("bodyEn") ?? ""),
    coverImage,
    tags: csv(formData.get("tags")),
    relatedServiceSlugs: csv(formData.get("relatedServiceSlugs")),
    isDraft,
    publishedAt,
    seoTitleUk: str(formData.get("seoTitleUk")),
    seoTitleRu: str(formData.get("seoTitleRu")),
    seoTitleEn: str(formData.get("seoTitleEn")),
    seoDescUk: str(formData.get("seoDescUk")),
    seoDescRu: str(formData.get("seoDescRu")),
    seoDescEn: str(formData.get("seoDescEn")),
    readTimeMinutes: Number.parseInt(str(formData.get("readTimeMinutes")), 10) || 5,
    authorName: str(formData.get("authorName")),
    authorAvatar: str(formData.get("authorAvatar")),
    reviewerDoctorId: str(formData.get("reviewer_doctor_id")) || null,
    lastReviewedAt: str(formData.get("last_reviewed_at")) || null,
  };

  const parsed = schema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некоректні дані форми" };
  }
  return { ok: true, data: candidate };
}
