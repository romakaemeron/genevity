"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { processAndUploadImage } from "./upload";

export interface MediaAssetDTO {
  id: string;
  url: string;
  filename: string;
  folder: string;
  source: "blob" | "public";
  title: string;
  createdAt: string;
}

/**
 * List every asset in the media library, newest first. Used by the in-editor
 * picker modal (client-callable server action).
 */
export async function listMediaAssets(): Promise<MediaAssetDTO[]> {
  const rows = await sql`
    SELECT id, url, filename, folder, source, title, created_at
    FROM media_assets
    ORDER BY created_at DESC, filename
  `;
  return rows.map((r) => ({
    id: r.id as string,
    url: r.url as string,
    filename: r.filename as string,
    folder: r.folder as string,
    source: r.source as "blob" | "public",
    title: (r.title as string) || (r.filename as string),
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

/**
 * Upload a new asset to the media library. The shared WebP pipeline handles
 * format conversion + resize; the result URL is registered in `media_assets`
 * under the chosen folder so the admin can find it in the picker later.
 */
export async function uploadMediaAsset(formData: FormData) {
  const file = formData.get("file") as File | null;
  const folder = ((formData.get("folder") as string | null) || "uncategorized").trim() || "uncategorized";
  const title = ((formData.get("title") as string | null) || "").trim();

  if (!file || file.size === 0) return { error: "No file provided" };

  const url = await processAndUploadImage(file, folder);
  if (!url) return { error: "Upload failed" };

  const filename = decodeURIComponent(url.split("/").pop() || "image");
  await sql`
    INSERT INTO media_assets (url, filename, folder, source, title, mime_type, size_bytes)
    VALUES (${url}, ${filename}, ${folder}, 'blob', ${title || filename}, 'image/webp', ${file.size})
    ON CONFLICT (url) DO NOTHING
  `;

  revalidatePath("/admin/media");
  return { ok: true, url };
}

/** Delete a blob-hosted asset from the library. /public/ assets are NOT
 *  deletable from here (they ship with the repo). */
export async function deleteMediaAsset(id: string) {
  const rows = await sql`SELECT url, source FROM media_assets WHERE id = ${id}`;
  if (!rows.length) return { error: "Not found" };
  if (rows[0].source === "public") {
    return { error: "Bundled public assets can't be deleted from the admin" };
  }
  await sql`DELETE FROM media_assets WHERE id = ${id}`;
  // Note: the blob itself is left in place. We don't delete from Vercel Blob
  // in case the URL is still referenced by some DB column we don't know
  // about — better to leave an orphan than to 404 a live page.
  revalidatePath("/admin/media");
  return { ok: true };
}

/** Move an asset into a different folder. Just updates the label — the
 *  underlying URL doesn't change (we don't re-upload). */
export async function renameFolder(id: string, newFolder: string) {
  const folder = newFolder.trim() || "uncategorized";
  await sql`UPDATE media_assets SET folder = ${folder} WHERE id = ${id}`;
  revalidatePath("/admin/media");
  return { ok: true };
}
