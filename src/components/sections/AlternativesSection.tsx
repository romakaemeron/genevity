import type { SectionAlternatives } from "@/lib/db/types";
import { renderInlineMarkdown } from "@/lib/inline-markdown";

/**
 * ТЗ #16 §2.2 — "Порівняння з альтернативами".
 *
 * Answers the question a hesitating patient actually has ("cryolipolysis or
 * EMSCULPT NEO?") in two parts: what is unique about this procedure, and how it
 * compares with each obvious substitute. The comparison renders as a table on
 * wide screens and as stacked cards on phones, because a three-column table
 * forced into 360 px is unreadable.
 *
 * Headings have per-locale fallbacks so an editor only has to fill in the rows.
 */

const FALLBACKS: Record<string, { unique: string; comparison: string; option: string; alternative: string; ours: string }> = {
  uk: {
    unique: "У чому унікальність послуги",
    comparison: "Порівняння з альтернативами",
    option: "Альтернатива",
    alternative: "Що дає альтернатива",
    ours: "Що дає ця послуга",
  },
  ru: {
    unique: "В чём уникальность услуги",
    comparison: "Сравнение с альтернативами",
    option: "Альтернатива",
    alternative: "Что даёт альтернатива",
    ours: "Что даёт эта услуга",
  },
  en: {
    unique: "What makes this procedure different",
    comparison: "Compared with the alternatives",
    option: "Alternative",
    alternative: "What the alternative gives",
    ours: "What this procedure gives",
  },
};

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function AlternativesSection({
  section, locale = "uk",
}: { section: SectionAlternatives; locale?: string }) {
  const t = FALLBACKS[locale === "ua" ? "uk" : locale] ?? FALLBACKS.uk;
  const unique = (section.unique || []).filter(Boolean);
  const rows = (section.alternatives || []).filter((r) => r?.name || r?.theirs || r?.ours);

  if (!unique.length && !rows.length) return null;

  return (
    <section>
      {section.heading && <h2 className="heading-2 text-black mb-4">{section.heading}</h2>}
      {section.intro && (
        <p className="body-l text-black-70 leading-relaxed max-w-[720px] mb-8">
          {renderInlineMarkdown(section.intro)}
        </p>
      )}

      {unique.length > 0 && (
        <div className="rounded-[var(--radius-card)] bg-champagne-dark p-6 lg:p-8 mb-8">
          <h3 className="heading-3 text-black mb-5">{section.uniqueHeading || t.unique}</h3>
          <ul className="flex flex-col gap-3">
            {unique.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-main/15 text-main">
                  <CheckIcon />
                </span>
                <span className="body-m text-black-70 leading-relaxed">{renderInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <h3 className="heading-3 text-black mb-5">{section.comparisonHeading || t.comparison}</h3>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto -mx-4 px-4" style={{ overflowY: "clip", touchAction: "pan-x pan-y" }}>
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left body-strong text-black py-3 pr-4 border-b border-line w-[26%]">{t.option}</th>
                  <th className="text-left body-strong text-black py-3 px-4 border-b border-line">{t.alternative}</th>
                  <th className="text-left body-strong text-main py-3 pl-4 border-b border-line">{t.ours}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="body-strong text-black py-4 pr-4 border-b border-line/50 align-top">
                      {renderInlineMarkdown(row.name)}
                    </td>
                    <td className="body-m text-muted py-4 px-4 border-b border-line/50 align-top">
                      {renderInlineMarkdown(row.theirs)}
                    </td>
                    <td className="body-m text-black py-4 pl-4 border-b border-line/50 align-top bg-main/[0.04]">
                      {renderInlineMarkdown(row.ours)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per alternative */}
          <ul className="md:hidden flex flex-col gap-4">
            {rows.map((row, i) => (
              <li key={i} className="rounded-[var(--radius-card)] border border-line p-5 flex flex-col gap-3">
                {row.name && <p className="body-strong text-black">{renderInlineMarkdown(row.name)}</p>}
                {row.theirs && (
                  <div className="flex flex-col gap-1">
                    <span className="body-s text-black-40">{t.alternative}</span>
                    <p className="body-m text-muted leading-relaxed">{renderInlineMarkdown(row.theirs)}</p>
                  </div>
                )}
                {row.ours && (
                  <div className="flex flex-col gap-1 rounded-xl bg-main/[0.06] p-3">
                    <span className="body-s text-main">{t.ours}</span>
                    <p className="body-m text-black leading-relaxed">{renderInlineMarkdown(row.ours)}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {section.conclusion && (
        <p className="body-m text-black-60 leading-relaxed max-w-[720px] mt-6">
          {renderInlineMarkdown(section.conclusion)}
        </p>
      )}
    </section>
  );
}
