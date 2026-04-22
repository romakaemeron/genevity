"use server";

/**
 * Shared admin image pipeline.
 *
 * Every upload in the admin (hero slides, gallery, section images, doctor photos,
 * equipment, services, categories, static pages, settings OG image, etc.) funnels
 * through {@link processAndUploadImage} so the output is always:
 *
 *   - converted to WebP (cheaper + smaller than JPEG/PNG at the same visual quality)
 *   - resized to fit within `maxDim` (longest side) while preserving aspect ratio
 *   - NEVER upscaled (withoutEnlargement — small photos stay small, not blown up pixelated)
 *   - auto-rotated per EXIF orientation (no sideways phone photos)
 *   - quality 88, effort 5 — sweet spot between visual fidelity and file size
 *
 * Non-image uploads (files without `image/*` content type) and SVGs are
 * passed through as-is so vector logos etc. still work.
 */

import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { sql } from "@/lib/db/client";

/**
 * Register an uploaded asset in the central media_assets library so it shows
 * up in /admin/media and can be reused in other sections. Called automatically
 * after every successful admin upload — failures here shouldn't break the
 * upload itself (the blob already landed), so we swallow errors.
 */
async function registerInMediaLibrary(
  url: string,
  folder: string,
  mimeType: string,
  sizeBytes: number,
) {
  try {
    const filename = decodeURIComponent(url.split("/").pop() || "image");
    await sql`
      INSERT INTO media_assets (url, filename, folder, source, title, mime_type, size_bytes)
      VALUES (${url}, ${filename}, ${folder}, 'blob', ${filename}, ${mimeType}, ${sizeBytes})
      ON CONFLICT (url) DO NOTHING
    `;
  } catch {
    // Silent — library registration is best-effort, the blob already uploaded
  }
}

export interface ProcessOptions {
  /** Longest side cap in pixels. Default 2400 — plenty for retina hero images. */
  maxDim?: number;
  /** WebP quality 1-100. Default 88. Lower = smaller file but risk of visible compression. */
  quality?: number;
  /** WebP encoder effort 0-6. Default 5. Higher = smaller file but slower to encode. */
  effort?: number;
}

/**
 * Process an image file (resize + convert to WebP) and upload it to Vercel Blob.
 * Returns the public URL. For null / empty files or missing `image/*` content
 * type, falls back to a plain upload so non-image assets (SVGs, PDFs) still work.
 */
export async function processAndUploadImage(
  file: File | null,
  folder: string,
  options: ProcessOptions = {},
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const { maxDim = 2400, quality = 88, effort = 5 } = options;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Skip sharp for non-raster images (SVGs, etc.) — just upload as-is
  const isRaster =
    file.type.startsWith("image/") &&
    !file.type.includes("svg") &&
    file.type !== "image/gif"; // sharp can lose GIF animation — pass through

  if (!isRaster) {
    const ext = file.name.split(".").pop() || "bin";
    const result = await put(`${folder}/${randomUUID()}.${ext}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });
    await registerInMediaLibrary(result.url, folder, file.type || "application/octet-stream", buffer.length);
    return result.url;
  }

  const processed = await sharp(buffer)
    .rotate() // EXIF-aware auto-rotate
    .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort })
    .toBuffer();

  const result = await put(`${folder}/${randomUUID()}.webp`, processed, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/webp",
  });
  await registerInMediaLibrary(result.url, folder, "image/webp", processed.length);
  return result.url;
}

/**
 * Convenience wrapper — if no new file was uploaded (either file is empty or
 * null), returns the existing `currentUrl` so callers can feed it straight
 * back into a DB column without branching.
 */
export async function processUploadOrKeep(
  file: File | null,
  folder: string,
  currentUrl?: string,
  options: ProcessOptions = {},
): Promise<string | null> {
  const uploaded = await processAndUploadImage(file, folder, options);
  if (uploaded) return uploaded;
  return currentUrl || null;
}

/**
 * Raw upload — NO resize, NO format conversion, NO compression. Preserves the
 * original file exactly as uploaded. Use this for Open Graph / social-share
 * images: Facebook, LinkedIn, Twitter crawlers officially support only JPEG
 * and PNG — a transparent conversion to WebP shows a broken preview there.
 * So OG uploads stay in their original format (usually the high-quality JPEG
 * the admin / designer provided).
 */
export async function uploadRawImage(
  file: File | null,
  folder: string,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "bin";
  const result = await put(`${folder}/${randomUUID()}.${ext}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || undefined,
  });
  await registerInMediaLibrary(result.url, folder, file.type || "image/jpeg", buffer.length);
  return result.url;
}

/** Raw-upload variant of {@link processUploadOrKeep}. Preserves original
 *  format when a new file is uploaded, falls back to `currentUrl` otherwise. */
export async function uploadRawOrKeep(
  file: File | null,
  folder: string,
  currentUrl?: string,
): Promise<string | null> {
  const uploaded = await uploadRawImage(file, folder);
  if (uploaded) return uploaded;
  return currentUrl || null;
}
