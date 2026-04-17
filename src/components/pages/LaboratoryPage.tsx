"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import {
  Scan, TestTube, HeartPulse, Brain, Baby, Stethoscope,
  Clock, CheckCircle, FileText, ChevronRight,
} from "lucide-react";
import type { StaticPageData, DoctorItem } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import Doctors from "@/components/home/Doctors";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { ui } from "@/lib/ui-strings";
import StripeGallery from "@/components/ui/StripeGallery";

interface Props {
  data: StaticPageData;
  locale: Locale;
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
}

const L = (ua: string, ru: string, en: string) => ({ ua, ru, en });
const t = (obj: { ua: string; ru: string; en: string }, locale: string) =>
  obj[locale as "ua" | "ru" | "en"] || obj.ua;

const stats = [
  { value: "50+", label: L("видів УЗД", "видов УЗД", "ultrasound types") },
  { value: "10+", label: L("видів еластографії", "видов эластографии", "elastography types") },
  { value: "8:00–20:00", label: L("щодня без вихідних", "ежедневно без выходных", "daily including weekends") }
];

const serviceCategories = [
  {
    icon: Scan,
    label: L("УЗД-діагностика", "УЗД-диагностика", "Ultrasound Diagnostics"),
    items: [
      L("Органи черевної порожнини", "Органы брюшной полости", "Abdominal organs"),
      L("Щитоподібна залоза", "Щитовидная железа", "Thyroid"),
      L("Молочні залози", "Молочные железы", "Breast"),
      L("Органи малого тазу", "Органы малого таза", "Pelvic organs"),
      L("Серце (ехокардіографія)", "Сердце (эхокардиография)", "Heart (echocardiography)"),
      L("Судини (доплерографія)", "Сосуды (допплерография)", "Vessels (Doppler)"),
      L("Суглоби та м'язи", "Суставы и мышцы", "Joints & muscles"),
      L("Нирки та сечовий міхур", "Почки и мочевой пузырь", "Kidneys & bladder"),
    ],
    price: L("від 500 грн", "от 500 грн", "from 500 UAH"),
  },
  {
    icon: HeartPulse,
    label: L("Еластографія", "Эластография", "Elastography"),
    items: [
      L("Печінки", "Печени", "Liver"),
      L("Щитоподібної залози", "Щитовидной железы", "Thyroid"),
      L("Молочної залози", "Молочной железы", "Breast"),
      L("М'яких тканин", "Мягких тканей", "Soft tissue"),
      L("Нирок", "Почек", "Kidneys"),
      L("Підшлункової залози", "Поджелудочной железы", "Pancreas"),
    ],
    price: L("від 500 грн", "от 500 грн", "from 500 UAH"),
  },
  {
    icon: Brain,
    label: L("Апаратна діагностика", "Аппаратная диагностика", "Apparatus Diagnostics"),
    items: [
      L("InBody — аналіз складу тіла", "InBody — анализ состава тела", "InBody — body composition analysis"),
      L("Zemits VeraFace — діагностика шкіри", "Zemits VeraFace — диагностика кожи", "Zemits VeraFace — skin diagnostics"),
    ],
    price: L("500 грн", "500 грн", "500 UAH"),
  },
];

const prepSteps = [
  { icon: Clock, label: L("Запишіться заздалегідь", "Запишитесь заранее", "Book in advance"), desc: L("За телефоном або онлайн. Для УЗД бажаний попередній запис.", "По телефону или онлайн. Для УЗД желательна предварительная запись.", "By phone or online. Pre-booking preferred for ultrasound.") },
  { icon: FileText, label: L("Візьміть документи", "Возьмите документы", "Bring documents"), desc: L("Паспорт та результати попередніх обстежень для порівняння.", "Паспорт и результаты предыдущих обследований для сравнения.", "Passport and previous examination results for comparison.") },
  { icon: TestTube, label: L("Підготовка до аналізів", "Подготовка к анализам", "Test preparation"), desc: L("УЗД черевної порожнини — натще. Інші дослідження — без спеціальної підготовки.", "УЗД брюшной полости — натощак. Другие исследования — без специальной подготовки.", "Abdominal ultrasound — fasting. Other examinations — no special preparation.") },
  { icon: CheckCircle, label: L("Отримайте результати", "Получите результаты", "Get results"), desc: L("Результати УЗД — одразу. Лабораторні аналізи — протягом 1–3 днів на email.", "Результаты УЗД — сразу. Лабораторные анализы — в течение 1–3 дней на email.", "Ultrasound results — immediately. Lab tests — within 1–3 days by email.") },
];

export default function LaboratoryPageComponent({ data, locale, doctors, doctorsUi, detailsLabel }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const faq = data.faq || [];

  return (
    <>
      {faq.length > 0 && <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />}

      {/* ===== HERO — light, clinical ===== */}
      <section className="relative overflow-hidden bg-champagne">
        <div className="absolute inset-x-0 top-0 z-[10]">
          <MegaMenuHeader variant="solid" position="fixed" />
        </div>
        <div className="relative z-[5]">
          <div className="max-w-[var(--container-max)] mx-auto w-full px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-10 lg:pb-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10">
              <motion.div className="flex-1 max-w-lg lg:py-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
                <Breadcrumbs items={[{ label: ui("home", locale), href: "/" }, { label: data.title, href: "/laboratory" }]} locale={locale} />
                <h1 className="heading-1 text-black mt-6">{data.h1 || data.title}</h1>
                {data.summary && <p className="body-l text-muted mt-5">{data.summary}</p>}
                <div className="mt-8">
                  <BookingCTA variant="primary" size="lg">{ui("bookConsultation", locale)}</BookingCTA>
                </div>
              </motion.div>
              <motion.div className="flex-1 mt-8 lg:mt-0" variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 1, delay: 0.5 }}>
                <div className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                  <Image src="/clinic/semi1256-hdr.webp" alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px" />
      </section>

      {/* ===== STATS — numbers strip ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-10 lg:py-12">
        <div className="bg-champagne-dark rounded-[var(--radius-card)] px-8 lg:px-12 py-8 lg:py-10">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center lg:text-left">
                <p className="heading-2 text-black">{stat.value}</p>
                <p className="body-m text-black-60 mt-1">{t(stat.label, locale)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SERVICES — tabbed categories ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-4">
            {t(L("Послуги лабораторії", "Услуги лаборатории", "Laboratory Services"), locale)}
          </motion.h2>
          <motion.p variants={fadeInUp} className="body-l text-muted mb-10 max-w-2xl">
            {t(L("Широкий спектр діагностичних досліджень на сучасному обладнанні з результатами в день звернення", "Широкий спектр диагностических исследований на современном оборудовании с результатами в день обращения", "Wide range of diagnostic examinations on modern equipment with same-day results"), locale)}
          </motion.p>

          {/* Category tabs */}
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-8">
            {serviceCategories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
                  activeCategory === i ? "bg-main text-champagne" : "bg-champagne-dark text-black hover:bg-champagne-darker"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {t(cat.label, locale)}
              </button>
            ))}
          </motion.div>

          {/* Active category content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-champagne-dark rounded-[var(--radius-card)] p-6 lg:p-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <h3 className="heading-3 text-black mb-4">{t(serviceCategories[activeCategory].label, locale)}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {serviceCategories[activeCategory].items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-1.5">
                        <div className="shrink-0" style={{ width: 20, height: 20 }}>
                          <div className="w-full h-full rounded-full bg-success/20 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-success" />
                          </div>
                        </div>
                        <span className="body-m text-ink">{t(item, locale)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:text-right shrink-0">
                  <p className="body-s text-muted">{t(L("Вартість", "Стоимость", "Price"), locale)}</p>
                  <p className="heading-3 text-main">{t(serviceCategories[activeCategory].price, locale)}</p>
                  <div className="mt-4">
                    <BookingCTA variant="primary" size="sm">{ui("book", locale)}</BookingCTA>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ===== PREPARATION — checklist cards ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16 lg:pb-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-10">
            {t(L("Як підготуватися", "Как подготовиться", "How to Prepare"), locale)}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {prepSteps.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex flex-col gap-3 p-6 rounded-[var(--radius-card)] bg-champagne-dark">
                <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-main" />
                </div>
                <h3 className="body-strong text-black">{t(step.label, locale)}</h3>
                <p className="body-m text-muted">{t(step.desc, locale)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <StripeGallery
            title={t(L("Діагностичний центр", "Диагностический центр", "Diagnostic Center"), locale)}
            subtitle={t(L("Сучасне обладнання для точної діагностики", "Современное оборудование для точной диагностики", "Modern equipment for precise diagnostics"), locale)}
            items={[
              { src: "/clinic/semi1256-hdr.webp", alt: "УЗД кабінет", label: t(L("Кабінет УЗД-діагностики", "Кабинет УЗД-диагностики", "Ultrasound Diagnostics Room"), locale), description: t(L("Обладнаний апаратами експертного класу для проведення всіх видів ультразвукових досліджень, еластографії та доплерографії.", "Оборудован аппаратами экспертного класса для проведения всех видов ультразвуковых исследований, эластографии и допплерографии.", "Equipped with expert-class devices for all types of ultrasound examinations, elastography and Doppler studies."), locale) },
              { src: "/clinic/semi1737-hdr.webp", alt: "Лабораторія", label: t(L("Лабораторний простір", "Лабораторное пространство", "Laboratory Space"), locale), description: t(L("Сучасна лабораторія для проведення аналізів у комфортних умовах приватного медичного центру.", "Современная лаборатория для проведения анализов в комфортных условиях частного медицинского центра.", "Modern laboratory for tests in comfortable private medical center conditions."), locale) },
              { src: "/clinic/semi1287-hdr.webp", alt: "Консультаційний кабінет", label: t(L("Консультаційний кабінет", "Консультационный кабинет", "Consultation Room"), locale), description: t(L("Простір для обговорення результатів діагностики та складання плану лікування з лікарем.", "Пространство для обсуждения результатов диагностики и составления плана лечения с врачом.", "Space for discussing diagnostic results and creating treatment plans with a physician."), locale) },
              { src: "/clinic/hydrafacial.webp", alt: "Діагностика шкіри", label: t(L("Zemits VeraFace", "Zemits VeraFace", "Zemits VeraFace"), locale), description: t(L("Апаратна діагностика стану шкіри обличчя для підбору індивідуальної програми догляду.", "Аппаратная диагностика состояния кожи лица для подбора индивидуальной программы ухода.", "Apparatus facial skin diagnostics for individual skincare program selection."), locale) },
              { src: "/clinic/acupulse.webp", alt: "Обладнання", label: t(L("Обладнання центру", "Оборудование центра", "Center Equipment"), locale), description: t(L("Весь парк обладнання сертифікований та проходить регулярне технічне обслуговування.", "Весь парк оборудования сертифицирован и проходит регулярное техническое обслуживание.", "All equipment is certified and undergoes regular technical maintenance."), locale) },
            ]}
            height="380px"
          />
        </motion.div>
      </section>

      {/* ===== RELATED LINKS ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="flex flex-wrap gap-3">
          <Link href="/services/longevity/check-up-40"><Button variant="outline" size="sm">Check-Up 40+<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          <Link href="/services/longevity/hormonal-balance"><Button variant="outline" size="sm">{t(L("Гормональний баланс", "Гормональный баланс", "Hormonal Balance"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          <Link href="/stationary"><Button variant="outline" size="sm">{t(L("Стаціонар", "Стационар", "Stationary"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
        </motion.div>
      </section>

      {/* ===== FAQ ===== */}
      {faq.length > 0 && (
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16">
          <h2 className="heading-2 text-black mb-8">{ui("faq", locale)}</h2>
          <div className="border-t border-line">
            {faq.map((item, i) => (
              <div key={i} className="border-b border-line">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer group">
                  <span className="body-strong text-black group-hover:text-main transition-colors pr-4 text-lg">{item.question}</span>
                  <motion.span className="text-muted text-2xl leading-none shrink-0" animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}>+</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="body-l text-muted pb-6 pr-8">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>
      )}

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
        <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{ui("ctaSubtitle", locale)}</p>
          <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{ui("book", locale)}</BookingCTA>
        </div>
      </div>
    </>
  );
}
