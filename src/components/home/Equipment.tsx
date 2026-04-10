"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { useReveal } from "@/lib/useReveal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import EquipmentModalContent from "@/components/equipment/EquipmentModal";

type Category = "all" | "face" | "body" | "skin" | "intimate" | "laser";

const CATEGORIES: Category[] = ["all", "face", "body", "skin", "intimate", "laser"];

export default function Equipment() {
  const t = useTranslations("equipment");
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const itemCount = 15;
  const items = Array.from({ length: itemCount }, (_, i) => ({
    index: i,
    category: t(`items.${i}.category`) as Category,
  }));

  const filtered =
    activeTab === "all"
      ? items
      : items.filter((item) => item.category === activeTab);

  const hasMore = visibleCount < filtered.length;
  const hasLess = visibleCount > 6;

  const handleTabChange = (cat: Category) => {
    setActiveTab(cat);
    setVisibleCount(6);
  };

  const closeModal = useCallback(() => setExpandedItem(null), []);
  const revealRef = useReveal(activeTab);

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex flex-col gap-6">
      {/* Header + Tabs */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="flex flex-col gap-8"
      >
        <motion.h2 variants={fadeInUp} className="heading-2 text-black">
          {t("title")}
        </motion.h2>

        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleTabChange(cat)}
              className={`px-5 py-2 rounded-[var(--radius-pill)] body-m font-medium transition-all duration-200 cursor-pointer ${
                activeTab === cat
                  ? "bg-main text-champagne"
                  : "bg-champagne-dark text-black-60 hover:bg-champagne-darker hover:text-black"
              }`}
            >
              {t(`tabs.${cat}`)}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* Cards Grid */}
      <motion.div
        ref={revealRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {filtered.map((item, i) => (
          <motion.div
            key={item.index}
            variants={fadeInUp}
            className="grid transition-[grid-template-rows,opacity,padding] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              gridTemplateRows: i < visibleCount ? "1fr" : "0fr",
              opacity: i < visibleCount ? 1 : 0,
              paddingBottom: i < visibleCount ? "24px" : "0px",
            }}
          >
            <div className="overflow-hidden">
              <EquipmentCard
                index={item.index}
                onClick={() => setExpandedItem(item.index)}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {(hasMore || hasLess) && (
        <div className="flex items-start justify-start gap-4">
          {hasMore && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVisibleCount((c) => c + 6)}
            >
              {t("showMore")}
            </Button>
          )}
          {hasLess && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setVisibleCount(6)}
            >
              {t("showLess")}
            </Button>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {expandedItem !== null && (
          <Modal open onClose={closeModal}>
            <EquipmentModalContent index={expandedItem} />
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
