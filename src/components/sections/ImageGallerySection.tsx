import Image from "next/image";
import type { SectionImageGallery } from "@/sanity/types";

export default function ImageGallerySection({ heading, images }: SectionImageGallery) {
  return (
    <section>
      {heading && <h2 className="heading-2 text-black mb-6">{heading}</h2>}
      {images?.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark"
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
