"use server";

/** ТЗ #16 §1.2 — server actions behind the "Акції" editor. */

import { revalidatePath } from "next/cache";
import { requireSession } from "./auth";
import { processAndUploadImage } from "./upload";
import { logChange } from "@/lib/audit";
import { adminSavePromotions, type PromotionInput } from "@/lib/db/queries/promotions";

export async function uploadPromotionImage(formData: FormData): Promise<{ url: string }> {
  await requireSession();
  const file = formData.get("file") as File;
  const url = await processAndUploadImage(file, "promotions", { maxDim: 1400 });
  if (!url) throw new Error("No file");
  return { url };
}

export async function savePromotions(items: PromotionInput[]): Promise<{ ok: true }> {
  await requireSession();
  await adminSavePromotions(items);
  for (const p of ["/", "/ru", "/en"]) revalidatePath(p);
  await logChange({
    action: "update",
    entityType: "promotions",
    entityId: "homepage",
    entityLabel: "Акції на головній",
    after: { promotions: items.length },
  });
  return { ok: true };
}
