"use client";

import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/useReveal";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import PhotoSlideshow from "@/components/ui/PhotoSlideshow";
import type { AboutData } from "@/lib/db/types";
import type { GalleryItem } from "@/lib/db/queries/phase2";

const FALLBACK_PHOTOS = [
  "/clinic/semi1737-hdr.webp",
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/hydrafacial.webp",
  "/clinic/acupulse.webp",
];

export default function About({ data, gallery = [] }: { data: AboutData; gallery?: GalleryItem[] }) {
  const tLabels = useTranslations("labels");
  const tSlides = useTranslations("aboutSlideshow");
  const { ref, visible } = useScrollReveal();

  const slides = gallery.length > 0
    ? gallery.map((g) => ({ src: g.imageUrl, alt: g.alt }))
    : FALLBACK_PHOTOS.map((src, i) => ({ src, alt: tSlides(`slide${i}` as Parameters<typeof tSlides>[0]) }));

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 ${visible ? "revealed" : ""}`}>
      <div className="flex flex-col gap-12">
        <div className="reveal flex flex-col gap-4 max-w-3xl">
          <h2 className="heading-2 text-black">{data.title}</h2>
          <p className="heading-3 text-main">{data.text2}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="reveal d1 relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark">
            <PhotoSlideshow items={slides} sizes="(max-width: 1024px) 100vw, 600px" withLightbox />
          </div>

          <div className="reveal d2 flex flex-col gap-8 justify-center">
            <p className="body-l text-black-80 leading-relaxed text-balance">{data.text1}</p>
            <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6">
              <p className="body-m text-black-60 text-balance">{data.diagnostics}</p>
            </div>
            <Link href="/about">
              <Button variant="outline" size="sm">
                {tLabels("learnMore")}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
