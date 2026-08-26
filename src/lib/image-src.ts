/**
 * Which image sources are already web-ready and must skip /_next/image.
 *
 * Two sources on this site are optimized before they ever reach a page:
 *
 *  - `/images/**\/*.webp`, `/clinic/*.webp`, `/doctors/*.webp` — built at
 *    ≤2560px; largest single file 464 KB. (The `.jpg` siblings next to the
 *    `/images` ones are the untouched camera originals, up to 12 MB, and must
 *    NOT bypass the optimizer — content references the `.webp` paths instead;
 *    see scripts/repoint-jpg-to-webp.mts.)
 *  - Doctor photos on Vercel Blob — the admin upload pipeline caps them at
 *    900px WebP q88, 23–66 KB each.
 *
 * Running these through the optimizer buys nothing: it re-cuts widths on files
 * already smaller than its own output, and every width costs a transformation.
 * Worse, when the Image Optimization quota runs out the optimizer answers 402
 * for any variant not already cached, and the picture disappears from the page
 * while the source file itself is served fine. Bypassing removes that whole
 * failure mode for the images that don't need it.
 *
 * Everything else — blog covers, media mentions, arbitrary CMS uploads — keeps
 * going through the optimizer, where the resizing is worth paying for.
 */
export function isPreOptimized(src: unknown): boolean {
  // Non-strings are static imports (StaticImageData) — always optimizer-bound.
  if (typeof src !== "string" || !src) return false;
  const local = /^\/(images|clinic|doctors)\//.test(src) && src.toLowerCase().endsWith(".webp");
  if (local) return true;
  if (src.includes(".public.blob.vercel-storage.com/doctors/")) return true;
  return false;
}
