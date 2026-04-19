"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { Shield, Users, Microscope, Heart, Clock, Award, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

const advantages = [
  {
    icon: Microscope,
    title: { ua: "Передове обладнання", ru: "Передовое оборудование", en: "Advanced Equipment" },
    description: {
      ua: "Апарати преміум-класу від BTL, Lumenis, InMode, Hydrafacial — деякі з них єдині в Україні. Сертифіковані FDA та CE",
      ru: "Аппараты премиум-класса от BTL, Lumenis, InMode, Hydrafacial — некоторые из них единственные в Украине. Сертифицированы FDA и CE",
      en: "Premium devices from BTL, Lumenis, InMode, Hydrafacial — some are the only ones in Ukraine. FDA and CE certified",
    },
    image: "/clinic/semi1737-hdr.webp",
    span: "col-span-1 lg:col-span-2 lg:row-span-2",
    imageAspect: "aspect-[4/3] lg:aspect-auto lg:h-full",
  },
  {
    icon: Users,
    title: { ua: "Команда експертів", ru: "Команда экспертов", en: "Expert Team" },
    description: {
      ua: "Лікарі з 10+ років досвіду в естетичній медицині та longevity",
      ru: "Врачи с 10+ лет опыта в эстетической медицине и longevity",
      en: "Physicians with 10+ years in aesthetic medicine & longevity",
    },
    span: "col-span-1",
  },
  {
    icon: Heart,
    title: { ua: "Персоналізований підхід", ru: "Персонализированный подход", en: "Personalized Approach" },
    description: {
      ua: "Індивідуальні програми на основі діагностики, а не шаблонні призначення",
      ru: "Индивидуальные программы на основе диагностики, а не шаблонные назначения",
      en: "Individual programs based on diagnostics, not template prescriptions",
    },
    span: "col-span-1",
  },
  {
    icon: Shield,
    title: { ua: "Безпека та прозорість", ru: "Безопасность и прозрачность", en: "Safety & Transparency" },
    description: {
      ua: "Ліцензовані препарати, повна інформація про процедури, чесні ціни",
      ru: "Лицензированные препараты, полная информация о процедурах, честные цены",
      en: "Licensed products, full procedure info, honest pricing",
    },
    image: "/clinic/semi1287-hdr.webp",
    span: "col-span-1 lg:col-span-2 lg:row-span-2",
    imageAspect: "aspect-[4/3] lg:aspect-auto lg:h-full",
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
    span: "col-span-1",
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
    span: "col-span-1",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 lg:grid-rows-[1fr_1fr_1fr]">
          {advantages.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`group relative rounded-[var(--radius-card)] overflow-hidden ${item.span} ${
                item.image
                  ? "bg-black"
                  : "bg-champagne-dark p-6 lg:p-7 flex flex-col justify-between gap-4 h-full"
              }`}
            >
              {item.image ? (
                <>
                  <div className={`relative ${item.imageAspect} min-h-[200px]`}>
                    <Image
                      src={item.image}
                      alt={item.title[l]}
                      fill
                      className="object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-7 z-10">
                    <div className="flex items-center gap-2.5 mb-2">
                      <item.icon className="w-5 h-5 text-champagne" />
                      <h3 className="body-strong text-champagne">{item.title[l]}</h3>
                    </div>
                    <p className="body-m text-white-60">{item.description[l]}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main mb-4">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="body-strong text-black mb-1.5">{item.title[l]}</h3>
                    <p className="body-m text-muted">{item.description[l]}</p>
                    {"href" in item && item.href && (
                      <div className="mt-3">
                        <Link href={item.href as string}>
                          <Button variant="outline" size="sm">
                            {item.title[l]}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
