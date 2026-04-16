import type { SectionCallout } from "@/sanity/types";

const toneStyles: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: "bg-ice-subtle", border: "border-ice", icon: "ℹ" },
  warning: { bg: "bg-warning-light", border: "border-warning", icon: "⚠" },
  success: { bg: "bg-success-light", border: "border-success", icon: "✓" },
};

export default function CalloutSection({ tone, body }: SectionCallout) {
  const style = toneStyles[tone] || toneStyles.info;

  return (
    <section
      className={`${style.bg} border-l-4 ${style.border} rounded-r-[var(--radius-sm)] p-6`}
    >
      <div className="flex gap-3">
        <span className="text-lg shrink-0" aria-hidden>{style.icon}</span>
        <p className="body-l text-ink whitespace-pre-line">{body}</p>
      </div>
    </section>
  );
}
