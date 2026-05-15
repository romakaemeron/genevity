import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import HeroSlidesEditor from "../../_components/hero-slides-editor";

export default async function HeroSlidesPage() {
  await requireSession();
  const [rows, heroRows] = await Promise.all([
    sql`SELECT * FROM hero_slides ORDER BY sort_order`,
    sql`SELECT * FROM hero WHERE id = 1`,
  ]);
  const slides = rows.map((r) => ({
    id: r.id as string,
    image_url: r.image_url as string,
    // object_position is JSONB — may be the new {desktop:{pos,scale},...}
    // shape, a legacy {desktop:string,...} shape, or even a flat string from
    // very old rows. HeroSlidesEditor normalises any of those.
    object_position: r.object_position,
    alt_uk: (r.alt_uk as string) || "",
    alt_ru: (r.alt_ru as string) || "",
    alt_en: (r.alt_en as string) || "",
  }));
  const h = heroRows[0];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="heading-2 text-ink">Hero Slides</h1>
        <p className="body-m text-muted mt-1">Images that appear in the rotating homepage hero slideshow.</p>
      </div>
      <HeroSlidesEditor
        initial={slides}
        heroContent={
          h
            ? {
                title: (h.title_uk as string) || "",
                subtitle: (h.subtitle_uk as string) || "",
                cta: (h.cta_uk as string) || "",
                location: (h.location_uk as string) || "",
              }
            : undefined
        }
      />
    </div>
  );
}
