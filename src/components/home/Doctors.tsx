"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DoctorCard from "@/components/doctors/DoctorCard";
import DoctorModalContent from "@/components/doctors/DoctorModal";
import type { DoctorItem } from "@/sanity/types";

interface DoctorsProps {
  doctors: DoctorItem[];
  ui: {
    title: string;
    subtitle: string;
    cta: string;
    experience: string;
  };
}

export default function Doctors({ doctors, ui }: DoctorsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [expandedDoctor, setExpandedDoctor] = useState<number | null>(null);

  const closeModal = useCallback(() => setExpandedDoctor(null), []);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
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
    const currentScroll = el.scrollLeft;

    let currentIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const cardLeft = cards[i].offsetLeft - scrollPad;
      const dist = Math.abs(cardLeft - currentScroll);
      if (dist < minDist) {
        minDist = dist;
        currentIdx = i;
      }
    }

    const nextIdx = Math.max(0, Math.min(cards.length - 1, currentIdx + (dir === "left" ? -1 : 1)));
    const targetScroll = cards[nextIdx].offsetLeft - scrollPad;
    el.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  return (
    <section>
      {/* Header + arrows */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex flex-col gap-2 mb-10"
      >
        <motion.h2 variants={fadeInUp} className="heading-2 text-black">
          {ui.title}
        </motion.h2>
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <p className="body-l text-black-60 max-w-[600px]">
            {ui.subtitle}
          </p>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" icon size="sm" onClick={() => scroll("left")} disabled={!canScrollLeft}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="secondary" icon size="sm" onClick={() => scroll("right")} disabled={!canScrollRight}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Scrollable cards */}
      <motion.div
        ref={scrollerRef}
        className="doctors-scroller scrollbar-hide"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {doctors.map((doctor, i) => (
          <motion.div
            key={doctor._id}
            variants={fadeInUp}
            className="shrink-0"
            style={{ width: "min(300px, 75vw)", scrollSnapAlign: "start" }}
          >
            <DoctorCard doctor={doctor} detailsLabel={ui.cta} onClick={() => setExpandedDoctor(i)} />
          </motion.div>
        ))}
      </motion.div>

      {/* Doctor Modal */}
      <AnimatePresence>
        {expandedDoctor !== null && (
          <Modal open onClose={closeModal}>
            <DoctorModalContent
              doctor={doctors[expandedDoctor]}
              cta={ui.cta}
              experience={ui.experience}
            />
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
