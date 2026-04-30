"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

/**
 * Public-facing server action — submits a patient review.
 * Saved as is_published=false until an admin approves it in /admin/reviews.
 * Lives here (outside the (admin) route group) so it can be safely imported
 * by public client components without inheriting the admin layout's cookie
 * requirements, which would cause DYNAMIC_SERVER_USAGE on statically
 * generated pages.
 */
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
