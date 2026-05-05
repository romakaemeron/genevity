"use client";

import { useScrollReveal } from "@/lib/useReveal";

interface Props { _type: string; _key: string; heading: string; body: string; calloutBody?: string; heroImage?: string; index?: number; }

export default function RichTextSection({ heading, body, calloutBody }: Props) {
  const { ref, visible } = useScrollReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`reveal rounded-[var(--radius-card)] p-8 lg:p-12 bg-champagne-dark ${visible ? "revealed" : ""}`}>
      <div className="max-w-3xl">
        {heading && (
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 rounded-full bg-main hidden lg:block" />
            <h2 className="heading-2 text-black">{heading}</h2>
          </div>
        )}
        {body && <p className="body-l text-muted leading-relaxed whitespace-pre-line rich-text-body">{body}</p>}
        {calloutBody && (
          <div className="mt-6 bg-champagne rounded-[var(--radius-card)] p-6">
            <p className="body-m text-black-60 leading-relaxed whitespace-pre-line">{calloutBody}</p>
          </div>
        )}
      </div>
    </section>
  );
}
