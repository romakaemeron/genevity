"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

interface GalleryItem {
  src: string;
  alt: string;
  label: string;
  sublabel?: string;
  description?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  items: GalleryItem[];
  height?: string;
}

/*
 * Items that are collapsing off-screen left. Each entry carries the
 * original index and a unique instance key so React treats the outgoing
 * copy and the incoming copy as separate DOM nodes.
 */
interface Ghost {
  origIdx: number;
  instanceKey: string;
  startFlex: number;
  order: number; // 0 = first to leave, 1 = second, etc.
  total: number; // how many ghosts in this batch
}

export default function StripeGallery({ title, subtitle, items, height = "600px" }: Props) {
  const n = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const ghostCounter = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* Visible order: active first, then wraps around (excluding ghosts) */
  const visibleOrder: number[] = [];
  for (let j = 0; j < n; j++) {
    visibleOrder.push((activeIndex + j) % n);
  }

  const getFlex = (pos: number): number => {
    if (pos === 0) return 10;
    if (pos === hoveredPos) {
      const base = Math.max(0.3, 1.8 - (pos - 1) * 0.25);
      return base * 1.6;
    }
    if (pos === 1) return 1.8;
    if (pos === 2) return 1.2;
    if (pos === 3) return 0.7;
    if (pos === 4) return 0.5;
    return 0.35;
  };

  const goTo = useCallback((newIdx: number) => {
    if (newIdx === activeIndex) return;
    setHoveredPos(null);

    /* Figure out which items will leave and their current flex */
    const leaving: Ghost[] = [];
    let cursor = activeIndex;
    let order = 0;
    while (cursor !== newIdx) {
      ghostCounter.current += 1;
      const startFlex = order === 0 ? 10 : getFlex(order);
      leaving.push({
        origIdx: cursor,
        instanceKey: `ghost-${ghostCounter.current}`,
        startFlex,
        order,
        total: 0, // filled below
      });
      cursor = (cursor + 1) % n;
      order++;
    }
    leaving.forEach((g) => (g.total = leaving.length));

    /* Scale cleanup delay by distance */
    const baseDur = 700;
    const staggerTotal = Math.min(leaving.length - 1, 4) * 80;
    const cleanupDelay = baseDur + staggerTotal + 100;

    setGhosts(leaving);
    setActiveIndex(newIdx);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setGhosts([]), cleanupDelay);
  }, [activeIndex, n]);

  const goPrev = useCallback(() => goTo((activeIndex - 1 + n) % n), [activeIndex, n, goTo]);
  const goNext = useCallback(() => goTo((activeIndex + 1) % n), [activeIndex, n, goTo]);

  const active = items[activeIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {title && <h2 className="heading-2 text-black">{title}</h2>}
            {subtitle && <p className="body-l text-muted mt-1">{subtitle}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" icon size="sm" onClick={goPrev}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="secondary" icon size="sm" onClick={goNext}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* Desktop: stripe gallery */}
      <div className="hidden md:flex overflow-hidden" style={{ height }}>
        {/* Ghosts: old items collapsing to the left, staggered */}
        {ghosts.map((ghost) => {
          const item = items[ghost.origIdx];
          const staggerDelay = ghost.order * 0.08;
          const dur = 0.7 + (ghost.total > 2 ? 0.15 : 0);
          return (
            <motion.div
              key={ghost.instanceKey}
              className="relative"
              style={{ minWidth: 0, overflow: "hidden" }}
              initial={{ flex: ghost.startFlex, paddingLeft: ghost.order === 0 ? 0 : 10 }}   
              animate={{ flex: 0, paddingLeft: 0 }} 
              transition={{ duration: dur, delay: staggerDelay, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="relative w-full h-full rounded-[var(--radius-card)] overflow-hidden">
                <div className="absolute inset-0" style={{ width: "800px", left: "50%", transform: "translateX(-50%)" }}>
                  <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="800px" />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Live items: active + stripes (wrapping) */}
        {visibleOrder.map((origIdx, pos) => {
          const item = items[origIdx];
          const isActive = pos === 0;
          const isHovered = pos === hoveredPos;
          const flex = getFlex(pos);
          const isNewArrival = ghosts.some((g) => g.origIdx === origIdx);

          return (
            <motion.div
              key={isNewArrival ? `${origIdx}-r${ghostCounter.current}` : origIdx}
              className={`relative ${!isActive ? "cursor-pointer" : ""}`}
              style={{ minWidth: 0, overflow: "hidden" }}
              initial={isNewArrival ? { flex: 0, paddingLeft: 0 } : false}
              animate={{
                flex,
                paddingLeft: pos === 0 ? 0 : 10,
              }}
              transition={{
                duration: ghosts.length > 2 ? 0.85 : 0.7,
                delay: isNewArrival ? 0.1 : 0,
                ease: [0.32, 0.72, 0, 1],
              }}
              onMouseEnter={() => pos > 0 && setHoveredPos(pos)}
              onMouseLeave={() => setHoveredPos(null)}
              onClick={() => pos > 0 && goTo(origIdx)}
            >
              <div className="relative w-full h-full rounded-[var(--radius-card)] overflow-hidden">
                <div className="absolute inset-0" style={{ width: "800px", left: "50%", transform: "translateX(-50%)" }}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className={`object-cover transition-transform duration-700 ${isHovered && !isActive ? "scale-[1.02]" : "scale-100"}`}
                    sizes="800px"
                  />
                </div>
                {!isActive && (
                  <div className={`absolute inset-0 transition-colors duration-300 ${isHovered ? "bg-black/5" : "bg-black/15"}`} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: simple slideshow */}
      <div className="md:hidden">
        <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full cursor-pointer transition-all ${
                i === activeIndex ? "w-6 h-2 bg-main" : "w-2 h-2 bg-black-20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Active item info */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl"
      >
        <p className="body-strong text-black text-lg">{active.label}</p>
        {active.description && (
          <p className="body-m text-muted mt-1">{active.description}</p>
        )}
      </motion.div>
    </div>
  );
}
