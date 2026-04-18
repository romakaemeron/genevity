"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { ChevronRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import { ui } from "@/lib/ui-strings";

interface Props {
  locale: Locale;
}

const L = (ua: string, ru: string, en: string) => ({ ua, ru, en });
const t = (obj: { ua: string; ru: string; en: string }, locale: string) =>
  obj[locale as "ua" | "ru" | "en"] || obj.ua;

interface PriceCategory {
  key: string;
  label: { ua: string; ru: string; en: string };
  link: string;
  items: { name: { ua: string; ru: string; en: string }; price: string }[];
}

const priceCategories: PriceCategory[] = [
  {
    key: "consultations", label: L("Консультації лікарів", "Консультации врачей", "Doctor Consultations"), link: "/doctors",
    items: [
      { name: L("Консультація косметолога", "Консультация косметолога", "Cosmetologist consultation"), price: "950" },
      { name: L("Консультація дерматолога", "Консультация дерматолога", "Dermatologist consultation"), price: "950" },
      { name: L("Консультація ендокринолога", "Консультация эндокринолога", "Endocrinologist consultation"), price: "950" },
      { name: L("Консультація гінеколога", "Консультация гинеколога", "Gynecologist consultation"), price: "950" },
      { name: L("Консультація гастроентеролога", "Консультация гастроэнтеролога", "Gastroenterologist consultation"), price: "950" },
      { name: L("Консультація подолога", "Консультация подолога", "Podiatrist consultation"), price: "500" },
      { name: L("Консультація дієтолога", "Консультация диетолога", "Dietitian consultation"), price: "1 000" },
    ],
  },
  {
    key: "apparatus", label: L("Апаратні процедури", "Аппаратные процедуры", "Apparatus Procedures"), link: "/services/apparatus-cosmetology",
    items: [
      { name: L("SMAS-ліфтинг Ultraformer (full face)", "SMAS-лифтинг Ultraformer (full face)", "SMAS lifting Ultraformer (full face)"), price: "40 000" },
      { name: L("EMFACE (чоло)", "EMFACE (лоб)", "EMFACE (forehead)"), price: "5 000" },
      { name: L("EMSCULPT NEO (1 зона)", "EMSCULPT NEO (1 зона)", "EMSCULPT NEO (1 zone)"), price: "4 500" },
      { name: L("HydraFacial Express", "HydraFacial Express", "HydraFacial Express"), price: "4 000" },
      { name: L("HydraFacial Delux + LED", "HydraFacial Delux + LED", "HydraFacial Delux + LED"), price: "4 900" },
      { name: L("Exion фракційний RF (обличчя)", "Exion фракционный RF (лицо)", "Exion fractional RF (face)"), price: "14 500" },
      { name: L("Volnewmer (full face)", "Volnewmer (full face)", "Volnewmer (full face)"), price: "75 000" },
    ],
  },
  {
    key: "injectable", label: L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable Cosmetology"), link: "/services/injectable-cosmetology",
    items: [
      { name: L("Ботулінотерапія (верхня третина)", "Ботулинотерапия (верхняя треть)", "Botulinum therapy (upper third)"), price: "9 000" },
      { name: L("Ботулінотерапія (повне обличчя + шия)", "Ботулинотерапия (полное лицо + шея)", "Botulinum therapy (full face + neck)"), price: "20 000" },
      { name: L("Juvederm Volift / Vollume", "Juvederm Volift / Vollume", "Juvederm Volift / Vollume"), price: "10 800" },
      { name: L("Біоревіталізація Ialest 2 мл", "Биоревитализация Ialest 2 мл", "Biorevitalization Ialest 2ml"), price: "4 500" },
      { name: L("Rejuran Healer 2 мл", "Rejuran Healer 2 мл", "Rejuran Healer 2ml"), price: "8 900" },
      { name: L("Екзосоми", "Экзосомы", "Exosomes"), price: "14 000" },
      { name: L("PolyPhil", "PolyPhil", "PolyPhil"), price: "7 500" },
    ],
  },
  {
    key: "laser", label: L("Лазерна епіляція", "Лазерная эпиляция", "Laser Hair Removal"), link: "/services/laser-hair-removal",
    items: [
      { name: L("Верхня губа", "Верхняя губа", "Upper lip"), price: "200" },
      { name: L("Пахви", "Подмышки", "Underarms"), price: "400" },
      { name: L("Повне бікіні (жін.)", "Полное бикини (жен.)", "Full bikini (women)"), price: "950" },
      { name: L("Ноги повністю (жін.)", "Ноги полностью (жен.)", "Full legs (women)"), price: "1 800" },
      { name: L("Обличчя (чол.)", "Лицо (муж.)", "Face (men)"), price: "1 250" },
      { name: L("Повне бікіні (чол.)", "Полное бикини (муж.)", "Full bikini (men)"), price: "1 500" },
    ],
  },
  {
    key: "diagnostics", label: L("Діагностичні послуги", "Диагностические услуги", "Diagnostic Services"), link: "/laboratory",
    items: [
      { name: L("УЗД щитоподібної залози", "УЗД щитовидной железы", "Thyroid ultrasound"), price: "600" },
      { name: L("УЗД ОЧП", "УЗД ОБП", "Abdominal ultrasound"), price: "800" },
      { name: L("Ехокардіографія", "Эхокардиография", "Echocardiography"), price: "800" },
      { name: L("Еластографія печінки", "Эластография печени", "Liver elastography"), price: "900" },
      { name: L("Діагностика тіла InBody", "Диагностика тела InBody", "InBody body diagnostics"), price: "500" },
      { name: L("Діагностика шкіри VeraFace", "Диагностика кожи VeraFace", "VeraFace skin diagnostics"), price: "500" },
    ],
  },
  {
    key: "podology", label: L("Подологія", "Подология", "Podology"), link: "/services/podology",
    items: [
      { name: L("Медичний манікюр", "Медицинский маникюр", "Medical manicure"), price: "700" },
      { name: L("Подологічна обробка 1 кат.", "Подологическая обработка 1 кат.", "Podological treatment cat. 1"), price: "800" },
      { name: L("Подологічна обробка 2 кат.", "Подологическая обработка 2 кат.", "Podological treatment cat. 2"), price: "1 100" },
      { name: L("Врослий ніготь 1-2 ст.", "Вросший ноготь 1-2 ст.", "Ingrown nail grade 1-2"), price: "800" },
      { name: L("Корекційна система (1 ніготь)", "Коррекционная система (1 ноготь)", "Correction system (1 nail)"), price: "1 500" },
    ],
  },
];

export default function PricesPageComponent({ locale }: Props) {
  const [activeCategory, setActiveCategory] = useState("consultations");
  const [search, setSearch] = useState("");

  const activeCat = priceCategories.find((c) => c.key === activeCategory)!;

  const filteredItems = search
    ? priceCategories.flatMap((cat) =>
        cat.items
          .filter((item) => t(item.name, locale).toLowerCase().includes(search.toLowerCase()))
          .map((item) => ({ ...item, category: t(cat.label, locale) }))
      )
    : [];

  return (
    <>
      <section className="bg-champagne">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-12 lg:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Breadcrumbs
              items={[
                { label: ui("home", locale), href: "/" },
                { label: t(L("Ціни", "Цены", "Prices"), locale), href: "/prices" },
              ]}
              locale={locale}
            />
            <h1 className="heading-1 text-black mt-6">{t(L("Ціни", "Цены", "Prices"), locale)}</h1>
            <p className="body-l text-muted mt-4 max-w-2xl">
              {t(L(
                "Прозорі ціни на всі послуги центру GENEVITY. Точну вартість визначить лікар на безкоштовній консультації.",
                "Прозрачные цены на все услуги центра GENEVITY. Точную стоимость определит врач на бесплатной консультации.",
                "Transparent pricing for all GENEVITY services. Exact cost determined by physician at a free consultation.",
              ), locale)}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16 lg:pb-20">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(L("Пошук послуги...", "Поиск услуги...", "Search service..."), locale)}
            className="w-full pl-12 pr-4 py-3 rounded-[var(--radius-input)] bg-champagne-dark border border-line body-m text-black placeholder:text-muted focus:outline-none focus:border-main transition-colors"
          />
        </motion.div>

        {/* Search results */}
        {search && (
          <AnimatePresence mode="wait">
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-10"
            >
              {filteredItems.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 rounded-[var(--radius-sm)] hover:bg-champagne-dark transition-colors">
                      <div>
                        <span className="body-m text-black">{t(item.name, locale)}</span>
                        <span className="body-s text-muted ml-2">{(item as { category: string }).category}</span>
                      </div>
                      <span className="body-strong text-main">{item.price} ₴</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="body-m text-muted">{t(L("Нічого не знайдено", "Ничего не найдено", "Nothing found"), locale)}</p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Category tabs + price table */}
        {!search && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {priceCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
                    activeCategory === cat.key
                      ? "bg-main text-champagne"
                      : "bg-champagne-dark text-black hover:bg-champagne-darker"
                  }`}
                >
                  {t(cat.label, locale)}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                    <h2 className="heading-3 text-black">{t(activeCat.label, locale)}</h2>
                    <Link href={activeCat.link}>
                      <Button variant="outline" size="sm">
                        {ui("learnMore", locale)}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                  <div className="divide-y divide-line">
                    {activeCat.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-champagne-darker/50 transition-colors">
                        <span className="body-m text-black">{t(item.name, locale)}</span>
                        <span className="body-strong text-main whitespace-nowrap ml-4">{item.price} ₴</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="body-s text-muted mt-4">
                  {t(L(
                    "* Повний прайс на всі послуги доступний за телефоном або на консультації. Ціни можуть змінюватися.",
                    "* Полный прайс на все услуги доступен по телефону или на консультации. Цены могут изменяться.",
                    "* Full price list available by phone or at consultation. Prices are subject to change.",
                  ), locale)}
                </p>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </section>

      {/* CTA */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-20">
        <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{ui("ctaSubtitle", locale)}</p>
          <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{ui("book", locale)}</BookingCTA>
        </div>
      </div>
    </>
  );
}
