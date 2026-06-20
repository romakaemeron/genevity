"use client";

import { useScrollReveal } from "@/lib/useReveal";
import { Check, AlertTriangle } from "lucide-react";
import { renderInlineMarkdown } from "@/lib/inline-markdown";

interface Props { _type: string; _key: string; heading: string; items: string[]; }

export default function BulletsSection({ heading, items }: Props) {
  const benefits = (items || []).filter((item) => !item.startsWith("⚠"));
  const drawbacks = (items || []).filter((item) => item.startsWith("⚠"));
  const { ref, visible } = useScrollReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={visible ? "revealed" : ""}>
      {heading && <h2 className="reveal heading-2 text-black mb-8">{heading}</h2>}
      {(benefits.length > 0 || drawbacks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((item, i) => (
            <div key={i} className="reveal flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark" style={{ "--rd": `${i * 0.07}s` } as React.CSSProperties}>
              <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-success/15 flex items-center justify-center"><Check className="w-4 h-4 text-success" /></div>
              <p className="body-l text-ink">{renderInlineMarkdown(item)}</p>
            </div>
          ))}
          {drawbacks.map((item, i) => (
            <div key={`d-${i}`} className={`reveal flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-warning/5 border border-warning/20${i === 0 && benefits.length % 2 !== 0 ? " sm:col-start-1" : ""}`} style={{ "--rd": `${(benefits.length + i) * 0.07}s` } as React.CSSProperties}>
              <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-warning/15 flex items-center justify-center"><AlertTriangle className="w-3.5 h-3.5 text-warning" /></div>
              <p className="body-l text-ink">{renderInlineMarkdown(item.replace(/^⚠\s*/, ""))}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
