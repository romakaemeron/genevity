import { Clock, Sparkles, Repeat, Banknote } from "lucide-react";
import { ui } from "@/lib/ui-strings";

interface Props {
  procedureLength?: string | null;
  effectDuration?: string | null;
  sessionsRecommended?: string | null;
  priceFrom?: string | null;
  priceUnit?: string | null;
  locale?: string;
}

const facts = [
  { key: "procedureLength", icon: Clock, labelKey: "duration" },
  { key: "effectDuration", icon: Sparkles, labelKey: "effect" },
  { key: "priceFrom", icon: Banknote, labelKey: "price" },
] as const;

export default function KeyFactsBar(props: Props) {
  const locale = props.locale || "ua";
  const items = facts
    .map((f) => ({
      ...f,
      value: props[f.key],
    }))
    .filter((f) => f.value);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-6 lg:gap-10 py-6 border-y border-line">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="body-s text-muted">{ui(item.labelKey, locale)}</p>
            <p className="body-strong text-black">
              {item.value}
              {item.key === "priceFrom" && props.priceUnit && (
                <span className="body-m text-muted ml-1">{props.priceUnit}</span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
