"use client";

import { useState } from "react";
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

export default function StripeGallery({ title, subtitle, items, height = "600px" }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);

  const visibleOrder: number[] = [];
  for (let j = 0; j < items.length; j++) {
    visibleOrder.push((activeIndex + j) % items.length);
  }

  const getFlex = (pos: number): number => {
    if (pos === 0) return 10;
    if (pos === hoveredPos) {
      const base = Math.max(0.3, 1.8 - pos * 0.25);
      return base * 1.5;
    }
    if (pos === 1) return 1.8;
    if (pos === 2) return 1.2;
    if (pos === 3) return 0.7;
    if (pos === 4) return 0.5;
    return 0.35;
  };

  const active = items[activeIndex];
  const goPrev = () => setActiveIndex((activeIndex - 1 + items.length) % items.length);
  const goNext = () => setActiveIndex((activeIndex + 1) % items.length);

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
        {visibleOrder.map((origIdx, pos) => {
          const item = items[origIdx];
          const isActive = pos === 0;
          const isHovered = pos === hoveredPos;
          const flex = getFlex(pos);

          return (
            <motion.div
              key={origIdx}
              className={`relative cursor-pointer ${pos > 0 ? "pl-2.5" : ""}`}
              style={{ minWidth: 0 }}
              animate={{ flex }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              onMouseEnter={() => setHoveredPos(pos)}
              onMouseLeave={() => setHoveredPos(null)}
              onClick={() => setActiveIndex(origIdx)}
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

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
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
