"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Search, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { PriceCategory, PriceItemView } from "@/lib/db/queries/phase2";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import CategoryPills, { ALL_SLUG } from "./prices/CategoryPills";
import SubcategorySection from "./prices/SubcategorySection";
import PriceRow from "./prices/PriceRow";

const DOWNLOAD_LABEL: Record<string, string> = {
  uk: "Завантажити прайс-лист",
  ru: "Скачать прайс-лист",
  en: "Download Pricelist",
};

interface Props {
  locale: Locale;
  categories: PriceCategory[];
  pricelistPdf?: string | null;
}

export default function PricesPageComponent({ locale, categories, pricelistPdf }: Props) {
  const tLabels = useTranslations("labels");
  const tPage = useTranslations("pricesPage");

  const [search, setSearch] = useState("");
  // Default view is "All categories" so a first-time visitor sees the whole
  // catalogue rather than one arbitrary slice of it.
  const [activeSlug, setActiveSlug] = useState<string>(ALL_SLUG);
  // The All view starts with every accordion collapsed — 52 subcategories
  // open at once would bury the page — so the initial Set is empty rather
  // than seeded with the first category's first subcategory.
  const [openSubs, setOpenSubs] = useState<Set<string>>(() => new Set());

  // Hydrate from the URL so a shared /prices?c=…&s=…&q=… link lands correctly.
  // ALL_SLUG is not a real category slug, so it needs its own branch in the
  // validity check below or a shared ?c=all link would be silently rejected.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get("c"); const s = p.get("s"); const q = p.get("q");
    if (c && (c === ALL_SLUG || categories.some((cat) => cat.slug === c))) setActiveSlug(c);
    if (s) setOpenSubs((prev) => new Set(prev).add(s));
    if (q) setSearch(q);
  }, [categories]);

  const syncUrl = (next: { c?: string; s?: string; q?: string }) => {
    const p = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    if (slug === ALL_SLUG) {
      // Start the All view fresh — every subcategory collapsed, not
      // inheriting whatever was open in the previously selected category.
      setOpenSubs(new Set());
      syncUrl({ c: slug, s: undefined });
      return;
    }
    const first = categories.find((c) => c.slug === slug)?.subcategories[0];
    if (first) setOpenSubs((prev) => new Set(prev).add(first.slug));
    syncUrl({ c: slug, s: undefined });
  };

  const toggleSub = (slug: string) => {
    setOpenSubs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
    syncUrl({ s: slug });
  };

  // useDeferredValue keeps the input responsive while the 575-row filter
  // renders at a lower priority — React's own answer to this, and better than
  // a hand-rolled setTimeout debounce because it yields to typing rather than
  // guessing a delay. The URL sync stays on a timer: it is a side effect, not
  // a render.
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const t = setTimeout(() => syncUrl({ q: search }), 300);
    return () => clearTimeout(t);
  }, [search]);

  const results = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return [];
    const out: { item: PriceItemView; categoryLabel: string; subLabel: string | null }[] = [];
    for (const cat of categories) {
      for (const item of cat.items) {
        if (item.name.toLowerCase().includes(q)) {
          out.push({ item, categoryLabel: cat.label, subLabel: null });
        }
      }
      for (const sub of cat.subcategories) {
        const subHit = sub.label.toLowerCase().includes(q);
        for (const item of sub.items) {
          if (subHit || item.name.toLowerCase().includes(q)) {
            out.push({ item, categoryLabel: cat.label, subLabel: sub.label });
          }
        }
      }
    }
    return out;
  }, [deferredSearch, categories]);

  return (
    <>
      {/* Hero — above fold, no animation */}
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-12 lg:pb-16">
          <Breadcrumbs
            items={[
              { label: tLabels("home"), href: "/" },
              { label: tPage("heroTitle"), href: "/prices" },
            ]}
            locale={locale}
          />
          <h1 className="heading-1 text-black mt-6">{tPage("heroTitle")}</h1>
          <p className="body-l text-muted mt-4 max-w-2xl">{tPage("heroSubtitle")}</p>
          {pricelistPdf && (
            <a href="/api/download-pricelist" className="mt-6 inline-block">
              <Button variant="primary" size="sm">
                <Download size={16} />
                {DOWNLOAD_LABEL[locale] ?? DOWNLOAD_LABEL.uk}
              </Button>
            </a>
          )}
        </div>
      </section>

      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-20">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tPage("searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-champagne-dark border border-line body-m text-black placeholder:text-muted focus:outline-none focus:border-main transition-colors appearance-none"
          />
        </div>

        {search ? (
          <div>
            <p role="status" aria-live="polite" className="body-s text-muted mb-4">
              {tPage("resultsCount")}: {results.length}
            </p>
            {results.length > 0 ? (
              <div className="bg-champagne-dark rounded-[var(--radius-card)] divide-y divide-line">
                {results.map((r) => (
                  <div key={r.item.id} className="px-4 sm:px-6 py-3.5">
                    <p className="body-s text-muted mb-0.5">
                      {r.categoryLabel}{r.subLabel ? ` › ${r.subLabel}` : ""}
                    </p>
                    <div className="flex items-start justify-between gap-4">
                      <span className="body-m text-black">{r.item.name}</span>
                      <span className="body-strong text-main whitespace-nowrap">
                        {r.item.price} {r.item.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="body-m text-muted">{tPage("noResults")}</p>
            )}
          </div>
        ) : (
          <>
            <CategoryPills
              categories={categories}
              activeSlug={activeSlug}
              onSelect={selectCategory}
              allLabel={tPage("allCategories")}
            />

            {/* Every category stays mounted and is hidden with CSS so all 551
                prices are present in the HTML for indexing. Do not switch this
                to conditional rendering. When the All pill is active, nothing
                is hidden — every category renders. */}
            {categories.map((cat) => (
              <div
                key={cat.slug}
                id={cat.slug}
                hidden={activeSlug !== ALL_SLUG && cat.slug !== activeSlug}
                className="mt-6 scroll-mt-28"
              >
                <div className="bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line">
                    <h2 className="heading-3 text-black">{cat.label}</h2>
                    {cat.link && (
                      <Link href={cat.link}>
                        <Button variant="outline" size="sm">
                          {tLabels("learnMore")}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  {cat.items.length > 0 ? (
                    <div className="divide-y divide-line">
                      {cat.items.map((item) => <PriceRow key={item.id} item={item} />)}
                    </div>
                  ) : null}

                  {cat.subcategories.map((sub) => (
                    <SubcategorySection
                      key={sub.id}
                      sub={sub}
                      open={openSubs.has(sub.slug)}
                      countLabel={tPage("servicesCount")}
                      onToggle={() => toggleSub(sub.slug)}
                    />
                  ))}
                </div>
                <p className="body-s text-muted mt-4">{tPage("noteText")}</p>
              </div>
            ))}
          </>
        )}
      </section>

      {/* CTA */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <div className="bg-main rounded-[var(--radius-card)] px-4 py-6 sm:p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
          <BookingCTA ctaKey="pricesFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark max-w-full !whitespace-normal">{tLabels("book")}</BookingCTA>
        </div>
      </div>
    </>
  );
}
