"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export interface ReviewRow {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSlug: string;
  reviewerName: string;
  procedureTag: string | null;
  procedureTagRu: string | null;
  procedureTagEn: string | null;
  rating: number;
  reviewText: string;
  reviewTextRu: string | null;
  reviewTextEn: string | null;
  reviewedAt: string;
  submittedAt: string;
  isPublished: boolean;
  reviewLocale: string;
  sortOrder: number;
}

export interface DoctorOption {
  id: string;
  name: string;
  slug: string;
}

export async function listAllReviews(): Promise<ReviewRow[]> {
  const rows = await sql`
    SELECT
      dr.id, dr.doctor_id, d.name_uk AS doctor_name, d.slug AS doctor_slug,
      dr.reviewer_name,
      dr.procedure_tag, dr.procedure_tag_ru, dr.procedure_tag_en,
      dr.rating,
      dr.review_text, dr.review_text_ru, dr.review_text_en,
      dr.reviewed_at::text AS reviewed_at,
      COALESCE(dr.submitted_at, NOW())::text AS submitted_at,
      dr.is_published,
      COALESCE(dr.review_locale, 'uk') AS review_locale,
      dr.sort_order
    FROM doctor_reviews dr
    JOIN doctors d ON d.id = dr.doctor_id
    ORDER BY dr.is_published ASC, dr.submitted_at DESC NULLS LAST, dr.reviewed_at DESC
  `;
  return rows.map((r) => ({
    id: r.id as string,
    doctorId: r.doctor_id as string,
    doctorName: r.doctor_name as string,
    doctorSlug: r.doctor_slug as string,
    reviewerName: r.reviewer_name as string,
    procedureTag: r.procedure_tag as string | null,
    procedureTagRu: r.procedure_tag_ru as string | null,
    procedureTagEn: r.procedure_tag_en as string | null,
    rating: r.rating as number,
    reviewText: r.review_text as string,
    reviewTextRu: r.review_text_ru as string | null,
    reviewTextEn: r.review_text_en as string | null,
    reviewedAt: r.reviewed_at as string,
    submittedAt: r.submitted_at as string,
    isPublished: r.is_published as boolean,
    reviewLocale: r.review_locale as string,
    sortOrder: r.sort_order as number,
  }));
}

export async function listDoctorsForSelect(): Promise<DoctorOption[]> {
  const rows = await sql`SELECT id, name_uk AS name, slug FROM doctors ORDER BY sort_order, name_uk`;
  return rows.map((r) => ({ id: r.id as string, name: r.name as string, slug: r.slug as string }));
}

export async function setReviewPublished(id: string, published: boolean) {
  await sql`UPDATE doctor_reviews SET is_published = ${published} WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  await sql`DELETE FROM doctor_reviews WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/admin/reviews");
}

export async function saveReviewEdit(data: {
  id: string;
  reviewerName: string;
  rating: number;
  reviewedAt: string;
  procedureTag: string;
  procedureTagRu: string;
  procedureTagEn: string;
  reviewText: string;
  reviewTextRu: string;
  reviewTextEn: string;
  isPublished: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await sql`
      UPDATE doctor_reviews SET
        reviewer_name     = ${data.reviewerName.trim()},
        rating            = ${Math.max(1, Math.min(5, data.rating))},
        reviewed_at       = ${data.reviewedAt}::date,
        procedure_tag     = ${data.procedureTag.trim() || null},
        procedure_tag_ru  = ${data.procedureTagRu.trim() || null},
        procedure_tag_en  = ${data.procedureTagEn.trim() || null},
        review_text       = ${data.reviewText.trim()},
        review_text_ru    = ${data.reviewTextRu.trim() || null},
        review_text_en    = ${data.reviewTextEn.trim() || null},
        is_published      = ${data.isPublished}
      WHERE id = ${data.id}
    `;
    revalidatePath("/");
    revalidatePath("/doctors");
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function createReview(data: {
  doctorId: string;
  reviewerName: string;
  rating: number;
  reviewedAt: string;
  procedureTag: string;
  procedureTagRu: string;
  procedureTagEn: string;
  reviewText: string;
  reviewTextRu: string;
  reviewTextEn: string;
  isPublished: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await sql`
      INSERT INTO doctor_reviews (
        doctor_id, reviewer_name, rating, reviewed_at,
        procedure_tag, procedure_tag_ru, procedure_tag_en,
        review_text, review_text_ru, review_text_en,
        is_published, review_locale, sort_order
      ) VALUES (
        ${data.doctorId},
        ${data.reviewerName.trim()},
        ${Math.max(1, Math.min(5, data.rating))},
        ${data.reviewedAt}::date,
        ${data.procedureTag.trim() || null},
        ${data.procedureTagRu.trim() || null},
        ${data.procedureTagEn.trim() || null},
        ${data.reviewText.trim()},
        ${data.reviewTextRu.trim() || null},
        ${data.reviewTextEn.trim() || null},
        ${data.isPublished},
        'uk', 0
      )
    `;
    revalidatePath("/");
    revalidatePath("/doctors");
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function countPendingReviews(): Promise<number> {
  const rows = await sql`SELECT count(*) AS n FROM doctor_reviews WHERE is_published = false`;
  return Number(rows[0]?.n ?? 0);
}
