"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { Users, Microscope, Clock, Award, ChevronRight, Dna } from "lucide-react";
import Button from "@/components/ui/Button";

const imageCard = {
  icon: Microscope,
  key: "equipment",
  image: "/images/bento/SEMI7144.webp",
};

const smallCards: { icon: typeof Users; key: string; href?: string }[] = [
  { icon: Users, key: "team" },
  { icon: Dna, key: "longevity" },
  { icon: Clock, key: "stationary", href: "/stationary" },
  { icon: Award, key: "laboratory", href: "/laboratory" },
];

export default function Advantages() {
  const t = useTranslations("advantages");

  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="flex flex-col gap-10"
      >
        <motion.h2 variants={fadeInUp} className="heading-2 text-black">
          {t("title")}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 lg:grid-rows-[1fr]">
          {/* Big image card — left */}
          <motion.div
            variants={fadeInUp}
            className="group relative rounded-[var(--radius-card)] overflow-hidden bg-black"
          >
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[320px]">
              <Image
                src={imageCard.image}
                alt={t(`${imageCard.key}.title`)}
                fill
                className="object-cover opacity-100 group-hover:opacity-90 transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <imageCard.icon className="w-5 h-5 text-champagne" />
                <h3 className="body-strong text-champagne">{t(`${imageCard.key}.title`)}</h3>
              </div>
              <p className="body-m text-white-60">{t(`${imageCard.key}.desc`)}</p>
            </div>
          </motion.div>

          {/* 4 small cards — right, 2x2 grid, stretch to fill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 grid-rows-2">
            {smallCards.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-champagne-dark p-6 lg:p-7 rounded-[var(--radius-card)] flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="body-strong text-black mb-1.5">{t(`${item.key}.title`)}</h3>
                  <p className="body-m text-muted">{t(`${item.key}.desc`)}</p>
                </div>
                {item.href && (
                  <div className="mt-1">
                    <Link href={item.href}>
                      <Button variant="outline" size="sm">
                        {t(`${item.key}.title`)}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
