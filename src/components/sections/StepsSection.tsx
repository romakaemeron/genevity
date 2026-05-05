"use client";

import { useScrollReveal } from "@/lib/useReveal";
import { ClipboardList, Sparkles, Syringe, HeartPulse, ShieldCheck, Scan } from "lucide-react";

const stepIcons = [ClipboardList, Scan, Syringe, HeartPulse, ShieldCheck, Sparkles];

interface Props { _type: string; _key: string; heading: string; steps: { title: string; description: string }[]; }

export default function StepsSection({ heading, steps }: Props) {
  const { ref, visible } = useScrollReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={visible ? "revealed" : ""}>
      {heading && <h2 className="reveal heading-2 text-black mb-10">{heading}</h2>}
      {steps?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = stepIcons[i % stepIcons.length];
            return (
              <div key={i} className="reveal relative flex flex-col gap-4 p-6 rounded-[var(--radius-card)] bg-champagne-dark" style={{ "--rd": `${i * 0.1}s` } as React.CSSProperties}>
                <span className="heading-1 text-main/10 absolute top-4 right-5 select-none">{String(i + 1).padStart(2, "0")}</span>
                <div className="w-10 h-10 rounded-full bg-champagne-darker flex items-center justify-center">
                  <Icon className="w-5 h-5 text-black-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="body-strong text-black">{step.title}</h3>
                  {step.description && <p className="body-m text-muted">{step.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
