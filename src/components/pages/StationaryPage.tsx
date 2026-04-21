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
import type { StaticPageData, DoctorItem } from "@/lib/db/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import Doctors from "@/components/home/Doctors";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLd } from "@/components/seo/JsonLd";
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

const comfortFeatures = [
  { icon: Bed, label: L("Індивідуальні палати", "Индивидуальные палаты", "Private rooms"), desc: L("Затишні окремі палати з усім необхідним для комфортного відпочинку. Зручне ліжко, кондиціонування, Wi-Fi та телевізор. Палати обладнані кнопкою виклику медперсоналу.", "Уютные отдельные палаты со всем необходимым для комфортного отдыха. Удобная кровать, кондиционирование, Wi-Fi и телевизор. Палаты оборудованы кнопкой вызова медперсонала.", "Cozy private rooms with everything needed for comfortable rest. Comfortable bed, air conditioning, Wi-Fi and TV. Rooms equipped with staff call button.") },
  { icon: ShieldCheck, label: L("Медичний моніторинг", "Медицинский мониторинг", "Medical monitoring"), desc: L("Постійний контроль стану пацієнта сучасним обладнанням моніторингу. Лікар та медсестра доступні протягом усього перебування.", "Постоянный контроль состояния пациента современным оборудованием мониторинга. Врач и медсестра доступны в течение всего пребывания.", "Continuous patient monitoring with modern equipment. Physician and nurse available throughout the entire stay.") },
  { icon: Users, label: L("Персональний супровід", "Персональное сопровождение", "Personal care"), desc: L("Індивідуальний медичний супровід від лікаря та медсестри на кожному етапі. Персоналізований план лікування та догляду.", "Индивидуальное медицинское сопровождение от врача и медсестры на каждом этапе. Персонализированный план лечения и ухода.", "Individual medical care from physician and nurse at every stage. Personalized treatment and care plan.") },
  { icon: Heart, label: L("Конфіденційність", "Конфиденциальность", "Confidentiality"), desc: L("Повна приватність та конфіденційність вашого лікування. Інформація про перебування та процедури не розголошується третім особам.", "Полная приватность и конфиденциальность вашего лечения. Информация о пребывании и процедурах не разглашается третьим лицам.", "Complete privacy and confidentiality of your treatment. Information about your stay and procedures is not disclosed to third parties.") },
  { icon: Clock, label: L("Без черг", "Без очередей", "No Queues"), desc: L("Прийом у зручний для вас час без очікування та черг. Гнучкий графік, можливість обрати ранковий або денний час для процедур.", "Приём в удобное для вас время без ожидания и очередей. Гибкий график, возможность выбрать утреннее или дневное время для процедур.", "Appointments at your convenience without waiting or queues. Flexible schedule, choice of morning or daytime slots.") },
];

const services = [
  { icon: Droplets, label: L("IV-терапія (крапельниці)", "IV-терапия (капельницы)", "IV Therapy (Drips)"), desc: L("Внутрішньовенні крапельниці вітамінів, мінералів та амінокислот. Вартість — від 20 000 грн за курс.", "Внутривенные капельницы витаминов, минералов и аминокислот. Стоимость — от 20 000 грн за курс.", "Intravenous drips of vitamins, minerals and amino acids. Price — from 20,000 UAH per course.") },
  { icon: Stethoscope, label: L("Консультації спеціалістів", "Консультации специалистов", "Specialist Consultations"), desc: L("Косметолог, дерматолог, ендокринолог, гінеколог, гастроентеролог, подолог, дієтолог. Від 500 грн.", "Косметолог, дерматолог, эндокринолог, гинеколог, гастроэнтеролог, подолог, диетолог. От 500 грн.", "Cosmetologist, dermatologist, endocrinologist, gynecologist, gastroenterologist, podiatrist, dietitian. From 500 UAH.") },
  { icon: FlaskConical, label: L("Діагностичні програми Check-Up", "Диагностические программы Check-Up", "Check-Up Diagnostic Programs"), desc: L("Комплексне обстеження з лабораторними аналізами, УЗД-діагностикою та консультаціями спеціалістів — усе за один візит.", "Комплексное обследование с лабораторными анализами, УЗД-диагностикой и консультациями специалистов — всё за один визит.", "Comprehensive examination with lab tests, ultrasound diagnostics and specialist consultations — all in one visit.") },
  { icon: Activity, label: L("Пресотерапія", "Прессотерапия", "Pressotherapy"), desc: L("Апаратний лімфодренажний масаж для покращення кровообігу та зменшення набряків. Від 500 грн за зону.", "Аппаратный лимфодренажный массаж для улучшения кровообращения и уменьшения отёков. От 500 грн за зону.", "Apparatus lymphatic drainage massage for improving circulation and reducing swelling. From 500 UAH per zone.") },
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
      <JsonLd data={{ "@context": "https://schema.org", "@type": "MedicalClinic", name: "GENEVITY — Денний стаціонар", url: "https://genevity.com.ua/stationary", parentOrganization: { "@type": "MedicalBusiness", name: "GENEVITY", url: "https://genevity.com.ua" }, address: { "@type": "PostalAddress", streetAddress: "вул. Олеся Гончара, 12", addressLocality: "Дніпро", addressCountry: "UA" }, telephone: "+380730000150" }} />

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

        <div className="relative z-[5] w-full max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-14 lg:pb-20 pt-28">
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
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
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
      <section className="py-16 lg:py-24">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-10">
              {t(L("Послуги стаціонару", "Услуги стационара", "Stationary Services"), locale)}
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex flex-col gap-3 p-6 rounded-[var(--radius-card)] bg-champagne-dark"
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

      {/* ===== CLINIC PHOTOS — interactive stripe gallery ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <StripeGallery
            title={t(L("Наш простір", "Наше пространство", "Our Space"), locale)}
            subtitle={t(L("Познайомтеся з клінікою GENEVITY зсередини", "Познакомьтесь с клиникой GENEVITY изнутри", "Explore GENEVITY clinic from the inside"), locale)}
            items={[
              { src: "/images/interior/SEMI1737-HDR.webp", alt: t(L("Зал апаратної косметології", "Зал аппаратной косметологии", "Apparatus Cosmetology Room"), locale), label: t(L("Зал апаратної косметології", "Зал аппаратной косметологии", "Apparatus Cosmetology Room"), locale), sublabel: t(L("Сучасне обладнання преміум-класу", "Современное оборудование премиум-класса", "Premium modern equipment"), locale), description: t(L("Простір обладнано апаратами BTL, Lumenis та InMode для ліфтингу, контурування тіла та омолодження шкіри. Деяке обладнання — єдине в Україні.", "Пространство оборудовано аппаратами BTL, Lumenis и InMode для лифтинга, контурирования тела и омоложения кожи. Некоторое оборудование — единственное в Украине.", "Space equipped with BTL, Lumenis and InMode devices for lifting, body contouring and skin rejuvenation. Some equipment is the only one in Ukraine."), locale) },
              { src: "/images/interior/SEMI1276-HDR.webp", alt: t(L("Палата стаціонару", "Палата стационара", "Stationary Room"), locale), label: t(L("Палати стаціонару", "Палаты стационара", "Stationary Rooms"), locale), sublabel: t(L("Комфорт та приватність", "Комфорт и приватность", "Comfort & privacy"), locale), description: t(L("Індивідуальні палати з усім необхідним: зручне ліжко, система моніторингу, кондиціонування, Wi-Fi та кнопка виклику медперсоналу.", "Индивидуальные палаты со всем необходимым: удобная кровать, система мониторинга, кондиционирование, Wi-Fi и кнопка вызова медперсонала.", "Private rooms with everything needed: comfortable bed, monitoring system, air conditioning, Wi-Fi and staff call button."), locale) },
              { src: "/images/interior/SEMI1281-HDR.webp", alt: t(L("Кабінет лікаря", "Кабинет врача", "Physician Office"), locale), label: t(L("Кабінет лікаря", "Кабинет врача", "Physician Office"), locale), sublabel: t(L("Індивідуальні консультації", "Индивидуальные консультации", "Individual consultations"), locale), description: t(L("Затишний простір для детальних консультацій, діагностики стану шкіри та складання індивідуальних програм лікування.", "Уютное пространство для детальных консультаций, диагностики состояния кожи и составления индивидуальных программ лечения.", "Cozy space for detailed consultations, skin diagnostics and individual treatment program planning."), locale) },
              { src: "/images/interior/EMFACE и EMSculpt.webp", alt: t(L("EMFACE та EMSculpt", "EMFACE и EMSculpt", "EMFACE & EMSculpt"), locale), label: t(L("EMFACE та EMSculpt Neo", "EMFACE и EMSculpt Neo", "EMFACE & EMSculpt Neo"), locale), sublabel: t(L("Апаратне омолодження та контурування", "Аппаратное омоложение и контурирование", "Apparatus rejuvenation & contouring"), locale), description: t(L("Унікальне поєднання апаратів для одночасної підтяжки обличчя, тонусу м'язів та корекції контурів тіла.", "Уникальное сочетание аппаратов для одновременной подтяжки лица, тонуса мышц и коррекции контуров тела.", "Unique combination of devices for simultaneous facial lifting, muscle toning and body contouring."), locale) },
              { src: "/images/interior/SEMI1662-HDR.webp", alt: t(L("Процедурний кабінет", "Процедурный кабинет", "Procedure Room"), locale), label: t(L("Процедурний кабінет", "Процедурный кабинет", "Procedure Room"), locale), sublabel: t(L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable cosmetology"), locale), description: t(L("Кабінет для проведення ін'єкційних процедур: ботулінотерапія, контурна пластика, біоревіталізація та мезотерапія.", "Кабинет для проведения инъекционных процедур: ботулинотерапия, контурная пластика, биоревитализация и мезотерапия.", "Room for injectable procedures: botulinum therapy, contour plasty, biorevitalization and mesotherapy."), locale) },
              { src: "/images/interior/SEMI7509.webp", alt: t(L("Рецепція клініки", "Рецепция клиники", "Clinic Reception"), locale), label: t(L("Рецепція", "Рецепция", "Reception"), locale), sublabel: t(L("Перше враження", "Первое впечатление", "First impression"), locale), description: t(L("Простір, де починається ваш візит — привітна атмосфера та професійний прийом.", "Пространство, где начинается ваш визит — приветливая атмосфера и профессиональный приём.", "Where your visit begins — welcoming atmosphere and professional service."), locale) },
              { src: "/images/interior/SEMI7515.webp", alt: t(L("Зона відпочинку", "Зона отдыха", "Rest Area"), locale), label: t(L("Зона відпочинку", "Зона отдыха", "Rest Area"), locale), sublabel: t(L("Затишок після процедур", "Уют после процедур", "Comfort after procedures"), locale), description: t(L("Комфортна зона для відпочинку та відновлення після процедур з напоями та увагою медичного персоналу.", "Комфортная зона для отдыха и восстановления после процедур с напитками и вниманием медицинского персонала.", "Comfortable area for rest and recovery after procedures with beverages and medical staff attention."), locale) },
            ]}
            height="420px"
          />
        </motion.div>
      </section>

      {/* ===== INDICATIONS ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
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

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mt-8">
            <Link href="/laboratory"><Button variant="outline" size="sm">{t(L("Лабораторія", "Лаборатория", "Laboratory"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/services/longevity/iv-therapy"><Button variant="outline" size="sm">{t(L("IV-терапія", "IV-терапия", "IV Therapy"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/services/plastic-surgery"><Button variant="outline" size="sm">{t(L("Пластична хірургія", "Пластическая хирургия", "Plastic Surgery"), locale)}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS — visual timeline ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-12">
            {t(L("Як це працює", "Как это работает", "How It Works"), locale)}
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative">
                <span className="heading-1 text-main/10 select-none">{step.num}</span>
                <div className="pt-4">
                  <h3 className="heading-3 text-black mb-3">{t(step.label, locale)}</h3>
                  <p className="body-l text-muted">{t(step.desc, locale)}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-6 w-12 text-main/30">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== PRICING — clean card ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="bg-champagne-dark rounded-[var(--radius-card)] p-8 lg:p-12 flex flex-col gap-6"
        >
          <div>
            <h2 className="heading-3 text-black mb-3">
              {t(L("Вартість перебування", "Стоимость пребывания", "Stay Pricing"), locale)}
            </h2>
            <p className="body-l text-muted">
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
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
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

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
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
