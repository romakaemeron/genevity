"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import {
  ShieldCheck, Heart, Clock, Users, Bed, Stethoscope,
  Droplets, Activity, FlaskConical, ChevronRight,
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

const comfortFeatures = [
  { icon: Bed, label: L("Індивідуальні палати", "Индивидуальные палаты", "Private rooms"), desc: L("Затишні окремі палати з усім необхідним для комфортного відпочинку. Зручне ліжко, кондиціонування, Wi-Fi та телевізор. Палати обладнані кнопкою виклику медперсоналу.", "Уютные отдельные палаты со всем необходимым для комфортного отдыха. Удобная кровать, кондиционирование, Wi-Fi и телевизор. Палаты оборудованы кнопкой вызова медперсонала.", "Cozy private rooms with everything needed for comfortable rest. Comfortable bed, air conditioning, Wi-Fi and TV. Rooms equipped with staff call button.") },
  { icon: ShieldCheck, label: L("Медичний моніторинг", "Медицинский мониторинг", "Medical monitoring"), desc: L("Постійний контроль стану пацієнта сучасним обладнанням моніторингу. Лікар та медсестра доступні протягом усього перебування.", "Постоянный контроль состояния пациента современным оборудованием мониторинга. Врач и медсестра доступны в течение всего пребывания.", "Continuous patient monitoring with modern equipment. Physician and nurse available throughout the entire stay.") },
  { icon: Users, label: L("Персональний супровід", "Персональное сопровождение", "Personal care"), desc: L("Індивідуальний медичний супровід від лікаря та медсестри на кожному етапі. Персоналізований план лікування та догляду.", "Индивидуальное медицинское сопровождение от врача и медсестры на каждом этапе. Персонализированный план лечения и ухода.", "Individual medical care from physician and nurse at every stage. Personalized treatment and care plan.") },
  { icon: Heart, label: L("Конфіденційність", "Конфиденциальность", "Confidentiality"), desc: L("Повна приватність та конфіденційність вашого лікування. Інформація про перебування та процедури не розголошується третім особам.", "Полная приватность и конфиденциальность вашего лечения. Информация о пребывании и процедурах не разглашается третьим лицам.", "Complete privacy and confidentiality of your treatment. Information about your stay and procedures is not disclosed to third parties.") },
  { icon: Clock, label: L("Без черг", "Без очередей", "No Queues"), desc: L("Прийом у зручний для вас час без очікування та черг. Гнучкий графік, можливість обрати ранковий або денний час для процедур.", "Приём в удобное для вас время без ожидания и очередей. Гибкий график, возможность выбрать утреннее или дневное время для процедур.", "Appointments at your convenience without waiting or queues. Flexible schedule, choice of morning or daytime slots.") },
];

const services = [
  { icon: Droplets, label: L("IV-терапія", "IV-терапия", "IV Therapy"), desc: L("Внутрішньовенні крапельниці вітамінів, мінералів та амінокислот для швидкого відновлення енергії, імунітету та загального стану організму", "Внутривенные капельницы витаминов, минералов и аминокислот для быстрого восстановления энергии, иммунитета и общего состояния организма", "Intravenous drips of vitamins, minerals and amino acids for rapid energy, immunity and overall body recovery") },
  { icon: Activity, label: L("Спостереження після операцій", "Наблюдение после операций", "Post-Surgery Observation"), desc: L("Медичний нагляд після пластичних та косметологічних втручань з моніторингом стану та своєчасною допомогою", "Медицинский надзор после пластических и косметологических вмешательств с мониторингом состояния и своевременной помощью", "Medical supervision after plastic and cosmetological procedures with condition monitoring and timely assistance") },
  { icon: FlaskConical, label: L("Діагностичні програми", "Диагностические программы", "Diagnostic Programs"), desc: L("Комплексні програми Check-Up 40+ з повним лабораторним обстеженням, УЗД-діагностикою та консультаціями спеціалістів", "Комплексные программы Check-Up 40+ с полным лабораторным обследованием, УЗД-диагностикой и консультациями специалистов", "Comprehensive Check-Up 40+ with full lab tests, ultrasound diagnostics and specialist consultations") },
  { icon: Stethoscope, label: L("Детокс-терапія", "Детокс-терапия", "Detox Therapy"), desc: L("Інфузійна детоксикація для очищення організму від токсинів, відновлення печінки та покращення загального самопочуття", "Инфузионная детоксикация для очищения организма от токсинов, восстановления печени и улучшения общего самочувствия", "Infusion detoxification for cleansing the body of toxins, liver restoration and overall wellbeing improvement") },
  { icon: Clock, label: L("Тривалі процедури", "Длительные процедуры", "Long Procedures"), desc: L("Медичний нагляд під час тривалих косметологічних процедур", "Медицинский надзор во время длительных косметологических процедур", "Medical supervision during extended cosmetological procedures") },
  { icon: Heart, label: L("Реабілітація", "Реабилитация", "Rehabilitation"), desc: L("Відновлення після малоінвазивних втручань у комфортних палатах під наглядом досвідченого медичного персоналу центру GENEVITY", "Восстановление после малоинвазивных вмешательств в комфортных палатах под наблюдением опытного медицинского персонала центра GENEVITY", "Recovery after minimally invasive procedures in comfortable rooms under supervision of experienced GENEVITY medical staff") },
];

const indications = [
  L("Відновлення після пластичних та косметологічних операцій", "Восстановление после пластических и косметологических операций", "Recovery after plastic and cosmetological surgeries"),
  L("Проведення курсу IV-терапії (вітамінні крапельниці)", "Проведение курса IV-терапии (витаминные капельницы)", "IV therapy course (vitamin drips)"),
  L("Комплексна діагностика Check-Up 40+", "Комплексная диагностика Check-Up 40+", "Comprehensive Check-Up 40+ diagnostics"),
  L("Спостереження після малоінвазивних втручань", "Наблюдение после малоинвазивных вмешательств", "Observation after minimally invasive procedures"),
  L("Процедури, що потребують тривалого медичного контролю", "Процедуры, требующие длительного медицинского контроля", "Procedures requiring extended medical monitoring"),
  L("Детоксикація та відновлення організму", "Детоксикация и восстановление организма", "Detoxification and body restoration"),
];

const steps = [
  { num: "01", label: L("Консультація", "Консультация", "Consultation"), desc: L("Запишіться на попередню консультацію до лікаря. Фахівець оцінить ваш стан, визначить необхідність стаціонарного лікування та складе індивідуальний план процедур і спостереження.", "Запишитесь на предварительную консультацию к врачу. Специалист оценит ваше состояние, определит необходимость стационарного лечения и составит индивидуальный план процедур и наблюдения.", "Book a preliminary consultation with a physician. The specialist will assess your condition, determine the need for stationary treatment and create an individual plan for procedures and observation.") },
  { num: "02", label: L("Підготовка", "Подготовка", "Preparation"), desc: L("За потреби пройдіть необхідні лабораторні дослідження у нашій лабораторії. Візьміть із собою паспорт та результати попередніх обстежень. Лікар надасть рекомендації щодо підготовки.", "При необходимости пройдите лабораторные исследования в нашей лаборатории. Возьмите с собой паспорт и результаты предыдущих обследований. Врач даст рекомендации по подготовке.", "If needed, complete laboratory tests at our facility. Bring your passport and previous examination results. The physician will provide preparation recommendations.") },
  { num: "03", label: L("Лікування", "Лечение", "Treatment"), desc: L("Прибудьте у призначений час. Медичний персонал підготує палату, проведе необхідні процедури та забезпечить комфортне перебування протягом усього лікування під постійним наглядом.", "Прибудьте в назначенное время. Медицинский персонал подготовит палату, проведёт необходимые процедуры и обеспечит комфортное пребывание в течение всего лечения под постоянным наблюдением.", "Arrive at the appointed time. Medical staff will prepare the room, perform necessary procedures and ensure comfortable stay throughout treatment under constant supervision.") },
];

export default function StationaryPageComponent({ data, locale, doctors, doctorsUi, detailsLabel }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faq = data.faq || [];

  return (
    <>
      {faq.length > 0 && <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />}

      {/* ===== HERO — dark, immersive ===== */}
      <section className="relative overflow-hidden bg-ink min-h-[70vh] lg:min-h-[75vh] flex items-center">
        <motion.div className="absolute inset-0" variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 1.4 }}>
          <Image src="/clinic/semi1287-hdr.webp" alt={data.title} fill className="object-cover" sizes="100vw" priority />
        </motion.div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,37,32,0.9) 0%, rgba(42,37,32,0.5) 40%, rgba(42,37,32,0.3) 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-32 z-[3]" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 top-0 z-[10]">
          <MegaMenuHeader variant="transparent" position="absolute" />
        </div>

        <div className="relative z-[5] w-full max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-14 lg:pb-20 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <Breadcrumbs items={[{ label: ui("home", locale), href: "/" }, { label: data.title, href: "/stationary" }]} locale={locale} variant="light" />
            <h1 className="heading-1 text-champagne mt-6 max-w-2xl">{data.h1 || data.title}</h1>
            {data.summary && <p className="body-l text-white-60 mt-5 max-w-xl">{data.summary}</p>}
            <div className="mt-8">
              <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">
                {ui("bookConsultation", locale)}
              </BookingCTA>
            </div>
          </motion.div>
        </div>
        <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px" />
      </section>

      {/* ===== COMFORT FEATURES — bento grid ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-4">
            {t(L("Комфорт та безпека", "Комфорт и безопасность", "Comfort & Safety"), locale)}
          </motion.h2>
          <motion.p variants={fadeInUp} className="body-l text-muted mb-10 max-w-2xl">
            {t(L(
              "Денний стаціонар GENEVITY — це сучасний медичний простір у центрі Дніпра, де кожен пацієнт отримує індивідуальний підхід, повну конфіденційність та медичну допомогу найвищого рівня.",
              "Дневной стационар GENEVITY — это современное медицинское пространство в центре Днепра, где каждый пациент получает индивидуальный подход, полную конфиденциальность и медицинскую помощь высочайшего уровня.",
              "GENEVITY day stationary is a modern medical space in central Dnipro where every patient receives an individual approach, complete confidentiality and the highest level of medical care.",
            ), locale)}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {comfortFeatures.map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className={`relative flex flex-col gap-4 p-6 rounded-[var(--radius-card)] overflow-hidden ${
                  i === 0 ? "lg:col-span-2 lg:row-span-2" : "bg-champagne-dark"
                }`}
              >
                {i === 0 && (
                  <>
                    <Image src="/clinic/semi1256-hdr.webp" alt={t(feat.label, locale)} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-black/55" />
                  </>
                )}
                <div className={`relative z-10 ${i === 0 ? "flex flex-col gap-4 h-full justify-end" : ""}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    i === 0 ? "bg-champagne/15" : "bg-main/10"
                  }`}>
                    <feat.icon className={`w-6 h-6 ${i === 0 ? "text-champagne" : "text-main"}`} />
                  </div>
                  <h3 className={`${i === 0 ? "heading-3 text-champagne" : "body-strong text-black"}`}>
                    {t(feat.label, locale)}
                  </h3>
                  <p className={`${i === 0 ? "body-l text-white-60" : "body-m text-muted"}`}>
                    {t(feat.desc, locale)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== SERVICES — icon cards ===== */}
      <section className="bg-champagne-dark py-16 lg:py-24">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-10">
              {t(L("Послуги стаціонару", "Услуги стационара", "Stationary Services"), locale)}
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex flex-col gap-3 p-6 rounded-[var(--radius-card)] bg-white border border-line"
                >
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                    <svc.icon className="w-5 h-5 text-main" />
                  </div>
                  <h3 className="body-strong text-black">{t(svc.label, locale)}</h3>
                  <p className="body-m text-muted">{t(svc.desc, locale)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CLINIC PHOTOS — immersive strip ===== */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3"
      >
        <div className="relative aspect-[16/9] lg:aspect-[4/3]">
          <Image src="/clinic/semi1737-hdr.webp" alt="Інтер'єр клініки GENEVITY" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div className="relative aspect-[16/9] lg:aspect-[4/3]">
          <Image src="/clinic/semi1256-hdr.webp" alt="Палата стаціонару GENEVITY" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
      </motion.section>

      {/* ===== INDICATIONS ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-8">
            {t(L("Показання для лікування в стаціонарі", "Показания для лечения в стационаре", "Indications for Stationary Treatment"), locale)}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {indications.map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark">
                <div className="shrink-0 mt-0.5" style={{ width: 24, height: 24 }}>
                  <div className="w-full h-full rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  </div>
                </div>
                <p className="body-l text-ink">{t(item, locale)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== RELATED LINKS ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="flex flex-wrap gap-3">
          <Link href="/laboratory"><Button variant="outline" size="sm">{t(L("Лабораторія", "Лаборатория", "Laboratory"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          <Link href="/services/longevity/iv-therapy"><Button variant="outline" size="sm">{t(L("IV-терапія", "IV-терапия", "IV Therapy"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          <Link href="/services/plastic-surgery"><Button variant="outline" size="sm">{t(L("Пластична хірургія", "Пластическая хирургия", "Plastic Surgery"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS — visual timeline ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-12">
            {t(L("Як це працює", "Как это работает", "How It Works"), locale)}
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative">
                <span className="heading-1 text-main/10 absolute -top-4 -left-2 select-none">{step.num}</span>
                <div className="pt-8">
                  <h3 className="heading-3 text-black mb-3">{t(step.label, locale)}</h3>
                  <p className="body-l text-muted">{t(step.desc, locale)}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-6 w-12 text-line">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== PRICING — clean card ===== */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="bg-champagne-dark rounded-[var(--radius-card)] p-8 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
        >
          <div>
            <h2 className="heading-3 text-black mb-3">
              {t(L("Вартість перебування", "Стоимость пребывания", "Stay Pricing"), locale)}
            </h2>
            <p className="body-l text-muted max-w-xl">
              {t(L(
                "Вартість перебування у денному стаціонарі GENEVITY залежить від типу, тривалості та складності процедур. Базова вартість перебування — від 950 грн на день, що включає палату, медичний нагляд та харчування. IV-терапія (вітамінні крапельниці) — від 20 000 грн за курс. Комплексні діагностичні програми Check-Up — за індивідуальним розрахунком. Точну вартість визначить лікар на безкоштовній консультації.",
                "Стоимость пребывания в дневном стационаре GENEVITY зависит от типа, продолжительности и сложности процедур. Базовая стоимость пребывания — от 950 грн в день, включая палату, медицинское наблюдение и питание. IV-терапия (витаминные капельницы) — от 20 000 грн за курс. Комплексные диагностические программы Check-Up — по индивидуальному расчёту. Точную стоимость определит врач на бесплатной консультации.",
                "GENEVITY day stationary costs depend on procedure type, duration and complexity. Basic stay — from 950 UAH per day, including room, medical supervision and meals. IV therapy (vitamin drips) — from 20,000 UAH per course. Comprehensive Check-Up programs — individually calculated. Exact pricing determined by physician at a free consultation.",
              ), locale)}
            </p>
          </div>
          <BookingCTA variant="primary" size="lg" className="self-start shrink-0">
            {ui("bookConsultation", locale)}
          </BookingCTA>
        </motion.div>
      </section>

      {/* ===== FAQ ===== */}
      {faq.length > 0 && (
        <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16">
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
        </section>
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
