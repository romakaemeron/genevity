"use server";
import { adminSavePost, adminDeletePost } from "@/lib/db/queries/blog";
import { requireSession } from "../_actions/auth";
import { processUploadOrKeep } from "../_actions/upload";
import { parseBlogPostForm } from "./_schema";
import { redirect } from "next/navigation";
import { revalidateBlog } from "@/lib/revalidate-blog";

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

export async function deletePost(id: string) {
  await requireSession();
  await adminDeletePost(id);
  revalidateBlog();
  redirect("/admin/blog");
}
