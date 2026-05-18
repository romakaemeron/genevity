"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { setFormStatus, type FormStatus } from "../_actions/forms";

interface Props {
  id: string;
  current: FormStatus;
  stopRowNavigation?: boolean;
}

const STATUSES: { key: FormStatus; label: string; dot: string; bg: string; text: string }[] = [
  { key: "new",       label: "Нова",      dot: "bg-error",   bg: "bg-error-light",   text: "text-error" },
  { key: "processed", label: "Оброблено", dot: "bg-success", bg: "bg-success-light", text: "text-success" },
];

export default function FormStatusDropdown({ id, current, stopRowNavigation }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const active = STATUSES.find((s) => s.key === current) ?? STATUSES[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as FormStatus;
    if (next === current) return;
    startTransition(async () => {
      await setFormStatus(id, next);
      router.refresh();
    });
  };

  return (
    // Wrapper is relative so the invisible <select> can overlay the visual badge
    <div
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] text-[12px] font-medium transition-opacity ${active.bg} ${active.text} ${pending ? "opacity-60" : ""}`}
      onClick={(e) => { if (stopRowNavigation) e.stopPropagation(); }}
    >
      {/* Visual dot */}
      <span
        aria-hidden
        style={{ width: 7, height: 7 }}
        className={`block shrink-0 rounded-full ${active.dot}`}
      />
      {/* Visual label */}
      <span>{active.label}</span>
      {/* Visual chevron */}
      <ChevronDown size={11} className="opacity-60" />

      {/* Invisible native <select> overlaid on top — handles all click/dropdown logic natively */}
      <select
        value={current}
        onChange={handleChange}
        disabled={pending}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onClick={(e) => { if (stopRowNavigation) e.stopPropagation(); }}
        aria-label="Статус заявки"
      >
        {STATUSES.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
