"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import { MapPin } from "lucide-react";
import { fadeInUp, fadeIn } from "@/lib/motion";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import type { HeroData } from "@/sanity/types";

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
      {/* Background image — full bleed */}
      <motion.div
        className="absolute inset-0"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.05, duration: 1.2 }}
      >
        <Image
          src="/clinic/acupulse.webp"
          alt="Інтер'єр преміальної клініки довголіття GENEVITY у Дніпрі"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </motion.div>

      {/* Top dim — keeps the transparent header readable */}
      <div
        className="absolute inset-x-0 top-0 h-40 lg:h-56 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)",
        }}
      />

      {/* Bottom dim — softens horizon for footer of section */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 lg:h-64 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }}
      />

      {/* Hero header — transparent, anchored at top of hero, scrolls with it */}
      <div className="absolute inset-x-0 top-0 z-[10]">
        <MegaMenuHeader variant="transparent" position="absolute" />
      </div>

      {/* Content */}
      <div className="relative z-[5] h-full flex items-center">
        <div className="max-w-[var(--container-max)] mx-auto w-full px-4 sm:px-6 lg:px-[var(--container-padding)]">
          <div className="max-w-[42ch] lg:max-w-[52ch]">
            {/* Glass panel behind text — slight blur + dim for legibility */}
            <motion.div
              className="rounded-[var(--radius-card)] backdrop-blur-md p-6 sm:p-8 lg:p-10"
              style={{
                backgroundColor: "rgba(20, 16, 12, 0.18)",
                boxShadow: "0 24px 64px -24px rgba(0,0,0,0.35)",
              }}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <h1 className="heading-1 text-champagne">{data.title}</h1>

              <p className="body-l text-white-60 mt-5 max-w-[44ch]">{data.subtitle}</p>

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
      </div>

      {/* Sentinel: when this scrolls out of view, the sticky header fades in */}
      <div
        id="hero-end-sentinel"
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-px h-px pointer-events-none"
      />
    </section>
  );
}
