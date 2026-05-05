"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/useReveal";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import type { AboutData } from "@/lib/db/types";

const CLINIC_PHOTOS = [
  "/clinic/semi1737-hdr.webp",
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/hydrafacial.webp",
  "/clinic/acupulse.webp",
];

function useSlideshow(total: number, autoPlay = true, interval = 5000) {
  const [current, setCurrent] = useState(0);
  const [isAuto, setIsAuto] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const next = useCallback(() => { setCurrent((c) => (c + 1) % total); setProgress(0); startRef.current = Date.now(); }, [total]);
  const prev = useCallback(() => { setCurrent((c) => (c - 1 + total) % total); setProgress(0); startRef.current = Date.now(); }, [total]);
  const goTo = useCallback((i: number) => { setCurrent(i); setProgress(0); startRef.current = Date.now(); }, []);

  useEffect(() => {
    if (!isAuto) return;
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(elapsed / interval, 1);
      setProgress(pct);
      if (pct >= 1) { next(); } else { rafRef.current = requestAnimationFrame(tick); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isAuto, current, next, interval]);

  return { current, progress, isAuto, next, prev, goTo, stopAuto: () => setIsAuto(false), startAuto: () => setIsAuto(true) };
}

export default function About({ data }: { data: AboutData }) {
  const slideshow = useSlideshow(CLINIC_PHOTOS.length);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const tLabels = useTranslations("labels");
  const tSlides = useTranslations("aboutSlideshow");
  const slideAlts = [tSlides("slide0"), tSlides("slide1"), tSlides("slide2"), tSlides("slide3"), tSlides("slide4")];
  const { ref, visible } = useScrollReveal();

  const openLightbox = () => { setLightboxOpen(true); slideshow.stopAuto(); };
  const closeLightbox = () => { setLightboxOpen(false); slideshow.startAuto(); };

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 ${visible ? "revealed" : ""}`}>
      <div className="flex flex-col gap-12">
        <div className="reveal flex flex-col gap-4 max-w-3xl">
          <h2 className="heading-2 text-black">{data.title}</h2>
          <p className="heading-3 text-main">{data.text2}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div
            className="reveal d1 relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark cursor-pointer"
            onClick={openLightbox}
          >
            <SlideshowImages current={slideshow.current} sizes="(max-width: 1024px) 100vw, 600px" alts={slideAlts} />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
              <SlideshowDots current={slideshow.current} goTo={slideshow.goTo} progress={slideshow.isAuto ? slideshow.progress : undefined} />
              <SlideshowArrows onPrev={() => slideshow.prev()} onNext={() => { slideshow.next(); slideshow.stopAuto(); }} />
            </div>
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

      {lightboxOpen && (
        <Lightbox
          current={slideshow.current}
          goTo={slideshow.goTo}
          next={slideshow.next}
          prev={slideshow.prev}
          onClose={closeLightbox}
          alts={slideAlts}
        />
      )}
    </section>
  );
}

function SlideshowImages({ current, sizes, alts }: { current: number; sizes: string; alts: string[] }) {
  return (
    <>
      {CLINIC_PHOTOS.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ opacity: i === current ? 1 : 0 }}>
          <Image src={src} alt={alts[i] || ""} fill className="object-cover" sizes={sizes} priority={i === 0} />
        </div>
      ))}
    </>
  );
}

function SlideshowDots({ current, goTo, progress }: { current: number; goTo: (i: number) => void; progress?: number }) {
  return (
    <div className="flex gap-2 items-center">
      {CLINIC_PHOTOS.map((_, i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); goTo(i); }}
          className={`h-2 rounded-full cursor-pointer transition-[width] duration-300 overflow-hidden relative ${i === current ? "w-8 bg-white/30" : "w-2 bg-white/40 hover:bg-white/60"}`}
        >
          {i === current && progress !== undefined && (
            <span className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${progress * 100}%` }} />
          )}
        </button>
      ))}
    </div>
  );
}

function SlideshowArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button variant="secondary" icon size="sm" onClick={onPrev}><ChevronLeft size={18} /></Button>
      <Button variant="secondary" icon size="sm" onClick={onNext}><ChevronRight size={18} /></Button>
    </div>
  );
}

function Lightbox({ current, goTo, next, prev, onClose, alts }: {
  current: number; goTo: (i: number) => void; next: () => void; prev: () => void; onClose: () => void; alts: string[];
}) {
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.cssText = `position:fixed;top:-${scrollY}px;left:0;right:0;overflow:hidden`;
    return () => {
      document.body.style.cssText = "";
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ""; });
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, next, prev]);

  return (
    <>
      <div className="lightbox-backdrop fixed inset-0 bg-black/80 z-[1000]" onClick={onClose} />
      <div className="lightbox-panel fixed inset-0 z-[1001] flex flex-col items-center justify-center p-4 sm:p-8 pointer-events-none">
        <div className="absolute top-4 right-4 z-10 pointer-events-auto">
          <Button variant="dark" icon size="sm" onClick={onClose} className="text-white hover:text-white/70">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative w-full max-w-4xl aspect-[3/2] rounded-[var(--radius-card)] overflow-hidden pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <SlideshowImages current={current} sizes="100vw" alts={alts} />
        </div>
        <div className="flex items-center justify-between w-full max-w-4xl mt-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <SlideshowDots current={current} goTo={goTo} />
          <div className="flex items-center gap-3">
            <span className="body-s text-white/40">{current + 1} / {CLINIC_PHOTOS.length}</span>
            <SlideshowArrows onPrev={() => prev()} onNext={() => next()} />
          </div>
        </div>
      </div>
    </>
  );
}
