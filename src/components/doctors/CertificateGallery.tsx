"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import type { CertificateImage } from "@/lib/db/queries/doctors";

interface Props {
  images: CertificateImage[];
  doctorName: string;
  locale: string;
  title: string;
}

/* ─── Lightbox ─────────────────────────────────────────────────────────── */
function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: CertificateImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const touchStartX = useRef<number | null>(null);

  /* scroll lock — same reference-counted pattern as Modal.tsx */
  useEffect(() => {
    type W = typeof window & { __modalLock?: { count: number; scrollY: number } };
    const w = window as W;
    if (!w.__modalLock) {
      const scrollY = window.scrollY;
      w.__modalLock = { count: 0, scrollY };
      document.body.style.cssText += "position:fixed;top:-" + scrollY + "px;left:0;right:0;overflow:hidden;";
    }
    w.__modalLock.count++;
    return () => {
      if (!w.__modalLock) return;
      w.__modalLock.count--;
      if (w.__modalLock.count <= 0) {
        const savedY = w.__modalLock.scrollY;
        delete w.__modalLock;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, savedY);
        requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ""; });
      }
    };
  }, []);

  /* keyboard nav */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  /* swipe */
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? onNext() : onPrev(); }
    touchStartX.current = null;
  };

  const cert = items[index];

  return createPortal(
    <div
      className="lightbox-backdrop fixed inset-0 z-[1000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* dark backdrop */}
      <div className="fixed inset-0 bg-black/90" onClick={onClose} />

      {/* close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[1002] w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors"
        aria-label="Закрити"
      >
        <X className="w-5 h-5" />
      </button>

      {/* prev arrow */}
      <button
        onClick={onPrev}
        disabled={index === 0}
        className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[1002] w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-25 disabled:pointer-events-none"
        aria-label="Попередній"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* next arrow */}
      <button
        onClick={onNext}
        disabled={index === items.length - 1}
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[1002] w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-25 disabled:pointer-events-none"
        aria-label="Наступний"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* image area — swipeable */}
      <div
        className="fixed inset-0 z-[1001] flex items-center justify-center px-16 py-14"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onClose}
      >
        <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
          <Image
            key={cert.url}
            src={cert.url}
            alt={cert.alt_uk}
            title={cert.alt_uk}
            fill
            className="object-contain select-none"
            sizes="90vw"
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* counter + dot strip */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1002] flex flex-col items-center gap-2">
        {/* dot indicators — up to 20 dots, else just text */}
        {items.length <= 20 && (
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === index ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
        <span className="text-white/70 text-sm font-medium tabular-nums">
          {index + 1} / {items.length}
        </span>
      </div>
    </div>,
    document.body
  );
}

/* ─── Gallery strip ─────────────────────────────────────────────────────── */
export default function CertificateGallery({ images, title }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const imageItems = images.filter((c) => c.type === "image");
  const pdfItems = images.filter((c) => c.type === "pdf");

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    setHasOverflow(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    // ResizeObserver fires when images load and change the scroller's content width
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    if (!cards.length) return;
    const scrollPad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const cur = el.scrollLeft;
    let idx = 0, min = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - scrollPad - cur);
      if (d < min) { min = d; idx = i; }
    });
    const next = Math.max(0, Math.min(cards.length - 1, idx + (dir === "left" ? -1 : 1)));
    el.scrollTo({ left: cards[next].offsetLeft - scrollPad, behavior: "smooth" });
  };

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevImage = useCallback(() => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextImage = useCallback(() => setLightboxIdx((i) => (i !== null && i < imageItems.length - 1 ? i + 1 : i)), [imageItems.length]);

  if (images.length === 0) return null;

  return (
    <>
      <section className="bg-champagne py-12 lg:py-16">
        {/* header + arrows */}
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mb-6 flex items-center justify-between gap-4">
            <h2 className="heading-2 text-black">{title}</h2>
          {hasOverflow && (
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary" icon size="sm" onClick={() => scroll("left")} disabled={!canScrollLeft}>
                <ChevronLeft size={18} />
              </Button>
              <Button variant="secondary" icon size="sm" onClick={() => scroll("right")} disabled={!canScrollRight}>
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>

        {/* scroll strip */}
        {imageItems.length > 0 && (
          <div ref={scrollerRef} className="doctors-scroller scrollbar-hide items-end">
            {imageItems.map((cert, i) => (
              <button
                key={cert.url}
                onClick={() => setLightboxIdx(i)}
                className="shrink-0 group overflow-hidden rounded-2xl bg-champagne-dark cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-main"
                style={{ scrollSnapAlign: "start" }}
                aria-label={cert.alt_uk}
              >
                <Image
                  src={cert.url}
                  alt={cert.alt_uk}
                  title={cert.alt_uk}
                  width={0}
                  height={0}
                  sizes="600px"
                  style={{ height: "220px", width: "auto", display: "block" }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}

        {/* PDF links */}
        {pdfItems.length > 0 && (
          <div className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 flex flex-wrap gap-3 ${imageItems.length > 0 ? "mt-4" : ""}`}>
            {pdfItems.map((cert) => (
              <a
                key={cert.url}
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-champagne-dark hover:bg-champagne-darker transition-colors body-s text-black"
                aria-label={cert.alt_uk}
              >
                <FileText className="w-4 h-4 text-main shrink-0" />
                <span>PDF</span>
                <Download className="w-3.5 h-3.5 text-black-40 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>

      {lightboxIdx !== null && (
        <Lightbox
          items={imageItems}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </>
  );
}
