"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { useDirectionalReveal } from "@/lib/useReveal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import EquipmentModalContent from "@/components/equipment/EquipmentModal";
import type { EquipmentItem, HomepageData } from "@/lib/db/types";

type Category = "all" | "face" | "body" | "skin" | "intimate" | "laser";

const CATEGORIES: Category[] = ["all", "face", "body", "skin", "intimate", "laser"];

interface EquipmentProps {
  items: EquipmentItem[];
  ui: HomepageData["ui"]["equipment"];
}

export default function Equipment({ items, ui }: EquipmentProps) {
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

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
  const tabIndex = CATEGORIES.indexOf(activeTab);
  const revealRef = useDirectionalReveal(tabIndex);

  const selectedItem = items.find((item) => item._id === expandedItem) ?? null;

  return (
    <motion.section
      className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex flex-col gap-6"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      {/* Heading */}
      <motion.h2 variants={fadeInUp} className="heading-2 text-black">
        {ui.title}
      </motion.h2>

      {/* Tabs */}
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
            {ui.tabs[cat]}
          </button>
        ))}
      </motion.div>

      {/* Cards Grid */}
      <motion.div variants={fadeInUp}>
        <div
          ref={revealRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.slice(0, visibleCount).map((item) => (
            <EquipmentCard
              key={item._id}
              item={item}
              detailsLabel={ui.details}
              onClick={() => setExpandedItem(item._id)}
            />
          ))}
        </div>
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
              {ui.showMore}
            </Button>
          )}
          {hasLess && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setVisibleCount(6)}
            >
              {ui.showLess}
            </Button>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedItem !== null && (
          <Modal open onClose={closeModal} maxWidth={selectedItem.photo ? "sm:max-w-3xl" : "sm:max-w-lg"}>
            <EquipmentModalContent
              item={selectedItem}
              suitsTitle={ui.suitsTitle}
              resultsTitle={ui.resultsTitle}
            />
          </Modal>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
