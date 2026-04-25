import type { SectionShowcaseGallery } from "@/lib/db/types";
import StripeGallery from "@/components/ui/StripeGallery";

export default function ShowcaseGallerySection({ heading, subtitle, images }: SectionShowcaseGallery) {
  if (!images?.length) return null;

  const items = images.map((img) => ({
    src: img.url,
    alt: img.alt || "",
    label: img.title || "",
    description: img.subtitle || undefined,
  }));

  return (
    <section>
      <StripeGallery title={heading} subtitle={subtitle} items={items} />
    </section>
  );
}
