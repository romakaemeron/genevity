"use client";

/**
 * ТЗ #15 §3 — average rating + review count rendered directly under the
 * doctor's name on their profile page, as a link straight to the "Відгуки"
 * block further down the same page.
 *
 * Rendered only when the doctor actually has published reviews — an empty
 * "0.0 ★ / 0 reviews" badge would hurt trust rather than build it.
 */

import { useCallback } from "react";

const COPY = {
  ua: { aria: "Перейти до відгуків пацієнтів", one: "відгук", few: "відгуки", many: "відгуків" },
  ru: { aria: "Перейти к отзывам пациентов", one: "отзыв", few: "отзыва", many: "отзывов" },
  en: { aria: "Jump to patient reviews", one: "review", few: "reviews", many: "reviews" },
} as const;

/** Slavic plural rule (uk/ru); English collapses to one/many. */
function plural(n: number, forms: { one: string; few: string; many: string }): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms.one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few;
  return forms.many;
}

function Star() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

interface Props {
  /** Mean of every published review's rating, 1–5. */
  rating: number;
  count: number;
  locale: string;
  /** Element id of the reviews section on the same page. */
  targetId?: string;
}

export default function DoctorRatingLink({ rating, count, locale, targetId = "reviews" }: Props) {
  const t = COPY[locale as keyof typeof COPY] ?? COPY.ua;

  // Smooth-scroll in place of the browser's instant jump; the href keeps the
  // control a real link (middle-click, copy-link, keyboard, no-JS all work).
  //
  // The reviews block is a lazily-imported client component, so on a fast
  // click it may not be in the DOM yet — a plain lookup would silently do
  // nothing. Poll briefly for it instead of giving up on the first miss.
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const deadline = Date.now() + 2000;
      const tryScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", `#${targetId}`);
          return;
        }
        if (Date.now() < deadline) setTimeout(tryScroll, 100);
      };
      tryScroll();
    },
    [targetId],
  );

  if (count < 1) return null;

  const formatted = rating.toFixed(1).replace(".", locale === "en" ? "." : ",");

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      aria-label={`${t.aria} — ${formatted} / 5, ${count} ${plural(count, t)}`}
      className="group mt-3 inline-flex items-center gap-2 self-start rounded-full border border-champagne-darker bg-champagne-dark px-3 py-1.5 transition-colors hover:border-main/40 hover:bg-main/5"
    >
      <span className="flex items-center gap-1 text-main">
        <Star />
        <span className="body-strong text-black leading-none">{formatted}</span>
      </span>
      <span aria-hidden className="h-3 w-px bg-black/10" />
      <span className="body-s text-black-60 underline decoration-black/15 decoration-dotted underline-offset-2 transition-colors group-hover:text-main group-hover:decoration-main/40">
        {count}&nbsp;{plural(count, t)}
      </span>
    </a>
  );
}
