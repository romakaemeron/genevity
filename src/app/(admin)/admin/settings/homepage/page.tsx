import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import HomepageForm from "./_components/homepage-form";
import GalleryEditor, { type GalleryItemInput } from "../../_components/gallery-editor";
import { ArrowUpRight } from "lucide-react";

export default async function HomepageSettingsPage() {
  await requireSession();
  const [heroRows, aboutRows, galleryRows] = await Promise.all([
    sql`SELECT * FROM hero WHERE id = 1`,
    sql`SELECT * FROM about WHERE id = 1`,
    sql`SELECT * FROM gallery_items WHERE owner_key = 'homepage_about' ORDER BY sort_order`,
  ]);

  const aboutSlides: GalleryItemInput[] = galleryRows.map((r) => ({
    id: r.id as string,
    image_url: (r.image_url as string) || "",
    alt_uk: (r.alt_uk as string) || "",
    alt_ru: (r.alt_ru as string) || "",
    alt_en: (r.alt_en as string) || "",
    label_uk: (r.label_uk as string) || "",
    label_ru: (r.label_ru as string) || "",
    label_en: (r.label_en as string) || "",
    sublabel_uk: (r.sublabel_uk as string) || "",
    sublabel_ru: (r.sublabel_ru as string) || "",
    sublabel_en: (r.sublabel_en as string) || "",
    description_uk: (r.description_uk as string) || "",
    description_ru: (r.description_ru as string) || "",
    description_en: (r.description_en as string) || "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <HomepageForm hero={heroRows[0] || {}} about={aboutRows[0] || {}} />

      {/* About section slideshow */}
      <div className="px-8">
        <div className="bg-champagne-dark rounded-2xl border border-line p-6">
          <h2 className="font-heading text-lg text-ink mb-1">About Section — Slideshow Photos</h2>
          <p className="body-s text-muted mb-5">
            Photos shown in the slideshow on the homepage About section. When empty, 5 default clinic photos are used as fallback.
          </p>
          <GalleryEditor ownerKey="homepage_about" initial={aboutSlides} />
        </div>
      </div>

      <div className="px-8 pb-8">
        <a
          href="/admin/pages/home"
          className="flex items-center gap-3 p-5 rounded-2xl border border-line bg-champagne-dark hover:bg-champagne transition-colors group"
        >
          <div className="flex-1">
            <p className="body-strong text-ink">Homepage texts — advantages, FAQ, section headings</p>
            <p className="body-m text-muted mt-0.5">
              Edit all labels, questions, and body copy for the homepage sections.
            </p>
          </div>
          <ArrowUpRight size={18} className="text-muted group-hover:text-ink transition-colors shrink-0" />
        </a>
      </div>
    </div>
  );
}
