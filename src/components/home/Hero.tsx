"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import { MapPin, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { fadeInUp } from "@/lib/motion";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import type { HeroData } from "@/lib/db/types";
import type { HeroSlide } from "@/lib/db/queries/phase2";

const AUTOPLAY_MS = 6000;

/** Mounts at width 0, then on next frame starts filling to 100% over `duration`ms */
function ProgressFill({ playing, duration }: { playing: boolean; duration: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ensure browser paints at 0% first, then animate
    el.style.width = "0%";
    el.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (playing) {
          el.style.transition = `width ${duration}ms linear`;
          el.style.width = "100%";
        }
      });
    });
  }, [playing, duration]);

  return <div ref={ref} className="h-full bg-champagne/80 rounded-full" style={{ width: "0%" }} />;
}

export default function Hero({ data, slides }: { data: HeroData; slides: HeroSlide[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const SLIDES = useMemo(() => slides.map((s) => ({ id: s.id, src: s.imageUrl, objectPosition: s.objectPosition, alt: s.alt })), [slides]);

  // Emit one scoped stylesheet that maps each slide's id → --focal at the
  // three breakpoints. Using a shared --focal CSS var inside the scoped
  // selector keeps the Image rendering simple (just reads var(--focal)) while
  // still letting CSS media queries pick the right value per viewport.
  // Breakpoints match Tailwind: md=768, lg=1024.
  const focalCss = useMemo(() => {
    // Sanitize both halves of the selector+value: UUIDs are a fixed charset,
    // object-position values are restricted to percentage numbers / the six
    // CSS keywords. Anything else is dropped on the floor — prevents CSS
    // injection even if someone manages to poke bad data into the column.
    const safeId = (id: string) => id.replace(/[^a-zA-Z0-9-]/g, "");
    const safePos = (v: string) => {
      const cleaned = v.replace(/[^a-zA-Z0-9%.\s-]/g, "").trim();
      return cleaned || "center center";
    };
    return slides
      .map((s) => {
        const id = safeId(s.id);
        const m = safePos(s.objectPosition.mobile);
        const t = safePos(s.objectPosition.tablet);
        const d = safePos(s.objectPosition.desktop);
        return `
[data-hero-slide="${id}"]{--focal:${m};}
@media(min-width:768px){[data-hero-slide="${id}"]{--focal:${t};}}
@media(min-width:1024px){[data-hero-slide="${id}"]{--focal:${d};}}`;
      })
      .join("");
  }, [slides]);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const borderRadius = useTransform(scrollYProgress, [0, 0.4], [0, 24]);

  /* ── Slideshow state ── */
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const goto = useCallback(
    (i: number) => {
      if (SLIDES.length === 0) return;
      setCurrent((i + SLIDES.length) % SLIDES.length);
      setProgressKey((k) => k + 1); // restart progress bar animation
    },
    [SLIDES.length],
  );

  const next = useCallback(() => goto(current + 1), [current, goto]);
  const prev = useCallback(() => goto(current - 1), [current, goto]);

  /* Auto-advance */
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!playing) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, playing, next]);

  /* Pause when hero off-screen */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) clearTimeout(timerRef.current);
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const slide = SLIDES[current];
  if (SLIDES.length === 0 || !slide) return null;

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[640px] w-full">
      <style dangerouslySetInnerHTML={{ __html: focalCss }} />

      {/* Hero header */}
      <div className="absolute inset-x-0 top-0 z-[10]">
        <MegaMenuHeader variant="transparent" position="absolute" />
      </div>

      {/* Image container with progressive border radius */}
      <motion.div className="absolute inset-0 overflow-hidden bg-black" style={{ borderRadius }}>

        {/* ── Slides — smooth crossfade with blur layer baked in ── */}
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={current}
            data-hero-slide={slide.id}
            className="absolute inset-0 hero-slide-enter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            {/* Sharp image */}
            <Image
              src={slide.src}
              alt={slide.alt || ""}
              fill
              className="object-cover"
              style={{ objectPosition: "var(--focal)" }}
              sizes="100vw"
              priority={current === 0}
            />

            {/* Progressive blur — inside slide so it crossfades together */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                maskImage:
                  "linear-gradient(to right, black 0%, black 20%, transparent 70%)",
                WebkitMaskImage:
                  "linear-gradient(to right, black 0%, black 20%, transparent 70%)",
              }}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                className="object-cover"
                style={{ objectPosition: "var(--focal)", filter: "blur(2px)" }}
                sizes="100vw"
                aria-hidden
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Darken gradient */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)",
          }}
        />

        {/* Top dim for header readability */}
        <div
          className="absolute inset-x-0 top-0 h-40 lg:h-56 z-[3] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-[5] h-full flex items-center">
          <div className="max-w-[var(--container-max)] mx-auto w-full px-4 sm:px-6 lg:px-[var(--container-padding)]">
            <motion.div
              className="max-w-200"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <h1 className="heading-1 text-champagne">{data.title}</h1>
              <p className="body-l text-white-60 mt-5 max-w-[54ch]">{data.subtitle}</p>

              <div className="flex flex-col gap-4 mt-8">
                <a
                  href="https://maps.google.com/?q=Дніпро,+вул.+Олеся+Гончара,+12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 body-l text-white-60 hover:text-champagne transition-colors duration-200 w-fit"
                >
                  <MapPin className="w-4 h-4" />
                  {data.location}
                </a>
                <BookingCTA
                  variant="secondary"
                  size="lg"
                  className="bg-champagne text-black hover:bg-champagne-dark self-start"
                >
                  {data.cta}
                </BookingCTA>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Slideshow controls — bottom right, within container ── */}
        <div className="absolute bottom-8 lg:bottom-12 left-0 right-0 z-[8] flex justify-end max-w-container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-1.5">
            <button onClick={prev} className="w-9 h-9 rounded-[var(--radius-button)] border border-champagne/30 text-champagne flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20 hover:bg-champagne hover:text-black transition-all btn-press btn-press-icon">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setPlaying(!playing)} className="w-9 h-9 rounded-[var(--radius-button)] border border-champagne/30 text-champagne flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20 hover:bg-champagne hover:text-black transition-all btn-press btn-press-icon">
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button onClick={next} className="w-9 h-9 rounded-[var(--radius-button)] border border-champagne/30 text-champagne flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20 hover:bg-champagne hover:text-black transition-all btn-press btn-press-icon">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Segmented progress bars — one per slide, within container ── */}
        <div className="absolute bottom-0 left-0 right-0 z-[8] max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-end gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              className="flex-1 group cursor-pointer h-5 flex items-center"
              aria-label={`Slide ${i + 1}`}
            >
              <div className="w-full h-[2px] group-hover:h-[5px] bg-white/15 rounded-full overflow-hidden transition-[height] duration-200">
                {i === current ? (
                  <ProgressFill key={progressKey} playing={playing} duration={AUTOPLAY_MS} />
                ) : (
                  <div
                    className="h-full bg-champagne/80 rounded-full"
                    style={{ width: i < current ? "100%" : "0%" }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Sentinel */}
        <div
          id="hero-end-sentinel"
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-px h-px pointer-events-none"
        />
      </motion.div>
    </section>
  );
}
