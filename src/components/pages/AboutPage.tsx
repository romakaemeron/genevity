"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import {
  Award, Heart, Microscope, Users, Shield, Globe,
  ChevronRight,
} from "lucide-react";
import type { DoctorItem, AboutData } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import Doctors from "@/components/home/Doctors";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import StripeGallery from "@/components/ui/StripeGallery";
import { ui } from "@/lib/ui-strings";

interface Props {
  about: AboutData;
  locale: Locale;
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
}

const L = (ua: string, ru: string, en: string) => ({ ua, ru, en });
const t = (obj: { ua: string; ru: string; en: string }, locale: string) =>
  obj[locale as "ua" | "ru" | "en"] || obj.ua;

const values = [
  { icon: Microscope, label: L("Доказова медицина", "Доказательная медицина", "Evidence-Based Medicine"), desc: L("Протоколи на основі клінічних досліджень та міжнародних стандартів якості. Жодних необґрунтованих призначень.", "Протоколы на основе клинических исследований и международных стандартов качества. Никаких необоснованных назначений.", "Protocols based on clinical research and international quality standards. No unfounded prescriptions.") },
  { icon: Heart, label: L("Персоналізований підхід", "Персонализированный подход", "Personalized Approach"), desc: L("Кожен пацієнт — індивідуальна програма. Від діагностики до результату — план, складений саме для вас.", "Каждый пациент — индивидуальная программа. От диагностики до результата — план, составленный именно для вас.", "Every patient — an individual program. From diagnostics to results — a plan created specifically for you.") },
  { icon: Shield, label: L("Безпека та прозорість", "Безопасность и прозрачность", "Safety & Transparency"), desc: L("Тільки сертифіковані препарати FDA та CE. Повна інформація про процедури, чесні ціни без прихованих доплат.", "Только сертифицированные препараты FDA и CE. Полная информация о процедурах, честные цены без скрытых доплат.", "Only FDA and CE certified products. Full procedure information, honest pricing without hidden charges.") },
  { icon: Award, label: L("Передове обладнання", "Передовое оборудование", "Advanced Equipment"), desc: L("Апарати преміум-класу від BTL, Lumenis, InMode — деякі з них єдині в Україні. Регулярне технічне обслуговування.", "Аппараты премиум-класса от BTL, Lumenis, InMode — некоторые из них единственные в Украине. Регулярное техобслуживание.", "Premium devices from BTL, Lumenis, InMode — some are the only ones in Ukraine. Regular technical maintenance.") },
  { icon: Users, label: L("Команда експертів", "Команда экспертов", "Expert Team"), desc: L("Лікарі з 10+ років досвіду в естетичній медицині, дерматології, ендокринології та longevity-медицині.", "Врачи с 10+ лет опыта в эстетической медицине, дерматологии, эндокринологии и longevity-медицине.", "Physicians with 10+ years of experience in aesthetic medicine, dermatology, endocrinology and longevity medicine.") },
  { icon: Globe, label: L("Комплексність послуг", "Комплексность услуг", "Comprehensive Services"), desc: L("Від діагностики до відновлення — все в одному центрі: лабораторія, стаціонар, косметологія, хірургія.", "От диагностики до восстановления — всё в одном центре: лаборатория, стационар, косметология, хирургия.", "From diagnostics to recovery — all in one center: laboratory, stationary, cosmetology, surgery.") },
];

const stats = [
  { value: "10+", label: L("років досвіду", "лет опыта", "years of experience") },
  { value: "15+", label: L("лікарів-спеціалістів", "врачей-специалистов", "specialist physicians") },
  { value: "50+", label: L("видів діагностики", "видов диагностики", "diagnostic types") },
  { value: "FDA+CE", label: L("сертифіковане обладнання", "сертифицированное оборудование", "certified equipment") },
];

export default function AboutPageComponent({ about, locale, doctors, doctorsUi, detailsLabel }: Props) {
  return (
    <>
      {/* ===== HERO — split with clinic photo ===== */}
      <section className="bg-champagne">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-10 lg:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            <motion.div
              className="flex-1 max-w-lg lg:py-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Breadcrumbs
                items={[
                  { label: ui("home", locale), href: "/" },
                  { label: t(L("Про центр", "О центре", "About"), locale), href: "/about" },
                ]}
                locale={locale}
              />
              <h1 className="heading-1 text-black mt-6">{about.title}</h1>
              <p className="heading-3 text-main mt-4">{about.text2}</p>
              <div className="mt-8">
                <BookingCTA variant="primary" size="lg">{ui("bookConsultation", locale)}</BookingCTA>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 mt-8 lg:mt-0"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                <Image src="/clinic/semi1737-hdr.webp" alt="GENEVITY" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT TEXT — side by side with image ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-24">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="flex flex-col gap-6 justify-center">
              <p className="body-l text-black-80 leading-relaxed">{about.text1}</p>
              <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6">
                <p className="body-m text-black-60 leading-relaxed">{about.diagnostics}</p>
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden">
              <Image src="/clinic/semi1287-hdr.webp" alt="GENEVITY інтер'єр" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="bg-champagne-dark rounded-[var(--radius-card)] px-8 lg:px-12 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center lg:text-left">
              <p className="heading-2 text-black">{stat.value}</p>
              <p className="body-m text-muted mt-1">{t(stat.label, locale)}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== VALUES GRID ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-4">
            {t(L("Наші цінності", "Наши ценности", "Our Values"), locale)}
          </motion.h2>
          <motion.p variants={fadeInUp} className="body-l text-muted mb-10 max-w-2xl">
            {t(L(
              "GENEVITY — це не просто клініка. Це філософія поєднання науки, естетики та індивідуального підходу для довготривалого результату.",
              "GENEVITY — это не просто клиника. Это философия сочетания науки, эстетики и индивидуального подхода для долгосрочного результата.",
              "GENEVITY is not just a clinic. It is a philosophy of combining science, aesthetics and individual approach for lasting results.",
            ), locale)}
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((val, i) => (
              <motion.div key={i} variants={fadeInUp}
                className="flex flex-col gap-4 p-6 rounded-[var(--radius-card)] bg-champagne-dark">
                <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                  <val.icon className="w-5 h-5 text-main" />
                </div>
                <h3 className="body-strong text-black">{t(val.label, locale)}</h3>
                <p className="body-m text-muted">{t(val.desc, locale)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <StripeGallery
            title={t(L("Наш простір", "Наше пространство", "Our Space"), locale)}
            subtitle={t(L("Познайомтеся з клінікою зсередини", "Познакомьтесь с клиникой изнутри", "Explore the clinic from inside"), locale)}
            items={[
              { src: "/clinic/semi1737-hdr.webp", alt: "GENEVITY", label: t(L("Зал апаратної косметології", "Зал аппаратной косметологии", "Apparatus Cosmetology Room"), locale), description: t(L("Простір обладнано апаратами BTL, Lumenis та InMode для ліфтингу, контурування тіла та омолодження шкіри.", "Пространство оборудовано аппаратами BTL, Lumenis и InMode для лифтинга, контурирования тела и омоложения кожи.", "Space equipped with BTL, Lumenis and InMode devices for lifting, body contouring and skin rejuvenation."), locale) },
              { src: "/clinic/semi1256-hdr.webp", alt: "GENEVITY", label: t(L("Кабінет консультацій", "Кабинет консультаций", "Consultation Room"), locale), description: t(L("Затишний простір для детальних консультацій та діагностики стану шкіри.", "Уютное пространство для детальных консультаций и диагностики состояния кожи.", "Cozy space for detailed consultations and skin diagnostics."), locale) },
              { src: "/clinic/semi1287-hdr.webp", alt: "GENEVITY", label: t(L("Кабінет лікаря", "Кабинет врача", "Physician Office"), locale), description: t(L("Індивідуальні консультації та складання плану лікування.", "Индивидуальные консультации и составление плана лечения.", "Individual consultations and treatment planning."), locale) },
              { src: "/clinic/hydrafacial.webp", alt: "HydraFacial", label: t(L("HydraFacial Syndeo", "HydraFacial Syndeo", "HydraFacial Syndeo"), locale), description: t(L("Апарат для глибокого очищення та зволоження шкіри обличчя.", "Аппарат для глубокого очищения и увлажнения кожи лица.", "Device for deep facial cleansing and hydration."), locale) },
              { src: "/clinic/acupulse.webp", alt: "AcuPulse", label: t(L("AcuPulse CO₂", "AcuPulse CO₂", "AcuPulse CO₂"), locale), description: t(L("Фракційний CO₂ лазер від Lumenis для шліфування та омолодження.", "Фракционный CO₂ лазер от Lumenis для шлифовки и омоложения.", "Fractional CO₂ laser by Lumenis for resurfacing and rejuvenation."), locale) },
            ]}
            height="420px"
          />
        </motion.div>
      </section>

      {/* ===== SERVICES LINKS ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <h2 className="heading-2 text-black mb-6">{t(L("Напрямки", "Направления", "Directions"), locale)}</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/services/injectable-cosmetology"><Button variant="outline" size="sm">{t(L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable Cosmetology"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/services/apparatus-cosmetology"><Button variant="outline" size="sm">{t(L("Апаратна косметологія", "Аппаратная косметология", "Apparatus Cosmetology"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/services/longevity"><Button variant="outline" size="sm">Longevity & Anti-Age<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/laboratory"><Button variant="outline" size="sm">{t(L("Лабораторія", "Лаборатория", "Laboratory"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/stationary"><Button variant="outline" size="sm">{t(L("Стаціонар", "Стационар", "Stationary"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </motion.div>
      </section>

      {/* ===== DOCTORS ===== */}
      {doctors && doctors.length > 0 && doctorsUi && (
        <div className="mt-4">
          <Doctors doctors={doctors} ui={doctorsUi} detailsLabel={detailsLabel || ""} />
          <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] mt-6">
            <Link href="/doctors"><Button variant="outline" size="sm">{ui("allDoctors", locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </div>
      )}

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-20">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="relative rounded-[var(--radius-card)] overflow-hidden min-h-[300px] flex items-center">
          <Image src="/clinic/acupulse.webp" alt="GENEVITY" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{ui("ctaSubtitle", locale)}</p>
            <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{ui("book", locale)}</BookingCTA>
          </div>
        </motion.div>
      </div>
    </>
  );
}
