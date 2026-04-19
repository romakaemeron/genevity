"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { MapPin, Phone, Instagram } from "@/components/ui/Icons";
import type { SiteSettingsData } from "@/sanity/types";

export default function Contacts({ data }: { data: { settings: SiteSettingsData; ui: { title: string; instagramLabel: string } } }) {
  const { settings, ui } = data;

  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="flex flex-col gap-8"
      >
        <motion.h2 variants={fadeInUp} className="heading-2 text-black">
          {ui.title}
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <a
              href="https://www.google.com/maps/search/Genevity+Longevity+Medical+Center+Дніпро"
              target="_blank"
              rel="noopener noreferrer"
              className="body-l text-black hover:text-main transition-colors"
            >
              {settings.address}
            </a>
          </div>

          <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <a href={`tel:${settings.phone1.replace(/\s/g, "")}`} className="body-l text-black hover:text-main transition-colors">
                {settings.phone1}
              </a>
              <a href={`tel:${settings.phone2.replace(/\s/g, "")}`} className="body-l text-black hover:text-main transition-colors">
                {settings.phone2}
              </a>
            </div>
          </div>

          <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="body-s text-black-40">{ui.instagramLabel}</p>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="body-l text-black hover:text-main transition-colors"
              >
                @{settings.instagram}
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
