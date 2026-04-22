"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { processAndUploadImage } from "./upload";

export async function uploadPhase2Image(formData: FormData): Promise<{ url: string }> {
  const file = formData.get("file") as File;
  const url = await processAndUploadImage(file, "phase2");
  if (!url) throw new Error("No file");
  return { url };
}

/* ==========  HERO SLIDES  ========== */
type HeroSlideInput = {
  id?: string;
  image_url: string;
  object_position: string;
  alt_uk: string;
  alt_ru: string;
  alt_en: string;
};

export async function saveHeroSlides(slides: HeroSlideInput[]) {
  await sql`DELETE FROM hero_slides`;
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    if (!s.image_url) continue;
    await sql`
      INSERT INTO hero_slides (image_url, object_position, alt_uk, alt_ru, alt_en, sort_order)
      VALUES (${s.image_url}, ${s.object_position || "center center"}, ${s.alt_uk || null}, ${s.alt_ru || null}, ${s.alt_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}

/* ==========  GALLERY ITEMS  ========== */
type GalleryItemInput = {
  id?: string;
  image_url: string;
  alt_uk: string; alt_ru: string; alt_en: string;
  label_uk: string; label_ru: string; label_en: string;
  sublabel_uk: string; sublabel_ru: string; sublabel_en: string;
  description_uk: string; description_ru: string; description_en: string;
};

export async function saveGallery(ownerKey: string, items: GalleryItemInput[]) {
  await sql`DELETE FROM gallery_items WHERE owner_key = ${ownerKey}`;
  for (let i = 0; i < items.length; i++) {
    const g = items[i];
    if (!g.image_url) continue;
    await sql`
      INSERT INTO gallery_items (owner_key, image_url, alt_uk, alt_ru, alt_en, label_uk, label_ru, label_en, sublabel_uk, sublabel_ru, sublabel_en, description_uk, description_ru, description_en, sort_order)
      VALUES (${ownerKey}, ${g.image_url},
        ${g.alt_uk || null}, ${g.alt_ru || null}, ${g.alt_en || null},
        ${g.label_uk || null}, ${g.label_ru || null}, ${g.label_en || null},
        ${g.sublabel_uk || null}, ${g.sublabel_ru || null}, ${g.sublabel_en || null},
        ${g.description_uk || null}, ${g.description_ru || null}, ${g.description_en || null},
        ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}

/* ==========  PRICE CATEGORIES + ITEMS  ========== */
type PriceCatInput = {
  id?: string;
  slug: string;
  label_uk: string; label_ru: string; label_en: string;
  link: string | null;
  items: { id?: string; name_uk: string; name_ru: string; name_en: string; price: string }[];
};

export async function savePriceCategories(cats: PriceCatInput[]) {
  await sql`DELETE FROM price_items`;
  await sql`DELETE FROM price_categories`;
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    const catId = randomUUID();
    await sql`
      INSERT INTO price_categories (id, slug, label_uk, label_ru, label_en, link, sort_order)
      VALUES (${catId}, ${c.slug}, ${c.label_uk}, ${c.label_ru || null}, ${c.label_en || null}, ${c.link || null}, ${i})
    `;
    for (let j = 0; j < c.items.length; j++) {
      const it = c.items[j];
      await sql`
        INSERT INTO price_items (category_id, name_uk, name_ru, name_en, price, sort_order)
        VALUES (${catId}, ${it.name_uk}, ${it.name_ru || null}, ${it.name_en || null}, ${it.price}, ${j})
      `;
    }
  }
  revalidatePath("/");
  return { ok: true };
}

/* ==========  LAB SERVICES / PREP / CHECKUPS  ========== */
type LabServiceInput = {
  id?: string;
  icon_key: string;
  label_uk: string; label_ru: string; label_en: string;
  items_uk: string[]; items_ru: string[]; items_en: string[];
  price_uk: string; price_ru: string; price_en: string;
};

export async function saveLabServices(services: LabServiceInput[]) {
  await sql`DELETE FROM lab_services`;
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await sql`
      INSERT INTO lab_services (icon_key, label_uk, label_ru, label_en, items_uk, items_ru, items_en, price_uk, price_ru, price_en, sort_order)
      VALUES (${s.icon_key}, ${s.label_uk}, ${s.label_ru || null}, ${s.label_en || null},
        ${s.items_uk || []}, ${s.items_ru || []}, ${s.items_en || []},
        ${s.price_uk || null}, ${s.price_ru || null}, ${s.price_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}

type LabPrepStepInput = {
  icon_key: string;
  label_uk: string; label_ru: string; label_en: string;
  desc_uk: string; desc_ru: string; desc_en: string;
};

export async function saveLabPrepSteps(steps: LabPrepStepInput[]) {
  await sql`DELETE FROM lab_prep_steps`;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    await sql`
      INSERT INTO lab_prep_steps (icon_key, label_uk, label_ru, label_en, desc_uk, desc_ru, desc_en, sort_order)
      VALUES (${s.icon_key}, ${s.label_uk}, ${s.label_ru || null}, ${s.label_en || null},
        ${s.desc_uk || null}, ${s.desc_ru || null}, ${s.desc_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}

type LabCheckupInput = {
  label_uk: string; label_ru: string; label_en: string;
  price_uk: string; price_ru: string; price_en: string;
  desc_uk: string; desc_ru: string; desc_en: string;
};

export async function saveLabCheckups(checkups: LabCheckupInput[]) {
  await sql`DELETE FROM lab_checkups`;
  for (let i = 0; i < checkups.length; i++) {
    const c = checkups[i];
    await sql`
      INSERT INTO lab_checkups (label_uk, label_ru, label_en, price_uk, price_ru, price_en, desc_uk, desc_ru, desc_en, sort_order)
      VALUES (${c.label_uk}, ${c.label_ru || null}, ${c.label_en || null},
        ${c.price_uk || null}, ${c.price_ru || null}, ${c.price_en || null},
        ${c.desc_uk || null}, ${c.desc_ru || null}, ${c.desc_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}
