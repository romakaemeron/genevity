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
  rating: number;
  reviewText: string;
  reviewedAt: string;
  submittedAt: string;
  isPublished: boolean;
  reviewLocale: string;
}

export async function submitPublicReview(data: {
  doctorId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  procedureTag: string | null;
  locale: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { doctorId, reviewerName, rating, reviewText, procedureTag, locale } = data;
  if (!reviewerName.trim() || reviewText.trim().length < 10 || rating < 1 || rating > 5) {
    return { ok: false, error: "Заповніть всі обов'язкові поля" };
  }
  try {
    const text = reviewText.trim();
    const name = reviewerName.trim();
    await sql`
      INSERT INTO doctor_reviews
        (doctor_id, reviewer_name,
         procedure_tag, procedure_tag_ru, procedure_tag_en,
         rating,
         review_text, review_text_ru, review_text_en,
         review_locale, is_published)
      VALUES
        (${doctorId}, ${name},
         ${procedureTag ?? null},
         ${locale === "ru" ? procedureTag : null},
         ${locale === "en" ? procedureTag : null},
         ${rating},
         ${text},
         ${locale === "ru" ? text : null},
         ${locale === "en" ? text : null},
         ${locale}, false)
    `;
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch {
    return { ok: false, error: "Помилка збереження. Спробуйте ще раз." };
  }
}

export async function listAllReviews(): Promise<ReviewRow[]> {
  const rows = await sql`
    SELECT
      dr.id, dr.doctor_id, d.name_uk AS doctor_name, d.slug AS doctor_slug,
      dr.reviewer_name, dr.procedure_tag, dr.rating, dr.review_text,
      dr.reviewed_at::text AS reviewed_at,
      COALESCE(dr.submitted_at, NOW())::text AS submitted_at,
      dr.is_published,
      COALESCE(dr.review_locale, 'uk') AS review_locale
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
    rating: r.rating as number,
    reviewText: r.review_text as string,
    reviewedAt: r.reviewed_at as string,
    submittedAt: r.submitted_at as string,
    isPublished: r.is_published as boolean,
    reviewLocale: r.review_locale as string,
  }));
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

export async function saveReviewEdit(_prev: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const reviewerName = (formData.get("reviewer_name") as string)?.trim();
  const procedureTag = (formData.get("procedure_tag") as string)?.trim() || null;
  const rating = Math.max(1, Math.min(5, parseInt(formData.get("rating") as string) || 5));
  const reviewText = (formData.get("review_text") as string)?.trim();
  const reviewedAt = (formData.get("reviewed_at") as string)?.trim();

  await sql`
    UPDATE doctor_reviews SET
      reviewer_name = ${reviewerName},
      procedure_tag = ${procedureTag},
      rating = ${rating},
      review_text = ${reviewText},
      reviewed_at = ${reviewedAt}::date
    WHERE id = ${id}
  `;
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function countPendingReviews(): Promise<number> {
  const rows = await sql`SELECT count(*) AS n FROM doctor_reviews WHERE is_published = false`;
  return Number(rows[0]?.n ?? 0);
}
