"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollReveal } from "@/lib/useReveal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import MediaCard from "@/components/media/MediaCard";
import type { MediaMentionPublic } from "@/lib/db/queries/media";

const COPY = {
  ua: { title: "ЗМІ про нас",
    subtitle: "Публікації, інтерв'ю та згадки про центр GENEVITY та наших експертів у зовнішніх джерелах.",
    cta: "Всі публікації", read: "Читати" },
  ru: { title: "СМИ о нас",
    subtitle: "Публикации, интервью и упоминания о центре GENEVITY и наших экспертах во внешних источниках.",
    cta: "Все публикации", read: "Читать" },
  en: { title: "Media Coverage",
    subtitle: "Publications, interviews and mentions of the GENEVITY center and our experts in external sources.",
    cta: "All publications", read: "Read" },
} as const;

export default function MediaCoverage({
  mentions, locale,
}: { mentions: MediaMentionPublic[]; locale: string }) {
  const t = COPY[(locale as keyof typeof COPY)] ?? COPY.ua;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);
  const { ref: headerRef, visible } = useScrollReveal();

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    setHasOverflow(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    if (!cards.length) return;
    const scrollPad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const currentScroll = el.scrollLeft;
    let currentIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const dist = Math.abs(cards[i].offsetLeft - scrollPad - currentScroll);
      if (dist < minDist) { minDist = dist; currentIdx = i; }
    }
    const nextIdx = Math.max(0, Math.min(cards.length - 1, currentIdx + (dir === "left" ? -1 : 1)));
    el.scrollTo({ left: cards[nextIdx].offsetLeft - scrollPad, behavior: "smooth" });
  };

  if (mentions.length === 0) return null;

  return (
    <section>
      <div
        ref={headerRef as React.RefObject<HTMLDivElement>}
        className={`max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex flex-col gap-2 mb-10 ${visible ? "revealed" : ""}`}
      >
        <h2 className="reveal heading-2 text-black">{t.title}</h2>
        <div className="reveal d1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <p className="body-l text-black-60 max-w-[600px]">{t.subtitle}</p>
          <div className={`flex gap-2 shrink-0 ${hasOverflow ? "" : "hidden"}`}>
            <Button variant="secondary" icon size="sm" onClick={() => scroll("left")} disabled={!canScrollLeft}><ChevronLeft size={18} /></Button>
            <Button variant="secondary" icon size="sm" onClick={() => scroll("right")} disabled={!canScrollRight}><ChevronRight size={18} /></Button>
          </div>
        </div>
      </div>

      <div ref={scrollerRef} className="doctors-scroller scrollbar-hide">
        {mentions.map((m) => (
          <div key={m.id} className="shrink-0" style={{ width: "min(360px, 82vw)", scrollSnapAlign: "start" }}>
            <MediaCard mention={m} locale={locale} readLabel={t.read} />
          </div>
        ))}
      </div>

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] mt-6">
        <Link href="/media">
          <Button variant="outline" size="sm">
            {t.cta}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
