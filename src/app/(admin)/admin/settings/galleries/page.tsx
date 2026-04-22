import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import GalleryEditor, { type GalleryItemInput } from "../../_components/gallery-editor";

const OWNERS = [
  { key: "stationary", label: "Stationary page" },
  { key: "about", label: "About page" },
  { key: "homepage", label: "Homepage bento" },
];

export default async function GalleriesPage({ searchParams }: { searchParams: Promise<{ owner?: string }> }) {
  await requireSession();
  const params = await searchParams;
  const activeOwner = params.owner || "stationary";

  const rows = await sql`SELECT * FROM gallery_items WHERE owner_key = ${activeOwner} ORDER BY sort_order`;
  const items: GalleryItemInput[] = rows.map((r) => ({
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="heading-2 text-ink">Galleries</h1>
        <p className="body-m text-muted mt-1">Stripe galleries shown on different pages.</p>
      </div>

      <div className="flex gap-1 border-b border-line mb-6">
        {OWNERS.map((o) => (
          <a
            key={o.key}
            href={`/admin/settings/galleries?owner=${o.key}`}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeOwner === o.key ? "text-main border-b-2 border-main -mb-px" : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </a>
        ))}
      </div>

      <GalleryEditor key={activeOwner} ownerKey={activeOwner} initial={items} />
    </div>
  );
}
