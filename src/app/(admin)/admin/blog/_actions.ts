"use server";
import { adminSavePost, adminDeletePost } from "@/lib/db/queries/blog";
import { requireSession } from "../_actions/auth";
import { processUploadOrKeep } from "../_actions/upload";
import { parseBlogPostForm } from "./_schema";
import { redirect } from "next/navigation";
import { revalidateBlog } from "@/lib/revalidate-blog";
import { translateHeadline, translateHtml } from "@/lib/translate";

export type BlogActionState = { error?: string } | null;

const ERRORS: Record<string, string> = {
  duplicate_slug: "Стаття з таким slug уже існує — оберіть інший",
  save_failed: "Не вдалося зберегти статтю. Спробуйте ще раз",
};

export async function savePost(
  _prevState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requireSession();

  const coverFile = formData.get("coverImage") as File | null;
  const coverCurrent = (formData.get("coverImage_current") as string) || undefined;
  const coverImage = await processUploadOrKeep(
    coverFile && coverFile.size > 0 ? coverFile : null,
    "blog",
    coverCurrent,
  );

  const parsed = parseBlogPostForm(formData, coverImage || "");
  if (!parsed.ok) return { error: parsed.error };

  const result = await adminSavePost(parsed.data);
  if (!result.ok) {
    return { error: ERRORS[result.error ?? ""] ?? ERRORS.save_failed };
  }

  revalidateBlog();

  // redirect() throws a control-flow signal — it must sit outside any try/catch
  // above, or it would be swallowed and reported as a save failure.
  redirect(`/admin/blog/${result.id}?saved=1`);
}

export interface TranslateSource {
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDesc: string;
}

export type TranslateResult =
  /**
   * `bodyFailed` disambiguates the two reasons `data.body` can be empty: there
   * was nothing to translate, or the translation was rejected for mangling the
   * markup. Only the second deserves a warning, and the form cannot tell them
   * apart on its own.
   */
  | { ok: true; data: TranslateSource; bodyFailed: boolean }
  | { ok: false; error: string };

/**
 * Translate the Ukrainian version of a post into RU or EN and hand the result
 * back to the form. Nothing is written to the database — the editor reviews and
 * saves explicitly. Individual fields come back as "" when their translation
 * failed; the form keeps whatever it already had for those.
 */
export async function translatePost(
  target: "ru" | "en",
  source: TranslateSource,
): Promise<TranslateResult> {
  await requireSession();

  if (!source.title.trim() && !source.body.trim()) {
    return { ok: false, error: "Спочатку заповніть українську версію" };
  }

  try {
    const [title, excerpt, body, seoTitle, seoDesc] = await Promise.all([
      translateHeadline(source.title, target),
      translateHeadline(source.excerpt, target),
      translateHtml(source.body, target),
      translateHeadline(source.seoTitle, target),
      translateHeadline(source.seoDesc, target),
    ]);
    if (!title && !excerpt && !body && !seoTitle && !seoDesc) {
      return { ok: false, error: "Не вдалося перекласти. Спробуйте ще раз" };
    }
    return {
      ok: true,
      data: { title, excerpt, body, seoTitle, seoDesc },
      bodyFailed: Boolean(source.body.trim()) && !body,
    };
  } catch (e) {
    console.error("translatePost failed:", e);
    return { ok: false, error: "Не вдалося перекласти. Спробуйте ще раз" };
  }
}

export async function deletePost(id: string) {
  await requireSession();
  await adminDeletePost(id);
  revalidateBlog();
  redirect("/admin/blog");
}
