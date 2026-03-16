"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

function CompareSlider({
  beforeLabel,
  afterLabel,
}: {
  beforeLabel: string;
  afterLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[352/252] rounded-[var(--radius-card)] overflow-hidden cursor-ew-resize select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After image (full background) */}
      <div className="absolute inset-0 bg-main-dark">
        <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
          {afterLabel}
        </div>
      </div>

      {/* Before image (clipped by slider position) */}
      <div
        className="absolute inset-0 bg-main"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
          {beforeLabel}
        </div>
      </div>

      {/* Slider line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-champagne/80 z-10"
        style={{ left: `${position}%` }}
      />

      {/* Drag handle */}
      <div
        className="absolute z-20 w-10 h-10 rounded-full bg-champagne flex items-center justify-center shadow-lg"
        style={{ left: `${position}%`, top: "50%", transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`, transition: "transform 0.15s ease" }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M4 8H12M4 8L6 6M4 8L6 10M12 8L10 6M12 8L10 10" stroke="#8B7B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 z-10">
        <span className="body-s font-semibold text-champagne bg-black/40 px-2 py-1 rounded">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute bottom-3 right-3 z-10">
        <span className="body-s font-semibold text-champagne bg-black/40 px-2 py-1 rounded">
          {afterLabel}
        </span>
      </div>
    </div>
  );
}

export default function BeforeAfter() {
  const t = useTranslations("beforeAfter");

  const items = [
    { service: "Morpheus8 RF-ліфтинг" },
    { service: "Lumenis M22 фотоомолодження" },
    { service: "HydraFacial очищення" },
  ];

  return (
    <section className="max-w-[var(--container-max)] md:mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        linkText={t("link")}
        linkHref="#"
      />

      <motion.div
        className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {items.map((item, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <CompareSlider
              beforeLabel={t("before")}
              afterLabel={t("after")}
            />
            <div className="mt-3 px-3">
              <p className="body-strong text-black">{item.service}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
