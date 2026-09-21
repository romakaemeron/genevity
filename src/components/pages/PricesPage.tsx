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

  // Hydrate from the URL so a shared /prices?c=…&s=…&q=… link lands
  // correctly.
  //
  // /prices is statically generated (SSG), so the HTML the server ships is
  // always the no-query-string tree: empty search box, "All" active, every
  // accordion closed. If these were lazy useState initializers reading
  // window.location.search, the client's FIRST render (which already has
  // access to the real URL) would differ from that server tree — with
  // ?q=… the whole category list is replaced by search results — and React
  // would report a hydration mismatch and discard/rebuild the subtree.
  //
  // So state starts at the same defaults the server rendered, and is
  // corrected to match the URL in an effect that runs once after mount —
  // after hydration has already reconciled against the matching default
  // tree. This is exactly the case react-hooks/set-state-in-effect exists to
  // flag (a setState that isn't a response to a user action or a prop
  // change), but here it's restoring state the server could not have known,
  // not an avoidable extra render, so it's suppressed at the one call site
  // below rather than worked around by reintroducing the hydration bug.
  //
  // ALL_SLUG is not a real category slug, so it needs its own branch in the
  // validity check below or a shared ?c=all link would be silently rejected.
  const [search, setSearch] = useState<string>("");
  // Default view is "All categories" so a first-time visitor sees the whole
  // catalogue rather than one arbitrary slice of it.
  const [activeSlug, setActiveSlug] = useState<string>(ALL_SLUG);
  // The All view starts with every accordion collapsed — 52 subcategories
  // open at once would bury the page. Subcategory slugs are only unique per
  // category (DB constraint UNIQUE(category_id, slug)), so entries are
  // keyed on the composite `${categorySlug}/${subSlug}`, not the bare sub
  // slug — see toggleSub, which is the only writer of `?s=` and always
  // writes that same composite form, so the URL this page produces is
  // always one this page can also read back.
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Restoring state from the URL on mount, once, so the server-rendered
    // (SSG, query-less) tree and the client's first render match; see the
    // comment above the state declarations for why this can't be a lazy
    // useState initializer instead.
    const q = params.get("q");
    if (q) setSearch(q); // eslint-disable-line react-hooks/set-state-in-effect -- see comment above

    const c = params.get("c");
    const validC = c && (c === ALL_SLUG || categories.some((cat) => cat.slug === c)) ? c : null;
    if (validC) setActiveSlug(validC);

    // `s` is written by toggleSub as the composite `${categorySlug}/${subSlug}`
    // — the same key format `openSubs` uses internally — independent of
    // `c`, because subcategory accordions render (and can be toggled) in the
    // "All" view too, not only once a single category is selected. A bare
    // slug with no slash is a legacy link from before this fix (or a
    // hand-typed URL); it's only resolvable against `c` when present, and
    // otherwise left closed rather than thrown on.
    const s = params.get("s");
    if (s) {
      const slashIndex = s.indexOf("/");
      let key: string | null = null;
      if (slashIndex > -1) {
        const catSlug = s.slice(0, slashIndex);
        const subSlug = s.slice(slashIndex + 1);
        const cat = categories.find((cat) => cat.slug === catSlug);
        if (cat?.subcategories.some((sub) => sub.slug === subSlug)) key = s;
      } else if (validC && validC !== ALL_SLUG) {
        const cat = categories.find((cat) => cat.slug === validC);
        if (cat?.subcategories.some((sub) => sub.slug === s)) key = `${validC}/${s}`;
      }
      if (key) setOpenSubs(new Set([key]));
    }
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
    setOpenSubs((prev) => {
      // Prune entries belonging to other categories — composite keys avoid
      // slug collisions across categories, but stale entries from a
      // previously visited category would otherwise linger in the Set and
      // silently reopen if the user returns to it later.
      const next = new Set<string>();
      for (const key of prev) {
        if (key.startsWith(`${slug}/`)) next.add(key);
      }
      if (first) next.add(`${slug}/${first.slug}`);
      return next;
    });
    syncUrl({ c: slug, s: undefined });
  };

  const toggleSub = (categorySlug: string, subSlug: string) => {
    const key = `${categorySlug}/${subSlug}`;
    setOpenSubs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    // Write the same composite `${categorySlug}/${subSlug}` form the effect
    // above reads back — a bare subcategory slug is ambiguous without `c`
    // (subcategory slugs are only unique per category) and, since
    // subcategories render in the "All" view too, `c` isn't reliably in the
    // URL to disambiguate against.
    syncUrl({ s: key });
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
      // Spec: search matches name, subcategory and category — so a hit on
      // the category label surfaces every item filed under it too.
      const catHit = cat.label.toLowerCase().includes(q);
      for (const item of cat.items) {
        if (catHit || item.name.toLowerCase().includes(q)) {
          out.push({ item, categoryLabel: cat.label, subLabel: null });
        }
      }
      for (const sub of cat.subcategories) {
        const subHit = catHit || sub.label.toLowerCase().includes(q);
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
                      categorySlug={cat.slug}
                      sub={sub}
                      open={openSubs.has(`${cat.slug}/${sub.slug}`)}
                      countLabel={tPage("servicesCount")}
                      onToggle={() => toggleSub(cat.slug, sub.slug)}
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
