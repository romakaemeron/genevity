"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "../_actions/auth";
import {
  adminSaveMention,
  adminDeleteMention,
  type MediaMentionInput,
} from "@/lib/db/queries/media";
import { fetchMediaMeta } from "@/lib/media/fetch-meta";
import { translateHeadline } from "@/lib/translate";

export type FetchMetaResult = {
  publisherName: string;
  publisherDomain: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  imageUrl: string | null;
  publishedAt: string | null;
};

/** Admin "Отримати дані" button: scrape OG + translate the headline. */
export async function fetchMeta(url: string): Promise<FetchMetaResult> {
  await requireSession();
  const meta = await fetchMediaMeta(url);
  const [titleRu, titleEn] = meta.title_uk
    ? await Promise.all([
        translateHeadline(meta.title_uk, "ru"),
        translateHeadline(meta.title_uk, "en"),
      ])
    : ["", ""];
  return {
    publisherName: meta.publisher_name,
    publisherDomain: meta.publisher_domain,
    titleUk: meta.title_uk,
    titleRu,
    titleEn,
    imageUrl: meta.image_url,
    publishedAt: meta.published_at,
  };
}

function revalidateAll() {
  for (const p of ["/media", "/ru/media", "/en/media", "/admin/press"]) revalidatePath(p);
}

export async function saveMention(formData: FormData): Promise<void> {
  await requireSession();
  const id = (formData.get("id") as string) || undefined;
  const input: MediaMentionInput = {
    id,
    url: (formData.get("url") as string).trim(),
    publisherName: ((formData.get("publisherName") as string) || "").trim(),
    publisherDomain: ((formData.get("publisherDomain") as string) || "").trim(),
    titleUk: ((formData.get("titleUk") as string) || "").trim(),
    titleRu: ((formData.get("titleRu") as string) || "").trim(),
    titleEn: ((formData.get("titleEn") as string) || "").trim(),
    imageUrl: ((formData.get("imageUrl") as string) || "").trim() || null,
    logoUrl: ((formData.get("logoUrl") as string) || "").trim() || null,
    publishedAt: ((formData.get("publishedAt") as string) || "").trim() || null,
    sortOrder: Number(formData.get("sortOrder") || 0),
    isPublished: formData.get("isPublished") === "on",
  };
  await adminSaveMention(input);
  revalidateAll();
  redirect("/admin/press");
}

export async function deleteMention(formData: FormData): Promise<void> {
  await requireSession();
  await adminDeleteMention(formData.get("id") as string);
  revalidateAll();
  redirect("/admin/press");
}
