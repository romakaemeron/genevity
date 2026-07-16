"use client";

import { useScrollReveal } from "@/lib/useReveal";
import { renderInlineMarkdown } from "@/lib/inline-markdown";
import type { SectionPriceTable } from "@/lib/db/types";

/**
 * Compact price list rendered as a table, matching the /prices page rows:
 * procedure name on the left, price in brand colour on the right, thin
 * dividers. Deliberately short — no big cards — so it reads as a price table.
 */
export default function PriceTableSection({ heading, rows, note }: SectionPriceTable) {
  const { ref, visible } = useScrollReveal();
  const list = (rows || []).filter((r) => r && (r.label || r.price));
  if (!list.length) return null;

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={visible ? "revealed" : ""}>
      {heading && <h2 className="reveal heading-2 text-black mb-6">{heading}</h2>}
      <div className="reveal rounded-[var(--radius-card)] border border-line overflow-hidden">
        {list.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-line/60 last:border-b-0 hover:bg-champagne-dark transition-colors"
          >
            <span className="body-m text-ink">{renderInlineMarkdown(r.label)}</span>
            {r.price && (
              <span className="body-strong text-main whitespace-nowrap">{r.price}</span>
            )}
          </div>
        ))}
      </div>
      {note && <p className="reveal body-s text-muted mt-3">{note}</p>}
    </section>
  );
}
