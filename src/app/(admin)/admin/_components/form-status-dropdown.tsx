"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setFormStatus, type FormStatus } from "../_actions/forms";

interface Props {
  id: string;
  current: FormStatus;
  stopRowNavigation?: boolean;
}

const STATUSES: { key: FormStatus; label: string; dot: string; bg: string; text: string; border: string }[] = [
  { key: "new",       label: "Нова",      dot: "bg-error",   bg: "bg-error-light",   text: "text-error",   border: "border-error/30" },
  { key: "processed", label: "Оброблено", dot: "bg-success", bg: "bg-success-light", text: "text-success", border: "border-success/30" },
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
    <div
      className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-[var(--radius-pill)] text-[12px] font-medium border ${active.bg} ${active.text} ${active.border} ${pending ? "opacity-60" : ""}`}
      onClick={(e) => { if (stopRowNavigation) e.stopPropagation(); }}
    >
      <span
        aria-hidden
        style={{ width: 7, height: 7 }}
        className={`block shrink-0 rounded-full ${active.dot}`}
      />
      <select
        value={current}
        onChange={handleChange}
        disabled={pending}
        className="appearance-none bg-transparent font-medium cursor-pointer outline-none pr-0.5"
        onClick={(e) => { if (stopRowNavigation) e.stopPropagation(); }}
      >
        {STATUSES.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
