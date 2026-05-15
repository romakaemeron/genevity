"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "@/components/ui/Button";

export interface SlideItem {
  src: string;
  alt: string;
  title?: string;
}

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
    if (!isAuto || total <= 1) return;
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(elapsed / interval, 1);
      setProgress(pct);
      if (pct >= 1) { next(); } else { rafRef.current = requestAnimationFrame(tick); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isAuto, current, next, interval, total]);

  return { current, progress, isAuto, next, prev, goTo, stopAuto: () => setIsAuto(false), startAuto: () => setIsAuto(true) };
}

function SlideImages({ items, current, sizes }: { items: SlideItem[]; current: number; sizes: string }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ opacity: i === current ? 1 : 0 }}>
          <Image src={item.src} alt={item.alt} title={item.title || item.alt || undefined} fill className="object-cover" sizes={sizes} priority={i === 0} />
        </div>
      ))}
    </>
  );
}

function SlideDots({ count, current, goTo, progress }: { count: number; current: number; goTo: (i: number) => void; progress?: number }) {
  if (count <= 1) return null;
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: count }).map((_, i) => (
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

function SlideArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button variant="secondary" icon size="sm" onClick={onPrev}><ChevronLeft size={18} /></Button>
      <Button variant="secondary" icon size="sm" onClick={onNext}><ChevronRight size={18} /></Button>
    </div>
  );
}

function Lightbox({ items, current, goTo, next, prev, onClose }: {
  items: SlideItem[]; current: number; goTo: (i: number) => void; next: () => void; prev: () => void; onClose: () => void;
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
          <SlideImages items={items} current={current} sizes="100vw" />
        </div>
        <div className="flex items-center justify-between w-full max-w-4xl mt-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <SlideDots count={items.length} current={current} goTo={goTo} />
          <div className="flex items-center gap-3">
            <span className="body-s text-white/40">{current + 1} / {items.length}</span>
            <SlideArrows onPrev={prev} onNext={next} />
          </div>
        </div>
      </div>
    </>
  );
}

interface Props {
  items: SlideItem[];
  sizes?: string;
  className?: string;
  withLightbox?: boolean;
}

export default function PhotoSlideshow({ items, sizes = "(max-width: 1024px) 100vw, 600px", className = "", withLightbox = true }: Props) {
  const slideshow = useSlideshow(items.length);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = () => { setLightboxOpen(true); slideshow.stopAuto(); };
  const closeLightbox = () => { setLightboxOpen(false); slideshow.startAuto(); };

  if (items.length === 0) return null;

  return (
    <>
      <div
        className={`relative w-full h-full ${withLightbox ? "cursor-pointer" : ""} ${className}`}
        onClick={withLightbox ? openLightbox : undefined}
      >
        <SlideImages items={items} current={slideshow.current} sizes={sizes} />
        {items.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
            <SlideDots count={items.length} current={slideshow.current} goTo={slideshow.goTo} progress={slideshow.isAuto ? slideshow.progress : undefined} />
            <SlideArrows
              onPrev={() => slideshow.prev()}
              onNext={() => { slideshow.next(); slideshow.stopAuto(); }}
            />
          </div>
        )}
      </div>
      {withLightbox && lightboxOpen && (
        <Lightbox
          items={items}
          current={slideshow.current}
          goTo={slideshow.goTo}
          next={slideshow.next}
          prev={slideshow.prev}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
