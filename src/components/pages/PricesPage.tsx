"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { PriceCategory } from "@/lib/db/queries/phase2";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";

interface Props {
  locale: Locale;
  categories: PriceCategory[];
}

export default function PricesPageComponent({ locale, categories }: Props) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug || "");
  const [search, setSearch] = useState("");
  const tLabels = useTranslations("labels");
  const tPage = useTranslations("pricesPage");

  const activeCat = categories.find((c) => c.slug === activeSlug) || categories[0];

  const filteredItems = search
    ? categories.flatMap((cat) =>
        cat.items
          .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
          .map((item) => ({ ...item, category: cat.label }))
      )
    : [];

  return (
    <>
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-12 lg:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Breadcrumbs
              items={[
                { label: tLabels("home"), href: "/" },
                { label: tPage("heroTitle"), href: "/prices" },
              ]}
              locale={locale}
            />
            <h1 className="heading-1 text-black mt-6">{tPage("heroTitle")}</h1>
            <p className="body-l text-muted mt-4 max-w-2xl">{tPage("heroSubtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-20">
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
            placeholder={tPage("searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-champagne-dark border border-line body-m text-black placeholder:text-muted focus:outline-none focus:border-main transition-colors appearance-none"
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
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 px-4 rounded-[var(--radius-sm)] hover:bg-champagne-dark transition-colors">
                      <div>
                        <span className="body-m text-black">{item.name}</span>
                        <span className="body-s text-muted ml-2">{item.category}</span>
                      </div>
                      <span className="body-strong text-main">{item.price} {item.currency}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="body-m text-muted">{tPage("noResults")}</p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Category tabs + price table */}
        {!search && activeCat && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
                    activeSlug === cat.slug
                      ? "bg-main text-champagne"
                      : "bg-champagne-dark text-black hover:bg-champagne-darker"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                    <h2 className="heading-3 text-black">{activeCat.label}</h2>
                    {activeCat.link && (
                      <Link href={activeCat.link}>
                        <Button variant="outline" size="sm">
                          {tLabels("learnMore")}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="divide-y divide-line">
                    {activeCat.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-champagne-darker/50 transition-colors">
                        <span className="body-m text-black">{item.name}</span>
                        <span className="body-strong text-main whitespace-nowrap ml-4">{item.price} {item.currency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="body-s text-muted mt-4">{tPage("noteText")}</p>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </section>

      {/* CTA */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
          <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{tLabels("book")}</BookingCTA>
        </div>
      </div>
    </>
  );
}
