"use client";

/**
 * ТЗ #15 §1 — "Наукові публікації / Наукова діяльність" block on a doctor's
 * profile page.
 *
 * Shows the doctor's scientific output — articles, co-authorships, journal
 * publications, research participation, authored methods and profiles in
 * scientific databases — each with an optional link to the primary source so a
 * visitor can verify the claim independently. Every outbound link carries
 * `rel="nofollow noopener noreferrer"` and `target="_blank"`, as the spec asks.
 *
 * Links are sanitized upstream in `resolvePublications` (http/https only); an
 * entry without a usable URL still renders, just without the anchor.
 */

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { PublicationKind, PublicationView } from "@/lib/db/queries/doctors";
import { useScrollReveal } from "@/lib/useReveal";

const COPY = {
  ua: {
    title: "Наукова діяльність",
    subtitle:
      "Публікації, дослідження та авторські методики — з посиланнями на першоджерела, щоб кожен факт можна було перевірити самостійно.",
    verify: "Першоджерело",
    more: "Показати ще",
    count: (shown: number, total: number) => `Показано ${shown} з ${total}`,
  },
  ru: {
    title: "Научная деятельность",
    subtitle:
      "Публикации, исследования и авторские методики — со ссылками на первоисточники, чтобы каждый факт можно было проверить самостоятельно.",
    verify: "Первоисточник",
    more: "Показать ещё",
    count: (shown: number, total: number) => `Показано ${shown} из ${total}`,
  },
  en: {
    title: "Research & publications",
    subtitle:
      "Papers, studies and authored protocols — each linked to its primary source so every claim can be verified independently.",
    verify: "Primary source",
    more: "Show more",
    count: (shown: number, total: number) => `Showing ${shown} of ${total}`,
  },
} as const;

const KIND_LABELS: Record<string, Record<PublicationKind, string>> = {
  ua: {
    article: "Наукова стаття",
    coauthor: "Співавторство",
    journal: "Публікація в журналі",
    research: "Наукове дослідження",
    method: "Авторська методика",
    profile: "Науковий профіль",
  },
  ru: {
    article: "Научная статья",
    coauthor: "Соавторство",
    journal: "Публикация в журнале",
    research: "Научное исследование",
    method: "Авторская методика",
    profile: "Научный профиль",
  },
  en: {
    article: "Research paper",
    coauthor: "Co-authorship",
    journal: "Journal publication",
    research: "Clinical research",
    method: "Authored protocol",
    profile: "Research profile",
  },
};

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h7M9 11h7" />
    </svg>
  );
}

interface Props {
  publications: PublicationView[];
  locale: string;
  /** Doctor's name — used only for the link's accessible description. */
  doctorName: string;
}

const INITIAL = 6;
const STEP = 10;

export default function DoctorPublications({ publications, locale, doctorName }: Props) {
  const t = COPY[locale as keyof typeof COPY] ?? COPY.ua;
  const kinds = KIND_LABELS[locale] ?? KIND_LABELS.ua;
  const { ref, visible } = useScrollReveal();
  const [limit, setLimit] = useState(INITIAL);

  if (!publications.length) return null;

  // A chip repeated on every row is noise: label only the entries that differ
  // from the list's dominant kind (e.g. one authored method among co-authorships).
  const tally = new Map<PublicationKind, number>();
  for (const p of publications) tally.set(p.kind, (tally.get(p.kind) ?? 0) + 1);
  const dominant = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const mixed = tally.size > 1;

  const shown = publications.slice(0, limit);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="publications"
      className={`bg-champagne py-12 lg:py-16 scroll-mt-28 ${visible ? "revealed" : ""}`}
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="reveal flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-main/10 text-main flex items-center justify-center shrink-0">
            <BookIcon />
          </div>
          <h2 className="heading-2 text-black">{t.title}</h2>
        </div>
        <p className="reveal d1 body-m text-black-60 max-w-[680px] mb-6">{t.subtitle}</p>

        <ol className="reveal d2 divide-y divide-champagne-darker border-y border-champagne-darker">
          {shown.map((p, i) => {
            const meta = [p.source, p.year].filter(Boolean).join(" · ");
            return (
              <li key={i} className="flex gap-3 sm:gap-4 py-3.5">
                <span className="body-s text-black-50 tabular-nums w-6 shrink-0 text-right pt-px">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="body-s text-black leading-snug">
                    {mixed && p.kind !== dominant && (
                      <span className="mr-2 align-middle text-[11px] px-2 py-0.5 rounded-full bg-champagne-dark border border-champagne-darker text-black-50 whitespace-nowrap">
                        {kinds[p.kind]}
                      </span>
                    )}
                    {p.title}
                  </p>
                  {meta && <p className="body-s text-black-50 mt-1">{meta}</p>}
                </div>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`${t.verify}: ${p.title} — ${doctorName}`}
                    className="group inline-flex items-center gap-1.5 self-start shrink-0 body-s font-medium text-main hover:text-main-dark transition-colors"
                  >
                    <span className="hidden sm:inline">{t.verify}</span>
                    <ExternalLink size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
              </li>
            );
          })}
        </ol>

        {publications.length > INITIAL && (
          <div className="mt-5 flex items-center gap-4">
            {limit < publications.length && (
              <button
                type="button"
                onClick={() => setLimit((n) => Math.min(n + STEP, publications.length))}
                className="body-s font-medium text-main hover:text-main-dark transition-colors border border-main/30 hover:border-main rounded-xl px-5 py-2.5"
              >
                {t.more}
              </button>
            )}
            <span className="body-s text-black-50">{t.count(shown.length, publications.length)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
