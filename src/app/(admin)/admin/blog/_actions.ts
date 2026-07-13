"use server";
import { adminSavePost, adminDeletePost } from "@/lib/db/queries/blog";
import { processUploadOrKeep } from "../_actions/upload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function savePost(formData: FormData) {
  const id = formData.get('id') as string | null;

  const coverFile = formData.get('coverImage') as File | null;
  const coverCurrent = (formData.get('coverImage_current') as string) || undefined;
  const coverImage = await processUploadOrKeep(
    coverFile && coverFile.size > 0 ? coverFile : null,
    'blog',
    coverCurrent,
  );

  const data = {
    id: id || undefined,
    slug: (formData.get('slug') as string).trim(),
    categoryId: (formData.get('categoryId') as string) || null,
    authorId: (formData.get('authorId') as string) || null,
    titleUk: formData.get('titleUk') as string,
    titleRu: formData.get('titleRu') as string,
    titleEn: formData.get('titleEn') as string,
    excerptUk: formData.get('excerptUk') as string,
    excerptRu: formData.get('excerptRu') as string,
    excerptEn: formData.get('excerptEn') as string,
    bodyUk: formData.get('bodyUk') as string,
    bodyRu: formData.get('bodyRu') as string,
    bodyEn: formData.get('bodyEn') as string,
    coverImage: coverImage || '',
    tags: ((formData.get('tags') as string) || '').split(',').map(t => t.trim()).filter(Boolean),
    relatedServiceSlugs: ((formData.get('relatedServiceSlugs') as string) || '').split(',').map(t => t.trim()).filter(Boolean),
    isDraft: formData.get('isDraft') === 'true',
    publishedAt: (formData.get('publishedAt') as string) || null,
    seoTitleUk: formData.get('seoTitleUk') as string,
    seoTitleRu: formData.get('seoTitleRu') as string,
    seoTitleEn: formData.get('seoTitleEn') as string,
    seoDescUk: formData.get('seoDescUk') as string,
    seoDescRu: formData.get('seoDescRu') as string,
    seoDescEn: formData.get('seoDescEn') as string,
    readTimeMinutes: parseInt(formData.get('readTimeMinutes') as string) || 5,
    authorName: (formData.get('authorName') as string) || '',
    authorAvatar: (formData.get('authorAvatar') as string) || '',
    reviewerDoctorId: (formData.get('reviewer_doctor_id') as string) || null,
    lastReviewedAt: (formData.get('last_reviewed_at') as string) || null,
  };
  const result = await adminSavePost(data);
  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath('/ru/blog');
  revalidatePath(`/ru/blog/${data.slug}`);
  revalidatePath('/en/blog');
  revalidatePath(`/en/blog/${data.slug}`);
  revalidatePath('/admin/blog');
  if (result.ok) redirect(`/admin/blog/${result.id}?saved=1`);
}

export async function deletePost(id: string) {
  await adminDeletePost(id);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}
