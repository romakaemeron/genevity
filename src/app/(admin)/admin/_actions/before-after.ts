"use server";

/**
 * ТЗ #16 §1.1 / §2.1 — server actions behind the "До / Після" editor.
 *
 * The same two actions serve the homepage block and every service page; the
 * surface is identified by the `ownerKey` the editor was mounted with
 * (`'homepage'` or `'service:<uuid>'`).
 */

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/client";
import { requireSession } from "./auth";
import { processAndUploadImage } from "./upload";
import { logChange } from "@/lib/audit";
import {
  adminSaveBeforeAfterCases,
  HOMEPAGE_BEFORE_AFTER_KEY,
  type BeforeAfterCaseInput,
} from "@/lib/db/queries/before-after";

/** Before/after photos are the one place on the site where detail matters, so
 *  they keep a larger long edge than a regular section image. */
export async function uploadBeforeAfterImage(formData: FormData): Promise<{ url: string }> {
  await requireSession();
  const file = formData.get("file") as File;
  const url = await processAndUploadImage(file, "before-after", { maxDim: 1800, quality: 90 });
  if (!url) throw new Error("No file");
  return { url };
}

/**
 * Invalidate every locale of whichever page owns these cases. A service owner
 * key is resolved back to its `/services/<category>/<slug>` path; `'homepage'`
 * just maps to `/`.
 */
async function revalidateOwner(ownerKey: string): Promise<string> {
  if (ownerKey === HOMEPAGE_BEFORE_AFTER_KEY) {
    for (const p of ["/", "/ru", "/en"]) revalidatePath(p);
    return "homepage";
  }

  const serviceId = ownerKey.startsWith("service:") ? ownerKey.slice("service:".length) : null;
  if (!serviceId) return ownerKey;

  const rows = await sql`
    SELECT s.slug, s.title_uk, c.slug AS cat_slug
    FROM services s JOIN service_categories c ON c.id = s.category_id
    WHERE s.id = ${serviceId}
  `;
  const r = rows[0];
  if (!r) return ownerKey;

  // Bump the service row so its Last-Modified reflects the new block, the way
  // every other content change on a service page does.
  await sql`UPDATE services SET updated_at = now() WHERE id = ${serviceId}`;
  for (const prefix of ["", "/ru", "/en"]) {
    revalidatePath(`${prefix}/services/${r.cat_slug}/${r.slug}`);
  }
  return (r.title_uk as string) || (r.slug as string);
}

export async function saveBeforeAfterCases(
  ownerKey: string,
  items: BeforeAfterCaseInput[],
): Promise<{ ok: true }> {
  await requireSession();
  await adminSaveBeforeAfterCases(ownerKey, items);
  const label = await revalidateOwner(ownerKey);
  await logChange({
    action: "update",
    entityType: "beforeAfter",
    entityId: ownerKey,
    entityLabel: label,
    after: { cases: items.length },
  });
  return { ok: true };
}
