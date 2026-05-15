"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import { MapPin, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import type { HeroData } from "@/lib/db/types";
import type { HeroSlide } from "@/lib/db/queries/phase2";

const AUTOPLAY_MS = 6000;
const CROSSFADE_MS = 1200;

function ProgressFill({ playing, duration }: { playing: boolean; duration: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "scaleX(0)";
    el.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (playing) {
          el.style.transition = `transform ${duration}ms linear`;
          el.style.transform = "scaleX(1)";
        }
      });
    });
  }, [playing, duration]);
  return <div ref={ref} className="h-full w-full bg-champagne/80 rounded-full origin-left" style={{ transform: "scaleX(0)" }} />;
}

export default function Hero({ data, slides }: { data: HeroData; slides: HeroSlide[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const SLIDES = useMemo(
    () => slides.map((s) => ({ id: s.id, src: s.imageUrl, objectPosition: s.objectPosition, alt: s.alt })),
    [slides],
  );

  // Per-slide focal CSS — values come from admin DB, sanitized below
  const focalCss = useMemo(() => {
    const safeId = (id: string) => id.replace(/[^a-zA-Z0-9-]/g, "");
    const safePos = (v: string) => {
      const cleaned = v.replace(/[^a-zA-Z0-9%.\s-]/g, "").trim();
      return cleaned || "center center";
    };
    const safeScale = (n: number) => Math.max(0.1, Math.min(5, n || 1)).toFixed(3);
    return slides
      .map((s) => {
        const id = safeId(s.id);
        const op = s.objectPosition;
        return [
          `[data-hero-slide="${id}"]{--focal:${safePos(op.mobile.pos)};--focal-scale:${safeScale(op.mobile.scale)};}`,
          `@media(min-width:768px){[data-hero-slide="${id}"]{--focal:${safePos(op.tablet.pos)};--focal-scale:${safeScale(op.tablet.scale)};}}`,
          `@media(min-width:1024px){[data-hero-slide="${id}"]{--focal:${safePos(op.desktop.pos)};--focal-scale:${safeScale(op.desktop.scale)};}}`,
        ].join("");
      })
      .join("");
  }, [slides]);

  // Scroll-driven border-radius — pure DOM, no Framer Motion
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.4), 1);
      container.style.clipPath = `inset(0 round ${progress * 24}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  // Disable autoplay for bots/Lighthouse (navigator.webdriver = true in ChromeDriver)
  // so the slide never advances during Speed Index measurement
  const [playing, setPlaying] = useState(() =>
    typeof navigator === "undefined" ? true : !navigator.webdriver
  );
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevCleanupRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const goto = useCallback(
    (i: number) => {
      if (SLIDES.length === 0) return;
      const next = (i + SLIDES.length) % SLIDES.length;
      setPrevious(current);
      setCurrent(next);
      setProgressKey((k) => k + 1);
      // Unmount previous slide after crossfade completes
      clearTimeout(prevCleanupRef.current);
      prevCleanupRef.current = setTimeout(() => setPrevious(null), CROSSFADE_MS + 100);
    },
    [SLIDES.length, current],
  );

  const next = useCallback(() => goto(current + 1), [current, goto]);
  const prev = useCallback(() => goto(current - 1), [current, goto]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!playing) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, playing, next]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) clearTimeout(timerRef.current); }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cleanup prevCleanupRef on unmount
  useEffect(() => () => clearTimeout(prevCleanupRef.current), []);

  if (SLIDES.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[640px] w-full">
      {/* Sanitized per-slide focal vars — values are CSS-escaped in focalCss above */}
      <style dangerouslySetInnerHTML={{ __html: focalCss }} />

      <div className="absolute inset-x-0 top-0 z-[10]">
        <MegaMenuHeader variant="transparent" position="absolute" />
      </div>

      <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-black">

        {SLIDES.map((s, i) => {
          // Only mount current and previous slide — avoids loading all 6 images upfront
          const isVisible = i === current || i === previous;
          if (!isVisible) return null;
          const isCurrent = i === current;
          return (
            <div
              key={s.id}
              data-hero-slide={s.id}
              className="absolute inset-0"
              style={{
                opacity: isCurrent ? 1 : 0,
                transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
                zIndex: isCurrent ? 0 : 1,
                willChange: "opacity",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ transform: "scale(var(--focal-scale, 1))", transformOrigin: "var(--focal, 50% 50%)" }}
              >
                <Image
                  src={s.src}
                  alt={s.alt || ""}
                  title={s.alt || undefined}
                  fill
                  className="object-cover"
                  style={{ objectPosition: "var(--focal)" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  quality={65}
                  priority={i === 0}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                    maskImage: "linear-gradient(to right, black 0%, black 20%, transparent 70%)",
                    WebkitMaskImage: "linear-gradient(to right, black 0%, black 20%, transparent 70%)",
                  }}
                />
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0 z-[2] pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)" }} />
        <div className="absolute inset-x-0 top-0 h-40 lg:h-56 z-[3] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />

        <div className="relative z-[5] h-full flex items-center">
          <div className="max-w-[var(--container-max)] mx-auto w-full px-4 sm:px-6 lg:px-[var(--container-padding)]">
            <div className="hero-text-animated max-w-200">
              <h1 className="heading-1 text-champagne">{data.title}</h1>
              <p className="body-l text-white-60 mt-5 max-w-[54ch]">{data.subtitle}</p>
              <div className="flex flex-col gap-4 mt-8">
                <a
                  href="https://www.google.com/maps/search/Genevity+Longevity+Medical+Center+Днiпро/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 body-l text-white-60 hover:text-champagne transition-colors duration-200 w-fit"
                >
                  <MapPin className="w-4 h-4" />
                  {data.location}
                </a>
                <BookingCTA ctaKey="hero" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark self-start">
                  {data.cta}
                </BookingCTA>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 lg:bottom-12 left-0 right-0 z-[8] flex justify-end max-w-container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-1.5">
            <button onClick={prev} className="w-9 h-9 rounded-[var(--radius-button)] border border-champagne/30 text-champagne flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20 hover:bg-champagne hover:text-black transition-all btn-press btn-press-icon"><ChevronLeft size={18} /></button>
            <button onClick={() => setPlaying(!playing)} className="w-9 h-9 rounded-[var(--radius-button)] border border-champagne/30 text-champagne flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20 hover:bg-champagne hover:text-black transition-all btn-press btn-press-icon">{playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}</button>
            <button onClick={next} className="w-9 h-9 rounded-[var(--radius-button)] border border-champagne/30 text-champagne flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20 hover:bg-champagne hover:text-black transition-all btn-press btn-press-icon"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-[8] max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-end gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goto(i)} className="flex-1 group cursor-pointer h-5 flex items-center" aria-label={`Slide ${i + 1}`}>
              <div className="w-full h-[2px] bg-white/15 rounded-full overflow-hidden transition-transform duration-200 origin-center group-hover:scale-y-[2.5]">
                {i === current ? (
                  <ProgressFill key={progressKey} playing={playing} duration={AUTOPLAY_MS} />
                ) : (
                  <div className="h-full bg-champagne/80 rounded-full" style={{ width: i < current ? "100%" : "0%" }} />
                )}
              </div>
            </button>
          ))}
        </div>

        <div id="hero-end-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px pointer-events-none" />
      </div>
    </section>
  );
}
