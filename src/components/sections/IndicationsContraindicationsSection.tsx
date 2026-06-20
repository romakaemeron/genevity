"use client";

import { useScrollReveal } from "@/lib/useReveal";
import { Check, X } from "lucide-react";
import { renderInlineMarkdown } from "@/lib/inline-markdown";

interface Props {
  _type: string; _key: string; title?: string;
  indicationsHeading: string; indications: string[];
  contraindicationsHeading: string; contraindications: string[];
}

export default function IndicationsContraindicationsSection({ title, indicationsHeading, indications, contraindicationsHeading, contraindications }: Props) {
  const { ref, visible } = useScrollReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`flex flex-col gap-6 ${visible ? "revealed" : ""}`}>
      {title && <h2 className="reveal heading-2 text-black">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="reveal d1 rounded-[var(--radius-card)] bg-success/5 border border-success/20 p-7 lg:p-8">
          {indicationsHeading && (
            <div className="flex items-center gap-3 mb-6">
              <h2 className="heading-3 text-black">{indicationsHeading}</h2>
            </div>
          )}
          {indications?.length > 0 && (
            <ul className="flex flex-col gap-3">
              {indications.map((item, i) => (
                <li key={i} className="flex items-start gap-3 body-l text-ink">
                  <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-success/20 border border-success/30 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-success" /></div>
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="reveal d2 rounded-[var(--radius-card)] bg-warning/5 border border-warning/20 p-7 lg:p-8">
          {contraindicationsHeading && (
            <div className="flex items-center gap-3 mb-6">
              <h2 className="heading-3 text-black">{contraindicationsHeading}</h2>
            </div>
          )}
          {contraindications?.length > 0 && (
            <ul className="flex flex-col gap-3">
              {contraindications.map((item, i) => (
                <li key={i} className="flex items-start gap-3 body-l text-ink">
                  <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center"><X className="w-3.5 h-3.5 text-warning" /></div>
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
