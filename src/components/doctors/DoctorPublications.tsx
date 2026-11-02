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
import Button from "@/components/ui/Button";
import type { PublicationKind, PublicationView } from "@/lib/db/queries/doctors";
import { useScrollReveal } from "@/lib/useReveal";

const COPY = {
  ua: {
    title: "Наукова діяльність",
    subtitle:
      "Публікації, дослідження та авторські методики — з посиланнями на першоджерела, щоб кожен факт можна було перевірити самостійно.",
    verify: "Першоджерело",
    more: "Показати ще",
    less: "Згорнути",
    count: (shown: number, total: number) => `Показано ${shown} з ${total}`,
  },
  ru: {
    title: "Научная деятельность",
    subtitle:
      "Публикации, исследования и авторские методики — со ссылками на первоисточники, чтобы каждый факт можно было проверить самостоятельно.",
    verify: "Первоисточник",
    more: "Показать ещё",
    less: "Свернуть",
    count: (shown: number, total: number) => `Показано ${shown} из ${total}`,
  },
  en: {
    title: "Research & publications",
    subtitle:
      "Papers, studies and authored protocols — each linked to its primary source so every claim can be verified independently.",
    verify: "Primary source",
    more: "Show more",
    less: "Show less",
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
        <h2 className="reveal heading-2 text-black mb-3">{t.title}</h2>
        <p className="reveal d1 body-m text-black-60 max-w-[680px] mb-6">{t.subtitle}</p>

        <ol className="reveal d2 divide-y divide-champagne-darker border-y border-champagne-darker">
          {shown.map((p, i) => {
            const meta = [p.source, p.year].filter(Boolean).join(" · ");
            return (
              <li key={i} className="flex gap-3 sm:gap-4 py-4">
                <span className="text-base text-black-60 tabular-nums w-7 shrink-0 text-right">{i + 1}.</span>
                <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <p className="text-base text-black leading-relaxed">
                      {mixed && p.kind !== dominant && (
                        <span className="mr-2 align-middle text-xs px-2.5 py-0.5 rounded-full bg-champagne-dark border border-champagne-darker text-black-60 whitespace-nowrap">
                          {kinds[p.kind]}
                        </span>
                      )}
                      {p.title}
                    </p>
                    {meta && <p className="text-[13px] leading-snug text-black-60 mt-1.5">{meta}</p>}
                  </div>
                  {p.url && (
                    <Button
                      href={p.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      ariaLabel={`${t.verify}: ${p.title} — ${doctorName}`}
                      variant="outline"
                      size="sm"
                      className="self-start shrink-0"
                    >
                      {t.verify}
                      <ExternalLink size={14} />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {publications.length > INITIAL && (
          <div className="mt-5 flex items-center gap-4">
            {limit < publications.length && (
              <Button variant="outline" onClick={() => setLimit((n) => Math.min(n + STEP, publications.length))}>
                {t.more}
              </Button>
            )}
            {limit > INITIAL && (
              <Button
                variant="ghost"
                onClick={() => {
                  setLimit(INITIAL);
                  // Collapsing shifts the page up; keep the reader at the block's top.
                  document.getElementById("publications")?.scrollIntoView({ block: "start" });
                }}
              >
                {t.less}
              </Button>
            )}
            <span className="body-m text-black-60">{t.count(shown.length, publications.length)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
