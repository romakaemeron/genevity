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

import { ExternalLink } from "lucide-react";
import type { PublicationKind, PublicationView } from "@/lib/db/queries/doctors";
import { useScrollReveal } from "@/lib/useReveal";

const COPY = {
  ua: {
    title: "Наукова діяльність",
    subtitle:
      "Публікації, дослідження та авторські методики — з посиланнями на першоджерела, щоб кожен факт можна було перевірити самостійно.",
    verify: "Першоджерело",
  },
  ru: {
    title: "Научная деятельность",
    subtitle:
      "Публикации, исследования и авторские методики — со ссылками на первоисточники, чтобы каждый факт можно было проверить самостоятельно.",
    verify: "Первоисточник",
  },
  en: {
    title: "Research & publications",
    subtitle:
      "Papers, studies and authored protocols — each linked to its primary source so every claim can be verified independently.",
    verify: "Primary source",
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

export default function DoctorPublications({ publications, locale, doctorName }: Props) {
  const t = COPY[locale as keyof typeof COPY] ?? COPY.ua;
  const kinds = KIND_LABELS[locale] ?? KIND_LABELS.ua;
  const { ref, visible } = useScrollReveal();

  if (!publications.length) return null;

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
        <p className="reveal d1 body-m text-black-60 max-w-[680px] mb-8">{t.subtitle}</p>

        <ol className="reveal d2 flex flex-col gap-3">
          {publications.map((p, i) => {
            const meta = [p.source, p.year].filter(Boolean).join(" · ");
            return (
              <li
                key={i}
                className="bg-champagne-dark rounded-2xl p-5 flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <span className="self-start text-[11px] px-2 py-0.5 rounded-full bg-champagne border border-champagne-darker text-black-50">
                    {kinds[p.kind]}
                  </span>
                  <p className="body-strong text-black leading-snug">{p.title}</p>
                  {meta && <p className="body-s text-black-50">{meta}</p>}
                </div>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`${t.verify}: ${p.title} — ${doctorName}`}
                    className="group inline-flex items-center gap-1.5 self-start shrink-0 body-s font-medium text-main hover:text-main-dark transition-colors"
                  >
                    {t.verify}
                    <ExternalLink size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
