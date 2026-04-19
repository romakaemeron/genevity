"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import BookingCTA from "@/components/ui/BookingCTA";

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
const L = (ua: string, ru: string, en: string) => ({ ua, ru, en });
const t = (obj: { ua: string; ru: string; en: string }, locale: string) =>
  obj[locale as "ua" | "ru" | "en"] || obj.ua;

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */
const heroSlides = [
  { caption: L("Атріум · ранкове світло", "Атриум · утренний свет", "Atrium · morning light"), img: "/images/hero/atrium.jpg" },
  { caption: L("Консультація · тет-а-тет", "Консультация · тет-а-тет", "Consultation · one-on-one"), img: "/images/hero/consultation.jpg" },
  { caption: L("Процедурний · Morpheus8", "Процедурная · Morpheus8", "Treatment · Morpheus8"), img: "/images/hero/procedure.jpg" },
  { caption: L("Лабораторія · аналітика", "Лаборатория · аналитика", "Laboratory · analytics"), img: "/images/hero/lab.jpg" },
];

const marqueeItems = [
  L("Діагностика", "Диагностика", "Diagnostics"),
  L("Догляд", "Уход", "Care"),
  L("Естетична медицина", "Эстетическая медицина", "Aesthetic medicine"),
  L("Програми довголіття", "Программы долголетия", "Longevity programs"),
  L("Власна лабораторія", "Собственная лаборатория", "Own laboratory"),
  L("Персональні протоколи", "Персональные протоколы", "Personal protocols"),
];

const bentoDirections = [
  L("Обличчя", "Лицо", "Face"),
  L("Тіло", "Тело", "Body"),
  L("Шкіра", "Кожа", "Skin"),
  L("Лазер", "Лазер", "Laser"),
];

const philosophyCols = [
  { title: L("Глибока діагностика.", "Глубокая диагностика.", "Deep diagnostics."), desc: L("Власна лабораторія, УЗД експертного рівня GE LOGIQ E10, дерматологічна діагностика та InBody-аналіз. Кожна програма починається з даних.", "Собственная лаборатория, УЗИ экспертного уровня GE LOGIQ E10, дерматологическая диагностика и InBody-анализ. Каждая программа начинается с данных.", "Own laboratory, expert-level GE LOGIQ E10 ultrasound, dermatological diagnostics and InBody analysis. Every program starts with data.") },
  { title: L("Комплексний підхід.", "Комплексный подход.", "Comprehensive approach."), desc: L("Гінекологія, ендокринологія, кардіологія, урологія-андрологія, дерматологія. Спочатку медицина — а естетика зростає зі здоров'я.", "Гинекология, эндокринология, кардиология, урология-андрология, дерматология. Сначала медицина — а эстетика вырастает из здоровья.", "Gynecology, endocrinology, cardiology, urology-andrology, dermatology. Medicine first — aesthetics grows from health.") },
  { title: L("Індивідуальна програма.", "Индивидуальная программа.", "Individual program."), desc: L("Одна команда, один запис, одна тривала розмова. Програма, що рухається з вами — тихо, послідовно, роками.", "Одна команда, одна запись, один продолжительный разговор. Программа, которая движется с вами — тихо, последовательно, годами.", "One team, one record, one lasting conversation. A program that moves with you — quietly, consistently, for years.") },
];

const methodSteps = [
  { num: "01", title: L("Глибока діагностика", "Глубокая диагностика", "Deep diagnostics"), desc: L("Лабораторні панелі, УЗД-візуалізація, дерматоскопічне картування, InBody-аналіз. Ваш повний профіль — раз зафіксований, назавжди оновлюється.", "Лабораторные панели, УЗИ-визуализация, дерматоскопическое картирование, InBody-анализ. Ваш полный профиль — раз зафиксирован, навсегда обновляется.", "Lab panels, ultrasound imaging, dermatoscopic mapping, InBody analysis. Your full profile — recorded once, updated forever.") },
  { num: "02", title: L("Консультація та план", "Консультация и план", "Consultation & plan"), desc: L("Мультидисциплінарний розбір — гінекологія, ендокринологія, дерматологія, естетична медицина. Один план, підписаний одним лікарем.", "Мультидисциплинарный разбор — гинекология, эндокринология, дерматология, эстетическая медицина. Один план, подписанный одним врачом.", "Multidisciplinary review — gynecology, endocrinology, dermatology, aesthetic medicine. One plan, signed by one physician.") },
  { num: "03", title: L("Протокол та процедури", "Протокол и процедуры", "Protocol & procedures"), desc: L("Апаратна косметологія, IV-терапія, гормональний баланс, підтримка відновлення. Тільки те, що підказує діагностика.", "Аппаратная косметология, IV-терапия, гормональный баланс, поддержка восстановления. Только то, что подсказывает диагностика.", "Apparatus cosmetology, IV therapy, hormonal balance, recovery support. Only what the diagnostics suggest.") },
  { num: "04", title: L("Спостереження", "Наблюдение", "Monitoring"), desc: L("Квартальні маркери, щорічний перегляд, постійна калібрація. Естетика, біологія та енергія — разом, роками.", "Квартальные маркеры, ежегодный пересмотр, постоянная калибрация. Эстетика, биология и энергия — вместе, годами.", "Quarterly markers, annual review, constant calibration. Aesthetics, biology and energy — together, for years.") },
];

const techCards = [
  { cat: L("Обличчя · без ін'єкцій", "Лицо · без инъекций", "Face · non-invasive"), title: "EMFACE", desc: L("Одночасна активація м'язів та відновлення шкіри — без уколів та періоду відновлення.", "Одновременная активация мышц и восстановление кожи — без уколов и периода восстановления.", "Simultaneous muscle activation and skin renewal — without injections or downtime.") },
  { cat: L("Обличчя · ліфтинг", "Лицо · лифтинг", "Face · lifting"), title: "VOLNEWMER", desc: L("Глибокий прогрів, що запускає вироблення колагену. Щільніша шкіра, чіткіший овал.", "Глубокий прогрев, запускающий выработку коллагена. Более плотная кожа, четкий овал.", "Deep heating that triggers collagen production. Denser skin, clearer contour.") },
  { cat: L("Обличчя · підтяжка", "Лицо · подтяжка", "Face · tightening"), title: "Ultraformer MPT", desc: L("Безопераційна підтяжка на глибоких шарах шкіри. Ефект наростає поступово протягом місяців.", "Безоперационная подтяжка на глубоких слоях кожи. Эффект нарастает постепенно в течение месяцев.", "Non-surgical lifting on deep skin layers. Effect builds gradually over months.") },
  { cat: L("Обличчя · оновлення", "Лицо · обновление", "Face · renewal"), title: "EXION", desc: L("Монополярний РЧ-ліфтинг та фракційний мікроголковий вплив — рівняє тон, освіжає обличчя.", "Монополярный РЧ-лифтинг и фракционный микроигольчатый воздействие — выравнивает тон, освежает лицо.", "Monopolar RF lifting and fractional microneedling — evens tone, refreshes the face.") },
  { cat: L("Тіло · контури", "Тело · контуры", "Body · contouring"), title: "Emsculpt Neo", desc: L("Електромагнітна стимуляція м'язів і радіочастота — тонус, рельєф, зменшення об'ємів.", "Электромагнитная стимуляция мышц и радиочастота — тонус, рельеф, уменьшение объемов.", "Electromagnetic muscle stimulation and radiofrequency — tone, relief, volume reduction.") },
  { cat: L("Шкіра · тон", "Кожа · тон", "Skin · tone"), title: "M22 Stellar", desc: L("Пігментація, судинні прояви, чистий рівний тон — для різних типів шкіри.", "Пигментация, сосудистые проявления, чистый ровный тон — для разных типов кожи.", "Pigmentation, vascular concerns, clean even tone — for different skin types.") },
  { cat: L("Шкіра · очищення", "Кожа · очищение", "Skin · cleansing"), title: "Hydrafacial Syndeo", desc: L("Глибоке очищення та зволоження. Одразу свіжий і доглянутий вигляд.", "Глубокое очищение и увлажнение. Сразу свежий и ухоженный вид.", "Deep cleansing and hydration. Instantly fresh and polished look.") },
  { cat: L("Лазер · епіляція", "Лазер · эпиляция", "Laser · hair removal"), title: "Splendor X", desc: L("Лазерна епіляція та робота зі судинами — для жінок і чоловіків.", "Лазерная эпиляция и работа с сосудами — для женщин и мужчин.", "Laser hair removal and vascular treatment — for women and men.") },
  { cat: L("Інтимна зона", "Интимная зона", "Intimate zone"), title: "CO2 лазер AcuPulse", desc: L("Відновлення тонусу та комфорту під контролем лікаря — делікатно та безпечно.", "Восстановление тонуса и комфорта под контролем врача — деликатно и безопасно.", "Restoration of tone and comfort under medical supervision — delicate and safe.") },
];

const outcomeStats = [
  { label: L("Лікарів у центрі", "Врачей в центре", "Physicians"), value: "12", sup: "*", desc: L("Дерматологія, ендокринологія, гінекологія, кардіологія, урологія-андрологія, УЗД та дієтологія.", "Дерматология, эндокринология, гинекология, кардиология, урология-андрология, УЗИ и диетология.", "Dermatology, endocrinology, gynecology, cardiology, urology-andrology, ultrasound and dietology.") },
  { label: L("Років сукупного досвіду", "Лет совокупного опыта", "Years of combined experience"), value: "140", sup: "+", desc: L("Глибока команда — за кожним планом ціла кар'єра.", "Глубокая команда — за каждым планом целая карьера.", "A deep team — behind every plan, an entire career.") },
  { label: L("Апаратів у роботі", "Аппаратов в работе", "Devices in daily use"), value: "11", sup: "", desc: L("Короткий список. Кожен апарат заслужив своє місце.", "Короткий список. Каждый аппарат заслужил свое место.", "A short list. Every device earned its place.") },
  { label: L("Консультацій до протоколу", "Консультаций до протокола", "Consultations before protocol"), value: "1.0", sup: "", desc: L("Повна, неспішна розмова передує кожній рекомендації.", "Полная, неспешная беседа предшествует каждой рекомендации.", "A full, unhurried conversation precedes every recommendation.") },
];

const doctorsList = [
  { idx: "02", name: L("Ганна Сепкіна", "Анна Сепкина", "Hanna Sepkina"), role: L("Дерматолог, косметолог", "Дерматолог, косметолог", "Dermatologist, cosmetologist"), years: L("10 років", "10 лет", "10 years") },
  { idx: "03", name: L("Олександра Макаренко", "Александра Макаренко", "Oleksandra Makarenko"), role: L("Ендокринолог", "Эндокринолог", "Endocrinologist"), years: L("08 років", "08 лет", "08 years") },
  { idx: "04", name: L("Катерина Полешко", "Екатерина Полешко", "Kateryna Poleshko"), role: L("Ендокринолог", "Эндокринолог", "Endocrinologist"), years: L("13 років", "13 лет", "13 years") },
  { idx: "05", name: L("Світлана Федоренко", "Светлана Федоренко", "Svitlana Fedorenko"), role: L("Лікар УЗД", "Врач УЗД", "Ultrasound physician"), years: L("10 років", "10 лет", "10 years") },
  { idx: "06", name: L("Анна Єсаянц", "Анна Есаянц", "Anna Yesayants"), role: L("Гінеколог", "Гинеколог", "Gynecologist"), years: L("12 років", "12 лет", "12 years") },
  { idx: "07", name: L("Євгенія Мінчук", "Евгения Минчук", "Yevheniia Minchuk"), role: L("Гастроентеролог, дієтолог", "Гастроэнтеролог, диетолог", "Gastroenterologist, dietician"), years: L("28 років", "28 лет", "28 years") },
  { idx: "08", name: L("Тетяна Толстикова", "Татьяна Толстикова", "Tetiana Tolstykova"), role: L("Гастроентеролог, дієтолог", "Гастроэнтеролог, диетолог", "Gastroenterologist, dietician"), years: L("25 років", "25 лет", "25 years") },
  { idx: "09", name: L("Влада Бузоверя", "Влада Бузоверя", "Vlada Buzoveria"), role: L("Кардіолог", "Кардиолог", "Cardiologist"), years: L("05 років", "05 лет", "05 years") },
  { idx: "10", name: L("Світлана Петренко", "Светлана Петренко", "Svitlana Petrenko"), role: L("Уролог, андролог", "Уролог, андролог", "Urologist, andrologist"), years: L("04 роки", "04 года", "04 years") },
  { idx: "11", name: L("Максим Лисенко", "Максим Лысенко", "Maksym Lysenko"), role: L("Лікар УЗД", "Врач УЗД", "Ultrasound physician"), years: L("04 роки", "04 года", "04 years") },
  { idx: "12", name: L("Анжела Кириленко", "Анжела Кириленко", "Anzhela Kyrylenko"), role: L("Подолог", "Подолог", "Podologist"), years: "—" },
];

const journalCards = [
  { tag: L("Есе · 12 хв", "Эссе · 12 мин", "Essay · 12 min"), date: "03 / 26", title: L("Робити менше, але точніше — аргумент на користь поміркованості в естетичній медицині.", "Делать меньше, но точнее — аргумент в пользу умеренности в эстетической медицине.", "Do less, but more precisely — an argument for moderation in aesthetic medicine."), aspect: "4/5" as const },
  { tag: L("Наука · 8 хв", "Наука · 8 мин", "Science · 8 min"), date: "02 / 26", title: L("Що справді вимірює грамотна панель довголіття — і чому список коротший, ніж ви думаєте.", "Что на самом деле измеряет грамотная панель долголетия — и почему список короче, чем вы думаете.", "What a proper longevity panel actually measures — and why the list is shorter than you think."), aspect: "1/1" as const },
  { tag: L("Розмова · 6 хв", "Разговор · 6 мин", "Conversation · 6 min"), date: "01 / 26", title: L("Десять років з однією пацієнткою — про те, як тихо змінюються естетичні цілі з віком.", "Десять лет с одной пациенткой — о том, как тихо меняются эстетические цели с возрастом.", "Ten years with one patient — on how aesthetic goals quietly change with age."), aspect: "3/4" as const },
];

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

function SectionIndex({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8 }}
      className={`section-v2-index font-mono text-xs tracking-[0.12em] uppercase ${light ? "text-white-60" : "text-muted"}`}
    >
      {children}
    </motion.div>
  );
}

function Reveal({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* Hero slideshow hook */
function useSlideshow(count: number, dur = 5200) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const heroRef = useRef<HTMLElement>(null);

  const go = useCallback((i: number) => {
    setIdx(i);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIdx((prev) => (prev + 1) % count);
    }, dur);
  }, [count, dur]);

  useEffect(() => {
    go(0);
    return () => clearTimeout(timerRef.current);
  }, [go]);

  // Pause when off-screen
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) clearTimeout(timerRef.current);
        else go(idx);
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [go, idx]);

  return { idx, go, heroRef };
}

/* ──────────────────────────────────────────────
   HERO
   ────────────────────────────────────────────── */
function HeroV2({ locale }: { locale: string }) {
  const { idx, go, heroRef } = useSlideshow(heroSlides.length);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    lineRefs.current.forEach((el, i) => {
      if (el) setTimeout(() => el.classList.add("in"), 120 + i * 140);
    });
  }, []);

  return (
    <section ref={heroRef} className="hero-v2">
      {/* Slides */}
      <div className="hero-v2-slides">
        {heroSlides.map((slide, i) => (
          <div key={i} className={`hero-v2-slide ${i === idx ? "is-active" : ""}`}>
            <div
              className="ph-tile ph-tile--dark absolute inset-[-4%] w-[108%] h-[108%]"
              data-label={t(slide.caption, locale)}
            />
          </div>
        ))}
      </div>

      <div className="hero-v2-scrim" />
      <div className="hero-v2-grain" />

      {/* Eyebrow */}
      <div className="absolute z-[4] font-mono text-[11px] tracking-[0.14em] uppercase text-white-80"
        style={{ top: "clamp(96px, 14vh, 140px)", left: "clamp(24px, 4vw, 64px)" }}>
        <span className="inline-block w-1.5 h-1.5 rounded-full mr-3.5" style={{ background: "#E2C5A0", boxShadow: "0 0 0 0 rgba(226,197,160,.7)", animation: "heroPulse 2.4s ease-out infinite" }} />
        <span>{t(L("Дніпро · з 2023", "Днепр · с 2023", "Dnipro · since 2023"), locale)}</span>
        <span className="inline-block w-[5px] h-[5px] rounded-full bg-champagne mx-3.5" />
        <span>{t(L("Центр довголіття та естетичної медицини", "Центр долголетия и эстетической медицины", "Longevity & Aesthetic Medicine Center"), locale)}</span>
      </div>

      {/* Type */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-[4] text-champagne" style={{ paddingInline: "clamp(24px, 4vw, 64px)", maxWidth: 980 }}>
        <h1 className="font-heading font-normal text-champagne" style={{ fontSize: "clamp(40px, 5.4vw, 80px)", lineHeight: 1.05, letterSpacing: "-0.02em", textWrap: "balance" }}>
          <span ref={(el) => { lineRefs.current[0] = el; }} className="mask-line-v2">
            <span><span className="font-body font-medium tracking-[0.06em]" style={{ fontSize: "0.92em" }}>GENEVITY</span><span className="text-white-60 mx-[0.18em] font-light">—</span>{t(L("центр", "центр", "center"), locale)}</span>
          </span>
          <span ref={(el) => { lineRefs.current[1] = el; }} className="mask-line-v2">
            <span><span className="text-white-40">{t(L("довголіття", "долголетия", "longevity"), locale)}</span> {t(L("та естетичної", "и эстетической", "& aesthetic"), locale)}</span>
          </span>
          <span ref={(el) => { lineRefs.current[2] = el; }} className="mask-line-v2">
            <span>{t(L("медицини у Дніпрі", "медицины в Днепре", "medicine in Dnipro"), locale)}</span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-white-60 max-w-[48ch]" style={{ fontSize: "clamp(13px, 1vw, 15px)", lineHeight: 1.6 }}
        >
          {t(L(
            "Персоналізовані програми здоров'я, відновлення та омолодження на основі сучасної діагностики та інноваційних технологій.",
            "Персонализированные программы здоровья, восстановления и омоложения на основе современной диагностики и инновационных технологий.",
            "Personalized health, recovery and rejuvenation programs based on modern diagnostics and innovative technologies."
          ), locale)}
        </motion.p>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex items-center gap-2.5 mt-7 text-white-80 text-[13px]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 opacity-90">
            <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
            <circle cx="12" cy="9" r="2.6" />
          </svg>
          {t(L("Дніпро, вул. Олеся Гончара, 12", "Днепр, ул. Олеся Гончара, 12", "Dnipro, Oles Honchar St. 12"), locale)}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7"
        >
          <Link
            href="#booking"
            className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-champagne text-sm border border-white-20 transition-all duration-[400ms] hover:bg-champagne hover:text-ink hover:border-champagne"
            style={{ background: "rgba(20,18,15,.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          >
            {t(L("Записатися на консультацію", "Записаться на консультацию", "Book a consultation"), locale)}
            <span className="w-3.5 h-px bg-current relative transition-transform duration-300 group-hover:translate-x-1">
              <span className="absolute right-0 -top-[3px] w-[7px] h-[7px] border-t border-r border-current rotate-45 origin-top-right" />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Scene caption */}
      <div className="absolute right-0 z-[4] text-right font-mono text-[10px] tracking-[0.18em] uppercase text-white-60 hidden md:block"
        style={{ right: "clamp(24px, 4vw, 64px)", bottom: "clamp(44px, 6vh, 72px)" }}>
        <span className="text-champagne text-[11px]">{String(idx + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}</span>
        <span className="block text-white-80 tracking-[0.08em] text-[11px] mt-1.5 max-w-[26ch]">{t(heroSlides[idx].caption, locale)}</span>
      </div>

      {/* Progress bars */}
      <div className="absolute left-0 right-0 bottom-0 z-[5] flex gap-1.5 pb-3.5" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`hero-v2-progress-item ${i === idx ? "is-active" : ""} ${i < idx ? "is-past" : ""}`}
            aria-label={`${t(L("Слайд", "Слайд", "Slide"), locale)} ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   MARQUEE
   ────────────────────────────────────────────── */
function MarqueeV2({ locale }: { locale: string }) {
  const items = marqueeItems.map((m) => t(m, locale));
  const track = [...items, ...items]; // duplicate for seamless loop
  return (
    <section className="py-16 border-t border-b border-black-10 overflow-hidden whitespace-nowrap bg-champagne" aria-hidden="true">
      <div className="marquee-v2-track">
        {track.map((item, i) => (
          <span key={i} className="font-heading text-ink inline-flex items-center gap-20" style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.02em" }}>
            {item}
            <span className="w-2 h-2 rounded-full bg-main flex-none" />
          </span>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   BENTO GRID
   ────────────────────────────────────────────── */
function BentoV2({ locale }: { locale: string }) {
  return (
    <section className="py-20 lg:py-28" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
      <div className="max-w-[1440px] mx-auto">
        <Reveal>
          <h2 className="font-heading text-ink mb-4" style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-0.025em" }}>
            {t(L("Один центр —", "Один центр —", "One center —"), locale)} <span className="text-black-40">{t(L("дев'ять напрямків роботи зі здоров'ям.", "девять направлений работы со здоровьем.", "nine directions of health work."), locale)}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="body-l text-muted max-w-[56ch] mb-12">
            {t(L(
              "Genevity поєднує діагностику, естетичну медицину та програми довголіття в одному просторі у центрі Дніпра — з власною лабораторією та ліцензією МОЗ України.",
              "Genevity объединяет диагностику, эстетическую медицину и программы долголетия в одном пространстве в центре Днепра — с собственной лабораторией и лицензией МОЗ Украины.",
              "Genevity combines diagnostics, aesthetic medicine and longevity programs in one space in the center of Dnipro — with its own laboratory and MOH Ukraine license."
            ), locale)}
          </p>
        </Reveal>

        <div className="bento-v2-grid">
          {/* Year */}
          <Reveal className="c-2 rounded-[var(--radius-card)] bg-champagne p-6 flex flex-col justify-between min-h-[220px]">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">{t(L("Рік заснування", "Год основания", "Founded"), locale)}</span>
            <span className="font-heading text-ink" style={{ fontSize: 96, lineHeight: 0.92, letterSpacing: "-0.03em" }}>2023</span>
            <div className="flex justify-between text-muted text-xs"><span>{t(L("3 роки практики", "3 года практики", "3 years of practice"), locale)}</span><span>{t(L("Дніпро", "Днепр", "Dnipro"), locale)}</span></div>
          </Reveal>

          {/* Tech count */}
          <Reveal delay={0.1} className="c-2 rounded-[var(--radius-card)] bg-surface-dark text-champagne p-6 flex flex-col justify-between min-h-[220px]">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-60">{t(L("Технологій", "Технологий", "Technologies"), locale)}</span>
            <div className="font-heading" style={{ fontSize: 96, lineHeight: 0.92, letterSpacing: "-0.03em" }}>27<span className="text-lg tracking-normal ml-2 text-white-60">{t(L("апаратів", "аппаратов", "devices"), locale)}</span></div>
            <div className="text-white-60 text-xs">Morpheus8 · EMFACE · Ultraformer</div>
          </Reveal>

          {/* Photo — address */}
          <Reveal delay={0.2} className="c-2 r-2 rounded-[var(--radius-card)] relative overflow-hidden min-h-[220px]">
            <div className="ph-tile ph-tile--dark absolute inset-0" data-label={t(L("ФОТО · фасад центру, бронзова табличка GENEVITY, вечірнє світло", "ФОТО · фасад центра, бронзовая табличка GENEVITY, вечерний свет", "PHOTO · center facade, bronze GENEVITY plaque, evening light"), locale)} />
            <div className="absolute inset-x-0 bottom-0 p-6 z-[2]" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(42,37,32,.75) 100%)" }}>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-60">{t(L("Адреса", "Адрес", "Address"), locale)}</span>
              <p className="font-heading text-champagne text-lg mt-1.5">{t(L("вул. Олеся Гончара, 12", "ул. Олеся Гончара, 12", "Oles Honchar St. 12"), locale)}</p>
              <p className="text-white-60 text-[13px] mt-2">{t(L("Дніпро · історичний центр", "Днепр · исторический центр", "Dnipro · historic center"), locale)}</p>
            </div>
          </Reveal>

          {/* Hours */}
          <Reveal className="c-2 rounded-[var(--radius-card)] bg-champagne-warm p-6 flex flex-col min-h-[220px]">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">{t(L("Графік роботи", "График работы", "Working hours"), locale)}</span>
            <div className="mt-auto flex flex-col gap-2 font-body text-sm">
              <div className="flex justify-between font-medium text-ink"><span>{t(L("Пн — Пт", "Пн — Пт", "Mon — Fri"), locale)}</span><span>09:00 — 21:00</span></div>
              <div className="flex justify-between text-muted"><span>{t(L("Сб", "Сб", "Sat"), locale)}</span><span>10:00 — 18:00</span></div>
              <div className="flex justify-between text-muted"><span>{t(L("Нд", "Вс", "Sun"), locale)}</span><span>{t(L("за записом", "по записи", "by appointment"), locale)}</span></div>
            </div>
          </Reveal>

          {/* Directions */}
          <Reveal delay={0.1} className="c-2 rounded-[var(--radius-card)] bg-champagne p-6 flex flex-col min-h-[220px]">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">{t(L("Напрямки", "Направления", "Directions"), locale)}</span>
            <ul className="mt-auto flex flex-col gap-1.5">
              {bentoDirections.map((d, i) => (
                <li key={i} className="flex justify-between text-sm text-ink"><span>{t(d, locale)}</span><span className="text-muted">{String(12 - i * 2).padStart(2, "0")}</span></li>
              ))}
            </ul>
          </Reveal>

          {/* Team */}
          <Reveal className="c-2 rounded-[var(--radius-card)] bg-champagne p-6 flex flex-col justify-between min-h-[220px]">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">{t(L("Команда", "Команда", "Team"), locale)}</span>
            <div className="font-heading text-ink" style={{ fontSize: 72, lineHeight: 0.92, letterSpacing: "-0.03em" }}>12<span className="text-lg tracking-normal ml-2 text-muted">{t(L("лікарів", "врачей", "physicians"), locale)}</span></div>
            <p className="text-muted text-[13px]">{t(L("Дерматологи, ендокринологи, терапевти, косметологи, нутриціологи.", "Дерматологи, эндокринологи, терапевты, косметологи, нутрициологи.", "Dermatologists, endocrinologists, therapists, cosmetologists, nutritionists."), locale)}</p>
          </Reveal>

          {/* License */}
          <Reveal delay={0.1} className="c-2 rounded-[var(--radius-card)] bg-surface-dark text-champagne p-6 flex flex-col justify-between min-h-[220px]">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-60">{t(L("Ліцензія", "Лицензия", "License"), locale)}</span>
            <div>
              <p className="font-heading text-xl mt-3.5">{t(L("МОЗ України", "МОЗ Украины", "MOH Ukraine"), locale)}</p>
              <p className="text-white-60 text-[13px] mt-2">№ 1296 {t(L("від", "от", "from"), locale)} 14.08.2025</p>
            </div>
            <div className="flex justify-between text-white-60 text-xs"><span>{t(L("Акредитовано", "Аккредитовано", "Accredited"), locale)}</span><span>2025</span></div>
          </Reveal>

          {/* Contacts */}
          <Reveal delay={0.2} className="c-2 rounded-[var(--radius-card)] bg-champagne-warm p-6 flex flex-col min-h-[220px]">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">{t(L("Зв'язок", "Связь", "Contact"), locale)}</span>
            <ul className="mt-auto flex flex-col gap-1.5 text-sm">
              <li className="flex justify-between"><a href="tel:+380730000150" className="text-ink">+380 73 000 0150</a><span className="text-muted">Kyivstar</span></li>
              <li className="flex justify-between"><a href="tel:+380930000150" className="text-ink">+380 93 000 0150</a><span className="text-muted">Life</span></li>
              <li className="flex justify-between"><a href="https://instagram.com/genevity.center" target="_blank" rel="noopener" className="text-ink">@genevity.center</a><span className="text-muted">Instagram</span></li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   PHILOSOPHY
   ────────────────────────────────────────────── */
function PhilosophyV2({ locale }: { locale: string }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: visualRef, offset: ["start end", "end start"] });
  const clipInset = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  return (
    <section className="bg-champagne" style={{ padding: "clamp(80px, 14vh, 160px) 0" }}>
      <div className="max-w-[1440px] mx-auto" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
        <SectionIndex>01 / {t(L("Про центр", "О центре", "About"), locale)}</SectionIndex>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
          <Reveal>
            <h2 className="font-heading text-ink" style={{ fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 1.02, letterSpacing: "-0.02em", textWrap: "balance" }}>
              {t(L("Медицина,", "Медицина,", "Medicine,"), locale)} <span className="text-black-40">{t(L("інновації", "инновации", "innovations"), locale)}</span>
              {" "}{t(L("та індивідуальний", "и индивидуальный", "and individual"), locale)} <span className="text-black-40">{t(L("підхід.", "подход.", "approach."), locale)}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="body-l text-muted max-w-[44ch]">
              {t(L(
                "Genevity — центр довголіття та якості життя, де створюють персоналізовані програми здоров'я, відновлення й омолодження. Ми поєднуємо естетичну медицину та напрям довголіття.",
                "Genevity — центр долголетия и качества жизни, где создают персонализированные программы здоровья, восстановления и омоложения. Мы объединяем эстетическую медицину и направление долголетия.",
                "Genevity — a longevity and quality of life center that creates personalized health, recovery and rejuvenation programs. We combine aesthetic medicine and longevity."
              ), locale)}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-14 border-t border-ink">
          {philosophyCols.map((col, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <h3 className="font-heading text-[22px] text-ink mb-3.5" style={{ letterSpacing: "-0.01em" }}>{t(col.title, locale)}</h3>
              <p className="text-muted text-[15px] leading-relaxed">{t(col.desc, locale)}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Scroll-clip mask reveal */}
      <div ref={visualRef} className="relative my-24 lg:my-32" style={{ height: "260vh", marginInline: "clamp(12px, 2vw, 32px)" }}>
        <div className="sticky top-0 h-screen grid place-items-center overflow-hidden">
          <motion.div
            className="w-full h-full relative overflow-hidden"
            style={{ clipPath: useTransform(clipInset, (v) => `inset(${v}% ${v}% ${v}% ${v}%)`) }}
          >
            <div className="ph-tile ph-tile--dark absolute inset-0" data-label={t(L("ФОТО — крупний план рук лікаря на плечі пацієнтки, вольфрамове світло, профіль", "ФОТО — крупный план рук врача на плече пациентки, вольфрамовый свет, профиль", "PHOTO — close-up of doctor's hands on patient's shoulder, tungsten light, profile"), locale)} />
            <div className="absolute inset-0 grid place-items-center text-center px-[8vw] text-champagne z-[2]">
              <div>
                <span className="block font-mono text-[11px] tracking-[0.24em] uppercase text-white-60 mb-8">— {t(L("якість життя", "качество жизни", "quality of life"), locale)}</span>
                <p className="font-heading" style={{ fontSize: "clamp(32px, 5vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
                  {t(L("Мета — не нове обличчя,", "Цель — не новое лицо,", "The goal is not a new face,"), locale)}<br />
                  {t(L("а обличчя, що", "а лицо, которое", "but a face that"), locale)} <span className="text-white-40">{t(L("гарно несе свої роки.", "красиво несет свои годы.", "wears its years well."), locale)}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   METHOD
   ────────────────────────────────────────────── */
function MethodV2({ locale }: { locale: string }) {
  return (
    <section className="bg-champagne" style={{ padding: "clamp(80px, 14vh, 160px) 0" }}>
      <div className="max-w-[1440px] mx-auto" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
        <SectionIndex>02 / {t(L("Підхід", "Подход", "Method"), locale)}</SectionIndex>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
          <Reveal>
            <h2 className="font-heading text-ink" style={{ fontSize: "clamp(36px, 5.5vw, 80px)", lineHeight: 0.92, letterSpacing: "-0.025em", maxWidth: "12ch" }}>
              {t(L("Чотири етапи, одна тривала", "Четыре этапа, одна длительная", "Four stages, one lasting"), locale)} <span className="text-black-40">{t(L("програма.", "программа.", "program."), locale)}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="body-l text-muted max-w-[44ch]">
              {t(L(
                "Чітка послідовність, яку проходять у власному темпі. Кожен етап живить наступний — і все разом вимірюється роками.",
                "Четкая последовательность, которую проходят в собственном темпе. Каждый этап питает следующий — и все вместе измеряется годами.",
                "A clear sequence you go through at your own pace. Each stage nourishes the next — and everything is measured in years."
              ), locale)}
            </p>
          </Reveal>
        </div>

        <ol className="border-t border-ink">
          {methodSteps.map((step, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <li className="method-v2-row group">
                <div className="font-mono text-xs tracking-[0.1em] text-muted pt-2">{step.num}</div>
                <h3 className="font-heading text-ink" style={{ fontSize: "clamp(24px, 3vw, 40px)", letterSpacing: "-0.02em", lineHeight: 1 }}>{t(step.title, locale)}</h3>
                <div className="text-muted text-[15px] leading-relaxed max-w-[48ch] hidden md:block">{t(step.desc, locale)}</div>
                <div className="justify-self-end w-10 h-10 border border-black-20 rounded-full grid place-items-center transition-all duration-300 group-hover:bg-ink group-hover:text-champagne group-hover:border-ink hidden md:grid">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10m0 0L6 1m5 5L6 11" stroke="currentColor" /></svg>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   TECHNOLOGY — pinned horizontal scroll
   ────────────────────────────────────────────── */
function TechnologyV2({ locale }: { locale: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end end"] });

  const [trackWidth, setTrackWidth] = useState(0);
  useEffect(() => {
    if (trackRef.current) setTrackWidth(trackRef.current.scrollWidth - window.innerWidth + 48);
    const handler = () => { if (trackRef.current) setTrackWidth(trackRef.current.scrollWidth - window.innerWidth + 48); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const x = useTransform(scrollYProgress, [0, 1], [0, -trackWidth]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="bg-surface-dark text-champagne">
      <div className="max-w-[1440px] mx-auto" style={{ padding: "clamp(80px, 14vh, 160px) clamp(24px, 4vw, 64px) clamp(40px, 8vh, 80px)" }}>
        <SectionIndex light>03 / {t(L("Апаратні рішення", "Аппаратные решения", "Hardware solutions"), locale)}</SectionIndex>
        <Reveal>
          <h2 className="font-heading text-champagne mb-10" style={{ fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 0.96, letterSpacing: "-0.025em", maxWidth: "14ch" }}>
            {t(L("Технології, що", "Технологии, которые", "Technologies that"), locale)} <span className="text-main-lighter">{t(L("тихо", "тихо", "quietly"), locale)}</span> {t(L("роблять виняткову роботу.", "делают исключительную работу.", "do exceptional work."), locale)}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-white-60 text-base leading-relaxed max-w-[520px]">
            {t(L(
              "Короткий, ретельно відібраний набір апаратів — кожен з них обраний за доказами, комфортом та тривалістю результату.",
              "Короткий, тщательно отобранный набор аппаратов — каждый из них выбран за доказательства, комфорт и длительность результата.",
              "A short, carefully curated set of devices — each chosen for evidence, comfort and lasting results."
            ), locale)}
          </p>
        </Reveal>
      </div>

      <div ref={scrollRef} style={{ height: "400vh", position: "relative" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <motion.div ref={trackRef} className="flex gap-8" style={{ x, paddingInline: "clamp(24px, 4vw, 64px)" }}>
            {techCards.map((card, i) => (
              <article key={i} className="tech-v2-card">
                <div className="flex-1 relative overflow-hidden">
                  <div className="ph-tile ph-tile--dark absolute inset-0" data-label={card.title} style={{ borderRadius: 0 }} />
                </div>
                <div className="p-7 border-t border-white-10">
                  <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-main-lighter mb-3.5">
                    <span>{t(card.cat, locale)}</span>
                    <span>{String(i + 1).padStart(2, "0")} / {String(techCards.length).padStart(2, "0")}</span>
                  </div>
                  <h3 className="font-heading text-[28px] text-champagne mb-2.5" style={{ letterSpacing: "-0.01em" }}>{card.title}</h3>
                  <p className="text-white-60 text-[13px] leading-relaxed">{t(card.desc, locale)}</p>
                </div>
              </article>
            ))}
          </motion.div>

          {/* Progress bar */}
          <div className="absolute bottom-9 left-0 right-0 flex items-center gap-4 font-mono text-[11px] tracking-[0.1em] uppercase text-white-60 z-[2]" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
            <span>{t(L("Апаратна програма", "Аппаратная программа", "Hardware programme"), locale)}</span>
            <div className="flex-1 h-px bg-white-20 relative">
              <motion.span className="absolute inset-y-0 left-0 bg-champagne" style={{ width: progressWidth }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   OUTCOMES
   ────────────────────────────────────────────── */
function OutcomesV2({ locale }: { locale: string }) {
  return (
    <section className="bg-champagne" style={{ padding: "clamp(80px, 14vh, 160px) 0" }}>
      <div className="max-w-[1440px] mx-auto" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
        <SectionIndex>04 / {t(L("У числах", "В числах", "In numbers"), locale)}</SectionIndex>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
          <Reveal>
            <h2 className="font-heading text-ink" style={{ fontSize: "clamp(36px, 5.5vw, 80px)", lineHeight: 0.92, letterSpacing: "-0.025em", maxWidth: "14ch" }}>
              {t(L("Тиха практика,", "Тихая практика,", "Quiet practice,"), locale)} <span className="text-black-40">{t(L("старанно виміряна.", "старательно измеренная.", "carefully measured."), locale)}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="body-l text-muted max-w-[44ch]">
              {t(L("Що ми рахуємо — і що навмисно рахувати не станемо. Чесний підсумок роботи.", "Что мы считаем — и что намеренно считать не станем. Честный итог работы.", "What we count — and what we deliberately won't. An honest summary of our work."), locale)}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="outcomes-v2-grid">
        {outcomeStats.map((stat, i) => (
          <Reveal key={i} delay={i * 0.1} className="outcomes-v2-cell">
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">{t(stat.label, locale)}</span>
            <div>
              <span className="font-heading text-ink" style={{ fontSize: "clamp(56px, 8vw, 120px)", lineHeight: 0.92, letterSpacing: "-0.03em" }}>
                {stat.value}
                {stat.sup && <sup className="text-[0.36em] text-main ml-1 align-super">{stat.sup}</sup>}
              </span>
              <p className="text-black-80 text-sm leading-relaxed mt-4">{t(stat.desc, locale)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   DOCTORS
   ────────────────────────────────────────────── */
function DoctorsV2({ locale }: { locale: string }) {
  return (
    <section className="bg-champagne" style={{ padding: "clamp(80px, 14vh, 160px) 0" }}>
      <div className="max-w-[1440px] mx-auto" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
        <SectionIndex>05 / {t(L("Команда лікарів", "Команда врачей", "Medical team"), locale)}</SectionIndex>

        <div className="doctors-v2-main">
          {/* Feature portrait */}
          <Reveal className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
            <div className="ph-tile absolute inset-0 bg-champagne-darker" data-label={t(L("ФОТО — Віктор Бєлянушкін, поясний портрет, діловий світлий одяг, прямий погляд · 4:5", "ФОТО — Виктор Белянушкин, поясной портрет, деловой светлый одяг, прямой взгляд · 4:5", "PHOTO — Viktor Bielianushkin, waist portrait, business casual, direct gaze · 4:5"), locale)} style={{ borderRadius: 0 }} />
            <div className="absolute inset-x-0 bottom-0 p-8 text-champagne z-[2]" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(42,37,32,.75) 100%)" }}>
              <h3 className="font-heading text-champagne" style={{ fontSize: "clamp(28px, 3vw, 40px)", letterSpacing: "-0.01em" }}>{t(L("Віктор Бєлянушкін", "Виктор Белянушкин", "Viktor Bielianushkin"), locale)}</h3>
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-white-80 mt-2">{t(L("Директор · дерматолог, косметолог · 20 років", "Директор · дерматолог, косметолог · 20 лет", "Director · dermatologist, cosmetologist · 20 years"), locale)}</div>
            </div>
          </Reveal>

          {/* Side — title + list */}
          <Reveal delay={0.2}>
            <h3 className="font-heading text-ink mb-8" style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.96, letterSpacing: "-0.025em" }}>
              {t(L("Дванадцять спеціалістів,", "Двенадцать специалистов,", "Twelve specialists,"), locale)} <span className="text-main">{t(L("одна картка.", "одна карта.", "one record."), locale)}</span>
            </h3>
            <p className="body-l text-muted">
              {t(L(
                "Кожну програму Genevity підписує один лідер-лікар і тихо переглядає уся команда. Ваша картка мандрує разом з вами по всіх кабінетах центру.",
                "Каждую программу Genevity подписывает один лидер-врач и тихо пересматривает вся команда. Ваша карта путешествует вместе с вами по всем кабинетам центра.",
                "Every Genevity program is signed by one lead physician and quietly reviewed by the entire team. Your record travels with you through every office."
              ), locale)}
            </p>

            <ul className="border-t border-ink mt-10">
              {doctorsList.map((doc) => (
                <li key={doc.idx} className="py-5 border-b border-black-10 grid gap-4 items-center cursor-pointer transition-[padding] duration-300 hover:pl-2" style={{ gridTemplateColumns: "40px 1fr auto auto" }}>
                  <span className="font-mono text-[11px] text-muted">{doc.idx}</span>
                  <span className="font-heading text-ink text-lg">{t(doc.name, locale)}</span>
                  <span className="text-muted text-xs tracking-wide hidden md:block">{t(doc.role, locale)}</span>
                  <span className="font-mono text-[11px] text-muted tracking-[0.1em]">{typeof doc.years === "string" ? doc.years : t(doc.years, locale)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   JOURNAL
   ────────────────────────────────────────────── */
function JournalV2({ locale }: { locale: string }) {
  return (
    <section className="bg-champagne" style={{ padding: "clamp(80px, 14vh, 160px) 0" }}>
      <div className="max-w-[1440px] mx-auto" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
        <SectionIndex>06 / {t(L("Журнал", "Журнал", "Journal"), locale)}</SectionIndex>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
          <Reveal>
            <h2 className="font-heading text-ink" style={{ fontSize: "clamp(36px, 5.5vw, 80px)", lineHeight: 0.92, letterSpacing: "-0.025em", maxWidth: "14ch" }}>
              {t(L("Нотатки з", "Заметки из", "Notes from"), locale)} <span className="text-black-40">{t(L("практики.", "практики.", "practice."), locale)}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="body-l text-muted max-w-[44ch]">
              {t(L("Неспішні тексти про науку довголіття, естетичну поміркованість і те, про що цього сезону питають наші пацієнти.", "Неспешные тексты о науке долголетия, эстетической умеренности и том, о чем в этом сезоне спрашивают наши пациенты.", "Unhurried texts about the science of longevity, aesthetic moderation and what our patients are asking about this season."), locale)}
            </p>
          </Reveal>
        </div>

        <div className="journal-v2-grid">
          {journalCards.map((card, i) => (
            <Reveal key={i} delay={i * 0.1} className="flex flex-col gap-5 cursor-pointer group">
              <div className="overflow-hidden relative" style={{ aspectRatio: card.aspect, marginTop: i === 1 ? 80 : i === 2 ? 140 : 0 }}>
                <div className="ph-tile absolute inset-0 bg-champagne-dark transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" data-label={t(card.title, locale)} style={{ borderRadius: 0 }} />
              </div>
              <div className="flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase text-muted">
                <span>{t(card.tag, locale)}</span>
                <span>{card.date}</span>
              </div>
              <h3 className="font-heading text-ink leading-tight" style={{ fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.01em" }}>{t(card.title, locale)}</h3>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   VISIT / BOOKING
   ────────────────────────────────────────────── */
function VisitV2({ locale }: { locale: string }) {
  const [activeChip, setActiveChip] = useState(1);
  const chips = [
    L("Програма довголіття", "Программа долголетия", "Longevity program"),
    L("Естетична медицина", "Эстетическая медицина", "Aesthetic medicine"),
    L("Апаратні процедури", "Аппаратные процедуры", "Apparatus procedures"),
    L("Діагностика", "Диагностика", "Diagnostics"),
  ];

  return (
    <section id="booking" className="bg-surface-dark text-champagne" style={{ padding: "clamp(80px, 14vh, 160px) 0" }}>
      <div className="max-w-[1440px] mx-auto" style={{ paddingInline: "clamp(24px, 4vw, 64px)" }}>
        <div className="visit-v2-inner">
          <div>
            <SectionIndex light>07 / {t(L("Запис", "Запись", "Booking"), locale)}</SectionIndex>
            <Reveal>
              <h2 className="font-heading text-champagne mb-8" style={{ fontSize: "clamp(48px, 7vw, 120px)", lineHeight: 0.92, letterSpacing: "-0.025em" }}>
                {t(L("Почніть з", "Начните с", "Start with"), locale)} <span className="text-main-lighter">{t(L("тихої розмови.", "тихого разговора.", "a quiet conversation."), locale)}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-white-60 text-[17px] leading-relaxed max-w-[44ch] mb-10">
                {t(L(
                  "Перший візит — це консультація. Без процедур, без тиску. Ми слухаємо, дивимося на ваші показники — і лише потім разом вирішуємо, чи підходить вам програма.",
                  "Первый визит — это консультация. Без процедур, без давления. Мы слушаем, смотрим на ваши показатели — и только потом вместе решаем, подходит ли вам программа.",
                  "The first visit is a consultation. No procedures, no pressure. We listen, look at your indicators — and only then decide together whether the program suits you."
                ), locale)}
              </p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 pt-10 border-t border-white-10">
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 block mb-2.5">{t(L("Адреса", "Адрес", "Address"), locale)}</span>
                <a href="https://maps.google.com/?q=Dnipro,+Oles+Honchar+St.+12" target="_blank" rel="noopener" className="font-heading text-xl text-champagne hover:text-main-lighter transition-colors">{t(L("Дніпро, вул. Олеся Гончара, 12", "Днепр, ул. Олеся Гончара, 12", "Dnipro, Oles Honchar St. 12"), locale)}</a>
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 block mb-2.5">{t(L("Години", "Часы", "Hours"), locale)}</span>
                <span className="font-heading text-xl">{t(L("Пн – Нд · 08:00 – 20:00", "Пн – Вс · 08:00 – 20:00", "Mon – Sun · 08:00 – 20:00"), locale)}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 block mb-2.5">{t(L("Телефон", "Телефон", "Phone"), locale)}</span>
                <a href="tel:+380730000150" className="font-heading text-xl hover:text-main-lighter transition-colors">+380 73 000 0150</a>
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 block mb-2.5">Instagram</span>
                <a href="https://instagram.com/genevity.center" target="_blank" rel="noopener" className="font-heading text-xl hover:text-main-lighter transition-colors">@genevity.center</a>
              </div>
            </div>
          </div>

          {/* Form */}
          <Reveal delay={0.2}>
            <form className="bg-surface-dark-elevated border border-white-10 p-10 rounded flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
              <span className="font-body font-medium text-[11px] tracking-[0.2em] uppercase text-white-40">{t(L("Заявка на консультацію", "Заявка на консультацию", "Consultation request"), locale)}</span>

              <div className="flex flex-col gap-1.5 pb-3.5 border-b border-white-20 focus-within:border-champagne transition-colors">
                <label className="font-mono text-[10px] tracking-[0.18em] uppercase text-white-40">{t(L("Ім'я", "Имя", "Name"), locale)}</label>
                <input type="text" placeholder={t(L("Ваше повне ім'я", "Ваше полное имя", "Your full name"), locale)} className="bg-transparent border-0 text-champagne text-base outline-none placeholder:text-white-20" />
              </div>

              <div className="flex flex-col gap-1.5 pb-3.5 border-b border-white-20 focus-within:border-champagne transition-colors">
                <label className="font-mono text-[10px] tracking-[0.18em] uppercase text-white-40">{t(L("Телефон", "Телефон", "Phone"), locale)}</label>
                <input type="tel" placeholder="+380 ..." className="bg-transparent border-0 text-champagne text-base outline-none placeholder:text-white-20" />
              </div>

              <div className="flex flex-col gap-1.5 pb-3.5 border-b border-white-20">
                <label className="font-mono text-[10px] tracking-[0.18em] uppercase text-white-40">{t(L("Напрямок", "Направление", "Direction"), locale)}</label>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {chips.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveChip(i)}
                      className={`px-3.5 py-2 rounded-full border text-xs tracking-wide transition-all cursor-pointer ${i === activeChip ? "bg-champagne text-ink border-champagne" : "border-white-20 text-white-60 hover:bg-champagne hover:text-ink hover:border-champagne"}`}
                    >
                      {t(chip, locale)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pb-3.5 border-b border-white-20">
                <label className="font-mono text-[10px] tracking-[0.18em] uppercase text-white-40">{t(L("Зручний час", "Удобное время", "Preferred time"), locale)}</label>
                <select className="bg-transparent border-0 text-champagne text-base outline-none appearance-none cursor-pointer">
                  <option>{t(L("Ранок · 09:00 – 12:00", "Утро · 09:00 – 12:00", "Morning · 09:00 – 12:00"), locale)}</option>
                  <option>{t(L("День · 12:00 – 16:00", "День · 12:00 – 16:00", "Afternoon · 12:00 – 16:00"), locale)}</option>
                  <option>{t(L("Вечір · 16:00 – 20:00", "Вечер · 16:00 – 20:00", "Evening · 16:00 – 20:00"), locale)}</option>
                </select>
              </div>

              <button type="submit" className="mt-2 flex items-center justify-between px-6 py-4 rounded-full bg-champagne text-ink text-[13px] font-medium tracking-[0.12em] uppercase transition-all hover:bg-champagne-dark btn-press cursor-pointer">
                {t(L("Записатись", "Записаться", "Book"), locale)}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10m0 0L6 1m5 5L6 11" stroke="currentColor" /></svg>
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FOOTER
   ────────────────────────────────────────────── */
function FooterV2({ locale }: { locale: string }) {
  return (
    <footer className="bg-surface-dark text-champagne border-t border-white-10" style={{ padding: "80px clamp(24px, 4vw, 64px) 40px" }}>
      <div className="max-w-[1440px] mx-auto">
        <div className="flex justify-between items-center">
          <span className="font-body font-medium text-[11px] tracking-[0.24em] uppercase text-white-40">Genevity · {t(L("Центр довголіття", "Центр долголетия", "Longevity Center"), locale)} · {t(L("Дніпро, Україна", "Днепр, Украина", "Dnipro, Ukraine"), locale)}</span>
          <span className="font-mono text-[11px] text-white-40">EST. MMXXIII</span>
        </div>

        <h3 className="footer-v2-giant text-champagne my-16 lg:my-20">
          Geneva<span className="text-main-lighter">&</span>vity
        </h3>

        <div className="footer-v2-cols pt-10 border-t border-white-10">
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 mb-4">{t(L("Про центр", "О центре", "About"), locale)}</h5>
            <p className="text-white-60 text-sm leading-relaxed max-w-[36ch]">
              {t(L(
                "Центр довголіття та естетичної медицини, побудований на глибині діагностики, поміркованості та довгих розмовах з людьми, які нам довіряють.",
                "Центр долголетия и эстетической медицины, построенный на глубине диагностики, умеренности и долгих разговорах с людьми, которые нам доверяют.",
                "A longevity and aesthetic medicine center built on deep diagnostics, moderation and long conversations with people who trust us."
              ), locale)}
            </p>
            <p className="font-mono text-[11px] text-white-20 mt-6">{t(L("МОЗ України · Ліцензія № 1296 · 14.08.2025", "МОЗ Украины · Лицензия № 1296 · 14.08.2025", "MOH Ukraine · License No. 1296 · 14.08.2025"), locale)}</p>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 mb-4">{t(L("Програма", "Программа", "Program"), locale)}</h5>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/about" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("Про центр", "О центре", "About"), locale)}</Link></li>
              <li><Link href="/services" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("Послуги", "Услуги", "Services"), locale)}</Link></li>
              <li><Link href="/prices" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("Ціни", "Цены", "Prices"), locale)}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 mb-4">{t(L("Центр", "Центр", "Center"), locale)}</h5>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/doctors" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("Лікарі", "Врачи", "Doctors"), locale)}</Link></li>
              <li><Link href="/laboratory" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("Лабораторія", "Лаборатория", "Laboratory"), locale)}</Link></li>
              <li><Link href="/stationary" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("Стаціонар", "Стационар", "Stationary"), locale)}</Link></li>
              <li><Link href="/contacts" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("Контакти", "Контакты", "Contacts"), locale)}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white-40 mb-4">{t(L("Контакти", "Контакты", "Contacts"), locale)}</h5>
            <ul className="flex flex-col gap-2.5">
              <li><a href="tel:+380730000150" className="text-white-80 text-sm hover:text-champagne transition-colors">+380 73 000 0150</a></li>
              <li><a href="tel:+380930000150" className="text-white-80 text-sm hover:text-champagne transition-colors">+380 93 000 0150</a></li>
              <li><a href="https://instagram.com/genevity.center" target="_blank" rel="noopener" className="text-white-80 text-sm hover:text-champagne transition-colors">@genevity.center</a></li>
              <li><a href="https://maps.google.com/?q=Dnipro,+Oles+Honchar+St.+12" target="_blank" rel="noopener" className="text-white-80 text-sm hover:text-champagne transition-colors">{t(L("вул. Олеся Гончара, 12", "ул. Олеся Гончара, 12", "Oles Honchar St. 12"), locale)}</a></li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between pt-8 mt-10 border-t border-white-10 font-mono text-[10px] tracking-[0.15em] uppercase text-white-40">
          <span>© 2026 Genevity. {t(L("Всі права захищено.", "Все права защищены.", "All rights reserved."), locale)}</span>
          <span>
            <Link href="/legal/privacy" className="hover:text-champagne transition-colors">{t(L("Конфіденційність", "Конфиденциальность", "Privacy"), locale)}</Link>
            {" · "}
            <Link href="/legal/terms" className="hover:text-champagne transition-colors">{t(L("Умови", "Условия", "Terms"), locale)}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   MAIN EXPORT
   ────────────────────────────────────────────── */
interface Props {
  locale: Locale;
}

export default function HomeV2Page({ locale }: Props) {
  return (
    <>
      <MegaMenuHeader variant="transparent" position="absolute" />
      <HeroV2 locale={locale} />
      <MarqueeV2 locale={locale} />
      <BentoV2 locale={locale} />
      <PhilosophyV2 locale={locale} />
      <MethodV2 locale={locale} />
      <TechnologyV2 locale={locale} />
      <OutcomesV2 locale={locale} />
      <DoctorsV2 locale={locale} />
      <JournalV2 locale={locale} />
      <VisitV2 locale={locale} />
      <FooterV2 locale={locale} />
    </>
  );
}
