"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import { MapPin } from "lucide-react";
import { fadeInUp, fadeIn } from "@/lib/motion";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import type { HeroData } from "@/sanity/types";

export default function Hero({ data }: { data: HeroData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const borderRadius = useTransform(scrollYProgress, [0, 0.4], [0, 24]);

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[640px] w-full">
      {/* Hero header — outside rounded container so dropdown doesn't gap */}
      <div className="absolute inset-x-0 top-0 z-[10]">
        <MegaMenuHeader variant="transparent" position="absolute" />
      </div>

      {/* Image container with progressive border radius */}
      <motion.div className="absolute inset-0 overflow-hidden bg-black" style={{ borderRadius }}>
        {/* Base sharp image */}
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

        {/* Progressive blur layer — masked so it fades out toward the right */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to right, black 0%, black 35%, transparent 68%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 35%, transparent 68%)",
          }}
        >
          <Image
            src="/clinic/acupulse.webp"
            alt=""
            fill
            className="object-cover object-center scale-[1.02]"
            style={{ filter: "blur(14px)" }}
            sizes="100vw"
            aria-hidden
          />
        </div>

        {/* Darken gradient — strongest where the text lives, fades out to the right */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)",
          }}
        />

        {/* Top dim — keeps the transparent header readable */}
        <div
          className="absolute inset-x-0 top-0 h-40 lg:h-56 z-[3] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
          }}
        />

        {/* Content — text sits directly over the masked image */}
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

        {/* Sentinel: when this scrolls out of view, the sticky header fades in */}
        <div
          id="hero-end-sentinel"
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-px h-px pointer-events-none"
        />
      </motion.div>
    </section>
  );
}
