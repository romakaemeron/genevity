"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "@/components/ui/Icons";
import { staggerContainer, viewportConfig } from "@/lib/motion";

interface ScrollCarouselProps {
  children: ReactNode[];
  className?: string;
}

export default function ScrollCarousel({ children, className = "" }: ScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const firstChild = scrollRef.current.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    const itemWidth = firstChild.offsetWidth + 24;
    scrollRef.current.scrollBy({
      left: direction === "right" ? itemWidth : -itemWidth,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <div
          ref={scrollRef}
          className="flex gap-6 scrollbar-hide snap-x snap-mandatory"
          style={{ overflowX: "scroll", overflowY: "hidden" }}
        >
          {children}
        </div>
      </div>

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex items-center justify-end gap-2 mt-4">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="w-7 h-7 rounded-full bg-main flex items-center justify-center text-champagne hover:bg-main-dark transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default disabled:hover:bg-main"
          aria-label="Previous"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="w-7 h-7 rounded-full bg-main flex items-center justify-center text-champagne hover:bg-main-dark transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default disabled:hover:bg-main"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
