import { sql } from "../client";
import type { ServiceReviewer } from "../types";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

export interface BlogCategory {
  _id: string;
  slug: string;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
}

export interface BlogPostCard {
  _id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  categorySlug: string | null;
  categoryTitle: string | null;
  authorName: string | null;
  authorSlug: string | null;
  authorAvatar: string | null;
  authorFocalPoint: string | null;
  authorScale: number | null;
  publishedAt: string;
  readTimeMinutes: number;
  tags: string[];
}

export interface BlogPost extends BlogPostCard {
  body: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  ogImage: string | null;
  relatedServiceSlugs: string[];
  reviewer: ServiceReviewer | null;
  /** ISO date (YYYY-MM-DD) the medical content was last reviewed, or null. */
  lastReviewedAt: string | null;
}

export async function getBlogCategories(locale: string): Promise<BlogCategory[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM blog_categories ORDER BY sort_order`;
  return rows.map(r => ({
    _id: r.id as string,
    slug: r.slug as string,
    title: pick(r, 'title', l) || '',
    description: pick(r, 'description', l),
    seoTitle: pick(r, 'seo_title', l),
    seoDesc: pick(r, 'seo_desc', l),
  }));
}

export async function getBlogPosts(locale: string, categorySlug?: string, limit = 50): Promise<BlogPostCard[]> {
  const l = lang(locale);
  const rows = categorySlug
    ? await sql`
        SELECT bp.*, bc.slug as cat_slug, bc.title_uk as cat_title_uk, bc.title_ru as cat_title_ru, bc.title_en as cat_title_en,
               d.name_uk as doctor_name_uk, d.name_ru as doctor_name_ru, d.name_en as doctor_name_en, d.slug as author_slug,
               COALESCE(d.photo_circle, d.photo_card) as doctor_avatar,
               d.circle_focal_point as doctor_focal_point, d.circle_scale as doctor_scale
        FROM blog_posts bp
        LEFT JOIN blog_categories bc ON bc.id = bp.category_id
        LEFT JOIN doctors d ON d.id = bp.author_id
        WHERE bp.is_draft = false AND bp.published_at <= NOW() AND bc.slug = ${categorySlug}
        ORDER BY bp.published_at DESC LIMIT ${limit}`
    : await sql`
        SELECT bp.*, bc.slug as cat_slug, bc.title_uk as cat_title_uk, bc.title_ru as cat_title_ru, bc.title_en as cat_title_en,
               d.name_uk as doctor_name_uk, d.name_ru as doctor_name_ru, d.name_en as doctor_name_en, d.slug as author_slug,
               COALESCE(d.photo_circle, d.photo_card) as doctor_avatar,
               d.circle_focal_point as doctor_focal_point, d.circle_scale as doctor_scale
        FROM blog_posts bp
        LEFT JOIN blog_categories bc ON bc.id = bp.category_id
        LEFT JOIN doctors d ON d.id = bp.author_id
        WHERE bp.is_draft = false AND bp.published_at <= NOW()
        ORDER BY bp.published_at DESC LIMIT ${limit}`;
  return rows.map(r => mapCard(r, l));
}

export async function getBlogPostBySlug(locale: string, slug: string): Promise<BlogPost | null> {
  const l = lang(locale);
  const rows = await sql`
    SELECT bp.*, bc.slug as cat_slug, bc.title_uk as cat_title_uk, bc.title_ru as cat_title_ru, bc.title_en as cat_title_en,
           d.name_uk as doctor_name_uk, d.name_ru as doctor_name_ru, d.name_en as doctor_name_en, d.slug as author_slug,
           COALESCE(d.photo_circle, d.photo_card) as doctor_avatar,
           d.circle_focal_point as doctor_focal_point, d.circle_scale as doctor_scale
    FROM blog_posts bp
    LEFT JOIN blog_categories bc ON bc.id = bp.category_id
    LEFT JOIN doctors d ON d.id = bp.author_id
    WHERE bp.slug = ${slug} AND bp.is_draft = false AND bp.published_at <= NOW()
    LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0];
  const reviewer = await getReviewer(r.reviewer_doctor_id as string | null, l);
  return {
    ...mapCard(r, l),
    body: pick(r, 'body', l),
    seoTitle: pick(r, 'seo_title', l),
    seoDesc: pick(r, 'seo_desc', l),
    ogImage: r.seo_og_image as string | null,
    relatedServiceSlugs: (r.related_service_slugs as string[]) || [],
    reviewer,
    lastReviewedAt: r.last_reviewed_at ? new Date(r.last_reviewed_at as string).toISOString().slice(0, 10) : null,
  };
}

/** Mirrors `getReviewer` in `services.ts` (not exported there) — resolves a
 *  published doctor's public reviewer-badge fields for the requested locale. */
async function getReviewer(doctorId: string | null, l: string): Promise<ServiceReviewer | null> {
  if (!doctorId) return null;
  const rows = await sql`
    SELECT slug, role_uk, role_ru, role_en, name_uk, name_ru, name_en, photo_circle
    FROM doctors WHERE id = ${doctorId} AND is_published = true LIMIT 1
  `;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    name: pick(r, "name", l) || "",
    slug: r.slug || null,
    role: pick(r, "role", l) || "",
    photoCircle: r.photo_circle || null,
  };
}

export async function getRelatedBlogPosts(locale: string, postId: string, categorySlug: string | null, limit = 3): Promise<BlogPostCard[]> {
  const l = lang(locale);
  const rows = categorySlug
    ? await sql`
        SELECT bp.*, bc.slug as cat_slug, bc.title_uk as cat_title_uk, bc.title_ru as cat_title_ru, bc.title_en as cat_title_en,
               d.name_uk as doctor_name_uk, d.name_ru as doctor_name_ru, d.name_en as doctor_name_en, d.slug as author_slug,
               COALESCE(d.photo_circle, d.photo_card) as doctor_avatar,
               d.circle_focal_point as doctor_focal_point, d.circle_scale as doctor_scale
        FROM blog_posts bp
        LEFT JOIN blog_categories bc ON bc.id = bp.category_id
        LEFT JOIN doctors d ON d.id = bp.author_id
        WHERE bp.is_draft = false AND bp.published_at <= NOW() AND bp.id != ${postId} AND bc.slug = ${categorySlug}
        ORDER BY bp.published_at DESC LIMIT ${limit}`
    : await sql`
        SELECT bp.*, bc.slug as cat_slug, bc.title_uk as cat_title_uk, bc.title_ru as cat_title_ru, bc.title_en as cat_title_en,
               d.name_uk as doctor_name_uk, d.name_ru as doctor_name_ru, d.name_en as doctor_name_en, d.slug as author_slug,
               COALESCE(d.photo_circle, d.photo_card) as doctor_avatar,
               d.circle_focal_point as doctor_focal_point, d.circle_scale as doctor_scale
        FROM blog_posts bp
        LEFT JOIN blog_categories bc ON bc.id = bp.category_id
        LEFT JOIN doctors d ON d.id = bp.author_id
        WHERE bp.is_draft = false AND bp.published_at <= NOW() AND bp.id != ${postId}
        ORDER BY bp.published_at DESC LIMIT ${limit}`;
  return rows.map(r => mapCard(r, l));
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM blog_posts WHERE is_draft = false AND published_at <= NOW()`;
  return rows.map(r => r.slug as string);
}

// Admin queries
export async function adminGetAllPosts() {
  return sql`
    SELECT bp.id, bp.slug, bp.title_uk, bp.is_draft, bp.published_at, bp.cover_image,
           bc.title_uk as cat_title, d.name_uk as author_name
    FROM blog_posts bp
    LEFT JOIN blog_categories bc ON bc.id = bp.category_id
    LEFT JOIN doctors d ON d.id = bp.author_id
    ORDER BY bp.updated_at DESC`;
}

export async function adminGetPostById(id: string) {
  const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function adminSavePost(data: {
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
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    if (data.id) {
      await sql`UPDATE blog_posts SET
        slug=${data.slug}, category_id=${data.categoryId}, author_id=${data.authorId},
        title_uk=${data.titleUk}, title_ru=${data.titleRu}, title_en=${data.titleEn},
        excerpt_uk=${data.excerptUk}, excerpt_ru=${data.excerptRu}, excerpt_en=${data.excerptEn},
        body_uk=${data.bodyUk}, body_ru=${data.bodyRu}, body_en=${data.bodyEn},
        cover_image=${data.coverImage}, tags=${data.tags}, related_service_slugs=${data.relatedServiceSlugs},
        is_draft=${data.isDraft}, published_at=${data.publishedAt ? sql`${data.publishedAt}::timestamptz` : sql`NULL`},
        seo_title_uk=${data.seoTitleUk}, seo_title_ru=${data.seoTitleRu}, seo_title_en=${data.seoTitleEn},
        seo_desc_uk=${data.seoDescUk}, seo_desc_ru=${data.seoDescRu}, seo_desc_en=${data.seoDescEn},
        read_time_minutes=${data.readTimeMinutes}, author_name=${data.authorName || null},
        author_avatar=${data.authorAvatar || null},
        reviewer_doctor_id=${data.reviewerDoctorId}, last_reviewed_at=${data.lastReviewedAt ? sql`${data.lastReviewedAt}::date` : sql`NULL`},
        updated_at=NOW()
        WHERE id=${data.id}`;
      return { ok: true, id: data.id };
    } else {
      const rows = await sql`INSERT INTO blog_posts (
        slug, category_id, author_id,
        title_uk, title_ru, title_en,
        excerpt_uk, excerpt_ru, excerpt_en,
        body_uk, body_ru, body_en,
        cover_image, tags, related_service_slugs, is_draft, published_at,
        seo_title_uk, seo_title_ru, seo_title_en,
        seo_desc_uk, seo_desc_ru, seo_desc_en,
        read_time_minutes, author_name, author_avatar,
        reviewer_doctor_id, last_reviewed_at
      ) VALUES (
        ${data.slug}, ${data.categoryId}, ${data.authorId},
        ${data.titleUk}, ${data.titleRu}, ${data.titleEn},
        ${data.excerptUk}, ${data.excerptRu}, ${data.excerptEn},
        ${data.bodyUk}, ${data.bodyRu}, ${data.bodyEn},
        ${data.coverImage}, ${data.tags}, ${data.relatedServiceSlugs}, ${data.isDraft},
        ${data.publishedAt ? sql`${data.publishedAt}::timestamptz` : sql`NULL`},
        ${data.seoTitleUk}, ${data.seoTitleRu}, ${data.seoTitleEn},
        ${data.seoDescUk}, ${data.seoDescRu}, ${data.seoDescEn},
        ${data.readTimeMinutes}, ${data.authorName || null}, ${data.authorAvatar || null},
        ${data.reviewerDoctorId}, ${data.lastReviewedAt ? sql`${data.lastReviewedAt}::date` : sql`NULL`}
      ) RETURNING id`;
      return { ok: true, id: rows[0].id as string };
    }
  } catch (e) { return { ok: false, error: String(e) }; }
}

export async function adminDeletePost(id: string) {
  await sql`DELETE FROM blog_posts WHERE id = ${id}`;
}

function mapCard(r: any, l: string): BlogPostCard {
  const doctorName = r[`doctor_name_${l}`] || r.doctor_name_uk || null;
  const rawScale = r.doctor_scale;
  const scale = rawScale !== null && rawScale !== undefined ? parseFloat(String(rawScale)) : null;
  return {
    _id: r.id as string,
    slug: r.slug as string,
    title: pick(r, 'title', l) || '',
    excerpt: pick(r, 'excerpt', l),
    coverImage: r.cover_image as string | null,
    categorySlug: r.cat_slug as string | null,
    categoryTitle: r[`cat_title_${l}`] || r.cat_title_uk || null,
    authorName: (r.author_name as string | null) || doctorName,
    authorSlug: r.author_slug as string | null,
    authorAvatar: (r.author_avatar as string | null) || (r.doctor_avatar as string | null),
    authorFocalPoint: (r.doctor_focal_point as string | null) || null,
    authorScale: Number.isFinite(scale) && scale! > 0 ? scale : null,
    publishedAt: r.published_at ? new Date(r.published_at).toISOString().split('T')[0] : '',
    readTimeMinutes: (r.read_time_minutes as number) || 5,
    tags: (r.tags as string[]) || [],
  };
}
