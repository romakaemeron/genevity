"use server";

/**
 * Manual "publish now" — drop the whole ISR cache in one go.
 *
 * Most public pages are cached with `export const revalidate = 86400`, so a row
 * edited straight in the database (or by a seed/refresh job) can sit invisible
 * for up to 24 hours. Individual editors already revalidate the paths they
 * touch; this is the blunt instrument for everything else — content changed
 * outside the admin, a Google-reviews refresh, or simply "why is the site still
 * showing the old text".
 */

import { requireSession } from "./auth";
import { revalidateWholeSite } from "@/lib/revalidate-site";
import { logChange } from "@/lib/audit";

export interface PurgeResult {
  ok: boolean;
  /** ISO timestamp of the purge, rendered back in the UI. */
  at: string;
  error?: string;
}

/**
 * Expire every cached page and route handler. The mechanics — and why one call
 * is enough — live in `lib/revalidate-site.ts`, shared with the API route so
 * the admin button and the CLI can never drift apart.
 */
export async function purgeSiteCache(): Promise<PurgeResult> {
  await requireSession();
  const at = new Date().toISOString();

  try {
    revalidateWholeSite();

    await logChange({
      action: "update",
      entityType: "cache",
      entityLabel: "Оновлено кеш усього сайту",
    });

    return { ok: true, at };
  } catch (e) {
    console.error("[cache] site-wide purge failed:", e);
    return { ok: false, at, error: e instanceof Error ? e.message : "unknown" };
  }
}
