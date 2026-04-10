"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import { MapPin } from "lucide-react";
import { fadeInUp, fadeIn } from "@/lib/motion";
import type { HeroData } from "@/sanity/types";

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative pt-20 lg:pt-24 overflow-hidden">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <div className="relative rounded-[var(--radius-card)] overflow-hidden min-h-[420px] sm:min-h-[500px] lg:min-h-[640px]">

          {/* Background fallback */}
          <div className="absolute inset-0 bg-black" />

          {/* Photo — covers right portion, fades into the main color */}
          <motion.div
            className="absolute inset-0"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15, duration: 1.2 }}
          >
            {/* Sharp image — full coverage */}
            <Image
              src="/clinic/acupulse.webp"
              alt="Інтер'єр преміальної клініки довголіття GENEVITY у Дніпрі"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority
            />

            {/* Blurred duplicate — masked to show only on the left */}
            <div
              className="absolute inset-0"
              style={{
                maskImage: "linear-gradient(to right, black 0%, black 25%, transparent 55%)",
                WebkitMaskImage: "linear-gradient(to right, black 0%, black 25%, transparent 55%)",
              }}
            >
              <Image
                src="/clinic/acupulse.webp"
                alt=""
                fill
                className="object-cover object-center blur-[4px] scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 1200px"
                aria-hidden
              />
            </div>

            {/* Dark gradient — heavier on left (text area), transparent on right */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.1) 55%, transparent 75%)",
              }}
            />

            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end lg:justify-center min-h-[420px] sm:min-h-[500px] lg:min-h-[640px] p-6 sm:p-10 lg:p-16">
            <div className="max-w-xl">
              <motion.h1
                className="heading-1 text-champagne mb-6"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                {data.title}
              </motion.h1>

              <motion.p
                className="body-l text-white-60 mb-10 max-w-md"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                {data.subtitle}
              </motion.p>

              <motion.div
                className="flex flex-col gap-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.35 }}
              >
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
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
