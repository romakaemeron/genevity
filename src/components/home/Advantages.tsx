"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { Users, Microscope, Clock, Award, ChevronRight, Dna } from "lucide-react";
import Button from "@/components/ui/Button";

const imageCard = {
  icon: Microscope,
  title: { ua: "Передове обладнання", ru: "Передовое оборудование", en: "Advanced Equipment" },
  description: {
    ua: "Апарати преміум-класу від BTL, Lumenis, InMode, Hydrafacial — деякі з них єдині в Україні. Сертифіковані FDA та CE",
    ru: "Аппараты премиум-класса от BTL, Lumenis, InMode, Hydrafacial — некоторые из них единственные в Украине. Сертифицированы FDA и CE",
    en: "Premium devices from BTL, Lumenis, InMode, Hydrafacial — some are the only ones in Ukraine. FDA and CE certified",
  },
  image: "/images/bento/SEMI7144.webp",
};

const smallCards = [
  {
    icon: Users,
    title: { ua: "Команда експертів", ru: "Команда экспертов", en: "Expert Team" },
    description: {
      ua: "Лікарі з 10+ років досвіду в естетичній медицині та longevity",
      ru: "Врачи с 10+ лет опыта в эстетической медицине и longevity",
      en: "Physicians with 10+ years in aesthetic medicine & longevity",
    },
  },
  {
    icon: Dna,
    title: { ua: "Longevity-програми", ru: "Longevity-программы", en: "Longevity Programs" },
    description: {
      ua: "Від глибокої діагностики до гормонального балансу, нутриціології та естетики — персональний протокол довголіття",
      ru: "От глубокой диагностики до гормонального баланса, нутрициологии и эстетики — персональный протокол долголетия",
      en: "From deep diagnostics to hormonal balance, nutrition and aesthetics — a personal longevity protocol",
    },
  },
  {
    icon: Clock,
    title: { ua: "Денний стаціонар", ru: "Дневной стационар", en: "Day Stationary" },
    description: {
      ua: "Комфортні палати, медичний нагляд, IV-терапія та відновлення після процедур",
      ru: "Комфортные палаты, медицинский надзор, IV-терапия и восстановление после процедур",
      en: "Comfortable rooms, medical supervision, IV therapy and post-procedure recovery",
    },
    href: "/stationary",
  },
  {
    icon: Award,
    title: { ua: "Власна лабораторія", ru: "Собственная лаборатория", en: "Own Laboratory" },
    description: {
      ua: "50+ видів УЗД, еластографія, діагностика InBody — результати в день звернення",
      ru: "50+ видов УЗД, эластография, диагностика InBody — результаты в день обращения",
      en: "50+ ultrasound types, elastography, InBody diagnostics — same-day results",
    },
    href: "/laboratory",
  },
];

const sectionTitle = {
  ua: "Чому обирають GENEVITY",
  ru: "Почему выбирают GENEVITY",
  en: "Why choose GENEVITY",
};

export default function Advantages({ locale }: { locale: string }) {
  const l = locale as "ua" | "ru" | "en";

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
          {sectionTitle[l]}
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
                alt={imageCard.title[l]}
                fill
                className="object-cover opacity-100 group-hover:opacity-90 transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <imageCard.icon className="w-5 h-5 text-champagne" />
                <h3 className="body-strong text-champagne">{imageCard.title[l]}</h3>
              </div>
              <p className="body-m text-white-60">{imageCard.description[l]}</p>
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
                  <h3 className="body-strong text-black mb-1.5">{item.title[l]}</h3>
                  <p className="body-m text-muted">{item.description[l]}</p>
                </div>
                {"href" in item && item.href && (
                  <div className="mt-1">
                    <Link href={item.href}>
                      <Button variant="outline" size="sm">
                        {item.title[l]}
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
